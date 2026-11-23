import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfiguration } from '../lib/supabase';
import { RecoveryRequest } from '../account/PasswordRecovery';
import { recoveryClient } from '../lib/passwordRecovery';
import { signupClient } from '../lib/accountSignup';
import { googleAuthClient } from '../lib/googleAuth';
import { GoogleAuthButton } from '../account/GoogleAuth';
import { Link } from '../router';
import { getGrade } from '../practice/curriculum';
import { topicSubtopics,type GradeId } from '../practice/types';
import { TEST_ACCOUNT_MODE } from '../student/accountMode';
import { loadParentChild, loadParentChildren, PARENT_REVIEW_ENABLED, type ParentChild, type ParentAttempt, type ParentNote } from './data';
import './parent.css';

function topicLabel(grade:number,topicId:string,subtopicId:string):string{
 const topic=getGrade(grade as GradeId).topics.find(t=>t.id===topicId);const sub=topic&&topicSubtopics(topic).find(s=>s.id===subtopicId);
 return topic&&sub?`${topic.title} / ${sub.title}`:'სასწავლო მასალა მიუწვდომელია';
}
function date(value:string):string{const d=new Date(value);return Number.isFinite(d.getTime())?new Intl.DateTimeFormat('ka-GE',{dateStyle:'medium',timeZone:'Asia/Tbilisi'}).format(d):'თარიღი მიუწვდომელია';}
type Access = {kind:'loading'|'signed-out'|'error'} | {kind:'ready';parentId:string;children:ParentChild[]};
export function ParentReviewApp({client}: {client:SupabaseClient}) {
  const [access,setAccess]=useState<Access>({kind:'loading'});
  const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [busy,setBusy]=useState(false);
  const [selected,setSelected]=useState<string|null>(null);
  const [detail,setDetail]=useState<{attempts:ParentAttempt[];notes:ParentNote[]}|null>(null);
  const [detailError,setDetailError]=useState(false);const revision=useRef(0);const detailRevision=useRef(0);
  useEffect(()=>{
    let active=true;
    const {data:{subscription}}=client.auth.onAuthStateChange((_event,session)=>{
      const current=++revision.current;detailRevision.current++;setDetail(null);setSelected(null);setDetailError(false);
      if(!session?.user){setAccess({kind:'signed-out'});return;}
      const parentId=session.user.id;setAccess({kind:'loading'});
      window.setTimeout(()=>{void loadParentChildren(client,parentId).then(children=>{
        if(active&&revision.current===current)setAccess({kind:'ready',parentId,children});
      }).catch(()=>{if(active&&revision.current===current)setAccess({kind:'error'});});},0);
    });
    return()=>{active=false;revision.current++;detailRevision.current++;subscription.unsubscribe();};
  },[client]);
  const signIn=async(e:FormEvent)=>{e.preventDefault();setBusy(true);try{const {error}=await client.auth.signInWithPassword({email:email.trim(),password});if(error)throw error;}catch{setAccess({kind:'error'});}finally{setPassword('');setBusy(false);}};
  const signOut=async()=>{revision.current++;detailRevision.current++;setSelected(null);setDetail(null);setAccess({kind:'loading'});setBusy(true);try{const {error}=await client.auth.signOut();if(error)throw error;}catch{setAccess({kind:'error'});}finally{setBusy(false);}};
  const open=async(studentId:string)=>{
    if(access.kind!=='ready')return;const current=++detailRevision.current;setSelected(studentId);setDetail(null);setDetailError(false);
    try{const result=await loadParentChild(client,access.parentId,studentId);if(current===detailRevision.current)setDetail(result);}
    catch{if(current===detailRevision.current)setDetailError(true);}
  };
  return <main className="parent-review"><a href="#home">Axiom Academy</a><h1>მშობლის სივრცე</h1>
    {access.kind==='loading'&&<p role="status">მონაცემები იტვირთება…</p>}
    {(access.kind==='signed-out'||access.kind==='error')&&<><p role={access.kind==='error'?'alert':undefined}>{access.kind==='error'?'წვდომა ან მონაცემები მიუწვდომელია. სცადეთ ხელახლა ან დაუკავშირდით აკადემიას.':'შედით აკადემიის მიერ მოწოდებული ანგარიშით.'}</p><form onSubmit={e=>void signIn(e)}><label>ელფოსტა<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username"/></label><label>პაროლი<input type="password" required value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password"/></label><button disabled={busy}>შესვლა</button></form><GoogleAuthButton client={googleAuthClient === client ? client : null}/><RecoveryRequest client={recoveryClient}/>{signupClient&&<p><Link to="/account/register">ანგარიშის მოთხოვნა</Link></p>}{access.kind==='error'&&(signupClient||googleAuthClient)&&<p><Link to="/account/status">ჩემი ანგარიშის ნომერი</Link></p>}{access.kind==='error'&&<button disabled={busy} onClick={()=>void signOut()}>ანგარიშიდან გასვლა</button>}</>}
    {access.kind==='ready'&&<><button disabled={busy} onClick={()=>void signOut()}>ანგარიშიდან გასვლა</button><h2>დაკავშირებული მოსწავლეები</h2>{access.children.length===0?<p>დაკავშირებული მოსწავლე არ მოიძებნა.</p>:<ul>{access.children.map(child=><li key={child.studentId}><button onClick={()=>void open(child.studentId)}>{child.name}{child.grade ? ` · ${child.grade} კლასი`:''}</button></li>)}</ul>}
      {selected&&<section><h2>{access.children.find(child=>child.studentId===selected)?.name}</h2>{detailError?<p role="alert">მონაცემები მიუწვდომელია.</p>:!detail?<p role="status">იტვირთება…</p>:<><p>შედეგები მოსწავლის მოწყობილობაზეა შეფასებული და სერვერის მიერ დადასტურებული არ არის.</p><h3>ბოლო სესიები</h3>{detail.attempts.length?<ul>{detail.attempts.map(a=><li key={a.id}>{date(a.createdAt)} · {a.grade} კლასი · {topicLabel(a.grade,a.topicId,a.subtopicId)} · {a.score===null?'შედეგი მიუწვდომელია':`${a.score} ქულა`}</li>)}</ul>:<p>სესიები არ მოიძებნა.</p>}<h3>ბოლო გამოქვეყნებული ჩანაწერები</h3>{detail.notes.length?<ul>{detail.notes.map((note,i)=><li key={`${note.createdAt}:${i}`}><strong>{note.author}</strong> · {date(note.createdAt)}<p>{note.text}</p></li>)}</ul>:<p>ჩანაწერები არ მოიძებნა.</p>}</>}</section>}</>}
  </main>;
}
export function ParentApp(){
  if(TEST_ACCOUNT_MODE||!PARENT_REVIEW_ENABLED||!supabaseConfiguration.client)return <main className="parent-review"><h1>მშობლის სივრცე</h1><p>მშობლის ანგარიში ამჟამად ხელმისაწვდომი არ არის.</p><a href="#home">მთავარ გვერდზე დაბრუნება</a></main>;
  return <ParentReviewApp client={supabaseConfiguration.client}/>;
}
