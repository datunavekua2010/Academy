import type { QuestionTemplate } from './types';
import { C, D, F, I, N, SPEC, group, powerText, q6, sg } from './g6-helpers';

/**
 * Grade VI — Unit 13: ხარისხები და ფესვები (powers and roots).
 *
 * Converted from the academy's `U13` bank: 4 subtopics × 6 questions.
 *
 * Powers are printed with true superscripts (`2⁴`, `7²`), roots with `√` and
 * `∛`. A root is always of a perfect square or cube drawn as `k²` or `k³`, so
 * the answer is a whole number. Wrong options are the slips of the topic: the
 * exponent used as a factor (2⁴ = 8), a square taken for a cube, a root
 * halved, a perimeter for an area.
 */

export const G6_U13_SUBTOPICS = ['u13-01', 'u13-02', 'u13-03', 'u13-04'] as const;

const T = 'g6-powers-roots';
let seq = 0;
const nextId = (): string => `g6-u13-q${String(++seq).padStart(2, '0')}`;
type Spec = Omit<Parameters<typeof q6>[0], 'id' | 'topic'>;
const t = (spec: Spec): QuestionTemplate => q6({ id: nextId(), topic: T, ...spec });

const pw = (b: number, e: number): string => powerText(b, e);

/** The usual wrong results of `b` to the power `e`. */
const powerSlips = (b: number, e: number): number[] => [b * e, b ** (e - 1), b ** (e + 1), b + e, e ** b, b * b + e, 2 * b, b ** 2 + b];

