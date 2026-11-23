// Focused staging-only follow-up using two ordinary parent sessions.
// The two denied mutation attempts target only their own synthetic links.
// If the authorization boundary fails, one test link could be revoked; stop.
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { secretPrompt } from './stage1-private-session-probe.mjs';

const origin = 'https://wxxgwayrieasrzngpuul.supabase.co';
const families = [
  { email: 'parent-c@example.com', parent: '7f30b94b-2e76-4158-acfa-69f55d024949', student: '9db864a5-1d53-4ac4-9562-e7c935bcd45b', attempt: 'stage1-synthetic-attempt-c' },
  { email: 'parent-d@example.com', parent: 'f8b9601f-a760-4864-9755-3306ba80bc36', student: '6043be3c-6238-447d-9697-7c4663a59dbb', attempt: 'stage1-synthetic-attempt-d' },
];
const allowedFields = ['attempt_id', 'created_at', 'grade', 'topic_id', 'subunit_id', 'score'];

export async function runParentBoundaryProbe(prompt, fetcher = fetch) {
  const key = (await prompt('Staging publishable key')).trim();
  if (!key.startsWith('sb_publishable_')) throw new Error('Invalid key');
  const request = async (path, token, method = 'GET', body) => {
    const response = await fetcher(origin + path, {
      method,
      headers: { apikey: key, ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(12000),
    });
    let data = null;
    try { data = await response.json(); } catch { /* no bodies are logged */ }
    return { ok: response.ok, status: response.status, data };
  };
  const checked = async (...args) => {
    const result = await request(...args);
    if (!result.ok) throw new Error('Expected request failed');
    return result.data;
  };
  for (const family of families) {
    const password = await prompt(`Password for ${family.email}`);
    const session = await checked('/auth/v1/token?grant_type=password', null, 'POST', { email: family.email, password });
    if (typeof session?.access_token !== 'string' || session.access_token.length <= 10) throw new Error('Invalid session');
    const token = session.access_token;
    const user = await checked('/auth/v1/user', token);
    if (user?.id !== family.parent || !user?.email_confirmed_at) throw new Error('Unexpected parent identity');
    const roles = await checked('/rest/v1/user_roles?select=role&user_id=eq.' + family.parent, token);
    if (!Array.isArray(roles) || roles.length !== 1 || roles[0]?.role !== 'parent') throw new Error('Unexpected roles');
    const summary = await checked('/rest/v1/rpc/parent_review_recent_attempts', token, 'POST', { p_student: family.student });
    if (!Array.isArray(summary) || !summary.some(row => row?.attempt_id === family.attempt) || summary.some(row => !row || Object.keys(row).some(field => !allowedFields.includes(field)))) throw new Error('Summary shape or positive control failed');
    const raw = await checked('/rest/v1/exercise_attempts?select=result&student_id=eq.' + family.student, token);
    if (!Array.isArray(raw) || raw.length !== 0) throw new Error('Parent raw result exposed');
    const denial = await request('/rest/v1/rpc/admin_parent_link_change', token, 'POST', {
      p_request: randomUUID(), p_parent: family.parent, p_student: family.student, p_action: 'revoke', p_reference: 'STAGE1-SYNTHETIC',
    });
    // A generic 400 could be a malformed request, not an authorization denial.
    if (!(denial.status === 400 && denial.data?.code === 'P0001' && denial.data?.message === 'Not authorized or invalid request')) throw new Error('Expected admin mutation denial not established; synthetic link may have changed');
  }
  return 'Staging parent summary shape and non-admin link-denial checks passed';
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!process.stdin.isTTY || !process.stderr.isTTY) {
    console.error('Run this interactive probe in a private terminal.');
    process.exitCode = 1;
  } else {
    runParentBoundaryProbe(secretPrompt).then(message => console.log(message)).catch(() => {
      console.error('Staging boundary probe failed or could not run. A synthetic link may have changed; stop and report the failure.');
      console.error('No credentials or response bodies were logged.');
      process.exitCode = 1;
    });
  }
}
