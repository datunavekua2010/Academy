import {useEffect,useRef,useState,type FormEvent} from 'react';
import type {SupabaseClient} from '@supabase/supabase-js';
import {Link,navigate} from '../router';
import {requestSignup,signupClient,type SignupRole} from '../lib/accountSignup';
import {supabaseConfiguration} from '../lib/supabase';
import './passwordRecovery.css';
import {useTurnstileReview} from './TurnstileReview';
export type SignupResult={ok:true}|{error:true};
const signupErrors:Record<string,string>={
 security_check_failed:'უსაფრთხოების შემოწმება ვერ მოხერხდა. სცადეთ მოგვიანებით.',
 captcha_failed:'უსაფრთხოების შემოწმება ვერ მოხერხდა. სცადეთ მოგვიანებით.',
 weak_password:'აირჩიეთ უფრო ძლიერი პაროლი.',
 email_address_invalid:'გადაამოწმეთ ელფოსტის მისამართი.',
 over_email_send_rate_limit:'ელფოსტის გაგზავნის ლიმიტი ამოიწურა. სცადეთ მოგვიანებით.',
 over_request_rate_limit:'მოთხოვნების ლიმიტი ამოიწურა. სცადეთ მოგვიანებით.',
 signup_disabled:'რეგისტრაცია ამჟამად მიუწვდომელია.',
 invalid_signup:'შეამოწმეთ ელფოსტა, პაროლი და არჩეული სივრცე.',
};
export function SignupForm({client,appClient=supabaseConfiguration.client}:{client:SupabaseClient|null;appClient?:SupabaseClient|null}){
 const captcha=useTurnstileReview();
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[role,setRole]=useState<SignupRole>('student'),[adult,setAdult]=useState(false),[busy,setBusy]=useState(false),[done,setDone]=useState(false),[error,setError]=useState('');
 const pending=useRef(false);
 const submit=async(e:FormEvent)=>{e.preventDefault();if(!client||pending.current)return;
  if(!adult||password!==confirm){setError('დაადასტურეთ მოთხოვნები და გადაამოწმეთ პაროლები.');return;}
  pending.current=true;setBusy(true);setError('');
  try{
   const token=await captcha.verify({email:email.trim(),password,role});
   const session=await requestSignup(client,email,password,window.location.origin,window.location.pathname,token,role,Boolean(appClient));
   if(!session){setDone(true);return;}
   if(!appClient)throw new Error('signup_unavailable');
   // Do not silently replace an existing, different signed-in account.
   const existing=await appClient.auth.getSession();
   if(existing.error||(existing.data.session&&existing.data.session.user.id!==session.user.id))throw new Error('signup_unavailable');
   const adopted=await appClient.auth.setSession({access_token:session.access_token,refresh_token:session.refresh_token});
   if(adopted.error||adopted.data.user?.id!==session.user.id)throw new Error('signup_unavailable');
   const persisted=await appClient.from('user_roles').select('role').eq('user_id',session.user.id).eq('role',role).maybeSingle();
   if(persisted.error||persisted.data?.role!==role)throw new Error('signup_unavailable');
   navigate(`/${role}`);
  }catch(e){const code=e instanceof Error?e.message:'';setError(signupErrors[code]??'რეგისტრაციის შედეგი ვერ დადასტურდა. შესაძლოა ანგარიში უკვე შეიქმნა. დაუკავშირდით აკადემიას.');}
  finally{captcha.reset();setPassword('');setConfirm('');pending.current=false;setBusy(false);}
 };
 return <main className="recovery-page"><section className="recovery-card"><h1>ანგარიშის შექმნა</h1>
  {!client?<p>რეგისტრაცია ამჟამად მიუწვდომელია.</p>:done?<p role="status">შეამოწმეთ ელფოსტა ანგარიშის დასადასტურებლად. გახსენით ბმული იმავე ბრაუზერსა და მოწყობილობაზე. დადასტურების შემდეგ შედით ანგარიშში.</p>:<>
  <p>შექმენით ანგარიში ელფოსტითა და პაროლით და აირჩიეთ თქვენი სივრცე.</p>
  <form onSubmit={e=>void submit(e)} className="recovery-form" aria-busy={busy}>
   <label>ელფოსტა<input type="email" autoComplete="email" maxLength={254} required value={email} onChange={e=>setEmail(e.target.value)}/></label>
   <label>პაროლი<input type="password" autoComplete="new-password" minLength={10} maxLength={128} required value={password} onChange={e=>setPassword(e.target.value)}/></label>
   <label>გაიმეორეთ პაროლი<input type="password" autoComplete="new-password" minLength={10} maxLength={128} required value={confirm} onChange={e=>setConfirm(e.target.value)}/></label>
   <label>სივრცე<select value={role} onChange={e=>setRole(e.target.value as SignupRole)}><option value="student">მოსწავლე</option><option value="parent">მშობელი</option></select></label>
   <label><input type="checkbox" checked={adult} onChange={e=>setAdult(e.target.checked)} required/> ვარ სრულწლოვანი და ამ ანგარიშის მოთხოვნის უფლება მაქვს</label>
   {error&&<p role="alert">{error}</p>}{captcha.widgets}<button disabled={busy||!captcha.ready}>{busy?<><span className="signup-spinner" aria-hidden="true" /> იტვირთება…</>:'მოთხოვნის გაგზავნა'}</button>
  </form></>}
  <p><Link to="/account/login">ანგარიშში შესვლა</Link> · <Link to="/teacher">მასწავლებლის შესვლა</Link></p>
 </section></main>;
}
export function SignupPage(){return <SignupForm client={signupClient}/>;}
export function SignupConfirmation({result}:{result:Promise<SignupResult>|null}){
 const [status,setStatus]=useState<'loading'|'ok'|'error'>(result?'loading':'error');
 useEffect(()=>{let active=true;if(result)void result.then(v=>{if(active)setStatus('ok' in v?'ok':'error');},()=>{if(active)setStatus('error');});return()=>{active=false;};},[result]);
 return <main className="recovery-page"><section className="recovery-card"><h1>ელფოსტის დადასტურება</h1>{status==='loading'?<p role="status">მოწმდება…</p>:status==='ok'?<p role="status">ელფოსტა დადასტურდა. შედით ანგარიშით და აირჩიეთ თქვენი სივრცე.</p>:<p role="alert">ბმულის დადასტურება ვერ მოხერხდა. დაუკავშირდით აკადემიას. შესაძლოა ბმული უკვე გამოყენებულია ან ვადა გაუვიდა.</p>}<p><Link to="/account/login">ანგარიშში შესვლა</Link> · <Link to="/teacher">მასწავლებლის შესვლა</Link></p></section></main>;
}
