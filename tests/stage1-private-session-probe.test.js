import { describe, expect, it } from 'vitest';
import { runPrivateSessionProbe } from '../scripts/stage1-private-session-probe.mjs';

const ids = ['7f30b94b-2e76-4158-acfa-69f55d024949', 'f8b9601f-a760-4864-9755-3306ba80bc36', '9db864a5-1d53-4ac4-9562-e7c935bcd45b', '6043be3c-6238-447d-9697-7c4663a59dbb'];
const emails = ['parent-c@example.com', 'parent-d@example.com', 'student-c@example.com', 'student-d@example.com'];
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
