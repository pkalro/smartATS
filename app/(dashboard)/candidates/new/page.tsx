import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CandidateForm } from "./candidate-form";
import Link from "next/link";

export default async function NewCandidatePage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string }>;
}) {
  const session = await auth();
  const { jobId } = await searchParams;
  const jobs = await prisma.job.findMany({
    where: { userId: session!.user.id, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Screen a candidate</h1>
          <p className="text-muted-foreground">
            Upload a resume (PDF/DOCX/TXT) or paste call notes — we'll extract a
            clean row and score it against the JD.
          </p>
        </div>
        <Link
          href="/candidates/bulk"
          className="shrink-0 flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-700 hover:bg-violet-100 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Bulk upload
          <span className="rounded-full bg-violet-200 px-1.5 py-0.5 text-[10px] font-bold text-violet-800">up to 25</span>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Source</CardTitle>
          <CardDescription>Resume file or notes — pick one.</CardDescription>
        </CardHeader>
        <CardContent>
          <CandidateForm jobs={jobs} defaultJobId={jobId ?? null} />
        </CardContent>
      </Card>
    </div>
  );
}
