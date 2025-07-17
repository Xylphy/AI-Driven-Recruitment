import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { createClientServer } from "@/lib/supabase/supabase";
import { deleteTable, find, insertTable } from "@/lib/supabase/action";
import { JobApplicants, JobListing, User, Admin } from "@/types/schema";
import { jobListingSchema } from "@/lib/schemas/";
import { JWT } from "@/types/types";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("token")!;

  const { id: userId, isAdmin } = jwt.verify(
    token.value,
    process.env.JWT_SECRET!
  ) as JWT;

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const parsedData = jobListingSchema.safeParse(await request.json()); // Parse without throwing an error unlike .parse()

  if (!parsedData.success) {
    return NextResponse.json(
      { error: parsedData.error.format() },
      { status: 422 }
    );
  }

  const supabase = await createClientServer(1, true);
  const { data: insertedData, error: insertedError } = await insertTable(
    supabase,
    "job_listings",
    {
      title: parsedData.data.title,
      location: parsedData.data.location,
      created_by: userId,
      is_fulltime: parsedData.data.isFullTime,
    }
  );

  if (insertedError) {
    return NextResponse.json(
      { error: "Failed to create job listings" },
      { status: 500 }
    );
  }

  const results = await Promise.all([
    ...(parsedData.data.qualifications?.map((qualification) =>
      insertTable(supabase, "jl_qualifications", {
        joblisting_id: insertedData[0].id,
        qualification: qualification.title,
      })
    ) || []),
    ...(parsedData.data.requirements?.map((requirement) =>
      insertTable(supabase, "jl_requirements", {
        joblisting_id: insertedData[0].id,
        requirement: requirement.title,
      })
    ) || []),
  ]);

  if (results.some((result) => result.error)) {
    await deleteTable(supabase, "job_listings", "id", insertedData[0].id);
    return NextResponse.json(
      { error: "Failed to create job listings" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: "Success",
    status: 401,
  });
}

// Admin: Get all their created joblistings or created by others
// User: Get all applied joblistings
// Usage: GET /api/joblistings?page=1&limit=10
export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")!;
  const page = parseInt(request.nextUrl.searchParams.get("page") || "1", 10);
  const limit = parseInt(
    request.nextUrl.searchParams.get("limit") || "100",
    10
  );

  const offset = (page - 1) * limit;

  const { id: userId } = jwt.verify(token.value, process.env.JWT_SECRET!) as {
    id: string;
  };

  const supabase = await createClientServer(1, true);

  const { data: adminData } = await find<Admin>(
    supabase,
    "admins",
    "user_id",
    userId
  ).single();

  if (adminData) {
    const [themResults, allResults] = await Promise.all([
      find<JobListing>(supabase, "job_listings", "created_by", userId)
        .many()
        .range(offset, offset + limit - 1)
        .order("created_at", { ascending: false })
        .execute(),
      find<JobListing>(supabase, "job_listings")
        .many()
        .range(offset, offset + limit - 1)
        .order("created_at", { ascending: false })
        .execute(),
    ]);

    if (themResults.error || allResults.error) {
      return NextResponse.json(
        { error: "Failed to fetch job listings" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Success",
      status: 200,
      data: {
        createdByThem:
          themResults.data?.map((item) => ({
            id: item.id,
            title: item.title,
            created_at: item.created_at,
          })) || [],
        createdByAll:
          allResults.data?.map((item) => ({
            id: item.id,
            title: item.title,
            created_at: item.created_at,
          })) || [],
      },
    });
  } else {
    const { data: jobApplied, error: jobAppliedError } = await find<
      JobApplicants & {
        job_listings: JobListing & {
          created_by: User;
        };
      }
    >(
      supabase,
      "job_applicants",
      "user_id",
      userId,
      "job_listings:joblisting_id(*, created_by:created_by(*, users!admins_user_id_fkey(*)))"
    )
      .many()
      .range(offset, offset + limit - 1)
      .order("created_at", {
        ascending: false,
      })
      .execute();

    if (jobAppliedError) {
      return NextResponse.json(
        { error: "Failed to fetch job listings" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Success",
      status: 200,
      data: {
        jobApplied:
          jobApplied?.map((item) => ({
            id: item.job_listings.id,
            title: item.job_listings.title,
            created_at: item.job_listings.created_at,
          })) || [],
      },
    });
  }
}
