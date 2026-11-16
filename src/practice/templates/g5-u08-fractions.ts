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
 * Grade V — Unit 08: წილადების შეკრება და გამოკლება
 * (adding and subtracting fractions).
 *
 * Converted from the academy's `U08` bank (9 subtopics × 6 questions). The bank
 * writes fractions in LaTeX; here they are plain `a/b`, and a mixed number is
 * written `w n/d` on one line — the same spelling the answer options use.
 *
 * Pools are enumerated rather than hand-listed: every row that satisfies the
 * subtopic's arithmetic is a candidate, so a template has dozens of valid
 * variations instead of six.
 */

export const G5_U08_SUBTOPICS = [
  'u08-01',
  'u08-02',
  'u08-03',
  'u08-04',
  'u08-05',
  'u08-06',
  'u08-07',
  'u08-08',
  'u08-09',
] as const;

export type G5U08SubtopicId = (typeof G5_U08_SUBTOPICS)[number];

const TOPIC = 'g5-add-sub-fractions';

const f = (n: number, d: number): string => `${n}/${d}`;
const at = (row: unknown, index: number): number => rowNumbers(row)[index]!;
const lcmOf = (a: number, b: number): number => {
  const g = (x: number, y: number): number => (y === 0 ? Math.abs(x) : g(y, x % y));
  return Math.abs(a * b) / (g(a, b) || 1);
};

/** Collect distinct rows from an enumeration. */
const pool = (build: (add: (row: string) => void) => void): string[] => {
  const rows: string[] = [];
  build((row) => {
    if (!rows.includes(row)) rows.push(row);
  });
  return rows;
};

const BUCKETS = ['0-სა და 1/2-ს შორის', '1/2-სა და 1-ს შორის', '1-ზე მეტი'];
const bucketOf = (n: number, d: number): string =>
  n * 2 < d ? BUCKETS[0]! : n < d ? BUCKETS[1]! : BUCKETS[2]!;

// ───────────────────────────── pools ─────────────────────────────

/** Tenths that add to at most one whole. */
const tenthsSum = pool((add) => {
  for (let a = 1; a <= 9; a += 1) for (let b = 1; b <= 9; b += 1) if (a + b <= 10) add(`${a}|${b}`);
});
const tenthsDiff = pool((add) => {
  for (let a = 2; a <= 9; a += 1) for (let b = 1; b < a; b += 1) add(`${a}|${b}`);
});
const hundredthsSum = pool((add) => {
  for (let a = 5; a <= 60; a += 5) for (let b = 5; b <= 60; b += 5) if (a + b <= 100) add(`${a}|${b}`);
});
const hundredthsDiff = pool((add) => {
  for (let a = 20; a <= 95; a += 5) for (let b = 5; b < a; b += 5) add(`${a}|${b}`);
});
const tenthsPlusHundredths = pool((add) => {
  for (let a = 1; a <= 9; a += 1) for (let b = 1; b <= 9; b += 1) add(`${a}|${b}`);
});
const hundredthsMinusTenths = pool((add) => {
  for (let a = 30; a <= 95; a += 5) for (let b = 1; b <= 8; b += 1) if (a > b * 10) add(`${a}|${b}`);
});

/** `a|b|d` rows for same-denominator work. */
const sameDenomAdd = pool((add) => {
  for (let d = 5; d <= 12; d += 1)
    for (let a = 1; a < d; a += 1) for (let b = 1; b < d; b += 1) add(`${a}|${b}|${d}`);
});
const sameDenomDiff = pool((add) => {
  for (let d = 5; d <= 12; d += 1)
    for (let a = 2; a < d; a += 1) for (let b = 1; b < a; b += 1) add(`${a}|${b}|${d}`);
});
const sameDenomOver = pool((add) => {
  for (let d = 5; d <= 10; d += 1)
    for (let a = 1; a < d; a += 1)
      for (let b = 1; b < d; b += 1) if (a + b > d && a + b <= 2 * d) add(`${a}|${b}|${d}`);
});
const sameDenomBigger = pool((add) => {
  for (let d = 6; d <= 14; d += 1)
    for (let a = d + 1; a <= 2 * d; a += 1) for (let b = 1; b < d; b += 1) add(`${a}|${b}|${d}`);
});

/** `w1|n1|d|w2|n2` rows: mixed numbers over one denominator. */
const mixedSameAdd = pool((add) => {
  for (let d = 4; d <= 10; d += 1)
    for (let w1 = 1; w1 <= 4; w1 += 1)
      for (let w2 = 1; w2 <= 4; w2 += 1)
        for (let n1 = 1; n1 < d; n1 += 1) for (let n2 = 1; n2 < d; n2 += 1) add(`${w1}|${n1}|${d}|${w2}|${n2}|${d}`);
});
const mixedSameDiff = pool((add) => {
  for (let d = 4; d <= 10; d += 1)
    for (let w1 = 2; w1 <= 6; w1 += 1)
      for (let w2 = 1; w2 < w1; w2 += 1)
        for (let n1 = 1; n1 < d; n1 += 1) for (let n2 = 1; n2 < n1; n2 += 1) add(`${w1}|${n1}|${d}|${w2}|${n2}|${d}`);
});

/** `a|b|c|d` rows: two fractions with different denominators. */
const crossAdd = pool((add) => {
  for (const b of [2, 3, 4, 5, 6, 8, 10, 12])
    for (const d of [2, 3, 4, 5, 6, 8, 10, 12]) {
      if (lcmOf(b, d) > 24) continue;
      for (let a = 1; a < b; a += 1) for (let c = 1; c < d; c += 1) add(`${a}|${b}|${c}|${d}`);
    }
});
const crossDiff = pool((add) => {
  for (const b of [2, 3, 4, 5, 6, 8, 10, 12])
    for (const d of [2, 3, 4, 5, 6, 8, 10, 12]) {
      if (lcmOf(b, d) > 24) continue;
      for (let a = 1; a < b; a += 1)
        for (let c = 1; c < d; c += 1) if (a * d > c * b) add(`${a}|${b}|${c}|${d}`);
    }
});

