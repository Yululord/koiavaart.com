import createImageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";
import { dataset, projectId } from "./env";

const builder = createImageUrlBuilder({ projectId, dataset });

/** Sanity CDN URL for an image, sized to `width` and served as WebP. */
export function imageUrl(source: SanityImageSource, width: number) {
  return builder.image(source).width(width).auto("format").url();
}
