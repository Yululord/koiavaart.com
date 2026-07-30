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

// The coiled ring needs roughly twice as many cards as there are works to
// look as dense as the Figma hero, but the unrolled strip must never repeat
// a painting. Walking the set twice gives both: because the slot count (18)
// and the work count (9) differ by a factor of two, every *other* slot
// carries a distinct work — `works[(2k) % 9]` for k = 0..8 covers all nine.
// The ring therefore drops its odd slots as it unrolls, leaving nine unique
// paintings evenly spaced. See CARD_FILL_LINE in works-ring.tsx.
export const ringRepeats = 2;

export const ringSlots = Array.from(
  { length: works.length * ringRepeats },
  (_, i) => ({ ...works[i % works.length], slot: i }),
);
