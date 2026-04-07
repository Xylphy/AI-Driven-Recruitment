"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthContext } from "@/context/AuthProvider";
import { clearSessionStorage } from "@/lib/library";

type UseAuthOptions = {
  routerActivation?: boolean;
};

export default function useAuth({
  routerActivation = true,
}: UseAuthOptions = {}) {
  const router = useRouter();
  const { isAuthenticated, csrfToken, isLoading } = useAuthContext();

  useEffect(() => {
    if (routerActivation && !isAuthenticated && !isLoading) {
      clearSessionStorage(); // Clear session storage on logout or when not authenticated
      router.push("/login");
    }
  }, [routerActivation, isAuthenticated, router, isLoading]);

  return {
    isAuthenticated,
    csrfToken,
  };
}
