import { useRef, useState, type FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { verifyGoogleProofStatus } from '../lib/googleProof';

/** Review-only. Enrollment grants no parent-child link or parental authority. */
export function ParentEnrollmentReview({client,onComplete}:{client:SupabaseClient;onComplete:()=>void}) {
  const [name,setName]=useState('');
  const [adult,setAdult]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const pending=useRef(false);
  const submit=async(event:FormEvent)=>{
    event.preventDefault();
    if(pending.current || !adult || !name.trim() || name.trim().length>100)return;
    pending.current=true;setBusy(true);setError('');
    try{
      const user=await client.auth.getUser();
      if(user.error||!user.data.user?.id)throw new Error('Unavailable');
      const id=user.data.user.id;
      await verifyGoogleProofStatus(client);
      const current=await client.auth.getUser();
      if(current.error||current.data.user?.id!==id)throw new Error('Unavailable');
      const result=await client.rpc('review_parent_self_enroll',{p_expected_user:id,p_display_name:name.trim()});
      if(result.error||(result.data!=='created'&&result.data!=='already_enrolled'))throw new Error('Unavailable');
      onComplete();
    }catch{setError('მშობლის ანგარიშის შექმნა ვერ მოხერხდა. გადაამოწმეთ Google-ით შესვლა ან დაუკავშირდით აკადემიას.');}
    finally{pending.current=false;setBusy(false);}
  };
  return <form onSubmit={event=>void submit(event)}>
    <h2>მშობლის ანგარიშის შექმნა</h2>
    <label>სახელი ან მეტსახელი <input value={name} onChange={event=>setName(event.target.value)} required maxLength={100} autoComplete="off"/></label>
    <label><input type="checkbox" checked={adult} onChange={event=>setAdult(event.target.checked)} required/> სრულწლოვანი ვარ</label>
    <p>ანგარიშის შექმნა ავტომატურად არ აკავშირებს მოსწავლეს. კავშირი ცალკე უნდა დადასტურდეს.</p>
    {error&&<p role="alert">{error}</p>}
    <button type="submit" disabled={busy}>{busy?'იტვირთება…':'ანგარიშის შექმნა'}</button>
  </form>;
}
