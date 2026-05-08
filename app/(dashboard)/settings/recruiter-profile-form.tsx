"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Check } from "lucide-react";
import { saveRecruiterProfile } from "./actions";

const CATEGORIES = [
  "Technical Recruiter","Non-technical Recruiter","Talent Acquisition Lead",
  "Hiring Manager","HR Business Partner","Founder / CEO","Agency Recruiter","Other",
];
const INDUSTRIES = [
  "Fintech / Payments","SaaS / B2B Software","E-commerce / D2C","Healthtech","Edtech",
  "Logistics / Supply Chain","Gaming","Deep Tech / AI/ML","BFSI","Consulting",
  "Manufacturing","Media / Content","Other",
];

export function RecruiterProfileForm({
  initial,
}: {
  initial: { company: string; industry: string; recruiterCategory: string };
}) {
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={(fd) => {
        setError(null);
        setSaved(false);
        start(async () => {
          const r = await saveRecruiterProfile(fd);
          if ("error" in r) setError(String(r.error));
          else setSaved(true);
        });
      }}
      className="grid gap-4 sm:grid-cols-2"
    >
      <div className="space-y-2">
        <Label htmlFor="company">Company / Agency</Label>
        <Input id="company" name="company" defaultValue={initial.company} placeholder="e.g. Acme Corp" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="recruiterCategory">Your role</Label>
        <select
          id="recruiterCategory"
          name="recruiterCategory"
          defaultValue={initial.recruiterCategory}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">— Select —</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="sm:col-span-2 space-y-2">
        <Label htmlFor="industry">Your primary industry</Label>
        <select
          id="industry"
          name="industry"
          defaultValue={initial.industry}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">— Select —</option>
          {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>

      {error && <p className="sm:col-span-2 text-sm text-destructive">{error}</p>}

      <div className="sm:col-span-2 flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save profile
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-green-700">
            <Check className="h-4 w-4" /> Saved
          </span>
        )}
      </div>
    </form>
  );
}
