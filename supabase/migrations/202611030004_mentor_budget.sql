create table private.mentor_requests(id bigint generated always as identity primary key,user_id uuid not null references auth.users(id) on delete cascade,created_at timestamptz not null default now());
create index on private.mentor_requests(user_id,created_at);
create index on private.mentor_requests(created_at);
revoke all on private.mentor_requests from public,anon,authenticated;
create function public.consume_mentor_budget(p_user uuid) returns boolean language plpgsql security definer set search_path='' as $$
begin
 perform pg_catalog.pg_advisory_xact_lock(736291);
 delete from private.mentor_requests where created_at<now()-interval '2 days';
 if p_user is null or not exists(select 1 from auth.users where id=p_user) then return false;end if;
 if (select count(*) from private.mentor_requests where user_id=p_user and created_at>now()-interval '1 minute')>=3
 or (select count(*) from private.mentor_requests where user_id=p_user and created_at>now()-interval '24 hours')>=20
 or (select count(*) from private.mentor_requests where created_at>now()-interval '24 hours')>=1000 then return false;end if;
 insert into private.mentor_requests(user_id) values(p_user);return true;
end $$;
revoke all on function public.consume_mentor_budget(uuid) from public,anon,authenticated;
grant execute on function public.consume_mentor_budget(uuid) to service_role;
