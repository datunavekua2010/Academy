import type { QuestionTemplate, Vars } from './types';
import { C, D, I, MINUS, N, q6, sg } from './g6-helpers';
import { group, superscript } from './g5-helpers';

/**
 * Grade VII — Unit 6: expressions with variables.
 *
 * Converted from the academy's Grade VII `U06` bank: 7 subtopics × 6 questions.
 *
 * Polynomials in one variable are written from coefficient arrays (index =
 * power) by one printer, `pt`, so a prompt, its key and its slips share one
 * notation: `3x² − 5x + 2`, a true minus sign, true superscripts, and a
 * coefficient 1 left out. Slips are the usual ones of the topic: a sign lost on
 * the subtracted bracket, a missing cross term, `(a + b)² = a² + b²`.
 */

export const G7_U06_SUBTOPICS = ['u06-01', 'u06-02', 'u06-03', 'u06-04', 'u06-05', 'u06-06', 'u06-07'] as const;

const T = 'g7-expressions';
let seq = 0;
const nextId = (): string => `g7-u06-q${String(++seq).padStart(2, '0')}`;
type Spec = Omit<Parameters<typeof q6>[0], 'id' | 'topic' | 'grade'>;
const t = (spec: Spec): QuestionTemplate => q6({ id: nextId(), topic: T, grade: 7, ...spec });

// ───────────────────────────── polynomials ─────────────────────────────

/** Coefficients, index = power. */
export type Poly = number[];
const LETTERS = ['x', 'y', 'z', 'm', 't', 'n'];
const sup = (n: number): string => superscript(n);

const trim = (p: Poly): Poly => {
  const out = [...p];
  while (out.length > 1 && out[out.length - 1] === 0) out.pop();
  return out;
};
const pa = (p: Poly, q: Poly): Poly => trim(Array.from({ length: Math.max(p.length, q.length) }, (_, i) => (p[i] ?? 0) + (q[i] ?? 0)));
const neg = (p: Poly): Poly => p.map((c) => -c);
const ps = (p: Poly, q: Poly): Poly => pa(p, neg(q));
const pm = (p: Poly, q: Poly): Poly => {
  const out: number[] = Array.from({ length: p.length + q.length - 1 }, () => 0);
  p.forEach((a, i) => q.forEach((b, j) => { out[i + j] = (out[i + j] ?? 0) + a * b; }));
  return trim(out);
};
const tm = (c: number, power: number, L: string, first: boolean): string => {
  const abs = Math.abs(c);
  const body = power === 0 ? String(abs) : `${abs === 1 ? '' : abs}${L}${power === 1 ? '' : sup(power)}`;
  return first ? `${c < 0 ? MINUS : ''}${body}` : ` ${c < 0 ? MINUS : '+'} ${body}`;
};
/** `3x² − 5x + 2`. */
export const pt = (p: Poly, L: string): string => {
  let out = '';
  for (let i = p.length - 1; i >= 0; i -= 1) {
    const c = p[i] ?? 0;
    if (c === 0) continue;
    out += tm(c, i, L, out === '');
  }
  return out === '' ? '0' : out;
};
/** `(3x + 5)`. */
const br = (p: Poly, L: string): string => `(${pt(p, L)})`;
export const lin = (a: number, b: number): Poly => [b, a];
export const quad = (a: number, b: number, c: number): Poly => [c, b, a];

/** The key first, then slips, then neighbours of the key so four distinct always exist. */
const polyOptions = (L: string, right: Poly, wrongs: Poly[]): string[] => {
  const key = pt(right, L);
  const texts = [key];
  const push = (p: Poly): void => { const s = pt(p, L); if (!texts.includes(s)) texts.push(s); };
  wrongs.forEach(push);
  for (let i = right.length - 1; i >= 0; i -= 1) {
    const bump = (d: number): Poly => right.map((c, j) => (j === i ? c + d : c));
    push(bump(1));
    push(bump(-1));
    push(right.map((c, j) => (j === i ? -c : c)));
  }
  return texts;
};
const stringOptions = (key: string, wrongs: string[], filler: string[] = []): string[] => {
  const texts = [key];
  for (const w of [...wrongs, ...filler]) if (!texts.includes(w)) texts.push(w);
  return texts;
};

const SIGNED_NONZERO = (min: number, max: number) => I(min, max, { nonZero: true });
const Lvar = C(LETTERS);
const cubic = (a: number): number => a * a * a;

const g = (v: Vars, key: string): number => N(v, key);

