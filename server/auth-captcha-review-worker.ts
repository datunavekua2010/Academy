/** Worker entry point for the app assets and CAPTCHA precheck.
 * Supabase must enforce CAPTCHA independently for direct Auth API requests. */
type Env = { ASSETS: { fetch(request: Request): Promise<Response> }; TURNSTILE_REVIEW_ENABLED?: string; TURNSTILE_WORKER_SECRET?: string; TURNSTILE_ALLOWED_ORIGIN?: string };
const reply = (status: number) => new Response(status === 204 ? null : 'Unavailable', { status, headers: { 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff' } });
// Only Cloudflare's documented error codes are returned or logged. Never expose
// the token, secret, hostname, IP, exception or arbitrary upstream response data.
const siteverifyErrors = new Set(['missing-input-secret', 'invalid-input-secret', 'missing-input-response', 'invalid-input-response', 'bad-request', 'timeout-or-duplicate', 'internal-error']);
type Verification = { ok: true } | { ok: false; codes: string[] };
const failed = (...codes: string[]): Verification => {
  console.warn('turnstile_precheck_failed', codes);
  return { ok: false, codes };
};
const forbidden = (codes: string[]) => new Response(JSON.stringify({ error: 'verification_failed', 'error-codes': codes }), {
  status: 403, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
});
async function verifyDetailed(token: string, secret: string, hostname: string, fetcher: typeof fetch): Promise<Verification> {
  if (!token || token.length > 2048 || !secret || !hostname) return failed('invalid_precheck_input');
  try {
    const response = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({secret,response:token}), signal:AbortSignal.timeout(5000),
    });
    if (!response.ok) return failed('siteverify_http_error');
    const data = await response.json() as {success?:unknown;hostname?:unknown;action?:unknown;'error-codes'?:unknown};
    if (data.success !== true) {
      const raw = Array.isArray(data['error-codes']) ? data['error-codes'] : [];
      const codes = raw.filter((value: unknown): value is string => typeof value === 'string' && siteverifyErrors.has(value)).slice(0, 7);
      return failed(...(codes.length ? codes : ['siteverify_rejected']));
    }
    if (data.hostname !== hostname) return failed('hostname_mismatch');
    if (data.action !== 'academy_auth') return failed('action_mismatch');
    return { ok: true };
  } catch { return failed('siteverify_unavailable'); }
}
export async function verifyWorkerTurnstile(token: string, secret: string, hostname: string, fetcher: typeof fetch = fetch): Promise<boolean> {
  return (await verifyDetailed(token, secret, hostname, fetcher)).ok;
}
export async function handleAuthCaptcha(request: Request, env: Env, fetcher: typeof fetch = fetch): Promise<Response> {
  const url = new URL(request.url);
  if (url.pathname !== '/api/auth/turnstile-verify') return env.ASSETS.fetch(request);
  if (env.TURNSTILE_REVIEW_ENABLED !== 'true') return reply(503);
  if (request.method !== 'POST' || !env.TURNSTILE_ALLOWED_ORIGIN || request.headers.get('origin') !== env.TURNSTILE_ALLOWED_ORIGIN || url.origin !== env.TURNSTILE_ALLOWED_ORIGIN) return forbidden(['origin_or_method_not_allowed']);
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
  const result = await verifyDetailed((body as {token:string}).token, env.TURNSTILE_WORKER_SECRET, allowed.hostname, fetcher);
  return result.ok === true ? reply(204) : forbidden(result.codes);
}
export default { fetch(request: Request, env: Env) {
  const path = new URL(request.url).pathname;
  if (path === '/api/auth/google-proof/start' || path === '/api/auth/google-proof/callback') {
    // Retired: do not fall through to the SPA or start a Google proof flow.
    return new Response('Unavailable', { status: 410, headers: { 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff' } });
  }
  return handleAuthCaptcha(request, env);
} };
