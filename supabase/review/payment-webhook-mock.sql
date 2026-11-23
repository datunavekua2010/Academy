-- REVIEW-ONLY MOCK. Not a migration, not production, not a real entitlement.
-- Depends on academy_private and auth.users from the fresh review snapshot.
-- Real payment providers, signatures and ordering semantics are NOT implemented.
begin;
create table academy_private.payment_review_customers (
 provider text not null check(provider='review_only'), customer_id text not null check(char_length(customer_id) between 1 and 200),
 user_id uuid not null references auth.users(id), primary key(provider,customer_id)
);
create table academy_private.payment_review_subscriptions (
 provider text not null, subscription_id text not null, customer_id text not null,
 user_id uuid not null references auth.users(id), mock_status text not null check(mock_status in ('active','inactive')),
 mock_version bigint not null check(mock_version>=0), primary key(provider,subscription_id),
 foreign key(provider,customer_id) references academy_private.payment_review_customers(provider,customer_id)
);
create table academy_private.payment_review_events (
 provider text not null, event_id text not null, event_digest bytea not null,
 outcome text not null check(outcome in ('processing','applied','ignored')), primary key(provider,event_id)
);
alter table academy_private.payment_review_customers enable row level security;
alter table academy_private.payment_review_subscriptions enable row level security;
alter table academy_private.payment_review_events enable row level security;
revoke all on academy_private.payment_review_customers,academy_private.payment_review_subscriptions,academy_private.payment_review_events from public,anon,authenticated,service_role;

-- The provider verifier must run BEFORE invoking this RPC. Its caller is a
-- trusted server, never a browser. This mock only accepts provider='review_only'.
create function public.review_payment_apply_verified_event(p_provider text,p_event_id text,p_customer_id text,p_subscription_id text,p_provider_version text,p_event_type text)
returns text language plpgsql security definer set search_path='' as $$
declare actor uuid; existing academy_private.payment_review_subscriptions%rowtype; prior academy_private.payment_review_events%rowtype;
 payload bytea; inserted boolean; new_status text; v bigint; result_state text;
begin
 if current_setting('transaction_isolation') <> 'read committed' then raise exception 'READ COMMITTED required'; end if;
 if p_provider is distinct from 'review_only' or p_event_id is null or char_length(p_event_id) not between 1 and 200
    or p_customer_id is null or char_length(p_customer_id) not between 1 and 200
    or p_subscription_id is null or char_length(p_subscription_id) not between 1 and 200
    or p_provider_version is null or p_provider_version !~ '^[0-9]{1,18}$'
    or p_event_type is null or p_event_type not in ('mock.active','mock.inactive') then raise exception 'Invalid review event'; end if;
 v:=p_provider_version::bigint;
 new_status:=case p_event_type when 'mock.active' then 'active' else 'inactive' end;
 select user_id into actor from academy_private.payment_review_customers where provider=p_provider and customer_id=p_customer_id;
 if actor is null then raise exception 'Unknown customer'; end if;
 payload:=pg_catalog.sha256(pg_catalog.convert_to(pg_catalog.jsonb_build_array(p_provider,p_event_id,p_customer_id,p_subscription_id,p_provider_version,p_event_type)::text,'UTF8'));
 -- Serialize first creation and all updates for a subscription; event uniqueness
 -- is enforced by the event primary key and is transactional with the update.
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_provider || ':' || p_subscription_id,0));
 insert into academy_private.payment_review_events(provider,event_id,event_digest,outcome)
 values(p_provider,p_event_id,payload,'processing') on conflict do nothing returning true into inserted;
 if not coalesce(inserted,false) then
   select * into prior from academy_private.payment_review_events where provider=p_provider and event_id=p_event_id;
   if prior.event_digest<>payload or prior.outcome='processing' then raise exception 'Event conflict'; end if;
   return 'duplicate';
 end if;
 select * into existing from academy_private.payment_review_subscriptions where provider=p_provider and subscription_id=p_subscription_id for update;
 if found then
   if existing.customer_id<>p_customer_id or existing.user_id<>actor then raise exception 'Subscription mapping mismatch'; end if;
   if existing.mock_version=v and existing.mock_status<>new_status then raise exception 'Version conflict'; end if;
   if existing.mock_version>=v then result_state:='ignored';
   else update academy_private.payment_review_subscriptions set mock_status=new_status,mock_version=v where provider=p_provider and subscription_id=p_subscription_id; result_state:='applied'; end if;
 else
   insert into academy_private.payment_review_subscriptions(provider,subscription_id,customer_id,user_id,mock_status,mock_version)
     values(p_provider,p_subscription_id,p_customer_id,actor,new_status,v);
   result_state:='applied';
 end if;
 update academy_private.payment_review_events set outcome=result_state where provider=p_provider and event_id=p_event_id;
 return result_state;
end; $$;
revoke all on function public.review_payment_apply_verified_event(text,text,text,text,text,text) from public,anon,authenticated,service_role;
grant execute on function public.review_payment_apply_verified_event(text,text,text,text,text,text) to service_role;
commit;
