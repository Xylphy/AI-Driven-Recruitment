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
  "HR Officer",
  "Applicant",
] as const;

export const JOB_LOCATIONS = ["Cebu City", "Manila", "Tokyo"] as const;

export const EVENT_TYPES = [
  "Profile Updated",
  "Joblisting modified",
  "Joblisting deleted",
  "Created joblisting",
  "Applied for job",
  "Changed job alerts",
  "Changed user role",
  "Changed candidate status",
  "Admin feedback created",
  "Admin feedback deleted",
  "Admin feedback updated",
  "Created HR Report",
  "Deleted HR Report",
  "Updated HR Report",
] as const;

export const ENTITIES = [
  "Job Applicant",
  "Job Listing",
  "Admin Feedback",
  "HR Report",
] as const;
