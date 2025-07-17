import { createClientServer } from "@/lib/supabase/supabase";
import { NextRequest, NextResponse } from "next/server";
import { JWT } from "@/types/types";
import jwt from "jsonwebtoken";
import { insertTable } from "@/lib/supabase/action";

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
    console.log("Error inserting job application:", error);
    return NextResponse.json(
      { error: "Failed to apply for the job" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Application submitted successfully",
  });
}
