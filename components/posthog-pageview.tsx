"use client";

/**
 * Fires a $pageview event on every client-side navigation.
 * Must be wrapped in Suspense because useSearchParams() opts the
 * subtree out of static rendering.
 */
import { usePathname, useSearchParams } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { useEffect, Suspense } from "react";

function PageViewTracker() {
  const pathname  = usePathname();
  const searchParams = useSearchParams();
  const posthog   = usePostHog();

  useEffect(() => {
    if (!pathname || !posthog) return;
    let url = window.location.origin + pathname;
    if (searchParams.toString()) url += `?${searchParams.toString()}`;
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams, posthog]);

  return null;
}

/** Drop this anywhere inside <PostHogProvider> — once in the root layout is enough. */
export function PostHogPageView() {
  return (
    <Suspense fallback={null}>
      <PageViewTracker />
    </Suspense>
  );
}
