import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { createClientServer } from "@/lib/supabase/supabase";
import {
  deleteTable,
  find,
  findWithJoin,
  insertTable,
  updateTable,
} from "@/lib/supabase/action";
import { JobApplicants, JobListing, Admin } from "@/types/schema";
import { jobListingSchema } from "@/lib/schemas/";
import { JWT } from "@/types/types";
import { deleteDocument } from "@/lib/mongodb/action";

export async function POST(request: NextRequest) {
  const { id: userId, isAdmin } = jwt.verify(
    request.cookies.get("token")!.value,
    process.env.JWT_SECRET!
  ) as JWT;

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const parsedData = jobListingSchema.safeParse(await request.json());

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

  const { data: tagRows, error: tagError } = await supabase
    .from("tags")
    .upsert(
      Array.from(new Set(parsedData.data.tags?.map((tag) => tag.title))).map(
        (name) => ({ name })
      ),
      { onConflict: "slug" }
    )
    .select("id, name");

  if (tagError) {
    await deleteTable(supabase, "job_listings", "id", insertedData[0].id);
    return NextResponse.json(
      { error: "Failed to create job listings" },
      { status: 500 }
    );
  }

  const { error: errorLink } = await supabase.from("job_tags").insert(
    tagRows.map((t) => ({
      joblisting_id: insertedData[0].id,
      tag_id: t.id,
    }))
  );

  if (errorLink) {
    await deleteTable(supabase, "job_listings", "id", insertedData[0].id);
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
  const limit = parseInt(
    request.nextUrl.searchParams.get("limit") || "100",
    10
  );

  const offset =
    (parseInt(request.nextUrl.searchParams.get("page") || "1", 10) - 1) * limit;

  const { id: userId } = jwt.verify(
    request.cookies.get("token")!.value,
    process.env.JWT_SECRET!
  ) as {
    id: string;
  };

  const supabase = await createClientServer(1, true);

  const { data: adminData } = await find<Admin>(supabase, "admins", [
    { column: "user_id", value: userId },
  ]).single();

  if (adminData) {
    const [themResults, allResults] = await Promise.all([
      find<JobListing>(supabase, "job_listings", [
        { column: "created_by", value: userId },
      ])
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
    const { data: appliedData, error: appliedError } = await findWithJoin<
      JobApplicants & { job_listings: JobListing }
    >(supabase, "job_applicants", {
      foreignTable: "job_listings",
      foreignKey: "joblisting_id",
      fields: "title",
    })
      .many()
      .execute();

    if (appliedError) {
      return NextResponse.json(
        { error: "Failed to fetch applied jobs" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Success",
      status: 200,
      data: appliedData?.map((item) => ({
        ...item,
        ...item.job_listings,
        job_listings: undefined,
      })),
    });
  }
}

export async function DELETE(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
  }

  const { isAdmin } = jwt.verify(
    request.cookies.get("token")!.value,
    process.env.JWT_SECRET!
  ) as JWT;

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const supabase = await createClientServer(1, true);
  const { error } = await deleteTable(supabase, "job_listings", "id", jobId);

  if (error) {
    return NextResponse.json(
      { error: "Failed to delete job listing" },
      { status: 500 }
    );
  }

  await deleteDocument("ai-driven-recruitment", "scored_candidates", {
    job_id: jobId,
  }).many();

  return NextResponse.json({ message: "Job listing deleted successfully" });
}

export async function PUT(request: NextRequest) {
  const { isAdmin } = jwt.verify(
    request.cookies.get("token")!.value,
    process.env.JWT_SECRET!
  ) as JWT;

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const jobId = request.nextUrl.searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
  }

  const parsedData = jobListingSchema.safeParse(await request.json());
  if (!parsedData.success) {
    return NextResponse.json(
      { error: parsedData.error.format() },
      { status: 422 }
    );
  }

  const supabase = await createClientServer(1, true);

  await Promise.all([
    deleteTable(supabase, "jl_qualifications", "joblisting_id", jobId),
    deleteTable(supabase, "jl_requirements", "joblisting_id", jobId),
  ]);

  const promises = await Promise.all([
    updateTable(supabase, "job_listings", "id", jobId, {
      title: parsedData.data.title,
      location: parsedData.data.location,
      is_fulltime: parsedData.data.isFullTime,
    }),
    ...(parsedData.data.qualifications?.map((qualification) =>
      insertTable(supabase, "jl_qualifications", {
        joblisting_id: jobId,
        qualification: qualification.title,
      })
    ) || []),
    ...(parsedData.data.requirements?.map((requirement) =>
      insertTable(supabase, "jl_requirements", {
        joblisting_id: jobId,
        requirement: requirement.title,
      })
    ) || []),
  ]);

  if (promises.some((promise) => promise.error)) {
    return NextResponse.json(
      { error: "Failed to update job listing" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Job listing updated successfully" },
    { status: 200 }
  );
}
