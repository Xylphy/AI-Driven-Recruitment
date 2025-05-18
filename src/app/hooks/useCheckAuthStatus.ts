import { useEffect, useState } from "react";
import { checkAuthStatus, getCsrfToken } from "@/app/lib/library";

export function useCheckAuthStatus(csrfToken: string) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      setIsLoading(true);
      try {
        const token = await getCsrfToken();
        if (!token) {
          throw new Error("Failed to fetch CSRF token");
        }

        const status = await checkAuthStatus(token);
        if (status) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, []);

  return { isAuthenticated, isLoading, error };
}
