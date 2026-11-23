# axiacad.uk account configuration — preparation only

**Rollout authorization update:** the owner has requested production deployment and live settings changes. No production deployment, migration, or live setting change has yet been performed by this update. The operational preconditions below remain unresolved; these values are proposed, not evidence of live configuration. Production is `iywgnaltjjcgjzuccavj`; the isolated staging project is `wxxgwayrieasrzngpuul`. Do not use production data for tests. The current production database lacks the parent summary and provisioning RPCs and its parent policy permits linked parents to read full attempt JSON. Do not enable connected accounts or parent links there until the incremental migrations, effective privileges and real-session tests have been reviewed and completed.

## Current production findings and immediate blockers

Read-only inspection of production `iywgnaltjjcgjzuccavj` found one migration record, `20261120154717 initial_academy_schema`. Its stored statement matches local `202611200001_initial_academy.sql` after stripping whole comment-only lines and all whitespace (SHA-256 `b8b3c45cef81f51c544024752e41cfc80f81cdbc5f07879c438ed6ead6540ec6`). This is neither byte equality nor proof of full catalog parity. The other 20 local migrations are not in the production ledger. Do not blindly replay the initial schema or repair migration history; production and local versions differ, and the existing main-branch Supabase check reported `Remote migration versions not found in local migrations directory`.

Production `attempts_read` uses `academy_private.can_view_student`, which includes linked parents. Authenticated has table SELECT, so a parent-only linked account can read raw attempt data under that baseline; hiding the parent UI does not fix direct API access. Production currently lacks `parent_review_children`, `parent_review_recent_attempts`, `parent_published_lesson_notes` and `admin_provision_academy_profile`. The ordered review migrations introduce the scoped RPCs, provisioning, revocation and parent data minimization, but applying them without reconciling production history, dependencies, existing data and recovery is not safe.

The Cloudflare integration is not accessible in this environment; The owner identified `axiomacademy9` as the Worker connected to `axiacad.uk`; GitHub also reports production build checks for a separate Worker named `academy`. Actual Cloudflare deploy commands, route details, runtime variables, and secrets are not visible here. Check both build integrations before merging so the other Worker is not unintentionally affected. The repository formerly contained an assets-only Worker; the branch now proposes `server/auth-captcha-review-worker.ts` as its entry point and routes the verifier before assets. No dashboard configuration was inspected, and no provider or CAPTCHA secret was retrieved. `VITE_` variables must be build-time; `TURNSTILE_WORKER_SECRET` must be a Worker runtime secret. The Cloudflare owner must configure them privately for `axiomacademy9`. Supabase connector cannot configure its CAPTCHA, Google provider or SMTP settings.

The owner must configure Google OAuth and Turnstile in the relevant provider dashboards and a mail provider for confirmation/recovery if those methods are enabled. Tests with alternate accounts should only begin once the authorization boundary and CAPTCHA are actually in place. The currently running preview is unconfigured and cannot prove live authentication.

## Cloudflare build variables (public; embedded into the JavaScript bundle)

For the future production build on `https://axiacad.uk`:

| Name | Value / source |
| --- | --- |
| `VITE_ACCOUNT_MODE` | `connected` |
| `VITE_SUPABASE_URL` | `https://iywgnaltjjcgjzuccavj.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | The **publishable** `sb_publishable_…` key for that project from Supabase Connect / API Keys. Never use a `sb_secret_…` or service-role key. |
| `VITE_AUTH_CALLBACK_ORIGIN` | `https://axiacad.uk` (no trailing slash) |
| `VITE_TURNSTILE_SITE_KEY` | Public site key of a Turnstile widget registered for `axiacad.uk`. |
| `VITE_ACCOUNT_SIGNUP_REVIEW` | `true` only after confirmation, CAPTCHA, role-provisioning and abuse controls are verified; otherwise unset. |
| `VITE_PASSWORD_RECOVERY_ENABLED` | `true` only after recovery delivery and callback tests; otherwise unset. |
| `VITE_GOOGLE_AUTH_REVIEW` | Leave unset unless Google OAuth and identity-linking are separately configured and tested. |
| `VITE_PARENT_ENABLED` | `true` only after parent minimization, link authorization and real-session tests pass; otherwise unset. |
| `VITE_ADMIN_ENABLED` | `true` only after admin authorization, MFA/operator safeguards and provisioning tests pass; otherwise unset. |
| `VITE_CLASSROOM_CODES_ENABLED`, `VITE_TURNSTILE_REVIEW` | Leave unset for this rollout; connected password forms already require CAPTCHA. |

