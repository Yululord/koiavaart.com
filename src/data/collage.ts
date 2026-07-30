// Static cutout collage for the dark contact panel (Figma node 2005:431).
//
// Order matters: these overlap heavily, so the array is kept in Figma's own
// paint order (first entry sits furthest back). Coordinates are absolute
// pixels inside the frame below and are scaled proportionally at other
// widths; pieces deliberately run past the bottom edge and are clipped.

export type CollagePiece = {
  id: string;
  src: string;
  left: number;
  top: number;
  width: number;
  height: number;
  /** Mirrored horizontally in the comp. */
  mirrored?: boolean;
  /** Turned upside down in the comp. */
  upsideDown?: boolean;
  /**
   * Where the artwork sits inside its box, for the pieces whose box is a
   * different aspect ratio to the image and therefore crops it off-centre.
   */
  objectPosition?: string;
};

/** Region of the Figma panel this collage covers (y 145 → 548). */
export const collageFrame = { width: 1440, height: 403 };

export const collagePieces: CollagePiece[] = [
  { id: "46", src: "/images/gallery/collage-46.png", left: 1083, top: 39, width: 315, height: 165 },
  { id: "36", src: "/images/gallery/collage-36.png", left: 73, top: 31, width: 301, height: 422, mirrored: true },
  { id: "42", src: "/images/gallery/collage-42.png", left: 215, top: 92, width: 293.89, height: 385 },
  { id: "32", src: "/images/gallery/collage-32.png", left: 381, top: 80, width: 232, height: 523, objectPosition: "0% 50%" },
  { id: "39", src: "/images/gallery/collage-39.png", left: 655, top: 169, width: 246, height: 265 },
  { id: "38", src: "/images/gallery/collage-38.png", left: 492, top: 194, width: 278.87, height: 260, upsideDown: true },
  { id: "41", src: "/images/gallery/collage-41.png", left: 755, top: 18, width: 337, height: 505 },
  { id: "31", src: "/images/gallery/collage-31.png", left: 1092, top: 31, width: 290, height: 448, objectPosition: "50% 99%" },
  { id: "35", src: "/images/gallery/collage-35.png", left: 980, top: 151, width: 236.03, height: 452 },
  { id: "33", src: "/images/gallery/collage-33.png", left: 1168, top: 0, width: 364, height: 465, objectPosition: "100% 50%" },
  { id: "37", src: "/images/gallery/collage-37.png", left: -36, top: 92, width: 191, height: 255 },
  { id: "43", src: "/images/gallery/collage-43.png", left: 588, top: 44, width: 133, height: 125 },
];
