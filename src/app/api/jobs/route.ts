import { createClientServer } from "@/lib/supabase/supabase";
import { NextRequest, NextResponse } from "next/server";
import { JobListing } from "@/types/schema";
import { find } from "@/lib/supabase/action";

// Usage: GET /api/jobs?page=1&limit=10
export async function GET(request: NextRequest) {
  const page = parseInt(request.nextUrl.searchParams.get("page") || "1", 10);
  const limit = parseInt(
    request.nextUrl.searchParams.get("limit") || "100",
    10
  );
  const offset = (page - 1) * limit;

  const { data, error } = await find<JobListing>(
    await createClientServer(1, true),
    "job_listings"
  )
    .many()
    .range(offset, offset + limit - 1)
    .order("created_at", { ascending: false })
    .execute();

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
      })) || [],
  });
}
