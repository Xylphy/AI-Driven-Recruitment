create type "public"."action_type" as enum ('create', 'update', 'delete');

create type "public"."audit_entity_type" as enum ('Applicant', 'Job Listing', 'Admin Feedback', 'Staff Evaluation', 'Staff');

create type "public"."audit_event_type" as enum ('Joblisting modified', 'Joblisting deleted', 'Created joblisting', 'Applied for job', 'Changed user role', 'Changed candidate status', 'Admin feedback created', 'Admin feedback deleted', 'Admin feedback updated', 'Created Staff Evaluation', 'Deleted Staff Evaluation', 'Updated Staff Evaluation', 'Created staff account', 'Staff password updated');

create type "public"."candidate_status" as enum ('Paper Screening', 'Exam', 'HR Interview', 'Technical Interview', 'Final Interview', 'Job Offer', 'Accepted Job Offer', 'Close Status');

create type "public"."user_roles" as enum ('SuperAdmin', 'Admin', 'Staff', 'Applicant');

create sequence "public"."tags_id_seq";


  create table "public"."admin_feedback" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "applicant_id" uuid not null default gen_random_uuid(),
    "feedback" text,
    "admin_id" uuid not null default gen_random_uuid()
      );


alter table "public"."admin_feedback" enable row level security;


  create table "public"."applicant_skills" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "applicant_id" uuid not null,
    "tag_id" bigint not null,
    "rating" smallint not null default '0'::smallint
      );


alter table "public"."applicant_skills" enable row level security;


  create table "public"."applicants" (
    "id" uuid not null default gen_random_uuid(),
    "joblisting_id" uuid not null,
    "first_name" character varying not null,
    "last_name" character varying not null,
    "resume_id" text not null,
    "street" text,
    "zip" text,
    "city" text,
    "state" text,
    "parsed_resume_id" uuid,
    "transcript_id" text not null,
    "transcribed_id" uuid,
    "status" public.candidate_status not null default 'Paper Screening'::public.candidate_status,
    "created_at" timestamp with time zone not null default now(),
    "email" text,
    "contact_number" text,
    "score_id" uuid,
    "scheduled_at" timestamp with time zone,
    "platform" text
      );


alter table "public"."applicants" enable row level security;


  create table "public"."audit_logs" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "actor_type" public.user_roles not null,
    "actor_id" uuid,
    "action" public.action_type not null,
    "event_type" public.audit_event_type not null,
    "entity_type" public.audit_entity_type not null,
    "entity_id" uuid not null,
    "changes" jsonb not null default '{}'::jsonb,
    "details" text not null
      );


alter table "public"."audit_logs" enable row level security;


  create table "public"."conversation_messages" (
    "id" uuid not null default gen_random_uuid(),
    "conversation_id" uuid not null,
    "message" text not null,
    "created_at" timestamp with time zone not null default now(),
    "role" text not null
      );


alter table "public"."conversation_messages" enable row level security;


  create table "public"."hr_reports" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "applicant_id" uuid not null default gen_random_uuid(),
    "staff_id" uuid not null default gen_random_uuid(),
    "score" real not null,
    "summary" text not null,
    "candidate_status" public.candidate_status not null default 'Paper Screening'::public.candidate_status
      );


alter table "public"."hr_reports" enable row level security;


  create table "public"."jl_qualifications" (
    "qualification" text not null,
    "id" uuid not null default gen_random_uuid(),
    "joblisting_id" uuid not null
      );


alter table "public"."jl_qualifications" enable row level security;


  create table "public"."jl_requirements" (
    "requirement" text not null,
    "id" uuid not null default gen_random_uuid(),
    "joblisting_id" uuid not null
      );


alter table "public"."jl_requirements" enable row level security;


  create table "public"."job_listings" (
    "created_at" timestamp with time zone not null default now(),
    "title" character varying not null,
    "location" character varying not null,
    "id" uuid not null default gen_random_uuid(),
    "created_by" uuid not null,
    "is_fulltime" boolean not null default true,
    "staff_id" uuid
      );


alter table "public"."job_listings" enable row level security;


  create table "public"."job_tags" (
    "joblisting_id" uuid not null,
    "tag_id" bigint not null
      );


alter table "public"."job_tags" enable row level security;


  create table "public"."key_highlights" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "report_id" uuid not null,
    "highlight" text not null
      );


alter table "public"."key_highlights" enable row level security;


  create table "public"."parsed_resume" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "parsed_resume" jsonb not null
      );


alter table "public"."parsed_resume" enable row level security;


  create table "public"."scored_candidates" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "score_data" jsonb not null
      );


alter table "public"."scored_candidates" enable row level security;


  create table "public"."social_links" (
    "link" text not null,
    "id" uuid not null default gen_random_uuid(),
    "applicant_id" uuid not null
      );


alter table "public"."social_links" enable row level security;


  create table "public"."staff" (
    "first_name" character varying not null,
    "last_name" character varying not null,
    "firebase_uid" text not null,
    "id" uuid not null default gen_random_uuid(),
    "role" public.user_roles not null
      );


