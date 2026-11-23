-- REVIEW ONLY; not deployed. Depends on the complete role/link review chain.
-- Parent data is sensitive. Authenticated parent role + current link + current
-- student role are checked on every call. Results are not trusted assessments.
begin;
-- Default to summary-only access for the parent role. Subscription entitlements
-- are deliberately not implemented. A user who separately holds a qualifying
-- student/teacher role may still read through that independent authorization.
drop policy attempts_read on public.exercise_attempts;
create policy attempts_read on public.exercise_attempts for select to authenticated using (
  (student_id=(select auth.uid()) and academy_private.has_role('student'))
  or academy_private.can_teach(student_id)
);
create function public.parent_review_children()
returns table(student_id uuid, display_name text, grade smallint)
language plpgsql stable security definer set search_path='' as $$
begin
  if (select auth.uid()) is null or not academy_private.has_role('parent') then raise exception 'Not authorized'; end if;
  return query select p.id,p.display_name,g.grade from public.parent_students ps
    join public.profiles p on p.id=ps.student_id
    join public.user_roles r on r.user_id=ps.student_id and r.role='student'
    left join public.student_grades g on g.student_id=ps.student_id
    where ps.parent_id=(select auth.uid()) order by p.display_name,p.id;
end; $$;

create function public.parent_review_recent_attempts(p_student uuid)
returns table(attempt_id text, created_at timestamptz, grade smallint, topic_id text, subunit_id text, score numeric)
language plpgsql stable security definer set search_path='' as $$
begin
  if (select auth.uid()) is null or p_student is null or not academy_private.has_role('parent')
    or not exists(select 1 from public.parent_students ps join public.user_roles r on r.user_id=ps.student_id and r.role='student'
                  where ps.parent_id=(select auth.uid()) and ps.student_id=p_student) then raise exception 'Not authorized'; end if;
  return query select a.attempt_id,a.created_at,a.grade,a.topic_id,a.subunit_id,
    case when pg_catalog.jsonb_typeof(a.result->'score')='number' then
      case when (a.result->>'score')::numeric between 0 and 100 then (a.result->>'score')::numeric else null::numeric end
      else null::numeric end
    from public.exercise_attempts a where a.student_id=p_student order by a.created_at desc,a.attempt_id desc limit 30;
end; $$;
revoke all on function public.parent_review_children(),public.parent_review_recent_attempts(uuid) from public,anon,authenticated,service_role;
grant execute on function public.parent_review_children(),public.parent_review_recent_attempts(uuid) to authenticated;
commit;
