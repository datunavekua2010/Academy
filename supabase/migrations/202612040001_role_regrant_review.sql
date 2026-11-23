-- REVIEW ONLY. Depends on role-lifecycle and parent-link drafts. No Auth user
-- is created or unbanned; caller must independently verify authorization.
begin;
alter table academy_private.role_lifecycle_audit drop constraint role_lifecycle_audit_action_check;
alter table academy_private.role_lifecycle_audit add constraint role_lifecycle_audit_action_check
  check (action in ('role_revoked','role_restored','parent_link_revoked','teacher_codes_retired'));

-- This only restores one Academy role. The existing trigger still blocks it if
-- retained links, memberships or live codes could silently reappear. Cleanup
-- and later relationship authorization must be separate explicit actions.
create function public.admin_restore_academy_role(p_target uuid,p_role text,p_reference text)
returns boolean language plpgsql security definer set search_path='' as $$
declare actor uuid := (select auth.uid()); inserted integer;
begin
  if actor is null or p_target is null or actor=p_target or p_role is null or p_role not in ('teacher','student','parent')
     or p_reference is null or p_reference !~ '^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$' or not academy_private.has_role('admin') then
    raise exception 'Not authorized or invalid request';
  end if;
  perform academy_private.lock_role_lifecycle(p_target,p_role);
  perform 1 from public.user_roles where user_id=actor and role='admin' for key share;
  if not found then raise exception 'Not authorized or invalid request'; end if;
  -- Detect stale snapshots even if this role is absent in the old snapshot or
  -- already exists now. The reinstatement trigger also updates the epoch.
  insert into academy_private.role_lifecycle_epochs(user_id,role,revision) values(p_target,p_role,1)
    on conflict (user_id,role) do update set revision=academy_private.role_lifecycle_epochs.revision+1;
  if exists(select 1 from public.user_roles where user_id=p_target and role=p_role) then return false; end if;
  -- This RPC is restoration, not arbitrary initial role provisioning. Refuse
  -- untracked direct deletions or roles which were never suspended by the
  -- audited RPC. Privileged out-of-band changes still need a separate review.
  if coalesce((select action from academy_private.role_lifecycle_audit
    where target_id=p_target and target_role=p_role and action in ('role_revoked','role_restored')
    order by id desc limit 1),'') <> 'role_revoked' then
    raise exception 'Audited suspension required';
  end if;
  insert into public.user_roles(user_id,role) values(p_target,p_role) on conflict do nothing;
  get diagnostics inserted = row_count;
  if inserted=0 then return false; end if;
  insert into academy_private.role_lifecycle_audit(admin_id,target_id,action,target_role,affected,authorization_reference)
    values(actor,p_target,'role_restored',p_role,inserted,p_reference);
  return true;
end; $$;
revoke all on function public.admin_restore_academy_role(uuid,text,text) from public,anon,authenticated,service_role;
grant execute on function public.admin_restore_academy_role(uuid,text,text) to authenticated;
commit;
