/** LOCAL REVIEW ONLY. Unrouted until deployment configuration is reviewed. */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { startGoogleProof, finishGoogleProof, type GoogleProofStore } from './google-proof-flow';

export type ProofEnv = {
  GOOGLE_PROOF_REVIEW_ENABLED?: string;
  GOOGLE_PROOF_ALLOWED_ORIGIN?: string;
  GOOGLE_PROOF_CLIENT_ID?: string;
  GOOGLE_PROOF_CLIENT_SECRET?: string;
  GOOGLE_PROOF_SUPABASE_URL?: string;
  GOOGLE_PROOF_SUPABASE_SERVICE_KEY?: string;
};
const START = '/api/auth/google-proof/start';
const CALLBACK = '/api/auth/google-proof/callback';
const COOKIE = '__Host-axiom-google-proof';
const uuid = (value: unknown): value is string => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
const secureHeaders = { 'Cache-Control':'no-store', 'Referrer-Policy':'no-referrer', 'X-Content-Type-Options':'nosniff' };
const failure = (status: number) => new Response('Unavailable',{status,headers:secureHeaders});
const clearCookie = `${COOKIE}=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Lax`;
function origin(value: string | undefined): string | null {
  try { const url = new URL(value!); return url.protocol === 'https:' && url.origin === value && !url.username && !url.password ? url.origin : null; } catch { return null; }
}
function supabaseEndpoint(value: string | undefined): string | null {
  try { const url = new URL(value!); return url.protocol === 'https:' && /^[a-z0-9]+\.supabase\.co$/.test(url.hostname) && url.origin === value && !url.username && !url.password ? url.origin : null; } catch { return null; }
}
function cookieValue(request: Request): string | null {
  const all = (request.headers.get('cookie') ?? '').split(';').map(v => v.trim()).filter(v => v.startsWith(`${COOKIE}=`));
  if (all.length !== 1) return null;
  const value = all[0].slice(COOKIE.length+1);
  return /^[A-Za-z0-9_-]{43}$/.test(value) ? value : null;
}

/** The Auth server verifies the JWT first; decoded claims are never trusted alone. */
export async function verifySupabaseSession(client: SupabaseClient, token: string) {
  if (token.length > 16384 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) throw new Error('Unavailable');
  const verified = await client.auth.getUser(token);
  if (verified.error || !verified.data.user?.id || !verified.data.user.email_confirmed_at) throw new Error('Unavailable');
  let claims: {sub?:unknown; session_id?:unknown; amr?:unknown};
  try {
    const p=token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');
    claims=JSON.parse(atob(p + '='.repeat((4-p.length%4)%4)));
  } catch { throw new Error('Unavailable'); }
  if (!claims || claims.sub !== verified.data.user.id || !uuid(claims.sub) || !uuid(claims.session_id) || !Array.isArray(claims.amr)) throw new Error('Unavailable');
  const methods = claims.amr.map((entry: unknown) => entry && typeof entry === 'object' && typeof (entry as {method?:unknown}).method === 'string' ? (entry as {method:string}).method : '');
  return {userId:claims.sub,sessionId:claims.session_id,methods};
}

/** All RPCs are service-only. No browser-provided user or subject reaches them. */
export function supabaseProofStore(client: SupabaseClient): GoogleProofStore {
  return {
    async begin(input) {
      const {error}=await client.rpc('review_google_proof_begin',{p_user:input.userId,p_session:input.sessionId,p_state_hash:input.stateHash,p_cookie_hash:input.cookieHash,p_nonce:input.nonce,p_verifier:input.codeVerifier});
      if (error) throw new Error('Unavailable');
    },
    async read(stateHash,cookieHash) {
      const {data,error}=await client.rpc('review_google_proof_read',{p_state_hash:stateHash,p_cookie_hash:cookieHash});
      if (error || !Array.isArray(data) || data.length > 1) throw new Error('Unavailable');
      if (!data.length) return null;
      if (typeof data[0]?.nonce !== 'string' || typeof data[0]?.code_verifier !== 'string') throw new Error('Unavailable');
      return {nonce:data[0].nonce,codeVerifier:data[0].code_verifier};
    },
    async finish(input) {
      const {error}=await client.rpc('review_google_proof_finish',{p_state_hash:input.stateHash,p_cookie_hash:input.cookieHash,p_nonce:input.nonce,p_subject:input.subject});
      if (error) throw new Error('Unavailable');
    },
  };
}

/** Explicit dependencies permit local tests without real credentials or network. */
export async function handleGoogleProof(request: Request, env: ProofEnv, deps?: {client: SupabaseClient; fetcher?: typeof fetch}): Promise<Response> {
  const url=new URL(request.url);
  if (url.pathname !== START && url.pathname !== CALLBACK) return failure(404);
  if (env.GOOGLE_PROOF_REVIEW_ENABLED !== 'true') return failure(503);
  const allowed=origin(env.GOOGLE_PROOF_ALLOWED_ORIGIN), endpoint=supabaseEndpoint(env.GOOGLE_PROOF_SUPABASE_URL);
  if (!allowed || !endpoint || url.origin!==allowed || !env.GOOGLE_PROOF_CLIENT_ID || !env.GOOGLE_PROOF_CLIENT_SECRET || !env.GOOGLE_PROOF_SUPABASE_SERVICE_KEY) return failure(503);
  const config={clientId:env.GOOGLE_PROOF_CLIENT_ID,clientSecret:env.GOOGLE_PROOF_CLIENT_SECRET,redirectUri:allowed+CALLBACK};
  const client=deps?.client ?? createClient(endpoint,env.GOOGLE_PROOF_SUPABASE_SERVICE_KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
  const store=supabaseProofStore(client);
  if (url.pathname === START) {
    if (request.method !== 'POST' || request.headers.get('origin')!==allowed || (request.headers.has('sec-fetch-site') && request.headers.get('sec-fetch-site')!=='same-origin')) return failure(403);
    const authorization=request.headers.get('authorization');
    if (!authorization?.startsWith('Bearer ')) return failure(401);
    try {
      const session=await verifySupabaseSession(client,authorization.slice(7));
      const result=await startGoogleProof(session,config,store);
      return new Response(JSON.stringify({authorizationUrl:result.authorizationUrl}),{status:200,headers:{...secureHeaders,'Content-Type':'application/json','Set-Cookie':`${COOKIE}=${result.cookie}; Path=/; Max-Age=300; Secure; HttpOnly; SameSite=Lax`}});
    } catch { return failure(403); }
  }
  if (request.method !== 'GET') return failure(405);
  const states=url.searchParams.getAll('state'),codes=url.searchParams.getAll('code'),cookie=cookieValue(request);
  const redirect=(result: 'ok' | 'error') => new Response(null,{status:303,headers:{...secureHeaders,'Location':`${allowed}/?google_proof=${result}#/account/google`,'Set-Cookie':clearCookie}});
  if (url.searchParams.has('error') || states.length!==1 || codes.length!==1 || !cookie) return redirect('error');
  try { await finishGoogleProof({state:states[0],cookie,code:codes[0]},config,store,deps?.fetcher ?? fetch); return redirect('ok'); }
  catch { return redirect('error'); }
}
