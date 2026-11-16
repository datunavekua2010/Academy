import type { QuestionTemplate, Vars } from './types';
import { C, D, F, I, N, SPEC, group, q6, sg } from './g6-helpers';

/**
 * Grade VI — Unit 17: სამკუთხედები და ოთხკუთხედები (triangles and quadrilaterals).
 *
 * Converted from the academy's `U17` bank: 9 subtopics × 6 questions.
 *
 * Lengths print as `12 სმ`, areas as `54 სმ²`, angles as `65°`. Triangles are
 * always real ones (each side below the sum of the other two); Pythagorean
 * questions scale a primitive triple; Thales questions come from a ratio
 * `p : q` and two scales, so every length is whole.
 */

export const G6_U17_SUBTOPICS = ['u17-01', 'u17-02', 'u17-03', 'u17-04', 'u17-05', 'u17-06', 'u17-07', 'u17-08', 'u17-09'] as const;

const T = 'g6-triangles-quads';
let seq = 0;
const nextId = (): string => `g6-u17-q${String(++seq).padStart(2, '0')}`;
type Spec = Omit<Parameters<typeof q6>[0], 'id' | 'topic'>;
const t = (spec: Spec): QuestionTemplate => q6({ id: nextId(), topic: T, ...spec });

const deg = (x: number): string => `${group(x)}°`;
const cm = (x: number): string => `${group(x)} სმ`;
const cm2 = (x: number): string => `${group(x)} სმ²`;
const meters = (x: number): string => `${group(x)} მ`;

interface NumSpec {
  sub: string;
  d?: 1 | 2 | 3;
  prompt: string;
  vars: Spec['vars'];
  constraints?: Spec['constraints'];
  fmt: (x: number) => string;
  num: (v: Vars) => number;
  slips: (v: Vars) => number[];
  why: (v: Vars, answer: string) => string;
}
/** A whole-number key and its slips, printed by one formatter; slips that are not whole, positive or distinct are dropped. */
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
      // A few near-misses close the list so a slip that lands on the key never leaves a short option set.
      return [...o.slips(v), right + 1, right - 1, right + 2, right + 10, right * 2].filter((x) => Number.isInteger(x) && x > 0 && x !== right).map(o.fmt);
    },
    why: o.why,
  });

// ───────────────────────────── shapes ─────────────────────────────

/** Sides of a real triangle: `a`, `b` free, `c` strictly between their difference and sum. */
const triangleVars = (lo = 3, hi = 14): Record<string, ReturnType<typeof I>> => ({
  a: I(lo, hi),
  b: I(lo, hi),
  c: I((v: Vars) => Math.abs(N(v, 'a') - N(v, 'b')) + 1, (v: Vars) => N(v, 'a') + N(v, 'b') - 1),
});
const perimeter = (v: Vars): number => N(v, 'a') + N(v, 'b') + N(v, 'c');

/** Primitive Pythagorean triples, scaled by `k`. */
const BASES: Array<[number, number, number]> = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41], [12, 35, 37]];
const triple = (v: Vars): [number, number, number] => {
  const [x, y, z] = BASES[N(v, 'i')]!;
  const k = N(v, 'k');
  return N(v, 'sw') === 1 ? [y * k, x * k, z * k] : [x * k, y * k, z * k];
};
const tripleVars = (indices: number[], maxScale: number): Record<string, ReturnType<typeof I> | ReturnType<typeof C>> => ({
  i: C(indices),
  k: I(1, maxScale),
  sw: C([0, 1]),
  p: D((v) => triple(v)[0]),
  q: D((v) => triple(v)[1]),
  r: D((v) => triple(v)[2]),
});
/** Triples with a small enough scale that every side stays at most 100. */
const smallTriple = (v: Vars): boolean => triple(v)[2] <= 100;

/** Thales: AD : DB = p : q, scaled by `s` along AB and by `u` along AC. */
const thalesVars = (): Record<string, ReturnType<typeof I>> => ({ p: I(1, 5), q: I(1, 5), s: I(1, 4), u: I(1, 5), w: I(1, 5) });
const ad = (v: Vars) => N(v, 'p') * N(v, 's');
const db = (v: Vars) => N(v, 'q') * N(v, 's');
const ab = (v: Vars) => ad(v) + db(v);
const ae = (v: Vars) => N(v, 'p') * N(v, 'u');
const ec = (v: Vars) => N(v, 'q') * N(v, 'u');
const ac = (v: Vars) => ae(v) + ec(v);
const de = (v: Vars) => N(v, 'p') * N(v, 'w');
const bc = (v: Vars) => (N(v, 'p') + N(v, 'q')) * N(v, 'w');

const THALES_HEAD = 'სამკუთხედ ABC-ში D მდებარეობს AB-ზე, ხოლო E — AC-ზე. თუ DE ∥ BC, ';
const SSS = 'სამი გვერდის ტოლობის ნიშანი';
const SAS = 'ორი გვერდისა და მათ შორის მოქცეული კუთხის ტოლობის ნიშანი';
const ASA = 'გვერდისა და მასთან მიმდებარე ორი კუთხის ტოლობის ნიშანი';
const NO_RULE = 'სამი კუთხის ტოლობა (ტოლობის ნიშანი არ არის)';

