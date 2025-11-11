import {
  authorizedProcedure,
  createTRPCRouter,
  rateLimitedProcedure,
} from "../init";
import { z } from "zod";
import { createClientServer } from "@/lib/supabase/supabase";
import {
  User,
  Skills,
  SocialLinks,
  EducationalDetails,
  JobExperiences,
} from "@/types/schema";
import { find } from "@/lib/supabase/action";
import { getFileInfo } from "@/lib/cloudinary/cloudinary";
import { TRPCError } from "@trpc/server";
import mongoDb_client from "@/lib/mongodb/mongodb";
import { getTokenData } from "@/lib/mongodb/action";

const userRouter = createTRPCRouter({
  fetchMyInformation: authorizedProcedure
    .input(
      z.object({
        skills: z.boolean().optional().default(false),
        socialLinks: z.boolean().optional().default(false),
        education: z.boolean().optional().default(false),
        experience: z.boolean().optional().default(false),
        personalDetails: z.boolean().optional().default(false),
      })
    )
    .query(async ({ input, ctx }) => {
      const supabase = await createClientServer(1, true);
      const decoded = ctx.userJWT!;

      const [
        userData,
        skillsData,
        socialLinksData,
        educationData,
        experienceData,
      ] = await Promise.all([
        input.personalDetails &&
          find<User>(supabase, "users", [
            { column: "id", value: decoded.id },
          ]).single(),
        input.skills &&
          find<Skills>(supabase, "skills", [
            { column: "user_id", value: decoded.id },
          ])
            .many()
            .execute(),
        input.socialLinks &&
          find<SocialLinks>(supabase, "social_links", [
            { column: "user_id", value: decoded.id },
          ])
            .many()
            .execute(),
        input.education &&
          find<EducationalDetails>(supabase, "educational_details", [
            { column: "user_id", value: decoded.id },
          ])
            .many()
            .execute(),
        input.experience &&
          find<JobExperiences>(supabase, "job_experiences", [
            { column: "user_id", value: decoded.id },
          ])
            .many()
            .execute(),
      ]);

      if (
        [
          userData,
          skillsData,
          socialLinksData,
          educationData,
          experienceData,
        ].some(
          (data) =>
            data && typeof data === "object" && "error" in data && data.error
        )
      ) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch user information",
        });
      }

      let resumeInfo = null;
      let transcriptInfo = null;
      if (userData) {
        [resumeInfo, transcriptInfo] = await Promise.all([
          userData.data?.resume_id
            ? getFileInfo(userData.data.resume_id)
            : null,
          userData.data?.transcript_id
            ? getFileInfo(userData.data.transcript_id)
            : null,
        ]);
      }

      return {
        user: userData
          ? {
              ...userData.data,
              id: undefined,
              resume_id: resumeInfo
                ? resumeInfo.url.split("resumes/")[1]
                : null,
              transcript_id: transcriptInfo
                ? transcriptInfo.url.split("transcripts/")[1]
                : null,
            }
          : null,
        skills: skillsData ? skillsData.data?.map((skill) => skill.skill) : [],
        socialLinks: socialLinksData
          ? socialLinksData.data?.map((link) => link.link)
          : [],
        education: educationData
          ? educationData.data?.map((education) => ({
              ...education,
              id: undefined,
              user_id: undefined,
            }))
          : [],
        experience: experienceData
          ? experienceData.data?.map((experience) => ({
              ...experience,
              id: undefined,
              user_id: undefined,
            }))
          : [],
      };
    }),
  retrieveEmailInVerificationToken: rateLimitedProcedure
    .input(
      z.object({
        id: z.string().min(1, "ID is required"),
      })
    )
    .query(async ({ input }) => {
      await mongoDb_client.connect();

      const tokenData = await getTokenData(input.id);
      if (!tokenData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Token not found",
        });
      }

      await mongoDb_client.close();

      return tokenData.email;
    }),
});

export default userRouter;
