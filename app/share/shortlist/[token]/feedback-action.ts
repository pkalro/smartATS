"use server";

import { prisma } from "@/lib/db";

export async function submitShareFeedback(formData: FormData) {
  const token = formData.get("token") as string;
  const applicationId = formData.get("applicationId") as string;
  const decision = formData.get("decision") as string;
  const note = (formData.get("note") as string) || null;
  const viewerEmail = (formData.get("viewerEmail") as string) || null;

  const link = await prisma.shareLink.findFirst({
    where: { token, revokedAt: null },
  });
  if (!link) throw new Error("Link not found or revoked");
  if (link.expiresAt && link.expiresAt < new Date()) throw new Error("Link expired");

  // Upsert — one vote per (link, application)
  const existing = await prisma.shareFeedback.findFirst({
    where: { shareLinkId: link.id, applicationId },
  });

  if (existing) {
    await prisma.shareFeedback.update({
      where: { id: existing.id },
      data: { decision, note, viewerEmail: viewerEmail || existing.viewerEmail },
    });
  } else {
    await prisma.shareFeedback.create({
      data: { shareLinkId: link.id, applicationId, decision, note, viewerEmail },
    });
  }

  return { ok: true as const };
}
