import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { rateLimit } from "./app/lib/rate-limit";
import { verifyCsrfToken } from "@/app/lib/csrf";

const limiter = rateLimit({
  max: 20,
  windowMs: 15 * 60 * 1000,
});

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api")) {
    const { success } = await limiter.check(request);
    if (!success) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    const origin = request.headers.get("origin");
    const allowedOrigins =
      process.env.NODE_ENV === "development"
        ? ["http://localhost:3000", "null"]
        : [process.env.NEXT_PUBLIC_SITE_URL].filter(Boolean);

    const isSameOrigin = !origin || origin === process.env.NEXT_PUBLIC_SITE_URL;
    const isAllowedOrigin = origin && allowedOrigins.includes(origin);

    if (!isSameOrigin && !isAllowedOrigin) {
      return NextResponse.json(
        { error: "Origin not allowed" },
        { status: 403 }
      );
    }

    if (!request.nextUrl.pathname.startsWith("/api/csrf")) {
      const csrfToken = request.headers.get("X-CSRF-Token");

      if (!csrfToken) {
        return NextResponse.json(
          { error: "CSRF token is required" },
          { status: 403 }
        );
      }

      if (!verifyCsrfToken(csrfToken)) {
        return NextResponse.json(
          { error: "Invalid CSRF token" },
          { status: 403 }
        );
      }
    }

    const response = NextResponse.next();
    if (origin && !isSameOrigin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Vary", "Origin");
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-CSRF-Token"
      );
      response.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      response.headers.set("Access-Control-Allow-Credentials", "true");
      response.headers.set("Access-Control-Max-Age", "86400");
    }

    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 200,
        headers: response.headers,
      });
    }

    return response;
  }

  // return await updateSession(request); // if you want to use supabase session
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
