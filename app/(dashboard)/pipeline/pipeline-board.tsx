"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons/icon";
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

// One card per candidate (merged across multiple jobs in same stage)
type CandidateGroup = {
  candidateId: string;
  candidateName: string | null;
  currentTitle: string | null;
  noticePeriod: string | null;
  currentSalary: string | null;
  score: number | null;           // best score across all jobs
  updatedAt: Date;
  jobs: { applicationId: string; jobId: string; jobTitle: string }[];
};

const ACTIVE_STAGES = [
  { status: "NEW",          label: "New",          col: "from-slate-400 to-slate-500",    light: "bg-slate-100 text-slate-600 border-slate-200" },
  { status: "SCREENING",    label: "Screening",    col: "from-blue-500 to-cyan-500",      light: "bg-blue-100 text-blue-700 border-blue-200" },
  { status: "SHORTLISTED",  label: "Shortlisted",  col: "from-violet-500 to-purple-500",  light: "bg-violet-100 text-violet-700 border-violet-200" },
  { status: "INTERVIEWING", label: "Interviewing", col: "from-amber-500 to-orange-500",   light: "bg-amber-100 text-amber-700 border-amber-200" },
  { status: "OFFER",        label: "Offer",        col: "from-orange-500 to-rose-500",    light: "bg-orange-100 text-orange-700 border-orange-200" },
  { status: "HIRED",        label: "Hired",        col: "from-emerald-500 to-teal-500",   light: "bg-emerald-100 text-emerald-700 border-emerald-200" },
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
  const cls = score >= 75 ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : score >= 50 ? "bg-amber-50 text-amber-700 border-amber-200"
            : "bg-red-50 text-red-600 border-red-200";
  return (
    <span className={`shrink-0 inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-bold ${cls}`}>
      <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
      {score}
    </span>
  );
}

