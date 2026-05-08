"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { deleteCandidate } from "../actions";

export function DeleteCandidateButton({ candidateId, candidateName }: { candidateId: string; candidateName: string | null }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={() => setConfirming(true)}
        title="Delete candidate"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-1.5">
      <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
      <span className="text-xs text-destructive">
        Delete {candidateName ? `"${candidateName}"` : "this candidate"}? This can't be undone.
      </span>
      <Button
        type="button"
        size="sm"
        variant="destructive"
        className="h-6 text-xs px-2"
        disabled={pending}
        onClick={() => start(async () => { await deleteCandidate(candidateId); })}
      >
        {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Delete"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-6 text-xs px-2"
        onClick={() => setConfirming(false)}
      >
        Cancel
      </Button>
    </div>
  );
}
