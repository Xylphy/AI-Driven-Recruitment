/**
 * Router for admin-related procedures
 */

import {
  adminProcedure,
  createTRPCRouter,
  rateLimitedProcedure,
} from "../init";
import { TRPCError } from "@trpc/server";
import { createClientServer } from "@/lib/supabase/supabase";
import { countTable, find, insertTable } from "@/lib/supabase/action";
import {
  ActiveJob,
  JobListing,
  User,
  WeeklyCumulativeApplicants,
} from "@/types/schema";
import { z } from "zod";
import { auth } from "@/lib/firebase/admin";
import { BottleneckPercentileRow } from "@/types/types";
import { USER_ACTION_EVENT_TYPES, USER_ROLES } from "@/lib/constants";

const adminRouter = createTRPCRouter({
  fetchStats: adminProcedure.query(async ({ ctx }) => {
    if (ctx.userJWT!.role === "User") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have permission to access this resource",
      });
    }
    const supabase = await createClientServer(1, true);

    const { data: dailyActiveJobs, error: dailyActiveJobsError } =
      await find<ActiveJob>(supabase, "daily_active_jobs_last_7_days")
        .many()
        .execute();

    if (dailyActiveJobsError) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          dailyActiveJobsError?.message || "Failed to fetch daily active jobs",
      });
    }

    const { data: totalCandidates, error: totalCandidatesError } =
      await countTable(supabase, "job_applicants");

    if (totalCandidatesError) {
      console.error("Error fetching total candidates", totalCandidatesError);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          totalCandidatesError?.message || "Failed to fetch total candidates",
      });
    }

    const { data: weeklyApplicants, error: weeklyApplicantsError } =
      await find<WeeklyCumulativeApplicants>(
        supabase,
        "weekly_applicants_last_4_weeks"
      )
        .many()
        .execute();

    if (weeklyApplicantsError) {
      console.error("Error fetching weekly applicants", weeklyApplicantsError);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          weeklyApplicantsError?.message || "Failed to fetch weekly applicants",
      });
    }

    return {
      activeJobs: dailyActiveJobs!.at(-1)?.jobs || 0,
      totalJobs: dailyActiveJobs!.at(-1)?.jobs || 0,
      totalCandidates: totalCandidates || 0,
      jobActivity: dailyActiveJobs,
      shortListed: 0,
      candidateGrowth: weeklyApplicants,
    };
  }),
  // Compare candidates
  fetchAllJobs: adminProcedure.query(async ({ ctx }) => {
    if (ctx.userJWT!.role === "User") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You do not have permission to access this resource",
      });
    }
    const supabase = await createClientServer(1, true);

    const { data: jobs, error: jobsError } = await find<JobListing>(
      supabase,
      "job_listings"
    )
      .many()
      .execute();

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
  compareCandidates: adminProcedure
    .input(
      z.object({
        applicantIdA: z.uuid(),
        applicantIdB: z.uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.userJWT!.role === "User") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to access this resource",
        });
      }

      const compareAPI = new URL("http://localhost:8000/score/");
      compareAPI.searchParams.set("applicant1_id", input.applicantIdA);
      compareAPI.searchParams.set("applicant2_id", input.applicantIdB);

      return {
        compareResult: await fetch(compareAPI).then((res) => res.json()),
      };
    }),
  auditLogs: adminProcedure
    .input(
      z.object({
        query: z.string().optional(),
        category: z.enum([...USER_ACTION_EVENT_TYPES, "All"]),
        fromDate: z.string().optional(),
        toDate: z.string().optional(),
        limit: z.number().optional().default(20),
        cursor: z.string().optional(),
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
          ? auditLogs[auditLogs.length - 1].created_at
          : null) || null;

      return {
        auditLogs,
        nextCursor,
      };
    }),
  users: adminProcedure
    .input(
      z.object({
        searchQuery: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.userJWT!.role !== "SuperAdmin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to access this resource",
        });
      }
      const supabase = await createClientServer(1, true);

      let query = supabase.from("users").select("*").neq("role", "SuperAdmin");

      // No results when search query is empty or undefined
      if (input.searchQuery && input.searchQuery.trim() !== "") {
        query = query.or(
          `first_name.ilike.%${input.searchQuery}%,last_name.ilike.%${input.searchQuery}%,role.ilike.%${input.searchQuery}%`
        );
      }

      const { data: users, error: usersError } = await query;

      if (usersError) {
        console.error("Error fetching users", usersError);
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
        const firebaseUsersResult = await auth.getUsers(
          firebaseUids.map((uid) => ({ uid }))
        );
        firebaseUserByUid = new Map(
          firebaseUsersResult.users.map((userRecord) => [
            userRecord.uid,
            { email: userRecord.email || "" },
          ])
        );
      }

      // Merge Firebase email into users
      const usersWithEmail = (users || []).map((user) => ({
        ...user,
        email: firebaseUserByUid.get(user.firebase_uid)?.email || "",
      }));

      return {
        users: usersWithEmail as (User & { email: string })[],
      };
    }),
  changeUserRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        newRole: z.enum(USER_ROLES.filter((role) => role !== "SuperAdmin")),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.userJWT!.role !== "SuperAdmin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to access this resource",
        });
      }

      const supabase = await createClientServer(1, true);

      const { data: user, error: userError } = await find<User>(
        supabase,
        "users",
        [
          {
            column: "id",
            value: input.userId,
          },
        ]
      ).single();

      if (userError || !user) {
        console.error("Error fetching user for role change", userError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: userError?.message || "Failed to fetch user",
        });
      }

      const { error: updateError } = await supabase
        .from("users")
        .update({ role: input.newRole })
        .eq("id", input.userId);

      if (updateError) {
        console.error("Error updating user role", updateError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: updateError?.message || "Failed to update user role",
        });
      }

      const changes = {
        role: { from: user.role, to: input.newRole },
      };
      const details = `Changed role of user ${user.first_name} ${user.last_name} (ID: ${user.id}) from ${user.role} to ${input.newRole}.`;

      const { error: insertLogError } = await insertTable(
        supabase,
        "audit_logs",
        {
          actor_type: ctx.userJWT!.role,
          actor_id: ctx.userJWT!.id,
          action: "update",
          event_type: "Changed user role",
          entity_type: "User",
          entity_id: input.userId,
          changes,
          details,
        }
      );

      if (insertLogError) {
        console.error(
          "Error inserting audit log for role change",
          insertLogError
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
      })
    )
    .query(async ({ input }) => {
      const supabase = await createClientServer(1, true);

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
      })
    )
    .query(async ({ input }) => {
      const supabase = await createClientServer(1, true);

      let query = supabase.from("users").select("*").eq("role", "HR Officer");

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
        console.error("Error fetching HR Officers", hrOfficersError);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: hrOfficersError?.message || "Failed to fetch HR Officers",
        });
      }

      const userMap = new Map<string, { email: string }>();

      const firebaseUids = (hrOfficers || [])
        .map((user) => user.firebase_uid)
        .filter(Boolean);

      let firebaseUsersResult:
        | Awaited<ReturnType<typeof auth.getUsers>>
        | undefined;

      if (firebaseUids.length > 0) {
        firebaseUsersResult = await auth.getUsers(
          firebaseUids.map((uid) => ({ uid }))
        );
      }

      const jobsAssignedPromises = hrOfficers!.map((officer: User) =>
        supabase
          .from("job_listings")
          .select("title")
          .eq("officer_id", officer.id)
      );

      firebaseUsersResult?.users?.forEach((userRecord) => {
        userMap.set(userRecord.uid, { email: userRecord.email || "" });
      });

      const jobsAssignedResults = await Promise.all(jobsAssignedPromises);

      return {
        hrOfficers: hrOfficers!.map((officer: User, index: number) => ({
          ...officer,
          email: userMap.get(officer.firebase_uid)?.email || "",
          jobsAssigned:
            jobsAssignedResults[index].data?.map((job) => job.title) || [],
        })),
      };
    }),
  fetchJobs: adminProcedure
    .input(
      z.object({
        searchQuery: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const supabaseClient = await createClientServer(1, true);      let query = supabaseClient
        .from("job_listings")
        .select("*, job_applicants(id), officer:users!job_listings_officer_id_fkey(first_name, last_name)");



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
          applicant_count: item.job_applicants?.length || 0,
          officer_name: item.officer
            ? `${item.officer.first_name} ${item.officer.last_name}`
            : undefined,
        })),
      };
    }),
});

export default adminRouter;
