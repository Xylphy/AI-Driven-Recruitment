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
  AuditLog,
} from "@/types/schema";
import { deleteRow, find, insertTable } from "@/lib/supabase/action";
import { getFileInfo } from "@/lib/cloudinary/cloudinary";
import { TRPCError } from "@trpc/server";
import mongoDb_client from "@/lib/mongodb/mongodb";
import { getTokenData, findOne, deleteDocument } from "@/lib/mongodb/action";
import { ObjectId } from "mongodb";
import { EducationalDetail, JobExperience, SocialLink } from "@/types/types";

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
        console.error("Failed to fetch user information");
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
  fetchEmail: rateLimitedProcedure
    .input(z.object({ uid: z.string() }))
    .query(async ({ input }) => {
      await mongoDb_client.connect();

      const tokenData = await getTokenData(input.uid);
      if (!tokenData) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid token",
        });
      }

      await mongoDb_client.close();

      return { email: tokenData.email };
    }),
  verifyUser: rateLimitedProcedure
    .input(
      z
        .object({
          password: z
            .string()
            .min(8, "Password must be at least 8 characters long"),
          confirmPassword: z
            .string()
            .min(8, "Password must be at least 8 characters long"),
          token: z.string().min(1, "Token is required"),
          uid: z.string().min(1, "User ID is required"),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: "Passwords do not match",
          path: ["confirmPassword"],
        })
    )
    .mutation(async ({ input }) => {
      await mongoDb_client.connect();

      const data = await findOne(
        "ai-driven-recruitment",
        "verification_tokens",
        {
          _id: ObjectId.createFromHexString(input.token),
        }
      );

      if (!data) {
        console.error("Token not found");
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Token not found",
        });
      }

      const supabase = await createClientServer(1, true);

      const { data: insertedData, error } = await insertTable(
        supabase,
        "users",
        {
          first_name: data.firstName,
          last_name: data.lastName,
          phone_number: data.mobileNumber,
          prefix: data.prefix,
          firebase_uid: input.uid,
          resume_id: data.resumeId,
          transcript_id: data.transcriptId,
          country_code: data.countryCode,
          street: data.street,
          zip: data.zip,
          city: data.city,
          state: data.state_,
          country: data.country,
          job_title: data.jobTitle,
        } as User
      );

      if (error || !insertedData || !insertedData[0] || !insertedData[0].id) {
        console.error("Error inserting user into Supabase:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to insert user into Supabase",
        });
      }

      const resumeParserURL = new URL("http://localhost:8000/parseresume/");
      resumeParserURL.searchParams.set("public_id", data.resumeId);
      resumeParserURL.searchParams.set(
        "applicant_id",
        insertedData[0].id.toString()
      );

      const transcribeURL = new URL("http://localhost:8000/transcribe/");
      transcribeURL.searchParams.set("public_id", data.transcriptId);
      transcribeURL.searchParams.set(
        "applicant_id",
        insertedData[0].id.toString()
      );

      fetch(resumeParserURL.toString(), {
        method: "POST",
      }).catch((err) => {
        console.error("Error calling resume parser:", err);
      });

      fetch(transcribeURL.toString(), {
        method: "POST",
      }).catch((err) => {
        console.error("Error calling transcribe service:", err);
      });

      const userId = insertedData[0].id;
      const skills = data.skillSet?.split(",") || [];

      const results = await Promise.all([
        ...data.educationalDetails.map(
          (detail: Omit<EducationalDetail, "id">) =>
            insertTable(supabase, "educational_details", {
              user_id: userId,
              degree: detail.degree,
              institute: detail.institute,
              start_month: detail.startMonth,
              start_year: detail.startYear,
              end_month: detail.endMonth,
              end_year: detail.endYear,
              currently_pursuing: detail.currentlyPursuing,
              major: detail.major,
            })
        ),
        ...data.socialLinks.map((link: Omit<SocialLink, "id">) =>
          insertTable(supabase, "social_links", {
            user_id: userId,
            link: link.value,
          })
        ),
        ...data.jobExperiences.map((experience: Omit<JobExperience, "id">) =>
          insertTable(supabase, "job_experiences", {
            user_id: userId,
            title: experience.title,
            company: experience.company,
            start_month: experience.startMonth,
            start_year: experience.startYear,
            end_month: experience.endMonth,
            end_year: experience.endYear,
            currently_working: experience.currentlyWorking,
            summary: experience.summary,
          })
        ),
        ...skills.map((skill: string) =>
          insertTable(supabase, "skills", {
            user_id: userId,
            skill: skill.trim(),
          })
        ),
      ]);

      if (results.some((result) => result.error)) {
        console.error("Something went wrong saving the data");
        deleteRow(supabase, "users", "id", userId.toString());
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong saving data",
        });
      }

      const deleteVerificationTokenPromise = deleteDocument(
        "ai-driven-recruitment",
        "verification_tokens",
        {
          _id: ObjectId.createFromHexString(input.token),
        }
      ).single();

      const details = `User ${data.firstName} ${data.lastName} verified with user ID ${userId}`;

      const { error: insertLogError } = await insertTable(
        supabase,
        "audit_logs",
        {
          actor_type: "User",
          actor_id: userId.toString(),
          action: "create",
          event_type: "Verified email",
          entity_type: "User",
          entity_id: userId.toString(),
          changes: {},
          details,
        } as AuditLog
      );

      if (insertLogError) {
        console.error("Error inserting audit log:", insertLogError);
      }

      await deleteVerificationTokenPromise;

      await mongoDb_client.close();

      return { message: "User verified successfully" };
    }),
});

export default userRouter;
