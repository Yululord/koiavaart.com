import Image from "next/image";
import { contact, socialHref } from "@/data/site";

export function GalleryContact() {
  return (
    <section
      id="contact"
      className="relative z-20 overflow-hidden bg-panel pt-16 sm:pt-24"
    >
      <div className="relative z-10 flex flex-col gap-10 px-6 sm:flex-row sm:items-start sm:justify-between sm:gap-12 sm:px-10">
        <div className="flex flex-col gap-4">
          <p className="font-body text-base text-panel-muted">{contact.note}</p>
          <a
            href={`mailto:${contact.email}`}
            className="font-display break-all text-3xl uppercase leading-none text-white transition-opacity hover:opacity-70 sm:text-5xl"
          >
            {contact.email}
          </a>
        </div>

        {/* The label stays put; each handle is its own link, so only the one
            under the cursor responds. */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:flex sm:gap-12">
          {contact.socials.map((social) => (
            <div
              key={social.label}
              className="flex flex-col items-start gap-1 whitespace-nowrap"
            >
              <span className="font-body text-sm text-panel-muted">
                {social.label}
              </span>
              {social.handles.map((entry) => (
                <a
                  key={entry.handle}
                  href={socialHref(entry)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-body text-base text-white transition-opacity hover:opacity-70"
                >
                  {entry.handle}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Full bleed: the collage runs edge to edge while the text above it
          keeps the page padding. The desktop one is flattened by
          scripts/build-collage.mjs; mobile has its own, cut to four pieces,
          because the twelve-piece version shrinks to a thin band on a phone. */}
      <Image
        aria-hidden
        src="/images/gallery/collage-mobile.png"
        alt=""
        width={590}
        height={437}
        sizes="100vw"
        className="pointer-events-none mt-10 h-auto w-full select-none opacity-90 md:hidden"
      />
      <Image
        aria-hidden
        src="/images/gallery/collage.png"
        alt=""
        width={2880}
        height={806}
        sizes="100vw"
        className="pointer-events-none mt-10 hidden h-auto w-full select-none opacity-90 md:block"
      />
    </section>
  );
}
