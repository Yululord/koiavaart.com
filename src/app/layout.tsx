import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "Valeriia Koiava — Contemporary Artist",
  description:
    "Valeriia Koiava is a Ukrainian contemporary artist working in painting, photography, jewelry, and interiors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={generalSans.variable}>
      <body>{children}</body>
    </html>
  );
}
