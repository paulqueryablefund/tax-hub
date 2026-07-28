import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type {
  ActivityEvent,
  AnswerBlock,
  Citation,
  Client,
  Draft,
  DraftSection,
  IntakeField,
  KnowledgeEntry,
  RequestOverview,
  RequestRecord,
  Source,
  SourceRelation,
  TaxhubSnapshot,
  User,
  Workspace,
} from "../types";

type Db = SupabaseClient<Database>;

function unwrap<T>(result: { data: T | null; error: { message: string } | null }, label: string): T {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  if (!result.data) throw new Error(`${label}: no rows returned`);
  return result.data;
}

/**
 * Reads the demo workspace in one pass and rebuilds the object graph the UI
 * works with. Counts are never stored — they come from the request_overview
 * view, which derives them from the intake rows themselves.
 */
export async function buildSnapshot(db: Db): Promise<TaxhubSnapshot> {
  const [
    workspaceRows,
    userRows,
    clientRows,
    sourceRows,
    passageRows,
    supersessionRows,
    requestRows,
    intakeRows,
    answerRows,
    citationRows,
    knowledgeRows,
    retrievalRows,
    draftRows,
    sectionRows,
    sectionCitationRows,
    eventRows,
    eventSourceRows,
    overviewRows,
  ] = await Promise.all([
    db.from("workspaces").select("*").then((r) => unwrap(r, "workspaces")),
    db.from("app_users").select("*").order("position").then((r) => unwrap(r, "app_users")),
    db.from("clients").select("*").order("position").then((r) => unwrap(r, "clients")),
    db.from("sources").select("*").order("position").then((r) => unwrap(r, "sources")),
    db
      .from("source_passages")
      .select("*")
      .order("position")
      .then((r) => unwrap(r, "source_passages")),
    db.from("source_supersessions").select("*").then((r) => unwrap(r, "source_supersessions")),
    db
      .from("requests")
      .select("*")
      .order("received_at", { ascending: false })
      .then((r) => unwrap(r, "requests")),
    db.from("intake_fields").select("*").order("position").then((r) => unwrap(r, "intake_fields")),
    db.from("answers").select("*").order("position").then((r) => unwrap(r, "answers")),
    db
      .from("answer_citations")
      .select("*")
      .order("position")
      .then((r) => unwrap(r, "answer_citations")),
    db
      .from("knowledge_entries")
      .select("*")
      .order("position")
      .then((r) => unwrap(r, "knowledge_entries")),
    db
      .from("knowledge_retrievals")
      .select("*")
      .order("position")
      .then((r) => unwrap(r, "knowledge_retrievals")),
    db.from("drafts").select("*").order("generated_at").then((r) => unwrap(r, "drafts")),
    db.from("draft_sections").select("*").order("position").then((r) => unwrap(r, "draft_sections")),
    db
      .from("draft_section_citations")
      .select("*")
      .order("position")
      .then((r) => unwrap(r, "draft_section_citations")),
    db
      .from("activity_events")
      .select("*")
      .order("at", { ascending: false })
      .then((r) => unwrap(r, "activity_events")),
    db
      .from("activity_event_sources")
      .select("*")
      .order("position")
      .then((r) => unwrap(r, "activity_event_sources")),
    db.from("request_overview").select("*").then((r) => unwrap(r, "request_overview")),
  ]);

  const workspaceRow = workspaceRows[0];
  if (!workspaceRow) throw new Error("No workspace configured");

  const workspace: Workspace = {
    id: workspaceRow.id,
    firmName: workspaceRow.firm_name,
    shortName: workspaceRow.short_name,
    city: workspaceRow.city,
    headcount: workspaceRow.headcount,
    practiceSystem: workspaceRow.practice_system,
    isFictional: workspaceRow.is_fictional,
  };

  const users: User[] = userRows.map((u) => ({
    id: u.id,
    name: u.name,
    initials: u.initials,
    role: u.role as User["role"],
    canApprove: u.can_approve,
  }));

  const currentUserId = userRows.find((u) => u.is_current_user)?.id ?? users[0]?.id ?? "";

  const clients: Client[] = clientRows.map((c) => ({
    id: c.id,
    mandantNumber: c.mandant_number,
    name: c.name,
    legalForm: c.legal_form,
    city: c.city,
    contactName: c.contact_name,
    contactEmail: c.contact_email,
    responsibleUserId: c.responsible_user_id,
    fiscalYearEnd: c.fiscal_year_end,
    services: c.services,
  }));

  const sources: Source[] = sourceRows.map((s) => ({
    id: s.id,
    title: s.title,
    shortTitle: s.short_title,
    kind: s.kind as Source["kind"],
    publisher: s.publisher,
    url: s.url ?? undefined,
    isPublic: s.is_public,
    isFictional: s.is_fictional,
    effectiveFrom: s.effective_from,
    lastReviewed: s.last_reviewed,
    health: s.health as Source["health"],
    visibility: s.visibility as Source["visibility"],
    note: s.note ?? undefined,
    supersededByIds: supersessionRows
      .filter(
        (x): x is typeof x & { superseded_by_id: string } =>
          x.source_id === s.id && x.relation === "superseded_by" && x.superseded_by_id !== null,
      )
      .map((x) => x.superseded_by_id),
    relations: supersessionRows
      .filter((x) => x.source_id === s.id)
      .map((x) => ({
        relation: x.relation as SourceRelation["relation"],
        targetSourceId: x.superseded_by_id ?? undefined,
        targetLabel: x.target_label ?? undefined,
        scope: x.scope ?? undefined,
        effectiveNote: x.effective_note ?? undefined,
      })),
    passages: passageRows
      .filter((p) => p.source_id === s.id)
      .map((p) => ({ id: p.passage_id, locator: p.locator, text: p.text })),
  }));

  const citationsFor = (answerId: string, conflict: boolean): Citation[] =>
    citationRows
      .filter((c) => c.answer_id === answerId && c.is_conflict === conflict)
      .map((c) => ({ sourceId: c.source_id, passageId: c.passage_id, reason: c.reason }));

  const answerById = new Map<string, AnswerBlock>();
  for (const a of answerRows) {
    const conflictCitations = citationsFor(a.id, true);
    answerById.set(a.id, {
      id: a.id,
      question: a.question,
      answer: a.answer,
      confidence: a.confidence as AnswerBlock["confidence"],
      caveats: a.caveats,
      citations: citationsFor(a.id, false),
      conflicts: a.conflict_note
        ? { note: a.conflict_note, citations: conflictCitations }
        : undefined,
    });
  }

  const requests: RequestRecord[] = requestRows.map((r) => ({
    id: r.id,
    reference: r.reference,
    clientId: r.client_id,
    channel: r.channel as RequestRecord["channel"],
    receivedAt: r.received_at,
    subject: r.subject,
    body: r.body,
    category: r.category as RequestRecord["category"],
    categoryConfidence: r.category_confidence as RequestRecord["categoryConfidence"],
    // Derived in the request_overview view from live intake and draft state.
    // The stored lifecycle_status is only consulted there for the two
    // human-set states (closed, awaiting_client) that no query can reconstruct.
    status: (overviewRows.find((o) => o.request_id === r.id)?.status ??
      r.lifecycle_status) as RequestRecord["status"],
    assignedUserId: r.assigned_user_id,
    dueDate: r.due_date ?? undefined,
    summary: r.narrative_summary,
    escalation:
      r.escalation_reason && r.escalation_to_user_id && r.escalation_at
        ? { reason: r.escalation_reason, toUserId: r.escalation_to_user_id, at: r.escalation_at }
        : undefined,
    intake: intakeRows
      .filter((f) => f.request_id === r.id)
      .map(
        (f): IntakeField => ({
          id: f.id,
          label: f.label,
          help: f.help,
          type: f.type as IntakeField["type"],
          options: f.options ?? undefined,
          required: f.required,
          value: f.value ?? undefined,
          status: f.status as IntakeField["status"],
          requiredBy:
            f.required_by_source_id && f.required_by_passage_id
              ? {
                  sourceId: f.required_by_source_id,
                  passageId: f.required_by_passage_id,
                  reason: f.required_by_reason ?? "",
                }
              : undefined,
        }),
      ),
    answers: answerRows
      .filter((a) => a.request_id === r.id)
      .map((a) => answerById.get(a.id)!)
      .filter(Boolean),
    draftId: draftRows.find((d) => d.request_id === r.id)?.id,
  }));

  const drafts: Draft[] = draftRows.map((d) => ({
    id: d.id,
    requestId: d.request_id,
    kind: d.kind as Draft["kind"],
    title: d.title,
    recipient: d.recipient,
    subject: d.subject,
    isExternal: d.is_external,
    confidence: d.confidence as Draft["confidence"],
    openQuestions: d.open_questions,
    status: d.status as Draft["status"],
    generatedAt: d.generated_at,
    sections: sectionRows
      .filter((s) => s.draft_id === d.id)
      .map(
        (s): DraftSection => ({
          heading: s.heading,
          body: s.body,
          citations: sectionCitationRows
            .filter((c) => c.draft_id === d.id && c.section_position === s.position)
            .map((c) => ({ sourceId: c.source_id, passageId: c.passage_id, reason: c.reason })),
        }),
      ),
  }));

  const knowledge: KnowledgeEntry[] = knowledgeRows.map((k) => ({
    id: k.id,
    prompt: k.prompt,
    suggested: k.suggested,
    answer: answerById.get(k.answer_id)!,
    retrieved: retrievalRows
      .filter((x) => x.knowledge_entry_id === k.id)
      .map((x) => ({
        sourceId: x.source_id,
        passageId: x.passage_id,
        used: x.used,
        note: x.note,
      })),
  }));

  const activity: ActivityEvent[] = eventRows.map((e) => ({
    id: e.id,
    at: e.at,
    actor: e.actor as ActivityEvent["actor"],
    actorName: e.actor_name,
    action: e.action,
    detail: e.detail,
    requestId: e.request_id ?? undefined,
    decision: (e.decision as ActivityEvent["decision"]) ?? undefined,
    sourceIds: eventSourceRows.filter((s) => s.event_id === e.id).map((s) => s.source_id),
  }));

  const overview: Record<string, RequestOverview> = {};
  for (const row of overviewRows) {
    if (!row.request_id) continue;
    overview[row.request_id] = {
      requestId: row.request_id,
      total: row.intake_total ?? 0,
      provided: row.intake_provided ?? 0,
      missing: row.intake_missing ?? 0,
      uncertain: row.intake_uncertain ?? 0,
      readiness: (row.intake_readiness ?? "no_intake") as RequestOverview["readiness"],
    };
  }

  return {
    workspace,
    users,
    currentUserId,
    clients,
    sources,
    requests,
    drafts,
    knowledge,
    activity,
    overview,
  };
}