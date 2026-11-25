import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { verifyGoogleProofStatus } from '../lib/googleProof';

const uuid = (v: unknown): v is string => typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
type Application = {id:string; student_id:string; state:'pending'|'approved'|'rejected'|'cancelled'; created_at:string};
const states: Record<Application['state'],string> = {pending:'განხილვის მოლოდინში',approved:'დადასტურებულია',rejected:'უარყოფილია',cancelled:'გაუქმებულია'};

/** Requesting a link never grants access; an authorized admin must verify it. */
export function ParentLinkApplications({client,parentId,onChanged}:{client:SupabaseClient;parentId:string;onChanged:()=>void}) {
  const [studentId,setStudentId]=useState('');
  const [application,setApplication]=useState<{id:string;studentId:string}|null>(null);
  const [rows,setRows]=useState<Application[]>([]);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const mounted=useRef(true); const pending=useRef(false); const revision=useRef(0);
  const refresh=async()=>{
    const current=++revision.current;
    try {
      await verifyGoogleProofStatus(client);
      const user=await client.auth.getUser();if(user.error||user.data.user?.id!==parentId)throw new Error('Unavailable');
      const result=await client.rpc('review_parent_link_my_requests');
      if(result.error||!Array.isArray(result.data)||result.data.length>20)throw new Error('Unavailable');
      const mapped:Application[]=result.data.map((row:Record<string,unknown>)=>{
        if(!uuid(row.id)||!uuid(row.student_id)||typeof row.state!=='string'||!Object.prototype.hasOwnProperty.call(states,row.state)||typeof row.created_at!=='string'||!Number.isFinite(Date.parse(row.created_at)))throw new Error('Unavailable');
        return {id:row.id,student_id:row.student_id,state:row.state as Application['state'],created_at:row.created_at};
      });
      if(mounted.current&&current===revision.current)setRows(mapped);
    }catch{if(mounted.current&&current===revision.current)setMessage('მოთხოვნების სია დროებით მიუწვდომელია.');}
  };
  useEffect(()=>{mounted.current=true;void refresh();return()=>{mounted.current=false;revision.current++;};},[client,parentId]);
  const send=async(intent:{id:string;studentId:string})=>{
    if(pending.current)return; pending.current=true;setBusy(true);setMessage('');
    try {
      await verifyGoogleProofStatus(client);
      const user=await client.auth.getUser();if(user.error||user.data.user?.id!==parentId)throw new Error('Unavailable');
      const result=await client.rpc('review_parent_link_request',{p_request:intent.id,p_expected_parent:parentId,p_student:intent.studentId});
      if(result.error||result.data!=='received')throw new Error('Unavailable');
      setApplication(null);setStudentId('');setMessage('მოთხოვნა მიღებულია. აკადემია ცალკე გადაამოწმებს უფლებამოსილებას.');
      await refresh();
    }catch{setMessage('შედეგი ვერ დადასტურდა. იგივე მოთხოვნა გაიმეორეთ; ახალი ჯერ არ შექმნათ.');}
    finally{pending.current=false;if(mounted.current)setBusy(false);}
  };
  const submit=(event:FormEvent)=>{
    event.preventDefault();const value=studentId.trim().toLowerCase();
    if(application||!uuid(value)||!uuid(parentId)||value===parentId.toLowerCase()||!globalThis.crypto?.randomUUID)return;
    const intent={id:globalThis.crypto.randomUUID(),studentId:value};setApplication(intent);void send(intent);
  };
  const cancel=async(id:string)=>{
    if(pending.current)return;pending.current=true;setBusy(true);setMessage('');
    try {await verifyGoogleProofStatus(client);const user=await client.auth.getUser();if(user.error||user.data.user?.id!==parentId)throw new Error('Unavailable');
      const result=await client.rpc('review_parent_link_cancel',{p_expected_parent:parentId,p_request:id});if(result.error)throw new Error('Unavailable');await refresh();onChanged();
    }catch{setMessage('მოთხოვნის გაუქმება ვერ დადასტურდა.');}finally{pending.current=false;if(mounted.current)setBusy(false);}
  };
  return <section><h2>მოსწავლის დაკავშირება</h2>
    <p>შეიყვანეთ აკადემიისგან მიღებული მოსწავლის ანგარიშის ნომერი. აკადემია დამოუკიდებლად გადაამოწმებს მშობლის უფლებამოსილებას; მოთხოვნა თავისით წვდომას არ იძლევა.</p>
    <form onSubmit={submit}><label>მოსწავლის ანგარიშის ნომერი <input value={studentId} onChange={event=>setStudentId(event.target.value)} disabled={busy||!!application} required autoComplete="off" /></label>
      {application ? <button type="button" disabled={busy} onClick={()=>void send(application)}>იგივე მოთხოვნის გამეორება</button> : <button type="submit" disabled={busy}>მოთხოვნის გაგზავნა</button>}
    </form>
    {message&&<p role="status">{message}</p>}
    {rows.length>0&&<ul>{rows.map(row=><li key={row.id}>{row.student_id} · {states[row.state]} {row.state==='pending'&&<button type="button" disabled={busy} onClick={()=>void cancel(row.id)}>გაუქმება</button>}</li>)}</ul>}
  </section>;
}
