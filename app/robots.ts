import type { MetadataRoute } from "next";

/**
 * Crawl rules: allow the public marketing/legal pages, keep the dashboard,
 * APIs and share links out of search indexes.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://optichire.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/privacy", "/terms", "/dpa", "/login"],
        disallow: [
          "/api/",
          "/dashboard",
          "/jobs",
          "/candidates",
          "/pipeline",
          "/reports",
          "/settings",
          "/share/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
