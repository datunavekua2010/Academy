import { describe, expect, it } from 'vitest';
import {
  G2_U08_SUBTOPICS,
  G2_U08_TEMPLATES,
  nearMisses,
} from '../src/practice/templates/g2-u08-multistep-problems';
import { hasTemplates, previewTemplate } from '../src/practice/generator';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';
import { startSession, submitAnswer, advance } from '../src/practice/session';
import { generateBatch } from '../src/practice/generator';
import { MAX_SCORE } from '../src/practice/scoring';

const SAMPLES = 18;

const templateFor = (id: string) => {
  const template = G2_U08_TEMPLATES.find((candidate) => candidate.id === id);
  if (!template) throw new Error(`no template ${id}`);
  return template;
};

describe('Grade 2 — U08: მრავალსაფეხურიანი ამოცანები (Multi-step Problems)', () => {
  it('covers all 12 subtopics of U08', () => {
    expect(G2_U08_SUBTOPICS).toEqual([
      'u08-equalizing-sums-diffs',
      'u08-ways-to-add-subtract',
      'u08-true-false-equalities',
      'u08-add-subtract-within-100',
      'u08-table-rules-100',
      'u08-placing-plus-minus',
      'u08-which-in-order',
      'u08-word-problems-multistep',
      'u08-equalizing-quantities',
      'u08-distance-problems',
      'u08-brackets',
      'u08-sorting-add-subtract',
    ]);
  });

  it('contains all 60 authored templates (Q01–Q60)', () => {
    expect(G2_U08_TEMPLATES.length).toBe(60);
    for (let i = 1; i <= 60; i += 1) {
      const id = `g2-u08-${String(i).padStart(2, '0')}`;
      expect(templateFor(id)).toBeDefined();
    }
  });

  it('every subtopic has authored templates for levels 1, 2, and 3', () => {
    for (const subtopicId of G2_U08_SUBTOPICS) {
      const templates = G2_U08_TEMPLATES.filter((t) => t.subtopicId === subtopicId);
      const levels = new Set(templates.map((t) => t.difficulty));
      expect(levels.has(1), `${subtopicId} level 1`).toBe(true);
      expect(levels.has(2), `${subtopicId} level 2`).toBe(true);
      expect(levels.has(3), `${subtopicId} level 3`).toBe(true);
    }
  });

  it('every subtopic is registered in the TEMPLATE_REGISTRY and playable', () => {
    for (const subtopicId of G2_U08_SUBTOPICS) {
      const ref = { grade: 2 as const, topicId: 'g2-mravalnabijiani-amocanebi', subtopicId };
      expect(hasTemplates(ref, TEMPLATE_REGISTRY), `playable: ${subtopicId}`).toBe(true);
      const batch = generateBatch(ref, 10, { registry: TEMPLATE_REGISTRY });
      expect(batch.length).toBeGreaterThanOrEqual(5);
    }
  });

  describe('helpers', () => {
    it('nearMisses produces distinct values', () => {
      const misses = nearMisses(40, 3, 10, 1);
      expect(misses).toHaveLength(3);
      expect(new Set(misses).size).toBe(3);
      expect(misses.every((x) => x >= 10 && x !== 40)).toBe(true);
    });
  });

  describe('template properties and variations', () => {
    for (const template of G2_U08_TEMPLATES) {
      it(`${template.id} generates valid, distinct variations without errors`, () => {
        const questions = previewTemplate(template.id, SAMPLES);
        expect(questions.length).toBeGreaterThanOrEqual(1);

        for (const q of questions) {
          expect(q.prompt).toBeTruthy();
          expect(q.prompt).not.toContain('{');
          expect(q.answer).toBeDefined();
          expect(q.explanation).toBeTruthy();

          if (q.options && q.options.length > 0) {
            // Options must contain the answer and be unique
            expect(q.options).toContain(q.answer);
            const set = new Set(q.options);
            expect(set.size).toBe(q.options.length);
          }
        }
      });
    }
  });

  describe('full gameplay playthrough to MAX_SCORE on every subtopic', () => {
    for (const subtopicId of G2_U08_SUBTOPICS) {
      it(`subtopic ${subtopicId} completes a full session to 100 points`, () => {
        const ref = { grade: 2 as const, topicId: 'g2-mravalnabijiani-amocanebi', subtopicId };
        let state = startSession(ref, generateBatch(ref, 6, { seed: 42 }));
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
            refill = generateBatch(ref, 6, { avoid });
          }
          state = advance(state, refill);
          steps += 1;
        }

        expect(state.score).toBe(MAX_SCORE);
      });
    }
  });
});
