import type { QuestionTemplate, Vars } from './types';
import { C, D, F, I, N, SPEC, dec, gcd, group, q6, sg } from './g6-helpers';

/**
 * Grade VI — Unit 16: კუთხეები, წრფეები და წრეწირები (angles, lines and circles).
 *
 * Converted from the academy's `U16` bank: 11 subtopics × 6 questions.
 *
 * Angles print as `48°`, lengths as `12 სმ`, areas as `9π სმ²`, radian measures
 * as `π/2` or `3π/2`. Every angle or length key goes through one formatter and
 * so do its wrong options, which keeps units from drifting between them.
 */

export const G6_U16_SUBTOPICS = [
  'u16-01', 'u16-02', 'u16-03', 'u16-04', 'u16-05', 'u16-06',
  'u16-07', 'u16-08', 'u16-09', 'u16-10', 'u16-11',
] as const;

const T = 'g6-angles-circles';
const PNAMES = ['A', 'B', 'C', 'D', 'E', 'F'];

/** Pythagorean triples as [radius, distance from the centre, half chord]. */
const TRI_A: Array<[number, number, number]> = [[5, 3, 4], [5, 4, 3], [10, 6, 8], [10, 8, 6], [15, 9, 12], [15, 12, 9], [17, 8, 15], [17, 15, 8], [20, 12, 16], [20, 16, 12]];
const TRI_B: Array<[number, number, number]> = [[13, 5, 12], [13, 12, 5], [25, 7, 24], [25, 24, 7], [26, 10, 24], [26, 24, 10], [29, 20, 21], [29, 21, 20], [30, 18, 24], [30, 24, 18], [34, 16, 30], [37, 12, 35]];
const TRI_ALL: Array<[number, number, number]> = [...TRI_A, ...TRI_B];

let seq = 0;
const nextId = (): string => `g6-u16-q${String(++seq).padStart(2, '0')}`;
type Spec = Omit<Parameters<typeof q6>[0], 'id' | 'topic'>;
const t = (spec: Spec): QuestionTemplate => q6({ id: nextId(), topic: T, ...spec });

// ───────────────────────────── formatting ─────────────────────────────

const deg = (x: number): string => `${group(x)}°`;
const cm = (x: number): string => `${group(x)} სმ`;
const cmDec = (x: number): string => `${dec(x, 2)} სმ`;

/** A key and its wrong options, all printed by the same formatter and kept to positive values. */
interface NumSpec {
  sub: string;
  d?: 1 | 2 | 3;
  prompt: string;
  vars: Spec['vars'];
  constraints?: Spec['constraints'];
  fmt: (x: number) => string;
  num: (v: Vars) => number;
  slips: (v: Vars) => number[];
  max?: number;
  /** Decimal keys (π = 3,14) may carry fractional options; everything else stays whole. */
  decimals?: boolean;
  why: (v: Vars, answer: string) => string;
}
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
      const limit = o.max ?? Infinity;
      return o
        .slips(v)
        .map((x) => Math.round(x * 1000) / 1000)
        .filter((x) => Number.isFinite(x) && x > 0 && x <= limit && Math.abs(x - right) > 1e-9 && (o.decimals ? Math.abs(x * 100 - Math.round(x * 100)) < 1e-6 : Number.isInteger(x)))
        .map(o.fmt);
    },
    why: o.why,
  });

/** `π`, `π/2`, `3π/2`, `2π` for an angle in degrees. */
const radText = (degrees: number): string => {
  const g = gcd(degrees, 180);
  const n = degrees / g;
  const d = 180 / g;
  const top = n === 1 ? 'π' : `${n}π`;
  return d === 1 ? top : `${top}/${d}`;
};
const degreeSlips = (x: number): number[] => [x + 30, x - 30, x * 2, x / 2, 360 - x, 180 - x, x + 15, x - 15, x + 60];

/** A choice pool of degree values with a radian counterpart. */
const radians = (sub: string, d: 1 | 2 | 3, prompt: string, pool: number[]): QuestionTemplate =>
  t({
    sub, d, prompt,
    vars: { a: C(pool) },
    answer: (v) => radText(N(v, 'a')),
    wrong: (v) => degreeSlips(N(v, 'a')).filter((x) => Number.isInteger(x) && x > 0 && x <= 720).map(radText),
    why: (v, a) => `${v.a}° = ${v.a}/180 · π = ${a}.`,
  });
const degreesOf = (sub: string, d: 1 | 2 | 3, prompt: string, pool: number[]): QuestionTemplate =>
  t({
    sub, d, prompt,
    vars: { a: C(pool), r: D((v) => radText(N(v, 'a'))) },
    answer: (v) => deg(N(v, 'a')),
    wrong: (v) => degreeSlips(N(v, 'a')).filter((x) => Number.isInteger(x) && x > 0 && x <= 720).map(deg),
    why: (v, a) => `${v.r} რადიანი = ${a}, რადგან π = 180°.`,
  });

const showXY = { px: D((v: Vars) => sg(N(v, 'x'))), py: D((v: Vars) => sg(N(v, 'y'))) };

