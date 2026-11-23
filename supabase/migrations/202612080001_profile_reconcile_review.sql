-- REVIEW ONLY. Local provisioning reconciliation; not deployed.
-- Never abandons or undoes a committed profile. The request UUID must be saved
-- by the operator before transmission. Only READ COMMITTED is supported.
begin;
create table academy_private.profile_provision_fences (
 admin_id uuid not null references public.profiles(id) on delete restrict,
 request_id uuid not null,
 created_at timestamptz not null default clock_timestamp(),
 primary key(admin_id,request_id)
);
create index profile_provision_fences_recent on academy_private.profile_provision_fences(admin_id,created_at);
alter table academy_private.profile_provision_fences enable row level security;
revoke all on academy_private.profile_provision_fences from public,anon,authenticated,service_role;

create or replace function public.admin_provision_academy_profile(p_request uuid,p_target uuid,p_role text,p_display_name text,p_first_name text,p_grade smallint,p_reference text)
returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid := (select auth.uid()); digest bytea; prior academy_private.profile_provision_audit%rowtype;
begin
  if current_setting('transaction_isolation') <> 'read committed' then raise exception 'Read committed required' using errcode='40001'; end if;
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
  if exists(select 1 from academy_private.profile_provision_fences where admin_id=actor and request_id=p_request) then raise exception 'Request abandoned'; end if;
  -- Different request IDs for the same target must not both create a profile.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('academy.profile-target:' || p_target::text,0));
  -- Require a confirmed, active non-anonymous Auth account at provision time.
  -- This is not identity/custody verification or ongoing session revocation.
  perform 1 from auth.users where id=p_target and email_confirmed_at is not null
    and (banned_until is null or banned_until<=clock_timestamp()) and deleted_at is null
    and not coalesce(is_anonymous,false) for share;
  if not found then raise exception 'Auth account unavailable'; end if;
  insert into public.profiles(id,display_name,first_name) values(p_target,btrim(p_display_name),btrim(p_first_name));
  insert into public.user_roles(user_id,role) values(p_target,p_role);
  if p_role='student' then insert into public.student_grades(student_id,grade) values(p_target,p_grade); end if;
  insert into academy_private.profile_provision_audit(admin_id,request_id,target_id,payload_digest,authorization_reference)
    values(actor,p_request,p_target,digest,p_reference);
  return p_target;
end; $$;

-- This uses the same request lock as provisioning. An absent request receives a
-- durable fence, so a late original cannot commit after an 'abandoned' result.
create function public.admin_resolve_profile_provision(p_request uuid)
returns table(state text,target_id uuid) language plpgsql security definer set search_path='' as $$
declare actor uuid:=(select auth.uid()); prior academy_private.profile_provision_audit%rowtype;
begin
 if current_setting('transaction_isolation') <> 'read committed' then raise exception 'Read committed required' using errcode='40001'; end if;
 if actor is null or p_request is null or not academy_private.has_role('admin') then raise exception 'Not authorized or invalid request'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('academy.profile-request:' || actor::text || ':' || p_request::text,0));
 perform 1 from public.user_roles where user_id=actor and role='admin' for key share;
 if not found then raise exception 'Not authorized or invalid request'; end if;
 select * into prior from academy_private.profile_provision_audit a where a.admin_id=actor and a.request_id=p_request;
 if found then return query select 'committed'::text,prior.target_id; return; end if;
 if exists(select 1 from academy_private.profile_provision_fences f where f.admin_id=actor and f.request_id=p_request) then return query select 'abandoned'::text,null::uuid;return; end if;
 -- Limit new tombstones without affecting exact retries.
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('academy.profile-fence-quota:' || actor::text,0));
 if (select count(*) from academy_private.profile_provision_fences f where f.admin_id=actor and f.created_at>clock_timestamp()-interval '10 minutes')>=30
    or (select count(*) from academy_private.profile_provision_fences f where f.admin_id=actor)>=10000 then raise exception 'Request quota exceeded'; end if;
 insert into academy_private.profile_provision_fences(admin_id,request_id) values(actor,p_request);
 return query select 'abandoned'::text,null::uuid;
end; $$;
revoke all on function public.admin_provision_academy_profile(uuid,uuid,text,text,text,smallint,text),public.admin_resolve_profile_provision(uuid) from public,anon,authenticated,service_role;
grant execute on function public.admin_provision_academy_profile(uuid,uuid,text,text,text,smallint,text),public.admin_resolve_profile_provision(uuid) to authenticated;
commit;
