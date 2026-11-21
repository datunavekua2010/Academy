# Supabase setup (review before rollout)

The repository contains a schema migration and curriculum seed. They are **not applied automatically**. Check the target project’s migration history and existing rows before running either file. Use a fresh **test project first**, back up an existing project, and review for conflicts before running SQL. No SQL here deletes an existing table, but the initial migration creates public tables and fails if the names already exist. Avoid running it against an unknown schema. SQL editor runs with elevated privileges: only a trusted academy administrator should use it.

## 1. Configure academy-only sign-in

1. Open the Supabase project dashboard. In **Authentication → Sign In / Providers → Email**, enable email/password sign-in and disable **Allow new users to sign up**. Check **Authentication → Sign In / Providers** and disable other sign-in providers and anonymous sign-ins unless separately reviewed. Confirm public sign-up is actually blocked by trying it in the test project; hiding the app form alone is not security.
2. The app has no public registration or password-reset/accept-invite flow. For now an academy administrator must create users via **Authentication → Users → Add user → Create new user**, set an initial password, and communicate it through a secure channel. Do not send passwords or secret keys in chat. Confirm the account according to your academy's email policy. The academy must handle consent, password changes and recovery before production use; the app does not yet provide them.
3. In Supabase **Connect**, find the Project URL and publishable key. A publishable key is intentionally public in browser code. **Never use `sb_secret_…`, service-role, database passwords, or other secret keys as a Vite variable or in the browser.** Keep the Supabase project private through RLS, grants and proper Auth configuration.

## 2. Enter browser configuration

**Local:** In the project folder, create `.env.local` (a plain text configuration file, not source code) with these two lines, replacing the placeholders with values from **Connect**:

```text
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR-PUBLISHABLE-KEY
```

This file is ignored by Git. Restart `npm run dev` after editing. Never commit it. A build embeds both values in public JavaScript. When neither is set, no fake student is signed in: guests may browse public material, but account sign-in is unavailable. If only one is set or the values are invalid, the student area fails closed. With both values set there is no demo fallback if Auth or profile access fails.

**Cloudflare Workers Builds:** Go to **Cloudflare dashboard → Workers & Pages → select the Academy Worker → Settings → Build → Build Variables and Secrets**. Add the two names above and their values to the relevant production build configuration. Configure preview builds separately, preferably using a separate test Supabase project. Save and start a **new build/deployment**. `VITE_` values are read by `npm run build`, not at Worker runtime; setting only the Worker's runtime variables will not change the generated static site. Check the new deployment after it finishes. The Cloudflare Worker is static-assets only; it does not receive a privileged Supabase key.

## 3. Review and apply to a test project

1. Inspect `supabase/migrations/202611200001_initial_academy.sql` and `supabase/curriculum-seed.sql` in the repository. The schema includes RLS, grants and academy-managed role/link tables. The seed reflects the current practice curriculum and registry; it contains no student data.
2. If the initial migration is not already installed, in the **test** project open **SQL Editor → New query**. Paste the reviewed contents of the migration file and click **Run**. Confirm success; if anything fails, stop and inspect the error rather than retrying blindly. Each file is transactional.
3. If curriculum tables are empty, open a second new query, paste the reviewed contents of `supabase/curriculum-seed.sql`, and click **Run**. It is intended for an empty schema; do not run it twice. Future curriculum updates need a separately reviewed migration, not a repeat of this seed.
4. Verify tables, RLS and policies in **Table Editor / Database → Tables and Policies**. Test using ordinary accounts, never the SQL editor's privileged session, to prove that RLS is enforced.

To regenerate the seed after a curriculum change, run `npx esbuild scripts/generate-supabase-curriculum.ts --bundle --platform=node --format=esm --outfile=.scratch/export-curriculum.mjs`, then `node .scratch/export-curriculum.mjs > supabase/curriculum-seed.sql`. The generator never contacts the database. **Do not apply a regenerated full seed to an existing populated database**; create an additive migration after reviewing the diff.

## 4. Provision test accounts and links

Using **Authentication → Users**, create at least two test students, one teacher and one parent. Copy each user UUID from that screen. In **Table Editor**, using your administrator session:

1. Add one `profiles` row for each user: `id` is the Auth UUID, `display_name` is the name to show, and `first_name` is the first name. Leave `created_at` at its default.
2. Add a `user_roles` row for each user (`user_id` is the same UUID; `role` is `student`, `teacher` or `parent`). Roles and profiles must be inserted by academy administrators—not by students.
3. Add a `student_grades` row for each student with their UUID and a grade from 1 to 7. An absent grade is allowed and is not guessed.
4. Link only the intended users via `teacher_students` (`teacher_id`, `student_id`) and `parent_students` (`parent_id`, `student_id`). The IDs are Auth UUIDs, not emails. These links and roles are administrator-managed. A teacher can manage only their own assignments for linked students; a parent has read-only access for linked children.
5. A trusted administrator or linked teacher can insert a `homework_assignments` row using a real grade/topic/subunit from `curriculum_subunits`, a linked student UUID, the teacher UUID as `assigned_by`, and a due timestamp later than `assigned_at`. Leave the ID and assignment timestamp at their defaults. The app currently has no staff-management interface.

The app's current sign-in screen is **student-only**. Teacher and parent permissions are defined in the database, but their dashboards and staff assignment-management UI are not implemented.

## 5. Verify before production

- Using the test URL and test project values, sign in as each student. Confirm their own grade and assignments, complete an exercise and confirm the attempt appears after reload. Confirm a wrong password and missing student role/profile show errors. Confirm signing out prevents access.
- With separate test sessions, try reading another student's profile, assignments and attempts; attempt to add a role, change a grade, forge another student's attempt or award a reward. Those operations must fail or return no rows. Check linked versus unlinked teacher/parent access, including teacher assignment writes. Test anonymous access too.
- `npm run test:supabase-policy` runs a **local PostgreSQL-compatible simulation** using PGlite, not your actual Supabase project. `npx vitest run tests/supabase-config.test.ts tests/supabase-session.test.tsx tests/supabase-store.test.ts` tests client configuration, mocked Auth, and adapter errors. Neither is a substitute for the real-project checks above.
- Exercise scores and answers are calculated in the browser and are unverified; never use them as trusted assessment, award eligibility, or payment evidence. Earned rewards and authoritative summaries can only be written by a future trusted backend. Lesson progress remains in account-scoped browser storage, not Supabase; an unfinished practice session is not resumed across reloads in connected mode. Failed attempt writes show a retry message but the pending queue is in memory and can be lost if the user leaves or signs out. Do not claim reliable offline sync yet.
- Profile preferences are demo-only. Parent links are access controls, not proof of parental consent. Review child-data retention, access, deletion, consent and applicable laws before real students use the system.
