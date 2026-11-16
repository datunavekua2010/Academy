import type { QuestionTemplate } from './types';
import { bank, fourOptions, fracText, mixedReduced, rowNumbers } from './g5-helpers';

/**
 * Grade V — Unit 10: წილადების გაყოფა (dividing fractions).
 *
 * Converted from the academy's `U10` bank (5 subtopics × 6 questions):
 * a fraction divided by a whole number, a whole number divided by a fraction,
 * two fractions, mixed numbers, and word problems.
 *
 * The bank's phrasing is kept: "რამდენი ⅛-მეტრიანი ნაჭერი გამოვა?" — a
 * measurement question, so the answer is a count, not a fraction.
 */

export const G5_U10_SUBTOPICS = ['u10-01', 'u10-02', 'u10-03', 'u10-04', 'u10-05'] as const;

export type G5U10SubtopicId = (typeof G5_U10_SUBTOPICS)[number];

const TOPIC = 'g5-divide-fractions';

const f = (n: number, d: number): string => `${n}/${d}`;
const at = (row: unknown, index: number): number => rowNumbers(row)[index]!;

const pool = (build: (add: (row: string) => void) => void): string[] => {
  const rows: string[] = [];
  build((row) => {
    if (!rows.includes(row)) rows.push(row);
  });
  return rows;
};

/** `a|d|k`: fraction ÷ whole number. */
const fracByWhole = pool((add) => {
  for (const d of [2, 3, 4, 5, 6, 8, 10, 12])
    for (let a = 1; a < d; a += 1) for (let k = 2; k <= 9; k += 1) add(`${a}|${d}|${k}`);
});

/** `k|a|d`: whole number ÷ unit fraction (answer is a whole count). */
const wholeByUnit = pool((add) => {
  for (let k = 2; k <= 12; k += 1) for (const d of [2, 3, 4, 5, 6, 8, 10, 12]) add(`${k}|1|${d}`);
});

/** `k|a|d`: whole number ÷ fraction, answer a whole number. */
const wholeByFrac = pool((add) => {
  for (let k = 2; k <= 12; k += 1)
    for (const d of [2, 3, 4, 5, 6, 8]) for (let a = 2; a < d; a += 1) if ((k * d) % a === 0) add(`${k}|${a}|${d}`);
});

/** `a|b|c|d`: fraction ÷ fraction, answer a whole number. */
const fracByFrac = pool((add) => {
  for (const b of [2, 3, 4, 5, 6, 8, 10, 12])
    for (const d of [2, 3, 4, 5, 6, 8, 10, 12])
      for (let a = 1; a < b; a += 1)
        for (let c = 1; c < d; c += 1) if ((a * d) % (b * c) === 0) add(`${a}|${b}|${c}|${d}`);
});

/** `w1|n1|d1|w2|n2|d2`: mixed ÷ mixed or mixed ÷ fraction, answer a whole number. */
const mixedDivision = pool((add) => {
  for (const d1 of [2, 3, 4, 5, 6])
    for (const d2 of [2, 3, 4, 5, 6]) {
      for (let w1 = 1; w1 <= 4; w1 += 1)
        for (let n1 = 0; n1 < d1; n1 += 1)
          for (let n2 = 1; n2 < d2; n2 += 1) {
            const top = (w1 * d1 + n1) * d2;
            if (top % (d1 * n2) === 0) add(`${w1}|${n1}|${d1}|1|${n2}|${d2}`);
          }
    }
});

