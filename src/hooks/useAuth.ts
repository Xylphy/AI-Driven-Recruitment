"use client";

import { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  type User as FirebaseAuthUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { refreshToken } from "@/lib/library";
import {
  Skills,
  User as SchemaUser,
  EducationalDetails,
  JobExperiences,
} from "@/types/schema";
import { useRouter } from "next/navigation";
import { getCsrfToken } from "@/lib/library";
import { trpc } from "@/lib/trpc/client";

type UseAuthOptions = {
  fetchUser?: boolean;
  fetchAdmin?: boolean;
  fetchSkills?: boolean;
  fetchSocialLinks?: boolean;
  fetchEducation?: boolean;
  fetchExperience?: boolean;
  routerActivation?: boolean;
};

type UsersApiData = {
  user: Omit<SchemaUser, "id"> | null;
  admin: boolean | null;
  skills: Pick<Skills, "skill">[];
  socialLinks: string[];
  education: Omit<EducationalDetails, "user_id" | "id">[];
  experience: Omit<JobExperiences, "user_id" | "id">[];
};

type UsersApiResponse = {
  data: UsersApiData;
};

export default function useAuth({
  fetchUser = false,
  fetchAdmin = false,
  fetchSkills = false,
  fetchSocialLinks = false,
  fetchEducation = false,
  fetchExperience = false,
  routerActivation = true,
}: UseAuthOptions = {}): {
  information: UsersApiData;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  csrfToken: string | null;
} {
  const router = useRouter();
  const [information, setInformation] = useState<UsersApiData>({
    user: null,
    admin: null,
    skills: [],
    socialLinks: [],
    education: [],
    experience: [],
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  // Use tRPC for auth status checking
  const authStatus = trpc.auth.checkStatus.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 60000 * 15, // Refetch every 15 minutes (token expires in less than 15 mins)
    retry: false, // Do not retry on failure
    refetchOnWindowFocus: false, // Do not refetch on window focus
  });

  // Handle auth status errors (token expiring or expired)
  useEffect(() => {
    if (!authStatus.error) return;

    const handleTokenRefresh = async () => {
      const refreshed = await refreshToken();
      if (!refreshed) {
        await auth.signOut();
        setIsAuthenticated(false);
        setIsAuthLoading(false);
        if (routerActivation) {
          router.push("/login");
        }
      }
    };

    handleTokenRefresh();
  }, [authStatus.error, router, routerActivation]);

  // Fetch CSRF token on mount
  useEffect(() => {
    const fetchCsrfToken = async () => {
      setCsrfToken(await getCsrfToken());
    };

    fetchCsrfToken();
  }, []);

  // Handle Firebase auth state changes
  useEffect(() => {
    if (!csrfToken) return;

    const controller = new AbortController();

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseAuthUser | null) => {
        if (!firebaseUser) {
          try {
            // Clear session cookie
            await fetch("/api/auth/jwt", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken,
              },
              credentials: "include",
              signal: controller.signal,
            });
          } catch (error) {
            if (error instanceof Error && error.name !== "AbortError") {
              console.error("Error clearing session:", error);
            }
          } finally {
            setIsAuthenticated(false);
            setIsAuthLoading(false);
            if (routerActivation) {
              router.push("/login");
            }
          }
        } else {
          // User is signed in
          setIsAuthenticated(true);
          setIsAuthLoading(false);
        }
      }
    );

    return () => {
      unsubscribe();
      controller.abort();
    };
  }, [csrfToken, router, routerActivation]);

  // Fetch user information when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams();

    Object.entries({
      admin: fetchAdmin,
      user: fetchUser,
      skills: fetchSkills,
      socialLinks: fetchSocialLinks,
      education: fetchEducation,
      experience: fetchExperience,
    }).forEach(([key, value]) => {
      if (value) {
        params.append(key, "true");
      }
    });

    const setInfo = async (): Promise<void> => {
      try {
        const res = await fetch(`/api/users?${params.toString()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Failed to fetch user information");
        }

        const body = (await res.json()) as UsersApiResponse | null;

        if (body?.data) {
          const data = body.data;
          setInformation({
            user: data.user,
            admin: data.admin,
            skills: data.skills,
            socialLinks: data.socialLinks,
            education: data.education,
            experience: data.experience,
          });
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === "AbortError") return;

        const message = error instanceof Error ? error.message : String(error);
        console.error("Failed to fetch user information:", message);
        await auth.signOut();
      }
    };

    setInfo();

    return () => {
      controller.abort();
    };
  }, [
    isAuthenticated,
    fetchAdmin,
    fetchUser,
    fetchSkills,
    fetchSocialLinks,
    fetchEducation,
    fetchExperience,
  ]);

  return {
    information,
    isAuthenticated,
    isAuthLoading,
    csrfToken,
  };
}
