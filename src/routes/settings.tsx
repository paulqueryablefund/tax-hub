import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { KeyValue, PageHeader, Panel } from "@/features/taxhub/components/primitives";
import { RoleSwitcher } from "@/features/taxhub/components/role-switcher";
import { useAnnounce } from "@/features/taxhub/components/announcer";
import { MICROCOPY } from "@/features/taxhub/tour/tour-content";
import { useTour } from "@/features/taxhub/tour/tour-provider";
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
  const { users, workspace, currentUser } = useTaxhub();
  const { resetDemonstration } = useTaxhubActions();
  const announce = useAnnounce();
  const tour = useTour();

  return (
    <div className="space-y-6">
      <PageHeader
        tourId="settings.header"
        title="Settings"
        description="Who may approve what, and which systems this workspace talks to."
      />

      <Panel tourId="settings.session" title="Workspace">
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
        title="Signed-in user (demonstration control)"
        description="Switch between a preparer and an approver to see both halves of the approval gate."
      >
        <RoleSwitcher />
        <p className="mt-3 text-sm text-text-secondary">
          {currentUser.name} may{" "}
          {currentUser.canApprove
            ? "approve and send outgoing correspondence — subject to the evidence gate, which blocks a reply that rests on an unevidenced figure."
            : "prepare and edit, but not approve. An approval attempt is refused by the server."}
        </p>
      </Panel>

      <Panel
        tourId="settings.rights"
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

      <Panel
        tourId="settings.integrations"
        title="Integrations"
        description="Nothing below is connected in this prototype."
      >
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

      <Panel tourId="settings.reset" title="Demonstration">
        <p className="text-sm text-text-secondary">
          Reset the workspace to its starting state before a demonstration. Approvals, edits and
          activity entries you created are discarded.
        </p>
        <Button
          variant="outline"
          className="mt-3"
          disabled={resetDemonstration.isPending}
          onClick={() =>
            resetDemonstration.mutate(undefined, {
              onSuccess: () => {
                const message = "Demonstration data reset. The workspace is back to its starting state.";
                toast.success(message);
                announce(message);
              },
              onError: (error) => {
                toast.error(`Reset failed: ${error.message}`);
                announce(`Reset failed: ${error.message}`);
              },
            })
          }
        >
          {resetDemonstration.isPending ? "Resetting…" : "Reset demonstration data"}
        </Button>
        {resetDemonstration.isSuccess ? (
          <p role="status" className="mt-2 text-xs text-status-success">
            Workspace restored to its starting state.
          </p>
        ) : null}
      </Panel>

      <Panel tourId="settings.tour-controls" title="Guided help">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="guided-help" className="text-sm font-medium">
            {MICROCOPY.globalToggle}
          </Label>
          <Switch
            id="guided-help"
            checked={tour.hydrated ? !tour.state.globalOff : true}
            onCheckedChange={(checked) => tour.setGlobalOff(!checked)}
          />
        </div>
        <p className="mt-2 text-xs text-text-secondary">{MICROCOPY.globalOffHelp}</p>
        <Button asChild variant="outline" className="mt-3">
          <Link to="/tour">{MICROCOPY.navLabel}</Link>
        </Button>
      </Panel>
    </div>
  );
}