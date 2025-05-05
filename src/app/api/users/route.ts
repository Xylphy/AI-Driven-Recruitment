import { rateLimit } from "@/app/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyCsrfToken } from "@/app/lib/csrf";
import { createClientServer } from "@/app/lib/supabase/supabase";
import mongoDb_client from "@/app/lib/mongodb/mongodb";
import { ObjectId } from "mongodb";
import { insertTable } from "@/app/lib/supabase/action";
import { EducationalDetail, SocialLink } from "@/app/types/types";

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

// This function handles the POST request to set the password
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

    await mongoDb_client.connect();

    const data = await mongoDb_client
      .db("ai-driven-recruitment")
      .collection("verification_tokens")
      .findOne({ _id: ObjectId.createFromHexString(body.token) });

    if (!data) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    const supabase = await createClientServer(1, true);

    const { data: insertedData, error } = await insertTable(supabase, "users", {
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.mobileNumber,
      prefix: data.prefix,
      firebase_uid: body.uid,
      resume_id: data.public_id,
    });

    if (error) {
      console.error("Error inserting user into Supabase:", error);
    } else {
      console.log("User inserted into Supabase:", insertedData);
    }

    if (!insertedData || !insertedData[0] || !insertedData[0].id) {
      return NextResponse.json(
        { error: "Failed to insert user into Supabase" },
        { status: 500 }
      );
    }
    const userId = insertedData[0].id;

    const results = await Promise.all([
      ...data.educationalDetails.map((detail: Omit<EducationalDetail, "id">) =>
        insertTable(supabase, "educational_details", {
          user_id: userId,
          degree: detail.degree,
          institute: detail.institute,
          start_month: detail.startMonth,
          start_year: parseInt(detail.startYear, 10),
          end_month: detail.endMonth,
          end_year: detail.endYear ? parseInt(detail.endYear, 10) : null,
          currently_pursuing: detail.currentlyPursuing,
          major: detail.major,
        })
      ),
      ...data.socialLinks.map((link: Omit<SocialLink, "id">) =>
        insertTable(supabase, "social_links", {
          user_id: userId,
          link: link.value,
        })
      ),
    ]);

    if (
      results
        .slice(0, data.educationalDetails.length)
        .some((result) => result.error) ||
      results
        .slice(data.educationalDetails.length)
        .some((result) => result.error)
    ) {
      return NextResponse.json(
        { error: "Failed to insert educational details or social links" },
        { status: 500 }
      );
    }

    await mongoDb_client
      .db("ai-driven-recruitment")
      .collection("verification_tokens")
      .deleteOne({ _id: ObjectId.createFromHexString(body.token) });

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
