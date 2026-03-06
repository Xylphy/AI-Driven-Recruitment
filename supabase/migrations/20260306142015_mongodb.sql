CREATE TYPE "public"."action_type" AS enum(
  'create',
  'update',
  'delete'
);

CREATE TYPE "public"."audit_entity_type" AS enum(
  'Applicant',
  'Job Listing',
  'Admin Feedback',
  'Staff Evaluation',
  'Staff'
);

CREATE TYPE "public"."audit_event_type" AS enum(
  'Joblisting modified',
  'Joblisting deleted',
  'Created joblisting',
  'Applied for job',
  'Changed user role',
  'Changed candidate status',
  'Admin feedback created',
  'Admin feedback deleted',
  'Admin feedback updated',
  'Created Staff Evaluation',
  'Deleted Staff Evaluation',
  'Updated Staff Evaluation',
  'Created staff account',
  'Staff password updated'
);

CREATE TYPE "public"."candidate_status" AS enum(
  'Paper Screening',
  'Exam',
  'HR Interview',
  'Technical Interview',
  'Final Interview',
  'Job Offer',
  'Accepted Job Offer',
  'Close Status'
);

CREATE TYPE "public"."user_roles" AS enum(
  'SuperAdmin',
  'Admin',
  'Staff',
  'Applicant'
);

CREATE SEQUENCE "public"."tags_id_seq";

CREATE TABLE "public"."admin_feedback"(
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "applicant_id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "feedback" text,
  "admin_id" uuid NOT NULL DEFAULT gen_random_uuid()
);

ALTER TABLE "public"."admin_feedback" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."applicant_skills"(
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "applicant_id" uuid NOT NULL,
  "tag_id" bigint NOT NULL,
  "rating" smallint NOT NULL DEFAULT '0'::smallint
);

ALTER TABLE "public"."applicant_skills" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."applicants"(
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "joblisting_id" uuid NOT NULL,
  "first_name" character varying NOT NULL,
  "last_name" character varying NOT NULL,
  "resume_id" text NOT NULL,
  "street" text,
  "zip" text,
  "city" text,
  "state" text,
  "parsed_resume_id" uuid,
  "transcript_id" text NOT NULL,
  "transcribed_id" uuid,
  "status" public.candidate_status NOT NULL DEFAULT 'Paper Screening'::public.candidate_status,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "email" text,
  "contact_number" text,
  "score_id" uuid,
  "scheduled_at" timestamp with time zone,
  "platform" text
);

ALTER TABLE "public"."applicants" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."audit_logs"(
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "actor_type" public.user_roles NOT NULL,
  "actor_id" uuid,
  "action" public.action_type NOT NULL,
  "event_type" public.audit_event_type NOT NULL,
  "entity_type" public.audit_entity_type NOT NULL,
  "entity_id" uuid NOT NULL,
  "changes" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "details" text NOT NULL
);

ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."conversation_messages"(
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "conversation_id" uuid NOT NULL,
  "message" text NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "role" text NOT NULL
);

ALTER TABLE "public"."conversation_messages" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."hr_reports"(
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "applicant_id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "staff_id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "score" real NOT NULL,
  "summary" text NOT NULL,
  "candidate_status" public.candidate_status NOT NULL DEFAULT 'Paper Screening'::public.candidate_status
);

ALTER TABLE "public"."hr_reports" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."jl_qualifications"(
  "qualification" text NOT NULL,
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "joblisting_id" uuid NOT NULL
);

ALTER TABLE "public"."jl_qualifications" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."jl_requirements"(
  "requirement" text NOT NULL,
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "joblisting_id" uuid NOT NULL
);

ALTER TABLE "public"."jl_requirements" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."job_listings"(
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "title" character varying NOT NULL,
  "location" character varying NOT NULL,
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_by" uuid NOT NULL,
  "is_fulltime" boolean NOT NULL DEFAULT TRUE,
  "staff_id" uuid
);

ALTER TABLE "public"."job_listings" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."job_tags"(
  "joblisting_id" uuid NOT NULL,
  "tag_id" bigint NOT NULL
);

ALTER TABLE "public"."job_tags" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."key_highlights"(
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "report_id" uuid NOT NULL,
  "highlight" text NOT NULL
);

ALTER TABLE "public"."key_highlights" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."parsed_resume"(
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "parsed_resume" jsonb NOT NULL
);

ALTER TABLE "public"."parsed_resume" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."scored_candidates"(
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "score_data" jsonb NOT NULL
);

ALTER TABLE "public"."scored_candidates" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."social_links"(
  "link" text NOT NULL,
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "applicant_id" uuid NOT NULL
);

ALTER TABLE "public"."social_links" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."staff"(
  "first_name" character varying NOT NULL,
  "last_name" character varying NOT NULL,
  "firebase_uid" text NOT NULL,
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "role" public.user_roles NOT NULL
);

ALTER TABLE "public"."staff" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."tags"(
  "id" bigint NOT NULL DEFAULT nextval('public.tags_id_seq'::regclass),
  "name" text NOT NULL,
  "slug" text GENERATED ALWAYS AS (regexp_replace(lower(name), '\s+'::text, '-'::text, 'g'::text)) STORED
);

ALTER TABLE "public"."tags" ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."transcribed"(
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "transcription" jsonb NOT NULL
);

ALTER TABLE "public"."transcribed" ENABLE ROW LEVEL SECURITY;

ALTER SEQUENCE "public"."tags_id_seq" owned BY "public"."tags"."id";

CREATE UNIQUE INDEX admin_feedback_pkey ON public.admin_feedback USING btree(id);

CREATE UNIQUE INDEX applicant_skills_pkey ON public.applicant_skills USING btree(id);

CREATE UNIQUE INDEX applicants_pkey ON public.applicants USING btree(id);

CREATE UNIQUE INDEX audit_logs_pkey ON public.audit_logs USING btree(id);

CREATE INDEX conversation_messages_conv_time_idx ON public.conversation_messages USING btree(conversation_id, created_at DESC);

CREATE UNIQUE INDEX conversation_messages_pkey ON public.conversation_messages USING btree(id);

CREATE UNIQUE INDEX hr_report_pkey ON public.hr_reports USING btree(id);

CREATE UNIQUE INDEX jl_qualifications_pkey ON public.jl_qualifications USING btree(id);

CREATE UNIQUE INDEX jl_requirements_pkey ON public.jl_requirements USING btree(id);

CREATE UNIQUE INDEX job_listings_pkey ON public.job_listings USING btree(id);

CREATE UNIQUE INDEX job_tags_pkey ON public.job_tags USING btree(joblisting_id, tag_id);

CREATE UNIQUE INDEX key_highlights_pkey ON public.key_highlights USING btree(id);

CREATE UNIQUE INDEX parsed_resume_pkey ON public.parsed_resume USING btree(id);

CREATE UNIQUE INDEX scored_candidates_pkey ON public.scored_candidates USING btree(id);

CREATE UNIQUE INDEX social_links_pkey ON public.social_links USING btree(id);

CREATE UNIQUE INDEX tags_pkey ON public.tags USING btree(id);

CREATE UNIQUE INDEX tags_slug_unique ON public.tags USING btree(slug);

CREATE UNIQUE INDEX transcribed_pkey ON public.transcribed USING btree(id);

CREATE INDEX users_firebase_uid_idx ON public.staff USING btree(firebase_uid);

CREATE UNIQUE INDEX users_firebase_uid_key ON public.staff USING btree(firebase_uid);

CREATE UNIQUE INDEX users_pkey ON public.staff USING btree(id);

ALTER TABLE "public"."admin_feedback"
  ADD CONSTRAINT "admin_feedback_pkey" PRIMARY KEY USING INDEX "admin_feedback_pkey";

ALTER TABLE "public"."applicant_skills"
  ADD CONSTRAINT "applicant_skills_pkey" PRIMARY KEY USING INDEX "applicant_skills_pkey";

ALTER TABLE "public"."applicants"
  ADD CONSTRAINT "applicants_pkey" PRIMARY KEY USING INDEX "applicants_pkey";

ALTER TABLE "public"."audit_logs"
  ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY USING INDEX "audit_logs_pkey";

ALTER TABLE "public"."conversation_messages"
  ADD CONSTRAINT "conversation_messages_pkey" PRIMARY KEY USING INDEX "conversation_messages_pkey";

ALTER TABLE "public"."hr_reports"
  ADD CONSTRAINT "hr_report_pkey" PRIMARY KEY USING INDEX "hr_report_pkey";

ALTER TABLE "public"."jl_qualifications"
  ADD CONSTRAINT "jl_qualifications_pkey" PRIMARY KEY USING INDEX "jl_qualifications_pkey";

