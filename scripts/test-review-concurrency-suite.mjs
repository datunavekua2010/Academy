// Optional synthetic local PostgreSQL races, separate connections, never Supabase.
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
if (!existsSync('.scratch/postgres/node_modules/embedded-postgres/dist/index.js')) {
  console.error('Install the isolated test dependency first: npm install --prefix .scratch/postgres embedded-postgres@18.7.0-beta.19');
  process.exitCode = 1;
} else {
  for (const script of ['test-teacher-link-concurrency.mjs','test-teacher-write-lock-concurrency.mjs','test-role-lifecycle-concurrency.mjs','test-parent-link-concurrency.mjs','test-profile-provision-concurrency.mjs','test-profile-reconcile-concurrency.mjs','test-parent-request-concurrency.mjs','test-evidence-pilot-concurrency.mjs','test-homework-concurrency.mjs']) {
    console.log(`\n--- ${script} ---`);
    const result = spawnSync(process.execPath, [`scripts/${script}`], { stdio: 'inherit', env: { ...process.env, ROLE_LIFECYCLE_REVIEW: '1' } });
    if (result.error || result.status !== 0) {
      if (result.error) console.error(result.error.message);
      process.exitCode = result.status || 1;
      break;
    }
  }
}
