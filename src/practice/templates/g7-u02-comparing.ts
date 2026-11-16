import type { QuestionTemplate, Vars } from './types';
import { C, D, I, MINUS, N, S, dec, fAdd, fCmp, fSub, fr, lcm, mText, par, q6, sg } from './g6-helpers';
import type { Frac } from './g6-helpers';
import { dd } from './g6-dec';
import { nd, properPool } from './g6-frac';

/**
 * Grade VII — Unit 2: comparing and ordering numbers and expressions.
 *
 * Converted from the academy's Grade VII `U02` bank: 4 subtopics × 6 questions.
 * Every comparison is decided with exact fractions, so a decimal against a
 * fraction never goes through floating point.
 */

export const G7_U02_SUBTOPICS = ['u02-01', 'u02-02', 'u02-03', 'u02-04'] as const;

const T = 'g7-comparing';
let seq = 0;
const nextId = (): string => `g7-u02-q${String(++seq).padStart(2, '0')}`;
type Spec = Omit<Parameters<typeof q6>[0], 'id' | 'topic' | 'grade'>;
const t = (spec: Spec): QuestionTemplate => q6({ id: nextId(), topic: T, grade: 7, ...spec });

const SIGNS = ['<', '>', '='] as const;
const signOf = (a: Frac, b: Frac): string => SIGNS[fCmp(a, b) < 0 ? 0 : fCmp(a, b) > 0 ? 1 : 2]!;

interface Cmp {
  sub: string;
  /** Text before the colon; may use variables declared in `vars`. */
  intro: string;
  vars: Record<string, ReturnType<typeof C> | ReturnType<typeof I> | ReturnType<typeof D> | ReturnType<typeof S>>;
  /** Printed left / right expression, and their exact values. */
  l: (v: Vars) => string;
  r: (v: Vars) => string;
  lv: (v: Vars) => Frac;
  rv: (v: Vars) => Frac;
  constraints?: Array<{ test: (v: Vars) => boolean; note: string }>;
  /** Why the sign is right, shown before the key. */
  how: (v: Vars) => string;
  d?: 1 | 2 | 3;
}

const cmp = (c: Cmp): QuestionTemplate =>
  t({
    sub: c.sub,
    ...(c.d ? { d: c.d } : {}),
    prompt: `${c.intro}: {lText} □ {rText}.`,
    vars: { ...(c.vars as Spec['vars']), lText: D((v) => c.l(v)), rText: D((v) => c.r(v)) },
    ...(c.constraints ? { constraints: c.constraints } : {}),
    answer: (v) => signOf(c.lv(v), c.rv(v)),
    options: () => [...SIGNS],
    optionCount: 3,
    why: (v, a) => `${c.how(v)} Ამიტომ ${c.l(v)} ${a} ${c.r(v)}.`,
  });

const frac = (v: Vars, k: string): Frac => {
  const [n, d] = nd(v, k);
  return fr(n, d);
};

/** Hundredths as a decimal fraction. */
const h = (x: number): Frac => fr(x, 100);


interface Num {
  text: string;
  value: number;
}
const frN = (n: number, d: number, neg = false): Num => ({ text: `${neg ? MINUS : ''}${n}/${d}`, value: (neg ? -n : n) / d });
const decN = (hundredths: number, neg = false): Num => ({ text: `${neg ? MINUS : ''}${dd(hundredths, 2)}`, value: (neg ? -hundredths : hundredths) / 100 });
const rootN = (n: number, neg = false): Num => ({ text: `${neg ? MINUS : ''}√${n}`, value: (neg ? -1 : 1) * Math.sqrt(n) });
const intN = (n: number): Num => ({ text: sg(n), value: n });

