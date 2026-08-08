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
};

export default nextConfig;
