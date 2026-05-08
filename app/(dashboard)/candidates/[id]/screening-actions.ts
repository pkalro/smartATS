"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { generateScreeningKit } from "@/lib/ai/resume";
import { assertUnderCap, incrementUsage, UsageCapError } from "@/lib/usage";
import { parseSkills } from "@/lib/skills";
import { revalidatePath } from "next/cache";

export async function generateKit(candidateId: string, jobId?: string | null) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const userId = session.user.id;

  const candidate = await prisma.candidate.findFirst({
    where: { id: candidateId, userId },
    include: {
      job: { select: { id: true, title: true, rawJD: true, interviewRounds: true } },
    },
  });
  if (!candidate) return { error: "Candidate not found." };

  // Resolve the target job — use explicitly passed jobId first, fallback to primary job
  let targetJob = candidate.job;
  if (jobId && jobId !== candidate.job?.id) {
    targetJob = await prisma.job.findFirst({
      where: { id: jobId, userId },
      select: { id: true, title: true, rawJD: true, interviewRounds: true },
    });
  }
  if (!targetJob) return { error: "Link this candidate to a role first." };

  const skills = parseSkills(candidate.skills);
  const candidateSummary = [
    candidate.name && `Name: ${candidate.name}`,
    candidate.currentTitle && `Title: ${candidate.currentTitle}`,
    candidate.currentCompany && `Company: ${candidate.currentCompany}`,
    candidate.yearsExperience != null && `Experience: ${candidate.yearsExperience} years`,
    skills.length > 0 && `Skills: ${skills.join(", ")}`,
    candidate.location && `Location: ${candidate.location}`,
    candidate.noticePeriod && `Notice: ${candidate.noticePeriod}`,
    candidate.currentSalary && `Current salary: ${candidate.currentSalary}`,
    candidate.expectedSalary && `Expected salary: ${candidate.expectedSalary}`,
    candidate.scoreRationale && `Fit notes: ${candidate.scoreRationale}`,
  ]
    .filter(Boolean)
    .join("\n");

  let interviewRounds: string[] = [];
  try {
    const parsed = JSON.parse(targetJob.interviewRounds ?? "[]");
    if (Array.isArray(parsed)) interviewRounds = parsed;
  } catch {
    //
  }

  try {
    await assertUnderCap(userId);
    const kit = await generateScreeningKit({
      candidateSummary,
      jdText: targetJob.rawJD,
      jobTitle: targetJob.title,
      interviewRounds,
    });
    await incrementUsage(userId);

    await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        pitchDeck: JSON.stringify(kit.pitchDeck),
        gapAnalysis: JSON.stringify(kit.gapAnalysis),
        screeningQuestions: JSON.stringify(kit.screeningQuestions),
        recruiterNotes: JSON.stringify(kit.recruiterNotes),
        processEmail: kit.processEmail,
        processWhatsapp: kit.processWhatsapp,
        status: "SCREENING",
      },
    });

    revalidatePath(`/candidates/${candidateId}`);
    return { ok: true as const };
  } catch (e) {
    if (e instanceof UsageCapError) return { error: e.message };
    console.error(e);
    return { error: "Failed to generate screening kit." };
  }
}