const POS_FRAC: Num[] = properPool(2, 9).map((f) => frN(Number(f.split('/')[0]), Number(f.split('/')[1])));
const POS_DEC: Num[] = [10, 20, 25, 30, 40, 45, 50, 60, 65, 70, 75, 80, 85, 90, 95, 12, 35, 55].map((x) => decN(x));
const NEG_FRAC: Num[] = properPool(2, 6).map((f) => frN(Number(f.split('/')[0]), Number(f.split('/')[1]), true));
const NEG_DEC: Num[] = [10, 20, 25, 30, 40, 50, 60, 75, 80, 90, 15, 35, 45, 65].map((x) => decN(x, true));
const NEG_MIX: Num[] = [...NEG_FRAC, ...NEG_DEC, ...[1, 2, 3].map((n) => intN(-n)), intN(0), ...[4, 5, 7, 8, 12, 15].map((n) => frN(n, n > 8 ? 4 : 3, true))];
const ROOTS: Num[] = [...[2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 17, 18, 20, 21, 22, 24, 26, 27, 28, 29, 30].map((n) => rootN(n)), ...[4, 9, 16, 25].map((n) => rootN(n)), ...[1, 2, 3, 4, 5, 6].map(intN)];
const SIGNED_ROOTS: Num[] = [...[2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 15].map((n) => rootN(n, true)), ...[4, 9, 16].map((n) => rootN(n, true)), ...[2, 3, 5, 6, 7, 10, 11].map((n) => rootN(n)), rootN(4), rootN(9), ...[-4, -3, -2, -1, 0, 1, 2, 3, 4].map(intN)];

const ORDER_WORDS = ['ზრდადობით', 'კლებადობით'] as const;
const distinctPool = (pool: Num[], idx: number[]): boolean => {
  const vals = idx.map((i) => pool[i]!.value);
  for (let i = 0; i < vals.length; i += 1) for (let j = i + 1; j < vals.length; j += 1) if (Math.abs(vals[i]! - vals[j]!) < 1e-9) return false;
  return true;
};

/** A "sort these numbers" question over a pool; the key and slips are printed lists. */
const order = (sub: string, pool: Num[], count: number): QuestionTemplate => {
  const names = ['i0', 'i1', 'i2', 'i3', 'i4'].slice(0, count);
  const picks = (v: Vars): Num[] => names.map((k) => pool[N(v, k)]!);
  const sorted = (v: Vars): Num[] => {
    const up = [...picks(v)].sort((x, y) => x.value - y.value);
    return String(v.w) === ORDER_WORDS[0] ? up : up.reverse();
  };
  const show = (list: Num[]): string => list.map((x) => x.text).join(', ');
  const specVars: Record<string, ReturnType<typeof I> | ReturnType<typeof C> | ReturnType<typeof D>> = { w: C([...ORDER_WORDS]) };
  for (const k of names) specVars[k] = I(0, pool.length - 1);
  specVars.list = D((v) => show(picks(v)));
  return t({
    sub,
    prompt: 'დაალაგე {w}: {list}.',
    vars: specVars as Spec['vars'],
    constraints: [{ test: (v: Vars) => distinctPool(pool, names.map((k) => N(v, k))), note: 'all numbers differ in value' }, { test: (v: Vars) => show(sorted(v)) !== show(picks(v)), note: 'the list is not already in order' }],
    answer: (v) => show(sorted(v)),
    options: (v, right) => {
      const s = sorted(v);
      const swap = (a: number, b: number): Num[] => {
        const c = [...s];
        [c[a], c[b]] = [c[b]!, c[a]!];
        return c;
      };
      return [right, show([...s].reverse()), show(swap(0, 1)), show(swap(s.length - 2, s.length - 1)), show([...s.slice(1), s[0]!]), show(swap(1, 2))];
    },
    why: (v, a) => `${v.w} დალაგებულია ასე: ${a}.`,
  });
};

