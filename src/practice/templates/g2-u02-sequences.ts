/**
 * Grade 2 — U02: დათვლა და მიმდევრობები (Counting and Sequences).
 *
 * Full curriculum implementation for Grade 2 Unit 2:
 * 42 question templates (Q01–Q42) across seven subtopics with complete Level 1, 2, and 3 coverage:
 *
 *   U02.1 `u02-even-and-odd`          (ლუწი და კენტი რიცხვები, Q01–Q06)            6 templates
 *   U02.2 `u02-counting-objects`      (საგნების დათვლა, Q07–Q12)                   6 templates
 *   U02.3 `u02-counting-with-steps`    (ნაბიჯებით თვლა, Q13–Q18)                    6 templates
 *   U02.4 `u02-counting-with-tables`   (ცხრილით თვლა, Q19–Q24)                     6 templates
 *   U02.5 `u02-number-sequences`      (რიცხვითი მიმდევრობები, Q25–Q30)             6 templates
 *   U02.6 `u02-moves-on-number-line`  (რიცხვით ღერძზე გადაადგილება, Q31–Q36)       6 templates
 *   U02.7 `u02-sorting-even-odd`      (ლუწისა და კენტის დალაგება, Q37–Q42)         6 templates
 */

import { defineTemplate } from './types';
import type { QuestionTemplate } from './types';

const grade = 2 as const;
const topicId = 'g2-datvla-mimdevroba' as const;
const unitId = 'g2-datvla-mimdevroba' as const;

export const G2_U02_SUBTOPICS = [
  'u02-even-and-odd',
  'u02-counting-objects',
  'u02-counting-with-steps',
  'u02-counting-with-tables',
  'u02-number-sequences',
  'u02-moves-on-number-line',
  'u02-sorting-even-odd',
] as const;

export type G2U02SubtopicId = (typeof G2_U02_SUBTOPICS)[number];

const addr = (spec: { id: string; subtopicId: G2U02SubtopicId; difficulty: 1 | 2 | 3 }) => ({
  id: spec.id,
  grade,
  topicId,
  unitId,
  subtopicId: spec.subtopicId,
  difficulty: spec.difficulty,
});

/** Near miss builder for integers */
export function numberLineMini(start: number, end?: number): string {
  const minVal = Math.max(0, Math.min(start, end ?? start) - 2);
  const maxVal = Math.max(start, end ?? start) + 2;
  const marks: string[] = [];
  for (let i = minVal; i <= maxVal; i += 1) {
    if (i === start) {
      marks.push(`[${i}]`);
    } else if (end !== undefined && i === end) {
      marks.push(`(📍${i})`);
    } else {
      marks.push(`${i}`);
    }
  }
  return marks.join('—');
}

/** Star table visual for counting objects in grid cells */
export function starTableVisual(row1: number, row2: number, cols = 3): string {
  const r1 = Array.from({ length: cols }, (_, i) => (i < row1 ? '⭐' : '  ')).join(' | ');
  const r2 = Array.from({ length: cols }, (_, i) => (i < row2 ? '⭐' : '  ')).join(' | ');
  return `| ${r1} |\n| ${r2} |`;
}

/** Table visual for named categories and counts */
export function categoryTableVisual(rows: Array<{ name: string; count: number }>): string {
  const header = '| სათამაშო / საგანი | რაოდენობა |\n| :--- | :---: |';
  const lines = rows.map((r) => `| ${r.name} | ${r.count} |`);
  return [header, ...lines].join('\n');
}

/** 2x3 grid visual for numbers */
export function grid2x3Visual(nums: number[]): string {
  return `| ${nums[0]} | ${nums[1]} | ${nums[2]} |\n| ${nums[3]} | ${nums[4]} | ${nums[5]} |`;
}

