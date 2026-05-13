import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  Sparkles, FileText, Users, CalendarClock, ChevronRight,
  Search, BarChart3, Zap, CheckCircle, ArrowRight,
  Brain, ScanLine, MessageSquare, TrendingUp, Clock, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoOptichire } from "@/components/brand/logos";

export default async function LandingPage() {
  const session = await auth();
  if (session) redirect("/jobs");

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── Nav ── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/60 bg-white/75 backdrop-blur-xl shadow-sm shadow-slate-900/[0.04]">
        <div className="mx-auto max-w-6xl px-6 flex h-16 items-center justify-between">
          <LogoOptichire size="sm" />
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-slate-900 transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">Free plan</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
              Sign in
            </Link>
            <Button asChild size="sm" className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 border-0 text-white shadow-md shadow-blue-200">
              <Link href="/login">Get started free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>

        {/* ── Hero ── */}
        <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 px-5 sm:px-6">
          {/* Background gradient blob */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-gradient-to-br from-blue-100 via-violet-100 to-indigo-50 opacity-60 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-4xl text-center">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 sm:px-4 py-1.5 text-xs font-semibold text-blue-700 mb-6 sm:mb-8">
              <Zap className="h-3.5 w-3.5 shrink-0" />
              AI-powered · Built for solo recruiters & small teams
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.05]">
              Hire smarter,{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  not harder
                </span>
                <span className="absolute inset-x-0 bottom-1 h-3 bg-gradient-to-r from-blue-100 via-violet-100 to-indigo-100 -z-0 rounded" />
              </span>
            </h1>

            <p className="mt-5 sm:mt-7 text-base sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed px-2">
              Optichire turns messy job descriptions and raw resumes into structured pipelines, scored candidates, and interview-ready dossiers — in seconds, not hours.
            </p>

            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto h-12 sm:h-13 px-8 text-base bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 border-0 text-white shadow-lg shadow-blue-200/60 rounded-xl">
                <Link href="/login" className="flex items-center justify-center gap-2">
                  Start for free <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <a href="#workflow" className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                See how it works <ChevronRight className="h-4 w-4" />
              </a>
            </div>

            {/* Social proof micro-strip */}
            <div className="mt-8 sm:mt-14 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-green-500" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-green-500" /> Setup in under 5 minutes</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-green-500" /> AI-powered screening</span>
            </div>
          </div>

          {/* ── Hero product mockup ── */}
          <div className="relative mx-auto mt-12 sm:mt-20 max-w-5xl">
            <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/60 overflow-hidden">

              {/* Mock browser chrome */}
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 sm:px-4 py-2.5 sm:py-3">
                <div className="flex gap-1.5 shrink-0">
                  <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-red-400" />
                  <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-yellow-400" />
                  <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 rounded-md bg-white border border-slate-200 px-3 py-1 text-[10px] sm:text-xs text-slate-400 max-w-[200px] sm:max-w-xs mx-auto text-center truncate">
                  app.optichire.com/pipeline
                </div>
              </div>

              {/* Mock pipeline UI */}
              <div className="bg-slate-50">
                {/* Mockup header — compact on mobile */}
                <div className="flex items-center justify-between px-3 sm:px-6 pt-3 sm:pt-5 pb-3 sm:pb-4 gap-2">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                      <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-semibold text-slate-800 truncate">Pipeline · Senior Frontend Engineer</div>
                      <div className="text-[10px] sm:text-xs text-slate-400">24 candidates · 6 active</div>
                    </div>
                  </div>
                  <div className="flex gap-1.5 sm:gap-2 shrink-0">
                    <div className="h-6 sm:h-7 rounded-lg bg-white border border-slate-200 px-2 sm:px-3 flex items-center text-[10px] sm:text-xs text-slate-500 shadow-sm">All roles</div>
                    <div className="h-6 sm:h-7 rounded-lg bg-blue-600 px-2 sm:px-3 flex items-center text-[10px] sm:text-xs text-white gap-1 shadow-sm">
                      <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      <span className="hidden sm:inline">AI score</span>
                      <span className="sm:hidden">Score</span>
                    </div>
                  </div>
                </div>

                {/* Kanban — horizontal scroll on mobile, 5-col grid on desktop */}
                <div className="overflow-x-auto pb-4 sm:pb-6 px-3 sm:px-6 scrollbar-none">
                  <div className="flex gap-2.5 sm:gap-3 min-w-[640px] sm:min-w-0 sm:grid sm:grid-cols-5">
                    {[
                      { label: "Screening", color: "bg-blue-100 text-blue-700", cards: [
                        { name: "Priya Sharma", score: 82, tag: "React · 6 yrs" },
                        { name: "Alex Chen",    score: 74, tag: "Vue · 4 yrs"   },
                      ]},
                      { label: "Shortlisted",  color: "bg-violet-100 text-violet-700", cards: [
                        { name: "Marcus Liu",   score: 91, tag: "Next.js · 7 yrs" },
                      ]},
                      { label: "Interviewing", color: "bg-amber-100 text-amber-700", cards: [
                        { name: "Sara Mendes",  score: 88, tag: "TypeScript · 5 yrs" },
                      ]},
                      { label: "Offer",  color: "bg-orange-100 text-orange-700", cards: [] },
                      { label: "Hired",  color: "bg-green-100  text-green-700",  cards: [] },
                    ].map((col) => (
                      <div key={col.label} className="rounded-xl bg-white border border-slate-200/80 p-2.5 sm:p-3 shadow-sm flex-1 min-w-[120px] sm:min-w-0">
                        <div className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold mb-2.5 sm:mb-3 ${col.color}`}>
                          {col.label}
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                          {col.cards.map((c) => (
                            <div key={c.name} className="rounded-lg border border-slate-100 bg-slate-50 p-2">
                              <div className="flex items-center justify-between mb-1 gap-1">
                                <span className="text-[10px] sm:text-xs font-medium text-slate-700 truncate">{c.name}</span>
                                <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${c.score >= 80 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                                  {c.score}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400">{c.tag}</span>
                            </div>
                          ))}
                          {col.cards.length === 0 && (
                            <div className="h-12 sm:h-14 rounded-lg border-2 border-dashed border-slate-100 flex items-center justify-center">
                              <span className="text-[10px] text-slate-300">Empty</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Swipe hint — mobile only */}
                <div className="sm:hidden flex items-center justify-center gap-1.5 pb-3 text-[10px] text-slate-300">
                  <span>←</span> swipe to explore <span>→</span>
                </div>
              </div>
            </div>

            {/* Floating score card — desktop only */}
            <div className="absolute -right-4 top-20 hidden lg:block w-52 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                  <Brain className="h-3 w-3 text-white" />
                </div>
                <span className="text-xs font-semibold text-slate-700">AI Match Score</span>
              </div>
              <div className="text-3xl font-extrabold text-green-600 mb-1">91<span className="text-base font-normal text-slate-400">/100</span></div>
              <div className="h-2 w-full bg-slate-100 rounded-full mb-3">
                <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" style={{ width: "91%" }} />
              </div>
              <div className="space-y-1.5">
                <div className="flex gap-1.5 text-[10px]"><span className="text-green-600 font-bold">✓</span><span className="text-slate-600">7 yrs Next.js experience</span></div>
                <div className="flex gap-1.5 text-[10px]"><span className="text-green-600 font-bold">✓</span><span className="text-slate-600">Led team of 5 engineers</span></div>
                <div className="flex gap-1.5 text-[10px]"><span className="text-red-500 font-bold">✗</span><span className="text-slate-500">No AWS experience</span></div>
              </div>
            </div>

            {/* Floating time card — desktop only */}
            <div className="absolute -left-4 bottom-20 hidden lg:block w-44 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/50">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-semibold text-slate-700">Time saved</span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900">3.2 hrs</div>
              <div className="text-[10px] text-slate-400 mt-0.5">per candidate screened</div>
              <div className="mt-2 flex items-center gap-1 text-[10px] text-green-600 font-semibold">
                <TrendingUp className="h-3 w-3" /> vs manual process
              </div>
            </div>
          </div>
        </section>

        {/* ── Metrics strip ── */}
        <section className="border-y border-slate-100 bg-slate-50 py-12 px-6">
          <div className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "< 30s", label: "To screen a resume" },
              { value: "0–100", label: "AI match score, every candidate" },
              { value: "5 min", label: "To set up your first job" },
              { value: "1-click", label: "Interview coordinator email" },
            ].map((m) => (
              <div key={m.label} className="text-center">
                <div className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">{m.value}</div>
                <div className="mt-1 text-sm text-slate-500">{m.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Pain → Solution ── */}
        <section className="py-24 px-6">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Recruiting ops eat your day.<br />Optichire gives it back.</h2>
              <p className="mt-4 text-lg text-slate-500 max-w-xl mx-auto">Every manual step in your hiring workflow — we've automated it.</p>
            </div>

            <div className="space-y-6">
              {[
                {
                  pain: "Wading through 50 resumes, manually comparing against a JD",
                  fix: "Upload the resume. AI reads it, extracts name/skills/salary/notice period, and gives a 0-100 match score with a plain-English rationale.",
                  icon: <ScanLine className="h-5 w-5" />,
                  gradient: "from-blue-500 to-cyan-500",
                  bg: "from-blue-50 to-cyan-50",
                },
                {
                  pain: "Writing bespoke boolean strings for every new role from scratch",
                  fix: "Paste the job description. AI generates a LinkedIn-ready boolean search string, a candidate persona, and a sourcing checklist.",
                  icon: <Search className="h-5 w-5" />,
                  gradient: "from-violet-500 to-purple-500",
                  bg: "from-violet-50 to-purple-50",
                },
                {
                  pain: "Copy-pasting interview details into emails one candidate at a time",
                  fix: "Mark a candidate shortlisted, drop your booking link. AI drafts a professional scheduling email (and a WhatsApp version) instantly.",
                  icon: <MessageSquare className="h-5 w-5" />,
                  gradient: "from-orange-500 to-rose-500",
                  bg: "from-orange-50 to-rose-50",
                },
                {
                  pain: "Losing track of where candidates are across multiple open roles",
                  fix: "One Kanban pipeline per job, synced in real time. Status, score, and next action visible at a glance — no spreadsheet needed.",
                  icon: <BarChart3 className="h-5 w-5" />,
                  gradient: "from-emerald-500 to-teal-500",
                  bg: "from-emerald-50 to-teal-50",
                },
              ].map((item, i) => (
                <div key={i} className={`rounded-2xl bg-gradient-to-r ${item.bg} border border-slate-200/60 p-6 flex flex-col sm:flex-row gap-5 items-start`}>
                  <div className={`shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white shadow-md`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">The pain</p>
                      <p className="text-slate-600 text-sm leading-relaxed">{item.pain}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-1.5">Optichire fix</p>
                      <p className="text-slate-700 text-sm leading-relaxed font-medium">{item.fix}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="workflow" className="py-24 px-6 bg-gradient-to-br from-indigo-950 via-blue-950 to-violet-950">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">From JD to hired in<br />
                <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">one seamless flow</span>
              </h2>
              <p className="mt-4 text-slate-400 max-w-xl mx-auto">No 47-step onboarding. No integrations maze. Just a clean loop — from intake to offer.</p>
            </div>

            <div className="relative">
              {/* Connecting line */}
              <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-blue-500 via-violet-500 to-emerald-500 hidden sm:block" />

              <div className="space-y-6">
                {[
                  {
                    step: "01",
                    title: "Paste your job description",
                    desc: "Drop in your messy JD. AI extracts role requirements, seniority, skills, and instantly generates a LinkedIn boolean string + candidate persona.",
                    tag: "< 10 seconds",
                    color: "from-blue-500 to-cyan-500",
                  },
                  {
                    step: "02",
                    title: "Screen candidates with AI",
                    desc: "Upload a resume (PDF/DOCX) or paste call notes. Get a structured profile — name, title, experience, salary, notice period — plus a 0-100 match score against your JD.",
                    tag: "< 30 seconds",
                    color: "from-violet-500 to-purple-500",
                  },
                  {
                    step: "03",
                    title: "Move them through your pipeline",
                    desc: "Shortlist, interview, offer — one Kanban board per role. Track every candidate's stage, score, and last update. Stale candidates surface automatically.",
                    tag: "Always in sync",
                    color: "from-amber-500 to-orange-500",
                  },
                  {
                    step: "04",
                    title: "Coordinate interviews in one click",
                    desc: "Shortlist a candidate. Add your booking link. AI writes a warm scheduling email and a WhatsApp follow-up. Send or copy in seconds.",
                    tag: "No copy-pasting",
                    color: "from-emerald-500 to-teal-500",
                  },
                ].map((s, i) => (
                  <div key={i} className="relative sm:pl-16">
                    <div className={`absolute left-0 top-0 h-12 w-12 rounded-xl bg-gradient-to-br ${s.color} flex flex-col items-center justify-center shadow-lg shrink-0 hidden sm:flex`}>
                      <span className="text-[10px] font-black text-white/70 leading-none">STEP</span>
                      <span className="text-sm font-black text-white leading-none">{s.step}</span>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <h3 className="font-bold text-white text-lg mb-1">{s.title}</h3>
                          <p className="text-slate-400 text-sm leading-relaxed max-w-lg">{s.desc}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold bg-gradient-to-r ${s.color} text-white shadow-md`}>{s.tag}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Features grid ── */}
        <section id="features" className="py-24 px-6">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Everything a recruiter needs.<br />Nothing they don't.</h2>
              <p className="mt-4 text-lg text-slate-500 max-w-xl mx-auto">Built for how recruiters actually work — not how enterprise software assumes they do.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  icon: <Brain className="h-5 w-5" />,
                  title: "Resume AI extraction",
                  desc: "Upload any PDF, DOCX or paste notes. Get structured data — skills, salary, notice period, experience — in one call.",
                  color: "from-blue-500 to-cyan-500",
                  bg: "bg-blue-50",
                },
                {
                  icon: <Search className="h-5 w-5" />,
                  title: "Boolean string generator",
                  desc: "Paste a JD and get a LinkedIn-ready search string with seniority filters and skill synonyms.",
                  color: "from-violet-500 to-indigo-500",
                  bg: "bg-violet-50",
                },
                {
                  icon: <BarChart3 className="h-5 w-5" />,
                  title: "0-100 match scoring",
                  desc: "Every candidate gets a fit score vs your JD with a plain-English breakdown of strengths and gaps.",
                  color: "from-emerald-500 to-teal-500",
                  bg: "bg-emerald-50",
                },
                {
                  icon: <Users className="h-5 w-5" />,
                  title: "Kanban pipeline",
                  desc: "One board per job. Drag candidates from Screening to Hired. Score, stage, and staleness at a glance.",
                  color: "from-amber-500 to-orange-500",
                  bg: "bg-amber-50",
                },
                {
                  icon: <CalendarClock className="h-5 w-5" />,
                  title: "Interview coordinator",
                  desc: "Drop your Calendly link. Get a warm scheduling email and WhatsApp message — pre-written, ready to send.",
                  color: "from-rose-500 to-pink-500",
                  bg: "bg-rose-50",
                },
                {
                  icon: <TrendingUp className="h-5 w-5" />,
                  title: "Silver medalist surfacing",
                  desc: "When a new role opens, AI flags previously rejected high-scorers who are now a great fit.",
                  color: "from-slate-600 to-slate-800",
                  bg: "bg-slate-50",
                },
                {
                  icon: <FileText className="h-5 w-5" />,
                  title: "Bulk resume upload",
                  desc: "Drop a folder of CVs. AI screens them all in parallel — structured profiles ready by the time you get coffee.",
                  color: "from-blue-600 to-blue-800",
                  bg: "bg-blue-50",
                },
                {
                  icon: <MessageSquare className="h-5 w-5" />,
                  title: "Screening kit",
                  desc: "Per-candidate dossier: pitch deck, gap analysis, 5 tailored screening questions, and recruiter notes.",
                  color: "from-violet-600 to-violet-800",
                  bg: "bg-violet-50",
                },
                {
                  icon: <Shield className="h-5 w-5" />,
                  title: "Reports & analytics",
                  desc: "Pipeline funnel, source breakdown, per-job stats. Export to CSV in one click for any stakeholder.",
                  color: "from-emerald-600 to-teal-700",
                  bg: "bg-emerald-50",
                },
              ].map((f) => (
                <div key={f.title} className={`group rounded-2xl border border-slate-200 ${f.bg} p-6 hover:shadow-lg hover:shadow-slate-200/60 transition-all duration-200`}>
                  <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} text-white shadow-md`}>
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1.5">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="py-24 px-6 bg-slate-50 border-y border-slate-200">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-14">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Completely free</h2>
              <p className="mt-4 text-lg text-slate-500">No credit card. No hidden fees. Just start recruiting smarter.</p>
            </div>

            <div className="rounded-2xl border-2 border-blue-500 bg-white p-10 shadow-xl shadow-blue-100/60 mx-auto max-w-md">
              <div className="text-5xl font-extrabold text-slate-900 mb-1">$0</div>
              <div className="text-slate-400 text-sm mb-8">Free forever</div>
              <ul className="space-y-3 mb-8 text-left">
                {["100 AI calls / month", "Unlimited jobs", "Unlimited candidates", "Full pipeline & scoring", "Bulk resume upload", "Market intelligence reports", "CSV export"].map((i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />{i}
                  </li>
                ))}
              </ul>
              <Button asChild className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 border-0 text-white shadow-md font-bold h-12">
                <Link href="/login">Get started free</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-28 px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700 mb-8">
              <Sparkles className="h-3.5 w-3.5" />
              Free to use — no credit card needed
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Your next great hire<br />is waiting in your inbox.
            </h2>
            <p className="mt-6 text-lg text-slate-500 max-w-lg mx-auto">
              Stop drowning in resumes. Start Optichire today — free, no credit card, ready in 5 minutes.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="h-14 px-10 text-base bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 border-0 text-white shadow-xl shadow-blue-200/60 rounded-xl font-bold">
                <Link href="/login" className="flex items-center gap-2">
                  Get started — it's free <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-slate-400">No credit card required · 100 free AI calls every month</p>
          </div>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 py-10 px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <LogoOptichire size="sm" />
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} Optichire. Built for recruiters who actually want to go home on time.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400 justify-center">
            <Link href="/privacy" className="hover:text-slate-700 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-700 transition-colors">Terms</Link>
            <Link href="/dpa" className="hover:text-slate-700 transition-colors">Data processing</Link>
            <a href="mailto:privacy@optichire.com" className="hover:text-slate-700 transition-colors">Contact</a>
            <Link href="/login" className="hover:text-slate-700 transition-colors">Sign in</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
