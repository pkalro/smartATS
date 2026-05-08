"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { askText } from "@/lib/ai";
import { assertUnderCap, incrementUsage, UsageCapError } from "@/lib/usage";

export async function generateManagerPulseAction(jobId: string | null) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const userId = session.user.id;

  // Fetch shortlisted applications for this user, optionally filtered by job
  const applications = await prisma.candidateJobApplication.findMany({
    where: {
      status: "SHORTLISTED",
      job: { userId },
      ...(jobId ? { jobId } : {}),
    },
    include: {
      candidate: {
        select: {
          name: true,
          score: true,
          noticePeriod: true,
          currentSalary: true,
          expectedSalary: true,
          status: true,
        },
      },
      job: { select: { title: true } },
    },
    orderBy: [{ score: "desc" }],
  });

  if (applications.length === 0) return { error: "No shortlisted candidates found." };

  const lines = applications.map((app) => {
    const c = app.candidate;
    const parts = [
      `• ${c.name ?? "Unnamed"} (${app.job?.title ?? "unknown role"})`,
      `Status: ${app.status}`,
      app.score != null && `Score: ${app.score}/100`,
      c.noticePeriod && `Notice: ${c.noticePeriod}`,
      c.currentSalary && `Current: ${c.currentSalary}`,
      c.expectedSalary && `Expected: ${c.expectedSalary}`,
    ]
      .filter(Boolean)
      .join(" | ");
    return parts;
  });

  try {
    await assertUnderCap(userId);
    const email = await askText({
      system: `You are a technical recruiter writing a concise update email to a hiring manager.
Write a professional but warm pulse email summarizing the current shortlisted candidates.
Include: brief status of the pipeline, key highlights per candidate (strengths, notice, salary), and a recommended next step.
Keep it under 250 words. No fluff. Format as a ready-to-send email (subject line + body).`,
      user: `Shortlisted candidates:\n\n${lines.join("\n")}`,
      maxTokens: 600,
    });
    await incrementUsage(userId);
    return { email };
  } catch (e) {
    if (e instanceof UsageCapError) return { error: (e as Error).message };
    console.error(e);
    return { error: "Failed to generate email." };
  }
}
