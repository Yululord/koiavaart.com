import "server-only";
import { groq } from "next-sanity";
import { sanityClient } from "./client";

/**
 * Reads for the site. Server-only: the queries run during rendering and the
 * results are passed down as props, so no Sanity credentials or client code
 * reach the browser.
 *
 * Each painting carries its image dimensions as well as its URL. The hero
 * needs the aspect ratio to lay a card out *before* the texture has loaded —
 * without it every card would start square and jump once the image arrived.
 */

export type SanityWork = {
  id: string;
  slug: string;
  src: string;
  width: number;
  height: number;
  title: string;
  medium?: string;
  dimensions?: string;
  description?: string;
  price?: string;
  buyUrl?: string;
};

const WORKS = groq`
  *[_type == "work" && defined(image.asset)] | order(coalesce(order, 9999) asc, _createdAt asc) {
    "id": _id,
    "slug": slug.current,
    "src": image.asset->url,
    "width": image.asset->metadata.dimensions.width,
    "height": image.asset->metadata.dimensions.height,
    title,
    medium,
    dimensions,
    description,
    price,
    buyUrl
  }
`;

export async function getWorks() {
  return sanityClient.fetch<SanityWork[]>(
    WORKS,
    {},
    { next: { revalidate: 60, tags: ["work"] } },
  );
}

export type SanityAbout = {
  quote?: string;
  body?: string[];
  portrait?: { src: string; width: number; height: number } | null;
};

const ABOUT = groq`
  *[_type == "about"][0] {
    quote,
    body,
    "portrait": portrait.asset-> {
      "src": url,
      "width": metadata.dimensions.width,
      "height": metadata.dimensions.height
    }
  }
`;

export async function getAbout() {
  return sanityClient.fetch<SanityAbout | null>(
    ABOUT,
    {},
    { next: { revalidate: 60, tags: ["about"] } },
  );
}

export type SanitySettings = {
  note?: string;
  email?: string;
  socials?: { label: string; handles: { handle: string; href?: string }[] }[];
};

const SETTINGS = groq`
  *[_type == "settings"][0] {
    note,
    email,
    socials[] { label, handles[] { handle, href } }
  }
`;

export async function getSettings() {
  return sanityClient.fetch<SanitySettings | null>(
    SETTINGS,
    {},
    { next: { revalidate: 60, tags: ["settings"] } },
  );
}
