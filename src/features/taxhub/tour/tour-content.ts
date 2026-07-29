/**
 * K03 guided-tour content pack.
 *
 * Every user-facing string in this file is reproduced verbatim from
 * TOUR-CONTENT.md. It is ship text, not a suggestion: do not re-tone,
 * shorten or "improve" it. Where the pack prints a binding and a
 * structural fallback, both variants are stored here in full so that no
 * sentence is assembled at runtime.
 *
 * No string in this file asserts a number the application computes.
 */

export type AreaId =
  | "overview"
  | "inbox"
  | "request"
  | "intake"
  | "knowledge"
  | "sources"
  | "drafts"
  | "activity"
  | "settings"
  | "tour";

/** Full-tour order (P5, workflow not nav). The hub is not part of it. */
export const WORKFLOW_ORDER: AreaId[] = [
  "overview",
  "inbox",
  "request",
  "intake",
  "knowledge",
  "sources",
  "drafts",
  "activity",
  "settings",
];

export const ALL_AREAS: AreaId[] = [...WORKFLOW_ORDER, "tour"];

export const AREA_NAMES: Record<AreaId, string> = {
  overview: "Overview",
  inbox: "Inbox",
  request: "Request detail",
  intake: "Guided intake",
  knowledge: "Knowledge",
  sources: "Sources",
  drafts: "Drafts",
  activity: "Activity",
  settings: "Settings",
  tour: "Guided tour",
};

/** §1.4 — reused by the hub's area list (§6.5). */
export const AREA_GLOSS: Record<AreaId, string> = {
  overview: `Where you are standing: the state of the firm's open work in one screen, so you can see what needs a person before you open anything.`,
  inbox: `Every incoming Mandanten request, classified and searchable — the entry point of the chain.`,
  request: `One case in full: what was asked, what is known, what is cited, what is still open, and what conflicts.`,
  intake: `The checklist that turns a vague question into a complete file — it names the missing facts and says which source requires each one.`,
  knowledge: `Ask a question of the firm's own sources and get an answer built only from passages it can show you.`,
  sources: `The library those answers come from: statutes, BMF-Schreiben and firm documents, each with a health state and a real link.`,
  drafts: `The reply that has been prepared, the open points attached to it, and the approval decision that gates it.`,
  activity: `The audit trail: who did what, to which case, in what order, on what date.`,
  settings: `Session and role, who may approve what, which integrations are real and which are mocked, and the demonstration-data reset.`,
  tour: `This help system: every area walkthrough, the complete-case replay, and the controls to restart or turn it off.`,
};

/* ------------------------------------------------------------------ *
 * 1 · The welcome modal
 * ------------------------------------------------------------------ */

export const WELCOME = {
  title: `TaxHub — what it is and how it works`,
  explanation: `TaxHub is a working hub for a Steuerkanzlei: it carries a Mandanten-Rückfrage from the moment it arrives to the moment a licensed professional signs off the reply. It does the preparation — classifying the request, naming exactly what is missing, finding the passages in your own sources, writing a first draft — and stops at every point where judgement and liability belong to a person. It is built for the people who prepare the work and for the Steuerberater and Partner who carry responsibility for what leaves the firm.`,
  chainCaption: `Every area in the product sits somewhere on this chain. That is the only map you need.`,
  trust: `Three rules hold everywhere: every legal statement carries a citation to a passage you can open, an uncovered question is answered with "your sources do not cover this" rather than with a guess, and nothing reaches a Mandant without approval from someone whose role permits it.`,
  demoData: `The firm, its staff and its Mandanten in this environment are fictional and labelled as fictional wherever they appear. The legal sources are real: real statutes, real BMF-Schreiben, real passage text, with the publisher's own link.`,
  checkbox: `Don't show this again`,
  checkboxHelp: `You can reopen this from Guided tour at any time. The "?" in any page header always works.`,
  buttons: {
    primary: `Take the tour`,
    secondary: `Show me a complete case`,
    tertiary: `Explore on my own`,
  },
} as const;

/** §1.3 — the workflow loop. */
export const WORKFLOW_CHAIN: { label: string; gloss: string }[] = [
  {
    label: `Arrival`,
    gloss: `A Mandant asks something by email, phone or portal, and it lands in one place with its origin recorded.`,
  },
  {
    label: `Classification`,
    gloss: `The request is sorted by subject, client and urgency so it can be routed rather than merely stored.`,
  },
  {
    label: `Guided intake`,
    gloss: `The system names precisely which documents and facts are missing before anyone starts writing.`,
  },
  {
    label: `Grounded lookup`,
    gloss: `The question is answered from your firm's own sources, passage by passage — or not at all.`,
  },
  {
    label: `Case summary`,
    gloss: `What is known, what is cited and what is still open, in one structured view.`,
  },
  {
    label: `Draft reply`,
    gloss: `A first version written from the cited material, with every open point still visible in it.`,
  },
  {
    label: `Approval and log`,
    gloss: `A licensed professional decides, and every step that led there stays in the audit trail.`,
  },
];

/** §1.9 — returning-user variant. */
export const WELCOME_RETURNING = {
  title: `TaxHub — the short version`,
  explanation: `A Mandanten-Rückfrage comes in, the system prepares it, a licensed professional signs it off. TaxHub does the preparation and stops where liability starts.`,
  trust: `Every legal statement carries a citation you can open. An uncovered question gets a refusal, not a guess. Nothing leaves the firm without an approval by someone whose role permits it.`,
  demoData: `Firm and Mandanten are fictional; the legal sources are real.`,
  close: `Close`,
} as const;

