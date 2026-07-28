import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  BadgeCheck,
  CircleAlert,
  CircleHelp,
  FileText,
  ShieldQuestion,
  UserCheck,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useTaxhub } from "../use-taxhub";
import type {
  Citation,
  Confidence,
  RequestStatus,
  SourceHealth,
} from "../types";

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <header className="flex flex-col gap-3 border-b border-border-default pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="type-label mb-1.5">{eyebrow}</p> : null}
        <h1 className="type-page-title text-text-primary">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm text-text-secondary">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-md border border-border-default bg-surface shadow-[0_1px_2px_oklch(0.235_0.018_255/0.05)]",
        className,
      )}
    >
      {title ? (
        <div className="flex items-start justify-between gap-3 border-b border-border-subtle px-4 py-3">
          <div className="min-w-0">
            <h2 className="type-section-title text-text-primary">{title}</h2>
            {description ? (
              <p className="mt-0.5 text-xs text-text-secondary">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
        </div>
      ) : null}
      <div className="px-4 py-4">{children}</div>
    </section>
  );
}

const statusMeta: Record<RequestStatus, { label: string; className: string }> = {
  new: { label: "New", className: "bg-status-information-bg text-status-information" },
  intake: { label: "Intake running", className: "bg-status-neutral-bg text-status-neutral" },
  awaiting_client: {
    label: "Awaiting client",
    className: "bg-status-warning-bg text-status-warning",
  },
  ready_for_review: {
    label: "Review required",
    className: "bg-human-review-required-bg text-human-review-required",
  },
  approved: { label: "Approved", className: "bg-status-success-bg text-status-success" },
  closed: { label: "Closed", className: "bg-status-neutral-bg text-status-neutral" },
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  const meta = statusMeta[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium",
        meta.className,
      )}
    >
      {status === "ready_for_review" ? <UserCheck aria-hidden className="size-3.5" /> : null}
      {meta.label}
    </span>
  );
}

const confidenceMeta: Record<
  Confidence,
  { label: string; className: string; icon: typeof BadgeCheck; explain: string }
> = {
  high: {
    label: "Well supported",
    className: "bg-source-verified-bg text-source-verified",
    icon: BadgeCheck,
    explain: "Every statement is backed by a source in this workspace.",
  },
  medium: {
    label: "Check before sending",
    className: "bg-ai-uncertain-bg text-ai-uncertain",
    icon: CircleAlert,
    explain: "Supported, but at least one input is unevidenced or a source is due for review.",
  },
  low: {
    label: "Weak support",
    className: "bg-status-danger-bg text-status-danger",
    icon: AlertTriangle,
    explain: "Only a loose match was found. Verify against the source before using this.",
  },
  insufficient: {
    label: "No answer possible",
    className: "bg-status-neutral-bg text-status-neutral",
    icon: ShieldQuestion,
    explain: "Nothing in the library covers this question.",
  },
};

export function ConfidenceBadge({
  confidence,
  withExplanation = false,
}: {
  confidence: Confidence;
  withExplanation?: boolean;
}) {
  const meta = confidenceMeta[confidence];
  const Icon = meta.icon;
  return (
    <span className="inline-flex flex-col gap-1">
      <span
        className={cn(
          "inline-flex w-fit items-center gap-1.5 rounded-sm px-2 py-0.5 text-xs font-medium",
          meta.className,
        )}
      >
        <Icon aria-hidden className="size-3.5" />
        {meta.label}
      </span>
      {withExplanation ? (
        <span className="text-xs text-text-secondary">{meta.explain}</span>
      ) : null}
    </span>
  );
}

const healthMeta: Record<SourceHealth, { label: string; className: string }> = {
  current: { label: "Current", className: "bg-source-verified-bg text-source-verified" },
  review_due: { label: "Review due", className: "bg-source-stale-bg text-source-stale" },
  outdated: { label: "Superseded", className: "bg-status-neutral-bg text-status-neutral" },
  conflicting: { label: "Conflicting", className: "bg-source-conflict-bg text-source-conflict" },
};

