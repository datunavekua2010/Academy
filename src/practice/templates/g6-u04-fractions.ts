import type { QuestionTemplate } from './types';
import {
  C, D, I, MINUS, N, SIGNS, fAdd, fCmp, fDiv, fMul, fSub, fText, fr, gcd, lcm, mText, q6, sg, sign3,
} from './g6-helpers';
import type { Frac } from './g6-helpers';
import {
  fracSlips, fv, isHalf, mixedPool, mixedText, nd, parseF, properPool, roundWhole, wnd,
} from './g6-frac';

/**
 * Grade VI — Unit 4: წილადები და შერეული რიცხვები.
 *
 * Converted from the academy's `U04` bank: 17 subtopics × 6 questions.
 *
 * Fractions are drawn as printed strings (`3/4`, `2 1/3`) from pools in lowest
 * terms, and the key is recomputed exactly from them. Every answer is printed in
 * lowest terms — an improper result as a mixed number unless the question asks
 * for an improper fraction — and wrong options are the classic slips: adding
 * numerators *and* denominators, forgetting to scale a numerator, rounding the
 * wrong way, dividing instead of inverting. A wrong option is never an
 * unreduced copy of the key.
 */

export const G6_U04_SUBTOPICS = [
  'u04-01', 'u04-02', 'u04-03', 'u04-04', 'u04-05', 'u04-06', 'u04-07', 'u04-08', 'u04-09',
  'u04-10', 'u04-11', 'u04-12', 'u04-13', 'u04-14', 'u04-15', 'u04-16', 'u04-17',
] as const;

const T = 'g6-fractions';
let seq = 0;
const nextId = (): string => `g6-u04-q${String(++seq).padStart(2, '0')}`;
type Spec = Omit<Parameters<typeof q6>[0], 'id' | 'topic'>;
const t = (spec: Spec): QuestionTemplate => q6({ id: nextId(), topic: T, ...spec });

const P29 = properPool(2, 9);
const P212 = properPool(2, 12);
const P220 = properPool(2, 20);
const M = mixedPool(6, 2, 9);
const M12 = mixedPool(6, 2, 12);
const W = (f: Frac): string => mText(f);
const frac = (n: number, d: number): Frac => fr(n, d);
const same = (a: Frac, b: Frac): boolean => fCmp(a, b) === 0;
const val = (f: Frac): number => f.n / f.d;
const comp = (a: Frac, b: Frac): string => sign3(a.n * b.d, b.n * a.d);

/** `1/2 + 1/3`-style operand source: two printed variables. */
const two = (a: string[], b: string[] = a) => ({ x: C(a), y: C(b) });

/** Mixed-number slips: a whole too many or few, numerator and denominator mixed up. */
const mixedSlips = (w: number, r: number, d: number): string[] => {
  const out = [mixedText(w + 1, r, d), mixedText(w, r, d + 1)];
  if (r > 1) out.push(mixedText(w, d, r), `${r} ${w}/${d}`);
  if (w > 1) out.push(mixedText(w - 1, r, d));
  if (r + 1 < d) out.push(mixedText(w, r + 1, d));
  out.push(mixedText(w + 2, r, d), mixedText(w, r, d + 2));
  return out;
};

