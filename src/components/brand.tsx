"use client";

import { useEffect, useRef } from "react";
import { site } from "@/data/site";
import { ringScrollProgress } from "@/lib/scroll-progress";

/** The wordmark is laid out at this size, then transformed to fit. */
const BASE_FONT = 100;
const LINE_HEIGHT = 0.88;
/** Wordmark size once it has settled into the header bar. */
const HEADER_FONT = 24;
const HEADER_TITLE_TOP = 21;
const HEADER_TAGLINE_TOP = 25;

function smoothRange(p: number, start: number, end: number) {
  const t = (p - start) / (end - start);
  const c = t < 0 ? 0 : t > 1 ? 1 : t;
  return c * c * (3 - 2 * c);
}

/**
 * How far through the runway the shrink-into-the-header happens. The
 * wordmark and the tagline share this one curve so they move together.
 * The tagline used to lag, to stay clear of a wordmark that was drifting
 * left; now that the wordmark shrinks about the centre, the side captions
 * are never in its way and can travel with it.
 */
const morph = (p: number) => smoothRange(p, 0.03, 0.3);

export function Brand() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const title = titleRef.current;
    const tagline = taglineRef.current;
    if (!title || !tagline) return;

    // Layout width of the wordmark at BASE_FONT. Unaffected by transforms,
    // so it only needs remeasuring when the font or viewport changes.
    let naturalWidth = title.scrollWidth;

    const remeasure = () => {
      naturalWidth = title.scrollWidth;
    };

    if (document.fonts?.ready) document.fonts.ready.then(remeasure);
    window.addEventListener("resize", remeasure);

    let frame = 0;
    const tick = () => {
      const vw = window.innerWidth;
      const padX = vw >= 640 ? 40 : 24;
      const padTop = vw >= 640 ? 32 : 28;

      const heroScale = naturalWidth
        ? (vw - padX * 2) / naturalWidth
        : 1;
      const headerScale = HEADER_FONT / BASE_FONT;

      const t = morph(ringScrollProgress());
      const scale = heroScale + (headerScale - heroScale) * t;

      // Always centred, at every size. Interpolating position and scale
      // separately made the wordmark drift left mid-shrink, because the
      // centred target keeps moving as the scale changes. Deriving left
      // from the current scale keeps it centred throughout — and at full
      // size that resolves to exactly the page padding, so the hero still
      // sits flush to both edges.
      const left = (vw - naturalWidth * scale) / 2;
      const top = padTop + (HEADER_TITLE_TOP - padTop) * t;

      title.style.transform = `translate(${left - padX}px, ${top - padTop}px) scale(${scale})`;

      // Tagline rides just under the wordmark and travels on the same
      // curve, so the two read as one movement.
      const heroTaglineTop =
        padTop + BASE_FONT * LINE_HEIGHT * heroScale + 18;
      const taglineTop =
        heroTaglineTop + (HEADER_TAGLINE_TOP - heroTaglineTop) * t;
      tagline.style.transform = `translateY(${taglineTop}px)`;
      tagline.style.fontSize = `${16 + (14 - 16) * t}px`;

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", remeasure);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="px-6 pt-7 sm:px-10 sm:pt-8">
        <h1
          ref={titleRef}
          className="font-display w-fit origin-top-left whitespace-nowrap uppercase text-ink"
          style={{ fontSize: BASE_FONT, lineHeight: LINE_HEIGHT }}
        >
          {site.name}
        </h1>
      </div>
      <div
        ref={taglineRef}
        className="absolute inset-x-0 top-0 flex justify-between px-6 font-body text-muted sm:px-10"
      >
        <p>{site.taglineLeft}</p>
        <p>{site.taglineRight}</p>
      </div>
    </div>
  );
}
