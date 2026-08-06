import { site } from "@/data/site";

/**
 * Closing footer row. The Contact button is not repeated here — the pinned
 * one from <ContactPill /> already sits in the centre of this row.
 */
export function SiteFooter() {
  return (
    <footer className="relative z-20 flex h-24 items-center justify-between bg-white px-6 sm:px-10">
      {/* Desktop only: on a phone the pinned Contact button sits right over
          this row, and the copyright ends up behind it. */}
      <p className="hidden font-body text-sm text-muted md:block">
        {site.copyright}
      </p>
      <p className="hidden font-body text-sm text-muted md:block">
        {site.categories.join(" · ")}
      </p>
    </footer>
  );
}
