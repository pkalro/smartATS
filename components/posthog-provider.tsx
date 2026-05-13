"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;

    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
      capture_pageview: false,        // handled manually by the page view hook
      capture_pageleave: true,
      respect_dnt: true,
      // Default to opted-out. The CookieConsent banner flips this to opt-in if the user accepts.
      opt_out_capturing_by_default: true,
      persistence: "localStorage+cookie",
      sanitize_properties: (props) => props,
    });

    // Sync with stored consent (set by CookieConsent banner)
    try {
      const stored = window.localStorage.getItem("optichire:cookie-consent");
      if (stored === "accepted") posthog.opt_in_capturing();
      else posthog.opt_out_capturing();
    } catch { /* localStorage unavailable */ }
  }, []);

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return <>{children}</>;

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
