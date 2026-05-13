import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/copy-button";
import {
  ArrowLeft, RefreshCw, Copy, Power,
  Building2, Tag, Globe, MapPin, Briefcase, Plus,
  Search, ExternalLink, Linkedin,
} from "lucide-react";
import { reanalyzeJob, cloneJob, toggleJobStatus } from "../actions";
import { IntakeDetailsForm } from "./intake-details-form";
import { GenerateJD } from "./generate-jd";
import { EditableJD } from "./editable-jd";
import { ShareShortlist } from "./share-shortlist";
import { MarketIntelligencePanel } from "./market-intelligence";
import { SilverMedalistsPanel } from "./silver-medalists";
import { JobTabs } from "./job-tabs";
import { TargetCompaniesCard } from "./target-companies-card";
import { JobCandidatesTable } from "./job-candidates-table";
import type { MarketIntelligence } from "@/lib/ai/market";
import type { SilverMedalist } from "./silver-medalists";

function parseArr(raw: string | null | undefined): unknown[] {
  if (!raw) return [];
  try { const p = JSON.parse(raw); return Array.isArray(p) ? p : []; }
  catch { return []; }
}
function parseStrArr(raw: string | null | undefined): string[] {
  return parseArr(raw).filter((x): x is string => typeof x === "string");
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;
  const job = await prisma.job.findFirst({
    where: { id, userId: session!.user.id },
    include: {
      // Path A: candidates linked via CandidateJobApplication (join table)
      candidateApplications: {
        orderBy: [{ score: "desc" }, { createdAt: "desc" }],
        take: 50,
        include: {
          candidate: {
            select: {
              id: true,
              name: true,
              currentTitle: true,
              noticePeriod: true,
              currentSalary: true,
            },
          },
        },
      },
      // Path B: candidates linked via direct Candidate.jobId FK
      candidates: {
        orderBy: [{ score: "desc" }, { createdAt: "desc" }],
        take: 50,
        select: {
          id: true,
          name: true,
          currentTitle: true,
          score: true,
          noticePeriod: true,
          currentSalary: true,
          status: true,
        },
      },
      shareLinks: {
        where: { revokedAt: null },
        include: { _count: { select: { feedback: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!job) notFound();

  // Merge both paths; prefer application row (has job-specific score/status) over direct link.
  // Deduplicate by candidate id — application row wins if present in both.
  const seen = new Set<string>();
  const jobCandidates: {
    id: string; name: string | null; currentTitle: string | null;
    score: number | null; noticePeriod: string | null; currentSalary: string | null; status: string;
  }[] = [];

  // Application rows first (authoritative score/status per job)
  for (const app of job.candidateApplications) {
    if (!seen.has(app.candidate.id)) {
      seen.add(app.candidate.id);
      jobCandidates.push({
        id: app.candidate.id,
        name: app.candidate.name,
        currentTitle: app.candidate.currentTitle,
        score: app.score,
        noticePeriod: app.candidate.noticePeriod,
        currentSalary: app.candidate.currentSalary,
        status: app.status,
      });
    }
  }
  // Direct-link rows as fallback (legacy data before join table existed)
  for (const c of job.candidates) {
    if (!seen.has(c.id)) {
      seen.add(c.id);
      jobCandidates.push(c);
    }
  }
  // Sort merged list by score desc
  jobCandidates.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));

  const marketIntel: MarketIntelligence | null = job.marketIntelligence
    ? (() => { try { return JSON.parse(job.marketIntelligence!); } catch { return null; } })()
    : null;

  // Silver medalists
  const existingCandidateIds = new Set(jobCandidates.map((c) => c.id));
  const silverRaw = await prisma.candidateJobApplication.findMany({
    where: {
      job: { userId: session!.user.id },
      jobId: { not: job.id },
      status: "REJECTED",
      score: { gte: 65 },
    },
    include: {
      candidate: { select: { id: true, name: true, currentTitle: true, currentCompany: true } },
      job: { select: { title: true } },
    },
    orderBy: { score: "desc" },
    take: 20,
  });
  const silverMedalists: SilverMedalist[] = silverRaw
    .filter((a) => !existingCandidateIds.has(a.candidateId))
    .map((a) => ({
      candidateId: a.candidateId,
      name: a.candidate.name,
      currentTitle: a.candidate.currentTitle,
      currentCompany: a.candidate.currentCompany,
      score: a.score!,
      previousJobTitle: a.job.title,
      reachedStatus: a.currentStage ?? "Shortlisted",
    }));

  const targetCompanies = parseStrArr(job.targetCompanies);
  const altDesignations = parseStrArr(job.altDesignations);
  const nichePlatforms = parseStrArr(job.nichePlatforms);
  const interviewRounds = parseArr(job.interviewRounds);

  const statusColor: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700 border-green-200",
    DRAFT:  "bg-amber-100 text-amber-700 border-amber-200",
    CLOSED: "bg-slate-100 text-slate-500 border-slate-200",
  };

  return (
    <div className="space-y-0">
      {/* ── Sticky page header ── */}
      <div className="sticky top-14 md:top-0 z-30 -mx-4 md:-mx-8 bg-white/95 backdrop-blur border-b border-slate-200 px-4 md:px-8 shadow-sm shadow-slate-900/[0.03]">
        <div className="flex items-center gap-3 py-3">
          <Button asChild variant="ghost" size="icon" className="shrink-0 h-8 w-8 rounded-lg hover:bg-slate-100">
            <Link href="/jobs"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-bold text-slate-900 truncate">{job.title}</h1>
              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold ${statusColor[job.status] ?? "bg-slate-100"}`}>
                {job.status.charAt(0) + job.status.slice(1).toLowerCase()}
              </span>
              {/* Job ID — visible for reference */}
              <span className="hidden sm:inline rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-mono text-slate-400" title="Job ID">
                {job.id.slice(0, 8)}
              </span>
              {job.locationPref && (
                <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />{job.locationPref}
                </span>
              )}
              {(job.minExperience != null || job.maxExperience != null) && (
                <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                  <Briefcase className="h-3 w-3" />
                  {job.minExperience ?? 0}–{job.maxExperience ?? "?"}yr
                </span>
              )}
              <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                <svg viewBox="0 0 16 16" className="h-3 w-3 fill-current"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" fill="none"/><path d="M8 4v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
                {jobCandidates.length} candidates
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <form action={toggleJobStatus.bind(null, job.id, job.status)}>
              <Button type="submit" variant="ghost" size="sm" className="text-xs h-8">
                <Power className={`h-3.5 w-3.5 ${job.status === "ACTIVE" ? "text-green-500" : ""}`} />
                <span className="hidden sm:inline">{job.status === "ACTIVE" ? "Deactivate" : "Activate"}</span>
              </Button>
            </form>
            <form action={async () => { "use server"; await cloneJob(job.id); }}>
              <Button type="submit" variant="ghost" size="sm" className="text-xs h-8">
                <Copy className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Clone</span>
              </Button>
            </form>
            <form action={reanalyzeJob.bind(null, job.id)}>
              <Button type="submit" variant="ghost" size="sm" className="text-xs h-8">
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Re-analyze</span>
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <JobTabs
        sourcing={
          <div className="space-y-6">
            {/* Persona + intelligence strip */}
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Persona */}
              <div className="lg:col-span-2 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-sm">
                    <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-violet-700">Ideal candidate persona</p>
                    <p className="text-[11px] text-violet-500">The profile to look for</p>
                  </div>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                  {job.personaSummary || <span className="italic text-slate-400">Not generated yet — click Re-analyze</span>}
                </p>
              </div>

              {/* Chips column */}
              <div className="space-y-3">
                <TargetCompaniesCard
                  jobId={job.id}
                  initialCompanies={targetCompanies}
                  initialIndustry={job.industry}
                  initialTier={job.companyTier}
                />

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Tag className="h-3.5 w-3.5 text-slate-400" />
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Alt titles</p>
                  </div>
                  {altDesignations.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {altDesignations.map((t) => (
                        <span key={t} className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">{t}</span>
                      ))}
                    </div>
                  ) : <p className="text-xs text-slate-400 italic">None added yet</p>}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Globe className="h-3.5 w-3.5 text-slate-400" />
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Niche platforms</p>
                  </div>
                  {nichePlatforms.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {nichePlatforms.map((p) => (
                        <span key={p} className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">{p}</span>
                      ))}
                    </div>
                  ) : <p className="text-xs text-slate-400 italic">None added yet</p>}
                </div>
              </div>
            </div>

            {/* Boolean search strings */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-sm">
                  <Search className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Boolean search strings</p>
                  <p className="text-xs text-slate-400">Copy into your sourcing platform of choice</p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <BooleanCard
                  title="LinkedIn Recruiter"
                  description="Paste into LinkedIn Recruiter search bar"
                  value={job.booleanLinkedIn || job.booleanString}
                  icon={<span className="inline-flex h-4 w-4 items-center justify-center rounded text-[9px] font-black text-white bg-[#0077B5]">in</span>}
                  accentClass="border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50"
                  badge="LinkedIn"
                  badgeClass="bg-blue-100 text-blue-700"
                />
                <BooleanCard
                  title="Naukri Recruiter"
                  description="Paste into Naukri Resume Search"
                  value={job.booleanNaukri}
                  icon={<span className="text-[10px] font-black text-white bg-[#FF7555] rounded px-1">N</span>}
                  accentClass="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50"
                  badge="Naukri"
                  badgeClass="bg-orange-100 text-orange-700"
                />
                <BooleanCard
                  title="Google X-ray"
                  description={`site:linkedin.com/in + keywords to surface hidden profiles`}
                  value={job.booleanXRay}
                  icon={<ExternalLink className="h-4 w-4 text-emerald-600" />}
                  accentClass="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50"
                  badge="Google"
                  badgeClass="bg-emerald-100 text-emerald-700"
                />
              </div>
            </div>
          </div>
        }
        candidates={
          <div className="space-y-6">
            {silverMedalists.length > 0 && (
              <SilverMedalistsPanel jobId={job.id} candidates={silverMedalists} />
            )}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div>
                  <CardTitle className="text-base">Screened candidates</CardTitle>
                  <CardDescription>{jobCandidates.length} total</CardDescription>
                </div>
                <Button asChild size="sm">
                  <Link href={`/candidates/new?jobId=${job.id}`}>
                    <Plus className="h-4 w-4" /> Screen candidate
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {jobCandidates.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-12 text-center">
                    <p className="text-sm text-muted-foreground">No candidates screened yet.</p>
                    <Button asChild size="sm">
                      <Link href={`/candidates/new?jobId=${job.id}`}>Screen your first candidate</Link>
                    </Button>
                  </div>
                ) : (
                  <JobCandidatesTable candidates={jobCandidates} />
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Share with Hiring Manager</CardTitle>
                <CardDescription>Send a token link — HM sees anonymized shortlist and can vote</CardDescription>
              </CardHeader>
              <CardContent>
                <ShareShortlist
                  jobId={job.id}
                  existingLinks={job.shareLinks.map((l) => ({
                    id: l.id,
                    token: l.token,
                    expiresAt: l.expiresAt,
                    createdAt: l.createdAt,
                    _count: l._count,
                  }))}
                />
              </CardContent>
            </Card>
          </div>
        }
        market={
          <Card>
            <CardContent className="pt-6">
              <MarketIntelligencePanel jobId={job.id} initial={marketIntel} />
            </CardContent>
          </Card>
        }
        details={
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Job details</CardTitle>
                <CardDescription>Experience, location, interview stages — used to improve AI scoring</CardDescription>
              </CardHeader>
              <CardContent>
                <IntakeDetailsForm
                  jobId={job.id}
                  initialRounds={interviewRounds}
                  initialMinExp={job.minExperience ?? undefined}
                  initialMaxExp={job.maxExperience ?? undefined}
                  initialLocation={job.locationPref ?? ""}
                  initialNotes={job.notes ?? ""}
                  initialIndustry={job.industry ?? ""}
                  initialCompanyTier={job.companyTier ?? ""}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">LinkedIn JD</CardTitle>
                <CardDescription>AI rewrites your raw JD into a compelling LinkedIn post</CardDescription>
              </CardHeader>
              <CardContent>
                <GenerateJD jobId={job.id} initialJD={job.linkedInJD} />
              </CardContent>
            </Card>
          </div>
        }
      />
    </div>
  );
}

// ── Local sub-components ──────────────────────────────────────────────────────

function BooleanCard({
  title,
  description,
  value,
  icon,
  accentClass,
  badge,
  badgeClass,
}: {
  title: string;
  description: string;
  value: string | null | undefined;
  icon?: React.ReactNode;
  accentClass?: string;
  badge?: string;
  badgeClass?: string;
}) {
  return (
    <div className={`rounded-2xl border p-4 shadow-sm space-y-3 ${accentClass ?? "border-slate-200 bg-white"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon && <span className="shrink-0">{icon}</span>}
          <div>
            <p className="text-sm font-bold text-slate-800">{title}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>
          </div>
        </div>
        {badge && (
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badgeClass}`}>{badge}</span>
        )}
      </div>
      <pre className="whitespace-pre-wrap rounded-xl bg-white/80 border border-white/60 p-3 text-xs leading-relaxed min-h-[80px] text-slate-700 font-mono">
        {value || <span className="text-slate-400 italic not-italic font-sans">Not generated yet — click Re-analyze above</span>}
      </pre>
      {value && (
        <div className="flex justify-end">
          <CopyButton text={value} />
        </div>
      )}
    </div>
  );
}
