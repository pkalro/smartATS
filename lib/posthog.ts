import { PostHog } from "posthog-node";

// Server-side PostHog client (for server actions + API routes)
let _client: PostHog | null = null;

export function getPostHogClient(): PostHog | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;
  if (!_client) {
    _client = new PostHog(key, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
      flushAt: 1,   // flush immediately in serverless
      flushInterval: 0,
    });
  }
  return _client;
}

/**
 * Track a server-side event (call from server actions / API routes).
 * Silently no-ops if NEXT_PUBLIC_POSTHOG_KEY is not set.
 */
export async function trackEvent(
  userId: string,
  event: string,
  properties?: Record<string, unknown>
) {
  const client = getPostHogClient();
  if (!client) return;
  client.capture({ distinctId: userId, event, properties });
  await client.flush();
}
