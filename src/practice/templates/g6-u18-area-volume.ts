import type { QuestionTemplate, Vars } from './types';
import { C, D, F, I, N, SPEC, dec, divisorsOf, group, q6 } from './g6-helpers';

/**
 * Grade VI — Unit 18: პერიმეტრი, ფართობი და მოცულობა (perimeter, area and volume).
 *
 * Converted from the academy's `U18` bank: 12 subtopics × 6 questions.
 *
 * Lengths print as `12 სმ`, areas as `54 სმ²`, volumes as `60 სმ³`. Questions with a
 * quotient (a missing side, an equal-area rectangle, a one-third volume) draw their
 * factors first and derive the given quantity, so every answer is exact. Circular
 * solids use π = 3,14 and print two decimals at most.
 */

export const G6_U18_SUBTOPICS = [
  'u18-01', 'u18-02', 'u18-03', 'u18-04', 'u18-05', 'u18-06',
  'u18-07', 'u18-08', 'u18-09', 'u18-10', 'u18-11', 'u18-12',
] as const;

const T = 'g6-area-volume';
let seq = 0;
const nextId = (): string => `g6-u18-q${String(++seq).padStart(2, '0')}`;
type Spec = Omit<Parameters<typeof q6>[0], 'id' | 'topic'>;
const t = (spec: Spec): QuestionTemplate => q6({ id: nextId(), topic: T, ...spec });

const cm = (x: number): string => `${group(x)} სმ`;
const cm2 = (x: number): string => `${group(x)} სმ²`;
const cm3 = (x: number): string => `${group(x)} სმ³`;
const m2 = (x: number): string => `${group(x)} მ²`;
const cm2d = (x: number): string => `${dec(x, 2)} სმ²`;
const cm3d = (x: number): string => `${dec(x, 2)} სმ³`;

interface NumSpec {
  sub: string;
  d?: 1 | 2 | 3;
  prompt: string;
  vars: Spec['vars'];
  constraints?: Spec['constraints'];
  fmt: (x: number) => string;
  num: (v: Vars) => number;
  slips: (v: Vars) => number[];
  /** Keys with π = 3,14 may carry up to two decimals; everything else stays whole. */
  decimals?: boolean;
  why: (v: Vars, answer: string) => string;
}
/** A key and its slips printed by one formatter; slips that are not valid, positive and distinct are dropped. */
const numeric = (o: NumSpec): QuestionTemplate =>
  t({
    sub: o.sub,
    ...(o.d ? { d: o.d } : {}),
    prompt: o.prompt,
    vars: o.vars,
    ...(o.constraints ? { constraints: o.constraints } : {}),
    answer: (v) => o.fmt(o.num(v)),
    wrong: (v) => {
      const right = o.num(v);
      const pool = [...o.slips(v), right + 1, right - 1, right + 2, right + 10, right * 2].map((x) => Math.round(x * 1000) / 1000);
      return pool
        .filter((x) => Number.isFinite(x) && x > 0 && Math.abs(x - right) > 1e-9 && (o.decimals ? Math.abs(x * 100 - Math.round(x * 100)) < 1e-6 : Number.isInteger(x)))
        .map(o.fmt);
    },
    why: o.why,
  });

const even = (v: Vars, a: string, b: string): boolean => (N(v, a) * N(v, b)) % 2 === 0;
/** A variable printed grouped, derived from earlier ones. */
const G = (fn: (v: Vars) => number) => D((v) => group(fn(v)));
const PI = 3.14;

/** A real triangle: `a`, `b` free, `c` strictly between their difference and sum. */
const triangleVars = (): Record<string, ReturnType<typeof I>> => ({
  a: I(3, 14),
  b: I(3, 14),
  c: I((v: Vars) => Math.abs(N(v, 'a') - N(v, 'b')) + 1, (v: Vars) => N(v, 'a') + N(v, 'b') - 1),
});

/** Faces, edges and vertices of the solids in U18.7 as `dative|F|E|V|genitive`. */
const SOLIDS = [
  'კუბს|6|12|8|კუბის', 'მართკუთხა პარალელეპიპედს|6|12|8|მართკუთხა პარალელეპიპედის', 'სამკუთხა პრიზმას|5|9|6|სამკუთხა პრიზმის',
  'ოთხკუთხა პრიზმას|6|12|8|ოთხკუთხა პრიზმის', 'ხუთკუთხა პრიზმას|7|15|10|ხუთკუთხა პრიზმის', 'ექვსკუთხა პრიზმას|8|18|12|ექვსკუთხა პრიზმის',
];
const countOptions = (n: number): number[] => [n - 2, n - 1, n + 1, n + 2, n * 2, n + 3, 3, 4, 5];

const solidCount = (what: string, col: number, pre: string[]): QuestionTemplate =>
  t({
    sub: 'u18-07',
    prompt: `{pre} ${what} აქვს {fig}?`,
    vars: { spec: SPEC(SOLIDS), fig: F(0), n: F(col), pre: C(pre) },
    answer: (v) => String(v.n),
    wrong: (v) => countOptions(N(v, 'n')),
    why: (v, a) => `${v.fig} აქვს ${a} ${what}.`,
  });

