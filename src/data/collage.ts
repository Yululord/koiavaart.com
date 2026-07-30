// Static cutout collage that sits in the dark contact panel
// (Figma node 2005:431). Positions are absolute pixels inside a
// 1440 x 548 panel and are scaled proportionally at other widths.

export type CollagePiece = {
  id: string;
  src: string;
  left: number;
  top: number;
  width: number;
  height: number;
  /** Rendered upside-down in the Figma comp. */
  flipped?: boolean;
};

export const collageFrame = { width: 1440, height: 548 };

export const collagePieces: CollagePiece[] = [
  { id: "37", src: "/images/gallery/collage-37.png", left: -36, top: 237, width: 191, height: 255 },
  { id: "36", src: "/images/gallery/collage-36.png", left: 73, top: 176, width: 301, height: 422, flipped: true },
  { id: "42", src: "/images/gallery/collage-42.png", left: 215, top: 237, width: 293.89, height: 385 },
  { id: "32", src: "/images/gallery/collage-32.png", left: 381, top: 225, width: 232, height: 523 },
  { id: "38", src: "/images/gallery/collage-38.png", left: 492, top: 339, width: 278.87, height: 260, flipped: true },
  { id: "43", src: "/images/gallery/collage-43.png", left: 588, top: 189, width: 133, height: 125 },
  { id: "39", src: "/images/gallery/collage-39.png", left: 655, top: 314, width: 246, height: 265 },
  { id: "41", src: "/images/gallery/collage-41.png", left: 755, top: 163, width: 337, height: 505 },
  { id: "35", src: "/images/gallery/collage-35.png", left: 980, top: 296, width: 236.03, height: 452 },
  { id: "46", src: "/images/gallery/collage-46.png", left: 1083, top: 184, width: 315, height: 165 },
  { id: "31", src: "/images/gallery/collage-31.png", left: 1092, top: 176, width: 290, height: 448 },
  { id: "33", src: "/images/gallery/collage-33.png", left: 1168, top: 145, width: 364, height: 465 },
];
