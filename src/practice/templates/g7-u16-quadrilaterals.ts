import type { QuestionTemplate, Vars } from './types';
import { C, D, I, MINUS, N, group, q6 } from './g6-helpers';
import { textOptions, unitOptions } from './g7-u08-proportion-percent';

/**
 * Grade VII — Unit 16: quadrilaterals.
 *
 * Converted from the academy's Grade VII `U16` bank: 7 subtopics × 6 questions.
 *
 * Every task is generated from the finished figure — both sides and an angle, or
 * both bases and the height — and the printed data follow from it, so areas and
 * halves are always whole numbers and no draw has to be rejected. Verbal
 * questions (which quadrilateral, is it a parallelogram) pick from a short list of
 * hand-checked descriptions; the sufficient and the insufficient conditions are
 * kept in separate pools so that the answer is known by construction.
 */

export const G7_U16_SUBTOPICS = ['u16-01', 'u16-02', 'u16-03', 'u16-04', 'u16-05', 'u16-06', 'u16-07'] as const;

const T = 'g7-quadrilaterals';
let seq = 0;
const nextId = (): string => `g7-u16-q${String(++seq).padStart(2, '0')}`;
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

/** `3x + 10`. */
const lin = (a: number, b: number): string => `${a === 1 ? '' : a}x ${b < 0 ? `${MINUS} ${-b}` : `+ ${b}`}`;

// ───────────────────────────── shapes ─────────────────────────────

const POLYGONS: Array<[string, number]> = [['სამკუთხედს', 3], ['ოთხკუთხედს', 4], ['ხუთკუთხედს', 5], ['ექვსკუთხედს', 6], ['შვიდკუთხედს', 7], ['რვაკუთხედს', 8]];
const ELEMENTS = ['გვერდი', 'წვერო', 'კუთხე', 'დიაგონალი'];
const countOf = (el: number, n: number): number => (el === 3 ? (n * (n - 3)) / 2 : n);

const RHOMBUS = 'რომბი';
const SQUARE = 'კვადრატი';
const RECT = 'მართკუთხედი';
const PARALLELOGRAM = 'პარალელოგრამი';
const TRAPEZOID = 'ტრაპეცია';
const KINDS: Array<{ desc: string[]; name: string }> = [
  { desc: ['ოთხივე გვერდი ტოლი აქვს, მაგრამ მისი კუთხეები მართი არ არის', 'ოთხივე გვერდი ტოლია, ხოლო კუთხეები არც ერთი არ არის მართი'], name: RHOMBUS },
  { desc: ['ოთხივე გვერდი ტოლი და ოთხივე კუთხე მართი აქვს', 'ყველა გვერდი ტოლია და ყველა კუთხე მართია'], name: SQUARE },
  { desc: ['ოთხივე კუთხე მართია, მაგრამ მეზობელი გვერდები ერთმანეთის ტოლი არ არის', 'ყველა კუთხე მართი აქვს, ხოლო გვერდები ორ-ორი სხვადასხვა სიგრძისაა'], name: RECT },
  { desc: ['ორივე წყვილი მოპირდაპირე გვერდი პარალელურია, მაგრამ კუთხეები მართი არ არის და მეზობელი გვერდები ტოლი არ არის', 'მოპირდაპირე გვერდები წყვილებად პარალელური და ტოლია, ხოლო კუთხეები მართი არ არის და გვერდები ერთნაირი არ არის'], name: PARALLELOGRAM },
  { desc: ['მხოლოდ ერთი წყვილი მოპირდაპირე გვერდი აქვს პარალელური', 'ორი გვერდი პარალელური აქვს, დანარჩენი ორი კი პარალელური არ არის'], name: TRAPEZOID },
];
const SHAPE_NAMES = [RHOMBUS, SQUARE, RECT, PARALLELOGRAM, TRAPEZOID];

const DIAG: Array<[string, string]> = [['AO', 'AC'], ['CO', 'AC'], ['BO', 'BD'], ['DO', 'BD']];

const SUFFICIENT = ['დიაგონალები ერთმანეთს შუაზე ყოფს', 'ორივე წყვილი მოპირდაპირე გვერდი ტოლია', 'ორი მოპირდაპირე გვერდი პარალელური და ტოლია', 'ორივე წყვილი მოპირდაპირე კუთხე ტოლია'];
const INSUFFICIENT = ['მხოლოდ ერთი წყვილი მოპირდაპირე გვერდი პარალელურია', 'დიაგონალები ტოლია', 'დიაგონალები ერთმანეთის მართობია', 'ერთი წყვილი მოპირდაპირე გვერდი ტოლია'];

