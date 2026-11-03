-- Solutions are private at the API boundary. This public educational repository is not a high-stakes exam bank.
insert into public.content_items(id,version,kind,title,published) values('delivery-assessment',1,'quiz','Data Detective foundations',true);
insert into private.assessment_keys(content_id,content_version,solution) values('delivery-assessment',1,$keys$[{"id": "rows", "kind": "single", "skill": "Data literacy", "answer": "delivery", "explanation": "A row is one delivery. Weather and distance are columns; a weather category may occur in many rows.", "options": ["delivery", "weather", "variable"]}, {"id": "types", "kind": "multi", "skill": "Data literacy", "answer": ["rush", "weather"], "explanation": "Weather and the yes/no rush flag are categories. Distance and duration measure quantities.", "options": ["weather", "rush", "distance", "duration"]}, {"id": "causal", "kind": "boolean", "skill": "Causal reasoning", "answer": "false", "explanation": "False: distance and rush hour can differ between weather groups. True overstates observational evidence.", "options": ["true", "false"]}, {"id": "mean", "kind": "numeric", "skill": "Statistical reasoning", "answer": 30, "explanation": "(10 + 20 + 60) / 3 = 30. The median is 20; it is not the mean.", "options": []}, {"id": "median", "kind": "numeric", "skill": "Statistical reasoning", "answer": 25, "explanation": "The two middle values are 20 and 30; their average is 25. Averaging all four gives the mean, 40.", "options": []}, {"id": "output", "kind": "output", "skill": "Python foundations", "answer": "30", "explanation": "A negative index counts from the end. -1 selects 30. Index 3 would raise IndexError.", "options": ["10", "30", "error"]}, {"id": "missing", "kind": "scenario", "skill": "Data cleaning", "answer": "inspect", "explanation": "Inspect the pattern first. Zero invents a measured duration. Silent deletion can bias weather comparisons.", "options": ["inspect", "zero", "ignore"]}, {"id": "outliers", "kind": "single", "skill": "Statistical reasoning", "answer": "median", "explanation": "Median depends on order rather than the extreme magnitude. Mean and maximum change directly with that large value.", "options": ["median", "mean", "maximum"]}, {"id": "split", "kind": "scenario", "skill": "Evaluation", "answer": "train", "explanation": "Training-only fitting keeps test information out of the learning process. All-data fitting leaks information; test-only fitting defeats held-out evaluation.", "options": ["train", "all", "test"]}, {"id": "sample", "kind": "boolean", "skill": "Uncertainty", "answer": "false", "explanation": "A seed makes sampling reproducible. It does not repair a biased source population or guarantee representativeness.", "options": ["true", "false"]}, {"id": "spread", "kind": "numeric", "skill": "Statistical reasoning", "answer": 0, "explanation": "Every value equals the mean, so every deviation and squared deviation is zero. The standard deviation is zero, not seven.", "options": []}, {"id": "evidence", "kind": "multi", "skill": "Evidence reasoning", "answer": ["limits", "source"], "explanation": "Source and transformation references enable reproduction; limitations constrain interpretation. Color is optional and absolute certainty is unsupported.", "options": ["source", "limits", "color", "certainty"]}]$keys$::jsonb);
alter table public.quiz_attempts add column feedback jsonb not null default '[]';
create function public.grade_delivery_quiz(p_request_id uuid,p_answers jsonb,p_owner uuid) returns public.quiz_attempts language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); saved public.quiz_attempts; keys jsonb; q jsonb; response jsonb; normalized jsonb; correct boolean; score integer:=0; feedback jsonb:='[]';
begin
 if uid is null or uid is distinct from p_owner then raise exception 'Authentication required' using errcode='42501';end if;
 if p_request_id is null or p_answers is null or jsonb_typeof(p_answers)<>'object' or octet_length(p_answers::text)>12000 then raise exception 'Invalid answers' using errcode='22023';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(uid::text||':quiz',0));
 select * into saved from public.quiz_attempts where user_id=uid and request_id=p_request_id;
 if found then
  if saved.responses<>p_answers or saved.content_id<>'delivery-assessment' then raise exception 'Request already used with different answers' using errcode='22023';end if;
  return saved;
 end if;
 if (select count(*) from public.quiz_attempts where user_id=uid and created_at>now()-interval '1 hour')>=20 then raise exception 'Hourly attempt limit reached' using errcode='54000';end if;
 select solution into keys from private.assessment_keys where content_id='delivery-assessment' and content_version=1;
 if (select count(*) from jsonb_object_keys(p_answers))<>jsonb_array_length(keys) then raise exception 'Answer all questions exactly once' using errcode='22023';end if;
 for q in select value from jsonb_array_elements(keys) loop
  response:=p_answers->(q->>'id');correct:=false;
  if response is null then raise exception 'Missing answer' using errcode='22023';end if;
  if q->>'kind'='numeric' then
   if jsonb_typeof(response)<>'number' then raise exception 'Numeric answer required' using errcode='22023';end if;
   correct:=abs((response#>>'{}')::numeric-(q->>'answer')::numeric)<=0.001;
  elsif q->>'kind'='multi' then
   if jsonb_typeof(response)<>'array' or jsonb_array_length(response)>4 or jsonb_array_length(response)=0 then raise exception 'Invalid selections' using errcode='22023';end if;
   if exists(select 1 from jsonb_array_elements(response) v where not(q->'options' @> jsonb_build_array(v))) then raise exception 'Unknown option' using errcode='22023';end if;
   select jsonb_agg(value order by value) into normalized from (select distinct value from jsonb_array_elements(response)) s;
   if jsonb_array_length(normalized)<>jsonb_array_length(response) then raise exception 'Duplicate option' using errcode='22023';end if;
   correct:=normalized=q->'answer';
  else
   if jsonb_typeof(response)<>'string' or not(q->'options' @> jsonb_build_array(response)) then raise exception 'Unknown option' using errcode='22023';end if;
   correct:=response=q->'answer';
  end if;
  if correct then score:=score+1;end if;
  feedback:=feedback||jsonb_build_array(jsonb_build_object('id',q->>'id','skill',q->>'skill','correct',correct,'explanation',q->>'explanation'));
 end loop;
 insert into public.quiz_attempts(user_id,content_id,content_version,request_id,responses,verified_score,feedback) values(uid,'delivery-assessment',1,p_request_id,p_answers,score::numeric/jsonb_array_length(keys),feedback) returning * into saved;
 return saved;
end $$;
revoke all on function public.grade_delivery_quiz(uuid,jsonb,uuid) from public,anon;
grant execute on function public.grade_delivery_quiz(uuid,jsonb,uuid) to authenticated;