ALTER TABLE "public"."jl_requirements"
  ADD CONSTRAINT "jl_requirements_pkey" PRIMARY KEY USING INDEX "jl_requirements_pkey";

ALTER TABLE "public"."job_listings"
  ADD CONSTRAINT "job_listings_pkey" PRIMARY KEY USING INDEX "job_listings_pkey";

ALTER TABLE "public"."job_tags"
  ADD CONSTRAINT "job_tags_pkey" PRIMARY KEY USING INDEX "job_tags_pkey";

ALTER TABLE "public"."key_highlights"
  ADD CONSTRAINT "key_highlights_pkey" PRIMARY KEY USING INDEX "key_highlights_pkey";

ALTER TABLE "public"."parsed_resume"
  ADD CONSTRAINT "parsed_resume_pkey" PRIMARY KEY USING INDEX "parsed_resume_pkey";

ALTER TABLE "public"."scored_candidates"
  ADD CONSTRAINT "scored_candidates_pkey" PRIMARY KEY USING INDEX "scored_candidates_pkey";

ALTER TABLE "public"."social_links"
  ADD CONSTRAINT "social_links_pkey" PRIMARY KEY USING INDEX "social_links_pkey";

ALTER TABLE "public"."staff"
  ADD CONSTRAINT "users_pkey" PRIMARY KEY USING INDEX "users_pkey";

ALTER TABLE "public"."tags"
  ADD CONSTRAINT "tags_pkey" PRIMARY KEY USING INDEX "tags_pkey";

ALTER TABLE "public"."transcribed"
  ADD CONSTRAINT "transcribed_pkey" PRIMARY KEY USING INDEX "transcribed_pkey";

ALTER TABLE "public"."admin_feedback"
  ADD CONSTRAINT "admin_feedback_admin_id_fkey" FOREIGN KEY (admin_id) REFERENCES public.staff(id) ON UPDATE CASCADE ON DELETE CASCADE NOT valid;

ALTER TABLE "public"."admin_feedback" validate CONSTRAINT "admin_feedback_admin_id_fkey";

ALTER TABLE "public"."admin_feedback"
  ADD CONSTRAINT "admin_feedback_applicant_id_fkey" FOREIGN KEY (applicant_id) REFERENCES public.applicants(id) ON UPDATE CASCADE ON DELETE CASCADE NOT valid;

ALTER TABLE "public"."admin_feedback" validate CONSTRAINT "admin_feedback_applicant_id_fkey";

ALTER TABLE "public"."applicant_skills"
  ADD CONSTRAINT "applicant_skills_applicant_id_fkey" FOREIGN KEY (applicant_id) REFERENCES public.applicants(id) ON UPDATE CASCADE ON DELETE CASCADE NOT valid;

ALTER TABLE "public"."applicant_skills" validate CONSTRAINT "applicant_skills_applicant_id_fkey";

ALTER TABLE "public"."applicant_skills"
  ADD CONSTRAINT "applicant_skills_rating_check" CHECK (((rating >= 0) AND (rating <= 5))) NOT valid;

ALTER TABLE "public"."applicant_skills" validate CONSTRAINT "applicant_skills_rating_check";

ALTER TABLE "public"."applicant_skills"
  ADD CONSTRAINT "applicant_skills_skill_id_fkey" FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON UPDATE CASCADE ON DELETE CASCADE NOT valid;

ALTER TABLE "public"."applicant_skills" validate CONSTRAINT "applicant_skills_skill_id_fkey";

ALTER TABLE "public"."applicants"
  ADD CONSTRAINT "applicants_joblisting_id_fkey" FOREIGN KEY (joblisting_id) REFERENCES public.job_listings(id) ON UPDATE CASCADE ON DELETE CASCADE NOT valid;

ALTER TABLE "public"."applicants" validate CONSTRAINT "applicants_joblisting_id_fkey";

ALTER TABLE "public"."applicants"
  ADD CONSTRAINT "applicants_parsed_resume_id_fkey" FOREIGN KEY (parsed_resume_id) REFERENCES public.parsed_resume(id) ON UPDATE CASCADE ON DELETE CASCADE NOT valid;

ALTER TABLE "public"."applicants" validate CONSTRAINT "applicants_parsed_resume_id_fkey";

ALTER TABLE "public"."applicants"
  ADD CONSTRAINT "applicants_score_id_fkey" FOREIGN KEY (score_id) REFERENCES public.scored_candidates(id) ON UPDATE CASCADE ON DELETE CASCADE NOT valid;

ALTER TABLE "public"."applicants" validate CONSTRAINT "applicants_score_id_fkey";

ALTER TABLE "public"."applicants"
  ADD CONSTRAINT "applicants_transcribed_id_fkey" FOREIGN KEY (transcribed_id) REFERENCES public.transcribed(id) ON UPDATE CASCADE ON DELETE CASCADE NOT valid;

ALTER TABLE "public"."applicants" validate CONSTRAINT "applicants_transcribed_id_fkey";

ALTER TABLE "public"."audit_logs"
  ADD CONSTRAINT "audit_logs_actor_id_fkey" FOREIGN KEY (actor_id) REFERENCES public.staff(id) ON UPDATE CASCADE ON DELETE CASCADE NOT valid;

ALTER TABLE "public"."audit_logs" validate CONSTRAINT "audit_logs_actor_id_fkey";

ALTER TABLE "public"."conversation_messages"
  ADD CONSTRAINT "conversation_messages_role_check" CHECK ((ROLE = ANY (ARRAY['user'::text, 'assistant'::text]))) NOT valid;

ALTER TABLE "public"."conversation_messages" validate CONSTRAINT "conversation_messages_role_check";

ALTER TABLE "public"."hr_reports"
  ADD CONSTRAINT "hr_report_applicant_id_fkey" FOREIGN KEY (applicant_id) REFERENCES public.applicants(id) ON UPDATE CASCADE ON DELETE CASCADE NOT valid;

ALTER TABLE "public"."hr_reports" validate CONSTRAINT "hr_report_applicant_id_fkey";

ALTER TABLE "public"."hr_reports"
  ADD CONSTRAINT "hr_report_staff_id_fkey" FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON UPDATE CASCADE ON DELETE CASCADE NOT valid;

ALTER TABLE "public"."hr_reports" validate CONSTRAINT "hr_report_staff_id_fkey";

ALTER TABLE "public"."hr_reports"
  ADD CONSTRAINT "score_range" CHECK (((score >=(0)::double precision) AND (score <=(5)::double precision))) NOT valid;

ALTER TABLE "public"."hr_reports" validate CONSTRAINT "score_range";

ALTER TABLE "public"."jl_qualifications"
  ADD CONSTRAINT "jl_qualifications_joblisting_id_fkey" FOREIGN KEY (joblisting_id) REFERENCES public.job_listings(id) ON UPDATE CASCADE ON DELETE CASCADE NOT valid;

ALTER TABLE "public"."jl_qualifications" validate CONSTRAINT "jl_qualifications_joblisting_id_fkey";

ALTER TABLE "public"."jl_requirements"
  ADD CONSTRAINT "jl_requirements_joblisting_id_fkey" FOREIGN KEY (joblisting_id) REFERENCES public.job_listings(id) ON UPDATE CASCADE ON DELETE CASCADE NOT valid;

ALTER TABLE "public"."jl_requirements" validate CONSTRAINT "jl_requirements_joblisting_id_fkey";

ALTER TABLE "public"."job_listings"
  ADD CONSTRAINT "job_listings_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.staff(id) ON UPDATE CASCADE ON DELETE CASCADE NOT valid;

ALTER TABLE "public"."job_listings" validate CONSTRAINT "job_listings_created_by_fkey";

ALTER TABLE "public"."job_listings"
  ADD CONSTRAINT "job_listings_staff_id_fkey" FOREIGN KEY (staff_id) REFERENCES public.staff(id) NOT valid;

ALTER TABLE "public"."job_listings" validate CONSTRAINT "job_listings_staff_id_fkey";

ALTER TABLE "public"."job_tags"
  ADD CONSTRAINT "job_tags_job_id_fkey" FOREIGN KEY (joblisting_id) REFERENCES public.job_listings(id) ON DELETE CASCADE NOT valid;

ALTER TABLE "public"."job_tags" validate CONSTRAINT "job_tags_job_id_fkey";

ALTER TABLE "public"."job_tags"
  ADD CONSTRAINT "job_tags_tag_id_fkey" FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE NOT valid;

ALTER TABLE "public"."job_tags" validate CONSTRAINT "job_tags_tag_id_fkey";

ALTER TABLE "public"."key_highlights"
  ADD CONSTRAINT "key_highlights_report_id_fkey" FOREIGN KEY (report_id) REFERENCES public.hr_reports(id) ON UPDATE CASCADE ON DELETE CASCADE NOT valid;

