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
   * Distance between card centres around the cylinder, as a fraction of
   * viewport width. This sets how many cards it takes to close the circle,
   * so it steps in whole cards — the panel reports the count and the exact
   * spacing it settles on. Works repeat to fill whatever it needs.
   */
  ringSpacing: number;
  /** Card width on the cylinder, as a fraction of viewport width. */
  cardWidthRing: number;
  /**
   * Extra cards packed between the ones that survive into the line, to fill
   * the cylinder out. 1 keeps only the survivors; 2 puts one extra card in
   * every gap, and so on. These extras exist for the coiled ring alone and
   * retire before it opens.
   */
  repeats: number;
  /**
   * Progress by which the extra cards have gone. Kept well before the
   * cylinder has opened, so they thin out while it is still a ring rather
   * than blinking out mid-unwrap.
   */
  duplicateFadeEnd: number;

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
  /** Loops of parallax at full pointer deflection. Keep below one slot. */
  pointerPush: number;
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
  radiusFactor: 0.42,
  ringSpacing: 0.293,
  cardWidthRing: 0.115,
  repeats: 2,
  duplicateFadeEnd: 0.12,

  lineSpacing: 0.293,
  cardWidthLine: 0.229,

  verticalOffset: -0.04,
  verticalOffsetLine: 0,

  tiltX: -0.09,
  tiltZ: 0,
  cardRoll: 0,
  heightJitter: 0,
  sizeJitter: 0,
  jitterFlatten: 1,
  depthFade: 0.25,

  idleSpeed: -1 / 90,
  stripTravel: -1.2,
  pointerPush: 0.014,
  unwindEnd: 0.42,
  fadeStart: 0.9,

  fov: 45,
  hoverScale: 1.14,
};

/** Ranges for the dev panel: [min, max, step]. */
export const ringConfigRanges: Record<keyof RingConfig, [number, number, number]> = {
  radiusFactor: [0.15, 1.2, 0.01],
  ringSpacing: [0.06, 0.9, 0.002],
  cardWidthRing: [0.03, 0.6, 0.002],
  repeats: [1, 4, 1],
  duplicateFadeEnd: [0.02, 0.4, 0.01],

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
  pointerPush: [0, 0.1, 0.002],
  unwindEnd: [0.1, 0.9, 0.01],
  fadeStart: [0.5, 1, 0.01],

  fov: [20, 80, 1],
  hoverScale: [1, 1.6, 0.01],
};

/**
 * How many cards it takes to close the cylinder at the current radius and
 * spacing. A ring only looks seamless if its cards divide the circumference
 * exactly, so the count is a whole number and the spacing slider therefore
 * steps rather than glides. `ringSpacingActual` reports where it landed.
 *
 * Both inputs are fractions of viewport width, so width cancels and the
 * count is resolution-independent.
 */
export function ringSlotCount() {
  const ideal = (2 * Math.PI * ringConfig.radiusFactor) / ringConfig.ringSpacing;
  return Math.max(3, Math.round(ideal));
}

/** Every card on the ring, including the extras that fill it out. */
export function ringTotalCount() {
  return ringSlotCount() * Math.max(1, Math.round(ringConfig.repeats));
}

/** The spacing the ring actually settles on, once quantised to whole cards. */
export function ringSpacingActual() {
  return (2 * Math.PI * ringConfig.radiusFactor) / ringSlotCount();
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