export const G6_U16_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U16.1 — წრფეები, მონაკვეთები და სხივები ═════════
  t({
    sub: 'u16-01',
    prompt: 'რამდენი ბოლო წერტილი აქვს {fig}?',
    vars: { spec: SPEC(['მონაკვეთს|2', 'სხივს|1', 'წრფეს|0', 'წრფეზე მოთავსებულ მონაკვეთს|2', 'წრფის იმ ნაწილს, რომელიც ერთი წერტილიდან უსასრულოდ გრძელდება|1']), fig: F(0), n: F(1) },
    answer: (v) => String(v.n),
    options: (_v, right) => [right, '0', '1', '2', '3'],
    why: (v, a) => `${v.fig} აქვს ${a} ბოლო წერტილი: მონაკვეთს — 2, სხივს — 1, წრფეს — 0.`,
  }),
  t({
    sub: 'u16-01',
    prompt: 'სულ რამდენი ბოლო წერტილი აქვს {n} ერთმანეთისგან დამოუკიდებელ {fig}?',
    vars: { n: I(2, 6), spec: SPEC(['მონაკვეთს|2', 'სხივს|1']), fig: F(0), per: F(1) },
    answer: (v) => sg(N(v, 'n') * N(v, 'per')),
    wrong: (v) => [N(v, 'n'), N(v, 'n') + N(v, 'per'), N(v, 'n') * 2 + 1, N(v, 'n') * 3, N(v, 'n') * N(v, 'per') + 1],
    why: (v, a) => `თითოეულს აქვს ${v.per} ბოლო წერტილი: ${v.n} × ${v.per} = ${a}.`,
  }),
  t({
    sub: 'u16-01',
    d: 2,
    prompt: 'რამდენი საერთო წერტილი აქვს {what}?',
    vars: {
      spec: SPEC([
        'ორ პარალელურ წრფეს|0', 'ორ წრფეს, რომლებიც ერთ წერტილში იკვეთება|1', 'ორ მონაკვეთს, რომლებსაც მხოლოდ ერთი ბოლო წერტილი აქვთ საერთო|1',
        'ორ ერთმანეთისგან დაშორებულ მონაკვეთს|0', 'ორ სხივს, რომლებიც ერთ წერტილში იკვეთება და ერთმანეთის გაგრძელება არ არის|1',
      ]),
      what: F(0), n: F(1),
    },
    answer: (v) => String(v.n),
    options: (_v, right) => [right, '0', '1', '2', '3'],
    why: (v, a) => `${v.what}: ${a}.`,
  }),
  t({
    sub: 'u16-01',
    d: 2,
    prompt: 'წრფეზე მონიშნულია {n} განსხვავებული წერტილი. რამდენი სხვადასხვა მონაკვეთის განსაზღვრა შეიძლება ამ წერტილებით?',
    vars: { n: I(3, 8) },
    answer: (v) => sg((N(v, 'n') * (N(v, 'n') - 1)) / 2),
    wrong: (v) => [N(v, 'n'), N(v, 'n') - 1, N(v, 'n') * (N(v, 'n') - 1), (N(v, 'n') * (N(v, 'n') - 1)) / 2 + 1, (N(v, 'n') * (N(v, 'n') - 1)) / 2 - 1, N(v, 'n') * 2],
    why: (v, a) => `ყოველი ორი წერტილი ერთ მონაკვეთს ქმნის: ${v.n} × ${N(v, 'n') - 1} ÷ 2 = ${a}.`,
  }),
  numeric({
    sub: 'u16-01',
    prompt: 'წერტილი {B} მდებარეობს {A}-სა და {C}-ს შორის. თუ {A}{B} = {x} სმ და {B}{C} = {y} სმ, იპოვე {A}{C}.',
    vars: { spec: SPEC(['A|B|C', 'M|N|K', 'P|Q|R', 'D|E|F', 'X|Y|Z']), A: F(0), B: F(1), C: F(2), x: I(2, 20), y: I(2, 20) },
    fmt: cm,
    num: (v) => N(v, 'x') + N(v, 'y'),
    slips: (v) => [Math.abs(N(v, 'x') - N(v, 'y')), N(v, 'x') * N(v, 'y'), N(v, 'x') + N(v, 'y') + 1, N(v, 'x') + N(v, 'y') - 1, Math.max(N(v, 'x'), N(v, 'y'))],
    why: (v, a) => `${v.A}${v.C} = ${v.A}${v.B} + ${v.B}${v.C} = ${v.x} + ${v.y} = ${a}.`,
  }),
  numeric({
    sub: 'u16-01',
    d: 2,
    prompt: 'სხივზე მოცემულია წერტილები {A} და {B}, სადაც {A} სხივის საწყისი წერტილია, ხოლო {A}{B} = {x} სმ. წერტილი {C} მდებარეობს {A}-სა და {B}-ს შორის და {A}{C} = {y} სმ. იპოვე {C}{B}.',
    vars: { spec: SPEC(['A|B|C', 'M|N|K', 'P|Q|R', 'O|S|T']), A: F(0), B: F(1), C: F(2), x: I(8, 24), y: I(2, (v) => N(v, 'x') - 2) },
    fmt: cm,
    num: (v) => N(v, 'x') - N(v, 'y'),
    slips: (v) => [N(v, 'x') + N(v, 'y'), N(v, 'y'), N(v, 'x') - N(v, 'y') + 1, N(v, 'x') - N(v, 'y') - 1, N(v, 'x')],
    why: (v, a) => `${v.C}${v.B} = ${v.A}${v.B} − ${v.A}${v.C} = ${v.x} − ${v.y} = ${a}.`,
  }),

  // ═════════ U16.2 — კუთხეების გაზომვა და კლასიფიკაცია ═════════
  angleKind('u16-02', 1, I(5, 89)),
  angleKind('u16-02', 1, C([90, 180])),
  angleKind('u16-02', 1, I(91, 179)),
  t({
    sub: 'u16-02',
    prompt: 'რამდენი გრადუსია {what}?',
    vars: { spec: SPEC(['გაშლილი კუთხე|180', 'მართი კუთხე|90', 'სრული კუთხე (სრული ბრუნი)|360', 'გაშლილი კუთხის ნახევარი|90', 'მართი კუთხის ნახევარი|45', 'ორი მართი კუთხის ჯამი|180']), what: F(0), n: F(1) },
    answer: (v) => deg(N(v, 'n')),
    options: (_v, right) => [right, ...[45, 90, 180, 360, 270].map(deg)],
    why: (v, a) => `${v.what} — ${a}.`,
  }),
  numeric({
    sub: 'u16-02',
    prompt: 'კუთხის ზომაა {a}°. რამდენი გრადუსი უნდა დაემატოს მას, რომ მართი კუთხე მივიღოთ?',
    vars: { a: I(5, 85) },
    fmt: deg,
    num: (v) => 90 - N(v, 'a'),
    slips: (v) => [180 - N(v, 'a'), N(v, 'a'), 90 + N(v, 'a'), 90 - N(v, 'a') + 10, 90 - N(v, 'a') - 10, 360 - N(v, 'a')],
    why: (v, a) => `მართი კუთხე 90°-ია: 90° − ${v.a}° = ${a}.`,
  }),
  numeric({
    sub: 'u16-02',
    d: 2,
    prompt: 'ორი კუთხის ჯამია {s}°. ერთ-ერთი მათგანია {a}°. იპოვე მეორე კუთხე.',
    vars: { s: C([90, 180]), a: I(10, 85) },
    fmt: deg,
    num: (v) => N(v, 's') - N(v, 'a'),
    slips: (v) => [N(v, 's') + N(v, 'a'), 360 - N(v, 'a'), N(v, 'a'), N(v, 's') - N(v, 'a') + 10, N(v, 's') - N(v, 'a') - 10, 90 - N(v, 'a'), 180 - N(v, 'a')],
    why: (v, a) => `${v.s}° − ${v.a}° = ${a}.`,
  }),

  // ═════════ U16.3 — გრადუსები და რადიანები ═════════
  radians('u16-03', 1, 'რამდენი რადიანია {a}°?', [180, 90, 360, 270]),
  degreesOf('u16-03', 1, 'რამდენი გრადუსია {r} რადიანი?', [180, 90, 360, 270]),
  degreesOf('u16-03', 2, 'რამდენი გრადუსია {r} რადიანი?', [60, 45, 30, 20, 15, 36]),
  radians('u16-03', 1, 'რამდენი რადიანია {a}°?', [60, 45, 30, 20, 15, 36]),
  radians('u16-03', 2, 'გადაიყვანე {a}° რადიანებში.', [120, 135, 150, 210, 240, 300]),
  degreesOf('u16-03', 2, 'გადაიყვანე {r} რადიანი გრადუსებში.', [120, 135, 150, 210, 240, 300]),

  // ═════════ U16.4 — პარალელური წრფეები და მკვეთი ═════════
  numeric({
    sub: 'u16-04',
    prompt: 'ორი პარალელური წრფე მკვეთით გადაიკვეთა. ერთ-ერთი შესაბამისი კუთხეა {a}°. რამდენი გრადუსია მასთან შესაბამისი მეორე კუთხე?',
    vars: { a: I(30, 150) },
    fmt: deg,
    num: (v) => N(v, 'a'),
    slips: (v) => [180 - N(v, 'a'), 90 - N(v, 'a'), 360 - N(v, 'a'), N(v, 'a') + 10, N(v, 'a') - 10, N(v, 'a') / 2],
    why: (_v, a) => `პარალელური წრფეების შესაბამისი კუთხეები ტოლია: ${a}.`,
  }),
  numeric({
    sub: 'u16-04',
    prompt: 'ორი პარალელური წრფის მკვეთის მიერ წარმოქმნილი ერთ-ერთი შიგა ცალმხრივი კუთხეა {a}°. რამდენია მეორე შიგა ცალმხრივი კუთხე?',
    vars: { a: I(40, 140) },
    fmt: deg,
    num: (v) => 180 - N(v, 'a'),
    slips: (v) => [N(v, 'a'), 90 - N(v, 'a'), 360 - N(v, 'a'), 180 - N(v, 'a') + 10, 180 - N(v, 'a') - 10, 90 + N(v, 'a')],
    why: (v, a) => `შიგა ცალმხრივი კუთხეების ჯამია 180°: 180° − ${v.a}° = ${a}.`,
  }),
  numeric({
    sub: 'u16-04',
    prompt: 'ორი პარალელური წრფის მკვეთის მიერ წარმოქმნილი ერთ-ერთი მონაცვლე შიგა კუთხეა {a}°. რამდენია მეორე მონაცვლე შიგა კუთხე?',
    vars: { a: I(30, 150) },
    fmt: deg,
    num: (v) => N(v, 'a'),
    slips: (v) => [180 - N(v, 'a'), 90 - N(v, 'a'), 360 - N(v, 'a'), N(v, 'a') + 10, N(v, 'a') - 10, N(v, 'a') * 2],
    why: (_v, a) => `მონაცვლე შიგა კუთხეები ტოლია: ${a}.`,
  }),
  t({
    sub: 'u16-04',
    d: 2,
    prompt: 'ორი პარალელური წრფის მკვეთის მიერ წარმოქმნილი კუთხეებია {k}x° და {a}°. თუ ეს კუთხეები შესაბამისია, იპოვე x.',
    vars: { k: I(2, 5), s: I(5, 35), a: D((v) => N(v, 'k') * N(v, 's')) },
    answer: (v) => sg(N(v, 's')),
    wrong: (v) => [N(v, 'a'), N(v, 'a') - N(v, 'k'), N(v, 'a') * N(v, 'k'), (180 - N(v, 'a')) / N(v, 'k'), N(v, 's') + 1, N(v, 's') - 1, N(v, 'k')],
    why: (v, a) => `${v.k}x = ${v.a}, ამიტომ x = ${v.a} ÷ ${v.k} = ${a}.`,
  }),
  t({
    sub: 'u16-04',
    d: 2,
    prompt: 'ორი პარალელური წრფის მკვეთის მიერ წარმოქმნილი შიგა ცალმხრივი კუთხეებია {cp}x° და {cq}x°. იპოვე x.',
    vars: { p: I(1, 8), q: I(1, 8), cp: D((v) => coef(N(v, 'p'))), cq: D((v) => coef(N(v, 'q'))) },
    constraints: [{ test: (v) => 180 % (N(v, 'p') + N(v, 'q')) === 0 && N(v, 'p') !== N(v, 'q'), note: 'whole answer' }],
    answer: (v) => sg(180 / (N(v, 'p') + N(v, 'q'))),
    wrong: (v) => {
      const x = 180 / (N(v, 'p') + N(v, 'q'));
      return [x * N(v, 'p'), x * N(v, 'q'), 90 / (N(v, 'p') + N(v, 'q')), 360 / (N(v, 'p') + N(v, 'q')), x + 5, x - 5, 180 / Math.abs(N(v, 'p') - N(v, 'q') || 1)];
    },
    why: (v, a) => `${v.cp}x + ${v.cq}x = 180, ამიტომ ${N(v, 'p') + N(v, 'q')}x = 180 და x = ${a}.`,
  }),
  numeric({
    sub: 'u16-04',
    prompt: 'ორი პარალელური წრფის მკვეთის მიერ წარმოქმნილი ერთ-ერთი კუთხეა {a}°. იპოვე ამ კუთხის მეზობელი კუთხის ზომა.',
    vars: { a: I(40, 170) },
    constraints: [{ test: (v) => N(v, 'a') !== 90, note: 'not a right angle' }],
    fmt: deg,
    num: (v) => 180 - N(v, 'a'),
    slips: (v) => [N(v, 'a'), 90 - N(v, 'a'), 360 - N(v, 'a'), 180 - N(v, 'a') + 10, 180 - N(v, 'a') - 10, 90 + N(v, 'a')],
    why: (v, a) => `მეზობელი კუთხეების ჯამია 180°: 180° − ${v.a}° = ${a}.`,
  }),

  // ═════════ U16.5 — მოსაზღვრე და ვერტიკალური კუთხეები ═════════
  numeric({
    sub: 'u16-05',
    prompt: 'ორი ვერტიკალური კუთხიდან ერთ-ერთია {a}°. რამდენია მეორე ვერტიკალური კუთხე?',
    vars: { a: I(20, 160) },
    constraints: [{ test: (v) => N(v, 'a') !== 90, note: 'not a right angle' }],
    fmt: deg,
    num: (v) => N(v, 'a'),
    slips: (v) => [180 - N(v, 'a'), 90 - N(v, 'a'), 360 - N(v, 'a'), N(v, 'a') + 10, N(v, 'a') - 10, N(v, 'a') * 2],
    why: (_v, a) => `ვერტიკალური კუთხეები ტოლია: ${a}.`,
  }),
  numeric({
    sub: 'u16-05',
    prompt: 'ორი მოსაზღვრე კუთხის ჯამია 180°. ერთი კუთხეა {a}°. იპოვე მეორე კუთხე.',
    vars: { a: I(20, 160) },
    constraints: [{ test: (v) => N(v, 'a') !== 90, note: 'not a right angle' }],
    fmt: deg,
    num: (v) => 180 - N(v, 'a'),
    slips: (v) => [N(v, 'a'), 90 - N(v, 'a'), 360 - N(v, 'a'), 180 - N(v, 'a') + 10, 180 - N(v, 'a') - 10, 90 + N(v, 'a')],
    why: (v, a) => `180° − ${v.a}° = ${a}.`,
  }),
  t({
    sub: 'u16-05',
    d: 2,
    prompt: 'ორი ვერტიკალური კუთხის ზომებია {k}x° და {a}°. იპოვე x.',
    vars: { k: I(2, 6), s: I(5, 30), a: D((v) => N(v, 'k') * N(v, 's')) },
    answer: (v) => sg(N(v, 's')),
    wrong: (v) => [N(v, 'a'), N(v, 'a') - N(v, 'k'), N(v, 'a') * N(v, 'k'), (180 - N(v, 'a')) / N(v, 'k'), N(v, 's') + 1, N(v, 's') - 1, N(v, 'k')],
    why: (v, a) => `${v.k}x = ${v.a}, ამიტომ x = ${v.a} ÷ ${v.k} = ${a}.`,
  }),
  t({
    sub: 'u16-05',
    d: 2,
    prompt: 'ორი მოსაზღვრე კუთხის ზომებია {cp}x° და {cq}x°. იპოვე ორივე კუთხის ზომა.',
    vars: { p: I(1, 8), q: I(1, 8), cp: D((v) => coef(N(v, 'p'))), cq: D((v) => coef(N(v, 'q'))) },
    constraints: [{ test: (v) => 180 % (N(v, 'p') + N(v, 'q')) === 0 && N(v, 'p') !== N(v, 'q'), note: 'whole angles' }],
    answer: (v) => `${deg(angleP(v))} და ${deg(angleQ(v))}`,
    options: (v, right) => {
      const a = angleP(v);
      const b = angleQ(v);
      const x = 180 / (N(v, 'p') + N(v, 'q'));
      return [right, `${deg(a)} და ${deg(a)}`, `${deg(b)} და ${deg(b)}`, `${deg(x)} და ${deg(180 - x)}`, `${deg(a + 10)} და ${deg(b - 10)}`, `${deg(90)} და ${deg(90)}`];
    },
    why: (v, a) => `${v.cp}x + ${v.cq}x = 180, x = ${180 / (N(v, 'p') + N(v, 'q'))}; კუთხეებია ${a}.`,
  }),
  t({
    sub: 'u16-05',
    d: 2,
    prompt: 'ორი წრფის გადაკვეთისას ერთ-ერთი კუთხეა {a}°. იპოვე დანარჩენი სამი კუთხის ზომები.',
    vars: { a: I(30, 150) },
    constraints: [{ test: (v) => N(v, 'a') !== 90, note: 'not a right angle' }],
    answer: (v) => `${deg(N(v, 'a'))}, ${deg(180 - N(v, 'a'))}, ${deg(180 - N(v, 'a'))}`,
    options: (v, right) => {
      const a = N(v, 'a');
      return [right, `${deg(180 - a)}, ${deg(a)}, ${deg(a)}`, `${deg(a)}, ${deg(a)}, ${deg(a)}`, `${deg(180 - a)}, ${deg(180 - a)}, ${deg(180 - a)}`, `${deg(a)}, ${deg(180 - a)}, ${deg(a)}`];
    },
    why: (v, a) => `ვერტიკალური კუთხე ტოლია ${v.a}°-ის, ორი მოსაზღვრე კი 180° − ${v.a}° = ${180 - N(v, 'a')}°: ${a}.`,
  }),
  t({
    sub: 'u16-05',
    d: 3,
    prompt: 'ორი ვერტიკალური კუთხის ზომებია ({p}x+{c1})° და ({q}x−{c2})°. იპოვე x და თითოეული კუთხის ზომა.',
    vars: { p: I(2, 4), j: I(1, 3), q: D((v) => N(v, 'p') + N(v, 'j')), s: I(8, 30), c1: I(5, 20), c2: D((v) => N(v, 'j') * N(v, 's') - N(v, 'c1')) },
    constraints: [{ test: (v) => N(v, 'c2') > 0, note: 'a real subtraction' }],
    answer: (v) => `x = ${N(v, 's')}; ${deg(N(v, 'p') * N(v, 's') + N(v, 'c1'))}`,
    options: (v, right) => {
      const [p, q, s, c1, c2] = [N(v, 'p'), N(v, 'q'), N(v, 's'), N(v, 'c1'), N(v, 'c2')];
      return [right, `x = ${s + 1}; ${deg(p * (s + 1) + c1)}`, `x = ${s - 1}; ${deg(p * (s - 1) + c1)}`, `x = ${s}; ${deg(q * s)}`, `x = ${s}; ${deg(p * s)}`, `x = ${c1 + c2}; ${deg(p * (c1 + c2) + c1)}`];
    },
    why: (v, a) => `${v.p}x + ${v.c1} = ${v.q}x − ${v.c2}, ამიტომ ${N(v, 'j')}x = ${N(v, 'c1') + N(v, 'c2')}, x = ${v.s}; კუთხე ${v.p} · ${v.s} + ${v.c1} = ${N(v, 'p') * N(v, 's') + N(v, 'c1')}°. ${a}.`,
  }),

  // ═════════ U16.6 — პარალელური გადატანა ═════════
  moveText('u16-06', 1, 'წერტილი {P}({px};{py}) გადატანილია {a} ერთეულით მარჯვნივ და {b} ერთეულით ზემოთ. იპოვე ახალი წერტილის კოორდინატები.', { x: I(-4, 8), y: I(-4, 8), a: I(1, 8), b: I(1, 8) }, () => 1, () => 1, true, true),
  moveText('u16-06', 1, 'წერტილი {P}({px};{py}) გადატანილია {a} ერთეულით მარცხნივ და {b} ერთეულით ქვემოთ. იპოვე ახალი წერტილის კოორდინატები.', { x: I(-8, 8), y: I(-8, 8), a: I(1, 9), b: I(1, 9) }, () => -1, () => -1, true, true),
  moveText('u16-06', 1, 'წერტილი {P}({px};{py}) გადატანილია {a} ერთეულით {h}. იპოვე ახალი წერტილის კოორდინატები.', { x: I(-6, 8), y: I(-6, 8), a: I(1, 9), h: C(['მარჯვნივ', 'მარცხნივ']) }, (v) => (v.h === 'მარჯვნივ' ? 1 : -1), () => 1, true, false),
  moveText('u16-06', 1, 'წერტილი {P}({px};{py}) გადატანილია {b} ერთეულით {h}. იპოვე ახალი წერტილის კოორდინატები.', { x: I(-6, 8), y: I(-6, 8), b: I(1, 9), h: C(['ზემოთ', 'ქვემოთ']) }, () => 1, (v) => (v.h === 'ზემოთ' ? 1 : -1), false, true),
  t({
    sub: 'u16-06',
    d: 2,
    prompt: 'წერტილი {P}({px};{py}) გადატანილია ვექტორით ({va};{vb}). იპოვე ახალი წერტილის კოორდინატები.',
    vars: { P: C(PNAMES), x: I(-6, 8), y: I(-6, 8), a: I(-6, 8), b: I(-6, 8), ...showXY, va: D((v) => sg(N(v, 'a'))), vb: D((v) => sg(N(v, 'b'))) },
    constraints: [{ test: (v) => N(v, 'a') !== 0 && N(v, 'b') !== 0, note: 'both directions used' }],
    answer: (v) => primed(v, N(v, 'x') + N(v, 'a'), N(v, 'y') + N(v, 'b')),
    wrong: (v) => {
      const [x, y, a, b] = [N(v, 'x'), N(v, 'y'), N(v, 'a'), N(v, 'b')];
      return [primed(v, x - a, y + b), primed(v, x + a, y - b), primed(v, x - a, y - b), primed(v, x + b, y + a), primed(v, a, b), primed(v, x + a, y)];
    },
    why: (v, a) => `(${sg(N(v, 'x'))} + ${par(N(v, 'a'))}; ${sg(N(v, 'y'))} + ${par(N(v, 'b'))}) → ${a}.`,
  }),
  t({
    sub: 'u16-06',
    d: 3,
    prompt: 'წერტილი {P}({px};{py}) გადატანის შემდეგ გახდა {P}′({x2};{y2}). რამდენი ერთეულით და რა მიმართულებით გადაიტანეს წერტილი ჰორიზონტალურად და ვერტიკალურად?',
    vars: { P: C(PNAMES), x: I(-6, 6), y: I(-6, 6), ...showXY, a: I(-7, 7), b: I(-7, 7), x2: D((v) => sg(N(v, 'x') + N(v, 'a'))), y2: D((v) => sg(N(v, 'y') + N(v, 'b'))) },
    constraints: [{ test: (v) => N(v, 'a') !== 0 && N(v, 'b') !== 0, note: 'both directions used' }],
    answer: (v) => shiftText(N(v, 'a'), N(v, 'b')),
    options: (v, right) => {
      const [a, b] = [N(v, 'a'), N(v, 'b')];
      return [right, shiftText(-a, b), shiftText(a, -b), shiftText(-a, -b), shiftText(b, a)];
    },
    why: (v, a) => `${v.x2} − ${par(N(v, 'x'))} = ${sg(N(v, 'a'))}, ${v.y2} − ${par(N(v, 'y'))} = ${sg(N(v, 'b'))}: ${a}.`,
  }),

  // ═════════ U16.7 — ორი წრეწირის ურთიერთგანლაგება ═════════
  t({
    sub: 'u16-07',
    prompt: 'ორი წრეწირის ცენტრებს შორის მანძილია {d} სმ, ხოლო მათი რადიუსებია {r1} სმ და {r2} სმ. იკვეთება თუ არა წრეწირები?',
    vars: { d: I(1, 20), r1: I(2, 9), r2: I(2, 9) },
    constraints: [{ test: (v) => relation(N(v, 'r1'), N(v, 'r2'), N(v, 'd')).length > 0 && !TOUCH.includes(relation(N(v, 'r1'), N(v, 'r2'), N(v, 'd'))), note: 'not tangent' }],
    optionCount: 2,
    answer: (v) => (relation(N(v, 'r1'), N(v, 'r2'), N(v, 'd')) === 'cross' ? 'დიახ' : 'არა'),
    options: (_v, right) => [right, right === 'დიახ' ? 'არა' : 'დიახ'],
    why: (v, a) => crossWhy(v, a),
  }),
  t({
    sub: 'u16-07',
    prompt: 'ორი წრეწირის რადიუსებია {r1} სმ და {r2} სმ, ხოლო ცენტრებს შორის მანძილია {d} სმ. როგორ არიან განლაგებული წრეწირები?',
    vars: { r1: I(2, 9), r2: I(2, 9), kind: C(['far', 'ext', 'cross', 'int', 'inside']), e: I(1, 3), d: D((v) => distanceFor(v)) },
    constraints: [{ test: (v) => distanceFor(v) >= 1, note: 'a real distance' }],
    answer: (v) => RELATION_TEXT[relation(N(v, 'r1'), N(v, 'r2'), N(v, 'd'))]!,
    options: (_v, right) => [right, ...Object.values(RELATION_TEXT).filter((x) => x !== right)],
    why: (v, a) => crossWhy(v, a),
  }),
  t({
    sub: 'u16-07',
    d: 2,
    prompt: 'ორი წრეწირის რადიუსებია {r1} სმ და {r2} სმ, ხოლო ცენტრებს შორის მანძილია {d} სმ. რამდენ წერტილში იკვეთება წრეწირები?',
    vars: { r1: I(2, 9), r2: I(2, 9), kind: C(['far', 'ext', 'cross', 'int', 'inside']), e: I(1, 3), d: D((v) => distanceFor(v)) },
    constraints: [{ test: (v) => distanceFor(v) >= 1, note: 'a real distance' }],
    answer: (v) => String(commonPoints(N(v, 'r1'), N(v, 'r2'), N(v, 'd'))),
    options: (_v, right) => [right, '0', '1', '2', '3'],
    why: (v, a) => crossWhy(v, a),
  }),
  t({
    sub: 'u16-07',
    d: 2,
    prompt: 'ორი წრეწირის რადიუსებია {r1} სმ და {r2} სმ, ხოლო ცენტრებს შორის მანძილია {d} სმ. რამდენ წერტილში იკვეთება წრეწირები?',
    vars: { r1: I(2, 9), r2: I(2, 9), d: I(1, 18) },
    answer: (v) => String(commonPoints(N(v, 'r1'), N(v, 'r2'), N(v, 'd'))),
    options: (_v, right) => [right, '0', '1', '2', '3'],
    why: (v, a) => crossWhy(v, a),
  }),
  t({
    sub: 'u16-07',
    d: 2,
    prompt: 'ორი წრეწირის რადიუსებია {r1} სმ და {r2} სმ. ცენტრებს შორის მანძილია {d} სმ. იკვეთება თუ არა წრეწირები?',
    vars: { r1: I(4, 12), r2: I(2, 9), d: I(1, 24) },
    constraints: [{ test: (v) => !TOUCH.includes(relation(N(v, 'r1'), N(v, 'r2'), N(v, 'd'))), note: 'not tangent' }],
    optionCount: 2,
    answer: (v) => (relation(N(v, 'r1'), N(v, 'r2'), N(v, 'd')) === 'cross' ? 'დიახ' : 'არა'),
    options: (_v, right) => [right, right === 'დიახ' ? 'არა' : 'დიახ'],
    why: (v, a) => crossWhy(v, a),
  }),
  t({
    sub: 'u16-07',
    d: 2,
    prompt: 'ორი წრეწირის რადიუსებია {r1} სმ და {r2} სმ, ხოლო ცენტრებს შორის მანძილია {d} სმ. როგორ არიან განლაგებული წრეწირები?',
    vars: { r1: I(3, 12), r2: I(2, 9), d: I(1, 22) },
    answer: (v) => RELATION_TEXT[relation(N(v, 'r1'), N(v, 'r2'), N(v, 'd'))]!,
    options: (_v, right) => [right, ...Object.values(RELATION_TEXT).filter((x) => x !== right)],
    why: (v, a) => crossWhy(v, a),
  }),

  // ═════════ U16.8 — ცენტრალური და ჩახაზული კუთხეები ═════════
  numeric({
    sub: 'u16-08',
    prompt: 'ცენტრალური კუთხე ეყრდნობა {a}°-იან რკალს. იპოვე ცენტრალური კუთხის ზომა.',
    vars: { a: I(10, 175) },
    fmt: deg,
    num: (v) => N(v, 'a'),
    slips: (v) => [N(v, 'a') / 2, N(v, 'a') * 2, 180 - N(v, 'a'), 360 - N(v, 'a'), N(v, 'a') + 10, N(v, 'a') - 10],
    why: (v, a) => `ცენტრალური კუთხე რკალის ტოლია: ${v.a}° → ${a}.`,
  }),
  numeric({
    sub: 'u16-08',
    prompt: 'ჩახაზული კუთხე ეყრდნობა {a}°-იან რკალს. იპოვე ჩახაზული კუთხის ზომა.',
    vars: { k: I(10, 89), a: D((v) => 2 * N(v, 'k')) },
    fmt: deg,
    num: (v) => N(v, 'k'),
    slips: (v) => [N(v, 'a'), N(v, 'a') * 2, 180 - N(v, 'k'), N(v, 'k') + 10, N(v, 'k') - 10, N(v, 'a') / 4],
    why: (v, a) => `ჩახაზული კუთხე რკალის ნახევარია: ${v.a}° ÷ 2 = ${a}.`,
  }),
  numeric({
    sub: 'u16-08',
    prompt: 'ჩახაზული კუთხე ეყრდნობა {a}°-იან რკალს. რამდენი გრადუსია ეს კუთხე?',
    vars: { m: I(4, 34), a: D((v) => 10 * N(v, 'm')) },
    fmt: deg,
    num: (v) => 5 * N(v, 'm'),
    slips: (v) => [N(v, 'a'), N(v, 'a') * 2, 180 - N(v, 'a') / 2, 5 * N(v, 'm') + 10, 5 * N(v, 'm') - 10, N(v, 'a') / 4],
    why: (v, a) => `${v.a}° ÷ 2 = ${a}.`,
  }),
  numeric({
    sub: 'u16-08',
    d: 2,
    prompt: 'ცენტრალური კუთხე არის {c}°. იპოვე იმავე რკალზე დაყრდნობილი ჩახაზული კუთხის ზომა.',
    vars: { k: I(10, 89), c: D((v) => 2 * N(v, 'k')) },
    fmt: deg,
    num: (v) => N(v, 'k'),
    slips: (v) => [N(v, 'c'), N(v, 'c') * 2, 180 - N(v, 'k'), N(v, 'k') + 10, N(v, 'k') - 10, N(v, 'c') / 4],
    why: (v, a) => `ჩახაზული კუთხე ცენტრალური კუთხის ნახევარია: ${v.c}° ÷ 2 = ${a}.`,
  }),
  numeric({
    sub: 'u16-08',
    d: 2,
    prompt: 'ჩახაზული კუთხის ზომაა {a}°. იპოვე იმავე რკალზე დაყრდნობილი ცენტრალური კუთხის ზომა.',
    vars: { a: I(10, 89) },
    fmt: deg,
    num: (v) => 2 * N(v, 'a'),
    slips: (v) => [N(v, 'a'), N(v, 'a') * 4, 180 - N(v, 'a'), 2 * N(v, 'a') + 10, 2 * N(v, 'a') - 10, 90 + N(v, 'a')],
    why: (v, a) => `ცენტრალური კუთხე ჩახაზულზე ორჯერ დიდია: ${v.a}° × 2 = ${a}.`,
  }),
  t({
    sub: 'u16-08',
    d: 2,
    prompt: 'ჩახაზული კუთხე ეყრდნობა {arc}. რამდენი გრადუსია ეს კუთხე?',
    vars: { spec: SPEC(['ნახევარწრეწირს|90', 'წრეწირის მეოთხედს|45', 'წრეწირის მესამედს|60', 'წრეწირის მეექვსედს|30', 'წრეწირის მეთორმეტედს|15', 'წრეწირის მეათედს|18']), arc: F(0), k: F(1) },
    answer: (v) => deg(N(v, 'k')),
    options: (v, right) => [right, ...[2 * N(v, 'k'), N(v, 'k') / 2, 180, 90, 45, 360 - N(v, 'k')].filter((x) => Number.isInteger(x) && x > 0 && x !== N(v, 'k')).map(deg)],
    why: (v, a) => `${v.arc} შეესაბამება ${2 * N(v, 'k')}°-იან რკალს, ჩახაზული კუთხე მისი ნახევარია: ${a}.`,
  }),

  // ═════════ U16.9 — რადიუსი, დიამეტრი და ქორდა ═════════
  numeric({
    sub: 'u16-09',
    prompt: 'წრეწირის რადიუსია {r} სმ. იპოვე დიამეტრი.',
    vars: { r: I(2, 45) },
    fmt: cm,
    num: (v) => 2 * N(v, 'r'),
    slips: (v) => [N(v, 'r'), N(v, 'r') + 2, N(v, 'r') * N(v, 'r'), 4 * N(v, 'r'), N(v, 'r') / 2, 2 * N(v, 'r') + 1],
    why: (v, a) => `დიამეტრი რადიუსზე ორჯერ დიდია: 2 × ${v.r} = ${a}.`,
  }),
  numeric({
    sub: 'u16-09',
    prompt: 'წრეწირის დიამეტრია {d} სმ. იპოვე რადიუსი.',
    vars: { r: I(2, 45), d: D((v) => 2 * N(v, 'r')) },
    fmt: cm,
    num: (v) => N(v, 'r'),
    slips: (v) => [N(v, 'd'), N(v, 'd') * 2, N(v, 'r') + 2, N(v, 'r') - 2, N(v, 'd') - 2, N(v, 'r') + 1],
    why: (v, a) => `რადიუსი დიამეტრის ნახევარია: ${v.d} ÷ 2 = ${a}.`,
  }),
  numeric({
    sub: 'u16-09',
    d: 2,
    prompt: 'წრეწირის ცენტრიდან ქორდამდე დაშორებაა {dist} სმ, ხოლო რადიუსია {R} სმ. თუ ცენტრიდან ქორდაზე დაშვებული მართობი ქორდას შუაზე ყოფს, იპოვე ქორდის სიგრძე.',
    vars: { i: I(0, TRI_A.length - 1), R: D((v) => TRI_A[N(v, 'i')]![0]), dist: D((v) => TRI_A[N(v, 'i')]![1]) },
    fmt: cm,
    num: (v) => 2 * TRI_A[N(v, 'i')]![2],
    slips: (v) => { const h = TRI_A[N(v, 'i')]![2]; return [h, 2 * N(v, 'R') - 2 * N(v, 'dist'), N(v, 'R') + N(v, 'dist'), 2 * N(v, 'dist'), 2 * h + 2, 2 * h - 2]; },
    why: (v, a) => `ნახევარი ქორდა: √(${v.R}² − ${v.dist}²) = ${TRI_A[N(v, 'i')]![2]} სმ; მთელი ქორდა: 2 × ${TRI_A[N(v, 'i')]![2]} = ${a}.`,
  }),
  numeric({
    sub: 'u16-09',
    d: 2,
    prompt: 'წრეწირის რადიუსია {R} სმ, ხოლო ცენტრიდან ქორდამდე მანძილია {dist} სმ. იპოვე ქორდის სიგრძე.',
    vars: { i: I(0, TRI_B.length - 1), R: D((v) => TRI_B[N(v, 'i')]![0]), dist: D((v) => TRI_B[N(v, 'i')]![1]) },
    fmt: cm,
    num: (v) => 2 * TRI_B[N(v, 'i')]![2],
    slips: (v) => { const h = TRI_B[N(v, 'i')]![2]; return [h, 2 * N(v, 'R') - 2 * N(v, 'dist'), N(v, 'R') + N(v, 'dist'), 2 * N(v, 'dist'), 2 * h + 2, 2 * h - 2]; },
    why: (v, a) => `ნახევარი ქორდა: √(${v.R}² − ${v.dist}²) = ${TRI_B[N(v, 'i')]![2]} სმ; მთელი ქორდა: 2 × ${TRI_B[N(v, 'i')]![2]} = ${a}.`,
  }),
  numeric({
    sub: 'u16-09',
    prompt: 'წრეწირის დიამეტრია {d} სმ. ქორდა გადის წრეწირის ცენტრზე. იპოვე ქორდის სიგრძე.',
    vars: { d: I(4, 60) },
    fmt: cm,
    num: (v) => N(v, 'd'),
    slips: (v) => [N(v, 'd') / 2, N(v, 'd') * 2, N(v, 'd') + 2, N(v, 'd') - 2, N(v, 'd') / 4],
    why: (v, a) => `ცენტრზე გამავალი ქორდა დიამეტრია: ${v.d} სმ. ${a}.`,
  }),
  numeric({
    sub: 'u16-09',
    d: 3,
    prompt: 'წრეწირის რადიუსია {R} სმ. ქორდის სიგრძეა {c} სმ. იპოვე ცენტრიდან ქორდამდე მანძილი.',
    vars: { i: I(0, TRI_A.length + TRI_B.length - 1), R: D((v) => TRI_ALL[N(v, 'i')]![0]), c: D((v) => 2 * TRI_ALL[N(v, 'i')]![2]) },
    fmt: cm,
    num: (v) => TRI_ALL[N(v, 'i')]![1],
    slips: (v) => { const h = TRI_ALL[N(v, 'i')]![2]; const dd = TRI_ALL[N(v, 'i')]![1]; return [h, N(v, 'R') - h, N(v, 'R') - dd, dd + 1, dd - 1, N(v, 'R') + h]; },
    why: (v, a) => `ნახევარი ქორდა ${TRI_ALL[N(v, 'i')]![2]} სმ; მანძილი: √(${v.R}² − ${TRI_ALL[N(v, 'i')]![2]}²) = ${a}.`,
  }),

  // ═════════ U16.10 — სექტორი და სეგმენტი ═════════
  fractionOfCircle('u16-10', 1, 'წრის ცენტრალური კუთხეა {a}°. წრის რა წილია შესაბამისი სექტორი?', [90, 120, 60, 180, 45, 30, 72, 40, 36, 24]),
  fractionOfCircle('u16-10', 2, 'წრის ცენტრალური კუთხეა {a}°. რა წილს შეადგენს შესაბამისი სექტორის ფართობი მთელი წრის ფართობისგან?', [120, 60, 45, 30, 150, 240, 270, 300, 100, 80]),
  sector('u16-10', 2, 'წრის რადიუსია {r} სმ, ხოლო ცენტრალური კუთხეა {a}°. იპოვე სექტორის ფართობი.', [90, 270, 45]),
  sector('u16-10', 2, 'წრის რადიუსია {r} სმ, ხოლო ცენტრალური კუთხეა {a}°. იპოვე სექტორის ფართობი.', [180, 120, 240]),
  t({
    sub: 'u16-10',
    prompt: 'რომელი ფიგურაა შემოსაზღვრული {border}?',
    vars: { spec: SPEC(['ორი რადიუსითა და რკალით|წრიული სექტორი', 'ქორდითა და რკალით|წრიული სეგმენტი', 'ორი რადიუსითა და მათ შორის მოქცეული რკალით|წრიული სექტორი', 'ქორდითა და მის მიერ ჩამოჭრილი რკალით|წრიული სეგმენტი']), border: F(0), name: F(1) },
    optionCount: 3,
    answer: (v) => String(v.name),
    options: (_v, right) => [right, 'წრიული სექტორი', 'წრიული სეგმენტი', 'წრეწირი'],
    why: (v, a) => `${a} შემოსაზღვრულია ${v.border}: სექტორი — ორი რადიუსითა და რკალით, სეგმენტი — ქორდითა და რკალით.`,
  }),
  sector('u16-10', 2, 'წრის რადიუსია {r} სმ, ხოლო ცენტრალური კუთხეა {a}°. იპოვე სექტორის ფართობი.', [60, 30, 150]),

  // ═════════ U16.11 — წრეწირის სიგრძე და წრის ფართობი ═════════
  numeric({
    sub: 'u16-11',
    prompt: 'წრის რადიუსია {r} სმ. იპოვე წრეწირის სიგრძე (π = 22/7).',
    vars: { k: I(1, 8), r: D((v) => 7 * N(v, 'k')) },
    fmt: cm,
    num: (v) => 44 * N(v, 'k'),
    slips: (v) => [22 * N(v, 'k'), 88 * N(v, 'k'), 154 * N(v, 'k') * N(v, 'k'), 44 * N(v, 'k') + 2, 44 * N(v, 'k') - 4, 14 * N(v, 'k')],
    why: (v, a) => `C = 2πr = 2 · 22/7 · ${v.r} = ${a}.`,
  }),
  numeric({
    sub: 'u16-11',
    prompt: 'წრის დიამეტრია {d} სმ. იპოვე წრეწირის სიგრძე (π = 3,14).',
    decimals: true,
    vars: { d: I(2, 40) },
    fmt: cmDec,
    num: (v) => 3.14 * N(v, 'd'),
    slips: (v) => [1.57 * N(v, 'd'), 6.28 * N(v, 'd'), (3.14 * N(v, 'd') * N(v, 'd')) / 4, 3 * N(v, 'd'), 3.14 * N(v, 'd') + 1, 3.14 * N(v, 'd') * 2 + 0.28],
    why: (v, a) => `C = πd = 3,14 × ${v.d} = ${a}.`,
  }),
  numeric({
    sub: 'u16-11',
    prompt: 'წრის რადიუსია {r} სმ. იპოვე წრის ფართობი (π = 3,14).',
    decimals: true,
    vars: { r: I(2, 15) },
    fmt: (x) => `${dec(x, 2)} სმ²`,
    num: (v) => 3.14 * N(v, 'r') * N(v, 'r'),
    slips: (v) => [3.14 * 2 * N(v, 'r'), 3.14 * N(v, 'r'), 6.28 * N(v, 'r') * N(v, 'r'), 3.14 * N(v, 'r') * N(v, 'r') * 2, 3.14 * N(v, 'r') * N(v, 'r') / 2, 3.14 * (N(v, 'r') + 1) * (N(v, 'r') + 1)],
    why: (v, a) => `S = πr² = 3,14 × ${v.r}² = 3,14 × ${N(v, 'r') * N(v, 'r')} = ${a}.`,
  }),
  numeric({
    sub: 'u16-11',
    d: 2,
    prompt: 'წრის დიამეტრია {d} სმ. იპოვე წრის ფართობი (π = 3,14).',
    decimals: true,
    vars: { m: I(2, 12), d: D((v) => 2 * N(v, 'm')) },
    fmt: (x) => `${dec(x, 2)} სმ²`,
    num: (v) => 3.14 * N(v, 'm') * N(v, 'm'),
    slips: (v) => [3.14 * N(v, 'd') * N(v, 'd'), 3.14 * N(v, 'd'), 3.14 * N(v, 'm') * 2, (3.14 * N(v, 'd') * N(v, 'd')) / 2, 3.14 * N(v, 'm'), 6.28 * N(v, 'm') * N(v, 'm')],
    why: (v, a) => `r = ${v.d} ÷ 2 = ${v.m}; S = 3,14 × ${v.m}² = ${a}.`,
  }),
  numeric({
    sub: 'u16-11',
    d: 2,
    prompt: 'წრეწირის სიგრძეა {c} სმ. იპოვე რადიუსი (π = 3,14).',
    vars: { r: I(2, 20), c: D((v) => dec(6.28 * N(v, 'r'), 2)) },
    fmt: cm,
    num: (v) => N(v, 'r'),
    slips: (v) => [2 * N(v, 'r'), N(v, 'r') / 2, N(v, 'r') + 1, N(v, 'r') - 1, N(v, 'r') * N(v, 'r'), N(v, 'r') + 2],
    why: (v, a) => `C = 2πr, ამიტომ r = ${v.c} ÷ (2 × 3,14) = ${v.c} ÷ 6,28 = ${a}.`,
  }),
  numeric({
    sub: 'u16-11',
    d: 3,
    prompt: 'წრის ფართობია {S} სმ². იპოვე რადიუსი (π = 22/7).',
    vars: { k: I(1, 6), S: D((v) => group(154 * N(v, 'k') * N(v, 'k'))) },
    fmt: cm,
    num: (v) => 7 * N(v, 'k'),
    slips: (v) => [49 * N(v, 'k') * N(v, 'k'), 14 * N(v, 'k'), 7 * N(v, 'k') + 7, 7 * N(v, 'k') - 7, 154 * N(v, 'k'), 7 * N(v, 'k') * 2 + 1],
    why: (v, a) => `πr² = ${v.S}, ამიტომ r² = ${v.S} ÷ 22 × 7 = ${49 * N(v, 'k') * N(v, 'k')}, r = ${a}.`,
  }),
];

