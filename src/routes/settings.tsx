import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { KeyValue, PageHeader, Panel } from "@/features/taxhub/components/primitives";
import { useTaxhub, useTaxhubActions } from "@/features/taxhub/use-taxhub";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — TaxHub" },
      {
        name: "description",
        content:
          "Workspace details, who may approve outgoing correspondence, and the state of practice-system integrations.",
      },
      { property: "og:title", content: "Settings — TaxHub" },
      {
        property: "og:description",
        content: "Workspace details, approval rights and integration status.",
      },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { users, workspace } = useTaxhub();
  const { resetDemonstration } = useTaxhubActions();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Who may approve what, and which systems this workspace talks to."
      />

      <Panel title="Workspace">
        <KeyValue
          items={[
            { label: "Firm", value: workspace.firmName },
            { label: "Location", value: workspace.city },
            { label: "Staff", value: String(workspace.headcount) },
            { label: "Practice system", value: workspace.practiceSystem },
          ]}
        />
        <p className="mt-4 text-xs text-text-tertiary">
          Fictional firm used for this demonstration.
        </p>
      </Panel>

      <Panel
        title="Approval rights"
        description="Only these roles may release correspondence to a client."
      >
        <ul className="divide-y divide-border-subtle">
          {users.map((user) => (
            <li key={user.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
              <span>
                <span className="font-medium">{user.name}</span>
                <span className="block text-xs text-text-secondary">{user.role}</span>
              </span>
              <span
                className={
                  user.canApprove
                    ? "rounded-sm bg-status-success-bg px-2 py-0.5 text-xs font-medium text-status-success"
                    : "rounded-sm bg-status-neutral-bg px-2 py-0.5 text-xs font-medium text-status-neutral"
                }
              >
                {user.canApprove ? "May approve and send" : "May prepare only"}
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Integrations" description="Nothing below is connected in this prototype.">
        <ul className="space-y-2 text-sm">
          {[
            ["Practice system export", "Copy to clipboard only. No direct connection."],
            ["Email intake", "Requests are seeded, not fetched from a mailbox."],
            ["Telephone reception", "Call records are seeded transcripts."],
            ["Document indexing", "Passages are pre-indexed. Upload is recorded but not processed."],
          ].map(([name, note]) => (
            <li
              key={name}
              className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-border-subtle px-3 py-2"
            >
              <span>
                <span className="font-medium">{name}</span>
                <span className="block text-xs text-text-secondary">{note}</span>
              </span>
              <span className="rounded-sm border border-dashed border-border-strong px-2 py-0.5 text-xs text-text-tertiary">
                Mocked
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Demonstration">
        <p className="text-sm text-text-secondary">
          Reset the workspace to its starting state before a demonstration. Approvals, edits and
          activity entries you created are discarded.
        </p>
        <Button
          variant="outline"
          className="mt-3"
          disabled={resetDemonstration.isPending}
          onClick={() => resetDemonstration.mutate()}
        >
          {resetDemonstration.isPending ? "Resetting…" : "Reset demonstration data"}
        </Button>
        {resetDemonstration.isSuccess ? (
          <p role="status" className="mt-2 text-xs text-status-success">
            Workspace restored to its starting state.
          </p>
        ) : null}
      </Panel>
    </div>
  );
}