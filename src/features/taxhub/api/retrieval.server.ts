import type {
  AnswerBlock,
  Citation,
  Confidence,
  ExpandedTerm,
  KnowledgeResult,
  QueryExpansion,
  RetrievedPassage,
} from "../types";
import {
  callStructured,
  GatewayError,
  gatewayFailureMessage,
  KNOWLEDGE_MODEL_ID,
} from "./ai-gateway.server";
import { admin } from "./writes.server";

/* ------------------------------------------------------------------ *
 * Tier 0 — language detection
 * ------------------------------------------------------------------ */

const GERMAN_MARKERS = [
  "wie","wird","werden","die","der","das","dem","den","des","ein","eine","einer","eines","einen",
  "und","von","für","fuer","ist","sind","bei","nicht","muss","müssen","wann","was","warum","welche",
  "welcher","kann","darf","gilt","auf","mit","zum","zur","im","nach","über","ueber","privat","private",
];

export function detectLanguage(query: string): "en" | "de" {
  const q = query.toLowerCase();
  if (/[äöüß]/.test(q)) return "de";
  const words = q.split(/[^a-zäöüß]+/).filter(Boolean);
  const hits = words.filter((w) => GERMAN_MARKERS.includes(w)).length;
  return hits >= 2 ? "de" : "en";
}

/* ------------------------------------------------------------------ *
 * Tier 1 — deterministic glossary expansion, zero model calls
 * ------------------------------------------------------------------ */

type GlossaryRow = { id: string; term_en: string; term_de: string[] };

/** "electric vehicle / EV" -> ["electric vehicle", "ev"] */
function englishVariants(termEn: string): string[] {
  return termEn
    .split("/")
    .map((part) => part.replace(/\(.*?\)/g, "").trim().toLowerCase())
    .filter((part) => part.length > 1);
}

