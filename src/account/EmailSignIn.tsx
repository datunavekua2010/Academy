import { useRef, useState, type FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Link } from '../router';
import { recoveryClient } from '../lib/passwordRecovery';
import { signupClient } from '../lib/accountSignup';
import { RecoveryRequest } from './PasswordRecovery';
import { useTurnstileReview } from './TurnstileReview';

/** Identity only: role selection happens separately after a successful sign-in. */
export function EmailSignIn({ client }: { client: SupabaseClient }) {
  const [email,setEmail]=useState(''), [password,setPassword]=useState(''), [busy,setBusy]=useState(false), [error,setError]=useState('');
  const pending=useRef(false); const captcha=useTurnstileReview();
  const submit=async (event:FormEvent)=>{
    event.preventDefault(); if(pending.current)return;
    pending.current=true;setBusy(true);setError('');
    try {
      const token=await captcha.verify();
      const result=await client.auth.signInWithPassword({email:email.trim(),password,...(token?{options:{captchaToken:token}}:{})});
      if(result.error)throw result.error;
    } catch {setError('შესვლა ვერ მოხერხდა. შეამოწმეთ ელფოსტა და პაროლი ან სცადეთ მოგვიანებით.');}
    finally {captcha.reset();setPassword('');pending.current=false;setBusy(false);}
  };
  return <>
    <form className="recovery-form" onSubmit={event=>void submit(event)}>
      <label>ელფოსტა<input type="email" autoComplete="username" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)}/></label>
      <label>პაროლი<input type="password" autoComplete="current-password" required maxLength={128} value={password} onChange={e=>setPassword(e.target.value)}/></label>
      {captcha.widgets}{error&&<p role="alert">{error}</p>}
      <button type="submit" disabled={busy||!captcha.ready}>{busy?'იტვირთება…':'შესვლა'}</button>
    </form>
    {signupClient&&<p><Link to="/account/register">ანგარიშის შექმნა</Link></p>}
    {recoveryClient&&<RecoveryRequest client={recoveryClient}/>}
  </>;
}
