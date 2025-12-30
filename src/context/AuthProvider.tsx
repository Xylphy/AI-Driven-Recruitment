"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getCsrfToken, refreshToken } from "@/lib/library";
import { auth } from "@/lib/firebase/client";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  onAuthStateChanged,
  type User as FirebaseAuthUser,
} from "firebase/auth";

const AuthContext = createContext<{
  isAuthenticated: boolean;
  csrfToken?: string | null;
  isLoading?: boolean;
}>({
  isAuthenticated: false,
  csrfToken: null,
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  // Fixes auto cancel flight requests on guest mode
  const wasAuthenticated = useRef(false); // To track previous auth state

  // Global interval for refreshing token
  useEffect(() => {
    if (!isAuthenticated) return;

    const refresh = async () => {
      if (!(await refreshToken())) {
        await auth.signOut();
        setIsAuthenticated(false);
        router.push("/login");
        return;
      }
      setCsrfToken(await getCsrfToken());
    };

    if (wasAuthenticated.current) {
      refresh();
    }

    const interval = setInterval(refresh, 50 * 60 * 1000); // 50 minutes

    setIsLoading(false); // Loading complete once authenticated

    return () => clearInterval(interval);
  }, [isAuthenticated, router]);

  const queryClient = useQueryClient();

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
            if (wasAuthenticated.current) {
              await Promise.all([
                fetch("/api/auth/jwt", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": csrfToken,
                  },
                  credentials: "include",
                }),
                queryClient.cancelQueries(),
              ]);
              queryClient.clear();
            }
          } catch (error) {
            if (error instanceof Error && error.name !== "AbortError") {
              console.error("Error clearing session:", error);
            }
          } finally {
            setIsAuthenticated(false);
            wasAuthenticated.current = false;
          }
        } else {
          await fetch("/api/auth/jwt", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${auth.currentUser?.uid}`,
            },
            credentials: "include",
          });

          setIsAuthenticated(true);
          wasAuthenticated.current = true;
        }
      }
    );

    return () => unsubscribe();
    // Remove `router` and `queryClient` from deps to avoid aborting on navigation and dependency array size issues
    // Silently ignore the lint warning for exhaustive-deps
  }, [csrfToken]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthContext.Provider value={{ isAuthenticated, csrfToken, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
