interface IdentifiableItem {
  id: number;
}

interface DateRange {
  startMonth: string;
  startYear: number;
  endMonth: string;
  endYear: number;
}

// ----- Exported Types ----- //
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

export interface SocialLink {
  id: number;
  value: string;
}

export interface JobApplicationDetail {
  id: number;
  title: string;
  dateApplied: string;
}

export interface EducationalDetail extends DateRange, IdentifiableItem {
  institute: string;
  major: string;
  degree: string;
  currentlyPursuing: boolean;
}

export interface JobExperience extends DateRange, IdentifiableItem {
  title: string;
  company: string;
  summary: string;
  currentlyWorking: boolean;
}

export type QualificationOrRequirement = {
  id: number;
  title: string;
};

export type JobListing = {
  title: string;
  qualifications: QualificationOrRequirement[];
  requirements: QualificationOrRequirement[];
  location: string;
};
