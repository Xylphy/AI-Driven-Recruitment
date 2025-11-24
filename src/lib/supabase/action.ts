import { SupabaseClient } from "@supabase/supabase-js";

export interface QueryFilter {
  column: string;
  value: string;
}

interface QueryForeignKey {
  foreignTable: string;
  foreignKey: string;
  fields: string;
}

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

export function deleteRow(
  supabase: SupabaseClient,
  table: string,
  column: string,
  value: string
) {
  return supabase.from(table).delete().eq(column, value);
}

export function find<T>(
  supabase: SupabaseClient,
  table: string,
  filters?: Array<QueryFilter>,
  select: string = "*"
) {
  return {
    single: async (): Promise<QueryResult<T>> => {
      let query = supabase.from(table).select(select);
      if (filters) {
        filters.forEach(({ column, value }) => {
          query = query.eq(column, value);
        });
      }
      const result = await query.single();
      return {
        data: result.data as T,
        error: result.error,
      };
    },
    many: () => {
      let query = supabase.from(table).select(select);

      if (filters) {
        filters.forEach(({ column, value }) => {
          query = query.eq(column, value);
        });
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
          } as QueryResult<T[]>;
        },
      };
    },
  };
}

export function updateTable(
  supabase: SupabaseClient,
  table: string,
  matchColumn: string,
  matchValue: string,
  data: object
) {
  const query = supabase.from(table).update(data).eq(matchColumn, matchValue);
  if (
    typeof selectColumns === "string" &&
    selectColumns
      .split(",")
      .map((col) => col.trim())
      .filter((col) => col.length > 0).length > 0
  ) {
    return query.select(selectColumns);
  }
  return query;
}

export function findWithJoin<T>(
  supabase: SupabaseClient,
  mainTable: string,
  joinConfigs: Array<QueryForeignKey>
) {
  return {
    many: (filters?: Array<QueryFilter>) => {
      const joinSelect = joinConfigs
        .map((j) => `${j.foreignTable}(${j.fields || "*"})`)
        .join(", ");

      let query = supabase.from(mainTable).select(`*, ${joinSelect}`);

      if (filters) {
        filters.forEach(({ column, value }) => {
          query = query.eq(column, value);
        });
      }

      return {
        execute: async (): Promise<QueryResult<T[]>> => {
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

export async function countTable(
  supabase: SupabaseClient,
  table: string,
  filters?: Array<{ column: string; value: string }>
): Promise<QueryResult<number>> {
  let query = supabase.from(table).select("*", { count: "exact", head: true }); // returns only count and no data

  if (filters) {
    filters.forEach(({ column, value }) => {
      query = query.eq(column, value);
    });
  }

  const result = await query;
  return {
    data: result.count || 0,
    error: result.error,
  };
}
