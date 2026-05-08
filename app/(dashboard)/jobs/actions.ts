"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { analyzeJD, generateLinkedInPost, suggestTargetCompanies } from "@/lib/ai/jd";
import { fileToText } from "@/lib/parse-file";
import { assertUnderCap, incrementUsage, UsageCapError } from "@/lib/usage";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function jsonArr(val: unknown): string {
  return JSON.stringify(Array.isArray(val) ? val : []);
}

export async function createJobFromJD(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const userId = session.user.id;

  let rawJD = String(formData.get("rawJD") ?? "").trim();

  // Parse uploaded JD file if provided
  const jdFile = formData.get("jdFile") as File | null;
  if (jdFile && jdFile.size > 0) {
    try {
      rawJD = await fileToText(jdFile);
    } catch (e) {
      return { error: (e as Error).message };
    }
  }

  if (!rawJD || rawJD.length < 30) {
    return { error: "JD looks too short — paste the whole thing or upload a file." };
  }

  try {
    await assertUnderCap(userId);
    const a = await analyzeJD(rawJD);
    await incrementUsage(userId);

    const minExp = parseFloat(String(formData.get("minExperience") ?? ""));
    const maxExp = parseFloat(String(formData.get("maxExperience") ?? ""));
    const locationPref = String(formData.get("locationPref") ?? "").trim() || null;
    const industry = String(formData.get("industry") ?? "").trim() || null;
    const companyTier = String(formData.get("companyTier") ?? "").trim() || null;
    const notes = String(formData.get("notes") ?? "").trim() || null;

    const job = await prisma.job.create({
      data: {
        userId,
        rawJD,
        title: a.title || "Untitled role",
        personaSummary: a.personaSummary,
        booleanString: a.booleanLinkedIn,
        booleanLinkedIn: a.booleanLinkedIn,
        booleanNaukri: a.booleanNaukri,
        booleanXRay: a.booleanXRay,
        targetCompanies: jsonArr(a.targetCompanies),
        altDesignations: jsonArr(a.altDesignations),
        nichePlatforms: jsonArr(a.nichePlatforms),
        status: "ACTIVE",
        minExperience: isNaN(minExp) ? null : minExp,
        maxExperience: isNaN(maxExp) ? null : maxExp,
        locationPref,
        industry,
        companyTier,
        notes,
      },
    });

    revalidatePath("/jobs");
    redirect(`/jobs/${job.id}`);
  } catch (e) {
    if (e instanceof UsageCapError) return { error: e.message };
    if ((e as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) throw e;
    console.error(e);
    return { error: "Something went wrong analyzing the JD." };
  }
}

export async function deleteJob(jobId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  await prisma.job.deleteMany({ where: { id: jobId, userId: session.user.id } });
  revalidatePath("/jobs");
}

export async function reanalyzeJob(jobId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const userId = session.user.id;
  const job = await prisma.job.findFirst({ where: { id: jobId, userId } });
  if (!job) throw new Error("Not found");

  await assertUnderCap(userId);
  const a = await analyzeJD(job.rawJD);
  await incrementUsage(userId);

  await prisma.job.update({
    where: { id: jobId },
    data: {
      title: a.title,
      personaSummary: a.personaSummary,
      booleanString: a.booleanLinkedIn,
      booleanLinkedIn: a.booleanLinkedIn,
      booleanNaukri: a.booleanNaukri,
      booleanXRay: a.booleanXRay,
      targetCompanies: jsonArr(a.targetCompanies),
      altDesignations: jsonArr(a.altDesignations),
      nichePlatforms: jsonArr(a.nichePlatforms),
    },
  });
  revalidatePath(`/jobs/${jobId}`);
}

export async function updateRawJD(jobId: string, newJD: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (newJD.trim().length < 10) return { error: "JD is too short." };
  await prisma.job.updateMany({
    where: { id: jobId, userId: session.user.id },
    data: { rawJD: newJD.trim() },
  });
  revalidatePath(`/jobs/${jobId}`);
  return { ok: true as const };
}

export async function saveIntakeDetails(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const userId = session.user.id;
  const jobId = String(formData.get("jobId") ?? "").trim();
  if (!jobId) return { error: "Missing job ID." };

  const roundsRaw = String(formData.get("interviewRounds") ?? "[]");
  let rounds: unknown = [];
  try { rounds = JSON.parse(roundsRaw); } catch { rounds = []; }

  const minExp = formData.get("minExperience") ? Number(formData.get("minExperience")) : null;
  const maxExp = formData.get("maxExperience") ? Number(formData.get("maxExperience")) : null;
  const locationPref = String(formData.get("locationPref") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const industry = String(formData.get("industry") ?? "").trim() || null;
  const companyTier = String(formData.get("companyTier") ?? "").trim() || null;

  await prisma.job.updateMany({
    where: { id: jobId, userId },
    data: { interviewRounds: JSON.stringify(rounds), minExperience: minExp, maxExperience: maxExp, locationPref, notes, industry, companyTier },
  });

  revalidatePath(`/jobs/${jobId}`);
  return { ok: true as const };
}

export async function generateLinkedInPostAction(jobId: string, postType: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const userId = session.user.id;

  const job = await prisma.job.findFirst({ where: { id: jobId, userId } });
  if (!job) return { error: "Job not found." };

  try {
    await assertUnderCap(userId);
    const post = await generateLinkedInPost({
      rawJD: job.rawJD,
      title: job.title,
      personaSummary: job.personaSummary,
      postType,
    });
    await incrementUsage(userId);
    await prisma.job.update({ where: { id: jobId }, data: { linkedInJD: post } });
    revalidatePath(`/jobs/${jobId}`);
    return { ok: true as const, post };
  } catch (e) {
    if (e instanceof UsageCapError) return { error: (e as Error).message };
    console.error(e);
    return { error: "Failed to generate post." };
  }
}

export async function regenerateTargetCompaniesAction(
  jobId: string,
  industry?: string,
  companyTier?: string,
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const userId = session.user.id;

  const job = await prisma.job.findFirst({ where: { id: jobId, userId } });
  if (!job) return { error: "Job not found." };

  try {
    await assertUnderCap(userId);
    const companies = await suggestTargetCompanies({
      jobTitle: job.title,
      personaSummary: job.personaSummary,
      rawJD: job.rawJD,
      industry: industry ?? job.industry,
      companyTier: companyTier ?? job.companyTier,
    });
    await incrementUsage(userId);

    const valid = Array.isArray(companies)
      ? companies.filter((c): c is string => typeof c === "string")
      : [];

    await prisma.job.update({
      where: { id: jobId },
      data: { targetCompanies: JSON.stringify(valid) },
    });
    revalidatePath(`/jobs/${jobId}`);
    return { ok: true as const, companies: valid };
  } catch (e) {
    if (e instanceof UsageCapError) return { error: (e as Error).message };
    console.error(e);
    return { error: "Failed to generate company suggestions." };
  }
}

export async function cloneJob(jobId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const userId = session.user.id;

  const job = await prisma.job.findFirst({ where: { id: jobId, userId } });
  if (!job) return { error: "Not found." };

  const clone = await prisma.job.create({
    data: {
      userId,
      title: `${job.title} (copy)`,
      rawJD: job.rawJD,
      status: "DRAFT",
      // analysis outputs
      booleanString:   job.booleanString,
      booleanLinkedIn: job.booleanLinkedIn,
      booleanNaukri:   job.booleanNaukri,
      booleanXRay:     job.booleanXRay,
      personaSummary:  job.personaSummary,
      targetCompanies: job.targetCompanies,
      altDesignations: job.altDesignations,
      nichePlatforms:  job.nichePlatforms,
      linkedInJD:      job.linkedInJD,
      // intake details
      interviewRounds: job.interviewRounds,
      minExperience:   job.minExperience,
      maxExperience:   job.maxExperience,
      locationPref:    job.locationPref,
      notes:           job.notes,
      industry:        job.industry,
      companyTier:     job.companyTier,
    },
  });

  revalidatePath("/jobs");
  redirect(`/jobs/${clone.id}`);
}

export async function toggleJobStatus(jobId: string, currentStatus: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const next = currentStatus === "ACTIVE" ? "CLOSED" : "ACTIVE";
  await prisma.job.updateMany({
    where: { id: jobId, userId: session.user.id },
    data: { status: next },
  });
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
}

export async function addSilverMedalistToJob(candidateId: string, jobId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const userId = session.user.id;

  // Verify both belong to the user
  const [candidate, job] = await Promise.all([
    prisma.candidate.findFirst({ where: { id: candidateId, userId } }),
    prisma.job.findFirst({ where: { id: jobId, userId } }),
  ]);
  if (!candidate || !job) return { error: "Not found." };

  // Upsert application (no-op if already exists)
  await prisma.candidateJobApplication.upsert({
    where: { candidateId_jobId: { candidateId, jobId } },
    create: { candidateId, jobId, status: "NEW" },
    update: {},
  });

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath(`/candidates/${candidateId}`);
  return { ok: true as const };
}

export async function generateMarketIntelligenceAction(jobId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const userId = session.user.id;

  const job = await prisma.job.findFirst({ where: { id: jobId, userId } });
  if (!job) return { error: "Not found." };

  try {
    await assertUnderCap(userId);
    const { generateMarketIntelligence } = await import("@/lib/ai/market");
    const intel = await generateMarketIntelligence({
      rawJD: job.rawJD,
      title: job.title,
      locationPref: job.locationPref,
      minExperience: job.minExperience,
      maxExperience: job.maxExperience,
    });
    await incrementUsage(userId);
    await prisma.job.update({
      where: { id: jobId },
      data: { marketIntelligence: JSON.stringify(intel) },
    });
    revalidatePath(`/jobs/${jobId}`);
    return { ok: true as const, intel };
  } catch (e) {
    if (e instanceof UsageCapError) return { error: (e as Error).message };
    console.error(e);
    return { error: "Failed to generate market intelligence." };
  }
}
