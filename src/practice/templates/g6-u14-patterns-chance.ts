import type { QuestionTemplate } from './types';
import { C, D, F, I, N, SPEC, group, q6, sg } from './g6-helpers';

/**
 * Grade VI — Unit 14: კანონზომიერებები და ალბათობა (patterns and chance).
 *
 * Converted from the academy's `U14` bank: 6 subtopics × 6 questions.
 *
 * Sequences are built from a first term and a step (added or multiplied), shown
 * as a short run with a gap or an open end. In "which number does not belong"
 * the five numbers are four members of one family and one stranger, listed in
 * order. The wrong options are the slips of the topic: the last difference
 * added again, the ratio used as a step, the position mixed up with the value.
 */

export const G6_U14_SUBTOPICS = ['u14-01', 'u14-02', 'u14-03', 'u14-04', 'u14-05', 'u14-06'] as const;

const T = 'g6-patterns-chance';
let seq = 0;
const nextId = (): string => `g6-u14-q${String(++seq).padStart(2, '0')}`;
type Spec = Omit<Parameters<typeof q6>[0], 'id' | 'topic'>;
const t = (spec: Spec): QuestionTemplate => q6({ id: nextId(), topic: T, ...spec });

/** A run of numbers as printed: `3, 7, 11, 15`. */
const run = (xs: number[]): string => xs.map((x) => group(x)).join(', ');
/** A run closed by a gap: `3, 7, 11, 15, ___`. */
const open = (xs: number[]): string => `${run(xs)}, ___`;
/** The same run with one member hidden. */
const gap = (xs: number[], hole: number): string => xs.map((x, i) => (i === hole ? '___' : group(x))).join(', ');

const arith = (a: number, d: number, n: number): number[] => Array.from({ length: n }, (_, i) => a + i * d);
const geom = (a: number, r: number, n: number): number[] => Array.from({ length: n }, (_, i) => a * r ** i);

/** Wrong next terms for a sequence ending in `last`, previous term `prev`. */
const nextSlips = (last: number, prev: number, extra: number[] = []): number[] => [
  ...extra, last + (last - prev) + 1, last + (last - prev) - 1, last + 1, last - (last - prev), last + (last - prev) * 2, last * 2, last + 10,
];

const incArith = (sub: string, d: 1 | 2, prompt: string, hole: boolean): QuestionTemplate =>
  t({
    sub, d, prompt,
    vars: { a: I(2, 20), s: I(2, 9), sq: D((v) => (hole ? gap(arith(N(v, 'a'), N(v, 's'), 5), 3) : open(arith(N(v, 'a'), N(v, 's'), 4)))) },
    answer: (v) => sg(hole ? N(v, 'a') + 3 * N(v, 's') : N(v, 'a') + 4 * N(v, 's')),
    wrong: (v) => {
      const r = hole ? N(v, 'a') + 3 * N(v, 's') : N(v, 'a') + 4 * N(v, 's');
      return [r + 1, r - 1, r + N(v, 's'), r - N(v, 's'), r * 2, r + 2];
    },
    why: (v, a) => `ყოველ ჯერზე ემატება ${v.s}; ${hole ? `ცარიელი ადგილი: ${N(v, 'a') + 2 * N(v, 's')} + ${v.s} = ${a}` : `${N(v, 'a') + 3 * N(v, 's')} + ${v.s} = ${a}`}.`,
  });

const PRIMES = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61];
const COLORS = ['წითელი', 'ლურჯი', 'მწვანე', 'ყვითელი'];
const VERDICTS = ['შეუძლებელია', 'აუცილებელია', 'შესაძლებელია, მაგრამ არა აუცილებელი'];

