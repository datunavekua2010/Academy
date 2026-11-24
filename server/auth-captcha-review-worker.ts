/** Worker entry point for the app assets and CAPTCHA precheck.
 * Supabase must enforce CAPTCHA independently for direct Auth API requests. */
import { handleGoogleProof, type ProofEnv } from './google-proof-http-review';
type Env = ProofEnv & { ASSETS: { fetch(request: Request): Promise<Response> }; TURNSTILE_REVIEW_ENABLED?: string; TURNSTILE_WORKER_SECRET?: string; TURNSTILE_ALLOWED_ORIGIN?: string };
const reply = (status: number) => new Response(status === 204 ? null : 'Unavailable', { status, headers: { 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff' } });
export async function verifyWorkerTurnstile(token: string, secret: string, hostname: string, fetcher: typeof fetch = fetch): Promise<boolean> {
  if (!token || token.length > 2048 || !secret || !hostname) return false;
  try {
    const response = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({secret,response:token}), signal:AbortSignal.timeout(5000),
    });
    if (!response.ok) return false;
    const data = await response.json() as {success?:unknown;hostname?:unknown;action?:unknown};
    return data.success === true && data.hostname === hostname && data.action === 'academy_auth';
  } catch { return false; }
}
export async function handleAuthCaptcha(request: Request, env: Env, fetcher: typeof fetch = fetch): Promise<Response> {
  const url = new URL(request.url);
  if (url.pathname !== '/api/auth/turnstile-verify') return env.ASSETS.fetch(request);
  if (env.TURNSTILE_REVIEW_ENABLED !== 'true') return reply(503);
  if (request.method !== 'POST' || !env.TURNSTILE_ALLOWED_ORIGIN || request.headers.get('origin') !== env.TURNSTILE_ALLOWED_ORIGIN || url.origin !== env.TURNSTILE_ALLOWED_ORIGIN) return reply(403);
  let allowed: URL;
  try { allowed = new URL(env.TURNSTILE_ALLOWED_ORIGIN); } catch { return reply(503); }
  if (allowed.protocol !== 'https:' || allowed.origin !== env.TURNSTILE_ALLOWED_ORIGIN || !env.TURNSTILE_WORKER_SECRET) return reply(503);
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') return reply(400);
  // Bound the stream rather than trusting Content-Length.
  const reader = request.body?.getReader(); if (!reader) return reply(400);
  const chunks: Uint8Array[] = []; let size = 0;
  try { for (;;) { const {done,value} = await reader.read(); if (done) break; size += value.length; if (size > 4096) { await reader.cancel(); return reply(413); } chunks.push(value); } } catch { return reply(400); }
  const bytes = new Uint8Array(size); let offset = 0; for (const c of chunks) { bytes.set(c, offset); offset += c.length; }
  let body: unknown; try { body = JSON.parse(new TextDecoder().decode(bytes)); } catch { return reply(400); }
  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).length !== 1 || typeof (body as {token?:unknown}).token !== 'string') return reply(400);
  return await verifyWorkerTurnstile((body as {token:string}).token, env.TURNSTILE_WORKER_SECRET, allowed.hostname, fetcher) ? reply(204) : reply(403);
}
export default { fetch(request: Request, env: Env) {
  const path = new URL(request.url).pathname;
  if (path === '/api/auth/google-proof/start' || path === '/api/auth/google-proof/callback') return handleGoogleProof(request, env);
  return handleAuthCaptcha(request, env);
} };
