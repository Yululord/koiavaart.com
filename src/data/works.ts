// Valeriia's paintings — the images that ride the hero ring and unwind
// into the horizontal band. Shaped to map onto Sanity documents later.

export type Work = {
  id: string;
  src: string;
  width: number;
  height: number;
  title?: string;
  medium?: string;
  dimensions?: string;
};

/**
 * PLACEHOLDER medium and dimensions — every entry currently carries the one
 * example from the Figma file. They are deliberately identical so it is
 * obvious at a glance that they are not real; replace per painting. A work
 * with neither field simply shows no caption.
 */
const PLACEHOLDER_MEDIUM = "Oil on Canvas";
const PLACEHOLDER_SIZE = "31.5 x 31.5 in";

export const works: Work[] = [
  { id: "w01", src: "/images/works/work-01.png", width: 1080, height: 1350 },
  { id: "w02", src: "/images/works/work-02.png", width: 1080, height: 1350 },
  { id: "w03", src: "/images/works/work-03.png", width: 1080, height: 1350 },
  { id: "w04", src: "/images/works/work-04.png", width: 1080, height: 1439 },
  { id: "w05", src: "/images/works/work-05.png", width: 1080, height: 1302 },
  { id: "w06", src: "/images/works/work-06.png", width: 1080, height: 1440 },
  { id: "w07", src: "/images/works/work-07.png", width: 812, height: 1096 },
  { id: "w08", src: "/images/works/work-08.png", width: 800, height: 1080 },
  { id: "w09", src: "/images/works/work-09.png", width: 476, height: 970 },
].map((work) => ({
  ...work,
  medium: PLACEHOLDER_MEDIUM,
  dimensions: PLACEHOLDER_SIZE,
}));

/** The line "Oil on Canvas • 31.5 x 31.5 in", or empty if neither is set. */
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
  return Array.from({ length: Math.max(1, Math.round(total)) }, (_, i) => ({
    ...works[i % works.length],
    slot: i,
  }));
}
