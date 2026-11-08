import { describe, expect, it } from 'vitest';
import { CURRICULUM } from '../src/practice/curriculum';
import { topicSubtopics } from '../src/practice/types';
import { generateBatch, regenerateFromId } from '../src/practice/generator';
import { startSession, submitAnswer, advance } from '../src/practice/session';

describe('end to end: generate → play → restore', () => {
  it('every subtopic can be played and the answers are self-consistent', () => {
    let checked = 0;

    for (const grade of CURRICULUM) {
      for (const topic of grade.topics) {
        for (const subtopic of topicSubtopics(topic)) {
          const ref = { grade: grade.grade, topicId: topic.id, subtopicId: subtopic.id };
          const batch = generateBatch(ref, 5);
          expect(batch.length).toBe(5);

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

    expect(checked).toBe(42);
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
});