/** "What is a {a}° angle called?" — acute, right, obtuse, straight. */
function angleKind(sub: string, d: 1 | 2, a: ReturnType<typeof I>): QuestionTemplate {
  return t({
    sub, d,
    prompt: '{ask} {a}°-იან კუთხეს?',
    vars: { a, ask: C(['როგორ ეწოდება', 'რა სახელი აქვს']) },
    answer: (v) => kindOf(N(v, 'a')),
    options: (_v, right) => [right, ...KINDS.filter((x) => x !== right)],
    why: (v, x) => `${v.a}° ${N(v, 'a') < 90 ? '90°-ზე ნაკლებია' : N(v, 'a') === 90 ? 'ზუსტად 90°-ია' : N(v, 'a') < 180 ? '90°-ზე მეტი და 180°-ზე ნაკლებია' : 'ზუსტად 180°-ია'}: ${x} კუთხე.`,
  });
}
const KINDS = ['მახვილი', 'მართი', 'ბლაგვი', 'გაშლილი'];
function kindOf(a: number): string {
  return a < 90 ? KINDS[0]! : a === 90 ? KINDS[1]! : a < 180 ? KINDS[2]! : KINDS[3]!;
}

const coef = (p: number): string => (p === 1 ? '' : String(p));
const angleP = (v: Vars): number => (N(v, 'p') * 180) / (N(v, 'p') + N(v, 'q'));
const angleQ = (v: Vars): number => (N(v, 'q') * 180) / (N(v, 'p') + N(v, 'q'));
const par = (n: number): string => (n < 0 ? `(${sg(n)})` : sg(n));
/** `A′(6;5)`. */
const primed = (v: Vars, x: number, y: number): string => `${String(v.P)}′(${sg(x)};${sg(y)})`;
/** `4 ერთეულით მარჯვნივ და 3 ერთეულით ქვემოთ`. */
const shiftText = (dx: number, dy: number): string =>
  `${Math.abs(dx)} ერთეულით ${dx > 0 ? 'მარჯვნივ' : 'მარცხნივ'} და ${Math.abs(dy)} ერთეულით ${dy > 0 ? 'ზემოთ' : 'ქვემოთ'}`;

