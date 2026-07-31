/**
 * Which painting is open, held in the URL as `?work=<slug>` so a specific
 * artwork can be linked, reloaded and closed with the browser's back button.
 *
 * Deliberately built on the History API rather than the router: the hero is
 * a WebGL scene driven by scroll position, and a router navigation would
 * remount it and lose where the visitor was.
 */
const PARAM = "work";

const listeners = new Set<() => void>();
let pushedByUs = false;

function emit() {
  listeners.forEach((listener) => listener());
}

function readSlug(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(PARAM);
}

export function subscribeOpenWork(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener("popstate", emit);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("popstate", emit);
  };
}

export const openWorkSnapshot = readSlug;
export const openWorkServerSnapshot = () => null;

export function openWork(slug: string) {
  const url = new URL(window.location.href);
  url.searchParams.set(PARAM, slug);
  window.history.pushState(null, "", url);
  pushedByUs = true;
  emit();
}

/** Swaps the painting without stacking a history entry per arrow press. */
export function replaceWork(slug: string) {
  const url = new URL(window.location.href);
  url.searchParams.set(PARAM, slug);
  window.history.replaceState(null, "", url);
  emit();
}

export function closeWork() {
  // Going back keeps the history tidy, but only if we were the ones who
  // added the entry — on a shared link there is nothing of ours to go back
  // to, so strip the parameter in place instead.
  if (pushedByUs) {
    pushedByUs = false;
    window.history.back();
    return;
  }
  const url = new URL(window.location.href);
  url.searchParams.delete(PARAM);
  window.history.replaceState(null, "", url);
  emit();
}
