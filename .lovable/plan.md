## Goal

Two deliverables in one build:

1. **The brief** — a deep, source-cited research and product/design document following your 33-section structure, written to `/mnt/documents` as a downloadable Markdown file (plus a rendered in-app version).
2. **The prototype** — a live, clickable MVP of the recommended vertical, English UI, demo-mode with realistic clearly-labelled fictional seed data, good enough to carry a five-minute founder demo.

Vertical: evaluate all three honestly on a weighted scorecard, but build TaxHub unless the evidence is overwhelming against it. Early grounding already looks favourable (105,953 chamber members as of 1 Jan 2026 per BStBK Berufsstatistik 2025; recurring documented pain around missing receipts/DMS filing and client-side document chasing).

## Research phase (parallel subagents, all cited)

Four parallel research tracks, each returning facts with working URLs and an explicit facts / inference / assumption split:

- **Track A — market sizing and fragmentation**: firm counts and size bands for Steuerberatung, Handwerk, Umzug/Spedition; labour shortage data; Destatis / BStBK / ZDH / BGL sources.
- **Track B — incumbents and gaps**: DATEV (incl. DUO, DMS), ADDISON, Agenda, Simba, Lexware; Handwerk tools; TMS/moving tools. Documented complaints, published capabilities, integration/export surfaces.
- **Track C — regulation and trust**: GDPR, StBerG/Berufsrecht confidentiality (§203 StGB), DSGVO Auftragsverarbeitung, EU AI Act obligations relevant to professional advice, DATEV data residency claims.
- **Track D — reference products and visual conventions**: JUPUS, Demi and comparable grounded-knowledge products; German B2B/professional software visual language.

Anything unverifiable gets labelled Assumption / Hypothesis to validate / Product recommendation / Design inference. No invented quotes, stats, or competitor features.

## Recommended wedge (to be confirmed by research)

**Mandanten-Rückfrage loop**: an inbound client request arrives (email/call transcript/portal), the system classifies it, runs a guided intake that names exactly the missing documents and facts, checks the firm's own grounded knowledge base, produces a structured case summary with citations, drafts the first useful output (a client reply requesting precisely the missing items, or an answer to a recurring question), and a professional approves before anything leaves the firm. Every step logged.

This augments DATEV rather than replacing it: export/handoff is a stub-but-honest "copy to DATEV" action, clearly labelled as a mocked integration.

## Prototype scope

Routes (English UI, desktop-first, responsive):

```text
/                     Overview — today's requests, open drafts, time saved
/inbox                Request inbox — triage list, classification, status
/inbox/$requestId     Request detail — timeline, intake, sources, draft
/intake/$requestId    Guided intake — missing-information detection
/knowledge            Grounded assistant — ask, answer with citations
/sources              Source library — ingest, freshness, permissions
/sources/$sourceId    Source detail + citation viewer
/drafts/$draftId      Draft review — diff, approve, send confirmation
/activity             Audit trail
/settings             Workspace, team, permissions, integrations (placeholder)
```

Every screen ships loading, empty, error and success states. No dead buttons: anything not real is visibly marked as a demo or mocked integration.

**AI behaviour is simulated deterministically from seed data** for the MVP — no model calls needed for the demo, so it never fails live. The brief specifies exactly where real retrieval would plug in. If you want genuine retrieval later, that's a follow-on using Lovable Cloud + the AI gateway.

## Trust surfaces (the point of the product)

Citations inline and expandable to the source passage; explicit confidence states; a real "I can't answer from your sources" path; conflicting-source and stale-source flags; human approval gate before any external communication; full activity log with who/what/when.

## Design direction

Three named visual territories developed and one recommended — calm, precise, document-dense, high-contrast, no gradients, no glowing orbs, no neon. Semantic token set in `src/styles.css` (oklch) including AI-specific tokens: `source-verified`, `ai-uncertain`, `human-review-required`, `status-*`. Typography chosen to survive long German compound nouns, dates, and citation strings, even though UI copy is English.

## Delivery order

1. Research tracks run in parallel; findings consolidated with a source list.
2. Scorecard, beachhead decision, strongest counterargument, falsification criteria.
3. Design system + tokens land in `src/styles.css` before screens.
4. Seed data and object model (`Workspace, User, Client, Request, Intake, Source, Citation, Answer, Draft, Approval, ActivityEvent`) — names kept identical across nav, screens, and copy.
5. Screens built against the specs.
6. Brief written to `/mnt/documents/taxhub-product-brief.md`, ending with the Claude Code master prompt and machine-readable token block.
7. Accessibility pass (WCAG 2.2 AA), responsive pass, quality-audit checklist.

## Technical notes

TanStack Start with file-based routes, Tailwind v4 tokens, shadcn/ui primitives, feature folders under `src/features/`. No backend in this pass — seed data lives in typed modules, which keeps the demo instant and deterministic. Trade-off stated plainly: persistence, real ingestion, and real retrieval need Lovable Cloud, and the brief scopes that as phase two.

## What this deliberately excludes

Real telephony, real email ingestion, real DATEV connectivity, multi-tenant auth, billing, analytics dashboards with meaningless charts.
