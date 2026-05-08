import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { fileToText } from "@/lib/parse-file";
import { screenCandidate } from "@/lib/ai/resume";
import { serializeSkills } from "@/lib/skills";
import { assertUnderCap, incrementUsage, UsageCapError } from "@/lib/usage";
import { toNullableFloat, toNullableInt, toNullableString } from "@/lib/sanitize-candidate";

const MAX_CHARS = 30_000;

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ bulkJobId: string }> },
) {
  // Auth gate — prevent unauthorized access
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bulkJobId } = await params;

  const bulkJob = await prisma.bulkUploadJob.findUnique({
    where: { id: bulkJobId },
    include: { items: { where: { status: "PENDING" }, orderBy: { createdAt: "asc" } } },
  });
  if (!bulkJob) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Verify ownership
  if (bulkJob.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Idempotency: if already running/done, skip
  if (bulkJob.status !== "PENDING") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  await prisma.bulkUploadJob.update({ where: { id: bulkJobId }, data: { status: "RUNNING" } });

  let job = null;
  if (bulkJob.jobId) {
    job = await prisma.job.findUnique({ where: { id: bulkJob.jobId } });
  }

  for (const item of bulkJob.items) {
    await prisma.bulkUploadItem.update({
      where: { id: item.id },
      data: { status: "PROCESSING", errorMsg: null },
    });

    try {
      // Decode stored file content (stored as base64 JSON in errorMsg during intake)
      const stored = JSON.parse(item.errorMsg ?? "{}") as { base64?: string; mimetype?: string };
      if (!stored.base64) throw new Error("No file data stored for this item");

      const buffer = Buffer.from(stored.base64, "base64");
      const file = new File([buffer], item.filename, {
        type: stored.mimetype ?? "application/octet-stream",
      });

      let source = "";
      try {
        source = await fileToText(file);
      } catch (e) {
        throw new Error(`Could not parse file: ${(e as Error).message}`);
      }
      if (!source.trim()) throw new Error("No text could be extracted from this file");
      if (source.length > MAX_CHARS) source = source.slice(0, MAX_CHARS);

      await assertUnderCap(bulkJob.userId);
      const result = await screenCandidate({
        source,
        sourceType: "resume",
        jdText: job?.rawJD,
        jobTitle: job?.title,
      });
      await incrementUsage(bulkJob.userId);

      const score = job ? Math.round(result.score) : null;
      const scoreRationale = job ? result.scoreRationale : null;

      // Deduplicate by email
      let candidate = null;
      if (result.email) {
        candidate = await prisma.candidate.findFirst({
          where: { userId: bulkJob.userId, email: result.email },
        });
      }

      if (!candidate) {
        candidate = await prisma.candidate.create({
          data: {
            userId:          bulkJob.userId,
            jobId:           job?.id,
            rawSource:       source,
            sourceType:      "resume",
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
            status:          "SCREENING",
            source:          "INBOUND",
          },
        });
      }

      if (job) {
        const appExists = await prisma.candidateJobApplication.findUnique({
          where: { candidateId_jobId: { candidateId: candidate.id, jobId: job.id } },
        });
        if (!appExists) {
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
        // Mark remaining PENDING items as SKIPPED_QUOTA too
        await prisma.bulkUploadItem.updateMany({
          where: { bulkJobId, status: "PENDING" },
          data: { status: "SKIPPED_QUOTA", errorMsg: "Monthly AI quota exceeded" },
        });
        break;
      }
    } finally {
      // Always advance the progress counter, regardless of success/failure
      await prisma.bulkUploadJob.update({
        where: { id: bulkJobId },
        data: { doneCount: { increment: 1 } },
      });
    }
  }

  await prisma.bulkUploadJob.update({ where: { id: bulkJobId }, data: { status: "DONE" } });
  return NextResponse.json({ ok: true });
}
