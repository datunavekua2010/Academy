import type { QuestionTemplate, Vars } from './types';
import { C, D, I, MINUS, N, fr, mText, q6 } from './g6-helpers';
import { dd } from './g6-dec';
import { group } from './g5-helpers';

/**
 * Grade VII — Unit 8: proportion and percent.
 *
 * Converted from the academy's Grade VII `U08` bank: 9 subtopics × 6 questions.
 *
 * Every task is built backwards from whole-number data, so each answer is a
 * whole number (or a lowest-terms fraction). Answers carry their unit
 * (`36 ლარი`, `45%`, `40°`). Slips are the slips of the topic: a direct
 * proportion used for an inverse one, a percent added without being taken, the
 * rate used for the whole period, the ratio parts swapped.
 */

export const G7_U08_SUBTOPICS = ['u08-01', 'u08-02', 'u08-03', 'u08-04', 'u08-05', 'u08-06', 'u08-07', 'u08-08', 'u08-09'] as const;

const T = 'g7-proportion-percent';
let seq = 0;
const nextId = (): string => `g7-u08-q${String(++seq).padStart(2, '0')}`;
type Spec = Omit<Parameters<typeof q6>[0], 'id' | 'topic' | 'grade'>;
const t = (spec: Spec): QuestionTemplate => q6({ id: nextId(), topic: T, grade: 7, ...spec });

const g = (v: Vars, key: string): number => N(v, key);
/** A numeric variable shown with thousands grouping. */
export const G = (key: string) => D((v: Vars) => group(N(v, key)));
const LETTERS = ['x', 'y', 't', 'm'];
const Lvar = C(LETTERS);

/** `36 ლარი`, `45%`, `40°`. */
export const fmt = (n: number, unit: string): string => (unit === '%' || unit === '°' ? `${n}${unit}` : unit ? `${group(n)} ${unit}` : group(n));
/** The key first, then whole positive slips, then neighbours so four distinct always exist. */
export const unitOptions = (key: number, unit: string, slips: number[]): string[] => {
  const out = [fmt(key, unit)];
  const step = key >= 100 ? 10 : key >= 20 ? 5 : 1;
  for (const n of [...slips, key + step, key - step, key + 2 * step, key - 2 * step, key * 2, key + 1, key - 1]) {
    if (!Number.isInteger(n) || n <= 0) continue;
    const text = fmt(n, unit);
    if (!out.includes(text)) out.push(text);
  }
  return out;
};
export const textOptions = (key: string, wrongs: string[]): string[] => {
  const out = [key];
  for (const w of wrongs) if (!out.includes(w)) out.push(w);
  return out;
};
export const pair = (a: number, b: number, unit: string): string => `${fmt(a, unit)} და ${fmt(b, unit)}`;
const triple = (a: number, b: number, c: number, unit: string): string => `${fmt(a, unit)}, ${fmt(b, unit)}, ${fmt(c, unit)}`;
const YES = 'დიახ';
const NO = 'არა';

