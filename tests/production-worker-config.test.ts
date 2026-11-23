import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

it('routes the verifier before static assets and keeps its secret out of production config', () => {
  const config = readFileSync('wrangler.toml', 'utf8');
  expect(config).toMatch(/^name\s*=\s*"axiomacademy9"\s*$/m);
  expect(config).toMatch(/^main\s*=\s*"server\/auth-captcha-review-worker\.ts"\s*$/m);
  expect(config).toMatch(/^binding\s*=\s*"ASSETS"\s*$/m);
  expect(config).toMatch(/^run_worker_first\s*=\s*\["\/api\/auth\/turnstile-verify"\]\s*$/m);
  expect(config).toMatch(/^TURNSTILE_REVIEW_ENABLED\s*=\s*"true"\s*$/m);
  expect(config).toMatch(/^TURNSTILE_ALLOWED_ORIGIN\s*=\s*"https:\/\/axiacad\.uk"\s*$/m);
  expect(config).not.toMatch(/^TURNSTILE_WORKER_SECRET\s*=/m);
});
