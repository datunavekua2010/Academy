import { describe, expect, it } from 'vitest';
import { applyAnswer, clampScore, scoreBand, SCORE_RULES } from '../src/practice/scoring';
import { advance, startSession, submitAnswer } from '../src/practice/session';
import type { Question } from '../src/practice/types';

describe('100-point scoring engine', () => {
  it('uses the band from the score BEFORE the answer', () => {
    // < 80 → +4 / −2
    expect(applyAnswer(0, true)).toMatchObject({ score: 4, delta: 4, band: 'below-80' });
    expect(applyAnswer(79, true)).toMatchObject({ score: 83, delta: 4, band: 'below-80' });
    expect(applyAnswer(50, false)).toMatchObject({ score: 48, delta: -2, band: 'below-80' });

    // 80–89 → +2 / −1
    expect(applyAnswer(80, true)).toMatchObject({ score: 82, delta: 2, band: '80-to-90' });
    expect(applyAnswer(88, true)).toMatchObject({ score: 90, delta: 2, band: '80-to-90' });
    expect(applyAnswer(80, false)).toMatchObject({ score: 79, delta: -1, band: '80-to-90' });

    // 90–99 → +1 / −1
    expect(applyAnswer(90, true)).toMatchObject({ score: 91, delta: 1, band: '90-to-100' });
    expect(applyAnswer(99, true)).toMatchObject({ score: 100, delta: 1, band: '90-to-100' });
    expect(applyAnswer(95, false)).toMatchObject({ score: 94, delta: -1, band: '90-to-100' });
  });

  it('never exceeds 100 and finishes at exactly 100', () => {
    expect(applyAnswer(99, true).score).toBe(100);
    expect(applyAnswer(99, true).finished).toBe(true);
    expect(applyAnswer(100, true).score).toBe(100);
    // At 97 the band is 90–99, so a correct answer adds only 1.
    expect(applyAnswer(97, true)).toMatchObject({ score: 98, delta: 1 });
    // A +4 answer near the top is capped, never 104.
    expect(clampScore(79 + 4)).toBe(83);
    expect(clampScore(140)).toBe(100);
  });

  it('never drops below zero', () => {
    expect(applyAnswer(0, false).score).toBe(0);
    expect(clampScore(-12)).toBe(0);
  });

  it('classifies bands at the exact boundaries', () => {
    expect(scoreBand(0)).toBe('below-80');
    expect(scoreBand(79)).toBe('below-80');
    expect(scoreBand(80)).toBe('80-to-90');
    expect(scoreBand(89)).toBe('80-to-90');
    expect(scoreBand(90)).toBe('90-to-100');
    expect(scoreBand(100)).toBe('90-to-100');
  });

  it('exposes the same numbers the UI table renders', () => {
    expect(SCORE_RULES.map((rule) => [rule.correct, rule.wrong])).toEqual([
      [4, -2],
      [2, -1],
      [1, -1],
    ]);
  });

  it('reaches exactly 100 from 0 only through legal steps', () => {
    // Greedy correct answers through the real engine.
    let score = 0;
    let steps = 0;
    while (score < 100) {
      score = applyAnswer(score, true).score;
      steps += 1;
      expect(score).toBeLessThanOrEqual(100);
    }
    // 20 correct (+4) = 80, then 5 correct (+2) = 90, then 10 correct (+1) = 100
    expect(steps).toBe(35);
    expect(score).toBe(100);
  });
});

const question = (id: string, answer: string): Question => ({
  id,
  grade: 5,
  topicId: 't',
  subtopicId: 's',
  // Distinct wording per fixture: the session engine treats the prompt as the
  // identity of a question (regenerated variations get fresh ids).
  prompt: `question ${id}`,
  options: [answer, 'other'],
  answer,
  explanation: 'e',
  difficulty: 1,
});

describe('session engine', () => {
  const pool = [question('q1', 'right1'), question('q2', 'right2'), question('q3', 'right3')];
  const ref = { grade: 5 as const, topicId: 't', subtopicId: 's' };

  /** A fresh set of extra questions, as the provider generates on refill. */
  const refill = (from: number) =>
    Array.from({ length: 6 }, (_, i) =>
      question(`extra${from + i}`, `right-extra-${from + i}`),
    );

  it('scores through the shared engine and records the delta', () => {
    const state = startSession(ref, pool);
    const current = state.questions[state.queue[0]];
    const first = submitAnswer(state, current.answer)!;

    expect(first.result.score).toBe(4);
    expect(first.result.delta).toBe(4);
    expect(first.state.awaitingNext).toBe(true);
    expect(first.state.correct).toBe(1);

    // A second submit before advancing is ignored (prevents double scoring).
    expect(submitAnswer(first.state, state.questions[first.state.queue[0]].answer)).toBeNull();
    const advanced = advance(first.state);
    expect(advanced.awaitingNext).toBe(false);
    expect(advanced.answers).toHaveLength(1);
  });

  it('finishes the session exactly at 100 and stops accepting answers', () => {
    // Drive a perfect run through the real engine, topping the queue up as a
    // real session does (a small pool cannot supply 35 answers on its own).
    let state = startSession(ref, pool);
    let guard = 0;
    let generated = 0;

    while (state.score < 100 && guard < 200) {
      const current = state.questions[state.queue[0]];
      const submission = submitAnswer(state, current.answer)!;
      generated += 6;
      const more = submission.state.queue.length <= 3 ? refill(generated) : [];
      state = advance(submission.state, more);
      guard += 1;
    }

    expect(state.score).toBe(100);
    expect(state.completed).toBe(true);
    expect(state.finishedAt).not.toBeNull();
    expect(guard).toBe(35);
    expect(submitAnswer(state, 'right1')).toBeNull();
  });

  it('refills the queue only with questions the session has not seen', () => {
    const state = startSession(ref, pool);
    expect(state.queue).toHaveLength(3);

    // Already-known questions are not re-queued…
    const noNews = advance(state, pool);
    expect(noNews.queue).toHaveLength(2);

    // …but newly generated ones are appended.
    const withNews = advance(state, refill(100));
    expect(withNews.queue.length).toBeGreaterThanOrEqual(3);
    expect(Object.keys(withNews.questions).length).toBe(9);
  });
});
