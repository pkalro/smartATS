import { askJSON, askText } from "@/lib/ai";

export type JDAnalysis = {
  title: string;
  personaSummary: string;
  booleanLinkedIn: string;
  booleanNaukri: string;
  booleanXRay: string;
  targetCompanies: string[];
  altDesignations: string[];
  nichePlatforms: string[];
};

export async function analyzeJD(rawJD: string): Promise<JDAnalysis> {
  return askJSON<JDAnalysis>({
    system: `You are an expert technical recruiter and sourcing specialist.
Given a job description, produce all of the following:

1. title — short job title under 60 chars.
2. personaSummary — 4-6 sentence description of the ideal candidate (background, skills, seniority, motivations).
3. booleanLinkedIn — LinkedIn Recruiter boolean string. Use AND/OR/NOT and parentheses. Focus on 3-6 differentiating skills/titles. No salary or location.
4. booleanNaukri — Naukri boolean search string. Same logic as LinkedIn (for now use identical syntax).
5. booleanXRay — Google X-ray search string. Format: site:linkedin.com/in/ (<title> OR <alt>) AND (<skill1> OR <skill2>). Compact, effective.
6. targetCompanies — 6-10 company names where ideal candidates likely work (competitors, adjacent industries, companies known for this role). Return as a JSON string array.
7. altDesignations — 5-8 alternative job titles / designations for the same role. Return as a JSON string array.
8. nichePlatforms — 3-6 niche job boards or communities where this talent pools (e.g. AngelList, Wellfound, Dribbble, HackerNews, specific Slack communities). Return as a JSON string array.

Output schema (JSON only, no prose):
{
  "title": string,
  "personaSummary": string,
  "booleanLinkedIn": string,
  "booleanNaukri": string,
  "booleanXRay": string,
  "targetCompanies": string[],
  "altDesignations": string[],
  "nichePlatforms": string[]
}`,
    user: `Job description:\n\n${rawJD}`,
    maxTokens: 2000,
  });
}

export async function suggestTargetCompanies(args: {
  jobTitle: string;
  personaSummary?: string | null;
  rawJD?: string | null;
  industry?: string | null;
  companyTier?: string | null;
}): Promise<string[]> {
  const context = [
    args.industry    && `Industry: ${args.industry}`,
    args.companyTier && `Target company tier: ${args.companyTier}`,
    args.personaSummary && `Candidate persona: ${args.personaSummary}`,
  ].filter(Boolean).join("\n");

  // askJSON always appends "JSON object" instruction, so we wrap in an object
  // to avoid Claude returning a bare array which JSON.parse then mishandles.
  const result = await askJSON<{ companies: string[] }>({
    system: `You are an expert technical recruiter and sourcing specialist.
Given a job role and context, return 10-15 specific company names where ideal candidates for this role are most likely to work.

Rules:
- Be specific — name real, well-known companies, not generic categories.
- Prioritise companies known for this role/tech stack.
- Mix company sizes/types if no tier is specified; otherwise focus on the given tier.
- If industry is provided, stay within that industry or adjacent ones.

Return a JSON object with a single key "companies" containing a string array.
Example: {"companies": ["Razorpay", "Zepto", "Meesho", "Swiggy", "CRED", "PhonePe"]}`,
    user: `Job title: ${args.jobTitle}\n${context}${args.rawJD ? `\n\nJob description excerpt:\n${args.rawJD.slice(0, 1500)}` : ""}`,
    maxTokens: 500,
  });

  // Defensive extraction — handle both {companies:[...]} and bare array responses
  if (Array.isArray(result)) return result as unknown as string[];
  if (Array.isArray(result?.companies)) return result.companies;
  // Last resort: look for any array value in the object
  const anyArray = Object.values(result as Record<string, unknown>).find(Array.isArray);
  return (anyArray as string[]) ?? [];
}

const POST_TYPE_PROMPTS: Record<string, string> = {
  "short-casual": `Write a SHORT, CASUAL LinkedIn post (120-180 words). Conversational tone. 1-2 sentences of hook, quick bullets on what you need, one line CTA. No corporate speak. Emoji optional.`,
  "long-professional": `Write a LONG, PROFESSIONAL LinkedIn post (300-400 words). Structured with clear sections: hook, about the team, what you'll do (bullets), what we need (bullets), why join us (bullets), CTA. Polished and authoritative tone.`,
  "bullet-style": `Write a BULLET-STYLE LinkedIn post (200-280 words). Almost entirely bullet points — minimal prose. Hook line, then bullets for role overview, requirements, and perks. Very scannable.`,
  "story-style": `Write a STORY-STYLE LinkedIn post (200-280 words). Start with a relatable challenge or insight (2-3 lines), then naturally lead into the role, what we're looking for, and end with a warm CTA. No bullet points — flowing prose.`,
  "jd-format": `Write a STRUCTURED JD (250-350 words) ready to paste into LinkedIn Jobs. Sections: Company context, About the role (bullets), Requirements (bullets), Nice to have (bullets), Why join (bullets), CTA. No salary unless in original JD.`,
};

export async function generateLinkedInPost(args: {
  rawJD: string;
  title: string;
  personaSummary?: string | null;
  postType?: string;
}): Promise<string> {
  const typePrompt = POST_TYPE_PROMPTS[args.postType ?? "jd-format"] ?? POST_TYPE_PROMPTS["jd-format"];
  return askText({
    system: `You are an expert technical recruiter writing a compelling LinkedIn post for a job opening.\n\n${typePrompt}\n\nGeneral rules: No generic buzzwords. Be specific about the role. Direct and human.`,
    user: `Job title: ${args.title}\n\nRaw JD:\n${args.rawJD}${args.personaSummary ? `\n\nIdeal candidate persona:\n${args.personaSummary}` : ""}`,
    maxTokens: 900,
  });
}
