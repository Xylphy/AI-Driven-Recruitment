import {  NextResponse } from "next/server";

export async function GET() {
  // return middleware(request); // it blocks direct access to the API
  return NextResponse.json(
    { message: "Hello from the test API!" },
    { status: 200 }
  ); // not blocked
}