ALTER TABLE "public"."key_highlights" validate CONSTRAINT "key_highlights_report_id_fkey";

ALTER TABLE "public"."social_links"
  ADD CONSTRAINT "social_links_applicant_id_fkey" FOREIGN KEY (applicant_id) REFERENCES public.applicants(id) ON UPDATE CASCADE ON DELETE CASCADE NOT valid;

ALTER TABLE "public"."social_links" validate CONSTRAINT "social_links_applicant_id_fkey";

ALTER TABLE "public"."staff"
  ADD CONSTRAINT "users_firebase_uid_key" UNIQUE USING INDEX "users_firebase_uid_key";

ALTER TABLE "public"."tags"
  ADD CONSTRAINT "tags_slug_unique" UNIQUE USING INDEX "tags_slug_unique";

SET check_function_bodies = OFF;

CREATE OR REPLACE FUNCTION public.compute_hiring_success_and_time_to_hire(from_ts timestamp without time zone DEFAULT(now() - '30 days'::interval), to_ts timestamp without time zone DEFAULT now())
  RETURNS TABLE(
    metric_type text,
    status_or_stage text,
    value numeric,
    p50 numeric,
    p75 numeric,
    p90 numeric)
  LANGUAGE plpgsql
  AS $function$
BEGIN
  -- Hiring success rate (%)
  RETURN QUERY WITH latest_status AS(
    SELECT DISTINCT ON(entity_id)
      entity_id AS applicant_id,
      changes -> 'status' ->> 'after' AS current_status
    FROM
      audit_logs
    WHERE
      event_type = 'Changed candidate status'
      AND entity_type = 'Applicant'
      AND created_at >= from_ts
      AND created_at < to_ts
      AND changes ? 'status'
    ORDER BY
      entity_id,
      created_at DESC
)
  SELECT
    'success_rate_pct'::text AS metric_type,
    NULL::text AS status_or_stage,
(ROUND(100.0 * COUNT(*) FILTER(WHERE ls.current_status = 'Accepted Job Offer') / NULLIF(COUNT(*), 0), 1))::numeric AS value,
    NULL::numeric AS p50,
    NULL::numeric AS p75,
    NULL::numeric AS p90
  FROM
    applicants a
    LEFT JOIN latest_status ls ON ls.applicant_id = a.id
  WHERE
    a.created_at >= from_ts
    AND a.created_at < to_ts;
  -- Avg time to hire (in days)
  RETURN QUERY WITH status_events AS(
    SELECT
      entity_id AS candidate_id,
      created_at AS entered_at,
(changes -> 'status' ->> 'after') AS status
    FROM
      public.audit_logs
    WHERE
      event_type = 'Changed candidate status'
      AND entity_type = 'Applicant'
      AND(changes ? 'status')
      AND(changes -> 'status' ? 'after')
      AND created_at >= from_ts
      AND created_at < to_ts
),
time_to_hire AS(
  SELECT
    se.candidate_id,
    MIN(se.entered_at) FILTER(WHERE se.status = 'Accepted Job Offer') AS hire_date,
    a.created_at AS first_touch
  FROM
    status_events se
    JOIN applicants a ON a.id = se.candidate_id
  WHERE
    a.created_at >= from_ts
    AND a.created_at < to_ts
  GROUP BY
    se.candidate_id,
    a.created_at
  HAVING
    MIN(se.entered_at) FILTER(WHERE se.status = 'Accepted Job Offer') IS NOT NULL
)
SELECT
  'avg_time_to_hire_days'::text AS metric_type,
  NULL::text AS status_or_stage,
(AVG(EXTRACT(EPOCH FROM(hire_date - first_touch)) / 86400.0))::numeric AS value,
  NULL::numeric AS p50,
  NULL::numeric AS p75,
  NULL::numeric AS p90
FROM
  time_to_hire;
END;
$function$;

CREATE OR REPLACE FUNCTION public.count_applicants_by_status()
  RETURNS TABLE(
    status public.candidate_status,
    applicants_count bigint)
  LANGUAGE sql
  STABLE
  AS $function$
  SELECT
    status,
    count(*) AS applicants_count
  FROM
    public.applicants
  GROUP BY
    status
  ORDER BY
    count(*) DESC;
$function$;

CREATE OR REPLACE VIEW "public"."daily_active_jobs_last_7_days" AS
WITH days AS (
  SELECT
    (generate_series((date_trunc('day'::text, now()) - '6 days'::interval), date_trunc('day'::text, now()), '1 day'::interval))::date AS d
)
SELECT
  d.d AS date,
(EXTRACT(dow FROM d.d))::integer AS dow,
  to_char((d.d)::timestamp with time zone, 'FMDay'::text) AS weekday,
  count(j.id) AS jobs
FROM (days d
  LEFT JOIN public.job_listings j ON (((j.created_at)::date <= d.d)))
GROUP BY
  d.d
HAVING ((EXTRACT(dow FROM d.d) >=(1)::numeric)
  AND (EXTRACT(dow FROM d.d) <=(5)::numeric))
ORDER BY
  d.d;

CREATE OR REPLACE FUNCTION public.get_bottleneck_percentiles(from_ts timestamp with time zone, to_ts timestamp with time zone)
  RETURNS TABLE(
    status text,
    samples bigint,
    p50_seconds double precision,
    p75_seconds double precision,
    p90_seconds double precision,
    p50_interval interval,
    p75_interval interval,
    p90_interval interval)
  LANGUAGE sql
  STABLE
  AS $function$
  WITH status_events AS(
    SELECT
      entity_id AS candidate_id,
      created_at AS entered_at,
(changes -> 'status' ->> 'after') AS status
    FROM
      public.audit_logs
    WHERE
      event_type = 'Changed candidate status'
      AND entity_type = 'Applicant'
      AND(changes ? 'status')
      AND(changes -> 'status' ? 'after')
      AND created_at >= from_ts
      AND created_at < to_ts
),
status_spans AS(
  SELECT
    candidate_id,
    status,
    entered_at,
    lead(entered_at) OVER(PARTITION BY candidate_id ORDER BY entered_at) AS exited_at
  FROM
    status_events
),
durations AS(
  SELECT
    candidate_id,
    status,
    entered_at,
    exited_at,
    extract(epoch FROM(coalesce(exited_at, now()) - entered_at)) AS duration_seconds
  FROM
    status_spans
  WHERE
    status IS NOT NULL
    AND coalesce(exited_at, now()) > entered_at
)
SELECT
  status,
  count(*) AS samples,
  percentile_cont(0.50) WITHIN GROUP(ORDER BY duration_seconds) AS p50_seconds,
  percentile_cont(0.75) WITHIN GROUP(ORDER BY duration_seconds) AS p75_seconds,
  percentile_cont(0.90) WITHIN GROUP(ORDER BY duration_seconds) AS p90_seconds,
  make_interval(secs => percentile_cont(0.50) WITHIN GROUP(ORDER BY duration_seconds)) AS p50_interval,
  make_interval(secs => percentile_cont(0.75) WITHIN GROUP(ORDER BY duration_seconds)) AS p75_interval,
  make_interval(secs => percentile_cont(0.90) WITHIN GROUP(ORDER BY duration_seconds)) AS p90_interval
FROM
  durations
GROUP BY
  status
ORDER BY
  p90_seconds DESC;
$function$;

CREATE OR REPLACE FUNCTION public.get_hiring_kpis(from_ts timestamp without time zone, to_ts timestamp without time zone)
  RETURNS TABLE(
    metric_type text,
    status_or_stage text,
    value numeric,
    p50 numeric,
    p75 numeric,
    p90 numeric)
  LANGUAGE plpgsql
  AS $function$
BEGIN
  -- Bottlenecks (original query)
  RETURN QUERY WITH status_events AS(
    SELECT
      entity_id AS candidate_id,
      created_at AS entered_at,
(changes -> 'status' ->> 'after') AS status
    FROM
      public.audit_logs
    WHERE
      event_type = 'Changed candidate status'
      AND entity_type = 'Applicant'
      AND(changes ? 'status')
      AND(changes -> 'status' ? 'after')
      AND created_at >= from_ts
      AND created_at < to_ts
),
status_spans AS(
  SELECT
    candidate_id,
    status,
    entered_at,
    LEAD(entered_at) OVER(PARTITION BY candidate_id ORDER BY entered_at) AS exited_at
  FROM
    status_events
),
durations AS(
  SELECT
    candidate_id,
    status,
    entered_at,
    exited_at,
    EXTRACT(EPOCH FROM(COALESCE(exited_at, NOW()) - entered_at)) AS duration_seconds
  FROM
    status_spans
  WHERE
    status IS NOT NULL
    AND COALESCE(exited_at, NOW()) > entered_at
)
SELECT
  'bottleneck'::text AS metric_type,
  status AS status_or_stage,
  COUNT(*)::numeric AS value, -- samples
