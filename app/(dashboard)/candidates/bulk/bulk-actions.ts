"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { fileToText } from "@/lib/parse-file";
import { screenCandidate } from "@/lib/ai/resume";
import { serializeSkills } from "@/lib/skills";
import { assertUnderCap, incrementUsage, UsageCapError } from "@/lib/usage";
import { toNullableFloat, toNullableInt, toNullableString } from "@/lib/sanitize-candidate";
import { trackEvent } from "@/lib/posthog";

const MAX_FILES = 25;
const MAX_CHARS = 30_000;

export async function startBulkUpload(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const userId = session.user.id;

  const jobId = (formData.get("jobId") as string) || null;
  const files = formData.getAll("files") as File[];

  if (files.length === 0) return { error: "No files provided." };
  if (files.length > MAX_FILES)
    return { error: `Maximum ${MAX_FILES} files per upload.` };

  // Validate job belongs to user
  if (jobId) {
    const job = await prisma.job.findFirst({ where: { id: jobId, userId } });
    if (!job) return { error: "Job not found." };
  }

  // Create the bulk job record
  const bulkJob = await prisma.bulkUploadJob.create({
    data: { userId, totalCount: files.length, jobId },
  });

  // Store each file's content as base64 in the errorMsg field temporarily
  for (const file of files) {
    const bytes = Buffer.from(await file.arrayBuffer()).toString("base64");
    await prisma.bulkUploadItem.create({
      data: {
        bulkJobId: bulkJob.id,
        filename: file.name,
        status: "PENDING",
        errorMsg: JSON.stringify({ base64: bytes, mimetype: file.type }),
      },
    });
  }

  await trackEvent(userId, "bulk_upload_started", {
    file_count: files.length,
    has_job: !!jobId,
  });
  revalidatePath("/candidates/bulk");
  return { jobId: bulkJob.id };
}

export async function triggerBulkAnalysis(bulkJobId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const userId = session.user.id;

  // Fetch job + all pending items in one go
  const bulkJob = await prisma.bulkUploadJob.findFirst({
    where: { id: bulkJobId, userId },
    include: {
      items: { where: { status: "PENDING" }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!bulkJob) throw new Error("Bulk job not found");

  // Idempotency guard — don't re-process if already running/done
  if (bulkJob.status !== "PENDING") return;

  // Mark the job as running
  await prisma.bulkUploadJob.update({
    where: { id: bulkJobId },
    data: { status: "RUNNING" },
  });

  // Resolve the linked job (for scoring)
  let linkedJob = null;
  if (bulkJob.jobId) {
    linkedJob = await prisma.job.findUnique({ where: { id: bulkJob.jobId } });
  }

  // Process each item sequentially — DB is updated after every file so
  // the polling in the browser shows live progress
  for (const item of bulkJob.items) {
    // Read the base64 file data we stored during upload
    let fileData: { base64?: string; mimetype?: string } = {};
    try {
      fileData = JSON.parse(item.errorMsg ?? "{}");
    } catch {
      // corrupt row — mark failed
    }

    if (!fileData.base64) {
      await prisma.bulkUploadItem.update({
        where: { id: item.id },
        data: { status: "FAILED", errorMsg: "File data missing — please re-upload" },
      });
      await prisma.bulkUploadJob.update({
        where: { id: bulkJobId },
        data: { doneCount: { increment: 1 } },
      });
      continue;
    }

    // Mark as actively processing (visible in the UI)
    await prisma.bulkUploadItem.update({
      where: { id: item.id },
      data: { status: "PROCESSING", errorMsg: null },
    });

    try {
      // Reconstruct the File object from stored bytes
      const buffer = Buffer.from(fileData.base64, "base64");
      const file = new File([buffer], item.filename, {
        type: fileData.mimetype ?? "application/octet-stream",
      });

      let source = "";
      try {
        source = await fileToText(file);
      } catch (e) {
        throw new Error(`Could not parse file: ${(e as Error).message}`);
      }
      if (!source.trim()) throw new Error("No text could be extracted from this file");
      if (source.length > MAX_CHARS) source = source.slice(0, MAX_CHARS);

      await assertUnderCap(userId);
      const result = await screenCandidate({
        source,
        sourceType: "resume",
        jdText: linkedJob?.rawJD,
        jobTitle: linkedJob?.title,
      });
      await incrementUsage(userId);

      const score = linkedJob ? Math.round(result.score) : null;
      const scoreRationale = linkedJob ? result.scoreRationale : null;

      // Deduplicate by email within this user's candidates
      let candidate = null;
      if (result.email) {
        candidate = await prisma.candidate.findFirst({
          where: { userId, email: result.email },
        });
      }

      if (!candidate) {
        candidate = await prisma.candidate.create({
          data: {
            userId,
            jobId: linkedJob?.id,
            rawSource: source,
            sourceType: "resume",
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
            source: "INBOUND",
          },
        });
      }

      // Create job application if linked to a job
      if (linkedJob) {
        const appExists = await prisma.candidateJobApplication.findUnique({
          where: { candidateId_jobId: { candidateId: candidate.id, jobId: linkedJob.id } },
        });
        if (!appExists) {
          await prisma.candidateJobApplication.create({
            data: {
              candidateId: candidate.id,
              jobId: linkedJob.id,
              status: "SCREENING",
              score,
              scoreRationale,
            },
          });
        }
      }

      await prisma.bulkUploadItem.update({
        where: { id: item.id },
        data: { status: "DONE", candidateId: candidate.id, errorMsg: null },
      });
    } catch (e) {
      const isQuota = e instanceof UsageCapError;
      await prisma.bulkUploadItem.update({
        where: { id: item.id },
        data: {
          status: isQuota ? "SKIPPED_QUOTA" : "FAILED",
          errorMsg: (e as Error).message,
        },
      });
      if (isQuota) {
        // Skip all remaining items
        await prisma.bulkUploadItem.updateMany({
          where: { bulkJobId, status: "PENDING" },
          data: { status: "SKIPPED_QUOTA", errorMsg: "Monthly AI quota exceeded" },
        });
        // Count remaining as done for progress
        await prisma.bulkUploadJob.update({
          where: { id: bulkJobId },
          data: { doneCount: { increment: 1 } },
        });
        break;
      }
    }

    // Advance progress counter after every file
    await prisma.bulkUploadJob.update({
      where: { id: bulkJobId },
      data: { doneCount: { increment: 1 } },
    });
  }

  // Mark the overall job done
  await prisma.bulkUploadJob.update({
    where: { id: bulkJobId },
    data: { status: "DONE" },
  });

  const doneItems = await prisma.bulkUploadItem.count({ where: { bulkJobId, status: "DONE" } });
  const failedItems = await prisma.bulkUploadItem.count({ where: { bulkJobId, status: { in: ["FAILED", "SKIPPED_QUOTA"] } } });
  await trackEvent(userId, "bulk_upload_completed", {
    total: bulkJob.totalCount,
    done: doneItems,
    failed: failedItems,
    has_job: !!bulkJob.jobId,
  });

  revalidatePath("/candidates");
}

export async function getBulkJob(bulkJobId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return prisma.bulkUploadJob.findFirst({
    where: { id: bulkJobId, userId: session.user.id },
    include: {
      items: { orderBy: { createdAt: "asc" } },
    },
  });
}
