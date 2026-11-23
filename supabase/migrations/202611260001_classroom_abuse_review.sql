-- REVIEW ONLY: never apply to production without security and retention review.
-- Rate buckets hold only keyed digests, never codes, IP addresses or account IDs.
-- Requires the academy_private schema from the initial migration.
begin;
create table academy_private.classroom_code_rate_buckets (
  scope text not null check (scope in ('account', 'network')),
  subject_hash text not null check (subject_hash ~ '^[a-f0-9]{64}$'),
  window_start timestamptz not null,
  attempts integer not null check (attempts between 1 and 1000000000),
  primary key(scope,subject_hash)
);
revoke all on academy_private.classroom_code_rate_buckets from public, anon, authenticated, service_role;

-- Fixed windows: at most 10 attempts/account and 60/network per 10 minutes.
-- Both counters are incremented even when blocked. An invalid attempt is charged
-- by the gateway in a separate committed call BEFORE validation or redemption.
-- The deployment must restrict this RPC to the trusted backend's service role.
create function public.classroom_code_consume_rate(p_account_hash text, p_network_hash text)
returns boolean language plpgsql security definer set search_path = '' as $$
declare now_at timestamptz := clock_timestamp(); account_attempts integer; network_attempts integer;
begin
  if p_account_hash is null or p_network_hash is null or p_account_hash !~ '^[a-f0-9]{64}$' or p_network_hash !~ '^[a-f0-9]{64}$' then raise exception 'Invalid rate key'; end if;
  insert into academy_private.classroom_code_rate_buckets(scope,subject_hash,window_start,attempts)
    values ('account',p_account_hash,now_at,1)
    on conflict (scope,subject_hash) do update set
      window_start = case when classroom_code_rate_buckets.window_start <= now_at - interval '10 minutes' then now_at else classroom_code_rate_buckets.window_start end,
      attempts = case when classroom_code_rate_buckets.window_start <= now_at - interval '10 minutes' then 1 else least(classroom_code_rate_buckets.attempts + 1,1000000000) end
    returning attempts into account_attempts;
  insert into academy_private.classroom_code_rate_buckets(scope,subject_hash,window_start,attempts)
    values ('network',p_network_hash,now_at,1)
    on conflict (scope,subject_hash) do update set
      window_start = case when classroom_code_rate_buckets.window_start <= now_at - interval '10 minutes' then now_at else classroom_code_rate_buckets.window_start end,
      attempts = case when classroom_code_rate_buckets.window_start <= now_at - interval '10 minutes' then 1 else least(classroom_code_rate_buckets.attempts + 1,1000000000) end
    returning attempts into network_attempts;
  return account_attempts <= 10 and network_attempts <= 60;
end; $$;
-- Trusted scheduled maintenance can remove inactive keys; never remove an active window.
create function public.classroom_code_clean_rate_buckets()
returns bigint language plpgsql security definer set search_path = '' as $$
declare deleted bigint;
begin
  delete from academy_private.classroom_code_rate_buckets where window_start < clock_timestamp() - interval '24 hours';
  get diagnostics deleted = row_count;
  return deleted;
end; $$;
revoke all on function public.classroom_code_consume_rate(text,text), public.classroom_code_clean_rate_buckets() from public, anon, authenticated, service_role;
grant execute on function public.classroom_code_consume_rate(text,text), public.classroom_code_clean_rate_buckets() to service_role;
commit;
