import { askJSON } from "@/lib/ai";

export type ScreeningKit = {
  pitchDeck: string[];        // 3-4 bullet points
  gapAnalysis: string[];      // 3-5 bullet points
  screeningQuestions: string[];
  recruiterNotes: string[];   // 3-4 bullet points
  processEmail: string;
  processWhatsapp: string;
};

export async function generateScreeningKit(args: {
  candidateSummary: string; // name, title, company, skills, experience
  jdText: string;
  jobTitle: string;
  interviewRounds?: string[]; // stages from intake form
}): Promise<ScreeningKit> {
  const roundsNote = args.interviewRounds?.length
    ? `Interview process: ${args.interviewRounds.join(" → ")}`
    : "";

  return askJSON<ScreeningKit>({
    system: `You are an expert technical recruiter preparing a complete screening dossier for a candidate.
Given a candidate profile and job description, produce:

1. pitchDeck — 3-4 SHORT bullet points (not sentences) pitching the role to the candidate. Each bullet: one crisp line. Highlight growth, impact, team culture. Return as a JSON string[].
2. gapAnalysis — 3-5 SHORT bullet points identifying concrete gaps or strengths vs the JD. Each bullet starts with ✓ for a match or ✗ for a gap. Be specific. Return as a JSON string[].
3. screeningQuestions — exactly 5 targeted screening questions. Mix technical and behavioral. Reference their actual background. Return as a JSON string[].
4. recruiterNotes — 3-4 SHORT bullet points for the recruiter. How to position the candidate, red flags to probe, suggested approach. Each bullet is one crisp line. Return as a JSON string[].
5. processEmail — a warm email (150-200 words) explaining the interview process. Professional but friendly. ${roundsNote ? `Include these stages: ${args.interviewRounds?.join(", ")}.` : "Keep process generic since no stages were specified."}
6. processWhatsapp — a shorter WhatsApp message (50-80 words, casual) covering the same process info.

Output schema (JSON only):
{
  "pitchDeck": string[],
  "gapAnalysis": string[],
  "screeningQuestions": string[],
  "recruiterNotes": string[],
  "processEmail": string,
  "processWhatsapp": string
}`,
    user: `Job title: ${args.jobTitle}\n\nJob description:\n${args.jdText}\n\n---\n\nCandidate profile:\n${args.candidateSummary}`,
    maxTokens: 2500,
  });
}

export type ExtractedCandidate = {
  name: string | null;
  email: string | null;
  phone: string | null;
  currentTitle: string | null;
  currentCompany: string | null;
  yearsExperience: number | null;
  skills: string[];
  noticePeriod: string | null;
  currentSalary: string | null;
  expectedSalary: string | null;
  location: string | null;
};

export type ScreeningResult = ExtractedCandidate & {
  score: number; // 0-100
  scoreRationale: string;
};

const EXTRACT_SCHEMA = `{
  "name": string|null,
  "email": string|null,
  "phone": string|null,
  "currentTitle": string|null,
  "currentCompany": string|null,
  "yearsExperience": number|null,
  "skills": string[],         // 5-15 most relevant skills/tech
  "noticePeriod": string|null, // e.g. "2 weeks", "30 days", "immediate"
  "currentSalary": string|null,
  "expectedSalary": string|null,
  "location": string|null
}`;

export async function screenCandidate(args: {
  source: string;
  sourceType: "resume" | "notes";
  jdText?: string | null;
  jobTitle?: string | null;
}): Promise<ScreeningResult> {
  const wantsScore = !!args.jdText;
  const sourceLabel = args.sourceType === "resume" ? "resume" : "recruiter call notes";

  const system = `You are an expert recruiter assistant. Extract structured candidate data from a ${sourceLabel}.

Rules:
- If a field is not stated or unclear, use null (do NOT guess).
- "skills" should be the 5-15 most relevant skills/technologies/tools, normalized (e.g. "React.js" -> "React").
- "yearsExperience" is total professional experience as a number.
- "noticePeriod" should be a short phrase like "2 weeks", "30 days", "immediate", "serving notice".
- Salaries: keep them as written including currency (e.g. "$120k", "₹18 LPA").
${
  wantsScore
    ? `- Also produce "score" (0-100, integer) measuring fit vs. the job description, and "scoreRationale" (2-3 sentences explaining the score, citing concrete matches and gaps).`
    : ""
}

Output schema: ${EXTRACT_SCHEMA.replace(
    "}",
    wantsScore ? `,\n  "score": number,\n  "scoreRationale": string\n}` : "}",
  )}`;

  const user = wantsScore
    ? `Job title: ${args.jobTitle ?? "(not provided)"}\n\nJob description:\n${args.jdText}\n\n---\n\n${sourceLabel}:\n${args.source}`
    : `${sourceLabel}:\n${args.source}`;

  const result = await askJSON<ScreeningResult>({
    system,
    user,
    maxTokens: 2048,
  });

  // Defensive defaults if the model omits score
  if (typeof result.score !== "number") result.score = 0;
  if (!result.scoreRationale) result.scoreRationale = "";
  if (!Array.isArray(result.skills)) result.skills = [];

  return result;
}
