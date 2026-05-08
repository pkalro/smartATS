import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { ReportsClient } from "./reports-client";
import type { FunnelStage, JobBreakdown, SourceBreakdown } from "./reports-client";
import type { ExportRow } from "./export-csv";

const ACTIVE_STATUSES = ["NEW", "SCREENING", "SHORTLISTED", "INTERVIEWING", "OFFER"] as const;
const FUNNEL_ORDER = ["NEW", "SCREENING", "SHORTLISTED", "INTERVIEWING", "OFFER", "HIRED"] as const;

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id as string;

  // Fetch all jobs with their applications
  const jobs = await prisma.job.findMany({
    where: { userId },
    select: {
      id: true,
      title: true,
      status: true,
      candidateApplications: {
        select: {
          id: true,
          status: true,
          score: true,
          candidateId: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch all candidates for this user with their applications
  const candidates = await prisma.candidate.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      currentTitle: true,
      currentCompany: true,
      yearsExperience: true,
      noticePeriod: true,
      currentSalary: true,
      expectedSalary: true,
      location: true,
      source: true,
      createdAt: true,
      applications: {
        select: {
          id: true,
          status: true,
          score: true,
          jobId: true,
          job: { select: { title: true } },
          createdAt: true,
        },
      },
    },
  });

  // --- Computed metrics ---

  const totalCandidates = candidates.length;

  const activeInPipeline = candidates.filter((c) =>
    c.applications.some((a) => (ACTIVE_STATUSES as readonly string[]).includes(a.status))
  ).length;

  const hired = candidates.filter((c) =>
    c.applications.some((a) => a.status === "HIRED")
  ).length;

  const allScores = candidates
    .flatMap((c) => c.applications.map((a) => a.score))
    .filter((s): s is number => s != null);

  const avgScore =
    allScores.length > 0
      ? Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10
      : 0;

  // Funnel: unique candidates per stage
  const funnelStages: FunnelStage[] = FUNNEL_ORDER.map((status) => ({
    status,
    count: candidates.filter((c) => c.applications.some((a) => a.status === status)).length,
  }));

  // Job breakdown: count applications by status per job
  const jobBreakdown: JobBreakdown[] = jobs.map((job) => {
    const counts: Record<string, number> = {};
    for (const app of job.candidateApplications) {
      counts[app.status] = (counts[app.status] ?? 0) + 1;
    }
    return {
      jobId: job.id,
      title: job.title,
      status: job.status,
      counts,
    };
  });

  // Source breakdown: count candidates by source
  const sourceMap = new Map<string, number>();
  for (const c of candidates) {
    const src = c.source ?? "Unknown";
    sourceMap.set(src, (sourceMap.get(src) ?? 0) + 1);
  }
  const sourceBreakdown: SourceBreakdown[] = Array.from(sourceMap.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  // Export rows — one row per application
  const exportRows: ExportRow[] = candidates.flatMap((c) =>
    c.applications.map((app) => ({
      candidateName: c.name ?? "",
      email: c.email ?? "",
      phone: c.phone ?? "",
      jobTitle: app.job?.title ?? "",
      source: c.source ?? "Unknown",
      applicationStatus: app.status,
      score: app.score,
      currentTitle: c.currentTitle ?? "",
      currentCompany: c.currentCompany ?? "",
      location: c.location ?? "",
      yearsExperience: c.yearsExperience,
      noticePeriod: c.noticePeriod ?? "",
      currentSalary: c.currentSalary ?? "",
      expectedSalary: c.expectedSalary ?? "",
      createdAt: app.createdAt.toISOString(),
    }))
  );

  const jobList = jobs.map((j) => ({ id: j.id, title: j.title }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Pipeline analytics and exports</p>
      </div>

      <ReportsClient
        totalCandidates={totalCandidates}
        activeInPipeline={activeInPipeline}
        hired={hired}
        avgScore={avgScore}
        funnelStages={funnelStages}
        jobBreakdown={jobBreakdown}
        sourceBreakdown={sourceBreakdown}
        exportRows={exportRows}
        jobs={jobList}
      />
    </div>
  );
}
