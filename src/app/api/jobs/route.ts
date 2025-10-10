import { createClientServer } from "@/lib/supabase/supabase";
import { NextRequest, NextResponse } from "next/server";
import { JobListing } from "@/types/schema";
import { findWithJoin } from "@/lib/supabase/action";
import { IdentifiableItem } from "@/types/types";

// This API endpoint retrieves all job listings with pagination
// Usage: GET /api/jobs?page=1&limit=10  // Disabled pagination for now
export async function GET(request: NextRequest) {
  // const page = parseInt(request.nextUrl.searchParams.get("page") || "1", 10);
  // const limit = parseInt(
  //   request.nextUrl.searchParams.get("limit") || "100",
  //   10
  // );
  // const offset = (page - 1) * limit;
  const supabaseClient = await createClientServer(1, true);
  const { data, error } = await findWithJoin<
    JobListing & { job_applicants?: IdentifiableItem[] }
  >(supabaseClient, "job_listings", [
    {
      foreignTable: "job_applicants",
      foreignKey: "joblisting_id",
      fields: "id",
    },
  ])
    .many()
    .execute();

  if (error) {
    console.log("Error fetching job listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch job listings" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Success",
    status: 200,
    data: (data || []).map((item) => ({
      id: item.id,
      title: item.title,
      created_at: item.created_at,
      is_fulltime: item.is_fulltime,
      location: item.location,
      applicant_count: item.job_applicants?.length || 0,
    })),
  });
}