export const G5_U10_TEMPLATES: QuestionTemplate[] = [
  // ───────────── U10.1 — წილადი მთელ რიცხვზე ─────────────
  bank({
    id: 'g5-u10-q01',
    subtopicId: 'u10-01',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'გამოთვალე: {a}/{d} ÷ {k}',
    variables: {
      spec: { kind: 'choice', values: fracByWhole },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      k: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => fracText(Number(v.a), Number(v.d) * Number(v.k)),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [a, d, k] = ['a', 'd', 'k'].map((n) => Number(ctx.vars[n])) as number[];
      return fourOptions(fracText(a!, d! * k!), [
        fracText(a! * k!, d!),
        f(a!, d! + k!),
        fracText(a!, d! * k! + 1),
      ]);
    },
    explain: ({ vars, answer }) =>
      `წილადის მთელ რიცხვზე გაყოფისას მნიშვნელი მთელ რიცხვზე მრავლდება: ${vars.d} × ${vars.k} = ${Number(vars.d) * Number(vars.k)}. პასუხი: ${answer}.`,
  }),
  bank({
    id: 'g5-u10-q02',
    subtopicId: 'u10-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე: {a}/{d} ÷ {k}',
    variables: {
      spec: { kind: 'choice', values: fracByWhole },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      k: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => fracText(Number(v.a), Number(v.d) * Number(v.k)),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [a, d, k] = ['a', 'd', 'k'].map((n) => Number(ctx.vars[n])) as number[];
      return fourOptions(fracText(a!, d! * k!), [
        fracText(a! * k!, d!),
        fracText(a!, d! + k!),
        f(a! + 1, d! * k!),
      ]);
    },
    explain: ({ vars, answer }) =>
      `${vars.a}/${vars.d} ÷ ${vars.k} = ${vars.a}/(${vars.d} × ${vars.k}) = ${answer}, შეკვეცის შემდეგ.`,
  }),
  bank({
    id: 'g5-u10-q03',
    subtopicId: 'u10-01',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'გამოთვალე: {k} ÷ {a}/{d}',
    variables: {
      spec: { kind: 'choice', values: wholeByUnit },
      k: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => Number(v.k) * Number(v.d),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer + 1, answer - 1 > 0 ? answer - 1 : answer + 2, answer * 2, answer + 3].map(String);
    },
    explain: ({ vars, answer }) =>
      `მთელი რიცხვის წილადზე გაყოფა — ეს არის პასუხი კითხვაზე „რამდენი ${vars.a}/${vars.d} ეტევა ${vars.k}-ში": ${vars.k} × ${vars.d} = ${answer}.`,
  }),

  // ───────────── U10.2 — მთელი რიცხვი წილადზე ─────────────
  bank({
    id: 'g5-u10-q04',
    subtopicId: 'u10-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე: {k} ÷ {a}/{d}',
    variables: {
      spec: { kind: 'choice', values: wholeByFrac },
      k: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => (Number(v.k) * Number(v.d)) / Number(v.a),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer + 1, answer + 2, answer * 2, answer - 1 > 0 ? answer - 1 : answer + 3].map(String);
    },
    explain: ({ vars, answer }) =>
      `${vars.k} ÷ ${vars.a}/${vars.d} = ${vars.k} × ${vars.d}/${vars.a} = ${Number(vars.k) * Number(vars.d)}/${vars.a} = ${answer}.`,
  }),
  bank({
    id: 'g5-u10-q05',
    subtopicId: 'u10-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე: {k} ÷ {a}/{d}',
    variables: {
      spec: { kind: 'choice', values: wholeByUnit },
      k: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => Number(v.k) * Number(v.d),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer + 1, answer - 1 > 0 ? answer - 1 : answer + 2, answer * 2, answer + 2].map(String);
    },
    explain: ({ vars, answer }) =>
      `${vars.k} ÷ 1/${vars.d} — ეს ნიშნავს, რამდენი 1/${vars.d} არის ${vars.k}-ში: ${vars.k} × ${vars.d} = ${answer}.`,
  }),

  // ───────────── U10.3 — ორი წილადის გაყოფა ─────────────
  bank({
    id: 'g5-u10-q06',
    subtopicId: 'u10-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე: {a}/{b} ÷ {c}/{d}',
    variables: {
      spec: { kind: 'choice', values: fracByFrac },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
    },
    answer: (v) => (Number(v.a) * Number(v.d)) / (Number(v.b) * Number(v.c)),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer + 1, answer + 2, answer * 2, answer - 1 > 0 ? answer - 1 : answer + 3].map(String);
    },
    explain: ({ vars, answer }) =>
      `გაყოფა გამრავლებად იქცევა შებრუნებულზე: ${vars.a}/${vars.b} × ${vars.d}/${vars.c} = ${Number(vars.a) * Number(vars.d)}/${Number(vars.b) * Number(vars.c)} = ${answer}.`,
  }),
  bank({
    id: 'g5-u10-q07',
    subtopicId: 'u10-03',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'გამოთვალე: {a}/{b} ÷ {c}/{d}. პასუხი ჩაწერე წილადის სახით.',
    variables: {
      spec: { kind: 'choice', values: fracByFrac },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
    },
    answer: (v) => fracText(Number(v.a) * Number(v.d), Number(v.b) * Number(v.c)),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [a, b, c, d] = ['a', 'b', 'c', 'd'].map((n) => Number(ctx.vars[n])) as number[];
      return fourOptions(fracText(a! * d!, b! * c!), [
        fracText(a! * c!, b! * d!),
        fracText(a! * d! + 1, b! * c!),
        f(a! * d!, b! + c!),
      ]);
    },
    explain: ({ vars, answer }) =>
      `${vars.a}/${vars.b} ÷ ${vars.c}/${vars.d} = ${vars.a}/${vars.b} × ${vars.d}/${vars.c} = ${answer}.`,
  }),
  bank({
    id: 'g5-u10-q08',
    subtopicId: 'u10-03',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'გამოთვალე: {a}/{b} ÷ {c}/{d}',
    variables: {
      spec: { kind: 'choice', values: fracByFrac },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
    },
    answer: (v) => fracText(Number(v.a) * Number(v.d), Number(v.b) * Number(v.c)),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const [a, b, c, d] = ['a', 'b', 'c', 'd'].map((n) => Number(ctx.vars[n])) as number[];
      return fourOptions(fracText(a! * d!, b! * c!), [
        fracText(a! * d!, b! * c! + 1),
        f(a! + c!, b! + d!),
        fracText(a! * c!, b! * d!),
      ]);
    },
    explain: ({ answer }) =>
      `შებრუნებულზე გამრავლებით: ${answer}.`,
  }),

  // ───────────── U10.4 — შერეული რიცხვების გაყოფა ─────────────
  bank({
    id: 'g5-u10-q09',
    subtopicId: 'u10-04',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'გამოთვალე: {w} {n}/{d} ÷ 1 {n2}/{d2}',
    variables: {
      spec: { kind: 'choice', values: mixedDivision },
      w: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      n: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      n2: { kind: 'choice', values: (v) => [at(v.spec, 4)] },
      d2: { kind: 'choice', values: (v) => [at(v.spec, 5)] },
    },
    answer: (v) => ((Number(v.w) * Number(v.d) + Number(v.n)) * Number(v.d2)) / (Number(v.d) * Number(v.n2)),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer + 1, answer + 2, answer * 2, answer - 1 > 0 ? answer - 1 : answer + 3].map(String);
    },
    explain: ({ vars, answer }) => {
      const w = Number(vars.w);
      const n = Number(vars.n);
      const d = Number(vars.d);
      const d2 = Number(vars.d2);
      const n2 = Number(vars.n2);
      return `${w} ${n}/${d} = ${w * d + n}/${d}; 1 ${n2}/${d2} = ${d2 + n2}/${d2}. ${w * d + n}/${d} ÷ ${d2 + n2}/${d2} = ${((w * d + n) * d2)}/${d * (d2 + n2)} = ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u10-q10',
    subtopicId: 'u10-04',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'გამოთვალე: {w} {n}/{d} ÷ {n2}/{d2}',
    variables: {
      spec: { kind: 'choice', values: mixedDivision },
      w: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      n: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      n2: { kind: 'choice', values: (v) => [at(v.spec, 4)] },
      d2: { kind: 'choice', values: (v) => [at(v.spec, 5)] },
    },
    answer: (v) => ((Number(v.w) * Number(v.d) + Number(v.n)) * Number(v.d2)) / (Number(v.d) * Number(v.n2)),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer + 1, answer + 2, answer * 2, answer + 3].map(String);
    },
    explain: ({ vars, answer }) => {
      const w = Number(vars.w);
      const n = Number(vars.n);
      const d = Number(vars.d);
      const d2 = Number(vars.d2);
      const n2 = Number(vars.n2);
      return `${w} ${n}/${d} = ${w * d + n}/${d}. ${w * d + n}/${d} × ${d2}/${n2} = ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u10-q11',
    subtopicId: 'u10-04',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'გამოთვალე: {w} {n}/{d} ÷ 1 {n2}/{d2}',
    variables: {
      spec: { kind: 'choice', values: mixedDivision },
      w: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      n: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      n2: { kind: 'choice', values: (v) => [at(v.spec, 4)] },
      d2: { kind: 'choice', values: (v) => [at(v.spec, 5)] },
    },
    answer: (v) => ((Number(v.w) * Number(v.d) + Number(v.n)) * Number(v.d2)) / (Number(v.d) * Number(v.n2)),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer + 1, answer - 1 > 0 ? answer - 1 : answer + 2, answer * 2, answer + 2].map(String);
    },
    explain: ({ vars, answer }) => {
      const w = Number(vars.w);
      const n = Number(vars.n);
      const d = Number(vars.d);
      const d2 = Number(vars.d2);
      const n2 = Number(vars.n2);
      return `ორივე შერეული რიცხვი არაწესიერ წილადად: ${w * d + n}/${d} და ${d2 + n2}/${d2}. პასუხი: ${answer}.`;
    },
  }),

  // ───────────── U10.5 — ამოცანები ─────────────
  bank({
    id: 'g5-u10-q12',
    subtopicId: 'u10-05',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ლენტის სიგრძეა {a}/{d} მ. რამდენი 1/{d2}-მეტრიანი ნაჭერი გამოვა ამ ლენტიდან?',
    variables: {
      spec: { kind: 'choice', values: fracByFrac },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d2: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
    },
    answer: (v) => (Number(v.a) * Number(v.d2)) / Number(v.d),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer + 1, answer - 1 > 0 ? answer - 1 : answer + 2, answer * 2, answer + 2].map(String);
    },
    explain: ({ vars, answer }) =>
      `${vars.a}/${vars.d} ÷ 1/${vars.d2} = ${vars.a}/${vars.d} × ${vars.d2} = ${answer} ნაჭერი.`,
  }),
  bank({
    id: 'g5-u10-q13',
    subtopicId: 'u10-05',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ჭურჭელში {w} {n}/{d} ლ წვენია. თუ თითო ჭიქაში {a}/{b} ლ ეტევა, რამდენი ჭიქა გაივსება?',
    variables: {
      spec: { kind: 'choice', values: mixedDivision },
      w: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      n: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 4)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 5)] },
    },
    answer: (v) => ((Number(v.w) * Number(v.d) + Number(v.n)) * Number(v.b)) / (Number(v.d) * Number(v.a)),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer + 1, answer - 1 > 0 ? answer - 1 : answer + 2, answer + 2, answer * 2].map(String);
    },
    explain: ({ vars, answer }) => {
      const w = Number(vars.w);
      const n = Number(vars.n);
      const d = Number(vars.d);
      return `${w} ${n}/${d} = ${w * d + n}/${d}; ${w * d + n}/${d} ÷ ${vars.a}/${vars.b} = ${answer} ჭიქა.`;
    },
  }),
  bank({
    id: 'g5-u10-q14',
    subtopicId: 'u10-05',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ნამცხვრის {a}/{b} ნაწილი გვაქვს. თუ თითო ულუფა {c}/{d} ნაწილია, რამდენი ულუფა გამოვა?',
    variables: {
      spec: { kind: 'choice', values: fracByFrac },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      c: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 3)] },
    },
    answer: (v) => (Number(v.a) * Number(v.d)) / (Number(v.b) * Number(v.c)),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer + 1, answer + 2, answer * 2, answer - 1 > 0 ? answer - 1 : answer + 3].map(String);
    },
    explain: ({ vars, answer }) =>
      `${vars.a}/${vars.b} ÷ ${vars.c}/${vars.d} = ${Number(vars.a) * Number(vars.d)}/${Number(vars.b) * Number(vars.c)} = ${answer} ულუფა.`,
  }),
  bank({
    id: 'g5-u10-q15',
    subtopicId: 'u10-05',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'თოკის სიგრძეა {w} {n}/{d} მ. რამდენი 1/{d2}-მეტრიანი ნაჭერი გამოვა?',
    variables: {
      spec: { kind: 'choice', values: mixedDivision },
      w: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      n: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      n2: { kind: 'choice', values: (v) => [at(v.spec, 4)] },
      d2: { kind: 'choice', values: (v) => [at(v.spec, 5)] },
    },
    answer: (v) => {
      const [w, n, d, n2, d2] = ['w', 'n', 'd', 'n2', 'd2'].map((name) => Number(v[name])) as number[];
      return ((w! * d! + n!) * d2!) / (d! * n2!);
    },
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer + 1, answer + 2, answer * 2, answer - 1 > 0 ? answer - 1 : answer + 3].map(String);
    },
    explain: ({ vars, answer }) => {
      const w = Number(vars.w);
      const n = Number(vars.n);
      const d = Number(vars.d);
      return `${w} ${n}/${d} = ${w * d + n}/${d}. ${w * d + n}/${d} ÷ ${vars.n2}/${vars.d2} = ${answer} ნაჭერი.`;
    },
  }),
  bank({
    id: 'g5-u10-q16',
    subtopicId: 'u10-05',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ნაჭრის სიგრძეა {w} {n}/{d} მ. იგი დაჭრეს {a}/{b}-მეტრიან ნაწილებად. რამდენი ნაწილი გამოვა?',
    variables: {
      spec: { kind: 'choice', values: mixedDivision },
      w: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      n: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 4)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 5)] },
    },
    answer: (v) => ((Number(v.w) * Number(v.d) + Number(v.n)) * Number(v.b)) / (Number(v.d) * Number(v.a)),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer + 1, answer + 2, answer * 2, answer - 1 > 0 ? answer - 1 : answer + 3].map(String);
    },
    explain: ({ vars, answer }) =>
      `${vars.w} ${vars.n}/${vars.d} ÷ ${vars.a}/${vars.b} = ${answer} ნაწილი.`,
  }),
];

void mixedReduced;
void f;
