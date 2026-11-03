-- DATUM 2.1. Apply once through migration tooling. Never expose service-role credentials.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (length(display_name) <= 80),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create function public.create_profile() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(user_id) values(new.id) on conflict do nothing;
  return new;
end $$;
revoke all on function public.create_profile() from public, anon, authenticated;
create trigger datum_profile after insert on auth.users for each row execute function public.create_profile();
insert into public.profiles(user_id) select id from auth.users on conflict do nothing;

create table public.content_items (
  id text not null check(length(id) between 1 and 80), version integer not null check(version > 0),
  kind text not null check(kind in ('lesson','mission','quiz','practice')),
  title text not null, published boolean not null default false,
  created_at timestamptz not null default now(), primary key(id,version), unique(id,version,kind)
);
create table public.user_drafts (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  content_id text not null, content_version integer not null,
  body jsonb not null check(jsonb_typeof(body)='object' and octet_length(body::text)<=24000),
  revision integer not null default 1 check(revision > 0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  foreign key(content_id,content_version) references public.content_items(id,version),
  unique(user_id,content_id,content_version), unique(id,user_id)
);
create table public.user_lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  content_id text not null, content_version integer not null,
  status text not null check(status in ('draft_saved','reflection_saved')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  primary key(user_id,content_id,content_version),
  foreign key(content_id,content_version) references public.content_items(id,version)
);
create table public.user_mission_runs (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  content_id text not null, content_version integer not null,
  stage text not null default 'BRIEF' check(stage in ('BRIEF','HYPOTHESIS','EXPLORE','EXPERIMENT','EXPLAIN','REFLECT','COMPLETE')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  foreign key(content_id,content_version) references public.content_items(id,version),
  unique(user_id,content_id,content_version), unique(id,user_id)
);
-- These tables are reserved for authenticated server grading in 2.3. No browser writes.
create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  content_id text not null, content_version integer not null, run_id uuid,
  request_id uuid not null, responses jsonb not null default '{}' check(octet_length(responses::text)<=24000),
  verified_score numeric check(verified_score between 0 and 1),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(user_id,request_id), foreign key(content_id,content_version) references public.content_items(id,version),
  foreign key(run_id,user_id) references public.user_mission_runs(id,user_id) on delete cascade
);
create table public.practice_attempts (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  content_id text not null, content_version integer not null, run_id uuid,
  request_id uuid not null, code text not null check(length(code)<=10000),
  practice_passed boolean, verified_score numeric check(verified_score between 0 and 1),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(user_id,request_id), foreign key(content_id,content_version) references public.content_items(id,version),
  foreign key(run_id,user_id) references public.user_mission_runs(id,user_id) on delete cascade
);
create table private.assessment_keys (
  content_id text not null, content_version integer not null, solution jsonb not null,
  primary key(content_id,content_version), foreign key(content_id,content_version) references public.content_items(id,version)
);
revoke all on private.assessment_keys from public, anon, authenticated;
-- Reject mismatched content types even when a trusted server writes records.
do $$ declare entry text[]; begin
  foreach entry slice 1 in array array[['user_lesson_progress','lesson'],['user_mission_runs','mission'],['quiz_attempts','quiz'],['practice_attempts','practice']] loop
    execute format('alter table public.%I add column content_kind text generated always as (%L::text) stored',entry[1],entry[2]);
    execute format('alter table public.%I add foreign key(content_id,content_version,content_kind) references public.content_items(id,version,kind)',entry[1]);
  end loop;
end $$;

create function public.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;
revoke all on function public.touch_updated_at() from public, anon, authenticated;
do $$ declare t text; begin
  foreach t in array array['profiles','user_drafts','user_lesson_progress','user_mission_runs','quiz_attempts','practice_attempts'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from anon, authenticated',t);
    execute format('grant select on public.%I to authenticated',t);
    execute format('create policy owner_read on public.%I for select to authenticated using ((select auth.uid()) = user_id)',t);
    execute format('create trigger updated_at before update on public.%I for each row execute function public.touch_updated_at()',t);
    execute format('create index on public.%I(user_id,updated_at desc)',t);
  end loop;
end $$;
alter table public.content_items enable row level security;
revoke all on public.content_items from anon, authenticated;
grant select on public.content_items to anon, authenticated;
create policy published_read on public.content_items for select to anon,authenticated using(published);
grant update(display_name) on public.profiles to authenticated;
create policy owner_profile_update on public.profiles for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);

-- One bounded RPC owns writes. User identity comes only from the verified JWT.
-- Revisions prevent lost updates; same-payload retries return the existing row.
create function public.save_draft(p_content_id text, p_version integer, p_body jsonb, p_expected_revision integer, p_owner uuid)
returns public.user_drafts language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); item public.content_items; saved public.user_drafts;
begin
  if uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if p_owner is distinct from uid then raise exception 'Account changed. Reload before saving.' using errcode='42501'; end if;
  if p_expected_revision is null or p_expected_revision < 0 or p_body is null or jsonb_typeof(p_body)<>'object' or octet_length(p_body::text)>24000 then
    raise exception 'Invalid draft' using errcode='22023';
  end if;
  select * into item from public.content_items where id=p_content_id and version=p_version and published;
  if not found or item.kind not in ('lesson','mission') then raise exception 'Content unavailable' using errcode='22023'; end if;
  if item.kind='lesson' then
    if not (p_body ? 'reflection') or (p_body - 'reflection') <> '{}'::jsonb
      or jsonb_typeof(p_body->'reflection') <> 'string' or length(p_body->>'reflection')>2000 then
      raise exception 'Invalid lesson draft' using errcode='22023';
    end if;
  else
    if not (p_body ?& array['hypothesis','code','query','panel']) or (p_body - array['hypothesis','code','query','panel']) <> '{}'::jsonb
      or jsonb_typeof(p_body->'hypothesis')<>'string' or length(p_body->>'hypothesis')>1500
      or jsonb_typeof(p_body->'code')<>'string' or length(p_body->>'code')>10000
      or jsonb_typeof(p_body->'query')<>'string' or length(p_body->>'query')>200
      or jsonb_typeof(p_body->'panel')<>'string' or p_body->>'panel' not in ('Data','Chart','Python') then
      raise exception 'Invalid mission draft' using errcode='22023';
    end if;
  end if;
  -- Serializes inserts as well as updates for this owner/content pair.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(uid::text || ':' || p_content_id || ':' || p_version::text,0));
  select * into saved from public.user_drafts where user_id=uid and content_id=p_content_id and content_version=p_version for update;
  if found then
    if saved.body=p_body then return saved; end if;
    if saved.revision<>p_expected_revision then raise exception 'Draft changed elsewhere. Reload before saving.' using errcode='40001'; end if;
    update public.user_drafts set body=p_body,revision=revision+1 where id=saved.id returning * into saved;
  else
    if p_expected_revision<>0 then raise exception 'Draft changed elsewhere. Reload before saving.' using errcode='40001'; end if;
    insert into public.user_drafts(user_id,content_id,content_version,body) values(uid,p_content_id,p_version,p_body) returning * into saved;
  end if;
  if item.kind='lesson' then
    insert into public.user_lesson_progress(user_id,content_id,content_version,status)
      values(uid,p_content_id,p_version,case when length(trim(p_body->>'reflection'))>0 then 'reflection_saved' else 'draft_saved' end)
      on conflict(user_id,content_id,content_version) do update set status=excluded.status;
  else
    insert into public.user_mission_runs(user_id,content_id,content_version) values(uid,p_content_id,p_version)
      on conflict(user_id,content_id,content_version) do update set updated_at=now();
  end if;
  return saved;
