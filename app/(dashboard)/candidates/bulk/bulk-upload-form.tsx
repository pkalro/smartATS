"use client";

import { useState, useRef, useTransition, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertCircle, Play } from "lucide-react";
import { Icon } from "@/components/icons/icon";
import { startBulkUpload, getBulkJob, triggerBulkAnalysis } from "./bulk-actions";
import Link from "next/link";

type Job = { id: string; title: string };
type ItemStatus = "PENDING" | "QUEUED" | "PROCESSING" | "DONE" | "FAILED" | "SKIPPED_QUOTA";

type BulkItem = {
  id: string;
  filename: string;
  status: ItemStatus;
  candidateId: string | null;
  errorMsg: string | null;
};

type BulkJob = {
  id: string;
  totalCount: number;
  doneCount: number;
  status: string;
  items: BulkItem[];
};

const ITEM_ICON: Record<ItemStatus, React.ReactNode> = {
  PENDING:      <div className="h-4 w-4 rounded-full border-2 border-slate-300" />,
  QUEUED:       <div className="h-4 w-4 rounded-full border-2 border-blue-300 bg-blue-50" />,
  PROCESSING:   <Icon name="loader" size={4} className="animate-spin text-blue-500" />,
  DONE:         <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  FAILED:       <XCircle className="h-4 w-4 text-red-500" />,
  SKIPPED_QUOTA:<AlertCircle className="h-4 w-4 text-amber-500" />,
};

const ITEM_BG: Record<ItemStatus, string> = {
  PENDING:      "bg-slate-50 border-slate-200",
  QUEUED:       "bg-blue-50 border-blue-200",
  PROCESSING:   "bg-blue-50 border-blue-300",
  DONE:         "bg-emerald-50 border-emerald-200",
  FAILED:       "bg-red-50 border-red-200",
  SKIPPED_QUOTA:"bg-amber-50 border-amber-200",
};

