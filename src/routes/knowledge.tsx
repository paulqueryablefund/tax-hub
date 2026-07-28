import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, RotateCcw, Search } from "lucide-react";
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
import { findKnowledgeEntry, knowledgeEntries } from "@/features/taxhub/data/knowledge";
import type { KnowledgeEntry } from "@/features/taxhub/data/knowledge";
import { currentUserId, userById } from "@/features/taxhub/data/people";
import { sourceById } from "@/features/taxhub/data/sources";
import { logEvent } from "@/features/taxhub/store";

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

function Knowledge() {
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [entry, setEntry] = useState<KnowledgeEntry | null>(null);
  const [reported, setReported] = useState(false);
  const actor = userById(currentUserId)!;

  function ask(q: string) {
    setQuery(q);
    setReported(false);
    setPhase("searching");
    window.setTimeout(() => {
      const match = findKnowledgeEntry(q);
      setEntry(match);
      setPhase(match ? "answered" : "nothing");
      logEvent({
        actor: "assistant",
        actorName: "TaxHub assistant",
        action: match ? "Knowledge question answered" : "Knowledge question unanswered",
        detail: match
          ? `"${q}" — answered with confidence: ${match.answer.confidence}.`
          : `"${q}" — no source in the library covered the question. No answer was produced.`,
        sourceIds: match?.answer.citations.map((c) => c.sourceId),
      });
    }, 550);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knowledge"
        description="Ask how this firm does something. The assistant answers only from the sources in your library, and shows you the passage it used. If nothing covers the question, it says so."
      />

      <Panel>
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
          <span className="type-label self-center">Try</span>
          {knowledgeEntries
            .filter((e) => e.suggested)
            .map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => ask(e.prompt)}
                className="rounded-sm border border-border-default bg-subtle px-2 py-1 text-xs text-text-secondary hover:border-border-strong hover:text-text-primary"
              >
                {e.prompt}
              </button>
            ))}
        </div>
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
            <p className="text-sm text-text-secondary">Matching the question against the library…</p>
            <div className="h-3 w-2/3 animate-pulse rounded-sm bg-inset" />
            <div className="h-3 w-1/2 animate-pulse rounded-sm bg-inset" />
            <div className="h-3 w-3/4 animate-pulse rounded-sm bg-inset" />
          </div>
        </Panel>
      ) : null}

      {phase === "nothing" ? (
        <Panel title="No answer">
          <p className="text-sm">
            Nothing in this workspace covers that question, so I will not answer it. Rephrase it, or
            add the relevant document to the source library first.
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            The unanswered question has been logged so the firm can see which sources are missing.
          </p>
        </Panel>
      ) : null}

      {phase === "answered" && entry ? (
        <div className="space-y-4">
          <Panel
            title="Answer"
            description="Built from the passages listed below. Nothing else was used."
          >
            <ConfidenceBadge confidence={entry.answer.confidence} withExplanation />
            <p className="mt-3 text-sm leading-relaxed">{entry.answer.answer}</p>

            {entry.answer.caveats.length ? (
              <div className="mt-4">
                <CaveatList caveats={entry.answer.caveats} />
              </div>
            ) : null}

            {entry.answer.conflicts ? (
              <div className="mt-4 rounded-sm border border-source-conflict/30 bg-source-conflict-bg px-3 py-2">
                <p className="type-label mb-1 text-source-conflict">Conflicting sources</p>
                <p className="text-sm">{entry.answer.conflicts.note}</p>
                <div className="mt-2">
                  <CitationList
                    citations={entry.answer.conflicts.citations}
                    heading="Documents involved"
                  />
                </div>
              </div>
            ) : null}

            <div className="mt-4">
              <CitationList citations={entry.answer.citations} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2 border-t border-border-subtle pt-3">
              <Button variant="outline" size="sm" onClick={() => ask(entry.prompt)}>
                <RotateCcw aria-hidden className="size-4" />
                Ask again
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={reported}
                onClick={() => {
                  setReported(true);
                  logEvent({
                    actor: "user",
                    actorName: actor.name,
                    action: "Answer reported as incorrect",
                    detail: `Flagged the answer to "${entry.prompt}" for review by a Steuerberater.`,
                    sourceIds: entry.answer.citations.map((c) => c.sourceId),
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
            description="Every passage the retrieval step looked at, including the ones it rejected."
          >
            <ul className="space-y-2">
              {entry.retrieved.map((r) => {
                const source = sourceById(r.sourceId);
                if (!source) return null;
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
                      {r.used ? "Used" : "Rejected"}
                    </span>
                    <span className="min-w-0 flex-1">{source.shortTitle}</span>
                    <SourceHealthBadge health={source.health} />
                    <span className="w-full text-xs text-text-secondary">{r.note}</span>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>
      ) : null}
    </div>
  );
}