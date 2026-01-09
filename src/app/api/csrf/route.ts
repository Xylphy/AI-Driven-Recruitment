import { NextResponse } from "next/server";
import { generateCsrfToken } from "@/lib/csrf";

export async function GET() {
	return NextResponse.json({
		csrfToken: await generateCsrfToken(),
	});
}
