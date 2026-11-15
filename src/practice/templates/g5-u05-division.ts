import type { QuestionTemplate } from './types';
import { bank, group, num, shownVar } from './g5-helpers';

/**
 * Grade V — Unit 05: გაყოფა (division).
 *
 * Converted from the academy's `U05` bank (8 subtopics × 6 questions):
 * properties of division, round numbers, column division, division with a
 * remainder, estimation of a quotient, money sharing, adjusting a number to
 * divide evenly, and word problems.
 */

export const G5_U05_SUBTOPICS = [
  'u05-01',
  'u05-02',
  'u05-03',
  'u05-04',
  'u05-05',
  'u05-06',
  'u05-07',
  'u05-08',
] as const;

export type G5U05SubtopicId = (typeof G5_U05_SUBTOPICS)[number];

const TOPIC = 'g5-division';

const shown = (n: number): string => group(n);
const shownList = (values: number[]): string[] => values.map(shown);

const grouped = {
  kind: 'integer' as const,
  min: 0,
  format: (value: number | string) => shown(Number(value)),
};

const money = (n: number): string => `${group(n)} ლარი`;

/** „12, ნაშთი 3“ — the pair the bank asks for, written the way a key writes it. */
const quotientWithRest = (dividend: number, divisor: number): string =>
  `${Math.floor(dividend / divisor)}, ნაშთი ${dividend % divisor}`;

/** Rows are `dividend|divisor`. */
const split = (row: unknown): number[] =>
  String(row)
    .split('|')
    .map((part) => Number(part.replace(/[\s\u00a0\u2009]/g, '')));

const dividePairs = [
  '864|4', '2 856|7', '5 184|8', '12 636|6', '24 864|9', '45 675|5',
  '1 236|6', '3 045|9', '7 448|8', '9 632|7', '2 184|4', '5 715|5',
  '6 348|6', '4 284|4', '8 435|5', '3 627|9',
];

const roundDivision = [
  '840|20', '3 600|60', '24 000|300', '56 000|700', '125 000|5 000', '720 000|8 000',
  '4 800|40', '9 000|30', '18 000|600', '63 000|900', '250 000|5 000', '360 000|6 000',
  '2 400|20', '45 000|500', '88 000|800', '150 000|3 000',
];

const remainderPairs = [
  '29|4', '47|6', '83|9', '125|8', '247|5', '536|7',
  '59|7', '94|8', '173|4', '268|9', '347|6', '451|5',
  '76|3', '189|7', '215|8', '302|6',
];

const moneyShare = [
  '120|4|ბავშვი', '350|5|ადამიანი', '960|8|თანამშრომელი', '1 250|10|მოსწავლე',
  '2 400|6|ოჯახი', '3 600|12|ადამიანი', '180|3|ბავშვი', '540|9|მოსწავლე',
  '720|8|ოჯახი', '900|5|თანამშრომელი', '2 800|7|მოსწავლე', '4 500|9|ადამიანი',
  '640|4|ბავშვი', '1 500|6|ოჯახი', '2 160|8|თანამშრომელი', '3 200|5|მოსწავლე',
];

/** `head|target`: the smallest digit that makes `head·10 + d` divide evenly by a divisor. */
const evenDivideRows = [
  '24|5', '31|2', '45|3', '53|6', '61|4', '72|5', '89|2', '94|3',
  '47|6', '58|3', '66|4', '73|5', '81|2', '92|6', '38|4', '69|5',
];

const wordRows = [
  '144|12|წიგნი|თარო', '360|24|ვაშლი|ყუთი', '1 260|9|ლარი|ადამიანი',
  '875|25|მოსწავლე|ჯგუფი', '540|6|კილომეტრი|დღე', '1 008|14|რვეული|კლასი',
  '252|18|ფანქარი|ყუთი', '768|6|კგ|ტომარა', '1 920|16|ლარი|საჩუქარი',
  '1 764|12|ბურთი|გუნდი', '288|9|ყვავილი|თაიგული', '2 340|15|წიგნი|თარო',
  '405|5|კგ|ყუთი', '1 152|8|მოსწავლე|რიგი', '686|7|ნივთი|ყუთი', '1 431|9|ლარი|ადამიანი',
];

