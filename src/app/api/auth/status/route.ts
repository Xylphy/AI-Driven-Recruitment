import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  const decoded = jwt.verify(
    request.cookies.get("token")!.value,
    process.env.JWT_SECRET as string
  ) as jwt.JwtPayload;

  // Check if token is about to expire in 15 minutes
  if (decoded.exp && decoded.exp - Math.floor(Date.now() / 1000) < 15 * 60) {
    return new Response(JSON.stringify({ error: "Token is about to expire" }), {
      status: 401,
    });
  }

  return new Response(JSON.stringify({ message: "Token is valid" }), {
    status: 200,
  });
}
