import { describe, expect, it } from 'vitest';
import {
  G5_U15_SUBTOPICS,
  G5_U15_TEMPLATES,
} from '../src/practice/templates/g5-u15-geometry';
import { generateBatch, previewTemplate } from '../src/practice/generator';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';

/**
 * Grade V — Unit 15: geometry.
 *
 * The unit's risk is not arithmetic but *sameness*: half the bank is
 * definitional („how many faces does a cube have?“), and a definition has one
 * answer. A subtopic has to fill a twelve-question session without repeating,
 * so these tests hold the conversion to that bar rather than to „it compiles“.
 */

const TOPIC = 'g5-geometry';

const ref = (subtopicId: string) =>
  ({ grade: 5 as const, topicId: TOPIC, subtopicId });

describe('G5 U15 — library shape', () => {
  it('covers every subtopic of the unit', () => {
    expect(G5_U15_SUBTOPICS).toHaveLength(15);
    const templated = new Set(G5_U15_TEMPLATES.map((template) => template.subtopicId));
    for (const subtopicId of G5_U15_SUBTOPICS) {
      expect(templated.has(subtopicId), `${subtopicId} has no templates`).toBe(true);
    }
  });

  it('addresses the geometry topic only, under grade 5', () => {
    for (const template of G5_U15_TEMPLATES) {
      expect(template.grade, template.id).toBe(5);
      expect(template.topicId, template.id).toBe(TOPIC);
      expect(G5_U15_SUBTOPICS, template.id).toContain(template.subtopicId);
      expect(template.id, template.id).toMatch(/^g5-u15-q\d{2}$/);
    }
  });

  it('has unique ids that do not collide with the placeholder namespace', () => {
    const ids = G5_U15_TEMPLATES.map((template) => template.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).not.toMatch(/^g5-u15-\d+$/);
  });

  it('is registered, and its placeholders are retired', () => {
    for (const subtopicId of G5_U15_SUBTOPICS) {
      const ids = TEMPLATE_REGISTRY.forSubtopic(ref(subtopicId)).map((template) => template.id);
      expect(ids.length, subtopicId).toBeGreaterThan(0);
      expect(ids, subtopicId).not.toContain(`g5-${subtopicId}`);
    }
  });
});

describe('G5 U15 — every template is sound', () => {
  for (const template of G5_U15_TEMPLATES) {
    it(`${template.id} draws valid, distinct variations`, () => {
      const questions = previewTemplate(template.id, 12);
      expect(questions.length).toBe(12);

      for (const question of questions) {
        expect(question.prompt, template.id).not.toMatch(/\{\w+\}/);
        expect(question.prompt.trim().length, template.id).toBeGreaterThan(0);
        expect(question.explanation.trim().length, template.id).toBeGreaterThan(0);

        // The explanation must quote the answer it is explaining, or it is not
        // an explanation of *this* variation.
        expect(question.explanation, `${template.id} does not state its answer`)
          .toContain(question.answer);

        if (question.answerMode !== 'choice') continue;
        expect(question.options.length, template.id).toBeGreaterThanOrEqual(2);
        expect(new Set(question.options).size, `${template.id}: duplicate option`)
          .toBe(question.options.length);
        expect(question.options, `${template.id}: answer missing`).toContain(question.answer);
      }
    });
  }
});

describe('G5 U15 — a session can be filled without repeating', () => {
  for (const subtopicId of G5_U15_SUBTOPICS) {
    it(`${subtopicId} yields 12 distinct questions`, () => {
      const batch = generateBatch(ref(subtopicId), 12, { seed: 20260115 });
      expect(batch.length).toBe(12);
      expect(new Set(batch.map((question) => question.signature)).size).toBe(12);
    });
  }
});

describe('G5 U15 — units of measure and arithmetic', () => {
  it('never states a negative or zero length, area or perimeter', () => {
    for (const template of G5_U15_TEMPLATES) {
      for (const question of previewTemplate(template.id, 8)) {
        const number = Number(question.answer.replace(',', '.'));
        if (Number.isFinite(number)) {
          expect(number, `${template.id}: "${question.prompt}"`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('re-derives the area of a right triangle from the printed legs', () => {
    for (const question of generateBatch(ref('u15-14'), 12, { seed: 616161 })) {
      const template = G5_U15_TEMPLATES.find((item) => item.id === question.templateId)!;
      if (template?.id !== 'g5-u15-q59') continue;
      const legs = (question.prompt.match(/(\d+) სმ/g) ?? []).map((part) => Number(part.replace(' სმ', '')));
      expect(legs.length, question.prompt).toBeGreaterThanOrEqual(2);
      expect(Number(question.answer)).toBe((legs[0]! * legs[1]!) / 2);
    }
  });

  it('re-derives a rectangle perimeter as 2 × (a + b)', () => {
    for (const question of generateBatch(ref('u15-12'), 12, { seed: 717171 })) {
      if (question.templateId !== 'g5-u15-q50') continue;
      const [a, b] = (question.prompt.match(/(\d+) სმ/g) ?? []).map((part) => Number(part.replace(' სმ', '')));
      expect(Number(question.answer)).toBe(2 * (a! + b!));
    }
  });
});
