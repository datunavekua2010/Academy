import { describe, expect, it } from 'vitest';
import {
  G2_U04_SUBTOPICS,
  G2_U04_TEMPLATES,
  repeatEmoji,
  nearMisses,
} from '../src/practice/templates/g2-u04-two-digit-addition';
import { hasTemplates, previewTemplate } from '../src/practice/generator';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';
import { startSession, submitAnswer, advance } from '../src/practice/session';
import { generateBatch } from '../src/practice/generator';
import { MAX_SCORE } from '../src/practice/scoring';

const SAMPLES = 10;

const templateFor = (id: string) => {
  const template = G2_U04_TEMPLATES.find((candidate) => candidate.id === id);
  if (!template) throw new Error(`no template ${id}`);
  return template;
};

describe('Grade 2 — U04: ორნიშნა რიცხვების შეკრება', () => {
  it('covers all 10 subtopics of U04', () => {
    expect(G2_U04_SUBTOPICS).toEqual([
      'u04-adding-tens',
      'u04-without-regrouping',
      'u04-with-regrouping',
      'u04-addition-table-100',
      'u04-ways-to-make-number',
      'u04-word-problems-expressions',
      'u04-missing-addend',
      'u04-comparing-examples',
      'u04-adding-three-numbers',
      'u04-missing-digits',
    ]);
  });

  it('contains all core authored templates (Q01–Q60) and extension templates (Q61–Q64)', () => {
    expect(G2_U04_TEMPLATES.length).toBeGreaterThanOrEqual(60);
    for (let i = 1; i <= 60; i += 1) {
      const id = `g2-u04-${String(i).padStart(2, '0')}`;
      expect(templateFor(id)).toBeDefined();
    }
  });

  it('every subtopic has authored templates for levels 1, 2, and 3', () => {
    for (const subtopicId of G2_U04_SUBTOPICS) {
      const templates = G2_U04_TEMPLATES.filter((t) => t.subtopicId === subtopicId);
      const levels = new Set(templates.map((t) => t.difficulty));
      expect(levels.has(1), `${subtopicId} level 1`).toBe(true);
      expect(levels.has(2), `${subtopicId} level 2`).toBe(true);
      expect(levels.has(3), `${subtopicId} level 3`).toBe(true);
    }
  });

  it('every subtopic is registered in the TEMPLATE_REGISTRY and playable', () => {
    for (const subtopicId of G2_U04_SUBTOPICS) {
      const ref = { grade: 2 as const, topicId: 'g2-ornishna-sekreba', subtopicId };
      expect(hasTemplates(ref, TEMPLATE_REGISTRY), `playable: ${subtopicId}`).toBe(true);
      const batch = generateBatch(ref, 10, { registry: TEMPLATE_REGISTRY });
      expect(batch.length).toBeGreaterThanOrEqual(5);
    }
  });

  describe('helpers', () => {
    it('repeatEmoji repeats the emoji count times', () => {
      expect(repeatEmoji('📦', 3)).toBe('📦 📦 📦');
      expect(repeatEmoji('🍎', 0)).toBe('');
    });

    it('nearMisses produces distinct values', () => {
      const misses = nearMisses(40, 3, 10, 10);
      expect(misses).toHaveLength(3);
      expect(new Set(misses).size).toBe(3);
      expect(misses.every((x) => x >= 10 && x !== 40)).toBe(true);
    });
  });

  describe('template properties and variations', () => {
    for (const template of G2_U04_TEMPLATES) {
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
    for (const subtopicId of G2_U04_SUBTOPICS) {
      it(`subtopic ${subtopicId} completes a full session to 100 points`, () => {
        const ref = { grade: 2 as const, topicId: 'g2-ornishna-sekreba', subtopicId };
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
            refill = generateBatch(ref, 4);
          }
          state = advance(state, refill);
          steps += 1;
        }

        expect(state.score).toBe(MAX_SCORE);
      });
    }
  });
});
