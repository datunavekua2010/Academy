import { defineTemplate } from './types';
import type { QuestionTemplate, Vars } from './types';

/**
 * Grade III placeholders — one template per subtopic of the academy curriculum (100 subtopics).
 *
 * ⚠️  THESE ARE PLACEHOLDERS. They exist so every one of the 100 subtopics in
 * grade III is playable and correctly wired to its unit; they are *not* the
 * academy's final questions. The real questions will replace them unit by unit.
 *
 * Every entry is **correct by construction**: the wording and the answer are
 * built from the same drawn values.
 */

const nearMisses = (answer: number, min = 0, max = 100000): number[] => {
  const wrong: number[] = [];
  for (const offset of [1, -1, 2, -2, 3, 10, -10, 5, -5, 20, -20]) {
    const candidate = answer + offset;
    if (candidate === answer || candidate < min || candidate > max || wrong.includes(candidate)) continue;
    wrong.push(candidate);
  }
  return wrong;
};

interface G3Address {
  topicId: string;
  subtopicId: string;
  hint?: string;
}

const addr = (spec: G3Address) => ({
  id: `g3-${spec.subtopicId}`,
  grade: 3 as const,
  topicId: spec.topicId,
  unitId: spec.topicId,
  subtopicId: spec.subtopicId,
  difficulty: 1 as const,
  hint: spec.hint,
});

/** Generic adder */
const add = (spec: G3Address, minA: number, maxA: number, minB: number, maxB: number, promptText?: string): QuestionTemplate =>
  defineTemplate({
    ...addr(spec),
    prompt: promptText ?? '{a} + {b} = ?',
    variables: {
      a: { kind: 'int', min: minA, max: maxA },
      b: { kind: 'int', min: minB, max: maxB },
    },
    answer: (v: Vars) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  });

/** Generic subtractor where a >= b */
const sub = (spec: G3Address, minA: number, maxA: number, minB: number, maxB: number, promptText?: string): QuestionTemplate =>
  defineTemplate({
    ...addr(spec),
    prompt: promptText ?? '{a} − {b} = ?',
    variables: {
      a: { kind: 'int', min: minA, max: maxA },
      b: { kind: 'int', min: minB, max: (v: Vars) => Math.min(maxB, Number(v.a)) },
    },
    constraints: [{ test: (v: Vars) => Number(v.a) >= Number(v.b), note: 'a >= b' }],
    answer: (v: Vars) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
  });

/** Generic multiplier */
const mul = (spec: G3Address, minA: number, maxA: number, minB: number, maxB: number, promptText?: string): QuestionTemplate =>
  defineTemplate({
    ...addr(spec),
    prompt: promptText ?? '{a} × {b} = ?',
    variables: {
      a: { kind: 'int', min: minA, max: maxA },
      b: { kind: 'int', min: minB, max: maxB },
    },
    answer: (v: Vars) => Number(v.a) * Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${answer}.`,
  });

/** Generic divider */
const div = (spec: G3Address, minB: number, maxB: number, minQ: number, maxQ: number, promptText?: string): QuestionTemplate =>
  defineTemplate({
    ...addr(spec),
    prompt: promptText ?? '{p} ÷ {b} = ?',
    variables: {
      b: { kind: 'int', min: minB, max: maxB },
      q: { kind: 'int', min: minQ, max: maxQ },
      p: { kind: 'int', min: (v: Vars) => Number(v.b) * Number(v.q), max: (v: Vars) => Number(v.b) * Number(v.q) },
    },
    answer: (v: Vars) => Number(v.q),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.p} ÷ ${vars.b} = ${answer}.`,
  });

/** Generic comparison */
export const comp = (spec: G3Address, min: number, max: number): QuestionTemplate =>
  defineTemplate({
    ...addr(spec),
    prompt: 'რომელი რიცხვია მეტი: {a} თუ {b}?',
    variables: {
      a: { kind: 'int', min, max },
      b: { kind: 'int', min, max },
    },
    constraints: [{ test: (v: Vars) => v.a !== v.b, note: 'a != b' }],
    optionCount: 2,
    answer: (v: Vars) => (Number(v.a) > Number(v.b) ? Number(v.a) : Number(v.b)),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [Math.min(Number(vars.a), Number(vars.b))],
    explanation: ({ vars, answer }) =>
      `${answer} მეტია ${Number(vars.a) === Number(answer) ? vars.b : vars.a}-ზე.`,
  });

