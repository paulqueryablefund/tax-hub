## Scope

Move `src/features/taxhub/data/*` and the in-memory `store.ts` onto the Lovable Cloud database, keeping `types.ts` as the contract. Lovable Cloud is not enabled on this project yet — that is step 0.

## 1. Tables

All ids stay `text` primary keys with their existing prefixes. All tables in `public`, snake_case, each `CREATE TABLE` followed by `GRANT` (SELECT to `anon` where public reads are needed, full CRUD to `authenticated`, `ALL` to `service_role`), then RLS enable + policies. Demo phase: read-open, write via authenticated only.

```text
workspaces(id, firm_name, short_name, city, headcount, practice_system, is_fictional)
users(id, workspace_id→workspaces, name, initials, role, can_approve)
clients(id, workspace_id, mandant_number, name, legal_form, city,
        contact_name, contact_email, responsible_user_id→users,
        fiscal_year_end, services text[])

sources(id, workspace_id, title, short_title, kind, publisher, url,
        is_public, is_fictional, effective_from date, last_reviewed date,
        health, visibility, note)
source_passages(id, source_id→sources ON DELETE CASCADE, locator, text, position int,
                PRIMARY KEY (id) , UNIQUE (source_id, id))
source_supersessions(source_id→sources, superseded_by_id→sources,
                     PRIMARY KEY (source_id, superseded_by_id),
                     CHECK (source_id <> superseded_by_id))

requests(id, workspace_id, reference, client_id→clients, channel, received_at timestamptz,
         subject, body, category, category_confidence, lifecycle_status,
         assigned_user_id→users, due_date date, narrative_summary,
         escalation_reason, escalation_to_user_id→users, escalation_at)
intake_fields(id, request_id→requests ON DELETE CASCADE, position int, label, help,
              type, options text[], required bool, value text,
              status text CHECK (status IN ('provided','missing','uncertain')))
answers(id, request_id→requests, position, question, answer, confidence,
        caveats text[], conflict_note)
drafts(id, request_id→requests, kind, title, recipient, subject,
       is_external bool, confidence, open_questions text[], status, generated_at)
draft_sections(id, draft_id→drafts, position, heading, body)
activity_events(id, at timestamptz default now(), actor, actor_name, action, detail,
                request_id→requests, decision)
activity_event_sources(event_id→activity_events, source_id→sources, PRIMARY KEY(...))

knowledge_questions(...) + knowledge_answers(...)  -- same shape as answers, for /knowledge
```

**Citations as real foreign keys.** One polymorphic-free approach: a separate citation table per host, each with a composite FK into the passage:

```text
citations(id uuid, source_id, passage_id, reason,
          FOREIGN KEY (source_id, passage_id) REFERENCES source_passages(source_id, id))
intake_field_citations(intake_field_id→intake_fields, citation_id→citations)  -- "requiredBy", max 1
answer_citations(answer_id→answers, citation_id, position, is_conflict bool)
draft_section_citations(draft_section_id→draft_sections, citation_id, position)
```

The composite FK `(source_id, passage_id)` is what makes "never resolve a citation silently to nothing" structural: a passage cannot be deleted while cited, and a citation cannot name a passage that belongs to a different source. `is_conflict` on `answer_citations` carries `AnswerBlock.conflicts.citations` without a second table.

**Supersession** is its own edge table, not an array column, so it can be traversed and so a superseding source cannot be a dangling id.

**Intake status** stays an explicit stored enum-checked column, not derived from `value IS NOT NULL`. `uncertain` ("recorded but not evidenced") carries a value yet is not provided — collapsing it into a null check would erase a distinction the product principles require.

## 2. What becomes derived

| Field today | Verdict | Where |
|---|---|---|
| `RequestRecord.summary` | **Split.** The narrative half ("client acquired an electric vehicle…") is authored content and stays stored as `narrative_summary`. The counting half ("Seven intake items required; four are still outstanding") is derived and must be removed from the stored string. | Counters from the view; the sentence is composed in a client selector so wording lives with the UI. |
| intake counters (`total`, `provided`, `missing`, `uncertain`) — recomputed ad hoc in `index.tsx:91`, `inbox.$requestId.tsx:62`, `intake.$requestId.tsx:43-44` | **Derived, single definition.** | SQL view `request_overview` (`count(*) FILTER (WHERE status = …)`), so list pages get counts without shipping every intake row. |
| `RequestRecord.status` | **Partly derived — do not fully derive.** `ready_for_review` and `approved` are functions of intake completeness and draft state; `new`, `intake`, `awaiting_client` and `closed` are human/workflow facts no query can infer (nothing in the schema records that a client was emailed and we are waiting). Store `lifecycle_status`, and expose a derived `derived_readiness` alongside it in the view. | View computes readiness; a server function advances `lifecycle_status` on approval, exactly as `setDraftStatus` does now. |
| dashboard counts (`open`, `review`, sources needing attention) | Derived | Client selectors over the fetched lists — small data, no round trip. |

Rule applied: derive anything a query can prove; store anything only a human knows.

## 3. Read path

`useSyncExternalStore` and `store.ts` are deleted. The existing `QueryClient` in `src/router.tsx` is reused as-is and passed through router context — **no new state library, no Zustand/Redux, no second QueryClient.**

Server functions (`src/features/taxhub/api/*.functions.ts`, client-safe path, `createServerFn`):

