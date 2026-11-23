import { describe, expect, it } from 'vitest';
import { runParentBoundaryProbe } from '../scripts/stage1-parent-boundary-probe.mjs';

const families = [
  ['parent-c@example.com', '7f30b94b-2e76-4158-acfa-69f55d024949', '9db864a5-1d53-4ac4-9562-e7c935bcd45b', 'stage1-synthetic-attempt-c'],
  ['parent-d@example.com', 'f8b9601f-a760-4864-9755-3306ba80bc36', '6043be3c-6238-447d-9697-7c4663a59dbb', 'stage1-synthetic-attempt-d'],
];
const response = (body, status = 200) => new Response(JSON.stringify(body), { status });
const prompt = async label => label.includes('key') ? 'sb_publishable_synthetic' : 'synthetic-password';
function fakeFetch({ leakSummary = false, leakRaw = false, mutationAccepted = false, generic400 = false } = {}) {
  return async (url, init) => {
    const u = new URL(url);
    expect(u.origin).toBe('https://wxxgwayrieasrzngpuul.supabase.co');
    if (u.pathname === '/auth/v1/token') {
      const idx = families.findIndex(family => family[0] === JSON.parse(init.body).email);
      return response({ access_token: `synthetic-token-${idx}` });
    }
    const idx = Number(init.headers.Authorization?.split('-').pop());
    const family = families[idx];
    if (u.pathname === '/auth/v1/user') return response({ id: family[1], email_confirmed_at: '2026-01-01' });
    if (u.pathname === '/rest/v1/user_roles') return response([{ role: 'parent' }]);
    if (u.pathname === '/rest/v1/rpc/parent_review_recent_attempts') return response([{ attempt_id: family[3], score: 42, ...(leakSummary ? { result: { answers: ['secret'] } } : {}) }]);
    if (u.pathname === '/rest/v1/exercise_attempts') return response(leakRaw ? [{ result: {} }] : []);
    if (u.pathname === '/rest/v1/rpc/admin_parent_link_change') {
      const body = JSON.parse(init.body);
      expect(body.p_parent).toBe(family[1]);
      expect(body.p_student).toBe(family[2]);
      expect(body.p_action).toBe('revoke');
      if (mutationAccepted) return response(true);
      if (generic400) return response({ code: 'PGRST000' }, 400);
      return response({ code: 'P0001', message: 'Not authorized or invalid request' }, 400);
    }
    return response({}, 404);
  };
}
describe('targeted staging parent boundary probe', () => {
  it('accepts minimal summaries, no raw result and specific mutation denials', async () => {
    expect(await runParentBoundaryProbe(prompt, fakeFetch())).toContain('passed');
  });
  it.each([{ leakSummary: true }, { leakRaw: true }, { mutationAccepted: true }, { generic400: true }])('fails for an unsafe or ambiguous response: %j', async scenario => {
    await expect(runParentBoundaryProbe(prompt, fakeFetch(scenario))).rejects.toThrow();
  });
  it('refuses secret keys', async () => {
    await expect(runParentBoundaryProbe(async () => 'sb_secret_test', () => { throw Error('unexpected request'); })).rejects.toThrow('Invalid key');
  });
});
