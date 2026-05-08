"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/copy-button";
import { Sparkles, Loader2 } from "lucide-react";
import { generateManagerPulseAction as generateManagerPulse } from "./reports-actions";

type CandidateSummary = {
  id: string;
  name: string | null;
  status: string;
  score: number | null;
  noticePeriod: string | null;
  currentSalary: string | null;
  expectedSalary: string | null;
  job: { title: string } | null;
};

export function ManagerPulse({ candidates }: { candidates: CandidateSummary[] }) {
  const [pending, start] = useTransition();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <Button
        disabled={pending || candidates.length === 0}
        onClick={() => {
          setError(null);
          start(async () => {
            const r = await generateManagerPulse(null);
            if ("error" in r) setError(r.error ?? null);
            else setDraft(r.email);
          });
        }}
        title={candidates.length === 0 ? "Shortlist some candidates first" : undefined}
      >
        {pending ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
        ) : (
          <><Sparkles className="h-4 w-4" /> Generate pulse email</>
        )}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {candidates.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Shortlist some candidates to generate a pulse email.
        </p>
      )}
      {draft && (
        <div className="space-y-2">
          <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={14} className="font-mono text-sm" />
          <CopyButton text={draft} label="Copy email" />
        </div>
      )}
    </div>
  );
}
