# Streak system: current implementation and prerequisites

The student dashboard, Axi navigation, and streak page are available as a **non-authoritative preview**. Six streak-badge definitions are independent of the achievements catalog. All student-specific values, badge statuses and calendar dates are explicitly unavailable; local activity is never interpreted as verified learning. The preview neither tracks a streak nor consumes freezes or awards badges.

## Inspection and blockers

- The temporary public test account (`src/student/accountMode.ts`, `src/student/session.tsx`) does not authenticate a student; its practice and lesson data is local to a browser.
- `src/lessons/LessonPlayer.tsx` calls `markCompleted` in `src/lessons/progress.ts`, which stores client-calculated completion in localStorage. There is no authoritative lesson-completion record.
- Practice questions and answers are generated and scored in `src/practice/session.ts` and `PracticeProvider.tsx` in the browser. `exercise_attempts.result` contains client-submitted attempt JSON; RLS checks ownership but does not validate question issuance, acceptance, distinctness, scoring, or session completion. It is not verified evidence. No server-side practice-session answer table or validator exists.
- The existing `achievements` and `earned_rewards` are a separate system, do not establish verified streak awards, and must not be modified to represent these badges.

## Required server work (proposal only; not a migration)

Create trusted issuance and validation of practice answers, plus authoritative lesson completion, before consuming either as evidence. Trusted server events must identify the authenticated owner, use a server-generated UTC timestamp, prove a completed lesson or a valid session with at least ten distinct accepted answers, and be idempotent. Do not treat historic browser attempts or local lesson progress as evidence. Re-enable real authentication only when requested.

After those prerequisites and schema review, add separate `student_streaks`, `student_learning_days`, `student_streak_freezes`, and `student_streak_badges` records, with ownership foreign keys, unique student/date and student/badge constraints, nonnegative counters, and read-own-only RLS; clients must not write them. Store a durable verified-event/evidence reference and a server-side per-award acknowledgement for celebrations. A trusted transaction should lock the student state, derive dates using PostgreSQL `AT TIME ZONE 'Asia/Tbilisi'`, deduplicate events, atomically apply at most one available freeze to a single missed date only when a later qualifying day bridges it, and award each milestone once. Reconciliation must not retroactively backdate client data, grant freezes or replay notifications. Define handling of delayed verified events and initialize freeze availability before implementation; no automatic replenishment. A protected day maintains continuity without incrementing the learning-day count. Longest streak cannot decrease. Read operations must derive inactive state without prematurely expiring the current Georgia day. Keep badges and their awards independent from achievements.

Implement and test real authenticated read APIs, server-only processing, retry, concurrency, notification acknowledgements, timezone boundaries, and security on a non-production database before enabling UI values. No schema change, migration, database write, backend service, badge celebration, or production deployment has been performed by this feature.

A local unrouted single-choice issuance/comparison prototype exists in `server/practice-evidence-review.ts`; it is single-process, non-durable and not used for streaks or awards. See `docs/security-rollout-checklist.md`. The prerequisites above remain unresolved.

A separate unapplied service-only durable single-choice scoring pilot and unrouted gateway now exist locally. They do not issue awards, provide verified lesson evidence, or satisfy the prerequisites above; see `security-rollout-checklist.md`.
