"use client";

import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthProvider";
import { useEffect } from "react";

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
      router.push("/login");
    }
  }, [routerActivation, isAuthenticated, router, isLoading]);

  return {
    isAuthenticated,
    csrfToken,
  };
}
