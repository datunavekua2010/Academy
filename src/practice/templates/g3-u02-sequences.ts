/**
 * Grade 3 — U02: თვლა და რიცხვითი მიმდევრობები (Counting and Number Sequences).
 *
 * Full curriculum implementation for Grade 3 Unit 2 from Google Drive document U02:
 * 42 templates (Q01–Q42) across seven subtopics with complete Level 1, 2, and 3 coverage:
 *
 *   U02.1 `u02-even-odd`              (ლუწი და კენტი რიცხვები, Q01–Q06)             6 templates
 *   U02.2 `u02-counting-objects`      (საგნების დათვლა, Q07–Q12)                    6 templates
 *   U02.3 `u02-skip-counting`         (ბიჯებით თვლა, Q13–Q18)                       6 templates
 *   U02.4 `u02-counting-tables`       (თვლა ცხრილების გამოყენებით, Q19–Q24)         6 templates
 *   U02.5 `u02-number-patterns`       (რიცხვითი მიმდევრობები, Q25–Q30)              6 templates
 *   U02.6 `u02-number-line-movement`  (გადაადგილება რიცხვით ღერძზე, Q31–Q36)        6 templates
 *   U02.7 `u02-sorting-even-odd`      (ლუწი და კენტი რიცხვების დახარისხება, Q37–Q42) 6 templates
 */

import { defineTemplate } from './types';
import type { QuestionTemplate } from './types';

const grade = 3 as const;
const topicId = 'g3-tvla-mimdevrobebi' as const;
const unitId = 'g3-tvla-mimdevrobebi' as const;

export const G3_U02_SUBTOPICS = [
  'u02-even-odd',
  'u02-counting-objects',
  'u02-skip-counting',
  'u02-counting-tables',
  'u02-number-patterns',
  'u02-number-line-movement',
  'u02-sorting-even-odd',
] as const;

export type G3U02SubtopicId = (typeof G3_U02_SUBTOPICS)[number];

const addr = (spec: { id: string; subtopicId: G3U02SubtopicId; difficulty: 1 | 2 | 3 }) => ({
  id: spec.id,
  grade,
  topicId,
  unitId,
  subtopicId: spec.subtopicId,
  difficulty: spec.difficulty,
});

/** Near-miss helper for integer distractors */
const nearMisses = (answer: number, minVal = 0, maxVal = 100): number[] => {
  const wrong: number[] = [];
  for (const offset of [1, -1, 2, -2, 10, -10, 5, -5, 20, -20]) {
    const cand = answer + offset;
    if (cand >= minVal && cand <= maxVal && cand !== answer && !wrong.includes(cand)) {
      wrong.push(cand);
    }
  }
  return wrong;
};

