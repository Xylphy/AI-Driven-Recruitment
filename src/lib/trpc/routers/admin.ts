/**
 * Router for admin-related procedures
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { EVENT_TYPES, PAGE_SIZE, REGULAR_STAFF_ROLES } from "@/lib/constants";
import { createUserWithEmailAndPassword } from "@/lib/firebase/action";
import { getAuth } from "@/lib/firebase/admin";
import { addStaffSchema } from "@/lib/schemas/user";
import { createClientServer } from "@/lib/supabase/supabase";
import type { Tables } from "@/types/supabase";
import type {
  BottleneckPercentileRow,
  ScoredCandidateData,
} from "@/types/types";
import { adminProcedure, createTRPCRouter, superAdminProcedure } from "../init";

const adminRouter = createTRPCRouter({
  fetchStats: adminProcedure.query(async () => {
    const supabase = await createClientServer(true);

    const [
      { data: dailyActiveJobs, error: dailyActiveJobsError },
      { data: totalCandidates, error: totalCandidatesError },
      {
        data: hiringSuccess_timeToHire,
        error: countFinalInterviewCandidatesError,
      },
      { data: weeklyApplicants, error: weeklyApplicantsError },
      { data: numberCandidateStatuses, error: numberCandidateStatusesError },
    ] = await Promise.all([
      supabase
        .from("daily_active_jobs_last_7_days")
        .select("date, dow, jobs, weekday"),
      supabase.from("applicants").select("*", { count: "exact", head: true }),
      supabase.rpc("compute_hiring_success_and_time_to_hire"),
      supabase
        .from("weekly_applicants_last_4_weeks")
        .select("applicants, iso_week, week_end, week_start"),
      supabase.rpc("count_applicants_by_status"),
    ]);

    if (dailyActiveJobsError) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          dailyActiveJobsError.message || "Failed to fetch daily active jobs",
      });
    }
    if (totalCandidatesError) {
      console.error("Error fetching total candidates", totalCandidatesError);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          totalCandidatesError.message || "Failed to fetch total candidates",
      });
    }
    if (countFinalInterviewCandidatesError) {
      console.error(
        "Error fetching final interview candidates",
        countFinalInterviewCandidatesError,
      );
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          countFinalInterviewCandidatesError.message ||
          "Failed to fetch final interview candidates",
      });
    }
    if (weeklyApplicantsError) {
      console.error("Error fetching weekly applicants", weeklyApplicantsError);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          weeklyApplicantsError.message || "Failed to fetch weekly applicants",
      });
    }
    if (numberCandidateStatusesError) {
      console.error(
        "Error fetching candidate statuses",
        numberCandidateStatusesError,
      );
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          numberCandidateStatusesError.message ||
          "Failed to fetch candidate statuses",
      });
    }

    return {
      activeJobs: dailyActiveJobs?.at(-1)?.jobs || 0,
      totalCandidates: totalCandidates || 0,
      candidateGrowth: weeklyApplicants,
      candidateStatuses: (numberCandidateStatuses ?? []).map(
        (row: {
          status: string;
          applicants_count: number | string | bigint;
        }) => ({
          stage: row.status,
          value: Number(row.applicants_count ?? 0),
        }),
      ),
      hiringSuccess_timeToHire,
    };
  }),
  topCandidates: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional().default(10),
      }),
    )
    .query(async ({ input }) => {
      const supabaseClient = await createClientServer(true);

      const { data, error } = await supabaseClient.rpc(
        "get_top_candidates_by_job_fit",
        { p_limit: input.limit },
      );

      if (error) {
        console.error("Error fetching user names for top candidates", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error?.message || "Failed to fetch user names for top candidates",
        });
      }

      return (data ?? []).map((row) => ({
        ...row,
        name: `${row.first_name} ${row.last_name}`,
        score_data: row.score_data as ScoredCandidateData,
      }));
    }),
  fetchAllJobs: adminProcedure.query(async () => {
    const supabase = await createClientServer(true);

    const { data: jobs, error: jobsError } = await supabase
      .from("job_listings")
      .select("*");

    if (jobsError) {
      console.error("Error fetching jobs", jobsError);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: jobsError?.message || "Failed to fetch job listings",
      });
    }

    return {
      jobs,
    };
  }),
  auditLogs: adminProcedure
    .input(
      z.object({
        query: z.string().optional(),
        category: z.enum([...EVENT_TYPES, "All"]),
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
        limit: z.number().optional().default(20),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const supabase = await createClientServer(true);
      let query = supabase.from("audit_logs").select("*").order("created_at", {
        ascending: false,
      });

      if (input.query) {
        query = query.ilike("details", `%${input.query}%`);
      }
      if (input.category && input.category !== "All") {
        query = query.eq("event_type", input.category);
      }
      if (input.fromDate) {
        query = query.gte("created_at", input.fromDate);
      }
      if (input.toDate) {
        query = query.lte("created_at", input.toDate);
      }
      if (input.cursor) {
        query = query.lt("created_at", input.cursor);
      }

      query = query.limit(input.limit);

      const { data: auditLogs, error: auditLogsError } = await query;

      if (auditLogsError) {
        console.error("Error fetching audit logs", auditLogsError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: auditLogsError?.message || "Failed to fetch audit logs",
        });
      }

      const nextCursor =
        (auditLogs && auditLogs.length === input.limit
          ? auditLogs[auditLogs.length - 1]?.created_at
          : null) || null;

      return {
        auditLogs: auditLogs,
        nextCursor,
      };
    }),
  staffs: superAdminProcedure
    .input(
      z.object({
        searchQuery: z.string().optional(),
        limit: z.number().optional().default(PAGE_SIZE),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const supabase = await createClientServer(true);

      const q = input.searchQuery?.trim();
      let users: Array<Tables<"staff">> = [];
      let usersError: { message?: string } | null = null;
      const query = supabase
        .from("staff")
        .select("*")
        .neq("role", "SuperAdmin")
        .limit(input.limit)
        .order("created_at", { ascending: false });

      if (input.cursor) {
        query.lt("created_at", input.cursor);
      }

      if (!q) {
        const { data, error } = await query;

        users = (data || []) as Array<Tables<"staff">>;
        usersError = error;
      } else {
        const matchingRoles = REGULAR_STAFF_ROLES.filter((role) =>
          role.toLowerCase().includes(q.toLowerCase()),
        );

        const [nameResult, roleResult] = await Promise.all([
          supabase
            .from("staff")
            .select("*")
            .neq("role", "SuperAdmin")
            .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%`)
            .limit(input.limit),
          matchingRoles.length > 0
            ? supabase
                .from("staff")
                .select("*")
                .neq("role", "SuperAdmin")
                .in(
                  "role",
                  matchingRoles as Array<
                    "Admin" | "SuperAdmin" | "Staff" | "Applicant"
                  >,
                )
                .limit(input.limit)
            : Promise.resolve({ data: [], error: null }),
        ]);

        usersError = nameResult.error || roleResult.error;
        const merged = [...(nameResult.data || []), ...(roleResult.data || [])];
        const uniqueById = new Map(merged.map((u) => [u.id, u]));
        users = Array.from(uniqueById.values()).slice(0, input.limit) as Array<
          Tables<"staff">
        >;
      }

      if (usersError) {
        console.error("Error fetching staffs", usersError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: usersError?.message || "Failed to fetch users",
        });
      }

      // Batch fetch Firebase emails
      const firebaseUids = (users || [])
        .map((user) => user.firebase_uid)
        .filter(Boolean);

      let firebaseUserByUid = new Map<string, { email: string }>();

      if (firebaseUids.length > 0) {
        const firebaseUsersResult = await getAuth().getUsers(
          firebaseUids.map((uid) => ({ uid })),
        );
        firebaseUserByUid = new Map(
          firebaseUsersResult.users.map((userRecord) => [
            userRecord.uid,
            { email: userRecord.email || "" },
          ]),
        );
      }

      const usersWithEmail = (users || []).map((user) => ({
        ...user,
        email: firebaseUserByUid.get(user.firebase_uid)?.email || "",
      }));

      return {
        staffs: usersWithEmail as Array<Tables<"staff"> & { email: string }>,
        nextCursor:
          (users && users.length === input.limit
            ? users[users.length - 1]?.created_at
            : null) || null,
      };
    }),
  changeStaffRole: superAdminProcedure
    .input(
      z.object({
        userId: z.string(),
        newRole: z.enum(REGULAR_STAFF_ROLES),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const supabase = await createClientServer(true);

      const { data: staff, error: staffError } = await supabase
        .from("staff")
        .select("*")
        .eq("id", input.userId)
        .single();

      if (staffError || !staff) {
        console.error("Error fetching user for role change", staffError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: staffError?.message || "Failed to fetch user",
        });
      }

      const { error: updateError } = await supabase
        .from("staff")
        .update({
          role: input.newRole as "Admin" | "Staff" | "SuperAdmin" | "Applicant",
        })
        .eq("id", input.userId);

      if (updateError) {
        console.error("Error updating user role", updateError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: updateError?.message || "Failed to update user role",
        });
      }

      const changes = {
        role: { before: staff.role, after: input.newRole },
      };
      const details = `Changed role of staff ${staff.first_name} ${staff.last_name} (ID: ${staff.id}) from ${staff.role} to ${input.newRole}.`;

      const { error: insertLogError } = await supabase
        .from("audit_logs")
        .insert({
          // biome-ignore lint/style/noNonNullAssertion: JWT is guaranteed to be present in authorized procedures
          actor_type: ctx.userJWT!.role,
          // biome-ignore lint/style/noNonNullAssertion: JWT is guaranteed to be present in authorized procedures
          actor_id: ctx.userJWT!.id,
          action: "update",
          event_type: "Changed user role",
          entity_type: "Staff",
          entity_id: input.userId,
          changes,
          details,
        });

      if (insertLogError) {
        console.error(
          "Error inserting audit log for role change",
          insertLogError,
        );
      }

      return {
        success: true,
        message: "User role updated successfully",
      };
    }),
  getBottlenecks: adminProcedure
    .input(
      z.object({
        fromDate: z.string(), // string not date since Date objects are not serializable to JSON
        toDate: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const supabase = await createClientServer(true);

      const { data: BottleneckPercentileRow, error: bottleneckError } =
        await supabase.rpc("get_bottleneck_percentiles", {
          from_ts: input.fromDate,
          to_ts: input.toDate,
        });

      if (bottleneckError) {
        console.error("Error fetching bottleneck percentiles", bottleneckError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            bottleneckError?.message ||
            "Failed to fetch bottleneck percentiles",
        });
      }

      return {
        bottlenecks: BottleneckPercentileRow as BottleneckPercentileRow[],
      };
    }),
  fetchHrOfficers: adminProcedure
    .input(
      z.object({
        query: z.string().optional(),
        currentHRId: z.uuid().optional(),
      }),
    )
    .query(async ({ input }) => {
      const supabase = await createClientServer(true);

      let query = supabase.from("staff").select("*").eq("role", "Staff");

      if (input.currentHRId) {
        query = query.neq("id", input.currentHRId);
      }

      if (input.query && input.query.trim() !== "") {
        const q = input.query.trim();
        query = query
          .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%`)
          .limit(10);
      }

      const { data: hrOfficers, error: hrOfficersError } = await query;

      if (hrOfficersError) {
        console.error("Error fetching Staffs", hrOfficersError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: hrOfficersError?.message || "Failed to fetch Staffs",
        });
      }

      const userMap = new Map<string, { email: string }>();

      const firebaseUids = (hrOfficers || [])
        .map((user) => user.firebase_uid)
        .filter(Boolean);

      let firebaseUsersResult:
        | Awaited<ReturnType<ReturnType<typeof getAuth>["getUsers"]>>
        | undefined;

      if (firebaseUids.length > 0) {
        firebaseUsersResult = await getAuth().getUsers(
          firebaseUids.map((uid) => ({ uid })),
        );
      }

      const jobsAssignedPromises = hrOfficers?.map((officer) =>
        supabase
          .from("job_listings")
          .select("title")
          .eq("staff_id", officer.id),
      );

      firebaseUsersResult?.users?.forEach((userRecord) => {
        userMap.set(userRecord.uid, { email: userRecord.email || "" });
      });

      const jobsAssignedResults = await Promise.all(jobsAssignedPromises);

      return {
        hrOfficers: hrOfficers?.map((officer, index: number) => ({
          ...officer,
          email: userMap.get(officer.firebase_uid)?.email || "",
          jobsAssigned:
            jobsAssignedResults[index]?.data?.map((job) => job.title) || [],
        })),
      };
    }),
  fetchJobs: adminProcedure
    .input(
      z.object({
        searchQuery: z.string().optional(),
        limit: z.number().optional().default(PAGE_SIZE),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const supabaseClient = await createClientServer(true);
      let query = supabaseClient
        .from("job_listings")
        .select(
          "*, applicants(id), officer:staff!job_listings_staff_id_fkey(first_name, last_name)",
        )
        .limit(input.limit)
        .order("created_at", { ascending: false });

      if (input.cursor) {
        query = query.lt("created_at", input.cursor);
      }

      if (input.searchQuery) {
        query = query.ilike("title", `%${input.searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching jobs:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch jobs",
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
          officer_name: item.officer
            ? `${item.officer.first_name} ${item.officer.last_name}`
            : undefined,
        })),
        nextCursor:
          data && data.length === input.limit
            ? data[data.length - 1]?.created_at
            : undefined,
      };
    }),
  fetchKpiMetrics: adminProcedure
    .input(
      z.object({
        fromDate: z.string(), // string not date since Date objects are not serializable to JSON
        toDate: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const supabase = await createClientServer(true);

      const { data: kpis, error: kpiError } = await supabase.rpc(
        "get_hiring_kpis",
        {
          from_ts: input.fromDate,
          to_ts: input.toDate,
        },
      );

      if (kpiError) {
        console.error("Error fetching KPI metrics", kpiError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: kpiError?.message || "Failed to fetch KPI metrics",
        });
      }

      return {
        kpis,
      };
    }),
  addStaff: superAdminProcedure
    .input(addStaffSchema)
    .mutation(async ({ input, ctx }) => {
      const supabase = await createClientServer(true);

      const createdUser = await createUserWithEmailAndPassword(
        input.email,
        input.password,
      );

      const { data: newStaff, error } = await supabase
        .from("staff")
        .insert({
          first_name: input.firstName,
          last_name: input.lastName,
          role: input.role,
          firebase_uid: createdUser.uid,
        })
        .select("id")
        .single();

      if (error || !newStaff) {
        console.error("Error creating new staff:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create new staff member",
        });
      }

      const { error: insertLogError } = await supabase
        .from("audit_logs")
        .insert({
          // biome-ignore lint/style/noNonNullAssertion: JWT is guaranteed to be present in authorized procedures
          actor_type: ctx.userJWT!.role,
          // biome-ignore lint/style/noNonNullAssertion: JWT is guaranteed to be present in authorized procedures
          actor_id: ctx.userJWT!.id,
          action: "create",
          event_type: "Created staff account",
          entity_type: "Staff",
          entity_id: newStaff.id,
          changes: {},
          details: `Staff member ${input.firstName} ${input.lastName} created with role ${input.role}`,
        });

      if (insertLogError) {
        console.error(
          "Error inserting audit log for staff creation:",
          insertLogError,
        );
      }

      return newStaff;
    }),
});

export default adminRouter;
