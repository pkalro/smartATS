"use client";

import { useState, useTransition } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { updateRawJD } from "../actions";

export function EditableJD({ jobId, initialJD }: { jobId: string; initialJD: string }) {
  const [jd, setJd] = useState(initialJD);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dirty = jd !== initialJD;

  return (
    <div className="space-y-2">
      <Textarea
        value={jd}
        onChange={(e) => { setJd(e.target.value); setSaved(false); }}
        rows={16}
        className="font-mono text-sm"
      />
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          disabled={pending || !dirty}
          onClick={() => {
            setError(null);
            setSaved(false);
            start(async () => {
              const r = await updateRawJD(jobId, jd);
              if (r && "error" in r) setError(r.error ?? null);
              else setSaved(true);
            });
          }}
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save JD
        </Button>
        {saved && <span className="text-sm text-green-600">Saved!</span>}
        {error && <span className="text-sm text-destructive">{error}</span>}
        {dirty && !saved && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
      </div>
    </div>
  );
}
