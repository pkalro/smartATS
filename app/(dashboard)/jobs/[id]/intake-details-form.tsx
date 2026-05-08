"use client";

import { useState, useTransition, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, Plus, X, MapPin, Building2, Briefcase, ChevronDown, Sparkles } from "lucide-react";
import { saveIntakeDetails } from "../actions";

type Round = { name: string; details: string };

// ── Comprehensive city list ──────────────────────────────────────────────────
const CITIES = [
  // India – metro
  "Bangalore (On-site)", "Bangalore (Hybrid)", "Mumbai (On-site)", "Mumbai (Hybrid)",
  "Delhi / NCR (On-site)", "Delhi / NCR (Hybrid)", "Hyderabad (On-site)", "Hyderabad (Hybrid)",
  "Pune (On-site)", "Pune (Hybrid)", "Chennai (On-site)", "Chennai (Hybrid)",
  "Kolkata", "Ahmedabad", "Noida", "Gurgaon", "Chandigarh", "Jaipur", "Kochi",
  "Indore", "Bhopal", "Coimbatore", "Vadodara", "Surat", "Nagpur", "Lucknow",
  // Remote
  "Remote (India)", "Remote (Global)", "Work from Home",
  // Hybrid catch-all
  "Pan-India (Remote-first)",
  // International
  "Singapore", "Dubai / UAE", "Abu Dhabi", "London", "New York", "San Francisco",
  "Amsterdam", "Berlin", "Toronto", "Sydney", "Tokyo", "Hong Kong",
];

const INDUSTRIES = [
  "Fintech / Payments", "SaaS / B2B Software", "E-commerce / D2C", "Healthtech", "Edtech",
  "Logistics / Supply Chain", "Media / Content", "Gaming", "Deep Tech / AI/ML", "Cybersecurity",
  "BFSI", "Consulting", "Manufacturing", "Real Estate", "Government / Public Sector", "Other",
];

const COMPANY_TIERS = [
  "Pre-seed / Seed Startup", "Series A-B Startup", "Series C+ / Late Stage", "Unicorn / Decacorn",
  "Mid-size (500–5000)", "MNC / Large Enterprise (5000+)", "Product Company", "Service / IT Company", "Any",
];

// ── Company suggestions map ──────────────────────────────────────────────────
const COMPANY_SUGGESTIONS: Record<string, Record<string, string[]>> = {
  "Fintech / Payments": {
    "Unicorn / Decacorn": ["Razorpay", "PhonePe", "BharatPe", "Groww", "Zepto", "Pine Labs", "Juspay"],
    "Series C+ / Late Stage": ["Slice", "Open Financial", "Fi Money", "Cred", "Jupiter Money"],
    "Series A-B Startup": ["Cashfree", "Setu", "Perfios", "Freo", "Moneytap"],
    "MNC / Large Enterprise (5000+)": ["Visa", "Mastercard", "PayPal", "American Express", "HSBC", "Stripe"],
    "Any": ["Razorpay", "PhonePe", "BharatPe", "Groww", "Cashfree", "Juspay", "Setu", "CRED"],
  },
  "SaaS / B2B Software": {
    "Unicorn / Decacorn": ["Freshworks", "Zoho", "Chargebee", "Postman", "Browserstack", "Druva"],
    "MNC / Large Enterprise (5000+)": ["Salesforce", "SAP", "Oracle", "Workday", "ServiceNow", "HubSpot"],
    "Series C+ / Late Stage": ["Leadsquared", "Kapture CX", "Darwinbox", "Zaggle"],
    "Any": ["Freshworks", "Zoho", "Chargebee", "Postman", "Browserstack", "Darwinbox", "Leadsquared"],
  },
  "E-commerce / D2C": {
    "MNC / Large Enterprise (5000+)": ["Amazon", "Flipkart", "Myntra", "Meesho", "Nykaa"],
    "Unicorn / Decacorn": ["Meesho", "Nykaa", "Mamaearth", "Boat", "Lenskart", "Purplle"],
    "Series A-B Startup": ["Zivame", "Bewakoof", "The Man Company", "Plum"],
    "Any": ["Flipkart", "Amazon", "Meesho", "Nykaa", "Myntra", "Mamaearth", "Lenskart", "Boat"],
  },
  "Deep Tech / AI/ML": {
    "MNC / Large Enterprise (5000+)": ["Google", "Meta", "Microsoft", "Amazon", "NVIDIA", "Apple"],
    "Unicorn / Decacorn": ["Sarvam AI", "Krutrim", "Yellow.ai", "Uniphore", "Observe.AI"],
    "Series A-B Startup": ["Scaler", "SuperAGI", "Artpark", "Ola Krutrim", "Haptik"],
    "Any": ["Google", "Microsoft", "Sarvam AI", "Yellow.ai", "Uniphore", "Observe.AI", "Krutrim"],
  },
  "Healthtech": {
    "Unicorn / Decacorn": ["Practo", "PharmEasy", "Pristyn Care", "Innovaccer", "1mg"],
    "MNC / Large Enterprise (5000+)": ["Apollo Hospitals", "Manipal Health", "Fortis", "Medtronic"],
    "Any": ["Practo", "PharmEasy", "1mg", "Pristyn Care", "Innovaccer", "mfine"],
  },
  "Consulting": {
    "MNC / Large Enterprise (5000+)": ["McKinsey", "BCG", "Bain", "Deloitte", "KPMG", "EY", "PwC", "Accenture"],
    "Mid-size (500–5000)": ["Kearney", "LEK Consulting", "Alvarez & Marsal", "Arthur D. Little"],
    "Any": ["McKinsey", "BCG", "Bain", "Deloitte", "KPMG", "EY", "Accenture", "Roland Berger"],
  },
  "BFSI": {
    "MNC / Large Enterprise (5000+)": ["JP Morgan", "Goldman Sachs", "Citi", "HDFC Bank", "ICICI Bank", "Kotak", "Axis Bank"],
    "Mid-size (500–5000)": ["Bajaj Finance", "SBI Card", "Federal Bank", "IndusInd Bank"],
    "Any": ["HDFC Bank", "ICICI Bank", "Kotak", "Axis Bank", "Bajaj Finance", "JP Morgan", "Goldman Sachs"],
  },
  "Logistics / Supply Chain": {
    "Unicorn / Decacorn": ["Delhivery", "Xpressbees", "Shiprocket", "Porter", "Shadowfax"],
    "MNC / Large Enterprise (5000+)": ["DHL", "FedEx", "Blue Dart", "Mahindra Logistics"],
    "Any": ["Delhivery", "Xpressbees", "Porter", "Shiprocket", "Blue Dart", "Mahindra Logistics"],
  },
};

