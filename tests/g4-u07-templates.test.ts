import { describe, expect, it } from 'vitest';
import {
  G4_U07_SUBTOPICS,
  G4_U07_TEMPLATES,
} from '../src/practice/templates/g4-u07-multi-step-problems';
import { hasTemplates, previewTemplate, generateBatch } from '../src/practice/generator';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';
import { startSession, submitAnswer, advance } from '../src/practice/session';
import { MAX_SCORE } from '../src/practice/scoring';

const SAMPLES = 18;

const templateFor = (id: string) => {
  const template = G4_U07_TEMPLATES.find((candidate) => candidate.id === id);
  if (!template) throw new Error(`no template ${id}`);
  return template;
};

describe('Grade 4 — U07: მრავალსაფეხურიანი ამოცანები (Multi-Step Problems)', () => {
  it('covers all 12 subtopics of U07', () => {
    expect(G4_U07_SUBTOPICS).toEqual([
      'u07-approximate-sums',
      'u07-addition-problems',
      'u07-mixed-problems',
      'u07-operation-signs',
      'u07-sufficient-conditions',
      'u07-guess-and-check',
      'u07-equations',
      'u07-equalizing-quantities',
      'u07-multiplication-addition',
      'u07-time-intervals',
      'u07-determine-compare',
      'u07-order-of-operations',
    ]);
  });

  it('contains all 72 authored templates (Q01–Q72)', () => {
    expect(G4_U07_TEMPLATES.length).toBe(72);
    for (let i = 1; i <= 72; i += 1) {
      const id = `g4-u07-${String(i).padStart(2, '0')}`;
      expect(templateFor(id)).toBeDefined();
    }
  });

  it('every subtopic has 6 authored templates with levels 1, 2, and 3', () => {
    for (const subtopicId of G4_U07_SUBTOPICS) {
      const templates = G4_U07_TEMPLATES.filter((t) => t.subtopicId === subtopicId);
      expect(templates.length).toBe(6);
      const levels = new Set(templates.map((t) => t.difficulty));
      expect(levels.has(1), `${subtopicId} level 1`).toBe(true);
      expect(levels.has(2), `${subtopicId} level 2`).toBe(true);
      expect(levels.has(3), `${subtopicId} level 3`).toBe(true);
    }
  });

  it('is fully registered in TEMPLATE_REGISTRY and playable for all subtopics', () => {
    for (const subtopicId of G4_U07_SUBTOPICS) {
      const ref = { grade: 4 as const, topicId: 'g4-mravalsapexuriani-amocanebi', subtopicId };
      expect(hasTemplates(ref, TEMPLATE_REGISTRY), `playable: ${subtopicId}`).toBe(true);
      const batch = generateBatch(ref, 10, { registry: TEMPLATE_REGISTRY });
      expect(batch.length).toBeGreaterThanOrEqual(5);
    }
  });

  describe('template properties and variations', () => {
    for (const template of G4_U07_TEMPLATES) {
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
    for (const subtopicId of G4_U07_SUBTOPICS) {
      it(`subtopic ${subtopicId} completes a full session to 100 points`, () => {
        const ref = { grade: 4 as const, topicId: 'g4-mravalsapexuriani-amocanebi', subtopicId };
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
