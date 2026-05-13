import { askJSON } from "@/lib/ai";

export type SkillScarcity = {
  skill: string;
  level: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
  note: string;
};

export type MarketIntelligence = {
  salaryMin: number;
  salaryMax: number;
  salaryMedian: number;
  currency: string;
  scarcity: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
  scarcityReason: string;
  skillScarcity: SkillScarcity[];
  insights: string[];
  budgetReality: string;
  hmTalkingPoints: string[];
  generatedAt: string;
};

export async function generateMarketIntelligence(params: {
  rawJD: string;
  title: string;
  locationPref?: string | null;
  minExperience?: number | null;
  maxExperience?: number | null;
}): Promise<MarketIntelligence> {
  const location = params.locationPref || "India";
  const expRange = params.minExperience != null
    ? `${params.minExperience}–${params.maxExperience ?? params.minExperience + 3} years`
    : "unspecified experience";

  return askJSON<MarketIntelligence>({
    system: `You are a senior compensation analyst and talent market expert with deep knowledge of tech and non-tech hiring markets globally, especially India.
Provide realistic, data-grounded salary and scarcity intelligence based on your training data.
Be honest when data is limited. Always note the data is approximate based on market knowledge up to your training cutoff.`,
    user: `Analyze the talent market for this role and return a JSON object.

Role: ${params.title}
Location: ${location}
Experience required: ${expRange}

Job Description (first 2000 chars):
${params.rawJD.slice(0, 2000)}

Return this exact JSON shape:
{
  "salaryMin": <annual CTC in local currency, integer>,
  "salaryMax": <annual CTC in local currency, integer>,
  "salaryMedian": <annual CTC in local currency, integer>,
  "currency": <"INR" or "USD" or "GBP" etc based on location>,
  "scarcity": <overall role scarcity — MUST be exactly one of: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH">,
  "scarcityReason": <1-2 sentences explaining the overall scarcity rating>,
  "skillScarcity": [
    {
      "skill": <skill or competency name, e.g. "Kubernetes", "MERN Stack", "Revenue Leadership">,
      "level": <MUST be exactly one of: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH">,
      "note": <one short sentence on why this skill has this scarcity in the talent market>
    }
    // 4-7 entries covering the most differentiating skills/competencies for this role
  ],
  "insights": [<3-5 short bullet strings about the market for this role>],
  "budgetReality": <1-2 sentences on whether the implied budget matches market reality>,
  "hmTalkingPoints": [<3 data-backed points a recruiter can use with a hiring manager to calibrate expectations>],
  "generatedAt": "${new Date().toISOString()}"
}

Scarcity calibration guide — pick the ONE that best fits:
- "LOW"      → Widely available profiles; large active talent pool; easy to source (e.g. junior frontend, basic data entry, general customer support)
- "MEDIUM"   → Reasonable supply but takes 2-4 weeks of active sourcing; some competition (e.g. mid-level React developer, Python backend 3-5 yrs, business analyst)
- "HIGH"     → Noticeably scarce; strong competition from other employers; may take 4-8 weeks (e.g. senior full-stack 5+ yrs, ML engineer, DevOps/SRE, niche domain expertise)
- "VERY_HIGH"→ Extremely rare combination; top-of-market comp required; often 2-3+ months to fill (e.g. principal engineer, AI researcher, CTO-calibre, hyper-niche stack in a specific domain)

Be accurate — do NOT default to HIGH. Most roles are MEDIUM. Only use HIGH or VERY_HIGH when the skill combination is genuinely rare.`,
    maxTokens: 2048,
  });
}
