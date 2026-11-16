import type { QuestionTemplate, Vars } from './types';
import { C, D, I, MINUS, N, q6, sg } from './g6-helpers';
import { lin, pt, quad } from './g7-u06-expressions';
import { superscript } from './g5-helpers';

/**
 * Grade VII — Unit 7: equations and inequalities.
 *
 * Converted from the academy's Grade VII `U07` bank: 10 subtopics × 6 questions.
 *
 * Every task is built backwards from its answer, so each equation has the whole
 * root the student must find. Answers are written as the student writes them:
 * `x = 5`, `x = −3 ან x = 7`, `x ≥ 4`, `−2 < x ≤ 5`, `x = 4, y = 6`. Slips are
 * the slips of the topic: a lost sign, the inequality not turned over after a
 * negative factor, a strict sign for a non-strict one, a single root of |…|.
 */

export const G7_U07_SUBTOPICS = ['u07-01', 'u07-02', 'u07-03', 'u07-04', 'u07-05', 'u07-06', 'u07-07', 'u07-08', 'u07-09', 'u07-10'] as const;

const T = 'g7-equations';
let seq = 0;
const nextId = (): string => `g7-u07-q${String(++seq).padStart(2, '0')}`;
type Spec = Omit<Parameters<typeof q6>[0], 'id' | 'topic' | 'grade'>;
const t = (spec: Spec): QuestionTemplate => q6({ id: nextId(), topic: T, grade: 7, ...spec });

const LETTERS = ['x', 'y', 'z', 't', 'm', 'n'];
const Lvar = C(LETTERS);
const g = (v: Vars, key: string): number => N(v, key);
const S = (v: Vars, key: string): string => sg(N(v, key));
const nonZero = (min: number, max: number) => I(min, max, { nonZero: true });

/** `x = 5`. */
const eq1 = (L: string, n: number): string => `${L} = ${sg(n)}`;
/** The key first, then distinct whole slips, then neighbours of the root. */
const rootOptions = (L: string, root: number, slips: number[]): string[] => {
  const out = [eq1(L, root)];
  for (const n of [...slips, root + 1, root - 1, root + 2, root - 2, -root, root + 3]) {
    if (!Number.isInteger(n) || !Number.isFinite(n)) continue;
    const text = eq1(L, n);
    if (!out.includes(text)) out.push(text);
  }
  return out;
};
const textOptions = (key: string, wrongs: string[]): string[] => {
  const out = [key];
  for (const w of wrongs) if (!out.includes(w)) out.push(w);
  return out;
};
const rel = (a: string, op: string, b: string): string => `${a} ${op} ${b}`;
const FLIP: Record<string, string> = { '>': '<', '<': '>', '≥': '≤', '≤': '≥' };
const STRICTNESS: Record<string, string> = { '>': '≥', '≥': '>', '<': '≤', '≤': '<' };
const OPS = ['>', '<', '≥', '≤'];
const lineq = (a: number, b: number, L: string): string => pt(lin(a, b), L);
/** `x = a ან x = b`, ascending. */
const two = (L: string, a: number, b: number): string => {
  const [lo, hi] = a <= b ? [a, b] : [b, a];
  return lo === hi ? eq1(L, lo) : `${eq1(L, lo)} ან ${eq1(L, hi)}`;
};
/** `a < x < b` with each side's own sign. */
const between = (L: string, lo: number, loOp: string, hi: number, hiOp: string): string => `${sg(lo)} ${loOp} ${L} ${hiOp} ${sg(hi)}`;
const sup2 = superscript(2);

