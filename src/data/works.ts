// Valeriia's paintings. Filled from Sanity at runtime by <WorksData />,
// which the server page renders with the result of the query.
//
// A module-level store rather than props: the ring reads the list from deep
// inside the WebGL tree and derives its geometry from the count, so passing
// it down would mean threading it through every layer of a scene graph that
// is otherwise self-contained. Same pattern as the ring config next door.

export type Work = {
  id: string;
  /** URL-safe identifier, used as `?work=<slug>`. */
  slug: string;
  src: string;
  width: number;
  height: number;
  /** Every photograph, the first being `src`. */
  images?: { src: string; width: number; height: number }[];
  title?: string;
  medium?: string;
  dimensions?: string;
  description?: string;
  /** Euros. Rendered by formatPrice so every painting reads alike. */
  price?: number;
  year?: number;
  status?: "available" | "sold";
  /** Saatchi listing for this painting. Falls back to the artist profile. */
  buyUrl?: string;
};

/** Where Buy points until each painting has its own listing URL. */
export const SAATCHI_PROFILE =
  "https://www.saatchiart.com/account/profile/2604565";

/** Mutated in place so existing imports keep pointing at the live list. */
export const works: Work[] = [];

const listeners = new Set<() => void>();

export function setWorks(next: Work[]) {
  if (next.length === works.length && next.every((w, i) => w.id === works[i]?.id)) {
    return;
  }
  works.length = 0;
  works.push(...next);
  listeners.forEach((notify) => notify());
}

export function subscribeWorks(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Identity of the current list, for useSyncExternalStore. */
export function worksVersion() {
  return works.length;
}

/** A painting's own listing once it has one, the profile until then. */
export function buyLink(work: Work) {
  return work.buyUrl ?? SAATCHI_PROFILE;
}

export function findWork(slug: string | null) {
  return slug ? (works.find((work) => work.slug === slug) ?? null) : null;
}

/** The line "Oil on canvas • 40 × 50 cm", or empty if neither is set. */
export function workCaption({ medium, dimensions }: Work) {
  return [medium, dimensions].filter(Boolean).join(" • ");
}

/**
 * Lays out the cylinder: the works in order, over and over.
 *
 * `total` is always a whole number of sets, so every painting appears the
 * same number of times and its clones land the maximum distance apart —
 * half the ring at two copies, a third at three. An earlier version wove
 * "filler" cards through the gaps on a separate counter, which drifted out
 * of step and put some paintings next to themselves; walking the list
 * straight through cannot do that.
 */
export function buildRingSlots(total: number) {
  if (!works.length) return [];
  return Array.from({ length: Math.max(1, Math.round(total)) }, (_, i) => ({
    ...works[i % works.length],
    slot: i,
  }));
}
