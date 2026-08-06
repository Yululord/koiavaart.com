import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev-only assets are blocked for any origin but the one the server was
  // started on, so opening the dev server from a phone on the same network
  // serves the HTML and none of the JavaScript. These are the origins we
  // reach it from; it has no effect on a production build.
  allowedDevOrigins: ["<your-lan-ip>", "<your-hostname>.local"],
};

export default nextConfig;