export const G2_U02_TEMPLATES: QuestionTemplate[] = [
  // ==================================================================
  // U02.1 — Even and Odd (ლუწი და კენტი რიცხვები)
  // ==================================================================

  // Q01 (Level 1)
  defineTemplate({
    ...addr({ id: 'g2-u02-01', subtopicId: 'u02-even-and-odd', difficulty: 1 }),
    prompt: '{intro} რომელი რიცხვია ლუწი?',
    variables: {
      intro: {
        kind: 'choice',
        values: ['ჩამოთვლილთაგან', 'მოცემულთაგან', 'ვარიანტებიდან', 'ქვემოთ მოცემულთაგან'],
      },
      k: { kind: 'int', min: 2, max: 25 },
      even: { kind: 'choice', values: (v) => [Number(v.k) * 2] },
      odd1: { kind: 'choice', values: (v) => [Number(v.k) * 2 - 3 > 0 ? Number(v.k) * 2 - 3 : 1] },
      odd2: { kind: 'choice', values: (v) => [Number(v.k) * 2 + 1] },
      odd3: { kind: 'choice', values: (v) => [Number(v.k) * 2 + 3] },
    },
    answer: (v) => Number(v.even),
    format: { kind: 'integer', min: 1, max: 60 },
    optionCount: 4,
    distractors: ({ vars }) => [Number(vars.odd1), Number(vars.odd2), Number(vars.odd3)],
    explanation: ({ answer }) =>
      `${answer} იყოფა 2-ზე უნაშთოდ, ამიტომ ის ლუწია (ხოლო დანარჩენი რიცხვები კენტია).`,
  }),

  // Q02 (Level 1)
  defineTemplate({
    ...addr({ id: 'g2-u02-02', subtopicId: 'u02-even-and-odd', difficulty: 1 }),
    prompt: '{intro} რომელი რიცხვია კენტი?',
    variables: {
      intro: {
        kind: 'choice',
        values: ['ჩამოთვლილთაგან', 'მოცემულთაგან', 'ვარიანტებიდან', 'ქვემოთ მოცემულთაგან'],
      },
      k: { kind: 'int', min: 2, max: 25 },
      odd: { kind: 'choice', values: (v) => [Number(v.k) * 2 - 1] },
      even1: { kind: 'choice', values: (v) => [Number(v.k) * 2] },
      even2: { kind: 'choice', values: (v) => [Number(v.k) * 2 + 2] },
      even3: { kind: 'choice', values: (v) => [Number(v.k) * 2 - 2 > 0 ? Number(v.k) * 2 - 2 : 8] },
    },
    answer: (v) => Number(v.odd),
    format: { kind: 'integer', min: 1, max: 60 },
    optionCount: 4,
    distractors: ({ vars }) => [Number(vars.even1), Number(vars.even2), Number(vars.even3)],
    explanation: ({ answer }) =>
      `${answer} არ იყოფა 2-ზე უნაშთოდ (2-ზე გაყოფისას ნაშთია 1), ამიტომ ის კენტია.`,
  }),

  // Q03 (Level 2)
  defineTemplate({
    ...addr({ id: 'g2-u02-03', subtopicId: 'u02-even-and-odd', difficulty: 2 }),
    prompt: 'შეავსე გამოტოვებული რიცხვი მიმდევრობაში: {a}, {b}, □, {d}',
    variables: {
      k: { kind: 'int', min: 1, max: 20 },
      isOdd: { kind: 'choice', values: [0, 1] },
      a: { kind: 'choice', values: (v) => [Number(v.isOdd) === 0 ? Number(v.k) * 2 : Number(v.k) * 2 - 1] },
      b: { kind: 'choice', values: (v) => [Number(v.a) + 2] },
      d: { kind: 'choice', values: (v) => [Number(v.a) + 6] },
    },
    answer: (v) => Number(v.a) + 4,
    format: { kind: 'integer', min: 1, max: 60 },
    optionCount: 4,
    distractors: ({ answer }) => [Number(answer) - 1, Number(answer) + 1, Number(answer) + 3],
    explanation: ({ vars, answer }) =>
      `მიმდევრობაში რიცხვები 2-ით იზრდება: ${vars.b} + 2 = ${answer}.`,
  }),

  // Q04 (Level 2)
  defineTemplate({
    ...addr({ id: 'g2-u02-04', subtopicId: 'u02-even-and-odd', difficulty: 2 }),
    prompt: 'რამდენი ლუწი რიცხვია ამ ჩამონათვალში: {listStr}?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '1, 4, 6, 7, 9;4, 6;2',
          '2, 8, 11, 14, 15;2, 8, 14;3',
          '3, 5, 7, 10, 13;10;1',
          '4, 6, 8, 10, 13;4, 6, 8, 10;4',
          '5, 7, 9, 11, 14;14;1',
          '6, 12, 18, 21, 25;6, 12, 18;3',
          '8, 10, 13, 15, 17;8, 10;2',
          '2, 4, 6, 8, 11;2, 4, 6, 8;4',
          '7, 9, 12, 16, 20;12, 16, 20;3',
          '1, 3, 6, 8, 9;6, 8;2',
          '14, 17, 19, 23, 25;14;1',
          '12, 16, 22, 24, 27;12, 16, 22, 24;4',
          '15, 18, 20, 25, 29;18, 20;2',
          '11, 13, 17, 26, 30;26, 30;2',
          '10, 14, 16, 19, 21;10, 14, 16;3',
          '2, 7, 11, 15, 19;2;1',
          '8, 12, 14, 18, 23;8, 12, 14, 18;4',
          '3, 8, 13, 18, 23;8, 18;2',
          '6, 11, 16, 21, 26;6, 16, 26;3',
          '9, 15, 21, 27, 30;30;1',
          '20, 24, 28, 31, 33;20, 24, 28;3',
          '17, 22, 26, 30, 34;22, 26, 30, 34;4',
        ],
      },
      listStr: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      evensList: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correctCount: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[2])] },
    },
    answer: (v) => Number(v.correctCount),
    format: { kind: 'integer', min: 1, max: 4 },
    optionCount: 4,
    distractors: ({ answer }) => [1, 2, 3, 4].filter((n) => n !== Number(answer)),
    explanation: ({ vars, answer }) =>
      `ლუწი რიცხვებია: ${vars.evensList}. სულ ${answer} ლუწი რიცხვია.`,
  }),

  // Q05 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u02-05', subtopicId: 'u02-even-and-odd', difficulty: 3 }),
    prompt: '{intro} რომელი წყვილი შეიცავს მხოლოდ კენტ რიცხვებს?',
    variables: {
      intro: {
        kind: 'choice',
        values: ['ჩამოთვლილთაგან', 'მოცემულთაგან', 'ვარიანტებიდან', 'ქვემოთ მოცემულთაგან'],
      },
      pack: {
        kind: 'choice',
        values: [
          '3 და 7;2 და 5;4 და 9;6 და 8',
          '5 და 9;2 და 7;6 და 11;8 და 10',
          '1 და 13;4 და 7;6 და 9;2 და 12',
          '7 და 11;3 და 8;5 და 10;4 და 6',
          '9 და 15;6 და 13;8 და 15;10 და 12',
          '11 და 17;12 და 15;14 და 19;16 და 18',
          '13 და 21;10 და 17;8 და 19;6 და 22',
          '15 და 23;14 და 21;16 და 25;18 და 20',
          '17 და 25;18 და 23;20 და 27;22 და 24',
          '19 და 27;20 და 25;22 და 29;24 და 26',
          '21 და 29;22 და 27;24 და 31;26 და 28',
          '23 და 31;24 და 29;26 და 33;28 და 30',
          '25 და 33;26 და 31;28 და 35;30 და 32',
          '27 და 35;28 და 33;30 და 37;32 და 34',
          '29 და 37;30 და 35;32 და 39;34 და 36',
          '31 და 39;32 და 37;34 და 41;36 და 38',
        ],
      },
      oddPair: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      dist1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      dist2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      dist3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => String(v.oddPair),
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars }) => [String(vars.dist1), String(vars.dist2), String(vars.dist3)],
    explanation: ({ answer }) => `„${answer}“ — ორივე რიცხვი კენტია.`,
  }),

  // Q06 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u02-06', subtopicId: 'u02-even-and-odd', difficulty: 3 }),
    prompt: '{intro} რომელი წყვილი შეიცავს მხოლოდ ლუწ რიცხვებს?',
    variables: {
      intro: {
        kind: 'choice',
        values: ['ჩამოთვლილთაგან', 'მოცემულთაგან', 'ვარიანტებიდან', 'ქვემოთ მოცემულთაგან'],
      },
      pack: {
        kind: 'choice',
        values: [
          '4 და 8;3 და 6;5 და 8;7 და 9',
          '6 და 12;5 და 10;7 და 12;9 და 11',
          '8 და 14;7 და 12;9 და 14;11 და 13',
          '10 და 16;9 და 14;11 და 16;13 და 15',
          '12 და 18;11 და 16;13 და 18;15 და 17',
          '14 და 20;13 და 18;15 და 20;17 და 19',
          '16 და 22;15 და 20;17 და 22;19 და 21',
          '18 და 24;17 და 22;19 და 24;21 და 23',
          '20 და 26;19 და 24;21 და 26;23 და 25',
          '22 და 28;21 და 26;23 და 28;25 და 27',
          '24 და 30;23 და 28;25 და 30;27 და 29',
          '26 და 32;25 და 30;27 da 32;29 da 31',
          '28 და 34;27 და 32;29 და 34;31 და 33',
          '30 და 36;29 და 34;31 და 36;33 და 35',
          '32 და 38;31 და 36;33 და 38;35 და 37',
        ],
      },
      evenPair: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      dist1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      dist2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      dist3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => String(v.evenPair),
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars }) => [String(vars.dist1), String(vars.dist2), String(vars.dist3)],
    explanation: ({ answer }) => `„${answer}“ — ორივე რიცხვი ლუწია.`,
  }),

  // ==================================================================
  // U02.2 — Counting Objects (საგნების დათვლა)
  // ==================================================================

  // Q07 (Level 1)
  defineTemplate({
    ...addr({ id: 'g2-u02-07', subtopicId: 'u02-counting-objects', difficulty: 1 }),
    prompt: 'რამდენი {item} გამოსახული სურათზე?\n\n{visual}',
    variables: {
      type: {
        kind: 'choice',
        values: [
          'ვაშლი;🍎',
          'მსხალი;🍐',
          'ფორთოხალი;🍊',
          'მარწყვი;🍓',
          'ალუბალი;🍒',
          'ლიმონი;🍋',
        ],
      },
      count: { kind: 'int', min: 3, max: 9 },
      item: { kind: 'choice', values: (v) => [String(v.type).split(';')[0]] },
      emoji: { kind: 'choice', values: (v) => [String(v.type).split(';')[1]] },
      visual: {
        kind: 'choice',
        values: (v) => {
          const e = String(v.emoji);
          const c = Number(v.count);
          return [Array(c).fill(e).join(' ')];
        },
      },
    },
    answer: (v) => Number(v.count),
    format: { kind: 'integer', min: 1, max: 15 },
    optionCount: 4,
    distractors: ({ answer }) => [Number(answer) - 1, Number(answer) + 1, Number(answer) + 2],
    explanation: ({ vars, answer }) => `სურათზე სულ ${answer} ${vars.item}.`,
  }),

  // Q08 (Level 1)
  defineTemplate({
    ...addr({ id: 'g2-u02-08', subtopicId: 'u02-counting-objects', difficulty: 1 }),
    prompt: 'დაითვალე, რამდენი {item} სურათზე:\n\n{visual}',
    variables: {
      type: {
        kind: 'choice',
        values: [
          'ვარსკვლავია;⭐',
          'ბუშტია;🎈',
          'ყვავილია;🌸',
          'კრისტალია;💎',
          'ბურთია;⚽',
          'მანქანაა;🚗',
        ],
      },
      count: { kind: 'int', min: 5, max: 11 },
      item: { kind: 'choice', values: (v) => [String(v.type).split(';')[0]] },
      emoji: { kind: 'choice', values: (v) => [String(v.type).split(';')[1]] },
      visual: {
        kind: 'choice',
        values: (v) => {
          const e = String(v.emoji);
          const c = Number(v.count);
          return [Array(c).fill(e).join(' ')];
        },
      },
    },
    answer: (v) => Number(v.count),
    format: { kind: 'integer', min: 1, max: 20 },
    optionCount: 4,
    distractors: ({ answer }) => [Number(answer) - 1, Number(answer) + 1, Number(answer) - 2],
    explanation: ({ vars, answer }) => `სულ გამოსახულია ${answer} ${vars.item}.`,
  }),

  // Q09 (Level 2)
  defineTemplate({
    ...addr({ id: 'g2-u02-09', subtopicId: 'u02-counting-objects', difficulty: 2 }),
    prompt: 'კალათაში იყო {a} {fruit}. დაამატეს კიდევ {b} {fruit}. რამდენი {fruit} კალათაში ახლა?',
    variables: {
      fruit: { kind: 'choice', values: ['მსხალი', 'ვაშლი', 'ფორთოხალი', 'ატამი', 'ქლიავი'] },
      a: { kind: 'int', min: 3, max: 12 },
      b: { kind: 'int', min: 2, max: 8 },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 1, max: 30 },
    optionCount: 4,
    distractors: ({ vars, answer }) => [
      Number(answer) - 1,
      Number(answer) + 1,
      Number(vars.a) + Number(vars.b) + 2,
    ],
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${answer} ${vars.fruit}.`,
  }),

  // Q10 (Level 2)
  defineTemplate({
    ...addr({ id: 'g2-u02-10', subtopicId: 'u02-counting-objects', difficulty: 2 }),
    prompt: 'მაგიდაზე იყო {total} {item}. {taken} აიღეს. რამდენი {item} დარჩა?',
    variables: {
      item: { kind: 'choice', values: ['ფანქარი', 'რვეული', 'წიგნი', 'კუბი', 'საშლელი'] },
      total: { kind: 'int', min: 7, max: 18 },
      taken: { kind: 'int', min: 2, max: 6 },
    },
    constraints: [{ test: (v) => Number(v.total) > Number(v.taken), note: 'positive difference' }],
    answer: (v) => Number(v.total) - Number(v.taken),
    format: { kind: 'integer', min: 1, max: 20 },
    optionCount: 4,
    distractors: ({ vars, answer }) => [
      Number(answer) - 1,
      Number(answer) + 1,
      Number(vars.total) + Number(vars.taken),
    ],
    explanation: ({ vars, answer }) =>
      `${vars.total} − ${vars.taken} = ${answer} ${vars.item}.`,
  }),

  // Q11 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u02-11', subtopicId: 'u02-counting-objects', difficulty: 3 }),
    prompt: 'რამდენი საგანია სულ?\n\n{visual}',
    variables: {
      a: { kind: 'int', min: 2, max: 6 },
      b: { kind: 'int', min: 2, max: 6 },
      visual: {
        kind: 'choice',
        values: (v) => [
          `${Array(Number(v.a)).fill('🟦').join(' ')}   ${Array(Number(v.b)).fill('🟡').join(' ')}`,
        ],
      },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 1, max: 20 },
    optionCount: 4,
    distractors: ({ vars, answer }) => [
      Number(answer) - 1,
      Number(answer) + 1,
      Number(vars.a) + 1,
    ],
    explanation: ({ vars, answer }) =>
      `${vars.a} ლურჯ კვადრატს დამატებული ${vars.b} ყვითელი წრე არის ${vars.a} + ${vars.b} = ${answer} საგანი.`,
  }),

  // Q12 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u02-12', subtopicId: 'u02-counting-objects', difficulty: 3 }),
    prompt: 'სურათზე გამოსახულია {a} წითელი და {b} მწვანე კუბი:\n\n{visual}\n\nრამდენით მეტია წითელი კუბი მწვანეზე?',
    variables: {
      a: { kind: 'int', min: 5, max: 9 },
      b: { kind: 'int', min: 2, max: 4 },
      visual: {
        kind: 'choice',
        values: (v) => [
          `წითელი: ${Array(Number(v.a)).fill('🟥').join(' ')}\nმწვანე:  ${Array(Number(v.b)).fill('🟩').join(' ')}`,
        ],
      },
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 1, max: 15 },
    optionCount: 4,
    distractors: ({ vars, answer }) => [
      Number(answer) + 1,
      Number(answer) - 1 > 0 ? Number(answer) - 1 : Number(answer) + 2,
      Number(vars.a) + Number(vars.b),
    ],
    explanation: ({ vars, answer }) =>
      `${vars.a} წითელ კუბს გამოკლებული ${vars.b} მწვანე კუბი: ${vars.a} − ${vars.b} = ${answer}.`,
  }),

  // ==================================================================
  // U02.3 — Counting with Steps (ნაბიჯებით თვლა)
  // ==================================================================

  // Q13 (Level 1)
  defineTemplate({
    ...addr({ id: 'g2-u02-13', subtopicId: 'u02-counting-with-steps', difficulty: 1 }),
    prompt: 'გააგრძელე 1-ით თვლა: {a}, {b}, {c}, □',
    variables: {
      start: { kind: 'int', min: 1, max: 40 },
      a: { kind: 'choice', values: (v) => [Number(v.start)] },
      b: { kind: 'choice', values: (v) => [Number(v.start) + 1] },
      c: { kind: 'choice', values: (v) => [Number(v.start) + 2] },
    },
    answer: (v) => Number(v.start) + 3,
    format: { kind: 'integer', min: 1, max: 50 },
    optionCount: 4,
    distractors: ({ answer }) => [Number(answer) + 1, Number(answer) - 1, Number(answer) + 2],
    explanation: ({ vars, answer }) =>
      `მიმდევრობა იზრდება 1-ით: ${vars.c} + 1 = ${answer}.`,
  }),

  // Q14 (Level 1)
  defineTemplate({
    ...addr({ id: 'g2-u02-14', subtopicId: 'u02-counting-with-steps', difficulty: 1 }),
    prompt: 'გააგრძელე 2-ით თვლა: {a}, {b}, {c}, □',
    variables: {
      start: { kind: 'int', min: 2, max: 40 },
      a: { kind: 'choice', values: (v) => [Number(v.start)] },
      b: { kind: 'choice', values: (v) => [Number(v.start) + 2] },
      c: { kind: 'choice', values: (v) => [Number(v.start) + 4] },
    },
    answer: (v) => Number(v.start) + 6,
    format: { kind: 'integer', min: 1, max: 60 },
    optionCount: 4,
    distractors: ({ answer }) => [Number(answer) - 1, Number(answer) + 1, Number(answer) + 2],
    explanation: ({ vars, answer }) =>
      `თითოეულ ნაბიჯზე 2 ემატება: ${vars.c} + 2 = ${answer}.`,
  }),

  // Q15 (Level 2)
  defineTemplate({
    ...addr({ id: 'g2-u02-15', subtopicId: 'u02-counting-with-steps', difficulty: 2 }),
    prompt: 'გააგრძელე {step}-ით თვლა: {a}, {b}, {c}, □',
    variables: {
      step: { kind: 'choice', values: [5, 10] },
      mult: { kind: 'int', min: 1, max: 7 },
      a: { kind: 'choice', values: (v) => [Number(v.mult) * Number(v.step)] },
      b: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.step)] },
      c: { kind: 'choice', values: (v) => [Number(v.a) + 2 * Number(v.step)] },
    },
    answer: (v) => Number(v.a) + 3 * Number(v.step),
    format: { kind: 'integer', min: 1, max: 100 },
    optionCount: 4,
    distractors: ({ vars, answer }) => [
      Number(answer) - Number(vars.step) + 1,
      Number(answer) - Number(vars.step) + 3,
      Number(answer) + Number(vars.step),
    ],
    explanation: ({ vars, answer }) =>
      `ნაბიჯია +${vars.step}: ${vars.c} + ${vars.step} = ${answer}.`,
  }),

  // Q16 (Level 2)
  defineTemplate({
    ...addr({ id: 'g2-u02-16', subtopicId: 'u02-counting-with-steps', difficulty: 2 }),
    prompt: 'შეავსე უკუთვლა: {a}, {b}, {c}, □, {e}',
    variables: {
      step: { kind: 'choice', values: [1, 2] },
      start: { kind: 'int', min: 10, max: 40 },
      a: { kind: 'choice', values: (v) => [Number(v.start)] },
      b: { kind: 'choice', values: (v) => [Number(v.start) - Number(v.step)] },
      c: { kind: 'choice', values: (v) => [Number(v.start) - 2 * Number(v.step)] },
      e: { kind: 'choice', values: (v) => [Number(v.start) - 4 * Number(v.step)] },
    },
    answer: (v) => Number(v.start) - 3 * Number(v.step),
    format: { kind: 'integer', min: 1, max: 50 },
    optionCount: 4,
    distractors: ({ vars, answer }) => [
      Number(answer) - 1,
      Number(answer) + 1,
      Number(answer) - Number(vars.step) - 1,
    ],
    explanation: ({ vars, answer }) =>
      `მიმდევრობა უკან მცირდება ${vars.step}-ით: ${vars.c} − ${vars.step} = ${answer}.`,
  }),

  // Q17 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u02-17', subtopicId: 'u02-counting-with-steps', difficulty: 3 }),
    prompt: 'დაიწყე რიცხვიდან {start} და ყოველ ჯერზე დაამატე {step}. რა რიცხვს მიიღებ {count} ნაბიჯის შემდეგ?',
    variables: {
      start: { kind: 'int', min: 2, max: 15 },
      step: { kind: 'int', min: 2, max: 4 },
      count: { kind: 'int', min: 3, max: 4 },
    },
    answer: (v) => Number(v.start) + Number(v.count) * Number(v.step),
    format: { kind: 'integer', min: 1, max: 50 },
    optionCount: 4,
    distractors: ({ vars, answer }) => [
      Number(answer) - Number(vars.step),
      Number(answer) + Number(vars.step),
      Number(answer) - 1,
    ],
    explanation: ({ vars, answer }) =>
      `${vars.start} + (${vars.step} × ${vars.count}) = ${vars.start} + ${Number(vars.step) * Number(vars.count)} = ${answer}.`,
  }),

  // Q18 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u02-18', subtopicId: 'u02-counting-with-steps', difficulty: 3 }),
    prompt: 'დაიწყე რიცხვიდან {start} და ყოველ ჯერზე გამოაკელი {step}. რა რიცხვს მიიღებ {count} ნაბიჯის შემდეგ?',
    variables: {
      start: { kind: 'int', min: 20, max: 40 },
      step: { kind: 'int', min: 2, max: 4 },
      count: { kind: 'int', min: 2, max: 3 },
    },
    answer: (v) => Number(v.start) - Number(v.count) * Number(v.step),
    format: { kind: 'integer', min: 1, max: 50 },
    optionCount: 4,
    distractors: ({ vars, answer }) => [
      Number(answer) - Number(vars.step),
      Number(answer) + Number(vars.step),
      Number(answer) + 1,
    ],
    explanation: ({ vars, answer }) =>
      `${vars.start} − (${vars.step} × ${vars.count}) = ${vars.start} − ${Number(vars.step) * Number(vars.count)} = ${answer}.`,
  }),

  // ==================================================================
  // U02.4 — Counting with Tables (ცხრილით თვლა)
  // ==================================================================

  // Q19 (Level 1)
  defineTemplate({
    ...addr({ id: 'g2-u02-19', subtopicId: 'u02-counting-with-tables', difficulty: 1 }),
    prompt: 'ცხრილის თითოეული სიმბოლო აღნიშნავს ერთ {item}. რამდენი {item} ცხრილში სულ?\n\n{gridVisual}',
    variables: {
      item: { kind: 'choice', values: ['ვარსკვლავია', 'ნიშნულია', 'სიმბოლოა'] },
      r1: { kind: 'int', min: 2, max: 3 },
      r2: { kind: 'int', min: 1, max: 3 },
      gridVisual: {
        kind: 'choice',
        values: (v) => [starTableVisual(Number(v.r1), Number(v.r2))],
      },
    },
    answer: (v) => Number(v.r1) + Number(v.r2),
    format: { kind: 'integer', min: 1, max: 10 },
    optionCount: 4,
    distractors: ({ answer }) => [Number(answer) - 1, Number(answer) + 1, Number(answer) + 2],
    explanation: ({ vars, answer }) =>
      `პირველ რიგშია ${vars.r1}, მეორეში — ${vars.r2}. სულ: ${vars.r1} + ${vars.r2} = ${answer} ${vars.item}.`,
  }),

  // Q20 (Level 1)
  defineTemplate({
    ...addr({ id: 'g2-u02-20', subtopicId: 'u02-counting-with-tables', difficulty: 1 }),
    prompt: 'ცხრილის მიხედვით, რომელ დღეს აქვს {name}-ს ყველაზე მეტი {item}?\n\n{tableVisual}',
    variables: {
      name: { kind: 'choice', values: ['ნიკას', 'ანას', 'ლუკას', 'გიორგის'] },
      item: { kind: 'choice', values: ['წიგნი', 'რვეული', 'ფანქარი'] },
      a: { kind: 'int', min: 2, max: 8 },
      b: { kind: 'int', min: 2, max: 8 },
      c: { kind: 'int', min: 2, max: 8 },
      tableVisual: {
        kind: 'choice',
        values: (v) => [
          `| დღე | რაოდენობა |\n| :--- | :---: |\n| ორშაბათი | ${v.a} |\n| სამშაბათი | ${v.b} |\n| ოთხშაბათი | ${v.c} |`,
        ],
      },
    },
    constraints: [
      {
        test: (v) =>
          Number(v.a) !== Number(v.b) &&
          Number(v.b) !== Number(v.c) &&
          Number(v.a) !== Number(v.c),
        note: 'unique counts',
      },
    ],
    answer: (v) => {
      const max = Math.max(Number(v.a), Number(v.b), Number(v.c));
      if (max === Number(v.a)) return 'ორშაბათს';
      if (max === Number(v.b)) return 'სამშაბათს';
      return 'ოთხშაბათს';
    },
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ answer }) =>
      ['ორშაბათს', 'სამშაბათს', 'ოთხშაბათს', 'ყველა დღეს ერთნაირი'].filter((d) => d !== answer),
    explanation: ({ vars, answer }) =>
      `ყველაზე დიდი რიცხვია ${Math.max(Number(vars.a), Number(vars.b), Number(vars.c))}, რაც შეესაბამება დღეს: „${answer}“.`,
  }),

  // Q21 (Level 2)
  defineTemplate({
    ...addr({ id: 'g2-u02-21', subtopicId: 'u02-counting-with-tables', difficulty: 2 }),
    prompt: 'ცხრილში მოცემულია {category}-ის რაოდენობა:\n\n{tableVisual}\n\nრამდენი {category} სულ?',
    variables: {
      category: { kind: 'choice', values: ['სათამაშოა', 'ნივთია'] },
      a: { kind: 'int', min: 2, max: 5 },
      b: { kind: 'int', min: 2, max: 5 },
      c: { kind: 'int', min: 2, max: 5 },
      tableVisual: {
        kind: 'choice',
        values: (v) => [
          categoryTableVisual([
            { name: '🚗 მანქანა', count: Number(v.a) },
            { name: '⚽ ბურთი', count: Number(v.b) },
            { name: '🧸 დათუნია', count: Number(v.c) },
          ]),
        ],
      },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 1, max: 20 },
    optionCount: 4,
    distractors: ({ answer }) => [Number(answer) - 1, Number(answer) + 1, Number(answer) - 2],
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} + ${vars.c} = ${answer} ${vars.category}.`,
  }),

  // Q22 (Level 2)
  defineTemplate({
    ...addr({ id: 'g2-u02-22', subtopicId: 'u02-counting-with-tables', difficulty: 2 }),
    prompt: 'ცხრილში მოცემული რიცხვებიდან რამდენი რიცხვია ლუწი?\n\n{gridVisual}',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '2, 5, 8, 3, 6, 9;3',
          '4, 7, 10, 12, 13, 15;3',
          '1, 3, 5, 8, 11, 14;2',
          '6, 8, 10, 12, 15, 17;4',
          '3, 7, 9, 11, 13, 16;1',
          '2, 4, 6, 9, 11, 13;3',
          '10, 14, 18, 20, 21, 23;4',
          '7, 9, 13, 15, 18, 20;2',
          '1, 2, 4, 7, 9, 11;2',
          '8, 12, 14, 16, 17, 19;4',
        ],
      },
      gridVisual: {
        kind: 'choice',
        values: (v) => {
          const list = String(v.pack).split(';')[0].split(', ').map(Number);
          return [grid2x3Visual(list)];
        },
      },
      ans: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[1])] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer', min: 1, max: 6 },
    optionCount: 4,
    distractors: ({ answer }) => [1, 2, 3, 4, 5].filter((n) => n !== Number(answer)).slice(0, 3),
    explanation: ({ answer }) =>
      `ცხრილში მოცემული რიცხვებიდან ლუწია ზუსტად ${answer} რიცხვი.`,
  }),

  // Q23 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u02-23', subtopicId: 'u02-counting-with-tables', difficulty: 3 }),
    prompt: 'ცხრილში რიცხვები {step}-ით იზრდება. რა უნდა ეწეროს ცარიელ უჯრაში (?):\n\n{tableVisual}',
    variables: {
      step: { kind: 'choice', values: [2, 3, 4, 5] },
      start: { kind: 'int', min: 2, max: 20 },
      tableVisual: {
        kind: 'choice',
        values: (v) => {
          const s = Number(v.start);
          const st = Number(v.step);
          return [`| ${s} | ${s + st} | ${s + 2 * st} | ? |`];
        },
      },
    },
    answer: (v) => Number(v.start) + 3 * Number(v.step),
    format: { kind: 'integer', min: 1, max: 50 },
    optionCount: 4,
    distractors: ({ vars, answer }) => [
      Number(answer) - 1,
      Number(answer) + 1,
      Number(answer) + Number(vars.step),
    ],
    explanation: ({ vars, answer }) =>
      `წესის მიხედვით რიცხვები იზრდება ${vars.step}-ით: ${Number(vars.start) + 2 * Number(vars.step)} + ${vars.step} = ${answer}.`,
  }),

  // Q24 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u02-24', subtopicId: 'u02-counting-with-tables', difficulty: 3 }),
    prompt: 'ცხრილის მიხედვით, რამდენით მეტია ყველაზე დიდი რაოდენობა ყველაზე მცირეზე?\n\n{tableVisual}',
    variables: {
      a: { kind: 'int', min: 2, max: 12 },
      b: { kind: 'int', min: 2, max: 12 },
      c: { kind: 'int', min: 2, max: 12 },
      tableVisual: {
        kind: 'choice',
        values: (v) => [
          `| დღე | რაოდენობა |\n| :--- | :---: |\n| ორშაბათი | ${v.a} |\n| სამშაბათი | ${v.b} |\n| ოთხშაბათი | ${v.c} |`,
        ],
      },
    },
    constraints: [
      {
        test: (v) =>
          Math.max(Number(v.a), Number(v.b), Number(v.c)) -
            Math.min(Number(v.a), Number(v.b), Number(v.c)) >=
          2,
        note: 'gap at least 2',
      },
    ],
    answer: (v) =>
      Math.max(Number(v.a), Number(v.b), Number(v.c)) -
      Math.min(Number(v.a), Number(v.b), Number(v.c)),
    format: { kind: 'integer', min: 1, max: 20 },
    optionCount: 4,
    distractors: ({ answer }) => [
      Number(answer) - 1,
      Number(answer) + 1,
      Number(answer) + 2,
    ],
    explanation: ({ vars, answer }) => {
      const max = Math.max(Number(vars.a), Number(vars.b), Number(vars.c));
      const min = Math.min(Number(vars.a), Number(vars.b), Number(vars.c));
      return `უდიდესია ${max}, უმცირესია ${min}. სხვაობაა: ${max} − ${min} = ${answer}.`;
    },
  }),

  // ==================================================================
  // U02.5 — Number Sequences (რიცხვითი მიმდევრობები)
  // ==================================================================

  // Q25 (Level 1)
  defineTemplate({
    ...addr({ id: 'g2-u02-25', subtopicId: 'u02-number-sequences', difficulty: 1 }),
    prompt: 'შეავსე მიმდევრობა: {a}, {b}, {c}, {d}, □',
    variables: {
      start: { kind: 'int', min: 1, max: 50 },
      a: { kind: 'choice', values: (v) => [Number(v.start)] },
      b: { kind: 'choice', values: (v) => [Number(v.start) + 1] },
      c: { kind: 'choice', values: (v) => [Number(v.start) + 2] },
      d: { kind: 'choice', values: (v) => [Number(v.start) + 3] },
    },
    answer: (v) => Number(v.start) + 4,
    format: { kind: 'integer', min: 1, max: 60 },
    optionCount: 4,
    distractors: ({ answer }) => [Number(answer) + 1, Number(answer) - 1, Number(answer) + 2],
    explanation: ({ vars, answer }) =>
      `მიმდევრობა იზრდება 1-ით: ${vars.d} + 1 = ${answer}.`,
  }),

  // Q26 (Level 2)
  defineTemplate({
    ...addr({ id: 'g2-u02-26', subtopicId: 'u02-number-sequences', difficulty: 2 }),
    prompt: 'შეავსე გამოტოვებული რიცხვი მიმდევრობაში: {a}, {b}, {c}, □, {e}',
    variables: {
      start: { kind: 'int', min: 2, max: 40 },
      step: { kind: 'choice', values: [2, 3] },
      a: { kind: 'choice', values: (v) => [Number(v.start)] },
      b: { kind: 'choice', values: (v) => [Number(v.start) + Number(v.step)] },
      c: { kind: 'choice', values: (v) => [Number(v.start) + 2 * Number(v.step)] },
      e: { kind: 'choice', values: (v) => [Number(v.start) + 4 * Number(v.step)] },
    },
    answer: (v) => Number(v.start) + 3 * Number(v.step),
    format: { kind: 'integer', min: 1, max: 60 },
    optionCount: 4,
    distractors: ({ answer }) => [Number(answer) - 1, Number(answer) + 1, Number(answer) + 4],
    explanation: ({ vars, answer }) =>
      `მიმდევრობა იზრდება ${vars.step}-ით: ${vars.c} + ${vars.step} = ${answer}.`,
  }),

  // Q27 (Level 2)
  defineTemplate({
    ...addr({ id: 'g2-u02-27', subtopicId: 'u02-number-sequences', difficulty: 2 }),
    prompt: 'რომელი რიცხვი აკლია მიმდევრობაში: {a}, {b}, □, {d}, {e}?',
    variables: {
      step: { kind: 'choice', values: [1, 2] },
      start: { kind: 'int', min: 10, max: 50 },
      a: { kind: 'choice', values: (v) => [Number(v.start)] },
      b: { kind: 'choice', values: (v) => [Number(v.start) - Number(v.step)] },
      d: { kind: 'choice', values: (v) => [Number(v.start) - 3 * Number(v.step)] },
      e: { kind: 'choice', values: (v) => [Number(v.start) - 4 * Number(v.step)] },
    },
    answer: (v) => Number(v.start) - 2 * Number(v.step),
    format: { kind: 'integer', min: 1, max: 60 },
    optionCount: 4,
    distractors: ({ answer }) => [Number(answer) - 1, Number(answer) + 1, Number(answer) + 3],
    explanation: ({ vars, answer }) =>
      `რიცხვები მცირდება ${vars.step}-ით: ${vars.b} − ${vars.step} = ${answer}.`,
  }),

  // Q28 (Level 2)
  defineTemplate({
    ...addr({ id: 'g2-u02-28', subtopicId: 'u02-number-sequences', difficulty: 2 }),
    prompt: 'იპოვე შემდეგი რიცხვი მიმდევრობაში: {a}, {b}, {c}, {d}, □',
    variables: {
      step: { kind: 'choice', values: [3, 4, 5] },
      start: { kind: 'int', min: 2, max: 20 },
      a: { kind: 'choice', values: (v) => [Number(v.start)] },
      b: { kind: 'choice', values: (v) => [Number(v.start) + Number(v.step)] },
      c: { kind: 'choice', values: (v) => [Number(v.start) + 2 * Number(v.step)] },
      d: { kind: 'choice', values: (v) => [Number(v.start) + 3 * Number(v.step)] },
    },
    answer: (v) => Number(v.start) + 4 * Number(v.step),
    format: { kind: 'integer', min: 1, max: 60 },
    optionCount: 4,
    distractors: ({ answer }) => [
      Number(answer) - 1,
      Number(answer) - 2,
      Number(answer) + 1,
    ],
    explanation: ({ vars, answer }) =>
      `თითოეულ ნაბიჯზე ემატება ${vars.step}: ${vars.d} + ${vars.step} = ${answer}.`,
  }),

  // Q29 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u02-29', subtopicId: 'u02-number-sequences', difficulty: 3 }),
    prompt: 'რომელი რიცხვი არ შეესაბამება მიმდევრობის წესს: {seqStr}?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '2, 4, 6, 9, 10;9;8;2;2, 4, 10',
          '3, 6, 9, 11, 15;11;12;3;3, 6, 15',
          '5, 10, 14, 20, 25;14;15;5;5, 10, 25',
          '4, 8, 13, 16, 20;13;12;4;4, 8, 20',
          '10, 20, 25, 40, 50;25;30;10;10, 20, 50',
          '1, 3, 5, 8, 9;8;7;2;1, 3, 9',
          '6, 12, 17, 24, 30;17;18;6;6, 12, 30',
          '2, 5, 8, 12, 14;12;11;3;2, 5, 14',
          '7, 14, 20, 28, 35;20;21;7;7, 14, 35',
          '8, 16, 25, 32, 40;25;24;8;8, 16, 40',
        ],
      },
      seqStr: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      wrongVal: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[1])] },
      expectedVal: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[2])] },
      step: { kind: 'choice', values: (v) => [Number(String(v.pack).split(';')[3])] },
      distractorStr: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => Number(v.wrongVal),
    format: { kind: 'integer', min: 1, max: 60 },
    optionCount: 4,
    distractors: ({ vars }) => String(vars.distractorStr).split(', ').map(Number),
    explanation: ({ vars, answer }) =>
      `მიმდევრობა უნდა იზრდებოდეს ${vars.step}-ით. ${answer}-ის ნაცვლად უნდა ეწეროს ${vars.expectedVal}.`,
  }),

  // Q30 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u02-30', subtopicId: 'u02-number-sequences', difficulty: 3 }),
    prompt: 'შეავსე ორი გამოტოვებული რიცხვი მიმდევრობაში: {a}, □, {c}, □, {e}',
    variables: {
      step: { kind: 'choice', values: [2, 3, 5] },
      start: { kind: 'int', min: 2, max: 20 },
      a: { kind: 'choice', values: (v) => [Number(v.start)] },
      c: { kind: 'choice', values: (v) => [Number(v.start) + 2 * Number(v.step)] },
      e: { kind: 'choice', values: (v) => [Number(v.start) + 4 * Number(v.step)] },
    },
    answer: (v) =>
      `${Number(v.start) + Number(v.step)} და ${Number(v.start) + 3 * Number(v.step)}`,
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars }) => {
      const b = Number(vars.start) + Number(vars.step);
      const d = Number(vars.start) + 3 * Number(vars.step);
      return [
        `${b - 1} და ${d}`,
        `${b} და ${d + 1}`,
        `${b + 1} და ${d - 1}`,
      ];
    },
    explanation: ({ vars, answer }) =>
      `მიმდევრობა იზრდება ${vars.step}-ით: გამოტოვებული რიცხვებია ${answer}.`,
  }),

  // ==================================================================
  // U02.6 — Moves on the Number Line (რიცხვით ღერძზე გადაადგილება)
  // ==================================================================

  // Q31 (Level 1)
  defineTemplate({
    ...addr({ id: 'g2-u02-31', subtopicId: 'u02-moves-on-number-line', difficulty: 1 }),
    prompt: 'რიცხვით ღერძზე დგახარ რიცხვ {start}-ზე. {step} ნაბიჯით მარჯვნივ მიდიხარ. რომელ რიცხვზე აღმოჩნდები?\n\n{lineVisual}',
    variables: {
      start: { kind: 'int', min: 2, max: 20 },
      step: { kind: 'choice', values: [1, 2] },
      lineVisual: { kind: 'choice', values: (v) => [numberLineMini(Number(v.start))] },
    },
    answer: (v) => Number(v.start) + Number(v.step),
    format: { kind: 'integer', min: 1, max: 30 },
    optionCount: 4,
    distractors: ({ vars }) => [
      Number(vars.start) - 1,
      Number(vars.start),
      Number(vars.start) + Number(vars.step) + 1,
    ],
    explanation: ({ vars, answer }) =>
      `მარჯვნივ გადასვლა ზრდის რიცხვს: ${vars.start} + ${vars.step} = ${answer}.`,
  }),

  // Q32 (Level 1)
  defineTemplate({
    ...addr({ id: 'g2-u02-32', subtopicId: 'u02-moves-on-number-line', difficulty: 1 }),
    prompt: 'რიცხვით ღერძზე დგახარ რიცხვ {start}-ზე და {step} ნაბიჯით მარცხნივ მიდიხარ. სად აღმოჩნდები?\n\n{lineVisual}',
    variables: {
      start: { kind: 'int', min: 5, max: 25 },
      step: { kind: 'choice', values: [1, 2] },
      lineVisual: { kind: 'choice', values: (v) => [numberLineMini(Number(v.start))] },
    },
    answer: (v) => Number(v.start) - Number(v.step),
    format: { kind: 'integer', min: 1, max: 30 },
    optionCount: 4,
    distractors: ({ vars }) => [
      Number(vars.start) - Number(vars.step) - 1,
      Number(vars.start) - Number(vars.step) + 1,
      Number(vars.start) + Number(vars.step),
    ],
    explanation: ({ vars, answer }) =>
      `მარცხნივ გადასვლა ამცირებს რიცხვს: ${vars.start} − ${vars.step} = ${answer}.`,
  }),

  // Q33 (Level 2)
  defineTemplate({
    ...addr({ id: 'g2-u02-33', subtopicId: 'u02-moves-on-number-line', difficulty: 2 }),
    prompt: 'დგახარ რიცხვ {start}-ზე. {step} ნაბიჯით მარჯვნივ მიდიხარ. რომელ რიცხვზე აღმოჩნდები?\n\n{lineVisual}',
    variables: {
      start: { kind: 'int', min: 2, max: 35 },
      step: { kind: 'int', min: 3, max: 6 },
      lineVisual: { kind: 'choice', values: (v) => [numberLineMini(Number(v.start))] },
    },
    answer: (v) => Number(v.start) + Number(v.step),
    format: { kind: 'integer', min: 1, max: 50 },
    optionCount: 4,
    distractors: ({ answer }) => [Number(answer) - 1, Number(answer) + 1, Number(answer) + 2],
    explanation: ({ vars, answer }) =>
      `${vars.start} + ${vars.step} = ${answer}.`,
  }),

  // Q34 (Level 2)
  defineTemplate({
    ...addr({ id: 'g2-u02-34', subtopicId: 'u02-moves-on-number-line', difficulty: 2 }),
    prompt: 'დგახარ რიცხვ {start}-ზე და {step} ნაბიჯით მარცხნივ მიდიხარ. სად აღმოჩნდები?\n\n{lineVisual}',
    variables: {
      start: { kind: 'int', min: 8, max: 40 },
      step: { kind: 'int', min: 3, max: 6 },
      lineVisual: { kind: 'choice', values: (v) => [numberLineMini(Number(v.start))] },
    },
    answer: (v) => Number(v.start) - Number(v.step),
    format: { kind: 'integer', min: 1, max: 50 },
    optionCount: 4,
    distractors: ({ answer }) => [Number(answer) - 1, Number(answer) + 1, Number(answer) + 2],
    explanation: ({ vars, answer }) =>
      `${vars.start} − ${vars.step} = ${answer}.`,
  }),

  // Q35 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u02-35', subtopicId: 'u02-moves-on-number-line', difficulty: 3 }),
    prompt: 'დგახარ რიცხვ {start}-ზე. ჯერ {step1} ნაბიჯით მარჯვნივ მიდიხარ, შემდეგ კი {step2} ნაბიჯით მარცხნივ. სად აღმოჩნდები?\n\n{lineVisual}',
    variables: {
      start: { kind: 'int', min: 4, max: 30 },
      step1: { kind: 'int', min: 2, max: 7 },
      step2: { kind: 'int', min: 1, max: 5 },
      lineVisual: { kind: 'choice', values: (v) => [numberLineMini(Number(v.start))] },
    },
    answer: (v) => Number(v.start) + Number(v.step1) - Number(v.step2),
    format: { kind: 'integer', min: 1, max: 50 },
    optionCount: 4,
    distractors: ({ vars, answer }) => [
      Number(answer) - 1,
      Number(answer) + 1,
      Number(vars.start) + Number(vars.step1) + Number(vars.step2),
    ],
    explanation: ({ vars, answer }) =>
      `${vars.start} + ${vars.step1} − ${vars.step2} = ${answer}.`,
  }),

  // Q36 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u02-36', subtopicId: 'u02-moves-on-number-line', difficulty: 3 }),
    prompt: 'რიცხვით ღერძზე {step} ნაბიჯით მარჯვნივ გადაადგილების შემდეგ მიიღე {finish}. საიდან დაიწყე?\n\n{lineVisual}',
    variables: {
      step: { kind: 'int', min: 3, max: 7 },
      finish: { kind: 'int', min: 10, max: 40 },
      lineVisual: { kind: 'choice', values: (v) => [numberLineMini(Number(v.finish))] },
    },
    answer: (v) => Number(v.finish) - Number(v.step),
    format: { kind: 'integer', min: 1, max: 40 },
    optionCount: 4,
    distractors: ({ vars, answer }) => [
      Number(answer) - 1,
      Number(answer) + 1,
      Number(vars.finish) + Number(vars.step),
    ],
    explanation: ({ vars, answer }) =>
      `საწყისი რიცხვის საპოვნელად საბოლოოს ვაკლებთ ნაბიჯებს: ${vars.finish} − ${vars.step} = ${answer}.`,
  }),

  // ==================================================================
  // U02.7 — Sorting Even and Odd (ლუწი და კენტი რიცხვების დახარისხება)
  // ==================================================================

  // Q37 (Level 1)
  defineTemplate({
    ...addr({ id: 'g2-u02-37', subtopicId: 'u02-sorting-even-odd', difficulty: 1 }),
    prompt: 'მოცემულია რიცხვები: {numList}.\nრომელ ვარიანტშია ისინი სწორად დახარისხებული ლუწ და კენტ ჯგუფებად?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '11, 14, 17, 20;ლუწი: 14, 20 | კენტი: 11, 17;ლუწი: 11, 20 | კენტი: 14, 17;ლუწი: 14, 17 | კენტი: 11, 20;ლუწი: 11, 17 | კენტი: 14, 20',
          '21, 24, 27, 30;ლუწი: 24, 30 | კენტი: 21, 27;ლუწი: 21, 30 | კენტი: 24, 27;ლუწი: 24, 27 | კენტი: 21, 30;ლუწი: 21, 27 | კენტი: 24, 30',
          '31, 34, 37, 40;ლუწი: 34, 40 | კენტი: 31, 37;ლუწი: 31, 40 | კენტი: 34, 37;ლუწი: 34, 37 | კენტი: 31, 40;ლუწი: 31, 37 | კენტი: 34, 40',
          '41, 44, 47, 50;ლუწი: 44, 50 | კენტი: 41, 47;ლუწი: 41, 50 | კენტი: 44, 47;ლუწი: 44, 47 | კენტი: 41, 50;ლუწი: 41, 47 | კენტი: 44, 50',
          '5, 8, 11, 16;ლუწი: 8, 16 | კენტი: 5, 11;ლუწი: 5, 16 | კენტი: 8, 11;ლუწი: 8, 11 | კენტი: 5, 16;ლუწი: 5, 11 | კენტი: 8, 16',
          '13, 18, 23, 28;ლუწი: 18, 28 | კენტი: 13, 23;ლუწი: 13, 28 | კენტი: 18, 23;ლუწი: 18, 23 | კენტი: 13, 28;ლუწი: 13, 23 | კენტი: 18, 28',
          '7, 12, 19, 26;ლუწი: 12, 26 | კენტი: 7, 19;ლუწი: 7, 26 | კენტი: 12, 19;ლუწი: 12, 19 | კენტი: 7, 26;ლუწი: 7, 19 | კენტი: 12, 26',
          '15, 22, 29, 36;ლუწი: 22, 36 | კენტი: 15, 29;ლუწი: 15, 36 | კენტი: 22, 29;ლუწი: 22, 29 | კენტი: 15, 36;ლუწი: 15, 29 | კენტი: 22, 36',
          '9, 14, 21, 32;ლუწი: 14, 32 | კენტი: 9, 21;ლუწი: 9, 32 | კენტი: 14, 21;ლუწი: 14, 21 | კენტი: 9, 32;ლუწი: 9, 21 | კენტი: 14, 32',
          '3, 6, 17, 24;ლუწი: 6, 24 | კენტი: 3, 17;ლუწი: 3, 24 | კენტი: 6, 17;ლუწი: 6, 17 | კენტი: 3, 24;ლუწი: 3, 17 | კენტი: 6, 24',
        ],
      },
      numList: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      dist1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      dist2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      dist3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars }) => [String(vars.dist1), String(vars.dist2), String(vars.dist3)],
    explanation: ({ answer }) => `სწორი დახარისხებაა: ${answer}.`,
  }),

  // Q38 (Level 1)
  defineTemplate({
    ...addr({ id: 'g2-u02-38', subtopicId: 'u02-sorting-even-odd', difficulty: 1 }),
    prompt: 'მოცემულია რიცხვები: {numList}.\nრომელი რიცხვები უნდა მოთავსდეს „ლუწი“-ს ყუთში?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '3, 6, 9, 12, 15;6, 12;3, 9, 15;6, 9, 12;3, 12',
          '5, 8, 11, 14, 17;8, 14;5, 11, 17;8, 11, 14;5, 14',
          '7, 10, 13, 16, 19;10, 16;7, 13, 19;10, 13, 16;7, 16',
          '1, 4, 7, 10, 13;4, 10;1, 7, 13;4, 7, 10;1, 10',
          '9, 14, 17, 22, 27;14, 22;9, 17, 27;14, 17, 22;9, 22',
          '11, 16, 21, 26, 31;16, 26;11, 21, 31;16, 21, 26;11, 26',
          '13, 18, 23, 28, 33;18, 28;13, 23, 33;18, 23, 28;13, 28',
          '15, 20, 25, 30, 35;20, 30;15, 25, 35;20, 25, 30;15, 30',
          '17, 24, 29, 36, 41;24, 36;17, 29, 41;24, 29, 36;17, 36',
          '19, 28, 33, 42, 47;28, 42;19, 33, 47;28, 33, 42;19, 42',
        ],
      },
      numList: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      evens: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      dist1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      dist2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      dist3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.evens),
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars }) => [String(vars.dist1), String(vars.dist2), String(vars.dist3)],
    explanation: ({ answer }) => `მოცემულ რიცხვებს შორის ლუწია მხოლოდ ${answer}.`,
  }),

  // Q39 (Level 2)
  defineTemplate({
    ...addr({ id: 'g2-u02-39', subtopicId: 'u02-sorting-even-odd', difficulty: 2 }),
    prompt: 'დაახარისხე რიცხვები: {numList}.\nრომელი ჩანაწერია სწორი?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '1, 4, 6, 9, 12, 15;ლუწი: 4, 6, 12 | კენტი: 1, 9, 15;ლუწი: 1, 4, 6 | კენტი: 9, 12, 15;ლუწი: 4, 9, 12 | კენტი: 1, 6, 15;ლუწი: 1, 9, 15 | კენტი: 4, 6, 12',
          '2, 5, 8, 3, 7, 10;ლუწი: 2, 8, 10 | კენტი: 3, 5, 7;ლუწი: 2, 5, 8 | კენტი: 3, 7, 10;ლუწი: 2, 8, 7 | კენტი: 3, 5, 10;ლუწი: 3, 5, 7 | კენტი: 2, 8, 10',
          '3, 6, 9, 14, 17, 20;ლუწი: 6, 14, 20 | კენტი: 3, 9, 17;ლუწი: 3, 6, 14 | კენტი: 9, 17, 20;ლუწი: 6, 9, 20 | კენტი: 3, 14, 17;ლუწი: 3, 9, 17 | კენტი: 6, 14, 20',
          '5, 8, 11, 16, 21, 24;ლუწი: 8, 16, 24 | კენტი: 5, 11, 21;ლუწი: 5, 8, 16 | კენტი: 11, 21, 24;ლუწი: 8, 11, 24 | კენტი: 5, 16, 21;ლუწი: 5, 11, 21 | კენტი: 8, 16, 24',
          '7, 10, 13, 18, 23, 26;ლუწი: 10, 18, 26 | კენტი: 7, 13, 23;ლუწი: 7, 10, 18 | კენტი: 13, 23, 26;ლუწი: 10, 13, 26 | კენტი: 7, 18, 23;ლუწი: 7, 13, 23 | კენტი: 10, 18, 26',
          '9, 12, 15, 20, 25, 28;ლუწი: 12, 20, 28 | კენტი: 9, 15, 25;ლუწი: 9, 12, 20 | კენტი: 15, 25, 28;ლუწი: 12, 15, 28 | კენტი: 9, 20, 25;ლუწი: 9, 15, 25 | კენტი: 12, 20, 28',
          '11, 14, 19, 22, 27, 30;ლუწი: 14, 22, 30 | კენტი: 11, 19, 27;ლუწი: 11, 14, 22 | კენტი: 19, 27, 30;ლუწი: 14, 19, 30 | კენტი: 11, 22, 27;ლუწი: 11, 19, 27 | კენტი: 14, 22, 30',
          '13, 16, 21, 24, 29, 32;ლუწი: 16, 24, 32 | კენტი: 13, 21, 29;ლუწი: 13, 16, 24 | კენტი: 21, 29, 32;ლუწი: 16, 21, 32 | კენტი: 13, 24, 29;ლუწი: 13, 21, 29 | კენტი: 16, 24, 32',
          '15, 18, 23, 26, 31, 34;ლუწი: 18, 26, 34 | კენტი: 15, 23, 31;ლუწი: 15, 18, 26 | კენტი: 23, 31, 34;ლუწი: 18, 23, 34 | კენტი: 15, 26, 31;ლუწი: 15, 23, 31 | კენტი: 18, 26, 34',
          '17, 20, 25, 28, 33, 36;ლუწი: 20, 28, 36 | კენტი: 17, 25, 33;ლუწი: 17, 20, 28 | კენტი: 25, 33, 36;ლუწი: 20, 25, 36 | კენტი: 17, 28, 33;ლუწი: 17, 25, 33 | კენტი: 20, 28, 36',
          '19, 22, 27, 30, 35, 38;ლუწი: 22, 30, 38 | კენტი: 19, 27, 35;ლუწი: 19, 22, 30 | კენტი: 27, 35, 38;ლუწი: 22, 27, 38 | კენტი: 19, 30, 35;ლუწი: 19, 27, 35 | კენტი: 22, 30, 38',
          '21, 24, 29, 32, 37, 40;ლუწი: 24, 32, 40 | კენტი: 21, 29, 37;ლუწი: 21, 24, 32 | კენტი: 29, 37, 40;ლუწი: 24, 29, 40 | კენტი: 21, 32, 37;ლუწი: 21, 29, 37 | კენტი: 24, 32, 40',
          '23, 26, 31, 34, 39, 42;ლუწი: 26, 34, 42 | კენტი: 23, 31, 39;ლუწი: 23, 26, 34 | კენტი: 31, 39, 42;ლუწი: 26, 31, 42 | კენტი: 23, 34, 39;ლუწი: 23, 31, 39 | კენტი: 26, 34, 42',
          '25, 28, 33, 36, 41, 44;ლუწი: 28, 36, 44 | კენტი: 25, 33, 41;ლუწი: 25, 28, 36 | კენტი: 33, 41, 44;ლუწი: 28, 33, 44 | კენტი: 25, 36, 41;ლუწი: 25, 33, 41 | კენტი: 28, 36, 44',
          '27, 30, 35, 38, 43, 46;ლუწი: 30, 38, 46 | კენტი: 27, 35, 43;ლუწი: 27, 30, 38 | კენტი: 35, 43, 46;ლუწი: 30, 35, 46 | კენტი: 27, 38, 43;ლუწი: 27, 35, 43 | კენტი: 30, 38, 46',
          '29, 32, 37, 40, 45, 48;ლუწი: 32, 40, 48 | კენტი: 29, 37, 45;ლუწი: 29, 32, 40 | კენტი: 37, 45, 48;ლუწი: 32, 37, 48 | კენტი: 29, 40, 45;ლუწი: 29, 37, 45 | კენტი: 32, 40, 48',
        ],
      },
      numList: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      dist1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      dist2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      dist3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars }) => [String(vars.dist1), String(vars.dist2), String(vars.dist3)],
    explanation: ({ answer }) => `სწორი დახარისხებაა: ${answer}.`,
  }),

  // Q40 (Level 2)
  defineTemplate({
    ...addr({ id: 'g2-u02-40', subtopicId: 'u02-sorting-even-odd', difficulty: 2 }),
    prompt: 'მოცემულია რიცხვები: {numList}.\nრომელი რიცხვები უნდა მოთავსდეს „კენტი“-ს ყუთში?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '2, 5, 8, 11, 14, 17;5, 11, 17;2, 8, 14;5, 8, 17;2, 11, 17',
          '4, 7, 10, 13, 16, 19;7, 13, 19;4, 10, 16;7, 10, 19;4, 13, 19',
          '6, 9, 12, 15, 18, 21;9, 15, 21;6, 12, 18;9, 12, 21;6, 15, 21',
          '8, 11, 14, 17, 20, 23;11, 17, 23;8, 14, 20;11, 14, 23;8, 17, 23',
          '10, 13, 16, 19, 22, 25;13, 19, 25;10, 16, 22;13, 16, 25;10, 19, 25',
          '12, 15, 18, 21, 24, 27;15, 21, 27;12, 18, 24;15, 18, 27;12, 21, 27',
          '14, 17, 20, 23, 26, 29;17, 23, 29;14, 20, 26;17, 20, 29;14, 23, 29',
          '16, 19, 22, 25, 28, 31;19, 25, 31;16, 22, 28;19, 22, 31;16, 25, 31',
          '18, 21, 24, 27, 30, 33;21, 27, 33;18, 24, 30;21, 24, 33;18, 27, 33',
          '20, 23, 26, 29, 32, 35;23, 29, 35;20, 26, 32;23, 26, 35;20, 29, 35',
          '22, 25, 28, 31, 34, 37;25, 31, 37;22, 28, 34;25, 28, 37;22, 31, 37',
          '24, 27, 30, 33, 36, 39;27, 33, 39;24, 30, 36;27, 30, 39;24, 33, 39',
          '26, 29, 32, 35, 38, 41;29, 35, 41;26, 32, 38;29, 32, 41;26, 35, 41',
          '28, 31, 34, 37, 40, 43;31, 37, 43;28, 34, 40;31, 34, 43;28, 37, 43',
          '30, 33, 36, 39, 42, 45;33, 39, 45;30, 36, 42;33, 36, 45;30, 39, 45',
          '32, 35, 38, 41, 44, 47;35, 41, 47;32, 38, 44;35, 38, 47;32, 41, 47',
        ],
      },
      numList: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      odds: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      dist1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      dist2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      dist3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.odds),
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars }) => [String(vars.dist1), String(vars.dist2), String(vars.dist3)],
    explanation: ({ answer }) => `მოცემულ რიცხვებს შორის კენტია მხოლოდ ${answer}.`,
  }),

  // Q41 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u02-41', subtopicId: 'u02-sorting-even-odd', difficulty: 3 }),
    prompt: 'დაახარისხე რიცხვები: {numList}.\nგახსოვდეს: 0 ლუწი რიცხვია! რომელი განაწილებაა სწორი?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '0, 3, 6, 7, 8, 13;ლუწი: 0, 6, 8 | კენტი: 3, 7, 13;ლუწი: 6, 8 | კენტი: 0, 3, 7, 13;ლუწი: 0, 3, 8 | კენტი: 6, 7, 13;ლუწი: 3, 7, 13 | კენტი: 0, 6, 8',
          '0, 5, 10, 11, 14, 19;ლუწი: 0, 10, 14 | კენტი: 5, 11, 19;ლუწი: 10, 14 | კენტი: 0, 5, 11, 19;ლუწი: 0, 5, 14 | კენტი: 10, 11, 19;ლუწი: 5, 11, 19 | კენტი: 0, 10, 14',
          '0, 7, 12, 15, 16, 21;ლუწი: 0, 12, 16 | კენტი: 7, 15, 21;ლუწი: 12, 16 | კენტი: 0, 7, 15, 21;ლუწი: 0, 7, 16 | კენტი: 12, 15, 21;ლუწი: 7, 15, 21 | კენტი: 0, 12, 16',
          '0, 9, 14, 17, 18, 23;ლუწი: 0, 14, 18 | კენტი: 9, 17, 23;ლუწი: 14, 18 | კენტი: 0, 9, 17, 23;ლუწი: 0, 9, 18 | კენტი: 14, 17, 23;ლუწი: 9, 17, 23 | კენტი: 0, 14, 18',
          '0, 11, 16, 19, 22, 27;ლუწი: 0, 16, 22 | კენტი: 11, 19, 27;ლუწი: 16, 22 | კენტი: 0, 11, 19, 27;ლუწი: 0, 11, 22 | კენტი: 16, 19, 27;ლუწი: 11, 19, 27 | კენტი: 0, 16, 22',
          '0, 13, 18, 21, 24, 29;ლუწი: 0, 18, 24 | კენტი: 13, 21, 29;ლუწი: 18, 24 | კენტი: 0, 13, 21, 29;ლუწი: 0, 13, 24 | კენტი: 18, 21, 29;ლუწი: 13, 21, 29 | კენტი: 0, 18, 24',
          '0, 15, 20, 23, 26, 31;ლუწი: 0, 20, 26 | კენტი: 15, 23, 31;ლუწი: 20, 26 | კენტი: 0, 15, 23, 31;ლუწი: 0, 15, 26 | კენტი: 20, 23, 31;ლუწი: 15, 23, 31 | კენტი: 0, 20, 26',
          '0, 17, 22, 25, 28, 33;ლუწი: 0, 22, 28 | კენტი: 17, 25, 33;ლუწი: 22, 28 | კენტი: 0, 17, 25, 33;ლუწი: 0, 17, 28 | კენტი: 22, 25, 33;ლუწი: 17, 25, 33 | კენტი: 0, 22, 28',
          '0, 19, 24, 27, 30, 35;ლუწი: 0, 24, 30 | კენტი: 19, 27, 35;ლუწი: 24, 30 | კენტი: 0, 19, 27, 35;ლუწი: 0, 19, 30 | კენტი: 24, 27, 35;ლუწი: 19, 27, 35 | კენტი: 0, 24, 30',
          '0, 21, 26, 29, 32, 37;ლუწი: 0, 26, 32 | კენტი: 21, 29, 37;ლუწი: 26, 32 | კენტი: 0, 21, 29, 37;ლუწი: 0, 21, 32 | კენტი: 26, 29, 37;ლუწი: 21, 29, 37 | კენტი: 0, 26, 32',
          '0, 23, 28, 31, 34, 39;ლუწი: 0, 28, 34 | კენტი: 23, 31, 39;ლუწი: 28, 34 | კენტი: 0, 23, 31, 39;ლუწი: 0, 23, 34 | კენტი: 28, 31, 39;ლუწი: 23, 31, 39 | კენტი: 0, 28, 34',
          '0, 25, 30, 33, 36, 41;ლუწი: 0, 30, 36 | კენტი: 25, 33, 41;ლუწი: 30, 36 | კენტი: 0, 25, 33, 41;ლუწი: 0, 25, 36 | კენტი: 30, 33, 41;ლუწი: 25, 33, 41 | კენტი: 0, 30, 36',
          '0, 27, 32, 35, 38, 43;ლუწი: 0, 32, 38 | კენტი: 27, 35, 43;ლუწი: 32, 38 | კენტი: 0, 27, 35, 43;ლუწი: 0, 27, 38 | კენტი: 32, 35, 43;ლუწი: 27, 35, 43 | კენტი: 0, 32, 38',
          '0, 29, 34, 37, 40, 45;ლუწი: 0, 34, 40 | კენტი: 29, 37, 45;ლუწი: 34, 40 | კენტი: 0, 29, 37, 45;ლუწი: 0, 29, 40 | კენტი: 34, 37, 45;ლუწი: 29, 37, 45 | კენტი: 0, 34, 40',
          '0, 31, 36, 39, 42, 47;ლუწი: 0, 36, 42 | კენტი: 31, 39, 47;ლუწი: 36, 42 | კენტი: 0, 31, 39, 47;ლუწი: 0, 31, 42 | კენტი: 36, 39, 47;ლუწი: 31, 39, 47 | კენტი: 0, 36, 42',
          '0, 33, 38, 41, 44, 49;ლუწი: 0, 38, 44 | კენტი: 33, 41, 49;ლუწი: 38, 44 | კენტი: 0, 33, 41, 49;ლუწი: 0, 33, 44 | კენტი: 38, 41, 49;ლუწი: 33, 41, 49 | კენტი: 0, 38, 44',
        ],
      },
      numList: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      dist1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      dist2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      dist3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars }) => [String(vars.dist1), String(vars.dist2), String(vars.dist3)],
    explanation: ({ answer }) =>
      `0 იყოფა 2-ზე უნაშთოდ, ამიტომ 0 ლუწი რიცხვია! სწორი დახარისხებაა: ${answer}.`,
  }),

  // Q42 (Level 3)
  defineTemplate({
    ...addr({ id: 'g2-u02-42', subtopicId: 'u02-sorting-even-odd', difficulty: 3 }),
    prompt: 'დაახარისხე ორნიშნა რიცხვები: {numList}.\nრომელი განაწილებაა სწორი?',
    variables: {
      pack: {
        kind: 'choice',
        values: [
          '16, 19, 22, 25, 28, 31;ლუწი: 16, 22, 28 | კენტი: 19, 25, 31;ლუწი: 19, 22, 28 | კენტი: 16, 25, 31;ლუწი: 16, 25, 28 | კენტი: 19, 22, 31;ლუწი: 19, 25, 31 | კენტი: 16, 22, 28',
          '24, 27, 30, 33, 36, 39;ლუწი: 24, 30, 36 | კენტი: 27, 33, 39;ლუწი: 27, 30, 36 | კენტი: 24, 33, 39;ლუწი: 24, 33, 36 | კენტი: 27, 30, 39;ლუწი: 27, 33, 39 | კენტი: 24, 30, 36',
          '32, 35, 38, 41, 44, 47;ლუწი: 32, 38, 44 | კენტი: 35, 41, 47;ლუწი: 35, 38, 44 | კენტი: 32, 41, 47;ლუწი: 32, 41, 44 | კენტი: 35, 38, 47;ლუწი: 35, 41, 47 | კენტი: 32, 38, 44',
          '40, 43, 46, 49, 52, 55;ლუწი: 40, 46, 52 | კენტი: 43, 49, 55;ლუწი: 43, 46, 52 | კენტი: 40, 49, 55;ლუწი: 40, 49, 52 | კენტი: 43, 46, 55;ლუწი: 43, 49, 55 | კენტი: 40, 46, 52',
          '48, 51, 54, 57, 60, 63;ლუწი: 48, 54, 60 | კენტი: 51, 57, 63;ლუწი: 51, 54, 60 | კენტი: 48, 57, 63;ლუწი: 48, 57, 60 | კენტი: 51, 54, 63;ლუწი: 51, 57, 63 | კენტი: 48, 54, 60',
          '56, 59, 62, 65, 68, 71;ლუწი: 56, 62, 68 | კენტი: 59, 65, 71;ლუწი: 59, 62, 68 | კენტი: 56, 65, 71;ლუწი: 56, 65, 68 | კენტი: 59, 62, 71;ლუწი: 59, 65, 71 | კენტი: 56, 62, 68',
          '64, 67, 70, 73, 76, 79;ლუწი: 64, 70, 76 | კენტი: 67, 73, 79;ლუწი: 67, 70, 76 | კენტი: 64, 73, 79;ლუწი: 64, 73, 76 | კენტი: 67, 70, 79;ლუწი: 67, 73, 79 | კენტი: 64, 70, 76',
          '72, 75, 78, 81, 84, 87;ლუწი: 72, 78, 84 | კენტი: 75, 81, 87;ლუწი: 75, 78, 84 | კენტი: 72, 81, 87;ლუწი: 72, 81, 84 | კენტი: 75, 78, 87;ლუწი: 75, 81, 87 | კენტი: 72, 78, 84',
          '80, 83, 86, 89, 92, 95;ლუწი: 80, 86, 92 | კენტი: 83, 89, 95;ლუწი: 83, 86, 92 | კენტი: 80, 89, 95;ლუწი: 80, 89, 92 | კენტი: 83, 86, 95;ლუწი: 83, 89, 95 | კენტი: 80, 86, 92',
          '18, 21, 24, 27, 30, 33;ლუწი: 18, 24, 30 | კენტი: 21, 27, 33;ლუწი: 21, 24, 30 | კენტი: 18, 27, 33;ლუწი: 18, 27, 30 | კენტი: 21, 24, 33;ლუწი: 21, 27, 33 | კენტი: 18, 24, 30',
          '26, 29, 32, 35, 38, 41;ლუწი: 26, 32, 38 | კენტი: 29, 35, 41;ლუწი: 29, 32, 38 | კენტი: 26, 35, 41;ლუწი: 26, 35, 38 | კენტი: 29, 32, 41;ლუწი: 29, 35, 41 | კენტი: 26, 32, 38',
          '34, 37, 40, 43, 46, 49;ლუწი: 34, 40, 46 | კენტი: 37, 43, 49;ლუწი: 37, 40, 46 | კენტი: 34, 43, 49;ლუწი: 34, 43, 46 | კენტი: 37, 40, 49;ლუწი: 37, 43, 49 | კენტი: 34, 40, 46',
          '42, 45, 48, 51, 54, 57;ლუწი: 42, 48, 54 | კენტი: 45, 51, 57;ლუწი: 45, 48, 54 | კენტი: 42, 51, 57;ლუწი: 42, 51, 54 | კენტი: 45, 48, 57;ლუწი: 45, 51, 57 | კენტი: 42, 48, 54',
          '50, 53, 56, 59, 62, 65;ლუწი: 50, 56, 62 | კენტი: 53, 59, 65;ლუწი: 53, 56, 62 | კენტი: 50, 59, 65;ლუწი: 50, 59, 62 | კენტი: 53, 56, 65;ლუწი: 53, 59, 65 | კენტი: 50, 56, 62',
          '58, 61, 64, 67, 70, 73;ლუწი: 58, 64, 70 | კენტი: 61, 67, 73;ლუწი: 61, 64, 70 | კენტი: 58, 67, 73;ლუწი: 58, 67, 70 | კენტი: 61, 64, 73;ლუწი: 61, 67, 73 | კენტი: 58, 64, 70',
          '66, 69, 72, 75, 78, 81;ლუწი: 66, 72, 78 | კენტი: 69, 75, 81;ლუწი: 69, 72, 78 | კენტი: 66, 75, 81;ლუწი: 66, 75, 78 | კენტი: 69, 72, 81;ლუწი: 69, 75, 81 | კენტი: 66, 72, 78',
        ],
      },
      numList: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      dist1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      dist2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      dist3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    optionCount: 4,
    distractors: ({ vars }) => [String(vars.dist1), String(vars.dist2), String(vars.dist3)],
    explanation: ({ answer }) =>
      `ორნიშნა რიცხვის ლუწ-კენტობას განსაზღვრავს ბოლო ციფრი (ერთეულები). სწორია: ${answer}.`,
  }),
];
