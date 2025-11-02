import { createTRPCRouter, rateLimitedProcedure } from "../init";
import { z } from "zod";
import { createClientServer } from "@/lib/supabase/supabase";
import { find, findWithJoin } from "@/lib/supabase/action";
import { JobApplicants, JobListing, Admin } from "@/types/schema";

export const jobListingRouter = createTRPCRouter({
  joblistings: rateLimitedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).optional().default(10),
          page: z.number().min(1).optional().default(1),
        })
        .optional()
    )
    .query(async ({ input, ctx }) => {
      const limit = input?.limit ?? 100;
      const offset = ((input?.page ?? 1) - 1) * limit;
      const userId = ctx.userJWT?.id;

      const supabase = await createClientServer(1, true);

      const { data: adminData } = await find<Admin>(supabase, "admins", [
        { column: "user_id", value: userId },
      ]).single();

      if (adminData) {
        const [themResults, allResults] = await Promise.all([
          find<JobListing>(supabase, "job_listings", [
            { column: "created_by", value: userId },
          ])
            .many()
            .range(offset, offset + limit - 1)
            .order("created_at", { ascending: false })
            .execute(),
          find<JobListing>(supabase, "job_listings")
            .many()
            .range(offset, offset + limit - 1)
            .order("created_at", { ascending: false })
            .execute(),
        ]);

        if (themResults.error || allResults.error) {
          throw new Error("Failed to fetch job listings");
        }

        return {
          createdByThem:
            themResults.data?.map((item) => ({
              id: item.id,
              title: item.title,
              created_at: item.created_at,
            })) ?? [],
          createdByAll:
            allResults.data?.map((item) => ({
              id: item.id,
              title: item.title,
              created_at: item.created_at,
            })) ?? [],
        };
      } else {
        const { data: appliedData, error: appliedError } = await findWithJoin<
          JobApplicants & { job_listings: JobListing }
        >(supabase, "job_applicants", [
          {
            foreignTable: "job_listings",
            foreignKey: "joblisting_id",
            fields: "title",
          },
        ])
          .many()
          .execute();

        if (appliedError) {
          throw new Error("Failed to fetch applied jobs");
        }

        return (
          appliedData?.map((item) => ({
            ...item,
            ...item.job_listings,
            job_listings: undefined,
          })) ?? []
        );
      }
    }),
});
