import type { QuestionTemplate, Vars } from './types';
import { C, D, I, MINUS, N, group, q6 } from './g6-helpers';
import { textOptions, unitOptions } from './g7-u08-proportion-percent';

/**
 * Grade VII — Unit 15: triangles.
 *
 * Converted from the academy's Grade VII `U15` bank: 12 subtopics × 6 questions.
 *
 * Figures are generated from a consistent configuration: the unknown `x` of an
 * angle equation, the common ratio of similar triangles or of a Thales
 * configuration, and the Pythagorean triple are drawn first, and the printed
 * data follow from them — so every answer is a whole number and a prompt is
 * never rejected and redrawn. Verbal questions (which criterion applies) choose
 * a case from a short list of hand-checked descriptions.
 */

export const G7_U15_SUBTOPICS = [
  'u15-01', 'u15-02', 'u15-03', 'u15-04', 'u15-05', 'u15-06',
  'u15-07', 'u15-08', 'u15-09', 'u15-10', 'u15-11', 'u15-12',
] as const;

const T = 'g7-triangles';
let seq = 0;
const nextId = (): string => `g7-u15-q${String(++seq).padStart(2, '0')}`;
type Spec = Omit<Parameters<typeof q6>[0], 'id' | 'topic' | 'grade'>;
const t = (spec: Spec): QuestionTemplate => q6({ id: nextId(), topic: T, grade: 7, ...spec });

const g = (v: Vars, key: string): number => N(v, key);
const YES = 'კი';
const NO = 'არა';
const unitText = (n: number, unit: string): string => (unit === '°' ? `${n}°` : unit ? `${group(n)} ${unit}` : group(n));

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
const yesNo = (sub: string, prompt: string, vars: Spec['vars'], holds: (v: Vars) => boolean, why: (v: Vars, answer: string) => string, constraints?: Spec['constraints']): QuestionTemplate =>
  t({ sub, prompt, vars, ...(constraints ? { constraints } : {}), answer: (v) => (holds(v) ? YES : NO), options: () => [YES, NO], optionCount: 2, why });

/** `x`, `3x`, `3x + 10`. */
const lin = (a: number, b: number): string => `${a === 1 ? '' : a}x ${b < 0 ? `${MINUS} ${-b}` : `+ ${b}`}`;
const coef = (a: number): string => `${a === 1 ? '' : a}x`;
const triple = (a: number, b: number, c: number): string => `${a}°, ${b}° და ${c}°`;
const tripleOptions = (right: string, a: number, b: number, c: number, x: number, k: number[]): string[] => textOptions(right, [triple(a + k[0]!, b, c), triple(x, x * 2, x * 3), triple(a, b + k[1]!, c), triple(a + k[2]!, b + k[2]!, c)]);

// ───────────────────────────── triangles ─────────────────────────────

const polyNames = ['სამკუთხედის', 'ოთხკუთხედის', 'ხუთკუთხედის', 'ექვსკუთხედის', 'შვიდკუთხედის', 'რვაკუთხედის', 'ცხრაკუთხედის', 'ათკუთხედის', 'თერთმეტკუთხედის', 'თორმეტკუთხედის'];
/** Whole-number Pythagorean triples (leg, leg, hypotenuse). */
const BASES: Array<[number, number, number]> = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41], [12, 35, 37], [11, 60, 61]];
const triVars = (lo: number, hi: number, mLo: number, mHi: number) => ({
  bi: I(lo, hi),
  m: I(mLo, mHi),
  sw: C([0, 1]),
  l1: D((v: Vars) => BASES[g(v, 'bi')]![g(v, 'sw')]! * g(v, 'm')),
  l2: D((v: Vars) => BASES[g(v, 'bi')]![1 - g(v, 'sw')]! * g(v, 'm')),
  h: D((v: Vars) => BASES[g(v, 'bi')]![2] * g(v, 'm')),
});
const pyHyp = (v: Vars): number => g(v, 'h');

// ───────────────────────── named criteria ─────────────────────────

const SSS = 'სამი გვერდის ტოლობის ნიშანი (გგგ)';
const SAS = 'ორი გვერდისა და მათ შორის მოქცეული კუთხის ტოლობის ნიშანი (გკგ)';
const ASA = 'გვერდისა და მასთან მდებარე ორი კუთხის ტოლობის ნიშანი (კგკ)';
const NONE = 'ტოლობა არ დასტურდება';
const CRITERIA = [SSS, SAS, ASA, NONE];
const SIM_AA = 'ორი კუთხის ტოლობის ნიშანი (კკ)';
const SIM_SSS = 'სამი გვერდის პროპორციულობის ნიშანი (გგგ)';
const SIM_SAS = 'ორი გვერდის პროპორციულობისა და მათ შორის კუთხის ტოლობის ნიშანი (გკგ)';
const SIM_NONE = 'მსგავსება არ დასტურდება';
const SIM_ALL = [SIM_AA, SIM_SSS, SIM_SAS, SIM_NONE];
const criterionOptions = (right: string, pool: string[]): string[] => textOptions(right, pool);
const CONG = ['ტოლია, გგგ ნიშნით', 'ტოლია, გკგ ნიშნით', 'ტოლია, კგკ ნიშნით', 'არ არის ტოლი'];

/** Vertex letters of two triangles. */
const LETTERS: Array<[string, string, string, string, string, string]> = [
  ['A', 'B', 'C', 'D', 'E', 'F'], ['K', 'L', 'M', 'P', 'Q', 'R'], ['M', 'N', 'K', 'X', 'Y', 'Z'], ['P', 'Q', 'R', 'S', 'T', 'U'],
];
const letters = () => ({
  ls: I(0, LETTERS.length - 1),
  a1: D((v: Vars) => LETTERS[g(v, 'ls')]![0]),
  b1: D((v: Vars) => LETTERS[g(v, 'ls')]![1]),
  c1: D((v: Vars) => LETTERS[g(v, 'ls')]![2]),
  a2: D((v: Vars) => LETTERS[g(v, 'ls')]![3]),
  b2: D((v: Vars) => LETTERS[g(v, 'ls')]![4]),
  c2: D((v: Vars) => LETTERS[g(v, 'ls')]![5]),
});

/** A Thales configuration `DE ∥ BC` with D on AB and E on AC, drawn from a ratio and two scales. */
const THALES: Array<[string, string, string, string, string]> = [
  ['A', 'B', 'C', 'D', 'E'], ['M', 'N', 'K', 'P', 'Q'], ['O', 'S', 'T', 'X', 'Y'], ['C', 'A', 'B', 'K', 'L'],
];
const thalesVars = () => ({
  ts: I(0, THALES.length - 1),
  p: I(1, 4),
  q: I(2, 6),
  m: I(1, 3),
  n: I(1, 4),
  A: D((v: Vars) => THALES[g(v, 'ts')]![0]),
  B: D((v: Vars) => THALES[g(v, 'ts')]![1]),
  Cc: D((v: Vars) => THALES[g(v, 'ts')]![2]),
  Dd: D((v: Vars) => THALES[g(v, 'ts')]![3]),
  Ee: D((v: Vars) => THALES[g(v, 'ts')]![4]),
});
const thalesOk = (v: Vars): boolean => g(v, 'm') !== g(v, 'n');

