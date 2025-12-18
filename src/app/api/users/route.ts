import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/supabase";
import {
  deleteRow,
  insertTable,
  updateTable,
  find,
} from "@/lib/supabase/action";
import { JWT } from "@/types/types";
import jwt from "jsonwebtoken";
import { User } from "@/types/schema";
import { deleteFile, uploadFile } from "@/lib/cloudinary/cloudinary";
import { userSchema } from "@/lib/schemas";
import { parseFormData } from "@/lib/library";
import { z } from "zod";

export async function PUT(request: NextRequest) {
  const formData = await request.formData();

  const tokenCookie = request.cookies.get("token");
  if (!tokenCookie) {
    return NextResponse.json(
      { error: "Unauthorized request" },
      { status: 401 }
    );
  }

  const { id: userId } = jwt.verify(
    tokenCookie.value,
    process.env.JWT_SECRET as string
  ) as JWT;

  const validatedData = userSchema.safeParse({
    ...parseFormData(formData, [
      "educationalDetails",
      "jobExperiences",
      "socialLinks",
    ]),
    ...(formData.get("resume") &&
      (formData.get("resume") as File).size > 0 && {
        resume: formData.get("resume") as File,
      }),
    ...(formData.get("video") &&
      (formData.get("video") as File).size > 0 && {
        video: formData.get("video") as File,
      }),
  });

  if (!validatedData.success) {
    return NextResponse.json(
      { error: z.treeifyError(validatedData.error) },
      { status: 400 }
    );
  }

  const supabase = await createClientServer(1, true);
  const { data: userData, error: userError } = await find<User>(
    supabase,
    "users",
    [{ column: "id", value: userId }]
  ).single();

  if (userError || !userData) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const promises = [];

  if (validatedData.data.resume) {
    if (userData!.resume_id) {
      promises.push(deleteFile(userData!.resume_id));
    }

    promises.push(
      (async () => {
        const resumeId = await uploadFile(
          validatedData.data!.resume!,
          "resumes"
        );
        const link = new URL("http://localhost:8000/parseresume/");
        link.searchParams.set("public_id", resumeId);
        link.searchParams.set("applicant_id", userId.toString());

        fetch(link.toString(), { method: "POST" });

        return await updateTable(
          supabase,
          "users",
          {
            resume_id: resumeId,
          },
          [
            {
              column: "id",
              value: userId,
            },
          ]
        );
      })()
    );
  }

  if (validatedData.data.video) {
    if (userData.transcript_id) {
      promises.push(deleteFile(userData.transcript_id));
    }

    promises.push(
      (async () => {
        const transcriptId = await uploadFile(
          validatedData.data.video!,
          "transcripts"
        );
        const link = new URL("http://localhost:8000/transcribe/");
        link.searchParams.set("public_id", transcriptId);
        link.searchParams.set("applicant_id", userId.toString());

        fetch(link.toString(), { method: "POST" });

        return await updateTable(
          supabase,
          "users",
          {
            transcript_id: transcriptId,
          },
          [{ column: "id", value: userId }]
        );
      })()
    );
  }

  await Promise.all([
    deleteRow(supabase, "educational_details", "user_id", userId),
    deleteRow(supabase, "social_links", "user_id", userId),
    deleteRow(supabase, "job_experiences", "user_id", userId),
    deleteRow(supabase, "skills", "user_id", userId),
  ]);

  const validatedUserData = validatedData.data;

  // Warning: do not use ...object (include all data) since supabase doesn't insert if column doesn't exist
  promises.push(
    updateTable(
      supabase,
      "users",
      {
        first_name: validatedUserData.firstName,
        last_name: validatedUserData.lastName,
        phone_number: validatedUserData.mobileNumber,
        country_code: validatedUserData.countryCode,
        job_title: validatedUserData.jobTitle,
        prefix: validatedUserData.prefix,
        street: validatedUserData.street,
        zip: validatedUserData.zip,
        city: validatedUserData.city,
        state: validatedUserData.state,
        country: validatedUserData.country,
      },
      [{ column: "id", value: userId }]
    ),
    ...(validatedUserData.educationalDetails || []).map((educationalDetails) =>
      insertTable(supabase, "educational_details", {
        user_id: userId,
        currently_pursuing: educationalDetails.currentlyPursuing,
        start_month: educationalDetails.startMonth,
        start_year: educationalDetails.startYear,
        end_month: educationalDetails.endMonth,
        end_year: educationalDetails.endYear,
        degree: educationalDetails.degree,
        institute: educationalDetails.institute,
        major: educationalDetails.major,
      })
    ),
    ...(validatedUserData.socialLinks || []).map((socialLink) =>
      insertTable(supabase, "social_links", {
        user_id: userId,
        link: socialLink.value,
      })
    ),
    ...(validatedUserData.jobExperiences || []).map((jobExperience) =>
      insertTable(supabase, "job_experiences", {
        user_id: userId,
        currently_working: jobExperience.currentlyWorking,
        start_month: jobExperience.startMonth,
        start_year: jobExperience.startYear,
        end_month: jobExperience.endMonth,
        end_year: jobExperience.endYear,
        title: jobExperience.title,
        company: jobExperience.company,
        summary: jobExperience.summary,
      })
    ),
    ...(validatedData.data.skillSet || "").split(",").map((skill) =>
      insertTable(supabase, "skills", {
        user_id: userId,
        skill: skill.trim(),
      })
    )
  );

  try {
    const awaitedPromises = await Promise.all(promises);

    const hasErrors = awaitedPromises.some(
      (result) =>
        result &&
        typeof result === "object" &&
        "error" in result &&
        result.error
    );

    if (hasErrors) {
      return NextResponse.json(
        { error: "Error updating user data" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "User data updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PUT /api/users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
