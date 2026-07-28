/**
 * Presentation-only honesty markers. Both documents are genuine, but the
 * seeded link points at a copy rather than at the publisher's own server,
 * so the discrepancy is stated on the page instead of being discovered by
 * clicking. No retrieval or data behaviour depends on this map.
 */
export const MIRROR_NOTICES: Record<string, string> = {
  "src-bmf-erech-2024":
    "Mirror copy — the ministry's own URL is no longer live; this is an identical official copy hosted by the IHK.",
  "src-gobd-2019":
    "Mirror copy — the ministry's own URL is no longer live; this is the Internet Archive capture of the official PDF.",
};
