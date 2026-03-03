


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."action_type" AS ENUM (
    'create',
    'update',
    'delete'
);


ALTER TYPE "public"."action_type" OWNER TO "postgres";


CREATE TYPE "public"."audit_entity_type" AS ENUM (
    'Applicant', 
    'Job Listing',
    'Admin Feedback',
    'Staff Report',
    'Staff'
);


ALTER TYPE "public"."audit_entity_type" OWNER TO "postgres";


COMMENT ON TYPE "public"."audit_entity_type" IS 'Entity types for audit logs';



CREATE TYPE "public"."audit_event_type" AS ENUM (
    'Joblisting modified',
    'Joblisting deleted',
    'Created joblisting',
    'Applied for job',
    'Changed user role',
    'Changed candidate status',
    'Admin feedback created',
    'Admin feedback deleted',
    'Admin feedback updated',
    'Created HR Report',
    'Deleted HR Report',
    'Updated HR Report',
    'Created staff account',
    'Staff password updated'
);


ALTER TYPE "public"."audit_event_type" OWNER TO "postgres";


COMMENT ON TYPE "public"."audit_event_type" IS 'Event types for audit logs';



CREATE TYPE "public"."candidate_status" AS ENUM (
    'Paper Screening',
    'Exam',
    'HR Interview',
    'Technical Interview',
    'Final Interview',
    'Job Offer',
    'Accepted Job Offer',
    'Close Status'
);


ALTER TYPE "public"."candidate_status" OWNER TO "postgres";


CREATE TYPE "public"."user_roles" AS ENUM (
    'SuperAdmin',
    'Admin',
    'Staff',
    'Applicant'
);


ALTER TYPE "public"."user_roles" OWNER TO "postgres";


COMMENT ON TYPE "public"."user_roles" IS 'Roles';



CREATE OR REPLACE FUNCTION "public"."compute_hiring_success_and_time_to_hire"("from_ts" timestamp without time zone DEFAULT ("now"() - '30 days'::interval), "to_ts" timestamp without time zone DEFAULT "now"()) RETURNS TABLE("metric_type" "text", "status_or_stage" "text", "value" numeric, "p50" numeric, "p75" numeric, "p90" numeric)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Hiring success rate (%)
    RETURN QUERY
    WITH latest_status AS (
        SELECT DISTINCT ON (entity_id) 
            entity_id AS applicant_id,
            changes -> 'status' ->> 'after' AS current_status
        FROM audit_logs
        WHERE event_type = 'Changed candidate status'
          AND entity_type = 'Applicant'
          AND created_at >= from_ts
          AND created_at < to_ts
          AND changes ? 'status'
        ORDER BY entity_id, created_at DESC
    )
    SELECT 
        'success_rate_pct'::TEXT AS metric_type,
        NULL::TEXT AS status_or_stage,
        (ROUND(100.0 * 
            COUNT(*) FILTER (WHERE ls.current_status = 'Accepted Job Offer') / 
            NULLIF(COUNT(*), 0), 1))::NUMERIC AS value,
        NULL::NUMERIC AS p50,
        NULL::NUMERIC AS p75,
        NULL::NUMERIC AS p90
    FROM applicants a
    LEFT JOIN latest_status ls ON ls.applicant_id = a.id
    WHERE a.created_at >= from_ts AND a.created_at < to_ts;

    -- Avg time to hire (in days)
    RETURN QUERY
    WITH status_events AS (
        SELECT
            entity_id AS candidate_id,
            created_at AS entered_at,
            (changes -> 'status' ->> 'after') AS status
        FROM public.audit_logs
        WHERE event_type = 'Changed candidate status'
          AND entity_type = 'Applicant'
          AND (changes ? 'status')
          AND (changes -> 'status' ? 'after')
          AND created_at >= from_ts
          AND created_at < to_ts
    ),
    time_to_hire AS (
        SELECT 
            se.candidate_id,
            MIN(se.entered_at) FILTER (WHERE se.status = 'Accepted Job Offer') AS hire_date,
            a.created_at AS first_touch
        FROM status_events se
        JOIN applicants a ON a.id = se.candidate_id
        WHERE a.created_at >= from_ts AND a.created_at < to_ts
        GROUP BY se.candidate_id, a.created_at
        HAVING MIN(se.entered_at) FILTER (WHERE se.status = 'Accepted Job Offer') IS NOT NULL
    )
    SELECT
        'avg_time_to_hire_days'::TEXT AS metric_type,
        NULL::TEXT AS status_or_stage,
        (AVG(EXTRACT(EPOCH FROM (hire_date - first_touch)) / 86400.0))::NUMERIC AS value,
        NULL::NUMERIC AS p50,
        NULL::NUMERIC AS p75,
        NULL::NUMERIC AS p90
    FROM time_to_hire;

