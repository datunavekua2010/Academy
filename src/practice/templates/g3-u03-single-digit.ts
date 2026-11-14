import { defineTemplate } from './types';
import type { QuestionTemplate } from './types';

const grade = 3 as const;
const topicId = 'g3-ertnishna-moqmedebebi' as const;
const unitId = 'g3-ertnishna-moqmedebebi' as const;

export const G3_U03_SUBTOPICS = [
  'u03-single-digit-addition',
  'u03-single-digit-subtraction',
  'u03-doubling-halving',
  'u03-addition-within-20',
  'u03-subtraction-within-20',
  'u03-adding-subtracting-zero',
  'u03-missing-number-equality',
  'u03-true-or-false',
  'u03-adding-three-numbers',
  'u03-adding-four-or-more',
] as const;

export type G3U03SubtopicId = (typeof G3_U03_SUBTOPICS)[number];

const addr = (spec: { id: string; subtopicId: G3U03SubtopicId; difficulty: 1 | 2 | 3 }) => ({
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

export const G3_U03_TEMPLATES: QuestionTemplate[] = [
  // ==================================================================
  // U03.1 — გამეორება: ერთნიშნა რიცხვების შეკრება (u03-single-digit-addition)
  // ==================================================================

  // Q01: გამოთვალე: (6+7)
  defineTemplate({
    ...addr({ id: 'g3-u03-01', subtopicId: 'u03-single-digit-addition', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} + {b} = ?',
    variables: {
      a: { kind: 'int', min: 5, max: 9 },
      b: { kind: 'int', min: 5, max: 9 },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 10, max: 20 },
    distractors: ({ answer }) => nearMisses(Number(answer), 10, 20),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // Q02: გამოთვალე: (8+5)
  defineTemplate({
    ...addr({ id: 'g3-u03-02', subtopicId: 'u03-single-digit-addition', difficulty: 1 }),
    prompt: 'გამოთვალე ჯამი: {a} + {b}',
    variables: {
      a: { kind: 'choice', values: [7, 8, 9] },
      b: { kind: 'int', min: 4, max: 8 },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 10, max: 20 },
    distractors: ({ answer }) => nearMisses(Number(answer), 10, 20),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // Q03: გამოთვალე: (9+6)
  defineTemplate({
    ...addr({ id: 'g3-u03-03', subtopicId: 'u03-single-digit-addition', difficulty: 2 }),
    prompt: 'რას უდრის {a} + {b}?',
    variables: {
      a: { kind: 'choice', values: [8, 9] },
      b: { kind: 'int', min: 3, max: 9 },
      variant: { kind: 'choice', values: ['იპოვე მნიშვნელობა.', 'გამოთვალე ჯამი.'] },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 10, max: 20 },
    distractors: ({ answer }) => nearMisses(Number(answer), 10, 20),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // Q04: გამოთვალე: (4+8)
  defineTemplate({
    ...addr({ id: 'g3-u03-04', subtopicId: 'u03-single-digit-addition', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} + {b}',
    variables: {
      a: { kind: 'int', min: 3, max: 6 },
      b: { kind: 'int', min: 7, max: 9 },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 10, max: 20 },
    distractors: ({ answer }) => nearMisses(Number(answer), 10, 20),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // Q05: გამოთვალე: (7+7) (ტოლფასი შესაკრებების შეკრება)
  defineTemplate({
    ...addr({ id: 'g3-u03-05', subtopicId: 'u03-single-digit-addition', difficulty: 3 }),
    prompt: 'გამოთვალე ორი ერთნაირი რიცხვის ჯამი:\n\n{n} + {n} = ?\n\n{variant}',
    variables: {
      n: { kind: 'int', min: 4, max: 9 },
      variant: { kind: 'choice', values: ['აირჩიე სწორი პასუხი.', 'მონიშნე სწორი მნიშვნელობა.', 'რას უდრის ჯამი?'] },
    },
    answer: (v) => 2 * Number(v.n),
    format: { kind: 'integer', min: 8, max: 20 },
    distractors: ({ answer }) => nearMisses(Number(answer), 8, 20),
    explanation: ({ vars, answer }) => `${vars.n} + ${vars.n} = ${answer}.`,
  }),

  // Q06: გამოთვალე: (9+8) (უდიდესი ერთნიშნა რიცხვების შეკრება)
  defineTemplate({
    ...addr({ id: 'g3-u03-06', subtopicId: 'u03-single-digit-addition', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} + {b} = ? {variant}',
    variables: {
      a: { kind: 'choice', values: [8, 9] },
      b: { kind: 'choice', values: [7, 8, 9] },
      variant: { kind: 'choice', values: ['ჩაწერე პასუხი.', 'იპოვე ჯამი.'] },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 14, max: 20 },
    distractors: ({ answer }) => nearMisses(Number(answer), 14, 20),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // ==================================================================
  // U03.2 — გამეორება: ერთნიშნა რიცხვების გამოკლება (u03-single-digit-subtraction)
  // ==================================================================

  // Q07: გამოთვალე: (14-6)
  defineTemplate({
    ...addr({ id: 'g3-u03-07', subtopicId: 'u03-single-digit-subtraction', difficulty: 1 }),
    prompt: 'გამოთვალე: {total} − {sub} = ?',
    variables: {
      sub: { kind: 'int', min: 5, max: 9 },
      diff: { kind: 'int', min: 5, max: 9 },
      total: { kind: 'choice', values: (v) => [Number(v.sub) + Number(v.diff)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 1, max: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 1, 10),
    explanation: ({ vars, answer }) => `${vars.total} − ${vars.sub} = ${answer}.`,
  }),

  // Q08: გამოთვალე: (17-9)
  defineTemplate({
    ...addr({ id: 'g3-u03-08', subtopicId: 'u03-single-digit-subtraction', difficulty: 1 }),
    prompt: 'გამოთვალე სხვაობა: {total} − {sub} = ? {variant}',
    variables: {
      sub: { kind: 'choice', values: [7, 8, 9] },
      diff: { kind: 'int', min: 5, max: 9 },
      variant: { kind: 'choice', values: ['ჩაწერე პასუხი.', 'იპოვე სხვაობა.'] },
      total: { kind: 'choice', values: (v) => [Number(v.sub) + Number(v.diff)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 1, max: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 1, 10),
    explanation: ({ vars, answer }) => `${vars.total} − ${vars.sub} = ${answer}.`,
  }),

  // Q09: გამოთვალე: (13-5)
  defineTemplate({
    ...addr({ id: 'g3-u03-09', subtopicId: 'u03-single-digit-subtraction', difficulty: 2 }),
    prompt: 'რას უდრის {total} − {sub}?',
    variables: {
      total: { kind: 'int', min: 11, max: 15 },
      sub: { kind: 'int', min: 4, max: 8 },
    },
    constraints: [{ test: (v) => Number(v.total) - Number(v.sub) <= 9 && Number(v.total) - Number(v.sub) >= 3, note: 'valid difference' }],
    answer: (v) => Number(v.total) - Number(v.sub),
    format: { kind: 'integer', min: 1, max: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 1, 10),
    explanation: ({ vars, answer }) => `${vars.total} − ${vars.sub} = ${answer}.`,
  }),

  // Q10: გამოთვალე: (16-7)
  defineTemplate({
    ...addr({ id: 'g3-u03-10', subtopicId: 'u03-single-digit-subtraction', difficulty: 2 }),
    prompt: 'გამოთვალე: {total} − {sub}',
    variables: {
      total: { kind: 'int', min: 14, max: 17 },
      sub: { kind: 'int', min: 6, max: 9 },
    },
    constraints: [{ test: (v) => Number(v.total) - Number(v.sub) <= 9 && Number(v.total) - Number(v.sub) >= 4, note: 'valid difference' }],
    answer: (v) => Number(v.total) - Number(v.sub),
    format: { kind: 'integer', min: 1, max: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 1, 10),
    explanation: ({ vars, answer }) => `${vars.total} − ${vars.sub} = ${answer}.`,
  }),

  // Q11: გამოთვალე: (12-4)
  defineTemplate({
    ...addr({ id: 'g3-u03-11', subtopicId: 'u03-single-digit-subtraction', difficulty: 3 }),
    prompt: 'იპოვე სხვაობა: {total} − {sub} = ? {variant}',
    variables: {
      total: { kind: 'choice', values: [11, 12, 13] },
      sub: { kind: 'int', min: 3, max: 6 },
      variant: { kind: 'choice', values: ['ჩაწერე პასუხი.', 'მონიშნე სწორი რიცხვი.'] },
    },
    constraints: [{ test: (v) => Number(v.total) - Number(v.sub) <= 9 && Number(v.total) - Number(v.sub) >= 5, note: 'valid difference' }],
    answer: (v) => Number(v.total) - Number(v.sub),
    format: { kind: 'integer', min: 1, max: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 1, 10),
    explanation: ({ vars, answer }) => `${vars.total} − ${vars.sub} = ${answer}.`,
  }),

  // Q12: გამოთვალე: (18-9) (უდიდესი ერთნიშნა სხვაობა)
  defineTemplate({
    ...addr({ id: 'g3-u03-12', subtopicId: 'u03-single-digit-subtraction', difficulty: 3 }),
    prompt: 'გამოთვალე სხვაობა: {total} − {sub} = ? {variant}',
    variables: {
      diff: { kind: 'int', min: 6, max: 9 },
      sub: { kind: 'choice', values: [8, 9] },
      variant: { kind: 'choice', values: ['აირჩიე სწორი პასუხი.', 'ჩაწერე მნიშვნელობა.'] },
      total: { kind: 'choice', values: (v) => [Number(v.sub) + Number(v.diff)] },
    },
    answer: (v) => Number(v.diff),
    format: { kind: 'integer', min: 1, max: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 1, 10),
    explanation: ({ vars, answer }) => `${vars.total} − ${vars.sub} = ${answer}.`,
  }),

  // ==================================================================
  // U03.3 — გაორმაგება და განახევრება (u03-doubling-halving)
  // ==================================================================

  // Q13: გააორმაგე რიცხვი 7.
  defineTemplate({
    ...addr({ id: 'g3-u03-13', subtopicId: 'u03-doubling-halving', difficulty: 1 }),
    prompt: 'გააორმაგე რიცხვი {n}. {variant}',
    variables: {
      n: { kind: 'int', min: 4, max: 10 },
      variant: { kind: 'choice', values: ['რას მივიღებთ?', 'რა რიცხვი მიიღება?', 'გამოთვალე.'] },
    },
    answer: (v) => 2 * Number(v.n),
    format: { kind: 'integer', min: 8, max: 20 },
    distractors: ({ answer }) => nearMisses(Number(answer), 8, 20),
    explanation: ({ vars, answer }) => `${vars.n}-ის გაორმაგებაა: ${vars.n} × 2 = ${answer}.`,
  }),

  // Q14: გააორმაგე რიცხვი 9.
  defineTemplate({
    ...addr({ id: 'g3-u03-14', subtopicId: 'u03-doubling-halving', difficulty: 1 }),
    prompt: 'რა რიცხვი მიიღება {n}-ის გაორმაგებით? {form}',
    variables: {
      n: { kind: 'int', min: 5, max: 10 },
      form: { kind: 'choice', values: ['გამოთვალე.', 'იპოვე მნიშვნელობა.', 'ჩაწერე პასუხი.'] },
    },
    answer: (v) => 2 * Number(v.n),
    format: { kind: 'integer', min: 10, max: 20 },
    distractors: ({ answer }) => nearMisses(Number(answer), 10, 20),
    explanation: ({ vars, answer }) => `${vars.n}-ის გაორმაგებაა ${vars.n} + ${vars.n} = ${answer}.`,
  }),

  // Q15: გაანახევრე რიცხვი 16.
  defineTemplate({
    ...addr({ id: 'g3-u03-15', subtopicId: 'u03-doubling-halving', difficulty: 2 }),
    prompt: 'გაანახევრე რიცხვი {n}. {variant}',
    variables: {
      half: { kind: 'int', min: 4, max: 10 },
      variant: { kind: 'choice', values: ['რას მივიღებთ?', 'რა რიცხვი მიიღება?', 'გამოთვალე.'] },
      n: { kind: 'choice', values: (v) => [2 * Number(v.half)] },
    },
    answer: (v) => Number(v.half),
    format: { kind: 'integer', min: 4, max: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 4, 10),
    explanation: ({ vars, answer }) => `${vars.n}-ის ნახევარია: ${vars.n} ÷ 2 = ${answer}.`,
  }),

  // Q16: გაანახევრე რიცხვი 18.
  defineTemplate({
    ...addr({ id: 'g3-u03-16', subtopicId: 'u03-doubling-halving', difficulty: 2 }),
    prompt: 'რა რიცხვი მიიღება {n}-ის განახევრებით? {form}',
    variables: {
      half: { kind: 'int', min: 5, max: 10 },
      form: { kind: 'choice', values: ['გამოთვალე.', 'იპოვე მნიშვნელობა.', 'ჩაწერე პასუხი.'] },
      n: { kind: 'choice', values: (v) => [2 * Number(v.half)] },
    },
    answer: (v) => Number(v.half),
    format: { kind: 'integer', min: 5, max: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 5, 10),
    explanation: ({ vars, answer }) => `${vars.n}-ის ნახევარია ${answer}.`,
  }),

  // Q17: რომელი რიცხვის გაორმაგებაა 14?
  defineTemplate({
    ...addr({ id: 'g3-u03-17', subtopicId: 'u03-doubling-halving', difficulty: 3 }),
    prompt: 'რომელი რიცხვის გაორმაგებაა {total}? {variant}',
    variables: {
      orig: { kind: 'int', min: 5, max: 10 },
      variant: { kind: 'choice', values: ['აირჩიე სწორი ვარიანტი.', 'მონიშნე სწორი რიცხვი.'] },
      total: { kind: 'choice', values: (v) => [2 * Number(v.orig)] },
    },
    answer: (v) => Number(v.orig),
    format: { kind: 'integer', min: 4, max: 12 },
    distractors: ({ answer }) => nearMisses(Number(answer), 4, 12),
    explanation: ({ vars, answer }) => `${answer}-ის გაორმაგებაა ${vars.total}, რადგან ${answer} × 2 = ${vars.total}.`,
  }),

  // Q18: რომელი რიცხვის ნახევარია 6?
  defineTemplate({
    ...addr({ id: 'g3-u03-18', subtopicId: 'u03-doubling-halving', difficulty: 3 }),
    prompt: 'რომელი რიცხვის ნახევარია {half}? {variant}',
    variables: {
      half: { kind: 'int', min: 5, max: 10 },
      variant: { kind: 'choice', values: ['აირჩიე სწორი ვარიანტი.', 'მონიშნე სწორი რიცხვი.'] },
    },
    answer: (v) => 2 * Number(v.half),
    format: { kind: 'integer', min: 8, max: 22 },
    distractors: ({ answer }) => nearMisses(Number(answer), 8, 22),
    explanation: ({ vars, answer }) => `${answer}-ის ნახევარია ${vars.half}, რადგან ${vars.half} × 2 = ${answer}.`,
  }),

  // ==================================================================
  // U03.4 — შეკრება 20-ის ფარგლებში სურათებითა და ცხრილებით (u03-addition-within-20)
  // ==================================================================

  // Q19: 🍎🍎🍎🍎🍎🍎🍎 + 🍎🍎🍎🍎🍎. სულ რამდენი ვაშლია?
  defineTemplate({
    ...addr({ id: 'g3-u03-19', subtopicId: 'u03-addition-within-20', difficulty: 1 }),
    prompt: '{iconA} + {iconB}\n\nსულ რამდენი {fruit}ია?',
    variables: {
      a: { kind: 'int', min: 5, max: 9 },
      b: { kind: 'int', min: 4, max: 8 },
      fruitType: { kind: 'choice', values: ['apple', 'strawberry'] },
      iconA: { kind: 'choice', values: (v) => [(v.fruitType === 'apple' ? '🍎' : '🍓').repeat(Number(v.a))] },
      iconB: { kind: 'choice', values: (v) => [(v.fruitType === 'apple' ? '🍎' : '🍓').repeat(Number(v.b))] },
      fruit: { kind: 'choice', values: (v) => [v.fruitType === 'apple' ? 'ვაშლ' : 'მარწყვ'] },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 9, max: 20 },
    distractors: ({ answer }) => nearMisses(Number(answer), 9, 20),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // Q20: 🟡🟡🟡🟡🟡🟡🟡🟡 + 🟡🟡🟡🟡. სულ რამდენი ყვითელი წრეა?
  defineTemplate({
    ...addr({ id: 'g3-u03-20', subtopicId: 'u03-addition-within-20', difficulty: 1 }),
    prompt: '{iconA} + {iconB}\n\nსულ რამდენი {color} წრეა?',
    variables: {
      a: { kind: 'int', min: 6, max: 9 },
      b: { kind: 'int', min: 4, max: 7 },
      circleType: { kind: 'choice', values: ['yellow', 'blue'] },
      iconA: { kind: 'choice', values: (v) => [(v.circleType === 'yellow' ? '🟡' : '🔵').repeat(Number(v.a))] },
      iconB: { kind: 'choice', values: (v) => [(v.circleType === 'yellow' ? '🟡' : '🔵').repeat(Number(v.b))] },
      color: { kind: 'choice', values: (v) => [v.circleType === 'yellow' ? 'ყვითელი' : 'ლურჯი'] },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 10, max: 20 },
    distractors: ({ answer }) => nearMisses(Number(answer), 10, 20),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // Q21: ცხრილში პირველი რიცხვი 8-ია, მეორე კი 7. იპოვე მათი ჯამი.
  defineTemplate({
    ...addr({ id: 'g3-u03-21', subtopicId: 'u03-addition-within-20', difficulty: 2 }),
    prompt:
      'ცხრილში პირველი რიცხვი {a}-ია, მეორე კი {b}. იპოვე მათი ჯამი:\n\n' +
      'პირველი რიცხვი | მეორე რიცხვი | ჯამი\n' +
      '{a} | {b} | ?',
    variables: {
      a: { kind: 'int', min: 6, max: 9 },
      b: { kind: 'int', min: 5, max: 9 },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 11, max: 20 },
    distractors: ({ answer }) => nearMisses(Number(answer), 11, 20),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // Q22: გამოთვალე: (9+6). აირჩიე სწორი პასუხი.
  defineTemplate({
    ...addr({ id: 'g3-u03-22', subtopicId: 'u03-addition-within-20', difficulty: 2 }),
    prompt: 'გამოთვალე: ({a} + {b}). აირჩიე სწორი პასუხი.',
    variables: {
      a: { kind: 'int', min: 7, max: 9 },
      b: { kind: 'int', min: 5, max: 8 },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 12, max: 20 },
    distractors: ({ answer }) => nearMisses(Number(answer), 12, 20),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // Q23: კალათაში 9 მსხალია, ხოლო მეორეში — 8. რამდენი მსხალია ორივე კალათაში ერთად?
  defineTemplate({
    ...addr({ id: 'g3-u03-23', subtopicId: 'u03-addition-within-20', difficulty: 3 }),
    prompt: 'კალათაში {a} {item}ია, ხოლო მეორეში — {b}. რამდენი {item}ია ორივე კალათაში ერთად?',
    variables: {
      a: { kind: 'int', min: 6, max: 9 },
      b: { kind: 'int', min: 5, max: 9 },
      item: { kind: 'choice', values: ['მსხალ', 'ვაშლ', 'ატამ'] },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 11, max: 20 },
    distractors: ({ answer }) => nearMisses(Number(answer), 11, 20),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // Q24: შეავსე ცხრილი: პირველი | მეორე | ჯამი, r1a|r1b|r1s, r2a|r2b|?
  defineTemplate({
    ...addr({ id: 'g3-u03-24', subtopicId: 'u03-addition-within-20', difficulty: 3 }),
    prompt:
      'შეავსე ცხრილი:\n\n' +
      'პირველი რიცხვი | მეორე რიცხვი | ჯამი\n' +
      '{r1a} | {r1b} | {r1s}\n' +
      '{r2a} | {r2b} | ?',
    variables: {
      r1a: { kind: 'int', min: 5, max: 8 },
      r1b: { kind: 'int', min: 6, max: 9 },
      r2a: { kind: 'int', min: 6, max: 9 },
      r2b: { kind: 'int', min: 5, max: 8 },
      r1s: { kind: 'choice', values: (v) => [Number(v.r1a) + Number(v.r1b)] },
    },
    answer: (v) => Number(v.r2a) + Number(v.r2b),
    format: { kind: 'integer', min: 11, max: 20 },
    distractors: ({ answer }) => nearMisses(Number(answer), 11, 20),
    explanation: ({ vars, answer }) => `${vars.r2a} + ${vars.r2b} = ${answer}.`,
  }),

  // ==================================================================
  // U03.5 — გამოკლება 20-ის ფარგლებში სურათებითა და ცხრილებით (u03-subtraction-within-20)
  // ==================================================================

  // Q25: 🍓🍓🍓...-დან 5 მარწყვი ავიღეთ. რამდენი დარჩა?
  defineTemplate({
    ...addr({ id: 'g3-u03-25', subtopicId: 'u03-subtraction-within-20', difficulty: 1 }),
    prompt: '{icons}-დან {sub} {item} ავიღეთ. რამდენი დარჩა?',
    variables: {
      total: { kind: 'int', min: 11, max: 15 },
      sub: { kind: 'int', min: 4, max: 8 },
      itemType: { kind: 'choice', values: ['strawberry', 'apple'] },
      icons: { kind: 'choice', values: (v) => [(v.itemType === 'strawberry' ? '🍓' : '🍎').repeat(Number(v.total))] },
      item: { kind: 'choice', values: (v) => [v.itemType === 'strawberry' ? 'მარწყვი' : 'ვაშლი'] },
    },
    answer: (v) => Number(v.total) - Number(v.sub),
    format: { kind: 'integer', min: 3, max: 11 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 11),
    explanation: ({ vars, answer }) => `${vars.total} − ${vars.sub} = ${answer}.`,
  }),

  // Q26: იყო 17 ბურთი. 8 ბურთი გავაჩუქეთ. რამდენი დარჩა?
  defineTemplate({
    ...addr({ id: 'g3-u03-26', subtopicId: 'u03-subtraction-within-20', difficulty: 1 }),
    prompt: 'იყო {total} {item}. {sub} {item} გავაჩუქეთ. რამდენი დარჩა?',
    variables: {
      total: { kind: 'int', min: 13, max: 18 },
      sub: { kind: 'int', min: 6, max: 9 },
      item: { kind: 'choice', values: ['ბურთი', 'წიგნი', 'ფანქარი'] },
    },
    answer: (v) => Number(v.total) - Number(v.sub),
    format: { kind: 'integer', min: 4, max: 12 },
    distractors: ({ answer }) => nearMisses(Number(answer), 4, 12),
    explanation: ({ vars, answer }) => `${vars.total} − ${vars.sub} = ${answer}.`,
  }),

  // Q27: გამოთვალე: (16-9)
  defineTemplate({
    ...addr({ id: 'g3-u03-27', subtopicId: 'u03-subtraction-within-20', difficulty: 2 }),
    prompt: 'გამოთვალე: ({total} − {sub}). {variant}',
    variables: {
      total: { kind: 'int', min: 14, max: 18 },
      sub: { kind: 'int', min: 7, max: 9 },
      variant: { kind: 'choice', values: ['აირჩიე სწორი პასუხი.', 'მონიშნე სწორი ვარიანტი.'] },
    },
    answer: (v) => Number(v.total) - Number(v.sub),
    format: { kind: 'integer', min: 5, max: 11 },
    distractors: ({ answer }) => nearMisses(Number(answer), 5, 11),
    explanation: ({ vars, answer }) => `${vars.total} − ${vars.sub} = ${answer}.`,
  }),

  // Q28: შეავსე ცხრილი: საწყისი რიცხვი | გამოკლებული რიცხვი | სხვაობა
  defineTemplate({
    ...addr({ id: 'g3-u03-28', subtopicId: 'u03-subtraction-within-20', difficulty: 2 }),
    prompt:
      'შეავსე ცხრილი:\n\n' +
      'საწყისი რიცხვი | გამოკლებული რიცხვი | სხვაობა\n' +
      '{total} | {sub} | ?',
    variables: {
      total: { kind: 'int', min: 12, max: 18 },
      sub: { kind: 'int', min: 5, max: 9 },
    },
    constraints: [{ test: (v) => Number(v.total) - Number(v.sub) <= 9 && Number(v.total) - Number(v.sub) >= 4, note: 'valid diff' }],
    answer: (v) => Number(v.total) - Number(v.sub),
    format: { kind: 'integer', min: 4, max: 10 },
    distractors: ({ answer }) => nearMisses(Number(answer), 4, 10),
    explanation: ({ vars, answer }) => `${vars.total} − ${vars.sub} = ${answer}.`,
  }),

  // Q29: ყუთში 18 ფანქარი იყო. 9 ფანქარი ამოიღეს. რამდენი დარჩა ყუთში?
  defineTemplate({
    ...addr({ id: 'g3-u03-29', subtopicId: 'u03-subtraction-within-20', difficulty: 3 }),
    prompt: 'ყუთში {total} {item} იყო. {sub} {item} ამოიღეს. რამდენი დარჩა ყუთში?',
    variables: {
      total: { kind: 'int', min: 14, max: 18 },
      sub: { kind: 'int', min: 6, max: 9 },
      item: { kind: 'choice', values: ['ფანქარი', 'კალამი', 'საშლელი'] },
    },
    answer: (v) => Number(v.total) - Number(v.sub),
    format: { kind: 'integer', min: 5, max: 12 },
    distractors: ({ answer }) => nearMisses(Number(answer), 5, 12),
    explanation: ({ vars, answer }) => `${vars.total} − ${vars.sub} = ${answer} ${vars.item}.`,
  }),

  // Q30: შეავსე გამოტოვებული რიცხვი: (14-\square=6)
  defineTemplate({
    ...addr({ id: 'g3-u03-30', subtopicId: 'u03-subtraction-within-20', difficulty: 3 }),
    prompt: 'შეავსე გამოტოვებული რიცხვი:\n\n{total} − □ = {diff}',
    variables: {
      total: { kind: 'int', min: 12, max: 17 },
      diff: { kind: 'int', min: 4, max: 8 },
    },
    answer: (v) => Number(v.total) - Number(v.diff),
    format: { kind: 'integer', min: 4, max: 12 },
    distractors: ({ answer }) => nearMisses(Number(answer), 4, 12),
    explanation: ({ vars, answer }) => `□ = ${vars.total} − ${vars.diff} = ${answer}.`,
  }),

  // ==================================================================
  // U03.6 — ნულის მიმატება და გამოკლება (u03-adding-subtracting-zero)
  // ==================================================================

  // Q31: გამოთვალე: (8+0)
  defineTemplate({
    ...addr({ id: 'g3-u03-31', subtopicId: 'u03-adding-subtracting-zero', difficulty: 1 }),
    prompt: 'გამოთვალე: {n} + 0 = ?',
    variables: {
      n: { kind: 'int', min: 4, max: 19 },
    },
    answer: (v) => Number(v.n),
    format: { kind: 'integer', min: 0, max: 20 },
    distractors: ({ answer }) => [0, Number(answer) + 1, Number(answer) - 1],
    explanation: ({ vars, answer }) => `ნებისმიერ რიცხვს მივუმატოთ 0, მიიღება იგივე რიცხვი: ${vars.n} + 0 = ${answer}.`,
  }),

  // Q32: გამოთვალე: (0+9)
  defineTemplate({
    ...addr({ id: 'g3-u03-32', subtopicId: 'u03-adding-subtracting-zero', difficulty: 1 }),
    prompt: 'გამოთვალე: 0 + {n} = ?',
    variables: {
      n: { kind: 'int', min: 4, max: 19 },
    },
    answer: (v) => Number(v.n),
    format: { kind: 'integer', min: 0, max: 20 },
    distractors: ({ answer }) => [0, Number(answer) + 1, Number(answer) - 1],
    explanation: ({ vars, answer }) => `0 + ${vars.n} = ${answer}.`,
  }),

  // Q33: გამოთვალე: (17-0)
  defineTemplate({
    ...addr({ id: 'g3-u03-33', subtopicId: 'u03-adding-subtracting-zero', difficulty: 2 }),
    prompt: 'გამოთვალე სხვაობა: {n} − 0 = ?',
    variables: {
      n: { kind: 'int', min: 8, max: 20 },
    },
    answer: (v) => Number(v.n),
    format: { kind: 'integer', min: 0, max: 20 },
    distractors: ({ answer }) => [0, Number(answer) + 1, Number(answer) - 1],
    explanation: ({ vars, answer }) => `რიცხვს გამოვაკლოთ 0, მიიღება იგივე რიცხვი: ${vars.n} − 0 = ${answer}.`,
  }),

  // Q34: გამოთვალე: (12-12)
  defineTemplate({
    ...addr({ id: 'g3-u03-34', subtopicId: 'u03-adding-subtracting-zero', difficulty: 2 }),
    prompt: 'გამოთვალე: {n} − {n} = ?',
    variables: {
      n: { kind: 'int', min: 5, max: 20 },
      variant: { kind: 'choice', values: ['რას მივიღებთ?', 'ჩაწერე პასუხი.'] },
    },
    answer: () => 0,
    format: { kind: 'integer', min: 0, max: 10 },
    distractors: ({ vars }) => [Number(vars.n), 1, 2],
    explanation: ({ vars }) => `რიცხვს გამოვაკლოთ თავისი თავი, მიიღება 0: ${vars.n} − ${vars.n} = 0.`,
  }),

  // Q35: შეავსე: (6+\square=6)
  defineTemplate({
    ...addr({ id: 'g3-u03-35', subtopicId: 'u03-adding-subtracting-zero', difficulty: 3 }),
    prompt: 'შეავსე გამოტოვებული რიცხვი:\n\n{n} + □ = {n}',
    variables: {
      n: { kind: 'int', min: 3, max: 19 },
      variant: { kind: 'choice', values: ['რა რიცხვი უნდა ჩაიწეროს?', 'იპოვე გამოტოვებული რიცხვი.'] },
    },
    answer: () => 0,
    format: { kind: 'integer', min: 0, max: 10 },
    distractors: ({ vars }) => [Number(vars.n), 1, 2],
    explanation: ({ vars }) => `${vars.n} + 0 = ${vars.n}, ამიტომ □ = 0.`,
  }),

  // Q36: შეავსე: (15-\square=15)
  defineTemplate({
    ...addr({ id: 'g3-u03-36', subtopicId: 'u03-adding-subtracting-zero', difficulty: 3 }),
    prompt: 'შეავსე გამოტოვებული რიცხვი:\n\n{n} − □ = {n}',
    variables: {
      n: { kind: 'int', min: 6, max: 20 },
      variant: { kind: 'choice', values: ['რა რიცხვი უნდა ჩაიწეროს?', 'იპოვე გამოტოვებული რიცხვი.'] },
    },
    answer: () => 0,
    format: { kind: 'integer', min: 0, max: 10 },
    distractors: ({ vars }) => [Number(vars.n), 1, 2],
    explanation: ({ vars }) => `${vars.n} − 0 = ${vars.n}, ამიტომ □ = 0.`,
  }),

  // ==================================================================
  // U03.7 — გამოტოვებული რიცხვი ტოლობაში (u03-missing-number-equality)
  // ==================================================================

  // Q37: შეავსე: (\square+5=13)
  defineTemplate({
    ...addr({ id: 'g3-u03-37', subtopicId: 'u03-missing-number-equality', difficulty: 1 }),
    prompt: 'შეავსე: □ + {b} = {sum}',
    variables: {
      b: { kind: 'int', min: 4, max: 8 },
      a: { kind: 'int', min: 5, max: 9 },
      sum: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.b)] },
    },
    answer: (v) => Number(v.a),
    format: { kind: 'integer', min: 2, max: 12 },
    distractors: ({ answer }) => nearMisses(Number(answer), 2, 12),
    explanation: ({ vars, answer }) => `□ = ${vars.sum} − ${vars.b} = ${answer}.`,
  }),

  // Q38: შეავსე: (7+\square=16)
  defineTemplate({
    ...addr({ id: 'g3-u03-38', subtopicId: 'u03-missing-number-equality', difficulty: 1 }),
    prompt: 'შეავსე: {a} + □ = {sum}',
    variables: {
      a: { kind: 'int', min: 5, max: 9 },
      b: { kind: 'int', min: 6, max: 9 },
      sum: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.b)] },
    },
    answer: (v) => Number(v.b),
    format: { kind: 'integer', min: 3, max: 12 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 12),
    explanation: ({ vars, answer }) => `□ = ${vars.sum} − ${vars.a} = ${answer}.`,
  }),

  // Q39: შეავსე: (\square-6=8)
  defineTemplate({
    ...addr({ id: 'g3-u03-39', subtopicId: 'u03-missing-number-equality', difficulty: 2 }),
    prompt: 'შეავსე: □ − {sub} = {diff}',
    variables: {
      sub: { kind: 'int', min: 4, max: 8 },
      diff: { kind: 'int', min: 6, max: 9 },
    },
    answer: (v) => Number(v.sub) + Number(v.diff),
    format: { kind: 'integer', min: 10, max: 20 },
    distractors: ({ answer }) => nearMisses(Number(answer), 10, 20),
    explanation: ({ vars, answer }) => `□ = ${vars.diff} + ${vars.sub} = ${answer}.`,
  }),

  // Q40: შეავსე: (18-\square=10)
  defineTemplate({
    ...addr({ id: 'g3-u03-40', subtopicId: 'u03-missing-number-equality', difficulty: 2 }),
    prompt: 'შეავსე: {total} − □ = {diff}',
    variables: {
      total: { kind: 'int', min: 14, max: 19 },
      diff: { kind: 'int', min: 7, max: 10 },
    },
    answer: (v) => Number(v.total) - Number(v.diff),
    format: { kind: 'integer', min: 4, max: 12 },
    distractors: ({ answer }) => nearMisses(Number(answer), 4, 12),
    explanation: ({ vars, answer }) => `□ = ${vars.total} − ${vars.diff} = ${answer}.`,
  }),

  // Q41: შეავსე: (6+\square=14)
  defineTemplate({
    ...addr({ id: 'g3-u03-41', subtopicId: 'u03-missing-number-equality', difficulty: 3 }),
    prompt: 'რა რიცხვი უნდა ჩაისვას უჯრაში?\n\n{a} + □ = {sum} {variant}',
    variables: {
      a: { kind: 'int', min: 4, max: 8 },
      b: { kind: 'int', min: 6, max: 9 },
      variant: { kind: 'choice', values: ['იპოვე მნიშვნელობა.', 'ჩაწერე პასუხი.'] },
      sum: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.b)] },
    },
    answer: (v) => Number(v.b),
    format: { kind: 'integer', min: 3, max: 12 },
    distractors: ({ answer }) => nearMisses(Number(answer), 3, 12),
    explanation: ({ vars, answer }) => `□ = ${vars.sum} − ${vars.a} = ${answer}.`,
  }),

  // Q42: შეავსე: (\square-9=7)
  defineTemplate({
    ...addr({ id: 'g3-u03-42', subtopicId: 'u03-missing-number-equality', difficulty: 3 }),
    prompt: 'რა რიცხვი უნდა ჩაისვას უჯრაში?\n\n□ − {sub} = {diff} {variant}',
    variables: {
      sub: { kind: 'choice', values: [7, 8, 9] },
      diff: { kind: 'int', min: 5, max: 9 },
      variant: { kind: 'choice', values: ['იპოვე უცნობი რიცხვი.', 'ჩაწერე პასუხი.'] },
    },
    answer: (v) => Number(v.sub) + Number(v.diff),
    format: { kind: 'integer', min: 11, max: 20 },
    distractors: ({ answer }) => nearMisses(Number(answer), 11, 20),
    explanation: ({ vars, answer }) => `□ = ${vars.diff} + ${vars.sub} = ${answer}.`,
  }),

  // ==================================================================
  // U03.8 — ჭეშმარიტი თუ მცდარი (u03-true-or-false)
  // ==================================================================

  // Q43: სწორია თუ არა ტოლობა: (7+8=15)?
  defineTemplate({
    ...addr({ id: 'g3-u03-43', subtopicId: 'u03-true-or-false', difficulty: 1 }),
    prompt: 'სწორია თუ არა ტოლობა:\n\n{a} + {b} = {c}?\n\n{variant}',
    variables: {
      a: { kind: 'int', min: 5, max: 9 },
      b: { kind: 'int', min: 5, max: 9 },
      offset: { kind: 'choice', values: [0, 0, 1, -1] },
      variant: { kind: 'choice', values: ['აირჩიე პასუხი:', 'მონიშნე სწორი ვარიანტი:'] },
      c: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.b) + Number(v.offset)] },
    },
    optionCount: 2,
    answer: (v) => (Number(v.offset) === 0 ? 'ჭეშმარიტი' : 'მცდარი'),
    format: { kind: 'text' },
    distractors: ({ answer }) => [answer === 'ჭეშმარიტი' ? 'მცდარი' : 'ჭეშმარიტი'],
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}, ამიტომ ტოლობა ${vars.a} + ${vars.b} = ${vars.c} არის ${answer}.`,
  }),

  // Q44: სწორია თუ არა ტოლობა: (16-7=8)?
  defineTemplate({
    ...addr({ id: 'g3-u03-44', subtopicId: 'u03-true-or-false', difficulty: 1 }),
    prompt: 'სწორია თუ არა ტოლობა:\n\n{total} − {sub} = {c}?\n\n{variant}',
    variables: {
      total: { kind: 'int', min: 13, max: 17 },
      sub: { kind: 'int', min: 6, max: 9 },
      offset: { kind: 'choice', values: [0, 1, -1, 2] },
      variant: { kind: 'choice', values: ['აირჩიე პასუხი:', 'მონიშნე სწორი ვარიანტი:'] },
      c: { kind: 'choice', values: (v) => [Number(v.total) - Number(v.sub) + Number(v.offset)] },
    },
    optionCount: 2,
    answer: (v) => (Number(v.offset) === 0 ? 'ჭეშმარიტი' : 'მცდარი'),
    format: { kind: 'text' },
    distractors: ({ answer }) => [answer === 'ჭეშმარიტი' ? 'მცდარი' : 'ჭეშმარიტი'],
    explanation: ({ vars, answer }) =>
      `${vars.total} − ${vars.sub} = ${Number(vars.total) - Number(vars.sub)}, ამიტომ ტოლობა ${vars.total} − ${vars.sub} = ${vars.c} არის ${answer}.`,
  }),

  // Q45: სწორია თუ არა ტოლობა: (9+9=18)?
  defineTemplate({
    ...addr({ id: 'g3-u03-45', subtopicId: 'u03-true-or-false', difficulty: 2 }),
    prompt: 'სწორია თუ არა ტოლობა:\n\n{n} + {n} = {c}?\n\n{variant}',
    variables: {
      n: { kind: 'int', min: 6, max: 9 },
      offset: { kind: 'choice', values: [0, 0, 1, -1] },
      variant: { kind: 'choice', values: ['აირჩიე პასუხი:', 'მონიშნე სწორი შეფასება:'] },
      c: { kind: 'choice', values: (v) => [2 * Number(v.n) + Number(v.offset)] },
    },
    optionCount: 2,
    answer: (v) => (Number(v.offset) === 0 ? 'ჭეშმარიტი' : 'მცდარი'),
    format: { kind: 'text' },
    distractors: ({ answer }) => [answer === 'ჭეშმარიტი' ? 'მცდარი' : 'ჭეშმარიტი'],
    explanation: ({ vars, answer }) =>
      `${vars.n} + ${vars.n} = ${2 * Number(vars.n)}, ამიტომ ტოლობა ${vars.n} + ${vars.n} = ${vars.c} არის ${answer}.`,
  }),

  // Q46: სწორია თუ არა ტოლობა: (14-6=9)?
  defineTemplate({
    ...addr({ id: 'g3-u03-46', subtopicId: 'u03-true-or-false', difficulty: 2 }),
    prompt: 'შეაფასე ტოლობა: ჭეშმარიტია თუ მცდარი?\n\n{total} − {sub} = {c}',
    variables: {
      total: { kind: 'int', min: 12, max: 16 },
      sub: { kind: 'int', min: 5, max: 8 },
      offset: { kind: 'choice', values: [0, 1, -1, 1] },
      c: { kind: 'choice', values: (v) => [Number(v.total) - Number(v.sub) + Number(v.offset)] },
    },
    optionCount: 2,
    answer: (v) => (Number(v.offset) === 0 ? 'ჭეშმარიტი' : 'მცდარი'),
    format: { kind: 'text' },
    distractors: ({ answer }) => [answer === 'ჭეშმარიტი' ? 'მცდარი' : 'ჭეშმარიტი'],
    explanation: ({ vars, answer }) =>
      `${vars.total} − ${vars.sub} = ${Number(vars.total) - Number(vars.sub)}, ამიტომ მოცემული ტოლობა არის ${answer}.`,
  }),

  // Q47: სწორია თუ არა ტოლობა: (8+5=5+8)?
  defineTemplate({
    ...addr({ id: 'g3-u03-47', subtopicId: 'u03-true-or-false', difficulty: 3 }),
    prompt: 'სწორია თუ არა ტოლობა:\n\n{a} + {b} = {left}?\n\n{variant}',
    variables: {
      a: { kind: 'int', min: 4, max: 9 },
      b: { kind: 'int', min: 4, max: 9 },
      isCommutative: { kind: 'choice', values: [1, 1, 0, 0] },
      variant: { kind: 'choice', values: ['აირჩიე პასუხი:', 'მონიშნე სწორი ვარიანტი:'] },
      left: { kind: 'choice', values: (v) => [Number(v.isCommutative) === 1 ? `${v.b} + ${v.a}` : `${Number(v.b) + 1} + ${v.a}`] },
    },
    constraints: [{ test: (v) => v.a !== v.b, note: 'a != b' }],
    optionCount: 2,
    answer: (v) => (Number(v.isCommutative) === 1 ? 'ჭეშმარიტი' : 'მცდარი'),
    format: { kind: 'text' },
    distractors: ({ answer }) => [answer === 'ჭეშმარიტი' ? 'მცდარი' : 'ჭეშმარიტი'],
    explanation: ({ vars, answer }) =>
      `შეკრების გადანაცვლებადობის თვისებით ${vars.a} + ${vars.b} = ${vars.b} + ${vars.a}, ამიტომ ტოლობა არის ${answer}.`,
  }),

  // Q48: სწორია თუ არა ტოლობა: (17-8=10)?
  defineTemplate({
    ...addr({ id: 'g3-u03-48', subtopicId: 'u03-true-or-false', difficulty: 3 }),
    prompt: 'სწორია თუ არა ტოლობა:\n\n{total} − {sub} = {c}?\n\n{variant}',
    variables: {
      total: { kind: 'int', min: 15, max: 18 },
      sub: { kind: 'choice', values: [7, 8, 9] },
      offset: { kind: 'choice', values: [0, 1, 2, -1] },
      variant: { kind: 'choice', values: ['აირჩიე სწორი შეფასება:', 'მონიშნე სწორი პასუხი:'] },
      c: { kind: 'choice', values: (v) => [Number(v.total) - Number(v.sub) + Number(v.offset)] },
    },
    optionCount: 2,
    answer: (v) => (Number(v.offset) === 0 ? 'ჭეშმარიტი' : 'მცდარი'),
    format: { kind: 'text' },
    distractors: ({ answer }) => [answer === 'ჭეშმარიტი' ? 'მცდარი' : 'ჭეშმარიტი'],
    explanation: ({ vars, answer }) =>
      `${vars.total} − ${vars.sub} = ${Number(vars.total) - Number(vars.sub)}, ამიტომ ტოლობა ${vars.total} − ${vars.sub} = ${vars.c} არის ${answer}.`,
  }),

  // ==================================================================
  // U03.9 — სამი ერთნიშნა რიცხვის შეკრება (u03-adding-three-numbers)
  // ==================================================================

  // Q49: გამოთვალე: (3+4+5)
  defineTemplate({
    ...addr({ id: 'g3-u03-49', subtopicId: 'u03-adding-three-numbers', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} + {b} + {c} = ?',
    variables: {
      a: { kind: 'int', min: 2, max: 5 },
      b: { kind: 'int', min: 2, max: 5 },
      c: { kind: 'int', min: 3, max: 6 },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 7, max: 18 },
    distractors: ({ answer }) => nearMisses(Number(answer), 7, 18),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} + ${vars.c} = ${answer}.`,
  }),

  // Q50: გამოთვალე: (6+2+7)
  defineTemplate({
    ...addr({ id: 'g3-u03-50', subtopicId: 'u03-adding-three-numbers', difficulty: 1 }),
    prompt: 'გამოთვალე სამი რიცხვის ჯამი:\n\n{a} + {b} + {c}',
    variables: {
      a: { kind: 'int', min: 4, max: 7 },
      b: { kind: 'int', min: 2, max: 4 },
      c: { kind: 'int', min: 5, max: 8 },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 11, max: 20 },
    distractors: ({ answer }) => nearMisses(Number(answer), 11, 20),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} + ${vars.c} = ${answer}.`,
  }),

  // Q51: გამოთვალე: (8+3+4)
  defineTemplate({
    ...addr({ id: 'g3-u03-51', subtopicId: 'u03-adding-three-numbers', difficulty: 2 }),
    prompt: 'რას უდრის {a} + {b} + {c}?',
    variables: {
      a: { kind: 'int', min: 6, max: 9 },
      b: { kind: 'int', min: 2, max: 5 },
      c: { kind: 'int', min: 3, max: 6 },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 11, max: 20 },
    distractors: ({ answer }) => nearMisses(Number(answer), 11, 20),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} + ${vars.c} = ${answer}.`,
  }),

  // Q52: გამოთვალე: (9+5+2)
  defineTemplate({
    ...addr({ id: 'g3-u03-52', subtopicId: 'u03-adding-three-numbers', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} + {b} + {c}',
    variables: {
      a: { kind: 'choice', values: [8, 9] },
      b: { kind: 'int', min: 4, max: 7 },
      c: { kind: 'int', min: 2, max: 4 },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 14, max: 20 },
    distractors: ({ answer }) => nearMisses(Number(answer), 14, 20),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} + ${vars.c} = ${answer}.`,
  }),

  // Q53: გამოთვალე: (7+6+6) (ორი ტოლი შესაკრებით)
  defineTemplate({
    ...addr({ id: 'g3-u03-53', subtopicId: 'u03-adding-three-numbers', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} + {b} + {b} = ? {variant}',
    variables: {
      a: { kind: 'int', min: 5, max: 9 },
      b: { kind: 'int', min: 4, max: 7 },
      variant: { kind: 'choice', values: ['იპოვე ჯამი.', 'ჩაწერე პასუხი.'] },
    },
    answer: (v) => Number(v.a) + 2 * Number(v.b),
    format: { kind: 'integer', min: 13, max: 23 },
    distractors: ({ answer }) => nearMisses(Number(answer), 13, 23),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} + ${vars.b} = ${answer}.`,
  }),

  // Q54: გამოთვალე: (4+8+7)
  defineTemplate({
    ...addr({ id: 'g3-u03-54', subtopicId: 'u03-adding-three-numbers', difficulty: 3 }),
    prompt: 'გამოთვალე: {a} + {b} + {c} = ? {variant}',
    variables: {
      a: { kind: 'int', min: 3, max: 6 },
      b: { kind: 'int', min: 7, max: 9 },
      c: { kind: 'int', min: 6, max: 9 },
      variant: { kind: 'choice', values: ['აირჩიე სწორი პასუხი.', 'ჩაწერე მნიშვნელობა.'] },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 16, max: 24 },
    distractors: ({ answer }) => nearMisses(Number(answer), 16, 24),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} + ${vars.c} = ${answer}.`,
  }),

  // ==================================================================
  // U03.10 — ოთხი ან მეტი ერთნიშნა რიცხვის შეკრება (u03-adding-four-or-more)
  // ==================================================================

  // Q55: გამოთვალე: (2+3+4+5)
  defineTemplate({
    ...addr({ id: 'g3-u03-55', subtopicId: 'u03-adding-four-or-more', difficulty: 1 }),
    prompt: 'გამოთვალე: {a} + {b} + {c} + {d} = ?',
    variables: {
      a: { kind: 'int', min: 1, max: 4 },
      b: { kind: 'int', min: 2, max: 5 },
      c: { kind: 'int', min: 3, max: 5 },
      d: { kind: 'int', min: 3, max: 6 },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c) + Number(v.d),
    format: { kind: 'integer', min: 9, max: 20 },
    distractors: ({ answer }) => nearMisses(Number(answer), 9, 20),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} + ${vars.c} + ${vars.d} = ${answer}.`,
  }),

  // Q56: გამოთვალე: (6+1+3+7)
  defineTemplate({
    ...addr({ id: 'g3-u03-56', subtopicId: 'u03-adding-four-or-more', difficulty: 1 }),
    prompt: 'გამოთვალე ოთხი რიცხვის ჯამი:\n\n{a} + {b} + {c} + {d}',
    variables: {
      a: { kind: 'int', min: 4, max: 7 },
      b: { kind: 'int', min: 1, max: 3 },
      c: { kind: 'int', min: 2, max: 5 },
      d: { kind: 'int', min: 5, max: 8 },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c) + Number(v.d),
    format: { kind: 'integer', min: 12, max: 23 },
    distractors: ({ answer }) => nearMisses(Number(answer), 12, 23),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} + ${vars.c} + ${vars.d} = ${answer}.`,
  }),

  // Q57: გამოთვალე: (5+5+2+4)
  defineTemplate({
    ...addr({ id: 'g3-u03-57', subtopicId: 'u03-adding-four-or-more', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} + {a} + {b} + {c} = ?',
    variables: {
      a: { kind: 'int', min: 3, max: 6 },
      b: { kind: 'int', min: 1, max: 4 },
      c: { kind: 'int', min: 2, max: 5 },
      variant: { kind: 'choice', values: ['იპოვე ჯამი.', 'ჩაწერე პასუხი.'] },
    },
    answer: (v) => 2 * Number(v.a) + Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 9, max: 21 },
    distractors: ({ answer }) => nearMisses(Number(answer), 9, 21),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.a} + ${vars.b} + ${vars.c} = ${answer}.`,
  }),

  // Q58: გამოთვალე: (8+2+6+3)
  defineTemplate({
    ...addr({ id: 'g3-u03-58', subtopicId: 'u03-adding-four-or-more', difficulty: 2 }),
    prompt: 'გამოთვალე: {a} + {b} + {c} + {d} = ? {variant}',
    variables: {
      a: { kind: 'choice', values: [7, 8, 9] },
      b: { kind: 'choice', values: [1, 2, 3] },
      c: { kind: 'int', min: 4, max: 7 },
      d: { kind: 'int', min: 2, max: 5 },
      variant: { kind: 'choice', values: ['იპოვე მნიშვნელობა.', 'გამოთვალე ჯამი.'] },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c) + Number(v.d),
    format: { kind: 'integer', min: 14, max: 24 },
    distractors: ({ answer }) => nearMisses(Number(answer), 14, 24),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} + ${vars.c} + ${vars.d} = ${answer}.`,
  }),

  // Q59: გამოთვალე: (1+4+7+5+2) (ხუთი რიცხვის შეკრება)
  defineTemplate({
    ...addr({ id: 'g3-u03-59', subtopicId: 'u03-adding-four-or-more', difficulty: 3 }),
    prompt: 'გამოთვალე ხუთი რიცხვის ჯამი:\n\n{a} + {b} + {c} + {d} + {e}',
    variables: {
      a: { kind: 'int', min: 1, max: 3 },
      b: { kind: 'int', min: 2, max: 5 },
      c: { kind: 'int', min: 4, max: 7 },
      d: { kind: 'int', min: 3, max: 6 },
      e: { kind: 'int', min: 1, max: 4 },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c) + Number(v.d) + Number(v.e),
    format: { kind: 'integer', min: 11, max: 25 },
    distractors: ({ answer }) => nearMisses(Number(answer), 11, 25),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} + ${vars.c} + ${vars.d} + ${vars.e} = ${answer}.`,
  }),

  // Q60: გამოთვალე: (3+6+2+4+1+3) (ექვსი რიცხვის შეკრება)
  defineTemplate({
    ...addr({ id: 'g3-u03-60', subtopicId: 'u03-adding-four-or-more', difficulty: 3 }),
    prompt: 'გამოთვალე ექვსი რიცხვის ჯამი:\n\n{a} + {b} + {c} + {d} + {e} + {f}',
    variables: {
      a: { kind: 'int', min: 1, max: 4 },
      b: { kind: 'int', min: 3, max: 6 },
      c: { kind: 'int', min: 1, max: 4 },
      d: { kind: 'int', min: 2, max: 5 },
      e: { kind: 'int', min: 1, max: 3 },
      f: { kind: 'int', min: 2, max: 5 },
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c) + Number(v.d) + Number(v.e) + Number(v.f),
    format: { kind: 'integer', min: 10, max: 27 },
    distractors: ({ answer }) => nearMisses(Number(answer), 10, 27),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} + ${vars.c} + ${vars.d} + ${vars.e} + ${vars.f} = ${answer}.`,
  }),
];
