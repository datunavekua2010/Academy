import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

it('targets only the staging Worker and routes proof before static assets without embedded secrets or production settings',()=>{
 const config=readFileSync('wrangler.signup-staging.toml','utf8');
 expect(config).toMatch(/^name\s*=\s*"axiomtest"\s*$/m);
 expect(config).toMatch(/^main\s*=\s*"server\/auth-captcha-review-worker\.ts"\s*$/m);
 expect(config).toMatch(/^binding\s*=\s*"ASSETS"\s*$/m);
 expect(config).toContain('"/api/auth/google-proof/start"');
 expect(config).toContain('"/api/auth/google-proof/callback"');
 expect(config).not.toMatch(/^\s*(?:route|routes|workers_dev|GOOGLE_PROOF_CLIENT_SECRET|GOOGLE_PROOF_SUPABASE_SERVICE_KEY|GOOGLE_PROOF_RATE_KEY)\s*=/m);
 expect(config).not.toContain('axiacad.uk');
 expect(config).not.toContain('iywgnaltjjcgjzuccavj');
 expect(config).not.toMatch(/^GOOGLE_PROOF_REVIEW_ENABLED\s*=\s*"true"/m);
});
