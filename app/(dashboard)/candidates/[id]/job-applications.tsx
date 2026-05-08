"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Plus, Briefcase, RotateCcw, Sparkles, Loader2 } from "lucide-react";
import { updateApplicationStatus, addCandidateToJob, rejectWithReason, rescreenApplication } from "../actions";
import { dispatchAppSelected } from "./header-score-badge";
import type { CandidateStatus } from "@/lib/types";
import { STATUS_STYLES } from "@/lib/status-styles";

// ── Score card ──────────────────────────────────────────────────────────────
function ScoreCard({
  score, rationale, jobTitle, onAnalyse, analysing,
}: {
  score: number | null;
  rationale: string | null;
  jobTitle: string;
  onAnalyse?: () => void;
  analysing?: boolean;
}) {
  if (score == null) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 p-3">
        <p className="text-sm text-slate-600">
          No match score for <span className="font-medium text-slate-800">{jobTitle}</span>
        </p>
        <Button size="sm" disabled={analysing} onClick={onAnalyse}
          className="shrink-0 h-7 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 border-0 text-white text-xs hover:from-blue-700 hover:to-violet-700">
          {analysing ? <><Loader2 className="h-3 w-3 animate-spin" /> Analysing…</> : <><Sparkles className="h-3 w-3" /> Analyse match</>}
        </Button>
      </div>
    );
  }

  const color    = score >= 75 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-red-500";
  const barColor = score >= 75 ? "bg-emerald-500"   : score >= 50 ? "bg-amber-500"   : "bg-red-400";
  const label    = score >= 75 ? "Strong fit"        : score >= 50 ? "Partial fit"    : "Weak fit";

  const sentences = (rationale ?? "").split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  const good    = sentences.filter((s) => /strong|excellent|great|good|solid|impres|match|perfect|ideal|deep|proven|track record/i.test(s));
  const bad     = sentences.filter((s) => /lack|gap|missing|without|short|weak|limited|no\s|hasn't|haven't|not\s|below|junior|mismatch|overqualified/i.test(s));
  const neutral = sentences.filter((s) => !good.includes(s) && !bad.includes(s));

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Match · {jobTitle}</span>
        <span className={`text-2xl font-extrabold ${color}`}>
          {score}<span className="text-sm font-normal text-slate-400">/100</span>
        </span>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-slate-500">
          <span>{label}</span><span>{score}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-100">
          <div className={`h-2 rounded-full ${barColor} transition-all`} style={{ width: `${score}%` }} />
        </div>
      </div>

      {good.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Strengths</p>
          <ul className="space-y-1">
            {good.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="mt-0.5 shrink-0 text-emerald-600 font-bold">✓</span>
                {/* min-w-0 + break-words ensures long sentences wrap fully */}
                <span className="min-w-0 break-words leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {bad.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-bold uppercase tracking-wider text-red-600">Gaps</p>
          <ul className="space-y-1">
            {bad.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <span className="mt-0.5 shrink-0 text-red-500 font-bold">✗</span>
                {/* min-w-0 + break-words ensures text never clips */}
                <span className="min-w-0 break-words leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {neutral.length > 0 && (
        <ul className="space-y-1">
          {neutral.map((s, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-500">
              <span className="mt-0.5 shrink-0">•</span>
              <span className="min-w-0 break-words leading-relaxed">{s}</span>
            </li>
          ))}
        </ul>
      )}

      {onAnalyse && (
        <div className="pt-1 border-t border-slate-100">
          <Button size="sm" variant="ghost" disabled={analysing} onClick={onAnalyse}
            className="h-7 rounded-lg text-xs text-slate-500 hover:text-blue-600 hover:bg-blue-50 gap-1">
            {analysing ? <><Loader2 className="h-3 w-3 animate-spin" /> Re-analysing…</> : <><RotateCcw className="h-3 w-3" /> Re-analyse match</>}
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Types ───────────────────────────────────────────────────────────────────
type Application = {
  id: string;
  jobId: string;
  jobTitle: string;
  status: string;
  score: number | null;
  scoreRationale: string | null;
  currentRound: string | null;
  updatedAt: Date;
};

type Job = { id: string; title: string };

const ALL_STAGES: CandidateStatus[] = [
  "NEW", "SCREENING", "SHORTLISTED", "INTERVIEWING", "OFFER", "HIRED",
];

// ── Stage dropdown — replaces the cramped breadcrumb ────────────────────────
function StageDropdown({
  status,
  disabled,
  onMove,
}: {
  status: string;
  disabled: boolean;
  onMove: (s: CandidateStatus) => void;
}) {
  const isTerminal = status === "REJECTED" || status === "WITHDRAWN";
  if (isTerminal) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-slate-500">Move to stage:</span>
      <select
        disabled={disabled}
        value={status}
        onChange={(e) => onMove(e.target.value as CandidateStatus)}
        className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 cursor-pointer"
      >
        {ALL_STAGES.map((s) => (
          <option key={s} value={s}>
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export function JobApplications({
  candidateId,
  applications,
  availableJobs,
}: {
  candidateId: string;
  applications: Application[];
  availableJobs: Job[];
}) {
  const [selectedId, setSelectedId] = useState(applications[0]?.id ?? null);
  const [pending, start] = useTransition();
  const [adding, setAdding] = useState(false);
  const [addJobId, setAddJobId] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [unrejecting, setUnrejecting] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [analyseError, setAnalyseError] = useState<string | null>(null);
  // Optimistic score overrides — keyed by applicationId
  const [scoreOverrides, setScoreOverrides] = useState<Record<string, { score: number; rationale: string | null }>>({});

  const selected = applications.find((a) => a.id === selectedId) ?? applications[0];

  // Sync header score badge whenever the selected application or its score override changes
  useEffect(() => {
    if (!selected) return;
    const score = scoreOverrides[selected.id]?.score ?? selected.score ?? null;
    dispatchAppSelected(score, selected.jobTitle, selected.jobId);
  }, [selected?.id, scoreOverrides, selected?.score]); // eslint-disable-line react-hooks/exhaustive-deps

  const setStatus = (status: CandidateStatus) => {
    if (!selected) return;
    start(async () => { await updateApplicationStatus(selected.id, status); });
  };

  const handleAddJob = () => {
    if (!addJobId) return;
    setAddError(null);
    start(async () => {
      const r = await addCandidateToJob(candidateId, addJobId);
      if (r && "error" in r) setAddError(r.error ?? null);
      else { setAdding(false); setAddJobId(""); }
    });
  };

  const handleAnalyse = () => {
    if (!selected) return;
    setAnalyseError(null);
    setAnalysing(true);
    rescreenApplication(selected.id).then((r) => {
      if (r && "error" in r) { setAnalyseError(r.error ?? null); }
      else if (r && "score" in r) {
        setScoreOverrides((prev) => ({ ...prev, [selected.id]: { score: r.score, rationale: r.scoreRationale ?? null } }));
      }
    }).finally(() => setAnalysing(false));
  };

  const unappliedJobs = availableJobs.filter(
    (j) => !applications.find((a) => a.jobId === j.id),
  );

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600">
            <Briefcase className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-slate-800">
            Job applications <span className="text-slate-400 font-normal">({applications.length})</span>
          </span>
        </div>
        <Button size="sm" variant="outline" onClick={() => setAdding(!adding)}
          className="rounded-lg border-slate-200 text-slate-600 text-xs h-7 hover:bg-slate-50">
          <Plus className="h-3 w-3" /> Add to another role
        </Button>
      </div>

      {/* Add to job inline */}
      {adding && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 space-y-2">
          <p className="text-xs font-semibold text-blue-800">Add candidate to another active role</p>
          {unappliedJobs.length === 0 ? (
            <p className="text-xs text-blue-600 italic">This candidate is already linked to all your active jobs.</p>
          ) : (
            <div className="flex gap-2 items-center">
              <select value={addJobId} onChange={(e) => setAddJobId(e.target.value)}
                className="flex-1 h-8 rounded-lg border border-slate-200 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Select a job…</option>
                {unappliedJobs.map((j) => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
              <Button size="sm" disabled={!addJobId || pending} onClick={handleAddJob}
                className="h-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white border-0 text-xs">Add</Button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setAddJobId(""); setAddError(null); }} className="h-7 text-xs text-slate-500">Cancel</Button>
            {addError && <span className="text-xs text-red-600">{addError}</span>}
          </div>
        </div>
      )}

      {/* Job tabs */}
      {applications.length > 0 && (
        <div className="space-y-3">
          {/* Tab buttons */}
          <div className="flex flex-wrap gap-1.5">
            {applications.map((a) => (
              <button key={a.id} type="button" onClick={() => setSelectedId(a.id)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-all ${
                  selectedId === a.id
                    ? "border-blue-300 bg-blue-50 font-semibold text-blue-800"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {a.jobTitle}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold border ${STATUS_STYLES[a.status] ?? "bg-slate-100 text-slate-500"}`}>
                  {a.status.charAt(0) + a.status.slice(1).toLowerCase()}
                </span>
              </button>
            ))}
          </div>

          {selected && (
            <div className="space-y-3 rounded-xl bg-slate-50 p-3">

              {/* Stage dropdown */}
              {selected.status !== "REJECTED" && selected.status !== "WITHDRAWN" && (
                <StageDropdown status={selected.status} disabled={pending} onMove={setStatus} />
              )}

              {/* Score card */}
              {analyseError && <p className="text-xs text-red-600">{analyseError}</p>}
              <ScoreCard
                score={scoreOverrides[selected.id]?.score ?? selected.score}
                rationale={scoreOverrides[selected.id]?.rationale ?? selected.scoreRationale}
                jobTitle={selected.jobTitle}
                onAnalyse={handleAnalyse}
                analysing={analysing}
              />

              {/* Action row */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Reject */}
                {selected.status !== "REJECTED" && selected.status !== "HIRED" && !rejecting && (
                  <Button size="sm" variant="outline" disabled={pending} onClick={() => setRejecting(true)}
                    className="rounded-lg text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50 text-xs h-7">
                    <XCircle className="h-3.5 w-3.5" /> Reject
                  </Button>
                )}

                {/* Unreject — move back to screening */}
                {selected.status === "REJECTED" && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {!unrejecting ? (
                      <Button size="sm" variant="outline" disabled={pending} onClick={() => setUnrejecting(true)}
                        className="rounded-lg text-blue-600 border-blue-200 hover:bg-blue-50 text-xs h-7">
                        <RotateCcw className="h-3.5 w-3.5" /> Unreject
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 p-2">
                        <span className="text-xs text-blue-700 font-medium">Move back to:</span>
                        {(["SCREENING", "SHORTLISTED", "INTERVIEWING"] as CandidateStatus[]).map((s) => (
                          <Button key={s} size="sm" variant="outline" disabled={pending}
                            onClick={() => { setStatus(s); setUnrejecting(false); }}
                            className="h-7 rounded-lg text-xs border-slate-200 hover:bg-white">
                            {s.charAt(0) + s.slice(1).toLowerCase()}
                          </Button>
                        ))}
                        <Button size="sm" variant="ghost" onClick={() => setUnrejecting(false)} className="h-7 text-xs">Cancel</Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Withdrawn */}
                {selected.status !== "WITHDRAWN" && selected.status !== "HIRED" && selected.status !== "REJECTED" && (
                  <Button size="sm" variant="ghost" disabled={pending} onClick={() => setStatus("WITHDRAWN")}
                    className="rounded-lg text-xs h-7 text-slate-500">
                    Mark withdrawn
                  </Button>
                )}

                {/* Hired confirmation */}
                {selected.status === "OFFER" && (
                  <Button size="sm" disabled={pending} onClick={() => setStatus("HIRED")}
                    className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0 text-xs h-7 shadow-sm">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Mark hired
                  </Button>
                )}
              </div>

              {/* Reject reason form */}
              {rejecting && selected.status !== "REJECTED" && (
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
                  <span className="text-xs text-red-700 font-medium">Reason:</span>
                  <select value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                    className="h-7 rounded-lg border border-red-200 bg-white px-2 text-sm focus:outline-none"
                  >
                    <option value="">Pick reason…</option>
                    <option value="EXPERIENCE">Not enough experience</option>
                    <option value="OVERQUALIFIED">Overqualified</option>
                    <option value="COMPENSATION">Comp mismatch</option>
                    <option value="SKILLS">Skills gap</option>
                    <option value="CULTURE">Culture fit</option>
                    <option value="WITHDREW">Candidate withdrew</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <Button size="sm" variant="destructive" disabled={pending || !rejectReason}
                    className="h-7 rounded-lg text-xs"
                    onClick={() => {
                      if (!selected) return;
                      start(async () => {
                        await rejectWithReason(selected.id, rejectReason);
                        setRejecting(false);
                        setRejectReason("");
                      });
                    }}
                  >
                    Confirm reject
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setRejecting(false)} className="h-7 text-xs">Cancel</Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {applications.length === 0 && (
        <p className="text-sm text-slate-400 py-2">Not linked to any job yet.</p>
      )}
    </div>
  );
}
