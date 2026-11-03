create function public.my_mentor_usage() returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='42501'; end if;
 return (select jsonb_build_object('today',count(*) filter(where created_at>=date_trunc('day',now() at time zone 'UTC') at time zone 'UTC'),'lastMinute',count(*) filter(where created_at>now()-interval '1 minute'),'dailyLimit',20,'minuteLimit',3) from private.mentor_requests where user_id=auth.uid());
end $$;
revoke all on function public.my_mentor_usage() from public,anon;
grant execute on function public.my_mentor_usage() to authenticated;
