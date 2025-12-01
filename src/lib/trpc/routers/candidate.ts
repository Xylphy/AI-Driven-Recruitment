import z from "zod";
import {
  authorizedProcedure,
  createTRPCRouter,
  rateLimitedProcedure,
} from "../init";
import { TRPCError } from "@trpc/server";
import { createClientServer } from "@/lib/supabase/supabase";
import { findWithJoin, find, updateTable } from "@/lib/supabase/action";
import { findOne } from "@/lib/mongodb/action";
import mongoDb_client from "@/lib/mongodb/mongodb";
import { JobApplicant, User } from "@/types/schema";
import admin, { auth, db } from "@/lib/firebase/admin";
import { ObjectId } from "mongodb";
import { Notification } from "@/types/types";

const candidateRouter = createTRPCRouter({
  getCandidateFromJob: authorizedProcedure
    .input(
      z.object({
        jobId: z.uuid().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.userJWT!.isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to access this resource",
        });
      }

      const supabaseClient = await createClientServer(1, true);

      const { data: applicantsWithUsers, error: errorApplicants } =
        await findWithJoin(supabaseClient, "job_applicants", [
          {
            foreignTable: "users",
            foreignKey: "user_id",
            fields: "id, first_name, last_name, firebase_uid",
          },
          {
            foreignTable: "job_listings",
            foreignKey: "joblisting_id",
            fields: "title",
          },
        ])
          .many(
            input.jobId ? [{ column: "joblisting_id", value: input.jobId }] : []
          )
          .execute();

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

      const applicantWithEmail = await Promise.all(
        (
          (applicantsWithUsers || []) as Array<
            JobApplicant & {
              users: Pick<
                User,
                "id" | "last_name" | "first_name" | "firebase_uid"
              >;
              job_listings: { title: string };
            }
          >
        )
          // Bottleneck here: fetching email and mongodb data for each applicant instead of promise.all of them
          .map(async (applicant) => {
            const [firebaseUser, candidateMatch] = await Promise.all([
              auth.getUser(applicant.users.firebase_uid),
              getCandidateMatch(applicant.users.id),
            ]);

            return {
              applicantId: applicant.id,
              ...applicant,
              ...applicant.users,
              email: firebaseUser.email,
              users: undefined,
              candidateMatch,
            };
          })
      );

      await mongoDb_client.close();

      return {
        applicants: applicantWithEmail
          .map((applicant) => ({
            id: applicant.applicantId,
            name: applicant.first_name + " " + applicant.last_name,
            email: applicant.email,
            predictiveSuccess: applicant.candidateMatch,
            status: applicant.status,
            jobTitle: applicant.job_listings.title,
          }))
          .sort(
            (applicantA, applicantB) =>
              applicantB.predictiveSuccess - applicantA.predictiveSuccess
          ),
      };
    }),
  fetchCandidateProfile: authorizedProcedure
    .input(
      z.object({
        fetchScore: z.boolean().optional().default(false),
        fetchTranscribed: z.boolean().optional().default(false),
        fetchResume: z.boolean().optional().default(false),
        candidateId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.userJWT!.isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to access this resource",
        });
      }
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
        status: jobApplicant?.status || "",
      };
    }),
  updateCandidateStatus: rateLimitedProcedure
    .input(
      z.object({
        applicantId: z.string(),
        newStatus: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.userJWT!.isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to access this resource",
        });
      }

      const supabase = await createClientServer(1, true);

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

      // Narrow the result without using `any`
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

      return {
        message: "Candidate status updated successfully",
        notificationSuccess,
      };
    }),
});

export default candidateRouter;
