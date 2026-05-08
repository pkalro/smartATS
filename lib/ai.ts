import Anthropic from "@anthropic-ai/sdk";

export const MODEL = "claude-sonnet-4-6";

// Create a fresh client per call so ANTHROPIC_API_KEY is read at call time,
// not at module-init time (which can run before Next.js loads .env.local).
function client() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

// Helper: ask Claude for JSON output. Throws on parse failure.
export async function askJSON<T>(args: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<T> {
  const res = await client().messages.create({
    model: MODEL,
    max_tokens: args.maxTokens ?? 2048,
    system: [
      {
        type: "text",
        text: args.system +
          "\n\nRespond with ONLY a valid JSON object. No prose, no markdown fences.",
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: args.user }],
  });

  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  // Strip ```json fences if Claude added them
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Fallback: extract first {...} block
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("AI returned non-JSON: " + text.slice(0, 200));
    return JSON.parse(match[0]) as T;
  }
}

// Helper: free-form text response
export async function askText(args: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<string> {
  const res = await client().messages.create({
    model: MODEL,
    max_tokens: args.maxTokens ?? 1024,
    system: [
      {
        type: "text",
        text: args.system,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: args.user }],
  });
  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}
