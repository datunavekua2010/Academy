-- LOCAL REVIEW PROTOTYPE ONLY. DO NOT APPLY TO STAGING OR PRODUCTION.
-- OAuth is NOT inherently Google: this candidate is valid only after all OAuth
-- entry paths and past sessions are proven to be Google-only for the project.
-- Existing JWTs and direct/SECURITY DEFINER paths require separate assessment.
-- This is not a complete provider-specific authorization solution.
begin;

-- Accept exactly one permitted primary method plus optional TOTP. Ambiguous,
-- absent, malformed and unrecognized claims fail closed. JWTs must be verified
-- by the Supabase gateway; this helper is not a verifier for arbitrary strings.
create function academy_private.role_session_method_allows(required_role text)
returns boolean language plpgsql stable security definer set search_path = '' as $$
declare methods jsonb; entry jsonb; primary_method text; target text;
begin
  target := case required_role when 'student' then 'oauth' when 'parent' then 'oauth' when 'teacher' then 'password' else null end;
  if target is null then return false; end if;
  if not exists(select 1 from auth.sessions s where s.id::text=(select auth.jwt()->>'session_id') and s.user_id=(select auth.uid()) and (s.not_after is null or s.not_after>statement_timestamp())) then return false; end if;
  methods := (select auth.jwt())->'amr';
  if pg_catalog.jsonb_typeof(methods) is distinct from 'array' then return false; end if;
  for entry in select value from pg_catalog.jsonb_array_elements(methods) loop
    if pg_catalog.jsonb_typeof(entry) is distinct from 'object' or pg_catalog.jsonb_typeof(entry->'method') is distinct from 'string' then return false; end if;
    if entry->>'method' = 'totp' then continue; end if;
    if entry->>'method' <> target or primary_method is not null then return false; end if;
    primary_method := entry->>'method';
  end loop;
  return primary_method is not null;
end; $$;
revoke all on function academy_private.role_session_method_allows(text) from public, anon;
grant execute on function academy_private.role_session_method_allows(text) to authenticated;

-- This preserves admin behavior pending a separate admin/recovery decision.
create or replace function academy_private.has_role(required_role text) returns boolean
language sql stable security definer set search_path = '' as $$
  select case
    when required_role = 'admin' then true
    when required_role in ('student','parent','teacher') then academy_private.role_session_method_allows(required_role)
    else false
  end and exists (select 1 from public.user_roles where user_id = (select auth.uid()) and role = required_role);
$$;

-- The previous self-ID branch otherwise bypasses the method-aware role check.
create or replace function academy_private.can_view_student(target_student uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.user_roles where user_id=target_student and role='student') and (
   (target_student=(select auth.uid()) and academy_private.has_role('student')) or academy_private.can_teach(target_student) or
   (academy_private.has_role('parent') and exists(select 1 from public.parent_students where parent_id=(select auth.uid()) and student_id=target_student))
 );
$$;

-- This live RPC used a direct role-row lock instead of has_role. Keep the row
-- lock/revision/capacity behavior, and additionally check the session method.
create or replace function public.teacher_classroom_set_capacity(p_id uuid, p_capacity integer, p_revision bigint)
returns boolean language plpgsql security definer set search_path = '' as $$
declare c public.classrooms%rowtype; occupied bigint;
begin
  if not academy_private.has_role('teacher') or p_capacity is null or p_capacity < 1 then raise exception 'Not authorized or invalid capacity'; end if;
  select * into c from public.classrooms where id = p_id and teacher_id = (select auth.uid()) and archived_at is null and revision = p_revision for update;
  if not found then raise exception 'Classroom unavailable or changed'; end if;
  perform 1 from public.user_roles r where r.user_id = (select auth.uid()) and r.role = 'teacher' for key share;
  if not found then raise exception 'Not authorized or invalid capacity'; end if;
  if academy_private.classroom_has_inactive_members(c.id, c.teacher_id) then raise exception 'Membership review required'; end if;
  select count(*) into occupied from public.classroom_students cs where cs.classroom_id = c.id;
  if occupied > p_capacity then raise exception 'Capacity below current occupancy'; end if;
  update public.classrooms set capacity = p_capacity, revision = revision + 1, updated_at = clock_timestamp() where id = c.id;
  return true;
end; $$;
commit;
