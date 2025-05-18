// --------------- Common Types --------------- //
interface IdentifiableItem {
  id: number;
}

interface DateRange {
  startMonth: string;
  startYear: number;
  endMonth: string;
  endYear: number;
}

interface Title {
  title: string;
}

// --------------- Exported Types --------------- //
export interface RegisterState {
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
  educationalDetails: EducationalDetail[];
  socialLinks: SocialLink[];
  jobExperiences: JobExperience[];
  public_id?: string;
}

export interface SocialLink extends IdentifiableItem {
  value: string;
}

export interface JobApplicationDetail extends IdentifiableItem, Title {
  dateApplied: string;
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
}
