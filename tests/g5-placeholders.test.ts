import { describe, expect, it } from 'vitest';
import {
  G5_CONVERTED_SUBTOPICS,
  GRADE5_PLACEHOLDERS,
} from '../src/practice/templates/grade5-placeholders';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';
import { generateBatch, hasTemplates, previewTemplate } from '../src/practice/generator';
import { CURRICULUM, getTopic } from '../src/practice/curriculum';
import { topicSubtopics } from '../src/practice/types';

/**
 * Grade V runs on one placeholder per subtopic of the academy's 19-unit plan
 * („Grade 5 (10-11)" → „TOPICS AND SUBTOPICS"). These tests pin the *shape* of
 * that plan — 19 units, 157 subtopics, one playable template each — so a unit
 * dropped from `curriculum.ts` or a subtopic renamed without its template is
 * caught here rather than discovered by a student.
 */

/** The plan, unit by unit, as the academy wrote it. */
const PLAN: Array<{ code: string; topicId: string; subtopics: number }> = [
  { code: 'U01', topicId: 'g5-numbers-place-value', subtopics: 6 },
  { code: 'U02', topicId: 'g5-divisibility', subtopics: 9 },
  { code: 'U03', topicId: 'g5-add-sub-whole', subtopics: 6 },
  { code: 'U04', topicId: 'g5-multiplication', subtopics: 9 },
  { code: 'U05', topicId: 'g5-division', subtopics: 8 },
  { code: 'U06', topicId: 'g5-multi-step-speed', subtopics: 6 },
  { code: 'U07', topicId: 'g5-fractions-mixed', subtopics: 12 },
  { code: 'U08', topicId: 'g5-add-sub-fractions', subtopics: 9 },
  { code: 'U09', topicId: 'g5-multiply-fractions', subtopics: 8 },
  { code: 'U10', topicId: 'g5-divide-fractions', subtopics: 5 },
  { code: 'U11', topicId: 'g5-decimals', subtopics: 8 },
  { code: 'U12', topicId: 'g5-percents', subtopics: 7 },
  { code: 'U13', topicId: 'g5-measurement-scale', subtopics: 8 },
  { code: 'U14', topicId: 'g5-coordinate-plane', subtopics: 5 },
  { code: 'U15', topicId: 'g5-geometry', subtopics: 15 },
  { code: 'U16', topicId: 'g5-algebra-powers', subtopics: 6 },
  { code: 'U17', topicId: 'g5-data-chance', subtopics: 8 },
  { code: 'U18', topicId: 'g5-time-money', subtopics: 10 },
  { code: 'U19', topicId: 'g5-patterns-logic', subtopics: 12 },
];

const grade5 = CURRICULUM.find((grade) => grade.grade === 5)!;

describe('Grade 5 — the academy plan in the curriculum', () => {
  it('has all 19 units in order, each as its own topic', () => {
    expect(grade5.topics.map((topic) => topic.id)).toEqual(PLAN.map((unit) => unit.topicId));
    expect(grade5.topics.length).toBe(19);
  });

  it('carries the academy’s own unit codes U01…U19', () => {
    for (const [index, unit] of PLAN.entries()) {
      const topic = grade5.topics[index]!;
      expect(topic.units.map((item) => item.code), topic.id).toEqual([unit.code]);
    }
  });

  it('has 157 subtopics split exactly as the plan says', () => {
    const counted = PLAN.map((unit) => ({
      code: unit.code,
      subtopics: getTopic(5, unit.topicId)!.units.flatMap((item) => item.subtopics).length,
    }));
    expect(counted).toEqual(
      PLAN.map((unit) => ({ code: unit.code, subtopics: unit.subtopics })),
    );
    expect(grade5.topics.flatMap((topic) => topicSubtopics(topic))).toHaveLength(157);
  });

  it('keeps the older grade-5 topics out of the curriculum', () => {
    // `wiladebi`, `proporciebi` and `kuTxeebi` were placeholders from before the
    // academy sent the plan. Their subtopics survive in U07, U13.8 and U15, but
    // the topics themselves must not come back alongside the real structure.
    const ids = grade5.topics.map((topic) => topic.id);
    for (const retired of ['wiladebi', 'proporciebi', 'kuTxeebi']) {
      expect(ids).not.toContain(retired);
    }
  });
});

