/**
 * Grade V placeholders — one template per subtopic of the Grade 5 plan
 * („Grade 5 (10-11)" → „TOPICS AND SUBTOPICS": U01–U19, 157 subtopics).
 *
 * ⚠️  THESE ARE PLACEHOLDERS. They exist so every subtopic in grade V is
 * playable and correctly wired to its unit; they are *not* the academy's final
 * questions. The real libraries will replace them unit by unit, exactly as
 * U10–U18 did for grade IV — at which point the subtopic joins
 * `G5_CONVERTED_SUBTOPICS` below and its placeholder is dropped by `catalog.ts`.
 *
 * Every entry is **correct by construction**: the wording and the answer are
 * computed from the same drawn values, and every wrong option is a mistake a
 * student actually makes (forgetting to carry, adding denominators, rounding
 * the wrong way), not a random neighbour.
 */

import { defineTemplate } from './types';
import type { QuestionTemplate } from './types';

/** Wrong options that are all different from the answer and positive. */
const wrong = (answer: number | string, candidates: Array<number | string>): string[] => {
  const out: string[] = [];
  for (const candidate of candidates) {
    const text = String(candidate);
    if (text === String(answer)) continue;
    if (typeof candidate === 'number' && (!Number.isFinite(candidate) || candidate < 0)) continue;
    if (out.includes(text)) continue;
    out.push(text);
  }
  return out;
};

/** Near misses around an answer, at the step size the subtopic works in. */
const near = (answer: number, step: number): number[] => {
  const out: number[] = [];
  for (const delta of [1, -1, 2, -2, 3, -3]) {
    const candidate = answer + delta;
    if (candidate !== answer && candidate >= 0 && !out.includes(candidate)) out.push(candidate);
  }
  for (const delta of [step, -step, step * 2, -step * 2]) {
    const candidate = answer + delta;
    if (candidate !== answer && candidate >= 0 && !out.includes(candidate)) out.push(candidate);
  }
  return out;
};

const gcdOf = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcdOf(b, a % b));
const lcmOf = (a: number, b: number): number => Math.abs(a * b) / gcdOf(a, b);

const divisors = (n: number): number[] => {
  const out: number[] = [];
  for (let d = 1; d <= n; d += 1) if (n % d === 0) out.push(d);
  return out;
};
const divisorCount = (n: number): number => divisors(n).length;

const primeFactors = (n: number): number[] => {
  const out: number[] = [];
  let rest = n;
  for (let p = 2; p * p <= rest; p += 1) {
    while (rest % p === 0) {
      out.push(p);
      rest /= p;
    }
  }
  if (rest > 1) out.push(rest);
  return out;
};

/** `0,35` → 0.35 — the decimal separator the app prints with a comma. */
const decValue = (text: string): number => Number(text.split(',').join('.'));

const PLACE_NAME: Record<string, string> = {
  th: 'ათასეულების',
  h: 'ასეულების',
  t: 'ათეულების',
  u: 'ერთეულების',
};

const ROUND_NAME: Record<number, string> = {
  10: 'ათეულამდე',
  100: 'ასეულამდე',
  1000: 'ათასეულამდე',
};

/**
 * Subtopics that already have a real library.
 *
 * `catalog.ts` drops a placeholder as soon as its subtopic appears here, so the
 * academy's own content always wins and a placeholder can never shadow it.
 * Empty today: grade V runs entirely on placeholders.
 */
export const G5_CONVERTED_SUBTOPICS: string[] = [
  'u01-04', 'u01-05', 'u01-06', 'u01-07', 'u01-08', 'u01-09',
  'u02-01', 'u02-02', 'u02-03', 'u02-04', 'u02-05',
  'u02-06', 'u02-07', 'u02-08', 'u02-09',
  'u03-01', 'u03-02', 'u03-03', 'u03-04', 'u03-05', 'u03-06',
  'u04-01', 'u04-02', 'u04-03', 'u04-04', 'u04-05',
  'u04-06', 'u04-07', 'u04-08', 'u04-09',
  'u05-01', 'u05-02', 'u05-03', 'u05-04', 'u05-05', 'u05-06', 'u05-07', 'u05-08',
];

