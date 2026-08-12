import type { Metadata } from "next";
import localFont from "next/font/local";
import "lenis/dist/lenis.css";
import "./globals.css";
import { SmoothScroll } from "@/components/smooth-scroll";

// General Sans (Fontshare, free licence) — the single family used across
// the design. Self-hosted so there is no runtime dependency on the CDN.
const generalSans = localFont({
  variable: "--font-sans",
  display: "swap",
  src: [
    { path: "../fonts/GeneralSans-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/GeneralSans-Medium.woff2", weight: "500", style: "normal" },
  ],
});

const title = "Valeriia Koiava — Contemporary Artist";
const description =
  "Valeriia Koiava is a Ukrainian contemporary artist working in painting, photography, jewelry, and interiors.";

/**
 * The icons and the social card are not listed here: Next picks up
 * icon.png, apple-icon.png, opengraph-image.png and twitter-image.png from
 * this directory by name, hashes them and writes the tags itself.
 *
 * metadataBase is what makes the card's URL absolute — without it the image
 * is advertised as a relative path, which every social platform ignores.
 */
export const metadata: Metadata = {
  metadataBase: new URL("https://koiavaart.com"),
  title,
  description,
  openGraph: {
    title,
    description,
    url: "https://koiavaart.com",
    siteName: "Valeriia Koiava",
    locale: "en",
    type: "website",
  },
  twitter: { card: "summary_large_image", title, description },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={generalSans.variable}>
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
