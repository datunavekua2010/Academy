import type { QuestionTemplate } from './types';
import { bank, gcd, group, shownVar } from './g5-helpers';

/**
 * Grade V — Unit 07: წილადები და შერეული რიცხვები
 * (fractions and mixed numbers).
 *
 * Converted from the academy's `U07` bank (12 subtopics × 6 questions). The bank
 * writes fractions in LaTeX; here they are plain `a/b`, because the answer is a
 * fraction the student reads and matches, not source code.
 */

export const G5_U07_SUBTOPICS = [
  'u07-01',
  'u07-02',
  'u07-03',
  'u07-04',
  'u07-05',
  'u07-06',
  'u07-07',
  'u07-08',
  'u07-09',
  'u07-10',
  'u07-11',
  'u07-12',
] as const;

export type G5U07SubtopicId = (typeof G5_U07_SUBTOPICS)[number];

const TOPIC = 'g5-fractions-mixed';

const shown = (n: number): string => group(n);
const shownList = (values: number[]): string[] => values.map(shown);

const LESS = '<';
const GREATER = '>';
const EQUAL = '=';
const ORDER_OPTIONS = [LESS, EQUAL, GREATER];

const PROPER = 'სწორი';
const IMPROPER = 'არასწორი';
const PROPER_OPTIONS = [PROPER, IMPROPER];

const split = (row: unknown): number[] =>
  String(row)
    .split('|')
    .map((part) => Number(part.replace(/[\s\u00a0\u2009]/g, '')));

const fraction = (n: number, d: number): string => `${n}/${d}`;

/**
 * Exactly four distinct options, answer first.
 *
 * Distractor pools are built from arithmetic neighbours that can coincide with
 * one another (three options instead of four) or, rarely, repeat the answer.
 * Since the option count is fixed by the template, pad deterministically rather
 * than dropping to three.
 */
const fourOptions = (right: string, candidates: string[]): string[] => {
  const out = [right];
  for (const candidate of candidates) {
    if (out.length === 4) break;
    if (!out.includes(candidate)) out.push(candidate);
  }
  let step = 2;
  while (out.length < 4) {
    const filler = right.includes('/') ? right.replace(/\/(\d+)$/, (_, d) => `/${Number(d) + step}`) : `${right} ${step}`;
    if (!out.includes(filler)) out.push(filler);
    step += 1;
  }
  return out;
};
const compare = (a: number, b: number): string => (a > b ? GREATER : a < b ? LESS : EQUAL);

/** `n|d` rows for same-denominator work. */
const sameDenom = [
  '3|7|5', '6|4|11', '7|2|9', '5|1|8', '9|11|12', '4|8|15',
  '3|5|8', '6|8|13', '2|7|10', '5|3|9', '1|4|6', '8|3|11',
  '7|4|12', '2|5|9', '6|1|7', '4|2|5',
];

/** `a|b|c|d` rows for different-denominator comparisons. */
const crossDenom = [
  '1|2|1|3', '3|4|2|5', '2|3|3|5', '5|6|7|9', '3|8|1|4', '4|7|5|8',
  '1|2|2|5', '2|3|1|2', '3|5|5|8', '4|9|2|5', '5|7|3|4', '2|5|3|8',
  '7|8|5|6', '3|4|5|7', '5|9|1|2', '2|7|1|4',
];

/** Fractions that reduce: `n|d`. */
const reducible = [
  '6|12', '15|25', '18|24', '21|35', '28|42', '36|48',
  '8|20', '12|18', '9|15', '10|16', '14|21', '24|32',
  '16|40', '25|35', '27|45', '30|54',
];

/** Pairs needing a common denominator: `a|b|c|d`. */
const commonDenom = [
  '1|2|1|4', '2|3|1|6', '3|5|1|2', '2|7|3|14', '5|6|1|4', '3|8|5|12',
  '1|3|2|9', '3|4|1|6', '5|8|1|2', '2|5|3|10', '4|9|1|3', '7|12|2|3',
  '1|4|3|8', '5|6|2|9', '3|7|1|2', '4|5|7|15',
];

/** Mixed numbers `w|n|d`. */
const mixedRows = [
  '2|1|3', '4|2|5', '3|3|4', '1|5|6', '5|2|7', '6|3|8',
  '7|1|4', '3|7|10', '8|5|6', '2|5|9', '4|3|7', '9|1|2',
  '5|4|9', '6|1|3', '7|3|5', '2|7|8',
];

/** Improper fractions `n|d`. */
const improperRows = [
  '11|3', '17|5', '23|4', '9|4', '15|2', '19|6',
  '13|5', '21|8', '25|7', '10|3', '27|9', '31|5',
  '12|5', '18|7', '22|3', '29|4',
];

/** Widen a fraction pair into a shared denominator. */
const widen = (a: number, b: number, c: number, d: number): [number, number, number, number, number] => {
  const l = (a * d) / gcd(a * d, b * d) || 1;
  const denominator = Math.abs((b * d) / gcd(b, d));
  void l;
  return [a, b, c, d, denominator];
};

