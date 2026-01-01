/**
 * Router for staff-related procedures (HR Officer, SuperAdmin, Admin)
 */

import { authorizedProcedure, createTRPCRouter } from "../init";
import { TRPCError } from "@trpc/server";
import { createClientServer } from "@/lib/supabase/supabase";
import { find, findWithJoin } from "@/lib/supabase/action";
import {
  JobListing,
  JobListingQualifications,
  JobListingRequirements,
  JobTags,
  User,
} from "@/types/schema";
import { z } from "zod";

const staffRouter = createTRPCRouter({
  getJobDetails: authorizedProcedure
    .input(
      z.object({
        jobId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.userJWT!.role === "User") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to access this resource",
        });
      }

      const supabase = await createClientServer(1, true);

      const { data: jobListing, error: errorJobListing } = await findWithJoin<
        JobListing & { users: Pick<User, "first_name" | "last_name"> }
      >(supabase, "job_listings", [
        {
          foreignTable: "users!job_listings_officer_id_fkey",
          foreignKey: "officer_id",
          fields: "first_name, last_name",
        },
      ])
        .many([{ column: "id", value: input.jobId }])
        .execute();

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
        [{ column: "joblisting_id", value: input.jobId }]
      )
        .many()
        .execute();

      const requirementsPromise = find<JobListingRequirements>(
        supabase,
        "jl_requirements",
        [{ column: "joblisting_id", value: input.jobId }]
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
        ]
      )
        .many([{ column: "joblisting_id", value: input.jobId }])
        .execute();

      const qualifications = await qualificationsPromise;
      const requirements = await requirementsPromise;
      const tags = await tagsPromise;

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

      const joblistingResponse: (typeof jobListing)[0] & {
        officer_name?: string;
      } = {
        ...jobListing[0],
      };

      joblistingResponse.officer_name = jobListing[0].users
        ? `${jobListing[0].users.first_name} ${jobListing[0].users.last_name}`
        : undefined;

      return {
        ...joblistingResponse,
        requirements: requirements.data?.map((item) => item.requirement) || [],
        qualifications:
          qualifications.data?.map((item) => item.qualification) || [],
        tags: (tags.data || []).map((item) => item.tags.name),
        users: undefined,
      };
    }),
});

export default staffRouter;
