// One-time modification for the owner's prior staging-only copy-paste probe.
// Run inside the directory containing its index.html and test.js.
const fs = require('node:fs');
const htmlPath = 'index.html';
const jsPath = 'test.js';
const html = fs.readFileSync(htmlPath, 'utf8');
const js = fs.readFileSync(jsPath, 'utf8');
const marker = 'STAGING_PASSWORD_HELPER';
const scriptTag = '<script type="module" src="/test.js"></script>';
if (html.includes(marker) || js.includes(marker)) {
  console.log('Password helper already present; no files changed.');
  process.exit(0);
}
if (!html.includes(scriptTag) || !js.includes("'https://wxxgwayrieasrzngpuul.supabase.co'") || !js.includes('let client;')) {
  console.error('This is not the expected staging probe folder. No files changed.');
  process.exit(1);
}
const form = `<!-- STAGING_PASSWORD_HELPER -->
<form id="test-password-form">
  <h2>Set a Supabase password for the staging test user</h2>
  <p>Sign in with the approved Google test account first. This does not change the Google password.</p>
  <label>New test password <input id="test-password" type="password" autocomplete="new-password" minlength="12" required></label>
  <label>Repeat test password <input id="test-password-confirm" type="password" autocomplete="new-password" minlength="12" required></label>
  <button id="test-password-submit" type="submit">Set staging test password</button>
  <p id="test-password-status" role="status"></p>
</form>
`;
const code = `
// STAGING_PASSWORD_HELPER: target a single confirmed test UUID only.
$('test-password-form').addEventListener('submit', async event => {
  event.preventDefault();
  const first = $('test-password');
  const repeat = $('test-password-confirm');
  const button = $('test-password-submit');
  const status = $('test-password-status');
  const password = first.value;
  if (password.length < 12 || password !== repeat.value) {
    first.value = ''; repeat.value = '';
    status.textContent = 'Passwords must match and contain at least 12 characters.';
    return;
  }
  button.disabled = true;
  try {
    if (!client) throw Error('No staging session');
    const current = await client.auth.getUser();
    if (current.error || current.data.user?.id !== '7c6d13ec-d8d7-4286-9859-d7030dd913d9') throw Error('Wrong test user');
    const updated = await client.auth.updateUser({password});
    if (updated.error || updated.data.user?.id !== '7c6d13ec-d8d7-4286-9859-d7030dd913d9') throw Error('Update failed');
    status.textContent = 'Staging test password set. You can sign out of the test.';
  } catch {
    status.textContent = 'Password was not confirmed. Check that you signed in with the approved test user. Do not share errors or credentials.';
  } finally {
    first.value = ''; repeat.value = '';
    button.disabled = false;
  }
});
`;
fs.writeFileSync(htmlPath, html.replace(scriptTag, form + scriptTag));
fs.writeFileSync(jsPath, js + code);
console.log('Staging test password helper added.');
