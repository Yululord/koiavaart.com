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
 * `total` is however many cards it takes to fill the ring at the chosen
 * radius, gap and fill multiplier. Out of those, exactly one card per work
 * is marked to survive into the unrolled line, so the line can never repeat
 * a painting no matter how the cylinder is tuned. The survivors are spread
 * evenly across the ring rather than taken from the front, so retiring the
 * rest leaves an even ring instead of a gap.
 *
 * `lineIndex` is a card's slot in the resolved line: a whole number for the
 * survivors, and the fractional position in between for the fillers, which
 * keeps their motion sensible while they fade.
 */
export function buildRingSlots(total: number) {
  const slotCount = Math.max(1, Math.round(total));
  const keptCount = Math.min(works.length, slotCount);

  // Evenly spaced survivor positions, one per work.
  const keptAt = new Map<number, number>();
  for (let k = 0; k < keptCount; k++) {
    keptAt.set(Math.round((k * slotCount) / keptCount), k);
  }

  let fillerRank = 0;

  return Array.from({ length: slotCount }, (_, i) => {
    const kept = keptAt.get(i);
    const isPrimary = kept !== undefined;

    // Fillers draw from the far side of the list so a painting and its
    // double are never neighbours on the ring.
    const workIndex = isPrimary
      ? kept
      : (fillerRank++ + Math.floor(works.length / 2)) % works.length;

    return {
      ...works[workIndex],
      slot: i,
      isPrimary,
      lineIndex: isPrimary ? kept : (i * keptCount) / slotCount,
      keptCount,
    };
  });
}
