/**
 * Sanitize raw AI output before writing to Prisma.
 *
 * The AI sometimes returns:
 *  - yearsExperience as a string ("5", "5-7 years") instead of a number
 *  - score as a float (72.8) — schema expects Int
 *  - any numeric field as null/undefined when the model omits it
 *
 * Prisma validates types strictly at runtime, so coerce everything here.
 */

export function toNullableFloat(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return isNaN(v) ? null : v;
  if (typeof v === "string") {
    // Handle ranges like "5-7" — take the lower bound
    const first = v.replace(/[^\d.]/g, " ").trim().split(/\s+/)[0];
    const n = parseFloat(first);
    return isNaN(n) ? null : n;
  }
  return null;
}

export function toNullableInt(v: unknown): number | null {
  const f = toNullableFloat(v);
  return f === null ? null : Math.round(f);
}

export function toNullableString(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "string") return v.trim() || null;
  if (typeof v === "number") return String(v);
  return null;
}
