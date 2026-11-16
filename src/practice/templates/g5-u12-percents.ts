import type { QuestionTemplate } from './types';
import { bank, fourOptions, group, rowNumbers } from './g5-helpers';

/**
 * Grade V — Unit 12: პროცენტები (percentages).
 *
 * Converted from the academy's `U12` bank (7 subtopics × 6 questions). Percent
 * is the part per hundred: every template here computes a percentage of a
 * number, the percentage one number is of another, a discounted price, or the
 * conversion between fractions, decimals and percents.
 */

export const G5_U12_SUBTOPICS = [
  'u12-01',
  'u12-02',
  'u12-03',
  'u12-04',
  'u12-05',
  'u12-06',
  'u12-07',
] as const;

export type G5U12SubtopicId = (typeof G5_U12_SUBTOPICS)[number];

const TOPIC = 'g5-percents';

const at = (row: unknown, index: number): number => rowNumbers(row)[index]!;
const pct = (n: number): string => `${group(n)}%`;

const pool = (build: (add: (row: string) => void) => void): string[] => {
  const rows: string[] = [];
  build((row) => {
    if (!rows.includes(row)) rows.push(row);
  });
  return rows;
};

/** `whole|percent` rows where the percentage is a whole number. */
const percentOf = pool((add) => {
  for (const whole of [20, 40, 50, 60, 80, 100, 120, 150, 200, 240, 300, 400, 500, 600, 750, 800]) {
    for (const p of [5, 10, 15, 20, 25, 30, 40, 50, 60, 75]) {
      if ((whole * p) % 100 === 0) add(`${whole}|${p}`);
    }
  }
});

/** `part|whole|percent` rows where the percentage is a whole number. */
const percentWhich = pool((add) => {
  for (const whole of [20, 25, 40, 50, 60, 80, 100, 120, 150, 200, 250, 400])
    for (const p of [5, 10, 20, 25, 30, 40, 50, 60, 75, 80]) {
      const part = (whole * p) / 100;
      if (Number.isInteger(part)) add(`${part}|${whole}|${p}`);
    }
});

/** `price|percent` rows for a discount. */
const discounts = pool((add) => {
  for (const price of [40, 60, 80, 100, 120, 150, 160, 200, 240, 250, 300, 400, 500, 600, 800, 900]) {
    for (const p of [5, 10, 15, 20, 25, 30, 40, 50]) if ((price * p) % 100 === 0) add(`${price}|${p}`);
  }
});

