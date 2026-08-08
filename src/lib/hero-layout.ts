import { activeRing } from "@/config/ring";
import { works } from "@/data/works";

/**
 * Vertical layout of the mobile hero.
 *
 * Phone heights vary far more than their widths, so pinning the text to the
 * top while placing the band at a fraction of the viewport height pulled the
 * two apart on tall screens and crowded them on short ones. Instead the text
 * and the band are measured as one group and centred together, which holds
 * the composition across the range of devices.
 *
 * <Brand /> owns the text, <WorksRing /> owns the band; both read their
 * positions from here so the two halves cannot drift apart.
 */

/** The wordmark is laid out at this size, then transformed to fit. */
export const BASE_FONT = 100;
export const LINE_HEIGHT = 0.88;

/** Inset from the sides, and the floor for the group's distance from the top. */
export const MOBILE_INSET = 16;
/** Between the tagline, the wordmark and the categories. */
export const MOBILE_GAP = 28;
/** Line box of the caption rows, fixed so type size does not move the layout. */
export const CAPTION_LINE = 24;
/** Share of the content width the wordmark fills. */
export const MOBILE_TITLE_FILL = 0.69;
/**
 * Between the categories row and the top of the band. Wider than the gaps
 * inside the text block: cards on the far side of the cylinder ride above
 * the near ones, so the band reaches higher than its centre suggests.
 */
const TEXT_TO_BAND = 91;
/**
 * Height of the bar the Contact button is centred in. The group is centred
 * in the space above it rather than in the viewport, so the button never
 * eats into the composition. Keep in step with <ContactPill />.
 */
export const PILL_ZONE = 96;

/**
 * Layout width of the widest wordmark line at BASE_FONT — a constant of the
 * typeface, so it is measured once by <Brand /> and shared from there.
 */
let wordmarkWidth = 0;

export function setWordmarkWidth(width: number) {
  wordmarkWidth = width;
}

export function mobileTitleScale(vw: number) {
  const content = vw - MOBILE_INSET * 2;
  return wordmarkWidth ? (content * MOBILE_TITLE_FILL) / wordmarkWidth : 1;
}

/** The wordmark stacks onto two lines on mobile. */
export function mobileTitleHeight(vw: number) {
  return BASE_FONT * LINE_HEIGHT * mobileTitleScale(vw) * 2;
}

/** Tagline, wordmark and categories, with a gap between each. */
export function mobileTextHeight(vw: number) {
  return (
    CAPTION_LINE + MOBILE_GAP + mobileTitleHeight(vw) + MOBILE_GAP + CAPTION_LINE
  );
}

/** Mean aspect of the works, standing in for a typical card. */
export function meanAspect() {
  if (!works.length) return 0.75;
  return (
    works.reduce((sum, work) => sum + work.width / work.height, 0) /
    works.length
  );
}

/**
 * Visual extent of the coiled band: a typical card, plus roughly the spread
 * the height scatter throws them across. Only a handful of cards are on the
 * near side at a time, so they never reach the full range of the scatter —
 * counting all of it read as a taller band than the eye sees, and left the
 * composition sitting high with a gap above the button.
 */
export function mobileBandHeight(vw: number, vh: number) {
  const cfg = activeRing();
  return (vw * cfg.cardWidthRing) / meanAspect() + cfg.heightJitter * vh;
}

/**
 * Top of the text block — the top of the group as a whole. Centred in the
 * frame itself: the Contact button is a small pill on the baseline rather
 * than a band of furniture, and reserving its full height pushed the
 * composition off centre.
 */
export function mobileGroupTop(vw: number, vh: number) {
  const group =
    mobileTextHeight(vw) + TEXT_TO_BAND + mobileBandHeight(vw, vh);
  return Math.max(MOBILE_INSET, (vh - group) / 2);
}

/**
 * Centre of the coiled band in world units — screen centre is 0, up is
 * positive, one unit is one CSS pixel.
 */
export function mobileBandCentre(vw: number, vh: number) {
  const bandTop =
    mobileGroupTop(vw, vh) + mobileTextHeight(vw) + TEXT_TO_BAND;
  return vh / 2 - (bandTop + mobileBandHeight(vw, vh) / 2);
}