/** `w1|n1|d1|w2|n2|d2` rows: mixed numbers with different denominators. */
const mixedCross = pool((add) => {
  for (const d1 of [2, 3, 4, 5, 6, 8])
    for (const d2 of [2, 3, 4, 5, 6, 8]) {
      if (lcmOf(d1, d2) > 12) continue;
      for (let w1 = 1; w1 <= 4; w1 += 1)
        for (let w2 = 1; w2 <= 3; w2 += 1)
          for (let n1 = 1; n1 < d1; n1 += 1) for (let n2 = 1; n2 < d2; n2 += 1) add(`${w1}|${n1}|${d1}|${w2}|${n2}|${d2}`);
    }
});
const mixedCrossDiff = pool((add) => {
  for (const d1 of [2, 3, 4, 5, 6, 8])
    for (const d2 of [2, 3, 4, 5, 6, 8]) {
      if (lcmOf(d1, d2) > 12) continue;
      for (let w1 = 3; w1 <= 7; w1 += 1)
        for (let w2 = 1; w2 < w1; w2 += 1)
          for (let n1 = 1; n1 < d1; n1 += 1) for (let n2 = 1; n2 < d2; n2 += 1) add(`${w1}|${n1}|${d1}|${w2}|${n2}|${d2}`);
    }
});

/** `a|b|c|d|e|g|f|h`: two expressions built from small fractions. */
const mixedComparePool = pool((add) => {
  const fractions: Array<[number, number]> = [];
  for (const d of [2, 3, 4, 5, 6, 8, 10, 12]) for (let n = 1; n < d; n += 1) fractions.push([n, d]);
  let count = 0;
  outer: for (const [a, b] of fractions) {
    for (const [c, d] of fractions) {
      for (const [e, f] of fractions) {
        for (const [g, h] of fractions) {
          const left = a / b + c / d;
          const right = e / f - g / h;
          if (right <= 0) continue;
          if (Math.abs(left - right) < 0.05) continue;
          add(`${a}|${b}|${c}|${d}|${e}|${g}|${f}|${h}`);
          count += 1;
          if (count >= 30) break outer;
        }
      }
    }
  }
});

