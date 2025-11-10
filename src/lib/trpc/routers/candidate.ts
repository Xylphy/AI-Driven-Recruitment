import z from "zod";
import { authorizedProcedure, createTRPCRouter } from "../init";
import { TRPCError } from "@trpc/server";
import { createClientServer } from "@/lib/supabase/supabase";
import { findWithJoin, QueryFilter } from "@/lib/supabase/action";
import { findOne } from "@/lib/mongodb/action";
import mongoDb_client from "@/lib/mongodb/mongodb";
import { JobApplicants, User } from "@/types/schema";
import auth from "@/lib/firebase/admin";

const candidateRouter = createTRPCRouter({
  getCandidateFromJob: authorizedProcedure
    .input(
      z.object({
        jobId: z.uuid(),
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
            JobApplicants & {
              users: Pick<
                User,
                "id" | "last_name" | "first_name" | "firebase_uid"
              >;
              job_listings: { title: string };
            }
          >
        ).map(async (applicant) => ({
          ...applicant,
          ...applicant.users,
          email: (await auth.getUser(applicant.users.firebase_uid)).email,
          users: undefined,
          candidateMatch: await getCandidateMatch(applicant.users.id),
        }))
      );

      await mongoDb_client.close();

      return {
        message: "Success",
        data: applicantWithEmail.map((applicant) => ({
          id: applicant.id,
          name: applicant.first_name + " " + applicant.last_name,
          email: applicant.email,
          predictiveSuccess: applicant.candidateMatch,
          status: applicant.status,
          jobTitle: applicant.job_listings.title,
        })),
      };
    }),
});

export default candidateRouter;