export const G6_U17_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U17.1 — ოთხკუთხედების კლასიფიკაცია ═════════
  t({
    sub: 'u17-01',
    prompt: '{lead} {desc}. რა ფიგურაა ეს?',
    vars: {
      spec: SPEC([
        'ყველა კუთხე მართია, ხოლო ყველა გვერდი ტოლია|კვადრატი',
        'ყველა კუთხე მართია, მაგრამ მეზობელი გვერდები ერთმანეთის ტოლი არ არის|მართკუთხედი',
        'ყველა გვერდი ტოლია, მაგრამ კუთხეები მართი არ არის|რომბი',
        'მოპირდაპირე გვერდები პარალელური და ტოლია, კუთხეები მართი არ არის, მეზობელი გვერდებიც არატოლია|პარალელოგრამი',
        'მხოლოდ ორი გვერდია პარალელური|ტრაპეცია',
      ]),
      desc: F(0), name: F(1), lead: C(['ოთხკუთხედის', 'ოთხი გვერდის მქონე ფიგურის', 'ოთხკუთხა ფიგურის', 'ბრტყელი ოთხკუთხედის']),
    },
    answer: (v) => String(v.name),
    options: (_v, right) => [right, ...SHAPES.filter((x) => x !== right)],
    why: (v, a) => `${v.desc}: ${a}.`,
  }),
  numeric({
    sub: 'u17-01',
    prompt: 'მართკუთხედის სიგრძეა {a} სმ, სიგანე — {b} სმ. იპოვე მისი პერიმეტრი.',
    vars: { b: I(2, 15), a: I((v: Vars) => N(v, 'b') + 1, 30) },
    fmt: cm,
    num: (v) => 2 * (N(v, 'a') + N(v, 'b')),
    slips: (v) => [N(v, 'a') + N(v, 'b'), N(v, 'a') * N(v, 'b'), 2 * N(v, 'a') + N(v, 'b'), 2 * (N(v, 'a') + N(v, 'b')) + 2, 2 * N(v, 'a') * N(v, 'b'), 4 * N(v, 'a')],
    why: (v, a) => `P = 2 · (${v.a} + ${v.b}) = ${a}.`,
  }),
  numeric({
    sub: 'u17-01',
    prompt: 'კვადრატის გვერდის სიგრძეა {a} სმ. იპოვე მისი პერიმეტრი.',
    vars: { a: I(2, 40) },
    fmt: cm,
    num: (v) => 4 * N(v, 'a'),
    slips: (v) => [N(v, 'a') * N(v, 'a'), 2 * N(v, 'a'), 3 * N(v, 'a'), 4 * N(v, 'a') + 4, 4 * N(v, 'a') - 4, 8 * N(v, 'a')],
    why: (v, a) => `P = 4 · ${v.a} = ${a}.`,
  }),
  numeric({
    sub: 'u17-01',
    prompt: 'პარალელოგრამის ერთი კუთხეა {a}°. იპოვე მისივე მეზობელი კუთხის ზომა.',
    vars: { a: I(40, 140) },
    constraints: [{ test: (v) => N(v, 'a') !== 90, note: 'not a right angle' }],
    fmt: deg,
    num: (v) => 180 - N(v, 'a'),
    slips: (v) => [N(v, 'a'), 90 - N(v, 'a'), 360 - N(v, 'a'), 180 - N(v, 'a') + 10, 180 - N(v, 'a') - 10, 90 + N(v, 'a')],
    why: (v, a) => `პარალელოგრამის მეზობელი კუთხეების ჯამია 180°: 180° − ${v.a}° = ${a}.`,
  }),
  numeric({
    sub: 'u17-01',
    prompt: 'რომბის ერთი კუთხეა {a}°. იპოვე მისივე მეზობელი კუთხის ზომა.',
    vars: { a: I(35, 145) },
    constraints: [{ test: (v) => N(v, 'a') !== 90, note: 'not a right angle' }],
    fmt: deg,
    num: (v) => 180 - N(v, 'a'),
    slips: (v) => [N(v, 'a'), 90 - N(v, 'a'), 360 - N(v, 'a'), 180 - N(v, 'a') + 10, 180 - N(v, 'a') - 10, 90 + N(v, 'a')],
    why: (v, a) => `რომბი პარალელოგრამია, ამიტომ მეზობელი კუთხეების ჯამია 180°: 180° − ${v.a}° = ${a}.`,
  }),
  numeric({
    sub: 'u17-01',
    d: 2,
    prompt: 'ოთხკუთხედის სამი კუთხეა {a}°, {b}° და {c}°. იპოვე მეოთხე კუთხე.',
    vars: { a: I(60, 120), b: I(60, 120), c: I(60, 120) },
    constraints: [{ test: (v) => N(v, 'a') + N(v, 'b') + N(v, 'c') >= 230 && N(v, 'a') + N(v, 'b') + N(v, 'c') <= 330, note: 'a sensible fourth angle' }],
    fmt: deg,
    num: (v) => 360 - N(v, 'a') - N(v, 'b') - N(v, 'c'),
    slips: (v) => [540 - N(v, 'a') - N(v, 'b') - N(v, 'c'), N(v, 'a') + N(v, 'b') + N(v, 'c') - 180, 370 - N(v, 'a') - N(v, 'b') - N(v, 'c'), 350 - N(v, 'a') - N(v, 'b') - N(v, 'c'), 180 - (N(v, 'a') + N(v, 'b') + N(v, 'c')) / 3 + 90],
    why: (v, a) => `ოთხკუთხედის კუთხეების ჯამია 360°: 360° − (${v.a}° + ${v.b}° + ${v.c}°) = ${a}.`,
  }),

  // ═════════ U17.2 — სამკუთხედის ელემენტები ═════════
  t({
    sub: 'u17-02',
    prompt: 'რამდენი გვერდი აქვს {fig}?',
    vars: { spec: SPEC(['სამკუთხედს|3', 'ტოლფერდა სამკუთხედს|3', 'ტოლგვერდა სამკუთხედს|3', 'მართკუთხა სამკუთხედს|3', 'ოთხკუთხედს|4', 'ხუთკუთხედს|5', 'კვადრატს|4', 'მართკუთხედს|4', 'რომბს|4', 'ტრაპეციას|4', 'პარალელოგრამს|4', 'ექვსკუთხედს|6']), fig: F(0), n: F(1) },
    answer: (v) => String(v.n),
    options: (_v, right) => [right, '3', '4', '5', '6', '2'],
    why: (v, a) => `${v.fig} აქვს ${a} გვერდი.`,
  }),
  t({
    sub: 'u17-02',
    prompt: 'რამდენი {what} გავლება შეიძლება {tri}?',
    vars: { what: C(['მედიანის', 'სიმაღლის', 'ბისექტრისის', 'შუახაზის']), tri: C(['სამკუთხედში', 'ტოლფერდა სამკუთხედში', 'მართკუთხა სამკუთხედში', 'ტოლგვერდა სამკუთხედში']) },
    answer: () => '3',
    options: (_v, right) => [right, '1', '2', '4', '6'],
    why: (v, a) => `${v.tri} ${a} ${v.what} გავლება შეიძლება: ყოველი წვეროდან (ან გვერდიდან) — თითო.`,
  }),
  numeric({
    sub: 'u17-02',
    prompt: 'სამკუთხედის ორი გვერდია {a} სმ და {b} სმ, ხოლო პერიმეტრია {p} სმ. იპოვე მესამე გვერდი.',
    vars: { ...triangleVars(), p: D((v) => perimeter(v)) },
    fmt: cm,
    num: (v) => N(v, 'c'),
    slips: (v) => [N(v, 'p') - N(v, 'a'), N(v, 'a') + N(v, 'b'), N(v, 'p') + N(v, 'a') + N(v, 'b'), N(v, 'c') + 1, N(v, 'c') - 1, Math.abs(N(v, 'a') - N(v, 'b'))],
    why: (v, a) => `${v.p} − ${v.a} − ${v.b} = ${a}.`,
  }),
  numeric({
    sub: 'u17-02',
    prompt: 'სამკუთხედის გვერდებია {a} სმ, {b} სმ და {c} სმ. იპოვე პერიმეტრი.',
    vars: triangleVars(),
    fmt: cm,
    num: (v) => perimeter(v),
    slips: (v) => [perimeter(v) + 1, perimeter(v) - 1, perimeter(v) / 2, N(v, 'a') * N(v, 'b') * N(v, 'c'), N(v, 'a') + N(v, 'b'), perimeter(v) + 2],
    why: (v, a) => `P = ${v.a} + ${v.b} + ${v.c} = ${a}.`,
  }),
  numeric({
    sub: 'u17-02',
    d: 2,
    prompt: 'ტოლფერდა სამკუთხედის ფუძეა {b} სმ, ხოლო ტოლი გვერდებიდან თითოეული — {l} სმ. იპოვე პერიმეტრი.',
    vars: { b: I(2, 20), l: I((v: Vars) => Math.floor(N(v, 'b') / 2) + 1, 25) },
    fmt: cm,
    num: (v) => N(v, 'b') + 2 * N(v, 'l'),
    slips: (v) => [N(v, 'b') + N(v, 'l'), 2 * N(v, 'b') + N(v, 'l'), 3 * N(v, 'l'), 2 * (N(v, 'b') + N(v, 'l')), N(v, 'b') + 2 * N(v, 'l') + 2, N(v, 'b') + 2 * N(v, 'l') - 2],
    why: (v, a) => `P = ${v.b} + 2 · ${v.l} = ${a}.`,
  }),
  numeric({
    sub: 'u17-02',
    d: 2,
    prompt: 'სამკუთხედის პერიმეტრია {p} სმ. ორი გვერდია {a} სმ და {b} სმ. იპოვე მესამე გვერდი.',
    vars: { ...triangleVars(4, 16), p: D((v) => perimeter(v)) },
    fmt: cm,
    num: (v) => N(v, 'c'),
    slips: (v) => [N(v, 'p') - N(v, 'a'), N(v, 'a') + N(v, 'b'), N(v, 'p') + N(v, 'a') + N(v, 'b'), N(v, 'c') + 1, N(v, 'c') - 1, Math.abs(N(v, 'a') - N(v, 'b'))],
    why: (v, a) => `${v.p} − ${v.a} − ${v.b} = ${a}.`,
  }),

  // ═════════ U17.3 — გარე კუთხე ═════════
  numeric({
    sub: 'u17-03',
    prompt: 'სამკუთხედის ორი შიგა კუთხეა {a}° და {b}°. იპოვე მესამე შიგა კუთხე.',
    vars: { a: I(20, 90), b: I(20, 90) },
    constraints: [{ test: (v) => N(v, 'a') + N(v, 'b') <= 150, note: 'room for a third angle' }],
    fmt: deg,
    num: (v) => 180 - N(v, 'a') - N(v, 'b'),
    slips: (v) => [N(v, 'a') + N(v, 'b'), 360 - N(v, 'a') - N(v, 'b'), 90 - N(v, 'a') - N(v, 'b') + 90 + 10, 180 - N(v, 'a') - N(v, 'b') + 10, 180 - N(v, 'a') - N(v, 'b') - 10, 180 - N(v, 'a')],
    why: (v, a) => `180° − ${v.a}° − ${v.b}° = ${a}.`,
  }),
  numeric({
    sub: 'u17-03',
    prompt: 'სამკუთხედის გარე კუთხეა {e}°, ხოლო მასთან არამოსაზღვრე შიგა კუთხეებიდან ერთ-ერთია {a}°. იპოვე მეორე არამოსაზღვრე შიგა კუთხე.',
    vars: { e: I(90, 160), a: I(20, (v: Vars) => N(v, 'e') - 20) },
    fmt: deg,
    num: (v) => N(v, 'e') - N(v, 'a'),
    slips: (v) => [N(v, 'e') + N(v, 'a'), 180 - N(v, 'e') - N(v, 'a'), 180 - N(v, 'e'), N(v, 'e') - N(v, 'a') + 10, N(v, 'e') - N(v, 'a') - 10, 180 - N(v, 'a')],
    why: (v, a) => `გარე კუთხე ტოლია ორი არამოსაზღვრე შიგა კუთხის ჯამისა: ${v.e}° − ${v.a}° = ${a}.`,
  }),
  numeric({
    sub: 'u17-03',
    prompt: 'სამკუთხედის ორი არამოსაზღვრე შიგა კუთხეა {a}° და {b}°. იპოვე მათთან დაკავშირებული გარე კუთხე.',
    vars: { a: I(20, 90), b: I(20, 90) },
    constraints: [{ test: (v) => N(v, 'a') + N(v, 'b') < 180, note: 'a real exterior angle' }],
    fmt: deg,
    num: (v) => N(v, 'a') + N(v, 'b'),
    slips: (v) => [180 - N(v, 'a') - N(v, 'b'), Math.abs(N(v, 'a') - N(v, 'b')), 360 - N(v, 'a') - N(v, 'b'), N(v, 'a') + N(v, 'b') + 10, N(v, 'a') + N(v, 'b') - 10, 180 - N(v, 'a')],
    why: (v, a) => `${v.a}° + ${v.b}° = ${a}.`,
  }),
  numeric({
    sub: 'u17-03',
    d: 2,
    prompt: 'სამკუთხედის გარე კუთხეა {e}°. მასთან არამოსაზღვრე შიგა კუთხეებიდან ერთ-ერთია {a}°. იპოვე მეორე არამოსაზღვრე შიგა კუთხე.',
    vars: { e: I(100, 170), a: I(25, (v: Vars) => N(v, 'e') - 25) },
    fmt: deg,
    num: (v) => N(v, 'e') - N(v, 'a'),
    slips: (v) => [N(v, 'e') + N(v, 'a'), 180 - N(v, 'e') - N(v, 'a'), 180 - N(v, 'e'), N(v, 'e') - N(v, 'a') + 10, N(v, 'e') - N(v, 'a') - 10, 180 - N(v, 'a')],
    why: (v, a) => `${v.e}° − ${v.a}° = ${a}.`,
  }),
  t({
    sub: 'u17-03',
    d: 2,
    prompt: 'სამკუთხედის ორი შიგა კუთხეა x° და {m}x°, ხოლო მესამე შიგა კუთხის გარე კუთხეა {e}°. იპოვე x.',
    vars: { m: I(2, 3), s: I(10, 40), e: D((v) => (N(v, 'm') + 1) * N(v, 's')) },
    answer: (v) => sg(N(v, 's')),
    wrong: (v) => [N(v, 'e'), N(v, 'e') / N(v, 'm'), (180 - N(v, 'e')) / (N(v, 'm') + 1), N(v, 's') + 5, N(v, 's') - 5, N(v, 'e') / (N(v, 'm') + 2)],
    why: (v, a) => `გარე კუთხე ტოლია x + ${v.m}x = ${N(v, 'm') + 1}x, ამიტომ ${N(v, 'm') + 1}x = ${v.e} და x = ${a}.`,
  }),
  t({
    sub: 'u17-03',
    d: 3,
    prompt: 'სამკუთხედის გარე კუთხეა {p}x°, ხოლო მასთან არამოსაზღვრე შიგა კუთხეებია x° და {a}°. იპოვე x.',
    vars: { p: I(3, 5), s: I(10, 30), a: D((v) => (N(v, 'p') - 1) * N(v, 's')) },
    answer: (v) => sg(N(v, 's')),
    wrong: (v) => [N(v, 'a'), N(v, 'a') / N(v, 'p'), N(v, 'a') / (N(v, 'p') + 1), N(v, 's') + 5, N(v, 's') - 5, N(v, 'a') / (N(v, 'p') - 2 || 1)],
    why: (v, a) => `${v.p}x = x + ${v.a}, ამიტომ ${N(v, 'p') - 1}x = ${v.a} და x = ${a}.`,
  }),

  // ═════════ U17.4 — შიგა კუთხეების ჯამი ═════════
  t({
    sub: 'u17-04',
    prompt: 'რამდენია {fig} შიგა კუთხეების ჯამი?',
    vars: { spec: SPEC(['სამკუთხედის|180', 'ტოლფერდა სამკუთხედის|180', 'მართკუთხა სამკუთხედის|180', 'ოთხკუთხედის|360', 'მართკუთხედის|360', 'კვადრატის|360', 'ხუთკუთხედის|540', 'ექვსკუთხედის|720']), fig: F(0), n: F(1) },
    answer: (v) => deg(N(v, 'n')),
    options: (_v, right) => [right, ...[180, 360, 540, 270, 720].map(deg)],
    why: (v, a) => `${v.fig} შიგა კუთხეების ჯამია ${a}.`,
  }),
  numeric({
    sub: 'u17-04',
    prompt: 'სამკუთხედის ორი კუთხეა {a}° და {b}°. იპოვე მესამე კუთხე.',
    vars: { a: I(20, 100), b: I(20, 100) },
    constraints: [{ test: (v) => N(v, 'a') + N(v, 'b') <= 155, note: 'room for a third angle' }],
    fmt: deg,
    num: (v) => 180 - N(v, 'a') - N(v, 'b'),
    slips: (v) => [N(v, 'a') + N(v, 'b'), 360 - N(v, 'a') - N(v, 'b'), 190 - N(v, 'a') - N(v, 'b'), 170 - N(v, 'a') - N(v, 'b'), 180 - N(v, 'a'), 90 - N(v, 'a')],
    why: (v, a) => `180° − (${v.a}° + ${v.b}°) = ${a}.`,
  }),
  numeric({
    sub: 'u17-04',
    prompt: 'მართკუთხა სამკუთხედის ერთი მახვილი კუთხეა {a}°. იპოვე მეორე მახვილი კუთხე.',
    vars: { a: I(10, 80) },
    fmt: deg,
    num: (v) => 90 - N(v, 'a'),
    slips: (v) => [180 - N(v, 'a'), 90 + N(v, 'a'), N(v, 'a'), 90 - N(v, 'a') + 10, 90 - N(v, 'a') - 10, 180 - 90 - N(v, 'a') + 5],
    why: (v, a) => `მახვილი კუთხეების ჯამია 90°: 90° − ${v.a}° = ${a}.`,
  }),
  numeric({
    sub: 'u17-04',
    d: 2,
    prompt: 'ტოლფერდა სამკუთხედის წვეროს კუთხეა {a}°. იპოვე თითოეული ფუძის კუთხე.',
    vars: { h: I(10, 70), a: D((v) => 2 * N(v, 'h')) },
    fmt: deg,
    num: (v) => 90 - N(v, 'h'),
    slips: (v) => [180 - N(v, 'a'), N(v, 'h'), N(v, 'a'), 180 - N(v, 'h'), 90 - N(v, 'h') + 10, 90 - N(v, 'h') - 10],
    why: (v, a) => `(180° − ${v.a}°) ÷ 2 = ${a}.`,
  }),
  t({
    sub: 'u17-04',
    d: 2,
    prompt: 'სამკუთხედის კუთხეებია {cp}x°, {cq}x° და {cr}x°. იპოვე სამივე კუთხე.',
    vars: { p: I(1, 4), q: I(1, 5), r: I(1, 6), cp: D((v) => coef(N(v, 'p'))), cq: D((v) => coef(N(v, 'q'))), cr: D((v) => coef(N(v, 'r'))) },
    constraints: [{ test: (v) => N(v, 'p') < N(v, 'q') && N(v, 'q') < N(v, 'r') && 180 % (N(v, 'p') + N(v, 'q') + N(v, 'r')) === 0, note: 'whole angles' }],
    answer: (v) => anglesText(v),
    options: (v, right) => {
      const x = 180 / (N(v, 'p') + N(v, 'q') + N(v, 'r'));
      const [p, q, r] = [N(v, 'p'), N(v, 'q'), N(v, 'r')];
      return [right, `${deg(p * x + 10)}, ${deg(q * x)}, ${deg(r * x - 10)}`, `${deg(x)}, ${deg(2 * x)}, ${deg(3 * x)}`, `${deg(r * x)}, ${deg(q * x)}, ${deg(p * x + 10)}`, `${deg(p * 30)}, ${deg(q * 30)}, ${deg(r * 30)}`, `${deg(p * x + 15)}, ${deg(q * x)}, ${deg(r * x - 15)}`, `${deg(p * x)}, ${deg(q * x + 10)}, ${deg(r * x + 20)}`];
    },
    why: (v, a) => `${v.cp}x + ${v.cq}x + ${v.cr}x = 180, ${N(v, 'p') + N(v, 'q') + N(v, 'r')}x = 180, x = ${180 / (N(v, 'p') + N(v, 'q') + N(v, 'r'))}; კუთხეები: ${a}.`,
  }),
  t({
    sub: 'u17-04',
    d: 3,
    prompt: 'სამკუთხედის ორი კუთხეა {m}x° და (x+{c})°, ხოლო მესამე კუთხეა {g}°. იპოვე x და სამივე კუთხის ზომა.',
    vars: { m: I(2, 3), s: I(10, 40), c: I(10, 40), g: D((v) => 180 - (N(v, 'm') + 1) * N(v, 's') - N(v, 'c')) },
    constraints: [{ test: (v) => N(v, 'g') >= 20 && N(v, 'g') <= 120, note: 'a sensible third angle' }],
    answer: (v) => `x = ${N(v, 's')}; ${deg(N(v, 'm') * N(v, 's'))}, ${deg(N(v, 's') + N(v, 'c'))}, ${deg(N(v, 'g'))}`,
    options: (v, right) => {
      const [m, s, c, g] = [N(v, 'm'), N(v, 's'), N(v, 'c'), N(v, 'g')];
      return [right, `x = ${s + 5}; ${deg(m * (s + 5))}, ${deg(s + 5 + c)}, ${deg(g)}`, `x = ${s - 5}; ${deg(m * (s - 5))}, ${deg(s - 5 + c)}, ${deg(g)}`, `x = ${s}; ${deg(m * s)}, ${deg(s)}, ${deg(g)}`, `x = ${180 - g - c}; ${deg(m * (180 - g - c))}, ${deg(180 - g)}, ${deg(g)}`];
    },
    why: (v, a) => `${v.m}x + x + ${v.c} + ${v.g} = 180, ${N(v, 'm') + 1}x = ${180 - N(v, 'c') - N(v, 'g')}, x = ${v.s}: ${a}.`,
  }),

  // ═════════ U17.5 — პითაგორას თეორემა ═════════
  numeric({
    sub: 'u17-05',
    prompt: 'მართკუთხა სამკუთხედის კათეტებია {p} სმ და {q} სმ. იპოვე ჰიპოტენუზა.',
    vars: tripleVars([0, 1], 6),
    constraints: [{ test: smallTriple, note: 'sides up to 100' }],
    fmt: cm,
    num: (v) => triple(v)[2],
    slips: (v) => { const [p, q, r] = triple(v); return [p + q, r + 1, r - 1, Math.abs(q - p), p * q, r + 2]; },
    why: (v, a) => `c² = ${v.p}² + ${v.q}² = ${N(v, 'p') ** 2 + N(v, 'q') ** 2}, c = ${a}.`,
  }),
  numeric({
    sub: 'u17-05',
    prompt: 'მართკუთხა სამკუთხედის კათეტებია {p} სმ და {q} სმ. იპოვე ჰიპოტენუზა.',
    vars: tripleVars([1, 2, 3, 4], 4),
    constraints: [{ test: smallTriple, note: 'sides up to 100' }],
    fmt: cm,
    num: (v) => triple(v)[2],
    slips: (v) => { const [p, q, r] = triple(v); return [p + q, r + 1, r - 1, Math.abs(q - p), r + 3, r - 3]; },
    why: (v, a) => `c² = ${v.p}² + ${v.q}² = ${N(v, 'p') ** 2 + N(v, 'q') ** 2}, c = ${a}.`,
  }),
  numeric({
    sub: 'u17-05',
    d: 2,
    prompt: 'მართკუთხა სამკუთხედის ჰიპოტენუზაა {r} სმ, ხოლო ერთი კათეტი — {p} სმ. იპოვე მეორე კათეტი.',
    vars: tripleVars([0, 1, 2], 4),
    constraints: [{ test: smallTriple, note: 'sides up to 100' }],
    fmt: cm,
    num: (v) => triple(v)[1],
    slips: (v) => { const [p, q, r] = triple(v); return [r - p, r + p, q + 1, q - 1, Math.round(Math.sqrt(r * r + p * p)), q + 2]; },
    why: (v, a) => `b² = ${v.r}² − ${v.p}² = ${N(v, 'r') ** 2 - N(v, 'p') ** 2}, b = ${a}.`,
  }),
  numeric({
    sub: 'u17-05',
    d: 2,
    prompt: 'მართკუთხა სამკუთხედის ჰიპოტენუზაა {r} სმ, ხოლო ერთი კათეტი — {p} სმ. იპოვე მეორე კათეტი.',
    vars: tripleVars([0, 3, 4, 5], 3),
    constraints: [{ test: smallTriple, note: 'sides up to 100' }],
    fmt: cm,
    num: (v) => triple(v)[1],
    slips: (v) => { const [p, q, r] = triple(v); return [r - p, r + p, q + 1, q - 1, Math.round(Math.sqrt(r * r + p * p)), q + 2]; },
    why: (v, a) => `b² = ${v.r}² − ${v.p}² = ${N(v, 'r') ** 2 - N(v, 'p') ** 2}, b = ${a}.`,
  }),
  numeric({
    sub: 'u17-05',
    d: 2,
    prompt: 'კიბის სიგრძეა {r} მ. მისი ქვედა ბოლო კედლიდან {p} მ-ითაა დაშორებული. რა სიმაღლეს აღწევს კიბის ზედა ბოლო კედელზე?',
    vars: tripleVars([0, 1, 2], 3),
    constraints: [{ test: smallTriple, note: 'sides up to 100' }],
    fmt: meters,
    num: (v) => triple(v)[1],
    slips: (v) => { const [p, q, r] = triple(v); return [r - p, r + p, q + 1, q - 1, p, q + 2]; },
    why: (v, a) => `h² = ${v.r}² − ${v.p}² = ${N(v, 'r') ** 2 - N(v, 'p') ** 2}, h = ${a}.`,
  }),
  numeric({
    sub: 'u17-05',
    d: 2,
    prompt: 'მართკუთხედის გვერდებია {p} სმ და {q} სმ. იპოვე მისი დიაგონალის სიგრძე.',
    vars: tripleVars([0, 1, 2, 3, 4], 3),
    constraints: [{ test: smallTriple, note: 'sides up to 100' }],
    fmt: cm,
    num: (v) => triple(v)[2],
    slips: (v) => { const [p, q, r] = triple(v); return [p + q, r + 1, r - 1, p * q, 2 * (p + q), r + 2]; },
    why: (v, a) => `d² = ${v.p}² + ${v.q}² = ${N(v, 'p') ** 2 + N(v, 'q') ** 2}, d = ${a}.`,
  }),

  // ═════════ U17.6 — სამკუთხედების ტოლობის ნიშნები ═════════
  rule('u17-06', 1, '{cond}. რომელი ტოლობის ნიშნით შეიძლება დავასკვნათ, რომ სამკუთხედები ტოლია?', SSS, [
    'ორი სამკუთხედის შესაბამისი სამივე გვერდი ტოლია', 'ორი სამკუთხედის სამივე გვერდი შესაბამისად ტოლია', 'ორ სამკუთხედში სამივე შესაბამისი გვერდი ერთმანეთის ტოლია', 'ორი სამკუთხედის გვერდები სამივე წყვილში ტოლია', 'ორ სამკუთხედს შესაბამისად ტოლი გვერდები აქვს სამივე წყვილში', 'ორი სამკუთხედის სამივე გვერდი წყვილ-წყვილად ტოლია', 'ABC და DEF სამკუთხედების შესაბამისი სამივე გვერდი ტოლია', 'ორი სამკუთხედის ყველა შესაბამისი გვერდი ტოლია',
  ]),
  rule('u17-06', 1, '{cond}. რომელი ტოლობის ნიშანი გამოიყენება?', SAS, [
    'ორი სამკუთხედის თითოეული ორი გვერდი და ამ გვერდებს შორის მოქცეული კუთხე შესაბამისად ტოლია', 'ორი სამკუთხედის ორი გვერდი და მათ შორის მოქცეული კუთხე შესაბამისად ტოლია',
    'ორ სამკუთხედში ორი გვერდი და მათ შორის მოქცეული კუთხე ერთმანეთის ტოლია', 'ორივე სამკუთხედში ორი გვერდი და მათ შორის მოქცეული კუთხე შესაბამისად ტოლია',
    'ABC და DEF სამკუთხედებში ორი გვერდი და მათ შორის მოქცეული კუთხე შესაბამისად ტოლია', 'ორ სამკუთხედს ორი გვერდი და ამ გვერდებს შორის კუთხე შესაბამისად ტოლი აქვს', 'ორი სამკუთხედის ორ-ორი გვერდი და მათ შორის მოქცეული კუთხე ტოლია', 'ორ სამკუთხედში ორი შესაბამისი გვერდი და მათ შორის მოქცეული კუთხე ტოლია',
  ]),
  rule('u17-06', 1, '{cond}. რომელი ტოლობის ნიშანი გამოიყენება?', ASA, [
    'ორი სამკუთხედის თითოეული ერთი გვერდი და ამ გვერდის მიმდებარე ორი კუთხე შესაბამისად ტოლია', 'ორი სამკუთხედის ერთი გვერდი და მასთან მიმდებარე ორი კუთხე შესაბამისად ტოლია',
    'ორ სამკუთხედში ერთი გვერდი და ამ გვერდის ორივე მიმდებარე კუთხე ერთმანეთის ტოლია', 'ორივე სამკუთხედში ერთი გვერდი და მასთან მიმდებარე ორი კუთხე შესაბამისად ტოლია',
    'ABC და DEF სამკუთხედებში ერთი გვერდი და მასთან მიმდებარე ორი კუთხე შესაბამისად ტოლია', 'ორ სამკუთხედს ერთი გვერდი და ამ გვერდზე მდებარე ორი კუთხე შესაბამისად ტოლი აქვს', 'ორი სამკუთხედის ერთი გვერდი და მასზე მიდგმული ორი კუთხე ტოლია', 'ორ სამკუთხედში ერთი შესაბამისი გვერდი და მასთან მიმდებარე ორივე კუთხე ტოლია',
  ]),
  t({
    sub: 'u17-06',
    d: 2,
    prompt: 'სამკუთხედ ABC-ში AB = {a} სმ, BC = {b} სმ და AC = {c} სმ. სამკუთხედ DEF-ში DE = {a} სმ, EF = {b} სმ და DF = {c2} სმ. ტოლია თუ არა ეს სამკუთხედები?',
    vars: { ...triangleVars(4, 12), same: C([0, 1]), e: I(1, 2), c2: D((v) => (N(v, 'same') === 1 ? N(v, 'c') : N(v, 'c') + N(v, 'e'))) },
    constraints: [{ test: (v) => N(v, 'c2') < N(v, 'a') + N(v, 'b'), note: 'DEF is a real triangle' }],
    optionCount: 2,
    answer: (v) => (N(v, 'same') === 1 ? 'დიახ, ტოლია' : 'არა, არ არის ტოლი'),
    options: (_v, right) => [right, right === 'დიახ, ტოლია' ? 'არა, არ არის ტოლი' : 'დიახ, ტოლია'],
    why: (v, a) => (N(v, 'same') === 1 ? `სამივე გვერდი ტოლია (${v.a}, ${v.b}, ${v.c}): ${a}.` : `AC = ${v.c} სმ, DF = ${v.c2} სმ — მესამე გვერდები განსხვავებულია: ${a}.`),
  }),
  t({
    sub: 'u17-06',
    d: 2,
    prompt: 'სამკუთხედ ABC-ში AB = {a} სმ, AC = {b} სმ და ∠A = {g}°. სამკუთხედ DEF-ში DE = {a} სმ, DF = {b} სმ და ∠D = {g2}°. ტოლია თუ არა ეს სამკუთხედები?',
    vars: { a: I(3, 12), b: I(3, 12), g: I(30, 120), same: C([0, 1]), e: I(5, 20), g2: D((v) => (N(v, 'same') === 1 ? N(v, 'g') : N(v, 'g') + N(v, 'e'))) },
    optionCount: 2,
    answer: (v) => (N(v, 'same') === 1 ? 'დიახ, ტოლია' : 'არა, არ არის ტოლი'),
    options: (_v, right) => [right, right === 'დიახ, ტოლია' ? 'არა, არ არის ტოლი' : 'დიახ, ტოლია'],
    why: (v, a) => (N(v, 'same') === 1 ? `ორი გვერდი და მათ შორის კუთხე ტოლია: ${a}.` : `მათ შორის კუთხეები განსხვავებულია (${v.g}° და ${v.g2}°): ${a}.`),
  }),
  t({
    sub: 'u17-06',
    d: 2,
    prompt: 'ორი სამკუთხედის ორი გვერდი შესაბამისად ტოლია, {cond}. საკმარისია თუ არა ეს მონაცემები სამკუთხედების ტოლობის დასამტკიცებლად?',
    vars: {
      spec: SPEC([
        'მაგრამ მათ შორის მოქცეული კუთხეები განსხვავებულია|0', 'და მათ შორის მოქცეული კუთხეებიც ტოლია|1', 'და მესამე გვერდებიც ტოლია|1',
        'მაგრამ მესამე გვერდები განსხვავებულია|0', 'მაგრამ მათ შორის მოქცეული კუთხეებიდან ერთი მეორეზე დიდია|0', 'და მათ შორის მოქცეული კუთხეებიც შესაბამისად ტოლია|1', 'და მესამე გვერდებიც შესაბამისად ტოლია|1', 'მაგრამ მათ შორის მოქცეული კუთხეები ერთმანეთს არ უდრის|0',
      ]),
      cond: F(0), ok: F(1),
    },
    optionCount: 2,
    answer: (v) => (N(v, 'ok') === 1 ? 'საკმარისია' : 'საკმარისი არ არის'),
    options: (_v, right) => [right, right === 'საკმარისია' ? 'საკმარისი არ არის' : 'საკმარისია'],
    why: (v, a) => `${v.cond}: ${a}.`,
  }),

  // ═════════ U17.7 — ამოცანები სამკუთხედებსა და ოთხკუთხედებზე ═════════
  numeric({
    sub: 'u17-07',
    prompt: 'სამკუთხედის გვერდებია {a} სმ, {b} სმ და {c} სმ. იპოვე პერიმეტრი.',
    vars: triangleVars(4, 18),
    fmt: cm,
    num: (v) => perimeter(v),
    slips: (v) => [perimeter(v) + 1, perimeter(v) - 1, perimeter(v) / 2, N(v, 'a') + N(v, 'b'), perimeter(v) + 2, perimeter(v) - 2],
    why: (v, a) => `P = ${v.a} + ${v.b} + ${v.c} = ${a}.`,
  }),
  numeric({
    sub: 'u17-07',
    prompt: 'კვადრატის პერიმეტრია {p} სმ. იპოვე მისი გვერდის სიგრძე.',
    vars: { a: I(2, 40), p: D((v) => 4 * N(v, 'a')) },
    fmt: cm,
    num: (v) => N(v, 'a'),
    slips: (v) => [N(v, 'p') / 2, N(v, 'p') - 4, N(v, 'a') + 1, N(v, 'a') - 1, N(v, 'p') / 3, N(v, 'a') * 2],
    why: (v, a) => `${v.p} ÷ 4 = ${a}.`,
  }),
  numeric({
    sub: 'u17-07',
    prompt: 'მართკუთხედის პერიმეტრია {p} სმ, ხოლო სიგრძე — {l} სმ. იპოვე სიგანე.',
    vars: { l: I(5, 25), w: I(2, (v: Vars) => N(v, 'l') - 1), p: D((v) => 2 * (N(v, 'l') + N(v, 'w'))) },
    fmt: cm,
    num: (v) => N(v, 'w'),
    slips: (v) => [N(v, 'p') / 2, N(v, 'p') - N(v, 'l'), N(v, 'p') - 2 * N(v, 'l') + 2, N(v, 'w') + 1, N(v, 'w') - 1, N(v, 'p') / 2 - N(v, 'l') + 2],
    why: (v, a) => `${v.p} ÷ 2 − ${v.l} = ${N(v, 'p') / 2} − ${v.l} = ${a}.`,
  }),
  numeric({
    sub: 'u17-07',
    prompt: 'პარალელოგრამის ერთი გვერდია {a} სმ, მეორე — {b} სმ. იპოვე პერიმეტრი.',
    vars: { a: I(3, 20), b: I(3, 20) },
    fmt: cm,
    num: (v) => 2 * (N(v, 'a') + N(v, 'b')),
    slips: (v) => [N(v, 'a') + N(v, 'b'), N(v, 'a') * N(v, 'b'), 2 * N(v, 'a') + N(v, 'b'), 2 * (N(v, 'a') + N(v, 'b')) + 2, 2 * N(v, 'a') * N(v, 'b'), 4 * N(v, 'a')],
    why: (v, a) => `P = 2 · (${v.a} + ${v.b}) = ${a}.`,
  }),
  numeric({
    sub: 'u17-07',
    d: 2,
    prompt: 'ტოლფერდა სამკუთხედის პერიმეტრია {p} სმ, ხოლო ფუძე — {b} სმ. იპოვე თითოეული ტოლი გვერდის სიგრძე.',
    vars: { b: I(2, 24), l: I((v: Vars) => Math.floor(N(v, 'b') / 2) + 1, 25), p: D((v) => N(v, 'b') + 2 * N(v, 'l')) },
    fmt: cm,
    num: (v) => N(v, 'l'),
    slips: (v) => [N(v, 'p') - N(v, 'b'), N(v, 'p') / 3, (N(v, 'p') - N(v, 'b')) / 2 + 1, N(v, 'l') + 1, N(v, 'l') - 1, N(v, 'p') / 2],
    why: (v, a) => `(${v.p} − ${v.b}) ÷ 2 = ${a}.`,
  }),
  numeric({
    sub: 'u17-07',
    prompt: 'ოთხკუთხედის გვერდებია {a} სმ, {b} სმ, {c} სმ და {e} სმ. იპოვე პერიმეტრი.',
    vars: { a: I(3, 18), b: I(3, 18), c: I(3, 18), e: I(3, 18) },
    fmt: cm,
    num: (v) => N(v, 'a') + N(v, 'b') + N(v, 'c') + N(v, 'e'),
    slips: (v) => { const sum = N(v, 'a') + N(v, 'b') + N(v, 'c') + N(v, 'e'); return [sum + 1, sum - 1, sum / 2, sum + 2, sum - 2, N(v, 'a') + N(v, 'b') + N(v, 'c')]; },
    why: (v, a) => `P = ${v.a} + ${v.b} + ${v.c} + ${v.e} = ${a}.`,
  }),

  // ═════════ U17.8 — თალესის თეორემა ═════════
  // ═════════ U17.8 — თალესის თეორემა ═════════
  thales('u17-08', 1, 'AD = {adT} სმ, DB = {dbT} სმ და AE = {aeT} სმ, იპოვე EC.', ec, (v) => [(ae(v) * ad(v)) / db(v), ae(v) + db(v), ae(v), db(v) + ae(v) - ad(v), ec(v) + 1, ec(v) - 1],
    (v, a) => `AD : DB = AE : EC, ამიტომ EC = ${ae(v)} · ${db(v)} ÷ ${ad(v)} = ${a}.`),
  thales('u17-08', 1, 'AD = {adT} სმ, AB = {abT} სმ და AC = {acT} სმ, იპოვე AE.', ae, (v) => [(ac(v) * ab(v)) / ad(v), ac(v) - ad(v), ac(v) + ad(v), ae(v) + 1, ae(v) - 1, ec(v)],
    (v, a) => `AD : AB = AE : AC, ამიტომ AE = ${ad(v)} · ${ac(v)} ÷ ${ab(v)} = ${a}.`),
  numeric({
    sub: 'u17-08',
    prompt: THALES_HEAD + 'AD = {a} სმ, DB = {a} სმ და AE = {c} სმ, იპოვე EC.',
    vars: { a: I(2, 14), c: I(3, 18) },
    fmt: cm,
    num: (v) => N(v, 'c'),
    slips: (v) => [N(v, 'a'), N(v, 'a') + N(v, 'c'), 2 * N(v, 'c'), N(v, 'c') + 1, N(v, 'c') - 1, N(v, 'c') / 2],
    why: (_v, a) => `D — AB-ს შუაწერტილია, ამიტომ E — AC-ს შუაწერტილია: EC = AE = ${a}.`,
  }),
  thales('u17-08', 2, 'AD = {adT} სმ, AB = {abT} სმ და BC = {bcT} სმ, იპოვე DE.', de, (v) => [(bc(v) * ab(v)) / ad(v), bc(v) - ad(v), bc(v) + ad(v), de(v) + 1, de(v) - 1, bc(v) - de(v)],
    (v, a) => `DE : BC = AD : AB, ამიტომ DE = ${bc(v)} · ${ad(v)} ÷ ${ab(v)} = ${a}.`),
  thales('u17-08', 2, 'AD = {adT} სმ, DB = {dbT} სმ და EC = {ecT} სმ, იპოვე AE.', ae, (v) => [(ec(v) * db(v)) / ad(v), ec(v) + ad(v), ec(v) - ad(v), ae(v) + 1, ae(v) - 1, ad(v) + ec(v) - db(v)],
    (v, a) => `AD : DB = AE : EC, ამიტომ AE = ${ec(v)} · ${ad(v)} ÷ ${db(v)} = ${a}.`),
  thales('u17-08', 2, 'AD = {adT} სმ, AB = {abT} სმ და DE = {deT} სმ, იპოვე BC.', bc, (v) => [(de(v) * ad(v)) / ab(v), de(v) + ab(v), de(v) + ad(v), bc(v) + 1, bc(v) - 1, ab(v) - ad(v) + de(v)],
    (v, a) => `DE : BC = AD : AB, ამიტომ BC = ${de(v)} · ${ab(v)} ÷ ${ad(v)} = ${a}.`),

  // ═════════ U17.9 — ტრაპეციის ელემენტები ═════════
  numeric({
    sub: 'u17-09',
    prompt: 'ტრაპეციის ფუძეებია {a} სმ და {b} სმ. იპოვე შუახაზის სიგრძე.',
    vars: { a: I(4, 24), k: I(1, 10), b: D((v) => N(v, 'a') + 2 * N(v, 'k')) },
    fmt: cm,
    num: (v) => N(v, 'a') + N(v, 'k'),
    slips: (v) => [N(v, 'a') + N(v, 'b'), N(v, 'b') - N(v, 'a'), N(v, 'k'), N(v, 'a') + N(v, 'k') + 1, N(v, 'a') + N(v, 'k') - 1, N(v, 'b')],
    why: (v, a) => `შუახაზი ფუძეთა ჯამის ნახევარია: (${v.a} + ${v.b}) ÷ 2 = ${a}.`,
  }),
  numeric({
    sub: 'u17-09',
    prompt: 'ტრაპეციის ფუძეებია {a} სმ და {b} სმ, ხოლო სიმაღლე — {h} სმ. იპოვე ფართობი.',
    vars: { a: I(2, 14), k: I(1, 8), b: D((v) => N(v, 'a') + 2 * N(v, 'k')), h: I(2, 12) },
    fmt: cm2,
    num: (v) => ((N(v, 'a') + N(v, 'b')) * N(v, 'h')) / 2,
    slips: (v) => [(N(v, 'a') + N(v, 'b')) * N(v, 'h'), (N(v, 'a') * N(v, 'b') * N(v, 'h')) / 2, (N(v, 'a') + N(v, 'b')) / 2, N(v, 'a') + N(v, 'b') + N(v, 'h'), (N(v, 'a') + N(v, 'b')) * N(v, 'h') / 2 + 2, N(v, 'a') * N(v, 'h')],
    why: (v, a) => `S = (${v.a} + ${v.b}) ÷ 2 · ${v.h} = ${a}.`,
  }),
  numeric({
    sub: 'u17-09',
    d: 2,
    prompt: 'ტოლფერდა ტრაპეციის ერთი ფუძეა {a} სმ, მეორე — {b} სმ, ხოლო თითოეული ფერდი — {c} სმ. იპოვე პერიმეტრი.',
    vars: { b: I(4, 14), a: I((v: Vars) => N(v, 'b') + 2, 30), c: I(3, 14) },
    fmt: cm,
    num: (v) => N(v, 'a') + N(v, 'b') + 2 * N(v, 'c'),
    slips: (v) => [N(v, 'a') + N(v, 'b') + N(v, 'c'), 2 * (N(v, 'a') + N(v, 'b')), N(v, 'a') + N(v, 'b'), N(v, 'a') + N(v, 'b') + 2 * N(v, 'c') + 2, N(v, 'a') + N(v, 'b') + 2 * N(v, 'c') - 2, 4 * N(v, 'c')],
    why: (v, a) => `P = ${v.a} + ${v.b} + 2 · ${v.c} = ${a}.`,
  }),
  numeric({
    sub: 'u17-09',
    d: 2,
    prompt: 'ტრაპეციის შუახაზია {m} სმ, ხოლო ერთი ფუძე — {a} სმ. იპოვე მეორე ფუძე.',
    vars: { a: I(3, 16), k: I(1, 8), m: D((v) => N(v, 'a') + N(v, 'k')) },
    fmt: cm,
    num: (v) => N(v, 'a') + 2 * N(v, 'k'),
    slips: (v) => [N(v, 'm') - N(v, 'a'), N(v, 'm') + N(v, 'a'), N(v, 'm') * 2, N(v, 'a') + 2 * N(v, 'k') + 1, N(v, 'a') + 2 * N(v, 'k') - 1, N(v, 'm')],
    why: (v, a) => `მეორე ფუძე = 2 · ${v.m} − ${v.a} = ${a}.`,
  }),
  numeric({
    sub: 'u17-09',
    d: 2,
    prompt: 'ტრაპეციის ფუძეებია {a} სმ და {b} სმ, ხოლო სიმაღლე — {h} სმ. იპოვე ფართობი.',
    vars: { a: I(5, 20), k: I(1, 6), b: D((v) => N(v, 'a') + 2 * N(v, 'k')), h: I(3, 14) },
    fmt: cm2,
    num: (v) => ((N(v, 'a') + N(v, 'b')) * N(v, 'h')) / 2,
    slips: (v) => [(N(v, 'a') + N(v, 'b')) * N(v, 'h'), (N(v, 'a') * N(v, 'b') * N(v, 'h')) / 2, (N(v, 'a') + N(v, 'b')) / 2, N(v, 'a') + N(v, 'b') + N(v, 'h'), ((N(v, 'a') + N(v, 'b')) * N(v, 'h')) / 2 + 4, N(v, 'b') * N(v, 'h')],
    why: (v, a) => `S = (${v.a} + ${v.b}) ÷ 2 · ${v.h} = ${a}.`,
  }),
  numeric({
    sub: 'u17-09',
    prompt: 'ტრაპეციის ფუძეებია {a} სმ და {b} სმ. იპოვე შუახაზის სიგრძე.',
    vars: { a: I(6, 30), k: I(1, 12), b: D((v) => N(v, 'a') + 2 * N(v, 'k')) },
    fmt: cm,
    num: (v) => N(v, 'a') + N(v, 'k'),
    slips: (v) => [N(v, 'a') + N(v, 'b'), N(v, 'b') - N(v, 'a'), N(v, 'k'), N(v, 'a') + N(v, 'k') + 2, N(v, 'a') + N(v, 'k') - 2, N(v, 'b')],
    why: (v, a) => `(${v.a} + ${v.b}) ÷ 2 = ${a}.`,
  }),
];

