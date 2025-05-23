import { getTokenData } from "@/lib/mongodb/action";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  id: z.string().min(1, "ID is required"),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validationResult = schema.safeParse(body);

  if (!validationResult.success) {
    return NextResponse.json(
      { error: validationResult.error.errors.map((e) => e.message).join(", ") },
      { status: 400 }
    );
  }

  try {
    const tokenData = await getTokenData(body.id);
    if (!tokenData) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }

    return NextResponse.json(tokenData.email, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
