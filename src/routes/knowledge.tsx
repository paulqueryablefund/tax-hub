import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Languages, RotateCcw, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CaveatList,
  CitationList,
  ConfidenceBadge,
  EmptyState,
  PageHeader,
  Panel,
  SourceHealthBadge,
} from "@/features/taxhub/components/primitives";
import type { KnowledgeEntry, KnowledgeResult, RetrievedPassage } from "@/features/taxhub/types";
import { useAskKnowledge, useTaxhub, useTaxhubActions } from "@/features/taxhub/use-taxhub";

export const Route = createFileRoute("/knowledge")({
  head: () => ({
    meta: [
      { title: "Knowledge — TaxHub" },
      {
        name: "description",
        content:
          "Ask a question and get an answer built only from the firm's own sources, with the passage behind every statement.",
      },
      { property: "og:title", content: "Knowledge — TaxHub" },
      {
        property: "og:description",
        content: "Answers built only from the firm's own sources, with the passage behind each statement.",
      },
    ],
  }),
  component: Knowledge,
});

type Phase = "idle" | "searching" | "answered" | "nothing";

/** Both lanes are first class. The guided lane is a demonstration path, never a fallback. */
const LANE_LABEL: Record<KnowledgeResult["lane"], string> = {
  guided_example: "Guided example",
  live_retrieval: "Live retrieval over your sources",
};

function LaneBadge({ lane }: { lane: KnowledgeResult["lane"] }) {
  return (
    <span
      data-tour="knowledge.lane"
      className={
        lane === "guided_example"
          ? "rounded-sm bg-ai-surface px-1.5 py-0.5 text-xs font-medium text-ai-uncertain"
          : "rounded-sm bg-source-verified-bg px-1.5 py-0.5 text-xs font-medium text-source-verified"
      }
    >
      {LANE_LABEL[lane]}
    </span>
  );
}