function getCompanySuggestions(industry: string, tier: string): string[] {
  const byIndustry = COMPANY_SUGGESTIONS[industry];
  if (!byIndustry) return [];
  return byIndustry[tier] ?? byIndustry["Any"] ?? [];
}

// ── Searchable location combobox ─────────────────────────────────────────────
function LocationCombobox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const matches = query.trim().length > 0
    ? CITIES.filter((c) => c.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : CITIES.slice(0, 10);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        <input
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
          placeholder="Search city or select…"
          className="w-full h-9 rounded-xl border border-slate-200 bg-white pl-8 pr-8 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
      </div>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          <div className="max-h-52 overflow-y-auto">
            {matches.length === 0 ? (
              <div className="px-3 py-2 text-xs text-slate-400">No matches — your input will be used</div>
            ) : (
              matches.map((city) => (
                <button
                  key={city}
                  type="button"
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition-colors ${city === value ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-700"}`}
                  onClick={() => { onChange(city); setQuery(city); setOpen(false); }}
                >
                  {city}
                </button>
              ))
            )}
          </div>
          {query && !CITIES.includes(query) && (
            <button
              type="button"
              className="w-full text-left border-t border-slate-100 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
              onClick={() => { onChange(query); setOpen(false); }}
            >
              Use &ldquo;{query}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Helper ──────────────────────────────────────────────────────────────────
function parseRounds(raw: unknown): Round[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((r) => {
    if (typeof r === "string") return { name: r, details: "" };
    if (r && typeof r === "object" && "name" in r)
      return { name: String((r as { name: unknown }).name ?? ""), details: String((r as { details?: unknown }).details ?? "") };
    return { name: "", details: "" };
  }).filter((r) => r.name);
}

// ── Main form ────────────────────────────────────────────────────────────────
export function IntakeDetailsForm({
  jobId,
  initialRounds,
  initialMinExp,
  initialMaxExp,
  initialLocation,
  initialNotes,
  initialIndustry,
  initialCompanyTier,
}: {
  jobId: string;
  initialRounds: unknown[];
  initialMinExp?: number;
  initialMaxExp?: number;
  initialLocation: string;
  initialNotes: string;
  initialIndustry: string;
  initialCompanyTier: string;
}) {
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rounds, setRounds] = useState<Round[]>(() => parseRounds(initialRounds));
  const [activeTab, setActiveTab] = useState(0);
  const [industryVal, setIndustryVal] = useState(initialIndustry || "");
  const [tierVal, setTierVal] = useState(initialCompanyTier || "");
  const [locationVal, setLocationVal] = useState(initialLocation || "");
  const [minExp, setMinExp] = useState(initialMinExp != null ? String(initialMinExp) : "");
  const [maxExp, setMaxExp] = useState(initialMaxExp != null ? String(initialMaxExp) : "");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const companySuggestions = useMemo(
    () => getCompanySuggestions(industryVal, tierVal),
    [industryVal, tierVal],
  );

  function addRound() {
    const next = [...rounds, { name: "New Round", details: "" }];
    setRounds(next);
    setActiveTab(next.length - 1);
  }

  function removeRound(i: number) {
    const next = rounds.filter((_, idx) => idx !== i);
    setRounds(next);
    setActiveTab(Math.min(activeTab, next.length - 1));
  }

  function updateRound(i: number, field: keyof Round, val: string) {
    setRounds(rounds.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));
  }

  const activeRound = rounds[activeTab];

  return (
    <form
      action={(fd) => {
        fd.set("jobId", jobId);
        fd.set("interviewRounds", JSON.stringify(rounds));
        fd.set("locationPref", locationVal);
        fd.set("industry", industryVal);
        fd.set("companyTier", tierVal);
        fd.set("minExperience", minExp);
        fd.set("maxExperience", maxExp);
        setError(null);
        setSaved(false);
        start(async () => {
          const r = await saveIntakeDetails(fd);
          if (r && "error" in r) setError(r.error ?? null);
          else setSaved(true);
        });
      }}
      className="space-y-6"
    >
      {/* ── Interview rounds ─────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-violet-600">
            <Briefcase className="h-3 w-3 text-white" />
          </div>
          <p className="text-sm font-bold text-slate-800">Interview rounds</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {rounds.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveTab(i)}
              className={`group flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                activeTab === i
                  ? "border-blue-300 bg-blue-50 text-blue-800"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {r.name || "Untitled"}
              <span
                role="button"
                tabIndex={-1}
                onClick={(e) => { e.stopPropagation(); removeRound(i); }}
                className="text-slate-300 hover:text-red-500 transition-colors"
              >
                <X className="h-3 w-3" />
              </span>
            </button>
          ))}
          <Button type="button" size="sm" variant="outline" onClick={addRound}
            className="rounded-lg border-dashed border-slate-300 text-slate-500 hover:border-blue-300 hover:text-blue-600 h-7 text-xs">
            <Plus className="h-3 w-3" /> Add round
          </Button>
        </div>

        {activeRound ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <input
              value={activeRound.name}
              onChange={(e) => updateRound(activeTab, "name", e.target.value)}
              placeholder="Round name (e.g. Technical Interview)"
              className="w-full h-8 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <Textarea
              value={activeRound.details}
              onChange={(e) => updateRound(activeTab, "details", e.target.value)}
              placeholder="60 min live coding on HackerRank, focuses on DSA and system design…"
              rows={3}
              className="rounded-xl border-slate-200 text-sm resize-none"
            />
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No rounds added yet.</p>
        )}
      </div>

      {/* ── Industry + Tier ──────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-orange-500 to-amber-500">
            <Building2 className="h-3 w-3 text-white" />
          </div>
          <p className="text-sm font-bold text-slate-800">Company context</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Hiring industry</label>
            <select
              value={industryVal}
              onChange={(e) => setIndustryVal(e.target.value)}
              className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">— Select industry —</option>
              {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Target company tier</label>
            <select
              value={tierVal}
              onChange={(e) => setTierVal(e.target.value)}
              className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">— Select tier —</option>
              {COMPANY_TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Company suggestions ─────────────────────────────────────────── */}
      {(industryVal || tierVal) && companySuggestions.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span className="text-xs font-semibold text-amber-800">
                Suggested target companies
                {industryVal && <span className="font-normal text-amber-600"> · {industryVal}{tierVal ? ` · ${tierVal}` : ""}</span>}
              </span>
            </div>
            <button type="button" onClick={() => setShowSuggestions((o) => !o)}
              className="text-xs text-amber-600 hover:text-amber-800 transition-colors">
              {showSuggestions ? "Hide" : "Show suggestions"}
            </button>
          </div>
          {showSuggestions && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {companySuggestions.map((c) => (
                <span key={c} className="rounded-full border border-amber-300 bg-white px-2.5 py-0.5 text-xs font-medium text-amber-800">{c}</span>
              ))}
              <p className="w-full text-[11px] text-amber-600 mt-1">These are reference suggestions — note them in your sourcing notes or ask your team to target these companies.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Experience + Location ────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-teal-500">
            <MapPin className="h-3 w-3 text-white" />
          </div>
          <p className="text-sm font-bold text-slate-800">Experience & location</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Min exp (yrs)</label>
            <input
              type="number"
              min={0}
              max={50}
              step={0.5}
              value={minExp}
              onChange={(e) => setMinExp(e.target.value)}
              placeholder="e.g. 3"
              className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Max exp (yrs)</label>
            <input
              type="number"
              min={0}
              max={50}
              step={0.5}
              value={maxExp}
              onChange={(e) => setMaxExp(e.target.value)}
              placeholder="e.g. 8"
              className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Location / Work mode</label>
            <LocationCombobox value={locationVal} onChange={setLocationVal} />
          </div>
        </div>
      </div>

      {/* ── Notes ───────────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Hiring manager notes</label>
        <Textarea
          name="notes"
          defaultValue={initialNotes}
          placeholder="Hiring urgency, team dynamics, red flags to watch, must-haves not in JD…"
          rows={3}
          className="rounded-xl border-slate-200 text-sm resize-none"
        />
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {saved && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-medium">✓ Saved successfully</div>}

      <Button type="submit" disabled={pending}
        className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 border-0 text-white h-9 px-5 font-semibold shadow-sm text-sm">
        {pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> Save intake details</>}
      </Button>
    </form>
  );
}
