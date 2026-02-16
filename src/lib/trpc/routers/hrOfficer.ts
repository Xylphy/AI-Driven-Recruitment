// Router for HR Officer related procedures

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { deleteRow, find, insertTable } from "@/lib/supabase/action";
import { createClientServer } from "@/lib/supabase/supabase";
import type { AuditLog, Changes, HRReport } from "@/types/schema";
import { createTRPCRouter, hrOfficerProcedure } from "../init";

const hrOfficerRouter = createTRPCRouter({
  assignedJobs: hrOfficerProcedure
    .input(
      z.object({
        query: z.string().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const supabase = await createClientServer(1, true);

      const query = supabase
        .from("job_listings")
        .select("*, job_applicants(id)")
        .eq("officer_id", ctx.userJWT?.id);

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
  deleteHRReport: hrOfficerProcedure
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

      const supabase = await createClientServer(1, true);

      const { error: deleteReportError } = await deleteRow(
        supabase,
        "hr_reports",
        "id",
        input.reportId,
      );

      if (deleteReportError) {
        console.error("Error deleting HR Report:", deleteReportError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete HR report",
        });
      }

      const { error: insertLogError } = await insertTable(
        supabase,
        "audit_logs",
        {
          actor_type: ctx.userJWT?.role,
          actor_id: ctx.userJWT?.id,
          action: "delete",
          event_type: "Deleted HR Report",
          entity_type: "HR Report",
          entity_id: input.reportId,
          changes: {},
          details: `HR Report with ID ${input.reportId} deleted`,
        } as AuditLog,
      );

      if (insertLogError) {
        console.error(
          "Error inserting audit log for HR Report deletion:",
          insertLogError,
        );
      }

      return { success: true };
    }),
  editHRReport: hrOfficerProcedure
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

      const supabase = await createClientServer(1, true);

      const { data: oldData, error: oldDataError } = await find<HRReport>(
        supabase,
        "hr_reports",
        [
          {
            column: "id",
            value: input.reportId,
          },
        ],
      ).single();

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
            summary: input.summary,
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

      const { data: keyHighlight, error: keyHighlightError } =
        await insertTable(
          supabase,
          "key_highlights",
          input.keyHighlights
            .split(",")
            .map((h) => h.trim())
            .filter(Boolean)
            .map((highlight) => ({
              report_id: input.reportId,
              highlight,
            })),
        );

      if (keyHighlightError || !keyHighlight) {
        console.error("Error inserting Key Highlights:", keyHighlightError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit key highlights",
        });
      }

      const changes: Record<string, Changes> = {};

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

      const { error: insertLogError } = await insertTable(
        supabase,
        "audit_logs",
        {
          actor_type: ctx.userJWT?.role,
          actor_id: ctx.userJWT?.id,
          action: "update",
          event_type: "Updated HR Report",
          entity_type: "HR Report",
          entity_id: input.reportId,
          changes,
          details: `HR Report with ID ${input.reportId} updated`,
        } as AuditLog,
      );

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
