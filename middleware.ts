import { NextResponse } from "next/server";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { NextRequest } from "next/server";

const rateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60,
});

export async function middleware(request: NextRequest) {
  try {
    await rateLimiter.consume(
      request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "127.0.0.1"
    );
    return NextResponse.next();
  } catch (error) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
}