/* ------------------------------------------------------------------ *
 * 2 · Per-area first-visit popups
 * ------------------------------------------------------------------ */

export const POPUP_CHROME = {
  checkbox: (areaName: string) => `Don't show this again for ${areaName}`,
  primary: `Walk me through this area`,
  secondary: `Got it`,
  footer: `The "?" in the page header reopens this any time.`,
} as const;

export interface AreaPopup {
  title: string;
  body: string;
  notice: string;
}

export const AREA_POPUPS: Record<AreaId, AreaPopup> = {
  overview: {
    title: `Overview — the firm's open work`,
    body: `The screen you start on: everything currently in flight, so you can see where a person is needed before opening a case. Nothing starts here — it points you into the case that is blocking.`,
    notice: `every count is derived from live cases, never stored, so it cannot drift out of step.`,
  },
  inbox: {
    title: `Inbox — every request, classified`,
    body: `Every Mandanten-Rückfrage arrives here, whatever channel it came in on, with its origin and its classification recorded. This is where the chain starts, and it feeds the Request detail screen and, through it, the guided intake. Search and status filter are for triage, not for hiding anything.`,
    notice: `the request's channel is recorded, not smoothed away. A question asked on the phone is a different evidential situation from one asked in writing, and the product never lets you forget which one you have.`,
  },
  request: {
    title: `Request detail — one case, in full`,
    body: `This is a single Mandanten-Rückfrage assembled: what was asked, which client it belongs to, what the sources say about it, what is still missing, and what is contradictory. It is fed by the Inbox and the guided intake, and it feeds the draft reply. The summary is derived from the current state of the case — it is not a stored sentence somebody wrote once.`,
    notice: `when two sources disagree about the same point, this screen shows a conflict block with both of them and does not pick a winner. Silently resolving a conflict is how a firm ends up defending a position nobody consciously chose.`,
  },
  intake: {
    title: `Guided intake — what is missing, named exactly`,
    body: `Intake turns "the Mandant asked something" into a file you can actually work from: it lists the specific documents and facts the case needs, and for each one it names which source requires it. It is fed by the classification of the request and it feeds everything downstream — the case summary, the draft, and the caveats attached to the draft. Recording an item here changes the case, not just this page.`,
    notice: `"missing" and "recorded but not evidenced" are two different states here, and they stay different. A figure a Mandant told you on the phone can be recorded so the work continues, while the case keeps saying out loud that nobody can show it to a Prüfer yet.`,
  },
  knowledge: {
    title: `Knowledge — ask the firm's own sources`,
    body: `Ask a question in plain language and get an answer assembled only from passages in this firm's source library, each one linked to the exact place it came from. It reads from Sources and it feeds the citations that appear on cases and in drafts. It answers about the law as your sources state it; it does not advise on a specific case.`,
    notice: `if the sources do not cover your question, the answer is that they do not cover it. A confident paragraph with nothing behind it is worse than no answer, because you cannot check it and you would be the one signing it.`,
  },
  sources: {
    title: `Sources — the library the answers come from`,
    body: `Every statute, BMF-Schreiben and firm document that TaxHub is allowed to answer from, each with a publisher, a real link, an effective date and a health state. Nothing else is used: this list is the outer boundary of what the product will say. It feeds Knowledge, the case summaries and every citation in a draft.`,
    notice: `a source that has been overtaken is marked, not deleted. You need to know what the rule was on the day the advice was given, not only what it is today.`,
  },
  drafts: {
    title: `Drafts — the prepared reply, before anyone signs it`,
    body: `A draft is the first version of the answer to the Mandant, written from the cited material, with every open point from intake still attached to it. It is fed by the case and the knowledge layer, and it feeds exactly one thing: a decision by a person who is permitted to make it. Nothing here has been sent.`,
    notice: `the approval control reflects your role, and it is enforced on the server as well as in the screen. A disabled button is a UI convention; the rule about who may release advice to a Mandant is not.`,
  },
  activity: {
    title: `Activity — the audit trail`,
    body: `Every state change on every case, in order, with who did it, what it touched and when. It is fed by every other area and it feeds nobody: it is the evidence layer, and its value comes from being complete and unedited. This is what you show when someone asks how a piece of advice came to be given.`,
    notice: `this trail records client work only. Reading help, running the tour, and dismissing a popup are deliberately not written here — product telemetry in an audit trail devalues the trail.`,
  },
  settings: {
    title: `Settings — session, rights, integrations, reset`,
    body: `Who you are signed in as, what your role permits, which external systems are actually connected and which are mocked, and the control that returns the demonstration data to its starting state. It governs the other areas rather than sitting on the chain.`,
    notice: `the rights matrix is the same rule the approval gate enforces, written out in words. Mocked integrations are labelled as mocked here and everywhere else — an integration that is not real is never allowed to look real.`,
  },
  tour: {
    title: `Guided tour — the help system itself`,
    body: `Every area walkthrough lives here with its status, alongside the full tour in workflow order and the narrated replay of one complete case from arrival to approval. Nothing you do here changes a case, a draft, a source or the audit trail.`,
    notice: `dismissing a popup only stops it from appearing by itself. The "?" in any page header always reopens that area's walkthrough, and everything here can be restarted.`,
  },
};

/* ------------------------------------------------------------------ *
 * 3 · Per-area step tours
 * ------------------------------------------------------------------ */

