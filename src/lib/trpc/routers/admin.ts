import { authorizedProcedure, createTRPCRouter } from "../init";
import { TRPCError } from "@trpc/server";
import { createClientServer } from "@/lib/supabase/supabase";
import { countTable, find } from "@/lib/supabase/action";
import {
  ActiveJob,
  AuditLog,
  JobListing,
  WeeklyCumulativeApplicants,
} from "@/types/schema";
import { z } from "zod";

const adminRouter = createTRPCRouter({
  fetchStats: authorizedProcedure.query(async ({ ctx }) => {
    if (ctx.userJWT!.role === "User") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have permission to access this resource",
      });
    }
    const supabase = await createClientServer(1, true);

    const { data: dailyActiveJobs, error: dailyActiveJobsError } =
      await find<ActiveJob>(supabase, "daily_active_jobs_last_7_days")
        .many()
        .execute();

    if (dailyActiveJobsError) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          dailyActiveJobsError?.message || "Failed to fetch daily active jobs",
      });
    }

    const { data: totalCandidates, error: totalCandidatesError } =
      await countTable(supabase, "job_applicants");

    if (totalCandidatesError) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          totalCandidatesError?.message || "Failed to fetch total candidates",
      });
    }

    const { data: weeklyApplicants, error: weeklyApplicantsError } =
      await find<WeeklyCumulativeApplicants>(
        supabase,
        "weekly_applicants_last_4_weeks"
      )
        .many()
        .execute();

    if (weeklyApplicantsError) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          weeklyApplicantsError?.message || "Failed to fetch weekly applicants",
      });
    }

    return {
      activeJobs: dailyActiveJobs!.at(-1)?.jobs || 0,
      totalJobs: dailyActiveJobs!.at(-1)?.jobs || 0,
      totalCandidates: totalCandidates || 0,
      jobActivity: dailyActiveJobs,
      shortListed: 0,
      candidateGrowth: weeklyApplicants,
    };
  }),
  // Compare candidates
  fetchAllJobs: authorizedProcedure.query(async ({ ctx }) => {
    if (ctx.userJWT!.role === "User") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have permission to access this resource",
      });
    }
    const supabase = await createClientServer(1, true);

    const { data: jobs, error: jobsError } = await find<JobListing>(
      supabase,
      "job_listings"
    )
      .many()
      .execute();

    if (jobsError) {
      console.error("Error fetching jobs");
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: jobsError?.message || "Failed to fetch job listings",
      });
    }

    return {
      jobs,
    };
  }),
  compareCandidates: authorizedProcedure
    .input(
      z.object({
        applicantIdA: z.uuid(),
        applicantIdB: z.uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.userJWT!.role === "User") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to access this resource",
        });
      }

      const compareAPI = new URL("http://localhost:8000/score/");
      compareAPI.searchParams.set("applicant1_id", input.applicantIdA);
      compareAPI.searchParams.set("applicant2_id", input.applicantIdB);

      return {
        compareResult: await fetch(compareAPI).then((res) => res.json()),
      };
    }),
  auditLogs: authorizedProcedure
    .input(
      z.object({
        query: z.string().optional(),
        category: z.string().optional(),
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.userJWT!.role === "User") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to access this resource",
        });
      }

      const supabase = await createClientServer(1, true);
      let query = supabase.from("audit_logs").select("*");

      if (input.query) {
        query = query.ilike("details", `%${input.query}%`);
      }
      if (input.category && input.category !== "All") {
        query = query.eq("event_type", input.category);
      }
      if (input.fromDate) {
        query = query.gte("created_at", input.fromDate);
      }
      if (input.toDate) {
        query = query.lte("created_at", input.toDate);
      }

      const { data: auditLogs, error: auditLogsError } = await query;

      if (auditLogsError) {
        console.error("Error fetching audit logs");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: auditLogsError?.message || "Failed to fetch audit logs",
        });
      }

      return {
        auditLogs,
      };
    }),
});

export default adminRouter;
