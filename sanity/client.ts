import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "./env";

/**
 * Read-only client for the site itself.
 *
 * `useCdn` is on: content is served from Sanity's cache, which is what a
 * public site wants. Freshness comes from revalidation on the Next side
 * rather than from bypassing the cache on every request.
 */
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
});
