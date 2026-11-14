import { describe, expect, it } from 'vitest';
import {
  G3_U05_SUBTOPICS,
  G3_U05_TEMPLATES,
} from '../src/practice/templates/g3-u05-division';
import { hasTemplates, previewTemplate, generateBatch } from '../src/practice/generator';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';
import { startSession, submitAnswer, advance } from '../src/practice/session';
import { MAX_SCORE } from '../src/practice/scoring';

const SAMPLES = 18;

const templateFor = (id: string) => {
  const template = G3_U05_TEMPLATES.find((candidate) => candidate.id === id);
  if (!template) throw new Error(`no template ${id}`);
  return template;
};

describe('Grade 3 — U05: გაყოფა (Division)', () => {
  it('covers all 7 subtopics of U05', () => {
    expect(G3_U05_SUBTOPICS).toEqual([
      'u05-facts-1-to-5',
      'u05-facts-6-to-10',
      'u05-division-within-10',
      'u05-round-numbers',
      'u05-unknown-dividends-divisors',
      'u05-division-tables',
      'u05-word-problems-division',
    ]);
  });

  it('contains all 42 authored templates (Q01–Q42)', () => {
    expect(G3_U05_TEMPLATES.length).toBe(42);
    for (let i = 1; i <= 42; i += 1) {
      const id = `g3-u05-${String(i).padStart(2, '0')}`;
      expect(templateFor(id)).toBeDefined();
    }
  });

  it('every subtopic has 6 authored templates with levels 1, 2, and 3', () => {
    for (const subtopicId of G3_U05_SUBTOPICS) {
      const templates = G3_U05_TEMPLATES.filter((t) => t.subtopicId === subtopicId);
      expect(templates.length).toBe(6);
      const levels = new Set(templates.map((t) => t.difficulty));
      expect(levels.has(1), `${subtopicId} level 1`).toBe(true);
      expect(levels.has(2), `${subtopicId} level 2`).toBe(true);
      expect(levels.has(3), `${subtopicId} level 3`).toBe(true);
    }
  });

  it('every subtopic is marked playable and generates batches cleanly', () => {
    for (const subtopicId of G3_U05_SUBTOPICS) {
      const ref = { grade: 3 as const, topicId: 'g3-gayofa', subtopicId };
      expect(hasTemplates(ref, TEMPLATE_REGISTRY), `playable: ${subtopicId}`).toBe(true);
      const batch = generateBatch(ref, 10, { registry: TEMPLATE_REGISTRY });
      expect(batch.length).toBeGreaterThanOrEqual(5);
    }
  });

  describe('template properties and variations', () => {
    for (const template of G3_U05_TEMPLATES) {
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
    for (const subtopicId of G3_U05_SUBTOPICS) {
      it(`subtopic ${subtopicId} completes a full session to 100 points`, () => {
        const ref = { grade: 3 as const, topicId: 'g3-gayofa', subtopicId };
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
