"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis } from "lenis/react";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Lenis smooth scrolling, mounted at the root.
 *
 * Two things make this safe for the rest of the site:
 *
 * 1. Lenis wraps *native* scroll rather than transforming a container, so
 *    `position: fixed`, `position: sticky` and `getBoundingClientRect()`
 *    all keep working. The hero sequence reads its progress straight from
 *    layout, so it needs no adapting.
 * 2. Mounting here — above the page — means Lenis registers its animation
 *    frame before the hero's, so each frame writes the new scroll position
 *    before anything reads it, and the canvas stays in step with the DOM.
 *
 * Smoothing is skipped entirely for anyone who asks for reduced motion;
 * hijacked scrolling is a common trigger for motion sensitivity. It is also
 * skipped in the Studio: Sanity scrolls its own panes, and Lenis claiming
 * the wheel left the painting list and the fields inside it stuck.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );

  const pathname = usePathname();
  if (prefersReducedMotion || pathname?.startsWith("/studio")) {
    return <>{children}</>;
  }

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.09,
        wheelMultiplier: 1,
        // Touch devices keep their native scrolling, which feels better
        // than a synthesised one and avoids fighting the browser.
        syncTouch: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}
