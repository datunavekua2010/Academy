-- LOCAL REVIEW ONLY. DO NOT APPLY TO STAGING OR PRODUCTION.
-- Depends on both role-signin-method-candidate.sql and
-- google-session-proof-candidate.sql. This is not a complete access-path or
-- policy review, nor a tested deployment/rollback plan.
begin;
create or replace function academy_private.has_role(required_role text) returns boolean
language sql stable security definer set search_path = '' as $$
  select case
    when required_role = 'admin' then true
    when required_role in ('student','parent') then academy_private.review_google_proof_current()
    when required_role = 'teacher' then academy_private.role_session_method_allows(required_role)
    else false
  end and exists (select 1 from public.user_roles where user_id=(select auth.uid()) and role=required_role);
$$;

-- The self-visible user_roles row does not indicate whether the current
-- session is allowed to use the teacher role. This returns only a boolean;
-- the protected RPCs and RLS still enforce authorization independently.
create function public.review_teacher_session_status() returns boolean
language sql stable security definer set search_path = '' as $$
  select academy_private.has_role('teacher');
$$;
revoke all on function public.review_teacher_session_status() from public,anon,service_role;
grant execute on function public.review_teacher_session_status() to authenticated;
commit;
