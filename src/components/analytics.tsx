"use client";

import { useEffect } from "react";
import { startAnalytics } from "@/lib/analytics";

/**
 * Starts analytics once, after the page has painted.
 *
 * Deliberately in an effect rather than at module scope: the hero has a
 * WebGL scene and seventeen textures to get on screen, and analytics has no
 * business competing with that for the first frame.
 */
export function Analytics() {
  useEffect(() => {
    startAnalytics();
  }, []);

  return null;
}
