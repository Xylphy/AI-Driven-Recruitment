import { NextRequest, NextResponse } from "next/server";
import { generateCsrfToken } from "@/app/lib/csrf";
import { rateLimit } from "@/app/lib/rate-limit";

const limiter = rateLimit({
  max: 5,
  windowMs: 15 * 60 * 1000,
});

export async function GET(request: NextRequest) {
  const { success } = await limiter.check(request);
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  return NextResponse.json({
    csrfToken: await generateCsrfToken(),
  });
}
