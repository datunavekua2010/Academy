-- LOCAL REVIEW ONLY. DO NOT APPLY TO STAGING OR PRODUCTION.
-- Depends on the review-only Google session proof and role lifecycle candidates.
-- Self-enrollment is limited to a first student role and does not grant family
-- relationships, a trial, or access to another person's data. Before deployment:
-- real-provider/session tests, child privacy/consent, anti-abuse controls, schema
-- reconciliation, observability, and a reviewed rollout/rollback are required.
begin;

create function public.review_student_self_enroll(p_expected_user uuid, p_display_name text, p_grade smallint)
returns text language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := (select auth.uid());
  display_name text := pg_catalog.btrim(p_display_name);
  already_student boolean;
begin
  if actor is null or p_expected_user is distinct from actor or academy_private.review_google_proof_current() is distinct from true
     or p_grade is null or p_grade not between 1 and 7
     or display_name is null or pg_catalog.char_length(display_name) not between 1 and 100
     or display_name ~ '[[:cntrl:]]' then
    raise exception 'Enrollment unavailable';
  end if;
  -- Avoid granting privileges to an unconfirmed, anonymous, deleted or banned
  -- account, including accounts whose existing JWT has not yet expired.
  perform 1 from auth.users u where u.id=actor and u.email_confirmed_at is not null
    and u.deleted_at is null and not coalesce(u.is_anonymous,false)
    and (u.banned_until is null or u.banned_until<=statement_timestamp()) for key share;
  if not found then raise exception 'Enrollment unavailable'; end if;

  -- Serialize with lifecycle grants/revocations. Never restore a revoked role.
  perform academy_private.lock_role_lifecycle(actor,'student');
  select exists(select 1 from public.user_roles where user_id=actor and role='student') into already_student;
  if already_student then
    if not exists(select 1 from public.profiles where id=actor)
       or not exists(select 1 from public.student_grades where student_id=actor) then
      raise exception 'Enrollment unavailable';
    end if;
    return 'already_enrolled';
  end if;
  if exists(select 1 from academy_private.role_lifecycle_epochs where user_id=actor and role='student')
     or exists(select 1 from public.student_grades where student_id=actor) then
    raise exception 'Enrollment unavailable';
  end if;
  -- Existing profiles may belong to another role: preserve their name exactly.
  insert into public.profiles(id,display_name,first_name) values(actor,display_name,display_name)
    on conflict(id) do nothing;
  insert into public.user_roles(user_id,role) values(actor,'student');
  insert into public.student_grades(student_id,grade) values(actor,p_grade);
  return 'created';
end; $$;
revoke all on function public.review_student_self_enroll(uuid,text,smallint) from public,anon,authenticated,service_role;
grant execute on function public.review_student_self_enroll(uuid,text,smallint) to authenticated;
commit;
