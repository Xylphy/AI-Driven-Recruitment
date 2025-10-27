import { startTransition, useEffect, useState } from "react";

export default function useFetch<T>({
  url,
  method = "GET",
  credentials = "same-origin",
  defaultData,
}: {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  credentials?: RequestCredentials;
  defaultData?: T;
}) {
  const [data, setData] = useState<T>(defaultData as T);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    startTransition(() => setLoading(true));

    fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: credentials,
      signal: controller.signal,
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
      })
      .then((data) => {
        setData(data);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setErrorMessage(err.message);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [url]);

  return { data, errorMessage, loading };
}
