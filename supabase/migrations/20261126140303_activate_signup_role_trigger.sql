-- Activated on production after the signup frontend and Worker deployment.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function academy_private.provision_signup_role();
