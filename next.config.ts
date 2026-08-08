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
  images: {
    // next/image refuses to optimise a host it has not been told about, so
    // the paintings and the portrait — all served from Sanity's CDN — have
    // to be named here. The hero draws its own textures in WebGL and is
    // unaffected; this is for the detail view and the About portrait.
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
};

export default nextConfig;
