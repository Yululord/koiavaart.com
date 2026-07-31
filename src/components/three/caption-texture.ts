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

function paintButton(ctx: CanvasRenderingContext2D, color: string) {
  ctx.clearRect(0, 0, BUTTON_WIDTH, BUTTON_HEIGHT);
  const inset = 3;
  const r = (BUTTON_HEIGHT - inset * 2) / 2;

  // Solid white: the pill sits over the artwork itself, so it has to hold
  // up against a dark painting as readily as a pale one.
  ctx.beginPath();
  ctx.roundRect(
    inset,
    inset,
    BUTTON_WIDTH - inset * 2,
    BUTTON_HEIGHT - inset * 2,
    r,
  );
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = `500 ${BUTTON_TEXT}px ${fontStack()}`;
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Learn more", BUTTON_WIDTH / 2, BUTTON_HEIGHT / 2 + 1);
}

/** One shared pill for every card — the artwork behind it is the hit area. */
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
