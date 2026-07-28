import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, Copy, Pencil, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  CaveatList,
  CitationList,
  ConfidenceBadge,
  EmptyState,
  PageHeader,
  Panel,
  formatDateTime,
} from "@/features/taxhub/components/primitives";
import { useAnnounce } from "@/features/taxhub/components/announcer";
import { useTaxhub, useTaxhubActions } from "@/features/taxhub/use-taxhub";

export const Route = createFileRoute("/drafts/$draftId")({
  head: () => ({
    meta: [
      { title: "Draft review — TaxHub" },
      {
        name: "description",
        content:
          "Read the prepared reply, see what the assistant is unsure about, edit it, and approve before it is sent.",
      },
      { property: "og:title", content: "Draft review — TaxHub" },
      {
        property: "og:description",
        content: "Read the prepared reply, see the open questions, edit it, and approve.",
      },
    ],
  }),
  component: DraftReview,
});

function DraftNotFound() {
  return (
    <EmptyState
      title="Draft not found"
      description="This draft does not exist in the demonstration workspace. It may have been discarded by a demonstration reset."
      action={
        <Button asChild variant="outline">
          <Link to="/drafts">Back to drafts</Link>
        </Button>
      }
    />
  );
}

function DraftReview() {
  const { draftId } = Route.useParams();
  const { drafts, requests, users, currentUser } = useTaxhub();
  const { updateDraftStatus, updateDraftSection } = useTaxhubActions();
  const announce = useAnnounce();
  const draft = drafts.find((d) => d.id === draftId);
  if (!draft) throw notFound();

  const request = requests.find((r) => r.id === draft.requestId);
  const actor = currentUser;
  const approver = users.find((u) => u.canApprove)!;
  const [editing, setEditing] = useState<number | null>(null);
  const [editedBody, setEditedBody] = useState("");
  const [copied, setCopied] = useState(false);

  /**
   * Two independent gates, both enforced on the server. Role decides who may
   * sign; evidence decides whether anything may be signed at all.
   */
  const unevidenced = (request?.intake ?? []).filter((f) => f.status === "uncertain");
  const roleBlocked = !actor.canApprove;
  const evidenceBlocked = draft.isExternal && unevidenced.length > 0;
  const approvalBlocked = roleBlocked || evidenceBlocked;
  const blockReason = roleBlocked
    ? `Approving is not available to ${actor.name} (${actor.role}). Only a user with signing authority — for example ${approver.name} (${approver.role}) — may release this to the client. The server refuses the approval, not just this button.`
    : evidenceBlocked
      ? `Approving is blocked because ${unevidenced
          .map((f) => `"${f.label}"`)
          .join(", ")} is recorded but not evidenced, and this reply depends on it. The server refuses the approval until the evidence is on file, whoever is signed in.`
      : "";

  const decide = (status: "approved" | "rejected", note: string) =>
    updateDraftStatus.mutate(
      { draftId: draft.id, status, note },
      {
        onSuccess: () => {
          const message =
            status === "approved"
              ? `Approved and sent to ${draft.recipient}. The decision is in the activity trail.`
              : "Draft rejected. Nothing was sent and the case stays open.";
          toast.success(message);
          announce(message);
        },
        onError: (error) => {
          const message = `Not ${status === "approved" ? "approved" : "rejected"}: ${error.message}`;
          toast.error(message);
          announce(message);
        },
      },
    );

  const saveSection = (index: number, body: string) => {
    if (body !== draft.sections[index]?.body) {
      updateDraftSection.mutate({ draftId: draft.id, index, body });
    }
  };

  const allCitations = draft.sections.flatMap((s) => s.citations ?? []);

  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="text-xs text-text-secondary">
        <Link to="/drafts" className="hover:underline">
          Drafts
        </Link>
        <span aria-hidden> / </span>
        <span>{draft.subject}</span>
      </nav>

      <PageHeader
        tourId="drafts.detail-header"
        eyebrow={request ? `${request.reference} · to ${draft.recipient}` : draft.recipient}
        title={draft.title}
        description={`Prepared ${formatDateTime(draft.generatedAt)}. Nothing has been sent.`}
      />

      {!actor.canApprove ? (
        <div
          data-tour="drafts.review-handoff"
          className="rounded-md border border-human-review-required/30 bg-human-review-required-bg px-4 py-3 text-sm text-human-review-required"
        >
          You are signed in as {actor.name} ({actor.role}) and cannot approve outgoing client
          correspondence. You can edit the draft and hand it to {approver.name}.
        </div>
      ) : null}

      {draft.status === "approved" ? (
        <div
          role="status"
          className="rounded-md border border-status-success/30 bg-status-success-bg px-4 py-3 text-sm text-status-success"
        >
          Approved and sent. The decision, the approver and the final text are in the activity trail.
        </div>
      ) : null}
      {draft.status === "rejected" ? (
        <div
          role="status"
          className="rounded-md border border-status-danger/30 bg-status-danger-bg px-4 py-3 text-sm text-status-danger"
        >
          Rejected. The case stays open and nothing was sent to the client.
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <Panel
            tourId="drafts.review-sections"
            title={draft.subject}
            description={draft.isExternal ? "This message leaves the firm." : "Internal only."}
          >
            <div className="space-y-4">
              {draft.sections.map((section, i) => (
                <div key={section.heading}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="type-label">{section.heading}</p>
                    {draft.status === "draft" ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (editing === i) {
                            saveSection(i, editedBody);
                            setEditing(null);
                          } else {
                            setEditedBody(section.body);
                            setEditing(i);
                          }
                        }}
                        className="inline-flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary"
                      >
                        <Pencil aria-hidden className="size-3" />
                        {editing === i ? "Done" : "Edit"}
                      </button>
                    ) : null}
                  </div>
                  {editing === i ? (
                    <Textarea
                      aria-label={`Edit ${section.heading}`}
                      className="mt-1 min-h-32 font-sans text-sm"
                      value={editedBody}
                      onChange={(e) => setEditedBody(e.target.value)}
                      onBlur={() => saveSection(i, editedBody)}
                    />
                  ) : (
                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">
                      {section.body}
                    </p>
                  )}
                  {section.citations?.length ? (
                    <div className="mt-2">
                      <CitationList citations={section.citations} heading="Basis for this passage" />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="All sources behind this draft">
            <CitationList citations={allCitations} heading="Cited passages" />
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel tourId="drafts.review-open-points" title="Before you approve">
            <ConfidenceBadge confidence={draft.confidence} withExplanation />
            <div className="mt-3">
              <CaveatList caveats={draft.openQuestions} />
            </div>
          </Panel>

          <Panel tourId="drafts.review-decision" title="Decision">
            {draft.status !== "draft" ? (
              <p className="text-sm text-text-secondary">
                This draft has been decided. Reopen the request to prepare a new version.
              </p>
            ) : (
              <div className="space-y-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="w-full" disabled={!actor.canApprove}>
                      <Check aria-hidden className="size-4" />
                      Approve and send
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Send this message to the client?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will send the reply to {draft.recipient}. Sending is mocked in this
                        demonstration workspace — no email leaves the system. The approval is
                        recorded against your name in the activity trail.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() =>
                          updateDraftStatus.mutate({
                            draftId: draft.id,
                            status: "approved",
                            actorUserId: actor.id,
                            actorName: actor.name,
                            note: `Approved and sent "${draft.subject}" to ${draft.recipient}.`,
                          })
                        }
                      >
                        Approve and send
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button
                  variant="outline"
                  className="w-full"
                  disabled={updateDraftStatus.isPending}
                  onClick={() =>
                    updateDraftStatus.mutate({
                      draftId: draft.id,
                      status: "rejected",
                      actorUserId: actor.id,
                      actorName: actor.name,
                      note: `Rejected "${draft.subject}". The case remains open.`,
                    })
                  }
                >
                  <X aria-hidden className="size-4" />
                  Reject
                </Button>
              </div>
            )}
          </Panel>

          <Panel title="Hand off to the practice system">
            <p className="text-sm text-text-secondary">
              Copies the case summary and the final text to the clipboard so it can be filed in the
              firm&rsquo;s practice system. A direct integration is not implemented in this
              prototype.
            </p>
            <Button
              variant="outline"
              className="mt-3 w-full"
              onClick={async () => {
                const text = [
                  draft.subject,
                  "",
                  ...draft.sections.map((s) => s.body),
                ].join("\n");
                try {
                  await navigator.clipboard.writeText(text);
                  setCopied(true);
                } catch {
                  setCopied(false);
                }
              }}
            >
              <Copy aria-hidden className="size-4" />
              Copy for the practice system
            </Button>
            {copied ? (
              <p role="status" className="mt-2 text-xs text-status-success">
                Copied to the clipboard.
              </p>
            ) : null}
            <p className="mt-2 text-xs text-text-tertiary">Mocked integration</p>
          </Panel>
        </div>
      </div>
    </div>
  );
}