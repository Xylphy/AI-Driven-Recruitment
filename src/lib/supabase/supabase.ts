import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

const database1 = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

export async function createClientServer(useServiceRole = false) {
  const cookieStore = await cookies();

  const database_data = {
    url: database1.url,
    key: useServiceRole
      ? (database1.serviceKey ?? database1.key)
      : database1.key,
  };

  if (!database_data.url || !database_data.key) {
    throw new Error("Supabase URL or key is missing");
  }

  return createServerClient<Database>(database_data.url, database_data.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // The `setAll` method was called from a Server Component.
          //
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
    ...(useServiceRole && {
      global: {
        headers: {
          "x-supabase-role": "service_role",
        },
      },
    }),
  });
}
