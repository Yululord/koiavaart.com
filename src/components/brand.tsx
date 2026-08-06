"use client";

import { useEffect, useRef } from "react";
import { site } from "@/data/site";
import { ringScrollProgress } from "@/lib/scroll-progress";

/** The wordmark is laid out at this size, then transformed to fit. */
const BASE_FONT = 100;
const LINE_HEIGHT = 0.88;

/** Where each piece ends up once it has settled into the header bar. */
const DESKTOP = {
  font: 24,
  titleTop: 21,
  taglineTop: 25,
  taglineFont: 14,
};
const MOBILE = {
  font: 18,
  titleTop: 19,
  taglineTop: 22,
  taglineFont: 12,
};

/**
 * Mobile pins the text block to the top so the artwork gets the rest of the
 * frame: 16px in from the top and sides, and 16px between the three rows.
 */
const MOBILE_INSET = 16;
const MOBILE_GAP = 16;
/** Line box of the tagline and categories rows at their hero size (16px). */
const CAPTION_LINE = 24;
const MOBILE_TITLE_TOP = MOBILE_INSET + CAPTION_LINE + MOBILE_GAP;
/** Share of the content width the wordmark fills on mobile. */
const MOBILE_TITLE_FILL = 0.69;

function smoothRange(p: number, start: number, end: number) {
  const t = (p - start) / (end - start);
  const c = t < 0 ? 0 : t > 1 ? 1 : t;
  return c * c * (3 - 2 * c);
}

/**
 * How far through the runway the shrink-into-the-header happens. Wordmark,
 * tagline and categories all share this one curve so they read as a single
 * movement.
 */
const morph = (p: number) => smoothRange(p, 0.03, 0.3);

export function Brand() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const title = titleRef.current;
    const tagline = taglineRef.current;
    const categories = categoriesRef.current;
    if (!title || !tagline) return;

    // Layout width of the wordmark at BASE_FONT — the widest line, since
    // mobile stacks it. Unaffected by transforms, so it only needs
    // remeasuring when the font or the viewport changes.
    let naturalWidth = title.scrollWidth;
    const remeasure = () => {
      naturalWidth = title.scrollWidth;
    };

    if (document.fonts?.ready) document.fonts.ready.then(remeasure);
    window.addEventListener("resize", remeasure);

    let frame = 0;
    const tick = () => {
      const vw = window.innerWidth;
      const mobile = vw < 768;
      const end = mobile ? MOBILE : DESKTOP;

      const padX = mobile ? MOBILE_INSET : 40;
      // Mobile leads with the tagline, so the wordmark starts further down.
      const taglineHome = mobile ? MOBILE_INSET : 32;
      const padTop = mobile ? MOBILE_TITLE_TOP : 32;

      const heroScale = naturalWidth
        ? ((vw - padX * 2) * (mobile ? MOBILE_TITLE_FILL : 1)) / naturalWidth
        : 1;
      const headerScale = end.font / BASE_FONT;

      const t = morph(ringScrollProgress());
      const scale = heroScale + (headerScale - heroScale) * t;

      // Always centred, at every size: deriving left from the current scale
      // keeps it centred throughout rather than drifting mid-shrink.
      const left = (vw - naturalWidth * scale) / 2;
      const top = padTop + (end.titleTop - padTop) * t;
      title.style.transform = `translate(${left - padX}px, ${top - padTop}px) scale(${scale})`;

      const lines = mobile ? 2 : 1;
      const titleHeight = BASE_FONT * LINE_HEIGHT * heroScale * lines;

      // Tagline holds the top on mobile and only tightens up; on desktop it
      // travels down from under the wordmark into the header row.
      const taglineStart = mobile ? taglineHome : padTop + titleHeight + 18;
      const taglineTop = taglineStart + (end.taglineTop - taglineStart) * t;
      tagline.style.transform = `translateY(${taglineTop}px)`;
      tagline.style.fontSize = `${16 + (end.taglineFont - 16) * t}px`;

      // Categories sit under the wordmark on mobile and fade out as it
      // collapses into the header — there is no room for them there.
      if (categories) {
        const categoriesTop = padTop + titleHeight + MOBILE_GAP;
        categories.style.transform = `translateY(${categoriesTop * (1 - t)}px)`;
        categories.style.opacity = String(Math.max(0, 1 - t * 2));
      }

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
      {/* pt matches MOBILE_TITLE_TOP / the desktop padTop above. */}
      <div className="px-4 pt-[56px] md:px-10 md:pt-8">
        {/* Stacked and centred on mobile, one line from `md` up. Measuring
            scrollWidth gives the widest line either way. */}
        <h1
          ref={titleRef}
          className="font-display w-fit origin-top-left whitespace-nowrap text-center uppercase text-ink md:text-left"
          style={{ fontSize: BASE_FONT, lineHeight: LINE_HEIGHT }}
        >
          <span className="block md:inline">Valeriia</span>{" "}
          <span className="block md:inline">Koiava</span>
        </h1>
      </div>

      <div
        ref={taglineRef}
        className="absolute inset-x-0 top-0 flex justify-between px-4 font-body leading-6 text-muted md:px-10"
      >
        <p>{site.taglineLeft}</p>
        <p>{site.taglineRight}</p>
      </div>

      {/* Mobile only — on desktop these live in the footer row. */}
      <div
        ref={categoriesRef}
        className="absolute inset-x-0 top-0 flex justify-between px-4 font-body text-base leading-6 text-muted md:hidden"
      >
        {site.categories.map((category, i) => (
          <span key={category} className="contents">
            {i > 0 && <span>·</span>}
            <span>{category}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
