/**
 * Sideways drag for the resolved strip on touch devices.
 *
 * Driving the strip from vertical scroll means a downward swipe sends the
 * paintings sideways, which reads as a fight with the page. On mobile the
 * strip is browsed by dragging it directly instead, and scrolling down just
 * carries on down the page.
 *
 * Only horizontal gestures are captured: the axis is decided on the first
 * few pixels of movement, so a vertical swipe still scrolls normally.
 */

/**
 * How far along the strip we are, in world pixels. Unbounded: the band is a
 * loop, so it can be pulled either way for as long as you like and the cards
 * come round again.
 *
 * `target` is where the gesture has put it; `shown` trails behind on a
 * spring so both the drag and the glide read as weight rather than as the
 * strip snapping to the finger.
 */
let target = 0;
let shown = 0;
let velocity = 0;
let dragging = false;
/** Set to true by a drag that actually moved, so it is not read as a tap. */
let moved = false;

/** Gate: the strip is only draggable once it has flattened out. */
let enabled = false;

/** Share of the gap to the target left uncovered each second. Lower follows
 *  the finger more tightly; higher trails further behind. */
const FOLLOW = 0.0001;
/** Share of the throw left after a second of gliding. */
const GLIDE = 0.12;

export function setSwipeEnabled(value: boolean) {
  enabled = value;
  if (!value) {
    dragging = false;
    velocity = 0;
  }
}

/** True while the pointer is down and has travelled far enough to be a drag. */
export function swipeIsDragging() {
  return moved;
}

let advancedAt = -1;

/**
 * Advances the glide and returns where the strip has got to.
 *
 * Every card asks for this within the same frame, so the step is taken once
 * and the rest are handed the same answer: stepping per card decayed the
 * glide as many times over as there are cards, which is what made a throw
 * die on the spot.
 */
export function advanceSwipe(now: number) {
  if (now === advancedAt) return shown;
  const delta = advancedAt < 0 ? 0 : Math.min(0.1, now - advancedAt);
  advancedAt = now;

  if (!dragging && velocity !== 0) {
    target += velocity * delta;
    // Raised to the elapsed time, so the glide lasts the same wall-clock
    // time at 60Hz and 120Hz rather than dying sooner on a faster screen.
    velocity *= Math.pow(GLIDE, delta);
    if (Math.abs(velocity) < 1) velocity = 0;
  }
  shown += (target - shown) * (1 - Math.pow(FOLLOW, delta));
  return shown;
}

/** Puts the strip back to the start, for when the band coils up again. */
export function resetSwipe() {
  target = 0;
  shown = 0;
  velocity = 0;
  moved = false;
}

const AXIS_SLOP = 6;
/** Ceiling on the throw, in px/s. */
const MAX_FLING = 4000;

export function attachSwipe(el: HTMLElement) {
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastAt = 0;
  let axis: "none" | "x" | "y" = "none";
  let pointerId: number | null = null;

  const down = (event: PointerEvent) => {
    if (!enabled || pointerId !== null) return;
    pointerId = event.pointerId;
    startX = lastX = event.clientX;
    startY = event.clientY;
    lastAt = event.timeStamp;
    axis = "none";
    moved = false;
    velocity = 0;
  };

  const move = (event: PointerEvent) => {
    if (pointerId !== event.pointerId) return;

    if (axis === "none") {
      const dx = Math.abs(event.clientX - startX);
      const dy = Math.abs(event.clientY - startY);
      if (dx < AXIS_SLOP && dy < AXIS_SLOP) return;
      // Vertical wins ties, so the page stays scrollable by default.
      axis = dx > dy ? "x" : "y";
      if (axis === "x") {
        dragging = true;
        moved = true;
        el.setPointerCapture(event.pointerId);
      }
    }
    if (axis !== "x") return;

    const dx = event.clientX - lastX;
    target += dx;

    // Coarse or coalesced pointer streams can report two samples at the same
    // instant; a floor on the interval keeps that from dividing into a fling.
    const dt = Math.max(8, event.timeStamp - lastAt) / 1000;
    // Smoothed, so letting go on a stray final sample does not throw it.
    const raw = velocity * 0.7 + (dx / dt) * 0.3;
    velocity = Math.max(-MAX_FLING, Math.min(MAX_FLING, raw));

    lastX = event.clientX;
    lastAt = event.timeStamp;
  };

  const up = (event: PointerEvent) => {
    if (pointerId !== event.pointerId) return;
    if (el.hasPointerCapture(event.pointerId)) {
      el.releasePointerCapture(event.pointerId);
    }
    pointerId = null;
    dragging = false;
    axis = "none";
    // `moved` stays set for the click that follows this release to read, and
    // is cleared by the next press rather than on a timer, which would race.
  };

  el.addEventListener("pointerdown", down, { passive: true });
  el.addEventListener("pointermove", move, { passive: true });
  el.addEventListener("pointerup", up, { passive: true });
  el.addEventListener("pointercancel", up, { passive: true });

  return () => {
    el.removeEventListener("pointerdown", down);
    el.removeEventListener("pointermove", move);
    el.removeEventListener("pointerup", up);
    el.removeEventListener("pointercancel", up);
  };
}
