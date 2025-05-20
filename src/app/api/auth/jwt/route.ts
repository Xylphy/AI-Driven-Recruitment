import { createClientServer } from "@/app/lib/supabase/supabase";
import { ErrorResponse } from "@/app/types/classes";
import { NextRequest, NextResponse } from "next/server";
import { serialize } from "cookie";
import { findMany } from "@/app/lib/supabase/action";
import jwt from "jsonwebtoken";
import { User, Admin } from "@/app/types/schema";

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
    const { data, error } = await findMany<User>(
      supabase,
      "users",
      "firebase_uid",
      authHeader.split(" ")[1]
    ).single();

    console.log("Error:", error);

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch user from the database" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: adminData } = await findMany<Admin>(
      supabase,
      "admins",
      "user_id",
      data.id.toString()
    ).single();

    const response = NextResponse.json({
      message: "Success",
      status: 200,
    });

    response.headers.set(
      "Set-Cookie",
      serialize(
        "token",
        jwt.sign(
          {
            phoneNumber: data.phone_number,
            firstName: data.first_name,
            lastName: data.last_name,
            prefix: data.prefix,
            resumeId: data.resume_id,
            id: data.id,
            isAdmin: adminData ? true : false,
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
