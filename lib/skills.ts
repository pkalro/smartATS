// Skills are stored as a JSON-encoded string so the schema works on both
// SQLite (local dev) and Postgres (prod) without provider-specific arrays.

export function parseSkills(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

export function serializeSkills(skills: string[] | null | undefined): string {
  if (!Array.isArray(skills)) return "[]";
  return JSON.stringify(skills.filter((s) => typeof s === "string" && s.trim().length > 0));
}