/** A Thales question: the prompt tail names the printed lengths (`adT`…), `num` is the key. */
function thales(sub: string, d: 1 | 2, tail: string, num: (v: Vars) => number, slips: (v: Vars) => number[], why: (v: Vars, answer: string) => string): QuestionTemplate {
  return numeric({
    sub, d,
    prompt: THALES_HEAD + tail,
    vars: {
      ...thalesVars(),
      adT: D((v) => ad(v)), dbT: D((v) => db(v)), abT: D((v) => ab(v)), aeT: D((v) => ae(v)), ecT: D((v) => ec(v)), acT: D((v) => ac(v)), deT: D((v) => de(v)), bcT: D((v) => bc(v)),
    },
    fmt: cm,
    num,
    slips,
    why,
  });
}

/** "Which congruence rule?" — four phrasings of one situation. */
function rule(sub: string, d: 1 | 2, prompt: string, key: string, phrasings: string[]): QuestionTemplate {
  return t({
    sub, d, prompt,
    vars: { cond: C(phrasings) },
    answer: () => key,
    options: (_v, right) => [right, ...[SSS, SAS, ASA, NO_RULE].filter((x) => x !== right)],
    why: (v, a) => `${v.cond}: ${a}.`,
  });
}

const coef = (p: number): string => (p === 1 ? '' : String(p));
const anglesText = (v: Vars): string => {
  const x = 180 / (N(v, 'p') + N(v, 'q') + N(v, 'r'));
  return `${deg(N(v, 'p') * x)}, ${deg(N(v, 'q') * x)}, ${deg(N(v, 'r') * x)}`;
};
const SHAPES = ['კვადრატი', 'მართკუთხედი', 'რომბი', 'პარალელოგრამი', 'ტრაპეცია'];

void cm2;
