/**
 * Anchor resolution (§0.2).
 *
 * Resolution order:
 *   1. [data-tour="area.element"]
 *   2. the `tourId` prop on Panel / PageHeader — which renders the same
 *      data-tour attribute, so it is covered by step 1
 *   3. an existing stable selector already in the codebase — reused, never
 *      duplicated
 *
 * Nothing here throws. A missing anchor resolves to null and the caller
 * degrades with an honest note.
 */

/** Step 3 of the resolution order: pre-existing selectors, in priority order. */
const EXISTING_SELECTORS: Record<string, string[]> = {
  "overview.nav": ['nav[aria-label="Main"]'],
  "inbox.search": ["#request-search"],
  "knowledge.query": ["#knowledge-query"],
  "intake.field": ["#intake-f-list-price", '[id^="intake-f-"]'],
  "intake.help": ['[id^="help-f-"]'],
  "sources.passages": ['[data-tour="sources.passages"]', 'li[id^="p-"]'],
};

export function findAnchor(anchor: string): HTMLElement | null {
  if (typeof document === "undefined") return null;
  const selectors = [`[data-tour="${cssEscape(anchor)}"]`, ...(EXISTING_SELECTORS[anchor] ?? [])];
  for (const selector of selectors) {
    let el: Element | null = null;
    try {
      el = document.querySelector(selector);
    } catch {
      el = null;
    }
    if (el instanceof HTMLElement && isRendered(el)) return el;
  }
  return null;
}

/** Polls for an anchor until it appears or the budget runs out. */
export function waitForAnchor(
  anchor: string,
  budgetMs = 1600,
): { promise: Promise<HTMLElement | null>; cancel: () => void } {
  let cancelled = false;
  const started = Date.now();
  const promise = new Promise<HTMLElement | null>((resolve) => {
    const tick = () => {
      if (cancelled) return resolve(null);
      const el = findAnchor(anchor);
      if (el) return resolve(el);
      if (Date.now() - started >= budgetMs) return resolve(null);
      window.setTimeout(tick, 80);
    };
    tick();
  });
  return { promise, cancel: () => (cancelled = true) };
}

function isRendered(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  return rect.width > 0 || rect.height > 0;
}

export interface AnchorRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function rectOf(el: HTMLElement): AnchorRect {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

export function scrollAnchorIntoView(el: HTMLElement, reducedMotion: boolean) {
  const r = el.getBoundingClientRect();
  const fullyVisible = r.top >= 72 && r.bottom <= window.innerHeight - 220;
  if (fullyVisible) return false;
  el.scrollIntoView({
    behavior: reducedMotion ? "auto" : "smooth",
    block: "center",
    inline: "nearest",
  });
  return true;
}

export function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function cssEscape(value: string) {
  return value.replace(/["\\]/g, "\\$&");
}