export function BulkUploadForm({ jobs }: { jobs: Job[] }) {
  const [files, setFiles] = useState<File[]>([]);
  const [jobId, setJobId] = useState("");
  const [dragging, setDragging] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [bulkJob, setBulkJob] = useState<BulkJob | null>(null);
  const [polling, setPolling] = useState(false);
  // Step tracking: "select" → "uploaded" (queued, ready to analyse) → "analysing" → "done"
  const [step, setStep] = useState<"select" | "uploaded" | "analysing" | "done">("select");
  const inputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const valid = Array.from(incoming).filter((f) => f.name.match(/\.(pdf|docx|txt)$/i));
    setFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      return [...prev, ...valid.filter((f) => !names.has(f.name))].slice(0, 25);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const startPoll = useCallback((jobId: string) => {
    setPolling(true);
    pollRef.current = setInterval(async () => {
      const job = await getBulkJob(jobId);
      if (!job) return;
      setBulkJob(job as BulkJob);
      if (job.status === "DONE" || job.status === "FAILED") {
        clearInterval(pollRef.current!);
        setPolling(false);
        setStep("done");
      }
    }, 2000);
  }, []);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  // Step 1: Upload files to DB (no AI yet)
  const handleUpload = () => {
    if (files.length === 0) return;
    setError(null);
    const fd = new FormData();
    if (jobId) fd.set("jobId", jobId);
    for (const f of files) fd.append("files", f);
    start(async () => {
      const res = await startBulkUpload(fd);
      if ("error" in res) { setError(res.error ?? null); return; }
      const job = await getBulkJob(res.jobId);
      if (job) setBulkJob(job as BulkJob);
      setStep("uploaded");
    });
  };

  // Step 2: Trigger AI analysis
  // Fire the server action (which processes all files inline) AND
  // immediately start polling so the UI shows per-file progress as
  // the DB gets updated during processing.
  const handleAnalyse = () => {
    if (!bulkJob) return;
    setError(null);
    // Switch to "analysing" view and start polling right away
    setStep("analysing");
    startPoll(bulkJob.id);
    // Server action runs concurrently — useTransition keeps pending=true
    // while it's running; polling reflects DB state in near-real-time
    start(async () => {
      await triggerBulkAnalysis(bulkJob.id);
      // After action completes, do one final poll to get the terminal state
      const finalJob = await getBulkJob(bulkJob.id);
      if (finalJob) setBulkJob(finalJob as BulkJob);
    });
  };

  const done = bulkJob?.items.filter((i) => i.status === "DONE").length ?? 0;
  const failed = bulkJob?.items.filter((i) => ["FAILED", "SKIPPED_QUOTA"].includes(i.status)).length ?? 0;
  const progress = bulkJob ? Math.round((bulkJob.doneCount / bulkJob.totalCount) * 100) : 0;

  // ── Step 1: File selection ──────────────────────────────────────────────
  if (step === "select") {
    return (
      <div className="space-y-5">
        {/* Job selector */}
        {jobs.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
            <label className="text-sm font-semibold text-slate-800">Score against a job (optional)</label>
            <select value={jobId} onChange={(e) => setJobId(e.target.value)}
              className="w-full h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">No job — screen without scoring</option>
              {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
            </select>
            <p className="text-xs text-slate-400">Each resume will get a 0–100 match score against the selected role.</p>
          </div>
        )}

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-12 transition-all ${
            dragging
              ? "border-blue-400 bg-blue-50 scale-[1.01]"
              : "border-slate-300 bg-white hover:border-blue-300 hover:bg-blue-50/50"
          }`}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-md">
            <Icon name="upload" size={7} className="text-white" />
          </div>
          <div className="text-center">
            <p className="font-bold text-slate-800">Drop resumes here or click to browse</p>
            <p className="text-sm text-slate-500 mt-1">PDF, DOCX, or TXT · up to 25 files</p>
          </div>
          <input ref={inputRef} type="file" multiple accept=".pdf,.docx,.txt" className="hidden"
            onChange={(e) => addFiles(e.target.files)} />
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-800">{files.length} file{files.length !== 1 ? "s" : ""} selected</span>
              <button type="button" onClick={() => setFiles([])}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors">Clear all</button>
            </div>
            <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
              {files.map((f) => (
                <div key={f.name} className="flex items-center gap-3 px-4 py-2.5">
                  <Icon name="briefcase" size={4} className="text-slate-400 shrink-0" />
                  <span className="flex-1 truncate text-sm text-slate-700">{f.name}</span>
                  <span className="text-xs text-slate-400">{(f.size / 1024).toFixed(0)} KB</span>
                  <button type="button" onClick={() => setFiles((p) => p.filter((x) => x.name !== f.name))}
                    className="text-slate-300 hover:text-red-500 transition-colors">
                    <XCircle className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <Button
          disabled={files.length === 0 || pending}
          onClick={handleUpload}
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 border-0 text-white h-11 font-semibold shadow-md"
        >
          {pending
            ? <><Icon name="loader" size={4} className="animate-spin" /> Uploading…</>
            : <><Icon name="upload" size={4} /> Upload {files.length > 0 ? files.length : ""} resume{files.length !== 1 ? "s" : ""}</>
          }
        </Button>
      </div>
    );
  }

  // ── Step 2: Files uploaded — ready to analyse ──────────────────────────
  if (step === "uploaded" && bulkJob) {
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 flex items-start gap-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-emerald-800">{bulkJob.totalCount} resume{bulkJob.totalCount !== 1 ? "s" : ""} uploaded and ready</p>
            <p className="text-sm text-emerald-700 mt-0.5">
              Click "Start AI analysis" to screen{jobId ? " against the selected job" : " without scoring"}.
              {jobId ? " Each resume gets a 0–100 match score." : ""}
            </p>
          </div>
        </div>

        {/* File preview */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden divide-y divide-slate-50 max-h-64 overflow-y-auto">
          {bulkJob.items.map((item) => (
            <div key={item.id} className={`flex items-center gap-3 px-4 py-2.5 border ${ITEM_BG["PENDING"]}`}>
              {ITEM_ICON["PENDING"]}
              <span className="flex-1 truncate text-sm text-slate-700">{item.filename}</span>
              <span className="text-[11px] text-slate-400 font-medium">Ready</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button onClick={handleAnalyse} disabled={pending}
            className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 border-0 text-white h-11 font-semibold shadow-md"
          >
            {pending
              ? <><Icon name="loader" size={4} className="animate-spin" /> Starting…</>
              : <><Play className="h-4 w-4" /> Start AI analysis</>
            }
          </Button>
          <Button variant="outline" onClick={() => { setBulkJob(null); setFiles([]); setStep("select"); }}
            className="rounded-xl border-slate-200 h-11">
            Start over
          </Button>
        </div>
      </div>
    );
  }

  // ── Step 3 & 4: Analysing / done ───────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Progress header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900">
              {step === "done" ? "Analysis complete" : `Analysing ${bulkJob?.totalCount ?? 0} resumes…`}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {done} done · {failed} issues · {(bulkJob?.totalCount ?? 0) - done - failed} remaining
            </p>
          </div>
          {polling && <Icon name="loader" size={5} className="animate-spin text-slate-400" />}
          {step === "done" && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-400">
            <span>{progress}% complete</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100">
            <div className={`h-2 rounded-full transition-all ${step === "done" ? "bg-emerald-500" : "bg-gradient-to-r from-blue-500 to-violet-500"}`}
              style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Per-file list */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden divide-y divide-slate-50 max-h-96 overflow-y-auto">
        {bulkJob?.items.map((item) => (
          <div key={item.id} className={`flex items-center gap-3 px-4 py-2.5 border ${ITEM_BG[item.status] ?? ""}`}>
            {ITEM_ICON[item.status]}
            <span className="flex-1 truncate text-sm text-slate-700">{item.filename}</span>
            {item.status === "DONE" && item.candidateId && (
              <Link href={`/candidates/${item.candidateId}`}
                className="shrink-0 text-xs text-blue-600 hover:underline font-medium">View →</Link>
            )}
            {(item.status === "FAILED" || item.status === "SKIPPED_QUOTA") && (
              <span className="text-xs text-red-600 truncate max-w-[180px]" title={item.errorMsg ?? ""}>
                {item.status === "SKIPPED_QUOTA" ? "Quota exceeded" : (item.errorMsg ?? "Failed")}
              </span>
            )}
          </div>
        ))}
      </div>

      {step === "done" && (
        <div className="flex gap-3">
          <Button asChild className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 border-0 text-white h-10 font-semibold">
            <Link href="/candidates">View all candidates</Link>
          </Button>
          <Button variant="outline" onClick={() => { setBulkJob(null); setFiles([]); setStep("select"); }}
            className="rounded-xl border-slate-200 h-10">
            Upload more
          </Button>
        </div>
      )}
    </div>
  );
}
