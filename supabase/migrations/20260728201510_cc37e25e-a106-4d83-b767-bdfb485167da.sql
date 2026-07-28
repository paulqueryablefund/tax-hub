-- ============ CLEANUPS ============
UPDATE public.intake_fields_seed SET required_by_source_id='src-bmf-elektro-2021', required_by_passage_id='p-bmf-elektro-2021-rdnr12' WHERE id IN ('f-registration','f-commute');
UPDATE public.intake_fields_seed SET required_by_source_id='src-estg-6', required_by_passage_id='p-estg-6-1-4-s2-nr3' WHERE id='f-list-price';
UPDATE public.intake_fields_seed SET required_by_source_id='src-lstr-r-8-1-9', required_by_passage_id='p-lstr-8-1-9-nr1-listenpreis' WHERE id='f-available-from';
UPDATE public.requests SET lifecycle_status='approved' WHERE id='r-1038';

-- ============ SEARCH INFRASTRUCTURE ============
CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE public.source_passages
  ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (to_tsvector('german', text)) STORED;

CREATE INDEX IF NOT EXISTS source_passages_fts_idx ON public.source_passages USING gin (fts);
CREATE INDEX IF NOT EXISTS source_passages_text_trgm_idx ON public.source_passages USING gin (text gin_trgm_ops);
CREATE INDEX IF NOT EXISTS source_passages_locator_trgm_idx ON public.source_passages USING gin (locator gin_trgm_ops);

