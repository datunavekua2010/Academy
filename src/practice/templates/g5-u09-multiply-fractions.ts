import type { QuestionTemplate } from './types';
import {
  RELATION_OPTIONS,
  bank,
  fourOptions,
  fracText,
  mixedKept,
  mixedReduced,
  relation,
  rowNumbers,
} from './g5-helpers';

/**
 * Grade V — Unit 09: წილადების გამრავლება (multiplying fractions).
 *
 * The Drive document named `U09` in the bank folder contains U08's questions
 * verbatim — it is a copy, not the multiplication unit. This file is therefore
 * built from the curriculum's own eight subtopic titles (fraction × whole, two
 * fractions, fraction × mixed number, mixed × whole, comparing products, three
 * or more factors, two mixed numbers, word problems), which is the set the
 * unit's summary and its code already promise.
 */

export const G5_U09_SUBTOPICS = [
  'u09-01',
  'u09-02',
  'u09-03',
  'u09-04',
  'u09-05',
  'u09-06',
  'u09-07',
  'u09-08',
] as const;

export type G5U09SubtopicId = (typeof G5_U09_SUBTOPICS)[number];

const TOPIC = 'g5-multiply-fractions';

const f = (n: number, d: number): string => `${n}/${d}`;
const at = (row: unknown, index: number): number => rowNumbers(row)[index]!;
const lcmOf = (a: number, b: number): number => {
  const g = (x: number, y: number): number => (y === 0 ? Math.abs(x) : g(y, x % y));
  return Math.abs(a * b) / (g(a, b) || 1);
};

const pool = (build: (add: (row: string) => void) => void): string[] => {
  const rows: string[] = [];
  build((row) => {
    if (!rows.includes(row)) rows.push(row);
  });
  return rows;
};

// ───────────────────────────── pools ─────────────────────────────

/** `a|d|k`: fraction times a whole number, answer stays under one. */
const fracTimesWhole = pool((add) => {
  for (const d of [2, 3, 4, 5, 6, 8, 10, 12])
    for (let a = 1; a < d; a += 1) for (let k = 2; k <= 9; k += 1) add(`${a}|${d}|${k}`);
});

/** `a|b|c|d`: two fractions multiplied. */
const twoFractions = pool((add) => {
  for (const b of [2, 3, 4, 5, 6, 8, 10, 12])
    for (const d of [2, 3, 4, 5, 6, 8, 10, 12])
      for (let a = 1; a < b; a += 1) for (let c = 1; c < d; c += 1) add(`${a}|${b}|${c}|${d}`);
});

/** `w|n|d|a|b`: mixed number times a fraction. */
const mixedTimesFrac = pool((add) => {
  for (const d of [2, 3, 4, 5, 6, 8]) {
    for (const b of [2, 3, 4, 5, 6]) {
      for (let w = 1; w <= 3; w += 1)
        for (let n = 1; n < d; n += 1) for (let a = 1; a < b; a += 1) add(`${w}|${n}|${d}|${a}|${b}`);
    }
  }
});

/** `w|n|d|k`: mixed number times a whole number. */
const mixedTimesWhole = pool((add) => {
  for (const d of [2, 3, 4, 5, 6, 8])
    for (let w = 1; w <= 4; w += 1)
      for (let n = 1; n < d; n += 1) for (let k = 2; k <= 8; k += 1) add(`${w}|${n}|${d}|${k}`);
});

/** `w1|n1|d1|w2|n2|d2`: two mixed numbers. */
const twoMixed = pool((add) => {
  for (const d1 of [2, 3, 4, 5, 6])
    for (const d2 of [2, 3, 4, 5, 6]) {
      for (let w1 = 1; w1 <= 3; w1 += 1)
        for (let w2 = 1; w2 <= 3; w2 += 1)
          for (let n1 = 1; n1 < d1; n1 += 1) for (let n2 = 1; n2 < d2; n2 += 1) add(`${w1}|${n1}|${d1}|${w2}|${n2}|${d2}`);
    }
});

