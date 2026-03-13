import jwt from "jsonwebtoken";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { EVALUATION_STATUS_LIST, FILE_SIZE_LIMIT } from "@/lib/constants";
import { jwtSchema } from "@/lib/schemas/user";
import { deleteFile, uploadFile } from "@/lib/supabase/action";
import { createClientServer } from "@/lib/supabase/supabase";

const staffEvaluationSchema = z.object({
  score: z.coerce.number().min(0).max(5),
  applicantId: z.uuid(),
  summary: z.string().trim().min(1),
  keyHighlights: z.string().trim().min(1),
  evaluationFile: z
    .instanceof(File)
    .refine(
      (file) => file.size <= FILE_SIZE_LIMIT,
      "Evaluation file must be smaller than 10MB",
    )
    .refine(
      (file) =>
        [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(file.type),
      "Evaluation file must be a PDF or Word document (.doc/.docx)",
    )
    .optional(),
});

export async function POST(request: NextRequest) {
  const formData = await request.formData();

  const parsedJWT = jwtSchema.safeParse(
    jwt.verify(
      request.cookies.get("token")?.value || "",
      // biome-ignore lint/style/noNonNullAssertion: We want this to throw if the token is missing or invalid, which will be caught by the safeParse and return an error response.
      process.env.JWT_SECRET!,
    ),
  );

  if (!parsedJWT.success) {
    console.error(parsedJWT.error);
    return NextResponse.json(
      {
        success: false,
        message: "Unauthorized",
      },
      { status: 401 },
    );
  }

  const evaluationFileInput = formData.get("evaluationFile");
  const normalizedEvaluationFile =
    evaluationFileInput instanceof File && evaluationFileInput.size > 0
      ? evaluationFileInput
      : undefined;

  const parsedData = staffEvaluationSchema.safeParse({
    score: formData.get("score"),
    applicantId: formData.get("applicantId"),
    summary: formData.get("summary"),
    keyHighlights: formData.get("keyHighlights"),
    evaluationFile: normalizedEvaluationFile,
  });

  if (!parsedData.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid input data",
        errors: parsedData.error,
      },
      { status: 400 },
    );
  }

  const supabase = await createClientServer(true);

  const evaluationFilePath = parsedData.data.evaluationFile
    ? await uploadFile(
        parsedData.data.evaluationFile,
        undefined,
        "staff_evaluations",
      )
    : null;

  const { data: applicant, error: applicantError } = await supabase
    .from("applicants")
    .select("status")
    .eq("id", parsedData.data.applicantId)
    .single();

  if (applicantError || !applicant) {
    console.error(`Applicant ${parsedData.data.applicantId} not found`);
    return NextResponse.json(
      {
        success: false,
        message: "Applicant not found",
      },
      { status: 404 },
    );
  }

  if (!EVALUATION_STATUS_LIST.includes(applicant.status)) {
    return NextResponse.json(
      {
        success: false,
        message: `Cannot submit evaluation for applicant with status ${applicant.status}`,
      },
      { status: 400 },
    );
  }

  const { data: hrReport, error: hrReportError } = await supabase
    .from("hr_reports")
    .insert({
      score: parsedData.data.score,
      applicant_id: parsedData.data.applicantId,
      summary: parsedData.data.summary,
      staff_id: parsedJWT.data.id,
      file_pathname: evaluationFilePath,
      candidate_status: applicant.status,
    })
    .select("id")
    .single();

  if (hrReportError) {
    console.error("Error inserting HR Report:", hrReportError);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to submit HR report",
      },
      { status: 500 },
    );
  }

  const { error: keyHighlightError } = await supabase
    .from("key_highlights")
    .insert(
      parsedData.data.keyHighlights
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean)
        .map((highlight) => ({
          report_id: hrReport.id,
          highlight,
        })),
    );

  if (keyHighlightError) {
    console.error("Error inserting Key Highlights:", keyHighlightError);

    const [_, fileDeleteError] = await Promise.all([
      supabase.from("hr_reports").delete().eq("id", hrReport.id),
      evaluationFilePath
        ? deleteFile({
            bucket: "staff_evaluations",
            path: evaluationFilePath,
          })
        : Promise.resolve(),
    ]);

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to submit key highlights" +
          (fileDeleteError ? " and failed to clean up evaluation file" : ""),
      },
      { status: 500 },
    );
  }

  const { error: insertLogError } = await supabase.from("audit_logs").insert({
    actor_type: parsedJWT.data.role,
    actor_id: parsedJWT.data.id,
    action: "create",
    event_type: "Created Staff Evaluation",
    entity_type: "Staff Evaluation",
    entity_id: hrReport.id,
    changes: {},
    details: `HR Report created with score ${parsedData.data.score}`,
  });

  if (insertLogError) {
    console.error("Error inserting audit log for HR Report:", insertLogError);
  }

  return NextResponse.json(
    {
      success: true,
      message: "HR report submitted successfully",
    },
    { status: 201 },
  );
}
