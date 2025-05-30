import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClientServer } from "@/lib/supabase/supabase";
import { ObjectId } from "mongodb";
import {
  insertTable,
  deleteOne as supabaseDeleteOne,
} from "@/lib/supabase/action";
import { EducationalDetail, JobExperience, SocialLink } from "@/types/types";
import { deleteOne, findOne } from "@/lib/mongodb/action";
import { ErrorResponse } from "@/types/classes";
import jwt from "jsonwebtoken";
import { find } from "@/lib/supabase/action";
import {
  EducationalDetails,
  JobExperiences,
  Skills,
  SocialLinks,
  User,
} from "@/types/schema";
import { getFileInfo } from "@/lib/cloudinary/cloudinary";

// This function handles the POST request to set the password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = z
      .object({
        password: z
          .string()
          .min(8, "Password must be at least 8 characters long"),
        confirmPassword: z
          .string()
          .min(8, "Password must be at least 8 characters long"),
        token: z.string().min(1, "Token is required"),
        uid: z.string().min(1, "User ID is required"),
      })
      .safeParse(body);
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
      first_name: data.firstName,
      last_name: data.lastName,
      phone_number: data.mobileNumber,
      prefix: data.prefix,
      firebase_uid: body.uid,
      resume_id: data.public_id,
      country_code: data.countryCode,
      street: data.street,
      zip: data.zip,
      city: data.city,
      state: data.state_,
      country: data.country,
      job_title: data.jobTitle,
    } as User);

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
    const skills = data.skillSet ? data.skillSet.split(",") : []; // Split skills by comma

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
      supabaseDeleteOne(supabase, "users", "id", userId.toString());
      return NextResponse.json(
        { error: "Something wrong saving data" },
        { status: 500 }
      );
    }

    await deleteOne("ai-driven-recruitment", "verification_tokens", {
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

export async function GET(request: NextRequest) {
  const tokenCookie = request.cookies.get("token");
  const doUser = request.nextUrl.searchParams.get("user") === "true";
  const doSkills = request.nextUrl.searchParams.get("skills") === "true";
  const doSocialLinks =
    request.nextUrl.searchParams.get("socialLinks") === "true";
  const doEducation = request.nextUrl.searchParams.get("education") === "true";
  const doExperience =
    request.nextUrl.searchParams.get("experience") === "true";

  if (!tokenCookie || !tokenCookie.value) {
    return NextResponse.json({
      message: "Token not found",
      status: 401,
    });
  }

  const decoded = jwt.verify(
    tokenCookie.value,
    process.env.JWT_SECRET as string
  ) as jwt.JwtPayload;
  const supabase = await createClientServer(1, true);

  const [userData, skillsData, socialLinksData, educationData, experienceData] =
    await Promise.all([
      doUser && find<User>(supabase, "users", "id", decoded.id).single(),
      doSkills &&
        find<Skills>(supabase, "skills", "user_id", decoded.id)
          .many()
          .execute(),
      doSocialLinks &&
        find<SocialLinks>(supabase, "social_links", "user_id", decoded.id)
          .many()
          .execute(),
      doEducation &&
        find<EducationalDetails>(
          supabase,
          "educational_details",
          "user_id",
          decoded.id
        )
          .many()
          .execute(),
      doExperience &&
        find<JobExperiences>(supabase, "job_experiences", "user_id", decoded.id)
          .many()
          .execute(),
    ]);

  if (
    [userData, skillsData, socialLinksData, educationData, experienceData].some(
      (data) =>
        data && typeof data === "object" && "error" in data && data.error
    )
  ) {
    return NextResponse.json({
      message: "Data retrieval error",
      status: 404,
    });
  }

  return NextResponse.json({
    message: "Success",
    status: 200,
    data: {
      user: userData
        ? {
            ...userData.data,
            id: undefined,
            resume_id:
              userData.data?.resume_id &&
              (await getFileInfo(userData.data.resume_id)).url.split(
                "resumes/"
              )[1],
          }
        : null,
      admin: decoded.isAdmin,
      skills: skillsData ? skillsData.data?.map((skill) => skill.skill) : [],
      socialLinks: socialLinksData
        ? socialLinksData.data?.map((link) => link.link)
        : [],
      education: educationData
        ? educationData.data?.map((education) => ({
            ...education,
            id: undefined,
            user_id: undefined,
          }))
        : [],
      experience: experienceData
        ? experienceData.data?.map((experience) => ({
            ...experience,
            id: undefined,
            user_id: undefined,
          }))
        : [],
    },
  });
}

// export async function PUT(request: NextRequest) {}
