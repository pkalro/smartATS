"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Kanban } from "lucide-react";
import { STATUS_STYLES } from "@/lib/status-styles";

type AppCard = {
  id: string;
  candidateId: string;
  candidateName: string | null;
  currentTitle: string | null;
  noticePeriod: string | null;
  currentSalary: string | null;
  jobId: string;
  jobTitle: string;
  status: string;
  score: number | null;
  updatedAt: Date;
};

type Job = { id: string; title: string };

const ACTIVE_STAGES = [
  { status: "NEW",          label: "New",          col: "from-slate-400 to-slate-500" },
  { status: "SCREENING",    label: "Screening",    col: "from-blue-500 to-cyan-500" },
  { status: "SHORTLISTED",  label: "Shortlisted",  col: "from-violet-500 to-purple-500" },
  { status: "INTERVIEWING", label: "Interviewing", col: "from-amber-500 to-orange-500" },
  { status: "OFFER",        label: "Offer",        col: "from-orange-500 to-rose-500" },
  { status: "HIRED",        label: "Hired",        col: "from-emerald-500 to-teal-500" },
];

const CLOSED_STAGES = [
  { status: "REJECTED",  label: "Rejected" },
  { status: "WITHDRAWN", label: "Withdrawn" },
];

function daysSince(date: Date) {
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
}

function ScoreChip({ score }: { score: number | null }) {
  if (score == null) return null;
  const cls = score >= 75 ? "bg-emerald-100 text-emerald-700"
            : score >= 50 ? "bg-amber-100 text-amber-700"
            : "bg-red-100 text-red-600";
  return <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${cls}`}>{score}</span>;
}

function CandidateCard({ app }: { app: AppCard }) {
  const days = daysSince(app.updatedAt);
  const isStale = days >= 3 && !["HIRED", "REJECTED", "WITHDRAWN"].includes(app.status);

  return (
    <Link href={`/candidates/${app.candidateId}`}
      className="group block rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-1.5 mb-1.5">
        <span className="font-semibold text-slate-800 leading-tight truncate text-[13px] group-hover:text-blue-700 transition-colors">
          {app.candidateName || "Unnamed"}
        </span>
        <ScoreChip score={app.score} />
      </div>

      {app.currentTitle && (
        <p className="text-[11px] text-slate-500 truncate mb-1">{app.currentTitle}</p>
      )}
      <p className="text-[10px] text-slate-400 truncate mb-2">{app.jobTitle}</p>

      <div className="flex items-center justify-between gap-1 text-[10px]">
        <div className="flex items-center gap-2">
          {app.noticePeriod && <span className="text-slate-500 font-medium">{app.noticePeriod}</span>}
          {app.currentSalary && <span className="text-slate-400">{app.currentSalary}</span>}
        </div>
        <span className={isStale ? "text-amber-500 font-semibold" : "text-slate-300"}>
          {days === 0 ? "today" : `${days}d`}
        </span>
      </div>
    </Link>
  );
}

export function PipelineBoard({ applications, jobs }: { applications: AppCard[]; jobs: Job[] }) {
  const [jobFilter, setJobFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => applications.filter((a) => {
    if (jobFilter !== "all" && a.jobId !== jobFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!a.candidateName?.toLowerCase().includes(q) &&
          !a.currentTitle?.toLowerCase().includes(q) &&
          !a.jobTitle.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [applications, jobFilter, search]);

  const byStatus = useMemo(() => {
    const map: Record<string, AppCard[]> = {};
    for (const s of [...ACTIVE_STAGES, ...CLOSED_STAGES]) map[s.status] = [];
    for (const a of filtered) { if (map[a.status]) map[a.status].push(a); }
    return map;
  }, [filtered]);

  const hasClosedCards = CLOSED_STAGES.some((s) => byStatus[s.status].length > 0);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-md shadow-amber-200">
            <Kanban className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Pipeline</h1>
            <p className="text-sm text-slate-500">
              {filtered.length} application{filtered.length !== 1 ? "s" : ""}
              {jobFilter !== "all" ? " in this role" : " across all roles"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…"
              className="h-8 w-44 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-sm text-slate-700 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <select value={jobFilter} onChange={(e) => setJobFilter(e.target.value)}
            className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All roles</option>
            {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
        </div>
      </div>

      {/* Active columns — scroll horizontally on mobile */}
      <div className="-mx-4 md:mx-0 overflow-x-auto pb-2">
      <div className="flex gap-3 px-4 md:px-0 md:grid md:grid-cols-3 lg:grid-cols-6" style={{ minWidth: "min-content" }}>
        {ACTIVE_STAGES.map((col) => {
          const cards = byStatus[col.status];
          return (
            <div key={col.status} className="flex flex-col gap-2.5 min-w-[160px] md:min-w-0">
              {/* Column header */}
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-1.5 rounded-full bg-gradient-to-r ${col.col} px-2.5 py-1 shadow-sm`}>
                  <span className="text-[11px] font-bold text-white">{col.label}</span>
                </div>
                <span className="text-xs font-bold text-slate-400 tabular-nums">{cards.length}</span>
              </div>

              {/* Cards */}
              <div className="space-y-2 min-h-[80px]">
                {cards.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-slate-100 py-5 text-center text-[11px] text-slate-300">
                    Empty
                  </div>
                ) : (
                  cards.map((a) => <CandidateCard key={a.id} app={a} />)
                )}
              </div>
            </div>
          );
        })}
      </div>
      </div>

      {/* Closed stages */}
      {hasClosedCards && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Not progressing</p>
          <div className="grid gap-3 md:grid-cols-2">
            {CLOSED_STAGES.map((col) => {
              const cards = byStatus[col.status];
              if (cards.length === 0) return null;
              return (
                <div key={col.status}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[col.status] ?? "bg-slate-100 text-slate-400"}`}>
                      {col.label}
                    </span>
                    <span className="text-xs text-slate-400">{cards.length}</span>
                  </div>
                  <div className="space-y-1">
                    {cards.map((a) => (
                      <Link key={a.id} href={`/candidates/${a.candidateId}`}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors line-through"
                      >
                        <span className="truncate">{a.candidateName || "Unnamed"}</span>
                        <span className="text-slate-300">·</span>
                        <span className="truncate text-xs">{a.jobTitle}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
