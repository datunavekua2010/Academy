import { defineTemplate } from './types';
import type { QuestionTemplate } from './types';

export const G2_U14_SUBTOPICS = [
  'u14-repeating-patterns',
  'u14-growing-patterns',
  'u14-describing-the-rule',
  'u14-number-triangles',
  'u14-number-guessing',
  'u14-word-coding',
  'u14-age-problems',
  'u14-elimination',
  'u14-color-choice',
  'u14-balance-scales',
  'u14-elimination-harder',
  'u14-thought-of-number',
  'u14-matching-conditions',
] as const;

export type G2U14Subtopic = (typeof G2_U14_SUBTOPICS)[number];

const addr = (options: { id: string; subtopicId: G2U14Subtopic; difficulty: 1 | 2 | 3 }) => ({
  grade: 2 as const,
  topicId: 'g2-kanonzomiereba-logika',
  unitId: 'g2-kanonzomiereba-logika',
  ...options,
});

export function nearMisses(answer: number, count = 3, min = 0, step = 1): number[] {
  const result = new Set<number>();
  const deltas = [step, -step, 2 * step, -2 * step, 3 * step, -3 * step, 4 * step, -4 * step, 5, -5, 10, -10];
  for (const delta of deltas) {
    const val = answer + delta;
    if (val >= min && val !== answer) {
      result.add(val);
      if (result.size >= count) break;
    }
  }
  let fallback = min;
  while (result.size < count) {
    if (fallback !== answer) result.add(fallback);
    fallback += step;
  }
  return Array.from(result).slice(0, count);
}

const CHILDREN = [
  'ანი', 'ლუკა', 'ნიკო', 'მარიამი', 'დათო', 'გიორგი',
  'ელენე', 'საბა', 'ნინო', 'თემო', 'სალომე', 'ირაკლი',
];

