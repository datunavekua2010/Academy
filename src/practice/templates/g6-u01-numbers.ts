import type { QuestionTemplate, Vars } from './types';
import {
  C, D, F, I, MINUS, N, S, SIGNS, SPEC, dec, decToFrac, digitsOf, divisorsOf, fAdd, fMul, fSub, fText, fr,
  factorize, gcd, georgianWords, isPrime, lcm, listText, par, powerText, q6, rawF, readNumber, roman, sampleBy,
  sg, sign3, swapAdjacent,
} from './g6-helpers';

/**
 * Grade VI — Unit 1: რიცხვები (numbers).
 *
 * Converted from the academy's `U01` bank: 10 subtopics × 6 questions.
 *
 * The bank gives six fixed questions per subtopic. Each is turned into a
 * *pattern* whose numbers are drawn, with the key and every wrong option
 * computed from the same drawn values. A wrong option is a mistake a student
 * really makes — adding the signs instead of subtracting, reading „XL" as
 * 50 + 10, keeping a composite factor in a factorisation — not a random
 * neighbour of the answer.
 */

export const G6_U01_SUBTOPICS = [
  'u01-01', 'u01-02', 'u01-03', 'u01-04', 'u01-05',
  'u01-06', 'u01-07', 'u01-08', 'u01-09', 'u01-10',
] as const;

const T = 'g6-numbers';
let seq = 0;
const nextId = (): string => `g6-u01-q${String(++seq).padStart(2, '0')}`;

type Spec = Omit<Parameters<typeof q6>[0], 'id' | 'topic'>;
const t = (spec: Spec): QuestionTemplate => q6({ id: nextId(), topic: T, ...spec });

const POWERS = [1, 10, 100, 1000, 10000, 100000, 1000000];
const PLACES = [
  'ერთეულების', 'ათეულების', 'ასეულების', 'ათასეულების', 'ათიათასეულების', 'ასიათასეულების', 'მილიონეულების',
];

/** A number whose digits are all different, derived from a seed (so a pick is reproducible). */
const distinctNumber = (seed: number, length: number): number => {
  const digits = sampleBy([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], seed, length);
  if (digits[0] === 0) [digits[0], digits[1]] = [digits[1]!, digits[0]!];
  return Number(digits.join(''));
};

const PRIMES = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
const ODD_COMPOSITES = [15, 21, 25, 27, 33, 35, 39, 45, 49, 51, 55, 57, 63, 65, 69, 75, 77, 85, 87, 91, 93, 95, 99];

/** Roman numeral written without subtraction: 49 → XXXXVIIII. */
const additiveRoman = (n: number): string => {
  let rest = n;
  let out = '';
  for (const [value, text] of [[50, 'L'], [10, 'X'], [5, 'V'], [1, 'I']] as Array<[number, string]>) {
    while (rest >= value) {
      out += text;
      rest -= value;
    }
  }
  return out;
};

/** What a student gets by adding every symbol of a Roman numeral. */
const sumAllSymbols = (text: string): number => {
  const value: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100 };
  return text.split('').reduce((sum, ch) => sum + (value[ch] ?? 0), 0);
};

const expandTerms = (n: number): number[] =>
  digitsOf(n)
    .map((digit, index, all) => digit * 10 ** (all.length - 1 - index))
    .filter((value) => value !== 0);

/** `n^e` as a student reads it: the exponent 1 is not written. */
const pw = (base: number, exponent: number): string => (exponent === 1 ? String(base) : powerText(base, exponent));

const orderWords = (v: Vars): string => (String(v.dir) === 'asc' ? 'ზრდადობით' : 'კლებადობით');

