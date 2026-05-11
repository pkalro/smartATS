"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import posthog from "posthog-js";

const STORAGE_KEY = "smartats:cookie-consent";
type Consent = "accepted" | "rejected" | null;

function readConsent(): Consent {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "accepted" || v === "rejected" ? v : null;
}

/** Apply the user's choice to PostHog. Safe to call before init — falls back if not loaded. */
function applyConsent(c: Consent) {
  try {
    if (c === "accepted") posthog.opt_in_capturing?.();
    else posthog.opt_out_capturing?.();
  } catch { /* posthog not initialised yet — provider will sync on init */ }
}

export function CookieConsent() {
  const [consent, setConsent] = useState<Consent>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const c = readConsent();
    setConsent(c);
    applyConsent(c);
  }, []);

  function decide(c: "accepted" | "rejected") {
    window.localStorage.setItem(STORAGE_KEY, c);
    setConsent(c);
    applyConsent(c);
  }

  if (!mounted || consent !== null) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] md:left-auto md:right-6 md:bottom-6 md:w-[420px]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/10">
        <div className="flex items-start gap-3 mb-3">
          <div className="text-2xl leading-none">🍪</div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900 text-sm mb-1">We use cookies</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Essential cookies keep you signed in. With your consent, we also use analytics cookies (PostHog)
              to understand which features are useful. You can change your mind any time from the footer.
              See our <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => decide("rejected")}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Essential only
          </button>
          <button
            onClick={() => decide("accepted")}
            className="rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-3 py-1.5 text-xs font-semibold text-white hover:from-blue-700 hover:to-violet-700 transition-colors"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}

/** Footer link to re-open the consent choice — clears stored decision and reloads. */
export function ManageCookiesLink({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window === "undefined") return;
        window.localStorage.removeItem(STORAGE_KEY);
        window.location.reload();
      }}
      className={className ?? "text-slate-400 hover:text-slate-700 text-xs"}
    >
      Manage cookies
    </button>
  );
}
