"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Calendar, Check } from "lucide-react";
import { submitShareFeedback } from "./feedback-action";

type Decision = "UP" | "DOWN" | "INTERVIEW" | "PENDING";

const DECISIONS: { val: Decision; label: string; icon: React.ReactNode; color: string }[] = [
  { val: "UP",       label: "Looks good",    icon: <ThumbsUp className="h-4 w-4" />,   color: "border-green-300 bg-green-50 text-green-700 hover:bg-green-100" },
  { val: "DOWN",     label: "Not a fit",     icon: <ThumbsDown className="h-4 w-4" />, color: "border-red-300 bg-red-50 text-red-700 hover:bg-red-100" },
  { val: "INTERVIEW",label: "Want to meet",  icon: <Calendar className="h-4 w-4" />,   color: "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100" },
];

export function ShareFeedbackPanel({
  token,
  applicationId,
  existingDecision,
  existingNote,
  requireEmail,
}: {
  token: string;
  applicationId: string;
  existingDecision: string | null;
  existingNote: string | null;
  requireEmail: boolean;
}) {
  const [decision, setDecision] = useState<Decision>((existingDecision as Decision) ?? "PENDING");
  const [note, setNote] = useState(existingNote ?? "");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(!!existingDecision && existingDecision !== "PENDING");
  const [pending, start] = useTransition();

  const handleSubmit = () => {
    if (decision === "PENDING") return;
    if (requireEmail && !email) return;
    const fd = new FormData();
    fd.set("token", token);
    fd.set("applicationId", applicationId);
    fd.set("decision", decision);
    fd.set("note", note);
    fd.set("viewerEmail", email);
    start(async () => {
      await submitShareFeedback(fd);
      setSubmitted(true);
    });
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
        <Check className="h-4 w-4" />
        Feedback recorded — thank you!
        <button type="button" className="ml-auto text-xs underline opacity-70" onClick={() => setSubmitted(false)}>
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-md border bg-muted/20 p-3">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Your feedback</p>
      <div className="flex flex-wrap gap-2">
        {DECISIONS.map(({ val, label, icon, color }) => (
          <button
            key={val}
            type="button"
            onClick={() => setDecision(val)}
            className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
              decision === val ? color : "border-border hover:bg-muted"
            }`}
          >
            {icon}{label}
          </button>
        ))}
      </div>

      {decision !== "PENDING" && (
        <>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a comment (optional)…"
            rows={2}
            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm resize-none"
          />
          {requireEmail && (
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email (required)"
              type="email"
              className="w-full h-8 rounded-md border border-input bg-background px-3 text-sm"
            />
          )}
          <Button size="sm" disabled={pending || (requireEmail && !email)} onClick={handleSubmit}>
            Submit feedback
          </Button>
        </>
      )}
    </div>
  );
}