END;
$$;


ALTER FUNCTION "public"."compute_hiring_success_and_time_to_hire"("from_ts" timestamp without time zone, "to_ts" timestamp without time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."count_applicants_by_status"() RETURNS TABLE("status" "public"."candidate_status", "applicants_count" bigint)
    LANGUAGE "sql" STABLE
    AS $$
  select
    status,
    count(*) as applicants_count
  from public.applicants
  group by status
  order by count(*) desc;
$$;


ALTER FUNCTION "public"."count_applicants_by_status"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_bottleneck_percentiles"("from_ts" timestamp with time zone, "to_ts" timestamp with time zone) RETURNS TABLE("status" "text", "samples" bigint, "p50_seconds" double precision, "p75_seconds" double precision, "p90_seconds" double precision, "p50_interval" interval, "p75_interval" interval, "p90_interval" interval)
    LANGUAGE "sql" STABLE
    AS $$
with status_events as (
  select
    entity_id as candidate_id,
    created_at as entered_at,
    (changes -> 'status' ->> 'after') as status
  from public.audit_logs
  where event_type = 'Changed candidate status'
    and entity_type = 'Applicant'
    and (changes ? 'status')
    and (changes -> 'status' ? 'after')
    and created_at >= from_ts
    and created_at <  to_ts
),
status_spans as (
  select
    candidate_id,
    status,
    entered_at,
    lead(entered_at) over (partition by candidate_id order by entered_at) as exited_at
  from status_events
),
durations as (
  select
    candidate_id,
    status,
    entered_at,
    exited_at,
    extract(epoch from (coalesce(exited_at, now()) - entered_at)) as duration_seconds
  from status_spans
  where status is not null
    and coalesce(exited_at, now()) > entered_at
)
select
  status,
  count(*) as samples,
  percentile_cont(0.50) within group (order by duration_seconds) as p50_seconds,
  percentile_cont(0.75) within group (order by duration_seconds) as p75_seconds,
  percentile_cont(0.90) within group (order by duration_seconds) as p90_seconds,
  make_interval(secs => percentile_cont(0.50) within group (order by duration_seconds)) as p50_interval,
  make_interval(secs => percentile_cont(0.75) within group (order by duration_seconds)) as p75_interval,
  make_interval(secs => percentile_cont(0.90) within group (order by duration_seconds)) as p90_interval
from durations
group by status
order by p90_seconds desc;
$$;


ALTER FUNCTION "public"."get_bottleneck_percentiles"("from_ts" timestamp with time zone, "to_ts" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_hiring_kpis"("start_date" "date", "end_date" "date") RETURNS "jsonb"
    LANGUAGE "sql" STABLE
    AS $$
WITH filtered_applicants AS (
  SELECT 
    a.*,
    jl.title AS job_title,
    jl.created_at AS job_created_at
  FROM applicants a
  JOIN job_listings jl ON a.joblisting_id = jl.id
  WHERE a.created_at >= start_date AND a.created_at <= end_date
),
hires AS (
  SELECT 
    entity_id AS applicant_id,
    created_at AS hire_date
  FROM audit_logs
  WHERE event_type = 'Changed candidate status'
    AND changes ->> 'after' = 'Accepted Job Offer'
    AND created_at >= start_date AND created_at <= end_date
),
aggregated AS (
  SELECT 
    job_title,
    COUNT(*) AS applicants,
    COUNT(*) FILTER (WHERE status IN ('HR Interview', 'Technical Interview', 'Final Interview')) AS interviewed,
    COUNT(*) FILTER (WHERE status = 'Job Offer') AS offers,
    COUNT(*) FILTER (WHERE status = 'Accepted Job Offer') AS hired,
    AVG(EXTRACT(DAY FROM h.hire_date - fa.created_at))::integer AS avg_time_to_hire_days,
    MAX(EXTRACT(DAY FROM h.hire_date - fa.job_created_at))::integer AS max_time_to_fill_days,
    CASE 
      WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE status = 'Accepted Job Offer')::float / COUNT(*) * 100)::numeric(5,2)
      ELSE 0
    END AS success_rate
  FROM filtered_applicants fa
  LEFT JOIN hires h ON fa.id = h.applicant_id
  GROUP BY job_title
),
totals AS (
  SELECT 
    COALESCE(SUM(applicants), 0) AS total_applicants,
    COALESCE(AVG(avg_time_to_hire_days), 0)::integer AS overall_avg_time_to_hire,
    COALESCE(MAX(max_time_to_fill_days), 0)::integer AS overall_max_time_to_fill,
    COALESCE(AVG(success_rate), 0)::numeric(5,2) AS overall_success_rate,
    COALESCE(SUM(interviewed), 0) AS total_interviewed,
    COALESCE(SUM(offers), 0) AS total_offers,
    COALESCE(SUM(hired), 0) AS total_hired
  FROM aggregated
)
SELECT jsonb_build_object(
  'total_applicants', totals.total_applicants,
  'avg_time_to_hire', totals.overall_avg_time_to_hire,
  'max_time_to_fill', totals.overall_max_time_to_fill,
  'hiring_success_rate', totals.overall_success_rate,
  'per_job_breakdown', COALESCE((SELECT jsonb_agg(aggregated.* ORDER BY job_title) FROM aggregated), '[]'::jsonb),
  'funnel_distribution', jsonb_build_object(
    'applicants', totals.total_applicants,
    'interviewed', totals.total_interviewed,
    'offers', totals.total_offers,
    'hired', totals.total_hired
  ),
  'timeline_metrics', jsonb_build_object(
    'avg_time_to_hire', totals.overall_avg_time_to_hire,
    'max_time_to_fill', totals.overall_max_time_to_fill
  )
) AS kpi_data
FROM totals;
$$;


