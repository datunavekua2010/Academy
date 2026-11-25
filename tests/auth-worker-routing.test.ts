import { expect, it, vi } from 'vitest';
import worker, { handleAuthCaptcha } from '../server/auth-captcha-review-worker';

const origin = 'https://axiacad.uk';
const route = `${origin}/api/auth/turnstile-verify`;
const request = () => new Request(route, {
  method: 'POST', headers: { origin, 'content-type': 'application/json' },
  body: JSON.stringify({ token: 'synthetic-token' }),
});

it('delegates ordinary application and asset requests to the assets binding', async () => {
  const fetchAsset = vi.fn(async () => new Response('synthetic asset'));
  const env = { ASSETS: { fetch: fetchAsset } };
  for (const path of ['/', '/assets/app.js', '/student/practice']) {
    const req = new Request(`${origin}${path}`);
    const response = await worker.fetch(req, env);
    expect(await response.text()).toBe('synthetic asset');
    expect(fetchAsset).toHaveBeenLastCalledWith(req);
  }
});

it('retires Google proof routes instead of serving SPA content', async () => {
  const fetchAsset = vi.fn(async () => new Response('synthetic asset'));
  for (const path of ['/api/auth/google-proof/start','/api/auth/google-proof/callback']) {
    const response = await worker.fetch(new Request(`${origin}${path}`), { ASSETS: { fetch: fetchAsset } });
    expect(response.status).toBe(410);
    expect(await response.text()).toBe('Unavailable');
  }
  expect(fetchAsset).not.toHaveBeenCalled();
});

it('fails closed without the Worker secret instead of returning SPA content', async () => {
  const fetchAsset = vi.fn(async () => new Response('synthetic asset'));
  const siteverify = vi.fn();
  const response = await handleAuthCaptcha(request(), {
    ASSETS: { fetch: fetchAsset }, TURNSTILE_REVIEW_ENABLED: 'true', TURNSTILE_ALLOWED_ORIGIN: origin,
  }, siteverify as unknown as typeof fetch);
  expect(response.status).toBe(503);
  expect(await response.text()).toBe('Unavailable');
  expect(fetchAsset).not.toHaveBeenCalled();
  expect(siteverify).not.toHaveBeenCalled();
});

it('sends a synthetic runtime secret only to Siteverify and never to assets or the browser', async () => {
  const secret = 'synthetic-runtime-secret';
  const fetchAsset = vi.fn(async () => new Response('synthetic asset'));
  const siteverify = vi.fn(async () => new Response(JSON.stringify({ success: true, hostname: 'axiacad.uk', action: 'academy_auth' }), { status: 200 }));
  const response = await handleAuthCaptcha(request(), {
    ASSETS: { fetch: fetchAsset }, TURNSTILE_REVIEW_ENABLED: 'true', TURNSTILE_ALLOWED_ORIGIN: origin, TURNSTILE_WORKER_SECRET: secret,
  }, siteverify as unknown as typeof fetch);
  expect(response.status).toBe(204);
  expect(await response.text()).toBe('');
  expect(fetchAsset).not.toHaveBeenCalled();
  expect(siteverify).toHaveBeenCalledTimes(1);
  expect(siteverify.mock.calls[0][0]).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify');
  const init = siteverify.mock.calls[0][1] as RequestInit;
  expect(JSON.parse(init.body as string)).toEqual({ secret, response: 'synthetic-token' });
  expect([...response.headers.values()].join(' ')).not.toContain(secret);
});

it('forwards documented Siteverify errors as safe JSON and logs only those codes', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    const env = { ASSETS: { fetch: vi.fn() }, TURNSTILE_REVIEW_ENABLED: 'true', TURNSTILE_ALLOWED_ORIGIN: origin, TURNSTILE_WORKER_SECRET: 'synthetic-secret' };
    const siteverify = vi.fn(async () => new Response(JSON.stringify({ success: false, 'error-codes': ['invalid-input-secret', 'timeout-or-duplicate', 'synthetic-secret'] })));
    const response = await handleAuthCaptcha(request(), env, siteverify as unknown as typeof fetch);
    expect(response.status).toBe(403);
    expect(response.headers.get('content-type')).toBe('application/json');
    expect(await response.json()).toEqual({ error: 'verification_failed', 'error-codes': ['invalid-input-secret', 'timeout-or-duplicate'] });
    expect(warn).toHaveBeenCalledWith('turnstile_precheck_failed', ['invalid-input-secret', 'timeout-or-duplicate']);
    expect(JSON.stringify(warn.mock.calls)).not.toContain('synthetic-secret');
    const wrongOrigin = new Request(route, { method: 'POST', headers: { origin: 'https://evil.example', 'content-type': 'application/json' }, body: '{"token":"test"}' });
    const rejected = await handleAuthCaptcha(wrongOrigin, env, siteverify as unknown as typeof fetch);
    expect(rejected.status).toBe(403);
    expect(await rejected.json()).toEqual({ error: 'verification_failed', 'error-codes': ['origin_or_method_not_allowed'] });
  } finally { warn.mockRestore(); }
});

it('retires proof requests regardless of edge metadata',async()=>{
  const env={ASSETS:{fetch:vi.fn()},GOOGLE_PROOF_REVIEW_ENABLED:'true'};
  for(const headers of [{},{'cf-worker':'another.example'},{'cf-ew-via':'15'}]){
    const req=new Request(`${origin}/api/auth/google-proof/start`,{method:'POST',headers});
    if(Object.keys(headers).length)Object.defineProperty(req,'cf',{value:{country:'XX'}});
    expect((await worker.fetch(req,env)).status).toBe(410);
  }
  expect(env.ASSETS.fetch).not.toHaveBeenCalled();
});
