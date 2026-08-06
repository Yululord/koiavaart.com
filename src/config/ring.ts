/**
 * Every tunable parameter of the hero cylinder, in one place.
 *
 * These are live: the render loop reads this object each frame, so the dev
 * panel (append `?tune` to the URL) can mutate it and you see the result
 * immediately. Once a look is dialled in, copy the values back into the
 * defaults below so they stick.
 */
export type RingConfig = {
  // ---- Cylinder ---------------------------------------------------------
  /** Cylinder radius as a fraction of viewport width. Bigger = flatter arc. */
  radiusFactor: number;
  /**
   * How many times the set of works is laid around the cylinder, in order:
   * 1, 2, 3 … 9, 1, 2, 3 … 9. Cloning the whole set keeps every copy of a
   * painting the maximum distance from its twin — half the ring at two
   * copies — so repeats never read as a mistake. The card count is
   * therefore always a whole number of sets, which is also what lets the
   * ring close seamlessly.
   */
  copies: number;
  /** Card width on the cylinder, as a fraction of viewport width. */
  cardWidthRing: number;

  // ---- Line -------------------------------------------------------------
  /**
   * Distance between card centres once unrolled, as a fraction of viewport
   * width. Free of the closure constraint, so this one is continuous.
   */
  lineSpacing: number;
  /** Card width in the unrolled line, as a fraction of viewport width. */
  cardWidthLine: number;

  // ---- Placement --------------------------------------------------------
  /** Cylinder centre, as a fraction of viewport height. Negative = lower. */
  verticalOffset: number;
  /**
   * Where the resolved line sits, as a fraction of viewport height. Separate
   * from the cylinder's, because a tilted ring usually wants dropping while
   * the flat strip still wants to sit centred.
   */
  verticalOffsetLine: number;

  // ---- Shape ------------------------------------------------------------
  /** Tilt of the whole cylinder about its horizontal axis, radians. */
  tiltX: number;
  /** Roll of the whole cylinder about the view axis, radians. */
  tiltZ: number;
  /** Maximum random roll per card, radians. 0 = all upright. */
  cardRoll: number;
  /** Maximum random vertical offset per card, as a fraction of viewport height. */
  heightJitter: number;
  /** Maximum random size variation per card. 0.3 = ±30%. */
  sizeJitter: number;
  /** How much the jitter is ironed out once unrolled. 1 = perfectly even line. */
  jitterFlatten: number;
  /** Opacity of the far side of the cylinder. 1 = no depth fade. */
  depthFade: number;

  // ---- Motion -----------------------------------------------------------
  /** Idle rotation, in loops per second. Negative runs right-to-left. */
  idleSpeed: number;
  /** Loops the strip travels sideways across the scroll runway. */
  stripTravel: number;
  /**
   * How far the pointer slides the band, in loops at full deflection. Worth
   * keeping under half a card slot, or cards drift out from under the
   * cursor while you are hovering one.
   */
  pointerPush: number;
  /** How far the pointer tips the cylinder, in radians at full deflection. */
  pointerTilt: number;
  /** Scroll progress at which the circle has fully opened into the line. */
  unwindEnd: number;
  /** Scroll progress at which the strip starts fading out. */
  fadeStart: number;

  // ---- Camera & interaction --------------------------------------------
  /** Vertical field of view. Lower = flatter, longer lens. */
  fov: number;
  /** Card scale on hover. */
  hoverScale: number;
};

/**
 * Desktop. Every value here is a fraction of viewport width, which is why a
 * phone cannot simply reuse it: the same numbers give a ring a third of the
 * size still carrying the same number of cards, so they pack together and
 * the repeats become obvious. Mobile gets its own set below.
 */
export const desktopRing: RingConfig = {
  radiusFactor: 0.68,
  copies: 3,
  cardWidthRing: 0.092,

  lineSpacing: 0.302,
  cardWidthLine: 0.206,

  verticalOffset: -0.17,
  verticalOffsetLine: -0.035,

  tiltX: 0.17,
  tiltZ: 0,
  cardRoll: 0,
  heightJitter: 0.19,
  sizeJitter: 0.38,
  jitterFlatten: 1,
  depthFade: 0.17,

  // Negative runs the band right-to-left — the ring's idle spin and the
  // strip's scroll travel are separate, and both go that way.
  idleSpeed: -0.0111,
  stripTravel: -1.3,
  pointerPush: 0.048,
  pointerTilt: 0.12,
  unwindEnd: 0.42,
  // 1 disables the dissolve: once the strip has run through every work it
  // scrolls away bodily instead of fading out.
  fadeStart: 1,

  fov: 49,
  hoverScale: 1.18,
};

/**
 * Mobile — entirely independent of the desktop set above. Editing one never
 * touches the other.
 *
 * A phone gets a single pass through the works rather than three: on a
 * narrow screen the extra copies read as a jumble rather than density, and
 * with one copy there is nothing to repeat. The ring is proportionally much
 * larger and the cards far wider, so only two or three are in view at once
 * and each is big enough to actually look at. There is no pointer, so the
 * parallax and hover zoom are off.
 */
