import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, MapPin, Briefcase, Clock,
  Banknote, Mail, Phone, Building2, FileText,
} from "lucide-react";
import { Coordinator } from "./coordinator";
import { ScreeningKit } from "./screening-kit";
import { RawNotes } from "./raw-notes";
import { JobApplications } from "./job-applications";
import { RoundFeedback } from "./round-feedback";
import { Communications } from "./communications";
import { CandidateTabs } from "./candidate-tabs";
import { CandidateTags } from "./candidate-tags";
import { DeleteCandidateButton } from "./delete-candidate-button";
import { HeaderScoreBadge } from "./header-score-badge";
import { EditableInfoRow } from "./profile-editor";
import { parseSkills } from "@/lib/skills";

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;
  const candidate = await prisma.candidate.findFirst({
    where: { id, userId: session!.user.id },
    include: {
      job: { select: { id: true, title: true, interviewRounds: true } },
      emailDrafts: { orderBy: { createdAt: "desc" } },
      communications: { orderBy: { occurredAt: "desc" }, take: 50 },
      applications: {
        include: {
          job: { select: { id: true, title: true, interviewRounds: true } },
          roundFeedback: { orderBy: { createdAt: "asc" } },
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  });
  if (!candidate) notFound();

  const skills = parseSkills(candidate.skills);

  const [user, allJobs] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session!.user.id },
      select: { bookingLink: true, name: true, email: true },
    }),
    prisma.job.findMany({
      where: { userId: session!.user.id, status: "ACTIVE" },
      select: { id: true, title: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Pre-compute derived data
  const activeApps = candidate.applications.filter((a) =>
    ["SHORTLISTED", "INTERVIEWING", "OFFER", "HIRED"].includes(a.status),
  );
  const tags: string[] = (() => { try { return JSON.parse(candidate.tags); } catch { return []; } })();
  const primaryStatus = candidate.applications[0]?.status ?? "NEW";
  const topScore = candidate.applications.reduce<number | null>((best, a) => {
    if (a.score == null) return best;
    return best == null || a.score > best ? a.score : best;
  }, null);
  // Best scoring application for the profile tab display
  const topApp = candidate.applications.find((a) => a.score === topScore) ?? null;

  const statusColor: Record<string, string> = {
    NEW:          "bg-slate-100 text-slate-600 border-slate-200",
    SCREENING:    "bg-blue-100 text-blue-700 border-blue-200",
    SHORTLISTED:  "bg-violet-100 text-violet-700 border-violet-200",
    INTERVIEWING: "bg-amber-100 text-amber-700 border-amber-200",
    OFFER:        "bg-orange-100 text-orange-700 border-orange-200",
    HIRED:        "bg-green-100 text-green-700 border-green-200",
    REJECTED:     "bg-red-100 text-red-600 border-red-200",
    WITHDRAWN:    "bg-slate-100 text-slate-500 border-slate-200",
  };

  return (
    <div className="space-y-0">
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-30 -mx-6 bg-white/95 backdrop-blur border-b border-slate-200 px-6 md:-mx-8 md:px-8 shadow-sm shadow-slate-900/[0.03]">
        <div className="flex items-center gap-3 py-3">
          <Button asChild variant="ghost" size="icon" className="shrink-0 h-8 w-8 rounded-lg hover:bg-slate-100">
            <Link href="/candidates"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-bold text-slate-900 truncate">
                {candidate.name || "Unnamed candidate"}
              </span>

              {candidate.applications.length > 0 && (
                <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold ${statusColor[primaryStatus] ?? "bg-slate-100"}`}>
                  {primaryStatus.charAt(0) + primaryStatus.slice(1).toLowerCase()}
                </span>
              )}

              <HeaderScoreBadge initial={topScore} />

              {candidate.currentTitle && (
                <span className="hidden sm:flex items-center gap-1 text-xs text-slate-500">
                  <Briefcase className="h-3 w-3" />{candidate.currentTitle}
                  {candidate.currentCompany && ` · ${candidate.currentCompany}`}
                </span>
              )}
              {candidate.location && (
                <span className="hidden md:flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="h-3 w-3" />{candidate.location}
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0">
            <DeleteCandidateButton candidateId={candidate.id} candidateName={candidate.name} />
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <CandidateTabs
        badges={{
          activity: candidate.communications.length || undefined,
          pipeline: candidate.applications.length || undefined,
        }}

        pipeline={
          <div className="space-y-6">
            <JobApplications
              candidateId={candidate.id}
              applications={candidate.applications.map((a) => ({
                id: a.id,
                jobId: a.jobId,
                jobTitle: a.job.title,
                status: a.status,
                score: a.score,
                scoreRationale: a.scoreRationale,
                currentRound: a.currentRound,
                updatedAt: a.updatedAt,
              }))}
              availableJobs={allJobs}
            />

            {activeApps.length > 0 && (
              <div className="space-y-4">
                {activeApps.map((a) => {
                  const rounds: Array<{ name: string }> = (() => {
                    try { return JSON.parse(a.job.interviewRounds); } catch { return []; }
                  })();
                  const roundOptions = rounds.map((r) => r.name).filter(Boolean);
                  return (
                    <RoundFeedback
                      key={a.id}
                      applicationId={a.id}
                      candidateId={candidate.id}
                      feedbackList={a.roundFeedback.map((fb) => ({
                        id: fb.id,
                        roundName: fb.roundName,
                        interviewerName: fb.interviewerName,
                        decision: fb.decision,
                        notes: fb.notes,
                        nextStep: fb.nextStep,
                        createdAt: fb.createdAt,
                      }))}
                      roundOptions={roundOptions.length > 0 ? roundOptions : ["Screening", "Round 1", "Round 2", "Final"]}
                    />
                  );
                })}
              </div>
            )}
          </div>
        }

        profile={
          <div className="space-y-4">
            {/* Score summary on profile tab */}
            {topScore != null && topApp && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Best match · {topApp.job.title}
                  </span>
                  <span className={`text-2xl font-extrabold ${
                    topScore >= 75 ? "text-emerald-600" :
                    topScore >= 50 ? "text-amber-600" : "text-red-500"
                  }`}>
                    {topScore}<span className="text-sm font-normal text-slate-400">/100</span>
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div className={`h-2 rounded-full transition-all ${
                    topScore >= 75 ? "bg-emerald-500" :
                    topScore >= 50 ? "bg-amber-500" : "bg-red-400"
                  }`} style={{ width: `${topScore}%` }} />
                </div>
                {topApp.scoreRationale && (
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed line-clamp-3">{topApp.scoreRationale}</p>
                )}
              </div>
            )}

            {/* Contact + details grid — all fields editable */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Contact & details</p>
                <span className="text-[10px] text-slate-400 italic">Hover a field to edit</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <EditableInfoRow candidateId={candidate.id} icon={<Mail className="h-3.5 w-3.5" />}      field="email"          label="Email"          value={candidate.email} />
                <EditableInfoRow candidateId={candidate.id} icon={<Phone className="h-3.5 w-3.5" />}     field="phone"          label="Phone"          value={candidate.phone} />
                <EditableInfoRow candidateId={candidate.id} icon={<MapPin className="h-3.5 w-3.5" />}    field="location"       label="Location"       value={candidate.location} />
                <EditableInfoRow candidateId={candidate.id} icon={<Briefcase className="h-3.5 w-3.5" />} field="yearsExperience" label="Experience"    value={candidate.yearsExperience != null ? `${candidate.yearsExperience}` : null} />
                <EditableInfoRow candidateId={candidate.id} icon={<Clock className="h-3.5 w-3.5" />}     field="noticePeriod"   label="Notice period"  value={candidate.noticePeriod} />
                <EditableInfoRow candidateId={candidate.id} icon={<Banknote className="h-3.5 w-3.5" />}  field="currentSalary"  label="Current salary" value={candidate.currentSalary} />
                <EditableInfoRow candidateId={candidate.id} icon={<Banknote className="h-3.5 w-3.5" />}  field="expectedSalary" label="Expected salary" value={candidate.expectedSalary} />
                <EditableInfoRow candidateId={candidate.id} icon={<Building2 className="h-3.5 w-3.5" />} field="currentCompany" label="Company"        value={candidate.currentCompany} />
              </div>

              {skills.length > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs rounded-full">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Resume source text */}
            {candidate.rawSource && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-3">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-800">
                    {candidate.sourceType === "resume" ? "Resume (extracted text)" : "Screening notes"}
                  </span>
                </div>
                <div className="p-5 max-h-64 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-xs text-slate-500 font-mono leading-relaxed">{candidate.rawSource}</pre>
                </div>
              </div>
            )}

            {/* Recruiter notes */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800">Recruiter notes</p>
              </div>
              <div className="p-5">
                <RawNotes candidateId={candidate.id} initial={candidate.recruiterRawNotes ?? ""} />
              </div>
            </div>

            {/* Tags */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800">Tags</p>
              </div>
              <div className="p-5">
                <CandidateTags candidateId={candidate.id} initialTags={tags} />
              </div>
            </div>
          </div>
        }

        toolkit={
          <div className="space-y-6">
            <ScreeningKit
              candidateId={candidate.id}
              hasJob={!!candidate.job || candidate.applications.length > 0}
              jobTitle={candidate.job?.title}
              initialJobId={candidate.applications[0]?.jobId ?? candidate.job?.id ?? null}
              kit={{
                pitchDeck: candidate.pitchDeck,
                gapAnalysis: candidate.gapAnalysis,
                screeningQuestions: candidate.screeningQuestions,
                recruiterNotes: candidate.recruiterNotes,
                processEmail: candidate.processEmail,
                processWhatsapp: candidate.processWhatsapp,
              }}
            />

            {candidate.applications.some((a) => a.status === "SHORTLISTED") && (
              <Coordinator
                candidate={{
                  id: candidate.id,
                  name: candidate.name,
                  email: candidate.email,
                  jobTitle: candidate.job?.title ?? null,
                }}
                recruiter={{
                  name: user?.name ?? null,
                  email: user?.email ?? null,
                  bookingLink: user?.bookingLink ?? null,
                }}
                existingDrafts={candidate.emailDrafts}
              />
            )}
          </div>
        }

        activity={
          <Communications
            candidateId={candidate.id}
            communications={candidate.communications.map((c) => ({
              id: c.id,
              channel: c.channel,
              direction: c.direction,
              subject: c.subject,
              body: c.body,
              occurredAt: c.occurredAt,
              applicationId: c.applicationId,
            }))}
            applications={candidate.applications.map((a) => ({ id: a.id, jobTitle: a.job.title }))}
          />
        }
      />
    </div>
  );
}