function CandidateCard({ group }: { group: CandidateGroup }) {
  const days = daysSince(group.updatedAt);
  const isStale = days >= 3;

  return (
    <Link
      href={`/candidates/${group.candidateId}`}
      className="group block rounded-xl border border-slate-200 bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:shadow-md hover:border-blue-200 hover:-translate-y-0.5"
    >
      {/* Avatar + name + score */}
      <div className="flex items-center gap-1.5 mb-2 min-w-0">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-[11px] font-bold text-white shadow-sm">
          {(group.candidateName ?? "?").charAt(0).toUpperCase()}
        </div>
        <span className="flex-1 min-w-0 font-semibold text-slate-800 leading-tight truncate text-[13px] group-hover:text-blue-700 transition-colors">
          {group.candidateName || "Unnamed"}
        </span>
        <ScoreChip score={group.score} />
      </div>

      {group.currentTitle && (
        <p className="text-[11px] text-slate-500 truncate mb-1">{group.currentTitle}</p>
      )}

      {/* Job tags — show all jobs this candidate is in for this stage */}
      <div className="flex flex-wrap gap-1 mb-2">
        {group.jobs.map((j) => (
          <span key={j.applicationId} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 truncate max-w-[120px]">
            {j.jobTitle}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between gap-1 text-[10px]">
        <div className="flex items-center gap-2">
          {group.noticePeriod && <span className="text-slate-500 font-medium">{group.noticePeriod}</span>}
          {group.currentSalary && <span className="text-slate-400">{group.currentSalary}</span>}
        </div>
        <span className={isStale ? "text-amber-500 font-semibold" : "text-slate-300"}>
          {days === 0 ? "today" : `${days}d`}
        </span>
      </div>
    </Link>
  );
}

/** Group flat AppCards by candidateId within a stage */
function groupByCandidateId(cards: AppCard[]): CandidateGroup[] {
  const map = new Map<string, CandidateGroup>();
  for (const c of cards) {
    const existing = map.get(c.candidateId);
    if (existing) {
      existing.jobs.push({ applicationId: c.id, jobId: c.jobId, jobTitle: c.jobTitle });
      if (c.score != null && (existing.score == null || c.score > existing.score)) {
        existing.score = c.score;
      }
      if (new Date(c.updatedAt) > new Date(existing.updatedAt)) {
        existing.updatedAt = c.updatedAt;
      }
    } else {
      map.set(c.candidateId, {
        candidateId:  c.candidateId,
        candidateName: c.candidateName,
        currentTitle: c.currentTitle,
        noticePeriod: c.noticePeriod,
        currentSalary: c.currentSalary,
        score:        c.score,
        updatedAt:    c.updatedAt,
        jobs:         [{ applicationId: c.id, jobId: c.jobId, jobTitle: c.jobTitle }],
      });
    }
  }
  return Array.from(map.values());
}

export function PipelineBoard({ applications, jobs }: { applications: AppCard[]; jobs: Job[] }) {
  const [jobFilter, setJobFilter]       = useState("all");
  const [search, setSearch]             = useState("");
  const [expandedCol, setExpandedCol]   = useState<string | null>(null);

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

  // Build per-status grouped lists
  const byStatus = useMemo(() => {
    const raw: Record<string, AppCard[]> = {};
    for (const s of [...ACTIVE_STAGES, ...CLOSED_STAGES]) raw[s.status] = [];
    for (const a of filtered) { if (raw[a.status]) raw[a.status].push(a); }
    // Group by candidate within each stage
    const grouped: Record<string, CandidateGroup[]> = {};
    for (const s in raw) grouped[s] = groupByCandidateId(raw[s]);
    return grouped;
  }, [filtered]);

  const hasClosedCards = CLOSED_STAGES.some((s) => byStatus[s.status]?.length > 0);

  function toggleCol(status: string) {
    setExpandedCol((prev) => (prev === status ? null : status));
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-md shadow-amber-200">
            <Icon name="kanban" size={5} className="text-white" />
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
            <Icon name="search" size={3.5} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
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

      {/* ── Stage summary bar (always visible) ── */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {ACTIVE_STAGES.map((col) => {
          const groups  = byStatus[col.status] ?? [];
          const isOpen  = expandedCol === col.status;
          return (
            <button
              key={col.status}
              type="button"
              onClick={() => toggleCol(col.status)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 px-2 transition-all ${
                isOpen
                  ? "border-blue-300 bg-blue-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className={`flex items-center gap-1.5 rounded-full bg-gradient-to-r ${col.col} px-2.5 py-1 shadow-sm`}>
                <span className="text-[11px] font-bold text-white">{col.label}</span>
              </div>
              <span className={`text-xl font-extrabold tabular-nums ${isOpen ? "text-blue-700" : "text-slate-800"}`}>
                {groups.length}
              </span>
              <span className="text-[10px] text-slate-400">{isOpen ? "▲ hide" : "▼ show"}</span>
            </button>
          );
        })}
      </div>

      {/* ── Expanded column ── */}
      {expandedCol && (() => {
        const col    = ACTIVE_STAGES.find((c) => c.status === expandedCol)!;
        const groups = byStatus[expandedCol] ?? [];
        return (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Column header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className={`flex items-center gap-1.5 rounded-full bg-gradient-to-r ${col.col} px-3 py-1 shadow-sm`}>
                  <span className="text-[12px] font-bold text-white">{col.label}</span>
                </div>
                <span className="text-sm font-bold text-slate-500 tabular-nums">
                  {groups.length} candidate{groups.length !== 1 ? "s" : ""}
                </span>
              </div>
              <button
                onClick={() => setExpandedCol(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <Icon name="x" size={4} />
              </button>
            </div>

            {/* Cards grid */}
            {groups.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">No candidates in this stage</div>
            ) : (
              <div className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {groups.map((g) => <CandidateCard key={g.candidateId} group={g} />)}
              </div>
            )}
          </div>
        );
      })()}

      {/* ── Closed stages ── */}
      {hasClosedCards && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">Not progressing</p>
          <div className="grid gap-3 md:grid-cols-2">
            {CLOSED_STAGES.map((col) => {
              const groups = byStatus[col.status] ?? [];
              if (groups.length === 0) return null;
              return (
                <div key={col.status}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[col.status] ?? "bg-slate-100 text-slate-400"}`}>
                      {col.label}
                    </span>
                    <span className="text-xs text-slate-400">{groups.length}</span>
                  </div>
                  <div className="space-y-1">
                    {groups.map((g) => (
                      <Link key={g.candidateId} href={`/candidates/${g.candidateId}`}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors line-through"
                      >
                        <span className="truncate">{g.candidateName || "Unnamed"}</span>
                        <span className="text-slate-300">·</span>
                        <span className="truncate text-xs">{g.jobs.map((j) => j.jobTitle).join(", ")}</span>
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
