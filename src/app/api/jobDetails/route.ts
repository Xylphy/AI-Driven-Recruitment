import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/app/lib/supabase/supabase";
import { find } from "@/app/lib/supabase/action";
import {
  JobListing,
  JobListingQualifications,
  JobListingRequirements,
} from "@/app/types/schema";

export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get("job");
  if (!jobId) {
    return new Response("Job ID is required", { status: 400 });
  }
  const supabase = await createClientServer(1, true);
  const { data: jobListing, error: errorJobListing } = await find<
    Omit<JobListing, "created_by">
  >(supabase, "job_listings", "id", jobId).single();

  if (errorJobListing || !jobListing) {
    return NextResponse.json(
      { error: "Failed to fetch job listing" },
      { status: 500 }
    );
  }

  const [qualifications, requirements] = await Promise.all([
    find<JobListingQualifications>(
      supabase,
      "jl_qualifications",
      "joblisting_id",
      jobId
    )
      .many()
      .execute(),
    find<JobListingRequirements>(
      supabase,
      "jl_requirements",
      "joblisting_id",
      jobId
    )
      .many()
      .execute(),
  ]);

  if (requirements.error || qualifications.error) {
    return NextResponse.json(
      { error: "Failed to fetch job listing details" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      ...jobListing,
      requirements: requirements.data?.map((item) => item.requirement) || [],
      qualifications:
        qualifications.data?.map((item) => item.qualification) || [],
    },
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