ALTER FUNCTION "public"."get_hiring_kpis"("start_date" "date", "end_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_hiring_kpis"("from_ts" timestamp without time zone, "to_ts" timestamp without time zone) RETURNS TABLE("metric_type" "text", "status_or_stage" "text", "value" numeric, "p50" numeric, "p75" numeric, "p90" numeric)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Bottlenecks (original query)
    RETURN QUERY
    WITH status_events AS (
        SELECT
            entity_id AS candidate_id,
            created_at AS entered_at,
            (changes -> 'status' ->> 'after') AS status
        FROM public.audit_logs
        WHERE event_type = 'Changed candidate status'
          AND entity_type = 'Applicant'
          AND (changes ? 'status')
          AND (changes -> 'status' ? 'after')
          AND created_at >= from_ts
          AND created_at < to_ts
    ),
    status_spans AS (
        SELECT
            candidate_id,
            status,
            entered_at,
            LEAD(entered_at) OVER (PARTITION BY candidate_id ORDER BY entered_at) AS exited_at
        FROM status_events
    ),
    durations AS (
        SELECT
            candidate_id,
            status,
            entered_at,
            exited_at,
            EXTRACT(EPOCH FROM (COALESCE(exited_at, NOW()) - entered_at)) AS duration_seconds
        FROM status_spans
        WHERE status IS NOT NULL
          AND COALESCE(exited_at, NOW()) > entered_at
    )
    SELECT
        'bottleneck'::TEXT AS metric_type,
        status AS status_or_stage,
        COUNT(*)::NUMERIC AS value,  -- samples
        (PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY duration_seconds))::NUMERIC AS p50,
        (PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY duration_seconds))::NUMERIC AS p75,
        (PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY duration_seconds))::NUMERIC AS p90
    FROM durations
    GROUP BY status
    ORDER BY p90 DESC;

    -- Total applicants
    RETURN QUERY
    SELECT
        'total_applicants'::TEXT AS metric_type,
        NULL::TEXT AS status_or_stage,
        COUNT(*)::NUMERIC AS value,
        NULL::NUMERIC AS p50,
        NULL::NUMERIC AS p75,
        NULL::NUMERIC AS p90
    FROM applicants
    WHERE created_at >= from_ts AND created_at < to_ts;

    -- Avg time to hire (in days) - with its own status_events CTE
    RETURN QUERY
    WITH status_events AS (
        SELECT
            entity_id AS candidate_id,
            created_at AS entered_at,
            (changes -> 'status' ->> 'after') AS status
        FROM public.audit_logs
        WHERE event_type = 'Changed candidate status'
          AND entity_type = 'Applicant'
          AND (changes ? 'status')
          AND (changes -> 'status' ? 'after')
          AND created_at >= from_ts
          AND created_at < to_ts
    ),
    time_to_hire AS (
        SELECT 
            se.candidate_id,
            MIN(se.entered_at) FILTER (WHERE se.status = 'Accepted Job Offer') AS hire_date,
            a.created_at AS first_touch
        FROM status_events se
        JOIN applicants a ON a.id = se.candidate_id
        WHERE a.created_at >= from_ts AND a.created_at < to_ts
        GROUP BY se.candidate_id, a.created_at
        HAVING MIN(se.entered_at) FILTER (WHERE se.status = 'Accepted Job Offer') IS NOT NULL
    )
    SELECT
        'avg_time_to_hire_days'::TEXT AS metric_type,
        NULL::TEXT AS status_or_stage,
        (AVG(EXTRACT(EPOCH FROM (hire_date - first_touch)) / 86400.0))::NUMERIC AS value,
        NULL::NUMERIC AS p50,
        NULL::NUMERIC AS p75,
        NULL::NUMERIC AS p90
    FROM time_to_hire;

    -- Hiring success rate (%)
    RETURN QUERY
    WITH latest_status AS (
        SELECT DISTINCT ON (entity_id) 
            entity_id AS applicant_id,
            changes -> 'status' ->> 'after' AS current_status
        FROM audit_logs
        WHERE event_type = 'Changed candidate status'
          AND entity_type = 'Applicant'
          AND created_at >= from_ts
          AND created_at < to_ts
          AND changes ? 'status'
        ORDER BY entity_id, created_at DESC
    )
    SELECT 
        'success_rate_pct'::TEXT AS metric_type,
        NULL::TEXT AS status_or_stage,
        (ROUND(100.0 * 
            COUNT(*) FILTER (WHERE ls.current_status = 'Accepted Job Offer') / 
            NULLIF(COUNT(*), 0), 1))::NUMERIC AS value,
        NULL::NUMERIC AS p50,
        NULL::NUMERIC AS p75,
        NULL::NUMERIC AS p90
    FROM applicants a
    LEFT JOIN latest_status ls ON ls.applicant_id = a.id
    WHERE a.created_at >= from_ts AND a.created_at < to_ts;

    -- Funnel distribution (counts per stage)
    RETURN QUERY
    WITH latest_status AS (
        SELECT DISTINCT ON (entity_id) 
            entity_id AS applicant_id,
            changes -> 'status' ->> 'after' AS current_status
        FROM audit_logs
        WHERE event_type = 'Changed candidate status'
          AND entity_type = 'Applicant'
          AND created_at >= from_ts
          AND created_at < to_ts
          AND changes ? 'status'
        ORDER BY entity_id, created_at DESC
    )
    SELECT 
        'funnel'::TEXT AS metric_type,
        COALESCE(ls.current_status, 'Paper Screening') AS status_or_stage,
        COUNT(a.id)::NUMERIC AS value,
        NULL::NUMERIC AS p50,
        NULL::NUMERIC AS p75,
        NULL::NUMERIC AS p90
    FROM applicants a
    LEFT JOIN latest_status ls ON ls.applicant_id = a.id
    WHERE a.created_at >= from_ts AND a.created_at < to_ts
    GROUP BY 2
    ORDER BY 
        CASE COALESCE(ls.current_status, 'Paper Screening')
            WHEN 'Paper Screening'      THEN 1
            WHEN 'Exam'                 THEN 2
            WHEN 'HR Interview'         THEN 3
            WHEN 'Technical Interview'  THEN 4
            WHEN 'Final Interview'      THEN 5
            WHEN 'Job Offer'            THEN 6
            WHEN 'Accepted Job Offer'   THEN 7
            ELSE 8
        END;

    -- Per-role counts (applicants, interviewed, offers, hired)
    RETURN QUERY
    WITH status_events AS (
        SELECT
            entity_id AS candidate_id,
            created_at AS entered_at,
            (changes -> 'status' ->> 'after') AS status
        FROM public.audit_logs
        WHERE event_type = 'Changed candidate status'
          AND entity_type = 'Applicant'
          AND (changes ? 'status')
          AND (changes -> 'status' ? 'after')
          AND created_at >= from_ts
          AND created_at < to_ts
    ),
    latest_status AS (
        SELECT DISTINCT ON (candidate_id) 
            candidate_id,
            status AS current_status
        FROM status_events
        ORDER BY candidate_id, entered_at DESC
    ),
    per_role_counts AS (
        SELECT 
            jl.title AS job_title,
            COUNT(a.id) AS applicants,
            COUNT(DISTINCT CASE WHEN ls.current_status IN ('HR Interview', 'Technical Interview', 'Final Interview', 'Job Offer', 'Accepted Job Offer') THEN a.id END) AS interviewed,
            COUNT(DISTINCT CASE WHEN ls.current_status IN ('Job Offer', 'Accepted Job Offer') THEN a.id END) AS offers,
            COUNT(DISTINCT CASE WHEN ls.current_status = 'Accepted Job Offer' THEN a.id END) AS hired
        FROM applicants a
        JOIN job_listings jl ON jl.id = a.joblisting_id
        LEFT JOIN latest_status ls ON ls.candidate_id = a.id
        WHERE a.created_at >= from_ts AND a.created_at < to_ts
        GROUP BY jl.title
    )
    SELECT 
        'per_role'::TEXT AS metric_type,
        job_title::TEXT AS status_or_stage,
        applicants::NUMERIC AS value,
        interviewed::NUMERIC AS p50,
        offers::NUMERIC AS p75,
        hired::NUMERIC AS p90
    FROM per_role_counts;

    -- Per-role times and rates (avg_time_to_hire, time_to_fill, success_rate)
    RETURN QUERY
    WITH status_events AS (
        SELECT
            entity_id AS candidate_id,
            created_at AS entered_at,
            (changes -> 'status' ->> 'after') AS status
        FROM public.audit_logs
        WHERE event_type = 'Changed candidate status'
          AND entity_type = 'Applicant'
          AND (changes ? 'status')
          AND (changes -> 'status' ? 'after')
          AND created_at >= from_ts
          AND created_at < to_ts
    ),
    latest_status AS (
        SELECT DISTINCT ON (candidate_id) 
            candidate_id,
            status AS current_status
        FROM status_events
        ORDER BY candidate_id, entered_at DESC
    ),
    time_to_hire AS (
        SELECT 
            se.candidate_id,
            MIN(se.entered_at) FILTER (WHERE se.status = 'Accepted Job Offer') AS hire_date,
            a.created_at AS first_touch
        FROM status_events se
        JOIN applicants a ON a.id = se.candidate_id
        WHERE a.created_at >= from_ts AND a.created_at < to_ts
        GROUP BY se.candidate_id, a.created_at
        HAVING MIN(se.entered_at) FILTER (WHERE se.status = 'Accepted Job Offer') IS NOT NULL
    ),
    filled_jobs AS (
        SELECT 
            a.joblisting_id,
            jl.created_at AS opened_at,
            MAX(tt.hire_date) AS filled_at  -- Use MAX for time to last hire; change to MIN if time to first
        FROM applicants a
        JOIN time_to_hire tt ON tt.candidate_id = a.id
        JOIN job_listings jl ON jl.id = a.joblisting_id
        GROUP BY a.joblisting_id, jl.created_at
        HAVING MAX(tt.hire_date) IS NOT NULL
    ),
    per_role_times AS (
        SELECT 
            jl.title AS job_title,
            AVG(EXTRACT(EPOCH FROM (tt.hire_date - tt.first_touch)) / 86400.0)::NUMERIC AS avg_time_to_hire_days,
            AVG(EXTRACT(EPOCH FROM (fj.filled_at - fj.opened_at)) / 86400.0)::NUMERIC AS avg_time_to_fill_days,
            ROUND(100.0 * 
                COUNT(DISTINCT CASE WHEN ls.current_status = 'Accepted Job Offer' THEN a.id END) / 
                NULLIF(COUNT(a.id), 0), 1)::NUMERIC AS success_rate_pct
        FROM applicants a
        JOIN job_listings jl ON jl.id = a.joblisting_id
        LEFT JOIN latest_status ls ON ls.candidate_id = a.id
        LEFT JOIN time_to_hire tt ON tt.candidate_id = a.id
        LEFT JOIN filled_jobs fj ON fj.joblisting_id = a.joblisting_id
        WHERE a.created_at >= from_ts AND a.created_at < to_ts
        GROUP BY jl.title
    )
    SELECT 
        'per_role_times'::TEXT AS metric_type,
        job_title::TEXT AS status_or_stage,
        avg_time_to_hire_days AS value,
        avg_time_to_fill_days AS p50,
        success_rate_pct AS p75,
        NULL::NUMERIC AS p90
    FROM per_role_times;

