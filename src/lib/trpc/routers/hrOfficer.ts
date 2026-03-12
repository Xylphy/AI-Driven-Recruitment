// Router for Staff-only related procedures

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { PAGE_SIZE } from "@/lib/constants";
import { createClientServer } from "@/lib/supabase/supabase";
import type { Json } from "@/types/supabase";
import {
  authorizedProcedure,
  createTRPCRouter,
  hrOfficerProcedure,
} from "../init";

const hrOfficerRouter = createTRPCRouter({
  assignedJobs: hrOfficerProcedure
    .input(
      z.object({
        query: z.string().optional(),
        limit: z.number().optional().default(PAGE_SIZE),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const supabase = await createClientServer(true);

      const query = supabase
        .from("job_listings")
        .select("*, applicants(id)")
        // biome-ignore lint/style/noNonNullAssertion: JWT is guaranteed to be present by hrOfficerProcedure
        .eq("staff_id", ctx.userJWT!.id)
        .limit(input.limit)
        .order("created_at", { ascending: false });

      if (input.cursor) {
        query.lt("created_at", input.cursor);
      }

      if (input.query) {
        query.ilike("title", `%${input.query}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching jobs as Staff", error);
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
          applicant_count: item.applicants?.length || 0,
        })),

        nextCursor:
          data && data.length === input.limit
            ? data[data.length - 1]?.created_at
            : undefined,
      };
    }),
  deleteHRReport: authorizedProcedure
    .input(
      z.object({
        reportId: z.uuid(),
        staffId: z.uuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, role } = ctx.userJWT ?? {};
      if (id !== input.staffId && role !== "SuperAdmin" && role !== "Admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to delete this HR report.",
        });
      }

      const supabase = await createClientServer(true);

      const { error: deleteReportError } = await supabase
        .from("hr_reports")
        .delete()
        .eq("id", input.reportId);

      if (deleteReportError) {
        console.error("Error deleting HR Report:", deleteReportError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete HR report",
        });
      }

      const { error: insertLogError } = await supabase
        .from("audit_logs")
        .insert({
          // biome-ignore lint/style/noNonNullAssertion: JWT is guaranteed to be present by hrOfficerProcedure
          actor_type: ctx.userJWT!.role,
          // biome-ignore lint/style/noNonNullAssertion: JWT is guaranteed to be present by hrOfficerProcedure
          actor_id: ctx.userJWT!.id,
          action: "delete",
          event_type: "Deleted Staff Evaluation",
          entity_type: "Staff Evaluation",
          entity_id: input.reportId,
          changes: {},
          details: `HR Report with ID ${input.reportId} deleted`,
        });

      if (insertLogError) {
        console.error(
          "Error inserting audit log for HR Report deletion:",
          insertLogError,
        );
      }

      return { success: true };
    }),
  editHRReport: authorizedProcedure
    .input(
      z.object({
        reportId: z.uuid(),
        score: z.number().min(0).max(5),
        keyHighlights: z.string(),
        summary: z.string().optional(),
        staffId: z.uuid(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.userJWT?.id !== input.staffId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to edit this HR report.",
        });
      }

      const supabase = await createClientServer(true);

      const { data: oldData, error: oldDataError } = await supabase
        .from("hr_reports")
        .select("score, summary")
        .eq("id", input.reportId)
        .single();

      if (oldDataError || !oldData) {
        console.error("Error fetching existing HR Report:", oldDataError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch existing HR report",
        });
      }

      const [updateRes, deleteRes] = await Promise.all([
        supabase
          .from("hr_reports")
          .update({
            score: input.score,
            summary: input.summary || "",
          })
          .eq("id", input.reportId)
          .select()
          .single(),
        supabase
          .from("key_highlights")
          .delete()
          .eq("report_id", input.reportId),
      ]);

      const { data: updatedReport, error: updateError } = updateRes;
      const { error: deleteError } = deleteRes;

      if (deleteError) {
        console.error("Error deleting Key Highlights:", deleteError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove old key highlights",
        });
      }

      if (updateError || !updatedReport) {
        console.error("Error updating HR Report:", updateError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update HR report",
        });
      }

      const { error: keyHighlightError } = await supabase
        .from("key_highlights")
        .insert(
          input.keyHighlights
            .split(",")
            .map((h) => h.trim())
            .filter(Boolean)
            .map((highlight) => ({
              report_id: input.reportId,
              highlight,
            })),
        );

      if (keyHighlightError) {
        console.error("Error inserting Key Highlights:", keyHighlightError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit key highlights",
        });
      }

      const changes: Json = {};

      if (oldData.score !== input.score) {
        changes.score = {
          before: oldData.score.toString(),
          after: input.score.toString(),
        };
      }
      if (oldData.summary !== input.summary) {
        changes.summary = {
          before: oldData.summary || "",
          after: input.summary || "",
        };
      }

      const { error: insertLogError } = await supabase
        .from("audit_logs")
        .insert({
          // biome-ignore lint/style/noNonNullAssertion: JWT is guaranteed to be present by hrOfficerProcedure
          actor_type: ctx.userJWT!.role,
          // biome-ignore lint/style/noNonNullAssertion: JWT is guaranteed to be present by hrOfficerProcedure
          actor_id: ctx.userJWT!.id,
          action: "update",
          event_type: "Updated Staff Evaluation",
          entity_type: "Staff Evaluation",
          entity_id: input.reportId,
          changes,
          details: `HR Report with ID ${input.reportId} updated`,
        });

      if (insertLogError) {
        console.error(
          "Error inserting audit log for HR Report update:",
          insertLogError,
        );
      }

      return { success: true, report: updatedReport };
    }),
});

export default hrOfficerRouter;
