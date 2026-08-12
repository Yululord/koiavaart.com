"use client";

import { useEffect, useRef } from "react";
import { ringScrollProgress } from "@/lib/scroll-progress";
import { mobileMorph } from "@/lib/hero-layout";

/**
 * Just the bar itself. The wordmark and tagline that sit inside it are
 * owned by <Brand />, which scales them down into place as you scroll.
 */
export function SiteHeader() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const bar = barRef.current;
      if (bar) {
        // Mobile follows the wordmark, which follows the grid; desktop runs
        // on scroll progress.
        const mobile = window.innerWidth < 768;
        const t = mobile
          ? mobileMorph(window.innerWidth, window.innerHeight)
          : Math.max(
              0,
              Math.min(1, (ringScrollProgress() - 0.18) / 0.14),
            );
        bar.style.opacity = String(t);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      ref={barRef}
      style={{ opacity: 0 }}
      // Shorter on mobile, where the wordmark it catches settles at 18px
      // rather than 24px.
      className="pointer-events-none fixed inset-x-0 top-0 z-40 h-14 border-b border-line bg-white md:h-16"
    />
  );
}
