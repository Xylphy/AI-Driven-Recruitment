/**
 * Router for staff-related procedures (Staff, SuperAdmin, Admin)
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { PAGE_SIZE } from "@/lib/constants";
import { createClientServer } from "@/lib/supabase/server";
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
      const supabase = await createClientServer(true);

      const { data: overall } = await supabase.rpc(
        "get_ai_metrics_overall_by_month",
        {
          p_year: input.year,
          p_month: input.month,
        },
      );

      const { data: weekly } = await supabase.rpc(
        "get_ai_metrics_weekly_by_month",
        {
          p_year: input.year,
          p_month: input.month,
        },
      );

      return {
        overall: overall?.[0] ?? {
          avg_job_fit_score: 0,
          avg_response_time: 0,
        },
        weekly: weekly ?? [],
      };
    }),
  notifications: authorizedProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(PAGE_SIZE),
      }),
    )
    .query(async ({ input, ctx }) => {
      const supabase = await createClientServer(true);

      const { data: notifications, error } = await supabase
        .from("notifications")
        .select("*")
        // biome-ignore lint/style/noNonNullAssertion: User must be authenticated to access this route, so ctx.userJWT is guaranteed to be defined
        .eq("staff_id", ctx.userJWT!.id)
        .order("created_at", { ascending: false })
        .limit(input.limit);

      if (error) {
        console.error("Error fetching staff notifications:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch notifications",
        });
      }

      return {
        notifications: notifications ?? [],
        nextCursor:
          notifications && notifications.length === input.limit
            ? notifications[notifications.length - 1]?.created_at
            : null,
      };
    }),
});

export default staffRouter;
