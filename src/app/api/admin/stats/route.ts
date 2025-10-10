import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { JWT } from "@/types/types";
import { createClientServer } from "@/lib/supabase/supabase";
import { countTable, find } from "@/lib/supabase/action";
import { ActiveJob, WeeklyCumulativeApplicants } from "@/types/schema";

/**
 * Admin Stats API
 *
 * @param request NextRequest object
 * @returns json response of number of total jobs, total candidates, active jobs, and shortlisted candidates
 */
export async function GET(request: NextRequest) {
  const { isAdmin } = jwt.verify(
    request.cookies.get("token")!.value,
    process.env.JWT_SECRET!
  ) as JWT;

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const supabase = await createClientServer(1, true);

  const { data: dailyActiveJobs, error: dailyActiveJobsError } =
    await find<ActiveJob>(supabase, "daily_active_jobs_last_7_days")
      .many()
      .execute();

  if (dailyActiveJobsError) {
    return NextResponse.json(
      {
        error:
          dailyActiveJobsError?.message || "Failed to fetch daily active jobs",
      },
      { status: 500 }
    );
  }

  const { data: totalCandidates, error: totalCandidatesError } =
    await countTable(supabase, "job_applicants");

  if (totalCandidatesError) {
    return NextResponse.json(
      {
        error:
          totalCandidatesError.message || "Failed to fetch total candidates",
      },
      { status: 500 }
    );
  }

  const { data: weeklyApplicants, error: weeklyApplicantsError } =
    await find<WeeklyCumulativeApplicants>(
      supabase,
      "weekly_applicants_last_4_weeks"
    )
      .many()
      .execute();

  if (weeklyApplicantsError) {
    return NextResponse.json(
      {
        error:
          weeklyApplicantsError.message || "Failed to fetch weekly applicants",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    activeJobs: dailyActiveJobs!.at(-1)?.jobs || 0,
    totalJobs: dailyActiveJobs!.at(-1)?.jobs || 0,
    totalCandidates: totalCandidates || 0,
    jobActivity: dailyActiveJobs,
    shortListed: 0,
    candidateGrowth: weeklyApplicants,
  });
}