function tier1(query: string, glossary: GlossaryRow[]): ExpandedTerm[] {
  const q = ` ${query.toLowerCase().replace(/[^a-z0-9äöüß]+/g, " ")} `;
  const out: ExpandedTerm[] = [];
  for (const row of glossary) {
    const matched = englishVariants(row.term_en).find((variant) => q.includes(` ${variant} `));
    if (matched) out.push({ termEn: row.term_en, termsDe: row.term_de, tier: 1 });
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * Tier 2 — one model call, search terms only, cached
 * ------------------------------------------------------------------ */

const TIER2_SYSTEM = [
  "You produce German legal-terminology SEARCH TERMS for a document retrieval system.",
  "You are FORBIDDEN to answer the user's question.",
  "You are FORBIDDEN to state, summarise or imply any rule of law.",
  "You are FORBIDDEN to invent paragraph numbers, section numbers, dates or document names.",
  "Return only single German words or short German noun phrases that a German tax document would use.",
  "Your output is never shown to a user. Return at most 8 terms.",
].join(" ");

const TIER2_SCHEMA = {
  name: "german_search_terms",
  schema: {
    type: "object",
    properties: { terms: { type: "array", items: { type: "string" } } },
    required: ["terms"],
    additionalProperties: false,
  },
};

function normalise(query: string): string {
  return query.toLowerCase().replace(/\s+/g, " ").trim();
}

async function tier2(query: string): Promise<{ terms: string[]; fromCache: boolean }> {
  const db = await admin();
  const key = normalise(query);

  const { data: cached } = await db
    .from("query_expansion_cache")
    .select("terms")
    .eq("normalized_query", key)
    .maybeSingle();
  if (cached) return { terms: cached.terms, fromCache: true };

  const result = await callStructured<{ terms: string[] }>({
    model: KNOWLEDGE_MODEL_ID,
    system: TIER2_SYSTEM,
    user: `Question (do not answer it): ${query}`,
    schema: TIER2_SCHEMA,
  });
  const terms = (result.terms ?? []).map((t) => t.trim()).filter(Boolean).slice(0, 8);

  await db
    .from("query_expansion_cache")
    .upsert({ normalized_query: key, terms, model_id: KNOWLEDGE_MODEL_ID });
  return { terms, fromCache: false };
}

/* ------------------------------------------------------------------ *
 * Query construction
 * ------------------------------------------------------------------ */

const ANCHOR_TOKEN = /§|abs|nr|satz|bmf|estg|ustg|ao|lstr|gobd|[0-9]{4}/i;

/**
 * websearch_to_tsquery ANDs bare words, which is far too strict across a
 * 70-passage corpus. Terms are OR-ed explicitly and phrases are quoted.
 */
function buildSearchQuery(original: string, germanTerms: string[]): string {
  const parts = new Set<string>();
  for (const term of germanTerms) {
    parts.add(term.includes(" ") ? `"${term}"` : term);
  }
  for (const token of original.split(/[\s,;]+/)) {
    const clean = token.replace(/[?!.]+$/, "");
    if (clean.length > 1 && ANCHOR_TOKEN.test(clean)) parts.add(clean);
  }
  return [...parts].join(" or ");
}

async function expand(query: string): Promise<QueryExpansion> {
  const detectedLanguage = detectLanguage(query);

  if (detectedLanguage === "de") {
    const germanTokens = query
      .split(/[\s,;?.!]+/)
      .filter((w) => w.length > 3)
      .map((w) => w.replace(/[?.!,]/g, ""));
    return {
      detectedLanguage,
      originalQuery: query,
      searchQuery: buildSearchQuery(query, germanTokens),
      terms: [],
      tier2Used: false,
      tier2FromCache: false,
      note: "The question is already German, so no translation was needed. It was searched against the corpus as written.",
    };
  }

  const db = await admin();
  const { data } = await db.from("retrieval_glossary").select("id, term_en, term_de");
  const glossary = (data ?? []) as GlossaryRow[];
  const terms = tier1(query, glossary);
  let germanTerms = terms.flatMap((t) => t.termsDe);
  let tier2Used = false;
  let tier2FromCache = false;
  let note = `Tier 1: ${terms.length} glossary ${terms.length === 1 ? "entry" : "entries"} matched, giving ${germanTerms.length} German search ${germanTerms.length === 1 ? "term" : "terms"}. No model call was needed.`;

  if (germanTerms.length < 2) {
    try {
      const suggested = await tier2(query);
      tier2Used = true;
      tier2FromCache = suggested.fromCache;
      if (suggested.terms.length) {
        terms.push({ termEn: query, termsDe: suggested.terms, tier: 2 });
        germanTerms = [...germanTerms, ...suggested.terms];
      }
      note = `Tier 1 found ${germanTerms.length - suggested.terms.length} German term(s) — fewer than two — so Tier 2 asked the model for German terminology only${suggested.fromCache ? " (served from cache)" : ""}. The model was forbidden to answer the question and its output was used only as search input.`;
    } catch {
      note = "Tier 1 found fewer than two German terms and the Tier 2 terminology call was unavailable, so the question was searched with what the glossary gave.";
    }
  }

  return {
    detectedLanguage,
    originalQuery: query,
    searchQuery: buildSearchQuery(query, germanTerms),
    terms,
    tier2Used,
    tier2FromCache,
    note,
  };
}

/* ------------------------------------------------------------------ *
 * Retrieval
 * ------------------------------------------------------------------ */

type SearchRow = {
  source_id: string;
  passage_id: string;
  locator: string;
  text: string;
  source_title: string;
  url: string | null;
  fts_rank: number;
  trgm_rank: number;
  anchor_rank: number;
  fused_score: number;
  used: boolean;
  exclusion_reason: string | null;
};

async function search(
  searchQuery: string,
  callerVisibility: string,
  maxResults: number,
): Promise<RetrievedPassage[]> {
  const db = await admin();
  const { data, error } = await db.rpc("search_passages", {
    query_text: searchQuery,
    caller_visibility: callerVisibility,
    max_results: maxResults,
  });
  if (error) throw new Error(error.message);

  let kept = 0;
  return ((data ?? []) as SearchRow[]).map((row) => ({
    sourceId: row.source_id,
    passageId: row.passage_id,
    locator: row.locator,
    text: row.text,
    sourceTitle: row.source_title,
    url: row.url ?? undefined,
    ranks: { fts: row.fts_rank, trgm: row.trgm_rank, anchor: row.anchor_rank },
    score: Number(row.fused_score),
    used: row.used,
    exclusionReason: row.exclusion_reason ?? undefined,
    label: row.used ? `P${++kept}` : undefined,
  }));
}

/* ------------------------------------------------------------------ *
 * Conflict and supersession, read from the data not from the model
 * ------------------------------------------------------------------ */

const RELATION_WORDS: Record<string, string> = {
  conflicts_with: "states a different value from",
  superseded_by: "is superseded by",
  supersedes: "supersedes",
  modified_by: "is modified by",
  transitional_rule: "is subject to a transitional rule in",
  depends_on: "depends on",
};

async function findConflicts(used: RetrievedPassage[]) {
  if (used.length < 2) return undefined;
  const db = await admin();
  const ids = [...new Set(used.map((p) => p.sourceId))];
  if (ids.length < 2) return undefined;

  const { data } = await db
    .from("source_supersessions")
    .select("source_id, superseded_by_id, relation, scope, effective_note")
    .in("source_id", ids)
    .in("superseded_by_id", ids);
  const edges = data ?? [];
  if (!edges.length) return undefined;

  const { data: sourceRows } = await db
    .from("sources")
    .select("id, short_title, effective_from")
    .in("id", ids);
  const meta = new Map((sourceRows ?? []).map((s) => [s.id, s]));

  const edge = edges[0];
  const a = meta.get(edge.source_id);
  const b = meta.get(edge.superseded_by_id!);
  if (!a || !b) return undefined;

  // Which one governs is decided by the stated in-force dates, never guessed.
  const governing =
    a.effective_from && b.effective_from
      ? new Date(a.effective_from) > new Date(b.effective_from)
        ? a
        : b
      : null;

  const citations: Citation[] = [edge.source_id, edge.superseded_by_id!].flatMap((sid) => {
    const passage = used.find((p) => p.sourceId === sid);
    return passage
      ? [{ sourceId: sid, passageId: passage.passageId, reason: `${passage.locator} — retrieved for this question.` }]
      : [];
  });

  const relationWord = RELATION_WORDS[edge.relation] ?? "is related to";
  const note = governing
    ? `The library records that ${a.short_title} ${relationWord} ${b.short_title}. Both are real and both were retrieved, so both are shown rather than one being chosen silently. ${governing.short_title} governs, because it is the later of the two stated in-force dates (${governing.effective_from}).${edge.effective_note ? ` ${edge.effective_note}` : ""}${edge.scope ? ` Scope: ${edge.scope}.` : ""}`
    : `The library records that ${a.short_title} ${relationWord} ${b.short_title}. Both are real and both were retrieved. The library does not state which one governs, so neither was chosen for you.`;

  return { note, citations };
}

/* ------------------------------------------------------------------ *
 * The grounded answer
 * ------------------------------------------------------------------ */

const ANSWER_SYSTEM = [
  "You are a retrieval-grounded assistant for a German tax advisory firm.",
  "You are given numbered passages P1..Pn from the firm's own source library.",
  "Answer ONLY from those passages.",
  "Every sentence you return must be traceable to at least one supplied passage, and you must name the passage numbers that support it.",
  "NEVER use outside knowledge of German tax law, even if you are certain it is correct.",
  "NEVER restate a rule the passages do not contain.",
  "NEVER invent a paragraph number, a date, an amount or a document name.",
  "If the passages do not support an answer to the question, return an empty sentence array and set refusal to a short statement that the supplied passages do not cover the question.",
  "Write in English. Quote German wording only where the exact wording matters.",
  "Do not add a greeting, a closing or advice to consult anyone.",
].join(" ");

const ANSWER_SCHEMA = {
  name: "grounded_answer",
  schema: {
    type: "object",
    properties: {
      sentences: {
        type: "array",
        items: {
          type: "object",
          properties: {
            text: { type: "string" },
            passages: { type: "array", items: { type: "string" } },
          },
          required: ["text", "passages"],
          additionalProperties: false,
        },
      },
      confidence_self_report: { type: "string", enum: ["high", "medium", "low", "insufficient"] },
      refusal: { type: "string" },
    },
    required: ["sentences", "confidence_self_report", "refusal"],
    additionalProperties: false,
  },
};

/** Confidence is the server's judgement of retrieval, not the model's word. */
function computeConfidence(
  used: RetrievedPassage[],
  citedPassages: number,
  dropped: number,
): Confidence {
  if (!used.length || !citedPassages) return "insufficient";
  const top = used[0]?.score ?? 0;
  const coverage = citedPassages / Math.min(used.length, 5);
  if (top >= 0.03 && citedPassages >= 2 && coverage >= 0.6 && dropped === 0) return "high";
  if (top >= 0.02 && citedPassages >= 2 && dropped <= 1) return "medium";
  return "low";
}

const SCORE_FLOOR = 0.014;

export async function askKnowledge(
  question: string,
  callerVisibility: string,
): Promise<KnowledgeResult> {
  const expansion = await expand(question);
  const retrieved = await search(expansion.searchQuery, callerVisibility, 8);
  const used = retrieved.filter((p) => p.used);
  const excluded = retrieved.filter((p) => !p.used);

  const searchedDescription = `${expansion.searchQuery} — against ${used.length + excluded.length} matching passage(s) in the firm's library${excluded.length ? `, of which ${excluded.length} were filtered out` : ""}.`;

  const base = {
    lane: "live_retrieval" as const,
    question,
    expansion,
    retrieved,
    modelId: KNOWLEDGE_MODEL_ID,
  };

  if (!used.length || used[0].score < SCORE_FLOOR) {
    return {
      ...base,
      answer: null,
      droppedSentences: 0,
      refusal: {
        reason: used.length
          ? "Passages were found but none matched the question closely enough to answer from. Nothing was assumed and no general knowledge was used."
          : "No passage in this workspace covers that question, so no answer was produced. Nothing was assumed and no general knowledge was used.",
        searched: searchedDescription,
      },
    };
  }

  const numbered = used
    .map((p) => `${p.label}. [${p.sourceTitle} — ${p.locator}]\n${p.text}`)
    .join("\n\n");

  let model: {
    sentences: { text: string; passages: string[] }[];
    confidence_self_report: string;
    refusal: string;
  };
  try {
    model = await callStructured({
      model: KNOWLEDGE_MODEL_ID,
      system: ANSWER_SYSTEM,
      user: `Question: ${question}\n\nPassages:\n\n${numbered}`,
      schema: ANSWER_SCHEMA,
    });
  } catch (error) {
    const failure = error instanceof GatewayError ? error.failure : "unavailable";
    return {
      ...base,
      answer: null,
      droppedSentences: 0,
      refusal: { reason: gatewayFailureMessage(failure), searched: searchedDescription },
    };
  }

  // The server, not the model, decides what the user reads. Any sentence
  // citing a passage that was never supplied is dropped outright.
  const validLabels = new Set(used.map((p) => p.label!));
  const kept: { text: string; labels: string[] }[] = [];
  let dropped = 0;
  for (const sentence of model.sentences ?? []) {
    const labels = (sentence.passages ?? [])
      .map((l) => l.trim().toUpperCase())
      .filter((l) => validLabels.has(l));
    if (!sentence.text?.trim() || !labels.length) {
      dropped += 1;
      continue;
    }
    kept.push({ text: sentence.text.trim(), labels: [...new Set(labels)] });
  }

  if (!kept.length) {
    return {
      ...base,
      answer: null,
      droppedSentences: dropped,
      refusal: {
        reason: dropped
          ? `Every sentence the model produced cited a passage that was not supplied, so all ${dropped} were discarded rather than shown. No answer was assembled.`
          : `The supplied passages do not answer this question. ${model.refusal || ""}`.trim(),
        searched: searchedDescription,
      },
    };
  }

  const answerText = kept.map((s) => s.text).join(" ");
  const byLabel = new Map(used.map((p) => [p.label!, p]));
  const citations: Citation[] = [];
  for (const sentence of kept) {
    for (const label of sentence.labels) {
      const passage = byLabel.get(label)!;
      if (citations.some((c) => c.passageId === passage.passageId)) continue;
      citations.push({
        sourceId: passage.sourceId,
        passageId: passage.passageId,
        reason: `${passage.locator} — supports: “${sentence.text}”`,
      });
    }
  }

  const conflicts = await findConflicts(used);
  const confidence = computeConfidence(used, citations.length, dropped);

  const caveats: string[] = [
    `Assembled by the server from ${citations.length} of ${used.length} retrieved passage(s). No sentence without a passage behind it was kept.`,
  ];
  if (dropped) {
    caveats.push(
      `${dropped} model sentence(s) cited a passage that was not supplied and were discarded before you saw them.`,
    );
  }
  if (excluded.length) {
    caveats.push(
      `${excluded.length} matching passage(s) were filtered out before the answer was written — they are listed under "Why this answer".`,
    );
  }
  if (conflicts) {
    caveats.push("The retrieved sources disagree; both are shown below rather than one being chosen for you.");
  }
  if (confidence === "low") {
    caveats.push("Retrieval scores were weak, so this answer should be checked against the passages before it is used with a client.");
  }
  caveats.push(`Produced with model ${KNOWLEDGE_MODEL_ID}; the model self-reported ${model.confidence_self_report}, which was not used — the confidence shown is computed from retrieval.`);

  const answer: AnswerBlock = {
    id: `ans-live-${Date.now()}`,
    question,
    answer: answerText,
    confidence,
    citations,
    caveats,
    conflicts,
  };

  return { ...base, answer, droppedSentences: dropped };
}
