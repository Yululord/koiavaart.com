import * as THREE from "three";

/**
 * Card labels rendered to canvas textures, so they live in the scene and
 * pick up the band's motion, depth fade and scroll-away for free — rather
 * than being a DOM layer that has to be kept in sync with the WebGL
 * positions every frame.
 */
const LABEL_WIDTH = 640;
const LABEL_HEIGHT = 168;
const TITLE_SIZE = 44;
const INFO_SIZE = 28;
const PADDING = 24;

const BUTTON_WIDTH = 360;
const BUTTON_HEIGHT = 108;
const BUTTON_TEXT = 30;

const labelCache = new Map<string, THREE.CanvasTexture>();
let buttonTexture: THREE.CanvasTexture | null = null;

/** next/font generates a hashed family name, so read it off the document. */
function fontStack() {
  if (typeof document === "undefined") return "sans-serif";
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-sans")
    .trim();
  return value ? `${value}, sans-serif` : "sans-serif";
}

/** Shrinks to fit rather than clipping, so long titles still read. */
function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  weight: number,
  start: number,
  maxWidth: number,
) {
  let size = start;
  while (size > 10) {
    ctx.font = `${weight} ${size}px ${fontStack()}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 1;
  }
}

function paintLabel(
  ctx: CanvasRenderingContext2D,
  title: string,
  info: string,
  titleColor: string,
  infoColor: string,
) {
  ctx.clearRect(0, 0, LABEL_WIDTH, LABEL_HEIGHT);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const maxWidth = LABEL_WIDTH - PADDING * 2;

  if (title) {
    fitFont(ctx, title, 500, TITLE_SIZE, maxWidth);
    ctx.fillStyle = titleColor;
    ctx.fillText(title, LABEL_WIDTH / 2, info ? 46 : LABEL_HEIGHT / 2);
  }
  if (info) {
    fitFont(ctx, info, 400, INFO_SIZE, maxWidth);
    ctx.fillStyle = infoColor;
    ctx.fillText(info, LABEL_WIDTH / 2, title ? 108 : LABEL_HEIGHT / 2);
  }
}

export function cardLabelTexture(
  title: string,
  info: string,
  titleColor: string,
  infoColor: string,
) {
  const key = `${title}|${info}|${titleColor}|${infoColor}`;
  const cached = labelCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  canvas.width = LABEL_WIDTH;
  canvas.height = LABEL_HEIGHT;
  const ctx = canvas.getContext("2d")!;
  paintLabel(ctx, title, info, titleColor, infoColor);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  labelCache.set(key, texture);

  // The first paint can land before the webfont is ready, which would set
  // the label in a fallback face; redraw once it has loaded.
  document.fonts?.ready.then(() => {
    paintLabel(ctx, title, info, titleColor, infoColor);
    texture.needsUpdate = true;
  });

  return texture;
}

/**
 * Tertiary: words and an arrow on the page itself, no pill and no border.
 * It sits under the caption rather than over the painting, so it no longer
 * has to hold up against the artwork and can drop the white plate.
 */
function paintButton(ctx: CanvasRenderingContext2D, color: string) {
  ctx.clearRect(0, 0, BUTTON_WIDTH, BUTTON_HEIGHT);

  const label = "Learn more";
  const gap = BUTTON_TEXT * 0.45;
  const arrow = BUTTON_TEXT * 0.62;
  const mid = BUTTON_HEIGHT / 2;

  ctx.font = `500 ${BUTTON_TEXT}px ${fontStack()}`;
  const textWidth = ctx.measureText(label).width;
  const startX = (BUTTON_WIDTH - (textWidth + gap + arrow)) / 2;

  ctx.fillStyle = color;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(label, startX, mid + 1);

  // Chevron, pointing the way the card opens.
  const x = startX + textWidth + gap;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, BUTTON_TEXT * 0.09);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x, mid - arrow / 2);
  ctx.lineTo(x + arrow / 2, mid);
  ctx.lineTo(x, mid + arrow / 2);
  ctx.stroke();
}

/** One shared control for every card — the artwork behind it is the hit area. */
export function learnMoreTexture(color: string) {
  if (buttonTexture) return buttonTexture;

  const canvas = document.createElement("canvas");
  canvas.width = BUTTON_WIDTH;
  canvas.height = BUTTON_HEIGHT;
  const ctx = canvas.getContext("2d")!;
  paintButton(ctx, color);

  buttonTexture = new THREE.CanvasTexture(canvas);
  buttonTexture.colorSpace = THREE.SRGBColorSpace;
  buttonTexture.anisotropy = 4;

  document.fonts?.ready.then(() => {
    paintButton(ctx, color);
    buttonTexture!.needsUpdate = true;
  });

  return buttonTexture;
}

export const LABEL_ASPECT = LABEL_HEIGHT / LABEL_WIDTH;
export const BUTTON_ASPECT = BUTTON_HEIGHT / BUTTON_WIDTH;
