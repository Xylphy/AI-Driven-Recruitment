import { TRPCError } from "@trpc/server";
import type { Db } from "mongodb";
import z from "zod";
import { CANDIDATE_STATUSES } from "@/lib/constants";
import admin, { db } from "@/lib/firebase/admin";
import { findOne } from "@/lib/mongodb/action";
import { getMongoDb } from "@/lib/mongodb/mongodb";
import {
  find,
  insertTable,
  type QueryFilter,
  updateTable,
} from "@/lib/supabase/action";
import { createClientServer } from "@/lib/supabase/supabase";
import type {
  ParsedResumeDoc,
  ScoredCandidateDoc,
  ScoredCandidateScoreData,
  TranscribedDoc,
} from "@/types/mongo_db/schema";
import type {
  AdminFeedback,
  Applicants,
  AuditLog,
  Changes,
} from "@/types/schema";
import type { Notification } from "@/types/types";
import { adminProcedure, authorizedProcedure, createTRPCRouter } from "../init";

type AICompareRes = {
  better_candidate: string;
  reason: string;
  highlights: string[];
  recommendations: string;
};

type Name = {
  first_name: string;
  last_name: string;
};

async function getCandidateMatch(applicantId: string, mongoDb: Db) {
  try {
    const candidateMatch = await mongoDb
      .collection("scored_candidates")
      .findOne({ applicant_id: applicantId });

    if (!candidateMatch) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Candidate match data not found for applicant ${applicantId}`,
      });
    }

    return Number(candidateMatch?.score_data?.job_fit_score ?? 0);
  } catch (error) {
    console.error(
      `Error fetching candidate match from MongoDB for applicant ${applicantId}`,
      error,
    );
    return 0;
  }
}

const candidateRouter = createTRPCRouter({
  // This route is only useful for /admin/applicants page and must be avoided since this route is heavy.
  getCandidatesFromJob: authorizedProcedure
    .input(
      z.object({
        jobId: z.uuid().optional(),
        searchQuery: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const supabaseClient = await createClientServer(1, true);

      let jobListingIds: string[] | undefined;

      // If HR Officer, limit to their job listings
      if (ctx.userJWT?.role === "HR Officer") {
        // Fetch job listings for this officer
        const { data: listings, error: listingsError } = await supabaseClient
          .from("job_listings")
          .select("id")
          .eq("officer_id", ctx.userJWT?.id);

        if (listingsError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch job listings for officer",
          });
        }
        jobListingIds = (listings || []).map((l: { id: string }) => l.id);

        if (jobListingIds.length === 0) {
          return { applicants: [] };
        }
      }

      // Build filters
      // If jobId is provided, filter by that instead
      let filters: QueryFilter[] = [];
      if (input.jobId) {
        filters = [{ column: "joblisting_id", value: input.jobId }];
      } else if (jobListingIds && jobListingIds.length > 0) {
        filters = [
          {
            column: "joblisting_id",
            value: jobListingIds,
          },
        ];
      }

      // Fetch applicants with joins
      let baseQuery = supabaseClient
        .from("applicants")
        .select("*, job_title: job_listings(title)");

      filters.forEach(({ column, value }) => {
        if (Array.isArray(value)) {
          baseQuery.in(column, value);
        } else {
          baseQuery.eq(column, value);
        }
      });

      if (input.searchQuery) {
        const search = `%${input.searchQuery}%`;
        baseQuery = baseQuery.or(
          `first_name.ilike.${search},last_name.ilike.${search},job_title.ilike.${search},status_text.ilike.${search}`,
        );
      }
      const { data: applicants, error: errorApplicants } = await baseQuery;

      if (errorApplicants) {
        console.error("Error fetching applicants:", errorApplicants);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch applicants",
        });
      }

      // Batch fetch Firebase users
      const applicantsArr = (applicants || []) as Array<
        Applicants & {
          job_title?: { title: string };
        }
      >;

      const userIdToApplicant = new Map<
        string,
        (typeof applicantsArr)[number]
      >();

      const userIds: string[] = [];

      for (const applicant of applicantsArr) {
        userIdToApplicant.set(applicant.id, applicant);
        userIds.push(applicant.id);
      }

      const mongoDb = await getMongoDb();

      const candidateMatchPromises = userIds.map(async (userId) => {
        const candidateMatch = await getCandidateMatch(userId, mongoDb);
        return { userId, candidateMatch };
      });
      const candidateMatchesPromise = Promise.all(candidateMatchPromises);

      const candidateMatches = await candidateMatchesPromise;

      const candidateMatchByUserId = new Map<string, number>();
      for (const { userId, candidateMatch } of candidateMatches) {
        candidateMatchByUserId.set(userId, candidateMatch);
      }

      // Merge all data
      const applicantWithEmail = applicantsArr.map((applicant) => {
        const candidateMatch = candidateMatchByUserId.get(applicant.id) || 0;
        return {
          applicantId: applicant.id,
          ...applicant,
          candidateMatch,
        };
      });

      return {
        applicants: applicantWithEmail
          .map((applicant) => ({
            id: applicant.id,
            name: `${applicant.first_name} ${applicant.last_name}`,
            predictiveSuccess: applicant.candidateMatch,
            status: applicant.status,
            resumeId: applicant.resume_id,
            jobTitle: applicant.job_title?.title || "N/A",
            email: applicant.email || "N/A",
          }))
          .sort(
            (applicantA, applicantB) =>
              applicantB.predictiveSuccess - applicantA.predictiveSuccess,
          ),
      };
    }),
  /**
   * HR Officers can access the candidate profile
   * Problem is that other HR officer can access other job applicants that's not theirs
   * Checking the integrity can slow down the response time and it's okay since the HR officers are staffs of the company
   */
  fetchCandidateProfile: authorizedProcedure
    .input(
      z.object({
        fetchScore: z.boolean().optional().default(false),
        fetchTranscribed: z.boolean().optional().default(false),
        fetchResume: z.boolean().optional().default(false),
        fetchSkills: z.boolean().optional().default(false),
        candidateId: z.string(),
        fetchSocialLinks: z.boolean().optional().default(false),
      }),
    )
    .query(async ({ input }) => {
      const supabaseClient = await createClientServer(1, true);

      const [
        parsedResume,
        score,
        transcribed,
        applicantData,
        applicantSkills,
        socialLinks,
      ] = await Promise.all([
        input.fetchResume &&
          findOne("ai-driven-recruitment", "parsed_resume", {
            applicant_id: input.candidateId,
          }),
        input.fetchScore &&
          findOne("ai-driven-recruitment", "scored_candidates", {
            applicant_id: input.candidateId,
          }),
        input.fetchTranscribed &&
          findOne("ai-driven-recruitment", "transcribed", {
            applicant_id: input.candidateId,
          }),
        find<Applicants>(supabaseClient, "applicants", [
          { column: "id", value: input.candidateId },
        ]).single(),
        input.fetchSkills
          ? supabaseClient
              .from("applicant_skills")
              .select("rating, tags(name)")
              .eq("applicant_id", input.candidateId)
          : Promise.resolve(null),
        input.fetchSocialLinks
          ? supabaseClient
              .from("social_links")
              .select("link")
              .eq("applicant_id", input.candidateId)
          : Promise.resolve(null),
      ]);

      return {
        parsedResume: parsedResume as ParsedResumeDoc | null,
        score: score as ScoredCandidateDoc | null,
        transcribed: transcribed as TranscribedDoc | null,
        user: {
          firstName: applicantData.data?.first_name || "",
          lastName: applicantData.data?.last_name || "",
        },
        status: applicantData.data?.status ?? null,
        skills:
          applicantSkills?.data?.map((skill) => {
            const tagsValue = skill.tags as
              | { name?: string }
              | Array<{ name?: string }>
              | null
              | undefined;

            const tagName = Array.isArray(tagsValue)
              ? tagsValue[0]?.name
              : tagsValue?.name;

            return {
              rating: skill.rating,
              name: tagName ?? "Unknown",
            };
          }) ?? null,
        socialLinks: socialLinks?.data?.map((link) => link.link) ?? null,
      };
    }),
  updateCandidateStatus: authorizedProcedure
    .input(
      z.object({
        applicantId: z.string(),
        newStatus: z.enum(CANDIDATE_STATUSES).nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const supabase = await createClientServer(1, true);

      const { data: oldData, error: oldDataError } = await find<Applicants>(
        supabase,
        "applicants",
        [{ column: "id", value: input.applicantId }],
      ).single();

      if (oldDataError) {
        console.error("Error fetching old job applicant data ", oldDataError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch old job applicant data",
        });
      }

      const { data, error } = await updateTable(
        supabase,
        "applicants",
        {
          status: input.newStatus,
        },
        [{ column: "id", value: input.applicantId }],
        "id, joblisting_id",
      );

      if (error) {
        console.error("Error updating candidate status ", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update candidate status",
        });
      }

      const updatedRow = Array.isArray(data)
        ? ((data as unknown[])[0] as Record<string, unknown>)
        : (data as unknown as Record<string, unknown>);

      const userId =
        typeof updatedRow?.id === "string"
          ? (updatedRow.id as string)
          : undefined;
      const joblistingId =
        typeof updatedRow?.joblisting_id === "string"
          ? (updatedRow.joblisting_id as string)
          : undefined;

      if (!userId) {
        console.error("No userId in updated row");

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Updated row missing id",
        });
      }
      if (!joblistingId) {
        console.error("No joblistingId in updated row");
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Updated row missing joblisting_id",
        });
      }

      const notification: Omit<Notification, "id"> = {
        title: "Application Status Updated",
        body: `Your application status has been updated to "${input.newStatus}".`,
        isRead: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        link: `/joblisting/${joblistingId}`,
      };

      let notificationSuccess = true;
      try {
        await db
          .collection("users")
          .doc(userId)
          .collection("notifications")
          .add(notification);
      } catch (err) {
        notificationSuccess = false;
        console.error("Failed to add notification for user", userId, err);
      }

      const changes: Record<string, Changes> = {};

      if (oldData?.status !== input.newStatus) {
        changes.status = {
          before: oldData?.status || "null",
          after: input.newStatus || "null",
        };
      }

      const details = `Changed status to "${input.newStatus}" for applicant ID ${input.applicantId}`;

      const { error: insertLogError } = await insertTable(
        supabase,
        "audit_logs",
        {
          actor_type: ctx.userJWT?.role,
          actor_id: ctx.userJWT?.id,
          action: "update",
          event_type: "Changed candidate status",
          entity_type: "Job Applicant",
          entity_id: input.applicantId,
          changes,
          details,
        } as AuditLog,
      );

      if (insertLogError) {
        console.error("Error inserting audit log for role change");
      }

      return {
        message: "Candidate status updated successfully",
        notificationSuccess,
      };
    }),
  addAdminFeedback: adminProcedure
    .input(
      z.object({
        candidateId: z.uuid(),
        feedback: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { error } = await updateTable(
        await createClientServer(1, true),
        "job_applicants",
        {
          admin_feedback: input.feedback,
        },
        [{ column: "id", value: input.candidateId }],
      );

      if (error) {
        console.error("Error adding admin feedback ", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add admin feedback",
        });
      }

      return {
        message: "Admin feedback added successfully",
      };
    }),
  getAdminFeedback: adminProcedure
    .input(
      z.object({
        candidateId: z.uuid(),
      }),
    )
    .query(async ({ input }) => {
      const { data: adminFeedback, error: jobApplicantError } =
        await find<AdminFeedback>(
          await createClientServer(1, true),
          "admin_feedback",
          [{ column: "applicant_id", value: input.candidateId }],
        )
          .many()
          .execute();

      if (jobApplicantError) {
        console.error("Error fetching job applicants", jobApplicantError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch admin feedback",
        });
      }

      return {
        adminFeedback,
      };
    }),
  fetchAICompare: adminProcedure
    .input(
      z.object({
        userId_A: z.uuid(),
        userId_B: z.uuid(),
        jobId: z.uuid(),
      }),
    )
    .query(async ({ input }) => {
      const compareAPI = new URL("http://localhost:8000/compare_candidate/");
      compareAPI.searchParams.set("applicant1_id", input.userId_A);
      compareAPI.searchParams.set("applicant2_id", input.userId_B);
      compareAPI.searchParams.set("job_id", input.jobId);

      const response = await fetch(compareAPI.toString());

      if (!response.ok) {
        console.error("Error fetching AI compare data", await response.text());
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch AI compare data",
        });
      }

      return {
        ...((await response.json()) as AICompareRes),
      };
    }),
  createAdminFeedback: adminProcedure
    .input(
      z.object({
        candidateId: z.uuid(),
        feedback: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const supabase = await createClientServer(1, true);

      const { error } = await insertTable(supabase, "admin_feedback", {
        applicant_id: input.candidateId,
        feedback: input.feedback,
        created_at: new Date().toISOString(),
        admin_id: ctx.userJWT?.id,
      } as Omit<AdminFeedback, "id">);

      if (error) {
        console.error("Error posting admin feedback ", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to post admin feedback",
        });
      }

      const { error: insertLogError } = await insertTable(
        supabase,
        "audit_logs",
        {
          actor_type: ctx.userJWT?.role,
          actor_id: ctx.userJWT?.id,
          action: "create",
          event_type: "Admin feedback created",
          entity_type: "Admin Feedback",
          entity_id: input.candidateId,
          changes: {},
          details: `Created admin feedback for candidate ID ${input.candidateId}`,
        } as AuditLog,
      );

      if (insertLogError) {
        console.error("Error inserting audit log for creating admin feedback");
      }

      return {
        message: "Admin feedback posted successfully",
      };
    }),
  fetchAdminFeedbacks: adminProcedure
    .input(
      z.object({
        candidateAId: z.uuid(), // Applicant ID, not the user ID
        candidateBId: z.uuid(), // Applicant ID, not the user ID
      }),
    )
    .query(async ({ input }) => {
      const supabase = await createClientServer(1, true);

      const { data, error } = await supabase
        .from("admin_feedback")
        .select(
          "*, admin:staff!admin_id(first_name, last_name), applicant:applicants!applicant_id(first_name, last_name)",
        )
        .in("applicant_id", [input.candidateAId, input.candidateBId]);

      if (error) {
        console.error("Error fetching admin feedbacks ", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch admin feedbacks",
        });
      }

      return {
        adminFeedbacks: (data || []) as unknown as Array<
          AdminFeedback & {
            admin: Name;
            applicant: Name;
          }
        >,
      };
    }),
  updateAdminFeedback: adminProcedure
    .input(
      z.object({
        feedbackId: z.uuid(),
        newFeedback: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const supabase = await createClientServer(1, true);

      const { data: oldData, error: oldDataError } = await find<AdminFeedback>(
        supabase,
        "admin_feedback",
        [{ column: "id", value: input.feedbackId }],
      ).single();

      if (oldDataError) {
        console.error("Error fetching old admin feedback data ", oldDataError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch old admin feedback data",
        });
      }

      const { error } = await updateTable(
        supabase,
        "admin_feedback",
        {
          feedback: input.newFeedback,
        },
        [{ column: "id", value: input.feedbackId }],
      );

      if (error) {
        console.error("Error updating admin feedback ", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update admin feedback",
        });
      }

      const changes: Record<string, Changes> = {};

      if (oldData?.feedback !== input.newFeedback) {
        changes.feedback = {
          before: oldData?.feedback || "null",
          after: input.newFeedback,
        };
      }

      const { error: insertLogError } = await insertTable(
        supabase,
        "audit_logs",
        {
          actor_type: ctx.userJWT?.role,
          actor_id: ctx.userJWT?.id,
          action: "update",
          event_type: "Admin feedback updated",
          entity_type: "Admin Feedback",
          entity_id: input.feedbackId,
          changes,
          details: `Admin feedback updated with ID ${input.feedbackId}`,
        } as AuditLog,
      );

      if (insertLogError) {
        console.error("Error inserting audit log for updating admin feedback");
      }

      return {
        message: "Admin feedback updated successfully",
      };
    }),
  deleteAdminFeedback: adminProcedure
    .input(
      z.object({
        feedbackId: z.uuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const supabase = await createClientServer(1, true);

      const { error } = await supabase
        .from("admin_feedback")
        .delete()
        .eq("id", input.feedbackId);

      if (error) {
        console.error("Error deleting admin feedback ", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete admin feedback",
        });
      }

      const { error: insertLogError } = await insertTable(
        supabase,
        "audit_logs",
        {
          actor_type: ctx.userJWT?.role,
          actor_id: ctx.userJWT?.id,
          action: "delete",
          event_type: "Admin feedback deleted",
          entity_type: "Admin Feedback",
          entity_id: input.feedbackId,
          changes: {},
          details: `Deleted admin feedback with ID ${input.feedbackId}`,
        } as AuditLog,
      );

      if (insertLogError) {
        console.error(
          "Error inserting audit log for deleting admin feedback",
          insertLogError,
        );
      }

      return {
        message: "Admin feedback deleted successfully",
      };
    }),
  // This route is only useful for /admin/ai_metrics
  getCandidates: authorizedProcedure
    .input(
      z.object({
        searchQuery: z.string().optional(),
        limit: z.number().optional().default(10),
      }),
    )
    .query(async ({ input, ctx }) => {
      const supabaseClient = await createClientServer(1, true);

      let jobListingIds: string[] | undefined;

      // If HR Officer, limit to their job listings
      if (ctx.userJWT?.role === "HR Officer") {
        // Fetch job listings for this officer
        const { data: listings, error: listingsError } = await supabaseClient
          .from("job_listings")
          .select("id")
          .eq("officer_id", ctx.userJWT?.id);

        if (listingsError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch job listings for officer",
          });
        }
        jobListingIds = (listings || []).map((l: { id: string }) => l.id);
      }

      // Fetch applicants with joins
      let baseQuery = supabaseClient
        .from("applicants")
        .select("id, first_name, last_name");

      if (jobListingIds && jobListingIds.length > 0) {
        baseQuery = baseQuery.in("joblisting_id", jobListingIds);
      }

      if (input.searchQuery) {
        const search = `%${input.searchQuery}%`;
        baseQuery = baseQuery.or(
          `first_name.ilike.${search},last_name.ilike.${search}`,
        );
      }

      const { data: applicants, error: errorApplicants } =
        await baseQuery.limit(input.limit);
      if (errorApplicants) {
        console.error("Error fetching applicants:", errorApplicants);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch applicants",
        });
      }

      return applicants;
    }),
  candidateAIBreakdown: authorizedProcedure
    .input(
      z.object({
        candidateId: z.uuid(),
      }),
    )
    .query(async ({ input }) => {
      const candidateMatch = await findOne(
        "ai-driven-recruitment",
        "scored_candidates",
        {
          applicant_id: input.candidateId,
        },
      );

      if (!candidateMatch) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Candidate match data not found",
        });
      }

      return {
        candidate: candidateMatch.score_data as ScoredCandidateScoreData,
      };
    }),
  rescoreCandidate: adminProcedure
    .input(
      z.object({
        candidateId: z.uuid(),
      }),
    )
    .mutation(async ({ input }) => {
      const { data: applicant, error: applicantError } = await find<Applicants>(
        await createClientServer(1, true),
        "applicants",
        [{ column: "id", value: input.candidateId }],
      ).single();

      if (applicantError || !applicant) {
        console.error(
          "Error fetching applicant for re-scoring",
          applicantError,
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch applicant for re-scoring",
        });
      }

      const scoreAPI = new URL("http://localhost:8000/score/");
      scoreAPI.searchParams.set("job_id", applicant.joblisting_id);
      scoreAPI.searchParams.set("applicant_id", applicant.id);
      scoreAPI.searchParams.set("resume_public_id", applicant.resume_id);
      scoreAPI.searchParams.set(
        "transcript_public_id",
        applicant.transcript_id,
      );

      fetch(scoreAPI.toString(), {
        method: "POST",
      });

      return {
        message: "Re-scoring initiated",
      };
    }),
});
export default candidateRouter;
