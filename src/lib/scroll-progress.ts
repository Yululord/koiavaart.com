import { RING_RUNWAY_ID } from "@/lib/constants";

let cachedRunway: HTMLElement | null = null;
let lastStamp = -1;
let lastValue = 0;

/**
 * Progress (0 → 1) through the hero scroll runway, read straight from
 * layout. Memoised per animation frame so the ring's many planes can call
 * it freely. Deliberately not driven by a scroll library: reading position
 * directly stays correct through resizes, restored scroll positions and
 * programmatic jumps.
 */
export function ringScrollProgress(): number {
  const stamp = performance.now();
  if (stamp === lastStamp) return lastValue;
  lastStamp = stamp;

  if (!cachedRunway || !cachedRunway.isConnected) {
    cachedRunway = document.getElementById(RING_RUNWAY_ID);
  }
  if (!cachedRunway) return (lastValue = 0);

  const rect = cachedRunway.getBoundingClientRect();
  const travel = rect.height - window.innerHeight;
  if (travel <= 0) return (lastValue = 0);

  const raw = -rect.top / travel;
  return (lastValue = raw < 0 ? 0 : raw > 1 ? 1 : raw);
}
