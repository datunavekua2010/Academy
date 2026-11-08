import { defineTemplate } from './types';

/**
 * SAMPLE templates only.
 *
 * These exist so the generator can be exercised end to end and so the expected
 * shape is obvious. They are deliberately few — the real curriculum templates
 * are supplied by the academy and can be dropped into `catalog.ts` without
 * touching the UI, the session engine or the scoring engine.
 *
 * Each one demonstrates a different capability of the template model:
 *   • plain integer ranges
 *   • dependent bounds (a divisor drawn from the dividend, so the result is whole)
 *   • constraints (answer must stay positive)
 *   • choice variables (operator, unit names)
 *   • text answers (fractions)
 *   • decimal answers with rounding
 *   • custom, pedagogically sensible distractors
 */

export const SAMPLE_TEMPLATES = [
  // ---------------------------------------------------------------- grade I
  defineTemplate({
    id: 'g1-add-20',
    grade: 1,
    topicId: 'shekreba',
    subtopicId: 'ocamde',
    prompt: '{a} + {b} = ?',
    hint: 'შეკრიბე ორი რიცხვი.',
    // 0…20 both ways: about 200 distinct sums, enough for a full 35-answer run
    // with no repeats. `+` and `−` share the subtopic so the wording varies too.
    variables: {
      a: { kind: 'int', min: 1, max: 19 },
      b: { kind: 'int', min: 1, max: 19 },
    },
    constraints: [
      { test: (v) => Number(v.a) + Number(v.b) <= 20, note: 'ჯამი 20-ს არ აღემატებოდეს' },
    ],
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0 },
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${answer}.`,
    distractors: ({ vars, answer }) => {
      const value = Number(answer);
      return [value + 1, value - 1, value + 2, value - 2, value + 10, Number(vars.a) + Number(vars.b) + 1];
    },
  }),

  defineTemplate({
    id: 'g1-sub-20',
    grade: 1,
    topicId: 'shekreba',
    subtopicId: 'ocamde',
    prompt: '{a} − {b} = ?',
    hint: 'გამოაკელი მეორე რიცხვი.',
    variables: {
      a: { kind: 'int', min: 3, max: 20 },
      b: { kind: 'int', min: 1, max: (v) => Number(v.a) - 1 }, // b < a, so no negatives
    },
    constraints: [{ test: (v) => Number(v.a) - Number(v.b) >= 0, note: 'პასუხი უარყოფითი არ იყოს' }],
    answer: (v) => Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0 },
    explanation: ({ vars, answer }) => `${vars.a} − ${vars.b} = ${answer}.`,
    distractors: ({ answer }) => {
      const value = Number(answer);
      return [value + 1, value - 1, value + 2, value + 10];
    },
  }),

  defineTemplate({
    id: 'g1-compare',
    grade: 1,
    topicId: 'ricxvebi',
    subtopicId: 'shedareba',
    prompt: 'რომელი რიცხვია მეტი: {a} თუ {b}?',
    variables: {
      a: { kind: 'int', min: 1, max: 19 },
      b: { kind: 'int', min: 1, max: 19 },
    },
    constraints: [{ test: (v) => v.a !== v.b, note: 'რიცხვები განსხვავებული იყოს' }],
    answer: (v) => (Number(v.a) > Number(v.b) ? Number(v.a) : Number(v.b)),
    format: { kind: 'integer' },
    explanation: ({ answer }) =>
      `${answer} მეტია, რადგან ${answer} უფრო შორს არის დათვლისას.`,
    distractors: ({ vars, answer }) => {
      const other = Number(vars.a) === Number(answer) ? Number(vars.b) : Number(vars.a);
      const value = Number(answer);
      return [other, value + 1, value - 1, value + 2, value - 2];
    },
  }),

  // --------------------------------------------------------------- grade II
  defineTemplate({
    id: 'g2-times-table',
    grade: 2,
    topicId: 'gamravleba',
    subtopicId: 'cxrili',
    prompt: '{a} × {b} = ?',
    variables: {
      a: { kind: 'int', min: 2, max: 5 },
      b: { kind: 'int', min: 2, max: 9 },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: { kind: 'integer', min: 0 },
    explanation: ({ vars, answer }) =>
      `${vars.a} × ${vars.b} = ${answer}: ${vars.a} ჯგუფი ${vars.b}-ად.`,
    distractors: ({ vars }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      return [a * b + a, a * b - a, a * b + b, a * b - 1, Math.round(a * b * 0.5)];
    },
  }),

  defineTemplate({
    id: 'g2-meter-cm',
    grade: 2,
    topicId: 'gazomva',
    subtopicId: 'sigrze',
    prompt: '{m} მ და {cm} სმ სულ რამდენი სანტიმეტრია?',
    variables: {
      m: { kind: 'int', min: 1, max: 9 },
      cm: { kind: 'choice', values: [0, 5, 10, 15, 20, 25, 30, 40, 50, 60] },
    },
    answer: (v) => Number(v.m) * 100 + Number(v.cm),
    format: { kind: 'integer', min: 0 },
    explanation: ({ vars, answer }) =>
      `1 მ = 100 სმ, ამიტომ ${vars.m} × 100 + ${vars.cm} = ${answer} სმ.`,
    distractors: ({ vars, answer }) => [
      Number(vars.m) * 10 + Number(vars.cm),
      Number(answer) + 10,
      Number(answer) - 10,
      Number(vars.m) + Number(vars.cm),
    ],
  }),

  // -------------------------------------------------------------- grade III
  defineTemplate({
    id: 'g3-divide-exact',
    grade: 3,
    topicId: 'gamravleba-gayofa',
    subtopicId: 'gayofa',
    prompt: '{a} ÷ {b} = ?',
    variables: {
      // Draw the divisor first, then build a dividend that divides exactly.
      b: { kind: 'int', min: 2, max: 9 },
      q: { kind: 'int', min: 2, max: 9 },
      a: { kind: 'int', min: (v) => Number(v.b) * Number(v.q), max: (v) => Number(v.b) * Number(v.q) },
    },
    answer: (v) => Number(v.a) / Number(v.b),
    format: { kind: 'integer', min: 0 },
    explanation: ({ vars, answer }) =>
      `${vars.b} × ${answer} = ${vars.a}, ამიტომ ${vars.a} ÷ ${vars.b} = ${answer}.`,
    distractors: ({ answer, vars }) => {
      const value = Number(answer);
      const b = Number(vars.b);
      return [value + 1, value - 1, value + b, value * b];
    },
  }),

  defineTemplate({
    id: 'g3-perimeter-rect',
    grade: 3,
    topicId: 'perimetri',
    subtopicId: 'perim',
    prompt: 'მართკუთხედის გვერდებია {w} სმ და {h} სმ. პერიმეტრი?',
    hint: 'P = 2 × (სიგრძე + სიგანე)',
    variables: {
      w: { kind: 'int', min: 2, max: 12 },
      h: { kind: 'int', min: 2, max: 12 },
    },
    constraints: [{ test: (v) => v.w !== v.h, note: 'გვერდები განსხვავებული იყოს' }],
    answer: (v) => 2 * (Number(v.w) + Number(v.h)),
    format: { kind: 'integer', min: 0 },
    explanation: ({ vars, answer }) =>
      `P = 2 × (${vars.w} + ${vars.h}) = ${answer} სმ.`,
    distractors: ({ vars }) => {
      const w = Number(vars.w);
      const h = Number(vars.h);
      return [w + h, w * h, 2 * w + h, 2 * (w + h) + 2];
    },
  }),

  // --------------------------------------------------------------- grade IV
  defineTemplate({
    id: 'g4-round-ten',
    grade: 4,
    topicId: 'didi-ricxvebi',
    subtopicId: 'damrgvaleba',
    prompt: 'დაამრგვალე {n} უახლოეს ათეულამდე.',
    variables: {
      n: { kind: 'int', min: 11, max: 994 },
    },
    constraints: [
      // Skip exact multiples of ten: "round 40 to ten" is a pointless question.
      { test: (v) => Number(v.n) % 10 !== 0, note: 'რიცხვი ზუსტი ათეული არ იყოს' },
    ],
    answer: (v) => Math.round(Number(v.n) / 10) * 10,
    format: { kind: 'integer', min: 0 },
    explanation: ({ vars, answer }) =>
      `${vars.n}-ის უახლოესი ათეულია ${answer}.`,
    distractors: ({ vars, answer }) => {
      const n = Number(vars.n);
      const value = Number(answer);
      return [
        value + 10,
        value - 10,
        value + 20,
        Math.floor(n / 10) * 10,
        Math.ceil(n / 10) * 10,
        value - 20,
      ];
    },
  }),

  defineTemplate({
    id: 'g4-fraction-of',
    grade: 4,
    topicId: 'wiladebi',
    subtopicId: 'wili',
    prompt: 'რა არის {n}-ის 1/{d}?',
    variables: {
      d: { kind: 'int', min: 2, max: 6 },
      q: { kind: 'int', min: 2, max: 9 },
      n: { kind: 'int', min: (v) => Number(v.d) * Number(v.q), max: (v) => Number(v.d) * Number(v.q) },
    },
    answer: (v) => Number(v.n) / Number(v.d),
    format: { kind: 'integer', min: 0 },
    explanation: ({ vars, answer }) =>
      `${vars.n} ÷ ${vars.d} = ${answer}.`,
    distractors: ({ vars, answer }) => {
      const n = Number(vars.n);
      return [Number(answer) * 2, n - Number(answer), Number(vars.d), Number(answer) + 1];
    },
  }),

  // ---------------------------------------------------------------- grade V
  defineTemplate({
    id: 'g5-add-fractions-same-denominator',
    grade: 5,
    topicId: 'wiladebi',
    subtopicId: 'mniSvneli',
    prompt: '{a}/{d} + {b}/{d} = ?',
    hint: 'მნიშვნელები ერთი და იგივეა.',
    variables: {
      d: { kind: 'int', min: 4, max: 10 },
      a: { kind: 'int', min: 1, max: (v) => Number(v.d) - 1 },
      b: { kind: 'int', min: 1, max: (v) => Number(v.d) - Number(v.a) },
    },
    constraints: [
      // Keep the sum below a whole (a/d + b/d <= 1) so the answer stays a fraction.
      { test: (v) => Number(v.a) + Number(v.b) <= Number(v.d), note: 'ჯამი არ აღემატებოდეს ერთს' },
      { test: (v) => Number(v.a) + Number(v.b) > 0 && Number(v.b) > 0, note: 'მრიცხველი დადებითი იყოს' },
    ],
    answer: (v) => {
      const numerator = Number(v.a) + Number(v.b);
      const denominator = Number(v.d);
      const g = gcd(numerator, denominator);
      if (numerator === denominator) return '1';
      return `${numerator / g}/${denominator / g}`;
    },
    format: { kind: 'text' },
    explanation: ({ vars, answer }) =>
      `მნიშვნელი იგივეა, ამიტომ მრიცხველები ვკრიბავთ: ${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}, შედეგი ${answer}.`,
    distractors: ({ vars, answer }) => {
      const d = Number(vars.d);
      return [
        `${Number(vars.a) + Number(vars.b)}/${d * 2}`,
        `${Number(vars.a) + Number(vars.b)}/${d + 1}`,
        `${Number(vars.a) + Number(vars.b) + 1}/${d}`,
        `${Math.max(1, Number(vars.a) + Number(vars.b) - 1)}/${d}`,
        String(answer),
      ];
    },
  }),

  defineTemplate({
    id: 'g5-angle-sum',
    grade: 5,
    topicId: 'kuTxeebi',
    subtopicId: 'jami',
    prompt: 'სამკუთხედის ორი კუთხეა {a}° და {b}°. მესამე კუთხე?',
    hint: 'სამკუთხედის კუთხეების ჯამი 180°-ია.',
    variables: {
      a: { kind: 'int', min: 20, max: 120, step: 5 },
      b: { kind: 'int', min: 20, max: 120, step: 5 },
    },
    constraints: [
      { test: (v) => Number(v.a) + Number(v.b) < 180, note: 'დარჩენილი კუთხე დადებითი იყოს' },
      { test: (v) => 180 - Number(v.a) - Number(v.b) >= 10, note: 'მესამე კუთხე ძალიან პატარა არ იყოს' },
    ],
    answer: (v) => 180 - Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 1, max: 179, format: (value) => `${value}°` },
    explanation: ({ vars, answer }) =>
      `180° − ${vars.a}° − ${vars.b}° = ${answer}.`,
    distractors: ({ answer }) => {
      const value = Number(String(answer).replace('°', ''));
      return [`${value + 10}°`, `${value - 10}°`, `${value + 5}°`, `${180 - value}°`];
    },
  }),

  // --------------------------------------------------------------- grade VI
  defineTemplate({
    id: 'g6-percent-of',
    grade: 6,
    topicId: 'procenti',
    subtopicId: 'povna',
    prompt: '{n}-ის {p}% = ?',
    variables: {
      p: { kind: 'choice', values: [10, 20, 25, 50] },
      base: { kind: 'int', min: 2, max: 20 },
      n: { kind: 'int', min: (v) => Number(v.base) * 10, max: (v) => Number(v.base) * 10 },
    },
    answer: (v) => (Number(v.n) * Number(v.p)) / 100,
    format: { kind: 'integer', min: 0 },
    explanation: ({ vars, answer }) =>
      `${vars.n} × ${vars.p} ÷ 100 = ${answer}.`,
    distractors: ({ vars, answer }) => {
      const n = Number(vars.n);
      const p = Number(vars.p);
      return [Number(answer) * 2, n / p, Number(answer) + p, n - Number(answer)];
    },
  }),

  defineTemplate({
    id: 'g6-negative-add',
    grade: 6,
    topicId: 'racionaluri',
    subtopicId: 'moqmedeba',
    prompt: '{a} + {b} = ?',
    hint: 'ყურადღება მიაქციე ნიშნებს.',
    variables: {
      a: { kind: 'choice', values: [-9, -8, -7, -6, -5, -4, -3, -2] },
      b: { kind: 'int', min: 2, max: 12 },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: -20, max: 20 },
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${answer}.`,
    distractors: ({ vars, answer }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      return [a - b, Number(answer) + 1, Number(answer) - 1, -(a + b)];
    },
  }),

  // -------------------------------------------------------------- grade VII
  defineTemplate({
    id: 'g7-linear-equation',
    grade: 7,
    topicId: 'xazovani',
    subtopicId: 'ertucnobiani',
    prompt: 'ამოხსენი: {a}x + {b} = {c}',
    variables: {
      a: { kind: 'int', min: 2, max: 7 },
      x: { kind: 'int', min: 2, max: 9 },
      b: { kind: 'int', min: 1, max: 12 },
      c: { kind: 'int', min: (v) => Number(v.a) * Number(v.x) + Number(v.b), max: (v) => Number(v.a) * Number(v.x) + Number(v.b) },
    },
    answer: (v) => Number(v.x),
    format: { kind: 'integer', min: 0 },
    explanation: ({ vars, answer }) =>
      `${vars.a}x = ${vars.c} − ${vars.b} = ${Number(vars.c) - Number(vars.b)}, ამიტომ x = ${answer}.`,
    distractors: ({ answer, vars }) => {
      const value = Number(answer);
      return [value + 1, value - 1, value + Number(vars.a), Number(vars.c) - value];
    },
  }),

  defineTemplate({
    id: 'g7-area-triangle',
    grade: 7,
    topicId: 'geometria',
    subtopicId: 'fartobi',
    prompt: 'სამკუთხედის ფუძეა {b} სმ, სიმაღლე — {h} სმ. ფართობი?',
    hint: 'S = ½ × ფუძე × სიმაღლე',
    variables: {
      b: { kind: 'int', min: 2, max: 14, step: 2 },
      h: { kind: 'int', min: 2, max: 12 },
    },
    answer: (v) => 0.5 * Number(v.b) * Number(v.h),
    format: { kind: 'decimal', decimals: 1, min: 0, format: (value) => `${value} სმ²` },
    explanation: ({ vars, answer }) =>
      `S = ½ × ${vars.b} × ${vars.h} = ${answer}.`,
    distractors: ({ vars }) => {
      const b = Number(vars.b);
      const h = Number(vars.h);
      const half = (b * h) / 2;
      return [
        `${half + 1} სმ²`,
        `${half - 1} სმ²`,
        `${half + 2} სმ²`,
        `${b * h} სმ²`,
        `${b + h} სმ²`,
      ];
    },
  }),
];

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}
