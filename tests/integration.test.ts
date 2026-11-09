import { describe, expect, it } from 'vitest';
import { startSession, submitAnswer, advance, endSession } from '../src/practice/session';
import { newAttempt, recordAttempt, progressFor, assignmentStatus, gradeStats, needsWork, buildDemoAssignments } from '../src/practice/store';
import { generateBatch } from '../src/practice/generator';
import type { Question } from '../src/practice/types';
import type { SessionState } from '../src/practice/session';

/** Answers every question correctly until 100, generating more as the queue drains. */
function playPerfect(ref: { grade: 1; topicId: string; subtopicId: string }): SessionState {
  let state = startSession(ref, generateBatch(ref, 12, { seed: 42 }));
  let guard = 0;
  while (state.score < 100 && guard < 100) {
    const question: Question = state.questions[state.queue[0]]!;
    const submission = submitAnswer(state, question.answer)!;
    const refill = submission.state.queue.length <= 3 ? generateBatch(ref, 6) : [];
    state = advance(submission.state, refill);
    guard += 1;
  }
  return state;
}

describe('integration: a real 100-point run', () => {
  it('records progress that the progress page can read', () => {
    const ref = { grade: 1 as const, topicId: 'Sekreba', subtopicId: 'SuratiT-10' };
    const pool = generateBatch(ref, 12, { seed: 7 });
    expect(pool.length).toBe(12);
    expect(new Set(pool.map((q) => q.signature)).size).toBe(12);

    const state = playPerfect(ref);
    const startedAt = state.startedAt;
    const guard = state.answers.length;

    expect(state.score).toBe(100);
    expect(state.completed).toBe(true);
    expect(guard).toBe(35); // 20×4 + 5×2 + 10×1

    let attempts = recordAttempt([], newAttempt(state, startedAt));
    const progress = progressFor(attempts, ref);
    expect(progress.completed).toBe(true);
    expect(progress.bestScore).toBe(100);
    expect(assignmentStatus(progress)).toBe('completed');

    // A partial attempt shows as in-progress, not completed.
    const partial = endSession({ ...startSession(ref, pool), score: 42, correct: 12, incorrect: 4 });
    attempts = recordAttempt(attempts, newAttempt(partial, partial.startedAt));
    expect(progressFor(attempts, ref).completed).toBe(true); // best score still 100
    expect(attempts.length).toBe(2);
    expect(needsWork(attempts).some((a) => a.ref.subtopicId === 'SuratiT-10')).toBe(false);
  });

  it('computes grade stats from assignments and attempts', () => {
    const assignments = buildDemoAssignments(1, [
      { topicId: 'Sekreba', topicTitle: 'x', subtopicId: 'SuratiT-10' },
      { topicId: 'Sekreba', topicTitle: 'x', subtopicId: 'ra-aris-Sekreba' },
      { topicId: 'ricxvebi20', topicTitle: 'y', subtopicId: 'ricxvebi1-10' },
      { topicId: 'ricxvebi20', topicTitle: 'y', subtopicId: 'luwi-kenti' },
    ]);
    expect(assignments.length).toBe(4);
    const stats = gradeStats([], 1, assignments);
    expect(stats).toMatchObject({ assigned: 4, completed: 0, notStarted: 4, mastery: 0 });

    // The first assignment is the subtopic the template set covers.
    const ref = { grade: 1 as const, topicId: 'Sekreba', subtopicId: 'SuratiT-10' };
    const state = playPerfect(ref);
    const attempts = [newAttempt(state, state.startedAt)];
    const after = gradeStats(attempts, 1, assignments);
    expect(after.completed).toBe(1);
    expect(after.notStarted).toBe(3);
    expect(after.correct).toBe(35);
    expect(after.mastery).toBe(100);
  });
});
