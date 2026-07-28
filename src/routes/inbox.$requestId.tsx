import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AlertTriangle, ArrowUpRight, FileSignature, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CaveatList,
  CitationList,
  ConfidenceBadge,
  EmptyState,
  KeyValue,
  PageHeader,
  Panel,
  StatusBadge,
  formatDate,
  formatDateTime,
} from "@/features/taxhub/components/primitives";
import { useTaxhub, useTaxhubActions } from "@/features/taxhub/use-taxhub";

export const Route = createFileRoute("/inbox/$requestId")({
  head: () => ({
    meta: [
      { title: "Request detail — TaxHub" },
      {
        name: "description",
        content:
          "The original client message, what the assistant established, which facts are still missing, and the draft awaiting approval.",
      },
      { property: "og:title", content: "Request detail — TaxHub" },
      {
        property: "og:description",
        content: "Original message, established facts, missing information and the pending draft.",
      },
    ],
  }),
  component: RequestDetail,
  notFoundComponent: RequestNotFound,
});

function RequestNotFound() {
  return (
    <EmptyState
      title="Request not found"
      description="This request does not exist in the demonstration workspace."
      action={
        <Button asChild variant="outline">
          <Link to="/inbox">Back to requests</Link>
        </Button>
      }
    />
  );
}

function RequestDetail() {
  const { requestId } = Route.useParams();
  const { requests, drafts, clientById, userById, currentUser } = useTaxhub();
  const { escalateRequest } = useTaxhubActions();
  const request = requests.find((r) => r.id === requestId);
  if (!request) throw notFound();

  const client = clientById(request.clientId)!;
  const owner = userById(request.assignedUserId);
  const draft = drafts.find((d) => d.id === request.draftId);
  const missing = request.intake.filter((f) => f.status !== "provided");
  const actor = currentUser;

  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="text-xs text-text-secondary">
        <Link to="/inbox" className="hover:underline">
          Requests
        </Link>
        <span aria-hidden> / </span>
        <span className="type-data">{request.reference}</span>
      </nav>

      <PageHeader
        tourId="request.header"
        descriptionTourId="request.summary"
        eyebrow={`${client.name} · Mandant ${client.mandantNumber}`}
        title={request.subject}
        description={request.summary}
        actions={
          <div data-tour="request.actions" className="flex flex-wrap gap-2">
            {request.intake.length > 0 ? (
              <Button asChild variant="outline">
                <Link to="/intake/$requestId" params={{ requestId: request.id }}>
                  <ListChecks aria-hidden className="size-4" />
                  Open intake
                </Link>
              </Button>
            ) : null}
            {draft ? (
              <Button asChild>
                <Link to="/drafts/$draftId" params={{ draftId: draft.id }}>
                  <FileSignature aria-hidden className="size-4" />
                  Review draft
                </Link>
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <Panel
            title={request.channel === "phone" ? "Call record" : "Original message"}
            description={`Received ${formatDateTime(request.receivedAt)}`}
          >
            <p className="whitespace-pre-line text-sm leading-relaxed text-text-primary">
              {request.body}
            </p>
          </Panel>

          {request.answers.length > 0 ? (
            <Panel
              title="What the assistant established"
              description="Each statement is traced to a passage in your source library."
            >
              <div className="space-y-5">
                {request.answers.map((answer) => (
                  <article
                    key={answer.id}
                    className="rounded-sm border border-border-subtle bg-ai-surface p-3"
                  >
                    <h3 className="type-section-title">{answer.question}</h3>
                    <div className="mt-2">
                      <ConfidenceBadge confidence={answer.confidence} withExplanation />
                    </div>
                    <p className="mt-3 text-sm leading-relaxed">{answer.answer}</p>
                    {answer.caveats.length ? (
                      <div className="mt-3">
                        <CaveatList caveats={answer.caveats} />
                      </div>
                    ) : null}
                    {answer.conflicts ? (
                      <div
                        data-tour="request.conflicts"
                        className="mt-3 rounded-sm border border-source-conflict/30 bg-source-conflict-bg px-3 py-2"
                      >
                        <p className="type-label mb-1 text-source-conflict">Conflicting sources</p>
                        <p className="text-sm">{answer.conflicts.note}</p>
                        <div className="mt-2">
                          <CitationList
                            citations={answer.conflicts.citations}
                            heading="Documents involved"
                          />
                        </div>
                      </div>
                    ) : null}
                    <div data-tour="request.citations" className="mt-3">
                      <CitationList citations={answer.citations} />
                    </div>
                  </article>
                ))}
              </div>
            </Panel>
          ) : (
            <Panel title="What the assistant established">
              <EmptyState
                title="No grounded answer yet"
                description="The assistant has classified this request but has not yet run it against the source library. Open the intake to start."
              />
            </Panel>
          )}
        </div>

        <div className="space-y-4">
          <Panel title="Case facts">
            <KeyValue
              items={[
                { label: "Status", value: <StatusBadge status={request.status} /> },
                { label: "Reference", value: <span className="type-data">{request.reference}</span> },
                { label: "Owner", value: owner?.name ?? "Unassigned" },
                { label: "Channel", value: request.channel },
                {
                  label: "Due",
                  value: request.dueDate ? formatDate(request.dueDate) : "No deadline recorded",
                },
                { label: "Client contact", value: client.contactName },
              ]}
            />
          </Panel>

          <Panel
            tourId="request.open-points"
            title="Missing information"
            description="Blocking the first useful output."
          >
            {missing.length === 0 ? (
              <p className="text-sm text-text-secondary">
                Nothing outstanding. Every required intake item has been recorded.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {missing.map((field) => (
                  <li key={field.id} className="flex gap-2">
                    <AlertTriangle
                      aria-hidden
                      className={
                        field.status === "uncertain"
                          ? "mt-0.5 size-4 shrink-0 text-ai-uncertain"
                          : "mt-0.5 size-4 shrink-0 text-status-warning"
                      }
                    />
                    <span>
                      {field.label}
                      {field.status === "uncertain" ? (
                        <span className="block text-xs text-text-secondary">
                          Recorded but not evidenced: {field.value}
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Human control">
            {request.escalation ? (
              <p className="text-sm">
                Escalated to {userById(request.escalation.toUserId)?.name} —{" "}
                <span className="text-text-secondary">{request.escalation.reason}</span>
              </p>
            ) : (
              <>
                <p className="text-sm text-text-secondary">
                  Hand this request to a Steuerberater. The client is not contacted by this action.
                </p>
                <Button
                  variant="outline"
                  className="mt-3 w-full"
                  disabled={escalateRequest.isPending}
                  onClick={() =>
                    escalateRequest.mutate({
                      requestId: request.id,
                      toUserId: "u-ehlers",
                      reason:
                        "Firm handbook 4.3 requires review by a Steuerberater when the gross list price may exceed the reduced-base ceiling.",
                      actorName: actor.name,
                    })
                  }
                >
                  <ArrowUpRight aria-hidden className="size-4" />
                  Escalate to Jonas Ehlers
                </Button>
              </>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}