export const GRADE3_PLACEHOLDERS: QuestionTemplate[] = [
  // ================= U01: რიცხვები 100-მდე =================
  defineTemplate({
    ...addr({ topicId: 'g3-ricxvebi100', subtopicId: 'u01-hundred-chart' }),
    prompt: 'ასეულის ცხრილში {n}-ის მომდევნო რიცხვია:',
    variables: { n: { kind: 'int', min: 11, max: 89 } },
    answer: (v) => Number(v.n) + 1,
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.n}-ის მომდევნოა ${answer}.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-ricxvebi100', subtopicId: 'u01-numbers-in-words' }),
    prompt: 'ჩაწერე ციფრებით: {t} ათეული და {u} ერთეული არის:',
    variables: {
      t: { kind: 'int', min: 2, max: 9 },
      u: { kind: 'int', min: 1, max: 9 },
    },
    answer: (v) => Number(v.t) * 10 + Number(v.u),
    format: { kind: 'integer', min: 10, max: 99 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.t} ათეული და ${vars.u} ერთეული = ${answer}.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-ricxvebi100', subtopicId: 'u01-ordinal-numbers' }),
    prompt: 'რიგში მე-{k} ადგილის შემდეგი ადგილია:',
    variables: { k: { kind: 'int', min: 1, max: 8 } },
    answer: (v) => Number(v.k) + 1,
    format: { kind: 'integer', min: 1, max: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 1, 10),
    explanation: ({ vars, answer }) => `მე-${vars.k} ადგილის შემდეგია მე-${answer}.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-ricxvebi100', subtopicId: 'u01-tens-and-ones' }),
    prompt: 'რამდენი ათეულია რიცხვში {t}{u}?',
    variables: {
      t: { kind: 'int', min: 2, max: 9 },
      u: { kind: 'int', min: 1, max: 9 },
    },
    answer: (v) => Number(v.t),
    format: { kind: 'integer', min: 1, max: 9 },
    distractors: ({ answer }) => nearMisses(Number(answer), 1, 9),
    explanation: ({ vars, answer }) => `რიცხვში ${vars.t}${vars.u} ათეულების ციფრია ${answer}.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-ricxvebi100', subtopicId: 'u01-before-and-after' }),
    prompt: 'რომელი რიცხვია {n}-ის უშუალოდ წინ?',
    variables: { n: { kind: 'int', min: 12, max: 99 } },
    answer: (v) => Number(v.n) - 1,
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.n}-ის წინა რიცხვია ${answer}.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-ricxvebi100', subtopicId: 'u01-number-line' }),
    prompt: 'რიცხვით ღერძზე {start}-დან 1 ნაბიჯით მარჯვნივ არის:',
    variables: { start: { kind: 'int', min: 10, max: 90 } },
    answer: (v) => Number(v.start) + 1,
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.start} + 1 = ${answer}.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-ricxvebi100', subtopicId: 'u01-largest-and-smallest' }),
    prompt: 'ჩამოთვლილთაგან რომელია უდიდესი: {a}, {b}, {c}?',
    variables: {
      a: { kind: 'int', min: 10, max: 80 },
      diff1: { kind: 'int', min: 3, max: 8 },
      diff2: { kind: 'int', min: 3, max: 8 },
      b: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.diff1)] },
      c: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.diff1) + Number(v.diff2)] },
    },
    answer: (v) => Number(v.c),
    format: { kind: 'integer', min: 10, max: 99 },
    distractors: ({ vars }) => [Number(vars.a), Number(vars.b), Number(vars.c) - 1],
    explanation: ({ answer }) => `მოცემულ რიცხვებს შორის უდიდესია ${answer}.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-ricxvebi100', subtopicId: 'u01-roman-numerals' }),
    prompt: 'რომაული ციფრი {roman} აღნიშნავს რიცხვს:',
    variables: {
      idx: { kind: 'choice', values: [0, 1, 2, 3, 4, 5, 6, 7] },
      roman: { kind: 'choice', values: (v) => [['I', 'IV', 'V', 'IX', 'X', 'XV', 'XX', 'L'][Number(v.idx)]] },
    },
    answer: (v) => [1, 4, 5, 9, 10, 15, 20, 50][Number(v.idx)],
    format: { kind: 'integer', min: 1, max: 50 },
    distractors: ({ answer }) => nearMisses(Number(answer), 1, 50),
    explanation: ({ vars, answer }) => `რომაული ${vars.roman} არის ${answer}.`,
  }),

  // ================= U02: თვლა და რიცხვითი მიმდევრობები =================
  defineTemplate({
    ...addr({ topicId: 'g3-tvla-mimdevrobebi', subtopicId: 'u02-even-odd' }),
    prompt: 'ჩამოთვლილთაგან რომელი რიცხვია ლუწი? {variant}',
    variables: {
      variant: { kind: 'choice', values: ['აირჩიე სწორი პასუხი.', 'მონიშნე სწორი ვარიანტი.', 'რომელია სწორი?'] },
      k: { kind: 'int', min: 20, max: 48 },
      even: { kind: 'choice', values: (v) => [Number(v.k) * 2] },
      odd1: { kind: 'choice', values: (v) => [Number(v.k) * 2 + 1] },
      odd2: { kind: 'choice', values: (v) => [Number(v.k) * 2 - 1] },
      odd3: { kind: 'choice', values: (v) => [Number(v.k) * 2 + 3] },
    },
    answer: (v) => Number(v.even),
    format: { kind: 'integer', min: 10, max: 99 },
    distractors: ({ vars }) => [Number(vars.odd1), Number(vars.odd2), Number(vars.odd3)],
    explanation: ({ answer }) => `${answer} ლუწი რიცხვია.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-tvla-mimdevrobebi', subtopicId: 'u02-counting-objects' }),
    prompt: 'სურათზე არის {rows} რიგი, თითოეულში {cols} საგანია. სულ რამდენი საგანია?',
    variables: {
      rows: { kind: 'int', min: 3, max: 8 },
      cols: { kind: 'int', min: 3, max: 8 },
    },
    answer: (v) => Number(v.rows) * Number(v.cols),
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.rows} × ${vars.cols} = ${answer}.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-tvla-mimdevrobebi', subtopicId: 'u02-skip-counting' }),
    prompt: 'გააგრძელე მიმდევრობა: {a}, {b}, {c}, __, {e}.',
    variables: {
      step: { kind: 'choice', values: [3, 4, 5, 10] },
      base: { kind: 'int', min: 2, max: 6 },
      a: { kind: 'choice', values: (v) => [Number(v.base) * Number(v.step)] },
      b: { kind: 'choice', values: (v) => [(Number(v.base) + 1) * Number(v.step)] },
      c: { kind: 'choice', values: (v) => [(Number(v.base) + 2) * Number(v.step)] },
      e: { kind: 'choice', values: (v) => [(Number(v.base) + 4) * Number(v.step)] },
    },
    answer: (v) => (Number(v.base) + 3) * Number(v.step),
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.c} + ${vars.step} = ${answer}.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-tvla-mimdevrobebi', subtopicId: 'u02-counting-tables' }),
    prompt: 'ცხრილის წესია „დაამატე {add}“. საწყისი რიცხვია {n}. რა რიცხვი მიიღება?',
    variables: {
      add: { kind: 'int', min: 3, max: 8 },
      n: { kind: 'int', min: 12, max: 60 },
    },
    answer: (v) => Number(v.n) + Number(v.add),
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.n} + ${vars.add} = ${answer}.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-tvla-mimdevrobebi', subtopicId: 'u02-number-patterns' }),
    prompt: 'იპოვე გამოტოვებული რიცხვი: {a}, {b}, {c}, __, {e}.',
    variables: {
      start: { kind: 'int', min: 10, max: 40 },
      step: { kind: 'choice', values: [3, 4, 5, 6] },
      a: { kind: 'choice', values: (v) => [Number(v.start)] },
      b: { kind: 'choice', values: (v) => [Number(v.start) + Number(v.step)] },
      c: { kind: 'choice', values: (v) => [Number(v.start) + 2 * Number(v.step)] },
      e: { kind: 'choice', values: (v) => [Number(v.start) + 4 * Number(v.step)] },
    },
    answer: (v) => Number(v.start) + 3 * Number(v.step),
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.c} + ${vars.step} = ${answer}.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-tvla-mimdevrobebi', subtopicId: 'u02-number-line-movement' }),
    prompt: 'რიცხვით ღერძზე დგახარ {start}-ზე. გადაადგილდი {step} ნაბიჯით მარჯვნივ. რომელ რიცხვზე აღმოჩნდები?',
    variables: {
      start: { kind: 'int', min: 15, max: 70 },
      step: { kind: 'int', min: 4, max: 9 },
    },
    answer: (v) => Number(v.start) + Number(v.step),
    format: { kind: 'integer', min: 1, max: 100 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.start} + ${vars.step} = ${answer}.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-tvla-mimdevrobebi', subtopicId: 'u02-sorting-even-odd' }),
    prompt: 'ჩამოთვლილთაგან რომელი რიცხვია კენტი? {variant}',
    variables: {
      variant: { kind: 'choice', values: ['აირჩიე სწორი პასუხი.', 'მონიშნე სწორი ვარიანტი.', 'რომელია სწორი?'] },
      k: { kind: 'int', min: 20, max: 120 },
      odd: { kind: 'choice', values: (v) => [Number(v.k) * 2 + 1] },
      even1: { kind: 'choice', values: (v) => [Number(v.k) * 2] },
      even2: { kind: 'choice', values: (v) => [Number(v.k) * 2 + 2] },
      even3: { kind: 'choice', values: (v) => [Number(v.k) * 2 + 4] },
    },
    answer: (v) => Number(v.odd),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [Number(vars.even1), Number(vars.even2), Number(vars.even3)],
    explanation: ({ answer }) => `${answer} კენტი რიცხვია.`,
  }),

  // ================= U03: ერთნიშნა რიცხვებზე მოქმედებები =================
  add({ topicId: 'g3-ertnishna-moqmedebebi', subtopicId: 'u03-single-digit-addition' }, 5, 9, 5, 9),
  sub({ topicId: 'g3-ertnishna-moqmedebebi', subtopicId: 'u03-single-digit-subtraction' }, 11, 18, 4, 9),

  defineTemplate({
    ...addr({ topicId: 'g3-ertnishna-moqmedebebi', subtopicId: 'u03-doubling-halving' }),
    prompt: 'გააორმაგე რიცხვი {n}.',
    variables: { n: { kind: 'int', min: 5, max: 10 } },
    answer: (v) => 2 * Number(v.n),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.n} × 2 = ${answer}.`,
  }),

  add({ topicId: 'g3-ertnishna-moqmedebebi', subtopicId: 'u03-addition-within-20' }, 5, 9, 4, 8),
  sub({ topicId: 'g3-ertnishna-moqmedebebi', subtopicId: 'u03-subtraction-within-20' }, 12, 18, 5, 9),

  defineTemplate({
    ...addr({ topicId: 'g3-ertnishna-moqmedebebi', subtopicId: 'u03-adding-subtracting-zero' }),
    prompt: 'გამოთვალე: {n} + 0 = ?',
    variables: { n: { kind: 'int', min: 4, max: 19 } },
    answer: (v) => Number(v.n),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.n} + 0 = ${answer}.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-ertnishna-moqmedebebi', subtopicId: 'u03-missing-number-equality' }),
    prompt: 'შეავსე: □ + {b} = {sum}',
    variables: {
      b: { kind: 'int', min: 4, max: 8 },
      a: { kind: 'int', min: 5, max: 9 },
      sum: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.b)] },
    },
    answer: (v) => Number(v.a),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `□ = ${vars.sum} − ${vars.b} = ${answer}.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-ertnishna-moqmedebebi', subtopicId: 'u03-true-or-false' }),
    prompt: 'სწორია თუ არა ტოლობა:\n\n{a} + {b} = {c}?',
    variables: {
      a: { kind: 'int', min: 5, max: 9 },
      b: { kind: 'int', min: 5, max: 9 },
      offset: { kind: 'choice', values: [0, 1] },
      c: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.b) + Number(v.offset)] },
    },
    optionCount: 2,
    answer: (v) => (Number(v.offset) === 0 ? 'ჭეშმარიტი' : 'მცდარი'),
    format: { kind: 'text' },
    distractors: ({ answer }) => [answer === 'ჭეშმარიტი' ? 'მცდარი' : 'ჭეშმარიტი'],
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}, ამიტომ ტოლობა არის ${answer}.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-ertnishna-moqmedebebi', subtopicId: 'u03-adding-three-numbers' }),
    prompt: 'გამოთვალე: {a} + {b} + {c} = ?',
    variables: {
      a: { kind: 'int', min: 3, max: 6 },
      b: { kind: 'int', min: 2, max: 5 },
      c: { kind: 'int', min: 4, max: 7 },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} + ${vars.c} = ${answer}.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-ertnishna-moqmedebebi', subtopicId: 'u03-adding-four-or-more' }),
    prompt: 'გამოთვალე: {a} + {b} + {c} + {d} = ?',
    variables: {
      a: { kind: 'int', min: 2, max: 5 },
      b: { kind: 'int', min: 2, max: 5 },
      c: { kind: 'int', min: 2, max: 5 },
      d: { kind: 'int', min: 2, max: 5 },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c) + Number(v.d),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} + ${vars.c} + ${vars.d} = ${answer}.`,
  }),

  // ================= U04: გამრავლება =================
  mul({ topicId: 'g3-gamravleba', subtopicId: 'u04-facts-0-to-5' }, 2, 5, 2, 5),
  mul({ topicId: 'g3-gamravleba', subtopicId: 'u04-facts-6-to-10' }, 6, 10, 6, 10),
  mul({ topicId: 'g3-gamravleba', subtopicId: 'u04-full-table' }, 2, 10, 2, 10),

  defineTemplate({
    ...addr({ topicId: 'g3-gamravleba', subtopicId: 'u04-unknown-factors' }),
    prompt: '{a} × x = {prod}. რას უდრის x?',
    variables: {
      a: { kind: 'int', min: 2, max: 9 },
      x: { kind: 'int', min: 2, max: 9 },
      prod: { kind: 'choice', values: (v) => [Number(v.a) * Number(v.x)] },
    },
    answer: (v) => Number(v.x),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `x = ${vars.prod} ÷ ${vars.a} = ${answer}.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-gamravleba', subtopicId: 'u04-round-numbers' }),
    prompt: '{a} × {b}0 = ?',
    variables: {
      a: { kind: 'int', min: 2, max: 9 },
      b: { kind: 'int', min: 1, max: 9 },
    },
    answer: (v) => Number(v.a) * Number(v.b) * 10,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b}0 = ${answer}.`,
  }),

  mul({ topicId: 'g3-gamravleba', subtopicId: 'u04-single-digit-products' }, 3, 9, 3, 9),

  defineTemplate({
    ...addr({ topicId: 'g3-gamravleba', subtopicId: 'u04-rectangular-tables' }),
    prompt: 'მართკუთხა ბადეში არის {r} რიგი და {c} სვეტი. სულ რამდენი უჯრაა?',
    variables: {
      r: { kind: 'int', min: 3, max: 9 },
      c: { kind: 'int', min: 3, max: 9 },
    },
    answer: (v) => Number(v.r) * Number(v.c),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.r} × ${vars.c} = ${answer} უჯრა.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-gamravleba', subtopicId: 'u04-addition-multiplication-relation' }),
    prompt: '{a} + {a} + {a} + {a} = ?',
    variables: { a: { kind: 'int', min: 3, max: 12 } },
    answer: (v) => 4 * Number(v.a),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `4 × ${vars.a} = ${answer}.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-gamravleba', subtopicId: 'u04-multiplying-same-number' }),
    prompt: '{a} × {a} = ?',
    variables: { a: { kind: 'int', min: 2, max: 10 } },
    answer: (v) => Number(v.a) * Number(v.a),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.a} = ${answer}.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-gamravleba', subtopicId: 'u04-tens-hundreds-multiplication' }),
    prompt: '{a} × {h}00 = ?',
    variables: {
      a: { kind: 'int', min: 2, max: 5 },
      h: { kind: 'int', min: 1, max: 4 },
    },
    answer: (v) => Number(v.a) * Number(v.h) * 100,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.h}00 = ${answer}.`,
  }),

  mul({ topicId: 'g3-gamravleba', subtopicId: 'u04-table-filling' }, 4, 8, 4, 8),

  // ================= U05: გაყოფა =================
  div({ topicId: 'g3-gayofa', subtopicId: 'u05-facts-1-to-5' }, 2, 5, 1, 5),
  div({ topicId: 'g3-gayofa', subtopicId: 'u05-facts-6-to-10' }, 6, 10, 2, 10),
  div({ topicId: 'g3-gayofa', subtopicId: 'u05-division-within-10' }, 2, 9, 2, 9),

  defineTemplate({
    ...addr({ topicId: 'g3-gayofa', subtopicId: 'u05-round-numbers' }),
    prompt: '{p}0 ÷ {b} = ?',
    variables: {
      b: { kind: 'int', min: 2, max: 6 },
      q: { kind: 'int', min: 2, max: 8 },
      p: { kind: 'choice', values: (v) => [Number(v.b) * Number(v.q)] },
    },
    answer: (v) => Number(v.q) * 10,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.p}0 ÷ ${vars.b} = ${answer}.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-gayofa', subtopicId: 'u05-unknown-dividends-divisors' }),
    prompt: 'x ÷ {b} = {quot}. რას უდრის x?',
    variables: {
      b: { kind: 'int', min: 2, max: 8 },
      quot: { kind: 'int', min: 2, max: 9 },
    },
    answer: (v) => Number(v.b) * Number(v.quot),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `x = ${vars.b} × ${vars.quot} = ${answer}.`,
  }),

  div({ topicId: 'g3-gayofa', subtopicId: 'u05-division-tables' }, 3, 7, 2, 8),

  defineTemplate({
    ...addr({ topicId: 'g3-gayofa', subtopicId: 'u05-word-problems-division' }),
    prompt: '{total} ვაშლი თანაბრად გაყვეს {b} ბავშვს. რამდენი ვაშლი შეხვდა თითოეულს?',
    variables: {
      b: { kind: 'int', min: 2, max: 6 },
      per: { kind: 'int', min: 3, max: 8 },
      total: { kind: 'choice', values: (v) => [Number(v.b) * Number(v.per)] },
    },
    answer: (v) => Number(v.per),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.total} ÷ ${vars.b} = ${answer}.`,
  }),

  // ================= U06: რაოდენობის განსაზღვრა და შედარება =================
  defineTemplate({
    ...addr({ topicId: 'g3-raodenobis-shedareba', subtopicId: 'u06-digit-ranks-place-values' }),
    prompt: 'რა ციფრი წერია ათეულების თანრიგში რიცხვში {h}{t}{u}?',
    variables: {
      h: { kind: 'int', min: 1, max: 9 },
      t: { kind: 'int', min: 0, max: 9 },
      u: { kind: 'int', min: 0, max: 9 },
    },
    answer: (v) => Number(v.t),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ answer }) => `ათეულების თანრიგში წერია ${answer}.`,
  }),

  mul({ topicId: 'g3-raodenobis-shedareba', subtopicId: 'u06-corresponding-numbers-samples' }, 3, 8, 2, 7),
  mul({ topicId: 'g3-raodenobis-shedareba', subtopicId: 'u06-multiplying-by-samples' }, 4, 9, 3, 6),

  defineTemplate({
    ...addr({ topicId: 'g3-raodenobis-shedareba', subtopicId: 'u06-comparing-sums-without-addition' }),
    prompt: 'რომელი ჯამია მეტი: {a} + {b} თუ {a} + {c}?',
    variables: {
      a: { kind: 'int', min: 100, max: 500 },
      b: { kind: 'int', min: 10, max: 80 },
      diff: { kind: 'int', min: 5, max: 30 },
      c: { kind: 'choice', values: (v) => [Number(v.b) + Number(v.diff)] },
    },
    optionCount: 2,
    answer: (v) => Number(v.a) + Number(v.c),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [Number(vars.a) + Number(vars.b)],
    explanation: ({ vars, answer }) => `რადგან ${vars.c} > ${vars.b}, ამიტომ მეტია ${answer}.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-raodenobis-shedareba', subtopicId: 'u06-equalizing-quantities' }),
    prompt: 'პირველ თაროზე დევს {a} წიგნი, მეორეზე — {b}. რამდენი წიგნი უნდა გადავიტანოთ პირველიდან მეორეზე, რომ გათანაბრდეს?',
    variables: {
      base: { kind: 'int', min: 15, max: 40 },
      trans: { kind: 'int', min: 2, max: 8 },
      a: { kind: 'choice', values: (v) => [Number(v.base) + Number(v.trans)] },
      b: { kind: 'choice', values: (v) => [Number(v.base) - Number(v.trans)] },
    },
    answer: (v) => Number(v.trans),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `სხვაობაა ${Number(vars.a) - Number(vars.b)}, ამიტომ გადასატანია ${answer}.`,
  }),

  add({ topicId: 'g3-raodenobis-shedareba', subtopicId: 'u06-object-quantity-analysis' }, 15, 60, 15, 60),

  // ================= U07: მრავალმოქმედებიანი ამოცანები და მეთოდები =================
  defineTemplate({
    ...addr({ topicId: 'g3-mravalmoqmedebiani', subtopicId: 'u07-terms-missing-steps' }),
    prompt: 'გამოთვალე: {a} + {b} × {c} = ?',
    variables: {
      a: { kind: 'int', min: 5, max: 30 },
      b: { kind: 'int', min: 2, max: 8 },
      c: { kind: 'int', min: 2, max: 6 },
    },
    answer: (v) => Number(v.a) + Number(v.b) * Number(v.c),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `ჯერ ვამრავლებთ: ${vars.b} × ${vars.c} = ${Number(vars.b) * Number(vars.c)}, შემდეგ + ${vars.a} = ${answer}.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-mravalmoqmedebiani', subtopicId: 'u07-multistep-brackets' }),
    prompt: 'გამოთვალე: ({a} + {b}) × {c} = ?',
    variables: {
      a: { kind: 'int', min: 2, max: 7 },
      b: { kind: 'int', min: 2, max: 6 },
      c: { kind: 'int', min: 2, max: 5 },
    },
    answer: (v) => (Number(v.a) + Number(v.b)) * Number(v.c),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `(${vars.a} + ${vars.b}) = ${Number(vars.a) + Number(vars.b)}, გამრავლებული ${vars.c}-ზე = ${answer}.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-mravalmoqmedebiani', subtopicId: 'u07-comparing-sums-products' }),
    prompt: '{a} × {b} + {c} = ?',
    variables: {
      a: { kind: 'int', min: 3, max: 8 },
      b: { kind: 'int', min: 2, max: 7 },
      c: { kind: 'int', min: 10, max: 40 },
    },
    answer: (v) => Number(v.a) * Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} + ${vars.c} = ${answer}.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-mravalmoqmedebiani', subtopicId: 'u07-comparing-differences-quotients' }),
    prompt: '{a} − {b} ÷ {c} = ?',
    variables: {
      c: { kind: 'int', min: 2, max: 5 },
      q: { kind: 'int', min: 2, max: 6 },
      b: { kind: 'choice', values: (v) => [Number(v.c) * Number(v.q)] },
      a: { kind: 'int', min: 20, max: 50 },
    },
    answer: (v) => Number(v.a) - Number(v.q),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} ÷ ${vars.c} = ${answer}.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-mravalmoqmedebiani', subtopicId: 'u07-scale-comparisons' }),
    prompt: '{big} რამდენჯერ მეტია {small}-ზე?',
    variables: {
      small: { kind: 'int', min: 2, max: 8 },
      times: { kind: 'int', min: 2, max: 9 },
      big: { kind: 'choice', values: (v) => [Number(v.small) * Number(v.times)] },
    },
    answer: (v) => Number(v.times),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.big} ÷ ${vars.small} = ${answer}.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-mravalmoqmedebiani', subtopicId: 'u07-distance-quantity' }),
    prompt: 'მანქანა მოძრაობს {speed} კმ/სთ სიჩქარით. რა მანძილს გაივლის {hours} საათში?',
    variables: {
      speed: { kind: 'choice', values: [40, 50, 60, 70, 80] },
      hours: { kind: 'int', min: 2, max: 5 },
    },
    answer: (v) => Number(v.speed) * Number(v.hours),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.speed} × ${vars.hours} = ${answer} კმ.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-mravalmoqmedebiani', subtopicId: 'u07-sorting-operations' }),
    prompt: 'გამოთვალე: {a} + {b} + {c} = ?',
    variables: {
      a: { kind: 'int', min: 15, max: 50 },
      b: { kind: 'int', min: 10, max: 40 },
      c: { kind: 'int', min: 5, max: 30 },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} + ${vars.c} = ${answer}.`,
  }),

  // ================= U08: განტოლებები =================
  defineTemplate({
    ...addr({ topicId: 'g3-gantolebebi', subtopicId: 'u08-unknown-addends' }),
    prompt: 'ამოხსენი განტოლება: x + {a} = {b}. რას უდრის x?',
    variables: {
      a: { kind: 'int', min: 20, max: 150 },
      x: { kind: 'int', min: 10, max: 100 },
      b: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.x)] },
    },
    answer: (v) => Number(v.x),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `x = ${vars.b} − ${vars.a} = ${answer}.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-gantolebebi', subtopicId: 'u08-unknown-minuends-subtrahends' }),
    prompt: 'ამოხსენი განტოლება: x − {a} = {b}. რას უდრის x?',
    variables: {
      a: { kind: 'int', min: 20, max: 100 },
      b: { kind: 'int', min: 10, max: 90 },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `x = ${vars.b} + ${vars.a} = ${answer}.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-gantolebebi', subtopicId: 'u08-unknown-factors' }),
    prompt: 'ამოხსენი განტოლება: x × {a} = {b}. რას უდრის x?',
    variables: {
      a: { kind: 'int', min: 2, max: 9 },
      x: { kind: 'int', min: 2, max: 9 },
      b: { kind: 'choice', values: (v) => [Number(v.a) * Number(v.x)] },
    },
    answer: (v) => Number(v.x),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `x = ${vars.b} ÷ ${vars.a} = ${answer}.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-gantolebebi', subtopicId: 'u08-unknown-dividends-divisors' }),
    prompt: 'ამოხსენი განტოლება: x ÷ {a} = {b}. რას უდრის x?',
    variables: {
      a: { kind: 'int', min: 2, max: 8 },
      b: { kind: 'int', min: 2, max: 9 },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `x = ${vars.a} × ${vars.b} = ${answer}.`,
  }),

  // ================= U09: დამრგვალება და მიახლოება =================
  defineTemplate({
    ...addr({ topicId: 'g3-damrgvaleba', subtopicId: 'u09-rounding-tens-hundreds-thousands' }),
    prompt: 'დაამრგვალე რიცხვი {n} უახლოეს ათეულამდე:',
    variables: { n: { kind: 'int', min: 21, max: 98 } },
    answer: (v) => Math.round(Number(v.n) / 10) * 10,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.n} უახლოეს ათეულამდე დამრგვალებით არის ${answer}.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-damrgvaleba', subtopicId: 'u09-word-problems-rounding' }),
    prompt: 'ნივთი ღირს {price} ლარი. უახლოეს ათეულამდე დამრგვალებით ეს თანხაა:',
    variables: { price: { kind: 'int', min: 11, max: 89 } },
    answer: (v) => Math.round(Number(v.price) / 10) * 10,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.price} დამრგვალებით არის ${answer} ლარი.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-damrgvaleba', subtopicId: 'u09-approximate-operations' }),
    prompt: 'დაამრგვალე {a} და {b} ათეულამდე და იპოვე მათი მიახლოებითი ჯამი:',
    variables: {
      a: { kind: 'int', min: 21, max: 79 },
      b: { kind: 'int', min: 11, max: 69 },
    },
    answer: (v) => Math.round(Number(v.a) / 10) * 10 + Math.round(Number(v.b) / 10) * 10,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ answer }) => `მიახლოებითი ჯამია ${answer}.`,
  }),

  // ================= U10: გაზომვა და გეომეტრია =================
  defineTemplate({
    ...addr({ topicId: 'g3-gazomva-geometria', subtopicId: 'u10-thermometers-units' }),
    prompt: 'თერმომეტრი აჩვენებდა {t}°C-ს. ტემპერატურა გაიზარდა {inc}°C-ით. რამდენი გრადუსია ახლა?',
    variables: {
      t: { kind: 'int', min: 10, max: 25 },
      inc: { kind: 'int', min: 3, max: 12 },
    },
    answer: (v) => Number(v.t) + Number(v.inc),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.t} + ${vars.inc} = ${answer}°C.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-gazomva-geometria', subtopicId: 'u10-converting-units' }),
    prompt: 'რამდენი სანტიმეტრია {m} მეტრში?',
    variables: { m: { kind: 'int', min: 2, max: 9 } },
    answer: (v) => Number(v.m) * 100,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `1 მეტრი = 100 სმ, ამიტომ ${vars.m} მ = ${answer} სმ.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-gazomva-geometria', subtopicId: 'u10-ruler-applications' }),
    prompt: 'მონაკვეთის სიგრძეა {a} სმ, მეორესი — {b} სმ. რამდენია მათი საერთო სიგრძე?',
    variables: {
      a: { kind: 'int', min: 10, max: 45 },
      b: { kind: 'int', min: 10, max: 45 },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer} სმ.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-gazomva-geometria', subtopicId: 'u10-flat-solid-shapes' }),
    prompt: 'რომელია სივრცითი გეომეტრიული სხეული? {variant}',
    variables: {
      variant: { kind: 'choice', values: ['აირჩიე სწორი პასუხი.', 'მონიშნე სწორი ვარიანტი.', 'რომელია სწორი?'] },
    },
    answer: () => 'კუბი',
    format: { kind: 'text' },
    distractors: () => ['კვადრატი', 'სამკუთხედი', 'წრე'],
    explanation: () => 'კუბი არის სივრცითი სხეული.',
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-gazomva-geometria', subtopicId: 'u10-triangle-quadrilateral-classification' }),
    prompt: 'რამდენი გვერდი აქვს ოთხკუთხედს? {variant}',
    variables: {
      variant: { kind: 'choice', values: ['აირჩიე სწორი პასუხი.', 'მონიშნე სწორი ვარიანტი.', 'რომელია სწორი?'] },
    },
    answer: () => 4,
    format: { kind: 'integer', min: 0 },
    distractors: () => [3, 5, 6],
    explanation: () => 'ოთხკუთხედს აქვს 4 გვერდი.',
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-gazomva-geometria', subtopicId: 'u10-sides-vertices-edges-faces' }),
    prompt: 'რამდენი წვერო აქვს სამკუთხედს? {variant}',
    variables: {
      variant: { kind: 'choice', values: ['აირჩიე სწორი პასუხი.', 'მონიშნე სწორი ვარიანტი.', 'რომელია სწორი?'] },
    },
    answer: () => 3,
    format: { kind: 'integer', min: 0 },
    distractors: () => [4, 5, 2],
    explanation: () => 'სამკუთხედს აქვს 3 წვერო.',
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-gazomva-geometria', subtopicId: 'u10-perimeter-calculations' }),
    prompt: 'კვადრატის გვერდის სიგრძეა {a} სმ. რას უდრის მისი პერიმეტრი?',
    variables: { a: { kind: 'int', min: 3, max: 25 } },
    answer: (v) => 4 * Number(v.a),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `P = 4 × ${vars.a} = ${answer} სმ.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-gazomva-geometria', subtopicId: 'u10-angle-classification' }),
    prompt: 'როგორი კუთხეა 90 გრადუსიანი კუთხე? {variant}',
    variables: {
      variant: { kind: 'choice', values: ['აირჩიე სწორი პასუხი.', 'მონიშნე სწორი ვარიანტი.', 'რომელია სწორი?'] },
    },
    answer: () => 'მართი',
    format: { kind: 'text' },
    distractors: () => ['მახვილი', 'ბლაგვი', 'გაშლილი'],
    explanation: () => '90 გრადუსიანი კუთხე არის მართი კუთხე.',
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-gazomva-geometria', subtopicId: 'u10-lines-segments-rays' }),
    prompt: 'ხაზს, რომელსაც აქვს დასაწყისიც და დასასრულიც, ეწოდება: {variant}',
    variables: {
      variant: { kind: 'choice', values: ['აირჩიე სწორი პასუხი.', 'მონიშნე სწორი ვარიანტი.', 'რომელია სწორი?'] },
    },
    answer: () => 'მონაკვეთი',
    format: { kind: 'text' },
    distractors: () => ['წრფე', 'სხივი', 'ტეხილი'],
    explanation: () => 'მონაკვეთს აქვს ორივე ბოლო (დასაწყისი და დასასრული).',
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-gazomva-geometria', subtopicId: 'u10-polygons-shape-filling' }),
    prompt: 'რამდენი გვერდი აქვს ხუთკუთხედს? {variant}',
    variables: {
      variant: { kind: 'choice', values: ['აირჩიე სწორი პასუხი.', 'მონიშნე სწორი ვარიანტი.', 'რომელია სწორი?'] },
    },
    answer: () => 5,
    format: { kind: 'integer', min: 0 },
    distractors: () => [4, 6, 7],
    explanation: () => 'ხუთკუთხედს აქვს 5 გვერდი.',
  }),

  // ================= U11: ფინანსური წიგნიერება და ფული =================
  defineTemplate({
    ...addr({ topicId: 'g3-fuli', subtopicId: 'u11-counting-tetri-lari' }),
    prompt: 'რამდენი თეთრია {lari} ლარში?',
    variables: { lari: { kind: 'int', min: 2, max: 9 } },
    answer: (v) => Number(v.lari) * 100,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `1 ლარი = 100 თეთრი, ამიტომ ${vars.lari} ლარი = ${answer} თეთრი.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-fuli', subtopicId: 'u11-rounding-money' }),
    prompt: 'დაამრგვალე {tetri} თეთრი უახლოეს ათეულამდე:',
    variables: { tetri: { kind: 'int', min: 11, max: 89 } },
    answer: (v) => Math.round(Number(v.tetri) / 10) * 10,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.tetri} თეთრი დამრგვალებით არის ${answer} თეთრი.`,
  }),

  add({ topicId: 'g3-fuli', subtopicId: 'u11-money-operations' }, 10, 80, 10, 80, '{a} ლარი + {b} ლარი = ?'),

  defineTemplate({
    ...addr({ topicId: 'g3-fuli', subtopicId: 'u11-sufficient-funds-shopping' }),
    prompt: 'ნივთი ღირს {price} ლარი. გაქვს {money} ლარი. რამდენი ლარი დაგრჩება ყიდვის შემდეგ?',
    variables: {
      price: { kind: 'int', min: 15, max: 45 },
      extra: { kind: 'int', min: 5, max: 25 },
      money: { kind: 'choice', values: (v) => [Number(v.price) + Number(v.extra)] },
    },
    answer: (v) => Number(v.extra),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.money} − ${vars.price} = ${answer} ლარი.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-fuli', subtopicId: 'u11-money-word-problems' }),
    prompt: 'გიორგის ჰქონდა {have} ლარი. მან იყიდა წიგნი {cost} ლარად. რამდენი ლარი დარჩა?',
    variables: {
      have: { kind: 'int', min: 30, max: 90 },
      cost: { kind: 'int', min: 10, max: 25 },
    },
    answer: (v) => Number(v.have) - Number(v.cost),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.have} − ${vars.cost} = ${answer} ლარი.`,
  }),

  // ================= U12: მონაცემები და ალბათობა =================
  defineTemplate({
    ...addr({ topicId: 'g3-monacemebi-albatoba', subtopicId: 'u12-gathering-grouping-data' }),
    prompt: 'კლასში არის {b} ბიჭი და {g} გოგო. სულ რამდენი მოსწავლეა?',
    variables: {
      b: { kind: 'int', min: 10, max: 18 },
      g: { kind: 'int', min: 10, max: 18 },
    },
    answer: (v) => Number(v.b) + Number(v.g),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.b} + ${vars.g} = ${answer} მოსწავლე.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-monacemebi-albatoba', subtopicId: 'u12-diagrams-pictograms-dotplots' }),
    prompt: 'პიქტოგრამაზე ერთი სიმბოლო აღნიშნავს {per} საგანს. რამდენი საგანია {count} სიმბოლოში?',
    variables: {
      per: { kind: 'choice', values: [2, 3, 4, 5, 10] },
      count: { kind: 'int', min: 3, max: 8 },
    },
    answer: (v) => Number(v.per) * Number(v.count),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.count} × ${vars.per} = ${answer}.`,
  }),

  add({ topicId: 'g3-monacemebi-albatoba', subtopicId: 'u12-venn-diagrams-redundant-data' }, 12, 45, 10, 35),
  sub({ topicId: 'g3-monacemebi-albatoba', subtopicId: 'u12-table-data-comparison' }, 25, 80, 10, 24),

  defineTemplate({
    ...addr({ topicId: 'g3-monacemebi-albatoba', subtopicId: 'u12-event-types' }),
    prompt: 'ხვალ მზე ამოვა აღმოსავლეთიდან. ეს ხდომილება არის: {variant}',
    variables: {
      variant: { kind: 'choice', values: ['აირჩიე სწორი პასუხი.', 'მონიშნე სწორი ვარიანტი.', 'რომელია სწორი?'] },
    },
    answer: () => 'აუცილებელი',
    format: { kind: 'text' },
    distractors: () => ['შეუძლებელი', 'შემთხვევითი', 'ნაკლებად სავარაუდო'],
    explanation: () => 'მზის აღმოსავლეთიდან ამოსვლა აუცილებელი ხდომილებაა.',
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-monacemebi-albatoba', subtopicId: 'u12-combinations-likelihood' }),
    prompt: 'ყუთში მხოლოდ წითელი ბურთებია. მწვანე ბურთის ამოღება არის: {variant}',
    variables: {
      variant: { kind: 'choice', values: ['აირჩიე სწორი პასუხი.', 'მონიშნე სწორი ვარიანტი.', 'რომელია სწორი?'] },
    },
    answer: () => 'შეუძლებელი',
    format: { kind: 'text' },
    distractors: () => ['აუცილებელი', 'შესაძლებელი', 'სავარაუდო'],
    explanation: () => 'ყუთში მწვანე ბურთი არ არის, ამიტომ მისი ამოღება შეუძლებელია.',
  }),

  // ================= U13: დრო და კალენდარი =================
  defineTemplate({
    ...addr({ topicId: 'g3-dro-kalendari', subtopicId: 'u13-time-sequences-comparisons' }),
    prompt: 'რამდენი წუთია {h} საათში?',
    variables: { h: { kind: 'int', min: 2, max: 8 } },
    answer: (v) => Number(v.h) * 60,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `1 სთ = 60 წთ, ამიტომ ${vars.h} სთ = ${answer} წთ.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-dro-kalendari', subtopicId: 'u13-time-number-lines' }),
    prompt: 'საათი აჩვენებს {h}:00-ს. რა დროს აჩვენებს ის {plus} საათის შემდეგ?',
    variables: {
      h: { kind: 'int', min: 1, max: 7 },
      plus: { kind: 'int', min: 2, max: 4 },
    },
    answer: (v) => Number(v.h) + Number(v.plus),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.h} + ${vars.plus} = ${answer}:00.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-dro-kalendari', subtopicId: 'u13-calendar-unit-relations' }),
    prompt: 'რამდენი დღეა {weeks} კვირაში?',
    variables: { weeks: { kind: 'int', min: 2, max: 8 } },
    answer: (v) => Number(v.weeks) * 7,
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `1 კვირა = 7 დღე, ამიტომ ${vars.weeks} კვირა = ${answer} დღე.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-dro-kalendari', subtopicId: 'u13-elapsed-time-problems' }),
    prompt: 'გაკვეთილი დაიწყო {h}:00-ზე და გაგრძელდა {dur} საათი. რომელ საათზე დასრულდა?',
    variables: {
      h: { kind: 'int', min: 1, max: 6 },
      dur: { kind: 'int', min: 1, max: 3 },
    },
    answer: (v) => Number(v.h) + Number(v.dur),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.h} + ${vars.dur} = ${answer}:00.`,
  }),

  // ================= U14: კანონზომიერებები და ლოგიკური მსჯელობა =================
  defineTemplate({
    ...addr({ topicId: 'g3-kanonzomiereba-logika', subtopicId: 'u14-number-sequences-triangles' }),
    prompt: 'იპოვე შემდეგი რიცხვი მიმდევრობაში: {a}, {b}, {c}, ?',
    variables: {
      step: { kind: 'choice', values: [3, 4, 5, 10] },
      start: { kind: 'int', min: 5, max: 50 },
      a: { kind: 'choice', values: (v) => [Number(v.start)] },
      b: { kind: 'choice', values: (v) => [Number(v.start) + Number(v.step)] },
      c: { kind: 'choice', values: (v) => [Number(v.start) + 2 * Number(v.step)] },
    },
    answer: (v) => Number(v.start) + 3 * Number(v.step),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `ბიჯია ${vars.step}, ამიტომ ${vars.c} + ${vars.step} = ${answer}.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-kanonzomiereba-logika', subtopicId: 'u14-illustrated-patterns' }),
    prompt: 'მიმდევრობა მეორდება: 🔴, 🔵, 🟢, 🔴, 🔵, __. რა ფიგურა მოდის შემდეგ? {variant}',
    variables: {
      variant: { kind: 'choice', values: ['აირჩიე სწორი პასუხი.', 'მონიშნე სწორი ვარიანტი.', 'რომელია სწორი?'] },
    },
    answer: () => '🟢',
    format: { kind: 'text' },
    distractors: () => ['🔴', '🔵', '🟡'],
    explanation: () => 'კანონზომიერების მიხედვით მე-3 ადგილზე მოდის 🟢.',
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-kanonzomiereba-logika', subtopicId: 'u14-thought-of-numbers-guessing' }),
    prompt: 'ჩავიფიქრე რიცხვი, მივუმატე {add} და მივიღე {sum}. რა რიცხვი ჩავიფიქრე?',
    variables: {
      x: { kind: 'int', min: 10, max: 50 },
      add: { kind: 'int', min: 5, max: 25 },
      sum: { kind: 'choice', values: (v) => [Number(v.x) + Number(v.add)] },
    },
    answer: (v) => Number(v.x),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.sum} − ${vars.add} = ${answer}.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-kanonzomiereba-logika', subtopicId: 'u14-age-problems-word-coding' }),
    prompt: 'ანა {age} წლისაა. მისი ძმა {diff} წლით უფროსია. რამდენი წლისაა ძმა?',
    variables: {
      age: { kind: 'int', min: 7, max: 12 },
      diff: { kind: 'int', min: 2, max: 6 },
    },
    answer: (v) => Number(v.age) + Number(v.diff),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.age} + ${vars.diff} = ${answer} წლის.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-kanonzomiereba-logika', subtopicId: 'u14-interval-problems-color-choices' }),
    prompt: 'რომელი რიცხვია {low}-ზე მეტი და {high}-ზე ნაკლები?',
    variables: {
      low: { kind: 'int', min: 20, max: 70 },
      ans: { kind: 'choice', values: (v) => [Number(v.low) + 5] },
      high: { kind: 'choice', values: (v) => [Number(v.low) + 10] },
    },
    answer: (v) => Number(v.ans),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [Number(vars.low) - 2, Number(vars.high) + 2, Number(vars.high) + 5],
    explanation: ({ vars, answer }) => `${vars.low} < ${answer} < ${vars.high}.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-kanonzomiereba-logika', subtopicId: 'u14-elimination-logic-grids' }),
    prompt: 'ჩამოთვლილთაგან რომელი რიცხვია კენტი (ზედმეტია ლუწებს შორის)? {variant}',
    variables: {
      variant: { kind: 'choice', values: ['აირჩიე სწორი პასუხი.', 'მონიშნე სწორი ვარიანტი.', 'რომელია სწორი?'] },
      k: { kind: 'int', min: 10, max: 40 },
      odd: { kind: 'choice', values: (v) => [Number(v.k) * 2 + 1] },
      even1: { kind: 'choice', values: (v) => [Number(v.k) * 2] },
      even2: { kind: 'choice', values: (v) => [Number(v.k) * 2 + 2] },
      even3: { kind: 'choice', values: (v) => [Number(v.k) * 2 + 4] },
    },
    answer: (v) => Number(v.odd),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [Number(vars.even1), Number(vars.even2), Number(vars.even3)],
    explanation: ({ answer }) => `${answer} კენტია, დანარჩენები ლუწია.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-kanonzomiereba-logika', subtopicId: 'u14-balance-scale-reasoning' }),
    prompt: 'სასწორის მარცხენა მხარეს დევს {a} კგ, მარჯვენაზე — {b} კგ. რომელი მხარეა უფრო მძიმე?',
    variables: {
      diff: { kind: 'int', min: 2, max: 10 },
      b: { kind: 'int', min: 10, max: 40 },
      a: { kind: 'choice', values: (v) => [Number(v.b) + Number(v.diff)] },
    },
    optionCount: 2,
    answer: () => 'მარცხენა',
    format: { kind: 'text' },
    distractors: () => ['მარჯვენა'],
    explanation: ({ vars }) => `რადგან ${vars.a} > ${vars.b}, მარცხენა მხარე უფრო მძიმეა.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-kanonzomiereba-logika', subtopicId: 'u14-condition-matching-elimination' }),
    prompt: 'რიცხვი არის ლუწი და მოთავსებულია {low}-სა და {high}-ს შორის. რომელია ეს რიცხვი?',
    variables: {
      k: { kind: 'int', min: 15, max: 45 },
      even: { kind: 'choice', values: (v) => [Number(v.k) * 2] },
      low: { kind: 'choice', values: (v) => [Number(v.k) * 2 - 3] },
      high: { kind: 'choice', values: (v) => [Number(v.k) * 2 + 3] },
      odd1: { kind: 'choice', values: (v) => [Number(v.k) * 2 - 1] },
      odd2: { kind: 'choice', values: (v) => [Number(v.k) * 2 + 1] },
      outOfRange: { kind: 'choice', values: (v) => [Number(v.k) * 2 + 6] },
    },
    answer: (v) => Number(v.even),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [Number(vars.odd1), Number(vars.odd2), Number(vars.outOfRange)],
    explanation: ({ answer }) => `${answer} ლუწია და მოთავსებულია მითითებულ შუალედში.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-kanonzomiereba-logika', subtopicId: 'u14-sorting-largest-smallest' }),
    prompt: 'ჩამოთვლილთაგან რომელია უმცირესი: {a}, {b}, {c}?',
    variables: {
      a: { kind: 'int', min: 50, max: 300 },
      diff1: { kind: 'int', min: 10, max: 40 },
      diff2: { kind: 'int', min: 10, max: 40 },
      b: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.diff1)] },
      c: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.diff1) + Number(v.diff2)] },
    },
    answer: (v) => Number(v.a),
    format: { kind: 'integer', min: 0 },
    distractors: ({ vars }) => [Number(vars.b), Number(vars.c), Number(vars.c) + 10],
    explanation: ({ answer }) => `უმცირესია ${answer}.`,
  }),

  // ================= U15: წილადების შესავალი =================
  defineTemplate({
    ...addr({ topicId: 'g3-wiladebi-shesavali', subtopicId: 'u15-parts-of-a-whole' }),
    prompt: 'ფიგურა გაყოფილია {n} ტოლ ნაწილად. ერთი ნაწილი ჩაიწერება როგორც: {variant}',
    variables: {
      variant: { kind: 'choice', values: ['აირჩიე სწორი პასუხი.', 'მონიშნე სწორი ვარიანტი.', 'რომელია სწორი?'] },
      n: { kind: 'choice', values: [2, 3, 4, 5, 6, 8] },
    },
    answer: (v) => `1/${v.n}`,
    format: { kind: 'text' },
    distractors: ({ vars }) => [`${vars.n}/1`, `1/${Number(vars.n) + 1}`, `2/${vars.n}`],
    explanation: ({ vars, answer }) => `${vars.n} ტოლი ნაწილიდან ერთი არის ${answer}.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-wiladebi-shesavali', subtopicId: 'u15-equal-parts-halves' }),
    prompt: 'რამდენია {n}-ის ნახევარი?',
    variables: {
      k: { kind: 'int', min: 4, max: 50 },
      n: { kind: 'choice', values: (v) => [Number(v.k) * 2] },
    },
    answer: (v) => Number(v.k),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.n} ÷ 2 = ${answer}.`,
  }),

  defineTemplate({
    ...addr({ topicId: 'g3-wiladebi-shesavali', subtopicId: 'u15-thirds-and-quarters' }),
    prompt: 'რამდენია {n}-ის მესამედი?',
    variables: {
      k: { kind: 'int', min: 3, max: 30 },
      n: { kind: 'choice', values: (v) => [Number(v.k) * 3] },
    },
    answer: (v) => Number(v.k),
    format: { kind: 'integer', min: 0 },
    distractors: ({ answer }) => nearMisses(Number(answer)),
    explanation: ({ vars, answer }) => `${vars.n} ÷ 3 = ${answer}.`,
  }),
];

/** One entry per template, used by catalog tests. */
export const GRADE3_PLACEHOLDER_SPECS = GRADE3_PLACEHOLDERS.map((template) => ({
  id: template.id,
  topicId: template.topicId,
  subtopicId: template.subtopicId,
  prompt: template.prompt,
  kind: 'placeholder' as const,
}));
