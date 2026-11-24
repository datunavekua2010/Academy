// Local synthetic-only tests; no hosted project or actual Google account is used.
import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';
import assert from 'node:assert/strict';

const db = new PGlite();
try {
  await db.exec(`create role anon; create role authenticated; create role service_role; create schema auth;
    create table auth.users(id uuid primary key,email_confirmed_at timestamptz default now(),banned_until timestamptz,deleted_at timestamptz,is_anonymous boolean default false);
    create table auth.sessions(id uuid primary key,user_id uuid references auth.users(id),not_after timestamptz);
    create table auth.identities(user_id uuid references auth.users(id),provider text,provider_id text);
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
    grant usage on schema auth to authenticated,anon; grant execute on function auth.uid(),auth.jwt() to authenticated,anon;`);
  for (const file of readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort()) await db.exec(readFileSync(`supabase/migrations/${file}`,'utf8'));
  for (const file of ['role-signin-method-candidate.sql','google-session-proof-candidate.sql','google-session-enforcement-candidate.sql','student-self-enrollment-candidate.sql']) await db.exec(readFileSync(`supabase/review/${file}`,'utf8'));
  const q = (sql,args=[])=>db.query(sql,args);
  const ids = Array.from({length:6},(_,i)=>`00000000-0000-4000-8000-${String(i+1).padStart(12,'0')}`);
  const sessions = Array.from({length:6},(_,i)=>`10000000-0000-4000-8000-${String(i+1).padStart(12,'0')}`);
  for (let i=0;i<ids.length;i++) {
    await q('insert into auth.users(id) values($1)',[ids[i]]);
    await q('insert into auth.sessions(id,user_id) values($1,$2)',[sessions[i],ids[i]]);
    await q("insert into auth.identities(user_id,provider,provider_id) values($1,'google',$2)",[ids[i],`sub${i}`]);
    if (i!==1) await q("insert into academy_private.google_session_proofs(session_id,user_id,google_subject,expires_at) values($1,$2,$3,now()+interval '1 hour')",[sessions[i],ids[i],`sub${i}`]);
  }
  await q("insert into public.profiles(id,display_name,first_name) values($1,'Existing','Existing'),($2,'Revoked','Revoked')",[ids[2],ids[3]]);
  await q("insert into public.user_roles(user_id,role) values($1,'teacher'),($2,'student')",[ids[2],ids[3]]);
  await q("delete from public.user_roles where user_id=$1 and role='student'",[ids[3]]);
  await q("update auth.users set banned_until=now()+interval '1 day' where id=$1",[ids[4]]);
  let activeUser = ids[0];
  const login=async(i,method='oauth')=>{
    activeUser = ids[i];
    await db.exec('reset role; set role authenticated');
    await q("select set_config('request.jwt.claim.sub',$1,false)",[ids[i]]);
    await q("select set_config('request.jwt.claims',$1,false)",[JSON.stringify({session_id:sessions[i],amr:[{method}]})]);
  };
  const enroll=(name='Nickname',grade=3)=>q('select public.review_student_self_enroll($1::uuid,$2,$3::smallint) as result',[activeUser,name,grade]);
  await login(1); await assert.rejects(()=>enroll(),/Enrollment unavailable/);
  await login(0,'password'); await assert.rejects(()=>enroll(),/Enrollment unavailable/);
  await login(0); await assert.rejects(()=>enroll('',3),/Enrollment unavailable/); await assert.rejects(()=>enroll('Nickname',8),/Enrollment unavailable/);
  assert.equal((await enroll()).rows[0].result,'created');
  assert.equal((await enroll('Changed',7)).rows[0].result,'already_enrolled');
  await db.exec('reset role');
  const created=(await q('select p.display_name,g.grade from public.profiles p join public.student_grades g on g.student_id=p.id where p.id=$1',[ids[0]])).rows[0];
  assert.deepEqual(created,{display_name:'Nickname',grade:3});
  assert.equal(Number((await q('select count(*) as n from public.parent_students')).rows[0].n),0);
  await login(2); assert.equal((await enroll('New',4)).rows[0].result,'created');
  await db.exec('reset role'); assert.equal((await q('select display_name from public.profiles where id=$1',[ids[2]])).rows[0].display_name,'Existing');
  await login(3); await assert.rejects(()=>enroll(),/Enrollment unavailable/);
  await login(4); await assert.rejects(()=>enroll(),/Enrollment unavailable/);
  await db.exec('reset role; set role anon'); await assert.rejects(()=>enroll(),/permission denied/);
  await db.exec('reset role; set role service_role'); await assert.rejects(()=>enroll(),/permission denied/);
  console.log('Student self-enrollment local prototype checks passed; no live auth, consent or deployment tested.');
} finally { await db.close(); }
