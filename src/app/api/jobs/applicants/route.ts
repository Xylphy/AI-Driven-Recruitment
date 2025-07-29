import { createClientServer } from "@/lib/supabase/supabase";
import { NextRequest, NextResponse } from "next/server";
import { JobListing, JWT } from "@/types/types";
import jwt from "jsonwebtoken";
import { insertTable, findWithJoin, find } from "@/lib/supabase/action";
import auth from "@/lib/firebase/admin";
import { JobApplicants, User } from "@/types/schema";

// API for applying for a job
export async function POST(request: NextRequest) {
  const { id: userId, isAdmin } = jwt.verify(
    request.cookies.get("token")!.value,
    process.env.JWT_SECRET!
  ) as JWT;

  if (isAdmin) {
    return NextResponse.json(
      { error: "Admins cannot apply for jobs" },
      { status: 403 }
    );
  }

  const { jobId } = await request.json();
  if (!jobId) {
    return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
  }

  const supabaseClient = await createClientServer(1, true);

  const { data: existingApplicant, error: existingError } =
    await find<JobApplicants>(
      supabaseClient,
      "job_applicants",
      `user_id.eq.${userId},joblisting_id.eq.${jobId}`,
      undefined,
      "*"
    )
      .many()
      .execute();

  if (existingError) {
    return NextResponse.json(
      { error: "Failed to check existing applications" },
      { status: 500 }
    );
  }

  if (existingApplicant && existingApplicant.length > 0) {
    return NextResponse.json(
      { error: "You have already applied for this job" },
      { status: 409 }
    );
  }

  const { data: applicantsID, error } = await insertTable(
    supabaseClient,
    "job_applicants",
    {
      user_id: userId,
      joblisting_id: jobId,
    }
  );

  if (error) {
    return NextResponse.json(
      { error: "Failed to apply for the job" },
      { status: 500 }
    );
  }

  const scoreAPI = new URL("http://localhost:8000/score/");
  scoreAPI.searchParams.set("job_id", jobId);
  scoreAPI.searchParams.set("user_id", userId);
  scoreAPI.searchParams.set("applicant_id", applicantsID[0].id);

  fetch(scoreAPI.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return NextResponse.json({
    message: "Application submitted successfully",
  });
}

export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
  }

  const { isAdmin } = jwt.verify(
    request.cookies.get("token")!.value,
    process.env.JWT_SECRET!
  ) as JWT;

  if (!isAdmin) {
    return NextResponse.json(
      { error: "Users cannot view job applications" },
      { status: 403 }
    );
  }

  const supabaseClient = await createClientServer(1, true);
  const { data: applicantsWithUsers, error: errorApplicants } =
    await findWithJoin(supabaseClient, "job_applicants", {
      foreignTable: "users",
      foreignKey: "user_id",
      fields: "id, first_name, last_name, firebase_uid",
    })
      .many()
      .execute();

  if (errorApplicants) {
    return NextResponse.json(
      { error: "Failed to fetch job applications" },
      { status: 500 }
    );
  }

  const applicantWithEmail = await Promise.all(
    (
      (applicantsWithUsers || []) as Array<
        JobApplicants & {
          users: Pick<User, "id" | "last_name" | "first_name" | "firebase_uid">;
        }
      >
    ).map(async (applicant) => ({
      ...applicant,
      ...applicant.users,
      email: (await auth.getUser(applicant.users.firebase_uid)).email,
      users: undefined,
    }))
  );

  return NextResponse.json({
    message: "Success",
    data: applicantWithEmail.map((applicant) => ({
      id: applicant.id,
      name: applicant.first_name + " " + applicant.last_name,
      email: applicant.email,
    })),
  });
}
