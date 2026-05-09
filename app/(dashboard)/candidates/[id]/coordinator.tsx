"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CopyButton } from "@/components/copy-button";
import { Calendar, ExternalLink } from "lucide-react";
import { Icon } from "@/components/icons/icon";
import { saveBookingLink, generateSchedulingEmail } from "./coordinator-actions";

type Recruiter = {
  name: string | null;
  email: string | null;
  bookingLink: string | null;
};

type Candidate = {
  id: string;
  name: string | null;
  email: string | null;
  jobTitle: string | null;
};

type Draft = {
  id: string;
  subject: string;
  body: string;
  bookingLink: string | null;
  createdAt: Date;
};

export function Coordinator({
  candidate,
  recruiter,
  existingDrafts,
}: {
  candidate: Candidate;
  recruiter: Recruiter;
  existingDrafts: Draft[];
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [bookingLink, setBookingLink] = useState(recruiter.bookingLink ?? "");
  const [showLinkPrompt, setShowLinkPrompt] = useState(!recruiter.bookingLink);

  const ready = !!recruiter.bookingLink && !showLinkPrompt;

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-4 w-4" />
          Ready to schedule?
        </CardTitle>
        <CardDescription>
          {ready
            ? "Generate an email draft with your booking link embedded."
            : "Please paste your booking link here (Calendly, cal.com, etc.) — we'll save it for next time."}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!ready ? (
          <form
            action={(fd) => {
              setError(null);
              start(async () => {
                const r = await saveBookingLink(fd);
                if ("error" in r) setError(r.error ?? null);
                else setShowLinkPrompt(false);
              });
            }}
            className="space-y-3"
          >
            <div className="space-y-2">
              <Label htmlFor="bookingLink">Booking link</Label>
              <Input
                id="bookingLink"
                name="bookingLink"
                type="url"
                placeholder="https://calendly.com/your-handle/30min"
                value={bookingLink}
                onChange={(e) => setBookingLink(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={pending}>
              {pending ? <Icon name="loader" size={4} className="animate-spin" /> : null}
              Save link
            </Button>
          </form>
        ) : (
          <>
            <div className="flex items-center justify-between rounded-md border bg-background p-3 text-sm">
              <span className="flex items-center gap-2 truncate">
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{recruiter.bookingLink}</span>
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowLinkPrompt(true)}
              >
                Change
              </Button>
            </div>

            <Button
              type="button"
              disabled={pending}
              onClick={() => {
                setError(null);
                start(async () => {
                  const r = await generateSchedulingEmail(candidate.id);
                  if ("error" in r) setError(r.error ?? null);
                });
              }}
            >
              {pending ? (
                <>
                  <Icon name="loader" size={4} className="animate-spin" /> Drafting…
                </>
              ) : (
                <>
                  <Icon name="sparkles" size={4} /> Generate email draft
                </>
              )}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </>
        )}

        {existingDrafts.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="text-sm font-medium">Email drafts</div>
            {existingDrafts.map((d) => (
              <DraftView key={d.id} draft={d} candidateEmail={candidate.email} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DraftView({
  draft,
  candidateEmail,
}: {
  draft: Draft;
  candidateEmail: string | null;
}) {
  const fullText = `Subject: ${draft.subject}\n\n${draft.body}`;
  const mailto =
    candidateEmail &&
    `mailto:${encodeURIComponent(candidateEmail)}?subject=${encodeURIComponent(
      draft.subject,
    )}&body=${encodeURIComponent(draft.body)}`;

  return (
    <div className="space-y-2 rounded-md border bg-background p-3">
      <div className="flex items-center justify-between gap-2">
        <Input value={draft.subject} readOnly className="font-medium" />
      </div>
      <Textarea value={draft.body} readOnly rows={8} className="font-mono text-xs" />
      <div className="flex flex-wrap gap-2">
        <CopyButton text={fullText} label="Copy email" />
        {mailto && (
          <Button asChild size="sm" variant="outline">
            <a href={mailto}>Open in mail</a>
          </Button>
        )}
        <span className="ml-auto text-xs text-muted-foreground">
          {new Date(draft.createdAt).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