function Knowledge() {
  const { knowledge, currentUser, sourceById } = useTaxhub();
  const { logActivity } = useTaxhubActions();
  const askKnowledge = useAskKnowledge();
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<KnowledgeResult | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [reported, setReported] = useState(false);
  const actor = currentUser;

  /**
   * A suggested chip serves its curated answer straight from the database.
   * It is the demonstration path and must not depend on a live model call.
   */
  function askGuided(entry: KnowledgeEntry) {
    setQuery(entry.prompt);
    setReported(false);
    setFailure(null);
    const retrieved: RetrievedPassage[] = entry.retrieved.map((r, index) => {
      const source = sourceById(r.sourceId);
      const passage = source?.passages.find((p) => p.id === r.passageId);
      return {
        sourceId: r.sourceId,
        passageId: r.passageId,
        locator: passage?.locator ?? r.passageId,
        text: passage?.text ?? "",
        sourceTitle: source?.title ?? r.sourceId,
        url: source?.url,
        ranks: { fts: 0, trgm: 0, anchor: 0 },
        score: 0,
        used: r.used,
        exclusionReason: r.used ? undefined : r.note,
        label: r.used ? `P${index + 1}` : undefined,
      };
    });
    const guided: KnowledgeResult = {
      lane: "guided_example",
      question: entry.prompt,
      retrieved,
      answer: entry.answer.answer ? entry.answer : null,
      refusal: entry.answer.answer
        ? undefined
        : {
            reason: entry.answer.caveats[0] ?? "The library does not cover this question.",
            searched: "Curated example stored in the library — no live search was run.",
          },
      modelId: "curated — no model call",
      droppedSentences: 0,
    };
    setResult(guided);
    setPhase(guided.answer ? "answered" : "nothing");
    logActivity.mutate({
      actor: "user",
      actorName: actor.name,
      action: "Guided example opened",
      detail: `"${entry.prompt}" — curated example served from the library; no live retrieval and no model call.`,
      sourceIds: [...new Set(entry.answer.citations.map((c) => c.sourceId))],
    });
  }

  function ask(q: string) {
    setQuery(q);
    setReported(false);
    setFailure(null);
    setPhase("searching");
    askKnowledge.mutate(
      { question: q, userId: actor.id },
      {
        onSuccess: (res) => {
          setResult(res);
          setPhase(res.answer ? "answered" : "nothing");
          logActivity.mutate({
            actor: "assistant",
            actorName: "TaxHub assistant",
            action: res.answer ? "Knowledge question answered" : "Knowledge question unanswered",
            detail: res.answer
              ? `"${q}" — answered from ${res.answer.citations.length} passage(s) with confidence: ${res.answer.confidence}. Model ${res.modelId}.`
              : `"${q}" — ${res.refusal?.reason ?? "no answer was produced."} Searched: ${res.refusal?.searched ?? res.expansion?.searchQuery ?? q}`,
            sourceIds: res.answer
              ? [...new Set(res.answer.citations.map((c) => c.sourceId))]
              : undefined,
          });
        },
        onError: (error) => {
          setResult(null);
          setPhase("nothing");
          setFailure(error.message);
        },
      },
    );
  }

  const expansion = result?.expansion;
  const excluded = result?.retrieved.filter((p) => !p.used) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        tourId="knowledge.header"
        title="Knowledge"
        description="Ask how this firm does something. The assistant retrieves passages from your library, and the answer is assembled sentence by sentence from those passages only. If nothing covers the question, it says so."
      />

      <Panel tourId="knowledge.query">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim()) ask(query);
          }}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <div className="flex-1">
            <label htmlFor="knowledge-query" className="sr-only">
              Your question
            </label>
            <Input
              id="knowledge-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. How do we handle an electric company car that is also used privately?"
            />
          </div>
          <Button type="submit" disabled={!query.trim() || phase === "searching"}>
            <Search aria-hidden className="size-4" />
            {phase === "searching" ? "Searching sources…" : "Ask"}
          </Button>
        </form>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="type-label self-center">Guided examples</span>
          {knowledge
            .filter((e) => e.suggested)
            .map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => askGuided(e)}
                className="rounded-sm border border-border-default bg-subtle px-2 py-1 text-xs text-text-secondary hover:border-border-strong hover:text-text-primary"
              >
                {e.prompt}
              </button>
            ))}
        </div>
        <p className="mt-2 text-xs text-text-secondary">
          A guided example serves a curated answer stored in the library. Anything you type yourself
          runs live retrieval over your sources.
        </p>
        <p className="mt-3 text-xs text-text-secondary">
          You are asking as {actor.name} ({actor.role}). Passages above your visibility tier are not
          retrieved.
        </p>
      </Panel>

      {phase === "idle" ? (
        <EmptyState
          icon={BookOpen}
          title="No question asked yet"
          description="Questions and answers are recorded in the activity trail so the firm can see what staff needed to look up and where the library was thin."
        />
      ) : null}

      {phase === "searching" ? (
        <Panel title="Searching your sources" description="Reading passages, not guessing.">
          <div role="status" aria-live="polite" className="space-y-2">
            <p className="text-sm text-text-secondary">
              Expanding the question into German terminology, then ranking passages…
            </p>
            <div className="h-3 w-2/3 animate-pulse rounded-sm bg-inset" />
            <div className="h-3 w-1/2 animate-pulse rounded-sm bg-inset" />
            <div className="h-3 w-3/4 animate-pulse rounded-sm bg-inset" />
          </div>
        </Panel>
      ) : null}

      {expansion && phase !== "searching" ? (
        <Panel
          title="How the question was searched"
          description="The corpus is German. This is the translation step, and it is deterministic wherever the glossary covers a term."
        >
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Languages aria-hidden className="size-4 text-text-secondary" />
            <span className="type-label">
              Detected {expansion.detectedLanguage === "de" ? "German" : "English"}
            </span>
            {expansion.tier2Used ? (
              <span className="rounded-sm bg-ai-surface px-1.5 py-0.5 text-xs font-medium text-ai-uncertain">
                Tier 2 model terms{expansion.tier2FromCache ? " (cached)" : ""}
              </span>
            ) : (
              <span className="rounded-sm bg-source-verified-bg px-1.5 py-0.5 text-xs font-medium text-source-verified">
                Glossary only, no model call
              </span>
            )}
          </div>

          {expansion.terms.length ? (
            <ul className="mt-3 space-y-1">
              {expansion.terms.map((term) => (
                <li key={`${term.tier}-${term.termEn}`} className="text-sm">
                  <span className="text-text-secondary">{term.termEn}</span>
                  <span aria-hidden className="px-2 text-text-secondary">
                    →
                  </span>
                  <span className="font-mono text-xs">{term.termsDe.join(" · ")}</span>
                  <span className="ml-2 type-label">Tier {term.tier}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <p className="mt-3 text-xs text-text-secondary">{expansion.note}</p>
          <p className="mt-2 font-mono text-xs break-words">{expansion.searchQuery}</p>
        </Panel>
      ) : null}

      {phase === "nothing" ? (
        <Panel tourId="knowledge.refusal" title="No answer">
          {result ? (
            <p className="mb-2">
              <LaneBadge lane={result.lane} />
            </p>
          ) : null}
          <p className="text-sm">
            {failure ??
              result?.refusal?.reason ??
              "Nothing in this workspace covers that question, so I will not answer it."}
          </p>
          {result?.refusal ? (
            <p className="mt-2 text-xs text-text-secondary">
              Searched: <span className="font-mono">{result.refusal.searched}</span>
            </p>
          ) : null}
          <p className="mt-2 text-sm text-text-secondary">
            Rephrase the question, or add the relevant document to the source library first. The
            unanswered question has been logged so the firm can see which sources are missing.
          </p>
        </Panel>
      ) : null}

      {phase === "answered" && result?.answer ? (
        <div className="space-y-4">
          <Panel
            tourId="knowledge.answer"
            title="Answer"
            description="Assembled on the server from the passages listed below. Any sentence without a passage behind it was discarded before you saw this."
          >
            <span data-tour="knowledge.confidence" className="inline-block">
              <ConfidenceBadge confidence={result.answer.confidence} withExplanation />
            </span>
            <span className="ml-2 inline-block align-middle">
              <LaneBadge lane={result.lane} />
            </span>
            <p className="mt-3 text-sm leading-relaxed">{result.answer.answer}</p>

            {result.answer.caveats.length ? (
              <div className="mt-4">
                <CaveatList caveats={result.answer.caveats} />
              </div>
            ) : null}

            {result.answer.conflicts ? (
              <div className="mt-4 rounded-sm border border-source-conflict/30 bg-source-conflict-bg px-3 py-2">
                <p className="type-label mb-1 text-source-conflict">Conflicting sources</p>
                <p className="text-sm">{result.answer.conflicts.note}</p>
                <div className="mt-2">
                  <CitationList
                    citations={result.answer.conflicts.citations}
                    heading="Documents involved"
                  />
                </div>
              </div>
            ) : null}

            <div data-tour="knowledge.citations" className="mt-4">
              <CitationList citations={result.answer.citations} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2 border-t border-border-subtle pt-3">
              <Button variant="outline" size="sm" onClick={() => ask(result.question)}>
                <RotateCcw aria-hidden className="size-4" />
                {result.lane === "guided_example" ? "Run this live instead" : "Ask again"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={reported}
                onClick={() => {
                  setReported(true);
                  logActivity.mutate({
                    actor: "user",
                    actorName: actor.name,
                    action: "Answer reported as incorrect",
                    detail: `Flagged the answer to "${result.question}" for review by a Steuerberater.`,
                    sourceIds: [...new Set(result.answer!.citations.map((c) => c.sourceId))],
                    decision: "corrected",
                  });
                }}
              >
                {reported ? "Reported for review" : "This answer is wrong"}
              </Button>
            </div>
            {reported ? (
              <p role="status" className="mt-2 text-xs text-status-success">
                Reported. Jonas Ehlers has been notified and the report is in the activity trail.
              </p>
            ) : null}
          </Panel>

          <Panel
            title="Why this answer"
            description={
              result.lane === "guided_example"
                ? "The passages recorded against this curated example, including the ones it rejected."
                : "Every passage retrieval looked at, in fused rank order, including the ones it rejected."
            }
          >
            <ul className="space-y-2">
              {result.retrieved.map((r) => {
                const source = sourceById(r.sourceId);
                return (
                  <li
                    key={`${r.sourceId}-${r.passageId}`}
                    className="flex flex-wrap items-center gap-2 rounded-sm border border-border-subtle px-3 py-2 text-sm"
                  >
                    <span
                      className={
                        r.used
                          ? "rounded-sm bg-source-verified-bg px-1.5 py-0.5 text-xs font-medium text-source-verified"
                          : "rounded-sm bg-status-neutral-bg px-1.5 py-0.5 text-xs font-medium text-status-neutral"
                      }
                    >
                      {r.used ? (r.label ?? "Used") : "Rejected"}
                    </span>
                    <span className="min-w-0 flex-1">
                      {source?.shortTitle ?? r.sourceTitle} — <span className="font-mono text-xs">{r.locator}</span>
                    </span>
                    {source ? <SourceHealthBadge health={source.health} /> : null}
                    {result.lane === "live_retrieval" ? (
                      <span className="font-mono text-xs text-text-secondary">
                        rrf {r.score.toFixed(4)} · fts {r.raw?.fts.toFixed(3) ?? "—"} · trgm{" "}
                        {r.raw?.trgm.toFixed(3) ?? "—"} · anchor {r.raw?.anchor ?? "—"}
                      </span>
                    ) : null}
                    <span
                      lang={r.exclusionReason ? undefined : "de"}
                      className="w-full text-xs text-text-secondary"
                    >
                      {r.exclusionReason ?? r.text.slice(0, 220)}
                      {!r.exclusionReason && r.text.length > 220 ? "…" : ""}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-xs text-text-secondary">
              {excluded.length
                ? `${excluded.length} passage(s) were retrieved and then filtered out. They are shown so a filter can never hide a source silently.`
                : "No passage was filtered out for this question."}
              {" "}
              {result.lane === "guided_example"
                ? "This is a curated example stored in the library; no model produced it."
                : `Answer sentences produced by ${result.modelId}`}
              {result.lane === "live_retrieval" && result.droppedSentences
                ? `; ${result.droppedSentences} sentence(s) were discarded for citing a passage that was never supplied.`
                : result.lane === "live_retrieval"
                  ? "; none were discarded."
                  : ""}
            </p>
          </Panel>
        </div>
      ) : null}
    </div>
  );
}
