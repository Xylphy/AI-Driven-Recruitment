/**
 * Router for job listing related procedures (mostly for applicants)
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { moveFile } from "@/lib/cloudinary/cloudinary";
import type { CANDIDATE_STATUSES } from "@/lib/constants";
import { deleteDocument } from "@/lib/mongodb/action";
import { sendEmail } from "@/lib/nodemailer/sendEmail";
import { jobListingSchema, userSchema } from "@/lib/schemas";
import { createClientServer } from "@/lib/supabase/supabase";
import type { Json } from "@/lib/supabase/types";
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
      const supabase = await createClientServer(true);

      const { data: appliedData, error: appliedError } = await supabase
        .from("applicants")
        .select("id, status, scheduled_at, platform, job_listings(title)")
        .eq("user_id", userId);

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

      const supabase = await createClientServer(true);
      const { error } = await supabase
        .from("job_listings")
        .delete()
        .eq("id", input.joblistingId);

      if (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete job listing",
        });
      }

      await deleteDocument("ai-driven-recruitment", "scored_candidates", {
        job_id: input.joblistingId,
      }).many();

      const { error: insertLogError } = await supabase
        .from("audit_logs")
        .insert({
          // biome-ignore lint/style/noNonNullAssertion: ctx.userJWT is guaranteed to exist due to authorizedProcedure
          actor_type: ctx.userJWT!.role,
          // biome-ignore lint/style/noNonNullAssertion: ctx.userJWT is guaranteed to exist due to authorizedProcedure
          actor_id: ctx.userJWT!.id,
          action: "delete",
          event_type: "Joblisting deleted",
          entity_type: "Job Listing",
          entity_id: input.joblistingId,
          changes: {},
          details: `Job listing with ID ${input.joblistingId} was deleted.`,
        });

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
      const supabase = await createClientServer(true);

      const { data: jobListing, error: errorJobListing } = await supabase
        .from("job_listings")
        .select("*")
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
        .select("tags(name)")
        .eq("joblisting_id", input.jobId);

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
        requirements: requirements.data || [],
        qualifications: qualifications.data || [],
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
      const supabaseClient = await createClientServer(true);

      const [resumePublicId, transcriptPublicId] = await Promise.all([
        moveFile(input.resumeURL),
        moveFile(input.transcriptURL),
      ]);

      const { data: applicantsID, error: applicantsError } =
        await supabaseClient
          .from("applicants")
          .insert({
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
          })
          .select("id")
          .single();

      if (!applicantsID || applicantsError) {
        console.error("Error inserting applicant data:", applicantsError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to apply for job",
        });
      }

      const results = await Promise.all([
        supabaseClient.from("applicant_skills").insert(
          input.skills.map((tag) => ({
            applicant_id: applicantsID.id,
            tag_id: tag.id,
            rating: tag.rating || 0,
          })),
        ),
        supabaseClient.from("social_links").insert(
          input.socialLinks.map((link) => ({
            applicant_id: applicantsID.id,
            link: link.value,
          })),
        ),
      ]);

      if (results.some((result) => result.error)) {
        supabaseClient.from("applicants").delete().eq("id", applicantsID.id);
        console.error(
          "Error inserting applicant skills or social links:",
          results.find((r) => r.error),
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to apply for job",
        });
      }

      const scoreAPI = new URL("http://localhost:8000/score/");
      scoreAPI.searchParams.set("job_id", input.jobId);
      scoreAPI.searchParams.set("applicant_id", applicantsID.id);
      scoreAPI.searchParams.set("resume_public_id", resumePublicId);
      scoreAPI.searchParams.set("transcript_public_id", transcriptPublicId);

      fetch(scoreAPI.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const [
        { error: insertLogError },
        { success: emailSuccess, error: emailError },
      ] = await Promise.all([
        supabaseClient.from("audit_logs").insert({
          actor_type: "Applicant",
          action: "create",
          event_type: "Applied for job",
          entity_type: "Applicant",
          entity_id: applicantsID.id,
          changes: {},
          details: `Applicant with ID ${applicantsID.id} applied for job listing with ID ${input.jobId}.`,
        }),

        sendEmail(applicantsID.id, input.firstName, input.email),
      ]);

      if (insertLogError) {
        console.error("Error inserting audit log:", insertLogError);
      }

      if (!emailSuccess) {
        console.error("Error sending email:", emailError);
      }

      return {
        success: true,
        message: "Application submitted successfully",
        trackingId: applicantsID.id,
      };
    }),
  updateJoblisting: authorizedProcedure
    .input(
      jobListingSchema.extend({
        jobId: z.uuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const supabase = await createClientServer(true);
      const { data: oldJoblisting, error: oldJoblistingError } = await supabase
        .from("job_listings")
        .select("*")
        .eq("id", input.jobId)
        .single();

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
        supabase
          .from("jl_qualifications")
          .delete()
          .eq("joblisting_id", input.jobId),
        supabase
          .from("jl_requirements")
          .delete()
          .eq("joblisting_id", input.jobId),
      ]);

      const promises = await Promise.all([
        supabase
          .from("job_listings")
          .update({
            title: input.title,
            location: input.location,
            is_fulltime: input.isFullTime,
            officer_id: input.hrOfficerId || null,
          })
          .eq("id", input.jobId),
        input.qualifications && input.qualifications.length > 0
          ? supabase.from("jl_qualifications").insert(
              input.qualifications.map((q) => ({
                joblisting_id: input.jobId,
                qualification: q.title,
              })),
            )
          : Promise.resolve({ data: [], error: null }),
        input.requirements && input.requirements.length > 0
          ? supabase.from("jl_requirements").insert(
              input.requirements.map((r) => ({
                joblisting_id: input.jobId,
                requirement: r.title,
              })),
            )
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (promises.some((promise) => promise.error)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update job listing",
        });
      }

      const changes: Json = {};

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

      const { error: insertLogError } = await supabase
        .from("audit_logs")
        .insert({
          // biome-ignore lint/style/noNonNullAssertion: ctx.userJWT is guaranteed to exist due to authorizedProcedure
          actor_type: ctx.userJWT!.role,
          // biome-ignore lint/style/noNonNullAssertion: ctx.userJWT is guaranteed to exist due to authorizedProcedure
          actor_id: ctx.userJWT!.id,
          action: "update",
          event_type: "Joblisting modified",
          entity_type: "Job Listing",
          entity_id: input.jobId,
          changes,
          details: `Job listing with ID ${input.jobId} was updated.`,
        });

      if (insertLogError) {
        console.error("Error inserting audit log:", insertLogError);
      }

      return { success: true, message: "Job listing updated successfully" };
    }),
  createJoblisting: adminProcedure
    .input(jobListingSchema)
    .mutation(async ({ input, ctx }) => {
      const supabase = await createClientServer(true);

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

      const { data: insertedData, error: insertedError } = await supabase
        .from("job_listings")
        .insert({
          title: input.title,
          location: input.location,
          // biome-ignore lint/style/noNonNullAssertion: ctx.userJWT is guaranteed to exist due to adminProcedure
          created_by: ctx.userJWT!.id,
          is_fulltime: input.isFullTime,
          officer_id: input.hrOfficerId || null,
        })
        .select("id")
        .single();

      if (insertedError) {
        console.error("Insert error", insertedError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create job listings",
        });
      }

      const { error: errorLink } = await supabase.from("job_tags").insert(
        tagRows.map((t) => ({
          joblisting_id: insertedData.id,
          tag_id: t.id,
        })),
      );

      if (errorLink) {
        console.error("Error inserting tags", errorLink);
        await supabase.from("job_listings").delete().eq("id", insertedData.id);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create job listings",
        });
      }

      const results = await Promise.all([
        input.qualifications && input.qualifications.length > 0
          ? supabase.from("jl_qualifications").insert(
              input.qualifications.map((q) => ({
                joblisting_id: insertedData.id,
                qualification: q.title,
              })),
            )
          : Promise.resolve({ data: [], error: null }),
        input.requirements && input.requirements.length > 0
          ? supabase.from("jl_requirements").insert(
              input.requirements.map((r) => ({
                joblisting_id: insertedData.id,
                requirement: r.title,
              })),
            )
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (results.some((result) => result.error)) {
        console.error(
          "Error inserting qualifications/requirements",
          results.find((r) => r.error),
        );
        await Promise.all([
          supabase.from("job_listings").delete().eq("id", insertedData.id),
          supabase
            .from("job_tags")
            .delete()
            .eq("joblisting_id", insertedData.id),
          supabase
            .from("jl_qualifications")
            .delete()
            .eq("joblisting_id", insertedData.id),
          supabase
            .from("jl_requirements")
            .delete()
            .eq("joblisting_id", insertedData.id),
        ]);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create job listings",
        });
      }

      const { error: insertLogError } = await supabase
        .from("audit_logs")
        .insert({
          // biome-ignore lint/style/noNonNullAssertion: ctx.userJWT is guaranteed to exist due to adminProcedure
          actor_type: ctx.userJWT!.role,
          // biome-ignore lint/style/noNonNullAssertion: ctx.userJWT is guaranteed to exist due to adminProcedure
          actor_id: ctx.userJWT!.id,
          action: "create",
          event_type: "Created joblisting",
          entity_type: "Job Listing",
          entity_id: insertedData.id,
          changes: {},
          details: `Job listing with ID ${insertedData.id} was created.`,
        });

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
      const supabaseClient = await createClientServer(true);

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
      const supabaseClient = await createClientServer(true);

      const { data: tags, error: tagsError } = await supabaseClient
        .from("job_tags")
        .select("tags(name)")
        .eq("joblisting_id", input.jobId);

      if (tagsError) {
        console.error("Error fetching tags:", tagsError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch tags",
        });
      }

      return {
        tags: tags || [],
      };
    }),
  fetchApplication: rateLimitedProcedure
    .input(
      z.object({
        applicantId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const supabaseClient = await createClientServer(true);

      const { data, error } = await supabaseClient
        .from("applicants")
        .select("id, status, scheduled_at, platform, job_listings(title)")
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
        job_listings: { title: string } | null;
      };

      const responseData = {
        id: typedData.id,
        status: typedData.status,
        scheduledAt: typedData.scheduled_at,
        platform: typedData.platform,
        jobTitle: typedData.job_listings?.title ?? null,
      };

      return {
        data: responseData,
      };
    }),
});

export default jobListingRouter;
