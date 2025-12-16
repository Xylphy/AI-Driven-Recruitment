import { createClientServer } from "@/lib/supabase/supabase";
import { ErrorResponse } from "@/types/classes";
import { NextRequest, NextResponse } from "next/server";
import { serialize } from "cookie";
import jwt from "jsonwebtoken";
import { find } from "@/lib/supabase/action";
import { generateCsrfToken } from "@/lib/csrf";
import { User } from "@/types/schema";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization header is missing or invalid" },
        { status: 401 }
      );
    }
    const supabase = await createClientServer(1, true);

    const { data: userData, error } = await find<User>(supabase, "users", [
      { column: "firebase_uid", value: authHeader.split(" ")[1] },
    ]).single();

    if (error || !userData) {
      return NextResponse.json(
        { error: "Invalid token or user not found" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      message: "Success",
      status: 200,
      csrfToken: await generateCsrfToken(),
    });

    response.headers.set(
      "Set-Cookie",
      serialize(
        "token",
        jwt.sign(
          {
            id: userData.id,
            role: userData.role,
            type: "access",
          },
          process.env.JWT_SECRET as string,
          { expiresIn: "1h" }
        ),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60, // 1 hour
          path: "/",
        }
      )
    );

    response.headers.append(
      "Set-Cookie",
      serialize(
        "refreshToken",
        jwt.sign(
          {
            userId: userData.id,
            type: "refresh",
          },
          process.env.REFRESH_TOKEN_SECRET as string,
          { expiresIn: "7d" }
        ),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: "/api/auth/refresh",
        }
      )
    );

    return response;
  } catch (error) {
    if (error instanceof ErrorResponse) {
      return NextResponse.json(
        { error: error.errorMessage },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}

export async function POST() {
  const response = NextResponse.json({
    message: "Logged out successfully",
    status: 200,
  });

  response.headers.set(
    "Set-Cookie",
    serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
      path: "/",
    })
  );

  response.headers.append(
    "Set-Cookie",
    serialize("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
      path: "/api/auth/refresh",
    })
  );

  return response;
}
