"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateCandidateTags(candidateId: string, tags: string[]) {
  const session = await auth();
  const candidate = await prisma.candidate.findFirst({
    where: { id: candidateId, userId: session!.user.id },
  });
  if (!candidate) return { error: "Not found" };

  await prisma.candidate.update({
    where: { id: candidateId },
    data: { tags: JSON.stringify(tags) },
  });
  revalidatePath(`/candidates/${candidateId}`);
  return { ok: true };
}
