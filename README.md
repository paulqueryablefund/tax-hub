# TaxHub

An operating layer for German tax practices (Steuerkanzleien). It takes one thing a firm does dozens of times a week — a client asks a question — and carries it from arrival to a reply that a licensed professional has signed off, with every legal statement traced to a passage you can open.

- **Live:** https://fachwerk-geist.lovable.app
- **Repository:** https://github.com/paulqueryablefund/fachwerk-geist

> **This is a single shared demonstration workspace.** One sign-in opens it and everyone uses the same credentials, so every visitor sees and changes the same data. Inside, the product always runs as the demonstration user Miriam Radtke. If a case looks half-finished, someone was here before you: **Settings → Reset demonstration data** returns everything to the seeded baseline in one click.

- **Real:** the German legal corpus — 27 sources and 70 verbatim passages, each with its official publisher URL and retrieval date — and the retrieval, citation, conflict-surfacing, refusal and role-gating machinery around it.
- **Fictional:** the firm, its staff, its clients, their requests, and 5 uploaded firm documents. All are labelled as fictional in the interface, not only here.
- **Mocked:** telephony, email ingestion and DATEV connectivity. Each is labelled as mocked at the point where it appears in the interface. Nothing is ever sent to anyone; "send" is a state transition in a database.

The repository and the preview domain keep the working name `fachwerk-geist`. The product is TaxHub.

Built with Claude Code driving Lovable: TanStack Start, React, Tailwind, Lovable Cloud Postgres.

---

## Who it is for

Small and mid-sized German tax practices. The profession counts 89,549 Steuerberater across 53,932 practices, 67.1% of them single-principal (BStBK Berufsstatistik, reference date 1 January 2026). Those firms are short-staffed in a way the wider economy is not: 59.1% of Einzelkanzleien had positions unfilled across a two-year window (BStBK special analysis of STAX 2024). The work that gets crowded out first is the small inbound client question — the Mandanten-Rückfrage — which is also the work most likely to become a liability if it is answered from memory.

The shape of the product is set by law rather than by taste. § 5 Abs. 1 in conjunction with § 2 StBerG prohibits the commercial operation of client-facing tax advice by anyone not authorised under the StBerG; the BStBK KI-FAQ (Stand 27 January 2026) treats AI as a Hilfsmittel with a human in the loop. Whether an autonomous "AI Steuerberater" crosses that line is before a court and unresolved (LG Berlin II, 61 O 90/26, filed February 2026, pending, no judgment). The approval gate here is therefore not a safety flourish attached to a chatbot. It is the product.

## The one workflow it implements, end to end

A client request arrives → the system classifies it → guided intake names exactly which documents and facts are missing → the firm's grounded knowledge base is consulted → a case summary with passage-level citations is produced → a first draft reply is written → a licensed professional must approve before anything leaves the firm → every step is logged.

**The flagship case.** A client asks how an employee's private use of an electric company car is treated on the payslip. The gross list price of EUR 58,900 was stated verbally and is evidenced by no document. The system records it as **recorded but not evidenced** — a third state, distinct from "missing" and from "provided" — and that state travels with the case into the draft, where it blocks the outgoing reply until the figure is documented. The signed-in user is a Steuerfachangestellte who may prepare but not approve; the draft names the colleague who may. Citations point to § 6 Abs. 1 Nr. 4 Satz 2 Nr. 3 EStG, § 8 Abs. 2 Satz 4 EStG and the BMF-Schreiben of 5 November 2021.

**The conflict is real, not scripted.** That 2021 BMF letter, still in force, prints a worked example naming a EUR 60,000 gross-list-price ceiling. The statute sets EUR 100,000 for vehicles acquired after 30 June 2025 (§ 6 Abs. 1 Nr. 4 Satz 2 Nr. 3 EStG). Both are in force. The product shows both, side by side, instead of quietly choosing one. It was found in the corpus during ingestion; it was not planted.

## Try it in sixty seconds

