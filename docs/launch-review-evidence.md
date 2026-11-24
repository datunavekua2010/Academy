# Launch-readiness evidence handoff

This is a handoff for an independent reviewer, **not** an independent security or privacy review and not approval to release. No user data, credentials or session tokens belong in this document. Production changes, deployment and merge require separate authorization.

## Staging read-test update

The owner reported that the real-session staging parent/student read probe, the parent summary-shape/raw-result/non-admin link-denial probe, and the authorized admin synthetic link-revocation/retry/relink probe passed. A follow-up staging query corroborated both links intact and one committed request and audit for each link mutation. The temporary staging admin role was removed and its absence verified. These check only the paths described in `staging-two-family-session-test.md`; profile provisioning, other exposure paths and production remain unverified. Some historical statements below predate these results or the production upgrade.

## Current evidence and boundaries

| Stage | Evidence available | Required before calling the stage complete |
| --- | --- | --- |
| 1. Accounts and parents | Local signup/recovery/parent/admin code and mocked UI/Auth tests; full local policy/concurrency suite; staging migration mapping and rollback-only SQL role simulations; two staging advisory-lock contention probes. See `test-project-progress.md`. | Real test-only Auth, email, CAPTCHA and PostgREST with four unrelated synthetic users; actual session refresh, sign-out and revocation; write-denial and representative concurrent transactions; complete reconciliation of staging metadata/catalog discrepancies. Parent-only users are summary-only; subscription entitlement/full-attempt access is not implemented. |
| 2. Opt-in progress recovery | Local review-only IndexedDB outbox/coordinator and tests; not opened by the app. | Explicit consent and shared-device warning, deletion/removal, cross-tab opt-out coordination, account isolation, durability/error handling and safety tests before integration. No persistent outbox is enabled. |
| 3. Server-verified achievements and streaks | Display-only catalog and an unrouted single-choice evidence pilot; local pilot tests. | Trusted issuance and scoring, lesson evidence, award/streak processing, mappings, persistence and real authenticated authorization/concurrency tests. Client results and legacy rewards are not verified evidence. The pilot does not award achievements or streaks. |
| 4. Launch checks and rollback | Proposed upgrade and rollback in `axiacad-production-configuration.md`; prior local build, policy and concurrency results. | Independent security and privacy sign-off, production-specific data/catalog review, tested backup and restore, real-browser/provider checks, monitoring, incident ownership, performance/CSP and explicit release authorization. No release or rollback has been performed. |

## Focused reviewer packet

- Account boundary: `src/account/`, `src/lib/{accountSignup,passwordRecovery,googleAuth,trustedAuthCallback,authCallbacks,supabase}.ts`, `src/student/session.tsx`, `src/parent/` and `src/admin/`. Check identity vs Academy role, account switching, token expiry, callbacks and behavior on failed requests.
- Database boundary: ordered `supabase/migrations/` and `supabase/review/staging-accounts-policy-smoke.sql`; compare actual staging/production ACLs and RLS, security-definer ownership/search paths, parent-only versus independent multi-role rights, direct API paths, relation/role revocation, and retained/relinked data. The current production baseline still allows linked parents to read attempt JSON; do not enable parent access until addressed by a separately approved upgrade.
- Abuse/provider boundary: `src/account/TurnstileReview.tsx`, `server/auth-captcha-review-worker.ts`, `wrangler.auth-review.toml.example`, `public/_headers` and `axiacad-production-configuration.md`. Worker precheck is bypassable; independent Supabase CAPTCHA enforcement and test evidence are necessary. Service, provider and Worker secrets stay server-side.
- Privacy/operations: establish lawful basis and guardian authority independently; decide child-data notices, retention/deletion and audit-ledger handling, shared-device risks, admin MFA/support procedures, incident response and the limits of revocation. UUIDs and authorization references are not proof of authority, and hashes are not anonymization.
- Read-only staging probe: `scripts/stage1-postgrest-probe.mjs` has mock-only tests; actual execution and provider setup are pending. Review its limitations in `test-project-progress.md` before relying on it.

Reviewer should record named approvers, reviewed revision, exact environment, evidence and unresolved findings in their own controlled workflow. A signed-off review cannot be inferred from the existence of this packet or passing local tests.
