import z from "zod";
import { adminProcedure, createTRPCRouter } from "../init";
import { TRPCError } from "@trpc/server";
import { createClientServer } from "@/lib/supabase/supabase";
import {
  findWithJoin,
  find,
  updateTable,
  insertTable,
} from "@/lib/supabase/action";
import { findOne } from "@/lib/mongodb/action";
import mongoDb_client from "@/lib/mongodb/mongodb";
import {
  AdminFeedback,
  AuditLog,
  Changes,
  JobApplicant,
  User,
} from "@/types/schema";
import admin, { auth, db } from "@/lib/firebase/admin";
import { ObjectId } from "mongodb";
import { Notification } from "@/types/types";
import { CANDIDATE_STATUSES } from "@/lib/constants";

type AICompareRes = {
  better_candidate: string;
  reason: string;
  highlights: string[];
  recommendations: string;
};

const candidateRouter = createTRPCRouter({
  getCandidateFromJob: adminProcedure
    .input(
      z.object({
        jobId: z.uuid().optional(),
        searchQuery: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const supabaseClient = await createClientServer(1, true);

      const baseQuery = findWithJoin<JobApplicant>(
        supabaseClient,
        "job_applicants",
        [
          {
            foreignTable: "users",
            foreignKey: "user_id",
            fields: "id, first_name, last_name, firebase_uid, resume_id",
          },
          {
            foreignTable: "job_listings",
            foreignKey: "joblisting_id",
            fields: "title",
          },
        ]
      );

      let queryBuilder = baseQuery.many(
        input.jobId ? [{ column: "joblisting_id", value: input.jobId }] : []
      );

      if (input.searchQuery) {
        const search = `%${input.searchQuery}%`;
        queryBuilder = {
          ...queryBuilder,
          execute: async () => {
            let query = supabaseClient
              .from("job_applicants")
              .select(
                `*, users(id, first_name, last_name, firebase_uid, resume_id), job_listings(title)`
              );
            if (input.jobId) {
              query = query.eq("joblisting_id", input.jobId);
            }
            query = query.or(
              `users.first_name.ilike.${search},users.last_name.ilike.${search},job_listings.title.ilike.${search},status.ilike.${search}`
            );
            const result = await query;
            return {
              data: result.data as typeof applicantsWithUsers,
              error: result.error,
            };
          },
        };
      }
      const { data: applicantsWithUsers, error: errorApplicants } =
        await queryBuilder.execute();

      if (errorApplicants) {
        console.error("Error fetching applicants:", errorApplicants);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch applicants",
        });
      }

      async function getCandidateMatch(userId: string) {
        const candidateMatch = await findOne(
          "ai-driven-recruitment",
          "scored_candidates",
          {
            user_id: userId,
          }
        );
        return candidateMatch?.score_data?.predictive_success || 0;
      }

      await mongoDb_client.connect();

      // Batch fetch Firebase users
      const applicantsArr = (applicantsWithUsers || []) as Array<
        JobApplicant & {
          users: Pick<
            User,
            "id" | "last_name" | "first_name" | "firebase_uid" | "resume_id"
          >;
          job_listings: { title: string };
        }
      >;

      const firebaseUidToApplicant = new Map<
        string,
        (typeof applicantsArr)[number]
      >();
      const userIdToApplicant = new Map<
        string,
        (typeof applicantsArr)[number]
      >();

      const firebaseUids: string[] = [];
      const userIds: string[] = [];

      for (const applicant of applicantsArr) {
        firebaseUidToApplicant.set(applicant.users.firebase_uid, applicant);
        userIdToApplicant.set(applicant.users.id, applicant);
        firebaseUids.push(applicant.users.firebase_uid);
        userIds.push(applicant.users.id);
      }

      // Batch fetch Firebase users
      const firebaseUsersResult = await auth.getUsers(
        firebaseUids.map((uid) => ({ uid }))
      );
      const firebaseUserByUid = new Map<string, { email: string }>();
      for (const userRecord of firebaseUsersResult.users) {
        firebaseUserByUid.set(userRecord.uid, {
          email: userRecord.email || "",
        });
      }

      // Batch fetch candidate matches from MongoDB
      const candidateMatchPromises = userIds.map(async (userId) => {
        const candidateMatch = await getCandidateMatch(userId);
        return { userId, candidateMatch };
      });
      const candidateMatches = await Promise.all(candidateMatchPromises);
      const candidateMatchByUserId = new Map<string, number>();
      for (const { userId, candidateMatch } of candidateMatches) {
        candidateMatchByUserId.set(userId, candidateMatch);
      }

      // Merge all data
      const applicantWithEmail = applicantsArr.map((applicant) => {
        const firebaseUser = firebaseUserByUid.get(
          applicant.users.firebase_uid
        );
        const candidateMatch =
          candidateMatchByUserId.get(applicant.users.id) || 0;
        return {
          applicantId: applicant.id,
          ...applicant,
          ...applicant.users,
          email: firebaseUser?.email || "",
          users: undefined,
          candidateMatch,
        };
      });

      await mongoDb_client.close();

      return {
        applicants: applicantWithEmail
          .map((applicant) => ({
            id: applicant.applicantId,
            user_id: applicant.user_id,
            name: applicant.first_name + " " + applicant.last_name,
            email: applicant.email,
            predictiveSuccess: applicant.candidateMatch,
            status: applicant.status,
            jobTitle: applicant.job_listings.title,
            resumeId: applicant.resume_id,
          }))
          .sort(
            (applicantA, applicantB) =>
              applicantB.predictiveSuccess - applicantA.predictiveSuccess
          ),
      };
    }),
  fetchCandidateProfile: adminProcedure
    .input(
      z.object({
        fetchScore: z.boolean().optional().default(false),
        fetchTranscribed: z.boolean().optional().default(false),
        fetchResume: z.boolean().optional().default(false),
        candidateId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const supabaseClient = await createClientServer(1, true);

      const { data: jobApplicant, error: jobApplicantError } =
        await find<JobApplicant>(supabaseClient, "job_applicants", [
          { column: "id", value: input.candidateId },
        ]).single();

      if (jobApplicantError) {
        console.error("Error fetching job applicants", jobApplicantError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch candidate profile",
        });
      }

      await mongoDb_client.connect();

      const [parsedResume, score, transcribed, userData] = await Promise.all([
        input.fetchResume &&
          findOne("ai-driven-recruitment", "parsed_resume", {
            user_id: jobApplicant!.user_id,
          }),
        input.fetchScore &&
          findOne("ai-driven-recruitment", "scored_candidates", {
            _id: ObjectId.createFromHexString(jobApplicant!.score_id),
          }),
        input.fetchTranscribed &&
          findOne("ai-driven-recruitment", "transcribed", {
            user_id: jobApplicant!.user_id,
          }),
        find<User>(supabaseClient, "users", [
          { column: "id", value: jobApplicant!.user_id },
        ]).single(),
      ]);

      await mongoDb_client.close();

      return {
        parsedResume: parsedResume || null,
        score: score || null,
        transcribed: transcribed || null,
        user: {
          firstName: userData.data?.first_name || "",
          lastName: userData.data?.last_name || "",
        },
        status: jobApplicant?.status ?? null,
      };
    }),
  updateCandidateStatus: adminProcedure
    .input(
      z.object({
        applicantId: z.string(),
        newStatus: z.enum(CANDIDATE_STATUSES).nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const supabase = await createClientServer(1, true);

      const { data: oldData, error: oldDataError } = await find<JobApplicant>(
        supabase,
        "job_applicants",
        [{ column: "id", value: input.applicantId }]
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
        "job_applicants",
        {
          status: input.newStatus,
        },
        [{ column: "id", value: input.applicantId }],
        "user_id, joblisting_id"
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
        typeof updatedRow?.user_id === "string"
          ? (updatedRow.user_id as string)
          : undefined;
      const joblistingId =
        typeof updatedRow?.joblisting_id === "string"
          ? (updatedRow.joblisting_id as string)
          : undefined;

      if (!userId) {
        console.error("No userId in updated row");

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Updated row missing user_id",
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

      if (oldData!.status !== input.newStatus) {
        changes["status"] = {
          before: oldData!.status || "null",
          after: input.newStatus || "null",
        };
      }

      const details = `Changed status to "${input.newStatus}" for applicant ID ${input.applicantId}`;

      const { error: insertLogError } = await insertTable(
        supabase,
        "audit_logs",
        {
          actor_type: ctx.userJWT!.role,
          actor_id: ctx.userJWT!.id,
          action: "update",
          event_type: "Changed candidate status",
          entity_type: "Job Applicant",
          entity_id: input.applicantId,
          changes,
          details,
        } as AuditLog
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
      })
    )
    .mutation(async ({ input }) => {
      const { error } = await updateTable(
        await createClientServer(1, true),
        "job_applicants",
        {
          admin_feedback: input.feedback,
        },
        [{ column: "id", value: input.candidateId }]
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
      })
    )
    .query(async ({ input }) => {
      const { data: adminFeedback, error: jobApplicantError } =
        await find<AdminFeedback>(
          await createClientServer(1, true),
          "admin_feedback",
          [{ column: "applicant_id", value: input.candidateId }]
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
      })
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
  postAdminFeedback: adminProcedure
    .input(
      z.object({
        candidateId: z.uuid(),
        feedback: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const supabase = await createClientServer(1, true);

      const { error } = await supabase.from("admin_feedback").upsert({
        applicant_id: input.candidateId,
        feedback: input.feedback,
        created_at: new Date().toISOString(),
        admin_id: ctx.userJWT!.id,
      });

      if (error) {
        console.error("Error posting admin feedback ", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to post admin feedback",
        });
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
      })
    )
    .query(async ({ input }) => {
      const supabase = await createClientServer(1, true);

      const { data, error } = await supabase
        .from("admin_feedback")
        .select(
          "*, admin:users!admin_id(first_name, last_name), applicant:job_applicants!applicant_id(user:users!user_id(first_name, last_name)))"
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
        adminFeedbacks: (data || []) as unknown as (AdminFeedback & {
          admin: {
            last_name: string;
            first_name: string;
          };
          applicant: {
            user: {
              last_name: string;
              first_name: string;
            };
          };
        })[],
      };
    }),
  updateAdminFeedback: adminProcedure
    .input(
      z.object({
        feedbackId: z.uuid(),
        newFeedback: z.uuid(),
      })
    )
    .mutation(async ({ input }) => {
      const supabase = await createClientServer(1, true);

      const { error } = await supabase
        .from("admin_feedback")
        .update({ feedback: input.newFeedback })
        .eq("id", input.feedbackId);

      if (error) {
        console.error("Error updating admin feedback ", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update admin feedback",
        });
      }

      return {
        message: "Admin feedback updated successfully",
      };
    }),
  deleteAdminFeedback: adminProcedure
    .input(
      z.object({
        feedbackId: z.uuid(),
      })
    )
    .mutation(async ({ input }) => {
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

      return {
        message: "Admin feedback deleted successfully",
      };
    }),
});
export default candidateRouter;
