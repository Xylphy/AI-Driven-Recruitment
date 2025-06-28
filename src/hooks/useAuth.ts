import { useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import { useEffect } from "react";
import { checkAuthStatus } from "@/lib/library";
import {
  Skills,
  User,
  EducationalDetails,
  JobExperiences,
} from "@/types/schema";
import { useRouter } from "next/navigation";

export default function useAuth(
  fetchUser = false,
  fetchAdmin = false,
  fetchSkills = false,
  fetchSocialLinks = false,
  fetchEducation = false,
  fetchExperience = false
) {
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      }
    });

    const checkAuth = async () => {
      if (!(await checkAuthStatus())) {
        auth.signOut();
        router.push("/login");
        return;
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuth();
    return () => unsubscribe();
  }, [router]);

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
      if (value) params.append(key, "true");
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
            alert("Failed to fetch user data");
            auth.signOut();
            router.push("/login");
            return;
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
        .catch(() => {
          auth.signOut();
          return;
        })
        .finally(() => {
          setIsAuthLoading(false);
        });
    };

    setInfo();
  }, [isAuthenticated]);

  return {
    information,
    isAuthenticated,
    isAuthLoading,
  };
}
