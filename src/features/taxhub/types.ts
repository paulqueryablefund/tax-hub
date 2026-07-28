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
  effectiveFrom: string;
  lastReviewed: string;
  health: SourceHealth;
  visibility: "all_staff" | "professionals_only" | "partners_only";
  passages: SourcePassage[];
  supersededByIds?: string[];
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