import { describe, expect, it } from 'vitest';
import { generateBatch } from '../src/practice/generator';
import { shownKey } from '../src/practice/identity';
import { advance, startSession, submitAnswer } from '../src/practice/session';
import { levelForScore } from '../src/practice/levels';

/**
 * Two questions are the same question when they show the same thing: the same
 * sentence, the same picture, and the same items to arrange.
 *
 * The engine used to compare sentence and picture only. Ordering questions vary
 * in none of those — "arrange three objects by length" is one sentence, and the
 * numbers live in the items — so every ordering question looked like a repeat of
 * the first. The generator then refused to draw a fourteenth, and U01.3 ran out
 * of questions at 82 points on a perfect run.
 */
const LENGTH = { grade: 1 as const, topicId: 'mdebareoba', subtopicId: 'grZeli-mokle' };

describe('what makes two questions different', () => {
  it('separates ordering questions that arrange different items', () => {
    const questions = generateBatch(LENGTH as never, 6, { level: 3 });
    expect(questions.length).toBe(6);
    expect(questions[0].orderItems?.length).toBe(3);

    const keys = questions.map(shownKey);
    expect(new Set(keys).size).toBe(6);

    // The sentence is genuinely the same every time — that is why the items
    // have to be part of the identity.
    expect(new Set(questions.map((q) => q.prompt)).size).toBe(1);
  });

  it('shows the ordering items with their unit', () => {
    const [question] = generateBatch(LENGTH as never, 1, { level: 3 });
    for (const item of question.orderItems ?? []) {
      expect(item).toMatch(/^\d+ სმ$/);
    }
    expect(question.answer).toMatch(/^[1-3],[1-3],[1-3]$/);
  });

  it('plays U01.3 to 100 without running out or repeating', () => {
    let state = startSession(LENGTH as never, generateBatch(LENGTH as never, 8, { level: 1 }));
    const shown = new Set<string>();
    let answered = 0;

    while (!state.completed && !state.exhausted) {
      const id = state.queue[0];
      if (!id) break;
      const question = state.questions[id]!;
      expect(shown.has(shownKey(question)), `repeated at ${answered}`).toBe(false);
      shown.add(shownKey(question));

      const submission = submitAnswer(state, question.answer);
      if (!submission) break;
      state = submission.state;
      answered += 1;

      const refill =
        state.queue.length <= 3
          ? generateBatch(LENGTH as never, 4, {
              avoid: new Set([...Object.keys(state.questions), ...shown]),
              level: levelForScore(state.score),
            })
          : [];
      state = advance(state, refill);
    }

    expect(state.score).toBe(100);
    expect(answered).toBeLessThanOrEqual(35);
  });
});
