import { site } from "@/data/site";
import { RING_RUNWAY_ID } from "@/lib/constants";

/**
 * Scroll runway for the hero sequence. The wordmark lives in <Brand /> and
 * the artworks in <WorksRing />, both fixed overlays — this element supplies
 * the scroll distance that drives them.
 *
 * The footer captions are sticky rather than fixed: they hold the bottom of
 * the viewport for as long as the ring sequence runs, then scroll away with
 * the runway. Only the Contact button stays pinned beyond this point.
 */
export function Hero() {
  return (
    // The bar sits at the end of the runway's flow so that `bottom: 0`
    // stickiness pulls it up to the viewport bottom, rather than leaving it
    // stranded at the top.
    <div
      id={RING_RUNWAY_ID}
      className="relative flex h-[420vh] flex-col justify-end"
    >
      <div className="pointer-events-none sticky bottom-0 z-30 flex h-24 items-center justify-between px-6 sm:px-10">
        <p className="font-body text-sm text-muted">{site.copyright}</p>
        <p className="hidden font-body text-sm text-muted md:block">
          {site.categories.join(" · ")}
        </p>
      </div>
    </div>
  );
}
