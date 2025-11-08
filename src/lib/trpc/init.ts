import { initTRPC } from "@trpc/server";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import superjson from "superjson";
import jwt from "jsonwebtoken";
import { JWT } from "@/types/types";
import { TRPCError } from "@trpc/server";
import { rateLimit } from "@/lib/rate-limit";
import { NextRequest } from "next/server";
import admin from "../firebase/admin";

const standardLimiter = rateLimit({
  max: process.env.NODE_ENV === "development" ? 1000 : 100,
  windowMs: 15 * 60 * 1000,
});

export const createTRPCContext = cache(async () => {
  const [cookieStore, headersList] = await Promise.all([cookies(), headers()]);
  const token = cookieStore.get("token");
  let userJWT: JWT | null = null;

  if (token) {
    try {
      userJWT = jwt.verify(
        token.value,
        process.env.JWT_SECRET as string
      ) as JWT;
    } catch (error) {
      console.log("Invalid token:", error);
    }
  }

  return {
    userJWT,
    headers: headersList,
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

export const protectedProcedure = rateLimitedProcedure.use(
  async ({ ctx, next }) => {
    const csrfToken = ctx.headers?.get("x-csrf-token");
    const csrfCookie = ctx.cookies.get("csrf_token");

    if (!csrfToken || !csrfCookie) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "CSRF token is required",
      });
    }

    if (csrfToken !== csrfCookie.value) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Invalid CSRF token",
      });
    }

    return next();
  }
);

export const authorizedProcedure = rateLimitedProcedure.use(
  async ({ ctx, next }) => {
    if (!ctx.userJWT) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
  }
);

// Combined procedure with both CSRF and auth checks
export const authenticatedProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    if (!ctx.userJWT) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next();
  }
);
