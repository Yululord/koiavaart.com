"use client";

import { useSyncExternalStore } from "react";
import { setWorks, subscribeWorks, worksVersion, type Work } from "@/data/works";

/**
 * Hands the paintings fetched on the server to the client-side store the
 * hero reads from.
 *
 * Set during render rather than in an effect so the list is in place before
 * the ring's first frame — an effect would run after, and the cylinder would
 * build itself empty and then rebuild.
 */
export function WorksData({ works }: { works: Work[] }) {
  setWorks(works);
  useSyncExternalStore(subscribeWorks, worksVersion, () => works.length);
  return null;
}
