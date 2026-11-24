-- LOCAL REVIEW ONLY. Depends on the role, proof, parent-link and enrollment candidates.
-- A request or adult attestation is NOT evidence of guardianship or consent.
-- Only an authorized admin may independently verify and approve a relationship.
begin;
create table academy_private.parent_link_applications (
  id uuid primary key,
  parent_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null,
  state text not null default 'pending' check (state in ('pending','approved','rejected','cancelled')),
  created_at timestamptz not null default clock_timestamp(),
  resolved_at timestamptz,
  resolved_by uuid references public.profiles(id) on delete restrict,
  authorization_reference text,
  check (parent_id<>student_id),
  check ((state='pending' and resolved_at is null and resolved_by is null and authorization_reference is null)
    or (state='cancelled' and resolved_at is not null and resolved_by is null and authorization_reference is null)
    or (state in ('approved','rejected') and resolved_at is not null and resolved_by is not null and authorization_reference is not null))
);
create index parent_link_applications_parent_recent on academy_private.parent_link_applications(parent_id,created_at);
create unique index parent_link_applications_one_pending on academy_private.parent_link_applications(parent_id,student_id) where state='pending';
alter table academy_private.parent_link_applications enable row level security;
revoke all on academy_private.parent_link_applications from public,anon,authenticated,service_role;

-- No existence lookup or child information is disclosed to the parent.
create function public.review_parent_link_request(p_request uuid,p_expected_parent uuid,p_student uuid)
returns text language plpgsql security definer set search_path='' as $$
declare actor uuid:=(select auth.uid()); existing academy_private.parent_link_applications%rowtype;
begin
  if actor is null or actor is distinct from p_expected_parent or p_request is null or p_student is null
     or actor=p_student or not academy_private.has_role('parent') then raise exception 'Request unavailable'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('academy.parent-application:' || actor::text,0));
  -- Recheck a role lock after waiting so revocation cannot race submission.
  perform 1 from public.user_roles r where r.user_id=actor and r.role='parent' for key share;
  if not found or not academy_private.has_role('parent') then raise exception 'Request unavailable'; end if;
  select * into existing from academy_private.parent_link_applications where id=p_request;
  if found then
    if existing.parent_id<>actor or existing.student_id<>p_student then raise exception 'Request unavailable'; end if;
    return 'received';
  end if;
  if (select count(*) from academy_private.parent_link_applications where parent_id=actor and state='pending')>=5
     or (select count(*) from academy_private.parent_link_applications where parent_id=actor and created_at>clock_timestamp()-interval '1 day')>=20
     or exists(select 1 from academy_private.parent_link_applications where parent_id=actor and student_id=p_student and state='pending') then
    raise exception 'Request unavailable';
  end if;
  insert into academy_private.parent_link_applications(id,parent_id,student_id) values(p_request,actor,p_student);
  return 'received';
end; $$;

create function public.review_parent_link_my_requests()
returns table(id uuid,student_id uuid,state text,created_at timestamptz)
language plpgsql stable security definer set search_path='' as $$
begin
  if not academy_private.has_role('parent') then raise exception 'Request unavailable'; end if;
  return query select a.id,a.student_id,a.state,a.created_at from academy_private.parent_link_applications a
    where a.parent_id=(select auth.uid()) and a.created_at>statement_timestamp()-interval '90 days'
    order by a.created_at desc,a.id limit 20;
end; $$;

create function public.review_parent_link_cancel(p_expected_parent uuid,p_request uuid)
returns boolean language plpgsql security definer set search_path='' as $$
declare actor uuid := (select auth.uid());
begin
  if actor is null or actor is distinct from p_expected_parent or not academy_private.has_role('parent') then raise exception 'Request unavailable'; end if;
  perform 1 from public.user_roles where user_id=actor and role='parent' for key share;
  if not found or not academy_private.has_role('parent') then raise exception 'Request unavailable'; end if;
  update academy_private.parent_link_applications set state='cancelled',resolved_at=clock_timestamp()
    where id=p_request and parent_id=actor and state='pending';
  return found;
end; $$;

create function public.review_admin_parent_link_applications()
returns table(id uuid,parent_id uuid,student_id uuid,created_at timestamptz)
language plpgsql stable security definer set search_path='' as $$
begin
  if not academy_private.has_role('admin') then raise exception 'Request unavailable'; end if;
  return query select a.id,a.parent_id,a.student_id,a.created_at from academy_private.parent_link_applications a
    where a.state='pending' order by a.created_at,a.id limit 100;
end; $$;

-- The administrator must independently establish identity and authority.
-- The reference is an internal record locator, not proof of authority itself.
create function public.review_admin_parent_link_decide(p_expected_admin uuid,p_request uuid,p_decision text,p_reference text)
returns text language plpgsql security definer set search_path='' as $$
declare actor uuid:=(select auth.uid()); item academy_private.parent_link_applications%rowtype; outcome text;
begin
  if actor is null or actor is distinct from p_expected_admin or p_request is null or p_decision is null or p_decision not in ('approve','reject')
     or p_reference is null or p_reference !~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$'
     or not academy_private.has_role('admin') then raise exception 'Request unavailable'; end if;
  perform 1 from public.user_roles where user_id=actor and role='admin' for key share;
  if not found then raise exception 'Request unavailable'; end if;
  select * into item from academy_private.parent_link_applications where id=p_request for update;
  if not found or actor=item.parent_id or actor=item.student_id then raise exception 'Request unavailable'; end if;
  outcome:=case when p_decision='approve' then 'approved' else 'rejected' end;
  if item.state=outcome and item.resolved_by=actor and item.authorization_reference=p_reference then return outcome; end if;
  if item.state<>'pending' then raise exception 'Request unavailable'; end if;
  if p_decision='approve' then
    perform public.admin_establish_parent_link(item.parent_id,item.student_id,p_reference);
  end if;
  update academy_private.parent_link_applications set state=outcome,resolved_at=clock_timestamp(),resolved_by=actor,authorization_reference=p_reference where id=p_request;
  return outcome;
end; $$;
revoke all on function public.review_parent_link_request(uuid,uuid,uuid), public.review_parent_link_my_requests(), public.review_parent_link_cancel(uuid,uuid), public.review_admin_parent_link_applications(), public.review_admin_parent_link_decide(uuid,uuid,text,text) from public,anon,authenticated,service_role;
grant execute on function public.review_parent_link_request(uuid,uuid,uuid), public.review_parent_link_my_requests(), public.review_parent_link_cancel(uuid,uuid), public.review_admin_parent_link_applications(), public.review_admin_parent_link_decide(uuid,uuid,text,text) to authenticated;
commit;
