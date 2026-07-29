do $$
declare t text;
begin
  foreach t in array array['sources','source_passages','source_supersessions','query_expansion_cache','retrieval_glossary'] loop
    execute format('drop policy if exists %I on public.%I', 'demo corpus is publicly readable', t);
    execute format('revoke select, insert, update, delete on public.%I from anon, authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;
  execute 'drop policy if exists "Expansion cache is readable by everyone" on public.query_expansion_cache';
  execute 'drop policy if exists "Glossary is readable by everyone" on public.retrieval_glossary';
end $$;