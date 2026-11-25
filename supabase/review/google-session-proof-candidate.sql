-- LOCAL REVIEW ONLY. DO NOT APPLY TO ANY PROJECT.
-- Incomplete building block: there is no OAuth endpoint, caller authentication,
-- CSRF/PKCE handling, garbage collection, policy integration, or deployment plan.
-- A trusted service must independently authenticate the Supabase session,
-- validate a Google ID token signature/issuer/audience/nonce, and protect state.
-- The service must never accept a client-supplied subject as proof. The caller
-- of the two privileged functions below is a powerful trust boundary.
begin;
create table academy_private.google_proof_challenges (
  state_hash text primary key check (state_hash ~ '^[a-f0-9]{64}$'),
  cookie_hash text not null check (cookie_hash ~ '^[a-f0-9]{64}$'),
  nonce text not null check (nonce ~ '^[A-Za-z0-9_-]{43,128}$'),
  code_verifier text not null check (code_verifier ~ '^[A-Za-z0-9_-]{43,128}$'),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null unique references auth.sessions(id) on delete cascade,
  expires_at timestamptz not null,
  start_window_at timestamptz not null default clock_timestamp(),
  start_count integer not null default 1 check (start_count between 1 and 5),
  read_count integer not null default 0 check (read_count between 0 and 5)
);
create table academy_private.google_session_proofs (
  session_id uuid primary key references auth.sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  google_subject text not null check (length(google_subject) between 1 and 255),
  expires_at timestamptz not null
);
alter table academy_private.google_proof_challenges enable row level security;
alter table academy_private.google_session_proofs enable row level security;
revoke all on academy_private.google_proof_challenges, academy_private.google_session_proofs from public,anon,authenticated,service_role;

