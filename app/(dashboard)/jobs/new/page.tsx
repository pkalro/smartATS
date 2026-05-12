import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { JDForm } from "./jd-form";
import { BackButton } from "@/components/back-button";

export default function NewJobPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <BackButton href="/jobs" label="Jobs" />
      <div>
        <h1 className="text-2xl font-bold">New job</h1>
        <p className="text-muted-foreground">
          Paste the JD. AI will generate 3 boolean search strings, target companies, alternative designations, niche platforms, and a candidate persona.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job description</CardTitle>
          <CardDescription>
            Anything works — Slack DMs, emails, half-written notes, full postings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JDForm />
        </CardContent>
      </Card>
    </div>
  );
}
