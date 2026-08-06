"use client";

import Image from "next/image";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { useLenis } from "lenis/react";
import { buyLink, findWork, workCaption, works } from "@/data/works";
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
      className={`absolute top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:bg-neutral-100 ${
        direction === "prev" ? "left-4 sm:left-8" : "right-4 sm:right-8"
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

/**
 * Full-screen view of a single painting. Opened from a card in the hero
 * band, addressed by `?work=<slug>` so it survives a reload and can be
 * shared, and closed with Escape, the button, or the browser's back.
 */
export function WorkDetail() {
  const slug = useSyncExternalStore(
    subscribeOpenWork,
    openWorkSnapshot,
    openWorkServerSnapshot,
  );
  const work = findWork(slug);
  const closeRef = useRef<HTMLButtonElement>(null);
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
    closeRef.current?.focus();

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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={work.title}
      className="fixed inset-0 z-[60] overflow-y-auto bg-white"
    >
      {/* The × is the only way out, and it takes the initial focus. */}
      <button
        ref={closeRef}
        type="button"
        onClick={closeWork}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:bg-neutral-100 sm:right-8 sm:top-8"
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

      <div className="mx-auto flex min-h-full max-w-6xl flex-col items-center justify-center gap-10 px-16 py-20 sm:px-24 lg:flex-row lg:items-center lg:gap-16">
        <Image
          key={work.slug}
          src={work.src}
          alt={work.title ?? "Painting"}
          width={work.width}
          height={work.height}
          sizes="(min-width: 1024px) 55vw, 90vw"
          priority
          className="max-h-[52vh] w-auto object-contain lg:max-h-[76vh]"
        />

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

          {work.price && (
            <div className="mt-2 flex items-center gap-4">
              <span className="font-display text-2xl leading-none text-ink">
                {work.price}
              </span>
              <a
                href={buyLink(work)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-full bg-black px-6 font-body text-base text-white transition-opacity hover:opacity-80"
              >
                Buy
              </a>
            </div>
          )}

          <p className="mt-2 font-body text-xs text-muted">
            {index + 1} / {works.length}
          </p>
        </div>
      </div>
    </div>
  );
}
