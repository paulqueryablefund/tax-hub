do $$
declare t text;
begin
  foreach t in array array[
    'activity_event_sources','activity_events','answer_citations','answers','app_users',
    'clients','draft_section_citations','draft_sections','drafts','intake_fields',
    'knowledge_entries','knowledge_retrievals','requests','workspaces'
  ] loop
    execute format('drop policy if exists %I on public.%I', 'demo corpus is publicly readable', t);
    execute format('revoke select on public.%I from anon, authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;
end $$;