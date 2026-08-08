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

export type WorkImage = { src: string; width: number; height: number };

export type SanityWork = {
  id: string;
  slug: string;
  /** The first image — what the gallery shows. */
  src: string;
  width: number;
  height: number;
  /** Every image, first included, for stepping through on the detail view. */
  images: WorkImage[];
  title: string;
  medium?: string;
  dimensions?: string;
  description?: string;
  price?: string;
  year?: number;
  available?: boolean;
  buyUrl?: string;
};

/**
 * Only paintings with at least one image: a record can exist before its
 * photograph does, and the gallery has nothing to show for one until then.
 */
const WORKS = groq`
  *[_type == "work" && count(images[defined(asset)]) > 0]
    | order(coalesce(order, 9999) asc, _createdAt asc) {
      "id": _id,
      "slug": slug.current,
      "src": images[0].asset->url,
      "width": images[0].asset->metadata.dimensions.width,
      "height": images[0].asset->metadata.dimensions.height,
      "images": images[defined(asset)] {
        "src": asset->url,
        "width": asset->metadata.dimensions.width,
        "height": asset->metadata.dimensions.height
      },
      title,
      medium,
      dimensions,
      description,
      price,
      year,
      available,
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