export const G5_U08_TEMPLATES: QuestionTemplate[] = [
  // ───────────── U08.1 — მეათედები და მეასედები ─────────────
  bank({
    id: 'g5-u08-q01',
    subtopicId: 'u08-01',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'გამოთვალე: {a}/10 + {b}/10',
    variables: {
      spec: { kind: 'choice', values: tenthsSum },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => f(Number(v.a) + Number(v.b), 10),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      return fourOptions(f(a + b, 10), [f(a + b, 20), f(Math.abs(a - b), 10), f(a + b + 1, 10)]);
    },
    explain: ({ vars, answer }) =>
      `მნიშვნელი ერთია (10), ამიტომ მრიცხველებს ვკრებთ: ${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}, მნიშვნელი უცვლელია. პასუხი: ${answer}.`,
  }),
  bank({
    id: 'g5-u08-q02',
    subtopicId: 'u08-01',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'გამოთვალე: {a}/10 − {b}/10',
    variables: {
      spec: { kind: 'choice', values: tenthsDiff },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => f(Number(v.a) - Number(v.b), 10),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      return fourOptions(f(a - b, 10), [f(a + b, 10), f(a - b, 20), f(a - b + 1, 10)]);
    },
    explain: ({ vars, answer }) =>
      `მრიცხველებს ვაკლებთ: ${vars.a} − ${vars.b} = ${Number(vars.a) - Number(vars.b)}. მნიშვნელი 10 რჩება. პასუხი: ${answer}.`,
  }),
  bank({
    id: 'g5-u08-q03',
    subtopicId: 'u08-01',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'გამოთვალე: {a}/100 + {b}/100',
    variables: {
      spec: { kind: 'choice', values: hundredthsSum },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => f(Number(v.a) + Number(v.b), 100),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      return fourOptions(f(a + b, 100), [f(a + b, 200), f(a + b + 10, 100), f(a + b - 10, 100)]);
    },
    explain: ({ vars, answer }) =>
      `მეასედებს ვკრებთ: ${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}, მნიშვნელი 100-ია. პასუხი: ${answer}.`,
  }),
  bank({
    id: 'g5-u08-q04',
    subtopicId: 'u08-01',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'გამოთვალე: {a}/100 − {b}/100',
    variables: {
      spec: { kind: 'choice', values: hundredthsDiff },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => f(Number(v.a) - Number(v.b), 100),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      return fourOptions(f(a - b, 100), [f(a - b, 200), f(a + b, 100), f(a - b + 10, 100)]);
    },
    explain: ({ vars, answer }) =>
      `მეასედებს ვაკლებთ: ${vars.a} − ${vars.b} = ${Number(vars.a) - Number(vars.b)}. პასუხი: ${answer}.`,
  }),
  bank({
    id: 'g5-u08-q05',
    subtopicId: 'u08-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე: {a}/10 + {b}/100. პასუხი ჩაწერე მეასედების სახით.',
    variables: {
      spec: { kind: 'choice', values: tenthsPlusHundredths },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => f(Number(v.a) * 10 + Number(v.b), 100),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      return fourOptions(f(a * 10 + b, 100), [
        f(a + b, 100),
        f(a * 10 + b + 10, 100),
        f(a * 10 - b, 100),
      ]);
    },
    explain: ({ vars, answer }) =>
      `მეათედი = 10 მეასედი, ამიტომ ${vars.a}/10 = ${Number(vars.a) * 10}/100. შემდეგ ${Number(vars.a) * 10} + ${vars.b} = ${Number(vars.a) * 10 + Number(vars.b)}. პასუხი: ${answer}.`,
  }),
  bank({
    id: 'g5-u08-q06',
    subtopicId: 'u08-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე: {a}/100 − {b}/10. პასუხი ჩაწერე მეასედების სახით.',
    variables: {
      spec: { kind: 'choice', values: hundredthsMinusTenths },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => f(Number(v.a) - Number(v.b) * 10, 100),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      return fourOptions(f(a - b * 10, 100), [f(a - b, 100), f(a - b * 10 + 10, 100), f(a + b * 10, 100)]);
    },
    explain: ({ vars, answer }) =>
      `${vars.b}/10 = ${Number(vars.b) * 10}/100. შემდეგ ${vars.a} − ${Number(vars.b) * 10} = ${Number(vars.a) - Number(vars.b) * 10}. პასუხი: ${answer}.`,
  }),

  // ───────────── U08.2 — ერთი მნიშვნელის წილადები ─────────────
  bank({
    id: 'g5-u08-q07',
    subtopicId: 'u08-02',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'გამოთვალე: {a}/{d} + {b}/{d}',
    variables: {
      spec: { kind: 'choice', values: sameDenomAdd },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => mixedKept(Number(v.a) + Number(v.b), Number(v.d)),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      const d = Number(ctx.vars.d);
      return fourOptions(mixedKept(a + b, d), [f(a + b, d + d), f(a * b, d), mixedKept(a + b + 1, d)]);
    },
    explain: ({ vars, answer }) =>
      `მრიცხველები ვკრებთ, მნიშვნელი ${vars.d} რჩება: ${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}. პასუხი: ${answer}.`,
  }),
  bank({
    id: 'g5-u08-q08',
    subtopicId: 'u08-02',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'გამოთვალე: {a}/{d} − {b}/{d}',
    variables: {
      spec: { kind: 'choice', values: sameDenomDiff },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => fracText(Number(v.a) - Number(v.b), Number(v.d)),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      const d = Number(ctx.vars.d);
      return fourOptions(fracText(a - b, d), [f(a + b, d), f(a - b, d + 1), f(a - b + 1, d)]);
    },
    explain: ({ vars, answer }) =>
      `მრიცხველები ვაკლებთ: ${vars.a} − ${vars.b} = ${Number(vars.a) - Number(vars.b)}. პასუხი: ${answer}.`,
  }),
  bank({
    id: 'g5-u08-q09',
    subtopicId: 'u08-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე: {a}/{d} + {b}/{d}. პასუხი ჩაწერე შერეული რიცხვის სახით.',
    variables: {
      spec: { kind: 'choice', values: sameDenomOver },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => mixedKept(Number(v.a) + Number(v.b), Number(v.d)),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      const d = Number(ctx.vars.d);
      return fourOptions(mixedKept(a + b, d), [f(a + b, d), f(a + b, d * 2), mixedKept(a + b + 2, d)]);
    },
    explain: ({ vars, answer }) =>
      `ჯამი ${Number(vars.a) + Number(vars.b)}/${vars.d}. რადგან მრიცხველი მნიშვნელზე მეტია, გამოვყოფთ მთელ ნაწილს: ${answer}.`,
  }),
  bank({
    id: 'g5-u08-q10',
    subtopicId: 'u08-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე: {a}/{d} − {b}/{d}',
    variables: {
      spec: { kind: 'choice', values: sameDenomBigger },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => fracText(Number(v.a) - Number(v.b), Number(v.d)),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      const d = Number(ctx.vars.d);
      return fourOptions(fracText(a - b, d), [f(a + b, d), f(a - b, d + 1), mixedKept(a - b, d)]);
    },
    explain: ({ vars, answer }) =>
      `${vars.a} − ${vars.b} = ${Number(vars.a) - Number(vars.b)}, მნიშვნელი ${vars.d}. პასუხი: ${answer}.`,
  }),

  // ───────────── U08.3 — ერთი მნიშვნელის შერეული რიცხვები ─────────────
  bank({
    id: 'g5-u08-q11',
    subtopicId: 'u08-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე: {w1} {n1}/{d} + {w2} {n2}/{d}',
    variables: {
      spec: { kind: 'choice', values: mixedSameAdd },
      w1: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      n1: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      w2: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
      n2: { kind: 'choice', values: (v) => [at(v.spec, 4)] },
    },
    answer: (v) =>
      mixedKept(Number(v.w1) * Number(v.d) + Number(v.n1) + (Number(v.w2) * Number(v.d) + Number(v.n2)), Number(v.d)),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [w1, n1, d, w2, n2] = ['w1', 'n1', 'd', 'w2', 'n2'].map((name) => Number(ctx.vars[name])) as number[];
      const total = w1! * d! + n1! + (w2! * d! + n2!);
      return fourOptions(mixedKept(total, d!), [mixedKept(total + d!, d!), mixedKept(total - d!, d!), f(total, d!)]);
    },
    explain: ({ vars, answer }) => {
      const d = Number(vars.d);
      const total = Number(vars.w1) * d + Number(vars.n1) + (Number(vars.w2) * d + Number(vars.n2));
      return `ჯერ ნაწილებს ვკრებთ: ${vars.n1} + ${vars.n2} = ${Number(vars.n1) + Number(vars.n2)}; მთლიანებს: ${vars.w1} + ${vars.w2} = ${Number(vars.w1) + Number(vars.w2)}. სულ ${total}/${d} = ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u08-q12',
    subtopicId: 'u08-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე: {w1} {n1}/{d} − {w2} {n2}/{d}',
    variables: {
      spec: { kind: 'choice', values: mixedSameDiff },
      w1: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      n1: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      w2: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
      n2: { kind: 'choice', values: (v) => [at(v.spec, 4)] },
    },
    answer: (v) =>
      mixedKept(Number(v.w1) * Number(v.d) + Number(v.n1) - (Number(v.w2) * Number(v.d) + Number(v.n2)), Number(v.d)),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [w1, n1, d, w2, n2] = ['w1', 'n1', 'd', 'w2', 'n2'].map((name) => Number(ctx.vars[name])) as number[];
      const total = w1! * d! + n1! - (w2! * d! + n2!);
      return fourOptions(mixedKept(total, d!), [mixedKept(total + 1, d!), mixedKept(total + d!, d!), f(total, d!)]);
    },
    explain: ({ vars, answer }) => {
      const d = Number(vars.d);
      const total = Number(vars.w1) * d + Number(vars.n1) - (Number(vars.w2) * d + Number(vars.n2));
      return `ნაწილები: ${vars.n1} − ${vars.n2} = ${Number(vars.n1) - Number(vars.n2)}; მთლიანები: ${vars.w1} − ${vars.w2} = ${Number(vars.w1) - Number(vars.w2)}. სულ ${total}/${d} = ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u08-q13',
    subtopicId: 'u08-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე: {w1} {n1}/{d} + {w2} {n2}/{d}',
    variables: {
      spec: { kind: 'choice', values: mixedSameAdd },
      w1: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      n1: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      w2: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
      n2: { kind: 'choice', values: (v) => [at(v.spec, 4)] },
    },
    answer: (v) =>
      mixedReduced(Number(v.w1) * Number(v.d) + Number(v.n1) + (Number(v.w2) * Number(v.d) + Number(v.n2)), Number(v.d)),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [w1, n1, d, w2, n2] = ['w1', 'n1', 'd', 'w2', 'n2'].map((name) => Number(ctx.vars[name])) as number[];
      const total = w1! * d! + n1! + (w2! * d! + n2!);
      return fourOptions(mixedReduced(total, d!), [mixedKept(total, d!), f(total, d!), mixedKept(total + 1, d!)]);
    },
    explain: ({ vars, answer }) =>
      `მთლიანები: ${vars.w1} + ${vars.w2} = ${Number(vars.w1) + Number(vars.w2)}; ნაწილები: ${vars.n1} + ${vars.n2} = ${Number(vars.n1) + Number(vars.n2)}. შედეგი შეკვეცილია: ${answer}.`,
  }),
  bank({
    id: 'g5-u08-q14',
    subtopicId: 'u08-03',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'გამოთვალე: {w1} {n1}/{d} − {w2} {n2}/{d}',
    variables: {
      spec: { kind: 'choice', values: mixedSameDiff },
      w1: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      n1: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      w2: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
      n2: { kind: 'choice', values: (v) => [at(v.spec, 4)] },
    },
    answer: (v) =>
      mixedReduced(Number(v.w1) * Number(v.d) + Number(v.n1) - (Number(v.w2) * Number(v.d) + Number(v.n2)), Number(v.d)),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [w1, n1, d, w2, n2] = ['w1', 'n1', 'd', 'w2', 'n2'].map((name) => Number(ctx.vars[name])) as number[];
      const total = w1! * d! + n1! - (w2! * d! + n2!);
      return fourOptions(mixedReduced(total, d!), [mixedKept(total, d!), f(total, d!), mixedKept(total + d!, d!)]);
    },
    explain: ({ vars, answer }) =>
      `წილადებს ვაკლებთ, შემდეგ მთლიანებს: ${vars.w1} ${vars.n1}/${vars.d} − ${vars.w2} ${vars.n2}/${vars.d} = ${answer}.`,
  }),

  // ───────────── U08.4 — სხვადასხვა მნიშვნელის წილადები ─────────────
  bank({
    id: 'g5-u08-q15',
    subtopicId: 'u08-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე: {a}/{b} + {c}/{d}',
    variables: {
      spec: { kind: 'choice', values: crossAdd },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
    },
    answer: (v) => {
      const [a, b, c, d] = [v.a, v.b, v.c, v.d].map(Number) as number[];
      const l = lcmOf(b!, d!);
      return fracText(a! * (l / b!) + c! * (l / d!), l);
    },
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [a, b, c, d] = ['a', 'b', 'c', 'd'].map((name) => Number(ctx.vars[name])) as number[];
      const l = lcmOf(b!, d!);
      return fourOptions(fracText(a! * (l / b!) + c! * (l / d!), l), [
        f(a! + c!, b! + d!),
        f(a! * (l / b!) + c! * (l / d!), b! * d!),
        f(a! + c!, l),
      ]);
    },
    explain: ({ vars, answer }) => {
      const [a, b, c, d] = [Number(vars.a), Number(vars.b), Number(vars.c), Number(vars.d)];
      const l = lcmOf(b, d);
      return `საერთო მნიშვნელია ${l}: ${a}/${b} = ${a * (l / b)}/${l}, ${c}/${d} = ${c * (l / d)}/${l}. ჯამი ${a * (l / b) + c * (l / d)}/${l} = ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u08-q16',
    subtopicId: 'u08-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე: {a}/{b} − {c}/{d}',
    variables: {
      spec: { kind: 'choice', values: crossDiff },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
    },
    answer: (v) => {
      const [a, b, c, d] = [v.a, v.b, v.c, v.d].map(Number) as number[];
      const l = lcmOf(b!, d!);
      return fracText(a! * (l / b!) - c! * (l / d!), l);
    },
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [a, b, c, d] = ['a', 'b', 'c', 'd'].map((name) => Number(ctx.vars[name])) as number[];
      const l = lcmOf(b!, d!);
      return fourOptions(fracText(a! * (l / b!) - c! * (l / d!), l), [
        f(a! - c!, b! - d!),
        f(a! * (l / b!) - c! * (l / d!), b! * d!),
        f(a! * (l / b!) + c! * (l / d!), l),
      ]);
    },
    explain: ({ vars, answer }) => {
      const [a, b, c, d] = [Number(vars.a), Number(vars.b), Number(vars.c), Number(vars.d)];
      const l = lcmOf(b, d);
      return `საერთო მნიშვნელი ${l}: ${a * (l / b)}/${l} − ${c * (l / d)}/${l} = ${a * (l / b) - c * (l / d)}/${l} = ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u08-q17',
    subtopicId: 'u08-04',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'გამოთვალე: {a}/{b} + {c}/{d}. თუ ჯამი ერთზე მეტია, ჩაწერე შერეული რიცხვით.',
    variables: {
      spec: { kind: 'choice', values: crossAdd },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
    },
    answer: (v) => {
      const [a, b, c, d] = [v.a, v.b, v.c, v.d].map(Number) as number[];
      const l = lcmOf(b!, d!);
      return mixedReduced(a! * (l / b!) + c! * (l / d!), l);
    },
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [a, b, c, d] = ['a', 'b', 'c', 'd'].map((name) => Number(ctx.vars[name])) as number[];
      const l = lcmOf(b!, d!);
      const total = a! * (l / b!) + c! * (l / d!);
      return fourOptions(mixedReduced(total, l), [f(total, l), mixedKept(total, l), mixedReduced(total + 1, l)]);
    },
    explain: ({ vars, answer }) => {
      const [a, b, c, d] = [Number(vars.a), Number(vars.b), Number(vars.c), Number(vars.d)];
      const l = lcmOf(b, d);
      return `საერთო მნიშვნელი ${l}: ${a * (l / b) + c * (l / d)}/${l} = ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u08-q18',
    subtopicId: 'u08-04',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'გამოთვალე: {a}/{b} − {c}/{d}',
    variables: {
      spec: { kind: 'choice', values: crossDiff },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
    },
    answer: (v) => {
      const [a, b, c, d] = [v.a, v.b, v.c, v.d].map(Number) as number[];
      const l = lcmOf(b!, d!);
      return fracText(a! * (l / b!) - c! * (l / d!), l);
    },
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [a, b, c, d] = ['a', 'b', 'c', 'd'].map((name) => Number(ctx.vars[name])) as number[];
      const l = lcmOf(b!, d!);
      const diff = a! * (l / b!) - c! * (l / d!);
      return fourOptions(fracText(diff, l), [f(diff, l + 1), f(diff + 1, l), f(a! + c!, l)]);
    },
    explain: ({ vars, answer }) => {
      const [a, b, c, d] = [Number(vars.a), Number(vars.b), Number(vars.c), Number(vars.d)];
      const l = lcmOf(b, d);
      return `${a}/${b} = ${a * (l / b)}/${l}; ${c}/${d} = ${c * (l / d)}/${l}. სხვაობა ${a * (l / b) - c * (l / d)}/${l} = ${answer}.`;
    },
  }),

  // ───────────── U08.5 — შერეული რიცხვები (სხვადასხვა მნიშვნელი) ─────────────
  bank({
    id: 'g5-u08-q19',
    subtopicId: 'u08-05',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'გამოთვალე: {w1} {n1}/{d1} + {w2} {n2}/{d2}',
    variables: {
      spec: { kind: 'choice', values: mixedCross },
      w1: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      n1: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d1: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      w2: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
      n2: { kind: 'choice', values: (v) => [at(v.spec, 4)] },
      d2: { kind: 'choice', values: (v) => [at(v.spec, 5)] },
    },
    answer: (v) => {
      const [w1, n1, d1, w2, n2, d2] = ['w1', 'n1', 'd1', 'w2', 'n2', 'd2'].map((name) => Number(v[name])) as number[];
      const l = lcmOf(d1!, d2!);
      return mixedReduced((w1! * d1! + n1!) * (l / d1!) + (w2! * d2! + n2!) * (l / d2!), l);
    },
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [w1, n1, d1, w2, n2, d2] = ['w1', 'n1', 'd1', 'w2', 'n2', 'd2'].map((name) => Number(ctx.vars[name])) as number[];
      const l = lcmOf(d1!, d2!);
      const total = (w1! * d1! + n1!) * (l / d1!) + (w2! * d2! + n2!) * (l / d2!);
      return fourOptions(mixedReduced(total, l), [mixedKept(total, l), f(total, l), mixedReduced(total + l, l)]);
    },
    explain: ({ vars, answer }) => {
      const [w1, n1, d1, w2, n2, d2] = ['w1', 'n1', 'd1', 'w2', 'n2', 'd2'].map((name) => Number(vars[name])) as number[];
      const l = lcmOf(d1!, d2!);
      return `არასწორ წილადებად: ${w1! * d1! + n1!}/${d1} და ${w2! * d2! + n2!}/${d2}. საერთო მნიშვნელი ${l}; ჯამი ${(w1! * d1! + n1!) * (l / d1!) + (w2! * d2! + n2!) * (l / d2!)}/${l} = ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u08-q20',
    subtopicId: 'u08-05',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'გამოთვალე: {w1} {n1}/{d1} − {w2} {n2}/{d2}',
    variables: {
      spec: { kind: 'choice', values: mixedCrossDiff },
      w1: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      n1: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d1: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      w2: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
      n2: { kind: 'choice', values: (v) => [at(v.spec, 4)] },
      d2: { kind: 'choice', values: (v) => [at(v.spec, 5)] },
    },
    answer: (v) => {
      const [w1, n1, d1, w2, n2, d2] = ['w1', 'n1', 'd1', 'w2', 'n2', 'd2'].map((name) => Number(v[name])) as number[];
      const l = lcmOf(d1!, d2!);
      return mixedReduced((w1! * d1! + n1!) * (l / d1!) - (w2! * d2! + n2!) * (l / d2!), l);
    },
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [w1, n1, d1, w2, n2, d2] = ['w1', 'n1', 'd1', 'w2', 'n2', 'd2'].map((name) => Number(ctx.vars[name])) as number[];
      const l = lcmOf(d1!, d2!);
      const total = (w1! * d1! + n1!) * (l / d1!) - (w2! * d2! + n2!) * (l / d2!);
      return fourOptions(mixedReduced(total, l), [mixedKept(total, l), f(total, l), mixedReduced(total + l, l)]);
    },
    explain: ({ vars, answer }) => {
      const [w1, n1, d1, w2, n2, d2] = ['w1', 'n1', 'd1', 'w2', 'n2', 'd2'].map((name) => Number(vars[name])) as number[];
      const l = lcmOf(d1!, d2!);
      return `არასწორ წილადებად: ${w1! * d1! + n1!}/${d1} და ${w2! * d2! + n2!}/${d2}; საერთო მნიშვნელი ${l}. პასუხი: ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u08-q21',
    subtopicId: 'u08-05',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'გამოთვალე: {w1} {n1}/{d1} + {w2} {n2}/{d2}',
    variables: {
      spec: { kind: 'choice', values: mixedCross },
      w1: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      n1: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d1: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      w2: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
      n2: { kind: 'choice', values: (v) => [at(v.spec, 4)] },
      d2: { kind: 'choice', values: (v) => [at(v.spec, 5)] },
    },
    answer: (v) => {
      const [w1, n1, d1, w2, n2, d2] = ['w1', 'n1', 'd1', 'w2', 'n2', 'd2'].map((name) => Number(v[name])) as number[];
      const l = lcmOf(d1!, d2!);
      return mixedKept((w1! * d1! + n1!) * (l / d1!) + (w2! * d2! + n2!) * (l / d2!), l);
    },
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [w1, n1, d1, w2, n2, d2] = ['w1', 'n1', 'd1', 'w2', 'n2', 'd2'].map((name) => Number(ctx.vars[name])) as number[];
      const l = lcmOf(d1!, d2!);
      const total = (w1! * d1! + n1!) * (l / d1!) + (w2! * d2! + n2!) * (l / d2!);
      return fourOptions(mixedKept(total, l), [mixedReduced(total, l), f(total, l), mixedKept(total + l, l)]);
    },
    explain: ({ vars, answer }) => {
      const [w1, n1, d1, w2, n2, d2] = ['w1', 'n1', 'd1', 'w2', 'n2', 'd2'].map((name) => Number(vars[name])) as number[];
      const l = lcmOf(d1!, d2!);
      return `საერთო მნიშვნელი ${l}; ჯამი ${(w1! * d1! + n1!) * (l / d1!) + (w2! * d2! + n2!) * (l / d2!)}/${l} = ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u08-q22',
    subtopicId: 'u08-05',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'გამოთვალე: {w1} {n1}/{d1} − {w2} {n2}/{d2}',
    variables: {
      spec: { kind: 'choice', values: mixedCrossDiff },
      w1: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      n1: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d1: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      w2: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
      n2: { kind: 'choice', values: (v) => [at(v.spec, 4)] },
      d2: { kind: 'choice', values: (v) => [at(v.spec, 5)] },
    },
    answer: (v) => {
      const [w1, n1, d1, w2, n2, d2] = ['w1', 'n1', 'd1', 'w2', 'n2', 'd2'].map((name) => Number(v[name])) as number[];
      const l = lcmOf(d1!, d2!);
      return mixedKept((w1! * d1! + n1!) * (l / d1!) - (w2! * d2! + n2!) * (l / d2!), l);
    },
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [w1, n1, d1, w2, n2, d2] = ['w1', 'n1', 'd1', 'w2', 'n2', 'd2'].map((name) => Number(ctx.vars[name])) as number[];
      const l = lcmOf(d1!, d2!);
      const total = (w1! * d1! + n1!) * (l / d1!) - (w2! * d2! + n2!) * (l / d2!);
      return fourOptions(mixedKept(total, l), [mixedReduced(total, l), f(total, l), mixedKept(total + 1, l)]);
    },
    explain: ({ vars, answer }) =>
      `საერთო მნიშვნელზე მოვიყვანეთ და ვაკლებთ: ${vars.w1} ${vars.n1}/${vars.d1} − ${vars.w2} ${vars.n2}/${vars.d2} = ${answer}.`,
  }),

  // ───────────── U08.6 — ჯამისა და სხვაობის შეფასება ─────────────
  bank({
    id: 'g5-u08-q23',
    subtopicId: 'u08-06',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'შეაფასე {a}/{d} + {b}/{d}-ის მნიშვნელობა: რომელ შუალედშია ის?',
    variables: {
      spec: { kind: 'choice', values: sameDenomAdd },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => bucketOf(Number(v.a) + Number(v.b), Number(v.d)),
    optionCount: 3,
    options: () => BUCKETS,
    format: { kind: 'text' },
    explain: ({ vars, answer }) => {
      const total = Number(vars.a) + Number(vars.b);
      const d = Number(vars.d);
      return `ჯამი ${total}/${d}. ნახევარი მნიშვნელისაა ${d / 2}; ${total} ${total * 2 < d ? '<' : '>'} ${d / 2} და ${total} ${total < d ? '<' : '≥'} ${d}. პასუხი: ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u08-q24',
    subtopicId: 'u08-06',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'შეაფასე {a}/{d} − {b}/{d}-ის მნიშვნელობა: რომელ შუალედშია ის?',
    variables: {
      spec: { kind: 'choice', values: sameDenomBigger },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => bucketOf(Number(v.a) - Number(v.b), Number(v.d)),
    optionCount: 3,
    options: () => BUCKETS,
    format: { kind: 'text' },
    explain: ({ vars, answer }) => {
      const diff = Number(vars.a) - Number(vars.b);
      const d = Number(vars.d);
      return `სხვაობა ${diff}/${d}. ნახევარი მნიშვნელია ${d / 2}: ${diff} ${diff * 2 < d ? '<' : '≥'} ${d / 2}. პასუხი: ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u08-q25',
    subtopicId: 'u08-06',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'შეაფასე {w1} {n1}/{d1} + {w2} {n2}/{d2}: ჯამი რომელი მთელი რიცხვის უახლოესია?',
    variables: {
      spec: { kind: 'choice', values: mixedCross },
      w1: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      n1: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d1: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      w2: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
      n2: { kind: 'choice', values: (v) => [at(v.spec, 4)] },
      d2: { kind: 'choice', values: (v) => [at(v.spec, 5)] },
    },
    answer: (v) => {
      const [w1, n1, d1, w2, n2, d2] = ['w1', 'n1', 'd1', 'w2', 'n2', 'd2'].map((name) => Number(v[name])) as number[];
      return Math.round(w1! + n1! / d1! + (w2! + n2! / d2!));
    },
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer + 1, answer - 1, answer + 2, answer + 3].map(String);
    },
    explain: ({ vars, answer }) =>
      `${vars.w1} ${vars.n1}/${vars.d1} ≈ ${(Number(vars.w1) + Number(vars.n1) / Number(vars.d1)).toFixed(2)} და ${vars.w2} ${vars.n2}/${vars.d2} ≈ ${(Number(vars.w2) + Number(vars.n2) / Number(vars.d2)).toFixed(2)}. ჯამი ≈ ${answer}.`,
  }),
  bank({
    id: 'g5-u08-q26',
    subtopicId: 'u08-06',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'შეაფასე {a}/{d} + {b}/{d}: ჯამი 1-ზე მეტია, ტოლია თუ ნაკლები?',
    variables: {
      spec: { kind: 'choice', values: sameDenomAdd },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => relation(Number(v.a) + Number(v.b), Number(v.d)),
    optionCount: 3,
    options: () => RELATION_OPTIONS,
    format: { kind: 'text' },
    explain: ({ vars, answer }) =>
      `ჯამი ${Number(vars.a) + Number(vars.b)}/${vars.d}. მნიშვნელთან შედარებით: ${Number(vars.a) + Number(vars.b)} ${answer} ${vars.d}.`,
  }),

  // ───────────── U08.7 — ჯამებისა და სხვაობების შედარება ─────────────
  bank({
    id: 'g5-u08-q27',
    subtopicId: 'u08-07',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'შეადარე: {a}/{d} + {b}/{d} ___ {c}/{d}',
    variables: {
      spec: { kind: 'choice', values: sameDenomAdd },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => relation(Number(v.a) + Number(v.b), Number(v.c)),
    optionCount: 3,
    options: () => RELATION_OPTIONS,
    format: { kind: 'text' },
    explain: ({ vars, answer }) =>
      `მარცხენა ჯამი ${Number(vars.a) + Number(vars.b)}/${vars.d}; მარჯვნივ ${vars.c}/${vars.d}. პასუხი: ${answer}.`,
  }),
  bank({
    id: 'g5-u08-q28',
    subtopicId: 'u08-07',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'შეადარე: {a}/{d} − {b}/{d} ___ {c}/{d}',
    variables: {
      spec: { kind: 'choice', values: sameDenomDiff },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      c: { kind: 'choice', values: (v) => [Math.max(1, at(v.spec, 0) - at(v.spec, 1))] },
    },
    answer: (v) => relation(Number(v.a) - Number(v.b), Number(v.c)),
    optionCount: 3,
    options: () => RELATION_OPTIONS,
    format: { kind: 'text' },
    explain: ({ vars, answer }) =>
      `მარცხენა სხვაობა ${Number(vars.a) - Number(vars.b)}/${vars.d}; მარჯვნივ ${vars.c}/${vars.d}. პასუხი: ${answer}.`,
  }),
  bank({
    id: 'g5-u08-q29',
    subtopicId: 'u08-07',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'შეადარე: {a}/{b} + {c}/{d} ___ {e}/{f} − {g}/{h}',
    variables: {
      spec: { kind: 'choice', values: mixedComparePool },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
      e: { kind: 'choice', values: (v) => [at(v.spec, 4)] },
      g: { kind: 'choice', values: (v) => [at(v.spec, 5)] },
      f: { kind: 'choice', values: (v) => [at(v.spec, 6)] },
      h: { kind: 'choice', values: (v) => [at(v.spec, 7)] },
    },
    answer: (v) => {
      const [a, b, c, d, e, g, f2, h] = ['a', 'b', 'c', 'd', 'e', 'g', 'f', 'h'].map((n) => Number(v[n])) as number[];
      const left = a! / b! + c! / d!;
      const right = e! / f2! - g! / h!;
      return relation(Math.round(left * 1e6), Math.round(right * 1e6));
    },
    optionCount: 3,
    options: () => RELATION_OPTIONS,
    format: { kind: 'text' },
    explain: ({ vars, answer }) => {
      const [a, b, c, d, e, g, f2, h] = ['a', 'b', 'c', 'd', 'e', 'g', 'f', 'h'].map((n) => Number(vars[n])) as number[];
      return `მარცხნივ ${(a! / b! + c! / d!).toFixed(2)}; მარჯვნივ ${(e! / f2! - g! / h!).toFixed(2)}. პასუხი: ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u08-q30',
    subtopicId: 'u08-07',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'რომელი გამოსახულების მნიშვნელობაა მეტი და რამდენით: {a}/{d} + {e}/{d} თუ {c}/{d} − {b}/{d}?',
    variables: {
      spec: { kind: 'choice', values: sameDenomAdd },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      e: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => {
      const sum = Number(v.a) + Number(v.e);
      const diff = Number(v.c) - Number(v.b);
      if (sum === diff) return 'ტოლია';
      return `${fracText(Math.abs(sum - diff), Number(v.d))}-ით მეტია ${sum > diff ? 'ჯამი' : 'სხვაობა'}`;
    },
    format: { kind: 'text' },
    options: (v) => {
      const sum = Number(v.a) + Number(v.e);
      const diff = Number(v.c) - Number(v.b);
      const d = Number(v.d);
      const right =
        sum === diff
          ? 'ტოლია'
          : `${fracText(Math.abs(sum - diff), d)}-ით მეტია ${sum > diff ? 'ჯამი' : 'სხვაობა'}`;
      return fourOptions(right, [
        `${fracText(Math.abs(sum - diff) + 1, d)}-ით მეტია ${sum > diff ? 'სხვაობა' : 'ჯამი'}`,
        `${fracText(Math.abs(sum - diff), d)}-ით მეტია ${sum > diff ? 'სხვაობა' : 'ჯამი'}`,
        'ტოლია',
      ]);
    },
    explain: ({ vars, answer }) => {
      const sum = Number(vars.a) + Number(vars.e);
      const diff = Number(vars.c) - Number(vars.b);
      return `ჯამი ${sum}/${vars.d}, სხვაობა ${diff}/${vars.d}. პასუხი: ${answer}.`;
    },
  }),

  // ───────────── U08.8 — უცნობი წილადი, განტოლებები ─────────────
  bank({
    id: 'g5-u08-q31',
    subtopicId: 'u08-08',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'იპოვე x: x + {a}/{d} = {b}/{d}',
    variables: {
      spec: { kind: 'choice', values: sameDenomDiff.map((row) => {
        const [b, a, d] = rowNumbers(row);
        return `${a}|${b}|${d}`;
      }) },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => fracText(Number(v.b) - Number(v.a), Number(v.d)),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [a, b, d] = [Number(ctx.vars.a), Number(ctx.vars.b), Number(ctx.vars.d)];
      return fourOptions(fracText(b - a, d), [f(a + b, d), f(b - a, d + d), f(a, d)]);
    },
    explain: ({ vars, answer }) =>
      `x = ${vars.b}/${vars.d} − ${vars.a}/${vars.d} = ${Number(vars.b) - Number(vars.a)}/${vars.d} = ${answer}.`,
  }),
  bank({
    id: 'g5-u08-q32',
    subtopicId: 'u08-08',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'იპოვე x: x − {a}/{d} = {b}/{d}',
    variables: {
      spec: { kind: 'choice', values: sameDenomAdd },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => fracText(Number(v.a) + Number(v.b), Number(v.d)),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [a, b, d] = [Number(ctx.vars.a), Number(ctx.vars.b), Number(ctx.vars.d)];
      return fourOptions(fracText(a + b, d), [f(Math.abs(b - a), d), f(a + b, d + d), f(a, d)]);
    },
    explain: ({ vars, answer }) =>
      `x = ${vars.b}/${vars.d} + ${vars.a}/${vars.d} = ${Number(vars.a) + Number(vars.b)}/${vars.d} = ${answer}.`,
  }),
  bank({
    id: 'g5-u08-q33',
    subtopicId: 'u08-08',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'იპოვე x: {a}/{d} − x = {b}/{d}',
    variables: {
      spec: { kind: 'choice', values: sameDenomBigger },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => fracText(Number(v.a) - Number(v.b), Number(v.d)),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [a, b, d] = [Number(ctx.vars.a), Number(ctx.vars.b), Number(ctx.vars.d)];
      return fourOptions(fracText(a - b, d), [f(a + b, d), f(b, d), f(a - b, d + d)]);
    },
    explain: ({ vars, answer }) =>
      `x = ${vars.a}/${vars.d} − ${vars.b}/${vars.d} = ${Number(vars.a) - Number(vars.b)}/${vars.d} = ${answer}.`,
  }),
  bank({
    id: 'g5-u08-q34',
    subtopicId: 'u08-08',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'იპოვე x: x + {a}/{b} = {c}/{d}',
    variables: {
      spec: { kind: 'choice', values: crossAdd },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
    },
    answer: (v) => {
      const [a, b, c, d] = ['a', 'b', 'c', 'd'].map((n) => Number(v[n])) as number[];
      const l = lcmOf(b!, d!);
      return fracText(c! * (l / d!) - a! * (l / b!), l);
    },
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [a, b, c, d] = ['a', 'b', 'c', 'd'].map((n) => Number(ctx.vars[n])) as number[];
      const l = lcmOf(b!, d!);
      const right = c! * (l / d!) - a! * (l / b!);
      return fourOptions(fracText(right, l), [f(right, l + 1), f(right + 1, l), f(a! + c!, l)]);
    },
    explain: ({ vars, answer }) => {
      const [a, b, c, d] = [Number(vars.a), Number(vars.b), Number(vars.c), Number(vars.d)];
      const l = lcmOf(b, d);
      return `x = ${vars.c}/${vars.d} − ${vars.a}/${vars.b}; საერთო მნიშვნელი ${l}: ${c * (l / d)}/${l} − ${a * (l / b)}/${l} = ${answer}.`;
    },
  }),

  // ───────────── U08.9 — ამოცანები წილადებზე ─────────────
  bank({
    id: 'g5-u08-q35',
    subtopicId: 'u08-09',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'ნინომ ტორტის {a}/{d} შეჭამა, ხოლო ლუკამ — {b}/{d}. ტორტის რა ნაწილი შეჭამეს მათ ერთად?',
    variables: {
      spec: { kind: 'choice', values: sameDenomAdd },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => fracText(Number(v.a) + Number(v.b), Number(v.d)),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [a, b, d] = [Number(ctx.vars.a), Number(ctx.vars.b), Number(ctx.vars.d)];
      return fourOptions(fracText(a + b, d), [f(Math.abs(a - b), d), f(a + b, d + d), f(a * b, d)]);
    },
    explain: ({ vars, answer }) =>
      `ერთად: ${vars.a}/${vars.d} + ${vars.b}/${vars.d} = ${Number(vars.a) + Number(vars.b)}/${vars.d} = ${answer}.`,
  }),
  bank({
    id: 'g5-u08-q36',
    subtopicId: 'u08-09',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'წყლის ავზში {a}/{d} იყო წყალი. გამოიყენეს {b}/{d} ნაწილი. ავზის რა ნაწილი დარჩა წყლით სავსე?',
    variables: {
      spec: { kind: 'choice', values: sameDenomBigger },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => fracText(Number(v.a) - Number(v.b), Number(v.d)),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [a, b, d] = [Number(ctx.vars.a), Number(ctx.vars.b), Number(ctx.vars.d)];
      return fourOptions(fracText(a - b, d), [f(a + b, d), f(a, d), f(a - b, d + d)]);
    },
    explain: ({ vars, answer }) =>
      `${vars.a}/${vars.d} − ${vars.b}/${vars.d} = ${Number(vars.a) - Number(vars.b)}/${vars.d} = ${answer}.`,
  }),
  bank({
    id: 'g5-u08-q37',
    subtopicId: 'u08-09',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ბილიკი {w} {n}/{d} კმ სიგრძისაა. მარიამმა გაიარა {k} {m}/{d} კმ. რამდენი კილომეტრი დარჩა გასავლელი?',
    variables: {
      spec: { kind: 'choice', values: mixedSameDiff },
      w: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      n: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      k: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
      m: { kind: 'choice', values: (v) => [at(v.spec, 4)] },
    },
    answer: (v) => {
      const d = Number(v.d);
      return mixedReduced(Number(v.w) * d + Number(v.n) - (Number(v.k) * d + Number(v.m)), d);
    },
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [w, n, d, k, m] = ['w', 'n', 'd', 'k', 'm'].map((name) => Number(ctx.vars[name])) as number[];
      const left = w! * d! + n! - (k! * d! + m!);
      return fourOptions(mixedReduced(left, d!), [mixedKept(left, d!), f(left, d!), mixedReduced(left + d!, d!)]);
    },
    explain: ({ vars, answer }) => {
      const d = Number(vars.d);
      const left = Number(vars.w) * d + Number(vars.n) - (Number(vars.k) * d + Number(vars.m));
      return `სულ ${Number(vars.w) * d + Number(vars.n)}/${d}, გაიარა ${Number(vars.k) * d + Number(vars.m)}/${d}. დარჩა ${left}/${d} = ${answer} კმ.`;
    },
  }),
  bank({
    id: 'g5-u08-q38',
    subtopicId: 'u08-09',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ერთ დღეს მოსწავლემ წიგნის {a}/{d} წაიკითხა, მეორე დღეს — {b}/{d}. წიგნის რა ნაწილი წაიკითხა სულ და რა ნაწილი დარჩა?',
    variables: {
      spec: { kind: 'choice', values: sameDenomAdd.filter((row) => { const [a, b, d] = rowNumbers(row); return a! + b! < d!; }) },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => `წაიკითხა ${Number(v.a) + Number(v.b)}/${v.d}, დარჩა ${Number(v.d) - Number(v.a) - Number(v.b)}/${v.d}`,
    format: { kind: 'text' },
    options: (v) => {
      const d = Number(v.d);
      const read = Number(v.a) + Number(v.b);
      return fourOptions(`წაიკითხა ${read}/${d}, დარჩა ${d - read}/${d}`, [
        `წაიკითხა ${read}/${d}, დარჩა ${read}/${d}`,
        `წაიკითხა ${d - read}/${d}, დარჩა ${read}/${d}`,
        `წაიკითხა ${read}/${d + d}, დარჩა ${d - read}/${d}`,
      ]);
    },
    explain: ({ vars }) =>
      `სულ: ${vars.a}/${vars.d} + ${vars.b}/${vars.d} = ${Number(vars.a) + Number(vars.b)}/${vars.d}. დარჩა 1 − ${Number(vars.a) + Number(vars.b)}/${vars.d} = ${Number(vars.d) - Number(vars.a) - Number(vars.b)}/${vars.d}.`,
  }),
];
