import { PGlite } from '@electric-sql/pglite';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const db = new PGlite();
await db.exec(`create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users (id uuid primary key,email_confirmed_at timestamptz default now(),banned_until timestamptz,deleted_at timestamptz,is_anonymous boolean default false); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$; grant usage on schema auth to authenticated, anon; grant execute on function auth.uid() to authenticated, anon;`);
await db.exec(fs.readFileSync('supabase/migrations/202611200001_initial_academy.sql', 'utf8'));
await db.exec(fs.readFileSync('supabase/migrations/202611220001_tutor_lesson_notes.sql', 'utf8'));
if (process.env.ROLE_LIFECYCLE_REVIEW === '1') {
  for (const name of ['202611230001_classrooms_review.sql','202611240001_teacher_tests_review.sql','202611250001_classroom_capacity_review.sql','202611260001_classroom_abuse_review.sql','202611270001_classroom_codes_review.sql','202611280001_admin_teacher_links_review.sql','202611290001_teacher_link_revoke_review.sql','202611300001_teacher_write_lock_review.sql','202612010001_homework_review.sql','202612020001_role_lifecycle_review.sql','202612030001_parent_link_review.sql','202612040001_role_regrant_review.sql','202612050001_profile_provision_review.sql','202612060001_parent_dashboard_review.sql','202612070001_evidence_pilot_review.sql','202612080001_profile_reconcile_review.sql','202612090001_parent_link_requests_review.sql','202612100001_parent_data_minimization_review.sql','202612110001_parent_link_rpc_privileges_review.sql']) await db.exec(fs.readFileSync('supabase/migrations/' + name, 'utf8'));
} else if (process.env.WRITE_LOCK_REVIEW === '1') {
  for (const name of ['202611230001_classrooms_review.sql','202611250001_classroom_capacity_review.sql','202611260001_classroom_abuse_review.sql','202611270001_classroom_codes_review.sql','202611280001_admin_teacher_links_review.sql','202611290001_teacher_link_revoke_review.sql','202611300001_teacher_write_lock_review.sql'])
    await db.exec(fs.readFileSync('supabase/migrations/' + name, 'utf8'));
}
const [student, other, teacher, teacher2, parent, stranger] = [1,2,3,4,5,6].map((n) => `00000000-0000-4000-8000-${String(n).padStart(12,'0')}`);
for (const u of [student, other, teacher, teacher2, parent, stranger]) {
  await db.query('insert into auth.users(id) values ($1)', [u]);
  await db.query('insert into public.profiles(id,display_name,first_name) values ($1,$2,$2)', [u, u === teacher ? 'მასწავლებელი' : 'ტესტი']);
}
for (const [u, role] of [[student,'student'],[other,'student'],[teacher,'teacher'],[teacher2,'teacher'],[parent,'parent'],[stranger,'parent']]) await db.query('insert into public.user_roles values($1,$2)', [u, role]);
await db.query('insert into public.teacher_students values($1,$2),($3,$2)', [teacher, student, teacher2]);
await db.query('insert into public.parent_students values($1,$2),($3,$4)', [parent, student, stranger, other]);
async function as(u) { await db.exec('reset role; set role authenticated'); await db.query("select set_config('request.jwt.claim.sub',$1,false)", [u]); }
async function denied(sql, args = []) { await assert.rejects(() => db.query(sql, args)); }
const list = (id) => db.query('select * from public.tutor_lesson_notes_list($1)', [id]);
const parentList = (id) => db.query('select * from public.parent_published_lesson_notes($1)', [id]);
const save = (studentId, id, text, visibility, rev) => db.query('select * from public.tutor_lesson_note_save($1,$2,$3,$4,$5)', [studentId, id, text, visibility, rev]);
const publish = (studentId, id, on, rev) => db.query('select * from public.tutor_lesson_note_set_publication($1,$2,$3,$4)', [studentId, id, on, rev]);
const remove = (studentId, id, rev) => db.query('select public.tutor_lesson_note_delete($1,$2,$3)', [studentId, id, rev]);
await as(teacher);
await denied('select * from public.tutor_lesson_notes');
await assert.rejects(() => save(other, null, 'x', 'parent', null));
await assert.rejects(() => save(student, null, ' \n ', 'parent', null));
await assert.rejects(() => save(student, null, 'x', 'public', null));
await assert.rejects(() => save(student, null, 'x'.repeat(2001), 'tutor', null));
const privateNote = (await save(student, null, 'მხოლოდ მასწავლებლის', 'tutor', null)).rows[0];
const draft = (await save(student, null, 'მშობლისთვის', 'parent', null)).rows[0];
assert.equal((await list(student)).rows.length, 2);
assert.equal(draft.published_at, null);
await assert.rejects(() => publish(student, privateNote.id, true, privateNote.revision));
await as(parent);
assert.deepEqual((await parentList(student)).rows, []);
await denied('select * from public.tutor_lesson_notes');
await denied('update public.tutor_lesson_notes set note_text=$1', ['unauthorized']);
await denied('delete from public.tutor_lesson_notes');
await denied('insert into public.tutor_lesson_notes(student_id,author_id,note_text,visibility) values($1,$2,$3,$4)', [student,parent,'x','parent']);
await assert.rejects(() => save(student, draft.id, 'unauthorized', 'parent', draft.revision));
await assert.rejects(() => publish(student, draft.id, true, draft.revision));
await assert.rejects(() => remove(student, draft.id, draft.revision));
await as(stranger); await assert.rejects(() => parentList(student));
await as(student); await assert.rejects(() => parentList(student)); await assert.rejects(() => list(student));
await as(teacher2);
assert.deepEqual((await list(student)).rows, []);
await assert.rejects(() => save(student, draft.id, 'unauthorized', 'parent', draft.revision));
await assert.rejects(() => publish(student, draft.id, true, draft.revision));
await assert.rejects(() => publish(student, draft.id, false, draft.revision));
await assert.rejects(() => remove(student, draft.id, draft.revision));
await as(teacher);
let published = (await publish(student, draft.id, true, draft.revision)).rows[0];
assert.ok(published.published_at);
const again = (await publish(student, draft.id, true, published.revision)).rows[0];
assert.equal(String(again.published_at), String(published.published_at)); assert.equal(again.revision, published.revision);
await as(parent);
let visible = (await parentList(student)).rows;
assert.equal(visible.length, 1); assert.deepEqual(Object.keys(visible[0]).sort(), ['author_name','created_at','note_text']);
assert.equal(visible[0].note_text, 'მშობლისთვის'); assert.equal(visible[0].author_name, 'მასწავლებელი');
await as(teacher);
let revised = (await save(student, draft.id, 'შესწორებული', 'parent', published.revision)).rows[0];
assert.equal(revised.published_at, null);
await assert.rejects(() => save(student, draft.id, 'stale', 'parent', published.revision));
await as(parent); assert.deepEqual((await parentList(student)).rows, []);
await as(teacher); published = (await publish(student, draft.id, true, revised.revision)).rows[0];
await as(parent); assert.equal((await parentList(student)).rows[0].note_text, 'შესწორებული');
await as(teacher); revised = (await publish(student, draft.id, false, published.revision)).rows[0];
await as(parent); assert.deepEqual((await parentList(student)).rows, []);
await as(teacher); published = (await publish(student, draft.id, true, revised.revision)).rows[0];
revised = (await save(student, draft.id, 'პირადი ცვლილება', 'tutor', published.revision)).rows[0];
await as(parent); assert.deepEqual((await parentList(student)).rows, []);
await as(teacher); await remove(student, draft.id, revised.revision); assert.equal((await list(student)).rows.length, 1);
// Revoking the assignment removes both tutor and parent access to the published note.
const third = (await save(student, null, 'ბოლო', 'parent', null)).rows[0];
await publish(student, third.id, true, third.revision);
await db.exec('reset role'); await db.query('delete from public.teacher_students where teacher_id=$1 and student_id=$2', [teacher, student]);
await as(teacher); await assert.rejects(() => list(student)); await assert.rejects(() => remove(student, third.id, 2));
await as(parent); assert.deepEqual((await parentList(student)).rows, []);
// Restoring the teacher link restores visibility only while both roles and links remain current.
await db.exec('reset role'); await db.query('insert into public.teacher_students(teacher_id,student_id) values($1,$2)', [teacher,student]);
await as(parent); assert.equal((await parentList(student)).rows.length, 1);
await db.exec('reset role'); await db.query("delete from public.user_roles where user_id=$1 and role='teacher'", [teacher]);
await as(parent); assert.deepEqual((await parentList(student)).rows, []);
await as(teacher); await assert.rejects(() => list(student));
await db.exec('reset role');
if (process.env.ROLE_LIFECYCLE_REVIEW === '1') {
  await assert.rejects(() => db.query("insert into public.user_roles(user_id,role) values($1,'teacher')", [teacher]));
  await db.query('delete from public.teacher_students where teacher_id=$1 and student_id=$2', [teacher,student]);
  await db.query("insert into public.user_roles(user_id,role) values($1,'teacher')", [teacher]);
  await db.query('insert into public.teacher_students(teacher_id,student_id) values($1,$2)', [teacher,student]);
} else await db.query("insert into public.user_roles(user_id,role) values($1,'teacher')", [teacher]);
await db.query('delete from public.parent_students where parent_id=$1 and student_id=$2', [parent,student]);
await as(parent); await assert.rejects(() => parentList(student));
await db.exec('reset role'); await db.query('insert into public.parent_students(parent_id,student_id) values($1,$2)', [parent,student]);
await db.query("delete from public.user_roles where user_id=$1 and role='parent'", [parent]);
await as(parent); await assert.rejects(() => parentList(student));
await db.exec('reset role; set role anon'); await denied('select * from public.tutor_lesson_notes'); await denied('select * from public.parent_published_lesson_notes($1)', [student]);
await db.close(); console.log(`Lesson note database authorization tests${process.env.ROLE_LIFECYCLE_REVIEW === '1' ? ' with role lifecycle' : process.env.WRITE_LOCK_REVIEW === '1' ? ' with write locks' : ''}: passed.`);
