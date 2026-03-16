import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "../../types/supabase";

const database1 = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

export function createClient() {
  if (!database1.url || !database1.key) {
    throw new Error("Supabase URL or key is missing");
  }

  return createBrowserClient<Database>(database1.url, database1.key);
}
export const supabaseClient = createClient();
