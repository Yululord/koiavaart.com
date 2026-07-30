"use client";

import { useState, useSyncExternalStore } from "react";
import {
  ringConfig,
  ringConfigRanges,
  ringSlotCount,
  ringSpacingActual,
  setRingConfig,
  type RingConfig,
} from "@/config/ring";

type Group = { label: string; keys: (keyof RingConfig)[] };

const GROUPS: Group[] = [
  {
    label: "Cylinder",
    keys: ["radiusFactor", "ringSpacing", "cardWidthRing"],
  },
  {
    label: "Line",
    keys: ["lineSpacing", "cardWidthLine"],
  },
  {
    label: "Placement",
    keys: ["verticalOffset"],
  },
  {
    label: "Shape",
    keys: [
      "tiltX",
      "tiltZ",
      "cardRoll",
      "heightJitter",
      "sizeJitter",
      "jitterFlatten",
      "depthFade",
    ],
  },
  {
    label: "Motion",
    keys: [
      "idleSpeed",
      "stripTravel",
      "pointerPush",
      "unwindEnd",
      "fadeStart",
    ],
  },
  { label: "Camera", keys: ["fov", "hoverScale"] },
];

const LABELS: Partial<Record<keyof RingConfig, string>> = {
  radiusFactor: "Radius",
  ringSpacing: "Gap between cards",
  cardWidthRing: "Card width",
  lineSpacing: "Gap between cards",
  cardWidthLine: "Card width",
  verticalOffset: "Vertical position",
  tiltX: "Tilt (up/down)",
  tiltZ: "Tilt (roll)",
  cardRoll: "Card roll (random)",
  heightJitter: "Height scatter",
  sizeJitter: "Size scatter",
  jitterFlatten: "Flatten scatter in line",
  depthFade: "Far-side fade",
  idleSpeed: "Idle speed",
  stripTravel: "Scroll travel",
  pointerPush: "Mouse parallax",
  unwindEnd: "Unwrap ends at",
  fadeStart: "Fade out starts at",
  fov: "Field of view",
  hoverScale: "Hover zoom",
};

const subscribeNever = () => () => {};

/**
 * Live tuning panel for the hero cylinder. Hidden unless the URL carries
 * `?tune`, so it never shows for visitors. Values apply immediately; use
 * Copy to lift the whole set back into src/config/ring.ts.
 */
export function RingControls() {
  const [, force] = useState(0);
  const [copied, setCopied] = useState(false);

  // Read through a store so the server snapshot is `false` and hydration
  // stays consistent; the flag never changes without a navigation.
  const visible = useSyncExternalStore(
    subscribeNever,
    () => new URLSearchParams(window.location.search).has("tune"),
    () => false,
  );

  if (!visible) return null;

  const update = (key: keyof RingConfig, value: number) => {
    setRingConfig({ [key]: value } as Partial<RingConfig>);
    force((n) => n + 1);
  };

  const copy = async () => {
    const body = (Object.keys(ringConfig) as (keyof RingConfig)[])
      .map((k) => `  ${k}: ${Number(ringConfig[k].toFixed(4))},`)
      .join("\n");
    await navigator.clipboard.writeText(
      `export const ringConfig: RingConfig = {\n${body}\n};`,
    );
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    // data-lenis-prevent keeps the panel's own scrolling out of Lenis's hands.
    <div
      data-lenis-prevent
      className="fixed right-4 top-4 z-[100] max-h-[92vh] w-72 overflow-y-auto overscroll-contain rounded-lg bg-black/85 p-4 font-mono text-[11px] text-white shadow-xl backdrop-blur"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="font-semibold tracking-wide">Cylinder</span>
        <button
          type="button"
          onClick={copy}
          className="rounded bg-white/15 px-2 py-1 transition-colors hover:bg-white/25"
        >
          {copied ? "Copied" : "Copy config"}
        </button>
      </div>

      <div className="mb-3 flex justify-between rounded bg-white/10 px-2 py-1">
        <span className="text-white/60">Cards to close ring</span>
        <span>
          {ringSlotCount()} @ {ringSpacingActual().toFixed(3)}
        </span>
      </div>

      {GROUPS.map((group) => (
        <div key={group.label} className="mb-3">
          <div className="mb-1 text-white/40">{group.label}</div>
          {group.keys.map((key) => {
            const [min, max, step] = ringConfigRanges[key];
            return (
              <label key={key} className="mb-2 block">
                <span className="flex justify-between text-white/70">
                  {LABELS[key] ?? key}
                  <span className="text-white">
                    {Number(ringConfig[key].toFixed(4))}
                  </span>
                </span>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={ringConfig[key]}
                  onChange={(e) => update(key, Number(e.target.value))}
                  className="mt-1 w-full accent-white"
                />
              </label>
            );
          })}
        </div>
      ))}
    </div>
  );
}
