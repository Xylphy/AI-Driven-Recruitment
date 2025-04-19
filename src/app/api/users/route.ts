import { rateLimit } from "@/app/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyCsrfToken } from "@/app/lib/csrf";

const formSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long"),
  token: z.string().min(1, "Token is required"),
  csrfToken: z.string().min(1, "CSRF token is required"),
});

const limiter = rateLimit({
  max: 5,
  windowMs: 15 * 60 * 1000,
});

export async function POST(request: NextRequest) {
  try {
    const { success } = await limiter.check(request);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();

    const validatedData = formSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.format() },
        { status: 400 }
      );
    }

    const isValidCsrf = await verifyCsrfToken(validatedData.data.csrfToken);
    if (!isValidCsrf) {
      return NextResponse.json(
        { error: "Invalid CSRF token" },
        { status: 403 }
      );
    }

    if (body.password !== body.confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    console.log(body);

    return NextResponse.json(
      { message: "Password set successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
