import type { QuestionTemplate } from './types';
import { bank, displayNumber, group, num, shownVar } from './g5-helpers';

/**
 * Grade V — Unit 04: გამრავლება (multiplication).
 *
 * Converted from the academy's `U04` bank (9 subtopics × 6 questions):
 * properties, single-digit multiplication, column multiplication, missing
 * digits, round numbers, estimation, several factors, three-digit by
 * three-digit, and word problems with inequalities.
 */

export const G5_U04_SUBTOPICS = [
  'u04-01',
  'u04-02',
  'u04-03',
  'u04-04',
  'u04-05',
  'u04-06',
  'u04-07',
  'u04-08',
  'u04-09',
] as const;

export type G5U04SubtopicId = (typeof G5_U04_SUBTOPICS)[number];

const TOPIC = 'g5-multiplication';

const shown = (n: number): string => displayNumber(group(n));
const shownList = (values: number[]): string[] => values.map(shown);
const rowNumbers = (row: unknown): number[] =>
  String(row)
    .split('|')
    .map((part) => Number(part.replace(/[\s\u00a0\u2009]/g, '')));

const grouped = {
  kind: 'integer' as const,
  min: 0,
  format: (value: number | string) => shown(Number(value)),
};

const LESS = '<';
const GREATER = '>';
const EQUAL = '=';
const ORDER_OPTIONS = [LESS, EQUAL, GREATER];

/** `head|digit|multiplier` — the product the student sees is computed. */
const missingDigitRows = [
  '31|7|4', '30|6|5', '41|2|3', '29|1|4', '51|3|2', '24|5|3',
  '61|8|5', '44|4|2', '37|6|4', '26|9|5', '42|3|3', '33|1|4',
  '52|6|2', '48|7|3', '63|5|4', '75|4|5',
];

/** `head|digit|multiplier`: `head·10 + digit` is the two-digit factor. */
const missingFactorRows = [
  '1|5|4', '2|3|3', '4|1|2', '3|4|5', '2|8|2', '5|2|3',
  '6|1|4', '4|6|5', '1|9|2', '3|7|3', '5|4|4', '2|6|5',
  '7|2|3', '8|1|4', '9|3|2', '6|5|5',
];

const compareProductRows = [
  '125|8|250|4', '45|12|90|6', '32|15|48|10', '24|25|30|20',
  '16|9|18|8', '75|4|50|6', '120|5|200|3', '18|7|14|9',
  '64|3|48|4', '90|2|60|3', '35|8|40|7', '27|6|18|9',
];

const twoFactorRows = [
  '2|5|7', '4|6|25', '3|8|5|2', '25|16|4', '12|5|20', '2|15|4|25',
  '5|6|9', '8|25|3', '7|4|15', '6|12|5', '9|5|8', '4|3|25',
  '11|4|25', '13|2|5', '6|8|25', '3|25|7',
];

const threeByThree = [
  '124|213', '236|145', '307|124', '418|206', '529|314', '642|257',
  '173|142', '294|318', '356|127', '481|205', '527|336', '638|274',
  '215|163', '342|251', '476|183', '553|219', '118|209', '267|154',
  '325|186', '439|217', '584|163', '671|248', '792|135', '143|326',
];

