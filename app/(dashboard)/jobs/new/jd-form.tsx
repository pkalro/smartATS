"use client";

import { useState, useTransition, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Upload, ChevronDown, ChevronUp } from "lucide-react";
import { createJobFromJD } from "../actions";

const INDUSTRIES = [
  "", "Technology", "Finance & Banking", "Healthcare", "E-commerce / Retail",
  "Manufacturing", "Consulting", "Media & Entertainment", "Education",
  "Real Estate", "FMCG", "Logistics & Supply Chain", "Other",
];

const COMPANY_TIERS = [
  "", "Tier 1 (FAANG / Big Tech)", "Tier 2 (Mid-size tech / Unicorn)",
  "Startup (Series A–C)", "SMB / Regional", "MNC (non-tech)", "Any",
];

export function JDForm() {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [rawJD, setRawJD] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [intakeOpen, setIntakeOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <form
      action={(fd) => {
        setError(null);
        start(async () => {
          const r = await createJobFromJD(fd);
          if (r && "error" in r) setError(r.error);
        });
      }}
      className="space-y-5"
    >
      {/* File upload */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-800">Upload JD file <span className="font-normal text-slate-400">(optional)</span></label>
        <div className="flex items-center gap-2">
          <Input
            ref={fileRef}
            type="file"
            name="jdFile"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setFileName(f?.name ?? null);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileRef.current?.click()}
            className="rounded-lg border-slate-200"
          >
            <Upload className="h-4 w-4" /> Choose file
          </Button>
          {fileName && (
            <span className="text-sm text-slate-500 truncate max-w-[200px]">{fileName}</span>
          )}
        </div>
        <p className="text-xs text-slate-400">PDF, DOCX, or TXT — will fill the text box below.</p>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-400">or paste</span>
        </div>
      </div>

      {/* JD textarea */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-800">Job description</label>
        <Textarea
          name="rawJD"
          value={rawJD}
          onChange={(e) => setRawJD(e.target.value)}
          placeholder="Paste the JD here — anything from a polished posting to messy Slack DMs."
          rows={12}
          className="rounded-xl border-slate-200 text-sm resize-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Intake details — collapsible */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
        <button
          type="button"
          onClick={() => setIntakeOpen((o) => !o)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <div>
            <span className="text-sm font-semibold text-slate-800">Intake details</span>
            <span className="ml-2 text-xs text-slate-400">Experience, location, industry — improves AI scoring</span>
          </div>
          {intakeOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </button>

        {intakeOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 space-y-4">
            {/* Experience range */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">Experience (years)</label>
              <div className="flex items-center gap-2">
                <Input
                  name="minExperience"
                  type="number"
                  min={0}
                  max={30}
                  placeholder="Min"
                  className="h-8 w-24 rounded-lg border-slate-200 text-sm"
                />
                <span className="text-sm text-slate-400">–</span>
                <Input
                  name="maxExperience"
                  type="number"
                  min={0}
                  max={30}
                  placeholder="Max"
                  className="h-8 w-24 rounded-lg border-slate-200 text-sm"
                />
                <span className="text-xs text-slate-400">yrs</span>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Location / Work mode</label>
              <Input
                name="locationPref"
                placeholder="e.g. Bangalore, Remote, Hybrid – Mumbai"
                className="h-9 rounded-lg border-slate-200 text-sm"
              />
            </div>

            {/* Industry + Company tier */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Industry</label>
                <select
                  name="industry"
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {INDUSTRIES.map((i) => (
                    <option key={i} value={i}>{i || "Select industry…"}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Target company tier</label>
                <select
                  name="companyTier"
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {COMPANY_TIERS.map((t) => (
                    <option key={t} value={t}>{t || "Any tier"}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Hiring manager notes</label>
              <Textarea
                name="notes"
                placeholder="Anything else the AI should know — must-haves, red flags, culture fit notes…"
                rows={3}
                className="rounded-xl border-slate-200 text-sm resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <Button
        type="submit"
        disabled={pending || (!rawJD.trim() && !fileName)}
        className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 border-0 text-white h-11 font-semibold shadow-md"
      >
        {pending ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Analysing…</>
        ) : (
          <><Sparkles className="h-4 w-4" /> Generate search strategy + persona</>
        )}
      </Button>
    </form>
  );
}
