import type { QuestionTemplate, Vars } from './types';
import { C, D, I, MINUS, N, fCmp, fSub, fr, mText, q6, sg } from './g6-helpers';
import { nd, properPool } from './g6-frac';
import { powerText, superscript } from './g5-helpers';

/**
 * Grade VII — Unit 5: powers and roots.
 *
 * Converted from the academy's Grade VII `U05` bank: 7 subtopics × 6 questions.
 *
 * Powers are printed with true superscripts (`2⁷`, `(−3)²`), roots with `√`.
 * Symbolic answers (`a⁷`, `6x`, `3√2`) are strings built by the same printer as
 * the options, so the key and the slips share one notation. A root is
 * simplified with the largest square factor.
 */

export const G7_U05_SUBTOPICS = ['u05-01', 'u05-02', 'u05-03', 'u05-04', 'u05-05', 'u05-06', 'u05-07'] as const;

const T = 'g7-powers-roots';
let seq = 0;
const nextId = (): string => `g7-u05-q${String(++seq).padStart(2, '0')}`;
type Spec = Omit<Parameters<typeof q6>[0], 'id' | 'topic' | 'grade'>;
const t = (spec: Spec): QuestionTemplate => q6({ id: nextId(), topic: T, grade: 7, ...spec });

const pw = (base: number | string, exp: number): string => powerText(base, exp);
const LETTERS = ['a', 'b', 'x', 'y', 'm', 't', 'k', 'c'];
/** `√n` simplified: `5√2`, `6`, `√7`. */
const simp = (n: number): { out: number; rest: number } => {
  let out = 1;
  let rest = n;
  for (let f = 2; f * f <= rest; f += 1) while (rest % (f * f) === 0) { rest /= f * f; out *= f; }
  return { out, rest };
};
const root = (out: number, rest: number, letter = ''): string => (rest === 1 ? `${out === 1 && letter ? '' : out}${letter}` : `${out === 1 && !letter ? '' : out}${letter}√${rest}`);
const rootOf = (n: number): string => { const s = simp(n); return root(s.out, s.rest); };
const sqrtOf = (n: number): number => Math.round(Math.sqrt(n));
const SQ_ROOT_FRAC = properPool(2, 9).filter((f) => Number(f.split('/')[0]) > 0);
const SIMPLE_R = [2, 3, 5, 6, 7, 10, 11];

