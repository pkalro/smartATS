"use client";

import { usePostHog } from "posthog-js/react";
import { useEffect } from "react";

/**
 * Identifies the logged-in user in PostHog so events are tied to a real person.
 * Drop this inside the dashboard layout (client boundary).
 */
export function PostHogIdentify({
  userId,
  name,
  email,
}: {
  userId: string;
  name?: string | null;
  email?: string | null;
}) {
  const posthog = usePostHog();

  useEffect(() => {
    if (!posthog || !userId) return;
    posthog.identify(userId, {
      name: name ?? undefined,
      email: email ?? undefined,
    });
  }, [posthog, userId, name, email]);

  return null;
}
