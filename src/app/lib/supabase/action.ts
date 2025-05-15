import { SupabaseClient } from "@supabase/supabase-js";

export function insertTable(
  supabase: SupabaseClient,
  table: string,
  data: object
) {
  return supabase.from(table).insert(data).select("id");
}

/**
 *
 * @param supabase supabase client
 * @param table table name
 * @param column column name
 * @param value value of column
 * @returns a promise that resolves to the data
 */
export function findOne(
  supabase: SupabaseClient,
  table: string,
  value: string,
  column: string
) {
  return supabase.from(table).select("*").eq(column, value).single();
}
