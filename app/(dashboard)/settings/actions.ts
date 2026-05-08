"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

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