const quadAngles = (a: number, b: number, c: number): number => 360 - a - b - c;

export const G7_U16_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U16.1 — ოთხკუთხედების კლასიფიკაცია ═════════
  num({
    sub: 'u16-01',
    prompt: 'რამდენი {el} აქვს {shape}?',
    vars: { pi: I(0, POLYGONS.length - 1), ei: I(0, 3), el: D((v: Vars) => ELEMENTS[g(v, 'ei')]!), shape: D((v: Vars) => POLYGONS[g(v, 'pi')]![0]) },
    unit: '',
    key: (v) => countOf(g(v, 'ei'), POLYGONS[g(v, 'pi')]![1]),
    slips: (v) => [POLYGONS[g(v, 'pi')]![1], POLYGONS[g(v, 'pi')]![1] - 1, POLYGONS[g(v, 'pi')]![1] + 1, POLYGONS[g(v, 'pi')]![1] - 2],
    why: (v, a) => (g(v, 'ei') === 3 ? `n-კუთხედის დიაგონალების რაოდენობაა n(n ${MINUS} 3)/2 = ${POLYGONS[g(v, 'pi')]![1]} · ${POLYGONS[g(v, 'pi')]![1] - 3} ÷ 2 = ${a}.` : `${v.shape} ${a} ${v.el} აქვს.`),
  }),
  num({
    sub: 'u16-01',
    prompt: 'მართკუთხედის სიგრძეა {l} სმ, ხოლო სიგანე — {w} სმ. იპოვე მისი პერიმეტრი.',
    vars: { l: I(4, 30), w: I(2, 20) },
    constraints: [{ test: (v: Vars) => g(v, 'l') > g(v, 'w'), note: 'length exceeds width' }],
    unit: 'სმ',
    key: (v) => 2 * (g(v, 'l') + g(v, 'w')),
    slips: (v) => [g(v, 'l') + g(v, 'w'), g(v, 'l') * g(v, 'w'), 2 * g(v, 'l') + g(v, 'w'), 2 * g(v, 'l') * g(v, 'w')],
    why: (v, a) => `P = 2 · (${v.l} + ${v.w}) = ${a}.`,
  }),
  num({
    sub: 'u16-01',
    prompt: 'კვადრატის გვერდის სიგრძეა {a} სმ. იპოვე მისი პერიმეტრი.',
    vars: { a: I(2, 40) },
    unit: 'სმ',
    key: (v) => 4 * g(v, 'a'),
    slips: (v) => [2 * g(v, 'a'), g(v, 'a') * g(v, 'a'), 3 * g(v, 'a'), 8 * g(v, 'a')],
    why: (v, a) => `P = 4 · ${v.a} = ${a}.`,
  }),
  num({
    sub: 'u16-01',
    prompt: 'ოთხკუთხედის სამი კუთხეა {a}°, {b}° და {c}°. იპოვე მეოთხე კუთხე.',
    vars: { a: I(60, 120, { step: 5 }), b: I(60, 120, { step: 5 }), c: I(60, 120, { step: 5 }) },
    constraints: [{ test: (v: Vars) => g(v, 'a') + g(v, 'b') + g(v, 'c') < 345, note: 'a real fourth angle' }],
    unit: '°',
    key: (v) => quadAngles(g(v, 'a'), g(v, 'b'), g(v, 'c')),
    slips: (v) => [180 - g(v, 'a') - g(v, 'b') - g(v, 'c'), 360 - g(v, 'a') - g(v, 'b'), g(v, 'a') + g(v, 'b') + g(v, 'c') - 180, 540 - g(v, 'a') - g(v, 'b') - g(v, 'c')],
    why: (v, a) => `ოთხკუთხედის კუთხეების ჯამია 360°: 360° ${MINUS} ${v.a}° ${MINUS} ${v.b}° ${MINUS} ${v.c}° = ${a}.`,
  }),
  t({
    sub: 'u16-01',
    prompt: 'ოთხკუთხედს {desc}. რა ტიპის ოთხკუთხედი შეიძლება იყოს ეს?',
    vars: { k: I(0, KINDS.length - 1), w: C([0, 1]), desc: D((v: Vars) => KINDS[g(v, 'k')]!.desc[g(v, 'w')]!) },
    answer: (v) => KINDS[g(v, 'k')]!.name,
    options: (_v, right) => textOptions(right, SHAPE_NAMES),
    why: (v, a) => `ოთხკუთხედი, რომელსაც ${v.desc}, არის ${a}.`,
  }),
  t({
    sub: 'u16-01',
    prompt: 'პარალელოგრამის ერთი კუთხეა {a}°. იპოვე დანარჩენი სამი კუთხე.',
    vars: { a: I(30, 150) },
    constraints: [{ test: (v: Vars) => g(v, 'a') !== 90, note: 'two different angles' }],
    answer: (v) => `${180 - g(v, 'a')}°, ${g(v, 'a')}° და ${180 - g(v, 'a')}°`,
    options: (v, right) => {
      const a = g(v, 'a');
      return textOptions(right, [`${a}°, ${a}° და ${180 - a}°`, `${180 - a}°, ${180 - a}° და ${180 - a}°`, `${180 - a}°, ${a}° და ${a}°`, `${a}°, ${360 - a}° და ${a}°`]);
    },
    why: (v, a) => `მოსაზღვრე კუთხე 180° ${MINUS} ${v.a}° = ${180 - g(v, 'a')}°, მოპირდაპირე კუთხეები ტოლია. დანარჩენი სამია ${a}.`,
  }),

  // ═════════ U16.2 — პარალელოგრამის ნიშნები ═════════
  num({
    sub: 'u16-02',
    prompt: 'პარალელოგრამის ერთი გვერდის სიგრძეა {a} სმ. რა სიგრძისაა მის მოპირდაპირე გვერდი?',
    vars: { a: I(3, 40) },
    unit: 'სმ',
    key: (v) => g(v, 'a'),
    slips: (v) => [g(v, 'a') * 2, g(v, 'a') / 2, g(v, 'a') + 2, g(v, 'a') - 2],
    why: (v, a) => `პარალელოგრამის მოპირდაპირე გვერდები ტოლია: ${v.a} სმ = ${a}.`,
  }),
  num({
    sub: 'u16-02',
    prompt: 'პარალელოგრამის ერთი კუთხეა {a}°. იპოვე მასთან მოსაზღვრე კუთხე.',
    vars: { a: I(30, 150) },
    constraints: [{ test: (v: Vars) => g(v, 'a') !== 90, note: 'two different angles' }],
    unit: '°',
    key: (v) => 180 - g(v, 'a'),
    slips: (v) => [g(v, 'a'), 90 - g(v, 'a'), 360 - g(v, 'a'), g(v, 'a') + 90],
    why: (v, a) => `პარალელოგრამის მოსაზღვრე კუთხეების ჯამია 180°: 180° ${MINUS} ${v.a}° = ${a}.`,
  }),
  num({
    sub: 'u16-02',
    prompt: 'პარალელოგრამის მოპირდაპირე კუთხეებია ({e})° და {c}°. იპოვე x.',
    vars: {
      p: I(2, 5),
      b: I(5, 40),
      x: I(5, (v: Vars) => Math.floor((170 - g(v, 'b')) / g(v, 'p'))),
      c: D((v: Vars) => g(v, 'p') * g(v, 'x') + g(v, 'b')),
      e: D((v: Vars) => lin(g(v, 'p'), g(v, 'b'))),
    },
    unit: '',
    key: (v) => g(v, 'x'),
    slips: (v) => [(g(v, 'c') - g(v, 'b')) / g(v, 'p'), (g(v, 'c') + g(v, 'b')) / g(v, 'p'), g(v, 'c') / g(v, 'p'), g(v, 'c') - g(v, 'b')],
    why: (v, a) => `მოპირდაპირე კუთხეები ტოლია: ${v.e} = ${v.c}, ამიტომ ${v.p}x = ${g(v, 'c') - g(v, 'b')} და x = ${a}.`,
  }),
  num({
    sub: 'u16-02',
    prompt: 'პარალელოგრამის გვერდებია {a} სმ და {b} სმ. იპოვე პერიმეტრი.',
    vars: { a: I(3, 30), b: I(2, 24) },
    constraints: [{ test: (v: Vars) => g(v, 'a') !== g(v, 'b'), note: 'two different sides' }],
    unit: 'სმ',
    key: (v) => 2 * (g(v, 'a') + g(v, 'b')),
    slips: (v) => [g(v, 'a') + g(v, 'b'), g(v, 'a') * g(v, 'b'), 2 * g(v, 'a') + g(v, 'b'), 2 * g(v, 'a') * g(v, 'b')],
    why: (v, a) => `P = 2 · (${v.a} + ${v.b}) = ${a}.`,
  }),
  num({
    sub: 'u16-02',
    prompt: 'პარალელოგრამის დიაგონალები იკვეთება წერტილ O-ში. თუ {half} = {h} სმ და {diag} დიაგონალია, იპოვე {diag}.',
    vars: { i: I(0, DIAG.length - 1), h: I(2, 40), half: D((v: Vars) => DIAG[g(v, 'i')]![0]), diag: D((v: Vars) => DIAG[g(v, 'i')]![1]) },
    unit: 'სმ',
    key: (v) => 2 * g(v, 'h'),
    slips: (v) => [g(v, 'h'), 4 * g(v, 'h'), g(v, 'h') + 2, g(v, 'h') * g(v, 'h')],
    why: (v, a) => `პარალელოგრამის დიაგონალები გადაკვეთის წერტილში შუაზე იყოფა: ${v.diag} = 2 · ${v.h} = ${a}.`,
  }),
  yesNo(
    'u16-02',
    'ოთხკუთხედის {cond}. შეიძლება თუ არა დავასკვნათ, რომ ეს ოთხკუთხედი პარალელოგრამია? უპასუხე „კი“ ან „არა“.',
    { s: C([0, 1]), i: I(0, 3), cond: D((v: Vars) => (g(v, 's') ? SUFFICIENT : INSUFFICIENT)[g(v, 'i')]!) },
    (v) => !!g(v, 's'),
    (v, a) => (g(v, 's') ? `ოთხკუთხედი, რომლის ${v.cond}, პარალელოგრამია — ეს პარალელოგრამის ნიშანია. პასუხი: ${a}.` : `ოთხკუთხედის ${v.cond} — ეს პარალელოგრამად ქცევისთვის საკმარისი არ არის (ეს შეიძლება ტრაპეციაც იყოს). პასუხი: ${a}.`),
  ),

  // ═════════ U16.3 — ტრაპეციის ელემენტები ═════════
  num({
    sub: 'u16-03',
    prompt: 'ტრაპეციის ფუძეებია {a} სმ და {b} სმ. იპოვე ფუძეების საშუალო არითმეტიკული.',
    vars: { a: I(4, 24), b: I(6, 30) },
    constraints: [{ test: (v: Vars) => (g(v, 'a') + g(v, 'b')) % 2 === 0 && g(v, 'a') !== g(v, 'b'), note: 'a whole mean of two different bases' }],
    unit: 'სმ',
    key: (v) => (g(v, 'a') + g(v, 'b')) / 2,
    slips: (v) => [g(v, 'a') + g(v, 'b'), Math.abs(g(v, 'b') - g(v, 'a')) / 2, g(v, 'b') - g(v, 'a'), (g(v, 'a') + g(v, 'b')) / 4],
    why: (v, a) => `(${v.a} + ${v.b}) ÷ 2 = ${a}.`,
  }),
  num({
    sub: 'u16-03',
    prompt: 'ტრაპეციის ფუძეებია {a} სმ და {b} სმ, ხოლო სიმაღლე — {h} სმ. იპოვე ფართობი.',
    vars: { a: I(4, 20), b: I(6, 26), h: I(3, 12) },
    constraints: [{ test: (v: Vars) => ((g(v, 'a') + g(v, 'b')) * g(v, 'h')) % 2 === 0 && g(v, 'a') !== g(v, 'b'), note: 'a whole area' }],
    unit: 'სმ²',
    key: (v) => ((g(v, 'a') + g(v, 'b')) * g(v, 'h')) / 2,
    slips: (v) => [(g(v, 'a') + g(v, 'b')) * g(v, 'h'), g(v, 'a') * g(v, 'b') * g(v, 'h') / 2, (g(v, 'a') + g(v, 'b')) / 2 + g(v, 'h'), ((g(v, 'a') + g(v, 'b')) * g(v, 'h')) / 4],
    why: (v, a) => `S = (a + b) · h ÷ 2 = (${v.a} + ${v.b}) · ${v.h} ÷ 2 = ${a}.`,
  }),
  t({
    sub: 'u16-03',
    prompt: 'ტოლფერდა ტრაპეციის ერთ-ერთი ფუძის კუთხეა {a}°. იპოვე {which} მდებარე მეორე კუთხე.',
    vars: { a: I(40, 85), k: C([0, 1]), which: D((v: Vars) => (g(v, 'k') ? 'მეორე ფუძესთან' : 'იმავე ფუძესთან')) },
    answer: (v) => `${g(v, 'k') ? 180 - g(v, 'a') : g(v, 'a')}°`,
    options: (v) => unitOptions(g(v, 'k') ? 180 - g(v, 'a') : g(v, 'a'), '°', [g(v, 'a'), 180 - g(v, 'a'), 90 - g(v, 'a'), 360 - 2 * g(v, 'a')]),
    why: (v, a) => (g(v, 'k') ? `ფუძესთან მდებარე კუთხე და მეორე ფუძესთან მდებარე კუთხე ცალმხრივია, ჯამი 180°: 180° ${MINUS} ${v.a}° = ${a}.` : `ტოლფერდა ტრაპეციის ერთი ფუძის კუთხეები ტოლია: ${a}.`),
  }),
  num({
    sub: 'u16-03',
    prompt: 'ტრაპეციის ფუძეებია {a} სმ და {b} სმ. იპოვე შუახაზის სიგრძე.',
    vars: { a: I(3, 24), b: I(5, 30) },
    constraints: [{ test: (v: Vars) => (g(v, 'a') + g(v, 'b')) % 2 === 0 && g(v, 'a') !== g(v, 'b'), note: 'a whole midline of two different bases' }],
    unit: 'სმ',
    key: (v) => (g(v, 'a') + g(v, 'b')) / 2,
    slips: (v) => [g(v, 'a') + g(v, 'b'), Math.abs(g(v, 'b') - g(v, 'a')) / 2, g(v, 'b') - g(v, 'a'), (g(v, 'a') + g(v, 'b')) / 4],
    why: (v, a) => `შუახაზი ფუძეების ნახევარჯამია: (${v.a} + ${v.b}) ÷ 2 = ${a}.`,
  }),
  num({
    sub: 'u16-03',
    prompt: 'ტრაპეციის შუახაზია {m} სმ, ხოლო ერთი ფუძე — {a} სმ. იპოვე მეორე ფუძე.',
    vars: { a: I(3, 20), b: I(5, 30), m: D((v: Vars) => (g(v, 'a') + g(v, 'b')) / 2) },
    constraints: [{ test: (v: Vars) => (g(v, 'a') + g(v, 'b')) % 2 === 0 && g(v, 'a') !== g(v, 'b'), note: 'a whole midline of two different bases' }],
    unit: 'სმ',
    key: (v) => g(v, 'b'),
    slips: (v) => [g(v, 'm') * 2, g(v, 'm') - g(v, 'a'), g(v, 'm') + g(v, 'a'), 2 * g(v, 'm') + g(v, 'a')],
    why: (v, a) => `ფუძეების ჯამი 2 · ${v.m} = ${2 * g(v, 'm')}, ამიტომ მეორე ფუძეა ${2 * g(v, 'm')} ${MINUS} ${v.a} = ${a}.`,
  }),
  num({
    sub: 'u16-03',
    prompt: 'ტრაპეციის ფუძეებია {a} სმ და {b} სმ, ხოლო სიმაღლე — {h} სმ. იპოვე ფართობი.',
    vars: { a: I(6, 24), b: I(8, 30), h: I(4, 14) },
    constraints: [{ test: (v: Vars) => ((g(v, 'a') + g(v, 'b')) * g(v, 'h')) % 2 === 0 && g(v, 'a') !== g(v, 'b'), note: 'a whole area' }],
    unit: 'სმ²',
    key: (v) => ((g(v, 'a') + g(v, 'b')) * g(v, 'h')) / 2,
    slips: (v) => [(g(v, 'a') + g(v, 'b')) * g(v, 'h'), (g(v, 'a') + g(v, 'b')) / 2 + g(v, 'h'), g(v, 'a') * g(v, 'h'), ((g(v, 'a') + g(v, 'b')) * g(v, 'h')) / 4],
    why: (v, a) => `S = (${v.a} + ${v.b}) · ${v.h} ÷ 2 = ${a}.`,
  }),

  // ═════════ U16.4 — ამოცანები ოთხკუთხედებზე ═════════
  num({
    sub: 'u16-04',
    prompt: 'ოთხკუთხედის სამი კუთხეა {a}°, {b}° და {c}°. იპოვე მეოთხე კუთხე.',
    vars: { a: I(55, 125, { step: 5 }), b: I(55, 125, { step: 5 }), c: I(55, 125, { step: 5 }) },
    constraints: [{ test: (v: Vars) => g(v, 'a') + g(v, 'b') + g(v, 'c') < 345, note: 'a real fourth angle' }],
    unit: '°',
    key: (v) => quadAngles(g(v, 'a'), g(v, 'b'), g(v, 'c')),
    slips: (v) => [180 - g(v, 'a') - g(v, 'b') - g(v, 'c'), 360 - g(v, 'a') - g(v, 'b'), g(v, 'a') + g(v, 'b') + g(v, 'c') - 180, 540 - g(v, 'a') - g(v, 'b') - g(v, 'c')],
    why: (v, a) => `360° ${MINUS} ${v.a}° ${MINUS} ${v.b}° ${MINUS} ${v.c}° = ${a}.`,
  }),
  num({
    sub: 'u16-04',
    prompt: 'მართკუთხედის სიგრძეა {l} სმ, სიგანე — {w} სმ. იპოვე პერიმეტრი.',
    vars: { l: I(6, 40), w: I(3, 30) },
    constraints: [{ test: (v: Vars) => g(v, 'l') > g(v, 'w'), note: 'length exceeds width' }],
    unit: 'სმ',
    key: (v) => 2 * (g(v, 'l') + g(v, 'w')),
    slips: (v) => [g(v, 'l') + g(v, 'w'), g(v, 'l') * g(v, 'w'), 2 * g(v, 'l') + g(v, 'w'), 2 * g(v, 'l') * g(v, 'w')],
    why: (v, a) => `P = 2 · (${v.l} + ${v.w}) = ${a}.`,
  }),
  num({
    sub: 'u16-04',
    prompt: 'კვადრატის პერიმეტრია {P} სმ. იპოვე მისი გვერდის სიგრძე.',
    vars: { a: I(3, 40), P: D((v: Vars) => 4 * g(v, 'a')) },
    unit: 'სმ',
    key: (v) => g(v, 'a'),
    slips: (v) => [g(v, 'P') / 2, g(v, 'P') / 3, g(v, 'P') - 4, g(v, 'P')],
    why: (v, a) => `${v.P} ÷ 4 = ${a}.`,
  }),
  num({
    sub: 'u16-04',
    prompt: 'პარალელოგრამის პერიმეტრია {P} სმ. ერთი გვერდის სიგრძეა {a} სმ. იპოვე მეორე გვერდის სიგრძე.',
    vars: { a: I(5, 30), b: I(3, 26), P: D((v: Vars) => 2 * (g(v, 'a') + g(v, 'b'))) },
    constraints: [{ test: (v: Vars) => g(v, 'a') !== g(v, 'b'), note: 'two different sides' }],
    unit: 'სმ',
    key: (v) => g(v, 'b'),
    slips: (v) => [g(v, 'P') - g(v, 'a'), g(v, 'P') / 2, g(v, 'P') - 2 * g(v, 'a') + 2, g(v, 'P') / 2 + g(v, 'a')],
    why: (v, a) => `P/2 = ${g(v, 'P') / 2}, ამიტომ მეორე გვერდია ${g(v, 'P') / 2} ${MINUS} ${v.a} = ${a}.`,
  }),
  num({
    sub: 'u16-04',
    prompt: 'რომბის პერიმეტრია {P} სმ. იპოვე ერთი გვერდის სიგრძე.',
    vars: { a: I(3, 50), P: D((v: Vars) => 4 * g(v, 'a')) },
    unit: 'სმ',
    key: (v) => g(v, 'a'),
    slips: (v) => [g(v, 'P') / 2, g(v, 'P') / 3, g(v, 'P') - 4, g(v, 'a') * 2],
    why: (v, a) => `რომბის ოთხივე გვერდი ტოლია: ${v.P} ÷ 4 = ${a}.`,
  }),
  num({
    sub: 'u16-04',
    prompt: 'ოთხკუთხედის კუთხეებია x°, ({e1})°, {e2}° და {c}°. იპოვე x.',
    vars: {
      q: I(2, 4),
      b: I(10, 40, { step: 5 }),
      x: I(15, (v: Vars) => Math.floor((360 - g(v, 'b') - 40) / (2 + g(v, 'q')))),
      c: D((v: Vars) => 360 - (2 + g(v, 'q')) * g(v, 'x') - g(v, 'b')),
      e1: D((v: Vars) => lin(1, g(v, 'b'))),
      e2: D((v: Vars) => `${g(v, 'q')}x`),
    },
    constraints: [{ test: (v: Vars) => g(v, 'c') > 0 && g(v, 'c') < 180, note: 'a real fourth angle' }],
    unit: '',
    key: (v) => g(v, 'x'),
    slips: (v) => [(360 - g(v, 'c')) / (2 + g(v, 'q')), (360 - g(v, 'b') - g(v, 'c')) / (1 + g(v, 'q')), (180 - g(v, 'b') - g(v, 'c')) / (2 + g(v, 'q')), g(v, 'x') + 5],
    why: (v, a) => `x + (${v.e1}) + ${v.e2} + ${v.c} = 360, ამიტომ ${2 + g(v, 'q')}x = ${360 - g(v, 'b') - g(v, 'c')} და x = ${a}.`,
  }),

  // ═════════ U16.5 — პარალელოგრამის ფართობი ═════════
  ...[{ bLo: 6, bHi: 20, hLo: 3, hHi: 12 }, { bLo: 8, bHi: 30, hLo: 4, hHi: 16 }, { bLo: 10, bHi: 40, hLo: 5, hHi: 20 }].map((o) =>
    num({
      sub: 'u16-05',
      prompt: 'პარალელოგრამის ფუძეა {b} სმ, ხოლო შესაბამისი სიმაღლე — {h} სმ. იპოვე ფართობი.',
      vars: { b: I(o.bLo, o.bHi), h: I(o.hLo, o.hHi) },
      unit: 'სმ²',
      key: (v) => g(v, 'b') * g(v, 'h'),
      slips: (v) => [(g(v, 'b') * g(v, 'h')) / 2, g(v, 'b') + g(v, 'h'), 2 * (g(v, 'b') + g(v, 'h')), g(v, 'b') * g(v, 'h') * 2],
      why: (v, a) => `S = a · h = ${v.b} · ${v.h} = ${a}.`,
    }),
  ),
  ...[{ ask: 'სიმაღლე', given: 'ფუძე', unknownKey: 'h' }, { ask: 'ფუძე', given: 'სიმაღლე', unknownKey: 'b' }, { ask: 'სიმაღლე', given: 'ფუძე', unknownKey: 'h' }].map((o, index) =>
    num({
      sub: 'u16-05',
      prompt: `პარალელოგრამის ფართობია {S} სმ², ხოლო ${o.given} — {k} სმ. იპოვე შესაბამისი ${o.ask}.`,
      vars: { b: I(index === 2 ? 8 : 4, index === 2 ? 30 : 24), h: I(index === 2 ? 5 : 3, index === 2 ? 20 : 16), S: D((v: Vars) => g(v, 'b') * g(v, 'h')), k: D((v: Vars) => g(v, o.unknownKey === 'h' ? 'b' : 'h')) },
      unit: 'სმ',
      key: (v) => g(v, o.unknownKey),
      slips: (v) => [g(v, 'S') * g(v, 'k'), g(v, 'S') - g(v, 'k'), g(v, 'S') + g(v, 'k'), (g(v, 'S') / g(v, 'k')) * 2],
      why: (v, a) => `S = a · h, ამიტომ ${o.ask} = ${v.S} ÷ ${v.k} = ${a}.`,
    }),
  ),

  // ═════════ U16.6 — რომბის ფართობი ═════════
  ...[{ lo: 6, hi: 20 }, { lo: 8, hi: 24 }, { lo: 10, hi: 30 }, { lo: 12, hi: 36 }].map((o) =>
    num({
      sub: 'u16-06',
      prompt: 'რომბის დიაგონალებია {a} სმ და {b} სმ. იპოვე ფართობი.',
      vars: { a: I(o.lo, o.hi), b: I(o.lo - 2, o.hi - 4) },
      constraints: [{ test: (v: Vars) => (g(v, 'a') * g(v, 'b')) % 2 === 0 && g(v, 'a') !== g(v, 'b'), note: 'a whole area' }],
      unit: 'სმ²',
      key: (v) => (g(v, 'a') * g(v, 'b')) / 2,
      slips: (v) => [g(v, 'a') * g(v, 'b'), g(v, 'a') + g(v, 'b'), (g(v, 'a') * g(v, 'b')) / 4, 2 * (g(v, 'a') + g(v, 'b'))],
      why: (v, a) => `S = d₁ · d₂ ÷ 2 = ${v.a} · ${v.b} ÷ 2 = ${a}.`,
    }),
  ),
  ...[{ lo: 6, hi: 20 }, { lo: 8, hi: 26 }].map((o) =>
    num({
      sub: 'u16-06',
      prompt: 'რომბის ფართობია {S} სმ², ხოლო ერთი დიაგონალი — {a} სმ. იპოვე მეორე დიაგონალი.',
      vars: { a: I(o.lo, o.hi), b: I(o.lo - 2, o.hi - 2), S: D((v: Vars) => (g(v, 'a') * g(v, 'b')) / 2) },
      constraints: [{ test: (v: Vars) => (g(v, 'a') * g(v, 'b')) % 2 === 0 && g(v, 'a') !== g(v, 'b'), note: 'a whole area' }],
      unit: 'სმ',
      key: (v) => g(v, 'b'),
      slips: (v) => [g(v, 'S') / g(v, 'a'), g(v, 'S') * 2, g(v, 'S') - g(v, 'a'), (g(v, 'S') * 4) / g(v, 'a')],
      why: (v, a) => `d₂ = 2S ÷ d₁ = 2 · ${v.S} ÷ ${v.a} = ${a}.`,
    }),
  ),

  // ═════════ U16.7 — ტრაპეციის ფართობი ═════════
  ...[{ aLo: 6, aHi: 16, bLo: 8, bHi: 22, hLo: 4, hHi: 10 }, { aLo: 8, aHi: 20, bLo: 10, bHi: 26, hLo: 4, hHi: 12 }, { aLo: 10, aHi: 24, bLo: 12, bHi: 30, hLo: 5, hHi: 14 }].map((o) =>
    num({
      sub: 'u16-07',
      prompt: 'ტრაპეციის ფუძეებია {a} სმ და {b} სმ, ხოლო სიმაღლე — {h} სმ. იპოვე ფართობი.',
      vars: { a: I(o.aLo, o.aHi), b: I(o.bLo, o.bHi), h: I(o.hLo, o.hHi) },
      constraints: [{ test: (v: Vars) => ((g(v, 'a') + g(v, 'b')) * g(v, 'h')) % 2 === 0 && g(v, 'a') !== g(v, 'b'), note: 'a whole area' }],
      unit: 'სმ²',
      key: (v) => ((g(v, 'a') + g(v, 'b')) * g(v, 'h')) / 2,
      slips: (v) => [(g(v, 'a') + g(v, 'b')) * g(v, 'h'), g(v, 'a') * g(v, 'b') * g(v, 'h') / 2, (g(v, 'a') + g(v, 'b')) / 2 + g(v, 'h'), ((g(v, 'a') + g(v, 'b')) * g(v, 'h')) / 4],
      why: (v, a) => `S = (a + b) · h ÷ 2 = (${v.a} + ${v.b}) · ${v.h} ÷ 2 = ${a}.`,
    }),
  ),
  ...[{ aLo: 6, aHi: 14, bLo: 8, bHi: 20, hLo: 3, hHi: 12 }, { aLo: 8, aHi: 18, bLo: 10, bHi: 24, hLo: 4, hHi: 14 }].map((o) =>
    num({
      sub: 'u16-07',
      prompt: 'ტრაპეციის ფართობია {S} სმ², ფუძეებია {a} სმ და {b} სმ. იპოვე სიმაღლე.',
      vars: { a: I(o.aLo, o.aHi), b: I(o.bLo, o.bHi), h: I(o.hLo, o.hHi), S: D((v: Vars) => ((g(v, 'a') + g(v, 'b')) * g(v, 'h')) / 2) },
      constraints: [{ test: (v: Vars) => ((g(v, 'a') + g(v, 'b')) * g(v, 'h')) % 2 === 0 && g(v, 'a') !== g(v, 'b'), note: 'a whole area' }],
      unit: 'სმ',
      key: (v) => g(v, 'h'),
      slips: (v) => [g(v, 'S') / (g(v, 'a') + g(v, 'b')), (g(v, 'S') * 2) / (g(v, 'a') + g(v, 'b')) + 1, g(v, 'S') / g(v, 'a'), g(v, 'S') - g(v, 'a') - g(v, 'b')],
      why: (v, a) => `h = 2S ÷ (a + b) = 2 · ${v.S} ÷ (${v.a} + ${v.b}) = ${a}.`,
    }),
  ),
  num({
    sub: 'u16-07',
    prompt: 'ტრაპეციის ფართობია {S} სმ², სიმაღლე — {h} სმ, ხოლო ერთი ფუძე — {a} სმ. იპოვე მეორე ფუძე.',
    vars: { a: I(5, 16), b: I(7, 22), h: I(4, 12), S: D((v: Vars) => ((g(v, 'a') + g(v, 'b')) * g(v, 'h')) / 2) },
    constraints: [{ test: (v: Vars) => ((g(v, 'a') + g(v, 'b')) * g(v, 'h')) % 2 === 0 && g(v, 'a') !== g(v, 'b'), note: 'a whole area' }],
    unit: 'სმ',
    key: (v) => g(v, 'b'),
    slips: (v) => [(2 * g(v, 'S')) / g(v, 'h'), g(v, 'S') / g(v, 'h') - g(v, 'a'), g(v, 'S') / g(v, 'h') + g(v, 'a'), (2 * g(v, 'S')) / g(v, 'h') + g(v, 'a')],
    why: (v, a) => `a + b = 2S ÷ h = ${(2 * g(v, 'S')) / g(v, 'h')}, ამიტომ მეორე ფუძეა ${(2 * g(v, 'S')) / g(v, 'h')} ${MINUS} ${v.a} = ${a}.`,
  }),
];
