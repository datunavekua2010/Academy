import { describe, expect, it } from 'vitest';
import { resetTestPasswords } from '../scripts/stage1-reset-test-passwords.mjs';

const ids = ['3102b6df-b786-4074-81dc-074caf5e84a8', '8bea62cc-fcf0-469e-8935-1ddae111bb00', 'b54bf634-d0c3-4bae-afc6-5f800942a90c', '50d86684-17aa-41db-bdc7-cb5346dc06ec'];
const emails = ['parent-a@example.com', 'parent-b@example.com', 'student-a@example.com', 'student-b@example.com'];
const response = (body, status = 200) => new Response(JSON.stringify(body), { status });
function fakeFetch({ mismatch = false, failUpdate = false } = {}) {
  return async (url, init) => {
    const u = new URL(url);
    expect(u.origin).toBe('https://wxxgwayrieasrzngpuul.supabase.co');
    expect(init.headers.Authorization).toBeUndefined();
    const i = ids.indexOf(u.pathname.split('/').pop());
    expect(i).toBeGreaterThanOrEqual(0);
    if (!init.method) return response({ id: ids[i], email: mismatch && i === 3 ? 'wrong@example.com' : emails[i] });
    expect(init.method).toBe('PUT');
    expect(JSON.parse(init.body)).toEqual({ password: 'synthetic-password' });
    return failUpdate ? response({}, 403) : response({});
  };
}
const prompt = async label => label.includes('API key') ? 'sb_secret_synthetic' : 'synthetic-password';

describe('staging password reset wrapper', () => {
  it('verifies fixed identities before updating only the four staging users', async () => {
    const reports = [];
    expect(await resetTestPasswords(prompt, fakeFetch(), msg => reports.push(msg))).toContain('updated');
    expect(reports).toHaveLength(4);
  });
  it('refuses to change passwords if any identity is unexpected', async () => {
    let writes = 0;
    const fetcher = fakeFetch({ mismatch: true });
    await expect(resetTestPasswords(prompt, (url, init) => { if (init.method) writes++; return fetcher(url, init); })).rejects.toThrow('mismatch');
    expect(writes).toBe(0);
  });
  it('stops without exposing the response on failure', async () => {
    await expect(resetTestPasswords(prompt, fakeFetch({ failUpdate: true }))).rejects.toThrow('Password update failed');
  });
  it('rejects a publishable key', async () => {
    await expect(resetTestPasswords(async () => 'sb_publishable_synthetic', () => { throw Error('unexpected request'); })).rejects.toThrow('secret key');
  });
});
