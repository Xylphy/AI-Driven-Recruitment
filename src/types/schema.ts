import { EntityTypes, Title, UserActionEventType, UserRoles } from "./types";
import { CANDIDATE_STATUSES, USER_ROLES } from "@/lib/constants";

// -------------------------------- Database Schema -------------------------------- //
// For Database Schema, we use snake_case for field names

interface DateRange {
  start_month: string;
  start_year: number;
  end_month: string | null;
  end_year: number | null;
}

export interface IdentifiableItem<T = string> {
  id: T;
}

export interface Admin extends IdentifiableItem {
  user_id: string;
}

export interface Staff extends IdentifiableItem {
  first_name: string;
  last_name: string;
  firebase_uid: string;
  role: (typeof USER_ROLES)[number];
}

export interface EducationalDetails
  extends IdentifiableItem,
    DateRange,
    Pick<Admin, "user_id"> {
  degree: string | null;
  institute: string | null;
  currently_pursuing: boolean;
  major: string | null;
}

export interface SocialLinks extends IdentifiableItem, Pick<Admin, "user_id"> {
  link: string;
}

export interface Skills extends IdentifiableItem, Pick<Admin, "user_id"> {
  skill: string | null;
}

export interface JobExperiences
  extends IdentifiableItem,
    Pick<Admin, "user_id">,
    DateRange {
  title: string | null;
  company: string | null;
  summary: string | null;
  currently_working: boolean;
}

export interface JobApplicant extends IdentifiableItem, Pick<Admin, "user_id"> {
  created_at: string;
  joblisting_id: string;
  score_id: string;
  status: (typeof CANDIDATE_STATUSES)[number] | null;
  notify: boolean;
}

export interface JobListing
  extends IdentifiableItem,
    Pick<JobApplicant, "created_at">,
    Title {
  joblisting_id: string;
  location: "Cebu City" | "Manila" | "Tokyo";
  created_by: string;
  is_fulltime: boolean;
  officer_id: string;
}

export interface JobListingQualifications
  extends IdentifiableItem,
    Pick<JobApplicant, "joblisting_id"> {
  qualification: string;
}

export interface JobListingRequirements
  extends IdentifiableItem,
    Pick<JobApplicant, "joblisting_id"> {
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