In Cloudflare, open the Axiom Academy Worker/Build configuration and set these in **build-time variables for the production environment** (not merely Worker runtime vars). The dashboard is not connected to this session, so existing values are unknown. Setting variables can affect a future build; coordinate them with the authorized rollout. Never put service keys, OAuth client secrets or Turnstile secrets in any `VITE_` value, source file or chat. A preview needs its own staging project, preview origin, build variables and Turnstile configuration.

## Supabase Auth (authorized rollout; not yet configured)

In Supabase project `iywgnaltjjcgjzuccavj`, under Authentication → URL Configuration, use Site URL `https://axiacad.uk` and add these exact redirect URLs for the current root-path callbacks:

- `https://axiacad.uk/?signup=1`
- `https://axiacad.uk/?recovery=1`
- `https://axiacad.uk/?google_auth=1` (only if Google is enabled)

Do not use broad wildcard redirects. This assumes `https://axiacad.uk` is the canonical browser origin; `www` or other aliases must redirect to it before authentication. Test the deployed Supabase URL matcher, templates, PKCE code exchange, link scanners and query markers; do not claim those tests passed based on this list. Set up email confirmation, a production-capable mail provider, password policy and rate limits separately. Do not enable unrestricted public signup until the account and child-data process is approved.

For Google, if selected later, its OAuth provider redirect is `https://iywgnaltjjcgjzuccavj.supabase.co/auth/v1/callback`; store its client secret only in Supabase's provider settings and review same-email linking and first-time account creation. Google is not covered by the password-form CAPTCHA flow.

## Turnstile and Worker

Create/configure a Turnstile widget for `axiacad.uk`. The frontend uses its public site key for two **separate** single-use tokens. Configure Supabase Authentication → Bot and Abuse Protection to enforce Turnstile with its secret; the Worker precheck is bypassable by direct Supabase Auth requests. Provision the Worker verifier secret in Cloudflare as `TURNSTILE_WORKER_SECRET`, never in a build variable. It must correspond to the frontend widget. `TURNSTILE_ALLOWED_ORIGIN=https://axiacad.uk` and `TURNSTILE_REVIEW_ENABLED=true` are Worker runtime variables, and `ASSETS` is the assets binding. The branch `wrangler.toml` now proposes routing `/api/auth/turnstile-verify` to the existing verifier and sets the production origin, with the secret left to Cloudflare secret storage. This change is not deployed. The owner identified `axiomacademy9` as the serving Worker; its precise route, build settings and existing environment remain unverified here. Cloudflare dashboard access is required before deploying. The Worker should be reviewed and tested on an isolated deployment before any production wiring. A 200 static HTML fallback is rejected; only the verifier's 204 response is accepted. Independent rate limits, abuse review and accessibility checks remain required.

Review `public/_headers` before release: its current draft allows the staging Supabase origin as well as production and disables iframe embedding; test the actual CSP, preview environment and real Auth/Turnstile in a browser. Worker API responses need their own headers.

## Production upgrade sequence — operational prerequisites

