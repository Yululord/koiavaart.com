import type { NextConfig } from "next";

/**
 * Hosts allowed to reach the dev server, read from DEV_ORIGINS in .env.local
 * as a comma-separated list.
 *
 * Next blocks cross-origin requests to dev-only assets, so opening the dev
 * server from a phone on the same network serves the HTML and none of the
 * JavaScript. The addresses that need allowing are personal to whoever is
 * working on the site — a LAN address and a machine name — so they stay out
 * of the repository. See .env.example. No effect on a production build.
 */
const devOrigins = (process.env.DEV_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  allowedDevOrigins: devOrigins,
  /**
   * Analytics traffic goes to our own domain and is forwarded from here.
   *
   * PostHog's own hostnames appear on every ad-blocker list, so measuring
   * straight from them loses a large and unpredictable share of real
   * visitors — exactly the number this is meant to report.
   *
   * `skipTrailingSlashRedirect` keeps the redirect that would otherwise be
   * applied to /ingest/... from breaking the ingest calls.
   */
  skipTrailingSlashRedirect: true,
  async rewrites() {
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    if (!host) return [];

    // EU and US clouds put ingestion on a different hostname to the assets.
    const assets = host.replace("//eu.", "//eu-assets.").replace("//us.", "//us-assets.");

    return [
      { source: "/ingest/static/:path*", destination: `${assets}/static/:path*` },
      { source: "/ingest/:path*", destination: `${host}/:path*` },
    ];
  },
  images: {
    // next/image refuses to optimise a host it has not been told about, so
    // the paintings and the portrait — all served from Sanity's CDN — have
    // to be named here. The hero draws its own textures in WebGL and is
    // unaffected; this is for the detail view and the About portrait.
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
};

export default nextConfig;
