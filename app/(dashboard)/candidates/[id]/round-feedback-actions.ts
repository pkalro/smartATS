"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addRoundFeedback(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const applicationId = formData.get("applicationId") as string;
  const roundName = formData.get("roundName") as string;
  const interviewerName = (formData.get("interviewerName") as string) || null;
  const decision = (formData.get("decision") as string) || "PENDING";
  const notes = (formData.get("notes") as string) || null;
  const nextStep = (formData.get("nextStep") as string) || null;

  const app = await prisma.candidateJobApplication.findFirst({
    where: { id: applicationId, candidate: { userId: session.user.id } },
  });
  if (!app) throw new Error("Not found");

  await prisma.roundFeedback.create({
    data: { applicationId, roundName, interviewerName, decision, notes, nextStep },
  });

  revalidatePath(`/candidates/${app.candidateId}`);
  return { ok: true as const };
}

export async function deleteRoundFeedback(feedbackId: string, candidateId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const fb = await prisma.roundFeedback.findFirst({
    where: { id: feedbackId, application: { candidate: { userId: session.user.id } } },
  });
  if (!fb) throw new Error("Not found");

  await prisma.roundFeedback.delete({ where: { id: feedbackId } });
  revalidatePath(`/candidates/${candidateId}`);
  return { ok: true as const };
}
