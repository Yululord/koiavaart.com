"use client";

import { useEffect, useRef } from "react";
import { site } from "@/data/site";
import { featuredArtwork } from "@/data/about";
import { RING_RUNWAY_ID } from "@/lib/constants";
import { ringScrollProgress } from "@/lib/scroll-progress";

/** Caption belongs to the resolved line: in after it forms, out before About. */
function captionOpacity(p: number) {
  if (p < 0.58) return 0;
  if (p < 0.7) return (p - 0.58) / 0.12;
  if (p < 0.82) return 1;
  if (p < 0.95) return 1 - (p - 0.82) / 0.13;
  return 0;
}

export function Hero() {
  const captionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    let last = -1;

    const tick = () => {
      const caption = captionRef.current;
      if (caption) {
        const value = captionOpacity(ringScrollProgress());
        if (value !== last) {
          last = value;
          caption.style.opacity = String(value);
          caption.style.transform = `translateY(${(1 - value) * 24}px)`;
        }
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div id={RING_RUNWAY_ID} className="relative h-[320vh]">
      {/* position:sticky creates its own stacking context, so the z-index
          lives here rather than on the children — otherwise the ring canvas
          paints over the wordmark. */}
      <div className="sticky top-0 z-20 flex h-screen flex-col justify-between px-6 py-8 sm:px-10 sm:py-10">
        <div>
          <h1 className="font-display text-[clamp(2.75rem,12.6vw,11rem)] uppercase leading-[0.88] text-ink">
            {site.name}
          </h1>
          <div className="mt-4 flex items-start justify-between font-body text-sm text-muted sm:mt-6 sm:text-base">
            <p>{site.taglineLeft}</p>
            <p>{site.taglineRight}</p>
          </div>
        </div>

        <div
          ref={captionRef}
          style={{ opacity: 0 }}
          className="mx-auto flex w-full max-w-4xl flex-col items-start gap-6 pb-10 sm:flex-row sm:items-center sm:gap-12"
        >
          <div className="flex shrink-0 flex-col items-start gap-3">
            <h2 className="font-display max-w-[10ch] text-2xl uppercase leading-none text-ink sm:text-4xl">
              {featuredArtwork.title}
            </h2>
            <p className="font-body text-sm text-muted">
              {featuredArtwork.medium} • {featuredArtwork.dimensions}
            </p>
          </div>
          <div className="flex flex-col gap-3 font-body text-sm text-muted sm:max-w-sm">
            {featuredArtwork.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