/** A point moved by a horizontal and/or vertical amount; `sx`, `sy` give the direction signs. */
function moveText(
  sub: string,
  d: 1 | 2,
  prompt: string,
  vars: Record<string, ReturnType<typeof I> | ReturnType<typeof C>>,
  sx: (v: Vars) => number,
  sy: (v: Vars) => number,
  usesA: boolean,
  usesB: boolean,
): QuestionTemplate {
  const shift = (v: Vars): [number, number] => [usesA ? sx(v) * N(v, 'a') : 0, usesB ? sy(v) * N(v, 'b') : 0];
  return t({
    sub, d, prompt,
    vars: { P: C(PNAMES), ...vars, ...showXY },
    answer: (v) => primed(v, N(v, 'x') + shift(v)[0], N(v, 'y') + shift(v)[1]),
    wrong: (v) => {
      const [dx, dy] = shift(v);
      const [x, y] = [N(v, 'x'), N(v, 'y')];
      return [primed(v, x - dx, y + dy), primed(v, x + dx, y - dy), primed(v, x - dx, y - dy), primed(v, x + dy, y + dx), primed(v, x + dx, y), primed(v, x, y + dy), primed(v, dx, dy)];
    },
    why: (v, a) => `(${sg(N(v, 'x'))} ${shift(v)[0] < 0 ? '−' : '+'} ${Math.abs(shift(v)[0])}; ${sg(N(v, 'y'))} ${shift(v)[1] < 0 ? '−' : '+'} ${Math.abs(shift(v)[1])}) → ${a}.`,
  });
}

