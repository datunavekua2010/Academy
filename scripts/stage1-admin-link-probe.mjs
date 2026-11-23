// Staging-only synthetic link mutation test. This performs real writes and
// creates audit/request rows. It must never be pointed at production.
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { secretPrompt } from './stage1-private-session-probe.mjs';

const origin = 'https://wxxgwayrieasrzngpuul.supabase.co';
const admin = { email: 'admin-stage1@example.com', id: '7493bb2d-e0ec-4d28-a8c5-ba672fd5d14a', role: 'admin' };
const parentC = { email: 'parent-c@example.com', id: '7f30b94b-2e76-4158-acfa-69f55d024949', role: 'parent', student: '9db864a5-1d53-4ac4-9562-e7c935bcd45b' };
const parentD = { email: 'parent-d@example.com', id: 'f8b9601f-a760-4864-9755-3306ba80bc36', role: 'parent', student: '6043be3c-6238-447d-9697-7c4663a59dbb' };

export async function runAdminLinkProbe(prompt, fetcher = fetch) {
  const key = (await prompt('Staging publishable key')).trim();
  if (!key.startsWith('sb_publishable_')) throw Error('Invalid staging key');
  const request = async (path, token, method = 'GET', body) => {
    const response = await fetcher(origin + path, {
      method, headers: { apikey: key, ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(12000),
    });
    let data = null;
    try { data = await response.json(); } catch { /* never print response bodies */ }
    return { status: response.status, ok: response.ok, data };
  };
  const checked = async (...args) => {
    const result = await request(...args);
    if (!result.ok) throw Error('Required request failed');
    return result.data;
  };
  const signIn = async actor => {
    const password = await prompt(`Password for ${actor.email}`);
    const session = await checked('/auth/v1/token?grant_type=password', null, 'POST', { email: actor.email, password });
    const token = session?.access_token;
    if (typeof token !== 'string' || token.length <= 10) throw Error('Invalid session');
    const user = await checked('/auth/v1/user', token);
    const roles = await checked('/rest/v1/user_roles?select=role&user_id=eq.' + actor.id, token);
    if (user?.id !== actor.id || !user.email_confirmed_at || !Array.isArray(roles) || roles.length !== 1 || roles[0]?.role !== actor.role) throw Error('Unexpected test identity or role');
    return token;
  };
  const adminToken = await signIn(admin);
  const tokenC = await signIn(parentC);
  const tokenD = await signIn(parentD);
  const children = token => checked('/rest/v1/rpc/parent_review_children', token, 'POST', {});
  const hasChild = (rows, student) => Array.isArray(rows) && rows.some(row => row?.student_id === student);
  const summary = (token, student) => request('/rest/v1/rpc/parent_review_recent_attempts', token, 'POST', { p_student: student });
  if (!hasChild(await children(tokenC), parentC.student) || !hasChild(await children(tokenD), parentD.student)) throw Error('Initial links missing');
  if (!(await summary(tokenC, parentC.student)).ok || !(await summary(tokenD, parentD.student)).ok) throw Error('Initial summaries unavailable');

  const change = payload => checked('/rest/v1/rpc/admin_parent_link_change', adminToken, 'POST', payload);
  const revoke = { p_request: randomUUID(), p_parent: parentC.id, p_student: parentC.student, p_action: 'revoke', p_reference: 'STAGE1-SYNTHETIC' };
  if (await change(revoke) !== true || await change(revoke) !== true) throw Error('Revoke or exact retry failed');
  const resolved = await checked('/rest/v1/rpc/admin_parent_link_resolve', adminToken, 'POST', { p_request: revoke.p_request });
  if (!Array.isArray(resolved) || resolved.length !== 1 || resolved[0]?.state !== 'committed' || resolved[0]?.action !== 'revoke' || resolved[0]?.parent_id !== parentC.id || resolved[0]?.student_id !== parentC.student || resolved[0]?.changed !== true) throw Error('Revoke resolution failed');
  const mismatch = await request('/rest/v1/rpc/admin_parent_link_change', adminToken, 'POST', { ...revoke, p_action: 'establish' });
  if (mismatch.status !== 400 || mismatch.data?.code !== 'P0001' || mismatch.data?.message !== 'Request unavailable') throw Error('Request mismatch was not rejected');
  const after = await children(tokenC);
  const denied = await summary(tokenC, parentC.student);
  if (!Array.isArray(after) || hasChild(after, parentC.student) || denied.status !== 400 || denied.data?.code !== 'P0001' || denied.data?.message !== 'Not authorized') throw Error('Revoked access was not denied');
  if (!hasChild(await children(tokenD), parentD.student) || !(await summary(tokenD, parentD.student)).ok) throw Error('Other synthetic family was affected');

  const establish = { ...revoke, p_request: randomUUID(), p_action: 'establish' };
  if (await change(establish) !== true || await change(establish) !== true) throw Error('Establish or exact retry failed');
  if (!hasChild(await children(tokenC), parentC.student) || !(await summary(tokenC, parentC.student)).ok) throw Error('Relink access not restored');
  if (!hasChild(await children(tokenD), parentD.student) || !(await summary(tokenD, parentD.student)).ok) throw Error('Other synthetic family was affected');
  return 'Staging admin link revocation, retry, isolation and relink checks passed';
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!process.stdin.isTTY || !process.stderr.isTTY) {
    console.error('Run this interactive staging probe in a private terminal.');
    process.exitCode = 1;
  } else {
    runAdminLinkProbe(secretPrompt).then(message => console.log(message)).catch(() => {
      console.error('Staging admin link probe failed or could not run. The synthetic C link may be revoked; stop and report this result without retrying.');
      console.error('No credentials or response bodies were logged.');
      process.exitCode = 1;
    });
  }
}
