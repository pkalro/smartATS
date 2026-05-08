"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { draftSchedulingEmail } from "@/lib/ai/email";
import { assertUnderCap, incrementUsage, UsageCapError } from "@/lib/usage";
import { revalidatePath } from "next/cache";

function isValidUrl(s: string) {
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

export async function saveBookingLink(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const link = String(formData.get("bookingLink") ?? "").trim();
  if (!isValidUrl(link)) {
    return { error: "That doesn't look like a valid URL. Try https://calendly.com/your-handle" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { bookingLink: link },
  });

  revalidatePath("/settings");
  return { ok: true as const };
}

export async function generateSchedulingEmail(candidateId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const userId = session.user.id;

  const [user, candidate] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, bookingLink: true },
    }),
    prisma.candidate.findFirst({
      where: { id: candidateId, userId },
      include: { job: { select: { title: true } } },
    }),
  ]);

  if (!candidate) return { error: "Candidate not found" };
  if (!user?.bookingLink) {
    return { error: "Add your booking link first." };
  }

  try {
    await assertUnderCap(userId);
    const draft = await draftSchedulingEmail({
      candidateName: candidate.name,
      jobTitle: candidate.job?.title ?? null,
      bookingLink: user.bookingLink,
      recruiterName: user.name,
    });
    await incrementUsage(userId);

    await prisma.emailDraft.create({
      data: {
        candidateId,
        subject: draft.subject,
        body: draft.body,
        bookingLink: user.bookingLink,
      },
    });

    await prisma.candidate.update({
      where: { id: candidateId },
      data: { status: "INTERVIEWING" },
    });

    revalidatePath(`/candidates/${candidateId}`);
    revalidatePath("/pipeline");
    return { ok: true as const };
  } catch (e) {
    if (e instanceof UsageCapError) return { error: e.message };
    console.error(e);
    return { error: "Failed to generate email." };
  }
}
