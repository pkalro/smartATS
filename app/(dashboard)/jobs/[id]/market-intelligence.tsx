"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { generateMarketIntelligenceAction } from "../actions";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Icon } from "@/components/icons/icon";
import type { MarketIntelligence, SkillScarcity } from "@/lib/ai/market";

const SCARCITY_CONFIG = {
  LOW:       { label: "Common",      color: "text-green-700 bg-green-50 border-green-200",    bar: "bg-green-400",  pct: 25 },
  MEDIUM:    { label: "Moderate",    color: "text-amber-700 bg-amber-50 border-amber-200",    bar: "bg-amber-400",  pct: 50 },
  HIGH:      { label: "Scarce",      color: "text-orange-700 bg-orange-50 border-orange-200", bar: "bg-orange-400", pct: 75 },
  VERY_HIGH: { label: "Very scarce", color: "text-red-700 bg-red-50 border-red-200",          bar: "bg-red-400",    pct: 95 },
};

type ScarcityKey = keyof typeof SCARCITY_CONFIG;

/** Normalize whatever the AI returns into a valid ScarcityKey */
function normalizeScarcity(raw: string | undefined | null): ScarcityKey {
  if (!raw) return "MEDIUM";
  const upper = raw.toUpperCase().trim();
  // Direct match
  if (upper in SCARCITY_CONFIG) return upper as ScarcityKey;
  // Label-to-key fallback (in case AI returns "Scarce" instead of "HIGH")
  const labelMap: Record<string, ScarcityKey> = {
    "COMMON": "LOW", "EASY": "LOW", "ABUNDANT": "LOW",
    "MODERATE": "MEDIUM", "AVERAGE": "MEDIUM", "NORMAL": "MEDIUM",
    "SCARCE": "HIGH", "DIFFICULT": "HIGH", "COMPETITIVE": "HIGH",
    "VERY SCARCE": "VERY_HIGH", "VERY_HIGH": "VERY_HIGH",
    "EXTREMELY SCARCE": "VERY_HIGH", "CRITICAL": "VERY_HIGH",
  };
  return labelMap[upper] ?? "MEDIUM";
}

