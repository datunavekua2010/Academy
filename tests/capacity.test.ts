import { describe, expect, it } from 'vitest';
import { CURRICULUM } from '../src/practice/curriculum';
import { topicSubtopics } from '../src/practice/types';
import { generateBatch } from '../src/practice/generator';
import { MAX_SCORE } from '../src/practice/scoring';

/**
 * A perfect run needs 35 correct answers (20×4 + 5×2 + 10×1).
 *
 * Some topics are genuinely finite — a shape has one side count — so a subtopic
 * does not need 35 *unlimited* wordings, but it does need enough variety that a
 * session is not a handful of questions on loop. The engine recycles only after
 * the whole pool is used, oldest first, so repeats are maximally spaced.
 *
 * This is a content requirement, not an engine one: when the academy supplies
 * its own templates, this test names the subtopics that are too narrow.
 */
const ANSWERS_PER_PERFECT_RUN = 35;
const MIN_UNIQUE_QUESTIONS = 20;

describe('subtopic capacity', () => {
  it('every subtopic has enough variety to fill a perfect run', () => {
    expect(MAX_SCORE).toBe(100);

    const tooNarrow: string[] = [];

    for (const grade of CURRICULUM) {
      for (const topic of grade.topics) {
        for (const subtopic of topicSubtopics(topic)) {
          const ref = { grade: grade.grade, topicId: topic.id, subtopicId: subtopic.id };

          // One generous batch is enough to see the whole pool: generateBatch
          // recycles only after it has run out of new wordings.
          const unique = new Set(
            generateBatch(ref, 80, { seed: 1 }).map((question) => question.prompt),
          );

          if (unique.size < MIN_UNIQUE_QUESTIONS) {
            tooNarrow.push(
              `${grade.grade}/${topic.id}/${subtopic.id}: ${unique.size} < ${MIN_UNIQUE_QUESTIONS}`,
            );
          }
        }
      }
    }

    expect(tooNarrow).toEqual([]);
  });

  it('never repeats a question before the subtopic pool is exhausted', () => {
    // The guarantee the student actually feels: a repeat is only allowed once
    // every distinct wording in that subtopic has already been shown.
    for (const grade of CURRICULUM) {
      for (const topic of grade.topics) {
        for (const subtopic of topicSubtopics(topic)) {
          const ref = { grade: grade.grade, topicId: topic.id, subtopicId: subtopic.id };

          // Discover the full pool for this subtopic.
          const pool = new Set(
            generateBatch(ref, 80, { seed: 1 }).map((question) => question.prompt),
          );

          // A session batch may only repeat after the pool runs out.
          const batch = generateBatch(ref, ANSWERS_PER_PERFECT_RUN, { seed: 77 });
          const seen = new Set<string>();
          for (const question of batch) {
            if (seen.has(question.prompt)) {
              expect(
                seen.size,
                `${grade.grade}/${topic.id}/${subtopic.id} repeated before the pool was exhausted`,
              ).toBe(pool.size);
            }
            seen.add(question.prompt);
          }
        }
      }
    }
  });
});
