/**
 * Router for job listing related procedures (mostly for users)
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { moveFile } from "@/lib/cloudinary/cloudinary";
import type { CANDIDATE_STATUSES } from "@/lib/constants";
import admin, { db } from "@/lib/firebase/admin";
import { deleteDocument } from "@/lib/mongodb/action";
import mongoDb_client from "@/lib/mongodb/mongodb";
import { jobListingSchema, userSchema } from "@/lib/schemas";
import {
  deleteRow,
  find,
  findWithJoin,
  insertTable,
  updateTable,
} from "@/lib/supabase/action";
import { createClientServer } from "@/lib/supabase/supabase";
import type {
  Applicants,
  AuditLog,
  Changes,
  JobListing,
  JobListingQualifications,
  JobListingRequirements,
  JobTags,
  Tags,
} from "@/types/schema";
import type { Notification } from "@/types/types";
import {
  adminProcedure,
  authorizedProcedure,
  createTRPCRouter,
  rateLimitedProcedure,
} from "../init";

const jobListingRouter = createTRPCRouter({
  joblistings: authorizedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).optional().default(10),
          page: z.number().min(1).optional().default(1),
        })
        .optional(),
    )
    .query(async ({ ctx }) => {
      const userId = ctx.userJWT?.id ?? "";
      const supabase = await createClientServer(1, true);

      const { data: appliedData, error: appliedError } = await findWithJoin<
        Applicants & { job_listings: JobListing }
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
  deleteJoblisting: authorizedProcedure
    .input(
      z.object({
        joblistingId: z.uuid(),
        officer_id: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (
        input.officer_id !== ctx.userJWT?.id &&
        ctx.userJWT?.role !== "Admin" &&
        ctx.userJWT?.role !== "SuperAdmin"
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to delete this job listing.",
        });
      }

      const supabase = await createClientServer(1, true);
      const { error } = await deleteRow(
        supabase,
        "job_listings",
        "id",
        input.joblistingId,
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
          actor_type: ctx.userJWT?.role,
          actor_id: ctx.userJWT?.id,
          action: "delete",
          event_type: "Joblisting deleted",
          entity_type: "Job Listing",
          entity_id: input.joblistingId,
          changes: {},
          details: `Job listing with ID ${input.joblistingId} was deleted.`,
        } as AuditLog,
      );

      if (insertLogError) {
        console.error("Error inserting audit log:", insertLogError);
      }

      return { success: true, message: "Job listing deleted successfully" };
    }),

  // User side
  getJobDetails: rateLimitedProcedure
    .input(
      z.object({
        jobId: z.uuid(),
      }),
    )
    .query(async ({ input }) => {
      const supabase = await createClientServer(1, true);

      const { data: jobListing, error: errorJobListing } =
        await find<JobListing>(supabase, "job_listings", [
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

      const [qualifications, requirements, tags] = await Promise.all([
        qualificationsPromise,
        requirementsPromise,
        tagsPromise,
      ]);

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

      return {
        ...jobListing,
        requirements: requirements.data?.map((item) => item.requirement) || [],
        qualifications:
          qualifications.data?.map((item) => item.qualification) || [],
        tags: (tags.data || []).map((item) => item.tags.name),
        users: undefined,
      };
    }),
  applyForJob: rateLimitedProcedure
    .input(
      z
        .object({
          jobId: z.uuid(),
          resumeURL: z.string(),
          transcriptURL: z.string(),
        })
        .extend(userSchema.shape),
    )
    .mutation(async ({ input }) => {
      const supabaseClient = await createClientServer(1, true);

      const [resumePublicId, transcriptPublicId] = await Promise.all([
        moveFile(input.resumeURL),
        moveFile(input.transcriptURL),
      ]);

      const { data: applicantsID, error: applicantsError } = await insertTable(
        supabaseClient,
        "applicants",
        {
          joblisting_id: input.jobId,
          first_name: input.firstName,
          last_name: input.lastName,
          email: input.email,
          contact_number: input.contactNumber,
          street: input.street,
          zip: input.zip,
          city: input.city,
          state: input.state,
          resume_id: resumePublicId,
          transcript_id: transcriptPublicId,
        } as unknown as Applicants,
      );

      if (!applicantsID || applicantsError) {
        console.error("Error inserting applicant data:", applicantsError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to apply for job",
        });
      }

      const { error: applicantSkillsError } = await supabaseClient
        .from("applicant_skills")
        .insert(
          input.skills.map((tag) => ({
            applicant_id: applicantsID[0].id,
            tag_id: tag.id,
            rating: tag.rating || 0,
          })),
        );

      if (applicantSkillsError) {
        await deleteRow(supabaseClient, "applicants", "id", applicantsID[0].id);
        console.error(
          "Error inserting applicant skills:",
          applicantSkillsError,
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to apply for job",
        });
      }

      const scoreAPI = new URL("http://localhost:8000/score/");
      scoreAPI.searchParams.set("job_id", input.jobId);
      scoreAPI.searchParams.set("applicant_id", applicantsID[0].id);
      scoreAPI.searchParams.set("resume_public_id", resumePublicId);
      scoreAPI.searchParams.set("transcript_public_id", transcriptPublicId);

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
          actor_type: "Applicant",
          action: "create",
          event_type: "Applied for job",
          entity_type: "Job Applicant",
          entity_id: applicantsID[0].id,
          changes: {},
          details: `Applicant with ID ${
            applicantsID[0].id
          } applied for job listing with ID ${input.jobId}.`,
        } as AuditLog,
      );

      if (insertLogError) {
        console.error("Error inserting audit log:", insertLogError);
      }

      return {
        success: true,
        message: "Application submitted successfully",
        trackingId: applicantsID[0].id,
      };
    }),
  updateJoblisting: authorizedProcedure
    .input(
      jobListingSchema.extend({
        jobId: z.uuid(),
      }),
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
      if (
        ctx.userJWT?.role !== "Admin" &&
        ctx.userJWT?.id !== "SuperAdmin" &&
        oldJoblisting.officer_id &&
        oldJoblisting.officer_id !== ctx.userJWT?.id
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to update this job listing.",
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
            }),
          ),
          { onConflict: "slug" },
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
        })),
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
          [{ column: "id", value: input.jobId }],
        ),
        ...(input.qualifications || []).map((qualification) =>
          insertTable(supabase, "jl_qualifications", {
            joblisting_id: input.jobId,
            qualification: qualification.title,
          }),
        ),
        ...(input.requirements || []).map((requirement) =>
          insertTable(supabase, "jl_requirements", {
            joblisting_id: input.jobId,
            requirement: requirement.title,
          }),
        ),
      ]);

      if (promises.some((promise) => promise.error)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update job listing",
        });
      }

      const changes: Record<string, Changes> = {};

      if (input.hrOfficerId && oldJoblisting.officer_id !== input.hrOfficerId) {
        changes.officer_id = {
          before: oldJoblisting.officer_id || "null",
          after: input.hrOfficerId,
        };
      }

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
          actor_type: ctx.userJWT?.role,
          actor_id: ctx.userJWT?.id,
          action: "update",
          event_type: "Joblisting modified",
          entity_type: "Job Listing",
          entity_id: input.jobId,
          changes,
          details: `Job listing with ID ${input.jobId} was updated.`,
        } as AuditLog,
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
            (name) => ({ name }),
          ),
          { onConflict: "slug" },
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
          created_by: ctx.userJWT?.id,
          is_fulltime: input.isFullTime,
          officer_id: input.hrOfficerId || null,
        },
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
        })),
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
          }),
        ),
        ...(input.requirements || []).map((requirement) =>
          insertTable(supabase, "jl_requirements", {
            joblisting_id: insertedData[0].id,
            requirement: requirement.title,
          }),
        ),
      ]);

      if (results.some((result) => result.error)) {
        console.error(
          "Error inserting qualifications/requirements",
          results.find((r) => r.error),
        );
        await Promise.all([
          deleteRow(supabase, "job_listings", "id", insertedData[0].id),
          deleteRow(supabase, "job_tags", "joblisting_id", insertedData[0].id),
          deleteRow(
            supabase,
            "jl_qualifications",
            "joblisting_id",
            insertedData[0].id,
          ),
          deleteRow(
            supabase,
            "jl_requirements",
            "joblisting_id",
            insertedData[0].id,
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
        },
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
            .add(notification),
        ),
      );

      const { error: insertLogError } = await insertTable(
        supabase,
        "audit_logs",
        {
          actor_type: ctx.userJWT?.role,
          actor_id: ctx.userJWT?.id,
          action: "create",
          event_type: "Created joblisting",
          entity_type: "Job Listing",
          entity_id: insertedData[0].id,
          changes: {},
          details: `Job listing with ID ${insertedData[0].id} was created.`,
        } as AuditLog,
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
      }),
    )
    .query(async ({ input }) => {
      const supabaseClient = await createClientServer(1, true);

      let query = supabaseClient.from("job_listings").select("*");

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
        })),
      };
    }),
  fetchTags: rateLimitedProcedure
    .input(
      z.object({
        jobId: z.uuid(),
      }),
    )
    .query(async ({ input }) => {
      const supabaseClient = await createClientServer(1, true);

      const tags = await findWithJoin<JobTags & { tags: Tags }>(
        supabaseClient,
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

      if (tags.error) {
        console.error("Error fetching tags:", tags.error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch tags",
        });
      }

      return {
        tags: (tags.data || []).map((item) => item.tags),
      };
    }),
  fetchApplication: rateLimitedProcedure
    .input(
      z.object({
        applicantId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const supabaseClient = await createClientServer(1, true);

      const { data, error } = await supabaseClient
        .from("applicants")
        .select(
          "id, status, scheduled_at, platform, meeting_url, job_listings(title)",
        )
        .eq("id", input.applicantId)
        .single();
      if (error || !data) {
        console.error("Error fetching tracking ID:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch tracking ID",
        });
      }

      const typedData = data as unknown as {
        id: string;
        status: (typeof CANDIDATE_STATUSES)[number];
        scheduled_at: string | null;
        platform: string | null;
        meeting_url: string | null;
        job_listings: { title: string } | null;
      };

      const responseData = {
        id: typedData.id,
        status: typedData.status,
        scheduledAt: typedData.scheduled_at,
        platform: typedData.platform,
        meetingURL: typedData.meeting_url,
        jobTitle: typedData.job_listings?.title ?? null,
      };

      return {
        data: responseData,
      };
    }),
});

export default jobListingRouter;
