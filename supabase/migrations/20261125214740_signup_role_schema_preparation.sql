-- Additive signup role provisioning for the existing Academy schema.
-- Existing roles and profile references are retained; no users are backfilled.
begin;
alter table public.user_roles alter column role set default 'student';
do $$ begin
  if not exists (select 1 from pg_constraint where conrelid = 'public.user_roles'::regclass and conname = 'user_roles_auth_user_id_fkey') then
    alter table public.user_roles add constraint user_roles_auth_user_id_fkey foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end $$;
alter table public.user_roles enable row level security;
revoke insert, update, delete, truncate, references, trigger on public.user_roles from public, anon, authenticated;
grant select on public.user_roles to authenticated;
drop policy if exists roles_read on public.user_roles;
create policy roles_read on public.user_roles for select to authenticated using (user_id = (select auth.uid()));
create or replace function academy_private.provision_signup_role()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  selected_role text := case when new.raw_user_meta_data->>'role' = 'parent' then 'parent' else 'student' end;
  placeholder_name text;
begin
  -- The product is email/password-only. Never provision anonymous or OAuth-only users.
  if new.is_anonymous or new.encrypted_password is null or new.encrypted_password = '' then return new; end if;
  placeholder_name := case selected_role when 'parent' then 'მშობელი' else 'მოსწავლე' end;
  insert into public.profiles(id, display_name, first_name)
  values (new.id, placeholder_name, placeholder_name) on conflict (id) do nothing;
  insert into public.user_roles(user_id, role) values (new.id, selected_role) on conflict (user_id, role) do nothing;
  return new;
end $$;
revoke all on function academy_private.provision_signup_role() from public, anon, authenticated, service_role;
commit;
