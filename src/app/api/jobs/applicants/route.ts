import { createClientServer } from "@/lib/supabase/supabase";
import { NextRequest, NextResponse } from "next/server";
import { JWT } from "@/types/types";
import jwt from "jsonwebtoken";
import { insertTable, findWithJoin, find } from "@/lib/supabase/action";
import auth from "@/lib/firebase/admin";
import { JobApplicants, User } from "@/types/schema";

// API for applying for a job
export async function POST(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const { id: userId, isAdmin } = jwt.verify(
    token,
    process.env.JWT_SECRET!
  ) as JWT;

  if (isAdmin) {
    return NextResponse.json(
      { error: "Admins cannot apply for jobs" },
      { status: 403 }
    );
  }

  const { jobId } = await request.json();

  const { error } = await insertTable(
    await createClientServer(1, true),
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

  return NextResponse.json({
    message: "Application submitted successfully",
  });
}

export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
  }

  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const { isAdmin } = jwt.verify(token, process.env.JWT_SECRET!) as JWT;

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