export const mobileRing: RingConfig = {
  radiusFactor: 0.9,
  copies: 1,
  cardWidthRing: 0.48,

  lineSpacing: 0.68,
  cardWidthLine: 0.6,

  verticalOffset: -0.02,
  verticalOffsetLine: 0,

  tiltX: 0.17,
  tiltZ: 0,
  cardRoll: 0,
  heightJitter: 0.06,
  sizeJitter: 0.14,
  jitterFlatten: 1,
  depthFade: 0.17,

  idleSpeed: -0.0111,
  stripTravel: -1.3,
  pointerPush: 0,
  pointerTilt: 0,
  unwindEnd: 0.42,
  fadeStart: 1,

  fov: 49,
  hoverScale: 1,
};

/** Phones and small tablets take the mobile set; everything else desktop. */
const MOBILE_QUERY = "(max-width: 767px)";
let mobileMatches = false;

export function isMobileRing() {
  return mobileMatches;
}

/** The set currently in force. Read fresh — the viewport can change. */
export function activeRing(): RingConfig {
  return mobileMatches ? mobileRing : desktopRing;
}

/**
 * Ranges for the tuning panel: [min, max, step]. The panel itself is
 * currently removed — these, `setRingConfig` and `ringSpacingActual` are
 * kept so it can be dropped back in without rebuilding the plumbing.
 */
export const ringConfigRanges: Record<keyof RingConfig, [number, number, number]> = {
  radiusFactor: [0.15, 1.2, 0.01],
  copies: [1, 6, 1],
  cardWidthRing: [0.03, 0.6, 0.002],

  lineSpacing: [0.06, 1.2, 0.002],
  cardWidthLine: [0.03, 0.8, 0.002],

  verticalOffset: [-0.4, 0.4, 0.005],
  verticalOffsetLine: [-0.4, 0.4, 0.005],

  tiltX: [-0.6, 0.6, 0.005],
  tiltZ: [-0.6, 0.6, 0.005],
  cardRoll: [0, 0.5, 0.005],
  heightJitter: [0, 0.3, 0.005],
  sizeJitter: [0, 0.8, 0.01],
  jitterFlatten: [0, 1, 0.05],
  depthFade: [0, 1, 0.01],

  idleSpeed: [-0.06, 0.06, 0.001],
  stripTravel: [-3, 3, 0.05],
  pointerPush: [0, 0.2, 0.002],
  pointerTilt: [0, 0.5, 0.005],
  unwindEnd: [0.1, 0.9, 0.01],
  fadeStart: [0.5, 1, 0.01],

  fov: [20, 80, 1],
  hoverScale: [1, 1.6, 0.01],
};

import { works as workList } from "@/data/works";

const workCount = workList.length;

/** Number of works — one full pass through the set. */
export const ringSetSize = workCount;

/** How many complete sets go around the ring. */
export function ringCopies() {
  return Math.max(1, Math.round(activeRing().copies));
}

/**
 * Every card on the ring. Always a whole number of sets, which is what
 * keeps the clones evenly spread and lets the circle close seamlessly.
 */
export function ringTotalCount() {
  return workCount * ringCopies();
}

/**
 * Gap between neighbouring cards, as a fraction of viewport width. Derived
 * rather than set: the cards have to divide the circumference exactly, so
 * radius and copies between them decide it.
 */
export function ringSpacingActual() {
  return (2 * Math.PI * activeRing().radiusFactor) / ringTotalCount();
}

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((notify) => notify());
}

/** Patches whichever set is in force, leaving the other untouched. */
export function setRingConfig(patch: Partial<RingConfig>) {
  Object.assign(activeRing(), patch);
  emit();
}

export function subscribeRingConfig(listener: () => void) {
  listeners.add(listener);

  // Crossing the breakpoint swaps the whole set, and changes the card count
  // with it, so React has to hear about it as well as the render loop.
  if (listeners.size === 1 && typeof window !== "undefined") {
    mobileQuery = window.matchMedia(MOBILE_QUERY);
    mobileMatches = mobileQuery.matches;
    onQueryChange = () => {
      mobileMatches = mobileQuery!.matches;
      emit();
    };
    mobileQuery.addEventListener("change", onQueryChange);
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && mobileQuery && onQueryChange) {
      mobileQuery.removeEventListener("change", onQueryChange);
      mobileQuery = null;
      onQueryChange = null;
    }
  };
}

let mobileQuery: MediaQueryList | null = null;
let onQueryChange: (() => void) | null = null;

/**
 * Stable pseudo-random value in [0, 1) for a given card and channel, so
 * jitter stays put across frames instead of shimmering.
 */
export function jitterFor(index: number, channel: number) {
  const x = Math.sin((index + 1) * 127.1 + channel * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Same, mapped to [-1, 1). */
export function signedJitter(index: number, channel: number) {
  return jitterFor(index, channel) * 2 - 1;
}