export const G6_U01_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U01.1 — ნატურალური და დიდი რიცხვები ═════════
  t({
    sub: 'u01-01',
    prompt: 'ჩაწერე სიტყვიერად რიცხვი {nS}.',
    vars: { n: I(1000, 9999999), nS: S('n') },
    answer: (v) => georgianWords(N(v, 'n')),
    wrong: (v) => {
      const n = N(v, 'n');
      return [georgianWords(swapAdjacent(n)), georgianWords(n + 1000), georgianWords(n * 10), georgianWords(n + 100)];
    },
    why: (v, a) => `რიცხვს ${sg(N(v, 'n'))} ვკითხულობთ თანრიგების მიხედვით: ${a}.`,
  }),
  t({
    sub: 'u01-01',
    prompt: 'ჩაწერე ციფრებით: {w}.',
    vars: { n: I(1000, 9999999), w: D((v) => georgianWords(N(v, 'n'))) },
    answer: (v) => sg(N(v, 'n')),
    wrong: (v) => {
      const n = N(v, 'n');
      return [n * 10, Math.floor(n / 10), swapAdjacent(n), n + 10 ** Math.max(1, String(n).length - 2)];
    },
    why: (v, a) => `${georgianWords(N(v, 'n'))} — ციფრებით ${a}.`,
  }),
  t({
    sub: 'u01-01',
    d: 2,
    prompt: 'რამდენი სრული {u} არის რიცხვში {nS}?',
    vars: {
      spec: SPEC(['ათასი|1000', 'ათიათასი|10000', 'ასეული|100', 'ათეული|10']),
      u: F(0),
      n: I(100000, 9999999),
      nS: S('n'),
    },
    answer: (v) => sg(Math.floor(N(v, 'n') / Number(String(v.spec).split('|')[1]))),
    wrong: (v) => {
      const n = N(v, 'n');
      const size = Number(String(v.spec).split('|')[1]);
      return [Math.floor(n / (size * 10)), Math.floor(n / (size / 10)), Math.floor(n / size) % 10, n % size];
    },
    why: (v, a) => {
      const size = Number(String(v.spec).split('|')[1]);
      return `${sg(N(v, 'n'))} ÷ ${sg(size)} (მთელი ნაწილი) = ${a}.`;
    },
  }),
  t({
    sub: 'u01-01',
    prompt: 'რიცხვში {nS} რა ციფრი დგას {pl} თანრიგში?',
    vars: {
      spec: SPEC(['ერთეულების|0', 'ათეულების|1', 'ასეულების|2', 'ათასეულების|3', 'ათიათასეულების|4', 'ასიათასეულების|5']),
      pl: F(0),
      s: I(0, 99999),
      n: D((v) => distinctNumber(N(v, 's'), 7)),
      nS: S('n'),
    },
    answer: (v) => String(Math.floor(N(v, 'n') / POWERS[Number(String(v.spec).split('|')[1])]!) % 10),
    wrong: (v) => {
      const k = Number(String(v.spec).split('|')[1]);
      const n = N(v, 'n');
      return [k + 1, k - 1, k + 2, k - 2, k + 3]
        .filter((j) => j >= 0 && j < POWERS.length)
        .map((j) => Math.floor(n / POWERS[j]!) % 10);
    },
    why: (v, a) => `${sg(N(v, 'n'))} რიცხვში ${String(v.pl)} თანრიგის ციფრია ${a}.`,
  }),
  t({
    sub: 'u01-01',
    prompt: 'იპოვე {w} {k}-ნიშნა ნატურალური რიცხვი.',
    vars: { spec: SPEC(['უმცირესი|0', 'უდიდესი|1']), w: F(0), k: I(3, 8) },
    answer: (v) => sg(String(v.spec).endsWith('|0') ? 10 ** (N(v, 'k') - 1) : 10 ** N(v, 'k') - 1),
    wrong: (v) => {
      const k = N(v, 'k');
      return String(v.spec).endsWith('|0')
        ? [10 ** k - 1, 10 ** (k - 1) - 1, 10 ** (k - 1) + 1, 10 ** k]
        : [10 ** (k - 1), 10 ** k, 10 ** k - 10, 10 ** (k - 1) - 1];
    },
    why: (v, a) => `${String(v.w)} ${N(v, 'k')}-ნიშნა ნატურალური რიცხვია ${a}.`,
  }),
  t({
    sub: 'u01-01',
    d: 2,
    prompt: 'დაალაგე {dirW}: {list}. რომელია სწორი რიგი?',
    vars: {
      dir: C(['asc', 'desc']),
      dirW: D(orderWords),
      p: I(100, 800),
      q: I((v) => N(v, 'p') + 1, 900),
      s: I(100, 800),
      u: I((v) => N(v, 's') + 1, 900),
      list: D((v) => {
        const [p, q, s, u] = ['p', 'q', 's', 'u'].map((k) => N(v, k));
        return [q! * 1000 + s!, p! * 1000 + u!, q! * 1000 + u!, p! * 1000 + s!].map(sg).join('; ');
      }),
    },
    answer: (v) => {
      const [p, q, s, u] = ['p', 'q', 's', 'u'].map((k) => N(v, k));
      const asc = [p! * 1000 + s!, p! * 1000 + u!, q! * 1000 + s!, q! * 1000 + u!];
      return listText(String(v.dir) === 'asc' ? asc : [...asc].reverse());
    },
    options: (v, right) => {
      const [p, q, s, u] = ['p', 'q', 's', 'u'].map((k) => N(v, k));
      const asc = [p! * 1000 + s!, p! * 1000 + u!, q! * 1000 + s!, q! * 1000 + u!];
      const bySuffix = [asc[0]!, asc[2]!, asc[1]!, asc[3]!];
      const up = String(v.dir) === 'asc';
      const swapped = up ? [asc[1]!, asc[0]!, asc[2]!, asc[3]!] : [asc[3]!, asc[2]!, asc[0]!, asc[1]!];
      const reverse = (list: number[]) => [...list].reverse();
      return [
        right,
        listText(up ? reverse(asc) : asc),
        listText(up ? bySuffix : reverse(bySuffix)),
        listText(swapped),
      ];
    },
    why: (_v, a) => `რიცხვებს ვადარებთ თანრიგებით, უმაღლესი თანრიგიდან დაწყებული: ${a}.`,
  }),

  // ═════════ U01.2 — პოზიციური სისტემა ═════════
  t({
    sub: 'u01-02',
    prompt: 'გაშალე რიცხვი {nS} თანრიგების ჯამის სახით.',
    vars: { n: I(100000, 999999), nS: S('n') },
    constraints: [{ test: (v) => digitsOf(N(v, 'n')).filter((d) => d !== 0).length >= 3, note: 'at least three non-zero digits' }],
    answer: (v) => expandTerms(N(v, 'n')).map(sg).join(' + '),
    options: (v, right) => {
      const terms = expandTerms(N(v, 'n'));
      const bump = (i: number) => terms.map((x, j) => sg(j === i ? x * 10 : x)).join(' + ');
      const shrink = (i: number) => terms.map((x, j) => sg(j === i && x >= 10 ? x / 10 : x)).join(' + ');
      return [right, bump(0), bump(1), bump(2), shrink(1), shrink(0)];
    },
    why: (_v, a) => `თითოეულ ციფრს ვწერთ მისი თანრიგის მნიშვნელობით: ${a}.`,
  }),
  t({
    sub: 'u01-02',
    prompt: 'რა მნიშვნელობა აქვს ციფრ {d}-ს რიცხვში {nS}?',
    vars: {
      s: I(0, 99999),
      n: D((v) => distinctNumber(N(v, 's'), 7)),
      pos: I(0, 6),
      d: D((v) => digitsOf(N(v, 'n'))[N(v, 'pos')]!),
      nS: S('n'),
    },
    constraints: [{ test: (v) => N(v, 'd') !== 0, note: 'a zero has no value to ask about' }],
    answer: (v) => sg(N(v, 'd') * 10 ** (6 - N(v, 'pos'))),
    wrong: (v) => {
      const k = 6 - N(v, 'pos');
      const d = N(v, 'd');
      return [d * 10 ** (k + 1), d * 10 ** Math.max(0, k - 1), d, d * 10 ** (k + 2)];
    },
    why: (v, a) => `რიცხვში ${sg(N(v, 'n'))} ციფრი ${N(v, 'd')} ${PLACES[6 - N(v, 'pos')]} თანრიგშია, ამიტომ მისი მნიშვნელობაა ${a}.`,
  }),
  t({
    sub: 'u01-02',
    d: 2,
    prompt: 'შეადგინე უდიდესი რიცხვი ციფრებით {digits}. თითოეული ციფრი გამოიყენე ერთხელ.',
    vars: {
      s: I(0, 99999),
      k: I(5, 6),
      list: D((v) => sampleBy([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], N(v, 's'), N(v, 'k')).join(',')),
      digits: D((v) => String(v.list).split(',').join(', ')),
    },
    answer: (v) => sg(Number(String(v.list).split(',').map(Number).sort((a, b) => b - a).join(''))),
    wrong: (v) => {
      const ds = String(v.list).split(',').map(Number);
      const desc = [...ds].sort((a, b) => b - a);
      const asc = [...ds].sort((a, b) => a - b);
      const swapped = [...desc];
      [swapped[0], swapped[1]] = [swapped[1]!, swapped[0]!];
      const nearEnd = [...desc];
      [nearEnd[nearEnd.length - 2], nearEnd[nearEnd.length - 1]] = [nearEnd[nearEnd.length - 1]!, nearEnd[nearEnd.length - 2]!];
      return [Number(asc.join('')), Number(swapped.join('')), Number(nearEnd.join(''))];
    },
    why: (_v, a) => `უდიდესი რიცხვისთვის ციფრებს ვალაგებთ კლებადობით: ${a}.`,
  }),
  t({
    sub: 'u01-02',
    d: 2,
    prompt: 'შეადგინე უმცირესი {k}-ნიშნა რიცხვი ციფრებით {digits}. თითოეული ციფრი გამოიყენე ერთხელ.',
    vars: {
      s: I(0, 99999),
      k: I(4, 6),
      list: D((v) => ['0', ...sampleBy([1, 2, 3, 4, 5, 6, 7, 8, 9], N(v, 's'), N(v, 'k') - 1).map(String)].join(',')),
      digits: D((v) => String(v.list).split(',').join(', ')),
    },
    answer: (v) => {
      const ds = String(v.list).split(',').map(Number).sort((a, b) => a - b);
      return sg(Number([ds[1], ds[0], ...ds.slice(2)].join('')));
    },
    wrong: (v) => {
      const ds = String(v.list).split(',').map(Number).sort((a, b) => a - b);
      const right = [ds[1]!, ds[0]!, ...ds.slice(2)];
      const swapped = [...right];
      [swapped[1], swapped[2]] = [swapped[2]!, swapped[1]!];
      return [Number(ds.join('')), Number([...ds].reverse().join('')), Number(swapped.join(''))];
    },
    why: (_v, a) => `უმცირეს რიცხვს ნულით ვერ დავიწყებთ: პირველი ადგილი უმცირეს არანულოვან ციფრს ეკუთვნის, შემდეგ ნული და დანარჩენი ზრდადობით: ${a}.`,
  }),
  t({
    sub: 'u01-02',
    d: 2,
    prompt: 'რიცხვში {n1S} ციფრი {d} რამდენჯერ მეტ მნიშვნელობას გამოხატავს, ვიდრე ციფრი {d} რიცხვში {n2S}?',
    vars: {
      d: I(1, 9),
      k1: I(3, 5),
      k2: I(1, (v) => N(v, 'k1') - 1),
      hi1: I(1, 9),
      lo1: I(0, (v) => 10 ** N(v, 'k1') - 1),
      hi2: I(1, 9),
      lo2: I(0, (v) => 10 ** N(v, 'k2') - 1),
      n1: D((v) => N(v, 'hi1') * 10 ** (N(v, 'k1') + 1) + N(v, 'd') * 10 ** N(v, 'k1') + N(v, 'lo1')),
      n2: D((v) => N(v, 'hi2') * 10 ** (N(v, 'k2') + 1) + N(v, 'd') * 10 ** N(v, 'k2') + N(v, 'lo2')),
      n1S: S('n1'),
      n2S: S('n2'),
    },
    constraints: [
      { test: (v) => digitsOf(N(v, 'n1')).filter((x) => x === N(v, 'd')).length === 1, note: 'digit appears once in n1' },
      { test: (v) => digitsOf(N(v, 'n2')).filter((x) => x === N(v, 'd')).length === 1, note: 'digit appears once in n2' },
    ],
    answer: (v) => sg(10 ** (N(v, 'k1') - N(v, 'k2'))),
    wrong: (v) => {
      const gap = N(v, 'k1') - N(v, 'k2');
      return [10 ** (gap + 1), gap, 10 ** (gap + 2), 10 ** Math.max(0, gap - 1)];
    },
    why: (v, a) => `ერთი ციფრის მნიშვნელობა თანრიგების გადასვლისას 10-ჯერ იცვლება; აქ ${N(v, 'k1') - N(v, 'k2')} თანრიგით ზემოთაა, ამიტომ ${a}-ჯერ მეტია.`,
  }),
  t({
    sub: 'u01-02',
    d: 2,
    prompt: 'რიცხვში {pat} გამოტოვებულია ერთი ციფრი (□). რა რიცხვს მივიღებთ, თუ □ = {x}?',
    vars: {
      s: I(0, 99999),
      n: D((v) => distinctNumber(N(v, 's'), 6)),
      h: I(1, 4),
      x: D((v) => (digitsOf(N(v, 'n'))[N(v, 'h')]! + 3) % 10),
      pat: D((v) => {
        const ds = digitsOf(N(v, 'n')).map(String);
        ds[N(v, 'h')] = '□';
        return `${ds.slice(0, 3).join('')} ${ds.slice(3).join('')}`;
      }),
    },
    answer: (v) => {
      const ds = digitsOf(N(v, 'n'));
      ds[N(v, 'h')] = N(v, 'x');
      return sg(Number(ds.join('')));
    },
    wrong: (v) => {
      const ds = digitsOf(N(v, 'n'));
      const inserted = [...ds];
      inserted.splice(N(v, 'h'), 0, N(v, 'x'));
      const left = [...ds];
      left[N(v, 'h') - 1] = N(v, 'x');
      const right = [...ds];
      right[N(v, 'h') + 1] = N(v, 'x');
      return [Number(inserted.join('')), Number(left.join('')), Number(right.join(''))];
    },
    why: (_v, a) => `□-ის ადგილას ვწერთ მოცემულ ციფრს, დანარჩენი ციფრები არ იცვლება: ${a}.`,
  }),

  // ═════════ U01.3 — რომაული რიცხვები ═════════
  t({
    sub: 'u01-03',
    prompt: 'ჩაწერე რომაული რიცხვით {n}.',
    vars: { n: I(11, 99) },
    answer: (v) => roman(N(v, 'n')),
    wrong: (v) => {
      const n = N(v, 'n');
      return [additiveRoman(n), roman(n + 1), roman(n - 1), roman(n + 10), roman(n - 10)];
    },
    why: (v, a) => `${N(v, 'n')} = ${a}.`,
  }),
  t({
    sub: 'u01-03',
    prompt: 'ჩაწერე არაბული ციფრებით: {r}.',
    vars: { n: I(11, 99), r: D((v) => roman(N(v, 'n'))) },
    answer: (v) => String(N(v, 'n')),
    wrong: (v) => {
      const n = N(v, 'n');
      return [sumAllSymbols(roman(n)), n + 2, n - 2, n + 10];
    },
    why: (v, a) => `${String(v.r)} = ${a}.`,
  }),
  t({
    sub: 'u01-03',
    prompt: 'რომელი რიცხვია უფრო დიდი: {r1} თუ {r2}?',
    vars: {
      a: I(12, 99),
      b: I(12, 99),
      r1: D((v) => roman(N(v, 'a'))),
      r2: D((v) => roman(N(v, 'b'))),
    },
    constraints: [{ test: (v) => N(v, 'a') !== N(v, 'b'), note: 'different numbers' }],
    optionCount: 2,
    answer: (v) => roman(Math.max(N(v, 'a'), N(v, 'b'))),
    options: (v, right) => [right, roman(Math.min(N(v, 'a'), N(v, 'b')))],
    why: (v, a) => `${String(v.r1)} = ${N(v, 'a')}, ${String(v.r2)} = ${N(v, 'b')}; უფრო დიდია ${a}.`,
  }),
  t({
    sub: 'u01-03',
    d: 2,
    prompt: 'რომელი რომაული ჩანაწერია არასწორი: {list}?',
    vars: {
      bad: C([4, 9, 14, 19, 24, 29, 34, 39, 44, 49, 54, 59, 64, 69, 74, 79, 84, 89, 94, 99]),
      s: I(0, 99999),
      others: D((v) => sampleBy([11, 12, 13, 15, 16, 17, 18, 20, 21, 22, 23, 25, 26, 27, 30, 31, 32, 33, 35, 36, 37, 38, 41, 42, 43], N(v, 's'), 3).join(',')),
      list: D((v) =>
        sampleBy([additiveRoman(N(v, 'bad')), ...String(v.others).split(',').map((x) => roman(Number(x)))], N(v, 's') + 1, 4).join(', '),
      ),
    },
    answer: (v) => additiveRoman(N(v, 'bad')),
    options: (v, right) => [right, ...String(v.others).split(',').map((x) => roman(Number(x)))],
    why: (v, a) => `რომაულში ${N(v, 'bad')} იწერება ${roman(N(v, 'bad'))}-ად; ჩანაწერი ${a} არასწორია.`,
  }),
  t({
    sub: 'u01-03',
    d: 2,
    prompt: 'რამდენია {r1} + {r2}? უპასუხე არაბული ციფრებით.',
    vars: {
      a: I(4, 49),
      b: I(4, 49),
      r1: D((v) => roman(N(v, 'a'))),
      r2: D((v) => roman(N(v, 'b'))),
    },
    answer: (v) => String(N(v, 'a') + N(v, 'b')),
    wrong: (v) => {
      const sum = N(v, 'a') + N(v, 'b');
      return [sumAllSymbols(roman(N(v, 'a'))) + sumAllSymbols(roman(N(v, 'b'))), sum + 10, sum - 10, sum + 1];
    },
    why: (v, a) => `${String(v.r1)} = ${N(v, 'a')}, ${String(v.r2)} = ${N(v, 'b')}; ${N(v, 'a')} + ${N(v, 'b')} = ${a}.`,
  }),
  t({
    sub: 'u01-03',
    d: 2,
    prompt: 'ჩაწერე რომაული რიცხვით {a} და {b} ჯამი.',
    vars: { a: I(10, 49), b: I(10, 49) },
    answer: (v) => roman(N(v, 'a') + N(v, 'b')),
    wrong: (v) => {
      const sum = N(v, 'a') + N(v, 'b');
      return [roman(N(v, 'a')) + roman(N(v, 'b')), roman(sum + 1), roman(sum - 1), roman(sum + 10)];
    },
    why: (v, a) => `${N(v, 'a')} + ${N(v, 'b')} = ${N(v, 'a') + N(v, 'b')} = ${a}.`,
  }),

  // ═════════ U01.4 — მარტივი და შედგენილი რიცხვები ═════════
  t({
    sub: 'u01-04',
    prompt: 'რომელია მარტივი რიცხვი: {list}?',
    vars: {
      s: I(0, 99999),
      set: D((v) => [sampleBy(PRIMES, N(v, 's'), 1)[0], ...sampleBy(ODD_COMPOSITES, N(v, 's') + 7, 3)].join(',')),
      list: D((v) => sampleBy(String(v.set).split(','), N(v, 's') + 3, 4).join(', ')),
    },
    answer: (v) => String(v.set).split(',')[0]!,
    options: (v) => String(v.set).split(','),
    why: (_v, a) => `${a} გაიყოფა მხოლოდ 1-ზე და საკუთარ თავზე, დანარჩენი რიცხვებს ორზე მეტი გამყოფი აქვს. მარტივია ${a}.`,
  }),
  t({
    sub: 'u01-04',
    prompt: 'რომელია შედგენილი რიცხვი: {list}?',
    vars: {
      s: I(0, 99999),
      set: D((v) => [sampleBy(ODD_COMPOSITES, N(v, 's'), 1)[0], ...sampleBy(PRIMES, N(v, 's') + 5, 3)].join(',')),
      list: D((v) => sampleBy(String(v.set).split(','), N(v, 's') + 3, 4).join(', ')),
    },
    answer: (v) => String(v.set).split(',')[0]!,
    options: (v) => String(v.set).split(','),
    why: (v, a) => {
      const n = Number(String(v.set).split(',')[0]);
      const d = divisorsOf(n)[1]!;
      return `${n} = ${d} × ${n / d}, ამიტომ შედგენილია: ${a}.`;
    },
  }),
  t({
    sub: 'u01-04',
    d: 2,
    prompt: 'ჩამოთვალე ყველა მარტივი რიცხვი {lo}-დან {hi}-ის ჩათვლით.',
    vars: { lo: I(8, 60), hi: I((v) => N(v, 'lo') + 12, (v) => N(v, 'lo') + 22) },
    constraints: [
      {
        test: (v) => {
          const count = Array.from({ length: N(v, 'hi') - N(v, 'lo') + 1 }, (_, i) => N(v, 'lo') + i).filter(isPrime).length;
          return count >= 3 && count <= 6;
        },
        note: 'three to six primes',
      },
    ],
    answer: (v) => rangePrimes(N(v, 'lo'), N(v, 'hi')).join(', '),
    options: (v, right) => {
      const primes = rangePrimes(N(v, 'lo'), N(v, 'hi'));
      const comp = Array.from({ length: N(v, 'hi') - N(v, 'lo') + 1 }, (_, i) => N(v, 'lo') + i).filter((x) => x > 3 && x % 2 === 1 && !isPrime(x));
      const withComposite = [...primes, comp[0]!].sort((a, b) => a - b);
      const missing = primes.filter((_, i) => i !== Math.floor(primes.length / 2));
      const swapped = primes.map((p, i) => (i === 0 ? comp[comp.length - 1]! : p)).sort((a, b) => a - b);
      return [right, withComposite.join(', '), missing.join(', '), swapped.join(', ')];
    },
    why: (_v, a) => `მარტივი რიცხვები მოცემულ შუალედში: ${a}.`,
  }),
  t({
    sub: 'u01-04',
    prompt: 'რამდენი გამყოფი აქვს რიცხვს {n}?',
    vars: { n: I(10, 99) },
    answer: (v) => String(divisorsOf(N(v, 'n')).length),
    wrong: (v) => {
      const c = divisorsOf(N(v, 'n')).length;
      return [c - 1, c + 1, c + 2, 2];
    },
    why: (v, a) => `${N(v, 'n')}-ის გამყოფებია: ${divisorsOf(N(v, 'n')).join(', ')}. სულ ${a}.`,
  }),
  t({
    sub: 'u01-04',
    prompt: 'რიცხვი {n} მარტივია თუ შედგენილი?',
    vars: { n: I(21, 99) },
    optionCount: 2,
    answer: (v) => (isPrime(N(v, 'n')) ? 'მარტივია' : 'შედგენილია'),
    options: (v, right) => [right, isPrime(N(v, 'n')) ? 'შედგენილია' : 'მარტივია'],
    why: (v, a) => {
      const n = N(v, 'n');
      const d = divisorsOf(n)[1]!;
      return isPrime(n) ? `${n} მხოლოდ 1-ზე და საკუთარ თავზე იყოფა: ${a}.` : `${n} იყოფა ${d}-ზე (${n} = ${d} × ${n / d}): ${a}.`;
    },
  }),
  t({
    sub: 'u01-04',
    d: 2,
    prompt: 'მოცემული რიცხვებიდან რამდენია მარტივი: {list}?',
    vars: { s: I(0, 99999), set: D((v) => sampleBy([11, 13, 15, 17, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41], N(v, 's'), 5).join(',')), list: D((v) => String(v.set).split(',').join(', ')) },
    constraints: [{ test: (v) => { const c = String(v.set).split(',').map(Number).filter(isPrime).length; return c >= 1 && c <= 4; }, note: 'not all or none' }],
    answer: (v) => String(String(v.set).split(',').map(Number).filter(isPrime).length),
    wrong: (v) => {
      const c = String(v.set).split(',').map(Number).filter(isPrime).length;
      return [0, 1, 2, 3, 4, 5].filter((x) => x !== c);
    },
    why: (v, a) => `მარტივებია: ${String(v.set).split(',').map(Number).filter(isPrime).join(', ')}. სულ ${a}.`,
  }),

  // ═════════ U01.5 — მარტივ მამრავლებად დაშლა ═════════
  t({
    sub: 'u01-05',
    prompt: 'დაშალე {n} მარტივ მამრავლებად.',
    vars: { n: I(24, 360) },
    constraints: [{ test: (v) => factorize(N(v, 'n')).length >= 3 && new Set(factorize(N(v, 'n'))).size >= 2, note: 'rich factorisation' }],
    answer: (v) => factorize(N(v, 'n')).join(' × '),
    options: (v, right) => {
      const f = factorize(N(v, 'n'));
      const merged = [f[0]! * f[1]!, ...f.slice(2)];
      const dropped = f.slice(1);
      const changed = f.map((x, i) => (i === f.length - 1 ? (x === 2 ? 3 : x === 3 ? 5 : x === 5 ? 7 : x + 2) : x));
      return [right, merged.join(' × '), dropped.join(' × '), changed.join(' × ')];
    },
    why: (_v, a) => `მარტივ მამრავლებად დაშლა: ${a}.`,
  }),
  t({
    sub: 'u01-05',
    prompt: 'რამდენჯერ გვხვდება მარტივი მამრავლი {p} რიცხვის {nS}-ის მარტივ მამრავლებად დაშლისას?',
    vars: {
      a: I(1, 4), b: I(0, 3), c: I(0, 2),
      p: C([2, 3, 5]),
      n: D((v) => 2 ** N(v, 'a') * 3 ** N(v, 'b') * 5 ** N(v, 'c')),
      nS: S('n'),
    },
    constraints: [
      { test: (v) => N(v, 'b') + N(v, 'c') >= 1, note: 'more than a power of two' },
      { test: (v) => factorize(N(v, 'n')).includes(N(v, 'p')), note: 'the asked prime really occurs' },
    ],
    answer: (v) => String(factorize(N(v, 'n')).filter((x) => x === N(v, 'p')).length),
    wrong: (v) => {
      const e = factorize(N(v, 'n')).filter((x) => x === N(v, 'p')).length;
      return [e + 1, e - 1, factorize(N(v, 'n')).length, e + 2];
    },
    why: (v, a) => `${N(v, 'n')} = ${factorize(N(v, 'n')).join(' × ')}; მამრავლი ${N(v, 'p')} გვხვდება ${a}-ჯერ.`,
  }),
  t({
    sub: 'u01-05',
    prompt: 'რიცხვის მარტივ მამრავლებად დაშლაა {f}. რომელი რიცხვია ეს?',
    vars: {
      a: I(1, 3), b: I(0, 2), c: I(0, 2), e: I(0, 1),
      n: D((v) => 2 ** N(v, 'a') * 3 ** N(v, 'b') * 5 ** N(v, 'c') * 7 ** N(v, 'e')),
      f: D((v) => factorize(N(v, 'n')).join(' × ')),
    },
    constraints: [{ test: (v) => N(v, 'a') + N(v, 'b') + N(v, 'c') + N(v, 'e') >= 3, note: 'at least three factors' }],
    answer: (v) => sg(N(v, 'n')),
    wrong: (v) => {
      const f = factorize(N(v, 'n'));
      const sum = f.reduce((s, x) => s + x, 0);
      return [N(v, 'n') / f[0]!, N(v, 'n') * f[0]!, sum, N(v, 'n') + f[f.length - 1]!];
    },
    why: (v, a) => `${String(v.f)} = ${a}.`,
  }),
  t({
    sub: 'u01-05',
    d: 2,
    prompt: 'რიცხვში მარტივი მამრავლი {p1} გვხვდება {e1}-ჯერ, {p2} — {e2}-ჯერ, {p3} — {e3}-ჯერ. იპოვე ეს რიცხვი.',
    vars: {
      spec: SPEC(['2|3|5', '2|3|7', '2|5|7', '3|5|7']),
      p1: F(0), p2: F(1), p3: F(2),
      e1: I(1, 3), e2: I(1, 3), e3: I(1, 2),
    },
    answer: (v) => sg(N(v, 'p1') ** N(v, 'e1') * N(v, 'p2') ** N(v, 'e2') * N(v, 'p3') ** N(v, 'e3')),
    wrong: (v) => {
      const [p1, p2, p3, e1, e2, e3] = ['p1', 'p2', 'p3', 'e1', 'e2', 'e3'].map((k) => N(v, k)) as number[];
      return [p1! * p2! * p3!, p1! * e1! * p2! * e2! * p3! * e3!, p1! ** e2! * p2! ** e1! * p3! ** e3!, p1! ** e1! + p2! ** e2! + p3! ** e3!];
    },
    why: (v, a) =>
      `${pw(N(v, 'p1'), N(v, 'e1'))} × ${pw(N(v, 'p2'), N(v, 'e2'))} × ${pw(N(v, 'p3'), N(v, 'e3'))} = ${a}.`,
  }),
  t({
    sub: 'u01-05',
    prompt: 'რამდენი მარტივი მამრავლია {n}-ის დაშლაში, თუ განმეორებადი მამრავლები ცალ-ცალკე ითვლება?',
    vars: { n: I(16, 400) },
    constraints: [{ test: (v) => factorize(N(v, 'n')).length >= 3, note: 'at least three factors' }],
    answer: (v) => String(factorize(N(v, 'n')).length),
    wrong: (v) => {
      const f = factorize(N(v, 'n'));
      return [new Set(f).size, f.length + 1, f.length - 1, f.length + 2];
    },
    why: (v, a) => `${N(v, 'n')} = ${factorize(N(v, 'n')).join(' × ')} — სულ ${a} მამრავლი.`,
  }),
  t({
    sub: 'u01-05',
    d: 2,
    prompt: 'რომელია {n}-ის ყველა განსხვავებული მარტივი გამყოფი?',
    vars: { n: I(30, 400) },
    constraints: [{ test: (v) => new Set(factorize(N(v, 'n'))).size >= 2 && new Set(factorize(N(v, 'n'))).size <= 3 && factorize(N(v, 'n')).length >= 3, note: 'two or three distinct primes' }],
    answer: (v) => [...new Set(factorize(N(v, 'n')))].join(', '),
    options: (v, right) => {
      const primes = [...new Set(factorize(N(v, 'n')))];
      const withComposite = [...primes, primes[0]! * primes[1]!].sort((a, b) => a - b);
      const withOne = [1, ...primes];
      const without = primes.slice(1);
      return [right, withComposite.join(', '), withOne.join(', '), without.join(', ')];
    },
    why: (v, a) => `${N(v, 'n')} = ${factorize(N(v, 'n')).join(' × ')}; განსხვავებული მარტივი მამრავლებია ${a}.`,
  }),

  // ═════════ U01.6 — უდიდესი საერთო გამყოფი და უმცირესი საერთო ჯერადი ═════════
  t({
    sub: 'u01-06',
    prompt: 'იპოვე რიცხვების {a} და {b} უდიდესი საერთო გამყოფი.',
    vars: { g: I(2, 12), x: I(2, 9), y: I(2, 9), a: D((v) => N(v, 'g') * N(v, 'x')), b: D((v) => N(v, 'g') * N(v, 'y')) },
    constraints: [{ test: (v) => gcd(N(v, 'x'), N(v, 'y')) === 1 && N(v, 'x') !== N(v, 'y'), note: 'coprime cofactors' }],
    answer: (v) => String(N(v, 'g')),
    wrong: (v) => [lcm(N(v, 'a'), N(v, 'b')), Math.min(N(v, 'a'), N(v, 'b')), Math.abs(N(v, 'a') - N(v, 'b')), N(v, 'g') * 2],
    why: (v, a) => `${N(v, 'a')} = ${N(v, 'g')} × ${N(v, 'x')}, ${N(v, 'b')} = ${N(v, 'g')} × ${N(v, 'y')}; უდიდესი საერთო გამყოფია ${a}.`,
  }),
  t({
    sub: 'u01-06',
    prompt: 'იპოვე რიცხვების {a} და {b} უმცირესი საერთო ჯერადი.',
    vars: { a: I(4, 24), b: I(4, 24) },
    constraints: [{ test: (v) => N(v, 'a') !== N(v, 'b') && lcm(N(v, 'a'), N(v, 'b')) <= 240, note: 'a manageable multiple' }],
    answer: (v) => String(lcm(N(v, 'a'), N(v, 'b'))),
    wrong: (v) => [N(v, 'a') * N(v, 'b'), gcd(N(v, 'a'), N(v, 'b')), Math.max(N(v, 'a'), N(v, 'b')), lcm(N(v, 'a'), N(v, 'b')) * 2],
    why: (v, a) => `${N(v, 'a')}-ისა და ${N(v, 'b')}-ის უმცირესი საერთო ჯერადია ${a}.`,
  }),
  t({
    sub: 'u01-06',
    d: 2,
    prompt: 'ორი ზარი, ერთი ყოველ {a} წუთში, მეორე კი ყოველ {b} წუთში რეკავს. რამდენ წუთში დარეკავენ ისინი ერთდროულად, თუ ახლა ერთად დარეკეს?',
    vars: { a: I(3, 15), b: I(3, 15) },
    constraints: [{ test: (v) => N(v, 'a') !== N(v, 'b') && lcm(N(v, 'a'), N(v, 'b')) <= 120, note: 'a manageable multiple' }],
    answer: (v) => String(lcm(N(v, 'a'), N(v, 'b'))),
    wrong: (v) => [N(v, 'a') * N(v, 'b'), N(v, 'a') + N(v, 'b'), gcd(N(v, 'a'), N(v, 'b')), Math.max(N(v, 'a'), N(v, 'b'))],
    why: (v, a) => `ერთდროულად დარეკავენ ${N(v, 'a')}-ისა და ${N(v, 'b')}-ის უმცირესი საერთო ჯერადის შემდეგ: ${a} წუთში.`,
  }),
  t({
    sub: 'u01-06',
    d: 2,
    prompt: '{a} წითელი და {b} ლურჯი ფანქარი უნდა გადანაწილდეს ერთნაირ კომპლექტებში ისე, რომ ყველა ფანქარი გამოყენებული იყოს და თითოეულ კომპლექტში ფანქრების ფერების რაოდენობა ერთნაირი იყოს. მაქსიმუმ რამდენი კომპლექტის შექმნა შეიძლება?',
    vars: { g: I(2, 12), x: I(2, 8), y: I(2, 8), a: D((v) => N(v, 'g') * N(v, 'x')), b: D((v) => N(v, 'g') * N(v, 'y')) },
    constraints: [{ test: (v) => gcd(N(v, 'x'), N(v, 'y')) === 1 && N(v, 'x') !== N(v, 'y'), note: 'coprime cofactors' }],
    answer: (v) => String(N(v, 'g')),
    wrong: (v) => [lcm(N(v, 'a'), N(v, 'b')), N(v, 'a') + N(v, 'b'), Math.min(N(v, 'a'), N(v, 'b')), N(v, 'g') * 2],
    why: (v, a) => `კომპლექტების უდიდესი რაოდენობა არის ${N(v, 'a')}-ისა და ${N(v, 'b')}-ის უდიდესი საერთო გამყოფი: ${a}.`,
  }),
  t({
    sub: 'u01-06',
    prompt: 'იპოვე რიცხვების {a}, {b} და {c} უდიდესი საერთო გამყოფი.',
    vars: { g: I(2, 9), x: I(2, 6), y: I(2, 6), z: I(2, 6), a: D((v) => N(v, 'g') * N(v, 'x')), b: D((v) => N(v, 'g') * N(v, 'y')), c: D((v) => N(v, 'g') * N(v, 'z')) },
    constraints: [{ test: (v) => gcd(gcd(N(v, 'x'), N(v, 'y')), N(v, 'z')) === 1 && new Set([N(v, 'x'), N(v, 'y'), N(v, 'z')]).size === 3, note: 'distinct cofactors with gcd 1' }],
    answer: (v) => String(N(v, 'g')),
    wrong: (v) => [lcm(lcm(N(v, 'a'), N(v, 'b')), N(v, 'c')), Math.min(N(v, 'a'), N(v, 'b'), N(v, 'c')), N(v, 'g') * 2, gcd(N(v, 'a'), N(v, 'b'))],
    why: (_v, a) => `სამივე რიცხვი იყოფა ${a}-ზე და უფრო დიდ საერთო გამყოფს არ აქვთ.`,
  }),
  t({
    sub: 'u01-06',
    d: 2,
    prompt: 'იპოვე უმცირესი ნატურალური რიცხვი, რომელიც იყოფა {a}-ზეც, {b}-ზეც და {c}-ზეც.',
    vars: { a: I(2, 9), b: I(2, 9), c: I(2, 9) },
    constraints: [{ test: (v) => new Set([N(v, 'a'), N(v, 'b'), N(v, 'c')]).size === 3 && lcm(lcm(N(v, 'a'), N(v, 'b')), N(v, 'c')) <= 360, note: 'distinct, manageable' }],
    answer: (v) => String(lcm(lcm(N(v, 'a'), N(v, 'b')), N(v, 'c'))),
    wrong: (v) => [N(v, 'a') * N(v, 'b') * N(v, 'c'), lcm(N(v, 'a'), N(v, 'b')), Math.max(N(v, 'a'), N(v, 'b'), N(v, 'c')), lcm(lcm(N(v, 'a'), N(v, 'b')), N(v, 'c')) * 2],
    why: (v, a) => `${N(v, 'a')}, ${N(v, 'b')} და ${N(v, 'c')} რიცხვების უმცირესი საერთო ჯერადია ${a}.`,
  }),

  // ═════════ U01.7 — მთელი და უარყოფითი რიცხვები ═════════
  t({
    sub: 'u01-07',
    prompt: 'გამოთვალე: {e}.',
    vars: { a: I(-20, 20, { nonZero: true }), b: I(-20, 20, { nonZero: true }), e: D((v) => `${sg(N(v, 'a'))} + ${par(N(v, 'b'))}`) },
    answer: (v) => sg(N(v, 'a') + N(v, 'b')),
    wrong: (v) => [Math.abs(N(v, 'a')) + Math.abs(N(v, 'b')), N(v, 'a') - N(v, 'b'), -(N(v, 'a') + N(v, 'b')), N(v, 'b') - N(v, 'a')],
    why: (v, a) => `${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u01-07',
    prompt: 'გამოთვალე: {e}.',
    vars: { a: I(-20, 20, { nonZero: true }), b: I(-20, 20, { nonZero: true }), e: D((v) => `${sg(N(v, 'a'))} ${MINUS} ${par(N(v, 'b'))}`) },
    answer: (v) => sg(N(v, 'a') - N(v, 'b')),
    wrong: (v) => [N(v, 'a') + N(v, 'b'), N(v, 'b') - N(v, 'a'), -(N(v, 'a') - N(v, 'b')), -(N(v, 'a') + N(v, 'b'))],
    why: (v, a) => `${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u01-07',
    prompt: 'დილით ტემპერატურა იყო {tS}°C, შუადღეს ის {k} გრადუსით {w}. რა ტემპერატურა გახდა?',
    vars: { spec: SPEC(['გაიზარდა|1', 'შემცირდა|-1']), w: F(0), t: I(-15, 10), tS: S('t'), k: I(3, 20) },
    answer: (v) => `${sg(N(v, 't') + Number(String(v.spec).split('|')[1]) * N(v, 'k'))}°C`,
    wrong: (v) => {
      const dir = Number(String(v.spec).split('|')[1]);
      const t0 = N(v, 't');
      const k = N(v, 'k');
      return [t0 - dir * k, Math.abs(t0) + k, -(t0 + dir * k), t0 + dir * k + 2, -(t0 - dir * k), t0 + dir * k - 2].map((x) => `${sg(x)}°C`);
    },
    why: (v, a) => `${sg(N(v, 't'))} ${String(v.w) === 'გაიზარდა' ? '+' : MINUS} ${N(v, 'k')} = ${a}.`,
  }),
  t({
    sub: 'u01-07',
    d: 2,
    prompt: 'დაალაგე {dirW}: {list}. რომელია სწორი რიგი?',
    vars: {
      dir: C(['asc', 'desc']),
      dirW: D(orderWords),
      s: I(0, 99999),
      set: D((v) => sampleBy([-9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8], N(v, 's'), 5).join(',')),
      list: D((v) => String(v.set).split(',').map((x) => sg(Number(x))).join('; ')),
    },
    answer: (v) => {
      const xs = String(v.set).split(',').map(Number).sort((a, b) => a - b);
      return listText(String(v.dir) === 'asc' ? xs : xs.reverse());
    },
    options: (v, right) => {
      const xs = String(v.set).split(',').map(Number).sort((a, b) => a - b);
      const up = String(v.dir) === 'asc';
      const byAbs = [...xs].sort((a, b) => Math.abs(a) - Math.abs(b) || a - b);
      const swapped = [...xs];
      [swapped[0], swapped[1]] = [swapped[1]!, swapped[0]!];
      const swappedLate = [...xs];
      [swappedLate[2], swappedLate[3]] = [swappedLate[3]!, swappedLate[2]!];
      return [
        right,
        listText(up ? [...xs].reverse() : xs),
        listText(up ? byAbs : [...byAbs].reverse()),
        listText(up ? swapped : [...swapped].reverse()),
        listText(up ? swappedLate : [...swappedLate].reverse()),
      ];
    },
    why: (_v, a) => `უარყოფითი რიცხვებიდან უფრო მცირეა ის, რომლის მოდული მეტია: ${a}.`,
  }),
  t({
    sub: 'u01-07',
    prompt: 'იპოვე მთელი რიცხვი, რომელიც {aP}-ზე {k}-ით {w}.',
    vars: { spec: SPEC(['მეტია|1', 'ნაკლებია|-1']), w: F(0), a: I(-20, 20, { nonZero: true }), aP: D((v) => par(N(v, 'a'))), k: I(3, 18) },
    answer: (v) => sg(N(v, 'a') + Number(String(v.spec).split('|')[1]) * N(v, 'k')),
    wrong: (v) => {
      const dir = Number(String(v.spec).split('|')[1]);
      return [N(v, 'a') - dir * N(v, 'k'), -N(v, 'a') + dir * N(v, 'k'), Math.abs(N(v, 'a')) + N(v, 'k'), N(v, 'a') + dir * N(v, 'k') + 1];
    },
    why: (v, a) => `${par(N(v, 'a'))} ${String(v.w) === 'მეტია' ? '+' : MINUS} ${N(v, 'k')} = ${a}.`,
  }),
  t({
    sub: 'u01-07',
    prompt: 'რომელია უფრო მცირე: {aS} თუ {bS}?',
    vars: { a: I(-15, 15), b: I(-15, 15), aS: S('a'), bS: S('b') },
    constraints: [{ test: (v) => N(v, 'a') !== N(v, 'b') && (N(v, 'a') < 0 || N(v, 'b') < 0), note: 'different, at least one negative' }],
    optionCount: 2,
    answer: (v) => sg(Math.min(N(v, 'a'), N(v, 'b'))),
    options: (v, right) => [right, sg(Math.max(N(v, 'a'), N(v, 'b')))],
    why: (_v, a) => `რიცხვთა ღერძზე ${a} მარცხნივაა, ამიტომ ის უფრო მცირეა.`,
  }),

  // ═════════ U01.8 — რაციონალური რიცხვები ═════════
  t({
    sub: 'u01-08',
    prompt: 'ჩაწერე წილადი {f} ათწილადის სახით.',
    vars: {
      spec: SPEC(['1|2', '1|4', '3|4', '1|5', '2|5', '3|5', '4|5', '1|8', '3|8', '5|8', '7|8', '3|10', '7|10', '9|20', '13|20', '7|25', '12|25']),
      f: D((v) => String(v.spec).replace('|', '/')),
    },
    answer: (v) => { const [n, d] = String(v.spec).split('|').map(Number); return dec(n! / d!, 3); },
    wrong: (v) => {
      const [n, d] = String(v.spec).split('|').map(Number);
      return [dec(n! / d! * 10, 3), dec(n! / d! / 10, 4), `0,${n}${d}`, dec(d! / n! / 10, 3)];
    },
    why: (v, a) => `${String(v.f)} = ${a}.`,
  }),
  t({
    sub: 'u01-08',
    prompt: 'ჩაწერე ათწილადი {x} ჩვეულებრივი წილადის სახით და გაამარტივე.',
    vars: {
      spec: SPEC(['0,5', '0,2', '0,25', '0,6', '0,75', '0,35', '0,45', '0,04', '0,08', '0,12', '0,15', '0,24', '0,36', '0,8', '0,4', '0,05', '0,16', '0,32', '0,65', '0,85']),
      x: F(0),
    },
    answer: (v) => fText(decToFrac(readNumber(String(v.x)), 2)),
    options: (v, right) => {
      const x = readNumber(String(v.x));
      const f = decToFrac(x, 2);
      const places = String(v.x).split(',')[1]!.length;
      return withUnique(right, [rawF(Math.round(x * 10 ** places), 10 ** places), `${f.d}/${f.n}`, `${f.n}/${f.d * 10}`, `${f.n}/${f.d + 1}`, `${f.n + 1}/${f.d}`]);
    },
    why: (v, a) => `${String(v.x)} = ${a} (წილადი შევკვეცეთ).`,
  }),
  t({
    sub: 'u01-08',
    d: 2,
    prompt: 'გამოთვალე: {e}.',
    vars: {
      spec: SPEC(['2|6', '3|6', '2|4', '4|8', '5|10', '3|9', '2|8', '3|12', '4|12', '5|15']),
      d1: D((v) => Number(String(v.spec).split('|')[0])),
      d2: D((v) => Number(String(v.spec).split('|')[1])),
      n1: I(1, (v) => N(v, 'd1') - 1),
      n2: I(1, (v) => N(v, 'd2') - 1),
      e: D((v) => `${N(v, 'n1')}/${N(v, 'd1')} + ${N(v, 'n2')}/${N(v, 'd2')}`),
    },
    answer: (v) => fText(fAdd(fr(N(v, 'n1'), N(v, 'd1')), fr(N(v, 'n2'), N(v, 'd2')))),
    options: (v, right) => {
      const [n1, d1, n2, d2] = ['n1', 'd1', 'n2', 'd2'].map((k) => N(v, k)) as number[];
      return withUnique(right, [fText(fr(n1! + n2!, d1! + d2!)), fText(fr(n1! + n2!, Math.max(d1!, d2!))), fText(fMul(fr(n1!, d1!), fr(n2!, d2!))), fText(fSub(fr(n1!, d1!), fr(n2!, d2!))), rawF(n1! + n2!, d1! * d2!)]);
    },
    why: (v, a) => `${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u01-08',
    d: 2,
    prompt: 'გამოთვალე: {e}.',
    vars: {
      spec: SPEC(['5|8|1|4', '3|4|1|8', '7|10|1|5', '5|6|1|3', '7|8|3|4', '9|10|2|5', '5|6|1|2', '3|4|1|2', '11|12|1|4', '7|12|1|3', '4|5|1|10', '7|10|2|5', '3|8|1|4', '5|8|1|2']),
      n1: D((v) => Number(String(v.spec).split('|')[0])),
      d1: D((v) => Number(String(v.spec).split('|')[1])),
      n2: D((v) => Number(String(v.spec).split('|')[2])),
      d2: D((v) => Number(String(v.spec).split('|')[3])),
      e: D((v) => `${N(v, 'n1')}/${N(v, 'd1')} ${MINUS} ${N(v, 'n2')}/${N(v, 'd2')}`),
    },
    answer: (v) => fText(fSub(fr(N(v, 'n1'), N(v, 'd1')), fr(N(v, 'n2'), N(v, 'd2')))),
    options: (v, right) => {
      const [n1, d1, n2, d2] = ['n1', 'd1', 'n2', 'd2'].map((k) => N(v, k)) as number[];
      return withUnique(right, [fText(fr(n1! - n2!, d1! - d2!)), fText(fr(n1! - n2!, Math.max(d1!, d2!))), fText(fAdd(fr(n1!, d1!), fr(n2!, d2!))), rawF(n1! - n2!, d1! * d2!), fText(fMul(fr(n1!, d1!), fr(n2!, d2!)))]);
    },
    why: (v, a) => `${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u01-08',
    d: 2,
    prompt: 'გამოთვალე: {e}.',
    vars: {
      d: I(3, 9),
      n1: I(1, (v) => N(v, 'd') - 1),
      n2: I(1, (v) => N(v, 'd') - 1),
      neg: C([1, -1]),
      e: D((v) => `${N(v, 'neg') < 0 ? MINUS : ''}${N(v, 'n1')}/${N(v, 'd')} + ${N(v, 'n2')}/${N(v, 'd')}`),
    },
    answer: (v) => fText(fAdd(fr(N(v, 'neg') * N(v, 'n1'), N(v, 'd')), fr(N(v, 'n2'), N(v, 'd')))),
    options: (v, right) => {
      const [n1, n2, d] = ['n1', 'n2', 'd'].map((k) => N(v, k)) as number[];
      const s = N(v, 'neg');
      return withUnique(right, [fText(fr(-(s * n1! + n2!), d!)), fText(fr(s * n1! + n2!, d! * 2)), fText(fr(Math.abs(s * n1!) + n2!, d!)), fText(fr(s * n1! - n2!, d!)), fText(fr(s * n1! + n2! + 1, d!))]);
    },
    why: (v, a) => `${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u01-08',
    d: 2,
    prompt: 'დაალაგე ზრდადობით: {list}. რომელია სწორი რიგი?',
    vars: {
      s: I(0, 99999),
      set: D((v) => sampleBy(['1/2', '1/4', '3/4', '1/5', '2/5', '3/5', '4/5', '0,3', '0,6', '0,7', '0,35', '0,45', '0,8'], N(v, 's'), 4).join('|')),
      list: D((v) => String(v.set).split('|').join('; ')),
    },
    constraints: [{ test: (v) => new Set(String(v.set).split('|').map(textValue)).size === 4, note: 'four different values' }],
    answer: (v) => sortedByValue(String(v.set).split('|')).join('; '),
    options: (v, right) => {
      const asc = sortedByValue(String(v.set).split('|'));
      const swapped = [...asc];
      [swapped[1], swapped[2]] = [swapped[2]!, swapped[1]!];
      const fractionsFirst = [...asc].sort((a, b) => Number(a.includes('/')) - Number(b.includes('/')) || textValue(a) - textValue(b)).reverse();
      return withUnique(right, [[...asc].reverse().join('; '), swapped.join('; '), fractionsFirst.join('; '), [asc[1], asc[0], ...asc.slice(2)].join('; ')]);
    },
    why: (_v, a) => `ყველა რიცხვს ერთნაირ ჩანაწერში გადავიყვანთ და შევადარებთ: ${a}.`,
  }),

  // ═════════ U01.9 — მოდული ═════════
  t({
    sub: 'u01-09',
    prompt: 'იპოვე |{aS}|.',
    vars: { a: I(-40, 40, { nonZero: true }), aS: S('a') },
    answer: (v) => sg(Math.abs(N(v, 'a'))),
    wrong: (v) => [-Math.abs(N(v, 'a')), N(v, 'a') < 0 ? N(v, 'a') : -N(v, 'a'), Math.abs(N(v, 'a')) + 1, Math.abs(N(v, 'a')) - 1],
    why: (v, a) => `რიცხვის მოდული არის მისი მანძილი ნულიდან: |${sg(N(v, 'a'))}| = ${a}.`,
  }),
  t({
    sub: 'u01-09',
    prompt: 'გამოთვალე: {e}.',
    vars: { a: I(-30, 30, { nonZero: true }), b: I(-30, 30, { nonZero: true }), e: D((v) => `|${sg(N(v, 'a'))}| + |${sg(N(v, 'b'))}|`) },
    answer: (v) => sg(Math.abs(N(v, 'a')) + Math.abs(N(v, 'b'))),
    wrong: (v) => [N(v, 'a') + N(v, 'b'), Math.abs(N(v, 'a') + N(v, 'b')), Math.abs(Math.abs(N(v, 'a')) - Math.abs(N(v, 'b'))), -(Math.abs(N(v, 'a')) + Math.abs(N(v, 'b')))],
    why: (v, a) => `${String(v.e)} = ${Math.abs(N(v, 'a'))} + ${Math.abs(N(v, 'b'))} = ${a}.`,
  }),
  t({
    sub: 'u01-09',
    prompt: 'გამოთვალე: {e}.',
    vars: { a: I(-30, 30, { nonZero: true }), b: I(-30, 30, { nonZero: true }), e: D((v) => `|${sg(N(v, 'a'))}| ${MINUS} |${sg(N(v, 'b'))}|`) },
    answer: (v) => sg(Math.abs(N(v, 'a')) - Math.abs(N(v, 'b'))),
    wrong: (v) => [Math.abs(N(v, 'a')) + Math.abs(N(v, 'b')), N(v, 'a') - N(v, 'b'), Math.abs(N(v, 'b')) - Math.abs(N(v, 'a')), N(v, 'a') + N(v, 'b')],
    why: (v, a) => `${String(v.e)} = ${Math.abs(N(v, 'a'))} ${MINUS} ${Math.abs(N(v, 'b'))} = ${a}.`,
  }),
  t({
    sub: 'u01-09',
    prompt: 'რომელი რიცხვებია დაშორებული ნულისგან {k} ერთეულით?',
    vars: { k: I(2, 30) },
    answer: (v) => `${MINUS}${N(v, 'k')} და ${N(v, 'k')}`,
    options: (v, right) => [right, `მხოლოდ ${N(v, 'k')}`, `მხოლოდ ${MINUS}${N(v, 'k')}`, `0 და ${N(v, 'k')}`],
    why: (v, a) => `ნულიდან ${N(v, 'k')} ერთეულით დაშორებულია ორი რიცხვი — ერთი მარცხნივ, მეორე მარჯვნივ: ${a}.`,
  }),
  t({
    sub: 'u01-09',
    prompt: 'იპოვე x, თუ |x| = {k} და x {w} 0.',
    vars: { spec: SPEC(['<|-1', '>|1']), w: F(0), k: I(2, 40) },
    answer: (v) => sg(Number(String(v.spec).split('|')[1]) * N(v, 'k')),
    wrong: (v) => { const dir = Number(String(v.spec).split('|')[1]); return [-dir * N(v, 'k'), 0, dir * (N(v, 'k') + 1), dir * (N(v, 'k') - 1)]; },
    why: (v, a) => `|x| = ${N(v, 'k')} ნიშნავს x = ±${N(v, 'k')}; პირობას აკმაყოფილებს ${a}.`,
  }),
  t({
    sub: 'u01-09',
    prompt: 'რომელი რიცხვის მოდული უფრო დიდია: {aS} თუ {bS}?',
    vars: { a: I(-25, 25, { nonZero: true }), b: I(-25, 25, { nonZero: true }), aS: S('a'), bS: S('b') },
    constraints: [{ test: (v) => Math.abs(N(v, 'a')) !== Math.abs(N(v, 'b')) && (N(v, 'a') < 0 || N(v, 'b') < 0), note: 'different moduli, one negative' }],
    optionCount: 2,
    answer: (v) => sg(Math.abs(N(v, 'a')) > Math.abs(N(v, 'b')) ? N(v, 'a') : N(v, 'b')),
    options: (v, right) => [right, sg(Math.abs(N(v, 'a')) > Math.abs(N(v, 'b')) ? N(v, 'b') : N(v, 'a'))],
    why: (v, a) => `|${sg(N(v, 'a'))}| = ${Math.abs(N(v, 'a'))}, |${sg(N(v, 'b'))}| = ${Math.abs(N(v, 'b'))}; უფრო დიდი მოდული აქვს ${a}-ს.`,
  }),

  // ═════════ U01.10 — რიცხვებისა და გამოსახულებების შედარება და დალაგება ═════════
  t({
    sub: 'u01-10',
    prompt: 'ჩასვი შესაბამისი ნიშანი: {aS} □ {bS}.',
    vars: { a: I(-12, 12), b: I(-12, 12), aS: S('a'), bS: S('b') },
    optionCount: 3,
    answer: (v) => sign3(N(v, 'a'), N(v, 'b')),
    options: () => SIGNS,
    why: (v, a) => `${sg(N(v, 'a'))} ${a} ${sg(N(v, 'b'))}.`,
  }),
  t({
    sub: 'u01-10',
    d: 2,
    prompt: 'ჩასვი შესაბამისი ნიშანი: {f} □ {x}.',
    vars: {
      spec: SPEC(['3/4|0,7', '3/4|0,8', '1/2|0,5', '2/5|0,4', '2/5|0,35', '1/4|0,3', '3/5|0,6', '3/5|0,65', '7/10|0,07', '7/10|0,7', '1/8|0,12', '1/8|0,13', '4/5|0,75', '9/20|0,5', '13/20|0,65']),
      f: F(0),
      x: F(1),
    },
    optionCount: 3,
    answer: (v) => sign3(Math.round(textValue(String(v.f)) * 1000), Math.round(readNumber(String(v.x)) * 1000)),
    options: () => SIGNS,
    why: (v, a) => `${String(v.f)} = ${dec(textValue(String(v.f)), 3)}; ${dec(textValue(String(v.f)), 3)} ${a} ${String(v.x)}.`,
  }),
  t({
    sub: 'u01-10',
    d: 2,
    prompt: 'დაალაგე კლებადობით: {list}. რომელია სწორი რიგი?',
    vars: {
      s: I(0, 99999),
      set: D((v) => sampleBy([-9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8], N(v, 's'), 5).join(',')),
      list: D((v) => String(v.set).split(',').map((x) => sg(Number(x))).join('; ')),
    },
    answer: (v) => listText(String(v.set).split(',').map(Number).sort((a, b) => b - a)),
    options: (v, right) => {
      const desc = String(v.set).split(',').map(Number).sort((a, b) => b - a);
      const byAbs = [...desc].sort((a, b) => Math.abs(b) - Math.abs(a) || b - a);
      const swapped = [...desc];
      [swapped[0], swapped[1]] = [swapped[1]!, swapped[0]!];
      const swappedLate = [...desc];
      [swappedLate[2], swappedLate[3]] = [swappedLate[3]!, swappedLate[2]!];
      return [right, listText([...desc].reverse()), listText(byAbs), listText(swapped), listText(swappedLate)];
    },
    why: (_v, a) => `კლებადობით ვწერთ ჯერ ყველაზე დიდს, ბოლოს ყველაზე მცირეს: ${a}.`,
  }),
  t({
    sub: 'u01-10',
    d: 2,
    prompt: 'შეადარე გამოსახულებები: {e1} □ {e2}.',
    vars: {
      a: I(10, 30), b: I(3, 12), c: I(25, 40), d: I(3, 12),
      e1: D((v) => `${N(v, 'a')} + ${N(v, 'b')}`),
      e2: D((v) => `${N(v, 'c')} ${MINUS} ${N(v, 'd')}`),
    },
    optionCount: 3,
    answer: (v) => sign3(N(v, 'a') + N(v, 'b'), N(v, 'c') - N(v, 'd')),
    options: () => SIGNS,
    why: (v, a) => `${N(v, 'a') + N(v, 'b')} ${a} ${N(v, 'c') - N(v, 'd')}.`,
  }),
  t({
    sub: 'u01-10',
    d: 2,
    prompt: 'დაალაგე ზრდადობით: {list}. რომელია სწორი რიგი?',
    vars: {
      s: I(0, 99999),
      set: D((v) => sampleBy(['1/3', '1/2', '2/3', '5/6', '1/6', '3/4', '1/4', '3/8', '5/8'], N(v, 's'), 4).join('|')),
      list: D((v) => String(v.set).split('|').join('; ')),
    },
    answer: (v) => sortedByValue(String(v.set).split('|')).join('; '),
    options: (v, right) => {
      const asc = sortedByValue(String(v.set).split('|'));
      const byDenominator = [...asc].sort((a, b) => Number(a.split('/')[1]) - Number(b.split('/')[1]) || Number(a.split('/')[0]) - Number(b.split('/')[0]));
      const swapped = [...asc];
      [swapped[1], swapped[2]] = [swapped[2]!, swapped[1]!];
      return withUnique(right, [[...asc].reverse().join('; '), byDenominator.join('; '), swapped.join('; '), [asc[1], asc[0], ...asc.slice(2)].join('; ')]);
    },
    why: (_v, a) => `წილადებს საერთო მნიშვნელზე ვიყვანთ და შევადარებთ: ${a}.`,
  }),
  t({
    sub: 'u01-10',
    d: 2,
    prompt: 'შეადარე გამოსახულებები: {e1} □ {e2}.',
    vars: {
      a: I(-20, 20, { nonZero: true }), b: I(-12, 12, { nonZero: true }), c: I(1, 12),
      e1: D((v) => `|${sg(N(v, 'a'))}|`),
      e2: D((v) => `|${sg(N(v, 'b'))}| + ${N(v, 'c')}`),
    },
    optionCount: 3,
    answer: (v) => sign3(Math.abs(N(v, 'a')), Math.abs(N(v, 'b')) + N(v, 'c')),
    options: () => SIGNS,
    why: (v, a) => `${Math.abs(N(v, 'a'))} ${a} ${Math.abs(N(v, 'b'))} + ${N(v, 'c')} = ${Math.abs(N(v, 'b')) + N(v, 'c')}.`,
  }),
];

// ─────────────────────────── local helpers ───────────────────────────

function rangePrimes(lo: number, hi: number): number[] {
  const out: number[] = [];
  for (let x = lo; x <= hi; x += 1) if (isPrime(x)) out.push(x);
  return out;
}

/** The value of `3/4` or `0,35` as a number. */
function textValue(text: string): number {
  if (text.includes('/')) {
    const [n, d] = text.split('/').map(Number);
    return n! / d!;
  }
  return readNumber(text);
}

/** Items ordered from smallest to largest by their value. */
function sortedByValue(items: string[]): string[] {
  return [...items].sort((a, b) => textValue(a) - textValue(b));
}

/** The key first, then the first distinct wrong options — never a duplicate. */
function withUnique(right: string, candidates: string[]): string[] {
  const out = [right];
  for (const c of candidates) if (!out.includes(c)) out.push(c);
  return out.slice(0, 4);
}