END;
$$;


ALTER FUNCTION "public"."get_hiring_kpis"("from_ts" timestamp without time zone, "to_ts" timestamp without time zone) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_feedback" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "applicant_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "feedback" "text",
    "admin_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);


ALTER TABLE "public"."admin_feedback" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."applicant_skills" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "applicant_id" "uuid" NOT NULL,
    "tag_id" bigint NOT NULL,
    "rating" smallint DEFAULT '0'::smallint NOT NULL,
    CONSTRAINT "applicant_skills_rating_check" CHECK ((("rating" >= 0) AND ("rating" <= 5)))
);


ALTER TABLE "public"."applicant_skills" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."applicants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "joblisting_id" "uuid" NOT NULL,
    "first_name" character varying NOT NULL,
    "last_name" character varying NOT NULL,
    "resume_id" "text" NOT NULL,
    "street" "text",
    "zip" "text",
    "city" "text",
    "state" "text",
    "parsed_resume_id" "text",
    "transcript_id" "text" NOT NULL,
    "transcribed_id" "text",
    "status" "public"."candidate_status" DEFAULT 'Paper Screening'::"public"."candidate_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "email" "text",
    "contact_number" "text",
    "score_id" "text",
    "scheduled_at" timestamp with time zone,
    "platform" "text"
);


