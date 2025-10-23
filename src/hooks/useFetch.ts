import { useEffect, useState } from "react";

export default function useFetch({
  url,
  method,
  credentials,
}: {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  credentials?: RequestCredentials;
}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      try {
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
              setError(err.message);
            }
          });
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [url]);

  return { data, error, loading };
}
