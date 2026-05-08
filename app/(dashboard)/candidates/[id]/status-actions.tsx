"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { updateCandidateStatus } from "../actions";
import type { CandidateStatus } from "@/lib/types";

const STATUS_LABELS: Record<CandidateStatus, string> = {
  NEW: "New",
  SCREENING: "Screening",
  SHORTLISTED: "Shortlisted",
  INTERVIEWING: "Interviewing",
  OFFER: "Offer",
  HIRED: "Hired",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export function CandidateStatusActions({
  candidateId,
  status,
}: {
  candidateId: string;
  status: CandidateStatus;
}) {
  const [pending, start] = useTransition();

  const set = (s: CandidateStatus) =>
    start(async () => {
      await updateCandidateStatus(candidateId, s);
    });

  return (
    <div className="flex items-center gap-3 rounded-md border bg-muted/30 p-3">
      <Badge variant="secondary">{STATUS_LABELS[status] ?? status}</Badge>
      <span className="text-sm text-muted-foreground">Move to:</span>
      <div className="flex gap-2">
        <Button type="button" size="sm" variant={status === "SHORTLISTED" ? "default" : "outline"} disabled={pending} onClick={() => set("SHORTLISTED")}>
          <CheckCircle2 className="h-4 w-4" /> Shortlist
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => set("REJECTED")} className="text-red-600">
          <XCircle className="h-4 w-4" /> Reject
        </Button>
        {status !== "SCREENING" && (
          <Button type="button" size="sm" variant="ghost" disabled={pending} onClick={() => set("SCREENING")}>
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        )}
      </div>
    </div>
  );
}
