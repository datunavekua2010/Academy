/**
 * LOCAL REVIEW ONLY. Not an HTTP handler or an authorization boundary.
 * The caller MUST authenticate the Supabase JWT, verify the session exists and
 * belongs to that JWT's subject, validate origin/CSRF, and provide server-owned
 * configuration. Storage methods must be server-only and finish atomically.
 */
import { verifyGoogleIdentityToken } from './google-identity-proof';

const GOOGLE_AUTH = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN = 'https://oauth2.googleapis.com/token';
const unavailable = () => new Error('Google proof unavailable');
type VerifiedSession = { userId: string; sessionId: string; methods: string[] };
type FlowConfig = { clientId: string; clientSecret: string; redirectUri: string };
type Challenge = { nonce: string; codeVerifier: string };
export type GoogleProofStore = {
  begin(input: { userId: string; sessionId: string; stateHash: string; cookieHash: string; nonce: string; codeVerifier: string }): Promise<void>;
  read(stateHash: string, cookieHash: string): Promise<Challenge | null>;
  finish(input: { stateHash: string; cookieHash: string; nonce: string; subject: string }): Promise<void>;
};
function configIsValid(config: FlowConfig) {
  try {
    const url = new URL(config.redirectUri);
    return url.protocol === 'https:' && !url.username && !url.password && !url.search && !url.hash &&
      typeof config.clientId === 'string' && config.clientId.length > 0 && config.clientId.length <= 512 && !/\s/.test(config.clientId) &&
      typeof config.clientSecret === 'string' && config.clientSecret.length > 0 && config.clientSecret.length <= 512;
  } catch { return false; }
}
function bytesBase64Url(bytes: Uint8Array) {
  return btoa(Array.from(bytes, value => String.fromCharCode(value)).join('')).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
}
function randomToken() { return bytesBase64Url(crypto.getRandomValues(new Uint8Array(32))); }
async function digest(input: string) { return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))); }
async function hexDigest(input: string) { return [...await digest(input)].map(x => x.toString(16).padStart(2,'0')).join(''); }
const isToken = (x: unknown): x is string => typeof x === 'string' && /^[A-Za-z0-9_-]{43}$/.test(x);
const isUuid = (x: unknown): x is string => typeof x === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(x);

/** `session` MUST come from trusted server-side Supabase JWT verification. */
export async function startGoogleProof(session: VerifiedSession, config: FlowConfig, store: GoogleProofStore) {
  if (!configIsValid(config) || !isUuid(session?.userId) || !isUuid(session?.sessionId) || !Array.isArray(session?.methods) || session.methods.filter(m => m !== 'totp').length !== 1 || !session.methods.includes('oauth')) throw unavailable();
  const state = randomToken(), cookie = randomToken(), nonce = randomToken(), codeVerifier = randomToken();
  const [stateHash, cookieHash, pkceChallenge] = await Promise.all([hexDigest(state),hexDigest(cookie),digest(codeVerifier)]);
  await store.begin({userId:session.userId,sessionId:session.sessionId,stateHash,cookieHash,nonce,codeVerifier});
  const url = new URL(GOOGLE_AUTH);
  for (const [key,value] of Object.entries({client_id:config.clientId,redirect_uri:config.redirectUri,response_type:'code',scope:'openid',state,nonce,code_challenge:bytesBase64Url(pkceChallenge),code_challenge_method:'S256'})) url.searchParams.set(key,value);
  // HTTP layer must set cookie as Secure; HttpOnly; SameSite=Lax; Path=/,
  // use an __Host- name, and never expose its value to browser JavaScript.
  return { authorizationUrl:url.toString(), cookie };
}

async function tokenResponse(response: Response): Promise<string> {
  if (!response.ok || response.redirected || !response.body) throw unavailable();
  const reader = response.body.getReader(); const chunks: Uint8Array[] = []; let size = 0;
  try {
    for (;;) { const part = await reader.read(); if (part.done) break; size += part.value.byteLength; if (size > 65536) { await reader.cancel(); throw unavailable(); } chunks.push(part.value); }
    const all = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { all.set(chunk,offset); offset += chunk.byteLength; }
    const value: unknown = JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(all));
    const idToken = (value as {id_token?:unknown} | null)?.id_token;
    if (typeof idToken !== 'string' || !idToken || idToken.length > 16384) throw unavailable();
    return idToken;
  } catch { throw unavailable(); }
}

/** HTTP layer must check one state/code/cookie only and clear the cookie. */
export async function finishGoogleProof(input: { state: string; cookie: string; code: string }, config: FlowConfig, store: GoogleProofStore, fetcher: typeof fetch = fetch) {
  if (!configIsValid(config) || !isToken(input?.state) || !isToken(input?.cookie) || typeof input?.code !== 'string' || !input.code || input.code.length > 4096 || /[\x00-\x20\x7f]/.test(input.code)) throw unavailable();
  try {
    const [stateHash,cookieHash] = await Promise.all([hexDigest(input.state),hexDigest(input.cookie)]);
    const challenge = await store.read(stateHash,cookieHash);
    if (!challenge || !isToken(challenge.nonce) || !isToken(challenge.codeVerifier)) throw unavailable();
    const body = new URLSearchParams({code:input.code,client_id:config.clientId,client_secret:config.clientSecret,redirect_uri:config.redirectUri,grant_type:'authorization_code',code_verifier:challenge.codeVerifier});
    const response = await fetcher(GOOGLE_TOKEN,{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body,redirect:'error',signal:AbortSignal.timeout(5000)});
    const token = await tokenResponse(response);
    const subject = await verifyGoogleIdentityToken(token,{clientId:config.clientId,nonce:challenge.nonce,fetcher});
    // The privileged transaction matches subject to the session user's current
    // Google identity, checks session liveness, consumes state, and binds proof.
    await store.finish({stateHash,cookieHash,nonce:challenge.nonce,subject});
  } catch { throw unavailable(); }
}