export const G7_U06_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U06.1 — გამოსახულების მნიშვნელობის გამოთვლა ═════════
  t({
    sub: 'u06-01',
    prompt: 'იპოვე გამოსახულების {e} მნიშვნელობა, თუ {L} = {xS}.',
    vars: { L: Lvar, a: I(2, 9), b: SIGNED_NONZERO(-9, 9), x: I(-6, 9), xS: D((v) => sg(g(v, 'x'))), e: D((v) => pt(lin(g(v, 'a'), g(v, 'b')), String(v.L))) },
    constraints: [{ test: (v: Vars) => g(v, 'x') !== 0, note: 'a non-trivial value' }],
    answer: (v) => sg(g(v, 'a') * g(v, 'x') + g(v, 'b')),
    wrong: (v) => [g(v, 'a') * (g(v, 'x') + g(v, 'b')), g(v, 'a') * g(v, 'x') - g(v, 'b'), g(v, 'a') + g(v, 'x') + g(v, 'b'), (g(v, 'a') + g(v, 'b')) * g(v, 'x')],
    why: (v, a) => `${v.L} = ${sg(g(v, 'x'))}: ${g(v, 'a')} · ${g(v, 'x') < 0 ? `(${sg(g(v, 'x'))})` : g(v, 'x')} ${g(v, 'b') < 0 ? MINUS : '+'} ${Math.abs(g(v, 'b'))} = ${a}.`,
  }),
  t({
    sub: 'u06-01',
    prompt: 'გამოთვალე {e}, თუ {L} = {x}.',
    vars: { L: Lvar, a: I(2, 5), c: I(1, 9), x: I(2, 8), e: D((v) => pt([-g(v, 'c'), 0, g(v, 'a')], String(v.L))) },
    answer: (v) => sg(g(v, 'a') * g(v, 'x') ** 2 - g(v, 'c')),
    wrong: (v) => [(g(v, 'a') * g(v, 'x')) ** 2 - g(v, 'c'), 2 * g(v, 'a') * g(v, 'x') - g(v, 'c'), g(v, 'a') * g(v, 'x') ** 2 + g(v, 'c'), g(v, 'a') * g(v, 'x') - g(v, 'c')],
    why: (v, a) => `${v.L}${sup(2)} = ${g(v, 'x') ** 2}; ${g(v, 'a')} · ${g(v, 'x') ** 2} ${MINUS} ${v.c} = ${a}.`,
  }),
  t({
    sub: 'u06-01',
    prompt: 'იპოვე {e}-ის მნიშვნელობა, თუ {L} = {x} და {M} = {y}.',
    vars: { P: C(['x|y', 'a|b', 'm|n']), a: I(2, 6), b: I(2, 6), x: I(2, 9), y: I(1, 9),
      L: D((v) => String(v.P).split('|')[0]!), M: D((v) => String(v.P).split('|')[1]!),
      e: D((v) => `${g(v, 'a')}${String(v.P).split('|')[0]} ${MINUS} ${g(v, 'b')}${String(v.P).split('|')[1]}`) },
    answer: (v) => sg(g(v, 'a') * g(v, 'x') - g(v, 'b') * g(v, 'y')),
    wrong: (v) => [g(v, 'a') * g(v, 'x') + g(v, 'b') * g(v, 'y'), (g(v, 'a') - g(v, 'b')) * (g(v, 'x') - g(v, 'y')), g(v, 'a') * g(v, 'y') - g(v, 'b') * g(v, 'x'), g(v, 'a') * g(v, 'x') - g(v, 'b') + g(v, 'y')],
    why: (v, a) => `${g(v, 'a')} · ${v.x} ${MINUS} ${g(v, 'b')} · ${v.y} = ${g(v, 'a') * g(v, 'x')} ${MINUS} ${g(v, 'b') * g(v, 'y')} = ${a}.`,
  }),
  t({
    sub: 'u06-01',
    prompt: 'გამოთვალე {e}, თუ {L} = {xS}.',
    vars: { L: Lvar, b: I(1, 4), c: I(1, 9), x: I(-7, -1), xS: D((v) => sg(g(v, 'x'))), e: D((v) => pt([g(v, 'c'), 2 * g(v, 'b'), 1], String(v.L))) },
    answer: (v) => sg(g(v, 'x') ** 2 + 2 * g(v, 'b') * g(v, 'x') + g(v, 'c')),
    wrong: (v) => [-(g(v, 'x') ** 2) + 2 * g(v, 'b') * g(v, 'x') + g(v, 'c'), g(v, 'x') ** 2 - 2 * g(v, 'b') * g(v, 'x') + g(v, 'c'), g(v, 'x') * 2 + 2 * g(v, 'b') * g(v, 'x') + g(v, 'c'), (g(v, 'x') + g(v, 'b')) ** 2],
    why: (v, a) => `${v.L} = ${sg(g(v, 'x'))}: ${g(v, 'x') ** 2} ${2 * g(v, 'b') * g(v, 'x') < 0 ? MINUS : '+'} ${Math.abs(2 * g(v, 'b') * g(v, 'x'))} + ${v.c} = ${a}.`,
  }),
  t({
    sub: 'u06-01',
    prompt: 'იპოვე {e}-ის მნიშვნელობა, თუ {L} = {x} და {M} = {y}.',
    vars: { P: C(['x|y', 'a|b', 'm|n']), a: I(2, 6), b: I(2, 6), c: I(1, 9), x: I(1, 9), y: I(1, 9),
      L: D((v) => String(v.P).split('|')[0]!), M: D((v) => String(v.P).split('|')[1]!),
      e: D((v) => `${g(v, 'a')}${String(v.P).split('|')[0]} ${MINUS} ${g(v, 'b')}${String(v.P).split('|')[1]} + ${g(v, 'c')}`) },
    answer: (v) => sg(g(v, 'a') * g(v, 'x') - g(v, 'b') * g(v, 'y') + g(v, 'c')),
    wrong: (v) => [g(v, 'a') * g(v, 'x') + g(v, 'b') * g(v, 'y') + g(v, 'c'), g(v, 'a') * g(v, 'x') - g(v, 'b') * g(v, 'y') - g(v, 'c'), g(v, 'a') * g(v, 'y') - g(v, 'b') * g(v, 'x') + g(v, 'c'), g(v, 'a') * g(v, 'x') - (g(v, 'b') * g(v, 'y') + g(v, 'c'))],
    why: (v, a) => `${g(v, 'a') * g(v, 'x')} ${MINUS} ${g(v, 'b') * g(v, 'y')} + ${v.c} = ${a}.`,
  }),
  t({
    sub: 'u06-01',
    prompt: 'გამოთვალე {e}, თუ {L} = {xS} და {M} = {y}.',
    vars: { P: C(['x|y', 'a|b', 'm|n']), a: I(2, 4), x: I(-5, -1), y: I(1, 9), xS: D((v) => sg(g(v, 'x'))),
      L: D((v) => String(v.P).split('|')[0]!), M: D((v) => String(v.P).split('|')[1]!),
      e: D((v) => `${g(v, 'a')}${String(v.P).split('|')[0]}${sup(2)} ${MINUS} ${String(v.P).split('|')[1]}`) },
    answer: (v) => sg(g(v, 'a') * g(v, 'x') ** 2 - g(v, 'y')),
    wrong: (v) => [-g(v, 'a') * g(v, 'x') ** 2 - g(v, 'y'), g(v, 'a') * g(v, 'x') ** 2 + g(v, 'y'), g(v, 'a') * g(v, 'x') * 2 - g(v, 'y'), (g(v, 'a') * g(v, 'x')) ** 2 - g(v, 'y')],
    why: (v, a) => `${v.L}${sup(2)} = ${g(v, 'x') ** 2}; ${g(v, 'a')} · ${g(v, 'x') ** 2} ${MINUS} ${v.y} = ${a}.`,
  }),

  // ═════════ U06.2 — მრავალწევრების შეკრება და გამოკლება ═════════
  ...[0, 1].map((k) =>
    t({
      sub: 'u06-02',
      prompt: 'გაამარტივე: {e}.',
      vars: { L: Lvar, a: k ? SIGNED_NONZERO(-9, 9) : I(2, 8), b: k ? SIGNED_NONZERO(-9, 9) : I(1, 9), c: k ? SIGNED_NONZERO(-9, 9) : I(2, 8), d: k ? SIGNED_NONZERO(-9, 9) : I(1, 9),
        e: D((v) => `${br(lin(g(v, 'a'), g(v, 'b')), String(v.L))} + ${br(lin(g(v, 'c'), g(v, 'd')), String(v.L))}`) },
      constraints: [{ test: (v: Vars) => g(v, 'a') + g(v, 'c') !== 0 && g(v, 'b') + g(v, 'd') !== 0, note: 'a two-term result' }],
      answer: (v) => pt(pa(lin(g(v, 'a'), g(v, 'b')), lin(g(v, 'c'), g(v, 'd'))), String(v.L)),
      options: (v, right) => {
        const A = lin(g(v, 'a'), g(v, 'b'));
        const B = lin(g(v, 'c'), g(v, 'd'));
        const L = String(v.L);
        return stringOptions(right, [pt(ps(A, B), L), pt([g(v, 'b') + g(v, 'd'), g(v, 'a') * g(v, 'c')], L), pt(pa(A, B).map((c, i) => (i === 0 ? c + 1 : c)), L), pt([g(v, 'a') + g(v, 'b'), g(v, 'c') + g(v, 'd')], L)]);
      },
      why: (v, a) => `მსგავსი წევრები: ${v.L}-ის კოეფიციენტები ${sg(g(v, 'a'))} და ${sg(g(v, 'c'))}, თავისუფალი წევრები ${sg(g(v, 'b'))} და ${sg(g(v, 'd'))}; ${a}.`,
    })),
  t({
    sub: 'u06-02',
    prompt: 'გაამარტივე: {e}.',
    vars: { L: Lvar, a: I(2, 7), b: SIGNED_NONZERO(-6, 6), c: SIGNED_NONZERO(-8, 8), d: I(1, 6), f: SIGNED_NONZERO(-6, 6), h: SIGNED_NONZERO(-8, 8),
      e: D((v) => `${br(quad(g(v, 'a'), g(v, 'b'), g(v, 'c')), String(v.L))} + ${br(quad(g(v, 'd'), g(v, 'f'), g(v, 'h')), String(v.L))}`) },
    constraints: [{ test: (v: Vars) => g(v, 'b') + g(v, 'f') !== 0 && g(v, 'c') + g(v, 'h') !== 0, note: 'a three-term result' }],
    answer: (v) => pt(pa(quad(g(v, 'a'), g(v, 'b'), g(v, 'c')), quad(g(v, 'd'), g(v, 'f'), g(v, 'h'))), String(v.L)),
    options: (v, right) => {
      const A = quad(g(v, 'a'), g(v, 'b'), g(v, 'c'));
      const B = quad(g(v, 'd'), g(v, 'f'), g(v, 'h'));
      const L = String(v.L);
      return stringOptions(right, [pt(ps(A, B), L), pt([g(v, 'c') + g(v, 'h'), g(v, 'b') + g(v, 'f'), g(v, 'a') * g(v, 'd')], L), pt([g(v, 'c') + g(v, 'h'), g(v, 'a') + g(v, 'd'), g(v, 'b') + g(v, 'f')], L)], polyOptions(L, pa(A, B), []).slice(1));
    },
    why: (_v, a) => `მსგავსი წევრები ცალ-ცალკე: ${sup(2)}-ის კოეფიციენტები, პირველი ხარისხის და თავისუფალი წევრები; ${a}.`,
  }),
  t({
    sub: 'u06-02',
    prompt: 'გაამარტივე: {e}.',
    vars: { L: Lvar, a: I(3, 12), b: I(1, 9), c: I(1, 8), d: I(1, 9),
      e: D((v) => `${br(lin(g(v, 'a'), g(v, 'b')), String(v.L))} ${MINUS} ${br(lin(g(v, 'c'), g(v, 'd')), String(v.L))}`) },
    constraints: [{ test: (v: Vars) => g(v, 'a') !== g(v, 'c') && g(v, 'b') !== g(v, 'd'), note: 'a two-term result' }],
    answer: (v) => pt(ps(lin(g(v, 'a'), g(v, 'b')), lin(g(v, 'c'), g(v, 'd'))), String(v.L)),
    options: (v, right) => {
      const A = lin(g(v, 'a'), g(v, 'b'));
      const B = lin(g(v, 'c'), g(v, 'd'));
      const L = String(v.L);
      return stringOptions(right, [pt(pa(A, B), L), pt([g(v, 'b') + g(v, 'd'), g(v, 'a') - g(v, 'c')], L), pt([g(v, 'b') - g(v, 'd'), g(v, 'a') + g(v, 'c')], L)], polyOptions(L, ps(A, B), []).slice(1));
    },
    why: (_v, a) => `ფრჩხილის წინ მინუსია, ამიტომ ყველა წევრის ნიშანი იცვლება: ${a}.`,
  }),
  t({
    sub: 'u06-02',
    prompt: 'გაამარტივე: {e}.',
    vars: { L: Lvar, a: I(4, 9), b: I(2, 6), c: I(1, 9), d: I(1, 4), f: I(1, 5), h: I(1, 9),
      e: D((v) => `${br(quad(g(v, 'a'), g(v, 'b'), -g(v, 'c')), String(v.L))} ${MINUS} ${br(quad(g(v, 'd'), -g(v, 'f'), g(v, 'h')), String(v.L))}`) },
    constraints: [{ test: (v: Vars) => g(v, 'a') !== g(v, 'd') && g(v, 'b') + g(v, 'f') !== 0 && -g(v, 'c') - g(v, 'h') !== 0, note: 'a three-term result' }],
    answer: (v) => pt(ps(quad(g(v, 'a'), g(v, 'b'), -g(v, 'c')), quad(g(v, 'd'), -g(v, 'f'), g(v, 'h'))), String(v.L)),
    options: (v, right) => {
      const A = quad(g(v, 'a'), g(v, 'b'), -g(v, 'c'));
      const B = quad(g(v, 'd'), -g(v, 'f'), g(v, 'h'));
      const L = String(v.L);
      return stringOptions(right, [pt(pa(A, B), L), pt([A[0]! - B[0]!, A[1]! + B[1]!, A[2]! - B[2]!], L), pt([A[0]! + B[0]!, A[1]! - B[1]!, A[2]! - B[2]!], L), pt([A[0]! - B[0]!, A[1]! - B[1]!, A[2]! + B[2]!], L)], polyOptions(L, ps(A, B), []).slice(1));
    },
    why: (_v, a) => `მინუსი ფრჩხილის წინ ცვლის ყველა წევრის ნიშანს; მსგავსი წევრების შემდეგ: ${a}.`,
  }),
  t({
    sub: 'u06-02',
    prompt: 'გაამარტივე: {e}.',
    vars: { L: Lvar, a: I(3, 7), b: SIGNED_NONZERO(-5, 5), c: SIGNED_NONZERO(-6, 6), d: I(1, 3), f: SIGNED_NONZERO(-5, 5), h: SIGNED_NONZERO(-6, 6), p: I(1, 3), q: SIGNED_NONZERO(-4, 4), r: SIGNED_NONZERO(-5, 5),
      e: D((v) => `${br(quad(g(v, 'a'), g(v, 'b'), g(v, 'c')), String(v.L))} + ${br(quad(g(v, 'd'), g(v, 'f'), g(v, 'h')), String(v.L))} ${MINUS} ${br(quad(g(v, 'p'), g(v, 'q'), g(v, 'r')), String(v.L))}`) },
    constraints: [{ test: (v: Vars) => {
      const R = ps(pa(quad(g(v, 'a'), g(v, 'b'), g(v, 'c')), quad(g(v, 'd'), g(v, 'f'), g(v, 'h'))), quad(g(v, 'p'), g(v, 'q'), g(v, 'r')));
      return R.length === 3 && R.every((x) => x !== 0);
    }, note: 'a three-term result' }],
    answer: (v) => pt(ps(pa(quad(g(v, 'a'), g(v, 'b'), g(v, 'c')), quad(g(v, 'd'), g(v, 'f'), g(v, 'h'))), quad(g(v, 'p'), g(v, 'q'), g(v, 'r'))), String(v.L)),
    options: (v, right) => {
      const A = quad(g(v, 'a'), g(v, 'b'), g(v, 'c'));
      const B = quad(g(v, 'd'), g(v, 'f'), g(v, 'h'));
      const C3 = quad(g(v, 'p'), g(v, 'q'), g(v, 'r'));
      const L = String(v.L);
      const R = ps(pa(A, B), C3);
      return stringOptions(right, [pt(pa(pa(A, B), C3), L), pt([R[0]! + 2 * C3[0]!, R[1]!, R[2]!], L), pt([R[0]!, R[1]! + 2 * C3[1]!, R[2]!], L), pt([R[0]!, R[1]!, R[2]! + 2 * C3[2]!], L)], polyOptions(L, R, []).slice(1));
    },
    why: (_v, a) => `ჯერ ვკრებთ პირველ ორს, შემდეგ ვაკლებთ მესამეს (ნიშნები იცვლება): ${a}.`,
  }),

  // ═════════ U06.3 — მრავალწევრების გამრავლება ═════════
  t({
    sub: 'u06-03',
    prompt: 'გაამრავლე: {e}.',
    vars: { L: Lvar, a: I(2, 5), b: I(2, 6), c: SIGNED_NONZERO(-8, 8), e: D((v) => `${g(v, 'a')}${v.L}${br(lin(g(v, 'b'), g(v, 'c')), String(v.L))}`) },
    answer: (v) => pt(pm([0, g(v, 'a')], lin(g(v, 'b'), g(v, 'c'))), String(v.L)),
    options: (v, right) => {
      const [a, b, c, L] = [g(v, 'a'), g(v, 'b'), g(v, 'c'), String(v.L)];
      return stringOptions(right, [pt([c, a * b], L), pt([a * c, a * b], L), pt([a * c, b], L), pt([a * c, a * b + 1], L)], polyOptions(L, pm([0, a], lin(b, c)), []).slice(1));
    },
    why: (v, a) => `${v.a}${v.L} ამრავლდება ფრჩხილის თითოეულ წევრზე: ${a}.`,
  }),
  t({
    sub: 'u06-03',
    prompt: 'გაამრავლე: {e}.',
    vars: { L: Lvar, a: I(2, 5), b: I(2, 8), c: I(1, 9), e: D((v) => `${g(v, 'a')}${v.L}${br(lin(g(v, 'b'), -g(v, 'c')), String(v.L))}`) },
    answer: (v) => pt(pm([0, g(v, 'a')], lin(g(v, 'b'), -g(v, 'c'))), String(v.L)),
    options: (v, right) => {
      const [a, b, c, L] = [g(v, 'a'), g(v, 'b'), g(v, 'c'), String(v.L)];
      return stringOptions(right, [pt([a * c, a * b], L), pt([-c, a * b], L), pt([-a * c, b], L), pt([-a * c, a * b + 1], L)], polyOptions(L, pm([0, a], lin(b, -c)), []).slice(1));
    },
    why: (_v, a) => `ვამრავლებთ ორივე წევრზე, ნიშანს ვინარჩუნებთ: ${a}.`,
  }),
  t({
    sub: 'u06-03',
    prompt: 'გაამრავლე: {e}.',
    vars: { L: Lvar, b: I(1, 6), c: I(1, 6), e: D((v) => `${v.L}${br(quad(1, g(v, 'b'), g(v, 'c')), String(v.L))}`) },
    answer: (v) => pt(pm([0, 1], quad(1, g(v, 'b'), g(v, 'c'))), String(v.L)),
    options: (v, right) => {
      const [b, c, L] = [g(v, 'b'), g(v, 'c'), String(v.L)];
      return stringOptions(right, [pt([c, b, 1], L), pt([0, c, b, 2], L), pt([0, c + 1, b, 1], L), pt([0, c, b + 1, 1], L)]);
    },
    why: (v, a) => `${v.L} ამრავლდება თითოეულ წევრზე: ${a}.`,
  }),
  t({
    sub: 'u06-03',
    prompt: 'გაამრავლე: {e}.',
    vars: { L: Lvar, a: I(2, 4), b: I(2, 5), c: I(1, 5), d: I(1, 6), e: D((v) => `${g(v, 'a')}${v.L}${br(quad(g(v, 'b'), -g(v, 'c'), g(v, 'd')), String(v.L))}`) },
    answer: (v) => pt(pm([0, g(v, 'a')], quad(g(v, 'b'), -g(v, 'c'), g(v, 'd'))), String(v.L)),
    options: (v, right) => {
      const [a, b, c, d, L] = [g(v, 'a'), g(v, 'b'), g(v, 'c'), g(v, 'd'), String(v.L)];
      return stringOptions(right, [pt([0, a * d, a * c, a * b], L), pt([a * d, -c, a * b], L), pt([0, a * d, -c, a * b], L), pt([a * d, -a * c, a * b + 1], L)].slice(0, 4), polyOptions(L, pm([0, a], quad(b, -c, d)), []).slice(1));
    },
    why: (v, a) => `ამრავლებთ ${v.a}${v.L}-ს სამივე წევრზე: ${a}.`,
  }),
  t({
    sub: 'u06-03',
    prompt: 'გაამრავლე: {e}.',
    vars: { L: Lvar, p: SIGNED_NONZERO(-6, 6), q: SIGNED_NONZERO(-6, 6), e: D((v) => `${br(lin(1, g(v, 'p')), String(v.L))}${br(lin(1, g(v, 'q')), String(v.L))}`) },
    constraints: [{ test: (v: Vars) => g(v, 'p') + g(v, 'q') !== 0, note: 'the middle term stays' }],
    answer: (v) => pt(pm(lin(1, g(v, 'p')), lin(1, g(v, 'q'))), String(v.L)),
    options: (v, right) => {
      const [p, q, L] = [g(v, 'p'), g(v, 'q'), String(v.L)];
      return stringOptions(right, [pt([p * q, 0, 1], L), pt([p + q, p * q, 1], L), pt([-p * q, p + q, 1], L), pt([p * q, -(p + q), 1], L)], polyOptions(L, pm(lin(1, p), lin(1, q)), []).slice(1));
    },
    why: (_v, a) => `ყოველი წევრი ყოველ წევრზე, შემდეგ მსგავსი წევრები: ${a}.`,
  }),
  t({
    sub: 'u06-03',
    d: 2,
    prompt: 'გაამრავლე: {e}.',
    vars: { L: Lvar, a: I(2, 3), p: SIGNED_NONZERO(-5, 5), q: SIGNED_NONZERO(-5, 5), e: D((v) => `${br(lin(g(v, 'a'), g(v, 'p')), String(v.L))}${br(lin(1, g(v, 'q')), String(v.L))}`) },
    constraints: [{ test: (v: Vars) => g(v, 'a') * g(v, 'q') + g(v, 'p') !== 0, note: 'the middle term stays' }],
    answer: (v) => pt(pm(lin(g(v, 'a'), g(v, 'p')), lin(1, g(v, 'q'))), String(v.L)),
    options: (v, right) => {
      const [a, p, q, L] = [g(v, 'a'), g(v, 'p'), g(v, 'q'), String(v.L)];
      const R = pm(lin(a, p), lin(1, q));
      return stringOptions(right, [pt([p * q, 0, a], L), pt([p * q, a + p + q, a], L), pt([p * q, a * q - p, a], L), pt([-p * q, R[1]!, a], L)], polyOptions(L, R, []).slice(1));
    },
    why: (v, a) => `${v.a}${v.L} · ${v.L} = ${v.a}${v.L}${sup(2)}; ჯამდება ორი ჯვარედინი ნამრავლი; ${a}.`,
  }),

  // ═════════ U06.4 — შემოკლებული გამრავლების ფორმულები ═════════
  t({
    sub: 'u06-04',
    prompt: 'გაშალე ფრჩხილები: ({L} + {p}){ex}.',
    vars: { L: Lvar, p: I(2, 12), ex: D(() => sup(2)) },
    answer: (v) => pt([g(v, 'p') ** 2, 2 * g(v, 'p'), 1], String(v.L)),
    options: (v, right) => {
      const [p, L] = [g(v, 'p'), String(v.L)];
      return stringOptions(right, [pt([p * p, 0, 1], L), pt([p, 2 * p, 1], L), pt([p * p, p, 1], L), pt([2 * p, p, 1], L)]);
    },
    why: (_v, a) => `(a + b)² = a² + 2ab + b²: ${a}.`,
  }),
  t({
    sub: 'u06-04',
    prompt: 'გაშალე ფრჩხილები: ({L} {MINUS} {p}){ex}.',
    vars: { L: Lvar, p: I(2, 12), ex: D(() => sup(2)), MINUS: D(() => MINUS) },
    answer: (v) => pt([g(v, 'p') ** 2, -2 * g(v, 'p'), 1], String(v.L)),
    options: (v, right) => {
      const [p, L] = [g(v, 'p'), String(v.L)];
      return stringOptions(right, [pt([-p * p, 0, 1], L), pt([p * p, 0, 1], L), pt([p * p, 2 * p, 1], L), pt([-p * p, -2 * p, 1], L), pt([p * p, -p, 1], L)]);
    },
    why: (_v, a) => `(a − b)² = a² − 2ab + b²: ${a}.`,
  }),
  t({
    sub: 'u06-04',
    prompt: 'გაამარტივე: ({L} + {p})({L} {MINUS} {p}).',
    vars: { L: Lvar, p: I(2, 15), MINUS: D(() => MINUS) },
    answer: (v) => pt([-(g(v, 'p') ** 2), 0, 1], String(v.L)),
    options: (v, right) => {
      const [p, L] = [g(v, 'p'), String(v.L)];
      return stringOptions(right, [pt([p * p, 0, 1], L), pt([p * p, -2 * p, 1], L), pt([-p, 0, 1], L), pt([-2 * p, 0, 1], L), pt([p * p, 2 * p, 1], L)]);
    },
    why: (_v, a) => `(a + b)(a − b) = a² − b²: ${a}.`,
  }),
  t({
    sub: 'u06-04',
    prompt: 'გამოთვალე {n}{ex} შემოკლებული გამრავლების ფორმულის გამოყენებით.',
    vars: { base: C([20, 30, 40, 50, 100]), k: C([-3, -2, -1, 1, 2, 3]), ex: D(() => sup(2)), n: D((v) => g(v, 'base') + g(v, 'k')) },
    answer: (v) => group((g(v, 'base') + g(v, 'k')) ** 2),
    options: (v, right) => {
      const [b, k] = [g(v, 'base'), g(v, 'k')];
      return stringOptions(right, [group(b * b + k * k), group(b * b + k * b), group(b * b + 2 * k), group(b * b - 2 * k * b + k * k + 2 * k * b * 2), group(b * b + k * k + 2 * Math.abs(k))].filter((x) => x !== right));
    },
    why: (v, a) => `(${v.base} ${g(v, 'k') < 0 ? MINUS : '+'} ${Math.abs(g(v, 'k'))})${sup(2)} = ${group(g(v, 'base') ** 2)} ${g(v, 'k') < 0 ? MINUS : '+'} ${group(2 * g(v, 'base') * Math.abs(g(v, 'k')))} + ${g(v, 'k') ** 2} = ${a}.`,
  }),
  t({
    sub: 'u06-04',
    prompt: 'გამოთვალე {a} · {b} შემოკლებული გამრავლების ფორმულის გამოყენებით.',
    vars: { base: C([20, 30, 40, 50, 60, 100]), k: I(1, 5), a: D((v) => g(v, 'base') - g(v, 'k')), b: D((v) => g(v, 'base') + g(v, 'k')) },
    answer: (v) => group(g(v, 'base') ** 2 - g(v, 'k') ** 2),
    options: (v, right) => {
      const [b, k] = [g(v, 'base'), g(v, 'k')];
      return stringOptions(right, [group(b * b + k * k), group(b * b - k), group(b * b - 2 * k * k), group(b * b)].filter((x) => x !== right), [group(b * b - k * k + 10), group(b * b - k * k - 10)]);
    },
    why: (v, a) => `(${v.base} ${MINUS} ${v.k})(${v.base} + ${v.k}) = ${group(g(v, 'base') ** 2)} ${MINUS} ${g(v, 'k') ** 2} = ${a}.`,
  }),
  t({
    sub: 'u06-04',
    prompt: 'გაამარტივე: {e}{ex}.',
    vars: { L: Lvar, a: I(2, 5), p: SIGNED_NONZERO(-7, 7), ex: D(() => sup(2)), e: D((v) => br(lin(g(v, 'a'), g(v, 'p')), String(v.L))) },
    answer: (v) => pt([g(v, 'p') ** 2, 2 * g(v, 'a') * g(v, 'p'), g(v, 'a') ** 2], String(v.L)),
    options: (v, right) => {
      const [a, p, L] = [g(v, 'a'), g(v, 'p'), String(v.L)];
      return stringOptions(right, [pt([p * p, 0, a * a], L), pt([p * p, a * p, a * a], L), pt([p * p, 2 * a * p, a], L), pt([p * p, -2 * a * p, a * a], L), pt([2 * p, 2 * a * p, a * a], L)]);
    },
    why: (v, a) => `(a + b)² = a² + 2ab + b², სადაც პირველი წევრია ${v.a}${v.L}, მეორე — ${sg(g(v, 'p'))}: ${a}.`,
  }),

  // ═════════ U06.5 — კუბების ჯამი და სხვაობა ═════════
  ...[1, -1].map((s) =>
    t({
      sub: 'u06-05',
      prompt: 'დაშალე მამრავლებად: {L}{ex} {sg} {c}.',
      vars: { L: Lvar, k: I(2, 6), ex: D(() => sup(3)), c: D((v) => cubic(g(v, 'k'))), sg: D(() => (s < 0 ? MINUS : '+')) },
      answer: (v) => `(${v.L} ${s < 0 ? MINUS : '+'} ${v.k})(${pt([g(v, 'k') ** 2, s < 0 ? g(v, 'k') : -g(v, 'k'), 1], String(v.L))})`,
      options: (v, right) => {
        const [k, L] = [g(v, 'k'), String(v.L)];
        const first = `(${L} ${s < 0 ? MINUS : '+'} ${k})`;
        const other = `(${L} ${s < 0 ? '+' : MINUS} ${k})`;
        return stringOptions(right, [
          `${first}(${pt([k * k, s < 0 ? -k : k, 1], L)})`,
          `${other}(${pt([k * k, s < 0 ? k : -k, 1], L)})`,
          `${first}(${pt([k * k, s < 0 ? 2 * k : -2 * k, 1], L)})`,
          `${first}(${pt([k, s < 0 ? k : -k, 1], L)})`,
        ]);
      },
      why: (v, a) => (s < 0 ? `a³ − b³ = (a − b)(a² + ab + b²), b = ${v.k}: ${a}.` : `a³ + b³ = (a + b)(a² − ab + b²), b = ${v.k}: ${a}.`),
    })),
  ...[1, -1].map((s) =>
    t({
      sub: 'u06-05',
      d: 2,
      prompt: 'დაშალე მამრავლებად: {c1}{L}{ex} {sg} {c2}.',
      vars: { L: Lvar, a: C([2, 3]), m: I(1, 3), ex: D(() => sup(3)), c1: D((v) => cubic(g(v, 'a'))), c2: D((v) => cubic(g(v, 'm'))), sg: D(() => (s < 0 ? MINUS : '+')) },
      constraints: [{ test: (v: Vars) => g(v, 'a') !== g(v, 'm'), note: 'no common factor' }],
      answer: (v) => `(${pt(lin(g(v, 'a'), s * g(v, 'm')), String(v.L))})(${pt([g(v, 'm') ** 2, -s * g(v, 'a') * g(v, 'm'), g(v, 'a') ** 2], String(v.L))})`,
      options: (v, right) => {
        const [a, m, L] = [g(v, 'a'), g(v, 'm'), String(v.L)];
        return stringOptions(right, [
          `(${pt(lin(a, s * m), L)})(${pt([m * m, s * a * m, a * a], L)})`,
          `(${pt(lin(a, -s * m), L)})(${pt([m * m, -s * a * m, a * a], L)})`,
          `(${pt(lin(a, s * m), L)})(${pt([m * m, -s * 2 * a * m, a * a], L)})`,
          `(${pt(lin(a, s * m), L)})(${pt([m * m, -s * a * m, a], L)})`,
        ]);
      },
      why: (v, a) => `${v.c1}${v.L}${sup(3)} = (${v.a}${v.L})${sup(3)}, ${s < 0 ? `${g(v, 'm') ** 3}` : `${g(v, 'm') ** 3}`} = ${v.m}${sup(3)}; ${a}.`,
    })),
  t({
    sub: 'u06-05',
    prompt: 'გამოთვალე {a}{ex} + {b}{ex}.',
    vars: { a: C([10, 5, 4, 3, 6, 20, 2]), b: I(1, 4), ex: D(() => sup(3)) },
    constraints: [{ test: (v: Vars) => g(v, 'a') !== g(v, 'b'), note: 'different bases' }],
    answer: (v) => sg(g(v, 'a') ** 3 + g(v, 'b') ** 3),
    wrong: (v) => [(g(v, 'a') + g(v, 'b')) ** 3, g(v, 'a') ** 3 + g(v, 'b') ** 2, g(v, 'a') ** 2 + g(v, 'b') ** 3, g(v, 'a') ** 3 + 3 * g(v, 'b'), g(v, 'a') ** 3 + g(v, 'b') ** 3 + 10],
    why: (v, a) => `${v.a}${sup(3)} = ${g(v, 'a') ** 3}, ${v.b}${sup(3)} = ${g(v, 'b') ** 3}; ჯამი ${a}.`,
  }),
  t({
    sub: 'u06-05',
    prompt: 'გაამარტივე: {e}.',
    vars: { L: Lvar, k: I(2, 6), s: C([1, -1]),
      e: D((v) => `(${v.L} ${g(v, 's') < 0 ? MINUS : '+'} ${v.k})(${pt([g(v, 'k') ** 2, g(v, 's') < 0 ? g(v, 'k') : -g(v, 'k'), 1], String(v.L))})`) },
    answer: (v) => pt([g(v, 's') * g(v, 'k') ** 3, 0, 0, 1], String(v.L)),
    options: (v, right) => {
      const [k, s, L] = [g(v, 'k'), g(v, 's'), String(v.L)];
      return stringOptions(right, [pt([-s * k ** 3, 0, 0, 1], L), pt([s * k * k, 0, 0, 1], L), pt([s * k ** 3, 0, 1], L), pt([s * k ** 3, 0, 0, 1].map((x, i) => (i === 3 ? 1 : x)).map((x, i) => (i === 1 ? k : x)), L)]);
    },
    why: (v, a) => `${g(v, 's') < 0 ? 'a³ − b³' : 'a³ + b³'} ფორმულით: ${a}.`,
  }),

  // ═════════ U06.6 — ჯამისა და სხვაობის კუბი ═════════
  ...[1, -1].map((s) =>
    t({
      sub: 'u06-06',
      prompt: 'გაშალე ფრჩხილები: ({L} {sg} {p}){ex}.',
      vars: { L: Lvar, p: I(2, 6), ex: D(() => sup(3)), sg: D(() => (s < 0 ? MINUS : '+')) },
      answer: (v) => pt([s * g(v, 'p') ** 3, 3 * g(v, 'p') ** 2, s * 3 * g(v, 'p'), 1], String(v.L)),
      options: (v, right) => {
        const [p, L] = [g(v, 'p'), String(v.L)];
        return stringOptions(right, [
          pt([s * p ** 3, 0, 0, 1], L),
          pt([s * p ** 3, 3 * p, s * 3 * p, 1], L),
          pt([s * p * p, 3 * p * p, s * 3 * p, 1], L),
          pt([p ** 3, 3 * p * p, 3 * p, 1], L),
          pt([s * p ** 3, 3 * p * p, 3 * p, 1], L),
        ]);
      },
      why: (_v, a) => (s < 0 ? `(a − b)³ = a³ − 3a²b + 3ab² − b³: ${a}.` : `(a + b)³ = a³ + 3a²b + 3ab² + b³: ${a}.`),
    })),
  ...[1, -1].map((s) =>
    t({
      sub: 'u06-06',
      d: 2,
      prompt: 'გაშალე ფრჩხილები: ({a}{L} {sg} {p}){ex}.',
      vars: { L: Lvar, a: C([2, 3]), p: I(1, 3), ex: D(() => sup(3)), sg: D(() => (s < 0 ? MINUS : '+')) },
      answer: (v) => pt([s * g(v, 'p') ** 3, 3 * g(v, 'a') * g(v, 'p') ** 2, s * 3 * g(v, 'a') ** 2 * g(v, 'p'), g(v, 'a') ** 3], String(v.L)),
      options: (v, right) => {
        const [a, p, L] = [g(v, 'a'), g(v, 'p'), String(v.L)];
        return stringOptions(right, [
          pt([s * p ** 3, 0, 0, a ** 3], L),
          pt([s * p ** 3, 3 * a * p * p, s * 3 * a * p, a ** 3], L),
          pt([s * p ** 3, 3 * a * p * p, s * 3 * a * a * p, a], L),
          pt([s * p ** 3, 3 * a * a * p * p, s * 3 * a * p, a ** 3], L),
          pt([p ** 3, 3 * a * p * p, 3 * a * a * p, a ** 3], L),
        ]);
      },
      why: (v, a) => `პირველი წევრია ${v.a}${v.L}, მეორე — ${v.p}: ${a}.`,
    })),
  t({
    sub: 'u06-06',
    prompt: 'გამოთვალე {n}{ex} ფორმულის ({a} + {b}){ex} გამოყენებით.',
    vars: { base: C([10, 20, 30, 50, 100]), k: C([1, 2, 3]), ex: D(() => sup(3)), n: D((v) => g(v, 'base') + g(v, 'k')), a: D(() => 'a'), b: D(() => 'b') },
    answer: (v) => group((g(v, 'base') + g(v, 'k')) ** 3),
    options: (v, right) => {
      const [b, k] = [g(v, 'base'), g(v, 'k')];
      return stringOptions(right, [group(b ** 3 + k ** 3), group(b ** 3 + 3 * b * b * k + 3 * b * k + k ** 3), group(b ** 3 + 3 * b * b * k + 3 * b * k * k), group(b ** 3 + 3 * b * k * k + k ** 3)].filter((x) => x !== right), [group((b + k) ** 3 + 100)]);
    },
    why: (v, a) => `${v.n} = ${v.base} + ${v.k}: ${group(g(v, 'base') ** 3)} + ${group(3 * g(v, 'base') ** 2 * g(v, 'k'))} + ${group(3 * g(v, 'base') * g(v, 'k') ** 2)} + ${g(v, 'k') ** 3} = ${a}.`,
  }),
  t({
    sub: 'u06-06',
    prompt: 'გამოთვალე {n}{ex} ფორმულის ({a} {MINUS} {b}){ex} გამოყენებით.',
    vars: { base: C([10, 20, 30, 50, 100]), k: C([1, 2, 3]), ex: D(() => sup(3)), n: D((v) => g(v, 'base') - g(v, 'k')), a: D(() => 'a'), b: D(() => 'b'), MINUS: D(() => MINUS) },
    answer: (v) => group((g(v, 'base') - g(v, 'k')) ** 3),
    options: (v, right) => {
      const [b, k] = [g(v, 'base'), g(v, 'k')];
      return stringOptions(right, [group(b ** 3 - k ** 3), group(b ** 3 - 3 * b * b * k - 3 * b * k + k ** 3), group(b ** 3 + 3 * b * b * k + 3 * b * k * k - k ** 3), group(b ** 3 - 3 * b * b * k + 3 * b * k * k + k ** 3)].filter((x) => x !== right), [group((b - k) ** 3 + 100)]);
    },
    why: (v, a) => `${v.n} = ${v.base} ${MINUS} ${v.k}: ${group(g(v, 'base') ** 3)} ${MINUS} ${group(3 * g(v, 'base') ** 2 * g(v, 'k'))} + ${group(3 * g(v, 'base') * g(v, 'k') ** 2)} ${MINUS} ${g(v, 'k') ** 3} = ${a}.`,
  }),

  // ═════════ U06.7 — მრავალწევრების მამრავლებად დაშლა ═════════
  t({
    sub: 'u06-07',
    prompt: 'დაშალე მამრავლებად: {e}.',
    vars: { L: Lvar, g: I(2, 9), p: I(2, 9), e: D((v) => pt(lin(g(v, 'g'), g(v, 'g') * g(v, 'p')), String(v.L))) },
    answer: (v) => `${v.g}(${v.L} + ${v.p})`,
    options: (v, right) => stringOptions(right, [`${v.g}(${v.L} + ${g(v, 'g') * g(v, 'p')})`, `${v.L}(${v.g} + ${g(v, 'g') * g(v, 'p')})`, `${v.g}(${v.L} ${MINUS} ${v.p})`, `(${v.L} + ${v.p})(${v.L} + ${v.g})`, `${g(v, 'g') + 1}(${v.L} + ${v.p})`]),
    why: (v, a) => `საერთო მამრავლია ${v.g}: ${a}.`,
  }),
  t({
    sub: 'u06-07',
    prompt: 'დაშალე მამრავლებად: {e}.',
    vars: { L: Lvar, p: I(2, 12), s: C([1, -1]), e: D((v) => pt([0, g(v, 's') * g(v, 'p'), 1], String(v.L))) },
    answer: (v) => `${v.L}(${v.L} ${g(v, 's') < 0 ? MINUS : '+'} ${v.p})`,
    options: (v, right) => stringOptions(right, [`${v.L}(${v.L} ${g(v, 's') < 0 ? '+' : MINUS} ${v.p})`, `(${v.L} ${g(v, 's') < 0 ? MINUS : '+'} ${v.p})${sup(2)}`, `${v.L}(${v.L}${sup(2)} ${g(v, 's') < 0 ? MINUS : '+'} ${v.p})`, `(${v.L} ${g(v, 's') < 0 ? MINUS : '+'} ${v.p})(${v.L} ${g(v, 's') < 0 ? '+' : MINUS} ${v.p})`]),
    why: (v, a) => `საერთო მამრავლია ${v.L}: ${a}.`,
  }),
  t({
    sub: 'u06-07',
    prompt: 'დაშალე მამრავლებად: {e}.',
    vars: { L: Lvar, k: I(2, 15), e: D((v) => pt([-(g(v, 'k') ** 2), 0, 1], String(v.L))) },
    answer: (v) => `(${v.L} ${MINUS} ${v.k})(${v.L} + ${v.k})`,
    options: (v, right) => stringOptions(right, [`(${v.L} ${MINUS} ${v.k})${sup(2)}`, `(${v.L} + ${v.k})${sup(2)}`, `(${v.L} ${MINUS} ${g(v, 'k') ** 2})(${v.L} + 1)`, `(${v.L} ${MINUS} ${g(v, 'k') ** 2})(${v.L} + ${g(v, 'k') ** 2})`]),
    why: (v, a) => `a² − b² = (a − b)(a + b), სადაც b = ${v.k}: ${a}.`,
  }),
  t({
    sub: 'u06-07',
    d: 2,
    prompt: 'დაშალე მამრავლებად: {e}.',
    vars: { L: Lvar, p: I(1, 8), q: I(2, 9), e: D((v) => pt([g(v, 'p') * g(v, 'q'), g(v, 'p') + g(v, 'q'), 1], String(v.L))) },
    constraints: [{ test: (v: Vars) => g(v, 'p') < g(v, 'q'), note: 'two different factors' }],
    answer: (v) => `(${v.L} + ${v.p})(${v.L} + ${v.q})`,
    options: (v, right) => stringOptions(right, [`(${v.L} + ${g(v, 'p') + g(v, 'q')})(${v.L} + 1)`, `(${v.L} + ${g(v, 'p') * g(v, 'q')})(${v.L} + 1)`, `(${v.L} ${MINUS} ${v.p})(${v.L} ${MINUS} ${v.q})`, `(${v.L} + ${v.p})(${v.L} ${MINUS} ${v.q})`, `(${v.L} + ${g(v, 'p') + 1})(${v.L} + ${v.q})`]),
    why: (v, a) => `ვეძებთ ორ რიცხვს, რომლის ნამრავლია ${g(v, 'p') * g(v, 'q')}, ჯამი კი ${g(v, 'p') + g(v, 'q')}: ${v.p} და ${v.q}; ${a}.`,
  }),
  t({
    sub: 'u06-07',
    prompt: 'დაშალე მამრავლებად: {e}.',
    vars: { L: Lvar, a: I(2, 6), p: I(2, 9), e: D((v) => pt([0, g(v, 'a') * g(v, 'p'), g(v, 'a')], String(v.L))) },
    answer: (v) => `${v.a}${v.L}(${v.L} + ${v.p})`,
    options: (v, right) => stringOptions(right, [`${v.a}${v.L}(${v.L} + ${g(v, 'a') * g(v, 'p')})`, `${v.a}${v.L}(${v.L} ${MINUS} ${v.p})`, `${v.L}(${v.a}${v.L} + ${v.p})`, `${v.a}(${v.L} + ${v.p})`]),
    why: (v, a) => `საერთო მამრავლია ${v.a}${v.L}: ${a}.`,
  }),
  t({
    sub: 'u06-07',
    prompt: 'დაშალე მამრავლებად: {e}.',
    vars: { L: Lvar, k: I(2, 9), s: C([1, -1]), e: D((v) => pt([g(v, 'k') ** 2, -g(v, 's') * 2 * g(v, 'k'), 1], String(v.L))) },
    answer: (v) => `(${v.L} ${g(v, 's') > 0 ? MINUS : '+'} ${v.k})${sup(2)}`,
    options: (v, right) => stringOptions(right, [`(${v.L} ${g(v, 's') > 0 ? '+' : MINUS} ${v.k})${sup(2)}`, `(${v.L} ${MINUS} ${v.k})(${v.L} + ${v.k})`, `(${v.L} ${g(v, 's') > 0 ? MINUS : '+'} ${g(v, 'k') * 2})${sup(2)}`, `(${v.L} ${g(v, 's') > 0 ? MINUS : '+'} ${g(v, 'k') ** 2})${sup(2)}`]),
    why: (v, a) => `${g(v, 's') > 0 ? 'a² − 2ab + b²' : 'a² + 2ab + b²'} სრული კვადრატია, მეორე წევრია ${v.k}: ${a}.`,
  }),
];
