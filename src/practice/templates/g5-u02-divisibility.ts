import type { QuestionTemplate } from './types';
import {
  bank,
  digitSum,
  divisorsOf,
  factorize,
  gcd,
  isPrime,
  lcm,
  nearMisses,
  num,
  wrongNumbers,
} from './g5-helpers';

/**
 * Grade V — Unit 02: გამყოფები, ჯერადები და გაყოფადობის ნიშნები
 * (divisors, multiples and divisibility tests).
 *
 * Converted from the academy's `U02` bank (9 subtopics × 6 questions). The bank
 * states each question with fixed numbers; a template states the *pattern* and
 * draws its own numbers, so the six bank questions become six question types
 * that each replay with fresh values.
 *
 * Two rules this unit taught the hard way:
 *   • every number the student sees comes from a variable — a number typed into
 *     the prompt collapses the template to a single variation;
 *   • every template needs at least twelve distinct draws of its own, because a
 *     session previews forty and refuses to ship one that folds.
 */

export const G5_U02_SUBTOPICS = [
  'u02-01',
  'u02-02',
  'u02-03',
  'u02-04',
  'u02-05',
  'u02-06',
  'u02-07',
  'u02-08',
  'u02-09',
] as const;

export type G5U02SubtopicId = (typeof G5_U02_SUBTOPICS)[number];

const TOPIC = 'g5-divisibility';

const YES = 'დიახ';
const NO = 'არა';
const YES_NO = [YES, NO];

const PRIME_OPTIONS = ['მარტივი', 'შედგენილი'];
const primeLabel = (n: number): string => (isPrime(n) ? 'მარტივი' : 'შედგენილი');
const yesNo = (ok: boolean): string => (ok ? YES : NO);

const split = (row: unknown): [number, number] => {
  const [a, b] = String(row).split('|').map(Number);
  return [a!, b!];
};

/** Numbers whose divisors are worth asking about: composite, no trivia. */
const COMPOSITES = [
  12, 16, 18, 20, 24, 28, 30, 32, 36, 40, 42, 44, 45, 48, 50, 54,
  56, 60, 63, 70, 72, 75, 84, 90, 96, 100, 108, 120, 126, 144,
];

const FACTORABLE = [
  12, 18, 20, 24, 28, 30, 36, 40, 42, 44, 45, 48, 50, 52, 54, 56,
  60, 63, 68, 70, 72, 75, 78, 84, 90, 96, 98, 100, 105, 108,
];

const gcdPairs = [
  '12|18', '20|30', '24|36', '15|25', '42|56', '32|48', '18|27', '36|45',
  '28|42', '16|24', '45|60', '21|35', '30|45', '54|72', '8|20', '14|49',
  '24|40', '27|63',
];

const lcmPairs = [
  '4|6', '5|8', '9|12', '6|15', '14|21', '8|18', '10|15', '12|18',
  '7|9', '16|24', '20|25', '3|11', '6|9', '10|12', '15|20', '8|14',
  '4|10', '9|15',
];

const productPairs = [
  '12|18', '20|30', '24|36', '15|25', '42|56', '32|48', '18|27', '36|45',
  '16|24', '45|60', '28|42', '21|35',
];

/** Four-digit and three-digit numbers for the divisibility tests. */
const bigNumbers = (): { kind: 'int'; min: number; max: number } => ({ kind: 'int', min: 101, max: 9999 });

/** Heads for `{head}□` questions; each yields a single valid digit. */
const DIGIT_HEADS_4 = [
  312, 425, 536, 648, 752, 864, 147, 286, 593, 124, 238, 359, 461, 572, 683, 794,
];
const DIGIT_HEADS_9 = [
  421, 512, 603, 734, 845, 946, 182, 273, 364, 655, 126, 217, 308, 489, 570, 651,
];
const DIGIT_HEADS_3 = [
  124, 237, 451, 603, 712, 815, 926, 341, 528, 619, 706, 893, 185, 264, 347, 438,
];
const DIGIT_HEADS_6 = [
  241, 313, 452, 523, 631, 714, 842, 923, 154, 362, 731, 584, 691, 462, 823, 175,
];

