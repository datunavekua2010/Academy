import type { QuestionTemplate, VariableSpec } from './types';
import { bank, group, num, shownVar } from './g5-helpers';

/**
 * Grade V — Unit 03: ნატურალური რიცხვების შეკრება და გამოკლება
 * (addition and subtraction of natural numbers).
 *
 * Converted from the academy's `U03` bank (6 subtopics × 6 questions):
 * properties of addition, numbers up to a billion, estimation, money,
 * comparisons and number pyramids.
 *
 * Numbers are written the way the bank writes them — `245 678 321`, grouped by
 * thousands, never `245678321`. A prompt that shows a bare `3742135` next to an
 * option list written `3 742 135` is asking the student to read two languages,
 * so every template keeps a numeric variable for the arithmetic and a grouped
 * twin for the screen.
 */

export const G5_U03_SUBTOPICS = [
  'u03-01',
  'u03-02',
  'u03-03',
  'u03-04',
  'u03-05',
  'u03-06',
] as const;

export type G5U03SubtopicId = (typeof G5_U03_SUBTOPICS)[number];

const TOPIC = 'g5-add-sub-whole';

const shown = (n: number): string => group(n);
const shownList = (values: number[]): string[] => values.map(shown);
const money = (n: number): string => `${group(n)} ლარი`;

/** Answers and options are grouped integers, formatted on the way out. */
const grouped = {
  kind: 'integer' as const,
  min: 0,
  format: (value: number | string) => shown(Number(value)),
};

const LESS = '<';
const GREATER = '>';
const EQUAL = '=';
const ORDER_OPTIONS = [LESS, EQUAL, GREATER];

/** A row's fields as numbers, tolerant of the bank's grouped spelling. */
const split = (row: unknown): number[] =>
  String(row)
    .split('|')
    .map((part) => Number(part.replace(/[\s\u00a0\u2009]/g, '')));

/**
 * Declares `a`, `b`, `c` from the drawn row, each beside a grouped display twin
 * `sa`, `sb`, `sc` for the prompt.
 */
const fields = (...indexes: number[]): Record<string, VariableSpec> => {
  const names = ['a', 'b', 'c'];
  const out: Record<string, VariableSpec> = {};
  indexes.forEach((index, position) => {
    const name = names[position]!;
    out[name] = { kind: 'choice', values: (v) => [split(v.row)[index]!] };
    out[`s${name}`] = { kind: 'choice', values: (v) => [shown(split(v.row)[index]!)] };
  });
  return out;
};

const addPairs = [
  '2 458|3 742', '5 136|4 864', '6 275|3 125', '8 412|1 588',
  '3 749|6 251', '7 305|2 695', '4 628|5 372', '9 174|1 826',
  '2 867|7 133', '5 482|4 518', '6 913|3 087', '8 059|1 941',
  '1 476|8 524', '4 205|5 795', '7 638|2 362', '3 194|6 806',
];

/** Triples with a pair that adds to 1 000, so „მოხერხებული ხერხი“ is real. */
const threeTerms = [
  '245|378|755', '136|284|864', '517|246|483', '692|137|308',
  '428|359|572', '753|168|247', '284|619|716', '561|392|439',
  '927|145|73', '638|274|362', '419|583|581', '305|742|695',
  '128|486|872', '357|264|736', '604|181|819', '246|751|754',
];

const pyramidPairs = [
  '12|15', '24|18', '35|27', '46|38', '53|29', '68|17',
  '72|48', '81|19', '94|26', '57|43', '63|38', '45|55',
  '37|44', '58|36', '69|24', '86|52',
];

const moneyRows = [
  '125|87|500', '240|165|600', '318|207|700', '96|154|400',
  '432|268|900', '175|325|800', '286|114|600', '390|210|750',
  '148|252|500', '505|195|900', '264|136|700', '379|221|850',
  '85|215|350', '460|140|800', '172|328|600', '295|105|450',
];

const pyramidTriples = [
  '5|8|12', '7|9|14', '6|11|15', '4|13|17', '9|7|20',
  '8|15|23', '3|14|19', '12|6|21', '10|13|27', '11|8|26',
  '7|17|31', '9|12|29', '6|16|34', '13|11|38', '8|19|41', '14|12|46',
];

