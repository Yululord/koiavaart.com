"use client";

import { useEffect, useRef } from "react";
import { contactMailto } from "@/lib/mailto";

/**
 * Always-visible mail button, pinned to the centre of the footer row.
 * It inverts while it sits over the dark contact panel, which it would
 * otherwise disappear into.
 */
export function ContactPill() {
  const pillRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    let frame = 0;
    let inverted: boolean | null = null;

    const tick = () => {
      const pill = pillRef.current;
      const panel = document.getElementById("contact");
      if (pill && panel) {
        const box = pill.getBoundingClientRect();
        const panelBox = panel.getBoundingClientRect();
        const midY = box.top + box.height / 2;
        const next = panelBox.top < midY && panelBox.bottom > midY;

        if (next !== inverted) {
          inverted = next;
          pill.classList.toggle("bg-white", next);
          pill.classList.toggle("text-black", next);
          pill.classList.toggle("bg-black", !next);
          pill.classList.toggle("text-white", !next);
        }
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex h-24 items-center justify-center">
      <a
        ref={pillRef}
        href={contactMailto()}
        className="pointer-events-auto inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-black px-6 font-body text-base text-white transition-opacity hover:opacity-80"
      >
        Contact
      </a>
    </div>
  );
}
