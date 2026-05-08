import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CandidateForm } from "./candidate-form";

export default async function NewCandidatePage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string }>;
}) {
  const session = await auth();
  const { jobId } = await searchParams;
  const jobs = await prisma.job.findMany({
    where: { userId: session!.user.id, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Screen a candidate</h1>
        <p className="text-muted-foreground">
          Upload a resume (PDF/DOCX/TXT) or paste call notes — we'll extract a
          clean row and score it against the JD.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Source</CardTitle>
          <CardDescription>Resume file or notes — pick one.</CardDescription>
        </CardHeader>
        <CardContent>
          <CandidateForm jobs={jobs} defaultJobId={jobId ?? null} />
        </CardContent>
      </Card>
    </div>
  );
}
