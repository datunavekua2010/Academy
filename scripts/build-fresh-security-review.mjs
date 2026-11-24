// Produces a single copy-pasteable, fresh-project-only REVIEW snapshot.
// It does not update Supabase migration history or replace an in-place migration plan.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
const dir = 'supabase/migrations';
const files = readdirSync(dir).filter(f => /^(?:\d{12}|\d{14})_.+\.sql$/.test(f)).sort();
if (files.length !== 21 || files[0] !== '20261120154717_initial_academy.sql' || files.at(-1) !== '202612110001_parent_link_rpc_privileges_review.sql') throw new Error('Migration chain changed; review this generator before updating the snapshot');
let out = `-- REVIEW ONLY. Fresh, empty synthetic Supabase TEST project ONLY; NOT an upgrade.\n-- This does not record Supabase migration history. Do not apply to existing/live projects.\n-- Review all migrations, owner/bypass privileges, Auth and retention before any deployment.\n-- Denied operations intentionally have no policy/grant; absence is default-deny.\n-- No subscription entitlement or real payment flow is implemented.\nbegin;\ndo $preflight$ begin\n  if to_regclass('auth.users') is null then raise exception 'Supabase Auth schema required'; end if;\n  if exists(select 1 from auth.users) then raise exception 'Refusing nonempty Auth project'; end if;\n  if exists(select 1 from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind in ('r','p','v','m','f')) then raise exception 'Refusing nonempty public schema'; end if;\n  if exists(select 1 from pg_catalog.pg_namespace where nspname='academy_private') then raise exception 'Refusing existing academy_private schema'; end if;\nend $preflight$;\n`;
for (const file of files) {
  let sql = readFileSync(`${dir}/${file}`, 'utf8');
  const begins = sql.match(/^begin;\s*$/gim) ?? [], commits = sql.match(/^commit;\s*$/gim) ?? [];
  if (begins.length !== 1 || commits.length !== 1) throw new Error(`Unexpected transaction boundaries in ${file}`);
  sql = sql.replace(/^begin;\s*$/im, '').replace(/^commit;\s*$/im, '');
  out += `\n-- ===== ${file} =====\n${sql.trim()}\n`;
}
out += '\ncommit;\n';
writeFileSync('supabase/review/fresh-security-schema.sql', out);
console.log(`Wrote ${files.length} migrations to fresh-security-schema.sql`);
