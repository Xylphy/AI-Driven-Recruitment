import { NextRequest, NextResponse } from "next/server";
import { createClientServer } from "@/lib/supabase/supabase";
import { find, findWithJoin } from "@/lib/supabase/action";
import {
  JobListing,
  JobListingQualifications,
  JobListingRequirements,
  JobApplicants,
  JobTags,
} from "@/types/schema";
import { JWT } from "@/types/types";
import jwt from "jsonwebtoken";

/**
 * API route to fetch detailed information about a specific job listing.
 * @param request NextRequest with job ID as query parameter
 * @returns
 */
export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get("job");
  if (!jobId) {
    return new Response("Job ID is required", { status: 400 });
  }

  const supabase = await createClientServer(1, true);
  const { data: jobListing, error: errorJobListing } = await find<
    Omit<JobListing, "created_by">
  >(supabase, "job_listings", [{ column: "id", value: jobId }]).single();

  if (errorJobListing || !jobListing) {
    return NextResponse.json(
      { error: "Failed to fetch job listing" },
      { status: 500 }
    );
  }

  const qualificationsPromise = find<JobListingQualifications>(
    supabase,
    "jl_qualifications",
    [{ column: "joblisting_id", value: jobId }]
  )
    .many()
    .execute();

  const requirementsPromise = find<JobListingRequirements>(
    supabase,
    "jl_requirements",
    [{ column: "joblisting_id", value: jobId }]
  )
    .many()
    .execute();

  const tagsPromise = findWithJoin<JobTags & { tags: { name: string } }>(
    supabase,
    "job_tags",
    [
      {
        foreignTable: "tags",
        foreignKey: "tag_id",
        fields: "id, name",
      },
    ]
  )
    .many([{ column: "joblisting_id", value: jobId }])
    .execute();

  const token = request.cookies.get("token");
  let applicantCheckPromise;

  if (token) {
    const { id } = jwt.verify(
      token.value,
      process.env.JWT_SECRET as string
    ) as JWT;

    applicantCheckPromise = find<JobApplicants>(supabase, "job_applicants", [
      { column: "joblisting_id", value: jobId },
      { column: "user_id", value: id },
    ]).single();
  }

  const qualifications = await qualificationsPromise;
  const requirements = await requirementsPromise;
  const tags = await tagsPromise;

  if (qualifications.error || requirements.error || tags.error) {
    return NextResponse.json(
      { error: "Failed to fetch job listing details" },
      { status: 500 }
    );
  }

  const applicantCheck = await applicantCheckPromise;

  return NextResponse.json(
    {
      ...jobListing,
      requirements: requirements.data?.map((item) => item.requirement) || [],
      qualifications:
        qualifications.data?.map((item) => item.qualification) || [],
      isApplicant: !!applicantCheck?.data,
      tags: (tags.data || []).map((item) => item.tags.name),
    },
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
