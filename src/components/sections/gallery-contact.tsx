import Image from "next/image";
import { contact } from "@/data/site";
import { collageFrame, collagePieces } from "@/data/collage";

export function GalleryContact() {
  return (
    <section
      id="contact"
      className="relative z-20 overflow-hidden bg-panel px-6 pt-16 sm:px-10 sm:pt-24"
    >
      <div className="relative z-10 flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between sm:gap-12">
        <div className="flex flex-col gap-4">
          <p className="font-body text-base text-panel-muted">{contact.note}</p>
          <a
            href={`mailto:${contact.email}`}
            className="font-display break-all text-3xl uppercase leading-none text-white transition-opacity hover:opacity-70 sm:text-5xl"
          >
            {contact.email}
          </a>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-6 sm:flex sm:gap-12">
          {contact.socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-start gap-1 whitespace-nowrap transition-opacity hover:opacity-70"
            >
              <span className="font-body text-sm text-panel-muted">
                {social.label}
              </span>
              {social.handles.map((handle) => (
                <span key={handle} className="font-body text-base text-white">
                  {handle}
                </span>
              ))}
            </a>
          ))}
        </div>
      </div>

      {/* Static cutout collage, positioned exactly as in the Figma comp and
          scaled proportionally with the viewport. */}
      <div
        aria-hidden
        className="pointer-events-none relative mt-10 w-full"
        style={{ aspectRatio: `${collageFrame.width} / ${collageFrame.height}` }}
      >
        {collagePieces.map((piece) => (
          <div
            key={piece.id}
            className="absolute opacity-90"
            style={{
              left: `${(piece.left / collageFrame.width) * 100}%`,
              top: `${(piece.top / collageFrame.height) * 100}%`,
              width: `${(piece.width / collageFrame.width) * 100}%`,
              height: `${(piece.height / collageFrame.height) * 100}%`,
              transform: piece.flipped ? "rotate(180deg)" : undefined,
            }}
          >
            <Image
              src={piece.src}
              alt=""
              fill
              sizes="(min-width: 1440px) 30vw, 40vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
