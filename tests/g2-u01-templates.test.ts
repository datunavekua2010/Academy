import { describe, expect, it } from 'vitest';
import {
  G2_U01_SUBTOPICS,
  G2_U01_TEMPLATES,
  chartSnippet,
  drawFaultyGridSnippet,
  blockModelVisual,
  numberLineSnippet,
} from '../src/practice/templates/g2-u01-numbers100';
import { generateVariations } from '../src/practice/templates/generate';
import { hasTemplates, previewTemplate } from '../src/practice/generator';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';
import { startSession, submitAnswer, advance } from '../src/practice/session';
import { generateBatch } from '../src/practice/generator';
import { MAX_SCORE } from '../src/practice/scoring';

const SAMPLES = 10;
const SEED = 20261105;

const templateFor = (id: string) => {
  const template = G2_U01_TEMPLATES.find((candidate) => candidate.id === id);
  if (!template) throw new Error(`no template ${id}`);
  return template;
};

describe('Grade 2 — U01: რიცხვები 100-ის ფარგლებში', () => {
  it('covers all 8 subtopics of U01', () => {
    expect(G2_U01_SUBTOPICS).toEqual([
      'u01-hundred-chart',
      'u01-numbers-in-words',
      'u01-ordinal-numbers',
      'u01-tens-and-ones',
      'u01-before-and-after',
      'u01-number-line-100',
      'u01-largest-and-smallest',
      'u01-roman-numerals',
    ]);
  });

  it('contains exactly 60 authored templates (Q01–Q60)', () => {
    expect(G2_U01_TEMPLATES).toHaveLength(60);
    for (let i = 1; i <= 60; i += 1) {
      const id = `g2-u01-${String(i).padStart(2, '0')}`;
      expect(templateFor(id)).toBeDefined();
    }
  });

  it('every subtopic has authored templates for levels 1, 2, and 3', () => {
    for (const subtopicId of G2_U01_SUBTOPICS) {
      const templates = G2_U01_TEMPLATES.filter((t) => t.subtopicId === subtopicId);
      const levels = new Set(templates.map((t) => t.difficulty));
      expect(levels.has(1), `${subtopicId} level 1`).toBe(true);
      expect(levels.has(2), `${subtopicId} level 2`).toBe(true);
      expect(levels.has(3), `${subtopicId} level 3`).toBe(true);
    }
  });

  it('all 8 subtopics are registered and playable in Grade 2', () => {
    for (const subtopicId of G2_U01_SUBTOPICS) {
      const ref = { grade: 2, topicId: 'g2-ricxvebi100', subtopicId };
      expect(hasTemplates(ref as never), subtopicId).toBe(true);
      const registered = TEMPLATE_REGISTRY.forSubtopic(ref as never);
      expect(registered.length).toBeGreaterThanOrEqual(6);
    }
  });

  describe('visual helpers', () => {
    it('chartSnippet produces 3x3 grid with arrow', () => {
      const visual = chartSnippet(34);
      expect(visual).toContain('👉[34]');
      expect(visual.split('\n')).toHaveLength(3);
    });

    it('drawFaultyGridSnippet produces 3x3 grid with wrong center', () => {
      const visual = drawFaultyGridSnippet(3, 4, 99);
      expect(visual).toContain('[99]');
      expect(visual.split('\n')).toHaveLength(3);
    });

    it('blockModelVisual formats tens and ones rows', () => {
      const visual = blockModelVisual(3, 5);
      expect(visual).toContain('[10] [10] [10]');
      expect(visual).toContain('▫️ ▫️ ▫️ ▫️ ▫️');
    });

    it('numberLineSnippet displays marked target point', () => {
      const visual = numberLineSnippet(40);
      expect(visual).toContain('[▼40]');
    });
  });

  describe('template properties and variations', () => {
    for (const template of G2_U01_TEMPLATES) {
      it(`${template.id} generates valid, distinct variations without errors`, () => {
        const questions = previewTemplate(template.id, SAMPLES);
        expect(questions.length).toBeGreaterThanOrEqual(1);

        for (const q of questions) {
          expect(q.prompt).not.toMatch(/\{\w+\}/);
          expect(q.prompt.trim().length).toBeGreaterThan(0);
          expect(q.explanation.trim().length).toBeGreaterThan(0);

          if (q.answerMode === 'choice') {
            const expectedOptions = template.optionCount ?? 3;
            expect(q.options).toHaveLength(expectedOptions);
            expect(new Set(q.options).size).toBe(expectedOptions);
            expect(q.options).toContain(q.answer);
          } else if (q.answerMode === 'number') {
            expect(q.options).toEqual([]);
            expect(String(q.answer)).toMatch(/^-?\d+$/);
          } else if (q.answerMode === 'order') {
            expect(q.orderItems?.length).toBeGreaterThanOrEqual(2);
            const key = String(q.answer).split(',').map(Number);
            expect(key).toHaveLength(q.orderItems!.length);
          }
        }
      });
    }
  });

  describe('full gameplay playthrough to MAX_SCORE on every subtopic', () => {
    for (const subtopicId of G2_U01_SUBTOPICS) {
      it(`subtopic ${subtopicId} completes a full session to 100 points`, () => {
        const ref = { grade: 2 as const, topicId: 'g2-ricxvebi100', subtopicId };
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