ALTER TABLE "public"."applicants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "actor_type" "public"."user_roles" NOT NULL,
    "actor_id" "uuid",
    "action" "public"."action_type" NOT NULL,
    "event_type" "public"."audit_event_type" NOT NULL,
    "entity_type" "public"."audit_entity_type" NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "changes" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "details" "text" NOT NULL
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversation_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "message" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "role" "text" NOT NULL,
    CONSTRAINT "conversation_messages_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'assistant'::"text"])))
);


ALTER TABLE "public"."conversation_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_listings" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" character varying NOT NULL,
    "location" character varying NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_by" "uuid" NOT NULL,
    "is_fulltime" boolean DEFAULT true NOT NULL,
    "officer_id" "uuid"
);


ALTER TABLE "public"."job_listings" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."daily_active_jobs_last_7_days" WITH ("security_invoker"='on') AS
 WITH "days" AS (
         SELECT ("generate_series"(("date_trunc"('day'::"text", "now"()) - '6 days'::interval), "date_trunc"('day'::"text", "now"()), '1 day'::interval))::"date" AS "d"
        )
 SELECT "d"."d" AS "date",
    (EXTRACT(dow FROM "d"."d"))::integer AS "dow",
    "to_char"(("d"."d")::timestamp with time zone, 'FMDay'::"text") AS "weekday",
    "count"("j"."id") AS "jobs"
   FROM ("days" "d"
     LEFT JOIN "public"."job_listings" "j" ON ((("j"."created_at")::"date" <= "d"."d")))
  GROUP BY "d"."d"
 HAVING ((EXTRACT(dow FROM "d"."d") >= (1)::numeric) AND (EXTRACT(dow FROM "d"."d") <= (5)::numeric))
  ORDER BY "d"."d";


