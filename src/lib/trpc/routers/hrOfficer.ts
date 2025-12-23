import { TRPCError } from "@trpc/server";
import { authorizedProcedure, createTRPCRouter } from "../init";
import { createClientServer } from "@/lib/supabase/supabase";
import { z } from "zod";

const hrOfficerRouter = createTRPCRouter({
  assignedJobs: authorizedProcedure
    .input(
      z.object({
        query: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (ctx.userJWT!.role !== "HR Officer") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to access this resource.",
        });
      }
      const supabase = await createClientServer(1, true);

      const query = supabase
        .from("job_listings")
        .select("*, job_applicants(id)")
        .eq("officer_id", ctx.userJWT!.id);

      if (input.query) {
        query.ilike("title", `%${input.query}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching jobs as HR Officer", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch assigned jobs.",
        });
      }

      return {
        jobs: (data || []).map((item) => ({
          id: item.id,
          title: item.title,
          created_at: item.created_at,
          is_fulltime: item.is_fulltime,
          location: item.location,
          applicant_count: item.job_applicants?.length || 0,
        })),
      };
    }),
});

export default hrOfficerRouter;
