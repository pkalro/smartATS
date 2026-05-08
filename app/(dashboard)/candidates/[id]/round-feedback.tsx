"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, Minus, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
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
  GO:     { label: "Go",     color: "text-green-600 bg-green-50 border-green-200",  icon: <ThumbsUp className="h-3 w-3" /> },
  NO_GO:  { label: "No-go",  color: "text-red-600 bg-red-50 border-red-200",        icon: <ThumbsDown className="h-3 w-3" /> },
  MAYBE:  { label: "Maybe",  color: "text-amber-600 bg-amber-50 border-amber-200",  icon: <Minus className="h-3 w-3" /> },
  PENDING:{ label: "Pending",color: "text-slate-500 bg-slate-50 border-slate-200",  icon: <Minus className="h-3 w-3" /> },
};

export function RoundFeedback({
  applicationId,
  candidateId,
  feedbackList,
  roundOptions,
}: {
  applicationId: string;
  candidateId: string;
  feedbackList: Feedback[];
  roundOptions: string[]; // from job.interviewRounds
}) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [pending, start] = useTransition();
  const [round, setRound] = useState(roundOptions[0] ?? "");
  const [customRound, setCustomRound] = useState("");
  const [interviewer, setInterviewer] = useState("");
  const [decision, setDecision] = useState("PENDING");
  const [notes, setNotes] = useState("");
  const [nextStep, setNextStep] = useState("");

  const effectiveRound = round === "__custom__" ? customRound : round;

  const handleAdd = () => {
    if (!effectiveRound) return;
    const fd = new FormData();
    fd.set("applicationId", applicationId);
    fd.set("roundName", effectiveRound);
    fd.set("interviewerName", interviewer);
    fd.set("decision", decision);
    fd.set("notes", notes);
    fd.set("nextStep", nextStep);
    start(async () => {
      await addRoundFeedback(fd);
      setAdding(false);
      setInterviewer(""); setNotes(""); setNextStep(""); setDecision("PENDING");
    });
  };

  const handleDelete = (id: string) => {
    start(async () => { await deleteRoundFeedback(id, candidateId); });
  };

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-sm font-semibold"
      >
        <span>Interview feedback {feedbackList.length > 0 && <span className="ml-1 text-muted-foreground font-normal">({feedbackList.length} round{feedbackList.length !== 1 ? "s" : ""})</span>}</span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open && (
        <>
          {/* Existing feedback */}
          {feedbackList.length > 0 && (
            <div className="space-y-2">
              {feedbackList.map((fb) => {
                const cfg = DECISION_CONFIG[fb.decision] ?? DECISION_CONFIG.PENDING;
                return (
                  <div key={fb.id} className="rounded-md border bg-muted/20 p-3 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{fb.roundName}</span>
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.color}`}>
                            {cfg.icon}{cfg.label}
                          </span>
                        </div>
                        {fb.interviewerName && (
                          <div className="text-xs text-muted-foreground">Interviewer: {fb.interviewerName}</div>
                        )}
                        {fb.notes && <p className="text-muted-foreground">{fb.notes}</p>}
                        {fb.nextStep && (
                          <p className="text-xs text-blue-700 bg-blue-50 rounded px-2 py-0.5 inline-block">Next: {fb.nextStep}</p>
                        )}
                      </div>
                      <Button size="sm" variant="ghost" disabled={pending} onClick={() => handleDelete(fb.id)} className="shrink-0 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add feedback form */}
          {adding ? (
            <div className="space-y-3 rounded-md border p-3 bg-muted/10">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Round</label>
                  <select
                    value={round}
                    onChange={(e) => setRound(e.target.value)}
                    className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm"
                  >
                    {roundOptions.map((r) => <option key={r} value={r}>{r}</option>)}
                    <option value="__custom__">Other…</option>
                  </select>
                  {round === "__custom__" && (
                    <input
                      value={customRound}
                      onChange={(e) => setCustomRound(e.target.value)}
                      placeholder="Round name"
                      className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm mt-1"
                    />
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Interviewer (optional)</label>
                  <input
                    value={interviewer}
                    onChange={(e) => setInterviewer(e.target.value)}
                    placeholder="e.g. Priya M."
                    className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Decision</label>
                <div className="flex gap-2">
                  {(["GO", "MAYBE", "NO_GO", "PENDING"] as const).map((d) => {
                    const cfg = DECISION_CONFIG[d];
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDecision(d)}
                        className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                          decision === d ? cfg.color : "border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {cfg.icon}{cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What the interviewer said…"
                  rows={2}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Next step</label>
                <input
                  value={nextStep}
                  onChange={(e) => setNextStep(e.target.value)}
                  placeholder="e.g. Schedule panel round"
                  className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button size="sm" disabled={pending || !effectiveRound} onClick={handleAdd}>Save feedback</Button>
                <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
              <Plus className="h-3.5 w-3.5" /> Add round feedback
            </Button>
          )}
        </>
      )}
    </div>
  );
}
