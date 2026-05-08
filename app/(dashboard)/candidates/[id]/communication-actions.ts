"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function logCommunication(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const candidateId = formData.get("candidateId") as string;
  const applicationId = (formData.get("applicationId") as string) || null;
  const channel = (formData.get("channel") as string) || "EMAIL";
  const direction = (formData.get("direction") as string) || "OUT";
  const subject = (formData.get("subject") as string) || null;
  const body = (formData.get("body") as string) || null;
  const occurredAt = formData.get("occurredAt") as string;

  const candidate = await prisma.candidate.findFirst({
    where: { id: candidateId, userId: session.user.id },
  });
  if (!candidate) throw new Error("Not found");

  await prisma.communication.create({
    data: {
      candidateId,
      applicationId: applicationId || null,
      channel,
      direction,
      subject: subject || null,
      body: body || null,
      occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
    },
  });

  revalidatePath(`/candidates/${candidateId}`);
  return { ok: true as const };
}

export async function deleteCommunication(commId: string, candidateId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const comm = await prisma.communication.findFirst({
    where: { id: commId, candidate: { userId: session.user.id } },
  });
  if (!comm) throw new Error("Not found");

  await prisma.communication.delete({ where: { id: commId } });
  revalidatePath(`/candidates/${candidateId}`);
  return { ok: true as const };
}