// ───────────────────────────── circles ─────────────────────────────

type Relation = 'far' | 'ext' | 'cross' | 'int' | 'inside';
const TOUCH: string[] = ['ext', 'int'];
const relation = (r1: number, r2: number, d: number): Relation => {
  const outer = r1 + r2;
  const inner = Math.abs(r1 - r2);
  if (d > outer) return 'far';
  if (d === outer) return 'ext';
  if (d > inner) return 'cross';
  if (d === inner) return 'int';
  return 'inside';
};
const commonPoints = (r1: number, r2: number, d: number): number => {
  const r = relation(r1, r2, d);
  return r === 'cross' ? 2 : r === 'ext' || r === 'int' ? 1 : 0;
};
const RELATION_TEXT: Record<Relation, string> = {
  far: 'ერთმანეთისგან დაშორებულია (არ იკვეთება)',
  ext: 'გარედან ეხება ერთმანეთს',
  cross: 'იკვეთება ორ წერტილში',
  int: 'შიგნიდან ეხება ერთმანეთს',
  inside: 'ერთი მეორის შიგნითაა (არ იკვეთება)',
};
/** The centre distance that gives the drawn relation (`kind`) for radii `r1`, `r2`. */
function distanceFor(v: Vars): number {
  const [r1, r2, e] = [N(v, 'r1'), N(v, 'r2'), N(v, 'e')];
  const outer = r1 + r2;
  const inner = Math.abs(r1 - r2);
  switch (String(v.kind)) {
    case 'far': return outer + e;
    case 'ext': return outer;
    case 'cross': return inner + Math.min(e, outer - inner - 1);
    case 'int': return inner;
    default: return inner > e ? inner - e : 0;
  }
}
function crossWhy(v: Vars, answer: string): string {
  const [r1, r2, d] = [N(v, 'r1'), N(v, 'r2'), N(v, 'd')];
  return `r₁ + r₂ = ${r1 + r2}, |r₁ − r₂| = ${Math.abs(r1 - r2)}, ცენტრებს შორის მანძილია ${d}: ${answer}.`;
}

