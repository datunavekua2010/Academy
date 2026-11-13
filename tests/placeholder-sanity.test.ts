import { describe, expect, it } from 'vitest';
import { GRADE1_PLACEHOLDERS } from '../src/practice/templates/grade1-placeholders';
import { previewTemplate } from '../src/practice/generator';

/**
 * Grade I is placeholder content until the academy's real questions arrive
 * (see src/practice/templates/grade1-placeholders.ts). Tests elsewhere prove the
 * questions are *well formed*; this file proves they are *true*.
 *
 * The U04 and U05 subtopics no longer have placeholders: their real libraries
 * replace them, so a rule here would be checking a template that no longer
 * exists. The same property — the answer reads out of the printed prompt — is
 * asserted against the real templates in `tests/u04-templates.test.ts` and
 * `tests/u05-templates.test.ts`.
 *
 * Every check re-derives the answer from the rendered prompt alone — the same
 * text a student sees — instead of trusting the template's own arithmetic.
 */

const nums = (prompt: string): number[] => (prompt.match(/\d+/g) ?? []).map(Number);

type Rule = { subtopicId: string; check: (prompt: string, answer: string) => string | null };

const expectEqual = (prompt: string, answer: string, want: string | number): string | null =>
  String(want) === answer ? null : `"${prompt}" → ${answer}, expected ${want}`;

const RULES: Rule[] = [
  // ---- counting -------------------------------------------------------
  {
    subtopicId: 'ricxvebi1-10',
    check: (p, a) => expectEqual(p, a, nums(p)[0] + 1),
  },
  {
    subtopicId: 'ricxviTi-xazi20',
    check: (p, a) => expectEqual(p, a, nums(p)[0] + 1),
  },
  {
    subtopicId: '100-mde',
    check: (p, a) => expectEqual(p, a, nums(p)[0] + 1),
  },
  {
    subtopicId: 'win-nak',
    check: (p, a) => expectEqual(p, a, nums(p)[0] - 1),
  },
  {
    // Both directions, as the subtopic is named: "before N" is N−1, and
    // "after N" is N+1. Checking only the first would pass a template that
    // asked both with the same answer.
    subtopicId: 'win-ukan',
    check: (p, a) =>
      p.includes('შემდეგ')
        ? expectEqual(p, a, nums(p)[0] + 1)
        : expectEqual(p, a, nums(p)[0] - 1),
  },
  {
    subtopicId: 'atobit-nabijebit',
    check: (p, a) => expectEqual(p, a, (nums(p)[0] / 10 + 1) * 10),
  },

  // ---- comparison -----------------------------------------------------
  {
    subtopicId: 'udidesi-umciresti',
    check: (p, a) => expectEqual(p, a, Math.max(nums(p)[0], nums(p)[1])),
  },
  {
    subtopicId: 'grZeli-mokle',
    check: (p, a) => expectEqual(p, a, Math.max(nums(p)[0], nums(p)[1])),
  },
  {
    subtopicId: 'magle-dabali',
    check: (p, a) => expectEqual(p, a, Math.max(nums(p)[0], nums(p)[1])),
  },
  {
    subtopicId: 'mZime-msubuqi',
    check: (p, a) => expectEqual(p, a, Math.max(nums(p)[0], nums(p)[1])),
  },
  {
    subtopicId: 'gansieri-vicki',
    check: (p, a) => expectEqual(p, a, Math.max(nums(p)[0], nums(p)[1])),
  },

  // ---- addition -------------------------------------------------------
  {
    subtopicId: 'datvla-suratebidan',
    check: (p, a) => expectEqual(p, a, nums(p)[0] + nums(p)[1]),
  },
  {
    subtopicId: 'ricxvebi11-20',
    check: (p, a) => expectEqual(p, a, nums(p)[0] + nums(p)[1]),
  },
  {
    subtopicId: 'sruli-datvla',
    check: (p, a) => expectEqual(p, a, nums(p)[0] + nums(p)[1]),
  },
  {
    subtopicId: 'airCe-da-daTvale',
    check: (p, a) => expectEqual(p, a, nums(p)[0] + nums(p)[1]),
  },

  // ---- subtraction ----------------------------------------------------
  {
    subtopicId: 'sagvnebamde',
    check: (p, a) => expectEqual(p, a, nums(p)[0] - nums(p)[1]),
  },
  {
    subtopicId: 'Cafiqrebuli-ricxvi',
    check: (p, a) => expectEqual(p, a, nums(p)[1] - nums(p)[0]),
  },
  {
    subtopicId: 'yvela-rame',
    check: (_p, a) => expectEqual('', a, 0),
  },

  // ---- tens and place value ------------------------------------------

  // ---- two-step arithmetic -------------------------------------------

  // ---- true / false and classification -------------------------------
  {
    subtopicId: 'luwi-kenti',
    check: (p, a) => expectEqual(p, a, nums(p)[0] % 2 === 0 ? 'ლუწი' : 'კენტი'),
  },

  // ---- time and money -------------------------------------------------
  // U13 converted the five time subtopics to real templates and U14 the six
  // money subtopics, and their placeholders were deleted with them;
  // `u13-templates.test.ts` and `u14-templates.test.ts` check the replacements.
  // No rule below is left for either topic.

  // ---- equal parts ----------------------------------------------------
  {
    subtopicId: 'diagramiT-gayofa',
    check: (p, a) => expectEqual(p, a, nums(p)[0] / nums(p)[1]),
  },
];

describe('grade-1 placeholders are factually correct', () => {
  const byId = new Map(GRADE1_PLACEHOLDERS.map((template) => [template.subtopicId, template]));

  it('every rule targets a real subtopic', () => {
    const unknown = RULES.filter((rule) => !byId.has(rule.subtopicId)).map((rule) => rule.subtopicId);
    expect(unknown).toEqual([]);
  });

  for (const rule of RULES) {
    it(`${rule.subtopicId} answers from the numbers it prints`, () => {
      const template = byId.get(rule.subtopicId)!;
      const wrong: string[] = [];

      for (const question of previewTemplate(template.id, 25)) {
        const failure = rule.check(question.prompt, question.answer);
        if (failure) wrong.push(failure);
      }

      expect(wrong).toEqual([]);
    });
  }
});