(PERCENTILE_CONT(0.50) WITHIN GROUP(ORDER BY duration_seconds))::numeric AS p50,
(PERCENTILE_CONT(0.75) WITHIN GROUP(ORDER BY duration_seconds))::numeric AS p75,
(PERCENTILE_CONT(0.90) WITHIN GROUP(ORDER BY duration_seconds))::numeric AS p90
FROM
  durations
GROUP BY
  status
ORDER BY
  p90 DESC;
  -- Total applicants
  RETURN QUERY
  SELECT
    'total_applicants'::text AS metric_type,
    NULL::text AS status_or_stage,
    COUNT(*)::numeric AS value,
    NULL::numeric AS p50,
    NULL::numeric AS p75,
    NULL::numeric AS p90
  FROM
    applicants
  WHERE
    created_at >= from_ts
    AND created_at < to_ts;
  -- Avg time to hire (in days) - with its own status_events CTE
  RETURN QUERY WITH status_events AS(
    SELECT
      entity_id AS candidate_id,
      created_at AS entered_at,
(changes -> 'status' ->> 'after') AS status
    FROM
      public.audit_logs
    WHERE
      event_type = 'Changed candidate status'
      AND entity_type = 'Applicant'
      AND(changes ? 'status')
      AND(changes -> 'status' ? 'after')
      AND created_at >= from_ts
      AND created_at < to_ts
),
time_to_hire AS(
  SELECT
    se.candidate_id,
    MIN(se.entered_at) FILTER(WHERE se.status = 'Accepted Job Offer') AS hire_date,
    a.created_at AS first_touch
  FROM
    status_events se
    JOIN applicants a ON a.id = se.candidate_id
  WHERE
    a.created_at >= from_ts
    AND a.created_at < to_ts
  GROUP BY
    se.candidate_id,
    a.created_at
  HAVING
    MIN(se.entered_at) FILTER(WHERE se.status = 'Accepted Job Offer') IS NOT NULL
)
SELECT
  'avg_time_to_hire_days'::text AS metric_type,
  NULL::text AS status_or_stage,
(AVG(EXTRACT(EPOCH FROM(hire_date - first_touch)) / 86400.0))::numeric AS value,
  NULL::numeric AS p50,
  NULL::numeric AS p75,
  NULL::numeric AS p90
FROM
  time_to_hire;
  -- Hiring success rate (%)
  RETURN QUERY WITH latest_status AS(
    SELECT DISTINCT ON(entity_id)
      entity_id AS applicant_id,
      changes -> 'status' ->> 'after' AS current_status
    FROM
      audit_logs
    WHERE
      event_type = 'Changed candidate status'
      AND entity_type = 'Applicant'
      AND created_at >= from_ts
      AND created_at < to_ts
      AND changes ? 'status'
    ORDER BY
      entity_id,
      created_at DESC
)
  SELECT
    'success_rate_pct'::text AS metric_type,
    NULL::text AS status_or_stage,
(ROUND(100.0 * COUNT(*) FILTER(WHERE ls.current_status = 'Accepted Job Offer') / NULLIF(COUNT(*), 0), 1))::numeric AS value,
    NULL::numeric AS p50,
    NULL::numeric AS p75,
    NULL::numeric AS p90
  FROM
    applicants a
    LEFT JOIN latest_status ls ON ls.applicant_id = a.id
  WHERE
    a.created_at >= from_ts
    AND a.created_at < to_ts;
  -- Funnel distribution (counts per stage)
  RETURN QUERY WITH latest_status AS(
    SELECT DISTINCT ON(entity_id)
      entity_id AS applicant_id,
      changes -> 'status' ->> 'after' AS current_status
    FROM
      audit_logs
    WHERE
      event_type = 'Changed candidate status'
      AND entity_type = 'Applicant'
      AND created_at >= from_ts
      AND created_at < to_ts
      AND changes ? 'status'
    ORDER BY
      entity_id,
      created_at DESC
)
  SELECT
    'funnel'::text AS metric_type,
    COALESCE(ls.current_status, 'Paper Screening') AS status_or_stage,
    COUNT(a.id)::numeric AS value,
    NULL::numeric AS p50,
    NULL::numeric AS p75,
    NULL::numeric AS p90
  FROM
    applicants a
    LEFT JOIN latest_status ls ON ls.applicant_id = a.id
  WHERE
    a.created_at >= from_ts
    AND a.created_at < to_ts
  GROUP BY
    2
  ORDER BY
    CASE COALESCE(ls.current_status, 'Paper Screening')
    WHEN 'Paper Screening' THEN
      1
    WHEN 'Exam' THEN
      2
    WHEN 'HR Interview' THEN
      3
    WHEN 'Technical Interview' THEN
      4
    WHEN 'Final Interview' THEN
      5
    WHEN 'Job Offer' THEN
      6
    WHEN 'Accepted Job Offer' THEN
      7
    ELSE
      8
    END;
  -- Per-role counts (applicants, interviewed, offers, hired)
  RETURN QUERY WITH status_events AS(
    SELECT
      entity_id AS candidate_id,
      created_at AS entered_at,
(changes -> 'status' ->> 'after') AS status
    FROM
      public.audit_logs
    WHERE
      event_type = 'Changed candidate status'
      AND entity_type = 'Applicant'
      AND(changes ? 'status')
      AND(changes -> 'status' ? 'after')
      AND created_at >= from_ts
      AND created_at < to_ts
),
latest_status AS(
  SELECT DISTINCT ON(candidate_id)
    candidate_id,
    status AS current_status
  FROM
    status_events
  ORDER BY
    candidate_id,
    entered_at DESC
),
per_role_counts AS(
  SELECT
    jl.title AS job_title,
    COUNT(a.id) AS applicants,
    COUNT(DISTINCT CASE WHEN ls.current_status IN('HR Interview', 'Technical Interview', 'Final Interview', 'Job Offer', 'Accepted Job Offer') THEN
        a.id
      END) AS interviewed,
    COUNT(DISTINCT CASE WHEN ls.current_status IN('Job Offer', 'Accepted Job Offer') THEN
        a.id
      END) AS offers,
    COUNT(DISTINCT CASE WHEN ls.current_status = 'Accepted Job Offer' THEN
        a.id
      END) AS hired
  FROM
    applicants a
    JOIN job_listings jl ON jl.id = a.joblisting_id
    LEFT JOIN latest_status ls ON ls.candidate_id = a.id
  WHERE
    a.created_at >= from_ts
    AND a.created_at < to_ts
  GROUP BY
    jl.title
)
SELECT
  'per_role'::text AS metric_type,
  job_title::text AS status_or_stage,
  applicants::numeric AS value,
  interviewed::numeric AS p50,
  offers::numeric AS p75,
  hired::numeric AS p90
FROM
  per_role_counts;
  -- Per-role times and rates (avg_time_to_hire, time_to_fill, success_rate)
  RETURN QUERY WITH status_events AS(
    SELECT
      entity_id AS candidate_id,
      created_at AS entered_at,
(changes -> 'status' ->> 'after') AS status
    FROM
      public.audit_logs
    WHERE
      event_type = 'Changed candidate status'
      AND entity_type = 'Applicant'
      AND(changes ? 'status')
      AND(changes -> 'status' ? 'after')
      AND created_at >= from_ts
      AND created_at < to_ts
),
latest_status AS(
  SELECT DISTINCT ON(candidate_id)
    candidate_id,
    status AS current_status
  FROM
    status_events
  ORDER BY
    candidate_id,
    entered_at DESC
),
time_to_hire AS(
  SELECT
    se.candidate_id,
    MIN(se.entered_at) FILTER(WHERE se.status = 'Accepted Job Offer') AS hire_date,
  a.created_at AS first_touch
FROM
  status_events se
  JOIN applicants a ON a.id = se.candidate_id
  WHERE
    a.created_at >= from_ts
    AND a.created_at < to_ts
  GROUP BY
    se.candidate_id,
    a.created_at
  HAVING
    MIN(se.entered_at) FILTER(WHERE se.status = 'Accepted Job Offer') IS NOT NULL
),
filled_jobs AS(
  SELECT
    a.joblisting_id,
    jl.created_at AS opened_at,
    MAX(tt.hire_date) AS filled_at -- Use MAX for time to last hire; change to MIN if time to first
  FROM
    applicants a
    JOIN time_to_hire tt ON tt.candidate_id = a.id
    JOIN job_listings jl ON jl.id = a.joblisting_id
  GROUP BY
    a.joblisting_id,
    jl.created_at
  HAVING
    MAX(tt.hire_date) IS NOT NULL
),
per_role_times AS(
  SELECT
    jl.title AS job_title,
    AVG(EXTRACT(EPOCH FROM(tt.hire_date - tt.first_touch)) / 86400.0)::numeric AS avg_time_to_hire_days,
    AVG(EXTRACT(EPOCH FROM(fj.filled_at - fj.opened_at)) / 86400.0)::numeric AS avg_time_to_fill_days,
    ROUND(100.0 * COUNT(DISTINCT CASE WHEN ls.current_status = 'Accepted Job Offer' THEN
          a.id
        END) / NULLIF(COUNT(a.id), 0), 1)::numeric AS success_rate_pct
  FROM
    applicants a
    JOIN job_listings jl ON jl.id = a.joblisting_id
    LEFT JOIN latest_status ls ON ls.candidate_id = a.id
    LEFT JOIN time_to_hire tt ON tt.candidate_id = a.id
    LEFT JOIN filled_jobs fj ON fj.joblisting_id = a.joblisting_id
  WHERE
    a.created_at >= from_ts
    AND a.created_at < to_ts
  GROUP BY
    jl.title
)
SELECT
  'per_role_times'::text AS metric_type,
  job_title::text AS status_or_stage,
  avg_time_to_hire_days AS value,
  avg_time_to_fill_days AS p50,
  success_rate_pct AS p75,
  NULL::numeric AS p90