/** `a|b|c|d|e|g|h|i`: two products of fractions to compare. */
const compareProductsPool = pool((add) => {
  const fractions: Array<[number, number]> = [];
  for (const d of [2, 3, 4, 5, 6, 8]) for (let n = 1; n < d; n += 1) fractions.push([n, d]);
  let count = 0;
  outer: for (const [a, b] of fractions)
    for (const [c, d] of fractions)
      for (const [e, g] of fractions)
        for (const [h, i] of fractions) {
          const p1 = (a * c) / (b * d);
          const p2 = (e * h) / (g * i);
          if (Math.abs(p1 - p2) < 0.04) continue;
          add(`${a}|${b}|${c}|${d}|${e}|${g}|${h}|${i}`);
          count += 1;
          if (count >= 30) break outer;
        }
});

/** `a|b|c|d|e|g`: three fractions multiplied. */
const tripleProductPool = pool((add) => {
  const fractions: Array<[number, number]> = [];
  for (const d of [2, 3, 4, 5, 6]) for (let n = 1; n < d; n += 1) fractions.push([n, d]);
  let count = 0;
  outer: for (const [a, b] of fractions)
    for (const [c, d] of fractions)
      for (const [e, g] of fractions) {
        add(`${a}|${b}|${c}|${d}|${e}|${g}`);
        count += 1;
        if (count >= 30) break outer;
      }
});

const FAMILY_OPTIONS = ['მეტია', 'ნაკლებია', 'ტოლია'];

