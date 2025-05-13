import { type NextRequest } from "next/server";
import { updateSession } from "@/app/lib/supabase/middleware";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api")) {
    const origin = request.headers.get("origin");
    const allowedOrigins =
      process.env.NODE_ENV === "development"
        ? ["http://localhost:3000"]
        : [process.env.NEXT_PUBLIC_SITE_URL].filter(Boolean);

    if (!origin || !allowedOrigins.includes(origin)) {
      return NextResponse.json(
        { error: "Origin not allowed" },
        { status: 403 }
      );
    }

    const response = NextResponse.next();
    response.headers.set("Access-Control-Allow-Origin", origin);
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

    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 200,
        headers: response.headers,
      });
    }

    return response;
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
