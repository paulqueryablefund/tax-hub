CREATE OR REPLACE FUNCTION public.search_passages(query_text text, caller_visibility text DEFAULT 'all_staff'::text, max_results integer DEFAULT 12)
 RETURNS TABLE(source_id text, passage_id text, locator text, text text, source_title text, url text, fts_rank integer, trgm_rank integer, anchor_rank integer, fts_score numeric, trgm_score numeric, anchor_hits integer, fused_score numeric, used boolean, exclusion_reason text)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
WITH params AS (
  SELECT
    query_text AS q,
    websearch_to_tsquery('german', query_text) AS tsq,
    (query_text ~ '(§|Abs|Nr|Satz|BMF|[0-9]{4})') AS is_anchor,
    CASE caller_visibility WHEN 'partners_only' THEN 3 WHEN 'professionals_only' THEN 2 ELSE 1 END AS lvl,
    0.2::numeric AS fts_bar,
    0.35::numeric AS trgm_bar,
    0.55::numeric AS trgm_strong_bar
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
         ROUND(ts_rank_cd(c.fts, pr.tsq)::numeric, 6) AS raw,
         row_number() OVER (ORDER BY ts_rank_cd(c.fts, pr.tsq) DESC, c.pid)::int AS rk
  FROM cand c, params pr
  WHERE pr.tsq IS NOT NULL AND c.fts @@ pr.tsq
),
arm_trgm AS (
  SELECT c.sid, c.pid,
         ROUND(word_similarity(pr.q, c.txt)::numeric, 6) AS raw,
         row_number() OVER (ORDER BY word_similarity(pr.q, c.txt) DESC, c.pid)::int AS rk
  FROM cand c, params pr
  WHERE word_similarity(pr.q, c.txt) >= pr.trgm_bar
),
arm_anchor AS (
  SELECT c.sid, c.pid, m.hits::int AS raw,
         row_number() OVER (ORDER BY m.hits DESC, c.pid)::int AS rk
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
         COALESCE(f.raw, 0)::numeric AS fts_raw,
         COALESCE(t.raw, 0)::numeric AS trgm_raw,
         COALESCE(a.raw, 0)::int AS anchor_raw,
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
         fu.fts_rk, fu.trgm_rk, fu.anchor_rk, fu.fts_raw, fu.trgm_raw, fu.anchor_raw, fu.score,
         CASE
           WHEN c.shealth = 'outdated' THEN 'Source is marked outdated in the library.'
           WHEN sup.superseded_by_id IS NOT NULL THEN
             'Superseded by ' || COALESCE(sup2.short_title, sup.superseded_by_id) ||
             ', effective ' || COALESCE(sup2.effective_from::text, 'date not stated by the source') || '.'
           WHEN c.vlvl > pr.lvl THEN 'Restricted to ' || c.svis || '; the caller is ' || caller_visibility || '.'
           -- Admission: one strong signal, or two weak signals that agree.
           -- An arm's entry threshold cannot double as its admission bar,
           -- or the bar is a tautology for everything that reached the arm.
           WHEN NOT (
                  fu.trgm_raw >= pr.trgm_strong_bar
               OR fu.fts_raw >= pr.fts_bar
               OR fu.anchor_raw > 0
               OR (fu.trgm_raw >= pr.trgm_bar AND fu.fts_raw > 0)
             )
             THEN 'Matched weakly and the match was not corroborated by a second signal (keyword ' || fu.fts_raw::text ||
                  ', wording similarity ' || fu.trgm_raw::text ||
                  ' — admission needs wording similarity >= ' || pr.trgm_strong_bar::text ||
                  ', or keyword >= ' || pr.fts_bar::text ||
                  ', or a citation-anchor match, or wording similarity >= ' || pr.trgm_bar::text ||
                  ' together with a keyword match above zero).'
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
       k.fts_rk, k.trgm_rk, k.anchor_rk, k.fts_raw, k.trgm_raw, k.anchor_raw, k.score, true, NULL::text
FROM kept k WHERE k.rn <= max_results
UNION ALL
SELECT j.sid, j.pid, j.loc, j.txt, j.stitle, j.surl,
       j.fts_rk, j.trgm_rk, j.anchor_rk, j.fts_raw, j.trgm_raw, j.anchor_raw, j.score, false, j.reason
FROM judged j WHERE j.reason IS NOT NULL
ORDER BY 14 DESC, 13 DESC, 2;
$function$;