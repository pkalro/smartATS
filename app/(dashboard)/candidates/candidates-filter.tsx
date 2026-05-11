"use client";

import { useState, useMemo, useTransition, useRef, useEffect } from "react";
import Link from "next/link";
import { parseSkills } from "@/lib/skills";
import { Icon } from "@/components/icons/icon";
import { STATUS_STYLES } from "@/lib/status-styles";
import { updateApplicationStatus } from "./actions";
import type { CandidateStatus } from "@/lib/types";

const ALL_STATUSES = ["NEW","SCREENING","SHORTLISTED","INTERVIEWING","OFFER","HIRED","REJECTED","WITHDRAWN"];
const ALL_SOURCES  = ["LINKEDIN","NAUKRI","REFERRAL","INBOUND","OTHER"];

// Dot colour per stage for the dropdown menu
const STATUS_DOT: Record<string, string> = {
  NEW: "bg-slate-400", SCREENING: "bg-blue-500", SHORTLISTED: "bg-violet-500",
  INTERVIEWING: "bg-amber-500", OFFER: "bg-orange-500", HIRED: "bg-emerald-500",
  REJECTED: "bg-red-400", WITHDRAWN: "bg-slate-300",
};

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

/**
 * Fully custom stage-change dropdown — no native <select>.
 * Renders as a badge pill; clicking opens a positioned menu.
 */
