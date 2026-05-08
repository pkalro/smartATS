/** @type {import('next').NextConfig} */
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
};

export default nextConfig;
