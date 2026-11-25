-- REVIEW ONLY. Apply only after reviewing the target schema and email Auth settings.
-- No Google proof or signup gate dependencies; existing roles and links are not changed.
begin;
create function public.choose_email_role(p_expected_user uuid, p_role text)
returns text language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := (select auth.uid());
  methods jsonb := (select auth.jwt())->'amr';
  placeholder_name text;
begin
  if actor is null or p_expected_user is distinct from actor
     or p_role is null or p_role not in ('student','parent')
     or jsonb_typeof(methods) is distinct from 'array' then
    raise exception 'Enrollment unavailable';
  end if;
  -- The signed JWT's AMR must identify a password session, never an OAuth or
  -- recovery-only session. MFA may add totp; other methods are not accepted.
  if not exists (select 1 from jsonb_array_elements(methods) m where m->>'method' = 'password')
     or exists (select 1 from jsonb_array_elements(methods) m where coalesce(m->>'method','') not in ('password','totp')) then
    raise exception 'Enrollment unavailable';
  end if;
  perform 1 from auth.users u where u.id=actor and u.email_confirmed_at is not null
    and u.deleted_at is null and not coalesce(u.is_anonymous,false)
    and (u.banned_until is null or u.banned_until<=statement_timestamp()) for key share;
  if not found then raise exception 'Enrollment unavailable'; end if;
  perform academy_private.lock_role_lifecycle(actor,p_role);
  if exists(select 1 from public.user_roles where user_id=actor and role=p_role) then
    if not exists(select 1 from public.profiles where id=actor) then raise exception 'Enrollment unavailable'; end if;
    return 'already_enrolled';
  end if;
  if exists(select 1 from academy_private.role_lifecycle_epochs where user_id=actor and role=p_role)
     or (p_role='student' and exists(select 1 from public.student_grades where student_id=actor)) then
    raise exception 'Enrollment unavailable';
  end if;
  placeholder_name := case p_role when 'student' then 'მოსწავლე' else 'მშობელი' end;
  insert into public.profiles(id,display_name,first_name) values(actor,placeholder_name,placeholder_name) on conflict(id) do nothing;
  insert into public.user_roles(user_id,role) values(actor,p_role);
  return 'created';
end; $$;
revoke all on function public.choose_email_role(uuid,text) from public,anon,authenticated,service_role;
grant execute on function public.choose_email_role(uuid,text) to authenticated;
commit;
