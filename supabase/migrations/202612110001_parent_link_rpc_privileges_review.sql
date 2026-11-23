-- REVIEW ONLY. Funnel ordinary admin requests through the fenced/idempotent
-- wrapper; only the owning security-definer may invoke the legacy primitives.
-- This is not a defense against DB owners, direct SQL, or altered ownership.
begin;
revoke all on function public.admin_establish_parent_link(uuid,uuid,text),public.admin_revoke_parent_link(uuid,uuid,text) from public,anon,authenticated,service_role;
commit;
