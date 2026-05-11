import { signIn, auth } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle } from "lucide-react";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const { callbackUrl } = await searchParams;
  if (session) redirect(callbackUrl ?? "/jobs");

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left — brand panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-gradient-to-br from-indigo-950 via-blue-950 to-violet-950 p-12 relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-violet-600/20 blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-white text-xl tracking-tight">Smart ATS</span>
          </Link>
        </div>

        <div className="relative space-y-8">
          <div>
            <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
              Hire smarter,<br />
              <span className="bg-gradient-to-r from-blue-300 to-violet-300 bg-clip-text text-transparent">not harder.</span>
            </h1>
            <p className="mt-4 text-blue-200/80 text-lg leading-relaxed max-w-xs">
              AI-powered candidate screening, pipeline management, and interview coordination — built for recruiters.
            </p>
          </div>

          <div className="space-y-3">
            {[
              "Resume AI extraction in under 30 seconds",
              "0–100 match score against every JD",
              "Interview emails written automatically",
              "Full pipeline Kanban, always in sync",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-white/15">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-300" />
                </div>
                <span className="text-sm text-blue-100/90">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-xs text-blue-300/50">
          © {new Date().getFullYear()} Smart ATS
        </div>
      </div>

      {/* Right — sign in */}
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">Smart ATS</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome back</h2>
            <p className="mt-1.5 text-slate-500 text-sm">Sign in to your account to continue.</p>
          </div>

          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: callbackUrl ?? "/jobs" });
            }}
            className="space-y-4"
          >
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md active:scale-[0.98]"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400 leading-relaxed">
            By signing in you agree to our{" "}
            <Link href="/terms" className="underline hover:text-slate-700">Terms</Link>,{" "}
            <Link href="/privacy" className="underline hover:text-slate-700">Privacy Policy</Link>{" "}
            and{" "}
            <Link href="/dpa" className="underline hover:text-slate-700">Data Processing Agreement</Link>.
          </p>

          <div className="mt-10 pt-6 border-t border-slate-100">
            <p className="text-center text-xs text-slate-400">
              No account? Signing in with Google creates one instantly — it&apos;s free.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.95l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
    </svg>
  );
}
