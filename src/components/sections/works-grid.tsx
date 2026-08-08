"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";
import { subscribeWorks, works, worksVersion } from "@/data/works";
import { formatPrice } from "@/lib/format";
import { openWork } from "@/lib/work-overlay";

/**
 * The gallery as a grid, for phones.
 *
 * A horizontal strip competes with the page's own scrolling and hides most
 * of the work behind a gesture nobody is told about. Two columns of tiles is
 * how a phone shows a gallery.
 *
 * Every tile is the same square regardless of the painting's proportions —
 * hers run from 26 x 19 to 100 x 110 — with the image sitting inside on a
 * soft grey. Letting the tiles follow the paintings would leave every row
 * ragged and different heights; this way the varied shapes read as variety
 * rather than as a broken layout.
 */
export function WorksGrid() {
  useSyncExternalStore(subscribeWorks, worksVersion, () => 0);

  if (!works.length) return null;

  return (
    // Geometry from the Mobile 5 frame: 16px inset and a 12px gutter. The
    // row gap is wider than the frame's 16 — the caption needs air beneath
    // it, or it reads as belonging to the tile below it rather than above.
    <section className="relative z-20 bg-white px-4 pb-28 pt-10 md:hidden">
      <ul className="grid grid-cols-2 gap-x-3 gap-y-9">
        {works.map((work) => (
          <li key={work.id}>
            <button
              type="button"
              onClick={() => openWork(work.slug)}
              className="group block w-full text-left"
            >
              {/* `fill` rather than intrinsic width: the originals are
                  3000px across, and letting the image size itself blew
                  straight through the tile. The inset gives the painting
                  room to breathe inside its square. */}
              {/* 174.5 x 215 in the frame, with the painting inset about an
                  eighth of the tile on each side. */}
              <div className="relative aspect-[174.5/215] overflow-hidden bg-neutral-100">
                <div className="absolute inset-x-[12.6%] inset-y-[12.1%]">
                  <Image
                    src={work.src}
                    alt={work.title ?? "Painting"}
                    fill
                    sizes="50vw"
                    className="object-contain transition-transform duration-500 group-active:scale-[0.98]"
                  />
                </div>
              </div>
              <p className="mt-2 text-center font-body text-base font-medium leading-tight text-ink">
                {work.title}
              </p>
              <p className="mt-1 text-center font-body text-xs text-muted">
                {work.status === "sold"
                  ? "Sold"
                  : [work.dimensions, work.price ? formatPrice(work.price) : null]
                      .filter(Boolean)
                      .join(" · ")}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
