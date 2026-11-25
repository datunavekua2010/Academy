-- LOCAL REVIEW ONLY. DO NOT APPLY TO STAGING OR PRODUCTION.
-- Requires the reviewed Google proof and lifecycle candidates. This creates an
-- unlinked parent role only; a checkbox and Google identity do not establish
-- authority over any child, and this function creates no family relationships.
-- Privacy, age, abuse limits, real Auth and safe deployment remain unresolved.
begin;
create function public.review_parent_self_enroll(p_expected_user uuid,p_display_name text)
returns text language plpgsql security definer set search_path='' as $$
declare actor uuid := (select auth.uid()); display_name text := pg_catalog.btrim(p_display_name);
begin
  if actor is null or actor is distinct from p_expected_user
     or academy_private.review_google_proof_current() is distinct from true
     or display_name is null or pg_catalog.char_length(display_name) not between 1 and 100
     or display_name ~ '[[:cntrl:]]' then raise exception 'Enrollment unavailable'; end if;
  perform 1 from auth.users u where u.id=actor and u.email_confirmed_at is not null
    and u.deleted_at is null and not coalesce(u.is_anonymous,false)
    and (u.banned_until is null or u.banned_until<=statement_timestamp()) for key share;
  if not found then raise exception 'Enrollment unavailable'; end if;
  perform academy_private.lock_role_lifecycle(actor,'parent');
  if exists(select 1 from public.user_roles where user_id=actor and role='parent') then
    if not exists(select 1 from public.profiles where id=actor) then raise exception 'Enrollment unavailable'; end if;
    return 'already_enrolled';
  end if;
  -- Never use self-service to reinstate a revoked role.
  if exists(select 1 from academy_private.role_lifecycle_epochs where user_id=actor and role='parent') then
    raise exception 'Enrollment unavailable';
  end if;
  insert into public.profiles(id,display_name,first_name) values(actor,display_name,display_name) on conflict(id) do nothing;
  insert into public.user_roles(user_id,role) values(actor,'parent');
  return 'created';
end; $$;
revoke all on function public.review_parent_self_enroll(uuid,text) from public,anon,authenticated,service_role;
grant execute on function public.review_parent_self_enroll(uuid,text) to authenticated;
commit;
