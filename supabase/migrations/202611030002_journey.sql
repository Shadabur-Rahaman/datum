-- Compatible additive migration: preserve all Phase 2.1 records and RPC signatures.
create table public.learning_documents (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 content_id text not null check(content_id in ('lab-delivery','evidence-notebook','quiz-delivery','learner-navigation','practice-count','practice-average','practice-clean','practice-groups','practice-spread','practice-error')),
 content_version integer not null default 1 check(content_version=1), body jsonb not null check(jsonb_typeof(body)='object' and octet_length(body::text)<=600000),
 revision integer not null default 1, created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(user_id,content_id,content_version)
);
alter table public.learning_documents enable row level security;
revoke all on public.learning_documents from anon,authenticated;
grant select on public.learning_documents to authenticated;
create policy document_owner_read on public.learning_documents for select to authenticated using((select auth.uid())=user_id);
create index on public.learning_documents(user_id,updated_at desc);
create trigger updated_at before update on public.learning_documents for each row execute function public.touch_updated_at();
create function public.save_learning_document(p_content_id text,p_version integer,p_body jsonb,p_expected_revision integer,p_owner uuid)
returns public.learning_documents language plpgsql security definer set search_path='' as $$
declare saved public.learning_documents; allowed text[];
begin
 if auth.uid() is null or p_owner is distinct from auth.uid() then raise exception 'Account changed or authentication required' using errcode='42501'; end if;
 if p_version is distinct from 1 or p_expected_revision is null or p_expected_revision<0 or p_body is null or jsonb_typeof(p_body)<>'object' or octet_length(p_body::text)>600000 then raise exception 'Invalid document' using errcode='22023'; end if;
 allowed:=case when p_content_id='lab-delivery' then array['hypothesis','code','config','prediction','executed','explanation','limitations','reflection','stage'] when p_content_id='evidence-notebook' then array['entries'] when p_content_id='quiz-delivery' then array['requestId','answers','cursor'] when p_content_id='learner-navigation' then array['lastLesson'] when p_content_id in ('practice-count','practice-average','practice-clean','practice-groups','practice-spread','practice-error') then array['code','attempts'] else null end;
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
create or replace function public.import_guest_drafts(p_drafts jsonb,p_owner uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare d jsonb; imported integer:=0; kept integer:=0;
begin
 if auth.uid() is null or p_owner is distinct from auth.uid() then raise exception 'Authentication required' using errcode='42501';end if;
 if p_drafts is null or jsonb_typeof(p_drafts)<>'array' or jsonb_array_length(p_drafts)>30 or octet_length(p_drafts::text)>700000 then raise exception 'Invalid import' using errcode='22023';end if;
 for d in select value from jsonb_array_elements(p_drafts) order by value->>'content_id' loop
  begin
   if d->>'content_id' in ('lab-delivery','evidence-notebook','quiz-delivery','learner-navigation','practice-count','practice-average','practice-clean','practice-groups','practice-spread','practice-error') then
    perform public.save_learning_document(d->>'content_id',(d->>'content_version')::integer,d->'body',0,p_owner);
   else perform public.save_draft(d->>'content_id',(d->>'content_version')::integer,d->'body',0,p_owner);end if;
   imported:=imported+1;
  exception when serialization_failure then kept:=kept+1;end;
 end loop;return jsonb_build_object('imported',imported,'kept',kept);
end $$;
create or replace function public.export_my_data() returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); result jsonb:='{}'; t text; rows jsonb;
begin
 if uid is null then raise exception 'Authentication required' using errcode='42501';end if;
 foreach t in array array['profiles','user_drafts','user_lesson_progress','user_mission_runs','quiz_attempts','practice_attempts','learning_documents'] loop
 execute format('select coalesce(jsonb_agg(to_jsonb(r)),''[]''::jsonb) from public.%I r where user_id=$1',t) into rows using uid;
 result:=result||jsonb_build_object(t,rows);end loop;
 return jsonb_build_object('schema_version',2,'exported_at',now(),'data',result);
end $$;
