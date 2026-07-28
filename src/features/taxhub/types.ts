export type RequestStatus =
  | "new"
  | "intake"
  | "awaiting_client"
  | "ready_for_review"
  | "approved"
  | "closed";

export type RequestChannel = "email" | "phone" | "portal" | "chat";

export type Confidence = "high" | "medium" | "low" | "insufficient";

export type RequestCategory =
  | "missing_documents"
  | "company_car"
  | "payroll_change"
  | "deadline_extension"
  | "e_invoicing"
  | "vat_question"
  | "new_client_onboarding"
  | "invoice_query";

export interface Client {
  id: string;
  /** Mandantennummer — the number staff actually search by. */
  mandantNumber: string;
  name: string;
  legalForm: string;
  city: string;
  contactName: string;
  contactEmail: string;
  responsibleUserId: string;
  fiscalYearEnd: string;
  services: string[];
}

export interface User {
  id: string;
  name: string;
  initials: string;
  role: "Partner" | "Steuerberater" | "Steuerfachangestellte" | "Office Manager";
  canApprove: boolean;
}

export type SourceKind =
  | "official_regulation"
  | "official_guidance"
  | "official_form"
  | "firm_policy"
  | "firm_template"
  | "client_document";

export type SourceHealth = "current" | "review_due" | "outdated" | "conflicting";

export type SourceRelationKind =
  | "superseded_by"
  | "supersedes"
  | "modified_by"
  | "transitional_rule"
  | "conflicts_with"
  | "depends_on";

/** A stated relationship to another document, in the direction the corpus states it. */
export interface SourceRelation {
  relation: SourceRelationKind;
  /** Set when the other document is in the library. */
  targetSourceId?: string;
  /** Set instead when the other document is outside the library. */
  targetLabel?: string;
  scope?: string;
  effectiveNote?: string;
}

export interface SourcePassage {
  id: string;
  locator: string;
  text: string;
}

export interface Source {
  id: string;
  title: string;
  shortTitle: string;
  kind: SourceKind;
  publisher: string;
  url?: string;
  /** True only for material that is public and legally accessible. */
  isPublic: boolean;
  /** Explicitly flags the invented firm material used for the demo. */
  isFictional: boolean;
  /** Null when the source itself states no in-force date. Never guessed. */
  effectiveFrom: string | null;
  lastReviewed: string;
  health: SourceHealth;
  visibility: "all_staff" | "professionals_only" | "partners_only";
  passages: SourcePassage[];
  supersededByIds?: string[];
  relations: SourceRelation[];
  note?: string;
}

export interface Citation {
  sourceId: string;
  passageId: string;
  /** Why the retrieval layer selected this passage. */
  reason: string;
}

export interface IntakeField {
  id: string;
  label: string;
  help: string;
  type: "text" | "date" | "number" | "select" | "file" | "boolean";
  options?: string[];
  required: boolean;
  /** Which source establishes that this fact is needed at all. */
  requiredBy?: Citation;
  value?: string;
  status: "provided" | "missing" | "uncertain";
}

export interface AnswerBlock {
  id: string;
  question: string;
  answer: string;
  confidence: Confidence;
  citations: Citation[];
  caveats: string[];
  conflicts?: { note: string; citations: Citation[] };
}

export interface DraftSection {
  heading: string;
  body: string;
  citations?: Citation[];
}

export interface Draft {
  id: string;
  requestId: string;
  kind: "client_reply" | "internal_note" | "case_summary";
  title: string;
  recipient: string;
  subject: string;
  sections: DraftSection[];
  /** Whether sending leaves the firm — always requires approval. */
  isExternal: boolean;
  confidence: Confidence;
  openQuestions: string[];
  status: "draft" | "approved" | "sent" | "rejected";
  generatedAt: string;
}

export interface RequestRecord {
  id: string;
  reference: string;
  clientId: string;
  channel: RequestChannel;
  receivedAt: string;
  subject: string;
  body: string;
  category: RequestCategory;
  categoryConfidence: Confidence;
  status: RequestStatus;
  assignedUserId: string;
  dueDate?: string;
  summary: string;
  intake: IntakeField[];
  answers: AnswerBlock[];
  draftId?: string;
  escalation?: { reason: string; toUserId: string; at: string };
}

export type ActivityActor = "assistant" | "user" | "system";

export interface ActivityEvent {
  id: string;
  at: string;
  actor: ActivityActor;
  actorName: string;
  action: string;
  detail: string;
  requestId?: string;
  sourceIds?: string[];
  /** Set when the event records a human decision on AI output. */
  decision?: "approved" | "rejected" | "corrected" | "escalated";
}

export interface Workspace {
  id: string;
  firmName: string;
  shortName: string;
  city: string;
  headcount: number;
  practiceSystem: string;
  isFictional: boolean;
}

export interface KnowledgeEntry {
  id: string;
  prompt: string;
  /** Shown as a suggested question in the empty state. */
  suggested: boolean;
  answer: AnswerBlock;
  /** Passages the retrieval step looked at, including rejected ones. */
  retrieved: { sourceId: string; passageId: string; used: boolean; note: string }[];
}

/**
 * Intake counters, derived in the database rather than stored, so a count can
 * never drift from the rows it describes.
 */
export interface RequestOverview {
  requestId: string;
  total: number;
  provided: number;
  missing: number;
  uncertain: number;
  readiness: "no_intake" | "incomplete" | "complete";
}

export interface TaxhubSnapshot {
  workspace: Workspace;
  users: User[];
  currentUserId: string;
  clients: Client[];
  sources: Source[];
  requests: RequestRecord[];
  drafts: Draft[];
  knowledge: KnowledgeEntry[];
  activity: ActivityEvent[];
  overview: Record<string, RequestOverview>;
}
/* ------------------------------------------------------------------ *
 * Live retrieval over the corpus
 * ------------------------------------------------------------------ */

/** One passage as the retrieval function returned it, kept or rejected. */
export interface RetrievedPassage {
  sourceId: string;
  passageId: string;
  locator: string;
  text: string;
  sourceTitle: string;
  url?: string;
  /** Rank inside each arm. 0 means the arm did not return this passage. */
  ranks: { fts: number; trgm: number; anchor: number };
  /** Reciprocal-rank-fusion score across the three arms. */
  score: number;
  used: boolean;
  /** Set only when the passage was retrieved and then filtered out. */
  exclusionReason?: string;
  /** P1..Pn — the label the model saw. Only kept passages carry one. */
  label?: string;
}

/** A single English term and the German terms it was expanded into. */
export interface ExpandedTerm {
  termEn: string;
  termsDe: string[];
  tier: 1 | 2;
}

export interface QueryExpansion {
  detectedLanguage: "en" | "de";
  originalQuery: string;
  /** What was actually handed to the retrieval function. */
  searchQuery: string;
  terms: ExpandedTerm[];
  tier2Used: boolean;
  tier2FromCache: boolean;
  note: string;
}

export interface KnowledgeRefusal {
  reason: string;
  /** Named so the user can see exactly what was searched and came back empty. */
  searched: string;
}

export interface KnowledgeResult {
  lane: "live_retrieval";
  question: string;
  expansion: QueryExpansion;
  retrieved: RetrievedPassage[];
  answer: AnswerBlock | null;
  refusal?: KnowledgeRefusal;
  /** The pinned model id that produced the sentences, recorded on every answer. */
  modelId: string;
  /** Sentences the server threw away because they cited a passage never supplied. */
  droppedSentences: number;
}
