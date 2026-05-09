"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ExportCsvButton, CopyTsvButton } from "./export-csv";
import type { ExportRow } from "./export-csv";
import { generateManagerPulseAction } from "./reports-actions";
import { UserCheck } from "lucide-react";
import { Icon } from "@/components/icons/icon";

export interface FunnelStage { status: string; count: number }
export interface JobBreakdown { jobId: string; title: string; status: string; counts: Record<string, number> }
export interface SourceBreakdown { source: string; count: number }

export interface ReportsClientProps {
  totalCandidates: number;
  activeInPipeline: number;
  hired: number;
  avgScore: number;
  funnelStages: FunnelStage[];
  jobBreakdown: JobBreakdown[];
  sourceBreakdown: SourceBreakdown[];
  exportRows: ExportRow[];
  jobs: { id: string; title: string }[];
}

const FUNNEL_COLORS: Record<string, string> = {
  NEW: "bg-slate-400",
  SCREENING: "bg-blue-500",
  SHORTLISTED: "bg-violet-500",
  INTERVIEWING: "bg-amber-500",
  OFFER: "bg-orange-500",
  HIRED: "bg-emerald-500",
};

const PIPELINE_STATUSES = ["NEW", "SCREENING", "SHORTLISTED", "INTERVIEWING", "OFFER", "HIRED"];

