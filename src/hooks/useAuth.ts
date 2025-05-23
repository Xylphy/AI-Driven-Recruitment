import { useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import useCsrfToken from "./useCsrfToken";
import { useEffect } from "react";
import { checkAuthStatus } from "@/lib/library";

export default function useAuth() {
  const router = useRouter();
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [information, setInformation] = useState({
    firstName: "",
    lastName: "",
    isAdmin: false,
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { csrfToken } = useCsrfToken();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!csrfToken) {
      return;
    }

    const checkAuth = async () => {
      if (!(await checkAuthStatus(csrfToken))) {
        auth.signOut();
        router.push("/login");
        return;
      } else {
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, [csrfToken, router]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const setInfo = async () => {
      fetch("/api/users/userDetails", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken!,
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
            setInformation({
              firstName: body.data.firstName,
              lastName: body.data.lastName,
              isAdmin: body.data.isAdmin,
            });
          }
        })
        .catch(() => {
          auth.signOut();
          router.push("/login");
          return;
        })
        .finally(() => {
          setIsAuthLoading(false);
        });
    };

    setInfo();
  }, [router, isAuthenticated]);

  return {
    information,
    isAuthLoading,
    isAuthenticated,
    csrfToken,
  };
}