Open the live link. On a first visit a welcome modal introduces the loop and offers **Show me a complete case**, which narrates and auto-navigates the company-car case end to end. That is the sixty-second version. Dismissal of the modal is remembered in your browser, so if you have been here before, the same tour is at `/tour`.

Walked by hand, the same path takes about five minutes:

1. `/` — Overview. Everything on it is derived from case state rather than from stored summary text.
2. `/inbox` — open the company-car request. Classification, responsible person and stage are on one screen.
3. `/intake/$id` — record the gross list price. It stays *recorded but not evidenced*, with the value stored. Hard-refresh the browser; the count and the case summary still reflect what you did.
4. `/knowledge` — ask in English, for example *"How do we handle an electric company car that is also used privately?"* German statute passages come back. Open the retrieval trace to see which German terms were added to your query, and by which stage.
5. The conflict — ask about the electric-vehicle gross-list-price ceiling. Two in-force sources disagree on screen, and the disagreement is shown rather than resolved.
6. `/sources/$id` — follow any citation through to the live official page on gesetze-im-internet.de or the Lohnsteuer-Handbuch.
7. `/drafts/$id` — the unevidenced figure is restated immediately above the decision. Approve is refused for this role on the server, not only in the screen, and the handoff names a person.
8. `/settings` — switch role (the switcher carries a demonstration label) and watch the gate hold from the other side. `/activity` — every step you just took is in the log with real timestamps.

Two honest notes on that walk. The knowledge box makes a live model call, so wording varies between runs; what does not vary is which passages are cited, because the server decides that. And you are welcome to ask something the corpus does not cover — the design intent is a named refusal rather than an invented answer — but refusal is a scored threshold, so a question that brushes the edges of the corpus may return weak passages at low confidence instead of a clean refusal. That is the threshold behaving as configured, not a hidden fallback writing an answer.

Routes: `/` · `/inbox` · `/inbox/$id` · `/intake/$id` · `/knowledge` · `/sources` · `/sources/$id` · `/drafts` · `/drafts/$id` · `/activity` · `/settings` · `/tour`

## What is real and what is demo

This distinction is the product's thesis, so it is stated at the top of this file and again in full here.

**Real.**
- The legal corpus: 27 German legal sources, 70 verbatim passages, each with its official publisher URL and the date it was retrieved. Filing deadlines and Verspätungszuschlag from the AO; the BMF letters on E-Rechnung; UStG Kleinunternehmer after the 2025 reform; VAT rates; Ist-Versteuerung; the StBVV fee tables; GoBD; Aufbewahrungsfristen including the change from ten years to eight; and the company-car set — § 6 Abs. 1 Nr. 4 EStG, § 8 Abs. 2 EStG, LStR R 8.1 Abs. 9, the BMF letter of 5 November 2021 and the 2025 letter on charging electricity.
- Retrieval, citation resolution, conflict surfacing, refusal behaviour, derived counters, and server-side enforcement of who may approve.
- The supersession conflict described above.

**Demo.**
- The firm, its staff, its clients, the inbound requests, and 5 uploaded firm documents are fictional, and are labelled as fictional in the interface.
- Telephony, email ingestion and practice-system connectivity (DATEV among them) are mocked and labelled as mocked in the interface. Nothing connects to a real practice system, and no call or mail is ever placed or sent.
- Sign-in only opens the shared workspace; it is not per-user identity. Inside, the role switcher is a demonstration control for showing the approval gate from both sides — it carries a demonstration label and has no password or credential field behind it.

## Architecture

```
 routes (TanStack Start, SSR)
   /inbox  /intake  /knowledge  /sources  /drafts  /activity  /settings  /tour
        |                        |                          |
   TanStack Query  ------  server functions  ------  Postgres (Lovable Cloud, RLS)
                                 |                    workspaces · users · clients
                                 |                    requests · intake_fields
                                 |                    sources · source_passages
                                 |                    answer_blocks · answer_citations
                                 |                    drafts · draft_sections
                                 |                    activity_events · conversations
                                 |
                    server functions (keys never in the frontend)
                       askKnowledge  ·  ai-gateway adapter  ·  writes
                                 |
      retrieve  →  German FTS + trigram + citation-anchor  →  fuse  →  filter  →  budget
                                 |
                        model returns tagged sentences
                                 |
      server validates labels → quantity guard → assembles answer → citations, confidence
                                 |
                 draft  →  ROLE-GATED APPROVAL (server-enforced)  →  log
```

