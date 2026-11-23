// Private operator tool for the four synthetic staging identities ONLY.
// A staging secret key and new passwords are read from the terminal, never
// arguments, environment variables, files, response logs, or chat.
import { pathToFileURL } from 'node:url';
import { secretPrompt } from './stage1-private-session-probe.mjs';

const origin = 'https://wxxgwayrieasrzngpuul.supabase.co';
const users = [
  ['parent-a@example.com', '3102b6df-b786-4074-81dc-074caf5e84a8'],
  ['parent-b@example.com', '8bea62cc-fcf0-469e-8935-1ddae111bb00'],
  ['student-a@example.com', 'b54bf634-d0c3-4bae-afc6-5f800942a90c'],
  ['student-b@example.com', '50d86684-17aa-41db-bdc7-cb5346dc06ec'],
];

export async function resetTestPasswords(prompt, fetcher = fetch, report = () => {}) {
  const key = (await prompt('Staging secret API key')).trim();
  if (!key.startsWith('sb_secret_')) throw new Error('A staging secret key is required');
  const headers = { apikey: key, 'Content-Type': 'application/json' };
  // Check every identity before making any change. Never accept IDs from input.
  for (const [email, id] of users) {
    const response = await fetcher(`${origin}/auth/v1/admin/users/${id}`, { headers, signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error('Could not verify staging identities');
    const user = await response.json();
    if (user?.id !== id || user?.email?.toLowerCase() !== email) throw new Error('Staging identity mismatch');
  }
  for (const [email, id] of users) {
    const password = await prompt(`New password for ${email}`);
    const confirmation = await prompt(`Repeat new password for ${email}`);
    if (password.length < 12 || password !== confirmation) throw new Error('Password confirmation failed');
    const response = await fetcher(`${origin}/auth/v1/admin/users/${id}`, {
      method: 'PUT', headers, body: JSON.stringify({ password }), signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw new Error('Password update failed');
    report(`Password updated for ${email}.`);
  }
  return 'All four staging test passwords updated.';
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!process.stdin.isTTY || !process.stderr.isTTY) {
    console.error('Run this tool in a private interactive terminal.');
    process.exitCode = 1;
  } else {
    resetTestPasswords(secretPrompt, fetch, message => console.log(message))
      .then(message => console.log(message))
      .catch(() => {
        console.error('Staging reset stopped. Earlier reported updates remain in effect. No credentials or responses were logged.');
        process.exitCode = 1;
      });
  }
}
