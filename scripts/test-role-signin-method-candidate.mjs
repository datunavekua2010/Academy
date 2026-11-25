// Local synthetic SQL prototype only; does not access or alter a Supabase project.
import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';
import assert from 'node:assert/strict';

const db = new PGlite();
try {
  await db.exec(`create role anon; create role authenticated; create role service_role; create schema auth;
    create table auth.users(id uuid primary key,email_confirmed_at timestamptz default now(),banned_until timestamptz,deleted_at timestamptz,is_anonymous boolean default false);
    create table auth.sessions(id uuid primary key, user_id uuid references auth.users(id), not_after timestamptz);
    create table auth.identities(user_id uuid references auth.users(id), provider text, provider_id text);
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    create function auth.jwt() returns jsonb language sql stable as $$select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb$$;
    grant usage on schema auth to authenticated,anon; grant execute on function auth.uid(), auth.jwt() to authenticated,anon;`);
  for (const file of readdirSync('supabase/migrations').filter(f => f.endsWith('.sql')).sort()) {
    await db.exec(readFileSync(`supabase/migrations/${file}`, 'utf8'));
  }
  await db.exec(readFileSync('supabase/review/role-signin-method-candidate.sql', 'utf8'));
  await db.exec(readFileSync('supabase/review/google-session-proof-candidate.sql', 'utf8'));
  await db.exec(readFileSync('supabase/review/google-session-enforcement-candidate.sql', 'utf8'));
  const q = (sql, args = []) => db.query(sql, args);
  const person = '00000000-0000-4000-8000-000000000001';
  const child = '00000000-0000-4000-8000-000000000002';
  const other = '00000000-0000-4000-8000-000000000003';
  const session = '00000000-0000-4000-8000-000000000004';
  const otherSession = '00000000-0000-4000-8000-000000000005';
  const state = 'a'.repeat(64), cookie = 'b'.repeat(64), nonce = 'A'.repeat(43), verifier = 'V'.repeat(43);
  for (const id of [person, child, other]) {
    await q('insert into auth.users(id) values($1)', [id]);
    await q("insert into public.profiles(id,display_name,first_name) values($1,'test','test')", [id]);
  }
  for (const [id, role] of [[person,'parent'], [person,'teacher'], [person,'student'], [child,'student'], [other,'student']]) {
    await q('insert into public.user_roles(user_id,role) values($1,$2)', [id,role]);
  }
  await q('insert into public.parent_students(parent_id,student_id) values($1,$2)', [person, child]);
  await q('insert into public.teacher_students(teacher_id,student_id) values($1,$2)', [person, child]);
  const classroom = (await q("insert into public.classrooms(teacher_id,name) values($1,'Synthetic') returning id", [person])).rows[0].id;
  await db.exec("insert into public.curriculum_topics values(1,'topic','Topic',0); insert into public.curriculum_units values(1,'topic','unit','Unit',0); insert into public.curriculum_subunits values(1,'topic','unit','sub','Sub',0)");
  for (const id of [person, child, other]) {
    await q("select set_config('request.jwt.claim.sub',$1,false)", [id]);
    await q("insert into public.exercise_attempts(student_id,attempt_id,grade,topic_id,subunit_id,result) values($1,'attempt',1,'topic','sub','{\"score\":42,\"answers\":[\"synthetic\"]}')", [id]);
    await q('insert into public.student_grades(student_id,grade) values($1,1)', [id]);
  }
  await q('insert into auth.sessions(id,user_id) values ($1,$2),($3,$2)', [session,person,otherSession]);
  await q("insert into auth.identities(user_id,provider,provider_id) values($1,'google','synthetic-subject')", [person]);
  const login = async (id, amr, sid=session) => {
    await db.exec('reset role; set role authenticated');
    await q("select set_config('request.jwt.claim.sub',$1,false)", [id]);
    await q("select set_config('request.jwt.claims',$1,false)", [JSON.stringify({amr,session_id:sid})]);
  };
  const method = (...names) => names.map(name => ({ method: name, timestamp: 1 }));
  const role = async name => (await q('select academy_private.has_role($1) as ok',[name])).rows[0].ok;
  const canView = async id => (await q('select academy_private.can_view_student($1) as ok',[id])).rows[0].ok;
  const capacity = () => q('select public.teacher_classroom_set_capacity($1,5,1)', [classroom]);

  await login(person, method('oauth'));
  assert.equal(await role('parent'), false); assert.equal(await role('student'), false);
  assert.equal((await q('select public.review_google_proof_status() as ok')).rows[0].ok,false);
  assert.equal((await q('select * from public.exercise_attempts')).rows.length, 0);
  await assert.rejects(() => q('select * from public.parent_review_children()'));
  await db.exec('reset role; set role service_role');
  await q('select public.review_google_proof_begin($1,$2,$3,$4,$5,$6)', [person,session,state,cookie,nonce,verifier]);
  await q('select public.review_google_proof_finish($1,$2,$3,$4)', [state,cookie,nonce,'synthetic-subject']);
  await login(person, method('oauth'),otherSession);
  assert.equal(await role('parent'), false); assert.equal(await role('student'), false);
  await login(person, method('oauth'));
  assert.equal((await q('select public.review_google_proof_status() as ok')).rows[0].ok,true);
  assert.equal((await q('select public.review_teacher_session_status() as ok')).rows[0].ok,false);
  assert.equal(await role('parent'), true); assert.equal(await role('student'), true); assert.equal(await role('teacher'), false);
  assert.equal(await canView(person), true); assert.equal(await canView(child), true); assert.equal(await canView(other), false);
  assert.equal((await q('select * from public.parent_review_children()')).rows.length, 1);
  const googleAttempts = (await q('select student_id from public.exercise_attempts order by student_id')).rows.map(row => row.student_id);
  assert.deepEqual(googleAttempts, [person], 'Google multi-role session must not gain teacher raw-attempt access');
  assert.equal((await q('select * from public.parent_review_recent_attempts($1)', [child])).rows.length, 1);
  await assert.rejects(() => q('select * from public.parent_review_recent_attempts($1)', [other]));
  await q("insert into public.exercise_attempts(student_id,attempt_id,grade,topic_id,subunit_id,result) values($1,'google-write',1,'topic','sub','{}')", [person]);
  await assert.rejects(() => q('select * from public.teacher_classrooms_list()'));
  await assert.rejects(() => q('select * from public.tutor_lesson_notes_list($1)', [child]));
  await assert.rejects(() => q("select * from public.tutor_lesson_note_save($1,null,'Synthetic note','parent',null)", [child]));
  await assert.rejects(() => q('select * from public.teacher_classroom_capacity($1)', [classroom]));
  await assert.rejects(() => q('select public.teacher_classroom_add_student($1,$2)', [classroom,child]));
  await assert.rejects(() => q('select public.teacher_classroom_remove_student($1,$2)', [classroom,child]));
  await assert.rejects(capacity);

  await login(person, method('password'));
  assert.equal((await q('select public.review_teacher_session_status() as ok')).rows[0].ok,true);
  assert.equal(await role('parent'), false); assert.equal(await role('student'), false); assert.equal(await role('teacher'), true);
  assert.equal(await canView(person), false); assert.equal(await canView(child), true); assert.equal(await canView(other), false);
  assert.deepEqual((await q('select student_id from public.exercise_attempts order by student_id')).rows.map(row => row.student_id), [child]);
  await assert.rejects(() => q("insert into public.exercise_attempts(student_id,attempt_id,grade,topic_id,subunit_id,result) values($1,'password-write',1,'topic','sub','{}')", [person]));
  await assert.rejects(() => q('select * from public.parent_review_children()'));
  await assert.rejects(() => q('select * from public.parent_review_recent_attempts($1)', [child]));
  assert.equal((await q('select * from public.teacher_classrooms_list()')).rows.length, 1);
  assert.equal((await q("select * from public.tutor_lesson_note_save($1,null,'Synthetic note','parent',null)", [child])).rows.length,1);
  assert.equal((await q('select * from public.tutor_lesson_notes_list($1)', [child])).rows.length,1);
  assert.equal((await capacity()).rows[0].teacher_classroom_set_capacity, true);

  for (const malformed of [null, {}, [], [{method:null}], method('oauth','password'), method('recovery'), method('token_refresh'), method('oauth','oauth')]) {
    await login(person, malformed);
    for (const r of ['parent','student','teacher']) assert.equal(await role(r), false, `must deny ${JSON.stringify(malformed)} for ${r}`);
  }
  await login(person, method('oauth','totp')); assert.equal(await role('parent'),true); assert.equal(await role('teacher'),false);
  await login(person, method('password','totp')); assert.equal(await role('teacher'),true); assert.equal(await role('parent'),false);
  await login(other, method('oauth')); assert.equal(await role('parent'), false); assert.equal(await canView(child), false);
  await db.exec('reset role'); await q('delete from auth.sessions where id=$1',[session]);
  await login(person, method('password'),session); assert.equal(await role('teacher'),false);
  await assert.rejects(() => q('select * from public.teacher_classrooms_list()'));
  console.log('Local combined proof/policy prototype checks passed (synthetic claims; not a live-session proof).');
} finally { await db.close(); }
