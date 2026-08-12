"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useLenis } from "lenis/react";
import {
  findWork,
  subscribeWorks,
  workCaption,
  works,
  worksVersion,
} from "@/data/works";
import { formatPrice } from "@/lib/format";
import { paintingMailto } from "@/lib/mailto";
import {
  closeWork,
  openWorkServerSnapshot,
  openWorkSnapshot,
  replaceWork,
  subscribeOpenWork,
} from "@/lib/work-overlay";

function Arrow({
  direction,
  onClick,
  label,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:bg-neutral-100 md:flex ${
        direction === "prev" ? "left-4 md:left-8" : "right-4 md:right-8"
      }`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden
      >
        <path
          d={direction === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

/** The bar's chevrons: square, quieter, sized to sit beside the Buy button. */
function StepButton({
  direction,
  onClick,
  label,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line text-ink transition-colors active:bg-neutral-100"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden
      >
        <path
          d={direction === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

/**
 * Full-screen view of a single painting. Opened from a card in the hero
 * band, addressed by `?work=<slug>` so it survives a reload and can be
 * shared, and closed with Escape, the button, or the browser's back.
 */
export function WorkDetail() {
  // Rebuild when the paintings arrive, so prev/next and the counter are
  // right rather than reflecting an empty list.
  useSyncExternalStore(subscribeWorks, worksVersion, () => 0);

  const slug = useSyncExternalStore(
    subscribeOpenWork,
    openWorkSnapshot,
    openWorkServerSnapshot,
  );
  const work = findWork(slug);
  const [shot, setShot] = useState(0);
  // Back to the primary photograph whenever a different painting opens, or
  // the second shot of one carries over to the next. Adjusted during render
  // rather than in an effect, which would paint the wrong image first.
  const [shownFor, setShownFor] = useState(slug);
  if (slug !== shownFor) {
    setShownFor(slug);
    setShot(0);
  }
  const dialogRef = useRef<HTMLDivElement>(null);
  const restoreFocusTo = useRef<Element | null>(null);
  const lenis = useLenis();

  const index = work ? works.findIndex((w) => w.slug === work.slug) : -1;
  const step = (delta: number) => {
    const next = works[(index + delta + works.length) % works.length];
    replaceWork(next.slug);
  };

  useEffect(() => {
    if (!work) return;

    // Freeze the page behind the overlay — including Lenis, which drives
    // its own scrolling and would otherwise keep running underneath.
    lenis?.stop();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    restoreFocusTo.current = document.activeElement;
    dialogRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeWork();
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      lenis?.start();
      (restoreFocusTo.current as HTMLElement | null)?.focus?.();
    };
    // `step` closes over the current index, which is why slug is the dep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [work?.slug, lenis]);

  if (!work) return null;

  const info = workCaption(work);
  // Every photograph of this painting, falling back to the single primary
  // one for anything imported before the field existed.
  const shots = work.images?.length
    ? work.images
    : [{ src: work.src, width: work.width, height: work.height }];
  const current = shots[Math.min(shot, shots.length - 1)];

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={work.title}
      tabIndex={-1}
      // Lenis is stopped underneath, but it still claims touch and wheel
      // events; without this the overlay itself would not scroll and the
      // description below the fold was unreachable.
      data-lenis-prevent
      className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-white focus:outline-none"
    >
      {/* The × is the only way out. Focus goes to the dialog rather than
          here, so tapping a painting does not land you on a ring. */}
      <button
        type="button"
        onClick={closeWork}
        aria-label="Close"
        // Fixed, not absolute: the overlay scrolls, and an absolute × would leave
        // with the top of the painting. Backed so it stays legible over artwork.
        className="fixed right-4 top-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-ink backdrop-blur transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 sm:right-8 sm:top-8"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        </svg>
      </button>

      {works.length > 1 && (
        <>
          <Arrow direction="prev" onClick={() => step(-1)} label="Previous painting" />
          <Arrow direction="next" onClick={() => step(1)} label="Next painting" />
        </>
      )}

      <div className="mx-auto flex min-h-full max-w-6xl flex-col items-center justify-start gap-10 px-6 pb-32 pt-20 sm:px-24 md:pb-20 lg:flex-row lg:items-center lg:justify-center lg:gap-16">
        <div className="flex flex-col items-center gap-4">
          <Image
            key={`${work.slug}-${shot}`}
            src={current.src}
            alt={work.title ?? "Painting"}
            width={current.width}
            height={current.height}
            sizes="(min-width: 1024px) 55vw, 90vw"
            priority
            className="max-h-[52vh] w-auto object-contain lg:max-h-[76vh]"
          />

          {/* Only worth showing when there is a choice to make. */}
          {shots.length > 1 && (
            <div className="flex gap-3">
              {shots.map((image, i) => (
                <button
                  key={image.src}
                  type="button"
                  onClick={() => setShot(i)}
                  aria-label={`Photograph ${i + 1} of ${shots.length}`}
                  aria-current={i === shot}
                  className={`h-16 w-16 overflow-hidden rounded-sm transition-opacity ${
                    i === shot ? "opacity-100" : "opacity-40 hover:opacity-70"
                  }`}
                >
                  {/* Same URL as the full view, so the thumbnail warms the
                      cache and switching is instant rather than a fetch. */}
                  <Image
                    src={image.src}
                    alt=""
                    width={image.width}
                    height={image.height}
                    sizes="(min-width: 1024px) 55vw, 90vw"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex w-full max-w-sm flex-col gap-4">
          <h2 className="font-display text-3xl uppercase leading-none text-ink sm:text-4xl">
            {work.title}
          </h2>
          {info && <p className="font-body text-sm text-muted">{info}</p>}
          {work.description && (
            <p className="font-body text-sm leading-[1.5] text-muted">
              {work.description}
            </p>
          )}

          {work.status === "sold" ? (
            <div className="mt-2">
              <span className="inline-flex h-8 items-center rounded-full bg-ink px-4 font-body text-sm text-white">
                Sold
              </span>
            </div>
          ) : (
            work.price && (
              <div className="mt-2 hidden items-center gap-4 md:flex">
                <span className="font-display text-2xl leading-none text-ink">
                  {formatPrice(work.price)}
                </span>
                <a
                  href={paintingMailto(work)}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-black px-6 font-body text-base text-white transition-opacity hover:opacity-80"
                >
                  Buy
                </a>
              </div>
            )
          )}

          <p className="mt-2 font-body text-xs text-muted">
            {index + 1} / {works.length}
          </p>
        </div>
      </div>

      {/* Phone only: stepping between paintings and buying the one in front
          of you are the two things to do here, so they sit together within
          a thumb's reach rather than at the screen edges and halfway up a
          scroll. Desktop keeps the chevrons at the sides. */}
      <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 border-t border-line bg-white/90 px-4 py-3 backdrop-blur md:hidden">
        <StepButton
          direction="prev"
          onClick={() => step(-1)}
          label="Previous painting"
        />

        {work.status === "sold" ? (
          <span className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-ink font-body text-base text-white">
            Sold
          </span>
        ) : work.price ? (
          <a
            href={paintingMailto(work)}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-black font-body text-base text-white transition-opacity hover:opacity-80"
          >
            Buy <span className="opacity-70">{formatPrice(work.price)}</span>
          </a>
        ) : (
          <span className="flex-1" />
        )}

        <StepButton
          direction="next"
          onClick={() => step(1)}
          label="Next painting"
        />
      </div>
    </div>
  );
}
