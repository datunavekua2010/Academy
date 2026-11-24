# Signup integration status

**Review-only, not production-ready or deployed.** Existing live sign-in reported by the owner is separate from these changes. Never apply the candidate SQL or enable its feature flags as-is in production.

## Connected local path

Google login establishes the Supabase session; the separately gated Google OIDC reauthentication validates signed tokens and binds proof to the session. Only then do the individual student and parent forms call their own enrollment RPC. These create only the selected role, retain pre-existing profile data, and do not reinstate a previously revoked role. Student grade and profile are atomic. Parent attestation is not proof of age or parental authority. The parent application records an arbitrary student account ID without confirming that the student exists. A distinct authorized administrator must independently verify identity and authority and record a non-sensitive internal reference before approving; approval invokes the existing role- and link-lifecycle checks. Neither Google identity nor a request confers child access.

The parent UI is controlled by existing parent review and Google proof flags plus `VITE_PARENT_LINK_APPLICATION_REVIEW`; enrollment also requires `VITE_STUDENT_ONBOARDING_REVIEW` or `VITE_PARENT_ONBOARDING_REVIEW` respectively. The admin screen additionally requires the existing admin review flag. Worker Google proof is disabled unless explicitly configured. A rate-limit prototype requires server-only `GOOGLE_PROOF_RATE_KEY` (at least 32 bytes), a trusted Cloudflare `CF-Connecting-IP`, and the service-only SQL limiter. These flags and keys are not instructions to enable production.

## Evidence and remaining work

Local integration uses a real local PostgreSQL-compatible schema, synthetic sessions and signed synthetic Google tokens through the Worker handler and SQL RPC adapter; it does not contact Google, Supabase Auth, PostgREST or Cloudflare. UI tests cover enrollments and request/approval interactions. PostgreSQL separate-connection tests cover duplicate application and approval/cancellation ordering, with membership authorization simulated. The broader existing role/link concurrency and policy suites are separate. See command output for run-specific results.

Before a safe release:

1. Obtain a working staging Worker deployment and staging-only Google OAuth client/callback configuration for `wxxgwayrieasrzngpuul`; never reuse production secrets in staging. Test actual Google signup, reauthentication, refresh, sign-out, replay, both enrollments, admin review, access to the linked student and denial for unrelated families. Cloudflare access/configuration is not available in this workspace.
2. Complete effective authorization coverage, including service-role gateways, direct RLS, RPCs, role revocation and session expiry; validate existing users and the other sign-in work. Add production-quality rate limits, retention/cleanup, request-log redaction and operational monitoring. Review child privacy, age/consent and the independent authority-verification process; a checkbox or account ID is insufficient.
3. Reconcile the actual staging and production schemas and migration histories without replaying or marking migrations blindly. Turn the reviewed candidates into forward-only, data-preserving migrations with tested rollback and a plan for existing sessions. Apply and test them in staging first. The SQL in `supabase/review/` is not a deployment migration.
4. Once the above passes, apply reviewed migrations to production `iywgnaltjjcgjzuccavj`, configure production-only Worker runtime secrets and the registered Google callback, deploy the verified Worker and frontend with the appropriate build flags, then verify live end-to-end and cross-family isolation. Roll back with the tested plan if checks fail. Current production was observed without the proof and self-enrollment RPCs; enabling frontend flags alone cannot work and enabling enforcement before proof would lock out existing users.

No checkout, subscription, free-trial entitlement, or automatic payment implementation is provided here.
