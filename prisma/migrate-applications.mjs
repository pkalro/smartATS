// One-time migration: create CandidateJobApplication rows from existing Candidate.jobId
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const candidates = await prisma.candidate.findMany({
    where: { jobId: { not: null } },
  });
  console.log(`Found ${candidates.length} candidates with a jobId`);
  let created = 0;
  for (const c of candidates) {
    if (!c.jobId) continue;
    await prisma.candidateJobApplication.upsert({
      where: { candidateId_jobId: { candidateId: c.id, jobId: c.jobId } },
      update: {},
      create: {
        candidateId: c.id,
        jobId: c.jobId,
        status: c.status,
        score: c.score,
        scoreRationale: c.scoreRationale,
        currentRound: c.currentRound,
      },
    });
    created++;
  }
  console.log(`Created/upserted ${created} application rows`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
