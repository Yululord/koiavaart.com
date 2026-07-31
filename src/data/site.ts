// Placeholder content pulled from the Figma file. Swap for real copy /
// migrate to Sanity later — shapes here are meant to map ~1:1 to future
// Sanity document fields.

export const site = {
  name: "Valeriia Koiava",
  taglineLeft: "Contemporary",
  taglineRight: "Artist",
  categories: ["Painting", "Photography", "Objects", "Interiors"],
  copyright: "All rights reserved © 2026",
};

/** One handle = one link. `href` overrides the derived Instagram URL. */
export type SocialHandle = { handle: string; href?: string };

export const contact = {
  note: "For inquiries, commissions, and collaborations.",
  email: "her@email.com",
  socials: [
    { label: "Instagram", handles: [{ handle: "@koiavalera" }] },
    { label: "Photography", handles: [{ handle: "@koiava_photography" }] },
    {
      label: "Jewelry",
      handles: [{ handle: "@koiava_jewelry" }, { handle: "@harni_zgardy" }],
    },
    { label: "Artlab Art Studio", handles: [{ handle: "@artlab_kr" }] },
  ] satisfies { label: string; handles: SocialHandle[] }[],
};

/**
 * Every handle is an Instagram account, so the URL is derived from it —
 * set `href` on a handle to point it somewhere else.
 */
export function socialHref({ handle, href }: SocialHandle) {
  return href ?? `https://instagram.com/${handle.replace(/^@/, "")}`;
}
