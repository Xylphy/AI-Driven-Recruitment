"use client";

import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { makeQueryClient } from "@/lib/trpc/query-client";
import type { AppRouter } from "./routers/app";
import superjson from "superjson";
import { getCsrfToken } from "../library";

export const trpc = createTRPCReact<AppRouter>({
  abortOnUnmount: true,
});
let clientQueryClientSingleton: QueryClient;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: use singleton pattern to keep the same query client
  return (clientQueryClientSingleton ??= makeQueryClient());
}

function getUrl() {
  const base = (() => {
    if (typeof window !== "undefined") return "";
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "http://localhost:3000";
  })();
  return `${base}/api/trpc`;
}

let _cachedCsrf: { token: string | null; expiresAt?: number } = {
  token: null,
};

// Deduplicate concurrent CSRF fetches by storing a pending promise
let _csrfPromise: Promise<string | null> | null = null;

async function getCachedCsrfToken(): Promise<string | null> {
  if (
    _cachedCsrf.token &&
    _cachedCsrf.expiresAt &&
    Date.now() < _cachedCsrf.expiresAt
  ) {
    return _cachedCsrf.token;
  }

  if (_csrfPromise) {
    return _csrfPromise;
  }

  _csrfPromise = (async () => {
    try {
      const token = await getCsrfToken();
      _cachedCsrf = {
        token,
        expiresAt: Date.now() + 5 * 60 * 1000, // cache 5 minutes
      };
      return token;
    } finally {
      _csrfPromise = null;
    }
  })();

  return _csrfPromise;
}

export function TRPCProvider(
  props: Readonly<{
    children: React.ReactNode;
  }>
) {
  const queryClient = getQueryClient();
  const trpcClient = trpc.createClient({
    links: [
      httpBatchLink({
        transformer: superjson,
        url: getUrl(),
        async headers() {
          return { "x-csrf-token": (await getCachedCsrfToken()) ?? undefined };
        },
      }),
    ],
  });
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
