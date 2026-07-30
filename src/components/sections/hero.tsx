import { RING_RUNWAY_ID } from "@/lib/constants";

/**
 * Scroll runway for the hero sequence. The wordmark lives in <Brand /> and
 * the artworks in <WorksRing />, both fixed overlays — this element only
 * supplies the scroll distance that drives them.
 */
export function Hero() {
  return <div id={RING_RUNWAY_ID} className="h-[420vh]" />;
}