export interface TourStep {
  /** `area.element`, kebab-case after the dot. */
  anchor: string;
  title: string;
  /** Structural text, used verbatim whenever the bound variant cannot resolve. */
  body: string;
  /** Variant containing binding tokens. Used only when every token resolves. */
  bound?: string;
  /** Step lives on the area's detail route rather than its list route. */
  at?: "detail";
  /** Plain-language description of the anchor, used by the honest skip note. */
  points: string;
  /** Reason variant appended to the skip note (§5.7). */
  skipReason?: SkipReason;
}

export type SkipReason = "empty" | "absent" | "record" | "role" | "width";

export const SKIP_REASON_TEXT: Record<SkipReason, string> = {
  empty: `…which is not on this screen right now, because this area has no entries yet.`,
  absent: `…which this build does not have yet.`,
  record: `…which only appears on cases that have one.`,
  role: `…which your role does not have access to.`,
  width: `…which is not visible at this window size.`,
};

export const STEP_TOURS: Record<AreaId, TourStep[]> = {
  overview: [
    {
      anchor: `overview.header`,
      title: `Where you are standing`,
      body: `This screen is the state of the firm's open work, not a dashboard of activity for its own sake. Everything on it is a pointer into a case that needs something from a person.`,
      points: `the page header`,
    },
    {
      anchor: `overview.metrics`,
      title: `Counts that cannot lie to you`,
      body: `These figures are derived from the cases themselves every time the page loads — no number here is stored, so none of them can quietly disagree with the case it describes. If a count moves, a case moved.`,
      points: `the row of derived counts`,
    },
    {
      anchor: `overview.attention`,
      title: `What is blocking, and why`,
      body: `This is the part of the chain where work has stopped: a request without a complete intake, a draft waiting on a decision. The product's job is to make the blockage specific rather than to report a general backlog.`,
      points: `the panel of work waiting on a person`,
      skipReason: `empty`,
    },
    {
      anchor: `overview.nav`,
      title: `The chain, in the sidebar`,
      body: `The navigation follows the same loop the welcome screen showed: requests arrive, get prepared, get answered from sources, get drafted, get approved, get logged. When you are lost, work out which link of the chain you are on.`,
      points: `the main navigation`,
    },
  ],
  inbox: [
    {
      anchor: `inbox.header`,
      title: `The entry point`,
      body: `Every Mandanten-Rückfrage lands here regardless of how it arrived. One list, one place, so nothing lives only in somebody's mailbox.`,
      points: `the page header`,
    },
    {
      anchor: `inbox.list`,
      title: `What a row already tells you`,
      body: `Each row carries the client, the subject, the channel it came in on and its stage in the chain. That is enough to triage without opening anything, which is the point of classifying at arrival rather than at the desk.`,
      points: `the request table`,
      skipReason: `empty`,
    },
    {
      anchor: `inbox.channel`,
      title: `The channel is evidence, not decoration`,
      body: `Whether a question arrived by email, by portal or on the telephone changes what you can later prove about it. The product records the channel and keeps it visible for exactly that reason.`,
      points: `the channel recorded on a request row`,
      skipReason: `empty`,
    },
    {
      anchor: `inbox.search`,
      title: `Search is for triage`,
      body: `Search and the status filter narrow what you are looking at; they never change a case's state. Nothing in this product hides a request from you because of a filter you forgot you set — the filter is always shown as active.`,
      points: `the search box`,
    },
    {
      anchor: `inbox.nav-badge`,
      title: `The badge is derived too`,
      body: `The count beside Inbox in the sidebar comes from the same query as this list. There is one source of truth for "how many", so the sidebar and the page cannot disagree.`,
      points: `the count beside Inbox in the sidebar`,
      skipReason: `empty`,
    },
  ],
  request: [
    {
      anchor: `request.header`,
      title: `One case, assembled`,
      body: `Everything known about this Rückfrage in one place: the question, the Mandant, the stage, and the person responsible. Nothing on this screen was typed by hand — it is the current state of the case rendered.`,
      points: `the page header`,
    },
    {
      anchor: `request.summary`,
      title: `The summary is derived, not stored`,
      body: `This paragraph is recomputed from the case's current facts. That matters: a stored summary written on day one keeps saying day-one things after the file has moved on, and people trust it anyway.`,
      points: `the case summary`,
    },
    {
      anchor: `request.open-points`,
      title: `Two kinds of "not settled"`,
      body: `Missing means nobody has provided it. Recorded but not evidenced means someone gave you the figure and no document supports it yet. Both block a reply, but only one of them can be closed by a phone call.`,
      points: `the missing-information panel`,
    },
    {
      anchor: `request.citations`,
      title: `Every claim opens`,
      body: `Each citation chip goes to the exact passage it came from, highlighted in the source. If a citation cannot be resolved, the product says so loudly rather than dropping the chip — an invisible missing citation is the failure mode worth engineering against.`,
      points: `the list of cited passages`,
      skipReason: `record`,
    },
    {
      anchor: `request.conflicts`,
      title: `Conflicts are surfaced, never resolved`,
      body: `Two sources say different things about the same point, and the product shows you both with their dates and scope instead of choosing. Choosing silently is how a firm ends up defending a position nobody decided to take, and the choice is billable professional judgement anyway.`,
      points: `the conflicting-sources block`,
      skipReason: `record`,
    },
    {
      anchor: `request.actions`,
      title: `What you can do from here`,
      body: `From a case you open the intake to close its gaps, or hand it to someone else with a reason attached. Both write to the audit trail, because who moved a file and why is part of the file.`,
      points: `the actions on the case`,
      skipReason: `record`,
    },
  ],
  intake: [
    {
      anchor: `intake.header`,
      title: `The gap list`,
      body: `Intake is the difference between "the Mandant asked about a company car" and a file you can answer from. It enumerates the specific facts and documents this case needs before a reply is defensible.`,
      points: `the page header`,
    },
    {
      anchor: `intake.progress`,
      title: `Progress that reflects the file`,
      bound: `{{outstandingCount}} items are still open on this case, and this number is derived from the fields themselves. Recording an item here updates the case, the summary and the draft's caveats — not just this screen.`,
      body: `The counter is derived from the fields themselves, so it moves only when the file actually moves. Recording an item here updates the case, the summary and the draft's caveats — not just this screen.`,
      points: `the intake counter`,
      skipReason: `empty`,
    },
    {
      anchor: `intake.field`,
      title: `One fact, one line`,
      body: `Each row is a single fact or document with its own state. Granularity is the point: "the file is incomplete" cannot be acted on, "we do not have the Bruttolistenpreis in writing" can.`,
      points: `a single intake item`,
      skipReason: `empty`,
    },
    {
      anchor: `intake.help`,
      title: `Why this item is required`,
      body: `Each item names the source that makes it necessary, and the link goes to that passage. Nothing is on this list because the product thinks it would be nice to have.`,
      points: `the note explaining why an item is required`,
      skipReason: `empty`,
    },
    {
      anchor: `intake.evidence`,
      title: `Recorded is not the same as evidenced`,
      body: `When you record a value you say whether it is documented or was stated verbally. A verbal figure is stored so the work can continue and the item stays flagged, because that is the honest description of what you have.`,
      points: `the evidenced-or-verbal control`,
      skipReason: `absent`,
    },
    {
      anchor: `intake.uncertain`,
      title: `Why the flag survives`,
      body: `An item recorded verbally keeps its uncertain state through the case summary, into the draft's open points, and into the audit trail. Re-recording it does not quietly promote it — in a Betriebsprüfung the question is not what you were told, it is what you can show.`,
      points: `an item in the recorded-but-not-evidenced state`,
      skipReason: `record`,
    },
  ],
  knowledge: [
    {
      anchor: `knowledge.header`,
      title: `Asking your own library`,
      body: `This box answers from the firm's sources and from nothing else. It is not a general assistant with your documents attached; the sources are the whole of what it knows.`,
      points: `the page header`,
    },
    {
      anchor: `knowledge.query`,
      title: `Ask in your own words`,
      body: `Write the question the way you would ask a colleague. German legal terms are understood as German legal terms — Bruttolistenpreis is not translated into something approximate before the search runs.`,
      points: `the question box`,
    },
    {
      anchor: `knowledge.answer`,
      title: `Sentence by sentence, attributable`,
      body: `The answer is assembled from statements that each have a passage behind them. A sentence that cannot be attributed to a supplied passage does not survive into the answer at all.`,
      points: `an assembled answer`,
      skipReason: `empty`,
    },
    {
      anchor: `knowledge.confidence`,
      title: `The badge is meant to be believable`,
      body: `Confidence is computed from the evidence actually found, and it is capped whenever a cited source is under review or in conflict. A badge that says "high" every time teaches you to ignore it, which is worse than having no badge.`,
      points: `the confidence badge on an answer`,
      skipReason: `empty`,
    },
    {
      anchor: `knowledge.citations`,
      title: `Check it in one click`,
      body: `Every citation opens the source at the highlighted passage, with the publisher's own URL. The product is designed on the assumption that you will check — reading the passage should be faster than deciding whether to trust the summary.`,
      points: `the citations under an answer`,
      skipReason: `empty`,
    },
    {
      anchor: `knowledge.refusal`,
      title: `"Your sources do not cover this" is an answer`,
      body: `When the library has nothing on a question, that is what you are told, along with what was searched. This is the single most important behaviour in the product: an answer you cannot verify is a liability you have taken on without noticing.`,
      points: `the refusal block`,
      skipReason: `empty`,
    },
  ],
  sources: [
    {
      anchor: `sources.header`,
      title: `The boundary of what the product will say`,
      body: `This library is the outer limit of TaxHub's knowledge. Anything not in here cannot appear in an answer, a summary or a draft, however well known it is.`,
      points: `the page header`,
    },
    {
      anchor: `sources.list`,
      title: `Each source carries its own provenance`,
      bound: `{{sourceCount}} sources and {{passageCount}} citable passages, each with publisher, effective date and link. Provenance is stored with the source rather than reconstructed later, which is why a citation can be checked years after the advice was given.`,
      body: `Every source carries its publisher, its effective date and a link you can open. Provenance is stored with the source rather than reconstructed later, which is why a citation can be checked years after the advice was given.`,
      points: `the source table`,
      skipReason: `empty`,
    },
    {
      anchor: `sources.health`,
      title: `Health is an honest state, not a score`,
      body: `Current, review due, conflicting and outdated mean different things. Only outdated is withheld from answers; a source under review stays usable and caps the confidence of anything built on it, because "we have not re-checked this recently" is information you deserve rather than grounds for silence.`,
      points: `a source health badge`,
      skipReason: `empty`,
    },
    {
      anchor: `sources.fictional`,
      title: `Fictional material is labelled where it appears`,
      body: `Firm-internal demonstration documents are marked as fictional in the list, on the source itself and in any citation that uses them. Real statute and real BMF material is never mixed into that label, in either direction.`,
      points: `a demonstration-material label`,
      skipReason: `empty`,
    },
    {
      anchor: `sources.passages`,
      at: `detail`,
      title: `The passage is the unit`,
      body: `Citations point at a passage, not a document. Sending someone to a 40-page BMF-Schreiben is not a citation; sending them to the Randnummer is.`,
      points: `the indexed passages of a source`,
      skipReason: `empty`,
    },
    {
      anchor: `sources.supersession`,
      at: `detail`,
      title: `Superseded, and still visible`,
      body: `When a newer rule overtakes part of an older document, the older one is marked with what changed, from when, and by which source — and it stays readable. Advice given last year was given under last year's rule, and you may have to explain it under that rule.`,
      points: `the stated relationships between documents`,
      skipReason: `record`,
    },
  ],
  drafts: [
    {
      anchor: `drafts.header`,
      title: `Prepared, not sent`,
      body: `A draft is the firm's answer written up from the cited material. Nothing on this screen has left the building, and nothing can leave without a decision recorded against a named person.`,
      points: `the page header`,
    },
    {
      anchor: `drafts.list`,
      title: `The queue that needs a professional`,
      body: `Drafts sit here waiting on judgement rather than on typing. The work of assembling the answer is done; what remains is the part that is licensed.`,
      points: `the list of prepared drafts`,
      skipReason: `empty`,
    },
    {
      anchor: `drafts.review-sections`,
      at: `detail`,
      title: `Written from citations, not from memory`,
      body: `Each part of the reply traces back to the passages the case was answered from. The draft is a rearrangement of evidence, which is why it can be checked rather than merely proofread.`,
      points: `the body of the prepared reply`,
      skipReason: `empty`,
    },
    {
      anchor: `drafts.review-open-points`,
      at: `detail`,
      title: `The open points come with the draft`,
      body: `Anything still missing or recorded-but-unevidenced from intake is restated here, immediately above the decision. The system's one job at this moment is to make it hard to approve something while unaware of what is unresolved in it.`,
      points: `the block of open points above the decision`,
      skipReason: `empty`,
    },
    {
      anchor: `drafts.review-decision`,
      at: `detail`,
      title: `The gate is a rule, not a button state`,
      bound: `Approve is unavailable to your role ({{userRole}}), and the server refuses the action as well as the screen. A disabled button is a UI convention that anyone with developer tools can step around; the rule about who may release advice to a Mandant has to hold anyway.`,
      body: `Approve reflects your role, and the server refuses an unauthorised decision as well as the screen does. A disabled button is a UI convention that anyone with developer tools can step around; the rule about who may release advice to a Mandant has to hold anyway.`,
      points: `the decision panel`,
      skipReason: `empty`,
    },
    {
      anchor: `drafts.review-handoff`,
      at: `detail`,
      title: `A block with a name on it`,
      bound: `This draft goes to {{approverName}} for the decision. A gate that only says "not permitted" stops work; a gate that says who to hand it to moves work.`,
      body: `The handoff names the specific person who may decide this case, derived from the case's assignment and their approval right. A gate that only says "not permitted" stops work; a gate that says who to hand it to moves work.`,
      points: `the named handoff`,
      skipReason: `role`,
    },
  ],
  activity: [
    {
      anchor: `activity.header`,
      title: `The evidence layer`,
      body: `This is the record of how the firm's work actually happened, in order. Its value is entirely in being complete and unedited — a trail with gaps proves nothing, so nothing is omitted for tidiness.`,
      points: `the page header`,
    },
    {
      anchor: `activity.timeline`,
      title: `Written by the system, not by hand`,
      body: `Entries are generated when a state changes, with server-side identifiers and timestamps. Nobody types into this screen, and there is no path in the product that changes a case without appearing here.`,
      points: `the timeline`,
      skipReason: `empty`,
    },
    {
      anchor: `activity.event`,
      title: `Who, what, which case, when`,
      body: `Each entry names the actor, the action, the object it touched and the moment. That is the shape of the question you will be asked afterwards, so it is the shape the record is kept in.`,
      points: `a single trail entry`,
      skipReason: `empty`,
    },
    {
      anchor: `activity.timeline`,
      title: `What is deliberately not here`,
      body: `Client work is logged. Reading help, running this tour and dismissing a popup are not, and are stored separately. An audit trail diluted with product analytics stops being usable as evidence, and that trade is not worth making.`,
      points: `the timeline`,
      skipReason: `empty`,
    },
  ],
  settings: [
    {
      anchor: `settings.header`,
      title: `The rules the other screens obey`,
      body: `Settings does not sit on the chain; it governs it. What you see here explains behaviour you have already met elsewhere in the product.`,
      points: `the page header`,
    },
    {
      anchor: `settings.session`,
      title: `Who the product thinks you are`,
      bound: `You are signed in as {{userFirstName}}, {{userRole}}. Role is not a display preference here; it is the thing the approval gate reads.`,
      body: `The session determines what you may do, and every action is checked against it on the server. Role is not a display preference here; it is the thing the approval gate reads.`,
      points: `the session panel`,
      skipReason: `absent`,
    },
    {
      anchor: `settings.rights`,
      title: `The gate, written out in words`,
      body: `This matrix is the same rule the Approve control enforces, stated plainly. Publishing the rule matters: a restriction people cannot read is experienced as an arbitrary blockage, and gets worked around.`,
      points: `the approval-rights matrix`,
    },
    {
      anchor: `settings.integrations`,
      title: `Mocked is labelled as mocked`,
      body: `Integrations that are not really connected say so, here and wherever they appear. A demonstration that lets a mocked connection look live is training you to trust something that does not exist.`,
      points: `the integrations panel`,
    },
    {
      anchor: `settings.reset`,
      title: `Putting the demonstration back`,
      body: `This returns the fictional firm's cases, intake states and drafts to their starting point, and records that it happened. It touches demonstration data only — the source library and this tour's own state are not part of it.`,
      points: `the demonstration reset control`,
    },
    {
      anchor: `settings.tour-controls`,
      title: `Turning the help off completely`,
      body: `This stops every popup and every automatic tour, everywhere. The "?" in each page header keeps working, because switching off automatic help should never mean losing access to help.`,
      points: `the guided-help switch`,
      skipReason: `absent`,
    },
  ],
  tour: [
    {
      anchor: `tour.header`,
      title: `Help you can navigate deliberately`,
      body: `Everything the product can explain about itself is listed here, so you are never dependent on a popup appearing at the right moment. Nothing on this page changes a case.`,
      points: `the page header`,
    },
    {
      anchor: `tour.full-tour`,
      title: `The full tour follows the work`,
      body: `The complete walkthrough runs in the order the work happens — arrival, preparation, sources, draft, approval, record — not in the order the sidebar happens to be arranged.`,
      points: `the full-tour section`,
    },
    {
      anchor: `tour.replay`,
      title: `One case, end to end, narrated`,
      body: `The replay drives itself through a single real case from the moment it arrives to the moment it is blocked at approval. It is the fastest way to understand the product, and it changes nothing while it runs.`,
      points: `the replay section`,
    },
    {
      anchor: `tour.areas`,
      title: `Status per area, restartable`,
      body: `Each area shows whether you have seen it, how far you got, and whether you dismissed it. Dismissing something is a reversible preference here rather than a decision you are stuck with.`,
      points: `the area list`,
    },
    {
      anchor: `tour.reset`,
      title: `Resets that stay in their lane`,
      body: `Resetting tour progress clears what you have seen and dismissed. It does not touch cases, drafts, sources or the audit trail — those have their own reset in Settings, and the two are deliberately not the same control.`,
      points: `the reset controls`,
    },
  ],
};

