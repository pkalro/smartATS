"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

const ALLOWED_FIELDS = new Set([
  "name", "email", "phone", "currentTitle", "currentCompany",
  "location", "noticePeriod", "currentSalary", "expectedSalary",
  "yearsExperience",
]);

export async function updateCandidateField(
  candidateId: string,
  field: string,
  value: string,
) {
  if (!ALLOWED_FIELDS.has(field)) throw new Error(`Field "${field}" is not editable.`);
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Ensure candidate belongs to user
  const candidate = await prisma.candidate.findFirst({
    where: { id: candidateId, userId: session.user.id },
    select: { id: true },
  });
  if (!candidate) throw new Error("Candidate not found");

  const data: Record<string, string | number | null> = {};
  if (field === "yearsExperience") {
    const n = parseFloat(value);
    data[field] = isNaN(n) ? null : n;
  } else {
    data[field] = value || null;
  }

  await prisma.candidate.update({ where: { id: candidateId }, data });
  revalidatePath(`/candidates/${candidateId}`);
}
