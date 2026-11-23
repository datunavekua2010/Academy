import { describe, expect, it } from 'vitest';
import { runAdminLinkProbe } from '../scripts/stage1-admin-link-probe.mjs';

const actors = [
  ['admin-stage1@example.com', '28619a4f-a49b-4e77-921f-0859d0d90ced', 'admin'],
  ['parent-c@example.com', '7f30b94b-2e76-4158-acfa-69f55d024949', 'parent', '9db864a5-1d53-4ac4-9562-e7c935bcd45b'],
  ['parent-d@example.com', 'f8b9601f-a760-4864-9755-3306ba80bc36', 'parent', '6043be3c-6238-447d-9697-7c4663a59dbb'],
];
const reply = (data, status = 200) => new Response(JSON.stringify(data), { status });
const prompt = async label => label.includes('key') ? 'sb_publishable_synthetic' : 'synthetic-password';
function simulation({ stillVisible = false, crossAffected = false, acceptMismatch = false, brokenRetry = false } = {}) {
  let linked = true;
  const requests = new Map();
  const calls = [];
  const fetcher = async (url, init) => {
    const u = new URL(url);
    expect(u.origin).toBe('https://wxxgwayrieasrzngpuul.supabase.co');
    if (u.pathname === '/auth/v1/token') {
      const actor = actors.findIndex(a => a[0] === JSON.parse(init.body).email);
      return reply({ access_token: `synthetic-token-${actor}` });
    }
    const actor = actors[Number(init.headers.Authorization.split('-').pop())];
    if (u.pathname === '/auth/v1/user') return reply({ id: actor[1], email_confirmed_at: '2026-01-01' });
    if (u.pathname === '/rest/v1/user_roles') return reply([{ role: actor[2] }]);
    if (u.pathname === '/rest/v1/rpc/parent_review_children') return reply((actor === actors[1] ? linked || stillVisible : !crossAffected || linked) ? [{ student_id: actor[3] }] : []);
    if (u.pathname === '/rest/v1/rpc/parent_review_recent_attempts') return actor === actors[1] && !linked ? reply({ code: 'P0001', message: 'Not authorized' }, 400) : reply([{ attempt_id: 'synthetic' }]);
    if (u.pathname === '/rest/v1/rpc/admin_parent_link_change') {
      const body = JSON.parse(init.body);
      calls.push(body);
      expect(actor).toBe(actors[0]);
      expect(body.p_parent).toBe(actors[1][1]);
      expect(body.p_student).toBe(actors[1][3]);
      const prior = requests.get(body.p_request);
      if (prior) {
        if (prior.p_action !== body.p_action) return acceptMismatch ? reply(true) : reply({ code: 'P0001', message: 'Request unavailable' }, 400);
        return reply(!brokenRetry);
      }
      requests.set(body.p_request, body);
      linked = body.p_action === 'establish';
      return reply(true);
    }
    if (u.pathname === '/rest/v1/rpc/admin_parent_link_resolve') {
      const prior = requests.get(JSON.parse(init.body).p_request);
      return reply([{ state: 'committed', parent_id: prior.p_parent, student_id: prior.p_student, action: prior.p_action, changed: true }]);
    }
    return reply({}, 404);
  };
  return { fetcher, calls, isLinked: () => linked };
}

describe('staging admin synthetic link workflow probe', () => {
  it('retries and resolves the revocation, checks denial, and restores the original link', async () => {
    const sim = simulation();
    expect(await runAdminLinkProbe(prompt, sim.fetcher)).toContain('passed');
    expect(sim.calls.map(x => x.p_action)).toEqual(['revoke', 'revoke', 'establish', 'establish', 'establish']);
    expect(sim.calls[0].p_request).toBe(sim.calls[1].p_request);
    expect(sim.calls[0].p_request).toBe(sim.calls[2].p_request);
    expect(sim.calls[3].p_request).toBe(sim.calls[4].p_request);
    expect(sim.calls[3].p_request).not.toBe(sim.calls[0].p_request);
    expect(sim.isLinked()).toBe(true);
  });
  it.each([{ stillVisible: true }, { crossAffected: true }, { acceptMismatch: true }, { brokenRetry: true }])('stops for unsafe or failed control: %j', async scenario => {
    await expect(runAdminLinkProbe(prompt, simulation(scenario).fetcher)).rejects.toThrow();
  });
  it('rejects privileged keys before any request', async () => {
    await expect(runAdminLinkProbe(async () => 'sb_secret_test', () => { throw Error('unexpected network'); })).rejects.toThrow('configuration');
  });
  it('reports only the safe phase and HTTP status for a sign-in failure', async () => {
    await expect(runAdminLinkProbe(prompt, async () => reply({ message: 'do-not-log-response' }, 401)))
      .rejects.toThrow('sign-in for admin-stage1@example.com (HTTP 401)');
  });
  it('does not expose arbitrary network errors', async () => {
    await expect(runAdminLinkProbe(prompt, async () => { throw Error('sensitive-network-details'); }))
      .rejects.toThrow('Staging probe stopped during sign-in for admin-stage1@example.com.');
  });
});
