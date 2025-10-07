"use client";

import { useState } from "react";
import {
  onAuthStateChanged,
  type User as FirebaseAuthUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useEffect } from "react";
import { checkAuthStatus } from "@/lib/library";
import {
  Skills,
  User as SchemaUser,
  EducationalDetails,
  JobExperiences,
} from "@/types/schema";
import { useRouter } from "next/navigation";
import { getCsrfToken } from "@/lib/library";

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
  information: {
    user: Omit<SchemaUser, "id"> | null;
    admin: boolean | null;
    skills: Pick<Skills, "skill">[];
    socialLinks: string[];
    education: Omit<EducationalDetails, "user_id" | "id">[];
    experience: Omit<JobExperiences, "user_id" | "id">[];
  };
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  csrfToken: string | null;
} {
  const router = useRouter();
  const [information, setInformation] = useState<{
    user: Omit<SchemaUser, "id"> | null;
    admin: boolean | null;
    skills: Pick<Skills, "skill">[];
    socialLinks: string[];
    education: Omit<EducationalDetails, "user_id" | "id">[];
    experience: Omit<JobExperiences, "user_id" | "id">[];
  }>({
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

  useEffect(() => {
    const fetchCsrfToken = async () => {
      setCsrfToken(await getCsrfToken());
    };

    fetchCsrfToken();
  }, []);

  useEffect(() => {
    if (!csrfToken) return;

    const controller = new AbortController();

    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseAuthUser | null) => {
        if (!firebaseUser) {
          try {
            await fetch("/api/auth/jwt", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-CSRF-Token": csrfToken,
              },
              credentials: "include",
              signal: controller.signal,
            });
          } finally {
            setIsAuthenticated(false);
            if (routerActivation) {
              router.push("/login");
            }
          }
        }
      }
    );

    const checkAuth = async (): Promise<void> => {
      const status = await checkAuthStatus();
      if (status) {
        setIsAuthenticated(true);
      } else {
        await auth.signOut();
      }
    };

    checkAuth();

    return () => {
      unsubscribe();
      controller.abort(); // cancel the request on unmount
    };
  }, [router, csrfToken]);

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
        alert(message);
        await auth.signOut();
        return;
      } finally {
        setIsAuthLoading(false);
      }
    };

    const checkAuthInterval = setInterval(() => {
      checkAuthStatus().then((status) => {
        if (!status) {
          auth.signOut();
          clearInterval(checkAuthInterval);
          return;
        }
        setIsAuthenticated(true);
      });
    }, 60000 * 50); // Check every 50 minutes since the expiry of the session is 60 minutes

    setInfo();

    return () => {
      controller.abort(); // cancel the request on unmount
      clearInterval(checkAuthInterval);
    };
  }, [isAuthenticated]);

  return {
    information,
    isAuthenticated,
    isAuthLoading,
    csrfToken,
  };
}
