// Operator-run, staging-only wrapper. Passwords and short-lived session tokens
// stay in this process; nothing is written to disk or emitted to the console.
import { createInterface } from 'node:readline';
import { Writable } from 'node:stream';
import { pathToFileURL } from 'node:url';
import { runStage1Probe } from './stage1-postgrest-probe.mjs';

const ORIGIN = 'https://wxxgwayrieasrzngpuul.supabase.co';
const users = [
  ['parent-a@example.com', 'parentA'],
  ['parent-b@example.com', 'parentB'],
  ['student-a@example.com', 'studentA'],
  ['student-b@example.com', 'studentB'],
];

export async function runPrivateSessionProbe(prompt, fetcher = fetch) {
  const key = (await prompt('Staging publishable key')).trim();
  if (!key.startsWith('sb_publishable_')) throw new Error('Invalid staging publishable key');
  const config = { key, childA: 'b54bf634-d0c3-4bae-afc6-5f800942a90c', childB: '50d86684-17aa-41db-bdc7-cb5346dc06ec' };
  for (const [email, field] of users) {
    const password = await prompt(`Password for ${email}`);
    if (!password) throw new Error('Missing password');
    const response = await fetcher(`${ORIGIN}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { apikey: key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw new Error('Staging sign-in failed');
    const session = await response.json();
    if (typeof session?.access_token !== 'string' || session.access_token.length <= 10) throw new Error('Invalid session');
    config[field] = session.access_token;
  }
  return runStage1Probe(config, fetcher);
}

async function secretPrompt(label) {
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
    runPrivateSessionProbe(secretPrompt).then(message => console.log(message)).catch(() => {
      console.error('Staging sign-in or isolation probe failed or could not run. No credentials or responses were logged.');
      process.exitCode = 1;
    });
  }
}