FROM
  per_role_times;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_hiring_kpis(start_date date, end_date date)
  RETURNS jsonb
  LANGUAGE sql
  STABLE
  AS $function$
  WITH filtered_applicants AS(
    SELECT
      a.*,
      jl.title AS job_title,
      jl.created_at AS job_created_at
    FROM
      applicants a
      JOIN job_listings jl ON a.joblisting_id = jl.id
    WHERE
      a.created_at >= start_date
      AND a.created_at <= end_date
),
hires AS(
  SELECT
    entity_id AS applicant_id,
    created_at AS hire_date
  FROM
    audit_logs
  WHERE
    event_type = 'Changed candidate status'
    AND changes ->> 'after' = 'Accepted Job Offer'
    AND created_at >= start_date
    AND created_at <= end_date
),
aggregated AS(
  SELECT
    job_title,
    COUNT(*) AS applicants,
    COUNT(*) FILTER(WHERE status IN('HR Interview', 'Technical Interview', 'Final Interview')) AS interviewed,
  COUNT(*) FILTER(WHERE status = 'Job Offer') AS offers,
  COUNT(*) FILTER(WHERE status = 'Accepted Job Offer') AS hired,
  AVG(EXTRACT(DAY FROM h.hire_date - fa.created_at))::integer AS avg_time_to_hire_days,
  MAX(EXTRACT(DAY FROM h.hire_date - fa.job_created_at))::integer AS max_time_to_fill_days,
  CASE WHEN COUNT(*) > 0 THEN
(COUNT(*) FILTER(WHERE status = 'Accepted Job Offer')::float / COUNT(*) * 100)::numeric(5, 2)
  ELSE
    0
  END AS success_rate
FROM
  filtered_applicants fa
  LEFT JOIN hires h ON fa.id = h.applicant_id
GROUP BY
  job_title
),
totals AS(
  SELECT
    COALESCE(SUM(applicants), 0) AS total_applicants,
    COALESCE(AVG(avg_time_to_hire_days), 0)::integer AS overall_avg_time_to_hire,
    COALESCE(MAX(max_time_to_fill_days), 0)::integer AS overall_max_time_to_fill,
    COALESCE(AVG(success_rate), 0)::numeric(5, 2) AS overall_success_rate,
    COALESCE(SUM(interviewed), 0) AS total_interviewed,
    COALESCE(SUM(offers), 0) AS total_offers,
    COALESCE(SUM(hired), 0) AS total_hired
  FROM
    aggregated
)
SELECT
  jsonb_build_object('total_applicants', totals.total_applicants, 'avg_time_to_hire', totals.overall_avg_time_to_hire, 'max_time_to_fill', totals.overall_max_time_to_fill, 'hiring_success_rate', totals.overall_success_rate, 'per_job_breakdown', COALESCE((
      SELECT
        jsonb_agg(aggregated.* ORDER BY job_title)
      FROM aggregated), '[]'::jsonb), 'funnel_distribution', jsonb_build_object('applicants', totals.total_applicants, 'interviewed', totals.total_interviewed, 'offers', totals.total_offers, 'hired', totals.total_hired), 'timeline_metrics', jsonb_build_object('avg_time_to_hire', totals.overall_avg_time_to_hire, 'max_time_to_fill', totals.overall_max_time_to_fill)) AS kpi_data
FROM
  totals;
$function$;

CREATE OR REPLACE VIEW "public"."weekly_applicants_last_4_weeks" AS
WITH weeks AS (
  SELECT
    generate_series((date_trunc('week'::text, now()) - '21 days'::interval), date_trunc('week'::text, now()), '7 days'::interval) AS week_start
)
SELECT
  (week_start)::date AS week_start,
(week_start + '6 days'::interval)::date AS week_end,
  to_char(week_start, 'IYYY-IW'::text) AS iso_week,
(
    SELECT
      count(*) AS count
    FROM
      public.applicants a
    WHERE ((a.created_at >= weeks.week_start)
      AND (a.created_at <(weeks.week_start + '7 days'::interval)))) AS applicants
FROM
  weeks
ORDER BY
  ((week_start)::date);

GRANT DELETE ON TABLE "public"."admin_feedback" TO "anon";

GRANT INSERT ON TABLE "public"."admin_feedback" TO "anon";

GRANT REFERENCES ON TABLE "public"."admin_feedback" TO "anon";

GRANT SELECT ON TABLE "public"."admin_feedback" TO "anon";

GRANT TRIGGER ON TABLE "public"."admin_feedback" TO "anon";

GRANT TRUNCATE ON TABLE "public"."admin_feedback" TO "anon";

GRANT UPDATE ON TABLE "public"."admin_feedback" TO "anon";

GRANT DELETE ON TABLE "public"."admin_feedback" TO "authenticated";

GRANT INSERT ON TABLE "public"."admin_feedback" TO "authenticated";

GRANT REFERENCES ON TABLE "public"."admin_feedback" TO "authenticated";

GRANT SELECT ON TABLE "public"."admin_feedback" TO "authenticated";

GRANT TRIGGER ON TABLE "public"."admin_feedback" TO "authenticated";

GRANT TRUNCATE ON TABLE "public"."admin_feedback" TO "authenticated";

GRANT UPDATE ON TABLE "public"."admin_feedback" TO "authenticated";

GRANT DELETE ON TABLE "public"."admin_feedback" TO "service_role";

GRANT INSERT ON TABLE "public"."admin_feedback" TO "service_role";

GRANT REFERENCES ON TABLE "public"."admin_feedback" TO "service_role";

GRANT SELECT ON TABLE "public"."admin_feedback" TO "service_role";

GRANT TRIGGER ON TABLE "public"."admin_feedback" TO "service_role";

GRANT TRUNCATE ON TABLE "public"."admin_feedback" TO "service_role";

GRANT UPDATE ON TABLE "public"."admin_feedback" TO "service_role";

GRANT DELETE ON TABLE "public"."applicant_skills" TO "anon";

GRANT INSERT ON TABLE "public"."applicant_skills" TO "anon";

GRANT REFERENCES ON TABLE "public"."applicant_skills" TO "anon";

GRANT SELECT ON TABLE "public"."applicant_skills" TO "anon";

GRANT TRIGGER ON TABLE "public"."applicant_skills" TO "anon";

GRANT TRUNCATE ON TABLE "public"."applicant_skills" TO "anon";

GRANT UPDATE ON TABLE "public"."applicant_skills" TO "anon";

GRANT DELETE ON TABLE "public"."applicant_skills" TO "authenticated";

GRANT INSERT ON TABLE "public"."applicant_skills" TO "authenticated";

GRANT REFERENCES ON TABLE "public"."applicant_skills" TO "authenticated";

GRANT SELECT ON TABLE "public"."applicant_skills" TO "authenticated";

GRANT TRIGGER ON TABLE "public"."applicant_skills" TO "authenticated";

GRANT TRUNCATE ON TABLE "public"."applicant_skills" TO "authenticated";

GRANT UPDATE ON TABLE "public"."applicant_skills" TO "authenticated";

GRANT DELETE ON TABLE "public"."applicant_skills" TO "service_role";