/** §3.2 empty-state variant for the inbox list step. */
export const INBOX_EMPTY_VARIANT = {
  title: `An empty inbox is a real state`,
  body: `There are no open requests right now. When one arrives it appears here with its client, subject, channel and stage already recorded — classification happens on arrival, not when someone gets round to it.`,
} as const;

/** §3.4 empty/unconfigured variant for an intake with no fields. */
export const INTAKE_EMPTY_VARIANT = {
  title: `Nothing to collect yet`,
  body: `This request has no intake checklist configured. That is an honest empty state, not a failure — the checklist is generated from the case's classification, and this one has not been classified into a template yet.`,
} as const;

/* ------------------------------------------------------------------ *
 * 4 · The narrated case replay
 * ------------------------------------------------------------------ */

export type BeatPlace =
  | "inbox"
  | "request"
  | "intake"
  | "knowledge"
  | "source-passage"
  | "draft"
  | "activity";

export interface ReplayBeat {
  n: number;
  place: BeatPlace;
  anchor: string;
  /** Seconds of auto-advance dwell. */
  dwell: number;
  text: string;
  bound?: string;
  points: string;
  skipReason?: SkipReason;
}

export const REPLAY_BEATS: ReplayBeat[] = [
  {
    n: 1,
    place: `inbox`,
    anchor: `inbox.list`,
    dwell: 16,
    points: `the request row for this case`,
    text: `"Here is the thing that starts the whole problem. A Mandant rings up and asks how the private use of an employee's electric company car shows up on the payslip. One sentence, and somewhere in the firm it has just turned into [firm's own figure] of somebody's afternoon."`,
  },
  {
    n: 2,
    place: `inbox`,
    anchor: `inbox.channel`,
    dwell: 16,
    points: `the channel and classification on the row`,
    text: `"It arrived by telephone, and the system has recorded that, because a question asked on the phone is a different evidential position from one asked in writing. It has also already classified it as a payroll matter — before anyone opened it, not after somebody triaged it."`,
  },
  {
    n: 3,
    place: `request`,
    anchor: `request.header`,
    dwell: 18,
    points: `the assembled case`,
    text: `"This is what the firm normally has to assemble by hand: the question, the Mandant, the responsible person, and the state of the file. Every line of it is derived from the case as it stands right now, so it cannot be one of those summaries that quietly stopped being true three weeks ago."`,
  },
  {
    n: 4,
    place: `intake`,
    anchor: `intake.progress`,
    dwell: 22,
    points: `the intake checklist`,
    text: `"Now the part that actually saves the time. Instead of 'we need more information', the system names the specific facts this case cannot be answered without — and against each one, the source that makes it necessary. Nobody has to remember the list, and nobody has to defend it afterwards."`,
  },
  {
    n: 5,
    place: `intake`,
    anchor: `intake.field`,
    dwell: 20,
    points: `the gross-list-price field`,
    bound: `"The Bruttolistenpreis is {{listPriceValue}}. The Mandant said it on the phone, and it has been written down so the work can carry on."`,
    text: `"The Bruttolistenpreis is on the file. The Mandant said it on the phone, and it has been written down so the work can carry on."`,
  },
  {
    n: 6,
    place: `intake`,
    anchor: `intake.uncertain`,
    dwell: 26,
    points: `the recorded-but-not-evidenced state and its label`,
    skipReason: `record`,
    text: `"And here is the beat I would build the entire product around. The status does not say provided. It says recorded but not evidenced — because a number somebody told you on the telephone is not a number you can put in front of a Prüfer. Every other system I have seen flattens that distinction the moment the value is typed in, and that is precisely the moment the firm quietly takes on a risk nobody has agreed to carry."`,
  },
  {
    n: 7,
    place: `request`,
    anchor: `request.open-points`,
    dwell: 20,
    points: `the open points on the case`,
    text: `"The flag travels with the case. It is on the file, it will be on the draft, and it will be in the record — and re-typing the same figure does not promote it to evidence. The only thing that clears it is a document."`,
  },
  {
    n: 8,
    place: `knowledge`,
    anchor: `knowledge.answer`,
    dwell: 22,
    points: `the assembled answer`,
    skipReason: `empty`,
    text: `"Meanwhile the legal question gets answered — from this firm's own sources, not from the internet and not from a model's recollection. Every sentence in that answer has a passage behind it, and the sentences that could not be attributed never made it into the answer at all."`,
  },
  {
    n: 9,
    place: `source-passage`,
    anchor: `sources.passages`,
    dwell: 22,
    points: `the cited passage in the source`,
    skipReason: `record`,
    text: `"One click, and I am looking at the actual statutory text with the exact passage highlighted, on the publisher's own site. That is the difference between an assistant you supervise and an assistant you have to take on faith — and the second kind is the one that ends up in a Haftungsfall."`,
  },
  {
    n: 10,
    place: `request`,
    anchor: `request.conflicts`,
    dwell: 28,
    points: `the conflicting-sources block`,
    skipReason: `record`,
    text: `"And now the moment that decides whether a firm can actually use this. Two sources in the library say different things about the ceiling on this kind of vehicle. The product does not pick one. It shows both, with their dates and the scope of the disagreement, and it hands the decision to a professional. A system that resolves that silently is not saving you work — it is choosing your legal position for you, without telling you it did, and leaving your name on it."`,
  },
  {
    n: 11,
    place: `draft`,
    anchor: `drafts.review-sections`,
    dwell: 20,
    points: `the body of the prepared reply`,
    skipReason: `record`,
    text: `"The reply is written. Not sent, not queued — written, from the same cited material we just looked at. What normally takes a competent Mitarbeiterin an afternoon of hunting and phrasing is sitting here as a first version, and every part of it can be traced back to a passage."`,
  },
  {
    n: 12,
    place: `draft`,
    anchor: `drafts.review-open-points`,
    dwell: 22,
    points: `the open points above the decision`,
    skipReason: `record`,
    text: `"The unevidenced Bruttolistenpreis is right here, directly above the decision. The one thing the system genuinely must not allow is for a partner to sign something without knowing what is still unresolved inside it — so the open point is not in a tab, and it is not further down the page."`,
  },
  {
    n: 13,
    place: `draft`,
    anchor: `drafts.review-decision`,
    dwell: 30,
    points: `the approval control and the named handoff`,
    skipReason: `record`,
    bound: `"And it stops. The person signed in prepares the work; she does not release it — so Approve is unavailable to her, and it goes to {{approverName}} for the decision." "That refusal is enforced on the server as well as on the screen, because a disabled button is a UI convention and anyone with developer tools can walk around it. And notice it names a person: a gate that only says no stops the work, a gate that says who moves it."`,
    text: `"And it stops. The person signed in prepares the work; she does not release it — so Approve is unavailable to her, and the block names the specific colleague who may decide this case." "That refusal is enforced on the server as well as on the screen, because a disabled button is a UI convention and anyone with developer tools can walk around it. And notice it names a person: a gate that only says no stops the work, a gate that says who moves it."`,
  },
  {
    n: 14,
    place: `activity`,
    anchor: `activity.timeline`,
    dwell: 26,
    points: `the audit trail`,
    skipReason: `empty`,
    text: `"Everything you just watched is here, in order, with who did it and when — the arrival, the intake entries, the unevidenced figure, the conflict, the draft, the handoff. This is the answer to the question that comes eighteen months later, from a Prüfer or from a Mandant's lawyer: how did this advice come to be given. Most firms answer that from memory and an email folder. This one answers it from a record it did not have to remember to keep."`,
  },
];

