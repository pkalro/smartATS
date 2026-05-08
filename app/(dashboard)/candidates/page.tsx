import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Upload, Users } from "lucide-react";
import { CandidatesFilter } from "./candidates-filter";

export default async function CandidatesPage() {
  const session = await auth();
  const candidates = await prisma.candidate.findMany({
    where: { userId: session!.user.id },
    orderBy: [{ createdAt: "desc" }],
    include: {
      applications: {
        include: { job: { select: { id: true, title: true } } },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-md shadow-violet-200">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Candidates</h1>
            <p className="text-sm text-slate-500">{candidates.length} candidate{candidates.length !== 1 ? "s" : ""} across your roles.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline" className="rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50">
            <Link href="/candidates/bulk"><Upload className="h-3.5 w-3.5" />Bulk upload</Link>
          </Button>
          <Button asChild size="sm" className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 border-0 text-white shadow-sm">
            <Link href="/candidates/new"><Plus className="h-3.5 w-3.5" />Screen candidate</Link>
          </Button>
        </div>
      </div>

      {candidates.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md">
            <Users className="h-7 w-7 text-white" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">No candidates yet</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-xs mx-auto">Upload a resume or paste call notes to get a structured profile and match score in seconds.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 border-0 text-white hover:from-blue-700 hover:to-violet-700">
              <Link href="/candidates/new"><Plus className="h-4 w-4" />Screen candidate</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-lg border-slate-200">
              <Link href="/candidates/bulk"><Upload className="h-4 w-4" />Bulk upload</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <CandidatesFilter
            candidates={candidates.map((c) => {
              const topApp = c.applications[0] ?? null;
              return {
                id: c.id,
                name: c.name,
                email: c.email,
                currentTitle: c.currentTitle,
                status: topApp?.status ?? c.status,
                score: topApp?.score ?? c.score,
                skills: c.skills,
                noticePeriod: c.noticePeriod,
                currentSalary: c.currentSalary,
                source: c.source,
                updatedAt: topApp?.updatedAt ?? c.updatedAt,
                primaryApplicationId: c.applications[0]?.id ?? null,
                applications: c.applications.map((a) => ({
                  id: a.id,
                  jobTitle: a.job.title,
                  jobId: a.job.id,
                  status: a.status,
                })),
              };
            })}
          />
        </div>
      )}
    </div>
  );
}
