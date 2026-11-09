import { describe, expect, it } from 'vitest';
import { CURRICULUM } from '../src/practice/curriculum';
import { topicSubtopics } from '../src/practice/types';
import { generateBatch, regenerateFromId } from '../src/practice/generator';
import { startSession, submitAnswer, advance } from '../src/practice/session';

/**
 * Grade I is placeholder content until the academy's real questions arrive, and
 * a few placeholders are fixed-wording multiple choice with only three distinct
 * phrasings. Any non-empty batch is still a playable session.
 */
const batchSizeFor = (grade: number): number => (grade === 1 ? 1 : 5);

describe('end to end: generate → play → restore', () => {
  it('every subtopic can be played and the answers are self-consistent', () => {
    let checked = 0;

    for (const grade of CURRICULUM) {
      for (const topic of grade.topics) {
        for (const subtopic of topicSubtopics(topic)) {
          const ref = { grade: grade.grade, topicId: topic.id, subtopicId: subtopic.id };
          const size = batchSizeFor(grade.grade);
          const batch = generateBatch(ref, size);
          expect(batch.length).toBe(size);

          const state = startSession(ref, batch);
          const current = state.questions[state.queue[0]];
          expect(current.options).toContain(current.answer);

          const submission = submitAnswer(state, current.answer)!;
          expect(submission.result.correct).toBe(true);
          expect(submission.result.score).toBe(4);
          expect(advance(submission.state).awaitingNext).toBe(false);
          checked += 1;
        }
      }
    }

    // 16 grade-I topics of 113 subtopics plus the other grades' subtopics.
    expect(checked).toBeGreaterThanOrEqual(113);
  });

  it('a session restored from storage keeps the same question', () => {
    const ref = { grade: 2 as const, topicId: 'gamravleba', subtopicId: 'cxrili' };
    const state = startSession(ref, generateBatch(ref, 6, { seed: 1 }));
    const before = state.questions[state.queue[0]];

    // Simulate a reload: keep only ids (as an older draft would) and rebuild.
    const restored = regenerateFromId(before.id)!;
    expect(restored.prompt).toBe(before.prompt);
    expect(restored.options).toEqual(before.options);
    expect(restored.explanation).toBe(before.explanation);
  });

  it('never repeats a question inside one long session', () => {
    const ref = { grade: 1 as const, topicId: 'Sekreba', subtopicId: 'SuratiT-10' };

    let state = startSession(ref, generateBatch(ref, 24));
    const seen = new Set<string>();
    let guard = 0;

    while (state.score < 100 && guard < 200) {
      const current = state.questions[state.queue[0]];
      const key = current.prompt;
      expect(seen.has(key), `repeated prompt: ${key}`).toBe(false);
      seen.add(key);

      const submission = submitAnswer(state, current.answer)!;

      // The provider's refill rule: regenerate when the queue runs low, and
      // exclude every question and every wording this session has shown.
      const used = new Set(Object.keys(submission.state.questions));
      const seenPrompts = submission.state.answers.map(
        (answer) => submission.state.questions[answer.questionId]?.prompt ?? answer.questionId,
      );
      const refill =
        submission.state.queue.length <= 3
          ? generateBatch(ref, 8, { avoid: new Set([...used, ...seenPrompts]) })
          : [];

      state = advance(submission.state, refill);
      guard += 1;
    }

    expect(state.score).toBe(100);
    expect(state.answers).toHaveLength(35);
    expect(seen.size).toBe(35);
  });
});
