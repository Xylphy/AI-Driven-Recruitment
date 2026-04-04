// Types not directly related to the database schema but used throughout the application
// --------------- Types for common attributes | meant for extends --------------- //

import type { inferProcedureOutput } from "@trpc/server";
import type { JwtPayload } from "jsonwebtoken";
import type {
  CANDIDATE_STATUSES,
  EVENT_TYPES,
  JOB_LOCATIONS,
  REGULAR_STAFF_ROLES,
  USER_ROLES,
} from "@/lib/constants";
import type { AppRouter } from "@/lib/trpc/routers/app";

interface IdentifiableItem {
  id: number;
}

interface Title {
  title: string;
}

// --------------- Exported Types --------------- //
export interface User {
  prefix: string;
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  mobileNumber: string;
  street: string;
  zip: string;
  city: string;
  state_: string;
  country: string;
  jobTitle: string;
  skillSet: string;
  resumeId?: string; // Resume ID
  transcriptId?: string;
}

export interface SocialLink extends IdentifiableItem {
  value: string;
}

export interface IdentifiableTitle extends IdentifiableItem, Title {}

export interface JobListing extends Title {
  qualifications: IdentifiableTitle[];
  requirements: IdentifiableTitle[];
  location: "Cebu City" | "Manila" | "Tokyo";
  isFullTime: boolean;
}

export interface JWT extends JwtPayload {
  id: string;
  role: UserRoles;
}

interface Tag extends IdentifiableItem {
  title: string;
}

export interface Tags {
  tags: Tag[];
}

export interface BottleneckPercentileRow {
  status: string;
  samples: number;
  p50_seconds: number;
  p75_seconds: number;
  p90_seconds: number;
  p50_interval: string; // "5 days 03:12:10"
  p75_interval: string;
  p90_interval: string;
}

export type ScoredCandidateData = {
  reason: string;
  phrases: string[];
  skill_gaps_recommendations: string;
  soft_skills_score: number;
  transcription_score: number;
  transcription_cultural_fit_score: number;
  cultural_fit_score: number;
  response_time: number;
  job_fit_score: number;
  job_fit_stars: number;
  predictive_success: number;
};

export type TranscribedData = {
  transcription: string;
  sentimental_analysis: string;
  sentimental_analysis_phrases: Array<string>;
  personality_traits: string;
  personality_traits_phrases: Array<string>;
  communication_style_insights: string;
  communication_style_insights_phrases: Array<string>;
  interview_insights: string;
  interview_insights_phrases: Array<string>;
  cultural_fit_insights: string;
  cultural_fit_insights_phrases: Array<string>;
};

export type ParsedResumeData = {
  name: string;
  city: string;
  contact_number: string;
  email: string;
  educational_background: Array<{
    degree: string;
    institution: string;
    start_date?: string; // ISO date string
    end_date?: string; // ISO date string
  }>;
  soft_skills: Array<string>;
  hard_skills: Array<string>;
  work_experience: Array<{
    title: string;
    company: string;
    start_date: string; // ISO date string
    end_date?: string; // ISO date string
    description?: string;
  }>;
  projects: Array<{
    name: string;
    start_date?: string; // ISO date string
    end_date?: string; // ISO date string
    description: string;
  }>;
};

export type UserActionEventType = (typeof EVENT_TYPES)[number];

export type UserRoles = (typeof USER_ROLES)[number];

export type RegularStaffRoles = (typeof REGULAR_STAFF_ROLES)[number];

export type CandidateStatuses = (typeof CANDIDATE_STATUSES)[number];

export type FetchCandidateProfileOutput = inferProcedureOutput<
  AppRouter["candidate"]["fetchCandidateProfile"]
>;

export type HRReport = inferProcedureOutput<
  AppRouter["staff"]["fetchHRReports"]
>[number];

export type JobLocations = (typeof JOB_LOCATIONS)[number];
