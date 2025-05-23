import { useEffect, useState } from "react";
import { checkAuthStatus } from "@/lib/library";

export function useCheckAuthStatus(csrfToken: string) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      setIsLoading(true);
      try {
        const status = await checkAuthStatus(csrfToken);
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
  }, [csrfToken]);

  return { isAuthenticated, isLoading, error };
}
