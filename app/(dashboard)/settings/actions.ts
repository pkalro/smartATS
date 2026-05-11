"use server";

import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { trackEvent } from "@/lib/posthog";

export async function saveRecruiterProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const company = String(formData.get("company") ?? "").trim() || null;
  const industry = String(formData.get("industry") ?? "").trim() || null;
  const recruiterCategory = String(formData.get("recruiterCategory") ?? "").trim() || null;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { company, industry, recruiterCategory },
  });

  revalidatePath("/settings");
  return { ok: true as const };
}

/**
 * Permanently delete the signed-in user's account and all related data.
 *
 * Required by DPDP Act (right to erasure) and standard SaaS hygiene. The user
 * must type their own email to confirm — guards against accidental clicks and
 * row-spoofing.
 *
 * Cascade behaviour comes from prisma schema (`onDelete: Cascade` on User ←
 * Account/Session, Job, Candidate, UsageMeter relations).
 */
export async function deleteMyAccount(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const userId = session.user.id;

  const confirmEmail = String(formData.get("confirmEmail") ?? "").trim().toLowerCase();
  const actualEmail = (session.user.email ?? "").trim().toLowerCase();
  if (!actualEmail || confirmEmail !== actualEmail) {
    return { error: "Email does not match. Type your account email exactly to confirm." };
  }

  await trackEvent(userId, "account_deleted", {});

  // Wipe the user — cascades delete jobs, candidates, applications, communications,
  // tags, usage meters, sessions, accounts.
  await prisma.user.delete({ where: { id: userId } });

  await signOut({ redirectTo: "/" });
  return { ok: true as const };
}
