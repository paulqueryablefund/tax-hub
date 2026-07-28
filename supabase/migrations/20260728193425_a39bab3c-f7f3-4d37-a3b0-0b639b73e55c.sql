DROP VIEW IF EXISTS public.request_overview;

CREATE VIEW public.request_overview
WITH (security_invoker = true) AS
SELECT
  r.id AS request_id,
  count(i.*)::integer AS intake_total,
  count(i.*) FILTER (WHERE i.status = 'provided')::integer AS intake_provided,
  count(i.*) FILTER (WHERE i.status = 'missing')::integer AS intake_missing,
  count(i.*) FILTER (WHERE i.status = 'uncertain')::integer AS intake_uncertain,
  CASE
    WHEN count(i.*) = 0 THEN 'no_intake'
    WHEN count(i.*) FILTER (WHERE i.status <> 'provided') = 0 THEN 'complete'
    ELSE 'incomplete'
  END AS intake_readiness,
  CASE
    -- human-only marker: nothing in the data can tell us a case was closed
    WHEN r.lifecycle_status = 'closed' THEN 'closed'
    WHEN EXISTS (
      SELECT 1 FROM public.drafts d
      WHERE d.request_id = r.id AND d.status IN ('approved', 'sent')
    ) OR r.lifecycle_status = 'approved' THEN 'approved'
    WHEN EXISTS (
      SELECT 1 FROM public.drafts d
      WHERE d.request_id = r.id AND d.status IN ('draft', 'rejected')
    ) THEN 'ready_for_review'
    -- human-only marker: a query was sent to the client
    WHEN r.lifecycle_status = 'awaiting_client' THEN 'awaiting_client'
    WHEN count(i.*) > 0 THEN 'intake'
    ELSE 'new'
  END AS status
FROM public.requests r
LEFT JOIN public.intake_fields i ON i.request_id = r.id
GROUP BY r.id, r.lifecycle_status;

GRANT SELECT ON public.request_overview TO anon, authenticated;
GRANT ALL ON public.request_overview TO service_role;