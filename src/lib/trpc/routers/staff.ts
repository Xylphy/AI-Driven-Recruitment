/**
 * Router for staff-related procedures (Staff, SuperAdmin, Admin)
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getMongoDb } from "@/lib/mongodb/mongodb";
import { createClientServer } from "@/lib/supabase/supabase";
import { authorizedProcedure, createTRPCRouter } from "../init";

const staffRouter = createTRPCRouter({
  getJobDetails: authorizedProcedure
    .input(
      z.object({
        jobId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const supabase = await createClientServer(true);

      const { data: jobListing, error: errorJobListing } = await supabase
        .from("job_listings")
        .select(`*, staff!staff_id(first_name, last_name)`)
        .eq("id", input.jobId)
        .single();

      if (errorJobListing || !jobListing) {
        console.error(errorJobListing);
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job listing not found",
        });
      }

      const qualificationsPromise = supabase
        .from("jl_qualifications")
        .select("qualification")
        .eq("joblisting_id", input.jobId);

      const requirementsPromise = supabase
        .from("jl_requirements")
        .select("requirement")
        .eq("joblisting_id", input.jobId);

      const tagsPromise = supabase
        .from("job_tags")
        .select("*, tags(name)")
        .eq("joblisting_id", input.jobId);

      const qualifications = await qualificationsPromise;
      const requirements = await requirementsPromise;
      const tags = await tagsPromise;

      if (qualifications.error || requirements.error || tags.error) {
        console.error("Error fetching job details:", {
          qualificationsError: qualifications.error,
          requirementsError: requirements.error,
          tagsError: tags.error,
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch job details",
        });
      }

      const joblistingResponse: typeof jobListing & {
        officer_name?: string;
      } = {
        ...jobListing,
      };

      joblistingResponse.officer_name = jobListing.staff
        ? `${jobListing.staff.first_name} ${jobListing.staff.last_name}`
        : "Unknown Officer";

      return {
        ...joblistingResponse,
        requirements: requirements.data || [],
        qualifications: qualifications.data || [],
        tags: (tags.data || []).map((item) => item.tags.name),
        users: undefined,
      };
    }),
  postHrReport: authorizedProcedure
    .input(
      z.object({
        score: z.number().min(0).max(5),
        applicantId: z.uuid(),
        summary: z.string(),
        keyHighlights: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const supabase = await createClientServer(true);

      const { data: hrReport, error: hrReportError } = await supabase
        .from("hr_reports")
        .insert({
          score: input.score,
          applicant_id: input.applicantId,
          summary: input.summary,
          // biome-ignore lint/style/noNonNullAssertion: We check for userJWT existence in the authProcedure, so this is safe
          staff_id: ctx.userJWT!.id,
        })
        .select("id")
        .single();

      if (hrReportError) {
        console.error("Error inserting HR Report:", hrReportError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit HR report",
        });
      }

      const { data: keyHighlight, error: keyHighlightError } = await supabase
        .from("key_highlights")
        .insert(
          input.keyHighlights
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
        await supabase.from("hr_reports").delete().eq("id", hrReport.id);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit key highlights",
        });
      }

      const { error: insertLogError } = await supabase
        .from("audit_logs")
        .insert({
          // biome-ignore lint/style/noNonNullAssertion: We check for userJWT existence in the authProcedure, so this is safe
          actor_type: ctx.userJWT!.role,
          // biome-ignore lint/style/noNonNullAssertion: We check for userJWT existence in the authProcedure, so this is safe
          actor_id: ctx.userJWT!.id,
          action: "create",
          event_type: "Created HR Report",
          entity_type: "Staff Report",
          entity_id: hrReport.id,
          changes: {},
          details: `HR Report created with score ${input.score}`,
        });

      if (insertLogError) {
        console.error(
          "Error inserting audit log for HR Report:",
          insertLogError,
        );
      }

      return {
        hrReport: hrReport,
        keyHighlights: keyHighlight,
      };
    }),
  fetchHRReports: authorizedProcedure
    .input(
      z.object({
        applicantId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const supabase = await createClientServer(true);

      const { data: hrReports, error: hrReportsError } = await supabase
        .from("hr_reports")
        .select(
          `*, staff!staff_id(first_name, last_name), key_highlights(highlight)`,
        )
        .eq("applicant_id", input.applicantId);

      if (hrReportsError) {
        console.error("Error fetching HR Reports:", hrReportsError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch HR reports",
        });
      }

      return (hrReports ?? []).map((report) => ({
        ...report,
        staff_name: report.staff
          ? `${report.staff.first_name} ${report.staff.last_name}`
          : "Unknown Staff",
        highlights: (report.key_highlights ?? []).map((h) => h.highlight),
        staff: undefined,
        key_highlights: undefined,
      }));
    }),
  fetchAIMetrics: authorizedProcedure
    .input(
      z.object({
        year: z.number().int().min(1970).max(2100),
        month: z.number().int().min(1).max(12),
      }),
    )
    .query(async ({ input }) => {
      const monthStartMs = Date.UTC(input.year, input.month - 1, 1, 0, 0, 0, 0);
      const monthEndMs = Date.UTC(input.year, input.month, 1, 0, 0, 0, 0) - 1;

      const fromTs = monthStartMs / 1000;
      const toTs = monthEndMs / 1000;

      const db = await getMongoDb();

      // Calculate overall and weekly average job fit score and response time for candidates created within the specified month
      const [result] = await db
        .collection("scored_candidates")
        .aggregate([
          {
            $match: {
              created_at: { $gte: fromTs, $lte: toTs },
              "score_data.job_fit_score": { $ne: null },
              "score_data.response_time": { $ne: null },
            },
          },
          {
            $addFields: {
              createdAtDate: {
                $toDate: { $multiply: ["$created_at", 1000] },
              },
            },
          },
          {
            $addFields: {
              dayOfMonth: { $dayOfMonth: "$createdAtDate" },
              weekOfMonth: {
                $min: [
                  4,
                  {
                    $add: [
                      1,
                      {
                        $floor: {
                          $divide: [{ $subtract: ["$dayOfMonth", 1] }, 7],
                        },
                      },
                    ],
                  },
                ],
              },
            },
          },
          {
            $facet: {
              overall: [
                {
                  $group: {
                    _id: null,
                    avg_job_fit_score: { $avg: "$score_data.job_fit_score" },
                    avg_response_time: { $avg: "$score_data.response_time" },
                  },
                },
                {
                  $project: {
                    _id: 0,
                    avg_job_fit_score: { $ifNull: ["$avg_job_fit_score", 0] },
                    avg_response_time: { $ifNull: ["$avg_response_time", 0] },
                  },
                },
              ],
              weekly: [
                {
                  $group: {
                    _id: "$weekOfMonth",
                    avg_job_fit_score: { $avg: "$score_data.job_fit_score" },
                    avg_response_time: { $avg: "$score_data.response_time" },
                  },
                },
                { $sort: { _id: 1 } },
                {
                  $project: {
                    _id: 0,
                    week: "$_id",
                    avg_job_fit_score: { $ifNull: ["$avg_job_fit_score", 0] },
                    avg_response_time: { $ifNull: ["$avg_response_time", 0] },
                  },
                },
              ],
            },
          },
        ])
        .toArray();

      const weeklyRaw =
        (result?.weekly as Array<{
          week: number;
          avg_job_fit_score: number;
          avg_response_time: number;
        }>) ?? [];

      const weekly = [1, 2, 3, 4].map((w) => {
        const hit = weeklyRaw.find((x) => x.week === w);
        return (
          hit ?? {
            week: w,
            avg_job_fit_score: 0,
            avg_response_time: 0,
          }
        );
      });

      return {
        overall:
          result?.overall?.[0] ??
          ({
            avg_job_fit_score: 0,
            avg_response_time: 0,
          } as {
            avg_job_fit_score: number;
            avg_response_time: number;
          }),
        weekly: weekly as Array<{
          week: number;
          avg_job_fit_score: number;
          avg_response_time: number;
        }>,
      };
    }),
});

export default staffRouter;
