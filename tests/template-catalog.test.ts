import { describe, expect, it } from 'vitest';
import { CURRICULUM } from '../src/practice/curriculum';
import { topicSubtopics } from '../src/practice/types';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';
import { createTemplateRegistry } from '../src/practice/templates/registry';
import { defineTemplate } from '../src/practice/templates/types';
import { getTopic } from '../src/practice/curriculum';
import { GRADE1_PLACEHOLDERS } from '../src/practice/templates/grade1-placeholders';
import { GRADE1_PLACEHOLDER_SPECS } from '../src/practice/templates/grade1-placeholders';
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

/**
 * Grade I is currently filled with placeholders pending the academy's real
 * questions. Several are fixed-wording multiple choice (true/false, "which is
 * flat?"), so they cannot reach a full session's worth of distinct variations
 * on their own. They must still offer a few, and the subtopic-level capacity
 * test is the one that guarantees a playable session.
 */
const isPlaceholder = (id: string): boolean => id.startsWith('g1-');
const PLACEHOLDER_MIN_VARIATIONS = 3;

describe('every template in the catalog', () => {
  for (const template of TEMPLATE_REGISTRY.all) {
    it(`${template.id} generates valid, non-repeating variations`, () => {
      const questions = previewTemplate(template.id, VARIATIONS_PER_TEMPLATE);
      // Every variation that *is* produced must be valid and distinct…
      expect(questions.length).toBeGreaterThan(0);
      const required = isPlaceholder(template.id)
        ? PLACEHOLDER_MIN_VARIATIONS
        : REQUIRED_VARIATIONS;

      const signatures = new Set<string>();
      for (const question of questions) {
        // Wording is fully rendered — no leftover "{a}" placeholders.
        expect(question.prompt).not.toMatch(/\{\w+\}/);
        expect(question.prompt.trim().length).toBeGreaterThan(0);
        expect(question.explanation.trim().length).toBeGreaterThan(0);

        // Distinct options, one of which is the answer. Most questions offer
        // four; true/false and three-way sorting offer fewer by design.
        const expectedOptions = template.optionCount ?? 4;
        expect(question.options).toHaveLength(expectedOptions);
        expect(new Set(question.options).size).toBe(expectedOptions);
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
          // Grade I is still placeholder content; see PLACEHOLDER_MIN_VARIATIONS.
          const required = grade.grade === 1 ? PLACEHOLDER_MIN_VARIATIONS : REQUIRED_VARIATIONS;
          const batch = generateBatch(ref, required);
          expect(
            batch.length,
            `${grade.grade}/${topic.id}/${subtopic.id} produced only ${batch.length}/${required} variations`,
          ).toBe(required);
          expect(new Set(batch.map((q) => q.signature)).size).toBe(required);
          expect(new Set(batch.map((q) => q.prompt)).size).toBe(required);
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

  it('unit metadata matches the curriculum for every template', () => {
    for (const template of TEMPLATE_REGISTRY.all) {
      const topic = getTopic(template.grade, template.topicId)!;
      const unit = topic.units.find((item) =>
        item.subtopics.some((subtopic) => subtopic.id === template.subtopicId),
      );

      expect(unit, `${template.id}: subtopic not found`).toBeDefined();
      expect(
        template.unitId,
        `${template.id} declares unit "${template.unitId}" but belongs to "${unit!.id}"`,
      ).toBe(unit!.id);
    }
  });

  it('every grade-1 placeholder prompt only uses variables it really draws', () => {
    // Checked against the built template, which is the actual contract — the
    // one-line spec table is only authoring sugar.
    const problems: string[] = [];

    for (const template of GRADE1_PLACEHOLDERS) {
      for (const match of template.prompt.matchAll(/\{(\w+)\}/g)) {
        if (!Object.prototype.hasOwnProperty.call(template.variables, match[1])) {
          problems.push(`${template.id} uses {${match[1]}}`);
        }
      }
    }

    expect(problems).toEqual([]);
  });

  it('has exactly one grade-1 placeholder per curriculum subtopic', () => {
    const grade1 = CURRICULUM.find((grade) => grade.grade === 1)!;
    const subtopics = grade1.topics.flatMap((topic) =>
      topicSubtopics(topic).map((subtopic) => `${topic.id}/${subtopic.id}`),
    );
    const covered = GRADE1_PLACEHOLDER_SPECS.map((spec) => `${spec.topicId}/${spec.subtopicId}`);

    expect(covered.sort()).toEqual(subtopics.sort());
    expect(subtopics).toHaveLength(113);
  });

  it('template ids are unique', () => {
    const ids = TEMPLATE_REGISTRY.all.map((template) => template.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
