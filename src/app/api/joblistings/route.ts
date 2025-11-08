import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { createClientServer } from "@/lib/supabase/supabase";
import { deleteRow, insertTable, updateTable } from "@/lib/supabase/action";
import { jobListingSchema } from "@/lib/schemas/";
import { JWT } from "@/types/types";
import { z } from "zod";

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
      { error: z.treeifyError(parsedData.error) },
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
    await deleteRow(supabase, "job_listings", "id", insertedData[0].id);
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
    await deleteRow(supabase, "job_listings", "id", insertedData[0].id);
    return NextResponse.json(
      { error: "Failed to create job listings" },
      { status: 500 }
    );
  }

  const results = await Promise.all([
    ...(parsedData.data.qualifications || []).map((qualification) =>
      insertTable(supabase, "jl_qualifications", {
        joblisting_id: insertedData[0].id,
        qualification: qualification.title,
      })
    ),
    ...(parsedData.data.requirements || []).map((requirement) =>
      insertTable(supabase, "jl_requirements", {
        joblisting_id: insertedData[0].id,
        requirement: requirement.title,
      })
    ),
  ]);

  if (results.some((result) => result.error)) {
    await deleteRow(supabase, "job_listings", "id", insertedData[0].id);
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
