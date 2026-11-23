-- REVIEW ONLY, unapplied. Idempotent admin parent-link commands with fencing.
-- References are not consent or evidence of parental authority.
begin;
create table academy_private.parent_link_requests (
 admin_id uuid not null references public.profiles(id) on delete restrict,
 request_id uuid not null,
 state text not null check(state in ('committed','abandoned')),
 payload_digest bytea,
 parent_id uuid references public.profiles(id) on delete restrict,
 student_id uuid references public.profiles(id) on delete restrict,
 action text check(action in ('establish','revoke')),
 changed boolean,
 created_at timestamptz not null default clock_timestamp(),
 primary key(admin_id,request_id),
 check((state='abandoned' and payload_digest is null and parent_id is null and student_id is null and action is null and changed is null) or
       (state='committed' and payload_digest is not null and octet_length(payload_digest)=32 and parent_id is not null and student_id is not null and action is not null and changed is not null))
);
create index parent_link_requests_recent on academy_private.parent_link_requests(admin_id,created_at);
alter table academy_private.parent_link_requests enable row level security;
revoke all on academy_private.parent_link_requests from public,anon,authenticated,service_role;

create function academy_private.reserve_parent_link_request_slot(p_admin uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('academy.parent-request-quota:' || p_admin::text,0));
 if (select count(*) from academy_private.parent_link_requests r where r.admin_id=p_admin and r.created_at>clock_timestamp()-interval '10 minutes')>=30
 or (select count(*) from academy_private.parent_link_requests r where r.admin_id=p_admin)>=10000 then raise exception 'Request quota exceeded'; end if;
end; $$;
revoke all on function academy_private.reserve_parent_link_request_slot(uuid) from public,anon,authenticated,service_role;

create function public.admin_parent_link_change(p_request uuid,p_parent uuid,p_student uuid,p_action text,p_reference text)
returns boolean language plpgsql security definer set search_path='' as $$
declare actor uuid:=(select auth.uid()); prior academy_private.parent_link_requests%rowtype; digest bytea; outcome boolean;
begin
 if current_setting('transaction_isolation')<>'read committed' then raise exception 'Read committed required' using errcode='40001'; end if;
 if actor is null or p_request is null or p_parent is null or p_student is null or p_parent=p_student or p_action is null or p_action not in ('establish','revoke') or p_reference is null or p_reference !~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$' or not academy_private.has_role('admin') then raise exception 'Not authorized or invalid request';end if;
 digest:=pg_catalog.sha256(pg_catalog.convert_to(pg_catalog.jsonb_build_array(p_parent,p_student,p_action,p_reference)::text,'UTF8'));
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('academy.parent-request:' || actor::text || ':' || p_request::text,0));
 select * into prior from academy_private.parent_link_requests r where r.admin_id=actor and r.request_id=p_request;
 if found then
   -- Verify admin role even for a read/retry after suspension.
   perform 1 from public.user_roles where user_id=actor and role='admin' for key share;
   if not found then raise exception 'Not authorized';end if;
   if prior.state='abandoned' or prior.payload_digest<>digest then raise exception 'Request unavailable';end if;
   return prior.changed;
 end if;
 perform academy_private.reserve_parent_link_request_slot(actor);
 if p_action='establish' then outcome:=public.admin_establish_parent_link(p_parent,p_student,p_reference);
 else outcome:=public.admin_revoke_parent_link(p_parent,p_student,p_reference);end if;
 insert into academy_private.parent_link_requests(admin_id,request_id,state,payload_digest,parent_id,student_id,action,changed)
 values(actor,p_request,'committed',digest,p_parent,p_student,p_action,outcome);
 return outcome;
end; $$;

create function public.admin_parent_link_resolve(p_request uuid)
returns table(state text,parent_id uuid,student_id uuid,action text,changed boolean)
language plpgsql security definer set search_path='' as $$
declare actor uuid:=(select auth.uid()); prior academy_private.parent_link_requests%rowtype;
begin
 if current_setting('transaction_isolation')<>'read committed' then raise exception 'Read committed required' using errcode='40001'; end if;
 if actor is null or p_request is null or not academy_private.has_role('admin') then raise exception 'Not authorized or invalid request';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('academy.parent-request:' || actor::text || ':' || p_request::text,0));
 select * into prior from academy_private.parent_link_requests r where r.admin_id=actor and r.request_id=p_request;
 if found then
   perform 1 from public.user_roles where user_id=actor and role='admin' for key share;
   if not found then raise exception 'Not authorized';end if;
   return query select prior.state,prior.parent_id,prior.student_id,prior.action,prior.changed;return;
 end if;
 perform academy_private.reserve_parent_link_request_slot(actor);
 perform 1 from public.user_roles where user_id=actor and role='admin' for key share;
 if not found then raise exception 'Not authorized';end if;
 insert into academy_private.parent_link_requests(admin_id,request_id,state) values(actor,p_request,'abandoned');
 return query select 'abandoned'::text,null::uuid,null::uuid,null::text,null::boolean;
end; $$;
revoke all on function public.admin_parent_link_change(uuid,uuid,uuid,text,text),public.admin_parent_link_resolve(uuid) from public,anon,authenticated,service_role;
grant execute on function public.admin_parent_link_change(uuid,uuid,uuid,text,text),public.admin_parent_link_resolve(uuid) to authenticated;
commit;
