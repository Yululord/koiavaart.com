// Valeriia's paintings — the images that ride the hero ring and unwind
// into the horizontal band. Shaped to map onto Sanity documents later.

export type Work = {
  id: string;
  /** URL-safe identifier, used as `?work=<slug>`. */
  slug: string;
  src: string;
  width: number;
  height: number;
  title?: string;
  medium?: string;
  dimensions?: string;
  description?: string;
};

/**
 * PLACEHOLDER copy. Titles read "Untitled" because we genuinely do not know
 * them yet; medium, size and description are the one example from the Figma
 * file, identical across every painting so they cannot be taken for real
 * data. Replace per work — a field left unset simply is not shown.
 */
const PLACEHOLDER_MEDIUM = "Oil on Canvas";
const PLACEHOLDER_SIZE = "31.5 x 31.5 in";
const PLACEHOLDER_DESCRIPTION =
  "Built slowly, in layers, until the image feels alive rather than finished. " +
  "The painting holds still something that usually passes too quickly — a gaze, " +
  "a bloom, a quiet distance between two people.";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];

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
].map((work, i) => {
  const title = `Untitled ${ROMAN[i]}`;
  return {
    ...work,
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    medium: PLACEHOLDER_MEDIUM,
    dimensions: PLACEHOLDER_SIZE,
    description: PLACEHOLDER_DESCRIPTION,
  };
});

export function findWork(slug: string | null) {
  return slug ? (works.find((work) => work.slug === slug) ?? null) : null;
}

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
