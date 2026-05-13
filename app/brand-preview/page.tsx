import { LogoOptichire, LogoSift, LogoCal, LogoSignal } from "@/components/brand/logos";

export default function BrandPreviewPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-16 px-6">
      <div className="mx-auto max-w-4xl space-y-16">

        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Brand identity</p>
          <h1 className="text-3xl font-extrabold text-slate-900">Optichire logo</h1>
          <p className="mt-2 text-sm text-slate-500">optichire.com</p>
        </div>

        {/* ── Primary brand ── */}
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-sky-500 to-indigo-500 px-8 py-5 flex items-center justify-between">
            <LogoOptichire size="lg" className="[&_span]:!text-white" mark />
            <span className="text-white/70 text-sm italic hidden sm:block">
              Hire with optical precision.
            </span>
          </div>

          <div className="p-8 space-y-10">
            {/* Size scale */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-5">Size scale</p>
              <div className="flex flex-wrap items-end gap-8">
                {(["sm", "md", "lg", "xl"] as const).map((s) => (
                  <div key={s} className="flex flex-col items-start gap-2">
                    <LogoOptichire size={s} />
                    <span className="text-[10px] text-slate-400 font-mono">{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Variants */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-5">Variants</p>
              <div className="flex flex-wrap gap-6 items-center">
                <div className="flex flex-col items-center gap-2">
                  <LogoOptichire size="md" mark={false} />
                  <span className="text-[10px] text-slate-400">icon only</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <LogoOptichire size="md" />
                  <span className="text-[10px] text-slate-400">full mark</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <LogoOptichire size="md" mono />
                  <span className="text-[10px] text-slate-400">mono</span>
                </div>
                <div className="flex flex-col items-center gap-2 rounded-xl bg-sky-50 border border-sky-100 px-4 py-3">
                  <LogoOptichire size="md" />
                  <span className="text-[10px] font-medium text-sky-700">on tint</span>
                </div>
                <div className="flex flex-col items-center gap-2 rounded-xl bg-slate-900 px-4 py-3">
                  <LogoOptichire size="md" className="[&_span]:!text-white" />
                  <span className="text-[10px] text-slate-400">on dark</span>
                </div>
              </div>
            </div>

            {/* Taglines */}
            <div className="rounded-2xl bg-sky-50 px-6 py-4 space-y-1.5">
              {[
                "Hire with optical precision.",
                "See every candidate clearly.",
                "Sharp focus. Better hires.",
                "Your AI recruiting lens.",
              ].map((t) => (
                <p key={t} className="text-sm font-semibold text-sky-800">"{t}"</p>
              ))}
            </div>
          </div>
        </section>

        {/* ── Previous concepts (archived) ── */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-6">
            Previous concepts (archived)
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { Logo: LogoSift,   name: "Sift",   tagline: "Hire on signal, not volume.",           bg: "bg-violet-50" },
              { Logo: LogoCal,    name: "Calibr",  tagline: "Hire to a higher standard.",            bg: "bg-emerald-50" },
              { Logo: LogoSignal, name: "Signal",  tagline: "Cut through the noise. Hire on Signal.", bg: "bg-indigo-50" },
            ].map(({ Logo, name, tagline, bg }) => (
              <div key={name} className={`rounded-2xl border border-slate-200 ${bg} p-5 space-y-3 opacity-60`}>
                <Logo size="sm" />
                <p className="text-xs text-slate-500 italic">"{tagline}"</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
