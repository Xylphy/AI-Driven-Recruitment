import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { JWT } from "@/types/types";
import { findOne } from "@/lib/mongodb/action";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
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

  const [parsedResume, score, transcribed] = await Promise.all([
    findOne("ai-driven-recruitment", "parsed_resume", {
      user_id: userId,
    }),
    findOne("ai-driven-recruitment", "scored_candidates", {
      user_id: userId,
    }),
    findOne("ai-driven-recruitment", "transcribed", {
      user_id: userId,
    }),
  ]);

  console.log("Parsed Resume:", parsedResume);
  console.log("Score:", score);
  console.log("Transcribed:", transcribed);

  return NextResponse.json({
    message: "Candidate profile retrieved successfully",
  });
}