export const GRADE5_PLACEHOLDERS: QuestionTemplate[] = [

  // ================= U01: რიცხვითი სისტემა და ადგილობრივი მნიშვნელობა =================
  defineTemplate({
    id: 'g5-u01-04', grade: 5, topicId: 'g5-numbers-place-value', unitId: 'g5-numbers-place-value', subtopicId: 'u01-04',
    prompt: '{t} ათასი, {h} ასეული, {d} ათეული და {u} ერთეული რომელი რიცხვია?',
    variables: {
      t: { kind: 'int', min: 1, max: 9 },
      h: { kind: 'int', min: 1, max: 9 },
      d: { kind: 'int', min: 1, max: 9 },
      u: { kind: 'int', min: 1, max: 9 },
    },
    answer: (v) => Number(v.t) * 1000 + Number(v.h) * 100 + Number(v.d) * 10 + Number(v.u),
    distractors: (ctx) => wrong(Number(ctx.answer), [
      Number(ctx.vars.t) * 100 + Number(ctx.vars.h) * 10 + Number(ctx.vars.d),
      Number(ctx.vars.t) * 1000 + Number(ctx.vars.h) * 10 + Number(ctx.vars.d) + Number(ctx.vars.u),
      Number(ctx.vars.t) * 1000 + Number(ctx.vars.h) * 100 + Number(ctx.vars.d),
      Number(ctx.vars.t) * 10000 + Number(ctx.vars.h) * 1000 + Number(ctx.vars.d) * 100 + Number(ctx.vars.u) * 10,
    ]),
    explanation: ({ vars, answer }) =>
      `${vars.t}000 + ${vars.h}00 + ${vars.d}0 + ${vars.u} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u01-05', grade: 5, topicId: 'g5-numbers-place-value', unitId: 'g5-numbers-place-value', subtopicId: 'u01-05',
    prompt: 'რიცხვში {n} რომელი ციფრი დგას {placeName} ადგილზე?',
    variables: {
      t: { kind: 'int', min: 1, max: 9 },
      h: { kind: 'int', min: 1, max: 9 },
      d: { kind: 'int', min: 1, max: 9 },
      u: { kind: 'int', min: 1, max: 9 },
      n: { kind: 'choice', values: (v) => [Number(v.t) * 1000 + Number(v.h) * 100 + Number(v.d) * 10 + Number(v.u)] },
      place: { kind: 'choice', values: ['th', 'h', 't', 'u'] },
      placeName: { kind: 'choice', values: (v) => [PLACE_NAME[String(v.place)]] },
    },
    answer: (v) => Number(v[String(v.place) === 'th' ? 't' : String(v.place) === 'h' ? 'h' : String(v.place) === 't' ? 'd' : 'u']),
    distractors: ({ vars, answer }) =>
      [vars.t, vars.h, vars.d, vars.u].map(Number).filter((digit) => digit !== Number(answer)).slice(0, 3),
    explanation: ({ vars, answer }) =>
      `რიცხვში ${vars.n} ${vars.placeName} ადგილზე დგას ციფრი ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u01-06', grade: 5, topicId: 'g5-numbers-place-value', unitId: 'g5-numbers-place-value', subtopicId: 'u01-06',
    prompt: 'ჩაწერე არაბული ციფრებით: {r}',
    variables: {
      pair: {
        kind: 'choice',
        values: ['XIV|14', 'XIX|19', 'XXIV|24', 'XXIX|29', 'XXXVI|36', 'XL|40', 'XLIV|44', 'XLIX|49',
          'LIV|54', 'LX|60', 'LXIII|63', 'LXXV|75', 'XC|90', 'XCIV|94', 'XCIX|99', 'C|100',
          'CCL|250', 'CD|400', 'D|500', 'CM|900', 'M|1000', 'DCC|700'],
      },
      r: { kind: 'choice', values: (v) => [String(v.pair).split('|')[0]] },
      value: { kind: 'choice', values: (v) => [Number(String(v.pair).split('|')[1])] },
    },
    answer: (v) => Number(v.value),
    distractors: ({ answer }) => near(Number(answer), 1),
    explanation: ({ vars, answer }) => `${vars.r} რომაული ჩაწერით არის ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u01-07', grade: 5, topicId: 'g5-numbers-place-value', unitId: 'g5-numbers-place-value', subtopicId: 'u01-07',
    prompt: 'ტემპერატურა იყო {t}°C და დაეცა {k}°C-ით. რა გახდა ტემპერატურა?',
    variables: {
      t: { kind: 'int', min: -3, max: 9 },
      k: { kind: 'int', min: 4, max: 16 },
    },
    constraints: [{ test: (v) => Number(v.t) - Number(v.k) < 0, note: 'პასუხი უარყოფითი იყოს' }],
    answer: (v) => Number(v.t) - Number(v.k),
    format: { kind: 'integer', min: -30, max: 5, format: (value) => `${value}°C` },
    explanation: ({ vars, answer }) => `${vars.t} − ${vars.k} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u01-08', grade: 5, topicId: 'g5-numbers-place-value', unitId: 'g5-numbers-place-value', subtopicId: 'u01-08',
    prompt: 'დაამრგვალე {n} უახლოეს {unitName}-ამდე.',
    variables: {
      target: { kind: 'choice', values: [10, 100, 1000] },
      unitName: { kind: 'choice', values: (v) => [ROUND_NAME[Number(v.target)]] },
      n: { kind: 'int', min: 105, max: 9949 },
    },
    answer: (v) => Math.round(Number(v.n) / Number(v.target)) * Number(v.target),
    distractors: ({ vars, answer }) => near(Number(answer), Number(vars.target)),
    explanation: ({ vars, answer }) =>
      `${vars.n} უახლოეს ${vars.unitName}-ამდე არის ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u01-09', grade: 5, topicId: 'g5-numbers-place-value', unitId: 'g5-numbers-place-value', subtopicId: 'u01-09',
    prompt: 'რამდენია 10^{k}?',
    variables: { k: { kind: 'int', min: 1, max: 15 } },
    answer: (v) => 10 ** Number(v.k),
    distractors: ({ vars, answer }) => [
      Number(answer) * 10,
      Math.max(1, Number(answer) / 10),
      Number(answer) + 10,
      Number(vars.k) * 10,
    ],
    explanation: ({ vars, answer }) => `10^${vars.k} = ${answer}.`,
  }),

  // ================= U02: გამყოფები, ჯერადები და გაყოფადობა =================
  defineTemplate({
    id: 'g5-u02-01', grade: 5, topicId: 'g5-divisibility', unitId: 'g5-divisibility', subtopicId: 'u02-01',
    prompt: 'რომელი რიცხვია მარტივი?',
    variables: {
      p: { kind: 'choice', values: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73] },
      c1: { kind: 'choice', values: [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28] },
      c2: { kind: 'choice', values: [33, 34, 35, 36, 38, 39, 40, 42, 44, 45, 46, 48, 49, 50, 51, 52] },
      c3: { kind: 'choice', values: [54, 55, 56, 57, 58, 60, 62, 63, 64, 65, 66, 68, 69, 70, 72, 74] },
    },
    answer: (v) => String(v.p),
    format: { kind: 'text' },
    options: (v) => [String(v.p), String(v.c1), String(v.c2), String(v.c3)],
    explanation: ({ answer }) =>
      `${answer} იყოფა მხოლოდ 1-ზე და საკუთარ თავზე, ამიტომ მარტივია. დანარჩენები შედგენილია.`,
  }),

  defineTemplate({
    id: 'g5-u02-02', grade: 5, topicId: 'g5-divisibility', unitId: 'g5-divisibility', subtopicId: 'u02-02',
    prompt: 'რამდენი გამყოფი აქვს რიცხვს {n}?',
    variables: {
      n: { kind: 'choice', values: [6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 27, 28, 30, 32, 36, 40] },
    },
    answer: (v) => divisorCount(Number(v.n)),
    distractors: ({ answer }) => near(Number(answer), 1),
    explanation: ({ vars, answer }) =>
      `${vars.n}-ის გამყოფებია ${divisors(Number(vars.n)).join(', ')}, სულ ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u02-03', grade: 5, topicId: 'g5-divisibility', unitId: 'g5-divisibility', subtopicId: 'u02-03',
    prompt: 'რამდენი მარტივი მამრავლია რიცხვის {n} დაშლაში (გამეორებების ჩათვლით)?',
    variables: {
      n: { kind: 'choice', values: [12, 16, 18, 20, 24, 27, 28, 30, 32, 36, 40, 42, 45, 48, 50, 54, 56, 60, 63, 70, 72, 75, 81, 84, 90] },
    },
    answer: (v) => primeFactors(Number(v.n)).length,
    distractors: ({ answer }) => near(Number(answer), 1),
    explanation: ({ vars, answer }) =>
      `${vars.n} = ${primeFactors(Number(vars.n)).join(' × ')}, სულ ${answer} მამრავლი.`,
  }),

  defineTemplate({
    id: 'g5-u02-04', grade: 5, topicId: 'g5-divisibility', unitId: 'g5-divisibility', subtopicId: 'u02-04',
    prompt: 'იპოვე {a}-ისა და {b}-ის უდიდესი საერთო გამყოფი.',
    variables: {
      a: { kind: 'int', min: 4, max: 48 },
      b: { kind: 'int', min: 4, max: 48 },
    },
    constraints: [{ test: (v) => v.a !== v.b, note: 'რიცხვები სხვადასხვა იყოს' }],
    answer: (v) => gcdOf(Number(v.a), Number(v.b)),
    distractors: ({ answer }) => near(Number(answer), 1),
    explanation: ({ vars, answer }) =>
      `${vars.a}-ისა და ${vars.b}-ის უდიდესი საერთო გამყოფია ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u02-05', grade: 5, topicId: 'g5-divisibility', unitId: 'g5-divisibility', subtopicId: 'u02-05',
    prompt: 'იპოვე {a}-ისა და {b}-ის უმცირესი საერთო ჯერადი.',
    variables: {
      a: { kind: 'int', min: 2, max: 12 },
      b: { kind: 'int', min: 3, max: 15 },
    },
    constraints: [{ test: (v) => v.a !== v.b, note: 'რიცხვები სხვადასხვა იყოს' }],
    answer: (v) => lcmOf(Number(v.a), Number(v.b)),
    distractors: ({ answer }) => near(Number(answer), 1),
    explanation: ({ vars, answer }) =>
      `${vars.a}-ისა და ${vars.b}-ის უმცირესი საერთო ჯერადია ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u02-06', grade: 5, topicId: 'g5-divisibility', unitId: 'g5-divisibility', subtopicId: 'u02-06',
    prompt: '{n} იყოფა {d}-ზე უნაშთოდ?',
    variables: {
      d: { kind: 'choice', values: [2, 4] },
      n: { kind: 'int', min: 24, max: 996 },
    },
    answer: (v) => (Number(v.n) % Number(v.d) === 0 ? 'დიახ' : 'არა'),
    format: { kind: 'text' },
    optionCount: 2,
    options: () => ['დიახ', 'არა'],
    explanation: ({ vars, answer }) => {
      const rest = Number(vars.n) % Number(vars.d);
      return rest === 0
        ? `${vars.n} ÷ ${vars.d} = ${Number(vars.n) / Number(vars.d)}, ნაშთის გარეშე — ${answer}.`
        : `${vars.n} ÷ ${vars.d} იძლევა ნაშთ ${rest}-ს — ${answer}.`;
    },
  }),

  defineTemplate({
    id: 'g5-u02-07', grade: 5, topicId: 'g5-divisibility', unitId: 'g5-divisibility', subtopicId: 'u02-07',
    prompt: '{n} იყოფა {d}-ზე უნაშთოდ?',
    variables: {
      d: { kind: 'choice', values: [3, 9] },
      n: { kind: 'int', min: 21, max: 999 },
    },
    answer: (v) => (Number(v.n) % Number(v.d) === 0 ? 'დიახ' : 'არა'),
    format: { kind: 'text' },
    optionCount: 2,
    options: () => ['დიახ', 'არა'],
    explanation: ({ vars, answer }) => {
      const digits = String(vars.n).split('').map(Number);
      const sum = digits.reduce((a, b) => a + b, 0);
      return `ციფრების ჯამია ${sum}; ${sum} ${answer === 'დიახ' ? 'იყოფა' : 'არ იყოფა'} ${vars.d}-ზე.`;
    },
  }),

  defineTemplate({
    id: 'g5-u02-08', grade: 5, topicId: 'g5-divisibility', unitId: 'g5-divisibility', subtopicId: 'u02-08',
    prompt: '{n} იყოფა {d}-ზე უნაშთოდ?',
    variables: {
      d: { kind: 'choice', values: [5, 10] },
      n: { kind: 'int', min: 25, max: 995 },
    },
    answer: (v) => (Number(v.n) % Number(v.d) === 0 ? 'დიახ' : 'არა'),
    format: { kind: 'text' },
    optionCount: 2,
    options: () => ['დიახ', 'არა'],
    explanation: ({ vars, answer }) =>
      `${vars.n} მთავრდება ${String(vars.n).slice(-1)}-ით, ამიტომ ${vars.d}-ზე ${answer === 'დიახ' ? 'იყოფა' : 'არ იყოფა'}.`,
  }),

  defineTemplate({
    id: 'g5-u02-09', grade: 5, topicId: 'g5-divisibility', unitId: 'g5-divisibility', subtopicId: 'u02-09',
    prompt: '{n} იყოფა 6-ზე უნაშთოდ?',
    variables: { n: { kind: 'int', min: 24, max: 996 } },
    answer: (v) => (Number(v.n) % 6 === 0 ? 'დიახ' : 'არა'),
    format: { kind: 'text' },
    optionCount: 2,
    options: () => ['დიახ', 'არა'],
    explanation: ({ vars, answer }) => {
      const even = Number(vars.n) % 2 === 0;
      const rest = Number(vars.n) % 3;
      return `${vars.n} ${even ? 'ლუწია' : 'კენტია'} და 3-ზე ${rest === 0 ? 'იყოფა' : `ნაშთს იძლევა (${rest})`}, ამიტომ 6-ზე ${answer === 'დიახ' ? 'იყოფა' : 'არ იყოფა'}.`;
    },
  }),

  // ================= U03: ნატურალური რიცხვების შეკრება და გამოკლება =================
  defineTemplate({
    id: 'g5-u03-01', grade: 5, topicId: 'g5-add-sub-whole', unitId: 'g5-add-sub-whole', subtopicId: 'u03-01',
    prompt: 'იპოვე უცნობი რიცხვი: {a} + x = {s}.',
    variables: {
      a: { kind: 'int', min: 120, max: 890 },
      x: { kind: 'int', min: 110, max: 880 },
      s: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.x)] },
    },
    answer: (v) => Number(v.s) - Number(v.a),
    distractors: ({ answer }) => near(Number(answer), 1),
    explanation: ({ vars, answer }) => `${vars.s} − ${vars.a} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u03-02', grade: 5, topicId: 'g5-add-sub-whole', unitId: 'g5-add-sub-whole', subtopicId: 'u03-02',
    prompt: '{a} + {b} = ?',
    variables: {
      a: { kind: 'int', min: 120000, max: 940000 },
      b: { kind: 'int', min: 110000, max: 930000 },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    distractors: ({ answer }) => near(Number(answer), 1000),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u03-03', grade: 5, topicId: 'g5-add-sub-whole', unitId: 'g5-add-sub-whole', subtopicId: 'u03-03',
    prompt: 'შეაფასე უახლოეს ათასეულამდე დამრგვალებით: {a} + {b} ≈ ?',
    variables: {
      a: { kind: 'int', min: 1240, max: 9600 },
      b: { kind: 'int', min: 1180, max: 9500 },
    },
    answer: (v) => Math.round(Number(v.a) / 1000) * 1000 + Math.round(Number(v.b) / 1000) * 1000,
    distractors: ({ answer }) => near(Number(answer), 1000),
    explanation: ({ vars, answer }) =>
      `${Math.round(Number(vars.a) / 1000) * 1000} + ${Math.round(Number(vars.b) / 1000) * 1000} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u03-04', grade: 5, topicId: 'g5-add-sub-whole', unitId: 'g5-add-sub-whole', subtopicId: 'u03-04',
    prompt: 'წიგნი ღირს {l} ლარი და {t} თეთრი. სულ რამდენი თეთრია?',
    variables: {
      l: { kind: 'int', min: 2, max: 28 },
      t: { kind: 'int', min: 5, max: 95, step: 5 },
    },
    answer: (v) => Number(v.l) * 100 + Number(v.t),
    distractors: ({ vars, answer }) => [
      Number(answer) + 10,
      Number(answer) + 100,
      Number(vars.l) * 10 + Number(vars.t),
      Number(answer) - 10,
    ].filter((value) => value > 0),
    explanation: ({ vars, answer }) => `${vars.l} × 100 + ${vars.t} = ${answer} თეთრი.`,
  }),

  defineTemplate({
    id: 'g5-u03-05', grade: 5, topicId: 'g5-add-sub-whole', unitId: 'g5-add-sub-whole', subtopicId: 'u03-05',
    prompt: 'რომელი ნიშანი უნდა ჩავსვათ: {a} + {b} ? {c}',
    variables: {
      a: { kind: 'int', min: 120, max: 480 },
      b: { kind: 'int', min: 110, max: 470 },
      delta: { kind: 'choice', values: [0, 10, 20, 30, -10, -20, -30] },
      c: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.b) + Number(v.delta)] },
    },
    answer: (v) => {
      const left = Number(v.a) + Number(v.b);
      const right = Number(v.c);
      return left > right ? '>' : left < right ? '<' : '=';
    },
    format: { kind: 'text' },
    optionCount: 3,
    options: () => ['<', '>', '='],
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}, ამიტომ ${Number(vars.a) + Number(vars.b)} ${answer} ${vars.c}.`,
  }),

  defineTemplate({
    id: 'g5-u03-06', grade: 5, topicId: 'g5-add-sub-whole', unitId: 'g5-add-sub-whole', subtopicId: 'u03-06',
    prompt: 'პირამიდაში ზედა უჯრა მეზობელი უჯრების ჯამია. რა რიცხვი იქნება ზედა უჯრაში?',
    hint: 'შეკრიბე ქვედა ორი უჯრა.',
    visual: (v) => `[ ? ]  ←  ${v.a} + ${v.b}`,
    variables: {
      a: { kind: 'int', min: 12, max: 89 },
      b: { kind: 'int', min: 11, max: 88 },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    distractors: ({ vars, answer }) => [
      Number(answer) + 10,
      Math.abs(Number(vars.a) - Number(vars.b)),
      Number(answer) - 10,
    ].filter((value) => value > 0),
    explanation: ({ vars, answer }) => `${vars.a} + ${vars.b} = ${answer}.`,
  }),

  // ================= U04: გამრავლება =================
  defineTemplate({
    id: 'g5-u04-01', grade: 5, topicId: 'g5-multiplication', unitId: 'g5-multiplication', subtopicId: 'u04-01',
    prompt: 'გამოიყენე განრიგებადობის თვისება: {a} × ({b} + {c}) = {a} × {b} + ?',
    variables: {
      a: { kind: 'int', min: 2, max: 9 },
      b: { kind: 'int', min: 3, max: 12 },
      c: { kind: 'int', min: 3, max: 12 },
    },
    constraints: [{ test: (v) => v.b !== v.c, note: 'b და c სხვადასხვა იყოს' }],
    answer: (v) => Number(v.a) * Number(v.c),
    distractors: ({ vars, answer }) => [
      Number(answer) * Number(vars.a),
      Number(vars.a) * Number(vars.b),
      Number(answer) + Number(vars.a),
    ].filter((value) => value !== Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.a} × ${vars.c} = ${answer}, ამიტომ ჯამი არის ${Number(vars.a) * Number(vars.b)} + ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u04-02', grade: 5, topicId: 'g5-multiplication', unitId: 'g5-multiplication', subtopicId: 'u04-02',
    prompt: '{a} × {b} = ?',
    variables: {
      a: { kind: 'int', min: 12, max: 98 },
      b: { kind: 'int', min: 3, max: 9 },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    distractors: ({ vars, answer }) => [
      Number(answer) + Number(vars.b),
      Number(answer) - Number(vars.b),
      Number(answer) + 10,
      Number(vars.a) + Number(vars.b),
    ].filter((value) => value > 0 && value !== Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u04-03', grade: 5, topicId: 'g5-multiplication', unitId: 'g5-multiplication', subtopicId: 'u04-03',
    prompt: '{a} × {b} = ?',
    variables: {
      a: { kind: 'int', min: 13, max: 79 },
      b: { kind: 'int', min: 12, max: 48 },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    distractors: ({ vars, answer }) => [
      Number(answer) + Number(vars.a),
      Number(answer) - Number(vars.a),
      Number(answer) + 10,
      Number(vars.a) + Number(vars.b),
    ].filter((value) => value > 0 && value !== Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u04-04', grade: 5, topicId: 'g5-multiplication', unitId: 'g5-multiplication', subtopicId: 'u04-04',
    prompt: 'რომელი რიცხვი უნდა ჩავსვათ: {a} × ? = {p}',
    variables: {
      a: { kind: 'int', min: 3, max: 12 },
      b: { kind: 'int', min: 4, max: 15 },
      p: { kind: 'choice', values: (v) => [Number(v.a) * Number(v.b)] },
    },
    answer: (v) => Number(v.p) / Number(v.a),
    distractors: ({ vars, answer }) => [
      Number(answer) + 1,
      Number(answer) - 1,
      Number(vars.a),
      Number(vars.a) + 1,
    ].filter((value) => value > 0 && value !== Number(answer)),
    explanation: ({ vars, answer }) => `${vars.p} ÷ ${vars.a} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u04-05', grade: 5, topicId: 'g5-multiplication', unitId: 'g5-multiplication', subtopicId: 'u04-05',
    prompt: '{a} × {b}0 = ?',
    variables: {
      a: { kind: 'int', min: 3, max: 19 },
      b: { kind: 'int', min: 2, max: 30 },
    },
    answer: (v) => Number(v.a) * Number(v.b) * 10,
    distractors: ({ vars, answer }) => [
      Number(vars.a) * Number(vars.b),
      Number(answer) + 10,
      Number(answer) - 10,
      Number(answer) / 10 + 10,
    ].filter((value) => value > 0 && value !== Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.a} × ${vars.b} = ${Number(vars.a) * Number(vars.b)}, დავუმატოთ ნული — ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u04-06', grade: 5, topicId: 'g5-multiplication', unitId: 'g5-multiplication', subtopicId: 'u04-06',
    prompt: 'შეაფასე უახლოეს ათეულამდე დამრგვალებით: {a} × {b} ≈ ?',
    variables: {
      a: { kind: 'int', min: 14, max: 96 },
      b: { kind: 'int', min: 13, max: 88 },
    },
    answer: (v) => Math.round(Number(v.a) / 10) * 10 * (Math.round(Number(v.b) / 10) * 10),
    distractors: ({ vars, answer }) => [
      Number(vars.a) * Number(vars.b),
      Number(answer) + 100,
      Number(answer) - 100,
      Number(answer) + 1000,
    ].filter((value) => value > 0 && value !== Number(answer)),
    explanation: ({ vars, answer }) =>
      `${Math.round(Number(vars.a) / 10) * 10} × ${Math.round(Number(vars.b) / 10) * 10} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u04-07', grade: 5, topicId: 'g5-multiplication', unitId: 'g5-multiplication', subtopicId: 'u04-07',
    prompt: '{a} × {b} × {c} = ?',
    variables: {
      a: { kind: 'int', min: 2, max: 9 },
      b: { kind: 'int', min: 3, max: 9 },
      c: { kind: 'int', min: 4, max: 9 },
    },
    answer: (v) => Number(v.a) * Number(v.b) * Number(v.c),
    distractors: ({ vars, answer }) => [
      Number(vars.a) * Number(vars.b) + Number(vars.c),
      Number(vars.a) + Number(vars.b) + Number(vars.c),
      Number(answer) + Number(vars.c),
      Number(answer) - Number(vars.a),
    ].filter((value) => value > 0 && value !== Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${Number(vars.a) * Number(vars.b)}; ${Number(vars.a) * Number(vars.b)} × ${vars.c} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u04-08', grade: 5, topicId: 'g5-multiplication', unitId: 'g5-multiplication', subtopicId: 'u04-08',
    prompt: '{a} × {b} = ?',
    variables: {
      a: { kind: 'int', min: 112, max: 489 },
      b: { kind: 'int', min: 105, max: 214 },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    distractors: ({ answer }) => near(Number(answer), 100),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u04-09', grade: 5, topicId: 'g5-multiplication', unitId: 'g5-multiplication', subtopicId: 'u04-09',
    prompt: 'ავტობუსში {n} ადგილია. {k} ასეთ ავტობუსში სულ რამდენი ადგილია?',
    variables: {
      n: { kind: 'int', min: 18, max: 56 },
      k: { kind: 'int', min: 3, max: 12 },
    },
    answer: (v) => Number(v.n) * Number(v.k),
    distractors: ({ vars, answer }) => [
      Number(answer) + Number(vars.n),
      Number(answer) - Number(vars.n),
      Number(vars.n) + Number(vars.k),
    ].filter((value) => value > 0 && value !== Number(answer)),
    explanation: ({ vars, answer }) => `${vars.k} × ${vars.n} = ${answer} ადგილი.`,
  }),

  // ================= U05: გაყოფა =================
  defineTemplate({
    id: 'g5-u05-01', grade: 5, topicId: 'g5-division', unitId: 'g5-division', subtopicId: 'u05-01',
    prompt: '{p} ÷ {a} = ?',
    variables: {
      a: { kind: 'int', min: 3, max: 12 },
      q: { kind: 'int', min: 4, max: 24 },
      p: { kind: 'choice', values: (v) => [Number(v.a) * Number(v.q)] },
    },
    answer: (v) => Number(v.p) / Number(v.a),
    distractors: ({ vars, answer }) => [
      Number(answer) + 1,
      Number(answer) - 1,
      Number(answer) + 2,
      Number(vars.a),
    ].filter((value) => value > 0 && value !== Number(answer)),
    explanation: ({ vars, answer }) => `${vars.p} ÷ ${vars.a} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u05-02', grade: 5, topicId: 'g5-division', unitId: 'g5-division', subtopicId: 'u05-02',
    prompt: '{p}0 ÷ {a}0 = ?',
    variables: {
      a: { kind: 'int', min: 2, max: 9 },
      q: { kind: 'int', min: 3, max: 30 },
      p: { kind: 'choice', values: (v) => [Number(v.a) * Number(v.q)] },
    },
    answer: (v) => Number(v.q),
    distractors: ({ vars, answer }) => [
      Number(answer) * 10,
      Number(answer) + 1,
      Number(answer) - 1,
      Number(vars.a) * 10,
    ].filter((value) => value > 0 && value !== Number(answer)),
    explanation: ({ vars, answer }) =>
      `${Number(vars.a) * 10 * Number(vars.q)} ÷ ${Number(vars.a) * 10} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u05-03', grade: 5, topicId: 'g5-division', unitId: 'g5-division', subtopicId: 'u05-03',
    prompt: '{p} ÷ {a} = ?',
    variables: {
      a: { kind: 'int', min: 3, max: 9 },
      q: { kind: 'int', min: 24, max: 108 },
      p: { kind: 'choice', values: (v) => [Number(v.a) * Number(v.q)] },
    },
    answer: (v) => Number(v.p) / Number(v.a),
    distractors: ({ vars, answer }) => [
      Number(answer) + 1,
      Number(answer) - 1,
      Number(answer) + 10,
      Number(vars.a),
    ].filter((value) => value > 0 && value !== Number(answer)),
    explanation: ({ vars, answer }) => `${vars.p} ÷ ${vars.a} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u05-04', grade: 5, topicId: 'g5-division', unitId: 'g5-division', subtopicId: 'u05-04',
    prompt: '{p} ÷ {a} = ? (რა ნაშთი დარჩება?)',
    variables: {
      a: { kind: 'int', min: 4, max: 9 },
      q: { kind: 'int', min: 6, max: 40 },
      r: { kind: 'int', min: 1, max: (v) => Number(v.a) - 1 },
      p: { kind: 'choice', values: (v) => [Number(v.a) * Number(v.q) + Number(v.r)] },
    },
    answer: (v) => Number(v.p) % Number(v.a),
    distractors: ({ vars, answer }) => [
      Number(answer) + 1,
      Number(answer) + 2,
      Number(vars.q),
      (Number(vars.a) - Number(answer) + Number(vars.a)) % Number(vars.a),
    ].filter((value) => value >= 0 && value !== Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.p} = ${vars.a} × ${vars.q} + ${answer}, ნაშთია ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u05-05', grade: 5, topicId: 'g5-division', unitId: 'g5-division', subtopicId: 'u05-05',
    prompt: 'შეაფასე უახლოეს ასეულამდე დამრგვალებით: {p} ÷ {a} ≈ ?',
    variables: {
      a: { kind: 'int', min: 4, max: 9 },
      q: { kind: 'int', min: 14, max: 96 },
      p: { kind: 'choice', values: (v) => [Number(v.a) * Number(v.q)] },
      rounded: { kind: 'choice', values: (v) => [Math.round(Number(v.p) / 100) * 100] },
    },
    constraints: [{ test: (v) => Number(v.rounded) > 0, note: 'დამრგვალებული რიცხვი დადებითი იყოს' }],
    answer: (v) => Number(v.rounded) / Number(v.a),
    distractors: ({ vars, answer }) => [
      Math.round(Number(vars.p) / Number(vars.a)) + 1,
      Math.round(Number(vars.p) / Number(vars.a)) - 1,
      Number(answer) + 10,
      Number(answer) - 10,
    ].filter((value) => value > 0 && value !== Number(answer)),
    explanation: ({ vars, answer }) => `${vars.p} ≈ ${vars.rounded}; ${vars.rounded} ÷ ${vars.a} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u05-06', grade: 5, topicId: 'g5-division', unitId: 'g5-division', subtopicId: 'u05-06',
    prompt: '{total} თეთრი თანაბრად გაინაწილა {n} ბავშვმა. რამდენი თეთრი მიიღო თითოეულმა?',
    variables: {
      n: { kind: 'int', min: 3, max: 9 },
      q: { kind: 'int', min: 12, max: 96 },
      total: { kind: 'choice', values: (v) => [Number(v.n) * Number(v.q)] },
    },
    answer: (v) => Number(v.total) / Number(v.n),
    distractors: ({ vars, answer }) => [
      Number(answer) + 10,
      Number(answer) - 10,
      Number(vars.n),
      Number(answer) + 1,
    ].filter((value) => value > 0 && value !== Number(answer)),
    explanation: ({ vars, answer }) => `${vars.total} ÷ ${vars.n} = ${answer} თეთრი.`,
  }),

  defineTemplate({
    id: 'g5-u05-07', grade: 5, topicId: 'g5-division', unitId: 'g5-division', subtopicId: 'u05-07',
    prompt: '{p} ÷ {a} უნაშთოდ რომ იყოფოდეს, რამდენი უნდა დავუმატოთ {p}-ს?',
    variables: {
      a: { kind: 'int', min: 4, max: 9 },
      q: { kind: 'int', min: 5, max: 30 },
      r: { kind: 'int', min: 1, max: (v) => Number(v.a) - 1 },
      p: { kind: 'choice', values: (v) => [Number(v.a) * Number(v.q) + Number(v.r)] },
    },
    answer: (v) => Number(v.a) - (Number(v.p) % Number(v.a)),
    distractors: ({ vars, answer }) => [
      Number(answer) + Number(vars.a),
      Number(answer) - 1,
      Number(vars.a),
      Number(answer) + 1,
    ].filter((value) => value > 0 && value !== Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.p}-ს ყოფისას ნაშთია ${Number(vars.p) % Number(vars.a)}; ${vars.a} − ${Number(vars.p) % Number(vars.a)} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u05-08', grade: 5, topicId: 'g5-division', unitId: 'g5-division', subtopicId: 'u05-08',
    prompt: '{total} კანფეტი თანაბრად გაინაწილეს {n} ყუთში. რამდენი კანფეტია ერთ ყუთში?',
    variables: {
      n: { kind: 'int', min: 4, max: 12 },
      q: { kind: 'int', min: 6, max: 40 },
      total: { kind: 'choice', values: (v) => [Number(v.n) * Number(v.q)] },
    },
    answer: (v) => Number(v.total) / Number(v.n),
    distractors: ({ vars, answer }) => [
      Number(answer) + 1,
      Number(answer) - 1,
      Number(vars.n),
      Number(vars.total) - Number(vars.n),
    ].filter((value) => value > 0 && value !== Number(answer)),
    explanation: ({ vars, answer }) => `${vars.total} ÷ ${vars.n} = ${answer} კანფეტი.`,
  }),

  // ================= U06: მრავალსაფეხურიანი ამოცანები და სიჩქარე =================
  defineTemplate({
    id: 'g5-u06-01', grade: 5, topicId: 'g5-multi-step-speed', unitId: 'g5-multi-step-speed', subtopicId: 'u06-01',
    prompt: 'მაღაზიაში {a} კგ ვაშლი მოვიდა, შემდეგ კიდევ {b} კგ. {c} კგ გაიყიდა. რამდენი კგ დარჩა?',
    variables: {
      a: { kind: 'int', min: 24, max: 90 },
      b: { kind: 'int', min: 12, max: 60 },
      c: { kind: 'int', min: 15, max: 70 },
    },
    constraints: [
      { test: (v) => Number(v.a) + Number(v.b) > Number(v.c), note: 'დარჩენილი დადებითი იყოს' },
      { test: (v) => v.a !== v.b, note: 'ორი მიწოდება ერთი და იგივე არ იყოს' },
    ],
    answer: (v) => Number(v.a) + Number(v.b) - Number(v.c),
    distractors: (ctx) => wrong(Number(ctx.answer), [
      Number(ctx.vars.a) + Number(ctx.vars.b),
      Number(ctx.vars.a) - Number(ctx.vars.b),
      Number(ctx.vars.a) + Number(ctx.vars.b) + Number(ctx.vars.c),
    ]),
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}; ${Number(vars.a) + Number(vars.b)} − ${vars.c} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u06-02', grade: 5, topicId: 'g5-multi-step-speed', unitId: 'g5-multi-step-speed', subtopicId: 'u06-02',
    prompt: 'ერთ ყუთში {k} წიგნია. {n} ასეთი ყუთიდან {m} წიგნი გაიყიდა. რამდენი წიგნი დარჩა?',
    variables: {
      k: { kind: 'int', min: 12, max: 40 },
      n: { kind: 'int', min: 4, max: 12 },
      m: { kind: 'int', min: 10, max: 60 },
    },
    constraints: [{ test: (v) => Number(v.k) * Number(v.n) > Number(v.m), note: 'დარჩენილი დადებითი იყოს' }],
    answer: (v) => Number(v.k) * Number(v.n) - Number(v.m),
    distractors: (ctx) => wrong(Number(ctx.answer), [
      Number(ctx.vars.k) * Number(ctx.vars.n),
      Number(ctx.vars.k) * Number(ctx.vars.n) + Number(ctx.vars.m),
      Number(ctx.vars.k) + Number(ctx.vars.n),
    ]),
    explanation: ({ vars, answer }) =>
      `${vars.k} × ${vars.n} = ${Number(vars.k) * Number(vars.n)}; ${Number(vars.k) * Number(vars.n)} − ${vars.m} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u06-03', grade: 5, topicId: 'g5-multi-step-speed', unitId: 'g5-multi-step-speed', subtopicId: 'u06-03',
    prompt: 'სამუშაო დაიწყო {h1}:{m1p}-ზე და გაგრძელდა {length} წუთი. რომელ საათზე დასრულდა?',
    hint: '{length} წუთი = {hh} სთ {mm} წთ.',
    variables: {
      h1: { kind: 'int', min: 8, max: 14 },
      m1: { kind: 'choice', values: [0, 10, 20, 30, 40, 50] },
      m1p: { kind: 'choice', values: (v) => [String(Number(v.m1)).padStart(2, '0')] },
      length: { kind: 'choice', values: [25, 35, 45, 50, 65, 75, 90, 110] },
      hh: { kind: 'choice', values: (v) => [Math.floor(Number(v.length) / 60)] },
      mm: { kind: 'choice', values: (v) => [Number(v.length) % 60] },
    },
    answer: (v) => {
      const total = Number(v.h1) * 60 + Number(v.m1) + Number(v.length);
      const hours = Math.floor(total / 60) % 24;
      const minutes = total % 60;
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    },
    format: { kind: 'text', time: true },
    explanation: ({ vars, answer }) =>
      `${vars.length} წუთი = ${vars.hh} სთ ${vars.mm} წთ, ამიტომ დასრულდა ${answer}-ზე.`,
  }),

  defineTemplate({
    id: 'g5-u06-04', grade: 5, topicId: 'g5-multi-step-speed', unitId: 'g5-multi-step-speed', subtopicId: 'u06-04',
    prompt: 'ავტობუსი მოძრაობს {v} კმ/სთ სიჩქარით. {t} საათში რამდენ კილომეტრს გაივლის?',
    variables: {
      v: { kind: 'int', min: 30, max: 90, step: 5 },
      t: { kind: 'int', min: 2, max: 6 },
    },
    answer: (v) => Number(v.v) * Number(v.t),
    distractors: (ctx) => wrong(Number(ctx.answer), [
      Number(ctx.vars.v) + Number(ctx.vars.t),
      Number(ctx.answer) + Number(ctx.vars.v),
      Number(ctx.answer) - Number(ctx.vars.v),
    ]),
    explanation: ({ vars, answer }) => `${vars.v} × ${vars.t} = ${answer} კმ.`,
  }),

  defineTemplate({
    id: 'g5-u06-05', grade: 5, topicId: 'g5-multi-step-speed', unitId: 'g5-multi-step-speed', subtopicId: 'u06-05',
    prompt: 'მატარებელმა {s} კმ გაიარა {v} კმ/სთ სიჩქარით. რამდენი საათი დასჭირდა?',
    variables: {
      v: { kind: 'int', min: 20, max: 90, step: 10 },
      t: { kind: 'int', min: 2, max: 8 },
      s: { kind: 'choice', values: (v) => [Number(v.v) * Number(v.t)] },
    },
    answer: (v) => Number(v.s) / Number(v.v),
    distractors: (ctx) => wrong(Number(ctx.answer), [
      Number(ctx.vars.v),
      Number(ctx.answer) + 1,
      Number(ctx.vars.s) / 10,
    ]),
    explanation: ({ vars, answer }) => `${vars.s} ÷ ${vars.v} = ${answer} საათი.`,
  }),

  defineTemplate({
    id: 'g5-u06-06', grade: 5, topicId: 'g5-multi-step-speed', unitId: 'g5-multi-step-speed', subtopicId: 'u06-06',
    prompt: 'ველოსიპედისტმა {s} კმ {t} საათში გაიარა. რა იყო მისი სიჩქარე?',
    variables: {
      v: { kind: 'int', min: 8, max: 30 },
      t: { kind: 'int', min: 2, max: 6 },
      s: { kind: 'choice', values: (v) => [Number(v.v) * Number(v.t)] },
    },
    answer: (v) => Number(v.s) / Number(v.t),
    distractors: (ctx) => wrong(Number(ctx.answer), [
      Number(ctx.vars.s) + Number(ctx.vars.t),
      Number(ctx.answer) + 2,
      Number(ctx.answer) - 2,
    ]),
    explanation: ({ vars, answer }) => `${vars.s} ÷ ${vars.t} = ${answer} კმ/სთ.`,
  }),

  // ================= U07: წილადები და შერეული რიცხვები =================
  defineTemplate({
    id: 'g5-u07-01', grade: 5, topicId: 'g5-fractions-mixed', unitId: 'g5-fractions-mixed', subtopicId: 'u07-01',
    prompt: '{n} ვაშლიდან {part} შეჭამეს. რამდენი ვაშლი დარჩა?',
    variables: {
      n: { kind: 'choice', values: [8, 9, 12, 15, 16, 18, 20, 21, 24, 27, 30, 32, 36, 40, 45, 48, 60, 80] },
      divisor: { kind: 'choice', values: [4, 2, 3] },
      part: { kind: 'choice', values: (v) => [Number(v.divisor) === 4 ? 'მეოთხედი' : Number(v.divisor) === 2 ? 'ნახევარი' : 'მესამედი'] },
      eaten: { kind: 'choice', values: (v) => [Number(v.n) / Number(v.divisor)] },
    },
    constraints: [{ test: (v) => Number(v.n) % Number(v.divisor) === 0, note: 'ნაწილი მთელი იყოს' }],
    answer: (v) => Number(v.n) - Number(v.eaten),
    distractors: (ctx) => wrong(Number(ctx.answer), [
      Number(ctx.vars.n),
      Number(ctx.vars.eaten),
      Number(ctx.vars.n) / 2,
    ]),
    explanation: ({ vars, answer }) =>
      `${vars.n} ÷ ${vars.divisor} = ${vars.eaten} შეჭამეს, დარჩა ${vars.n} − ${vars.eaten} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u07-02', grade: 5, topicId: 'g5-fractions-mixed', unitId: 'g5-fractions-mixed', subtopicId: 'u07-02',
    prompt: 'რომელია მეტი: {a}/{d} თუ {b}/{d}?',
    variables: {
      d: { kind: 'int', min: 5, max: 12 },
      a: { kind: 'int', min: 1, max: (v) => Number(v.d) - 1 },
      b: { kind: 'int', min: 1, max: (v) => Number(v.d) - 1 },
    },
    constraints: [{ test: (v) => v.a !== v.b, note: 'მრიცხველები სხვადასხვა იყოს' }],
    answer: (v) => (Number(v.a) > Number(v.b) ? `${v.a}/${v.d}` : `${v.b}/${v.d}`),
    format: { kind: 'text' },
    optionCount: 2,
    options: (v) => [`${v.a}/${v.d}`, `${v.b}/${v.d}`],
    explanation: ({ answer }) =>
      `ერთი მნიშვნელია, ამიტომ მეტია ის, რომლის მრიცხველიც მეტია: ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u07-03', grade: 5, topicId: 'g5-fractions-mixed', unitId: 'g5-fractions-mixed', subtopicId: 'u07-03',
    prompt: 'რომელია მეტი: {a}/{d1} თუ {b}/{d2}?',
    variables: {
      d1: { kind: 'choice', values: [2, 3, 4, 5, 6, 8] },
      d2: { kind: 'choice', values: [2, 3, 4, 5, 6, 8] },
      a: { kind: 'int', min: 1, max: (v) => Number(v.d1) - 1 },
      b: { kind: 'int', min: 1, max: (v) => Number(v.d2) - 1 },
    },
    constraints: [
      { test: (v) => v.d1 !== v.d2, note: 'მნიშვნელები სხვადასხვა იყოს' },
      { test: (v) => Math.abs(Number(v.a) / Number(v.d1) - Number(v.b) / Number(v.d2)) > 0.02, note: 'ტოლი არ იყოს' },
    ],
    answer: (v) =>
      Number(v.a) / Number(v.d1) > Number(v.b) / Number(v.d2) ? `${v.a}/${v.d1}` : `${v.b}/${v.d2}`,
    format: { kind: 'text' },
    optionCount: 2,
    options: (v) => [`${v.a}/${v.d1}`, `${v.b}/${v.d2}`],
    explanation: ({ vars, answer }) => {
      return `საერთო მნიშვნელი ${Number(vars.d1) * Number(vars.d2)}-ია: ${vars.a}/${vars.d1} = ${Number(vars.a) * Number(vars.d2)}/${Number(vars.d1) * Number(vars.d2)}, ${vars.b}/${vars.d2} = ${Number(vars.b) * Number(vars.d1)}/${Number(vars.d1) * Number(vars.d2)}; მეტია ${answer}.`;
    },
  }),

  defineTemplate({
    id: 'g5-u07-04', grade: 5, topicId: 'g5-fractions-mixed', unitId: 'g5-fractions-mixed', subtopicId: 'u07-04',
    prompt: 'შეკვეცე წილადი {a}/{d}.',
    variables: {
      f: { kind: 'int', min: 2, max: 6 },
      x: { kind: 'int', min: 1, max: 7 },
      y: { kind: 'int', min: 1, max: 7 },
      a: { kind: 'choice', values: (v) => [Number(v.f) * Number(v.x)] },
      d: { kind: 'choice', values: (v) => [Number(v.f) * Number(v.y)] },
    },
    constraints: [
      { test: (v) => Number(v.x) < Number(v.y), note: 'წილადი ერთზე ნაკლები იყოს' },
      { test: (v) => gcdOf(Number(v.x), Number(v.y)) === 1, note: 'შედეგი მეტად არ იკვეცებოდეს' },
    ],
    answer: (v) => `${v.x}/${v.y}`,
    format: { kind: 'text' },
    distractors: (ctx) => wrong(String(ctx.answer), [
      `${ctx.vars.a}/${ctx.vars.d}`,
      `${Number(ctx.vars.x) + 1}/${ctx.vars.y}`,
      `${ctx.vars.x}/${Number(ctx.vars.y) + 1}`,
    ]),
    explanation: ({ vars, answer }) =>
      `${vars.a} და ${vars.d} იყოფა ${vars.f}-ზე: ${vars.a} ÷ ${vars.f} = ${vars.x}, ${vars.d} ÷ ${vars.f} = ${vars.y}, ამიტომ ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u07-05', grade: 5, topicId: 'g5-fractions-mixed', unitId: 'g5-fractions-mixed', subtopicId: 'u07-05',
    prompt: '{a}/{d1} და {b}/{d2} რომელ საერთო მნიშვნელამდე მივიყვანოთ?',
    variables: {
      d1: { kind: 'choice', values: [2, 3, 4, 5, 6, 8] },
      d2: { kind: 'choice', values: [3, 4, 5, 6, 8, 9] },
      a: { kind: 'int', min: 1, max: (v) => Number(v.d1) - 1 },
      b: { kind: 'int', min: 1, max: (v) => Number(v.d2) - 1 },
    },
    constraints: [{ test: (v) => v.d1 !== v.d2, note: 'მნიშვნელები სხვადასხვა იყოს' }],
    answer: (v) => lcmOf(Number(v.d1), Number(v.d2)),
    distractors: (ctx) => wrong(Number(ctx.answer), [
      Number(ctx.answer) + Number(ctx.vars.d1),
      Number(ctx.answer) - 1,
      Number(ctx.vars.d1) + Number(ctx.vars.d2),
    ]),
    explanation: ({ vars, answer }) =>
      `${vars.d1}-ისა და ${vars.d2}-ის უმცირესი საერთო ჯერადია ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u07-06', grade: 5, topicId: 'g5-fractions-mixed', unitId: 'g5-fractions-mixed', subtopicId: 'u07-06',
    prompt: '{a}/{d}-ის ტოლი წილადი რომელია?',
    variables: {
      a: { kind: 'int', min: 1, max: 3 },
      d: { kind: 'int', min: 3, max: 6 },
      k: { kind: 'choice', values: [2, 3, 4] },
    },
    constraints: [{ test: (v) => Number(v.a) < Number(v.d), note: 'ეწილადი ერთზე ნაკლები იყოს' }],
    answer: (v) => `${Number(v.a) * Number(v.k)}/${Number(v.d) * Number(v.k)}`,
    format: { kind: 'text' },
    distractors: (ctx) => wrong(String(ctx.answer), [
      `${Number(ctx.vars.a) * Number(ctx.vars.k)}/${ctx.vars.d}`,
      `${ctx.vars.a}/${Number(ctx.vars.d) * Number(ctx.vars.k)}`,
      `${Number(ctx.vars.a) + Number(ctx.vars.k)}/${ctx.vars.d}`,
    ]),
    explanation: ({ vars, answer }) =>
      `მრიცხველი და მნიშვნელი გავამრავლეთ ${vars.k}-ზე: ${vars.a}/${vars.d} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u07-07', grade: 5, topicId: 'g5-fractions-mixed', unitId: 'g5-fractions-mixed', subtopicId: 'u07-07',
    prompt: 'წილადი {a}/{d} სწორია თუ არასწორი?',
    variables: {
      a: { kind: 'int', min: 1, max: 12 },
      d: { kind: 'int', min: 2, max: 9 },
    },
    constraints: [{ test: (v) => v.a !== v.d, note: 'ტოლი წილადი არ გვაინტერესებს' }],
    answer: (v) => (Number(v.a) < Number(v.d) ? 'სწორი' : 'არასწორი'),
    format: { kind: 'text' },
    optionCount: 2,
    options: () => ['სწორი', 'არასწორი'],
    explanation: ({ vars, answer }) =>
      `მრიცხველი ${vars.a} ${Number(vars.a) < Number(vars.d) ? 'ნაკლებია' : 'მეტია'} მნიშვნელზე ${vars.d}, ამიტომ წილადი ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u07-08', grade: 5, topicId: 'g5-fractions-mixed', unitId: 'g5-fractions-mixed', subtopicId: 'u07-08',
    prompt: 'ჩაწერე შერეული რიცხვის სახით: {a}/{d}.',
    variables: {
      w: { kind: 'int', min: 1, max: 6 },
      r: { kind: 'int', min: 1, max: 7 },
      d: { kind: 'int', min: 3, max: 9 },
      a: { kind: 'choice', values: (v) => [Number(v.w) * Number(v.d) + Number(v.r)] },
    },
    constraints: [{ test: (v) => Number(v.r) < Number(v.d), note: 'ნაშთი მნიშვნელზე ნაკლები იყოს' }],
    answer: (v) => `${v.w} ${v.r}/${v.d}`,
    format: { kind: 'text' },
    distractors: (ctx) => wrong(String(ctx.answer), [
      `${Number(ctx.vars.w) + 1} ${ctx.vars.r}/${ctx.vars.d}`,
      `${ctx.vars.w} ${Number(ctx.vars.r) + 1}/${ctx.vars.d}`,
      `${ctx.vars.w} ${ctx.vars.r}/${Number(ctx.vars.d) + 1}`,
    ]),
    explanation: ({ vars, answer }) =>
      `${vars.a} ÷ ${vars.d} = ${vars.w} ნაშთით ${vars.r}, ამიტომ ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u07-09', grade: 5, topicId: 'g5-fractions-mixed', unitId: 'g5-fractions-mixed', subtopicId: 'u07-09',
    prompt: 'გადააქციე არასწორ წილადად: {w} {r}/{d}.',
    variables: {
      w: { kind: 'int', min: 1, max: 6 },
      r: { kind: 'int', min: 1, max: 7 },
      d: { kind: 'int', min: 3, max: 9 },
    },
    constraints: [{ test: (v) => Number(v.r) < Number(v.d), note: 'ნაშთი მნიშვნელზე ნაკლები იყოს' }],
    answer: (v) => `${Number(v.w) * Number(v.d) + Number(v.r)}/${v.d}`,
    format: { kind: 'text' },
    distractors: (ctx) => wrong(String(ctx.answer), [
      `${Number(ctx.vars.w) * Number(ctx.vars.d)}/${ctx.vars.d}`,
      `${Number(ctx.vars.w) + Number(ctx.vars.r)}/${ctx.vars.d}`,
      `${Number(ctx.vars.w) * Number(ctx.vars.d) + Number(ctx.vars.r)}/${Number(ctx.vars.d) + 1}`,
    ]),
    explanation: ({ vars, answer }) =>
      `${vars.w} × ${vars.d} + ${vars.r} = ${Number(vars.w) * Number(vars.d) + Number(vars.r)}, ამიტომ ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u07-10', grade: 5, topicId: 'g5-fractions-mixed', unitId: 'g5-fractions-mixed', subtopicId: 'u07-10',
    prompt: 'რომელი წილადია უდიდესი: {a}/{d}, {b}/{d} თუ {c}/{d}?',
    variables: {
      d: { kind: 'int', min: 7, max: 12 },
      a: { kind: 'int', min: 1, max: (v) => Number(v.d) - 1 },
      b: { kind: 'int', min: 1, max: (v) => Number(v.d) - 1 },
      c: { kind: 'int', min: 1, max: (v) => Number(v.d) - 1 },
    },
    constraints: [
      { test: (v) => new Set([v.a, v.b, v.c]).size === 3, note: 'სამივე მრიცხველი სხვადასხვა იყოს' },
    ],
    answer: (v) => `${Math.max(Number(v.a), Number(v.b), Number(v.c))}/${v.d}`,
    format: { kind: 'text' },
    options: (v) => [`${v.a}/${v.d}`, `${v.b}/${v.d}`, `${v.c}/${v.d}`],
    optionCount: 3,
    explanation: ({ answer }) =>
      `მნიშვნელი ერთია, ამიტომ უდიდესია უდიდესი მრიცხველის მქონე წილადი: ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u07-11', grade: 5, topicId: 'g5-fractions-mixed', unitId: 'g5-fractions-mixed', subtopicId: 'u07-11',
    prompt: '{a}/{d}-ის შებრუნებული წილადია:',
    variables: {
      a: { kind: 'int', min: 1, max: 9 },
      d: { kind: 'int', min: 2, max: 12 },
    },
    constraints: [{ test: (v) => v.a !== v.d, note: 'წილადი 1-ის ტოლი არ იყოს' }],
    answer: (v) => `${v.d}/${v.a}`,
    format: { kind: 'text' },
    distractors: (ctx) => wrong(String(ctx.answer), [
      `${ctx.vars.a}/${ctx.vars.d}`,
      `${Number(ctx.vars.d) + 1}/${ctx.vars.a}`,
      `${ctx.vars.d}/${Number(ctx.vars.a) + 1}`,
    ]),
    explanation: ({ vars, answer }) =>
      `შებრუნებულ წილადში მრიცხველი და მნიშვნელი იცვლის ადგილს: ${vars.a}/${vars.d} → ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u07-12', grade: 5, topicId: 'g5-fractions-mixed', unitId: 'g5-fractions-mixed', subtopicId: 'u07-12',
    prompt: 'რიცხვით ღერძზე 0-დან 1-მდე {a}/{d} რომელ ნაწილშია: ნახევარზე ნაკლები თუ მეტი?',
    variables: {
      a: { kind: 'int', min: 1, max: 11 },
      d: { kind: 'int', min: 3, max: 12 },
    },
    constraints: [
      { test: (v) => Number(v.a) < Number(v.d), note: 'წილადი ერთზე ნაკლები იყოს' },
      { test: (v) => Number(v.a) * 2 !== Number(v.d), note: 'ზუსტად ნახევარი არ იყოს' },
    ],
    answer: (v) => (Number(v.a) * 2 < Number(v.d) ? 'ნახევარზე ნაკლები' : 'ნახევარზე მეტი'),
    format: { kind: 'text' },
    optionCount: 2,
    options: () => ['ნახევარზე ნაკლები', 'ნახევარზე მეტი'],
    explanation: ({ vars, answer }) =>
      `${vars.a}/${vars.d} შევადაროთ 1/2-ს: ${Number(vars.a) * 2} ${Number(vars.a) * 2 < Number(vars.d) ? '<' : '>'} ${vars.d}, ამიტომ ${answer}.`,
  }),

  // ================= U08: წილადების შეკრება და გამოკლება =================
  defineTemplate({
    id: 'g5-u08-01', grade: 5, topicId: 'g5-add-sub-fractions', unitId: 'g5-add-sub-fractions', subtopicId: 'u08-01',
    prompt: 'რამდენი მეასედია {t} მეათედი?',
    variables: { t: { kind: 'int', min: 1, max: 20 } },
    answer: (v) => Number(v.t) * 10,
    distractors: (ctx) => wrong(Number(ctx.answer), [
      Number(ctx.vars.t) * 100,
      Number(ctx.answer) + 10,
      Number(ctx.answer) - 10,
    ]),
    explanation: ({ vars, answer }) => `1 მეათედი = 10 მეასედი, ამიტომ ${vars.t} × 10 = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u08-02', grade: 5, topicId: 'g5-add-sub-fractions', unitId: 'g5-add-sub-fractions', subtopicId: 'u08-02',
    prompt: '{a}/{d} + {b}/{d} = ?',
    variables: {
      d: { kind: 'int', min: 4, max: 12 },
      a: { kind: 'int', min: 1, max: (v) => Number(v.d) - 2 },
      b: { kind: 'int', min: 1, max: (v) => Number(v.d) - 2 },
    },
    constraints: [{ test: (v) => Number(v.a) + Number(v.b) < Number(v.d), note: 'ჯამი ერთზე ნაკლები იყოს' }],
    answer: (v) => `${Number(v.a) + Number(v.b)}/${v.d}`,
    format: { kind: 'text' },
    distractors: (ctx) => wrong(String(ctx.answer), [
      `${Number(ctx.vars.a) + Number(ctx.vars.b)}/${Number(ctx.vars.d) * 2}`,
      `${Number(ctx.vars.a) + Number(ctx.vars.b) + 1}/${ctx.vars.d}`,
      `${Number(ctx.vars.a) * Number(ctx.vars.b)}/${ctx.vars.d}`,
    ]),
    explanation: ({ vars, answer }) =>
      `მნიშვნელი იგივეა, მრიცხველებს ვკრიბავთ: ${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}, ამიტომ ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u08-03', grade: 5, topicId: 'g5-add-sub-fractions', unitId: 'g5-add-sub-fractions', subtopicId: 'u08-03',
    prompt: '{w1} {a}/{d} + {w2} {b}/{d} = ?',
    variables: {
      d: { kind: 'int', min: 4, max: 9 },
      a: { kind: 'int', min: 1, max: (v) => Number(v.d) - 2 },
      b: { kind: 'int', min: 1, max: (v) => Number(v.d) - 2 },
      w1: { kind: 'int', min: 1, max: 3 },
      w2: { kind: 'int', min: 1, max: 3 },
    },
    constraints: [{ test: (v) => Number(v.a) + Number(v.b) < Number(v.d), note: 'წილადური ნაწილი ერთზე ნაკლები იყოს' }],
    answer: (v) => `${Number(v.w1) + Number(v.w2)} ${Number(v.a) + Number(v.b)}/${v.d}`,
    format: { kind: 'text' },
    distractors: (ctx) => wrong(String(ctx.answer), [
      `${Number(ctx.vars.w1) + Number(ctx.vars.w2)} ${ctx.vars.a}/${ctx.vars.b}`,
      `${Number(ctx.vars.w1) + Number(ctx.vars.w2) + 1} ${Number(ctx.vars.a) + Number(ctx.vars.b)}/${ctx.vars.d}`,
      `${Number(ctx.vars.w1) + Number(ctx.vars.w2)} ${Number(ctx.vars.a) + Number(ctx.vars.b)}/${Number(ctx.vars.d) * 2}`,
    ]),
    explanation: ({ vars, answer }) =>
      `მთელები: ${vars.w1} + ${vars.w2} = ${Number(vars.w1) + Number(vars.w2)}; წილადები: ${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}, ამიტომ ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u08-04', grade: 5, topicId: 'g5-add-sub-fractions', unitId: 'g5-add-sub-fractions', subtopicId: 'u08-04',
    prompt: '{a}/{d1} + {b}/{d2} = ?',
    variables: {
      d1: { kind: 'choice', values: [2, 3, 4, 5, 6, 8] },
      d2: { kind: 'choice', values: [3, 4, 5, 6, 8, 9] },
      a: { kind: 'int', min: 1, max: (v) => Number(v.d1) - 1 },
      b: { kind: 'int', min: 1, max: (v) => Number(v.d2) - 1 },
    },
    constraints: [
      { test: (v) => v.d1 !== v.d2, note: 'მნიშვნელები სხვადასხვა იყოს' },
      { test: (v) => gcdOf(Number(v.d1), Number(v.d2)) <= 2, note: 'მარტივი საერთო მნიშვნელი იყოს' },
    ],
    answer: (v) => {
      const den = Number(v.d1) * Number(v.d2);
      const num = Number(v.a) * Number(v.d2) + Number(v.b) * Number(v.d1);
      const g = gcdOf(num, den);
      return g === den ? '1' : `${num / g}/${den / g}`;
    },
    format: { kind: 'text' },
    distractors: (ctx) => {
      const d1 = Number(ctx.vars.d1);
      const d2 = Number(ctx.vars.d2);
      const den = d1 * d2;
      const num = Number(ctx.vars.a) * d2 + Number(ctx.vars.b) * d1;
      return wrong(String(ctx.answer), [
        `${Number(ctx.vars.a) + Number(ctx.vars.b)}/${d1 + d2}`,
        `${num}/${den + 1}`,
        `${num + 1}/${den}`,
      ]);
    },
    explanation: ({ vars, answer }) =>
      `საერთო მნიშვნელი ${Number(vars.d1) * Number(vars.d2)}-ია: ${vars.a}/${vars.d1} + ${vars.b}/${vars.d2} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u08-05', grade: 5, topicId: 'g5-add-sub-fractions', unitId: 'g5-add-sub-fractions', subtopicId: 'u08-05',
    prompt: '{w1} {a}/{d} − {w2} {b}/{d} = ?',
    variables: {
      d: { kind: 'int', min: 4, max: 9 },
      a: { kind: 'int', min: 1, max: (v) => Number(v.d) - 2 },
      b: { kind: 'int', min: 1, max: (v) => Number(v.d) - 2 },
      w1: { kind: 'int', min: 3, max: 8 },
      w2: { kind: 'int', min: 1, max: 3 },
    },
    constraints: [{ test: (v) => Number(v.a) >= Number(v.b), note: 'წილადური ნაწილი არ გახდეს უარყოფითი' }],
    answer: (v) => `${Number(v.w1) - Number(v.w2)} ${Number(v.a) - Number(v.b)}/${v.d}`,
    format: { kind: 'text' },
    distractors: (ctx) => wrong(String(ctx.answer), [
      `${Number(ctx.vars.w1) - Number(ctx.vars.w2)} ${Number(ctx.vars.a) + Number(ctx.vars.b)}/${ctx.vars.d}`,
      `${Number(ctx.vars.w1) - Number(ctx.vars.w2) + 1} ${Number(ctx.vars.a) - Number(ctx.vars.b)}/${ctx.vars.d}`,
      `${Number(ctx.vars.w1) - Number(ctx.vars.w2)} ${Number(ctx.vars.b)}/${ctx.vars.d}`,
    ]),
    explanation: ({ vars, answer }) =>
      `მთელები: ${vars.w1} − ${vars.w2} = ${Number(vars.w1) - Number(vars.w2)}; წილადები: ${vars.a} − ${vars.b} = ${Number(vars.a) - Number(vars.b)}, ამიტომ ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u08-06', grade: 5, topicId: 'g5-add-sub-fractions', unitId: 'g5-add-sub-fractions', subtopicId: 'u08-06',
    prompt: 'რამდენია 1-ის მიახლოებით: {a}/{d} + {b}/{d}?',
    hint: 'შეადარე ჯამი 1-ს.',
    variables: {
      d: { kind: 'int', min: 5, max: 12 },
      a: { kind: 'int', min: 1, max: (v) => Number(v.d) - 1 },
      b: { kind: 'int', min: 1, max: (v) => Number(v.d) - 1 },
    },
    constraints: [{ test: (v) => Number(v.a) + Number(v.b) > Number(v.d), note: 'ჯამი ერთზე მეტი იყოს' }],
    answer: (v) => (Number(v.a) + Number(v.b) < Number(v.d) * 2 ? '1-ზე ცოტა მეტი' : '2-ზე ცოტა ნაკლები'),
    format: { kind: 'text' },
    optionCount: 2,
    options: () => ['1-ზე ცოტა მეტი', '2-ზე ცოტა ნაკლები'],
    explanation: ({ vars, answer }) =>
      `${vars.a} + ${vars.b} = ${Number(vars.a) + Number(vars.b)}; ${Number(vars.a) + Number(vars.b)}/${vars.d} არის ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u08-07', grade: 5, topicId: 'g5-add-sub-fractions', unitId: 'g5-add-sub-fractions', subtopicId: 'u08-07',
    prompt: 'რომელია მეტი: {a}/{d} − {b}/{d} თუ {c}/{d} − {e}/{d}?',
    variables: {
      d: { kind: 'int', min: 6, max: 12 },
      a: { kind: 'int', min: 4, max: (v) => Number(v.d) - 1 },
      b: { kind: 'int', min: 1, max: 3 },
      c: { kind: 'int', min: 4, max: (v) => Number(v.d) - 1 },
      e: { kind: 'int', min: 1, max: 3 },
    },
    constraints: [
      { test: (v) => Number(v.a) - Number(v.b) !== Number(v.c) - Number(v.e), note: 'შედეგები განსხვავებული იყოს' },
      { test: (v) => Number(v.a) > Number(v.b) && Number(v.c) > Number(v.e), note: 'სხვაობები დადებითი იყოს' },
    ],
    answer: (v) =>
      Number(v.a) - Number(v.b) > Number(v.c) - Number(v.e)
        ? `${v.a}/${v.d} − ${v.b}/${v.d}`
        : `${v.c}/${v.d} − ${v.e}/${v.d}`,
    format: { kind: 'text' },
    optionCount: 2,
    options: (v) => [`${v.a}/${v.d} − ${v.b}/${v.d}`, `${v.c}/${v.d} − ${v.e}/${v.d}`],
    explanation: ({ vars, answer }) =>
      `პირველი: ${vars.a} − ${vars.b} = ${Number(vars.a) - Number(vars.b)}; მეორე: ${vars.c} − ${vars.e} = ${Number(vars.c) - Number(vars.e)}; მეტია ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u08-08', grade: 5, topicId: 'g5-add-sub-fractions', unitId: 'g5-add-sub-fractions', subtopicId: 'u08-08',
    prompt: '{a}/{d} + x = {s}/{d}. იპოვე x.',
    variables: {
      d: { kind: 'int', min: 5, max: 12 },
      a: { kind: 'int', min: 1, max: (v) => Math.max(1, Number(v.d) - 3) },
      x: { kind: 'int', min: 1, max: (v) => Math.max(1, Number(v.d) - 3) },
      s: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.x)] },
    },
    constraints: [{ test: (v) => Number(v.a) + Number(v.x) < Number(v.d), note: 'ჯამი ერთზე ნაკლები იყოს' }],
    answer: (v) => `${v.x}/${v.d}`,
    format: { kind: 'text' },
    distractors: (ctx) => wrong(String(ctx.answer), [
      `${Number(ctx.vars.a) + Number(ctx.vars.x)}/${ctx.vars.d}`,
      `${ctx.vars.x}/${Number(ctx.vars.d) + 1}`,
      `${ctx.vars.a}/${ctx.vars.d}`,
    ]),
    explanation: ({ vars, answer }) =>
      `${Number(vars.a) + Number(vars.x)}/${vars.d} − ${vars.a}/${vars.d} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u08-09', grade: 5, topicId: 'g5-add-sub-fractions', unitId: 'g5-add-sub-fractions', subtopicId: 'u08-09',
    prompt: 'ტორტის {a}/{d} შეჭამეს დილით, {b}/{d} საღამოს. სულ რა ნაწილი შეჭამეს?',
    variables: {
      d: { kind: 'int', min: 6, max: 12 },
      a: { kind: 'int', min: 1, max: (v) => Number(v.d) - 3 },
      b: { kind: 'int', min: 1, max: (v) => Number(v.d) - 3 },
    },
    constraints: [{ test: (v) => Number(v.a) + Number(v.b) < Number(v.d), note: 'ჯამი ერთზე ნაკლები იყოს' }],
    answer: (v) => `${Number(v.a) + Number(v.b)}/${v.d}`,
    format: { kind: 'text' },
    distractors: (ctx) => wrong(String(ctx.answer), [
      `${Number(ctx.vars.a) + Number(ctx.vars.b)}/${Number(ctx.vars.d) * 2}`,
      `${Number(ctx.vars.a) * Number(ctx.vars.b)}/${ctx.vars.d}`,
      `${Number(ctx.vars.a) + Number(ctx.vars.b) + 1}/${ctx.vars.d}`,
    ]),
    explanation: ({ vars, answer }) =>
      `${vars.a}/${vars.d} + ${vars.b}/${vars.d} = ${answer}.`,
  }),

  // ================= U09: წილადების გამრავლება =================
  defineTemplate({
    id: 'g5-u09-01', grade: 5, topicId: 'g5-multiply-fractions', unitId: 'g5-multiply-fractions', subtopicId: 'u09-01',
    prompt: '{a}/{d} × {n} = ?',
    variables: {
      d: { kind: 'int', min: 3, max: 9 },
      a: { kind: 'int', min: 1, max: (v) => Number(v.d) - 1 },
      n: { kind: 'int', min: 2, max: 8 },
    },
    constraints: [
      { test: (v) => (Number(v.a) * Number(v.n)) % Number(v.d) === 0, note: 'შედეგი მთელი იყოს' },
      { test: (v) => gcdOf(Number(v.a), Number(v.d)) === 1, note: 'წილადი უკვე შეკვეცილი იყოს' },
    ],
    answer: (v) => (Number(v.a) * Number(v.n)) / Number(v.d),
    distractors: (ctx) => wrong(Number(ctx.answer), [
      Number(ctx.vars.a) + Number(ctx.vars.n),
      Number(ctx.answer) + Number(ctx.vars.d),
      Number(ctx.answer) + 1,
      Number(ctx.answer) - 1,
      Number(ctx.vars.a) * Number(ctx.vars.n),
      Number(ctx.answer) + 2,
    ].filter((value) => value > 0)),
    explanation: ({ vars, answer }) =>
      `${vars.a} × ${vars.n} = ${Number(vars.a) * Number(vars.n)}; ${Number(vars.a) * Number(vars.n)} ÷ ${vars.d} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u09-02', grade: 5, topicId: 'g5-multiply-fractions', unitId: 'g5-multiply-fractions', subtopicId: 'u09-02',
    prompt: '{a}/{d1} × {b}/{d2} = ?',
    variables: {
      d1: { kind: 'int', min: 3, max: 9 },
      d2: { kind: 'int', min: 3, max: 9 },
      a: { kind: 'int', min: 1, max: (v) => Number(v.d1) - 1 },
      b: { kind: 'int', min: 1, max: (v) => Number(v.d2) - 1 },
    },
    answer: (v) => {
      const num = Number(v.a) * Number(v.b);
      const den = Number(v.d1) * Number(v.d2);
      const g = gcdOf(num, den);
      return `${num / g}/${den / g}`;
    },
    format: { kind: 'text' },
    distractors: (ctx) => {
      const d1 = Number(ctx.vars.d1);
      const d2 = Number(ctx.vars.d2);
      const num = Number(ctx.vars.a) * Number(ctx.vars.b);
      const den = d1 * d2;
      return wrong(String(ctx.answer), [
        `${Number(ctx.vars.a) + Number(ctx.vars.b)}/${den}`,
        `${num}/${d1 + d2}`,
        `${num + 1}/${den}`,
      ]);
    },
    explanation: ({ vars, answer }) =>
      `მრიცხველები: ${vars.a} × ${vars.b} = ${Number(vars.a) * Number(vars.b)}; მნიშვნელები: ${vars.d1} × ${vars.d2} = ${Number(vars.d1) * Number(vars.d2)}, ამიტომ ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u09-03', grade: 5, topicId: 'g5-multiply-fractions', unitId: 'g5-multiply-fractions', subtopicId: 'u09-03',
    prompt: '{w} {a}/{d} × {k} = ? (ჩაწერე არასწორი წილადით)',
    variables: {
      d: { kind: 'int', min: 3, max: 8 },
      a: { kind: 'int', min: 1, max: (v) => Number(v.d) - 1 },
      w: { kind: 'int', min: 1, max: 4 },
      k: { kind: 'int', min: 2, max: 6 },
    },
    answer: (v) => `${(Number(v.w) * Number(v.d) + Number(v.a)) * Number(v.k)}/${v.d}`,
    format: { kind: 'text' },
    distractors: (ctx) => wrong(String(ctx.answer), [
      `${ctx.vars.w} ${Number(ctx.vars.a) * Number(ctx.vars.k)}/${ctx.vars.d}`,
      `${Number(ctx.vars.w) * Number(ctx.vars.d) + Number(ctx.vars.a) * Number(ctx.vars.k)}/${ctx.vars.d}`,
      `${(Number(ctx.vars.w) * Number(ctx.vars.d) + Number(ctx.vars.a)) * Number(ctx.vars.k)}/${Number(ctx.vars.d) + 1}`,
    ]),
    explanation: ({ vars, answer }) =>
      `${vars.w} ${vars.a}/${vars.d} = ${Number(vars.w) * Number(vars.d) + Number(vars.a)}/${vars.d}, ამიტომ ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u09-04', grade: 5, topicId: 'g5-multiply-fractions', unitId: 'g5-multiply-fractions', subtopicId: 'u09-04',
    prompt: '{w} {a}/{d} × {k} = ? (ჩაწერე არასწორი წილადით)',
    variables: {
      d: { kind: 'int', min: 3, max: 8 },
      a: { kind: 'int', min: 1, max: (v) => Number(v.d) - 1 },
      w: { kind: 'int', min: 1, max: 4 },
      k: { kind: 'int', min: 2, max: 6 },
    },
    answer: (v) => `${(Number(v.w) * Number(v.d) + Number(v.a)) * Number(v.k)}/${v.d}`,
    format: { kind: 'text' },
    distractors: (ctx) => wrong(String(ctx.answer), [
      `${Number(ctx.vars.w) * Number(ctx.vars.d) * Number(ctx.vars.k)}/${ctx.vars.d}`,
      `${(Number(ctx.vars.w) * Number(ctx.vars.d) + Number(ctx.vars.a)) * Number(ctx.vars.k)}/${Number(ctx.vars.d) + 1}`,
      `${Number(ctx.vars.w) * Number(ctx.vars.k) + Number(ctx.vars.a)}/${ctx.vars.d}`,
    ]),
    explanation: ({ vars, answer }) =>
      `${vars.w} ${vars.a}/${vars.d} = ${Number(vars.w) * Number(vars.d) + Number(vars.a)}/${vars.d}; ${Number(vars.w) * Number(vars.d) + Number(vars.a)} × ${vars.k} = ${(Number(vars.w) * Number(vars.d) + Number(vars.a)) * Number(vars.k)}, ამიტომ ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u09-05', grade: 5, topicId: 'g5-multiply-fractions', unitId: 'g5-multiply-fractions', subtopicId: 'u09-05',
    prompt: '{a}/{d} × {n}-ის ნამრავლი მეტია თუ ნაკლები {a}/{d}-ზე?',
    variables: {
      d: { kind: 'int', min: 3, max: 9 },
      a: { kind: 'int', min: 1, max: (v) => Number(v.d) - 1 },
      n: { kind: 'int', min: 2, max: 6 },
    },
    answer: () => 'მეტია',
    format: { kind: 'text' },
    optionCount: 2,
    options: () => ['მეტია', 'ნაკლებია'],
    explanation: ({ vars, answer }) =>
      `${vars.n} 1-ზე მეტია, ამიტომ ${vars.a}/${vars.d} × ${vars.n} ${answer} ${vars.a}/${vars.d}-ზე.`,
  }),

  defineTemplate({
    id: 'g5-u09-06', grade: 5, topicId: 'g5-multiply-fractions', unitId: 'g5-multiply-fractions', subtopicId: 'u09-06',
    prompt: '{a}/{d} × {b}/{d} × {n} = ?',
    variables: {
      d: { kind: 'int', min: 2, max: 6 },
      a: { kind: 'int', min: 1, max: (v) => Number(v.d) - 1 },
      b: { kind: 'int', min: 1, max: (v) => Number(v.d) - 1 },
      n: { kind: 'int', min: 2, max: 6 },
    },
    constraints: [{ test: (v) => Number(v.a) < Number(v.b) && (Number(v.a) * Number(v.b) * Number(v.n)) > 0, note: 'a < b და ნამრავლი დადებითი' }],
    answer: (v) => `${Number(v.a) * Number(v.b) * Number(v.n)}/${Number(v.d) * Number(v.d)}`,
    format: { kind: 'text' },
    distractors: (ctx) => {
      const den = Number(ctx.vars.d) * Number(ctx.vars.d);
      const num = Number(ctx.vars.a) * Number(ctx.vars.b) * Number(ctx.vars.n);
      return wrong(String(ctx.answer), [
        `${Number(ctx.vars.a) * Number(ctx.vars.b)}/${den}`,
        `${num}/${den + 1}`,
        `${num + Number(ctx.vars.d)}/${den}`,
      ]);
    },
    explanation: ({ vars, answer }) =>
      `${vars.a} × ${vars.b} × ${vars.n} = ${Number(vars.a) * Number(vars.b) * Number(vars.n)}; ${vars.d} × ${vars.d} = ${Number(vars.d) * Number(vars.d)}, ამიტომ ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u09-07', grade: 5, topicId: 'g5-multiply-fractions', unitId: 'g5-multiply-fractions', subtopicId: 'u09-07',
    prompt: '{w1} {a}/{d} × {w2} = ? (ჩაწერე არასწორი წილადით)',
    variables: {
      d: { kind: 'int', min: 3, max: 8 },
      a: { kind: 'int', min: 1, max: (v) => Number(v.d) - 1 },
      w1: { kind: 'int', min: 1, max: 4 },
      w2: { kind: 'int', min: 2, max: 4 },
    },
    answer: (v) => `${(Number(v.w1) * Number(v.d) + Number(v.a)) * Number(v.w2)}/${v.d}`,
    format: { kind: 'text' },
    distractors: (ctx) => wrong(String(ctx.answer), [
      `${Number(ctx.vars.w1) * Number(ctx.vars.w2)}/${ctx.vars.d}`,
      `${(Number(ctx.vars.w1) * Number(ctx.vars.d) + Number(ctx.vars.a)) * Number(ctx.vars.w2)}/${Number(ctx.vars.d) + 1}`,
      `${Number(ctx.vars.w1) * Number(ctx.vars.d) + Number(ctx.vars.a) * Number(ctx.vars.w2)}/${ctx.vars.d}`,
    ]),
    explanation: ({ vars, answer }) =>
      `${vars.w1} ${vars.a}/${vars.d} = ${Number(vars.w1) * Number(vars.d) + Number(vars.a)}/${vars.d}; × ${vars.w2} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u09-08', grade: 5, topicId: 'g5-multiply-fractions', unitId: 'g5-multiply-fractions', subtopicId: 'u09-08',
    prompt: 'ერთი პური {w} {a}/{d} კგ-ია. {k} ასეთი პური სულ რამდენი კგ-ია? (ჩაწერე არასწორი წილადით)',
    variables: {
      d: { kind: 'int', min: 2, max: 5 },
      a: { kind: 'int', min: 1, max: (v) => Number(v.d) - 1 },
      w: { kind: 'int', min: 1, max: 3 },
      k: { kind: 'int', min: 2, max: 5 },
    },
    answer: (v) => `${(Number(v.w) * Number(v.d) + Number(v.a)) * Number(v.k)}/${v.d}`,
    format: { kind: 'text' },
    distractors: (ctx) => wrong(String(ctx.answer), [
      `${Number(ctx.vars.w) * Number(ctx.vars.k)}/${ctx.vars.d}`,
      `${(Number(ctx.vars.w) * Number(ctx.vars.d) + Number(ctx.vars.a)) * Number(ctx.vars.k)}/${Number(ctx.vars.d) + 1}`,
      `${Number(ctx.vars.w) * Number(ctx.vars.d) + Number(ctx.vars.a) * Number(ctx.vars.k)}/${ctx.vars.d}`,
    ]),
    explanation: ({ vars, answer }) =>
      `${vars.k} × (${vars.w} ${vars.a}/${vars.d}) = ${answer}.`,
  }),

  // ================= U10: წილადების გაყოფა =================
  defineTemplate({
    id: 'g5-u10-01', grade: 5, topicId: 'g5-divide-fractions', unitId: 'g5-divide-fractions', subtopicId: 'u10-01',
    prompt: '{a}/{d} ÷ {n} = ?',
    variables: {
      d: { kind: 'int', min: 2, max: 6 },
      k: { kind: 'int', min: 2, max: 6 },
      a: { kind: 'int', min: 1, max: 4 },
      n: { kind: 'int', min: 2, max: 5 },
    },
    constraints: [
      { test: (v) => Number(v.a) * Number(v.n) <= 12, note: 'მრიცხველი არ გაიზარდოს ზედმეტად' },
      { test: (v) => Number(v.a) < Number(v.d), note: 'წილადი ერთზე ნაკლები იყოს' },
      { test: (v) => gcdOf(Number(v.a), Number(v.d) * Number(v.n)) === 1, note: 'შედეგი შეკვეცილი იყოს' },
    ],
    answer: (v) => `${v.a}/${Number(v.d) * Number(v.n)}`,
    format: { kind: 'text' },
    distractors: (ctx) => wrong(String(ctx.answer), [
      `${Number(ctx.vars.a) * Number(ctx.vars.n)}/${ctx.vars.d}`,
      `${ctx.vars.a}/${Number(ctx.vars.d) + Number(ctx.vars.n)}`,
      `${Number(ctx.vars.a) + Number(ctx.vars.n)}/${ctx.vars.d}`,
      `${Number(ctx.vars.a) * Number(ctx.vars.n)}/${Number(ctx.vars.d) * Number(ctx.vars.n)}`,
      `${Number(ctx.vars.a)}/${Number(ctx.vars.d) - 1}`,
    ]),
    explanation: ({ vars, answer }) =>
      `მთელზე გაყოფისას მნიშვნელი მრავლდება: ${vars.d} × ${vars.n} = ${Number(vars.d) * Number(vars.n)}, ამიტომ ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u10-02', grade: 5, topicId: 'g5-divide-fractions', unitId: 'g5-divide-fractions', subtopicId: 'u10-02',
    prompt: '{n} ÷ {a}/{d} = ?',
    variables: {
      d: { kind: 'int', min: 2, max: 6 },
      a: { kind: 'int', min: 1, max: 4 },
      n: { kind: 'int', min: 2, max: 9 },
    },
    constraints: [
      { test: (v) => Number(v.a) < Number(v.d), note: 'წილადი ერთზე ნაკლები იყოს' },
      { test: (v) => (Number(v.n) * Number(v.d)) % Number(v.a) === 0, note: 'შედეგი მთელი იყოს' },
    ],
    answer: (v) => (Number(v.n) * Number(v.d)) / Number(v.a),
    distractors: (ctx) => wrong(Number(ctx.answer), [
      Math.floor(Number(ctx.vars.n) / Number(ctx.vars.d)),
      Number(ctx.answer) + Number(ctx.vars.a),
      Number(ctx.vars.n) * Number(ctx.vars.a),
    ]),
    explanation: ({ vars, answer }) =>
      `${vars.n} ÷ ${vars.a}/${vars.d} = ${vars.n} × ${vars.d}/${vars.a} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u10-03', grade: 5, topicId: 'g5-divide-fractions', unitId: 'g5-divide-fractions', subtopicId: 'u10-03',
    prompt: '{a}/{d1} ÷ {b}/{d2} = ?',
    variables: {
      d1: { kind: 'int', min: 2, max: 8 },
      d2: { kind: 'int', min: 2, max: 8 },
      a: { kind: 'int', min: 1, max: (v) => Number(v.d1) - 1 },
      b: { kind: 'int', min: 1, max: (v) => Number(v.d2) - 1 },
    },
    answer: (v) => {
      const num = Number(v.a) * Number(v.d2);
      const den = Number(v.d1) * Number(v.b);
      const g = gcdOf(num, den);
      return `${num / g}/${den / g}`;
    },
    format: { kind: 'text' },
    distractors: (ctx) => {
      const d1 = Number(ctx.vars.d1);
      const d2 = Number(ctx.vars.d2);
      return wrong(String(ctx.answer), [
        `${Number(ctx.vars.a) * Number(ctx.vars.b)}/${d1 * d2}`,
        `${d1 * Number(ctx.vars.b)}/${Number(ctx.vars.a) * d2}`,
        `${Number(ctx.vars.a) * d2}/${d1 * Number(ctx.vars.b) + 1}`,
      ]);
    },
    explanation: ({ vars, answer }) =>
      `გაყოფა შევცვალოთ გამრავლებით შებრუნებულზე: ${vars.a}/${vars.d1} × ${vars.d2}/${vars.b} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u10-04', grade: 5, topicId: 'g5-divide-fractions', unitId: 'g5-divide-fractions', subtopicId: 'u10-04',
    prompt: '{w} {a}/{d} ÷ {k} = ? (ჩაწერე არასწორი წილადით)',
    variables: {
      d: { kind: 'int', min: 2, max: 6 },
      a: { kind: 'int', min: 1, max: (v) => Number(v.d) - 1 },
      w: { kind: 'int', min: 1, max: 4 },
      k: { kind: 'int', min: 2, max: 5 },
    },
    answer: (v) => `${Number(v.w) * Number(v.d) + Number(v.a)}/${Number(v.d) * Number(v.k)}`,
    format: { kind: 'text' },
    distractors: (ctx) => wrong(String(ctx.answer), [
      `${(Number(ctx.vars.w) * Number(ctx.vars.d) + Number(ctx.vars.a)) * Number(ctx.vars.k)}/${ctx.vars.d}`,
      `${Number(ctx.vars.w) * Number(ctx.vars.d) + Number(ctx.vars.a)}/${Number(ctx.vars.d) + Number(ctx.vars.k)}`,
      `${Number(ctx.vars.w)}/${Number(ctx.vars.d) * Number(ctx.vars.k)}`,
    ]),
    explanation: ({ vars, answer }) =>
      `${vars.w} ${vars.a}/${vars.d} = ${Number(vars.w) * Number(vars.d) + Number(vars.a)}/${vars.d}; ÷ ${vars.k} → ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u10-05', grade: 5, topicId: 'g5-divide-fractions', unitId: 'g5-divide-fractions', subtopicId: 'u10-05',
    prompt: '{total} კგ შაქარი უნდა ჩაიყაროს {a}/{d} კგ-იან პაკეტებში. რამდენი პაკეტი გამოვა?',
    variables: {
      d: { kind: 'int', min: 3, max: 8 },
      a: { kind: 'int', min: 1, max: 3 },
      k: { kind: 'int', min: 2, max: 9 },
      total: { kind: 'choice', values: (v) => [Number(v.a) * Number(v.k)] },
    },
    constraints: [{ test: (v) => Number(v.a) < Number(v.d), note: 'წილადი ერთზე ნაკლები იყოს' }],
    answer: (v) => (Number(v.total) * Number(v.d)) / Number(v.a),
    distractors: (ctx) => wrong(Number(ctx.answer), [
      Number(ctx.vars.k),
      Number(ctx.vars.total) * Number(ctx.vars.a),
      Number(ctx.answer) + Number(ctx.vars.d),
    ]),
    explanation: ({ vars, answer }) =>
      `${vars.total} ÷ ${vars.a}/${vars.d} = ${vars.total} × ${vars.d}/${vars.a} = ${answer} პაკეტი.`,
  }),

  // ================= U11: ათწილადები =================
  defineTemplate({
    id: 'g5-u11-01', grade: 5, topicId: 'g5-decimals', unitId: 'g5-decimals', subtopicId: 'u11-01',
    prompt: 'ჩაწერე ათწილადის სახით: {w} მთელი და {t} მეათედი.',
    variables: {
      w: { kind: 'int', min: 1, max: 9 },
      t: { kind: 'int', min: 1, max: 9 },
    },
    answer: (v) => `${v.w},${v.t}`,
    format: { kind: 'text' },
    distractors: (ctx) => wrong(String(ctx.answer), [
      `${ctx.vars.t},${ctx.vars.w}`,
      `${ctx.vars.w},0${ctx.vars.t}`,
      `${Number(ctx.vars.w) + 1},${ctx.vars.t}`,
    ]),
    explanation: ({ vars, answer }) =>
      `${vars.w} მთელი და ${vars.t} მეათედი იწერება როგორც ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u11-02', grade: 5, topicId: 'g5-decimals', unitId: 'g5-decimals', subtopicId: 'u11-02',
    prompt: 'რომელია მეტი: {a} თუ {b}?',
    variables: {
      w1: { kind: 'int', min: 1, max: 9 },
      t1: { kind: 'int', min: 1, max: 9 },
      w2: { kind: 'int', min: 1, max: 9 },
      t2: { kind: 'int', min: 1, max: 9 },
      a: { kind: 'choice', values: (v) => [`${v.w1},${v.t1}`] },
      b: { kind: 'choice', values: (v) => [`${v.w2},${v.t2}`] },
    },
    constraints: [{ test: (v) => String(v.a) !== String(v.b), note: 'რიცხვები სხვადასხვა იყოს' }],
    answer: (v) => (decValue(String(v.a)) > decValue(String(v.b)) ? String(v.a) : String(v.b)),
    format: { kind: 'text' },
    optionCount: 2,
    options: (v) => [String(v.a), String(v.b)],
    explanation: ({ vars, answer }) =>
      `${vars.a} და ${vars.b} შევადარეთ ათეულებისა და მეათედების მიხედვით; მეტია ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u11-03', grade: 5, topicId: 'g5-decimals', unitId: 'g5-decimals', subtopicId: 'u11-03',
    prompt: 'ჩაწერე წილადის სახით: 0,{t}',
    variables: { t: { kind: 'choice', values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 15, 25, 35, 45, 55, 65, 75, 85, 95] } },
    answer: (v) => `${v.t}/10`,
    format: { kind: 'text' },
    distractors: (ctx) => wrong(String(ctx.answer), [
      `${ctx.vars.t}/100`,
      `10/${ctx.vars.t}`,
      `${ctx.vars.t}/1`,
    ]),
    explanation: ({ vars, answer }) => `0,${vars.t} არის ${vars.t} მეათედი, ანუ ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u11-04', grade: 5, topicId: 'g5-decimals', unitId: 'g5-decimals', subtopicId: 'u11-04',
    prompt: '{a} + {b} = ?',
    variables: {
      w1: { kind: 'int', min: 1, max: 9 },
      t1: { kind: 'int', min: 1, max: 8 },
      w2: { kind: 'int', min: 1, max: 9 },
      t2: { kind: 'int', min: 1, max: 9 },
      a: { kind: 'choice', values: (v) => [`${v.w1},${v.t1}`] },
      b: { kind: 'choice', values: (v) => [`${v.w2},${v.t2}`] },
    },
    constraints: [{ test: (v) => Number(v.t1) + Number(v.t2) < 10, note: 'მეათედების გადატანა არ იყოს' }],
    answer: (v) => {
      const tenths = (Number(v.w1) * 10 + Number(v.t1)) + (Number(v.w2) * 10 + Number(v.t2));
      return `${Math.floor(tenths / 10)},${tenths % 10}`;
    },
    format: { kind: 'text' },
    distractors: (ctx) => {
      const left = Number(ctx.vars.w1) * 10 + Number(ctx.vars.t1);
      const right = Number(ctx.vars.w2) * 10 + Number(ctx.vars.t2);
      const show = (tenths: number) => `${Math.floor(tenths / 10)},${tenths % 10}`;
      return wrong(String(ctx.answer), [
        show(left + right + 10),
        show(left + right - 10),
        show(left + right + 1),
        show(left + right - 1),
        show(Number(ctx.vars.w1) * 10 + Number(ctx.vars.w2) * 10),
      ]);
    },
    explanation: ({ vars, answer }) =>
      `მეათედებით: ${Number(vars.w1) * 10 + Number(vars.t1)} + ${Number(vars.w2) * 10 + Number(vars.t2)} = ${Number(vars.w1) * 10 + Number(vars.t1) + Number(vars.w2) * 10 + Number(vars.t2)} მეათედი, ანუ ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u11-05', grade: 5, topicId: 'g5-decimals', unitId: 'g5-decimals', subtopicId: 'u11-05',
    prompt: '{a} − {b} = ?',
    variables: {
      w1: { kind: 'int', min: 4, max: 9 },
      t1: { kind: 'int', min: 3, max: 9 },
      w2: { kind: 'int', min: 1, max: 3 },
      t2: { kind: 'int', min: 1, max: 2 },
      a: { kind: 'choice', values: (v) => [`${v.w1},${v.t1}`] },
      b: { kind: 'choice', values: (v) => [`${v.w2},${v.t2}`] },
    },
    answer: (v) => {
      const tenths = (Number(v.w1) * 10 + Number(v.t1)) - (Number(v.w2) * 10 + Number(v.t2));
      return `${Math.floor(tenths / 10)},${tenths % 10}`;
    },
    format: { kind: 'text' },
    distractors: (ctx) => {
      const left = Number(ctx.vars.w1) * 10 + Number(ctx.vars.t1);
      const right = Number(ctx.vars.w2) * 10 + Number(ctx.vars.t2);
      const show = (tenths: number) => `${Math.floor(tenths / 10)},${Math.abs(tenths % 10)}`;
      return wrong(String(ctx.answer), [
        show(left - right + 10),
        show(left - right - 10),
        show(left - right + 1),
        show(left - right - 1),
        show(left + right),
      ]);
    },
    explanation: ({ vars, answer }) =>
      `მეათედებით: ${Number(vars.w1) * 10 + Number(vars.t1)} − ${Number(vars.w2) * 10 + Number(vars.t2)} = ${Number(vars.w1) * 10 + Number(vars.t1) - Number(vars.w2) * 10 - Number(vars.t2)} მეათედი, ანუ ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u11-06', grade: 5, topicId: 'g5-decimals', unitId: 'g5-decimals', subtopicId: 'u11-06',
    prompt: '{a} × {k} = ?',
    variables: {
      w: { kind: 'int', min: 1, max: 9 },
      t: { kind: 'int', min: 1, max: 9 },
      a: { kind: 'choice', values: (v) => [`${v.w},${v.t}`] },
      k: { kind: 'choice', values: [10, 100] },
    },
    answer: (v) => String(Number(String(v.a).replace(',', '.')) * Number(v.k)).replace('.', ','),
    format: { kind: 'text' },
    distractors: (ctx) => wrong(String(ctx.answer), [
      String(Number(String(ctx.vars.a).replace(',', '.')) * Number(ctx.vars.k) / 10).replace('.', ','),
      String(Number(String(ctx.vars.a).replace(',', '.')) * Number(ctx.vars.k) * 10).replace('.', ','),
      String(Number(String(ctx.vars.a).replace(',', '.')) + Number(ctx.vars.k)).replace('.', ','),
    ]),
    explanation: ({ vars, answer }) =>
      `${vars.k}-ზე გამრავლებისას ათწილადის წერტილი იწევს მარჯვნივ: ${vars.a} × ${vars.k} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u11-07', grade: 5, topicId: 'g5-decimals', unitId: 'g5-decimals', subtopicId: 'u11-07',
    prompt: '{a} ÷ 10 = ?',
    variables: {
      w: { kind: 'int', min: 2, max: 9 },
      t: { kind: 'int', min: 1, max: 9 },
      a: { kind: 'choice', values: (v) => [`${v.w}${v.t}`] },
    },
    answer: (v) => `${v.w},${v.t}`,
    format: { kind: 'text' },
    distractors: (ctx) => wrong(String(ctx.answer), [
      `${ctx.vars.w}${ctx.vars.t}0,${ctx.vars.t}`,
      `${Number(ctx.vars.w) + 1},${ctx.vars.t}`,
      `${ctx.vars.t},${ctx.vars.w}`,
    ]),
    explanation: ({ vars, answer }) =>
      `10-ზე გაყოფისას წერტილი იწევს მარცხნივ ერთი ციფრით: ${vars.a} ÷ 10 = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u11-08', grade: 5, topicId: 'g5-decimals', unitId: 'g5-decimals', subtopicId: 'u11-08',
    prompt: 'ერთი კგ ვაშლი ღირს {a} ლარი. {k} კგ ვაშლი რამდენი ლარი ღირს?',
    variables: {
      w: { kind: 'int', min: 1, max: 3 },
      t: { kind: 'int', min: 2, max: 9 },
      a: { kind: 'choice', values: (v) => [`${v.w},${v.t}`] },
      k: { kind: 'int', min: 2, max: 5 },
    },
    answer: (v) => String(Number(String(v.a).replace(',', '.')) * Number(v.k)).replace('.', ','),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const value = Number(String(ctx.vars.a).replace(',', '.')) * Number(ctx.vars.k);
      return wrong(String(ctx.answer), [
        String(value + Number(ctx.vars.k)).replace('.', ','),
        String(value - 1).replace('.', ','),
        String(Number(String(ctx.vars.a).replace(',', '.')) + Number(ctx.vars.k)).replace('.', ','),
      ]);
    },
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.k} = ${answer} ლარი.`,
  }),

  // ================= U12: პროცენტები =================
  defineTemplate({
    id: 'g5-u12-01', grade: 5, topicId: 'g5-percents', unitId: 'g5-percents', subtopicId: 'u12-01',
    prompt: 'იპოვე {n}-ის {p}%.',
    variables: {
      n: { kind: 'choice', values: [40, 60, 80, 100, 120, 140, 160, 200, 240, 300] },
      p: { kind: 'choice', values: [10, 25, 50] },
    },
    constraints: [{ test: (v) => (Number(v.n) * Number(v.p)) % 100 === 0, note: 'პასუხი მთელი იყოს' }],
    answer: (v) => (Number(v.n) * Number(v.p)) / 100,
    distractors: (ctx) => wrong(Number(ctx.answer), [
      Number(ctx.vars.n) / 10,
      Number(ctx.answer) + 10,
      Number(ctx.answer) * 2,
    ]),
    explanation: ({ vars, answer }) =>
      `${vars.n} ÷ 100 = ${Number(vars.n) / 100}; ${Number(vars.n) / 100} × ${vars.p} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u12-02', grade: 5, topicId: 'g5-percents', unitId: 'g5-percents', subtopicId: 'u12-02',
    prompt: '{part} {whole}-ის რამდენი პროცენტია?',
    variables: {
      whole: { kind: 'choice', values: [20, 40, 50, 100, 200, 400] },
      p: { kind: 'choice', values: [5, 10, 20, 25, 50] },
      part: { kind: 'choice', values: (v) => [(Number(v.whole) * Number(v.p)) / 100] },
    },
    answer: (v) => (Number(v.part) / Number(v.whole)) * 100,
    distractors: (ctx) => wrong(Number(ctx.answer), [
      Number(ctx.answer) * 2,
      Number(ctx.answer) / 2,
      Number(ctx.answer) + 10,
    ]),
    explanation: ({ vars, answer }) =>
      `${vars.part} ÷ ${vars.whole} = ${Number(vars.part) / Number(vars.whole)}; × 100 = ${answer}%.`,
  }),

  defineTemplate({
    id: 'g5-u12-03', grade: 5, topicId: 'g5-percents', unitId: 'g5-percents', subtopicId: 'u12-03',
    prompt: 'ნივთი ღირს {price} ლარი. ფასდაკლება {p}%. რამდენი ლარია ახალი ფასი?',
    variables: {
      price: { kind: 'choice', values: [20, 40, 60, 80, 100, 120, 200] },
      p: { kind: 'choice', values: [10, 20, 25, 50] },
    },
    constraints: [{ test: (v) => (Number(v.price) * Number(v.p)) % 100 === 0, note: 'ფასდაკლება მთელი იყოს' }],
    answer: (v) => Number(v.price) - (Number(v.price) * Number(v.p)) / 100,
    distractors: (ctx) => wrong(Number(ctx.answer), [
      (Number(ctx.vars.price) * Number(ctx.vars.p)) / 100,
      Number(ctx.vars.price) + (Number(ctx.vars.price) * Number(ctx.vars.p)) / 100,
      Number(ctx.vars.price),
    ]),
    explanation: ({ vars, answer }) =>
      `ფასდაკლება: ${vars.price} × ${vars.p} ÷ 100 = ${(Number(vars.price) * Number(vars.p)) / 100} ლარი; ახალი ფასი: ${answer} ლარი.`,
  }),

  defineTemplate({
    id: 'g5-u12-04', grade: 5, topicId: 'g5-percents', unitId: 'g5-percents', subtopicId: 'u12-04',
    prompt: '{a}/{d} რამდენი პროცენტია?',
    variables: {
      d: { kind: 'choice', values: [2, 4, 5, 10, 20, 25, 50] },
      a: { kind: 'int', min: 1, max: (v) => Number(v.d) - 1 },
    },
    constraints: [{ test: (v) => (100 * Number(v.a)) % Number(v.d) === 0, note: 'პროცენტი მთელი იყოს' }],
    answer: (v) => (100 * Number(v.a)) / Number(v.d),
    distractors: (ctx) => [
      Number(ctx.answer) * 2,
      Number(ctx.vars.d),
      Number(ctx.answer) + 10,
    ].filter((value) => value !== Number(ctx.answer) && value > 0),
    explanation: ({ vars, answer }) =>
      `${vars.a}/${vars.d} = ${Number(vars.a) / Number(vars.d)}, ანუ ${answer}%.`,
  }),

  defineTemplate({
    id: 'g5-u12-05', grade: 5, topicId: 'g5-percents', unitId: 'g5-percents', subtopicId: 'u12-05',
    prompt: '{a} რამდენი პროცენტია?',
    variables: {
      d: { kind: 'choice', values: ['0,25|25', '0,5|50', '0,75|75', '0,1|10', '0,2|20', '0,4|40', '0,6|60', '0,8|80', '1,5|150', '0,05|5', '0,3|30', '0,7|70', '0,9|90', '0,35|35', '0,45|45', '0,15|15', '1,2|120', '2,5|250'] },
      a: { kind: 'choice', values: (v) => [String(v.d).split('|')[0]] },
      p: { kind: 'choice', values: (v) => [Number(String(v.d).split('|')[1])] },
    },
    answer: (v) => Number(v.p),
    distractors: (ctx) => [
      Number(ctx.answer) + 5,
      Number(ctx.answer) - 5,
      Number(ctx.answer) / 10,
    ].filter((value) => value > 0 && value !== Number(ctx.answer)),
    explanation: ({ vars, answer }) => `${vars.a} × 100 = ${answer}%.`,
  }),

  defineTemplate({
    id: 'g5-u12-06', grade: 5, topicId: 'g5-percents', unitId: 'g5-percents', subtopicId: 'u12-06',
    prompt: '{p}% რიცხვისა არის {part}. რა არის მთელი რიცხვი?',
    variables: {
      whole: { kind: 'choice', values: [40, 60, 80, 100, 120, 200, 400] },
      p: { kind: 'choice', values: [10, 20, 25, 50] },
      part: { kind: 'choice', values: (v) => [(Number(v.whole) * Number(v.p)) / 100] },
    },
    answer: (v) => Number(v.whole),
    distractors: (ctx) => [
      Number(ctx.answer) * 2,
      Number(ctx.answer) / 2,
      Number(ctx.vars.part) * 2,
    ].filter((value) => value > 0 && value !== Number(ctx.answer)),
    explanation: ({ vars, answer }) =>
      `${vars.p}% = ${vars.part}, ამიტომ 1% = ${Number(vars.part) / Number(vars.p)}, მთელი = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u12-07', grade: 5, topicId: 'g5-percents', unitId: 'g5-percents', subtopicId: 'u12-07',
    prompt: 'კლასში {whole} მოსწავლეა, მათგან {p}% გოგონაა. რამდენი ბიჭია?',
    variables: {
      whole: { kind: 'choice', values: [20, 40, 50, 100, 200] },
      p: { kind: 'choice', values: [10, 20, 25, 40, 50] },
    },
    constraints: [{ test: (v) => (Number(v.whole) * Number(v.p)) % 100 === 0, note: 'გოგონების რაოდენობა მთელი იყოს' }],
    answer: (v) => Number(v.whole) - (Number(v.whole) * Number(v.p)) / 100,
    distractors: (ctx) => wrong(Number(ctx.answer), [
      (Number(ctx.vars.whole) * Number(ctx.vars.p)) / 100,
      Number(ctx.vars.whole),
      Number(ctx.vars.whole) / 2,
    ]),
    explanation: ({ vars, answer }) =>
      `გოგონები: ${vars.whole} × ${vars.p} ÷ 100 = ${(Number(vars.whole) * Number(vars.p)) / 100}; ბიჭები: ${answer}.`,
  }),

  // ================= U13: გაზომვა და მასშტაბი =================
  defineTemplate({
    id: 'g5-u13-01', grade: 5, topicId: 'g5-measurement-scale', unitId: 'g5-measurement-scale', subtopicId: 'u13-01',
    prompt: 'გადაიყვანე: {v} {from} = ? {to}',
    variables: {
      pair: { kind: 'choice', values: ['კგ|გ|1000', 'მ|სმ|100', 'კმ|მ|1000', 'სმ|მმ|10', 'ტ|კგ|1000'] },
      v: { kind: 'int', min: 2, max: 19 },
      from: { kind: 'choice', values: (v) => [String(v.pair).split('|')[0]] },
      to: { kind: 'choice', values: (v) => [String(v.pair).split('|')[1]] },
      factor: { kind: 'choice', values: (v) => [Number(String(v.pair).split('|')[2])] },
    },
    answer: (v) => Number(v.v) * Number(v.factor),
    distractors: (ctx) => [
      Number(ctx.answer) * 10,
      Number(ctx.answer) / 10,
      Number(ctx.answer) + Number(ctx.vars.factor),
    ].filter((value) => value > 0 && value !== Number(ctx.answer) && Number.isInteger(value)),
    explanation: ({ vars, answer }) =>
      `1 ${vars.from} = ${vars.factor} ${vars.to}, ამიტომ ${vars.v} × ${vars.factor} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u13-02', grade: 5, topicId: 'g5-measurement-scale', unitId: 'g5-measurement-scale', subtopicId: 'u13-02',
    prompt: 'გადაიყვანე: {v} {from} = ? {to}',
    variables: {
      pair: { kind: 'choice', values: ['m²|dm²|100', 'dm²|sm²|100', 'l|ml|1000', 'm³|l|1000'] },
      v: { kind: 'int', min: 2, max: 9 },
      from: { kind: 'choice', values: (v) => [String(v.pair).split('|')[0]] },
      to: { kind: 'choice', values: (v) => [String(v.pair).split('|')[1]] },
      factor: { kind: 'choice', values: (v) => [Number(String(v.pair).split('|')[2])] },
    },
    answer: (v) => Number(v.v) * Number(v.factor),
    distractors: (ctx) => [
      Number(ctx.answer) / 10,
      Number(ctx.answer) * 10,
      Number(ctx.vars.v) * 10,
    ].filter((value) => value > 0 && value !== Number(ctx.answer) && Number.isInteger(value)),
    explanation: ({ vars, answer }) =>
      `1 ${vars.from} = ${vars.factor} ${vars.to}, ამიტომ ${vars.v} × ${vars.factor} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u13-03', grade: 5, topicId: 'g5-measurement-scale', unitId: 'g5-measurement-scale', subtopicId: 'u13-03',
    prompt: '{a} მ {b} სმ + {c} მ {d} სმ = ? სმ',
    variables: {
      a: { kind: 'int', min: 1, max: 8 },
      b: { kind: 'int', min: 10, max: 90, step: 10 },
      c: { kind: 'int', min: 1, max: 8 },
      d: { kind: 'int', min: 10, max: 80, step: 10 },
    },
    answer: (v) => (Number(v.a) + Number(v.c)) * 100 + Number(v.b) + Number(v.d),
    distractors: (ctx) => [
      Number(ctx.answer) + 100,
      Number(ctx.answer) - 10,
      (Number(ctx.vars.a) + Number(ctx.vars.c)) * 100 + Number(ctx.vars.b),
    ].filter((value) => value > 0 && value !== Number(ctx.answer)),
    explanation: ({ vars, answer }) =>
      `${vars.a} მ + ${vars.c} მ = ${Number(vars.a) + Number(vars.c)} მ; ${vars.b} + ${vars.d} = ${Number(vars.b) + Number(vars.d)} სმ; სულ ${answer} სმ.`,
  }),

  defineTemplate({
    id: 'g5-u13-04', grade: 5, topicId: 'g5-measurement-scale', unitId: 'g5-measurement-scale', subtopicId: 'u13-04',
    prompt: 'რომელია მეტი: {v1} {u1} თუ {v2} {u2}?',
    variables: {
      pair: { kind: 'choice', values: ['3|m|250|sm', '2|kg|1800|g', '5|km|4500|m', '4|t|3500|kg', '6|m|560|sm', '7|m|650|sm', '3|kg|2500|g', '8|km|7800|m', '2|t|1500|kg', '9|m|850|sm', '4|m|380|sm', '5|kg|4900|g', '6|km|5800|m', '3|t|2800|kg', '2|m|190|sm', '7|kg|6900|g'] },
      v1: { kind: 'choice', values: (v) => [Number(String(v.pair).split('|')[0])] },
      u1: { kind: 'choice', values: (v) => [String(v.pair).split('|')[1]] },
      v2: { kind: 'choice', values: (v) => [Number(String(v.pair).split('|')[2])] },
      u2: { kind: 'choice', values: (v) => [String(v.pair).split('|')[3]] },
    },
    answer: (v) => {
      const units: Record<string, number> = { m: 100, sm: 1, km: 1000, kg: 1000, g: 1, t: 1000000 };
      const left = Number(v.v1) * units[String(v.u1)];
      const right = Number(v.v2) * units[String(v.u2)];
      return left > right ? `${v.v1} ${v.u1}` : `${v.v2} ${v.u2}`;
    },
    format: { kind: 'text' },
    optionCount: 2,
    options: (v) => [`${v.v1} ${v.u1}`, `${v.v2} ${v.u2}`],
    explanation: ({ answer }) =>
      `ერთ ერთეულში გადაყვანის შემდეგ ირკვევა, რომ მეტია ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u13-05', grade: 5, topicId: 'g5-measurement-scale', unitId: 'g5-measurement-scale', subtopicId: 'u13-05',
    prompt: '1 {u} რამდენ {small}-ია?',
    variables: {
      pair: { kind: 'choice', values: ['მ|სმ|100', 'კგ|გ|1000', 'კმ|მ|1000', 'სთ|წთ|60', 'ლ|მლ|1000', 'წთ|წმ|60', 'დმ|სმ|10', 'სმ|მმ|10', 'ც|კგ|100', 'ტ|კგ|1000', 'დღე|სთ|24', 'კვირა|დღე|7', 'სთ|წმ|3600', 'წელი|თვე|12', 'საუკუნე|წელი|100', 'კმ|სმ|100000', 'მ|მმ|1000', 'ტ|ც|10000', 'ლ|სმ³|1000'] },
      u: { kind: 'choice', values: (v) => [String(v.pair).split('|')[0]] },
      small: { kind: 'choice', values: (v) => [String(v.pair).split('|')[1]] },
      factor: { kind: 'choice', values: (v) => [Number(String(v.pair).split('|')[2])] },
    },
    answer: (v) => Number(v.factor),
    distractors: (ctx) => [
      Number(ctx.answer) * 10,
      Number(ctx.answer) / 10,
      Number(ctx.answer) + 100,
    ].filter((value) => value > 0 && value !== Number(ctx.answer) && Number.isInteger(value)),
    explanation: ({ vars, answer }) => `1 ${vars.u} = ${answer} ${vars.small}.`,
  }),

  defineTemplate({
    id: 'g5-u13-06', grade: 5, topicId: 'g5-measurement-scale', unitId: 'g5-measurement-scale', subtopicId: 'u13-06',
    prompt: '{total} სმ არის {m} მ და კიდევ რამდენი სმ?',
    variables: {
      m: { kind: 'int', min: 1, max: 5 },
      r: { kind: 'int', min: 10, max: 90, step: 10 },
      total: { kind: 'choice', values: (v) => [Number(v.m) * 100 + Number(v.r)] },
    },
    answer: (v) => Number(v.total) - Number(v.m) * 100,
    distractors: (ctx) => [
      Number(ctx.answer) + 10,
      Number(ctx.vars.m),
      Number(ctx.vars.total) / 10,
    ].filter((value) => value > 0 && value !== Number(ctx.answer)),
    explanation: ({ vars, answer }) =>
      `${vars.m} მ = ${Number(vars.m) * 100} სმ; ${vars.total} − ${Number(vars.m) * 100} = ${answer} სმ.`,
  }),

  defineTemplate({
    id: 'g5-u13-07', grade: 5, topicId: 'g5-measurement-scale', unitId: 'g5-measurement-scale', subtopicId: 'u13-07',
    prompt: '{a} სმ რამდენჯერ მეტია {b} სმ-ზე?',
    variables: {
      b: { kind: 'int', min: 2, max: 12 },
      k: { kind: 'int', min: 2, max: 8 },
      a: { kind: 'choice', values: (v) => [Number(v.b) * Number(v.k)] },
    },
    answer: (v) => Number(v.a) / Number(v.b),
    distractors: (ctx) => [
      Number(ctx.answer) + 1,
      Number(ctx.answer) - 1,
      Number(ctx.vars.a) - Number(ctx.vars.b),
    ].filter((value) => value > 0 && value !== Number(ctx.answer)),
    explanation: ({ vars, answer }) => `${vars.a} ÷ ${vars.b} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u13-08', grade: 5, topicId: 'g5-measurement-scale', unitId: 'g5-measurement-scale', subtopicId: 'u13-08',
    prompt: 'რუკაზე 1 სმ = {k} კმ. რამდენი კმ-ია {x} სმ?',
    variables: {
      k: { kind: 'choice', values: [5, 10, 15, 20, 25, 50, 100] },
      x: { kind: 'int', min: 2, max: 12 },
    },
    answer: (v) => Number(v.k) * Number(v.x),
    distractors: (ctx) => [
      Number(ctx.vars.k) + Number(ctx.vars.x),
      Number(ctx.answer) + Number(ctx.vars.k),
      Number(ctx.answer) - Number(ctx.vars.k),
    ].filter((value) => value > 0 && value !== Number(ctx.answer)),
    explanation: ({ vars, answer }) => `${vars.x} × ${vars.k} = ${answer} კმ.`,
  }),

  // ================= U14: კოორდინატთა სიბრტყე =================
  defineTemplate({
    id: 'g5-u14-01', grade: 5, topicId: 'g5-coordinate-plane', unitId: 'g5-coordinate-plane', subtopicId: 'u14-01',
    prompt: '({x}, {y}) წერტილი ბადეზე რამდენი უჯრითაა დაშორებული საწყისიდან მარჯვნივ და ზემოთ?',
    hint: 'პასუხი ჩაწერე როგორც "მარჯვნივ, ზემოთ".',
    variables: {
      x: { kind: 'int', min: 1, max: 9 },
      y: { kind: 'int', min: 1, max: 9 },
    },
    answer: (v) => `${v.x}, ${v.y}`,
    format: { kind: 'text' },
    distractors: (ctx) => wrong(String(ctx.answer), [
      `${ctx.vars.y}, ${ctx.vars.x}`,
      `${Number(ctx.vars.x) + 1}, ${ctx.vars.y}`,
      `${ctx.vars.x}, ${Number(ctx.vars.y) + 1}`,
    ]),
    explanation: ({ answer }) =>
      `პირველი რიცხვი მარჯვნივ ნაბიჯია, მეორე — ზემოთ: ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u14-02', grade: 5, topicId: 'g5-coordinate-plane', unitId: 'g5-coordinate-plane', subtopicId: 'u14-02',
    prompt: '({x}, {y}) წერტილი რომელ კვადრატშია? (I: მარჯვნივ-ზემოთ, II: მარცხნივ-ზემოთ, III: მარცხნივ-ქვემოთ, IV: მარჯვნივ-ქვემოთ)',
    variables: {
      x: { kind: 'choice', values: [-9, -8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
      y: { kind: 'choice', values: [-9, -8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9] },
    },
    answer: (v) => {
      const x = Number(v.x);
      const y = Number(v.y);
      if (x > 0 && y > 0) return 'I';
      if (x < 0 && y > 0) return 'II';
      if (x < 0 && y < 0) return 'III';
      return 'IV';
    },
    format: { kind: 'text' },
    options: () => ['I', 'II', 'III', 'IV'],
    explanation: ({ vars, answer }) =>
      `x = ${vars.x} ${Number(vars.x) > 0 ? 'მარჯვნივ' : 'მარცხნივ'}, y = ${vars.y} ${Number(vars.y) > 0 ? 'ზემოთ' : 'ქვემოთ'} — კვადრატი ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u14-03', grade: 5, topicId: 'g5-coordinate-plane', unitId: 'g5-coordinate-plane', subtopicId: 'u14-03',
    prompt: 'წერტილის x კოორდინატია {x}, y კოორდინატია {y}. როგორ ჩაიწერება წერტილი?',
    variables: {
      x: { kind: 'int', min: 1, max: 9 },
      y: { kind: 'int', min: 1, max: 9 },
    },
    answer: (v) => `(${v.x}, ${v.y})`,
    format: { kind: 'text' },
    distractors: (ctx) => wrong(String(ctx.answer), [
      `(${ctx.vars.y}, ${ctx.vars.x})`,
      `(${Number(ctx.vars.x) + 1}, ${ctx.vars.y})`,
      `(${ctx.vars.x}, ${Number(ctx.vars.y) + 1})`,
    ]),
    explanation: ({ answer }) =>
      `ჯერ x იწერება, შემდეგ y: ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u14-04', grade: 5, topicId: 'g5-coordinate-plane', unitId: 'g5-coordinate-plane', subtopicId: 'u14-04',
    prompt: '({x1}, {y1}) და ({x2}, {y2}) წერტილები ერთ ჰორიზონტალურ ხაზზეა. რა მანძილია მათ შორის?',
    variables: {
      x1: { kind: 'int', min: 1, max: 8 },
      dx: { kind: 'int', min: 2, max: 7 },
      x2: { kind: 'choice', values: (v) => [Number(v.x1) + Number(v.dx)] },
      y1: { kind: 'int', min: 1, max: 9 },
      y2: { kind: 'choice', values: (v) => [Number(v.y1)] },
    },
    answer: (v) => Number(v.x2) - Number(v.x1),
    distractors: (ctx) => [
      Number(ctx.answer) + 1,
      Number(ctx.answer) - 1,
      Number(ctx.vars.x1) + Number(ctx.vars.x2),
    ].filter((value) => value > 0 && value !== Number(ctx.answer)),
    explanation: ({ vars, answer }) =>
      `y ერთია, ამიტომ მანძილი x-ების სხვაობაა: ${vars.x2} − ${vars.x1} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u14-05', grade: 5, topicId: 'g5-coordinate-plane', unitId: 'g5-coordinate-plane', subtopicId: 'u14-05',
    prompt: '({x}, {y}) წერტილიდან {dx} უჯრით მარჯვნივ და {dy} უჯრით ზემოთ გადავადექით. რა კოორდინატები ექნება ახალ წერტილს?',
    variables: {
      x: { kind: 'int', min: 0, max: 6 },
      y: { kind: 'int', min: 0, max: 6 },
      dx: { kind: 'int', min: 1, max: 3 },
      dy: { kind: 'int', min: 1, max: 3 },
    },
    answer: (v) => `(${Number(v.x) + Number(v.dx)}, ${Number(v.y) + Number(v.dy)})`,
    format: { kind: 'text' },
    distractors: (ctx) => wrong(String(ctx.answer), [
      `(${Number(ctx.vars.x) + Number(ctx.vars.dy)}, ${Number(ctx.vars.y) + Number(ctx.vars.dx)})`,
      `(${Number(ctx.vars.x) - Number(ctx.vars.dx)}, ${Number(ctx.vars.y) + Number(ctx.vars.dy)})`,
      `(${Number(ctx.vars.x) + Number(ctx.vars.dx)}, ${Number(ctx.vars.y) - Number(ctx.vars.dy)})`,
    ]),
    explanation: ({ vars, answer }) =>
      `x: ${vars.x} + ${vars.dx} = ${Number(vars.x) + Number(vars.dx)}; y: ${vars.y} + ${vars.dy} = ${Number(vars.y) + Number(vars.dy)}, ამიტომ ${answer}.`,
  }),

  // ================= U15: გეომეტრია =================
  defineTemplate({
    id: 'g5-u15-01', grade: 5, topicId: 'g5-geometry', unitId: 'g5-geometry', subtopicId: 'u15-01',
    prompt: '{deg}°-იანი კუთხე როგორია?',
    variables: {
      deg: { kind: 'choice', values: [15, 25, 30, 45, 55, 60, 75, 85, 90, 95, 105, 120, 135, 150, 170, 180] },
    },
    answer: (v) => {
      const deg = Number(v.deg);
      if (deg === 90) return 'მართი';
      if (deg === 180) return 'გაშლილი';
      return deg < 90 ? 'მახვილი' : 'ბლაგვი';
    },
    format: { kind: 'text' },
    options: () => ['მახვილი', 'მართი', 'ბლაგვი', 'გაშლილი'],
    explanation: ({ vars, answer }) =>
      `${vars.deg}° ${Number(vars.deg) < 90 ? 'ნაკლებია 90°-ზე' : Number(vars.deg) === 90 ? 'ტოლია 90°-ის' : Number(vars.deg) === 180 ? 'გაშლილი კუთხეა' : 'მეტია 90°-ზე, მაგრამ ნაკლები 180°-ზე'}, ამიტომ ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u15-02', grade: 5, topicId: 'g5-geometry', unitId: 'g5-geometry', subtopicId: 'u15-02',
    prompt: 'სხივი იწყება {start}°-დან და მთავრდება {end}°-ზე. რამდენი გრადუსია კუთხე?',
    variables: {
      start: { kind: 'choice', values: [0, 10, 20, 30, 40, 50] },
      size: { kind: 'choice', values: [25, 35, 45, 55, 65, 75, 85, 95, 110, 125] },
      end: { kind: 'choice', values: (v) => [Number(v.start) + Number(v.size)] },
    },
    answer: (v) => Number(v.end) - Number(v.start),
    distractors: (ctx) => wrong(Number(ctx.answer), [
      Number(ctx.vars.end),
      Number(ctx.vars.start) + Number(ctx.vars.end),
      Number(ctx.answer) + 10,
    ]),
    explanation: ({ vars, answer }) => `${vars.end} − ${vars.start} = ${answer}°.`,
  }),

  defineTemplate({
    id: 'g5-u15-03', grade: 5, topicId: 'g5-geometry', unitId: 'g5-geometry', subtopicId: 'u15-03',
    prompt: 'ორი მოსაზღვრე კუთხის ჯამი 180°-ია. ერთი მათგანია {a}°. რამდენია მეორე?',
    variables: { a: { kind: 'int', min: 15, max: 165, step: 5 } },
    answer: (v) => 180 - Number(v.a),
    format: { kind: 'integer', min: 15, max: 165, format: (value) => `${value}°` },
    distractors: (ctx) => [
      180 - Number(ctx.answer),
      Number(ctx.answer) + 10,
      Number(ctx.answer) - 10,
    ].filter((value) => value > 0 && value !== Number(ctx.answer)),
    explanation: ({ vars, answer }) => `180° − ${vars.a}° = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u15-04', grade: 5, topicId: 'g5-geometry', unitId: 'g5-geometry', subtopicId: 'u15-04',
    prompt: 'სამკუთხედს გვერდები აქვს {a} სმ, {b} სმ და {c} სმ. როგორი სამკუთხედია?',
    variables: {
      a: { kind: 'int', min: 3, max: 9 },
      b: { kind: 'int', min: 3, max: 9 },
      c: { kind: 'int', min: 3, max: 9 },
    },
    constraints: [
      { test: (v) => Number(v.a) + Number(v.b) > Number(v.c) && Number(v.a) + Number(v.c) > Number(v.b) && Number(v.b) + Number(v.c) > Number(v.a), note: 'სამკუთხედის უტოლობა' },
    ],
    answer: (v) => (Number(v.a) === Number(v.b) && Number(v.b) === Number(v.c) ? 'ტოლგვერდა' : Number(v.a) === Number(v.b) || Number(v.b) === Number(v.c) || Number(v.a) === Number(v.c) ? 'ტოლფერდა' : 'სხვადასხვაგვერდა'),
    format: { kind: 'text' },
    options: () => ['ტოლგვერდა', 'ტოლფერდა', 'სხვადასხვაგვერდა'],
    optionCount: 3,
    explanation: ({ vars, answer }) => `${vars.a}, ${vars.b}, ${vars.c} — ამიტომ სამკუთხედი ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u15-05', grade: 5, topicId: 'g5-geometry', unitId: 'g5-geometry', subtopicId: 'u15-05',
    prompt: 'ოთხკუთხედის სამი კუთხეა {a}°, {b}° და {c}°. რამდენია მეოთხე კუთხე?',
    hint: 'ოთხკუთხედის კუთხეების ჯამი 360°-ია.',
    variables: {
      a: { kind: 'int', min: 60, max: 120, step: 5 },
      b: { kind: 'int', min: 60, max: 120, step: 5 },
      c: { kind: 'int', min: 60, max: 120, step: 5 },
    },
    constraints: [{ test: (v) => 360 - Number(v.a) - Number(v.b) - Number(v.c) >= 20, note: 'მეოთხე კუთხე დადებითი იყოს' }],
    answer: (v) => 360 - Number(v.a) - Number(v.b) - Number(v.c),
    format: { kind: 'integer', min: 20, max: 180, format: (value) => `${value}°` },
    distractors: ({ vars, answer }) => [
      360 - Number(vars.a) - Number(vars.b) + Number(vars.c),
      180 - Number(vars.a) - Number(vars.b) + Number(vars.c),
      Number(answer) + 10,
    ].filter((value) => value > 0 && value !== Number(answer) && Number.isInteger(value)),
    explanation: ({ vars, answer }) =>
      `360° − ${vars.a}° − ${vars.b}° − ${vars.c}° = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u15-06', grade: 5, topicId: 'g5-geometry', unitId: 'g5-geometry', subtopicId: 'u15-06',
    prompt: '{name}-ს რამდენი გვერდი აქვს?',
    variables: {
      poly: { kind: 'choice', values: ['სამკუთხედი|3', 'ოთხკუთხედი|4', 'ხუთკუთხედი|5', 'ექვსკუთხედი|6', 'შვიდკუთხედი|7', 'რვაკუთხედი|8', 'ცხრაკუთხედი|9', 'ათკუთხედი|10', 'თორმეტკუთხედი|12', 'თხუთმეტკუთხედი|15', 'ოცკუთხედი|20', 'თვრამეტკუთხედი|18', 'ოცდაოთხკუთხედი|24'] },
      name: { kind: 'choice', values: (v) => [String(v.poly).split('|')[0]] },
      sides: { kind: 'choice', values: (v) => [Number(String(v.poly).split('|')[1])] },
    },
    answer: (v) => Number(v.sides),
    distractors: (ctx) => wrong(Number(ctx.answer), [
      Number(ctx.answer) + 1,
      Number(ctx.answer) - 1,
      Number(ctx.answer) + 2,
      Number(ctx.answer) - 2,
      Number(ctx.answer) * 2,
      Number(ctx.answer) + 3,
    ]),
    explanation: ({ vars, answer }) => `${vars.name}-ს აქვს ${answer} გვერდი.`,
  }),

  defineTemplate({
    id: 'g5-u15-07', grade: 5, topicId: 'g5-geometry', unitId: 'g5-geometry', subtopicId: 'u15-07',
    prompt: '{solid}-ს {faces} წახნაგი და {vertices} წვერო აქვს. რამდენი კიდე აქვს?',
    hint: 'ეილერის ფორმულა: წახნაგები + წვეროები − კიდეები = 2.',
    variables: {
      shape: { kind: 'choice', values: ['კუბი|6|8', 'მართკუთხა პარალელეპიპედი|6|8', 'სამკუთხა პრიზმა|5|6', 'ოთხკუთხა პირამიდა|5|5', 'სამკუთხა პირამიდა|4|4', 'ექვსკუთხა პრიზმა|8|12', 'ხუთკუთხა პირამიდა|6|6', 'ოქტაედრი|8|6', 'დოდეკაედრი|12|20', 'იკოსაედრი|20|12', 'ოთხკუთხა პრიზმა|6|8', 'ხუთკუთხა პრიზმა|7|10', 'ექვსკუთხა პირამიდა|7|7', 'ოქტაგონალური პრიზმა|10|16', 'შვიდკუთხა პირამიდა|8|8'] },
      solid: { kind: 'choice', values: (v) => [String(v.shape).split('|')[0]] },
      faces: { kind: 'choice', values: (v) => [Number(String(v.shape).split('|')[1])] },
      vertices: { kind: 'choice', values: (v) => [Number(String(v.shape).split('|')[2])] },
    },
    answer: (v) => Number(v.faces) + Number(v.vertices) - 2,
    distractors: (ctx) => wrong(Number(ctx.answer), [
      Number(ctx.vars.faces) + Number(ctx.vars.vertices),
      Number(ctx.vars.faces) + Number(ctx.vars.vertices) - 1,
      Number(ctx.answer) + 1,
      Number(ctx.answer) - 1,
      Number(ctx.vars.faces) * 2,
    ]),
    explanation: ({ vars, answer }) =>
      `${vars.faces} + ${vars.vertices} − 2 = ${answer} კიდე.`,
  }),

  defineTemplate({
    id: 'g5-u15-08', grade: 5, topicId: 'g5-geometry', unitId: 'g5-geometry', subtopicId: 'u15-08',
    prompt: 'მონაკვეთის ბოლოებია ({x1}, {y}) და ({x2}, {y}). რა არის მისი სიგრძე?',
    variables: {
      x1: { kind: 'int', min: 0, max: 6 },
      len: { kind: 'int', min: 2, max: 8 },
      x2: { kind: 'choice', values: (v) => [Number(v.x1) + Number(v.len)] },
      y: { kind: 'int', min: 0, max: 9 },
    },
    answer: (v) => Number(v.x2) - Number(v.x1),
    distractors: ({ vars, answer }) => [
      Number(vars.x2) + Number(vars.x1),
      Number(answer) + 1,
      Number(answer) - 1,
    ].filter((value) => value > 0 && value !== Number(answer)),
    explanation: ({ vars, answer }) =>
      `ორივე ბოლოს ერთი y აქვს, ამიტომ სიგრძეა ${vars.x2} − ${vars.x1} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u15-09', grade: 5, topicId: 'g5-geometry', unitId: 'g5-geometry', subtopicId: 'u15-09',
    prompt: 'ორი წრფის გადაკვეთისას ერთი კუთხეა {a}°. მეორე კუთხე {b}°-ია. კვეთს ისინი ერთმანეთს მართი კუთხით?',
    hint: 'მართი კუთხე 90°-ია.',
    variables: {
      a: { kind: 'choice', values: [90, 45, 60, 30, 120, 75, 100] },
      b: { kind: 'choice', values: [90, 45, 60, 30, 120, 75, 100] },
    },
    answer: (v) => (Number(v.a) === 90 && Number(v.b) === 90 ? 'დიახ' : 'არა'),
    format: { kind: 'text' },
    optionCount: 2,
    options: () => ['დიახ', 'არა'],
    explanation: ({ vars, answer }) =>
      `${vars.a}° და ${vars.b}° ${answer === 'დიახ' ? 'ორივე 90°-ია, ამიტომ წრფეები პერპენდიკულარულია' : 'არ არიან 90°-იანი, ამიტომ წრფეები მხოლოდ გადამკვეთია'}.`,
  }),

  defineTemplate({
    id: 'g5-u15-10', grade: 5, topicId: 'g5-geometry', unitId: 'g5-geometry', subtopicId: 'u15-10',
    prompt: 'წრის რადიუსია {r} სმ. რა არის დიამეტრი?',
    variables: { r: { kind: 'int', min: 2, max: 25 } },
    answer: (v) => Number(v.r) * 2,
    distractors: ({ vars, answer }) => [
      Number(vars.r),
      Number(answer) + 2,
      Number(answer) - 2,
    ].filter((value) => value > 0 && value !== Number(answer)),
    explanation: ({ vars, answer }) => `დიამეტრი = 2 × რადიუსი = 2 × ${vars.r} = ${answer} სმ.`,
  }),

  defineTemplate({
    id: 'g5-u15-11', grade: 5, topicId: 'g5-geometry', unitId: 'g5-geometry', subtopicId: 'u15-11',
    prompt: 'რამდენი სიმეტრიის ღერძი აქვს {shape}-ს?',
    variables: {
      pair: { kind: 'choice', values: ['კვადრატს|4', 'მართკუთხედს|2', 'წრეს|∞', 'ტოლგვერდა სამკუთხედს|3', 'ტოლფერდა სამკუთხედს|1', 'რომბს|2', 'რეგულარულ ხუთკუთხედს|5', 'რეგულარულ ექვსკუთხედს|6', 'ტოლფერდა ტრაპეციას|1', 'მართკუთხედს (არა კვადრატს)|2', 'კვადრატს (გვერდი 2 სმ)|4', 'რეგულარულ რვაკუთხედს|8', 'რეგულარულ ათკუთხედს|10', 'ტოლგვერდა ხუთკუთხედს|5'] },
      shape: { kind: 'choice', values: (v) => [String(v.pair).split('|')[0]] },
    },
    answer: (v) => String(String(v.pair).split('|')[1]),
    format: { kind: 'text' },
    distractors: () => ['1', '2', '3', '4', '∞'].slice(0, 3),
    options: (v) => {
      const right = String(String(v.pair).split('|')[1]);
      return [right, ...['1', '2', '3', '4', '∞'].filter((value) => value !== right).slice(0, 3)];
    },
    explanation: ({ vars, answer }) => `${vars.shape}-ს აქვს ${answer} სიმეტრიის ღერძი.`,
  }),

  defineTemplate({
    id: 'g5-u15-12', grade: 5, topicId: 'g5-geometry', unitId: 'g5-geometry', subtopicId: 'u15-12',
    prompt: 'მართკუთხედის გვერდებია {a} სმ და {b} სმ. იპოვე პერიმეტრი.',
    variables: {
      a: { kind: 'int', min: 3, max: 20 },
      b: { kind: 'int', min: 4, max: 25 },
    },
    constraints: [{ test: (v) => v.a !== v.b, note: 'გვერდები სხვადასხვა იყოს' }],
    answer: (v) => 2 * (Number(v.a) + Number(v.b)),
    distractors: (ctx) => [
      Number(ctx.vars.a) * Number(ctx.vars.b),
      Number(ctx.vars.a) + Number(ctx.vars.b),
      2 * Number(ctx.vars.a) * Number(ctx.vars.b),
    ].filter((value) => value > 0 && value !== Number(ctx.answer)),
    explanation: ({ vars, answer }) => `2 × (${vars.a} + ${vars.b}) = ${answer} სმ.`,
  }),

  defineTemplate({
    id: 'g5-u15-13', grade: 5, topicId: 'g5-geometry', unitId: 'g5-geometry', subtopicId: 'u15-13',
    prompt: 'მართკუთხედის გვერდებია {a} სმ და {b} სმ. იპოვე ფართობი.',
    variables: {
      a: { kind: 'int', min: 3, max: 20 },
      b: { kind: 'int', min: 4, max: 25 },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    distractors: (ctx) => [
      2 * (Number(ctx.vars.a) + Number(ctx.vars.b)),
      Number(ctx.vars.a) + Number(ctx.vars.b),
      Number(ctx.answer) + Number(ctx.vars.a),
    ].filter((value) => value > 0 && value !== Number(ctx.answer)),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.b} = ${answer} სმ².`,
  }),

  defineTemplate({
    id: 'g5-u15-14', grade: 5, topicId: 'g5-geometry', unitId: 'g5-geometry', subtopicId: 'u15-14',
    prompt: 'მართკუთხა სამკუთხედის კათეტებია {a} სმ და {b} სმ. იპოვე ფართობი.',
    variables: {
      a: { kind: 'choice', values: [4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 30] },
      b: { kind: 'choice', values: [5, 7, 9, 11, 13, 15, 21, 25, 27] },
    },
    answer: (v) => (Number(v.a) * Number(v.b)) / 2,
    distractors: (ctx) => wrong(Number(ctx.answer), [
      Number(ctx.vars.a) * Number(ctx.vars.b),
      Number(ctx.vars.a) + Number(ctx.vars.b),
      Number(ctx.answer) + Number(ctx.vars.a),
      Number(ctx.answer) + Number(ctx.vars.b),
      Number(ctx.answer) - Number(ctx.vars.a),
      Number(ctx.answer) + 1,
      Number(ctx.answer) - 1,
    ]),
    explanation: ({ vars, answer }) =>
      `(${vars.a} × ${vars.b}) ÷ 2 = ${answer} სმ².`,
  }),

  defineTemplate({
    id: 'g5-u15-15', grade: 5, topicId: 'g5-geometry', unitId: 'g5-geometry', subtopicId: 'u15-15',
    prompt: 'ფიგურა შედგება ორი მართკუთხედისგან: {a}×{b} სმ და {c}×{d} სმ. რა არის მთლიანი ფართობი?',
    variables: {
      a: { kind: 'int', min: 2, max: 9 },
      b: { kind: 'int', min: 2, max: 9 },
      c: { kind: 'int', min: 2, max: 9 },
      d: { kind: 'int', min: 2, max: 9 },
    },
    answer: (v) => Number(v.a) * Number(v.b) + Number(v.c) * Number(v.d),
    distractors: (ctx) => [
      Number(ctx.vars.a) * Number(ctx.vars.b),
      Number(ctx.vars.a) * Number(ctx.vars.b) * Number(ctx.vars.c) * Number(ctx.vars.d),
      Number(ctx.vars.a) + Number(ctx.vars.b) + Number(ctx.vars.c) + Number(ctx.vars.d),
    ].filter((value) => value > 0 && value !== Number(ctx.answer)),
    explanation: ({ vars, answer }) =>
      `${vars.a}×${vars.b} = ${Number(vars.a) * Number(vars.b)}; ${vars.c}×${vars.d} = ${Number(vars.c) * Number(vars.d)}; სულ ${answer} სმ².`,
  }),

  // ================= U16: ალგებრა და ხარისხები =================
  defineTemplate({
    id: 'g5-u16-01', grade: 5, topicId: 'g5-algebra-powers', unitId: 'g5-algebra-powers', subtopicId: 'u16-01',
    prompt: '{a} + {b} × {c} = ?',
    variables: {
      a: { kind: 'int', min: 2, max: 20 },
      b: { kind: 'int', min: 2, max: 9 },
      c: { kind: 'int', min: 2, max: 9 },
    },
    answer: (v) => Number(v.a) + Number(v.b) * Number(v.c),
    distractors: ({ vars, answer }) => [
      (Number(vars.a) + Number(vars.b)) * Number(vars.c),
      Number(vars.a) * Number(vars.b) + Number(vars.c),
      Number(answer) + Number(vars.b),
    ].filter((value) => value !== Number(answer)),
    explanation: ({ vars, answer }) =>
      `ჯერ გამრავლება: ${vars.b} × ${vars.c} = ${Number(vars.b) * Number(vars.c)}; შემდეგ შეკრება: ${vars.a} + ${Number(vars.b) * Number(vars.c)} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u16-02', grade: 5, topicId: 'g5-algebra-powers', unitId: 'g5-algebra-powers', subtopicId: 'u16-02',
    prompt: 'გამოთვალე, თუ x = {x}: {k}x + {b}',
    variables: {
      x: { kind: 'int', min: 2, max: 12 },
      k: { kind: 'int', min: 2, max: 9 },
      b: { kind: 'int', min: 1, max: 20 },
    },
    answer: (v) => Number(v.k) * Number(v.x) + Number(v.b),
    distractors: ({ vars, answer }) => [
      Number(vars.k) * (Number(vars.x) + Number(vars.b)),
      Number(vars.k) + Number(vars.x) + Number(vars.b),
      Number(answer) + Number(vars.k),
    ].filter((value) => value !== Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.k} × ${vars.x} + ${vars.b} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u16-03', grade: 5, topicId: 'g5-algebra-powers', unitId: 'g5-algebra-powers', subtopicId: 'u16-03',
    prompt: 'ამოხსენი განტოლება: {k}x = {p}',
    variables: {
      k: { kind: 'int', min: 2, max: 9 },
      x: { kind: 'int', min: 2, max: 12 },
      p: { kind: 'choice', values: (v) => [Number(v.k) * Number(v.x)] },
    },
    answer: (v) => Number(v.p) / Number(v.k),
    distractors: ({ vars, answer }) => [
      Number(vars.p) - Number(vars.k),
      Number(answer) + 1,
      Number(answer) - 1,
    ].filter((value) => value > 0 && value !== Number(answer)),
    explanation: ({ vars, answer }) => `x = ${vars.p} ÷ ${vars.k} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u16-04', grade: 5, topicId: 'g5-algebra-powers', unitId: 'g5-algebra-powers', subtopicId: 'u16-04',
    prompt: '{n}² = ?',
    variables: {
      n: { kind: 'choice', values: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 20, 25] },
    },
    answer: (v) => Number(v.n) * Number(v.n),
    distractors: ({ vars, answer }) => [
      Number(vars.n) * 2,
      Number(answer) + Number(vars.n),
      Number(answer) - Number(vars.n),
    ].filter((value) => value > 0 && value !== Number(answer)),
    explanation: ({ vars, answer }) => `${vars.n} × ${vars.n} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u16-05', grade: 5, topicId: 'g5-algebra-powers', unitId: 'g5-algebra-powers', subtopicId: 'u16-05',
    prompt: '{n}³ = ?',
    variables: { n: { kind: 'choice', values: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] } },
    answer: (v) => Number(v.n) ** 3,
    distractors: ({ vars, answer }) => [
      Number(vars.n) * 3,
      Number(vars.n) * Number(vars.n),
      Number(answer) + Number(vars.n),
    ].filter((value) => value > 0 && value !== Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.n} × ${vars.n} × ${vars.n} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u16-06', grade: 5, topicId: 'g5-algebra-powers', unitId: 'g5-algebra-powers', subtopicId: 'u16-06',
    prompt: '{n}^{k} = ?',
    variables: {
      n: { kind: 'choice', values: [2, 3, 4, 5, 6, 7, 8] },
      k: { kind: 'choice', values: [2, 3, 4] },
    },
    constraints: [{ test: (v) => Number(v.n) ** Number(v.k) <= 100000, note: 'შედეგი ზედმეტად დიდი არ იყოს' }],
    answer: (v) => Number(v.n) ** Number(v.k),
    distractors: ({ vars, answer }) => [
      Number(vars.n) * Number(vars.k),
      Number(answer) + Number(vars.n),
      Number(answer) - Number(vars.n),
    ].filter((value) => value > 0 && value !== Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.k} ცალი ${vars.n}-ის ნამრავლია ${answer}.`,
  }),

  // ================= U17: მონაცემები და ალბათობა =================
  defineTemplate({
    id: 'g5-u17-01', grade: 5, topicId: 'g5-data-chance', unitId: 'g5-data-chance', subtopicId: 'u17-01',
    prompt: 'ცხრილში: {k1} — {v1} ქულა, {k2} — {v2} ქულა. რამდენი ქულა აქვს {k1}?',
    variables: {
      k1: { kind: 'choice', values: ['ნინო', 'გიორგი', 'ანა', 'ლუკა', 'მარიამი', 'დავითი'] },
      k2: { kind: 'choice', values: ['ნინო', 'გიორგი', 'ანა', 'ლუკა', 'მარიამი', 'დავითი'] },
      v1: { kind: 'int', min: 5, max: 40 },
      v2: { kind: 'int', min: 5, max: 40 },
    },
    constraints: [{ test: (v) => v.k1 !== v.k2, note: 'სახელები სხვადასხვა იყოს' }],
    answer: (v) => Number(v.v1),
    distractors: ({ vars, answer }) => [
      Number(vars.v2),
      Number(vars.v1) + Number(vars.v2),
      Number(vars.v1) + 5,
    ].filter((value) => value !== Number(answer)),
    explanation: ({ vars, answer }) => `ცხრილის მიხედვით ${vars.k1}-ს აქვს ${answer} ქულა.`,
  }),

  defineTemplate({
    id: 'g5-u17-02', grade: 5, topicId: 'g5-data-chance', unitId: 'g5-data-chance', subtopicId: 'u17-02',
    prompt: 'პიქტოგრამაზე ერთი სიმბოლო = {unit} ბავშვი. რიგში {sym} სიმბოლოა. რამდენი ბავშვია?',
    variables: {
      unit: { kind: 'choice', values: [2, 4, 5, 10] },
      sym: { kind: 'int', min: 2, max: 9 },
    },
    answer: (v) => Number(v.unit) * Number(v.sym),
    distractors: ({ vars, answer }) => [
      Number(vars.unit) + Number(vars.sym),
      Number(answer) + Number(vars.unit),
      Number(answer) - Number(vars.unit),
    ].filter((value) => value > 0 && value !== Number(answer)),
    explanation: ({ vars, answer }) => `${vars.sym} × ${vars.unit} = ${answer} ბავშვი.`,
  }),

  defineTemplate({
    id: 'g5-u17-03', grade: 5, topicId: 'g5-data-chance', unitId: 'g5-data-chance', subtopicId: 'u17-03',
    prompt: 'სიხშირის ცხრილში: {v1}, {v2}, {v3}. სულ რამდენი დაკვირვებაა?',
    variables: {
      v1: { kind: 'int', min: 2, max: 20 },
      v2: { kind: 'int', min: 2, max: 20 },
      v3: { kind: 'int', min: 2, max: 20 },
    },
    answer: (v) => Number(v.v1) + Number(v.v2) + Number(v.v3),
    distractors: ({ vars, answer }) => [
      Number(vars.v1) * Number(vars.v2),
      Math.max(Number(vars.v1), Number(vars.v2), Number(vars.v3)),
      Number(answer) - Number(vars.v1),
    ].filter((value) => value > 0 && value !== Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.v1} + ${vars.v2} + ${vars.v3} = ${answer} დაკვირვება.`,
  }),

  defineTemplate({
    id: 'g5-u17-04', grade: 5, topicId: 'g5-data-chance', unitId: 'g5-data-chance', subtopicId: 'u17-04',
    prompt: 'წრიულ დიაგრამაზე {whole} ბავშვიდან {p}% ველოსიპედით დადის. რამდენი ბავშვია?',
    variables: {
      whole: { kind: 'choice', values: [20, 40, 50, 60, 80, 100, 120, 160, 200, 240, 300, 400] },
      p: { kind: 'choice', values: [10, 20, 25, 50, 5, 40, 75] },
    },
    answer: (v) => (Number(v.whole) * Number(v.p)) / 100,
    distractors: ({ vars, answer }) => [
      Number(vars.whole) - Number(answer),
      Number(vars.p),
      Number(answer) + 10,
    ].filter((value) => value > 0 && value !== Number(answer)),
    explanation: ({ vars, answer }) =>
      `${vars.whole} × ${vars.p} ÷ 100 = ${answer} ბავშვი.`,
  }),

  defineTemplate({
    id: 'g5-u17-05', grade: 5, topicId: 'g5-data-chance', unitId: 'g5-data-chance', subtopicId: 'u17-05',
    prompt: 'სვეტოვან დიაგრამაზე {k1} {v1} აქვს, {k2} — {v2}. რამდენით მეტი აქვს {k1}?',
    variables: {
      k1: { kind: 'choice', values: ['ნინოს', 'გიორგის', 'ანას', 'ლუკას'] },
      k2: { kind: 'choice', values: ['ნინოს', 'გიორგის', 'ანას', 'ლუკას'] },
      v2: { kind: 'int', min: 3, max: 20 },
      more: { kind: 'int', min: 2, max: 15 },
      v1: { kind: 'choice', values: (v) => [Number(v.v2) + Number(v.more)] },
    },
    constraints: [{ test: (v) => v.k1 !== v.k2, note: 'სახელები სხვადასხვა იყოს' }],
    answer: (v) => Number(v.v1) - Number(v.v2),
    distractors: ({ vars, answer }) => [
      Number(vars.v1) + Number(vars.v2),
      Number(vars.v1),
      Number(answer) + 1,
    ].filter((value) => value > 0 && value !== Number(answer)),
    explanation: ({ vars, answer }) => `${vars.v1} − ${vars.v2} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u17-06', grade: 5, topicId: 'g5-data-chance', unitId: 'g5-data-chance', subtopicId: 'u17-06',
    prompt: 'გამოკითხეს {n} ბავშვი, მათგან {k}-მა აირჩია ფეხბურთი. რამდენი პროცენტია ეს?',
    variables: {
      n: { kind: 'choice', values: [20, 40, 50, 100, 200] },
      p: { kind: 'choice', values: [10, 20, 25, 50] },
      k: { kind: 'choice', values: (v) => [(Number(v.n) * Number(v.p)) / 100] },
    },
    answer: (v) => Number(v.p),
    distractors: (ctx) => [
      Number(ctx.answer) + 10,
      Number(ctx.answer) - 10,
      Number(ctx.answer) * 2,
    ].filter((value) => value > 0 && value !== Number(ctx.answer)),
    explanation: ({ vars, answer }) =>
      `${vars.k} ÷ ${vars.n} = ${Number(vars.k) / Number(vars.n)}, ანუ ${answer}%.`,
  }),

  defineTemplate({
    id: 'g5-u17-07', grade: 5, topicId: 'g5-data-chance', unitId: 'g5-data-chance', subtopicId: 'u17-07',
    prompt: 'ყუთში {w} თეთრი და {b} შავი ბურთია. თვალდახუჭულმა {color} ბურთი რომ ამოვიღოთ, ეს მოვლენა:',
    variables: {
      w: { kind: 'int', min: 1, max: 9 },
      b: { kind: 'int', min: 1, max: 9 },
      color: { kind: 'choice', values: ['თეთრი', 'შავი'] },
      wanted: { kind: 'choice', values: (v) => [Number(v.color === 'თეთრი' ? v.w : v.b)] },
      other: { kind: 'choice', values: (v) => [Number(v.color === 'თეთრი' ? v.b : v.w)] },
    },
    answer: (v) => (Number(v.wanted) > Number(v.other) ? 'უფრო სავარაუდო' : 'ნაკლებად სავარაუდო'),
    format: { kind: 'text' },
    optionCount: 2,
    options: () => ['უფრო სავარაუდო', 'ნაკლებად სავარაუდო'],
    explanation: ({ vars, answer }) =>
      `${vars.color} ბურთი ${vars.wanted} ცალია, მეორე ფერი — ${vars.other}; ამიტომ ეს მოვლენა ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u17-08', grade: 5, topicId: 'g5-data-chance', unitId: 'g5-data-chance', subtopicId: 'u17-08',
    prompt: 'ყუთში {red} წითელი და {blue} ლურჯი ბურთია. თვალდახუჭულმა წითელი ბურთის ამოღების ალბათობა რამდენია? (ჩაწერე წილადით)',
    variables: {
      red: { kind: 'int', min: 1, max: 6 },
      blue: { kind: 'int', min: 1, max: 6 },
    },
    answer: (v) => {
      const total = Number(v.red) + Number(v.blue);
      const g = gcdOf(Number(v.red), total);
      return `${Number(v.red) / g}/${total / g}`;
    },
    format: { kind: 'text' },
    distractors: (ctx) => {
      const red = Number(ctx.vars.red);
      const blue = Number(ctx.vars.blue);
      const total = red + blue;
      return wrong(String(ctx.answer), [
        `${red}/${blue}`,
        `${blue}/${total}`,
        `${red}/${total + 1}`,
        `${total}/${red}`,
        `1/${total}`,
      ]);
    },
    explanation: ({ vars, answer }) =>
      `სულ ${Number(vars.red) + Number(vars.blue)} ბურთია, მათგან ${vars.red} წითელი; ალბათობაა ${answer}.`,
  }),

  // ================= U18: დრო და ფული =================
  defineTemplate({
    id: 'g5-u18-01', grade: 5, topicId: 'g5-time-money', unitId: 'g5-time-money', subtopicId: 'u18-01',
    prompt: '{h} საათი და {m} წუთი = ? წუთი',
    variables: {
      h: { kind: 'int', min: 1, max: 6 },
      m: { kind: 'int', min: 5, max: 55, step: 5 },
    },
    answer: (v) => Number(v.h) * 60 + Number(v.m),
    distractors: (ctx) => wrong(Number(ctx.answer), [
      Number(ctx.vars.h) * 100 + Number(ctx.vars.m),
      Number(ctx.answer) + 10,
      Number(ctx.answer) - 10,
      Number(ctx.answer) + 5,
    ]),
    explanation: ({ vars, answer }) =>
      `${vars.h} × 60 + ${vars.m} = ${answer} წუთი.`,
  }),

  defineTemplate({
    id: 'g5-u18-02', grade: 5, topicId: 'g5-time-money', unitId: 'g5-time-money', subtopicId: 'u18-02',
    prompt: '{h1}:{m1p}-ზე დავამატეთ {h} საათი {m} წუთი. რომელი დრო აღმოჩნდა?',
    hint: 'პასუხი ჩაწერე როგორც სთ:წთ, მაგალითად 09:45.',
    variables: {
      h1: { kind: 'int', min: 9, max: 16 },
      m1: { kind: 'choice', values: [0, 15, 30, 45] },
      m1p: { kind: 'choice', values: (v) => [String(v.m1).padStart(2, '0')] },
      h: { kind: 'int', min: 1, max: 2 },
      m: { kind: 'choice', values: [10, 20, 30, 40] },
    },
    answer: (v) => {
      const total = Number(v.h1) * 60 + Number(v.m1) + Number(v.h) * 60 + Number(v.m);
      return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
    },
    format: { kind: 'text', time: true },
    explanation: ({ vars, answer }) =>
      `${vars.h1}:${vars.m1p} + ${vars.h} სთ ${vars.m} წთ = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u18-03', grade: 5, topicId: 'g5-time-money', unitId: 'g5-time-money', subtopicId: 'u18-03',
    prompt: 'გაკვეთილი დაიწყო {h1}:{m1p}-ზე და დასრულდა {h2}:{m2p}-ზე. რამდენი წუთი გაგრძელდა?',
    variables: {
      h1: { kind: 'int', min: 8, max: 15 },
      m1: { kind: 'choice', values: [0, 10, 20, 30, 40, 50] },
      m1p: { kind: 'choice', values: (v) => [String(v.m1).padStart(2, '0')] },
      length: { kind: 'choice', values: [40, 45, 50, 55, 70, 90] },
      h2: { kind: 'choice', values: (v) => [Number(v.h1) + Math.floor((Number(v.m1) + Number(v.length)) / 60)] },
      m2: { kind: 'choice', values: (v) => [(Number(v.m1) + Number(v.length)) % 60] },
      m2p: { kind: 'choice', values: (v) => [String(Number(v.m2)).padStart(2, '0')] },
    },
    answer: (v) => Number(v.length),
    format: { kind: 'integer', min: 1, max: 240 },
    distractors: (ctx) => wrong(Number(ctx.answer), [
      Number(ctx.vars.length) + 10,
      Number(ctx.vars.length) - 10,
      Number(ctx.vars.length) + 5,
    ]),
    explanation: ({ vars, answer }) =>
      `${vars.h1}:${vars.m1p}-დან ${vars.h2}:${vars.m2p}-მდე გავიდა ${answer} წუთი.`,
  }),

  defineTemplate({
    id: 'g5-u18-04', grade: 5, topicId: 'g5-time-money', unitId: 'g5-time-money', subtopicId: 'u18-04',
    prompt: 'ახლა {h}:{mp} საათია. ღონისძიება იწყება {h2}:{m2p}-ზე. რამდენი წუთი დარჩა?',
    variables: {
      h: { kind: 'int', min: 9, max: 14 },
      m: { kind: 'choice', values: [0, 15, 30, 45] },
      mp: { kind: 'choice', values: (v) => [String(v.m).padStart(2, '0')] },
      left: { kind: 'choice', values: [45, 60, 75, 90, 120] },
      h2: { kind: 'choice', values: (v) => [Number(v.h) + Math.floor((Number(v.m) + Number(v.left)) / 60)] },
      m2: { kind: 'choice', values: (v) => [(Number(v.m) + Number(v.left)) % 60] },
      m2p: { kind: 'choice', values: (v) => [String(Number(v.m2)).padStart(2, '0')] },
    },
    answer: (v) => Number(v.left),
    format: { kind: 'integer', min: 5, max: 240 },
    distractors: (ctx) => wrong(Number(ctx.answer), [
      Number(ctx.vars.left) + 15,
      Number(ctx.vars.left) - 15,
      Number(ctx.vars.left) + 5,
    ]),
    explanation: ({ vars, answer }) =>
      `${vars.h}:${vars.mp}-დან ${vars.h2}:${vars.m2p}-მდე დარჩა ${answer} წუთი.`,
  }),

  defineTemplate({
    id: 'g5-u18-05', grade: 5, topicId: 'g5-time-money', unitId: 'g5-time-money', subtopicId: 'u18-05',
    prompt: '{l} ლარი და {t} თეთრი = ? თეთრი',
    variables: {
      l: { kind: 'int', min: 1, max: 20 },
      t: { kind: 'int', min: 5, max: 95, step: 5 },
    },
    answer: (v) => Number(v.l) * 100 + Number(v.t),
    distractors: (ctx) => wrong(Number(ctx.answer), [
      Number(ctx.vars.l) * 10 + Number(ctx.vars.t),
      Number(ctx.answer) + 100,
      Number(ctx.answer) - 10,
      Number(ctx.answer) + 10,
    ]),
    explanation: ({ vars, answer }) => `${vars.l} × 100 + ${vars.t} = ${answer} თეთრი.`,
  }),

  defineTemplate({
    id: 'g5-u18-06', grade: 5, topicId: 'g5-time-money', unitId: 'g5-time-money', subtopicId: 'u18-06',
    prompt: '{k} ცალი {coin} თეთრი მონეტა რამდენ თეთრად ითვლება?',
    variables: {
      coin: { kind: 'choice', values: [5, 10, 20, 50] },
      k: { kind: 'int', min: 2, max: 9 },
    },
    answer: (v) => Number(v.coin) * Number(v.k),
    distractors: (ctx) => wrong(Number(ctx.answer), [
      Number(ctx.vars.coin) + Number(ctx.vars.k),
      Number(ctx.answer) + Number(ctx.vars.coin),
      Number(ctx.answer) - Number(ctx.vars.coin),
      Number(ctx.answer) + 5,
    ]),
    explanation: ({ vars, answer }) => `${vars.k} × ${vars.coin} = ${answer} თეთრი.`,
  }),

  defineTemplate({
    id: 'g5-u18-07', grade: 5, topicId: 'g5-time-money', unitId: 'g5-time-money', subtopicId: 'u18-07',
    prompt: '{l1} ლარი {t1} თეთრი + {l2} ლარი {t2} თეთრი = ? თეთრი',
    variables: {
      l1: { kind: 'int', min: 1, max: 20 },
      t1: { kind: 'int', min: 5, max: 85, step: 5 },
      l2: { kind: 'int', min: 1, max: 20 },
      t2: { kind: 'int', min: 5, max: 90, step: 5 },
    },
    answer: (v) => (Number(v.l1) + Number(v.l2)) * 100 + Number(v.t1) + Number(v.t2),
    distractors: (ctx) => wrong(Number(ctx.answer), [
      (Number(ctx.vars.l1) + Number(ctx.vars.l2)) * 100 + Number(ctx.vars.t1),
      Number(ctx.answer) + 100,
      Number(ctx.answer) - 10,
      Number(ctx.answer) + 10,
    ]),
    explanation: ({ vars, answer }) =>
      `${vars.l1} + ${vars.l2} = ${Number(vars.l1) + Number(vars.l2)} ლარი; ${vars.t1} + ${vars.t2} = ${Number(vars.t1) + Number(vars.t2)} თეთრი; სულ ${answer} თეთრი.`,
  }),

  defineTemplate({
    id: 'g5-u18-08', grade: 5, topicId: 'g5-time-money', unitId: 'g5-time-money', subtopicId: 'u18-08',
    prompt: 'ნივთი ღირს {price} თეთრი. გვაქვს {have} თეთრი. რამდენი თეთრი გვაკლდა?',
    variables: {
      price: { kind: 'int', min: 120, max: 900, step: 10 },
      have: { kind: 'int', min: 20, max: 400, step: 10 },
    },
    constraints: [{ test: (v) => Number(v.have) < Number(v.price), note: 'თანხა არასაკმარისი იყოს' }],
    answer: (v) => Number(v.price) - Number(v.have),
    distractors: (ctx) => wrong(Number(ctx.answer), [
      Number(ctx.vars.price) + Number(ctx.vars.have),
      Number(ctx.vars.price),
      Number(ctx.answer) + 10,
      Number(ctx.answer) - 10,
    ]),
    explanation: ({ vars, answer }) => `${vars.price} − ${vars.have} = ${answer} თეთრი.`,
  }),

  defineTemplate({
    id: 'g5-u18-09', grade: 5, topicId: 'g5-time-money', unitId: 'g5-time-money', subtopicId: 'u18-09',
    prompt: 'თანხა {sum} ლარია, გადასახადი {p}%. რამდენი ლარი იქნება გადასახადი?',
    variables: {
      sum: { kind: 'choice', values: [20, 40, 60, 80, 100, 200] },
      p: { kind: 'choice', values: [5, 10, 20, 25] },
    },
    constraints: [{ test: (v) => (Number(v.sum) * Number(v.p)) % 100 === 0, note: 'გადასახადი მთელი იყოს' }],
    answer: (v) => (Number(v.sum) * Number(v.p)) / 100,
    distractors: (ctx) => wrong(Number(ctx.answer), [
      Number(ctx.vars.sum) - Number(ctx.answer),
      Number(ctx.vars.sum),
      Number(ctx.answer) + 10,
      Number(ctx.answer) - 5,
    ]),
    explanation: ({ vars, answer }) => `${vars.sum} × ${vars.p} ÷ 100 = ${answer} ლარი.`,
  }),

  defineTemplate({
    id: 'g5-u18-10', grade: 5, topicId: 'g5-time-money', unitId: 'g5-time-money', subtopicId: 'u18-10',
    prompt: 'დაამრგვალე {l} ლარი {t} თეთრი უახლოეს ლარამდე.',
    variables: {
      l: { kind: 'int', min: 2, max: 40 },
      t: { kind: 'int', min: 5, max: 95, step: 5 },
    },
    answer: (v) => (Number(v.t) >= 50 ? Number(v.l) + 1 : Number(v.l)),
    distractors: (ctx) => wrong(Number(ctx.answer), [
      Number(ctx.vars.l),
      Number(ctx.vars.l) + 1,
      Number(ctx.vars.l) + 2,
      Number(ctx.vars.l) - 1,
      Number(ctx.vars.l) + 10,
    ]),
    explanation: ({ vars, answer }) =>
      `${vars.t} თეთრი ${Number(vars.t) >= 50 ? '50-ზე მეტია ან ტოლია, ამიტომ ვამრგვალებთ ზევით' : '50-ზე ნაკლებია, ამიტომ ვამრგვალებთ ქვევით'}: ${answer} ლარი.`,
  }),

  // ================= U19: კანონზომიერებები და ლოგიკა =================
  defineTemplate({
    id: 'g5-u19-01', grade: 5, topicId: 'g5-patterns-logic', unitId: 'g5-patterns-logic', subtopicId: 'u19-01',
    prompt: 'მიმდევრობაში {a}, {b}, {c}, {d} ერთი რიცხვი არ ჯდება. რომელია?',
    variables: {
      start: { kind: 'int', min: 2, max: 8 },
      step: { kind: 'choice', values: [2, 3, 4, 5] },
      a: { kind: 'choice', values: (v) => [Number(v.start)] },
      b: { kind: 'choice', values: (v) => [Number(v.start) + Number(v.step)] },
      c: { kind: 'choice', values: (v) => [Number(v.start) + 2 * Number(v.step)] },
      d: { kind: 'choice', values: (v) => [Number(v.start) + 3 * Number(v.step) + 1] },
    },
    answer: (v) => Number(v.d),
    format: { kind: 'integer', min: 1, max: 99 },
    options: (v) => [String(v.a), String(v.b), String(v.c), String(v.d)],
    explanation: ({ vars, answer }) =>
      `მიმდევრობა იზრდება ${vars.step}-ით, ამიტომ ბოლო წევრი უნდა იყოს ${Number(vars.start) + 3 * Number(vars.step)}, და არა ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u19-02', grade: 5, topicId: 'g5-patterns-logic', unitId: 'g5-patterns-logic', subtopicId: 'u19-02',
    prompt: 'გააგრძელე მიმდევრობა: {a}, {b}, {c}, ?',
    variables: {
      start: { kind: 'int', min: 2, max: 9 },
      step: { kind: 'choice', values: [2, 3, 4, 5] },
      mode: { kind: 'choice', values: ['add', 'mul'] },
      a: { kind: 'choice', values: (v) => [v.mode === 'add' ? Number(v.start) : Number(v.start)] },
      b: { kind: 'choice', values: (v) => [v.mode === 'add' ? Number(v.start) + Number(v.step) : Number(v.start) * Number(v.step)] },
      c: { kind: 'choice', values: (v) => [v.mode === 'add' ? Number(v.start) + 2 * Number(v.step) : Number(v.start) * Number(v.step) ** 2] },
    },
    constraints: [{ test: (v) => Number(v.start) + 3 * Number(v.step) <= 999 && Number(v.start) * Number(v.step) ** 3 <= 2000, note: 'შედეგი ზედმეტად დიდი არ იყოს' }],
    answer: (v) =>
      v.mode === 'add'
        ? Number(v.start) + 3 * Number(v.step)
        : Number(v.start) * Number(v.step) ** 3,
    format: { kind: 'integer', min: 1, max: 2000 },
    distractors: (ctx) =>
      ctx.vars.mode === 'add'
        ? [
            Number(ctx.vars.start) + 4 * Number(ctx.vars.step),
            Number(ctx.vars.start) + 2 * Number(ctx.vars.step),
            Number(ctx.answer) + 1,
          ]
        : [
            Number(ctx.answer) * Number(ctx.vars.step),
            Number(ctx.vars.start) * Number(ctx.vars.step) ** 2,
            Number(ctx.answer) - Number(ctx.vars.step),
          ],
    explanation: ({ vars, answer }) =>
      vars.mode === 'add'
        ? `ყოველი წევრი წინაზე ${vars.step}-ით მეტია, ამიტომ შემდეგია ${answer}.`
        : `ყოველი წევრი წინაზე ${vars.step}-ჯერ მეტია, ამიტომ შემდეგია ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u19-03', grade: 5, topicId: 'g5-patterns-logic', unitId: 'g5-patterns-logic', subtopicId: 'u19-03',
    prompt: 'თუ a + b = {s} და a = {a}, რა არის b?',
    variables: {
      a: { kind: 'int', min: 3, max: 20 },
      b: { kind: 'int', min: 3, max: 20 },
      s: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.b)] },
    },
    constraints: [{ test: (v) => Number(v.s) - Number(v.a) >= 4, note: 'b საკმარისად დიდი იყოს' }],
    answer: (v) => Number(v.s) - Number(v.a),
    distractors: (ctx) => wrong(Number(ctx.answer), [
      Number(ctx.vars.s),
      Number(ctx.vars.a),
      Number(ctx.answer) + Number(ctx.vars.a),
      Number(ctx.answer) + 1,
      Number(ctx.answer) - 1,
      Number(ctx.answer) + 2,
      Number(ctx.answer) + 10,
      Number(ctx.vars.s) - Number(ctx.vars.a) - 2,
    ]),
    explanation: ({ vars, answer }) => `b = ${vars.s} − ${vars.a} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u19-04', grade: 5, topicId: 'g5-patterns-logic', unitId: 'g5-patterns-logic', subtopicId: 'u19-04',
    prompt: '{k1} აქვს {v1} მარკა, {k2} — {v2}. რამდენჯერ მეტი აქვს {k1}?',
    variables: {
      k1: { kind: 'choice', values: ['ნინოს', 'გიორგის', 'ანას', 'ლუკას'] },
      k2: { kind: 'choice', values: ['ნინოს', 'გიორგის', 'ანას', 'ლუკას'] },
      v2: { kind: 'int', min: 2, max: 9 },
      times: { kind: 'int', min: 2, max: 6 },
      v1: { kind: 'choice', values: (v) => [Number(v.v2) * Number(v.times)] },
    },
    constraints: [{ test: (v) => v.k1 !== v.k2, note: 'სახელები სხვადასხვა იყოს' }],
    answer: (v) => Number(v.v1) / Number(v.v2),
    distractors: ({ vars, answer }) => [
      Number(vars.v1) - Number(vars.v2),
      Number(answer) + 1,
      Number(answer) - 1,
    ].filter((value) => value > 0 && value !== Number(answer)),
    explanation: ({ vars, answer }) => `${vars.v1} ÷ ${vars.v2} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u19-05', grade: 5, topicId: 'g5-patterns-logic', unitId: 'g5-patterns-logic', subtopicId: 'u19-05',
    prompt: 'დედა {m} წლისაა, შვილი — {c} წლის. რამდენი წლის იქნება დედა, როცა შვილი {t} წლის იქნება?',
    variables: {
      m: { kind: 'int', min: 28, max: 45 },
      c: { kind: 'int', min: 5, max: 14 },
      t: { kind: 'int', min: 15, max: 25 },
    },
    constraints: [
      { test: (v) => Number(v.m) - Number(v.c) >= 18, note: 'სხვაობა რეალური იყოს' },
      { test: (v) => Number(v.t) > Number(v.c), note: 'მომავალი დრო იყოს' },
    ],
    answer: (v) => Number(v.t) + (Number(v.m) - Number(v.c)),
    distractors: ({ vars, answer }) => [
      Number(vars.t) + Number(vars.c),
      Number(vars.m),
      Number(answer) + 1,
    ].filter((value) => value > Number(vars.c) && value !== Number(answer)),
    explanation: ({ vars, answer }) =>
      `დედა შვილზე ${Number(vars.m) - Number(vars.c)} წლით უფროსია; ${vars.t} + ${Number(vars.m) - Number(vars.c)} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u19-06', grade: 5, topicId: 'g5-patterns-logic', unitId: 'g5-patterns-logic', subtopicId: 'u19-06',
    prompt: '{a} რვეული ღირს {p} ლარი. რამდენი ლარი ღირს {b} ასეთი რვეული?',
    variables: {
      a: { kind: 'int', min: 2, max: 6 },
      unitPrice: { kind: 'int', min: 2, max: 9 },
      multiplier: { kind: 'int', min: 2, max: 5 },
      p: { kind: 'choice', values: (v) => [Number(v.a) * Number(v.unitPrice)] },
      b: { kind: 'choice', values: (v) => [Number(v.a) * Number(v.multiplier)] },
    },
    answer: (v) => Number(v.b) * Number(v.unitPrice),
    distractors: ({ vars, answer }) => [
      Number(vars.p),
      Number(vars.a) * Number(vars.b),
      Number(answer) + Number(vars.unitPrice),
    ].filter((value) => value > 0 && value !== Number(answer)),
    explanation: ({ vars, answer }) =>
      `ერთი რვეული: ${vars.p} ÷ ${vars.a} = ${vars.unitPrice} ლარი; ${vars.b} × ${vars.unitPrice} = ${answer} ლარი.`,
  }),

  defineTemplate({
    id: 'g5-u19-07', grade: 5, topicId: 'g5-patterns-logic', unitId: 'g5-patterns-logic', subtopicId: 'u19-07',
    prompt: 'ფიგურა შედგება {n}×{n} კვადრატული უჯრისგან. სულ რამდენი 1×1 კვადრატია მასში?',
    variables: { n: { kind: 'int', min: 2, max: 24 } },
    answer: (v) => Number(v.n) * Number(v.n),
    distractors: ({ vars, answer }) => [
      Number(vars.n) * 2,
      Number(answer) + 1,
      Number(answer) - 1,
    ].filter((value) => value > 0 && value !== Number(answer)),
    explanation: ({ vars, answer }) => `${vars.n} × ${vars.n} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u19-08', grade: 5, topicId: 'g5-patterns-logic', unitId: 'g5-patterns-logic', subtopicId: 'u19-08',
    prompt: 'ბადეზე A წერტილიდან B წერტილამდე უნდა გავიაროთ {right} უჯრა მარჯვნივ და {up} უჯრა ზემოთ. სულ რამდენი ნაბიჯია?',
    variables: {
      right: { kind: 'int', min: 2, max: 9 },
      up: { kind: 'int', min: 2, max: 9 },
    },
    answer: (v) => Number(v.right) + Number(v.up),
    distractors: ({ vars, answer }) => [
      Number(vars.right) * Number(vars.up),
      Number(answer) + 1,
      Number(answer) - 1,
    ].filter((value) => value > 0 && value !== Number(answer)),
    explanation: ({ vars, answer }) => `${vars.right} + ${vars.up} = ${answer} ნაბიჯი.`,
  }),

  defineTemplate({
    id: 'g5-u19-09', grade: 5, topicId: 'g5-patterns-logic', unitId: 'g5-patterns-logic', subtopicId: 'u19-09',
    prompt: 'ჩავიფიქრე რიცხვი, გავამრავლე {k}-ზე და მივიღე {p}. რა რიცხვი ჩავიფიქრე?',
    variables: {
      k: { kind: 'int', min: 2, max: 9 },
      x: { kind: 'int', min: 2, max: 12 },
      p: { kind: 'choice', values: (v) => [Number(v.k) * Number(v.x)] },
    },
    answer: (v) => Number(v.p) / Number(v.k),
    distractors: ({ vars, answer }) => [
      Number(vars.p) - Number(vars.k),
      Number(answer) + 1,
      Number(answer) - 1,
    ].filter((value) => value > 0 && value !== Number(answer)),
    explanation: ({ vars, answer }) => `${vars.p} ÷ ${vars.k} = ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u19-10', grade: 5, topicId: 'g5-patterns-logic', unitId: 'g5-patterns-logic', subtopicId: 'u19-10',
    prompt: 'მუშა დღეში {a} დეტალს ამზადებს. {n} დღეში რამდენ დეტალს დაამზადებს?',
    variables: {
      a: { kind: 'int', min: 4, max: 30 },
      n: { kind: 'int', min: 3, max: 12 },
    },
    answer: (v) => Number(v.a) * Number(v.n),
    distractors: ({ vars, answer }) => [
      Number(vars.a) + Number(vars.n),
      Number(answer) + Number(vars.a),
      Number(answer) - Number(vars.a),
    ].filter((value) => value > 0 && value !== Number(answer)),
    explanation: ({ vars, answer }) => `${vars.a} × ${vars.n} = ${answer} დეტალი.`,
  }),

  defineTemplate({
    id: 'g5-u19-11', grade: 5, topicId: 'g5-patterns-logic', unitId: 'g5-patterns-logic', subtopicId: 'u19-11',
    prompt: 'ბადეზე ({x}, {y}) წერტილიდან გადავედით {dx} უჯრით მარცხნივ და {dy} უჯრით ქვემოთ. რა კოორდინატები აქვს ახალ წერტილს?',
    variables: {
      x: { kind: 'int', min: 3, max: 9 },
      y: { kind: 'int', min: 3, max: 9 },
      dx: { kind: 'int', min: 1, max: 2 },
      dy: { kind: 'int', min: 1, max: 2 },
    },
    answer: (v) => `(${Number(v.x) - Number(v.dx)}, ${Number(v.y) - Number(v.dy)})`,
    format: { kind: 'text' },
    distractors: (ctx) => wrong(String(ctx.answer), [
      `(${Number(ctx.vars.x) + Number(ctx.vars.dx)}, ${Number(ctx.vars.y) - Number(ctx.vars.dy)})`,
      `(${Number(ctx.vars.x) - Number(ctx.vars.dx)}, ${Number(ctx.vars.y) + Number(ctx.vars.dy)})`,
      `(${Number(ctx.vars.y) - Number(ctx.vars.dy)}, ${Number(ctx.vars.x) - Number(ctx.vars.dx)})`,
    ]),
    explanation: ({ answer }) =>
      `მარცხნივ ნიშნავს x-ის შემცირებას, ქვემოთ — y-ის: ${answer}.`,
  }),

  defineTemplate({
    id: 'g5-u19-12', grade: 5, topicId: 'g5-patterns-logic', unitId: 'g5-patterns-logic', subtopicId: 'u19-12',
    prompt: 'თუ {a} + {b} = {s}, რა არის {s} − {b}?',
    variables: {
      a: { kind: 'int', min: 12, max: 90 },
      b: { kind: 'int', min: 11, max: 89 },
      s: { kind: 'choice', values: (v) => [Number(v.a) + Number(v.b)] },
    },
    constraints: [{ test: (v) => Number(v.a) >= 5, note: 'a საკმარისად დიდი იყოს' }],
    answer: (v) => Number(v.s) - Number(v.b),
    distractors: (ctx) => wrong(Number(ctx.answer), [
      Number(ctx.vars.s),
      Number(ctx.vars.a) + Number(ctx.vars.b),
      Number(ctx.answer) + Number(ctx.vars.b),
      Number(ctx.answer) + 1,
      Number(ctx.answer) - 1,
      Number(ctx.answer) + 2,
      Number(ctx.answer) + 10,
    ]),
    explanation: ({ vars, answer }) =>
      `ვინაიდან ${vars.a} + ${vars.b} = ${vars.s}, ამოკლებით ${vars.s} − ${vars.b} = ${answer}.`,
  }),

];

/** `grade → topic → subtopic` addresses, for the catalogue and its tests. */
export const GRADE5_PLACEHOLDER_SPECS = GRADE5_PLACEHOLDERS.map((template) => ({
  id: template.id,
  topicId: template.topicId,
  unitId: template.unitId,
  subtopicId: template.subtopicId,
}));
