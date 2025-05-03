import { rateLimit } from "@/app/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyCsrfToken } from "@/app/lib/csrf";
import { createClientServer } from "@/app/lib/supabase/supabase";
import mongoDb_client from "@/app/lib/mongodb/mongodb";
import { ObjectId } from "mongodb";

const formSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long"),
  token: z.string().min(1, "Token is required"),
  uid: z.string().min(1, "User ID is required"),
});

const limiter = rateLimit({
  max: 10,
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
    const csrfToken = request.headers.get("X-CSRF-Token");

    const validatedData = formSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.format() },
        { status: 400 }
      );
    }

    if (!csrfToken) {
      return NextResponse.json(
        { error: "CSRF token is required" },
        { status: 403 }
      );
    }

    const isValidCsrf = await verifyCsrfToken(csrfToken);
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

    const supabase = createClientServer(1);
    await mongoDb_client.connect();

    const data = await mongoDb_client
      .db("ai-driven-recruitment")
      .collection("verification_tokens")
      .findOne({ _id: ObjectId.createFromHexString(body.token) });

    if (!data) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    const { data: insertedData, error } = await (await supabase)
      .from("users")
      .insert({
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.mobileNumber,
        prefix: data.prefix,
        firebase_uid: body.uid,
      });

    if (error) {
      console.error("Error inserting user into Supabase:", error);
    } else {
      console.log("User inserted into Supabase:", insertedData);
    }

    return NextResponse.json(
      { message: "Password set successfully" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  } finally {
    await mongoDb_client.close();
  }
}
