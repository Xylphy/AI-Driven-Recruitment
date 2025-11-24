import z from "zod";
import {
  authenticatedProcedure,
  authorizedProcedure,
  createTRPCRouter,
} from "../init";
import { TRPCError } from "@trpc/server";
import { createClientServer } from "@/lib/supabase/supabase";
import { findWithJoin, find, updateTable } from "@/lib/supabase/action";
import { findOne } from "@/lib/mongodb/action";
import mongoDb_client from "@/lib/mongodb/mongodb";
import { JobApplicant, User } from "@/types/schema";
import auth from "@/lib/firebase/admin";
import { ObjectId } from "mongodb";

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
  updateCandidateStatus: authenticatedProcedure
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

      const { error } = await updateTable(
        await createClientServer(1, true),
        "job_applicants",
        "id",
        input.applicantId,
        {
          status: input.newStatus,
        }
      );

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update candidate status",
        });
      }

      return { message: "Candidate status updated successfully" };
    }),
});

export default candidateRouter;
