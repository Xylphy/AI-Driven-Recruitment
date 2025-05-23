import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import { createClientServer } from "@/lib/supabase/supabase";
import { find } from "@/lib/supabase/action";
import { Admin, User } from "@/types/schema";

interface RefreshTokenPayload {
  userId: string;
  type?: string;
  iat: number;
  exp: number;
}

export async function GET(request: NextRequest) {
  const refreshTokenCookie = request.cookies.get("refreshToken");

  if (!refreshTokenCookie) {
    return NextResponse.json(
      { error: "Refresh token not found." },
      { status: 401 }
    );
  }

  try {
    const decoded = jwt.verify(
      refreshTokenCookie.value,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as RefreshTokenPayload;

    if (decoded.type !== "refresh") {
      return NextResponse.json(
        { error: "Invalid token type." },
        { status: 401 }
      );
    }
    const supabase = await createClientServer(1, true);

    const [userData, adminData] = await Promise.all([
      find<User>(supabase, "users", "id", decoded.userId).single(),
      find<Admin>(supabase, "admins", "user_id", decoded.userId).single(),
    ]);

    if (userData.error || !userData.data) {
      const response = NextResponse.json(
        { error: "Invalid refresh token or user not found." },
        { status: 401 }
      );
      response.headers.append(
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

    const response = NextResponse.json({
      message: "Token refreshed successfully",
    });

    response.headers.append(
      "Set-Cookie",
      serialize(
        "token",
        jwt.sign(
          {
            phoneNumber: userData.data.phone_number,
            firstName: userData.data.first_name,
            lastName: userData.data.last_name,
            prefix: userData.data.prefix,
            resumeId: userData.data.resume_id,
            id: userData.data.id,
            isAdmin: !!adminData.data,
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
          { userId: userData.data.id, type: "refresh" },
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
  } catch {
    const response = NextResponse.json(
      { error: "Invalid or expired refresh token." },
      { status: 401 }
    );
    response.headers.append(
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
}