export const REPLAY_CLOSING = {
  dwell: 10,
  title: `That was one case, end to end.`,
  body: `Arrival, classification, a named gap, a figure that was recorded but never evidenced, cited passages you can open, a conflict surfaced instead of resolved, a draft with its open points attached, an approval that held, and a record of all of it.`,
  note: `Nothing was sent and nothing was changed by this replay.`,
  buttons: {
    again: `Run it again`,
    full: `Take the full tour`,
    back: `Back to Guided tour`,
  },
} as const;

/* ------------------------------------------------------------------ *
 * 5 · Microcopy set
 * ------------------------------------------------------------------ */

export const MICROCOPY = {
  stepCounter: (n: number, total: number) => `Step ${n} of ${total}`,
  fullTourLine: (areaName: string, a: number) => `${areaName} — area ${a} of 9`,
  beatCounter: (n: number, total: number) => `Beat ${n} of ${total}`,
  next: `Next`,
  finish: `Finish`,
  nextArea: `Next area`,
  back: `Back`,
  skipArea: `Skip this area`,
  endTour: `End tour`,
  exitReplay: `Exit replay`,
  close: `Close`,
  keyboardHint: `Esc to leave · ← → to move`,
  keepWorking: `You can keep working while this is open. Esc closes it.`,
  helpTooltip: `Explain this area`,
  navLabel: `Guided tour`,
  pause: `Pause`,
  resume: `Resume`,
  resumeBanner: {
    title: `You stopped partway through this area.`,
    resume: `Resume where you left off`,
    startOver: `Start over`,
    notNow: `Not now`,
  },
  fullResume: {
    line: (areaName: string, n: number, total: number) =>
      `The full tour is partway through — ${areaName}, step ${n} of ${total}.`,
    resume: `Resume the full tour`,
    startOver: `Start over`,
    clear: `Clear it`,
  },
  areaDone: {
    title: (areaName: string) => `${areaName} — done.`,
    body: (nextAreaName: string) =>
      `That is this area and where it sits in the chain. Next along the chain is ${nextAreaName}.`,
    go: (nextAreaName: string) => `Go to ${nextAreaName}`,
    hub: `Back to Guided tour`,
  },
  fullDone: {
    title: `You have seen every area.`,
    body: `All nine areas of the chain, from arrival to the audit trail. The "?" in any page header reopens an area whenever you want it, and Guided tour has all of them listed.`,
    replay: `Show me a complete case`,
    hub: `Back to Guided tour`,
  },
  allComplete: {
    title: `Every area completed.`,
    body: `Nothing here expires — restart any area at any time.`,
  },
  statusLabels: {
    not_started: `Not started`,
    in_progress: `In progress`,
    completed: `Completed`,
    dismissed: `Dismissed`,
  },
  statusSecondary: {
    in_progress: (n: number, total: number) => `Stopped at step ${n} of ${total}`,
    completed: (date: string) => `Finished ${date}`,
    dismissed: `You turned off the automatic popup for this area`,
  },
  rowActions: {
    start: `Start`,
    resume: `Resume`,
    restart: `Restart`,
    showPopup: `Show the popup again`,
  },
  restartArea: `Restart this area`,
  resetAll: `Reset all tour progress`,
  globalToggle: `Show guided help`,
  resetDialog: {
    title: `Reset all tour progress?`,
    body: `This clears which areas you have seen, how far you got, and which popups you dismissed. The welcome screen will appear again on Overview.`,
    body2: `It does not touch any case, draft, source, or audit-trail entry. That is a separate control in Settings.`,
    confirm: `Reset tour progress`,
    cancel: `Cancel`,
  },
  globalOffHelp: `Turns off the welcome screen, the first-visit popups and the automatic tours. The "?" in each page header keeps working.`,
  skipNote: {
    title: (stepTitle: string) => `Step skipped — ${stepTitle}.`,
    body: (points: string, reason: string) =>
      `This step points at ${points}, ${reason} Nothing is broken; there is simply nothing here for it to point at yet.`,
    defaultReason: `which is not on this screen right now.`,
  },
  skippedSummary: (n: number) =>
    `${n} steps in this area were skipped because there was nothing on screen for them to point at. They are listed in Guided tour and will run when the data is there.`,
  mobileNote: `On a narrow screen this area is laid out differently — the navigation moves to the top and wide tables scroll on their own. Steps that point at a wide table are skipped here and will run on a larger screen.`,
  mobileSkipped: (n: number) =>
    `${n} steps were skipped because of the screen width. Open this area on a larger screen to see them.`,
  mobileReplay: `The complete-case replay moves between screens and highlights small details. It works here, but it was designed for a wide screen.`,
} as const;

