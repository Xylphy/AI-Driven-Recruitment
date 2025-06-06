import { createClientServer } from "@/lib/supabase/supabase";
import { ErrorResponse } from "@/types/classes";
import { NextRequest, NextResponse } from "next/server";
import { serialize } from "cookie";
import jwt from "jsonwebtoken";
import { find } from "@/lib/supabase/action";
import { IdentifiableItem } from "@/types/types";
import { generateCsrfToken } from "@/lib/csrf";

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

    const { data, error } = await find<
      IdentifiableItem & {
        admins: IdentifiableItem | null;
      }
    >(
      supabase,
      "users",
      "firebase_uid",
      authHeader.split(" ")[1],
      "id, admins!left(id)"
    ).single();

    if (error || !data) {
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
            id: data.id,
            isAdmin: !!data.admins,
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
            userId: data.id,
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