export const G6_U14_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U14.1 — ზრდადი მიმდევრობები ═════════
  incArith('u14-01', 1, 'გააგრძელე მიმდევრობა: {sq}.', false),
  t({
    sub: 'u14-01',
    prompt: 'გააგრძელე მიმდევრობა: {sq}.',
    vars: { a: I(1, 9), r: C([2, 3, 4]), sq: D((v) => open(geom(N(v, 'a'), N(v, 'r'), 4))) },
    answer: (v) => sg(N(v, 'a') * N(v, 'r') ** 4),
    wrong: (v) => {
      const last = N(v, 'a') * N(v, 'r') ** 3;
      const prev = N(v, 'a') * N(v, 'r') ** 2;
      return nextSlips(last, prev, [last * (N(v, 'r') + 1), last + N(v, 'r'), last * N(v, 'r') + N(v, 'r')]);
    },
    why: (v, a) => `ყოველი წევრი წინაზე ${v.r}-ჯერ დიდია: ${N(v, 'a') * N(v, 'r') ** 3} × ${v.r} = ${a}.`,
  }),
  t({
    sub: 'u14-01',
    d: 2,
    prompt: 'იპოვე გამოტოვებული რიცხვი: {sq}.',
    vars: { a: I(1, 9), r: C([2, 3, 4]), sq: D((v) => gap(geom(N(v, 'a'), N(v, 'r'), 5), 3)) },
    answer: (v) => sg(N(v, 'a') * N(v, 'r') ** 3),
    wrong: (v) => {
      const a = N(v, 'a');
      const r = N(v, 'r');
      return [a * r ** 3 + 1, a * r ** 3 - 1, (a * r ** 2 + a * r ** 4) / 2, a * r ** 2 + r, a * r ** 4 - r, a * r ** 3 + a];
    },
    why: (v, a) => `წევრები ${v.r}-ჯერ იზრდება: ${N(v, 'a') * N(v, 'r') ** 2} × ${v.r} = ${a}.`,
  }),
  t({
    sub: 'u14-01',
    prompt: 'გააგრძელე მიმდევრობა: {sq}.',
    vars: { kind: C(['კვადრატები', 'კუბები']), k: I(1, 12), sq: D((v) => open(arith(N(v, 'k'), 1, 4).map((x) => (v.kind === 'კვადრატები' ? x ** 2 : x ** 3)))) },
    answer: (v) => sg((N(v, 'k') + 4) ** (v.kind === 'კვადრატები' ? 2 : 3)),
    wrong: (v) => {
      const p = v.kind === 'კვადრატები' ? 2 : 3;
      const last = (N(v, 'k') + 3) ** p;
      const prev = (N(v, 'k') + 2) ** p;
      return [last + (last - prev), last + (last - prev) - 2, last + (last - prev) + 2, (N(v, 'k') + 4) * p, last * 2, last + N(v, 'k') + 4].filter((x) => x !== (N(v, 'k') + 4) ** p);
    },
    why: (v, a) => `მიმდევრობა შედგება რიცხვების ${v.kind === 'კვადრატები' ? 'კვადრატებისგან' : 'კუბებისგან'}: ${N(v, 'k') + 4}${v.kind === 'კვადრატები' ? '²' : '³'} = ${a}.`,
  }),
  incArith('u14-01', 2, 'იპოვე გამოტოვებული რიცხვი: {sq}.', true),
  t({
    sub: 'u14-01',
    d: 2,
    prompt: 'მიმდევრობა იწყება {a}-ით და ყოველ მომდევნო წევრზე {r}-ჯერ იზრდება. იპოვე მიმდევრობის მე-5 წევრი.',
    vars: { a: I(1, 6), r: C([2, 3]) },
    answer: (v) => sg(N(v, 'a') * N(v, 'r') ** 4),
    wrong: (v) => [N(v, 'a') * N(v, 'r') ** 3, N(v, 'a') * N(v, 'r') ** 5, N(v, 'a') + 4 * N(v, 'r'), N(v, 'a') * N(v, 'r') * 4, N(v, 'a') * 5 * N(v, 'r'), N(v, 'a') * N(v, 'r') ** 4 + N(v, 'a')],
    why: (v, a) => `${geom(N(v, 'a'), N(v, 'r'), 5).map(group).join(', ')}; მე-5 წევრია ${a}.`,
  }),

  // ═════════ U14.2 — კლებადი მიმდევრობები ═════════
  t({
    sub: 'u14-02',
    prompt: 'გააგრძელე მიმდევრობა: {sq}.',
    vars: { a: I(20, 60), s: I(2, 9), sq: D((v) => open(arith(N(v, 'a'), -N(v, 's'), 4))) },
    constraints: [{ test: (v) => N(v, 'a') - 4 * N(v, 's') > 0, note: 'stays positive' }],
    answer: (v) => sg(N(v, 'a') - 4 * N(v, 's')),
    wrong: (v) => {
      const r = N(v, 'a') - 4 * N(v, 's');
      return [r + 1, r - 1, r + N(v, 's'), r - N(v, 's'), r + 2, r + 2 * N(v, 's')];
    },
    why: (v, a) => `ყოველ ჯერზე მცირდება ${v.s}-ით: ${N(v, 'a') - 3 * N(v, 's')} − ${v.s} = ${a}.`,
  }),
  t({
    sub: 'u14-02',
    prompt: 'გააგრძელე მიმდევრობა: {sq}.',
    vars: { e: I(1, 6), r: C([2, 3]), sq: D((v) => open(geom(N(v, 'e'), N(v, 'r'), 5).slice(1).reverse())) },
    answer: (v) => sg(N(v, 'e')),
    wrong: (v) => {
      const last = N(v, 'e') * N(v, 'r');
      const prev = N(v, 'e') * N(v, 'r') ** 2;
      return [last - (prev - last), last - 1, last - N(v, 'r'), N(v, 'e') + 1, N(v, 'e') * 2, last / 2 + 1, last - 2].filter((x) => x > 0);
    },
    why: (v, a) => `ყოველი წევრი წინაზე ${v.r}-ჯერ ნაკლებია: ${N(v, 'e') * N(v, 'r')} ÷ ${v.r} = ${a}.`,
  }),
  t({
    sub: 'u14-02',
    d: 2,
    prompt: 'იპოვე გამოტოვებული რიცხვი: {sq}.',
    vars: { a: I(60, 150), s: C([5, 10, 15, 20]), sq: D((v) => gap(arith(N(v, 'a'), -N(v, 's'), 5), 3)) },
    constraints: [{ test: (v) => N(v, 'a') - 4 * N(v, 's') > 0, note: 'stays positive' }],
    answer: (v) => sg(N(v, 'a') - 3 * N(v, 's')),
    wrong: (v) => {
      const r = N(v, 'a') - 3 * N(v, 's');
      return [r + N(v, 's'), r - N(v, 's'), r + 1, r - 1, r + 2 * N(v, 's')];
    },
    why: (v, a) => `ყოველ ჯერზე მცირდება ${v.s}-ით: ${N(v, 'a') - 2 * N(v, 's')} − ${v.s} = ${a}.`,
  }),
  t({
    sub: 'u14-02',
    prompt: 'გააგრძელე მიმდევრობა: {sq}.',
    vars: { e: I(1, 5), r: C([3, 4, 5]), sq: D((v) => open(geom(N(v, 'e'), N(v, 'r'), 5).slice(1).reverse())) },
    answer: (v) => sg(N(v, 'e')),
    wrong: (v) => {
      const last = N(v, 'e') * N(v, 'r');
      const prev = N(v, 'e') * N(v, 'r') ** 2;
      return [last - (prev - last), last - 1, last - N(v, 'r'), N(v, 'e') + 1, N(v, 'e') * 2, last - 2].filter((x) => x > 0);
    },
    why: (v, a) => `ყოველი წევრი წინაზე ${v.r}-ჯერ ნაკლებია: ${N(v, 'e') * N(v, 'r')} ÷ ${v.r} = ${a}.`,
  }),
  t({
    sub: 'u14-02',
    d: 2,
    prompt: 'იპოვე გამოტოვებული რიცხვი: {sq}.',
    vars: { a: I(50, 99), s: I(3, 9), sq: D((v) => gap(arith(N(v, 'a'), -N(v, 's'), 5), 3)) },
    answer: (v) => sg(N(v, 'a') - 3 * N(v, 's')),
    wrong: (v) => {
      const r = N(v, 'a') - 3 * N(v, 's');
      return [r + N(v, 's'), r - N(v, 's'), r + 1, r - 1, r + 2 * N(v, 's')];
    },
    why: (v, a) => `ყოველ ჯერზე მცირდება ${v.s}-ით: ${N(v, 'a') - 2 * N(v, 's')} − ${v.s} = ${a}.`,
  }),
  t({
    sub: 'u14-02',
    d: 2,
    prompt: 'მიმდევრობა იწყება {a}-ით და ყოველი მომდევნო წევრი წინაზე {r}-ჯერ ნაკლებია. იპოვე მე-5 წევრი.',
    vars: { e: I(2, 20), r: C([2, 3]), a: D((v) => N(v, 'e') * N(v, 'r') ** 4) },
    answer: (v) => sg(N(v, 'e')),
    wrong: (v) => [N(v, 'e') * N(v, 'r'), N(v, 'e') * N(v, 'r') ** 2, N(v, 'e') * N(v, 'r') ** 3, N(v, 'e') + 1, N(v, 'e') * 2, N(v, 'a') / 4],
    why: (v, a) => `${geom(N(v, 'e'), N(v, 'r'), 5).reverse().map(group).join(', ')}; მე-5 წევრია ${a}.`,
  }),

  // ═════════ U14.3 — რომელი რიცხვია ზედმეტი? ═════════
  t({
    sub: 'u14-03',
    prompt: 'რომელი რიცხვია ზედმეტი: {sq}?',
    vars: { a: I(1, 14), b: I(1, 14), c: I(1, 14), e: I(1, 14), o: I(0, 14), sq: D((v) => run([2 * N(v, 'a'), 2 * N(v, 'b'), 2 * N(v, 'c'), 2 * N(v, 'e'), 2 * N(v, 'o') + 1].sort((x, y) => x - y))) },
    constraints: [{ test: (v) => new Set([N(v, 'a'), N(v, 'b'), N(v, 'c'), N(v, 'e')]).size === 4, note: 'four different evens' }],
    optionCount: 5,
    answer: (v) => sg(2 * N(v, 'o') + 1),
    wrong: (v) => [2 * N(v, 'a'), 2 * N(v, 'b'), 2 * N(v, 'c'), 2 * N(v, 'e')],
    why: (_v, a) => `ოთხი რიცხვი ლუწია, ${a} კი კენტია.`,
  }),
  t({
    sub: 'u14-03',
    prompt: 'რომელი რიცხვია ზედმეტი: {sq}?',
    vars: { m: C([3, 4, 5, 6, 7, 9]), a: I(1, 9), b: I(1, 9), c: I(1, 9), e: I(1, 9), f: I(10, 12), r: I(1, 2), x: D((v) => N(v, 'f') * N(v, 'm') + N(v, 'r')), sq: D((v) => run([N(v, 'a') * N(v, 'm'), N(v, 'b') * N(v, 'm'), N(v, 'c') * N(v, 'm'), N(v, 'e') * N(v, 'm'), N(v, 'x')].sort((p, q) => p - q))) },
    constraints: [{ test: (v) => new Set([N(v, 'a'), N(v, 'b'), N(v, 'c'), N(v, 'e')]).size === 4 && N(v, 'x') % N(v, 'm') !== 0 && N(v, 'r') < N(v, 'm'), note: 'four multiples and a stranger' }],
    optionCount: 5,
    answer: (v) => sg(N(v, 'x')),
    wrong: (v) => [N(v, 'a') * N(v, 'm'), N(v, 'b') * N(v, 'm'), N(v, 'c') * N(v, 'm'), N(v, 'e') * N(v, 'm')],
    why: (v, a) => `ოთხი რიცხვი იყოფა ${v.m}-ზე, ${a} კი არ იყოფა.`,
  }),
  t({
    sub: 'u14-03',
    prompt: 'რომელი რიცხვია ზედმეტი: {sq}?',
    vars: { a: I(1, 10), b: I(1, 10), c: I(1, 10), e: I(1, 10), x: C([2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 22, 23, 24, 26, 27, 28, 29, 30, 31, 33, 34, 35, 37, 38, 39, 40, 41, 42, 43]), sq: D((v) => run([N(v, 'a') ** 2, N(v, 'b') ** 2, N(v, 'c') ** 2, N(v, 'e') ** 2, N(v, 'x')].sort((p, q) => p - q))) },
    constraints: [{ test: (v) => new Set([N(v, 'a'), N(v, 'b'), N(v, 'c'), N(v, 'e')]).size === 4 && [N(v, 'a'), N(v, 'b'), N(v, 'c'), N(v, 'e')].every((k) => k * k !== N(v, 'x')), note: 'four squares and a stranger' }],
    optionCount: 5,
    answer: (v) => sg(N(v, 'x')),
    wrong: (v) => [N(v, 'a') ** 2, N(v, 'b') ** 2, N(v, 'c') ** 2, N(v, 'e') ** 2],
    why: (_v, a) => `ოთხი რიცხვი სრული კვადრატია, ${a} კი — არა.`,
  }),
  t({
    sub: 'u14-03',
    d: 2,
    prompt: 'რომელი რიცხვია ზედმეტი: {sq}?',
    vars: { a: I(2, 9), s: I(3, 9), p: I(1, 4), off: C([1, 2, 3, -1, -2, -3]), x: D((v) => N(v, 'a') + N(v, 'p') * N(v, 's') + N(v, 'off')), sq: D((v) => run(arith(N(v, 'a'), N(v, 's'), 5).map((y, i) => (i === N(v, 'p') ? N(v, 'x') : y)))) },
    constraints: [{ test: (v) => Math.abs(N(v, 'off')) < N(v, 's'), note: 'a stranger, not another term' }],
    optionCount: 5,
    answer: (v) => sg(N(v, 'x')),
    wrong: (v) => arith(N(v, 'a'), N(v, 's'), 5).filter((_, i) => i !== N(v, 'p')),
    why: (v, a) => `წევრები უნდა იზრდებოდეს ${v.s}-ით: ${N(v, 'a')}, ${N(v, 'a') + N(v, 's')}, ${N(v, 'a') + 2 * N(v, 's')}, ... ; ${a} არ ჯდება წესში (იქნებოდა ${N(v, 'a') + N(v, 'p') * N(v, 's')}).`,
  }),
  t({
    sub: 'u14-03',
    d: 2,
    prompt: 'რომელი რიცხვია ზედმეტი: {sq}?',
    vars: { a: I(1, 6), r: C([2, 3]), p: I(2, 4), off: C([1, 2, -1, -2]), x: D((v) => N(v, 'a') * N(v, 'r') ** N(v, 'p') + N(v, 'off')), sq: D((v) => run(geom(N(v, 'a'), N(v, 'r'), 5).map((y, i) => (i === N(v, 'p') ? N(v, 'x') : y)))) },
    optionCount: 5,
    answer: (v) => sg(N(v, 'x')),
    wrong: (v) => geom(N(v, 'a'), N(v, 'r'), 5).filter((_, i) => i !== N(v, 'p')),
    why: (v, a) => `ყოველი წევრი წინაზე ${v.r}-ჯერ დიდი უნდა იყოს; ${a} არ ჯდება წესში (იქნებოდა ${N(v, 'a') * N(v, 'r') ** N(v, 'p')}).`,
  }),
  t({
    sub: 'u14-03',
    d: 2,
    prompt: 'რომელი რიცხვია ზედმეტი: {sq}?',
    vars: { i1: I(0, 13), i2: I(0, 13), i3: I(0, 13), i4: I(0, 13), x: C([15, 21, 25, 27, 33, 35, 39, 45, 49, 51, 55, 57]), sq: D((v) => run([...[N(v, 'i1'), N(v, 'i2'), N(v, 'i3'), N(v, 'i4')].map((i) => PRIMES[i]!), N(v, 'x')].sort((p, q) => p - q))) },
    constraints: [{ test: (v) => new Set([N(v, 'i1'), N(v, 'i2'), N(v, 'i3'), N(v, 'i4')]).size === 4, note: 'four different primes' }],
    optionCount: 5,
    answer: (v) => sg(N(v, 'x')),
    wrong: (v) => [N(v, 'i1'), N(v, 'i2'), N(v, 'i3'), N(v, 'i4')].map((i) => PRIMES[i]!),
    why: (_v, a) => `ოთხი რიცხვი მარტივია, ${a} კი შედგენილია.`,
  }),

  // ═════════ U14.4 — პროგნოზის გაკეთება ═════════
  t({
    sub: 'u14-04',
    prompt: 'მიმდევრობაა {sq}, ... რა იქნება შემდეგი რიცხვი?',
    vars: { a: I(2, 9), s: I(2, 9), sq: D((v) => run(arith(N(v, 'a'), N(v, 's'), 4))) },
    answer: (v) => sg(N(v, 'a') + 4 * N(v, 's')),
    wrong: (v) => [N(v, 'a') + 4 * N(v, 's') + 1, N(v, 'a') + 4 * N(v, 's') - 1, N(v, 'a') + 5 * N(v, 's'), N(v, 'a') + 3 * N(v, 's'), N(v, 'a') + 4 * N(v, 's') + 2],
    why: (v, a) => `ყოველ ჯერზე ემატება ${v.s}: ${N(v, 'a') + 3 * N(v, 's')} + ${v.s} = ${a}.`,
  }),
  t({
    sub: 'u14-04',
    prompt: 'ყუთში {r} {c1} და {b} {c2} ბურთია. თუ ერთი ბურთი შემთხვევით ამოიღეს, რომელი ფერის ბურთის ამოღებაა უფრო მოსალოდნელი?',
    vars: { spec: SPEC(['წითელი|ლურჯი', 'მწვანე|ყვითელი', 'თეთრი|შავი', 'ყვითელი|ლურჯი', 'წითელი|მწვანე']), c1: F(0), c2: F(1), r: I(1, 9), b: I(1, 9) },
    optionCount: 3,
    answer: (v) => (N(v, 'r') > N(v, 'b') ? String(v.c1) : N(v, 'r') < N(v, 'b') ? String(v.c2) : 'ორივე ერთნაირად მოსალოდნელია'),
    options: (v, right) => [right, String(v.c1), String(v.c2), 'ორივე ერთნაირად მოსალოდნელია'],
    why: (v, a) => `${v.c1}: ${v.r}, ${v.c2}: ${v.b}; ${N(v, 'r') === N(v, 'b') ? 'რაოდენობები ტოლია' : 'მეტი ბურთია'} — ${a}.`,
  }),
  t({
    sub: 'u14-04',
    prompt: 'მცენარის სიმაღლე ყოველ კვირას {d} სმ-ით იზრდება. თუ ახლა {h} სმ-ია, რამდენი სანტიმეტრი იქნება {w} კვირის შემდეგ?',
    vars: { d: I(2, 6), h: I(5, 30), w: I(3, 8) },
    answer: (v) => sg(N(v, 'h') + N(v, 'd') * N(v, 'w')),
    wrong: (v) => [N(v, 'h') + N(v, 'd') + N(v, 'w'), N(v, 'h') * N(v, 'd') * N(v, 'w'), N(v, 'h') + N(v, 'd') * (N(v, 'w') - 1), N(v, 'h') + N(v, 'd') * (N(v, 'w') + 1), N(v, 'd') * N(v, 'w')],
    why: (v, a) => `${v.d} × ${v.w} = ${N(v, 'd') * N(v, 'w')}; ${v.h} + ${N(v, 'd') * N(v, 'w')} = ${a}.`,
  }),
  t({
    sub: 'u14-04',
    d: 2,
    prompt: 'მიმდევრობაა {sq}, ... რა იქნება შემდეგი რიცხვი?',
    vars: { k: I(1, 9), sq: D((v) => run(Array.from({ length: 5 }, (_, i) => ((N(v, 'k') + i) * (N(v, 'k') + i + 1)) / 2))) },
    answer: (v) => sg(((N(v, 'k') + 5) * (N(v, 'k') + 6)) / 2),
    wrong: (v) => {
      const last = ((N(v, 'k') + 4) * (N(v, 'k') + 5)) / 2;
      return [last + N(v, 'k') + 4, last + N(v, 'k') + 6, last + N(v, 'k') + 5 - 1, last * 2, last + 1, last + 10].filter((x) => x !== ((N(v, 'k') + 5) * (N(v, 'k') + 6)) / 2);
    },
    why: (v, a) => `სხვაობები 1-ით იზრდება: ${N(v, 'k') + 1}, ${N(v, 'k') + 2}, ... ; ბოლოს ემატება ${N(v, 'k') + 5}: ${a}.`,
  }),
  t({
    sub: 'u14-04',
    d: 2,
    prompt: 'ავტობუსში პირველ გაჩერებაზე {a} მგზავრი ავიდა, მეორეზე — {b}, მესამეზე — {a}, მეოთხეზე — {b}. თუ ეს წესი გაგრძელდა, რამდენი მგზავრი ავა მეხუთე გაჩერებაზე?',
    vars: { a: I(3, 12), b: I(3, 12) },
    constraints: [{ test: (v) => N(v, 'a') !== N(v, 'b'), note: 'two different numbers' }],
    answer: (v) => sg(N(v, 'a')),
    wrong: (v) => [N(v, 'b'), N(v, 'a') + N(v, 'b'), Math.abs(N(v, 'a') - N(v, 'b')), N(v, 'a') + 1, N(v, 'a') - 1],
    why: (v, a) => `წესი მეორდება ორ-ორ გაჩერებაზე: ${v.a}, ${v.b}, ${v.a}, ${v.b}, ${a}.`,
  }),
  t({
    sub: 'u14-04',
    d: 3,
    prompt: 'მიმდევრობაა {sq}, ... ყოველი შემდეგი რიცხვი მიიღება წინა რიცხვის {m}-ზე გამრავლებით და {c}-ის დამატებით. რა იქნება შემდეგი რიცხვი?',
    vars: { s: I(1, 4), m: C([2, 3]), c: I(1, 5), sq: D((v) => run(recurrence(N(v, 's'), N(v, 'm'), N(v, 'c'), 4))) },
    answer: (v) => sg(recurrence(N(v, 's'), N(v, 'm'), N(v, 'c'), 5)[4]!),
    wrong: (v) => {
      const xs = recurrence(N(v, 's'), N(v, 'm'), N(v, 'c'), 5);
      const last = xs[3]!;
      return [last * N(v, 'm'), last + N(v, 'c'), last * N(v, 'm') - N(v, 'c'), last + (last - xs[2]!), last * N(v, 'm') + N(v, 'c') + 1, last * N(v, 'm') + 2 * N(v, 'c')];
    },
    why: (v, a) => `${recurrence(N(v, 's'), N(v, 'm'), N(v, 'c'), 4)[3]} × ${v.m} + ${v.c} = ${a}.`,
  }),

  // ═════════ U14.5 — შეუძლებელი და აუცილებელი მოვლენები ═════════
  certainty('u14-05', 1, 'ჩვეულებრივი ექვსწახნაგა კამათლის გაგორებისას {ev} შეუძლებელია თუ აუცილებელია?', ['7-ის მიღება|0', '0-ის მიღება|0', '8-ის მიღება|0', '10-ის მიღება|0', '1-დან 6-მდე რომელიმე რიცხვის მიღება|1', '6-ზე მეტი რიცხვის მიღება|0', '7-ზე ნაკლები რიცხვის მიღება|1', '1-ზე არანაკლები რიცხვის მიღება|1']),
  t({
    sub: 'u14-05',
    prompt: 'ჩანთაში მხოლოდ {c1} ბურთებია. ერთი ბურთის ამოღებისას {c2} ბურთის მიღება შეუძლებელია თუ აუცილებელია?',
    vars: { c1: C(COLORS), c2: C(COLORS) },
    optionCount: 2,
    answer: (v) => (v.c1 === v.c2 ? 'აუცილებელია' : 'შეუძლებელია'),
    options: (_v, right) => [right, right === 'აუცილებელია' ? 'შეუძლებელია' : 'აუცილებელია'],
    why: (v, a) => (v.c1 === v.c2 ? `ჩანთაში ყველა ბურთი ${v.c1}-ია, ამიტომ ${v.c2} ბურთის მიღება ${a}.` : `ჩანთაში ${v.c2} ბურთი არ არის, ამიტომ მისი მიღება ${a}.`),
  }),
  certainty('u14-05', 1, 'მონეტის აგდებისას {ev} შეუძლებელია თუ აუცილებელია?', ['გერბის ან საფასურის მიღება|1', 'გერბისა და საფასურის ერთდროულად მიღება|0', 'ორივე მხარის ერთდროულად მიღება|0', 'ზუსტად ერთი მხარის მიღება|1', 'გერბის ან საფასურის გარდა სხვა მხარის მიღება|0', 'გერბის მიღება, ან გერბის მიუღებლობა|1', 'სამი სხვადასხვა მხარის მიღება|0', 'ორი მხარიდან ერთ-ერთის მიღება|1']),
  t({
    sub: 'u14-05',
    prompt: 'ყუთში არის {a} {c1} და {b} {c2} ბურთი. ერთი ბურთის ამოღებისას {ev} შეუძლებელია თუ აუცილებელია?',
    vars: {
      spec: SPEC(COLORS.map((c, i) => `${c}|${COLORS[(i + 1) % COLORS.length]}|${COLORS[(i + 2) % COLORS.length]}`)),
      c1: F(0), c2: F(1), c3: F(2), a: I(2, 9), b: I(2, 9), kind: C(['both', 'third']),
      ev: D((v) => (v.kind === 'both' ? `${v.c1} ან ${v.c2} ბურთის მიღება` : `${v.c3} ბურთის მიღება`)),
    },
    optionCount: 2,
    answer: (v) => (v.kind === 'both' ? 'აუცილებელია' : 'შეუძლებელია'),
    options: (_v, right) => [right, right === 'აუცილებელია' ? 'შეუძლებელია' : 'აუცილებელია'],
    why: (v, a) => (v.kind === 'both' ? `ყუთში მხოლოდ ${v.c1} და ${v.c2} ბურთებია, ამიტომ ერთ-ერთის ამოღება ${a}.` : `ყუთში ${v.c3} ბურთი არ არის, ამიტომ მისი ამოღება ${a}.`),
  }),
  certainty('u14-05', 1, 'ჩვეულებრივი ექვსწახნაგა კამათლის გაგორებისას {ev} შეუძლებელია თუ აუცილებელია?', ['ერთდროულად ლუწი და კენტი რიცხვის მიღება|0', 'ლუწი ან კენტი რიცხვის მიღება|1', '6-ზე დიდი რიცხვის მიღება|0', 'ერთნიშა რიცხვის მიღება|1', 'ნულის მიღება|0', 'ათზე ნაკლები რიცხვის მიღება|1', '100-ის მიღება|0', '6-ზე ნაკლები ან 6-ის ტოლი რიცხვის მიღება|1', '1-ზე ნაკლები რიცხვის მიღება|0', '9-ის მიღება|0']),
  t({
    sub: 'u14-05',
    d: 2,
    prompt: 'ჩვეულებრივი ექვსწახნაგა კამათლის გაგორებისას {ev} შეუძლებელია, აუცილებელია თუ შესაძლებელია, მაგრამ არა აუცილებელი?',
    vars: { spec: SPEC(['ლუწი რიცხვის მიღება|2', '3-ზე მეტი რიცხვის მიღება|2', '5-ის მიღება|2', '1-ის მიღება|2', 'ლუწი ან კენტი რიცხვის მიღება|1', '7-ის მიღება|0', 'კენტი რიცხვის მიღება|2', '6-ზე მეტი რიცხვის მიღება|0', '7-ზე ნაკლები რიცხვის მიღება|1', '2-ზე მეტი რიცხვის მიღება|2', '4-ის მიღება|2', '3-ის ჯერადი რიცხვის მიღება|2', '12-ის მიღება|0', '1-ზე მეტი ან 1-ის ტოლი რიცხვის მიღება|1']), ev: F(0), k: F(1) },
    optionCount: 3,
    answer: (v) => VERDICTS[N(v, 'k')]!,
    options: (_v, right) => [right, ...VERDICTS.filter((x) => x !== right)],
    why: (v, a) => `${String(v.ev)}: ${a}.`,
  }),

  // ═════════ U14.6 — ფაქტორიალი ═════════
  ...([[2, 6], [3, 8], [4, 9]] as const).map(([lo, hi], i) =>
    t({
      sub: 'u14-06', d: i === 2 ? 2 : 1,
      prompt: 'გამოთვალე {n}!.',
      vars: { n: I(lo, hi) },
      answer: (v) => sg(factorial(N(v, 'n'))),
      wrong: (v) => [factorial(N(v, 'n') - 1), factorial(N(v, 'n') + 1), N(v, 'n') ** 2, (N(v, 'n') * (N(v, 'n') + 1)) / 2, N(v, 'n') * 2, factorial(N(v, 'n')) + N(v, 'n')],
      why: (v, a) => `${v.n}! = ${Array.from({ length: N(v, 'n') }, (_, k) => N(v, 'n') - k).join(' × ')} = ${a}.`,
    }),
  ),
  t({
    sub: 'u14-06',
    d: 2,
    prompt: 'გამოთვალე {n}!/{k}!.',
    vars: { n: I(4, 8), k: I(2, 5) },
    constraints: [{ test: (v) => N(v, 'k') < N(v, 'n') - 1, note: 'a product of at least two factors' }],
    answer: (v) => sg(factorial(N(v, 'n')) / factorial(N(v, 'k'))),
    wrong: (v) => [N(v, 'n') - N(v, 'k'), factorial(N(v, 'n') - N(v, 'k')), N(v, 'n') / N(v, 'k'), factorial(N(v, 'n')) / N(v, 'k'), factorial(N(v, 'n') / 1) / factorial(N(v, 'k')) + 1],
    why: (v, a) => `${v.n}!/${v.k}! = ${Array.from({ length: N(v, 'n') - N(v, 'k') }, (_, i) => N(v, 'n') - i).join(' × ')} = ${a}.`,
  }),
  t({
    sub: 'u14-06',
    d: 2,
    prompt: 'გამოთვალე {a}! + {b}!.',
    vars: { a: I(3, 8), b: I(2, 6) },
    constraints: [{ test: (v) => N(v, 'b') < N(v, 'a'), note: 'b below a' }],
    answer: (v) => sg(factorial(N(v, 'a')) + factorial(N(v, 'b'))),
    wrong: (v) => [factorial(N(v, 'a') + N(v, 'b')), factorial(N(v, 'a')) * factorial(N(v, 'b')), factorial(N(v, 'a')) + N(v, 'b'), N(v, 'a') + N(v, 'b'), factorial(N(v, 'a')) + factorial(N(v, 'b')) + 1],
    why: (v, a) => `${v.a}! = ${factorial(N(v, 'a'))}, ${v.b}! = ${factorial(N(v, 'b'))}; ${factorial(N(v, 'a'))} + ${factorial(N(v, 'b'))} = ${a}.`,
  }),
  t({
    sub: 'u14-06',
    d: 2,
    prompt: 'გამოთვალე {n}!/{k}!.',
    vars: { n: I(5, 10), c: C([2, 3]), k: D((v) => N(v, 'n') - N(v, 'c')) },
    answer: (v) => sg(factorial(N(v, 'n')) / factorial(N(v, 'k'))),
    wrong: (v) => [N(v, 'n') * 2, N(v, 'c'), factorial(N(v, 'c')), N(v, 'n') + N(v, 'n') - 1, N(v, 'n') * (N(v, 'n') - 1) * (N(v, 'n') - 2) + 1, (N(v, 'n') - 1) * (N(v, 'n') - 2), N(v, 'n') ** N(v, 'c')],
    why: (v, a) => `${v.n}!/${v.k}! = ${Array.from({ length: N(v, 'c') }, (_, i) => N(v, 'n') - i).join(' × ')} = ${a}.`,
  }),
];


function factorial(n: number): number {
  let r = 1;
  for (let k = 2; k <= n; k += 1) r *= k;
  return r;
}

/** `start`, then each term × m + c. */
function recurrence(start: number, m: number, c: number, count: number): number[] {
  const out = [start];
  while (out.length < count) out.push(out[out.length - 1]! * m + c);
  return out;
}

/** "Impossible or certain?" with an event drawn from rows `event|1 (certain) or 0 (impossible)`. */
function certainty(sub: string, d: 1 | 2, prompt: string, rows: string[]): QuestionTemplate {
  return t({
    sub, d, prompt,
    vars: { spec: SPEC(rows), ev: F(0), k: F(1) },
    optionCount: 2,
    answer: (v) => VERDICTS[N(v, 'k')]!,
    options: (_v, right) => [right, right === VERDICTS[0] ? VERDICTS[1]! : VERDICTS[0]!],
    why: (v, a) => `${String(v.ev)}: ${a}.`,
  });
}