/* ------------------------------------------------------------------ *
 * 6 · The tour hub page
 * ------------------------------------------------------------------ */

export const HUB = {
  title: `Guided tour`,
  subtitle: `Everything TaxHub can explain about itself, in one place.`,
  intro: `TaxHub follows one loop: a Mandanten-Rückfrage arrives, gets classified, gets a named list of what is missing, gets answered from the firm's own sources, gets drafted, gets approved by someone permitted to approve it, and gets recorded. Each area below is one link in that loop. Nothing on this page changes a case, a draft, a source or the audit trail.`,
  fullTour: {
    title: `Take the whole loop`,
    body: `Nine areas in the order the work actually happens — not the order of the sidebar. Roughly fifteen minutes, and you can stop anywhere and pick it up later.`,
    start: `Start the full tour`,
    resume: `Resume the full tour`,
    at: (areaName: string, n: number, total: number) =>
      `Currently at ${areaName}, step ${n} of ${total}.`,
    notStarted: `Not started.`,
  },
  replay: {
    title: `Show me a complete case`,
    body: `One real case, driven end to end while it explains itself: a Mandant asks how an employee's private use of an electric company car is treated on the payslip. You will see the request arrive and be classified, intake name exactly what is missing, a figure that was recorded but never evidenced, cited passages you can open, a conflict between two sources surfaced rather than resolved, the draft written with the open point attached, the approval gate holding for this role with a named handoff, and the whole sequence in the audit trail.`,
    duration: `About five minutes. It navigates by itself, it changes nothing, and it sends nothing.`,
    start: `Start the replay`,
    manual: `Watch it step by step`,
    lastRun: (date: string) => `Last run ${date}.`,
  },
  areas: {
    title: `Areas`,
    body: `Each area explains what it is for, what lives in it, and what feeds it. Start any of them from here, or use the "?" in that area's page header.`,
    footer: `Order follows the chain, not the sidebar. Request detail and Guided intake open on a specific case; starting them from here opens the demonstration case.`,
  },
  reset: {
    title: `Reset`,
    all: `Reset all tour progress — clears which areas you have seen and which popups you dismissed. Cases, drafts, sources and the audit trail are untouched.`,
    popups: `Show all dismissed popups again — re-enables the first-visit popups you turned off, without clearing your progress.`,
    popupsButton: `Show all dismissed popups again`,
    note: `Looking for the demonstration-data reset? That is in Settings, and it is deliberately a different control.`,
  },
  welcome: {
    title: `The welcome screen`,
    body: `The short explanation of what TaxHub is, the workflow loop, and the map of every area.`,
    button: `Open it again`,
  },
} as const;