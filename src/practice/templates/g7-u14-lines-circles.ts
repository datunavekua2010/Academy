import type { QuestionTemplate, Vars } from './types';
import { C, D, I, MINUS, N, gcd, group, q6 } from './g6-helpers';
import { pair, textOptions, unitOptions } from './g7-u08-proportion-percent';

/**
 * Grade VII — Unit 14: lines, angles and circles.
 *
 * Converted from the academy's Grade VII `U14` bank: 13 subtopics × 6 questions.
 *
 * Angles print as `48°`, lengths as `12 სმ`, areas as `9π სმ²`, radian measures
 * as `π/3` or `3π/4`. Every geometric figure is generated backwards from a
 * consistent configuration — the unknown `x` of an angle equation is drawn first
 * and the printed angles follow from it, a chord pair is built from a product
 * that splits evenly — so every task has a whole-number answer and the prompt
 * never has to be rejected and redrawn. Expressions with a minus sign print
 * through `MINUS`, never a hyphen.
 */

export const G7_U14_SUBTOPICS = [
  'u14-01', 'u14-02', 'u14-03', 'u14-04', 'u14-05', 'u14-06', 'u14-07',
  'u14-08', 'u14-09', 'u14-10', 'u14-11', 'u14-12', 'u14-13',
] as const;

const T = 'g7-lines-circles';
let seq = 0;
const nextId = (): string => `g7-u14-q${String(++seq).padStart(2, '0')}`;
type Spec = Omit<Parameters<typeof q6>[0], 'id' | 'topic' | 'grade'>;
const t = (spec: Spec): QuestionTemplate => q6({ id: nextId(), topic: T, grade: 7, ...spec });

const g = (v: Vars, key: string): number => N(v, key);
const YES = 'კი';
const NO = 'არა';
const deg = (x: number): string => `${x}°`;
const cm = (x: number): string => `${group(x)} სმ`;

/** A whole-number answer with a unit and the usual slips. */
interface NumSpec {
  sub: string;
  d?: 1 | 2 | 3;
  prompt: string;
  vars: Spec['vars'];
  constraints?: Spec['constraints'];
  unit: string;
  key: (v: Vars) => number;
  slips: (v: Vars) => number[];
  why: (v: Vars, answer: string) => string;
}
const unitText = (n: number, unit: string): string => (unit === '°' ? deg(n) : unit ? `${group(n)} ${unit}` : group(n));
const num = (o: NumSpec): QuestionTemplate =>
  t({
    sub: o.sub,
    ...(o.d ? { d: o.d } : {}),
    prompt: o.prompt,
    vars: o.vars,
    ...(o.constraints ? { constraints: o.constraints } : {}),
    answer: (v) => unitText(o.key(v), o.unit),
    options: (v) => unitOptions(o.key(v), o.unit, o.slips(v)),
    why: o.why,
  });

/** A yes/no question. */
const yesNo = (sub: string, prompt: string, vars: Spec['vars'], holds: (v: Vars) => boolean, why: (v: Vars, answer: string) => string, constraints?: Spec['constraints']): QuestionTemplate =>
  t({ sub, prompt, vars, ...(constraints ? { constraints } : {}), answer: (v) => (holds(v) ? YES : NO), options: () => [YES, NO], optionCount: 2, why });

/** `x`, `3x`, `3x + 10`, `4x − 10`. */
const lin = (a: number, b: number): string => `${a === 1 ? '' : a}x ${b < 0 ? `${MINUS} ${-b}` : `+ ${b}`}`;
const coef = (a: number): string => `${a === 1 ? '' : a}x`;

// ───────────────────────────── angles ─────────────────────────────

/** `π`, `π/2`, `3π/4`, `2π` for an angle in degrees. */
const radText = (degrees: number): string => {
  const k = gcd(degrees, 180);
  const n = degrees / k;
  const d = 180 / k;
  const top = n === 1 ? 'π' : `${n}π`;
  return d === 1 ? top : `${top}/${d}`;
};
const degSlips = (x: number): number[] => [x * 2, x / 2, 180 - x, 360 - x, x + 30, x - 30, x + 15, x - 15, x + 60, 90 - x];
const DEGS = [15, 18, 20, 30, 36, 40, 45, 60, 72, 75, 90, 100, 105, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
const radOptions = (a: number): string[] => textOptions(radText(a), degSlips(a).filter((x) => Number.isInteger(x) && x > 0 && x <= 720).map(radText).filter((s) => s !== radText(a)));
const NAMED: Array<[string, number]> = [
  ['მართი კუთხე', 90], ['გაშლილი კუთხე', 180], ['სრული კუთხე', 360], ['მართი კუთხის ნახევარი', 45],
  ['ორი მართი კუთხის ჯამი', 180], ['სამი მართი კუთხის ჯამი', 270], ['მართი კუთხის მესამედი', 30], ['ოთხი მართი კუთხის ჯამი', 360],
  ['გაშლილი კუთხის მესამედი', 60], ['გაშლილი კუთხის მეექვსედი', 30],
];

/** `ax + b` drawn from the unknown: x first, the printed angle follows. */
const eqVars = () => ({
  a: I(2, 5),
  b: I(5, 40),
  x: I(5, (v: Vars) => Math.floor((170 - g(v, 'b')) / g(v, 'a'))),
  c: D((v: Vars) => g(v, 'a') * g(v, 'x') + g(v, 'b')),
  e: D((v: Vars) => lin(g(v, 'a'), g(v, 'b'))),
});
const eqSlips = (v: Vars): number[] => [g(v, 'c') - g(v, 'b'), (g(v, 'c') + g(v, 'b')) / g(v, 'a'), g(v, 'c') / g(v, 'a'), g(v, 'x') + g(v, 'b')];
/** Two expressions that must add up to 180°: `(p·x + b) + (q·x + d) = 180`. */
const sumVars = () => ({
  p: I(1, 3),
  q: I(1, 3),
  d: I(5, 30),
  x: I(5, (v: Vars) => Math.floor((179 - g(v, 'd')) / (g(v, 'p') + g(v, 'q')))),
  b: D((v: Vars) => 180 - (g(v, 'p') + g(v, 'q')) * g(v, 'x') - g(v, 'd')),
  e1: D((v: Vars) => lin(g(v, 'p'), g(v, 'b'))),
  e2: D((v: Vars) => lin(g(v, 'q'), g(v, 'd'))),
});
const sumSlips = (v: Vars): number[] => [(180 - g(v, 'b')) / (g(v, 'p') + g(v, 'q')), (180 - g(v, 'd')) / (g(v, 'p') + g(v, 'q')), (90 - g(v, 'b')) / (g(v, 'p') + g(v, 'q')), g(v, 'x') + 5, g(v, 'x') - 5];

// ─────────────────────────── two circles ───────────────────────────

const POSITIONS = ['ერთმანეთის გარეთ მდებარეობენ', 'ერთმანეთს გარედან ეხებიან', 'ორ წერტილში იკვეთებიან', 'ერთმანეთს შიგნიდან ეხებიან', 'ერთი მეორის შიგნით მდებარეობს'];
const COMMON = [0, 1, 2, 1, 0];
/** Position kind from radii and distance. */
const posKind = (r1: number, r2: number, d: number): number => {
  const big = Math.max(r1, r2);
  const small = Math.min(r1, r2);
  if (d > big + small) return 0;
  if (d === big + small) return 1;
  if (d > big - small) return 2;
  if (d === big - small) return 3;
  return 4;
};
/** Two radii and a centre distance that realise one of the given kinds. */
const circleVars = (kinds: number[]) => ({
  a: I(2, 12),
  b: I(2, 12),
  kind: C(kinds),
  e: I(1, 5),
  dist: D((v: Vars) => {
    const big = Math.max(g(v, 'a'), g(v, 'b'));
    const small = Math.min(g(v, 'a'), g(v, 'b'));
    const e = g(v, 'e');
    switch (g(v, 'kind')) {
      case 0: return big + small + e;
      case 1: return big + small;
      case 2: return big - small + 1 + ((e - 1) % (2 * small - 1));
      case 3: return big - small;
      default: return 1 + ((e - 1) % (big - small - 1));
    }
  }),
});
const circleOk = (v: Vars): boolean => g(v, 'a') !== g(v, 'b') && (g(v, 'kind') !== 4 || Math.abs(g(v, 'a') - g(v, 'b')) >= 2);
const kindOf = (v: Vars): number => posKind(g(v, 'a'), g(v, 'b'), g(v, 'dist'));
const circleWhy = (v: Vars): string => `R + r = ${Math.max(g(v, 'a'), g(v, 'b')) + Math.min(g(v, 'a'), g(v, 'b'))} სმ, R ${MINUS} r = ${Math.max(g(v, 'a'), g(v, 'b')) - Math.min(g(v, 'a'), g(v, 'b'))} სმ, ცენტრებს შორის მანძილია ${v.dist} სმ`;

// ─────────────────────── chords, tangents, secants ───────────────────────

/** (radius, distance to the chord, half chord). */
const TRI_A: Array<[number, number, number]> = [[5, 3, 4], [5, 4, 3], [10, 6, 8], [10, 8, 6], [15, 9, 12], [15, 12, 9], [17, 8, 15], [17, 15, 8], [20, 12, 16], [20, 16, 12]];
const TRI_B: Array<[number, number, number]> = [[13, 5, 12], [13, 12, 5], [25, 7, 24], [25, 24, 7], [26, 10, 24], [26, 24, 10], [29, 20, 21], [29, 21, 20], [30, 18, 24], [30, 24, 18], [34, 16, 30], [37, 12, 35]];
const triSpec = (pool: Array<[number, number, number]>) => ({
  row: C(pool.map((r) => r.join('|'))),
  R: D((v: Vars) => Number(String(v.row).split('|')[0])),
  dist: D((v: Vars) => Number(String(v.row).split('|')[1])),
  half: D((v: Vars) => Number(String(v.row).split('|')[2])),
});

const divisorsIn = (n: number, lo: number, hi: number): number[] => Array.from({ length: hi - lo + 1 }, (_, i) => i + lo).filter((d) => n % d === 0 && n / d >= 2);
/** Two chords: p·q = c·x. */
const chordVars = (pLo: number, pHi: number) => ({
  p: I(pLo, pHi),
  q: I(pLo + 1, pHi + 3),
  c: C((v: Vars) => {
    // A segment that is neither of the first chord's (that would only swap them); the constraint guarantees two.
    const fresh = divisorsIn(g(v, 'p') * g(v, 'q'), 2, 18).filter((d) => d !== g(v, 'p') && d !== g(v, 'q'));
    return fresh.length >= 2 ? fresh : [2, 3];
  }),
  x: D((v: Vars) => (g(v, 'p') * g(v, 'q')) / g(v, 'c')),
});
const freshSegments = (v: Vars): number[] => divisorsIn(g(v, 'p') * g(v, 'q'), 2, 18).filter((d) => d !== g(v, 'p') && d !== g(v, 'q'));
const chordOk = (v: Vars): boolean => g(v, 'p') !== g(v, 'q') && freshSegments(v).length >= 2;
const chordSlips = (v: Vars): number[] => [g(v, 'p') + g(v, 'q') - g(v, 'c'), g(v, 'p') * g(v, 'q'), g(v, 'p') + g(v, 'q'), g(v, 'c') + g(v, 'x') + 1];

/** Tangent t, external part e of a secant, full secant f = t²/e. */
const tanSec = () => ({
  t: I(4, 20),
  e: I(2, 12),
  f: D((v: Vars) => (g(v, 't') ** 2) / g(v, 'e')),
});
const tanSecOk = (v: Vars): boolean => (g(v, 't') ** 2) % g(v, 'e') === 0 && g(v, 't') ** 2 / g(v, 'e') > g(v, 'e');
/** Two secants from one point: e1 · f1 = e2 · f2. */
const twoSec = (loE: number, hiE: number) => ({
  e1: I(loE, hiE),
  f1: I(loE * 3, hiE * 4),
  e2: I(loE, hiE + 2),
  f2: D((v: Vars) => (g(v, 'e1') * g(v, 'f1')) / g(v, 'e2')),
});
const twoSecOk = (v: Vars): boolean => g(v, 'f1') > g(v, 'e1') + 1 && g(v, 'e1') !== g(v, 'e2') && (g(v, 'e1') * g(v, 'f1')) % g(v, 'e2') === 0 && g(v, 'f2') > g(v, 'e2') && g(v, 'f2') !== g(v, 'f1');

// ─────────────────────── π answers ───────────────────────

const piText = (n: number, unit: string): string => `${n === 1 ? '' : group(n)}π ${unit}`;
const piOptions = (key: number, unit: string, slips: number[]): string[] => {
  const out = [piText(key, unit)];
  for (const n of [...slips, key * 2, key + 1, key - 1, key + 2, key * 3, key + 3, key * 4, key + 4]) {
    if (!Number.isInteger(n) || n <= 0) continue;
    const text = piText(n, unit);
    if (!out.includes(text)) out.push(text);
  }
  return out;
};
const radical = (k: number): string => `${k === 1 ? '' : k}√3`;
const radicalOptions = (k: number, wrongs: string[]): string[] => textOptions(`${radical(k)} სმ`, wrongs);

const TRIPLES: Array<[number, number, number]> = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41]];