-- p_user/p_session/state/nonce must be created and checked by the trusted
-- service, not by untrusted browser data. Start only for a verified OAuth
-- session; the service must reject password and ambiguous methods itself.
create function public.review_google_proof_begin(p_user uuid,p_session uuid,p_state_hash text,p_cookie_hash text,p_nonce text,p_verifier text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not exists(select 1 from auth.sessions s where s.id=p_session and s.user_id=p_user and (s.not_after is null or s.not_after>clock_timestamp())) then
    raise exception 'Proof unavailable';
  end if;
  -- Bound consecutive unfinished starts per session to five in five minutes.
  -- A restart invalidates the old state and resets its callback-read allowance.
  -- A successful finish deletes the row and resets this counter, so this is NOT
  -- a replacement for ingress/IP/account distributed rate limiting.
  insert into academy_private.google_proof_challenges(state_hash,cookie_hash,nonce,code_verifier,user_id,session_id,expires_at)
  values(p_state_hash,p_cookie_hash,p_nonce,p_verifier,p_user,p_session,clock_timestamp()+interval '5 minutes')
  on conflict(session_id) do update set state_hash=excluded.state_hash,cookie_hash=excluded.cookie_hash,nonce=excluded.nonce,code_verifier=excluded.code_verifier,user_id=excluded.user_id,expires_at=excluded.expires_at,
    start_count=case when academy_private.google_proof_challenges.start_window_at<=clock_timestamp()-interval '5 minutes' then 1 else academy_private.google_proof_challenges.start_count+1 end,
    start_window_at=case when academy_private.google_proof_challenges.start_window_at<=clock_timestamp()-interval '5 minutes' then clock_timestamp() else academy_private.google_proof_challenges.start_window_at end,
    read_count=0
  where academy_private.google_proof_challenges.start_window_at<=clock_timestamp()-interval '5 minutes' or academy_private.google_proof_challenges.start_count<5;
  if not found then raise exception 'Proof unavailable'; end if;
end; $$;
revoke all on function public.review_google_proof_begin(uuid,uuid,text,text,text,text) from public,anon,authenticated;
grant execute on function public.review_google_proof_begin(uuid,uuid,text,text,text,text) to service_role;

-- Only the backend may retrieve the verifier and stored nonce, after hashing
-- the state and the independent HttpOnly browser cookie. The nonce is also sent
-- to Google; the code verifier must remain server-side.
create function public.review_google_proof_read(p_state_hash text,p_cookie_hash text)
returns table(nonce text,code_verifier text) language sql volatile security definer set search_path = '' as $$
  update academy_private.google_proof_challenges c set read_count=c.read_count+1
  from auth.sessions s
  where s.id=c.session_id and s.user_id=c.user_id
    and c.state_hash=p_state_hash and c.cookie_hash=p_cookie_hash and c.expires_at>statement_timestamp()
    and c.read_count<5 and (s.not_after is null or s.not_after>statement_timestamp())
  returning c.nonce,c.code_verifier;
$$;
revoke all on function public.review_google_proof_read(text,text) from public,anon,authenticated;
grant execute on function public.review_google_proof_read(text,text) to service_role;

-- nonce and subject must come exclusively from an already VERIFIED Google
-- ID token. The state hash must be checked against the browser's CSRF cookie.
-- Atomic delete makes a successful challenge one-use, including under races.
create function public.review_google_proof_finish(p_state_hash text,p_cookie_hash text,p_nonce text,p_subject text)
returns void language plpgsql security definer set search_path = '' as $$
declare c academy_private.google_proof_challenges%rowtype; session_end timestamptz;
begin
  delete from academy_private.google_proof_challenges where state_hash=p_state_hash and cookie_hash=p_cookie_hash and nonce=p_nonce and expires_at>clock_timestamp() returning * into c;
  if not found then raise exception 'Proof unavailable'; end if;
  select s.not_after into session_end from auth.sessions s where s.id=c.session_id and s.user_id=c.user_id and (s.not_after is null or s.not_after>clock_timestamp()) for key share;
  if not found or not exists(select 1 from auth.identities i where i.user_id=c.user_id and i.provider='google' and i.provider_id=p_subject) then
    raise exception 'Proof unavailable';
  end if;
  insert into academy_private.google_session_proofs(session_id,user_id,google_subject,expires_at)
  values(c.session_id,c.user_id,p_subject,least(clock_timestamp()+interval '1 hour', coalesce(session_end,'infinity'::timestamptz)))
  on conflict(session_id) do update set user_id=excluded.user_id,google_subject=excluded.google_subject,expires_at=excluded.expires_at;
end; $$;
revoke all on function public.review_google_proof_finish(text,text,text,text) from public,anon,authenticated;
grant execute on function public.review_google_proof_finish(text,text,text,text) to service_role;

-- This predicate alone is not role authorization. It checks the verified
-- session's OAuth AMR, live session, matching current Google identity and proof.
create function academy_private.review_google_proof_current()
returns boolean language sql stable security definer set search_path = '' as $$
  select academy_private.role_session_method_allows('parent') and exists (
    select 1 from academy_private.google_session_proofs p
      join auth.sessions s on s.id=p.session_id and s.user_id=p.user_id
      join auth.identities i on i.user_id=p.user_id and i.provider='google' and i.provider_id=p.google_subject
    where p.user_id=(select auth.uid()) and p.session_id::text=(select auth.jwt()->>'session_id')
      and p.expires_at>statement_timestamp() and (s.not_after is null or s.not_after>statement_timestamp())
  );
$$;
revoke all on function academy_private.review_google_proof_current() from public,anon;
grant execute on function academy_private.review_google_proof_current() to authenticated;

-- Identity-only status feedback; it does not grant a role or family access.
create function public.review_google_proof_status() returns boolean
language sql stable security definer set search_path = '' as $$
  select academy_private.review_google_proof_current();
$$;
revoke all on function public.review_google_proof_status() from public,anon,service_role;
grant execute on function public.review_google_proof_status() to authenticated;
commit;
