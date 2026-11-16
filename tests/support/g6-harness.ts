import { describe, expect, it } from 'vitest';
import type { QuestionTemplate } from '../../src/practice/templates/types';
import { previewTemplate, generateBatch } from '../../src/practice/generator';
import type { GeneratedQuestion } from '../../src/practice/templates/generate';

/**
 * The checks every Grade VI unit library has to pass, whatever it teaches.
 * A unit's own test file adds the *independent re-derivation*: it parses the
 * printed prompt and recomputes the key a second way.
 */
export const standardSuite = (opts: {
  unit: string;
  topic: string;
  subtopics: readonly string[];
  templates: QuestionTemplate[];
  idPattern: RegExp;
  /** 6 unless the library is a Grade VII one. */
  grade?: 6 | 7;
  /** Subtopic ids that must reach the 20-question bar the capacity test applies. */
  minUnique?: number;
}): void => {
  const { unit, topic, subtopics, templates, idPattern } = opts;
  const minUnique = opts.minUnique ?? 20;
  const grade = opts.grade ?? 6;

  describe(`G${grade} ${unit} — library shape`, () => {
    it('covers every subtopic of the unit', () => {
      const templated = new Set(templates.map((template) => template.subtopicId));
      for (const subtopicId of subtopics) {
        expect(templated.has(subtopicId), `${subtopicId} has no templates`).toBe(true);
      }
    });

    it('addresses the unit topic only, under its own grade', () => {
      for (const template of templates) {
        expect(template.grade, template.id).toBe(grade);
        expect(template.topicId, template.id).toBe(topic);
        expect(subtopics, template.id).toContain(template.subtopicId);
        expect(template.id, template.id).toMatch(idPattern);
      }
    });

    it('has unique ids and no prompt without a placeholder', () => {
      const ids = templates.map((template) => template.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const template of templates) {
        expect(template.prompt, `${template.id}: fixed prompt`).toMatch(/\{\w+\}/);
      }
    });
  });

  describe(`G${grade} ${unit} — every template renders a usable question`, () => {
    for (const template of templates) {
      it(`${template.id} keeps its promises`, () => {
        const draws = previewTemplate(template.id, 25);
        expect(draws.length, `${template.id}: too few usable draws`).toBeGreaterThan(3);
        const optionCount = template.optionCount ?? 4;
        for (const draw of draws) {
          expect(draw.options.length, `${template.id}: option count`).toBe(optionCount);
          expect(new Set(draw.options).size, `${template.id}: duplicate option`).toBe(draw.options.length);
          expect(draw.options, `${template.id}: answer missing`).toContain(draw.answer);
          expect(draw.explanation, `${template.id}: explanation omits its answer`).toContain(draw.answer);
          expect(draw.prompt, `${template.id}: unresolved placeholder`).not.toMatch(/\{\w+\}/);
        }
      });
    }
  });

  describe(`G${grade} ${unit} — conventions`, () => {
    it('never prints a caret, a hyphen minus, a decimal point, NaN or undefined', () => {
      for (const template of templates) {
        for (const draw of previewTemplate(template.id, 25)) {
          const shown = [draw.prompt, draw.answer, draw.explanation, ...draw.options].join(' | ');
          expect(shown, `${template.id}: caret`).not.toMatch(/\^/);
          expect(shown, `${template.id}: hyphen minus`).not.toMatch(/(^|[\s(;,|])-\d/);
          expect(shown, `${template.id}: decimal point`).not.toMatch(/\d\.\d/);
          expect(shown, `${template.id}: bad value`).not.toMatch(/NaN|undefined|Infinity|\[object/);
        }
      }
    });
  });

  describe(`G${grade} ${unit} — a session can be filled without repeating`, () => {
    for (const subtopicId of subtopics) {
      it(`${subtopicId} yields ${minUnique} distinct questions`, () => {
        const ref = { grade, topicId: topic, subtopicId };
        const batch = generateBatch(ref, 80, { seed: 1 });
        expect(new Set(batch.map((question) => question.signature)).size).toBeGreaterThanOrEqual(minUnique);
        const session = generateBatch(ref, 12, { seed: 20260117 });
        expect(session.length).toBe(12);
        expect(new Set(session.map((question) => question.signature)).size).toBe(12);
      });
    }
  });
};

export type Draw = GeneratedQuestion;

/** Runs `check` over many draws of one template. */
export const eachDraw = (id: string, check: (draw: Draw) => void, count = 40): void => {
  const draws = previewTemplate(id, count);
  expect(draws.length, `${id}: no draws`).toBeGreaterThan(0);
  for (const draw of draws) check(draw);
};
