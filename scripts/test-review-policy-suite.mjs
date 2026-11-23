// Synthetic local SQL tests only. These scripts create ephemeral PGlite databases.
import { spawnSync } from 'node:child_process';
const scripts = [
  ['test-supabase-policy.mjs', false],
  ['test-review-privileges.mjs', false],
  ['test-classroom-policy.mjs', false],
  ['test-classroom-capacity-policy.mjs', false],
  ['test-teacher-link-policy.mjs', false],
  ['test-teacher-write-lock-policy.mjs', false],
  ['test-classroom-abuse-policy.mjs', false],
  ['test-teacher-link-revocation-policy.mjs', false],
  ['test-role-lifecycle-policy.mjs', false],
  ['test-parent-link-policy.mjs', false],
  ['test-role-restore-policy.mjs', false],
  ['test-profile-provision-policy.mjs', false],
  ['test-parent-dashboard-policy.mjs', false],
  ['test-evidence-pilot-policy.mjs', false],
  ['test-profile-reconcile-policy.mjs', false],
  ['test-parent-request-policy.mjs', false],
  ['test-homework-policy.mjs', true],
  ['test-homework-quota.mjs', true],
  ['test-lesson-notes-policy.mjs', true],
  ['test-classroom-codes-policy.mjs', true],
  ['test-teacher-test-policy.mjs', true],
];
for (const [script, fullChain] of scripts) {
  console.log(`\n--- ${script}${fullChain ? ' (full review chain)' : ''} ---`);
  const result = spawnSync(process.execPath, [`scripts/${script}`], {
    stdio: 'inherit', env: { ...process.env, ROLE_LIFECYCLE_REVIEW: fullChain ? '1' : '0' },
  });
  if (result.error || result.status !== 0) {
    if (result.error) console.error(result.error.message);
    process.exitCode = result.status || 1;
    break;
  }
}
