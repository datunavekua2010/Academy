-- Apply only after the role-selector signup frontend and Worker are deployed.
-- Existing production clients do not send the selected role.
create trigger on_auth_user_created after insert on auth.users
  for each row execute function academy_private.provision_signup_role();
