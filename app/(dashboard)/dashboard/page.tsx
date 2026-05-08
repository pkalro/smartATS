import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getUsage } from "@/lib/usage";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FileText, Users, Sparkles, AlertCircle,
  Clock, UserCheck, Plus, Upload, LayoutDashboard,
  TrendingUp, ArrowRight,
} from "lucide-react";

export default async function OverviewPage() {
  const session = await auth();
  const userId = session!.user.id;
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  const [jobCount, candidateCount, shortlistedCount, usage, toReview, interviewing, shortlisted, offerStage, stalePipeline] =
    await Promise.all([
      // Stats
      prisma.job.count({ where: { userId, status: "ACTIVE" } }),
      prisma.candidate.count({ where: { userId } }),
      prisma.candidateJobApplication.count({ where: { status: "SHORTLISTED", candidate: { userId } } }),
      getUsage(userId),

      // Queue 1: NEW + SCREENING — needs recruiter decision right now
      prisma.candidateJobApplication.findMany({
        where: { status: { in: ["NEW", "SCREENING"] }, candidate: { userId } },
        orderBy: { updatedAt: "desc" }, take: 8,
        include: {
          candidate: { select: { id: true, name: true, currentTitle: true } },
          job: { select: { id: true, title: true } },
        },
      }),

      // Queue 2: INTERVIEWING — active rounds in progress
      prisma.candidateJobApplication.findMany({
        where: { status: "INTERVIEWING", candidate: { userId } },
        orderBy: { updatedAt: "desc" }, take: 8,
        include: {
          candidate: { select: { id: true, name: true, currentTitle: true } },
          job: { select: { id: true, title: true } },
        },
      }),

      // Queue 3: SHORTLISTED — awaiting HM decision or next step
      prisma.candidateJobApplication.findMany({
        where: { status: "SHORTLISTED", candidate: { userId } },
        orderBy: { updatedAt: "asc" }, take: 8,
        include: {
          candidate: { select: { id: true, name: true } },
          job: { select: { title: true } },
        },
      }),

      // Queue 4: OFFER — needs closing action
      prisma.candidateJobApplication.findMany({
        where: { status: "OFFER", candidate: { userId } },
        orderBy: { updatedAt: "asc" }, take: 8,
        include: {
          candidate: { select: { id: true, name: true } },
          job: { select: { title: true } },
        },
      }),

      // Queue 5: Stale — anything active not touched in 3+ days
      prisma.candidateJobApplication.findMany({
        where: {
          status: { in: ["SCREENING", "SHORTLISTED", "INTERVIEWING"] },
          candidate: { userId },
          updatedAt: { lt: threeDaysAgo },
        },
        orderBy: { updatedAt: "asc" }, take: 8,
        include: {
          candidate: { select: { id: true, name: true } },
          job: { select: { title: true } },
        },
      }),
    ]);

  const usagePct = Math.min(100, Math.round((usage.count / usage.cap) * 100));
  const hasActions = toReview.length > 0 || interviewing.length > 0 || shortlisted.length > 0 || offerStage.length > 0 || stalePipeline.length > 0;
  const firstName = session?.user.name?.split(" ")[0] ?? "";

  return (
    <div className="space-y-8">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 shadow-md shadow-blue-200">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {firstName ? `Good to see you, ${firstName}.` : "Dashboard"}
            </h1>
            <p className="text-sm text-slate-500">Here&apos;s what needs your attention today.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline" className="rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50">
            <Link href="/candidates/bulk"><Upload className="h-3.5 w-3.5" />Bulk upload</Link>
          </Button>
          <Button asChild size="sm" className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 border-0 text-white shadow-sm">
            <Link href="/candidates/new"><Plus className="h-3.5 w-3.5" />Add candidate</Link>
          </Button>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active jobs" value={jobCount} icon={<FileText className="h-5 w-5" />} gradient="from-blue-500 to-cyan-500" href="/jobs" />
        <StatCard label="Candidates" value={candidateCount} icon={<Users className="h-5 w-5" />} gradient="from-violet-500 to-purple-500" href="/candidates" />
        <StatCard label="Shortlisted" value={shortlistedCount} icon={<UserCheck className="h-5 w-5" />} gradient="from-amber-500 to-orange-500" href="/pipeline" />
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-sm">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-xs font-medium text-slate-400">AI quota</span>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{usage.count}<span className="text-sm font-normal text-slate-400">/{usage.cap}</span></div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
            <div
              className={`h-1.5 rounded-full transition-all ${usagePct >= 90 ? "bg-red-500" : usagePct >= 70 ? "bg-amber-500" : "bg-gradient-to-r from-emerald-400 to-teal-500"}`}
              style={{ width: `${usagePct}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-400">{usage.remaining} calls remaining this month</p>
        </div>
      </div>

      {/* ── Action queues ── */}
      {!hasActions ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md">
            <UserCheck className="h-7 w-7 text-white" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">All caught up!</h3>
          <p className="mt-1 text-sm text-slate-500">No pending actions right now. Great work.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild size="sm" className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 border-0 text-white hover:from-blue-700 hover:to-violet-700">
              <Link href="/candidates/new"><Plus className="h-3.5 w-3.5" />Add candidate</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-lg border-slate-200">
              <Link href="/pipeline">View pipeline</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Needs review — NEW or SCREENING, most recent first */}
          {toReview.length > 0 && (
            <QueueCard title="Needs review" icon={<FileText className="h-4 w-4" />} count={toReview.length} accent="blue"
              footer={toReview.length >= 8 ? { label: "View all screening", href: "/candidates?status=SCREENING" } : undefined}>
              {toReview.map((a) => (
                <QueueRow key={a.id} href={`/candidates/${a.candidate.id}`}
                  name={a.candidate.name ?? "Unnamed"}
                  sub={`${a.job.title}`}
                  badge={a.status === "NEW" ? "New" : "Screening"} />
              ))}
            </QueueCard>
          )}
          {/* In interview */}
          {interviewing.length > 0 && (
            <QueueCard title="In interview rounds" icon={<UserCheck className="h-4 w-4" />} count={interviewing.length} accent="violet">
              {interviewing.map((a) => (
                <QueueRow key={a.id} href={`/candidates/${a.candidate.id}`}
                  name={a.candidate.name ?? "Unnamed"}
                  sub={a.job.title}
                  badge={a.currentStage ?? "Interviewing"} />
              ))}
            </QueueCard>
          )}
          {/* Shortlisted — awaiting HM or next step */}
          {shortlisted.length > 0 && (
            <QueueCard title="Shortlisted — needs next step" icon={<AlertCircle className="h-4 w-4" />} count={shortlisted.length} accent="amber">
              {shortlisted.map((a) => (
                <QueueRow key={a.id} href={`/candidates/${a.candidate.id}`}
                  name={a.candidate.name ?? "Unnamed"}
                  sub={`${a.job.title} · ${daysSince(a.updatedAt)}d ago`} />
              ))}
            </QueueCard>
          )}
          {/* Offer stage — needs closing */}
          {offerStage.length > 0 && (
            <QueueCard title="Offer out — close now" icon={<Sparkles className="h-4 w-4" />} count={offerStage.length} accent="emerald">
              {offerStage.map((a) => (
                <QueueRow key={a.id} href={`/candidates/${a.candidate.id}`}
                  name={a.candidate.name ?? "Unnamed"}
                  sub={`${a.job.title} · ${daysSince(a.updatedAt)}d waiting`} />
              ))}
            </QueueCard>
          )}
          {/* Stale pipeline — only show if the above queues don't already cover them */}
          {stalePipeline.length > 0 && (
            <QueueCard title="No update in 3+ days" icon={<Clock className="h-4 w-4" />} count={stalePipeline.length} accent="slate">
              {stalePipeline.map((a) => (
                <QueueRow key={a.id} href={`/candidates/${a.candidate.id}`}
                  name={a.candidate.name ?? "Unnamed"}
                  sub={`${a.job.title} · ${daysSince(a.updatedAt)}d stale`} />
              ))}
            </QueueCard>
          )}
        </div>
      )}

      {/* ── Quick actions ── */}
      <div>
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Quick actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <ActionCard icon={<Users className="h-5 w-5" />} gradient="from-blue-500 to-cyan-500" title="Screen a candidate" body="Upload a resume or paste call notes." href="/candidates/new" cta="Add candidate" />
          <ActionCard icon={<Upload className="h-5 w-5" />} gradient="from-violet-500 to-purple-500" title="Bulk upload resumes" body="Drop a folder of CVs — AI screens them all." href="/candidates/bulk" cta="Bulk upload" />
          <ActionCard icon={<TrendingUp className="h-5 w-5" />} gradient="from-amber-500 to-orange-500" title="Open pipeline" body="Move candidates through interview stages." href="/pipeline" cta="View pipeline" />
        </div>
      </div>
    </div>
  );
}

function daysSince(date: Date) {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

function StatCard({ label, value, icon, gradient, href }: { label: string; value: number; icon: React.ReactNode; gradient: string; href: string }) {
  return (
    <Link href={href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-sm text-white`}>{icon}</div>
        <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
      </div>
      <div className="text-2xl font-extrabold text-slate-900">{value}</div>
      <div className="text-sm text-slate-500 mt-0.5">{label}</div>
    </Link>
  );
}

function QueueCard({ title, icon, count, accent, children, footer }: {
  title: string; icon: React.ReactNode; count: number;
  accent: "violet" | "amber" | "blue" | "emerald" | "slate";
  children: React.ReactNode;
  footer?: { label: string; href: string };
}) {
  const accentMap = {
    violet:  { border: "border-violet-200",  iconBg: "from-violet-500 to-purple-500",  badge: "bg-violet-100 text-violet-700" },
    amber:   { border: "border-amber-200",   iconBg: "from-amber-500 to-orange-500",   badge: "bg-amber-100 text-amber-700" },
    blue:    { border: "border-blue-200",    iconBg: "from-blue-500 to-cyan-500",      badge: "bg-blue-100 text-blue-700" },
    emerald: { border: "border-emerald-200", iconBg: "from-emerald-500 to-teal-500",   badge: "bg-emerald-100 text-emerald-700" },
    slate:   { border: "border-slate-200",   iconBg: "from-slate-500 to-slate-600",    badge: "bg-slate-100 text-slate-600" },
  }[accent];
  return (
    <div className={`rounded-2xl border ${accentMap.border} bg-white shadow-sm overflow-hidden flex flex-col`}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${accentMap.iconBg} text-white`}>{icon}</div>
          <span className="font-semibold text-slate-800 text-sm">{title}</span>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${accentMap.badge}`}>{count}</span>
      </div>
      <div className="p-2 space-y-0.5 flex-1">{children}</div>
      {footer && (
        <div className="border-t border-slate-100 px-4 py-2.5">
          <Link href={footer.href} className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
            {footer.label} →
          </Link>
        </div>
      )}
    </div>
  );
}

function QueueRow({ href, name, sub, badge }: { href: string; name: string; sub?: string; badge?: string }) {
  return (
    <Link href={href} className="flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-slate-50 transition-colors">
      <div className="min-w-0">
        <div className="truncate font-medium text-slate-800">{name}</div>
        {sub && <div className="truncate text-xs text-slate-400 mt-0.5">{sub}</div>}
      </div>
      {badge && <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{badge}</span>}
    </Link>
  );
}

function ActionCard({ icon, gradient, title, body, href, cta }: { icon: React.ReactNode; gradient: string; title: string; body: string; href: string; cta: string }) {
  return (
    <Link href={href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col gap-4">
      <div className={`self-start flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm`}>{icon}</div>
      <div className="flex-1">
        <h3 className="font-bold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-500 leading-relaxed">{body}</p>
      </div>
      <div className="flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:gap-2 transition-all">
        {cta} <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </Link>
  );
}
