import { describe, expect, it } from 'vitest';
import { CURRICULUM } from '../src/practice/curriculum';
import { topicSubtopics } from '../src/practice/types';
import { generateBatch } from '../src/practice/generator';
import { MAX_SCORE } from '../src/practice/scoring';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';

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

/**
 * Grade I is currently covered by placeholders (see grade1-placeholders.ts).
 * Some of them — true/false, "which of these is flat?" — are fixed-wording
 * multiple choice, so they genuinely have only one phrasing. They still have to
 * offer a few distinct questions so a session is not one item on loop.
 * When the academy's real templates replace them this minimum rises to 20.
 */
const PLACEHOLDER_MIN_UNIQUE = 3;

describe('subtopic capacity', () => {
  // This sweeps all 149 subtopics and asks each for 80 questions; it takes
  // seconds by nature, and the default 5s limit was tripped by ordinary
  // generation cost rather than by a failure.
  it('every subtopic has enough variety to fill a perfect run', { timeout: 120_000 }, () => {
    expect(MAX_SCORE).toBe(100);

    const tooNarrow: string[] = [];

    for (const grade of CURRICULUM) {
      for (const topic of grade.topics) {
        for (const subtopic of topicSubtopics(topic)) {
          const ref = { grade: grade.grade, topicId: topic.id, subtopicId: subtopic.id };

          // One generous batch is enough to see the whole pool: generateBatch
          // recycles only after it has run out of new wordings.
          // Identity is the signature, not the prompt. For a visual question
          // the wording is deliberately constant ("how many objects are
          // there?") and the content is the drawn row, so two pictures with
          // different objects are different questions even though the sentence
          // reads the same.
          const unique = new Set(
            generateBatch(ref, 80, { seed: 1 }).map((question) => question.signature),
          );

          // A subtopic is a placeholder only when nothing real covers it. The
          // old check asked whether every id started with "g1-", which was true
          // of the academy's own U01 and U02 libraries too and held them to the
          // placeholder bar of three.
          const templates = TEMPLATE_REGISTRY.forSubtopic(ref);
          const isPlaceholder =
            templates.length > 0 &&
            templates.every(
              (template) =>
                template.id === `g1-${subtopic.id}` || template.id === `g2-${subtopic.id}`,
            );
          const required = isPlaceholder ? PLACEHOLDER_MIN_UNIQUE : MIN_UNIQUE_QUESTIONS;

          if (unique.size < required) {
            tooNarrow.push(
              `${grade.grade}/${topic.id}/${subtopic.id}: ${unique.size} < ${required}`,
            );
          }
        }
      }
    }

    expect(tooNarrow).toEqual([]);
  });

  // Discovering a pool now means up to 80 distinct questions per subtopic,
  // where picture-based templates previously collapsed to a dozen repeated
  // wordings. That is more work for the same assertion, so the default 5s
  // budget is raised rather than the check weakened.
  it('never repeats a question before the subtopic pool is exhausted', { timeout: 40000 }, () => {
    // The guarantee the student actually feels: a repeat is only allowed once
    // every distinct wording in that subtopic has already been shown.
    for (const grade of CURRICULUM) {
      for (const topic of grade.topics) {
        for (const subtopic of topicSubtopics(topic)) {
          const ref = { grade: grade.grade, topicId: topic.id, subtopicId: subtopic.id };

          // Discover the full pool for this subtopic.
          const pool = new Set(
            generateBatch(ref, 80, { seed: 1 }).map((question) => question.signature),
          );

          // A session batch may only repeat after the pool runs out.
          const batch = generateBatch(ref, ANSWERS_PER_PERFECT_RUN, { seed: 77 });
          const seen = new Set<string>();
          for (const question of batch) {
            if (seen.has(question.signature)) {
              expect(
                seen.size,
                `${grade.grade}/${topic.id}/${subtopic.id} repeated before the pool was exhausted`,
              ).toBe(pool.size);
            }
            seen.add(question.signature);
          }
        }
      }
    }
  });
});
