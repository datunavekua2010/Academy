import {useEffect,useRef,useState,type FormEvent} from 'react';
import type {SupabaseClient} from '@supabase/supabase-js';
import {Link} from '../router';
import {requestSignup,signupClient} from '../lib/accountSignup';
import './passwordRecovery.css';
import { useTurnstileReview } from './TurnstileReview';
export type SignupResult={ok:true}|{error:true};
export function SignupForm({client}:{client:SupabaseClient|null}){
 const captcha=useTurnstileReview();
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[adult,setAdult]=useState(false),[busy,setBusy]=useState(false),[done,setDone]=useState(false),[error,setError]=useState('');
 const pending=useRef(false);
 const submit=async(e:FormEvent)=>{e.preventDefault();if(!client||pending.current)return;
  if(!adult||password!==confirm){setError('დაადასტურეთ მოთხოვნები და გადაამოწმეთ პაროლები.');return;}
  pending.current=true;setBusy(true);setError('');try{const token=await captcha.verify();await requestSignup(client,email,password,window.location.origin,window.location.pathname,token);setDone(true);}
  catch{setError('მოთხოვნის შედეგი ვერ დადასტურდა. შესაძლოა ანგარიში უკვე შეიქმნა. დაუკავშირდით აკადემიას ან სცადეთ შესვლა.');}
  finally{captcha.reset();setPassword('');setConfirm('');pending.current=false;setBusy(false);}
 };
 return <main className="recovery-page"><section className="recovery-card"><h1>ანგარიშის მოთხოვნა</h1>
  {!client?<p>რეგისტრაცია ამჟამად მიუწვდომელია.</p>:done?<p role="status">თუ მოთხოვნა მიღებულია, ელფოსტაზე დადასტურების ბმულს მიიღებთ. გახსენით იმავე ბრაუზერსა და მოწყობილობაზე. დადასტურების შემდეგ შედით და აირჩიეთ მოსწავლის ან მშობლის სივრცე.</p>:<>
  <p>შექმენით ანგარიში ელფოსტითა და პაროლით. დადასტურების შემდეგ აირჩიეთ მოსწავლის ან მშობლის სივრცე.</p>
  {client&&<form onSubmit={e=>void submit(e)} className="recovery-form"><label>ელფოსტა<input type="email" autoComplete="email" maxLength={254} required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>პაროლი<input type="password" autoComplete="new-password" minLength={10} maxLength={128} required value={password} onChange={e=>setPassword(e.target.value)}/></label><label>გაიმეორეთ პაროლი<input type="password" autoComplete="new-password" minLength={10} maxLength={128} required value={confirm} onChange={e=>setConfirm(e.target.value)}/></label><label><input type="checkbox" checked={adult} onChange={e=>setAdult(e.target.checked)} required/> ვარ სრულწლოვანი და ამ ანგარიშის მოთხოვნის უფლება მაქვს</label>{error&&<p role="alert">{error}</p>}{captcha.widgets}<button disabled={busy||!captcha.ready}>{busy?'იტვირთება…':'მოთხოვნის გაგზავნა'}</button></form>}</>}
  <p><Link to="/account/login">ანგარიშში შესვლა</Link> · <Link to="/teacher">მასწავლებლის შესვლა</Link></p>
 </section></main>;
}
export function SignupPage(){return <SignupForm client={signupClient}/>;}
export function SignupConfirmation({result}:{result:Promise<SignupResult>|null}){
 const [status,setStatus]=useState<'loading'|'ok'|'error'>(result?'loading':'error');
 useEffect(()=>{let active=true;if(result)void result.then(v=>{if(active)setStatus('ok' in v?'ok':'error');},()=>{if(active)setStatus('error');});return()=>{active=false;};},[result]);
 return <main className="recovery-page"><section className="recovery-card"><h1>ელფოსტის დადასტურება</h1>{status==='loading'?<p role="status">მოწმდება…</p>:status==='ok'?<p role="status">ელფოსტა დადასტურდა. შედით ანგარიშით და აირჩიეთ მოსწავლის ან მშობლის სივრცე.</p>:<p role="alert">ბმულის დადასტურება ვერ მოხერხდა. დაუკავშირდით აკადემიას. შესაძლოა ბმული უკვე გამოყენებულია ან ვადა გაუვიდა.</p>}<p><Link to="/account/login">ანგარიშში შესვლა</Link> · <Link to="/teacher">მასწავლებლის შესვლა</Link></p></section></main>;
}