ALTER VIEW "public"."daily_active_jobs_last_7_days" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."hr_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "applicant_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "staff_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "score" real NOT NULL,
    "summary" "text" NOT NULL,
    "candidate_status" "public"."candidate_status" DEFAULT 'Paper Screening'::"public"."candidate_status" NOT NULL,
    CONSTRAINT "score_range" CHECK ((("score" >= (0)::double precision) AND ("score" <= (5)::double precision)))
);


ALTER TABLE "public"."hr_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."jl_qualifications" (
    "qualification" "text" NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "joblisting_id" "uuid" NOT NULL
);


ALTER TABLE "public"."jl_qualifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."jl_requirements" (
    "requirement" "text" NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "joblisting_id" "uuid" NOT NULL
);


ALTER TABLE "public"."jl_requirements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_tags" (
    "joblisting_id" "uuid" NOT NULL,
    "tag_id" bigint NOT NULL
);


ALTER TABLE "public"."job_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."key_highlights" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "report_id" "uuid" NOT NULL,
    "highlight" "text" NOT NULL
);


ALTER TABLE "public"."key_highlights" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."social_links" (
    "link" "text" NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "applicant_id" "uuid" NOT NULL
);


ALTER TABLE "public"."social_links" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."staff" (
    "first_name" character varying NOT NULL,
    "last_name" character varying NOT NULL,
    "firebase_uid" "text" NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "role" "public"."user_roles" NOT NULL
);


