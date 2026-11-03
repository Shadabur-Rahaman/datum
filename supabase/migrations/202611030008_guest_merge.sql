create or replace function public.import_guest_drafts(p_drafts jsonb,p_owner uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare d jsonb; imported integer:=0; kept integer:=0; existing public.learning_documents; merged jsonb;
begin
 if auth.uid() is null or p_owner is distinct from auth.uid() then raise exception 'Authentication required' using errcode='42501';end if;
 if p_drafts is null or jsonb_typeof(p_drafts)<>'array' or jsonb_array_length(p_drafts)>80 or octet_length(p_drafts::text)>700000 then raise exception 'Invalid import' using errcode='22023';end if;
 for d in select value from jsonb_array_elements(p_drafts) order by value->>'content_id' loop
  begin
   if d->>'content_id' ~ '^lesson-activity-(observations|hypotheses|python-basics|processing|dataframes|missing|distributions|charts|summary|uncertainty|features|evaluation)$' or d->>'content_id' in ('mentor-debugger-v22','mentor-navigator-v22','mentor-conversation-v22','lab-research-v22','quiz-chapters-v22','lab-delivery','evidence-notebook','quiz-delivery','learner-navigation','practice-count','practice-average','practice-clean','practice-groups','practice-spread','practice-error') then
    perform public.save_learning_document(d->>'content_id',(d->>'content_version')::integer,d->'body',0,p_owner);
   else perform public.save_draft(d->>'content_id',(d->>'content_version')::integer,d->'body',0,p_owner);end if;
   imported:=imported+1;
  exception when serialization_failure then
     if d->>'content_id'='evidence-notebook' then
      select * into existing from public.learning_documents where user_id=p_owner and content_id='evidence-notebook' and content_version=1;
      select coalesce(jsonb_agg(value order by value->>'createdAt' desc),'[]'::jsonb) into merged from (
       select distinct on (value->>'id') value from (
        select value,0 as priority from jsonb_array_elements(existing.body->'entries')
        union all select value,1 from jsonb_array_elements(d->'body'->'entries')
       ) entries order by value->>'id',priority
      ) unique_entries;
      if jsonb_array_length(merged)>30 then raise exception 'Merged notebook exceeds 30 entries. Export and make space before importing.' using errcode='22023'; end if;
      perform public.save_learning_document('evidence-notebook',1,jsonb_build_object('entries',merged),existing.revision,p_owner);
      imported:=imported+1;
     else kept:=kept+1; end if;
    end;
 end loop;return jsonb_build_object('imported',imported,'kept',kept);
end $$;
