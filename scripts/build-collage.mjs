/**
 * Flattens the twelve cutout pieces into one full-width PNG for the contact
 * panel: `node scripts/build-collage.mjs`.
 *
 * The panel just stretches that single image edge to edge, which is far
 * less brittle than positioning twelve overlapping pieces in CSS. Re-run
 * this if the source cutouts change — or simply overwrite
 * public/images/gallery/collage.png with an export from Figma.
 *
 * Geometry comes from Figma node 2005:431, covering the region y 145 → 548
 * of that frame. Order matters: the first entry sits furthest back.
 */
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "public/images/gallery");
const OUT = path.join(SRC, "collage.png");

const FRAME = { width: 1440, height: 403 };
const SCALE = 2;

const pieces = [
  { id: "46", left: 1083, top: 39, width: 315, height: 165 },
  { id: "36", left: 73, top: 31, width: 301, height: 422, mirrored: true },
  { id: "42", left: 215, top: 92, width: 293.89, height: 385 },
  { id: "32", left: 381, top: 80, width: 232, height: 523, position: "left" },
  { id: "39", left: 655, top: 169, width: 246, height: 265 },
  { id: "38", left: 492, top: 194, width: 278.87, height: 260, upsideDown: true },
  { id: "41", left: 755, top: 18, width: 337, height: 505 },
  { id: "31", left: 1092, top: 31, width: 290, height: 448, position: "bottom" },
  { id: "35", left: 980, top: 151, width: 236.03, height: 452 },
  { id: "33", left: 1168, top: 0, width: 364, height: 465, position: "right" },
  { id: "37", left: -36, top: 92, width: 191, height: 255 },
  { id: "43", left: 588, top: 44, width: 133, height: 125 },
];

const canvasW = Math.round(FRAME.width * SCALE);
const canvasH = Math.round(FRAME.height * SCALE);
const layers = [];

for (const p of pieces) {
  const w = Math.round(p.width * SCALE);
  const h = Math.round(p.height * SCALE);
  const left = Math.round(p.left * SCALE);
  const top = Math.round(p.top * SCALE);

  let img = sharp(path.join(SRC, `collage-${p.id}.png`)).resize(w, h, {
    fit: "cover",
    position: p.position ?? "center",
  });

  // Transforms apply after the crop, matching the original CSS.
  if (p.mirrored) img = img.flop();
  if (p.upsideDown) img = img.rotate(180);

  const buf = await img.png().toBuffer();

  // Pieces deliberately run past the edges, and sharp cannot composite at
  // negative offsets, so clip to the frame first.
  const x0 = Math.max(0, left);
  const y0 = Math.max(0, top);
  const x1 = Math.min(canvasW, left + w);
  const y1 = Math.min(canvasH, top + h);
  if (x1 <= x0 || y1 <= y0) continue;

  const clipped =
    x0 !== left || y0 !== top || x1 !== left + w || y1 !== top + h;

  layers.push({
    input: clipped
      ? await sharp(buf)
          .extract({
            left: x0 - left,
            top: y0 - top,
            width: x1 - x0,
            height: y1 - y0,
          })
          .png()
          .toBuffer()
      : buf,
    left: x0,
    top: y0,
  });
}

await sharp({
  create: {
    width: canvasW,
    height: canvasH,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite(layers)
  .png()
  .toFile(OUT);

const meta = await sharp(OUT).metadata();
console.log(`wrote ${path.relative(ROOT, OUT)} — ${meta.width}x${meta.height}`);
