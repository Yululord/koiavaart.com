"use client";

import { useEffect, useRef } from "react";
import { site } from "@/data/site";
import { RING_RUNWAY_ID } from "@/lib/constants";
import { ringScrollOverflow } from "@/lib/scroll-progress";

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
        // The captions belong to the hero, so they hold for the whole
        // sequence and then leave with it, rather than fading out while
        // the strip is still travelling.
        const over = ringScrollOverflow() / (window.innerHeight * 0.3);
        const t = Math.max(0, Math.min(1, over));
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
        className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex flex-col items-stretch px-6 sm:h-24 sm:flex-row sm:items-center sm:justify-between sm:px-10"
      >
        {/* The mobile design drops the copyright and puts the categories on
            their own row above the Contact button, spread edge to edge. */}
        <p className="hidden font-body text-sm text-muted sm:block">
          {site.copyright}
        </p>
        <p className="flex justify-between pb-28 font-body text-sm text-muted sm:block sm:pb-0">
          {site.categories.map((category, i) => (
            <span key={category} className="contents sm:inline">
              {i > 0 && <span className="sm:inline"> · </span>}
              <span>{category}</span>
            </span>
          ))}
        </p>
      </div>
    </>
  );
}
