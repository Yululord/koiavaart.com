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
 * Lays the works out around the cylinder. One repeat means every painting
 * appears exactly once, whether coiled or unrolled — raise it (via the
 * `repeats` control) to pack the ring more densely, at the cost of seeing
 * a painting more than once as the strip scrolls.
 */
export function buildRingSlots(repeats: number) {
  return Array.from({ length: works.length * Math.max(1, repeats) }, (_, i) => ({
    ...works[i % works.length],
    slot: i,
  }));
}
