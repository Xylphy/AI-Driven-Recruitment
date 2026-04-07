export const FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB
export const VIDEO_SIZE_LIMIT = 90 * 1024 * 1024; // 90MB
export const PAGE_SIZE = 10; // Size for pagination
export const DEBOUNCE_DELAY = 500; // 500ms debounce delay for search inputs

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
  "Created Staff Evaluation",
  "Deleted Staff Evaluation",
  "Updated Staff Evaluation",
  "Created staff account",
  "Staff password updated",
] as const;

export const REGULAR_STAFF_ROLES = ["Admin", "Staff"] as const;
export const PENDING_JOB_LISTING_KEY = "pendingJobListing"; // Key for sessionStorage to store pending job listing data during creation process
