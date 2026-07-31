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

export const ringConfig: RingConfig = {
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

/** Ranges for the dev panel: [min, max, step]. */
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
  return Math.max(1, Math.round(ringConfig.copies));
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
  return (2 * Math.PI * ringConfig.radiusFactor) / ringTotalCount();
}

const listeners = new Set<() => void>();

export function setRingConfig(patch: Partial<RingConfig>) {
  Object.assign(ringConfig, patch);
  listeners.forEach((notify) => notify());
}

export function subscribeRingConfig(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

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
