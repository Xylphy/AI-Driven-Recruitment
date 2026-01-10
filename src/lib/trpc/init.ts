import { initTRPC, TRPCError } from "@trpc/server";
import jwt from "jsonwebtoken";
import { cookies, headers } from "next/headers";
import type { NextRequest } from "next/server";
import { cache } from "react";
import superjson from "superjson";
import { rateLimit } from "@/lib/rate-limit";
import type { JWT } from "@/types/types";

const standardLimiter = rateLimit({
	max: process.env.NODE_ENV === "development" ? 1000 : 200,
	windowMs: 15 * 60 * 1000,
});

export const createTRPCContext = cache(async () => {
	const [cookieStore, headersList] = await Promise.all([cookies(), headers()]);
	const headersSafe = {
		get: (name: string) => headersList.get(name),
		plain: Object.fromEntries(headersList.entries()),
	};

	const token = cookieStore.get("token");

	let userJWT: JWT | null = null;
	if (token) {
		try {
			userJWT = jwt.verify(
				token.value,
				process.env.JWT_SECRET as string,
			) as JWT;
		} catch (error) {
			console.error("Invalid token:", error);
		}
	}

	return {
		userJWT,
		headers: headersSafe,
		cookies: cookieStore,
	};
});

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC
	.context<Awaited<ReturnType<typeof createTRPCContext>>>()
	.create({
		/**
		 * @see https://trpc.io/docs/server/data-transformers
		 */
		transformer: superjson,
		errorFormatter({ shape }) {
			return {
				...shape,
				data: {
					...shape.data,
					stack:
						process.env.NODE_ENV === "development"
							? shape.data.stack
							: undefined,
				},
			};
		},
	});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
const baseProcedure = t.procedure;

export const rateLimitedProcedure = baseProcedure.use(async ({ ctx, next }) => {
	const result = standardLimiter.check({
		headers: {
			get: (name: string) => ctx.headers?.get(name) || null,
		},
	} as Pick<NextRequest, "headers">);

	if (!result.success) {
		throw new TRPCError({
			code: "TOO_MANY_REQUESTS",
			message: "Rate limit exceeded",
		});
	}

	return next();
});

export const authorizedProcedure = rateLimitedProcedure.use(
	async ({ ctx, next }) => {
		if (!ctx.userJWT) {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "Not authenticated",
			});
		}
		return next();
	},
);

export const adminProcedure = authorizedProcedure.use(async ({ ctx, next }) => {
	if (ctx.userJWT?.role !== "Admin" && ctx.userJWT?.role !== "SuperAdmin") {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Access restricted to admin users",
		});
	}

	return next();
});

export const hrOfficerProcedure = authorizedProcedure.use(
	async ({ ctx, next }) => {
		if (ctx.userJWT?.role !== "HR Officer") {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Access restricted to HR Officers",
			});
		}

		return next();
	},
);
