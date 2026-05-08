"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createShareLink(jobId: string, expiryDays?: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const job = await prisma.job.findFirst({
    where: { id: jobId, userId: session.user.id },
  });
  if (!job) throw new Error("Not found");

  const expiresAt = expiryDays
    ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000)
    : null;

  const link = await prisma.shareLink.create({
    data: { jobId, createdById: session.user.id, expiresAt },
  });

  revalidatePath(`/jobs/${jobId}`);
  return { token: link.token };
}

export async function revokeShareLink(linkId: string, jobId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await prisma.shareLink.updateMany({
    where: { id: linkId, createdById: session.user.id },
    data: { revokedAt: new Date() },
  });

  revalidatePath(`/jobs/${jobId}`);
  return { ok: true as const };
}

export async function getShareLinks(jobId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return prisma.shareLink.findMany({
    where: { jobId, createdById: session.user.id, revokedAt: null },
    include: { _count: { select: { feedback: true } } },
    orderBy: { createdAt: "desc" },
  });
}
