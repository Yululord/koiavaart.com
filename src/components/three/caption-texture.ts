import * as THREE from "three";

/**
 * Renders a caption to a canvas texture, so it lives in the scene and picks
 * up the band's motion, depth fade and scroll-away for free — rather than
 * being a DOM layer that has to be kept in sync with the WebGL positions
 * every frame.
 */
const WIDTH = 640;
const HEIGHT = 72;
const BASE_FONT = 30;
const PADDING = 24;

const cache = new Map<string, THREE.CanvasTexture>();

/** next/font generates a hashed family name, so read it off the document. */
function fontStack() {
  if (typeof document === "undefined") return "sans-serif";
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-sans")
    .trim();
  return value ? `${value}, sans-serif` : "sans-serif";
}

function paint(ctx: CanvasRenderingContext2D, text: string, color: string) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // Shrink to fit rather than clip, so a long medium still reads.
  let size = BASE_FONT;
  do {
    ctx.font = `400 ${size}px ${fontStack()}`;
    if (ctx.measureText(text).width <= WIDTH - PADDING * 2) break;
    size -= 1;
  } while (size > 12);

  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, WIDTH / 2, HEIGHT / 2);
}

export function captionTexture(text: string, color: string) {
  const key = `${text}|${color}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d")!;
  paint(ctx, text, color);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  cache.set(key, texture);

  // The first paint can land before the webfont is ready, which would set
  // the caption in a fallback face; redraw once it has loaded.
  document.fonts?.ready.then(() => {
    paint(ctx, text, color);
    texture.needsUpdate = true;
  });

  return texture;
}

/** Caption height relative to its width, from the canvas aspect. */
export const CAPTION_ASPECT = HEIGHT / WIDTH;