GRANT INSERT ON TABLE "public"."applicant_skills" TO "service_role";

GRANT REFERENCES ON TABLE "public"."applicant_skills" TO "service_role";

GRANT SELECT ON TABLE "public"."applicant_skills" TO "service_role";

GRANT TRIGGER ON TABLE "public"."applicant_skills" TO "service_role";

GRANT TRUNCATE ON TABLE "public"."applicant_skills" TO "service_role";

GRANT UPDATE ON TABLE "public"."applicant_skills" TO "service_role";

GRANT DELETE ON TABLE "public"."applicants" TO "anon";

GRANT INSERT ON TABLE "public"."applicants" TO "anon";

GRANT REFERENCES ON TABLE "public"."applicants" TO "anon";

GRANT SELECT ON TABLE "public"."applicants" TO "anon";

GRANT TRIGGER ON TABLE "public"."applicants" TO "anon";

GRANT TRUNCATE ON TABLE "public"."applicants" TO "anon";

GRANT UPDATE ON TABLE "public"."applicants" TO "anon";

GRANT DELETE ON TABLE "public"."applicants" TO "authenticated";

GRANT INSERT ON TABLE "public"."applicants" TO "authenticated";

GRANT REFERENCES ON TABLE "public"."applicants" TO "authenticated";

GRANT SELECT ON TABLE "public"."applicants" TO "authenticated";

GRANT TRIGGER ON TABLE "public"."applicants" TO "authenticated";

GRANT TRUNCATE ON TABLE "public"."applicants" TO "authenticated";

GRANT UPDATE ON TABLE "public"."applicants" TO "authenticated";

GRANT DELETE ON TABLE "public"."applicants" TO "service_role";

GRANT INSERT ON TABLE "public"."applicants" TO "service_role";

GRANT REFERENCES ON TABLE "public"."applicants" TO "service_role";

GRANT SELECT ON TABLE "public"."applicants" TO "service_role";

GRANT TRIGGER ON TABLE "public"."applicants" TO "service_role";

GRANT TRUNCATE ON TABLE "public"."applicants" TO "service_role";

GRANT UPDATE ON TABLE "public"."applicants" TO "service_role";

GRANT DELETE ON TABLE "public"."audit_logs" TO "anon";

GRANT INSERT ON TABLE "public"."audit_logs" TO "anon";

GRANT REFERENCES ON TABLE "public"."audit_logs" TO "anon";

GRANT SELECT ON TABLE "public"."audit_logs" TO "anon";

GRANT TRIGGER ON TABLE "public"."audit_logs" TO "anon";

GRANT TRUNCATE ON TABLE "public"."audit_logs" TO "anon";

GRANT UPDATE ON TABLE "public"."audit_logs" TO "anon";

GRANT DELETE ON TABLE "public"."audit_logs" TO "authenticated";

GRANT INSERT ON TABLE "public"."audit_logs" TO "authenticated";

GRANT REFERENCES ON TABLE "public"."audit_logs" TO "authenticated";

GRANT SELECT ON TABLE "public"."audit_logs" TO "authenticated";

GRANT TRIGGER ON TABLE "public"."audit_logs" TO "authenticated";

GRANT TRUNCATE ON TABLE "public"."audit_logs" TO "authenticated";

GRANT UPDATE ON TABLE "public"."audit_logs" TO "authenticated";

GRANT DELETE ON TABLE "public"."audit_logs" TO "service_role";

GRANT INSERT ON TABLE "public"."audit_logs" TO "service_role";

GRANT REFERENCES ON TABLE "public"."audit_logs" TO "service_role";

GRANT SELECT ON TABLE "public"."audit_logs" TO "service_role";

GRANT TRIGGER ON TABLE "public"."audit_logs" TO "service_role";

GRANT TRUNCATE ON TABLE "public"."audit_logs" TO "service_role";

GRANT UPDATE ON TABLE "public"."audit_logs" TO "service_role";

GRANT DELETE ON TABLE "public"."conversation_messages" TO "anon";

GRANT INSERT ON TABLE "public"."conversation_messages" TO "anon";

GRANT REFERENCES ON TABLE "public"."conversation_messages" TO "anon";

GRANT SELECT ON TABLE "public"."conversation_messages" TO "anon";

GRANT TRIGGER ON TABLE "public"."conversation_messages" TO "anon";

GRANT TRUNCATE ON TABLE "public"."conversation_messages" TO "anon";

GRANT UPDATE ON TABLE "public"."conversation_messages" TO "anon";

GRANT DELETE ON TABLE "public"."conversation_messages" TO "authenticated";

GRANT INSERT ON TABLE "public"."conversation_messages" TO "authenticated";

GRANT REFERENCES ON TABLE "public"."conversation_messages" TO "authenticated";

GRANT SELECT ON TABLE "public"."conversation_messages" TO "authenticated";

GRANT TRIGGER ON TABLE "public"."conversation_messages" TO "authenticated";

GRANT TRUNCATE ON TABLE "public"."conversation_messages" TO "authenticated";

GRANT UPDATE ON TABLE "public"."conversation_messages" TO "authenticated";

GRANT DELETE ON TABLE "public"."conversation_messages" TO "service_role";

GRANT INSERT ON TABLE "public"."conversation_messages" TO "service_role";

GRANT REFERENCES ON TABLE "public"."conversation_messages" TO "service_role";

GRANT SELECT ON TABLE "public"."conversation_messages" TO "service_role";

GRANT TRIGGER ON TABLE "public"."conversation_messages" TO "service_role";

GRANT TRUNCATE ON TABLE "public"."conversation_messages" TO "service_role";

GRANT UPDATE ON TABLE "public"."conversation_messages" TO "service_role";

GRANT DELETE ON TABLE "public"."hr_reports" TO "anon";

GRANT INSERT ON TABLE "public"."hr_reports" TO "anon";

GRANT REFERENCES ON TABLE "public"."hr_reports" TO "anon";

GRANT SELECT ON TABLE "public"."hr_reports" TO "anon";

GRANT TRIGGER ON TABLE "public"."hr_reports" TO "anon";

GRANT TRUNCATE ON TABLE "public"."hr_reports" TO "anon";

GRANT UPDATE ON TABLE "public"."hr_reports" TO "anon";

GRANT DELETE ON TABLE "public"."hr_reports" TO "authenticated";

GRANT INSERT ON TABLE "public"."hr_reports" TO "authenticated";

GRANT REFERENCES ON TABLE "public"."hr_reports" TO "authenticated";

GRANT SELECT ON TABLE "public"."hr_reports" TO "authenticated";

GRANT TRIGGER ON TABLE "public"."hr_reports" TO "authenticated";

GRANT TRUNCATE ON TABLE "public"."hr_reports" TO "authenticated";

GRANT UPDATE ON TABLE "public"."hr_reports" TO "authenticated";

GRANT DELETE ON TABLE "public"."hr_reports" TO "service_role";

GRANT INSERT ON TABLE "public"."hr_reports" TO "service_role";

GRANT REFERENCES ON TABLE "public"."hr_reports" TO "service_role";

GRANT SELECT ON TABLE "public"."hr_reports" TO "service_role";

GRANT TRIGGER ON TABLE "public"."hr_reports" TO "service_role";

GRANT TRUNCATE ON TABLE "public"."hr_reports" TO "service_role";

GRANT UPDATE ON TABLE "public"."hr_reports" TO "service_role";

GRANT DELETE ON TABLE "public"."jl_qualifications" TO "anon";

GRANT INSERT ON TABLE "public"."jl_qualifications" TO "anon";

GRANT REFERENCES ON TABLE "public"."jl_qualifications" TO "anon";

GRANT SELECT ON TABLE "public"."jl_qualifications" TO "anon";

GRANT TRIGGER ON TABLE "public"."jl_qualifications" TO "anon";

GRANT TRUNCATE ON TABLE "public"."jl_qualifications" TO "anon";

GRANT UPDATE ON TABLE "public"."jl_qualifications" TO "anon";

GRANT DELETE ON TABLE "public"."jl_qualifications" TO "authenticated";

GRANT INSERT ON TABLE "public"."jl_qualifications" TO "authenticated";

GRANT REFERENCES ON TABLE "public"."jl_qualifications" TO "authenticated";

GRANT SELECT ON TABLE "public"."jl_qualifications" TO "authenticated";

GRANT TRIGGER ON TABLE "public"."jl_qualifications" TO "authenticated";

GRANT TRUNCATE ON TABLE "public"."jl_qualifications" TO "authenticated";

GRANT UPDATE ON TABLE "public"."jl_qualifications" TO "authenticated";

GRANT DELETE ON TABLE "public"."jl_qualifications" TO "service_role";

