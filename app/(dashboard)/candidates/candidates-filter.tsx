"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { parseSkills } from "@/lib/skills";
import { X, Download, Search, ChevronRight } from "lucide-react";
import { STATUS_STYLES } from "@/lib/status-styles";
import { updateApplicationStatus } from "./actions";
import type { CandidateStatus } from "@/lib/types";

const ALL_STATUSES = ["NEW","SCREENING","SHORTLISTED","INTERVIEWING","OFFER","HIRED","REJECTED","WITHDRAWN"];
const ALL_SOURCES  = ["LINKEDIN","NAUKRI","REFERRAL","INBOUND","OTHER"];

type Application = { id: string; jobTitle: string; jobId: string; status: string };

type Candidate = {
  id: string;
  name: string | null;
  email: string | null;
  currentTitle: string | null;
  status: string;
  score: number | null;
  skills: string;
  noticePeriod: string | null;
  currentSalary: string | null;
  source: string | null;
  updatedAt: Date;
  primaryApplicationId: string | null;
  applications: Application[];
};

const STAGE_LABELS: Record<string, string> = {
  NEW: "New", SCREENING: "Screening", SHORTLISTED: "Shortlisted",
  INTERVIEWING: "Interviewing", OFFER: "Offer", HIRED: "Hired",
  REJECTED: "Rejected", WITHDRAWN: "Withdrawn",
};

function StageSelect({ applicationId, status }: { applicationId: string; status: string }) {
  const [, startT] = useTransition();
  return (
    <select
      value={status}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        e.stopPropagation();
        startT(() => updateApplicationStatus(applicationId, e.target.value as CandidateStatus));
      }}
      className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${STATUS_STYLES[status] ?? "bg-slate-100 text-slate-500 border-slate-200"}`}
    >
      {Object.entries(STAGE_LABELS).map(([v, label]) => (
        <option key={v} value={v}>{label}</option>
      ))}
    </select>
  );
}

function daysSince(date: Date) {
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
}

function ScoreChip({ score }: { score: number | null }) {
  if (score == null) return <span className="text-slate-300 text-xs">—</span>;
  const cls = score >= 75 ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : score >= 50 ? "bg-amber-50 text-amber-700 border-amber-200"
            : "bg-red-50 text-red-600 border-red-200";
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-bold ${cls}`}>
      {score}
    </span>
  );
}

export function CandidatesFilter({ candidates }: { candidates: Candidate[] }) {
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sourceFilter, setSourceFilter] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => candidates.filter((c) => {
    if (statusFilter.length > 0 && !statusFilter.includes(c.status)) return false;
    if (sourceFilter.length > 0 && !sourceFilter.includes(c.source ?? "")) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!c.name?.toLowerCase().includes(q) && !c.email?.toLowerCase().includes(q) &&
          !c.currentTitle?.toLowerCase().includes(q) &&
          !c.applications.some((a) => a.jobTitle.toLowerCase().includes(q))) return false;
    }
    return true;
  }), [candidates, statusFilter, sourceFilter, search]);

  const toggleStatus = (s: string) =>
    setStatusFilter((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  const toggleSource = (s: string) =>
    setSourceFilter((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  const hasFilters = statusFilter.length > 0 || sourceFilter.length > 0 || search;

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, title, job…"
            className="h-8 w-52 rounded-lg border-0 bg-slate-50 pl-8 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex flex-wrap gap-1">
          {ALL_STATUSES.map((s) => {
            const active = statusFilter.includes(s);
            const style = STATUS_STYLES[s] ?? "bg-muted text-muted-foreground";
            return (
              <button key={s} type="button" onClick={() => toggleStatus(s)}
                className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-all ${
                  active ? `${style} border-current` : "border-slate-200 text-slate-400 hover:bg-slate-50"
                }`}
              >
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-1">
          {ALL_SOURCES.map((s) => (
            <button key={s} type="button" onClick={() => toggleSource(s)}
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-all ${
                sourceFilter.includes(s)
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "border-slate-200 text-slate-400 hover:bg-slate-50"
              }`}
            >
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {hasFilters && (
          <button type="button" onClick={() => { setStatusFilter([]); setSourceFilter([]); setSearch(""); }}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}

        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">{filtered.length} of {candidates.length}</span>
          {filtered.length > 0 && (
            <a href="/api/candidates/export.csv" className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors">
              <Download className="h-3.5 w-3.5" /> Export
            </a>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Candidate</th>
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Roles</th>
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Score</th>
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Skills</th>
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Notice</th>
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Salary</th>
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Source</th>
              <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Updated</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-12 text-center text-sm text-slate-400">
                  No candidates match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((c) => {
                const skills = parseSkills(c.skills);
                const days = daysSince(c.updatedAt);
                const isStale = days >= 3 && !["HIRED","REJECTED","WITHDRAWN"].includes(c.status);

                return (
                  <tr key={c.id} className="group hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link href={`/candidates/${c.id}`} className="block">
                        <div className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors truncate max-w-[160px]">
                          {c.name || "Unnamed"}
                        </div>
                        {c.currentTitle && <div className="text-xs text-slate-500 truncate max-w-[160px]">{c.currentTitle}</div>}
                        {c.email && <div className="text-[11px] text-slate-400 font-mono truncate max-w-[160px]">{c.email}</div>}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      {c.applications.length === 0 ? (
                        <span className="text-xs text-slate-300">—</span>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          {c.applications.slice(0, 2).map((a, i) => (
                            <div key={a.jobId} className="flex items-center gap-1.5">
                              <Link href={`/jobs/${a.jobId}`} className="text-xs text-slate-600 hover:text-blue-600 hover:underline truncate max-w-[110px]">
                                {a.jobTitle}
                              </Link>
                              {i === 0 && c.primaryApplicationId ? (
                                <StageSelect applicationId={c.primaryApplicationId} status={a.status} />
                              ) : (
                                <span className={`shrink-0 rounded-full border px-1.5 py-px text-[10px] font-semibold ${STATUS_STYLES[a.status] ?? "bg-slate-100 text-slate-500"}`}>
                                  {a.status.charAt(0) + a.status.slice(1).toLowerCase()}
                                </span>
                              )}
                            </div>
                          ))}
                          {c.applications.length > 2 && (
                            <span className="text-xs text-slate-400">+{c.applications.length - 2} more</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5"><ScoreChip score={c.score} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {skills.slice(0, 3).map((s) => (
                          <span key={s} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600 font-medium">{s}</span>
                        ))}
                        {skills.length > 3 && <span className="text-[11px] text-slate-400">+{skills.length - 3}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">{c.noticePeriod || <span className="text-slate-300">—</span>}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">{c.currentSalary || <span className="text-slate-300">—</span>}</td>
                    <td className="px-5 py-3.5">
                      {c.source ? (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                          {c.source.charAt(0) + c.source.slice(1).toLowerCase()}
                        </span>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className={`px-5 py-3.5 text-xs whitespace-nowrap font-medium ${isStale ? "text-amber-600" : "text-slate-400"}`}>
                      {days === 0 ? "today" : `${days}d ago`}
                    </td>
                    <td className="pr-4">
                      <Link href={`/candidates/${c.id}`} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 hover:text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-all">
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
