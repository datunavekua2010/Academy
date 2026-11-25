import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { verifyAdmin } from './data';

const uuid=(v:unknown):v is string=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
type Application={id:string;parent_id:string;student_id:string;created_at:string};
type Decision={id:string;decision:'approve'|'reject';reference:string};
export function ParentApplicationsReview({client,actor}:{client:SupabaseClient;actor:string}) {
 const [items,setItems]=useState<Application[]>([]),[selected,setSelected]=useState(''),[decision,setDecision]=useState<'approve'|'reject'>('approve'),[reference,setReference]=useState(''),[confirmed,setConfirmed]=useState(false),[intent,setIntent]=useState<Decision|null>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const mounted=useRef(true),pending=useRef(false),revision=useRef(0);
 const refresh=async()=>{const current=++revision.current;try{
  await verifyAdmin(client,actor);const result=await client.rpc('review_admin_parent_link_applications');if(result.error||!Array.isArray(result.data)||result.data.length>100)throw new Error('Unavailable');
  const mapped:Application[]=result.data.map((row:Record<string,unknown>)=>{if(!uuid(row.id)||!uuid(row.parent_id)||!uuid(row.student_id)||typeof row.created_at!=='string'||!Number.isFinite(Date.parse(row.created_at)))throw new Error('Unavailable');return {id:row.id,parent_id:row.parent_id,student_id:row.student_id,created_at:row.created_at};});
  await verifyAdmin(client,actor);if(mounted.current&&revision.current===current)setItems(mapped);
 }catch{if(mounted.current&&revision.current===current)setMessage('მოთხოვნების სია მიუწვდომელია.');}};
 useEffect(()=>{mounted.current=true;void refresh();return()=>{mounted.current=false;revision.current++;};},[client,actor]);
 const send=async(value:Decision)=>{if(pending.current)return;pending.current=true;setBusy(true);setMessage('');try{
  await verifyAdmin(client,actor);const result=await client.rpc('review_admin_parent_link_decide',{p_expected_admin:actor,p_request:value.id,p_decision:value.decision,p_reference:value.reference});
  if(result.error||result.data!==(value.decision==='approve'?'approved':'rejected'))throw new Error('Uncertain');
  await verifyAdmin(client,actor);if(mounted.current){setIntent(null);setSelected('');setReference('');setConfirmed(false);setMessage('მოთხოვნა დამუშავდა.');await refresh();}
 }catch{if(mounted.current)setMessage('შედეგი გაურკვეველია. გაიმეორეთ მხოლოდ იგივე გადაწყვეტილება და ნომერი.');}finally{pending.current=false;if(mounted.current)setBusy(false);}};
 const submit=(event:FormEvent)=>{event.preventDefault();if(intent||!confirmed||!uuid(selected)||!/^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/.test(reference.trim()))return;const value={id:selected,decision,reference:reference.trim()};setIntent(value);void send(value);};
 return <section><h2>ოჯახის კავშირის მოთხოვნები</h2><p>დადასტურებამდე დამოუკიდებლად გადაამოწმეთ მშობლის ვინაობა, უფლებამოსილება და გაზიარების საფუძველი. მოთხოვნა ან მონიშნული უჯრა ამის მტკიცებულება არ არის.</p>
 <button type="button" disabled={busy||!!intent} onClick={()=>void refresh()}>სიის განახლება</button>
 {items.length>0?<ul>{items.map(item=><li key={item.id}>მშობელი: {item.parent_id} · მოსწავლე: {item.student_id} · მოთხოვნა: {item.id}</li>)}</ul>:<p>მოლოდინში მყოფი მოთხოვნები არ ჩანს.</p>}
 <form onSubmit={submit}><fieldset disabled={busy||!!intent}>
 <label>მოთხოვნა <select value={selected} onChange={e=>setSelected(e.target.value)} required><option value="">აირჩიეთ</option>{items.map(item=><option value={item.id} key={item.id}>{item.id}</option>)}</select></label>
 <label>გადაწყვეტილება <select value={decision} onChange={e=>setDecision(e.target.value as 'approve'|'reject')}><option value="approve">დადასტურება</option><option value="reject">უარყოფა</option></select></label>
 <label>შიდა ავტორიზაციის ნომერი <input value={reference} maxLength={80} required onChange={e=>setReference(e.target.value)} /></label>
 <label><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)} required/> დამოუკიდებლად გადავამოწმე უფლებამოსილება</label></fieldset>
 {intent?<button type="button" disabled={busy} onClick={()=>void send(intent)}>იგივე გადაწყვეტილების გამეორება</button>:<button type="submit" disabled={busy||!items.length}>გადაწყვეტილების შენახვა</button>}
 {message&&<p role="status">{message}</p>}</form></section>;
}
