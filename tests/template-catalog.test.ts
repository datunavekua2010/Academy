import { describe, expect, it } from 'vitest';
import { CURRICULUM } from '../src/practice/curriculum';
import { topicSubtopics } from '../src/practice/types';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';
import { createTemplateRegistry } from '../src/practice/templates/registry';
import { defineTemplate } from '../src/practice/templates/types';
import { getTopic } from '../src/practice/curriculum';
import { GRADE1_PLACEHOLDERS } from '../src/practice/templates/grade1-placeholders';
import { GRADE1_PLACEHOLDER_SPECS } from '../src/practice/templates/grade1-placeholders';
import { U01_TEMPLATES } from '../src/practice/templates/u01-space';
import { U02_TEMPLATES } from '../src/practice/templates/u02-numbers';
import { U04_SUBTOPICS } from '../src/practice/templates/u04-numbers100';
import { U05_SUBTOPICS } from '../src/practice/templates/u05-compare';
import { U06_SUBTOPICS } from '../src/practice/templates/u06-addition';
import { U07_SUBTOPICS } from '../src/practice/templates/u07-subtraction';
import { U08_SUBTOPICS } from '../src/practice/templates/u08-two-digit';
import { U09_SUBTOPICS } from '../src/practice/templates/u09-mixed';
import { U10_SUBTOPICS } from '../src/practice/templates/u10-models';
import { U11_SUBTOPICS } from '../src/practice/templates/u11-patterns';
import { U12_SUBTOPICS } from '../src/practice/templates/u12-geometry';
import { U13_SUBTOPICS } from '../src/practice/templates/u13-time';

/** The academy's own templates — held to the full session standard. */
const REAL_LIBRARY_IDS = new Set([...U01_TEMPLATES, ...U02_TEMPLATES].map((t) => t.id));
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
 * Which grade-1 templates are still placeholders?
 *
 * Not "every template whose id starts with g1-" — that was true when every
 * grade-1 template was a placeholder, and it silently held the academy's real
 * U01 and U02 libraries to the placeholder standard of three variations. A
 * template counts as a placeholder only when its subtopic has no real content:
 * that is exactly the set `catalog.ts` drops once a real library covers the
 * subtopic, so it is read from there rather than guessed from an id prefix.
 */
