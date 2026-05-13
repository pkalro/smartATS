import Link from "next/link";
import { LogoOptichire } from "@/components/brand/logos";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200/60 bg-white">
        <div className="mx-auto max-w-4xl px-6 flex h-16 items-center justify-between">
          <Link href="/">
            <LogoOptichire size="sm" />
          </Link>
          <nav className="flex items-center gap-3 sm:gap-6 text-sm text-slate-600">
            <Link href="/privacy" className="hover:text-slate-900">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-900">Terms</Link>
            <Link href="/dpa" className="hover:text-slate-900">DPA</Link>
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">Sign in</Link>
          </nav>
        </div>
      </header>

      {/* Content — typography styled inline since we don't ship @tailwindcss/typography */}
      <main className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        <article className="legal-doc text-slate-600 leading-relaxed">
          {children}
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 mt-16">
        <div className="mx-auto max-w-4xl px-6 py-8 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-400">
          <span>© {new Date().getFullYear()} Optichire</span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/privacy" className="hover:text-slate-700">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-700">Terms</Link>
            <Link href="/dpa" className="hover:text-slate-700">Data processing</Link>
            <a href="mailto:privacy@optichire.com" className="hover:text-slate-700">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