ALTER TABLE "public"."staff" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tags" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" GENERATED ALWAYS AS ("regexp_replace"("lower"("name"), '\s+'::"text", '-'::"text", 'g'::"text")) STORED
);


ALTER TABLE "public"."tags" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."tags_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."tags_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."tags_id_seq" OWNED BY "public"."tags"."id";



CREATE OR REPLACE VIEW "public"."weekly_applicants_last_4_weeks" WITH ("security_invoker"='on') AS
 WITH "weeks" AS (
         SELECT "generate_series"(("date_trunc"('week'::"text", "now"()) - '21 days'::interval), "date_trunc"('week'::"text", "now"()), '7 days'::interval) AS "week_start"
        )
 SELECT ("week_start")::"date" AS "week_start",
    (("week_start" + '6 days'::interval))::"date" AS "week_end",
    "to_char"("week_start", 'IYYY-IW'::"text") AS "iso_week",
    ( SELECT "count"(*) AS "count"
           FROM "public"."applicants" "a"
          WHERE (("a"."created_at" >= "weeks"."week_start") AND ("a"."created_at" < ("weeks"."week_start" + '7 days'::interval)))) AS "applicants"
   FROM "weeks"
  ORDER BY (("week_start")::"date");


ALTER VIEW "public"."weekly_applicants_last_4_weeks" OWNER TO "postgres";


ALTER TABLE ONLY "public"."tags" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."tags_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."admin_feedback"
    ADD CONSTRAINT "admin_feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."applicant_skills"
    ADD CONSTRAINT "applicant_skills_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."applicants"
    ADD CONSTRAINT "applicants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversation_messages"
    ADD CONSTRAINT "conversation_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hr_reports"
    ADD CONSTRAINT "hr_report_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."jl_qualifications"
    ADD CONSTRAINT "jl_qualifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."jl_requirements"
    ADD CONSTRAINT "jl_requirements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_listings"
    ADD CONSTRAINT "job_listings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_tags"
    ADD CONSTRAINT "job_tags_pkey" PRIMARY KEY ("joblisting_id", "tag_id");



ALTER TABLE ONLY "public"."key_highlights"
    ADD CONSTRAINT "key_highlights_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."social_links"
    ADD CONSTRAINT "social_links_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_slug_unique" UNIQUE ("slug");



