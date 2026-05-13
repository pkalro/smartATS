/** @type {import('next').NextConfig} */

// Tight Content-Security-Policy. Allows the SDKs we ship: PostHog (analytics),
// Google avatars (OAuth profile images), Vercel Live (preview deploys).
// `unsafe-inline`/`unsafe-eval` on script-src is needed for the Next.js runtime —
// can be tightened with nonces later.
const ContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.posthog.com https://*.i.posthog.com https://vercel.live",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.googleusercontent.com https://*.gstatic.com https://*.posthog.com",
  "font-src 'self' data:",
  // PostHog traffic now goes via /ingest proxy (same origin), but keep direct
  // host as fallback in case the rewrite hasn't propagated yet.
  "connect-src 'self' https://*.posthog.com https://*.i.posthog.com https://vercel.live wss://ws-us3.pusher.com",
  "frame-src 'self' https://vercel.live",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: ContentSecurityPolicy },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options",           value: "DENY" },
  { key: "X-Content-Type-Options",    value: "nosniff" },
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "X-DNS-Prefetch-Control",    value: "on" },
];

const nextConfig = {
  // Don't bundle these through webpack — they use native Node.js APIs
  // (filesystem reads, native bindings) that webpack can't handle.
  serverExternalPackages: ["pdf-parse", "mammoth"],

  experimental: {
    serverActions: {
      // Single resume: ~10MB is plenty.
      // Bulk upload: 25 files × up to 5MB each = needs more headroom.
      bodySizeLimit: "50mb",
    },
  },

  webpack: (config) => {
    // pdf-parse pulls in canvas as an optional dep — alias it away
    config.resolve.alias.canvas = false;
    return config;
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },

  // Proxy PostHog ingestion through our own domain so ad-blockers don't
  // intercept the requests. The /ingest path is never publicly linked so
  // it won't appear in sitemaps or CSP violations.
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      {
        source: "/ingest/decide",
        destination: "https://us.i.posthog.com/decide",
      },
    ];
  },
};

export default nextConfig;
