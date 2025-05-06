import { SupabaseClient } from "@supabase/supabase-js";

export function insertTable(
  supabase: SupabaseClient,
  table: string,
  data: object
) {
  return supabase.from(table).insert(data).select("id");
}