1. Keep parent access and connected entry points off. Independently review privacy, parental authority, session/abuse controls, data retention and the actual production catalog, grants, dependencies, policies and existing data. Confirm backups and a tested restore procedure, maintenance window, owner, monitoring and previous Cloudflare build/configuration. Do not copy the staging version map to production.
2. Compare production's recorded `20261120154717 initial_academy_schema` and current catalog against the local initial migration and the complete ordered chain. Investigate any drift, conflicting object, existing data or unexpected privilege. Design and independently review a **data-preserving incremental upgrade** with preconditions and postconditions for the actual production state. The fresh-schema snapshot is not an upgrade, and the baseline must not be replayed simply because its local version differs. Stop on discrepancy; no history repair or migrations without a reviewed plan and separate authorization.
3. Rehearse the approved exact upgrade against a production-like isolated copy containing synthetic data only. Verify integrity, all effective parent-only read paths, admin provisioning, role/link suspension and revocation, unrelated-family denial, and safe behavior during partial failure. Parent minimization must be effective before links or the dashboard are exposed. Confirm operational handling of legacy records and independent student/teacher roles. Do not assume migration names alone guarantee the policies are effective.
4. Once operational prerequisites are resolved, an operator would execute the reviewed incremental plan during the agreed window, inspect migration results and postconditions, and stop on any failure. Configure production Auth, SMTP, Turnstile, Worker and build variables as described above only during the authorized rollout, after the operational prerequisites are resolved. Separately verify real sessions, redirects, mail and RLS before enabling the account/parent switches. Record the results and release identifiers.
5. For an incident, disable new account and parent entry points and restore the previous verified Cloudflare build/configuration. Preserve data and stricter DB policies; avoid an automatic down-migration or relaxing RLS. Diagnose and apply only independently reviewed forward fixes. A database restore, if unavoidable, requires an approved recovery plan including point-in-time boundary, data-loss assessment and separate authorization.

**Go/no-go evidence:** the operator records the exact project ref, migration/version mapping, selected catalog and effective-grant postconditions, backup ID and successful restore-rehearsal result, previous/new build IDs, named approvers and time window. Confirm unlinked and revoked users are denied through actual Auth/PostgREST, linked parents see only summaries, no unexpected anon/parent direct access exists, expected roles still work, email confirmation and recovery arrive at a controlled inbox, redirects stay on the approved origin, and missing/invalid CAPTCHA is denied by Supabase itself. Confirm Worker routing, secrets isolation, CSP/browser behavior, health and incident monitoring. Record pass/fail without storing tokens or private payloads. Any failed, skipped or ambiguous critical check is a **stop**, not a waiver to enable account or parent switches.

**Rollback limits:** disabling UI is not an authorization boundary for clients already holding credentials; server-side policy fixes and session revocation must be part of an independently reviewed incident response. Restoring a static build does not undo schema migrations, revoke already issued tokens, erase delivered emails or recall data already returned. Reverting a policy to the broad baseline could disclose student answers and is prohibited as an improvised rollback. Database restore can lose writes after its recovery point; test recovery separately and obtain approval before attempting it.

## Verification and rollback

Local commands, from `/home/user/Academy`:

```sh
npm run typecheck
npx vitest run tests/account-mode-wiring.test.ts tests/account-mode-configuration.test.ts tests/supabase-session.test.tsx tests/account-signup.test.tsx tests/password-recovery.test.tsx tests/teacher-signin.test.tsx tests/teacher-no-preview.test.tsx tests/guest-preview.test.tsx tests/parent-review.test.tsx tests/auth-security-review.test.tsx tests/worker-security-review.test.ts --maxWorkers=2
npm run test:review-policies
npm run build
```

Each must finish with exit code 0; Vitest reports all files passed, and the policy suite prints passed for each synthetic test. If any command fails, retain its output and fix the failure before release. These do not prove real sessions, Cloudflare routing, email delivery, CAPTCHA enforcement, effective production policies or remote concurrency.

After an expressly authorized, staged production rollout, rollback means restore the previously verified Cloudflare build/configuration and disable new account entry points if necessary, while preserving the database and records. Avoid reversing security policies or deleting records as an improvised rollback. Record the previous build ID, environment variables and a tested backup/restore procedure before changes; database rollback requires a separately reviewed data-preserving plan. No production rollout or rollback has been performed.