ALTER TABLE ONLY "public"."staff"
    ADD CONSTRAINT "users_firebase_uid_key" UNIQUE ("firebase_uid");



ALTER TABLE ONLY "public"."staff"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "conversation_messages_conv_time_idx" ON "public"."conversation_messages" USING "btree" ("conversation_id", "created_at" DESC);



CREATE INDEX "users_firebase_uid_idx" ON "public"."staff" USING "btree" ("firebase_uid");



ALTER TABLE ONLY "public"."admin_feedback"
    ADD CONSTRAINT "admin_feedback_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."staff"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."admin_feedback"
    ADD CONSTRAINT "admin_feedback_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "public"."applicants"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."applicant_skills"
    ADD CONSTRAINT "applicant_skills_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "public"."applicants"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."applicant_skills"
    ADD CONSTRAINT "applicant_skills_skill_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."applicants"
    ADD CONSTRAINT "applicants_joblisting_id_fkey" FOREIGN KEY ("joblisting_id") REFERENCES "public"."job_listings"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."staff"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."hr_reports"
    ADD CONSTRAINT "hr_report_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "public"."applicants"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."hr_reports"
    ADD CONSTRAINT "hr_report_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."jl_qualifications"
    ADD CONSTRAINT "jl_qualifications_joblisting_id_fkey" FOREIGN KEY ("joblisting_id") REFERENCES "public"."job_listings"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."jl_requirements"
    ADD CONSTRAINT "jl_requirements_joblisting_id_fkey" FOREIGN KEY ("joblisting_id") REFERENCES "public"."job_listings"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_listings"
    ADD CONSTRAINT "job_listings_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."staff"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_listings"
    ADD CONSTRAINT "job_listings_officer_id_fkey" FOREIGN KEY ("officer_id") REFERENCES "public"."staff"("id");



ALTER TABLE ONLY "public"."job_tags"
    ADD CONSTRAINT "job_tags_job_id_fkey" FOREIGN KEY ("joblisting_id") REFERENCES "public"."job_listings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_tags"
    ADD CONSTRAINT "job_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."key_highlights"
    ADD CONSTRAINT "key_highlights_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."hr_reports"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."social_links"
    ADD CONSTRAINT "social_links_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "public"."applicants"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE "public"."admin_feedback" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."applicant_skills" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."applicants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversation_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hr_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."jl_qualifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."jl_requirements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."job_listings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."job_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."key_highlights" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."social_links" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."staff" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tags" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."compute_hiring_success_and_time_to_hire"("from_ts" timestamp without time zone, "to_ts" timestamp without time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."count_applicants_by_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_bottleneck_percentiles"("from_ts" timestamp with time zone, "to_ts" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_hiring_kpis"("start_date" "date", "end_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_hiring_kpis"("from_ts" timestamp without time zone, "to_ts" timestamp without time zone) TO "service_role";


















GRANT ALL ON TABLE "public"."admin_feedback" TO "service_role";



GRANT ALL ON TABLE "public"."applicant_skills" TO "service_role";



GRANT ALL ON TABLE "public"."applicants" TO "service_role";



GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."conversation_messages" TO "service_role";



GRANT ALL ON TABLE "public"."job_listings" TO "service_role";



GRANT ALL ON TABLE "public"."daily_active_jobs_last_7_days" TO "service_role";



GRANT ALL ON TABLE "public"."hr_reports" TO "service_role";



GRANT ALL ON TABLE "public"."jl_qualifications" TO "service_role";



GRANT ALL ON TABLE "public"."jl_requirements" TO "service_role";



GRANT ALL ON TABLE "public"."job_tags" TO "service_role";



GRANT ALL ON TABLE "public"."key_highlights" TO "service_role";



GRANT ALL ON TABLE "public"."social_links" TO "service_role";



GRANT ALL ON TABLE "public"."staff" TO "service_role";



GRANT ALL ON TABLE "public"."tags" TO "service_role";



GRANT ALL ON SEQUENCE "public"."tags_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."weekly_applicants_last_4_weeks" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";


