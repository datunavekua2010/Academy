import { describe, expect, it } from 'vitest';
import { startSession, submitAnswer, advance, endSession } from '../src/practice/session';
import { newAttempt, recordAttempt, progressFor, assignmentStatus, gradeStats, needsWork, buildDemoAssignments } from '../src/practice/store';
import { questionsForSubtopic } from '../src/practice/bank';

describe('integration: a real 100-point run', () => {
  it('records progress that the progress page can read', () => {
    const ref = { grade: 1 as const, topicId: 'shekreba', subtopicId: 'atamde' };
    const pool = questionsForSubtopic(ref);
    expect(pool.length).toBeGreaterThanOrEqual(5);

    let state = startSession(ref, pool);
    const startedAt = state.startedAt;
    let guard = 0;
    // Answer correctly until the session hits 100.
    while (state.score < 100 && guard < 100) {
      const q = pool.find((item) => item.id === state.queue[0])!;
      const sub = submitAnswer(state, pool, q.answer)!;
      state = advance(sub.state, pool);
      guard += 1;
    }

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
    expect(needsWork(attempts).some((a) => a.ref.subtopicId === 'atamde')).toBe(false);
  });

  it('computes grade stats from assignments and attempts', () => {
    const assignments = buildDemoAssignments(1, [
      { topicId: 'shekreba', topicTitle: 'x', subtopicId: 'atamde' },
      { topicId: 'shekreba', topicTitle: 'x', subtopicId: 'ocamde' },
      { topicId: 'ricxvebi', topicTitle: 'y', subtopicId: 'datvla' },
      { topicId: 'ricxvebi', topicTitle: 'y', subtopicId: 'shedareba' },
    ]);
    expect(assignments.length).toBe(4);
    const stats = gradeStats([], 1, assignments);
    expect(stats).toMatchObject({ assigned: 4, completed: 0, notStarted: 4, mastery: 0 });

    const ref = assignments[0].ref;
    const pool = questionsForSubtopic(ref);
    let state = startSession(ref, pool);
    let guard = 0;
    while (state.score < 100 && guard < 100) {
      const q = pool.find((item) => item.id === state.queue[0])!;
      state = advance(submitAnswer(state, pool, q.answer)!.state, pool);
      guard += 1;
    }
    const attempts = [newAttempt(state, state.startedAt)];
    const after = gradeStats(attempts, 1, assignments);
    expect(after.completed).toBe(1);
    expect(after.notStarted).toBe(3);
    expect(after.correct).toBe(35);
    expect(after.mastery).toBe(100);
  });
});
