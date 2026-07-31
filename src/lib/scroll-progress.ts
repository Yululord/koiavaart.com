import { RING_RUNWAY_ID } from "@/lib/constants";

let forcedProgress: number | null | undefined;
let forcedOverflow: number | null | undefined;
let cachedRunway: HTMLElement | null = null;
let lastStamp = -1;
let lastProgress = 0;
let lastOverflow = 0;

function readForcedProgress() {
  if (process.env.NODE_ENV === "production") return null;
  if (forcedProgress === undefined) {
    const raw = new URLSearchParams(window.location.search).get("p");
    const parsed = raw === null ? NaN : Number.parseFloat(raw);
    forcedProgress = Number.isFinite(parsed)
      ? Math.max(0, Math.min(1, parsed))
      : null;
  }
  return forcedProgress;
}

/**
 * Reads the runway's position once per animation frame and caches both
 * values, so the ring's many planes can call either freely.
 *
 * Deliberately not driven by a scroll library: reading layout directly
 * stays correct through resizes, restored scroll positions and programmatic
 * jumps, and works unchanged under Lenis.
 */
function measure() {
  const stamp = performance.now();
  if (stamp === lastStamp) return;
  lastStamp = stamp;

  if (!cachedRunway || !cachedRunway.isConnected) {
    cachedRunway = document.getElementById(RING_RUNWAY_ID);
  }
  if (!cachedRunway) {
    lastProgress = 0;
    lastOverflow = 0;
    return;
  }

  const rect = cachedRunway.getBoundingClientRect();
  const travel = rect.height - window.innerHeight;
  if (travel <= 0) {
    lastProgress = 0;
    lastOverflow = 0;
    return;
  }

  const scrolled = -rect.top;
  lastProgress = scrolled < 0 ? 0 : scrolled > travel ? 1 : scrolled / travel;
  // How far past the end of the runway we are, in pixels.
  lastOverflow = scrolled > travel ? scrolled - travel : 0;
}

/** Progress (0 → 1) through the hero scroll runway. */
export function ringScrollProgress(): number {
  // Dev escape hatch: `?p=0.6` pins the sequence so any point in the
  // ring → line transition can be inspected without scrolling.
  const forced = readForcedProgress();
  if (forced !== null) return forced;

  measure();
  return lastProgress;
}

/**
 * Pixels scrolled beyond the end of the runway, and zero within it.
 *
 * Once the strip has travelled through every work there is nothing left to
 * drive, so the scene stops being pinned and simply rides the page: the
 * band translates up by this amount, which reads as it scrolling away like
 * any other section — and unwinds exactly in reverse on the way back up.
 */
export function ringScrollOverflow(): number {
  // Dev escape hatch: `?o=300` pins the band 300px into its scroll-away,
  // which pairs with `?p=1` to inspect the hand-off without scrolling.
  if (process.env.NODE_ENV !== "production") {
    if (forcedOverflow === undefined) {
      const raw = new URLSearchParams(window.location.search).get("o");
      const parsed = raw === null ? NaN : Number.parseFloat(raw);
      forcedOverflow = Number.isFinite(parsed) ? Math.max(0, parsed) : null;
    }
    if (forcedOverflow !== null) return forcedOverflow;
  }

  if (readForcedProgress() !== null) return 0;

  measure();
  return lastOverflow;
}
