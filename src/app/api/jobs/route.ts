import { createClientServer } from "@/lib/supabase/supabase";
import { NextRequest, NextResponse } from "next/server";
import { JobApplicants, JobListing } from "@/types/schema";
import { find } from "@/lib/supabase/action";
import jwt from "jsonwebtoken";
import { JWT } from "@/types/types";

// Usage: GET /api/jobs?page=1&limit=10
export async function GET(request: NextRequest) {
  const page = parseInt(request.nextUrl.searchParams.get("page") || "1", 10);
  const limit = parseInt(
    request.nextUrl.searchParams.get("limit") || "100",
    10
  );
  const offset = (page - 1) * limit;

  const token = request.cookies.get("token")?.value;
  const supabaseClient = await createClientServer(1, true);

  const { data, error } = await find<JobListing>(supabaseClient, "job_listings")
    .many()
    .range(offset, offset + limit - 1)
    .order("created_at", { ascending: false })
    .execute();

  let appliedJobs: JobApplicants[] = [];

  if (token) {
    const { id: userId } = jwt.verify(token, process.env.JWT_SECRET!) as JWT;
    const { data: appliedData, error: appliedError } =
      await find<JobApplicants>(
        supabaseClient,
        "job_applicants",
        "user_id",
        userId
      )
        .many()
        .execute();

    if (appliedError) {
      return NextResponse.json(
        { error: "Failed to fetch applied jobs" },
        { status: 500 }
      );
    } else {
      appliedJobs = appliedData || [];
    }
  }

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch job listings" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Success",
    status: 200,
    data:
      data?.map((item) => ({
        id: item.id,
        title: item.title,
        created_at: item.created_at,
        is_fulltime: item.is_fulltime,
        location: item.location,
        applied: appliedJobs.some(
          (applied) => applied.joblisting_id === item.id
        ),
      })) || [],
  });
}
