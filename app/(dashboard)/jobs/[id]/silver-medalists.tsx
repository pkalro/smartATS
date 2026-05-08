"use client";

import { useState, useTransition, useMemo } from "react";
import { Medal, ChevronDown, ChevronUp, UserPlus, Loader2, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { addSilverMedalistToJob } from "../actions";

export type SilverMedalist = {
  candidateId: string;
  name: string | null;
  currentTitle: string | null;
  currentCompany: string | null;
  score: number;
  previousJobTitle: string;
  reachedStatus: string;
};

const SCORE_OPTIONS = [
  { label: "All (65+)", value: 65 },
  { label: "Good (70+)", value: 70 },
  { label: "Strong (75+)", value: 75 },
  { label: "Excellent (85+)", value: 85 },
];

const STATUS_OPTIONS = ["All stages", "Shortlisted", "Interviewing", "Offer"];

export function SilverMedalistsPanel({
  jobId,
  candidates,
}: {
  jobId: string;
  candidates: SilverMedalist[];
}) {
  const [open, setOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [pending, start] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  // Filters
  const [minScore, setMinScore] = useState(65);
  const [stageFilter, setStageFilter] = useState("All stages");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (c.score < minScore) return false;
      if (stageFilter !== "All stages" && !c.reachedStatus.toLowerCase().includes(stageFilter.toLowerCase())) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !c.name?.toLowerCase().includes(q) &&
          !c.currentTitle?.toLowerCase().includes(q) &&
          !c.currentCompany?.toLowerCase().includes(q) &&
          !c.previousJobTitle?.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [candidates, minScore, stageFilter, search]);

  if (candidates.length === 0) return null;

  const add = (candidateId: string) => {
    setPendingId(candidateId);
    start(async () => {
      await addSilverMedalistToJob(candidateId, jobId);
      setAdded((prev) => new Set([...prev, candidateId]));
      setPendingId(null);
    });
  };

  return (
    <div className="rounded-2xl border border-violet-200 bg-violet-50 shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left"
      >
        <div className="flex items-center gap-2">
          <Medal className="h-4 w-4 text-violet-600" />
          <span className="text-sm font-bold text-violet-900">Silver Medalists</span>
          <span className="rounded-full bg-violet-200 px-2 py-0.5 text-xs font-semibold text-violet-800">
            {filtered.length}/{candidates.length}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-violet-700">
          <span className="hidden sm:inline">High-scoring candidates from other roles</span>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-violet-200 px-5 py-4 space-y-4">
          {/* Filter toggle */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-violet-700">
              Scored ≥65 in a previous role and reached shortlist or beyond.
            </p>
            <button
              type="button"
              onClick={() => setFiltersOpen((o) => !o)}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                filtersOpen ? "border-violet-400 bg-violet-100 text-violet-800" : "border-violet-200 text-violet-600 hover:bg-violet-100"
              }`}
            >
              <SlidersHorizontal className="h-3 w-3" />
              Filters
            </button>
          </div>

          {/* Inline filters */}
          {filtersOpen && (
            <div className="rounded-xl border border-violet-200 bg-white p-3 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Search */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-violet-500 mb-1 block">Search</label>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Name, title, company…"
                    className="w-full h-8 rounded-lg border border-violet-200 bg-violet-50 px-2.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400/30"
                  />
                </div>
                {/* Min score */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-violet-500 mb-1 block">Min score</label>
                  <select
                    value={minScore}
                    onChange={(e) => setMinScore(Number(e.target.value))}
                    className="w-full h-8 rounded-lg border border-violet-200 bg-violet-50 px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400/30"
                  >
                    {SCORE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                {/* Stage reached */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-violet-500 mb-1 block">Stage reached</label>
                  <select
                    value={stageFilter}
                    onChange={(e) => setStageFilter(e.target.value)}
                    className="w-full h-8 rounded-lg border border-violet-200 bg-violet-50 px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-400/30"
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>
              {(minScore !== 65 || stageFilter !== "All stages" || search) && (
                <button
                  type="button"
                  onClick={() => { setMinScore(65); setStageFilter("All stages"); setSearch(""); }}
                  className="text-[11px] text-violet-500 hover:text-violet-700 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Candidate list */}
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <p className="text-center py-6 text-sm text-violet-500">No candidates match your filters.</p>
            ) : (
              filtered.map((c) => (
                <div
                  key={c.candidateId}
                  className="flex items-center justify-between rounded-xl bg-white border border-violet-100 px-3.5 py-3 shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900 truncate">{c.name || "Unnamed"}</span>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                        c.score >= 85 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        c.score >= 75 ? "bg-blue-50 text-blue-700 border-blue-200" :
                        "bg-violet-50 text-violet-700 border-violet-200"
                      }`}>
                        {c.score}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {c.currentTitle}
                      {c.currentCompany && <span className="text-slate-400"> · {c.currentCompany}</span>}
                    </p>
                    <p className="text-[11px] text-violet-500 mt-0.5 italic">
                      {c.previousJobTitle} · reached {c.reachedStatus.toLowerCase()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={(pending && pendingId === c.candidateId) || added.has(c.candidateId)}
                    onClick={() => add(c.candidateId)}
                    className="ml-3 shrink-0 h-8 text-xs text-violet-700 border-violet-300 hover:bg-violet-100"
                  >
                    {pending && pendingId === c.candidateId ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : added.has(c.candidateId) ? (
                      "Added ✓"
                    ) : (
                      <><UserPlus className="h-3.5 w-3.5" /> Add</>
                    )}
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
