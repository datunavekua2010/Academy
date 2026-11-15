import { describe, expect, it } from 'vitest';
import {
  G4_U11_SUBTOPICS,
  G4_U11_TEMPLATES,
} from '../src/practice/templates/g4-u11-geometry';
import { hasTemplates, previewTemplate, generateBatch } from '../src/practice/generator';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';
import { startSession, submitAnswer, advance } from '../src/practice/session';
import { MAX_SCORE } from '../src/practice/scoring';

const SAMPLES = 40;

describe('Grade 4 — U11: გეომეტრია (Geometry)', () => {
  it('covers all 20 subtopics of U11', () => {
    expect(G4_U11_SUBTOPICS).toEqual([
      'u11-plane-figures',
      'u11-tables-patterns',
      'u11-open-closed-lines',
      'u11-squares-rectangles',
      'u11-polygons',
      'u11-sides-vertices',
      'u11-lines-segments-rays',
      'u11-parallel-intersecting',
      'u11-circles',
      'u11-radius-diameter',
      'u11-perimeter',
      'u11-area',
      'u11-perimeter-area-relation',
      'u11-solid-figures',
      'u11-quadrilateral-classification',
      'u11-shape-completion',
      'u11-area-square-units',
      'u11-triangle-classification',
      'u11-equal-areas',
      'u11-shape-partitioning',
    ]);
  });

  it('contains all 131 authored templates with unique ids', () => {
    expect(G4_U11_TEMPLATES.length).toBe(131);
    const ids = G4_U11_TEMPLATES.map((template) => template.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every subtopic has at least five templates covering all three levels', () => {
    for (const subtopicId of G4_U11_SUBTOPICS) {
      const templates = G4_U11_TEMPLATES.filter((t) => t.subtopicId === subtopicId);
      expect(templates.length, `${subtopicId} template count`).toBeGreaterThanOrEqual(5);
      const levels = new Set(templates.map((t) => t.difficulty));
      expect(levels.has(1), `${subtopicId} level 1`).toBe(true);
      expect(levels.has(2), `${subtopicId} level 2`).toBe(true);
      expect(levels.has(3), `${subtopicId} level 3`).toBe(true);
    }
  });

  it('registers every template under grade 4 and topic g4-geometria', () => {
    for (const template of G4_U11_TEMPLATES) {
      const found = TEMPLATE_REGISTRY.byId(template.id);
      expect(found, `template ${template.id} in registry`).toBeDefined();
      expect(found?.grade).toBe(4);
      expect(found?.topicId).toBe('g4-geometria');
      expect(found?.unitId).toBe('g4-geometria');
    }
  });

  it('makes every subtopic playable', () => {
    for (const subtopicId of G4_U11_SUBTOPICS) {
      const ref = { grade: 4 as const, topicId: 'g4-geometria', subtopicId };
      expect(hasTemplates(ref, TEMPLATE_REGISTRY), `playable: ${subtopicId}`).toBe(true);
    }
  });

  it('every subtopic fills a real session without repeating a question', () => {
    for (const subtopicId of G4_U11_SUBTOPICS) {
      const ref = { grade: 4 as const, topicId: 'g4-geometria', subtopicId };
      const batch = generateBatch(ref, 12, { registry: TEMPLATE_REGISTRY });
      expect(batch.length, `${subtopicId} produced only ${batch.length}/12`).toBe(12);
      expect(new Set(batch.map((q) => q.signature)).size).toBe(12);
    }
  });

  describe('template properties and variations', () => {
    for (const template of G4_U11_TEMPLATES) {
      it(`${template.id} generates valid, distinct variations`, () => {
        const questions = previewTemplate(template.id, SAMPLES);
        // A template may be legitimately finite — six statements to classify,
        // eight solid shapes. What must hold is that every variation it does
        // produce is a real, well-formed question.
        expect(questions.length).toBeGreaterThanOrEqual(6);

        const signatures = new Set<string>();
        for (const q of questions) {
          expect(q.prompt.trim().length).toBeGreaterThan(0);
          expect(q.prompt).not.toMatch(/\{\w+\}/);
          expect(String(q.answer).length).toBeGreaterThan(0);
          expect(q.explanation.trim().length).toBeGreaterThan(0);

          if (q.options && q.options.length > 0) {
            expect(q.options).toContain(q.answer);
            expect(new Set(q.options).size).toBe(q.options.length);
            expect(q.options.length, `${template.id} option count`).toBe(
              template.optionCount ?? 4,
            );
          }

          expect(q.grade).toBe(4);
          expect(q.topicId).toBe('g4-geometria');
          expect(q.subtopicId).toBe(template.subtopicId);
          expect(signatures.has(q.signature)).toBe(false);
          signatures.add(q.signature);
        }
      });

      it(`${template.id} is reproducible from its seed`, () => {
        const first = previewTemplate(template.id, 5);
        const second = previewTemplate(template.id, 5);
        expect(second.map((q) => q.signature)).toEqual(first.map((q) => q.signature));
      });
    }
  });

  it('declares a variable for every placeholder it uses', () => {
    const missing: string[] = [];
    for (const template of G4_U11_TEMPLATES) {
      for (const match of template.prompt.matchAll(/\{(\w+)\}/g)) {
        if (!Object.prototype.hasOwnProperty.call(template.variables, match[1])) {
          missing.push(`${template.id} uses {${match[1]}}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  describe('full gameplay playthrough to MAX_SCORE on every subtopic', () => {
    for (const subtopicId of G4_U11_SUBTOPICS) {
      it(`subtopic ${subtopicId} completes a full session to 100 points`, () => {
        const ref = { grade: 4 as const, topicId: 'g4-geometria', subtopicId };
        let state = startSession(
          ref,
          generateBatch(ref, 6, { seed: 77, registry: TEMPLATE_REGISTRY }),
        );
        let steps = 0;

        while (state.score < MAX_SCORE && steps < 60) {
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
