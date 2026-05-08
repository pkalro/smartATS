"use client";

import { useState, useTransition } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Sparkles, FileText, ClipboardList } from "lucide-react";
import { createCandidate } from "../actions";

type InputMode = "file" | "notes";

export function CandidateForm({
  jobs,
  defaultJobId,
}: {
  jobs: { id: string; title: string }[];
  defaultJobId: string | null;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string>(defaultJobId ?? "none");
  const [mode, setMode] = useState<InputMode>("file");

  return (
    <form
      action={(fd) => {
        setError(null);
        if (jobId !== "none") fd.set("jobId", jobId);
        else fd.delete("jobId");
        // Clear the field we're not using so the action doesn't pick up stale values
        if (mode === "file") fd.delete("notes");
        else fd.delete("file");
        start(async () => {
          const r = await createCandidate(fd);
          if (r && "error" in r) {
            setError(r.error);
            setExistingId("existingId" in r ? (r.existingId as string) : null);
          }
        });
      }}
      className="space-y-5"
    >
      {/* Job selector */}
      <div className="space-y-2">
        <Label>Score against job <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <Select value={jobId} onValueChange={setJobId}>
          <SelectTrigger>
            <SelectValue placeholder="No job — extract only" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No job — extract only</SelectItem>
            {jobs.map((j) => (
              <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Pick a job to get a 0–100 match score with strengths and gaps.
        </p>
      </div>

      {/* Source */}
      <div className="space-y-2">
        <Label htmlFor="source">Where did you find them?</Label>
        <select
          id="source"
          name="source"
          className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="INBOUND">Applied / Inbound</option>
          <option value="LINKEDIN">LinkedIn</option>
          <option value="NAUKRI">Naukri</option>
          <option value="REFERRAL">Referral</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {/* Mode toggle */}
      <div className="space-y-3">
        <Label>Resume source</Label>
        <div className="grid grid-cols-2 gap-2 rounded-lg border p-1 bg-muted/30">
          <button
            type="button"
            onClick={() => setMode("file")}
            className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              mode === "file"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="h-4 w-4" />
            Upload file
          </button>
          <button
            type="button"
            onClick={() => setMode("notes")}
            className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              mode === "notes"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            Paste notes
          </button>
        </div>

        {mode === "file" ? (
          <div className="space-y-1.5">
            <Input
              id="file"
              type="file"
              name="file"
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">PDF, DOCX, or TXT — up to 10 MB.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Textarea
              id="notes"
              name="notes"
              placeholder="Paste your screening call notes — name, current role, salary expectations, notice period, key experience, red flags, anything."
              rows={9}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              AI will extract a structured candidate profile from your notes.
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-destructive space-y-1 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2">
          <p>{error}</p>
          {existingId && (
            <a href={`/candidates/${existingId}`} className="underline font-medium">
              View existing candidate →
            </a>
          )}
        </div>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Screening…</>
        ) : (
          <><Sparkles className="h-4 w-4" /> Extract & score</>
        )}
      </Button>
    </form>
  );
}
