import type { Metadata } from "next";
import Link from "next/link";
import { contact } from "@/data/site";

export const metadata: Metadata = {
  title: "Privacy — Valeriia Koiava",
  description:
    "What this website counts, what it does not store, and how to get in touch about it.",
};

/**
 * The privacy notice.
 *
 * Deliberately a page and a quiet footer link rather than a consent banner:
 * the analytics store nothing on a visitor's device, so there is nothing to
 * ask permission for, and a popup over the paintings would be both a lie and
 * an obstacle. Kept in plain language — a visitor should be able to read it
 * in a minute and know exactly where they stand.
 */
export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 pb-24 pt-20 sm:px-10 sm:pt-28">
      <Link
        href="/"
        className="font-body text-sm text-muted transition-opacity hover:opacity-70"
      >
        ← Back
      </Link>

      <h1 className="font-display mt-8 text-3xl uppercase leading-none text-ink sm:text-4xl">
        Privacy
      </h1>

      <div className="mt-8 flex flex-col gap-6 font-body text-base leading-[1.6] text-muted">
        <p>
          This website uses no cookies and stores nothing on your device. There
          is no advertising on it, and nothing here is shared with or sold to
          anyone.
        </p>

        <h2 className="font-display mt-4 text-xl uppercase leading-none text-ink">
          What is counted
        </h2>
        <p>
          So that Valeriia can tell whether anyone is looking at her work, the
          site keeps a simple tally of visits: the page visited, the country it
          was visited from, the kind of device, and the website or search that
          led here. It also records which paintings are opened, how long each
          one stays on screen, which photograph of a painting was chosen, and
          when someone presses Buy or Contact — which paintings hold
          attention, in other words.
        </p>
        <p>
          These counts are anonymous and not linked to a name, an email
          address, or an identifier kept on your device. Because nothing is
          stored in your browser, the site cannot recognise you if you come
          back tomorrow — every visit is counted fresh. Time is measured only
          while the page is actually in front of you: a tab left open in the
          background counts for nothing.
        </p>

        <h2 className="font-display mt-4 text-xl uppercase leading-none text-ink">
          Who processes it
        </h2>
        <p>
          The tallying is done by{" "}
          <a
            href="https://posthog.com/privacy"
            target="_blank"
            rel="noreferrer"
            className="text-ink underline decoration-line underline-offset-4 transition-opacity hover:opacity-70"
          >
            PostHog
          </a>
          , on servers in the European Union. Your IP address reaches them in
          order to work out the country, and is not kept alongside the tally.
        </p>

        <h2 className="font-display mt-4 text-xl uppercase leading-none text-ink">
          If you write to her
        </h2>
        <p>
          Emailing the address on this site sends your message to Valeriia&apos;s
          own inbox, where it stays. It is used to reply to you and for nothing
          else.
        </p>

        <h2 className="font-display mt-4 text-xl uppercase leading-none text-ink">
          Questions
        </h2>
        <p>
          Write to{" "}
          <a
            href={`mailto:${contact.email}`}
            className="break-all text-ink underline decoration-line underline-offset-4 transition-opacity hover:opacity-70"
          >
            {contact.email}
          </a>
          {" "}and ask. If you would rather the site did not count your visit
          at all, any ad blocker or your browser&apos;s &ldquo;do not
          track&rdquo; setting will stop it.
        </p>
      </div>
    </main>
  );
}
