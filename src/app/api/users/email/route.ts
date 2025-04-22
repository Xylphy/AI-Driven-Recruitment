import { getTokenData } from "@/app/lib/mongodb/action";
import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/app/lib/rate-limit";
import { z } from "zod";
import { verifyCsrfToken } from "@/app/lib/csrf";

const limiter = rateLimit({
  max: 30,
  windowMs: 15 * 60 * 1000,
});

const schema = z.object({
  id: z.string().min(1, "ID is required"),
});

export async function POST(request: NextRequest) {
  const rateLimitResult = await limiter.check(request);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many requests, please try again later." },
      { status: 429 }
    );
  }
  const csrfToken = request.headers.get("X-CSRF-Token");
  if (!csrfToken) {
    return NextResponse.json(
      { error: "CSRF token is required" },
      { status: 403 }
    );
  }
  const isValidCsrf = await verifyCsrfToken(csrfToken);
  if (!isValidCsrf) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const body = await request.json();

  const validationResult = schema.safeParse(body);

  if (!validationResult.success) {
    return NextResponse.json(
      { error: validationResult.error.errors.map((e) => e.message).join(", ") },
      { status: 400 }
    );
  }

  try {
    const tokenData = await getTokenData(body.id);
    if (!tokenData) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    return NextResponse.json(tokenData.email, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
