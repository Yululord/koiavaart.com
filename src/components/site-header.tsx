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
        // Mobile's morph runs long, so the bar arrives late to match; on
        // desktop the name is home by 0.3 and the bar meets it there.
        const mobile = window.innerWidth < 768;
        const start = mobile ? 0.5 : 0.18;
        const t = Math.max(0, Math.min(1, (p - start) / 0.14));
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