alter table "public"."staff" enable row level security;


  create table "public"."tags" (
    "id" bigint not null default nextval('public.tags_id_seq'::regclass),
    "name" text not null,
    "slug" text generated always as (regexp_replace(lower(name), '\s+'::text, '-'::text, 'g'::text)) stored
      );


alter table "public"."tags" enable row level security;


  create table "public"."transcribed" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "transcription" jsonb not null
      );


alter table "public"."transcribed" enable row level security;

alter sequence "public"."tags_id_seq" owned by "public"."tags"."id";

CREATE UNIQUE INDEX admin_feedback_pkey ON public.admin_feedback USING btree (id);

CREATE UNIQUE INDEX applicant_skills_pkey ON public.applicant_skills USING btree (id);

CREATE UNIQUE INDEX applicants_pkey ON public.applicants USING btree (id);

CREATE UNIQUE INDEX audit_logs_pkey ON public.audit_logs USING btree (id);

CREATE INDEX conversation_messages_conv_time_idx ON public.conversation_messages USING btree (conversation_id, created_at DESC);

CREATE UNIQUE INDEX conversation_messages_pkey ON public.conversation_messages USING btree (id);

CREATE UNIQUE INDEX hr_report_pkey ON public.hr_reports USING btree (id);

CREATE UNIQUE INDEX jl_qualifications_pkey ON public.jl_qualifications USING btree (id);

CREATE UNIQUE INDEX jl_requirements_pkey ON public.jl_requirements USING btree (id);

CREATE UNIQUE INDEX job_listings_pkey ON public.job_listings USING btree (id);

CREATE UNIQUE INDEX job_tags_pkey ON public.job_tags USING btree (joblisting_id, tag_id);

CREATE UNIQUE INDEX key_highlights_pkey ON public.key_highlights USING btree (id);

CREATE UNIQUE INDEX parsed_resume_pkey ON public.parsed_resume USING btree (id);

CREATE UNIQUE INDEX scored_candidates_pkey ON public.scored_candidates USING btree (id);

CREATE UNIQUE INDEX social_links_pkey ON public.social_links USING btree (id);

CREATE UNIQUE INDEX tags_pkey ON public.tags USING btree (id);

CREATE UNIQUE INDEX tags_slug_unique ON public.tags USING btree (slug);

CREATE UNIQUE INDEX transcribed_pkey ON public.transcribed USING btree (id);

CREATE INDEX users_firebase_uid_idx ON public.staff USING btree (firebase_uid);

CREATE UNIQUE INDEX users_firebase_uid_key ON public.staff USING btree (firebase_uid);

CREATE UNIQUE INDEX users_pkey ON public.staff USING btree (id);

alter table "public"."admin_feedback" add constraint "admin_feedback_pkey" PRIMARY KEY using index "admin_feedback_pkey";

alter table "public"."applicant_skills" add constraint "applicant_skills_pkey" PRIMARY KEY using index "applicant_skills_pkey";

alter table "public"."applicants" add constraint "applicants_pkey" PRIMARY KEY using index "applicants_pkey";

alter table "public"."audit_logs" add constraint "audit_logs_pkey" PRIMARY KEY using index "audit_logs_pkey";

alter table "public"."conversation_messages" add constraint "conversation_messages_pkey" PRIMARY KEY using index "conversation_messages_pkey";

alter table "public"."hr_reports" add constraint "hr_report_pkey" PRIMARY KEY using index "hr_report_pkey";

alter table "public"."jl_qualifications" add constraint "jl_qualifications_pkey" PRIMARY KEY using index "jl_qualifications_pkey";

alter table "public"."jl_requirements" add constraint "jl_requirements_pkey" PRIMARY KEY using index "jl_requirements_pkey";

alter table "public"."job_listings" add constraint "job_listings_pkey" PRIMARY KEY using index "job_listings_pkey";

alter table "public"."job_tags" add constraint "job_tags_pkey" PRIMARY KEY using index "job_tags_pkey";

alter table "public"."key_highlights" add constraint "key_highlights_pkey" PRIMARY KEY using index "key_highlights_pkey";

alter table "public"."parsed_resume" add constraint "parsed_resume_pkey" PRIMARY KEY using index "parsed_resume_pkey";

alter table "public"."scored_candidates" add constraint "scored_candidates_pkey" PRIMARY KEY using index "scored_candidates_pkey";

alter table "public"."social_links" add constraint "social_links_pkey" PRIMARY KEY using index "social_links_pkey";

alter table "public"."staff" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."tags" add constraint "tags_pkey" PRIMARY KEY using index "tags_pkey";

alter table "public"."transcribed" add constraint "transcribed_pkey" PRIMARY KEY using index "transcribed_pkey";

