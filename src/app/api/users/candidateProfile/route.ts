import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { JWT } from "@/types/types";
import { findOne } from "@/lib/mongodb/action";
import mongoDb_client from "@/lib/mongodb/mongodb";
import { find, updateTable } from "@/lib/supabase/action";
import { JobApplicants, User } from "@/types/schema";
import { createClientServer } from "@/lib/supabase/supabase";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  const scoreParam = request.nextUrl.searchParams.get("score") === "true";
  const transcribedParam =
    request.nextUrl.searchParams.get("transcribed") === "true";
  const resumeParam = request.nextUrl.searchParams.get("resume") === "true";

  const { isAdmin } = jwt.verify(
    request.cookies.get("token")!.value,
    process.env.JWT_SECRET!
  ) as JWT;

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!userId) {
    return NextResponse.json(
      { error: "Missing job_id or user_id" },
      { status: 400 }
    );
  }

  await mongoDb_client.connect();
  const supabaseClient = await createClientServer(1, true);

  const [parsedResume, score, transcribed, userData, status] =
    await Promise.all([
      resumeParam &&
        findOne("ai-driven-recruitment", "parsed_resume", {
          user_id: userId,
        }),
      scoreParam &&
        findOne("ai-driven-recruitment", "scored_candidates", {
          user_id: userId,
        }),
      transcribedParam &&
        findOne("ai-driven-recruitment", "transcribed", {
          user_id: userId,
        }),
      find<User>(supabaseClient, "users", "id", userId).single(),
      find<JobApplicants>(
        supabaseClient,
        "job_applicants",
        "user_id",
        userId
      ).single(),
    ]);

  await mongoDb_client.close();

  return NextResponse.json({
    parsedResume: parsedResume || null,
    score: score || null,
    transcribed: transcribed || null,
    user: {
      firstName: userData.data?.first_name || "",
      lastName: userData.data?.last_name || "",
    },
    status: status.data?.status || "",
  });
}

// For changing candidate status
export async function PUT(request: NextRequest) {
  const { isAdmin } = jwt.verify(
    request.cookies.get("token")!.value,
    process.env.JWT_SECRET!
  ) as JWT;

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();

  const { error } = await updateTable(
    await createClientServer(1, true),
    "job_applicants",
    "user_id",
    body.userId,
    {
      status: body.status,
    }
  );

  if (error) {
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Status updated successfully" },
    { status: 200 }
  );
}
