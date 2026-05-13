"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { generateMarketIntelligenceAction } from "../actions";
import { AlertTriangle, RefreshCw, Target } from "lucide-react";
import { Icon } from "@/components/icons/icon";
import type { MarketIntelligence, SkillScarcity } from "@/lib/ai/market";

const SCARCITY_CONFIG = {
  LOW:       { label: "Common",      textColor: "text-green-600",  barColor: "bg-green-500",  pct: 25 },
  MEDIUM:    { label: "Moderate",    textColor: "text-amber-600",  barColor: "bg-amber-400",  pct: 55 },
  HIGH:      { label: "Scarce",      textColor: "text-orange-600", barColor: "bg-orange-500", pct: 78 },
  VERY_HIGH: { label: "Very scarce", textColor: "text-red-600",    barColor: "bg-red-500",    pct: 96 },
};

type ScarcityKey = keyof typeof SCARCITY_CONFIG;

function normalizeScarcity(raw: string | undefined | null): ScarcityKey {
  if (!raw) return "MEDIUM";
  const upper = raw.toUpperCase().trim();
  if (upper in SCARCITY_CONFIG) return upper as ScarcityKey;
  const labelMap: Record<string, ScarcityKey> = {
    "COMMON": "LOW", "EASY": "LOW", "ABUNDANT": "LOW",
    "MODERATE": "MEDIUM", "AVERAGE": "MEDIUM", "NORMAL": "MEDIUM",
    "SCARCE": "HIGH", "DIFFICULT": "HIGH", "COMPETITIVE": "HIGH",
    "VERY SCARCE": "VERY_HIGH", "EXTREMELY SCARCE": "VERY_HIGH", "CRITICAL": "VERY_HIGH",
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
  const range = max - min || 1;
  const medPct = Math.round(((median - min) / range) * 100);

  return (
    <div className="space-y-2">
      <div className="relative h-16">
        <div className="absolute inset-x-0 bottom-0 h-14 overflow-hidden rounded-md bg-muted">
          <svg viewBox="0 0 200 56" className="h-full w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="bell-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
                <stop offset="50%" stopColor="currentColor" stopOpacity="0.5" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.15" />
              </linearGradient>
            </defs>
            <path d="M0,56 C20,56 30,10 100,4 C170,10 180,56 200,56 Z" fill="url(#bell-grad)" className="text-primary" />
          </svg>
        </div>
        <div className="absolute bottom-0 top-0 w-0.5 bg-primary" style={{ left: `${medPct}%` }} />
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

/** Talent scarcity card — matches the compact skill-row design */
function TalentScarcityCard({ skills, overallReason }: { skills: SkillScarcity[]; overallReason: string }) {
  const scarceSkills = skills.filter(
    (s) => normalizeScarcity(s.level) === "HIGH" || normalizeScarcity(s.level) === "VERY_HIGH"
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-slate-500" />
        <div>
          <p className="text-sm font-bold text-slate-800">Talent Scarcity</p>
          <p className="text-[11px] text-slate-400">Skill availability in market</p>
        </div>
      </div>

      {/* Skill rows */}
      <div className="space-y-3">
        {skills.map((s) => {
          const cfg = SCARCITY_CONFIG[normalizeScarcity(s.level)];
          return (
            <div key={s.skill} className="flex items-center gap-3">
              {/* Skill name */}
              <span className="w-28 shrink-0 text-sm font-medium text-slate-700 truncate" title={s.skill}>
                {s.skill}
              </span>
              {/* Bar */}
              <div className="flex-1 h-2 rounded-full bg-slate-100">
                <div
                  className={`h-2 rounded-full transition-all ${cfg.barColor}`}
                  style={{ width: `${cfg.pct}%` }}
                />
              </div>
              {/* Label */}
              <span className={`w-20 shrink-0 text-right text-xs font-semibold ${cfg.textColor}`}>
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Warning callout for scarce skills */}
      {scarceSkills.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2.5 text-xs text-amber-800">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
          <span>
            {scarceSkills.map((s) => s.skill).join(", ")}{" "}
            {scarceSkills.length === 1 ? "skills are" : "skill is"} scarce — consider widening your search or relaxing requirements
          </span>
        </div>
      )}

      {/* Overall reason */}
      <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-3">{overallReason}</p>
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
      {/* Header */}
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
          Click Generate to get salary ranges, talent scarcity by skill, and hiring-manager talking points.
        </p>
      )}

      {intel && (
        <div className="grid gap-4 md:grid-cols-2">

          {/* ── Salary bell curve ── */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <p className="text-sm font-bold text-slate-800">Salary range</p>
            <BellCurve min={intel.salaryMin} median={intel.salaryMedian} max={intel.salaryMax} currency={intel.currency} />
            <p className="text-xs text-slate-500 italic">{intel.budgetReality}</p>
          </div>

          {/* ── Talent scarcity ── */}
          {intel.skillScarcity && intel.skillScarcity.length > 0 ? (
            <TalentScarcityCard skills={intel.skillScarcity} overallReason={intel.scarcityReason} />
          ) : (
            /* Fallback: overall-only card when AI didn't return skill breakdown */
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-slate-500" />
                <p className="text-sm font-bold text-slate-800">Profile scarcity</p>
              </div>
              {(() => {
                const cfg = SCARCITY_CONFIG[normalizeScarcity(intel.scarcity)];
                return (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-slate-100">
                        <div className={`h-2 rounded-full ${cfg.barColor}`} style={{ width: `${cfg.pct}%` }} />
                      </div>
                      <span className={`text-xs font-semibold ${cfg.textColor}`}>{cfg.label}</span>
                    </div>
                    <p className="text-xs text-slate-500">{intel.scarcityReason}</p>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ── Market insights ── */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-2 md:col-span-2">
            <p className="text-sm font-bold text-slate-800">Market insights</p>
            <ul className="space-y-1.5">
              {intel.insights.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-700">
                  <span className="mt-0.5 shrink-0 text-blue-500">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── HM talking points ── */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-2.5 md:col-span-2">
            <p className="flex items-center gap-2 text-sm font-bold text-amber-800">
              <AlertTriangle className="h-4 w-4" /> Hiring manager talking points
            </p>
            <ul className="space-y-2">
              {intel.hmTalkingPoints.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm text-amber-900">
                  <span className="shrink-0 font-bold mt-0.5">{i + 1}.</span>
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
