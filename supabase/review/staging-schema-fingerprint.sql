-- Read-only comparison aid for an isolated full-chain database. Compare against
-- a locally rebuilt database with the same search_path. It excludes Supabase's
-- extra event-trigger function and PG18-only not-null constraints. Whitespace
-- and comment-only lines are removed from function definitions. This is NOT a
-- complete schema, ACL, owner, extension, index or security equivalence check.
with objects as (
 select 'functions' as category, n.nspname||'.'||p.proname||'('||pg_get_function_identity_arguments(p.oid)||'):'||regexp_replace(regexp_replace(pg_get_functiondef(p.oid), '(?n)^[ \t]*--[^\n]*', '', 'g'), '[[:space:]]+', '', 'g') as definition
 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('public','academy_private') and p.prokind='f' and p.proname <> 'rls_auto_enable'
 union all
 select 'columns',n.nspname||'.'||c.relname||'.'||a.attname||':'||a.attnum||':'||format_type(a.atttypid,a.atttypmod)||':'||a.attnotnull||':'||a.attidentity::text||':'||coalesce(pg_get_expr(d.adbin,d.adrelid),'')
 from pg_attribute a join pg_class c on c.oid=a.attrelid join pg_namespace n on n.oid=c.relnamespace left join pg_attrdef d on d.adrelid=c.oid and d.adnum=a.attnum
 where n.nspname in ('public','academy_private') and c.relkind in ('r','p') and a.attnum>0 and not a.attisdropped
 union all
 select 'constraints',n.nspname||'.'||c.relname||'.'||co.conname||':'||pg_get_constraintdef(co.oid)
 from pg_constraint co join pg_class c on c.oid=co.conrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','academy_private') and co.contype <> 'n'
 union all
 select 'policies',schemaname||'.'||tablename||'.'||policyname||':'||permissive||':'||roles::text||':'||cmd||':'||coalesce(qual,'')||':'||coalesce(with_check,'') from pg_policies where schemaname in ('public','academy_private')
 union all
 select 'triggers',n.nspname||'.'||c.relname||'.'||t.tgname||':'||t.tgenabled::text||':'||pg_get_triggerdef(t.oid)
 from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','academy_private') and not t.tgisinternal
 union all
 select 'rls',n.nspname||'.'||c.relname||':'||c.relrowsecurity||':'||c.relforcerowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','academy_private') and c.relkind in ('r','p')
)
select category,count(*) as count,md5(string_agg(definition,E'\n' order by definition)) as digest from objects group by category order by category;
