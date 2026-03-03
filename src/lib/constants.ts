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
  "SuperAdmin",
  "Staff",
  "Applicant",
] as const;

export const JOB_LOCATIONS = ["Cebu City", "Manila", "Tokyo"] as const;

export const EVENT_TYPES = [
  "Joblisting modified",
  "Joblisting deleted",
  "Created joblisting",
  "Applied for job",
  "Changed user role",
  "Changed candidate status",
  "Admin feedback created",
  "Admin feedback deleted",
  "Admin feedback updated",
  "Created HR Report",
  "Deleted HR Report",
  "Updated HR Report",
  "Created staff account",
  "Staff password updated",
] as const;

export const ENTITIES = [
  "Applicant",
  "Job Listing",
  "Admin Feedback",
  "Staff Report",
  "Staff",
] as const;

export const REGULAR_STAFF_ROLES = ["Admin", "HR Officer"] as const;

export const ALL_STAFF_ROLES = [...REGULAR_STAFF_ROLES, "SuperAdmin"] as const;
