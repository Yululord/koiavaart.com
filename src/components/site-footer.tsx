import { site } from "@/data/site";

/**
 * Closing footer row. The Contact button is not repeated here — the pinned
 * one from <ContactPill /> already sits in the centre of this row.
 */
export function SiteFooter() {
  return (
    // Nothing left in this row on a phone — the copyright sat behind the
    // pinned Contact button — so it collapses away and the collage runs to
    // the bottom of the page rather than trailing a blank white band.
    <footer className="relative z-20 hidden h-24 items-center justify-between bg-white px-6 sm:px-10 md:flex">
      <p className="font-body text-sm text-muted">{site.copyright}</p>
      <p className="hidden font-body text-sm text-muted md:block">
        {site.categories.join(" · ")}
      </p>
    </footer>
  );
}
