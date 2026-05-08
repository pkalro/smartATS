"use client";

import { useState, useTransition } from "react";
import { Building2, RefreshCw, Loader2, ChevronDown } from "lucide-react";
import { regenerateTargetCompaniesAction } from "../actions";

const INDUSTRIES = [
  "Fintech / Payments", "SaaS / B2B Software", "E-commerce / D2C", "Healthtech", "Edtech",
  "Logistics / Supply Chain", "Media / Content", "Gaming", "Deep Tech / AI/ML", "Cybersecurity",
  "BFSI", "Consulting", "Manufacturing", "Real Estate", "Government / Public Sector", "Other",
];

const COMPANY_TIERS = [
  "Pre-seed / Seed Startup", "Series A-B Startup", "Series C+ / Late Stage", "Unicorn / Decacorn",
  "Mid-size (500–5000)", "MNC / Large Enterprise (5000+)", "Product Company", "Service / IT Company", "Any",
];

export function TargetCompaniesCard({
  jobId,
  initialCompanies,
  initialIndustry,
  initialTier,
}: {
  jobId: string;
  initialCompanies: string[];
  initialIndustry?: string | null;
  initialTier?: string | null;
}) {
  const [companies, setCompanies] = useState<string[]>(initialCompanies);
  const [industry, setIndustry] = useState(initialIndustry ?? "");
  const [tier, setTier] = useState(initialTier ?? "");
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const regenerate = () => {
    setError(null);
    start(async () => {
      const res = await regenerateTargetCompaniesAction(jobId, industry || undefined, tier || undefined);
      if ("error" in res) {
        setError(res.error ?? "Failed");
      } else {
        setCompanies(res.companies);
      }
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5 text-slate-400" />
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Target companies</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowFilters((o) => !o)}
            className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium transition-colors ${
              showFilters
                ? "border-blue-300 bg-blue-50 text-blue-700"
                : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            Filter
            <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
          <button
            type="button"
            onClick={regenerate}
            disabled={pending}
            title="Re-generate with AI"
            className="flex items-center gap-1 rounded-lg border border-violet-200 bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-700 hover:bg-violet-100 transition-colors disabled:opacity-50"
          >
            {pending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            {pending ? "Generating…" : "Re-generate"}
          </button>
        </div>
      </div>

      {/* Inline filters */}
      {showFilters && (
        <div className="border-b border-slate-100 bg-slate-50 px-4 py-3 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Refine AI suggestions
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Any industry</option>
                {INDUSTRIES.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Company tier</label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Any tier</option>
                {COMPANY_TIERS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-[10px] text-slate-400">
            Select filters then click <span className="font-semibold text-violet-600">Re-generate</span> — AI will suggest companies matching your criteria.
          </p>
        </div>
      )}

      {/* Company chips */}
      <div className="p-4">
        {error && (
          <p className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}
        {pending ? (
          <div className="flex items-center gap-2 py-4 justify-center">
            <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
            <span className="text-sm text-slate-500">Asking AI for companies…</span>
          </div>
        ) : companies.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {companies.map((c) => (
              <span
                key={c}
                className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-default"
              >
                {c}
              </span>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-xs text-slate-400 mb-2">No companies generated yet.</p>
            <button
              type="button"
              onClick={regenerate}
              className="text-xs text-violet-600 hover:text-violet-800 font-medium transition-colors"
            >
              Generate with AI →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
