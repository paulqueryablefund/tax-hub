import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { z } from "zod";
import {
  FictionalBadge,
  KeyValue,
  PageHeader,
  Panel,
  SourceHealthBadge,
  formatDate,
} from "@/features/taxhub/components/primitives";
import { useTaxhub } from "@/features/taxhub/use-taxhub";

const searchSchema = z.object({
  passage: z.string().optional(),
});

export const Route = createFileRoute("/sources/$sourceId")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Source detail — TaxHub" },
      {
        name: "description",
        content:
          "Read the exact passage an answer relied on, with its publisher, effective date and review state.",
      },
      { property: "og:title", content: "Source detail — TaxHub" },
      {
        property: "og:description",
        content: "The exact passage behind an answer, with publisher and review state.",
      },
    ],
  }),
  component: SourceDetail,
});

function SourceDetail() {
  const { sourceId } = Route.useParams();
  const { passage: focusedPassage } = Route.useSearch();
  const { sources, sourceById } = useTaxhub();
  const source = sourceById(sourceId);
  if (!source) throw notFound();

  const supersededBy = (source.supersededByIds ?? [])
    .map((id) => sourceById(id))
    .filter(Boolean);
  const supersedes = sources.filter((s) => s.supersededByIds?.includes(source.id));

  const relationLabels: Record<string, string> = {
    superseded_by: "Replaced or amended by",
    supersedes: "Replaces",
    modified_by: "Modified by",
    transitional_rule: "Transitional rule in",
    conflicts_with: "Conflicts with",
    depends_on: "Depends on",
  };
  const relations = source.relations ?? [];

  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="text-xs text-text-secondary">
        <Link to="/sources" className="hover:underline">
          Sources
        </Link>
        <span aria-hidden> / </span>
        <span>{source.shortTitle}</span>
      </nav>

      <PageHeader
        eyebrow={source.publisher}
        title={source.title}
        description={source.note}
        actions={
          source.url ? (
            <a
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-sm border border-border-default px-3 py-2 text-sm hover:bg-subtle"
            >
              <ExternalLink aria-hidden className="size-4" />
              Open the published document
            </a>
          ) : null
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <SourceHealthBadge health={source.health} />
        {source.isFictional ? <FictionalBadge /> : null}
        {source.isPublic ? (
          <span className="rounded-sm bg-status-information-bg px-2 py-0.5 text-xs font-medium text-status-information">
            Publicly available material
          </span>
        ) : null}
      </div>

      {source.health === "outdated" ? (
        <div className="rounded-md border border-status-neutral/30 bg-status-neutral-bg px-4 py-3 text-sm">
          This version is superseded and is excluded from answers. It is retained so that past
          answers remain auditable.
          {supersededBy.length ? (
            <>
              {" "}
              Current version:{" "}
              <Link
                to="/sources/$sourceId"
                params={{ sourceId: supersededBy[0]!.id }}
                className="underline"
              >
                {supersededBy[0]!.shortTitle}
              </Link>
              .
            </>
          ) : null}
        </div>
      ) : null}

      <Panel title="Document facts">
        <KeyValue
          items={[
            {
              label: "Effective from",
              value: source.effectiveFrom
                ? formatDate(source.effectiveFrom)
                : "Not stated by the source",
            },
            { label: "Last reviewed", value: formatDate(source.lastReviewed) },
            { label: "Visibility", value: source.visibility.replace(/_/g, " ") },
            { label: "Passages indexed", value: String(source.passages.length) },
          ]}
        />
      </Panel>

      <Panel
        title="Indexed passages"
        description="These are the units an answer can cite. A passage arriving from a citation link is highlighted."
      >
        <ul className="space-y-3">
          {source.passages.map((p) => {
            const focused = p.id === focusedPassage;
            return (
              <li
                key={p.id}
                id={p.id}
                className={
                  focused
                    ? "rounded-sm border border-source-verified/40 bg-citation-highlight px-3 py-2"
                    : "rounded-sm border border-border-subtle px-3 py-2"
                }
              >
                <p className="type-label mb-1">
                  {p.locator}
                  {focused ? " · cited passage" : ""}
                </p>
                <p className="text-sm leading-relaxed">{p.text}</p>
              </li>
            );
          })}
        </ul>
      </Panel>

      {supersedes.length ? (
        <Panel title="Earlier versions">
          <ul className="space-y-1 text-sm">
            {supersedes.map((s) => (
              <li key={s.id}>
                <Link
                  to="/sources/$sourceId"
                  params={{ sourceId: s.id }}
                  className="underline underline-offset-2"
                >
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      {relations.length ? (
        <Panel
          title="Stated relationships to other documents"
          description="Recorded in the direction the documents themselves state. A target outside this library is named, not linked."
        >
          <ul className="space-y-3 text-sm">
            {relations.map((rel, i) => {
              const target = rel.targetSourceId ? sourceById(rel.targetSourceId) : undefined;
              return (
                <li key={i} className="rounded-sm border border-border-subtle px-3 py-2">
                  <p className="type-label mb-1">
                    {relationLabels[rel.relation] ?? rel.relation.replace(/_/g, " ")}
                  </p>
                  <p>
                    {rel.targetSourceId ? (
                      target ? (
                        <Link
                          to="/sources/$sourceId"
                          params={{ sourceId: target.id }}
                          className="underline underline-offset-2"
                        >
                          {target.title}
                        </Link>
                      ) : (
                        <span className="text-source-conflict">
                          Broken reference — {rel.targetSourceId} is not in the library
                        </span>
                      )
                    ) : (
                      <span>
                        {rel.targetLabel}{" "}
                        <span className="text-text-secondary">(not held in this library)</span>
                      </span>
                    )}
                  </p>
                  {rel.scope ? (
                    <p className="mt-1 text-text-secondary">Scope: {rel.scope}</p>
                  ) : null}
                  {rel.effectiveNote ? (
                    <p className="mt-1 text-text-secondary">Effective: {rel.effectiveNote}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </Panel>
      ) : null}
    </div>
  );
}