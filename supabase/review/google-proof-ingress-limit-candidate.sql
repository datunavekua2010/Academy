-- LOCAL REVIEW ONLY. Durable atomic ingress limits for the proof Worker.
-- Only server-side, keyed hashes of trusted ingress addresses and verified
-- account IDs may be passed. This is not a replacement for Cloudflare WAF or
-- provider-level abuse prevention; capacity and operational limits need review.
begin;
create table academy_private.google_proof_ingress_limits (
  scope text not null check(scope in ('network','account')),
  key_hash text not null check(key_hash ~ '^[a-f0-9]{64}$'),
  window_started_at timestamptz not null,
  attempts integer not null check(attempts between 1 and 120),
  primary key(scope,key_hash)
);
create index google_proof_ingress_limits_expiry on academy_private.google_proof_ingress_limits(window_started_at);
alter table academy_private.google_proof_ingress_limits enable row level security;
revoke all on academy_private.google_proof_ingress_limits from public,anon,authenticated,service_role;

create function public.review_google_proof_rate_limit(p_scope text,p_key_hash text)
returns boolean language plpgsql security definer set search_path='' as $$
declare allowed boolean; instant timestamptz:=clock_timestamp(); max_attempts integer;
begin
  if p_scope is null or p_scope not in ('network','account') or p_key_hash is null or p_key_hash !~ '^[a-f0-9]{64}$' then raise exception 'Unavailable'; end if;
  max_attempts:=case when p_scope='network' then 120 else 20 end;
  -- Incremental bounded cleanup; old keyed hashes are not retained indefinitely
  -- when the endpoint is in use. A separate scheduled cleanup is still needed
  -- for periods with no traffic or when the endpoint is disabled.
  delete from academy_private.google_proof_ingress_limits where (scope,key_hash) in (
    select x.scope,x.key_hash from academy_private.google_proof_ingress_limits x
    where x.window_started_at<instant-interval '1 day' order by x.window_started_at,x.scope,x.key_hash limit 25
  );
  insert into academy_private.google_proof_ingress_limits(scope,key_hash,window_started_at,attempts)
    values(p_scope,p_key_hash,instant,1)
  on conflict(scope,key_hash) do update set
    window_started_at=case when academy_private.google_proof_ingress_limits.window_started_at<=instant-interval '10 minutes' then instant else academy_private.google_proof_ingress_limits.window_started_at end,
    attempts=case when academy_private.google_proof_ingress_limits.window_started_at<=instant-interval '10 minutes' then 1 else academy_private.google_proof_ingress_limits.attempts+1 end
  where academy_private.google_proof_ingress_limits.window_started_at<=instant-interval '10 minutes'
     or academy_private.google_proof_ingress_limits.attempts<max_attempts
  returning true into allowed;
  return coalesce(allowed,false);
end; $$;
revoke all on function public.review_google_proof_rate_limit(text,text) from public,anon,authenticated,service_role;
grant execute on function public.review_google_proof_rate_limit(text,text) to service_role;
commit;
