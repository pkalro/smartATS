"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Minus, Plus, Trash2 } from "lucide-react";
import { addRoundFeedback, deleteRoundFeedback } from "./round-feedback-actions";

type Feedback = {
  id: string;
  roundName: string;
  interviewerName: string | null;
  decision: string;
  notes: string | null;
  nextStep: string | null;
  createdAt: Date;
};

const DECISION_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  GO:      { label: "Go",      color: "text-emerald-700 bg-emerald-50 border-emerald-200",  icon: <ThumbsUp   className="h-3 w-3" /> },
  NO_GO:   { label: "No-go",   color: "text-red-600 bg-red-50 border-red-200",              icon: <ThumbsDown className="h-3 w-3" /> },
  MAYBE:   { label: "Maybe",   color: "text-amber-600 bg-amber-50 border-amber-200",        icon: <Minus      className="h-3 w-3" /> },
  PENDING: { label: "Pending", color: "text-slate-500 bg-slate-50 border-slate-200",        icon: <Minus      className="h-3 w-3" /> },
};

type Step = "idle" | "pick-round" | "fill-detail";

export function RoundFeedback({
  applicationId,
  candidateId,
  feedbackList,
  roundOptions,
}: {
  applicationId: string;
  candidateId: string;
  feedbackList: Feedback[];
  roundOptions: string[];
}) {
  const [pending, start] = useTransition();
  const [step, setStep] = useState<Step>("idle");

  // Step 1 — round picker
  const [round, setRound]           = useState(roundOptions[0] ?? "");
  const [customRound, setCustomRound] = useState("");

  // Step 2 — detail fields
  const [interviewer, setInterviewer] = useState("");
  const [decision, setDecision]       = useState<string>("PENDING");
  const [notes, setNotes]             = useState("");
  const [nextStep, setNextStep]       = useState("");

  const effectiveRound = round === "__custom__" ? customRound : round;

  function reset() {
    setStep("idle");
    setRound(roundOptions[0] ?? "");
    setCustomRound("");
    setInterviewer(""); setDecision("PENDING"); setNotes(""); setNextStep("");
  }

  function handleSave() {
    if (!effectiveRound) return;
    const fd = new FormData();
    fd.set("applicationId", applicationId);
    fd.set("roundName",      effectiveRound);
    fd.set("interviewerName", interviewer);
    fd.set("decision",        decision);
    fd.set("notes",           notes);
    fd.set("nextStep",        nextStep);
    start(async () => {
      await addRoundFeedback(fd);
      reset();
    });
  }

  function handleDelete(id: string) {
    start(async () => { await deleteRoundFeedback(id, candidateId); });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-500">
            <ThumbsUp className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-slate-800">
            Interview feedback
            {feedbackList.length > 0 && (
              <span className="ml-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                {feedbackList.length}
              </span>
            )}
          </span>
        </div>
        {step === "idle" && (
          <button
            onClick={() => setStep("pick-round")}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add feedback
          </button>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* ── Existing feedback cards ── */}
        {feedbackList.map((fb) => {
          const cfg = DECISION_CONFIG[fb.decision] ?? DECISION_CONFIG.PENDING;
          return (
            <div key={fb.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800 text-sm">{fb.roundName}</span>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${cfg.color}`}>
                      {cfg.icon}{cfg.label}
                    </span>
                  </div>
                  {fb.interviewerName && (
                    <p className="text-xs text-slate-500">Interviewer: {fb.interviewerName}</p>
                  )}
                  {fb.notes && (
                    <p className="text-sm text-slate-600 leading-relaxed">{fb.notes}</p>
                  )}
                  {fb.nextStep && (
                    <span className="inline-block rounded-md bg-blue-50 border border-blue-100 px-2 py-0.5 text-xs text-blue-700 font-medium">
                      Next: {fb.nextStep}
                    </span>
                  )}
                </div>
                <button
                  disabled={pending}
                  onClick={() => handleDelete(fb.id)}
                  className="shrink-0 rounded-md p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {/* ── Step 1: pick round ── */}
        {step === "pick-round" && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-3">
            <p className="text-sm font-semibold text-blue-900">Which interview round?</p>
            <div className="flex flex-wrap gap-2">
              {roundOptions.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setRound(r); setStep("fill-detail"); }}
                  className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  {r}
                </button>
              ))}
              <button
                type="button"
                onClick={() => { setRound("__custom__"); setStep("fill-detail"); }}
                className="rounded-lg border border-dashed border-blue-300 bg-white px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
              >
                Other…
              </button>
            </div>
            <Button size="sm" variant="ghost" onClick={reset} className="h-7 text-xs text-slate-500">
              Cancel
            </Button>
          </div>
        )}

        {/* ── Step 2: fill detail ── */}
        {step === "fill-detail" && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            {/* Round label + change */}
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-100 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800">
                {round === "__custom__" ? "Custom round" : effectiveRound}
              </span>
              <button
                type="button"
                onClick={() => setStep("pick-round")}
                className="text-xs text-slate-400 hover:text-blue-600 transition-colors"
              >
                Change round
              </button>
            </div>

            {/* Custom round name */}
            {round === "__custom__" && (
              <input
                value={customRound}
                onChange={(e) => setCustomRound(e.target.value)}
                placeholder="Round name (e.g. System Design)"
                className="w-full h-8 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            )}

            {/* Decision buttons */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Decision</label>
              <div className="flex gap-2 flex-wrap">
                {(["GO", "MAYBE", "NO_GO", "PENDING"] as const).map((d) => {
                  const cfg = DECISION_CONFIG[d];
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDecision(d)}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                        decision === d ? cfg.color : "border-slate-200 text-slate-500 hover:bg-white"
                      }`}
                    >
                      {cfg.icon}{cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interviewer */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Interviewer <span className="font-normal normal-case">(optional)</span></label>
              <input
                value={interviewer}
                onChange={(e) => setInterviewer(e.target.value)}
                placeholder="e.g. Priya M."
                className="w-full h-8 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What the interviewer observed…"
                rows={3}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Next step */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Next step <span className="font-normal normal-case">(optional)</span></label>
              <input
                value={nextStep}
                onChange={(e) => setNextStep(e.target.value)}
                placeholder="e.g. Schedule panel round"
                className="w-full h-8 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                disabled={pending || !effectiveRound}
                onClick={handleSave}
                className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 border-0 text-white hover:from-blue-700 hover:to-violet-700 text-xs h-8"
              >
                {pending ? "Saving…" : "Save feedback"}
              </Button>
              <Button size="sm" variant="ghost" onClick={reset} className="h-8 text-xs text-slate-500">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {feedbackList.length === 0 && step === "idle" && (
          <p className="text-sm text-slate-400 py-1">No interview feedback yet.</p>
        )}
      </div>
    </div>
  );
}
