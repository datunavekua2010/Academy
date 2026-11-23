# Staging two-family real-session test

This test is pinned to isolated Supabase project `wxxgwayrieasrzngpuul`; never run it with production credentials. Do not use real family data. It does not alter production or migration history.

**Update:** The original A/B fixtures were removed transactionally at the owner's request, with remaining profile foreign-key references checked before deleting their profiles. The owner removed those Auth users and created confirmed C/D replacements. Their synthetic-only test passwords were displayed in chat at the owner's request and must be treated as public; never use these accounts for real data, and remove them and their fixtures after testing. The owner reported that the staging real-session parent and student read probe passed; see the scope and limits below.

## Fixtures and status

The four confirmed replacement Auth users (`parent-c@example.com`, `parent-d@example.com`, `student-c@example.com`, `student-d@example.com`) were verified before a transactional staging-only fixture insertion. The transaction refused to proceed unless the expected UUID/email pairs were active and selected application tables were empty. It created four profiles, two parent and two student roles, two student grades, C→C and D→D parent links and one synthetic attempt per student, reusing the synthetic topic/unit/subunit. The attempt trigger required a transaction-local synthetic student JWT subject. The roles and links were inserted by the privileged staging operator, not through the admin provisioning/link workflow; they are test fixtures, not evidence that that workflow was used or authorized for real families. No triggers or policies were disabled. A subsequent query confirmed 4 profiles, 2 parent roles, 2 student roles, 2 grades, 2 links and 2 synthetic attempts.

The fixtures intentionally persist for further staging tests and should be removed afterward with carefully scoped deletes, respecting foreign-key dependencies and lifecycle records; do not delete real or unrelated data or reset staging. Auth identities were created by the owner. The owner reported the runner's exact success message `Staging real-session parent and student read checks passed`. This is owner-reported evidence from actual staging sessions, not an independently observed execution. It covers the checks described below only: the probe selects attempt IDs when checking direct-table isolation and does not inspect every summary field or other exposure path. It does not exercise admin provisioning/link changes, link or role revocation, writes, sign-out, refresh, CAPTCHA or production. The underlying links were inserted by privileged SQL, not through the workflow.

A prior private reset helper stopped with a generic error; its failure stage is unknown. It was scoped to the now-deleted A/B users and has been removed. No reset or bypass is required for the replacements.

## Focused remaining parent-boundary check

`scripts/stage1-parent-boundary-probe.mjs` is a separate staging-only follow-up, not a rerun of the read probe. It signs in only the two parent-only users, verifies their identities/roles, checks each synthetic summary contains only the allowed fields and its positive-control attempt, requests the direct raw `result` column, and submits a valid admin-only revoke request for each parent's own synthetic link. It expects the explicit authorization error, not just any HTTP 400. If authorization is broken, a synthetic link could actually be revoked; on any failure stop and inspect staging before continuing. The script does not log response bodies, tokens or passwords. The existing fixtures are intentionally available for this test; no production requests or real data are involved. Mock tests do not establish actual remote authorization. A pass would still not test an authorized administrator, provisioning, successful revocation, concurrency, other data endpoints or production.

## Operator instructions

Use an operator-controlled private terminal on a network that can reach staging. Update this existing working branch to the latest PR commit. In the staging Supabase dashboard's **Project Settings → API Keys**, locate a publishable key beginning `sb_publishable_` for project `wxxgwayrieasrzngpuul` (not a secret/service-role key). Run:

```sh
node scripts/stage1-private-session-probe.mjs
```

The script interactively asks for that key and then the four synthetic accounts' passwords; input is hidden. Type or paste them only into the local terminal prompts, never into chat or shell commands. Do not run in a recorded/shared terminal or with session recording enabled. It signs in directly to staging, holds short-lived access tokens only in process memory and invokes the read-only probe. It prints no API response bodies, credentials, tokens or IDs; on a sign-in failure it may print the synthetic account email and HTTP status. No token files or environment variables are created. It requires Node.js with built-in `fetch` (Node 18 or newer) and an interactive TTY. If staging CAPTCHA or another sign-in restriction has since been enabled, this password-only wrapper will not bypass it and may fail; do not disable controls to make it pass.

Report only the final pass/fail message, without credentials, debug traces or response bodies. A pass checks linked child listings and summaries, cross-family summary denials, raw attempt isolation with positive student controls, anonymous/invalid-token denials and an invalid UUID. It does not establish provisioning/link mutation, logout, refresh/revocation, CAPTCHA, concurrent behavior or production security. A generic failure can be a connectivity, credential, configuration or authorization issue; it is not a security pass. Investigate privately without exposing request bodies, URLs containing credentials, headers or responses.

Local wrapper tests use fake HTTP responses (9 probe/wrapper tests passed), and a pseudo-terminal smoke check verified the publishable-key prompt did not echo test input. Neither validates a real staging login. The execution sandbox previously could not reach staging Auth; connector database access does not supply real user sessions.
