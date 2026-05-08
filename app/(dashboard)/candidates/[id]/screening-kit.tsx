"use client";

import { useState, useTransition, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/copy-button";
import { Sparkles, Loader2, MessageSquare, Mail } from "lucide-react";
import { generateKit } from "./screening-actions";
import type { AppScoreEvent } from "./header-score-badge";

type KitData = {
  pitchDeck: string | null;
  gapAnalysis: string | null;
  screeningQuestions: string;
  recruiterNotes: string | null;
  processEmail: string | null;
  processWhatsapp: string | null;
};

function parseJsonArr(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const p = JSON.parse(raw);
    if (Array.isArray(p)) return p.filter((x): x is string => typeof x === "string");
  } catch { /* empty */ }
  // plain string fallback (old data): split into sentences
  return raw.split(/(?<=[.!?])\s+/).filter(Boolean);
}

function BulletList({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={`space-y-1.5 text-sm ${className ?? ""}`}>
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 leading-relaxed">
          <span className="mt-0.5 shrink-0 text-muted-foreground">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function ScreeningKit({
  candidateId,
  hasJob,
  jobTitle: initialJobTitle,
  initialJobId,
  kit,
}: {
  candidateId: string;
  hasJob: boolean;
  jobTitle?: string | null;
  initialJobId?: string | null;
  kit: KitData;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(initialJobId ?? null);
  const [selectedJobTitle, setSelectedJobTitle] = useState<string | null>(initialJobTitle ?? null);

  // Listen for job tab changes from the Pipeline tab
  useEffect(() => {
    const handler = (e: Event) => {
      const { jobId, jobTitle } = (e as CustomEvent<AppScoreEvent>).detail;
      setSelectedJobId(jobId);
      setSelectedJobTitle(jobTitle);
    };
    window.addEventListener("candidate:app-selected", handler);
    return () => window.removeEventListener("candidate:app-selected", handler);
  }, []);

  const effectiveHasJob = hasJob || !!selectedJobId;
  const pitchPoints = parseJsonArr(kit.pitchDeck);
  const gapPoints = parseJsonArr(kit.gapAnalysis);
  const questions = parseJsonArr(kit.screeningQuestions);
  const notePoints = parseJsonArr(kit.recruiterNotes);
  const hasKit = pitchPoints.length > 0 || gapPoints.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Screening Kit</h2>
          {selectedJobTitle
            ? <p className="text-xs text-muted-foreground">Will generate for: <span className="font-medium text-slate-700">{selectedJobTitle}</span></p>
            : initialJobTitle
              ? <p className="text-xs text-muted-foreground">Generated for: {initialJobTitle}</p>
              : null}
        </div>
        <Button
          size="sm"
          disabled={pending || !effectiveHasJob}
          onClick={() => {
            setError(null);
            start(async () => {
              const r = await generateKit(candidateId, selectedJobId);
              if (r && "error" in r) setError(r.error ?? null);
            });
          }}
          title={!effectiveHasJob ? "Select a job in the Pipeline tab first" : undefined}
        >
          {pending ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
          ) : (
            <><Sparkles className="h-4 w-4" /> {hasKit ? "Regenerate kit" : "Generate kit"}</>
          )}
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      {!effectiveHasJob && (
        <p className="text-sm text-muted-foreground">
          Select a job in the Pipeline tab to generate a screening kit.
        </p>
      )}

      {hasKit && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Pitch deck</CardTitle>
              <CardDescription>Use this to pitch the role to the candidate.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <BulletList items={pitchPoints} />
              {kit.pitchDeck && (
                <CopyButton text={pitchPoints.map((p) => `• ${p}`).join("\n")} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Gap analysis</CardTitle>
              <CardDescription>Matches and gaps vs the JD.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5 text-sm">
                {gapPoints.map((item, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed">
                    <span className={`mt-0.5 shrink-0 font-bold ${item.startsWith("✓") ? "text-green-600" : item.startsWith("✗") ? "text-destructive" : "text-muted-foreground"}`}>
                      {item.startsWith("✓") || item.startsWith("✗") ? "" : "•"}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Screening questions</CardTitle>
              <CardDescription>Tailored to this candidate.</CardDescription>
            </CardHeader>
            <CardContent>
              {questions.length > 0 ? (
                <ol className="space-y-2 text-sm list-decimal list-inside">
                  {questions.map((q, i) => (
                    <li key={i} className="leading-relaxed">{q}</li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted-foreground">No questions yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recruiter notes</CardTitle>
              <CardDescription>Internal — how to position this candidate.</CardDescription>
            </CardHeader>
            <CardContent>
              <BulletList items={notePoints} />
            </CardContent>
          </Card>
        </div>
      )}

      {(kit.processEmail || kit.processWhatsapp) && (
        <div className="grid gap-4 md:grid-cols-2">
          {kit.processEmail && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4" /> Process email
                </CardTitle>
                <CardDescription>Email explaining the interview process.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{kit.processEmail}</p>
                <CopyButton text={kit.processEmail} />
              </CardContent>
            </Card>
          )}
          {kit.processWhatsapp && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <MessageSquare className="h-4 w-4" /> Process message (WhatsApp)
                </CardTitle>
                <CardDescription>Short version for WhatsApp.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{kit.processWhatsapp}</p>
                <CopyButton text={kit.processWhatsapp} />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
