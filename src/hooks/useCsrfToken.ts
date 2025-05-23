import { useEffect, useState } from "react";
import { getCsrfToken } from "@/lib/library";

export default function useCsrfToken() {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCsrfToken = async () => {
      const token = await getCsrfToken();
      if (token) {
        setCsrfToken(token);
      } else {
        setError(new Error("Failed to fetch CSRF token"));
      }

      setIsLoading(false);
    };

    fetchCsrfToken();
  }, []);

  return {
    csrfToken,
    isLoading,
    error,
  };
}

  