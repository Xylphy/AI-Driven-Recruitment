import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const database1 = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
};

const database2 = {
  url: process.env.SUPABASE2__NEXT_PUBLIC_SUPABASE_URL!,
  key: process.env.SUPABASE2__NEXT_PUBLIC_SUPABASE_ANON_KEY!,
};

export function createClient(database: number) {
  switch (database) {
    case 1:
      return createBrowserClient(database1.url, database1.key);
    case 2:
      return createBrowserClient(database2.url, database2.key);
    default:
      throw new Error("Invalid database number");
  }
}

export async function createClientServer(database: number) {
  const cookieStore = await cookies();
  switch (database) {
    case 1:
      return createServerClient(database1.url, database1.key, {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              //
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      });
    case 2:
      return createServerClient(database2.url, database2.key, {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              //
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      });
  }
}