In prose: the browser holds no state of its own. Counters, statuses and case summaries are derived from the database, which is why recording an intake item changes the case and survives a hard refresh. Citations are real foreign keys, so a citation that cannot resolve fails loudly and visibly rather than rendering as nothing. Model access lives in server functions, so no key reaches the frontend. The approval decision is enforced in the server function, not in the button.

Stack: TanStack Start with React and Tailwind, shadcn primitives, Lovable Cloud Postgres with row-level security and server-side functions, TanStack Query as the data rail.

## How the grounding is enforced

**The model never writes the text you read.** That is a structural property of the answer path, not an instruction in a prompt.

Retrieval runs three arms, each covering a named failure mode of the others: PostgreSQL full-text search with the `german` configuration (stemming, umlaut and ß folding); a trigram arm for German compound nouns that full-text search treats as single lexemes (`Kleinunternehmerregelung` does not match `Kleinunternehmer` under stemming); and a normalised citation-anchor arm for tokens such as `§`, `Abs.` and `Nr.` that neither of the other two handles. The three ranked lists are fused by reciprocal rank fusion. Sources marked outdated or superseded are excluded algorithmically, and visibility is checked against the session role before anything reaches a model. The rejected passages come back **with their rejection reasons**, so a filter that removes something can be inspected rather than assumed.

Because the interface is English and the corpus is German, an English question first passes a bilingual resolution stage. A deterministic glossary of 42 entries — every one built from terminology that actually occurs in a seeded passage, locator or source title — adds German search terms. It concatenates and never substitutes: the system can add retrieval signal, but it cannot rewrite your words into words you did not write.

The model then receives the passages and returns **sentence objects, each tagged with the labels of the passages that support it**. The server:

- checks the shape, and drops any sentence that does not conform;
- maps every label to a real passage id, resolving the source id from the database row rather than from the model — a label that was not supplied is removed, and a sentence left with no valid citation is **dropped**;
- runs a quantity guard: every euro amount, percentage, date and paragraph reference in a surviving sentence must appear in the text or locator of a passage that sentence cites, or the sentence is dropped;
- **assembles the answer string itself** from the surviving sentences — the model's prose reaches the interface by no other path;
- builds the citation list from validated ids only, and computes confidence server-side. The model's own confidence self-report is discarded.

If nothing survives, the result is a refusal rather than a thinner answer. A model that ignores the schema produces a refusal; it cannot produce an uncited assertion.

One consequence of the quantity guard looks like a bug and is not. The corpus contains "1 Prozent" and "zu einem Viertel". It contains no passage reading "0,25 %". A sentence asserting 0.25 percent is therefore dropped, and the answer says *one quarter of the 1 percent monthly rate*. The effective rate is arithmetic performed by a reader, not a rule quoted from a source, and this product does not blur that line. There is no computed-figure escape hatch.

## What is deliberately not built

- **Authentication and multi-tenancy.** A login screen would have consumed build time and proved nothing about the thesis; the approval gate is enforced server-side regardless, which is the part that needed proving. The visible consequence is the shared instance noted at the top of this file.
- **Practice-system integration.** DATEV, Addison, Agenda: mocked and labelled mocked, because a fake integration presented as real would contradict everything else here. Real integration is a commercial and technical conversation, not a weekend.
- **Telephony and email ingestion.** Both are mocked at the interface boundary for the same reason. Nothing leaves the application.
- **Vector retrieval.** Deferred with named unlock conditions: availability of the `vector` extension on this platform is undocumented, the embeddings interface and its output dimensionality are unpublished, and an approximate-nearest-neighbour index over 70 passages is a no-op beside a sub-millisecond sequential scan. It becomes worth building when the corpus outgrows the lexical arms, or when the glossary starts needing entries for terminology the corpus does not contain — the honest signal that the gap has become semantic rather than lexical.
- **A tax calculator.** See the quantity guard above.
- **A German interface.** The interface is English for this audience; the legal strings stay German and verbatim, and the `lang` attribute is set accordingly.
- **Mobile-first layout.** The application is desktop-oriented and says so.

