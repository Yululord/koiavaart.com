"use client";

import { useEffect, useRef } from "react";
import { site } from "@/data/site";
import { RING_RUNWAY_ID } from "@/lib/constants";
import { ringScrollProgress } from "@/lib/scroll-progress";

/**
 * Scroll runway for the hero sequence. The wordmark lives in <Brand /> and
 * the artworks in <WorksRing />, both fixed overlays — this element supplies
 * the scroll distance that drives them.
 *
 * The footer captions are pinned for the whole sequence and then simply
 * clear out as the About section arrives, rather than travelling up the
 * page. Only the Contact button persists past this point.
 */
export function Hero() {
  const captionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    let last = -1;

    const tick = () => {
      const el = captionsRef.current;
      if (el) {
        const p = ringScrollProgress();
        const t = Math.max(0, Math.min(1, (p - 0.9) / 0.08));
        const opacity = 1 - t * t * (3 - 2 * t);
        if (opacity !== last) {
          last = opacity;
          el.style.opacity = String(opacity);
          el.style.visibility = opacity < 0.01 ? "hidden" : "visible";
        }
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <>
      <div id={RING_RUNWAY_ID} className="h-[420vh]" />
      <div
        ref={captionsRef}
        className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex h-24 items-center justify-between px-6 sm:px-10"
      >
        <p className="font-body text-sm text-muted">{site.copyright}</p>
        <p className="hidden font-body text-sm text-muted md:block">
          {site.categories.join(" · ")}
        </p>
      </div>
    </>
  );
}
