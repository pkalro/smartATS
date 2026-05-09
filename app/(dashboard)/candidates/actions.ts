"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { fileToText } from "@/lib/parse-file";
import { screenCandidate } from "@/lib/ai/resume";
import { serializeSkills } from "@/lib/skills";
import { assertUnderCap, incrementUsage, UsageCapError } from "@/lib/usage";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { CandidateStatus } from "@/lib/types";
import { toNullableFloat, toNullableInt, toNullableString } from "@/lib/sanitize-candidate";
import { trackEvent } from "@/lib/posthog";

const MAX_CHARS = 30000;

export async function createCandidate(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const userId = session.user.id;

  const jobId = (formData.get("jobId") as string) || null;
  const notes = String(formData.get("notes") ?? "").trim();
  const file = formData.get("file") as File | null;
  const sourceChannel = (formData.get("source") as string) || "INBOUND";

  let source = "";
  let sourceType: "resume" | "notes" = "notes";

  if (file && file.size > 0) {
    try {
      source = await fileToText(file);
      sourceType = "resume";
    } catch (e) {
      return { error: (e as Error).message };
    }
  } else if (notes.length >= 30) {
    source = notes;
    sourceType = "notes";
  } else {
    return { error: "Upload a resume or paste at least a few lines of notes." };
  }

  if (source.length > MAX_CHARS) source = source.slice(0, MAX_CHARS);

  let job = null;
  if (jobId) {
    job = await prisma.job.findFirst({ where: { id: jobId, userId } });
  }

  try {
    await assertUnderCap(userId);
    const result = await screenCandidate({
      source,
      sourceType,
      jdText: job?.rawJD,
      jobTitle: job?.title,
    });
    await incrementUsage(userId);

    // Enforce email uniqueness per user
    if (result.email) {
      const existing = await prisma.candidate.findFirst({
        where: { userId, email: result.email },
      });
      if (existing) {
        // If same candidate is being added to a new job, create the application
        if (job && existing.id) {
          const appExists = await prisma.candidateJobApplication.findUnique({
            where: { candidateId_jobId: { candidateId: existing.id, jobId: job.id } },
          });
          if (!appExists) {
            await prisma.candidateJobApplication.create({
              data: {
                candidateId: existing.id,
                jobId: job.id,
                status: "SCREENING",
                score: job ? Math.round(result.score) : null,
                scoreRationale: job ? result.scoreRationale : null,
              },
            });
            revalidatePath("/candidates");
            revalidatePath(`/candidates/${existing.id}`);
            redirect(`/candidates/${existing.id}`);
          }
        }
        return {
          error: `A candidate with email ${result.email} already exists.`,
          existingId: existing.id,
        };
      }
    }

    const score = job ? Math.round(result.score) : null;
    const scoreRationale = job ? result.scoreRationale : null;

    const candidate = await prisma.candidate.create({
      data: {
        userId,
        jobId: job?.id,
        rawSource: source,
        sourceType,
        name:            toNullableString(result.name),
        email:           toNullableString(result.email),
        phone:           toNullableString(result.phone),
        currentTitle:    toNullableString(result.currentTitle),
        currentCompany:  toNullableString(result.currentCompany),
        yearsExperience: toNullableFloat(result.yearsExperience),
        skills:          serializeSkills(result.skills),
        noticePeriod:    toNullableString(result.noticePeriod),
        currentSalary:   toNullableString(result.currentSalary),
        expectedSalary:  toNullableString(result.expectedSalary),
        location:        toNullableString(result.location),
        score:           toNullableInt(score),
        scoreRationale:  toNullableString(scoreRationale),
        status: "SCREENING",
        source: sourceChannel,
      },
    });

    // Create application record if linked to a job
    if (job) {
      await prisma.candidateJobApplication.create({
        data: {
          candidateId: candidate.id,
          jobId: job.id,
          status: "SCREENING",
          score,
          scoreRationale,
        },
      });
    }

    await trackEvent(userId, "candidate_screened", {
      source_type: sourceType,
      has_job: !!job,
      score,
    });

    revalidatePath("/candidates");
    if (job) revalidatePath(`/jobs/${job.id}`);
    redirect(`/candidates/${candidate.id}`);
  } catch (e) {
    if (e instanceof UsageCapError) return { error: e.message };
    if ((e as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) throw e;
    console.error(e);
    return { error: "Failed to screen candidate." };
  }
}

export async function updateApplicationStatus(
  applicationId: string,
  status: CandidateStatus,
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const userId = session.user.id;

  const app = await prisma.candidateJobApplication.findFirst({
    where: { id: applicationId, candidate: { userId } },
  });
  if (!app) throw new Error("Not found");

  await prisma.candidateJobApplication.update({
    where: { id: applicationId },
    data: { status },
  });

  // Sync Candidate.status to the most recently updated application's status
  await prisma.candidate.update({
    where: { id: app.candidateId },
    data: { status },
  });

  await trackEvent(userId, "pipeline_stage_changed", {
    from_status: app.status,
    to_status: status,
  });

  revalidatePath(`/candidates/${app.candidateId}`);
  revalidatePath("/candidates");
  revalidatePath("/pipeline");
}

export async function rejectWithReason(applicationId: string, reason: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const userId = session.user.id;

  const app = await prisma.candidateJobApplication.findFirst({
    where: { id: applicationId, candidate: { userId } },
  });
  if (!app) throw new Error("Not found");

  await prisma.candidateJobApplication.update({
    where: { id: applicationId },
    data: { status: "REJECTED", rejectReason: reason, rejectedAt: new Date() },
  });
  await prisma.candidate.update({
    where: { id: app.candidateId },
    data: { status: "REJECTED" },
  });

  revalidatePath(`/candidates/${app.candidateId}`);
  revalidatePath("/candidates");
  revalidatePath("/pipeline");
}

export async function addCandidateToJob(candidateId: string, jobId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const userId = session.user.id;

  const [candidate, job] = await Promise.all([
    prisma.candidate.findFirst({ where: { id: candidateId, userId } }),
    prisma.job.findFirst({ where: { id: jobId, userId } }),
  ]);
  if (!candidate || !job) return { error: "Not found." };

  const existing = await prisma.candidateJobApplication.findUnique({
    where: { candidateId_jobId: { candidateId, jobId } },
  });
  if (existing) return { error: "Already applied to this job." };

  await prisma.candidateJobApplication.create({
    data: { candidateId, jobId, status: "NEW" },
  });

  revalidatePath(`/candidates/${candidateId}`);
  return { ok: true as const };
}

// Legacy — kept so existing call sites don't break; routes through application if one exists
export async function updateCandidateStatus(
  candidateId: string,
  status: CandidateStatus,
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  await prisma.candidate.updateMany({
    where: { id: candidateId, userId: session.user.id },
    data: { status },
  });
  revalidatePath("/candidates");
  revalidatePath(`/candidates/${candidateId}`);
  revalidatePath("/pipeline");
}

export async function rescreenApplication(applicationId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const userId = session.user.id;

  const app = await prisma.candidateJobApplication.findFirst({
    where: { id: applicationId, candidate: { userId } },
    include: {
      candidate: { select: { rawSource: true, sourceType: true } },
      job: { select: { rawJD: true, title: true } },
    },
  });
  if (!app) return { error: "Application not found." };
  if (!app.candidate.rawSource) return { error: "No resume/notes stored for this candidate." };

  try {
    await assertUnderCap(userId);
    const result = await screenCandidate({
      source: app.candidate.rawSource,
      sourceType: (app.candidate.sourceType as "resume" | "notes") ?? "notes",
      jdText: app.job.rawJD ?? undefined,
      jobTitle: app.job.title,
    });
    await incrementUsage(userId);

    const score = Math.round(result.score);
    await prisma.candidateJobApplication.update({
      where: { id: applicationId },
      data: { score, scoreRationale: result.scoreRationale },
    });

    await trackEvent(userId, "candidate_rescreened", { score });
    revalidatePath(`/candidates/${app.candidateId}`);
    return { ok: true as const, score, scoreRationale: result.scoreRationale };
  } catch (e) {
    if (e instanceof UsageCapError) return { error: e.message };
    console.error(e);
    return { error: "Failed to analyse match." };
  }
}

export async function saveRawNotes(candidateId: string, notes: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  await prisma.candidate.updateMany({
    where: { id: candidateId, userId: session.user.id },
    data: { recruiterRawNotes: notes || null },
  });
  revalidatePath(`/candidates/${candidateId}`);
  return { ok: true as const };
}

export async function deleteCandidate(candidateId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  await prisma.candidate.deleteMany({
    where: { id: candidateId, userId: session.user.id },
  });
  revalidatePath("/candidates");
  redirect("/candidates");
}
