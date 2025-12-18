export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const PREFIXES = [
  "Mr.",
  "Mrs.",
  "Ms.",
  "Dr.",
  "Jr.",
  "Sr.",
  "Engr.",
] as const;

// ISO 3166-1 alpha-2 country codes with their respective phone prefixes
export const COUNTRY_CODES = {
  US: "+1",
  PH: "+63",
  UK: "+44",
  IN: "+91",
} as const;

export const COUNTRY = {
  PH: "Philippines",
  US: "United States",
  UK: "United Kingdom",
  IN: "India",
  CA: "Canada",
  AU: "Australia",
} as const;

export const CANDIDATE_STATUSES = [
  "Paper Screening",
  "Exam",
  "HR Interview",
  "Technical Interview",
  "Final Interview",
  "Job Offer",
  "Accepted Job Offer",
  "Close Status",
] as const;

export const USER_ROLES = [
  "Admin",
  "User",
  "SuperAdmin",
  // "HR Officer",
] as const;

export const JOB_LOCATIONS = ["Cebu City", "Manila", "Tokyo"] as const;

export const USER_ACTION_EVENT_TYPES = [
  "Status Changed",
  "Profile Updated",
  "Joblisting modified",
  "Joblisting deleted",
  "Created joblisting",
  "Applied for job",
  "Changed job alerts",
  "Changed user role",
  "Changed candidate status",
  "Verified email",
] as const;

export const ENTITIES = ["Job Applicant", "User", "Job Listing"] as const;
