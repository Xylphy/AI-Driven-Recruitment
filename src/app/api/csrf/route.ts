import { NextResponse } from "next/server";
import { generateCsrfToken } from "@/app/lib/csrf";

export async function GET() {
  return NextResponse.json({
    csrfToken: await generateCsrfToken(),
  });
}
