/**
 * Single source of truth for status colours used everywhere:
 * pipeline, candidates list, candidate header, job applications, etc.
 */
export const STATUS_STYLES: Record<string, string> = {
  NEW:          "bg-slate-100 text-slate-700 border-slate-200",
  SCREENING:    "bg-blue-100 text-blue-700 border-blue-200",
  SHORTLISTED:  "bg-violet-100 text-violet-700 border-violet-200",
  INTERVIEWING: "bg-amber-100 text-amber-800 border-amber-200",
  OFFER:        "bg-orange-100 text-orange-700 border-orange-200",
  HIRED:        "bg-green-100 text-green-700 border-green-200",
  REJECTED:     "bg-red-100 text-red-600 border-red-200",
  WITHDRAWN:    "bg-slate-100 text-slate-400 border-slate-200",
};

export const STATUS_BAR: Record<string, string> = {
  NEW:          "bg-slate-400",
  SCREENING:    "bg-blue-500",
  SHORTLISTED:  "bg-violet-500",
  INTERVIEWING: "bg-amber-500",
  OFFER:        "bg-orange-500",
  HIRED:        "bg-green-500",
  REJECTED:     "bg-red-400",
  WITHDRAWN:    "bg-slate-300",
};
