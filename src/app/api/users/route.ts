import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClientServer } from "@/app/lib/supabase/supabase";
import { ObjectId } from "mongodb";
import {
  insertTable,
  deleteOne as supabaseDeleteOne,
} from "@/app/lib/supabase/action";
import {
  EducationalDetail,
  JobExperience,
  SocialLink,
} from "@/app/types/types";
import { deleteOne, findOne } from "@/app/lib/mongodb/action";
import { ErrorResponse } from "@/app/types/classes";

const formSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long"),
  token: z.string().min(1, "Token is required"),
  uid: z.string().min(1, "User ID is required"),
});

// This function handles the POST request to set the password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = formSchema.safeParse(body);
    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.format() },
        { status: 400 }
      );
    }

    if (body.password !== body.confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    const data = await findOne("ai-driven-recruitment", "verification_tokens", {
      _id: ObjectId.createFromHexString(body.token),
    });

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
          start_year: detail.startYear,
          end_month: detail.endMonth,
          end_year: detail.endYear,
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
      ...data.jobExperiences.map((experience: Omit<JobExperience, "id">) =>
        insertTable(supabase, "job_experiences", {
          user_id: userId,
          title: experience.title,
          company: experience.company,
          start_month: experience.startMonth,
          start_year: experience.startYear,
          end_month: experience.endMonth,
          end_year: experience.endYear,
          currently_working: experience.currentlyWorking,
          summary: experience.summary,
        })
      ),
      ...data.skillSet.split(",").map((skill: string) =>
        insertTable(supabase, "skills", {
          user_id: userId,
          skill: skill.trim(),
        })
      ),
    ]);

    if (results.some((result) => result.error)) {
      supabaseDeleteOne(supabase, "users", "id", userId.toString());
      return NextResponse.json(
        { error: "Something wrong saving data" },
        { status: 500 }
      );
    }

    deleteOne("ai-driven-recruitment", "verification_tokens", {
      _id: ObjectId.createFromHexString(body.token),
    });

    return NextResponse.json(
      { message: "Password set successfully" },
      { status: 200 }
    );
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
