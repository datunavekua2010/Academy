import { describe, expect, it } from 'vitest';
import {
  G2_U02_SUBTOPICS,
  G2_U02_TEMPLATES,
  numberLineMini,
  starTableVisual,
  categoryTableVisual,
  grid2x3Visual,
} from '../src/practice/templates/g2-u02-sequences';
import { hasTemplates, previewTemplate } from '../src/practice/generator';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';
import { startSession, submitAnswer, advance } from '../src/practice/session';
import { generateBatch } from '../src/practice/generator';
import { MAX_SCORE } from '../src/practice/scoring';

const SAMPLES = 10;

const templateFor = (id: string) => {
  const template = G2_U02_TEMPLATES.find((candidate) => candidate.id === id);
  if (!template) throw new Error(`no template ${id}`);
  return template;
};

describe('Grade 2 — U02: დათვლა და მიმდევრობები', () => {
  it('covers all 7 subtopics of U02', () => {
    expect(G2_U02_SUBTOPICS).toEqual([
      'u02-even-and-odd',
      'u02-counting-objects',
      'u02-counting-with-steps',
      'u02-counting-with-tables',
      'u02-number-sequences',
      'u02-moves-on-number-line',
      'u02-sorting-even-odd',
    ]);
  });

  it('contains exactly 42 authored templates (Q01–Q42)', () => {
    expect(G2_U02_TEMPLATES).toHaveLength(42);
    for (let i = 1; i <= 42; i += 1) {
      const id = `g2-u02-${String(i).padStart(2, '0')}`;
      expect(templateFor(id)).toBeDefined();
    }
  });

  it('every subtopic has authored templates for levels 1, 2, and 3', () => {
    for (const subtopicId of G2_U02_SUBTOPICS) {
      const templates = G2_U02_TEMPLATES.filter((t) => t.subtopicId === subtopicId);
      const levels = new Set(templates.map((t) => t.difficulty));
      expect(levels.has(1), `${subtopicId} level 1`).toBe(true);
      expect(levels.has(2), `${subtopicId} level 2`).toBe(true);
      expect(levels.has(3), `${subtopicId} level 3`).toBe(true);
    }
  });

  it('all 7 subtopics are registered and playable in Grade 2', () => {
    for (const subtopicId of G2_U02_SUBTOPICS) {
      const ref = { grade: 2, topicId: 'g2-datvla-mimdevroba', subtopicId };
      expect(hasTemplates(ref as never), subtopicId).toBe(true);
      const registered = TEMPLATE_REGISTRY.forSubtopic(ref as never);
      expect(registered.length).toBeGreaterThanOrEqual(6);
    }
  });

  describe('visual helpers', () => {
    it('numberLineMini produces marked bracket and path', () => {
      const visual = numberLineMini(3, 5);
      expect(visual).toContain('[3]');
      expect(visual).toContain('(📍5)');
    });

    it('starTableVisual produces formatted table rows', () => {
      const visual = starTableVisual(3, 2);
      expect(visual).toContain('⭐ | ⭐ | ⭐');
      expect(visual.split('\n')).toHaveLength(2);
    });

    it('categoryTableVisual formats markdown table', () => {
      const visual = categoryTableVisual([
        { name: '🚗 მანქანა', count: 3 },
        { name: '⚽ ბურთი', count: 2 },
      ]);
      expect(visual).toContain('| 🚗 მანქანა | 3 |');
      expect(visual).toContain('| ⚽ ბურთი | 2 |');
    });

    it('grid2x3Visual produces 2x3 numbers grid', () => {
      const visual = grid2x3Visual([2, 5, 8, 3, 6, 9]);
      expect(visual).toContain('| 2 | 5 | 8 |');
      expect(visual).toContain('| 3 | 6 | 9 |');
    });
  });

  describe('template properties and variations', () => {
    for (const template of G2_U02_TEMPLATES) {
      it(`${template.id} generates valid, distinct variations without errors`, () => {
        const questions = previewTemplate(template.id, SAMPLES);
        expect(questions.length).toBeGreaterThanOrEqual(1);

        for (const q of questions) {
          expect(q.prompt).not.toMatch(/\{\w+\}/);
          expect(q.prompt.trim().length).toBeGreaterThan(0);
          expect(q.explanation.trim().length).toBeGreaterThan(0);

          if (q.answerMode === 'choice') {
            const expectedOptions = template.optionCount ?? 4;
            expect(q.options).toHaveLength(expectedOptions);
            expect(new Set(q.options).size).toBe(expectedOptions);
            expect(q.options).toContain(q.answer);
          } else if (q.answerMode === 'number') {
            expect(q.options).toEqual([]);
            expect(String(q.answer)).toMatch(/^-?\d+$/);
          }
        }
      });
    }
  });

  describe('full gameplay playthrough to MAX_SCORE on every subtopic', () => {
    for (const subtopicId of G2_U02_SUBTOPICS) {
      it(`subtopic ${subtopicId} completes a full session to 100 points`, () => {
        const ref = { grade: 2 as const, topicId: 'g2-datvla-mimdevroba', subtopicId };
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