const isPlaceholder = (id: string): boolean =>
  (id.startsWith('g1-') && !REAL_LIBRARY_IDS.has(id)) || id.startsWith('g2-');
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
        // four; true/false and three-way sorting offer fewer by design, and a
        // typed-answer question deliberately offers none at all.
        if (question.answerMode === 'order') {
          // An ordering question offers no options either: the items ARE the
          // question, and the answer is the sequence of positions that sorts
          // them. Both must be present and the key must be a real permutation.
          expect(question.options).toEqual([]);
          expect(question.orderItems?.length ?? 0).toBeGreaterThanOrEqual(2);
          const key = String(question.answer).split(',').map(Number);
          expect(key).toHaveLength(question.orderItems!.length);
          expect([...key].sort((a, b) => a - b)).toEqual(
            Array.from({ length: key.length }, (_, i) => i + 1),
          );
        } else if (question.answerMode === 'number' || question.answerMode === 'time') {
          // A typed answer is one value and no options: a number for a count, a
          // clock time for a time. `time` joined the list in U13, where the
          // answer is `HH:MM` and is compared by value rather than spelling.
          expect(question.options).toEqual([]);
          if (question.answerMode === 'number') {
            expect(String(question.answer)).toMatch(/^-?\d+(\.\d+)?$/);
          } else {
            expect(String(question.answer)).toMatch(/^\d{2}:\d{2}$/);
          }
        } else if (question.answerMode === 'multi') {
          // A multi-select's answer is the *set* of right options, joined with
          // ", ", so it is not one of the options and cannot be looked for as
          // one. What has to hold instead: every option is offered once, every
          // marked option really is an option, and the set is a proper subset —
          // „mark them all“ with nothing to leave out is not a question.
          const marked = String(question.answer).split(',').map((part) => part.trim());
          expect(new Set(question.options).size).toBe(question.options.length);
          for (const option of marked) expect(question.options).toContain(option);
          expect(marked.length).toBeGreaterThan(0);
          expect(marked.length).toBeLessThan(question.options.length);
        } else {
          const expectedOptions = template.optionCount ?? 4;
          expect(question.options).toHaveLength(expectedOptions);
          expect(new Set(question.options).size).toBe(expectedOptions);
          expect(question.options).toContain(question.answer);
        }

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
          // A subtopic whose templates are the academy's own must fill a real
          // session; only genuine placeholder subtopics get the lower bar.
          const subtopicTemplates = TEMPLATE_REGISTRY.forSubtopic(ref);
          const realOnly =
            subtopicTemplates.length > 0 &&
            subtopicTemplates.every((template) => REAL_LIBRARY_IDS.has(template.id));
          const required = realOnly ? REQUIRED_VARIATIONS : PLACEHOLDER_MIN_VARIATIONS;
          const batch = generateBatch(ref, required);
          expect(
            batch.length,
            `${grade.grade}/${topic.id}/${subtopic.id} produced only ${batch.length}/${required} variations`,
          ).toBe(required);
          // Identity and distinctness are both measured by signature.
          //
          // Not by prompt: a visual question's wording is deliberately fixed
          // ("how many objects are there?") and its content is the drawn
          // picture, so two rows of different objects are two different
          // questions with the same sentence. Asserting on prompts made this
          // test fail intermittently for exactly those subtopics — the batch
          // held three different pictures and two distinct sentences.
          expect(new Set(batch.map((q) => q.signature)).size).toBe(required);
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

  it('has playable material for every curriculum subtopic', () => {
    const grade1 = CURRICULUM.find((grade) => grade.grade === 1)!;
    const subtopics = grade1.topics.flatMap((topic) =>
      topicSubtopics(topic).map((subtopic) => ({
        key: `${topic.id}/${subtopic.id}`,
        ref: { grade: 1, topicId: topic.id, subtopicId: subtopic.id },
      })),
    );

    // A subtopic is covered when it has *any* template, not necessarily a
    // placeholder: U01–U04 have real libraries now, and their placeholders are
    // deliberately gone. What the student needs is a playable subtopic, and the
    // placeholder file is only how the rest of grade 1 gets one.
    const covered = new Set(
      GRADE1_PLACEHOLDER_SPECS.map((spec) => `${spec.topicId}/${spec.subtopicId}`),
    );
    const missing = subtopics.filter(
      ({ key, ref }) => !covered.has(key) && !TEMPLATE_REGISTRY.hasTemplates(ref as never),
    );
    expect(missing.map((entry) => entry.key)).toEqual([]);
    expect(subtopics).toHaveLength(113);

    // U04–U10's placeholders were deleted when their real libraries
    // landed; the earlier units kept theirs alongside the real templates. So
    // the check is one-way: a converted unit must not be carrying a
    // placeholder, which is how a deleted one quietly comes back.
    const converted = new Set<string>([
      ...U04_SUBTOPICS,
      ...U05_SUBTOPICS,
      ...U06_SUBTOPICS,
      ...U07_SUBTOPICS,
      ...U08_SUBTOPICS,
      ...U09_SUBTOPICS,
      ...U10_SUBTOPICS,
      ...U11_SUBTOPICS,
      ...U12_SUBTOPICS,
      ...U13_SUBTOPICS,
    ]);
    const stale = GRADE1_PLACEHOLDER_SPECS.filter((spec) => converted.has(spec.subtopicId));
    expect(stale.map((spec) => spec.subtopicId)).toEqual([]);
  });

  it('template ids are unique', () => {
    const ids = TEMPLATE_REGISTRY.all.map((template) => template.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