end $$;
revoke all on function public.save_draft(text,integer,jsonb,integer,uuid) from public, anon;
grant execute on function public.save_draft(text,integer,jsonb,integer,uuid) to authenticated;

-- Explicit, atomic import; existing cloud drafts are never replaced.
create function public.import_guest_drafts(p_drafts jsonb, p_owner uuid) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare d jsonb; saved public.user_drafts; imported integer:=0; kept integer:=0;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
  if p_owner is distinct from auth.uid() then raise exception 'Account changed. Reload before importing.' using errcode='42501'; end if;
  if p_drafts is null or jsonb_typeof(p_drafts)<>'array' or jsonb_array_length(p_drafts)>30 or octet_length(p_drafts::text)>300000 then raise exception 'Invalid import' using errcode='22023'; end if;
  for d in select value from jsonb_array_elements(p_drafts) order by value->>'content_id' loop
    begin
      saved := public.save_draft(d->>'content_id',(d->>'content_version')::integer,d->'body',0,p_owner);
      imported := imported+1;
    exception when serialization_failure then kept:=kept+1;
    end;
  end loop;
  return jsonb_build_object('imported',imported,'kept',kept);
end $$;
revoke all on function public.import_guest_drafts(jsonb,uuid) from public, anon;
grant execute on function public.import_guest_drafts(jsonb,uuid) to authenticated;

create function public.export_my_data() returns jsonb language plpgsql security definer set search_path = '' as $$
declare uid uuid:=auth.uid(); result jsonb:='{}'; t text; rows jsonb;
begin
  if uid is null then raise exception 'Authentication required' using errcode='42501'; end if;
  foreach t in array array['profiles','user_drafts','user_lesson_progress','user_mission_runs','quiz_attempts','practice_attempts'] loop
    execute format('select coalesce(jsonb_agg(to_jsonb(r)),''[]''::jsonb) from public.%I r where user_id=$1',t) into rows using uid;
    result := result || jsonb_build_object(t,rows);
  end loop;
  return jsonb_build_object('schema_version',1,'exported_at',now(),'data',result);
end $$;
revoke all on function public.export_my_data() from public, anon;
grant execute on function public.export_my_data() to authenticated;