const compareRows = [
  '45 678|45 687', '302 450|302 405', '78 390|78 930', '512 004|512 040',
  '6 745|6 754', '980 210|980 201', '14 508|14 580', '37 219|37 219',
  '204 907|204 970', '89 001|89 010', '165 320|165 302', '7 480|7 408',
  '58 613|58 631', '401 770|401 707', '27 335|27 353', '636 500|636 500',
];

export const G5_U03_TEMPLATES: QuestionTemplate[] = [
  // ─────────────── U03.1 — შეკრებისა და გამოკლების თვისებები ───────────────
  bank({
    id: 'g5-u03-q01',
    subtopicId: 'u03-01',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'შეავსე გამოტოვებული რიცხვი: {sa} + {sb} = {sb} + ___',
    variables: { row: { kind: 'choice', values: addPairs }, ...fields(0, 1) },
    answer: (v) => num(v, 'a'),
    format: grouped,
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      return shownList([b, a + b, Math.abs(a - b), a + b + 1]);
    },
    explain: ({ vars, answer }) =>
      `შესაკრებების ადგილების შეცვლა ჯამს არ ცვლის: ${vars.sa} + ${vars.sb} = ${vars.sb} + ${answer}.`,
  }),
  bank({
    id: 'g5-u03-q02',
    subtopicId: 'u03-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე მოხერხებული ხერხით: {sa} + {sb} + {sc}',
    variables: { row: { kind: 'choice', values: threeTerms }, ...fields(0, 1, 2) },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c),
    format: grouped,
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      const c = Number(ctx.vars.c);
      return shownList([a + b, b + c, a + c, Number(ctx.answer) + 10]);
    },
    explain: ({ vars, answer }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      const c = Number(vars.c);
      const pairs: Array<[number, number, string]> = [
        [a, c, `${vars.sa} + ${vars.sc}`],
        [b, c, `${vars.sb} + ${vars.sc}`],
        [a, b, `${vars.sa} + ${vars.sb}`],
      ];
      const easy = pairs.find(([x, y]) => x + y === 1000);
      if (easy) {
        return `${easy[2]} = 1 000, დარჩა ${group(a + b + c - 1000)}. სულ ${answer}.`;
      }
      return `${vars.sa} + ${vars.sb} = ${group(a + b)}, შემდეგ + ${vars.sc} = ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u03-q03',
    subtopicId: 'u03-01',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'გამოთვალე: {sa} + 0',
    variables: { row: { kind: 'choice', values: addPairs }, ...fields(0) },
    answer: (v) => num(v, 'a'),
    format: grouped,
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      return shownList([a + 1, a - 1, a + 10]);
    },
    explain: ({ vars, answer }) => `ნულის მიმატებით რიცხვი არ იცვლება, ამიტომ ${vars.sa} + 0 = ${answer}.`,
  }),
  bank({
    id: 'g5-u03-q04',
    subtopicId: 'u03-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე: {sa} − {sb} − {sc}',
    variables: {
      row: { kind: 'choice', values: threeTerms },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]! + 2000] },
      sa: { kind: 'choice', values: (v) => [shown(split(v.row)[0]! + 2000)] },
      sb: { kind: 'choice', values: (v) => [shown(split(v.row)[1]!)] },
      sc: { kind: 'choice', values: (v) => [shown(split(v.row)[2]!)] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      c: { kind: 'choice', values: (v) => [split(v.row)[2]!] },
    },
    answer: (v) => Number(v.a) - Number(v.b) - Number(v.c),
    format: grouped,
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      const c = Number(ctx.vars.c);
      return shownList([a - b, a - c, a - b + c, Number(ctx.answer) - 100]);
    },
    explain: ({ vars, answer }) =>
      `${vars.sa} − ${vars.sb} = ${group(Number(vars.a) - Number(vars.b))}, შემდეგ − ${vars.sc} = ${answer}.`,
  }),
  bank({
    id: 'g5-u03-q05',
    subtopicId: 'u03-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'იპოვე a-ს მნიშვნელობა: a + {sb} = {sb} + {sc}',
    variables: {
      row: { kind: 'choice', values: addPairs },
      b: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      sb: { kind: 'choice', values: (v) => [shown(split(v.row)[0]!)] },
      c: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      sc: { kind: 'choice', values: (v) => [shown(split(v.row)[1]!)] },
    },
    answer: (v) => num(v, 'c'),
    format: grouped,
    distractors: (ctx) => {
      const b = Number(ctx.vars.b);
      const c = Number(ctx.vars.c);
      return shownList([b, b + c, Math.abs(b - c), c + 10]);
    },
    explain: ({ vars, answer }) =>
      `ორივე მხარეს ერთი და იგივე ${vars.sb} დგას, ამიტომ a = ${vars.sc} = ${answer}.`,
  }),
  bank({
    id: 'g5-u03-q06',
    subtopicId: 'u03-01',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'გამოთვალე მოხერხებული ხერხით: {sa} + {sb} − {sa}',
    variables: { row: { kind: 'choice', values: addPairs }, ...fields(0, 1) },
    answer: (v) => num(v, 'b'),
    format: grouped,
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      return shownList([a, a + b, a + b + 1, b + a - 1]);
    },
    explain: ({ vars, answer }) =>
      `${vars.sa} მიემატა და შემდეგ გამოაკლდა, ამიტომ რჩება მხოლოდ ${vars.sb} = ${answer}.`,
  }),

  // ─────────────── U03.2 — მილიარდამდე ───────────────
  bank({
    id: 'g5-u03-q07',
    subtopicId: 'u03-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'შეასრულე გამოთვლა: {sa} + {sb}',
    variables: {
      a: { kind: 'int', min: 100_000_000, max: 899_999_999 },
      b: { kind: 'int', min: 100_000_000, max: 899_999_999 },
      sa: shownVar('a'),
      sb: shownVar('b'),
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: grouped,
    distractors: (ctx) => {
      const total = Number(ctx.answer);
      return shownList([total + 1_000, total - 1_000, total + 10_000, total - 100_000]);
    },
    explain: ({ vars, answer }) =>
      `თანრიგების მიხედვით: ${vars.sa} + ${vars.sb} = ${answer}.`,
  }),
  bank({
    id: 'g5-u03-q08',
    subtopicId: 'u03-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'შეასრულე გამოთვლა: {sa} − {sb}',
    variables: {
      a: { kind: 'int', min: 500_000_000, max: 999_999_999 },
      b: { kind: 'int', min: 100_000_000, max: 400_000_000 },
      sa: shownVar('a'),
      sb: shownVar('b'),
    },
    answer: (v) => Number(v.a) - Number(v.b),
    format: grouped,
    distractors: (ctx) => {
      const total = Number(ctx.answer);
      return shownList([total + 1_000, total - 1_000, total + 100_000, Number(ctx.vars.b)]);
    },
    explain: ({ vars, answer }) => `${vars.sa} − ${vars.sb} = ${answer}.`,
  }),
  bank({
    id: 'g5-u03-q09',
    subtopicId: 'u03-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'შეასრულე გამოთვლა: {sa} + {sb}',
    variables: {
      a: { kind: 'int', min: 100_000_000, max: 400_000_000 },
      b: { kind: 'int', min: 200_000_000, max: 599_999_999 },
      sa: shownVar('a'),
      sb: shownVar('b'),
    },
    answer: (v) => Number(v.a) + Number(v.b),
    format: grouped,
    distractors: (ctx) => {
      const total = Number(ctx.answer);
      return shownList([total + 1_000, total - 1_000, total + 100_000, total - 10_000]);
    },
    explain: ({ vars, answer }) => `${vars.sa} + ${vars.sb} = ${answer}.`,
  }),
  bank({
    id: 'g5-u03-q10',
    subtopicId: 'u03-02',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'შეასრულე გამოთვლა: {sr} − {sb}',
    variables: {
      r: { kind: 'choice', values: [900_000_000, 800_000_000, 700_000_000, 600_000_000, 500_000_000, 1_000_000_000, 750_000_000, 950_000_000] },
      b: { kind: 'int', min: 100_000_001, max: 450_000_000 },
      sr: shownVar('r'),
      sb: shownVar('b'),
    },
    answer: (v) => Number(v.r) - Number(v.b),
    format: grouped,
    distractors: (ctx) => {
      const total = Number(ctx.answer);
      return shownList([total + 1_000, total - 1_000, total + 10_000, Number(ctx.vars.b)]);
    },
    explain: ({ vars, answer }) =>
      `მრგვალი რიცხვიდან გამოკლებისას თანრიგებს „ვსესხულობთ“: ${vars.sr} − ${vars.sb} = ${answer}.`,
  }),

  // ─────────────── U03.3 — მიახლოებითი შეფასება ───────────────
  bank({
    id: 'g5-u03-q11',
    subtopicId: 'u03-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'დაამრგვალე შესაკრებები ათასეულებამდე და შეაფასე ჯამი: {sa} + {sb}',
    variables: {
      a: { kind: 'int', min: 10_100, max: 80_900 },
      b: { kind: 'int', min: 10_100, max: 80_900 },
      sa: shownVar('a'),
      sb: shownVar('b'),
    },
    answer: (v) => Math.round(Number(v.a) / 1000) * 1000 + Math.round(Number(v.b) / 1000) * 1000,
    format: grouped,
    distractors: (ctx) => {
      const rounded = Number(ctx.answer);
      return shownList([rounded + 1_000, rounded - 1_000, Number(ctx.vars.a) + Number(ctx.vars.b), rounded + 10_000]);
    },
    explain: ({ vars, answer }) => {
      const a = Math.round(Number(vars.a) / 1000) * 1000;
      const b = Math.round(Number(vars.b) / 1000) * 1000;
      return `${vars.sa} ≈ ${shown(a)}, ${vars.sb} ≈ ${shown(b)}. მიახლოებითი ჯამია ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u03-q12',
    subtopicId: 'u03-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'დაამრგვალე რიცხვები ათიათასეულებამდე და შეაფასე სხვაობა: {sa} − {sb}',
    variables: {
      a: { kind: 'int', min: 300_000, max: 900_000 },
      b: { kind: 'int', min: 100_000, max: 250_000 },
      sa: shownVar('a'),
      sb: shownVar('b'),
    },
    answer: (v) => Math.round(Number(v.a) / 10_000) * 10_000 - Math.round(Number(v.b) / 10_000) * 10_000,
    format: grouped,
    distractors: (ctx) => {
      const rounded = Number(ctx.answer);
      return shownList([rounded + 10_000, rounded - 10_000, Number(ctx.vars.a) - Number(ctx.vars.b), rounded + 100_000]);
    },
    explain: ({ vars, answer }) => {
      const a = Math.round(Number(vars.a) / 10_000) * 10_000;
      const b = Math.round(Number(vars.b) / 10_000) * 10_000;
      return `${vars.sa} ≈ ${shown(a)}, ${vars.sb} ≈ ${shown(b)}. მიახლოებითი სხვაობაა ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u03-q13',
    subtopicId: 'u03-03',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'დაამრგვალე მილიონებამდე და შეაფასე ჯამი: {sa} + {sb}',
    variables: {
      a: { kind: 'int', min: 12_400_000, max: 88_600_000 },
      b: { kind: 'int', min: 11_200_000, max: 79_800_000 },
      sa: shownVar('a'),
      sb: shownVar('b'),
    },
    answer: (v) =>
      Math.round(Number(v.a) / 1_000_000) * 1_000_000 + Math.round(Number(v.b) / 1_000_000) * 1_000_000,
    format: grouped,
    distractors: (ctx) => {
      const rounded = Number(ctx.answer);
      return shownList([rounded + 1_000_000, rounded - 1_000_000, Number(ctx.vars.a) + Number(ctx.vars.b), rounded + 10_000_000]);
    },
    explain: ({ vars, answer }) => {
      const a = Math.round(Number(vars.a) / 1_000_000) * 1_000_000;
      const b = Math.round(Number(vars.b) / 1_000_000) * 1_000_000;
      return `${vars.sa} ≈ ${shown(a)}, ${vars.sb} ≈ ${shown(b)}. მიახლოებითი ჯამია ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u03-q14',
    subtopicId: 'u03-03',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'დაამრგვალე ასეულებამდე და შეაფასე სხვაობა: {sa} − {sb}',
    variables: {
      a: { kind: 'int', min: 5_100, max: 9_900 },
      b: { kind: 'int', min: 1_100, max: 4_400 },
      sa: shownVar('a'),
      sb: shownVar('b'),
    },
    answer: (v) => Math.round(Number(v.a) / 100) * 100 - Math.round(Number(v.b) / 100) * 100,
    format: grouped,
    distractors: (ctx) => {
      const rounded = Number(ctx.answer);
      return shownList([rounded + 100, rounded - 100, Number(ctx.vars.a) - Number(ctx.vars.b), rounded + 1_000]);
    },
    explain: ({ vars, answer }) => {
      const a = Math.round(Number(vars.a) / 100) * 100;
      const b = Math.round(Number(vars.b) / 100) * 100;
      return `${vars.sa} ≈ ${shown(a)}, ${vars.sb} ≈ ${shown(b)}. მიახლოებითი სხვაობაა ${answer}.`;
    },
  }),

  // ─────────────── U03.4 — ფულადი თანხები ───────────────
  bank({
    id: 'g5-u03-q15',
    subtopicId: 'u03-04',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'ნიკას აქვს {sa} ლარი, ხოლო მარიამს — {sb} ლარი. რამდენი ლარი აქვთ მათ ერთად?',
    variables: { row: { kind: 'choice', values: moneyRows }, ...fields(0, 1) },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0, format: (value: number | string) => money(Number(value)) },
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      return [Math.abs(a - b), a + b + 10, a + b - 10, a].map(money);
    },
    explain: ({ vars, answer }) => `${vars.sa} + ${vars.sb} = ${answer}.`,
  }),
  bank({
    id: 'g5-u03-q16',
    subtopicId: 'u03-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გიორგის ჰქონდა {sc} ლარი. მან იყიდა წიგნი {sa} ლარად და ფეხსაცმელი {sb} ლარად. რამდენი ლარი დარჩა?',
    variables: { row: { kind: 'choice', values: moneyRows }, ...fields(0, 1, 2) },
    answer: (v) => Number(v.c) - Number(v.a) - Number(v.b),
    format: { kind: 'integer', min: 0, format: (value: number | string) => money(Number(value)) },
    distractors: (ctx) => {
      const c = Number(ctx.vars.c);
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      return [c - a, c - b, a + b, Number(ctx.answer) + 10].map((n) => money(Math.abs(n)));
    },
    explain: ({ vars, answer }) =>
      `${vars.sa} + ${vars.sb} = ${money(Number(vars.a) + Number(vars.b))} დაიხარჯა; ${vars.sc} − ${money(Number(vars.a) + Number(vars.b))} = ${answer}.`,
  }),
  bank({
    id: 'g5-u03-q17',
    subtopicId: 'u03-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ერთი ნივთი {sa} ლარია, მეორე — {sb} ლარი. რამდენი ლარით ძვირია ძვირი ნივთი იაფზე?',
    variables: { row: { kind: 'choice', values: moneyRows }, ...fields(0, 1) },
    answer: (v) => Math.abs(Number(v.a) - Number(v.b)),
    format: { kind: 'integer', min: 0, format: (value: number | string) => money(Number(value)) },
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      const diff = Math.abs(a - b);
      return [a + b, diff + 10, diff - 10, Math.max(a, b)].map((n) => money(Math.abs(n)));
    },
    explain: ({ vars, answer }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      const big = Math.max(a, b);
      const small = Math.min(a, b);
      return `სხვაობა: ${group(big)} − ${group(small)} = ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u03-q18',
    subtopicId: 'u03-04',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'სამ დღეში მაღაზიამ გაყიდა {sa}, {sb} და {sc} ლარის საქონელი. რამდენის საქონელი გაიყიდა სამ დღეში სულ?',
    variables: {
      a: { kind: 'int', min: 1_200, max: 4_500 },
      b: { kind: 'int', min: 900, max: 3_800 },
      c: { kind: 'int', min: 1_500, max: 4_200 },
      sa: shownVar('a'),
      sb: shownVar('b'),
      sc: shownVar('c'),
    },
    answer: (v) => Number(v.a) + Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 0, format: (value: number | string) => money(Number(value)) },
    distractors: (ctx) => {
      const total = Number(ctx.answer);
      return shownList([
        Number(ctx.vars.a) + Number(ctx.vars.b),
        Number(ctx.vars.b) + Number(ctx.vars.c),
        total + 100,
        total - 100,
      ]).map((s) => `${s} ლარი`);
    },
    explain: ({ vars, answer }) => `${vars.sa} + ${vars.sb} + ${vars.sc} = ${answer}.`,
  }),
  bank({
    id: 'g5-u03-q19',
    subtopicId: 'u03-04',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ანგარიშზე იყო {sa} ლარი. გატანილი იქნა {sb} ლარი, შემდეგ დაემატა {sc} ლარი. რამდენი ლარია ახლა?',
    variables: {
      a: { kind: 'int', min: 3_000, max: 9_000 },
      b: { kind: 'int', min: 1_000, max: 2_900 },
      c: { kind: 'int', min: 500, max: 2_500 },
      sa: shownVar('a'),
      sb: shownVar('b'),
      sc: shownVar('c'),
    },
    answer: (v) => Number(v.a) - Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 0, format: (value: number | string) => money(Number(value)) },
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      const c = Number(ctx.vars.c);
      return shownList([a - b, a + c, a - b - c, Number(ctx.answer) + 100]).map((s) => {
        const value = Number(s.replace(/\s/g, ''));
        return `${group(value)} ლარი`;
      });
    },
    explain: ({ vars, answer }) =>
      `${vars.sa} − ${vars.sb} = ${group(Number(vars.a) - Number(vars.b))}, შემდეგ + ${vars.sc} = ${answer}.`,
  }),

  // ─────────────── U03.5 — უტოლობები ───────────────
  bank({
    id: 'g5-u03-q20',
    subtopicId: 'u03-05',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'ჩასვი შედარების ნიშანი (>), (<) ან (=): {sa} ___ {sb}',
    variables: { row: { kind: 'choice', values: compareRows }, ...fields(0, 1) },
    answer: (v) => (Number(v.a) > Number(v.b) ? GREATER : Number(v.a) < Number(v.b) ? LESS : EQUAL),
    optionCount: 3,
    options: () => ORDER_OPTIONS,
    format: { kind: 'text' },
    explain: ({ vars, answer }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      const why =
        answer === EQUAL
          ? 'ორივე რიცხვი ერთნაირია, ამიტომ ტოლობაა.'
          : `${group(Math.max(a, b))} მეტია ${group(Math.min(a, b))}-ზე.`;
      return `${vars.sa} ${answer} ${vars.sb}: ${why}`;
    },
  }),
  bank({
    id: 'g5-u03-q21',
    subtopicId: 'u03-05',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'იპოვე უმცირესი ციფრი, რომელიც □-ის ნაცვლად უნდა ჩაისვას, რომ იყოს სწორი: {sh}□ 200 > {st}',
    variables: {
      h: { kind: 'int', min: 11, max: 88 },
      t: { kind: 'int', min: 10, max: 98 },
      sh: shownVar('h'),
      st: { kind: 'choice', values: (v) => [`${group(Number(v.h) * 10_000 + Number(v.t) * 1_000 + 200)}`] },
    },
    answer: (v) => (Number(v.t) % 10 === 9 ? 0 : (Number(v.t) % 10) + 1),
    format: { kind: 'integer', min: 0, max: 9 },
    distractors: () => ['0', '1', '2', '3', '5'],
    explain: ({ vars, answer }) => {
      const h = Number(vars.h);
      const t = Number(vars.t);
      return `${group(h * 10_000 + t * 1_000 + 200)} უდრის ${group(h * 10_000 + t * 1_000 + 200)}-ს, ამიტომ ციფრი უნდა აღემატებოდეს ${t % 10}-ს. უმცირესია ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u03-q22',
    subtopicId: 'u03-05',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'იპოვე უდიდესი ციფრი, რომელიც □-ის ნაცვლად უნდა ჩაისვას, რომ იყოს სწორი: {sh}□ 100 < {st}',
    variables: {
      h: { kind: 'int', min: 11, max: 88 },
      t: { kind: 'int', min: 10, max: 98 },
      sh: shownVar('h'),
      st: { kind: 'choice', values: (v) => [`${group(Number(v.h) * 10_000 + Number(v.t) * 1_000 + 100)}`] },
    },
    answer: (v) => (Number(v.t) % 10 === 1 ? 0 : (Number(v.t) % 10) - 1),
    format: { kind: 'integer', min: 0, max: 9 },
    distractors: () => ['5', '6', '7', '8', '9'],
    explain: ({ vars, answer }) => {
      const t = Number(vars.t);
      return `ციფრი უნდა იყოს ${t % 10}-ზე ნაკლები. უდიდესი ასეთი ციფრია ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u03-q23',
    subtopicId: 'u03-05',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'შეავსე გამოტოვებული რიცხვი: {sa} + ___ = {st}',
    variables: {
      t: { kind: 'choice', values: [200_000, 300_000, 250_000, 450_000, 500_000, 600_000, 350_000, 700_000] },
      a: { kind: 'int', min: 20_000, max: 150_000 },
      st: shownVar('t'),
      sa: shownVar('a'),
    },
    answer: (v) => Number(v.t) - Number(v.a),
    format: grouped,
    distractors: (ctx) => {
      const t = Number(ctx.vars.t);
      const a = Number(ctx.vars.a);
      return shownList([t + a, Number(ctx.answer) + 1_000, Number(ctx.answer) - 1_000, a]);
    },
    explain: ({ vars, answer }) => `უცნობი შესაკრებია: ${vars.st} − ${vars.sa} = ${answer}.`,
  }),

  // ─────────────── U03.6 — რიცხვითი პირამიდები ───────────────
  bank({
    id: 'g5-u03-q24',
    subtopicId: 'u03-06',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'რიცხვით პირამიდაში ზედა რიცხვი ორი ქვედა რიცხვის ჯამია. ქვედა რიცხვებია {sa} და {sb}. რა არის ზედა რიცხვი?',
    variables: { row: { kind: 'choice', values: pyramidPairs }, ...fields(0, 1) },
    answer: (v) => Number(v.a) + Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      return shownList([Math.abs(a - b), a * b, a + b + 1, a + b - 1]);
    },
    explain: ({ vars, answer }) => `ზედა რიცხვია ${vars.sa} + ${vars.sb} = ${answer}.`,
  }),
  bank({
    id: 'g5-u03-q25',
    subtopicId: 'u03-06',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'პირამიდის მარცხენა ქვედა რიცხვია {sa}, ზედა — {stop}. რა არის მარჯვენა ქვედა რიცხვი?',
    variables: {
      row: { kind: 'choice', values: pyramidTriples },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      top: { kind: 'choice', values: (v) => [split(v.row)[0]! + split(v.row)[1]!] },
      sa: { kind: 'choice', values: (v) => [shown(split(v.row)[0]!)] },
      stop: { kind: 'choice', values: (v) => [shown(split(v.row)[0]! + split(v.row)[1]!)] },
    },
    answer: (v) => num(v, 'b'),
    format: { kind: 'integer', min: 0 },
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const top = Number(ctx.vars.top);
      return shownList([a, top + a, top - a + 1, Number(ctx.answer) + 2]);
    },
    explain: ({ vars, answer }) =>
      `ზედა = მარცხენა + მარჯვენა, ამიტომ ${vars.stop} − ${vars.sa} = ${answer}.`,
  }),
  bank({
    id: 'g5-u03-q26',
    subtopicId: 'u03-06',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'პირამიდის ორი ქვედა რიცხვის ჯამია {stop}. ერთი მათგანი {sa}-ია. რა არის მეორე?',
    variables: {
      row: { kind: 'choice', values: pyramidTriples },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      top: { kind: 'choice', values: (v) => [split(v.row)[0]! + split(v.row)[1]!] },
      sa: { kind: 'choice', values: (v) => [shown(split(v.row)[0]!)] },
      stop: { kind: 'choice', values: (v) => [shown(split(v.row)[0]! + split(v.row)[1]!)] },
    },
    answer: (v) => num(v, 'b'),
    format: { kind: 'integer', min: 0 },
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const top = Number(ctx.vars.top);
      return shownList([top + a, a, top, Number(ctx.answer) + 3]);
    },
    explain: ({ vars, answer }) => `${vars.stop} − ${vars.sa} = ${answer}.`,
  }),
  bank({
    id: 'g5-u03-q27',
    subtopicId: 'u03-06',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'სამსაფეხურიან პირამიდაში ქვედა რიგია {sa}, {sb} და {sc}. ყოველი ზედა რიცხვი ორი ქვედას ჯამია. რა არის ყველაზე ზედა რიცხვი?',
    variables: {
      a: { kind: 'int', min: 3, max: 19 },
      b: { kind: 'int', min: 3, max: 19 },
      c: { kind: 'int', min: 3, max: 19 },
      sa: shownVar('a'),
      sb: shownVar('b'),
      sc: shownVar('c'),
    },
    answer: (v) => Number(v.a) + 2 * Number(v.b) + Number(v.c),
    format: { kind: 'integer', min: 0 },
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      const c = Number(ctx.vars.c);
      return shownList([a + b + c, Number(ctx.answer) + b, Number(ctx.answer) - b, a + b + 2 * c]);
    },
    explain: ({ vars, answer }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      const c = Number(vars.c);
      return `შუა რიგია ${a + b} და ${b + c}; ზედა რიცხვია ${a + b} + ${b + c} = ${answer}.`;
    },
  }),
];
