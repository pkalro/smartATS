import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons/icon";
import { JobsList } from "./jobs-list";

export default async function JobsPage() {
  const session = await auth();
  const jobs = await prisma.job.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { candidates: true } } },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-md shadow-blue-200">
            <Icon name="briefcase" size={5} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Jobs</h1>
            <p className="text-sm text-slate-500">Paste a JD to generate search strings and a candidate persona.</p>
          </div>
        </div>
        <Button asChild className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 border-0 text-white shadow-sm">
          <Link href="/jobs/new"><Icon name="plus" size={4} />New role</Link>
        </Button>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md">
            <Icon name="briefcase" size={7} className="text-white" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">No jobs yet</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-xs mx-auto">Create your first role and let AI generate a boolean search string and candidate persona.</p>
          <Button asChild className="mt-6 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 border-0 text-white hover:from-blue-700 hover:to-violet-700">
            <Link href="/jobs/new"><Icon name="plus" size={4} />Create your first job</Link>
          </Button>
        </div>
      ) : (
        <JobsList jobs={jobs.map((j) => ({
          id: j.id,
          title: j.title,
          status: j.status,
          candidateCount: j._count.candidates,
          createdAt: j.createdAt,
          industry: j.industry,
        }))} />
      )}
    </div>
  );
}
