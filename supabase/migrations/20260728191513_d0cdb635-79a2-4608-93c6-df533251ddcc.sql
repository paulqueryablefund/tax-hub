
CREATE TABLE public.intake_fields_seed AS SELECT * FROM public.intake_fields;
CREATE TABLE public.drafts_seed AS SELECT * FROM public.drafts;
CREATE TABLE public.draft_sections_seed AS SELECT * FROM public.draft_sections;
CREATE TABLE public.requests_seed AS SELECT id, lifecycle_status FROM public.requests;
CREATE TABLE public.activity_events_seed AS SELECT id FROM public.activity_events;

ALTER TABLE public.intake_fields_seed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drafts_seed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draft_sections_seed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests_seed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events_seed ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.intake_fields_seed, public.drafts_seed, public.draft_sections_seed,
  public.requests_seed, public.activity_events_seed TO service_role;

CREATE OR REPLACE FUNCTION public.reset_demo()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.activity_events e
   WHERE NOT EXISTS (SELECT 1 FROM public.activity_events_seed s WHERE s.id = e.id);

  UPDATE public.intake_fields f
     SET value = s.value, status = s.status
    FROM public.intake_fields_seed s
   WHERE f.request_id = s.request_id AND f.id = s.id;

  UPDATE public.drafts d SET status = s.status
    FROM public.drafts_seed s WHERE d.id = s.id;

  UPDATE public.draft_sections ds SET body = s.body
    FROM public.draft_sections_seed s
   WHERE ds.draft_id = s.draft_id AND ds.position = s.position;

  UPDATE public.requests r
     SET lifecycle_status = s.lifecycle_status,
         escalation_reason = NULL, escalation_to_user_id = NULL, escalation_at = NULL
    FROM public.requests_seed s WHERE r.id = s.id;
END;
$$;

REVOKE ALL ON FUNCTION public.reset_demo() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reset_demo() TO service_role;