export const G5_U12_TEMPLATES: QuestionTemplate[] = [
  // ───────────── U12.1 — რიცხვის პროცენტი ─────────────
  bank({
    id: 'g5-u12-q01',
    subtopicId: 'u12-01',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'იპოვე {whole}-ის {p}%.',
    variables: {
      spec: { kind: 'choice', values: percentOf },
      whole: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      p: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      sw: { kind: 'choice', values: (v) => [group(at(v.spec, 0))] },
      sp: { kind: 'choice', values: (v) => [String(at(v.spec, 1))] },
    },
    answer: (v) => (Number(v.whole) * Number(v.p)) / 100,
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer + 1, answer - 1 > 0 ? answer - 1 : answer + 2, answer * 2, answer + 5].map(String);
    },
    explain: ({ vars, answer }) =>
      `${vars.sp}% = ${vars.sp}/100, ამიტომ ${vars.sw} ÷ 100 × ${vars.sp} = ${answer}.`,
  }),
  bank({
    id: 'g5-u12-q02',
    subtopicId: 'u12-01',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'იპოვე {whole}-ის {p}%.',
    variables: {
      spec: { kind: 'choice', values: percentOf },
      whole: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      p: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      sw: { kind: 'choice', values: (v) => [group(at(v.spec, 0))] },
      sp: { kind: 'choice', values: (v) => [String(at(v.spec, 1))] },
    },
    answer: (v) => (Number(v.whole) * Number(v.p)) / 100,
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer + 2, answer + 10, answer / 2 > 0 && Number.isInteger(answer / 2) ? answer / 2 : answer + 3, answer + 1].map(String);
    },
    explain: ({ vars, answer }) => `${vars.sw}-ის ${vars.sp}% = ${answer}.`,
  }),
  bank({
    id: 'g5-u12-q03',
    subtopicId: 'u12-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'იპოვე {whole}-ის {p}%.',
    variables: {
      spec: { kind: 'choice', values: percentOf },
      whole: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      p: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      sw: { kind: 'choice', values: (v) => [group(at(v.spec, 0))] },
      sp: { kind: 'choice', values: (v) => [String(at(v.spec, 1))] },
    },
    answer: (v) => (Number(v.whole) * Number(v.p)) / 100,
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer + 1, answer * 2, answer + 4, answer - 1 > 0 ? answer - 1 : answer + 6].map(String);
    },
    explain: ({ vars, answer }) =>
      `${vars.sp}% — ეს ${vars.sp} ნაწილია 100-დან: ${vars.sw} ÷ 100 = ${Number(vars.whole) / 100}, × ${vars.sp} = ${answer}.`,
  }),

  // ───────────── U12.2 — პროცენტის გამოთვლა ─────────────
  bank({
    id: 'g5-u12-q04',
    subtopicId: 'u12-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: '{whole}-ის რამდენი პროცენტია {part}?',
    variables: {
      spec: { kind: 'choice', values: percentWhich },
      part: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      whole: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      p: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      sw: { kind: 'choice', values: (v) => [group(at(v.spec, 1))] },
      spart: { kind: 'choice', values: (v) => [group(at(v.spec, 0))] },
    },
    answer: (v) => pct(Number(v.p)),
    format: { kind: 'text' },
    options: (v) => fourOptions(pct(Number(v.p)), [pct(Number(v.p) + 5), pct(Number(v.p) + 10), pct(Number(v.p) * 2)]),
    explain: ({ vars, answer }) =>
      `ნაწილი მთელზე ვყოფთ და 100-ზე ვამრავლებთ: ${vars.spart} ÷ ${vars.sw} × 100 = ${answer}.`,
  }),
  bank({
    id: 'g5-u12-q05',
    subtopicId: 'u12-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: '{whole}-ის რამდენი პროცენტია {part}?',
    variables: {
      spec: { kind: 'choice', values: percentWhich },
      part: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      whole: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      p: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      sw: { kind: 'choice', values: (v) => [group(at(v.spec, 1))] },
      spart: { kind: 'choice', values: (v) => [group(at(v.spec, 0))] },
    },
    answer: (v) => pct(Number(v.p)),
    format: { kind: 'text' },
    options: (v) => fourOptions(pct(Number(v.p)), [pct(Number(v.p) + 15), pct(Number(v.p) - 5 > 0 ? Number(v.p) - 5 : 1), pct(Number(v.p) + 20)]),
    explain: ({ vars, answer }) =>
      `${vars.spart}/${vars.sw} = ${Number(vars.part) / Number(vars.whole)}, ანუ ${answer}.`,
  }),
  bank({
    id: 'g5-u12-q06',
    subtopicId: 'u12-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'კლასში {whole} მოსწავლეა, მათგან {part} გოგონაა. მოსწავლეების რამდენი პროცენტია გოგონა?',
    variables: {
      spec: { kind: 'choice', values: percentWhich },
      part: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      whole: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      p: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      sw: { kind: 'choice', values: (v) => [group(at(v.spec, 1))] },
      spart: { kind: 'choice', values: (v) => [group(at(v.spec, 0))] },
    },
    answer: (v) => pct(Number(v.p)),
    format: { kind: 'text' },
    options: (v) => fourOptions(pct(Number(v.p)), [pct(Number(v.p) + 10), pct(Number(v.p) + 5), pct(Number(v.p) + 20)]),
    explain: ({ vars, answer }) =>
      `${vars.spart} ÷ ${vars.sw} × 100 = ${answer}.`,
  }),

  // ───────────── U12.3 — ფასდაკლება ─────────────
  bank({
    id: 'g5-u12-q07',
    subtopicId: 'u12-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'წიგნის ფასი {price} ლარია. მასზე {p}%-იანი ფასდაკლებაა. რამდენი ლარი იქნება ფასდაკლების შემდეგ?',
    variables: {
      spec: { kind: 'choice', values: discounts },
      price: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      p: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      sprice: { kind: 'choice', values: (v) => [group(at(v.spec, 0))] },
      sp: { kind: 'choice', values: (v) => [String(at(v.spec, 1))] },
    },
    answer: (v) => Number(v.price) - (Number(v.price) * Number(v.p)) / 100,
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const price = Number(ctx.vars.price);
      const answer = Number(ctx.answer);
      return [price - answer, answer + 10, price, answer + 20].map(String);
    },
    explain: ({ vars, answer }) => {
      const off = (Number(vars.price) * Number(vars.p)) / 100;
      return `ფასდაკლება: ${vars.sprice} × ${vars.sp} ÷ 100 = ${off} ლარი. ახალი ფასი: ${vars.sprice} − ${off} = ${answer} ლარი.`;
    },
  }),
  bank({
    id: 'g5-u12-q08',
    subtopicId: 'u12-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ჩანთა ღირს {price} ლარი. მასზე {p}%-იანი ფასდაკლებაა. რა იქნება ჩანთის ფასი ფასდაკლების შემდეგ?',
    variables: {
      spec: { kind: 'choice', values: discounts },
      price: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      p: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      sprice: { kind: 'choice', values: (v) => [group(at(v.spec, 0))] },
      sp: { kind: 'choice', values: (v) => [String(at(v.spec, 1))] },
    },
    answer: (v) => Number(v.price) - (Number(v.price) * Number(v.p)) / 100,
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const price = Number(ctx.vars.price);
      const answer = Number(ctx.answer);
      return [answer + 5, price - answer + 5, answer + 20, price].map(String);
    },
    explain: ({ vars, answer }) =>
      `${vars.sprice}-ის ${vars.sp}% = ${(Number(vars.price) * Number(vars.p)) / 100}; ${vars.sprice} − ${(Number(vars.price) * Number(vars.p)) / 100} = ${answer} ლარი.`,
  }),
  bank({
    id: 'g5-u12-q09',
    subtopicId: 'u12-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ფეხსაცმელი ღირს {price} ლარი. მასზე {p}%-იანი ფასდაკლებაა. რამდენი ლარი უნდა გადაიხადო ფასდაკლების შემდეგ?',
    variables: {
      spec: { kind: 'choice', values: discounts },
      price: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      p: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      sprice: { kind: 'choice', values: (v) => [group(at(v.spec, 0))] },
      sp: { kind: 'choice', values: (v) => [String(at(v.spec, 1))] },
    },
    answer: (v) => Number(v.price) - (Number(v.price) * Number(v.p)) / 100,
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer + 10, answer - 10 > 0 ? answer - 10 : answer + 30, answer + 25, answer + 2].map(String);
    },
    explain: ({ vars, answer }) =>
      `ფასდაკლების შემდეგ ფასი = ${vars.sprice} × (100 − ${vars.sp}) ÷ 100 = ${answer} ლარი.`,
  }),

  // ───────────── U12.4 — წილადები და პროცენტები ─────────────
  bank({
    id: 'g5-u12-q10',
    subtopicId: 'u12-04',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'ჩაწერე პროცენტის სახით: {a}/{b}',
    variables: {
      spec: { kind: 'choice', values: ['1|2', '1|4', '3|4', '1|5', '2|5', '3|5', '1|10', '3|10', '7|10', '1|20', '1|25', '2|25', '9|10', '4|5', '1|50', '3|20'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => pct((Number(v.a) * 100) / Number(v.b)),
    format: { kind: 'text' },
    options: (v) => {
      const right = pct((Number(v.a) * 100) / Number(v.b));
      return fourOptions(right, [
        pct((Number(v.a) * 100) / Number(v.b) + 10),
        pct((Number(v.a) * 100) / Number(v.b) / 2),
        pct((Number(v.a) * 100) / Number(v.b) + 25),
      ]);
    },
    explain: ({ vars, answer }) =>
      `წილადს 100-ზე ვამრავლებთ: ${vars.a}/${vars.b} × 100 = ${answer}.`,
  }),
  bank({
    id: 'g5-u12-q11',
    subtopicId: 'u12-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ჩაწერე წილადის სახით: {p}%',
    variables: {
      spec: { kind: 'choice', values: ['20|1|5', '25|1|4', '50|1|2', '40|2|5', '60|3|5', '75|3|4', '10|1|10', '30|3|10', '80|4|5', '5|1|20', '90|9|10', '15|3|20'] },
      p: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      n: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      d: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
    },
    answer: (v) => `${v.n}/${v.d}`,
    format: { kind: 'text' },
    options: (v) => fourOptions(`${v.n}/${v.d}`, [`${v.n}/${Number(v.d) * 10}`, `${v.p}/100`, `${v.d}/${v.n}`]),
    explain: ({ vars, answer }) =>
      `${vars.p}% = ${vars.p}/100, რაც შეკვეცის შემდეგ არის ${answer}.`,
  }),
  bank({
    id: 'g5-u12-q12',
    subtopicId: 'u12-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ჩაწერე პროცენტის სახით: {a}/{b}',
    variables: {
      spec: { kind: 'choice', values: ['1|8', '3|8', '5|8', '7|8', '1|16', '3|16', '5|16', '7|16', '9|20', '11|20', '13|25', '7|25'] },
      a: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      b: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => pct((Number(v.a) * 100) / Number(v.b)),
    format: { kind: 'text' },
    options: (v) => {
      const right = pct((Number(v.a) * 100) / Number(v.b));
      return fourOptions(right, [
        pct((Number(v.a) * 100) / Number(v.b) + 2),
        pct(Number(v.b) * 10),
        pct((Number(v.a) * 100) / (Number(v.b) + 1)),
      ]);
    },
    explain: ({ vars, answer }) => `${vars.a}/${vars.b} × 100 = ${answer}.`,
  }),

  // ───────────── U12.5 — ათწილადები და პროცენტები ─────────────
  bank({
    id: 'g5-u12-q13',
    subtopicId: 'u12-05',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'ჩაწერე პროცენტის სახით: {d}',
    variables: {
      spec: { kind: 'choice', values: ['0,25|25', '0,7|70', '0,08|8', '0,45|45', '1,25|125', '0,06|6', '0,5|50', '0,35|35', '0,9|90', '1,5|150', '0,02|2', '0,85|85'] },
      d: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      p: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => pct(Number(v.p)),
    format: { kind: 'text' },
    options: (v) => fourOptions(pct(Number(v.p)), [pct(Number(v.p) + 5), pct(Number(v.p) / 10), pct(Number(v.p) * 10)]),
    explain: ({ vars, answer }) => `${vars.d} × 100 = ${answer}.`,
  }),
  bank({
    id: 'g5-u12-q14',
    subtopicId: 'u12-05',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ჩაწერე ათწილადის სახით: {p}%',
    variables: {
      spec: { kind: 'choice', values: ['45|0,45', '6|0,06', '125|1,25', '20|0,2', '8|0,08', '75|0,75', '90|0,9', '250|2,5', '3|0,03', '15|0,15', '12|0,12', '36|0,36', '55|0,55', '4|0,04', '68|0,68', '99|0,99'] },
      p: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      d: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]!] },
    },
    answer: (v) => String(v.d),
    format: { kind: 'text' },
    options: (v) => fourOptions(String(v.d), [
      String(Number(String(v.d).replace(',', '.')) * 10).replace('.', ','),
      String(Number(String(v.d).replace(',', '.')) / 10).replace('.', ','),
      `0,${v.p}`,
    ]),
    explain: ({ vars, answer }) => `${vars.p}% = ${vars.p}/100 = ${answer}.`,
  }),
  bank({
    id: 'g5-u12-q15',
    subtopicId: 'u12-05',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ჩაწერე პროცენტის სახით: {d}',
    variables: {
      spec: { kind: 'choice', values: ['0,15|15', '0,3|30', '0,55|55', '0,04|4', '0,95|95', '1,2|120', '0,65|65', '0,12|12', '0,4|40', '0,99|99', '0,25|25', '0,7|70', '0,05|5', '0,85|85', '0,6|60', '0,02|2'] },
      d: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]!] },
      p: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
    },
    answer: (v) => pct(Number(v.p)),
    format: { kind: 'text' },
    options: (v) => fourOptions(pct(Number(v.p)), [pct(Number(v.p) + 10), pct(Number(v.p) + 3), pct(Number(v.p) * 10)]),
    explain: ({ vars, answer }) => `${vars.d} × 100 = ${answer}.`,
  }),

  // ───────────── U12.6 — პროცენტის პოვნა ─────────────
  bank({
    id: 'g5-u12-q16',
    subtopicId: 'u12-06',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'სუპერმარკეტში {whole} ნივთიდან {part} გაიყიდა. ნივთების რამდენი პროცენტი გაიყიდა?',
    variables: {
      spec: { kind: 'choice', values: percentWhich },
      part: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      whole: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      p: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      sw: { kind: 'choice', values: (v) => [group(at(v.spec, 1))] },
      spart: { kind: 'choice', values: (v) => [group(at(v.spec, 0))] },
    },
    answer: (v) => pct(Number(v.p)),
    format: { kind: 'text' },
    options: (v) => fourOptions(pct(Number(v.p)), [pct(Number(v.p) + 5), pct(Number(v.p) + 10), pct(Number(v.p) + 25)]),
    explain: ({ vars, answer }) => `${vars.spart} ÷ ${vars.sw} × 100 = ${answer}.`,
  }),
  bank({
    id: 'g5-u12-q17',
    subtopicId: 'u12-06',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'წიგნში {whole} გვერდია. ნინომ {part} გვერდი წაიკითხა. წიგნის რამდენი პროცენტი აქვს წაკითხული?',
    variables: {
      spec: { kind: 'choice', values: percentWhich },
      part: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      whole: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      p: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      sw: { kind: 'choice', values: (v) => [group(at(v.spec, 1))] },
      spart: { kind: 'choice', values: (v) => [group(at(v.spec, 0))] },
    },
    answer: (v) => pct(Number(v.p)),
    format: { kind: 'text' },
    options: (v) => fourOptions(pct(Number(v.p)), [pct(Number(v.p) + 10), pct(Number(v.p) - 5 > 0 ? Number(v.p) - 5 : 1), pct(Number(v.p) + 20)]),
    explain: ({ vars, answer }) => `${vars.spart}/${vars.sw} × 100 = ${answer}.`,
  }),
  bank({
    id: 'g5-u12-q18',
    subtopicId: 'u12-06',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'სპორტულ შეჯიბრში {whole} მონაწილიდან {part}-მა მედალი მოიპოვა. მონაწილეების რამდენი პროცენტია მედალოსანი?',
    variables: {
      spec: { kind: 'choice', values: percentWhich },
      part: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      whole: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      p: { kind: 'choice', values: (v) => [at(v.spec, 2)] },
      sw: { kind: 'choice', values: (v) => [group(at(v.spec, 1))] },
      spart: { kind: 'choice', values: (v) => [group(at(v.spec, 0))] },
    },
    answer: (v) => pct(Number(v.p)),
    format: { kind: 'text' },
    options: (v) => fourOptions(pct(Number(v.p)), [pct(Number(v.p) + 5), pct(Number(v.p) + 15), pct(Number(v.p) + 2)]),
    explain: ({ vars, answer }) => `${vars.spart} ÷ ${vars.sw} = ${Number(vars.part) / Number(vars.whole)} = ${answer}.`,
  }),

  // ───────────── U12.7 — ამოცანები ─────────────
  bank({
    id: 'g5-u12-q19',
    subtopicId: 'u12-07',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'სკოლაში {whole} მოსწავლეა. მათი {p}% მეხუთე კლასშია. რამდენი მეხუთეკლასელია სკოლაში?',
    variables: {
      spec: { kind: 'choice', values: percentOf },
      whole: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      p: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      sw: { kind: 'choice', values: (v) => [group(at(v.spec, 0))] },
      sp: { kind: 'choice', values: (v) => [String(at(v.spec, 1))] },
    },
    answer: (v) => (Number(v.whole) * Number(v.p)) / 100,
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer + 5, answer + 10, answer * 2, answer - 5 > 0 ? answer - 5 : answer + 2].map(String);
    },
    explain: ({ vars, answer }) => `${vars.sw} × ${vars.sp} ÷ 100 = ${answer} მოსწავლე.`,
  }),
  bank({
    id: 'g5-u12-q20',
    subtopicId: 'u12-07',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'მაღაზიაში ველოსიპედის ფასი {price} ლარია. ფასი {p}%-ით შემცირდა. რამდენი ლარით შემცირდა ფასი და რა გახდა ველოსიპედის ფასი?',
    variables: {
      spec: { kind: 'choice', values: discounts },
      price: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      p: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      sprice: { kind: 'choice', values: (v) => [group(at(v.spec, 0))] },
      sp: { kind: 'choice', values: (v) => [String(at(v.spec, 1))] },
    },
    answer: (v) => {
      const off = (Number(v.price) * Number(v.p)) / 100;
      return `შემცირდა ${off} ლარით, ფასი გახდა ${Number(v.price) - off} ლარი`;
    },
    format: { kind: 'text' },
    options: (v) => {
      const price = Number(v.price);
      const off = (price * Number(v.p)) / 100;
      const right = `შემცირდა ${off} ლარით, ფასი გახდა ${price - off} ლარი`;
      return fourOptions(right, [
        `შემცირდა ${price - off} ლარით, ფასი გახდა ${off} ლარი`,
        `შემცირდა ${off} ლარით, ფასი გახდა ${price} ლარი`,
        `შემცირდა ${off + 5} ლარით, ფასი გახდა ${price - off - 5} ლარი`,
      ]);
    },
    explain: ({ vars, answer }) => {
      const off = (Number(vars.price) * Number(vars.p)) / 100;
      return `ფასდაკლება ${vars.sprice} × ${vars.sp} ÷ 100 = ${off}. ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u12-q21',
    subtopicId: 'u12-07',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ბაღში {whole} ხეა, რომელთა {p}% ვაშლის ხეა. რამდენი ვაშლის ხეა ბაღში?',
    variables: {
      spec: { kind: 'choice', values: percentOf },
      whole: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      p: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      sw: { kind: 'choice', values: (v) => [group(at(v.spec, 0))] },
      sp: { kind: 'choice', values: (v) => [String(at(v.spec, 1))] },
    },
    answer: (v) => (Number(v.whole) * Number(v.p)) / 100,
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return [answer + 4, answer + 8, answer * 2, answer - 4 > 0 ? answer - 4 : answer + 3].map(String);
    },
    explain: ({ vars, answer }) => `${vars.sw}-ის ${vars.sp}% = ${vars.sw} × ${vars.sp}/100 = ${answer} ხე.`,
  }),
  bank({
    id: 'g5-u12-q22',
    subtopicId: 'u12-07',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ტელეფონი {price} ლარი ღირდა. მისი ფასი {p}%-ით გაიზარდა. რამდენი ლარი გახდა ტელეფონის ფასი?',
    variables: {
      spec: { kind: 'choice', values: discounts },
      price: { kind: 'choice', values: (v) => [at(v.spec, 0)] },
      p: { kind: 'choice', values: (v) => [at(v.spec, 1)] },
      sprice: { kind: 'choice', values: (v) => [group(at(v.spec, 0))] },
      sp: { kind: 'choice', values: (v) => [String(at(v.spec, 1))] },
    },
    answer: (v) => Number(v.price) + (Number(v.price) * Number(v.p)) / 100,
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const price = Number(ctx.vars.price);
      const answer = Number(ctx.answer);
      return [price - (price * answer) / 100, answer + 10, price, answer - 10 > 0 ? answer - 10 : answer + 20].map(String);
    },
    explain: ({ vars, answer }) => {
      const up = (Number(vars.price) * Number(vars.p)) / 100;
      return `ზრდა: ${vars.sprice} × ${vars.sp} ÷ 100 = ${up}. ახალი ფასი: ${vars.sprice} + ${up} = ${answer} ლარი.`;
    },
  }),
];
