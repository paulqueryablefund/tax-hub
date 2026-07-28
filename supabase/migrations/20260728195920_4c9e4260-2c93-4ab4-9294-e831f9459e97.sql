-- 1. Re-point citations away from placeholder sources
UPDATE public.answer_citations SET source_id = 'src-estg-6', passage_id = 'p-estg-6-1-4-s2-nr3'
  WHERE source_id = 'src-estg-6-1-4' AND passage_id = 'p-025';
UPDATE public.draft_section_citations SET source_id = 'src-estg-6', passage_id = 'p-estg-6-1-4-s2-nr3'
  WHERE source_id = 'src-estg-6-1-4' AND passage_id = 'p-025';
UPDATE public.knowledge_retrievals SET source_id = 'src-estg-6', passage_id = 'p-estg-6-1-4-s2-nr3'
  WHERE source_id = 'src-estg-6-1-4' AND passage_id = 'p-025';
UPDATE public.intake_fields SET required_by_source_id = 'src-estg-6', required_by_passage_id = 'p-estg-6-1-4-s2-nr3'
  WHERE required_by_source_id = 'src-estg-6-1-4' AND required_by_passage_id = 'p-025';

UPDATE public.intake_fields SET required_by_source_id = 'src-lstr-r-8-1-9', required_by_passage_id = 'p-lstr-8-1-9-nr1-listenpreis'
  WHERE required_by_source_id = 'src-lstr-8-1' AND required_by_passage_id = 'p-payroll';

UPDATE public.answer_citations SET passage_id = 'p-ao-149-abs3'
  WHERE source_id = 'src-ao-149' AND passage_id = 'p-advised';
UPDATE public.knowledge_retrievals SET passage_id = 'p-ao-149-abs3'
  WHERE source_id = 'src-ao-149' AND passage_id = 'p-advised';
UPDATE public.draft_section_citations SET passage_id = 'p-ao-149-abs3'
  WHERE source_id = 'src-ao-149' AND passage_id = 'p-advised';
UPDATE public.intake_fields SET required_by_passage_id = 'p-ao-149-abs3'
  WHERE required_by_source_id = 'src-ao-149' AND required_by_passage_id = 'p-advised';

-- 2. Remove placeholder sources (passages cascade) and leftover paraphrase passages
DELETE FROM public.source_supersessions WHERE source_id IN ('src-estg-6-1-4','src-lstr-8-1') OR superseded_by_id IN ('src-estg-6-1-4','src-lstr-8-1');
DELETE FROM public.sources WHERE id IN ('src-estg-6-1-4','src-lstr-8-1');
DELETE FROM public.source_passages WHERE (source_id, passage_id) IN
  (('src-ao-149','p-advised'), ('src-ustg-14','p-erechnung'), ('src-ustg-14','p-receipt-duty'));

-- 3. Back r-1038's approved state with the draft decision its history records
INSERT INTO public.drafts (id, request_id, kind, title, recipient, subject, is_external, confidence, open_questions, status, generated_at)
VALUES ('d-1038', 'r-1038', 'client_reply', 'Extension request confirmation — 2025 returns',
        'Annika Mardorf, Mardorf Immobilienverwaltung GbR',
        'Your 2025 returns — we have requested the filing extension',
        true, 'high', '{}', 'sent', '2026-07-27T14:52:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.draft_sections (draft_id, position, heading, body) VALUES
  ('d-1038', 0, 'Confirmation',
   'Dear Ms Mardorf, we have requested an extension of the filing deadline for your 2025 returns. Your records are complete enough for us to do so under our internal threshold.'),
  ('d-1038', 1, 'Why the extension is available',
   'For returns prepared by a tax adviser, the statutory filing deadline is extended by law. We will inform you as soon as the tax office confirms the extension in writing.')
ON CONFLICT (draft_id, position) DO NOTHING;

INSERT INTO public.draft_section_citations (draft_id, section_position, position, source_id, passage_id, reason) VALUES
  ('d-1038', 0, 0, 'src-firm-handbook-fristen', 'p-extension', 'Firm policy: extension requests require records that are at least eighty per cent complete and a signature from the responsible Steuerberater.'),
  ('d-1038', 1, 0, 'src-ao-149', 'p-ao-149-abs3', 'Verbatim § 149 Abs. 3 AO: the extended deadline for returns prepared by persons authorised to give tax advice.')
ON CONFLICT DO NOTHING;

UPDATE public.requests SET lifecycle_status = 'ready_for_review' WHERE id = 'r-1038';

-- keep the demo reset consistent with the corrected state
INSERT INTO public.drafts_seed SELECT * FROM public.drafts WHERE id = 'd-1038' ON CONFLICT DO NOTHING;
INSERT INTO public.draft_sections_seed SELECT * FROM public.draft_sections WHERE draft_id = 'd-1038' ON CONFLICT DO NOTHING;
UPDATE public.requests_seed SET lifecycle_status = 'ready_for_review' WHERE id = 'r-1038';

-- 4. Approval must be provable from a draft decision
CREATE OR REPLACE VIEW public.request_overview AS
SELECT r.id AS request_id,
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
    WHEN r.lifecycle_status = 'closed' THEN 'closed'
    WHEN EXISTS (SELECT 1 FROM public.drafts d WHERE d.request_id = r.id AND d.status IN ('approved','sent')) THEN 'approved'
    WHEN EXISTS (SELECT 1 FROM public.drafts d WHERE d.request_id = r.id AND d.status IN ('draft','rejected')) THEN 'ready_for_review'
    WHEN r.lifecycle_status = 'awaiting_client' THEN 'awaiting_client'
    WHEN count(i.*) > 0 THEN 'intake'
    ELSE 'new'
  END AS status
FROM public.requests r
LEFT JOIN public.intake_fields i ON i.request_id = r.id
GROUP BY r.id, r.lifecycle_status;