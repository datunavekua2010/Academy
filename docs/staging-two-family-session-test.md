# Staging two-family real-session test

This test is pinned to isolated Supabase project `wxxgwayrieasrzngpuul`; never run it with production credentials. Do not use real family data. It does not alter production or migration history.

**Update:** At the owner's request, the original A/B users' synthetic attempts, links, grades, roles, role lifecycle epochs and profiles were removed transactionally from staging to allow the owner to delete those Auth users. All remaining single-column profile foreign-key references were checked before deleting the profiles. The four Auth users still existed immediately after cleanup; the owner will delete them. The synthetic curriculum remains for reuse. The instructions and fixed IDs below describe the original fixtures and are not runnable until revised for the replacement users. No real-session isolation test has passed.

## Fixtures and status

The four pre-existing confirmed synthetic Auth users (`parent-a@example.com`, `parent-b@example.com`, `student-a@example.com`, `student-b@example.com`) were verified before a single transactional staging-only fixture insertion. The transaction refused to proceed unless the four expected UUID/email pairs were active and the selected application tables were empty. It created four profiles, two parent and two student roles, two student grades, A→A and B→B parent links, one synthetic topic/unit/subunit and one synthetic attempt per student. The attempt trigger required a transaction-local synthetic student JWT subject. The roles and links were inserted by the privileged staging operator, not through the admin provisioning/link workflow; they are test fixtures, not evidence that that workflow was used or authorized for real families. No triggers or policies were disabled. A subsequent query confirmed 4 profiles, 2 parent roles, 2 student roles, 2 grades, 2 links and 2 synthetic attempts.

The fixtures intentionally persist for the read-only real-session test and should be removed after testing with carefully scoped deletes, respecting foreign-key dependencies and lifecycle records; do not delete real or unrelated data or reset staging. Auth identities were created by the owner. No real-session result has yet been obtained. Prior SQL role simulation and mock HTTP tests are not substitutes.

## Forgotten synthetic passwords

If the owner cannot recover the passwords for the four synthetic users, `scripts/stage1-reset-test-passwords.mjs` is an optional private-terminal tool pinned to this staging project and those four UUIDs. It prompts for a **staging secret API key** and new passwords without echo, verifies all four UUID/email pairs before changing any password, and uses the Supabase Auth admin API. It does not write credentials to files or logs. A secret key is highly privileged: use it only in a trusted private terminal, never in chat, browser code, shell arguments or production. The script prints each account whose password update succeeded; on a failure, earlier updates remain in effect and need not be assumed rolled back. It does not test revocation of existing sessions. Some Supabase environments may reject new secret keys on Auth admin mutations; do not disable security controls if this happens. Local tests mock the API; no actual reset was run by the assistant.

## Operator instructions

Use an operator-controlled private terminal on a network that can reach staging. Update this existing working branch to the latest PR commit. In the staging Supabase dashboard's **Project Settings → API Keys**, locate a publishable key beginning `sb_publishable_` for project `wxxgwayrieasrzngpuul` (not a secret/service-role key). Run:

```sh
node scripts/stage1-private-session-probe.mjs
```

The script interactively asks for that key and then the four synthetic accounts' passwords; input is hidden. Type or paste them only into the local terminal prompts, never into chat or shell commands. Do not run in a recorded/shared terminal or with session recording enabled. It signs in directly to staging, holds short-lived access tokens only in process memory and invokes the read-only probe. It prints no API response bodies, credentials, tokens or IDs; no token files or environment variables are created. It requires Node.js with built-in `fetch` (Node 18 or newer) and an interactive TTY. If staging CAPTCHA or another sign-in restriction has since been enabled, this password-only wrapper will not bypass it and may fail; do not disable controls to make it pass.

Report only the final pass/fail message, without credentials, debug traces or response bodies. A pass checks linked child listings and summaries, cross-family summary denials, raw attempt isolation with positive student controls, anonymous/invalid-token denials and an invalid UUID. It does not establish provisioning/link mutation, logout, refresh/revocation, CAPTCHA, concurrent behavior or production security. A generic failure can be a connectivity, credential, configuration or authorization issue; it is not a security pass. Investigate privately without exposing request bodies, URLs containing credentials, headers or responses.

Local wrapper tests use fake HTTP responses (9 probe/wrapper tests passed), and a pseudo-terminal smoke check verified the publishable-key prompt did not echo test input. Neither validates a real staging login. The execution sandbox previously could not reach staging Auth; connector database access does not supply real user sessions.
