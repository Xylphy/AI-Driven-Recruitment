"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { useAuthContext } from "@/context/AuthProvider";
import { useEffect } from "react";

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
  const { isAuthenticated, csrfToken, isLoading } = useAuthContext();

  // Use tRPC for auth status checking
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
      enabled: isAuthenticated, // Fetch only if user is authenticated
    }
  );

  useEffect(() => {
    if (routerActivation && !isAuthenticated && !isLoading) {
      router.push("/login");
    }
  }, [routerActivation, isAuthenticated, router, isLoading]);

  return {
    userInfo,
    isAuthenticated,
    csrfToken,
  };
}
