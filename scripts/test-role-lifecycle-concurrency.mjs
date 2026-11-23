// Forced multi-connection races against temporary local PostgreSQL; no remote access.
import EmbeddedPostgres from '../.scratch/postgres/node_modules/embedded-postgres/dist/index.js';
import {mkdtemp,readFile,rm} from 'node:fs/promises';import {createServer} from 'node:net';import assert from 'node:assert/strict';
const port=await new Promise((resolve,reject)=>{const server=createServer();server.once('error',reject);server.listen(0,'127.0.0.1',()=>{const p=server.address().port;server.close(e=>e?reject(e):resolve(p));});});
const dir=await mkdtemp('.scratch/postgres/roles-cluster-');const pg=new EmbeddedPostgres({databaseDir:dir,port,user:'localtest',password:'temporary-local-test',persistent:false,postgresFlags:['-h','127.0.0.1'],onLog:()=>{},onError:()=>{}});let started=false;const clients=[];
try{
 await pg.initialise();await pg.start();started=true;for(let i=0;i<3;i++){const c=pg.getPgClient('postgres','127.0.0.1');await c.connect();await c.query("set statement_timeout='8s'");clients.push(c);}
 const [a,b,m]=clients;await a.query(`create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key,email_confirmed_at timestamptz default now(),banned_until timestamptz,deleted_at timestamptz,is_anonymous boolean default false);create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;grant usage on schema auth to authenticated,anon;grant execute on function auth.uid() to authenticated,anon;`);
 for(const f of ['202611200001_initial_academy.sql','202611220001_tutor_lesson_notes.sql','202611230001_classrooms_review.sql','202611240001_teacher_tests_review.sql','202611250001_classroom_capacity_review.sql','202611260001_classroom_abuse_review.sql','202611270001_classroom_codes_review.sql','202611280001_admin_teacher_links_review.sql','202611290001_teacher_link_revoke_review.sql','202611300001_teacher_write_lock_review.sql','202612010001_homework_review.sql','202612020001_role_lifecycle_review.sql','202612030001_parent_link_review.sql','202612040001_role_regrant_review.sql','202612050001_profile_provision_review.sql','202612060001_parent_dashboard_review.sql','202612070001_evidence_pilot_review.sql','202612080001_profile_reconcile_review.sql','202612090001_parent_link_requests_review.sql','202612100001_parent_data_minimization_review.sql','202612110001_parent_link_rpc_privileges_review.sql'])await a.query(await readFile('supabase/migrations/'+f,'utf8'));
 const [admin,t,t2,s]=[1,2,3,4].map(n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`);
 for(const id of [admin,t,t2,s]){await a.query('insert into auth.users values($1)',[id]);await a.query("insert into public.profiles(id,display_name,first_name) values($1,'name','name')",[id]);}
 for(const [id,role] of [[admin,'admin'],[t,'teacher'],[t2,'teacher'],[s,'student']])await a.query('insert into public.user_roles values($1,$2)',[id,role]);await a.query('insert into public.teacher_students values($1,$2)',[t,s]);
 await a.query("insert into public.curriculum_topics values(1,'topic','Topic',0);insert into public.curriculum_units values(1,'topic','unit','Unit',0);insert into public.curriculum_subunits values(1,'topic','unit','sub','Sub',0);insert into public.exercise_templates(template_id,grade,topic_id,subunit_id) values('template',1,'topic','sub')");
 const room=(await a.query("insert into public.classrooms(teacher_id,name,capacity) values($1,'Room',10) returning id",[t])).rows[0].id;
 const actor=async(c,id)=>{await c.query('reset role;set role authenticated');await c.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);};
 const wait=async c=>{for(let i=0;i<150;i++){if((await (c === m ? b : m).query('select wait_event_type from pg_stat_activity where pid=$1',[c.processID])).rows[0]?.wait_event_type==='Lock')return;await new Promise(r=>setTimeout(r,20));}throw new Error('No lock wait');};
 const revoke=(c,id,role)=>c.query('select public.admin_revoke_academy_role($1,$2,$3) as ok',[id,role,'REQ']);
 const establish=(c,teacher=t)=>c.query('select public.admin_establish_teacher_link($1,$2,$3) as ok',[teacher,s,'AUTH']);
 const unlink=(c,teacher=t)=>c.query('select * from public.admin_revoke_teacher_link($1,$2,$3)',[teacher,s,'CLEAN']);
 const attempt=(c,id)=>c.query("insert into public.exercise_attempts(student_id,attempt_id,grade,topic_id,subunit_id,result) values($1,$2,1,'topic','sub','{}')",[s,id]);
 const regrant=async(id,role)=>m.query('insert into public.user_roles values($1,$2)',[id,role]);
 // Existing student attempt obtains a role lock first; suspension waits for commit.
 await actor(a,s);await actor(b,admin);await a.query('begin');await attempt(a,'before');const revokeAfterAttempt=revoke(b,s,'student');await wait(b);await a.query('commit');assert.equal((await revokeAfterAttempt).rows[0].ok,true);
 assert.equal(Number((await m.query('select count(*) as n from public.exercise_attempts')).rows[0].n),1);
 // Clean the old link before reinstatement, then prove the opposite ordering fails.
 await unlink(b);await regrant(s,'student');await establish(b);await b.query('begin');await revoke(b,s,'student');const deniedAttempt=attempt(a,'after').then(()=>false,()=>true);await wait(a);await b.query('commit');assert.equal(await deniedAttempt,true);assert.equal(Number((await m.query('select count(*) as n from public.exercise_attempts')).rows[0].n),1);
 // A stale repeatable-read session cannot write after role removal.
 await unlink(b);await regrant(s,'student');await establish(b);await a.query('begin isolation level repeatable read');await a.query('select count(*) from public.exercise_attempts');await revoke(b,s,'student');await assert.rejects(()=>attempt(a,'stale'));await a.query('rollback');
 // A link established before suspension remains retained but cannot be revived by regrant.
 await unlink(b);await regrant(s,'student');await b.query('begin');assert.equal((await establish(b)).rows[0].ok,true);await actor(a,admin);const revokeAfterLink=revoke(a,s,'student');await wait(a);await b.query('commit');assert.equal((await revokeAfterLink).rows[0].ok,true);await assert.rejects(()=>regrant(s,'student'));await unlink(a);await regrant(s,'student');
 // Suspension before a new link makes the waiting establishment fail.
 await a.query('begin');await revoke(a,s,'student');const deniedLink=establish(b).then(()=>false,()=>true);await wait(b);await a.query('commit');assert.equal(await deniedLink,true);await regrant(s,'student');await establish(a);
 // Teacher homework create and suspension: both orders.
 const request=n=>`10000000-0000-4000-8000-${String(n).padStart(12,'0')}`;const hw=(c,n)=>c.query("select public.teacher_homework_create($1,$2,'Title','','9998-01-01T00:00:00Z',$3::jsonb)",[request(n),s,JSON.stringify([{grade:1,topicId:'topic',subtopicId:'sub'}])]);
 await actor(b,t);await b.query('begin');await hw(b,1);const teacherRevoked=revoke(a,t,'teacher');await wait(a);await b.query('commit');assert.equal((await teacherRevoked).rows[0].ok,true);await unlink(a);await regrant(t,'teacher');await establish(a);
 await a.query('begin');await revoke(a,t,'teacher');const deniedHomework=hw(b,2).then(()=>false,()=>true);await wait(b);await a.query('commit');assert.equal(await deniedHomework,true);await unlink(a);await regrant(t,'teacher');await establish(a);
 // A classroom write and suspension serialize through the teacher role row.
 await b.query('begin');await b.query("select public.teacher_classroom_save(null,'new',null,'',null)");const classRevoke=revoke(a,t,'teacher');await wait(a);await b.query('commit');assert.equal((await classRevoke).rows[0].ok,true);await unlink(a);await regrant(t,'teacher');await establish(a);
 await a.query('begin');await revoke(a,t,'teacher');const deniedClass=b.query("select public.teacher_classroom_save(null,'no',null,'',null)").then(()=>false,()=>true);await wait(b);await a.query('commit');assert.equal(await deniedClass,true);await unlink(a);await regrant(t,'teacher');await establish(a);
 // Notes use the existing pair-lock + role-row protocol.
 await actor(b,t);await b.query('begin');await b.query("select * from public.tutor_lesson_note_save($1,null,'note','tutor',null)",[s]);const noteRevoke=revoke(a,s,'student');await wait(a);await b.query('commit');assert.equal((await noteRevoke).rows[0].ok,true);await unlink(a);await regrant(s,'student');await establish(a);
 await a.query('begin');await revoke(a,s,'student');const deniedNote=b.query("select * from public.tutor_lesson_note_save($1,null,'no','tutor',null)",[s]).then(()=>false,()=>true);await wait(b);await a.query('commit');assert.equal(await deniedNote,true);await unlink(a);await regrant(s,'student');await establish(a);
 // Membership removal uses the same pair lock and role rechecks.
 await b.query('select public.teacher_classroom_add_student($1,$2)',[room,s]);await b.query('begin');await b.query('select public.teacher_classroom_remove_student($1,$2)',[room,s]);const memberRevoke=revoke(a,s,'student');await wait(a);await b.query('commit');assert.equal((await memberRevoke).rows[0].ok,true);await unlink(a);await regrant(s,'student');await establish(a);
 await b.query('select public.teacher_classroom_add_student($1,$2)',[room,s]);await a.query('begin');await revoke(a,s,'student');const deniedRemove=b.query('select public.teacher_classroom_remove_student($1,$2)',[room,s]).then(()=>false,()=>true);await wait(b);await a.query('commit');assert.equal(await deniedRemove,true);await unlink(a);await regrant(s,'student');await establish(a);
 // Saved test writes also lock the teacher role; both orders are exercised.
 const testContent=JSON.stringify({title:'Test',instructions:'',nameField:false,dateField:false,branding:false,grade:null,minutes:null,questions:[]});
 await b.query('begin');await b.query('select * from public.teacher_test_save(null,null,$1::jsonb)',[testContent]);const testRevoke=revoke(a,t,'teacher');await wait(a);await b.query('commit');assert.equal((await testRevoke).rows[0].ok,true);await unlink(a);await regrant(t,'teacher');await establish(a);
 await a.query('begin');await revoke(a,t,'teacher');const deniedTest=b.query('select * from public.teacher_test_save(null,null,$1::jsonb)',[testContent]).then(()=>false,()=>true);await wait(b);await a.query('commit');assert.equal(await deniedTest,true);await unlink(a);await regrant(t,'teacher');await establish(a);
 // Service-issued codes are fenced by the teacher role as well. Retiring a
 // suspended teacher's codes is required before that role can be regranted.
 await b.query('reset role;set role service_role');const issue=(c,digest,revision)=>c.query("select public.classroom_code_issue($1,$2,$3,date '9998-01-01',10,$4)",[t,room,revision,digest]);
 let revision=(await m.query('select revision from public.classrooms where id=$1',[room])).rows[0].revision;
 await b.query('begin');await issue(b,'c'.repeat(64),revision);const issueRevoke=revoke(a,t,'teacher');await wait(a);await b.query('commit');assert.equal((await issueRevoke).rows[0].ok,true);await unlink(a);await assert.rejects(()=>regrant(t,'teacher'));assert.equal((await a.query('select public.admin_retire_suspended_teacher_codes($1,$2) as n',[t,'CODE'])).rows[0].n,1);await regrant(t,'teacher');await establish(a);
 revision=(await m.query('select revision from public.classrooms where id=$1',[room])).rows[0].revision;await a.query('begin');await revoke(a,t,'teacher');const deniedIssue=issue(b,'d'.repeat(64),revision).then(()=>false,()=>true);await wait(b);await a.query('commit');assert.equal(await deniedIssue,true);await unlink(a);await regrant(t,'teacher');await establish(a);
 // Direct privileged grant with an OLD snapshot must not resurrect a link added
 // and then hidden by a later role deletion. Epoch conflict must abort it.
 await b.query('reset role');await b.query('begin isolation level repeatable read');await b.query('select count(*) from public.teacher_students');await establish(a,t2);await revoke(a,t2,'teacher');
 await assert.rejects(()=>b.query("insert into public.user_roles values($1,'teacher')",[t2]),e=>e.code==='40001');await b.query('rollback');await assert.rejects(()=>regrant(t2,'teacher'));await unlink(a,t2);await regrant(t2,'teacher');
 // A suspended teacher's code retirement serializes against role regrant.
 await revoke(a,t,'teacher');await unlink(a);await m.query("insert into academy_private.classroom_invites(classroom_id,code_digest,expires_at) values($1,$2,clock_timestamp()+interval '1 day')",[room,'a'.repeat(64)]);
 await a.query('begin');assert.equal((await a.query('select public.admin_retire_suspended_teacher_codes($1,$2) as n',[t,'CODE'])).rows[0].n,1);const concurrentGrant=m.query("insert into public.user_roles values($1,'teacher')",[t]);await wait(m);await a.query('commit');await concurrentGrant;
 assert.equal(Number((await b.query('select count(*) as n from academy_private.classroom_invites where revoked_at is null')).rows[0].n),0);
 // A stale retirement must not revoke a code issued after a teacher regrant.
 await revoke(a,t,'teacher');await actor(b,admin);await b.query('begin isolation level repeatable read');await b.query('select count(*) from public.user_roles');await regrant(t,'teacher');
 await m.query("insert into academy_private.classroom_invites(classroom_id,code_digest,expires_at) values($1,$2,clock_timestamp()+interval '1 day')",[room,'e'.repeat(64)]);
 await assert.rejects(()=>b.query('select public.admin_retire_suspended_teacher_codes($1,$2)',[t,'STALE']),e=>e.code==='40001');await b.query('rollback');
 assert.equal(Number((await m.query('select count(*) as n from academy_private.classroom_invites where code_digest=$1 and revoked_at is null',['e'.repeat(64)])).rows[0].n),1);
 // A suspension using a stale snapshot must not report an absent role while
 // a newer grant is active. Its epoch write forces an explicit retry.
 await revoke(a,t,'teacher');await a.query('select public.admin_retire_suspended_teacher_codes($1,$2)',[t,'CODE']);await b.query('begin isolation level repeatable read');await b.query('select count(*) from public.user_roles');await regrant(t,'teacher');
 await assert.rejects(()=>revoke(b,t,'teacher'),e=>e.code==='40001');await b.query('rollback');assert.equal(Number((await m.query("select count(*) as n from public.user_roles where user_id=$1 and role='teacher'",[t])).rows[0].n),1);
 // A privileged direct DELETE takes the role tuple lock before its trigger can
 // take the lifecycle advisory lock. The admin RPC takes the locks in reverse
 // order. PostgreSQL detects and aborts one transaction; this is an operational
 // limitation, not a safe undocumented maintenance path.
 await a.query('reset role');await actor(b,admin);await a.query("set deadlock_timeout='200ms'");
 await a.query('begin');await a.query("select * from public.user_roles where user_id=$1 and role='teacher' for update",[t2]);
 const rpc = revoke(b,t2,'teacher').then(value=>({side:'rpc',value}),error=>({side:'rpc',error}));
 await wait(b);
 const direct = a.query("delete from public.user_roles where user_id=$1 and role='teacher'",[t2]).then(value=>({side:'direct',value}),error=>({side:'direct',error}));
 const first=await Promise.race([rpc,direct]);
 if (first.side==='direct' && first.error) {
   assert.equal(first.error.code,'40P01');
   await a.query('rollback');const done=await rpc;assert.equal(done.value.rows[0].ok,true);await regrant(t2,'teacher');
 } else {
   // Either completion can be delivered first after the RPC is chosen as the
   // deadlock victim, so inspect both outcomes rather than assuming callback order.
   const rpcResult=first.side==='rpc' ? first : await rpc;
   const directResult=first.side==='direct' ? first : await direct;
   assert.equal(rpcResult.error?.code,'40P01');assert.equal(directResult.value.rowCount,1);
   await a.query('rollback');
 }
 assert.equal(Number((await m.query("select count(*) as n from public.user_roles where user_id=$1 and role='teacher'",[t2])).rows[0].n),1);
 // The new audited restore RPC is serialized against suspension, including
 // stale snapshots, and never needs to bypass the existing regrant guard.
 await actor(a,admin);await actor(b,admin);
 const restore=c=>c.query("select public.admin_restore_academy_role($1,'teacher','RESTORE') as ok",[t2]);
 await revoke(a,t2,'teacher');
 await a.query('begin');assert.equal((await restore(a)).rows[0].ok,true);const afterRestore=revoke(b,t2,'teacher');await wait(b);await a.query('commit');assert.equal((await afterRestore).rows[0].ok,true);
 await restore(a);await a.query('begin');await revoke(a,t2,'teacher');const afterSuspension=restore(b);await wait(b);await a.query('commit');assert.equal((await afterSuspension).rows[0].ok,true);
 await revoke(a,t2,'teacher');await b.query('begin isolation level repeatable read');await b.query('select count(*) from public.user_roles');await restore(a);
 await assert.rejects(()=>restore(b),e=>e.code==='40001');await b.query('rollback');
 await revoke(a,t2,'teacher');await b.query('begin isolation level repeatable read');await b.query('select count(*) from public.user_roles');await restore(a);
 await assert.rejects(()=>revoke(b,t2,'teacher'),e=>e.code==='40001');await b.query('rollback');
 console.log('Role removal, reinstatement and write races: passed on local PostgreSQL.');
}finally{for(const c of clients)await c.end().catch(()=>{});if(started)await pg.stop();await rm(dir,{recursive:true,force:true});}
