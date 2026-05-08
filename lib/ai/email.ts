import { askJSON } from "@/lib/ai";

export type EmailDraft = { subject: string; body: string };

export async function draftSchedulingEmail(args: {
  candidateName: string | null;
  jobTitle: string | null;
  bookingLink: string;
  recruiterName: string | null;
}): Promise<EmailDraft> {
  return askJSON<EmailDraft>({
    system: `You write warm, concise scheduling emails from a recruiter to a candidate. The candidate has been approved to advance and the recruiter is offering a time-slot picker.

Style:
- Friendly but professional (think: senior recruiter at a fast-growing company).
- 4-6 short sentences total in the body.
- Embed the booking link as a plain URL on its own line so it's easy to click.
- No salesy fluff, no "I hope this email finds you well", no excessive exclamation points.
- Sign off with the recruiter's first name (or "the team" if not provided).
- Subject line under 60 chars.

Output schema: { "subject": string, "body": string }`,
    user: `Candidate name: ${args.candidateName ?? "(unknown)"}
Job title: ${args.jobTitle ?? "(unspecified role)"}
Recruiter name: ${args.recruiterName ?? "(unspecified)"}
Booking link: ${args.bookingLink}`,
    maxTokens: 800,
  });
}
