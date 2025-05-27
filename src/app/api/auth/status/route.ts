import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token");
  if (!token) {
    return new Response(JSON.stringify({ error: "Token not found" }), {
      status: 401,
    });
  }

  const decoded = jwt.verify(
    token.value,
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
