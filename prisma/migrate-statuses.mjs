// One-time migration: rename old CandidateStatus values to new enum
// Old: SCREENED → SCREENING, SCHEDULED → INTERVIEWING, APPROVED → SHORTLISTED
// Run: node prisma/migrate-statuses.mjs
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const [screened, scheduled, approved] = await Promise.all([
    prisma.candidate.updateMany({ where: { status: "SCREENED" }, data: { status: "SCREENING" } }),
    prisma.candidate.updateMany({ where: { status: "SCHEDULED" }, data: { status: "INTERVIEWING" } }),
    prisma.candidate.updateMany({ where: { status: "APPROVED" }, data: { status: "SHORTLISTED" } }),
  ]);
  console.log(`Candidates: SCREENED→SCREENING (${screened.count}), SCHEDULED→INTERVIEWING (${scheduled.count}), APPROVED→SHORTLISTED (${approved.count})`);

  const [appScreened, appScheduled] = await Promise.all([
    prisma.candidateJobApplication.updateMany({ where: { status: "SCREENED" }, data: { status: "SCREENING" } }),
    prisma.candidateJobApplication.updateMany({ where: { status: "SCHEDULED" }, data: { status: "INTERVIEWING" } }),
  ]);
  console.log(`Applications: SCREENED→SCREENING (${appScreened.count}), SCHEDULED→INTERVIEWING (${appScheduled.count})`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
