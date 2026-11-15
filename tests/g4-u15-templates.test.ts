import { describe, expect, it } from 'vitest';
import {
  G4_U15_SUBTOPICS,
  G4_U15_TEMPLATES,
} from '../src/practice/templates/g4-u15-fractions';
import { hasTemplates, previewTemplate, generateBatch } from '../src/practice/generator';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';
import { startSession, submitAnswer, advance } from '../src/practice/session';
import { MAX_SCORE } from '../src/practice/scoring';

const SAMPLES = 18;

const templateFor = (id: string) => {
  const template = G4_U15_TEMPLATES.find((candidate) => candidate.id === id);
  if (!template) throw new Error(`no template ${id}`);
  return template;
};

describe('Grade 4 — U15: წილადები (Fractions)', () => {
  it('covers all 14 subtopics of U15', () => {
    expect(G4_U15_SUBTOPICS).toEqual([
      'u15-parts-of-whole',
      'u15-numerator-denominator',
      'u15-fractions-number-line',
      'u15-reciprocal-fractions',
      'u15-fraction-division',
      'u15-equivalent-fractions-problems',
      'u15-fraction-addition-same-denom',
      'u15-fraction-subtraction-same-denom',
      'u15-fraction-word-problems',
      'u15-fraction-multiplication-problems',
      'u15-simplifying-fractions',
      'u15-fraction-multiplication',
      'u15-equivalent-fractions',
      'u15-equivalent-fractions-visual',
    ]);
  });

  it('contains all 84 authored templates', () => {
    expect(G4_U15_TEMPLATES.length).toBe(84);
    for (const template of G4_U15_TEMPLATES) {
      expect(templateFor(template.id)).toBeDefined();
    }
  });

  it('every subtopic has 6 authored templates with levels 1, 2, and 3', () => {
    for (const subtopicId of G4_U15_SUBTOPICS) {
      const templates = G4_U15_TEMPLATES.filter((t) => t.subtopicId === subtopicId);
      expect(templates.length).toBe(6);
      const levels = new Set(templates.map((t) => t.difficulty));
      expect(levels.has(1), `${subtopicId} level 1`).toBe(true);
      expect(levels.has(2), `${subtopicId} level 2`).toBe(true);
      expect(levels.has(3), `${subtopicId} level 3`).toBe(true);
    }
  });

  it('registers every template in TEMPLATE_REGISTRY under grade 4 and topic g4-tsiladebi', () => {
    for (const template of G4_U15_TEMPLATES) {
      const found = TEMPLATE_REGISTRY.byId(template.id);
      expect(found, `template ${template.id} in registry`).toBeDefined();
      expect(found?.grade).toBe(4);
      expect(found?.topicId).toBe('g4-tsiladebi');
    }
  });

  it('every subtopic generates playable question batches from the registry', () => {
    for (const subtopicId of G4_U15_SUBTOPICS) {
      const ref = { grade: 4 as const, topicId: 'g4-tsiladebi', subtopicId };
      expect(hasTemplates(ref, TEMPLATE_REGISTRY), `playable: ${subtopicId}`).toBe(true);
      const batch = generateBatch(ref, 10, { registry: TEMPLATE_REGISTRY });
      expect(batch.length).toBeGreaterThanOrEqual(5);
    }
  });

  describe('template properties and variations', () => {
    for (const template of G4_U15_TEMPLATES) {
      it(`${template.id} generates valid, distinct variations without errors`, () => {
        const questions = previewTemplate(template.id, SAMPLES);
        expect(questions.length).toBeGreaterThanOrEqual(12);

        for (const q of questions) {
          expect(q.prompt).toBeTruthy();
          expect(q.prompt).not.toContain('{');
          expect(q.answer).toBeDefined();
          expect(q.explanation).toBeTruthy();

          if (q.options && q.options.length > 0) {
            expect(q.options).toContain(q.answer);
            const set = new Set(q.options);
            expect(set.size).toBe(q.options.length);
          }
        }
      });
    }
  });

  describe('full gameplay playthrough to MAX_SCORE on every subtopic', () => {
    for (const subtopicId of G4_U15_SUBTOPICS) {
      it(`subtopic ${subtopicId} completes a full session to 100 points`, () => {
        const ref = { grade: 4 as const, topicId: 'g4-tsiladebi', subtopicId };
        let state = startSession(ref, generateBatch(ref, 6, { seed: 42, registry: TEMPLATE_REGISTRY }));
        let steps = 0;

        while (state.score < MAX_SCORE && steps < 50) {
          const currentId = state.queue[0];
          expect(currentId).toBeDefined();
          const question = state.questions[currentId];
          const submission = submitAnswer(state, question.answer);
          if (!submission) break;
          expect(submission.result.correct).toBe(true);
          state = submission.state;

          let refill: ReturnType<typeof generateBatch> = [];
          if (state.queue.length <= 2) {
            const avoid = new Set(state.answers.map((a) => a.questionId));
            refill = generateBatch(ref, 6, { avoid, registry: TEMPLATE_REGISTRY });
          }
          state = advance(state, refill);
          steps += 1;
        }

        expect(state.score).toBe(MAX_SCORE);
      });
    }
  });
});