-- ============ GLOSSARY ============
CREATE TABLE public.retrieval_glossary (
  id text PRIMARY KEY,
  term_en text NOT NULL,
  term_de text[] NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.retrieval_glossary TO anon, authenticated;
GRANT ALL ON public.retrieval_glossary TO service_role;
ALTER TABLE public.retrieval_glossary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Glossary is readable by everyone" ON public.retrieval_glossary FOR SELECT USING (true);
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $fn$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$fn$;

CREATE TRIGGER update_retrieval_glossary_updated_at BEFORE UPDATE ON public.retrieval_glossary
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.retrieval_glossary (id, term_en, term_de, notes) VALUES
('gl-kfz','company car',ARRAY['Kraftfahrzeug','Dienstwagen'],'mixed: Kraftfahrzeug=passage, Dienstwagen=title'),
('gl-privatnutzung','private use',ARRAY['private Nutzung','privaten Nutzung'],'passage'),
('gl-elektro','electric vehicle / EV',ARRAY['Elektrofahrzeug','Elektro','emissionsfrei','Kohlendioxidemission','Hybridelektrofahrzeug'],'passage'),
('gl-lohn','payslip / payroll',ARRAY['Lohnabrechnung','Lohnsteuer','Arbeitslohn','Lohnzahlungszeitraum','Sachbezug'],'mixed: Lohnabrechnung=passage, Lohnsteuer=passage, Arbeitslohn=passage, Lohnzahlungszeitraum=passage, Sachbezug=title'),
('gl-fahrtenbuch','logbook',ARRAY['Fahrtenbuch'],'passage'),
('gl-listenpreis','gross list price',ARRAY['Bruttolistenpreis','Listenpreis'],'passage'),
('gl-aufbewahrung','retention period',ARRAY['Aufbewahrungsfrist','aufzubewahren'],'passage'),
('gl-belege','accounting documents / receipts',ARRAY['Buchungsbelege','Belege','Unterlagen'],'passage'),
('gl-abgabefrist','filing deadline',ARRAY['Steuererklärungsfrist','abzugeben','Frist'],'passage'),
('gl-verspaetung','late filing penalty',ARRAY['Verspätungszuschlag'],'passage'),
('gl-kleinunternehmer','small business rule',ARRAY['Kleinunternehmer'],'passage'),
('gl-erechnung','e-invoice',ARRAY['E-Rechnung','elektronische Rechnung','elektronischen Rechnung'],'passage'),
('gl-ust','VAT',ARRAY['Umsatzsteuer','Umsatz'],'passage'),
('gl-gebuehr','fee / cost',ARRAY['Gebühr','Vergütung'],'passage'),
('gl-vollmacht','power of attorney',ARRAY['Vollmacht'],'passage'),
('gl-steuererklaerung','tax return',ARRAY['Steuererklärung'],'passage'),
('gl-vorauszahlung','advance payment',ARRAY['Vorauszahlung'],'passage'),
('gl-istversteuerung','cash basis',ARRAY['vereinnahmten Entgelten'],'passage'),
('gl-buchfuehrung','bookkeeping',ARRAY['Buchführung','Bücher'],'passage'),
('gl-rechnung','invoice',ARRAY['Rechnung'],'passage'),
('gl-fahrausweis','travel ticket',ARRAY['Fahrausweis'],'passage'),
('gl-steuersatz','tax rate',ARRAY['Steuersatz'],'passage'),
('gl-gesamtumsatz','total turnover',ARRAY['Gesamtumsatz'],'passage'),
('gl-ladestrom','charging electricity',ARRAY['Stromkosten','Ladestrom'],'mixed: Stromkosten=passage, Ladestrom=title'),
('gl-pauschale','flat rate',ARRAY['Pauschale','pauschal'],'passage'),
('gl-verlaengerung','extension of time',ARRAY['verlängert','Verlängerung'],'mixed: verlängert=passage, Verlängerung=title'),
('gl-zeitraum','assessment period',ARRAY['Besteuerungszeitraum','Besteuerungszeiträume'],'passage'),
('gl-steuerberater','tax adviser',ARRAY['Steuerberater'],'passage'),
('gl-format','structured electronic format',ARRAY['strukturierten elektronischen Format'],'passage'),
('gl-uebergang','transition period',ARRAY['Übergangsregelung','Anwendungsregelung'],'passage'),
('gl-aufzeichnungen','records',ARRAY['Aufzeichnungen'],'passage'),
('gl-gegenstandswert','fee basis / object value',ARRAY['Gegenstandswert'],'passage'),
('gl-jahresabschluss','annual financial statements',ARRAY['Jahresabschluss','Jahresabschlüsse'],'passage'),
('gl-est','income tax',ARRAY['Einkommensteuer'],'passage'),
('gl-taetigkeitsstaette','first place of work',ARRAY['erster Tätigkeitsstätte'],'passage'),
('gl-anschaffung','acquisition',ARRAY['Anschaffung','angeschafft'],'passage'),
('gl-kalendermonat','calendar month',ARRAY['Kalendermonat'],'passage'),
('gl-arbeitnehmer','employee',ARRAY['Arbeitnehmer'],'passage'),
('gl-arbeitgeber','employer',ARRAY['Arbeitgeber'],'passage'),
('gl-viertel','quarter (assessment base)',ARRAY['Viertel'],'passage'),
('gl-unternehmer','entrepreneur / taxable person',ARRAY['Unternehmer'],'passage'),
('gl-steuerfrei','tax-free / exempt',ARRAY['steuerfrei'],'passage');

-- ============ TIER 2 EXPANSION CACHE ============
CREATE TABLE public.query_expansion_cache (
  normalized_query text PRIMARY KEY,
  terms text[] NOT NULL,
  model_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.query_expansion_cache TO anon, authenticated;
GRANT ALL ON public.query_expansion_cache TO service_role;
ALTER TABLE public.query_expansion_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Expansion cache is readable by everyone" ON public.query_expansion_cache FOR SELECT USING (true);

-- ============ RETRIEVAL FUNCTION ============
CREATE OR REPLACE FUNCTION public.search_passages(
  query_text text,
  caller_visibility text DEFAULT 'all_staff',
  max_results int DEFAULT 12
)
RETURNS TABLE (
  source_id text,
  passage_id text,
  locator text,
  text text,
  source_title text,
  url text,
  fts_rank int,
  trgm_rank int,
  anchor_rank int,
  fused_score numeric,
  used boolean,
  exclusion_reason text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
WITH params AS (
  SELECT
    query_text AS q,
    websearch_to_tsquery('german', query_text) AS tsq,
    (query_text ~ '(§|Abs|Nr|Satz|BMF|[0-9]{4})') AS is_anchor,
    CASE caller_visibility WHEN 'partners_only' THEN 3 WHEN 'professionals_only' THEN 2 ELSE 1 END AS lvl
),
cand AS (
  SELECT p.source_id AS sid, p.passage_id AS pid, p.locator AS loc, p.text AS txt, p.fts AS fts,
         s.title AS stitle, s.url AS surl, s.health AS shealth, s.visibility AS svis,
         CASE s.visibility WHEN 'partners_only' THEN 3 WHEN 'professionals_only' THEN 2 ELSE 1 END AS vlvl
  FROM public.source_passages p
  JOIN public.sources s ON s.id = p.source_id
),
arm_fts AS (
  SELECT c.sid, c.pid,
         row_number() OVER (ORDER BY ts_rank_cd(c.fts, pr.tsq) DESC, c.pid)::int AS rk
  FROM cand c, params pr
  WHERE pr.tsq IS NOT NULL AND c.fts @@ pr.tsq
),
arm_trgm AS (
  SELECT c.sid, c.pid,
         row_number() OVER (ORDER BY word_similarity(pr.q, c.txt) DESC, c.pid)::int AS rk
  FROM cand c, params pr
  WHERE word_similarity(pr.q, c.txt) >= 0.35
),
arm_anchor AS (
  SELECT c.sid, c.pid, row_number() OVER (ORDER BY m.hits DESC, c.pid)::int AS rk
  FROM cand c, params pr,
  LATERAL (
    SELECT count(*) AS hits
    FROM unnest(regexp_split_to_array(pr.q, '[[:space:],;]+')) AS t
    WHERE length(t) > 1 AND c.loc ILIKE '%' || t || '%'
  ) m
  WHERE pr.is_anchor AND m.hits > 0
),
fused AS (
  SELECT k.sid, k.pid,
         COALESCE(f.rk, 0) AS fts_rk,
         COALESCE(t.rk, 0) AS trgm_rk,
         COALESCE(a.rk, 0) AS anchor_rk,
         ROUND(
           COALESCE(1.0 / (60 + f.rk), 0) +
           COALESCE(1.0 / (60 + t.rk), 0) +
           COALESCE(1.0 / (60 + a.rk), 0)
         , 6) AS score
  FROM (
    SELECT sid, pid FROM arm_fts
    UNION SELECT sid, pid FROM arm_trgm
    UNION SELECT sid, pid FROM arm_anchor
  ) k
  LEFT JOIN arm_fts f ON f.sid = k.sid AND f.pid = k.pid
  LEFT JOIN arm_trgm t ON t.sid = k.sid AND t.pid = k.pid
  LEFT JOIN arm_anchor a ON a.sid = k.sid AND a.pid = k.pid
),
judged AS (
  SELECT c.sid, c.pid, c.loc, c.txt, c.stitle, c.surl,
         fu.fts_rk, fu.trgm_rk, fu.anchor_rk, fu.score,
         CASE
           WHEN c.shealth = 'outdated' THEN 'Source is marked outdated in the library.'
           WHEN sup.superseded_by_id IS NOT NULL THEN
             'Superseded by ' || COALESCE(sup2.short_title, sup.superseded_by_id) ||
             ', effective ' || COALESCE(sup2.effective_from::text, 'date not stated by the source') || '.'
           WHEN c.vlvl > pr.lvl THEN 'Restricted to ' || c.svis || '; the caller is ' || caller_visibility || '.'
           ELSE NULL
         END AS reason
  FROM fused fu
  JOIN cand c ON c.sid = fu.sid AND c.pid = fu.pid
  CROSS JOIN params pr
  LEFT JOIN LATERAL (
    SELECT ss.superseded_by_id
    FROM public.source_supersessions ss
    JOIN public.sources s2 ON s2.id = ss.superseded_by_id
    WHERE ss.source_id = c.sid
      AND ss.relation = 'superseded_by'
      AND ss.superseded_by_id IS NOT NULL
      AND COALESCE(s2.effective_from, CURRENT_DATE) <= CURRENT_DATE
    LIMIT 1
  ) sup ON true
  LEFT JOIN public.sources sup2 ON sup2.id = sup.superseded_by_id
),
kept AS (
  SELECT j.*, row_number() OVER (ORDER BY j.score DESC, j.pid) AS rn
  FROM judged j WHERE j.reason IS NULL
)
SELECT k.sid, k.pid, k.loc, k.txt, k.stitle, k.surl,
       k.fts_rk, k.trgm_rk, k.anchor_rk, k.score, true, NULL::text
FROM kept k WHERE k.rn <= max_results
UNION ALL
SELECT j.sid, j.pid, j.loc, j.txt, j.stitle, j.surl,
       j.fts_rk, j.trgm_rk, j.anchor_rk, j.score, false, j.reason
FROM judged j WHERE j.reason IS NOT NULL
ORDER BY 11 DESC, 10 DESC, 2;
$$;

GRANT EXECUTE ON FUNCTION public.search_passages(text, text, int) TO anon, authenticated, service_role;