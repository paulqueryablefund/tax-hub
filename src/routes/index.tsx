import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Inbox, ShieldCheck, UserCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  EmptyState,
  PageHeader,
  Panel,
  StatusBadge,
  formatDateTime,
} from "@/features/taxhub/components/primitives";
import { useTaxhub } from "@/features/taxhub/use-taxhub";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — TaxHub" },
      {
        name: "description",
        content:
          "Today's client requests, the items waiting for a professional's approval, and the health of the firm's source library.",
      },
      { property: "og:title", content: "Overview — TaxHub" },
      {
        property: "og:description",
        content:
          "Today's client requests, the items waiting for a professional's approval, and the health of the firm's source library.",
      },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { requests, sources, workspace, clientById, userById, overviewFor } = useTaxhub();
  const open = requests.filter((r) => r.status !== "closed" && r.status !== "approved");
  const review = requests.filter((r) => r.status === "ready_for_review");
  const attention = sources.filter((s) => s.health === "review_due" || s.health === "conflicting");

  return (
    <div className="space-y-6">
      <SharedInstanceNotice />

      <PageHeader
        tourId="overview.header"
        eyebrow={`${workspace.shortName} · ${workspace.city} · ${workspace.headcount} staff`}
        title="Today"
        description="What came in, what is blocked on missing information, and what needs a professional's signature before it leaves the firm."
        actions={
          <Button asChild>
            <Link to="/inbox">
              Open requests
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </Button>
        }
      />

      <div data-tour="overview.metrics" className="grid gap-4 sm:grid-cols-3">
        <Metric
          label="Open requests"
          value={String(open.length)}
          hint="Not yet approved or closed"
        />
        <Metric
          label="Waiting for approval"
          value={String(review.length)}
          hint="Nothing is sent without a signature"
          tone="review"
        />
        <Metric
          label="Sources needing attention"
          value={String(attention.length)}
          hint="Review due or conflicting"
          tone={attention.length ? "warn" : "default"}
        />
      </div>

      <Panel
        tourId="overview.attention"
        title="Waiting for you"
        description="Drafts the assistant has prepared. Each one names what it is unsure about."
      >
        {review.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="Nothing waiting for approval"
            description="When the assistant finishes a draft it appears here with its open questions listed."
          />
        ) : (
          <ul className="divide-y divide-border-subtle">
            {review.map((request) => {
              const client = clientById(request.clientId);
              const intake = overviewFor(request.id);
              return (
                <li key={request.id} className="py-3 first:pt-0 last:pb-0">
                  <Link
                    to="/inbox/$requestId"
                    params={{ requestId: request.id }}
                    className="group flex flex-wrap items-start justify-between gap-3 rounded-sm"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium group-hover:underline">
                        {request.subject}
                      </p>
                      <p className="mt-0.5 text-xs text-text-secondary">
                        {client?.name} · Mandant {client?.mandantNumber} ·{" "}
                        {formatDateTime(request.receivedAt)}
                      </p>
                      <p className="mt-1 text-xs text-text-secondary">
                        {intake.total - intake.provided} of {intake.total} intake items still open
                      </p>
                    </div>
                    <StatusBadge status={request.status} />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Latest requests" description="Across all channels.">
          <ul className="divide-y divide-border-subtle">
            {requests.slice(0, 5).map((request) => {
              const client = clientById(request.clientId);
              return (
                <li key={request.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <Link
                      to="/inbox/$requestId"
                      params={{ requestId: request.id }}
                      className="text-sm hover:underline"
                    >
                      {request.subject}
                    </Link>
                    <p className="text-xs text-text-secondary">
                      {client?.name} · {userById(request.assignedUserId)?.name}
                    </p>
                  </div>
                  <StatusBadge status={request.status} />
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel
          title="How this workspace answers"
          description="The rules that apply to every answer in TaxHub."
        >
          <ul className="space-y-3 text-sm text-text-primary">
            <Rule
              icon={ShieldCheck}
              title="Answers come from your sources or not at all"
              body="If nothing in the library covers the question, the assistant says so and names who to ask."
            />
            <Rule
              icon={UserCheck}
              title="Nothing leaves the firm without approval"
              body="Every external message is held as a draft until a person with signing authority approves it."
            />
            <Rule
              icon={Inbox}
              title="Every step is logged"
              body="Classification, retrieval, exclusions and human decisions are recorded in the activity trail."
            />
          </ul>
        </Panel>
      </div>
    </div>
  );
}

const NOTICE_KEY = "taxhub.shared-instance-notice.v1";

/**
 * Read from localStorage in an effect, never during render: the server has no
 * storage, and reading it in a state initialiser would hydrate as a mismatch.
 */
function SharedInstanceNotice() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(NOTICE_KEY) === "dismissed");
    } catch {
      setDismissed(false);
    }
  }, []);

  if (dismissed) return null;

  return (
    <div className="flex items-start gap-3 rounded-md border border-border-default bg-subtle px-4 py-3 text-sm text-text-secondary">
      <p className="min-w-0 flex-1">
        <span className="font-medium text-text-primary">Shared workspace.</span> Your team signs in
        to one database, so everyone sees and changes the same cases — a case may already be
        part-way through when you arrive. You are working as Miriam Radtke;{" "}
        <Link to="/settings" className="underline underline-offset-2">
          Settings
        </Link>{" "}
        returns the demonstration data to its starting state.
      </p>
      <button
        type="button"
        aria-label="Dismiss the shared instance notice"
        className="shrink-0 rounded-sm p-1 text-text-tertiary hover:text-text-primary"
        onClick={() => {
          setDismissed(true);
          try {
            window.localStorage.setItem(NOTICE_KEY, "dismissed");
          } catch {
            /* a browser that refuses storage simply shows the notice again */
          }
        }}
      >
        <X aria-hidden className="size-4" />
      </button>
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "default" | "review" | "warn";
}) {
  const toneClass =
    tone === "review"
      ? "text-human-review-required"
      : tone === "warn"
        ? "text-status-warning"
        : "text-text-primary";
  return (
    <div className="rounded-md border border-border-default bg-surface px-4 py-3">
      <p className="type-label">{label}</p>
      <p className={`mt-1 font-serif text-3xl leading-none ${toneClass}`}>{value}</p>
      <p className="mt-1.5 text-xs text-text-secondary">{hint}</p>
    </div>
  );
}

function Rule({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof ShieldCheck;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-3">
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-action-primary" />
      <span>
        <span className="font-medium">{title}. </span>
        <span className="text-text-secondary">{body}</span>
      </span>
    </li>
  );
}