GRANT INSERT ON TABLE "public"."jl_qualifications" TO "service_role";

GRANT REFERENCES ON TABLE "public"."jl_qualifications" TO "service_role";

GRANT SELECT ON TABLE "public"."jl_qualifications" TO "service_role";

GRANT TRIGGER ON TABLE "public"."jl_qualifications" TO "service_role";

GRANT TRUNCATE ON TABLE "public"."jl_qualifications" TO "service_role";

GRANT UPDATE ON TABLE "public"."jl_qualifications" TO "service_role";

GRANT DELETE ON TABLE "public"."jl_requirements" TO "anon";

GRANT INSERT ON TABLE "public"."jl_requirements" TO "anon";

GRANT REFERENCES ON TABLE "public"."jl_requirements" TO "anon";

GRANT SELECT ON TABLE "public"."jl_requirements" TO "anon";

GRANT TRIGGER ON TABLE "public"."jl_requirements" TO "anon";

GRANT TRUNCATE ON TABLE "public"."jl_requirements" TO "anon";

GRANT UPDATE ON TABLE "public"."jl_requirements" TO "anon";

GRANT DELETE ON TABLE "public"."jl_requirements" TO "authenticated";

GRANT INSERT ON TABLE "public"."jl_requirements" TO "authenticated";

GRANT REFERENCES ON TABLE "public"."jl_requirements" TO "authenticated";

GRANT SELECT ON TABLE "public"."jl_requirements" TO "authenticated";

GRANT TRIGGER ON TABLE "public"."jl_requirements" TO "authenticated";

GRANT TRUNCATE ON TABLE "public"."jl_requirements" TO "authenticated";

GRANT UPDATE ON TABLE "public"."jl_requirements" TO "authenticated";

GRANT DELETE ON TABLE "public"."jl_requirements" TO "service_role";

GRANT INSERT ON TABLE "public"."jl_requirements" TO "service_role";

GRANT REFERENCES ON TABLE "public"."jl_requirements" TO "service_role";

GRANT SELECT ON TABLE "public"."jl_requirements" TO "service_role";

GRANT TRIGGER ON TABLE "public"."jl_requirements" TO "service_role";

GRANT TRUNCATE ON TABLE "public"."jl_requirements" TO "service_role";

GRANT UPDATE ON TABLE "public"."jl_requirements" TO "service_role";

GRANT DELETE ON TABLE "public"."job_listings" TO "anon";

GRANT INSERT ON TABLE "public"."job_listings" TO "anon";

GRANT REFERENCES ON TABLE "public"."job_listings" TO "anon";

GRANT SELECT ON TABLE "public"."job_listings" TO "anon";

GRANT TRIGGER ON TABLE "public"."job_listings" TO "anon";

GRANT TRUNCATE ON TABLE "public"."job_listings" TO "anon";

GRANT UPDATE ON TABLE "public"."job_listings" TO "anon";

GRANT DELETE ON TABLE "public"."job_listings" TO "authenticated";

GRANT INSERT ON TABLE "public"."job_listings" TO "authenticated";

GRANT REFERENCES ON TABLE "public"."job_listings" TO "authenticated";

GRANT SELECT ON TABLE "public"."job_listings" TO "authenticated";

GRANT TRIGGER ON TABLE "public"."job_listings" TO "authenticated";

GRANT TRUNCATE ON TABLE "public"."job_listings" TO "authenticated";

GRANT UPDATE ON TABLE "public"."job_listings" TO "authenticated";

GRANT DELETE ON TABLE "public"."job_listings" TO "service_role";

GRANT INSERT ON TABLE "public"."job_listings" TO "service_role";

GRANT REFERENCES ON TABLE "public"."job_listings" TO "service_role";

GRANT SELECT ON TABLE "public"."job_listings" TO "service_role";

GRANT TRIGGER ON TABLE "public"."job_listings" TO "service_role";

GRANT TRUNCATE ON TABLE "public"."job_listings" TO "service_role";

GRANT UPDATE ON TABLE "public"."job_listings" TO "service_role";

GRANT DELETE ON TABLE "public"."job_tags" TO "anon";

GRANT INSERT ON TABLE "public"."job_tags" TO "anon";

GRANT REFERENCES ON TABLE "public"."job_tags" TO "anon";

GRANT SELECT ON TABLE "public"."job_tags" TO "anon";

GRANT TRIGGER ON TABLE "public"."job_tags" TO "anon";

GRANT TRUNCATE ON TABLE "public"."job_tags" TO "anon";

GRANT UPDATE ON TABLE "public"."job_tags" TO "anon";

GRANT DELETE ON TABLE "public"."job_tags" TO "authenticated";

GRANT INSERT ON TABLE "public"."job_tags" TO "authenticated";

GRANT REFERENCES ON TABLE "public"."job_tags" TO "authenticated";

GRANT SELECT ON TABLE "public"."job_tags" TO "authenticated";

GRANT TRIGGER ON TABLE "public"."job_tags" TO "authenticated";

GRANT TRUNCATE ON TABLE "public"."job_tags" TO "authenticated";

GRANT UPDATE ON TABLE "public"."job_tags" TO "authenticated";

GRANT DELETE ON TABLE "public"."job_tags" TO "service_role";

GRANT INSERT ON TABLE "public"."job_tags" TO "service_role";

GRANT REFERENCES ON TABLE "public"."job_tags" TO "service_role";

GRANT SELECT ON TABLE "public"."job_tags" TO "service_role";

GRANT TRIGGER ON TABLE "public"."job_tags" TO "service_role";

GRANT TRUNCATE ON TABLE "public"."job_tags" TO "service_role";

GRANT UPDATE ON TABLE "public"."job_tags" TO "service_role";

GRANT DELETE ON TABLE "public"."key_highlights" TO "anon";

GRANT INSERT ON TABLE "public"."key_highlights" TO "anon";

GRANT REFERENCES ON TABLE "public"."key_highlights" TO "anon";

GRANT SELECT ON TABLE "public"."key_highlights" TO "anon";

GRANT TRIGGER ON TABLE "public"."key_highlights" TO "anon";

GRANT TRUNCATE ON TABLE "public"."key_highlights" TO "anon";

GRANT UPDATE ON TABLE "public"."key_highlights" TO "anon";

GRANT DELETE ON TABLE "public"."key_highlights" TO "authenticated";

GRANT INSERT ON TABLE "public"."key_highlights" TO "authenticated";

GRANT REFERENCES ON TABLE "public"."key_highlights" TO "authenticated";

GRANT SELECT ON TABLE "public"."key_highlights" TO "authenticated";

GRANT TRIGGER ON TABLE "public"."key_highlights" TO "authenticated";

GRANT TRUNCATE ON TABLE "public"."key_highlights" TO "authenticated";

GRANT UPDATE ON TABLE "public"."key_highlights" TO "authenticated";

GRANT DELETE ON TABLE "public"."key_highlights" TO "service_role";

GRANT INSERT ON TABLE "public"."key_highlights" TO "service_role";

GRANT REFERENCES ON TABLE "public"."key_highlights" TO "service_role";

GRANT SELECT ON TABLE "public"."key_highlights" TO "service_role";

GRANT TRIGGER ON TABLE "public"."key_highlights" TO "service_role";

GRANT TRUNCATE ON TABLE "public"."key_highlights" TO "service_role";

GRANT UPDATE ON TABLE "public"."key_highlights" TO "service_role";

GRANT DELETE ON TABLE "public"."parsed_resume" TO "anon";

GRANT INSERT ON TABLE "public"."parsed_resume" TO "anon";

GRANT REFERENCES ON TABLE "public"."parsed_resume" TO "anon";

GRANT SELECT ON TABLE "public"."parsed_resume" TO "anon";

GRANT TRIGGER ON TABLE "public"."parsed_resume" TO "anon";

GRANT TRUNCATE ON TABLE "public"."parsed_resume" TO "anon";

GRANT UPDATE ON TABLE "public"."parsed_resume" TO "anon";

GRANT DELETE ON TABLE "public"."parsed_resume" TO "authenticated";

GRANT INSERT ON TABLE "public"."parsed_resume" TO "authenticated";

GRANT REFERENCES ON TABLE "public"."parsed_resume" TO "authenticated";

GRANT SELECT ON TABLE "public"."parsed_resume" TO "authenticated";

GRANT TRIGGER ON TABLE "public"."parsed_resume" TO "authenticated";

GRANT TRUNCATE ON TABLE "public"."parsed_resume" TO "authenticated";

GRANT UPDATE ON TABLE "public"."parsed_resume" TO "authenticated";

GRANT DELETE ON TABLE "public"."parsed_resume" TO "service_role";

GRANT INSERT ON TABLE "public"."parsed_resume" TO "service_role";