export const G2_U14_TEMPLATES: QuestionTemplate[] = [
  // =========================================================================
  // U14.1 — განმეორებადი კანონზომიერებები (Q01–Q06)
  // =========================================================================

  // Q01 — გააგრძელე ფერების მიმდევრობა (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-01', subtopicId: 'u14-repeating-patterns', difficulty: 1 }),
    prompt: '{child} აგრძელებს ფერების მიმდევრობას: {c1} {c2} {c1} {c2} {c1} __. რა იქნება შემდეგი?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '🔴;🔵;🔴;🔵;🟢;🟡',
          '🟢;🟡;🟢;🟡;🔴;🔵',
          '🔵;🟢;🔵;🟢;🔴;🟣',
          '🟣;🟠;🟣;🟠;🟡;🟢',
          '🟤;⚪;🟤;⚪;🔴;🔵',
          '⚫;⚪;⚫;⚪;🟢;🟡',
        ],
      },
      c1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      c2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `მიმდევრობაში მონაცვლეობს ${vars.c1} და ${vars.c2}. შემდეგი ფერია ${answer}.`,
  }),

  // Q02 — გააგრძელე ფორმების მიმდევრობა (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-02', subtopicId: 'u14-repeating-patterns', difficulty: 1 }),
    prompt:
      '{child} აგრძელებს ფორმების მიმდევრობას: {s1} {s1} {s2} {s1} {s1} {s2} {s1} {s1} __. რა იქნება შემდეგი?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '⭐;❤️;❤️;⭐;🔵;🟢',
          '🔺;🔷;🔷;🔺;🟡;⭐',
          '🟢;🟧;🟧;🟢;🟣;🔺',
          '☀️;🌙;🌙;☀️;⭐;☁️',
          '🌸;🍀;🍀;🌸;🌺;🌻',
          '🍎;🍐;🍐;🍎;🍊;🍋',
        ],
      },
      s1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      s2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `ორ ${vars.s1}-ს მოსდევს ${vars.s2}. შემდეგი ფორმაა ${answer}.`,
  }),

  // Q03 — იპოვე შემდეგი რიცხვი (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-03', subtopicId: 'u14-repeating-patterns', difficulty: 2 }),
    prompt: '{child} აკვირდება მიმდევრობას: {n1}, {n2}, {n1}, {n2}, {n1}, __. რა რიცხვი იქნება შემდეგი?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '2;4;4;2;3;6',
          '3;7;7;3;5;9',
          '1;5;5;1;4;6',
          '6;9;9;6;7;10',
          '4;8;8;4;6;10',
          '5;8;8;5;6;9',
        ],
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `მონაცვლეობს ${vars.n1} და ${vars.n2}. შემდეგი რიცხვია ${answer}.`,
  }),

  // Q04 — გააგრძელე მიმდევრობა (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-04', subtopicId: 'u14-repeating-patterns', difficulty: 2 }),
    prompt: '{child} აგრძელებს მიმდევრობას: {c1} {c1} {c2} {c1} {c1} {c2} __. რა იქნება შემდეგი?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '🟢;🟡;🟢;🟡;🔴;🔵',
          '🔵;🔴;🔵;🔴;🟢;🟡',
          '🟣;🟠;🟣;🟠;🔵;🟢',
          '⚪;⚫;⚪;⚫;🔴;🔵',
          '⭐;🌙;⭐;🌙;☀️;☁️',
          '🔺;🔷;🔺;🔷;🟡;🟢',
        ],
      },
      c1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      c2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.c2}-ის შემდეგ კვლავ იწყება ორი ${vars.c1}, ამიტომ შემდეგია ${answer}.`,
  }),

  // Q05 — იპოვე გამოტოვებული ფორმა (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-05', subtopicId: 'u14-repeating-patterns', difficulty: 3 }),
    prompt: '{child} ეძებს გამოტოვებულ ფორმას: {s1} {s2} {s1} {s2} __ {s2}. რა უნდა ეწეროს ხაზზე?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '🔺;🔵;🔺;🔵;🟢;⭐',
          '⭐;❤️;⭐;❤️;🔷;🌙',
          '🔶;🟣;🔶;🟣;🟢;🔺',
          '🟩;🟧;🟩;🟧;🟦;🟨',
          '☀️;☁️;☀️;☁️;⭐;🌙',
          '🌸;🌺;🌸;🌺;🌼;🌻',
        ],
      },
      s1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      s2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) =>
      `კანონზომიერების მიხედვით გამოტოვებულია ${answer}.`,
  }),

  // Q06 — გააგრძელე რიცხვების მიმდევრობა (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-06', subtopicId: 'u14-repeating-patterns', difficulty: 3 }),
    prompt:
      '{child} აგრძელებს რიცხვების მიმდევრობას: {a}, {b}, {a}, {b}, {a}, {b}, __. რა იქნება შემდეგი?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '1;2;1;2;3;4',
          '3;5;3;5;4;6',
          '2;7;2;7;5;8',
          '4;9;4;9;6;8',
          '10;20;10;20;15;30',
          '5;15;5;15;10;25',
        ],
      },
      a: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      b: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `მიმდევრობაში მონაცვლეობს ${vars.a} და ${vars.b}. შემდეგია ${answer}.`,
  }),

  // =========================================================================
  // U14.2 — მზარდი კანონზომიერებები (Q07–Q12)
  // =========================================================================

  // Q07 — შემდეგი რიცხვი (+3) (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-07', subtopicId: 'u14-growing-patterns', difficulty: 1 }),
    prompt: '{child} აკვირდება მზარდ მიმდევრობას: {a}, {b}, {c}, {d}, __. რა იქნება შემდეგი რიცხვი?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      start: { kind: 'choice', values: ['3', '6', '9', '12', '15', '18'] },
      a: { kind: 'choice', values: (v) => [Number(v.start)] },
      b: { kind: 'choice', values: (v) => [Number(v.start) + 3] },
      c: { kind: 'choice', values: (v) => [Number(v.start) + 6] },
      d: { kind: 'choice', values: (v) => [Number(v.start) + 9] },
    },
    answer: (v) => Number(v.start) + 12,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `მიმდევრობა იზრდება 3-ით. ${vars.d} + 3 = ${answer}.`,
  }),

  // Q08 — გააგრძელე მიმდევრობა (+5) (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-08', subtopicId: 'u14-growing-patterns', difficulty: 1 }),
    prompt: '{child} აგრძელებს მიმდევრობას: {a}, {b}, {c}, {d}, __. რა იქნება შემდეგი რიცხვი?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      start: { kind: 'choice', values: ['5', '10', '15', '20', '25', '30'] },
      a: { kind: 'choice', values: (v) => [Number(v.start)] },
      b: { kind: 'choice', values: (v) => [Number(v.start) + 5] },
      c: { kind: 'choice', values: (v) => [Number(v.start) + 10] },
      d: { kind: 'choice', values: (v) => [Number(v.start) + 15] },
    },
    answer: (v) => Number(v.start) + 20,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 2, 2),
    explanation: ({ vars, answer }) =>
      `ყოველ ჯერზე ემატება 5. ${vars.d} + 5 = ${answer}.`,
  }),

  // Q09 — შემდეგი რიცხვი (+2) (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-09', subtopicId: 'u14-growing-patterns', difficulty: 2 }),
    prompt: '{child} ითვლის შემდეგ რიცხვს: {a}, {b}, {c}, {d}, __.',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      start: { kind: 'choice', values: ['11', '13', '15', '17', '21', '23', '25', '27'] },
      a: { kind: 'choice', values: (v) => [Number(v.start)] },
      b: { kind: 'choice', values: (v) => [Number(v.start) + 2] },
      c: { kind: 'choice', values: (v) => [Number(v.start) + 4] },
      d: { kind: 'choice', values: (v) => [Number(v.start) + 6] },
    },
    answer: (v) => Number(v.start) + 8,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `მიმდევრობა იზრდება 2-ით. ${vars.d} + 2 = ${answer}.`,
  }),

  // Q10 — გააგრძელე მიმდევრობა (+3 დაწყებული 2-დან) (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-10', subtopicId: 'u14-growing-patterns', difficulty: 2 }),
    prompt: '{child} აგრძელებს მიმდევრობას: {a}, {b}, {c}, {d}, __. რა იქნება შემდეგი?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      start: { kind: 'choice', values: ['2', '5', '8', '11', '14', '17'] },
      a: { kind: 'choice', values: (v) => [Number(v.start)] },
      b: { kind: 'choice', values: (v) => [Number(v.start) + 3] },
      c: { kind: 'choice', values: (v) => [Number(v.start) + 6] },
      d: { kind: 'choice', values: (v) => [Number(v.start) + 9] },
    },
    answer: (v) => Number(v.start) + 12,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `მიმდევრობა იზრდება 3-ით. ${vars.d} + 3 = ${answer}.`,
  }),

  // Q11 — შემდეგი რიცხვი (+10) (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-11', subtopicId: 'u14-growing-patterns', difficulty: 3 }),
    prompt: '{child} აგრძელებს ათეულების მიმდევრობას: {a}, {b}, {c}, {d}, __. რა იქნება შემდეგი?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      start: { kind: 'choice', values: ['10', '20', '30', '40', '50'] },
      a: { kind: 'choice', values: (v) => [Number(v.start)] },
      b: { kind: 'choice', values: (v) => [Number(v.start) + 10] },
      c: { kind: 'choice', values: (v) => [Number(v.start) + 20] },
      d: { kind: 'choice', values: (v) => [Number(v.start) + 30] },
    },
    answer: (v) => Number(v.start) + 40,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 5, 10),
    explanation: ({ vars, answer }) =>
      `ყოველ ჯერზე ემატება 10. ${vars.d} + 10 = ${answer}.`,
  }),

  // Q12 — გააგრძელე მიმდევრობა (+3 დაწყებული 1-დან) (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-12', subtopicId: 'u14-growing-patterns', difficulty: 3 }),
    prompt: '{child} აგრძელებს მიმდევრობას: {a}, {b}, {c}, {d}, __. რა იქნება შემდეგი?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      start: { kind: 'choice', values: ['1', '4', '7', '10', '13', '16'] },
      a: { kind: 'choice', values: (v) => [Number(v.start)] },
      b: { kind: 'choice', values: (v) => [Number(v.start) + 3] },
      c: { kind: 'choice', values: (v) => [Number(v.start) + 6] },
      d: { kind: 'choice', values: (v) => [Number(v.start) + 9] },
    },
    answer: (v) => Number(v.start) + 12,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `მიმდევრობა იზრდება 3-ით. ${vars.d} + 3 = ${answer}.`,
  }),

  // =========================================================================
  // U14.3 — კანონზომიერების წესის ამოცნობა (Q13–Q18)
  // =========================================================================

  // Q13 — რა წესით იცვლება რიცხვები (+4) (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-13', subtopicId: 'u14-describing-the-rule', difficulty: 1 }),
    prompt:
      '{child} იკვლევს მიმდევრობას: {seq}. რა წესით იცვლება რიცხვები?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '4, 8, 12, 16;ყოველ ჯერზე ემატება 4;ყოველ ჯერზე ემატება 2;ყოველ ჯერზე აკლდება 4;ყოველ ჯერზე ემატება 5',
          '3, 6, 9, 12;ყოველ ჯერზე ემატება 3;ყოველ ჯერზე ემატება 2;ყოველ ჯერზე აკლდება 3;ყოველ ჯერზე ემატება 4',
          '5, 10, 15, 20;ყოველ ჯერზე ემატება 5;ყოველ ჯერზე ემატება 4;ყოველ ჯერზე აკლდება 5;ყოველ ჯერზე ემატება 10',
          '2, 6, 10, 14;ყოველ ჯერზე ემატება 4;ყოველ ჯერზე ემატება 3;ყოველ ჯერზე აკლდება 4;ყოველ ჯერზე ემატება 2',
        ],
      },
      seq: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) =>
      `მიმდევრობის წესია: ${answer}.`,
  }),

  // Q14 — იპოვე წესი (-2) (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-14', subtopicId: 'u14-describing-the-rule', difficulty: 1 }),
    prompt: '{child} იკვლევს კლებად მიმდევრობას: {seq}. იპოვე წესი:',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '20, 18, 16, 14;ყოველ ჯერზე აკლდება 2;ყოველ ჯერზე ემატება 2;ყოველ ჯერზე აკლდება 1;ყოველ ჯერზე აკლდება 4',
          '30, 28, 26, 24;ყოველ ჯერზე აკლდება 2;ყოველ ჯერზე ემატება 2;ყოველ ჯერზე აკლდება 3;ყოველ ჯერზე აკლდება 1',
          '15, 13, 11, 9;ყოველ ჯერზე აკლდება 2;ყოველ ჯერზე ემატება 2;ყოველ ჯერზე აკლდება 4;ყოველ ჯერზე აკლდება 1',
          '25, 23, 21, 19;ყოველ ჯერზე აკლდება 2;ყოველ ჯერზე ემატება 2;ყოველ ჯერზე აკლდება 3;ყოველ ჯერზე აკლდება 5',
        ],
      },
      seq: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) =>
      `წესია: ${answer}.`,
  }),

  // Q15 — რომელი მიმდევრობა ემატება 5-ით? (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-15', subtopicId: 'u14-describing-the-rule', difficulty: 2 }),
    prompt: '{child}-ს აინტერესებს: რომელი მიმდევრობა იზრდება ყოველ ჯერზე 5-ით?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '2, 7, 12, 17;2, 4, 6, 8;20, 17, 14, 11;1, 3, 6, 10',
          '3, 8, 13, 18;3, 6, 9, 12;15, 12, 9, 6;2, 5, 9, 14',
          '4, 9, 14, 19;4, 8, 12, 16;25, 20, 15, 10;1, 4, 8, 13',
          '1, 6, 11, 16;1, 3, 5, 7;30, 25, 20, 15;2, 6, 11, 17',
        ],
      },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) =>
      `მიმდევრობაში ${answer} ყოველი წევრი წინაზე 5-ით მეტია.`,
  }),

  // Q16 — რომელი წესი შეესაბამება (+6) (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-16', subtopicId: 'u14-describing-the-rule', difficulty: 2 }),
    prompt: '{child} ამოწმებს: რომელი წესი შეესაბამება მიმდევრობას {seq}?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '6, 12, 18, 24;ემატება 6;ემატება 3;ემატება 4;ემატება 5',
          '7, 14, 21, 28;ემატება 7;ემატება 6;ემატება 5;ემატება 8',
          '8, 16, 24, 32;ემატება 8;ემატება 6;ემატება 7;ემატება 9',
        ],
      },
      seq: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) =>
      `სწორი წესია: ${answer}.`,
  }),

  // Q17 — იპოვე წესი (-5) (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-17', subtopicId: 'u14-describing-the-rule', difficulty: 3 }),
    prompt: '{child} აანალიზებს მიმდევრობას: {seq}. რა წესით იცვლება?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '30, 25, 20, 15;აკლდება 5;აკლდება 3;აკლდება 4;ემატება 5',
          '45, 40, 35, 30;აკლდება 5;აკლდება 2;აკლდება 4;ემატება 5',
          '50, 45, 40, 35;აკლდება 5;აკლდება 10;აკლდება 3;ემატება 5',
          '25, 20, 15, 10;აკლდება 5;აკლდება 4;აკლდება 6;ემატება 5',
        ],
      },
      seq: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) =>
      `წესია: ${answer}.`,
  }),

  // Q18 — გაორმაგების წესი (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-18', subtopicId: 'u14-describing-the-rule', difficulty: 3 }),
    prompt:
      '{child}-ს აინტერესებს: რომელი მიმდევრობა მიჰყვება წესს „ყოველ ჯერზე გააორმაგე“?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '2, 4, 8, 16;2, 4, 6, 8;3, 6, 9, 12;10, 12, 14, 16',
          '1, 2, 4, 8;1, 3, 5, 7;2, 5, 8, 11;4, 6, 8, 10',
          '3, 6, 12, 24;3, 5, 7, 9;4, 7, 10, 13;5, 10, 15, 20',
        ],
      },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) =>
      `მიმდევრობაში ${answer} თითოეული წევრი წინა წევრის გაორმაგებით მიიღება.`,
  }),

  // =========================================================================
  // U14.4 — რიცხვების სამკუთხედები (Q19–Q24)
  // =========================================================================

  // Q19 — გამოტოვებული ქვედა რიცხვი (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u14-19', subtopicId: 'u14-number-triangles', difficulty: 1 }),
    prompt:
      '{child} ავსებს სამკუთხედს: ზედა რიცხვია {top}. ქვედა რიცხვებია {b1} და __. ზედა რიცხვი ქვედა რიცხვების ჯამია. რა წერია მეორე ქვედა კუთხეში?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      b1: { kind: 'int', min: 2, max: 6 },
      diff: { kind: 'int', min: 3, max: 7 },
      top: { kind: 'choice', values: (v) => [Number(v.b1) + Number(v.diff)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.top} − ${vars.b1} = ${answer}.`,
  }),

  // Q20 — შეავსე სამკუთხედი (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u14-20', subtopicId: 'u14-number-triangles', difficulty: 1 }),
    prompt:
      '{child} აკვირდება სამკუთხედს: ზედა რიცხვია {top}, ერთ-ერთი ქვედა რიცხვია {b1}. იპოვე მეორე ქვედა რიცხვი (მათი ჯამი ზედა რიცხვის ტოლია):',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      b1: { kind: 'int', min: 4, max: 8 },
      diff: { kind: 'int', min: 3, max: 6 },
      top: { kind: 'choice', values: (v) => [Number(v.b1) + Number(v.diff)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.top} − ${vars.b1} = ${answer}.`,
  }),

  // Q21 — იპოვე ზედა რიცხვი (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u14-21', subtopicId: 'u14-number-triangles', difficulty: 2 }),
    prompt:
      '{child} ითვლის სამკუთხედის ზედა რიცხვს: ქვედა რიცხვებია {b1} და {b2}. ზედა რიცხვი მათი ჯამია. რა რიცხვი უნდა ეწეროს ზემოთ?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      b1: { kind: 'int', min: 5, max: 9 },
      b2: { kind: 'int', min: 6, max: 9 },
    },
    answer: (v) => Number(v.b1) + Number(v.b2),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.b1} + ${vars.b2} = ${answer}.`,
  }),

  // Q22 — იპოვე გამოტოვებული ქვედა რიცხვი (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u14-22', subtopicId: 'u14-number-triangles', difficulty: 2 }),
    prompt:
      '{child} ავსებს სამკუთხედს: ზედა რიცხვია {top}. ქვედა რიცხვებია {b1} და __. ზედა რიცხვი ქვედა რიცხვების ჯამია. იპოვე გამოტოვებული რიცხვი.',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      b1: { kind: 'int', min: 6, max: 10 },
      diff: { kind: 'int', min: 4, max: 8 },
      top: { kind: 'choice', values: (v) => [Number(v.b1) + Number(v.diff)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.top} − ${vars.b1} = ${answer}.`,
  }),

  // Q23 — რიცხვების სამკუთხედი (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u14-23', subtopicId: 'u14-number-triangles', difficulty: 3 }),
    prompt:
      '{child} ითვლის: სამკუთხედის ქვედა რიცხვებია {b1} და {b2}. ზედა რიცხვი მათი ჯამია. რა რიცხვი უნდა ეწეროს ზემოთ?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      b1: { kind: 'int', min: 9, max: 15 },
      b2: { kind: 'int', min: 5, max: 12 },
    },
    answer: (v) => Number(v.b1) + Number(v.b2),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.b1} + ${vars.b2} = ${answer}.`,
  }),

  // Q24 — იპოვე ქვედა რიცხვი (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u14-24', subtopicId: 'u14-number-triangles', difficulty: 3 }),
    prompt:
      '{child} ეძებს ქვედა რიცხვს: ზედა რიცხვია {top}, ერთ-ერთი ქვედა რიცხვია {b1}. მეორე ქვედა რიცხვი უნდა დაემატოს პირველს და მივიღოთ {top}. რა არის მეორე რიცხვი?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      b1: { kind: 'int', min: 8, max: 12 },
      diff: { kind: 'int', min: 5, max: 11 },
      top: { kind: 'choice', values: (v) => [Number(v.b1) + Number(v.diff)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.top} − ${vars.b1} = ${answer}.`,
  }),

  // =========================================================================
  // U14.5 — რიცხვის გამოცნობა (Q25–Q30)
  // =========================================================================

  // Q25 — გამოიცანი ლუწი რიცხვი შუალედში (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-25', subtopicId: 'u14-number-guessing', difficulty: 1 }),
    prompt:
      '{child} გვეუბნება გამოცანას: „მე ვარ {low}-ზე მეტი და {high}-ზე ნაკლები, ლუწი რიცხვი. რომელი ვარ?“',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '10;15;12;11;13;15',
          '14;19;16;15;17;19',
          '6;11;8;7;9;11',
          '16;21;18;17;19;21',
        ],
      },
      low: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      high: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.low}-სა და ${vars.high}-ს შორის ერთადერთი ლუწი რიცხვი ვარიანტებიდან არის ${answer}.`,
  }),

  // Q26 — ერთეულების ციფრი 5 (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-26', subtopicId: 'u14-number-guessing', difficulty: 1 }),
    prompt:
      '{child} გვეუბნება: „მე ვარ {tens0}-ზე მეტი და {tens1}-ზე ნაკლები. ჩემი ერთეულების ციფრია 5. რომელი ვარ?“',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      tens: { kind: 'choice', values: ['2', '3', '4', '5', '6', '7'] },
      tens0: { kind: 'choice', values: (v) => [Number(v.tens) * 10] },
      tens1: { kind: 'choice', values: (v) => [(Number(v.tens) + 1) * 10] },
    },
    answer: (v) => Number(v.tens) * 10 + 5,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => [
      Number(answer) - 2,
      Number(answer) - 1,
      Number(answer) + 1,
    ],
    explanation: ({ answer }) =>
      `ერთადერთი ასეთი რიცხვია ${answer}.`,
  }),

  // Q27 — მიმატებით გამოცნობა (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u14-27', subtopicId: 'u14-number-guessing', difficulty: 2 }),
    prompt:
      '{child} გვეუბნება: „ჩემს რიცხვს {add}-ს თუ დავუმატებთ, მივიღებთ {sum}-ს. რა რიცხვი ვარ?“',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      orig: { kind: 'int', min: 5, max: 15 },
      add: { kind: 'int', min: 3, max: 8 },
      sum: { kind: 'choice', values: (v) => [Number(v.orig) + Number(v.add)] },
    },
    answer: (v) => Number(v.orig),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.sum} − ${vars.add} = ${answer}.`,
  }),

  // Q28 — ერთეულების ციფრი 2 (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-28', subtopicId: 'u14-number-guessing', difficulty: 2 }),
    prompt:
      '{child} გვეუბნება: „მე ვარ {tens0}-ზე მეტი და {tens1}-ზე ნაკლები. ჩემი ერთეულების ციფრია 2. რომელი ვარ?“',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      tens: { kind: 'choice', values: ['3', '4', '5', '6', '7'] },
      tens0: { kind: 'choice', values: (v) => [Number(v.tens) * 10] },
      tens1: { kind: 'choice', values: (v) => [(Number(v.tens) + 1) * 10] },
    },
    answer: (v) => Number(v.tens) * 10 + 2,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => [
      Number(answer) - 1,
      Number(answer) + 1,
      Number(answer) + 2,
    ],
    explanation: ({ answer }) =>
      `ეს რიცხვია ${answer}.`,
  }),

  // Q29 — გამოკლებით გამოცნობა (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u14-29', subtopicId: 'u14-number-guessing', difficulty: 3 }),
    prompt:
      '{child} გვეუბნება: „ჩემს რიცხვს {sub} რომ გამოვაკლოთ, მივიღებთ {diff}-ს. რა რიცხვი ვარ?“',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      diff: { kind: 'int', min: 10, max: 20 },
      sub: { kind: 'int', min: 3, max: 9 },
      orig: { kind: 'choice', values: (v) => [Number(v.diff) + Number(v.sub)] },
    },
    answer: (v) => Number(v.orig),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.diff} + ${vars.sub} = ${answer}.`,
  }),

  // Q30 — იყოფა 5-ზე (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-30', subtopicId: 'u14-number-guessing', difficulty: 3 }),
    prompt:
      '{child} გვეუბნება: „მე ვარ {low}-ზე მეტი, {high}-ზე ნაკლები და ვმთავრდები 5-ით (ვიყოფი 5-ზე). რომელი ვარ?“',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      tens: { kind: 'choice', values: ['2', '3', '4', '5'] },
      low: { kind: 'choice', values: (v) => [Number(v.tens) * 10] },
      high: { kind: 'choice', values: (v) => [(Number(v.tens) + 1) * 10] },
    },
    answer: (v) => Number(v.tens) * 10 + 5,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => [
      Number(answer) - 3,
      Number(answer) - 1,
      Number(answer) + 3,
    ],
    explanation: ({ answer }) =>
      `ამ შუალედში 5-ზე დაბოლოებული რიცხვია ${answer}.`,
  }),

  // =========================================================================
  // U14.6 — სიტყვების კოდირება (Q31–Q36)
  // =========================================================================

  // Q31 — სიმბოლოების შეკრება (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u14-31', subtopicId: 'u14-word-coding', difficulty: 1 }),
    prompt: '{child} ხსნის კოდს: თუ ★ = {a} და ● = {b}, რას უდრის ★ + ●?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      a: { kind: 'int', min: 2, max: 7 },
      b: { kind: 'int', min: 2, max: 7 },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // Q32 — ხილის კოდი (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u14-32', subtopicId: 'u14-word-coding', difficulty: 1 }),
    prompt: '{child} ითვლის ხილის კოდს: თუ 🍎 = {a} და 🍐 = {b}, რას უდრის 🍎 + 🍐?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      a: { kind: 'int', min: 3, max: 8 },
      b: { kind: 'int', min: 3, max: 8 },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // Q33 — ასოების კოდი (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u14-33', subtopicId: 'u14-word-coding', difficulty: 2 }),
    prompt:
      '{child} ხსნის ასოების კოდს: თუ A = {a}, B = {b} და C = {c}, რას უდრის B + C?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      a: { kind: 'choice', values: ['1', '2', '3'] },
      b: { kind: 'choice', values: ['2', '3', '4'] },
      c: { kind: 'choice', values: ['3', '4', '5'] },
    },
    answer: (v) => Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.b} + ${vars.c} = ${answer}.`,
  }),

  // Q34 — ფერების კოდი და გამოკლება (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u14-34', subtopicId: 'u14-word-coding', difficulty: 2 }),
    prompt: '{child} ითვლის: თუ 🔴 = {a} და 🔵 = {b}, რას უდრის 🔴 − 🔵?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      b: { kind: 'int', min: 2, max: 5 },
      diff: { kind: 'int', min: 2, max: 6 },
      a: { kind: 'choice', values: (v) => [Number(v.b) + Number(v.diff)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${answer}.`,
  }),

  // Q35 — სამი სიმბოლოს კოდი (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u14-35', subtopicId: 'u14-word-coding', difficulty: 3 }),
    prompt: '{child} ითვლის: თუ 🐱 = {a} და 🐶 = {b}, რას უდრის 🐱 + 🐶 + 🐱?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      a: { kind: 'int', min: 2, max: 5 },
      b: { kind: 'int', min: 3, max: 6 },
    },
    answer: (v) => Number(v.a) * 2 + Number(v.b),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} + ${vars.a} = ${answer}.`,
  }),

  // Q36 — სამი ფიგურის კოდი (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u14-36', subtopicId: 'u14-word-coding', difficulty: 3 }),
    prompt: '{child} ითვლის: თუ ▲ = {a} და ■ = {b}, რას უდრის ▲ + ■ + ■?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      a: { kind: 'int', min: 3, max: 7 },
      b: { kind: 'int', min: 2, max: 5 },
    },
    answer: (v) => Number(v.a) + Number(v.b) * 2,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} + ${vars.b} = ${answer}.`,
  }),

  // =========================================================================
  // U14.7 — ასაკის ამოცანები (Q37–Q42)
  // =========================================================================

  // Q37 — ასაკების შედარება (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u14-37', subtopicId: 'u14-age-problems', difficulty: 1 }),
    prompt:
      '{c1} {a1} წლისაა, ხოლო მისი და {c2} — {a2} წლისაა. რამდენი წლით უფროსია {c1}?',
    variables: {
      c1: { kind: 'choice', values: ['ნიკა', 'ლუკა', 'გიორგი', 'დათო'] },
      c2: { kind: 'choice', values: ['ანი', 'ნინო', 'მარიამი', 'ელენე'] },
      a2: { kind: 'int', min: 4, max: 7 },
      diff: { kind: 'int', min: 2, max: 5 },
      a1: { kind: 'choice', values: (v) => [Number(v.a2) + Number(v.diff)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a1} − ${vars.a2} = ${answer} წლით უფროსია.`,
  }),

  // Q38 — ასაკის გამოთვლა მომავალში (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u14-38', subtopicId: 'u14-age-problems', difficulty: 1 }),
    prompt: '{child} ახლა {age} წლისაა. რამდენი წლის იქნება {plus} წლის შემდეგ?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      age: { kind: 'int', min: 6, max: 10 },
      plus: { kind: 'choice', values: ['2', '3', '4'] },
    },
    answer: (v) => Number(v.age) + Number(v.plus),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.age} + ${vars.plus} = ${answer} წლის.`,
  }),

  // Q39 — ასაკი წარსულში (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u14-39', subtopicId: 'u14-age-problems', difficulty: 2 }),
    prompt: '{child} ახლა {age} წლისაა. რამდენი წლის იყო {minus} წლის წინ?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      age: { kind: 'int', min: 8, max: 12 },
      minus: { kind: 'choice', values: ['2', '3', '4'] },
    },
    answer: (v) => Number(v.age) - Number(v.minus),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.age} − ${vars.minus} = ${answer} წლის.`,
  }),

  // Q40 — ასაკების ჯამი (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u14-40', subtopicId: 'u14-age-problems', difficulty: 2 }),
    prompt:
      '{c1} {a1} წლისაა, ხოლო მისი ძმა {c2} — {a2} წლისაა. რამდენია მათი ასაკების ჯამი?',
    variables: {
      c1: { kind: 'choice', values: ['მარიამი', 'ანი', 'ელენე', 'სალომე'] },
      c2: { kind: 'choice', values: ['ნიკო', 'ლუკა', 'გიორგი', 'დათო'] },
      a1: { kind: 'int', min: 5, max: 9 },
      a2: { kind: 'int', min: 7, max: 11 },
    },
    answer: (v) => Number(v.a1) + Number(v.a2),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.a1} + ${vars.a2} = ${answer} წელი.`,
  }),

  // Q41 — ასაკის გამოცნობა უფროსობით (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u14-41', subtopicId: 'u14-age-problems', difficulty: 3 }),
    prompt:
      '{child} {age} წლისაა. მისი და მასზე {diff} წლით უფროსია. რამდენი წლისაა მისი და?',
    variables: {
      child: { kind: 'choice', values: ['გიორგი', 'ნიკო', 'ლუკა', 'საბა'] },
      age: { kind: 'int', min: 4, max: 8 },
      diff: { kind: 'int', min: 3, max: 6 },
    },
    answer: (v) => Number(v.age) + Number(v.diff),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.age} + ${vars.diff} = ${answer} წლის.`,
  }),

  // Q42 — ასაკის გამოთვლა (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u14-42', subtopicId: 'u14-age-problems', difficulty: 3 }),
    prompt:
      '{child} {age} წლისაა. რამდენი წლის იქნება {plus} წლის შემდეგ?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      age: { kind: 'int', min: 10, max: 14 },
      plus: { kind: 'choice', values: ['3', '4', '5'] },
    },
    answer: (v) => Number(v.age) + Number(v.plus),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.age} + ${vars.plus} = ${answer} წლის.`,
  }),

  // =========================================================================
  // U14.8 — გამორიცხვის მეთოდი (Q43–Q48)
  // =========================================================================

  // Q43 — განსხვავებული რიცხვი (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-43', subtopicId: 'u14-elimination', difficulty: 1 }),
    prompt: '{child} ეძებს განსხვავებულ რიცხვს: რომელი რიცხვი არ შეესაბამება დანარჩენებს (ზედმეტია)?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '2;4;6;9;9;ყველა ლუწია, 9 კი კენტია',
          '4;6;8;11;11;ყველა ლუწია, 11 კი კენტია',
          '10;20;30;25;25;ყველა მრგვალი ათეულია, 25 კი არა',
          '3;5;7;10;10;ყველა კენტია, 10 კი ლუწია',
        ],
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      n3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      n4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      reason: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) =>
      [String(vars.n1), String(vars.n2), String(vars.n3), String(vars.n4)].filter(
        (n) => n !== vars.correct,
      ),
    explanation: ({ vars, answer }) =>
      `${vars.reason}. ზედმეტია ${answer}.`,
  }),

  // Q44 — განსხვავებული ფორმა (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-44', subtopicId: 'u14-elimination', difficulty: 1 }),
    prompt: '{child} აკვირდება ფორმებს: {list}. რომელი ფორმაა განსხვავებული?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '🔺, 🔺, 🔵, 🔺;🔵;🔺;⭐;🟢',
          '⭐, ⭐, ❤️, ⭐;❤️;⭐;🔷;🌙',
          '🟩, 🟩, 🟩, ⭕;⭕;🟩;🔺;🟨',
          '🔶, 🔶, 🟣, 🔶;🟣;🔶;🔺;⭐',
          '☀️, ☀️, ☁️, ☀️;☁️;☀️;🌙;⭐',
          '🍎, 🍎, 🍐, 🍎;🍐;🍎;🍊;🍋',
        ],
      },
      list: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) =>
      `განსხვავებული ფორმაა ${answer}.`,
  }),

  // Q45 — გამორიცხე ზედმეტი რიცხვი (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-45', subtopicId: 'u14-elimination', difficulty: 2 }),
    prompt: '{child} ამოწმებს: რომელი რიცხვი არ არის ლუწი (კენტია)?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '12;14;17;18;17',
          '20;22;25;26;25',
          '14;16;18;21;21',
          '30;32;35;36;35',
          '8;10;13;12;13',
        ],
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      n3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      n4: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) =>
      [String(vars.n1), String(vars.n2), String(vars.n3), String(vars.n4)].filter(
        (n) => n !== vars.correct,
      ),
    explanation: ({ answer }) =>
      `${answer} კენტია, დანარჩენები კი ლუწი.`,
  }),

  // Q46 — განსხვავებული სეზონი (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-46', subtopicId: 'u14-elimination', difficulty: 2 }),
    prompt: '{child}-ს აინტერესებს: ჩამოთვლილთაგან რომელი არ არის წელიწადის დრო (სეზონი)?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      odd: { kind: 'choice', values: ['ორშაბათი', 'სამშაბათი', 'პარასკევი', 'შაბათი', 'კვირა'] },
    },
    answer: (v) => String(v.odd),
    format: { kind: 'text' },
    distractors: () => ['გაზაფხული', 'ზაფხული', 'ზამთარი'],
    explanation: ({ answer }) =>
      `${answer} არის კვირის დღე, და არა წელიწადის დრო.`,
  }),

  // Q47 — გამორიცხე ზედმეტი მიმდევრობაში (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-47', subtopicId: 'u14-elimination', difficulty: 3 }),
    prompt:
      '{child} ეძებს შეცდომას მიმდევრობაში: რომელი რიცხვი არ შეესაბამება წესს მიმდევრობაში {seq}?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '5, 10, 15, 21, 25;21;5;10;25;უნდა ეწეროს 20',
          '3, 6, 10, 12, 15;10;3;6;12;უნდა ეწეროს 9',
          '2, 4, 6, 9, 10;9;2;4;10;უნდა ეწეროს 8',
          '10, 20, 35, 40, 50;35;10;20;40;უნდა ეწეროს 30',
        ],
      },
      seq: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      note: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${answer} არღვევს წესს (${vars.note}).`,
  }),

  // Q48 — განსხვავებული საგანი/ერთეული (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-48', subtopicId: 'u14-elimination', difficulty: 3 }),
    prompt: '{child}-ს აინტერესებს: ჩამოთვლილთაგან რომელი არ არის დროის საზომი ერთეული?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      odd: { kind: 'choice', values: ['კილოგრამი', 'მეტრი', 'ლიტრი', 'გრამი'] },
    },
    answer: (v) => String(v.odd),
    format: { kind: 'text' },
    distractors: () => ['წუთი', 'საათი', 'დღე'],
    explanation: ({ answer }) =>
      `${answer} არ არის დროის საზომი ერთეული.`,
  }),

  // =========================================================================
  // U14.9 — ფერის არჩევა პირობების მიხედვით (Q49–Q54)
  // =========================================================================

  // Q49 — აირჩიე სწორი ფერი (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-49', subtopicId: 'u14-color-choice', difficulty: 1 }),
    prompt: '{child} ასრულებს წესს: „აირჩიე მხოლოდ {colorName} ფერი“. რომელია სწორი?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          'წითელი;🔴;🔵;🟢;🟡',
          'ლურჯი;🔵;🔴;🟢;🟡',
          'მწვანე;🟢;🔴;🔵;🟡',
          'ყვითელი;🟡;🔴;🔵;🟢',
        ],
      },
      colorName: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.colorName} ფერია ${answer}.`,
  }),

  // Q50 — ფერისა და ფორმის პირობა (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-50', subtopicId: 'u14-color-choice', difficulty: 1 }),
    prompt: '{child} ეძებს: აირჩიე {colorName} წრე.',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          'ლურჯი;🔵;🔴;🟢;🟡',
          'წითელი;🔴;🔵;🟢;🟡',
          'მწვანე;🟢;🔴;🔵;🟡',
          'ყვითელი;🟡;🔴;🔵;🟢',
        ],
      },
      colorName: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.colorName} წრეა ${answer}.`,
  }),

  // Q51 — ორი პირობა (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-51', subtopicId: 'u14-color-choice', difficulty: 2 }),
    prompt: '{child} ეძებს ფორმას: აირჩიე {name}.',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          'ყვითელი ვარსკვლავი;⭐;🔴;🔵;🟡',
          'წითელი გული;❤️;⭐;🔵;🟢',
          'ლურჯი რომბი;🔷;⭐;🔴;🟢',
          'მწვანე კვადრატი;🟩;⭐;🔴;🔵',
        ],
      },
      name: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.name} არის ${answer}.`,
  }),

  // Q52 — ფერის კოდი (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-52', subtopicId: 'u14-color-choice', difficulty: 2 }),
    prompt:
      '{child} კითხულობს წესს: 🔴 ნიშნავს 1-ს, 🔵 ნიშნავს 2-ს, 🟢 ნიშნავს 3-ს. რომელი ფერი აღნიშნავს {target}-ს?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '2;🔵;🔴;🟢;🟡',
          '1;🔴;🔵;🟢;🟡',
          '3;🟢;🔴;🔵;🟡',
        ],
      },
      target: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.target}-ს აღნიშნავს ${answer}.`,
  }),

  // Q53 — აირჩიე მწვანე/სხვა ფორმა (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-53', subtopicId: 'u14-color-choice', difficulty: 3 }),
    prompt: '{child} ეძებს: აირჩიე {colorName} ფერი.',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          'მწვანე;🟢;🔴;🔵;🟡',
          'წითელი;🔴;🔵;🟢;🟡',
          'ლურჯი;🔵;🔴;🟢;🟡',
          'ყვითელი;🟡;🔴;🔵;🟢',
          'იისფერი;🟣;🔴;🔵;🟢',
          'ნარინჯისფერი;🟠;🔴;🔵;🟢',
        ],
      },
      colorName: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) => `${vars.colorName} ფერია ${answer}.`,
  }),

  // Q54 — ფერების თანმიმდევრობა (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-54', subtopicId: 'u14-color-choice', difficulty: 3 }),
    prompt:
      '{child} აგრძელებს ფერების რიგს: {c1Name}, {c2Name}, {c3Name}, {c1Name}, {c2Name}, __. რა ფერი მოდის შემდეგ?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          'წითელი;ლურჯი;მწვანე;🟢;🔴;🔵;🟡',
          'ყვითელი;წითელი;ლურჯი;🔵;🟡;🔴;🟢',
          'ლურჯი;მწვანე;ყვითელი;🟡;🔵;🟢;🔴',
        ],
      },
      c1Name: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      c2Name: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      c3Name: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `თანმიმდევრობა მეორდება. შემდეგია ${vars.c3Name} (${answer}).`,
  }),

  // =========================================================================
  // U14.10 — სასწორები და წონის ლოგიკა (Q55–Q60)
  // =========================================================================

  // Q55 — შეადარე წონები (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-55', subtopicId: 'u14-balance-scales', difficulty: 1 }),
    prompt:
      '{child} ადარებს წონებს: ერთი {item1} იწონის {w1} ერთეულს, ერთი {item2} — {w2} ერთეულს. რომელი უფრო მძიმეა?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          'ვაშლი;3;მსხალი;2;ვაშლი;მსხალი',
          'ნესვი;5;საზამთრო;8;საზამთრო;ნესვი',
          'წიგნი;4;რვეული;1;წიგნი;რვეული',
          'ყუთი;7;ბურთი;3;ყუთი;ბურთი',
        ],
      },
      item1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      item2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      other: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [
      String(vars.other),
      'ორივე ერთნაირია',
      'მონაცემები საკმარისი არ არის',
    ],
    explanation: ({ vars, answer }) =>
      `მეტი წონა აქვს ${vars.correct}-ს, ამიტომ უფრო მძიმეა ${answer}.`,
  }),

  // Q56 — სასწორის ამოცანა (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u14-56', subtopicId: 'u14-balance-scales', difficulty: 1 }),
    prompt:
      '{child} ითვლის სასწორზე: თუ ⭐ = {w} ერთეული და სასწორზე დევს {count} ცალი ⭐, რამდენია მათი საერთო წონა?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      w: { kind: 'int', min: 2, max: 5 },
      count: { kind: 'choice', values: ['2', '3'] },
    },
    answer: (v) => Number(v.w) * Number(v.count),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.count} × ${vars.w} = ${answer} ერთეული.`,
  }),

  // Q57 — რამდენი ერთეულით მძიმეა (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u14-57', subtopicId: 'u14-balance-scales', difficulty: 2 }),
    prompt:
      '{child} ადარებს: ერთი {item} იწონის {w1} ერთეულს, მეორე კი — {w2} ერთეულს. რამდენი ერთეულით მძიმეა მეორე {item}?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      item: { kind: 'choice', values: ['ყუთი', 'სათამაშო', 'ჩანთა', 'ქვა'] },
      w1: { kind: 'int', min: 3, max: 6 },
      diff: { kind: 'int', min: 2, max: 5 },
      w2: { kind: 'choice', values: (v) => [Number(v.w1) + Number(v.diff)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.w2} − ${vars.w1} = ${answer} ერთეულით.`,
  }),

  // Q58 — თანაბარი წონა (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u14-58', subtopicId: 'u14-balance-scales', difficulty: 2 }),
    prompt:
      'ერთი {item} იწონის {w} ერთეულს. {child} ითვლის: რამდენი ასეთი {item} იწონის {total} ერთეულს?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      item: { kind: 'choice', values: ['ბურთი', 'ვაშლი', 'კუბიკი'] },
      w: { kind: 'choice', values: ['2', '3', '4'] },
      count: { kind: 'choice', values: ['2', '3', '4'] },
      total: { kind: 'choice', values: (v) => [Number(v.w) * Number(v.count)] },
    },
    answer: (v) => Number(v.count),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.total} : ${vars.w} = ${answer} ცალი.`,
  }),

  // Q59 — სასწორის შედარება მხარეებით (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-59', subtopicId: 'u14-balance-scales', difficulty: 3 }),
    prompt:
      '{child} უყურებს სასწორს: მარცხენა მხარეს დევს {wL} ერთეულის წონის საგანი, მარჯვენაზე — {wR} ერთეულის. რომელი მხარეა უფრო მძიმე?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '3;6;მარჯვენა;მარცხენა',
          '7;4;მარცხენა;მარჯვენა',
          '5;8;მარჯვენა;მარცხენა',
          '9;5;მარცხენა;მარჯვენა',
        ],
      },
      wL: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      wR: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      other: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [
      String(vars.other),
      'ორივე თანაბარია',
      'ვერ განვსაზღვრავთ',
    ],
    explanation: ({ vars, answer }) =>
      `უფრო მეტი წონა აქვს ${vars.correct} მხარეს (${vars.wL} vs ${vars.wR}), ამიტომ უფრო მძიმეა ${answer}.`,
  }),

  // Q60 — ორი ერთნაირი საგნის წონა (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u14-60', subtopicId: 'u14-balance-scales', difficulty: 3 }),
    prompt:
      'ერთი {item} იწონის {w} ერთეულს. {child} ითვლის: ორი ასეთი ერთნაირი {item}-ის საერთო წონაა:',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      item: { kind: 'choice', values: ['ყუთი', 'ტომარა', 'ქოთანი'] },
      w: { kind: 'int', min: 4, max: 9 },
    },
    answer: (v) => Number(v.w) * 2,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `2 × ${vars.w} = ${answer} ერთეული.`,
  }),

  // =========================================================================
  // U14.11 — რთული გამორიცხვის ამოცანები (Q61–Q66)
  // =========================================================================

  // Q61 — ლუწი რიცხვი 10-სა და 20-ს შორის (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-61', subtopicId: 'u14-elimination-harder', difficulty: 1 }),
    prompt:
      '{child} გვეკითხება: „რიცხვი {low}-ზე მეტია, {high}-ზე ნაკლები და ლუწია. რომელი შეიძლება იყოს?“',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '10;20;16;11;13;21',
          '10;20;14;11;15;23',
          '20;30;24;21;25;31',
          '20;30;28;23;27;33',
        ],
      },
      low: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      high: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.low}-სა და ${vars.high}-ს შორის ერთადერთი ლუწი რიცხვია ${answer}.`,
  }),

  // Q62 — ერთეულების ციფრი 5 შუალედში (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-62', subtopicId: 'u14-elimination-harder', difficulty: 1 }),
    prompt:
      '{child} გვეუბნება: „რიცხვი {low}-ზე მეტია, {high}-ზე ნაკლები და ერთეულების ციფრი 5-ია. რომელია?“',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      tens: { kind: 'choice', values: ['3', '4', '5', '6'] },
      low: { kind: 'choice', values: (v) => [Number(v.tens) * 10] },
      high: { kind: 'choice', values: (v) => [(Number(v.tens) + 1) * 10] },
    },
    answer: (v) => Number(v.tens) * 10 + 5,
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => [
      Number(answer) - 3,
      Number(answer) + 3,
      Number(answer) + 10,
    ],
    explanation: ({ answer }) =>
      `ერთადერთი ასეთი რიცხვია ${answer}.`,
  }),

  // Q63 — სამი პირობა (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-63', subtopicId: 'u14-elimination-harder', difficulty: 2 }),
    prompt:
      '{child} ეძებს რიცხვს: „რიცხვი {low}-ზე მეტია, {high}-ზე ნაკლები და იყოფა 2-ზე (ლუწია). რომელი რიცხვი აკმაყოფილებს ყველა პირობას?“',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '20;30;26;21;23;31',
          '30;40;34;31;35;41',
          '40;50;46;41;43;51',
          '10;20;18;13;15;21',
        ],
      },
      low: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      high: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) =>
      `ყველა პირობას აკმაყოფილებს ${answer}.`,
  }),

  // Q64 — განსხვავებული მიმდევრობა (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-64', subtopicId: 'u14-elimination-harder', difficulty: 2 }),
    prompt:
      '{child} ამოწმებს მიმდევრობებს: რომელი მიმდევრობა არ იზრდება ყოველ ჯერზე 2-ით?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '10, 12, 15, 16;2, 4, 6, 8;5, 7, 9, 11;1, 3, 5, 7',
          '4, 6, 9, 10;6, 8, 10, 12;7, 9, 11, 13;3, 5, 7, 9',
          '8, 10, 13, 14;10, 12, 14, 16;11, 13, 15, 17;20, 22, 24, 26',
        ],
      },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) =>
      `მიმდევრობაში ${answer} ნაბიჯი 2-ის ტოლი არ არის.`,
  }),

  // Q65 — ვინ არის ყველაზე უმცროსი? (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-65', subtopicId: 'u14-elimination-harder', difficulty: 3 }),
    prompt:
      '{child} გვეკითხება: {c1} უფრო უფროსია, ვიდრე {c2}. {c2} უფრო უფროსია, ვიდრე {c3}. ვინ არის ყველაზე უმცროსი?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          'ანა;ნიკა;ლუკა',
          'მარიამი;გიორგი;დათო',
          'ელენე;საბა;თემო',
          'ნინო;ირაკლი;სალომე',
        ],
      },
      c1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      c2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      c3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
    },
    answer: (v) => String(v.c3),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.c1), String(vars.c2), 'სამივე ერთნაირი ასაკისაა'],
    explanation: ({ vars, answer }) =>
      `${vars.c1} > ${vars.c2} > ${vars.c3}, ამიტომ ყველაზე უმცროსია ${answer}.`,
  }),

  // Q66 — ყველაზე მძიმე საგანი (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-66', subtopicId: 'u14-elimination-harder', difficulty: 3 }),
    prompt:
      '{child} ადარებს საგნების წონებს: {i1} — {w1} ერთეული, {i2} — {w2} ერთეული, {i3} — {w3} ერთეული, ფანქარი — 1 ერთეული. რომელია ყველაზე მძიმე?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          'ბურთი;3;წიგნი;5;ყუთი;8;ყუთი;ბურთი;წიგნი;ფანქარი',
          'ვაშლი;2;ნესვი;6;საზამთრო;10;საზამთრო;ვაშლი;ნესვი;ფანქარი',
          'რვეული;2;პენალი;4;ჩანთა;9;ჩანთა;რვეული;პენალი;ფანქარი',
          'კუბიკი;3;მანქანა;5;რობოტი;8;რობოტი;კუბიკი;მანქანა;ფანქარი',
        ],
      },
      i1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      i2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      i3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[6]] },
      witem1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[7]] },
      witem2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[8]] },
      witem3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[9]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.witem1), String(vars.witem2), String(vars.witem3)],
    explanation: ({ vars, answer }) => `ყველაზე მეტი წონა აქვს ${vars.correct}-ს (${vars.w3} ერთეული).`,
  }),

  // =========================================================================
  // U14.12 — ჩაფიქრებული რიცხვი (Q67–Q72)
  // =========================================================================

  // Q67 — მიმატებით ჩაფიქრებული (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u14-67', subtopicId: 'u14-thought-of-number', difficulty: 1 }),
    prompt:
      '{child}-მ ჩაიფიქრა რიცხვი: მას დაუმატა {add} და მიიღო {sum}. რა რიცხვი ჩაიფიქრა {child}-მ?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      orig: { kind: 'int', min: 4, max: 9 },
      add: { kind: 'int', min: 3, max: 6 },
      sum: { kind: 'choice', values: (v) => [Number(v.orig) + Number(v.add)] },
    },
    answer: (v) => Number(v.orig),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.sum} − ${vars.add} = ${answer}.`,
  }),

  // Q68 — გამოკლებით ჩაფიქრებული (Level 1, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u14-68', subtopicId: 'u14-thought-of-number', difficulty: 1 }),
    prompt:
      '{child}-მ ჩაიფიქრა რიცხვი: მას გამოაკლო {sub} და მიიღო {diff}. რა რიცხვი ჩაიფიქრა {child}-მ?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      diff: { kind: 'int', min: 6, max: 12 },
      sub: { kind: 'int', min: 2, max: 5 },
      orig: { kind: 'choice', values: (v) => [Number(v.diff) + Number(v.sub)] },
    },
    answer: (v) => Number(v.orig),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.diff} + ${vars.sub} = ${answer}.`,
  }),

  // Q69 — გაორმაგებით ჩაფიქრებული (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u14-69', subtopicId: 'u14-thought-of-number', difficulty: 2 }),
    prompt:
      '{child}-მ ჩაფიქრებული რიცხვი გააორმაგა და მიიღო {doubled}. რა რიცხვი ჩაიფიქრა?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      orig: { kind: 'int', min: 3, max: 9 },
      doubled: { kind: 'choice', values: (v) => [Number(v.orig) * 2] },
    },
    answer: (v) => Number(v.orig),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.doubled} : 2 = ${answer}.`,
  }),

  // Q70 — 10-ის მიმატებით ჩაფიქრებული (Level 2, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u14-70', subtopicId: 'u14-thought-of-number', difficulty: 2 }),
    prompt:
      '{child}-მ რიცხვს დაუმატა 10 და მიიღო {sum}. რა რიცხვი ჩაიფიქრა {child}-მ?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      orig: { kind: 'int', min: 11, max: 25 },
      sum: { kind: 'choice', values: (v) => [Number(v.orig) + 10] },
    },
    answer: (v) => Number(v.orig),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 5, 5),
    explanation: ({ vars, answer }) =>
      `${vars.sum} − 10 = ${answer}.`,
  }),

  // Q71 — გამოკლებით ჩაფიქრებული (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u14-71', subtopicId: 'u14-thought-of-number', difficulty: 3 }),
    prompt:
      '{child}-მ ჩაფიქრებულ რიცხვს გამოაკლო {sub} და მიიღო {diff}. რა რიცხვი ჩაიფიქრა?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      diff: { kind: 'int', min: 14, max: 24 },
      sub: { kind: 'int', min: 4, max: 8 },
      orig: { kind: 'choice', values: (v) => [Number(v.diff) + Number(v.sub)] },
    },
    answer: (v) => Number(v.orig),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.diff} + ${vars.sub} = ${answer}.`,
  }),

  // Q72 — მიმატებით 20-მდე (Level 3, Numeric)
  defineTemplate({
    ...addr({ id: 'g2-u14-72', subtopicId: 'u14-thought-of-number', difficulty: 3 }),
    prompt:
      '{child}-მ რიცხვს დაუმატა {add} და მიიღო {sum}. რა რიცხვი ჩაიფიქრა {child}-მ?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      orig: { kind: 'int', min: 11, max: 16 },
      add: { kind: 'int', min: 5, max: 9 },
      sum: { kind: 'choice', values: (v) => [Number(v.orig) + Number(v.add)] },
    },
    answer: (v) => Number(v.orig),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 1, 1),
    explanation: ({ vars, answer }) =>
      `${vars.sum} − ${vars.add} = ${answer}.`,
  }),

  // =========================================================================
  // U14.13 — პირობების შეხამება (Q73–Q78)
  // =========================================================================

  // Q73 — რიცხვი შუალედში (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-73', subtopicId: 'u14-matching-conditions', difficulty: 1 }),
    prompt:
      '{child} ეძებს რიცხვს: აირჩიე რიცხვი, რომელიც {low}-ზე მეტია და {high}-ზე ნაკლები.',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '5;10;7;4;10;12',
          '10;15;13;9;15;17',
          '15;20;18;14;20;22',
          '20;25;22;19;25;27',
        ],
      },
      low: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      high: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${vars.low}-სა და ${vars.high}-ს შორის არის ${answer}.`,
  }),

  // Q74 — ორი პირობა: ლუწი და შუალედში (Level 1, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-74', subtopicId: 'u14-matching-conditions', difficulty: 1 }),
    prompt:
      '{child} ეძებს რიცხვს: აირჩიე რიცხვი, რომელიც ლუწია, {low}-ზე მეტია და {high}-ზე ნაკლები.',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '10;15;12;11;15;17',
          '14;19;16;13;17;19',
          '20;25;22;21;25;27',
          '6;11;8;5;9;11',
        ],
      },
      low: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      high: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ answer }) =>
      `ორივე პირობას აკმაყოფილებს ${answer}.`,
  }),

  // Q75 — ჯერადი და ნაკლები (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-75', subtopicId: 'u14-matching-conditions', difficulty: 2 }),
    prompt:
      '{child}-ს აინტერესებს: რომელი რიცხვი არის {k}-ის ჯერადი (იყოფა {k}-ზე) და {limit}-ზე ნაკლები?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '3;10;6;4;5;8',
          '4;15;8;5;7;9',
          '5;20;15;8;12;14',
          '3;12;9;5;7;8',
        ],
      },
      k: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      limit: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `${answer} იყოფა ${vars.k}-ზე და ნაკლებია ${vars.limit}-ზე.`,
  }),

  // Q76 — სამი პირობა: ერთეულების ციფრი და შუალედი (Level 2, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-76', subtopicId: 'u14-matching-conditions', difficulty: 2 }),
    prompt:
      '{child} გვეუბნება: „რიცხვი {low}-ზე მეტია, {high}-ზე ნაკლები და ერთეულების ციფრი {digit}-ია. რომელია?“',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      tens: { kind: 'choice', values: ['2', '3', '4', '5'] },
      digit: { kind: 'choice', values: ['2', '3', '4'] },
      low: { kind: 'choice', values: (v) => [Number(v.tens) * 10] },
      high: { kind: 'choice', values: (v) => [(Number(v.tens) + 1) * 10] },
      ans: { kind: 'choice', values: (v) => [Number(v.tens) * 10 + Number(v.digit)] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer', min: 1 },
    distractors: ({ answer }) => [
      Number(answer) - 1,
      Number(answer) + 2,
      Number(answer) + 10,
    ],
    explanation: ({ answer }) =>
      `ეს რიცხვია ${answer}.`,
  }),

  // Q77 — შესაბამისი მიმდევრობა (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-77', subtopicId: 'u14-matching-conditions', difficulty: 3 }),
    prompt:
      '{child} ეძებს: აირჩიე მიმდევრობა, რომელშიც ყოველი შემდეგი რიცხვი წინაზე {step}-ით მეტია.',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '3;1, 4, 7, 10;2, 4, 6, 8;10, 8, 6, 4;3, 7, 11, 15',
          '4;2, 6, 10, 14;1, 4, 7, 10;2, 5, 8, 11;5, 10, 15, 20',
          '5;3, 8, 13, 18;2, 6, 10, 14;1, 4, 7, 10;4, 8, 12, 16',
        ],
      },
      step: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [String(vars.w1), String(vars.w2), String(vars.w3)],
    explanation: ({ vars, answer }) =>
      `მიმდევრობაში ${answer} ყოველი რიცხვი წინაზე ${vars.step}-ით მეტია.`,
  }),

  // Q78 — საბოლოო ლოგიკური ამოცანა (Level 3, MC)
  defineTemplate({
    ...addr({ id: 'g2-u14-78', subtopicId: 'u14-matching-conditions', difficulty: 3 }),
    prompt:
      '{child}-ს აქვს სამი ყუთი. მათში დევს {n1}, {n2} და {n3} ბურთი. პირველ ყუთში ყველაზე ცოტა ბურთია, ხოლო მესამეში — ყველაზე მეტი. რამდენი ბურთია მეორე ყუთში?',
    variables: {
      child: { kind: 'choice', values: CHILDREN },
      pack: {
        kind: 'choice',
        values: [
          '2;5;8;5;2;8',
          '3;6;9;6;3;9',
          '1;4;7;4;1;7',
          '4;7;10;7;4;10',
        ],
      },
      n1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[0]] },
      n2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[1]] },
      n3: { kind: 'choice', values: (v) => [String(v.pack).split(';')[2]] },
      correct: { kind: 'choice', values: (v) => [String(v.pack).split(';')[3]] },
      w1: { kind: 'choice', values: (v) => [String(v.pack).split(';')[4]] },
      w2: { kind: 'choice', values: (v) => [String(v.pack).split(';')[5]] },
    },
    answer: (v) => String(v.correct),
    format: { kind: 'text' },
    distractors: ({ vars }) => [
      String(vars.w1),
      String(vars.w2),
      'მონაცემები საკმარისი არ არის',
    ],
    explanation: ({ vars, answer }) =>
      `ყუთებია დალაგებული: ${vars.n1} < ${answer} < ${vars.n3}. მეორე ყუთშია ${answer} ბურთი.`,
  }),
];