describe('Grade 5 — placeholder coverage', () => {
  it('has exactly one template per subtopic', () => {
    expect(GRADE5_PLACEHOLDERS).toHaveLength(157);
    const ids = GRADE5_PLACEHOLDERS.map((template) => template.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('addresses day-one content under grade 5 only', () => {
    for (const template of GRADE5_PLACEHOLDERS) {
      expect(template.grade, template.id).toBe(5);
      expect(template.id).toBe(`g5-${template.subtopicId}`);
    }
  });

  it('declares exactly the subtopics a real library covers', () => {
    // The list is how a real library retires its placeholder. It must name a
    // subtopic only when the academy's own templates actually cover it —
    // otherwise a subtopic loses its placeholder and gains nothing.
    for (const subtopicId of G5_CONVERTED_SUBTOPICS) {
      const covered = TEMPLATE_REGISTRY.all.some(
        (template) => template.subtopicId === subtopicId && template.grade === 5,
      );
      expect(covered, `${subtopicId} is declared converted but has no templates`).toBe(true);
    }

    // And the reverse: no subtopic may still be running on its placeholder
    // once real templates exist for it, because that would show the student
    // the placeholder instead of the authored library.
    for (const template of GRADE5_PLACEHOLDERS) {
      const real = TEMPLATE_REGISTRY.all.some(
        (candidate) =>
          candidate.grade === 5 &&
          candidate.subtopicId === template.subtopicId &&
          candidate.id !== `g5-${template.subtopicId}`,
      );
      expect(
        real && !G5_CONVERTED_SUBTOPICS.includes(template.subtopicId),
        `${template.subtopicId} has real templates but still keeps its placeholder`,
      ).toBe(false);
    }
  });

  it('every subtopic of the plan is playable', () => {
    for (const topic of grade5.topics) {
      for (const subtopic of topicSubtopics(topic)) {
        const ref = { grade: 5 as const, topicId: topic.id, subtopicId: subtopic.id };
        expect(hasTemplates(ref, TEMPLATE_REGISTRY), `${topic.id}/${subtopic.id}`).toBe(true);
        // Either the placeholder or the academy's own library, never neither:
        // a converted subtopic is playable through its real templates.
        const ids = TEMPLATE_REGISTRY.forSubtopic(ref).map((template) => template.id);
        const converted = G5_CONVERTED_SUBTOPICS.includes(subtopic.id);
        expect(ids.length, `${topic.id}/${subtopic.id}`).toBeGreaterThan(0);
        if (converted) {
          expect(ids, `${topic.id}/${subtopic.id}`).not.toContain(`g5-${subtopic.id}`);
        } else {
          expect(ids, `${topic.id}/${subtopic.id}`).toEqual([`g5-${subtopic.id}`]);
        }
      }
    }
  });

  it('fills a batch without repeating a question', () => {
    for (const topic of grade5.topics) {
      for (const subtopic of topicSubtopics(topic)) {
        const ref = { grade: 5 as const, topicId: topic.id, subtopicId: subtopic.id };
        const batch = generateBatch(ref, 12, { seed: 20260101 });
        expect(batch.length, `${topic.id}/${subtopic.id}`).toBe(12);
        expect(
          new Set(batch.map((question) => question.signature)).size,
          `${topic.id}/${subtopic.id}`,
        ).toBe(12);
      }
    }
  });

  it('every template offers distinct options that include the answer', () => {
    for (const template of GRADE5_PLACEHOLDERS) {
      for (const question of previewTemplate(template.id, 6)) {
        // Typed and ordering answers carry their key instead of options.
        if (question.answerMode !== 'choice') {
          expect(question.options, template.id).toEqual([]);
          continue;
        }
        expect(new Set(question.options).size, `${template.id}: duplicate option`).toBe(
          question.options.length,
        );
        expect(question.options, `${template.id}: answer missing`).toContain(question.answer);
      }
    }
  });

  it('re-derives the arithmetic from the printed sentence', () => {
    // The answer must be readable out of the question a student sees, not just
    // self-consistent with the template that produced it. These rules re-do the
    // sum from the rendered prompt and are written independently of the
    // template's own expression.
    const rules: Array<{ id: string; check: (prompt: string, answer: string) => boolean | null }> = [
      {
        id: 'g5-u16-01',
        check: (prompt, answer) => {
          const [a, b, c] = (prompt.match(/\d+/g) ?? []).map(Number);
          return a === undefined || b === undefined || c === undefined ? null : Number(answer) === a + b * c;
        },
      },
      {
        id: 'g5-u04-03',
        check: (prompt, answer) => {
          const [a, b] = (prompt.match(/\d+/g) ?? []).map(Number);
          return a === undefined || b === undefined ? null : Number(answer) === a * b;
        },
      },
      {
        id: 'g5-u18-01',
        check: (prompt, answer) => {
          const [h, m] = (prompt.match(/\d+/g) ?? []).map(Number);
          return h === undefined || m === undefined ? null : Number(answer) === h * 60 + m;
        },
      },
      {
        id: 'g5-u15-12',
        check: (prompt, answer) => {
          const [a, b] = (prompt.match(/\d+/g) ?? []).map(Number);
          return a === undefined || b === undefined ? null : Number(answer) === 2 * (a + b);
        },
      },
      {
        id: 'g5-u09-02',
        check: (prompt, answer) => {
          const match = prompt.match(/(\d+)\/(\d+) × (\d+)\/(\d+)/);
          if (!match) return null;
          const product = (Number(match[1]) / Number(match[2])) * (Number(match[3]) / Number(match[4]));
          const [numerator, denominator] = String(answer).split('/').map(Number);
          return Math.abs(numerator! / denominator! - product) < 1e-9;
        },
      },
    ];

    const failures: string[] = [];
    for (const rule of rules) {
      const template = GRADE5_PLACEHOLDERS.find((item) => item.id === rule.id)!;
      const ref = { grade: 5 as const, topicId: template.topicId, subtopicId: template.subtopicId };
      for (const question of generateBatch(ref, 24, { seed: 909090 })) {
        if (rule.check(question.prompt, question.answer) === false) {
          failures.push(`${rule.id}: "${question.prompt}" → ${question.answer}`);
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it('never leaves a prompt placeholder unfilled', () => {
    for (const template of GRADE5_PLACEHOLDERS) {
      for (const question of previewTemplate(template.id, 4)) {
        expect(question.prompt, template.id).not.toMatch(/\{\w+\}/);
        expect(question.explanation.trim().length, template.id).toBeGreaterThan(0);
      }
    }
  });
});