export const G6_U18_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U18.1 — პერიმეტრი ═════════
  numeric({
    sub: 'u18-01',
    prompt: 'კვადრატის გვერდის სიგრძეა {a} სმ. იპოვე მისი პერიმეტრი.',
    vars: { a: I(2, 40) },
    fmt: cm,
    num: (v) => 4 * N(v, 'a'),
    slips: (v) => [N(v, 'a') ** 2, 2 * N(v, 'a'), N(v, 'a') + 4, 3 * N(v, 'a'), 8 * N(v, 'a')],
    why: (v, a) => `P = 4 · ${v.a} = ${a}.`,
  }),
  numeric({
    sub: 'u18-01',
    prompt: 'მართკუთხედის სიგრძეა {a} სმ, ხოლო სიგანე — {b} სმ. იპოვე პერიმეტრი.',
    vars: { b: I(2, 20), a: I((v: Vars) => N(v, 'b') + 1, 35) },
    fmt: cm,
    num: (v) => 2 * (N(v, 'a') + N(v, 'b')),
    slips: (v) => [N(v, 'a') + N(v, 'b'), N(v, 'a') * N(v, 'b'), 2 * N(v, 'a') + N(v, 'b'), 2 * N(v, 'a') * N(v, 'b')],
    why: (v, a) => `P = 2 · (${v.a} + ${v.b}) = ${a}.`,
  }),
  numeric({
    sub: 'u18-01',
    prompt: 'სამკუთხედის გვერდებია {a} სმ, {b} სმ და {c} სმ. იპოვე პერიმეტრი.',
    vars: triangleVars(),
    fmt: cm,
    num: (v) => N(v, 'a') + N(v, 'b') + N(v, 'c'),
    slips: (v) => [N(v, 'a') + N(v, 'b'), N(v, 'b') + N(v, 'c'), N(v, 'a') * N(v, 'b') + N(v, 'c'), 2 * (N(v, 'a') + N(v, 'b') + N(v, 'c'))],
    why: (v, a) => `P = ${v.a} + ${v.b} + ${v.c} = ${a}.`,
  }),
  numeric({
    sub: 'u18-01',
    d: 2,
    prompt: 'რეგულარული {fig} თითოეული გვერდია {a} სმ. იპოვე პერიმეტრი.',
    vars: { spec: SPEC(['ხუთკუთხედის|5', 'ექვსკუთხედის|6', 'შვიდკუთხედის|7', 'რვაკუთხედის|8', 'ათკუთხედის|10']), fig: F(0), n: F(1), a: I(2, 15) },
    fmt: cm,
    num: (v) => N(v, 'n') * N(v, 'a'),
    slips: (v) => [(N(v, 'n') + 1) * N(v, 'a'), (N(v, 'n') - 1) * N(v, 'a'), N(v, 'a') ** 2, N(v, 'n') + N(v, 'a'), 2 * N(v, 'a')],
    why: (v, a) => `${v.n} გვერდი, თითოეული ${v.a} სმ: ${v.n} · ${v.a} = ${a}.`,
  }),
  numeric({
    sub: 'u18-01',
    d: 2,
    prompt: 'მართკუთხედის პერიმეტრია {p} სმ, ხოლო სიგრძე — {a} სმ. იპოვე სიგანე.',
    vars: { b: I(2, 15), a: I((v: Vars) => N(v, 'b') + 1, 25), p: D((v) => 2 * (N(v, 'a') + N(v, 'b'))) },
    fmt: cm,
    num: (v) => N(v, 'b'),
    slips: (v) => [N(v, 'p') - N(v, 'a'), N(v, 'p') / 2, N(v, 'p') / 2 + N(v, 'a'), N(v, 'p') - 2 * N(v, 'a'), N(v, 'a') - N(v, 'b')],
    why: (v, a) => `${v.p} ÷ 2 = ${N(v, 'a') + N(v, 'b')}; ${N(v, 'a') + N(v, 'b')} − ${v.a} = ${a}.`,
  }),
  numeric({
    sub: 'u18-01',
    d: 2,
    prompt: '{fig} პერიმეტრია {p} სმ. იპოვე ერთი გვერდის სიგრძე.',
    vars: {
      spec: SPEC(['ტოლგვერდა სამკუთხედის|3', 'კვადრატის|4', 'რეგულარული ხუთკუთხედის|5', 'რეგულარული ექვსკუთხედის|6']),
      fig: F(0), n: F(1), s: I(2, 15), p: D((v) => N(v, 'n') * N(v, 's')),
    },
    fmt: cm,
    num: (v) => N(v, 's'),
    slips: (v) => [N(v, 'p') / (N(v, 'n') + 1), N(v, 'p') / (N(v, 'n') - 1), N(v, 'p') - N(v, 'n'), N(v, 'p') / 2, N(v, 'p') / 4],
    why: (v, a) => `${v.p} ÷ ${v.n} = ${a}.`,
  }),

  // ═════════ U18.2 — მართკუთხედის ფართობი ═════════
  numeric({
    sub: 'u18-02',
    prompt: 'მართკუთხედის სიგრძეა {a} სმ, ხოლო სიგანე — {b} სმ. იპოვე ფართობი.',
    vars: { a: I(2, 25), b: I(2, 25) },
    fmt: cm2,
    num: (v) => N(v, 'a') * N(v, 'b'),
    slips: (v) => [2 * (N(v, 'a') + N(v, 'b')), N(v, 'a') + N(v, 'b'), (N(v, 'a') * N(v, 'b')) / 2, N(v, 'a') ** 2],
    why: (v, a) => `S = ${v.a} · ${v.b} = ${a}.`,
  }),
  numeric({
    sub: 'u18-02',
    prompt: 'კვადრატის გვერდის სიგრძეა {a} სმ. იპოვე ფართობი.',
    vars: { a: I(2, 30) },
    fmt: cm2,
    num: (v) => N(v, 'a') ** 2,
    slips: (v) => [4 * N(v, 'a'), 2 * N(v, 'a'), N(v, 'a') * (N(v, 'a') + 1), N(v, 'a') ** 2 - N(v, 'a'), N(v, 'a') ** 3],
    why: (v, a) => `S = ${v.a} · ${v.a} = ${a}.`,
  }),
  numeric({
    sub: 'u18-02',
    d: 2,
    prompt: 'მართკუთხედის ფართობია {s} სმ², ხოლო სიგრძე — {a} სმ. იპოვე სიგანე.',
    vars: { a: I(2, 25), b: I(2, 20), s: D((v) => N(v, 'a') * N(v, 'b')) },
    fmt: cm,
    num: (v) => N(v, 'b'),
    slips: (v) => [N(v, 's') - N(v, 'a'), N(v, 's') + N(v, 'a'), N(v, 's') / 2, N(v, 'a') - N(v, 'b'), N(v, 's') / (N(v, 'a') + 1)],
    why: (v, a) => `${v.s} ÷ ${v.a} = ${a}.`,
  }),
  numeric({
    sub: 'u18-02',
    prompt: 'მართკუთხა {obj} სიგრძეა {a} მ, სიგანე — {b} მ. იპოვე {obj} ფართობი.',
    vars: { obj: C(['ბაღის', 'ეზოს', 'მოედნის', 'ტერიტორიის']), a: I(5, 40), b: I(3, 25) },
    fmt: m2,
    num: (v) => N(v, 'a') * N(v, 'b'),
    slips: (v) => [2 * (N(v, 'a') + N(v, 'b')), N(v, 'a') + N(v, 'b'), N(v, 'a') * N(v, 'b') * 2, N(v, 'a') * (N(v, 'b') + 1)],
    why: (v, a) => `S = ${v.a} · ${v.b} = ${a}.`,
  }),
  numeric({
    sub: 'u18-02',
    d: 2,
    prompt: 'მართკუთხედის სიგანეა {b} სმ, ხოლო სიგრძე სიგანეზე {e} სმ-ით მეტია. იპოვე ფართობი.',
    vars: { b: I(3, 15), e: I(2, 9) },
    fmt: cm2,
    num: (v) => N(v, 'b') * (N(v, 'b') + N(v, 'e')),
    slips: (v) => [N(v, 'b') * N(v, 'e'), N(v, 'b') ** 2, N(v, 'b') * (N(v, 'b') - N(v, 'e')), 2 * (2 * N(v, 'b') + N(v, 'e')), (N(v, 'b') + N(v, 'e')) ** 2],
    why: (v, a) => `სიგრძე ${N(v, 'b') + N(v, 'e')} სმ; S = ${v.b} · ${N(v, 'b') + N(v, 'e')} = ${a}.`,
  }),
  numeric({
    sub: 'u18-02',
    d: 2,
    prompt: 'კვადრატის ფართობია {s} სმ². იპოვე მისი გვერდის სიგრძე.',
    vars: { a: I(2, 25), s: D((v) => N(v, 'a') ** 2) },
    fmt: cm,
    num: (v) => N(v, 'a'),
    slips: (v) => [N(v, 's') / 2, N(v, 's') / 4, 4 * N(v, 'a'), 2 * N(v, 'a'), N(v, 'a') + 1],
    why: (v, a) => `${v.a} · ${v.a} = ${v.s}, ამიტომ გვერდია ${a}.`,
  }),

  // ═════════ U18.3 — შედგენილი ფიგურები ═════════
  numeric({
    sub: 'u18-03',
    prompt: 'ფიგურა შედგება ორი მართკუთხედისგან, რომელთა ფართობებია {a} სმ² და {b} სმ². თუ ისინი ერთმანეთს არ ფარავს, იპოვე მთლიანი ფიგურის ფართობი.',
    vars: { a: I(10, 80), b: I(10, 80) },
    fmt: cm2,
    num: (v) => N(v, 'a') + N(v, 'b'),
    slips: (v) => [Math.abs(N(v, 'a') - N(v, 'b')), N(v, 'a') * N(v, 'b'), (N(v, 'a') + N(v, 'b')) / 2, N(v, 'a') + N(v, 'b') + 10],
    why: (v, a) => `${v.a} + ${v.b} = ${a}.`,
  }),
  numeric({
    sub: 'u18-03',
    prompt: 'ფიგურა შედგება ორი მართკუთხედისგან. პირველი მართკუთხედის ზომებია {a} სმ × {b} სმ, ხოლო მეორის — {c} სმ × {d} სმ. ისინი ერთმანეთს არ ფარავს. იპოვე მთლიანი ფართობი.',
    vars: { a: I(2, 12), b: I(2, 12), c: I(2, 12), d: I(2, 12) },
    fmt: cm2,
    num: (v) => N(v, 'a') * N(v, 'b') + N(v, 'c') * N(v, 'd'),
    slips: (v) => [(N(v, 'a') + N(v, 'c')) * (N(v, 'b') + N(v, 'd')), N(v, 'a') * N(v, 'b') * N(v, 'c') * N(v, 'd'), 2 * (N(v, 'a') + N(v, 'b') + N(v, 'c') + N(v, 'd')), N(v, 'a') * N(v, 'b')],
    why: (v, a) => `${v.a} · ${v.b} + ${v.c} · ${v.d} = ${N(v, 'a') * N(v, 'b')} + ${N(v, 'c') * N(v, 'd')} = ${a}.`,
  }),
  numeric({
    sub: 'u18-03',
    d: 2,
    prompt: 'L-ის ფორმის ფიგურა მიიღება {a} სმ × {b} სმ მართკუთხედიდან {c} სმ × {d} სმ მართკუთხედის ამოჭრით. იპოვე დარჩენილი ფიგურის ფართობი.',
    vars: { a: I(8, 20), b: I(6, 15), c: I(2, (v: Vars) => N(v, 'a') - 2), d: I(2, (v: Vars) => N(v, 'b') - 2) },
    fmt: cm2,
    num: (v) => N(v, 'a') * N(v, 'b') - N(v, 'c') * N(v, 'd'),
    slips: (v) => [N(v, 'a') * N(v, 'b') + N(v, 'c') * N(v, 'd'), N(v, 'a') * N(v, 'b'), (N(v, 'a') - N(v, 'c')) * (N(v, 'b') - N(v, 'd')), N(v, 'c') * N(v, 'd')],
    why: (v, a) => `${v.a} · ${v.b} − ${v.c} · ${v.d} = ${N(v, 'a') * N(v, 'b')} − ${N(v, 'c') * N(v, 'd')} = ${a}.`,
  }),
  numeric({
    sub: 'u18-03',
    d: 2,
    prompt: 'მართკუთხა ფიგურა შედგება ორი მართკუთხედისგან, რომლებსაც საერთო გვერდი {h} სმ აქვთ. მათი სხვა გვერდებია {a} სმ და {b} სმ. იპოვე მთლიანი ფიგურის ფართობი.',
    vars: { h: I(2, 12), a: I(2, 15), b: I(2, 15) },
    fmt: cm2,
    num: (v) => (N(v, 'a') + N(v, 'b')) * N(v, 'h'),
    slips: (v) => [N(v, 'a') * N(v, 'b') * N(v, 'h'), N(v, 'a') * N(v, 'h'), N(v, 'a') + N(v, 'b') + N(v, 'h'), 2 * (N(v, 'a') + N(v, 'b') + N(v, 'h'))],
    why: (v, a) => `${v.h} · ${v.a} + ${v.h} · ${v.b} = ${N(v, 'h') * N(v, 'a')} + ${N(v, 'h') * N(v, 'b')} = ${a}.`,
  }),
  numeric({
    sub: 'u18-03',
    d: 2,
    prompt: 'დიდი მართკუთხედის ზომებია {a} სმ × {b} სმ. მისგან ამოჭრილია {c} სმ × {d} სმ მართკუთხედი. იპოვე დარჩენილი ფართობი.',
    vars: { a: I(9, 25), b: I(6, 20), c: I(2, 6), d: I(2, 6) },
    fmt: cm2,
    num: (v) => N(v, 'a') * N(v, 'b') - N(v, 'c') * N(v, 'd'),
    slips: (v) => [N(v, 'a') * N(v, 'b') + N(v, 'c') * N(v, 'd'), N(v, 'a') * N(v, 'b'), (N(v, 'a') - N(v, 'c')) * (N(v, 'b') - N(v, 'd')), N(v, 'c') * N(v, 'd')],
    why: (v, a) => `${v.a} · ${v.b} − ${v.c} · ${v.d} = ${N(v, 'a') * N(v, 'b')} − ${N(v, 'c') * N(v, 'd')} = ${a}.`,
  }),
  numeric({
    sub: 'u18-03',
    prompt: 'ფიგურა შედგება კვადრატისა და მართკუთხედისგან, რომლებიც ერთმანეთს არ ფარავს. კვადრატის გვერდია {s} სმ, მართკუთხედის ზომებია {a} სმ × {b} სმ. იპოვე მთლიანი ფართობი.',
    vars: { s: I(2, 12), a: I(2, 14), b: I(2, 10) },
    fmt: cm2,
    num: (v) => N(v, 's') ** 2 + N(v, 'a') * N(v, 'b'),
    slips: (v) => [4 * N(v, 's') + 2 * (N(v, 'a') + N(v, 'b')), N(v, 's') * N(v, 'a') * N(v, 'b'), N(v, 's') ** 2, N(v, 's') + N(v, 'a') * N(v, 'b')],
    why: (v, a) => `${v.s}² + ${v.a} · ${v.b} = ${N(v, 's') ** 2} + ${N(v, 'a') * N(v, 'b')} = ${a}.`,
  }),

  // ═════════ U18.4 — გაფერადებული ფიგურების ფართობი ═════════
  numeric({
    sub: 'u18-04',
    prompt: 'კვადრატის გვერდია {a} სმ. მის შიგნით მდებარე გაუფერადებელი მართკუთხედის ზომებია {c} სმ × {d} სმ. იპოვე გაფერადებული ნაწილის ფართობი.',
    vars: { a: I(6, 20), c: I(2, (v: Vars) => Math.min(N(v, 'a') - 2, 9)), d: I(2, (v: Vars) => Math.min(N(v, 'a') - 2, 9)) },
    fmt: cm2,
    num: (v) => N(v, 'a') ** 2 - N(v, 'c') * N(v, 'd'),
    slips: (v) => [N(v, 'a') ** 2 + N(v, 'c') * N(v, 'd'), N(v, 'c') * N(v, 'd'), N(v, 'a') ** 2, (N(v, 'a') - N(v, 'c')) * (N(v, 'a') - N(v, 'd'))],
    why: (v, a) => `${v.a}² − ${v.c} · ${v.d} = ${N(v, 'a') ** 2} − ${N(v, 'c') * N(v, 'd')} = ${a}.`,
  }),
  numeric({
    sub: 'u18-04',
    prompt: 'მართკუთხედის ზომებია {a} სმ × {b} სმ. მისი {c} სმ × {d} სმ ნაწილი გაუფერადებელია. იპოვე გაფერადებული ნაწილის ფართობი.',
    vars: { a: I(8, 20), b: I(6, 16), c: I(2, (v: Vars) => N(v, 'a') - 2), d: I(2, (v: Vars) => N(v, 'b') - 2) },
    fmt: cm2,
    num: (v) => N(v, 'a') * N(v, 'b') - N(v, 'c') * N(v, 'd'),
    slips: (v) => [N(v, 'a') * N(v, 'b') + N(v, 'c') * N(v, 'd'), N(v, 'c') * N(v, 'd'), N(v, 'a') * N(v, 'b'), (N(v, 'a') - N(v, 'c')) * (N(v, 'b') - N(v, 'd'))],
    why: (v, a) => `${v.a} · ${v.b} − ${v.c} · ${v.d} = ${N(v, 'a') * N(v, 'b')} − ${N(v, 'c') * N(v, 'd')} = ${a}.`,
  }),
  numeric({
    sub: 'u18-04',
    prompt: 'კვადრატის გვერდია {a} სმ. მისგან ამოჭრილია {c} სმ × {c} სმ კვადრატი. იპოვე დარჩენილი ნაწილის ფართობი.',
    vars: { a: I(6, 25), c: I(2, (v: Vars) => Math.min(N(v, 'a') - 2, 12)) },
    fmt: cm2,
    num: (v) => N(v, 'a') ** 2 - N(v, 'c') ** 2,
    slips: (v) => [(N(v, 'a') - N(v, 'c')) ** 2, N(v, 'a') ** 2 + N(v, 'c') ** 2, N(v, 'a') ** 2, N(v, 'c') ** 2, N(v, 'a') ** 2 - N(v, 'c')],
    why: (v, a) => `${v.a}² − ${v.c}² = ${N(v, 'a') ** 2} − ${N(v, 'c') ** 2} = ${a}.`,
  }),
  numeric({
    sub: 'u18-04',
    d: 2,
    prompt: 'მართკუთხედის ზომებია {a} სმ × {b} სმ. მისი ფართობის {p}/{k} გაფერადებულია. იპოვე გაფერადებული ნაწილის ფართობი.',
    vars: { k: C([2, 3, 4, 5, 6]), p: I(1, (v: Vars) => N(v, 'k') - 1), u: I(2, 8), a: D((v) => N(v, 'k') * N(v, 'u')), b: I(2, 12) },
    fmt: cm2,
    num: (v) => N(v, 'u') * N(v, 'b') * N(v, 'p'),
    slips: (v) => {
      const area = N(v, 'k') * N(v, 'u') * N(v, 'b');
      return [area, area - N(v, 'u') * N(v, 'b') * N(v, 'p'), area / N(v, 'k'), (area / N(v, 'k')) * (N(v, 'p') + 1), area - N(v, 'p')];
    },
    why: (v, a) => `S = ${v.a} · ${v.b} = ${N(v, 'a') * N(v, 'b')}; ${N(v, 'a') * N(v, 'b')} ÷ ${v.k} · ${v.p} = ${a}.`,
  }),
  numeric({
    sub: 'u18-04',
    d: 2,
    prompt: 'მართკუთხედის ფართობია {s} სმ². მისი {p}/{k} გაფერადებულია. იპოვე გაუფერადებელი ნაწილის ფართობი.',
    vars: { k: C([2, 3, 4, 5, 6, 8]), p: I(1, (v: Vars) => N(v, 'k') - 1), m: I(2, 20), s: D((v) => N(v, 'k') * N(v, 'm')) },
    fmt: cm2,
    num: (v) => N(v, 'm') * (N(v, 'k') - N(v, 'p')),
    slips: (v) => [N(v, 'm') * N(v, 'p'), N(v, 'm'), N(v, 's') - N(v, 'p'), N(v, 's') / 2, N(v, 'm') * (N(v, 'k') - N(v, 'p') + 1)],
    why: (v, a) => `${v.s} ÷ ${v.k} = ${v.m}; გაუფერადებელია ${N(v, 'k') - N(v, 'p')}/${v.k}: ${v.m} · ${N(v, 'k') - N(v, 'p')} = ${a}.`,
  }),
  numeric({
    sub: 'u18-04',
    d: 3,
    prompt: 'მართკუთხედის ზომებია {a} სმ × {b} სმ. მის შიგნით, ყველა გვერდიდან {w} სმ-ით დაშორებით, გაუფერადებელია მართკუთხედი. იპოვე გაფერადებული ნაწილის ფართობი.',
    vars: { a: I(8, 20), b: I(8, 16), w: I(1, 3) },
    fmt: cm2,
    num: (v) => N(v, 'a') * N(v, 'b') - (N(v, 'a') - 2 * N(v, 'w')) * (N(v, 'b') - 2 * N(v, 'w')),
    slips: (v) => [
      (N(v, 'a') - 2 * N(v, 'w')) * (N(v, 'b') - 2 * N(v, 'w')),
      N(v, 'a') * N(v, 'b') - (N(v, 'a') - N(v, 'w')) * (N(v, 'b') - N(v, 'w')),
      2 * N(v, 'w') * (N(v, 'a') + N(v, 'b')),
      N(v, 'a') * N(v, 'b') - N(v, 'w') * N(v, 'w'),
    ],
    why: (v, a) => `შიდა მართკუთხედია ${N(v, 'a') - 2 * N(v, 'w')} სმ × ${N(v, 'b') - 2 * N(v, 'w')} სმ: ${N(v, 'a') * N(v, 'b')} − ${(N(v, 'a') - 2 * N(v, 'w')) * (N(v, 'b') - 2 * N(v, 'w'))} = ${a}.`,
  }),

  // ═════════ U18.5 — მრავალკუთხედებისა და სხვა ფიგურების ფართობი ═════════
  numeric({
    sub: 'u18-05',
    prompt: 'სამკუთხედის ფუძეა {b} სმ, ხოლო სიმაღლე — {h} სმ. იპოვე ფართობი.',
    vars: { b: I(2, 24), h: I(2, 24) },
    constraints: [{ test: (v: Vars) => even(v, 'b', 'h'), note: 'the area is whole' }],
    fmt: cm2,
    num: (v) => (N(v, 'b') * N(v, 'h')) / 2,
    slips: (v) => [N(v, 'b') * N(v, 'h'), N(v, 'b') + N(v, 'h'), (N(v, 'b') + N(v, 'h')) / 2, (N(v, 'b') * N(v, 'h')) / 4],
    why: (v, a) => `S = ${v.b} · ${v.h} ÷ 2 = ${a}.`,
  }),
  numeric({
    sub: 'u18-05',
    prompt: 'პარალელოგრამის ფუძეა {b} სმ, ხოლო სიმაღლე — {h} სმ. იპოვე ფართობი.',
    vars: { b: I(3, 25), h: I(2, 20) },
    fmt: cm2,
    num: (v) => N(v, 'b') * N(v, 'h'),
    slips: (v) => [(N(v, 'b') * N(v, 'h')) / 2, 2 * (N(v, 'b') + N(v, 'h')), N(v, 'b') + N(v, 'h'), N(v, 'b') * N(v, 'h') + N(v, 'b')],
    why: (v, a) => `S = ${v.b} · ${v.h} = ${a}.`,
  }),
  numeric({
    sub: 'u18-05',
    prompt: 'ტრაპეციის ფუძეებია {a} სმ და {b} სმ, ხოლო სიმაღლე — {h} სმ. იპოვე ფართობი.',
    vars: { a: I(2, 15), b: I((v: Vars) => N(v, 'a') + 1, 22), h: I(2, 14) },
    constraints: [{ test: (v: Vars) => ((N(v, 'a') + N(v, 'b')) * N(v, 'h')) % 2 === 0, note: 'the area is whole' }],
    fmt: cm2,
    num: (v) => ((N(v, 'a') + N(v, 'b')) * N(v, 'h')) / 2,
    slips: (v) => [(N(v, 'a') + N(v, 'b')) * N(v, 'h'), N(v, 'a') * N(v, 'b') * N(v, 'h'), (N(v, 'a') * N(v, 'h')) / 2 + N(v, 'b'), ((N(v, 'b') - N(v, 'a')) * N(v, 'h')) / 2],
    why: (v, a) => `S = (${v.a} + ${v.b}) · ${v.h} ÷ 2 = ${a}.`,
  }),
  numeric({
    sub: 'u18-05',
    prompt: 'რომბის დიაგონალებია {a} სმ და {b} სმ. იპოვე ფართობი.',
    vars: { a: I(2, 24), b: I(2, 24) },
    constraints: [{ test: (v: Vars) => even(v, 'a', 'b'), note: 'the area is whole' }],
    fmt: cm2,
    num: (v) => (N(v, 'a') * N(v, 'b')) / 2,
    slips: (v) => [N(v, 'a') * N(v, 'b'), N(v, 'a') + N(v, 'b'), 2 * (N(v, 'a') + N(v, 'b')), (N(v, 'a') * N(v, 'b')) / 4],
    why: (v, a) => `S = ${v.a} · ${v.b} ÷ 2 = ${a}.`,
  }),
  numeric({
    sub: 'u18-05',
    d: 2,
    prompt: 'სამკუთხედის ფართობია {s} სმ², ხოლო ფუძე — {b} სმ. იპოვე სიმაღლე.',
    vars: { b: I(2, 20), h: I(2, 20), s: D((v) => (N(v, 'b') * N(v, 'h')) / 2) },
    constraints: [{ test: (v: Vars) => even(v, 'b', 'h'), note: 'the area is whole' }],
    fmt: cm,
    num: (v) => N(v, 'h'),
    slips: (v) => [N(v, 's') / N(v, 'b'), 2 * N(v, 's'), N(v, 's') * N(v, 'b'), N(v, 's') - N(v, 'b'), N(v, 'h') / 2],
    why: (v, a) => `2 · ${v.s} ÷ ${v.b} = ${a}.`,
  }),
  numeric({
    sub: 'u18-05',
    d: 2,
    prompt: 'წრის რადიუსია {r} სმ. იპოვე ფართობი (π = 3,14).',
    decimals: true,
    vars: { r: I(2, 15) },
    fmt: cm2d,
    num: (v) => PI * N(v, 'r') ** 2,
    slips: (v) => [PI * 2 * N(v, 'r'), PI * N(v, 'r'), 3 * N(v, 'r') ** 2, 2 * PI * N(v, 'r') ** 2, PI * (N(v, 'r') + 1) ** 2],
    why: (v, a) => `S = πr² = 3,14 · ${v.r}² = 3,14 · ${N(v, 'r') ** 2} = ${a}.`,
  }),

  // ═════════ U18.6 — ტოლფართობიანი ფიგურები ═════════
  numeric({
    sub: 'u18-06',
    d: 2,
    prompt: 'მართკუთხედის ზომებია {a} სმ × {b} სმ. იპოვე კვადრატის გვერდი, თუ მისი ფართობი მართკუთხედის ფართობის ტოლია.',
    vars: { g: I(1, 3), x: I(1, 4), y: I(1, 4), a: D((v) => N(v, 'g') * N(v, 'x') ** 2), b: D((v) => N(v, 'g') * N(v, 'y') ** 2) },
    constraints: [{ test: (v: Vars) => N(v, 'x') !== N(v, 'y'), note: 'a rectangle, not a square' }],
    fmt: cm,
    num: (v) => N(v, 'g') * N(v, 'x') * N(v, 'y'),
    slips: (v) => [N(v, 'a') + N(v, 'b'), (N(v, 'a') + N(v, 'b')) / 2, N(v, 'a') * N(v, 'b'), (N(v, 'a') * N(v, 'b')) / 2, Math.abs(N(v, 'a') - N(v, 'b'))],
    why: (v, a) => `S = ${v.a} · ${v.b} = ${N(v, 'a') * N(v, 'b')}; ${a} · ${a} = ${N(v, 'a') * N(v, 'b')}, ამიტომ გვერდია ${a}.`,
  }),
  numeric({
    sub: 'u18-06',
    d: 2,
    prompt: 'სამკუთხედის ფუძეა {b} სმ, ხოლო სიმაღლე — {h} სმ. იპოვე მართკუთხედის სიგანე, თუ მისი სიგრძეა {l} სმ და ფართობი სამკუთხედის ფართობის ტოლია.',
    vars: { u: I(2, 10), z: I(1, 8), m: C([1, 2]), b: D((v) => 2 * N(v, 'u')), h: D((v) => 2 * N(v, 'z')), l: D((v) => N(v, 'm') * N(v, 'u')) },
    fmt: cm,
    num: (v) => (2 * N(v, 'z')) / N(v, 'm'),
    slips: (v) => [N(v, 'h'), N(v, 'b'), N(v, 'u') * N(v, 'h'), N(v, 'h') / 2, N(v, 'h') * 2, N(v, 'u') * N(v, 'z') / 2],
    why: (v, a) => `S = ${v.b} · ${v.h} ÷ 2 = ${N(v, 'u') * N(v, 'h')}; ${N(v, 'u') * N(v, 'h')} ÷ ${v.l} = ${a}.`,
  }),
  numeric({
    sub: 'u18-06',
    d: 2,
    prompt: 'კვადრატის გვერდია {a} სმ. იპოვე მართკუთხედის სიგრძე, თუ მისი სიგანეა {c} სმ და ფართობი კვადრატის ფართობის ტოლია.',
    vars: { u: I(2, 8), f: I(2, 5), a: D((v) => N(v, 'f') * N(v, 'u')), c: D((v) => N(v, 'u')), l: D((v) => N(v, 'f') ** 2 * N(v, 'u')) },
    fmt: cm,
    num: (v) => N(v, 'l'),
    slips: (v) => [N(v, 'a') ** 2, N(v, 'a') + N(v, 'c'), N(v, 'a') * N(v, 'f'), N(v, 'a') ** 2 - N(v, 'c'), N(v, 'a') * 2],
    why: (v, a) => `S = ${v.a}² = ${N(v, 'a') ** 2}; ${N(v, 'a') ** 2} ÷ ${v.c} = ${a}.`,
  }),
  numeric({
    sub: 'u18-06',
    d: 3,
    prompt: 'პარალელოგრამის ფუძეა {b} სმ, ხოლო სიმაღლე — {h} სმ. იპოვე სამკუთხედის ფუძე, თუ მისი სიმაღლეა {hh} სმ და ფართობი პარალელოგრამის ფართობის ტოლია.',
    vars: {
      b: I(3, 16), h: I(2, 12),
      hh: C((v: Vars) => divisorsOf(2 * N(v, 'b') * N(v, 'h')).filter((x) => x >= 2 && x <= 20 && x <= N(v, 'b') * N(v, 'h'))),
      bb: D((v) => (2 * N(v, 'b') * N(v, 'h')) / N(v, 'hh')),
    },
    fmt: cm,
    num: (v) => N(v, 'bb'),
    slips: (v) => [N(v, 'b') * N(v, 'h') / N(v, 'hh'), N(v, 'b') * N(v, 'h'), N(v, 'b') + N(v, 'h'), (4 * N(v, 'b') * N(v, 'h')) / N(v, 'hh')],
    why: (v, a) => `S = ${v.b} · ${v.h} = ${N(v, 'b') * N(v, 'h')}; ${a} · ${v.hh} ÷ 2 = ${N(v, 'b') * N(v, 'h')}, ამიტომ ფუძეა ${a}.`,
  }),
  numeric({
    sub: 'u18-06',
    prompt: 'მართკუთხედის ფართობია {s} სმ². იპოვე პარალელოგრამის სიმაღლე, თუ მისი ფუძეა {b} სმ და ფართობი მართკუთხედის ფართობის ტოლია.',
    vars: { b: I(2, 15), h: I(2, 15), s: D((v) => N(v, 'b') * N(v, 'h')) },
    fmt: cm,
    num: (v) => N(v, 'h'),
    slips: (v) => [N(v, 's') / 2 / N(v, 'b'), N(v, 's') - N(v, 'b'), N(v, 's') / N(v, 'b') + 1, N(v, 'h') * 2, N(v, 'b')],
    why: (v, a) => `${v.s} ÷ ${v.b} = ${a}.`,
  }),
  numeric({
    sub: 'u18-06',
    d: 3,
    prompt: 'ტრაპეციის ფუძეებია {a} სმ და {b} სმ, ხოლო სიმაღლე — {h} სმ. იპოვე მართკუთხედის სიგრძე, თუ მისი სიგანეა {w} სმ და ფართობი ტრაპეციის ფართობის ტოლია.',
    vars: {
      w: I(3, 12), l: I(3, 15),
      h: C((v: Vars) => divisorsOf(2 * N(v, 'w') * N(v, 'l')).filter((x) => x >= 2 && x <= 12 && (2 * N(v, 'w') * N(v, 'l')) / x >= 5)),
      s: D((v) => (2 * N(v, 'w') * N(v, 'l')) / N(v, 'h')),
      a: I(1, (v: Vars) => Math.floor((N(v, 's') - 1) / 2)),
      b: D((v) => N(v, 's') - N(v, 'a')),
    },
    fmt: cm,
    num: (v) => N(v, 'l'),
    slips: (v) => [N(v, 's') * N(v, 'h'), (N(v, 's') * N(v, 'h')) / N(v, 'w'), N(v, 'w') * N(v, 'h'), N(v, 'l') * 2, N(v, 'l') + N(v, 'w')],
    why: (v, a) => `S = (${v.a} + ${v.b}) · ${v.h} ÷ 2 = ${N(v, 'w') * N(v, 'l')}; ${N(v, 'w') * N(v, 'l')} ÷ ${v.w} = ${a}.`,
  }),

  // ═════════ U18.7 — სივრცული ფიგურები და მათი შლილები ═════════
  solidCount('წახნაგი', 1, ['რამდენი', 'სულ რამდენი']),
  solidCount('წიბო', 2, ['რამდენი', 'სულ რამდენი']),
  solidCount('წვერო', 3, ['რამდენი', 'სულ რამდენი']),
  numeric({
    sub: 'u18-07',
    prompt: 'კუბის თითოეული წიბოს სიგრძეა {a} სმ. რამდენი კვადრატული სანტიმეტრია მისი ერთი წახნაგის ფართობი?',
    vars: { a: I(2, 15) },
    fmt: cm2,
    num: (v) => N(v, 'a') ** 2,
    slips: (v) => [4 * N(v, 'a'), 6 * N(v, 'a') ** 2, 2 * N(v, 'a'), N(v, 'a') ** 3, 3 * N(v, 'a')],
    why: (v, a) => `წახნაგი კვადრატია: ${v.a} · ${v.a} = ${a}.`,
  }),
  t({
    sub: 'u18-07',
    prompt: 'მართკუთხა პარალელეპიპედს აქვს სიგრძე {a} სმ, სიგანე {b} სმ და სიმაღლე {c} სმ. რამდენი {what} აქვს მას?',
    vars: { spec: SPEC(['წახნაგი|6', 'წიბო|12', 'წვერო|8']), what: F(0), n: F(1), a: I(3, 12), b: I(2, 9), c: I(2, 8) },
    answer: (v) => String(v.n),
    wrong: () => [3, 4, 6, 8, 12, 10, 9],
    why: (v, a) => `მართკუთხა პარალელეპიპედს ყოველთვის აქვს ${a} ${v.what}: ზომები ამას არ ცვლის.`,
  }),
  t({
    sub: 'u18-07',
    d: 2,
    prompt: '{fig} {w} რამდენი წახნაგისგან?',
    vars: { spec: SPEC(SOLIDS), fig: F(4), n: F(1), w: C(['შლილი შედგება', 'ბრტყელი შლილი შედგება']) },
    answer: (v) => String(v.n),
    wrong: (v) => countOptions(N(v, 'n')),
    why: (v, a) => `შლილში ყოველი წახნაგი ერთხელ ჩანს, ამიტომ ${v.fig} შლილი ${a} წახნაგისგან შედგება.`,
  }),

  // ═════════ U18.8 — მართკუთხა პარალელეპიპედის მოცულობა და სრული ზედაპირის ფართობი ═════════
  numeric({
    sub: 'u18-08',
    prompt: 'მართკუთხა პარალელეპიპედის ზომებია {a} სმ × {b} სმ × {c} სმ. იპოვე მოცულობა.',
    vars: { a: I(2, 12), b: I(2, 12), c: I(2, 12) },
    fmt: cm3,
    num: (v) => N(v, 'a') * N(v, 'b') * N(v, 'c'),
    slips: (v) => [N(v, 'a') + N(v, 'b') + N(v, 'c'), 2 * (N(v, 'a') * N(v, 'b') + N(v, 'b') * N(v, 'c') + N(v, 'a') * N(v, 'c')), N(v, 'a') * N(v, 'b') + N(v, 'c'), (N(v, 'a') + N(v, 'b')) * N(v, 'c')],
    why: (v, a) => `V = ${v.a} · ${v.b} · ${v.c} = ${a}.`,
  }),
  numeric({
    sub: 'u18-08',
    prompt: 'კუბის წიბოა {a} სმ. იპოვე მოცულობა.',
    vars: { a: I(2, 15) },
    fmt: cm3,
    num: (v) => N(v, 'a') ** 3,
    slips: (v) => [3 * N(v, 'a'), N(v, 'a') ** 2, 6 * N(v, 'a') ** 2, 3 * N(v, 'a') ** 2, 12 * N(v, 'a')],
    why: (v, a) => `V = ${v.a}³ = ${a}.`,
  }),
  numeric({
    sub: 'u18-08',
    prompt: 'მართკუთხა პარალელეპიპედის ზომებია {a} სმ × {b} სმ × {c} სმ. იპოვე სრული ზედაპირის ფართობი.',
    vars: { a: I(2, 12), b: I(2, 12), c: I(2, 12) },
    fmt: cm2,
    num: (v) => 2 * (N(v, 'a') * N(v, 'b') + N(v, 'b') * N(v, 'c') + N(v, 'a') * N(v, 'c')),
    slips: (v) => [N(v, 'a') * N(v, 'b') * N(v, 'c'), N(v, 'a') * N(v, 'b') + N(v, 'b') * N(v, 'c') + N(v, 'a') * N(v, 'c'), 4 * (N(v, 'a') + N(v, 'b') + N(v, 'c')), 2 * N(v, 'a') * N(v, 'b') + N(v, 'c')],
    why: (v, a) => `S = 2 · (${v.a}·${v.b} + ${v.b}·${v.c} + ${v.a}·${v.c}) = ${a}.`,
  }),
  numeric({
    sub: 'u18-08',
    prompt: 'კუბის წიბოა {a} სმ. იპოვე სრული ზედაპირის ფართობი.',
    vars: { a: I(2, 15) },
    fmt: cm2,
    num: (v) => 6 * N(v, 'a') ** 2,
    slips: (v) => [N(v, 'a') ** 3, 4 * N(v, 'a') ** 2, 12 * N(v, 'a'), 6 * N(v, 'a'), 3 * N(v, 'a') ** 2],
    why: (v, a) => `S = 6 · ${v.a}² = ${a}.`,
  }),
  numeric({
    sub: 'u18-08',
    d: 2,
    prompt: 'მართკუთხა პარალელეპიპედის სიგრძეა {a} სმ, სიგანე — {b} სმ, სიმაღლე — {c} სმ. იპოვე მოცულობა.',
    vars: { a: I(4, 15), b: I(3, 12), c: I(2, 10) },
    fmt: cm3,
    num: (v) => N(v, 'a') * N(v, 'b') * N(v, 'c'),
    slips: (v) => [N(v, 'a') + N(v, 'b') + N(v, 'c'), N(v, 'a') * N(v, 'b'), (N(v, 'a') + N(v, 'b')) * N(v, 'c'), (N(v, 'a') * N(v, 'b') * N(v, 'c')) / 2],
    why: (v, a) => `V = ${v.a} · ${v.b} · ${v.c} = ${a}.`,
  }),
  numeric({
    sub: 'u18-08',
    d: 2,
    prompt: 'მართკუთხა პარალელეპიპედის ზომებია {a} სმ × {b} სმ × {c} სმ. იპოვე სრული ზედაპირის ფართობი.',
    vars: { a: I(3, 15), b: I(2, 10), c: I(2, 8) },
    fmt: cm2,
    num: (v) => 2 * (N(v, 'a') * N(v, 'b') + N(v, 'b') * N(v, 'c') + N(v, 'a') * N(v, 'c')),
    slips: (v) => [N(v, 'a') * N(v, 'b') * N(v, 'c'), N(v, 'a') * N(v, 'b') + N(v, 'b') * N(v, 'c') + N(v, 'a') * N(v, 'c'), 2 * (N(v, 'a') * N(v, 'b') + N(v, 'b') * N(v, 'c')), 4 * (N(v, 'a') + N(v, 'b') + N(v, 'c'))],
    why: (v, a) => `S = 2 · (${v.a}·${v.b} + ${v.b}·${v.c} + ${v.a}·${v.c}) = ${a}.`,
  }),

  // ═════════ U18.9 — პრიზმის მოცულობა ═════════
  numeric({
    sub: 'u18-09',
    prompt: 'სამკუთხა პრიზმის ფუძის ფართობია {s} სმ², ხოლო სიმაღლე — {h} სმ. იპოვე მოცულობა.',
    vars: { s: I(5, 40), h: I(2, 15) },
    fmt: cm3,
    num: (v) => N(v, 's') * N(v, 'h'),
    slips: (v) => [N(v, 's') + N(v, 'h'), (N(v, 's') * N(v, 'h')) / 2, 2 * (N(v, 's') + N(v, 'h')), (N(v, 's') * N(v, 'h')) / 3],
    why: (v, a) => `V = ${v.s} · ${v.h} = ${a}.`,
  }),
  numeric({
    sub: 'u18-09',
    prompt: 'პრიზმის ფუძის ფართობია {s} სმ², ხოლო სიმაღლე — {h} სმ. იპოვე მოცულობა.',
    vars: { s: I(6, 60), h: I(2, 20) },
    fmt: cm3,
    num: (v) => N(v, 's') * N(v, 'h'),
    slips: (v) => [N(v, 's') + N(v, 'h'), (N(v, 's') * N(v, 'h')) / 2, N(v, 's') * N(v, 'h') + N(v, 's'), (N(v, 's') * N(v, 'h')) / 3],
    why: (v, a) => `V = ${v.s} · ${v.h} = ${a}.`,
  }),
  numeric({
    sub: 'u18-09',
    d: 2,
    prompt: 'პრიზმის მოცულობაა {vol} სმ³, ხოლო ფუძის ფართობი — {s} სმ². იპოვე სიმაღლე.',
    vars: { s: I(5, 40), h: I(2, 15), vol: G((v) => N(v, 's') * N(v, 'h')) },
    fmt: cm,
    num: (v) => N(v, 'h'),
    slips: (v) => [N(v, 'h') * 2, N(v, 'h') + N(v, 's'), (N(v, 's') * N(v, 'h')) / 2 / N(v, 's'), N(v, 's') * N(v, 'h') - N(v, 's')],
    why: (v, a) => `h = V ÷ S = ${v.vol} ÷ ${v.s} = ${a}.`,
  }),
  numeric({
    sub: 'u18-09',
    d: 3,
    prompt: 'სამკუთხა პრიზმის ფუძე სამკუთხედია, რომლის ფუძეა {b} სმ და სიმაღლე — {m} სმ. პრიზმის სიმაღლეა {h} სმ. იპოვე მოცულობა.',
    vars: { b: I(2, 14), m: I(2, 14), h: I(2, 15) },
    constraints: [{ test: (v: Vars) => even(v, 'b', 'm'), note: 'the base area is whole' }],
    fmt: cm3,
    num: (v) => ((N(v, 'b') * N(v, 'm')) / 2) * N(v, 'h'),
    slips: (v) => [N(v, 'b') * N(v, 'm') * N(v, 'h'), (N(v, 'b') * N(v, 'm')) / 2 + N(v, 'h'), (N(v, 'b') + N(v, 'm')) * N(v, 'h'), (N(v, 'b') * N(v, 'm') * N(v, 'h')) / 4],
    why: (v, a) => `ფუძის ფართობი ${v.b} · ${v.m} ÷ 2 = ${(N(v, 'b') * N(v, 'm')) / 2}; V = ${(N(v, 'b') * N(v, 'm')) / 2} · ${v.h} = ${a}.`,
  }),
  numeric({
    sub: 'u18-09',
    d: 2,
    prompt: 'პრიზმის მოცულობაა {vol} სმ³, ხოლო სიმაღლე — {h} სმ. იპოვე ფუძის ფართობი.',
    vars: { s: I(5, 40), h: I(2, 15), vol: G((v) => N(v, 's') * N(v, 'h')) },
    fmt: cm2,
    num: (v) => N(v, 's'),
    slips: (v) => [N(v, 's') * 2, N(v, 's') + N(v, 'h'), N(v, 's') * N(v, 'h') - N(v, 'h'), N(v, 's') / 2],
    why: (v, a) => `S = V ÷ h = ${v.vol} ÷ ${v.h} = ${a}.`,
  }),
  numeric({
    sub: 'u18-09',
    d: 2,
    prompt: 'პრიზმის ფუძე მართკუთხედია, რომლის ზომებია {a} სმ × {b} სმ. პრიზმის სიმაღლეა {h} სმ. იპოვე მოცულობა.',
    vars: { a: I(2, 12), b: I(2, 12), h: I(2, 15) },
    fmt: cm3,
    num: (v) => N(v, 'a') * N(v, 'b') * N(v, 'h'),
    slips: (v) => [N(v, 'a') * N(v, 'b') + N(v, 'h'), 2 * (N(v, 'a') + N(v, 'b')) * N(v, 'h'), (N(v, 'a') + N(v, 'b')) * N(v, 'h'), N(v, 'a') * N(v, 'b')],
    why: (v, a) => `ფუძის ფართობი ${v.a} · ${v.b} = ${N(v, 'a') * N(v, 'b')}; V = ${N(v, 'a') * N(v, 'b')} · ${v.h} = ${a}.`,
  }),

  // ═════════ U18.10 — პრიზმის სრული ზედაპირის ფართობი ═════════
  numeric({
    sub: 'u18-10',
    prompt: 'კუბის წიბოა {a} სმ. იპოვე სრული ზედაპირის ფართობი.',
    vars: { a: I(2, 12) },
    fmt: cm2,
    num: (v) => 6 * N(v, 'a') ** 2,
    slips: (v) => [N(v, 'a') ** 3, 4 * N(v, 'a') ** 2, 12 * N(v, 'a'), 6 * N(v, 'a'), 3 * N(v, 'a') ** 2],
    why: (v, a) => `S = 6 · ${v.a}² = ${a}.`,
  }),
  numeric({
    sub: 'u18-10',
    prompt: 'მართკუთხა პარალელეპიპედის ზომებია {a} სმ × {b} სმ × {c} სმ. იპოვე სრული ზედაპირის ფართობი.',
    vars: { a: I(3, 12), b: I(2, 10), c: I(2, 8) },
    fmt: cm2,
    num: (v) => 2 * (N(v, 'a') * N(v, 'b') + N(v, 'b') * N(v, 'c') + N(v, 'a') * N(v, 'c')),
    slips: (v) => [N(v, 'a') * N(v, 'b') * N(v, 'c'), N(v, 'a') * N(v, 'b') + N(v, 'b') * N(v, 'c') + N(v, 'a') * N(v, 'c'), 4 * (N(v, 'a') + N(v, 'b') + N(v, 'c')), 2 * N(v, 'a') * N(v, 'b')],
    why: (v, a) => `S = 2 · (${v.a}·${v.b} + ${v.b}·${v.c} + ${v.a}·${v.c}) = ${a}.`,
  }),
  numeric({
    sub: 'u18-10',
    d: 2,
    prompt: 'სამკუთხა პრიზმის ფუძის პერიმეტრია {p} სმ, ფუძის ფართობი — {s} სმ², ხოლო პრიზმის სიმაღლე — {h} სმ. იპოვე სრული ზედაპირის ფართობი.',
    vars: { p: I(6, 24), s: I(3, 20), h: I(2, 12) },
    fmt: cm2,
    num: (v) => 2 * N(v, 's') + N(v, 'p') * N(v, 'h'),
    slips: (v) => [N(v, 's') + N(v, 'p') * N(v, 'h'), 2 * N(v, 's') + N(v, 'p') + N(v, 'h'), N(v, 'p') * N(v, 'h'), 2 * (N(v, 's') + N(v, 'p')) * N(v, 'h')],
    why: (v, a) => `S = 2 · ${v.s} + ${v.p} · ${v.h} = ${2 * N(v, 's')} + ${N(v, 'p') * N(v, 'h')} = ${a}.`,
  }),
  numeric({
    sub: 'u18-10',
    d: 2,
    prompt: 'პრიზმის ფუძის პერიმეტრია {p} სმ, ფუძის ფართობი — {s} სმ², ხოლო სიმაღლე — {h} სმ. იპოვე სრული ზედაპირის ფართობი.',
    vars: { p: I(10, 40), s: I(10, 60), h: I(3, 15) },
    fmt: cm2,
    num: (v) => 2 * N(v, 's') + N(v, 'p') * N(v, 'h'),
    slips: (v) => [N(v, 's') + N(v, 'p') * N(v, 'h'), 2 * N(v, 's') + N(v, 'p') + N(v, 'h'), N(v, 's') * N(v, 'h') + 2 * N(v, 'p'), N(v, 'p') * N(v, 'h')],
    why: (v, a) => `S = 2 · ${v.s} + ${v.p} · ${v.h} = ${2 * N(v, 's')} + ${N(v, 'p') * N(v, 'h')} = ${a}.`,
  }),
  numeric({
    sub: 'u18-10',
    d: 2,
    prompt: 'კუბის სრული ზედაპირის ფართობია {s} სმ². იპოვე წიბოს სიგრძე.',
    vars: { a: I(2, 12), s: D((v) => 6 * N(v, 'a') ** 2) },
    fmt: cm,
    num: (v) => N(v, 'a'),
    slips: (v) => [N(v, 's') / 6, N(v, 's') / 4, N(v, 'a') * 2, N(v, 's') / 12, N(v, 'a') + 1],
    why: (v, a) => `${v.s} ÷ 6 = ${N(v, 'a') ** 2}; ${N(v, 'a') ** 2} = ${v.a} · ${v.a}, ამიტომ წიბოა ${a}.`,
  }),
  numeric({
    sub: 'u18-10',
    d: 2,
    prompt: 'მართკუთხა პარალელეპიპედის ფუძის ზომებია {a} სმ × {b} სმ, ხოლო სიმაღლე — {h} სმ. იპოვე სრული ზედაპირის ფართობი.',
    vars: { a: I(3, 12), b: I(2, 10), h: I(2, 9) },
    fmt: cm2,
    num: (v) => 2 * N(v, 'a') * N(v, 'b') + 2 * (N(v, 'a') + N(v, 'b')) * N(v, 'h'),
    slips: (v) => [N(v, 'a') * N(v, 'b') * N(v, 'h'), 2 * N(v, 'a') * N(v, 'b') + (N(v, 'a') + N(v, 'b')) * N(v, 'h'), 2 * (N(v, 'a') + N(v, 'b')) * N(v, 'h'), N(v, 'a') * N(v, 'b') + 2 * (N(v, 'a') + N(v, 'b')) * N(v, 'h')],
    why: (v, a) => `2 · ${v.a} · ${v.b} + 2 · (${v.a} + ${v.b}) · ${v.h} = ${a}.`,
  }),

  // ═════════ U18.11 — პირამიდა და კონუსი ═════════
  t({
    sub: 'u18-11',
    prompt: '{pre} წვერო აქვს {fig} პირამიდას?',
    vars: { spec: SPEC(['სამკუთხა|4', 'ოთხკუთხა|5', 'ხუთკუთხა|6', 'ექვსკუთხა|7', 'შვიდკუთხა|8', 'რვაკუთხა|9']), fig: F(0), n: F(1), pre: C(['რამდენი', 'სულ რამდენი']) },
    answer: (v) => String(v.n),
    wrong: (v) => countOptions(N(v, 'n')),
    why: (v, a) => `${v.fig} პირამიდას ფუძის წვეროების გარდა ერთი მწვერვალი აქვს: ${a} წვერო.`,
  }),
  t({
    sub: 'u18-11',
    prompt: '{pre} წახნაგი აქვს {fig} პირამიდას?',
    vars: { spec: SPEC(['სამკუთხა|4', 'ოთხკუთხა|5', 'ხუთკუთხა|6', 'ექვსკუთხა|7', 'შვიდკუთხა|8', 'რვაკუთხა|9']), fig: F(0), n: F(1), pre: C(['რამდენი', 'სულ რამდენი']) },
    answer: (v) => String(v.n),
    wrong: (v) => countOptions(N(v, 'n')),
    why: (v, a) => `${v.fig} პირამიდას ფუძე და გვერდითი სამკუთხა წახნაგები აქვს, სულ ${a}.`,
  }),
  t({
    sub: 'u18-11',
    d: 2,
    prompt: '{q}',
    vars: {
      spec: SPEC([
        'კონუსს აქვს ერთი წრიული ფუძე. რამდენი წვერო აქვს მას?|1', 'ცილინდრს აქვს ორი წრიული ფუძე. რამდენი წვერო აქვს მას?|0',
        'რამდენი წრიული ფუძე აქვს კონუსს?|1', 'რამდენი წრიული ფუძე აქვს ცილინდრს?|2', 'რამდენი წვერო აქვს ცილინდრს?|0', 'რამდენი წვერო აქვს კონუსს?|1',
        'სულ რამდენი წვერო აქვს ცილინდრს?|0', 'სულ რამდენი წვერო აქვს კონუსს?|1', 'სულ რამდენი წრიული ფუძე აქვს ცილინდრს?|2', 'სულ რამდენი წრიული ფუძე აქვს კონუსს?|1',
      ]),
      q: F(0), n: F(1),
    },
    answer: (v) => String(v.n),
    wrong: () => [0, 1, 2, 3, 4],
    why: (v, a) => `${v.q} პასუხი: ${a}. კონუსს ერთი წრიული ფუძე და ერთი წვერო აქვს, ცილინდრს — ორი წრიული ფუძე და წვერო არ აქვს.`,
  }),
  numeric({
    sub: 'u18-11',
    prompt: 'პირამიდის ფუძის ფართობია {s} სმ², ხოლო სიმაღლე — {h} სმ. იპოვე მოცულობა.',
    vars: { s: I(6, 60), h: I(3, 18) },
    constraints: [{ test: (v: Vars) => (N(v, 's') * N(v, 'h')) % 3 === 0, note: 'the volume is whole' }],
    fmt: cm3,
    num: (v) => (N(v, 's') * N(v, 'h')) / 3,
    slips: (v) => [N(v, 's') * N(v, 'h'), (N(v, 's') * N(v, 'h')) / 2, N(v, 's') + N(v, 'h'), (2 * N(v, 's') * N(v, 'h')) / 3],
    why: (v, a) => `V = ${v.s} · ${v.h} ÷ 3 = ${a}.`,
  }),
  numeric({
    sub: 'u18-11',
    d: 3,
    prompt: 'კონუსის რადიუსია {r} სმ, ხოლო სიმაღლე — {h} სმ. იპოვე მოცულობა (π = 3,14). გამოიყენე ფორმულა V = 1/3 · π · r² · h.',
    decimals: true,
    vars: { r: I(2, 9), u: I(1, 6), h: D((v) => 3 * N(v, 'u')) },
    fmt: cm3d,
    num: (v) => PI * N(v, 'r') ** 2 * N(v, 'u'),
    slips: (v) => [PI * N(v, 'r') ** 2 * N(v, 'h'), PI * N(v, 'r') * N(v, 'h') / 3, N(v, 'r') ** 2 * N(v, 'u'), PI * N(v, 'r') * N(v, 'u'), PI * N(v, 'r') ** 2 * N(v, 'h') / 2],
    why: (v, a) => `V = 1/3 · 3,14 · ${v.r}² · ${v.h} = 3,14 · ${N(v, 'r') ** 2} · ${v.u} = ${a}.`,
  }),
  numeric({
    sub: 'u18-11',
    d: 2,
    prompt: 'ოთხკუთხა პირამიდის ფუძე კვადრატია, რომლის გვერდია {a} სმ. პირამიდის სიმაღლეა {h} სმ. იპოვე მოცულობა.',
    vars: { a: I(3, 12), h: I(3, 18) },
    constraints: [{ test: (v: Vars) => (N(v, 'a') ** 2 * N(v, 'h')) % 3 === 0, note: 'the volume is whole' }],
    fmt: cm3,
    num: (v) => (N(v, 'a') ** 2 * N(v, 'h')) / 3,
    slips: (v) => [N(v, 'a') ** 2 * N(v, 'h'), (N(v, 'a') ** 2 * N(v, 'h')) / 2, (4 * N(v, 'a') * N(v, 'h')) / 3, N(v, 'a') ** 2 + N(v, 'h')],
    why: (v, a) => `ფუძის ფართობი ${v.a}² = ${N(v, 'a') ** 2}; V = ${N(v, 'a') ** 2} · ${v.h} ÷ 3 = ${a}.`,
  }),

  // ═════════ U18.12 — სხვადასხვა ფიგურის მოცულობა ═════════
  numeric({
    sub: 'u18-12',
    prompt: 'კუბის წიბოა {a} სმ. იპოვე მოცულობა.',
    vars: { a: I(2, 12) },
    fmt: cm3,
    num: (v) => N(v, 'a') ** 3,
    slips: (v) => [3 * N(v, 'a'), N(v, 'a') ** 2, 6 * N(v, 'a') ** 2, 3 * N(v, 'a') ** 2],
    why: (v, a) => `V = ${v.a}³ = ${a}.`,
  }),
  numeric({
    sub: 'u18-12',
    prompt: 'მართკუთხა პარალელეპიპედის ზომებია {a} სმ × {b} სმ × {c} სმ. იპოვე მოცულობა.',
    vars: { a: I(4, 12), b: I(3, 10), c: I(2, 8) },
    fmt: cm3,
    num: (v) => N(v, 'a') * N(v, 'b') * N(v, 'c'),
    slips: (v) => [N(v, 'a') + N(v, 'b') + N(v, 'c'), N(v, 'a') * N(v, 'b') + N(v, 'c'), (N(v, 'a') + N(v, 'b')) * N(v, 'c'), 2 * (N(v, 'a') * N(v, 'b') + N(v, 'b') * N(v, 'c') + N(v, 'a') * N(v, 'c'))],
    why: (v, a) => `V = ${v.a} · ${v.b} · ${v.c} = ${a}.`,
  }),
  numeric({
    sub: 'u18-12',
    d: 2,
    prompt: 'ცილინდრის რადიუსია {r} სმ, ხოლო სიმაღლე — {h} სმ. იპოვე მოცულობა (π = 3,14). გამოიყენე ფორმულა V = π · r² · h.',
    decimals: true,
    vars: { r: I(2, 10), h: I(2, 12) },
    fmt: cm3d,
    num: (v) => PI * N(v, 'r') ** 2 * N(v, 'h'),
    slips: (v) => [PI * N(v, 'r') * N(v, 'h'), PI * 2 * N(v, 'r') * N(v, 'h'), (PI * N(v, 'r') ** 2 * N(v, 'h')) / 3, PI * N(v, 'r') ** 2, PI * (2 * N(v, 'r')) ** 2 * N(v, 'h')],
    why: (v, a) => `V = 3,14 · ${v.r}² · ${v.h} = 3,14 · ${N(v, 'r') ** 2 * N(v, 'h')} = ${a}.`,
  }),
  numeric({
    sub: 'u18-12',
    d: 2,
    prompt: 'პირამიდის ფუძის ფართობია {s} სმ², ხოლო სიმაღლე — {h} სმ. იპოვე მოცულობა.',
    vars: { s: I(4, 50), u: I(1, 8), h: D((v) => 3 * N(v, 'u')) },
    fmt: cm3,
    num: (v) => N(v, 's') * N(v, 'u'),
    slips: (v) => [N(v, 's') * N(v, 'h'), (N(v, 's') * N(v, 'h')) / 2, N(v, 's') + N(v, 'h'), N(v, 's') * N(v, 'u') * 2],
    why: (v, a) => `V = ${v.s} · ${v.h} ÷ 3 = ${a}.`,
  }),
  numeric({
    sub: 'u18-12',
    d: 2,
    prompt: 'მართკუთხა აკვარიუმის სიგრძეა {a} სმ, სიგანე — {b} სმ, სიმაღლე — {c} სმ. იპოვე მისი მოცულობა კუბურ სანტიმეტრებში.',
    vars: { a: C([40, 50, 60, 70, 80]), b: C([20, 25, 30, 35, 40]), c: C([30, 35, 40, 45, 50]) },
    fmt: cm3,
    num: (v) => N(v, 'a') * N(v, 'b') * N(v, 'c'),
    slips: (v) => [N(v, 'a') + N(v, 'b') + N(v, 'c'), (N(v, 'a') * N(v, 'b') * N(v, 'c')) / 10, N(v, 'a') * N(v, 'b') * N(v, 'c') * 10, 2 * (N(v, 'a') * N(v, 'b') + N(v, 'b') * N(v, 'c') + N(v, 'a') * N(v, 'c'))],
    why: (v, a) => `V = ${v.a} · ${v.b} · ${v.c} = ${a}.`,
  }),
  numeric({
    sub: 'u18-12',
    d: 2,
    prompt: 'მართკუთხა პარალელეპიპედის მოცულობაა {vol} სმ³. მისი სიგრძეა {a} სმ, სიგანე — {b} სმ. იპოვე სიმაღლე.',
    vars: { a: I(4, 15), b: I(3, 12), c: I(2, 12), vol: G((v) => N(v, 'a') * N(v, 'b') * N(v, 'c')) },
    fmt: cm,
    num: (v) => N(v, 'c'),
    slips: (v) => [N(v, 'c') * 2, N(v, 'a') * N(v, 'b'), N(v, 'a') + N(v, 'b'), N(v, 'c') + N(v, 'b'), N(v, 'c') + N(v, 'a')],
    why: (v, a) => `${v.a} · ${v.b} = ${N(v, 'a') * N(v, 'b')}; ${v.vol} ÷ ${N(v, 'a') * N(v, 'b')} = ${a}.`,
  }),
];
