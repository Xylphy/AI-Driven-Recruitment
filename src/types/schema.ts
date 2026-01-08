import { EntityTypes, Title, UserActionEventType, UserRoles } from "./types";
import { CANDIDATE_STATUSES, USER_ROLES } from "@/lib/constants";

// -------------------------------- Database Schema -------------------------------- //
// For Database Schema, we use snake_case for field names

export interface IdentifiableItem<T = string> {
  id: T;
}

export interface Staff extends IdentifiableItem {
  first_name: string;
  last_name: string;
  firebase_uid: string;
  role: (typeof USER_ROLES)[number];
}

export interface Applicants extends IdentifiableItem {
  joblisting_id: string;
  email?: string;
  first_name: string;
  last_name: string;
  resume_id: string;
  country_code: string;
  street?: string;
  zip?: string;
  city?: string;
  state?: string;
  country?: string;
  parsed_resume_id?: string;
  transcript_id: string;
  transcribed_id?: string;
  birthday: string;
  status: (typeof CANDIDATE_STATUSES)[number] | null;
  created_at: string;
}

export interface JobListing extends IdentifiableItem, Title {
  created_at: string;
  joblisting_id: string;
  location: "Cebu City" | "Manila" | "Tokyo";
  created_by: string;
  is_fulltime: boolean;
  officer_id?: string;
}

export interface JobListingQualifications
  extends IdentifiableItem,
    Pick<Applicants, "joblisting_id"> {
  qualification: string;
}

export interface JobListingRequirements
  extends IdentifiableItem,
    Pick<Applicants, "joblisting_id"> {
  requirement: string;
}

export interface Tags extends IdentifiableItem<number> {
  name: string;
}

export interface JobTags
  extends Pick<JobListing, "joblisting_id">,
    IdentifiableItem<number> {}

export interface ActiveJob {
  date: string;
  dow: number;
  weekday: string;
  jobs: number;
}

export interface WeeklyCumulativeApplicants {
  week_start: string;
  week_end: string;
  iso_week: string;
  applicants: number;
}

export interface AdminFeedback extends IdentifiableItem {
  admin_id: string;
  applicant_id: string;
  feedback: string;
  created_at: string;
}

export interface AuditLog {
  created_at?: string; //timestamp
  id?: string; // uuid

  // actor (who)
  actor_type: UserRoles;
  actor_id?: string; // nullable staff_id

  // action (what)
  action: "create" | "update" | "delete";
  event_type: UserActionEventType;

  // target (to what)
  entity_type: EntityTypes;
  entity_id: string;

  // details (additional info)
  changes: Record<string, Changes>;
  details: string;
}

export interface Changes {
  before: string;
  after: string;
}

export interface HRReport extends IdentifiableItem {
  applicant_id: string;
  staff_id: string;
  score: number; // Floating point number
  summary: string;
  created_at: string;
}

export interface KeyHighlights extends IdentifiableItem {
  created_at: string;
  report_id: string;
  highlight: string;
}
