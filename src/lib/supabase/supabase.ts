import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const database1 = {
	url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
	key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
	serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

const database2 = {
	url: process.env.NEXT_PUBLIC_SUPABASE_URL_2!,
	key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_2!,
	serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY_2, // used to bypass RLS (administrative tasks)
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

export async function createClientServer(
	database: number,
	useServiceRole = false,
) {
	const cookieStore = await cookies();

	const database_data = {
		url: database === 1 ? database1.url : database2.url,
		key: useServiceRole
			? database === 1
				? (database1.serviceKey ?? database1.key)
				: (database2.serviceKey ?? database2.key)
			: database === 1
				? database1.key
				: database2.key,
	};

	if (!database_data.url || !database_data.key) {
		throw new Error("Supabase URL or key is missing");
	}

	return createServerClient(database_data.url, database_data.key, {
		cookies: {
			getAll() {
				return cookieStore.getAll();
			},
			setAll(cookiesToSet) {
				try {
					cookiesToSet.forEach(({ name, value, options }) =>
						cookieStore.set(name, value, options),
					);
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
