import { createFileRoute, Link } from "@tanstack/react-router";
import { FileSignature } from "lucide-react";
import {
  ConfidenceBadge,
  EmptyState,
  PageHeader,
  formatDateTime,
} from "@/features/taxhub/components/primitives";
import { useTaxhubState } from "@/features/taxhub/store";

export const Route = createFileRoute("/drafts/")({
  head: () => ({
    meta: [
      { title: "Drafts — TaxHub" },
      {
        name: "description",
        content:
          "Prepared replies waiting for a professional's approval. Nothing reaches a client without a signature.",
      },
      { property: "og:title", content: "Drafts — TaxHub" },
      {
        property: "og:description",
        content: "Prepared replies waiting for approval. Nothing reaches a client unsigned.",
      },
    ],
  }),
  component: DraftList,
});

const statusLabels = {
  draft: "Awaiting approval",
  approved: "Approved and sent",
  sent: "Sent",
  rejected: "Rejected",
};

function DraftList() {
  const { drafts } = useTaxhubState();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Drafts"
        description="The first useful output for each case. Every external message is held here until someone with signing authority approves it."
      />

      {drafts.length === 0 ? (
        <EmptyState
          icon={FileSignature}
          title="No drafts prepared"
          description="Drafts appear once a case has enough information for a first useful output."
        />
      ) : (
        <ul className="space-y-3">
          {drafts.map((draft) => (
            <li
              key={draft.id}
              className="rounded-md border border-border-default bg-surface px-4 py-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    to="/drafts/$draftId"
                    params={{ draftId: draft.id }}
                    className="font-medium hover:underline"
                  >
                    {draft.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    To {draft.recipient} · prepared {formatDateTime(draft.generatedAt)}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {statusLabels[draft.status]}
                    {draft.isExternal ? " · leaves the firm" : " · internal only"}
                  </p>
                </div>
                <ConfidenceBadge confidence={draft.confidence} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}