| Function | Query key |
|---|---|
| `listRequests` (joins `request_overview`, client, assignee) | `['requests','list']` |
| `getRequest(id)` (intake + citations + answers + draft ref) | `['requests','detail',id]` |
| `listSources` / `getSource(id)` | `['sources','list']` / `['sources','detail',id]` |
| `listDrafts` / `getDraft(id)` | `['drafts','list']` / `['drafts','detail',id]` |
| `listActivity` | `['activity']` |
| `getKnowledge` | `['knowledge']` |
| `getWorkspace` (firm, users, current user) | `['workspace']` |

Mutations replacing the store's writers: `updateIntakeField`, `updateDraftSection`, `setDraftStatus`, `escalateRequest`, `resetDemo`. Each writes the row **and** inserts the `activity_events` row in the same call, then the client invalidates the affected detail key + `['activity']` (+ `['requests','list']` when status or counters move).

Routes changed: `index.tsx`, `inbox.index.tsx`, `inbox.$requestId.tsx`, `intake.$requestId.tsx`, `drafts.index.tsx`, `drafts.$draftId.tsx`, `activity.tsx`, `sources.index.tsx`, `sources.$sourceId.tsx`, `knowledge.tsx`, `settings.tsx` (firm/team from `workspace`), plus `app-shell.tsx` (current user) and `primitives.tsx` (citation resolution moves from module lookup to resolved data). `inbox.tsx`, `drafts.tsx`, `sources.tsx` are `<Outlet />` shells and do not change.

## 4. SSR and hydration

Every route uses the loader/suspense pair, not `useEffect`:

```tsx
loader: ({ context }) => context.queryClient.ensureQueryData(requestsQuery()),
component: () => useSuspenseQuery(requestsQuery())
```

The loader runs on the server, the dehydrated cache hydrates on the client under the identical key, and the first client render reads the same rows — so a hard refresh renders real data and cannot mismatch. Requirements: query keys must be byte-identical between loader and component (shared `queryOptions` factories, no inline objects); no `new Date()`, `Date.now()`, `Math.random()` or locale-dependent formatting during render — `formatDateTime` must be given an explicit fixed timezone/locale or all timestamps must be pre-formatted server-side, otherwise the server (UTC) and a Berlin browser disagree; `relative time` strings, if any, move to `useEffect`. Reads stay public (no `requireSupabaseAuth` in a public loader — prerender has no bearer token); if auth is added later, those routes move under `_authenticated/`.

## 5. Order, with pins between steps

1. Enable Lovable Cloud.
2. One migration: all tables + GRANTs + RLS + policies + views, **and literal INSERT statements for the full seed corpus** (sources, passages, people, requests, intake, answers, drafts, activity). Seeding must be in the migration, not a script or a page-load call. *Pin: `types.ts` is frozen from here — schema and types must agree.*
3. Build the `request_overview` view and confirm its counts equal today's client-side counts for every seeded request. *Pin: no route touched yet; the app still runs on `store.ts`.*
4. Add read server functions + `queryOptions` factories. *Pin: store still in place — diff server output against seed modules field by field before deleting anything.*
5. Convert read-only routes (`sources.*`, `activity`, `knowledge`, `index`) to loader + `useSuspenseQuery`.
6. Convert interactive routes (`intake.$requestId`, `drafts.$draftId`, `inbox.*`) with their mutations.
7. Delete `store.ts` and `data/*.ts` **only after** step 6 verifies. *Pin: keep the seed modules on disk until the last route is converted so a bad read is instantly comparable.*
8. Hydration pass: hard-refresh every route, console clean, timezone forced to Europe/Berlin in the check.
9. Security scan; confirm no `service_role` client reaches a component.

## 6. Risks and things I think are wrong in the framing

- **"Status must become derived" is the riskiest item and I disagree with it as stated.** Four of the six `RequestStatus` values encode human workflow state that no query can reconstruct. Deriving status wholesale would silently collapse `awaiting_client` into `intake` and lose the inbox filter's meaning. Store it; derive only readiness.
- **`summary` is not purely derived either.** The narrative clause is authored prose with legal specificity; regenerating it from counters would be inventing content, which the product principles forbid. Only the counting sentence is safe to compute.
- **Citations are the fragile part.** Today a bad `passageId` resolves to nothing and the UI shows a broken-citation state. Under composite FKs, bad data is rejected at insert time instead — which is better, but the seed INSERTs must be ordered (sources → passages → citations) or the migration fails midway. Keep the broken-citation UI regardless; a passage can still be superseded.
- **`data/requests.ts` seed values are hand-authored and internally inconsistent** — the `r-1042` summary says "four are still outstanding" while the array holds four `missing` plus one `uncertain`. Converting counters to SQL will surface such mismatches as visible text changes; that is a correction, not a regression, but expect the demo copy to shift.
- **Hydration mismatch is most likely to come from date formatting, not data.** `formatDateTime` and the `+02:00` offsets in seed data are the thing to pin, before any query wiring.
- **Timestamps**: `receivedAt` is stored with an explicit `+02:00` offset today. `timestamptz` normalises to UTC; every display must render in Europe/Berlin explicitly or times will appear two hours early.
- **Ordering**: seed arrays carry implicit order that Postgres will not preserve. Every child table needs `position`, and every read must `ORDER BY` it, or intake steps and draft sections will shuffle between loads.
- **`resetDemo`** currently restores module constants instantly. On a database it becomes a destructive server-side re-seed — it needs a confirmation and must not be reachable by an anonymous visitor.
- **Scope**: this touches every route and both shared components. It is a large single migration; steps 5 and 6 are the natural place to stop and verify.
