import {createClient,type SupabaseClient} from '@supabase/supabase-js';
import {TEST_ACCOUNT_MODE} from '../student/accountMode';

/** REVIEW ONLY: Auth signup does not create an Academy role or parent link.
 * Verification data remains on the device; the resulting Auth session is
 * memory-only and separate from the ordinary app session. */
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
 if(TEST_ACCOUNT_MODE||import.meta.env.VITE_ACCOUNT_SIGNUP_REVIEW!=='true')return null;
 const url=import.meta.env.VITE_SUPABASE_URL?.trim(),key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
 if(!url||!key?.startsWith('sb_publishable_'))return null;
 try{const u=new URL(url);if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||!window.crypto?.subtle||!window.crypto.getRandomValues)return null;window.localStorage.getItem('axiom-signup-check');return makeSignupClient(url,key);}catch{return null;}
})();
export async function requestSignup(client:SupabaseClient,email:string,password:string,origin:string,pathname:string):Promise<void>{
 const callback=new URL(pathname,origin);
 if(callback.origin!==origin||(callback.protocol!=='https:'&&callback.hostname!=='localhost'&&callback.hostname!=='127.0.0.1'))throw new Error('Signup unavailable');
 if(password.length<10||password.length>128||!email.trim()||email.trim().length>254)throw new Error('Signup unavailable');
 callback.search='?signup=1';callback.hash='';
 const result=await client.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:callback.toString()}});
 // Confirmation must be enabled in Auth. An unexpected immediate session is
 // never adopted by the main app; the account may nevertheless already exist.
 if(result.data.session){await client.auth.signOut({scope:'local'}).catch(()=>{});throw new Error('Signup unavailable');}
 if(result.error)throw new Error('Signup unavailable');
}
export function consumeSignupCallback(href:string,history:Pick<History,'replaceState'>):{code:string|null}|null{
 const u=new URL(href);if(u.searchParams.get('signup')!=='1')return null;
 const codes=u.searchParams.getAll('code');const code=codes.length===1&&codes[0].length>0&&codes[0].length<=2048?codes[0]:null;
 history.replaceState(null,'',`${u.pathname}#/account/confirmed`);return {code};
}
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
