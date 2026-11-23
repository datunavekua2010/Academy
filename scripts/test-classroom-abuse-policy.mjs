import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const db = new PGlite();
try {
  await db.exec(`create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon;`);
  for (const f of ['20261120154717_initial_academy.sql','202611260001_classroom_abuse_review.sql']) await db.exec(fs.readFileSync(`supabase/migrations/${f}`,'utf8'));
  const invoke=(a,n)=>db.query('select public.classroom_code_consume_rate($1,$2) as allowed',[a,n]);
  const account='a'.repeat(64), net='b'.repeat(64);
  await db.exec('set role authenticated'); await assert.rejects(()=>invoke(account,net)); await assert.rejects(()=>db.query('select public.classroom_code_clean_rate_buckets()')); await assert.rejects(()=>db.query('select * from academy_private.classroom_code_rate_buckets'));
  await db.exec('reset role; set role anon'); await assert.rejects(()=>invoke(account,net));
  await db.exec('reset role; set role service_role'); await assert.rejects(()=>db.query('select * from academy_private.classroom_code_rate_buckets')); await assert.rejects(()=>invoke('invalid',net));
  for(let i=0;i<10;i++) assert.equal((await invoke(account,net)).rows[0].allowed,true);
  assert.equal((await invoke(account,net)).rows[0].allowed,false);
  // Network budget applies across different accounts.
  for(let i=0;i<49;i++) assert.equal((await invoke(i.toString(16).padStart(64,'0'),net)).rows[0].allowed,true);
  assert.equal((await invoke('f'.repeat(64),net)).rows[0].allowed,false);
  await db.exec('reset role');
  const buckets=await db.query('select scope,subject_hash,attempts from academy_private.classroom_code_rate_buckets');
  assert.equal(buckets.rows.find(x=>x.scope==='account' && x.subject_hash===account).attempts,11);
  assert.equal(buckets.rows.find(x=>x.scope==='network' && x.subject_hash===net).attempts,61);
  await db.exec("update academy_private.classroom_code_rate_buckets set window_start=clock_timestamp()-interval '11 minutes'");
  await db.exec('set role service_role'); assert.equal((await invoke(account,net)).rows[0].allowed,true);
  await db.exec('reset role'); await db.exec("update academy_private.classroom_code_rate_buckets set window_start=clock_timestamp()-interval '25 hours' where subject_hash='"+'f'.repeat(64)+"'");
  await db.exec('set role service_role'); assert.equal(Number((await db.query('select public.classroom_code_clean_rate_buckets() as removed')).rows[0].removed),1);
  console.log('Classroom abuse local policy tests: passed.');
} finally { await db.close(); }
