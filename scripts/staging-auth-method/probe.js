import { createClient } from '@supabase/supabase-js';

const ref = 'wxxgwayrieasrzngpuul';
const keySlot = 'axiom-staging-probe-publishable';
const pendingSlot = 'axiom-staging-probe-pending';
const input = document.querySelector('#key');
const result = document.querySelector('#result');
const start = document.querySelector('#start');
const refresh = document.querySelector('#refresh');
const out = document.querySelector('#out');
const callback = new URL(window.location.href);
const callbackPath = '/staging-auth-return';
const redirectUrl = `${window.location.origin}${callbackPath}`;
document.querySelector('#redirect').textContent = redirectUrl;
let client;

function setup(key) {
  if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) throw new Error('Invalid publishable key');
  return createClient(`https://${ref}.supabase.co`, key, {
    auth: { flowType: 'pkce', detectSessionInUrl: false, storage: window.sessionStorage, storageKey: 'axiom-staging-method-probe', autoRefreshToken: false },
  });
}
function methods(token) {
  const payload = token.split('.')[1];
  const body = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  const known = new Set(['oauth', 'password', 'totp', 'otp', 'recovery', 'invite', 'sso/saml', 'magiclink', 'email/signup', 'email_change', 'token_refresh', 'anonymous']);
  const entries = Array.isArray(body.amr) ? body.amr : [];
  return [...new Set(entries.map(item => known.has(item?.method) ? item.method : 'other'))].sort();
}
function show(session, label) {
  if (!session?.access_token) throw new Error('No session');
  const list = methods(session.access_token);
  result.textContent = `${label}. Method labels: ${list.length ? list.join(', ') : 'none'}. These labels do not prove which OAuth provider was used.`;
  start.hidden = true; input.disabled = true; refresh.hidden = false; out.hidden = false;
}
start.addEventListener('click', async () => {
  start.disabled = true;
  try {
    const key = input.value.trim(); client = setup(key);
    const {data, error} = await client.auth.getSession();
    if (error || data.session) throw new Error('Session exists');
    sessionStorage.setItem(keySlot, key); sessionStorage.setItem(pendingSlot, '1');
    const response = await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:redirectUrl}});
    if (response.error || !response.data.url) throw new Error('Cannot start');
  } catch {
    sessionStorage.removeItem(pendingSlot); sessionStorage.removeItem(keySlot);
    result.textContent = 'Could not start the staging sign-in. Check the publishable key and staging Google configuration; do not share errors or credentials.';
    start.disabled = false;
  }
});
refresh.addEventListener('click', async () => {
  refresh.disabled = true;
  try { const {data,error} = await client.auth.refreshSession(); if (error) throw error; show(data.session, 'Refresh succeeded'); }
  catch { result.textContent = 'Refresh failed. Do not share token or provider details.'; }
  finally { refresh.disabled = false; }
});
out.addEventListener('click', async () => {
  out.disabled = true;
  try { const {error} = await client.auth.signOut({scope:'local'}); if (error) throw error; sessionStorage.removeItem(keySlot); sessionStorage.removeItem(pendingSlot); input.value = ''; result.textContent = 'Signed out locally. You can close this tab.'; start.hidden = false; input.disabled = false; refresh.hidden = true; out.hidden = true; }
  catch { result.textContent = 'Sign-out failed. Close the private browser session and do not share its contents.'; }
  finally { out.disabled = false; }
});
if (callback.pathname === callbackPath) {
  // Remove OAuth parameters from the address bar before showing status.
  history.replaceState(null, '', '/');
  (async () => {
    try {
      const pending = sessionStorage.getItem(pendingSlot) === '1';
      sessionStorage.removeItem(pendingSlot);
      const key = sessionStorage.getItem(keySlot); const codes = callback.searchParams.getAll('code');
      if (!pending || !key || codes.length !== 1 || callback.searchParams.has('error')) throw new Error('Invalid callback');
      client = setup(key);
      const current = await client.auth.getSession(); if (current.error || current.data.session) throw new Error('Existing session');
      const {data,error} = await client.auth.exchangeCodeForSession(codes[0]); if (error) throw error;
      show(data.session, 'Google sign-in returned a session');
    } catch { sessionStorage.removeItem(keySlot); result.textContent = 'The staging callback could not be verified. Do not share the callback URL or provider error.'; }
  })();
}
