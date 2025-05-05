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
  public_id?: string;
}

export interface SocialLink {
  id: number;
  value: string;
}

export interface EducationalDetail {
  id: number;
  value: string;
  institute?: string;
  major?: string;
  degree?: string;
  duration?: string;
  startMonth?: string;
  startYear?: string;
  endMonth?: string;
  endYear?: string;
  currentlyPursuing?: boolean;
}

export interface JobApplicationDetail {
  id: number;
  title: string;
  dateApplied: string;
}

export interface JobExperience {
  id: number;
  value: string;
  title?: string;
  company?: string;
  summary?: string;
  startMonth?: string;
  startYear?: string;
  endMonth?: string;
  endYear?: string;
  currentlyWorking?: boolean;
}
