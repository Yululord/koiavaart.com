"use client";

import { useEffect, useRef } from "react";
import { ringScrollProgress } from "@/lib/scroll-progress";

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
        const p = ringScrollProgress();
        const t = Math.max(0, Math.min(1, (p - 0.18) / 0.14));
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
      className="pointer-events-none fixed inset-x-0 top-0 z-40 h-16 border-b border-line bg-white"
    />
  );
}
