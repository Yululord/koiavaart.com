export function ContactPill({ className = "" }: { className?: string }) {
  return (
    <a
      href="#contact"
      className={`inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-black px-6 font-body text-base text-white transition-colors hover:bg-neutral-800 ${className}`}
    >
      Contact
    </a>
  );
}