GRANT REFERENCES ON TABLE "public"."parsed_resume" TO "service_role";

GRANT SELECT ON TABLE "public"."parsed_resume" TO "service_role";

GRANT TRIGGER ON TABLE "public"."parsed_resume" TO "service_role";

GRANT TRUNCATE ON TABLE "public"."parsed_resume" TO "service_role";

GRANT UPDATE ON TABLE "public"."parsed_resume" TO "service_role";

GRANT DELETE ON TABLE "public"."scored_candidates" TO "anon";

GRANT INSERT ON TABLE "public"."scored_candidates" TO "anon";

GRANT REFERENCES ON TABLE "public"."scored_candidates" TO "anon";

GRANT SELECT ON TABLE "public"."scored_candidates" TO "anon";

GRANT TRIGGER ON TABLE "public"."scored_candidates" TO "anon";

GRANT TRUNCATE ON TABLE "public"."scored_candidates" TO "anon";

GRANT UPDATE ON TABLE "public"."scored_candidates" TO "anon";

GRANT DELETE ON TABLE "public"."scored_candidates" TO "authenticated";

GRANT INSERT ON TABLE "public"."scored_candidates" TO "authenticated";

GRANT REFERENCES ON TABLE "public"."scored_candidates" TO "authenticated";

GRANT SELECT ON TABLE "public"."scored_candidates" TO "authenticated";

GRANT TRIGGER ON TABLE "public"."scored_candidates" TO "authenticated";

GRANT TRUNCATE ON TABLE "public"."scored_candidates" TO "authenticated";

GRANT UPDATE ON TABLE "public"."scored_candidates" TO "authenticated";

GRANT DELETE ON TABLE "public"."scored_candidates" TO "service_role";

GRANT INSERT ON TABLE "public"."scored_candidates" TO "service_role";

GRANT REFERENCES ON TABLE "public"."scored_candidates" TO "service_role";

GRANT SELECT ON TABLE "public"."scored_candidates" TO "service_role";

GRANT TRIGGER ON TABLE "public"."scored_candidates" TO "service_role";

GRANT TRUNCATE ON TABLE "public"."scored_candidates" TO "service_role";

GRANT UPDATE ON TABLE "public"."scored_candidates" TO "service_role";

GRANT DELETE ON TABLE "public"."social_links" TO "anon";

GRANT INSERT ON TABLE "public"."social_links" TO "anon";

GRANT REFERENCES ON TABLE "public"."social_links" TO "anon";

GRANT SELECT ON TABLE "public"."social_links" TO "anon";

GRANT TRIGGER ON TABLE "public"."social_links" TO "anon";

GRANT TRUNCATE ON TABLE "public"."social_links" TO "anon";

GRANT UPDATE ON TABLE "public"."social_links" TO "anon";

GRANT DELETE ON TABLE "public"."social_links" TO "authenticated";

GRANT INSERT ON TABLE "public"."social_links" TO "authenticated";

GRANT REFERENCES ON TABLE "public"."social_links" TO "authenticated";

GRANT SELECT ON TABLE "public"."social_links" TO "authenticated";

GRANT TRIGGER ON TABLE "public"."social_links" TO "authenticated";

GRANT TRUNCATE ON TABLE "public"."social_links" TO "authenticated";

GRANT UPDATE ON TABLE "public"."social_links" TO "authenticated";

GRANT DELETE ON TABLE "public"."social_links" TO "service_role";

GRANT INSERT ON TABLE "public"."social_links" TO "service_role";

GRANT REFERENCES ON TABLE "public"."social_links" TO "service_role";

GRANT SELECT ON TABLE "public"."social_links" TO "service_role";

GRANT TRIGGER ON TABLE "public"."social_links" TO "service_role";

GRANT TRUNCATE ON TABLE "public"."social_links" TO "service_role";

GRANT UPDATE ON TABLE "public"."social_links" TO "service_role";

GRANT DELETE ON TABLE "public"."staff" TO "anon";

GRANT INSERT ON TABLE "public"."staff" TO "anon";

GRANT REFERENCES ON TABLE "public"."staff" TO "anon";

GRANT SELECT ON TABLE "public"."staff" TO "anon";

GRANT TRIGGER ON TABLE "public"."staff" TO "anon";

GRANT TRUNCATE ON TABLE "public"."staff" TO "anon";

GRANT UPDATE ON TABLE "public"."staff" TO "anon";

GRANT DELETE ON TABLE "public"."staff" TO "authenticated";

GRANT INSERT ON TABLE "public"."staff" TO "authenticated";

GRANT REFERENCES ON TABLE "public"."staff" TO "authenticated";

GRANT SELECT ON TABLE "public"."staff" TO "authenticated";

GRANT TRIGGER ON TABLE "public"."staff" TO "authenticated";

GRANT TRUNCATE ON TABLE "public"."staff" TO "authenticated";

GRANT UPDATE ON TABLE "public"."staff" TO "authenticated";

GRANT DELETE ON TABLE "public"."staff" TO "service_role";

GRANT INSERT ON TABLE "public"."staff" TO "service_role";

GRANT REFERENCES ON TABLE "public"."staff" TO "service_role";

GRANT SELECT ON TABLE "public"."staff" TO "service_role";

GRANT TRIGGER ON TABLE "public"."staff" TO "service_role";

GRANT TRUNCATE ON TABLE "public"."staff" TO "service_role";

GRANT UPDATE ON TABLE "public"."staff" TO "service_role";

GRANT DELETE ON TABLE "public"."tags" TO "anon";

GRANT INSERT ON TABLE "public"."tags" TO "anon";

GRANT REFERENCES ON TABLE "public"."tags" TO "anon";

GRANT SELECT ON TABLE "public"."tags" TO "anon";

GRANT TRIGGER ON TABLE "public"."tags" TO "anon";

GRANT TRUNCATE ON TABLE "public"."tags" TO "anon";

GRANT UPDATE ON TABLE "public"."tags" TO "anon";

GRANT DELETE ON TABLE "public"."tags" TO "authenticated";

GRANT INSERT ON TABLE "public"."tags" TO "authenticated";

GRANT REFERENCES ON TABLE "public"."tags" TO "authenticated";

GRANT SELECT ON TABLE "public"."tags" TO "authenticated";

GRANT TRIGGER ON TABLE "public"."tags" TO "authenticated";

GRANT TRUNCATE ON TABLE "public"."tags" TO "authenticated";

GRANT UPDATE ON TABLE "public"."tags" TO "authenticated";

GRANT DELETE ON TABLE "public"."tags" TO "service_role";

GRANT INSERT ON TABLE "public"."tags" TO "service_role";

GRANT REFERENCES ON TABLE "public"."tags" TO "service_role";

GRANT SELECT ON TABLE "public"."tags" TO "service_role";

GRANT TRIGGER ON TABLE "public"."tags" TO "service_role";

GRANT TRUNCATE ON TABLE "public"."tags" TO "service_role";

GRANT UPDATE ON TABLE "public"."tags" TO "service_role";

GRANT DELETE ON TABLE "public"."transcribed" TO "anon";

GRANT INSERT ON TABLE "public"."transcribed" TO "anon";

GRANT REFERENCES ON TABLE "public"."transcribed" TO "anon";

GRANT SELECT ON TABLE "public"."transcribed" TO "anon";

GRANT TRIGGER ON TABLE "public"."transcribed" TO "anon";

GRANT TRUNCATE ON TABLE "public"."transcribed" TO "anon";

GRANT UPDATE ON TABLE "public"."transcribed" TO "anon";

GRANT DELETE ON TABLE "public"."transcribed" TO "authenticated";

GRANT INSERT ON TABLE "public"."transcribed" TO "authenticated";

GRANT REFERENCES ON TABLE "public"."transcribed" TO "authenticated";

GRANT SELECT ON TABLE "public"."transcribed" TO "authenticated";

GRANT TRIGGER ON TABLE "public"."transcribed" TO "authenticated";

GRANT TRUNCATE ON TABLE "public"."transcribed" TO "authenticated";

GRANT UPDATE ON TABLE "public"."transcribed" TO "authenticated";

GRANT DELETE ON TABLE "public"."transcribed" TO "service_role";

GRANT INSERT ON TABLE "public"."transcribed" TO "service_role";

GRANT REFERENCES ON TABLE "public"."transcribed" TO "service_role";

GRANT SELECT ON TABLE "public"."transcribed" TO "service_role";

GRANT TRIGGER ON TABLE "public"."transcribed" TO "service_role";

GRANT TRUNCATE ON TABLE "public"."transcribed" TO "service_role";

GRANT UPDATE ON TABLE "public"."transcribed" TO "service_role";

