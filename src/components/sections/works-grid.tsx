"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";
import { subscribeWorks, works, worksVersion } from "@/data/works";
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
    <section className="relative z-20 bg-white px-4 pb-28 pt-10 md:hidden">
      <ul className="grid grid-cols-2 gap-3">
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
              <div className="relative aspect-square overflow-hidden bg-neutral-100">
                <div className="absolute inset-3">
                  <Image
                    src={work.src}
                    alt={work.title ?? "Painting"}
                    fill
                    sizes="50vw"
                    className="object-contain transition-transform duration-500 group-active:scale-[0.98]"
                  />
                </div>
              </div>
              <p className="mt-2 font-body text-sm leading-tight text-ink">
                {work.title}
              </p>
              {work.status === "sold" ? (
                <span className="mt-1 inline-flex items-center rounded-full bg-ink px-2 py-0.5 font-body text-[11px] text-white">
                  Sold
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