export const G6_U04_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U04.1 — წილადები და შერეული რიცხვები ═════════
  t({
    sub: 'u04-01',
    prompt: 'ჩაწერე არაწესიერი წილადი შერეული რიცხვის სახით: {f}.',
    vars: { d: I(2, 9), w: I(1, 9), r: I(1, 8), f: D((v) => `${N(v, 'w') * N(v, 'd') + N(v, 'r')}/${N(v, 'd')}`) },
    constraints: [{ test: (v) => N(v, 'r') < N(v, 'd') && gcd(N(v, 'r'), N(v, 'd')) === 1, note: 'a real, lowest-terms remainder' }],
    answer: (v) => mixedText(N(v, 'w'), N(v, 'r'), N(v, 'd')),
    options: (v, right) => [right, ...mixedSlips(N(v, 'w'), N(v, 'r'), N(v, 'd'))],
    why: (v, a) => `${String(v.f)}: ${N(v, 'w') * N(v, 'd') + N(v, 'r')} ÷ ${N(v, 'd')} = ${N(v, 'w')} (ნაშთი ${N(v, 'r')}), ამიტომ ${a}.`,
  }),
  t({
    sub: 'u04-01',
    prompt: 'ჩაწერე შერეული რიცხვი არაწესიერი წილადის სახით: {m}.',
    vars: { d: I(2, 9), w: I(1, 9), r: I(1, 8), m: D((v) => `${N(v, 'w')} ${N(v, 'r')}/${N(v, 'd')}`) },
    constraints: [{ test: (v) => N(v, 'r') < N(v, 'd') && gcd(N(v, 'r'), N(v, 'd')) === 1, note: 'lowest-terms part' }],
    answer: (v) => `${N(v, 'w') * N(v, 'd') + N(v, 'r')}/${N(v, 'd')}`,
    wrong: () => [],
    options: (v, right) => {
      const w = N(v, 'w'), r = N(v, 'r'), d = N(v, 'd');
      return [right, `${w + r}/${d}`, `${w * r + d}/${d}`, ...(r > 1 ? [`${w * d + r}/${r}`] : []), `${w * d}/${d}`, `${w * d + r + d}/${d}`, `${w * d + r - 1}/${d}`, `${w * d + r + 1}/${d}`, `${w * d + r + 2}/${d}`];
    },
    why: (v, a) => `${N(v, 'w')} × ${N(v, 'd')} + ${N(v, 'r')} = ${N(v, 'w') * N(v, 'd') + N(v, 'r')}, ამიტომ ${a}.`,
  }),
  t({
    sub: 'u04-01',
    prompt: 'რამდენი მთლიანი ერთეული და რა ნაწილი რჩება წილადში {f}?',
    vars: { d: I(3, 12), w: I(1, 9), r: I(1, 11), f: D((v) => `${N(v, 'w') * N(v, 'd') + N(v, 'r')}/${N(v, 'd')}`) },
    constraints: [{ test: (v) => N(v, 'r') < N(v, 'd') && gcd(N(v, 'r'), N(v, 'd')) === 1, note: 'lowest-terms remainder' }],
    answer: (v) => `${N(v, 'w')} მთლიანი და ${N(v, 'r')}/${N(v, 'd')}`,
    options: (v, right) => {
      const w = N(v, 'w'), r = N(v, 'r'), d = N(v, 'd');
      return [right, `${w + 1} მთლიანი და ${r}/${d}`, `${r} მთლიანი და ${w}/${d}`, ...(r > 1 ? [`${w} მთლიანი და ${d}/${r}`] : []), `${w} მთლიანი და ${r}/${d + 1}`, `${Math.max(w - 1, 0)} მთლიანი და ${r}/${d}`];
    },
    why: (v, a) => `${String(v.f)}: ${N(v, 'w') * N(v, 'd') + N(v, 'r')} ÷ ${N(v, 'd')} = ${N(v, 'w')} (ნაშთი ${N(v, 'r')}): ${a}.`,
  }),
  t({
    sub: 'u04-01',
    d: 2,
    prompt: 'ჩაწერე არაწესიერი წილადი შერეული რიცხვის სახით: {f}.',
    vars: { d: I(7, 16), w: I(3, 15), r: I(1, 15), f: D((v) => `${N(v, 'w') * N(v, 'd') + N(v, 'r')}/${N(v, 'd')}`) },
    constraints: [{ test: (v) => N(v, 'r') < N(v, 'd') && gcd(N(v, 'r'), N(v, 'd')) === 1, note: 'lowest-terms remainder' }],
    answer: (v) => mixedText(N(v, 'w'), N(v, 'r'), N(v, 'd')),
    options: (v, right) => [right, ...mixedSlips(N(v, 'w'), N(v, 'r'), N(v, 'd'))],
    why: (v, a) => `${String(v.f)}: ${N(v, 'w') * N(v, 'd') + N(v, 'r')} ÷ ${N(v, 'd')} = ${N(v, 'w')} (ნაშთი ${N(v, 'r')}), ამიტომ ${a}.`,
  }),
  t({
    sub: 'u04-01',
    d: 2,
    prompt: 'ჩაწერე შერეული რიცხვი არაწესიერი წილადის სახით: {m}.',
    vars: { d: I(7, 16), w: I(3, 15), r: I(1, 15), m: D((v) => `${N(v, 'w')} ${N(v, 'r')}/${N(v, 'd')}`) },
    constraints: [{ test: (v) => N(v, 'r') < N(v, 'd') && gcd(N(v, 'r'), N(v, 'd')) === 1, note: 'lowest-terms part' }],
    answer: (v) => `${N(v, 'w') * N(v, 'd') + N(v, 'r')}/${N(v, 'd')}`,
    options: (v, right) => {
      const w = N(v, 'w'), r = N(v, 'r'), d = N(v, 'd');
      return [right, `${w + r}/${d}`, `${w * r + d}/${d}`, ...(r > 1 ? [`${w * d + r}/${r}`] : []), `${w * d}/${d}`, `${w * d + r + d}/${d}`, `${w * d + r + 1}/${d}`, `${w * d + r + 2}/${d}`];
    },
    why: (v, a) => `${N(v, 'w')} × ${N(v, 'd')} + ${N(v, 'r')} = ${N(v, 'w') * N(v, 'd') + N(v, 'r')}, ამიტომ ${a}.`,
  }),
  t({
    sub: 'u04-01',
    prompt: 'ნამცხვრის {f} ნაწილი გვაქვს. რამდენი მთელი ნამცხვარი და ნამცხვრის რა ნაწილი გამოდის?',
    vars: { d: I(3, 8), w: I(1, 5), r: I(1, 7), f: D((v) => `${N(v, 'w') * N(v, 'd') + N(v, 'r')}/${N(v, 'd')}`) },
    constraints: [{ test: (v) => N(v, 'r') < N(v, 'd') && gcd(N(v, 'r'), N(v, 'd')) === 1, note: 'lowest-terms remainder' }],
    answer: (v) => `${N(v, 'w')} მთელი და ${N(v, 'r')}/${N(v, 'd')}`,
    options: (v, right) => {
      const w = N(v, 'w'), r = N(v, 'r'), d = N(v, 'd');
      return [right, `${w + 1} მთელი და ${r}/${d}`, `${r} მთელი და ${w}/${d}`, ...(r > 1 ? [`${w} მთელი და ${d}/${r}`] : []), `${w} მთელი და ${r}/${d + 1}`, `${Math.max(w - 1, 0)} მთელი და ${r}/${d}`];
    },
    why: (v, a) => `${String(v.f)}: ${N(v, 'w') * N(v, 'd') + N(v, 'r')} ÷ ${N(v, 'd')} = ${N(v, 'w')} (ნაშთი ${N(v, 'r')}): ${a}.`,
  }),

  // ═════════ U04.2 — ტოლი წილადები და შეკვეცა ═════════
  t({
    sub: 'u04-02',
    prompt: 'შეკვეცე წილადი უმარტივეს სახემდე: {f}.',
    vars: { p: C(P29), k: C([2, 3, 4, 5, 6, 7, 8, 9]), f: D((v) => { const [n, d] = nd(v, 'p'); return `${n * N(v, 'k')}/${d * N(v, 'k')}`; }) },
    answer: (v) => String(v.p),
    options: (v, right) => {
      const [n, d] = nd(v, 'p');
      const k = N(v, 'k');
      const half = [2, 3, 5, 7].find((x) => k % x === 0);
      return [right, `${n + 1}/${d}`, `${n}/${d + 1}`, `${d}/${n}`, `${n * k}/${d}`, half && k !== half ? `${(n * k) / half}/${(d * k) / half}` : `${n * k - 1}/${d * k}`];
    },
    why: (v, a) => `მრიცხველსა და მნიშვნელს ${N(v, 'k')}-ზე ვყოფთ: ${String(v.f)} = ${a}.`,
  }),
  t({
    sub: 'u04-02',
    d: 2,
    prompt: 'შეკვეცე წილადი უმარტივეს სახემდე: {f}.',
    vars: { p: C(P212), k: C([6, 7, 8, 9, 11, 12, 13, 14, 15]), f: D((v) => { const [n, d] = nd(v, 'p'); return `${n * N(v, 'k')}/${d * N(v, 'k')}`; }) },
    answer: (v) => String(v.p),
    options: (v, right) => {
      const [n, d] = nd(v, 'p');
      const k = N(v, 'k');
      const half = [2, 3, 5, 7, 11, 13].find((x) => k % x === 0 && x !== k);
      return [right, `${n + 1}/${d}`, `${n}/${d + 1}`, `${d}/${n}`, half ? `${(n * k) / half}/${(d * k) / half}` : `${n * k - 1}/${d * k}`, `${n * k}/${d}`];
    },
    why: (v, a) => `მრიცხველსა და მნიშვნელს ${N(v, 'k')}-ზე ვყოფთ: ${String(v.f)} = ${a}.`,
  }),
  t({
    sub: 'u04-02',
    prompt: 'ჩასვი გამოტოვებული რიცხვი: {f} = □/{D}.',
    vars: { f: C(P29), k: C([2, 3, 4, 5, 6, 7]), D: D((v) => nd(v, 'f')[1] * N(v, 'k')) },
    answer: (v) => String(nd(v, 'f')[0] * N(v, 'k')),
    wrong: (v) => {
      const [n, d] = nd(v, 'f');
      const k = N(v, 'k');
      return [n + (d * k - d), n + k, n * k + 1, n * k - 1, d * k, n];
    },
    why: (v, a) => `მნიშვნელი ${N(v, 'k')}-ჯერ გაიზარდა, ამიტომ მრიცხველიც ${N(v, 'k')}-ჯერ უნდა გაიზარდოს: ${String(v.f)} = ${a}/${N(v, 'D')}.`,
  }),
  t({
    sub: 'u04-02',
    prompt: 'ჩასვი გამოტოვებული რიცხვი: {f} = {c}/□.',
    vars: { f: C(P29), k: C([2, 3, 4, 5, 6, 7]), c: D((v) => nd(v, 'f')[0] * N(v, 'k')) },
    answer: (v) => String(nd(v, 'f')[1] * N(v, 'k')),
    wrong: (v) => {
      const [n, d] = nd(v, 'f');
      const k = N(v, 'k');
      return [d + (n * k - n), d + k, d * k + 1, d * k - 1, n * k, d];
    },
    why: (v, a) => `მრიცხველი ${N(v, 'k')}-ჯერ გაიზარდა, ამიტომ მნიშვნელიც ${N(v, 'k')}-ჯერ უნდა გაიზარდოს: ${String(v.f)} = ${N(v, 'c')}/${a}.`,
  }),
  t({
    sub: 'u04-02',
    d: 2,
    prompt: 'იპოვე x, თუ {f} = {c}/x.',
    vars: { f: C(P212), k: C([2, 3, 4, 5, 6, 7, 8, 9]), c: D((v) => nd(v, 'f')[0] * N(v, 'k')) },
    answer: (v) => String(nd(v, 'f')[1] * N(v, 'k')),
    wrong: (v) => {
      const [n, d] = nd(v, 'f');
      const k = N(v, 'k');
      return [d + (n * k - n), d + k, d * k + 1, d * k - 1, n * k, d * k + d];
    },
    why: (v, a) => `${N(v, 'c')} = ${nd(v, 'f')[0]} × ${N(v, 'k')}, ამიტომ x = ${nd(v, 'f')[1]} × ${N(v, 'k')} = ${a}.`,
  }),
  t({
    sub: 'u04-02',
    prompt: 'რომელი წილადია ტოლი წილადის {f}?',
    vars: { f: C(P29), k: C([2, 3, 4, 5, 6, 7, 8]) },
    answer: (v) => { const [n, d] = nd(v, 'f'); return `${n * N(v, 'k')}/${d * N(v, 'k')}`; },
    options: (v, right) => {
      const [n, d] = nd(v, 'f');
      const k = N(v, 'k');
      return [right, `${n + k}/${d + k}`, `${n * k}/${d * k + 1}`, `${n * k + 1}/${d * k}`, `${n * k}/${d + k}`, `${n * k + 2}/${d * k}`, `${n * k}/${d * k + 2}`];
    },
    why: (v, a) => `მრიცხველიც და მნიშვნელიც ${N(v, 'k')}-ზე გავამრავლეთ: ${String(v.f)} = ${a}.`,
  }),

  // ═════════ U04.3 — საერთო მნიშვნელი ═════════
  t({
    sub: 'u04-03',
    prompt: 'მოიყვანე {x} და {y} უმცირეს საერთო მნიშვნელზე.',
    vars: two(P29),
    constraints: [{ test: (v) => nd(v, 'x')[1] !== nd(v, 'y')[1], note: 'different denominators' }],
    answer: (v) => commonPair(v),
    options: (v, right) => commonPairSlips(v, right),
    why: (v, a) => `უმცირესი საერთო მნიშვნელია ${lcm(nd(v, 'x')[1], nd(v, 'y')[1])}: ${a}.`,
  }),
  t({
    sub: 'u04-03',
    d: 2,
    prompt: 'მოიყვანე {x} და {y} უმცირეს საერთო მნიშვნელზე.',
    vars: two(P220),
    constraints: [{ test: (v) => nd(v, 'x')[1] !== nd(v, 'y')[1] && lcm(nd(v, 'x')[1], nd(v, 'y')[1]) <= 60, note: 'different denominators, small LCD' }],
    answer: (v) => commonPair(v),
    options: (v, right) => commonPairSlips(v, right),
    why: (v, a) => `უმცირესი საერთო მნიშვნელია ${lcm(nd(v, 'x')[1], nd(v, 'y')[1])}: ${a}.`,
  }),
  t({
    sub: 'u04-03',
    d: 2,
    prompt: 'მოიყვანე {x}, {y} და {z} უმცირეს საერთო მნიშვნელზე.',
    vars: { x: C(P212), y: C(P212), z: C(P212) },
    constraints: [{
      test: (v) => {
        const ds = [nd(v, 'x')[1], nd(v, 'y')[1], nd(v, 'z')[1]];
        return new Set(ds).size === 3 && lcm(lcm(ds[0]!, ds[1]!), ds[2]!) <= 48;
      },
      note: 'three denominators, small LCD',
    }],
    answer: (v) => {
      const L = lcm(lcm(nd(v, 'x')[1], nd(v, 'y')[1]), nd(v, 'z')[1]);
      return ['x', 'y', 'z'].map((k) => { const [n, d] = nd(v, k); return `${(n * L) / d}/${L}`; }).join(', ');
    },
    options: (v, right) => {
      const ds = [nd(v, 'x')[1], nd(v, 'y')[1], nd(v, 'z')[1]];
      const L = lcm(lcm(ds[0]!, ds[1]!), ds[2]!);
      const make = (den: number): string => ['x', 'y', 'z'].map((k) => { const [n, d] = nd(v, k); return `${(n * den) / d}/${den}`; }).join(', ');
      const prod = ds[0]! * ds[1]! * ds[2]!;
      const out = [right];
      if (prod !== L && prod % ds[0]! === 0 && prod % ds[1]! === 0 && prod % ds[2]! === 0) out.push(make(prod));
      out.push(make(L * 2));
      out.push(['x', 'y', 'z'].map((k) => `${nd(v, k)[0]}/${L}`).join(', '));
      out.push(['x', 'y', 'z'].map((k, i) => { const [n, d] = nd(v, k); return `${(n * L) / d + (i === 0 ? 1 : 0)}/${L}`; }).join(', '));
      out.push(['x', 'y', 'z'].map((k, i) => { const [n, d] = nd(v, k); return `${(n * L) / d + (i === 2 ? -1 : 0) || 1}/${L}`; }).join(', '));
      return out;
    },
    why: (v, a) => `უმცირესი საერთო მნიშვნელია ${lcm(lcm(nd(v, 'x')[1], nd(v, 'y')[1]), nd(v, 'z')[1])}: ${a}.`,
  }),
  t({
    sub: 'u04-03',
    prompt: 'რომელია {b} და {d} მნიშვნელების უმცირესი საერთო მნიშვნელი?',
    vars: { b: I(2, 15), d: I(2, 15) },
    constraints: [{ test: (v) => N(v, 'b') !== N(v, 'd'), note: 'different denominators' }],
    answer: (v) => String(lcm(N(v, 'b'), N(v, 'd'))),
    wrong: (v) => [N(v, 'b') * N(v, 'd'), Math.max(N(v, 'b'), N(v, 'd')), lcm(N(v, 'b'), N(v, 'd')) * 2, gcd(N(v, 'b'), N(v, 'd')), lcm(N(v, 'b'), N(v, 'd')) + N(v, 'b')],
    why: (_v, a) => `უმცირესი საერთო ჯერადი: ${a}.`,
  }),
  t({
    sub: 'u04-03',
    prompt: 'ჩასვი გამოტოვებული რიცხვი: {f} = □/{D}.',
    vars: { f: C(P212), k: C([2, 3, 4, 5, 6]), D: D((v) => nd(v, 'f')[1] * N(v, 'k')) },
    answer: (v) => String(nd(v, 'f')[0] * N(v, 'k')),
    wrong: (v) => {
      const [n, d] = nd(v, 'f');
      const k = N(v, 'k');
      return [n + (d * k - d), n + k, n * k + 1, n * k - 1, d * k, n];
    },
    why: (v, a) => `${N(v, 'D')} = ${nd(v, 'f')[1]} × ${N(v, 'k')}, ამიტომ მრიცხველიც ${N(v, 'k')}-ზე ვამრავლებთ: ${a}.`,
  }),

  // ═════════ U04.4 — წილადების შედარება ═════════
  t({
    sub: 'u04-04',
    prompt: 'ჩასვი შესაბამისი ნიშანი: {x} □ {y}.',
    vars: { d: I(5, 16), n1: I(1, 15), n2: I(1, 15), x: D((v) => `${N(v, 'n1')}/${N(v, 'd')}`), y: D((v) => `${N(v, 'n2')}/${N(v, 'd')}`) },
    constraints: [{ test: (v) => N(v, 'n1') < N(v, 'd') && N(v, 'n2') < N(v, 'd') && N(v, 'n1') !== N(v, 'n2'), note: 'proper, different' }],
    optionCount: 3,
    answer: (v) => sign3(N(v, 'n1'), N(v, 'n2')),
    options: () => SIGNS,
    why: (v, a) => `მნიშვნელები ერთნაირია, ამიტომ მრიცხველებს ვადარებთ: ${String(v.x)} ${a} ${String(v.y)}.`,
  }),
  t({
    sub: 'u04-04',
    prompt: 'შეადარე: {x} □ {y}.',
    vars: two(P212),
    constraints: [{ test: (v) => nd(v, 'x')[1] !== nd(v, 'y')[1], note: 'different denominators' }],
    optionCount: 3,
    answer: (v) => comp(fv(v, 'x'), fv(v, 'y')),
    options: () => SIGNS,
    why: (v, a) => `საერთო მნიშვნელზე მიყვანით: ${String(v.x)} ${a} ${String(v.y)}.`,
  }),
  t({
    sub: 'u04-04',
    d: 2,
    prompt: 'შეადარე: {x} □ {y}.',
    vars: two(P212),
    constraints: [{
      test: (v) => nd(v, 'x')[1] !== nd(v, 'y')[1] && Math.abs(val(fv(v, 'x')) - val(fv(v, 'y'))) < 0.12 && !same(fv(v, 'x'), fv(v, 'y')),
      note: 'close but not equal',
    }],
    optionCount: 3,
    answer: (v) => comp(fv(v, 'x'), fv(v, 'y')),
    options: () => SIGNS,
    why: (v, a) => `საერთო მნიშვნელზე მიყვანით: ${String(v.x)} ${a} ${String(v.y)}.`,
  }),
  t({
    sub: 'u04-04',
    d: 2,
    prompt: 'შეადარე: {x} □ {y}.',
    vars: { p: C(P29), k: C([2, 3, 4, 5]), kind: C(['eq', 'less', 'more']),
      x: D((v) => String(v.p)),
      y: D((v) => {
        const [n, d] = nd(v, 'p');
        const k = N(v, 'k');
        return String(v.kind) === 'eq' ? `${n * k}/${d * k}` : String(v.kind) === 'less' ? `${n * k - 1}/${d * k}` : `${n * k + 1}/${d * k}`;
      }) },
    constraints: [{ test: (v) => { const [n, d] = nd(v, 'p'); return n * N(v, 'k') - 1 > 0 && n * N(v, 'k') + 1 < d * N(v, 'k'); }, note: 'a proper neighbour' }],
    optionCount: 3,
    answer: (v) => comp(fv(v, 'x'), parseF(String(v.y))),
    options: () => SIGNS,
    why: (v, a) => `${String(v.y)} და ${String(v.x)} ერთ მნიშვნელზე მივიყვანოთ: ${String(v.x)} ${a} ${String(v.y)}.`,
  }),
  t({
    sub: 'u04-04',
    d: 2,
    prompt: 'დაალაგე ზრდადობით: {x}, {y}, {z}. რომელია სწორი რიგი?',
    vars: { x: C(P212), y: C(P212), z: C(P212) },
    constraints: [{ test: (v) => distinct3(v), note: 'three different values' }],
    answer: (v) => orderText(v, true),
    options: (v, right) => orderOptions(v, right),
    why: (_v, a) => `საერთო მნიშვნელზე მიყვანით ვადარებთ: ${a}.`,
  }),
  t({
    sub: 'u04-04',
    d: 2,
    prompt: 'დაალაგე კლებადობით: {x}, {y}, {z}. რომელია სწორი რიგი?',
    vars: { x: C(P212), y: C(P212), z: C(P212) },
    constraints: [{ test: (v) => distinct3(v), note: 'three different values' }],
    answer: (v) => orderText(v, false),
    options: (v, right) => orderOptions(v, right),
    why: (_v, a) => `საერთო მნიშვნელზე მიყვანით ვადარებთ: ${a}.`,
  }),
  t({
    sub: 'u04-04',
    prompt: 'შეადარე: {x} □ {y}.',
    vars: { x: C(M), y: C(M) },
    constraints: [{ test: (v) => !same(fv(v, 'x'), fv(v, 'y')) && Math.abs(val(fv(v, 'x')) - val(fv(v, 'y'))) < 1, note: 'mixed numbers of the same or neighbouring whole' }],
    optionCount: 3,
    answer: (v) => comp(fv(v, 'x'), fv(v, 'y')),
    options: () => SIGNS,
    why: (v, a) => `${String(v.x)} ${a} ${String(v.y)}.`,
  }),

  // ═════════ U04.5 — ერთნაირმნიშვნელიანი წილადების შეკრება და გამოკლება ═════════
  t({
    sub: 'u04-05',
    prompt: 'გამოთვალე: {e}.',
    vars: { d: I(5, 16), n1: I(1, 14), n2: I(1, 14), e: D((v) => `${N(v, 'n1')}/${N(v, 'd')} + ${N(v, 'n2')}/${N(v, 'd')}`) },
    constraints: [{ test: (v) => N(v, 'n1') + N(v, 'n2') < N(v, 'd'), note: 'proper sum' }],
    answer: (v) => W(frac(N(v, 'n1') + N(v, 'n2'), N(v, 'd'))),
    options: (v, right) => [right, ...sameDenSlips(v, 1)],
    why: (v, a) => `${String(v.e)} = ${N(v, 'n1') + N(v, 'n2')}/${N(v, 'd')}${a === `${N(v, 'n1') + N(v, 'n2')}/${N(v, 'd')}` ? '' : ` = ${a}`}.`,
  }),
  t({
    sub: 'u04-05',
    prompt: 'გამოთვალე: {e}.',
    vars: { d: I(5, 16), n1: I(2, 15), n2: I(1, 14), e: D((v) => `${N(v, 'n1')}/${N(v, 'd')} ${MINUS} ${N(v, 'n2')}/${N(v, 'd')}`) },
    constraints: [{ test: (v) => N(v, 'n1') < N(v, 'd') && N(v, 'n2') < N(v, 'n1'), note: 'proper, positive difference' }],
    answer: (v) => W(frac(N(v, 'n1') - N(v, 'n2'), N(v, 'd'))),
    options: (v, right) => [right, ...sameDenSlips(v, -1)],
    why: (v, a) => `${String(v.e)} = ${N(v, 'n1') - N(v, 'n2')}/${N(v, 'd')}${a === `${N(v, 'n1') - N(v, 'n2')}/${N(v, 'd')}` ? '' : ` = ${a}`}.`,
  }),
  t({
    sub: 'u04-05',
    d: 2,
    prompt: 'გამოთვალე: {e}. პასუხი ჩაწერე შერეული რიცხვის სახით.',
    vars: { d: I(4, 12), n1: I(2, 11), n2: I(2, 11), e: D((v) => `${N(v, 'n1')}/${N(v, 'd')} + ${N(v, 'n2')}/${N(v, 'd')}`) },
    constraints: [{ test: (v) => N(v, 'n1') < N(v, 'd') && N(v, 'n2') < N(v, 'd') && N(v, 'n1') + N(v, 'n2') > N(v, 'd'), note: 'sum above one' }],
    answer: (v) => W(frac(N(v, 'n1') + N(v, 'n2'), N(v, 'd'))),
    options: (v, right) => [right, ...sameDenSlips(v, 1), `${N(v, 'n1') + N(v, 'n2')}/${N(v, 'd')}`],
    why: (v, a) => `${String(v.e)} = ${N(v, 'n1') + N(v, 'n2')}/${N(v, 'd')} = ${a}.`,
  }),
  t({
    sub: 'u04-05',
    d: 2,
    prompt: 'გამოთვალე: {e}.',
    vars: {
      d: I(5, 12), w1: I(2, 6), w2: I(1, 5), r1: I(1, 10), r2: I(1, 10),
      e: D((v) => `${N(v, 'w1')} ${N(v, 'r1')}/${N(v, 'd')} ${MINUS} ${N(v, 'w2')} ${N(v, 'r2')}/${N(v, 'd')}`),
    },
    constraints: [{ test: (v) => N(v, 'r1') < N(v, 'd') && N(v, 'r2') < N(v, 'd') && N(v, 'r1') < N(v, 'r2') && N(v, 'w1') > N(v, 'w2') && gcd(N(v, 'r1'), N(v, 'd')) === 1 && gcd(N(v, 'r2'), N(v, 'd')) === 1, note: 'a borrow is needed' }],
    answer: (v) => W(frac(N(v, 'w1') * N(v, 'd') + N(v, 'r1') - N(v, 'w2') * N(v, 'd') - N(v, 'r2'), N(v, 'd'))),
    options: (v, right) => {
      const d = N(v, 'd'), r1 = N(v, 'r1'), r2 = N(v, 'r2'), dw = N(v, 'w1') - N(v, 'w2');
      return [right, W(frac(dw * d + (r2 - r1), d)), W(frac(dw * d + r1 + r2, d)), W(frac((dw + 1) * d + (r1 - r2), d)), W(frac(dw * d - (r2 - r1) + d, d)), W(frac((dw - 1) * d + (r1 + d - r2) + 1, d))];
    },
    why: (v, a) => `მთელები და წილადები: ${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u04-05',
    prompt: 'გამოთვალე: {e}.',
    vars: { d: I(8, 20), n1: I(2, 18), n2: I(2, 18), e: D((v) => `${N(v, 'n1')}/${N(v, 'd')} ${MINUS} ${N(v, 'n2')}/${N(v, 'd')}`) },
    constraints: [{ test: (v) => N(v, 'n1') < N(v, 'd') && N(v, 'n2') < N(v, 'n1'), note: 'proper, positive difference' }],
    answer: (v) => W(frac(N(v, 'n1') - N(v, 'n2'), N(v, 'd'))),
    options: (v, right) => [right, ...sameDenSlips(v, -1)],
    why: (v, a) => `${String(v.e)} = ${a}.`,
  }),
  t({
    sub: 'u04-05',
    prompt: 'გამოთვალე: {e}.',
    vars: { d: I(8, 20), n1: I(1, 18), n2: I(1, 18), e: D((v) => `${N(v, 'n1')}/${N(v, 'd')} + ${N(v, 'n2')}/${N(v, 'd')}`) },
    constraints: [{ test: (v) => N(v, 'n1') + N(v, 'n2') < N(v, 'd'), note: 'proper sum' }],
    answer: (v) => W(frac(N(v, 'n1') + N(v, 'n2'), N(v, 'd'))),
    options: (v, right) => [right, ...sameDenSlips(v, 1)],
    why: (v, a) => `${String(v.e)} = ${a}.`,
  }),

  // ═════════ U04.6 — სხვადასხვამნიშვნელიანი წილადების შეკრება და გამოკლება ═════════
  ...(['+', MINUS] as const).flatMap((op) =>
    [
      { d: 1 as const, note: 'coprime denominators', ok: (a: number, b: number) => gcd(a, b) === 1 },
      { d: 1 as const, note: 'one denominator divides the other', ok: (a: number, b: number) => a !== b && Math.max(a, b) % Math.min(a, b) === 0 },
      { d: 2 as const, note: 'a common factor, no divisibility', ok: (a: number, b: number) => gcd(a, b) > 1 && a % b !== 0 && b % a !== 0 },
    ].map(({ d, note, ok }) =>
      t({
        sub: 'u04-06',
        d,
        prompt: 'გამოთვალე: {x} ' + (op === '+' ? '+' : MINUS) + ' {y}.',
        vars: two(P212),
        constraints: [{
          test: (v) => ok(nd(v, 'x')[1], nd(v, 'y')[1]) && (op === '+' || fCmp(fv(v, 'x'), fv(v, 'y')) > 0),
          note,
        }],
        answer: (v) => W(op === '+' ? fAdd(fv(v, 'x'), fv(v, 'y')) : fSub(fv(v, 'x'), fv(v, 'y'))),
        options: (v, right) => {
          const [a, b] = [fv(v, 'x'), fv(v, 'y')];
          const [n1, d1] = nd(v, 'x'), [n2, d2] = nd(v, 'y');
          const r = op === '+' ? fAdd(a, b) : fSub(a, b);
          return [right, W(frac(op === '+' ? n1 + n2 : Math.abs(n1 - n2), d1 + d2)), ...fracSlips(r, [frac(op === '+' ? n1 + n2 : Math.abs(n1 - n2), Math.max(d1, d2))])];
        },
        why: (v, a) => `საერთო მნიშვნელზე მიყვანით: ${String(v.x)} ${op} ${String(v.y)} = ${a}.`,
      }),
    ),
  ),

  // ═════════ U04.7 — ჯამებისა და სხვაობების შედარება ═════════
  ...(['+', MINUS] as const).flatMap((op) =>
    [1, 2].map((variant) =>
      t({
        sub: 'u04-07',
        d: variant === 1 ? 1 : 2,
        prompt: 'შეადარე: {x} ' + (op === '+' ? '+' : MINUS) + ' {y} □ {z}.',
        vars: {
          x: C(P212), y: C(P212), mode: C(['eq', 'lt', 'gt']), m: C([10, 12, 15, 20]),
          z: D((v) => {
            const base = op === '+' ? fAdd(fv(v, 'x'), fv(v, 'y')) : fSub(fv(v, 'x'), fv(v, 'y'));
            const step = frac(variant, N(v, 'm'));
            const target = String(v.mode) === 'eq' ? base : String(v.mode) === 'lt' ? fAdd(base, step) : fSub(base, step);
            return fText(target);
          }),
        },
        constraints: [{
          test: (v) => {
            const base = op === '+' ? fAdd(fv(v, 'x'), fv(v, 'y')) : fSub(fv(v, 'x'), fv(v, 'y'));
            const target = parseF(String(v.z));
            return base.n > 0 && base.n < base.d && target.n > 0 && target.n < target.d && nd(v, 'x')[1] !== nd(v, 'y')[1];
          },
          note: 'proper positive sum or difference, a proper comparison fraction',
        }],
        optionCount: 3,
        answer: (v) => comp(op === '+' ? fAdd(fv(v, 'x'), fv(v, 'y')) : fSub(fv(v, 'x'), fv(v, 'y')), parseF(String(v.z))),
        options: () => SIGNS,
        why: (v, a) => `${String(v.x)} ${op} ${String(v.y)} = ${fText(op === '+' ? fAdd(fv(v, 'x'), fv(v, 'y')) : fSub(fv(v, 'x'), fv(v, 'y')))}; ${fText(op === '+' ? fAdd(fv(v, 'x'), fv(v, 'y')) : fSub(fv(v, 'x'), fv(v, 'y')))} ${a} ${String(v.z)}.`,
      }),
    ),
  ),
  t({
    sub: 'u04-07',
    d: 2,
    prompt: 'შეადარე: {x} + {y} □ {z} ' + MINUS + ' {w}.',
    vars: { x: C(P212), y: C(P212), z: C(P212), w: C(P212) },
    constraints: [{
      test: (v) => fCmp(fv(v, 'z'), fv(v, 'w')) > 0 && Math.abs(val(fAdd(fv(v, 'x'), fv(v, 'y'))) - val(fSub(fv(v, 'z'), fv(v, 'w')))) < 0.25,
      note: 'close, positive',
    }],
    optionCount: 3,
    answer: (v) => comp(fAdd(fv(v, 'x'), fv(v, 'y')), fSub(fv(v, 'z'), fv(v, 'w'))),
    options: () => SIGNS,
    why: (v, a) => `${fText(fAdd(fv(v, 'x'), fv(v, 'y')))} ${a} ${fText(fSub(fv(v, 'z'), fv(v, 'w')))}.`,
  }),
  t({
    sub: 'u04-07',
    d: 2,
    prompt: 'შეადარე: {x} + {y} □ {z} + {w}.',
    vars: { x: C(P212), y: C(P212), z: C(P212), w: C(P212) },
    constraints: [{ test: (v) => Math.abs(val(fAdd(fv(v, 'x'), fv(v, 'y'))) - val(fAdd(fv(v, 'z'), fv(v, 'w')))) < 0.2, note: 'close sums' }],
    optionCount: 3,
    answer: (v) => comp(fAdd(fv(v, 'x'), fv(v, 'y')), fAdd(fv(v, 'z'), fv(v, 'w'))),
    options: () => SIGNS,
    why: (v, a) => `${fText(fAdd(fv(v, 'x'), fv(v, 'y')))} ${a} ${fText(fAdd(fv(v, 'z'), fv(v, 'w')))}.`,
  }),

  // ═════════ U04.8 — შერეული რიცხვების შეკრება და გამოკლება ═════════
  ...([
    { op: '+', same: true, note: 'same denominators, no carry', d: 1 as const, ok: (a: Frac, b: Frac, ra: Frac, rb: Frac) => a.d === b.d && fAdd(ra, rb).n < fAdd(ra, rb).d },
    { op: '-', same: true, note: 'same denominators, no borrow', d: 1 as const, ok: (a: Frac, b: Frac, ra: Frac, rb: Frac) => a.d === b.d && fCmp(a, b) > 0 && fCmp(ra, rb) >= 0 },
    { op: '+', same: false, note: 'unlike denominators, no carry', d: 2 as const, ok: (a: Frac, b: Frac, ra: Frac, rb: Frac) => a.d !== b.d && fAdd(ra, rb).n < fAdd(ra, rb).d },
    { op: '+', same: false, note: 'unlike denominators, with carry', d: 2 as const, ok: (a: Frac, b: Frac, ra: Frac, rb: Frac) => a.d !== b.d && fAdd(ra, rb).n > fAdd(ra, rb).d },
    { op: '-', same: false, note: 'unlike denominators, no borrow', d: 2 as const, ok: (a: Frac, b: Frac, ra: Frac, rb: Frac) => a.d !== b.d && fCmp(a, b) > 0 && fCmp(ra, rb) > 0 },
    { op: '-', same: false, note: 'unlike denominators, with borrow', d: 2 as const, ok: (a: Frac, b: Frac, ra: Frac, rb: Frac) => a.d !== b.d && fCmp(a, b) > 0 && fCmp(ra, rb) < 0 },
  ] as const).map(({ op, note, d, ok }) =>
    t({
      sub: 'u04-08',
      d,
      prompt: 'გამოთვალე: {x} ' + (op === '+' ? '+' : MINUS) + ' {y}.',
      vars: { x: C(M), y: C(M) },
      constraints: [{
        test: (v) => {
          const a = fv(v, 'x'), b = fv(v, 'y');
          const [wa, na, da] = wnd(v, 'x'), [wb, nb, db] = wnd(v, 'y');
          return ok(a, b, frac(na, da), frac(nb, db)) && wa + wb > 0 && (op === '+' || wa >= wb);
        },
        note,
      }],
      answer: (v) => W(op === '+' ? fAdd(fv(v, 'x'), fv(v, 'y')) : fSub(fv(v, 'x'), fv(v, 'y'))),
      options: (v, right) => {
        const [wa, na, da] = wnd(v, 'x'), [wb, nb, db] = wnd(v, 'y');
        const r = op === '+' ? fAdd(fv(v, 'x'), fv(v, 'y')) : fSub(fv(v, 'x'), fv(v, 'y'));
        const wholes = op === '+' ? wa + wb : wa - wb;
        const parts = op === '+' ? fAdd(frac(na, da), frac(nb, db)) : fSub(frac(na, da), frac(nb, db));
        const out = [right];
        if (parts.n > 0) out.push(W(fr(wholes * parts.d + Math.abs(parts.n), parts.d)));
        out.push(W(fr(wholes * 1 + 1, 1)));
        out.push(...fracSlips(r, [fr(op === '+' ? na + nb : Math.abs(na - nb), op === '+' ? da + db : Math.abs(da - db) || 1)]));
        if (r.n > r.d) out.push(W(fr(r.n + r.d, r.d)), W(fr(r.n - r.d, r.d)));
        return out;
      },
      why: (v, a) => `${String(v.x)} ${op === '+' ? '+' : MINUS} ${String(v.y)} = ${a}.`,
    }),
  ),

  // ═════════ U04.9 — შერეული რიცხვების ჯამისა და სხვაობის მიახლოებითი შეფასება ═════════
  ...(['+', MINUS] as const).flatMap((op) =>
    [1, 2].map((variant) =>
      t({
        sub: 'u04-09',
        d: variant === 1 ? 1 : 2,
        prompt: 'შეაფასე {x} ' + (op === '+' ? '+' : MINUS) + ' {y} უახლოეს მთელ რიცხვამდე დამრგვალებით.',
        vars: { x: C(variant === 1 ? M : M12), y: C(variant === 1 ? M : M12) },
        constraints: [{
          test: (v) => !isHalf(fv(v, 'x')) && !isHalf(fv(v, 'y')) && (op === '+' || (roundWhole(fv(v, 'x')) > roundWhole(fv(v, 'y')) && val(fv(v, 'x')) > val(fv(v, 'y')))),
          note: 'no halfway rounding; a positive estimate',
        }],
        answer: (v) => sg(op === '+' ? roundWhole(fv(v, 'x')) + roundWhole(fv(v, 'y')) : roundWhole(fv(v, 'x')) - roundWhole(fv(v, 'y'))),
        wrong: (v) => {
          const [wa] = wnd(v, 'x'), [wb] = wnd(v, 'y');
          const ra = roundWhole(fv(v, 'x')), rb = roundWhole(fv(v, 'y'));
          const key = op === '+' ? ra + rb : ra - rb;
          return [op === '+' ? wa + wb : wa - wb, op === '+' ? wa + wb + 2 : wa - wb + 1, key + 1, key - 1, key + 2, Math.round(val(op === '+' ? fAdd(fv(v, 'x'), fv(v, 'y')) : fSub(fv(v, 'x'), fv(v, 'y'))) * 10)];
        },
        why: (v, a) => `${roundWhole(fv(v, 'x'))} ${op} ${roundWhole(fv(v, 'y'))} = ${a}.`,
      }),
    ),
  ),
  t({
    sub: 'u04-09',
    d: 2,
    prompt: 'მიახლოებით რამდენია {x} + {y}, თუ თითოეულ შესაკრებს უახლოეს მთელ რიცხვამდე დავამრგვალებთ?',
    vars: { x: C(M12), y: C(M12) },
    constraints: [{ test: (v) => !isHalf(fv(v, 'x')) && !isHalf(fv(v, 'y')) && roundWhole(fv(v, 'x')) + roundWhole(fv(v, 'y')) !== wnd(v, 'x')[0] + wnd(v, 'y')[0], note: 'rounding matters' }],
    answer: (v) => sg(roundWhole(fv(v, 'x')) + roundWhole(fv(v, 'y'))),
    wrong: (v) => {
      const k = roundWhole(fv(v, 'x')) + roundWhole(fv(v, 'y'));
      return [wnd(v, 'x')[0] + wnd(v, 'y')[0], k + 1, k - 1, k + 2, k + 10];
    },
    why: (v, a) => `${roundWhole(fv(v, 'x'))} + ${roundWhole(fv(v, 'y'))} = ${a}.`,
  }),

  // ═════════ U04.10 — წილადის გამრავლება მთელ რიცხვზე ═════════
  t({
    sub: 'u04-10',
    prompt: 'გამოთვალე: {f} × {k}.',
    vars: { f: C(P29), k: I(2, 9) },
    constraints: [{ test: (v) => N(v, 'k') % nd(v, 'f')[1] !== 0, note: 'not a whole result' }],
    answer: (v) => W(fMul(fv(v, 'f'), frac(N(v, 'k'), 1))),
    options: (v, right) => [right, ...fracSlips(fMul(fv(v, 'f'), frac(N(v, 'k'), 1)), [frac(nd(v, 'f')[0], nd(v, 'f')[1] * N(v, 'k')), frac(nd(v, 'f')[0] * N(v, 'k'), nd(v, 'f')[1] * N(v, 'k') + 1)])],
    why: (v, a) => `${String(v.f)} × ${N(v, 'k')} = ${nd(v, 'f')[0]} × ${N(v, 'k')}/${nd(v, 'f')[1]} = ${a}.`,
  }),
  t({
    sub: 'u04-10',
    prompt: 'გამოთვალე: {f} × {k}.',
    vars: { f: C(P212), m: I(2, 6), k: D((v) => nd(v, 'f')[1] * N(v, 'm')) },
    answer: (v) => W(fMul(fv(v, 'f'), frac(N(v, 'k'), 1))),
    wrong: (v) => {
      const r = fMul(fv(v, 'f'), frac(N(v, 'k'), 1));
      return [r.n / r.d + 1, r.n / r.d - 1, nd(v, 'f')[0] + N(v, 'm'), N(v, 'k') - nd(v, 'f')[0], r.n / r.d * 10];
    },
    why: (v, a) => `${N(v, 'k')} ÷ ${nd(v, 'f')[1]} = ${N(v, 'm')}, ${N(v, 'm')} × ${nd(v, 'f')[0]} = ${a}.`,
  }),
  t({
    sub: 'u04-10',
    d: 2,
    prompt: 'გამოთვალე: {f} × {k}.',
    vars: { f: C(P212), k: I(5, 30) },
    constraints: [{ test: (v) => { const r = fMul(fv(v, 'f'), frac(N(v, 'k'), 1)); return r.d !== 1 && N(v, 'k') % nd(v, 'f')[1] !== 0; }, note: 'a mixed result' }],
    answer: (v) => W(fMul(fv(v, 'f'), frac(N(v, 'k'), 1))),
    options: (v, right) => [right, ...fracSlips(fMul(fv(v, 'f'), frac(N(v, 'k'), 1)), [frac(nd(v, 'f')[0], nd(v, 'f')[1] * N(v, 'k')), frac(nd(v, 'f')[0] * N(v, 'k'), nd(v, 'f')[1] * N(v, 'k') + 1)])],
    why: (v, a) => `${String(v.f)} × ${N(v, 'k')} = ${nd(v, 'f')[0] * N(v, 'k')}/${nd(v, 'f')[1]} = ${a}.`,
  }),
  t({
    sub: 'u04-10',
    prompt: 'ერთი ქსოვილის ნაჭერი {k} მეტრია. რამდენი მეტრია მისი {f} ნაწილი?',
    vars: { f: C(P212), m: I(2, 5), k: D((v) => nd(v, 'f')[1] * N(v, 'm')) },
    answer: (v) => `${sg(nd(v, 'f')[0] * N(v, 'm'))} მ`,
    wrong: (v) => {
      const r = nd(v, 'f')[0] * N(v, 'm');
      return [r + N(v, 'm'), r - 1, r + 1, N(v, 'k') - r, r * 2].map((x) => `${sg(x)} მ`);
    },
    why: (v, a) => `${N(v, 'k')} × ${String(v.f)} = ${N(v, 'k')} ÷ ${nd(v, 'f')[1]} × ${nd(v, 'f')[0]} = ${a}.`,
  }),
  t({
    sub: 'u04-10',
    d: 2,
    prompt: 'ბიდონში {k} ლიტრი წყალია. მისი {f} ნაწილი გამოიყენეს. რამდენი ლიტრი გამოიყენეს?',
    vars: { f: C(P212), k: I(5, 30) },
    constraints: [{ test: (v) => fMul(fv(v, 'f'), frac(N(v, 'k'), 1)).d !== 1, note: 'a fractional amount' }],
    answer: (v) => `${W(fMul(fv(v, 'f'), frac(N(v, 'k'), 1)))} ლ`,
    options: (v, right) => [right, ...fracSlips(fMul(fv(v, 'f'), frac(N(v, 'k'), 1)), [frac(nd(v, 'f')[0], nd(v, 'f')[1] * N(v, 'k'))]).map((x) => `${x} ლ`)],
    why: (v, a) => `${N(v, 'k')} × ${String(v.f)} = ${a}.`,
  }),

  // ═════════ U04.11 — ორი ან მეტი წილადის ნამრავლი ═════════
  t({
    sub: 'u04-11',
    prompt: 'გამოთვალე: {x} × {y}.',
    vars: two(P29),
    answer: (v) => W(fMul(fv(v, 'x'), fv(v, 'y'))),
    options: (v, right) => [right, ...fracSlips(fMul(fv(v, 'x'), fv(v, 'y')), [fAdd(fv(v, 'x'), fv(v, 'y')), frac(nd(v, 'x')[0] + nd(v, 'y')[0], nd(v, 'x')[1] + nd(v, 'y')[1])])],
    why: (v, a) => `${String(v.x)} × ${String(v.y)} = ${a}.`,
  }),
  t({
    sub: 'u04-11',
    d: 2,
    prompt: 'გამოთვალე: {x} × {y}.',
    vars: two(P212),
    constraints: [{ test: (v) => gcd(nd(v, 'x')[0], nd(v, 'y')[1]) > 1 || gcd(nd(v, 'y')[0], nd(v, 'x')[1]) > 1, note: 'cross-cancelling' }],
    answer: (v) => W(fMul(fv(v, 'x'), fv(v, 'y'))),
    options: (v, right) => [right, ...fracSlips(fMul(fv(v, 'x'), fv(v, 'y')), [fAdd(fv(v, 'x'), fv(v, 'y')), frac(nd(v, 'x')[0] + nd(v, 'y')[0], nd(v, 'x')[1] + nd(v, 'y')[1])])],
    why: (v, a) => `${String(v.x)} × ${String(v.y)} = ${a}.`,
  }),
  t({
    sub: 'u04-11',
    d: 2,
    prompt: 'გამოთვალე: {x} × {y} × {z}.',
    vars: { x: C(P212), y: C(P212), z: C(P212) },
    constraints: [{ test: (v) => { const r = fMul(fMul(fv(v, 'x'), fv(v, 'y')), fv(v, 'z')); return r.d <= 40; }, note: 'a small denominator' }],
    answer: (v) => W(fMul(fMul(fv(v, 'x'), fv(v, 'y')), fv(v, 'z'))),
    options: (v, right) => [right, ...fracSlips(fMul(fMul(fv(v, 'x'), fv(v, 'y')), fv(v, 'z')), [fMul(fv(v, 'x'), fv(v, 'y')), fMul(fv(v, 'y'), fv(v, 'z'))])],
    why: (v, a) => `${String(v.x)} × ${String(v.y)} × ${String(v.z)} = ${a}.`,
  }),
  t({
    sub: 'u04-11',
    prompt: 'გამოთვალე: {x} × {y}.',
    vars: two(P212),
    constraints: [{ test: (v) => fMul(fv(v, 'x'), fv(v, 'y')).d <= 50, note: 'a small denominator' }],
    answer: (v) => W(fMul(fv(v, 'x'), fv(v, 'y'))),
    options: (v, right) => [right, ...fracSlips(fMul(fv(v, 'x'), fv(v, 'y')), [fAdd(fv(v, 'x'), fv(v, 'y')), frac(nd(v, 'x')[0] + nd(v, 'y')[0], nd(v, 'x')[1] + nd(v, 'y')[1])])],
    why: (v, a) => `${String(v.x)} × ${String(v.y)} = ${a}.`,
  }),
  t({
    sub: 'u04-11',
    d: 2,
    prompt: 'გამოთვალე: {x} × {y} × {z}.',
    vars: { x: C(P29), y: C(P29), z: C(P29) },
    constraints: [{ test: (v) => fMul(fMul(fv(v, 'x'), fv(v, 'y')), fv(v, 'z')).d <= 30, note: 'small result' }],
    answer: (v) => W(fMul(fMul(fv(v, 'x'), fv(v, 'y')), fv(v, 'z'))),
    options: (v, right) => [right, ...fracSlips(fMul(fMul(fv(v, 'x'), fv(v, 'y')), fv(v, 'z')), [fMul(fv(v, 'x'), fv(v, 'y')), fMul(fv(v, 'y'), fv(v, 'z'))])],
    why: (v, a) => `${String(v.x)} × ${String(v.y)} × ${String(v.z)} = ${a}.`,
  }),

  // ═════════ U04.12 — წილადების ნამრავლის მიახლოებითი შეფასება ═════════
  t({
    sub: 'u04-12',
    prompt: 'შეაფასე {x} × {y}, თითოეული წილადის უახლოეს მთელ რიცხვამდე დამრგვალებით.',
    vars: two(P212),
    constraints: [{ test: (v) => !isHalf(fv(v, 'x')) && !isHalf(fv(v, 'y')), note: 'no halfway rounding' }],
    answer: (v) => sg(roundWhole(fv(v, 'x')) * roundWhole(fv(v, 'y'))),
    wrong: (v) => [1 - roundWhole(fv(v, 'x')) * roundWhole(fv(v, 'y')), 2, 10, 3, roundWhole(fv(v, 'x')) + roundWhole(fv(v, 'y')) + 1],
    why: (v, a) => `${roundWhole(fv(v, 'x'))} × ${roundWhole(fv(v, 'y'))} = ${a}.`,
  }),
  t({
    sub: 'u04-12',
    d: 2,
    prompt: 'შეაფასე {x} × {y}, პირველი რიცხვის უახლოეს მთელ რიცხვამდე დამრგვალებით.',
    vars: { x: C(M12), y: C(P212) },
    constraints: [{ test: (v) => !isHalf(fv(v, 'x')) && roundWhole(fv(v, 'x')) !== wnd(v, 'x')[0] + 0 * 0 + 0 && true, note: 'the first number rounds up' }],
    answer: (v) => W(fMul(frac(roundWhole(fv(v, 'x')), 1), fv(v, 'y'))),
    options: (v, right) => [right, ...fracSlips(fMul(frac(roundWhole(fv(v, 'x')), 1), fv(v, 'y')), [fMul(frac(wnd(v, 'x')[0], 1), fv(v, 'y')), fMul(fv(v, 'x'), fv(v, 'y'))])],
    why: (v, a) => `${roundWhole(fv(v, 'x'))} × ${String(v.y)} = ${a}.`,
  }),
  t({
    sub: 'u04-12',
    d: 2,
    prompt: 'შეაფასე {x} × {y}, ორივე შერეული რიცხვის უახლოეს მთელ რიცხვამდე დამრგვალებით.',
    vars: { x: C(M12), y: C(M12) },
    constraints: [{ test: (v) => !isHalf(fv(v, 'x')) && !isHalf(fv(v, 'y')), note: 'no halfway rounding' }],
    answer: (v) => sg(roundWhole(fv(v, 'x')) * roundWhole(fv(v, 'y'))),
    wrong: (v) => {
      const k = roundWhole(fv(v, 'x')) * roundWhole(fv(v, 'y'));
      return [wnd(v, 'x')[0] * wnd(v, 'y')[0], (wnd(v, 'x')[0] + 1) * (wnd(v, 'y')[0] + 1), k + 1, k - 1, k + 5];
    },
    why: (v, a) => `${roundWhole(fv(v, 'x'))} × ${roundWhole(fv(v, 'y'))} = ${a}.`,
  }),
  t({
    sub: 'u04-12',
    prompt: 'შეაფასე {x} × {y}, თითოეული წილადის უახლოეს მთელ რიცხვამდე დამრგვალებით.',
    vars: two(P220),
    constraints: [{ test: (v) => !isHalf(fv(v, 'x')) && !isHalf(fv(v, 'y')) && nd(v, 'x')[1] !== 10 * 0 + 2 && nd(v, 'y')[1] !== 2, note: 'no halfway rounding' }],
    answer: (v) => sg(roundWhole(fv(v, 'x')) * roundWhole(fv(v, 'y'))),
    wrong: (v) => [1 - roundWhole(fv(v, 'x')) * roundWhole(fv(v, 'y')), 2, 10, 3, roundWhole(fv(v, 'x')) + roundWhole(fv(v, 'y')) + 1],
    why: (v, a) => `${roundWhole(fv(v, 'x'))} × ${roundWhole(fv(v, 'y'))} = ${a}.`,
  }),

  // ═════════ U04.13 — შერეული რიცხვების ნამრავლი ═════════
  t({
    sub: 'u04-13',
    prompt: 'გამოთვალე: {x} × {k}.',
    vars: { x: C(M), k: I(2, 6) },
    answer: (v) => W(fMul(fv(v, 'x'), frac(N(v, 'k'), 1))),
    options: (v, right) => {
      const [w, n, d] = wnd(v, 'x');
      const k = N(v, 'k');
      return [right, ...fracSlips(fMul(fv(v, 'x'), frac(k, 1)), [frac(w * k * d + n, d), frac(w * k * d + n * k, d + k)])].concat([mixedText(w * k, n, d)]);
    },
    why: (v, a) => `${String(v.x)} = ${fText(fv(v, 'x'))}; ${fText(fv(v, 'x'))} × ${N(v, 'k')} = ${a}.`,
  }),
  t({
    sub: 'u04-13',
    d: 2,
    prompt: 'გამოთვალე: {x} × {y}.',
    vars: { x: C(mixedPool(4, 2, 6)), y: C(mixedPool(3, 2, 6)) },
    answer: (v) => W(fMul(fv(v, 'x'), fv(v, 'y'))),
    options: (v, right) => {
      const [wa, na, da] = wnd(v, 'x'), [wb, nb, db] = wnd(v, 'y');
      const r = fMul(fv(v, 'x'), fv(v, 'y'));
      return [right, W(fr(wa * wb, 1)) === right ? '' : mixedText(wa * wb, na * nb, da * db), ...fracSlips(r, [fMul(frac(na, da), frac(nb, db)), fAdd(fv(v, 'x'), fv(v, 'y'))])].filter(Boolean);
    },
    why: (v, a) => `${fText(fv(v, 'x'))} × ${fText(fv(v, 'y'))} = ${a}.`,
  }),
  t({
    sub: 'u04-13',
    d: 2,
    prompt: 'გამოთვალე: {x} × {y}.',
    vars: { x: C(mixedPool(5, 2, 8)), y: C(mixedPool(3, 2, 8)) },
    constraints: [{ test: (v) => fMul(fv(v, 'x'), fv(v, 'y')).d <= 40, note: 'a small denominator' }],
    answer: (v) => W(fMul(fv(v, 'x'), fv(v, 'y'))),
    options: (v, right) => {
      const [wa, na, da] = wnd(v, 'x'), [wb, nb, db] = wnd(v, 'y');
      const r = fMul(fv(v, 'x'), fv(v, 'y'));
      return [right, mixedText(wa * wb, na * nb, da * db), ...fracSlips(r, [fMul(frac(na, da), frac(nb, db)), fAdd(fv(v, 'x'), fv(v, 'y'))])];
    },
    why: (v, a) => `${fText(fv(v, 'x'))} × ${fText(fv(v, 'y'))} = ${a}.`,
  }),
  t({
    sub: 'u04-13',
    prompt: 'გამოთვალე: {x} × {k}.',
    vars: { x: C(M12), k: I(2, 9) },
    constraints: [{ test: (v) => fMul(fv(v, 'x'), frac(N(v, 'k'), 1)).d !== 1, note: 'not a whole result' }],
    answer: (v) => W(fMul(fv(v, 'x'), frac(N(v, 'k'), 1))),
    options: (v, right) => {
      const [w, n, d] = wnd(v, 'x');
      const k = N(v, 'k');
      return [right, ...fracSlips(fMul(fv(v, 'x'), frac(k, 1)), [frac(w * k * d + n, d)]), mixedText(w * k, n, d)];
    },
    why: (v, a) => `${String(v.x)} = ${fText(fv(v, 'x'))}; ${fText(fv(v, 'x'))} × ${N(v, 'k')} = ${a}.`,
  }),
  t({
    sub: 'u04-13',
    d: 2,
    prompt: 'მაღაზიაში {k} ყუთია, თითოეულში {x} კგ ვაშლი. რამდენი კილოგრამი ვაშლია სულ?',
    vars: { x: C(M), k: I(2, 8) },
    answer: (v) => `${W(fMul(fv(v, 'x'), frac(N(v, 'k'), 1)))} კგ`,
    options: (v, right) => [right, ...fracSlips(fMul(fv(v, 'x'), frac(N(v, 'k'), 1)), [frac(wnd(v, 'x')[0] * N(v, 'k') * wnd(v, 'x')[2] + wnd(v, 'x')[1], wnd(v, 'x')[2])]).map((x) => `${x} კგ`)],
    why: (v, a) => `${N(v, 'k')} × ${String(v.x)} = ${a}.`,
  }),
  t({
    sub: 'u04-13',
    d: 2,
    prompt: 'გამოთვალე: {x} × {y}.',
    vars: { x: C(mixedPool(3, 2, 5)), y: C(mixedPool(3, 2, 5)) },
    answer: (v) => W(fMul(fv(v, 'x'), fv(v, 'y'))),
    options: (v, right) => {
      const [wa, na, da] = wnd(v, 'x'), [wb, nb, db] = wnd(v, 'y');
      const r = fMul(fv(v, 'x'), fv(v, 'y'));
      return [right, mixedText(wa * wb, na * nb, da * db), ...fracSlips(r, [fMul(frac(na, da), frac(nb, db)), fAdd(fv(v, 'x'), fv(v, 'y'))])];
    },
    why: (v, a) => `${fText(fv(v, 'x'))} × ${fText(fv(v, 'y'))} = ${a}.`,
  }),

  // ═════════ U04.14 — შებრუნებული წილადები ═════════
  t({
    sub: 'u04-14',
    prompt: 'იპოვე {f}-ის შებრუნებული წილადი.',
    vars: { f: C(P212) },
    answer: (v) => `${nd(v, 'f')[1]}/${nd(v, 'f')[0]}`,
    options: (v, right) => [right, String(v.f), `${MINUS}${nd(v, 'f')[1]}/${nd(v, 'f')[0]}`, `${nd(v, 'f')[0]}/${nd(v, 'f')[1] + 1}`, `${nd(v, 'f')[1] + 1}/${nd(v, 'f')[0]}`],
    why: (v, a) => `მრიცხველი და მნიშვნელი ადგილებს ცვლის: ${String(v.f)}-ის შებრუნებულია ${a}.`,
  }),
  t({
    sub: 'u04-14',
    prompt: 'იპოვე {f}-ის შებრუნებული წილადი.',
    vars: { n: I(6, 19), d: I(2, 9), f: D((v) => `${N(v, 'n')}/${N(v, 'd')}`) },
    constraints: [{ test: (v) => N(v, 'n') > N(v, 'd') && gcd(N(v, 'n'), N(v, 'd')) === 1, note: 'an improper fraction in lowest terms' }],
    answer: (v) => `${N(v, 'd')}/${N(v, 'n')}`,
    options: (v, right) => [right, String(v.f), `${MINUS}${N(v, 'd')}/${N(v, 'n')}`, `${N(v, 'n')}/${N(v, 'd') + 1}`, `${N(v, 'd') + 1}/${N(v, 'n')}`],
    why: (v, a) => `${String(v.f)}-ის შებრუნებულია ${a}.`,
  }),
  t({
    sub: 'u04-14',
    prompt: 'იპოვე {k}-ის შებრუნებული რიცხვი.',
    vars: { k: I(2, 20) },
    answer: (v) => `1/${N(v, 'k')}`,
    options: (v, right) => [right, String(N(v, 'k')), `${MINUS}1/${N(v, 'k')}`, `1/${N(v, 'k') + 1}`, `${N(v, 'k')}/1${'0'.repeat(0)}`.replace(/\/1$/, '') + '/' + (N(v, 'k') + 1)],
    why: (v, a) => `${N(v, 'k')} = ${N(v, 'k')}/1, ამიტომ შებრუნებულია ${a}.`,
  }),
  t({
    sub: 'u04-14',
    prompt: 'რომელი წილადის შებრუნებული წილადია {f}?',
    vars: { f: C(P212) },
    answer: (v) => `${nd(v, 'f')[1]}/${nd(v, 'f')[0]}`,
    options: (v, right) => [right, String(v.f), `${MINUS}${nd(v, 'f')[1]}/${nd(v, 'f')[0]}`, `${nd(v, 'f')[1]}/${nd(v, 'f')[0] + 1}`, `${nd(v, 'f')[1] + 1}/${nd(v, 'f')[0]}`],
    why: (_v, a) => `შებრუნებული წილადები ადგილებს უცვლის მრიცხველსა და მნიშვნელს: ${a}.`,
  }),
  t({
    sub: 'u04-14',
    prompt: 'შეავსე ტოლობა: {f} × □ = 1.',
    vars: { f: C(P212) },
    answer: (v) => `${nd(v, 'f')[1]}/${nd(v, 'f')[0]}`,
    options: (v, right) => [right, String(v.f), '1', '0', `${nd(v, 'f')[1]}/${nd(v, 'f')[0] + 1}`],
    why: (_v, a) => `ნამრავლი 1-ის ტოლია, თუ მამრავლები ურთიერთშებრუნებულია: □ = ${a}.`,
  }),
  t({
    sub: 'u04-14',
    d: 2,
    prompt: 'იპოვე {x}-ის შებრუნებული რიცხვი.',
    vars: { x: C(M) },
    answer: (v) => fText(frac(fv(v, 'x').d, fv(v, 'x').n)),
    options: (v, right) => {
      const [w, n, d] = wnd(v, 'x');
      return [right, `${d}/${n} ${w}`.replace(/ \d+$/, ''), `${w * d + n}/${d}`, `${d}/${w}`, `${d}/${w * d + n + 1}`, `${w * d + n}/${d + 1}`];
    },
    why: (v, a) => `${String(v.x)} = ${fText(fv(v, 'x'))}, ამიტომ შებრუნებულია ${a}.`,
  }),

  // ═════════ U04.15 — წილადების გაყოფა მთელ რიცხვებზე ═════════
  t({
    sub: 'u04-15',
    prompt: 'გამოთვალე: {f} ÷ {k}.',
    vars: { f: C(P212), k: I(2, 9) },
    answer: (v) => W(fDiv(fv(v, 'f'), frac(N(v, 'k'), 1))),
    options: (v, right) => [right, ...fracSlips(fDiv(fv(v, 'f'), frac(N(v, 'k'), 1)), [fMul(fv(v, 'f'), frac(N(v, 'k'), 1)), frac(nd(v, 'f')[0] / 1, nd(v, 'f')[1] + N(v, 'k')), frac(nd(v, 'f')[0] + 1, nd(v, 'f')[1] * N(v, 'k'))])],
    why: (v, a) => `${String(v.f)} ÷ ${N(v, 'k')} = ${String(v.f)} × 1/${N(v, 'k')} = ${a}.`,
  }),
  t({
    sub: 'u04-15',
    prompt: 'გამოთვალე: {a}/{b} ÷ {k}.',
    vars: { k: I(2, 9), m: I(1, 5), b: I(3, 12), a: D((v) => N(v, 'k') * N(v, 'm')) },
    constraints: [{ test: (v) => N(v, 'a') < N(v, 'b') && gcd(N(v, 'a'), N(v, 'b')) === 1 && N(v, 'm') !== 0, note: 'a divides evenly' }],
    answer: (v) => W(frac(N(v, 'm'), N(v, 'b'))),
    options: (v, right) => [right, ...fracSlips(frac(N(v, 'm'), N(v, 'b')), [frac(N(v, 'a'), N(v, 'b') * N(v, 'k')), frac(N(v, 'a') * N(v, 'k'), N(v, 'b'))])],
    why: (v, a) => `მრიცხველი ${N(v, 'k')}-ზე იყოფა: ${N(v, 'a')} ÷ ${N(v, 'k')} = ${N(v, 'm')}, ამიტომ ${a}.`,
  }),
  t({
    sub: 'u04-15',
    d: 2,
    prompt: 'გამოთვალე: {f} ÷ {k}.',
    vars: { f: C(P212), k: I(3, 12) },
    constraints: [{ test: (v) => fDiv(fv(v, 'f'), frac(N(v, 'k'), 1)).d <= 60, note: 'a small denominator' }],
    answer: (v) => W(fDiv(fv(v, 'f'), frac(N(v, 'k'), 1))),
    options: (v, right) => [right, ...fracSlips(fDiv(fv(v, 'f'), frac(N(v, 'k'), 1)), [fMul(fv(v, 'f'), frac(N(v, 'k'), 1)), frac(nd(v, 'f')[0], nd(v, 'f')[1] + N(v, 'k')), frac(nd(v, 'f')[0] + 1, nd(v, 'f')[1] * N(v, 'k'))])],
    why: (v, a) => `${String(v.f)} ÷ ${N(v, 'k')} = ${a}.`,
  }),
  t({
    sub: 'u04-15',
    prompt: '{f} მეტრი ლენტი თანაბრად გაჭრეს {k} ნაწილად. რამდენი მეტრია თითოეული ნაწილი?',
    vars: { f: C(P212), k: I(2, 8) },
    answer: (v) => `${W(fDiv(fv(v, 'f'), frac(N(v, 'k'), 1)))} მ`,
    options: (v, right) => [right, ...fracSlips(fDiv(fv(v, 'f'), frac(N(v, 'k'), 1)), [fMul(fv(v, 'f'), frac(N(v, 'k'), 1)), frac(nd(v, 'f')[0], nd(v, 'f')[1] + N(v, 'k'))]).map((x) => `${x} მ`)],
    why: (v, a) => `${String(v.f)} ÷ ${N(v, 'k')} = ${a}.`,
  }),
  t({
    sub: 'u04-15',
    d: 2,
    prompt: 'ბოთლში {f} ლიტრი წვენია. იგი თანაბრად დაუყვეს {k} ბავშვს. რამდენი ლიტრი ხვდება თითოეულს?',
    vars: { f: C(P212), k: I(2, 8) },
    answer: (v) => `${W(fDiv(fv(v, 'f'), frac(N(v, 'k'), 1)))} ლ`,
    options: (v, right) => [right, ...fracSlips(fDiv(fv(v, 'f'), frac(N(v, 'k'), 1)), [fMul(fv(v, 'f'), frac(N(v, 'k'), 1)), frac(nd(v, 'f')[0], nd(v, 'f')[1] + N(v, 'k'))]).map((x) => `${x} ლ`)],
    why: (v, a) => `${String(v.f)} ÷ ${N(v, 'k')} = ${a}.`,
  }),

  // ═════════ U04.16 — წილადებისა და შერეული რიცხვების გაყოფა ═════════
  t({
    sub: 'u04-16',
    prompt: 'გამოთვალე: {x} ÷ {y}.',
    vars: two(P29),
    answer: (v) => W(fDiv(fv(v, 'x'), fv(v, 'y'))),
    options: (v, right) => [right, ...fracSlips(fDiv(fv(v, 'x'), fv(v, 'y')), [fMul(fv(v, 'x'), fv(v, 'y')), fDiv(fv(v, 'y'), fv(v, 'x')), frac(nd(v, 'x')[0] * nd(v, 'y')[0], nd(v, 'x')[1] * nd(v, 'y')[1] + 1)])],
    why: (v, a) => `გაყოფა შებრუნებულზე გამრავლებაა: ${String(v.x)} × ${nd(v, 'y')[1]}/${nd(v, 'y')[0]} = ${a}.`,
  }),
  t({
    sub: 'u04-16',
    d: 2,
    prompt: 'გამოთვალე: {x} ÷ {y}.',
    vars: two(P212),
    constraints: [{ test: (v) => fDiv(fv(v, 'x'), fv(v, 'y')).d <= 60, note: 'a small denominator' }],
    answer: (v) => W(fDiv(fv(v, 'x'), fv(v, 'y'))),
    options: (v, right) => [right, ...fracSlips(fDiv(fv(v, 'x'), fv(v, 'y')), [fMul(fv(v, 'x'), fv(v, 'y')), fDiv(fv(v, 'y'), fv(v, 'x')), frac(nd(v, 'x')[0] * nd(v, 'y')[0], nd(v, 'x')[1] * nd(v, 'y')[1] + 1)])],
    why: (v, a) => `${String(v.x)} × ${nd(v, 'y')[1]}/${nd(v, 'y')[0]} = ${a}.`,
  }),
  t({
    sub: 'u04-16',
    d: 2,
    prompt: 'გამოთვალე: {x} ÷ {y}.',
    vars: { x: C(M), y: C(P29) },
    constraints: [{ test: (v) => fDiv(fv(v, 'x'), fv(v, 'y')).d <= 40, note: 'small denominator' }],
    answer: (v) => W(fDiv(fv(v, 'x'), fv(v, 'y'))),
    options: (v, right) => [right, ...fracSlips(fDiv(fv(v, 'x'), fv(v, 'y')), [fMul(fv(v, 'x'), fv(v, 'y')), fDiv(fv(v, 'y'), fv(v, 'x'))])],
    why: (v, a) => `${String(v.x)} = ${fText(fv(v, 'x'))}; ${fText(fv(v, 'x'))} ÷ ${String(v.y)} = ${a}.`,
  }),
  t({
    sub: 'u04-16',
    d: 2,
    prompt: 'გამოთვალე: {x} ÷ {y}.',
    vars: { x: C(mixedPool(5, 2, 6)), y: C(mixedPool(3, 2, 6)) },
    constraints: [{ test: (v) => fDiv(fv(v, 'x'), fv(v, 'y')).d <= 40, note: 'small denominator' }],
    answer: (v) => W(fDiv(fv(v, 'x'), fv(v, 'y'))),
    options: (v, right) => [right, ...fracSlips(fDiv(fv(v, 'x'), fv(v, 'y')), [fMul(fv(v, 'x'), fv(v, 'y')), fDiv(fv(v, 'y'), fv(v, 'x'))])],
    why: (v, a) => `${fText(fv(v, 'x'))} ÷ ${fText(fv(v, 'y'))} = ${a}.`,
  }),
  t({
    sub: 'u04-16',
    d: 2,
    prompt: 'გამოთვალე: {x} ÷ {y}.',
    vars: { x: C(P212), y: C(P212) },
    constraints: [{ test: (v) => nd(v, 'x')[0] % nd(v, 'y')[0] === 0 || nd(v, 'y')[1] % nd(v, 'x')[1] === 0 || gcd(nd(v, 'x')[0], nd(v, 'y')[0]) > 1, note: 'cancelling' }],
    answer: (v) => W(fDiv(fv(v, 'x'), fv(v, 'y'))),
    options: (v, right) => [right, ...fracSlips(fDiv(fv(v, 'x'), fv(v, 'y')), [fMul(fv(v, 'x'), fv(v, 'y')), fDiv(fv(v, 'y'), fv(v, 'x'))])],
    why: (v, a) => `${String(v.x)} ÷ ${String(v.y)} = ${a}.`,
  }),
  t({
    sub: 'u04-16',
    prompt: 'რამდენი {y} მ სიგრძის ნაჭერი გამოვა {x} მ სიგრძის ლენტიდან?',
    vars: { x: C(mixedPool(5, 2, 6)), y: C(P29) },
    constraints: [{ test: (v) => fDiv(fv(v, 'x'), fv(v, 'y')).d === 1, note: 'cuts exactly' }],
    answer: (v) => sg(fDiv(fv(v, 'x'), fv(v, 'y')).n),
    wrong: (v) => { const r = fDiv(fv(v, 'x'), fv(v, 'y')).n; return [r + 1, r - 1, r * 2, r + 2, Math.round(fMul(fv(v, 'x'), fv(v, 'y')).n / fMul(fv(v, 'x'), fv(v, 'y')).d)]; },
    why: (v, a) => `${String(v.x)} ÷ ${String(v.y)} = ${a}.`,
  }),

  // ═════════ U04.17 — წილადიანი გამოსახულებების გამარტივება ═════════
  t({
    sub: 'u04-17',
    d: 2,
    prompt: 'გამოთვალე: {x} + {y} × {k}.',
    vars: { x: C(P212), y: C(P29), k: I(2, 6) },
    constraints: [{ test: (v) => fAdd(fv(v, 'x'), fMul(fv(v, 'y'), frac(N(v, 'k'), 1))).d <= 36, note: 'small denominator' }],
    answer: (v) => W(fAdd(fv(v, 'x'), fMul(fv(v, 'y'), frac(N(v, 'k'), 1)))),
    options: (v, right) => [right, W(fMul(fAdd(fv(v, 'x'), fv(v, 'y')), frac(N(v, 'k'), 1))), ...fracSlips(fAdd(fv(v, 'x'), fMul(fv(v, 'y'), frac(N(v, 'k'), 1))), [fAdd(fAdd(fv(v, 'x'), fv(v, 'y')), frac(N(v, 'k'), 1))])],
    why: (v, a) => `ჯერ გამრავლება: ${String(v.y)} × ${N(v, 'k')} = ${W(fMul(fv(v, 'y'), frac(N(v, 'k'), 1)))}, შემდეგ შეკრება: ${a}.`,
  }),
  t({
    sub: 'u04-17',
    d: 2,
    prompt: 'გამოთვალე: ({x} + {y}) × {z}.',
    vars: { x: C(P212), y: C(P212), z: C(P212) },
    constraints: [{ test: (v) => nd(v, 'x')[1] === nd(v, 'y')[1] && fMul(fAdd(fv(v, 'x'), fv(v, 'y')), fv(v, 'z')).d <= 40, note: 'a same-denominator bracket' }],
    answer: (v) => W(fMul(fAdd(fv(v, 'x'), fv(v, 'y')), fv(v, 'z'))),
    options: (v, right) => [right, W(fAdd(fv(v, 'x'), fMul(fv(v, 'y'), fv(v, 'z')))), ...fracSlips(fMul(fAdd(fv(v, 'x'), fv(v, 'y')), fv(v, 'z')), [fAdd(fAdd(fv(v, 'x'), fv(v, 'y')), fv(v, 'z'))])],
    why: (v, a) => `ჯერ ფრჩხილები: ${W(fAdd(fv(v, 'x'), fv(v, 'y')))}, შემდეგ გამრავლება: ${a}.`,
  }),
  t({
    sub: 'u04-17',
    d: 2,
    prompt: 'გამოთვალე: {x} ' + MINUS + ' {y} ÷ {k}.',
    vars: { x: C(P212), y: C(P212), k: I(2, 6) },
    constraints: [{ test: (v) => fCmp(fv(v, 'x'), fDiv(fv(v, 'y'), frac(N(v, 'k'), 1))) > 0 && fSub(fv(v, 'x'), fDiv(fv(v, 'y'), frac(N(v, 'k'), 1))).d <= 40, note: 'positive, small denominator' }],
    answer: (v) => W(fSub(fv(v, 'x'), fDiv(fv(v, 'y'), frac(N(v, 'k'), 1)))),
    options: (v, right) => [right, ...(fCmp(fv(v, 'x'), fv(v, 'y')) > 0 ? [W(fDiv(fSub(fv(v, 'x'), fv(v, 'y')), frac(N(v, 'k'), 1)))] : []), ...fracSlips(fSub(fv(v, 'x'), fDiv(fv(v, 'y'), frac(N(v, 'k'), 1))), [fAdd(fv(v, 'x'), fDiv(fv(v, 'y'), frac(N(v, 'k'), 1)))])],
    why: (v, a) => `ჯერ გაყოფა: ${String(v.y)} ÷ ${N(v, 'k')} = ${W(fDiv(fv(v, 'y'), frac(N(v, 'k'), 1)))}, შემდეგ გამოკლება: ${a}.`,
  }),
  t({
    sub: 'u04-17',
    d: 2,
    prompt: 'გამოთვალე: ({x} ' + MINUS + ' {y}) × {z}.',
    vars: { x: C(P212), y: C(P212), z: C(P212) },
    constraints: [{ test: (v) => nd(v, 'x')[1] % nd(v, 'y')[1] === 0 && fCmp(fv(v, 'x'), fv(v, 'y')) > 0 && fMul(fSub(fv(v, 'x'), fv(v, 'y')), fv(v, 'z')).d <= 40, note: 'a tidy bracket' }],
    answer: (v) => W(fMul(fSub(fv(v, 'x'), fv(v, 'y')), fv(v, 'z'))),
    options: (v, right) => [right, ...(fCmp(fv(v, 'y'), fMul(fv(v, 'y'), fv(v, 'z'))) < 0 || true ? [W(fSub(fv(v, 'x'), fMul(fv(v, 'y'), fv(v, 'z'))).n > 0 ? fSub(fv(v, 'x'), fMul(fv(v, 'y'), fv(v, 'z'))) : fAdd(fv(v, 'x'), fv(v, 'y')))] : []), ...fracSlips(fMul(fSub(fv(v, 'x'), fv(v, 'y')), fv(v, 'z')), [fSub(fSub(fv(v, 'x'), fv(v, 'y')), fv(v, 'z') ) .n > 0 ? fSub(fSub(fv(v, 'x'), fv(v, 'y')), fv(v, 'z')) : fv(v, 'z')])],
    why: (v, a) => `ჯერ ფრჩხილები: ${W(fSub(fv(v, 'x'), fv(v, 'y')))}, შემდეგ გამრავლება: ${a}.`,
  }),
  t({
    sub: 'u04-17',
    d: 2,
    prompt: 'გამოთვალე: {x} ÷ {y} + {z}.',
    vars: { x: C(P212), y: C(P29), z: C(P29) },
    constraints: [{ test: (v) => fAdd(fDiv(fv(v, 'x'), fv(v, 'y')), fv(v, 'z')).d <= 40, note: 'small denominator' }],
    answer: (v) => W(fAdd(fDiv(fv(v, 'x'), fv(v, 'y')), fv(v, 'z'))),
    options: (v, right) => [right, W(fDiv(fv(v, 'x'), fAdd(fv(v, 'y'), fv(v, 'z')))), ...fracSlips(fAdd(fDiv(fv(v, 'x'), fv(v, 'y')), fv(v, 'z')), [fAdd(fMul(fv(v, 'x'), fv(v, 'y')), fv(v, 'z'))])],
    why: (v, a) => `ჯერ გაყოფა: ${String(v.x)} ÷ ${String(v.y)} = ${W(fDiv(fv(v, 'x'), fv(v, 'y')))}, შემდეგ შეკრება: ${a}.`,
  }),
  t({
    sub: 'u04-17',
    d: 2,
    prompt: 'გამოთვალე: ({x} ' + MINUS + ' {y}) ÷ {z}.',
    vars: { x: C(mixedPool(3, 2, 6)), y: C(P212), z: C(P29) },
    constraints: [{ test: (v) => fCmp(fv(v, 'x'), fv(v, 'y')) > 0 && fDiv(fSub(fv(v, 'x'), fv(v, 'y')), fv(v, 'z')).d <= 40, note: 'positive, small denominator' }],
    answer: (v) => W(fDiv(fSub(fv(v, 'x'), fv(v, 'y')), fv(v, 'z'))),
    options: (v, right) => [right, ...fracSlips(fDiv(fSub(fv(v, 'x'), fv(v, 'y')), fv(v, 'z')), [fMul(fSub(fv(v, 'x'), fv(v, 'y')), fv(v, 'z')), fSub(fv(v, 'x'), fDiv(fv(v, 'y'), fv(v, 'z')))].filter((f) => f.n > 0))],
    why: (v, a) => `ჯერ ფრჩხილები: ${W(fSub(fv(v, 'x'), fv(v, 'y')))}, შემდეგ გაყოფა: ${a}.`,
  }),
];

// ─────────────────────────── local helpers ───────────────────────────

type Draw = Record<string, unknown>;
const ndOf = (v: Draw, name: string): [number, number] => nd(v as never, name);

function commonPair(v: Draw): string {
  const [n1, d1] = ndOf(v, 'x');
  const [n2, d2] = ndOf(v, 'y');
  const L = lcm(d1, d2);
  return `${(n1 * L) / d1}/${L} და ${(n2 * L) / d2}/${L}`;
}

function commonPairSlips(v: Draw, right: string): string[] {
  const [n1, d1] = ndOf(v, 'x');
  const [n2, d2] = ndOf(v, 'y');
  const L = lcm(d1, d2);
  const pair = (den: number, a = 0, b = 0): string => `${(n1 * den) / d1 + a}/${den} და ${(n2 * den) / d2 + b}/${den}`;
  const out = [right];
  if (d1 * d2 !== L && (d1 * d2) % d1 === 0 && (d1 * d2) % d2 === 0) out.push(pair(d1 * d2));
  out.push(pair(L * 2));
  out.push(`${n1}/${L} და ${n2}/${L}`);
  out.push(pair(L, 1, 0));
  out.push(pair(L, 0, 1));
  out.push(pair(L, -1, 0));
  return out;
}

function distinct3(v: Draw): boolean {
  const fs = ['x', 'y', 'z'].map((k) => parseF(String(v[k])));
  return fCmp(fs[0]!, fs[1]!) !== 0 && fCmp(fs[0]!, fs[2]!) !== 0 && fCmp(fs[1]!, fs[2]!) !== 0;
}

function sortedTexts(v: Draw, asc: boolean): string[] {
  return ['x', 'y', 'z']
    .map((k) => String(v[k]))
    .sort((a, b) => (asc ? 1 : -1) * fCmp(parseF(a), parseF(b)));
}

function orderText(v: Draw, asc: boolean): string {
  return sortedTexts(v, asc).join(asc ? ' < ' : ' > ');
}

function orderOptions(v: Draw, right: string): string[] {
  const asc = right.includes(' < ');
  const items = ['x', 'y', 'z'].map((k) => String(v[k]));
  const perms: string[][] = [
    [items[0]!, items[1]!, items[2]!], [items[0]!, items[2]!, items[1]!], [items[1]!, items[0]!, items[2]!],
    [items[1]!, items[2]!, items[0]!], [items[2]!, items[0]!, items[1]!], [items[2]!, items[1]!, items[0]!],
  ];
  const sep = asc ? ' < ' : ' > ';
  return [right, ...perms.map((p) => p.join(sep))];
}

function sameDenSlips(v: Draw, sign: 1 | -1): string[] {
  const d = Number(v.d), n1 = Number(v.n1), n2 = Number(v.n2);
  const key = n1 + sign * n2;
  return [
    W(frac(key, d * 2)), W(frac(key + 1, d)), W(frac(key - 1, d)), W(frac(key, d + 1)),
    W(frac(Math.abs(n1 - sign * n2), d)), W(frac(key + 2, d)),
  ].filter((s) => !/^[-0]/.test(s) && !s.includes('NaN'));
}