/** The fraction of a circle that a central angle cuts off, in lowest terms. */
const share = (a: number): string => {
  const g = gcd(a, 360);
  return `${a / g}/${360 / g}`;
};
function fractionOfCircle(sub: string, d: 1 | 2, prompt: string, pool: number[]): QuestionTemplate {
  return t({
    sub, d, prompt,
    vars: { a: C(pool) },
    answer: (v) => share(N(v, 'a')),
    options: (v, right) => {
      const a = N(v, 'a');
      return [right, ...[2 * a, a / 2, a + 30, a - 30, 360 - a, 180 - a, a + 60].filter((x) => Number.isInteger(x) && x > 0 && x < 360 && x !== a).map(share)];
    },
    why: (v, a) => `${v.a}° ÷ 360° = ${a}.`,
  });
}
const piText = (c: number): string => (c === 1 ? 'π' : `${dec(c, 2)}π`);
function sector(sub: string, d: 1 | 2, prompt: string, pool: number[]): QuestionTemplate {
  return t({
    sub, d, prompt,
    vars: { r: I(2, 12), a: C(pool) },
    constraints: [{ test: (v) => (4 * N(v, 'r') * N(v, 'r') * N(v, 'a')) % 360 === 0, note: 'a short decimal coefficient' }],
    answer: (v) => `${piText((N(v, 'r') * N(v, 'r') * N(v, 'a')) / 360)} სმ²`,
    wrong: (v) => {
      const [r, a] = [N(v, 'r'), N(v, 'a')];
      const c = (r * r * a) / 360;
      return [r * r, c * 2, c / 2, (r * a) / 360, (r * r * a) / 180 + 0.25, c + r]
        .map((x) => Math.round(x * 100) / 100)
        .filter((x) => x > 0 && Math.abs(x - c) > 1e-9 && Math.abs(x * 4 - Math.round(x * 4)) < 1e-9)
        .map((x) => `${piText(x)} სმ²`);
    },
    why: (v, a) => `S = πr² · ${v.a}/360 = π · ${N(v, 'r') * N(v, 'r')} · ${v.a}/360 = ${a}.`,
  });
}
