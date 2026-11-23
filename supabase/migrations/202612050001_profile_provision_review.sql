-- REVIEW ONLY. Never applied remotely. Requires the full prior review chain.
-- Only profiles for Auth users that already exist may be provisioned. This
-- does NOT create Auth users, send credentials, collect consent, or set billing.
begin;
create table academy_private.profile_provision_audit (
  admin_id uuid not null references public.profiles(id) on delete restrict,
  request_id uuid not null,
  target_id uuid not null references public.profiles(id) on delete restrict,
  payload_digest bytea not null check(octet_length(payload_digest)=32),
  authorization_reference text not null check (authorization_reference ~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$'),
  created_at timestamptz not null default clock_timestamp(),
  primary key(admin_id,request_id)
);
alter table academy_private.profile_provision_audit enable row level security;
revoke all on academy_private.profile_provision_audit from public,anon,authenticated,service_role;

-- Admin independently confirms the Auth identity and authorization first.
-- A request ID and exact normalized payload are required for safe retry. An
-- existing profile cannot be overwritten; use separate reviewed workflows.
create function public.admin_provision_academy_profile(p_request uuid,p_target uuid,p_role text,p_display_name text,p_first_name text,p_grade smallint,p_reference text)
returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid := (select auth.uid()); digest bytea; prior academy_private.profile_provision_audit%rowtype;
begin
  if actor is null or p_request is null or p_target is null or actor=p_target or p_role is null or p_role not in ('teacher','student','parent')
    or p_display_name is null or char_length(btrim(p_display_name)) not between 1 and 200
    or p_first_name is null or char_length(btrim(p_first_name)) not between 1 and 100
    or (p_role='student' and (p_grade is null or p_grade not between 1 and 7)) or (p_role<>'student' and p_grade is not null)
    or p_reference is null or p_reference !~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$' or not academy_private.has_role('admin') then
    raise exception 'Not authorized or invalid request';
  end if;
  -- A digest is for equality checking only; it is not anonymization.
  digest := pg_catalog.sha256(pg_catalog.convert_to(pg_catalog.jsonb_build_array(p_target,p_role,btrim(p_display_name),btrim(p_first_name),p_grade,p_reference)::text,'UTF8'));
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('academy.profile-request:' || actor::text || ':' || p_request::text,0));
  perform 1 from public.user_roles where user_id=actor and role='admin' for key share;
  if not found then raise exception 'Not authorized or invalid request'; end if;
  select * into prior from academy_private.profile_provision_audit where admin_id=actor and request_id=p_request;
  if found then
    if prior.payload_digest<>digest or prior.target_id<>p_target then raise exception 'Request already used'; end if;
    return prior.target_id;
  end if;
  -- Different request IDs for the same target must not both create a profile.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('academy.profile-target:' || p_target::text,0));
  perform 1 from auth.users where id=p_target for key share;
  if not found then raise exception 'Auth account unavailable'; end if;
  insert into public.profiles(id,display_name,first_name) values(p_target,btrim(p_display_name),btrim(p_first_name));
  insert into public.user_roles(user_id,role) values(p_target,p_role);
  if p_role='student' then insert into public.student_grades(student_id,grade) values(p_target,p_grade); end if;
  insert into academy_private.profile_provision_audit(admin_id,request_id,target_id,payload_digest,authorization_reference)
    values(actor,p_request,p_target,digest,p_reference);
  return p_target;
end; $$;
revoke all on function public.admin_provision_academy_profile(uuid,uuid,text,text,text,smallint,text) from public,anon,authenticated,service_role;
grant execute on function public.admin_provision_academy_profile(uuid,uuid,text,text,text,smallint,text) to authenticated;
commit;
