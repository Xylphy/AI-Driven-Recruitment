"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
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
}>({
  isAuthenticated: false,
  csrfToken: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const hasSeenInitialAuthState = useRef(false);
  const wasAuthenticated = useRef(false);

  // Global interval for refreshing token
  useEffect(() => {
    if (!isAuthenticated) return;

    const refresh = async () => {
      if (!(await refreshToken())) {
        await auth.signOut();
        setIsAuthenticated(false);
        router.push("/login");
      }
    };

    const interval = setInterval(refresh, 50 * 60 * 1000); // 50 minutes

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
        // The first auth callback often fires with `null` while Firebase is initializing.
        // Cancelling all queries at that moment aborts in-flight public data requests
        // (shown in Firefox as `NS_BINDING_ABORTED`). Only clear/cancel on a real
        // transition from authenticated -> unauthenticated.
        if (!hasSeenInitialAuthState.current) {
          hasSeenInitialAuthState.current = true;
          wasAuthenticated.current = Boolean(firebaseUser);
          setIsAuthenticated(Boolean(firebaseUser));
          return;
        }

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
    <AuthContext.Provider value={{ isAuthenticated, csrfToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
