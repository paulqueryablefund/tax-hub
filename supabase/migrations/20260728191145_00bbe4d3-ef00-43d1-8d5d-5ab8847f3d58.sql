
-- ============ core ============
CREATE TABLE public.workspaces (
  id text PRIMARY KEY,
  firm_name text NOT NULL,
  short_name text NOT NULL,
  city text NOT NULL,
  headcount integer NOT NULL,
  practice_system text NOT NULL,
  is_fictional boolean NOT NULL DEFAULT true
);

CREATE TABLE public.app_users (
  id text PRIMARY KEY,
  workspace_id text NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  initials text NOT NULL,
  role text NOT NULL CHECK (role IN ('Partner','Steuerberater','Steuerfachangestellte','Office Manager')),
  can_approve boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  is_current_user boolean NOT NULL DEFAULT false
);

CREATE TABLE public.clients (
  id text PRIMARY KEY,
  workspace_id text NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  mandant_number text NOT NULL,
  name text NOT NULL,
  legal_form text NOT NULL,
  city text NOT NULL,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  responsible_user_id text NOT NULL REFERENCES public.app_users(id),
  fiscal_year_end text NOT NULL,
  services text[] NOT NULL DEFAULT '{}',
  position integer NOT NULL DEFAULT 0
);

-- ============ source library ============
CREATE TABLE public.sources (
  id text PRIMARY KEY,
  workspace_id text NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title text NOT NULL,
  short_title text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('official_regulation','official_guidance','official_form','firm_policy','firm_template','client_document')),
  publisher text NOT NULL,
  url text,
  is_public boolean NOT NULL,
  is_fictional boolean NOT NULL,
  effective_from date NOT NULL,
  last_reviewed date NOT NULL,
  health text NOT NULL CHECK (health IN ('current','review_due','outdated','conflicting')),
  visibility text NOT NULL CHECK (visibility IN ('all_staff','professionals_only','partners_only')),
  note text,
  position integer NOT NULL DEFAULT 0
);

CREATE TABLE public.source_passages (
  source_id text NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
  passage_id text NOT NULL,
  locator text NOT NULL,
  text text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  PRIMARY KEY (source_id, passage_id)
);

CREATE TABLE public.source_supersessions (
  source_id text NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
  superseded_by_id text NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
  PRIMARY KEY (source_id, superseded_by_id),
  CHECK (source_id <> superseded_by_id)
);

-- ============ requests ============
CREATE TABLE public.requests (
  id text PRIMARY KEY,
  workspace_id text NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  reference text NOT NULL UNIQUE,
  client_id text NOT NULL REFERENCES public.clients(id),
  channel text NOT NULL CHECK (channel IN ('email','phone','portal','chat')),
  received_at timestamptz NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  category text NOT NULL CHECK (category IN ('missing_documents','company_car','payroll_change','deadline_extension','e_invoicing','vat_question','new_client_onboarding','invoice_query')),
  category_confidence text NOT NULL CHECK (category_confidence IN ('high','medium','low','insufficient')),
  lifecycle_status text NOT NULL CHECK (lifecycle_status IN ('new','intake','awaiting_client','ready_for_review','approved','closed')),
  assigned_user_id text NOT NULL REFERENCES public.app_users(id),
  due_date date,
  narrative_summary text NOT NULL,
  escalation_reason text,
  escalation_to_user_id text REFERENCES public.app_users(id),
  escalation_at timestamptz
);

CREATE TABLE public.intake_fields (
  id text NOT NULL,
  request_id text NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  label text NOT NULL,
  help text NOT NULL DEFAULT '',
  type text NOT NULL CHECK (type IN ('text','date','number','select','file','boolean')),
  options text[],
  required boolean NOT NULL DEFAULT true,
  value text,
  status text NOT NULL CHECK (status IN ('provided','missing','uncertain')),
  required_by_source_id text,
  required_by_passage_id text,
  required_by_reason text,
  PRIMARY KEY (request_id, id),
  FOREIGN KEY (required_by_source_id, required_by_passage_id)
    REFERENCES public.source_passages(source_id, passage_id),
  CHECK ((required_by_source_id IS NULL) = (required_by_passage_id IS NULL))
);

