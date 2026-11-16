import type { QuestionTemplate, Vars } from './types';
import { C, D, I, MINUS, N, group, q6 } from './g6-helpers';
import { textOptions, unitOptions } from './g7-u08-proportion-percent';

/**
 * Grade VII — Unit 17: perimeter, area and volume.
 *
 * Converted from the academy's Grade VII `U17` bank: 10 subtopics × 6 questions.
 *
 * Figures are built from the unknown outwards (a rectangle from its sides, a
 * cone from a height divisible by three, a cylinder from a radius and height),
 * so every printed area, volume and answer is a whole number or a whole
 * multiple of π. The "equal area" tasks need an area to split evenly; those use
 * a divisibility constraint on a small range. Solid-counting questions use a
 * single table of vertices, edges and faces.
 */

export const G7_U17_SUBTOPICS = ['u17-01', 'u17-02', 'u17-03', 'u17-04', 'u17-05', 'u17-06', 'u17-07', 'u17-08', 'u17-09', 'u17-10'] as const;

const T = 'g7-area-volume';
let seq = 0;
const nextId = (): string => `g7-u17-q${String(++seq).padStart(2, '0')}`;
type Spec = Omit<Parameters<typeof q6>[0], 'id' | 'topic' | 'grade'>;
const t = (spec: Spec): QuestionTemplate => q6({ id: nextId(), topic: T, grade: 7, ...spec });

const g = (v: Vars, key: string): number => N(v, key);
const unitText = (n: number, unit: string): string => (unit ? `${group(n)} ${unit}` : group(n));
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
/** An answer that is a whole number of π. */
const piNum = (o: NumSpec): QuestionTemplate =>
  t({
    sub: o.sub,
    ...(o.d ? { d: o.d } : {}),
    prompt: o.prompt,
    vars: o.vars,
    ...(o.constraints ? { constraints: o.constraints } : {}),
    answer: (v) => piText(o.key(v), o.unit),
    options: (v) => piOptions(o.key(v), o.unit, o.slips(v)),
    why: o.why,
  });

const even = (n: number): boolean => n % 2 === 0;
const SM = 'სმ';
const SM2 = 'სმ²';
const SM3 = 'სმ³';

// ───────────────────────────── solids ─────────────────────────────

const NGON = ['', '', '', 'სამკუთხა', 'ოთხკუთხა', 'ხუთკუთხა', 'ექვსკუთხა', 'შვიდკუთხა', 'რვაკუთხა'];
interface Solid {
  name: (n: number) => string;
  gen: (n: number) => string;
  faces: (n: number) => number;
  edges: (n: number) => number;
  vertices: (n: number) => number;
  /** Pieces of the net: faces for every solid. */
  net: (n: number) => number;
}
const SOLIDS: Solid[] = [
  { name: () => 'კუბს', gen: () => 'კუბის', faces: () => 6, edges: () => 12, vertices: () => 8, net: () => 6 },
  { name: () => 'მართკუთხა პარალელეპიპედს', gen: () => 'მართკუთხა პარალელეპიპედის', faces: () => 6, edges: () => 12, vertices: () => 8, net: () => 6 },
  { name: (n) => `${NGON[n]} პრიზმას`, gen: (n) => `${NGON[n]} პრიზმის`, faces: (n) => n + 2, edges: (n) => 3 * n, vertices: (n) => 2 * n, net: (n) => n + 2 },
  { name: (n) => `${NGON[n]} პირამიდას`, gen: (n) => `${NGON[n]} პირამიდის`, faces: (n) => n + 1, edges: (n) => 2 * n, vertices: (n) => n + 1, net: (n) => n + 1 },
];

