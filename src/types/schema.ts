import { Title } from "./types";

// -------------------------------- Database Schema -------------------------------- //

interface DateRange {
  start_month: string;
  start_year: number;
  end_month: string | null;
  end_year: number | null;
}

interface IdentifiableItem {
  id: string;
}

export interface Admin extends IdentifiableItem {
  user_id: string;
}

export interface User extends IdentifiableItem {
  first_name: string;
  last_name: string;
  phone_number: string | null;
  prefix: string;
  firebase_uid: string;
  country_code: string;
  resume_id: string | null;
  street: string | null;
  zip: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  job_title: string | null;
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
  link: string | null;
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

export interface JobApplicants
  extends IdentifiableItem,
    Pick<Admin, "user_id"> {
  created_at: string;
  joblisting_id: string;
}

export interface JobListing
  extends IdentifiableItem,
    Pick<JobApplicants, "created_at">,
    Title {
  location: string;
  created_by: string;
  is_fulltime: boolean;
}

export interface JobListingQualifications
  extends IdentifiableItem,
    Pick<JobApplicants, "joblisting_id"> {
  qualification: string;
}

export interface JobListingRequirements
  extends IdentifiableItem,
    Pick<JobApplicants, "joblisting_id"> {
  requirement: string;
}
