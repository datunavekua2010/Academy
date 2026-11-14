import { describe, expect, it } from 'vitest';
import {
  G2_U09_SUBTOPICS,
  G2_U09_TEMPLATES,
  roundToNearest5,
  roundToNearest10,
  roundToNearest20,
  nearMisses,
} from '../src/practice/templates/g2-u09-rounding';
import { hasTemplates, previewTemplate } from '../src/practice/generator';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';
import { startSession, submitAnswer, advance } from '../src/practice/session';
import { generateBatch } from '../src/practice/generator';
import { MAX_SCORE } from '../src/practice/scoring';

const SAMPLES = 18;

const templateFor = (id: string) => {
  const template = G2_U09_TEMPLATES.find((candidate) => candidate.id === id);
  if (!template) throw new Error(`no template ${id}`);
  return template;
};

describe('Grade 2 — U09: დამრგვალება (Rounding)', () => {
  it('covers all 5 subtopics of U09', () => {
    expect(G2_U09_SUBTOPICS).toEqual([
      'u09-nearest-5',
      'u09-nearest-10',
      'u09-nearest-20',
      'u09-rounding-sums',
      'u09-rounding-differences',
    ]);
  });

  it('contains all 30 authored templates (Q01–Q30)', () => {
    expect(G2_U09_TEMPLATES.length).toBe(30);
    for (let i = 1; i <= 30; i += 1) {
      const id = `g2-u09-${String(i).padStart(2, '0')}`;
      expect(templateFor(id)).toBeDefined();
    }
  });

  it('every subtopic has authored templates for levels 1, 2, and 3', () => {
    for (const subtopicId of G2_U09_SUBTOPICS) {
      const templates = G2_U09_TEMPLATES.filter((t) => t.subtopicId === subtopicId);
      const levels = new Set(templates.map((t) => t.difficulty));
      expect(levels.has(1), `${subtopicId} level 1`).toBe(true);
      expect(levels.has(2), `${subtopicId} level 2`).toBe(true);
      expect(levels.has(3), `${subtopicId} level 3`).toBe(true);
    }
  });

  it('every subtopic is registered in the TEMPLATE_REGISTRY and playable', () => {
    for (const subtopicId of G2_U09_SUBTOPICS) {
      const ref = { grade: 2 as const, topicId: 'g2-damrgvaleba', subtopicId };
      expect(hasTemplates(ref, TEMPLATE_REGISTRY), `playable: ${subtopicId}`).toBe(true);
      const batch = generateBatch(ref, 10, { registry: TEMPLATE_REGISTRY });
      expect(batch.length).toBeGreaterThanOrEqual(5);
    }
  });

  describe('rounding helpers', () => {
    it('roundToNearest5 rounds properly and breaks ties upwards', () => {
      expect(roundToNearest5(12)).toBe(10);
      expect(roundToNearest5(13)).toBe(15);
      expect(roundToNearest5(17)).toBe(15);
      expect(roundToNearest5(18)).toBe(20);
      expect(roundToNearest5(20)).toBe(20);
      expect(roundToNearest5(25)).toBe(25);
    });

    it('roundToNearest10 rounds properly and rounds 5 up', () => {
      expect(roundToNearest10(14)).toBe(10);
      expect(roundToNearest10(15)).toBe(20);
      expect(roundToNearest10(25)).toBe(30);
      expect(roundToNearest10(42)).toBe(40);
      expect(roundToNearest10(48)).toBe(50);
      expect(roundToNearest10(70)).toBe(70);
    });

    it('roundToNearest20 rounds properly and breaks ties upwards', () => {
      expect(roundToNearest20(8)).toBe(0);
      expect(roundToNearest20(10)).toBe(20); // halfway -> up
      expect(roundToNearest20(12)).toBe(20);
      expect(roundToNearest20(28)).toBe(20);
      expect(roundToNearest20(30)).toBe(40); // halfway -> up
      expect(roundToNearest20(35)).toBe(40);
      expect(roundToNearest20(50)).toBe(60); // halfway -> up
      expect(roundToNearest20(80)).toBe(80);
    });

    it('nearMisses produces distinct values', () => {
      const misses = nearMisses(40, 3, 5, 0);
      expect(misses).toHaveLength(3);
      expect(new Set(misses).size).toBe(3);
      expect(misses.every((x) => x >= 0 && x !== 40)).toBe(true);
    });
  });

  describe('template properties and variations', () => {
    for (const template of G2_U09_TEMPLATES) {
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
    for (const subtopicId of G2_U09_SUBTOPICS) {
      it(`subtopic ${subtopicId} completes a full session to 100 points`, () => {
        const ref = { grade: 2 as const, topicId: 'g2-damrgvaleba', subtopicId };
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