export const G7_U14_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U14.1 — გრადუსები და რადიანები ═════════
  t({
    sub: 'u14-01',
    prompt: '{what} რამდენი გრადუსია?',
    vars: { i: I(0, NAMED.length - 1), what: D((v: Vars) => NAMED[g(v, 'i')]![0]) },
    answer: (v) => deg(NAMED[g(v, 'i')]![1]),
    options: (v) => unitOptions(NAMED[g(v, 'i')]![1], '°', [90, 180, 360, 45, 270]),
    why: (v, a) => `${v.what} ${a}-ია: მართი კუთხე 90°-ია, გაშლილი 180°, სრული 360°.`,
  }),
  t({
    sub: 'u14-01',
    prompt: 'გარდაქმენი {a}° რადიანებში.',
    vars: { a: C(DEGS) },
    answer: (v) => radText(g(v, 'a')),
    options: (v) => radOptions(g(v, 'a')),
    why: (v, a) => `${v.a}° = ${v.a}/180 · π = ${a}, რადგან 180° = π.`,
  }),
  t({
    sub: 'u14-01',
    prompt: 'გარდაქმენი {r} რადიანი გრადუსებში.',
    vars: { a: C(DEGS), r: D((v: Vars) => radText(g(v, 'a'))) },
    answer: (v) => deg(g(v, 'a')),
    options: (v) => unitOptions(g(v, 'a'), '°', degSlips(g(v, 'a'))),
    why: (v, a) => `${v.r} რადიანი = ${a}, რადგან π = 180°.`,
  }),
  t({
    sub: 'u14-01',
    prompt: 'გარდაქმენი {r} რადიანი გრადუსებში.',
    vars: { n: I(1, 7), dd: C([2, 3, 4, 5, 6, 9, 10, 12]), r: D((v: Vars) => `${g(v, 'n') === 1 ? '' : g(v, 'n')}π/${g(v, 'dd')}`), a: D((v: Vars) => (180 * g(v, 'n')) / g(v, 'dd')) },
    constraints: [{ test: (v: Vars) => gcd(g(v, 'n'), g(v, 'dd')) === 1 && g(v, 'n') < 2 * g(v, 'dd'), note: 'a reduced fraction of a turn' }],
    answer: (v) => deg(g(v, 'a')),
    options: (v) => unitOptions(g(v, 'a'), '°', [g(v, 'n') * g(v, 'dd'), 180 / g(v, 'dd'), 360 / g(v, 'dd'), 90 * g(v, 'n')]),
    why: (v, a) => `${v.r} = ${g(v, 'n')} · 180° ÷ ${v.dd} = ${a}.`,
  }),
  t({
    sub: 'u14-01',
    prompt: 'იპოვე {r1} რადიანისა და {r2} რადიანის ჯამი გრადუსებში.',
    vars: { a: C([30, 45, 60, 90, 120, 135, 150]), b: C([15, 30, 45, 60, 90, 120]), r1: D((v: Vars) => radText(g(v, 'a'))), r2: D((v: Vars) => radText(g(v, 'b'))) },
    answer: (v) => deg(g(v, 'a') + g(v, 'b')),
    options: (v) => unitOptions(g(v, 'a') + g(v, 'b'), '°', [Math.abs(g(v, 'a') - g(v, 'b')), g(v, 'a') * 2, g(v, 'b') * 2, g(v, 'a') + g(v, 'b') + 30]),
    why: (v, a) => `${v.r1} რადიანი = ${v.a}°, ${v.r2} რადიანი = ${v.b}°; ${v.a}° + ${v.b}° = ${a}.`,
  }),
  t({
    sub: 'u14-01',
    prompt: 'სამკუთხედის ორი კუთხეა {a}° და {b}°. რამდენი რადიანია მესამე კუთხე?',
    vars: { a: I(20, 80, { step: 5 }), b: I(20, 80, { step: 5 }), c: D((v: Vars) => 180 - g(v, 'a') - g(v, 'b')) },
    constraints: [{ test: (v: Vars) => g(v, 'a') + g(v, 'b') <= 150, note: 'a real third angle' }],
    answer: (v) => radText(g(v, 'c')),
    options: (v) => radOptions(g(v, 'c')),
    why: (v, a) => `მესამე კუთხე = 180° ${MINUS} ${v.a}° ${MINUS} ${v.b}° = ${v.c}° = ${a}.`,
  }),

  // ═════════ U14.2 — მოსაზღვრე და ვერტიკალური კუთხეები ═════════
  num({
    sub: 'u14-02',
    prompt: 'ორი მოსაზღვრე კუთხიდან ერთ-ერთი {a}°-ია. იპოვე მეორე კუთხე.',
    vars: { a: I(20, 160) },
    constraints: [{ test: (v: Vars) => g(v, 'a') !== 90, note: 'two different angles' }],
    unit: '°',
    key: (v) => 180 - g(v, 'a'),
    slips: (v) => [g(v, 'a'), 90 - g(v, 'a'), 360 - g(v, 'a'), g(v, 'a') + 90],
    why: (v, a) => `მოსაზღვრე კუთხეების ჯამია 180°: 180° ${MINUS} ${v.a}° = ${a}.`,
  }),
  num({
    sub: 'u14-02',
    prompt: 'ორი ვერტიკალური კუთხიდან ერთ-ერთი {a}°-ია. იპოვე მეორე კუთხე.',
    vars: { a: I(20, 160) },
    constraints: [{ test: (v: Vars) => g(v, 'a') !== 90, note: 'two different angles' }],
    unit: '°',
    key: (v) => g(v, 'a'),
    slips: (v) => [180 - g(v, 'a'), 90 - g(v, 'a'), 360 - g(v, 'a'), g(v, 'a') * 2],
    why: (v, a) => `ვერტიკალური კუთხეები ტოლია: მეორე კუთხეც ${a}-ია, ვინაიდან პირველი ${v.a}°-ია.`,
  }),
  t({
    sub: 'u14-02',
    prompt: 'ორი მოსაზღვრე კუთხის ზომებია {ex}° და {ey}°. იპოვე ორივე კუთხის ზომა.',
    vars: {
      s: C([3, 4, 5, 6, 9, 10, 12, 15, 18, 20]),
      p: I(1, (v: Vars) => Math.ceil(g(v, 's') / 2) - 1),
      q: D((v: Vars) => g(v, 's') - g(v, 'p')),
      ex: D((v: Vars) => coef(g(v, 'p'))),
      ey: D((v: Vars) => coef(g(v, 'q'))),
    },
    answer: (v) => pair(g(v, 'p') * (180 / g(v, 's')), g(v, 'q') * (180 / g(v, 's')), '°'),
    options: (v, right) => {
      const x = 180 / g(v, 's');
      return textOptions(right, [pair(x, 180 - x, '°'), pair(90, 90, '°'), pair(g(v, 'p') * x + 10, g(v, 'q') * x - 10, '°'), pair(g(v, 'q') * x, g(v, 'p') * x + x, '°')]);
    },
    why: (v, a) => `${v.ex} + ${v.ey} = 180, ამიტომ ${g(v, 's')}x = 180 და x = ${180 / g(v, 's')}. კუთხეებია ${a}.`,
  }),
  num({
    sub: 'u14-02',
    prompt: 'ორი ვერტიკალური კუთხის ზომებია ({e})° და {c}°. იპოვე x.',
    vars: eqVars(),
    unit: '',
    key: (v) => g(v, 'x'),
    slips: eqSlips,
    why: (v, a) => `ვერტიკალური კუთხეები ტოლია: ${v.e} = ${v.c}, ამიტომ ${g(v, 'a')}x = ${g(v, 'c') - g(v, 'b')} და x = ${a}.`,
  }),
  t({
    sub: 'u14-02',
    prompt: 'ორი მოსაზღვრე კუთხის ზომებია ({e1})° და ({e2})°. იპოვე ორივე კუთხე.',
    vars: sumVars(),
    answer: (v) => pair(g(v, 'p') * g(v, 'x') + g(v, 'b'), g(v, 'q') * g(v, 'x') + g(v, 'd'), '°'),
    options: (v, right) => {
      const x = g(v, 'x');
      return textOptions(right, [pair(g(v, 'p') * (x + 5) + g(v, 'b'), g(v, 'q') * (x + 5) + g(v, 'd'), '°'), pair(g(v, 'p') * x, g(v, 'q') * x, '°'), pair(g(v, 'b'), g(v, 'd'), '°'), pair(g(v, 'p') * (x - 3) + g(v, 'b'), g(v, 'q') * (x - 3) + g(v, 'd'), '°')]);
    },
    why: (v, a) => `${v.e1} + ${v.e2} = 180, ამიტომ ${g(v, 'p') + g(v, 'q')}x = ${180 - g(v, 'b') - g(v, 'd')} და x = ${v.x}. კუთხეებია ${a}.`,
  }),
  t({
    sub: 'u14-02',
    prompt: 'ორი წრფის გადაკვეთისას ერთ-ერთი კუთხე {a}°-ია. იპოვე დანარჩენი სამი კუთხის ზომები.',
    vars: { a: I(20, 160) },
    constraints: [{ test: (v: Vars) => g(v, 'a') !== 90, note: 'two different angles' }],
    answer: (v) => `${180 - g(v, 'a')}°, ${g(v, 'a')}° და ${180 - g(v, 'a')}°`,
    options: (v, right) => {
      const a = g(v, 'a');
      return textOptions(right, [`${a}°, ${a}° და ${180 - a}°`, `${180 - a}°, ${180 - a}° და ${180 - a}°`, `${180 - a}°, ${a}° და ${a}°`, `${a + 10}°, ${a}° და ${180 - a}°`]);
    },
    why: (v, a) => `მოსაზღვრე კუთხე 180° ${MINUS} ${v.a}° = ${180 - g(v, 'a')}°, ვერტიკალური კუთხეები ტოლია. დანარჩენი სამია ${a}.`,
  }),

  // ═════════ U14.3 — პარალელური წრფეები და მკვეთი ═════════
  num({
    sub: 'u14-03',
    prompt: 'ორი პარალელური წრფე მკვეთმა გადაკვეთა. ერთ-ერთი {kind} კუთხეა {a}°. იპოვე მეორე {kind} კუთხე.',
    vars: { a: I(30, 150), k: C([0, 1]), kind: D((v: Vars) => ['შესაბამისი', 'გარე ჯვარედინი'][g(v, 'k')]!) },
    unit: '°',
    key: (v) => g(v, 'a'),
    slips: (v) => [180 - g(v, 'a'), 90 - g(v, 'a'), g(v, 'a') * 2, 360 - g(v, 'a')],
    why: (v, a) => `პარალელური წრფეების მკვეთისას ${v.kind} კუთხეები ტოლია: ${a}.`,
  }),
  num({
    sub: 'u14-03',
    prompt: 'ორი პარალელური წრფის მკვეთისას ერთ-ერთი შიგა ჯვარედინი კუთხე {a}°-ია. იპოვე მეორე შიგა ჯვარედინი კუთხე.',
    vars: { a: I(30, 150) },
    unit: '°',
    key: (v) => g(v, 'a'),
    slips: (v) => [180 - g(v, 'a'), 90 - g(v, 'a'), g(v, 'a') * 2, 360 - g(v, 'a')],
    why: (v, a) => `შიგა ჯვარედინი კუთხეები ტოლია: ${v.a}° = ${a}.`,
  }),
  num({
    sub: 'u14-03',
    prompt: 'ორი პარალელური წრფის მკვეთისას ერთ-ერთი {kind} კუთხე {a}°-ია. იპოვე მეორე {kind} კუთხე.',
    vars: { a: I(40, 140), k: C([0, 1]), kind: D((v: Vars) => ['ცალმხრივი შიგა', 'ცალმხრივი გარე'][g(v, 'k')]!) },
    constraints: [{ test: (v: Vars) => g(v, 'a') !== 90, note: 'two different angles' }],
    unit: '°',
    key: (v) => 180 - g(v, 'a'),
    slips: (v) => [g(v, 'a'), 90 - g(v, 'a'), 360 - g(v, 'a'), g(v, 'a') + 20],
    why: (v, a) => `ცალმხრივი კუთხეების ჯამია 180°: 180° ${MINUS} ${v.a}° = ${a}.`,
  }),
  num({
    sub: 'u14-03',
    prompt: 'ორი პარალელური წრფის მკვეთისას შესაბამისი კუთხეებია ({e})° და {c}°. იპოვე x.',
    vars: eqVars(),
    unit: '',
    key: (v) => g(v, 'x'),
    slips: eqSlips,
    why: (v, a) => `შესაბამისი კუთხეები ტოლია: ${v.e} = ${v.c}, ამიტომ ${g(v, 'a')}x = ${g(v, 'c') - g(v, 'b')} და x = ${a}.`,
  }),
  num({
    sub: 'u14-03',
    prompt: 'ორი პარალელური წრფის მკვეთისას ცალმხრივი შიგა კუთხეებია ({e1})° და ({e2})°. იპოვე x.',
    vars: sumVars(),
    unit: '',
    key: (v) => g(v, 'x'),
    slips: sumSlips,
    why: (v, a) => `ცალმხრივი კუთხეების ჯამია 180°: ${v.e1} + ${v.e2} = 180, ამიტომ ${g(v, 'p') + g(v, 'q')}x = ${180 - g(v, 'b') - g(v, 'd')} და x = ${a}.`,
  }),
  t({
    sub: 'u14-03',
    prompt: 'ორი პარალელური წრფის მკვეთისას ერთ-ერთი კუთხეა {a}°. იპოვე ყველა კუთხე, რომელიც ამ გადაკვეთის შედეგად წარმოიქმნება.',
    vars: { a: I(30, 150) },
    constraints: [{ test: (v: Vars) => g(v, 'a') !== 90, note: 'two different angles' }],
    answer: (v) => `ოთხი კუთხე ${Math.max(g(v, 'a'), 180 - g(v, 'a'))}° და ოთხი კუთხე ${Math.min(g(v, 'a'), 180 - g(v, 'a'))}°`,
    options: (v, right) => {
      const big = Math.max(g(v, 'a'), 180 - g(v, 'a'));
      const small = 180 - big;
      return textOptions(right, [`ორი კუთხე ${big}° და ექვსი კუთხე ${small}°`, `რვა კუთხე ${big}°`, `ოთხი კუთხე ${big}° და ოთხი კუთხე ${small + 10}°`, `ექვსი კუთხე ${big}° და ორი კუთხე ${small}°`]);
    },
    why: (v, a) => `მოსაზღვრე კუთხე 180° ${MINUS} ${v.a}° = ${180 - g(v, 'a')}°; ტოლია ვერტიკალური, შესაბამისი და ჯვარედინი კუთხეებიც. სულ: ${a}.`,
  }),

  // ═════════ U14.4 — პარალელურობის ნიშნები და თვისებები ═════════
  yesNo(
    'u14-04',
    'ორი წრფე მკვეთმა გადაკვეთა. {kind} კუთხეებია {a}° და {b}°. შეიძლება თუ არა დავასკვნათ, რომ წრფეები პარალელურია? უპასუხე „კი“ ან „არა“.',
    { a: I(50, 130), k: C([0, 1, 2]), m: C([0, 1, 2]), kind: D((v: Vars) => ['შესაბამისი', 'შიგა ჯვარედინი', 'ცალმხრივი შიგა'][g(v, 'k')]!), b: D((v: Vars) => [g(v, 'a'), 180 - g(v, 'a'), g(v, 'a') + 10][g(v, 'm')]!) },
    (v) => (g(v, 'k') === 2 ? g(v, 'a') + g(v, 'b') === 180 : g(v, 'a') === g(v, 'b')),
    (v, a) => (g(v, 'k') === 2 ? `ცალმხრივი კუთხეების ჯამია ${g(v, 'a') + g(v, 'b')}°, ${g(v, 'a') + g(v, 'b') === 180 ? '180°, ამიტომ წრფეები პარალელურია' : 'არა 180°, ამიტომ წრფეები პარალელური არ არის'}. პასუხი: ${a}.` : `${v.kind} კუთხეები ${g(v, 'a') === g(v, 'b') ? 'ტოლია, ამიტომ წრფეები პარალელურია' : 'არ არის ტოლი, ამიტომ წრფეები პარალელური არ არის'}. პასუხი: ${a}.`),
    [{ test: (v: Vars) => g(v, 'a') !== 90, note: 'not the degenerate right angle' }],
  ),
  t({
    sub: 'u14-04',
    prompt: 'ორი წრფის მკვეთისას {kind} კუთხეებია {a}° და {b}°. რა დასკვნა შეიძლება გამოვიტანოთ წრფეების შესახებ?',
    vars: { a: I(50, 130), k: C([0, 1, 2]), m: C([0, 1]), kind: D((v: Vars) => ['შიგა ჯვარედინი', 'გარე ჯვარედინი', 'შესაბამისი'][g(v, 'k')]!), b: D((v: Vars) => (g(v, 'm') ? g(v, 'a') : g(v, 'a') + 20)) },
    answer: (v) => (g(v, 'm') ? 'წრფეები პარალელურია' : 'წრფეები პარალელური არ არის'),
    options: (_v, right) => textOptions(right, [right === 'წრფეები პარალელურია' ? 'წრფეები პარალელური არ არის' : 'წრფეები პარალელურია', 'წრფეები პერპენდიკულარულია', 'დასკვნის გამოტანა შეუძლებელია']),
    why: (v, a) => `${v.kind} კუთხეები ${g(v, 'm') ? 'ტოლია' : 'არ არის ტოლი'}, ამიტომ ${a}.`,
  }),
  t({
    sub: 'u14-04',
    prompt: 'ორი წრფის მკვეთისას ცალმხრივი შიგა კუთხეების ჯამია {s}°. რა დასკვნა შეიძლება გამოვიტანოთ წრფეების შესახებ?',
    vars: { s: C([180, 180, 180, 150, 155, 160, 165, 170, 175, 185, 190, 195, 200, 210]) },
    answer: (v) => (g(v, 's') === 180 ? 'წრფეები პარალელურია' : 'წრფეები პარალელური არ არის'),
    options: (_v, right) => textOptions(right, [right === 'წრფეები პარალელურია' ? 'წრფეები პარალელური არ არის' : 'წრფეები პარალელურია', 'წრფეები პერპენდიკულარულია', 'დასკვნის გამოტანა შეუძლებელია']),
    why: (v, a) => `პარალელურობისთვის ცალმხრივი კუთხეების ჯამი 180° უნდა იყოს; აქ ${v.s}°-ია, ამიტომ ${a}.`,
  }),
  t({
    sub: 'u14-04',
    prompt: 'ორი წრფის მკვეთისას შესაბამისი კუთხეებია ({e})° და {c}°. იპოვე x, თუ წრფეები პარალელურია.',
    vars: (() => {
      const base = { a: I(2, 5), b: I(5, 30), neg: C([0, 1]) };
      return {
        ...base,
        x: I((v: Vars) => (g(v, 'neg') ? Math.ceil((g(v, 'b') + 20) / g(v, 'a')) : 5), (v: Vars) => Math.floor((170 + (g(v, 'neg') ? g(v, 'b') : -g(v, 'b'))) / g(v, 'a'))),
        c: D((v: Vars) => g(v, 'a') * g(v, 'x') + (g(v, 'neg') ? -g(v, 'b') : g(v, 'b'))),
        e: D((v: Vars) => lin(g(v, 'a'), g(v, 'neg') ? -g(v, 'b') : g(v, 'b'))),
      };
    })(),
    answer: (v) => group(g(v, 'x')),
    options: (v) => unitOptions(g(v, 'x'), '', [(g(v, 'c') - g(v, 'b')) / g(v, 'a'), (g(v, 'c') + g(v, 'b')) / g(v, 'a'), g(v, 'c') / g(v, 'a'), g(v, 'c') - g(v, 'b')]),
    why: (v, a) => `პარალელური წრფეების შესაბამისი კუთხეები ტოლია: ${v.e} = ${v.c}, ამიტომ x = ${a}.`,
  }),
  num({
    sub: 'u14-04',
    prompt: 'ორი წრფის მკვეთისას ცალმხრივი {kind} კუთხეებია x° და {c}°. იპოვე x, თუ წრფეები პარალელურია.',
    vars: { c: I(40, 140), k: C([0, 1]), kind: D((v: Vars) => ['შიგა', 'გარე'][g(v, 'k')]!) },
    constraints: [{ test: (v: Vars) => g(v, 'c') !== 90, note: 'two different angles' }],
    unit: '',
    key: (v) => 180 - g(v, 'c'),
    slips: (v) => [g(v, 'c'), 90 - g(v, 'c'), 360 - g(v, 'c'), g(v, 'c') + 20],
    why: (v, a) => `პარალელურობისას ცალმხრივი კუთხეების ჯამია 180°: x = 180 ${MINUS} ${v.c} = ${a}.`,
  }),
  t({
    sub: 'u14-04',
    prompt: 'ორი პარალელური წრფის მკვეთისას ერთ-ერთი კუთხეა {a}°. იპოვე ამ კუთხის {rel} კუთხე.',
    vars: { a: I(30, 150), r: C([0, 1]), rel: D((v: Vars) => ['მოსაზღვრე', 'ვერტიკალური'][g(v, 'r')]!) },
    constraints: [{ test: (v: Vars) => g(v, 'a') !== 90, note: 'two different angles' }],
    answer: (v) => deg(g(v, 'r') ? g(v, 'a') : 180 - g(v, 'a')),
    options: (v) => unitOptions(g(v, 'r') ? g(v, 'a') : 180 - g(v, 'a'), '°', [g(v, 'a'), 180 - g(v, 'a'), 90 - g(v, 'a'), 360 - g(v, 'a')]),
    why: (v, a) => (g(v, 'r') ? `ვერტიკალური კუთხეები ტოლია: ${a}.` : `მოსაზღვრე კუთხეების ჯამია 180°: 180° ${MINUS} ${v.a}° = ${a}.`),
  }),

  // ═════════ U14.5 — ცენტრალური და ჩახაზული კუთხეები ═════════
  num({
    sub: 'u14-05',
    prompt: 'წრეწირის ცენტრალური კუთხეა {c}°. იპოვე იმავე რკალზე დაყრდნობილი ჩახაზული კუთხე.',
    vars: { c: I(20, 180, { step: 2 }) },
    unit: '°',
    key: (v) => g(v, 'c') / 2,
    slips: (v) => [g(v, 'c'), g(v, 'c') * 2, 180 - g(v, 'c'), g(v, 'c') / 2 + 10],
    why: (v, a) => `ჩახაზული კუთხე ცენტრალურზე ორჯერ მცირეა: ${v.c}° ÷ 2 = ${a}.`,
  }),
  num({
    sub: 'u14-05',
    prompt: 'ჩახაზული კუთხე {i}°-ია. იპოვე იმავე რკალზე დაყრდნობილი ცენტრალური კუთხე.',
    vars: { i: I(10, 89) },
    unit: '°',
    key: (v) => g(v, 'i') * 2,
    slips: (v) => [g(v, 'i'), g(v, 'i') / 2, 180 - g(v, 'i'), g(v, 'i') * 2 + 10],
    why: (v, a) => `ცენტრალური კუთხე ჩახაზულზე ორჯერ დიდია: ${v.i}° · 2 = ${a}.`,
  }),
  num({
    sub: 'u14-05',
    prompt: 'ცენტრალური კუთხეა {c}°. იპოვე იმავე რკალის გრადუსული ზომა.',
    vars: { c: I(20, 340, { step: 5 }) },
    unit: '°',
    key: (v) => g(v, 'c'),
    slips: (v) => [g(v, 'c') * 2, g(v, 'c') / 2, 360 - g(v, 'c'), 180 - g(v, 'c')],
    why: (v, a) => `ცენტრალური კუთხის ზომა მის რკალის ზომას უდრის: ${v.c}° = ${a}.`,
  }),
  num({
    sub: 'u14-05',
    prompt: 'ჩახაზული კუთხე {i}°-ია. იპოვე იმავე რკალის გრადუსული ზომა.',
    vars: { i: I(10, 89) },
    unit: '°',
    key: (v) => g(v, 'i') * 2,
    slips: (v) => [g(v, 'i'), g(v, 'i') / 2, 360 - g(v, 'i'), 180 - g(v, 'i')],
    why: (v, a) => `რკალი ჩახაზულ კუთხეზე ორჯერ დიდია: ${v.i}° · 2 = ${a}.`,
  }),
  num({
    sub: 'u14-05',
    prompt: 'ერთი და იმავე რკალზე დაყრდნობილი ორი ჩახაზული კუთხიდან ერთ-ერთია {a}°. იპოვე მეორე კუთხე.',
    vars: { a: I(10, 89) },
    unit: '°',
    key: (v) => g(v, 'a'),
    slips: (v) => [g(v, 'a') * 2, g(v, 'a') / 2, 180 - g(v, 'a'), 90 - g(v, 'a')],
    why: (v, a) => `ერთსა და იმავე რკალზე დაყრდნობილი ჩახაზული კუთხეები ტოლია: ${v.a}° = ${a}.`,
  }),
  t({
    sub: 'u14-05',
    prompt: 'ჩახაზული კუთხე ეყრდნობა {arc}. იპოვე ამ კუთხის ზომა.',
    vars: { i: I(0, 7), arc: D((v: Vars) => ['ნახევარწრეს', 'წრეწირის მესამედს', 'წრეწირის მეოთხედს', 'წრეწირის მეხუთედს', 'წრეწირის მეექვსედს', 'წრეწირის მეცხრედს', 'წრეწირის მეათედს', 'წრეწირის მეთორმეტედს'][g(v, 'i')]!) },
    answer: (v) => deg(180 / [2, 3, 4, 5, 6, 9, 10, 12][g(v, 'i')]!),
    options: (v) => unitOptions(180 / [2, 3, 4, 5, 6, 9, 10, 12][g(v, 'i')]!, '°', [360 / [2, 3, 4, 5, 6, 9, 10, 12][g(v, 'i')]!, 180, 45, 60]),
    why: (v, a) => `რკალი ${360 / [2, 3, 4, 5, 6, 9, 10, 12][g(v, 'i')]!}°-ია, ხოლო ჩახაზული კუთხე მის ნახევარს უდრის: ${a}.`,
  }),

  // ═════════ U14.6 — ორი წრეწირის ურთიერთმდებარეობა ═════════
  t({
    sub: 'u14-06',
    prompt: 'ორი წრეწირის რადიუსებია {a} სმ და {b} სმ, ხოლო ცენტრებს შორის მანძილი {dist} სმ-ია. როგორ მდებარეობენ ისინი ერთმანეთის მიმართ?',
    vars: circleVars([0, 1, 2]),
    constraints: [{ test: circleOk, note: 'two different radii' }],
    answer: (v) => POSITIONS[kindOf(v)]!,
    options: (_v, right) => textOptions(right, POSITIONS),
    why: (v, a) => `${circleWhy(v)}; ამიტომ ${a}.`,
  }),
  t({
    sub: 'u14-06',
    prompt: 'ორი წრეწირის რადიუსებია {a} სმ და {b} სმ, ხოლო ცენტრებს შორის მანძილი {dist} სმ-ია. რამდენი საერთო წერტილი აქვთ მათ?',
    vars: circleVars([0, 1, 2]),
    constraints: [{ test: circleOk, note: 'two different radii' }],
    answer: (v) => String(COMMON[kindOf(v)]),
    options: () => ['0', '1', '2', '3'],
    why: (v, a) => `${circleWhy(v)}; საერთო წერტილების რაოდენობაა ${a}.`,
  }),
  yesNo(
    'u14-06',
    'ორი წრეწირის რადიუსებია {a} სმ და {b} სმ, ხოლო ცენტრებს შორის მანძილი {dist} სმ-ია. იკვეთებიან თუ არა ისინი ორ წერტილში? უპასუხე „კი“ ან „არა“.',
    circleVars([0, 1, 2, 3, 4]),
    (v) => kindOf(v) === 2,
    (v, a) => `${circleWhy(v)}; ორ წერტილში იკვეთებიან მხოლოდ მაშინ, როცა R ${MINUS} r < d < R + r. პასუხი: ${a}.`,
    [{ test: circleOk, note: 'two different radii' }],
  ),
  yesNo(
    'u14-06',
    'ორი წრეწირის რადიუსებია {a} სმ და {b} სმ, ხოლო ცენტრებს შორის მანძილი {dist} სმ-ია. აქვთ თუ არა მათ საერთო წერტილი? უპასუხე „კი“ ან „არა“.',
    circleVars([0, 1, 2, 3, 4]),
    (v) => COMMON[kindOf(v)]! > 0,
    (v, a) => `${circleWhy(v)}; საერთო წერტილი აქვთ, თუ ეხებიან ან იკვეთებიან. პასუხი: ${a}.`,
    [{ test: circleOk, note: 'two different radii' }],
  ),
  t({
    sub: 'u14-06',
    prompt: 'ორი წრეწირის რადიუსებია {a} სმ და {b} სმ, ხოლო ცენტრებს შორის მანძილი {dist} სმ-ია. როგორ მდებარეობენ ისინი ერთმანეთის მიმართ?',
    vars: circleVars([2, 3, 4]),
    constraints: [{ test: circleOk, note: 'two different radii' }],
    answer: (v) => POSITIONS[kindOf(v)]!,
    options: (_v, right) => textOptions(right, POSITIONS),
    why: (v, a) => `${circleWhy(v)}; ამიტომ ${a}.`,
  }),
  t({
    sub: 'u14-06',
    prompt: 'ორი წრეწირის რადიუსებია {a} სმ და {b} სმ, ხოლო ცენტრებს შორის მანძილი {dist} სმ-ია. რამდენ საერთო წერტილში იკვეთებიან ისინი?',
    vars: circleVars([2, 3, 4]),
    constraints: [{ test: circleOk, note: 'two different radii' }],
    answer: (v) => String(COMMON[kindOf(v)]),
    options: () => ['0', '1', '2', '3'],
    why: (v, a) => `${circleWhy(v)}; საერთო წერტილების რაოდენობაა ${a}.`,
  }),

  // ═════════ U14.7 — რადიუსი, დიამეტრი და ქორდა ═════════
  num({
    sub: 'u14-07',
    prompt: 'წრეწირის რადიუსია {r} სმ. იპოვე დიამეტრი.',
    vars: { r: I(2, 40) },
    unit: 'სმ',
    key: (v) => g(v, 'r') * 2,
    slips: (v) => [g(v, 'r'), g(v, 'r') * g(v, 'r'), g(v, 'r') + 2, g(v, 'r') * 3],
    why: (v, a) => `დიამეტრი რადიუსზე ორჯერ დიდია: 2 · ${v.r} = ${a}.`,
  }),
  num({
    sub: 'u14-07',
    prompt: 'წრეწირის დიამეტრია {d} სმ. იპოვე რადიუსი.',
    vars: { r: I(2, 40), d: D((v: Vars) => g(v, 'r') * 2) },
    unit: 'სმ',
    key: (v) => g(v, 'r'),
    slips: (v) => [g(v, 'd') * 2, g(v, 'd') - 2, g(v, 'r') + 1, g(v, 'r') * 3],
    why: (v, a) => `რადიუსი დიამეტრის ნახევარია: ${v.d} ÷ 2 = ${a}.`,
  }),
  yesNo(
    'u14-07',
    'წრეწირის რადიუსია {r} სმ. შეიძლება თუ არა ამ წრეწირის ქორდის სიგრძე იყოს {len} სმ? უპასუხე „კი“ ან „არა“.',
    { r: I(3, 20), k: C([0, 1]), e: I(1, 6), len: D((v: Vars) => (g(v, 'k') ? 2 * g(v, 'r') + g(v, 'e') : 2 * g(v, 'r') - g(v, 'e'))) },
    (v) => g(v, 'len') <= 2 * g(v, 'r'),
    (v, a) => `უდიდესი ქორდი დიამეტრია, 2 · ${v.r} = ${2 * g(v, 'r')} სმ; ${v.len} სმ ${g(v, 'len') <= 2 * g(v, 'r') ? 'არ აღემატება მას' : 'მეტია მასზე'}. პასუხი: ${a}.`,
  ),
  t({
    sub: 'u14-07',
    prompt: 'წრეწირის {what} {v0} სმ. იპოვე უდიდესი შესაძლო ქორდის სიგრძე.',
    vars: { r: I(3, 24), k: C([0, 1]), what: D((v: Vars) => (g(v, 'k') ? 'რადიუსია' : 'დიამეტრია')), v0: D((v: Vars) => (g(v, 'k') ? g(v, 'r') : 2 * g(v, 'r'))) },
    answer: (v) => cm(2 * g(v, 'r')),
    options: (v) => unitOptions(2 * g(v, 'r'), 'სმ', [g(v, 'r'), 4 * g(v, 'r'), g(v, 'r') + 2, g(v, 'r') * 3]),
    why: (v, a) => `უდიდესი ქორდი დიამეტრია; დიამეტრი 2 · ${v.r} = ${a}.`,
  }),
  num({
    sub: 'u14-07',
    prompt: 'წრეწირის ცენტრიდან ქორდამდე მანძილია {dist} სმ, ხოლო რადიუსია {R} სმ. იპოვე ქორდის სიგრძე.',
    vars: triSpec(TRI_A),
    unit: 'სმ',
    key: (v) => 2 * g(v, 'half'),
    slips: (v) => [g(v, 'half'), g(v, 'R') + g(v, 'dist'), 2 * g(v, 'R'), 2 * g(v, 'dist')],
    why: (v, a) => `ნახევარი ქორდი √(${v.R}² ${MINUS} ${v.dist}²) = ${v.half} სმ; ქორდი 2 · ${v.half} = ${a}.`,
  }),
  num({
    sub: 'u14-07',
    prompt: 'წრეწირის რადიუსია {R} სმ. ცენტრიდან ქორდამდე მანძილია {dist} სმ. იპოვე ქორდის სიგრძე.',
    vars: triSpec(TRI_B),
    unit: 'სმ',
    key: (v) => 2 * g(v, 'half'),
    slips: (v) => [g(v, 'half'), g(v, 'R') + g(v, 'dist'), 2 * g(v, 'R'), 2 * g(v, 'dist')],
    why: (v, a) => `ნახევარი ქორდი √(${v.R}² ${MINUS} ${v.dist}²) = ${v.half} სმ; ქორდი 2 · ${v.half} = ${a}.`,
  }),

  // ═════════ U14.8 — გადამკვეთი ქორდები ═════════
  num({
    sub: 'u14-08',
    prompt: 'წრეწირის შიგნით ორი ქორდა იკვეთება. პირველი ქორდის მონაკვეთებია {p} სმ და {q} სმ. მეორე ქორდის ერთი მონაკვეთია {c} სმ. იპოვე მეორე მონაკვეთის სიგრძე.',
    vars: chordVars(2, 8),
    constraints: [{ test: chordOk, note: 'two different segments' }],
    unit: 'სმ',
    key: (v) => g(v, 'x'),
    slips: chordSlips,
    why: (v, a) => `გადამკვეთი ქორდების მონაკვეთების ნამრავლები ტოლია: ${v.p} · ${v.q} = ${v.c} · x, ამიტომ x = ${g(v, 'p') * g(v, 'q')} ÷ ${v.c} = ${a}.`,
  }),
  num({
    sub: 'u14-08',
    prompt: 'ორი ქორდა წრეწირის შიგნით იკვეთება. ერთი ქორდის მონაკვეთებია {p} სმ და {q} სმ, ხოლო მეორე ქორდის მონაკვეთებია x სმ და {c} სმ. იპოვე x.',
    vars: chordVars(3, 9),
    constraints: [{ test: chordOk, note: 'two different segments' }],
    unit: '',
    key: (v) => g(v, 'x'),
    slips: chordSlips,
    why: (v, a) => `${v.p} · ${v.q} = x · ${v.c}, ამიტომ x = ${g(v, 'p') * g(v, 'q')} ÷ ${v.c} = ${a}.`,
  }),
  num({
    sub: 'u14-08',
    prompt: 'ორი ქორდა წრეწირის შიგნით იკვეთება. პირველი ქორდის მონაკვეთებია {p} სმ და {q} სმ. მეორე ქორდის მონაკვეთებია {c} სმ და x სმ. იპოვე x.',
    vars: chordVars(2, 6),
    constraints: [{ test: chordOk, note: 'two different segments' }],
    unit: '',
    key: (v) => g(v, 'x'),
    slips: chordSlips,
    why: (v, a) => `${v.p} · ${v.q} = ${v.c} · x, ამიტომ x = ${g(v, 'p') * g(v, 'q')} ÷ ${v.c} = ${a}.`,
  }),
  num({
    sub: 'u14-08',
    prompt: 'ორი ქორდა წრეწირის შიგნით იკვეთება. პირველი ქორდის მონაკვეთებია {p} სმ და {q} სმ, ხოლო მეორე ქორდის მონაკვეთებია {c} სმ და x სმ. იპოვე x.',
    vars: chordVars(4, 10),
    constraints: [{ test: chordOk, note: 'two different segments' }],
    unit: '',
    key: (v) => g(v, 'x'),
    slips: chordSlips,
    why: (v, a) => `${v.p} · ${v.q} = ${v.c} · x, ამიტომ x = ${g(v, 'p') * g(v, 'q')} ÷ ${v.c} = ${a}.`,
  }),
  num({
    sub: 'u14-08',
    prompt: 'წრეწირის შიგნით ორი ქორდა იკვეთება. პირველი ქორდის მონაკვეთებია {p} სმ და {q} სმ. მეორე ქორდის ერთი მონაკვეთია {c} სმ. იპოვე მეორე მონაკვეთის სიგრძე.',
    vars: chordVars(3, 9),
    constraints: [{ test: chordOk, note: 'two different segments' }],
    unit: 'სმ',
    key: (v) => g(v, 'x'),
    slips: chordSlips,
    why: (v, a) => `${v.p} · ${v.q} = ${v.c} · x, ამიტომ x = ${g(v, 'p') * g(v, 'q')} ÷ ${v.c} = ${a}.`,
  }),
  num({
    sub: 'u14-08',
    prompt: 'ორი ქორდა წრეწირის შიგნით იკვეთება. პირველი ქორდის მონაკვეთებია {p} სმ და {q} სმ. მეორე ქორდის მონაკვეთებია {c} სმ და x სმ. იპოვე x.',
    vars: chordVars(5, 11),
    constraints: [{ test: chordOk, note: 'two different segments' }],
    unit: '',
    key: (v) => g(v, 'x'),
    slips: chordSlips,
    why: (v, a) => `${v.p} · ${v.q} = ${v.c} · x, ამიტომ x = ${g(v, 'p') * g(v, 'q')} ÷ ${v.c} = ${a}.`,
  }),

  // ═════════ U14.9 — მხები და რკალის ზომა ═════════
  num({
    sub: 'u14-09',
    prompt: 'წრეწირის {P}{Q} რკალის ზომაა {a}°. იპოვე ამ რკალის შესაბამისი ცენტრალური კუთხე.',
    vars: { a: I(20, 340, { step: 5 }), p: C(['A', 'M', 'K', 'P']), q: C(['B', 'N', 'L', 'Q']), P: D((v: Vars) => String(v.p)), Q: D((v: Vars) => String(v.q)) },
    unit: '°',
    key: (v) => g(v, 'a'),
    slips: (v) => [g(v, 'a') / 2, g(v, 'a') * 2, 360 - g(v, 'a'), 180 - g(v, 'a')],
    why: (_v, a) => `ცენტრალური კუთხე თავისი რკალის ტოლია: ${a}.`,
  }),
  num({
    sub: 'u14-09',
    prompt: 'წრეწირის მცირე რკალის ზომაა {m}°. იპოვე შესაბამისი დიდი რკალის ზომა.',
    vars: { m: I(20, 170, { step: 5 }) },
    unit: '°',
    key: (v) => 360 - g(v, 'm'),
    slips: (v) => [180 - g(v, 'm'), g(v, 'm') * 2, g(v, 'm') + 180, 360 - 2 * g(v, 'm')],
    why: (v, a) => `მთელი წრეწირი 360°-ია: 360° ${MINUS} ${v.m}° = ${a}.`,
  }),
  num({
    sub: 'u14-09',
    prompt: 'წრეწირის {P}{Q} რკალის ზომაა {a}°. იპოვე ამ რკალზე დაყრდნობილი ჩახაზული კუთხე.',
    vars: { a: I(40, 340, { step: 10 }), p: C(['A', 'M', 'K', 'P']), q: C(['B', 'N', 'L', 'Q']), P: D((v: Vars) => String(v.p)), Q: D((v: Vars) => String(v.q)) },
    unit: '°',
    key: (v) => g(v, 'a') / 2,
    slips: (v) => [g(v, 'a'), g(v, 'a') * 2, 180 - g(v, 'a') / 2, 360 - g(v, 'a')],
    why: (v, a) => `ჩახაზული კუთხე რკალის ნახევარია: ${v.a}° ÷ 2 = ${a}.`,
  }),
  t({
    sub: 'u14-09',
    prompt: '{ce} ცენტრის მქონე წრეწირის მხები შეხების {pt} წერტილში გავლებულ რადიუსთან რა კუთხეს ქმნის?',
    vars: { pt: C(['A', 'B', 'C', 'D', 'K', 'M']), ce: C(['O', 'Q', 'S']) },
    answer: () => deg(90),
    options: () => [deg(90), deg(45), deg(60), deg(180)],
    why: (_v, a) => `მხები შეხების წერტილში გავლებული რადიუსის მართობია: ${a}.`,
  }),
  t({
    sub: 'u14-09',
    prompt: 'წრეწირის რადიუსია {r} სმ. მხები და რადიუსი შეხების წერტილში იკვეთება. იპოვე მათ შორის კუთხის ზომა.',
    vars: { r: I(2, 30) },
    answer: () => deg(90),
    options: () => [deg(90), deg(45), deg(60), deg(180)],
    why: (_v, a) => `მხები შეხების წერტილში გავლებული რადიუსის მართობია, რადიუსის სიგრძის მიუხედავად: ${a}.`,
  }),
  num({
    sub: 'u14-09',
    prompt: 'წრეწირის დიდი რკალის ზომაა {M}°. იპოვე შესაბამისი მცირე რკალის ზომა.',
    vars: { M: I(190, 340, { step: 5 }) },
    unit: '°',
    key: (v) => 360 - g(v, 'M'),
    slips: (v) => [g(v, 'M') - 180, g(v, 'M') / 2, 180 - (g(v, 'M') - 180), g(v, 'M') - 90],
    why: (v, a) => `მცირე და დიდი რკალის ჯამია 360°: 360° ${MINUS} ${v.M}° = ${a}.`,
  }),

  // ═════════ U14.10 — მხები, სეკანტი და მათი თვისებები ═════════
  num({
    sub: 'u14-10',
    prompt: 'წრეწირის გარეთ მდებარე წერტილიდან გავლებულია მხები და სეკანტი. მხების სიგრძეა {t} სმ, ხოლო სეკანტის გარე მონაკვეთი {e} სმ. იპოვე სეკანტის სრული სიგრძე.',
    vars: tanSec(),
    constraints: [{ test: tanSecOk, note: 'the secant divides evenly' }],
    unit: 'სმ',
    key: (v) => g(v, 'f'),
    slips: (v) => [g(v, 't') + g(v, 'e'), g(v, 't') * g(v, 'e'), g(v, 'f') - g(v, 'e'), g(v, 't') * g(v, 't')],
    why: (v, a) => `მხების კვადრატი უდრის სეკანტისა და მისი გარე მონაკვეთის ნამრავლს: ${v.t}² = ${v.e} · x, ამიტომ x = ${g(v, 't') ** 2} ÷ ${v.e} = ${a}.`,
  }),
  num({
    sub: 'u14-10',
    prompt: 'წრეწირის გარეთ მდებარე წერტილიდან გავლებულია ორი სეკანტი. პირველი სეკანტის გარე მონაკვეთია {e1} სმ, სრული სიგრძე კი {f1} სმ. მეორე სეკანტის გარე მონაკვეთია {e2} სმ. იპოვე მეორე სეკანტის სრული სიგრძე.',
    vars: twoSec(2, 6),
    constraints: [{ test: twoSecOk, note: 'the second secant divides evenly' }],
    unit: 'სმ',
    key: (v) => g(v, 'f2'),
    slips: (v) => [g(v, 'f1') - g(v, 'e1') + g(v, 'e2'), g(v, 'e1') * g(v, 'f1'), g(v, 'f1') + g(v, 'e2'), g(v, 'f1') + g(v, 'e2') - g(v, 'e1')],
    why: (v, a) => `${v.e1} · ${v.f1} = ${v.e2} · x, ამიტომ x = ${g(v, 'e1') * g(v, 'f1')} ÷ ${v.e2} = ${a}.`,
  }),
  num({
    sub: 'u14-10',
    prompt: 'წრეწირის გარეთ მდებარე წერტილიდან გავლებული მხების სიგრძეა {t} სმ. იმავე წერტილიდან გავლებულია სეკანტი, რომლის გარე მონაკვეთია {e} სმ. იპოვე სეკანტის სრული სიგრძე.',
    vars: tanSec(),
    constraints: [{ test: tanSecOk, note: 'the secant divides evenly' }],
    unit: 'სმ',
    key: (v) => g(v, 'f'),
    slips: (v) => [g(v, 't') + g(v, 'e'), g(v, 't') * g(v, 'e'), g(v, 'f') - g(v, 'e'), g(v, 't') * 2],
    why: (v, a) => `${v.t}² = ${v.e} · x, ამიტომ x = ${g(v, 't') ** 2} ÷ ${v.e} = ${a}.`,
  }),
  num({
    sub: 'u14-10',
    prompt: 'წრეწირის გარეთ მდებარე {P} წერტილიდან გავლებულია ორი მხები. ერთი მხების სიგრძეა {t} სმ. იპოვე მეორე მხების სიგრძე.',
    vars: { t: I(3, 40), p: C(['A', 'B', 'C', 'M', 'P', 'K']), P: D((v: Vars) => String(v.p)) },
    unit: 'სმ',
    key: (v) => g(v, 't'),
    slips: (v) => [g(v, 't') * 2, g(v, 't') / 2, g(v, 't') + 2, g(v, 't') * g(v, 't')],
    why: (v, a) => `ერთი წერტილიდან გავლებული მხებების მონაკვეთები ტოლია: ${v.t} სმ = ${a}.`,
  }),
  num({
    sub: 'u14-10',
    prompt: 'წრეწირის გარეთ მდებარე წერტილიდან გავლებულია სეკანტი, რომლის გარე მონაკვეთია {e} სმ, ხოლო წრეწირის შიგნით მდებარე მონაკვეთი — {i} სმ. იპოვე იმავე წერტილიდან გავლებული მხების სიგრძე.',
    vars: { ...tanSec(), i: D((v: Vars) => g(v, 'f') - g(v, 'e')) },
    constraints: [{ test: tanSecOk, note: 'the tangent is a whole number' }],
    unit: 'სმ',
    key: (v) => g(v, 't'),
    slips: (v) => [g(v, 'e') + g(v, 'i'), g(v, 'e') * g(v, 'i'), (g(v, 'e') + g(v, 'i')) / 2, g(v, 'f') - g(v, 'e') + 1],
    why: (v, a) => `მხების კვადრატი = ${v.e} · (${v.e} + ${v.i}) = ${g(v, 'e') * g(v, 'f')}, ამიტომ მხების სიგრძეა ${a}.`,
  }),
  num({
    sub: 'u14-10',
    prompt: 'წრეწირის გარეთ მდებარე წერტილიდან გავლებულია ორი სეკანტი. პირველი სეკანტის გარე მონაკვეთია {e1} სმ, სრული სიგრძე — {f1} სმ. მეორე სეკანტის გარე მონაკვეთია {e2} სმ. იპოვე მეორე სეკანტის სრული სიგრძე.',
    vars: twoSec(2, 9),
    constraints: [{ test: twoSecOk, note: 'the second secant divides evenly' }],
    unit: 'სმ',
    key: (v) => g(v, 'f2'),
    slips: (v) => [g(v, 'f1') - g(v, 'e1') + g(v, 'e2'), g(v, 'e1') * g(v, 'f1'), g(v, 'f1') + g(v, 'e2'), g(v, 'f1') * 2],
    why: (v, a) => `${v.e1} · ${v.f1} = ${v.e2} · x, ამიტომ x = ${g(v, 'e1') * g(v, 'f1')} ÷ ${v.e2} = ${a}.`,
  }),

  // ═════════ U14.11 — წრეწირის სიგრძე და წრის ფართობი ═════════
  t({
    sub: 'u14-11',
    prompt: 'წრეწირის რადიუსია {r} სმ. იპოვე წრეწირის სიგრძე π-ს გამოყენებით.',
    vars: { r: I(2, 30) },
    answer: (v) => piText(2 * g(v, 'r'), 'სმ'),
    options: (v) => piOptions(2 * g(v, 'r'), 'სმ', [g(v, 'r'), g(v, 'r') * g(v, 'r'), g(v, 'r') + 2]),
    why: (v, a) => `C = 2πr = 2 · π · ${v.r} = ${a}.`,
  }),
  t({
    sub: 'u14-11',
    prompt: 'წრის რადიუსია {r} სმ. იპოვე წრის ფართობი π-ს გამოყენებით.',
    vars: { r: I(2, 30) },
    answer: (v) => piText(g(v, 'r') ** 2, 'სმ²'),
    options: (v) => piOptions(g(v, 'r') ** 2, 'სმ²', [2 * g(v, 'r'), g(v, 'r'), 2 * g(v, 'r') ** 2]),
    why: (v, a) => `S = πr² = π · ${v.r}² = ${a}.`,
  }),
  t({
    sub: 'u14-11',
    prompt: 'წრეწირის დიამეტრია {d} სმ. იპოვე წრეწირის სიგრძე π-ს გამოყენებით.',
    vars: { k: I(2, 30), d: D((v: Vars) => 2 * g(v, 'k')) },
    answer: (v) => piText(g(v, 'd'), 'სმ'),
    options: (v) => piOptions(g(v, 'd'), 'სმ', [g(v, 'k'), g(v, 'd') * 2, g(v, 'k') * g(v, 'k')]),
    why: (v, a) => `C = πd = π · ${v.d} = ${a}.`,
  }),
  t({
    sub: 'u14-11',
    prompt: 'წრის რადიუსია {r} სმ. იპოვე წრის ფართობი π-ს გამოყენებით.',
    vars: { r: I(2, 40) },
    answer: (v) => piText(g(v, 'r') ** 2, 'სმ²'),
    options: (v) => piOptions(g(v, 'r') ** 2, 'სმ²', [2 * g(v, 'r'), g(v, 'r'), 2 * g(v, 'r') ** 2]),
    why: (v, a) => `S = πr² = π · ${v.r}² = ${a}.`,
  }),
  num({
    sub: 'u14-11',
    prompt: 'წრეწირის სიგრძეა {k}π სმ. იპოვე რადიუსი.',
    vars: { r: I(2, 30), k: D((v: Vars) => 2 * g(v, 'r')) },
    unit: 'სმ',
    key: (v) => g(v, 'r'),
    slips: (v) => [g(v, 'k'), g(v, 'k') * 2, g(v, 'r') * g(v, 'r'), g(v, 'r') + 2],
    why: (v, a) => `2πr = ${v.k}π, ამიტომ r = ${v.k} ÷ 2 = ${a}.`,
  }),
  num({
    sub: 'u14-11',
    prompt: 'წრის ფართობია {s}π სმ². იპოვე რადიუსი.',
    vars: { r: I(2, 30), s: D((v: Vars) => g(v, 'r') ** 2) },
    unit: 'სმ',
    key: (v) => g(v, 'r'),
    slips: (v) => [g(v, 's') / 2, g(v, 's'), 2 * g(v, 'r'), g(v, 'r') + 2],
    why: (v, a) => `πr² = ${v.s}π, ამიტომ r² = ${v.s} და r = ${a}.`,
  }),

  // ═════════ U14.12 — სექტორი და სეგმენტი ═════════
  ...[
    { alphas: [90, 270], rMax: 16 },
    { alphas: [180, 90], rMax: 18 },
    { alphas: [60, 120, 240, 300], rMax: 24 },
  ].map((o) =>
    t({
      sub: 'u14-12',
      prompt: 'წრის რადიუსია {r} სმ, ხოლო სექტორის ცენტრალური კუთხეა {a}°. იპოვე სექტორის ფართობი π-ს გამოყენებით.',
      vars: { r: I(2, o.rMax), a: C(o.alphas), s: D((v: Vars) => (g(v, 'r') ** 2 * g(v, 'a')) / 360) },
      constraints: [{ test: (v: Vars) => (g(v, 'r') ** 2 * g(v, 'a')) % 360 === 0, note: 'a whole multiple of π' }],
      answer: (v) => piText(g(v, 's'), 'სმ²'),
      options: (v) => piOptions(g(v, 's'), 'სმ²', [g(v, 'r') ** 2, g(v, 'r') * g(v, 'a') / 180, g(v, 's') * 2, g(v, 's') / 2]),
      why: (v, a) => `S = πr² · ${v.a}/360 = π · ${g(v, 'r') ** 2} · ${v.a}/360 = ${a}.`,
    }),
  ),
  ...[
    { alphas: [90, 180, 60], rMax: 30 },
    { alphas: [120, 60, 90, 180, 240, 270], rMax: 30 },
  ].map((o) =>
    t({
      sub: 'u14-12',
      prompt: 'წრის რადიუსია {r} სმ, ხოლო სექტორის ცენტრალური კუთხეა {a}°. იპოვე შესაბამისი რკალის სიგრძე π-ს გამოყენებით.',
      vars: { r: I(2, o.rMax), a: C(o.alphas), l: D((v: Vars) => (g(v, 'r') * g(v, 'a')) / 180) },
      constraints: [{ test: (v: Vars) => (g(v, 'r') * g(v, 'a')) % 180 === 0, note: 'a whole multiple of π' }],
      answer: (v) => piText(g(v, 'l'), 'სმ'),
      options: (v) => piOptions(g(v, 'l'), 'სმ', [g(v, 'r') * g(v, 'a') / 360, g(v, 'r') * g(v, 'r') * g(v, 'a') / 360, g(v, 'l') * 2, g(v, 'r')]),
      why: (v, a) => `l = 2πr · ${v.a}/360 = ${a}.`,
    }),
  ),
  t({
    sub: 'u14-12',
    prompt: 'წრის რადიუსია {r} სმ, ხოლო ცენტრალური კუთხეა {a}°. იპოვე სექტორის ფართობი და წრის ფართობიდან გამოაკელი მიღებული შედეგი.',
    vars: { r: I(2, 20), a: C([60, 90, 120, 180, 240, 270, 300]), s: D((v: Vars) => (g(v, 'r') ** 2 * g(v, 'a')) / 360), rest: D((v: Vars) => g(v, 'r') ** 2 - (g(v, 'r') ** 2 * g(v, 'a')) / 360) },
    constraints: [{ test: (v: Vars) => (g(v, 'r') ** 2 * g(v, 'a')) % 360 === 0, note: 'a whole multiple of π' }],
    answer: (v) => piText(g(v, 'rest'), 'სმ²'),
    options: (v) => piOptions(g(v, 'rest'), 'სმ²', [g(v, 's'), g(v, 'r') ** 2, g(v, 'rest') * 2]),
    why: (v, a) => `სექტორი: π · ${g(v, 'r') ** 2} · ${v.a}/360 = ${v.s}π; წრე ${g(v, 'r') ** 2}π; სხვაობა ${a}.`,
  }),

  // ═════════ U14.13 — სამკუთხედში ჩახაზული და შემოხაზული წრეწირები ═════════
  ...[{ kMax: 10, kind: 'ჩახაზული' }, { kMax: 16, kind: 'ჩახაზული' }].map((o) =>
    t({
      sub: 'u14-13',
      prompt: `ტოლგვერდა სამკუთხედის გვერდია {a} სმ. იპოვე ${o.kind} წრეწირის რადიუსი ფორმულით r = a√3/6.`,
      vars: { k: I(1, o.kMax), a: D((v: Vars) => 6 * g(v, 'k')) },
      answer: (v) => `${radical(g(v, 'k'))} სმ`,
      options: (v, right) => radicalOptions(g(v, 'k'), [`${radical(2 * g(v, 'k'))} სმ`, `${radical(3 * g(v, 'k'))} სმ`, `${radical(g(v, 'k') + 1)} სმ`, `${g(v, 'a') / 2} სმ`].filter((s) => s !== right)),
      why: (v, a) => `r = a√3/6 = ${v.a}√3/6 = ${a}.`,
    }),
  ),
  t({
    sub: 'u14-13',
    prompt: 'ტოლგვერდა სამკუთხედის გვერდია {a} სმ. იპოვე შემოხაზული წრეწირის რადიუსი ფორმულით R = a√3/3.',
    vars: { k: I(1, 12), a: D((v: Vars) => 3 * g(v, 'k')) },
    answer: (v) => `${radical(g(v, 'k'))} სმ`,
    options: (v, right) => radicalOptions(g(v, 'k'), [`${g(v, 'k')}√3/2 სმ`, `${radical(3 * g(v, 'k'))} სმ`, `${radical(g(v, 'k') + 1)} სმ`, `${g(v, 'a')} სმ`].filter((s) => s !== right)),
    why: (v, a) => `R = a√3/3 = ${v.a}√3/3 = ${a}.`,
  }),
  num({
    sub: 'u14-13',
    prompt: 'სამკუთხედის ჩახაზული წრეწირის რადიუსია {r} სმ, ხოლო ფართობი — {S} სმ². იპოვე სამკუთხედის ნახევარპერიმეტრი ფორმულით S = rs.',
    vars: { r: I(2, 9), s: I(5, 30), S: D((v: Vars) => g(v, 'r') * g(v, 's')) },
    unit: 'სმ',
    key: (v) => g(v, 's'),
    slips: (v) => [g(v, 'S') * g(v, 'r'), g(v, 'S') - g(v, 'r'), g(v, 'S') + g(v, 'r'), g(v, 's') * 2],
    why: (v, a) => `S = rs, ამიტომ s = S ÷ r = ${v.S} ÷ ${v.r} = ${a}.`,
  }),
  t({
    sub: 'u14-13',
    prompt: 'მართკუთხა სამკუთხედის კათეტებია {a} სმ და {b} სმ. იპოვე ჰიპოტენუზა და შემოხაზული წრეწირის რადიუსი.',
    vars: { i: I(0, TRIPLES.length - 1), m: I(1, 4), a: D((v: Vars) => TRIPLES[g(v, 'i')]![0] * g(v, 'm')), b: D((v: Vars) => TRIPLES[g(v, 'i')]![1] * g(v, 'm')), c: D((v: Vars) => TRIPLES[g(v, 'i')]![2] * g(v, 'm')) },
    constraints: [{ test: (v: Vars) => g(v, 'c') % 2 === 0, note: 'a whole circumradius' }],
    answer: (v) => `ჰიპოტენუზა ${g(v, 'c')} სმ, რადიუსი ${g(v, 'c') / 2} სმ`,
    options: (v, right) => {
      const c = g(v, 'c');
      return textOptions(right, [`ჰიპოტენუზა ${c} სმ, რადიუსი ${c} სმ`, `ჰიპოტენუზა ${c / 2} სმ, რადიუსი ${c} სმ`, `ჰიპოტენუზა ${c} სმ, რადიუსი ${c / 2 + 1} სმ`, `ჰიპოტენუზა ${c + 2} სმ, რადიუსი ${c / 2 + 1} სმ`]);
    },
    why: (v, a) => `c = √(${v.a}² + ${v.b}²) = ${v.c} სმ; მართკუთხა სამკუთხედის შემოხაზული წრეწირის რადიუსი ჰიპოტენუზის ნახევარია. პასუხი: ${a}.`,
  }),
  num({
    sub: 'u14-13',
    prompt: 'მართკუთხა სამკუთხედის ჰიპოტენუზაა {h} სმ. იპოვე შემოხაზული წრეწირის რადიუსი.',
    vars: { r: I(2, 30), h: D((v: Vars) => 2 * g(v, 'r')) },
    unit: 'სმ',
    key: (v) => g(v, 'r'),
    slips: (v) => [g(v, 'h'), g(v, 'h') * 2, g(v, 'r') + 1, g(v, 'r') - 1],
    why: (v, a) => `მართკუთხა სამკუთხედის შემოხაზული წრეწირის ცენტრი ჰიპოტენუზის შუაწერტილია, ამიტომ R = ${v.h} ÷ 2 = ${a}.`,
  }),
];