export const G7_U17_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U17.1 — ფიგურის პერიმეტრი და ფართობი ═════════
  num({
    sub: 'u17-01',
    prompt: 'მართკუთხედის სიგრძეა {l} სმ, ხოლო სიგანე — {w} სმ. იპოვე მისი პერიმეტრი.',
    vars: { l: I(6, 40), w: I(3, 30) },
    constraints: [{ test: (v: Vars) => g(v, 'l') > g(v, 'w'), note: 'length exceeds width' }],
    unit: SM,
    key: (v) => 2 * (g(v, 'l') + g(v, 'w')),
    slips: (v) => [g(v, 'l') + g(v, 'w'), g(v, 'l') * g(v, 'w'), 2 * g(v, 'l') + g(v, 'w'), 2 * g(v, 'l') * g(v, 'w')],
    why: (v, a) => `P = 2 · (${v.l} + ${v.w}) = ${a}.`,
  }),
  num({
    sub: 'u17-01',
    prompt: 'კვადრატის გვერდის სიგრძეა {a} სმ. იპოვე მისი ფართობი.',
    vars: { a: I(3, 40) },
    unit: SM2,
    key: (v) => g(v, 'a') ** 2,
    slips: (v) => [4 * g(v, 'a'), 2 * g(v, 'a'), g(v, 'a') * 3, g(v, 'a') ** 2 + g(v, 'a')],
    why: (v, a) => `S = a² = ${v.a} · ${v.a} = ${a}.`,
  }),
  num({
    sub: 'u17-01',
    prompt: 'მართკუთხედის ფართობია {S} სმ², ხოლო სიგრძე — {l} სმ. იპოვე სიგანე.',
    vars: { l: I(6, 30), w: I(3, 24), S: D((v: Vars) => g(v, 'l') * g(v, 'w')) },
    constraints: [{ test: (v: Vars) => g(v, 'l') > g(v, 'w'), note: 'length exceeds width' }],
    unit: SM,
    key: (v) => g(v, 'w'),
    slips: (v) => [g(v, 'S') - g(v, 'l'), g(v, 'S') + g(v, 'l'), g(v, 'S') / 2 / g(v, 'l'), (2 * g(v, 'S')) / g(v, 'l')],
    why: (v, a) => `w = S ÷ l = ${v.S} ÷ ${v.l} = ${a}.`,
  }),
  num({
    sub: 'u17-01',
    prompt: 'კვადრატის პერიმეტრია {P} სმ. იპოვე მისი ფართობი.',
    vars: { a: I(3, 40), P: D((v: Vars) => 4 * g(v, 'a')) },
    unit: SM2,
    key: (v) => g(v, 'a') ** 2,
    slips: (v) => [g(v, 'P') ** 2, g(v, 'P') ** 2 / 4, g(v, 'a') * 4, g(v, 'a') * 2],
    why: (v, a) => `გვერდი: ${v.P} ÷ 4 = ${v.a}, ფართობი: ${v.a}² = ${a}.`,
  }),
  t({
    sub: 'u17-01',
    prompt: 'მართკუთხედის სიგრძეა {l} სმ, ხოლო სიგანე — {w} სმ. იპოვე მისი ფართობი და პერიმეტრი.',
    vars: { l: I(6, 30), w: I(3, 24) },
    constraints: [{ test: (v: Vars) => g(v, 'l') > g(v, 'w'), note: 'length exceeds width' }],
    answer: (v) => `S = ${g(v, 'l') * g(v, 'w')} სმ², P = ${2 * (g(v, 'l') + g(v, 'w'))} სმ`,
    options: (v, right) => {
      const [l, w] = [g(v, 'l'), g(v, 'w')];
      return textOptions(right, [
        `S = ${2 * (l + w)} სმ², P = ${l * w} სმ`,
        `S = ${l * w} სმ², P = ${l + w} სმ`,
        `S = ${l + w} სმ², P = ${2 * l * w} სმ`,
        `S = ${l * w} სმ², P = ${2 * l + w} სმ`,
      ]);
    },
    why: (v, a) => `S = ${v.l} · ${v.w} = ${g(v, 'l') * g(v, 'w')}, P = 2 · (${v.l} + ${v.w}) = ${2 * (g(v, 'l') + g(v, 'w'))}. პასუხი: ${a}.`,
  }),
  num({
    sub: 'u17-01',
    prompt: 'მართკუთხედის პერიმეტრია {P} სმ, ხოლო სიგანე — {w} სმ. იპოვე მისი სიგრძე.',
    vars: { l: I(8, 40), w: I(3, 30), P: D((v: Vars) => 2 * (g(v, 'l') + g(v, 'w'))) },
    constraints: [{ test: (v: Vars) => g(v, 'l') > g(v, 'w'), note: 'length exceeds width' }],
    unit: SM,
    key: (v) => g(v, 'l'),
    slips: (v) => [g(v, 'P') / 2, g(v, 'P') - g(v, 'w'), g(v, 'P') / 2 + g(v, 'w'), g(v, 'P') - 2 * g(v, 'w') + 2],
    why: (v, a) => `P/2 = ${g(v, 'P') / 2}, ამიტომ სიგრძეა ${g(v, 'P') / 2} ${MINUS} ${v.w} = ${a}.`,
  }),

  // ═════════ U17.2 — სხვადასხვა ფიგურის ფართობი ═════════
  num({
    sub: 'u17-02',
    prompt: 'სამკუთხედის ფუძეა {b} სმ, ხოლო შესაბამისი სიმაღლე — {h} სმ. იპოვე ფართობი.',
    vars: { b: I(6, 40), h: I(4, 30) },
    constraints: [{ test: (v: Vars) => even(g(v, 'b') * g(v, 'h')), note: 'a whole area' }],
    unit: SM2,
    key: (v) => (g(v, 'b') * g(v, 'h')) / 2,
    slips: (v) => [g(v, 'b') * g(v, 'h'), g(v, 'b') + g(v, 'h'), (g(v, 'b') * g(v, 'h')) / 4, g(v, 'b') * g(v, 'h') * 2],
    why: (v, a) => `S = ½ · b · h = ½ · ${v.b} · ${v.h} = ${a}.`,
  }),
  num({
    sub: 'u17-02',
    prompt: 'პარალელოგრამის ფუძეა {b} სმ, ხოლო შესაბამისი სიმაღლე — {h} სმ. იპოვე ფართობი.',
    vars: { b: I(6, 40), h: I(4, 24) },
    unit: SM2,
    key: (v) => g(v, 'b') * g(v, 'h'),
    slips: (v) => [(g(v, 'b') * g(v, 'h')) / 2, g(v, 'b') + g(v, 'h'), 2 * (g(v, 'b') + g(v, 'h')), g(v, 'b') * g(v, 'h') * 2],
    why: (v, a) => `S = a · h = ${v.b} · ${v.h} = ${a}.`,
  }),
  num({
    sub: 'u17-02',
    prompt: 'ტრაპეციის ფუძეებია {a} სმ და {b} სმ, ხოლო სიმაღლე — {h} სმ. იპოვე ფართობი.',
    vars: { a: I(6, 20), b: I(8, 30), h: I(4, 14) },
    constraints: [{ test: (v: Vars) => even((g(v, 'a') + g(v, 'b')) * g(v, 'h')) && g(v, 'a') !== g(v, 'b'), note: 'a whole area' }],
    unit: SM2,
    key: (v) => ((g(v, 'a') + g(v, 'b')) * g(v, 'h')) / 2,
    slips: (v) => [(g(v, 'a') + g(v, 'b')) * g(v, 'h'), (g(v, 'a') * g(v, 'b') * g(v, 'h')) / 2, (g(v, 'a') + g(v, 'b')) / 2 + g(v, 'h'), ((g(v, 'a') + g(v, 'b')) * g(v, 'h')) / 4],
    why: (v, a) => `S = (a + b) · h ÷ 2 = (${v.a} + ${v.b}) · ${v.h} ÷ 2 = ${a}.`,
  }),
  num({
    sub: 'u17-02',
    prompt: 'რომბის დიაგონალებია {a} სმ და {b} სმ. იპოვე ფართობი.',
    vars: { a: I(8, 30), b: I(6, 26) },
    constraints: [{ test: (v: Vars) => even(g(v, 'a') * g(v, 'b')) && g(v, 'a') !== g(v, 'b'), note: 'a whole area' }],
    unit: SM2,
    key: (v) => (g(v, 'a') * g(v, 'b')) / 2,
    slips: (v) => [g(v, 'a') * g(v, 'b'), g(v, 'a') + g(v, 'b'), (g(v, 'a') * g(v, 'b')) / 4, 2 * (g(v, 'a') + g(v, 'b'))],
    why: (v, a) => `S = d₁ · d₂ ÷ 2 = ${v.a} · ${v.b} ÷ 2 = ${a}.`,
  }),
  piNum({
    sub: 'u17-02',
    prompt: 'წრის რადიუსია {r} სმ. იპოვე ფართობი π-ს გამოყენებით.',
    vars: { r: I(2, 24) },
    unit: SM2,
    key: (v) => g(v, 'r') ** 2,
    slips: (v) => [2 * g(v, 'r'), g(v, 'r') * 4, g(v, 'r') ** 2 * 2],
    why: (v, a) => `S = πr² = π · ${v.r}² = ${a}.`,
  }),
  num({
    sub: 'u17-02',
    prompt: 'მართკუთხა სამკუთხედის კათეტებია {a} სმ და {b} სმ. იპოვე ფართობი.',
    vars: { a: I(5, 30), b: I(4, 26) },
    constraints: [{ test: (v: Vars) => even(g(v, 'a') * g(v, 'b')) && g(v, 'a') !== g(v, 'b'), note: 'a whole area' }],
    unit: SM2,
    key: (v) => (g(v, 'a') * g(v, 'b')) / 2,
    slips: (v) => [g(v, 'a') * g(v, 'b'), g(v, 'a') + g(v, 'b'), (g(v, 'a') + g(v, 'b')) / 2, (g(v, 'a') * g(v, 'b')) / 4],
    why: (v, a) => `კათეტები ერთმანეთის მართობია: S = ½ · ${v.a} · ${v.b} = ${a}.`,
  }),

  // ═════════ U17.3 — დაშტრიხული ფიგურები ═════════
  num({
    sub: 'u17-03',
    prompt: 'კვადრატის გვერდია {a} სმ. მის შიგნით მოთავსებულია კვადრატი, რომლის გვერდია {b} სმ. იპოვე დარჩენილი ნაწილის ფართობი.',
    vars: { a: I(8, 30), b: I(3, 20) },
    constraints: [{ test: (v: Vars) => g(v, 'a') > g(v, 'b') + 1, note: 'the inner square is smaller' }],
    unit: SM2,
    key: (v) => g(v, 'a') ** 2 - g(v, 'b') ** 2,
    slips: (v) => [(g(v, 'a') - g(v, 'b')) ** 2, g(v, 'a') ** 2 + g(v, 'b') ** 2, g(v, 'a') ** 2 - g(v, 'b'), (g(v, 'a') - g(v, 'b')) * 2],
    why: (v, a) => `S = ${v.a}² ${MINUS} ${v.b}² = ${g(v, 'a') ** 2} ${MINUS} ${g(v, 'b') ** 2} = ${a}.`,
  }),
  num({
    sub: 'u17-03',
    prompt: 'მართკუთხედის ზომებია {l} სმ და {w} სმ. მის შიგნით არის კვადრატი, რომლის გვერდია {s} სმ. იპოვე მართკუთხედის იმ ნაწილის ფართობი, რომელიც კვადრატს არ უკავია.',
    vars: { l: I(10, 30), w: I(6, 20), s: I(2, 5) },
    constraints: [{ test: (v: Vars) => g(v, 'l') > g(v, 'w'), note: 'length exceeds width' }],
    unit: SM2,
    key: (v) => g(v, 'l') * g(v, 'w') - g(v, 's') ** 2,
    slips: (v) => [g(v, 'l') * g(v, 'w') + g(v, 's') ** 2, g(v, 'l') * g(v, 'w') - g(v, 's'), g(v, 'l') * g(v, 'w') - 4 * g(v, 's'), (g(v, 'l') - g(v, 's')) * (g(v, 'w') - g(v, 's'))],
    why: (v, a) => `S = ${v.l} · ${v.w} ${MINUS} ${v.s}² = ${g(v, 'l') * g(v, 'w')} ${MINUS} ${g(v, 's') ** 2} = ${a}.`,
  }),
  num({
    sub: 'u17-03',
    prompt: 'კვადრატის გვერდია {a} სმ. მის შიგნით ამოჭრილია კვადრატი, რომლის გვერდია {b} სმ. იპოვე დარჩენილი ფიგურის ფართობი.',
    vars: { a: I(10, 30), b: I(3, 18) },
    constraints: [{ test: (v: Vars) => g(v, 'a') > g(v, 'b') + 2, note: 'the cut-out is smaller' }],
    unit: SM2,
    key: (v) => g(v, 'a') ** 2 - g(v, 'b') ** 2,
    slips: (v) => [(g(v, 'a') - g(v, 'b')) ** 2, g(v, 'a') ** 2 + g(v, 'b') ** 2, 4 * (g(v, 'a') - g(v, 'b')), g(v, 'a') ** 2 - 2 * g(v, 'b')],
    why: (v, a) => `S = ${v.a}² ${MINUS} ${v.b}² = ${g(v, 'a') ** 2} ${MINUS} ${g(v, 'b') ** 2} = ${a}.`,
  }),
  num({
    sub: 'u17-03',
    prompt: 'მართკუთხედის სიგრძეა {l} სმ, სიგანე — {w} სმ. მისგან ამოჭრილია მართკუთხედი ზომებით {p} სმ და {q} სმ. იპოვე დარჩენილი ნაწილის ფართობი.',
    vars: { l: I(12, 30), w: I(8, 20), p: I(3, 8), q: I(2, 7) },
    constraints: [{ test: (v: Vars) => g(v, 'l') > g(v, 'w') && g(v, 'p') !== g(v, 'q'), note: 'sizes that fit' }],
    unit: SM2,
    key: (v) => g(v, 'l') * g(v, 'w') - g(v, 'p') * g(v, 'q'),
    slips: (v) => [g(v, 'l') * g(v, 'w') + g(v, 'p') * g(v, 'q'), (g(v, 'l') - g(v, 'p')) * (g(v, 'w') - g(v, 'q')), g(v, 'l') * g(v, 'w') - g(v, 'p') - g(v, 'q'), 2 * (g(v, 'l') + g(v, 'w')) - 2 * (g(v, 'p') + g(v, 'q'))],
    why: (v, a) => `S = ${v.l} · ${v.w} ${MINUS} ${v.p} · ${v.q} = ${g(v, 'l') * g(v, 'w')} ${MINUS} ${g(v, 'p') * g(v, 'q')} = ${a}.`,
  }),
  num({
    sub: 'u17-03',
    prompt: 'დიდი კვადრატის გვერდია {a} სმ, ხოლო პატარა კვადრატის გვერდია {b} სმ. პატარა კვადრატი მთლიანად მოთავსებულია დიდი კვადრატის შიგნით. იპოვე დიდი კვადრატის იმ ნაწილის ფართობი, რომელიც პატარა კვადრატს არ უკავია.',
    vars: { a: I(8, 30), b: I(3, 20) },
    constraints: [{ test: (v: Vars) => g(v, 'a') > g(v, 'b') + 1, note: 'the small square is smaller' }],
    unit: SM2,
    key: (v) => g(v, 'a') ** 2 - g(v, 'b') ** 2,
    slips: (v) => [(g(v, 'a') - g(v, 'b')) ** 2, g(v, 'a') ** 2 + g(v, 'b') ** 2, g(v, 'a') - g(v, 'b'), 4 * g(v, 'a') - 4 * g(v, 'b')],
    why: (v, a) => `S = ${v.a}² ${MINUS} ${v.b}² = ${g(v, 'a') ** 2} ${MINUS} ${g(v, 'b') ** 2} = ${a}.`,
  }),
  num({
    sub: 'u17-03',
    prompt: 'მართკუთხედის ზომებია {l} სმ და {w} სმ. მისგან ამოჭრილია სამკუთხედი, რომლის ფუძეა {b} სმ, ხოლო შესაბამისი სიმაღლე — {h} სმ. იპოვე დარჩენილი ნაწილის ფართობი.',
    vars: { l: I(12, 30), w: I(8, 20), b: I(4, 12), h: I(3, 8) },
    constraints: [{ test: (v: Vars) => g(v, 'l') > g(v, 'w') && even(g(v, 'b') * g(v, 'h')), note: 'a whole triangle area' }],
    unit: SM2,
    key: (v) => g(v, 'l') * g(v, 'w') - (g(v, 'b') * g(v, 'h')) / 2,
    slips: (v) => [g(v, 'l') * g(v, 'w') - g(v, 'b') * g(v, 'h'), g(v, 'l') * g(v, 'w') + (g(v, 'b') * g(v, 'h')) / 2, g(v, 'l') * g(v, 'w') - g(v, 'b') - g(v, 'h'), (g(v, 'b') * g(v, 'h')) / 2],
    why: (v, a) => `S = ${v.l} · ${v.w} ${MINUS} ½ · ${v.b} · ${v.h} = ${g(v, 'l') * g(v, 'w')} ${MINUS} ${(g(v, 'b') * g(v, 'h')) / 2} = ${a}.`,
  }),

  // ═════════ U17.4 — მრავალკუთხედის ფართობი ═════════
  num({
    sub: 'u17-04',
    prompt: 'ხუთკუთხედი დაყოფილია სამ სამკუთხედად, რომელთა ფართობებია {a} სმ², {b} სმ² და {c} სმ². იპოვე ხუთკუთხედის ფართობი.',
    vars: { a: I(8, 30), b: I(10, 36), c: I(12, 40) },
    constraints: [{ test: (v: Vars) => g(v, 'a') < g(v, 'b') && g(v, 'b') < g(v, 'c'), note: 'three different areas' }],
    unit: SM2,
    key: (v) => g(v, 'a') + g(v, 'b') + g(v, 'c'),
    slips: (v) => [g(v, 'a') + g(v, 'b'), g(v, 'a') * g(v, 'b') * g(v, 'c'), g(v, 'c') + g(v, 'b') - g(v, 'a'), (g(v, 'a') + g(v, 'b') + g(v, 'c')) / 2],
    why: (v, a) => `${v.a} + ${v.b} + ${v.c} = ${a}.`,
  }),
  num({
    sub: 'u17-04',
    prompt: 'მრავალკუთხედი შედგება ორი მართკუთხედისგან. პირველი მართკუთხედის ზომებია {a} სმ და {b} სმ, ხოლო მეორის — {c} სმ და {e} სმ. ისინი ერთმანეთს არ ფარავს. იპოვე საერთო ფიგურის ფართობი.',
    vars: { a: I(6, 14), b: I(4, 10), c: I(3, 8), e: I(2, 6) },
    constraints: [{ test: (v: Vars) => g(v, 'a') > g(v, 'b') && g(v, 'c') > g(v, 'e'), note: 'length over width' }],
    unit: SM2,
    key: (v) => g(v, 'a') * g(v, 'b') + g(v, 'c') * g(v, 'e'),
    slips: (v) => [g(v, 'a') * g(v, 'b') - g(v, 'c') * g(v, 'e'), (g(v, 'a') + g(v, 'c')) * (g(v, 'b') + g(v, 'e')), g(v, 'a') + g(v, 'b') + g(v, 'c') + g(v, 'e'), 2 * (g(v, 'a') + g(v, 'b') + g(v, 'c') + g(v, 'e'))],
    why: (v, a) => `${v.a} · ${v.b} + ${v.c} · ${v.e} = ${g(v, 'a') * g(v, 'b')} + ${g(v, 'c') * g(v, 'e')} = ${a}.`,
  }),
  num({
    sub: 'u17-04',
    prompt: 'ფიგურა შედგება მართკუთხედისა და სამკუთხედისგან. მართკუთხედის ზომებია {l} სმ და {w} სმ, ხოლო სამკუთხედის ფუძეა {l} სმ და სიმაღლე — {h} სმ. იპოვე საერთო ფართობი.',
    vars: { l: I(6, 20), w: I(4, 12), h: I(3, 10) },
    constraints: [{ test: (v: Vars) => even(g(v, 'l') * g(v, 'h')) && g(v, 'l') > g(v, 'w'), note: 'a whole triangle area' }],
    unit: SM2,
    key: (v) => g(v, 'l') * g(v, 'w') + (g(v, 'l') * g(v, 'h')) / 2,
    slips: (v) => [g(v, 'l') * g(v, 'w') + g(v, 'l') * g(v, 'h'), g(v, 'l') * g(v, 'w') - (g(v, 'l') * g(v, 'h')) / 2, g(v, 'l') * (g(v, 'w') + g(v, 'h')) + 2, (g(v, 'l') * g(v, 'h')) / 2],
    why: (v, a) => `${v.l} · ${v.w} + ½ · ${v.l} · ${v.h} = ${g(v, 'l') * g(v, 'w')} + ${(g(v, 'l') * g(v, 'h')) / 2} = ${a}.`,
  }),
  num({
    sub: 'u17-04',
    prompt: 'L-ის ფორმის ფიგურა მიიღება {l} სმ × {w} სმ მართკუთხედიდან {p} სმ × {q} სმ მართკუთხედის ამოჭრით. იპოვე დარჩენილი ფიგურის ფართობი.',
    vars: { l: I(10, 24), w: I(8, 16), p: I(3, 7), q: I(2, 6) },
    constraints: [{ test: (v: Vars) => g(v, 'l') > g(v, 'w') && g(v, 'p') !== g(v, 'q'), note: 'sizes that fit' }],
    unit: SM2,
    key: (v) => g(v, 'l') * g(v, 'w') - g(v, 'p') * g(v, 'q'),
    slips: (v) => [g(v, 'l') * g(v, 'w') + g(v, 'p') * g(v, 'q'), (g(v, 'l') - g(v, 'p')) * (g(v, 'w') - g(v, 'q')), g(v, 'l') * g(v, 'w') - g(v, 'p') - g(v, 'q'), g(v, 'l') * g(v, 'w') - 2 * g(v, 'p') * g(v, 'q')],
    why: (v, a) => `S = ${v.l} · ${v.w} ${MINUS} ${v.p} · ${v.q} = ${g(v, 'l') * g(v, 'w')} ${MINUS} ${g(v, 'p') * g(v, 'q')} = ${a}.`,
  }),
  num({
    sub: 'u17-04',
    prompt: 'მრავალკუთხედი შედგება სამი ერთმანეთის გადაუფარავი მართკუთხედისგან, რომელთა ფართობებია {a} სმ², {b} სმ² და {c} სმ². იპოვე მრავალკუთხედის ფართობი.',
    vars: { a: I(12, 40), b: I(14, 44), c: I(10, 36) },
    constraints: [{ test: (v: Vars) => g(v, 'a') !== g(v, 'b') && g(v, 'b') !== g(v, 'c') && g(v, 'a') !== g(v, 'c'), note: 'three different areas' }],
    unit: SM2,
    key: (v) => g(v, 'a') + g(v, 'b') + g(v, 'c'),
    slips: (v) => [g(v, 'a') + g(v, 'b'), g(v, 'a') + g(v, 'b') - g(v, 'c'), g(v, 'a') * g(v, 'b') * g(v, 'c'), (g(v, 'a') + g(v, 'b') + g(v, 'c')) / 2],
    why: (v, a) => `${v.a} + ${v.b} + ${v.c} = ${a}.`,
  }),
  num({
    sub: 'u17-04',
    prompt: 'ფიგურა შედგება კვადრატისა და მართკუთხედისგან, რომელთა შიდა ნაწილები არ იფარება. კვადრატის გვერდია {s} სმ, ხოლო მართკუთხედის ზომებია {l} სმ და {w} სმ. იპოვე საერთო ფართობი.',
    vars: { s: I(3, 12), l: I(6, 16), w: I(2, 8) },
    constraints: [{ test: (v: Vars) => g(v, 'l') > g(v, 'w'), note: 'length over width' }],
    unit: SM2,
    key: (v) => g(v, 's') ** 2 + g(v, 'l') * g(v, 'w'),
    slips: (v) => [g(v, 's') ** 2 - g(v, 'l') * g(v, 'w'), 4 * g(v, 's') + 2 * (g(v, 'l') + g(v, 'w')), g(v, 's') + g(v, 'l') * g(v, 'w'), (g(v, 's') + g(v, 'l')) * (g(v, 's') + g(v, 'w'))],
    why: (v, a) => `${v.s}² + ${v.l} · ${v.w} = ${g(v, 's') ** 2} + ${g(v, 'l') * g(v, 'w')} = ${a}.`,
  }),

  // ═════════ U17.5 — ტოლფართობიანი ფიგურები ═════════
  num({
    sub: 'u17-05',
    prompt: 'კვადრატის გვერდია {s} სმ. იპოვე მართკუთხედის სიგრძე, თუ მისი სიგანეა {w} სმ და მისი ფართობი კვადრატის ფართობის ტოლია.',
    vars: { s: I(4, 24), w: I(2, 16) },
    constraints: [{ test: (v: Vars) => (g(v, 's') ** 2) % g(v, 'w') === 0 && g(v, 's') ** 2 / g(v, 'w') !== g(v, 's'), note: 'a whole length different from the side' }],
    unit: SM,
    key: (v) => g(v, 's') ** 2 / g(v, 'w'),
    slips: (v) => [g(v, 's') * 4 / g(v, 'w'), g(v, 's') ** 2 / g(v, 'w') + g(v, 'w'), g(v, 's') ** 2 - g(v, 'w'), g(v, 's')],
    why: (v, a) => `კვადრატის ფართობია ${v.s}² = ${g(v, 's') ** 2}. სიგრძე: ${g(v, 's') ** 2} ÷ ${v.w} = ${a}.`,
  }),
  num({
    sub: 'u17-05',
    prompt: 'მართკუთხედის ზომებია {a} სმ და {b} სმ. იპოვე კვადრატის გვერდი, თუ მისი ფართობი მართკუთხედის ფართობის ტოლია.',
    vars: { s: I(4, 24), a: I(2, 16), b: D((v: Vars) => g(v, 's') ** 2 / g(v, 'a')) },
    constraints: [{ test: (v: Vars) => (g(v, 's') ** 2) % g(v, 'a') === 0 && g(v, 's') !== g(v, 'a') && g(v, 's') ** 2 / g(v, 'a') !== g(v, 's'), note: 'a rectangle with a square-number area' }],
    unit: SM,
    key: (v) => g(v, 's'),
    slips: (v) => [(g(v, 'a') + g(v, 'b')) / 2 + 1, g(v, 'a') * g(v, 'b'), g(v, 'a') + g(v, 'b'), (g(v, 'a') * g(v, 'b')) / 4],
    why: (v, a) => `მართკუთხედის ფართობია ${v.a} · ${v.b} = ${g(v, 'a') * g(v, 'b')}. კვადრატის გვერდი ${a}, რადგან ${a}² = ${g(v, 's') ** 2}.`,
  }),
  num({
    sub: 'u17-05',
    prompt: 'სამკუთხედის ფუძეა {b} სმ, ხოლო სიმაღლე — {h} სმ. იპოვე პარალელოგრამის სიმაღლე, თუ მისი ფუძეა {c} სმ და მისი ფართობი სამკუთხედის ფართობის ტოლია.',
    vars: { b: I(6, 30), h: I(4, 20), c: I(3, 16) },
    constraints: [{ test: (v: Vars) => even(g(v, 'b') * g(v, 'h')) && ((g(v, 'b') * g(v, 'h')) / 2) % g(v, 'c') === 0 && (g(v, 'b') * g(v, 'h')) / 2 / g(v, 'c') !== g(v, 'h'), note: 'a whole height' }],
    unit: SM,
    key: (v) => (g(v, 'b') * g(v, 'h')) / 2 / g(v, 'c'),
    slips: (v) => [(g(v, 'b') * g(v, 'h')) / g(v, 'c'), (g(v, 'b') * g(v, 'h')) / 2, g(v, 'h'), (g(v, 'b') * g(v, 'h')) / 4 / g(v, 'c')],
    why: (v, a) => `სამკუთხედის ფართობია ½ · ${v.b} · ${v.h} = ${(g(v, 'b') * g(v, 'h')) / 2}. პარალელოგრამის სიმაღლე: ${(g(v, 'b') * g(v, 'h')) / 2} ÷ ${v.c} = ${a}.`,
  }),
  num({
    sub: 'u17-05',
    prompt: 'კვადრატის ფართობია {S} სმ². იპოვე მართკუთხედის სიგანე, თუ მისი სიგრძეა {l} სმ და ფართობი კვადრატის ფართობის ტოლია.',
    vars: { s: I(6, 30), l: I(4, 40), S: D((v: Vars) => g(v, 's') ** 2) },
    constraints: [{ test: (v: Vars) => (g(v, 's') ** 2) % g(v, 'l') === 0 && g(v, 's') ** 2 / g(v, 'l') !== g(v, 's'), note: 'a whole width' }],
    unit: SM,
    key: (v) => g(v, 'S') / g(v, 'l'),
    slips: (v) => [g(v, 's'), g(v, 'S') - g(v, 'l'), g(v, 'S') / g(v, 'l') + g(v, 'l'), g(v, 'S') / (2 * g(v, 'l'))],
    why: (v, a) => `${v.S} ÷ ${v.l} = ${a}.`,
  }),
  num({
    sub: 'u17-05',
    prompt: 'პარალელოგრამის ფუძეა {b} სმ, ხოლო სიმაღლე — {h} სმ. იპოვე სამკუთხედის სიმაღლე, თუ მისი ფუძეა {c} სმ და ფართობი პარალელოგრამის ფართობის ტოლია.',
    vars: { b: I(4, 24), h: I(3, 16), c: I(3, 24) },
    constraints: [{ test: (v: Vars) => ((2 * g(v, 'b') * g(v, 'h')) % g(v, 'c') === 0) && (2 * g(v, 'b') * g(v, 'h')) / g(v, 'c') !== g(v, 'h'), note: 'a whole height' }],
    unit: SM,
    key: (v) => (2 * g(v, 'b') * g(v, 'h')) / g(v, 'c'),
    slips: (v) => [(g(v, 'b') * g(v, 'h')) / g(v, 'c'), g(v, 'b') * g(v, 'h'), (4 * g(v, 'b') * g(v, 'h')) / g(v, 'c'), g(v, 'h')],
    why: (v, a) => `პარალელოგრამის ფართობია ${v.b} · ${v.h} = ${g(v, 'b') * g(v, 'h')}. სამკუთხედის ფართობი ½ · ${v.c} · h = ${g(v, 'b') * g(v, 'h')}, ამიტომ h = 2 · ${g(v, 'b') * g(v, 'h')} ÷ ${v.c} = ${a}.`,
  }),
  num({
    sub: 'u17-05',
    prompt: 'ტრაპეციის ფუძეებია {a} სმ და {b} სმ, ხოლო სიმაღლე — {h} სმ. იპოვე მართკუთხედის სიგრძე, თუ მისი სიგანეა {w} სმ და ფართობი ტრაპეციის ფართობის ტოლია.',
    vars: { a: I(6, 16), b: I(8, 20), h: I(3, 12), w: I(3, 12) },
    constraints: [{ test: (v: Vars) => g(v, 'a') !== g(v, 'b') && even((g(v, 'a') + g(v, 'b')) * g(v, 'h')) && (((g(v, 'a') + g(v, 'b')) * g(v, 'h')) / 2) % g(v, 'w') === 0 && ((g(v, 'a') + g(v, 'b')) * g(v, 'h')) / 2 / g(v, 'w') !== g(v, 'h'), note: 'a whole length' }],
    unit: SM,
    key: (v) => ((g(v, 'a') + g(v, 'b')) * g(v, 'h')) / 2 / g(v, 'w'),
    slips: (v) => [((g(v, 'a') + g(v, 'b')) * g(v, 'h')) / g(v, 'w'), ((g(v, 'a') + g(v, 'b')) * g(v, 'h')) / 2, g(v, 'h'), ((g(v, 'a') + g(v, 'b')) * g(v, 'h')) / 4 / g(v, 'w')],
    why: (v, a) => `ტრაპეციის ფართობია (${v.a} + ${v.b}) · ${v.h} ÷ 2 = ${((g(v, 'a') + g(v, 'b')) * g(v, 'h')) / 2}. სიგრძე: ${((g(v, 'a') + g(v, 'b')) * g(v, 'h')) / 2} ÷ ${v.w} = ${a}.`,
  }),

  // ═════════ U17.6 — სივრცული სხეულები და მათი შლილები ═════════
  num({
    sub: 'u17-06',
    prompt: 'რამდენი წახნაგი აქვს {name}?',
    vars: { si: I(0, 3), n: I(3, 8), name: D((v: Vars) => SOLIDS[g(v, 'si')]!.name(g(v, 'n'))) },
    unit: '',
    key: (v) => SOLIDS[g(v, 'si')]!.faces(g(v, 'n')),
    slips: (v) => [SOLIDS[g(v, 'si')]!.edges(g(v, 'n')), SOLIDS[g(v, 'si')]!.vertices(g(v, 'n')), SOLIDS[g(v, 'si')]!.faces(g(v, 'n')) + 1, SOLIDS[g(v, 'si')]!.faces(g(v, 'n')) - 1, g(v, 'n')],
    why: (v, a) => `${v.name} ${a} წახნაგი აქვს.`,
  }),
  num({
    sub: 'u17-06',
    prompt: 'რამდენი წიბო აქვს {name}?',
    vars: { si: I(0, 3), n: I(3, 8), name: D((v: Vars) => SOLIDS[g(v, 'si')]!.name(g(v, 'n'))) },
    unit: '',
    key: (v) => SOLIDS[g(v, 'si')]!.edges(g(v, 'n')),
    slips: (v) => [SOLIDS[g(v, 'si')]!.faces(g(v, 'n')), SOLIDS[g(v, 'si')]!.vertices(g(v, 'n')), SOLIDS[g(v, 'si')]!.edges(g(v, 'n')) + 1, SOLIDS[g(v, 'si')]!.edges(g(v, 'n')) - 1, g(v, 'n')],
    why: (v, a) => `${v.name} ${a} წიბო აქვს.`,
  }),
  num({
    sub: 'u17-06',
    prompt: 'რამდენი წვერო აქვს {name}?',
    vars: { si: I(0, 3), n: I(3, 8), name: D((v: Vars) => SOLIDS[g(v, 'si')]!.name(g(v, 'n'))) },
    unit: '',
    key: (v) => SOLIDS[g(v, 'si')]!.vertices(g(v, 'n')),
    slips: (v) => [SOLIDS[g(v, 'si')]!.edges(g(v, 'n')), SOLIDS[g(v, 'si')]!.faces(g(v, 'n')), SOLIDS[g(v, 'si')]!.vertices(g(v, 'n')) + 1, SOLIDS[g(v, 'si')]!.vertices(g(v, 'n')) - 1, g(v, 'n')],
    why: (v, a) => `${v.name} ${a} წვერო აქვს.`,
  }),
  num({
    sub: 'u17-06',
    prompt: '{name} შლილი შედგება რამდენი ნაწილისგან (წახნაგისგან)?',
    vars: { si: I(0, 3), n: I(3, 8), name: D((v: Vars) => SOLIDS[g(v, 'si')]!.gen(g(v, 'n'))) },
    unit: '',
    key: (v) => SOLIDS[g(v, 'si')]!.net(g(v, 'n')),
    slips: (v) => [SOLIDS[g(v, 'si')]!.edges(g(v, 'n')), SOLIDS[g(v, 'si')]!.vertices(g(v, 'n')), SOLIDS[g(v, 'si')]!.net(g(v, 'n')) + 1, SOLIDS[g(v, 'si')]!.net(g(v, 'n')) - 1, g(v, 'n')],
    why: (_v, a) => `შლილი შედგება ყველა წახნაგისგან — ${a} ნაწილისგან.`,
  }),
  num({
    sub: 'u17-06',
    prompt: 'რამდენი გვერდითი წახნაგი აქვს {kind} {what}?',
    vars: { n: I(3, 8), w: C([0, 1]), kind: D((v: Vars) => NGON[g(v, 'n')]!), what: D((v: Vars) => (g(v, 'w') ? 'პირამიდას' : 'პრიზმას')), wg: D((v: Vars) => (g(v, 'w') ? 'პირამიდის' : 'პრიზმის')) },
    unit: '',
    key: (v) => g(v, 'n'),
    slips: (v) => [g(v, 'n') + 1, g(v, 'n') + 2, g(v, 'n') - 1, 2 * g(v, 'n')],
    why: (v, a) => `${v.kind} ${v.wg} საფუძველს ${a} გვერდი აქვს, ამიტომ გვერდითი წახნაგიც ${a} აქვს.`,
  }),
  num({
    sub: 'u17-06',
    prompt: '{ask}, თუ მის საფუძველს {n} გვერდი აქვს?',
    vars: {
      n: I(3, 8),
      w: I(0, 1),
      ask: D((v: Vars) => [`რამდენი წახნაგი აქვს ${NGON[g(v, 'n')]} პირამიდას`, `რამდენი წახნაგისგან შედგება ${NGON[g(v, 'n')]} პირამიდა`][g(v, 'w')]!),
    },
    unit: '',
    key: (v) => g(v, 'n') + 1,
    slips: (v) => [g(v, 'n'), g(v, 'n') + 2, 2 * g(v, 'n'), g(v, 'n') - 1],
    why: (v, a) => `${v.n} გვერდითი წახნაგი და 1 საფუძველი: ${v.n} + 1 = ${a}.`,
  }),

  // ═════════ U17.7 — მართკუთხა პარალელეპიპედის მოცულობა და ზედაპირის ფართობი ═════════
  num({
    sub: 'u17-07',
    prompt: 'მართკუთხა პარალელეპიპედის სიგრძეა {l} სმ, სიგანე — {w} სმ, სიმაღლე — {h} სმ. იპოვე მოცულობა.',
    vars: { l: I(5, 20), w: I(3, 12), h: I(2, 10) },
    constraints: [{ test: (v: Vars) => g(v, 'l') > g(v, 'w') && g(v, 'w') > g(v, 'h'), note: 'three different dimensions' }],
    unit: SM3,
    key: (v) => g(v, 'l') * g(v, 'w') * g(v, 'h'),
    slips: (v) => [g(v, 'l') + g(v, 'w') + g(v, 'h'), 2 * (g(v, 'l') * g(v, 'w') + g(v, 'w') * g(v, 'h') + g(v, 'l') * g(v, 'h')), g(v, 'l') * g(v, 'w'), g(v, 'l') * g(v, 'w') * g(v, 'h') / 2],
    why: (v, a) => `V = l · w · h = ${v.l} · ${v.w} · ${v.h} = ${a}.`,
  }),
  num({
    sub: 'u17-07',
    prompt: 'კუბის წიბოს სიგრძეა {a} სმ. იპოვე მისი მოცულობა.',
    vars: { a: I(2, 14) },
    unit: SM3,
    key: (v) => g(v, 'a') ** 3,
    slips: (v) => [3 * g(v, 'a'), g(v, 'a') ** 2, 6 * g(v, 'a') ** 2, g(v, 'a') * 6],
    why: (v, a) => `V = a³ = ${v.a} · ${v.a} · ${v.a} = ${a}.`,
  }),
  num({
    sub: 'u17-07',
    prompt: 'მართკუთხა პარალელეპიპედის ზომებია {l} სმ, {w} სმ და {h} სმ. იპოვე სრული ზედაპირის ფართობი.',
    vars: { l: I(5, 20), w: I(3, 12), h: I(2, 10) },
    constraints: [{ test: (v: Vars) => g(v, 'l') > g(v, 'w') && g(v, 'w') > g(v, 'h'), note: 'three different dimensions' }],
    unit: SM2,
    key: (v) => 2 * (g(v, 'l') * g(v, 'w') + g(v, 'w') * g(v, 'h') + g(v, 'l') * g(v, 'h')),
    slips: (v) => [g(v, 'l') * g(v, 'w') + g(v, 'w') * g(v, 'h') + g(v, 'l') * g(v, 'h'), g(v, 'l') * g(v, 'w') * g(v, 'h'), 2 * (g(v, 'l') * g(v, 'w') + g(v, 'w') * g(v, 'h')), 4 * (g(v, 'l') + g(v, 'w') + g(v, 'h'))],
    why: (v, a) => `S = 2 · (lw + wh + lh) = 2 · (${g(v, 'l') * g(v, 'w')} + ${g(v, 'w') * g(v, 'h')} + ${g(v, 'l') * g(v, 'h')}) = ${a}.`,
  }),
  num({
    sub: 'u17-07',
    prompt: 'კუბის წიბოს სიგრძეა {a} სმ. იპოვე სრული ზედაპირის ფართობი.',
    vars: { a: I(2, 14) },
    unit: SM2,
    key: (v) => 6 * g(v, 'a') ** 2,
    slips: (v) => [g(v, 'a') ** 2, 4 * g(v, 'a') ** 2, g(v, 'a') ** 3, 12 * g(v, 'a')],
    why: (v, a) => `კუბს 6 ტოლი წახნაგი აქვს: S = 6 · ${v.a}² = ${a}.`,
  }),
  num({
    sub: 'u17-07',
    prompt: 'მართკუთხა პარალელეპიპედის მოცულობაა {V} სმ³. მისი სიგრძეა {l} სმ, სიგანე — {w} სმ. იპოვე სიმაღლე.',
    vars: { l: I(5, 16), w: I(3, 10), h: I(2, 12), V: D((v: Vars) => g(v, 'l') * g(v, 'w') * g(v, 'h')) },
    constraints: [{ test: (v: Vars) => g(v, 'l') > g(v, 'w') && g(v, 'V') < 1000, note: 'a modest volume' }],
    unit: SM,
    key: (v) => g(v, 'h'),
    slips: (v) => [g(v, 'V') - g(v, 'l') - g(v, 'w'), g(v, 'V') / g(v, 'l'), (2 * g(v, 'V')) / (g(v, 'l') * g(v, 'w')), g(v, 'h') + 2],
    why: (v, a) => `h = V ÷ (l · w) = ${v.V} ÷ (${v.l} · ${v.w}) = ${a}.`,
  }),
  num({
    sub: 'u17-07',
    prompt: 'მართკუთხა პარალელეპიპედის ზომებია {l} სმ, {w} სმ და {h} სმ. იპოვე სრული ზედაპირის ფართობი.',
    vars: { l: I(6, 24), w: I(3, 12), h: I(2, 8) },
    constraints: [{ test: (v: Vars) => g(v, 'l') > g(v, 'w') && g(v, 'w') > g(v, 'h'), note: 'three different dimensions' }],
    unit: SM2,
    key: (v) => 2 * (g(v, 'l') * g(v, 'w') + g(v, 'w') * g(v, 'h') + g(v, 'l') * g(v, 'h')),
    slips: (v) => [g(v, 'l') * g(v, 'w') + g(v, 'w') * g(v, 'h') + g(v, 'l') * g(v, 'h'), g(v, 'l') * g(v, 'w') * g(v, 'h'), 2 * (g(v, 'l') * g(v, 'w') + g(v, 'l') * g(v, 'h')), 4 * (g(v, 'l') + g(v, 'w') + g(v, 'h'))],
    why: (v, a) => `S = 2 · (${v.l} · ${v.w} + ${v.w} · ${v.h} + ${v.l} · ${v.h}) = ${a}.`,
  }),

  // ═════════ U17.8 — პრიზმის მოცულობა და ზედაპირის ფართობი ═════════
  ...[{ lo: 10, hi: 40, hl: 4, hh: 12, p: 'პრიზმის საფუძვლის ფართობია {B} სმ², ხოლო სიმაღლე — {h} სმ. იპოვე მოცულობა.' }, { lo: 12, hi: 60, hl: 5, hh: 14, p: 'სამკუთხა პრიზმის საფუძვლის ფართობია {B} სმ², ხოლო სიგრძე — {h} სმ. იპოვე მოცულობა.' }].map((o) =>
    num({
      sub: 'u17-08',
      prompt: o.p,
      vars: { B: I(o.lo, o.hi), h: I(o.hl, o.hh) },
      unit: SM3,
      key: (v) => g(v, 'B') * g(v, 'h'),
      slips: (v) => [g(v, 'B') + g(v, 'h'), (g(v, 'B') * g(v, 'h')) / 3, 2 * (g(v, 'B') + g(v, 'h')), g(v, 'B') * g(v, 'h') * 2],
      why: (v, a) => `V = S_საფ · h = ${v.B} · ${v.h} = ${a}.`,
    }),
  ),
  num({
    sub: 'u17-08',
    prompt: 'მართკუთხა პრიზმის საფუძველია მართკუთხედი ზომებით {a} სმ და {b} სმ. პრიზმის სიმაღლეა {h} სმ. იპოვე მოცულობა.',
    vars: { a: I(4, 16), b: I(3, 12), h: I(3, 14) },
    constraints: [{ test: (v: Vars) => g(v, 'a') > g(v, 'b'), note: 'length over width' }],
    unit: SM3,
    key: (v) => g(v, 'a') * g(v, 'b') * g(v, 'h'),
    slips: (v) => [g(v, 'a') * g(v, 'b') + g(v, 'h'), g(v, 'a') + g(v, 'b') + g(v, 'h'), 2 * g(v, 'a') * g(v, 'b') * g(v, 'h'), (g(v, 'a') * g(v, 'b') * g(v, 'h')) / 3],
    why: (v, a) => `საფუძვლის ფართობია ${v.a} · ${v.b} = ${g(v, 'a') * g(v, 'b')}. V = ${g(v, 'a') * g(v, 'b')} · ${v.h} = ${a}.`,
  }),
  num({
    sub: 'u17-08',
    prompt: 'პრიზმის მოცულობაა {V} სმ³, ხოლო საფუძვლის ფართობი — {B} სმ². იპოვე სიმაღლე.',
    vars: { B: I(10, 50), h: I(3, 16), V: D((v: Vars) => g(v, 'B') * g(v, 'h')) },
    constraints: [{ test: (v: Vars) => g(v, 'V') < 1000, note: 'a modest volume' }],
    unit: SM,
    key: (v) => g(v, 'h'),
    slips: (v) => [g(v, 'V') - g(v, 'B'), g(v, 'V') / g(v, 'B') + 2, (2 * g(v, 'V')) / g(v, 'B'), g(v, 'B') / g(v, 'h')],
    why: (v, a) => `h = V ÷ S_საფ = ${v.V} ÷ ${v.B} = ${a}.`,
  }),
  num({
    sub: 'u17-08',
    prompt: 'მართკუთხა პრიზმის საფუძვლის ზომებია {a} სმ და {b} სმ, ხოლო სიმაღლე — {h} სმ. იპოვე სრული ზედაპირის ფართობი.',
    vars: { a: I(4, 16), b: I(3, 12), h: I(2, 14) },
    constraints: [{ test: (v: Vars) => g(v, 'a') > g(v, 'b') && g(v, 'a') !== g(v, 'h') && g(v, 'b') !== g(v, 'h'), note: 'three different dimensions' }],
    unit: SM2,
    key: (v) => 2 * (g(v, 'a') * g(v, 'b') + g(v, 'a') * g(v, 'h') + g(v, 'b') * g(v, 'h')),
    slips: (v) => [g(v, 'a') * g(v, 'b') + g(v, 'a') * g(v, 'h') + g(v, 'b') * g(v, 'h'), g(v, 'a') * g(v, 'b') * g(v, 'h'), 2 * g(v, 'a') * g(v, 'b') + 2 * (g(v, 'a') + g(v, 'b')) * g(v, 'h') + 2, 2 * g(v, 'a') * g(v, 'b') + (g(v, 'a') + g(v, 'b')) * g(v, 'h')],
    why: (v, a) => `საფუძვლები: 2 · ${v.a} · ${v.b} = ${2 * g(v, 'a') * g(v, 'b')}. გვერდითი ზედაპირი: 2 · (${v.a} + ${v.b}) · ${v.h} = ${2 * (g(v, 'a') + g(v, 'b')) * g(v, 'h')}. ჯამი: ${a}.`,
  }),
  num({
    sub: 'u17-08',
    prompt: 'სამკუთხა პრიზმის საფუძველია სამკუთხედი, რომლის ფუძეა {b} სმ და სიმაღლე — {k} სმ. პრიზმის სიმაღლეა {h} სმ. იპოვე მოცულობა.',
    vars: { b: I(4, 16), k: I(3, 12), h: I(3, 14) },
    constraints: [{ test: (v: Vars) => even(g(v, 'b') * g(v, 'k')), note: 'a whole base area' }],
    unit: SM3,
    key: (v) => ((g(v, 'b') * g(v, 'k')) / 2) * g(v, 'h'),
    slips: (v) => [g(v, 'b') * g(v, 'k') * g(v, 'h'), ((g(v, 'b') * g(v, 'k')) / 2) + g(v, 'h'), (g(v, 'b') * g(v, 'k') * g(v, 'h')) / 3, g(v, 'b') + g(v, 'k') + g(v, 'h')],
    why: (v, a) => `საფუძვლის ფართობია ½ · ${v.b} · ${v.k} = ${(g(v, 'b') * g(v, 'k')) / 2}. V = ${(g(v, 'b') * g(v, 'k')) / 2} · ${v.h} = ${a}.`,
  }),

  // ═════════ U17.9 — პირამიდა, კონუსი და ცილინდრი ═════════
  ...[{ rLo: 2, rHi: 8, hLo: 4, hHi: 14 }, { rLo: 3, rHi: 10, hLo: 5, hHi: 16 }].map((o) =>
    piNum({
      sub: 'u17-09',
      prompt: 'ცილინდრის რადიუსია {r} სმ, ხოლო სიმაღლე — {h} სმ. იპოვე მოცულობა π-ს გამოყენებით.',
      vars: { r: I(o.rLo, o.rHi), h: I(o.hLo, o.hHi) },
      unit: SM3,
      key: (v) => g(v, 'r') ** 2 * g(v, 'h'),
      slips: (v) => [g(v, 'r') * g(v, 'h'), (g(v, 'r') ** 2 * g(v, 'h')) / 3, 2 * g(v, 'r') * g(v, 'h'), g(v, 'r') ** 2 + g(v, 'h')],
      why: (v, a) => `V = πr²h = π · ${v.r}² · ${v.h} = ${a}.`,
    }),
  ),
  ...[{ rLo: 3, rHi: 9, hLo: 4, hHi: 15 }, { rLo: 2, rHi: 10, hLo: 6, hHi: 18 }].map((o) =>
    piNum({
      sub: 'u17-09',
      prompt: 'კონუსის რადიუსია {r} სმ, ხოლო სიმაღლე — {h} სმ. იპოვე მოცულობა ფორმულით V = ⅓πr²h.',
      vars: { r: I(o.rLo, o.rHi), h: I(o.hLo, o.hHi) },
      constraints: [{ test: (v: Vars) => (g(v, 'r') ** 2 * g(v, 'h')) % 3 === 0, note: 'a whole multiple of π' }],
      unit: SM3,
      key: (v) => (g(v, 'r') ** 2 * g(v, 'h')) / 3,
      slips: (v) => [g(v, 'r') ** 2 * g(v, 'h'), (g(v, 'r') * g(v, 'h')) / 3, g(v, 'r') ** 2 * g(v, 'h') / 6, (g(v, 'r') ** 2 + g(v, 'h')) / 3],
      why: (v, a) => `V = ⅓πr²h = ⅓ · π · ${v.r}² · ${v.h} = ${a}.`,
    }),
  ),
  ...[{ lo: 12, hi: 60, hl: 3, hh: 15 }, { lo: 15, hi: 75, hl: 6, hh: 18 }].map((o) =>
    num({
      sub: 'u17-09',
      prompt: 'პირამიდის საფუძვლის ფართობია {B} სმ², ხოლო სიმაღლე — {h} სმ. იპოვე მოცულობა.',
      vars: { B: I(o.lo, o.hi), h: I(o.hl, o.hh) },
      constraints: [{ test: (v: Vars) => (g(v, 'B') * g(v, 'h')) % 3 === 0, note: 'a whole volume' }],
      unit: SM3,
      key: (v) => (g(v, 'B') * g(v, 'h')) / 3,
      slips: (v) => [g(v, 'B') * g(v, 'h'), (g(v, 'B') * g(v, 'h')) / 2, g(v, 'B') + g(v, 'h'), (g(v, 'B') * g(v, 'h')) / 6],
      why: (v, a) => `V = ⅓ · S_საფ · h = ⅓ · ${v.B} · ${v.h} = ${a}.`,
    }),
  ),

  // ═════════ U17.10 — სხვადასხვა სხეულის მოცულობა ═════════
  num({
    sub: 'u17-10',
    prompt: 'კუბის წიბოს სიგრძეა {a} სმ. იპოვე მისი მოცულობა.',
    vars: { a: I(2, 16) },
    unit: SM3,
    key: (v) => g(v, 'a') ** 3,
    slips: (v) => [3 * g(v, 'a'), g(v, 'a') ** 2, 6 * g(v, 'a') ** 2, g(v, 'a') * 6],
    why: (v, a) => `V = a³ = ${v.a}³ = ${a}.`,
  }),
  num({
    sub: 'u17-10',
    prompt: 'მართკუთხა პარალელეპიპედის ზომებია {l} სმ, {w} სმ და {h} სმ. იპოვე მოცულობა.',
    vars: { l: I(5, 20), w: I(3, 14), h: I(2, 12) },
    constraints: [{ test: (v: Vars) => g(v, 'l') > g(v, 'w') && g(v, 'w') > g(v, 'h'), note: 'three different dimensions' }],
    unit: SM3,
    key: (v) => g(v, 'l') * g(v, 'w') * g(v, 'h'),
    slips: (v) => [g(v, 'l') + g(v, 'w') + g(v, 'h'), g(v, 'l') * g(v, 'w') + g(v, 'h'), 2 * (g(v, 'l') * g(v, 'w') + g(v, 'w') * g(v, 'h') + g(v, 'l') * g(v, 'h')), (g(v, 'l') * g(v, 'w') * g(v, 'h')) / 3],
    why: (v, a) => `V = ${v.l} · ${v.w} · ${v.h} = ${a}.`,
  }),
  piNum({
    sub: 'u17-10',
    prompt: 'ცილინდრის რადიუსია {r} სმ, ხოლო სიმაღლე — {h} სმ. იპოვე მოცულობა π-ს გამოყენებით.',
    vars: { r: I(2, 10), h: I(3, 16) },
    unit: SM3,
    key: (v) => g(v, 'r') ** 2 * g(v, 'h'),
    slips: (v) => [g(v, 'r') * g(v, 'h'), 2 * g(v, 'r') * g(v, 'h'), g(v, 'r') ** 2 + g(v, 'h'), (g(v, 'r') ** 2 * g(v, 'h')) / 3],
    why: (v, a) => `V = πr²h = π · ${v.r}² · ${v.h} = ${a}.`,
  }),
  num({
    sub: 'u17-10',
    prompt: 'სამკუთხა პრიზმის საფუძვლის ფართობია {B} სმ², ხოლო სიმაღლე — {h} სმ. იპოვე მოცულობა.',
    vars: { B: I(10, 50), h: I(4, 20) },
    unit: SM3,
    key: (v) => g(v, 'B') * g(v, 'h'),
    slips: (v) => [g(v, 'B') + g(v, 'h'), (g(v, 'B') * g(v, 'h')) / 2, (g(v, 'B') * g(v, 'h')) / 3, 2 * (g(v, 'B') + g(v, 'h'))],
    why: (v, a) => `V = S_საფ · h = ${v.B} · ${v.h} = ${a}.`,
  }),
  num({
    sub: 'u17-10',
    prompt: 'პირამიდის საფუძვლის ფართობია {B} სმ², ხოლო სიმაღლე — {h} სმ. იპოვე მოცულობა.',
    vars: { B: I(15, 80), h: I(3, 18) },
    constraints: [{ test: (v: Vars) => (g(v, 'B') * g(v, 'h')) % 3 === 0, note: 'a whole volume' }],
    unit: SM3,
    key: (v) => (g(v, 'B') * g(v, 'h')) / 3,
    slips: (v) => [g(v, 'B') * g(v, 'h'), (g(v, 'B') * g(v, 'h')) / 2, g(v, 'B') + g(v, 'h'), (g(v, 'B') * g(v, 'h')) / 6],
    why: (v, a) => `V = ⅓ · ${v.B} · ${v.h} = ${a}.`,
  }),
  num({
    sub: 'u17-10',
    prompt: 'ცილინდრის მოცულობაა {N}π სმ³, ხოლო რადიუსი — {r} სმ. იპოვე სიმაღლე.',
    vars: { r: I(2, 10), h: I(3, 16), N: D((v: Vars) => g(v, 'r') ** 2 * g(v, 'h')) },
    constraints: [{ test: (v: Vars) => g(v, 'N') < 1000, note: 'a modest volume' }],
    unit: SM,
    key: (v) => g(v, 'h'),
    slips: (v) => [g(v, 'N') / g(v, 'r'), g(v, 'N') - g(v, 'r'), g(v, 'N') / (2 * g(v, 'r')) + 1, g(v, 'N') / g(v, 'r') ** 2 + 2],
    why: (v, a) => `V = πr²h, ამიტომ h = ${v.N} ÷ ${v.r}² = ${v.N} ÷ ${g(v, 'r') ** 2} = ${a}.`,
  }),
];
