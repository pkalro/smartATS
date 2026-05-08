// Shared status string-literal types — stored as plain strings in Postgres.

export type CandidateStatus =
  | "NEW"          // just added, not yet screened
  | "SCREENING"    // screening call / AI screen in progress
  | "SHORTLISTED"  // passed screening, submitted to HM
  | "INTERVIEWING" // in one or more interview rounds
  | "OFFER"        // offer extended
  | "HIRED"        // accepted offer
  | "REJECTED"     // not moving forward
  | "WITHDRAWN";   // candidate pulled out

export type JobStatus = "DRAFT" | "ACTIVE" | "CLOSED";