export const G5_U09_TEMPLATES: QuestionTemplate[] = [
  // ───────────── U09.1 — წილადი მთელ რიცხვზე ─────────────
  bank({
    id: 'g5-u09-q01',
    subtopicId: 'u09-01',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'გამოთვალე: {a}/{d} × {k}',
    variables: {
      spec: { kind: 'choice', values: fracTimesWhole },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      k: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => fracText(Number(v.a) * Number(v.k), Number(v.d)),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [a, d, k] = ['a', 'd', 'k'].map((n) => Number(ctx.vars[n])) as number[];
      return fourOptions(fracText(a! * k!, d!), [
        f(a! * k!, d! * k!),
        fracText(a! + k!, d!),
        fracText(a! * k! + 1, d!),
      ]);
    },
    explain: ({ vars, answer }) =>
      `მრიცხველი მთელ რიცხვზე გავამრავლეთ: ${vars.a} × ${vars.k} = ${Number(vars.a) * Number(vars.k)}; მნიშვნელი ${vars.d} უცვლელია. პასუხი: ${answer}.`,
  }),
  bank({
    id: 'g5-u09-q02',
    subtopicId: 'u09-01',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'გამოთვალე: {k} × {a}/{d}',
    variables: {
      spec: { kind: 'choice', values: fracTimesWhole },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      k: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => fracText(Number(v.a) * Number(v.k), Number(v.d)),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [a, d, k] = ['a', 'd', 'k'].map((n) => Number(ctx.vars[n])) as number[];
      return fourOptions(fracText(a! * k!, d!), [
        fracText(a! * k!, d! + k!),
        fracText(a! + k!, d!),
        fracText(a! * k! + k!, d!),
      ]);
    },
    explain: ({ vars, answer }) =>
      `${vars.k} × ${vars.a} = ${Number(vars.a) * Number(vars.k)}; მნიშვნელი ${vars.d}. პასუხი: ${answer}.`,
  }),
  bank({
    id: 'g5-u09-q03',
    subtopicId: 'u09-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე: {a}/{d} × {k}. შედეგი ჩაწერე შერეული რიცხვის სახით.',
    variables: {
      spec: { kind: 'choice', values: fracTimesWhole },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      k: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => mixedKept(Number(v.a) * Number(v.k), Number(v.d)),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [a, d, k] = ['a', 'd', 'k'].map((n) => Number(ctx.vars[n])) as number[];
      const total = a! * k!;
      return fourOptions(mixedKept(total, d!), [f(total, d!), mixedReduced(total, d!), mixedKept(total + d!, d!)]);
    },
    explain: ({ vars, answer }) =>
      `${vars.a} × ${vars.k} = ${Number(vars.a) * Number(vars.k)}; ${Number(vars.a) * Number(vars.k)}/${vars.d} = ${answer}.`,
  }),

  // ───────────── U09.2 — ორი წილადის გამრავლება ─────────────
  bank({
    id: 'g5-u09-q04',
    subtopicId: 'u09-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე: {a}/{b} × {c}/{d}',
    variables: {
      spec: { kind: 'choice', values: twoFractions },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
    },
    answer: (v) => fracText(Number(v.a) * Number(v.c), Number(v.b) * Number(v.d)),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [a, b, c, d] = ['a', 'b', 'c', 'd'].map((n) => Number(ctx.vars[n])) as number[];
      return fourOptions(fracText(a! * c!, b! * d!), [
        f(a! + c!, b! + d!),
        f(a! * c!, b! + d!),
        fracText(a! * c! + 1, b! * d!),
      ]);
    },
    explain: ({ vars, answer }) =>
      `მრიცხველი მრიცხველზე, მნიშვნელი მნიშვნელზე: ${vars.a} × ${vars.c} = ${Number(vars.a) * Number(vars.c)}, ${vars.b} × ${vars.d} = ${Number(vars.b) * Number(vars.d)}. პასუხი: ${answer}.`,
  }),
  bank({
    id: 'g5-u09-q05',
    subtopicId: 'u09-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე: {a}/{b} × {c}/{d}',
    variables: {
      spec: { kind: 'choice', values: twoFractions },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
    },
    answer: (v) => fracText(Number(v.a) * Number(v.c), Number(v.b) * Number(v.d)),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [a, b, c, d] = ['a', 'b', 'c', 'd'].map((n) => Number(ctx.vars[n])) as number[];
      return fourOptions(fracText(a! * c!, b! * d!), [
        f(a! * d!, b! * c!),
        f(a! + c!, b! + d!),
        fracText(a! * c! + 2, b! * d!),
      ]);
    },
    explain: ({ answer }) => `ჯვარედინი შეკვეცის შემდეგ: ${answer}.`,
  }),
  bank({
    id: 'g5-u09-q06',
    subtopicId: 'u09-02',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'გამოთვალე: {a}/{b} × {c}/{d} და შედეგი შეამოკლე.',
    variables: {
      spec: { kind: 'choice', values: twoFractions },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
    },
    answer: (v) => fracText(Number(v.a) * Number(v.c), Number(v.b) * Number(v.d)),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [a, b, c, d] = ['a', 'b', 'c', 'd'].map((n) => Number(ctx.vars[n])) as number[];
      return fourOptions(fracText(a! * c!, b! * d!), [
        f(a! * c!, b! * d!),
        f(a! * d!, b! * c!),
        fracText(a! * c! + 3, b! * d!),
      ]);
    },
    explain: ({ vars, answer }) =>
      `${vars.a} × ${vars.c} = ${Number(vars.a) * Number(vars.c)}; ${vars.b} × ${vars.d} = ${Number(vars.b) * Number(vars.d)}. შეკვეცის შემდეგ: ${answer}.`,
  }),

  // ───────────── U09.3 — წილადი შერეულ რიცხვზე ─────────────
  bank({
    id: 'g5-u09-q07',
    subtopicId: 'u09-03',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'გამოთვალე: {w} {n}/{d} × {a}/{b}',
    variables: {
      spec: { kind: 'choice', values: mixedTimesFrac },
      w: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      n: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 4)] },
    },
    answer: (v) => {
      const [w, n, d, a, b] = ['w', 'n', 'd', 'a', 'b'].map((name) => Number(v[name])) as number[];
      return fracText((w! * d! + n!) * a!, d! * b!);
    },
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [w, n, d, a, b] = ['w', 'n', 'd', 'a', 'b'].map((name) => Number(ctx.vars[name])) as number[];
      const right = fracText((w! * d! + n!) * a!, d! * b!);
      return fourOptions(right, [
        f(w! * a!, d! * b!),
        fracText(n! * a!, d! * b!),
        fracText((w! * d! + n!) * a! + 1, d! * b!),
      ]);
    },
    explain: ({ vars, answer }) => {
      const [w, n, d, a, b] = ['w', 'n', 'd', 'a', 'b'].map((name) => Number(vars[name])) as number[];
      return `ჯერ შერეული რიცხვი არაწესიერ წილადად: ${w! * d! + n!}/${d}. შემდეგ ${w! * d! + n!}/${d} × ${a}/${b} = ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u09-q08',
    subtopicId: 'u09-03',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'გამოთვალე: {a}/{b} × {w} {n}/{d}',
    variables: {
      spec: { kind: 'choice', values: mixedTimesFrac },
      w: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      n: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 4)] },
    },
    answer: (v) => {
      const [w, n, d, a, b] = ['w', 'n', 'd', 'a', 'b'].map((name) => Number(v[name])) as number[];
      return fracText(a! * (w! * d! + n!), b! * d!);
    },
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [w, n, d, a, b] = ['w', 'n', 'd', 'a', 'b'].map((name) => Number(ctx.vars[name])) as number[];
      return fourOptions(fracText(a! * (w! * d! + n!), b! * d!), [
        f(a! * w!, b! * d!),
        fracText(a! * n!, b! * d!),
        fracText(a! * (w! * d! + n!) + 2, b! * d!),
      ]);
    },
    explain: ({ vars, answer }) => {
      const [w, n, d, a, b] = ['w', 'n', 'd', 'a', 'b'].map((name) => Number(vars[name])) as number[];
      return `${a}/${b} × ${w! * d! + n!}/${d} = ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u09-q09',
    subtopicId: 'u09-03',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'გამოთვალე: {w} {n}/{d} × {a}/{b} და ჩაწერე შერეული რიცხვით.',
    variables: {
      spec: { kind: 'choice', values: mixedTimesFrac },
      w: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      n: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 4)] },
    },
    answer: (v) => {
      const [w, n, d, a, b] = ['w', 'n', 'd', 'a', 'b'].map((name) => Number(v[name])) as number[];
      return mixedReduced((w! * d! + n!) * a!, d! * b!);
    },
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [w, n, d, a, b] = ['w', 'n', 'd', 'a', 'b'].map((name) => Number(ctx.vars[name])) as number[];
      const top = (w! * d! + n!) * a!;
      const bottom = d! * b!;
      return fourOptions(mixedReduced(top, bottom), [
        f(top, bottom),
        mixedKept(top, bottom),
        mixedReduced(top + bottom!, bottom),
      ]);
    },
    explain: ({ answer }) =>
      `შერეული რიცხვი ჯერ არაწესიერად ვწერთ, შემდეგ ვამრავლებთ: ${answer}.`,
  }),

  // ───────────── U09.4 — შერეული რიცხვი მთელზე ─────────────
  bank({
    id: 'g5-u09-q10',
    subtopicId: 'u09-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე: {w} {n}/{d} × {k}',
    variables: {
      spec: { kind: 'choice', values: mixedTimesWhole },
      w: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      n: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      k: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
    },
    answer: (v) => {
      const [w, n, d, k] = ['w', 'n', 'd', 'k'].map((name) => Number(v[name])) as number[];
      return mixedReduced((w! * d! + n!) * k!, d!);
    },
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [w, n, d, k] = ['w', 'n', 'd', 'k'].map((name) => Number(ctx.vars[name])) as number[];
      const top = (w! * d! + n!) * k!;
      return fourOptions(mixedReduced(top, d!), [f(top, d!), mixedKept(top, d!), mixedReduced(top + d!, d!)]);
    },
    explain: ({ vars, answer }) => {
      const [w, n, d, k] = ['w', 'n', 'd', 'k'].map((name) => Number(vars[name])) as number[];
      return `${w! * d! + n!}/${d} × ${k} = ${(w! * d! + n!) * k!}/${d} = ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u09-q11',
    subtopicId: 'u09-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე: {k} × {w} {n}/{d}',
    variables: {
      spec: { kind: 'choice', values: mixedTimesWhole },
      w: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      n: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      k: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
    },
    answer: (v) => {
      const [w, n, d, k] = ['w', 'n', 'd', 'k'].map((name) => Number(v[name])) as number[];
      return mixedKept((w! * d! + n!) * k!, d!);
    },
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [w, n, d, k] = ['w', 'n', 'd', 'k'].map((name) => Number(ctx.vars[name])) as number[];
      const top = (w! * d! + n!) * k!;
      return fourOptions(mixedKept(top, d!), [mixedReduced(top, d!), f(top, d!), mixedKept(top + 1, d!)]);
    },
    explain: ({ vars, answer }) =>
      `მთელი ნაწილიც და წილადი ნაწილიც ${vars.k}-ზე გავამრავლეთ: ${answer}.`,
  }),

  // ───────────── U09.5 — ნამრავლების შედარება ─────────────
  bank({
    id: 'g5-u09-q12',
    subtopicId: 'u09-05',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'შეადარე: {a}/{d} × {k} ___ {a}/{d} ({k} > 1)',
    variables: {
      spec: { kind: 'choice', values: fracTimesWhole },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      k: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => relation(Number(v.a) * Number(v.k), Number(v.a)),
    optionCount: 3,
    options: () => RELATION_OPTIONS,
    format: { kind: 'text' },
    explain: ({ vars, answer }) =>
      `ერთზე მეტ რიცხვზე გამრავლებისას წილადი იზრდება: ${Number(vars.a) * Number(vars.k)}/${vars.d} ${answer} ${vars.a}/${vars.d}.`,
  }),
  bank({
    id: 'g5-u09-q13',
    subtopicId: 'u09-05',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'შეადარე: {a}/{b} × {c}/{d} ___ {a}/{b} (მეორე მამრავლი ერთზე ნაკლებია)',
    variables: {
      spec: { kind: 'choice', values: twoFractions },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
    },
    answer: () => '<',
    optionCount: 3,
    options: () => RELATION_OPTIONS,
    format: { kind: 'text' },
    explain: ({ vars }) =>
      `${vars.c}/${vars.d} < 1, ამიტომ ნამრავლი ${vars.a}/${vars.b}-ზე ნაკლებია.`,
  }),
  bank({
    id: 'g5-u09-q14',
    subtopicId: 'u09-05',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'რომელი ნამრავლია მეტი: {a}/{b} × {c}/{d} თუ {e}/{g} × {h}/{i}?',
    variables: {
      spec: { kind: 'choice', values: compareProductsPool },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
      e: { kind: 'choice', values: (v) => [at(v.spec, 4)] },
      g: { kind: 'choice', values: (v) => [at(v.spec, 5)] },
      h: { kind: 'choice', values: (v) => [at(v.spec, 6)] },
      i: { kind: 'choice', values: (v) => [at(v.spec, 7)] },
    },
    answer: (v) => {
      const p1 = (Number(v.a) * Number(v.c)) / (Number(v.b) * Number(v.d));
      const p2 = (Number(v.e) * Number(v.h)) / (Number(v.g) * Number(v.i));
      return p1 > p2 ? `${v.a}/${v.b} × ${v.c}/${v.d}` : `${v.e}/${v.g} × ${v.h}/${v.i}`;
    },
    format: { kind: 'text' },
    options: (v) => {
      const p1 = (Number(v.a) * Number(v.c)) / (Number(v.b) * Number(v.d));
      const p2 = (Number(v.e) * Number(v.h)) / (Number(v.g) * Number(v.i));
      const right = p1 > p2 ? `${v.a}/${v.b} × ${v.c}/${v.d}` : `${v.e}/${v.g} × ${v.h}/${v.i}`;
      return fourOptions(right, [
        p1 > p2 ? `${v.e}/${v.g} × ${v.h}/${v.i}` : `${v.a}/${v.b} × ${v.c}/${v.d}`,
        'ტოლია',
        `${v.a}/${v.b} + ${v.c}/${v.d}`,
      ]);
    },
    explain: ({ vars, answer }) =>
      `პირველი ნამრავლი ${((Number(vars.a) * Number(vars.c)) / (Number(vars.b) * Number(vars.d))).toFixed(3)}, მეორე ${((Number(vars.e) * Number(vars.h)) / (Number(vars.g) * Number(vars.i))).toFixed(3)}. მეტია ${answer}.`,
  }),

  // ───────────── U09.6 — სამი და მეტი მამრავლი ─────────────
  bank({
    id: 'g5-u09-q15',
    subtopicId: 'u09-06',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე: {a}/{b} × {c}/{d} × {k}',
    variables: {
      spec: { kind: 'choice', values: twoFractions },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
      k: { kind: 'choice', values: (v) => [2 + (at(v.spec, 0) % 4)] },
    },
    answer: (v) => fracText(Number(v.a) * Number(v.c) * Number(v.k), Number(v.b) * Number(v.d)),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [a, b, c, d, k] = ['a', 'b', 'c', 'd', 'k'].map((n) => Number(ctx.vars[n])) as number[];
      const top = a! * c! * k!;
      return fourOptions(fracText(top, b! * d!), [
        f(top, b! * d! * k!),
        fracText(a! + c! + k!, b! + d!),
        fracText(top + 1, b! * d!),
      ]);
    },
    explain: ({ vars, answer }) =>
      `სამივე მამრავლის მრიცხველი ერთად: ${vars.a} × ${vars.c} × ${vars.k} = ${Number(vars.a) * Number(vars.c) * Number(vars.k)}; მნიშვნელი ${vars.b} × ${vars.d}. პასუხი: ${answer}.`,
  }),
  bank({
    id: 'g5-u09-q16',
    subtopicId: 'u09-06',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'გამოთვალე: {a}/{b} × {c}/{d} × {e}/{g}',
    variables: {
      spec: { kind: 'choice', values: tripleProductPool },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
      e: { kind: 'choice', values: (v) => [at(v.spec, 4)] },
      g: { kind: 'choice', values: (v) => [at(v.spec, 5)] },
    },
    answer: (v) =>
      fracText(Number(v.a) * Number(v.c) * Number(v.e), Number(v.b) * Number(v.d) * Number(v.g)),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [a, b, c, d, e, g] = ['a', 'b', 'c', 'd', 'e', 'g'].map((n) => Number(ctx.vars[n])) as number[];
      const top = a! * c! * e!;
      const bottom = b! * d! * g!;
      return fourOptions(fracText(top, bottom), [
        f(top + 1, bottom),
        f(a! + c! + e!, b! + d! + g!),
        fracText(top, bottom * 2),
      ]);
    },
    explain: ({ vars, answer }) =>
      `მრიცხველები: ${vars.a} × ${vars.c} × ${vars.e} = ${Number(vars.a) * Number(vars.c) * Number(vars.e)}; მნიშვნელები: ${vars.b} × ${vars.d} × ${vars.g} = ${Number(vars.b) * Number(vars.d) * Number(vars.g)}. პასუხი: ${answer}.`,
  }),

  // ───────────── U09.7 — ორი შერეული რიცხვი ─────────────
  bank({
    id: 'g5-u09-q17',
    subtopicId: 'u09-07',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'გამოთვალე: {w1} {n1}/{d1} × {w2} {n2}/{d2}',
    variables: {
      spec: { kind: 'choice', values: twoMixed },
      w1: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      n1: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d1: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      w2: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
      n2: { kind: 'choice', values: (v) => [at(v.spec, 4)] },
      d2: { kind: 'choice', values: (v) => [at(v.spec, 5)] },
    },
    answer: (v) => {
      const [w1, n1, d1, w2, n2, d2] = ['w1', 'n1', 'd1', 'w2', 'n2', 'd2'].map((n) => Number(v[n])) as number[];
      return mixedReduced((w1! * d1! + n1!) * (w2! * d2! + n2!), d1! * d2!);
    },
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [w1, n1, d1, w2, n2, d2] = ['w1', 'n1', 'd1', 'w2', 'n2', 'd2'].map((n) => Number(ctx.vars[n])) as number[];
      const top = (w1! * d1! + n1!) * (w2! * d2! + n2!);
      const bottom = d1! * d2!;
      return fourOptions(mixedReduced(top, bottom), [
        f(top, bottom),
        mixedKept(top, bottom),
        mixedReduced(top + bottom!, bottom),
      ]);
    },
    explain: ({ vars, answer }) => {
      const [w1, n1, d1, w2, n2, d2] = ['w1', 'n1', 'd1', 'w2', 'n2', 'd2'].map((n) => Number(vars[n])) as number[];
      return `${w1! * d1! + n1!}/${d1} × ${w2! * d2! + n2!}/${d2} = ${(w1! * d1! + n1!) * (w2! * d2! + n2!)}/${d1! * d2!} = ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u09-q18',
    subtopicId: 'u09-07',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'გამოთვალე: {w1} {n1}/{d1} × {w2} {n2}/{d2}',
    variables: {
      spec: { kind: 'choice', values: twoMixed },
      w1: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      n1: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d1: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      w2: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
      n2: { kind: 'choice', values: (v) => [at(v.spec, 4)] },
      d2: { kind: 'choice', values: (v) => [at(v.spec, 5)] },
    },
    answer: (v) => {
      const [w1, n1, d1, w2, n2, d2] = ['w1', 'n1', 'd1', 'w2', 'n2', 'd2'].map((n) => Number(v[n])) as number[];
      return fracText((w1! * d1! + n1!) * (w2! * d2! + n2!), d1! * d2!);
    },
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [w1, n1, d1, w2, n2, d2] = ['w1', 'n1', 'd1', 'w2', 'n2', 'd2'].map((n) => Number(ctx.vars[n])) as number[];
      const top = (w1! * d1! + n1!) * (w2! * d2! + n2!);
      const bottom = d1! * d2!;
      return fourOptions(fracText(top, bottom), [
        fracText(top, bottom * 2),
        f(w1! * w2!, d1! * d2!),
        f(top + 1, bottom),
      ]);
    },
    explain: ({ answer }) =>
      `ორივე შერეული რიცხვი არაწესიერ წილადად ვწერთ და ვამრავლებთ: ${answer}.`,
  }),

  // ───────────── U09.8 — ამოცანები ─────────────
  bank({
    id: 'g5-u09-q19',
    subtopicId: 'u09-08',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ერთ კოლოფში {a}/{d} კგ კანფეტია. {k} ასეთ კოლოფში რამდენი კილოგრამი კანფეტია?',
    variables: {
      spec: { kind: 'choice', values: fracTimesWhole },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      k: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => fracText(Number(v.a) * Number(v.k), Number(v.d)),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [a, d, k] = ['a', 'd', 'k'].map((n) => Number(ctx.vars[n])) as number[];
      return fourOptions(fracText(a! * k!, d!), [f(a! + k!, d!), fracText(a! * k!, d! * k!), f(a! * d!, k!)]);
    },
    explain: ({ vars, answer }) =>
      `${vars.k} კოლოფი × ${vars.a}/${vars.d} კგ = ${answer} კგ.`,
  }),
  bank({
    id: 'g5-u09-q20',
    subtopicId: 'u09-08',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'მინდორის {a}/{b} ნაწილი მოთესეს. ამ ნაწილის {c}/{d}-ზე ხორბალია. მთელი მინდორის რა ნაწილზეა ხორბალი?',
    variables: {
      spec: { kind: 'choice', values: twoFractions },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
    },
    answer: (v) => fracText(Number(v.a) * Number(v.c), Number(v.b) * Number(v.d)),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [a, b, c, d] = ['a', 'b', 'c', 'd'].map((n) => Number(ctx.vars[n])) as number[];
      return fourOptions(fracText(a! * c!, b! * d!), [
        f(a! + c!, b! + d!),
        fracText(a! * d!, b! * c!),
        f(a! * c!, b! * d! + 1),
      ]);
    },
    explain: ({ vars, answer }) =>
      `ნაწილის ნაწილი: ${vars.a}/${vars.b} × ${vars.c}/${vars.d} = ${answer}.`,
  }),
  bank({
    id: 'g5-u09-q21',
    subtopicId: 'u09-08',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ავტობუსი {w} {n}/{d} საათში {k} კმ/სთ სიჩქარით მოძრაობს. რამდენ კილომეტრს გაივლის?',
    variables: {
      spec: { kind: 'choice', values: mixedTimesWhole },
      w: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      n: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      k: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
    },
    answer: (v) => {
      const [w, n, d, k] = ['w', 'n', 'd', 'k'].map((name) => Number(v[name])) as number[];
      return mixedReduced((w! * d! + n!) * k!, d!);
    },
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [w, n, d, k] = ['w', 'n', 'd', 'k'].map((name) => Number(ctx.vars[name])) as number[];
      const top = (w! * d! + n!) * k!;
      return fourOptions(mixedReduced(top, d!), [f(top, d!), mixedKept(top, d!), mixedReduced(top + d!, d!)]);
    },
    explain: ({ vars, answer }) => {
      const [w, n, d, k] = ['w', 'n', 'd', 'k'].map((name) => Number(vars[name])) as number[];
      return `მანძილი = დრო × სიჩქარე = ${w! * d! + n!}/${d} × ${k} = ${answer} კმ.`;
    },
  }),
];

void lcmOf;
void FAMILY_OPTIONS;