export const G7_U05_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U05.1 — რაციონალური რიცხვების ნატურალური ხარისხები ═════════
  t({
    sub: 'u05-01',
    prompt: 'გამოთვალე: {p}.',
    vars: { a: I(2, 9), e: C([2, 3, 4]), p: D((v) => pw(`(${MINUS}${N(v, 'a')})`, N(v, 'e'))) },
    constraints: [{ test: (v: Vars) => N(v, 'a') ** N(v, 'e') <= 2000, note: 'a modest result' }],
    answer: (v) => sg((-N(v, 'a')) ** N(v, 'e')),
    wrong: (v) => [-((-N(v, 'a')) ** N(v, 'e')), N(v, 'a') * N(v, 'e'), -N(v, 'a') * N(v, 'e'), N(v, 'a') ** (N(v, 'e') - 1)],
    why: (v, a) => `${v.p} = ${Array.from({ length: N(v, 'e') }, () => `(${MINUS}${v.a})`).join(' · ')} = ${a}; ${N(v, 'e') % 2 === 0 ? 'ლუწი ხარისხი დადებითს იძლევა' : 'კენტი ხარისხი უარყოფითს იძლევა'}.`,
  }),
  t({
    sub: 'u05-01',
    prompt: 'გამოთვალე: {p}.',
    vars: { a: I(2, 9), e: C([3, 5, 7]), p: D((v) => pw(`(${MINUS}${N(v, 'a')})`, N(v, 'e'))) },
    constraints: [{ test: (v: Vars) => N(v, 'a') ** N(v, 'e') <= 2500, note: 'a modest result' }],
    answer: (v) => sg((-N(v, 'a')) ** N(v, 'e')),
    wrong: (v) => [N(v, 'a') ** N(v, 'e'), -N(v, 'a') * N(v, 'e'), N(v, 'a') * N(v, 'e'), -(N(v, 'a') ** (N(v, 'e') - 1))],
    why: (v, a) => `კენტი ხარისხი უარყოფით რიცხვს უარყოფითად ტოვებს: ${v.p} = ${a}.`,
  }),
  t({
    sub: 'u05-01',
    prompt: 'გამოთვალე: ({f}){ex}.',
    vars: { f: C(properPool(2, 6)), e: C([2, 3]), ex: D((v) => superscript(N(v, 'e'))) },
    answer: (v) => mText(fr(nd(v, 'f')[0] ** N(v, 'e'), nd(v, 'f')[1] ** N(v, 'e'))),
    wrong: (v) => {
      const [p, q] = nd(v, 'f');
      const e = N(v, 'e');
      return [`${p ** e}/${q}`, `${p}/${q ** e}`, `${p * e}/${q * e}`, `${p * e}/${q}`].filter((x) => x !== mText(fr(p ** e, q ** e)));
    },
    why: (v, a) => `მრიცხველიც და მნიშვნელიც ავიყვანოთ ხარისხში: ${v.f}${superscript(N(v, 'e'))} = ${a}.`,
  }),
  t({
    sub: 'u05-01',
    prompt: 'გამოთვალე: ({MINUS}{f}){ex}.',
    vars: { f: C(properPool(2, 5)), e: C([2, 3, 4]), ex: D((v) => superscript(N(v, 'e'))), MINUS: D(() => MINUS) },
    answer: (v) => `${N(v, 'e') % 2 === 1 ? MINUS : ''}${mText(fr(nd(v, 'f')[0] ** N(v, 'e'), nd(v, 'f')[1] ** N(v, 'e')))}`,
    wrong: (v) => {
      const [p, q] = nd(v, 'f');
      const e = N(v, 'e');
      const ok = `${e % 2 === 1 ? MINUS : ''}${mText(fr(p ** e, q ** e))}`;
      return [`${e % 2 === 1 ? '' : MINUS}${mText(fr(p ** e, q ** e))}`, `${MINUS}${p * e}/${q * e}`.replace(/\/1$/, ''), `${MINUS}${p ** e}/${q}`, `${p ** e}/${q ** e + 1}`, `${MINUS}${p}/${q ** e}`].filter((x) => x !== ok);
    },
    why: (v, a) => `(${MINUS}${v.f})${superscript(N(v, 'e'))}: ${N(v, 'e') % 2 === 0 ? 'ლუწი ხარისხი — შედეგი დადებითია' : 'კენტი ხარისხი — შედეგი უარყოფითია'}; პასუხი ${a}.`,
  }),
  t({
    sub: 'u05-01',
    prompt: 'გამოთვალე: {a1}{ex} + {b}{ey}.',
    vars: { a: I(2, 7), b: I(2, 4), a1: D((v) => `(${MINUS}${N(v, 'a')})`), ex: D(() => superscript(2)), ey: D(() => superscript(3)) },
    answer: (v) => sg(N(v, 'a') ** 2 + N(v, 'b') ** 3),
    wrong: (v) => [-(N(v, 'a') ** 2) + N(v, 'b') ** 3, N(v, 'a') ** 2 + N(v, 'b') * 3, N(v, 'a') * 2 + N(v, 'b') ** 3, N(v, 'a') ** 2 * N(v, 'b') ** 3],
    why: (v, a) => `(${MINUS}${v.a})${superscript(2)} = ${N(v, 'a') ** 2}, ${v.b}${superscript(3)} = ${N(v, 'b') ** 3}; ჯამი ${a}.`,
  }),
  t({
    sub: 'u05-01',
    prompt: 'გამოთვალე: ({f}){ex} {MINUS} ({g}){ex}.',
    vars: { f: C(properPool(2, 6)), g: C(properPool(2, 6)), ex: D(() => superscript(2)), MINUS: D(() => MINUS) },
    constraints: [{ test: (v: Vars) => fCmp(fr(nd(v, 'f')[0], nd(v, 'f')[1]), fr(nd(v, 'g')[0], nd(v, 'g')[1])) > 0, note: 'positive difference' }],
    answer: (v) => mText(fSub(fr(nd(v, 'f')[0] ** 2, nd(v, 'f')[1] ** 2), fr(nd(v, 'g')[0] ** 2, nd(v, 'g')[1] ** 2))),
    wrong: (v) => {
      const [p, q] = nd(v, 'f');
      const [r, s] = nd(v, 'g');
      const ok = mText(fSub(fr(p ** 2, q ** 2), fr(r ** 2, s ** 2)));
      const f2 = fSub(fr(p, q), fr(r, s));
      return [mText(fr(f2.n ** 2, f2.d ** 2)), mText(fr(f2.n * 2, f2.d * 2)), `${p ** 2 - r ** 2}/${q ** 2 - s ** 2 || 1}`.replace('-', MINUS), mText(fr(p ** 2 * s ** 2 + 1, q ** 2 * s ** 2))].filter((x) => x !== ok);
    },
    why: (v, a) => `${v.f}${superscript(2)} = ${mText(fr(nd(v, 'f')[0] ** 2, nd(v, 'f')[1] ** 2))}, ${v.g}${superscript(2)} = ${mText(fr(nd(v, 'g')[0] ** 2, nd(v, 'g')[1] ** 2))}; სხვაობა ${a}.`,
  }),

  // ═════════ U05.2 — ხარისხების გამრავლება და გაყოფა ═════════
  t({
    sub: 'u05-02',
    prompt: 'გაამარტივე: {b}{ex} · {b}{ey}.',
    vars: { b: I(2, 7), m: I(2, 6), n: I(2, 6), ex: D((v) => superscript(N(v, 'm'))), ey: D((v) => superscript(N(v, 'n'))) },
    answer: (v) => pw(N(v, 'b'), N(v, 'm') + N(v, 'n')),
    options: (v, right) => [right, pw(N(v, 'b'), N(v, 'm') * N(v, 'n')), pw(N(v, 'b') * N(v, 'b'), N(v, 'm') + N(v, 'n')), pw(N(v, 'b'), N(v, 'm') + N(v, 'n') - 1), pw(N(v, 'b'), Math.abs(N(v, 'm') - N(v, 'n')) + 1)],
    why: (v, a) => `ერთნაირი ფუძის დროს მაჩვენებლები იკრიბება: ${v.m} + ${v.n} = ${N(v, 'm') + N(v, 'n')}; პასუხი ${a}.`,
  }),
  t({
    sub: 'u05-02',
    prompt: 'გაამარტივე: {b}{ex} ÷ {b}{ey}.',
    vars: { b: I(2, 9), n: I(2, 4), m: I(5, 9), ex: D((v) => superscript(N(v, 'm'))), ey: D((v) => superscript(N(v, 'n'))) },
    answer: (v) => pw(N(v, 'b'), N(v, 'm') - N(v, 'n')),
    options: (v, right) => [right, pw(N(v, 'b'), N(v, 'm') + N(v, 'n')), pw(N(v, 'b'), N(v, 'm') / N(v, 'n') === Math.floor(N(v, 'm') / N(v, 'n')) ? N(v, 'm') / N(v, 'n') : N(v, 'm') - N(v, 'n') + 1), pw(1, N(v, 'm') - N(v, 'n')), pw(N(v, 'b'), N(v, 'm') - N(v, 'n') - 1)],
    why: (v, a) => `ერთნაირი ფუძის დროს მაჩვენებლები გამოიკლება: ${v.m} − ${v.n} = ${N(v, 'm') - N(v, 'n')}; პასუხი ${a}.`,
  }),
  t({
    sub: 'u05-02',
    prompt: 'გაამარტივე: {L}{ex} · {L}{ey}.',
    vars: { L: C(LETTERS), m: I(2, 8), n: I(2, 8), ex: D((v) => superscript(N(v, 'm'))), ey: D((v) => superscript(N(v, 'n'))) },
    answer: (v) => `${v.L}${superscript(N(v, 'm') + N(v, 'n'))}`,
    options: (v, right) => [right, `${v.L}${superscript(N(v, 'm') * N(v, 'n'))}`, `2${v.L}${superscript(N(v, 'm') + N(v, 'n'))}`, `${v.L}${superscript(N(v, 'm') + N(v, 'n') - 1)}`, `${v.L}${superscript(N(v, 'm') + N(v, 'n') + 1)}`],
    why: (v, a) => `ერთნაირი ფუძის დროს მაჩვენებლები იკრიბება: ${v.m} + ${v.n} = ${N(v, 'm') + N(v, 'n')}, ანუ ${a}.`,
  }),
  t({
    sub: 'u05-02',
    prompt: 'გაამარტივე: {L}{ex} ÷ {L}{ey}, სადაც {L} ≠ 0.',
    vars: { L: C(LETTERS), n: I(2, 6), m: I(7, 12), ex: D((v) => superscript(N(v, 'm'))), ey: D((v) => superscript(N(v, 'n'))) },
    answer: (v) => `${v.L}${superscript(N(v, 'm') - N(v, 'n'))}`,
    options: (v, right) => [right, `${v.L}${superscript(N(v, 'm') + N(v, 'n'))}`, `${v.L}${superscript(N(v, 'm') - N(v, 'n') + 1)}`, `${v.L}${superscript(N(v, 'm') - N(v, 'n') - 1)}`, `${v.L}`],
    why: (v, a) => `მაჩვენებლები გამოიკლება: ${v.m} − ${v.n} = ${N(v, 'm') - N(v, 'n')}, ანუ ${a}.`,
  }),
  t({
    sub: 'u05-02',
    prompt: 'გაამარტივე: {b}{e1} · {b}{e2} ÷ {b}{e3}.',
    vars: { b: I(2, 7), p: I(2, 4), q: I(2, 4), r: I(2, 5), e1: D((v) => superscript(N(v, 'p'))), e2: D((v) => superscript(N(v, 'q'))), e3: D((v) => superscript(N(v, 'r'))) },
    constraints: [{ test: (v: Vars) => N(v, 'p') + N(v, 'q') - N(v, 'r') >= 2, note: 'the result stays a power' }],
    answer: (v) => pw(N(v, 'b'), N(v, 'p') + N(v, 'q') - N(v, 'r')),
    options: (v, right) => [right, pw(N(v, 'b'), N(v, 'p') + N(v, 'q') + N(v, 'r')), pw(N(v, 'b'), N(v, 'p') * N(v, 'q') - N(v, 'r')), pw(N(v, 'b'), N(v, 'p') + N(v, 'q') - N(v, 'r') + 1), pw(N(v, 'b'), N(v, 'p') + N(v, 'q') - N(v, 'r') - 1)],
    why: (v, a) => `მაჩვენებლები: ${v.p} + ${v.q} − ${v.r} = ${N(v, 'p') + N(v, 'q') - N(v, 'r')}; პასუხი ${a}.`,
  }),
  t({
    sub: 'u05-02',
    prompt: 'გაამარტივე: {L}{e1} · {L}{e2} ÷ {L}{e3}, სადაც {L} ≠ 0.',
    vars: { L: C(LETTERS), p: I(3, 8), q: I(2, 7), r: I(2, 6), e1: D((v) => superscript(N(v, 'p'))), e2: D((v) => superscript(N(v, 'q'))), e3: D((v) => superscript(N(v, 'r'))) },
    constraints: [{ test: (v: Vars) => N(v, 'p') + N(v, 'q') - N(v, 'r') >= 2, note: 'the result stays a power' }],
    answer: (v) => `${v.L}${superscript(N(v, 'p') + N(v, 'q') - N(v, 'r'))}`,
    options: (v, right) => [right, `${v.L}${superscript(N(v, 'p') + N(v, 'q') + N(v, 'r'))}`, `${v.L}${superscript(N(v, 'p') * N(v, 'q') - N(v, 'r'))}`, `${v.L}${superscript(N(v, 'p') + N(v, 'q') - N(v, 'r') + 1)}`, `${v.L}${superscript(N(v, 'p') + N(v, 'q') - N(v, 'r') - 1)}`],
    why: (v, a) => `მაჩვენებლები: ${v.p} + ${v.q} − ${v.r} = ${N(v, 'p') + N(v, 'q') - N(v, 'r')}, ანუ ${a}.`,
  }),

  // ═════════ U05.3 — ხარისხის აყვანა ხარისხში ═════════
  t({
    sub: 'u05-03',
    prompt: 'გაამარტივე: ({b}{ex}){ey}.',
    vars: { b: I(2, 7), m: I(2, 5), n: I(2, 5), ex: D((v) => superscript(N(v, 'm'))), ey: D((v) => superscript(N(v, 'n'))) },
    answer: (v) => pw(N(v, 'b'), N(v, 'm') * N(v, 'n')),
    options: (v, right) => [right, pw(N(v, 'b'), N(v, 'm') + N(v, 'n')), pw(N(v, 'b') * N(v, 'n'), N(v, 'm')), pw(N(v, 'b'), N(v, 'm') ** 2 === N(v, 'm') * N(v, 'n') ? N(v, 'm') + 1 : N(v, 'm') ** N(v, 'n')), pw(N(v, 'b'), N(v, 'm') * N(v, 'n') + 1)],
    why: (v, a) => `ხარისხის ხარისხში მაჩვენებლები მრავლდება: ${v.m} · ${v.n} = ${N(v, 'm') * N(v, 'n')}; პასუხი ${a}.`,
  }),
  t({
    sub: 'u05-03',
    prompt: 'გაამარტივე: ({L}{ex}){ey}.',
    vars: { L: C(LETTERS), m: I(2, 6), n: I(2, 5), ex: D((v) => superscript(N(v, 'm'))), ey: D((v) => superscript(N(v, 'n'))) },
    answer: (v) => `${v.L}${superscript(N(v, 'm') * N(v, 'n'))}`,
    options: (v, right) => [right, `${v.L}${superscript(N(v, 'm') + N(v, 'n'))}`, `${v.L}${superscript(N(v, 'm') ** N(v, 'n') > 99 ? N(v, 'm') * N(v, 'n') + 2 : N(v, 'm') ** N(v, 'n'))}`, `${v.L}${superscript(N(v, 'm') * N(v, 'n') + 1)}`, `${v.L}${superscript(N(v, 'm') * N(v, 'n') - 1)}`],
    why: (v, a) => `მაჩვენებლები მრავლდება: ${v.m} · ${v.n} = ${N(v, 'm') * N(v, 'n')}, ანუ ${a}.`,
  }),
  t({
    sub: 'u05-03',
    prompt: 'გამოთვალე: ({MINUS}{b}{e1s}){e2s}.',
    vars: { b: I(2, 5), e1: C([2, 3, 4]), e2: C([2, 3]), MINUS: D(() => MINUS), e1s: D((v) => superscript(N(v, 'e1'))), e2s: D((v) => superscript(N(v, 'e2'))) },
    constraints: [{ test: (v: Vars) => N(v, 'b') ** (N(v, 'e1') * N(v, 'e2')) <= 40000, note: 'a modest result' }],
    answer: (v) => sg((-(N(v, 'b') ** N(v, 'e1'))) ** N(v, 'e2')),
    wrong: (v) => [-((-(N(v, 'b') ** N(v, 'e1'))) ** N(v, 'e2')), N(v, 'b') ** (N(v, 'e1') + N(v, 'e2')), N(v, 'b') ** (N(v, 'e1') * N(v, 'e2')) * (N(v, 'e2') % 2 === 0 ? -1 : 1) + 1, N(v, 'b') ** N(v, 'e1') * N(v, 'e2')],
    why: (v, a) => `${MINUS}${v.b}${superscript(N(v, 'e1'))} = ${sg(-(N(v, 'b') ** N(v, 'e1')))}, ამიტომ (${sg(-(N(v, 'b') ** N(v, 'e1')))})${superscript(N(v, 'e2'))} = ${a}.`,
  }),
  t({
    sub: 'u05-03',
    prompt: 'გაამარტივე: ({L}{e1}){e2} · {L}{e3}.',
    vars: { L: C(LETTERS), m: I(2, 5), n: I(2, 4), k: I(2, 6), e1: D((v) => superscript(N(v, 'm'))), e2: D((v) => superscript(N(v, 'n'))), e3: D((v) => superscript(N(v, 'k'))) },
    answer: (v) => `${v.L}${superscript(N(v, 'm') * N(v, 'n') + N(v, 'k'))}`,
    options: (v, right) => [right, `${v.L}${superscript(N(v, 'm') * N(v, 'n') * N(v, 'k'))}`, `${v.L}${superscript(N(v, 'm') + N(v, 'n') + N(v, 'k'))}`, `${v.L}${superscript(N(v, 'm') * (N(v, 'n') + N(v, 'k')))}`, `${v.L}${superscript(N(v, 'm') * N(v, 'n') + N(v, 'k') + 1)}`],
    why: (v, a) => `ჯერ ${v.m} · ${v.n} = ${N(v, 'm') * N(v, 'n')}, შემდეგ ${N(v, 'm') * N(v, 'n')} + ${v.k} = ${N(v, 'm') * N(v, 'n') + N(v, 'k')}; პასუხი ${a}.`,
  }),
  t({
    sub: 'u05-03',
    prompt: 'გაამარტივე: ({c}{L}{ex}){ey}.',
    vars: { c: I(2, 5), L: C(LETTERS), m: I(2, 4), n: C([2, 3]), ex: D((v) => superscript(N(v, 'm'))), ey: D((v) => superscript(N(v, 'n'))) },
    answer: (v) => `${N(v, 'c') ** N(v, 'n')}${v.L}${superscript(N(v, 'm') * N(v, 'n'))}`,
    options: (v, right) => [right, `${N(v, 'c')}${v.L}${superscript(N(v, 'm') * N(v, 'n'))}`, `${N(v, 'c') * N(v, 'n')}${v.L}${superscript(N(v, 'm') * N(v, 'n'))}`, `${N(v, 'c') ** N(v, 'n')}${v.L}${superscript(N(v, 'm'))}`, `${N(v, 'c') * N(v, 'n')}${v.L}${superscript(N(v, 'm'))}`, `${N(v, 'c') ** N(v, 'n')}${v.L}${superscript(N(v, 'm') * N(v, 'n') + 1)}`, `${N(v, 'c') ** N(v, 'n') + 1}${v.L}${superscript(N(v, 'm') * N(v, 'n'))}`],
    why: (v, a) => `ორივე მამრავლი ავიყვანოთ ${v.ey}: ${N(v, 'c')}${superscript(N(v, 'n'))} = ${N(v, 'c') ** N(v, 'n')}, ${v.L}${superscript(N(v, 'm') * N(v, 'n'))}; პასუხი ${a}.`,
  }),
  t({
    sub: 'u05-03',
    prompt: 'გაამარტივე: (({L}{e1}){e2}){e3}.',
    vars: { L: C(LETTERS), m: I(2, 3), n: I(2, 3), k: I(2, 3), e1: D((v) => superscript(N(v, 'm'))), e2: D((v) => superscript(N(v, 'n'))), e3: D((v) => superscript(N(v, 'k'))) },
    answer: (v) => `${v.L}${superscript(N(v, 'm') * N(v, 'n') * N(v, 'k'))}`,
    options: (v, right) => [right, `${v.L}${superscript(N(v, 'm') + N(v, 'n') + N(v, 'k'))}`, `${v.L}${superscript(N(v, 'm') * N(v, 'n') + N(v, 'k'))}`, `${v.L}${superscript(N(v, 'm') * (N(v, 'n') + N(v, 'k')))}`, `${v.L}${superscript(N(v, 'm') * N(v, 'n') * N(v, 'k') + 1)}`, `${v.L}${superscript(N(v, 'm') * N(v, 'n') * N(v, 'k') - 1)}`, `${v.L}${superscript(N(v, 'm') * N(v, 'n') * N(v, 'k') + 2)}`],
    why: (v, a) => `მაჩვენებლები მრავლდება: ${v.m} · ${v.n} · ${v.k} = ${N(v, 'm') * N(v, 'n') * N(v, 'k')}, ანუ ${a}.`,
  }),

  // ═════════ U05.4 — არითმეტიკული კვადრატული ფესვები ═════════
  t({
    sub: 'u05-04',
    prompt: 'გამოთვალე: √{n}.',
    vars: { k: I(2, 15), n: D((v) => N(v, 'k') ** 2) },
    answer: (v) => String(N(v, 'k')),
    wrong: (v) => [N(v, 'k') + 1, N(v, 'k') - 1, N(v, 'n') / 2, N(v, 'k') * 2],
    why: (v, a) => `${a} · ${a} = ${v.n}, ამიტომ √${v.n} = ${a}.`,
  }),
  t({
    sub: 'u05-04',
    prompt: 'გამოთვალე: √{n}.',
    vars: { k: I(11, 30), n: D((v) => N(v, 'k') ** 2) },
    answer: (v) => String(N(v, 'k')),
    wrong: (v) => [N(v, 'k') + 1, N(v, 'k') - 1, N(v, 'k') + 10, N(v, 'k') * 2],
    why: (v, a) => `${a} · ${a} = ${sg(N(v, 'n'))}, ამიტომ √${sg(N(v, 'n'))} = ${a}.`,
  }),
  t({
    sub: 'u05-04',
    prompt: 'გამოთვალე: √({a}/{b}).',
    vars: { f: C(SQ_ROOT_FRAC), a: D((v) => nd(v, 'f')[0] ** 2), b: D((v) => nd(v, 'f')[1] ** 2) },
    answer: (v) => mText(fr(nd(v, 'f')[0], nd(v, 'f')[1])),
    wrong: (v) => {
      const [p, q] = nd(v, 'f');
      return [`${p}/${q ** 2}`, `${p ** 2}/${q}`, `${q}/${p}`, `${p + 1}/${q}`, `${p}/${q + 1}`].filter((x) => x !== mText(fr(p, q)));
    },
    why: (v, a) => `√(${v.a}/${v.b}) = √${v.a} ÷ √${v.b} = ${a}.`,
  }),
  t({
    sub: 'u05-04',
    prompt: 'იპოვე x, თუ x = √{n}.',
    vars: { k: I(12, 35), n: D((v) => N(v, 'k') ** 2) },
    answer: (v) => String(N(v, 'k')),
    wrong: (v) => [N(v, 'k') + 1, N(v, 'k') - 1, N(v, 'k') + 10, N(v, 'k') - 10],
    why: (v, a) => `${a} · ${a} = ${sg(N(v, 'n'))}, ამიტომ x = ${a}.`,
  }),
  t({
    sub: 'u05-04',
    prompt: 'გამოთვალე: √{a} + √{b}.',
    vars: { k: I(2, 15), m: I(2, 12), a: D((v) => N(v, 'k') ** 2), b: D((v) => N(v, 'm') ** 2) },
    answer: (v) => String(N(v, 'k') + N(v, 'm')),
    wrong: (v) => [sqrtOf(N(v, 'a') + N(v, 'b')) === Math.sqrt(N(v, 'a') + N(v, 'b')) ? N(v, 'k') + N(v, 'm') + 1 : Math.round(Math.sqrt(N(v, 'a') + N(v, 'b'))), N(v, 'k') * N(v, 'm'), N(v, 'k') + N(v, 'm') + 2, N(v, 'k') + N(v, 'm') - 1],
    why: (v, a) => `√${v.a} = ${v.k}, √${v.b} = ${v.m}; ${v.k} + ${v.m} = ${a}.`,
  }),
  t({
    sub: 'u05-04',
    prompt: 'გამოთვალე: √{a} {MINUS} √{b}.',
    vars: { k: I(6, 20), m: I(2, 10), a: D((v) => N(v, 'k') ** 2), b: D((v) => N(v, 'm') ** 2), MINUS: D(() => MINUS) },
    constraints: [{ test: (v: Vars) => N(v, 'k') - N(v, 'm') >= 2, note: 'a positive difference' }],
    answer: (v) => String(N(v, 'k') - N(v, 'm')),
    wrong: (v) => [Math.round(Math.sqrt(N(v, 'a') - N(v, 'b'))) , N(v, 'k') + N(v, 'm'), N(v, 'k') - N(v, 'm') + 1, N(v, 'k') - N(v, 'm') - 1],
    why: (v, a) => `√${v.a} = ${v.k}, √${v.b} = ${v.m}; ${v.k} ${MINUS} ${v.m} = ${a}.`,
  }),

  // ═════════ U05.5 — კვადრატული ფესვის თვისებები ═════════
  t({
    sub: 'u05-05',
    prompt: 'გამოთვალე: √({a} · {b}).',
    vars: { k: I(2, 6), m: I(2, 6), a: D((v) => N(v, 'k') ** 2), b: D((v) => N(v, 'm') ** 2) },
    answer: (v) => String(N(v, 'k') * N(v, 'm')),
    wrong: (v) => [N(v, 'k') + N(v, 'm'), N(v, 'a') * N(v, 'b') / 2, N(v, 'k') * N(v, 'm') + 1, N(v, 'k') * N(v, 'm') - 1],
    why: (v, a) => `√(${v.a} · ${v.b}) = √${v.a} · √${v.b} = ${v.k} · ${v.m} = ${a}.`,
  }),
  t({
    sub: 'u05-05',
    prompt: 'გამოთვალე: √({a} ÷ {b}).',
    vars: { b: I(2, 9), k: I(2, 9), a: D((v) => N(v, 'b') * N(v, 'k') ** 2) },
    answer: (v) => String(N(v, 'k')),
    wrong: (v) => [N(v, 'k') * 2, N(v, 'k') + 1, N(v, 'k') ** 2, N(v, 'k') - 1],
    why: (v, a) => `${v.a} ÷ ${v.b} = ${N(v, 'k') ** 2}, √${N(v, 'k') ** 2} = ${a}.`,
  }),
  t({
    sub: 'u05-05',
    prompt: 'გაამარტივე: √({a} · {b}).',
    vars: { k: I(4, 12), m: I(3, 9), a: D((v) => N(v, 'k') ** 2), b: D((v) => N(v, 'm') ** 2) },
    answer: (v) => String(N(v, 'k') * N(v, 'm')),
    wrong: (v) => [N(v, 'k') + N(v, 'm'), N(v, 'k') * N(v, 'm') + N(v, 'k'), N(v, 'k') * N(v, 'm') - N(v, 'm'), N(v, 'a') + N(v, 'b')],
    why: (v, a) => `√${v.a} · √${v.b} = ${v.k} · ${v.m} = ${a}.`,
  }),
  t({
    sub: 'u05-05',
    prompt: 'გამოთვალე: √{a} · √{b}.',
    vars: { k: I(2, 12), m: I(2, 12), a: D((v) => N(v, 'k') ** 2), b: D((v) => N(v, 'm') ** 2) },
    answer: (v) => String(N(v, 'k') * N(v, 'm')),
    wrong: (v) => [N(v, 'k') + N(v, 'm'), N(v, 'k') * N(v, 'm') + 1, N(v, 'k') * N(v, 'm') - 1, N(v, 'a') * N(v, 'b')],
    why: (v, a) => `${v.k} · ${v.m} = ${a}.`,
  }),
  t({
    sub: 'u05-05',
    prompt: 'გამოთვალე: √{a} ÷ √{b}.',
    vars: { m: I(2, 9), k: I(2, 6), a: D((v) => (N(v, 'm') * N(v, 'k')) ** 2), b: D((v) => N(v, 'k') ** 2) },
    answer: (v) => String(N(v, 'm')),
    wrong: (v) => [N(v, 'm') * N(v, 'k'), N(v, 'm') + 1, N(v, 'm') ** 2, N(v, 'm') - 1],
    why: (v, a) => `√${sg(N(v, 'a'))} = ${N(v, 'm') * N(v, 'k')}, √${v.b} = ${v.k}; ${N(v, 'm') * N(v, 'k')} ÷ ${v.k} = ${a}.`,
  }),
  t({
    sub: 'u05-05',
    prompt: 'გაამარტივე: √({a} · {b} · {c}).',
    vars: { k: C([2, 3, 4, 5]), m: C([2, 3, 4, 6]), n: C([2, 3, 5]), a: D((v) => N(v, 'k') ** 2), b: D((v) => N(v, 'm') ** 2), c: D((v) => N(v, 'n') ** 2) },
    answer: (v) => String(N(v, 'k') * N(v, 'm') * N(v, 'n')),
    wrong: (v) => [N(v, 'k') + N(v, 'm') + N(v, 'n'), N(v, 'k') * N(v, 'm') * N(v, 'n') + N(v, 'k'), N(v, 'k') * N(v, 'm') * N(v, 'n') - N(v, 'n'), N(v, 'k') * N(v, 'm') + N(v, 'n')],
    why: (v, a) => `${v.k} · ${v.m} · ${v.n} = ${a}.`,
  }),

  // ═════════ U05.6 — მამრავლების შეტანა და გამოტანა ═════════
  t({
    sub: 'u05-06',
    prompt: 'გაიტანე მამრავლი ფესვის გარეთ: √({a}{L}{ex}), თუ {L} ≥ 0.',
    vars: { k: I(2, 12), L: C(LETTERS), a: D((v) => N(v, 'k') ** 2), ex: D(() => superscript(2)) },
    answer: (v) => `${v.k}${v.L}`,
    options: (v, right) => [right, `${N(v, 'a')}${v.L}`, `${v.k}${v.L}${superscript(2)}`, `${N(v, 'k') * 2}${v.L}`, `${v.k}`],
    why: (v, a) => `√${v.a} = ${v.k} და √(${v.L}${superscript(2)}) = ${v.L} (${v.L} ≥ 0), ამიტომ ${a}.`,
  }),
  t({
    sub: 'u05-06',
    prompt: 'გაამარტივე: √{n}.',
    vars: { s: I(2, 6), r: C([2, 3, 5, 6, 7, 10]), n: D((v) => N(v, 's') ** 2 * N(v, 'r')) },
    answer: (v) => root(N(v, 's'), N(v, 'r')),
    options: (v, right) => [right, root(N(v, 'r'), N(v, 's')), `${N(v, 's') * N(v, 'r')}`, root(N(v, 's') * N(v, 's'), N(v, 'r')), `${N(v, 's')}${N(v, 'r')}`],
    why: (v, a) => `${v.n} = ${N(v, 's') ** 2} · ${v.r}, ამიტომ √${v.n} = ${a}.`,
  }),
  t({
    sub: 'u05-06',
    prompt: 'გაამარტივე: √{n}.',
    vars: { s: I(3, 8), r: C([2, 3, 5, 6, 7, 10, 11]), n: D((v) => N(v, 's') ** 2 * N(v, 'r')) },
    answer: (v) => root(N(v, 's'), N(v, 'r')),
    options: (v, right) => [right, root(N(v, 'r'), N(v, 's')), root(N(v, 's') * N(v, 's'), N(v, 'r')), root(N(v, 's') + 1, N(v, 'r')), `${N(v, 's') * N(v, 'r')}`],
    why: (v, a) => `${v.n} = ${N(v, 's') ** 2} · ${v.r}, ამიტომ √${v.n} = ${a}.`,
  }),
  t({
    sub: 'u05-06',
    prompt: 'შეიტანე მამრავლი ფესვის ქვეშ: {c}√{r}.',
    vars: { c: I(2, 9), r: C(SIMPLE_R) },
    answer: (v) => `√${N(v, 'c') ** 2 * N(v, 'r')}`,
    options: (v, right) => [right, `√${N(v, 'c') * N(v, 'r')}`, `√${N(v, 'c') + N(v, 'r')}`, `√${N(v, 'c') ** 2 + N(v, 'r')}`, `√${N(v, 'c') * N(v, 'r') ** 2}`, `√${N(v, 'c') ** 2 * N(v, 'r') + 1}`, `√${N(v, 'c') ** 2 * N(v, 'r') - 1}`],
    why: (v, a) => `${v.c}√${v.r} = √(${N(v, 'c') ** 2} · ${v.r}) = ${a}.`,
  }),
  t({
    sub: 'u05-06',
    prompt: 'შეიტანე მამრავლი ფესვის ქვეშ: {c}√{r}.',
    vars: { c: I(2, 6), r: C([2, 3, 5, 6, 7, 11, 13]) },
    answer: (v) => `√${N(v, 'c') ** 2 * N(v, 'r')}`,
    options: (v, right) => [right, `√${N(v, 'c') * N(v, 'r')}`, `√${N(v, 'c') + N(v, 'r')}`, `√${N(v, 'c') ** 2 + N(v, 'r')}`, `√${N(v, 'c') * N(v, 'r') ** 2}`],
    why: (v, a) => `${v.c}√${v.r} = √(${N(v, 'c') ** 2} · ${v.r}) = ${a}.`,
  }),
  t({
    sub: 'u05-06',
    prompt: 'გაამარტივე: √({n}{L}{ex}), თუ {L} ≥ 0.',
    vars: { s: I(2, 6), r: C([2, 3, 5, 6, 7]), L: C(LETTERS), n: D((v) => N(v, 's') ** 2 * N(v, 'r')), ex: D(() => superscript(2)) },
    answer: (v) => root(N(v, 's'), N(v, 'r'), String(v.L)),
    options: (v, right) => [right, `${N(v, 's')}√${N(v, 'r')}${v.L}`, root(N(v, 'r'), N(v, 's'), String(v.L)), root(N(v, 's') ** 2, N(v, 'r'), String(v.L)), `${N(v, 's')}√${N(v, 'r')}`],
    why: (v, a) => `√${v.n} = ${v.s}√${v.r}, √(${v.L}${superscript(2)}) = ${v.L}; პასუხი ${a}.`,
  }),

  // ═════════ U05.7 — ფესვების შემცველი გამოსახულებების გარდაქმნა ═════════
  t({
    sub: 'u05-07',
    prompt: 'გაამარტივე: {a}√{r} + {b}√{r}.',
    vars: { a: I(2, 9), b: I(2, 9), r: C(SIMPLE_R) },
    answer: (v) => `${N(v, 'a') + N(v, 'b')}√${v.r}`,
    options: (v, right) => [right, `${N(v, 'a') * N(v, 'b')}√${v.r}`, `${N(v, 'a') + N(v, 'b')}√${N(v, 'r') * 2}`, `${N(v, 'a') + N(v, 'b')}`, `${N(v, 'a') + N(v, 'b') + 1}√${v.r}`],
    why: (v, a) => `ერთნაირი ფესვები: (${v.a} + ${v.b})√${v.r} = ${a}.`,
  }),
  t({
    sub: 'u05-07',
    prompt: 'გაამარტივე: {a}√{r} {MINUS} {b}√{r}.',
    vars: { a: I(3, 12), b: I(2, 9), r: C(SIMPLE_R), MINUS: D(() => MINUS) },
    constraints: [{ test: (v: Vars) => N(v, 'a') - N(v, 'b') >= 2, note: 'a plain coefficient' }],
    answer: (v) => `${N(v, 'a') - N(v, 'b')}√${v.r}`,
    options: (v, right) => [right, `${N(v, 'a') + N(v, 'b')}√${v.r}`, `${N(v, 'a') - N(v, 'b')}`, `${N(v, 'a') - N(v, 'b')}√${N(v, 'r') + 1}`, `${N(v, 'a') - N(v, 'b') + 1}√${v.r}`],
    why: (v, a) => `(${v.a} ${MINUS} ${v.b})√${v.r} = ${a}.`,
  }),
  t({
    sub: 'u05-07',
    prompt: 'გაამარტივე: √{x} + √{y}.',
    vars: { r: C([2, 3, 5, 6, 7]), s: I(2, 5), u: I(2, 5), x: D((v) => N(v, 's') ** 2 * N(v, 'r')), y: D((v) => N(v, 'u') ** 2 * N(v, 'r')) },
    constraints: [{ test: (v: Vars) => N(v, 's') !== N(v, 'u'), note: 'different coefficients' }],
    answer: (v) => `${N(v, 's') + N(v, 'u')}√${v.r}`,
    options: (v, right) => [right, `${N(v, 's') * N(v, 'u')}√${v.r}`, `√${N(v, 'x') + N(v, 'y')}`, `${N(v, 's') + N(v, 'u')}√${N(v, 'r') * 2}`, `${N(v, 's') + N(v, 'u') + 1}√${v.r}`],
    why: (v, a) => `√${v.x} = ${v.s}√${v.r}, √${v.y} = ${v.u}√${v.r}; ჯამი ${a}.`,
  }),
  t({
    sub: 'u05-07',
    prompt: 'გაამარტივე: {a}√{x} {MINUS} √{y}.',
    vars: { r: C([2, 3, 5, 6, 7]), s: I(2, 4), u: I(2, 5), a: I(2, 4), x: D((v) => N(v, 's') ** 2 * N(v, 'r')), y: D((v) => N(v, 'u') ** 2 * N(v, 'r')), MINUS: D(() => MINUS) },
    constraints: [{ test: (v: Vars) => N(v, 'a') * N(v, 's') - N(v, 'u') >= 2, note: 'a plain coefficient' }],
    answer: (v) => `${N(v, 'a') * N(v, 's') - N(v, 'u')}√${v.r}`,
    options: (v, right) => [right, `${N(v, 'a') * N(v, 's') + N(v, 'u')}√${v.r}`, `${N(v, 'a') * N(v, 's') - N(v, 'u')}√${N(v, 'r') * 2}`, `${N(v, 'a') * N(v, 's') - N(v, 'u') - 1}√${v.r}`, `${N(v, 'a') * N(v, 's') - N(v, 'u') + 1}√${v.r}`],
    why: (v, a) => `${v.a}√${v.x} = ${N(v, 'a') * N(v, 's')}√${v.r}, √${v.y} = ${v.u}√${v.r}; სხვაობა ${a}.`,
  }),
  t({
    sub: 'u05-07',
    prompt: 'გაამრავლე და გაამარტივე: √{a} · √{b}.',
    vars: { a: I(2, 12), b: I(2, 12) },
    answer: (v) => rootOf(N(v, 'a') * N(v, 'b')),
    options: (v, right) => {
      const p = N(v, 'a') * N(v, 'b');
      const s = simp(p);
      return [right, s.out > 1 || s.rest === 1 ? `√${p}` : `${N(v, 'a')}√${N(v, 'b')}`, `${p}`, `√${N(v, 'a') + N(v, 'b')}`, root(s.out + 1, s.rest), `${N(v, 'a') + N(v, 'b')}`];
    },
    why: (v, a) => `√${v.a} · √${v.b} = √${N(v, 'a') * N(v, 'b')} = ${a}.`,
  }),
  t({
    sub: 'u05-07',
    prompt: 'გაამარტივე: (√{r} + {c})(√{r} {MINUS} {c}).',
    vars: { c: I(1, 5), r: I(3, 40), MINUS: D(() => MINUS) },
    constraints: [{ test: (v: Vars) => N(v, 'r') > N(v, 'c') ** 2 && !Number.isInteger(Math.sqrt(N(v, 'r'))), note: 'positive, and r not a perfect square' }],
    answer: (v) => sg(N(v, 'r') - N(v, 'c') ** 2),
    wrong: (v) => [N(v, 'r') + N(v, 'c') ** 2, N(v, 'r') - N(v, 'c'), N(v, 'r') ** 2 - N(v, 'c') ** 2, N(v, 'r') - 2 * N(v, 'c'), N(v, 'r') - N(v, 'c') ** 2 + 1],
    why: (v, a) => `(√${v.r} + ${v.c})(√${v.r} ${MINUS} ${v.c}) = ${v.r} ${MINUS} ${N(v, 'c') ** 2} = ${a}.`,
  }),
];
