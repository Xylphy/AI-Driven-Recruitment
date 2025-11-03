import { authorizedProcedure, createTRPCRouter } from "../init";
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

      return {
        user: userData
          ? {
              ...userData.data,
              id: undefined,
              resume_id:
                userData.data?.resume_id &&
                (await getFileInfo(userData.data.resume_id)).url.split(
                  "resumes/"
                )[1],
              transcript_id:
                userData.data?.transcript_id &&
                (await getFileInfo(userData.data.transcript_id)).url.split(
                  "transcripts/"
                )[1],
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
});

export default userRouter;
