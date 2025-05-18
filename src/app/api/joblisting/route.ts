import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import z from "zod";
import { createClientServer } from "@/app/lib/supabase/supabase";
import { deleteOne, insertTable } from "@/app/lib/supabase/action";

const identifiableTitleSchema = z.object({
  id: z.string().or(z.number()),
  title: z.string(),
});

const jobListingSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  qualifications: z.array(identifiableTitleSchema).optional(),
  requirements: z.array(identifiableTitleSchema).optional(),
  location: z.enum(["Cebu City", "Manila", "Tokyo"]),
});

export async function POST(request: NextRequest) {
  const token = request.cookies.get("token")!;

  const { isAdmin, id: userId } = jwt.verify(
    token.value,
    process.env.JWT_SECRET!
  ) as {
    isAdmin: boolean;
    id: string;
  };

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
    await deleteOne(supabase, "job_listings", "id", insertedData[0].id);
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