export const G7_U15_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U15.1 — სიმაღლე, ბისექტრისა და მედიანა ═════════
  t({
    sub: 'u15-01',
    prompt: 'რა ეწოდება {tri} სამკუთხედის {desc}?',
    vars: {
      k: I(0, 2),
      tri: C(['ABC', 'MNK', 'PQR', 'DEF']),
      w: C([0, 1]),
      desc: D((v: Vars) => [
        ['ერთი წვეროდან მოპირდაპირე გვერდზე დაშვებულ მართობ მონაკვეთს', 'წვეროდან მოპირდაპირე გვერდის შემცველ წრფეზე დაშვებულ მართობს'],
        ['წვეროდან მოპირდაპირე გვერდის შუაწერტილამდე გავლებულ მონაკვეთს', 'წვეროსა და მოპირდაპირე გვერდის შუაწერტილის შემაერთებელ მონაკვეთს'],
        ['წვეროდან გავლებულ მონაკვეთს, რომელიც კუთხეს ორ ტოლ ნაწილად ყოფს', 'კუთხის გამყოფ მონაკვეთს, რომელიც წვეროდან მოპირდაპირე გვერდამდე გადის და კუთხეს შუაზე ყოფს'],
      ][g(v, 'k')]![g(v, 'w')]!),
    },
    answer: (v) => ['სიმაღლე', 'მედიანა', 'ბისექტრისა'][g(v, 'k')]!,
    options: (_v, right) => textOptions(right, ['სიმაღლე', 'მედიანა', 'ბისექტრისა', 'შუამართობი']),
    why: (v, a) => `${v.desc} სამკუთხედში ${a} ჰქვია.`,
  }),
  num({
    sub: 'u15-01',
    prompt: 'სამკუთხედის მედიანა გვერდს ორ ტოლ ნაწილად ყოფს. თუ გვერდის სიგრძეა {L} სმ, რამდენი სანტიმეტრია თითოეული ნაწილი?',
    vars: { h: I(2, 20), L: D((v: Vars) => 2 * g(v, 'h')) },
    unit: 'სმ',
    key: (v) => g(v, 'h'),
    slips: (v) => [g(v, 'L'), g(v, 'L') * 2, g(v, 'h') + 2, g(v, 'L') - 2],
    why: (v, a) => `${v.L} ÷ 2 = ${a}.`,
  }),
  num({
    sub: 'u15-01',
    prompt: 'სამკუთხედის კუთხეა {a}°. რამდენ გრადუსიან კუთხეებად ყოფს მას ბისექტრისა? მიუთითე თითოეული კუთხე.',
    vars: { h: I(10, 85), a: D((v: Vars) => 2 * g(v, 'h')) },
    unit: '°',
    key: (v) => g(v, 'h'),
    slips: (v) => [g(v, 'a'), g(v, 'a') * 2, 180 - g(v, 'a'), g(v, 'h') + 10],
    why: (v, a) => `ბისექტრისა კუთხეს შუაზე ყოფს: ${v.a}° ÷ 2 = ${a}.`,
  }),
  num({
    sub: 'u15-01',
    prompt: 'სამკუთხედის ერთ-ერთი გვერდის სიგრძეა {L} სმ. მედიანა ამ გვერდს შუაზე ყოფს. იპოვე მიღებული თითოეული მონაკვეთის სიგრძე.',
    vars: { h: I(3, 45), L: D((v: Vars) => 2 * g(v, 'h')) },
    unit: 'სმ',
    key: (v) => g(v, 'h'),
    slips: (v) => [g(v, 'L'), g(v, 'L') * 2, g(v, 'h') + 1, g(v, 'h') - 1],
    why: (v, a) => `მედიანა გვერდს ორ ტოლ ნაწილად ყოფს: ${v.L} ÷ 2 = ${a}.`,
  }),
  num({
    sub: 'u15-01',
    prompt: 'სამკუთხედის კუთხეა {a}°. იპოვე ამ კუთხის ბისექტრისით მიღებული თითოეული კუთხის ზომა.',
    vars: { h: I(8, 80), a: D((v: Vars) => 2 * g(v, 'h')) },
    unit: '°',
    key: (v) => g(v, 'h'),
    slips: (v) => [g(v, 'a'), g(v, 'a') * 2, 180 - g(v, 'a'), g(v, 'h') + 5],
    why: (v, a) => `ბისექტრისა კუთხეს ორ ტოლ ნაწილად ყოფს: ${v.a}° ÷ 2 = ${a}.`,
  }),
  num({
    sub: 'u15-01',
    prompt: 'სამკუთხედის ფართობია {S} სმ², ხოლო ფუძის სიგრძე — {b} სმ. იპოვე ამ ფუძეზე დაშვებული სიმაღლე.',
    vars: { b: I(4, 20), h: I(3, 16), S: D((v: Vars) => (g(v, 'b') * g(v, 'h')) / 2) },
    constraints: [{ test: (v: Vars) => (g(v, 'b') * g(v, 'h')) % 2 === 0, note: 'a whole area' }],
    unit: 'სმ',
    key: (v) => g(v, 'h'),
    slips: (v) => [g(v, 'S') / g(v, 'b'), g(v, 'S') * 2, g(v, 'S') - g(v, 'b'), g(v, 'h') * 2],
    why: (v, a) => `S = ½ · b · h, ამიტომ h = 2 · ${v.S} ÷ ${v.b} = ${a}.`,
  }),

  // ═════════ U15.2 — გარე კუთხე ═════════
  num({
    sub: 'u15-02',
    prompt: 'სამკუთხედის ორი შიდა კუთხეა {a}° და {b}°. იპოვე მესამე შიდა კუთხის შესაბამისი გარე კუთხე.',
    vars: { a: I(25, 80), b: I(25, 85) },
    unit: '°',
    key: (v) => g(v, 'a') + g(v, 'b'),
    slips: (v) => [180 - g(v, 'a') - g(v, 'b'), 180 - g(v, 'a'), 360 - g(v, 'a') - g(v, 'b'), g(v, 'a') + g(v, 'b') + 10],
    why: (v, a) => `გარე კუთხე ორი არამოსაზღვრე შიდა კუთხის ჯამია: ${v.a}° + ${v.b}° = ${a}.`,
  }),
  num({
    sub: 'u15-02',
    prompt: 'სამკუთხედის ორი შიდა კუთხეა {a}° და {b}°. იპოვე მესამე შიდა კუთხე.',
    vars: { a: I(20, 85), b: I(20, 85) },
    unit: '°',
    key: (v) => 180 - g(v, 'a') - g(v, 'b'),
    slips: (v) => [g(v, 'a') + g(v, 'b'), 360 - g(v, 'a') - g(v, 'b'), 90 - g(v, 'a') - g(v, 'b'), 180 - g(v, 'a')],
    why: (v, a) => `180° ${MINUS} ${v.a}° ${MINUS} ${v.b}° = ${a}.`,
  }),
  num({
    sub: 'u15-02',
    prompt: 'სამკუთხედის ორი შიდა კუთხე {a}° და {b}°-ია. იპოვე მესამე წვეროს გარე კუთხე.',
    vars: { a: I(20, 80), b: I(20, 90) },
    unit: '°',
    key: (v) => g(v, 'a') + g(v, 'b'),
    slips: (v) => [180 - g(v, 'a') - g(v, 'b'), 180 - g(v, 'a'), 180 - g(v, 'b'), g(v, 'a') + g(v, 'b') + 20],
    why: (v, a) => `მესამე წვეროს გარე კუთხე ორი დანარჩენი შიდა კუთხის ჯამია: ${v.a}° + ${v.b}° = ${a}.`,
  }),
  num({
    sub: 'u15-02',
    prompt: 'სამკუთხედის გარე კუთხეა {E}°, ხოლო მასთან არამოსაზღვრე ერთ-ერთი შიდა კუთხეა {a}°. იპოვე მეორე არამოსაზღვრე შიდა კუთხე.',
    vars: { a: I(20, 80), b: I(20, 90), E: D((v: Vars) => g(v, 'a') + g(v, 'b')) },
    unit: '°',
    key: (v) => g(v, 'b'),
    slips: (v) => [g(v, 'E') + g(v, 'a'), 180 - g(v, 'E'), 180 - g(v, 'a'), g(v, 'E')],
    why: (v, a) => `გარე კუთხე არამოსაზღვრე შიდა კუთხეების ჯამია: ${v.E}° ${MINUS} ${v.a}° = ${a}.`,
  }),
  num({
    sub: 'u15-02',
    prompt: 'სამკუთხედის ორი არამოსაზღვრე შიდა კუთხეა ({e})° და {c}°, ხოლო გარე კუთხეა {E}°. იპოვე x.',
    vars: {
      a: I(2, 4),
      b: I(5, 30),
      c: I(20, 70),
      x: I(5, (v: Vars) => Math.floor((175 - g(v, 'b') - g(v, 'c')) / g(v, 'a'))),
      E: D((v: Vars) => g(v, 'a') * g(v, 'x') + g(v, 'b') + g(v, 'c')),
      e: D((v: Vars) => lin(g(v, 'a'), g(v, 'b'))),
    },
    unit: '',
    key: (v) => g(v, 'x'),
    slips: (v) => [(g(v, 'E') - g(v, 'c')) / g(v, 'a'), (g(v, 'E') + g(v, 'b') - g(v, 'c')) / g(v, 'a'), (180 - g(v, 'E') - g(v, 'b')) / g(v, 'a'), g(v, 'E') - g(v, 'c') - g(v, 'b')],
    why: (v, a) => `${v.e} + ${v.c} = ${v.E}, ამიტომ ${g(v, 'a')}x = ${g(v, 'E') - g(v, 'c') - g(v, 'b')} და x = ${a}.`,
  }),
  num({
    sub: 'u15-02',
    prompt: 'სამკუთხედის ერთი შიდა კუთხეა {c}°. იპოვე ამ წვეროს გარე კუთხე.',
    vars: { c: I(20, 160) },
    constraints: [{ test: (v: Vars) => g(v, 'c') !== 90, note: 'two different angles' }],
    unit: '°',
    key: (v) => 180 - g(v, 'c'),
    slips: (v) => [g(v, 'c'), 90 - g(v, 'c'), 360 - g(v, 'c'), g(v, 'c') + 90],
    why: (v, a) => `გარე და შიდა კუთხე მოსაზღვრეა, მათი ჯამია 180°: 180° ${MINUS} ${v.c}° = ${a}.`,
  }),

  // ═════════ U15.3 — სამკუთხედის შიდა კუთხეების ჯამი ═════════
  num({
    sub: 'u15-03',
    prompt: 'სამკუთხედის ორი კუთხეა {a}° და {b}°. იპოვე მესამე კუთხე.',
    vars: { a: I(20, 85), b: I(20, 85) },
    unit: '°',
    key: (v) => 180 - g(v, 'a') - g(v, 'b'),
    slips: (v) => [g(v, 'a') + g(v, 'b'), 360 - g(v, 'a') - g(v, 'b'), 90 - g(v, 'a') - g(v, 'b'), 180 - g(v, 'a')],
    why: (v, a) => `სამკუთხედის კუთხეების ჯამია 180°: 180° ${MINUS} ${v.a}° ${MINUS} ${v.b}° = ${a}.`,
  }),
  t({
    sub: 'u15-03',
    prompt: 'სამკუთხედის კუთხეებია {e1}°, {e2}° და {e3}°. იპოვე სამივე კუთხის ზომა.',
    vars: (() => {
      const triples: string[] = [];
      for (let p = 1; p <= 6; p += 1) for (let q = p; q <= 8; q += 1) for (let r = q; r <= 9; r += 1) if (180 % (p + q + r) === 0 && !(p === q && q === r) && p + q + r <= 30) triples.push(`${p}|${q}|${r}`);
      const at = (i: number) => D((v: Vars) => Number(String(v.row).split('|')[i]));
      return { row: C(triples), p: at(0), q: at(1), r: at(2), e1: D((v: Vars) => coef(g(v, 'p'))), e2: D((v: Vars) => coef(g(v, 'q'))), e3: D((v: Vars) => coef(g(v, 'r'))) };
    })(),
    answer: (v) => {
      const x = 180 / (g(v, 'p') + g(v, 'q') + g(v, 'r'));
      return triple(g(v, 'p') * x, g(v, 'q') * x, g(v, 'r') * x);
    },
    options: (v, right) => {
      const x = 180 / (g(v, 'p') + g(v, 'q') + g(v, 'r'));
      return tripleOptions(right, g(v, 'p') * x, g(v, 'q') * x, g(v, 'r') * x, x, [10, -10, 5]);
    },
    why: (v, a) => `${v.e1} + ${v.e2} + ${v.e3} = 180, ამიტომ ${g(v, 'p') + g(v, 'q') + g(v, 'r')}x = 180 და x = ${180 / (g(v, 'p') + g(v, 'q') + g(v, 'r'))}. კუთხეებია ${a}.`,
  }),
  num({
    sub: 'u15-03',
    prompt: 'სამკუთხედის ორი კუთხეა {a}° და {b}°. იპოვე მესამე კუთხე.',
    vars: { a: I(30, 100), b: I(25, 60) },
    constraints: [{ test: (v: Vars) => g(v, 'a') + g(v, 'b') < 175, note: 'a real third angle' }],
    unit: '°',
    key: (v) => 180 - g(v, 'a') - g(v, 'b'),
    slips: (v) => [g(v, 'a') + g(v, 'b'), 360 - g(v, 'a') - g(v, 'b'), 90 - g(v, 'b'), 180 - g(v, 'a')],
    why: (v, a) => `180° ${MINUS} ${v.a}° ${MINUS} ${v.b}° = ${a}.`,
  }),
  num({
    sub: 'u15-03',
    prompt: 'სამკუთხედის კუთხეებია ({e1})°, ({e2})° და {c}°. იპოვე x.',
    vars: {
      p: I(1, 3),
      q: I(1, 3),
      b: I(5, 25),
      c: I(30, 80),
      x: I(5, (v: Vars) => Math.floor((175 - g(v, 'c') - g(v, 'b') - 5) / (g(v, 'p') + g(v, 'q')))),
      d: D((v: Vars) => 180 - g(v, 'c') - g(v, 'b') - (g(v, 'p') + g(v, 'q')) * g(v, 'x')),
      e1: D((v: Vars) => lin(g(v, 'p'), g(v, 'b'))),
      e2: D((v: Vars) => lin(g(v, 'q'), g(v, 'd'))),
    },
    unit: '',
    key: (v) => g(v, 'x'),
    slips: (v) => [(180 - g(v, 'c') - g(v, 'b')) / (g(v, 'p') + g(v, 'q')), (180 - g(v, 'c') - g(v, 'd')) / (g(v, 'p') + g(v, 'q')), (180 - g(v, 'b') - g(v, 'd')) / (g(v, 'p') + g(v, 'q')), g(v, 'x') + 5],
    why: (v, a) => `${v.e1} + ${v.e2} + ${v.c} = 180, ამიტომ ${g(v, 'p') + g(v, 'q')}x = ${180 - g(v, 'c') - g(v, 'b') - g(v, 'd')} და x = ${a}.`,
  }),
  num({
    sub: 'u15-03',
    prompt: 'ტოლფერდა სამკუთხედის წვეროს კუთხეა {a}°. იპოვე თითოეული ფუძის კუთხე.',
    vars: { h: I(20, 85), a: D((v: Vars) => 180 - 2 * g(v, 'h')) },
    unit: '°',
    key: (v) => g(v, 'h'),
    slips: (v) => [180 - g(v, 'a'), g(v, 'a'), g(v, 'a') / 2, 90 - g(v, 'a')],
    why: (v, a) => `ფუძის კუთხეები ტოლია: (180° ${MINUS} ${v.a}°) ÷ 2 = ${a}.`,
  }),
  t({
    sub: 'u15-03',
    prompt: 'სამკუთხედის ორი კუთხეა {e1}° და {e2}°, ხოლო მესამე კუთხეა {c}°. იპოვე x და სამივე კუთხე.',
    vars: (() => ({
      p: I(1, 4),
      q: I(2, 5),
      x: I(10, (v: Vars) => Math.floor(150 / (g(v, 'p') + g(v, 'q')))),
      c: D((v: Vars) => 180 - (g(v, 'p') + g(v, 'q')) * g(v, 'x')),
      e1: D((v: Vars) => coef(g(v, 'p'))),
      e2: D((v: Vars) => coef(g(v, 'q'))),
    }))(),
    answer: (v) => `x = ${g(v, 'x')}; ${triple(g(v, 'p') * g(v, 'x'), g(v, 'q') * g(v, 'x'), g(v, 'c'))}`,
    options: (v, right) => {
      const x = g(v, 'x');
      return textOptions(right, [`x = ${x + 5}; ${triple(g(v, 'p') * (x + 5), g(v, 'q') * (x + 5), g(v, 'c'))}`, `x = ${Math.floor(180 / (g(v, 'p') + g(v, 'q')))}; ${triple(g(v, 'p') * x, g(v, 'q') * x, g(v, 'c') + 10)}`, `x = ${x}; ${triple(g(v, 'p') * x + g(v, 'p'), g(v, 'q') * x, g(v, 'c'))}`, `x = ${x - 2}; ${triple(g(v, 'p') * (x - 2), g(v, 'q') * (x - 2), g(v, 'c'))}`]);
    },
    constraints: [{ test: (v: Vars) => g(v, 'p') !== g(v, 'q'), note: 'two different angles' }],
    why: (v, a) => `${v.e1} + ${v.e2} + ${v.c} = 180, ამიტომ ${g(v, 'p') + g(v, 'q')}x = ${180 - g(v, 'c')} და x = ${v.x}. პასუხი: ${a}.`,
  }),

  // ═════════ U15.4 — მრავალკუთხედის შიდა კუთხეების ჯამი ═════════
  ...[[3, 4, 5, 6], [4, 5, 6, 7, 8], [5, 6, 7, 8, 9, 10], [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]].map((pool) =>
    num({
      sub: 'u15-04',
      prompt: '{ask} {poly} შიდა კუთხეების ჯამი{end}',
      vars: { n: C(pool), w: C([0, 1, 2]), poly: D((v: Vars) => polyNames[g(v, 'n') - 3]!), ask: D((v: Vars) => ['იპოვე', 'გამოთვალე', 'რამდენი გრადუსია'][g(v, 'w')]!), end: D((v: Vars) => (g(v, 'w') === 2 ? '?' : '.')) },
      unit: '°',
      key: (v) => (g(v, 'n') - 2) * 180,
      slips: (v) => [g(v, 'n') * 180, (g(v, 'n') - 1) * 180, (g(v, 'n') - 3) * 180, 360 * (g(v, 'n') - 2)],
      why: (v, a) => `n-კუთხედის შიდა კუთხეების ჯამია (n ${MINUS} 2) · 180°: (${v.n} ${MINUS} 2) · 180° = ${a}.`,
    }),
  ),
  ...[[4, 10], [6, 16]].map(([lo, hi]) =>
    num({
      sub: 'u15-04',
      prompt: 'მრავალკუთხედის შიდა კუთხეების ჯამია {S}°. რამდენი {what}?',
      vars: { n: I(lo!, hi!), w: C([0, 1]), S: D((v: Vars) => (g(v, 'n') - 2) * 180), what: D((v: Vars) => (g(v, 'w') ? 'კუთხე აქვს მას' : 'გვერდი აქვს მას')) },
      unit: '',
      key: (v) => g(v, 'n'),
      slips: (v) => [g(v, 'S') / 180, g(v, 'S') / 180 + 1, g(v, 'S') / 180 + 3, g(v, 'S') / 90],
      why: (v, a) => `(n ${MINUS} 2) · 180 = ${v.S}, ამიტომ n ${MINUS} 2 = ${g(v, 'S') / 180} და n = ${a}.`,
    }),
  ),

  // ═════════ U15.5 — სამკუთხედის უტოლობა ═════════
  ...[{ lo: 3, hi: 12, cHi: 25 }, { lo: 4, hi: 16, cHi: 30 }].map((o) =>
    yesNo(
      'u15-05',
      'შეიძლება თუ არა გვერდების სიგრძეებით {a} სმ, {b} სმ და {c} სმ სამკუთხედის აგება? უპასუხე „კი“ ან „არა“.',
      { a: I(o.lo, o.hi), b: I(o.lo, o.hi), c: I(2, o.cHi) },
      (v) => Math.max(g(v, 'a'), g(v, 'b'), g(v, 'c')) * 2 < g(v, 'a') + g(v, 'b') + g(v, 'c'),
      (v, a) => {
        const s = [g(v, 'a'), g(v, 'b'), g(v, 'c')].sort((x, y) => x - y);
        return `უდიდესი გვერდი ${s[2]} სმ ${s[0]! + s[1]! > s[2]! ? 'ნაკლებია' : 'არ არის ნაკლები'} დანარჩენების ჯამზე ${s[0]! + s[1]!} სმ. პასუხი: ${a}.`;
      },
    ),
  ),
  t({
    sub: 'u15-05',
    prompt: 'სამკუთხედის ორი გვერდია {a} სმ და {b} სმ. ჩამოთვალე ყველა შესაძლო მთელი რიცხვი, რომელიც შეიძლება იყოს მესამე გვერდის სიგრძე.',
    vars: { a: I(3, 7), b: I(4, 9) },
    constraints: [{ test: (v: Vars) => g(v, 'a') !== g(v, 'b') && Math.min(g(v, 'a'), g(v, 'b')) <= 6, note: 'a short list' }],
    answer: (v) => rangeText(Math.abs(g(v, 'a') - g(v, 'b')) + 1, g(v, 'a') + g(v, 'b') - 1),
    options: (v, right) => {
      const lo = Math.abs(g(v, 'a') - g(v, 'b')) + 1;
      const hi = g(v, 'a') + g(v, 'b') - 1;
      return textOptions(right, [rangeText(lo - 1, hi + 1), rangeText(lo - 1, hi), rangeText(lo, hi + 1), rangeText(lo + 1, hi - 1)]);
    },
    why: (v, a) => `მესამე გვერდი მეტი უნდა იყოს სხვაობაზე ${Math.abs(g(v, 'a') - g(v, 'b'))} და ნაკლები ჯამზე ${g(v, 'a') + g(v, 'b')}. შესაძლოა: ${a}.`,
  }),
  yesNo(
    'u15-05',
    'სამკუთხედის ორი გვერდია {a} სმ და {b} სმ. შეიძლება თუ არა მესამე გვერდის სიგრძე იყოს {c} სმ? უპასუხე „კი“ ან „არა“.',
    { a: I(3, 12), b: I(3, 12), c: I(2, 26) },
    (v) => g(v, 'c') < g(v, 'a') + g(v, 'b') && g(v, 'c') > Math.abs(g(v, 'a') - g(v, 'b')),
    (v, a) => `მესამე გვერდი უნდა იყოს ${Math.abs(g(v, 'a') - g(v, 'b'))} სმ-ზე მეტი და ${g(v, 'a') + g(v, 'b')} სმ-ზე ნაკლები; ${v.c} სმ ${g(v, 'c') < g(v, 'a') + g(v, 'b') && g(v, 'c') > Math.abs(g(v, 'a') - g(v, 'b')) ? 'ამ შუალედშია' : 'ამ შუალედში არ არის'}. პასუხი: ${a}.`,
  ),
  num({
    sub: 'u15-05',
    prompt: 'სამკუთხედის ორი გვერდია {a} სმ და {b} სმ. იპოვე მესამე გვერდის შესაძლო მთელი სიგრძის უმცირესი მნიშვნელობა.',
    vars: { a: I(5, 20), b: I(5, 20) },
    constraints: [{ test: (v: Vars) => g(v, 'a') !== g(v, 'b'), note: 'two different sides' }],
    unit: 'სმ',
    key: (v) => Math.abs(g(v, 'a') - g(v, 'b')) + 1,
    slips: (v) => [Math.abs(g(v, 'a') - g(v, 'b')), g(v, 'a') + g(v, 'b'), g(v, 'a') + g(v, 'b') - 1, Math.abs(g(v, 'a') - g(v, 'b')) + 2],
    why: (v, a) => `მესამე გვერდი უნდა აღემატებოდეს სხვაობას ${Math.abs(g(v, 'a') - g(v, 'b'))}, ამიტომ უმცირესი მთელია ${a}.`,
  }),
  num({
    sub: 'u15-05',
    prompt: 'სამკუთხედის ორი გვერდია {a} სმ და {b} სმ. იპოვე მესამე გვერდის შესაძლო მთელი სიგრძის უდიდესი მნიშვნელობა.',
    vars: { a: I(5, 25), b: I(5, 25) },
    unit: 'სმ',
    key: (v) => g(v, 'a') + g(v, 'b') - 1,
    slips: (v) => [g(v, 'a') + g(v, 'b'), Math.abs(g(v, 'a') - g(v, 'b')) + 1, g(v, 'a') + g(v, 'b') - 2, g(v, 'a') * 2],
    why: (v, a) => `მესამე გვერდი უნდა იყოს ჯამზე ${g(v, 'a') + g(v, 'b')} ნაკლები, ამიტომ უდიდესი მთელია ${a}.`,
  }),

  // ═════════ U15.6 — ტოლფერდა სამკუთხედი ═════════
  num({
    sub: 'u15-06',
    prompt: 'ტოლფერდა სამკუთხედის ფუძის კუთხეები თითოეული {b}°-ია. იპოვე წვეროს კუთხე.',
    vars: { b: I(20, 80) },
    unit: '°',
    key: (v) => 180 - 2 * g(v, 'b'),
    slips: (v) => [180 - g(v, 'b'), 2 * g(v, 'b'), 90 - g(v, 'b'), 360 - 2 * g(v, 'b')],
    why: (v, a) => `180° ${MINUS} 2 · ${v.b}° = ${a}.`,
  }),
  num({
    sub: 'u15-06',
    prompt: 'ტოლფერდა სამკუთხედის წვეროს კუთხეა {a}°. იპოვე ფუძის თითოეული კუთხე.',
    vars: { h: I(25, 80), a: D((v: Vars) => 180 - 2 * g(v, 'h')) },
    unit: '°',
    key: (v) => g(v, 'h'),
    slips: (v) => [g(v, 'a') / 2, 180 - g(v, 'a'), g(v, 'a'), 90 - g(v, 'a')],
    why: (v, a) => `(180° ${MINUS} ${v.a}°) ÷ 2 = ${a}.`,
  }),
  num({
    sub: 'u15-06',
    prompt: 'ტოლფერდა სამკუთხედის ტოლი გვერდების სიგრძეა {l} სმ, ხოლო ფუძეა {b} სმ. იპოვე სამკუთხედის პერიმეტრი.',
    vars: { l: I(5, 25), b: I(3, 40) },
    constraints: [{ test: (v: Vars) => g(v, 'b') < 2 * g(v, 'l'), note: 'a real triangle' }],
    unit: 'სმ',
    key: (v) => 2 * g(v, 'l') + g(v, 'b'),
    slips: (v) => [g(v, 'l') + g(v, 'b'), g(v, 'l') * 2, g(v, 'l') * g(v, 'b'), 3 * g(v, 'l')],
    why: (v, a) => `P = 2 · ${v.l} + ${v.b} = ${a}.`,
  }),
  num({
    sub: 'u15-06',
    prompt: 'ტოლფერდა სამკუთხედის პერიმეტრია {P} სმ, ხოლო ფუძის სიგრძეა {b} სმ. იპოვე თითოეული ტოლი გვერდის სიგრძე.',
    vars: { l: I(5, 25), b: I(3, 40), P: D((v: Vars) => 2 * g(v, 'l') + g(v, 'b')) },
    constraints: [{ test: (v: Vars) => g(v, 'b') < 2 * g(v, 'l'), note: 'a real triangle' }],
    unit: 'სმ',
    key: (v) => g(v, 'l'),
    slips: (v) => [g(v, 'P') - g(v, 'b'), g(v, 'P') / 3, (g(v, 'P') + g(v, 'b')) / 2, g(v, 'l') + 2],
    why: (v, a) => `(${v.P} ${MINUS} ${v.b}) ÷ 2 = ${a}.`,
  }),
  num({
    sub: 'u15-06',
    prompt: 'ტოლფერდა სამკუთხედის ფუძის თითოეული კუთხეა {b}°. იპოვე წვეროს კუთხე.',
    vars: { b: I(35, 85) },
    unit: '°',
    key: (v) => 180 - 2 * g(v, 'b'),
    slips: (v) => [180 - g(v, 'b'), 2 * g(v, 'b'), 90 - g(v, 'b'), g(v, 'b')],
    why: (v, a) => `წვეროს კუთხე = 180° ${MINUS} 2 · ${v.b}° = ${a}.`,
  }),
  num({
    sub: 'u15-06',
    prompt: 'ტოლფერდა სამკუთხედის წვეროს კუთხეა {a}°. იპოვე ფუძის თითოეული კუთხე.',
    vars: { h: I(20, 70), a: D((v: Vars) => 180 - 2 * g(v, 'h')) },
    unit: '°',
    key: (v) => g(v, 'h'),
    slips: (v) => [g(v, 'a') / 2, 180 - g(v, 'a'), g(v, 'a'), 90 - g(v, 'a')],
    why: (v, a) => `ფუძის კუთხე = (180° ${MINUS} ${v.a}°) ÷ 2 = ${a}.`,
  }),

  // ═════════ U15.7 — სამკუთხედების ტოლობის ნიშნები ═════════
  t({
    sub: 'u15-07',
    prompt: '{intro} {desc}. რომელი ტოლობის ნიშნით შეიძლება დავასკვნათ, რომ სამკუთხედები ტოლია?',
    vars: { k: I(0, 3), iw: I(0, 3), intro: D((v: Vars) => ['ორ სამკუთხედში', 'ორ მოცემულ სამკუთხედში', 'ABC და DEF სამკუთხედებში', 'MNK და PQR სამკუთხედებში'][g(v, 'iw')]!), desc: D((v: Vars) => ['შესაბამისი სამივე გვერდი ტოლია', 'ორი შესაბამისი გვერდი და მათ შორის მოქცეული კუთხე ტოლია', 'ერთი შესაბამისი გვერდი და მასთან მდებარე ორი შესაბამისი კუთხე ტოლია', 'შესაბამისი სამივე კუთხე ტოლია'][g(v, 'k')]!) },
    answer: (v) => CRITERIA[g(v, 'k')]!,
    options: (_v, right) => criterionOptions(right, CRITERIA),
    why: (v, a) => `${v.desc} — ${a === NONE ? 'სამი ტოლი კუთხე მხოლოდ მსგავსებას იძლევა, ტოლობას არა' : 'ეს ტოლობის ნიშანია'}. პასუხი: ${a}.`,
  }),
  t({
    sub: 'u15-07',
    prompt: 'ორ სამკუთხედში {a1}{b1}{c1} და {a2}{b2}{c2} მოცემულია: {data}. რომელი ტოლობის ნიშანი გამოიყენება?',
    vars: {
      ...letters(),
      k: I(0, 4),
      data: D((v: Vars) => {
        const [a1, b1, c1, a2, b2, c2] = [v.a1, v.b1, v.c1, v.a2, v.b2, v.c2];
        return [
          `${a1}${b1} = ${a2}${b2}, ${b1}${c1} = ${b2}${c2}, ${a1}${c1} = ${a2}${c2}`,
          `${a1}${b1} = ${a2}${b2}, ${a1}${c1} = ${a2}${c2} და ∠${a1} = ∠${a2}`,
          `${a1}${b1} = ${a2}${b2}, ∠${a1} = ∠${a2} და ∠${b1} = ∠${b2}`,
          `∠${a1} = ∠${a2}, ∠${b1} = ∠${b2} და ∠${c1} = ∠${c2}`,
          `${a1}${b1} = ${a2}${b2}, ${a1}${c1} = ${a2}${c2} და ∠${b1} = ∠${b2}`,
        ][g(v, 'k')]!;
      }),
    },
    answer: (v) => [SSS, SAS, ASA, NONE, NONE][g(v, 'k')]!,
    options: (_v, right) => criterionOptions(right, CRITERIA),
    why: (v, a) => (g(v, 'k') === 4 ? `კუთხე ${v.b1} ტოლ გვერდებს შორის არ არის (გვერდები ${v.a1}${v.b1} და ${v.a1}${v.c1}), ამიტომ ნიშანი არ გამოდგება. პასუხი: ${a}.` : g(v, 'k') === 3 ? `სამი ტოლი კუთხე მხოლოდ მსგავსებას იძლევა. პასუხი: ${a}.` : `${v.data}. პასუხი: ${a}.`),
  }),
  t({
    sub: 'u15-07',
    prompt: 'სამკუთხედ ABC-ში {d1}. სამკუთხედ DEF-ში {d2}. რომელი ტოლობის ნიშნით შეიძლება დავასკვნათ, რომ ისინი ტოლია?',
    vars: {
      k: I(0, 2),
      a: I(3, 9),
      b: I(4, 10),
      c: I(5, 11),
      al: I(30, 80),
      be: I(40, 70),
      d1: D((v: Vars) => [`AB = ${g(v, 'a')} სმ, BC = ${g(v, 'b')} სმ, AC = ${g(v, 'c')} სმ`, `AB = ${g(v, 'a')} სმ, AC = ${g(v, 'b')} სმ და ∠A = ${g(v, 'al')}°`, `AB = ${g(v, 'a')} სმ, ∠A = ${g(v, 'al')}° და ∠B = ${g(v, 'be')}°`][g(v, 'k')]!),
      d2: D((v: Vars) => [`DE = ${g(v, 'a')} სმ, EF = ${g(v, 'b')} სმ, DF = ${g(v, 'c')} სმ`, `DE = ${g(v, 'a')} სმ, DF = ${g(v, 'b')} სმ და ∠D = ${g(v, 'al')}°`, `DE = ${g(v, 'a')} სმ, ∠D = ${g(v, 'al')}° და ∠E = ${g(v, 'be')}°`][g(v, 'k')]!),
    },
    constraints: [{ test: (v: Vars) => g(v, 'k') !== 0 || (g(v, 'a') + g(v, 'b') > g(v, 'c') && g(v, 'a') + g(v, 'c') > g(v, 'b') && g(v, 'b') + g(v, 'c') > g(v, 'a')), note: 'a real triangle' }, { test: (v: Vars) => g(v, 'al') + g(v, 'be') < 175, note: 'two angles of a triangle' }],
    answer: (v) => [SSS, SAS, ASA][g(v, 'k')]!,
    options: (_v, right) => criterionOptions(right, CRITERIA),
    why: (_v, a) => `ორივე სამკუთხედში ტოლია ერთი და იგივე სამი ელემენტი, ამიტომ გამოიყენება ${a}.`,
  }),
  t({
    sub: 'u15-07',
    prompt: 'სამკუთხედ ABC-ში AB = {a} სმ, BC = {b} სმ, AC = {c} სმ. სამკუთხედ DEF-ში DE = {a} სმ, EF = {b2} სმ, DF = {c} სმ. ტოლია თუ არა ეს სამკუთხედები? მიუთითე ტოლობის ნიშანი.',
    vars: { a: I(3, 10), b: I(4, 11), c: I(5, 12), differ: C([0, 1]), b2: D((v: Vars) => g(v, 'b') + (g(v, 'differ') ? 1 : 0)) },
    constraints: [{ test: (v: Vars) => g(v, 'a') + g(v, 'b') > g(v, 'c') && g(v, 'a') + g(v, 'c') > g(v, 'b') && g(v, 'b') + g(v, 'c') > g(v, 'a') && (!g(v, 'differ') || (g(v, 'a') + g(v, 'b2') > g(v, 'c') && g(v, 'b2') + g(v, 'c') > g(v, 'a'))), note: 'real triangles' }],
    answer: (v) => (g(v, 'differ') ? CONG[3]! : CONG[0]!),
    options: (_v, right) => textOptions(right, CONG),
    why: (v, a) => (g(v, 'differ') ? `გვერდები EF = ${v.b2} სმ და BC = ${v.b} სმ განსხვავებულია, ამიტომ სამი გვერდი არ არის ტოლი: ${a}.` : `სამივე შესაბამისი გვერდი ტოლია (${v.a}, ${v.b}, ${v.c}): ${a}.`),
  }),
  t({
    sub: 'u15-07',
    prompt: 'პირველ მართკუთხა სამკუთხედში კათეტებია {a} სმ და {b} სმ, მეორეში — {a} სმ და {b2} სმ. ტოლია თუ არა ეს სამკუთხედები? მიუთითე ტოლობის ნიშანი.',
    vars: { a: I(3, 15), b: I(4, 16), differ: C([0, 1]), b2: D((v: Vars) => g(v, 'b') + (g(v, 'differ') ? 2 : 0)) },
    answer: (v) => (g(v, 'differ') ? CONG[3]! : CONG[1]!),
    options: (_v, right) => textOptions(right, CONG),
    why: (v, a) => (g(v, 'differ') ? `მეორე კათეტები ${v.b} სმ და ${v.b2} სმ განსხვავებულია: ${a}.` : `ორი კათეტი ტოლია და მათ შორის კუთხე ორივეგან მართია: ${a}.`),
  }),
  t({
    sub: 'u15-07',
    prompt: 'ორ სამკუთხედში {a1}{b1} = {a2}{b2}, {a1}{c1} = {a2}{c2} და {angle}. რომელი ტოლობის ნიშანი გამოიყენება სამკუთხედების ტოლობის დასამტკიცებლად?',
    vars: { ...letters(), k: I(0, 2), angle: D((v: Vars) => [`∠${v.b1}${v.a1}${v.c1} = ∠${v.b2}${v.a2}${v.c2}`, `∠${v.a1}${v.b1}${v.c1} = ∠${v.a2}${v.b2}${v.c2}`, `${v.b1}${v.c1} = ${v.b2}${v.c2}`][g(v, 'k')]!) },
    answer: (v) => [SAS, NONE, SSS][g(v, 'k')]!,
    options: (_v, right) => criterionOptions(right, CRITERIA),
    why: (v, a) => (g(v, 'k') === 1 ? `კუთხე ${v.b1} არ არის ტოლ გვერდებს ${v.a1}${v.b1} და ${v.a1}${v.c1} შორის, ამიტომ ნიშანი არ გამოდგება. პასუხი: ${a}.` : `${v.a1}${v.b1} = ${v.a2}${v.b2}, ${v.a1}${v.c1} = ${v.a2}${v.c2} და ${v.angle}. პასუხი: ${a}.`),
  }),

  // ═════════ U15.8 — სამკუთხედების მსგავსების ნიშნები ═════════
  t({
    sub: 'u15-08',
    prompt: '{intro} {desc}. რომელი მსგავსების ნიშნით შეიძლება დავასკვნათ, რომ სამკუთხედები მსგავსია?',
    vars: { k: I(0, 4), iw: I(0, 3), intro: D((v: Vars) => ['ორი სამკუთხედის', 'ორი მოცემული სამკუთხედის', 'ABC და DEF სამკუთხედების', 'KLM და PQR სამკუთხედების'][g(v, 'iw')]!), desc: D((v: Vars) => ['შესაბამისი კუთხეები ტოლია', 'ორი შესაბამისი კუთხე ტოლია', 'სამივე შესაბამისი გვერდი პროპორციულია', 'ორი შესაბამისი გვერდი პროპორციულია და მათ შორის მოქცეული კუთხეები ტოლია', 'მხოლოდ ერთი კუთხე ტოლია'][g(v, 'k')]!) },
    answer: (v) => [SIM_AA, SIM_AA, SIM_SSS, SIM_SAS, SIM_NONE][g(v, 'k')]!,
    options: (_v, right) => criterionOptions(right, SIM_ALL),
    why: (v, a) => `ორი სამკუთხედის ${v.desc} — ${a === SIM_NONE ? 'ერთი ტოლი კუთხე მსგავსებისთვის საკმარისი არ არის' : 'ეს მსგავსების ნიშანია'}. პასუხი: ${a}.`,
  }),
  yesNo(
    'u15-08',
    'ორი სამკუთხედის შესაბამისი გვერდებია {a} სმ, {b} სმ, {c} სმ და {a2} სმ, {b2} სმ, {c2} სმ. მსგავსია თუ არა ეს სამკუთხედები? უპასუხე „კი“ ან „არა“.',
    { a: I(3, 7), b: I(4, 8), c: I(5, 9), k: I(2, 4), bad: C([0, 1]), a2: D((v: Vars) => g(v, 'a') * g(v, 'k')), b2: D((v: Vars) => g(v, 'b') * g(v, 'k')), c2: D((v: Vars) => g(v, 'c') * g(v, 'k') + (g(v, 'bad') ? 1 : 0)) },
    (v) => !g(v, 'bad'),
    (v, a) => (g(v, 'bad') ? `შეფარდებები ${v.a2}/${v.a} = ${v.k}, ${v.b2}/${v.b} = ${v.k}, მაგრამ ${v.c2}/${v.c} სხვაა, ამიტომ პროპორციული არ არის. პასუხი: ${a}.` : `ყოველი გვერდი ${v.k}-ჯერ დიდია: ${v.a2}/${v.a} = ${v.b2}/${v.b} = ${v.c2}/${v.c} = ${v.k}. პასუხი: ${a}.`),
    [{ test: (v: Vars) => g(v, 'a') + g(v, 'b') > g(v, 'c') && g(v, 'a') + g(v, 'c') > g(v, 'b') && g(v, 'b') + g(v, 'c') > g(v, 'a'), note: 'a real triangle' }],
  ),
  num({
    sub: 'u15-08',
    prompt: 'ორი მსგავსი სამკუთხედის შესაბამისი გვერდების შეფარდება არის {m}:{n}. პატარა სამკუთხედის გვერდია {s} სმ. იპოვე შესაბამისი დიდი გვერდის სიგრძე.',
    vars: { m: I(1, 6), n: I(2, 9), k: I(1, 5), s: D((v: Vars) => g(v, 'm') * g(v, 'k')) },
    constraints: [{ test: (v: Vars) => g(v, 'm') < g(v, 'n'), note: 'the first is the smaller triangle' }],
    unit: 'სმ',
    key: (v) => g(v, 'n') * g(v, 'k'),
    slips: (v) => [g(v, 's') * g(v, 'm'), g(v, 's') + g(v, 'n') - g(v, 'm'), g(v, 'm') * g(v, 'k') * 2, g(v, 's') * g(v, 'n')],
    why: (v, a) => `${v.s} ÷ ${v.m} = ${v.k}, ამიტომ დიდი გვერდია ${v.k} · ${v.n} = ${a}.`,
  }),
  num({
    sub: 'u15-08',
    prompt: 'ორი მსგავსი სამკუთხედის შესაბამისი გვერდებია {a} სმ და {A} სმ. პატარა სამკუთხედის მეორე გვერდია {b} სმ. იპოვე დიდი სამკუთხედის შესაბამისი გვერდი.',
    vars: { a: I(2, 9), k: I(2, 6), b: I(2, 12), A: D((v: Vars) => g(v, 'a') * g(v, 'k')) },
    constraints: [{ test: (v: Vars) => g(v, 'a') !== g(v, 'b'), note: 'two different sides' }],
    unit: 'სმ',
    key: (v) => g(v, 'b') * g(v, 'k'),
    slips: (v) => [g(v, 'b') + g(v, 'A') - g(v, 'a'), g(v, 'b') * g(v, 'a'), g(v, 'A') - g(v, 'a') + g(v, 'b') + 1, g(v, 'k') + g(v, 'b')],
    why: (v, a) => `მსგავსების კოეფიციენტია ${v.A} ÷ ${v.a} = ${v.k}; ${v.b} · ${v.k} = ${a}.`,
  }),
  yesNo(
    'u15-08',
    'ორი სამკუთხედის ორი წყვილი შესაბამისი გვერდების შეფარდებებია {r1} და {r2}, ხოლო მათ შორის მოქცეული კუთხეები {ang}. მსგავსია თუ არა ეს სამკუთხედები? უპასუხე „კი“ ან „არა“.',
    {
      p: I(1, 5),
      q: I(2, 7),
      k: I(2, 3),
      diff: C([0, 1]),
      eq: C([0, 1]),
      r1: D((v: Vars) => `${g(v, 'p')}:${g(v, 'q')}`),
      r2: D((v: Vars) => (g(v, 'diff') ? `${g(v, 'p') + 1}:${g(v, 'q')}` : `${g(v, 'p') * g(v, 'k')}:${g(v, 'q') * g(v, 'k')}`)),
      ang: D((v: Vars) => (g(v, 'eq') ? 'ტოლია' : 'არ არის ტოლი')),
    },
    (v) => !g(v, 'diff') && !!g(v, 'eq'),
    (v, a) => (g(v, 'diff') ? `შეფარდებები ${v.r1} და ${v.r2} განსხვავებულია, ამიტომ გვერდები პროპორციული არ არის. პასუხი: ${a}.` : g(v, 'eq') ? `შეფარდებები ${v.r1} და ${v.r2} ტოლია, კუთხეები ტოლია — გვერდისა და კუთხის მსგავსების ნიშანია. პასუხი: ${a}.` : `შეფარდებები ტოლია, მაგრამ მათ შორის კუთხეები ${v.ang}, ამიტომ ნიშანი არ მუშაობს. პასუხი: ${a}.`),
    [{ test: (v: Vars) => g(v, 'p') !== g(v, 'q') && g(v, 'p') + 1 !== g(v, 'q'), note: 'a real ratio, genuinely different when changed' }],
  ),
  num({
    sub: 'u15-08',
    prompt: 'ორი მსგავსი სამკუთხედის შესაბამისი გვერდებია {a} სმ და {A} სმ. დიდი სამკუთხედის პერიმეტრია {P} სმ. იპოვე პატარა სამკუთხედის პერიმეტრი.',
    vars: { a: I(2, 9), k: I(2, 6), ps: I(6, 20), A: D((v: Vars) => g(v, 'a') * g(v, 'k')), P: D((v: Vars) => g(v, 'ps') * g(v, 'k')) },
    unit: 'სმ',
    key: (v) => g(v, 'ps'),
    slips: (v) => [g(v, 'P') * g(v, 'k'), g(v, 'P') - g(v, 'A') + g(v, 'a'), g(v, 'P') - g(v, 'k'), g(v, 'ps') + g(v, 'k')],
    why: (v, a) => `პერიმეტრები ისე შეეფარდება, როგორც გვერდები: ${v.A} ÷ ${v.a} = ${v.k}, ამიტომ ${v.P} ÷ ${v.k} = ${a}.`,
  }),

  // ═════════ U15.9 — პითაგორას თეორემა ═════════
  num({
    sub: 'u15-09',
    prompt: 'მართკუთხა სამკუთხედის კათეტებია {l1} სმ და {l2} სმ. იპოვე ჰიპოტენუზა.',
    vars: triVars(0, 1, 1, 9),
    unit: 'სმ',
    key: pyHyp,
    slips: (v) => [g(v, 'l1') + g(v, 'l2'), Math.abs(g(v, 'l2') - g(v, 'l1')), g(v, 'h') + 1, g(v, 'h') - 1],
    why: (v, a) => `c² = ${v.l1}² + ${v.l2}² = ${g(v, 'l1') ** 2 + g(v, 'l2') ** 2}, ამიტომ c = ${a}.`,
  }),
  num({
    sub: 'u15-09',
    prompt: 'მართკუთხა სამკუთხედის კათეტებია {l1} სმ და {l2} სმ. იპოვე ჰიპოტენუზა.',
    vars: triVars(1, 4, 1, 5),
    unit: 'სმ',
    key: pyHyp,
    slips: (v) => [g(v, 'l1') + g(v, 'l2'), Math.abs(g(v, 'l2') - g(v, 'l1')), g(v, 'h') + 1, g(v, 'h') - 1],
    why: (v, a) => `c² = ${v.l1}² + ${v.l2}² = ${g(v, 'l1') ** 2 + g(v, 'l2') ** 2}, ამიტომ c = ${a}.`,
  }),
  num({
    sub: 'u15-09',
    prompt: 'მართკუთხა სამკუთხედის ჰიპოტენუზაა {h} სმ, ხოლო ერთი კათეტი — {l1} სმ. იპოვე მეორე კათეტი.',
    vars: triVars(0, 4, 1, 4),
    unit: 'სმ',
    key: (v) => g(v, 'l2'),
    slips: (v) => [g(v, 'h') - g(v, 'l1'), g(v, 'h') + g(v, 'l1'), g(v, 'l2') + 1, g(v, 'l2') - 1],
    why: (v, a) => `b² = ${v.h}² ${MINUS} ${v.l1}² = ${g(v, 'h') ** 2 - g(v, 'l1') ** 2}, ამიტომ b = ${a}.`,
  }),
  num({
    sub: 'u15-09',
    prompt: 'მართკუთხა სამკუთხედის ჰიპოტენუზაა {h} სმ, ხოლო ერთი კათეტი — {l1} სმ. იპოვე მეორე კათეტი.',
    vars: triVars(0, 3, 1, 5),
    unit: 'სმ',
    key: (v) => g(v, 'l2'),
    slips: (v) => [g(v, 'h') - g(v, 'l1'), g(v, 'h') + g(v, 'l1'), g(v, 'l2') + 1, g(v, 'l2') - 1],
    why: (v, a) => `b² = ${v.h}² ${MINUS} ${v.l1}² = ${g(v, 'h') ** 2 - g(v, 'l1') ** 2}, ამიტომ b = ${a}.`,
  }),
  num({
    sub: 'u15-09',
    prompt: 'კიბის სიგრძეა {h} მ, ხოლო მისი ქვედა ბოლო კედლიდან {l1} მ-ით არის დაშორებული. რა სიმაღლეზე აღწევს კიბის ზედა ბოლო კედელს?',
    vars: triVars(0, 3, 1, 2),
    unit: 'მ',
    key: (v) => g(v, 'l2'),
    slips: (v) => [g(v, 'h') - g(v, 'l1'), g(v, 'h') + g(v, 'l1'), g(v, 'l2') + 1, g(v, 'l2') - 1],
    why: (v, a) => `სიმაღლე² = ${v.h}² ${MINUS} ${v.l1}² = ${g(v, 'h') ** 2 - g(v, 'l1') ** 2}, ამიტომ სიმაღლე ${a}-ია.`,
  }),
  num({
    sub: 'u15-09',
    prompt: 'მართკუთხა სამკუთხედის კათეტებია {l1} სმ და {l2} სმ. იპოვე ჰიპოტენუზა.',
    vars: triVars(2, 7, 1, 3),
    unit: 'სმ',
    key: pyHyp,
    slips: (v) => [g(v, 'l1') + g(v, 'l2'), Math.abs(g(v, 'l2') - g(v, 'l1')), g(v, 'h') + 1, g(v, 'h') - 1],
    why: (v, a) => `c² = ${v.l1}² + ${v.l2}² = ${g(v, 'l1') ** 2 + g(v, 'l2') ** 2}, ამიტომ c = ${a}.`,
  }),

  // ═════════ U15.10 — თალესის თეორემა ═════════
  ...(() => {
    interface Th {
      cond: string;
      given: string;
      ask: string;
      key: (v: Vars) => number;
      slips: (v: Vars) => number[];
      why: (v: Vars, answer: string) => string;
    }
    const p = (v: Vars): number => g(v, 'p');
    const q = (v: Vars): number => g(v, 'q');
    const m = (v: Vars): number => g(v, 'm');
    const n = (v: Vars): number => g(v, 'n');
    const items: Th[] = [
      {
        cond: 'სამკუთხედ {A}{B}{Cc}-ში {Dd} მდებარეობს {A}{B}-ზე, {Ee} — {A}{Cc}-ზე და {Dd}{Ee} ∥ {B}{Cc}. თუ {A}{Dd} = {ad} სმ, {Dd}{B} = {db} სმ და {A}{Ee} = {ae} სმ, იპოვე {Ee}{Cc}.',
        given: 'ad,db,ae',
        ask: 'EC',
        key: (v) => q(v) * n(v),
        slips: (v) => [(p(v) * m(v) * q(v) * m(v)) / (p(v) * n(v)), q(v) * m(v) + n(v), p(v) * n(v), q(v) * n(v) + m(v)],
        why: (v, a) => `${v.Dd}${v.Ee} ∥ ${v.B}${v.Cc}, ამიტომ ${v.A}${v.Dd}/${v.Dd}${v.B} = ${v.A}${v.Ee}/${v.Ee}${v.Cc}: ${v.ad}/${v.db} = ${v.ae}/x, x = ${v.ae} · ${v.db} ÷ ${v.ad} = ${a}.`,
      },
      {
        cond: 'სამკუთხედ {A}{B}{Cc}-ში {Dd}{Ee} ∥ {B}{Cc}, სადაც {Dd} ∈ {A}{B}, {Ee} ∈ {A}{Cc}. თუ {A}{Dd} = {ad} სმ, {A}{B} = {ab} სმ და {A}{Cc} = {ac} სმ, იპოვე {A}{Ee}.',
        given: 'ad,ab,ac',
        ask: 'AE',
        key: (v) => p(v) * n(v),
        slips: (v) => [(p(v) + q(v)) * n(v) - p(v) * n(v) + 1, q(v) * n(v), (p(v) + q(v)) * n(v) - q(v), p(v) * m(v)],
        why: (v, a) => `${v.A}${v.Dd}/${v.A}${v.B} = ${v.A}${v.Ee}/${v.A}${v.Cc}: ${v.ad}/${v.ab} = x/${v.ac}, x = ${v.ad} · ${v.ac} ÷ ${v.ab} = ${a}.`,
      },
      {
        cond: 'სამკუთხედ {A}{B}{Cc}-ში {Dd}{Ee} ∥ {B}{Cc}. თუ {A}{Dd} = {ad} სმ, {Dd}{B} = {db} სმ და {Ee}{Cc} = {ec} სმ, იპოვე {A}{Ee}.',
        given: 'ad,db,ec',
        ask: 'AE',
        key: (v) => p(v) * n(v),
        slips: (v) => [q(v) * n(v), (q(v) * n(v) * q(v) * m(v)) / (p(v) * m(v)), p(v) * n(v) + 1, q(v) * m(v)],
        why: (v, a) => `${v.A}${v.Dd}/${v.Dd}${v.B} = ${v.A}${v.Ee}/${v.Ee}${v.Cc}: ${v.ad}/${v.db} = x/${v.ec}, x = ${v.ad} · ${v.ec} ÷ ${v.db} = ${a}.`,
      },
      {
        cond: 'სამკუთხედის ორი გვერდის მონაკვეთებია {A}{Dd} = {ad} სმ და {Dd}{B} = {db} სმ. {Dd}{Ee} ∥ {B}{Cc}, ხოლო {A}{Ee} = {ae} სმ. იპოვე {Ee}{Cc}.',
        given: 'ad,db,ae',
        ask: 'EC',
        key: (v) => q(v) * n(v),
        slips: (v) => [q(v) * m(v), p(v) * n(v) + q(v) * m(v), (p(v) * n(v) * q(v) * m(v)) / (p(v) * m(v)) + 1, q(v) * n(v) + 2],
        why: (v, a) => `${v.ad}/${v.db} = ${v.ae}/x, ამიტომ x = ${v.ae} · ${v.db} ÷ ${v.ad} = ${a}.`,
      },
      {
        cond: 'სამკუთხედ {A}{B}{Cc}-ში {Dd}{Ee} ∥ {B}{Cc}. თუ {A}{Dd} = {ad} სმ, {A}{B} = {ab} სმ და {Dd}{Ee} = {de} სმ, იპოვე {B}{Cc}.',
        given: 'ad,ab,de',
        ask: 'BC',
        key: (v) => (p(v) + q(v)) * n(v),
        slips: (v) => [(p(v) + q(v)) * m(v), p(v) * n(v) + q(v), q(v) * n(v), (p(v) + q(v)) * n(v) + 1],
        why: (v, a) => `სამკუთხედები ${v.A}${v.Dd}${v.Ee} და ${v.A}${v.B}${v.Cc} მსგავსია: ${v.ad}/${v.ab} = ${v.de}/x, x = ${v.de} · ${v.ab} ÷ ${v.ad} = ${a}.`,
      },
      {
        cond: 'სამკუთხედ {A}{B}{Cc}-ში {Dd}{Ee} ∥ {B}{Cc}. თუ {A}{Dd} = {ad} სმ, {A}{B} = {ab} სმ და {B}{Cc} = {bc} სმ, იპოვე {Dd}{Ee}.',
        given: 'ad,ab,bc',
        ask: 'DE',
        key: (v) => p(v) * n(v),
        slips: (v) => [(p(v) + q(v)) * n(v) - p(v) * m(v), q(v) * n(v), p(v) * m(v), p(v) * n(v) + 1],
        why: (v, a) => `${v.ad}/${v.ab} = x/${v.bc}, ამიტომ x = ${v.ad} · ${v.bc} ÷ ${v.ab} = ${a}.`,
      },
    ];
    // Segment values as D vars; each statement reads the ones it needs.
    const segVars = () => ({
      ...thalesVars(),
      ad: D((v: Vars) => p(v) * m(v)),
      db: D((v: Vars) => q(v) * m(v)),
      ab: D((v: Vars) => (p(v) + q(v)) * m(v)),
      ae: D((v: Vars) => p(v) * n(v)),
      ec: D((v: Vars) => q(v) * n(v)),
      ac: D((v: Vars) => (p(v) + q(v)) * n(v)),
      de: D((v: Vars) => p(v) * n(v)),
      bc: D((v: Vars) => (p(v) + q(v)) * n(v)),
    });
    return items.map((it) =>
      num({
        sub: 'u15-10',
        prompt: it.cond,
        vars: segVars(),
        constraints: [{ test: thalesOk, note: 'two different scales' }],
        unit: 'სმ',
        key: it.key,
        slips: it.slips,
        why: it.why,
      }),
    );
  })(),

  // ═════════ U15.11 — ამოცანები სამკუთხედებზე ═════════
  t({
    sub: 'u15-11',
    prompt: 'სამკუთხედის კუთხეებია x°, ({e2})° და ({e3})°. იპოვე სამივე კუთხე.',
    vars: (() => ({
      b: I(5, 30, { step: 5 }),
      c: I(10, 40, { step: 5 }),
      x: I(20, (v: Vars) => Math.floor((180 - g(v, 'b') - g(v, 'c')) / 3)),
      e2: D((v: Vars) => lin(1, g(v, 'b'))),
      e3: D((v: Vars) => lin(1, g(v, 'c'))),
    }))(),
    constraints: [{ test: (v: Vars) => (180 - g(v, 'b') - g(v, 'c')) % 3 === 0 && g(v, 'b') !== g(v, 'c'), note: 'x is a whole number' }],
    answer: (v) => {
      const x = (180 - g(v, 'b') - g(v, 'c')) / 3;
      return triple(x, x + g(v, 'b'), x + g(v, 'c'));
    },
    options: (v, right) => {
      const x = (180 - g(v, 'b') - g(v, 'c')) / 3;
      return textOptions(right, [triple(x + 5, x + g(v, 'b'), x + g(v, 'c')), triple(x, x + g(v, 'b'), x + g(v, 'c') + 10), triple(x - 5, x + g(v, 'b') - 5, x + g(v, 'c') - 5), triple(x + 10, x + g(v, 'b') + 10, x + g(v, 'c') + 10)]);
    },
    why: (v, a) => `x + (${v.e2}) + (${v.e3}) = 180, ამიტომ 3x = ${180 - g(v, 'b') - g(v, 'c')} და x = ${(180 - g(v, 'b') - g(v, 'c')) / 3}. კუთხეებია ${a}.`,
  }),
  num({
    sub: 'u15-11',
    prompt: 'სამკუთხედის პერიმეტრია {P} სმ. მისი ორი გვერდია {a} სმ და {b} სმ. იპოვე მესამე გვერდი.',
    vars: { a: I(5, 20), b: I(5, 20), c: I(4, 22), P: D((v: Vars) => g(v, 'a') + g(v, 'b') + g(v, 'c')) },
    constraints: [{ test: (v: Vars) => g(v, 'a') + g(v, 'b') > g(v, 'c') && g(v, 'a') + g(v, 'c') > g(v, 'b') && g(v, 'b') + g(v, 'c') > g(v, 'a'), note: 'a real triangle' }],
    unit: 'სმ',
    key: (v) => g(v, 'c'),
    slips: (v) => [g(v, 'P') + g(v, 'a') + g(v, 'b'), g(v, 'P') - g(v, 'a'), g(v, 'a') + g(v, 'b'), g(v, 'P') - g(v, 'b')],
    why: (v, a) => `${v.P} ${MINUS} ${v.a} ${MINUS} ${v.b} = ${a}.`,
  }),
  num({
    sub: 'u15-11',
    prompt: 'სამკუთხედის გვერდებია {a} სმ, {b} სმ და {c} სმ. იპოვე პერიმეტრი.',
    vars: { a: I(4, 18), b: I(4, 18), c: I(4, 18) },
    constraints: [{ test: (v: Vars) => g(v, 'a') + g(v, 'b') > g(v, 'c') && g(v, 'a') + g(v, 'c') > g(v, 'b') && g(v, 'b') + g(v, 'c') > g(v, 'a'), note: 'a real triangle' }],
    unit: 'სმ',
    key: (v) => g(v, 'a') + g(v, 'b') + g(v, 'c'),
    slips: (v) => [g(v, 'a') + g(v, 'b'), g(v, 'a') * g(v, 'b') * g(v, 'c') / 10, (g(v, 'a') + g(v, 'b') + g(v, 'c')) / 2, g(v, 'a') + g(v, 'c')],
    why: (v, a) => `P = ${v.a} + ${v.b} + ${v.c} = ${a}.`,
  }),
  t({
    sub: 'u15-11',
    prompt: 'სამკუთხედის ორი კუთხეა {e1}° და {e2}°, ხოლო მესამე კუთხეა {c}°. იპოვე x და სამივე კუთხე.',
    vars: {
      p: I(1, 4),
      q: I(2, 5),
      x: I(10, (v: Vars) => Math.floor(150 / (g(v, 'p') + g(v, 'q')))),
      c: D((v: Vars) => 180 - (g(v, 'p') + g(v, 'q')) * g(v, 'x')),
      e1: D((v: Vars) => coef(g(v, 'p'))),
      e2: D((v: Vars) => coef(g(v, 'q'))),
    },
    constraints: [{ test: (v: Vars) => g(v, 'p') !== g(v, 'q'), note: 'two different angles' }],
    answer: (v) => `x = ${g(v, 'x')}; ${triple(g(v, 'p') * g(v, 'x'), g(v, 'q') * g(v, 'x'), g(v, 'c'))}`,
    options: (v, right) => {
      const x = g(v, 'x');
      return textOptions(right, [`x = ${x + 5}; ${triple(g(v, 'p') * (x + 5), g(v, 'q') * (x + 5), g(v, 'c'))}`, `x = ${x}; ${triple(g(v, 'p') * x, g(v, 'q') * x, g(v, 'c') + 10)}`, `x = ${x}; ${triple(g(v, 'p') * x + g(v, 'p'), g(v, 'q') * x, g(v, 'c'))}`, `x = ${x - 2}; ${triple(g(v, 'p') * (x - 2), g(v, 'q') * (x - 2), g(v, 'c'))}`]);
    },
    why: (v, a) => `${v.e1} + ${v.e2} + ${v.c} = 180, ამიტომ ${g(v, 'p') + g(v, 'q')}x = ${180 - g(v, 'c')} და x = ${v.x}. პასუხი: ${a}.`,
  }),
  num({
    sub: 'u15-11',
    prompt: 'ტოლფერდა სამკუთხედის პერიმეტრია {P} სმ, ხოლო თითოეული ტოლი გვერდია {l} სმ. იპოვე ფუძის სიგრძე.',
    vars: { l: I(6, 25), b: I(3, 40), P: D((v: Vars) => 2 * g(v, 'l') + g(v, 'b')) },
    constraints: [{ test: (v: Vars) => g(v, 'b') < 2 * g(v, 'l'), note: 'a real triangle' }],
    unit: 'სმ',
    key: (v) => g(v, 'b'),
    slips: (v) => [g(v, 'P') - g(v, 'l'), g(v, 'P') / 2, g(v, 'P') - 3 * g(v, 'l'), g(v, 'b') + 2],
    why: (v, a) => `${v.P} ${MINUS} 2 · ${v.l} = ${a}.`,
  }),
  num({
    sub: 'u15-11',
    prompt: 'მართკუთხა სამკუთხედის ერთი კათეტია {l1} სმ, ჰიპოტენუზა კი {h} სმ. იპოვე მეორე კათეტი.',
    vars: triVars(0, 5, 1, 3),
    unit: 'სმ',
    key: (v) => g(v, 'l2'),
    slips: (v) => [g(v, 'h') - g(v, 'l1'), g(v, 'h') + g(v, 'l1'), g(v, 'l2') + 1, g(v, 'l2') - 1],
    why: (v, a) => `b² = ${v.h}² ${MINUS} ${v.l1}² = ${g(v, 'h') ** 2 - g(v, 'l1') ** 2}, ამიტომ b = ${a}.`,
  }),

  // ═════════ U15.12 — სამკუთხედის ფართობი ═════════
  ...[{ bLo: 4, bHi: 20, hLo: 3, hHi: 16 }, { bLo: 6, bHi: 30, hLo: 4, hHi: 24 }].map((o) =>
    num({
      sub: 'u15-12',
      prompt: 'სამკუთხედის ფუძეა {b} სმ, ხოლო შესაბამისი სიმაღლე — {h} სმ. იპოვე ფართობი.',
      vars: { b: I(o.bLo, o.bHi), h: I(o.hLo, o.hHi) },
      constraints: [{ test: (v: Vars) => (g(v, 'b') * g(v, 'h')) % 2 === 0, note: 'a whole area' }],
      unit: 'სმ²',
      key: (v) => (g(v, 'b') * g(v, 'h')) / 2,
      slips: (v) => [g(v, 'b') * g(v, 'h'), g(v, 'b') + g(v, 'h'), (g(v, 'b') + g(v, 'h')) / 2, (g(v, 'b') * g(v, 'h')) / 4],
      why: (v, a) => `S = ½ · b · h = ½ · ${v.b} · ${v.h} = ${a}.`,
    }),
  ),
  num({
    sub: 'u15-12',
    prompt: 'სამკუთხედის ფართობია {S} სმ², ხოლო ფუძეა {b} სმ. იპოვე შესაბამისი სიმაღლე.',
    vars: { b: I(4, 24), h: I(3, 20), S: D((v: Vars) => (g(v, 'b') * g(v, 'h')) / 2) },
    constraints: [{ test: (v: Vars) => (g(v, 'b') * g(v, 'h')) % 2 === 0, note: 'a whole area' }],
    unit: 'სმ',
    key: (v) => g(v, 'h'),
    slips: (v) => [g(v, 'S') / g(v, 'b'), g(v, 'S') * 2, g(v, 'S') - g(v, 'b'), g(v, 'h') * 2],
    why: (v, a) => `h = 2S ÷ b = 2 · ${v.S} ÷ ${v.b} = ${a}.`,
  }),
  num({
    sub: 'u15-12',
    prompt: 'მართკუთხა სამკუთხედის კათეტებია {a} სმ და {b} სმ. იპოვე ფართობი.',
    vars: { a: I(3, 20), b: I(4, 24) },
    constraints: [{ test: (v: Vars) => (g(v, 'a') * g(v, 'b')) % 2 === 0, note: 'a whole area' }],
    unit: 'სმ²',
    key: (v) => (g(v, 'a') * g(v, 'b')) / 2,
    slips: (v) => [g(v, 'a') * g(v, 'b'), g(v, 'a') + g(v, 'b'), (g(v, 'a') + g(v, 'b')) / 2, (g(v, 'a') * g(v, 'b')) / 4],
    why: (v, a) => `კათეტები ერთმანეთის მართობია და ფუძე-სიმაღლეს წარმოადგენს: S = ½ · ${v.a} · ${v.b} = ${a}.`,
  }),
  t({
    sub: 'u15-12',
    prompt: 'ტოლგვერდა სამკუთხედის გვერდია {a} სმ. იპოვე ფართობი ფორმულით S = a²√3/4.',
    vars: { h: I(1, 10), a: D((v: Vars) => 2 * g(v, 'h')) },
    answer: (v) => `${g(v, 'h') ** 2 === 1 ? '' : g(v, 'h') ** 2}√3 სმ²`,
    options: (v, right) => {
      const n = g(v, 'h') ** 2;
      const form = (k: number): string => `${k === 1 ? '' : k}√3 სმ²`;
      return textOptions(right, [form(n * 4), form(n * 2), form(g(v, 'a')), form(n + 1), form(Math.max(1, n - 1)), form(n + 2), form(n * 3)].filter((s) => s !== right));
    },
    why: (v, a) => `S = a²√3/4 = ${g(v, 'a') ** 2}√3/4 = ${a}.`,
  }),
  num({
    sub: 'u15-12',
    prompt: 'სამკუთხედის ფართობია {S} სმ², ხოლო შესაბამისი სიმაღლე — {h} სმ. იპოვე ფუძის სიგრძე.',
    vars: { b: I(4, 24), h: I(5, 20), S: D((v: Vars) => (g(v, 'b') * g(v, 'h')) / 2) },
    constraints: [{ test: (v: Vars) => (g(v, 'b') * g(v, 'h')) % 2 === 0, note: 'a whole area' }],
    unit: 'სმ',
    key: (v) => g(v, 'b'),
    slips: (v) => [g(v, 'S') / g(v, 'h'), g(v, 'S') * 2, g(v, 'S') - g(v, 'h'), g(v, 'b') * 2],
    why: (v, a) => `b = 2S ÷ h = 2 · ${v.S} ÷ ${v.h} = ${a}.`,
  }),
];

/** `3, 4, 5, 6` for the integers lo … hi. */
function rangeText(lo: number, hi: number): string {
  return Array.from({ length: hi - lo + 1 }, (_, i) => String(lo + i)).join(', ');
}

