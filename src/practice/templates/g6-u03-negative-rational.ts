import type { QuestionTemplate } from './types';
import {
  C, D, I, MINUS, N, dec, fAdd, fDiv, fMul, fSub, fText, fr, gcd, par, q6, sg,
} from './g6-helpers';
import type { Frac } from './g6-helpers';

/**
 * Grade VI — Unit 3: უარყოფითი და რაციონალური რიცხვები.
 *
 * Converted from the academy's `U03` bank: 4 subtopics × 6 questions.
 *
 * Whole-number templates draw the operands so the signs vary and the result
 * crosses zero as often as it doesn't. Fraction templates draw numerators and
 * denominators that are in lowest terms, so the printed operands are never a
 * hidden `4/8`, and wrong options are the slips of the topic — adding the
 * denominators, a lost sign, the reciprocal — never an unreduced copy of the
 * key (which would be a second correct answer).
 */

export const G6_U03_SUBTOPICS = ['u03-01', 'u03-02', 'u03-03', 'u03-04'] as const;

const T = 'g6-negative-rational';
let seq = 0;
const nextId = (): string => `g6-u03-q${String(++seq).padStart(2, '0')}`;
type Spec = Omit<Parameters<typeof q6>[0], 'id' | 'topic'>;
const t = (spec: Spec): QuestionTemplate => q6({ id: nextId(), topic: T, ...spec });

/** `−24 + 16 − 9`: the first term signed, the rest joined by its sign. */
const chain = (terms: number[]): string =>
  terms.map((x, i) => (i === 0 ? sg(x) : `${x < 0 ? MINUS : '+'} ${sg(Math.abs(x))}`)).join(' ');

/** Slips of an integer result: the sign lost, an off-by-one in the carry, the magnitudes added. */
const intSlips = (answer: number, extra: number[] = []): number[] => [
  ...extra, -answer, answer + 2, answer - 2, answer + 10, answer - 10, answer * 10,
];

const ff = (n: number, d: number): Frac => fr(n, d);
const show = (f: Frac): string => fText(f);
/** A fraction operand as printed inside an expression after a sign. */
const bare = (n: number, d: number): string => `${n}/${d}`;
const signedBare = (n: number, d: number, negative: boolean, wrap = false): string =>
  negative ? (wrap ? `(${MINUS}${n}/${d})` : `${MINUS}${n}/${d}`) : `${n}/${d}`;

/** Slips of a fraction result. */
const fracSlips = (answer: Frac, extra: Frac[] = []): string[] => {
  const out = [...extra.map(show), show(fr(-answer.n, answer.d)), show(fr(answer.n + 1, answer.d)), show(fr(answer.n - 1, answer.d)), show(fr(answer.n, answer.d + 1))];
  if (answer.n !== 0) out.push(show(fr(answer.d, answer.n)));
  return out;
};

/** A decimal operand: a negative one is bracketed. */
const dp = (x: number): string => (x < 0 ? `(${dec(x, 2)})` : dec(x, 2));

const lowestTerms = (n: number, d: number): boolean => gcd(n, d) === 1;
const properPair = (n: number, d: number): boolean => n < d && lowestTerms(n, d);

