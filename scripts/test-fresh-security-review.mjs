import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const sql=readFileSync('supabase/review/fresh-security-schema.sql','utf8');
async function setup(db) { await db.exec(`create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key,email_confirmed_at timestamptz,banned_until timestamptz,deleted_at timestamptz,is_anonymous boolean default false); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;`); }
const db=new PGlite();
try {
  await setup(db); await db.exec(sql);
  const {rows}=await db.query(`select relname,relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind in ('r','p')`);
  assert.equal(rows.length,18); assert(rows.every(r=>r.relrowsecurity));
  const {rows:[priv]}=await db.query(`select has_table_privilege('authenticated','public.user_roles','INSERT') as roles_insert,has_table_privilege('authenticated','public.earned_rewards','INSERT') as rewards_insert,has_table_privilege('anon','public.exercise_attempts','SELECT') as anon_attempts`);
  assert.deepEqual(priv,{roles_insert:false,rewards_insert:false,anon_attempts:false});
  await assert.rejects(()=>db.exec(sql));
} finally { await db.close(); }
const occupied=new PGlite();
try { await setup(occupied); await occupied.exec('create table public.existing_data(id int)'); await assert.rejects(()=>occupied.exec(sql),/Refusing nonempty public schema/); }
finally { await occupied.close(); }
console.log('Fresh SQL snapshot: 18 RLS tables, restricted grants, and nonempty-project guard verified.');