export const G3_U02_TEMPLATES: QuestionTemplate[] = [
  // ==================================================================
  // U02.1 — ლუწი და კენტი რიცხვები (u02-even-odd)
  // ==================================================================

  // Q01: მოცემული რიცხვებიდან რომელია ლუწი?
  defineTemplate({
    ...addr({ id: 'g3-u02-01', subtopicId: 'u02-even-odd', difficulty: 1 }),
    prompt: 'მოცემული რიცხვებიდან რომელია ლუწი?\n\n{even}, {o1}, {o2}, {o3}',
    variables: {
      k: { kind: 'int', min: 11, max: 48 },
      d1: { kind: 'choice', values: [1, 3, 5] },
      d2: { kind: 'choice', values: [7, 9, 11] },
      d3: { kind: 'choice', values: [13, 15, 17] },
      even: { kind: 'choice', values: (v) => [Number(v.k) * 2] },
      o1: { kind: 'choice', values: (v) => [Number(v.k) * 2 + Number(v.d1)] },
      o2: { kind: 'choice', values: (v) => [Number(v.k) * 2 - Number(v.d2)] },
      o3: { kind: 'choice', values: (v) => [Number(v.k) * 2 + Number(v.d3)] },
    },
    answer: (v) => Number(v.even),
    format: { kind: 'integer', min: 10, max: 120 },
    distractors: ({ vars }) => [Number(vars.o1), Number(vars.o2), Number(vars.o3)],
    explanation: ({ answer }) => `${answer} ბოლოვდება ლუწი ციფრით (0, 2, 4, 6 ან 8), ამიტომ ლუწია.`,
  }),

  // Q02: მოცემული რიცხვებიდან რომელია კენტი?
  defineTemplate({
    ...addr({ id: 'g3-u02-02', subtopicId: 'u02-even-odd', difficulty: 1 }),
    prompt: 'მოცემული რიცხვებიდან რომელია კენტი?\n\n{odd}, {e1}, {e2}, {e3}',
    variables: {
      k: { kind: 'int', min: 11, max: 48 },
      d1: { kind: 'choice', values: [2, 4, 6] },
      d2: { kind: 'choice', values: [8, 10, 12] },
      d3: { kind: 'choice', values: [14, 16, 18] },
      odd: { kind: 'choice', values: (v) => [Number(v.k) * 2 + 1] },
      e1: { kind: 'choice', values: (v) => [Number(v.k) * 2] },
      e2: { kind: 'choice', values: (v) => [Number(v.k) * 2 + Number(v.d1)] },
      e3: { kind: 'choice', values: (v) => [Number(v.k) * 2 - Number(v.d2)] },
    },
    answer: (v) => Number(v.odd),
    format: { kind: 'integer', min: 10, max: 120 },
    distractors: ({ vars }) => [Number(vars.e1), Number(vars.e2), Number(vars.e3)],
    explanation: ({ answer }) => `${answer} ბოლოვდება კენტი ციფრით (1, 3, 5, 7 ან 9), ამიტომ კენტია.`,
  }),

  // Q03: შეავსე გამოტოვებული რიცხვი (even sequence)
  defineTemplate({
    ...addr({ id: 'g3-u02-03', subtopicId: 'u02-even-odd', difficulty: 2 }),
    prompt: 'შეავსე გამოტოვებული ლუწი რიცხვი:\n\n{a}, {b}, __, {d}, {e}',
    variables: {
      k: { kind: 'int', min: 10, max: 42 },
      a: { kind: 'choice', values: (v) => [Number(v.k) * 2] },
      b: { kind: 'choice', values: (v) => [Number(v.k) * 2 + 2] },
      d: { kind: 'choice', values: (v) => [Number(v.k) * 2 + 6] },
      e: { kind: 'choice', values: (v) => [Number(v.k) * 2 + 8] },
    },
    answer: (v) => Number(v.k) * 2 + 4,
    format: { kind: 'integer', min: 10, max: 100 },
    distractors: ({ answer }) => {
      const ans = Number(answer);
      return [ans - 1, ans + 1, ans + 2];
    },
    explanation: ({ vars, answer }) => `${vars.b}-სა და ${vars.d}-ს შორის მდებარე ლუწი რიცხვია ${answer}.`,
  }),

  // Q04: შეავსე გამოტოვებული რიცხვი (odd sequence)
  defineTemplate({
    ...addr({ id: 'g3-u02-04', subtopicId: 'u02-even-odd', difficulty: 2 }),
    prompt: 'შეავსე გამოტოვებული კენტი რიცხვი:\n\n{a}, {b}, __, {d}, {e}',
    variables: {
      k: { kind: 'int', min: 10, max: 42 },
      a: { kind: 'choice', values: (v) => [Number(v.k) * 2 + 1] },
      b: { kind: 'choice', values: (v) => [Number(v.k) * 2 + 3] },
      d: { kind: 'choice', values: (v) => [Number(v.k) * 2 + 7] },
      e: { kind: 'choice', values: (v) => [Number(v.k) * 2 + 9] },
    },
    answer: (v) => Number(v.k) * 2 + 5,
    format: { kind: 'integer', min: 10, max: 100 },
    distractors: ({ answer }) => {
      const ans = Number(answer);
      return [ans - 1, ans + 1, ans + 2];
    },
    explanation: ({ vars, answer }) => `${vars.b}-სა და ${vars.d}-ს შორის მდებარე კენტი რიცხვია ${answer}.`,
  }),

  // Q05: რომელი წყვილის ორივე რიცხვია ლუწი?
  defineTemplate({
    ...addr({ id: 'g3-u02-05', subtopicId: 'u02-even-odd', difficulty: 3 }),
    prompt: 'რომელი წყვილის ორივე რიცხვია ლუწი? {variant}',
    variables: {
      k1: { kind: 'int', min: 12, max: 35 },
      k2: { kind: 'int', min: 12, max: 35 },
      variant: { kind: 'choice', values: ['აირჩიე სწორი ვარიანტი.', 'მონიშნე სწორი წყვილი.'] },
      e1: { kind: 'choice', values: (v) => [Number(v.k1) * 2] },
      e2: { kind: 'choice', values: (v) => [Number(v.k2) * 2 + 4] },
      o1: { kind: 'choice', values: (v) => [Number(v.k1) * 2 - 3] },
      e3: { kind: 'choice', values: (v) => [Number(v.k2) * 2 + 2] },
      o2: { kind: 'choice', values: (v) => [Number(v.k1) * 2 + 1] },
      o3: { kind: 'choice', values: (v) => [Number(v.k2) * 2 + 5] },
      e4: { kind: 'choice', values: (v) => [Number(v.k1) * 2 + 6] },
      o4: { kind: 'choice', values: (v) => [Number(v.k2) * 2 - 1] },
    },
    answer: (v) => `${v.e1} და ${v.e2}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => [
      `${vars.o1} და ${vars.e3}`,
      `${vars.o2} და ${vars.o3}`,
      `${vars.e4} და ${vars.o4}`,
    ],
    explanation: ({ vars }) => `რიცხვები ${vars.e1} და ${vars.e2} ორივე ლუწია.`,
  }),

  // Q06: რიცხვი 67 ლუწია თუ კენტი?
  defineTemplate({
    ...addr({ id: 'g3-u02-06', subtopicId: 'u02-even-odd', difficulty: 3 }),
    prompt: 'რიცხვი {n} ლუწია თუ კენტი?',
    variables: { n: { kind: 'int', min: 21, max: 99 } },
    optionCount: 2,
    answer: (v) => (Number(v.n) % 2 === 0 ? 'ლუწი' : 'კენტი'),
    format: { kind: 'text' },
    distractors: ({ answer }) => [String(answer) === 'ლუწი' ? 'კენტი' : 'ლუწი'],
    explanation: ({ vars, answer }) => `${vars.n} ბოლოვდება ციფრით ${Number(vars.n) % 10}, ამიტომ ის არის ${answer}.`,
  }),

  // ==================================================================
  // U02.2 — საგნების დათვლა (u02-counting-objects)
  // ==================================================================

  // Q07: სურათზე არის 4 რიგი, თითოეულ რიგში 6 ვაშლია...
  defineTemplate({
    ...addr({ id: 'g3-u02-07', subtopicId: 'u02-counting-objects', difficulty: 1 }),
    prompt: 'სურათზე არის {rows} რიგი, თითოეულ რიგში {cols} ვაშლია. სულ რამდენი ვაშლია?',
    variables: {
      rows: { kind: 'int', min: 3, max: 7 },
      cols: { kind: 'int', min: 3, max: 8 },
    },
    answer: (v) => Number(v.rows) * Number(v.cols),
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ vars, answer }) => {
      const r = Number(vars.rows);
      const c = Number(vars.cols);
      const ans = Number(answer);
      return [r + c, ans - r, ans + c];
    },
    explanation: ({ vars, answer }) => `${vars.rows} × ${vars.cols} = ${answer} ვაშლი.`,
  }),

  // Q08: 5 თეფშზე თითოეულზე 7 ორცხობილაა...
  defineTemplate({
    ...addr({ id: 'g3-u02-08', subtopicId: 'u02-counting-objects', difficulty: 1 }),
    prompt: '{plates} თეფშზე თითოეულზე {items} ორცხობილაა. სულ რამდენი ორცხობილაა?',
    variables: {
      plates: { kind: 'int', min: 3, max: 8 },
      items: { kind: 'int', min: 4, max: 9 },
    },
    answer: (v) => Number(v.plates) * Number(v.items),
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ vars, answer }) => {
      const p = Number(vars.plates);
      const it = Number(vars.items);
      const ans = Number(answer);
      return [p + it, ans - p, ans + it];
    },
    explanation: ({ vars, answer }) => `${vars.plates} × ${vars.items} = ${answer} ორცხობილა.`,
  }),

  // Q09: ოთახში 3 რიგად დგას სკამები...
  defineTemplate({
    ...addr({ id: 'g3-u02-09', subtopicId: 'u02-counting-objects', difficulty: 2 }),
    prompt: 'ოთახში {rows} რიგად დგას სკამები, თითოეულ რიგში {cols} სკამია. რამდენი სკამია სულ?',
    variables: {
      rows: { kind: 'int', min: 3, max: 8 },
      cols: { kind: 'int', min: 4, max: 9 },
    },
    answer: (v) => Number(v.rows) * Number(v.cols),
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ answer }) => nearMisses(Number(answer), 1, 100),
    explanation: ({ vars, answer }) => `${vars.rows} × ${vars.cols} = ${answer} სკამი.`,
  }),

  // Q10: ყუთში 6 შეკვრა ფანქარია...
  defineTemplate({
    ...addr({ id: 'g3-u02-10', subtopicId: 'u02-counting-objects', difficulty: 2 }),
    prompt: 'ყუთში {packs} შეკვრა ფანქარია. თითოეულ შეკვრაში {items} ფანქარია. რამდენი ფანქარია სულ?',
    variables: {
      packs: { kind: 'int', min: 4, max: 9 },
      items: { kind: 'int', min: 4, max: 8 },
    },
    answer: (v) => Number(v.packs) * Number(v.items),
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ answer }) => nearMisses(Number(answer), 1, 100),
    explanation: ({ vars, answer }) => `${vars.packs} × ${vars.items} = ${answer} ფანქარი.`,
  }),

  // Q11: ბაღში 4 რიგად დარგულია ყვავილები...
  defineTemplate({
    ...addr({ id: 'g3-u02-11', subtopicId: 'u02-counting-objects', difficulty: 3 }),
    prompt: 'ბაღში {rows} რიგად დარგულია ყვავილები, თითოეულ რიგში {cols} ყვავილია. რამდენი ყვავილია სულ?',
    variables: {
      rows: { kind: 'int', min: 3, max: 7 },
      cols: { kind: 'int', min: 5, max: 10 },
    },
    answer: (v) => Number(v.rows) * Number(v.cols),
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ answer }) => nearMisses(Number(answer), 1, 100),
    explanation: ({ vars, answer }) => `${vars.rows} × ${vars.cols} = ${answer} ყვავილი.`,
  }),

  // Q12: თითოეულ კალათაში 8 ბურთია...
  defineTemplate({
    ...addr({ id: 'g3-u02-12', subtopicId: 'u02-counting-objects', difficulty: 3 }),
    prompt: 'თითოეულ კალათაში {items} ბურთია. რამდენი ბურთია {baskets} კალათაში?',
    variables: {
      items: { kind: 'int', min: 5, max: 10 },
      baskets: { kind: 'int', min: 3, max: 8 },
    },
    answer: (v) => Number(v.items) * Number(v.baskets),
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ answer }) => nearMisses(Number(answer), 1, 100),
    explanation: ({ vars, answer }) => `${vars.baskets} × ${vars.items} = ${answer} ბურთი.`,
  }),

  // ==================================================================
  // U02.3 — ბიჯებით თვლა (u02-skip-counting)
  // ==================================================================

  // Q13: გააგრძელე მიმდევრობა: 10, 20, 30, __, 50.
  defineTemplate({
    ...addr({ id: 'g3-u02-13', subtopicId: 'u02-skip-counting', difficulty: 1 }),
    prompt: 'გააგრძელე მიმდევრობა:\n\n{a}, {b}, {c}, __, {e}',
    variables: {
      step: { kind: 'choice', values: [5, 10, 15, 20] },
      base: { kind: 'int', min: 1, max: 6 },
      a: { kind: 'choice', values: (v) => [Number(v.base) * Number(v.step)] },
      b: { kind: 'choice', values: (v) => [(Number(v.base) + 1) * Number(v.step)] },
      c: { kind: 'choice', values: (v) => [(Number(v.base) + 2) * Number(v.step)] },
      e: { kind: 'choice', values: (v) => [(Number(v.base) + 4) * Number(v.step)] },
    },
    answer: (v) => (Number(v.base) + 3) * Number(v.step),
    format: { kind: 'integer', min: 1, max: 150 },
    distractors: ({ answer }) => nearMisses(Number(answer), 1, 150),
    explanation: ({ vars, answer }) => `${vars.c} + ${vars.step} = ${answer}.`,
  }),

  // Q14: გააგრძელე მიმდევრობა: 7, 14, 21, __, 35.
  defineTemplate({
    ...addr({ id: 'g3-u02-14', subtopicId: 'u02-skip-counting', difficulty: 1 }),
    prompt: 'გააგრძელე მიმდევრობა:\n\n{a}, {b}, {c}, __, {e}',
    variables: {
      step: { kind: 'choice', values: [6, 7, 8, 9] },
      base: { kind: 'int', min: 1, max: 4 },
      a: { kind: 'choice', values: (v) => [Number(v.base) * Number(v.step)] },
      b: { kind: 'choice', values: (v) => [(Number(v.base) + 1) * Number(v.step)] },
      c: { kind: 'choice', values: (v) => [(Number(v.base) + 2) * Number(v.step)] },
      e: { kind: 'choice', values: (v) => [(Number(v.base) + 4) * Number(v.step)] },
    },
    answer: (v) => (Number(v.base) + 3) * Number(v.step),
    format: { kind: 'integer', min: 1, max: 120 },
    distractors: ({ answer }) => nearMisses(Number(answer), 1, 120),
    explanation: ({ vars, answer }) => `ნაბიჯია ${vars.step}, ამიტომ ${vars.c} + ${vars.step} = ${answer}.`,
  }),

  // Q15: გააგრძელე მიმდევრობა (კლებადი): 100, 90, 80, __, 60.
  defineTemplate({
    ...addr({ id: 'g3-u02-15', subtopicId: 'u02-skip-counting', difficulty: 2 }),
    prompt: 'გააგრძელე კლებადი მიმდევრობა:\n\n{a}, {b}, {c}, __, {e}',
    variables: {
      start: { kind: 'choice', values: [100, 90, 85, 80, 75, 70] },
      step: { kind: 'choice', values: [5, 10] },
      a: { kind: 'choice', values: (v) => [Number(v.start)] },
      b: { kind: 'choice', values: (v) => [Number(v.start) - Number(v.step)] },
      c: { kind: 'choice', values: (v) => [Number(v.start) - 2 * Number(v.step)] },
      e: { kind: 'choice', values: (v) => [Number(v.start) - 4 * Number(v.step)] },
    },
    answer: (v) => Number(v.start) - 3 * Number(v.step),
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ answer }) => nearMisses(Number(answer), 1, 100),
    explanation: ({ vars, answer }) => `${vars.c} − ${vars.step} = ${answer}.`,
  }),

  // Q16: დაიწყე 12-დან და ყოველ ჯერზე დაამატე 4. რა რიცხვი იქნება მეოთხე ნაბიჯის შემდეგ?
  defineTemplate({
    ...addr({ id: 'g3-u02-16', subtopicId: 'u02-skip-counting', difficulty: 2 }),
    prompt: 'დაიწყე {start}-დან და ყოველ ჯერზე დაამატე {step}. რა რიცხვი იქნება მე-{steps} ნაბიჯის შემდეგ?',
    variables: {
      start: { kind: 'int', min: 10, max: 28 },
      step: { kind: 'choice', values: [3, 4, 5, 6] },
      steps: { kind: 'choice', values: [3, 4, 5] },
    },
    answer: (v) => Number(v.start) + Number(v.step) * Number(v.steps),
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ vars, answer }) => {
      const s = Number(vars.start);
      const step = Number(vars.step);
      const steps = Number(vars.steps);
      const ans = Number(answer);
      return [ans - step, ans + step, s + steps];
    },
    explanation: ({ vars, answer }) => `${vars.start} + (${vars.steps} × ${vars.step}) = ${answer}.`,
  }),

  // Q17: დაიწყე 65-დან და ყოველ ჯერზე გამოაკელი 5. რა რიცხვი იქნება მესამე ნაბიჯის შემდეგ?
  defineTemplate({
    ...addr({ id: 'g3-u02-17', subtopicId: 'u02-skip-counting', difficulty: 3 }),
    prompt: 'დაიწყე {start}-დან და ყოველ ჯერზე გამოაკელი {step}. რა რიცხვი იქნება მე-{steps} ნაბიჯის შემდეგ?',
    variables: {
      start: { kind: 'int', min: 55, max: 85 },
      step: { kind: 'choice', values: [4, 5, 6, 7] },
      steps: { kind: 'choice', values: [3, 4] },
    },
    answer: (v) => Number(v.start) - Number(v.step) * Number(v.steps),
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ vars, answer }) => {
      const step = Number(vars.step);
      const ans = Number(answer);
      return [ans - step, ans + step, ans - 1];
    },
    explanation: ({ vars, answer }) => `${vars.start} − (${vars.steps} × ${vars.step}) = ${answer}.`,
  }),

  // Q18: რომელ მიმდევრობაში იზრდება რიცხვები ყოველ ჯერზე 6-ით?
  defineTemplate({
    ...addr({ id: 'g3-u02-18', subtopicId: 'u02-skip-counting', difficulty: 3 }),
    prompt: 'რომელ მიმდევრობაში იზრდება რიცხვები ყოველ ჯერზე {step}-ით?',
    variables: {
      start: { kind: 'int', min: 5, max: 20 },
      step: { kind: 'choice', values: [4, 5, 6, 7] },
    },
    answer: (v) => {
      const s = Number(v.start);
      const st = Number(v.step);
      return `${s}, ${s + st}, ${s + 2 * st}, ${s + 3 * st}`;
    },
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const s = Number(vars.start);
      const st = Number(vars.step);
      return [
        `${s}, ${s + st - 1}, ${s + 2 * st - 2}, ${s + 3 * st - 3}`,
        `${s}, ${s + st + 1}, ${s + 2 * st + 2}, ${s + 3 * st + 3}`,
        `${s}, ${s + 2 * st}, ${s + 3 * st}, ${s + 4 * st}`,
      ];
    },
    explanation: ({ vars, answer }) => `სწორია ${answer}, რადგან სხვაობა მეზობელ წევრებს შორის ყოველთვის არის ${vars.step}.`,
  }),

  // ==================================================================
  // U02.4 — თვლა ცხრილების გამოყენებით (u02-counting-tables)
  // ==================================================================

  // Q19: ცხრილში თითოეული შემდეგი რიცხვი წინა რიცხვზე 3-ით მეტია: 12, 15, 18, __, 24.
  defineTemplate({
    ...addr({ id: 'g3-u02-19', subtopicId: 'u02-counting-tables', difficulty: 1 }),
    prompt: 'ცხრილში თითოეული შემდეგი რიცხვი წინა რიცხვზე {step}-ით მეტია:\n\n{a}, {b}, {c}, __, {e}',
    variables: {
      start: { kind: 'int', min: 10, max: 35 },
      step: { kind: 'choice', values: [3, 4, 5] },
      a: { kind: 'choice', values: (v) => [Number(v.start)] },
      b: { kind: 'choice', values: (v) => [Number(v.start) + Number(v.step)] },
      c: { kind: 'choice', values: (v) => [Number(v.start) + 2 * Number(v.step)] },
      e: { kind: 'choice', values: (v) => [Number(v.start) + 4 * Number(v.step)] },
    },
    answer: (v) => Number(v.start) + 3 * Number(v.step),
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ answer }) => nearMisses(Number(answer), 1, 100),
    explanation: ({ vars, answer }) => `${vars.c} + ${vars.step} = ${answer}.`,
  }),

  // Q20: ცხრილში თითოეული შემდეგი რიცხვი წინა რიცხვზე 10-ით ნაკლებია: 95, 85, __, 65, 55.
  defineTemplate({
    ...addr({ id: 'g3-u02-20', subtopicId: 'u02-counting-tables', difficulty: 1 }),
    prompt: 'ცხრილში თითოეული შემდეგი რიცხვი წინა რიცხვზე {step}-ით ნაკლებია:\n\n{a}, {b}, __, {d}, {e}',
    variables: {
      start: { kind: 'choice', values: [95, 92, 88, 85, 82, 78, 75] },
      step: { kind: 'choice', values: [5, 10] },
      a: { kind: 'choice', values: (v) => [Number(v.start)] },
      b: { kind: 'choice', values: (v) => [Number(v.start) - Number(v.step)] },
      d: { kind: 'choice', values: (v) => [Number(v.start) - 3 * Number(v.step)] },
      e: { kind: 'choice', values: (v) => [Number(v.start) - 4 * Number(v.step)] },
    },
    answer: (v) => Number(v.start) - 2 * Number(v.step),
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ answer }) => nearMisses(Number(answer), 1, 100),
    explanation: ({ vars, answer }) => `${vars.b} − ${vars.step} = ${answer}.`,
  }),

  // Q21: ცხრილში მოცემულია: 4, 8, 12, 16, __.
  defineTemplate({
    ...addr({ id: 'g3-u02-21', subtopicId: 'u02-counting-tables', difficulty: 2 }),
    prompt: 'ცხრილში მოცემულია მიმდევრობა:\n\n{a}, {b}, {c}, {d}, __\n\nრა რიცხვია გამოტოვებული? {variant}',
    variables: {
      step: { kind: 'choice', values: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
      variant: { kind: 'choice', values: ['აირჩიე სწორი პასუხი.', 'მონიშნე სწორი ვარიანტი.'] },
      a: { kind: 'choice', values: (v) => [Number(v.step)] },
      b: { kind: 'choice', values: (v) => [2 * Number(v.step)] },
      c: { kind: 'choice', values: (v) => [3 * Number(v.step)] },
      d: { kind: 'choice', values: (v) => [4 * Number(v.step)] },
    },
    answer: (v) => 5 * Number(v.step),
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ answer }) => nearMisses(Number(answer), 1, 100),
    explanation: ({ vars, answer }) => `${vars.d} + ${vars.step} = ${answer}.`,
  }),

  // Q22: ცხრილში მოცემულია: პირველი | მეორე
  defineTemplate({
    ...addr({ id: 'g3-u02-22', subtopicId: 'u02-counting-tables', difficulty: 2 }),
    prompt:
      'ცხრილში მოცემულია:\n\n' +
      'პირველი რიცხვი | მეორე რიცხვი\n' +
      '{r1a} | {r1b}\n' +
      '{r2a} | {r2b}\n' +
      '{r3a} | __\n\n' +
      'რა რიცხვი უნდა ჩაიწეროს გამოტოვებულ ადგილას?',
    variables: {
      diff: { kind: 'choice', values: [4, 5, 6, 7, 8] },
      start: { kind: 'int', min: 10, max: 25 },
      r1a: { kind: 'choice', values: (v) => [Number(v.start)] },
      r1b: { kind: 'choice', values: (v) => [Number(v.start) + Number(v.diff)] },
      r2a: { kind: 'choice', values: (v) => [Number(v.start) + 10] },
      r2b: { kind: 'choice', values: (v) => [Number(v.start) + 10 + Number(v.diff)] },
      r3a: { kind: 'choice', values: (v) => [Number(v.start) + 20] },
    },
    answer: (v) => Number(v.r3a) + Number(v.diff),
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ answer }) => nearMisses(Number(answer), 1, 100),
    explanation: ({ vars, answer }) => `წესია +${vars.diff}: ${vars.r3a} + ${vars.diff} = ${answer}.`,
  }),

  // Q23: თითოეულ რიგში რიცხვები 2-ით იზრდება: 23, 25, 27; 43, 45, 47; 63, __, 67.
  defineTemplate({
    ...addr({ id: 'g3-u02-23', subtopicId: 'u02-counting-tables', difficulty: 3 }),
    prompt:
      'თითოეულ რიგში რიცხვები {step}-ით იზრდება:\n\n' +
      '{r1a}, {r1b}, {r1c}\n' +
      '{r2a}, {r2b}, {r2c}\n' +
      '{r3a}, __, {r3c}\n\n' +
      'რა რიცხვია გამოტოვებული?',
    variables: {
      step: { kind: 'choice', values: [2, 3, 4] },
      base: { kind: 'int', min: 20, max: 40 },
      r1a: { kind: 'choice', values: (v) => [Number(v.base)] },
      r1b: { kind: 'choice', values: (v) => [Number(v.base) + Number(v.step)] },
      r1c: { kind: 'choice', values: (v) => [Number(v.base) + 2 * Number(v.step)] },
      r2a: { kind: 'choice', values: (v) => [Number(v.base) + 20] },
      r2b: { kind: 'choice', values: (v) => [Number(v.base) + 20 + Number(v.step)] },
      r2c: { kind: 'choice', values: (v) => [Number(v.base) + 20 + 2 * Number(v.step)] },
      r3a: { kind: 'choice', values: (v) => [Number(v.base) + 40] },
      r3c: { kind: 'choice', values: (v) => [Number(v.base) + 40 + 2 * Number(v.step)] },
    },
    answer: (v) => Number(v.r3a) + Number(v.step),
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ answer }) => nearMisses(Number(answer), 1, 100),
    explanation: ({ vars, answer }) => `${vars.r3a} + ${vars.step} = ${answer}.`,
  }),

  // Q24: ცხრილის წესი არის „დაამატე 7“.
  defineTemplate({
    ...addr({ id: 'g3-u02-24', subtopicId: 'u02-counting-tables', difficulty: 3 }),
    prompt:
      'ცხრილის წესია „დაამატე {add}“.\n\n' +
      'საწყისი რიცხვი | მიღებული რიცხვი\n' +
      '{r1} | {r1out}\n' +
      '{r2} | {r2out}\n' +
      '{r3} | __\n\n' +
      'რა რიცხვი მიიღება მესამე სტრიქონში?',
    variables: {
      add: { kind: 'choice', values: [5, 6, 7, 8, 9] },
      base: { kind: 'int', min: 10, max: 25 },
      r1: { kind: 'choice', values: (v) => [Number(v.base)] },
      r1out: { kind: 'choice', values: (v) => [Number(v.base) + Number(v.add)] },
      r2: { kind: 'choice', values: (v) => [Number(v.base) + 12] },
      r2out: { kind: 'choice', values: (v) => [Number(v.base) + 12 + Number(v.add)] },
      r3: { kind: 'choice', values: (v) => [Number(v.base) + 24] },
    },
    answer: (v) => Number(v.r3) + Number(v.add),
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ answer }) => nearMisses(Number(answer), 1, 100),
    explanation: ({ vars, answer }) => `${vars.r3} + ${vars.add} = ${answer}.`,
  }),

  // ==================================================================
  // U02.5 — რიცხვითი მიმდევრობები (u02-number-patterns)
  // ==================================================================

  // Q25: იპოვე გამოტოვებული რიცხვი: 14, 18, 22, __, 30.
  defineTemplate({
    ...addr({ id: 'g3-u02-25', subtopicId: 'u02-number-patterns', difficulty: 1 }),
    prompt: 'იპოვე გამოტოვებული რიცხვი:\n\n{a}, {b}, {c}, __, {e}',
    variables: {
      start: { kind: 'int', min: 10, max: 35 },
      step: { kind: 'choice', values: [3, 4, 5, 6] },
      a: { kind: 'choice', values: (v) => [Number(v.start)] },
      b: { kind: 'choice', values: (v) => [Number(v.start) + Number(v.step)] },
      c: { kind: 'choice', values: (v) => [Number(v.start) + 2 * Number(v.step)] },
      e: { kind: 'choice', values: (v) => [Number(v.start) + 4 * Number(v.step)] },
    },
    answer: (v) => Number(v.start) + 3 * Number(v.step),
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ answer }) => nearMisses(Number(answer), 1, 100),
    explanation: ({ vars, answer }) => `${vars.c} + ${vars.step} = ${answer}.`,
  }),

  // Q26: იპოვე გამოტოვებული რიცხვი (descending): 82, 75, 68, __, 54.
  defineTemplate({
    ...addr({ id: 'g3-u02-26', subtopicId: 'u02-number-patterns', difficulty: 1 }),
    prompt: 'იპოვე გამოტოვებული რიცხვი:\n\n{a}, {b}, {c}, __, {e}',
    variables: {
      start: { kind: 'int', min: 70, max: 95 },
      step: { kind: 'choice', values: [4, 5, 6, 7] },
      a: { kind: 'choice', values: (v) => [Number(v.start)] },
      b: { kind: 'choice', values: (v) => [Number(v.start) - Number(v.step)] },
      c: { kind: 'choice', values: (v) => [Number(v.start) - 2 * Number(v.step)] },
      e: { kind: 'choice', values: (v) => [Number(v.start) - 4 * Number(v.step)] },
    },
    answer: (v) => Number(v.start) - 3 * Number(v.step),
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ answer }) => nearMisses(Number(answer), 1, 100),
    explanation: ({ vars, answer }) => `${vars.c} − ${vars.step} = ${answer}.`,
  }),

  // Q27: იპოვე გამოტოვებული რიცხვი (geometric x2): 3, 6, 12, 24, __.
  defineTemplate({
    ...addr({ id: 'g3-u02-27', subtopicId: 'u02-number-patterns', difficulty: 2 }),
    prompt: 'იპოვე გამოტოვებული რიცხვი:\n\n{a}, {b}, {c}, {d}, __\n\n{form}',
    variables: {
      start: { kind: 'choice', values: [1, 2, 3, 4, 5, 6] },
      form: { kind: 'choice', values: ['აირჩიე სწორი პასუხი.', 'მონიშნე სწორი ვარიანტი.', 'რომელია სწორი?'] },
      a: { kind: 'choice', values: (v) => [Number(v.start)] },
      b: { kind: 'choice', values: (v) => [2 * Number(v.start)] },
      c: { kind: 'choice', values: (v) => [4 * Number(v.start)] },
      d: { kind: 'choice', values: (v) => [8 * Number(v.start)] },
    },
    answer: (v) => 16 * Number(v.start),
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ vars, answer }) => {
      const ans = Number(answer);
      const d = Number(vars.d);
      return [d + 10, d + 12, ans - 4];
    },
    explanation: ({ vars, answer }) => `თითოეული რიცხვი ორმაგდება: ${vars.d} × 2 = ${answer}.`,
  }),

  // Q28: იპოვე გამოტოვებული რიცხვი: 90, 80, 70, __, 50.
  defineTemplate({
    ...addr({ id: 'g3-u02-28', subtopicId: 'u02-number-patterns', difficulty: 2 }),
    prompt: 'იპოვე გამოტოვებული რიცხვი:\n\n{a}, {b}, {c}, __, {e}\n\n{variant}',
    variables: {
      start: { kind: 'int', min: 60, max: 95 },
      step: { kind: 'choice', values: [5, 10] },
      variant: { kind: 'choice', values: ['აირჩიე სწორი პასუხი.', 'მონიშნე სწორი ვარიანტი.'] },
      a: { kind: 'choice', values: (v) => [Number(v.start)] },
      b: { kind: 'choice', values: (v) => [Number(v.start) - Number(v.step)] },
      c: { kind: 'choice', values: (v) => [Number(v.start) - 2 * Number(v.step)] },
      e: { kind: 'choice', values: (v) => [Number(v.start) - 4 * Number(v.step)] },
    },
    answer: (v) => Number(v.start) - 3 * Number(v.step),
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ answer }) => nearMisses(Number(answer), 1, 100),
    explanation: ({ vars, answer }) => `${vars.c} − ${vars.step} = ${answer}.`,
  }),

  // Q29: რომელი რიცხვი აგრძელებს მიმდევრობას? 5, 10, 20, 40, __.
  defineTemplate({
    ...addr({ id: 'g3-u02-29', subtopicId: 'u02-number-patterns', difficulty: 3 }),
    prompt: 'რომელი რიცხვი აგრძელებს მიმდევრობას?\n\n{a}, {b}, {c}, {d}, __\n\n{variant}',
    variables: {
      start: { kind: 'choice', values: [1, 2, 3, 4, 5, 6] },
      variant: { kind: 'choice', values: ['აირჩიე სწორი პასუხი.', 'მონიშნე სწორი ვარიანტი.', 'რომელია სწორი?'] },
      a: { kind: 'choice', values: (v) => [Number(v.start)] },
      b: { kind: 'choice', values: (v) => [2 * Number(v.start)] },
      c: { kind: 'choice', values: (v) => [4 * Number(v.start)] },
      d: { kind: 'choice', values: (v) => [8 * Number(v.start)] },
    },
    answer: (v) => 16 * Number(v.start),
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ vars, answer }) => {
      const ans = Number(answer);
      const d = Number(vars.d);
      return [d + 10, d + 20, ans + 10];
    },
    explanation: ({ vars, answer }) => `თითოეული წევრი წინა წევრის გაორმაგებაა: ${vars.d} × 2 = ${answer}.`,
  }),

  // Q30: იპოვე მიმდევრობის წესი: 16, 20, 24, 28, 32.
  defineTemplate({
    ...addr({ id: 'g3-u02-30', subtopicId: 'u02-number-patterns', difficulty: 3 }),
    prompt: 'იპოვე მიმდევრობის წესი:\n\n{a}, {b}, {c}, {d}, {e}',
    variables: {
      start: { kind: 'int', min: 10, max: 30 },
      step: { kind: 'choice', values: [3, 4, 5, 6] },
      a: { kind: 'choice', values: (v) => [Number(v.start)] },
      b: { kind: 'choice', values: (v) => [Number(v.start) + Number(v.step)] },
      c: { kind: 'choice', values: (v) => [Number(v.start) + 2 * Number(v.step)] },
      d: { kind: 'choice', values: (v) => [Number(v.start) + 3 * Number(v.step)] },
      e: { kind: 'choice', values: (v) => [Number(v.start) + 4 * Number(v.step)] },
    },
    answer: (v) => `ყოველ ჯერზე დაამატე ${v.step}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const st = Number(vars.step);
      return [
        `ყოველ ჯერზე დაამატე ${st + 1}`,
        `ყოველ ჯერზე გამოაკელი ${st}`,
        `ყოველ ჯერზე დაამატე ${st - 1 > 0 ? st - 1 : 2}`,
      ];
    },
    explanation: ({ answer }) => `მიმდევრობის წესია ${answer}.`,
  }),

  // ==================================================================
  // U02.6 — გადაადგილება რიცხვით ღერძზე (u02-number-line-movement)
  // ==================================================================

  // Q31: რიცხვით ღერძზე დგახარ 24-ზე. გადაადგილდი 5 ნაბიჯით მარჯვნივ. რომელ რიცხვზე აღმოჩნდები?
  defineTemplate({
    ...addr({ id: 'g3-u02-31', subtopicId: 'u02-number-line-movement', difficulty: 1 }),
    prompt: 'რიცხვით ღერძზე დგახარ {start}-ზე. გადაადგილდი {step} ნაბიჯით მარჯვნივ. რომელ რიცხვზე აღმოჩნდები?',
    variables: {
      start: { kind: 'int', min: 15, max: 70 },
      step: { kind: 'int', min: 4, max: 9 },
    },
    answer: (v) => Number(v.start) + Number(v.step),
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ answer }) => nearMisses(Number(answer), 1, 100),
    explanation: ({ vars, answer }) => `${vars.start} + ${vars.step} = ${answer}.`,
  }),

  // Q32: დგახარ 47-ზე და 8 ნაბიჯით მარცხნივ გადაადგილდები...
  defineTemplate({
    ...addr({ id: 'g3-u02-32', subtopicId: 'u02-number-line-movement', difficulty: 1 }),
    prompt: 'რიცხვით ღერძზე დგახარ {start}-ზე და {step} ნაბიჯით მარცხნივ გადაადგილდები. რომელ რიცხვზე აღმოჩნდები?',
    variables: {
      start: { kind: 'int', min: 25, max: 80 },
      step: { kind: 'int', min: 4, max: 9 },
    },
    answer: (v) => Number(v.start) - Number(v.step),
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ answer }) => nearMisses(Number(answer), 1, 100),
    explanation: ({ vars, answer }) => `${vars.start} − ${vars.step} = ${answer}.`,
  }),

  // Q33: დგახარ 35-ზე. ჯერ 6 ნაბიჯით მარჯვნივ, შემდეგ 4 ნაბიჯით მარცხნივ...
  defineTemplate({
    ...addr({ id: 'g3-u02-33', subtopicId: 'u02-number-line-movement', difficulty: 2 }),
    prompt: 'რიცხვით ღერძზე დგახარ {start}-ზე. ჯერ {s1} ნაბიჯით მარჯვნივ, შემდეგ {s2} ნაბიჯით მარცხნივ გადაადგილდი. სად აღმოჩნდები?',
    variables: {
      start: { kind: 'int', min: 20, max: 70 },
      s1: { kind: 'int', min: 5, max: 9 },
      s2: { kind: 'int', min: 2, max: 4 },
    },
    answer: (v) => Number(v.start) + Number(v.s1) - Number(v.s2),
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ answer }) => nearMisses(Number(answer), 1, 100),
    explanation: ({ vars, answer }) => `${vars.start} + ${vars.s1} − ${vars.s2} = ${answer}.`,
  }),

  // Q34: რიცხვით ღერძზე 28-დან 36-მდე რამდენი ერთეულია?
  defineTemplate({
    ...addr({ id: 'g3-u02-34', subtopicId: 'u02-number-line-movement', difficulty: 2 }),
    prompt: 'რიცხვით ღერძზე {a}-დან {b}-მდე რამდენი ერთეულია?',
    variables: {
      a: { kind: 'int', min: 15, max: 75 },
      diff: { kind: 'int', min: 5, max: 15 },
      b: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.diff)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 1, max: 50 },
    distractors: ({ answer }) => nearMisses(Number(answer), 1, 50),
    explanation: ({ vars, answer }) => `${vars.b} − ${vars.a} = ${answer} ერთეული.`,
  }),

  // Q35: დგახარ 63-ზე და 7 ნაბიჯით მარცხნივ, შემდეგ 9 ნაბიჯით მარჯვნივ...
  defineTemplate({
    ...addr({ id: 'g3-u02-35', subtopicId: 'u02-number-line-movement', difficulty: 3 }),
    prompt: 'რიცხვით ღერძზე დგახარ {start}-ზე. {s1} ნაბიჯით მარცხნივ გადაადგილდები, შემდეგ {s2} ნაბიჯით მარჯვნივ. რომელ რიცხვზე აღმოჩნდები?',
    variables: {
      start: { kind: 'int', min: 30, max: 80 },
      s1: { kind: 'int', min: 4, max: 8 },
      s2: { kind: 'int', min: 5, max: 10 },
    },
    answer: (v) => Number(v.start) - Number(v.s1) + Number(v.s2),
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ answer }) => nearMisses(Number(answer), 1, 100),
    explanation: ({ vars, answer }) => `${vars.start} − ${vars.s1} + ${vars.s2} = ${answer}.`,
  }),

  // Q36: რიცხვით ღერძზე დაიწყე უცნობი რიცხვიდან, გადადი 6 ნაბიჯით მარჯვნივ და აღმოჩნდი 52-ზე.
  defineTemplate({
    ...addr({ id: 'g3-u02-36', subtopicId: 'u02-number-line-movement', difficulty: 3 }),
    prompt: 'რიცხვით ღერძზე დაიწყე უცნობი რიცხვიდან, გადადი {step} ნაბიჯით მარჯვნივ და აღმოჩნდი {end}-ზე. რომელი რიცხვიდან დაიწყე?',
    variables: {
      start: { kind: 'int', min: 20, max: 75 },
      step: { kind: 'int', min: 4, max: 9 },
      end: { kind: 'choice', values: (v) => [Number(v.start) + Number(v.step)] },
    },
    answer: (v) => Number(v.start),
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ vars, answer }) => {
      const e = Number(vars.end);
      const st = Number(vars.step);
      const s = Number(answer);
      return [s - 1, s + 1, e + st];
    },
    explanation: ({ vars, answer }) => `${vars.end} − ${vars.step} = ${answer}.`,
  }),

  // ==================================================================
  // U02.7 — ლუწი და კენტი რიცხვების დახარისხება (u02-sorting-even-odd)
  // ==================================================================

  // Q37: დაახარისხე რიცხვები ლუწ და კენტ ჯგუფებში: 12, 17, 24, 31, 46, 59.
  defineTemplate({
    ...addr({ id: 'g3-u02-37', subtopicId: 'u02-sorting-even-odd', difficulty: 1 }),
    prompt: 'რომელია სწორად დახარისხებული ლუწ და კენტ ჯგუფებად? რიცხვებია:\n\n{e1}, {o1}, {e2}, {o2}, {e3}, {o3}',
    variables: {
      base: { kind: 'int', min: 10, max: 30 },
      e1: { kind: 'choice', values: (v) => [Number(v.base) * 2] },
      e2: { kind: 'choice', values: (v) => [Number(v.base) * 2 + 4] },
      e3: { kind: 'choice', values: (v) => [Number(v.base) * 2 + 8] },
      o1: { kind: 'choice', values: (v) => [Number(v.base) * 2 + 1] },
      o2: { kind: 'choice', values: (v) => [Number(v.base) * 2 + 5] },
      o3: { kind: 'choice', values: (v) => [Number(v.base) * 2 + 9] },
    },
    answer: (v) => `ლუწები: ${v.e1}, ${v.e2}, ${v.e3}; კენტები: ${v.o1}, ${v.o2}, ${v.o3}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => [
      `ლუწები: ${vars.e1}, ${vars.o1}, ${vars.e3}; კენტები: ${vars.e2}, ${vars.o2}, ${vars.o3}`,
      `ლუწები: ${vars.o1}, ${vars.o2}, ${vars.o3}; კენტები: ${vars.e1}, ${vars.e2}, ${vars.e3}`,
      `ლუწები: ${vars.e1}, ${vars.e2}, ${vars.o3}; კენტები: ${vars.o1}, ${vars.o2}, ${vars.e3}`,
    ],
    explanation: ({ vars }) => `ლუწი რიცხვებია ${vars.e1}, ${vars.e2}, ${vars.e3}, ხოლო კენტი რიცხვებია ${vars.o1}, ${vars.o2}, ${vars.o3}.`,
  }),

  // Q38: დაახარისხე რიცხვები: 21, 28, 33, 40, 57, 64.
  defineTemplate({
    ...addr({ id: 'g3-u02-38', subtopicId: 'u02-sorting-even-odd', difficulty: 1 }),
    prompt: 'დაახარისხე რიცხვები: {o1}, {e1}, {o2}, {e2}, {o3}, {e3}. რომელი ვარიანტია სწორი?',
    variables: {
      base: { kind: 'int', min: 12, max: 32 },
      e1: { kind: 'choice', values: (v) => [Number(v.base) * 2] },
      e2: { kind: 'choice', values: (v) => [Number(v.base) * 2 + 6] },
      e3: { kind: 'choice', values: (v) => [Number(v.base) * 2 + 12] },
      o1: { kind: 'choice', values: (v) => [Number(v.base) * 2 - 3] },
      o2: { kind: 'choice', values: (v) => [Number(v.base) * 2 + 3] },
      o3: { kind: 'choice', values: (v) => [Number(v.base) * 2 + 9] },
    },
    answer: (v) => `ლუწები: ${v.e1}, ${v.e2}, ${v.e3}; კენტები: ${v.o1}, ${v.o2}, ${v.o3}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => [
      `ლუწები: ${vars.e1}, ${vars.o2}, ${vars.e3}; კენტები: ${vars.o1}, ${vars.e2}, ${vars.o3}`,
      `ლუწები: ${vars.e1}, ${vars.e2}, ${vars.o1}; კენტები: ${vars.e3}, ${vars.o2}, ${vars.o3}`,
      `ლუწები: ${vars.o1}, ${vars.o2}, ${vars.o3}; კენტები: ${vars.e1}, ${vars.e2}, ${vars.e3}`,
    ],
    explanation: ({ vars }) => `ლუწებია ${vars.e1}, ${vars.e2}, ${vars.e3}. კენტებია ${vars.o1}, ${vars.o2}, ${vars.o3}.`,
  }),

  // Q39: გადაიტანე თითოეული რიცხვი შესაბამის ჯგუფში: 16, 25, 38, 43, 52, 71.
  defineTemplate({
    ...addr({ id: 'g3-u02-39', subtopicId: 'u02-sorting-even-odd', difficulty: 2 }),
    prompt: 'მოცემულია რიცხვები: {e1}, {o1}, {e2}, {o2}, {e3}, {o3}. რომელია კენტი რიცხვების სრული ჯგუფი?',
    variables: {
      base: { kind: 'int', min: 14, max: 34 },
      e1: { kind: 'choice', values: (v) => [Number(v.base) * 2] },
      e2: { kind: 'choice', values: (v) => [Number(v.base) * 2 + 4] },
      e3: { kind: 'choice', values: (v) => [Number(v.base) * 2 + 10] },
      o1: { kind: 'choice', values: (v) => [Number(v.base) * 2 + 1] },
      o2: { kind: 'choice', values: (v) => [Number(v.base) * 2 + 5] },
      o3: { kind: 'choice', values: (v) => [Number(v.base) * 2 + 11] },
    },
    answer: (v) => `${v.o1}, ${v.o2}, ${v.o3}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => [
      `${vars.e1}, ${vars.e2}, ${vars.e3}`,
      `${vars.o1}, ${vars.e2}, ${vars.o3}`,
      `${vars.e1}, ${vars.o2}, ${vars.o3}`,
    ],
    explanation: ({ answer }) => `კენტი რიცხვებია: ${answer}.`,
  }),

  // Q40: დაახარისხე რიცხვები ზრდადობით მოცემულ ჯგუფებში: ლუწი და კენტი.
  defineTemplate({
    ...addr({ id: 'g3-u02-40', subtopicId: 'u02-sorting-even-odd', difficulty: 2 }),
    prompt: 'დაახარისხე რიცხვები ზრდადობით მოცემულ ჯგუფებში: ლუწი და კენტი. რიცხვებია: {e2}, {o2}, {e1}, {o3}, {o1}, {e3}.',
    variables: {
      base: { kind: 'int', min: 12, max: 28 },
      e1: { kind: 'choice', values: (v) => [Number(v.base) * 2] },
      e2: { kind: 'choice', values: (v) => [Number(v.base) * 2 + 4] },
      e3: { kind: 'choice', values: (v) => [Number(v.base) * 2 + 10] },
      o1: { kind: 'choice', values: (v) => [Number(v.base) * 2 + 1] },
      o2: { kind: 'choice', values: (v) => [Number(v.base) * 2 + 5] },
      o3: { kind: 'choice', values: (v) => [Number(v.base) * 2 + 9] },
    },
    answer: (v) => `ლუწები: ${v.e1}, ${v.e2}, ${v.e3}; კენტები: ${v.o1}, ${v.o2}, ${v.o3}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => [
      `ლუწები: ${vars.e3}, ${vars.e2}, ${vars.e1}; კენტები: ${vars.o3}, ${vars.o2}, ${vars.o1}`,
      `ლუწები: ${vars.e2}, ${vars.e1}, ${vars.e3}; კენტები: ${vars.o1}, ${vars.o2}, ${vars.o3}`,
      `ლუწები: ${vars.e1}, ${vars.e2}, ${vars.e3}; კენტები: ${vars.o2}, ${vars.o1}, ${vars.o3}`,
    ],
    explanation: ({ vars }) => `ზრდადობით დალაგებული ლუწებია: ${vars.e1}, ${vars.e2}, ${vars.e3}; კენტებია: ${vars.o1}, ${vars.o2}, ${vars.o3}.`,
  }),

  // Q41: მოცემულია რიცხვები: 62, 73, 84, 95, 26, 37. რომელია ლუწი რიცხვები?
  defineTemplate({
    ...addr({ id: 'g3-u02-41', subtopicId: 'u02-sorting-even-odd', difficulty: 3 }),
    prompt: 'მოცემულია რიცხვები: {e1}, {o1}, {e2}, {o2}, {e3}, {o3}. რომელია ლუწი რიცხვები?',
    variables: {
      base: { kind: 'int', min: 15, max: 35 },
      e1: { kind: 'choice', values: (v) => [Number(v.base) * 2] },
      e2: { kind: 'choice', values: (v) => [Number(v.base) * 2 + 6] },
      e3: { kind: 'choice', values: (v) => [Number(v.base) * 2 + 12] },
      o1: { kind: 'choice', values: (v) => [Number(v.base) * 2 + 1] },
      o2: { kind: 'choice', values: (v) => [Number(v.base) * 2 + 7] },
      o3: { kind: 'choice', values: (v) => [Number(v.base) * 2 + 13] },
    },
    answer: (v) => `${v.e1}, ${v.e2}, ${v.e3}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => [
      `${vars.o1}, ${vars.o2}, ${vars.o3}`,
      `${vars.e1}, ${vars.o1}, ${vars.e2}`,
      `${vars.e2}, ${vars.o2}, ${vars.o3}`,
    ],
    explanation: ({ answer }) => `ლუწი რიცხვებია: ${answer}.`,
  }),

  // Q42: მოცემულია რიცხვები: 11, 20, 35, 48, 67, 92. რამდენი ლუწი და რამდენი კენტი რიცხვია?
  defineTemplate({
    ...addr({ id: 'g3-u02-42', subtopicId: 'u02-sorting-even-odd', difficulty: 3 }),
    prompt: 'მოცემულია რიცხვები: {n1}, {n2}, {n3}, {n4}, {n5}, {n6}. რამდენი ლუწი და რამდენი კენტი რიცხვია?',
    variables: {
      split: { kind: 'choice', values: [0, 1, 2] },
      // split 0: 3 even, 3 odd. split 1: 4 even, 2 odd. split 2: 2 even, 4 odd.
      base: { kind: 'int', min: 11, max: 30 },
      n1: { kind: 'choice', values: (v) => [Number(v.base) * 2] },
      n2: { kind: 'choice', values: (v) => [Number(v.base) * 2 + 4] },
      n3: { kind: 'choice', values: (v) => [Number(v.split) === 1 ? Number(v.base) * 2 + 6 : Number(v.base) * 2 + 1] },
      n4: { kind: 'choice', values: (v) => [Number(v.split) === 2 ? Number(v.base) * 2 + 3 : Number(v.base) * 2 + 8] },
      n5: { kind: 'choice', values: (v) => [Number(v.base) * 2 + 5] },
      n6: { kind: 'choice', values: (v) => [Number(v.base) * 2 + 7] },
      eCount: { kind: 'choice', values: (v) => [Number(v.split) === 0 ? 3 : Number(v.split) === 1 ? 4 : 2] },
      oCount: { kind: 'choice', values: (v) => [6 - (Number(v.split) === 0 ? 3 : Number(v.split) === 1 ? 4 : 2)] },
    },
    answer: (v) => `${v.eCount} ლუწი და ${v.oCount} კენტი`,
    format: { kind: 'text' },
    distractors: ({ vars }) => {
      const e = Number(vars.eCount);
      const o = Number(vars.oCount);
      return [
        `${o} ლუწი და ${e} კენტი`,
        `${e === 3 ? 4 : 3} ლუწი და ${e === 3 ? 2 : 3} კენტი`,
        `1 ლუწი და 5 კენტი`,
      ];
    },
    explanation: ({ answer }) => `მოცემულ რიცხვებში არის ${answer}.`,
  }),
];