/** The smallest digit that makes `head·10 + d` divisible by `divisor`. */
const smallestDigit = (head: number, divisor: number): number => {
  for (let d = 0; d <= 9; d += 1) if ((head * 10 + d) % divisor === 0) return d;
  return 0;
};

export const G5_U02_TEMPLATES: QuestionTemplate[] = [
  // ─────────────── U02.1 — მარტივი და შედგენილი რიცხვები ───────────────
  bank({
    id: 'g5-u02-q01',
    subtopicId: 'u02-01',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'განსაზღვრე, მარტივია თუ შედგენილი რიცხვი {n}.',
    variables: { n: { kind: 'int', min: 10, max: 120 } },
    answer: (v) => primeLabel(num(v, 'n')),
    optionCount: 2,
    options: () => PRIME_OPTIONS,
    format: { kind: 'text' },
    explain: ({ vars, answer }) => {
      const n = num(vars, 'n');
      return isPrime(n)
        ? `${n}-ს მხოლოდ ორი გამყოფი აქვს — 1 და ${n}. ამიტომ ${answer}ია.`
        : `${n} = ${factorize(n).join(' × ')}, ამიტომ ${answer}ია.`;
    },
  }),
  bank({
    id: 'g5-u02-q02',
    subtopicId: 'u02-01',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ჩამოთვალე {n} რიცხვის ყველა გამყოფი. რომელია მათგან ყველაზე დიდი მარტივი რიცხვი?',
    variables: { n: { kind: 'choice', values: COMPOSITES } },
    answer: (v) => {
      const primes = divisorsOf(num(v, 'n')).filter((d) => isPrime(d));
      return primes[primes.length - 1] ?? 1;
    },
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const n = Number(ctx.vars.n);
      const primes = divisorsOf(n).filter((d) => isPrime(d));
      const smaller = primes.slice(0, -1).reverse();
      const notDivisors = [n + 1, n + 3, n + 7].filter((x) => n % x !== 0 && isPrime(x));
      return wrongNumbers([...smaller, ...notDivisors, factorize(n)[0] ?? 2]);
    },
    explain: ({ vars, answer }) => {
      const n = num(vars, 'n');
      const primes = divisorsOf(n).filter((d) => isPrime(d));
      return `${n}-ის მარტივი გამყოფებია: ${primes.join(', ')}. ყველაზე დიდია ${answer}.`;
    },
  }),

  // ─────────────── U02.2 — გამყოფები და ჯერადები ───────────────
  bank({
    id: 'g5-u02-q03',
    subtopicId: 'u02-02',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'ჩამოთვალე {n}-ის ყველა დადებითი გამყოფი. რამდენია მათი რაოდენობა?',
    variables: { n: { kind: 'choice', values: COMPOSITES } },
    answer: (v) => divisorsOf(num(v, 'n')).length,
    format: { kind: 'integer', min: 2 },
    distractors: (ctx) => wrongNumbers(nearMisses(Number(ctx.answer), 3, 1, 2)),
    explain: ({ vars, answer }) => {
      const n = num(vars, 'n');
      return `${n}-ის გამყოფებია: ${divisorsOf(n).join(', ')}. სულ ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u02-q04',
    subtopicId: 'u02-02',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'ჩამოწერე {n}-ის ყველა დადებითი გამყოფი. რომელია მათგან უდიდესი?',
    variables: { n: { kind: 'choice', values: [12, 16, 18, 20, 24, 28, 30, 32, 36, 40, 42, 48, 54, 60, 72, 90] } },
    answer: (v) => num(v, 'n'),
    format: { kind: 'integer', min: 2 },
    distractors: (ctx) => {
      const n = Number(ctx.answer);
      const rest = divisorsOf(n).slice(0, -1).reverse();
      return wrongNumbers([...rest.slice(0, 2), n * 2, n / 2]);
    },
    explain: ({ vars, answer }) =>
      `ყოველი რიცხვი თავის თავზე იყოფა, ამიტომ ${vars.n}-ის უდიდესი გამყოფი თავად ${answer}-ია.`,
  }),
  bank({
    id: 'g5-u02-q05',
    subtopicId: 'u02-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'არის თუ არა {n} რიცხვი {d}-ის ჯერადი?',
    variables: {
      n: { kind: 'int', min: 12, max: 120 },
      d: { kind: 'choice', values: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
    },
    answer: (v) => yesNo(num(v, 'n') % num(v, 'd') === 0),
    optionCount: 2,
    options: () => YES_NO,
    format: { kind: 'text' },
    explain: ({ vars, answer }) => {
      const n = num(vars, 'n');
      const d = num(vars, 'd');
      const rem = n % d;
      return rem === 0
        ? `${n} ÷ ${d} = ${n / d} უნაშთოდ, ამიტომ ${answer}.`
        : `${n} ÷ ${d} = ${Math.floor(n / d)} და ნაშთი ${rem}, ამიტომ ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u02-q06',
    subtopicId: 'u02-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: '{d}-ის ჯერადებს შორის რომელია ყველაზე პატარა ის, რომელიც 50-ზე მეტია?',
    variables: { d: { kind: 'int', min: 4, max: 24 } },
    answer: (v) => {
      const d = num(v, 'd');
      return (Math.floor(50 / d) + 1) * d;
    },
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const d = Number(ctx.vars.d);
      const base = Number(ctx.answer);
      return wrongNumbers([base - d, base + d, base - 1, base + 1, Math.floor(50 / d) * d]);
    },
    explain: ({ vars, answer }) => {
      const d = num(vars, 'd');
      return `${d} × ${Number(answer) / d} = ${answer} — ეს არის ${d}-ის უმცირესი ჯერადი, რომელიც 50-ზე მეტია.`;
    },
  }),
  bank({
    id: 'g5-u02-q07',
    subtopicId: 'u02-02',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'რამდენი დადებითი გამყოფი აქვს რიცხვს {n}?',
    variables: { n: { kind: 'choice', values: FACTORABLE } },
    answer: (v) => divisorsOf(num(v, 'n')).length,
    format: { kind: 'integer', min: 2 },
    distractors: (ctx) => wrongNumbers(nearMisses(Number(ctx.answer), 3, 1, 2)),
    explain: ({ vars, answer }) => {
      const n = num(vars, 'n');
      return `${n}-ის გამყოფებია ${divisorsOf(n).join(', ')} — სულ ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u02-q08',
    subtopicId: 'u02-02',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ჩამოწერე {n}-ის ყველა გამყოფი. რას უდრის მათი ჯამი?',
    variables: { n: { kind: 'choice', values: [12, 16, 18, 20, 24, 28, 30, 32, 36, 40, 42, 48, 54, 60, 72, 90] } },
    answer: (v) => divisorsOf(num(v, 'n')).reduce((s, d) => s + d, 0),
    format: { kind: 'integer', min: 2 },
    distractors: (ctx) => {
      const ans = Number(ctx.answer);
      return wrongNumbers([ans + 1, ans - 1, ans + Number(ctx.vars.n), ans * 2]);
    },
    explain: ({ vars, answer }) => {
      const n = num(vars, 'n');
      return `${n}-ის გამყოფებია ${divisorsOf(n).join(', ')}. ჯამი: ${answer}.`;
    },
  }),

  // ─────────────── U02.3 — მარტივ მამრავლებად დაშლა ───────────────
  bank({
    id: 'g5-u02-q09',
    subtopicId: 'u02-03',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'დაშალე {n} მარტივ მამრავლებად.',
    variables: { n: { kind: 'choice', values: FACTORABLE } },
    answer: (v) => factorize(num(v, 'n')).join(' × '),
    format: { kind: 'text' },
    options: (v) => {
      const n = num(v, 'n');
      const right = factorize(n).join(' × ');
      const wrongs = [
        factorize(n + 2).join(' × '),
        factorize(n * 2).join(' × '),
        [1, ...factorize(n)].join(' × '),
      ];
      return [...new Set([right, ...wrongs])];
    },
    explain: ({ vars, answer }) => `${vars.n} = ${answer} — ყველა მამრავლი მარტივია.`,
  }),
  bank({
    id: 'g5-u02-q10',
    subtopicId: 'u02-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'რომელი მარტივი რიცხვი მეორდება {n}-ის დაშლაში ყველაზე მეტჯერ?',
    variables: { n: { kind: 'choice', values: [12, 24, 48, 96, 125, 250, 81, 243, 72, 100, 128, 500, 108, 112, 147, 162] } },
    answer: (v) => {
      const counts = new Map<number, number>();
      for (const p of factorize(num(v, 'n'))) counts.set(p, (counts.get(p) ?? 0) + 1);
      let best = 2;
      let bestCount = 0;
      for (const [p, c] of counts) if (c > bestCount) [best, bestCount] = [p, c];
      return best;
    },
    format: { kind: 'integer', min: 2 },
    distractors: (ctx) => {
      const n = Number(ctx.vars.n);
      const other = [...new Set(factorize(n))].filter((p) => p !== Number(ctx.answer));
      return wrongNumbers([...other, 2, 3, 5, 7]);
    },
    explain: ({ vars, answer }) => {
      const n = num(vars, 'n');
      return `${n} = ${factorize(n).join(' × ')}. ყველაზე ხშირად ${answer} მეორდება.`;
    },
  }),
  bank({
    id: 'g5-u02-q11',
    subtopicId: 'u02-03',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'რამდენი მარტივი მამრავლის ნამრავლია რიცხვი {n}?',
    variables: { n: { kind: 'choice', values: [12, 18, 20, 24, 30, 36, 42, 48, 54, 60, 64, 72, 75, 90, 100, 126, 180, 210, 225, 350] } },
    answer: (v) => factorize(num(v, 'n')).length,
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => wrongNumbers(nearMisses(Number(ctx.answer), 3, 1, 1)),
    explain: ({ vars, answer }) => {
      const n = num(vars, 'n');
      return `${n} = ${factorize(n).join(' × ')} — სულ ${answer} მამრავლი.`;
    },
  }),

  // ─────────────── U02.4 — უდიდესი საერთო გამყოფი ───────────────
  bank({
    id: 'g5-u02-q12',
    subtopicId: 'u02-04',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'იპოვე {a}-ისა და {b}-ის უდიდესი საერთო გამყოფი.',
    variables: {
      row: { kind: 'choice', values: gcdPairs },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]] },
    },
    answer: (v) => gcd(num(v, 'a'), num(v, 'b')),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      const right = gcd(a, b);
      return wrongNumbers([a * b, Math.max(a, b), 2, right * 2, right + 1, Math.min(a, b)]);
    },
    explain: ({ vars, answer }) =>
      `${vars.a} = ${factorize(Number(vars.a)).join(' × ')}; ${vars.b} = ${factorize(Number(vars.b)).join(' × ')}. საერთო მამრავლების ნამრავლია ${answer}.`,
  }),
  bank({
    id: 'g5-u02-q13',
    subtopicId: 'u02-04',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'იპოვე {a}-ისა და {b}-ის საერთო გამყოფებს შორის უდიდესი.',
    variables: {
      row: { kind: 'choice', values: gcdPairs },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]] },
    },
    answer: (v) => Math.max(1, gcd(num(v, 'a'), num(v, 'b'))),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      return wrongNumbers([a + b, Math.min(a, b), a * b, gcd(a, b) + 2]);
    },
    explain: ({ vars, answer }) => {
      const a = Number(vars.a);
      const b = Number(vars.b);
      return `საერთო გამყოფებს შორის უდიდესია ${answer}: ${a} ÷ ${answer} = ${a / Number(answer)}, ${b} ÷ ${answer} = ${b / Number(answer)}.`;
    },
  }),
  bank({
    id: 'g5-u02-q14',
    subtopicId: 'u02-04',
    topicId: TOPIC,
    difficulty: 3,
    prompt: '{a} და {b} ერთმანეთის უბრალო რიცხვები არიან. რას უდრის მათი უდიდესი საერთო გამყოფი?',
    variables: {
      row: { kind: 'choice', values: ['8|9', '5|7', '9|10', '7|11', '4|9', '7|8', '5|12', '9|11', '8|15', '13|14', '11|13', '16|21'] },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]] },
    },
    answer: (v) => gcd(num(v, 'a'), num(v, 'b')),
    format: { kind: 'integer', min: 1 },
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      return wrongNumbers([a * b, a, b, a + b, 2]);
    },
    explain: ({ answer }) =>
      `უბრალო რიცხვებს საერთო მამრავლი არ აქვთ, ამიტომ უსგ ყოველთვის 1-ია. პასუხი: ${answer}.`,
  }),

  // ─────────────── U02.5 — უმცირესი საერთო ჯერადი ───────────────
  bank({
    id: 'g5-u02-q15',
    subtopicId: 'u02-05',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'იპოვე {a}-ისა და {b}-ის უმცირესი საერთო ჯერადი.',
    variables: {
      row: { kind: 'choice', values: lcmPairs },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]] },
    },
    answer: (v) => lcm(num(v, 'a'), num(v, 'b')),
    format: { kind: 'integer', min: 2 },
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      return wrongNumbers([a * b, gcd(a, b), lcm(a, b) + a, lcm(a, b) - b, a + b]);
    },
    explain: ({ vars, answer }) =>
      `${vars.a}-ისა და ${vars.b}-ის საერთო ჯერადებს შორის უმცირესია ${answer}.`,
  }),
  bank({
    id: 'g5-u02-q16',
    subtopicId: 'u02-05',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ორი ზარი რეკავს: ერთი ყოველ {a} წუთში, მეორე — ყოველ {b} წუთში. ახლა ერთად დარეკეს. რამდენ წუთში დარეკავენ ისევ ერთად?',
    variables: {
      row: { kind: 'choice', values: lcmPairs },
      a: { kind: 'choice', values: (v) => [split(v.row)[0]] },
      b: { kind: 'choice', values: (v) => [split(v.row)[1]] },
    },
    answer: (v) => lcm(num(v, 'a'), num(v, 'b')),
    format: { kind: 'integer', min: 2 },
    distractors: (ctx) => {
      const a = Number(ctx.vars.a);
      const b = Number(ctx.vars.b);
      return wrongNumbers([a + b, a * b, gcd(a, b), lcm(a, b) + a]);
    },
    explain: ({ vars, answer }) =>
      `ვეძებთ ${vars.a}-ისა და ${vars.b}-ის უმცირეს საერთო ჯერადს: ${answer} წუთში.`,
  }),
  bank({
    id: 'g5-u02-q17',
    subtopicId: 'u02-05',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'ორი რიცხვის ნამრავლია {p}, უდიდესი საერთო გამყოფი კი — {g}. რას უდრის მათი უმცირესი საერთო ჯერადი?',
    variables: {
      pair: { kind: 'choice', values: productPairs },
      p: { kind: 'choice', values: (v) => [split(v.pair)[0] * split(v.pair)[1]] },
      g: { kind: 'choice', values: (v) => [gcd(split(v.pair)[0], split(v.pair)[1])] },
    },
    answer: (v) => lcm(split(v.pair)[0], split(v.pair)[1]),
    format: { kind: 'integer', min: 2 },
    distractors: (ctx) => {
      const [a, b] = split(ctx.vars.pair);
      return wrongNumbers([a * b, gcd(a, b), a + b, lcm(a, b) - 2, lcm(a, b) + gcd(a, b)]);
    },
    explain: ({ vars, answer }) => {
      const [a, b] = split(vars.pair);
      return `უსგ × უსჯ = ${a} × ${b}, ამიტომ უსჯ = ${a * b} ÷ ${gcd(a, b)} = ${answer}.`;
    },
  }),

  // ─────────────── U02.6 — 2-ზე და 4-ზე გაყოფადობა ───────────────
  bank({
    id: 'g5-u02-q18',
    subtopicId: 'u02-06',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'იყოფა თუ არა {n} უნაშთოდ 2-ზე?',
    variables: { n: bigNumbers() },
    answer: (v) => yesNo(num(v, 'n') % 2 === 0),
    optionCount: 2,
    options: () => YES_NO,
    format: { kind: 'text' },
    explain: ({ vars, answer }) => {
      const n = num(vars, 'n');
      const last = n % 10;
      return `ბოლო ციფრია ${last}. ${last % 2 === 0 ? 'ლუწია' : 'კენტია'}, ამიტომ ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u02-q19',
    subtopicId: 'u02-06',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'იყოფა თუ არა {n} უნაშთოდ 4-ზე?',
    variables: { n: bigNumbers() },
    answer: (v) => yesNo(num(v, 'n') % 4 === 0),
    optionCount: 2,
    options: () => YES_NO,
    format: { kind: 'text' },
    explain: ({ vars, answer }) => {
      const n = num(vars, 'n');
      const lastTwo = n % 100;
      return `ბოლო ორი ციფრია ${String(lastTwo).padStart(2, '0')}. ეს რიცხვი ${lastTwo % 4 === 0 ? 'იყოფა' : 'არ იყოფა'} 4-ზე, ამიტომ ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u02-q20',
    subtopicId: 'u02-06',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ჩასვი ციფრი □-ის ნაცვლად, რომ {head}□ იყოფოდეს 4-ზე. იპოვე ყველაზე პატარა ასეთი ციფრი.',
    variables: { head: { kind: 'choice', values: DIGIT_HEADS_4 } },
    answer: (v) => {
      const head = num(v, 'head');
      for (let d = 0; d <= 9; d += 1) if ((head * 10 + d) % 4 === 0) return d;
      return 0;
    },
    format: { kind: 'integer', min: 0, max: 9 },
    distractors: () => wrongNumbers([1, 2, 3, 5, 7]),
    explain: ({ vars, answer }) => {
      const head = num(vars, 'head');
      const made = head * 10 + Number(answer);
      return `ბოლო ორი ციფრია ${String(made % 100).padStart(2, '0')}; ${made} იყოფა 4-ზე, ამიტომ ციფრია ${answer}.`;
    },
  }),

  // ─────────────── U02.7 — 3-ზე და 9-ზე გაყოფადობა ───────────────
  bank({
    id: 'g5-u02-q21',
    subtopicId: 'u02-07',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'იყოფა თუ არა {n} უნაშთოდ 3-ზე?',
    variables: { n: bigNumbers() },
    answer: (v) => yesNo(digitSum(num(v, 'n')) % 3 === 0),
    optionCount: 2,
    options: () => YES_NO,
    format: { kind: 'text' },
    explain: ({ vars, answer }) => {
      const sum = digitSum(num(vars, 'n'));
      return `ციფრთა ჯამია ${sum}. ${sum} ${sum % 3 === 0 ? 'იყოფა' : 'არ იყოფა'} 3-ზე, ამიტომ ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u02-q22',
    subtopicId: 'u02-07',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'იყოფა თუ არა {n} უნაშთოდ 9-ზე?',
    variables: { n: bigNumbers() },
    answer: (v) => yesNo(digitSum(num(v, 'n')) % 9 === 0),
    optionCount: 2,
    options: () => YES_NO,
    format: { kind: 'text' },
    explain: ({ vars, answer }) => {
      const sum = digitSum(num(vars, 'n'));
      return `ციფრთა ჯამია ${sum}. ${sum} ${sum % 9 === 0 ? 'იყოფა' : 'არ იყოფა'} 9-ზე, ამიტომ ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u02-q23',
    subtopicId: 'u02-07',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ჩასვი ციფრი □-ის ნაცვლად, რომ {head}□ იყოფოდეს 9-ზე. იპოვე ყველაზე პატარა ასეთი ციფრი.',
    variables: { head: { kind: 'choice', values: DIGIT_HEADS_9 } },
    answer: (v) => smallestDigit(num(v, 'head'), 9),
    format: { kind: 'integer', min: 0, max: 9 },
    distractors: () => wrongNumbers([1, 2, 3, 5, 8]),
    explain: ({ vars, answer }) => {
      const head = num(vars, 'head');
      return `ციფრთა ჯამი უნდა გაიყოს 9-ზე: ${digitSum(head)} + ${answer} = ${digitSum(head) + Number(answer)}.`;
    },
  }),
  bank({
    id: 'g5-u02-q24',
    subtopicId: 'u02-07',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'იპოვე ყველაზე პატარა ციფრი, რომელიც □-ის ნაცვლად უნდა ჩაისვას, რომ {head}□ იყოფოდეს 3-ზე.',
    variables: { head: { kind: 'choice', values: DIGIT_HEADS_3 } },
    answer: (v) => smallestDigit(num(v, 'head'), 3),
    format: { kind: 'integer', min: 0, max: 9 },
    distractors: () => wrongNumbers([1, 2, 4, 6, 9]),
    explain: ({ vars, answer }) => {
      const head = num(vars, 'head');
      return `ციფრთა ჯამია ${digitSum(head)} + ${answer} = ${digitSum(head) + Number(answer)}, რომელიც 3-ზე იყოფა.`;
    },
  }),

  // ─────────────── U02.8 — 5-ზე და 10-ზე გაყოფადობა ───────────────
  bank({
    id: 'g5-u02-q25',
    subtopicId: 'u02-08',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'იყოფა თუ არა {n} უნაშთოდ 5-ზე?',
    variables: { n: bigNumbers() },
    answer: (v) => yesNo(num(v, 'n') % 5 === 0),
    optionCount: 2,
    options: () => YES_NO,
    format: { kind: 'text' },
    explain: ({ vars, answer }) => {
      const last = num(vars, 'n') % 10;
      return `ბოლო ციფრია ${last}. 5-ზე იყოფა მხოლოდ 0-ით ან 5-ით დამთავრებული რიცხვი, ამიტომ ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u02-q26',
    subtopicId: 'u02-08',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'იყოფა თუ არა {n} უნაშთოდ 10-ზე?',
    variables: { n: bigNumbers() },
    answer: (v) => yesNo(num(v, 'n') % 10 === 0),
    optionCount: 2,
    options: () => YES_NO,
    format: { kind: 'text' },
    explain: ({ vars, answer }) => {
      const last = num(vars, 'n') % 10;
      return `ბოლო ციფრია ${last}. 10-ზე იყოფა მხოლოდ 0-ით დამთავრებული რიცხვი, ამიტომ ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u02-q27',
    subtopicId: 'u02-08',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'რამდენი ერთეულით უნდა გავზარდოთ {n}, რომ მივიღოთ უმცირესი 10-ზე გაყოფადი რიცხვი?',
    variables: { n: { kind: 'int', min: 101, max: 999 } },
    answer: (v) => 10 - (num(v, 'n') % 10),
    format: { kind: 'integer', min: 0, max: 10 },
    distractors: (ctx) => {
      const n = Number(ctx.vars.n);
      const right = 10 - (n % 10);
      return wrongNumbers([right + 1, right + 2, right - 1, n % 10, 10 - right]);
    },
    explain: ({ vars, answer }) => {
      const n = num(vars, 'n');
      return `${n} + ${answer} = ${n + Number(answer)}, რომელიც 0-ით მთავრდება და ამიტომ 10-ზე იყოფა.`;
    },
  }),
  bank({
    id: 'g5-u02-q28',
    subtopicId: 'u02-08',
    topicId: TOPIC,
    difficulty: 3,
    prompt: '{n}-ის სამეზობლოში რომელი რიცხვი იყოფა ერთდროულად 5-ზეც და 10-ზეც?',
    variables: { n: { kind: 'int', min: 11, max: 998 } },
    answer: (v) => String(num(v, 'n') - (num(v, 'n') % 10)),
    format: { kind: 'text' },
    options: (v) => {
      const n = num(v, 'n');
      const base = n - (n % 10);
      return [...new Set([String(base), String(base + 5), String(base + 1), String(base + 9)])];
    },
    explain: ({ answer }) => `10-ზე იყოფა 0-ით დამთავრებული რიცხვი; ${answer} 5-ზეც იყოფა.`,
  }),

  // ─────────────── U02.9 — 6-ზე გაყოფადობა ───────────────
  bank({
    id: 'g5-u02-q29',
    subtopicId: 'u02-09',
    topicId: TOPIC,
    difficulty: 1,
    prompt: 'იყოფა თუ არა {n} უნაშთოდ 6-ზე?',
    variables: { n: bigNumbers() },
    answer: (v) => yesNo(num(v, 'n') % 6 === 0),
    optionCount: 2,
    options: () => YES_NO,
    format: { kind: 'text' },
    explain: ({ vars, answer }) => {
      const n = num(vars, 'n');
      const even = n % 2 === 0;
      const byThree = digitSum(n) % 3 === 0;
      return `6-ზე იყოფა რიცხვი, რომელიც 2-ზეც და 3-ზეც იყოფა. ${n} ${even ? 'ლუწია' : 'კენტია'}, ციფრთა ჯამი ${digitSum(n)} ${byThree ? 'იყოფა' : 'არ იყოფა'} 3-ზე, ამიტომ ${answer}.`;
    },
  }),
  bank({
    id: 'g5-u02-q30',
    subtopicId: 'u02-09',
    topicId: TOPIC,
    difficulty: 2,
    prompt: '{n}-ის სამეზობლოში რომელი რიცხვი იყოფა 6-ზე?',
    variables: { n: { kind: 'int', min: 101, max: 999 } },
    answer: (v) => String(num(v, 'n') - (num(v, 'n') % 6)),
    format: { kind: 'text' },
    options: (v) => {
      const n = num(v, 'n');
      const base = n - (n % 6);
      return [...new Set([String(base), String(base + 1), String(base + 2), String(base + 3)])];
    },
    explain: ({ answer }) => `6-ზე იყოფა ლუწი რიცხვი, რომლის ციფრთა ჯამიც 3-ზე იყოფა. ასეთია ${answer}.`,
  }),
  bank({
    id: 'g5-u02-q31',
    subtopicId: 'u02-09',
    topicId: TOPIC,
    difficulty: 2,
    prompt: 'ჩასვი ციფრი □-ის ნაცვლად, რომ {head}□ იყოფოდეს 6-ზე. იპოვე ყველაზე პატარა ასეთი ციფრი.',
    variables: { head: { kind: 'choice', values: DIGIT_HEADS_6 } },
    answer: (v) => smallestDigit(num(v, 'head'), 6),
    format: { kind: 'integer', min: 0, max: 9 },
    distractors: () => wrongNumbers([1, 2, 3, 7, 9]),
    explain: ({ vars, answer }) => {
      const head = num(vars, 'head');
      const made = head * 10 + Number(answer);
      return `${made} ლუწია და ციფრთა ჯამი ${digitSum(made)} 3-ზე იყოფა, ამიტომ ${made} იყოფა 6-ზე.`;
    },
  }),
  bank({
    id: 'g5-u02-q32',
    subtopicId: 'u02-09',
    topicId: TOPIC,
    difficulty: 3,
    prompt: 'რამდენი ერთეულით უნდა გავზარდოთ {n}, რომ მივიღოთ უმცირესი 6-ზე გაყოფადი რიცხვი?',
    variables: { n: { kind: 'int', min: 101, max: 999 } },
    answer: (v) => {
      const n = num(v, 'n');
      const rest = n % 6;
      return rest === 0 ? 6 : 6 - rest;
    },
    format: { kind: 'integer', min: 1, max: 6 },
    distractors: (ctx) => {
      const n = Number(ctx.vars.n);
      const right = Number(ctx.answer);
      return wrongNumbers([right + 1, right + 2, right - 1, n % 6, 6 - (n % 6)]);
    },
    explain: ({ vars, answer }) => {
      const n = num(vars, 'n');
      return `${n} + ${answer} = ${n + Number(answer)}, რომელიც 6-ზე იყოფა.`;
    },
  }),
];
