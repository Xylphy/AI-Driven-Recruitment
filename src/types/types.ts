// Types not directly related to the database schema but used throughout the application
// --------------- Types for common attributes | meant for extends --------------- //

export interface IdentifiableItem {
  id: number;
}

export interface DateRange {
  startMonth: string;
  startYear: number;
  endMonth: string;
  endYear: number;
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
  publicId?: string; // Resume ID
  transcriptId?: string;
}

export interface RegisterState extends User {
  educationalDetails: EducationalDetail[];
  socialLinks: SocialLink[];
  jobExperiences: JobExperience[];
}

export interface SocialLink extends IdentifiableItem {
  value: string;
}

export interface JobApplicationDetail extends IdentifiableItem, Title {
  date: string;
}

export interface EducationalDetail extends DateRange, IdentifiableItem {
  institute: string;
  major: string;
  degree: string;
  currentlyPursuing: boolean;
}

export interface JobExperience extends DateRange, IdentifiableItem, Title {
  company: string;
  summary: string;
  currentlyWorking: boolean;
}

export interface IdentifiableTitle extends IdentifiableItem, Title {}

export interface JobListing extends Title {
  qualifications: IdentifiableTitle[];
  requirements: IdentifiableTitle[];
  location: string;
  created_at: string;
}

export interface DbIdentification {
  db_id: string;
}

export interface JWT {
  id: string;
  isAdmin: boolean;
}