alter table "public"."admin_feedback" add constraint "admin_feedback_admin_id_fkey" FOREIGN KEY (admin_id) REFERENCES public.staff(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."admin_feedback" validate constraint "admin_feedback_admin_id_fkey";

alter table "public"."admin_feedback" add constraint "admin_feedback_applicant_id_fkey" FOREIGN KEY (applicant_id) REFERENCES public.applicants(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."admin_feedback" validate constraint "admin_feedback_applicant_id_fkey";

alter table "public"."applicant_skills" add constraint "applicant_skills_applicant_id_fkey" FOREIGN KEY (applicant_id) REFERENCES public.applicants(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."applicant_skills" validate constraint "applicant_skills_applicant_id_fkey";

alter table "public"."applicant_skills" add constraint "applicant_skills_rating_check" CHECK (((rating >= 0) AND (rating <= 5))) not valid;

alter table "public"."applicant_skills" validate constraint "applicant_skills_rating_check";

alter table "public"."applicant_skills" add constraint "applicant_skills_skill_id_fkey" FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."applicant_skills" validate constraint "applicant_skills_skill_id_fkey";

alter table "public"."applicants" add constraint "applicants_joblisting_id_fkey" FOREIGN KEY (joblisting_id) REFERENCES public.job_listings(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."applicants" validate constraint "applicants_joblisting_id_fkey";

alter table "public"."applicants" add constraint "applicants_parsed_resume_id_fkey" FOREIGN KEY (parsed_resume_id) REFERENCES public.parsed_resume(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."applicants" validate constraint "applicants_parsed_resume_id_fkey";

alter table "public"."applicants" add constraint "applicants_score_id_fkey" FOREIGN KEY (score_id) REFERENCES public.scored_candidates(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."applicants" validate constraint "applicants_score_id_fkey";

alter table "public"."applicants" add constraint "applicants_transcribed_id_fkey" FOREIGN KEY (transcribed_id) REFERENCES public.transcribed(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."applicants" validate constraint "applicants_transcribed_id_fkey";

alter table "public"."audit_logs" add constraint "audit_logs_actor_id_fkey" FOREIGN KEY (actor_id) REFERENCES public.staff(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."audit_logs" validate constraint "audit_logs_actor_id_fkey";

alter table "public"."conversation_messages" add constraint "conversation_messages_role_check" CHECK ((role = ANY (ARRAY['user'::text, 'assistant'::text]))) not valid;

alter table "public"."conversation_messages" validate constraint "conversation_messages_role_check";

alter table "public"."hr_reports" add constraint "hr_report_applicant_id_fkey" FOREIGN KEY (applicant_id) REFERENCES public.applicants(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."hr_reports" validate constraint "hr_report_applicant_id_fkey";

alter table "public"."hr_reports" add constraint "hr_report_staff_id_fkey" FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."hr_reports" validate constraint "hr_report_staff_id_fkey";

alter table "public"."hr_reports" add constraint "score_range" CHECK (((score >= (0)::double precision) AND (score <= (5)::double precision))) not valid;

alter table "public"."hr_reports" validate constraint "score_range";

alter table "public"."jl_qualifications" add constraint "jl_qualifications_joblisting_id_fkey" FOREIGN KEY (joblisting_id) REFERENCES public.job_listings(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."jl_qualifications" validate constraint "jl_qualifications_joblisting_id_fkey";

alter table "public"."jl_requirements" add constraint "jl_requirements_joblisting_id_fkey" FOREIGN KEY (joblisting_id) REFERENCES public.job_listings(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."jl_requirements" validate constraint "jl_requirements_joblisting_id_fkey";

alter table "public"."job_listings" add constraint "job_listings_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.staff(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."job_listings" validate constraint "job_listings_created_by_fkey";

alter table "public"."job_listings" add constraint "job_listings_staff_id_fkey" FOREIGN KEY (staff_id) REFERENCES public.staff(id) not valid;

alter table "public"."job_listings" validate constraint "job_listings_staff_id_fkey";

alter table "public"."job_tags" add constraint "job_tags_job_id_fkey" FOREIGN KEY (joblisting_id) REFERENCES public.job_listings(id) ON DELETE CASCADE not valid;

alter table "public"."job_tags" validate constraint "job_tags_job_id_fkey";

alter table "public"."job_tags" add constraint "job_tags_tag_id_fkey" FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE not valid;

alter table "public"."job_tags" validate constraint "job_tags_tag_id_fkey";

alter table "public"."key_highlights" add constraint "key_highlights_report_id_fkey" FOREIGN KEY (report_id) REFERENCES public.hr_reports(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."key_highlights" validate constraint "key_highlights_report_id_fkey";

alter table "public"."social_links" add constraint "social_links_applicant_id_fkey" FOREIGN KEY (applicant_id) REFERENCES public.applicants(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."social_links" validate constraint "social_links_applicant_id_fkey";

alter table "public"."staff" add constraint "users_firebase_uid_key" UNIQUE using index "users_firebase_uid_key";

alter table "public"."tags" add constraint "tags_slug_unique" UNIQUE using index "tags_slug_unique";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.compute_hiring_success_and_time_to_hire(from_ts timestamp without time zone DEFAULT (now() - '30 days'::interval), to_ts timestamp without time zone DEFAULT now())
 RETURNS TABLE(metric_type text, status_or_stage text, value numeric, p50 numeric, p75 numeric, p90 numeric)
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
$function$
;

CREATE OR REPLACE FUNCTION public.count_applicants_by_status()
 RETURNS TABLE(status public.candidate_status, applicants_count bigint)
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
$function$
;

create or replace view "public"."daily_active_jobs_last_7_days" as  WITH days AS (
         SELECT (generate_series((date_trunc('day'::text, now()) - '6 days'::interval), date_trunc('day'::text, now()), '1 day'::interval))::date AS d
        )
 SELECT d.d AS date,
    (EXTRACT(dow FROM d.d))::integer AS dow,
    to_char((d.d)::timestamp with time zone, 'FMDay'::text) AS weekday,
    count(j.id) AS jobs
   FROM (days d
     LEFT JOIN public.job_listings j ON (((j.created_at)::date <= d.d)))
  GROUP BY d.d
 HAVING ((EXTRACT(dow FROM d.d) >= (1)::numeric) AND (EXTRACT(dow FROM d.d) <= (5)::numeric))
  ORDER BY d.d;


CREATE OR REPLACE FUNCTION public.get_ai_metrics_overall_by_month(p_year integer, p_month integer)
 RETURNS TABLE(avg_job_fit_score double precision, avg_response_time double precision)
 LANGUAGE sql
 STABLE
AS $function$
with bounds as (
  select
    make_timestamptz(p_year, p_month, 1, 0, 0, 0, 'UTC') as from_ts,
    make_timestamptz(p_year, p_month, 1, 0, 0, 0, 'UTC') + interval '1 month' as to_ts
),
base as (
  select
    nullif(score_data->>'job_fit_score', '')::double precision as job_fit_score,
    nullif(score_data->>'response_time', '')::double precision as response_time
  from public.scored_candidates sc
  cross join bounds b
  where sc.created_at >= b.from_ts and sc.created_at < b.to_ts
)
select
  coalesce(avg(job_fit_score), 0)::double precision,
  coalesce(avg(response_time), 0)::double precision
from base;
$function$
;

CREATE OR REPLACE FUNCTION public.get_ai_metrics_weekly_by_month(p_year integer, p_month integer)
 RETURNS TABLE(week integer, avg_job_fit_score double precision, avg_response_time double precision)
 LANGUAGE sql
 STABLE
AS $function$
with bounds as (
  select
    make_timestamptz(p_year, p_month, 1, 0, 0, 0, 'UTC') as from_ts,
    make_timestamptz(p_year, p_month, 1, 0, 0, 0, 'UTC') + interval '1 month' as to_ts
),
base as (
  select
    greatest(1, least(4, floor((extract(day from sc.created_at)::int - 1) / 7) + 1))::int as week,
    nullif(score_data->>'job_fit_score', '')::double precision as job_fit_score,
    nullif(score_data->>'response_time', '')::double precision as response_time
  from public.scored_candidates sc
  cross join bounds b
  where sc.created_at >= b.from_ts and sc.created_at < b.to_ts
),
agg as (
  select
    week,
    coalesce(avg(job_fit_score), 0)::double precision as avg_job_fit_score,
    coalesce(avg(response_time), 0)::double precision as avg_response_time
  from base
  group by week
)
select
  g.week,
  coalesce(a.avg_job_fit_score, 0)::double precision,
  coalesce(a.avg_response_time, 0)::double precision
from generate_series(1, 4) as g(week)
left join agg a on a.week = g.week
order by g.week;
$function$
;

CREATE OR REPLACE FUNCTION public.get_bottleneck_percentiles(from_ts timestamp with time zone, to_ts timestamp with time zone)
 RETURNS TABLE(status text, samples bigint, p50_seconds double precision, p75_seconds double precision, p90_seconds double precision, p50_interval interval, p75_interval interval, p90_interval interval)
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_hiring_kpis(from_ts timestamp without time zone, to_ts timestamp without time zone)
 RETURNS TABLE(metric_type text, status_or_stage text, value numeric, p50 numeric, p75 numeric, p90 numeric)
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
$function$
;

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
$function$
;

CREATE OR REPLACE FUNCTION public.get_top_candidates_by_job_fit(p_limit integer DEFAULT 10)
 RETURNS TABLE(applicant_id uuid, first_name text, last_name text, email text, status public.candidate_status, score_id uuid, score_data jsonb, job_fit_score double precision)
 LANGUAGE sql
 STABLE
AS $function$
  select
    a.id as applicant_id,
    a.first_name::text,
    a.last_name::text,
    a.email::text,
    a.status,
    a.score_id,
    sc.score_data,
    coalesce((sc.score_data->>'job_fit_score')::double precision, 0) as job_fit_score
  from public.applicants a
  join public.scored_candidates sc
    on sc.id = a.score_id
  order by coalesce((sc.score_data->>'job_fit_score')::double precision, 0) desc
  limit p_limit;
$function$
;

create or replace view "public"."weekly_applicants_last_4_weeks" as  WITH weeks AS (
         SELECT generate_series((date_trunc('week'::text, now()) - '21 days'::interval), date_trunc('week'::text, now()), '7 days'::interval) AS week_start
        )
 SELECT (week_start)::date AS week_start,
    ((week_start + '6 days'::interval))::date AS week_end,
    to_char(week_start, 'IYYY-IW'::text) AS iso_week,
    ( SELECT count(*) AS count
           FROM public.applicants a
          WHERE ((a.created_at >= weeks.week_start) AND (a.created_at < (weeks.week_start + '7 days'::interval)))) AS applicants
   FROM weeks
  ORDER BY ((week_start)::date);


grant delete on table "public"."admin_feedback" to "anon";

grant insert on table "public"."admin_feedback" to "anon";

grant references on table "public"."admin_feedback" to "anon";

grant select on table "public"."admin_feedback" to "anon";

grant trigger on table "public"."admin_feedback" to "anon";

grant truncate on table "public"."admin_feedback" to "anon";

grant update on table "public"."admin_feedback" to "anon";

grant delete on table "public"."admin_feedback" to "authenticated";

grant insert on table "public"."admin_feedback" to "authenticated";

grant references on table "public"."admin_feedback" to "authenticated";

grant select on table "public"."admin_feedback" to "authenticated";

grant trigger on table "public"."admin_feedback" to "authenticated";

grant truncate on table "public"."admin_feedback" to "authenticated";

grant update on table "public"."admin_feedback" to "authenticated";

grant delete on table "public"."admin_feedback" to "service_role";

grant insert on table "public"."admin_feedback" to "service_role";

grant references on table "public"."admin_feedback" to "service_role";

grant select on table "public"."admin_feedback" to "service_role";

grant trigger on table "public"."admin_feedback" to "service_role";

grant truncate on table "public"."admin_feedback" to "service_role";

grant update on table "public"."admin_feedback" to "service_role";

grant delete on table "public"."applicant_skills" to "anon";

grant insert on table "public"."applicant_skills" to "anon";

grant references on table "public"."applicant_skills" to "anon";

grant select on table "public"."applicant_skills" to "anon";

grant trigger on table "public"."applicant_skills" to "anon";

grant truncate on table "public"."applicant_skills" to "anon";

grant update on table "public"."applicant_skills" to "anon";

grant delete on table "public"."applicant_skills" to "authenticated";

grant insert on table "public"."applicant_skills" to "authenticated";

grant references on table "public"."applicant_skills" to "authenticated";

grant select on table "public"."applicant_skills" to "authenticated";

grant trigger on table "public"."applicant_skills" to "authenticated";

grant truncate on table "public"."applicant_skills" to "authenticated";

grant update on table "public"."applicant_skills" to "authenticated";

grant delete on table "public"."applicant_skills" to "service_role";

grant insert on table "public"."applicant_skills" to "service_role";

grant references on table "public"."applicant_skills" to "service_role";

grant select on table "public"."applicant_skills" to "service_role";

grant trigger on table "public"."applicant_skills" to "service_role";

grant truncate on table "public"."applicant_skills" to "service_role";

grant update on table "public"."applicant_skills" to "service_role";

grant delete on table "public"."applicants" to "anon";

grant insert on table "public"."applicants" to "anon";

grant references on table "public"."applicants" to "anon";

grant select on table "public"."applicants" to "anon";

grant trigger on table "public"."applicants" to "anon";

grant truncate on table "public"."applicants" to "anon";

grant update on table "public"."applicants" to "anon";

grant delete on table "public"."applicants" to "authenticated";

grant insert on table "public"."applicants" to "authenticated";

grant references on table "public"."applicants" to "authenticated";

grant select on table "public"."applicants" to "authenticated";

grant trigger on table "public"."applicants" to "authenticated";

grant truncate on table "public"."applicants" to "authenticated";

grant update on table "public"."applicants" to "authenticated";

grant delete on table "public"."applicants" to "service_role";

grant insert on table "public"."applicants" to "service_role";

grant references on table "public"."applicants" to "service_role";

grant select on table "public"."applicants" to "service_role";

grant trigger on table "public"."applicants" to "service_role";

grant truncate on table "public"."applicants" to "service_role";

grant update on table "public"."applicants" to "service_role";

grant delete on table "public"."audit_logs" to "anon";

grant insert on table "public"."audit_logs" to "anon";

grant references on table "public"."audit_logs" to "anon";

grant select on table "public"."audit_logs" to "anon";

grant trigger on table "public"."audit_logs" to "anon";

grant truncate on table "public"."audit_logs" to "anon";

grant update on table "public"."audit_logs" to "anon";

grant delete on table "public"."audit_logs" to "authenticated";

grant insert on table "public"."audit_logs" to "authenticated";

grant references on table "public"."audit_logs" to "authenticated";

grant select on table "public"."audit_logs" to "authenticated";

grant trigger on table "public"."audit_logs" to "authenticated";

grant truncate on table "public"."audit_logs" to "authenticated";

grant update on table "public"."audit_logs" to "authenticated";

grant delete on table "public"."audit_logs" to "service_role";

grant insert on table "public"."audit_logs" to "service_role";

grant references on table "public"."audit_logs" to "service_role";

grant select on table "public"."audit_logs" to "service_role";

grant trigger on table "public"."audit_logs" to "service_role";

grant truncate on table "public"."audit_logs" to "service_role";

grant update on table "public"."audit_logs" to "service_role";

grant delete on table "public"."conversation_messages" to "anon";

grant insert on table "public"."conversation_messages" to "anon";

grant references on table "public"."conversation_messages" to "anon";

grant select on table "public"."conversation_messages" to "anon";

grant trigger on table "public"."conversation_messages" to "anon";

grant truncate on table "public"."conversation_messages" to "anon";

grant update on table "public"."conversation_messages" to "anon";

grant delete on table "public"."conversation_messages" to "authenticated";

grant insert on table "public"."conversation_messages" to "authenticated";

grant references on table "public"."conversation_messages" to "authenticated";

grant select on table "public"."conversation_messages" to "authenticated";

grant trigger on table "public"."conversation_messages" to "authenticated";

grant truncate on table "public"."conversation_messages" to "authenticated";

grant update on table "public"."conversation_messages" to "authenticated";

grant delete on table "public"."conversation_messages" to "service_role";

grant insert on table "public"."conversation_messages" to "service_role";

grant references on table "public"."conversation_messages" to "service_role";

grant select on table "public"."conversation_messages" to "service_role";

grant trigger on table "public"."conversation_messages" to "service_role";

grant truncate on table "public"."conversation_messages" to "service_role";

grant update on table "public"."conversation_messages" to "service_role";

grant delete on table "public"."hr_reports" to "anon";

grant insert on table "public"."hr_reports" to "anon";

grant references on table "public"."hr_reports" to "anon";

grant select on table "public"."hr_reports" to "anon";

grant trigger on table "public"."hr_reports" to "anon";

grant truncate on table "public"."hr_reports" to "anon";

grant update on table "public"."hr_reports" to "anon";

grant delete on table "public"."hr_reports" to "authenticated";

grant insert on table "public"."hr_reports" to "authenticated";

grant references on table "public"."hr_reports" to "authenticated";

grant select on table "public"."hr_reports" to "authenticated";

grant trigger on table "public"."hr_reports" to "authenticated";

grant truncate on table "public"."hr_reports" to "authenticated";

grant update on table "public"."hr_reports" to "authenticated";

grant delete on table "public"."hr_reports" to "service_role";

grant insert on table "public"."hr_reports" to "service_role";

grant references on table "public"."hr_reports" to "service_role";

grant select on table "public"."hr_reports" to "service_role";

grant trigger on table "public"."hr_reports" to "service_role";

grant truncate on table "public"."hr_reports" to "service_role";

grant update on table "public"."hr_reports" to "service_role";

grant delete on table "public"."jl_qualifications" to "anon";

grant insert on table "public"."jl_qualifications" to "anon";

grant references on table "public"."jl_qualifications" to "anon";

grant select on table "public"."jl_qualifications" to "anon";

grant trigger on table "public"."jl_qualifications" to "anon";

grant truncate on table "public"."jl_qualifications" to "anon";

grant update on table "public"."jl_qualifications" to "anon";

grant delete on table "public"."jl_qualifications" to "authenticated";

grant insert on table "public"."jl_qualifications" to "authenticated";

grant references on table "public"."jl_qualifications" to "authenticated";

grant select on table "public"."jl_qualifications" to "authenticated";

grant trigger on table "public"."jl_qualifications" to "authenticated";

grant truncate on table "public"."jl_qualifications" to "authenticated";

grant update on table "public"."jl_qualifications" to "authenticated";

grant delete on table "public"."jl_qualifications" to "service_role";

grant insert on table "public"."jl_qualifications" to "service_role";

grant references on table "public"."jl_qualifications" to "service_role";

grant select on table "public"."jl_qualifications" to "service_role";

grant trigger on table "public"."jl_qualifications" to "service_role";

grant truncate on table "public"."jl_qualifications" to "service_role";

grant update on table "public"."jl_qualifications" to "service_role";

grant delete on table "public"."jl_requirements" to "anon";

grant insert on table "public"."jl_requirements" to "anon";

grant references on table "public"."jl_requirements" to "anon";

grant select on table "public"."jl_requirements" to "anon";

grant trigger on table "public"."jl_requirements" to "anon";

grant truncate on table "public"."jl_requirements" to "anon";

grant update on table "public"."jl_requirements" to "anon";

grant delete on table "public"."jl_requirements" to "authenticated";

grant insert on table "public"."jl_requirements" to "authenticated";

grant references on table "public"."jl_requirements" to "authenticated";

grant select on table "public"."jl_requirements" to "authenticated";

grant trigger on table "public"."jl_requirements" to "authenticated";

grant truncate on table "public"."jl_requirements" to "authenticated";

grant update on table "public"."jl_requirements" to "authenticated";

grant delete on table "public"."jl_requirements" to "service_role";

grant insert on table "public"."jl_requirements" to "service_role";

grant references on table "public"."jl_requirements" to "service_role";

grant select on table "public"."jl_requirements" to "service_role";

grant trigger on table "public"."jl_requirements" to "service_role";

grant truncate on table "public"."jl_requirements" to "service_role";

grant update on table "public"."jl_requirements" to "service_role";

grant delete on table "public"."job_listings" to "anon";

grant insert on table "public"."job_listings" to "anon";

grant references on table "public"."job_listings" to "anon";

grant select on table "public"."job_listings" to "anon";

grant trigger on table "public"."job_listings" to "anon";

grant truncate on table "public"."job_listings" to "anon";

grant update on table "public"."job_listings" to "anon";

grant delete on table "public"."job_listings" to "authenticated";

grant insert on table "public"."job_listings" to "authenticated";

grant references on table "public"."job_listings" to "authenticated";

grant select on table "public"."job_listings" to "authenticated";

grant trigger on table "public"."job_listings" to "authenticated";

grant truncate on table "public"."job_listings" to "authenticated";

grant update on table "public"."job_listings" to "authenticated";

grant delete on table "public"."job_listings" to "service_role";

grant insert on table "public"."job_listings" to "service_role";

grant references on table "public"."job_listings" to "service_role";

grant select on table "public"."job_listings" to "service_role";

grant trigger on table "public"."job_listings" to "service_role";

grant truncate on table "public"."job_listings" to "service_role";

grant update on table "public"."job_listings" to "service_role";

grant delete on table "public"."job_tags" to "anon";

grant insert on table "public"."job_tags" to "anon";

grant references on table "public"."job_tags" to "anon";

grant select on table "public"."job_tags" to "anon";

grant trigger on table "public"."job_tags" to "anon";

grant truncate on table "public"."job_tags" to "anon";

grant update on table "public"."job_tags" to "anon";

grant delete on table "public"."job_tags" to "authenticated";

grant insert on table "public"."job_tags" to "authenticated";

grant references on table "public"."job_tags" to "authenticated";

grant select on table "public"."job_tags" to "authenticated";

grant trigger on table "public"."job_tags" to "authenticated";

grant truncate on table "public"."job_tags" to "authenticated";

grant update on table "public"."job_tags" to "authenticated";

grant delete on table "public"."job_tags" to "service_role";

grant insert on table "public"."job_tags" to "service_role";

grant references on table "public"."job_tags" to "service_role";

grant select on table "public"."job_tags" to "service_role";

grant trigger on table "public"."job_tags" to "service_role";

grant truncate on table "public"."job_tags" to "service_role";

grant update on table "public"."job_tags" to "service_role";

grant delete on table "public"."key_highlights" to "anon";

grant insert on table "public"."key_highlights" to "anon";

grant references on table "public"."key_highlights" to "anon";

grant select on table "public"."key_highlights" to "anon";

grant trigger on table "public"."key_highlights" to "anon";

grant truncate on table "public"."key_highlights" to "anon";

grant update on table "public"."key_highlights" to "anon";

grant delete on table "public"."key_highlights" to "authenticated";

grant insert on table "public"."key_highlights" to "authenticated";

grant references on table "public"."key_highlights" to "authenticated";

grant select on table "public"."key_highlights" to "authenticated";

grant trigger on table "public"."key_highlights" to "authenticated";

grant truncate on table "public"."key_highlights" to "authenticated";

grant update on table "public"."key_highlights" to "authenticated";

grant delete on table "public"."key_highlights" to "service_role";

grant insert on table "public"."key_highlights" to "service_role";

grant references on table "public"."key_highlights" to "service_role";

grant select on table "public"."key_highlights" to "service_role";

grant trigger on table "public"."key_highlights" to "service_role";

grant truncate on table "public"."key_highlights" to "service_role";

grant update on table "public"."key_highlights" to "service_role";

grant delete on table "public"."parsed_resume" to "anon";

grant insert on table "public"."parsed_resume" to "anon";

grant references on table "public"."parsed_resume" to "anon";

grant select on table "public"."parsed_resume" to "anon";

grant trigger on table "public"."parsed_resume" to "anon";

grant truncate on table "public"."parsed_resume" to "anon";

grant update on table "public"."parsed_resume" to "anon";

grant delete on table "public"."parsed_resume" to "authenticated";

grant insert on table "public"."parsed_resume" to "authenticated";

grant references on table "public"."parsed_resume" to "authenticated";

grant select on table "public"."parsed_resume" to "authenticated";

grant trigger on table "public"."parsed_resume" to "authenticated";

grant truncate on table "public"."parsed_resume" to "authenticated";

grant update on table "public"."parsed_resume" to "authenticated";

grant delete on table "public"."parsed_resume" to "service_role";

grant insert on table "public"."parsed_resume" to "service_role";

grant references on table "public"."parsed_resume" to "service_role";

grant select on table "public"."parsed_resume" to "service_role";

grant trigger on table "public"."parsed_resume" to "service_role";

grant truncate on table "public"."parsed_resume" to "service_role";

grant update on table "public"."parsed_resume" to "service_role";

grant delete on table "public"."scored_candidates" to "anon";

grant insert on table "public"."scored_candidates" to "anon";

grant references on table "public"."scored_candidates" to "anon";

grant select on table "public"."scored_candidates" to "anon";

grant trigger on table "public"."scored_candidates" to "anon";

grant truncate on table "public"."scored_candidates" to "anon";

grant update on table "public"."scored_candidates" to "anon";

grant delete on table "public"."scored_candidates" to "authenticated";

grant insert on table "public"."scored_candidates" to "authenticated";

grant references on table "public"."scored_candidates" to "authenticated";

grant select on table "public"."scored_candidates" to "authenticated";

grant trigger on table "public"."scored_candidates" to "authenticated";

grant truncate on table "public"."scored_candidates" to "authenticated";

grant update on table "public"."scored_candidates" to "authenticated";

grant delete on table "public"."scored_candidates" to "service_role";

grant insert on table "public"."scored_candidates" to "service_role";

grant references on table "public"."scored_candidates" to "service_role";

grant select on table "public"."scored_candidates" to "service_role";

grant trigger on table "public"."scored_candidates" to "service_role";

grant truncate on table "public"."scored_candidates" to "service_role";

grant update on table "public"."scored_candidates" to "service_role";

grant delete on table "public"."social_links" to "anon";

grant insert on table "public"."social_links" to "anon";

grant references on table "public"."social_links" to "anon";

grant select on table "public"."social_links" to "anon";

grant trigger on table "public"."social_links" to "anon";

grant truncate on table "public"."social_links" to "anon";

grant update on table "public"."social_links" to "anon";

grant delete on table "public"."social_links" to "authenticated";

grant insert on table "public"."social_links" to "authenticated";

grant references on table "public"."social_links" to "authenticated";

grant select on table "public"."social_links" to "authenticated";

grant trigger on table "public"."social_links" to "authenticated";

grant truncate on table "public"."social_links" to "authenticated";

grant update on table "public"."social_links" to "authenticated";

grant delete on table "public"."social_links" to "service_role";

grant insert on table "public"."social_links" to "service_role";

grant references on table "public"."social_links" to "service_role";

grant select on table "public"."social_links" to "service_role";

grant trigger on table "public"."social_links" to "service_role";

grant truncate on table "public"."social_links" to "service_role";

grant update on table "public"."social_links" to "service_role";

grant delete on table "public"."staff" to "anon";

grant insert on table "public"."staff" to "anon";

grant references on table "public"."staff" to "anon";

grant select on table "public"."staff" to "anon";

grant trigger on table "public"."staff" to "anon";

grant truncate on table "public"."staff" to "anon";

grant update on table "public"."staff" to "anon";

grant delete on table "public"."staff" to "authenticated";

grant insert on table "public"."staff" to "authenticated";

grant references on table "public"."staff" to "authenticated";

grant select on table "public"."staff" to "authenticated";

grant trigger on table "public"."staff" to "authenticated";

grant truncate on table "public"."staff" to "authenticated";

grant update on table "public"."staff" to "authenticated";

grant delete on table "public"."staff" to "service_role";

grant insert on table "public"."staff" to "service_role";

grant references on table "public"."staff" to "service_role";

grant select on table "public"."staff" to "service_role";

grant trigger on table "public"."staff" to "service_role";

grant truncate on table "public"."staff" to "service_role";

grant update on table "public"."staff" to "service_role";

grant delete on table "public"."tags" to "anon";

grant insert on table "public"."tags" to "anon";

grant references on table "public"."tags" to "anon";

grant select on table "public"."tags" to "anon";

grant trigger on table "public"."tags" to "anon";

grant truncate on table "public"."tags" to "anon";

grant update on table "public"."tags" to "anon";

grant delete on table "public"."tags" to "authenticated";

grant insert on table "public"."tags" to "authenticated";

grant references on table "public"."tags" to "authenticated";

grant select on table "public"."tags" to "authenticated";

grant trigger on table "public"."tags" to "authenticated";

grant truncate on table "public"."tags" to "authenticated";

grant update on table "public"."tags" to "authenticated";

grant delete on table "public"."tags" to "service_role";

grant insert on table "public"."tags" to "service_role";

grant references on table "public"."tags" to "service_role";

grant select on table "public"."tags" to "service_role";

grant trigger on table "public"."tags" to "service_role";

grant truncate on table "public"."tags" to "service_role";

grant update on table "public"."tags" to "service_role";

grant delete on table "public"."transcribed" to "anon";

grant insert on table "public"."transcribed" to "anon";

grant references on table "public"."transcribed" to "anon";

grant select on table "public"."transcribed" to "anon";

grant trigger on table "public"."transcribed" to "anon";

grant truncate on table "public"."transcribed" to "anon";

grant update on table "public"."transcribed" to "anon";

grant delete on table "public"."transcribed" to "authenticated";

grant insert on table "public"."transcribed" to "authenticated";

grant references on table "public"."transcribed" to "authenticated";

grant select on table "public"."transcribed" to "authenticated";

grant trigger on table "public"."transcribed" to "authenticated";

grant truncate on table "public"."transcribed" to "authenticated";

grant update on table "public"."transcribed" to "authenticated";

grant delete on table "public"."transcribed" to "service_role";

grant insert on table "public"."transcribed" to "service_role";

grant references on table "public"."transcribed" to "service_role";

grant select on table "public"."transcribed" to "service_role";

grant trigger on table "public"."transcribed" to "service_role";

grant truncate on table "public"."transcribed" to "service_role";

grant update on table "public"."transcribed" to "service_role";


