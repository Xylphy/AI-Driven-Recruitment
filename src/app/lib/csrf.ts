import { randomBytes } from "crypto";
import { cookies } from "next/headers";

export async function generateCsrfToken(): Promise<string> {
  const csrfToken = randomBytes(32).toString("hex");
  (await cookies()).set("csrf_token", csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60,
  });
  return csrfToken;
}

export async function verifyCsrfToken(token: string): Promise<boolean> {
  const csrfCookie = (await cookies()).get("csrf_token");
  if (!csrfCookie) {
    return false;
  }
  return token === csrfCookie.value;
}
