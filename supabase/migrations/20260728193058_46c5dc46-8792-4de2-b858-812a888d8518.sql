ALTER TABLE public.source_supersessions
  ADD COLUMN relation text NOT NULL DEFAULT 'superseded_by',
  ADD COLUMN target_label text,
  ADD COLUMN scope text,
  ADD COLUMN effective_note text;

ALTER TABLE public.source_supersessions DROP CONSTRAINT source_supersessions_pkey;
ALTER TABLE public.source_supersessions DROP CONSTRAINT source_supersessions_check;

ALTER TABLE public.source_supersessions
  ALTER COLUMN superseded_by_id DROP NOT NULL;

ALTER TABLE public.source_supersessions ADD COLUMN id uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.source_supersessions ADD PRIMARY KEY (id);

ALTER TABLE public.source_supersessions
  ADD CONSTRAINT source_supersessions_not_self CHECK (superseded_by_id IS DISTINCT FROM source_id),
  ADD CONSTRAINT source_supersessions_target_present CHECK (superseded_by_id IS NOT NULL OR target_label IS NOT NULL),
  ADD CONSTRAINT source_supersessions_relation_check CHECK (relation = ANY (ARRAY['superseded_by','supersedes','modified_by','transitional_rule','conflicts_with','depends_on']));

CREATE UNIQUE INDEX source_supersessions_unique_edge
  ON public.source_supersessions (source_id, relation, COALESCE(superseded_by_id, target_label));