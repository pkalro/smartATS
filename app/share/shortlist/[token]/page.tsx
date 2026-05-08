import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { parseSkills } from "@/lib/skills";
import { ShareFeedbackPanel } from "./share-feedback-panel";

export default async function SharedShortlistPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const link = await prisma.shareLink.findFirst({
    where: {
      token,
      revokedAt: null,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    include: {
      job: {
        select: {
          title: true,
          candidateApplications: {
            where: { status: "SHORTLISTED" },
            include: {
              candidate: {
                select: {
                  name: true,
                  currentTitle: true,
                  currentCompany: true,
                  yearsExperience: true,
                  skills: true,
                  score: true,
                  scoreRationale: true,
                  noticePeriod: true,
                  expectedSalary: true,
                  location: true,
                },
              },
            },
            orderBy: { score: "desc" },
          },
        },
      },
      feedback: true,
    },
  });

  if (!link) notFound();

  const applications = link.job.candidateApplications;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{link.job.title}</h1>
              <p className="text-sm text-muted-foreground">
                Shortlisted candidates — {applications.length} profile{applications.length !== 1 ? "s" : ""}
              </p>
            </div>
            <span className="text-xs text-muted-foreground">
              {link.expiresAt
                ? `Expires ${link.expiresAt.toLocaleDateString()}`
                : ""}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-4 px-6 py-8">
        {applications.length === 0 && (
          <div className="rounded-lg border bg-background p-8 text-center text-muted-foreground">
            No shortlisted candidates yet.
          </div>
        )}

        {applications.map((app) => {
          const c = app.candidate;
          const skills = parseSkills(c.skills);
          const existingFeedback = link.feedback.find((f) => f.applicationId === app.id);
          const scoreColor = c.score == null ? "" : c.score >= 75 ? "text-green-600" : c.score >= 50 ? "text-amber-600" : "text-red-500";

          return (
            <div key={app.id} className="rounded-lg border bg-background p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-lg">{c.name ?? "Unnamed"}</h2>
                  <p className="text-sm text-muted-foreground">
                    {c.currentTitle}
                    {c.currentCompany && ` at ${c.currentCompany}`}
                    {c.yearsExperience != null && ` · ${c.yearsExperience} yrs exp`}
                    {c.location && ` · ${c.location}`}
                  </p>
                </div>
                {c.score != null && (
                  <div className={`text-2xl font-bold ${scoreColor}`}>
                    {c.score}<span className="text-sm font-normal text-muted-foreground">/100</span>
                  </div>
                )}
              </div>

              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <span key={s} className="rounded-full bg-muted px-2.5 py-0.5 text-xs">{s}</span>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                {c.noticePeriod && <div><span className="font-medium text-foreground">Notice:</span> {c.noticePeriod}</div>}
                {c.expectedSalary && <div><span className="font-medium text-foreground">Expected:</span> {c.expectedSalary}</div>}
              </div>

              {(
                <ShareFeedbackPanel
                  token={token}
                  applicationId={app.id}
                  existingDecision={existingFeedback?.decision ?? null}
                  existingNote={existingFeedback?.note ?? null}
                  requireEmail={link.requireEmail}
                />
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}
