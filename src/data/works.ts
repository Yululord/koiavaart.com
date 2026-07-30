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
];

/**
 * Lays out the cylinder.
 *
 * `primaryCount` cards survive into the unrolled line; `repeats` says how
 * many extra cards to pack between them to fill the coiled ring out. The
 * survivors are placed at a fixed stride so that when the extras retire,
 * what is left is still evenly spaced — the reason the survivor cannot
 * simply be "the first N slots", which would leave a gap in the ring.
 *
 * Survivors walk the works in order; the extras start from the far side of
 * the list so a painting and its double never end up side by side.
 */
export function buildRingSlots(primaryCount: number, repeats: number) {
  const stride = Math.max(1, Math.round(repeats));
  const total = Math.max(1, primaryCount) * stride;
  const count = works.length;

  return Array.from({ length: total }, (_, i) => {
    const rank = Math.floor(i / stride);
    const offset = i % stride;
    const isPrimary = offset === 0;
    const workIndex = isPrimary
      ? rank % count
      : (rank + Math.floor(count / 2) + offset) % count;

    return { ...works[workIndex], slot: i, isPrimary };
  });
}
