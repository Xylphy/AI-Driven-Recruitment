import { NextResponse } from "next/server";
import { uploadFile } from "@/lib/cloudinary/cloudinary";
import { filesSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  const formData = await request.formData();

  const validatedData = filesSchema.safeParse({
    transcript: formData.get("transcript"),
    resume: formData.get("resume"),
  });

  if (!validatedData.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid file upload data",
        errors: validatedData.error,
      },
      { status: 400 },
    );
  }

  const folder = `applications/${new Date().toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/\//g, "-")}`;

  const [resumeURL, transcriptURL] = await Promise.all([
    validatedData.data.resume
      ? uploadFile(validatedData.data.resume, folder)
      : Promise.resolve(null),
    validatedData.data.transcript
      ? uploadFile(validatedData.data.transcript, folder)
      : Promise.resolve(null),
  ]);

  return NextResponse.json({
    success: true,
    resumeURL,
    transcriptURL,
  });
}