function OverviewTab({ totalCandidates, activeInPipeline, hired, avgScore, funnelStages, jobBreakdown, sourceBreakdown }: Omit<ReportsClientProps, "exportRows" | "jobs">) {
  const maxCount = Math.max(...funnelStages.map((s) => s.count), 1);
  const totalsRow = PIPELINE_STATUSES.reduce<Record<string, number>>((acc, s) => {
    acc[s] = jobBreakdown.reduce((sum, j) => sum + (j.counts[s] ?? 0), 0);
    return acc;
  }, {});
  const grandTotal = Object.values(totalsRow).reduce((a, b) => a + b, 0);

  const stats = [
    { label: "Total Screened", value: totalCandidates, icon: <Icon name="users" size={5} />, gradient: "from-blue-500 to-cyan-500" },
    { label: "Active in Pipeline", value: activeInPipeline, icon: <Icon name="trending-up" size={5} />, gradient: "from-violet-500 to-purple-500" },
    { label: "Hired", value: hired, icon: <UserCheck className="h-5 w-5" />, gradient: "from-emerald-500 to-teal-500" },
    { label: "Avg Match Score", value: avgScore > 0 ? avgScore : "—", icon: <Icon name="star" size={5} />, gradient: "from-amber-500 to-orange-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${s.gradient} text-white shadow-sm`}>{s.icon}</div>
            <div className="text-2xl font-extrabold text-slate-900">{s.value}</div>
            <div className="text-sm text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Funnel */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-1">Pipeline Funnel</h3>
        <p className="text-sm text-slate-500 mb-5">Unique candidates per stage</p>
        <div className="space-y-3">
          {funnelStages.map((stage) => (
            <div key={stage.status} className="flex items-center gap-3">
              <span className="w-28 text-[11px] font-bold uppercase tracking-wider text-slate-500 text-right shrink-0">
                {stage.status.charAt(0) + stage.status.slice(1).toLowerCase()}
              </span>
              <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${FUNNEL_COLORS[stage.status] ?? "bg-slate-400"}`}
                  style={{ width: `${(stage.count / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-8 text-sm font-semibold text-slate-700 tabular-nums text-right shrink-0">{stage.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Source breakdown */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-4">Source Breakdown</h3>
        <div className="flex flex-wrap gap-2">
          {sourceBreakdown.map((s) => (
            <div key={s.source} className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
              <span className="text-sm text-slate-600">{s.source.charAt(0) + s.source.slice(1).toLowerCase()}</span>
              <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-xs font-bold text-slate-700">{s.count}</span>
            </div>
          ))}
          {sourceBreakdown.length === 0 && <p className="text-sm text-slate-400">No source data yet.</p>}
        </div>
      </div>

      {/* Per-job breakdown */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Per-Job Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Job</th>
                {PIPELINE_STATUSES.map((s) => (
                  <th key={s} className="text-center px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </th>
                ))}
                <th className="text-center px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {jobBreakdown.map((job) => {
                const rowTotal = Object.values(job.counts).reduce((a, b) => a + b, 0);
                return (
                  <tr key={job.jobId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3">
                      <span className="font-semibold text-slate-800">{job.title}</span>
                      <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${job.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {job.status.charAt(0) + job.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    {PIPELINE_STATUSES.map((s) => {
                      const v = job.counts[s] ?? 0;
                      return <td key={s} className={`px-3 py-3 text-center tabular-nums ${v === 0 ? "text-slate-300" : "text-slate-600"}`}>{v === 0 ? "—" : v}</td>;
                    })}
                    <td className="px-3 py-3 text-center font-bold text-slate-900 tabular-nums">{rowTotal}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50">
                <td className="px-6 py-3 text-sm font-bold text-slate-700">Totals</td>
                {PIPELINE_STATUSES.map((s) => {
                  const v = totalsRow[s] ?? 0;
                  return <td key={s} className={`px-3 py-3 text-center font-bold tabular-nums ${v === 0 ? "text-slate-300" : "text-slate-700"}`}>{v === 0 ? "—" : v}</td>;
                })}
                <td className="px-3 py-3 text-center font-extrabold text-slate-900 tabular-nums">{grandTotal}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

function ExportTab({ exportRows, jobs }: { exportRows: ExportRow[]; jobs: { id: string; title: string }[] }) {
  const [selectedJobId, setSelectedJobId] = useState<string>("all");
  const filtered = selectedJobId === "all" ? exportRows : exportRows.filter((r) => {
    const job = jobs.find((j) => j.title === r.jobTitle);
    return job?.id === selectedJobId;
  });
  const preview = filtered.slice(0, 20);
  const today = new Date().toISOString().slice(0, 10);
  const filename = `smartats-export-${today}.csv`;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <select value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)}
          className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="all">All roles</option>
          {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
        <div className="flex gap-2">
          <ExportCsvButton rows={filtered} filename={filename} />
          <CopyTsvButton rows={filtered} />
        </div>
        <span className="ml-auto text-xs text-slate-400 font-medium">{filtered.length} rows</span>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Preview</h3>
          <span className="text-xs text-slate-400">{preview.length} of {filtered.length} rows shown</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Name","Job","Status","Score","Source","Notice","Current Salary","Expected Salary","Location"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {preview.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-slate-800 whitespace-nowrap">{row.candidateName}</td>
                  <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{row.jobTitle}</td>
                  <td className="px-4 py-2.5">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">{row.applicationStatus}</span>
                  </td>
                  <td className="px-4 py-2.5 tabular-nums text-slate-600">{row.score ?? "—"}</td>
                  <td className="px-4 py-2.5 text-slate-500">{row.source}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-slate-500">{row.noticePeriod || "—"}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-slate-500">{row.currentSalary || "—"}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-slate-500">{row.expectedSalary || "—"}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-slate-500">{row.location || "—"}</td>
                </tr>
              ))}
              {preview.length === 0 && (
                <tr><td colSpan={9} className="py-10 text-center text-sm text-slate-400">No rows to display.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ManagerPulseTab({ jobs }: { jobs: { id: string; title: string }[] }) {
  const [selectedJobId, setSelectedJobId] = useState<string>("all");
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  function handleGenerate() {
    setError("");
    startTransition(async () => {
      const res = await generateManagerPulseAction(selectedJobId === "all" ? null : selectedJobId);
      if (res.error) setError(res.error);
      else setResult(res.email ?? "");
    });
  }

  function handleCopy() {
    navigator.clipboard.writeText(result).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <p className="text-sm text-slate-500">Generate a plain-English hiring update email for your manager or client — summarising pipeline status for one or all roles.</p>
        <div className="flex items-center gap-3 flex-wrap">
          <select value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)}
            className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All active roles</option>
            {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
          <Button onClick={handleGenerate} disabled={isPending}
            className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 border-0 text-white shadow-sm"
          >
            <Icon name="sparkles" size={3.5} />
            {isPending ? "Generating…" : "Generate pulse email"}
          </Button>
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      </div>

      {result && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Generated email</h3>
            <Button variant="outline" size="sm" onClick={handleCopy} className="rounded-lg border-slate-200 text-sm gap-1.5">
              {copied ? <><Icon name="check" size={3.5} className="text-emerald-600" />Copied!</> : <><Icon name="copy" size={3.5} />Copy</>}
            </Button>
          </div>
          <textarea
            className="w-full h-72 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-mono text-slate-700 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            value={result}
            onChange={(e) => setResult(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}

type Tab = "overview" | "export" | "pulse";

export function ReportsClient(props: ReportsClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <Icon name="bar-chart" size={4} /> },
    { key: "export",   label: "Export",   icon: <Icon name="download" size={4} /> },
    { key: "pulse",    label: "Manager Pulse", icon: <Icon name="sparkles" size={4} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-200">
          <Icon name="bar-chart" size={5} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Reports</h1>
          <p className="text-sm text-slate-500">Pipeline analytics, exports, and manager updates.</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm w-fit">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
          >
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "overview" && (
        <OverviewTab totalCandidates={props.totalCandidates} activeInPipeline={props.activeInPipeline} hired={props.hired} avgScore={props.avgScore} funnelStages={props.funnelStages} jobBreakdown={props.jobBreakdown} sourceBreakdown={props.sourceBreakdown} />
      )}
      {activeTab === "export" && <ExportTab exportRows={props.exportRows} jobs={props.jobs} />}
      {activeTab === "pulse" && <ManagerPulseTab jobs={props.jobs} />}
    </div>
  );
}