function fmt(n: number, currency: string) {
  if (currency === "INR") {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    return `₹${n.toLocaleString("en-IN")}`;
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}

function BellCurve({ min, median, max, currency }: { min: number; median: number; max: number; currency: string }) {
  // Normalised positions as percentages of the range
  const range = max - min || 1;
  const medPct = Math.round(((median - min) / range) * 100);

  return (
    <div className="space-y-2">
      <div className="relative h-16">
        {/* Gaussian-ish bell using CSS clip-path */}
        <div className="absolute inset-x-0 bottom-0 h-14 overflow-hidden rounded-md bg-muted">
          <svg viewBox="0 0 200 56" className="h-full w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="bell-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
                <stop offset="50%" stopColor="currentColor" stopOpacity="0.5" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.15" />
              </linearGradient>
            </defs>
            <path
              d="M0,56 C20,56 30,10 100,4 C170,10 180,56 200,56 Z"
              fill="url(#bell-grad)"
              className="text-primary"
            />
          </svg>
        </div>
        {/* Median marker */}
        <div
          className="absolute bottom-0 top-0 w-0.5 bg-primary"
          style={{ left: `${medPct}%` }}
        />
        <div
          className="absolute -top-1 -translate-x-1/2 rounded bg-primary px-1.5 py-0.5 text-xs font-semibold text-primary-foreground"
          style={{ left: `${medPct}%` }}
        >
          {fmt(median, currency)}
        </div>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{fmt(min, currency)}</span>
        <span className="text-primary font-medium">Median</span>
        <span>{fmt(max, currency)}</span>
      </div>
    </div>
  );
}

export function MarketIntelligencePanel({
  jobId,
  initial,
}: {
  jobId: string;
  initial: MarketIntelligence | null;
}) {
  const [intel, setIntel] = useState<MarketIntelligence | null>(initial);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const generate = () => {
    setError(null);
    start(async () => {
      const r = await generateMarketIntelligenceAction(jobId);
      if ("error" in r) { setError(r.error ?? null); return; }
      if ("intel" in r) setIntel(r.intel);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Market Intelligence</h2>
          {intel?.generatedAt && (
            <p className="text-xs text-muted-foreground">
              Generated {new Date(intel.generatedAt).toLocaleDateString()} · approximate, based on AI training data
            </p>
          )}
        </div>
        <Button size="sm" variant="outline" disabled={pending} onClick={generate}>
          {pending
            ? <><Icon name="loader" size={3.5} className="animate-spin" /> Analysing…</>
            : intel
              ? <><RefreshCw className="h-3.5 w-3.5" /> Refresh</>
              : <><Icon name="trending-up" size={3.5} /> Generate</>}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {!intel && !pending && (
        <p className="text-sm text-muted-foreground py-4 text-center">
          Click Generate to get salary ranges, profile scarcity, and hiring-manager talking points.
        </p>
      )}

      {intel && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Salary bell curve */}
          <div className="rounded-lg border bg-card p-4 space-y-3 md:col-span-2">
            <h3 className="text-sm font-semibold">Salary range</h3>
            <BellCurve min={intel.salaryMin} median={intel.salaryMedian} max={intel.salaryMax} currency={intel.currency} />
            <p className="text-xs text-muted-foreground italic">{intel.budgetReality}</p>
          </div>

          {/* Scarcity — overall badge + skill-by-skill breakdown */}
          <div className="rounded-lg border bg-card p-4 space-y-3 md:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">Profile scarcity</h3>
              {(() => {
                const cfg = SCARCITY_CONFIG[normalizeScarcity(intel.scarcity)];
                return (
                  <span className={`rounded-full border px-3 py-0.5 text-xs font-semibold ${cfg.color}`}>
                    Overall: {cfg.label}
                  </span>
                );
              })()}
            </div>

            {/* Overall bar + reason */}
            {(() => {
              const cfg = SCARCITY_CONFIG[normalizeScarcity(intel.scarcity)];
              return (
                <div className="space-y-1.5">
                  <div className="h-1.5 w-full rounded-full bg-muted">
                    <div className={`h-1.5 rounded-full ${cfg.bar} transition-all`} style={{ width: `${cfg.pct}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground">{intel.scarcityReason}</p>
                </div>
              );
            })()}

            {/* Skill-by-skill rows */}
            {intel.skillScarcity && intel.skillScarcity.length > 0 && (
              <div className="pt-1 space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">By skill</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {intel.skillScarcity.map((s: SkillScarcity) => {
                    const cfg = SCARCITY_CONFIG[normalizeScarcity(s.level)];
                    return (
                      <div key={s.skill} className="flex items-start gap-2.5 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-slate-800">{s.skill}</span>
                            <span className={`rounded-full border px-2 py-0 text-[10px] font-bold ${cfg.color}`}>{cfg.label}</span>
                          </div>
                          <div className="mt-1 h-1 w-full rounded-full bg-slate-200">
                            <div className={`h-1 rounded-full ${cfg.bar}`} style={{ width: `${cfg.pct}%` }} />
                          </div>
                          <p className="mt-1 text-[11px] text-slate-500 leading-snug">{s.note}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Market insights */}
          <div className="rounded-lg border bg-card p-4 space-y-2 md:col-span-2">
            <h3 className="text-sm font-semibold">Market insights</h3>
            <ul className="space-y-1">
              {intel.insights.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="mt-0.5 shrink-0 text-primary">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* HM talking points */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2 md:col-span-2">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-800">
              <AlertTriangle className="h-4 w-4" /> Hiring manager talking points
            </h3>
            <ul className="space-y-1.5">
              {intel.hmTalkingPoints.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm text-amber-900">
                  <span className="mt-0.5 shrink-0 font-bold">{i + 1}.</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
