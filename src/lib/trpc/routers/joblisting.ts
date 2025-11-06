import {
  authenticatedProcedure,
  authorizedProcedure,
  createTRPCRouter,
  rateLimitedProcedure,
} from "../init";
import { z } from "zod";
import { createClientServer } from "@/lib/supabase/supabase";
import {
  find,
  findWithJoin,
  deleteRow,
  insertTable,
} from "@/lib/supabase/action";
import { TRPCError } from "@trpc/server";
import mongoDb_client from "@/lib/mongodb/mongodb";
import { deleteDocument } from "@/lib/mongodb/action";
import {
  JobListing,
  JobListingQualifications,
  JobListingRequirements,
  JobApplicants,
  JobTags,
  Admin,
} from "@/types/schema";

const jobListingRouter = createTRPCRouter({
  joblistings: authorizedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).optional().default(10),
          page: z.number().min(1).optional().default(1),
        })
        .optional()
    )
    .query(async ({ input, ctx }) => {
      const limit = input?.limit ?? 100;
      const offset = ((input?.page ?? 1) - 1) * limit;
      const userId = ctx.userJWT!.id;
      const supabase = await createClientServer(1, true);

      const { data: adminData } = await find<Admin>(supabase, "admins", [
        { column: "user_id", value: userId },
      ]).single();

      if (adminData) {
        const joblistingsResult = await find<JobListing>(
          supabase,
          "job_listings"
        )
          .many()
          .range(offset, offset + limit - 1)
          .order("created_at", { ascending: false })
          .execute();

        if (joblistingsResult.error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch job listings",
          });
        }

        return {
          joblistings: joblistingsResult.data,
        };
      } else {
        const { data: appliedData, error: appliedError } = await findWithJoin<
          JobApplicants & { job_listings: JobListing }
        >(supabase, "job_applicants", [
          {
            foreignTable: "job_listings",
            foreignKey: "joblisting_id",
            fields: "title",
          },
        ])
          .many()
          .execute();

        if (appliedError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch applied jobs",
          });
        }

        return {
          joblistings:
            appliedData?.map((item) => ({
              ...item,
              ...item.job_listings,
              job_listings: undefined,
            })) ?? [],
        };
      }
    }),
  deleteJoblisting: authenticatedProcedure
    .input(
      z.object({
        joblistingId: z.uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { isAdmin } = ctx.userJWT!;
      if (!isAdmin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Insufficient permissions",
        });
      }

      const supabase = await createClientServer(1, true);
      const { error } = await deleteRow(
        supabase,
        "job_listings",
        "id",
        input.joblistingId
      );

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete job listing",
        });
      }

      await mongoDb_client.connect();
      await deleteDocument("ai-driven-recruitment", "scored_candidates", {
        job_id: input.joblistingId,
      }).many();
      await mongoDb_client.close();

      return { success: true, message: "Job listing deleted successfully" };
    }),
  getJobDetails: rateLimitedProcedure
    .input(
      z.object({
        jobId: z.uuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      const supabase = await createClientServer(1, true);
      const { data: jobListing, error: errorJobListing } = await find<
        Omit<JobListing, "created_by">
      >(supabase, "job_listings", [
        { column: "id", value: input.jobId },
      ]).single();

      if (errorJobListing || !jobListing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job listing not found",
        });
      }

      const qualificationsPromise = find<JobListingQualifications>(
        supabase,
        "jl_qualifications",
        [{ column: "joblisting_id", value: input.jobId }]
      )
        .many()
        .execute();

      const requirementsPromise = find<JobListingRequirements>(
        supabase,
        "jl_requirements",
        [{ column: "joblisting_id", value: input.jobId }]
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
        ]
      )
        .many([{ column: "joblisting_id", value: input.jobId }])
        .execute();

      const userJWT = ctx.userJWT;
      let applicantCheckPromise;

      if (userJWT) {
        applicantCheckPromise = find<JobApplicants>(
          supabase,
          "job_applicants",
          [
            { column: "joblisting_id", value: input.jobId },
            { column: "user_id", value: userJWT.id },
          ]
        ).single();
      }

      const qualifications = await qualificationsPromise;
      const requirements = await requirementsPromise;
      const tags = await tagsPromise;

      if (qualifications.error || requirements.error || tags.error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch job details",
        });
      }

      const applicantCheck = await applicantCheckPromise;

      return {
        ...jobListing,
        requirements: requirements.data?.map((item) => item.requirement) || [],
        qualifications:
          qualifications.data?.map((item) => item.qualification) || [],
        isApplicant: !!applicantCheck?.data,
        tags: (tags.data || []).map((item) => item.tags.name),
      };
    }),
  applyForJob: authenticatedProcedure
    .input(
      z.object({
        jobId: z.uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.userJWT!.isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admins cannot apply for jobs",
        });
      }

      const supabaseClient = await createClientServer(1, true);

      const { data: existingApplicant, error: existingError } =
        await find<JobApplicants>(
          supabaseClient,
          "job_applicants",
          [
            { column: "user_id", value: input.jobId },
            { column: "joblisting_id", value: input.jobId },
          ],
          "*"
        )
          .many()
          .execute();

      if (existingError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to check existing applications",
        });
      }

      if (existingApplicant && existingApplicant.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You have already applied for this job",
        });
      }

      const { data: applicantsID, error } = await insertTable(
        supabaseClient,
        "job_applicants",
        {
          user_id: ctx.userJWT!.id,
          joblisting_id: input.jobId,
        }
      );

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit application",
        });
      }

      const scoreAPI = new URL("http://localhost:8000/score/");
      scoreAPI.searchParams.set("job_id", input.jobId);
      scoreAPI.searchParams.set("user_id", ctx.userJWT!.id);
      scoreAPI.searchParams.set("applicant_id", applicantsID[0].id);

      fetch(scoreAPI.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return {
        success: true,
        message: "Application submitted successfully",
      };
    }),
});

export default jobListingRouter;