export const G7_U02_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U02.1 — მთელი და რაციონალური რიცხვების შედარება ═════════
  cmp({
    sub: 'u02-01',
    intro: 'შეადარე რიცხვები და ჩასვი შესაბამისი ნიშანი (<), (>) ან (=)',
    vars: { a: I(-30, 30, { nonZero: true }), b: I(-30, 30, { nonZero: true }) },
    l: (v) => sg(N(v, 'a')),
    r: (v) => sg(N(v, 'b')),
    lv: (v) => fr(N(v, 'a')),
    rv: (v) => fr(N(v, 'b')),
    how: (v) => (N(v, 'a') < 0 && N(v, 'b') < 0 ? 'უარყოფით რიცხვებს შორის მეტია ის, რომლის მოდულიც ნაკლებია.' : 'რიცხვთა ღერძზე მარჯვნივ მდებარე რიცხვი მეტია.'),
  }),
  cmp({
    sub: 'u02-01',
    intro: 'შეადარე',
    vars: { a: C(properPool(2, 12)), b: C(properPool(2, 12)) },
    l: (v) => String(v.a),
    r: (v) => String(v.b),
    lv: (v) => frac(v, 'a'),
    rv: (v) => frac(v, 'b'),
    how: (v) => {
      const [n1, d1] = nd(v, 'a');
      const [n2, d2] = nd(v, 'b');
      const m = lcm(d1, d2);
      return `საერთო მნიშვნელზე: ${(n1 * m) / d1}/${m} და ${(n2 * m) / d2}/${m}.`;
    },
  }),
  cmp({
    sub: 'u02-01',
    intro: 'შეადარე',
    vars: { a: C(properPool(2, 12)), b: C(properPool(2, 12)) },
    l: (v) => `${MINUS}${v.a}`,
    r: (v) => `${MINUS}${v.b}`,
    lv: (v) => fr(-frac(v, 'a').n, frac(v, 'a').d),
    rv: (v) => fr(-frac(v, 'b').n, frac(v, 'b').d),
    how: (v) => `${v.a} და ${v.b}-ს შორის მეტი ${fCmp(frac(v, 'a'), frac(v, 'b')) > 0 ? v.a : v.b}-ია; უარყოფითებში ნიშანი შებრუნდება.`,
  }),
  cmp({
    sub: 'u02-01',
    intro: 'შეადარე',
    vars: { p: I(11, 99), f: C(properPool(3, 9)) },
    l: (v) => dd(N(v, 'p'), 2),
    r: (v) => String(v.f),
    lv: (v) => h(N(v, 'p')),
    rv: (v) => frac(v, 'f'),
    how: (v) => `წილადის ათწილადური მნიშვნელობა: ${v.f} ≈ ${dec(frac(v, 'f').n / frac(v, 'f').d, 3)}.`,
  }),
  cmp({
    sub: 'u02-01',
    intro: 'შეადარე',
    vars: { f: C(properPool(2, 10).filter((x) => x !== '1/3')), k: C([-2, -1, 0, 0, 1, 2]) },
    constraints: [{ test: (v: Vars) => { const f = frac(v, 'f'); const x = Math.round((100 * f.n) / f.d) + N(v, 'k'); return x >= 5 && x <= 99; }, note: 'decimal stays in (0,1)' }],
    l: (v) => `${MINUS}${dd(Math.round((100 * frac(v, 'f').n) / frac(v, 'f').d) + N(v, 'k'), 2)}`,
    r: (v) => `${MINUS}${v.f}`,
    lv: (v) => fr(-(Math.round((100 * frac(v, 'f').n) / frac(v, 'f').d) + N(v, 'k')), 100),
    rv: (v) => fr(-frac(v, 'f').n, frac(v, 'f').d),
    how: (v) => `${v.f} ≈ ${dec(frac(v, 'f').n / frac(v, 'f').d, 3)}; უარყოფით რიცხვებს შორის მეტია ნაკლები მოდულის მქონე.`,
  }),
  cmp({
    sub: 'u02-01',
    intro: 'შეადარე',
    vars: { f: C(properPool(2, 12)), k: C([-2, -1, 0, 0, 1, 2]) },
    constraints: [{ test: (v: Vars) => { const f = frac(v, 'f'); const x = Math.round((100 * f.n) / f.d) + N(v, 'k'); return x >= 5 && x <= 99 && !(f.d === 3 && N(v, 'k') === 0); }, note: 'decimal stays in (0,1)' }],
    l: (v) => String(v.f),
    r: (v) => dd(Math.round((100 * frac(v, 'f').n) / frac(v, 'f').d) + N(v, 'k'), 2),
    lv: (v) => frac(v, 'f'),
    rv: (v) => h(Math.round((100 * frac(v, 'f').n) / frac(v, 'f').d) + N(v, 'k')),
    how: (v) => `${v.f} ≈ ${dec(frac(v, 'f').n / frac(v, 'f').d, 4)}; შევადაროთ ათწილადს.`,
  }),

  // ═════════ U02.2 — ჯამებისა და სხვაობების შედარება ═════════
  cmp({
    sub: 'u02-02',
    intro: 'შეადარე გამოსახულებები',
    vars: { a: I(10, 60), b: I(10, 60), k: C([-3, -2, -1, 0, 0, 1, 2, 3]), c: I(10, 50) },
    constraints: [{ test: (v: Vars) => N(v, 'a') + N(v, 'b') + N(v, 'k') - N(v, 'c') >= 5 && N(v, 'a') + N(v, 'b') + N(v, 'k') - N(v, 'c') <= 60, note: 'second addend in range' }],
    l: (v) => `${v.a} + ${v.b}`,
    r: (v) => `${v.c} + ${N(v, 'a') + N(v, 'b') + N(v, 'k') - N(v, 'c')}`,
    lv: (v) => fr(N(v, 'a') + N(v, 'b')),
    rv: (v) => fr(N(v, 'a') + N(v, 'b') + N(v, 'k')),
    how: (v) => `${N(v, 'a') + N(v, 'b')} და ${N(v, 'a') + N(v, 'b') + N(v, 'k')}.`,
  }),
  cmp({
    sub: 'u02-02',
    intro: 'შეადარე',
    vars: { a: I(60, 99), b: I(10, 50), k: C([-3, -2, -1, 0, 0, 1, 2, 3]), c: I(60, 99) },
    constraints: [{ test: (v: Vars) => N(v, 'c') - (N(v, 'a') - N(v, 'b') + N(v, 'k')) >= 5 && N(v, 'c') - (N(v, 'a') - N(v, 'b') + N(v, 'k')) <= 60, note: 'subtrahend in range' }],
    l: (v) => `${v.a} ${MINUS} ${v.b}`,
    r: (v) => `${v.c} ${MINUS} ${N(v, 'c') - (N(v, 'a') - N(v, 'b') + N(v, 'k'))}`,
    lv: (v) => fr(N(v, 'a') - N(v, 'b')),
    rv: (v) => fr(N(v, 'a') - N(v, 'b') + N(v, 'k')),
    how: (v) => `${N(v, 'a') - N(v, 'b')} და ${N(v, 'a') - N(v, 'b') + N(v, 'k')}.`,
  }),
  cmp({
    sub: 'u02-02',
    intro: 'შეადარე',
    vars: { p: C([2, 3, 4, 5, 6]), q: C([2, 3, 4, 5, 6, 7]), f: C(properPool(2, 12)) },
    constraints: [{ test: (v: Vars) => N(v, 'p') !== N(v, 'q'), note: 'different denominators' }],
    l: (v) => `1/${v.p} + 1/${v.q}`,
    r: (v) => String(v.f),
    lv: (v) => fAdd(fr(1, N(v, 'p')), fr(1, N(v, 'q'))),
    rv: (v) => frac(v, 'f'),
    how: (v) => `1/${v.p} + 1/${v.q} = ${mText(fAdd(fr(1, N(v, 'p')), fr(1, N(v, 'q'))))}.`,
  }),
  cmp({
    sub: 'u02-02',
    intro: 'შეადარე',
    vars: { a: C(properPool(2, 12, 2)), b: C(properPool(2, 8)), c: C(properPool(2, 8)) },
    constraints: [{ test: (v: Vars) => fCmp(frac(v, 'a'), frac(v, 'b')) > 0, note: 'positive difference' }],
    l: (v) => `${v.a} ${MINUS} ${v.b}`,
    r: (v) => String(v.c),
    lv: (v) => fSub(frac(v, 'a'), frac(v, 'b')),
    rv: (v) => frac(v, 'c'),
    how: (v) => `${v.a} ${MINUS} ${v.b} = ${mText(fSub(frac(v, 'a'), frac(v, 'b')))}.`,
  }),
  cmp({
    sub: 'u02-02',
    intro: 'შეადარე',
    vars: { a: I(-15, -1), b: I(1, 20), c: I(1, 10), d: I(-10, -1) },
    l: (v) => `${sg(N(v, 'a'))} + ${N(v, 'b')}`,
    r: (v) => `${N(v, 'c')} ${MINUS} ${par(N(v, 'd'))}`,
    lv: (v) => fr(N(v, 'a') + N(v, 'b')),
    rv: (v) => fr(N(v, 'c') - N(v, 'd')),
    how: (v) => `${sg(N(v, 'a') + N(v, 'b'))} და ${N(v, 'c') - N(v, 'd')}.`,
  }),
  cmp({
    sub: 'u02-02',
    intro: 'შეადარე',
    vars: { a: I(10, 60), b: I(100, 400), k: C([-20, -10, 0, 0, 10, 20]), c: I(40, 99) },
    constraints: [{ test: (v: Vars) => { const dpart = N(v, 'c') * 10 - (N(v, 'a') * 10 + N(v, 'b') + N(v, 'k')); return dpart >= 5 && dpart <= 300; }, note: 'subtrahend in range' }],
    l: (v) => `${dd(N(v, 'a'), 1)} + ${dd(N(v, 'b'), 2)}`,
    r: (v) => `${dd(N(v, 'c'), 1)} ${MINUS} ${dd(N(v, 'c') * 10 - (N(v, 'a') * 10 + N(v, 'b') + N(v, 'k')), 2)}`,
    lv: (v) => h(N(v, 'a') * 10 + N(v, 'b')),
    rv: (v) => h(N(v, 'a') * 10 + N(v, 'b') + N(v, 'k')),
    how: (v) => `${dd(N(v, 'a') * 10 + N(v, 'b'), 2)} და ${dd(N(v, 'a') * 10 + N(v, 'b') + N(v, 'k'), 2)}.`,
  }),

  // ═════════ U02.3 — ორი გამოსახულების შედარება ═════════
  cmp({
    sub: 'u02-03',
    intro: 'შეადარე, თუ x = {x}',
    vars: { x: I(2, 9), a: I(2, 6), b: I(1, 12), c: I(2, 6), e: I(1, 12) },
    l: (v) => `${v.a}x + ${v.b}`,
    r: (v) => `${v.c}x + ${v.e}`,
    lv: (v) => fr(N(v, 'a') * N(v, 'x') + N(v, 'b')),
    rv: (v) => fr(N(v, 'c') * N(v, 'x') + N(v, 'e')),
    how: (v) => `x = ${v.x}: ${N(v, 'a') * N(v, 'x') + N(v, 'b')} და ${N(v, 'c') * N(v, 'x') + N(v, 'e')}.`,
  }),
  cmp({
    sub: 'u02-03',
    intro: 'შეადარე, თუ {L} = {x}',
    vars: { L: C(['a', 'm', 't', 'y']), x: I(2, 9), a: I(3, 8), b: I(1, 12), c: I(2, 7), e: I(1, 12) },
    l: (v) => `${v.a}${v.L} ${MINUS} ${v.b}`,
    r: (v) => `${v.c}${v.L} + ${v.e}`,
    lv: (v) => fr(N(v, 'a') * N(v, 'x') - N(v, 'b')),
    rv: (v) => fr(N(v, 'c') * N(v, 'x') + N(v, 'e')),
    how: (v) => `${v.L} = ${v.x}: ${sg(N(v, 'a') * N(v, 'x') - N(v, 'b'))} და ${N(v, 'c') * N(v, 'x') + N(v, 'e')}.`,
  }),
  cmp({
    sub: 'u02-03',
    intro: 'შეადარე',
    vars: { k: I(2, 9), a: I(2, 9), b: I(2, 9), form: C([0, 0, 1]) },
    l: (v) => `${v.k}(${v.a} + ${v.b})`,
    r: (v) => (N(v, 'form') === 0 ? `${v.k} × ${v.a} + ${v.k} × ${v.b}` : `${v.k} × ${v.a} + ${v.b}`),
    lv: (v) => fr(N(v, 'k') * (N(v, 'a') + N(v, 'b'))),
    rv: (v) => fr(N(v, 'form') === 0 ? N(v, 'k') * N(v, 'a') + N(v, 'k') * N(v, 'b') : N(v, 'k') * N(v, 'a') + N(v, 'b')),
    how: (v) => (N(v, 'form') === 0 ? 'განაწილებადობის თვისებით ორივე გამოსახულება ტოლია.' : `${N(v, 'k') * (N(v, 'a') + N(v, 'b'))} და ${N(v, 'k') * N(v, 'a') + N(v, 'b')}.`),
  }),
  cmp({
    sub: 'u02-03',
    intro: 'შეადარე, თუ x = {xS}',
    vars: { x: I(-6, 6, { nonZero: true }), c: I(-5, 5, { nonZero: true }), xS: S('x') },
    l: () => 'x²',
    r: (v) => `${N(v, 'c') < 0 ? MINUS : ''}${Math.abs(N(v, 'c')) === 1 ? '' : Math.abs(N(v, 'c'))}x`,
    lv: (v) => fr(N(v, 'x') * N(v, 'x')),
    rv: (v) => fr(N(v, 'c') * N(v, 'x')),
    how: (v) => `x² = ${N(v, 'x') * N(v, 'x')}, მარჯვენა მხარე ${sg(N(v, 'c') * N(v, 'x'))}.`,
  }),
  cmp({
    sub: 'u02-03',
    intro: 'შეადარე, თუ a = {a} და b = {b}',
    vars: { a: I(1, 9), b: I(1, 9), k: C([2, 3, 4]) },
    l: (v) => `${v.k}a + b`,
    r: (v) => `a + ${v.k}b`,
    lv: (v) => fr(N(v, 'k') * N(v, 'a') + N(v, 'b')),
    rv: (v) => fr(N(v, 'a') + N(v, 'k') * N(v, 'b')),
    how: (v) => `${N(v, 'k') * N(v, 'a') + N(v, 'b')} და ${N(v, 'a') + N(v, 'k') * N(v, 'b')}.`,
  }),
  cmp({
    sub: 'u02-03',
    intro: 'შეადარე, თუ x = {x}',
    vars: { x: I(1, 9), m: I(1, 9), form: C([0, 0, 1, 2]) },
    l: (v) => `(x + ${v.m})²`,
    r: (v) => (N(v, 'form') === 0 ? `x² + ${2 * N(v, 'm')}x + ${N(v, 'm') * N(v, 'm')}` : N(v, 'form') === 1 ? `x² + ${N(v, 'm') * N(v, 'm')}` : `x² + ${N(v, 'm')}x + ${N(v, 'm') * N(v, 'm')}`),
    lv: (v) => fr((N(v, 'x') + N(v, 'm')) ** 2),
    rv: (v) => fr(N(v, 'form') === 0 ? N(v, 'x') ** 2 + 2 * N(v, 'm') * N(v, 'x') + N(v, 'm') ** 2 : N(v, 'form') === 1 ? N(v, 'x') ** 2 + N(v, 'm') ** 2 : N(v, 'x') ** 2 + N(v, 'm') * N(v, 'x') + N(v, 'm') ** 2),
    how: (v) => `x = ${v.x}: (${N(v, 'x')} + ${N(v, 'm')})² = ${(N(v, 'x') + N(v, 'm')) ** 2}.`,
  }),

  // ═════════ U02.4 — ნამდვილი რიცხვების დალაგება ═════════
  order('u02-04', [-9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(intN), 5),
  order('u02-04', [...POS_FRAC, ...POS_DEC], 4),
  order('u02-04', NEG_MIX, 4),
  order('u02-04', ROOTS, 4),
  order('u02-04', SIGNED_ROOTS, 5),
  order('u02-04', [...POS_FRAC.filter((x) => x.value > 0.3), ...POS_DEC.filter((x) => x.value > 0.3)], 4),
];
