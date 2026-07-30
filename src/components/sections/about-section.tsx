import Image from "next/image";
import { about } from "@/data/about";

export function AboutSection() {
  return (
    <section
      id="about"
      className="relative z-30 mx-auto flex w-full max-w-6xl flex-col gap-12 bg-white px-6 py-24 sm:px-10 sm:py-32"
    >
      <p className="font-display max-w-3xl text-3xl uppercase leading-none text-ink sm:text-5xl">
        &ldquo;{about.quote}&rdquo;
      </p>
      <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:gap-16">
        <div className="relative aspect-[324/432] w-full max-w-xs shrink-0 overflow-hidden sm:w-72">
          <Image
            src={about.portrait.src}
            alt={about.portrait.alt}
            fill
            sizes="(min-width: 640px) 18rem, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-5 font-body text-sm text-muted sm:max-w-md">
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