export function SourceHealthBadge({ health }: { health: SourceHealth }) {
  const meta = healthMeta[health];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium",
        meta.className,
      )}
    >
      {meta.label}
    </span>
  );
}

export function FictionalBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border border-dashed border-border-strong px-1.5 py-0.5 text-[11px] font-medium text-text-tertiary",
        className,
      )}
      title="Invented material used for this demonstration."
    >
      Demo material
    </span>
  );
}

/** Inline, numbered citation marker that links to the passage in the source. */
export function CitationChip({ citation, index }: { citation: Citation; index: number }) {
  const { sourceById } = useTaxhub();
  const source = sourceById(citation.sourceId);
  if (!source) return <BrokenCitation id={citation.sourceId} />;
  return (
    <Link
      to="/sources/$sourceId"
      params={{ sourceId: source.id }}
      search={{ passage: citation.passageId }}
      className="inline-flex items-center gap-1 rounded-sm bg-source-verified-bg px-1.5 py-0.5 text-xs font-medium text-source-verified underline-offset-2 hover:underline"
      aria-label={`Source ${index}: ${source.shortTitle}, ${citation.reason}`}
    >
      <FileText aria-hidden className="size-3" />
      {index}. {source.shortTitle}
    </Link>
  );
}

export function CitationList({
  citations,
  heading = "Sources used",
}: {
  citations: Citation[];
  heading?: string;
}) {
  const { sourceById } = useTaxhub();
  if (!citations.length) {
    return (
      <p className="text-sm text-text-secondary">
        No sources were used. Nothing in the library matched this question.
      </p>
    );
  }
  return (
    <div>
      <p className="type-label mb-2">{heading}</p>
      <ol className="space-y-2">
        {citations.map((citation, i) => {
          const source = sourceById(citation.sourceId);
          if (!source) {
            return (
              <li key={`${citation.sourceId}-${citation.passageId}-${i}`}>
                <BrokenCitation id={citation.sourceId} />
              </li>
            );
          }
          const passage = source.passages.find((p) => p.id === citation.passageId);
          return (
            <li
              key={`${citation.sourceId}-${citation.passageId}-${i}`}
              className="rounded-sm border border-border-subtle bg-subtle px-3 py-2"
            >
              <div className="flex flex-wrap items-center gap-2">
                <CitationChip citation={citation} index={i + 1} />
                {source.isFictional ? <FictionalBadge /> : null}
                <SourceHealthBadge health={source.health} />
              </div>
              {passage ? (
                <blockquote className="mt-2 border-l-2 border-border-strong pl-3 text-sm text-text-primary">
                  <span className="type-label mb-1 block">{passage.locator}</span>
                  {passage.text}
                </blockquote>
              ) : (
                <p className="mt-2 text-xs font-medium text-status-danger">
                  This citation points to passage {citation.passageId}, which is no longer in the
                  source. Do not rely on this statement until it is re-checked.
                </p>
              )}
              <p className="mt-2 text-xs text-text-secondary">
                <span className="font-medium">Why this passage: </span>
                {citation.reason}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function CaveatList({ caveats }: { caveats: string[] }) {
  if (!caveats.length) return null;
  return (
  if (!caveats.length) return null;
  return (
    <div className="rounded-sm border border-ai-uncertain/30 bg-ai-uncertain-bg px-3 py-2">
      <p className="type-label mb-1 text-ai-uncertain">What is not certain</p>
      <ul className="list-disc space-y-1 pl-4 text-sm text-text-primary">
        {caveats.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
    </div>
  );
}

export function EmptyState({
  icon: Icon = CircleHelp,
  title,
  description,
  action,
}: {
  icon?: typeof CircleHelp;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-border-default bg-subtle px-6 py-12 text-center">
      <Icon aria-hidden className="size-6 text-text-tertiary" />
      <div>
        <p className="type-section-title text-text-primary">{title}</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-text-secondary">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function KeyValue({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="type-label">{item.label}</dt>
          <dd className="mt-0.5 text-sm text-text-primary">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "Europe/Berlin",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    timeZone: "Europe/Berlin",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}