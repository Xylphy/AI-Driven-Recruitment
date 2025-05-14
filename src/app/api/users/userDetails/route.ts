import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  const tokenCookie = request.cookies.get("token");

  if (!tokenCookie || !tokenCookie.value) {
    return NextResponse.json({
      message: "Token not found",
      status: 401,
    });
  }

  return NextResponse.json({
    message: "Success",
    status: 200,
    data: jwt.verify(
      request.cookies.get("token")!.value,
      process.env.JWT_SECRET as string
    ),
  });
}
