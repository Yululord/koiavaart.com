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
      {/* Mobile only needs enough runway for the wordmark to reach the
          header and the scene to fade; the grid follows it. Desktop still
          has the whole unwrap and the strip's travel to play out. */}
      <div id={RING_RUNWAY_ID} className="h-[125vh] md:h-[420vh]" />
      <div
        ref={captionsRef}
        // Desktop only. The mobile design has nothing down here but the
        // Contact button — its categories sit under the wordmark instead,
        // in <Brand />.
        className="pointer-events-none fixed inset-x-0 bottom-0 z-30 hidden h-24 items-center justify-between px-10 md:flex"
      >
        <p className="font-body text-sm text-muted">{site.copyright}</p>
        <p className="font-body text-sm text-muted">
          {site.categories.map((category, i) => (
            <span key={category}>
              {i > 0 && <span> · </span>}
              <span>{category}</span>
            </span>
          ))}
        </p>
      </div>
    </>
  );
}
