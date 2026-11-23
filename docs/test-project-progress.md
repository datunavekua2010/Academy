# Isolated Supabase test project — progress and handoff

The user explicitly approved migrations and synthetic testing only in **axiom academy** (`wxxgwayrieasrzngpuul`). Do not apply these steps to the existing project or use real student data. The project is not ready for real use, and review flags remain disabled. Auth configuration currently permits public email signup, requires confirmation, has a localhost site URL and no custom SMTP; do not treat this as a production configuration.

## Applied and verified

- Test migration history: `20261123104237 initial_academy_schema` corresponds to `202611200001_initial_academy.sql`; `20261123104424 tutor_lesson_notes_review` corresponds to `202611220001_tutor_lesson_notes.sql`; `20261123104821 classrooms_review` corresponds to `202611230001_classrooms_review.sql`. The connector assigned remote timestamps different from repository versions; SQL was equivalent to the repository files; comments were omitted from the first two submissions. **Do not rerun these migrations**. Reconcile migration history deliberately before using Supabase CLI migrations; automatic replay of local versions would conflict.
- The initial schema has 14 public tables, each with RLS enabled. No seed was applied.
- In a transaction rolled back at the end, synthetic Auth rows, roles, relationships and attempts exercised database roles and JWT subject settings: an unlinked student saw no attempts, the student and linked teacher saw the student's attempt, a student could not grant themself an admin role, and a linked parent could read raw attempt data under the initial baseline. This is a known unacceptable production boundary; the later restrictions are **not yet applied**.
- A second rollback-only synthetic SQL test checked that a linked parent saw a published note but not a private one, an unlinked parent was denied, authenticated users lacked direct note-table select, and the linked tutor saw both notes via the tutor RPC. Auth users, profiles, notes and parent links were confirmed empty afterward.
- The classrooms migration created two RLS-enabled tables with no anon or authenticated direct SELECT grants. Its six security-definer RPCs are owned by `postgres`, executable by authenticated but not anon. A rollback-only role/JWT simulation checked classroom creation, linked-student enrollment, rejection of an unlinked student, and denial of direct-table and other-teacher roster access. After rollback, Auth users, profiles, classrooms and memberships were confirmed empty. These tests do not prove real Auth or concurrent behavior.
- `pgcrypto` is installed in the `extensions` schema; test project Auth, database and REST health checks were healthy.
- Catalog checks confirmed anon has no attempt SELECT; authenticated has no direct notes SELECT but may execute the parent notes RPC. `service_role` has note table and function access and bypasses RLS, so protect service credentials. These checks do not cover all paths.

## Still needed

Apply and verify the remaining 18 ordered repository migrations, starting with `202611240001_teacher_tests_review.sql`, in this test project only. Preserve and map the connector-assigned migration versions; check real Supabase extension placement, ownership, grants and function behavior, and stop on any failure rather than retrying blindly. The incomplete baseline permits broad parent access: **do not create real accounts or links or enable the app**. Seed only after reviewing the empty target and the seed. Then test RLS and RPCs under ordinary authenticated roles, actual Auth sessions and PostgREST, role/link revocations and selected concurrency; direct SQL role simulation is not a substitute for actual sign-in.

The sandbox cannot directly connect to the Supabase project's public Auth endpoint, so real email and browser session testing requires an accessible test preview and careful test-only Auth URL/redirect and mail configuration. Confirmation delivery and recovery have not been tested. Independent security/privacy review and explicit production approval are still required. Do not share passwords, service keys or tokens in chat.

## Google login draft

A default-off local Google OAuth/PKCE draft exists; it has not been enabled or configured in this test project and has not been tested with Google. See `accounts-parent-launch-readiness.md` for provider setup, identity-linking and safety requirements. Do not use real student accounts.