export const G5_U04_TEMPLATES: QuestionTemplate[] = [
  // ─────────────── U04.1 — გამრავლების თვისებები ───────────────
  bank({
    id: 'g5-u04-q01',
    subtopicId: 'u04-01',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'გამოთვალე მოხერხებული ხერხით: {sa} × {sb} × {sc}',
    variables: {
      row: {
        kind: 'choice',
        values: ['25|17|4', '25|13|4', '125|8|6', '50|12|2', '20|15|4', '25|19|4',
          '125|16|8', '50|22|2', '25|21|4', '20|27|4', '125|24|8', '50|18|2',
          '25|23|4', '125|32|8', '20|31|4', '50|26|2'],
      },
      a: { kind: 'choice', values: (v) => [rowNumbers(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [rowNumbers(v.row)[1]!] },
      c: { kind: 'choice', values: (v) => [rowNumbers(v.row)[2]!] },
      sa: { kind: 'choice', values: (v) => [shown(rowNumbers(v.row)[0]!)] },
      sb: { kind: 'choice', values: (v) => [shown(rowNumbers(v.row)[1]!)] },
      sc: { kind: 'choice', values: (v) => [shown(rowNumbers(v.row)[2]!)] },
    },
    answer: (v) => Number(v.a) * Number(v.b) * Number(v.c),
    format: grouped,
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      const c = Number(ctx.vars.c);
      return shownList([a * b, b * c, a + b + c, a * b * c + 100]);
    },
    explain: ({ vars, answer }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      const c = Number(vars.c);
      return `${a} × ${c} = ${group(a * c)}, შემდეგ ${group(a * c)} × ${b} = ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u04-q02',
    subtopicId: 'u04-01',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'შეავსე გამოტოვებული რიცხვი: {sa} × {sb} = {sb} × ___',
    variables: {
      a: { kind: 'int', min: 12, max: 89 },
      b: { kind: 'int', min: 12, max: 89 },
      sa: shownVar('a'),
      sb: shownVar('b'),
    },
    answer: (v) => num(v, 'a'),
    format: grouped,
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      return shownList([b, a * b, a + b, Math.abs(a - b)]);
    },
    explain: ({ vars, answer }) =>
      `მამრავლების ადგილების შეცვლა ნამრავლს არ ცვლის: ${vars.sa} × ${vars.sb} = ${vars.sb} × ${answer}.`,
  }),
  bank({
    id: 'g5-u04-q03',
    subtopicId: 'u04-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე მოხერხებული ხერხით: {sa} × {sb} + {sc} × {sb}',
    variables: {
      row: {
        kind: 'choice',
        values: ['48|13|52', '26|35|74', '37|24|63', '52|15|48', '71|18|29', '63|27|37',
          '44|12|56', '58|25|42', '39|17|61', '61|21|39', '28|14|72', '76|19|24',
          '67|16|33', '53|22|47', '81|13|19', '46|18|54'],
      },
      a: { kind: 'choice', values: (v) => [rowNumbers(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [rowNumbers(v.row)[1]!] },
      c: { kind: 'choice', values: (v) => [rowNumbers(v.row)[2]!] },
      sa: { kind: 'choice', values: (v) => [shown(rowNumbers(v.row)[0]!)] },
      sb: { kind: 'choice', values: (v) => [shown(rowNumbers(v.row)[1]!)] },
      sc: { kind: 'choice', values: (v) => [shown(rowNumbers(v.row)[2]!)] },
    },
    answer: (v) => (Number(v.a) + Number(v.c)) * Number(v.b),
    format: grouped,
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      const c = Number(ctx.vars.c);
      return shownList([a * b, c * b, a + c, a * b + c]);
    },
    explain: ({ vars, answer }) => {
      const a = Number(vars.a);
      const c = Number(vars.c);
      const b = Number(vars.b);
      return `საერთო მამრავლი ${b} ფრჩხილიდან გავიტანოთ: (${a} + ${c}) × ${b} = ${group(a + c)} × ${b} = ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u04-q04',
    subtopicId: 'u04-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე მოხერხებული ხერხით: {sa} × {sb}',
    variables: {
      a: { kind: 'choice', values: [99, 99, 101, 99, 98, 101, 99, 102, 99, 98, 101, 97] },
      b: { kind: 'int', min: 12, max: 79 },
      sa: shownVar('a'),
      sb: shownVar('b'),
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: grouped,
    distractors: (ctx) => {
      const b = Number(ctx.vars.b);
      const answer = Number(ctx.answer);
      return shownList([answer + b, answer - b, answer + 10, answer - 10]);
    },
    explain: ({ vars, answer }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      const near = a < 100 ? 100 - a : a - 100;
      return `${a} = 100 ${a < 100 ? '−' : '+'} ${near}, ამიტომ ${group(100 * b)} ${a < 100 ? '−' : '+'} ${group(near * b)} = ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u04-q05',
    subtopicId: 'u04-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე: {sa} × 0 + {sb}',
    variables: {
      a: { kind: 'int', min: 11, max: 99 },
      b: { kind: 'int', min: 11, max: 99 },
      sa: shownVar('a'),
      sb: shownVar('b'),
    },
    answer: (v) => num(v, 'b'),
    format: grouped,
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      return shownList([0, a, a + b, a * b + b]);
    },
    explain: ({ vars, answer }) =>
      `ნულზე გამრავლებისას ნამრავლია 0, ამიტომ 0 + ${vars.sb} = ${answer}.`,
  }),
  bank({
    id: 'g5-u04-q06',
    subtopicId: 'u04-01',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'გამოთვალე: {sa} × 1 − {sb}',
    variables: {
      a: { kind: 'int', min: 200, max: 900 },
      b: { kind: 'int', min: 50, max: 199 },
      sa: shownVar('a'),
      sb: shownVar('b'),
    },
    answer: (v) => num(v, 'a') - num(v, 'b'),
    format: grouped,
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      return shownList([a + b, a * b, a - b + 1, a - b - 1]);
    },
    explain: ({ vars, answer }) =>
      `ერთზე გამრავლებისას რიცხვი არ იცვლება, ამიტომ ${vars.sa} − ${vars.sb} = ${answer}.`,
  }),

  // ─────────────── U04.2 — ერთნიშნა რიცხვზე გამრავლება ───────────────
  bank({
    id: 'g5-u04-q07',
    subtopicId: 'u04-02',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'გამოთვალე: {sa} × {sd}',
    variables: {
      a: { kind: 'int', min: 1_100, max: 99_900 },
      d: { kind: 'int', min: 2, max: 9 },
      sa: shownVar('a'),
      sd: shownVar('d'),
    },
    answer: (v) => Number(v.a) * Number(v.d),
    format: grouped,
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 100, answer - 100, answer + 1_000, answer - 1_000]);
    },
    explain: ({ vars, answer }) =>
      `თანრიგების მიხედვით: ${vars.sa} × ${vars.sd} = ${answer}.`,
  }),
  bank({
    id: 'g5-u04-q08',
    subtopicId: 'u04-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე: {sa} × 7',
    variables: {
      a: { kind: 'int', min: 11_000, max: 799_000 },
      sa: shownVar('a'),
    },
    answer: (v) => num(v, 'a') * 7,
    format: grouped,
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 7_000, answer - 7_000, answer + 700, answer - 700]);
    },
    explain: ({ vars, answer }) => `${vars.sa} × 7 = ${answer}.`,
  }),
  bank({
    id: 'g5-u04-q09',
    subtopicId: 'u04-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე: {sa} × 5',
    variables: {
      a: { kind: 'int', min: 11_000, max: 899_000 },
      sa: shownVar('a'),
    },
    answer: (v) => num(v, 'a') * 5,
    format: grouped,
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 500, answer - 500, answer + 5_000, answer - 5_000]);
    },
    explain: ({ vars, answer }) => `${vars.sa} × 5 = ${vars.sa} × 10 ÷ 2 = ${answer}.`,
  }),
  bank({
    id: 'g5-u04-q10',
    subtopicId: 'u04-02',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'გამოთვალე: {sa} × 9',
    variables: {
      a: { kind: 'int', min: 11_000, max: 599_000 },
      sa: shownVar('a'),
    },
    answer: (v) => num(v, 'a') * 9,
    format: grouped,
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 9_000, answer - 9_000, answer + 900, answer - 900]);
    },
    explain: ({ vars, answer }) => {
      const a = Number(vars.a);
      return `${vars.sa} × 9 = ${vars.sa} × 10 − ${vars.sa} = ${group(a * 10)} − ${vars.sa} = ${answer}.`;
    },
  }),

  // ─────────────── U04.3 — სვეტით გამრავლება ───────────────
  bank({
    id: 'g5-u04-q11',
    subtopicId: 'u04-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე სვეტად: {sa} × {sb}',
    variables: {
      a: { kind: 'int', min: 110, max: 790 },
      b: { kind: 'int', min: 12, max: 98 },
      sa: shownVar('a'),
      sb: shownVar('b'),
    },
    answer: (v) => num(v, 'a') * num(v, 'b'),
    format: grouped,
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 100, answer - 100, answer + 1_000, answer - 1_000]);
    },
    explain: ({ vars, answer }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      const ones = b % 10;
      const tens = Math.floor(b / 10);
      return `${a} × ${ones} = ${group(a * ones)}; ${a} × ${tens}0 = ${group(a * tens * 10)}. ჯამი: ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u04-q12',
    subtopicId: 'u04-03',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'გამოთვალე სვეტად: {sa} × {sb}',
    variables: {
      a: { kind: 'int', min: 1_100, max: 7_900 },
      b: { kind: 'int', min: 12, max: 89 },
      sa: shownVar('a'),
      sb: shownVar('b'),
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: grouped,
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 1_000, answer - 1_000, answer + 10_000, answer - 10_000]);
    },
    explain: ({ vars, answer }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      const ones = b % 10;
      const tens = Math.floor(b / 10);
      return `${a} × ${ones} = ${group(a * ones)}; ${a} × ${tens}0 = ${group(a * tens * 10)}. ჯამი: ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u04-q13',
    subtopicId: 'u04-03',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'გამოთვალე სვეტად: {sa} × {sb}',
    variables: {
      a: { kind: 'int', min: 1_100, max: 9_900 },
      b: { kind: 'int', min: 42, max: 95 },
      sa: shownVar('a'),
      sb: shownVar('b'),
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: grouped,
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 1_000, answer - 1_000, answer + 100, answer - 100]);
    },
    explain: ({ vars, answer }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      const ones = b % 10;
      const tens = Math.floor(b / 10);
      return `${a} × ${ones} = ${group(a * ones)}; ${a} × ${tens}0 = ${group(a * tens * 10)}. ჯამი: ${answer}.`;
    },
  }),

  // ─────────────── U04.4 — გამოტოვებული ციფრები ───────────────
  bank({
    id: 'g5-u04-q14',
    subtopicId: 'u04-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'იპოვე გამოტოვებული ციფრი: {sh}□ × {sd} = {sp}',
    variables: {
      row: { kind: 'choice', values: missingDigitRows },
      h: { kind: 'choice', values: (v) => [rowNumbers(v.row)[0]!] },
      d: { kind: 'choice', values: (v) => [rowNumbers(v.row)[2]!] },
      digit: { kind: 'choice', values: (v) => [rowNumbers(v.row)[1]!] },
      sh: { kind: 'choice', values: (v) => [shown(rowNumbers(v.row)[0]!)] },
      sd: { kind: 'choice', values: (v) => [shown(rowNumbers(v.row)[2]!)] },
      sp: {
        kind: 'choice',
        values: (v) => [shown((rowNumbers(v.row)[0]! * 10 + rowNumbers(v.row)[1]!) * rowNumbers(v.row)[2]!)],
      },
    },
    answer: (v) => num(v, 'digit'),
    format: { kind: 'integer', min: 0, max: 9 },
    distractors: (ctx) => {
      const digit = Number(ctx.answer);
      return ['0', '1', '2', '3', '5', '8', '9'].filter((d) => Number(d) !== digit).slice(0, 5);
    },
    explain: ({ vars, answer }) => {
      const h = Number(vars.h);
      const d = Number(vars.d);
      return `${h}${answer} × ${d} = ${vars.sp}. გადამოწმება: ${h}${answer} = ${vars.sp} ÷ ${d}.`;
    },
  }),
  bank({
    id: 'g5-u04-q15',
    subtopicId: 'u04-04',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'იპოვე გამოტოვებული ციფრი: {sh}□ × {sd} = {sp}',
    variables: {
      row: { kind: 'choice', values: missingFactorRows },
      h: { kind: 'choice', values: (v) => [rowNumbers(v.row)[0]!] },
      d: { kind: 'choice', values: (v) => [rowNumbers(v.row)[1]!] },
      m: { kind: 'choice', values: (v) => [rowNumbers(v.row)[2]!] },
      digit: { kind: 'choice', values: (v) => [rowNumbers(v.row)[1]!] },
      sh: { kind: 'choice', values: (v) => [shown(rowNumbers(v.row)[0]!)] },
      sd: { kind: 'choice', values: (v) => [shown(rowNumbers(v.row)[2]!)] },
      sp: {
        kind: 'choice',
        values: (v) => [shown((rowNumbers(v.row)[0]! * 10 + rowNumbers(v.row)[1]!) * rowNumbers(v.row)[2]!)],
      },
    },
    answer: (v) => num(v, 'digit'),
    format: { kind: 'integer', min: 0, max: 9 },
    distractors: (ctx) => {
      const digit = Number(ctx.answer);
      return ['0', '1', '2', '3', '4', '6', '8', '9'].filter((x) => Number(x) !== digit).slice(0, 5);
    },
    explain: ({ vars, answer }) => {
      const h = Number(vars.h);
      const d = Number(vars.d);
      return `${h}${answer} × ${d} = ${vars.sp}, ამიტომ გამოტოვებული ციფრია ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u04-q16',
    subtopicId: 'u04-04',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'იპოვე გამოტოვებული რიცხვი: {sa} × ___ = {sp}',
    variables: {
      a: { kind: 'int', min: 12, max: 79 },
      m: { kind: 'int', min: 6, max: 24 },
      sa: shownVar('a'),
      sp: { kind: 'choice', values: (v) => [shown(Number(v.a) * Number(v.m))] },
    },
    answer: (v) => num(v, 'm'),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const m = Number(ctx.answer);
      return shownList([m + 1, m - 1, m + 2, m + 10]);
    },
    explain: ({ vars, answer }) => `უცნობი მამრავლია ${vars.sp} ÷ ${vars.sa} = ${answer}.`,
  }),

  // ─────────────── U04.5 — ნულით დაბოლოებული რიცხვები ───────────────
  bank({
    id: 'g5-u04-q17',
    subtopicId: 'u04-05',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'გამოთვალე: {sa} × {sb}',
    variables: {
      a: { kind: 'choice', values: [340, 2_500, 630, 4_200, 12_000, 5_400, 810, 3_600, 7_200, 1_500, 9_000, 4_800] },
      b: { kind: 'choice', values: [20, 40, 300, 600, 70, 2_000, 30, 500, 80, 400, 60, 900] },
      sa: shownVar('a'),
      sb: shownVar('b'),
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: grouped,
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 1_000, answer - 1_000, answer / 10, answer * 10]);
    },
    explain: ({ vars, answer }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      return `ნულები გავიტანოთ: ${a / 10} × ${b / 10} = ${group((a / 10) * (b / 10))}, დავუმატოთ ორი ნული — ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u04-q18',
    subtopicId: 'u04-05',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე: {sa} × {sb}',
    variables: {
      a: { kind: 'choice', values: [1_200, 2_400, 3_500, 4_600, 5_300, 6_100, 7_800, 8_200] },
      b: { kind: 'choice', values: [1_100, 1_300, 1_500, 1_700, 2_100, 2_300, 1_900, 1_200] },
      sa: shownVar('a'),
      sb: shownVar('b'),
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: grouped,
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 10_000, answer - 10_000, answer / 100, answer * 100]);
    },
    explain: ({ vars, answer }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      return `ნულების გატანის შემდეგ: ${a / 100} × ${b / 100} = ${group((a / 100) * (b / 100))}; დავუმატოთ ოთხი ნული — ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u04-q19',
    subtopicId: 'u04-05',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'გამოთვალე: {sa} × {sb} × {sc}',
    variables: {
      a: { kind: 'choice', values: [20, 30, 40, 50, 60, 25, 35, 45] },
      b: { kind: 'choice', values: [300, 400, 500, 600, 700, 200, 800, 900] },
      c: { kind: 'choice', values: [10, 20, 30, 40, 50, 100, 200, 300] },
      sa: shownVar('a'),
      sb: shownVar('b'),
      sc: shownVar('c'),
    },
    answer: (v) => Number(v.a) * Number(v.b) * Number(v.c),
    format: grouped,
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 10_000, answer - 10_000, answer / 10, answer * 10]);
    },
    explain: ({ vars, answer }) =>
      `${vars.sa} × ${vars.sb} = ${group(Number(vars.a) * Number(vars.b))}, შემდეგ × ${vars.sc} = ${answer}.`,
  }),

  // ─────────────── U04.6 — ნამრავლის შეფასება ───────────────
  bank({
    id: 'g5-u04-q20',
    subtopicId: 'u04-06',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'დაამრგვალე თითოეული მამრავლი უახლოეს ათეულამდე და შეაფასე: {sa} × {sb}',
    variables: {
      a: { kind: 'int', min: 12, max: 88 },
      b: { kind: 'int', min: 12, max: 88 },
      sa: shownVar('a'),
      sb: shownVar('b'),
    },
    answer: (v) => Math.round(Number(v.a) / 10) * 10 * (Math.round(Number(v.b) / 10) * 10),
    format: grouped,
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 100, answer - 100, Number(ctx.vars.a) * Number(ctx.vars.b), answer + 1_000]);
    },
    explain: ({ vars, answer }) => {
      const a = Math.round(Number(vars.a) / 10) * 10;
      const b = Math.round(Number(vars.b) / 10) * 10;
      return `${vars.sa} ≈ ${a}, ${vars.sb} ≈ ${b}. მიახლოებითი ნამრავლია ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u04-q21',
    subtopicId: 'u04-06',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'დაამრგვალე თითოეული მამრავლი უახლოეს ასეულამდე და შეაფასე: {sa} × {sb}',
    variables: {
      a: { kind: 'int', min: 120, max: 880 },
      b: { kind: 'int', min: 120, max: 880 },
      sa: shownVar('a'),
      sb: shownVar('b'),
    },
    answer: (v) => Math.round(Number(v.a) / 100) * 100 * (Math.round(Number(v.b) / 100) * 100),
    format: grouped,
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 10_000, answer - 10_000, Number(ctx.vars.a) * Number(ctx.vars.b), answer + 100_000]);
    },
    explain: ({ vars, answer }) => {
      const a = Math.round(Number(vars.a) / 100) * 100;
      const b = Math.round(Number(vars.b) / 100) * 100;
      return `${vars.sa} ≈ ${a}, ${vars.sb} ≈ ${b}. მიახლოებითი ნამრავლია ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u04-q22',
    subtopicId: 'u04-06',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'დაამრგვალე მამრავლები ათეულებამდე და შეაფასე: {sa} × {sb}',
    variables: {
      a: { kind: 'int', min: 1_200, max: 4_900 },
      b: { kind: 'int', min: 120, max: 980 },
      sa: shownVar('a'),
      sb: shownVar('b'),
    },
    answer: (v) => Math.round(Number(v.a) / 10) * 10 * (Math.round(Number(v.b) / 10) * 10),
    format: grouped,
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 10_000, answer - 10_000, Number(ctx.vars.a) * Number(ctx.vars.b), answer + 100_000]);
    },
    explain: ({ vars, answer }) => {
      const a = Math.round(Number(vars.a) / 10) * 10;
      const b = Math.round(Number(vars.b) / 10) * 10;
      return `${vars.sa} ≈ ${group(a)}, ${vars.sb} ≈ ${group(b)}. მიახლოებითი ნამრავლია ${answer}.`;
    },
  }),

  // ─────────────── U04.7 — სამი და მეტი მამრავლი ───────────────
  bank({
    id: 'g5-u04-q23',
    subtopicId: 'u04-07',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'გამოთვალე: {sa} × {sb} × {sc}',
    variables: {
      row: { kind: 'choice', values: twoFactorRows },
      a: { kind: 'choice', values: (v) => [rowNumbers(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [rowNumbers(v.row)[1]!] },
      c: { kind: 'choice', values: (v) => [rowNumbers(v.row)[2]!] },
      sa: { kind: 'choice', values: (v) => [shown(rowNumbers(v.row)[0]!)] },
      sb: { kind: 'choice', values: (v) => [shown(rowNumbers(v.row)[1]!)] },
      sc: { kind: 'choice', values: (v) => [shown(rowNumbers(v.row)[2]!)] },
    },
    answer: (v) => Number(v.a) * Number(v.b) * Number(v.c),
    format: grouped,
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      const c = Number(ctx.vars.c);
      return shownList([a * b, b * c, a + b + c, a * b * c + 10]);
    },
    explain: ({ vars, answer }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      const c = Number(vars.c);
      return `${a} × ${b} = ${group(a * b)}, შემდეგ ${group(a * b)} × ${c} = ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u04-q24',
    subtopicId: 'u04-07',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე მოხერხებული ხერხით: {sa} × {sb} × {sc} × {sd}',
    variables: {
      a: { kind: 'choice', values: [2, 3, 4, 5, 6, 8, 2, 5] },
      b: { kind: 'choice', values: [15, 8, 25, 12, 25, 15, 5, 4] },
      c: { kind: 'choice', values: [4, 25, 5, 20, 2, 5, 25, 2] },
      d: { kind: 'choice', values: [25, 2, 4, 5, 20, 4, 2, 25] },
      sa: shownVar('a'),
      sb: shownVar('b'),
      sc: shownVar('c'),
      sd: shownVar('d'),
    },
    answer: (v) => Number(v.a) * Number(v.b) * Number(v.c) * Number(v.d),
    format: grouped,
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 10, answer - 10, answer / 10, answer * 10]);
    },
    explain: ({ vars, answer }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      const c = Number(vars.c);
      const d = Number(vars.d);
      return `${a} × ${c} = ${group(a * c)}, ${b} × ${d} = ${group(b * d)}, შემდეგ ${group(a * c)} × ${group(b * d)} = ${answer}.`;
    },
  }),

  // ─────────────── U04.8 — სამნიშნა სამნიშნაზე ───────────────
  bank({
    id: 'g5-u04-q25',
    subtopicId: 'u04-08',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'გამოთვალე სვეტად: {sa} × {sb}',
    variables: {
      row: { kind: 'choice', values: threeByThree },
      a: { kind: 'choice', values: (v) => [rowNumbers(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [rowNumbers(v.row)[1]!] },
      sa: { kind: 'choice', values: (v) => [shown(rowNumbers(v.row)[0]!)] },
      sb: { kind: 'choice', values: (v) => [shown(rowNumbers(v.row)[1]!)] },
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: grouped,
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 1_000, answer - 1_000, answer + 10_000, answer - 10_000]);
    },
    explain: ({ vars, answer }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      const ones = b % 10;
      const tens = Math.floor(b / 10) % 10;
      const hundreds = Math.floor(b / 100);
      return `${a} × ${ones} = ${group(a * ones)}; ${a} × ${tens * 10} = ${group(a * tens * 10)}; ${a} × ${hundreds}00 = ${group(a * hundreds * 100)}. ჯამი: ${answer}.`;
    },
  }),

  bank({
    id: 'g5-u04-q26',
    subtopicId: 'u04-08',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'გამოთვალე სვეტად: {sa} × {sb}, სადაც ერთი მამრავლი მრგვალი რიცხვია',
    variables: {
      a: { kind: 'int', min: 11, max: 79 },
      b: { kind: 'choice', values: [200, 300, 400, 500, 600, 700, 800, 900, 1_000, 1_100, 1_200, 1_500] },
      sa: shownVar('a'),
      sb: shownVar('b'),
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: grouped,
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 1_000, answer - 1_000, answer + 100, answer - 100]);
    },
    explain: ({ vars, answer }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      return `${a} × ${b / 100} = ${group((a * b) / 100)}, დავუმატოთ ორი ნული — ${answer}.`;
    },
  }),

  // ─────────────── U04.9 — ამოცანები და უტოლობები ───────────────
  bank({
    id: 'g5-u04-q27',
    subtopicId: 'u04-09',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'ერთ ყუთში {a} ფანქარია. რამდენი ფანქარი იქნება {b} ასეთ ყუთში?',
    variables: {
      a: { kind: 'int', min: 12, max: 48 },
      b: { kind: 'int', min: 15, max: 40 },
      sa: shownVar('a'),
      sb: shownVar('b'),
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: grouped,
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      return shownList([a + b, a * b + 24, a * b - 24, a * b + a]);
    },
    explain: ({ vars, answer }) => `${vars.sa} × ${vars.sb} = ${answer}.`,
  }),
  bank({
    id: 'g5-u04-q28',
    subtopicId: 'u04-09',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ავტობუსში {a} მგზავრია. რამდენი მგზავრი გადაიყვანა {b} ასეთმა ავტობუსმა?',
    variables: {
      a: { kind: 'int', min: 32, max: 68 },
      b: { kind: 'int', min: 12, max: 24 },
      sa: shownVar('a'),
      sb: shownVar('b'),
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: grouped,
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      return shownList([a + b, a * b + a, a * b - a, a * b + 10]);
    },
    explain: ({ vars, answer }) => `${vars.sa} × ${vars.sb} = ${answer}.`,
  }),
  bank({
    id: 'g5-u04-q29',
    subtopicId: 'u04-09',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'შეადარე: {sa} × {sd} ___ {sb} × {sc}',
    variables: {
      row: { kind: 'choice', values: compareProductRows },
      a: { kind: 'choice', values: (v) => [rowNumbers(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [rowNumbers(v.row)[1]!] },
      c: { kind: 'choice', values: (v) => [rowNumbers(v.row)[2]!] },
      d: { kind: 'choice', values: (v) => [rowNumbers(v.row)[3]!] },
      sa: { kind: 'choice', values: (v) => [shown(rowNumbers(v.row)[0]!)] },
      sb: { kind: 'choice', values: (v) => [shown(rowNumbers(v.row)[1]!)] },
      sc: { kind: 'choice', values: (v) => [shown(rowNumbers(v.row)[2]!)] },
      sd: { kind: 'choice', values: (v) => [shown(rowNumbers(v.row)[3]!)] },
    },
    answer: (v) => {
      const left = Number(v.a) * Number(v.d);
      const right = Number(v.b) * Number(v.c);
      return left > right ? GREATER : left < right ? LESS : EQUAL;
    },
    optionCount: 3,
    options: () => ORDER_OPTIONS,
    format: { kind: 'text' },
    explain: ({ vars, answer }) => {
      const left = Number(vars.a) * Number(vars.d);
      const right = Number(vars.b) * Number(vars.c);
      return `მარცხნივ ${vars.sa} × ${vars.sd} = ${group(left)}, მარჯვნივ ${vars.sb} × ${vars.sc} = ${group(right)}, ამიტომ ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u04-q30',
    subtopicId: 'u04-09',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'იპოვე უმცირესი ნატურალური რიცხვი x, რომლისთვისაც {sa} × x > {target}',
    variables: {
      a: { kind: 'int', min: 12, max: 48 },
      target: { kind: 'int', min: 200, max: 900 },
      sa: shownVar('a'),
      starget: shownVar('target'),
    },
    answer: (v) => Math.floor(Number(v.target) / Number(v.a)) + 1,
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 1, answer - 1, Math.floor(Number(ctx.vars.target) / Number(ctx.vars.a)), answer + 2]);
    },
    explain: ({ vars, answer }) => {
      const a = Number(vars.a);
      const t = Number(vars.target);
      return `${t} ÷ ${a} = ${Math.floor(t / a)} ნაშთით, ამიტომ უმცირესი x არის ${answer}: ${a} × ${answer} = ${group(a * Number(answer))} > ${vars.starget}.`;
    },
  }),
  bank({
    id: 'g5-u04-q31',
    subtopicId: 'u04-09',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'შეავსე გამოტოვებული რიცხვი: {sa} × ___ = {sp}',
    variables: {
      a: { kind: 'int', min: 15, max: 64 },
      m: { kind: 'int', min: 8, max: 30 },
      sa: shownVar('a'),
      sp: { kind: 'choice', values: (v) => [shown(Number(v.a) * Number(v.m))] },
    },
    answer: (v) => num(v, 'm'),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const m = Number(ctx.answer);
      return shownList([m + 1, m - 1, m + 2, m * 2]);
    },
    explain: ({ vars, answer }) => `უცნობი მამრავლია ${vars.sp} ÷ ${vars.sa} = ${answer}.`,
  }),
  bank({
    id: 'g5-u04-q32',
    subtopicId: 'u04-09',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'საწყობში {b} ყუთია, თითოეულში {a} ნივთი. რამდენი ნივთია სულ?',
    variables: {
      a: { kind: 'int', min: 24, max: 96 },
      b: { kind: 'int', min: 12, max: 36 },
      sa: shownVar('a'),
      sb: shownVar('b'),
    },
    answer: (v) => Number(v.a) * Number(v.b),
    format: grouped,
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      return shownList([a + b, a * b + a, a * b - a, a * b + b]);
    },
    explain: ({ vars, answer }) => `${vars.sb} × ${vars.sa} = ${answer}.`,
  }),
];