## How it was built

Claude Code drove the build, in stages, with gates between them.

A target architecture was written and approved before any code was touched, grounded in a full read of the existing codebase and in an adversarial end-to-end verification of the prototype that produced a ranked defect list — including the finding that the intake loop the product pitches as load-bearing was, at that point, painted on. That finding is why the first stage exists.

Four build kits followed, in dependency order: **Truth** (one database, no hardcoded state, derived counters, server-gated approval, citations as real foreign keys), **Intelligence** (three-arm retrieval, bilingual resolution, the validation pipeline, file ingestion, multi-turn), **Comprehension** (the guided tour system), **Credibility** (locale-stable dates, announced state changes, keyboard and 200%-zoom usability, the role switcher).

Each kit carried a falsifiable acceptance list written **before** the build ran, with a named denominator that was never rounded up — fourteen criteria for the data-truth layer — and a fresh-context adversarial review between stages whose findings were adjudicated in writing rather than waved through. Design defects caught in review were routed back and recorded, not silently patched. Partial failures returned as delta kits; a whole kit was never re-sent to cover a partial one.

The evidence for that is not this paragraph. It is the commit history in this repository, and [`docs/BUILD-METHOD.md`](docs/BUILD-METHOD.md), which reproduces one kit's acceptance list exactly as it was written before that build ran — including the criteria it failed on the first pass and what the delta fixed.

## Local setup

```bash
bun install
bun dev
```

The application reads its database URL, anon key and edge-function configuration from environment variables supplied by Lovable Cloud; the server functions additionally require an AI gateway key, read per invocation and never cached at module scope. A clone without its own Cloud project will start and render, but it has no corpus and therefore nothing to retrieve. The database schema is under `supabase/`, and the seed is an idempotent function that also backs the "Reset demonstration data" control in Settings.

`.env` is committed deliberately. It holds only the Supabase project id, the project URL and the **publishable** key — the client-side values that ship in the browser bundle regardless. There is no service-role key, no gateway key and no secret in this repository; server-side credentials live in Lovable Cloud secrets and are read per invocation.

For evaluation, the live link is faster and runs the same code.

## Limitations

- **The corpus is 70 passages.** The engine is finished; the library is not. Ask outside the seeded topics and the intended behaviour is an honest refusal, which is correct and also a small library. Coverage is a curation cost, not an architectural one.
- **Refusal is a threshold, not a wall.** It is scored from retrieval quality. A question adjacent to the corpus can surface weak passages at low confidence rather than refusing outright; the thresholds are tuned, and tuning them is ongoing work.
- **The retrieval constants are tuned, not derived.** Weights and thresholds were calibrated once against a pre-stated question battery, and the before-and-after numbers are recorded. They are engineering choices with a named calibration step, not published values.
- **The AI gateway has no public API contract.** It sits behind a single adapter file with a health canary, so a breaking change upstream is a one-file fix and an alarm rather than a silent wrong answer — but it remains an undocumented, unversioned surface.
- **One case is fully wired.** The company-car case is walked end to end through every stage. Other requests in the inbox exercise the same machinery but are not carried to the same depth.
- **A deterministic lane exists** for the scripted flagship case, so a live demonstration cannot fail on a network hiccup. It is visually labelled as the guided example, and is separate by design from the live retrieval lane that answers everything else.
- **One shared workspace behind a single sign-in.** Repeated from the top because it is the first thing a visitor meets: everyone shares the same credentials and the same data, and Settings resets it.
- **Nothing here is tax advice**, and nothing here decides anything. A person does.