export const G7_U07_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U07.1 — წრფივი განტოლებები ერთი უცნობით ═════════
  t({
    sub: 'u07-01',
    prompt: 'ამოხსენი განტოლება: {eq}.',
    vars: { L: Lvar, a: I(2, 9), b: nonZero(-9, 9), x: nonZero(-8, 12), eq: D((v) => `${lineq(g(v, 'a'), g(v, 'b'), String(v.L))} = ${sg(g(v, 'a') * g(v, 'x') + g(v, 'b'))}`) },
    answer: (v) => eq1(String(v.L), g(v, 'x')),
    options: (v) => rootOptions(String(v.L), g(v, 'x'), [(g(v, 'a') * g(v, 'x') + 2 * g(v, 'b')) / g(v, 'a'), g(v, 'a') * g(v, 'x') + g(v, 'b'), g(v, 'x') + g(v, 'b')]),
    why: (v, a) => `${sg(g(v, 'a') * g(v, 'x') + g(v, 'b'))} ${g(v, 'b') < 0 ? '+' : MINUS} ${Math.abs(g(v, 'b'))} = ${sg(g(v, 'a') * g(v, 'x'))}; ${sg(g(v, 'a') * g(v, 'x'))} ÷ ${v.a} = ${S(v, 'x')}. ${a}.`,
  }),
  t({
    sub: 'u07-01',
    prompt: 'ამოხსენი განტოლება: {eq}.',
    vars: { L: Lvar, a: I(5, 9), b: I(5, 20), x: I(2, 10), eq: D((v) => `${lineq(g(v, 'a'), -g(v, 'b'), String(v.L))} = ${g(v, 'a') * g(v, 'x') - g(v, 'b')}`) },
    answer: (v) => eq1(String(v.L), g(v, 'x')),
    options: (v) => rootOptions(String(v.L), g(v, 'x'), [(g(v, 'a') * g(v, 'x') - 2 * g(v, 'b')) / g(v, 'a'), g(v, 'a') * g(v, 'x') - g(v, 'b'), g(v, 'x') - g(v, 'b')]),
    why: (v, a) => `${g(v, 'a') * g(v, 'x') - g(v, 'b')} + ${v.b} = ${g(v, 'a') * g(v, 'x')}; ${g(v, 'a') * g(v, 'x')} ÷ ${v.a} = ${v.x}. ${a}.`,
  }),
  t({
    sub: 'u07-01',
    prompt: 'ამოხსენი განტოლება: {eq}.',
    vars: { L: Lvar, a: I(2, 6), b: I(1, 8), x: nonZero(-5, 12), eq: D((v) => `${g(v, 'a')}(${String(v.L)} ${MINUS} ${g(v, 'b')}) = ${sg(g(v, 'a') * (g(v, 'x') - g(v, 'b')))}`) },
    answer: (v) => eq1(String(v.L), g(v, 'x')),
    options: (v) => rootOptions(String(v.L), g(v, 'x'), [g(v, 'x') - 2 * g(v, 'b'), g(v, 'a') * (g(v, 'x') - g(v, 'b')) - g(v, 'b'), g(v, 'a') * (g(v, 'x') - g(v, 'b')) + g(v, 'b')]),
    why: (v, a) => `${sg(g(v, 'a') * (g(v, 'x') - g(v, 'b')))} ÷ ${v.a} = ${sg(g(v, 'x') - g(v, 'b'))}; ${sg(g(v, 'x') - g(v, 'b'))} + ${v.b} = ${S(v, 'x')}. ${a}.`,
  }),
  t({
    sub: 'u07-01',
    prompt: 'ამოხსენი განტოლება: {eq}.',
    vars: { L: Lvar, c: I(1, 5), k: I(1, 6), b: nonZero(-9, 9), x: nonZero(-6, 10),
      eq: D((v) => `${lineq(g(v, 'c') + g(v, 'k'), g(v, 'b'), String(v.L))} = ${lineq(g(v, 'c'), g(v, 'b') + g(v, 'k') * g(v, 'x'), String(v.L))}`) },
    answer: (v) => eq1(String(v.L), g(v, 'x')),
    options: (v) => rootOptions(String(v.L), g(v, 'x'), [-g(v, 'x'), g(v, 'x') + 1, (g(v, 'k') * g(v, 'x')) / (2 * g(v, 'c') + g(v, 'k'))]),
    why: (v, a) => `${v.L}-ები ერთ მხარეს: ${v.k}${v.L} = ${sg(g(v, 'k') * g(v, 'x'))}, ამიტომ ${a}.`,
  }),
  t({
    sub: 'u07-01',
    prompt: 'ამოხსენი განტოლება: {eq}.',
    vars: { L: Lvar, m: C([2, 3, 4, 5, 6]), k: I(2, 9), b: I(1, 9),
      eq: D((v) => `${String(v.L)}/${g(v, 'm')} + ${g(v, 'b')} = ${g(v, 'k') + g(v, 'b')}`) },
    answer: (v) => eq1(String(v.L), g(v, 'm') * g(v, 'k')),
    options: (v) => rootOptions(String(v.L), g(v, 'm') * g(v, 'k'), [g(v, 'm') * (g(v, 'k') + 2 * g(v, 'b')), g(v, 'k'), (g(v, 'k') + g(v, 'b')) * g(v, 'm') + g(v, 'b'), g(v, 'k') + g(v, 'm')]),
    why: (v, a) => `${g(v, 'k') + g(v, 'b')} ${MINUS} ${v.b} = ${v.k}, შემდეგ ${v.k} · ${v.m} = ${g(v, 'm') * g(v, 'k')}. ${a}.`,
  }),
  t({
    sub: 'u07-01',
    d: 2,
    prompt: 'ამოხსენი განტოლება: {eq}.',
    vars: { L: Lvar, a: I(2, 4), b: I(2, 4), f: I(1, 3), c: I(1, 3), x: I(1, 10),
      eq: D((v) => `${g(v, 'a')}(${g(v, 'b')}${String(v.L)} ${MINUS} ${g(v, 'f')}) = ${lineq(g(v, 'c'), g(v, 'a') * (g(v, 'b') * g(v, 'x') - g(v, 'f')) - g(v, 'c') * g(v, 'x'), String(v.L))}`) },
    constraints: [{ test: (v: Vars) => g(v, 'a') * g(v, 'b') !== g(v, 'c'), note: 'one root' }],
    answer: (v) => eq1(String(v.L), g(v, 'x')),
    options: (v) => rootOptions(String(v.L), g(v, 'x'), [-g(v, 'x'), g(v, 'x') + 1, g(v, 'x') - 1]),
    why: (v, a) => `ფრჩხილების გახსნის შემდეგ ${v.L}-ები ერთ მხარეს, რიცხვები მეორეში: ${a}.`,
  }),

  // ═════════ U07.2 — ეკვივალენტური განტოლებები ═════════
  t({
    sub: 'u07-02',
    prompt: 'განტოლება {eq} გარდაქმენი ეკვივალენტურ განტოლებად, რომლის მარცხენა მხარეს მხოლოდ {L} იქნება. იპოვე {L}.',
    vars: { L: Lvar, a: I(2, 20), b: I(2, 30), s: C([1, -1]), eq: D((v) => `${String(v.L)} ${g(v, 's') < 0 ? MINUS : '+'} ${g(v, 'a')} = ${g(v, 'b')}`) },
    answer: (v) => eq1(String(v.L), g(v, 'b') - g(v, 's') * g(v, 'a')),
    options: (v) => rootOptions(String(v.L), g(v, 'b') - g(v, 's') * g(v, 'a'), [g(v, 'b') + g(v, 's') * g(v, 'a'), g(v, 'b'), g(v, 'a') - g(v, 'b')]),
    why: (v, a) => `ორივე მხარეს ${g(v, 's') < 0 ? 'ვუმატებთ' : 'ვაკლებთ'} ${v.a}-ს: ${v.L} = ${g(v, 'b')} ${g(v, 's') < 0 ? '+' : MINUS} ${v.a}. ${a}.`,
  }),
  t({
    sub: 'u07-02',
    prompt: 'ამოხსენი განტოლება: {eq}.',
    vars: { L: Lvar, a: I(2, 9), x: nonZero(-9, 12), eq: D((v) => `${g(v, 'a')}${String(v.L)} = ${sg(g(v, 'a') * g(v, 'x'))}`) },
    answer: (v) => eq1(String(v.L), g(v, 'x')),
    options: (v) => rootOptions(String(v.L), g(v, 'x'), [g(v, 'a') * g(v, 'x') - g(v, 'a'), g(v, 'a') * g(v, 'x') + g(v, 'a'), g(v, 'a') * g(v, 'x') * g(v, 'a')]),
    why: (v, a) => `ორივე მხარე გავყოთ ${v.a}-ზე: ${sg(g(v, 'a') * g(v, 'x'))} ÷ ${v.a} = ${S(v, 'x')}. ${a}.`,
  }),
  t({
    sub: 'u07-02',
    prompt: 'ამოხსენი განტოლება: {eq}.',
    vars: { L: Lvar, a: I(2, 6), b: I(1, 12), x: I(1, 12), eq: D((v) => `${lineq(g(v, 'a'), g(v, 'b'), String(v.L))} = ${g(v, 'a') * g(v, 'x') + g(v, 'b')}`) },
    answer: (v) => eq1(String(v.L), g(v, 'x')),
    options: (v) => rootOptions(String(v.L), g(v, 'x'), [(g(v, 'a') * g(v, 'x')) + g(v, 'b'), g(v, 'x') + g(v, 'b'), (g(v, 'a') * g(v, 'x') + 2 * g(v, 'b')) / g(v, 'a')]),
    why: (v, a) => `${g(v, 'a') * g(v, 'x') + g(v, 'b')} ${MINUS} ${v.b} = ${g(v, 'a') * g(v, 'x')}; ${g(v, 'a') * g(v, 'x')} ÷ ${v.a} = ${v.x}. ${a}.`,
  }),
  t({
    sub: 'u07-02',
    prompt: 'ამოხსენი განტოლება: {eq}.',
    vars: { L: Lvar, a: I(2, 7), b: I(1, 8), x: I(1, 10), eq: D((v) => `${g(v, 'a')}(${String(v.L)} + ${g(v, 'b')}) = ${g(v, 'a') * (g(v, 'x') + g(v, 'b'))}`) },
    answer: (v) => eq1(String(v.L), g(v, 'x')),
    options: (v) => rootOptions(String(v.L), g(v, 'x'), [g(v, 'x') + 2 * g(v, 'b'), g(v, 'a') * (g(v, 'x') + g(v, 'b')) - g(v, 'b'), g(v, 'x') + g(v, 'b')]),
    why: (v, a) => `${g(v, 'a') * (g(v, 'x') + g(v, 'b'))} ÷ ${v.a} = ${g(v, 'x') + g(v, 'b')}; ${g(v, 'x') + g(v, 'b')} ${MINUS} ${v.b} = ${v.x}. ${a}.`,
  }),
  t({
    sub: 'u07-02',
    prompt: 'ამოხსენი განტოლება: {eq}.',
    vars: { L: Lvar, a: I(2, 8), b: I(2, 12), x: I(2, 12), eq: D((v) => `${lineq(g(v, 'a'), -g(v, 'b'), String(v.L))} = ${g(v, 'a') * g(v, 'x') - g(v, 'b')}`) },
    constraints: [{ test: (v: Vars) => g(v, 'a') * g(v, 'x') > g(v, 'b'), note: 'a positive right side' }],
    answer: (v) => eq1(String(v.L), g(v, 'x')),
    options: (v) => rootOptions(String(v.L), g(v, 'x'), [(g(v, 'a') * g(v, 'x') - 2 * g(v, 'b')) / g(v, 'a'), g(v, 'x') - g(v, 'b'), g(v, 'a') * g(v, 'x') - g(v, 'b')]),
    why: (v, a) => `${g(v, 'a') * g(v, 'x') - g(v, 'b')} + ${v.b} = ${g(v, 'a') * g(v, 'x')}; ${g(v, 'a') * g(v, 'x')} ÷ ${v.a} = ${v.x}. ${a}.`,
  }),
  t({
    sub: 'u07-02',
    d: 2,
    prompt: 'ამოხსენი განტოლება: {eq}. რამდენი ამონახსნი აქვს განტოლებას?',
    vars: { L: Lvar, k: I(2, 4), p: I(1, 5), q: I(1, 5), r: I(1, 5), kind: C([0, 1, 2]),
      eq: D((v) => {
        const [k, p, q, r, kind] = [g(v, 'k'), g(v, 'p'), g(v, 'q'), g(v, 'r'), g(v, 'kind')];
        const A = kind === 2 ? k * p + r : k * p;
        const B = kind === 1 ? k * q + r : k * q;
        return `${lineq(A, B, String(v.L))} = ${k}(${lineq(p, q, String(v.L))})`;
      }) },
    answer: (v) => (g(v, 'kind') === 0 ? 'უსასრულოდ ბევრი' : g(v, 'kind') === 1 ? 'არცერთი' : 'ერთი'),
    options: (_v, right) => textOptions(right, ['ერთი', 'არცერთი', 'უსასრულოდ ბევრი', 'ორი']),
    why: (v, a) => (g(v, 'kind') === 0 ? `ორივე მხარე ერთნაირ გამოსახულებამდე დაიყვანება, ამიტომ ამონახსნები: ${a}.` : g(v, 'kind') === 1 ? `${v.L}-ის კოეფიციენტები ტოლია, თავისუფალი წევრები — არა, ამიტომ ამონახსნი: ${a}.` : `${v.L}-ის კოეფიციენტები განსხვავდება, ამიტომ ამონახსნი: ${a}.`),
  }),

  // ═════════ U07.3 — მოდულის შემცველი განტოლებები ═════════
  ...[7, 12].map((hi) =>
    t({
      sub: 'u07-03',
      prompt: 'ამოხსენი განტოლება: |{L}| = {r}.',
      vars: { L: Lvar, r: I(hi === 7 ? 2 : 8, hi === 7 ? 9 : 25) },
      answer: (v) => two(String(v.L), -g(v, 'r'), g(v, 'r')),
      options: (v, right) => textOptions(right, [eq1(String(v.L), g(v, 'r')), eq1(String(v.L), -g(v, 'r')), two(String(v.L), -g(v, 'r') - 1, g(v, 'r') + 1), eq1(String(v.L), 0), two(String(v.L), 0, g(v, 'r'))]),
      why: (v, a) => `|${v.L}| = ${v.r} ნიშნავს, რომ ${v.L} = ${v.r} ან ${v.L} = ${MINUS}${v.r}. ${a}.`,
    })),
  t({
    sub: 'u07-03',
    prompt: 'ამოხსენი განტოლება: |{L} {MINUS} {c}| = {r}.',
    vars: { L: Lvar, c: I(1, 9), r: I(1, 9), MINUS: D(() => MINUS) },
    answer: (v) => two(String(v.L), g(v, 'c') - g(v, 'r'), g(v, 'c') + g(v, 'r')),
    options: (v, right) => textOptions(right, [eq1(String(v.L), g(v, 'c') + g(v, 'r')), two(String(v.L), -g(v, 'c') - g(v, 'r'), -g(v, 'c') + g(v, 'r')), two(String(v.L), -g(v, 'r'), g(v, 'r')), two(String(v.L), g(v, 'c') - g(v, 'r') + 1, g(v, 'c') + g(v, 'r') + 1), eq1(String(v.L), g(v, 'c') - g(v, 'r'))]),
    why: (v, a) => `${v.L} ${MINUS} ${v.c} = ${v.r} ან ${v.L} ${MINUS} ${v.c} = ${MINUS}${v.r}. ${a}.`,
  }),
  t({
    sub: 'u07-03',
    prompt: 'ამოხსენი განტოლება: |{L} + {c}| = {r}.',
    vars: { L: Lvar, c: I(1, 9), r: I(1, 9) },
    answer: (v) => two(String(v.L), -g(v, 'c') - g(v, 'r'), -g(v, 'c') + g(v, 'r')),
    options: (v, right) => textOptions(right, [eq1(String(v.L), -g(v, 'c') + g(v, 'r')), two(String(v.L), g(v, 'c') - g(v, 'r'), g(v, 'c') + g(v, 'r')), two(String(v.L), -g(v, 'r'), g(v, 'r')), two(String(v.L), -g(v, 'c') - g(v, 'r') + 1, -g(v, 'c') + g(v, 'r') + 1), eq1(String(v.L), -g(v, 'c') - g(v, 'r'))]),
    why: (v, a) => `${v.L} + ${v.c} = ${v.r} ან ${v.L} + ${v.c} = ${MINUS}${v.r}. ${a}.`,
  }),
  t({
    sub: 'u07-03',
    prompt: 'ამოხსენი განტოლება: |{a}{L}| = {r}.',
    vars: { L: Lvar, a: I(2, 6), k: I(1, 9), r: D((v) => g(v, 'a') * g(v, 'k')) },
    answer: (v) => two(String(v.L), -g(v, 'k'), g(v, 'k')),
    options: (v, right) => textOptions(right, [two(String(v.L), -g(v, 'r'), g(v, 'r')), eq1(String(v.L), g(v, 'k')), two(String(v.L), -g(v, 'k') - 1, g(v, 'k') + 1), eq1(String(v.L), 0)]),
    why: (v, a) => `${v.a}${v.L} = ${v.r} ან ${v.a}${v.L} = ${MINUS}${v.r}; ორივე გავყოთ ${v.a}-ზე. ${a}.`,
  }),
  t({
    sub: 'u07-03',
    prompt: 'ამოხსენი განტოლება: |{L} {sgn} {c}| = 0.',
    vars: { L: Lvar, c: I(1, 12), s: C([1, -1]), sgn: D((v) => (g(v, 's') < 0 ? MINUS : '+')) },
    answer: (v) => eq1(String(v.L), -g(v, 's') * g(v, 'c')),
    options: (v, right) => textOptions(right, [eq1(String(v.L), g(v, 's') * g(v, 'c')), two(String(v.L), g(v, 'c'), -g(v, 'c')), eq1(String(v.L), 0), eq1(String(v.L), -g(v, 's') * g(v, 'c') + 1)]),
    why: (v, a) => `|…| = 0 მხოლოდ მაშინ, როცა გამოსახულება 0-ის ტოლია: ${v.L} ${g(v, 's') < 0 ? MINUS : '+'} ${v.c} = 0. ${a}.`,
  }),

  // ═════════ U07.4 — სისტემები: ჩასმის მეთოდი ═════════
  t({
    sub: 'u07-04',
    prompt: 'ამოხსენი სისტემა: y = x {sgn} {k} და x + y = {s}.',
    vars: { x: I(1, 9), y: I(1, 12), k: D((v) => Math.abs(g(v, 'y') - g(v, 'x'))), sgn: D((v) => (g(v, 'y') < g(v, 'x') ? MINUS : '+')), s: D((v) => g(v, 'x') + g(v, 'y')) },
    constraints: [{ test: (v: Vars) => g(v, 'x') !== g(v, 'y'), note: 'k ≠ 0' }],
    answer: (v) => `x = ${v.x}, y = ${v.y}`,
    options: (v, right) => textOptions(right, [`x = ${v.y}, y = ${v.x}`, `x = ${g(v, 'x') + 1}, y = ${g(v, 'y') - 1}`, `x = ${g(v, 'x') - 1}, y = ${g(v, 'y') + 1}`, `x = ${g(v, 'x') + 1}, y = ${g(v, 'y') + 1}`]),
    why: (v, a) => `ჩავსვათ y მეორე განტოლებაში: x + (x ${g(v, 'y') < g(v, 'x') ? MINUS : '+'} ${v.k}) = ${v.s}, ამიტომ 2x = ${g(v, 'x') * 2}, x = ${v.x}, y = ${v.y}. ${a}.`,
  }),
  t({
    sub: 'u07-04',
    prompt: 'ამოხსენი სისტემა: y = {m}x და x + y = {s}.',
    vars: { x: I(1, 9), m: I(2, 4), s: D((v) => g(v, 'x') * (1 + g(v, 'm'))) },
    answer: (v) => `x = ${v.x}, y = ${g(v, 'm') * g(v, 'x')}`,
    options: (v, right) => textOptions(right, [`x = ${g(v, 'm') * g(v, 'x')}, y = ${v.x}`, `x = ${g(v, 'x') + 1}, y = ${g(v, 'm') * g(v, 'x') - 1}`, `x = ${v.x}, y = ${g(v, 'x') * (1 + g(v, 'm')) - g(v, 'm')}`, `x = ${g(v, 'x') + 1}, y = ${g(v, 'm') * g(v, 'x')}`]),
    why: (v, a) => `x + ${v.m}x = ${v.s}, ამიტომ ${1 + g(v, 'm')}x = ${v.s}, x = ${v.x}, y = ${g(v, 'm') * g(v, 'x')}. ${a}.`,
  }),
  t({
    sub: 'u07-04',
    prompt: 'ამოხსენი სისტემა: x = y {sgn} {k} და x + y = {s}.',
    vars: { x: I(1, 12), y: I(1, 9), k: D((v) => Math.abs(g(v, 'x') - g(v, 'y'))), sgn: D((v) => (g(v, 'x') < g(v, 'y') ? MINUS : '+')), s: D((v) => g(v, 'x') + g(v, 'y')) },
    constraints: [{ test: (v: Vars) => g(v, 'x') !== g(v, 'y'), note: 'k ≠ 0' }],
    answer: (v) => `x = ${v.x}, y = ${v.y}`,
    options: (v, right) => textOptions(right, [`x = ${v.y}, y = ${v.x}`, `x = ${g(v, 'x') + 1}, y = ${g(v, 'y') - 1}`, `x = ${g(v, 'x') - 1}, y = ${g(v, 'y') + 1}`, `x = ${g(v, 'x') + 1}, y = ${g(v, 'y') + 1}`]),
    why: (v, a) => `ჩავსვათ x მეორე განტოლებაში: (y ${g(v, 'x') < g(v, 'y') ? MINUS : '+'} ${v.k}) + y = ${v.s}, ამიტომ 2y = ${g(v, 'y') * 2}, y = ${v.y}, x = ${v.x}. ${a}.`,
  }),
  t({
    sub: 'u07-04',
    d: 2,
    prompt: 'ამოხსენი სისტემა: y = x {sgn} {k} და {a}x + y = {s}.',
    vars: { x: I(2, 9), a: I(2, 3), y: I(1, 8), k: D((v) => Math.abs(g(v, 'y') - g(v, 'x'))), sgn: D((v) => (g(v, 'y') < g(v, 'x') ? MINUS : '+')), s: D((v) => g(v, 'a') * g(v, 'x') + g(v, 'y')) },
    constraints: [{ test: (v: Vars) => g(v, 'x') !== g(v, 'y'), note: 'k ≠ 0' }],
    answer: (v) => `x = ${v.x}, y = ${v.y}`,
    options: (v, right) => textOptions(right, [`x = ${v.y}, y = ${v.x}`, `x = ${g(v, 'x') + 1}, y = ${g(v, 'y') + 1}`, `x = ${g(v, 'x') - 1}, y = ${g(v, 'y') - 1}`, `x = ${g(v, 'x') + 1}, y = ${g(v, 'y') - 1}`]),
    why: (v, a) => `ჩავსვათ y: ${v.a}x + (x ${g(v, 'y') < g(v, 'x') ? MINUS : '+'} ${v.k}) = ${v.s}, ამიტომ ${g(v, 'a') + 1}x = ${(g(v, 'a') + 1) * g(v, 'x')}, x = ${v.x}, y = ${v.y}. ${a}.`,
  }),
  t({
    sub: 'u07-04',
    prompt: 'ამოხსენი სისტემა: x = {m}y და x + y = {s}.',
    vars: { y: I(1, 9), m: I(2, 4), s: D((v) => g(v, 'y') * (1 + g(v, 'm'))) },
    answer: (v) => `x = ${g(v, 'm') * g(v, 'y')}, y = ${v.y}`,
    options: (v, right) => textOptions(right, [`x = ${v.y}, y = ${g(v, 'm') * g(v, 'y')}`, `x = ${g(v, 'm') * g(v, 'y') + 1}, y = ${g(v, 'y') - 1}`, `x = ${g(v, 'm') * g(v, 'y')}, y = ${g(v, 'y') + 1}`, `x = ${g(v, 'y') * (1 + g(v, 'm')) - g(v, 'y')}, y = ${g(v, 'm')}`]),
    why: (v, a) => `${v.m}y + y = ${v.s}, ამიტომ ${1 + g(v, 'm')}y = ${v.s}, y = ${v.y}, x = ${g(v, 'm') * g(v, 'y')}. ${a}.`,
  }),
  t({
    sub: 'u07-04',
    d: 2,
    prompt: 'ამოხსენი სისტემა: y = {e} და x + y = {s}.',
    vars: { x: I(1, 6), p: I(2, 4), q: I(1, 5), e: D((v) => pt(lin(g(v, 'p'), -g(v, 'q')), 'x')), s: D((v) => g(v, 'x') + g(v, 'p') * g(v, 'x') - g(v, 'q')) },
    constraints: [{ test: (v: Vars) => g(v, 'p') * g(v, 'x') - g(v, 'q') > 0, note: 'positive y' }],
    answer: (v) => `x = ${v.x}, y = ${g(v, 'p') * g(v, 'x') - g(v, 'q')}`,
    options: (v, right) => textOptions(right, [`x = ${g(v, 'p') * g(v, 'x') - g(v, 'q')}, y = ${v.x}`, `x = ${g(v, 'x') + 1}, y = ${g(v, 'p') * g(v, 'x') - g(v, 'q')}`, `x = ${v.x}, y = ${g(v, 'p') * g(v, 'x') + g(v, 'q')}`, `x = ${g(v, 'x') - 1}, y = ${g(v, 'p') * g(v, 'x') - g(v, 'q')}`]),
    why: (v, a) => `x + (${v.e}) = ${v.s}, ამიტომ ${1 + g(v, 'p')}x = ${g(v, 'x') * (1 + g(v, 'p'))}, x = ${v.x}. ${a}.`,
  }),

  // ═════════ U07.5 — სისტემები: შეკრების მეთოდი ═════════
  ...[
    { a: 1, b: 1, name: 'plain' },
    { a: 2, b: 1, name: 'ax' },
    { a: 3, b: 2, name: 'axby' },
    { a: 1, b: 2, name: 'by' },
    { a: 2, b: 3, name: 'axby2' },
    { a: 4, b: 1, name: 'ax2' },
  ].map(({ a, b, name }) => {
    const first = (v: Vars): string => `${a === 1 ? '' : a}x + ${b === 1 ? '' : b}y = ${g(v, 'x') * a + g(v, 'y') * b}`;
    const second = (v: Vars): string => `${a === 1 ? '' : a}x ${MINUS} ${b === 1 ? '' : b}y = ${sg(g(v, 'x') * a - g(v, 'y') * b)}`;
    return t({
      sub: 'u07-05',
      prompt: 'ამოხსენი სისტემა: {e1} და {e2}.',
      vars: { x: name === 'axby2' ? I(1, 5) : I(1, 9), y: name === 'axby2' ? I(1, 4) : I(1, 8), e1: D(first), e2: D(second) },
      answer: (v) => `x = ${v.x}, y = ${v.y}`,
      options: (v, right) => textOptions(right, [`x = ${v.y}, y = ${v.x}`, `x = ${g(v, 'x') + 1}, y = ${g(v, 'y') - 1}`, `x = ${g(v, 'x') - 1}, y = ${g(v, 'y') + 1}`, `x = ${g(v, 'x') + 1}, y = ${g(v, 'y') + 1}`]),
      why: (v, a2) => `განტოლებებს შევკრიბოთ: ${2 * a}x = ${2 * a * g(v, 'x')}, x = ${v.x}; შემდეგ y = ${v.y}. ${a2}.`,
    });
  }),

  // ═════════ U07.6 — კვადრატული განტოლებები გამარტივებით ═════════
  t({
    sub: 'u07-06',
    prompt: 'ამოხსენი განტოლება: {L}{ex} = {c}.',
    vars: { L: Lvar, k: I(2, 15), ex: D(() => sup2), c: D((v) => g(v, 'k') ** 2) },
    answer: (v) => two(String(v.L), -g(v, 'k'), g(v, 'k')),
    options: (v, right) => textOptions(right, [eq1(String(v.L), g(v, 'k')), eq1(String(v.L), -g(v, 'k')), two(String(v.L), -g(v, 'c'), g(v, 'c')), two(String(v.L), -g(v, 'k') - 1, g(v, 'k') + 1), eq1(String(v.L), g(v, 'c') / 2)]),
    why: (v, a) => `${v.L}${sup2} = ${v.c} ნიშნავს ${v.L} = ${v.k} ან ${v.L} = ${MINUS}${v.k}. ${a}.`,
  }),
  t({
    sub: 'u07-06',
    prompt: 'ამოხსენი განტოლება: {L}{ex} {MINUS} {c} = 0.',
    vars: { L: Lvar, k: I(2, 13), ex: D(() => sup2), c: D((v) => g(v, 'k') ** 2), MINUS: D(() => MINUS) },
    answer: (v) => two(String(v.L), -g(v, 'k'), g(v, 'k')),
    options: (v, right) => textOptions(right, [eq1(String(v.L), g(v, 'k')), eq1(String(v.L), g(v, 'c')), two(String(v.L), -g(v, 'c'), g(v, 'c')), two(String(v.L), -g(v, 'k') + 1, g(v, 'k') + 1), eq1(String(v.L), 0)]),
    why: (v, a) => `${v.L}${sup2} = ${v.c}, ამიტომ ${a}.`,
  }),
  t({
    sub: 'u07-06',
    prompt: 'ამოხსენი განტოლება: {e} = 0.',
    vars: { L: Lvar, p: nonZero(-12, 12), e: D((v) => pt([0, g(v, 'p'), 1], String(v.L))) },
    answer: (v) => two(String(v.L), 0, -g(v, 'p')),
    options: (v, right) => textOptions(right, [eq1(String(v.L), -g(v, 'p')), two(String(v.L), 0, g(v, 'p')), eq1(String(v.L), 0), two(String(v.L), g(v, 'p'), -g(v, 'p')), two(String(v.L), 1, -g(v, 'p'))]),
    why: (v, a) => `საერთო მამრავლი ${v.L}: ${v.L}(${pt(lin(1, g(v, 'p')), String(v.L))}) = 0; ${v.L} = 0 ან ${pt(lin(1, g(v, 'p')), String(v.L))} = 0. ${a}.`,
  }),
  t({
    sub: 'u07-06',
    d: 2,
    prompt: 'ამოხსენი განტოლება: {e} = 0.',
    vars: { L: Lvar, p: I(1, 6), q: I(2, 9), e: D((v) => pt(quad(1, -(g(v, 'p') + g(v, 'q')), g(v, 'p') * g(v, 'q')), String(v.L))) },
    constraints: [{ test: (v: Vars) => g(v, 'p') < g(v, 'q'), note: 'two different roots' }],
    answer: (v) => two(String(v.L), g(v, 'p'), g(v, 'q')),
    options: (v, right) => textOptions(right, [two(String(v.L), -g(v, 'p'), -g(v, 'q')), two(String(v.L), g(v, 'p') + g(v, 'q'), g(v, 'p') * g(v, 'q')), two(String(v.L), 1, g(v, 'p') * g(v, 'q')), two(String(v.L), g(v, 'p') + 1, g(v, 'q')), two(String(v.L), g(v, 'p'), g(v, 'q') + 1)]),
    why: (v, a) => `ორი რიცხვი, რომლის ჯამია ${g(v, 'p') + g(v, 'q')}, ნამრავლი კი ${g(v, 'p') * g(v, 'q')}: ${v.p} და ${v.q}. ${a}.`,
  }),
  t({
    sub: 'u07-06',
    prompt: 'ამოხსენი განტოლება: {L}{ex} + {a} = {c}.',
    vars: { L: Lvar, k: I(2, 10), a: I(1, 20), ex: D(() => sup2), c: D((v) => g(v, 'k') ** 2 + g(v, 'a')) },
    answer: (v) => two(String(v.L), -g(v, 'k'), g(v, 'k')),
    options: (v, right) => textOptions(right, [eq1(String(v.L), g(v, 'k')), two(String(v.L), -g(v, 'c'), g(v, 'c')), two(String(v.L), -g(v, 'k') - 1, g(v, 'k') + 1), two(String(v.L), -g(v, 'c') - g(v, 'a'), g(v, 'c') + g(v, 'a'))]),
    why: (v, a) => `${v.L}${sup2} = ${v.c} ${MINUS} ${v.a} = ${g(v, 'k') ** 2}, ამიტომ ${a}.`,
  }),
  t({
    sub: 'u07-06',
    d: 2,
    prompt: 'ამოხსენი განტოლება: {a}{L}{ex} {MINUS} {c} = 0.',
    vars: { L: Lvar, a: I(2, 5), k: I(2, 8), ex: D(() => sup2), c: D((v) => g(v, 'a') * g(v, 'k') ** 2), MINUS: D(() => MINUS) },
    answer: (v) => two(String(v.L), -g(v, 'k'), g(v, 'k')),
    options: (v, right) => textOptions(right, [eq1(String(v.L), g(v, 'k')), two(String(v.L), -(g(v, 'k') ** 2), g(v, 'k') ** 2), two(String(v.L), -g(v, 'c'), g(v, 'c')), two(String(v.L), -g(v, 'k') - 1, g(v, 'k') + 1)]),
    why: (v, a) => `${v.a}${v.L}${sup2} = ${v.c}, ${v.L}${sup2} = ${g(v, 'k') ** 2}. ${a}.`,
  }),

  // ═════════ U07.7 — წრფივი უტოლობები ═════════
  t({
    sub: 'u07-07',
    prompt: 'ამოხსენი უტოლობა: {L} {s} {a} {op} {b}.',
    vars: { L: Lvar, op: C(OPS), sgn: C([1, -1]), a: I(2, 15), k: nonZero(-10, 20), s: D((v) => (g(v, 'sgn') < 0 ? MINUS : '+')), b: D((v) => sg(g(v, 'k') + g(v, 'sgn') * g(v, 'a'))) },
    answer: (v) => rel(String(v.L), String(v.op), sg(g(v, 'k'))),
    options: (v, right) => textOptions(right, [rel(String(v.L), FLIP[String(v.op)]!, sg(g(v, 'k'))), rel(String(v.L), String(v.op), sg(g(v, 'k') + 2 * g(v, 'sgn') * g(v, 'a'))), rel(String(v.L), STRICTNESS[String(v.op)]!, sg(g(v, 'k'))), rel(String(v.L), FLIP[String(v.op)]!, sg(g(v, 'k') + 2 * g(v, 'sgn') * g(v, 'a')))]),
    why: (v, a) => `ორივე მხარეს ${g(v, 'sgn') < 0 ? 'ვუმატებთ' : 'ვაკლებთ'} ${v.a}-ს; უტოლობის ნიშანი არ იცვლება: ${a}.`,
  }),
  t({
    sub: 'u07-07',
    prompt: 'ამოხსენი უტოლობა: {a}{L} {op} {b}.',
    vars: { L: Lvar, op: C(OPS), a: I(2, 9), k: nonZero(-9, 12), b: D((v) => sg(g(v, 'a') * g(v, 'k'))) },
    answer: (v) => rel(String(v.L), String(v.op), sg(g(v, 'k'))),
    options: (v, right) => textOptions(right, [rel(String(v.L), FLIP[String(v.op)]!, sg(g(v, 'k'))), rel(String(v.L), String(v.op), sg(g(v, 'a') * g(v, 'k') - g(v, 'a'))), rel(String(v.L), STRICTNESS[String(v.op)]!, sg(g(v, 'k'))), rel(String(v.L), String(v.op), sg(g(v, 'a') * g(v, 'k')))]),
    why: (v, a) => `ორივე მხარე გავყოთ დადებით ${v.a}-ზე; ნიშანი არ იცვლება: ${a}.`,
  }),
  t({
    sub: 'u07-07',
    prompt: 'ამოხსენი უტოლობა: {e} {op} {c}.',
    vars: { L: Lvar, op: C(OPS), a: I(2, 6), b: I(1, 12), k: I(1, 12), e: D((v) => lineq(g(v, 'a'), -g(v, 'b'), String(v.L))), c: D((v) => g(v, 'a') * g(v, 'k') - g(v, 'b')) },
    answer: (v) => rel(String(v.L), String(v.op), sg(g(v, 'k'))),
    options: (v, right) => textOptions(right, [rel(String(v.L), FLIP[String(v.op)]!, sg(g(v, 'k'))), rel(String(v.L), String(v.op), sg((g(v, 'a') * g(v, 'k') - 2 * g(v, 'b')) / g(v, 'a'))), rel(String(v.L), STRICTNESS[String(v.op)]!, sg(g(v, 'k'))), rel(String(v.L), String(v.op), sg(g(v, 'k') + g(v, 'b')))]),
    why: (v, a) => `${g(v, 'a') * g(v, 'k') - g(v, 'b')} + ${v.b} = ${g(v, 'a') * g(v, 'k')}; ${g(v, 'a') * g(v, 'k')} ÷ ${v.a} = ${v.k}; ${a}.`,
  }),
  t({
    sub: 'u07-07',
    prompt: 'ამოხსენი უტოლობა: {e} {op} {c}.',
    vars: { L: Lvar, op: C(OPS), a: I(2, 7), b: I(1, 9), k: nonZero(-8, 10), e: D((v) => lineq(g(v, 'a'), g(v, 'b'), String(v.L))), c: D((v) => sg(g(v, 'a') * g(v, 'k') + g(v, 'b'))) },
    answer: (v) => rel(String(v.L), String(v.op), sg(g(v, 'k'))),
    options: (v, right) => textOptions(right, [rel(String(v.L), FLIP[String(v.op)]!, sg(g(v, 'k'))), rel(String(v.L), String(v.op), sg(g(v, 'k') + 2 * g(v, 'b') / g(v, 'a'))), rel(String(v.L), STRICTNESS[String(v.op)]!, sg(g(v, 'k'))), rel(String(v.L), String(v.op), sg(g(v, 'k') + g(v, 'b')))]),
    why: (v, a) => `${v.c} ${MINUS} ${v.b} = ${sg(g(v, 'a') * g(v, 'k'))}; ${sg(g(v, 'a') * g(v, 'k'))} ÷ ${v.a} = ${S(v, 'k')}; ${a}.`,
  }),
  t({
    sub: 'u07-07',
    d: 2,
    prompt: 'ამოხსენი უტოლობა: {e} {op} {c}.',
    vars: { L: Lvar, op: C(OPS), a: I(2, 6), k: nonZero(-9, 9), e: D((v) => pt(lin(-g(v, 'a'), 0), String(v.L))), c: D((v) => sg(-g(v, 'a') * g(v, 'k'))) },
    answer: (v) => rel(String(v.L), FLIP[String(v.op)]!, sg(g(v, 'k'))),
    options: (v, right) => textOptions(right, [rel(String(v.L), String(v.op), sg(g(v, 'k'))), rel(String(v.L), FLIP[String(v.op)]!, sg(-g(v, 'k'))), rel(String(v.L), String(v.op), sg(-g(v, 'k'))), rel(String(v.L), STRICTNESS[FLIP[String(v.op)]!]!, sg(g(v, 'k')))]),
    why: (_v, a) => `უარყოფით რიცხვზე გაყოფისას ნიშანი ბრუნდება: ${a}.`,
  }),
  t({
    sub: 'u07-07',
    d: 2,
    prompt: 'ამოხსენი უტოლობა: {a}({L} {MINUS} {b}) {op} {c}.',
    vars: { L: Lvar, op: C(OPS), a: I(2, 6), b: I(1, 8), k: I(1, 12), c: D((v) => sg(g(v, 'a') * (g(v, 'k') - g(v, 'b')))), MINUS: D(() => MINUS) },
    constraints: [{ test: (v: Vars) => g(v, 'k') !== g(v, 'b'), note: 'a non-zero right side' }],
    answer: (v) => rel(String(v.L), String(v.op), sg(g(v, 'k'))),
    options: (v, right) => textOptions(right, [rel(String(v.L), FLIP[String(v.op)]!, sg(g(v, 'k'))), rel(String(v.L), String(v.op), sg(g(v, 'k') - 2 * g(v, 'b'))), rel(String(v.L), STRICTNESS[String(v.op)]!, sg(g(v, 'k'))), rel(String(v.L), String(v.op), sg(g(v, 'a') * (g(v, 'k') - g(v, 'b')) - g(v, 'b')))]),
    why: (v, a) => `${sg(g(v, 'a') * (g(v, 'k') - g(v, 'b')))} ÷ ${v.a} = ${sg(g(v, 'k') - g(v, 'b'))}; ${sg(g(v, 'k') - g(v, 'b'))} + ${v.b} = ${S(v, 'k')}; ${a}.`,
  }),

  // ═════════ U07.8 — მოდულის შემცველი უტოლობები ═════════
  t({
    sub: 'u07-08',
    prompt: 'ამოხსენი უტოლობა: |{L}| {op} {r}.',
    vars: { L: Lvar, op: C(['<', '≤']), r: I(2, 12) },
    answer: (v) => between(String(v.L), -g(v, 'r'), String(v.op), g(v, 'r'), String(v.op)),
    options: (v, right) => textOptions(right, [`${String(v.L)} ${v.op === '<' ? '<' : '≤'} ${v.r}`, `${String(v.L)} ${v.op === '<' ? '<' : '≤'} ${sg(-g(v, 'r'))} ან ${String(v.L)} ${v.op === '<' ? '>' : '≥'} ${v.r}`, between(String(v.L), 0, String(v.op), g(v, 'r'), String(v.op)), between(String(v.L), -g(v, 'r'), STRICTNESS[String(v.op)]!, g(v, 'r'), STRICTNESS[String(v.op)]!)]),
    why: (v, a) => `|${v.L}| ${v.op} ${v.r} ნიშნავს, რომ ${v.L} ${v.r}-ზე ახლოსაა 0-თან ორივე მხარეს: ${a}.`,
  }),
  t({
    sub: 'u07-08',
    prompt: 'ამოხსენი უტოლობა: |{L}| {op} {r}.',
    vars: { L: Lvar, op: C(['>', '≥']), r: I(2, 12) },
    answer: (v) => `${String(v.L)} ${v.op === '>' ? '<' : '≤'} ${sg(-g(v, 'r'))} ან ${String(v.L)} ${v.op} ${v.r}`,
    options: (v, right) => textOptions(right, [between(String(v.L), -g(v, 'r'), v.op === '>' ? '<' : '≤', g(v, 'r'), v.op === '>' ? '<' : '≤'), `${String(v.L)} ${v.op} ${v.r}`, `${String(v.L)} ${v.op === '>' ? '<' : '≤'} ${sg(-g(v, 'r'))}`, `${String(v.L)} ${v.op === '>' ? '≤' : '<'} ${sg(-g(v, 'r'))} ან ${String(v.L)} ${v.op === '>' ? '≥' : '>'} ${v.r}`]),
    why: (v, a) => `|${v.L}| ${v.op} ${v.r} ნიშნავს, რომ ${v.L} 0-დან ${v.r}-ზე უფრო შორსაა: ${a}.`,
  }),
  t({
    sub: 'u07-08',
    prompt: 'ამოხსენი უტოლობა: |{L} {MINUS} {c}| {op} {r}.',
    vars: { L: Lvar, op: C(['<', '≤']), c: I(1, 8), r: I(1, 8), MINUS: D(() => MINUS) },
    answer: (v) => between(String(v.L), g(v, 'c') - g(v, 'r'), String(v.op), g(v, 'c') + g(v, 'r'), String(v.op)),
    options: (v, right) => textOptions(right, [between(String(v.L), -g(v, 'c') - g(v, 'r'), String(v.op), -g(v, 'c') + g(v, 'r'), String(v.op)), between(String(v.L), -g(v, 'r'), String(v.op), g(v, 'r'), String(v.op)), `${String(v.L)} ${v.op === '<' ? '<' : '≤'} ${sg(g(v, 'c') - g(v, 'r'))} ან ${String(v.L)} ${v.op === '<' ? '>' : '≥'} ${sg(g(v, 'c') + g(v, 'r'))}`, between(String(v.L), g(v, 'c') - g(v, 'r'), STRICTNESS[String(v.op)]!, g(v, 'c') + g(v, 'r'), STRICTNESS[String(v.op)]!)]),
    why: (v, a) => `${MINUS}${v.r} ${v.op} ${v.L} ${MINUS} ${v.c} ${v.op} ${v.r}; ყველა ნაწილს ვუმატებთ ${v.c}-ს: ${a}.`,
  }),
  t({
    sub: 'u07-08',
    prompt: 'ამოხსენი უტოლობა: |{L} {MINUS} {c}| {op} {r}.',
    vars: { L: Lvar, op: C(['>', '≥']), c: I(1, 8), r: I(1, 8), MINUS: D(() => MINUS) },
    answer: (v) => `${String(v.L)} ${v.op === '>' ? '<' : '≤'} ${sg(g(v, 'c') - g(v, 'r'))} ან ${String(v.L)} ${v.op} ${sg(g(v, 'c') + g(v, 'r'))}`,
    options: (v, right) => textOptions(right, [between(String(v.L), g(v, 'c') - g(v, 'r'), v.op === '>' ? '<' : '≤', g(v, 'c') + g(v, 'r'), v.op === '>' ? '<' : '≤'), `${String(v.L)} ${v.op === '>' ? '<' : '≤'} ${sg(-g(v, 'c') - g(v, 'r'))} ან ${String(v.L)} ${v.op} ${sg(-g(v, 'c') + g(v, 'r'))}`, `${String(v.L)} ${v.op === '>' ? '<' : '≤'} ${sg(-g(v, 'r'))} ან ${String(v.L)} ${v.op} ${g(v, 'r')}`, `${String(v.L)} ${v.op} ${sg(g(v, 'c') + g(v, 'r'))}`]),
    why: (v, a) => `${v.L} ${MINUS} ${v.c} ${v.op} ${v.r} ან ${v.L} ${MINUS} ${v.c} ${v.op === '>' ? '<' : '≤'} ${MINUS}${v.r}: ${a}.`,
  }),
  t({
    sub: 'u07-08',
    prompt: 'ამოხსენი უტოლობა: |{L} + {c}| {op} {r}.',
    vars: { L: Lvar, op: C(OPS), c: I(1, 8), r: I(1, 8) },
    answer: (v) => (v.op === '<' || v.op === '≤'
      ? between(String(v.L), -g(v, 'c') - g(v, 'r'), String(v.op), -g(v, 'c') + g(v, 'r'), String(v.op))
      : `${String(v.L)} ${v.op === '>' ? '<' : '≤'} ${sg(-g(v, 'c') - g(v, 'r'))} ან ${String(v.L)} ${v.op} ${sg(-g(v, 'c') + g(v, 'r'))}`),
    options: (v, right) => {
      const low = v.op === '<' || v.op === '≤';
      const L = String(v.L);
      const o = String(v.op);
      return textOptions(right, [
        low ? between(L, g(v, 'c') - g(v, 'r'), o, g(v, 'c') + g(v, 'r'), o) : `${L} ${FLIP[o]} ${sg(g(v, 'c') - g(v, 'r'))} ან ${L} ${o} ${sg(g(v, 'c') + g(v, 'r'))}`,
        low ? between(L, -g(v, 'r'), o, g(v, 'r'), o) : `${L} ${FLIP[o]} ${sg(-g(v, 'r'))} ან ${L} ${o} ${g(v, 'r')}`,
        `${L} ${o} ${sg(-g(v, 'c') + g(v, 'r'))}`,
        low ? between(L, -g(v, 'c') - g(v, 'r'), STRICTNESS[o]!, -g(v, 'c') + g(v, 'r'), STRICTNESS[o]!) : `${L} ${FLIP[STRICTNESS[o]!]} ${sg(-g(v, 'c') - g(v, 'r'))} ან ${L} ${STRICTNESS[o]} ${sg(-g(v, 'c') + g(v, 'r'))}`,
      ]);
    },
    why: (v, a) => `${MINUS}${v.r} და ${v.r} საზღვრებით, ${v.c}-ის გამოკლების შემდეგ: ${a}.`,
  }),
  t({
    sub: 'u07-08',
    prompt: 'ამოხსენი უტოლობა: |{a}{L}| {op} {r}.',
    vars: { L: Lvar, op: C(['<', '≤', '>', '≥']), a: I(2, 5), k: I(1, 8), r: D((v) => g(v, 'a') * g(v, 'k')) },
    answer: (v) => (v.op === '<' || v.op === '≤'
      ? between(String(v.L), -g(v, 'k'), String(v.op), g(v, 'k'), String(v.op))
      : `${String(v.L)} ${v.op === '>' ? '<' : '≤'} ${sg(-g(v, 'k'))} ან ${String(v.L)} ${v.op} ${g(v, 'k')}`),
    options: (v, right) => {
      const low = v.op === '<' || v.op === '≤';
      const L = String(v.L);
      const o = String(v.op);
      return textOptions(right, [
        low ? between(L, -g(v, 'r'), o, g(v, 'r'), o) : `${L} ${FLIP[o]} ${sg(-g(v, 'r'))} ან ${L} ${o} ${g(v, 'r')}`,
        `${L} ${o} ${g(v, 'k')}`,
        low ? between(L, -g(v, 'k') - 1, o, g(v, 'k') + 1, o) : `${L} ${FLIP[o]} ${sg(-g(v, 'k') - 1)} ან ${L} ${o} ${g(v, 'k') + 1}`,
        low ? between(L, -g(v, 'k'), STRICTNESS[o]!, g(v, 'k'), STRICTNESS[o]!) : `${L} ${FLIP[STRICTNESS[o]!]} ${sg(-g(v, 'k'))} ან ${L} ${STRICTNESS[o]} ${g(v, 'k')}`,
      ]);
    },
    why: (v, a) => `${v.a}${v.L} გამოსახულების მოდული ${v.r}-თან შედარებულია; ორივე გავყოთ ${v.a}-ზე: ${a}.`,
  }),

  // ═════════ U07.9 — უტოლობათა სისტემები ═════════
  t({
    sub: 'u07-09',
    prompt: 'ამოხსენი სისტემა: {L} {lop} {pS} და {L} {hop} {q}.',
    vars: { L: Lvar, p: I(-4, 6), pS: D((v) => sg(g(v, 'p'))), q: I(8, 14), lop: C(['>', '≥']), hop: C(['<', '≤']) },
    answer: (v) => between(String(v.L), g(v, 'p'), v.lop === '>' ? '<' : '≤', g(v, 'q'), String(v.hop)),
    options: (v, right) => textOptions(right, [`${String(v.L)} ${v.lop} ${sg(g(v, 'p'))}`, `${String(v.L)} ${v.hop} ${g(v, 'q')}`, `${String(v.L)} ${v.hop} ${sg(g(v, 'p'))} ან ${String(v.L)} ${v.lop} ${g(v, 'q')}`, 'ამონახსნი არ აქვს']),
    why: (_v, a) => `ორივე პირობა ერთდროულად უნდა სრულდებოდეს: ${a}.`,
  }),
  t({
    sub: 'u07-09',
    prompt: 'ამოხსენი სისტემა: {L} ≥ {pS} და {L} ≤ {q}.',
    vars: { L: Lvar, p: nonZero(-9, -1), q: I(2, 9), pS: D((v) => sg(g(v, 'p'))) },
    answer: (v) => between(String(v.L), g(v, 'p'), '≤', g(v, 'q'), '≤'),
    options: (v, right) => textOptions(right, [between(String(v.L), g(v, 'p'), '<', g(v, 'q'), '<'), `${String(v.L)} ≥ ${sg(g(v, 'p'))}`, `${String(v.L)} ≤ ${sg(g(v, 'p'))} ან ${String(v.L)} ≥ ${g(v, 'q')}`, between(String(v.L), -g(v, 'q'), '≤', -g(v, 'p'), '≤')]),
    why: (v, a) => `${v.L} ≥ ${S(v, 'p')} და ${v.L} ≤ ${v.q}, ამიტომ ${a}.`,
  }),
  t({
    sub: 'u07-09',
    prompt: 'ამოხსენი სისტემა: {L} > {p} და {L} < {qS}.',
    vars: { L: Lvar, q: I(-3, 5), qS: D((v) => sg(g(v, 'q'))), p: I(6, 12) },
    answer: () => 'ამონახსნი არ აქვს',
    options: (v, right) => textOptions(right, [between(String(v.L), g(v, 'q'), '<', g(v, 'p'), '<'), `${String(v.L)} > ${v.p}`, `${String(v.L)} < ${sg(g(v, 'q'))}`]),
    optionCount: 4,
    why: (v, a) => `${v.L} > ${v.p} და ${v.L} < ${S(v, 'q')} ერთდროულად ვერ შესრულდება: ${a}.`,
  }),
  t({
    sub: 'u07-09',
    d: 2,
    prompt: 'ამოხსენი სისტემა: {e} და {L} {hop} {q}.',
    vars: { L: Lvar, a: I(2, 5), k: I(1, 6), q: I(8, 15), lop: C(['≥', '>']), hop: C(['<', '≤']), e: D((v) => `${g(v, 'a')}${String(v.L)} ${v.lop} ${g(v, 'a') * g(v, 'k')}`) },
    answer: (v) => between(String(v.L), g(v, 'k'), v.lop === '>' ? '<' : '≤', g(v, 'q'), String(v.hop)),
    options: (v, right) => textOptions(right, [`${String(v.L)} ${v.lop} ${g(v, 'a') * g(v, 'k')}`, between(String(v.L), g(v, 'a') * g(v, 'k'), v.lop === '>' ? '<' : '≤', g(v, 'q'), String(v.hop)), `${String(v.L)} ${v.hop} ${g(v, 'q')}`, 'ამონახსნი არ აქვს']),
    why: (v, a) => `${v.a}${v.L} ${v.lop} ${g(v, 'a') * g(v, 'k')} ნიშნავს ${v.L} ${v.lop} ${v.k}; ორივე პირობა ერთად: ${a}.`,
  }),
  t({
    sub: 'u07-09',
    d: 2,
    prompt: 'ამოხსენი სისტემა: {L} {MINUS} {a} ≤ {b} და {L} + {c} > 0.',
    vars: { L: Lvar, a: I(1, 6), b: I(2, 9), c: I(1, 8), MINUS: D(() => MINUS) },
    answer: (v) => between(String(v.L), -g(v, 'c'), '<', g(v, 'a') + g(v, 'b'), '≤'),
    options: (v, right) => textOptions(right, [between(String(v.L), -g(v, 'c'), '≤', g(v, 'a') + g(v, 'b'), '<'), between(String(v.L), g(v, 'c'), '<', g(v, 'b') - g(v, 'a'), '≤'), between(String(v.L), -g(v, 'c'), '<', g(v, 'b') - g(v, 'a'), '≤'), `${String(v.L)} ≤ ${g(v, 'a') + g(v, 'b')}`]),
    why: (v, a) => `${v.L} ≤ ${g(v, 'a') + g(v, 'b')} და ${v.L} > ${MINUS}${v.c}; ${a}.`,
  }),
  t({
    sub: 'u07-09',
    d: 2,
    prompt: 'ამოხსენი სისტემა: {e1} და {e2}.',
    vars: { L: Lvar, a: I(2, 4), b: I(2, 4), lo: I(1, 4), hi: I(6, 10),
      e1: D((v) => `${g(v, 'a')}${String(v.L)} > ${g(v, 'a') * g(v, 'lo')}`), e2: D((v) => `${g(v, 'b')}${String(v.L)} ≤ ${g(v, 'b') * g(v, 'hi')}`) },
    answer: (v) => between(String(v.L), g(v, 'lo'), '<', g(v, 'hi'), '≤'),
    options: (v, right) => textOptions(right, [between(String(v.L), g(v, 'lo'), '≤', g(v, 'hi'), '<'), between(String(v.L), g(v, 'a') * g(v, 'lo'), '<', g(v, 'b') * g(v, 'hi'), '≤'), between(String(v.L), g(v, 'lo'), '<', g(v, 'hi'), '<'), `${String(v.L)} ≤ ${g(v, 'hi')}`]),
    why: (v, a) => `${v.L} > ${v.lo} და ${v.L} ≤ ${v.hi}; ${a}.`,
  }),

  // ═════════ U07.10 — ორმაგი უტოლობები ═════════
  t({
    sub: 'u07-10',
    prompt: 'ამოხსენი ორმაგი უტოლობა: {lo} < {L} < {hi}. ჩაწერე ინტერვალის სახით.',
    vars: { L: Lvar, p: I(-5, 6), w: I(2, 9), lo: D((v) => sg(g(v, 'p'))), hi: D((v) => sg(g(v, 'p') + g(v, 'w'))) },
    answer: (v) => `${String(v.L)} ∈ (${S(v, 'p')}; ${sg(g(v, 'p') + g(v, 'w'))})`,
    options: (v, right) => textOptions(right, [`${String(v.L)} ∈ [${S(v, 'p')}; ${sg(g(v, 'p') + g(v, 'w'))}]`, `${String(v.L)} ∈ (${S(v, 'p')}; ${sg(g(v, 'p') + g(v, 'w'))}]`, `${String(v.L)} ∈ [${S(v, 'p')}; ${sg(g(v, 'p') + g(v, 'w'))})`]),
    why: (_v, a) => `მკაცრი უტოლობისას ბოლოები არ შედის, ამიტომ ფრჩხილები მრგვალია: ${a}.`,
  }),
  t({
    sub: 'u07-10',
    prompt: 'ამოხსენი ორმაგი უტოლობა: {lo} ≤ {L} ≤ {hi}. ჩაწერე ინტერვალის სახით.',
    vars: { L: Lvar, p: I(-9, 2), w: I(3, 10), lo: D((v) => sg(g(v, 'p'))), hi: D((v) => sg(g(v, 'p') + g(v, 'w'))) },
    answer: (v) => `${String(v.L)} ∈ [${S(v, 'p')}; ${sg(g(v, 'p') + g(v, 'w'))}]`,
    options: (v, right) => textOptions(right, [`${String(v.L)} ∈ (${S(v, 'p')}; ${sg(g(v, 'p') + g(v, 'w'))})`, `${String(v.L)} ∈ (${S(v, 'p')}; ${sg(g(v, 'p') + g(v, 'w'))}]`, `${String(v.L)} ∈ [${S(v, 'p')}; ${sg(g(v, 'p') + g(v, 'w'))})`]),
    why: (_v, a) => `არამკაცრი უტოლობისას ბოლოები შედის, ამიტომ ფრჩხილები კვადრატულია: ${a}.`,
  }),
  ...[
    { lop: '<', hop: '<', neg: false },
    { lop: '≤', hop: '≤', neg: true },
    { lop: '<', hop: '≤', neg: false },
    { lop: '<', hop: '<', neg: true },
  ].map(({ lop, hop, neg }, idx) =>
    t({
      sub: 'u07-10',
      d: 2,
      prompt: 'ამოხსენი ორმაგი უტოლობა: {e}.',
      vars: { L: Lvar, a: idx === 0 ? C([2, 3, 4]) : C([2, 3]), b: neg ? nonZero(-5, 5) : I(1, 6), lo: I(-5, 3), hi: I(4, 10),
        e: D((v) => `${sg(g(v, 'a') * g(v, 'lo') + g(v, 'b'))} ${lop} ${lineq(g(v, 'a'), g(v, 'b'), String(v.L))} ${hop} ${sg(g(v, 'a') * g(v, 'hi') + g(v, 'b'))}`) },
      answer: (v) => between(String(v.L), g(v, 'lo'), lop, g(v, 'hi'), hop),
      options: (v, right) => textOptions(right, [between(String(v.L), g(v, 'a') * g(v, 'lo'), lop, g(v, 'a') * g(v, 'hi'), hop), between(String(v.L), g(v, 'lo') + g(v, 'b'), lop, g(v, 'hi') + g(v, 'b'), hop), between(String(v.L), g(v, 'lo'), STRICTNESS[lop]!, g(v, 'hi'), STRICTNESS[hop]!), between(String(v.L), g(v, 'lo') + 1, lop, g(v, 'hi') + 1, hop)]),
      why: (v, a) => `სამივე ნაწილს ${g(v, 'b') < 0 ? 'ვუმატებთ' : 'ვაკლებთ'} ${Math.abs(g(v, 'b'))}-ს, შემდეგ ვყოფთ ${v.a}-ზე: ${a}.`,
    })),
];
