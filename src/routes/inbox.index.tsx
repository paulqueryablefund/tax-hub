import { createFileRoute, Link } from "@tanstack/react-router";
import { Inbox as InboxIcon } from "lucide-react";
import { useState } from "react";
import {
  EmptyState,
  PageHeader,
  StatusBadge,
  formatDateTime,
} from "@/features/taxhub/components/primitives";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTaxhub } from "@/features/taxhub/use-taxhub";
import type { RequestStatus } from "@/features/taxhub/types";

const categoryLabels: Record<string, string> = {
  missing_documents: "Missing documents",
  company_car: "Company car / benefit in kind",
  payroll_change: "Payroll change",
  deadline_extension: "Filing extension",
  e_invoicing: "E-invoicing",
  vat_question: "VAT",
  new_client_onboarding: "Onboarding",
  invoice_query: "Fee query",
};

const channelLabels: Record<string, string> = {
  email: "Email",
  phone: "Phone",
  portal: "Portal",
  chat: "Chat",
};

export const Route = createFileRoute("/inbox/")({
  head: () => ({
    meta: [
      { title: "Requests — Werk Flow" },
      {
        name: "description",
        content:
          "Every client request from email, phone and the client portal, classified and triaged in one list.",
      },
      { property: "og:title", content: "Requests — Werk Flow" },
      {
        property: "og:description",
        content: "Client requests from every channel, classified and triaged in one list.",
      },
    ],
  }),
  component: RequestInbox,
});

function RequestInbox() {
  const { requests, clientById, userById, overviewFor } = useTaxhub();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<RequestStatus | "all">("all");

  const filtered = requests.filter((r) => {
    const client = clientById(r.clientId);
    const haystack = `${r.subject} ${r.reference} ${client?.name} ${client?.mandantNumber}`.toLowerCase();
    return (
      haystack.includes(query.toLowerCase()) && (status === "all" || r.status === status)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        tourId="inbox.header"
        title="Requests"
        description="Everything that came in by email, telephone or the client portal, matched to a Mandant and classified."
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="request-search" className="sr-only">
            Search requests by subject, reference or Mandant number
          </label>
          <Input
            id="request-search"
            data-tour="inbox.search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search subject, reference or Mandant number"
          />
        </div>
        <div className="sm:w-56">
          <label htmlFor="request-status" className="sr-only">
            Filter by status
          </label>
          <Select value={status} onValueChange={(v) => setStatus(v as RequestStatus | "all")}>
            <SelectTrigger id="request-status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="intake">Intake running</SelectItem>
              <SelectItem value="awaiting_client">Awaiting client</SelectItem>
              <SelectItem value="ready_for_review">Review required</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={InboxIcon}
          title="No requests match this filter"
          description="Clear the search box or choose a different status to see the rest of the inbox."
        />
      ) : (
        <div
          data-tour="inbox.list"
          className="overflow-x-auto rounded-md border border-border-default bg-surface"
        >
          <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
            <caption className="sr-only">Client requests, newest first</caption>
            <thead>
              <tr className="border-b border-border-default bg-subtle">
                <th scope="col" className="type-label px-4 py-2.5">
                  Request
                </th>
                <th scope="col" className="type-label px-4 py-2.5">
                  Client
                </th>
                <th scope="col" className="type-label px-4 py-2.5">
                  Classification
                </th>
                <th scope="col" className="type-label px-4 py-2.5">
                  Owner
                </th>
                <th scope="col" className="type-label px-4 py-2.5">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((request, rowIndex) => {
                const client = clientById(request.clientId);
                return (
                  <tr
                    key={request.id}
                    className="border-b border-border-subtle last:border-0 hover:bg-subtle"
                  >
                    <td className="px-4 py-3 align-top">
                      <Link
                        to="/inbox/$requestId"
                        params={{ requestId: request.id }}
                        className="font-medium hover:underline"
                      >
                        {request.subject}
                      </Link>
                      <p
                        data-tour={rowIndex === 0 ? "inbox.channel" : undefined}
                        className="type-data mt-0.5 text-text-tertiary"
                      >
                        {request.reference} · {channelLabels[request.channel]} ·{" "}
                        {formatDateTime(request.receivedAt)}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p>{client?.name}</p>
                      <p className="type-data text-text-tertiary">
                        Mandant {client?.mandantNumber}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p>{categoryLabels[request.category]}</p>
                      <p className="text-xs text-text-secondary">
                        Confidence: {request.categoryConfidence}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      {userById(request.assignedUserId)?.name}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <StatusBadge status={request.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}