function StageDropdown({ applicationId, status }: { applicationId: string; status: string }) {
  const [open, setOpen]   = useState(false);
  const [, startT]        = useTransition();
  const ref               = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const colorClass = STATUS_STYLES[status] ?? "bg-slate-100 text-slate-500 border-slate-200";
  const label      = STAGE_LABELS[status] ?? status;

  return (
    <div ref={ref} className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
      {/* Trigger badge */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1 h-[22px] rounded-full border pl-2 pr-1.5 text-[10px] font-semibold cursor-pointer transition-opacity hover:opacity-80 ${colorClass}`}
      >
        {label}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className={`h-2.5 w-2.5 opacity-60 transition-transform ${open ? "rotate-180" : ""}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-50 w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-xl shadow-slate-900/10">
          {Object.entries(STAGE_LABELS).map(([v, lbl]) => (
            <button
              key={v}
              type="button"
              onClick={() => {
                startT(() => updateApplicationStatus(applicationId, v as CandidateStatus));
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs transition-colors text-left hover:bg-slate-50 ${
                v === status ? "font-bold text-slate-900" : "font-medium text-slate-600"
              }`}
            >
              <span className={`h-2 w-2 rounded-full shrink-0 ${STATUS_DOT[v] ?? "bg-slate-400"}`} />
              {lbl}
              {v === status && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  className="ml-auto h-3 w-3 text-blue-500">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
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
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold ${cls}`}>
      <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
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
        <div className="relative w-full sm:w-auto">
          <Icon name="search" size={3.5} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, title, job…"
            className="h-8 w-full sm:w-52 rounded-lg border-0 bg-slate-50 pl-8 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
            <Icon name="x" size={3} /> Clear
          </button>
        )}

        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">{filtered.length} of {candidates.length}</span>
          {filtered.length > 0 && (
            <a href="/api/candidates/export.csv" className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors">
              <Icon name="download" size={3.5} /> Export
            </a>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="px-5 py-12 text-center text-sm text-slate-400">No candidates match your filters.</p>
      ) : (
        <>
          {/* ── Mobile card list (< md) ── */}
          <div className="md:hidden divide-y divide-slate-100">
            {filtered.map((c) => {
              const days = daysSince(c.updatedAt);
              const isStale = days >= 3 && !["HIRED","REJECTED","WITHDRAWN"].includes(c.status);
              const app = c.applications[0];
              return (
                <Link key={c.id} href={`/candidates/${c.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 active:bg-slate-100 transition-colors">
                  {/* Avatar */}
                  <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-sm font-bold text-white shadow-sm">
                    {(c.name ?? "?").charAt(0).toUpperCase()}
                  </div>
                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 truncate text-sm">{c.name || "Unnamed"}</span>
                      {c.score != null && <ScoreChip score={c.score} />}
                    </div>
                    {c.currentTitle && (
                      <p className="text-xs text-slate-500 truncate">{c.currentTitle}{c.email ? ` · ${c.email}` : ""}</p>
                    )}
                    {app && (
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] text-slate-400 truncate max-w-[140px]">{app.jobTitle}</span>
                        <span className={`shrink-0 rounded-full border px-1.5 py-px text-[10px] font-semibold ${STATUS_STYLES[app.status] ?? "bg-slate-100 text-slate-500"}`}>
                          {app.status.charAt(0) + app.status.slice(1).toLowerCase()}
                        </span>
                        {c.applications.length > 1 && (
                          <span className="text-[11px] text-slate-400">+{c.applications.length - 1}</span>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Right meta */}
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span className={`text-[11px] font-medium ${isStale ? "text-amber-500" : "text-slate-400"}`}>
                      {days === 0 ? "today" : `${days}d`}
                    </span>
                    <Icon name="chevron-right" size={3.5} className="text-slate-300" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* ── Desktop table (≥ md) — 4-zone layout ── */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col className="w-14" />          {/* avatar */}
                <col className="w-[220px]" />     {/* candidate */}
                <col />                            {/* applications — takes remaining space */}
                <col className="w-[200px]" />     {/* details */}
                <col className="w-14" />           {/* age */}
                <col className="w-10" />           {/* arrow */}
              </colgroup>
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="pl-5 pr-0 py-3" />
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Candidate</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Applications</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Details</th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 text-right">Age</th>
                  <th />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((c) => {
                  const skills = parseSkills(c.skills);
                  const days = daysSince(c.updatedAt);
                  const isStale = days >= 3 && !["HIRED","REJECTED","WITHDRAWN"].includes(c.status);
                  return (
                    <tr key={c.id} className="group hover:bg-slate-50/70 transition-colors">

                      {/* ── Avatar ── */}
                      <td className="pl-5 pr-0 py-4 align-top pt-4">
                        <Link href={`/candidates/${c.id}`} className="block">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-sm font-bold text-white shadow-sm">
                            {(c.name ?? "?").charAt(0).toUpperCase()}
                          </div>
                        </Link>
                      </td>

                      {/* ── Candidate zone: name + title + email + score ── */}
                      <td className="px-4 py-4 align-top">
                        <Link href={`/candidates/${c.id}`} className="block space-y-0.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors truncate text-sm leading-snug">
                              {c.name || "Unnamed"}
                            </span>
                            <ScoreChip score={c.score} />
                          </div>
                          {c.currentTitle && (
                            <p className="text-xs text-slate-500 truncate leading-snug">{c.currentTitle}</p>
                          )}
                          {c.email && (
                            <p className="text-[11px] text-slate-400 font-mono truncate leading-snug">{c.email}</p>
                          )}
                        </Link>
                      </td>

                      {/* ── Applications zone: [dot] job title [status] per row ── */}
                      <td className="px-4 py-4 align-top">
                        {c.applications.length === 0 ? (
                          <span className="text-xs text-slate-300">—</span>
                        ) : (
                          <div className="flex flex-col gap-1.5">
                            {c.applications.slice(0, 3).map((a, i) => (
                              <div key={a.jobId} className="flex items-center gap-2 min-w-0">
                                {/* Status dot */}
                                <span className={`shrink-0 h-2 w-2 rounded-full ${STATUS_DOT[a.status] ?? "bg-slate-300"}`} />
                                {/* Job title */}
                                <Link
                                  href={`/jobs/${a.jobId}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="min-w-0 flex-1 text-xs font-medium text-slate-700 hover:text-blue-600 truncate"
                                >
                                  {a.jobTitle}
                                </Link>
                                {/* Stage — dropdown for primary, compact badge for rest */}
                                {i === 0 && c.primaryApplicationId ? (
                                  <StageDropdown applicationId={c.primaryApplicationId} status={a.status} />
                                ) : (
                                  <span className={`shrink-0 inline-flex items-center rounded-full border px-2 py-px text-[10px] font-semibold ${STATUS_STYLES[a.status] ?? "bg-slate-100 text-slate-500 border-slate-200"}`}>
                                    {STAGE_LABELS[a.status] ?? a.status.charAt(0) + a.status.slice(1).toLowerCase()}
                                  </span>
                                )}
                              </div>
                            ))}
                            {c.applications.length > 3 && (
                              <span className="text-[10px] text-slate-400 pl-4">+{c.applications.length - 3} more</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* ── Details zone: skills + notice · salary · source ── */}
                      <td className="px-4 py-4 align-top">
                        <div className="space-y-1.5">
                          {skills.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {skills.slice(0, 3).map((s) => (
                                <span key={s} className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 font-medium">
                                  {s}
                                </span>
                              ))}
                              {skills.length > 3 && (
                                <span className="text-[10px] text-slate-400">+{skills.length - 3}</span>
                              )}
                            </div>
                          )}
                          {(c.noticePeriod || c.currentSalary || c.source) && (
                            <p className="text-[11px] text-slate-400 leading-snug">
                              {[
                                c.noticePeriod,
                                c.currentSalary,
                                c.source ? c.source.charAt(0) + c.source.slice(1).toLowerCase() : null,
                              ].filter(Boolean).join(" · ")}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* ── Age ── */}
                      <td className="px-4 py-4 align-top text-right">
                        <span className={`text-[11px] font-medium tabular-nums ${isStale ? "text-amber-500" : "text-slate-300"}`}>
                          {days === 0 ? "today" : `${days}d`}
                        </span>
                      </td>

                      {/* ── Arrow ── */}
                      <td className="pr-3 align-top pt-4">
                        <Link href={`/candidates/${c.id}`}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 hover:text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition-all">
                          <Icon name="chevron-right" size={3.5} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
