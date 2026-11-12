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
  {
    subtopicId: 'jami-sxvaoba',
    check: (p, a) => expectEqual(p, a, nums(p)[0] + nums(p)[1]),
  },
  {
    subtopicId: 'Tvisebebi',
    check: (p, a) => expectEqual(p, a, nums(p)[0] + nums(p)[1]),
  },
  {
    subtopicId: 'ricxviTi-gamocanebi',
    check: (p, a) => expectEqual(p, a, nums(p)[0] + nums(p)[1]),
  },

  // ---- subtraction ----------------------------------------------------
  {
    subtopicId: 'sagvnebamde',
    check: (p, a) => expectEqual(p, a, nums(p)[0] - nums(p)[1]),
  },
  {
    subtopicId: 'sawyisi-raodenoba',
    check: (p, a) => expectEqual(p, a, nums(p)[1] - nums(p)[0]),
  },
  {
    subtopicId: 'fulis-amocanebi',
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
  {
    subtopicId: 'ateuli-erteuli-modeli',
    check: (p, a) => expectEqual(p, a, nums(p)[0] * 10 + nums(p)[1]),
  },
  {
    subtopicId: 'ateulebi-ateulebi',
    check: (p, a) => expectEqual(p, a, nums(p)[0] + nums(p)[1]),
  },
  {
    subtopicId: 'ateulebis-gamokleba',
    check: (p, a) => expectEqual(p, a, nums(p)[0] - nums(p)[1]),
  },
  {
    subtopicId: 'aszeulSi',
    check: (p, a) => expectEqual(p, a, nums(p)[0] + nums(p)[1]),
  },
  {
    subtopicId: 'orcifra-ertcifra',
    check: (p, a) => expectEqual(p, a, nums(p)[0] + nums(p)[1]),
  },
  {
    subtopicId: 'nulidan-9-mde',
    check: (p, a) => expectEqual(p, a, nums(p)[0] - nums(p)[1]),
  },
  {
    subtopicId: 'modelidan-ricxvi',
    check: (p, a) => expectEqual(p, a, nums(p)[0] * 10),
  },
  {
    subtopicId: 'ateulidan-erteulebamde',
    check: (p, a) => expectEqual(p, a, nums(p)[0] * 10),
  },
  {
    subtopicId: 'ricxvidan-modeli',
    check: (p, a) => expectEqual(p, a, Math.floor(nums(p)[0] / 10)),
  },

  // ---- two-step arithmetic -------------------------------------------
  {
    subtopicId: '20-mde',
    check: (p, a) => expectEqual(p, a, nums(p)[0] + nums(p)[1] - nums(p)[2]),
  },
  {
    subtopicId: 'ori-nabiji',
    check: (p, a) => expectEqual(p, a, nums(p)[0] + nums(p)[1] - nums(p)[2]),
  },
  {
    subtopicId: 'Sekreba-gamokleba-Tavsatexi',
    check: (p, a) => expectEqual(p, a, nums(p)[0] + nums(p)[1] - nums(p)[2]),
  },
  {
    subtopicId: 'gadajgufebiT',
    check: (p, a) => expectEqual(p, a, nums(p)[0] + nums(p)[1]),
  },
  {
    subtopicId: 'esveTis-chamowerTa',
    check: (p, a) => expectEqual(p, a, nums(p)[0] - nums(p)[1]),
  },

  // ---- true / false and classification -------------------------------
  {
    subtopicId: 'luwi-kenti',
    check: (p, a) => expectEqual(p, a, nums(p)[0] % 2 === 0 ? 'ლუწი' : 'კენტი'),
  },
  {
    subtopicId: 'martali-tolobebi',
    check: (p, a) => {
      const [x, y] = nums(p);
      return expectEqual(p, a, x + y === y + x ? 'მართალია' : 'არ არის მართალი');
    },
  },
  {
    subtopicId: 'Sedareba-10Tan',
    check: (p, a) => {
      const sum = nums(p)[0] + nums(p)[1];
      return expectEqual(p, a, sum > 10 ? 'მეტია' : sum < 10 ? 'ნაკლებია' : 'ტოლია');
    },
  },
  {
    subtopicId: 'sakmarisi-fuli',
    check: (p, a) => expectEqual(p, a, nums(p)[0] >= nums(p)[1] ? 'კი' : 'არა'),
  },
  {
    subtopicId: 'romeli-moqmedeba',
    check: (p, a) => expectEqual(p, a, '+'),
  },
  {
    subtopicId: 'Sedareba-jamebi',
    check: (p, a) =>
      expectEqual(p, a, Math.max(nums(p)[0] + nums(p)[1], nums(p)[2] + nums(p)[3])),
  },

  // ---- sequences ------------------------------------------------------
  {
    subtopicId: 'mzardi',
    check: (p, a) => {
      const [x, y] = nums(p);
      return expectEqual(p, a, y + (y - x));
    },
  },
  {
    subtopicId: 'wesis-agwera',
    check: (p, a) => {
      const [step, x, y] = nums(p);
      return expectEqual(p, a, y + step);
    },
  },
  {
    subtopicId: 'ricxviTi-mimdevroba',
    check: (p, a) => {
      const [x, y, z] = nums(p);
      return expectEqual(p, a, z + (y - x));
    },
  },

  // ---- time and money -------------------------------------------------
  {
    subtopicId: 'saatis-wakitxva',
    check: (p, a) => expectEqual(p, a, nums(p)[0] + 1),
  },
  {
    subtopicId: 'drois-amocanebi',
    check: (p, a) => expectEqual(p, a, nums(p)[0] + nums(p)[1]),
  },
  {
    subtopicId: 'sxva-dro',
    check: (p, a) => expectEqual(p, a, nums(p)[0] + nums(p)[1]),
  },
  {
    subtopicId: 'monetebis-vertoba',
    check: (p, a) => expectEqual(p, a, nums(p)[0] + nums(p)[1]),
  },
  {
    subtopicId: 'tanxaTa-Sedareba',
    check: (p, a) => expectEqual(p, a, Math.max(nums(p)[0], nums(p)[1])),
  },
  {
    subtopicId: 'yvelaze-cota-monetebi',
    check: (p, a) => expectEqual(p, a, nums(p)[0]),
  },

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