export const G5_U07_TEMPLATES: QuestionTemplate[] = [
  // ─────────────── U07.1 — მთელის ნაწილები ───────────────
  bank({
    id: 'g5-u07-q01',
    subtopicId: 'u07-01',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'პიცა {whole} თანაბარ ნაწილად დაჭრეს. ლუკამ {part} ნაწილი შეჭამა. პიცის რა ნაწილი შეჭამა ლუკამ?',
    variables: {
      row: { kind: 'choice', values: ['8|3', '12|5', '10|7', '9|4', '6|2', '15|8', '7|5', '20|6', '16|9', '5|3', '18|7', '14|11'] },
      whole: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      part: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
    },
    answer: (v) => fraction(Number(v.part), Number(v.whole)),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const whole = Number(ctx.vars.whole);
      const part = Number(ctx.vars.part);
      return [fraction(whole, part), fraction(part, whole - part > 0 ? whole - part : whole + 1), fraction(whole - part, whole)];
    },
    explain: ({ vars, answer }) =>
      `მთელი ${vars.whole} ნაწილადაა დაყოფილი, ამიტომ მნიშვნელი ${vars.whole}-ია; აღებულია ${vars.part}, ამიტომ მრიცხველი ${vars.part}. პასუხი: ${answer}.`,
  }),
  bank({
    id: 'g5-u07-q02',
    subtopicId: 'u07-01',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'მართკუთხედი {whole} თანაბარ ნაწილად დაყვეს და {part} ნაწილი გააფერადეს. რა წილია გაფერადებული?',
    variables: {
      row: { kind: 'choice', values: ['10|7', '8|3', '12|9', '15|4', '6|5', '9|2', '20|13', '16|7', '5|2', '18|11', '24|17', '7|3'] },
      whole: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      part: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
    },
    answer: (v) => fraction(Number(v.part), Number(v.whole)),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const whole = Number(ctx.vars.whole);
      const part = Number(ctx.vars.part);
      return [fraction(whole, part), fraction(whole - part, whole), fraction(part, part + 2)];
    },
    explain: ({ vars, answer }) =>
      `გაფერადებულია ${vars.part} ნაწილი ${vars.whole}-დან, ანუ ${answer}.`,
  }),
  bank({
    id: 'g5-u07-q03',
    subtopicId: 'u07-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ბაღში {whole} ხეა, მათგან {part} ვაშლის ხეა. ბაღის რა ნაწილია ვაშლის ხე?',
    variables: {
      row: { kind: 'choice', values: ['10|7', '20|6', '25|9', '12|5', '30|11', '18|7', '16|3', '40|17', '24|13', '36|25', '15|8', '50|21'] },
      whole: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      part: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
    },
    answer: (v) => fraction(Number(v.part), Number(v.whole)),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const whole = Number(ctx.vars.whole);
      const part = Number(ctx.vars.part);
      return [fraction(whole, part), fraction(whole - part, whole), fraction(part, whole + part)];
    },
    explain: ({ vars, answer }) => `${vars.whole} ხიდან ${vars.part} ვაშლისაა, ანუ ${answer}.`,
  }),
  bank({
    id: 'g5-u07-q04',
    subtopicId: 'u07-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'კალათაში {whole} ვაშლია, მათგან {part} მწვანეა. ვაშლების რა ნაწილია მწვანე?',
    variables: {
      row: { kind: 'choice', values: ['20|6', '35|25', '15|9', '24|18', '18|6', '50|12', '45|29', '60|41', '33|22', '28|7', '42|35', '27|18'] },
      whole: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      part: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
    },
    answer: (v) => fraction(Number(v.part), Number(v.whole)),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const whole = Number(ctx.vars.whole);
      const part = Number(ctx.vars.part);
      return [fraction(whole, part), fraction(whole - part, whole), fraction(part, whole - part > 0 ? whole - part : whole + 1)];
    },
    explain: ({ vars, answer }) => `${vars.whole} ვაშლიდან ${vars.part} მწვანეა, ანუ ${answer}.`,
  }),
  bank({
    id: 'g5-u07-q05',
    subtopicId: 'u07-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ლენტა 9 თანაბარ ნაწილად დაჭრეს და 4 ნაწილი გამოიყენეს. ლენტის რა ნაწილი გამოიყენეს?',
    variables: {
      row: { kind: 'choice', values: ['9|4', '9|7', '9|2', '9|5', '9|8', '12|5', '15|7', '18|11', '11|3', '13|9', '7|6', '16|13', '14|3', '10|9', '17|12', '19|5'] },
      whole: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      part: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
    },
    answer: (v) => fraction(Number(v.part), Number(v.whole)),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const whole = Number(ctx.vars.whole);
      const part = Number(ctx.vars.part);
      return [fraction(whole, part), fraction(whole - part, whole), fraction(part + 1, whole)];
    },
    explain: ({ vars, answer }) => `${vars.whole} ნაწილიდან გამოიყენეს ${vars.part}, ანუ ${answer}.`,
  }),
  bank({
    id: 'g5-u07-q06',
    subtopicId: 'u07-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'კლასში {whole} მოსწავლეა, მათგან {part} გოგოა. მოსწავლეების რა ნაწილია გოგო?',
    variables: {
      row: { kind: 'choice', values: ['24|18', '30|12', '28|21', '36|9', '32|24', '40|15', '45|18', '27|15', '48|36', '25|10', '21|14', '33|22'] },
      whole: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      part: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
    },
    answer: (v) => fraction(Number(v.part), Number(v.whole)),
    format: { kind: 'text' },
    distractors: (ctx) => {
      const whole = Number(ctx.vars.whole);
      const part = Number(ctx.vars.part);
      return [fraction(whole, part), fraction(whole - part, whole), fraction(part, whole + part)];
    },
    explain: ({ vars, answer }) => `${vars.whole} მოსწავლიდან ${vars.part} გოგოა, ანუ ${answer}.`,
  }),

  // ─────────────── U07.2 — იგივე მნიშვნელი ───────────────
  bank({
    id: 'g5-u07-q07',
    subtopicId: 'u07-02',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'შეადარე: {a}/{d} ___ {b}/{d}',
    variables: {
      row: { kind: 'choice', values: sameDenom },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[2]!] },
    },
    answer: (v) => compare(Number(v.a), Number(v.b)),
    optionCount: 3,
    options: () => ORDER_OPTIONS,
    format: { kind: 'text' },
    explain: ({ vars, answer }) =>
      `მნიშვნელები ერთნაირია (${vars.d}), ამიტომ ადარებთ მრიცხველებს: ${vars.a} და ${vars.b}. პასუხი: ${answer}.`,
  }),
  bank({
    id: 'g5-u07-q08',
    subtopicId: 'u07-02',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'რომელი წილადია მეტი: {a}/{d} თუ {b}/{d}?',
    variables: {
      row: { kind: 'choice', values: sameDenom },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[2]!] },
    },
    answer: (v) => (Number(v.a) > Number(v.b) ? fraction(Number(v.a), Number(v.d)) : fraction(Number(v.b), Number(v.d))),
    optionCount: 2,
    options: (v) => [fraction(Number(v.a), Number(v.d)), fraction(Number(v.b), Number(v.d))],
    format: { kind: 'text' },
    explain: ({ answer }) =>
      `მნიშვნელი ერთია, ამიტომ მეტია ის, რომლის მრიცხველიც მეტია. პასუხი: ${answer}.`,
  }),
  bank({
    id: 'g5-u07-q09',
    subtopicId: 'u07-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'დაალაგე ზრდადობით: {a}/{d}, {b}/{d}, {c}/{d}, {e}/{d}',
    variables: {
      row: {
        kind: 'choice',
        values: ['5|1|7|3|8', '2|6|3|5|9', '9|4|7|2|10', '3|7|1|5|6', '8|2|6|4|11', '1|6|3|8|7',
          '4|9|2|7|5', '7|3|8|1|9', '5|2|9|4|12', '6|1|8|3|10', '2|8|5|1|7', '9|5|3|7|11'],
      },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      c: { kind: 'choice', values: (v) => [split(v.row)[2]!] },
      e: { kind: 'choice', values: (v) => [split(v.row)[3]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[4]!] },
    },
    answer: (v) => {
      const d = Number(v.d);
      return [Number(v.a), Number(v.b), Number(v.c), Number(v.e)]
        .sort((x, y) => x - y)
        .map((n) => fraction(n, d))
        .join(', ');
    },
    format: { kind: 'text' },
    options: (v) => {
      const d = Number(v.d);
      const sorted = [Number(v.a), Number(v.b), Number(v.c), Number(v.e)].sort((x, y) => x - y);
      const right = sorted.map((n) => fraction(n, d)).join(', ');
      const wrong1 = [...sorted].reverse().map((n) => fraction(n, d)).join(', ');
      const wrong2 = [Number(v.a), Number(v.b), Number(v.c), Number(v.e)].map((n) => fraction(n, d)).join(', ');
      const shifted = [sorted[1]!, sorted[0]!, sorted[3]!, sorted[2]!].map((n) => fraction(n, d)).join(', ');
      return fourOptions(right, [wrong1, wrong2, shifted]);
    },
    explain: ({ vars, answer }) =>
      `მნიშვნელი ყველგან ${vars.d}-ია, ამიტომ მრიცხველების მიხედვით ვალაგებთ: ${answer}.`,
  }),
  bank({
    id: 'g5-u07-q10',
    subtopicId: 'u07-02',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'შეადარე: {a}/{d} ___ {b}/{d}',
    variables: {
      row: { kind: 'choice', values: ['9|11|12', '3|7|9', '6|4|7', '5|2|9', '8|3|10', '7|1|8', '4|6|11', '2|5|6', '10|3|13', '6|2|8', '9|5|14', '3|8|10'] },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[2]!] },
    },
    answer: (v) => compare(Number(v.a), Number(v.b)),
    optionCount: 3,
    options: () => ORDER_OPTIONS,
    format: { kind: 'text' },
    explain: ({ vars, answer }) => `მრიცხველები ${vars.a} და ${vars.b}; მეტია ${Math.max(Number(vars.a), Number(vars.b))}. პასუხი: ${answer}.`,
  }),
  bank({
    id: 'g5-u07-q11',
    subtopicId: 'u07-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'რომელი წილადია ნაკლები: {a}/{d} თუ {b}/{d}?',
    variables: {
      row: { kind: 'choice', values: sameDenom },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[2]!] },
    },
    answer: (v) => (Number(v.a) < Number(v.b) ? fraction(Number(v.a), Number(v.d)) : fraction(Number(v.b), Number(v.d))),
    optionCount: 2,
    options: (v) => [fraction(Number(v.a), Number(v.d)), fraction(Number(v.b), Number(v.d))],
    format: { kind: 'text' },
    explain: ({ answer }) => `ნაკლებია ის, რომლის მრიცხველიც ნაკლებია. პასუხი: ${answer}.`,
  }),
  bank({
    id: 'g5-u07-q12',
    subtopicId: 'u07-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'შეადარე: {a}/{d} ___ {b}/{d}',
    variables: {
      row: { kind: 'choice', values: ['7|7|9', '4|4|5', '6|9|13', '8|8|15', '3|3|7', '11|11|14', '5|8|12', '2|9|11', '10|10|16', '6|7|10', '4|9|9', '12|13|17'] },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[2]!] },
    },
    answer: (v) => compare(Number(v.a), Number(v.b)),
    optionCount: 3,
    options: () => ORDER_OPTIONS,
    format: { kind: 'text' },
    explain: ({ vars, answer }) => `მრიცხველები ${vars.a} და ${vars.b} — პასუხი: ${answer}.`,
  }),

  // ─────────────── U07.3 — სხვადასხვა მნიშვნელი ───────────────
  bank({
    id: 'g5-u07-q13',
    subtopicId: 'u07-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'შეადარე: {a}/{b} ___ {c}/{d}',
    variables: {
      row: { kind: 'choice', values: crossDenom },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      c: { kind: 'choice', values: (v) => [split(v.row)[2]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[3]!] },
    },
    answer: (v) => compare(Number(v.a) * Number(v.d), Number(v.c) * Number(v.b)),
    optionCount: 3,
    options: () => ORDER_OPTIONS,
    format: { kind: 'text' },
    explain: ({ vars, answer }) =>
      `ჯვარედინად ვამრავლებთ: ${vars.a} × ${vars.d} = ${Number(vars.a) * Number(vars.d)}, ხოლო ${vars.c} × ${vars.b} = ${Number(vars.c) * Number(vars.b)}. პასუხი: ${answer}.`,
  }),
  bank({
    id: 'g5-u07-q14',
    subtopicId: 'u07-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'შეადარე: {a}/{b} ___ {c}/{d}',
    variables: {
      row: {
        kind: 'choice',
        values: ['1|3|1|2', '2|5|3|4', '3|7|4|9', '5|8|2|3', '4|5|7|9', '2|9|1|4',
          '5|6|8|9', '3|4|7|10', '6|7|9|11', '4|7|5|9', '7|9|3|4', '5|12|2|5',
          '8|9|7|8', '3|5|4|7', '9|10|5|6', '2|3|5|8'],
      },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      c: { kind: 'choice', values: (v) => [split(v.row)[2]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[3]!] },
    },
    answer: (v) => compare(Number(v.a) * Number(v.d), Number(v.c) * Number(v.b)),
    optionCount: 3,
    options: () => ORDER_OPTIONS,
    format: { kind: 'text' },
    explain: ({ vars, answer }) => {
      const left = Number(vars.a) * Number(vars.d);
      const right = Number(vars.c) * Number(vars.b);
      return `${vars.a} × ${vars.d} = ${left}, ${vars.c} × ${vars.b} = ${right}. პასუხი: ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u07-q15',
    subtopicId: 'u07-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'შეადარე: {a}/{b} ___ {c}/{d}',
    variables: {
      row: { kind: 'choice', values: ['1|4|2|9', '2|3|5|9', '3|8|4|11', '5|7|6|10', '4|9|5|12', '7|10|8|13', '3|7|2|5', '6|11|5|9', '2|7|3|11', '5|9|6|14', '4|13|3|10', '7|12|6|11'] },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      c: { kind: 'choice', values: (v) => [split(v.row)[2]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[3]!] },
    },
    answer: (v) => compare(Number(v.a) * Number(v.d), Number(v.c) * Number(v.b)),
    optionCount: 3,
    options: () => ORDER_OPTIONS,
    format: { kind: 'text' },
    explain: ({ vars, answer }) => {
      const left = Number(vars.a) * Number(vars.d);
      const right = Number(vars.c) * Number(vars.b);
      return `საერთო მნიშვნელამდე მიყვანის შემდეგ: ${left} და ${right}. პასუხი: ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u07-q16',
    subtopicId: 'u07-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'შეადარე: {a}/{b} ___ {c}/{d}',
    variables: {
      row: { kind: 'choice', values: ['3|5|1|2', '4|7|2|5', '5|8|3|7', '6|9|2|7', '7|8|8|9', '3|10|1|5', '9|11|4|7', '5|9|2|5', '8|13|3|8', '7|15|2|7', '6|7|5|8', '4|11|1|4'] },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      c: { kind: 'choice', values: (v) => [split(v.row)[2]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[3]!] },
    },
    answer: (v) => compare(Number(v.a) * Number(v.d), Number(v.c) * Number(v.b)),
    optionCount: 3,
    options: () => ORDER_OPTIONS,
    format: { kind: 'text' },
    explain: ({ vars, answer }) => {
      const left = Number(vars.a) * Number(vars.d);
      const right = Number(vars.c) * Number(vars.b);
      return `${vars.a}/${vars.b} და ${vars.c}/${vars.d}: ${left} ${answer === EQUAL ? '=' : answer === GREATER ? '>' : '<'} ${right}.`;
    },
  }),
  bank({
    id: 'g5-u07-q17',
    subtopicId: 'u07-03',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'რომელი წილადია მეტი: {a}/{b} თუ {c}/{d}?',
    variables: {
      row: { kind: 'choice', values: crossDenom },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      c: { kind: 'choice', values: (v) => [split(v.row)[2]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[3]!] },
    },
    answer: (v) =>
      Number(v.a) * Number(v.d) > Number(v.c) * Number(v.b)
        ? fraction(Number(v.a), Number(v.b))
        : fraction(Number(v.c), Number(v.d)),
    optionCount: 2,
    options: (v) => [fraction(Number(v.a), Number(v.b)), fraction(Number(v.c), Number(v.d))],
    format: { kind: 'text' },
    explain: ({ vars, answer }) =>
      `ჯვარედინი ნამრავლებია ${Number(vars.a) * Number(vars.d)} და ${Number(vars.c) * Number(vars.b)}. მეტია ${answer}.`,
  }),
  bank({
    id: 'g5-u07-q18',
    subtopicId: 'u07-03',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'რომელი წილადია ნაკლები: {a}/{b} თუ {c}/{d}?',
    variables: {
      row: { kind: 'choice', values: crossDenom },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      c: { kind: 'choice', values: (v) => [split(v.row)[2]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[3]!] },
    },
    answer: (v) =>
      Number(v.a) * Number(v.d) < Number(v.c) * Number(v.b)
        ? fraction(Number(v.a), Number(v.b))
        : fraction(Number(v.c), Number(v.d)),
    optionCount: 2,
    options: (v) => [fraction(Number(v.a), Number(v.b)), fraction(Number(v.c), Number(v.d))],
    format: { kind: 'text' },
    explain: ({ answer }) => `ნაკლებია ${answer} — შედარება ჯვარედინი ნამრავლებით ხდება.`,
  }),

  // ─────────────── U07.4 — წილადის შეკვეცა ───────────────
  bank({
    id: 'g5-u07-q19',
    subtopicId: 'u07-04',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'შეამოკლე წილადი: {n}/{d}',
    variables: {
      row: { kind: 'choice', values: reducible },
      n: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
    },
    answer: (v) => {
      const g = gcd(Number(v.n), Number(v.d));
      return fraction(Number(v.n) / g, Number(v.d) / g);
    },
    format: { kind: 'text' },
    options: (v) => {
      const n = Number(v.n);
      const d = Number(v.d);
      const g = gcd(n, d);
      const right = fraction(n / g, d / g);
      const wrongs = [fraction(n, d / 2), fraction(n / 2, d), fraction(n / g + 1, d / g)];
      return fourOptions(right, wrongs);
    },
    explain: ({ vars, answer }) => {
      const n = Number(vars.n);
      const d = Number(vars.d);
      const g = gcd(n, d);
      return `${n} და ${d} იყოფა ${g}-ზე: ${n} ÷ ${g} = ${n / g}, ${d} ÷ ${g} = ${d / g}. პასუხი: ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u07-q20',
    subtopicId: 'u07-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'შეამოკლე წილადი: {n}/{d}',
    variables: {
      row: {
        kind: 'choice',
        values: ['45|60', '32|48', '54|72', '42|56', '63|81', '48|64', '36|90', '56|84',
          '72|96', '35|49', '64|80', '81|108', '55|77', '87|116', '39|52', '68|85'],
      },
      n: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
    },
    answer: (v) => {
      const g = gcd(Number(v.n), Number(v.d));
      return fraction(Number(v.n) / g, Number(v.d) / g);
    },
    format: { kind: 'text' },
    options: (v) => {
      const n = Number(v.n);
      const d = Number(v.d);
      const g = gcd(n, d);
      const right = fraction(n / g, d / g);
      const wrongs = [fraction(n / 2, d / 2), fraction(n / g, d / g + 1), fraction(n + 1, d + 1)];
      return fourOptions(right, wrongs);
    },
    explain: ({ vars, answer }) => {
      const n = Number(vars.n);
      const d = Number(vars.d);
      const g = gcd(n, d);
      return `უდიდესი საერთო გამყოფია ${g}: ${n} ÷ ${g} = ${n / g}, ${d} ÷ ${g} = ${d / g}. პასუხი: ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u07-q21',
    subtopicId: 'u07-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'შეამოკლე წილადი: {n}/{d}',
    variables: {
      row: { kind: 'choice', values: reducible },
      n: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
    },
    answer: (v) => {
      const g = gcd(Number(v.n), Number(v.d));
      return fraction(Number(v.n) / g, Number(v.d) / g);
    },
    format: { kind: 'text' },
    options: (v) => {
      const n = Number(v.n);
      const d = Number(v.d);
      const g = gcd(n, d);
      const right = fraction(n / g, d / g);
      const wrongs = [fraction(n, d / g), fraction(n / g, d), fraction(n / (g || 1) + 1, d / (g || 1))];
      return fourOptions(right, wrongs);
    },
    explain: ({ vars, answer }) => {
      const g = gcd(Number(vars.n), Number(vars.d));
      return `გავყოთ ${g}-ზე: ${vars.n}/${vars.d} = ${answer}.`;
    },
  }),

  // ─────────────── U07.5 — საერთო მნიშვნელი ───────────────
  bank({
    id: 'g5-u07-q22',
    subtopicId: 'u07-05',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'მოიყვანე საერთო მნიშვნელზე: {a}/{b} და {c}/{d}',
    variables: {
      row: { kind: 'choice', values: commonDenom },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      c: { kind: 'choice', values: (v) => [split(v.row)[2]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[3]!] },
    },
    answer: (v) => {
      const a = Number(v.a);
      const b = Number(v.b);
      const c = Number(v.c);
      const d = Number(v.d);
      const l = (b * d) / gcd(b, d);
      return `${fraction(a * (l / b), l)} და ${fraction(c * (l / d), l)}`;
    },
    format: { kind: 'text' },
    options: (v) => {
      const a = Number(v.a);
      const b = Number(v.b);
      const c = Number(v.c);
      const d = Number(v.d);
      const l = (b * d) / gcd(b, d);
      const right = `${fraction(a * (l / b), l)} და ${fraction(c * (l / d), l)}`;
      const wrongs = [
        `${fraction(a, l)} და ${fraction(c, l)}`,
        `${fraction(a * d, l)} და ${fraction(c * b, l)}`,
        `${fraction(a * (l / b), b)} და ${fraction(c * (l / d), d)}`,
      ];
      return fourOptions(right, wrongs);
    },
    explain: ({ vars, answer }) => {
      const b = Number(vars.b);
      const d = Number(vars.d);
      const l = (b * d) / gcd(b, d);
      return `უმცირესი საერთო მნიშვნელია ${l}. პასუხი: ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u07-q23',
    subtopicId: 'u07-05',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'მოიყვანე საერთო მნიშვნელზე: {a}/{b} და {c}/{d}',
    variables: {
      row: { kind: 'choice', values: ['1|3|1|4', '2|5|1|2', '3|8|1|4', '2|9|1|3', '5|12|1|6', '3|10|1|2', '4|15|1|5', '7|16|1|8', '5|18|1|9', '2|11|1|2', '3|14|1|7', '4|21|1|3'] },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      c: { kind: 'choice', values: (v) => [split(v.row)[2]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[3]!] },
    },
    answer: (v) => {
      const a = Number(v.a);
      const b = Number(v.b);
      const c = Number(v.c);
      const d = Number(v.d);
      const l = (b * d) / gcd(b, d);
      return `${fraction(a * (l / b), l)} და ${fraction(c * (l / d), l)}`;
    },
    format: { kind: 'text' },
    options: (v) => {
      const a = Number(v.a);
      const b = Number(v.b);
      const c = Number(v.c);
      const d = Number(v.d);
      const l = (b * d) / gcd(b, d);
      const right = `${fraction(a * (l / b), l)} და ${fraction(c * (l / d), l)}`;
      return fourOptions(right, [
        `${fraction(a, l)} და ${fraction(c, l)}`,
        `${fraction(a * d, l)} და ${fraction(c * b, l)}`,
        `${fraction(a * (l / b), b)} და ${fraction(c * (l / d), d)}`,
        `${fraction(a * (l / b), l)} და ${fraction(c * (l / d), l + 1)}`,
      ]);
    },
    explain: ({ vars, answer }) => {
      const b = Number(vars.b);
      const d = Number(vars.d);
      return `საერთო მნიშვნელია ${(b * d) / gcd(b, d)}. პასუხი: ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u07-q24',
    subtopicId: 'u07-05',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'მოიყვანე საერთო მნიშვნელზე: {a}/{b} და {c}/{d}',
    variables: {
      row: { kind: 'choice', values: ['3|4|5|6', '2|7|3|4', '5|8|7|12', '3|5|2|3', '4|9|2|3', '7|10|3|5', '5|6|8|9', '4|7|3|8', '6|11|2|5', '9|14|3|7', '7|18|2|9', '5|21|4|7'] },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      c: { kind: 'choice', values: (v) => [split(v.row)[2]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[3]!] },
    },
    answer: (v) => {
      const a = Number(v.a);
      const b = Number(v.b);
      const c = Number(v.c);
      const d = Number(v.d);
      const l = (b * d) / gcd(b, d);
      return `${fraction(a * (l / b), l)} და ${fraction(c * (l / d), l)}`;
    },
    format: { kind: 'text' },
    options: (v) => {
      const a = Number(v.a);
      const b = Number(v.b);
      const c = Number(v.c);
      const d = Number(v.d);
      const l = (b * d) / gcd(b, d);
      const right = `${fraction(a * (l / b), l)} და ${fraction(c * (l / d), l)}`;
      return fourOptions(right, [
        `${fraction(a, l)} და ${fraction(c, l)}`,
        `${fraction(a * d, l)} და ${fraction(c * b, l)}`,
        `${fraction(a * (l / b), b)} და ${fraction(c * (l / d), d)}`,
        `${fraction(a * (l / b), l)} და ${fraction(c * (l / d), l + 1)}`,
      ]);
    },
    explain: ({ vars, answer }) => `უმცირესი საერთო მნიშვნელი: ${(Number(vars.b) * Number(vars.d)) / gcd(Number(vars.b), Number(vars.d))}. ${answer}.`,
  }),

  // ─────────────── U07.6 — ტოლი წილადები ───────────────
  bank({
    id: 'g5-u07-q25',
    subtopicId: 'u07-06',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'შეავსე: {a}/{b} = □/{d}',
    variables: {
      row: { kind: 'choice', values: ['1|2|8', '3|5|15', '2|7|21', '4|9|18', '5|6|24', '3|8|40', '2|3|12', '5|8|16', '7|9|27', '4|5|25', '3|4|20', '2|9|45'] },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[2]!] },
    },
    answer: (v) => (Number(v.a) * Number(v.d)) / Number(v.b),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 1, answer - 1 > 0 ? answer - 1 : answer + 2, answer * 2, Number(ctx.vars.d)]);
    },
    explain: ({ vars, answer }) =>
      `${vars.d} ÷ ${vars.b} = ${Number(vars.d) / Number(vars.b)}, ამიტომ მრიცხველიც იმავე რიცხვზე უნდა გავამრავლოთ: ${vars.a} × ${Number(vars.d) / Number(vars.b)} = ${answer}.`,
  }),
  bank({
    id: 'g5-u07-q26',
    subtopicId: 'u07-06',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'შეავსე: {a}/{b} = {n}/□',
    variables: {
      row: { kind: 'choice', values: ['1|2|4', '3|5|12', '2|7|6', '4|9|20', '5|6|15', '3|8|9', '2|3|8', '5|8|15', '7|9|14', '4|5|12', '3|4|9', '2|9|10'] },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      n: { kind: 'choice', values: (v) => [split(v.row)[2]!] },
    },
    answer: (v) => (Number(v.n) * Number(v.b)) / Number(v.a),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 1, answer - 1 > 0 ? answer - 1 : answer + 2, answer * 2, Number(ctx.vars.b)]);
    },
    explain: ({ vars, answer }) =>
      `${vars.a} × ${Number(vars.n) / Number(vars.a)} = ${vars.n}, ამიტომ ${vars.b} × ${Number(vars.n) / Number(vars.a)} = ${answer}.`,
  }),
  bank({
    id: 'g5-u07-q27',
    subtopicId: 'u07-06',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'შეავსე: {a}/{b} = □/{d}',
    variables: {
      row: { kind: 'choice', values: ['1|4|20', '3|7|28', '2|5|30', '5|9|36', '4|11|22', '3|10|40', '6|7|21', '2|11|33', '5|12|24', '7|8|32', '3|13|26', '4|15|45'] },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[2]!] },
    },
    answer: (v) => (Number(v.a) * Number(v.d)) / Number(v.b),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const answer = Number(ctx.answer);
      return shownList([answer + 1, answer + 2, answer * 2, Number(ctx.vars.d) / Number(ctx.vars.b)]);
    },
    explain: ({ vars, answer }) => `${vars.d} ÷ ${vars.b} = ${Number(vars.d) / Number(vars.b)}, ${vars.a} × ${Number(vars.d) / Number(vars.b)} = ${answer}.`,
  }),

  // ─────────────── U07.7 — სწორი და არასწორი ───────────────
  bank({
    id: 'g5-u07-q28',
    subtopicId: 'u07-07',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'განსაზღვრე, სწორია თუ არასწორი წილადი: {n}/{d}',
    variables: {
      row: { kind: 'choice', values: ['3|7', '9|5', '2|9', '7|7', '5|8', '11|6', '4|9', '8|8', '6|4', '1|3', '17|5', '2|7', '13|4', '5|6', '9|2', '10|12'] },
      n: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
    },
    answer: (v) => (Number(v.n) < Number(v.d) ? PROPER : IMPROPER),
    optionCount: 2,
    options: () => PROPER_OPTIONS,
    format: { kind: 'text' },
    explain: ({ vars, answer }) =>
      `მრიცხველი ${vars.n}, მნიშვნელი ${vars.d}. ${Number(vars.n) < Number(vars.d) ? 'მრიცხველი ნაკლებია — წილადი სწორია' : 'მრიცხველი არ არის ნაკლები მნიშვნელზე — წილადი არასწორია'}: ${answer}.`,
  }),
  bank({
    id: 'g5-u07-q29',
    subtopicId: 'u07-07',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ჩამოთვლილთაგან რომელია არასწორი წილადი: {a}/{b}, {c}/{d}, {e}/{f}?',
    variables: {
      row: { kind: 'choice', values: ['2|9|7|7|5|8', '7|3|4|9|8|8', '2|5|3|8|9|4', '5|6|11|6|4|7', '3|8|6|9|10|3', '1|4|8|5|2|9', '6|7|13|4|5|9', '4|5|9|2|6|8', '1|3|7|5|4|11', '5|12|17|5|2|7', '3|7|8|8|9|11', '2|6|13|3|4|5'] },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      c: { kind: 'choice', values: (v) => [split(v.row)[2]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[3]!] },
      e: { kind: 'choice', values: (v) => [split(v.row)[4]!] },
      f: { kind: 'choice', values: (v) => [split(v.row)[5]!] },
    },
    answer: (v) => {
      const rows = [[Number(v.a), Number(v.b)], [Number(v.c), Number(v.d)], [Number(v.e), Number(v.f)]];
      const bad = rows.find(([n, d]) => n! >= d!);
      return bad ? fraction(bad[0]!, bad[1]!) : fraction(Number(v.a), Number(v.b));
    },
    format: { kind: 'text' },
    options: (v) =>
      fourOptions(fraction(Number(v.a), Number(v.b)), [
        fraction(Number(v.c), Number(v.d)),
        fraction(Number(v.e), Number(v.f)),
        fraction(Number(v.a) + Number(v.c), Number(v.b) + Number(v.d)),
        fraction(Number(v.b), Number(v.a)),
      ]),
    explain: ({ answer }) => `არასწორი წილადის მრიცხველი მნიშვნელზე ნაკლები არ არის. ასეთია ${answer}.`,
  }),
  bank({
    id: 'g5-u07-q30',
    subtopicId: 'u07-07',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'განსაზღვრე, სწორია თუ არასწორი წილადი: {n}/{d}',
    variables: {
      row: { kind: 'choice', values: ['6|5', '3|4', '8|7', '1|2', '12|9', '5|9', '15|8', '7|10', '9|9', '14|3', '2|5', '11|12'] },
      n: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
    },
    answer: (v) => (Number(v.n) < Number(v.d) ? PROPER : IMPROPER),
    optionCount: 2,
    options: () => PROPER_OPTIONS,
    format: { kind: 'text' },
    explain: ({ vars, answer }) => `${vars.n}/${vars.d}: ${answer}.`,
  }),
  bank({
    id: 'g5-u07-q31',
    subtopicId: 'u07-07',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'რამდენია {n}/{d} წილადის მნიშვნელი?',
    variables: {
      row: { kind: 'choice', values: ['3|7', '9|5', '2|9', '7|7', '5|8', '11|6', '4|9', '8|8', '6|4', '1|3', '17|5', '2|7', '13|4', '5|6', '9|2', '10|12'] },
      n: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
    },
    answer: (v) => Number(v.d),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const n = Number(ctx.vars.n);
      const d = Number(ctx.vars.d);
      return shownList([n, n + d, d + 1, Math.abs(d - n)]);
    },
    explain: ({ vars, answer }) =>
      `მნიშვნელი ის რიცხვია, რომელიც ხაზის ქვემოთ დგას — ${answer}. მრიცხველი კი ${vars.n}-ია.`,
  }),
  bank({
    id: 'g5-u07-q32',
    subtopicId: 'u07-07',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'რომელია ყველაზე პატარა არასწორი წილადი: {a}/{b}, {c}/{d}, {e}/{f}, {g}/{h}?',
    variables: {
      row: { kind: 'choice', values: ['3|4|5|5|7|3|2|9', '4|5|6|6|9|4|3|8', '2|7|8|8|11|5|5|9', '5|6|7|7|10|3|1|4', '3|8|9|9|13|6|7|10', '6|7|8|8|12|5|2|3', '1|5|4|4|6|3|8|11', '7|9|10|10|14|6|3|5', '2|5|3|3|8|7|1|6', '4|7|5|5|9|2|6|13', '1|2|7|7|11|4|3|10', '5|8|6|6|13|5|2|7', '3|5|4|4|10|9|7|12', '9|11|10|10|15|8|4|6', '2|3|8|8|12|7|5|9', '6|11|7|7|16|9|1|3'] },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      c: { kind: 'choice', values: (v) => [split(v.row)[2]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[3]!] },
      e: { kind: 'choice', values: (v) => [split(v.row)[4]!] },
      f: { kind: 'choice', values: (v) => [split(v.row)[5]!] },
      g: { kind: 'choice', values: (v) => [split(v.row)[6]!] },
      h: { kind: 'choice', values: (v) => [split(v.row)[7]!] },
    },
    answer: (v) => {
      const candidates = [
        [Number(v.a), Number(v.b)],
        [Number(v.c), Number(v.d)],
        [Number(v.e), Number(v.f)],
        [Number(v.g), Number(v.h)],
      ].filter(([n, d]) => n! >= d!);
      candidates.sort(([x, y], [p, q]) => x! / y! - p! / q!);
      const best = candidates[0] ?? [Number(v.a), Number(v.b)];
      return fraction(best[0]!, best[1]!);
    },
    format: { kind: 'text' },
    options: (v) => [
      fraction(Number(v.a), Number(v.b)),
      fraction(Number(v.c), Number(v.d)),
      fraction(Number(v.e), Number(v.f)),
      fraction(Number(v.g), Number(v.h)),
    ],
    explain: ({ answer }) =>
      `არასწორი წილადები 1-ზე ნაკლები არ არიან; მათ შორის ყველაზე პატარაა ${answer}.`,
  }),

  // ─────────────── U07.8 — შერეული რიცხვები ───────────────
  bank({
    id: 'g5-u07-q33',
    subtopicId: 'u07-08',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'ჩაწერე შერეული რიცხვი არაწესიერი წილადის სახით: {w} {n}/{d}',
    variables: {
      row: { kind: 'choice', values: mixedRows },
      w: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      n: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[2]!] },
    },
    answer: (v) => fraction(Number(v.w) * Number(v.d) + Number(v.n), Number(v.d)),
    format: { kind: 'text' },
    options: (v) => {
      const w = Number(v.w);
      const n = Number(v.n);
      const d = Number(v.d);
      const right = fraction(w * d + n, d);
      return fourOptions(right, [fraction(w + n, d), fraction(w * d, d + n), fraction(w * n + d, d)]);
    },
    explain: ({ vars, answer }) =>
      `მთელი ნაწილი მნიშვნელზე გავამრავლოთ და დავუმატოთ მრიცხველი: ${vars.w} × ${vars.d} + ${vars.n} = ${Number(vars.w) * Number(vars.d) + Number(vars.n)}. პასუხი: ${answer}.`,
  }),
  bank({
    id: 'g5-u07-q34',
    subtopicId: 'u07-08',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ჩაწერე არაწესიერი წილადი შერეული რიცხვის სახით: {n}/{d}',
    variables: {
      row: { kind: 'choice', values: improperRows },
      n: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
    },
    answer: (v) => {
      const n = Number(v.n);
      const d = Number(v.d);
      const whole = Math.floor(n / d);
      const rest = n % d;
      return rest === 0 ? `${whole}` : `${whole} ${rest}/${d}`;
    },
    format: { kind: 'text' },
    options: (v) => {
      const n = Number(v.n);
      const d = Number(v.d);
      const whole = Math.floor(n / d);
      const rest = n % d;
      const right = rest === 0 ? `${whole}` : `${whole} ${rest}/${d}`;
      const wrongs = [
        rest === 0 ? `${whole} 1/${d}` : `${whole} ${d - rest}/${d}`,
        `${whole} ${rest}/${d + 1}`,
        `${whole + 1} ${rest}/${d}`,
      ];
      return fourOptions(right, wrongs);
    },
    explain: ({ vars, answer }) => {
      const n = Number(vars.n);
      const d = Number(vars.d);
      return `${n} ÷ ${d} = ${Math.floor(n / d)} და ნაშთი ${n % d}. პასუხი: ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u07-q35',
    subtopicId: 'u07-08',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ჩაწერე შერეული რიცხვი არაწესიერი წილადის სახით: {w} {n}/{d}',
    variables: {
      row: { kind: 'choice', values: mixedRows },
      w: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      n: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[2]!] },
    },
    answer: (v) => fraction(Number(v.w) * Number(v.d) + Number(v.n), Number(v.d)),
    format: { kind: 'text' },
    options: (v) => {
      const w = Number(v.w);
      const n = Number(v.n);
      const d = Number(v.d);
      const right = fraction(w * d + n, d);
      return fourOptions(right, [fraction(w * d - n, d), fraction(w + n, d), fraction(w * n, d)]);
    },
    explain: ({ vars, answer }) =>
      `${vars.w} × ${vars.d} = ${Number(vars.w) * Number(vars.d)}, + ${vars.n} = ${Number(vars.w) * Number(vars.d) + Number(vars.n)}. პასუხი: ${answer}.`,
  }),
  bank({
    id: 'g5-u07-q36',
    subtopicId: 'u07-08',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ჩაწერე არაწესიერი წილადი შერეული რიცხვის სახით: {n}/{d}',
    variables: {
      row: { kind: 'choice', values: improperRows },
      n: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
    },
    answer: (v) => {
      const n = Number(v.n);
      const d = Number(v.d);
      const whole = Math.floor(n / d);
      const rest = n % d;
      return rest === 0 ? `${whole}` : `${whole} ${rest}/${d}`;
    },
    format: { kind: 'text' },
    options: (v) => {
      const n = Number(v.n);
      const d = Number(v.d);
      const whole = Math.floor(n / d);
      const rest = n % d;
      const right = rest === 0 ? `${whole}` : `${whole} ${rest}/${d}`;
      const wrongs = [
        rest === 0 ? `${whole} 1/${d}` : `${whole} ${d - rest}/${d}`,
        `${whole} ${rest}/${d + 2}`,
        `${whole + 1} ${rest}/${d}`,
      ];
      return fourOptions(right, wrongs);
    },
    explain: ({ vars, answer }) => `${vars.n} ÷ ${vars.d} = ${Math.floor(Number(vars.n) / Number(vars.d))} ნაშთით ${Number(vars.n) % Number(vars.d)}. ${answer}.`,
  }),

  // ─────────────── U07.9 — შერეულიდან არასწორამდე ───────────────
  bank({
    id: 'g5-u07-q37',
    subtopicId: 'u07-09',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'გარდაქმენი არაწესიერ წილადად: {w} {n}/{d}',
    variables: {
      row: { kind: 'choice', values: ['5|2|7', '6|3|8', '2|5|9', '7|1|4', '3|7|10', '8|5|6', '4|3|7', '9|1|2', '2|3|5', '5|4|9', '6|1|3', '7|3|5'] },
      w: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      n: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[2]!] },
    },
    answer: (v) => fraction(Number(v.w) * Number(v.d) + Number(v.n), Number(v.d)),
    format: { kind: 'text' },
    options: (v) => {
      const w = Number(v.w);
      const n = Number(v.n);
      const d = Number(v.d);
      const right = fraction(w * d + n, d);
      return fourOptions(right, [fraction(w * d, d), fraction(w + n, d), fraction(w * d + n, d + 1)]);
    },
    explain: ({ vars, answer }) =>
      `${vars.w} × ${vars.d} + ${vars.n} = ${Number(vars.w) * Number(vars.d) + Number(vars.n)}, მნიშვნელი უცვლელია. პასუხი: ${answer}.`,
  }),
  bank({
    id: 'g5-u07-q38',
    subtopicId: 'u07-09',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გარდაქმენი არაწესიერ წილადად: {w} {n}/{d}',
    variables: {
      row: { kind: 'choice', values: mixedRows },
      w: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      n: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[2]!] },
    },
    answer: (v) => fraction(Number(v.w) * Number(v.d) + Number(v.n), Number(v.d)),
    format: { kind: 'text' },
    options: (v) => {
      const w = Number(v.w);
      const n = Number(v.n);
      const d = Number(v.d);
      const right = fraction(w * d + n, d);
      return fourOptions(right, [fraction(w * d, d), fraction(w * n + d, d), fraction(w * d + n, n)]);
    },
    explain: ({ vars, answer }) => `${vars.w} ${vars.n}/${vars.d} = ${answer}.`,
  }),
  bank({
    id: 'g5-u07-q39',
    subtopicId: 'u07-09',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'გარდაქმენი არაწესიერ წილადად: {w} {n}/{d}',
    variables: {
      row: { kind: 'choice', values: ['10|1|3', '11|2|5', '12|3|4', '13|1|6', '14|2|7', '15|3|8', '16|1|9', '17|2|10', '18|3|11', '19|1|12', '20|2|13', '21|3|14'] },
      w: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      n: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[2]!] },
    },
    answer: (v) => fraction(Number(v.w) * Number(v.d) + Number(v.n), Number(v.d)),
    format: { kind: 'text' },
    options: (v) => {
      const w = Number(v.w);
      const n = Number(v.n);
      const d = Number(v.d);
      const right = fraction(w * d + n, d);
      return fourOptions(right, [fraction(w * d, d + 1), fraction(w + n, d), fraction(w * d + n - 1, d)]);
    },
    explain: ({ vars, answer }) =>
      `${vars.w} × ${vars.d} = ${Number(vars.w) * Number(vars.d)}; + ${vars.n} = ${Number(vars.w) * Number(vars.d) + Number(vars.n)}. ${answer}.`,
  }),

  // ─────────────── U07.10 — შედარება და დალაგება ───────────────
  bank({
    id: 'g5-u07-q40',
    subtopicId: 'u07-10',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'დაალაგე ზრდადობით: {a}/{b}, {c}/{d}, {e}/{f}',
    variables: {
      row: {
        kind: 'choice',
        values: ['1|2|3|4|1|4', '2|3|3|4|5|6', '1|3|1|2|2|5', '3|5|1|2|7|10',
          '2|7|1|4|3|8', '5|6|4|5|7|8', '1|5|2|9|3|10', '3|8|1|3|5|12',
          '4|9|1|2|5|9', '2|5|3|7|4|9', '7|12|1|2|2|3', '3|10|1|4|2|5'],
      },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      c: { kind: 'choice', values: (v) => [split(v.row)[2]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[3]!] },
      e: { kind: 'choice', values: (v) => [split(v.row)[4]!] },
      f: { kind: 'choice', values: (v) => [split(v.row)[5]!] },
    },
    answer: (v) => {
      const items: Array<[number, number]> = [
        [Number(v.a), Number(v.b)],
        [Number(v.c), Number(v.d)],
        [Number(v.e), Number(v.f)],
      ];
      items.sort(([n, d], [p, q]) => n / d - p / q);
      return items.map(([n, d]) => fraction(n, d)).join(', ');
    },
    format: { kind: 'text' },
    options: (v) => {
      const items: Array<[number, number]> = [
        [Number(v.a), Number(v.b)],
        [Number(v.c), Number(v.d)],
        [Number(v.e), Number(v.f)],
      ];
      const sorted = [...items].sort(([n, d], [p, q]) => n / d - p / q);
      const right = sorted.map(([n, d]) => fraction(n, d)).join(', ');
      const wrongs = [
        [...sorted].reverse().map(([n, d]) => fraction(n, d)).join(', '),
        items.map(([n, d]) => fraction(n, d)).join(', '),
        [sorted[1], sorted[0], sorted[2]].map(([n, d]) => fraction(n!, d!)).join(', '),
      ];
      return fourOptions(right, wrongs);
    },
    explain: ({ answer }) =>
      `საერთო მნიშვნელზე მიყვანის შემდეგ ზრდადობით ასე ლაგდება: ${answer}.`,
  }),
  bank({
    id: 'g5-u07-q41',
    subtopicId: 'u07-10',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'სამი წილადიდან რომელია უდიდესი: {a}/{b}, {c}/{d}, {e}/{f}?',
    variables: {
      row: {
        kind: 'choice',
        values: ['1|2|3|4|1|4', '2|3|3|4|5|6', '1|3|1|2|2|5', '3|5|1|2|7|10',
          '2|7|1|4|3|8', '5|6|4|5|7|8', '1|5|2|9|3|10', '3|8|1|3|5|12',
          '4|9|1|2|5|9', '2|5|3|7|4|9', '7|12|1|2|2|3', '3|10|1|4|2|5'],
      },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      c: { kind: 'choice', values: (v) => [split(v.row)[2]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[3]!] },
      e: { kind: 'choice', values: (v) => [split(v.row)[4]!] },
      f: { kind: 'choice', values: (v) => [split(v.row)[5]!] },
    },
    answer: (v) => {
      const items: Array<[number, number]> = [
        [Number(v.a), Number(v.b)],
        [Number(v.c), Number(v.d)],
        [Number(v.e), Number(v.f)],
      ];
      items.sort(([n, d], [p, q]) => p / q - n / d);
      const best = items[0]!;
      return fraction(best[0], best[1]);
    },
    format: { kind: 'text' },
    options: (v) =>
      fourOptions(fraction(Number(v.a), Number(v.b)), [
        fraction(Number(v.c), Number(v.d)),
        fraction(Number(v.e), Number(v.f)),
        fraction(Number(v.a) + Number(v.c), Number(v.b) + Number(v.d)),
        fraction(Number(v.b), Number(v.a)),
      ]),
    explain: ({ answer }) =>
      `ყველა წილადს საერთო მნიშვნელზე ვიყვანთ და ვადარებთ მრიცხველებს. უდიდესია ${answer}.`,
  }),
  bank({
    id: 'g5-u07-q42',
    subtopicId: 'u07-10',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'სამი წილადიდან რომელია უმცირესი: {a}/{b}, {c}/{d}, {e}/{f}?',
    variables: {
      row: {
        kind: 'choice',
        values: ['1|2|3|4|1|4', '2|3|3|4|5|6', '1|3|1|2|2|5', '3|5|1|2|7|10',
          '2|7|1|4|3|8', '5|6|4|5|7|8', '1|5|2|9|3|10', '3|8|1|3|5|12',
          '4|9|1|2|5|9', '2|5|3|7|4|9', '7|12|1|2|2|3', '3|10|1|4|2|5'],
      },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      c: { kind: 'choice', values: (v) => [split(v.row)[2]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[3]!] },
      e: { kind: 'choice', values: (v) => [split(v.row)[4]!] },
      f: { kind: 'choice', values: (v) => [split(v.row)[5]!] },
    },
    answer: (v) => {
      const items: Array<[number, number]> = [
        [Number(v.a), Number(v.b)],
        [Number(v.c), Number(v.d)],
        [Number(v.e), Number(v.f)],
      ];
      items.sort(([n, d], [p, q]) => n / d - p / q);
      const best = items[0]!;
      return fraction(best[0], best[1]);
    },
    format: { kind: 'text' },
    options: (v) =>
      fourOptions(fraction(Number(v.a), Number(v.b)), [
        fraction(Number(v.c), Number(v.d)),
        fraction(Number(v.e), Number(v.f)),
        fraction(Number(v.a) + Number(v.c), Number(v.b) + Number(v.d)),
        fraction(Number(v.b), Number(v.a)),
      ]),
    explain: ({ answer }) => `ყველაზე პატარაა ${answer}: სწორედ ის დგას ყველაზე ახლოს ნულთან.`,
  }),

  // ─────────────── U07.11 — ურთიერთშებრუნებული ───────────────
  bank({
    id: 'g5-u07-q43',
    subtopicId: 'u07-11',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'იპოვე {n}/{d}-ის შებრუნებული წილადი.',
    variables: {
      row: { kind: 'choice', values: ['3|7', '5|9', '2|5', '8|11', '4|9', '6|13', '7|10', '5|12', '3|8', '9|14', '2|7', '11|15'] },
      n: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
    },
    answer: (v) => fraction(Number(v.d), Number(v.n)),
    format: { kind: 'text' },
    options: (v) => {
      const right = fraction(Number(v.d), Number(v.n));
      return fourOptions(right, [fraction(Number(v.n), Number(v.d)), fraction(Number(v.d), Number(v.d)), fraction(Number(v.n), Number(v.n))]);
    },
    explain: ({ vars, answer }) => `შებრუნებულ წილადში მრიცხველი და მნიშვნელი იცვლიან ადგილებს: ${vars.n}/${vars.d} → ${answer}.`,
  }),
  bank({
    id: 'g5-u07-q44',
    subtopicId: 'u07-11',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'იპოვე {n}/{d}-ის შებრუნებული წილადი.',
    variables: {
      row: { kind: 'choice', values: ['4|3', '9|5', '7|2', '11|4', '8|3', '13|6', '10|7', '12|5', '9|8', '14|9', '7|3', '15|11'] },
      n: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
    },
    answer: (v) => fraction(Number(v.d), Number(v.n)),
    format: { kind: 'text' },
    options: (v) => {
      const right = fraction(Number(v.d), Number(v.n));
      return fourOptions(right, [fraction(Number(v.n), Number(v.d)), fraction(Number(v.n), Number(v.n)), fraction(Number(v.d), Number(v.d))]);
    },
    explain: ({ vars, answer }) => `${vars.n}/${vars.d}-ის შებრუნებულია ${answer}. მათი ნამრავლი 1-ია.`,
  }),
  bank({
    id: 'g5-u07-q45',
    subtopicId: 'u07-11',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'იპოვე {w} {n}/{d}-ის შებრუნებული წილადი.',
    variables: {
      row: { kind: 'choice', values: ['2|1|3', '3|2|5', '1|3|4', '4|1|2', '2|3|7', '5|1|3', '3|4|9', '1|5|6', '4|3|5', '2|5|8', '6|1|4', '3|2|11'] },
      w: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      n: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[2]!] },
    },
    answer: (v) => {
      const n = Number(v.w) * Number(v.d) + Number(v.n);
      return fraction(Number(v.d), n);
    },
    format: { kind: 'text' },
    options: (v) => {
      const w = Number(v.w);
      const n = Number(v.n);
      const d = Number(v.d);
      const improper = w * d + n;
      const right = fraction(d, improper);
      return fourOptions(right, [fraction(improper, d), fraction(n, d), fraction(d, n)]);
    },
    explain: ({ vars, answer }) => {
      const w = Number(vars.w);
      const n = Number(vars.n);
      const d = Number(vars.d);
      return `ჯერ არაწესიერ წილადად ვწერთ: ${w * d + n}/${d}. შებრუნებულია ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u07-q46',
    subtopicId: 'u07-11',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'იპოვე არაწესიერი წილადის {n}/{d} შებრუნებული წილადი.',
    variables: {
      row: { kind: 'choice', values: ['11|4', '17|5', '13|6', '19|7', '23|8', '15|4', '21|5', '25|9', '29|12', '27|10', '31|6', '33|8'] },
      n: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
    },
    answer: (v) => fraction(Number(v.d), Number(v.n)),
    format: { kind: 'text' },
    options: (v) => {
      const right = fraction(Number(v.d), Number(v.n));
      return fourOptions(right, [fraction(Number(v.n), Number(v.d)), fraction(Number(v.n) - Number(v.d), Number(v.d)), '1']);
    },
    explain: ({ vars, answer }) => `${vars.n}/${vars.d}-ის შებრუნებულია ${answer} — ეს წილადი 1-ზე ნაკლებია.`,
  }),

  // ─────────────── U07.12 — რიცხვით ღერძზე ───────────────
  bank({
    id: 'g5-u07-q47',
    subtopicId: 'u07-12',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'მონიშნე რიცხვი {n}/{d} რიცხვით ღერძზე: ერთეულის შუაზეა, მარცხნივ თუ მარჯვნივ?',
    variables: {
      row: { kind: 'choice', values: ['1|4', '3|4', '1|5', '2|5', '3|10', '7|10', '1|8', '5|8', '2|9', '7|9', '3|7', '5|12'] },
      n: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
    },
    answer: (v) => (Number(v.n) * 2 < Number(v.d) ? 'მარცხნივ' : 'მარჯვნივ'),
    optionCount: 2,
    options: () => ['მარცხნივ', 'მარჯვნივ'],
    format: { kind: 'text' },
    explain: ({ vars, answer }) => {
      const n = Number(vars.n);
      const d = Number(vars.d);
      return `${n}/${d} ${n * 2 < d ? '<' : '>'} 1/2, ამიტომ 1/2-ის ${answer} არის.`;
    },
  }),
  bank({
    id: 'g5-u07-q48',
    subtopicId: 'u07-12',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'რიცხვით ღერძზე 0-დან 1-მდე 8 თანაბარი მონაკვეთია. რომელი წილადი შეესაბამება მესამე ნიშანს ნულიდან?',
    variables: {
      parts: { kind: 'choice', values: [8, 4, 5, 6, 10, 12, 9, 14] },
      mark: { kind: 'choice', values: [1, 2, 3, 4, 5, 6, 7, 8] },
      sparts: shownVar('parts'),
      smark: shownVar('mark'),
    },
    answer: (v) => {
      const parts = Number(v.parts);
      const mark = Number(v.mark);
      return fraction(Math.min(mark, parts - 1), parts);
    },
    options: (v) => {
      const parts = Number(v.parts);
      const mark = Number(v.mark);
      const right = fraction(Math.min(mark, parts - 1), parts);
      const wrongs = [
        fraction(Math.min(mark, parts - 1) + 1, parts),
        fraction(Math.min(mark, parts - 1), parts + 1),
        fraction(Math.min(mark, parts - 1) + 2, parts),
      ];
      return fourOptions(right, wrongs);
    },
    format: { kind: 'text' },
    explain: ({ vars, answer }) =>
      `მონაკვეთი ${vars.sparts}-ია, ამიტომ მნიშვნელი ${vars.sparts}. ნიშანი ${vars.smark} — მრიცხველი ${vars.smark}. პასუხი: ${answer}.`,
  }),
  bank({
    id: 'g5-u07-q49',
    subtopicId: 'u07-12',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'რომელი წილადი დგას რიცხვით ღერძზე 1-სა და 2-ს შორის?',
    variables: {
      row: { kind: 'choice', values: ['7|3', '9|4', '13|6', '11|12', '5|4', '17|8', '8|9', '19|10', '9|7', '21|11', '15|16', '13|12'] },
      n: { kind: 'choice', values: (v) => [split(v.row)[0]!] },
      d: { kind: 'choice', values: (v) => [split(v.row)[1]!] },
    },
    answer: (v) => fraction(Number(v.n), Number(v.d)),
    format: { kind: 'text' },
    options: (v) => {
      const n = Number(v.n);
      const d = Number(v.d);
      const right = fraction(n, d);
      return fourOptions(right, [fraction(n - d + 1, d), fraction(d, d), fraction(n, d + 1)]);
    },
    explain: ({ answer }) =>
      `1-სა და 2-ს შორისაა წილადი, რომლის მრიცხველი მნიშვნელზე მეტია, მაგრამ 2 მნიშვნელზე ნაკლები. ესაა ${answer}.`,
  }),
  bank({
    id: 'g5-u07-q50',
    subtopicId: 'u07-12',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'მონაკვეთი 0-სა და 1-ს შორის {sparts} თანაბარ ნაწილადაა დაყოფილი. რომელ წილადს შეესაბამება {smark}-ე ნიშანი?',
    variables: {
      parts: { kind: 'choice', values: [6, 8, 9, 10, 12, 15, 16, 18] },
      mark: { kind: 'choice', values: [1, 2, 3, 4, 5, 6, 7, 8] },
      sparts: shownVar('parts'),
      smark: shownVar('mark'),
    },
    answer: (v) => {
      const parts = Number(v.parts);
      const mark = Number(v.mark);
      return fraction(Math.min(mark, parts - 1), parts);
    },
    options: (v) => {
      const parts = Number(v.parts);
      const mark = Number(v.mark);
      const right = fraction(Math.min(mark, parts - 1), parts);
      const wrongs = [
        fraction(Math.min(mark, parts - 1), parts - 1),
        fraction(Math.min(mark, parts - 1) + 1, parts),
        fraction(parts, Math.min(mark, parts - 1)),
      ];
      return fourOptions(right, wrongs);
    },
    format: { kind: 'text' },
    explain: ({ vars, answer }) => `${vars.sparts} ნაწილი — მნიშვნელი ${vars.sparts}; ${vars.smark} ნაწილი გავიარეთ. პასუხი: ${answer}.`,
  }),
];

void widen;
void shownList;
void LESS;
void EQUAL;
void shown;
