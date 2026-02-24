// Types not directly related to the database schema but used throughout the application
// --------------- Types for common attributes | meant for extends --------------- //

import type { inferProcedureOutput } from "@trpc/server";
import type { FieldValue, Timestamp } from "firebase/firestore";
import type { JwtPayload } from "jsonwebtoken";
import type { ENTITIES, EVENT_TYPES, USER_ROLES } from "@/lib/constants";
import type { AppRouter } from "@/lib/trpc/routers/app";

export interface IdentifiableItem {
  id: number;
}

export interface Title {
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
  role: (typeof USER_ROLES)[number];
}

interface Tag extends IdentifiableItem {
  title: string;
}

export interface Tags {
  tags: Tag[];
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: Timestamp | FieldValue;
  link: string;
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

export type UserActionEventType = (typeof EVENT_TYPES)[number];

export type EntityTypes = (typeof ENTITIES)[number];

export type UserRoles = (typeof USER_ROLES)[number];

export type FetchCandidateProfileOutput = inferProcedureOutput<
  AppRouter["candidate"]["fetchCandidateProfile"]
>;

export type HRReport = inferProcedureOutput<
  AppRouter["staff"]["fetchHRReports"]
>[number];