CREATE TABLE public.answers (
  id text PRIMARY KEY,
  request_id text REFERENCES public.requests(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  question text NOT NULL,
  answer text NOT NULL,
  confidence text NOT NULL CHECK (confidence IN ('high','medium','low','insufficient')),
  caveats text[] NOT NULL DEFAULT '{}',
  conflict_note text
);

CREATE TABLE public.answer_citations (
  answer_id text NOT NULL REFERENCES public.answers(id) ON DELETE CASCADE,
  position integer NOT NULL,
  source_id text NOT NULL,
  passage_id text NOT NULL,
  reason text NOT NULL,
  is_conflict boolean NOT NULL DEFAULT false,
  PRIMARY KEY (answer_id, position),
  FOREIGN KEY (source_id, passage_id)
    REFERENCES public.source_passages(source_id, passage_id)
);

-- ============ knowledge assistant ============
CREATE TABLE public.knowledge_entries (
  id text PRIMARY KEY,
  workspace_id text NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  suggested boolean NOT NULL DEFAULT true,
  answer_id text NOT NULL REFERENCES public.answers(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0
);

CREATE TABLE public.knowledge_retrievals (
  knowledge_entry_id text NOT NULL REFERENCES public.knowledge_entries(id) ON DELETE CASCADE,
  position integer NOT NULL,
  source_id text NOT NULL,
  passage_id text NOT NULL,
  used boolean NOT NULL,
  note text NOT NULL,
  PRIMARY KEY (knowledge_entry_id, position),
  FOREIGN KEY (source_id, passage_id)
    REFERENCES public.source_passages(source_id, passage_id)
);

-- ============ drafts ============
CREATE TABLE public.drafts (
  id text PRIMARY KEY,
  request_id text NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('client_reply','internal_note','case_summary')),
  title text NOT NULL,
  recipient text NOT NULL,
  subject text NOT NULL,
  is_external boolean NOT NULL,
  confidence text NOT NULL CHECK (confidence IN ('high','medium','low','insufficient')),
  open_questions text[] NOT NULL DEFAULT '{}',
  status text NOT NULL CHECK (status IN ('draft','approved','sent','rejected')),
  generated_at timestamptz NOT NULL
);

CREATE TABLE public.draft_sections (
  draft_id text NOT NULL REFERENCES public.drafts(id) ON DELETE CASCADE,
  position integer NOT NULL,
  heading text NOT NULL,
  body text NOT NULL,
  PRIMARY KEY (draft_id, position)
);

CREATE TABLE public.draft_section_citations (
  draft_id text NOT NULL,
  section_position integer NOT NULL,
  position integer NOT NULL,
  source_id text NOT NULL,
  passage_id text NOT NULL,
  reason text NOT NULL,
  PRIMARY KEY (draft_id, section_position, position),
  FOREIGN KEY (draft_id, section_position)
    REFERENCES public.draft_sections(draft_id, position) ON DELETE CASCADE,
  FOREIGN KEY (source_id, passage_id)
    REFERENCES public.source_passages(source_id, passage_id)
);

-- ============ activity ============
CREATE TABLE public.activity_events (
  id text PRIMARY KEY,
  workspace_id text NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  at timestamptz NOT NULL DEFAULT now(),
  actor text NOT NULL CHECK (actor IN ('assistant','user','system')),
  actor_name text NOT NULL,
  action text NOT NULL,
  detail text NOT NULL,
  request_id text REFERENCES public.requests(id) ON DELETE CASCADE,
  decision text CHECK (decision IN ('approved','rejected','corrected','escalated'))
);

CREATE TABLE public.activity_event_sources (
  event_id text NOT NULL REFERENCES public.activity_events(id) ON DELETE CASCADE,
  source_id text NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  PRIMARY KEY (event_id, source_id)
);

CREATE INDEX idx_intake_fields_request ON public.intake_fields(request_id);
CREATE INDEX idx_answers_request ON public.answers(request_id);
CREATE INDEX idx_activity_at ON public.activity_events(at DESC);

-- ============ derived view ============
CREATE VIEW public.request_overview
WITH (security_invoker = true) AS
SELECT
  r.id AS request_id,
  count(i.*)::int AS intake_total,
  count(i.*) FILTER (WHERE i.status = 'provided')::int AS intake_provided,
  count(i.*) FILTER (WHERE i.status = 'missing')::int AS intake_missing,
  count(i.*) FILTER (WHERE i.status = 'uncertain')::int AS intake_uncertain,
  CASE
    WHEN count(i.*) = 0 THEN 'no_intake'
    WHEN count(i.*) FILTER (WHERE i.status <> 'provided') = 0 THEN 'complete'
    ELSE 'incomplete'
  END AS intake_readiness
FROM public.requests r
LEFT JOIN public.intake_fields i ON i.request_id = r.id
GROUP BY r.id;

-- ============ grants ============
GRANT SELECT ON public.workspaces, public.app_users, public.clients,
  public.sources, public.source_passages, public.source_supersessions,
  public.requests, public.intake_fields, public.answers, public.answer_citations,
  public.knowledge_entries, public.knowledge_retrievals,
  public.drafts, public.draft_sections, public.draft_section_citations,
  public.activity_events, public.activity_event_sources,
  public.request_overview
TO anon, authenticated;

GRANT ALL ON public.workspaces, public.app_users, public.clients,
  public.sources, public.source_passages, public.source_supersessions,
  public.requests, public.intake_fields, public.answers, public.answer_citations,
  public.knowledge_entries, public.knowledge_retrievals,
  public.drafts, public.draft_sections, public.draft_section_citations,
  public.activity_events, public.activity_event_sources
TO service_role;
GRANT SELECT ON public.request_overview TO service_role;

-- ============ RLS: public read-only demo corpus, no browser writes ============
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_passages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_supersessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intake_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answer_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_retrievals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draft_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draft_section_citations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_event_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "demo corpus is publicly readable" ON public.workspaces FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "demo corpus is publicly readable" ON public.app_users FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "demo corpus is publicly readable" ON public.clients FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "demo corpus is publicly readable" ON public.sources FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "demo corpus is publicly readable" ON public.source_passages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "demo corpus is publicly readable" ON public.source_supersessions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "demo corpus is publicly readable" ON public.requests FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "demo corpus is publicly readable" ON public.intake_fields FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "demo corpus is publicly readable" ON public.answers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "demo corpus is publicly readable" ON public.answer_citations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "demo corpus is publicly readable" ON public.knowledge_entries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "demo corpus is publicly readable" ON public.knowledge_retrievals FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "demo corpus is publicly readable" ON public.drafts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "demo corpus is publicly readable" ON public.draft_sections FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "demo corpus is publicly readable" ON public.draft_section_citations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "demo corpus is publicly readable" ON public.activity_events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "demo corpus is publicly readable" ON public.activity_event_sources FOR SELECT TO anon, authenticated USING (true);
