"use client";

import { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  type User as FirebaseAuthUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { refreshToken } from "@/lib/library";
import { useRouter } from "next/navigation";
import { getCsrfToken } from "@/lib/library";
import { trpc } from "@/lib/trpc/client";
import { useQueryClient } from "@tanstack/react-query";

type UseAuthOptions = {
  fetchUser?: boolean;
  fetchSkills?: boolean;
  fetchSocialLinks?: boolean;
  fetchEducation?: boolean;
  fetchExperience?: boolean;
  routerActivation?: boolean;
};

export default function useAuth({
  fetchUser = false,
  fetchSkills = false,
  fetchSocialLinks = false,
  fetchEducation = false,
  fetchExperience = false,
  routerActivation = true,
}: UseAuthOptions = {}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  // Use tRPC for auth status checking
  const authStatus = trpc.auth.checkStatus.useQuery(undefined, {
    enabled: isAuthenticated, // Relies on Firebase auth state
    refetchInterval: 60000 * 15, // Refetch every 15 minutes (token expires in less than 15 mins)
    retry: false, // Do not retry on failure
    refetchOnWindowFocus: false, // Do not refetch on window focus
  });

  // tRPC for fetching user info
  const userInfo = trpc.user.fetchMyInformation.useQuery(
    {
      skills: fetchSkills,
      socialLinks: fetchSocialLinks,
      education: fetchEducation,
      experience: fetchExperience,
      personalDetails: fetchUser,
    },
    {
      enabled: !authStatus.isLoading && authStatus.isEnabled, // Fetch only if auth status is known and user is enabled
    }
  );

  const queryClient = useQueryClient();

  // Handle auth status errors (token expiring or expired)
  useEffect(() => {
    if (!authStatus.error || !isAuthenticated) return;

    const interval = setInterval(async () => {
      if (!(await refreshToken()) && routerActivation) {
        await auth.signOut();
      } else {
        await authStatus.refetch();
      }
    }, 50 * 60 * 1000); // 50 minutes

    return () => clearInterval(interval);
  }, [authStatus, isAuthenticated]);

  // Fetch CSRF token on mount
  useEffect(() => {
    (async () => {
      setCsrfToken(await getCsrfToken());
    })();
  }, []);

  // Handle Firebase auth state changes
  useEffect(() => {
    if (!csrfToken) return;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseAuthUser | null) => {
        if (!firebaseUser) {
          try {
            await Promise.all([
              fetch("/api/auth/jwt", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-CSRF-Token": csrfToken,
                },
                credentials: "include",
              }),
              queryClient.cancelQueries(), // Cancel any ongoing queries
            ]);
            queryClient.clear(); // Clear all cached data
          } catch (error) {
            if (error instanceof Error && error.name !== "AbortError") {
              console.error("Error clearing session:", error);
            }
          } finally {
            setIsAuthenticated(false);
            if (routerActivation) {
              router.push("/login");
            }
          }
        } else {
          setIsAuthenticated(true);
        }
      }
    );

    return () => unsubscribe();
    // Remove `router` from deps to avoid aborting on navigation
  }, [csrfToken, routerActivation, queryClient]);

  return {
    userInfo,
    isAuthenticated,
    csrfToken,
  };
}