export const G5_U05_TEMPLATES: QuestionTemplate[] = [
  // ─────────────── U05.1 — გაყოფის თვისებები ───────────────
  bank({
    id: 'g5-u05-q01',
    subtopicId: 'u05-01',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'გამოთვალე: 0 ÷ {d}',
    variables: { d: { kind: 'int', min: 2, max: 20 }, sd: shownVar('d') },
    answer: () => 0,
    format: grouped,
    distractors: () => ['1', '2', '5', '10'],
    explain: ({ vars, answer }) => `ნულის გაყოფისას ნებისმიერ რიცხვზე განაყოფი ნულია: 0 ÷ ${vars.sd} = ${answer}.`,
  }),
  bank({
    id: 'g5-u05-q02',
    subtopicId: 'u05-01',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'გამოთვალე: {sa} ÷ 1',
    variables: { a: { kind: 'int', min: 1_100, max: 99_900 }, sa: shownVar('a') },
    answer: (v) => num(v, 'a'),
    format: grouped,
    distractors: (ctx) => shownList([1, Number(ctx.answer) * 2, Number(ctx.answer) + 10, Number(ctx.answer) - 10]),
    explain: ({ vars, answer }) => `ერთზე გაყოფისას რიცხვი არ იცვლება: ${vars.sa} ÷ 1 = ${answer}.`,
  }),
  bank({
    id: 'g5-u05-q03',
    subtopicId: 'u05-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'იპოვე უცნობი გასაყოფი: □ ÷ {d} = {q}',
    variables: {
      d: { kind: 'int', min: 2, max: 12 },
      q: { kind: 'int', min: 25, max: 400 },
      sd: shownVar('d'),
      sq: shownVar('q'),
    },
    answer: (v) => Number(v.d) * Number(v.q),
    format: grouped,
    distractors: (ctx) => {
      const d = Number(ctx.vars.d);
      const q = Number(ctx.vars.q);
      return shownList([d + q, q - d, d * q + d, d * q - d]);
    },
    explain: ({ vars, answer }) => `გასაყოფი = გამყოფი × განაყოფი = ${vars.sd} × ${vars.sq} = ${answer}.`,
  }),
  bank({
    id: 'g5-u05-q04',
    subtopicId: 'u05-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე მოხერხებული ხერხით: {sa} ÷ {sb} ÷ {sc}',
    variables: {
      row: {
        kind: 'choice',
        values: ['480|6|8', '720|4|9', '960|8|6', '1 080|9|4', '1 440|6|8', '1 800|5|6',
          '600|4|5', '840|7|3', '2 400|8|6', '1 260|6|7', '900|9|5', '1 680|8|7',
          '2 160|6|9', '1 350|5|9', '3 600|9|8', '1 920|4|8'],
      },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      c: { kind: 'choice', values: (v) => [split(v.row)[2]!] },
      sa: { kind: 'choice', values: (v) => [shown(split(v.row)[0]!)] },
      sb: { kind: 'choice', values: (v) => [shown(split(v.row)[1]!)] },
      sc: { kind: 'choice', values: (v) => [shown(split(v.row)[2]!)] },
    },
    answer: (v) => Number(v.a) / Number(v.b) / Number(v.c),
    format: grouped,
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      const c = Number(ctx.vars.c);
      return shownList([a / b, a / c, Number(ctx.answer) + 1, Number(ctx.answer) * 2]);
    },
    explain: ({ vars, answer }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      const c = Number(vars.c);
      return `${a} ÷ ${b} = ${group(a / b)}, შემდეგ ${group(a / b)} ÷ ${c} = ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u05-q05',
    subtopicId: 'u05-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'შეავსე გამოტოვებული რიცხვი: {sa} ÷ {sb} = {sa} ÷ 3 ÷ ___',
    variables: {
      row: {
        kind: 'choice',
        values: ['936|12', '720|12', '1 440|12', '1 080|12', '1 680|12', '2 520|12',
          '840|12', '1 320|12', '2 040|12', '1 200|12', '3 120|12', '4 800|12'],
      },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      sa: { kind: 'choice', values: (v) => [shown(split(v.row)[0]!)] },
      sb: { kind: 'choice', values: (v) => [shown(split(v.row)[1]!)] },
    },
    answer: (v) => Number(v.b) / 3,
    format: grouped,
    distractors: (ctx) => {
      const b = Number(ctx.vars.b);
      return shownList([b, b / 2, b * 2, b / 3 + 1]);
    },
    explain: ({ vars, answer }) => {
      const b = Number(vars.b);
      return `${b} = 3 × ${b / 3}, ამიტომ ${vars.sa} ÷ ${b} = ${vars.sa} ÷ 3 ÷ ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u05-q06',
    subtopicId: 'u05-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'იპოვე უცნობი გამყოფი: {sa} ÷ □ = {sq}',
    variables: {
      divisor: { kind: 'int', min: 2, max: 12 },
      quotient: { kind: 'int', min: 50, max: 400 },
      sd: shownVar('divisor'),
      sq: shownVar('quotient'),
      sa: { kind: 'choice', values: (v) => [shown(Number(v.divisor) * Number(v.quotient))] },
    },
    answer: (v) => num(v, 'divisor'),
    format: grouped,
    distractors: (ctx) => {
      const d = Number(ctx.answer);
      return shownList([d + 1, d - 1, d * 2, 1]);
    },
    explain: ({ vars, answer }) => `გამყოფი = გასაყოფი ÷ განაყოფი = ${vars.sa} ÷ ${vars.sq} = ${answer}.`,
  }),

  // ─────────────── U05.2 — ნულით დაბოლოებული რიცხვების გაყოფა ───────────────
  bank({
    id: 'g5-u05-q07',
    subtopicId: 'u05-02',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'გამოთვალე: {sa} ÷ {sb}',
    variables: {
      row: { kind: 'choice', values: roundDivision },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      sa: { kind: 'choice', values: (v) => [shown(split(v.row)[0]!)] },
      sb: { kind: 'choice', values: (v) => [shown(split(v.row)[1]!)] },
    },
    answer: (v) => Number(v.a) / Number(v.b),
    format: grouped,
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer * 10, answer / 10, answer + 1, answer - 1]);
    },
    explain: ({ vars, answer }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      return `ნულები შევკვეცოთ: ${a / 10} ÷ ${b / 10} = ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u05-q08',
    subtopicId: 'u05-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე: {sa} ÷ {sb}',
    variables: {
      a: { kind: 'choice', values: [12_000, 24_000, 36_000, 45_000, 56_000, 64_000, 72_000, 81_000] },
      b: { kind: 'choice', values: [200, 300, 400, 500, 600, 700, 800, 900] },
      sa: shownVar('a'),
      sb: shownVar('b'),
    },
    answer: (v) => Number(v.a) / Number(v.b),
    format: grouped,
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer * 10, answer + 10, answer - 10, answer * 100]);
    },
    explain: ({ vars, answer }) => `ნულების შეკვეცის შემდეგ: ${Number(vars.a) / 100} ÷ ${Number(vars.b) / 100} = ${answer}.`,
  }),
  bank({
    id: 'g5-u05-q09',
    subtopicId: 'u05-02',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'გამოთვალე: {sa} ÷ {sb}',
    variables: {
      a: { kind: 'choice', values: [125_000, 250_000, 360_000, 480_000, 540_000, 630_000, 720_000, 810_000] },
      b: { kind: 'choice', values: [5_000, 6_000, 8_000, 9_000, 3_000, 7_000, 4_000, 2_000] },
      sa: shownVar('a'),
      sb: shownVar('b'),
    },
    answer: (v) => Number(v.a) / Number(v.b),
    format: grouped,
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer * 10, answer + 5, answer - 5, answer * 100]);
    },
    explain: ({ vars, answer }) => `ნულების შეკვეცის შემდეგ: ${Number(vars.a) / 1000} ÷ ${Number(vars.b) / 1000} = ${answer}.`,
  }),

  // ─────────────── U05.3 — გაყოფა სვეტად ───────────────
  bank({
    id: 'g5-u05-q10',
    subtopicId: 'u05-03',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'გამოთვალე სვეტად: {sa} ÷ {sb}',
    variables: {
      row: { kind: 'choice', values: dividePairs },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      sa: { kind: 'choice', values: (v) => [shown(split(v.row)[0]!)] },
      sb: { kind: 'choice', values: (v) => [shown(split(v.row)[1]!)] },
    },
    answer: (v) => Number(v.a) / Number(v.b),
    format: grouped,
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 10, answer - 10, answer * 10, answer + 1]);
    },
    explain: ({ vars, answer }) => {
      const b = Number(vars.b);
      return `${b} × ${answer} = ${group(b * Number(answer))}, ამიტომ ${vars.sa} ÷ ${vars.sb} = ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u05-q11',
    subtopicId: 'u05-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე სვეტად: {sa} ÷ {sb}',
    variables: {
      a: { kind: 'int', min: 1_200, max: 9_800 },
      b: { kind: 'int', min: 2, max: 9 },
      sa: shownVar('a'),
      sb: shownVar('b'),
    },
    answer: (v) => {
      const a = Number(v.a);
      const b = Number(v.b);
      return a % b === 0 ? a / b : Math.floor(a / b);
    },
    format: grouped,
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 10, answer - 10, answer + 100, answer - 1]);
    },
    explain: ({ vars, answer }) => `${vars.sb} × ${answer} ≈ ${vars.sa}; განაყოფია ${answer}.`,
  }),
  bank({
    id: 'g5-u05-q12',
    subtopicId: 'u05-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გამოთვალე სვეტად: {sa} ÷ {sb}',
    variables: {
      a: { kind: 'int', min: 12_000, max: 89_000 },
      b: { kind: 'int', min: 3, max: 9 },
      sa: shownVar('a'),
      sb: shownVar('b'),
    },
    answer: (v) => {
      const a = Number(v.a);
      const b = Number(v.b);
      return a % b === 0 ? a / b : Math.floor(a / b);
    },
    format: grouped,
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 100, answer - 100, answer + 10, answer * 10]);
    },
    explain: ({ vars, answer }) => `სვეტად გაყოფისას თანრიგები რიგ-რიგობით იყოფა: ${vars.sa} ÷ ${vars.sb} = ${answer}.`,
  }),

  // ─────────────── U05.4 — გაყოფა ნაშთით ───────────────
  bank({
    id: 'g5-u05-q13',
    subtopicId: 'u05-04',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'გაყავი {sa} რიცხვი {sb}-ზე. მიუთითე განაყოფი და ნაშთი.',
    variables: {
      row: { kind: 'choice', values: remainderPairs },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      sa: { kind: 'choice', values: (v) => [shown(split(v.row)[0]!)] },
      sb: { kind: 'choice', values: (v) => [shown(split(v.row)[1]!)] },
    },
    answer: (v) => quotientWithRest(Number(v.a), Number(v.b)),
    format: { kind: 'text' },
    options: (v) => {
      const a = Number(v.a);
      const b = Number(v.b);
      const right = quotientWithRest(a, b);
      const wrongs = [
        quotientWithRest(a + 1, b),
        quotientWithRest(a - 1, b),
        `${Math.floor(a / b) + 1}, ნაშთი ${a % b}`,
      ];
      return [...new Set([right, ...wrongs])];
    },
    explain: ({ vars, answer }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      return `${a} ÷ ${b} = ${Math.floor(a / b)} და ნაშთი ${a % b}. პასუხი: ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u05-q14',
    subtopicId: 'u05-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'რა ნაშთი მიიღება {sa}-ის {sb}-ზე გაყოფისას?',
    variables: {
      row: { kind: 'choice', values: remainderPairs },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      sa: { kind: 'choice', values: (v) => [shown(split(v.row)[0]!)] },
      sb: { kind: 'choice', values: (v) => [shown(split(v.row)[1]!)] },
    },
    answer: (v) => Number(v.a) % Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      const rest = a % b;
      return shownList([rest + 1, rest === 0 ? 1 : rest - 1, b - rest, Math.floor(a / b)]);
    },
    explain: ({ vars, answer }) =>
      `${vars.sa} = ${vars.sb} × ${Math.floor(Number(vars.a) / Number(vars.b))} + ${answer}, ამიტომ ნაშთია ${answer}.`,
  }),
  bank({
    id: 'g5-u05-q15',
    subtopicId: 'u05-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'რა ნაშთი მიიღება {sa}-ის {sb}-ზე გაყოფისას? (ნაშთი ყველაზე დიდი შესაძლო რომ იყოს)',
    variables: {
      a: { kind: 'int', min: 100, max: 900 },
      b: { kind: 'int', min: 6, max: 40 },
      sa: shownVar('a'),
      sb: shownVar('b'),
    },
    answer: (v) => Number(v.a) % Number(v.b),
    format: { kind: 'integer', min: 0 },
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      const rest = a % b;
      return shownList([rest + 1, rest === 0 ? b - 1 : rest - 1, b - rest, b]);
    },
    explain: ({ vars, answer }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      return `${a} = ${b} × ${Math.floor(a / b)} + ${answer}. ნაშთი ყოველთვის ნაკლებია გამყოფზე.`;
    },
  }),

  // ─────────────── U05.5 — განაყოფის შეფასება ───────────────
  bank({
    id: 'g5-u05-q16',
    subtopicId: 'u05-05',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'დაამრგვალე გასაყოფი ასეულებამდე და შეაფასე: {sa} ÷ {sb}',
    variables: {
      a: { kind: 'int', min: 510, max: 980 },
      b: { kind: 'int', min: 3, max: 9 },
      sa: shownVar('a'),
      sb: shownVar('b'),
    },
    answer: (v) => Math.round(Number(v.a) / 100) * 100 / Number(v.b),
    format: grouped,
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 10, answer - 10, Number(ctx.vars.a) / Number(ctx.vars.b), answer * 10]);
    },
    explain: ({ vars, answer }) => {
      const rounded = Math.round(Number(vars.a) / 100) * 100;
      return `${vars.sa} ≈ ${group(rounded)}, ამიტომ ${group(rounded)} ÷ ${vars.sb} ≈ ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u05-q17',
    subtopicId: 'u05-05',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'დაამრგვალე გასაყოფი ათასეულებამდე და შეაფასე: {sa} ÷ {sb}',
    variables: {
      a: { kind: 'int', min: 4_100, max: 9_800 },
      b: { kind: 'int', min: 4, max: 9 },
      sa: shownVar('a'),
      sb: shownVar('b'),
    },
    answer: (v) => Math.round(Number(v.a) / 1000) * 1000 / Number(v.b),
    format: grouped,
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 10, answer - 10, Number(ctx.vars.a) / Number(ctx.vars.b), answer * 10]);
    },
    explain: ({ vars, answer }) => {
      const rounded = Math.round(Number(vars.a) / 1000) * 1000;
      return `${vars.sa} ≈ ${group(rounded)}, ამიტომ ${group(rounded)} ÷ ${vars.sb} ≈ ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u05-q18',
    subtopicId: 'u05-05',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'შეასრულე განაყოფის მოხერხებული გამოთვლა: {sa} ÷ {sb}',
    variables: {
      a: { kind: 'choice', values: [1_196, 1_848, 2_736, 3_984, 5_148, 7_236, 8_424, 9_612] },
      b: { kind: 'choice', values: [4, 8, 12, 9, 6, 7, 3, 5] },
      sa: shownVar('a'),
      sb: shownVar('b'),
    },
    answer: (v) => {
      const a = Number(v.a);
      const b = Number(v.b);
      return a % b === 0 ? a / b : Math.floor(a / b);
    },
    format: grouped,
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 10, answer - 10, answer * 10, answer + 1]);
    },
    explain: ({ vars, answer }) =>
      `${vars.sa} = ${vars.sb} × ${answer}, ამიტომ განაყოფია ${answer}.`,
  }),

  // ─────────────── U05.6 — ფულადი თანხების გაყოფა ───────────────
  bank({
    id: 'g5-u05-q19',
    subtopicId: 'u05-06',
    topicId: TOPIC,
    difficulty: 1,
    prompt: '{sa} ლარი თანაბრად გაანაწილეს {n} {who}-ზე. რამდენი ლარი შეხვდა თითოეულს?',
    variables: {
      row: { kind: 'choice', values: moneyShare },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      n: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      who: { kind: 'choice', values: (v) => [String(v.row).split('|')[2]!] },
      sa: { kind: 'choice', values: (v) => [shown(split(v.row)[0]!)] },
      sn: { kind: 'choice', values: (v) => [shown(split(v.row)[1]!)] },
    },
    answer: (v) => Number(v.a) / Number(v.n),
    format: { kind: 'integer', min: 0, format: (value: number | string) => money(Number(value)) },
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const n = Number(ctx.vars.n);
      const answer = Number(ctx.answer);
      return [a - n, answer + 10, answer - 10, answer * 2].map((value) => money(Math.abs(value)));
    },
    explain: ({ vars, answer }) => `${vars.sa} ÷ ${vars.sn} = ${answer} თითოეულ ${vars.who}-ზე.`,
  }),
  bank({
    id: 'g5-u05-q20',
    subtopicId: 'u05-06',
    topicId: TOPIC,
    difficulty: 2,
    prompt: '{sa} ლარი თანაბრად გაანაწილეს {sn} ადამიანზე. რამდენი ლარი შეხვდა თითოეულს?',
    variables: {
      a: { kind: 'choice', values: [1_440, 1_920, 2_160, 2_520, 3_360, 4_320, 5_040, 6_120] },
      n: { kind: 'choice', values: [12, 16, 24, 8, 6, 18, 9, 10] },
      sa: shownVar('a'),
      sn: shownVar('n'),
    },
    answer: (v) => {
      const a = Number(v.a);
      const n = Number(v.n);
      return a % n === 0 ? a / n : Math.floor(a / n);
    },
    format: { kind: 'integer', min: 0, format: (value: number | string) => money(Number(value)) },
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const n = Number(ctx.vars.n);
      const answer = Number(ctx.answer);
      return [answer + 10, answer - 10, a - n, answer * 2].map((value) => money(Math.abs(value)));
    },
    explain: ({ vars, answer }) => `${vars.sa} ÷ ${vars.sn} = ${answer}.`,
  }),
  bank({
    id: 'g5-u05-q21',
    subtopicId: 'u05-06',
    topicId: TOPIC,
    difficulty: 3,
    prompt: '{sa} ლარი თანაბრად გადაანაწილეს {sn} ოჯახზე. თითოეულმა მიიღო {sq} ლარი. რამდენი ლარი იყო სულ?',
    variables: {
      n: { kind: 'int', min: 3, max: 12 },
      q: { kind: 'int', min: 120, max: 900 },
      sn: shownVar('n'),
      sq: shownVar('q'),
      sa: { kind: 'choice', values: (v) => [shown(Number(v.n) * Number(v.q))] },
    },
    answer: (v) => Number(v.n) * Number(v.q),
    format: { kind: 'integer', min: 0, format: (value: number | string) => money(Number(value)) },
    distractors: (ctx) => {
      const n = Number(ctx.vars.n);
      const q = Number(ctx.vars.q);
      return [n + q, n * q + n, n * q - q, n * q * 2].map((value) => money(Math.abs(value)));
    },
    explain: ({ vars, answer }) => `${vars.sn} × ${vars.sq} = ${answer}.`,
  }),

  // ─────────────── U05.7 — უნაშთო გაყოფისთვის შეცვლა ───────────────
  bank({
    id: 'g5-u05-q22',
    subtopicId: 'u05-07',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ჩასვი ციფრი □-ის ნაცვლად, რომ {sh}□ იყოფოდეს {sd}-ზე უნაშთოდ. იპოვე ყველაზე პატარა ასეთი ციფრი.',
    variables: {
      row: { kind: 'choice', values: evenDivideRows },
      h: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      sh: { kind: 'choice', values: (v) => [shown(split(v.row)[0]!)] },
      sd: { kind: 'choice', values: (v) => [shown(split(v.row)[1]!)] },
    },
    answer: (v) => {
      const head = Number(v.h);
      const d = Number(v.d);
      for (let digit = 0; digit <= 9; digit += 1) if ((head * 10 + digit) % d === 0) return digit;
      return 0;
    },
    format: { kind: 'integer', min: 0, max: 9 },
    distractors: () => ['1', '2', '3', '5', '7', '9'],
    explain: ({ vars, answer }) => {
      const h = Number(vars.h);
      const d = Number(vars.d);
      return `${h}${answer} ÷ ${d} = ${(h * 10 + Number(answer)) / d}, ამიტომ ციფრია ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u05-q23',
    subtopicId: 'u05-07',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'რამდენი ერთეულით უნდა გავზარდოთ {sa}, რომ უნაშთოდ გაიყოს {sb}-ზე?',
    variables: {
      a: { kind: 'int', min: 101, max: 900 },
      b: { kind: 'int', min: 4, max: 9 },
      sa: shownVar('a'),
      sb: shownVar('b'),
    },
    answer: (v) => {
      const a = Number(v.a);
      const b = Number(v.b);
      const rest = a % b;
      return rest === 0 ? b : b - rest;
    },
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      const rest = a % b;
      const right = rest === 0 ? b : b - rest;
      return shownList([right + 1, right - 1 > 0 ? right - 1 : right + 2, rest, b]);
    },
    explain: ({ vars, answer }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      return `ნაშთია ${a % b}, ამიტომ საჭიროა კიდევ ${answer} ერთეული: ${a} + ${answer} = ${group(a + Number(answer))}.`;
    },
  }),
  bank({
    id: 'g5-u05-q24',
    subtopicId: 'u05-07',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'იპოვე უმცირესი ნატურალური რიცხვი, რომელიც {sb}-ზე გაყოფისას იძლევა ნაშთს {sr}-ს, და რომელიც {sa}-ზე მეტია.',
    variables: {
      a: { kind: 'int', min: 20, max: 90 },
      b: { kind: 'int', min: 4, max: 9 },
      r: { kind: 'int', min: 1, max: 3 },
      sa: shownVar('a'),
      sb: shownVar('b'),
      sr: shownVar('r'),
    },
    answer: (v) => {
      const a = Number(v.a);
      const b = Number(v.b);
      const r = Number(v.r);
      const candidate = Math.floor(a / b) * b + r;
      return candidate > a ? candidate : candidate + b;
    },
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      const r = Number(ctx.vars.r);
      return shownList([b * Math.floor(a / b) + r, Number(ctx.answer) + b, Number(ctx.answer) - 1, r]);
    },
    explain: ({ vars, answer }) =>
      `${answer} = ${vars.sb} × ${Math.floor(Number(answer) / Number(vars.b))} + ${vars.sr}, და ${answer} > ${vars.sa}.`,
  }),

  // ─────────────── U05.8 — გაყოფასთან დაკავშირებული ამოცანები ───────────────
  bank({
    id: 'g5-u05-q25',
    subtopicId: 'u05-08',
    topicId: TOPIC,
    difficulty: 1,
    prompt: '{sa} {thing} თანაბრად გადაანაწილეს {sn} {where}-ზე. რამდენი {thing} მოხვდა თითოეულ {where}-ს?',
    variables: {
      row: { kind: 'choice', values: wordRows },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      n: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      thing: { kind: 'choice', values: (v) => [String(v.row).split('|')[2]!] },
      where: { kind: 'choice', values: (v) => [String(v.row).split('|')[3]!] },
      sa: { kind: 'choice', values: (v) => [shown(split(v.row)[0]!)] },
      sn: { kind: 'choice', values: (v) => [shown(split(v.row)[1]!)] },
    },
    answer: (v) => Number(v.a) / Number(v.n),
    format: { kind: 'integer', min: 0 },
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const n = Number(ctx.vars.n);
      const answer = Number(ctx.answer);
      return shownList([answer + 1, a - n, answer + 10, answer - 10]);
    },
    explain: ({ vars, answer }) => `${vars.sa} ÷ ${vars.sn} = ${answer} — ასე მოხვდა თითოეულ ${vars.where}-ს.`,
  }),
  bank({
    id: 'g5-u05-q26',
    subtopicId: 'u05-08',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'სამგზავრო მანძილია {sa} კილომეტრი. {sn} დღეში თანაბრად თუ გაინაწილებენ, დღეში რამდენ კილომეტრს გაივლიან?',
    variables: {
      a: { kind: 'choice', values: [540, 720, 960, 1_080, 1_260, 1_440, 2_160, 3_600] },
      n: { kind: 'choice', values: [6, 8, 9, 4, 7, 12, 10, 5] },
      sa: shownVar('a'),
      sn: shownVar('n'),
    },
    answer: (v) => Number(v.a) / Number(v.n),
    format: { kind: 'integer', min: 0 },
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const n = Number(ctx.vars.n);
      const answer = Number(ctx.answer);
      return shownList([answer + 10, answer - 10, a - n, answer * 2]);
    },
    explain: ({ vars, answer }) => `${vars.sa} ÷ ${vars.sn} = ${answer} კილომეტრი დღეში.`,
  }),
  bank({
    id: 'g5-u05-q27',
    subtopicId: 'u05-08',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'მაღაზიამ {sa} ლარის საქონელი გაყიდა {sn} დღეში. საშუალოდ რამდენ ლარს ყიდდნენ დღეში?',
    variables: {
      a: { kind: 'int', min: 1_200, max: 9_000 },
      n: { kind: 'int', min: 4, max: 12 },
      sa: shownVar('a'),
      sn: shownVar('n'),
    },
    answer: (v) => {
      const a = Number(v.a);
      const n = Number(v.n);
      return a % n === 0 ? a / n : Math.floor(a / n);
    },
    format: { kind: 'integer', min: 0, format: (value: number | string) => money(Number(value)) },
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const n = Number(ctx.vars.n);
      const answer = Number(ctx.answer);
      return [answer + 10, answer - 10, a - n, answer * 2].map((value) => money(Math.abs(value)));
    },
    explain: ({ vars, answer }) => `საშუალოდ: ${vars.sa} ÷ ${vars.sn} = ${answer}.`,
  }),
];
