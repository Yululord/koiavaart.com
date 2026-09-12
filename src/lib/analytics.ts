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
    // Surveys are on by default and fetch a further 300KB to draw popups
    // over whatever is on screen. On a site whose whole purpose is looking
    // at paintings, that is the last thing wanted.
    disable_surveys: true,
    // Likewise the experiment framework: nothing here is being A/B tested.
    disable_web_experiments: true,
  });

  // Time with the tab in the background is not time spent looking.
  document.addEventListener("visibilitychange", () => {
    if (!view) return;
    if (document.visibilityState === "hidden") {
      bankTime();
      view.visible = false;
    } else {
      view.since = Date.now();
      view.visible = true;
    }
  });

  // Closing the tab with a painting open still has to report it. pagehide
  // fires where unload does not, which on iOS Safari is most of the time.
  window.addEventListener("pagehide", endPaintingView);
}

/** No-ops when analytics is not configured, so callers need no guards. */
function track(event: string, props?: Record<string, unknown>) {
  if (!KEY || !started) return;
  posthog.capture(event, props);
}

/**
 * How long a painting was actually looked at.
 *
 * This is the number worth having — which paintings hold someone for a
 * minute and which are closed in two seconds — and it needs no cookie. It
 * is a timestamp taken while the overlay is open, not anything remembered
 * about the visitor between visits.
 *
 * Time with the tab hidden does not count. Someone who opens a painting and
 * wanders off to another tab for an hour has not looked at it for an hour,
 * and counting that would quietly make the averages meaningless.
 */
type PaintingView = {
  slug: string;
  title?: string;
  /** Milliseconds on screen so far, tab-hidden time excluded. */
  shown: number;
  /** When the current visible stretch began. */
  since: number;
  visible: boolean;
};

let view: PaintingView | null = null;

function bankTime() {
  if (!view || !view.visible) return;
  const now = Date.now();
  view.shown += now - view.since;
  view.since = now;
}

/** A painting was opened, from the hero, the grid, or a shared link. */
export function beginPaintingView(slug: string, title?: string) {
  // Stepping straight to the next painting closes the current one.
  endPaintingView();

  track("painting_opened", { slug, title });
  view = {
    slug,
    title,
    shown: 0,
    since: Date.now(),
    visible:
      typeof document === "undefined" || document.visibilityState === "visible",
  };
}

/** Closed, stepped away from, or the tab was shut. Safe to call twice. */
export function endPaintingView() {
  if (!view) return;
  bankTime();

  track("painting_closed", {
    slug: view.slug,
    title: view.title,
    // Tenths of a second: enough precision to separate a glance from a
    // look, without pretending to more than the measurement deserves.
    seconds: Math.round(view.shown / 100) / 10,
  });
  view = null;
}

/** A second photograph of the same painting was chosen. */
export function trackPhotoSwitched(slug: string, index: number) {
  track("photo_switched", { slug, index });
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
