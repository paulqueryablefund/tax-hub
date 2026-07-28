import { createFileRoute, Link } from "@tanstack/react-router";
import { Upload } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  FictionalBadge,
  PageHeader,
  Panel,
  SourceHealthBadge,
  formatDate,
} from "@/features/taxhub/components/primitives";
import { useTaxhub, useTaxhubActions } from "@/features/taxhub/use-taxhub";
import type { SourceKind } from "@/features/taxhub/types";

const kindLabels: Record<SourceKind, string> = {
  official_regulation: "Statute",
  official_guidance: "Official guidance",
  official_form: "Form or template",
  firm_policy: "Firm policy",
  firm_template: "Firm template",
  client_document: "Client document",
};

const visibilityLabels = {
  all_staff: "All staff",
  professionals_only: "Professionals only",
  partners_only: "Partners only",
};

export const Route = createFileRoute("/sources/")({
  head: () => ({
    meta: [
      { title: "Sources — TaxHub" },
      {
        name: "description",
        content:
          "The documents the assistant is allowed to answer from, with visibility, review dates and superseded versions.",
      },
      { property: "og:title", content: "Sources — TaxHub" },
      {
        property: "og:description",
        content: "The documents the assistant may answer from, with review dates and versions.",
      },
    ],
  }),
  component: SourceLibrary,
});

function SourceLibrary() {
  const { sources } = useTaxhub();
  const attention = sources.filter((s) => s.health !== "current");

  return (
    <div className="space-y-6">
      <PageHeader
        tourId="sources.header"
        title="Sources"
        description="The assistant answers from these documents and nothing else. A document that is superseded is kept for the audit trail but excluded from answers."
        actions={<AddSourceDialog />}
      />

      {attention.length > 0 ? (
        <div className="rounded-md border border-source-stale/30 bg-source-stale-bg px-4 py-3">
          <p className="text-sm text-source-stale">
            <span className="font-medium">{attention.length} sources need attention.</span> Answers
            that rely on them are marked accordingly.
          </p>
        </div>
      ) : null}

      <div
        data-tour="sources.list"
        className="overflow-x-auto rounded-md border border-border-default bg-surface"
      >
        <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
          <caption className="sr-only">Source library</caption>
          <thead>
            <tr className="border-b border-border-default bg-subtle">
              <th scope="col" className="type-label px-4 py-2.5">
                Document
              </th>
              <th scope="col" className="type-label px-4 py-2.5">
                Type
              </th>
              <th scope="col" className="type-label px-4 py-2.5">
                Visibility
              </th>
              <th scope="col" className="type-label px-4 py-2.5">
                Last reviewed
              </th>
              <th scope="col" className="type-label px-4 py-2.5">
                State
              </th>
            </tr>
          </thead>
          <tbody>
            {sources.map((source, rowIndex) => (
              <tr
                key={source.id}
                className="border-b border-border-subtle last:border-0 hover:bg-subtle"
              >
                <td className="px-4 py-3 align-top">
                  <Link
                    to="/sources/$sourceId"
                    params={{ sourceId: source.id }}
                    className="font-medium hover:underline"
                  >
                    {source.title}
                  </Link>
                  <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                    {source.publisher}
                    {source.isFictional ? (
                      <span data-tour="sources.fictional">
                        <FictionalBadge />
                      </span>
                    ) : null}
                  </p>
                </td>
                <td className="px-4 py-3 align-top">{kindLabels[source.kind]}</td>
                <td className="px-4 py-3 align-top">{visibilityLabels[source.visibility]}</td>
                <td className="type-data px-4 py-3 align-top">{formatDate(source.lastReviewed)}</td>
                <td
                  className="px-4 py-3 align-top"
                  data-tour={rowIndex === 0 ? "sources.health" : undefined}
                >
                  <SourceHealthBadge health={source.health} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Panel title="What is not in this library">
        <p className="text-sm text-text-secondary">
          Client files, fee schedules and engagement letters have not been added. The assistant will
          decline questions on those topics rather than infer an answer — see the Knowledge screen
          for how a declined question looks.
        </p>
      </Panel>
    </div>
  );
}

function AddSourceDialog() {
  const { currentUser } = useTaxhub();
  const { logActivity } = useTaxhubActions();
  const [name, setName] = useState("");
  const [done, setDone] = useState(false);
  const actor = currentUser;

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          setName("");
          setDone(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Upload aria-hidden className="size-4" />
          Add a source
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a source</DialogTitle>
          <DialogDescription>
            In this demonstration workspace, file upload and indexing are mocked. Recording a source
            here writes an entry to the activity trail so you can see how ingestion is audited.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <label htmlFor="source-name" className="text-sm font-medium">
            Document name
          </label>
          <Input
            id="source-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Kanzlei-Handbuch 5.2 — Umsatzsteuer-Voranmeldung"
          />
          {done ? (
            <p role="status" className="text-xs text-status-success">
              Recorded in the activity trail. Indexing is not implemented in this prototype.
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button
            disabled={!name.trim() || done}
            onClick={() => {
              setDone(true);
              logActivity.mutate({
                actor: "user",
                actorName: actor.name,
                action: "Source submitted for indexing",
                detail: `"${name}" submitted. Indexing is mocked in this prototype.`,
              });
            }}
          >
            Record source
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}