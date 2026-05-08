"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Power, X, Users, Search, ChevronRight } from "lucide-react";
import { toggleJobStatus } from "./actions";

type Job = {
  id: string;
  title: string;
  status: string;
  candidateCount: number;
  createdAt: Date;
  industry: string | null;
};

const STATUS_STYLES: Record<string, { chip: string; dot: string }> = {
  ACTIVE: { chip: "bg-emerald-50 text-emerald-700 border border-emerald-200", dot: "bg-emerald-500" },
  CLOSED: { chip: "bg-slate-100 text-slate-500 border border-slate-200",     dot: "bg-slate-400" },
  DRAFT:  { chip: "bg-amber-50 text-amber-700 border border-amber-200",      dot: "bg-amber-400" },
};
const ALL_STATUSES = ["ACTIVE", "CLOSED", "DRAFT"];

export function JobsList({ jobs }: { jobs: Job[] }) {
  const [statusFilter, setStatusFilter] = useState<string[]>(["ACTIVE"]);
  const [search, setSearch] = useState("");
  const [pending, start] = useTransition();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const filtered = useMemo(() => jobs.filter((j) => {
    if (statusFilter.length > 0 && !statusFilter.includes(j.status)) return false;
    if (search && !j.title.toLowerCase().includes(search.toLowerCase()) &&
        !j.industry?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [jobs, statusFilter, search]);

  const toggleFilter = (s: string) =>
    setStatusFilter((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const handleToggle = (job: Job) => {
    setTogglingId(job.id);
    start(async () => { await toggleJobStatus(job.id, job.status); setTogglingId(null); });
  };

  return (
    <div className="space-y-4">
      {/* Filter / search bar */}
      <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs…"
            className="h-8 w-full rounded-lg border-0 bg-slate-50 pl-8 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex gap-1.5">
          {ALL_STATUSES.map((s) => {
            const active = statusFilter.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleFilter(s)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  active ? STATUS_STYLES[s].chip : "bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {active && <span className={`h-1.5 w-1.5 rounded-full ${STATUS_STYLES[s].dot}`} />}
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            );
          })}
        </div>
        {(statusFilter.length > 0 || search) && (
          <button
            type="button"
            onClick={() => { setStatusFilter([]); setSearch(""); }}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="h-3 w-3" /> Clear
          </button>
        )}
        <span className="ml-auto text-xs text-slate-400 font-medium">{filtered.length} of {jobs.length}</span>
      </div>

      {/* Jobs */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center shadow-sm">
          <p className="text-sm text-slate-400">No jobs match your filters.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden divide-y divide-slate-100">
          {filtered.map((j) => {
            const s = STATUS_STYLES[j.status];
            return (
              <div
                key={j.id}
                className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50/70 group ${j.status !== "ACTIVE" ? "opacity-60" : ""}`}
              >
                <div className={`shrink-0 h-2 w-2 rounded-full ${s?.dot ?? "bg-slate-300"}`} />

                <Link href={`/jobs/${j.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-semibold text-slate-900 truncate group-hover:text-blue-700 transition-colors">{j.title}</span>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${s?.chip ?? "bg-slate-100 text-slate-500"}`}>
                      {j.status.charAt(0) + j.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{j.candidateCount} candidate{j.candidateCount !== 1 ? "s" : ""}</span>
                    {j.industry && <span>{j.industry}</span>}
                    <span>{new Date(j.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </Link>

                <div className="shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={pending && togglingId === j.id}
                    onClick={() => handleToggle(j)}
                    title={j.status === "ACTIVE" ? "Deactivate" : "Activate"}
                    className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                  >
                    <Power className={`h-3.5 w-3.5 ${j.status === "ACTIVE" ? "text-emerald-500" : ""}`} />
                  </Button>
                  <Link href={`/jobs/${j.id}`} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
