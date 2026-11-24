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

it('keeps Google proof routes disabled without explicit server configuration', async () => {
  const fetchAsset = vi.fn(async () => new Response('synthetic asset'));
  for (const path of ['/api/auth/google-proof/start','/api/auth/google-proof/callback']) {
    const response = await worker.fetch(new Request(`${origin}${path}`), { ASSETS: { fetch: fetchAsset } });
    expect(response.status).toBe(503);
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
