import Image from "next/image";
import { about } from "@/data/about";

/**
 * Mirrors Figma node 2005:266: an oversized pull quote across the top left,
 * then a row with the portrait in the middle column and the bio text pushed
 * out to the right edge.
 */
export function AboutSection() {
  return (
    <section
      id="about"
      // Top padding matches the gap between the quote and the image below
      // it. It was trimmed back when the band rode the page and left a gap
      // of its own above this; the band holds still now, so the section sets
      // its own spacing again.
      className="relative z-20 bg-white px-6 pb-24 pt-10 sm:px-10 sm:pb-32 sm:pt-12"
    >
      <p className="font-display max-w-[54%] text-[clamp(1.75rem,3.7vw,3.3rem)] uppercase leading-[1.06] text-ink max-lg:max-w-none">
        &ldquo;{about.quote}&rdquo;
      </p>

      <div className="mt-10 grid grid-cols-12 gap-6 max-lg:flex max-lg:flex-col max-lg:gap-10 sm:mt-12">
        <div className="relative col-span-3 col-start-5 aspect-[324/432] max-lg:w-full max-lg:max-w-sm">
          <Image
            src={about.portrait.src}
            alt={about.portrait.alt}
            fill
            sizes="(min-width: 1024px) 25vw, 90vw"
            className="object-cover"
          />
        </div>

        <div className="col-span-4 col-start-9 flex flex-col gap-[18px] font-body text-sm leading-[1.35] text-muted">
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
