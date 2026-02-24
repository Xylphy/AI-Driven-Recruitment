/**
 * Router for staff-related procedures (HR Officer, SuperAdmin, Admin)
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getMongoDb } from "@/lib/mongodb/mongodb";
import {
  deleteRow,
  find,
  findWithJoin,
  insertTable,
} from "@/lib/supabase/action";
import { createClientServer } from "@/lib/supabase/supabase";
import type {
  AuditLog,
  HRReport,
  JobListing,
  JobListingQualifications,
  JobListingRequirements,
  JobTags,
  KeyHighlights,
  Staff,
} from "@/types/schema";
import { authorizedProcedure, createTRPCRouter } from "../init";

const staffRouter = createTRPCRouter({
  getJobDetails: authorizedProcedure
    .input(
      z.object({
        jobId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const supabase = await createClientServer(1, true);

      const { data: jobListing, error: errorJobListing } = await findWithJoin<
        JobListing & { users: Pick<Staff, "first_name" | "last_name"> }
      >(supabase, "job_listings", [
        {
          foreignTable: "staff!job_listings_officer_id_fkey",
          foreignKey: "officer_id",
          fields: "first_name, last_name",
        },
      ])
        .many([{ column: "id", value: input.jobId }])
        .execute();

      if (errorJobListing || !jobListing) {
        console.error(errorJobListing);
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job listing not found",
        });
      }

      const qualificationsPromise = find<JobListingQualifications>(
        supabase,
        "jl_qualifications",
        [{ column: "joblisting_id", value: input.jobId }],
      )
        .many()
        .execute();

      const requirementsPromise = find<JobListingRequirements>(
        supabase,
        "jl_requirements",
        [{ column: "joblisting_id", value: input.jobId }],
      )
        .many()
        .execute();

      const tagsPromise = findWithJoin<JobTags & { tags: { name: string } }>(
        supabase,
        "job_tags",
        [
          {
            foreignTable: "tags",
            foreignKey: "tag_id",
            fields: "id, name",
          },
        ],
      )
        .many([{ column: "joblisting_id", value: input.jobId }])
        .execute();

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

      const joblistingResponse: (typeof jobListing)[0] & {
        officer_name?: string;
      } = {
        // biome-ignore lint/style/noNonNullAssertion: We check for jobListing existence above, so this is safe
        ...jobListing[0]!,
      };

      joblistingResponse.officer_name = jobListing[0]?.users
        ? `${jobListing[0].users.first_name} ${jobListing[0].users.last_name}`
        : "Unknown Officer";

      return {
        ...joblistingResponse,
        requirements: requirements.data?.map((item) => item.requirement) || [],
        qualifications:
          qualifications.data?.map((item) => item.qualification) || [],
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
      const supabase = await createClientServer(1, true);

      const { data: hrReport, error: hrReportError } = await insertTable(
        supabase,
        "hr_reports",
        {
          score: input.score,
          applicant_id: input.applicantId,
          summary: input.summary,
          staff_id: ctx.userJWT?.id,
        },
      );

      if (hrReportError || !hrReport) {
        console.error("Error inserting HR Report:", hrReportError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit HR report",
        });
      }

      const { data: keyHighlight, error: keyHighlightError } =
        await insertTable(
          supabase,
          "key_highlights",
          input.keyHighlights
            .split(",")
            .map((h) => h.trim())
            .filter(Boolean)
            .map((highlight) => ({
              report_id: hrReport[0]?.id,
              highlight,
            })),
        );

      if (keyHighlightError || !keyHighlight) {
        console.error("Error inserting Key Highlights:", keyHighlightError);
        await deleteRow(supabase, "hr_reports", "id", hrReport[0]?.id);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit key highlights",
        });
      }

      const { error: insertLogError } = await insertTable(
        supabase,
        "audit_logs",
        {
          actor_type: ctx.userJWT?.role,
          actor_id: ctx.userJWT?.id,
          action: "create",
          event_type: "Created HR Report",
          entity_type: "HR Report",
          entity_id: hrReport[0]?.id,
          changes: {},
          details: `HR Report created with score ${input.score}`,
        } as AuditLog,
      );

      if (insertLogError) {
        console.error(
          "Error inserting audit log for HR Report:",
          insertLogError,
        );
      }

      return {
        hrReport: hrReport[0] as HRReport,
        keyHighlights: keyHighlight as KeyHighlights[],
      };
    }),
  fetchHRReports: authorizedProcedure
    .input(
      z.object({
        applicantId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const supabase = await createClientServer(1, true);

      const { data: hrReports, error: hrReportsError } = await findWithJoin<
        HRReport & {
          staff: Pick<Staff, "first_name" | "last_name">;
          key_highlights: Pick<KeyHighlights, "highlight">[];
        }
      >(supabase, "hr_reports", [
        {
          foreignTable: "staff",
          foreignKey: "staff_id",
          fields: "first_name, last_name",
        },
        {
          foreignTable: "key_highlights",
          foreignKey: "report_id",
          fields: "highlight",
        },
      ])
        .many([{ column: "applicant_id", value: input.applicantId }])
        .execute();

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
