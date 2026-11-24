// Creates and deletes only an ephemeral local PostgreSQL database. Never connects
// to Supabase. Install embedded-postgres in ignored .scratch/postgres first.
import EmbeddedPostgres from '../.scratch/postgres/node_modules/embedded-postgres/dist/index.js';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createServer } from 'node:net';

const port = await new Promise((resolve, reject) => {
  const server = createServer();
  server.once('error', reject);
  server.listen(0, '127.0.0.1', () => {
    const value = server.address().port;
    server.close(error => error ? reject(error) : resolve(value));
  });
});
const dir = await mkdtemp('.scratch/postgres/schema-');
const pg = new EmbeddedPostgres({ databaseDir: dir, port, user: 'localtest', password: 'temporary-local-test', persistent: false, postgresFlags: ['-h', '127.0.0.1'], onLog: () => {}, onError: () => {} });
let started = false;
let client;
try {
  await pg.initialise();
  await pg.start();
  started = true;
  client = pg.getPgClient('postgres', '127.0.0.1');
  await client.connect();
  await client.query(`create role anon; create role authenticated; create role service_role;
    create schema auth;
    create table auth.users(id uuid primary key, email_confirmed_at timestamptz, banned_until timestamptz, deleted_at timestamptz, is_anonymous boolean default false);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema auth to authenticated,anon; grant execute on function auth.uid() to authenticated,anon;`);
  const files = (await readdir('supabase/migrations')).filter(name => name.endsWith('.sql')).sort();
  for (const name of files) {
    const sql = await readFile(`supabase/migrations/${name}`, 'utf8');
    // The same normalization is used in the staging progress notes. It removes
    // whitespace even inside literals: matching hashes are not semantic proof.
    const normalized = sql.replace(/^[ \t]*--[^\n]*/gm, '').replace(/\s+/g, '');
    // Retain internal whitespace as a stronger second check. As with any
    // line-based normalization, multiline literals are not semantically parsed.
    const linewise = sql.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('--')).join('\n');
    console.log(`${name} whitespace=${createHash('sha256').update(normalized).digest('hex')} linewise=${createHash('sha256').update(linewise).digest('hex')}`);
    await client.query(sql);
  }
  const query = await readFile('supabase/review/staging-schema-fingerprint.sql', 'utf8');
  console.table((await client.query(query)).rows);
} finally {
  if (client) await client.end();
  if (started) await pg.stop();
  await rm(dir, { recursive: true, force: true });
}
