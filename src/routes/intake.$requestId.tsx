import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CheckCircle2, CircleDashed, CircleAlert } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  EmptyState,
  PageHeader,
  Panel,
  formatDate,
} from "@/features/taxhub/components/primitives";
import { CitationChip } from "@/features/taxhub/components/primitives";
import { useTaxhub, useTaxhubActions } from "@/features/taxhub/use-taxhub";

export const Route = createFileRoute("/intake/$requestId")({
  head: () => ({
    meta: [
      { title: "Guided intake — Werk Flow" },
      {
        name: "description",
        content:
          "The minimum set of facts and documents this case needs, each one tied to the rule that requires it.",
      },
      { property: "og:title", content: "Guided intake — Werk Flow" },
      {
        property: "og:description",
        content: "The minimum facts this case needs, each tied to the rule that requires it.",
      },
    ],
  }),
  component: GuidedIntake,
});

function GuidedIntake() {
  const { requestId } = Route.useParams();
  const { requests, clientById, currentUser, overviewFor } = useTaxhub();
  const { updateIntakeField } = useTaxhubActions();
  const request = requests.find((r) => r.id === requestId);
  if (!request) throw notFound();

  const client = clientById(request.clientId)!;
  const actor = currentUser;
  const { provided, total } = overviewFor(request.id);

  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="text-xs text-text-secondary">
        <Link to="/inbox" className="hover:underline">
          Requests
        </Link>
        <span aria-hidden> / </span>
        <Link
          to="/inbox/$requestId"
          params={{ requestId: request.id }}
          className="hover:underline"
        >
          {request.reference}
        </Link>
        <span aria-hidden> / </span>
        <span>Intake</span>
      </nav>

      <PageHeader
        tourId="intake.header"
        eyebrow={`${client.name} · Mandant ${client.mandantNumber}`}
        title="Guided intake"
        description="These are the only facts this case needs. Each one names the rule or handbook passage that requires it, so nobody has to guess and nobody asks the client twice."
      />

      {total === 0 ? (
        <EmptyState
          title="No intake defined for this request type yet"
          description="Intake checklists are configured per request category. This category has not been configured in the demonstration workspace."
          action={
            <Button asChild variant="outline">
              <Link to="/inbox/$requestId" params={{ requestId: request.id }}>
                Back to the request
              </Link>
            </Button>
          }
        />
      ) : (
        <>
          <div
            data-tour="intake.progress"
            className="rounded-md border border-border-default bg-surface px-4 py-3"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm">
              <span className="font-medium">
                {provided} of {total} items recorded.
              </span>{" "}
              <span className="text-text-secondary">
                {total - provided === 0
                  ? "The case is ready for a first useful output."
                  : `${total - provided} outstanding. The draft reply will ask for exactly these.`}
              </span>
            </p>
            <div
              className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-inset"
              role="presentation"
            >
              <div
                className="h-full bg-action-primary transition-[width] duration-300"
                style={{ width: `${(provided / total) * 100}%` }}
              />
            </div>
          </div>

          <ol className="space-y-3">
            {request.intake.map((field, i) => (
              <li key={field.id} data-tour={i === 0 ? "intake.field" : undefined}>
                <IntakeItem
                  index={i + 1}
                  field={field}
                  onSave={(value) =>
                    updateIntakeField.mutate({
                      requestId: request.id,
                      fieldId: field.id,
                      value,
                      actorName: actor.name,
                    })
                  }
                />
              </li>
            ))}
          </ol>

          <Panel title="What happens next">
            <p className="text-sm text-text-secondary">
              Recording an item updates the case and the pending draft. Nothing is sent to{" "}
              {client.contactName} until a person with signing authority approves the reply.
              {request.dueDate ? ` Target date: ${formatDate(request.dueDate)}.` : ""}
            </p>
          </Panel>
        </>
      )}
    </div>
  );
}

function IntakeItem({
  index,
  field,
  onSave,
}: {
  index: number;
  field: import("@/features/taxhub/types").IntakeField;
  onSave: (value: string) => void;
}) {
  const [value, setValue] = useState(field.value ?? "");
  const [saved, setSaved] = useState(false);
  const dirty = value !== (field.value ?? "");

  const Icon =
    field.status === "provided"
      ? CheckCircle2
      : field.status === "uncertain"
        ? CircleAlert
        : CircleDashed;
  const iconClass =
    field.status === "provided"
      ? "text-status-success"
      : field.status === "uncertain"
        ? "text-ai-uncertain"
        : "text-text-tertiary";

  return (
    <div className="rounded-md border border-border-default bg-surface px-4 py-3">
      <div className="flex items-start gap-3">
        <Icon aria-hidden className={`mt-0.5 size-4 shrink-0 ${iconClass}`} />
        <div className="min-w-0 flex-1">
          <label htmlFor={`intake-${field.id}`} className="text-sm font-medium">
            {index}. {field.label}
            {field.required ? (
              <span className="ml-1 text-status-danger" aria-hidden>
                *
              </span>
            ) : null}
          </label>
          {field.help ? (
            <p
              id={`help-${field.id}`}
              data-tour="intake.help"
              className="mt-0.5 text-xs text-text-secondary"
            >
              {field.help}
            </p>
          ) : null}

          {field.status === "uncertain" ? (
            <p
              data-tour="intake.uncertain"
              className="mt-2 rounded-sm bg-ai-uncertain-bg px-2 py-1 text-xs text-ai-uncertain"
            >
              Recorded but not evidenced. The reply will ask the client to confirm this in writing.
            </p>
          ) : null}

          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <Input
              id={`intake-${field.id}`}
              aria-describedby={field.help ? `help-${field.id}` : undefined}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setSaved(false);
              }}
              placeholder={
                field.type === "file"
                  ? "File name, or note where the document is filed"
                  : field.options
                    ? field.options.join(" / ")
                    : "Enter the value"
              }
            />
            <Button
              variant={dirty ? "default" : "outline"}
              disabled={!dirty}
              onClick={() => {
                onSave(value);
                setSaved(true);
              }}
              className="sm:w-28"
            >
              Record
            </Button>
          </div>
          {saved ? (
            <p role="status" className="mt-1.5 text-xs text-status-success">
              Recorded and written to the activity trail.
            </p>
          ) : null}

          {field.requiredBy ? (
            <p
              data-tour="intake.evidence"
              className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-text-secondary"
            >
              <span>Required because of</span>
              <CitationChip citation={field.requiredBy} index={index} />
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}