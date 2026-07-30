import { site } from "@/data/site";
import { ContactPill } from "@/components/contact-pill";

export function SiteFooter() {
  return (
    <footer className="relative z-20 flex items-center justify-between gap-4 bg-white px-6 py-6 sm:px-10 sm:py-8">
      <p className="hidden font-body text-sm text-muted sm:block">
        {site.copyright}
      </p>
      <ContactPill className="mx-auto sm:mx-0" />
      <p className="hidden font-body text-sm text-muted md:block">
        {site.categories.join(" · ")}
      </p>
    </footer>
  );
}
