import { createFileRoute, Link } from "@tanstack/react-router";
import { Bot, Cog, User } from "lucide-react";
import { PageHeader, formatDateTime } from "@/features/taxhub/components/primitives";
import { useTaxhub } from "@/features/taxhub/use-taxhub";

export const Route = createFileRoute("/activity")({
  head: () => ({
    meta: [
      { title: "Activity — TaxHub" },
      {
        name: "description",
        content:
          "A record of what the assistant did, which sources it used or excluded, and every human decision on its output.",
      },
      { property: "og:title", content: "Activity — TaxHub" },
      {
        property: "og:description",
        content: "What the assistant did, which sources it used, and every human decision.",
      },
    ],
  }),
  component: Activity,
});

const actorIcon = { assistant: Bot, user: User, system: Cog };

function Activity() {
  const { activity, sourceById } = useTaxhub();

  return (
    <div className="space-y-6">
      <PageHeader
        tourId="activity.header"
        title="Activity"
        description="Every classification, retrieval, exclusion and human decision, in order. This is what a firm shows when someone asks how an answer was reached."
      />

      <ol data-tour="activity.timeline" className="space-y-0 border-l border-border-default pl-4">
        {activity.map((event, eventIndex) => {
          const Icon = actorIcon[event.actor];
          return (
            <li
              key={event.id}
              data-tour={eventIndex === 0 ? "activity.event" : undefined}
              className="relative pb-5"
            >
              <span
                aria-hidden
                className="absolute -left-[1.4rem] top-0.5 grid size-5 place-items-center rounded-full border border-border-default bg-surface"
              >
                <Icon className="size-3 text-text-secondary" />
              </span>
              <div className="flex flex-wrap items-baseline gap-x-2">
                <p className="text-sm font-medium">{event.action}</p>
                {event.decision ? (
                  <span className="rounded-sm bg-human-review-required-bg px-1.5 py-0.5 text-[11px] font-medium text-human-review-required">
                    Human decision
                  </span>
                ) : null}
              </div>
              <p className="type-data text-text-tertiary">
                {formatDateTime(event.at)} · {event.actorName}
              </p>
              <p className="mt-1 text-sm text-text-secondary">{event.detail}</p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {event.requestId ? (
                  <Link
                    to="/inbox/$requestId"
                    params={{ requestId: event.requestId }}
                    className="text-xs underline underline-offset-2"
                  >
                    Open the request
                  </Link>
                ) : null}
                {(event.sourceIds ?? []).map((id) => {
                  const source = sourceById(id);
                  if (!source) return null;
                  return (
                    <Link
                      key={id}
                      to="/sources/$sourceId"
                      params={{ sourceId: id }}
                      className="rounded-sm bg-subtle px-1.5 py-0.5 text-xs text-text-secondary hover:text-text-primary"
                    >
                      {source.shortTitle}
                    </Link>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}