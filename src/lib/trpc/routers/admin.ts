import { authorizedProcedure, createTRPCRouter } from "../init";
import { TRPCError } from "@trpc/server";
import { createClientServer } from "@/lib/supabase/supabase";
import { countTable, find } from "@/lib/supabase/action";
import {
  ActiveJob,
  JobListing,
  WeeklyCumulativeApplicants,
} from "@/types/schema";
import { z } from "zod";

const adminRouter = createTRPCRouter({
  fetchStats: authorizedProcedure.query(async ({ ctx }) => {
    if (!ctx.userJWT!.isAdmin) {
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
    if (!ctx.userJWT!.isAdmin) {
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
      if (!ctx.userJWT!.isAdmin) {
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
});

export default adminRouter;