export const G6_U13_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U13.1 — ხარისხი და ფართობი ═════════
  t({
    sub: 'u13-01',
    prompt: 'გამოთვალე {pw}.',
    vars: { b: I(2, 9), e: C([2, 3, 4]), pw: D((v) => pw(N(v, 'b'), N(v, 'e'))) },
    constraints: [{ test: (v) => N(v, 'b') ** N(v, 'e') <= 2000, note: 'a modest result' }],
    answer: (v) => sg(N(v, 'b') ** N(v, 'e')),
    wrong: (v) => powerSlips(N(v, 'b'), N(v, 'e')),
    why: (v, a) => `${v.pw} = ${Array.from({ length: N(v, 'e') }, () => N(v, 'b')).join(' × ')} = ${a}.`,
  }),
  t({
    sub: 'u13-01',
    prompt: 'გამოთვალე {pw}.',
    vars: { b: I(2, 6), e: C([3, 4, 5]), pw: D((v) => pw(N(v, 'b'), N(v, 'e'))) },
    constraints: [{ test: (v) => N(v, 'b') ** N(v, 'e') <= 3000, note: 'a modest result' }],
    answer: (v) => sg(N(v, 'b') ** N(v, 'e')),
    wrong: (v) => powerSlips(N(v, 'b'), N(v, 'e')),
    why: (v, a) => `${v.pw} = ${Array.from({ length: N(v, 'e') }, () => N(v, 'b')).join(' × ')} = ${a}.`,
  }),
  t({
    sub: 'u13-01',
    prompt: 'კვადრატის გვერდის სიგრძეა {a} სმ. იპოვე მისი ფართობი.',
    vars: { a: I(3, 20) },
    answer: (v) => `${group(N(v, 'a') ** 2)} სმ²`,
    wrong: (v) => [4 * N(v, 'a'), 2 * N(v, 'a'), N(v, 'a') ** 3, N(v, 'a') ** 2 + N(v, 'a'), N(v, 'a') ** 2 - N(v, 'a'), N(v, 'a') ** 2 + 10].map((x) => `${group(x)} სმ²`),
    why: (v, a) => `S = ${v.a} × ${v.a} = ${a}.`,
  }),
  t({
    sub: 'u13-01',
    d: 2,
    prompt: 'კვადრატის ფართობია {s} სმ². იპოვე მისი გვერდის სიგრძე.',
    vars: { a: I(4, 25), s: D((v) => group(N(v, 'a') ** 2)) },
    answer: (v) => `${N(v, 'a')} სმ`,
    wrong: (v) => [N(v, 'a') ** 2 / 2, N(v, 'a') ** 2 / 4, N(v, 'a') + 1, N(v, 'a') - 1, 4 * N(v, 'a'), N(v, 'a') * 2].filter((x) => Number.isInteger(x) && x > 0).map((x) => `${group(x)} სმ`),
    why: (v, a) => `${a.replace(' სმ', '')} × ${a.replace(' სმ', '')} = ${v.s}, ამიტომ გვერდია ${a}.`,
  }),
  t({
    sub: 'u13-01',
    d: 2,
    prompt: 'გამოთვალე {pa} + {pb}.',
    vars: { a: I(2, 9), b: I(2, 9), pa: D((v) => pw(N(v, 'a'), 2)), pb: D((v) => pw(N(v, 'b'), 2)) },
    constraints: [{ test: (v) => N(v, 'a') !== N(v, 'b'), note: 'distinct' }],
    answer: (v) => sg(N(v, 'a') ** 2 + N(v, 'b') ** 2),
    wrong: (v) => [(N(v, 'a') + N(v, 'b')) ** 2, 2 * (N(v, 'a') + N(v, 'b')), N(v, 'a') ** 2 + N(v, 'b'), N(v, 'a') + N(v, 'b') ** 2, N(v, 'a') ** 3 + N(v, 'b') ** 3],
    why: (v, a) => `${N(v, 'a') ** 2} + ${N(v, 'b') ** 2} = ${a}.`,
  }),
  t({
    sub: 'u13-01',
    d: 2,
    prompt: 'კვადრატის გვერდის სიგრძეა {a} მ. რამდენია მისი ფართობი და რამდენჯერ გაიზრდება ფართობი, თუ გვერდის სიგრძეს {kw}?',
    vars: { a: I(3, 15), spec: SPEC(['2|გააორმაგებენ', '3|გასამმაგებენ']), k: F(0), kw: F(1) },
    answer: (v) => `${group(N(v, 'a') ** 2)} მ²; ${N(v, 'k') ** 2}-ჯერ`,
    options: (v, right) => [
      right,
      `${group(N(v, 'a') ** 2)} მ²; ${N(v, 'k')}-ჯერ`,
      `${group(4 * N(v, 'a'))} მ²; ${N(v, 'k') ** 2}-ჯერ`,
      `${group(N(v, 'a') ** 2)} მ²; ${N(v, 'k') ** 3}-ჯერ`,
      `${group(2 * N(v, 'a'))} მ²; ${N(v, 'k')}-ჯერ`,
      `${group(4 * N(v, 'a'))} მ²; ${N(v, 'k')}-ჯერ`,
    ],
    why: (v, a) => `S = ${v.a} × ${v.a} = ${group(N(v, 'a') ** 2)} მ²; გვერდი ${N(v, 'k')}-ჯერ დიდია, ფართობი ${N(v, 'k')} × ${N(v, 'k')} = ${N(v, 'k') ** 2}-ჯერ: ${a}.`,
  }),

  // ═════════ U13.2 — ფესვი და გაყოფა ═════════
  t({
    sub: 'u13-02',
    prompt: 'გამოთვალე √{n}.',
    vars: { k: I(2, 12), n: D((v) => group(N(v, 'k') ** 2)) },
    answer: (v) => sg(N(v, 'k')),
    wrong: (v) => [N(v, 'k') ** 2 / 2, N(v, 'k') ** 2, N(v, 'k') + 1, N(v, 'k') - 1, N(v, 'k') * 2, N(v, 'k') ** 3],
    why: (v, a) => `${a} × ${a} = ${v.n}, ამიტომ √${v.n} = ${a}.`,
  }),
  t({
    sub: 'u13-02',
    prompt: 'გამოთვალე √{n}.',
    vars: { k: I(11, 30), n: D((v) => group(N(v, 'k') ** 2)) },
    answer: (v) => sg(N(v, 'k')),
    wrong: (v) => [N(v, 'k') ** 2 / 2, N(v, 'k') + 1, N(v, 'k') - 1, N(v, 'k') + 10, N(v, 'k') - 10, N(v, 'k') * 2],
    why: (v, a) => `${a} × ${a} = ${v.n}, ამიტომ √${v.n} = ${a}.`,
  }),
  t({
    sub: 'u13-02',
    prompt: 'იპოვე ისეთი არაუარყოფითი მთელი რიცხვი x, რომლისთვისაც x² = {n}.',
    vars: { k: I(3, 20), n: D((v) => group(N(v, 'k') ** 2)) },
    answer: (v) => sg(N(v, 'k')),
    wrong: (v) => [N(v, 'k') ** 2 / 2, N(v, 'k') + 1, N(v, 'k') - 1, N(v, 'k') * 2, N(v, 'k') ** 2, N(v, 'k') + 2],
    why: (v, a) => `${a}² = ${v.n}, ამიტომ x = ${a}.`,
  }),
  t({
    sub: 'u13-02',
    d: 2,
    prompt: 'გამოთვალე √{n} ÷ {d}.',
    vars: { d: C([2, 3, 4, 6]), m: I(2, 6), k: D((v) => N(v, 'd') * N(v, 'm')), n: D((v) => group(N(v, 'k') ** 2)) },
    answer: (v) => sg(N(v, 'm')),
    wrong: (v) => [N(v, 'k'), N(v, 'k') ** 2 / N(v, 'd'), N(v, 'm') + 1, N(v, 'm') - 1, N(v, 'k') ** 2 / 2 / N(v, 'd'), N(v, 'm') * 2],
    why: (v, a) => `√${v.n} = ${v.k}; ${v.k} ÷ ${v.d} = ${a}.`,
  }),
  t({
    sub: 'u13-02',
    d: 2,
    prompt: 'იპოვე √{n} ÷ {d}.',
    vars: { d: C([2, 5, 7, 4]), m: I(2, 9), k: D((v) => N(v, 'd') * N(v, 'm')), n: D((v) => group(N(v, 'k') ** 2)) },
    constraints: [{ test: (v) => N(v, 'k') <= 30, note: 'a modest root' }],
    answer: (v) => sg(N(v, 'm')),
    wrong: (v) => [N(v, 'k'), N(v, 'k') ** 2 / N(v, 'd'), N(v, 'm') + 1, N(v, 'm') - 1, N(v, 'm') * 2, N(v, 'k') - N(v, 'd')],
    why: (v, a) => `√${v.n} = ${v.k}; ${v.k} ÷ ${v.d} = ${a}.`,
  }),
  t({
    sub: 'u13-02',
    d: 2,
    prompt: 'რიცხვი {n} წარმოადგინე ორი ერთნაირი მთელი რიცხვის ნამრავლად. რომელი რიცხვი უნდა გამრავლდეს თავის თავზე, რომ {n} მივიღოთ?',
    vars: { k: I(5, 30), n: D((v) => group(N(v, 'k') ** 2)) },
    answer: (v) => sg(N(v, 'k')),
    wrong: (v) => [N(v, 'k') ** 2 / 2, N(v, 'k') + 1, N(v, 'k') - 1, N(v, 'k') + 5, N(v, 'k') - 5, N(v, 'k') * 2],
    why: (v, a) => `${a} × ${a} = ${v.n}.`,
  }),

  // ═════════ U13.3 — კვადრატი და კუბი ═════════
  t({
    sub: 'u13-03',
    prompt: 'გამოთვალე {pw}.',
    vars: { b: I(3, 15), pw: D((v) => pw(N(v, 'b'), 2)) },
    answer: (v) => sg(N(v, 'b') ** 2),
    wrong: (v) => [2 * N(v, 'b'), N(v, 'b') ** 3, N(v, 'b') ** 2 + N(v, 'b'), N(v, 'b') ** 2 - N(v, 'b'), N(v, 'b') ** 2 + 10, 4 * N(v, 'b')],
    why: (v, a) => `${v.pw} = ${v.b} × ${v.b} = ${a}.`,
  }),
  t({
    sub: 'u13-03',
    prompt: 'გამოთვალე {pw}.',
    vars: { b: I(2, 9), pw: D((v) => pw(N(v, 'b'), 3)) },
    answer: (v) => sg(N(v, 'b') ** 3),
    wrong: (v) => [3 * N(v, 'b'), N(v, 'b') ** 2, N(v, 'b') ** 4, N(v, 'b') ** 3 + N(v, 'b'), N(v, 'b') ** 3 - N(v, 'b'), N(v, 'b') ** 2 * 2],
    why: (v, a) => `${v.pw} = ${v.b} × ${v.b} × ${v.b} = ${a}.`,
  }),
  t({
    sub: 'u13-03',
    prompt: 'იპოვე რიცხვის {b} კვადრატი.',
    vars: { b: I(3, 15) },
    answer: (v) => sg(N(v, 'b') ** 2),
    wrong: (v) => [2 * N(v, 'b'), N(v, 'b') ** 3, N(v, 'b') ** 2 + N(v, 'b'), N(v, 'b') ** 2 - N(v, 'b'), N(v, 'b') ** 2 + 10, 4 * N(v, 'b')],
    why: (v, a) => `${v.b} × ${v.b} = ${a}.`,
  }),
  t({
    sub: 'u13-03',
    prompt: 'იპოვე რიცხვის {b} კუბი.',
    vars: { b: I(2, 9) },
    answer: (v) => sg(N(v, 'b') ** 3),
    wrong: (v) => [3 * N(v, 'b'), N(v, 'b') ** 2, N(v, 'b') ** 4, N(v, 'b') ** 3 + N(v, 'b'), N(v, 'b') ** 3 - N(v, 'b'), N(v, 'b') ** 2 * 2],
    why: (v, a) => `${v.b} × ${v.b} × ${v.b} = ${a}.`,
  }),
  t({
    sub: 'u13-03',
    d: 2,
    prompt: 'გამოთვალე {pa} + {pb}.',
    vars: { a: I(2, 5), b: I(2, 9), pa: D((v) => pw(N(v, 'a'), 3)), pb: D((v) => pw(N(v, 'b'), 2)) },
    answer: (v) => sg(N(v, 'a') ** 3 + N(v, 'b') ** 2),
    wrong: (v) => [N(v, 'a') * 3 + N(v, 'b') * 2, (N(v, 'a') + N(v, 'b')) ** 2, N(v, 'a') ** 2 + N(v, 'b') ** 3, (N(v, 'a') + N(v, 'b')) ** 3, N(v, 'a') ** 3 + N(v, 'b')],
    why: (v, a) => `${N(v, 'a') ** 3} + ${N(v, 'b') ** 2} = ${a}.`,
  }),
  t({
    sub: 'u13-03',
    d: 2,
    prompt: 'კუბის წიბოს სიგრძეა {a} სმ. იპოვე კუბის მოცულობა.',
    vars: { a: I(2, 12) },
    answer: (v) => `${group(N(v, 'a') ** 3)} სმ³`,
    wrong: (v) => [3 * N(v, 'a'), N(v, 'a') ** 2, 12 * N(v, 'a'), 6 * N(v, 'a') ** 2, N(v, 'a') ** 3 + N(v, 'a'), N(v, 'a') ** 4].map((x) => `${group(x)} სმ³`),
    why: (v, a) => `V = ${v.a} × ${v.a} × ${v.a} = ${a}.`,
  }),

  // ═════════ U13.4 — კვადრატული და კუბური ფესვები ═════════
  t({
    sub: 'u13-04',
    prompt: 'გამოთვალე √{n}.',
    vars: { k: I(2, 15), n: D((v) => group(N(v, 'k') ** 2)) },
    answer: (v) => sg(N(v, 'k')),
    wrong: (v) => [N(v, 'k') ** 2 / 2, N(v, 'k') + 1, N(v, 'k') - 1, N(v, 'k') * 2, N(v, 'k') ** 2, N(v, 'k') + 2],
    why: (v, a) => `${a} × ${a} = ${v.n}, ამიტომ √${v.n} = ${a}.`,
  }),
  t({
    sub: 'u13-04',
    prompt: 'გამოთვალე ∛{n}.',
    vars: { k: I(2, 10), n: D((v) => group(N(v, 'k') ** 3)) },
    answer: (v) => sg(N(v, 'k')),
    wrong: (v) => [N(v, 'k') ** 3 / 3, N(v, 'k') ** 2, N(v, 'k') + 1, N(v, 'k') - 1, N(v, 'k') * 3, N(v, 'k') ** 3 / 2],
    why: (v, a) => `${a} × ${a} × ${a} = ${v.n}, ამიტომ ∛${v.n} = ${a}.`,
  }),
  t({
    sub: 'u13-04',
    prompt: 'გამოთვალე √{n}.',
    vars: { k: I(11, 30), n: D((v) => group(N(v, 'k') ** 2)) },
    answer: (v) => sg(N(v, 'k')),
    wrong: (v) => [N(v, 'k') ** 2 / 2, N(v, 'k') + 1, N(v, 'k') - 1, N(v, 'k') + 10, N(v, 'k') - 10, N(v, 'k') * 2],
    why: (v, a) => `${a} × ${a} = ${v.n}, ამიტომ √${v.n} = ${a}.`,
  }),
  t({
    sub: 'u13-04',
    prompt: 'გამოთვალე ∛{n}.',
    vars: { k: I(3, 12), n: D((v) => group(N(v, 'k') ** 3)) },
    answer: (v) => sg(N(v, 'k')),
    wrong: (v) => [N(v, 'k') ** 3 / 3, N(v, 'k') ** 2, N(v, 'k') + 1, N(v, 'k') - 1, N(v, 'k') * 3, N(v, 'k') + 2],
    why: (v, a) => `${a} × ${a} × ${a} = ${v.n}, ამიტომ ∛${v.n} = ${a}.`,
  }),
  t({
    sub: 'u13-04',
    d: 2,
    prompt: 'იპოვე x, თუ √x = {k}.',
    vars: { k: I(3, 20) },
    answer: (v) => sg(N(v, 'k') ** 2),
    wrong: (v) => [2 * N(v, 'k'), N(v, 'k') ** 3, N(v, 'k') / 2, N(v, 'k') ** 2 + N(v, 'k'), N(v, 'k') ** 2 - N(v, 'k'), N(v, 'k') ** 2 + 10],
    why: (v, a) => `√x = ${v.k}, ამიტომ x = ${v.k} × ${v.k} = ${a}.`,
  }),
  t({
    sub: 'u13-04',
    d: 2,
    prompt: 'იპოვე y, თუ ∛y = {k}.',
    vars: { k: I(2, 10) },
    answer: (v) => sg(N(v, 'k') ** 3),
    wrong: (v) => [3 * N(v, 'k'), N(v, 'k') ** 2, N(v, 'k') ** 4, N(v, 'k') ** 3 + N(v, 'k'), N(v, 'k') ** 3 - N(v, 'k'), N(v, 'k') ** 2 * 2],
    why: (v, a) => `∛y = ${v.k}, ამიტომ y = ${v.k} × ${v.k} × ${v.k} = ${a}.`,
  }),
];
