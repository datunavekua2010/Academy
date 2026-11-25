import {createClient,type SupabaseClient,type Session} from '@supabase/supabase-js';
import {ACCOUNT_MODE,TEST_ACCOUNT_MODE} from '../student/accountMode';
import {authCallbackUrl} from './trustedAuthCallback';

/** Signup uses isolated PKCE storage. Role provisioning is performed by the
 * database trigger; signup never creates parent-child links. */
export function makeSignupClient(url:string,key:string):SupabaseClient {
 const canonical=`axiom-signup-${encodeURIComponent(url)}`;
 const bytes=new Uint8Array(16);window.crypto.getRandomValues(bytes);
 const instance=`${canonical}-${Array.from(bytes,n=>n.toString(16).padStart(2,'0')).join('')}`;
 const memory=new Map<string,string>();
 const verifier=(name:string)=>name.startsWith(instance)&&name.endsWith('-code-verifier');
 const mapped=(name:string)=>`${canonical}${name.slice(instance.length)}`;
 const storage={getItem:(name:string)=>verifier(name)?window.localStorage.getItem(mapped(name)):memory.get(name)??null,
  setItem:(name:string,value:string)=>{if(verifier(name))window.localStorage.setItem(mapped(name),value);else memory.set(name,value);},
  removeItem:(name:string)=>{if(verifier(name))window.localStorage.removeItem(mapped(name));else memory.delete(name);}};
 return createClient(url,key,{auth:{storage,storageKey:instance,persistSession:true,autoRefreshToken:false,detectSessionInUrl:false,flowType:'pkce'}});
}
export const signupClient:SupabaseClient|null=(()=>{
 if(TEST_ACCOUNT_MODE||ACCOUNT_MODE==='invalid')return null;
 const url=import.meta.env.VITE_SUPABASE_URL?.trim(),key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
 if(!url||!key?.startsWith('sb_publishable_'))return null;
 try{const u=new URL(url);if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||!window.crypto?.subtle||!window.crypto.getRandomValues)return null;window.localStorage.getItem('axiom-signup-check');return makeSignupClient(url,key);}catch{return null;}
})();
export type SignupRole = 'student' | 'parent';
export async function requestSignup(client:SupabaseClient,email:string,password:string,origin:string,pathname:string,captchaToken?:string,role:SignupRole='student',acceptImmediateSession=false):Promise<Session|null>{
 const callback=authCallbackUrl(origin,pathname,'signup');
 if(password.length<10||password.length>128||!email.trim()||email.trim().length>254||(role!=='student'&&role!=='parent'))throw new Error('invalid_signup');
 const result=await client.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:callback,data:{role},...(captchaToken?{captchaToken}:{})}});
 if(result.error){
  const allowed=new Set(['weak_password','email_address_invalid','over_email_send_rate_limit','over_request_rate_limit','captcha_failed','signup_disabled']);
  throw new Error(result.error.code && allowed.has(result.error.code) ? result.error.code : 'signup_unavailable');
 }
 if(result.data.session&&!acceptImmediateSession){await client.auth.signOut({scope:'local'}).catch(()=>{});throw new Error('signup_unavailable');}
 return result.data.session;
}
export { consumeSignupCallback } from './authCallbacks';
export async function exchangeSignup(client:SupabaseClient|null,callback:{code:string|null}):Promise<void>{
 if(!client||!callback.code)throw new Error('Signup unavailable');
 try{
  const result=await client.auth.exchangeCodeForSession(callback.code);
  if(result.error||!result.data.session||!result.data.user?.id)throw new Error('Signup unavailable');
  const verified=await client.auth.getUser();
  if(verified.error||verified.data.user?.id!==result.data.user.id||!verified.data.user.email_confirmed_at)throw new Error('Signup unavailable');
  const out=await client.auth.signOut({scope:'local'});if(out.error)throw new Error('Signup unavailable');
 }catch{await client.auth.signOut({scope:'local'}).catch(()=>{});throw new Error('Signup unavailable');}
}