export const G7_U08_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U08.1 — პროპორციის ძირითადი თვისებები ═════════
  t({
    sub: 'u08-01',
    prompt: 'იპოვე {L}, თუ {a}/{b} = {L}/{d}.',
    vars: { L: Lvar, a: I(2, 9), b: I(2, 9), k: I(2, 9), d: D((v) => g(v, 'b') * g(v, 'k')) },
    constraints: [{ test: (v: Vars) => g(v, 'a') !== g(v, 'b'), note: 'a real ratio' }],
    answer: (v) => String(g(v, 'a') * g(v, 'k')),
    wrong: (v) => [g(v, 'a') + g(v, 'd') - g(v, 'b'), (g(v, 'a') * g(v, 'b')) , g(v, 'd') - g(v, 'b') + g(v, 'a'), g(v, 'k') * g(v, 'b')],
    why: (v, a) => `${v.d} ÷ ${v.b} = ${v.k}, ამიტომ ${v.L} = ${v.a} · ${v.k} = ${a}.`,
  }),
  t({
    sub: 'u08-01',
    prompt: 'ამოხსენი პროპორცია: {a}/{b} = {c}/{L}.',
    vars: { L: Lvar, a: I(2, 9), b: I(2, 9), k: I(2, 9), c: D((v) => g(v, 'a') * g(v, 'k')) },
    constraints: [{ test: (v: Vars) => g(v, 'a') !== g(v, 'b'), note: 'a real ratio' }],
    answer: (v) => String(g(v, 'b') * g(v, 'k')),
    wrong: (v) => [g(v, 'c') + g(v, 'b') - g(v, 'a'), g(v, 'a') * g(v, 'k'), g(v, 'b') + g(v, 'c'), g(v, 'b') * g(v, 'c')],
    why: (v, a) => `${v.c} ÷ ${v.a} = ${v.k}, ამიტომ ${v.L} = ${v.b} · ${v.k} = ${a}.`,
  }),
  t({
    sub: 'u08-01',
    prompt: 'იპოვე {L}, თუ {a} : {b} = {L} : {d}.',
    vars: { L: Lvar, a: I(2, 12), b: I(2, 12), k: I(2, 8), d: D((v) => g(v, 'b') * g(v, 'k')) },
    constraints: [{ test: (v: Vars) => g(v, 'a') !== g(v, 'b'), note: 'a real ratio' }],
    answer: (v) => String(g(v, 'a') * g(v, 'k')),
    wrong: (v) => [g(v, 'a') + g(v, 'd') - g(v, 'b'), g(v, 'k') * g(v, 'b'), g(v, 'd') - g(v, 'a'), g(v, 'a') * g(v, 'b')],
    why: (v, a) => `${v.d} ÷ ${v.b} = ${v.k}, ამიტომ ${v.L} = ${v.a} · ${v.k} = ${a}.`,
  }),
  t({
    sub: 'u08-01',
    prompt: 'შეამოწმე, ქმნის თუ არა რიცხვები {a}, {b}, {c} და {d} პროპორციას ({a} : {b} = {c} : {d}).',
    vars: { p: I(1, 5), q: I(2, 7), s: I(2, 5), r: I(2, 6), bad: C([0, 1, 1, 0]), a: D((v) => g(v, 'p') * g(v, 's')), b: D((v) => g(v, 'q') * g(v, 's')), c: D((v) => g(v, 'p') * g(v, 'r')), d: D((v) => g(v, 'q') * g(v, 'r') + g(v, 'bad')) },
    constraints: [{ test: (v: Vars) => g(v, 'p') !== g(v, 'q'), note: 'a real ratio' }],
    answer: (v) => (g(v, 'bad') === 0 ? YES : NO),
    options: () => [YES, NO],
    optionCount: 2,
    why: (v, a) => `${v.a} · ${v.d} = ${g(v, 'a') * g(v, 'd')}, ${v.b} · ${v.c} = ${g(v, 'b') * g(v, 'c')}; ${g(v, 'a') * g(v, 'd') === g(v, 'b') * g(v, 'c') ? 'ნამრავლები ტოლია' : 'ნამრავლები განსხვავდება'}. ${a}.`,
  }),
  t({
    sub: 'u08-01',
    prompt: 'იპოვე უცნობი წევრი: {L}/{b} = {p}/{q}.',
    vars: { L: Lvar, p: I(1, 9), q: I(2, 9), k: I(2, 6), b: D((v) => g(v, 'q') * g(v, 'k')) },
    constraints: [{ test: (v: Vars) => g(v, 'p') < g(v, 'q'), note: 'a proper fraction' }],
    answer: (v) => String(g(v, 'p') * g(v, 'k')),
    wrong: (v) => [g(v, 'b') + g(v, 'p') - g(v, 'q'), g(v, 'q') * g(v, 'k'), g(v, 'p') * g(v, 'b'), g(v, 'k') + g(v, 'p')],
    why: (v, a) => `${v.b} ÷ ${v.q} = ${v.k}, ამიტომ ${v.L} = ${v.p} · ${v.k} = ${a}.`,
  }),
  t({
    sub: 'u08-01',
    prompt: 'ამოხსენი პროპორცია: {a}/{L} = {c}/{d}.',
    vars: { L: Lvar, a: I(2, 9), m: I(2, 4), x: I(2, 12), c: D((v) => g(v, 'a') * g(v, 'm')), d: D((v) => g(v, 'x') * g(v, 'm')) },
    answer: (v) => String(g(v, 'x')),
    wrong: (v) => [g(v, 'd') - g(v, 'c') + g(v, 'a'), g(v, 'a') * g(v, 'd'), g(v, 'x') * g(v, 'm'), g(v, 'x') + g(v, 'm')],
    why: (v, a) => `${v.a} · ${v.d} = ${g(v, 'a') * g(v, 'd')}, ${v.c} · ${v.L} = ${g(v, 'a') * g(v, 'd')}; ${v.L} = ${g(v, 'a') * g(v, 'd')} ÷ ${v.c} = ${a}.`,
  }),

  // ═════════ U08.2 — სიდიდის პროპორციულ ნაწილებად დაყოფა ═════════
  t({
    sub: 'u08-02',
    prompt: 'გაყავი {n} ორ ნაწილად შეფარდებით ({a} : {b}).',
    vars: { a: I(1, 7), b: I(2, 9), k: I(2, 9), n: D((v) => (g(v, 'a') + g(v, 'b')) * g(v, 'k')) },
    constraints: [{ test: (v: Vars) => g(v, 'a') < g(v, 'b'), note: 'ordered parts' }],
    answer: (v) => pair(g(v, 'a') * g(v, 'k'), g(v, 'b') * g(v, 'k'), ''),
    options: (v, right) => textOptions(right, [pair(g(v, 'b') * g(v, 'k'), g(v, 'a') * g(v, 'k'), ''), pair(g(v, 'a') * g(v, 'k') + 1, g(v, 'b') * g(v, 'k') - 1, ''), pair(g(v, 'a'), g(v, 'b'), ''), pair(Math.floor(g(v, 'n') / 2), Math.ceil(g(v, 'n') / 2), '')]),
    why: (v, a) => `${v.a} + ${v.b} = ${g(v, 'a') + g(v, 'b')} ნაწილი; ერთი ნაწილი ${v.n} ÷ ${g(v, 'a') + g(v, 'b')} = ${v.k}. ${a}.`,
  }),
  t({
    sub: 'u08-02',
    prompt: 'გაყავი {n} სამ ნაწილად შეფარდებით ({a} : {b} : {c}).',
    vars: { a: I(1, 4), b: I(2, 5), c: I(3, 6), k: I(2, 9), n: D((v) => (g(v, 'a') + g(v, 'b') + g(v, 'c')) * g(v, 'k')) },
    constraints: [{ test: (v: Vars) => g(v, 'a') < g(v, 'b') && g(v, 'b') < g(v, 'c'), note: 'ordered parts' }],
    answer: (v) => triple(g(v, 'a') * g(v, 'k'), g(v, 'b') * g(v, 'k'), g(v, 'c') * g(v, 'k'), ''),
    options: (v, right) => textOptions(right, [triple(g(v, 'c') * g(v, 'k'), g(v, 'b') * g(v, 'k'), g(v, 'a') * g(v, 'k'), ''), triple(g(v, 'a') * g(v, 'k') + 1, g(v, 'b') * g(v, 'k'), g(v, 'c') * g(v, 'k') - 1, ''), triple(g(v, 'a'), g(v, 'b'), g(v, 'c'), ''), triple(g(v, 'k'), g(v, 'k') * 2, g(v, 'n') - 3 * g(v, 'k'), '')]),
    why: (v, a) => `${v.a} + ${v.b} + ${v.c} = ${g(v, 'a') + g(v, 'b') + g(v, 'c')} ნაწილი; ერთი ნაწილი ${v.n} ÷ ${g(v, 'a') + g(v, 'b') + g(v, 'c')} = ${v.k}. ${a}.`,
  }),
  t({
    sub: 'u08-02',
    prompt: 'ორი რიცხვის შეფარდებაა ({a} : {b}), ხოლო მათი ჯამია {n}. იპოვე ორივე რიცხვი.',
    vars: { a: I(1, 8), b: I(2, 9), k: I(2, 9), n: D((v) => (g(v, 'a') + g(v, 'b')) * g(v, 'k')) },
    constraints: [{ test: (v: Vars) => g(v, 'a') < g(v, 'b'), note: 'ordered parts' }],
    answer: (v) => pair(g(v, 'a') * g(v, 'k'), g(v, 'b') * g(v, 'k'), ''),
    options: (v, right) => textOptions(right, [pair(g(v, 'b') * g(v, 'k'), g(v, 'a') * g(v, 'k'), ''), pair(g(v, 'a') * g(v, 'k') - 1, g(v, 'b') * g(v, 'k') + 1, ''), pair(g(v, 'a'), g(v, 'b'), ''), pair(g(v, 'a') * g(v, 'k') + 2, g(v, 'b') * g(v, 'k') - 2, '')]),
    why: (v, a) => `ერთი ნაწილი ${v.n} ÷ ${g(v, 'a') + g(v, 'b')} = ${v.k}; რიცხვებია ${g(v, 'a')} · ${v.k} და ${g(v, 'b')} · ${v.k}. ${a}.`,
  }),
  t({
    sub: 'u08-02',
    prompt: '{n} ლარი უნდა გაიყოს ორ ადამიანს შორის შეფარდებით ({a} : {b}). რამდენ ლარს მიიღებს თითოეული?',
    vars: { a: I(1, 6), b: I(2, 9), k: I(2, 15), n: D((v) => (g(v, 'a') + g(v, 'b')) * g(v, 'k')) },
    constraints: [{ test: (v: Vars) => g(v, 'a') < g(v, 'b'), note: 'ordered parts' }],
    answer: (v) => pair(g(v, 'a') * g(v, 'k'), g(v, 'b') * g(v, 'k'), 'ლარი'),
    options: (v, right) => textOptions(right, [pair(g(v, 'b') * g(v, 'k'), g(v, 'a') * g(v, 'k'), 'ლარი'), pair(g(v, 'a') * g(v, 'k') + 2, g(v, 'b') * g(v, 'k') - 2, 'ლარი'), pair(g(v, 'a'), g(v, 'b'), 'ლარი'), pair(Math.floor(g(v, 'n') / 2), Math.ceil(g(v, 'n') / 2), 'ლარი')]),
    why: (v, a) => `${g(v, 'a') + g(v, 'b')} ნაწილია; ერთი ნაწილი ${v.n} ÷ ${g(v, 'a') + g(v, 'b')} = ${v.k} ლარი. ${a}.`,
  }),
  t({
    sub: 'u08-02',
    prompt: 'სამკუთხედის კუთხეები შეფარდებაშია ({a} : {b} : {c}). იპოვე თითოეული კუთხის ზომა.',
    vars: { sh: C(['2|3|4', '1|2|3', '1|1|2', '2|3|5', '3|4|5', '1|3|5', '1|4|5', '2|3|7', '1|2|6', '4|5|6', '3|5|7', '1|1|4', '2|2|5', '1|5|6', '5|6|7', '1|3|6']), a: D((v) => Number(String(v.sh).split('|')[0])), b: D((v) => Number(String(v.sh).split('|')[1])), c: D((v) => Number(String(v.sh).split('|')[2])) },
    answer: (v) => triple((180 / (g(v, 'a') + g(v, 'b') + g(v, 'c'))) * g(v, 'a'), (180 / (g(v, 'a') + g(v, 'b') + g(v, 'c'))) * g(v, 'b'), (180 / (g(v, 'a') + g(v, 'b') + g(v, 'c'))) * g(v, 'c'), '°'),
    options: (v, right) => {
      const k = 180 / (g(v, 'a') + g(v, 'b') + g(v, 'c'));
      return textOptions(right, [triple(g(v, 'a') * k + 5, g(v, 'b') * k, g(v, 'c') * k - 5, '°'), triple(g(v, 'a') * 10, g(v, 'b') * 10, g(v, 'c') * 10, '°'), triple(g(v, 'c') * k, g(v, 'b') * k + 10, g(v, 'a') * k - 10, '°'), triple(g(v, 'a') * k - 10, g(v, 'b') * k + 5, g(v, 'c') * k + 5, '°'), triple(60, 60, 60, '°')]);
    },
    why: (v, a) => `კუთხეების ჯამია 180°; ${g(v, 'a') + g(v, 'b') + g(v, 'c')} ნაწილია, ერთი ნაწილი ${180 / (g(v, 'a') + g(v, 'b') + g(v, 'c'))}°. ${a}.`,
  }),
  t({
    sub: 'u08-02',
    prompt: '{n} კგ ნარევი უნდა დაიყოს ორ ნაწილად შეფარდებით ({a} : {b}). იპოვე თითოეული ნაწილის მასა.',
    vars: { a: I(2, 8), b: I(3, 9), k: I(2, 12), n: D((v) => (g(v, 'a') + g(v, 'b')) * g(v, 'k')) },
    constraints: [{ test: (v: Vars) => g(v, 'a') < g(v, 'b'), note: 'ordered parts' }],
    answer: (v) => pair(g(v, 'a') * g(v, 'k'), g(v, 'b') * g(v, 'k'), 'კგ'),
    options: (v, right) => textOptions(right, [pair(g(v, 'b') * g(v, 'k'), g(v, 'a') * g(v, 'k'), 'კგ'), pair(g(v, 'a') * g(v, 'k') + 2, g(v, 'b') * g(v, 'k') - 2, 'კგ'), pair(g(v, 'a'), g(v, 'b'), 'კგ'), pair(Math.floor(g(v, 'n') / 2), Math.ceil(g(v, 'n') / 2), 'კგ')]),
    why: (v, a) => `${g(v, 'a') + g(v, 'b')} ნაწილია; ერთი ნაწილი ${v.n} ÷ ${g(v, 'a') + g(v, 'b')} = ${v.k} კგ. ${a}.`,
  }),

  // ═════════ U08.3 — პირდაპირი პროპორციულობა ═════════
  t({
    sub: 'u08-03',
    prompt: '{m} რვეული ღირს {c} ლარი. რა ღირს {n} ასეთი რვეული?',
    vars: { m: I(2, 9), p: I(2, 9), n: I(3, 15), c: D((v) => g(v, 'm') * g(v, 'p')) },
    constraints: [{ test: (v: Vars) => g(v, 'n') !== g(v, 'm'), note: 'a different quantity' }],
    answer: (v) => fmt(g(v, 'n') * g(v, 'p'), 'ლარი'),
    options: (v) => unitOptions(g(v, 'n') * g(v, 'p'), 'ლარი', [g(v, 'c') + g(v, 'n') - g(v, 'm'), (g(v, 'c') * g(v, 'm')) / g(v, 'n'), g(v, 'c') + g(v, 'p')]),
    why: (v, a) => `1 რვეული ღირს ${v.c} ÷ ${v.m} = ${v.p} ლარი; ${v.n} · ${v.p} = ${a}.`,
  }),
  t({
    sub: 'u08-03',
    prompt: 'ავტომობილი {t} საათში {s} კმ-ს გადის მუდმივი სიჩქარით. რამდენ კილომეტრს გაივლის {t2} საათში?',
    vars: { t: I(2, 6), v: I(40, 100, { step: 10 }), t2: I(3, 9), s: D((v) => g(v, 't') * g(v, 'v')) },
    constraints: [{ test: (v: Vars) => g(v, 't') !== g(v, 't2'), note: 'a different time' }],
    answer: (v) => fmt(g(v, 't2') * g(v, 'v'), 'კმ'),
    options: (v) => unitOptions(g(v, 't2') * g(v, 'v'), 'კმ', [g(v, 's') + g(v, 't2') - g(v, 't'), (g(v, 's') * g(v, 't')) / g(v, 't2'), g(v, 's') + g(v, 'v')]),
    why: (v, a) => `1 საათში ${v.s} ÷ ${v.t} = ${v.v} კმ; ${v.t2} · ${v.v} = ${a}.`,
  }),
  t({
    sub: 'u08-03',
    prompt: '{m} კგ ვაშლი ღირს {c} ლარი. რა ღირს {n} კგ ვაშლი?',
    vars: { m: I(2, 8), p: I(2, 9), n: I(3, 14), c: D((v) => g(v, 'm') * g(v, 'p')) },
    constraints: [{ test: (v: Vars) => g(v, 'n') !== g(v, 'm'), note: 'a different quantity' }],
    answer: (v) => fmt(g(v, 'n') * g(v, 'p'), 'ლარი'),
    options: (v) => unitOptions(g(v, 'n') * g(v, 'p'), 'ლარი', [g(v, 'c') + g(v, 'n') - g(v, 'm'), (g(v, 'c') * g(v, 'm')) / g(v, 'n'), g(v, 'c') + g(v, 'p')]),
    why: (v, a) => `1 კგ ღირს ${v.c} ÷ ${v.m} = ${v.p} ლარი; ${v.n} · ${v.p} = ${a}.`,
  }),
  t({
    sub: 'u08-03',
    prompt: '{m} ერთნაირი ნივთის დასამზადებლად საჭიროა {c} მ ქსოვილი. რამდენი მეტრი ქსოვილი დასჭირდება {n} ნივთს?',
    vars: { m: I(2, 8), p: I(2, 9), n: I(3, 14), c: D((v) => g(v, 'm') * g(v, 'p')) },
    constraints: [{ test: (v: Vars) => g(v, 'n') !== g(v, 'm'), note: 'a different quantity' }],
    answer: (v) => fmt(g(v, 'n') * g(v, 'p'), 'მ'),
    options: (v) => unitOptions(g(v, 'n') * g(v, 'p'), 'მ', [g(v, 'c') + g(v, 'n') - g(v, 'm'), (g(v, 'c') * g(v, 'm')) / g(v, 'n'), g(v, 'c') + g(v, 'p')]),
    why: (v, a) => `1 ნივთზე ${v.c} ÷ ${v.m} = ${v.p} მ; ${v.n} · ${v.p} = ${a}.`,
  }),
  t({
    sub: 'u08-03',
    prompt: '{m} მუშა ერთ საათში ამზადებს {c} დეტალს, თუ თითოეული მუშის წარმადობა ერთნაირია. რამდენ დეტალს დაამზადებს {n} მუშა ერთ საათში?',
    vars: { m: I(2, 9), p: I(2, 9), n: I(3, 16), c: D((v) => g(v, 'm') * g(v, 'p')) },
    constraints: [{ test: (v: Vars) => g(v, 'n') !== g(v, 'm'), note: 'a different quantity' }],
    answer: (v) => String(g(v, 'n') * g(v, 'p')),
    wrong: (v) => [g(v, 'c') + g(v, 'n') - g(v, 'm'), (g(v, 'c') * g(v, 'm')) / g(v, 'n'), g(v, 'c') + g(v, 'p'), g(v, 'n') * g(v, 'p') + g(v, 'p')],
    why: (v, a) => `1 მუშა ამზადებს ${v.c} ÷ ${v.m} = ${v.p} დეტალს; ${v.n} · ${v.p} = ${a}.`,
  }),
  t({
    sub: 'u08-03',
    prompt: 'y პირდაპირ პროპორციულია x-ის. თუ x = {x0}-ის დროს y = {y0}, იპოვე y, როცა x = {x1}.',
    vars: { x0: C([2, 4, 6, 8]), h: I(3, 15), x1: C([6, 10, 12, 14, 16]), y0: D((v) => (g(v, 'h') * g(v, 'x0')) / 2) },
    constraints: [{ test: (v: Vars) => g(v, 'x0') !== g(v, 'x1'), note: 'a different x' }],
    answer: (v) => String((g(v, 'h') * g(v, 'x1')) / 2),
    wrong: (v) => [g(v, 'y0') + g(v, 'x1') - g(v, 'x0'), (g(v, 'y0') * g(v, 'x0')) / g(v, 'x1'), g(v, 'y0') * g(v, 'x1'), (g(v, 'h') * g(v, 'x1')) / 2 + g(v, 'x0')],
    why: (v, a) => `y ÷ x = ${v.y0} ÷ ${v.x0} არ იცვლება: y = ${v.x1} · ${v.y0} ÷ ${v.x0} = ${a}.`,
  }),

  // ═════════ U08.4 — უკუპროპორციულობა ═════════
  t({
    sub: 'u08-04',
    prompt: '{w} მუშა სამუშაოს {d} დღეში ასრულებს. რამდენ დღეში შეასრულებს იმავე სამუშაოს {n} მუშა, თუ ყველა ერთნაირი წარმადობით მუშაობს?',
    vars: { w: I(2, 8), d: I(4, 15), n: I(2, 15), T: D((v) => g(v, 'w') * g(v, 'd')) },
    constraints: [{ test: (v: Vars) => (g(v, 'w') * g(v, 'd')) % g(v, 'n') === 0 && g(v, 'n') !== g(v, 'w'), note: 'whole days' }],
    answer: (v) => fmt((g(v, 'w') * g(v, 'd')) / g(v, 'n'), 'დღე'),
    options: (v) => unitOptions((g(v, 'w') * g(v, 'd')) / g(v, 'n'), 'დღე', [(g(v, 'd') * g(v, 'n')) / g(v, 'w'), g(v, 'd') + g(v, 'n') - g(v, 'w'), g(v, 'd') - g(v, 'n') + g(v, 'w')]),
    why: (v, a) => `მთელი სამუშაო ${v.w} · ${v.d} = ${v.T} მუშა-დღეა; ${v.T} ÷ ${v.n} = ${a}.`,
  }),
  t({
    sub: 'u08-04',
    prompt: 'ავტომობილი გზას {v1} კმ/სთ სიჩქარით {h} საათში გადის. რამდენი საათი დასჭირდება იმავე გზის გასავლელად {v2} კმ/სთ სიჩქარით?',
    vars: { v1: I(30, 90, { step: 10 }), h: I(2, 8), v2: I(30, 120, { step: 10 }), S: D((v) => g(v, 'v1') * g(v, 'h')) },
    constraints: [{ test: (v: Vars) => (g(v, 'v1') * g(v, 'h')) % g(v, 'v2') === 0 && g(v, 'v1') !== g(v, 'v2'), note: 'whole hours' }],
    answer: (v) => fmt((g(v, 'v1') * g(v, 'h')) / g(v, 'v2'), 'საათი'),
    options: (v) => unitOptions((g(v, 'v1') * g(v, 'h')) / g(v, 'v2'), 'საათი', [(g(v, 'h') * g(v, 'v2')) / g(v, 'v1'), g(v, 'h') + 1, g(v, 'h') - 1, g(v, 'h') + (g(v, 'v2') - g(v, 'v1')) / 10]),
    why: (v, a) => `მანძილი ${v.v1} · ${v.h} = ${v.S} კმ; ${v.S} ÷ ${v.v2} = ${a}.`,
  }),
  t({
    sub: 'u08-04',
    prompt: '{n1} ონკანი ავსებს ავზს {h} საათში. რამდენ საათში შეავსებს იმავე ავზს {n2} ერთნაირი ონკანი?',
    vars: { n1: I(2, 6), h: I(4, 12), n2: I(2, 12), T: D((v) => g(v, 'n1') * g(v, 'h')) },
    constraints: [{ test: (v: Vars) => (g(v, 'n1') * g(v, 'h')) % g(v, 'n2') === 0 && g(v, 'n1') !== g(v, 'n2'), note: 'whole hours' }],
    answer: (v) => fmt((g(v, 'n1') * g(v, 'h')) / g(v, 'n2'), 'საათი'),
    options: (v) => unitOptions((g(v, 'n1') * g(v, 'h')) / g(v, 'n2'), 'საათი', [(g(v, 'h') * g(v, 'n2')) / g(v, 'n1'), g(v, 'h') + g(v, 'n2') - g(v, 'n1'), g(v, 'h') - g(v, 'n2') + g(v, 'n1')]),
    why: (v, a) => `ერთი ონკანი ავსებს ${v.T} საათში; ${v.T} ÷ ${v.n2} = ${a}.`,
  }),
  t({
    sub: 'u08-04',
    prompt: '{w} მუშა სამუშაოს {d} დღეში ასრულებს. რამდენი დღე დასჭირდება {n} მუშას იმავე სამუშაოს შესასრულებლად?',
    vars: { w: C([6, 8, 10, 12, 15, 20]), d: I(6, 20), n: C([2, 3, 4, 5, 6, 10]), T: D((v) => g(v, 'w') * g(v, 'd')) },
    constraints: [{ test: (v: Vars) => (g(v, 'w') * g(v, 'd')) % g(v, 'n') === 0 && g(v, 'n') < g(v, 'w'), note: 'fewer workers, whole days' }],
    answer: (v) => fmt((g(v, 'w') * g(v, 'd')) / g(v, 'n'), 'დღე'),
    options: (v) => unitOptions((g(v, 'w') * g(v, 'd')) / g(v, 'n'), 'დღე', [(g(v, 'd') * g(v, 'n')) / g(v, 'w'), g(v, 'd') + g(v, 'w') - g(v, 'n'), g(v, 'd') * 2]),
    why: (v, a) => `${v.w} · ${v.d} = ${v.T} მუშა-დღე; ${v.T} ÷ ${v.n} = ${a}.`,
  }),
  t({
    sub: 'u08-04',
    prompt: 'მართკუთხედის ფართობია {S} სმ², ხოლო სიგანე — {w} სმ. რა იქნება სიგანე, თუ ფართობი უცვლელი დარჩება და სიგრძე {L2} სმ გახდება?',
    vars: { w: I(2, 9), l0: I(4, 15), L2: I(2, 24), S: D((v) => g(v, 'w') * g(v, 'l0')) },
    constraints: [{ test: (v: Vars) => (g(v, 'w') * g(v, 'l0')) % g(v, 'L2') === 0 && g(v, 'L2') !== g(v, 'l0'), note: 'whole width' }],
    answer: (v) => fmt((g(v, 'w') * g(v, 'l0')) / g(v, 'L2'), 'სმ'),
    options: (v) => unitOptions((g(v, 'w') * g(v, 'l0')) / g(v, 'L2'), 'სმ', [g(v, 'w'), g(v, 'L2') - g(v, 'l0') + g(v, 'w'), (g(v, 'w') * g(v, 'L2')) / g(v, 'l0'), g(v, 'l0')]),
    why: (v, a) => `ფართობი უცვლელია: ${v.S} ÷ ${v.L2} = ${a}.`,
  }),
  t({
    sub: 'u08-04',
    prompt: 'y უკუპროპორციულია x-ის. თუ x = {x0}-ის დროს y = {y0}, იპოვე y, როცა x = {x1}.',
    vars: { x0: I(2, 9), y0: I(4, 18), x1: I(2, 20), k: D((v) => g(v, 'x0') * g(v, 'y0')) },
    constraints: [{ test: (v: Vars) => (g(v, 'x0') * g(v, 'y0')) % g(v, 'x1') === 0 && g(v, 'x1') !== g(v, 'x0'), note: 'a whole y' }],
    answer: (v) => String((g(v, 'x0') * g(v, 'y0')) / g(v, 'x1')),
    wrong: (v) => [(g(v, 'y0') * g(v, 'x1')) / g(v, 'x0'), g(v, 'y0') + g(v, 'x1') - g(v, 'x0'), g(v, 'y0') - g(v, 'x1') + g(v, 'x0'), g(v, 'k')],
    why: (v, a) => `x · y = ${v.x0} · ${v.y0} = ${v.k} არ იცვლება: y = ${v.k} ÷ ${v.x1} = ${a}.`,
  }),

  // ═════════ U08.5 — პროპორციულობის კოეფიციენტი ═════════
  t({
    sub: 'u08-05',
    prompt: 'მოცემულია პირდაპირი პროპორციულობა y = kx. თუ x = {x} და y = {y}, იპოვე k.',
    vars: { x: I(2, 9), k: I(2, 12), y: D((v) => g(v, 'x') * g(v, 'k')) },
    answer: (v) => `k = ${g(v, 'k')}`,
    options: (v, right) => textOptions(right, [`k = ${g(v, 'y') - g(v, 'x')}`, `k = ${g(v, 'y') + g(v, 'x')}`, `k = ${g(v, 'x') * g(v, 'y')}`, `k = ${g(v, 'k') + 1}`, `k = ${g(v, 'k') - 1}`]),
    why: (v, a) => `k = y ÷ x = ${v.y} ÷ ${v.x}. ${a}.`,
  }),
  t({
    sub: 'u08-05',
    prompt: 'მოცემულია y = {k}x. იპოვე y, როცა x = {x}.',
    vars: { k: I(2, 12), x: I(2, 15) },
    answer: (v) => String(g(v, 'k') * g(v, 'x')),
    wrong: (v) => [g(v, 'k') + g(v, 'x'), g(v, 'x') / g(v, 'k'), g(v, 'k') * g(v, 'x') + g(v, 'k'), g(v, 'k') * g(v, 'x') - g(v, 'x')],
    why: (v, a) => `y = ${v.k} · ${v.x} = ${a}.`,
  }),
  t({
    sub: 'u08-05',
    prompt: 'y პირდაპირ პროპორციულია x-ის. თუ x = {x}-ის დროს y = {y}, ჩაწერე პროპორციულობის განტოლება.',
    vars: { x: I(2, 9), k: I(2, 12), y: D((v) => g(v, 'x') * g(v, 'k')) },
    answer: (v) => `y = ${g(v, 'k')}x`,
    options: (v, right) => textOptions(right, [`y = ${g(v, 'y')}x`, `y = ${g(v, 'x')}x`, `y = x/${g(v, 'k')}`, `y = x + ${g(v, 'y') - g(v, 'x')}`, `y = ${g(v, 'k') + 1}x`]),
    why: (v, a) => `k = ${v.y} ÷ ${v.x} = ${v.k}, ამიტომ ${a}.`,
  }),
  t({
    sub: 'u08-05',
    prompt: 'მოცემულია უკუპროპორციულობა y = k/x. თუ x = {x} და y = {y}, იპოვე k.',
    vars: { x: I(2, 9), y: I(3, 15) },
    answer: (v) => `k = ${g(v, 'x') * g(v, 'y')}`,
    options: (v, right) => textOptions(right, [`k = ${g(v, 'y') / g(v, 'x') === Math.floor(g(v, 'y') / g(v, 'x')) ? g(v, 'y') / g(v, 'x') : g(v, 'x') + g(v, 'y')}`, `k = ${g(v, 'x') + g(v, 'y')}`, `k = ${Math.abs(g(v, 'y') - g(v, 'x')) + 1}`, `k = ${g(v, 'x') * g(v, 'y') + g(v, 'x')}`, `k = ${g(v, 'x') * g(v, 'y') - g(v, 'y')}`]),
    why: (v, a) => `k = x · y = ${v.x} · ${v.y}. ${a}.`,
  }),
  t({
    sub: 'u08-05',
    prompt: 'მოცემულია y = {k}/x. იპოვე y, როცა x = {x}.',
    vars: { x: I(2, 12), y: I(2, 12), k: D((v) => g(v, 'x') * g(v, 'y')) },
    answer: (v) => String(g(v, 'y')),
    wrong: (v) => [g(v, 'k') - g(v, 'x'), g(v, 'x'), g(v, 'y') + 1, g(v, 'y') * 2, g(v, 'k')],
    why: (v, a) => `y = ${v.k} ÷ ${v.x} = ${a}.`,
  }),
  t({
    sub: 'u08-05',
    prompt: 'y პირდაპირ პროპორციულია x-ის. თუ x = {x0}-ის დროს y = {y0}, იპოვე y, როცა x = {x1}.',
    vars: { x0: C([2, 4, 6, 8, 10]), h: I(3, 19), x1: C([4, 6, 8, 12, 14, 16, 20]), y0: D((v) => (g(v, 'h') * g(v, 'x0')) / 2) },
    constraints: [{ test: (v: Vars) => g(v, 'x0') !== g(v, 'x1'), note: 'a different x' }],
    answer: (v) => String((g(v, 'h') * g(v, 'x1')) / 2),
    wrong: (v) => [g(v, 'y0') + g(v, 'x1') - g(v, 'x0'), (g(v, 'y0') * g(v, 'x0')) / g(v, 'x1'), g(v, 'y0') * g(v, 'x1'), (g(v, 'h') * g(v, 'x1')) / 2 - g(v, 'x0')],
    why: (v, a) => `y ÷ x = ${v.y0} ÷ ${v.x0}; y = ${v.x1} · ${v.y0} ÷ ${v.x0} = ${a}.`,
  }),

  // ═════════ U08.6 — რიცხვის პროცენტული გამოსახვა ═════════
  t({
    sub: 'u08-06',
    prompt: 'ჩაწერე {f} პროცენტების სახით.',
    vars: { d: C([2, 4, 5, 10, 20, 25, 50]), n: I(1, 49), f: D((v) => `${g(v, 'n')}/${g(v, 'd')}`) },
    constraints: [{ test: (v: Vars) => g(v, 'n') < g(v, 'd'), note: 'a proper fraction' }],
    answer: (v) => fmt((g(v, 'n') * 100) / g(v, 'd'), '%'),
    options: (v) => unitOptions((g(v, 'n') * 100) / g(v, 'd'), '%', [g(v, 'n') * g(v, 'd'), (g(v, 'n') * 10) / g(v, 'd'), (g(v, 'n') * 1000) / g(v, 'd'), g(v, 'n') + g(v, 'd')]),
    why: (v, a) => `${v.f} = ${(g(v, 'n') * 100) / g(v, 'd')}/100 = ${a}.`,
  }),
  t({
    sub: 'u08-06',
    prompt: 'ჩაწერე {a} პროცენტების სახით.',
    vars: { h: I(1, 99), a: D((v) => dd(g(v, 'h'), 2)) },
    answer: (v) => fmt(g(v, 'h'), '%'),
    options: (v) => unitOptions(g(v, 'h'), '%', [g(v, 'h') / 10, g(v, 'h') * 10, g(v, 'h') + 10, Number(String(g(v, 'h')).split('').reverse().join(''))]),
    why: (v, a) => `${v.a} = ${v.h}/100 = ${a}.`,
  }),
  t({
    sub: 'u08-06',
    prompt: 'ჩაწერე {p}% ჩვეულებრივი წილადის სახით და შეამცირე.',
    vars: { p: I(2, 98) },
    constraints: [{ test: (v: Vars) => g(v, 'p') % 10 !== 0 && g(v, 'p') !== 50, note: 'a fraction that needs reducing' }],
    answer: (v) => mText(fr(g(v, 'p'), 100)),
    options: (v, right) => textOptions(right, [`${g(v, 'p')}/100`, `${g(v, 'p')}/10`, mText(fr(100 - g(v, 'p'), 100)), mText(fr(g(v, 'p'), 10)), `1/${g(v, 'p')}`]),
    why: (v, a) => `${v.p}% = ${v.p}/100 = ${a}.`,
  }),
  t({
    sub: 'u08-06',
    prompt: '{a} რამდენი პროცენტია {b}-ის?',
    vars: { b: C([20, 25, 40, 50, 60, 80, 100, 120, 150, 160, 180, 200, 250, 300]), p: I(5, 95, { step: 5 }), a: D((v) => (g(v, 'b') * g(v, 'p')) / 100) },
    constraints: [{ test: (v: Vars) => (g(v, 'b') * g(v, 'p')) % 100 === 0, note: 'a whole part' }],
    answer: (v) => fmt(g(v, 'p'), '%'),
    options: (v) => unitOptions(g(v, 'p'), '%', [g(v, 'p') / 5, 100 - g(v, 'p'), g(v, 'a'), Math.round((g(v, 'b') / g(v, 'a')) * 10)]),
    why: (v, a) => `${v.a} ÷ ${v.b} · 100% = ${g(v, 'a') * 100} ÷ ${v.b} = ${a}.`,
  }),
  t({
    sub: 'u08-06',
    prompt: '{a} რამდენი პროცენტია {b}-ის?',
    vars: { b: C([20, 25, 40, 50, 60, 80, 100, 120, 150, 160, 200]), p: I(5, 90, { step: 5 }), a: D((v) => (g(v, 'b') * g(v, 'p')) / 100) },
    constraints: [{ test: (v: Vars) => (g(v, 'b') * g(v, 'p')) % 100 === 0, note: 'a whole part' }],
    answer: (v) => fmt(g(v, 'p'), '%'),
    options: (v) => unitOptions(g(v, 'p'), '%', [100 - g(v, 'p'), g(v, 'a'), g(v, 'p') + 10, g(v, 'p') / 5]),
    why: (v, a) => `${v.a} ÷ ${v.b} = ${g(v, 'p')}/100 = ${a}.`,
  }),
  t({
    sub: 'u08-06',
    prompt: 'ჩაწერე {f} პროცენტების სახით.',
    vars: { d: C([20, 25, 50]), n: I(1, 49), f: D((v) => `${g(v, 'n')}/${g(v, 'd')}`) },
    constraints: [{ test: (v: Vars) => g(v, 'n') < g(v, 'd'), note: 'a proper fraction' }],
    answer: (v) => fmt((g(v, 'n') * 100) / g(v, 'd'), '%'),
    options: (v) => unitOptions((g(v, 'n') * 100) / g(v, 'd'), '%', [g(v, 'n') * g(v, 'd'), (g(v, 'n') * 10) / g(v, 'd'), g(v, 'n') + g(v, 'd'), (g(v, 'n') * 100) / g(v, 'd') + 10]),
    why: (v, a) => `${v.f} = ${(g(v, 'n') * 100) / g(v, 'd')}/100 = ${a}.`,
  }),

  // ═════════ U08.7 — პროცენტები და ფასდაკლება ═════════
  t({
    sub: 'u08-07',
    prompt: '{item} ღირს {P} ლარი. მასზე მოქმედებს {p}%-იანი ფასდაკლება. რა ღირს {item} ფასდაკლების შემდეგ?',
    vars: { item: C(['მაისური', 'ჩანთა', 'წიგნი', 'ქურთუკი']), P: I(40, 400, { step: 20 }), p: C([5, 10, 15, 20, 25, 30, 40, 50]) },
    answer: (v) => fmt((g(v, 'P') * (100 - g(v, 'p'))) / 100, 'ლარი'),
    options: (v) => unitOptions((g(v, 'P') * (100 - g(v, 'p'))) / 100, 'ლარი', [(g(v, 'P') * g(v, 'p')) / 100, g(v, 'P') - g(v, 'p'), g(v, 'P') + (g(v, 'P') * g(v, 'p')) / 100]),
    why: (v, a) => `ფასდაკლება ${v.P} · ${v.p} ÷ 100 = ${(g(v, 'P') * g(v, 'p')) / 100} ლარია; ${v.P} ${MINUS} ${(g(v, 'P') * g(v, 'p')) / 100} = ${a}.`,
  }),
  t({
    sub: 'u08-07',
    prompt: 'ჩანთა თავდაპირველად {P} ლარი ღირდა. მისი ფასი {p}%-ით შემცირდა. რამდენი ლარით გაიაფდა ჩანთა?',
    vars: { P: I(40, 400, { step: 20 }), p: C([5, 10, 15, 20, 25, 30, 40]) },
    answer: (v) => fmt((g(v, 'P') * g(v, 'p')) / 100, 'ლარი'),
    options: (v) => unitOptions((g(v, 'P') * g(v, 'p')) / 100, 'ლარი', [(g(v, 'P') * (100 - g(v, 'p'))) / 100, g(v, 'p'), g(v, 'P') - g(v, 'p'), (g(v, 'P') * g(v, 'p')) / 10]),
    why: (v, a) => `${v.P} · ${v.p} ÷ 100 = ${a}.`,
  }),
  t({
    sub: 'u08-07',
    prompt: 'წიგნი ღირს {P} ლარი. ფასდაკლების შემდეგ მისი ფასი {Q} ლარია. რამდენპროცენტიანი ფასდაკლება მოქმედებდა?',
    vars: { P: I(40, 400, { step: 20 }), p: C([5, 10, 15, 20, 25, 30, 40, 50]), Q: D((v) => (g(v, 'P') * (100 - g(v, 'p'))) / 100) },
    answer: (v) => fmt(g(v, 'p'), '%'),
    options: (v) => unitOptions(g(v, 'p'), '%', [100 - g(v, 'p'), g(v, 'P') - g(v, 'Q'), (g(v, 'P') - g(v, 'Q')) / 2, g(v, 'p') + 10]),
    why: (v, a) => `ფასი შემცირდა ${g(v, 'P')} ${MINUS} ${g(v, 'Q')} = ${g(v, 'P') - g(v, 'Q')} ლარით; ${g(v, 'P') - g(v, 'Q')} ÷ ${v.P} = ${g(v, 'p')}/100. ${a}.`,
  }),
  t({
    sub: 'u08-07',
    prompt: 'ფეხსაცმელი ღირს {P} ლარი. ფასდაკლება შეადგენს {p}%-ს. გამოთვალე საბოლოო ფასი.',
    vars: { P: I(100, 500, { step: 50 }), p: C([10, 15, 20, 25, 30, 40]) },
    constraints: [{ test: (v: Vars) => (g(v, 'P') * g(v, 'p')) % 100 === 0, note: 'whole lari' }],
    answer: (v) => fmt((g(v, 'P') * (100 - g(v, 'p'))) / 100, 'ლარი'),
    options: (v) => unitOptions((g(v, 'P') * (100 - g(v, 'p'))) / 100, 'ლარი', [(g(v, 'P') * g(v, 'p')) / 100, g(v, 'P') - g(v, 'p'), g(v, 'P') + (g(v, 'P') * g(v, 'p')) / 100]),
    why: (v, a) => `ფასდაკლება ${(g(v, 'P') * g(v, 'p')) / 100} ლარია; ${v.P} ${MINUS} ${(g(v, 'P') * g(v, 'p')) / 100} = ${a}.`,
  }),
  t({
    sub: 'u08-07',
    prompt: 'ველოსიპედის ფასი {P} ლარიდან {Q} ლარამდე შემცირდა. იპოვე ფასის შემცირების პროცენტი.',
    vars: { P: I(100, 600, { step: 50 }), p: C([5, 10, 15, 20, 25, 30]), Q: D((v) => (g(v, 'P') * (100 - g(v, 'p'))) / 100) },
    constraints: [{ test: (v: Vars) => (g(v, 'P') * g(v, 'p')) % 100 === 0, note: 'whole amounts' }],
    answer: (v) => fmt(g(v, 'p'), '%'),
    options: (v) => unitOptions(g(v, 'p'), '%', [100 - g(v, 'p'), g(v, 'P') - g(v, 'Q'), g(v, 'p') + 5, (g(v, 'P') - g(v, 'Q')) / 2]),
    why: (v, a) => `შემცირება ${v.P} ${MINUS} ${v.Q} = ${g(v, 'P') - g(v, 'Q')} ლარია; ${g(v, 'P') - g(v, 'Q')} ÷ ${v.P} = ${g(v, 'p')}/100. ${a}.`,
  }),
  t({
    sub: 'u08-07',
    prompt: 'ქურთუკი {P} ლარი ღირდა. ჯერ ფასი {p}%-ით შემცირდა. რამდენი ლარი ღირს ქურთუკი ფასდაკლების შემდეგ?',
    vars: { P: I(60, 300, { step: 20 }), p: C([5, 10, 15, 20, 25, 30, 40]) },
    answer: (v) => fmt((g(v, 'P') * (100 - g(v, 'p'))) / 100, 'ლარი'),
    options: (v) => unitOptions((g(v, 'P') * (100 - g(v, 'p'))) / 100, 'ლარი', [(g(v, 'P') * g(v, 'p')) / 100, g(v, 'P') - g(v, 'p'), g(v, 'P') + (g(v, 'P') * g(v, 'p')) / 100]),
    why: (v, a) => `${v.P} · ${100 - g(v, 'p')} ÷ 100 = ${a}.`,
  }),

  // ═════════ U08.8 — ჯარიმები და გადასახადები ═════════
  t({
    sub: 'u08-08',
    prompt: 'ნივთის ფასი გადასახადამდე {P} ლარია. თუ გადასახადი {p}%-ია, რამდენი ლარი იქნება გადასახადი?',
    vars: { P: I(100, 500, { step: 50 }), p: C([5, 10, 12, 15, 18, 20, 25]) },
    constraints: [{ test: (v: Vars) => (g(v, 'P') * g(v, 'p')) % 100 === 0, note: 'whole lari' }],
    answer: (v) => fmt((g(v, 'P') * g(v, 'p')) / 100, 'ლარი'),
    options: (v) => unitOptions((g(v, 'P') * g(v, 'p')) / 100, 'ლარი', [g(v, 'P') + (g(v, 'P') * g(v, 'p')) / 100, g(v, 'p'), (g(v, 'P') * g(v, 'p')) / 10, g(v, 'P') - (g(v, 'P') * g(v, 'p')) / 100]),
    why: (v, a) => `${v.P} · ${v.p} ÷ 100 = ${a}.`,
  }),
  t({
    sub: 'u08-08',
    prompt: 'მომსახურების ღირებულებაა {P} ლარი. მას დაემატა {p}%-იანი გადასახადი. რამდენია საბოლოო ღირებულება?',
    vars: { P: I(100, 400, { step: 50 }), p: C([5, 10, 12, 15, 20, 25]) },
    constraints: [{ test: (v: Vars) => (g(v, 'P') * g(v, 'p')) % 100 === 0, note: 'whole lari' }],
    answer: (v) => fmt(g(v, 'P') + (g(v, 'P') * g(v, 'p')) / 100, 'ლარი'),
    options: (v) => unitOptions(g(v, 'P') + (g(v, 'P') * g(v, 'p')) / 100, 'ლარი', [(g(v, 'P') * g(v, 'p')) / 100, g(v, 'P') + g(v, 'p'), g(v, 'P') - (g(v, 'P') * g(v, 'p')) / 100]),
    why: (v, a) => `გადასახადი ${(g(v, 'P') * g(v, 'p')) / 100} ლარია; ${v.P} + ${(g(v, 'P') * g(v, 'p')) / 100} = ${a}.`,
  }),
  t({
    sub: 'u08-08',
    prompt: 'მძღოლს დაეკისრა {P}-ლარიანი ჯარიმა. თუ ჯარიმა {p}%-ით გაიზარდა, რამდენი ლარი გახდა ჯარიმა?',
    vars: { P: I(40, 200, { step: 20 }), p: C([10, 20, 25, 50]) },
    constraints: [{ test: (v: Vars) => (g(v, 'P') * g(v, 'p')) % 100 === 0, note: 'whole lari' }],
    answer: (v) => fmt(g(v, 'P') + (g(v, 'P') * g(v, 'p')) / 100, 'ლარი'),
    options: (v) => unitOptions(g(v, 'P') + (g(v, 'P') * g(v, 'p')) / 100, 'ლარი', [(g(v, 'P') * g(v, 'p')) / 100, g(v, 'P') + g(v, 'p'), g(v, 'P') - (g(v, 'P') * g(v, 'p')) / 100]),
    why: (v, a) => `ზრდა ${(g(v, 'P') * g(v, 'p')) / 100} ლარია; ${v.P} + ${(g(v, 'P') * g(v, 'p')) / 100} = ${a}.`,
  }),
  t({
    sub: 'u08-08',
    prompt: 'ნივთის ფასი გადასახადამდე {PG} ლარია. მას ემატება {p}%-იანი გადასახადი. გამოთვალე საბოლოო ფასი.',
    vars: { P: I(200, 1000, { step: 100 }), PG: G('P'), p: C([5, 10, 15, 18, 20]) },
    answer: (v) => fmt(g(v, 'P') + (g(v, 'P') * g(v, 'p')) / 100, 'ლარი'),
    options: (v) => unitOptions(g(v, 'P') + (g(v, 'P') * g(v, 'p')) / 100, 'ლარი', [(g(v, 'P') * g(v, 'p')) / 100, g(v, 'P') + g(v, 'p'), g(v, 'P') - (g(v, 'P') * g(v, 'p')) / 100, g(v, 'P') + (g(v, 'P') * g(v, 'p')) / 10]),
    why: (v, a) => `გადასახადი ${group((g(v, 'P') * g(v, 'p')) / 100)} ლარია; ${group(g(v, 'P'))} + ${group((g(v, 'P') * g(v, 'p')) / 100)} = ${a}.`,
  }),
  t({
    sub: 'u08-08',
    prompt: 'ჯარიმის საწყისი ოდენობა იყო {P} ლარი. გადახდის დაგვიანების გამო ჯარიმა {p}%-ით გაიზარდა. რამდენია გაზრდილი ჯარიმა?',
    vars: { P: I(60, 300, { step: 20 }), p: C([5, 10, 15, 20, 25, 50]) },
    constraints: [{ test: (v: Vars) => (g(v, 'P') * g(v, 'p')) % 100 === 0, note: 'whole lari' }],
    answer: (v) => fmt(g(v, 'P') + (g(v, 'P') * g(v, 'p')) / 100, 'ლარი'),
    options: (v) => unitOptions(g(v, 'P') + (g(v, 'P') * g(v, 'p')) / 100, 'ლარი', [(g(v, 'P') * g(v, 'p')) / 100, g(v, 'P') + g(v, 'p'), g(v, 'P') - (g(v, 'P') * g(v, 'p')) / 100]),
    why: (v, a) => `ზრდა ${(g(v, 'P') * g(v, 'p')) / 100} ლარია; ${v.P} + ${(g(v, 'P') * g(v, 'p')) / 100} = ${a}.`,
  }),
  t({
    sub: 'u08-08',
    prompt: 'მომსახურების ღირებულებაა {P} ლარი, გადასახადი კი — {p}%. რამდენია გადასახადის ჩათვლით გადასახდელი თანხა?',
    vars: { P: I(100, 500, { step: 20 }), p: C([5, 10, 15, 20, 25]) },
    constraints: [{ test: (v: Vars) => (g(v, 'P') * g(v, 'p')) % 100 === 0, note: 'whole lari' }],
    answer: (v) => fmt(g(v, 'P') + (g(v, 'P') * g(v, 'p')) / 100, 'ლარი'),
    options: (v) => unitOptions(g(v, 'P') + (g(v, 'P') * g(v, 'p')) / 100, 'ლარი', [(g(v, 'P') * g(v, 'p')) / 100, g(v, 'P') + g(v, 'p'), g(v, 'P') - (g(v, 'P') * g(v, 'p')) / 100]),
    why: (v, a) => `გადასახადი ${(g(v, 'P') * g(v, 'p')) / 100} ლარია; ${v.P} + ${(g(v, 'P') * g(v, 'p')) / 100} = ${a}.`,
  }),

  // ═════════ U08.9 — მარტივი პროცენტი ═════════
  t({
    sub: 'u08-09',
    prompt: 'ბანკში შეიტანეს {SG} ლარი წლიური {r}%-იანი მარტივი პროცენტით. რამდენი ლარი იქნება პროცენტი ერთი წლის შემდეგ?',
    vars: { S: C([500, 800, 1000, 1200, 1500, 2000, 2500, 3000]), SG: G('S'), r: I(2, 12) },
    answer: (v) => fmt((g(v, 'S') * g(v, 'r')) / 100, 'ლარი'),
    options: (v) => unitOptions((g(v, 'S') * g(v, 'r')) / 100, 'ლარი', [g(v, 'S') * g(v, 'r'), g(v, 'S') + (g(v, 'S') * g(v, 'r')) / 100, (g(v, 'S') * g(v, 'r')) / 10, g(v, 'r')]),
    why: (v, a) => `${group(g(v, 'S'))} · ${v.r} ÷ 100 = ${a}.`,
  }),
  t({
    sub: 'u08-09',
    prompt: '{SG} ლარი განათავსეს წლიური {r}%-იანი მარტივი პროცენტით {n} წლით. რამდენი ლარი იქნება დარიცხული პროცენტი მთელი პერიოდის განმავლობაში?',
    vars: { S: C([1000, 1500, 2000, 2500, 3000, 4000]), SG: G('S'), r: I(2, 10), n: I(2, 5) },
    answer: (v) => fmt((g(v, 'S') * g(v, 'r') * g(v, 'n')) / 100, 'ლარი'),
    options: (v) => unitOptions((g(v, 'S') * g(v, 'r') * g(v, 'n')) / 100, 'ლარი', [(g(v, 'S') * g(v, 'r')) / 100, g(v, 'S') + (g(v, 'S') * g(v, 'r') * g(v, 'n')) / 100, (g(v, 'S') * g(v, 'r') * g(v, 'n')) / 10, (g(v, 'S') * g(v, 'r') * (g(v, 'n') + 1)) / 100]),
    why: (v, a) => `ერთ წელში ${group((g(v, 'S') * g(v, 'r')) / 100)} ლარი; ${v.n} წელში ${a}.`,
  }),
  t({
    sub: 'u08-09',
    prompt: '{SG} ლარი განათავსეს წლიური {r}%-იანი მარტივი პროცენტით {n} წლით. რამდენი ლარი იქნება საბოლოო თანხა?',
    vars: { S: C([1000, 1500, 2000, 2500, 3000]), SG: G('S'), r: I(2, 10), n: I(2, 4) },
    answer: (v) => fmt(g(v, 'S') + (g(v, 'S') * g(v, 'r') * g(v, 'n')) / 100, 'ლარი'),
    options: (v) => unitOptions(g(v, 'S') + (g(v, 'S') * g(v, 'r') * g(v, 'n')) / 100, 'ლარი', [(g(v, 'S') * g(v, 'r') * g(v, 'n')) / 100, g(v, 'S') + (g(v, 'S') * g(v, 'r')) / 100, g(v, 'S') + g(v, 'r') * g(v, 'n'), g(v, 'S') + (g(v, 'S') * g(v, 'r') * (g(v, 'n') + 1)) / 100]),
    why: (v, a) => `პროცენტი ${group((g(v, 'S') * g(v, 'r') * g(v, 'n')) / 100)} ლარია; ${group(g(v, 'S'))} + ${group((g(v, 'S') * g(v, 'r') * g(v, 'n')) / 100)} = ${a}.`,
  }),
  t({
    sub: 'u08-09',
    prompt: '{SG} ლარზე ერთი წლის განმავლობაში დარიცხული მარტივი პროცენტი {i} ლარია. იპოვე წლიური საპროცენტო განაკვეთი.',
    vars: { S: C([500, 800, 1000, 1200, 1500, 2000]), SG: G('S'), r: I(2, 12), i: D((v) => (g(v, 'S') * g(v, 'r')) / 100) },
    answer: (v) => fmt(g(v, 'r'), '%'),
    options: (v) => unitOptions(g(v, 'r'), '%', [g(v, 'i'), g(v, 'S') / g(v, 'i'), g(v, 'r') + 1, g(v, 'r') * 2]),
    why: (v, a) => `${v.i} ÷ ${group(g(v, 'S'))} = ${g(v, 'r')}/100. ${a}.`,
  }),
  t({
    sub: 'u08-09',
    prompt: '{SG} ლარი განათავსეს წლიური {r}%-იანი მარტივი პროცენტით {n} წლით. გამოთვალე საბოლოო თანხა.',
    vars: { S: C([1000, 2000, 2500, 3000, 4000, 5000]), SG: G('S'), r: C([2, 4, 5, 6, 8, 10]), n: I(2, 5) },
    answer: (v) => fmt(g(v, 'S') + (g(v, 'S') * g(v, 'r') * g(v, 'n')) / 100, 'ლარი'),
    options: (v) => unitOptions(g(v, 'S') + (g(v, 'S') * g(v, 'r') * g(v, 'n')) / 100, 'ლარი', [(g(v, 'S') * g(v, 'r') * g(v, 'n')) / 100, g(v, 'S') + (g(v, 'S') * g(v, 'r')) / 100, g(v, 'S') + g(v, 'r') * g(v, 'n'), g(v, 'S') + (g(v, 'S') * g(v, 'r') * g(v, 'n')) / 10]),
    why: (v, a) => `პროცენტი ${group((g(v, 'S') * g(v, 'r') * g(v, 'n')) / 100)} ლარია; საბოლოო თანხა ${a}.`,
  }),
  t({
    sub: 'u08-09',
    prompt: '{SG} ლარზე წლიური {r}%-იანი მარტივი პროცენტი ირიცხება {m} თვის განმავლობაში. რამდენი ლარი იქნება დარიცხული პროცენტი?',
    vars: { S: C([1200, 1800, 2400, 3000, 3600, 4800]), SG: G('S'), r: C([4, 5, 6, 8, 10, 12]), m: C([3, 6, 9]) },
    constraints: [{ test: (v: Vars) => (g(v, 'S') * g(v, 'r') * g(v, 'm')) % 1200 === 0, note: 'whole lari' }],
    answer: (v) => fmt((g(v, 'S') * g(v, 'r') * g(v, 'm')) / 1200, 'ლარი'),
    options: (v) => unitOptions((g(v, 'S') * g(v, 'r') * g(v, 'm')) / 1200, 'ლარი', [(g(v, 'S') * g(v, 'r')) / 100, (g(v, 'S') * g(v, 'r') * g(v, 'm')) / 100, (g(v, 'S') * g(v, 'r') * g(v, 'm')) / 120, (g(v, 'S') * g(v, 'r')) / 200]),
    why: (v, a) => `წლიური პროცენტი ${group((g(v, 'S') * g(v, 'r')) / 100)} ლარია; ${v.m} თვე — წლის ${v.m}/12, ამიტომ ${a}.`,
  }),
];
