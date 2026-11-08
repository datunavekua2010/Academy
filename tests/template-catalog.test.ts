import { describe, expect, it } from 'vitest';
import { CURRICULUM } from '../src/practice/curriculum';
import { topicSubtopics } from '../src/practice/types';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';
import { generateFromTemplate } from '../src/practice/templates/generate';
import { generateBatch, MIN_SESSION_VARIATIONS, previewTemplate } from '../src/practice/generator';

/**
 * Property tests across the whole catalog.
 *
 * These run every template in the app, not a hand-picked few, so a new
 * template that draws bad numbers or offers a duplicate option fails here
 * instead of reaching a student.
 */

const VARIATIONS_PER_TEMPLATE = 40;

/**
 * A single template may be legitimately finite (a 6–9 times table has 16
 * entries, a shape has 5 names). The guarantee is per *subtopic*: the templates
 * behind it must together fill a session without repeating.
 */
const REQUIRED_VARIATIONS = MIN_SESSION_VARIATIONS;

describe('every template in the catalog', () => {
  for (const template of TEMPLATE_REGISTRY.all) {
    it(`${template.id} generates valid, non-repeating variations`, () => {
      const questions = previewTemplate(template.id, VARIATIONS_PER_TEMPLATE);
      // Every variation that *is* produced must be valid and distinct…
      expect(questions.length).toBeGreaterThan(0);

      const signatures = new Set<string>();
      for (const question of questions) {
        // Wording is fully rendered — no leftover "{a}" placeholders.
        expect(question.prompt).not.toMatch(/\{\w+\}/);
        expect(question.prompt.trim().length).toBeGreaterThan(0);
        expect(question.explanation.trim().length).toBeGreaterThan(0);

        // Four distinct options, one of which is the answer.
        expect(question.options).toHaveLength(4);
        expect(new Set(question.options).size).toBe(4);
        expect(question.options).toContain(question.answer);

        // The question belongs to the template's curriculum address.
        expect(question.grade).toBe(template.grade);
        expect(question.topicId).toBe(template.topicId);
        expect(question.subtopicId).toBe(template.subtopicId);

        // Same numbers and wording twice in one session is not allowed.
        expect(signatures.has(question.signature)).toBe(false);
        signatures.add(question.signature);
      }
    });

    it(`${template.id} is reproducible from its id`, () => {
      const first = generateFromTemplate(template, { seed: 20260101 });
      const second = generateFromTemplate(template, { seed: 20260101 });
      expect(second.prompt).toBe(first.prompt);
      expect(second.answer).toBe(first.answer);
      expect(second.options).toEqual(first.options);
    });
  }
});

describe('curriculum coverage', () => {
  it('every grade → topic → subtopic has at least one template', () => {
    const missing: string[] = [];

    for (const grade of CURRICULUM) {
      for (const topic of grade.topics) {
        for (const subtopic of topicSubtopics(topic)) {
          const ref = { grade: grade.grade, topicId: topic.id, subtopicId: subtopic.id };
          if (!TEMPLATE_REGISTRY.hasTemplates(ref)) {
            missing.push(`${grade.grade}/${topic.id}/${subtopic.id}`);
          }
        }
      }
    }

    expect(missing).toEqual([]);
  });

  it('every subtopic can fill a real session without repeating a question', () => {
    for (const grade of CURRICULUM) {
      for (const topic of grade.topics) {
        for (const subtopic of topicSubtopics(topic)) {
          const ref = { grade: grade.grade, topicId: topic.id, subtopicId: subtopic.id };
          const batch = generateBatch(ref, REQUIRED_VARIATIONS);
          expect(
            batch.length,
            `${grade.grade}/${topic.id}/${subtopic.id} produced only ${batch.length}/${REQUIRED_VARIATIONS} variations`,
          ).toBe(REQUIRED_VARIATIONS);
          expect(new Set(batch.map((q) => q.signature)).size).toBe(REQUIRED_VARIATIONS);
          expect(new Set(batch.map((q) => q.prompt)).size).toBe(REQUIRED_VARIATIONS);
        }
      }
    }
  });

  it('templates match the curriculum ids they claim', () => {
    const known = new Set(
      CURRICULUM.flatMap((grade) =>
        grade.topics.flatMap((topic) =>
          topicSubtopics(topic).map((subtopic) => `${grade.grade}/${topic.id}/${subtopic.id}`),
        ),
      ),
    );

    for (const template of TEMPLATE_REGISTRY.all) {
      expect(
        known.has(`${template.grade}/${template.topicId}/${template.subtopicId}`),
        `${template.id} points at a subtopic that does not exist`,
      ).toBe(true);
    }
  });

  it('template ids are unique', () => {
    const ids = TEMPLATE_REGISTRY.all.map((template) => template.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
