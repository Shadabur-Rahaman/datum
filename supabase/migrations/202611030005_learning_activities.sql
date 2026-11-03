alter table public.learning_documents drop constraint learning_documents_content_id_check;
alter table public.learning_documents add constraint learning_documents_content_id_check check(content_id in ('lab-delivery','evidence-notebook','quiz-delivery','learner-navigation','practice-count','practice-average','practice-clean','practice-groups','practice-spread','practice-error') or content_id ~ '^lesson-activity-(observations|hypotheses|python-basics|processing|dataframes|missing|distributions|charts|summary|uncertainty|features|evaluation)$');
create or replace function public.save_learning_document(p_content_id text,p_version integer,p_body jsonb,p_expected_revision integer,p_owner uuid)
returns public.learning_documents language plpgsql security definer set search_path='' as $$
declare saved public.learning_documents; allowed text[];
begin
 if auth.uid() is null or p_owner is distinct from auth.uid() then raise exception 'Account changed or authentication required' using errcode='42501'; end if;
 if p_version is distinct from 1 or p_expected_revision is null or p_expected_revision<0 or p_body is null or jsonb_typeof(p_body)<>'object' or octet_length(p_body::text)>600000 then raise exception 'Invalid document' using errcode='22023'; end if;
 allowed:=case when p_content_id ~ '^lesson-activity-(observations|hypotheses|python-basics|processing|dataframes|missing|distributions|charts|summary|uncertainty|features|evaluation)$' then array['parameter','prediction','ran','answer','applied','explanation','hints','attempts'] when p_content_id='lab-delivery' then array['hypothesis','code','config','prediction','executed','explanation','limitations','reflection','stage'] when p_content_id='evidence-notebook' then array['entries'] when p_content_id='quiz-delivery' then array['requestId','answers','cursor'] when p_content_id='learner-navigation' then array['lastLesson'] when p_content_id in ('practice-count','practice-average','practice-clean','practice-groups','practice-spread','practice-error') then array['code','attempts'] else null end;
 if allowed is null or p_body-allowed<>'{}'::jsonb or not(p_body ?& allowed) then raise exception 'Invalid document fields' using errcode='22023'; end if;
 -- Documents are learner-authored, unverified records. No document grants mastery or grades.
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_owner::text||':'||p_content_id||':1',0));
 select * into saved from public.learning_documents where user_id=p_owner and content_id=p_content_id and content_version=1 for update;
 if found then
  if saved.body=p_body then return saved;end if;
  if saved.revision<>p_expected_revision then raise exception 'Document changed elsewhere' using errcode='40001';end if;
  update public.learning_documents set body=p_body,revision=revision+1 where id=saved.id returning * into saved;
 else
  if p_expected_revision<>0 then raise exception 'Document changed elsewhere' using errcode='40001';end if;
  insert into public.learning_documents(user_id,content_id,body) values(p_owner,p_content_id,p_body) returning * into saved;
 end if;return saved;
end $$;
revoke all on function public.save_learning_document(text,integer,jsonb,integer,uuid) from public,anon;
grant execute on function public.save_learning_document(text,integer,jsonb,integer,uuid) to authenticated;
