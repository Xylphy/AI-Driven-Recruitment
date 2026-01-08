import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { rateLimit } from "./lib/rate-limit";
import { verifyCsrfToken } from "@/lib/csrf";

const limiter = rateLimit({
  max: 200, // Default 75
  windowMs: 10 * 60 * 1000,
});

// Paths that do not require an access token
const publicPathToken = [
  {
    path: "/api/auth/jwt",
    acceptedMethods: ["GET"],
  },
  {
    path: "/api/auth/refresh",
    acceptedMethods: ["GET"],
  },
  {
    path: "/api/csrf",
    acceptedMethods: ["GET"],
  },
];

// Paths that do not require CSRF token
const publicPathCsrf = [
  "/api/auth/refresh",
  "/api/auth/jwt",
  "/api/csrf",
  "/api/admin/stats",
];

const allowedOrigins =
  process.env.NODE_ENV === "development"
    ? ["http://localhost:3000", "null"]
    : [
        process.env.NEXT_PUBLIC_SITE_URL,
        "http://localhost:3000",
        "null",
      ].filter(Boolean);

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/api")) {
    // Let trpc and other api routes handle their own rate limiting and endpoint protection
    if (pathname.startsWith("/api/trpc")) {
      return NextResponse.next();
    }

    if (!limiter.check(request).success) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    const origin = request.headers.get("origin");
    const isSameOrigin = !origin || origin === process.env.NEXT_PUBLIC_SITE_URL;

    if (!isSameOrigin && !(origin && allowedOrigins.includes(origin))) {
      return NextResponse.json(
        { error: "Origin not allowed" },
        { status: 403 }
      );
    }

    if (!publicPathCsrf.includes(pathname) && request.method !== "GET") {
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

    if (
      !request.cookies.get("token") &&
      !publicPathToken.some(
        (publicPath) =>
          pathname.startsWith(publicPath.path) &&
          publicPath.acceptedMethods.includes(request.method)
      )
    ) {
      return NextResponse.json({ error: "Token is required" }, { status: 403 });
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

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
