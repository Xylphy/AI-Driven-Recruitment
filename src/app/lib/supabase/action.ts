import { SupabaseClient } from "@supabase/supabase-js";

interface QueryResult<T> {
  data: T | null;
  error: { message: string } | null;
}

export function insertTable(
  supabase: SupabaseClient,
  table: string,
  data: object
) {
  return supabase.from(table).insert(data).select("id");
}

export function deleteOne(
  supabase: SupabaseClient,
  table: string,
  column: string,
  value: string
) {
  return supabase.from(table).delete().eq(column, value);
}

export function findMany<T>(
  supabase: SupabaseClient,
  table: string,
  column?: string,
  value?: string,
  select: string = "*"
) {
  return {
    single: async (): Promise<QueryResult<T>> => {
      let queryBuilder = supabase.from(table).select(select);
      if (column && value) {
        queryBuilder = queryBuilder.eq(column, value);
      }
      const result = await queryBuilder.single();
      return {
        data: result.data as T,
        error: result.error,
      };
    },
    many: () => {
      let query = supabase.from(table).select(select);

      if (column && value) {
        query = query.eq(column, value);
      }

      return {
        range(from: number, to: number) {
          query = query.range(from, to);
          return this;
        },
        order(column: string, options?: { ascending?: boolean }) {
          query = query.order(column, options);
          return this;
        },
        async execute(): Promise<QueryResult<T[]>> {
          const result = await query;
          return {
            data: result.data as T[],
            error: result.error,
          };
        },
      };
    },
  };
}
