import { NextRequest, NextResponse } from "next/server";
import { userSchema } from "@/lib/schemas";
import { parseFormData } from "@/lib/library";
import { sendEmailVerification } from "@/lib/firebase/action";
import { uploadFile } from "@/lib/cloudinary/cloudinary";

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const validatedData = userSchema.safeParse({
    ...parseFormData(formData, [
      "educationalDetails",
      "jobExperiences",
      "socialLinks",
    ]),
    ...(formData.get("resume") &&
      (formData.get("resume") as File).size > 0 && {
        resume: formData.get("resume") as File,
      }),
    ...(formData.get("video") &&
      (formData.get("video") as File).size > 0 && {
        video: formData.get("video") as File,
      }),
  });

  if (!validatedData.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid form data",
        errors: validatedData.error,
      },
      { status: 400 }
    );
  }

  try {
    const resumeFile = validatedData.data.resume;
    const transcriptFile = validatedData.data.video;
    let resume_id = undefined;
    let transcript_id = undefined;

    if (resumeFile) {
      resume_id = await uploadFile(resumeFile, "resumes");
    }

    if (transcriptFile) {
      transcript_id = await uploadFile(transcriptFile, "transcripts");
    }

    delete validatedData.data.resume;
    delete validatedData.data.video;

    await sendEmailVerification({
      ...validatedData.data,
      resumeId: resume_id,
      state_: validatedData.data.state,
      transcriptId: transcript_id,
    });

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : `Failed to create account`,
      },
      { status: 500 }
    );
  }
}
