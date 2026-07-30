import { site } from "@/data/site";

/**
 * Closing footer row. The Contact button is not repeated here — the pinned
 * one from <ContactPill /> already sits in the centre of this row.
 */
export function SiteFooter() {
  return (
    <footer className="relative z-20 flex h-24 items-center justify-between bg-white px-6 sm:px-10">
      <p className="font-body text-sm text-muted">{site.copyright}</p>
      <p className="hidden font-body text-sm text-muted md:block">
        {site.categories.join(" · ")}
      </p>
    </footer>
  );
}
