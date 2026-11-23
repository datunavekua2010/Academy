// Synthetic catalog review under deliberately permissive service-role defaults.
// This is not a model of every Supabase grant, role membership or owner bypass.
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const db = new PGlite();
try {
  await db.exec(`create role anon; create role authenticated; create role service_role;
    create schema auth; create table auth.users(id uuid primary key,email_confirmed_at timestamptz default now(),banned_until timestamptz,deleted_at timestamptz,is_anonymous boolean default false);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    alter default privileges grant all on tables to service_role;
    alter default privileges grant all on sequences to service_role;
    alter default privileges grant execute on functions to service_role;`);
  for (const f of ['20261120154717_initial_academy.sql','202611220001_tutor_lesson_notes.sql','202611230001_classrooms_review.sql','202611240001_teacher_tests_review.sql','202611250001_classroom_capacity_review.sql','202611260001_classroom_abuse_review.sql','202611270001_classroom_codes_review.sql','202611280001_admin_teacher_links_review.sql','202611290001_teacher_link_revoke_review.sql','202611300001_teacher_write_lock_review.sql','202612010001_homework_review.sql','202612020001_role_lifecycle_review.sql','202612030001_parent_link_review.sql','202612040001_role_regrant_review.sql','202612050001_profile_provision_review.sql','202612060001_parent_dashboard_review.sql','202612070001_evidence_pilot_review.sql','202612080001_profile_reconcile_review.sql','202612090001_parent_link_requests_review.sql','202612100001_parent_data_minimization_review.sql','202612110001_parent_link_rpc_privileges_review.sql']) {
    await db.exec(readFileSync('supabase/migrations/'+f,'utf8'));
  }
  const privateAuthenticated = new Set(['has_role','can_teach','can_view_student','student_attempt_assignment_matches']);
  const privateDenied = new Set(['reserve_parent_link_request_slot','evidence_pilot_lock_student','advance_teacher_link_epoch','classroom_has_inactive_members','guard_role_reinstatement','guard_student_attempt_role','guard_teacher_assignment_write','guard_teacher_owned_row_role','lock_authorized_teacher_pair','lock_role_lifecycle','lock_teacher_student_pair','lock_parent_student_pair','reserve_homework_request_slot']);
  const service = new Set(['evidence_pilot_start','evidence_pilot_issue','evidence_pilot_submit','evidence_pilot_finish','classroom_code_clean_rate_buckets','classroom_code_consume_rate','classroom_code_issue','classroom_code_redeem','classroom_code_revoke']);
  const publicDenied = new Set(['admin_establish_parent_link','admin_revoke_parent_link']);
  const authenticated = new Set(['admin_establish_teacher_link','admin_provision_academy_profile','admin_resolve_profile_provision','admin_parent_link_change','admin_parent_link_resolve','admin_restore_academy_role','admin_retire_suspended_teacher_codes','admin_revoke_academy_role','admin_revoke_teacher_link','parent_published_lesson_notes','parent_review_children','parent_review_recent_attempts','teacher_classroom_add_student','teacher_classroom_archive','teacher_classroom_capacity','teacher_classroom_code_status','teacher_classroom_remove_student','teacher_classroom_save','teacher_classroom_set_capacity','teacher_classroom_students','teacher_classrooms_list','teacher_homework_cancel','teacher_homework_create','teacher_homework_resolve','teacher_test_delete','teacher_test_save','teacher_tests_list','tutor_lesson_note_delete','tutor_lesson_note_save','tutor_lesson_note_set_publication','tutor_lesson_notes_list']);
  const { rows: functions } = await db.query(`select n.nspname, p.proname, p.prosecdef, p.proconfig,
    has_function_privilege('anon',p.oid,'execute') as anon,
    has_function_privilege('authenticated',p.oid,'execute') as authenticated,
    has_function_privilege('service_role',p.oid,'execute') as service
    from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname in ('public','academy_private') and p.prokind='f' order by n.nspname,p.proname`);
  const names = new Set();
  for (const f of functions) {
    const key = `${f.nspname}.${f.proname}`;
    assert(!names.has(key), `unexpected overloaded function ${key}`); names.add(key);
    assert.equal(f.anon,false,`${key}: anon execute`);
    assert.deepEqual(f.proconfig,['search_path=""'],`${key}: search path`);
    if (f.nspname === 'academy_private') {
      assert(privateAuthenticated.has(f.proname) || privateDenied.has(f.proname),`unreviewed ${key}`);
      assert.equal(f.authenticated,privateAuthenticated.has(f.proname),`${key}: authenticated execute`);
      assert.equal(f.service,false,`${key}: service execute`);
    } else {
      assert(authenticated.has(f.proname) || service.has(f.proname) || publicDenied.has(f.proname),`unreviewed ${key}`);
      assert.equal(f.prosecdef,true,`${key}: expected definer`);
      assert.equal(f.authenticated,authenticated.has(f.proname),`${key}: authenticated execute`);
      assert.equal(f.service,service.has(f.proname),`${key}: service execute`);
    }
  }
  assert.equal(names.size,privateAuthenticated.size+privateDenied.size+service.size+authenticated.size+publicDenied.size,'a reviewed function is missing');
  const { rows: relations } = await db.query(`select n.nspname,c.relname,c.relkind,c.relrowsecurity,
    has_table_privilege('anon',c.oid,'select,insert,update,delete') as anon,
    has_table_privilege('authenticated',c.oid,'select,insert,update,delete') as authenticated,
    has_table_privilege('service_role',c.oid,'select,insert,update,delete') as service
    from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where c.relkind in ('r','p') and (n.nspname='academy_private' or (n.nspname='public' and c.relname in ('tutor_lesson_notes','classrooms','classroom_students','teacher_tests')))`);
  assert.equal(relations.length,21,'review restricted relations when the schema changes');
  for (const r of relations) {
    const key=`${r.nspname}.${r.relname}`;
    assert.equal(r.relrowsecurity,true,`${key}: missing RLS`);
    assert.equal(r.anon,false,`${key}: anon direct grant`);
    assert.equal(r.authenticated,false,`${key}: authenticated direct grant`);
    assert.equal(r.service,false,`${key}: service direct grant`);
  }
  const {rows: sequences}=await db.query(`select c.relname,has_sequence_privilege('service_role',c.oid,'usage,select,update') as service from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='academy_private' and c.relkind='S'`);
  assert.equal(sequences.length,4);
  for (const sequence of sequences) assert.equal(sequence.service,false,`${sequence.relname}: service sequence grant`);
  console.log('Full review-chain catalog checks under permissive service defaults: passed.');
} finally { await db.close(); }
