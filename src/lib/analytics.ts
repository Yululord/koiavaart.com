import posthog from "posthog-js";

/**
 * Analytics for the site: how many people come, where from, and — the part
 * that actually matters for a gallery — which paintings hold their
 * attention and which ones make someone reach for Buy.
 *
 * Cookieless by default. PostHog can identify returning visitors with a
 * cookie, but that needs consent from European visitors and this site has
 * no consent banner. Memory persistence keeps every number that matters
 * here — visits, sources, paintings opened, Buy clicks — and gives up only
 * the ability to recognise somebody who comes back a week later. See
 * `persistence` below to change it.
 */

/**
 * Named PROJECT_TOKEN rather than KEY because that is what PostHog's Vercel
 * integration creates, and those variables are managed by the integration —
 * renaming them here would be undone the next time it syncs.
 *
 * Public by design: it is compiled into the JavaScript the browser
 * downloads. It can send events and can never read them back.
 */
const KEY = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

/**
 * Events go to our own domain and Next rewrites them onward. PostHog's own
 * hostnames are on every ad-blocker list, so measuring from them loses a
 * large and unpredictable slice of real traffic.
 */
const PROXY_PATH = "/ingest";

let started = false;

export function startAnalytics() {
  if (started || !KEY || typeof window === "undefined") return;
  started = true;

  posthog.init(KEY, {
    api_host: PROXY_PATH,
    // Tells PostHog its real home for asset loading, while traffic still
    // goes through the proxy above.
    ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    persistence: "memory",
    // The site is one page with an overlay, so there are no route changes
    // to hook — the single pageview on load is the whole story.
    capture_pageview: true,
    capture_pageleave: true,
    // Session recording is off: it films visitors, which is a much bigger
    // privacy question than counting them, and nobody asked for it.
    disable_session_recording: true,
    autocapture: false,
  });
}

/** No-ops when analytics is not configured, so callers need no guards. */
function track(event: string, props?: Record<string, unknown>) {
  if (!KEY || !started) return;
  posthog.capture(event, props);
}

/** A painting's own page was opened, from the hero or the grid. */
export function trackPaintingOpened(slug: string, title?: string) {
  track("painting_opened", { slug, title });
}

/** Buy was pressed — the closest thing this site has to a conversion. */
export function trackBuyClicked(
  slug: string,
  title?: string,
  price?: number,
) {
  track("buy_clicked", { slug, title, price });
}

/** One of the general enquiry routes was taken. */
export function trackContactClicked(where: "pill" | "footer") {
  track("contact_clicked", { where });
}
