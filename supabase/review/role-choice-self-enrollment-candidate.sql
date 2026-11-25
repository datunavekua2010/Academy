-- REVIEW ONLY; not an automatic migration. Do not apply to production.
-- Requires the already-installed additive proof/enrollment gates and the role
-- lifecycle functions. Choosing a role never grants teacher/admin privileges,
-- creates a parent-child link, or fabricates a student's grade. Existing names
-- and revoked-role state are preserved. Real-provider and security review remain
-- required before enabling the gates.
begin;

create function public.review_choose_google_role(p_expected_user uuid, p_role text)
returns text language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := (select auth.uid());
  placeholder_name text;
begin
  if not academy_private.signup_release_enabled('enrollment')
     or actor is null or p_expected_user is distinct from actor
     or p_role is null or p_role not in ('student','parent')
     or academy_private.review_google_proof_current() is distinct from true then
    raise exception 'Enrollment unavailable';
  end if;

  perform 1 from auth.users u where u.id=actor and u.email_confirmed_at is not null
    and u.deleted_at is null and not coalesce(u.is_anonymous,false)
    and (u.banned_until is null or u.banned_until<=statement_timestamp()) for key share;
  if not found then raise exception 'Enrollment unavailable'; end if;

  perform academy_private.lock_role_lifecycle(actor,p_role);
  if exists(select 1 from public.user_roles where user_id=actor and role=p_role) then
    if not exists(select 1 from public.profiles where id=actor) then
      raise exception 'Enrollment unavailable';
    end if;
    return 'already_enrolled';
  end if;
  -- Self-service must never undo a revocation or repair a conflicting orphan.
  if exists(select 1 from academy_private.role_lifecycle_epochs where user_id=actor and role=p_role)
     or (p_role='student' and exists(select 1 from public.student_grades where student_id=actor)) then
    raise exception 'Enrollment unavailable';
  end if;

  -- Placeholder only, not a Google name or a claim about parental authority.
  -- Never overwrite an existing profile owned by a multi-role account.
  placeholder_name := case p_role when 'student' then 'მოსწავლე' else 'მშობელი' end;
  insert into public.profiles(id,display_name,first_name)
    values(actor,placeholder_name,placeholder_name) on conflict(id) do nothing;
  insert into public.user_roles(user_id,role) values(actor,p_role);
  return 'created';
end; $$;
revoke all on function public.review_choose_google_role(uuid,text) from public,anon,authenticated,service_role;
grant execute on function public.review_choose_google_role(uuid,text) to authenticated;
commit;
