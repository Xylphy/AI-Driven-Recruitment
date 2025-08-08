"use client";

import { useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { useEffect } from "react";
import { checkAuthStatus } from "@/lib/library";
import {
  Skills,
  User,
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

export default function useAuth({
  fetchUser = false,
  fetchAdmin = false,
  fetchSkills = false,
  fetchSocialLinks = false,
  fetchEducation = false,
  fetchExperience = false,
  routerActivation = true,
}: UseAuthOptions = {}) {
  const router = useRouter();
  const [information, setInformation] = useState<{
    user: Omit<User, "id"> | null;
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

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        fetch("/api/auth/jwt", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken,
          },
          credentials: "include",
        }).then((res) => {
          if (!res.ok) {
          } else {
            setIsAuthenticated(false);

            if (routerActivation) {
              router.push("/login");
            }
          }
        });
      }
    });

    const checkAuth = async () => {
      if (await checkAuthStatus()) {
        setIsAuthenticated(true);
      } else {
        auth.signOut();
        return;
      }
    };

    checkAuth();

    return () => unsubscribe();
  }, [router, csrfToken]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

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

    const setInfo = async () => {
      fetch(`/api/users?${params.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch user information");
          }
          return res.json();
        })
        .then((body) => {
          if (body) {
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
        })
        .catch((error) => {
          alert(error.message);
          auth.signOut();
          return;
        })
        .finally(() => {
          setIsAuthLoading(false);
        });
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

    return () => clearInterval(checkAuthInterval);
  }, [isAuthenticated]);

  return {
    information,
    isAuthenticated,
    isAuthLoading,
    csrfToken,
  };
}
