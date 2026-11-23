// Operator-run, staging-only wrapper. Passwords and short-lived session tokens
// stay in this process; nothing is written to disk or emitted to the console.
import { createInterface } from 'node:readline';
import { Writable } from 'node:stream';
import { pathToFileURL } from 'node:url';
import { runStage1Probe } from './stage1-postgrest-probe.mjs';

const ORIGIN = 'https://wxxgwayrieasrzngpuul.supabase.co';
class SafeDiagnostic extends Error {}
const users = [
  ['parent-c@example.com', 'parentA'],
  ['parent-d@example.com', 'parentB'],
  ['student-c@example.com', 'studentA'],
  ['student-d@example.com', 'studentB'],
];

export async function runPrivateSessionProbe(prompt, fetcher = fetch) {
  const key = (await prompt('Staging publishable key')).trim();
  if (!key.startsWith('sb_publishable_')) throw new Error('Invalid staging publishable key');
  const config = { key, childA: '9db864a5-1d53-4ac4-9562-e7c935bcd45b', childB: '6043be3c-6238-447d-9697-7c4663a59dbb' };
  for (const [email, field] of users) {
    const password = await prompt(`Password for ${email}`);
    if (!password) throw new Error('Missing password');
    let response;
    try {
      response = await fetcher(`${ORIGIN}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { apikey: key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: AbortSignal.timeout(12000),
      });
    } catch {
      throw new SafeDiagnostic('Could not reach staging Auth (network error or timeout).');
    }
    if (!response.ok) throw new SafeDiagnostic(`Staging sign-in failed for ${email} (HTTP ${response.status}).`);
    const session = await response.json();
    if (typeof session?.access_token !== 'string' || session.access_token.length <= 10) throw new Error('Invalid session');
    config[field] = session.access_token;
  }
  return runStage1Probe(config, fetcher);
}

export async function secretPrompt(label) {
  const muted = new Writable({ write(_chunk, _encoding, done) { done(); } });
  const reader = createInterface({ input: process.stdin, output: muted, terminal: true });
  process.stderr.write(`${label} (input hidden): `);
  try {
    return await new Promise((resolve, reject) => {
      reader.once('SIGINT', () => reject(new Error('Cancelled')));
      reader.once('close', () => reject(new Error('Input closed')));
      reader.question('', resolve);
    });
  } finally {
    reader.close();
    process.stderr.write('\n');
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!process.stdin.isTTY || !process.stderr.isTTY) {
    console.error('Run this interactive probe in a private terminal.');
    process.exitCode = 1;
  } else {
    runPrivateSessionProbe(secretPrompt).then(message => console.log(message)).catch(error => {
      console.error(error instanceof SafeDiagnostic ? error.message : 'Staging probe failed or could not run.');
      console.error('No credentials or response bodies were logged.');
      process.exitCode = 1;
    });
  }
}
