"use client";

import { useEffect, useState } from "react";
import { site } from "@/data/site";
import { RING_RUNWAY_ID } from "@/lib/constants";

export function SiteHeader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const runway = document.getElementById(RING_RUNWAY_ID);
    if (!runway) return;

    // The slim bar takes over from the oversized hero wordmark once the
    // ring sequence is done — it is absent from the hero frame in Figma.
    const onScroll = () => {
      const end = runway.offsetTop + runway.offsetHeight - window.innerHeight;
      setVisible(window.scrollY > end - 40);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 flex items-end gap-6 border-b border-line bg-white px-6 py-4 transition-opacity duration-300 sm:gap-12 sm:px-10 sm:py-6 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <p className="flex-1 truncate font-body text-sm text-muted sm:text-base">
        {site.taglineLeft}
      </p>
      <p className="font-display shrink-0 whitespace-nowrap text-lg uppercase leading-none text-ink sm:text-2xl">
        {site.name}
      </p>
      <p className="flex-1 truncate text-right font-body text-sm text-muted sm:text-base">
        {site.taglineRight}
      </p>
    </header>
  );
}
