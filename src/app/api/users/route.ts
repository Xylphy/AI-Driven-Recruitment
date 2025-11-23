import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/supabase";
import { ObjectId } from "mongodb";
import {
  deleteRow,
  insertTable,
  updateTable,
  find,
} from "@/lib/supabase/action";
import {
  EducationalDetail,
  JobExperience,
  SocialLink,
  JWT,
} from "@/types/types";
import { deleteDocument, findOne } from "@/lib/mongodb/action";
import { ErrorResponse } from "@/types/classes";
import jwt from "jsonwebtoken";
import { User } from "@/types/schema";
import { deleteFile, uploadFile } from "@/lib/cloudinary/cloudinary";
import { userSchema, verificationSchema } from "@/lib/schemas";
import { parseFormData } from "@/lib/library";
import mongoDb_client from "@/lib/mongodb/mongodb";
import { z } from "zod";

// This function handles the POST request to set the password
export async function POST(request: NextRequest) {
  try {
    const validatedData = verificationSchema.safeParse(await request.json());
    if (!validatedData.success) {
      return NextResponse.json(
        { error: z.treeifyError(validatedData.error) },
        { status: 400 }
      );
    }

    if (validatedData.data.password !== validatedData.data.confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    await mongoDb_client.connect();

    const data = await findOne("ai-driven-recruitment", "verification_tokens", {
      _id: ObjectId.createFromHexString(validatedData.data.token),
    });

    if (!data) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    const supabase = await createClientServer(1, true);

    const { data: insertedData, error } = await insertTable(supabase, "users", {
      first_name: data.firstName,
      last_name: data.lastName,
      phone_number: data.mobileNumber,
      prefix: data.prefix,
      firebase_uid: validatedData.data.uid,
      resume_id: data.resumeId,
      transcript_id: data.transcriptId,
      country_code: data.countryCode,
      street: data.street,
      zip: data.zip,
      city: data.city,
      state: data.state_,
      country: data.country,
      job_title: data.jobTitle,
    } as User);

    if (error || !insertedData || !insertedData[0] || !insertedData[0].id) {
      console.error("Error inserting user into Supabase:", error);
      return NextResponse.json(
        { error: "Failed to insert user into Supabase" },
        { status: 500 }
      );
    }

    const resumeParserURL = new URL("http://localhost:8000/parseresume/");
    resumeParserURL.searchParams.set("public_id", data.resumeId);
    resumeParserURL.searchParams.set(
      "applicant_id",
      insertedData[0].id.toString()
    );

    const transcribeURL = new URL("http://localhost:8000/transcribe/");
    transcribeURL.searchParams.set("public_id", data.transcriptId);
    transcribeURL.searchParams.set(
      "applicant_id",
      insertedData[0].id.toString()
    );

    fetch(resumeParserURL.toString(), {
      method: "POST",
    }).catch((err) => {
      console.error("Error calling resume parser:", err);
    });

    fetch(transcribeURL.toString(), {
      method: "POST",
    }).catch((err) => {
      console.error("Error calling transcribe service:", err);
    });

    const userId = insertedData[0].id;
    const skills = data.skillSet?.split(",") || [];

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
      ...skills.map((skill: string) =>
        insertTable(supabase, "skills", {
          user_id: userId,
          skill: skill.trim(),
        })
      ),
    ]);

    if (results.some((result) => result.error)) {
      deleteRow(supabase, "users", "id", userId.toString());
      return NextResponse.json(
        { error: "Something wrong saving data" },
        { status: 500 }
      );
    }

    await deleteDocument("ai-driven-recruitment", "verification_tokens", {
      _id: ObjectId.createFromHexString(validatedData.data.token),
    }).single();

    await mongoDb_client.close();

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

        return await updateTable(supabase, "users", "id", userId, {
          resume_id: resumeId,
        });
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
          validatedData.data!.video!,
          "transcripts"
        );
        const link = new URL("http://localhost:8000/transcribe/");
        link.searchParams.set("public_id", transcriptId);
        link.searchParams.set("applicant_id", userId.toString());

        fetch(link.toString(), { method: "POST" });

        return await updateTable(supabase, "users", "id", userId, {
          transcript_id: transcriptId,
        });
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
    updateTable(supabase, "users", "id", userId, {
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
    }),
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
