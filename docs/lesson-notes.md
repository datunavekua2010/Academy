# Tutor lesson notes — review and rollout

## Current state

The `ჩემი მოსწავლეები` list and each teacher-side student profile link to the lesson notes page. `#/teacher` now opens the student list; the overview and parent-update tabs were removed from navigation. Existing direct routes and the manual unsent parent-update form remain available for compatibility. In the public test account, notes are an in-memory simulation only: they disappear on navigation or reload, have no authentication or privacy, and never reach a parent. Do not enter real student information there.

The connected UI calls the functions described below, but the current application intentionally disables Supabase in test mode, has no parent dashboard or sign-in, and the migration is **not deployed**. If the functions are not installed, the connected UI fails closed with a load error; it does not switch to local storage or claim success. Real parent viewing is not implemented in the UI. No sample notes or account data were written to Supabase.

## Proposed migration — not applied

`supabase/migrations/202611220001_tutor_lesson_notes.sql` creates `public.tutor_lesson_notes`: UUID, student and author profile foreign keys, text (up to 2000 characters, with at least one non-whitespace character), visibility (`tutor`/`parent`), nullable publication timestamp, database-generated creation/modification times, and a revision counter. An index supports author/student lists; a partial index supports published parent reads. Existing student, parent and curriculum records are unchanged. Profile deletion cascades to the notes; retention and deletion policy should be approved before deployment.

RLS is enabled and **no** direct table privileges or RLS policies are granted to public, anon, or authenticated users. All access goes through `SECURITY DEFINER` functions with an empty search path, no public/anon execute, and explicit checks using `auth.uid()`. A tutor must have the teacher role and a current `teacher_students` link, and can list or mutate only notes they authored for that linked student. A parent must have the parent role and a current `parent_students` link. The parent function returns only published parent-visible text, creation date and tutor display name, and also checks the tutor's role and link are current. It returns no note IDs, private text, draft content or publication metadata. Direct parent table queries and all parent mutations are denied. Student and other-teacher access is denied. The separate parent-facing RPC is not yet wired to an application.

New notes are drafts. Only an explicit publish call sets the publication timestamp using the database clock; repeated publish with the current revision is idempotent. Saving an edited published note, or saving a tutor-only visibility, immediately unpublishes it. The prior published version is **not retained**, so parents see no note until it is republished. Unpublish keeps a private tutor draft; deletion requires a separate confirmed action. Mutations require the last revision and reject stale writes. Concurrent membership changes are enforced at each database operation under normal PostgreSQL transaction isolation; deployments should additionally review membership-revocation and request-race behavior on a dedicated test project.

The UI pages through tutor notes, but offset pagination is not a transaction snapshot if notes are created or deleted concurrently. Errors are not converted into empty lists or successful writes. On failed mutation, text remains in the editor; reload the list to resolve a conflict. The public simulation is not security evidence.

## Verification and approval before rollout

`node scripts/test-lesson-notes-policy.mjs` applies both migrations only to an ephemeral local PGlite database and exercises the actual database functions and grants with test identities, including parent scope, author isolation, publish/unpublish, editing, role/link revocation, direct-access denial, empty text and stale revisions. This is a local PostgreSQL-compatible smoke test, not a substitute for real Supabase/PostgREST, concurrency, security and parent UI integration tests.

Before applying anything, review the migration, ownership and privilege assumptions, data-retention policy, parent-link authorization and rollback plan; obtain explicit approval and test with dedicated non-production accounts. No deployment, migration application, auth change, parent dashboard or production data is included in this change. Rollback after any future approved deployment would drop the five note functions and the notes table **only after an explicit data retention/export decision**; dropping the table destroys all saved notes.


## Write-lock follow-up (review only)

`202611300001_teacher_write_lock_review.sql` additionally coordinates note creation, edit, publication and deletion with admin tutor-link revocation using a pair lock and post-lock role/link recheck. It depends on the link/classroom/code review migrations in addition to the notes migration, and has not been applied. Run `WRITE_LOCK_REVIEW=1 node scripts/test-lesson-notes-policy.mjs` and `node scripts/test-teacher-write-lock-concurrency.mjs` (the latter needs the optional local PostgreSQL dependency described in `docs/account-and-linking-review.md`). Existing published data, parent visibility after a future relink, other privileged operations, real Supabase and retention remain subject to review.
