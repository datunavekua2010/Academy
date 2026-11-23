-- REVIEW ONLY. Not deployed. Depends on the complete role-lifecycle review chain.
-- An external reference is NOT proof of parental authority, consent or legal basis.
begin;

-- Both supported parent-link mutations serialize on the same pair. An epoch
-- write also makes a stale REPEATABLE READ/SERIALIZABLE snapshot fail rather
-- than recreate a newer removed link or miss a newer established one.
create table academy_private.parent_link_epochs (
  parent_id uuid not null references public.profiles(id) on delete restrict,
  student_id uuid not null references public.profiles(id) on delete restrict,
  revision bigint not null default 1 check (revision > 0),
  primary key (parent_id, student_id), check (parent_id <> student_id)
);
alter table academy_private.parent_link_epochs enable row level security;
revoke all on academy_private.parent_link_epochs from public,anon,authenticated,service_role;
create function academy_private.lock_parent_student_pair(p_parent uuid,p_student uuid)
returns void language plpgsql set search_path='' as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('academy.parent-student:' || p_parent::text || ':' || p_student::text,0));
  insert into academy_private.parent_link_epochs(parent_id,student_id) values(p_parent,p_student)
  on conflict (parent_id,student_id) do update set revision=academy_private.parent_link_epochs.revision+1;
end; $$;
revoke all on function academy_private.lock_parent_student_pair(uuid,uuid) from public,anon,authenticated,service_role;

create table academy_private.parent_link_establishment_audit (
  id bigint generated always as identity primary key,
  admin_id uuid not null references public.profiles(id) on delete restrict,
  parent_id uuid not null references public.profiles(id) on delete restrict,
  student_id uuid not null references public.profiles(id) on delete restrict,
  authorization_reference text not null check (authorization_reference ~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$'),
  created_at timestamptz not null default clock_timestamp(),
  check (parent_id <> student_id)
);
alter table academy_private.parent_link_establishment_audit enable row level security;
revoke all on academy_private.parent_link_establishment_audit from public,anon,authenticated,service_role;
revoke all on sequence academy_private.parent_link_establishment_audit_id_seq from public,anon,authenticated,service_role;

-- Admin must independently establish authority before calling. Existing parent
-- visibility is broad; linking can re-expose retained records and parent notes.
create function public.admin_establish_parent_link(p_parent uuid,p_student uuid,p_reference text)
returns boolean language plpgsql security definer set search_path='' as $$
declare actor uuid := (select auth.uid()); role_count integer;
begin
  if actor is null or p_parent is null or p_student is null or p_parent=p_student or p_reference is null
     or p_reference !~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$' or not academy_private.has_role('admin') then
    raise exception 'Not authorized or invalid request';
  end if;
  perform academy_private.lock_parent_student_pair(p_parent,p_student);
  -- Participant role deletion waits for accepted writes; sorted locking avoids
  -- an avoidable cycle if the actor also has another role.
  perform 1 from public.user_roles r where (r.user_id=actor and r.role='admin')
    or (r.user_id=p_parent and r.role='parent') or (r.user_id=p_student and r.role='student')
    order by r.user_id,r.role for share;
  select count(*) into role_count from public.user_roles r where (r.user_id=actor and r.role='admin')
    or (r.user_id=p_parent and r.role='parent') or (r.user_id=p_student and r.role='student');
  if role_count <> 3 then raise exception 'Not authorized or invalid request'; end if;
  insert into public.parent_students(parent_id,student_id) values(p_parent,p_student) on conflict do nothing;
  if not found then return false; end if;
  insert into academy_private.parent_link_establishment_audit(admin_id,parent_id,student_id,authorization_reference)
    values(actor,p_parent,p_student,p_reference);
  return true;
end; $$;

-- Replace the earlier unlink with the same pair/epoch protocol. Cleanup remains
-- possible after either participant role has been suspended. Absent links are
-- idempotent; absent profiles fail closed (the epoch holds FKs).
create or replace function public.admin_revoke_parent_link(p_parent uuid,p_student uuid,p_reference text)
returns boolean language plpgsql security definer set search_path='' as $$
declare actor uuid := (select auth.uid()); removed integer;
begin
  if actor is null or p_parent is null or p_student is null or p_parent=p_student or p_reference is null
     or p_reference !~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$' or not academy_private.has_role('admin') then
    raise exception 'Not authorized or invalid request';
  end if;
  perform academy_private.lock_parent_student_pair(p_parent,p_student);
  perform 1 from public.user_roles where user_id=actor and role='admin' for key share;
  if not found then raise exception 'Not authorized or invalid request'; end if;
  delete from public.parent_students where parent_id=p_parent and student_id=p_student;
  get diagnostics removed = row_count;
  if removed=0 then return false; end if;
  insert into academy_private.role_lifecycle_audit(admin_id,target_id,action,related_student_id,affected,authorization_reference)
    values(actor,p_parent,'parent_link_revoked',p_student,removed,p_reference);
  return true;
end; $$;
revoke all on function public.admin_establish_parent_link(uuid,uuid,text),public.admin_revoke_parent_link(uuid,uuid,text) from public,anon,authenticated,service_role;
grant execute on function public.admin_establish_parent_link(uuid,uuid,text),public.admin_revoke_parent_link(uuid,uuid,text) to authenticated;
commit;
