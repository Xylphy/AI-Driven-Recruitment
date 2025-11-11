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
  updateTable,
} from "@/lib/supabase/action";
import { TRPCError } from "@trpc/server";
import mongoDb_client from "@/lib/mongodb/mongodb";
import { deleteDocument } from "@/lib/mongodb/action";
import {
  JobListing,
  JobListingQualifications,
  JobListingRequirements,
  JobApplicant,
  JobTags,
  Admin,
} from "@/types/schema";
import { jobListingSchema } from "@/lib/schemas";

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
          JobApplicant & { job_listings: JobListing }
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
        applicantCheckPromise = find<JobApplicant>(
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
        await find<JobApplicant>(
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
  updateJoblisting: authenticatedProcedure
    .input(
      jobListingSchema.extend({
        jobId: z.uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userJWT!.isAdmin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Insufficient permissions",
        });
      }

      const supabase = await createClientServer(1, true);

      await Promise.all([
        deleteRow(supabase, "jl_qualifications", "joblisting_id", input.jobId),
        deleteRow(supabase, "jl_requirements", "joblisting_id", input.jobId),
        deleteRow(supabase, "job_tags", "joblisting_id", input.jobId),
      ]);

      const { data: tagRows, error: tagError } = await supabase
        .from("tags")
        .upsert(
          Array.from(new Set(input.tags?.map((tag) => tag.title))).map(
            (name) => ({
              name,
            })
          ),
          { onConflict: "slug" }
        )
        .select("id, name");

      if (tagError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create job listings",
        });
      }

      const { error: errorLink } = await supabase.from("job_tags").insert(
        tagRows.map((t) => ({
          joblisting_id: input.jobId,
          tag_id: t.id,
        }))
      );

      if (errorLink) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create job listings",
        });
      }

      const promises = await Promise.all([
        updateTable(supabase, "job_listings", "id", input.jobId, {
          title: input.title,
          location: input.location,
          is_fulltime: input.isFullTime,
        }),
        ...(input.qualifications || []).map((qualification) =>
          insertTable(supabase, "jl_qualifications", {
            joblisting_id: input.jobId,
            qualification: qualification.title,
          })
        ),
        ...(input.requirements || []).map((requirement) =>
          insertTable(supabase, "jl_requirements", {
            joblisting_id: input.jobId,
            requirement: requirement.title,
          })
        ),
      ]);

      if (promises.some((promise) => promise.error)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update job listing",
        });
      }

      return { success: true, message: "Job listing updated successfully" };
    }),
  createJoblisting: authenticatedProcedure
    .input(jobListingSchema)
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userJWT!.isAdmin) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Insufficient permissions",
        });
      }

      const supabase = await createClientServer(1, true);

      const { data: tagRows, error: tagError } = await supabase
        .from("tags")
        .upsert(
          Array.from(new Set(input.tags?.map((tag) => tag.title))).map(
            (name) => ({ name })
          ),
          { onConflict: "slug" }
        )
        .select("id, name");

      if (tagError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create job listings",
        });
      }

      const { data: insertedData, error: insertedError } = await insertTable(
        supabase,
        "job_listings",
        {
          title: input.title,
          location: input.location,
          created_by: ctx.userJWT!.id,
          is_fulltime: input.isFullTime,
        }
      );

      if (insertedError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create job listings",
        });
      }

      const { error: errorLink } = await supabase.from("job_tags").insert(
        tagRows.map((t) => ({
          joblisting_id: insertedData[0].id,
          tag_id: t.id,
        }))
      );

      if (errorLink) {
        await deleteRow(supabase, "job_listings", "id", insertedData[0].id);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create job listings",
        });
      }

      const results = await Promise.all([
        ...(input.qualifications || []).map((qualification) =>
          insertTable(supabase, "jl_qualifications", {
            joblisting_id: insertedData[0].id,
            qualification: qualification.title,
          })
        ),
        ...(input.requirements || []).map((requirement) =>
          insertTable(supabase, "jl_requirements", {
            joblisting_id: insertedData[0].id,
            requirement: requirement.title,
          })
        ),
      ]);

      if (results.some((result) => result.error)) {
        await Promise.all([
          deleteRow(supabase, "job_listings", "id", insertedData[0].id),
          deleteRow(supabase, "job_tags", "joblisting_id", insertedData[0].id),
          deleteRow(
            supabase,
            "jl_qualifications",
            "joblisting_id",
            insertedData[0].id
          ),
          deleteRow(
            supabase,
            "jl_requirements",
            "joblisting_id",
            insertedData[0].id
          ),
        ]);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create job listings",
        });
      }

      return { success: true, message: "Job listing created successfully" };
    }),
});

export default jobListingRouter;
