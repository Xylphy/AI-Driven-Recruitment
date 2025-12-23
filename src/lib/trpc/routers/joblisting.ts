import {
  adminProcedure,
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
  Changes,
} from "@/types/schema";
import { jobListingSchema } from "@/lib/schemas";
import type { Notification } from "@/types/types";
import admin, { db } from "@/lib/firebase/admin";

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
    .query(async ({ ctx }) => {
      // const limit = input?.limit ?? 100;
      // const offset = ((input?.page ?? 1) - 1) * limit;
      const userId = ctx.userJWT!.id;
      const supabase = await createClientServer(1, true);

      const { data: appliedData, error: appliedError } = await findWithJoin<
        JobApplicant & { job_listings: JobListing }
      >(supabase, "job_applicants", [
        {
          foreignTable: "job_listings",
          foreignKey: "joblisting_id",
          fields: "title",
        },
      ])
        .many([
          {
            column: "user_id",
            value: userId,
          },
        ])
        .execute();

      if (appliedError) {
        console.error(appliedError);
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
    }),
  deleteJoblisting: adminProcedure
    .input(
      z.object({
        joblistingId: z.uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const supabase = await createClientServer(1, true);
      const { error } = await deleteRow(
        supabase,
        "job_listings",
        "id",
        input.joblistingId
      );

      if (error) {
        console.error(error);
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

      const { error: insertLogError } = await insertTable(
        supabase,
        "audit_logs",
        {
          actor_type: ctx.userJWT!.role,
          actor_id: ctx.userJWT!.id,
          action: "delete",
          event_type: "Joblisting deleted",
          entity_type: "Job Listing",
          entity_id: input.joblistingId,
          changes: {},
          details: `Job listing with ID ${input.joblistingId} was deleted.`,
        }
      );

      if (insertLogError) {
        console.error("Error inserting audit log:", insertLogError);
      }

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
        console.error(errorJobListing);
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
        applicantCheckPromise = find<JobApplicant>(supabase, "job_applicants", [
          { column: "joblisting_id", value: input.jobId },
          { column: "user_id", value: userJWT.id },
        ]).single();
      }

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

      const applicantCheck = await applicantCheckPromise;

      return {
        ...jobListing,
        requirements: requirements.data?.map((item) => item.requirement) || [],
        qualifications:
          qualifications.data?.map((item) => item.qualification) || [],
        isApplicant: !!applicantCheck?.data,
        tags: (tags.data || []).map((item) => item.tags.name),
        notify: applicantCheck?.data?.notify || false,
      };
    }),
  applyForJob: rateLimitedProcedure
    .input(
      z.object({
        jobId: z.uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.userJWT!.role !== "User") {
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
        console.error("Failed to check existing applications", existingError);
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
        console.error("Error submitting application", error);
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

      const { error: insertLogError } = await insertTable(
        supabaseClient,
        "audit_logs",
        {
          actor_type: ctx.userJWT!.role,
          actor_id: ctx.userJWT!.id,
          action: "create",
          event_type: "Applied for job",
          entity_type: "Job Applicant",
          entity_id: applicantsID[0].id,
          changes: {},
          details: `User with ID ${
            ctx.userJWT!.id
          } applied for job listing with ID ${input.jobId}.`,
        }
      );

      if (insertLogError) {
        console.error("Error inserting audit log:", insertLogError);
      }

      return {
        success: true,
        message: "Application submitted successfully",
      };
    }),
  updateJoblisting: adminProcedure
    .input(
      jobListingSchema.extend({
        jobId: z.uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const supabase = await createClientServer(1, true);

      const { data: oldJoblisting, error: oldJoblistingError } =
        await find<JobListing>(supabase, "job_listings", [
          { column: "id", value: input.jobId },
        ]).single();

      if (oldJoblistingError || !oldJoblisting) {
        console.error("Error fetching old job listing:", oldJoblistingError);
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Job listing not found",
        });
      }

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
        console.error("Tag upsert error:", tagError);
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
        console.error("Error inserting job tags", errorLink);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create job listings",
        });
      }

      const promises = await Promise.all([
        updateTable(
          supabase,
          "job_listings",
          {
            title: input.title,
            location: input.location,
            is_fulltime: input.isFullTime,
          },
          [{ column: "id", value: input.jobId }]
        ),
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

      const changes: Record<string, Changes> = {};

      if (oldJoblisting.title !== input.title) {
        changes.title = {
          before: oldJoblisting.title,
          after: input.title,
        };
      }
      if (oldJoblisting.location !== input.location) {
        changes.location = {
          before: oldJoblisting.location,
          after: input.location,
        };
      }
      if (oldJoblisting.is_fulltime !== input.isFullTime) {
        changes.is_fulltime = {
          before: oldJoblisting.is_fulltime.toString(),
          after: input.isFullTime.toString(),
        };
      }

      const { error: insertLogError } = await insertTable(
        supabase,
        "audit_logs",
        {
          actor_type: ctx.userJWT!.role,
          actor_id: ctx.userJWT!.id,
          action: "update",
          event_type: "Joblisting modified",
          entity_type: "Job Listing",
          entity_id: input.jobId,
          changes,
          details: `Job listing with ID ${input.jobId} was updated.`,
        }
      );

      if (insertLogError) {
        console.error("Error inserting audit log:", insertLogError);
      }

      return { success: true, message: "Job listing updated successfully" };
    }),
  createJoblisting: adminProcedure
    .input(jobListingSchema)
    .mutation(async ({ input, ctx }) => {
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
        console.error("Error upserting tags", tagError);
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
          officer_id: input.hrOfficerId || null,
        }
      );

      if (insertedError) {
        console.error("Insert error", insertedError);
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
        console.error("Error inserting tags", errorLink);
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
        console.error(
          "Error inserting qualifications/requirements",
          results.find((r) => r.error)
        );
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

      const { data: usersToNotify, error: usersError } = await supabase.rpc(
        "get_similar_job_applicants",
        {
          new_job_id: insertedData[0].id,
        }
      );

      if (usersError) {
        console.error("Error fetching users to notify", usersError);
      }

      const notification: Omit<Notification, "id"> = {
        title: "New Job Listing Available",
        body: `A new job listing "${input.title}" has been posted that's similar to your applied jobs before. Check it out!`,
        isRead: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        link: `/joblisting/${insertedData[0].id}`,
      };

      await Promise.all(
        (usersToNotify || []).map((user: { user_id: string }) =>
          db
            .collection("users")
            .doc(user.user_id)
            .collection("notifications")
            .add(notification)
        )
      );

      const { error: insertLogError } = await insertTable(
        supabase,
        "audit_logs",
        {
          actor_type: ctx.userJWT!.role,
          actor_id: ctx.userJWT!.id,
          action: "create",
          event_type: "Created joblisting",
          entity_type: "Job Listing",
          entity_id: insertedData[0].id,
          changes: {},
          details: `Job listing with ID ${insertedData[0].id} was created.`,
        }
      );

      if (insertLogError) {
        console.error("Error inserting audit log:", insertLogError);
      }

      return { success: true, message: "Job listing created successfully" };
    }),
  fetchJobs: rateLimitedProcedure
    .input(
      z.object({
        searchQuery: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const supabaseClient = await createClientServer(1, true);

      let query = supabaseClient
        .from("job_listings")
        .select("*, job_applicants(id)");

      if (input.searchQuery) {
        query = query.ilike("title", `%${input.searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching jobs:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch jobs",
        });
      }

      return {
        jobs: (data || []).map((item) => ({
          id: item.id,
          title: item.title,
          created_at: item.created_at,
          is_fulltime: item.is_fulltime,
          location: item.location,
          applicant_count: item.job_applicants?.length || 0,
        })),
      };
    }),
  notify: rateLimitedProcedure
    .input(
      z.object({
        jobId: z.uuid(),
        notify: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.userJWT!.role !== "User") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only users can set notifications",
        });
      }

      const supabase = await createClientServer(1, true);

      await updateTable(
        supabase,
        "job_applicants",
        {
          notify: input.notify,
        },
        [
          { column: "user_id", value: ctx.userJWT!.id },
          { column: "joblisting_id", value: input.jobId },
        ]
      );

      const changes: Record<string, Changes> = {
        notify: {
          before: (!input.notify).toString(),
          after: input.notify.toString(),
        },
      };

      const details = input.notify
        ? `User with ID ${
            ctx.userJWT!.id
          } subscribed to job alerts for job listing with ID ${input.jobId}.`
        : `User with ID ${
            ctx.userJWT!.id
          } unsubscribed from job alerts for job listing with ID ${
            input.jobId
          }.`;

      const { error: insertLogError } = await insertTable(
        supabase,
        "audit_logs",
        {
          actor_type: ctx.userJWT!.role,
          actor_id: ctx.userJWT!.id,
          action: "update",
          event_type: "Changed job alerts",
          entity_type: "Job Applicant",
          entity_id: input.jobId,
          changes,
          details,
        }
      );

      if (insertLogError) {
        console.error("Error inserting audit log:", insertLogError);
      }

      return { success: true, message: "You will be notified for updates" };
    }),
});

export default jobListingRouter;
