import { PostHog } from "posthog-node";

/**
 * Track a server-side event from a server action or API route.
 *
 * Creates a fresh client per call and calls shutdown() so the HTTP request
 * is guaranteed to complete before the serverless function exits.
 * Silently no-ops when NEXT_PUBLIC_POSTHOG_KEY is not set.
 */
export async function trackEvent(
  userId: string,
  event: string,
  properties?: Record<string, unknown>
) {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;

  const client = new PostHog(key, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
    flushAt: 1,
    flushInterval: 0,
  });

  client.capture({ distinctId: userId, event, properties });
  await client.shutdown(); // flushes + closes — safe in serverless
}
