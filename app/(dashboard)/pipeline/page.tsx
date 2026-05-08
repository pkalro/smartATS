import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { PipelineBoard } from "./pipeline-board";

export default async function PipelinePage() {
  const session = await auth();
  const userId = session!.user.id;

  // Read from CandidateJobApplication — the real source of truth for status.
  // One card per application so a candidate in 2 roles appears in both columns.
  const [applications, jobs] = await Promise.all([
    prisma.candidateJobApplication.findMany({
      where: { candidate: { userId } },
      orderBy: [{ score: "desc" }, { updatedAt: "desc" }],
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            currentTitle: true,
            noticePeriod: true,
            currentSalary: true,
          },
        },
        job: { select: { id: true, title: true } },
      },
    }),
    prisma.job.findMany({
      where: { userId, status: "ACTIVE" },
      select: { id: true, title: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const appData = applications.map((a) => ({
    id: a.id,
    candidateId: a.candidateId,
    candidateName: a.candidate.name,
    currentTitle: a.candidate.currentTitle,
    noticePeriod: a.candidate.noticePeriod,
    currentSalary: a.candidate.currentSalary,
    jobId: a.jobId,
    jobTitle: a.job.title,
    status: a.status,
    score: a.score,
    updatedAt: a.updatedAt,
  }));

  return (
    <PipelineBoard
      applications={appData}
      jobs={jobs}
    />
  );
}
