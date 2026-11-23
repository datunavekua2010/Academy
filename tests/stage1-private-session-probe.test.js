import { describe, expect, it } from 'vitest';
import { runPrivateSessionProbe } from '../scripts/stage1-private-session-probe.mjs';

const ids = ['3102b6df-b786-4074-81dc-074caf5e84a8', '8bea62cc-fcf0-469e-8935-1ddae111bb00', 'b54bf634-d0c3-4bae-afc6-5f800942a90c', '50d86684-17aa-41db-bdc7-cb5346dc06ec'];
const emails = ['parent-a@example.com', 'parent-b@example.com', 'student-a@example.com', 'student-b@example.com'];
const tokens = emails.map((_, i) => `synthetic-token-${i}`);
const response = (body, status = 200) => new Response(JSON.stringify(body), { status });

function mockFetch({ signInFails = false } = {}) {
  return async (url, init) => {
    const u = new URL(url);
    expect(u.origin).toBe('https://wxxgwayrieasrzngpuul.supabase.co');
    if (u.pathname === '/auth/v1/token') {
      if (signInFails) return response({ error: 'sensitive error body' }, 401);
      const { email, password } = JSON.parse(init.body);
      expect(password).toBe('synthetic-password');
      return response({ access_token: tokens[emails.indexOf(email)] });
    }
    const index = tokens.indexOf(init.headers.Authorization?.replace('Bearer ', ''));
    if (index < 0) return response({}, 401);
    if (u.pathname === '/auth/v1/user') return response({ id: ids[index], email_confirmed_at: '2026-01-01' });
    if (u.pathname === '/rest/v1/user_roles') return response([{ role: index < 2 ? 'parent' : 'student' }]);
    if (u.pathname === '/rest/v1/rpc/parent_review_children') return response([{ student_id: ids[index + 2] }]);
    if (u.pathname === '/rest/v1/rpc/parent_review_recent_attempts') {
      const child = JSON.parse(init.body).p_student;
      return child === ids[index + 2] ? response([{ attempt_id: `attempt-${index}` }]) : response({}, 400);
    }
    if (u.pathname === '/rest/v1/exercise_attempts') {
      const child = u.searchParams.get('student_id')?.slice(3);
      return response(index >= 2 && ids[index] === child ? [{ attempt_id: `attempt-${index - 2}` }] : []);
    }
    return response({}, 404);
  };
}

describe('private staging session wrapper', () => {
  it('signs in each synthetic identity and runs the real-session probe with ephemeral tokens', async () => {
    const prompts = [];
    const result = await runPrivateSessionProbe(async label => {
      prompts.push(label);
      return prompts.length === 1 ? 'sb_publishable_synthetic' : 'synthetic-password';
    }, mockFetch());
    expect(result).toContain('passed');
    expect(prompts).toHaveLength(5);
    for (const email of emails) expect(prompts.some(label => label.includes(email))).toBe(true);
  });
  it('stops without processing an error response or asking for further passwords', async () => {
    let prompts = 0;
    await expect(runPrivateSessionProbe(async () => ++prompts === 1 ? 'sb_publishable_synthetic' : 'synthetic-password', mockFetch({ signInFails: true }))).rejects.toThrow('Staging sign-in failed');
    expect(prompts).toBe(2);
  });
  it('rejects a privileged key before network requests', async () => {
    await expect(runPrivateSessionProbe(async () => 'sb_secret_never-use', () => { throw new Error('Unexpected network request'); })).rejects.toThrow('Invalid staging publishable key');
  });
});