export const G6_U03_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U03.1 — უარყოფითი რიცხვების შეკრება და გამოკლება ═════════
  t({
    sub: 'u03-01',
    prompt: 'გამოთვალე: {e}.',
    vars: { a: I(2, 40), b: I(2, 40), e: D((v) => `${sg(-N(v, 'a'))} + ${sg(N(v, 'b'))}`) },
    constraints: [{ test: (v) => N(v, 'a') !== N(v, 'b'), note: 'not zero' }],
    answer: (v) => sg(N(v, 'b') - N(v, 'a')),
    wrong: (v) => intSlips(N(v, 'b') - N(v, 'a'), [N(v, 'a') + N(v, 'b'), -(N(v, 'a') + N(v, 'b'))]),
    why: (v, a) => `${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u03-01',
    prompt: 'გამოთვალე: {e}.',
    vars: { a: I(2, 40), b: I(2, 40), e: D((v) => `${sg(-N(v, 'a'))} + ${par(-N(v, 'b'))}`) },
    answer: (v) => sg(-N(v, 'a') - N(v, 'b')),
    wrong: (v) => [N(v, 'a') + N(v, 'b'), N(v, 'a') - N(v, 'b'), N(v, 'b') - N(v, 'a'), -(N(v, 'a') + N(v, 'b')) + 2, -(N(v, 'a') + N(v, 'b')) - 10],
    why: (v, a) => `${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u03-01',
    prompt: 'გამოთვალე: {e}.',
    vars: { a: I(-30, 40, { nonZero: true }), b: I(2, 40), e: D((v) => `${sg(N(v, 'a'))} ${MINUS} ${par(-N(v, 'b'))}`) },
    answer: (v) => sg(N(v, 'a') + N(v, 'b')),
    wrong: (v) => [N(v, 'a') - N(v, 'b'), -(N(v, 'a') + N(v, 'b')), N(v, 'b') - N(v, 'a'), N(v, 'a') + N(v, 'b') + 2, N(v, 'a') + N(v, 'b') - 10],
    why: (v, a) => `გამოკლება უარყოფით რიცხვს ნიშნავს მიმატებას დადებითისა: ${String(v.e)} = ${sg(N(v, 'a'))} + ${N(v, 'b')} = ${a}.`,
  }),
  t({
    sub: 'u03-01',
    prompt: 'გამოთვალე: {e}.',
    vars: { a: I(2, 40), b: I(2, 40), e: D((v) => `${sg(-N(v, 'a'))} ${MINUS} ${N(v, 'b')}`) },
    answer: (v) => sg(-N(v, 'a') - N(v, 'b')),
    wrong: (v) => [N(v, 'a') + N(v, 'b'), N(v, 'b') - N(v, 'a'), N(v, 'a') - N(v, 'b'), -(N(v, 'a') + N(v, 'b')) + 2, -(N(v, 'a') + N(v, 'b')) - 10],
    why: (v, a) => `${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u03-01',
    d: 2,
    prompt: 'გამოთვალე: {e}.',
    vars: {
      a: I(5, 40), b: I(5, 40), c: I(5, 40), sa: C([-1, 1]), sb: C([-1, 1]), sc: C([-1, 1]),
      e: D((v) => chain([N(v, 'sa') * N(v, 'a'), N(v, 'sb') * N(v, 'b'), N(v, 'sc') * N(v, 'c')])),
    },
    constraints: [{ test: (v) => N(v, 'sa') < 0 || N(v, 'sb') < 0 || N(v, 'sc') < 0, note: 'at least one negative term' }],
    answer: (v) => sg(N(v, 'sa') * N(v, 'a') + N(v, 'sb') * N(v, 'b') + N(v, 'sc') * N(v, 'c')),
    wrong: (v) => {
      const r = N(v, 'sa') * N(v, 'a') + N(v, 'sb') * N(v, 'b') + N(v, 'sc') * N(v, 'c');
      return [-r, r + 2 * N(v, 'b'), r - 2 * N(v, 'c'), r + 10, r - 10, N(v, 'a') + N(v, 'b') + N(v, 'c')];
    },
    why: (v, a) => `${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u03-01',
    d: 2,
    prompt: 'დილით ტემპერატურა იყო {start} °C. დღის განმავლობაში ის {up} გრადუსით გაიზარდა, შემდეგ კი {down} გრადუსით შემცირდა. რა ტემპერატურა გახდა ბოლოს?',
    vars: { s: I(2, 15), up: I(5, 25), down: I(3, 25), start: D((v) => sg(-N(v, 's'))) },
    constraints: [{ test: (v) => -N(v, 's') + N(v, 'up') - N(v, 'down') !== 0, note: 'not zero' }],
    answer: (v) => `${sg(-N(v, 's') + N(v, 'up') - N(v, 'down'))} °C`,
    wrong: (v) => {
      const r = -N(v, 's') + N(v, 'up') - N(v, 'down');
      return [-r, -N(v, 's') + N(v, 'up') + N(v, 'down'), N(v, 's') + N(v, 'up') - N(v, 'down'), r + 2, r - 2, r + 10].map((x) => `${sg(x)} °C`);
    },
    why: (v, a) => `${sg(-N(v, 's'))} + ${N(v, 'up')} ${MINUS} ${N(v, 'down')} = ${a}.`,
  }),
  t({
    sub: 'u03-01',
    d: 2,
    prompt: 'გამოთვალე: {e}.',
    vars: {
      a: I(5, 40), b: I(5, 40), c: I(5, 40),
      e: D((v) => `${sg(-N(v, 'a'))} + ${N(v, 'b')} ${MINUS} ${par(-N(v, 'c'))}`),
    },
    answer: (v) => sg(-N(v, 'a') + N(v, 'b') + N(v, 'c')),
    wrong: (v) => {
      const r = -N(v, 'a') + N(v, 'b') + N(v, 'c');
      return [-N(v, 'a') + N(v, 'b') - N(v, 'c'), -r, r + 2 * N(v, 'c'), r + 10, r - 10, -N(v, 'a') - N(v, 'b') + N(v, 'c')];
    },
    why: (v, a) => `${String(v.e)} = ${sg(-N(v, 'a'))} + ${N(v, 'b')} + ${N(v, 'c')} = ${a}.`,
  }),

  // ═════════ U03.2 — უარყოფითი რიცხვების გამრავლება და გაყოფა ═════════
  t({
    sub: 'u03-02',
    prompt: 'გამოთვალე: {e}.',
    vars: { a: I(2, 15), b: I(2, 15), e: D((v) => `${par(-N(v, 'a'))} × ${N(v, 'b')}`) },
    answer: (v) => sg(-N(v, 'a') * N(v, 'b')),
    wrong: (v) => [N(v, 'a') * N(v, 'b'), -N(v, 'a') * N(v, 'b') + N(v, 'a'), -N(v, 'a') * N(v, 'b') - N(v, 'b'), -N(v, 'a') - N(v, 'b'), -N(v, 'a') * N(v, 'b') + 10],
    why: (v, a) => `უარყოფითი რიცხვი დადებითზე გავამრავლოთ, შედეგი უარყოფითია: ${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u03-02',
    prompt: 'გამოთვალე: {e}.',
    vars: { a: I(2, 15), b: I(2, 15), e: D((v) => `${par(-N(v, 'a'))} × ${par(-N(v, 'b'))}`) },
    answer: (v) => sg(N(v, 'a') * N(v, 'b')),
    wrong: (v) => [-N(v, 'a') * N(v, 'b'), N(v, 'a') * N(v, 'b') + N(v, 'a'), N(v, 'a') * N(v, 'b') - N(v, 'b'), N(v, 'a') + N(v, 'b'), N(v, 'a') * N(v, 'b') + 10],
    why: (v, a) => `ორი უარყოფითი რიცხვის ნამრავლი დადებითია: ${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u03-02',
    prompt: 'გამოთვალე: {e}.',
    vars: { b: I(2, 15), k: I(2, 15), a: D((v) => N(v, 'b') * N(v, 'k')), e: D((v) => `${N(v, 'a')} ÷ ${par(-N(v, 'b'))}`) },
    answer: (v) => sg(-N(v, 'k')),
    wrong: (v) => [N(v, 'k'), -N(v, 'k') + 1, -N(v, 'k') - 1, -N(v, 'b'), -N(v, 'k') * 10],
    why: (v, a) => `დადებითი რიცხვი უარყოფითზე გავყოთ, შედეგი უარყოფითია: ${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u03-02',
    prompt: 'გამოთვალე: {e}.',
    vars: { b: I(2, 15), k: I(2, 15), a: D((v) => N(v, 'b') * N(v, 'k')), e: D((v) => `${par(-N(v, 'a'))} ÷ ${par(-N(v, 'b'))}`) },
    answer: (v) => sg(N(v, 'k')),
    wrong: (v) => [-N(v, 'k'), N(v, 'k') + 1, N(v, 'k') - 1, N(v, 'b'), N(v, 'k') * 10],
    why: (v, a) => `ორი უარყოფითი რიცხვის განაყოფი დადებითია: ${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u03-02',
    d: 2,
    prompt: 'გამოთვალე: {e}.',
    vars: {
      a: I(2, 9), b: I(2, 9), c: I(2, 9), k: I(1, 3), sa: C([-1, 1]), sb: C([-1, 1]), sc: C([-1, 1]),
      e: D((v) => `${par(N(v, 'sa') * N(v, 'a'))} × ${par(N(v, 'sb') * N(v, 'b'))} × ${par(N(v, 'sc') * N(v, 'c'))}`),
    },
    constraints: [{ test: (v) => N(v, 'sa') + N(v, 'sb') + N(v, 'sc') < 3, note: 'at least one negative factor' }],
    answer: (v) => sg(N(v, 'sa') * N(v, 'sb') * N(v, 'sc') * N(v, 'a') * N(v, 'b') * N(v, 'c')),
    wrong: (v) => {
      const r = N(v, 'sa') * N(v, 'sb') * N(v, 'sc') * N(v, 'a') * N(v, 'b') * N(v, 'c');
      return [-r, r + N(v, 'a'), r - N(v, 'b'), r + 10, r - 10];
    },
    why: (v, a) => `ნამრავლის ნიშანი უარყოფითი მამრავლების რაოდენობაზეა დამოკიდებული: ${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u03-02',
    d: 2,
    prompt: 'გამოთვალე: {e}.',
    vars: {
      b: I(2, 9), c: I(2, 9), k: I(2, 12), a: D((v) => N(v, 'b') * N(v, 'k')),
      e: D((v) => `${par(-N(v, 'a'))} ÷ ${N(v, 'b')} × ${par(-N(v, 'c'))}`),
    },
    answer: (v) => sg(N(v, 'k') * N(v, 'c')),
    wrong: (v) => [-N(v, 'k') * N(v, 'c'), N(v, 'k') * N(v, 'c') + N(v, 'c'), N(v, 'k') * N(v, 'c') - N(v, 'k'), N(v, 'a') / (N(v, 'b') * N(v, 'c')), N(v, 'k') + N(v, 'c')],
    why: (v, a) => `მოქმედებებს მარცხნიდან მარჯვნივ ვასრულებთ: ${sg(-N(v, 'a'))} ÷ ${N(v, 'b')} = ${sg(-N(v, 'k'))}, ${sg(-N(v, 'k'))} × ${par(-N(v, 'c'))} = ${a}.`,
  }),

  // ═════════ U03.3 — რაციონალური რიცხვების შეკრება და გამოკლება ═════════
  t({
    sub: 'u03-03',
    prompt: 'გამოთვალე: {e}.',
    vars: {
      d: I(5, 15), n1: I(1, 9), n2: I(1, 9),
      e: D((v) => `${bare(N(v, 'n1'), N(v, 'd'))} + ${bare(N(v, 'n2'), N(v, 'd'))}`),
    },
    constraints: [{ test: (v) => N(v, 'n1') + N(v, 'n2') < N(v, 'd') && lowestTerms(N(v, 'n1'), N(v, 'd')) && lowestTerms(N(v, 'n2'), N(v, 'd')), note: 'proper operands and sum' }],
    answer: (v) => show(ff(N(v, 'n1') + N(v, 'n2'), N(v, 'd'))),
    wrong: (v) => [`${N(v, 'n1') + N(v, 'n2')}/${2 * N(v, 'd')}`, `${N(v, 'n1') * N(v, 'n2')}/${N(v, 'd')}`, `${N(v, 'n1') + N(v, 'n2') + 1}/${N(v, 'd')}`, `${N(v, 'n1') + N(v, 'n2')}/${N(v, 'd') + 1}`, `${N(v, 'n1') + N(v, 'n2') - 1}/${N(v, 'd')}`],
    why: (v, a) => `მნიშვნელი იგივე რჩება, მრიცხველებს ვკრებთ: ${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u03-03',
    prompt: 'გამოთვალე: {e}.',
    vars: {
      k: C([2, 3, 4, 5]), d2: I(2, 6), n1: I(1, 11), n2: I(1, 5),
      d1: D((v) => N(v, 'k') * N(v, 'd2')),
      e: D((v) => `${bare(N(v, 'n2'), N(v, 'd2'))} ${MINUS} ${bare(N(v, 'n1'), N(v, 'k') * N(v, 'd2'))}`),
    },
    constraints: [{
      test: (v) => properPair(N(v, 'n1'), N(v, 'd1')) && properPair(N(v, 'n2'), N(v, 'd2')) && N(v, 'n2') * N(v, 'k') !== N(v, 'n1'),
      note: 'lowest-terms operands, non-zero result',
    }],
    answer: (v) => show(fSub(ff(N(v, 'n2'), N(v, 'd2')), ff(N(v, 'n1'), N(v, 'd1')))),
    wrong: (v) => {
      const r = fSub(ff(N(v, 'n2'), N(v, 'd2')), ff(N(v, 'n1'), N(v, 'd1')));
      return fracSlips(r, [ff(N(v, 'n2') - N(v, 'n1'), N(v, 'd1') - N(v, 'd2') || 1), fAdd(ff(N(v, 'n2'), N(v, 'd2')), ff(N(v, 'n1'), N(v, 'd1')))]);
    },
    why: (v, a) => `ერთ მნიშვნელზე ვიყვანთ: ${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u03-03',
    prompt: 'გამოთვალე: {e}.',
    vars: {
      d1: I(3, 9), d2: I(3, 12), n1: I(1, 8), n2: I(1, 11), neg: C([1, 2]),
      e: D((v) => `${signedBare(N(v, 'n1'), N(v, 'd1'), N(v, 'neg') === 1)} + ${signedBare(N(v, 'n2'), N(v, 'd2'), N(v, 'neg') === 2, true)}`),
    },
    constraints: [{
      test: (v) => properPair(N(v, 'n1'), N(v, 'd1')) && properPair(N(v, 'n2'), N(v, 'd2')) && N(v, 'd1') !== N(v, 'd2')
        && fAdd(ff(N(v, 'neg') === 1 ? -N(v, 'n1') : N(v, 'n1'), N(v, 'd1')), ff(N(v, 'neg') === 2 ? -N(v, 'n2') : N(v, 'n2'), N(v, 'd2'))).n !== 0,
      note: 'unlike denominators, non-zero result',
    }],
    answer: (v) => show(fAdd(ff(N(v, 'neg') === 1 ? -N(v, 'n1') : N(v, 'n1'), N(v, 'd1')), ff(N(v, 'neg') === 2 ? -N(v, 'n2') : N(v, 'n2'), N(v, 'd2')))),
    wrong: (v) => {
      const a = ff(N(v, 'neg') === 1 ? -N(v, 'n1') : N(v, 'n1'), N(v, 'd1'));
      const b = ff(N(v, 'neg') === 2 ? -N(v, 'n2') : N(v, 'n2'), N(v, 'd2'));
      const r = fAdd(a, b);
      return fracSlips(r, [fr(a.n + b.n, a.d + b.d), fAdd(fr(-a.n, a.d), fr(-b.n, b.d)), fSub(fr(Math.abs(a.n), a.d), fr(Math.abs(b.n), b.d))]);
    },
    why: (v, a) => `${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u03-03',
    prompt: 'გამოთვალე: {e}.',
    vars: {
      k: C([2, 3, 4, 5]), d2: I(2, 6), n1: I(1, 11), n2: I(1, 5),
      d1: D((v) => N(v, 'k') * N(v, 'd2')),
      e: D((v) => `${bare(N(v, 'n1'), N(v, 'k') * N(v, 'd2'))} ${MINUS} ${bare(N(v, 'n2'), N(v, 'd2'))}`),
    },
    constraints: [{
      test: (v) => properPair(N(v, 'n1'), N(v, 'd1')) && properPair(N(v, 'n2'), N(v, 'd2')) && N(v, 'n2') * N(v, 'k') !== N(v, 'n1'),
      note: 'lowest-terms operands, non-zero result',
    }],
    answer: (v) => show(fSub(ff(N(v, 'n1'), N(v, 'd1')), ff(N(v, 'n2'), N(v, 'd2')))),
    wrong: (v) => {
      const r = fSub(ff(N(v, 'n1'), N(v, 'd1')), ff(N(v, 'n2'), N(v, 'd2')));
      return fracSlips(r, [fSub(ff(N(v, 'n2'), N(v, 'd2')), ff(N(v, 'n1'), N(v, 'd1'))), fAdd(ff(N(v, 'n2'), N(v, 'd2')), ff(N(v, 'n1'), N(v, 'd1')))]);
    },
    why: (v, a) => `${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u03-03',
    prompt: 'გამოთვალე: {e}.',
    vars: {
      d1: I(3, 10), d2: I(2, 8), n1: I(1, 9), n2: I(1, 7),
      e: D((v) => `${MINUS}${bare(N(v, 'n1'), N(v, 'd1'))} ${MINUS} ${bare(N(v, 'n2'), N(v, 'd2'))}`),
    },
    constraints: [{ test: (v) => properPair(N(v, 'n1'), N(v, 'd1')) && properPair(N(v, 'n2'), N(v, 'd2')), note: 'lowest-terms operands' }],
    answer: (v) => show(fSub(fr(-N(v, 'n1'), N(v, 'd1')), ff(N(v, 'n2'), N(v, 'd2')))),
    wrong: (v) => {
      const r = fSub(fr(-N(v, 'n1'), N(v, 'd1')), ff(N(v, 'n2'), N(v, 'd2')));
      return fracSlips(r, [fAdd(fr(-N(v, 'n1'), N(v, 'd1')), ff(N(v, 'n2'), N(v, 'd2'))), fSub(ff(N(v, 'n1'), N(v, 'd1')), ff(N(v, 'n2'), N(v, 'd2')))]);
    },
    why: (v, a) => `ორივე შესაკრები უარყოფითია, ამიტომ ჯამიც უარყოფითია: ${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u03-03',
    d: 2,
    prompt: 'გამოთვალე: {e}.',
    vars: {
      a: I(100, 599), b: I(100, 999), c: I(100, 599), sb: C([-1, 1]),
      e: D((v) => `${dec(N(v, 'a') / 100, 2)} ${N(v, 'sb') > 0 ? '+' : MINUS} ${dec(N(v, 'b') / 100, 2)} + ${dec(N(v, 'c') / 100, 2)}`),
    },
    constraints: [{ test: (v) => (N(v, 'a') + N(v, 'sb') * N(v, 'b') + N(v, 'c')) !== 0 && N(v, 'a') % 10 !== 0 && N(v, 'c') % 10 !== 0, note: 'real hundredths, non-zero' }],
    answer: (v) => dec((N(v, 'a') + N(v, 'sb') * N(v, 'b') + N(v, 'c')) / 100, 2),
    wrong: (v) => {
      const r = N(v, 'a') + N(v, 'sb') * N(v, 'b') + N(v, 'c');
      return [r + 10, r - 10, -r, r + 100, r - 100, N(v, 'a') + N(v, 'b') + N(v, 'c')].map((x) => dec(x / 100, 2));
    },
    why: (v, a) => `${String(v.e)} = ${a}.`,
  }),

  // ═════════ U03.4 — რაციონალური რიცხვების გამრავლება და გაყოფა ═════════
  t({
    sub: 'u03-04',
    prompt: 'გამოთვალე: {e}.',
    vars: {
      n1: I(1, 9), d1: I(2, 9), n2: I(1, 9), d2: I(2, 9),
      e: D((v) => `${bare(N(v, 'n1'), N(v, 'd1'))} × ${bare(N(v, 'n2'), N(v, 'd2'))}`),
    },
    constraints: [{ test: (v) => properPair(N(v, 'n1'), N(v, 'd1')) && properPair(N(v, 'n2'), N(v, 'd2')), note: 'lowest-terms operands' }],
    answer: (v) => show(fMul(ff(N(v, 'n1'), N(v, 'd1')), ff(N(v, 'n2'), N(v, 'd2')))),
    wrong: (v) => {
      const a = ff(N(v, 'n1'), N(v, 'd1')), b = ff(N(v, 'n2'), N(v, 'd2'));
      return fracSlips(fMul(a, b), [fAdd(a, b), fDiv(a, b), fr(a.n + b.n, a.d + b.d)]);
    },
    why: (v, a) => `მრიცხველს მრიცხველზე ვამრავლებთ, მნიშვნელს — მნიშვნელზე, შემდეგ ვამოკლებთ: ${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u03-04',
    prompt: 'გამოთვალე: {e}.',
    vars: {
      n1: I(1, 9), d1: I(2, 9), n2: I(1, 15), d2: I(2, 9), neg: C([1, 2]),
      e: D((v) => `${signedBare(N(v, 'n1'), N(v, 'd1'), N(v, 'neg') === 1)} × ${signedBare(N(v, 'n2'), N(v, 'd2'), N(v, 'neg') === 2, true)}`),
    },
    constraints: [{ test: (v) => properPair(N(v, 'n1'), N(v, 'd1')) && lowestTerms(N(v, 'n2'), N(v, 'd2')), note: 'lowest-terms operands' }],
    answer: (v) => show(fMul(fr(N(v, 'neg') === 1 ? -N(v, 'n1') : N(v, 'n1'), N(v, 'd1')), fr(N(v, 'neg') === 2 ? -N(v, 'n2') : N(v, 'n2'), N(v, 'd2')))),
    wrong: (v) => {
      const a = fr(N(v, 'neg') === 1 ? -N(v, 'n1') : N(v, 'n1'), N(v, 'd1'));
      const b = fr(N(v, 'neg') === 2 ? -N(v, 'n2') : N(v, 'n2'), N(v, 'd2'));
      return fracSlips(fMul(a, b), [fAdd(a, b), fDiv(a, b), fSub(a, b)]);
    },
    why: (v, a) => `ერთი მამრავლი უარყოფითია, ამიტომ ნამრავლი უარყოფითია: ${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u03-04',
    prompt: 'გამოთვალე: {e}.',
    vars: {
      n1: I(1, 9), d1: I(2, 9), n2: I(1, 9), d2: I(2, 9),
      e: D((v) => `${bare(N(v, 'n1'), N(v, 'd1'))} ÷ ${bare(N(v, 'n2'), N(v, 'd2'))}`),
    },
    constraints: [{ test: (v) => lowestTerms(N(v, 'n1'), N(v, 'd1')) && lowestTerms(N(v, 'n2'), N(v, 'd2')), note: 'lowest-terms operands' }],
    answer: (v) => show(fDiv(ff(N(v, 'n1'), N(v, 'd1')), ff(N(v, 'n2'), N(v, 'd2')))),
    wrong: (v) => {
      const a = ff(N(v, 'n1'), N(v, 'd1')), b = ff(N(v, 'n2'), N(v, 'd2'));
      return fracSlips(fDiv(a, b), [fMul(a, b), fDiv(b, a), fr(a.n * b.n, a.d * b.d + 1)]);
    },
    why: (v, a) => `გაყოფა ნიშნავს შებრუნებულ წილადზე გამრავლებას: ${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u03-04',
    d: 2,
    prompt: 'გამოთვალე: {e}.',
    vars: {
      n1: I(1, 9), d1: I(2, 10), n2: I(1, 9), d2: I(2, 10), neg: C([1, 2]),
      e: D((v) => `${signedBare(N(v, 'n1'), N(v, 'd1'), N(v, 'neg') === 1)} ÷ ${signedBare(N(v, 'n2'), N(v, 'd2'), N(v, 'neg') === 2, true)}`),
    },
    constraints: [{ test: (v) => lowestTerms(N(v, 'n1'), N(v, 'd1')) && lowestTerms(N(v, 'n2'), N(v, 'd2')), note: 'lowest-terms operands' }],
    answer: (v) => show(fDiv(fr(N(v, 'neg') === 1 ? -N(v, 'n1') : N(v, 'n1'), N(v, 'd1')), fr(N(v, 'neg') === 2 ? -N(v, 'n2') : N(v, 'n2'), N(v, 'd2')))),
    wrong: (v) => {
      const a = fr(N(v, 'neg') === 1 ? -N(v, 'n1') : N(v, 'n1'), N(v, 'd1'));
      const b = fr(N(v, 'neg') === 2 ? -N(v, 'n2') : N(v, 'n2'), N(v, 'd2'));
      return fracSlips(fDiv(a, b), [fMul(a, b), fDiv(b, a), fr(-fDiv(a, b).n, fDiv(a, b).d)]);
    },
    why: (v, a) => `${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u03-04',
    prompt: 'გამოთვალე: {e}.',
    vars: {
      a: I(11, 99), b: I(2, 9), sa: C([-1, 1]),
      e: D((v) => `${dp((N(v, 'sa') * N(v, 'a')) / 10)} × ${dp(-N(v, 'b') / 10)}`),
    },
    answer: (v) => dec((-N(v, 'sa') * N(v, 'a') * N(v, 'b')) / 100, 2),
    wrong: (v) => {
      const r = (-N(v, 'sa') * N(v, 'a') * N(v, 'b')) / 100;
      return [-r, r * 10, r / 10, r + 0.1, r - 0.1, r + 1].map((x) => dec(x, 2));
    },
    why: (v, a) => `${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u03-04',
    prompt: 'გამოთვალე: {e}.',
    vars: {
      b: I(2, 9), k: I(2, 30), sa: C([-1, 1]), sb: C([-1, 1]),
      e: D((v) => `${dp((N(v, 'sa') * N(v, 'b') * N(v, 'k')) / 10)} ÷ ${dp((N(v, 'sb') * N(v, 'b')) / 10)}`),
    },
    answer: (v) => sg(N(v, 'sa') * N(v, 'sb') * N(v, 'k')),
    wrong: (v) => {
      const r = N(v, 'sa') * N(v, 'sb') * N(v, 'k');
      return [-r, r * 10, r + 1, r - 1, r + 10];
    },
    why: (v, a) => `${String(v.e)} = ${a}.`,
  }),
];
