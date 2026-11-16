import type { QuestionTemplate } from './types';
import { C, D, I, MINUS, N, SIGNS, fAdd, fCmp, fDiv, fMul, fSub, fText, fr, gcd, mText, q6 } from './g6-helpers';
import type { Frac } from './g6-helpers';
import { dd, fx, pow10, terminates } from './g6-dec';
import { fracSlips, parseF } from './g6-frac';

/**
 * Grade VI — Unit 6: fractions, decimals and rationals together.
 *
 * Converted from the academy's `U06` bank: 6 subtopics × 6 questions.
 *
 * Every operand travels as the text a student reads — `3/4`, `0,35`, `2 1/4`,
 * `−0,5` — and is parsed back into an exact fraction, so a key is never a float.
 * A result is printed as a decimal when it terminates and as a fraction
 * otherwise; wrong options keep the key's form.
 */

export const G6_U06_SUBTOPICS = ['u06-01', 'u06-02', 'u06-03', 'u06-04', 'u06-05', 'u06-06'] as const;

const T = 'g6-fraction-decimal';
let seq = 0;
const nextId = (): string => `g6-u06-q${String(++seq).padStart(2, '0')}`;
type Spec = Omit<Parameters<typeof q6>[0], 'id' | 'topic'>;
const t = (spec: Spec): QuestionTemplate => q6({ id: nextId(), topic: T, ...spec });

// ───────────────────────────── exact helpers ─────────────────────────────

/** A printed operand → exact fraction. */
const pf = (text: string): Frac => {
  const negative = text.startsWith(MINUS);
  const body = negative ? text.slice(1) : text;
  let f: Frac;
  if (body.includes('/')) f = parseF(body);
  else {
    const [whole = '0', rest = ''] = body.replace(/\s/g, '').split(',');
    f = fr(Number(whole + rest), 10 ** rest.length);
  }
  return negative ? fr(-f.n, f.d) : f;
};

const v$ = (v: Record<string, unknown>, name: string): Frac => pf(String(v[name]));

/** A terminating fraction as a trimmed decimal. */
const decOf = (f: Frac): string => {
  let p = 0;
  while (pow10(p) % f.d !== 0) p += 1;
  return dd((f.n * pow10(p)) / f.d, p);
};

/** The printed form of a result: decimal when it terminates, mixed number otherwise. */
const vt = (f: Frac): string => (terminates(f.d) ? decOf(f) : mText(f));

const properOf = (ds: number[], minN = 1): string[] => {
  const out: string[] = [];
  for (const d of ds) for (let n = minN; n < d; n += 1) if (gcd(n, d) === 1) out.push(`${n}/${d}`);
  return out;
};
const mixedOf = (ds: number[], maxWhole = 4): string[] => {
  const out: string[] = [];
  for (let w = 1; w <= maxWhole; w += 1) for (const f of properOf(ds)) out.push(`${w} ${f}`);
  return out;
};
const decs = (p: number, lo: number, hi: number): string[] => {
  const out: string[] = [];
  for (let a = lo; a <= hi; a += 1) if (a % 10 !== 0) out.push(fx(a, p));
  return out;
};

const QUARTERS = properOf([2, 4, 5, 10]);
const EIGHTS = properOf([8]);
const TWENTY = properOf([20, 25, 50]);
const REPEAT = ['1/3', '2/3', '1/6', '5/6', '1/7', '2/7'];

/** Candidate wrong results around a key, in the key's own form. */
const slips = (key: Frac, extra: Frac[] = []): string[] => {
  if (!terminates(key.d)) return fracSlips(key, extra, mText);
  const base: Frac[] = [
    ...extra,
    fAdd(key, fr(1, 10)), fSub(key, fr(1, 10)), fAdd(key, fr(1)), fSub(key, fr(1)),
    fMul(key, fr(10)), fDiv(key, fr(10)), fAdd(key, fr(1, 100)), fSub(key, fr(1, 100)),
  ];
  return base.filter((f) => f.n > 0 && terminates(f.d)).map(vt);
};

// ───────────────────────────── ordering ─────────────────────────────

/** Four distinct, well separated values drawn from tokens. */
const fourVars = (pool: string[]) => ({ t1: C(pool), t2: C(pool), t3: C(pool), t4: C(pool) });
const four = (v: Record<string, unknown>): string[] => ['t1', 't2', 't3', 't4'].map((k) => String(v[k]));
const separated = (v: Record<string, unknown>): boolean => {
  const xs = four(v).map(pf);
  for (let i = 0; i < 4; i += 1) {
    for (let j = i + 1; j < 4; j += 1) {
      const diff = Math.abs(fCmp(xs[i]!, xs[j]!)) / (xs[i]!.d * xs[j]!.d);
      if (diff < 0.004) return false;
    }
  }
  return true;
};
const sortedTokens = (v: Record<string, unknown>, ascending: boolean): string[] =>
  [...four(v)].sort((a, b) => (ascending ? 1 : -1) * fCmp(pf(a), pf(b)));
const swapped = (xs: string[], i: number): string[] => xs.map((x, k) => (k === i ? xs[i + 1]! : k === i + 1 ? xs[i]! : x));
const approx = (token: string): string => {
  const f = pf(token);
  if (terminates(f.d)) return `${token} = ${decOf(f)}`;
  return `${token} ≈ ${dd(Math.round((f.n * 1000) / f.d), 3)}`;
};

const order = (sub: string, ascending: boolean, pool: string[], d: 1 | 2 | 3 = 2): QuestionTemplate =>
  t({
    sub,
    d,
    prompt: `დაალაგე ${ascending ? 'ზრდადობით' : 'კლებადობით'}: {t1}; {t2}; {t3}; {t4}. რომელია სწორი რიგი?`,
    vars: fourVars(pool),
    constraints: [{ test: separated, note: 'four distinct, well separated values' }],
    answer: (v) => sortedTokens(v, ascending).join('; '),
    options: (v, right) => {
      const s = sortedTokens(v, ascending);
      const given = four(v).join('; ');
      return [right, [...s].reverse().join('; '), swapped(s, 0).join('; '), swapped(s, 1).join('; '), swapped(s, 2).join('; '), given];
    },
    why: (v, a) =>
      `ყველა რიცხვი ათწილადად ჩავწეროთ: ${four(v).map(approx).join('; ')}. ${ascending ? 'ზრდადობით' : 'კლებადობით'}: ${a}.`,
  });

// ───────────────────────────── comparison ─────────────────────────────

const compareWhy = (v: Record<string, unknown>, f: Frac, x: Frac, a: string): string => {
  const fs = String(v.f), xs = String(v.x);
  if (terminates(f.d)) return `${fs} = ${decOf(f)}; ${decOf(f)} ${a} ${xs}.`;
  return `საერთო მნიშვნელზე: ${fs} = ${f.n * x.d}/${f.d * x.d}, ${xs} = ${x.n * f.d}/${f.d * x.d}; ამიტომ ${fs} ${a} ${xs}.`;
};

const compare = (sub: string, d: 1 | 2 | 3, fPool: string[], p: number, offsets: number[]): QuestionTemplate =>
  t({
    sub,
    d,
    prompt: 'შეადარე: {f} □ {x}.',
    vars: {
      f: C(fPool),
      o: C(offsets),
      x: D((v) => {
        const f = v$(v, 'f');
        return fx(Math.round((f.n * pow10(p)) / f.d) + N(v, 'o'), p);
      }),
    },
    constraints: [{ test: (v) => { const a = Math.round((v$(v, 'f').n * pow10(p)) / v$(v, 'f').d) + N(v, 'o'); return a > 0 && a < pow10(p) * 2; }, note: 'a positive decimal' }],
    optionCount: 3,
    answer: (v) => { const c = fCmp(v$(v, 'f'), v$(v, 'x')); return c < 0 ? '<' : c > 0 ? '>' : '='; },
    options: () => SIGNS,
    why: (v, a) => compareWhy(v, v$(v, 'f'), v$(v, 'x'), a),
  });

// ───────────────────────────── conversions ─────────────────────────────

const toDecimal = (sub: string, d: 1 | 2 | 3, pool: string[]): QuestionTemplate =>
  t({
    sub,
    d,
    prompt: 'ჩაწერე {f} ათწილადის სახით.',
    vars: { f: C(pool) },
    answer: (v) => decOf(v$(v, 'f')),
    options: (v, right) => {
      const f = v$(v, 'f');
      return [right, ...slips(f), `${f.n},${f.d}`];
    },
    why: (v, a) => {
      const f = v$(v, 'f');
      let p = 0;
      while (pow10(p) % f.d !== 0) p += 1;
      return `${String(v.f)} = ${(f.n * pow10(p)) / f.d}/${pow10(p)} = ${a}.`;
    },
  });

const decToFraction = (sub: string, d: 1 | 2 | 3, p: number, lo: number, hi: number): QuestionTemplate =>
  t({
    sub,
    d,
    prompt: 'ჩაწერე {x} ჩვეულებრივი წილადის სახით და გაამარტივე.',
    vars: { a: I(lo, hi), x: D((v) => fx(N(v, 'a'), p)) },
    constraints: [{ test: (v) => N(v, 'a') % 10 !== 0 && N(v, 'a') < pow10(p) && gcd(N(v, 'a'), pow10(p)) > 1, note: 'reducible proper fraction' }],
    answer: (v) => fText(fr(N(v, 'a'), pow10(p))),
    options: (v, right) => {
      const a = N(v, 'a');
      const k = fr(a, pow10(p));
      return [right, `${a}/${pow10(p)}`, `${a}/${pow10(p - 1)}`, fText(fr(k.d, k.n)), `${k.n}/${k.d + 1}`, `${k.n + 1}/${k.d}`];
    },
    why: (v, a) => `${String(v.x)} = ${N(v, 'a')}/${pow10(p)} = ${a}.`,
  });

const decToMixed = (sub: string, d: 1 | 2 | 3, p: number, whole: [number, number], lo: number, hi: number): QuestionTemplate =>
  t({
    sub,
    d,
    prompt: 'ჩაწერე {x} შერეული რიცხვის სახით და გაამარტივე წილადი ნაწილი.',
    vars: { w: I(whole[0], whole[1]), a: I(lo, hi), x: D((v) => fx(N(v, 'w') * pow10(p) + N(v, 'a'), p)) },
    constraints: [{ test: (v) => N(v, 'a') % 10 !== 0 && gcd(N(v, 'a'), pow10(p)) > 1, note: 'reducible fractional part' }],
    answer: (v) => `${N(v, 'w')} ${fText(fr(N(v, 'a'), pow10(p)))}`,
    options: (v, right) => {
      const k = fr(N(v, 'a'), pow10(p));
      const w = N(v, 'w');
      return [right, `${w} ${N(v, 'a')}/${pow10(p)}`, `${w} ${k.d}/${k.n}`, `${w + 1} ${k.n}/${k.d}`, `${w} ${k.n}/${k.d + 1}`, `${w} ${k.n + 1}/${k.d}`];
    },
    why: (v, a) => `${String(v.x)} = ${N(v, 'w')} ${N(v, 'a')}/${pow10(p)} = ${a}.`,
  });

const mixedToDecimal = (sub: string, d: 1 | 2 | 3, pool: string[]): QuestionTemplate =>
  t({
    sub,
    d,
    prompt: 'ჩაწერე {f} ათწილადის სახით.',
    vars: { f: C(pool) },
    answer: (v) => decOf(v$(v, 'f')),
    options: (v, right) => {
      const m = /^(\d+) (\d+)\/(\d+)$/.exec(String(v.f))!;
      const f = v$(v, 'f');
      return [right, ...slips(f), `${m[1]},${m[2]}`, `${m[1]}${m[2]},${m[3]}`];
    },
    why: (v, a) => {
      const m = /^(\d+) (\d+)\/(\d+)$/.exec(String(v.f))!;
      const k = fr(Number(m[2]), Number(m[3]));
      return `${m[2]}/${m[3]} = ${decOf(k)}, ამიტომ ${String(v.f)} = ${a}.`;
    },
  });

// ───────────────────────────── operations ─────────────────────────────

const POS_FR = properOf([2, 4, 5, 10, 20]);
const POS_FR3 = properOf([2, 3, 4, 5, 6, 10]);
const D1 = decs(1, 1, 29);
const D2 = decs(2, 11, 99);

const calc = (sub: string, d: 1 | 2 | 3, expr: string, vars: Record<string, ReturnType<typeof C>>, value: (v: Record<string, unknown>) => Frac, test: (v: Record<string, unknown>) => boolean, why: (v: Record<string, unknown>, a: string) => string, extra?: (v: Record<string, unknown>) => Frac[]): QuestionTemplate =>
  t({
    sub,
    d,
    prompt: `გამოთვალე: ${expr}.`,
    vars,
    constraints: [{ test: (v) => { const r = value(v); return r.n > 0 && r.d <= 200 && test(v); }, note: 'a positive, tidy result' }],
    answer: (v) => vt(value(v)),
    options: (v, right) => [right, ...slips(value(v), extra ? extra(v) : [])],
    why,
  });

// ═══════════════════════════════════════════════════════════════
export const G6_U06_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U06.1 — წილადის ათწილადად და ათწილადის წილადად გარდაქმნა ═════════
  toDecimal('u06-01', 1, QUARTERS),
  toDecimal('u06-01', 1, TWENTY),
  decToFraction('u06-01', 2, 3, 101, 999),
  decToFraction('u06-01', 1, 2, 11, 99),
  toDecimal('u06-01', 2, [...EIGHTS, ...properOf([16, 40])]),
  decToMixed('u06-01', 2, 3, [1, 5], 101, 999),

  // ═════════ U06.2 — წილადებისა და ათწილადების შედარება ═════════
  compare('u06-02', 1, properOf([2, 4, 5, 10, 20, 25]), 2, [-6, -4, -2, -1, 0, 1, 2, 4, 6]),
  compare('u06-02', 2, EIGHTS, 3, [-4, -2, -1, 0, 0, 1, 2, 4]),
  compare('u06-02', 2, REPEAT.slice(0, 4), 1, [-1, 0, 1]),
  compare('u06-02', 2, properOf([5, 20, 50]), 1, [-2, -1, 0, 1, 2]),
  order('u06-02', true, [...properOf([2, 4]), ...decs(2, 11, 99)]),
  order('u06-02', false, [...properOf([4, 8]), ...decs(2, 51, 99)]),

  // ═════════ U06.3 — კავშირი წილადებს, ათწილადებსა და შერეულ რიცხვებს შორის ═════════
  mixedToDecimal('u06-03', 1, mixedOf([2, 4, 5, 10], 4)),
  t({
    sub: 'u06-03',
    d: 1,
    prompt: 'ჩაწერე {x} შერეული რიცხვის სახით.',
    vars: { w: I(1, 9), k: I(1, 9), x: D((v) => fx(N(v, 'w') * 10 + N(v, 'k'), 1)) },
    constraints: [{ test: (v) => gcd(N(v, 'k'), 10) > 1, note: 'reducible tenths' }],
    answer: (v) => `${N(v, 'w')} ${fText(fr(N(v, 'k'), 10))}`,
    options: (v, right) => {
      const k = fr(N(v, 'k'), 10);
      return [right, `${N(v, 'w')} ${N(v, 'k')}/10`, `${N(v, 'w')} ${k.d}/${k.n}`, `${N(v, 'w') + 1} ${k.n}/${k.d}`, `${N(v, 'k')} ${N(v, 'w')}/10`];
    },
    why: (v, a) => `${String(v.x)} = ${N(v, 'w')} ${N(v, 'k')}/10 = ${a}.`,
  }),
  mixedToDecimal('u06-03', 2, mixedOf([20, 25, 50], 3)),
  decToFraction('u06-03', 2, 3, 101, 999),
  decToMixed('u06-03', 2, 3, [2, 9], 101, 999),
  t({
    sub: 'u06-03',
    d: 2,
    prompt: 'ჩაწერე {f} ათწილადის სახით და შერეული რიცხვის სახით.',
    vars: { f: C(properOf([2, 4, 5, 10, 20, 25], 1).flatMap((x) => { const [n, d] = x.split('/').map(Number); return [`${n + 2 * d}/${d}`, `${n + d}/${d}`]; })) },
    answer: (v) => `${decOf(v$(v, 'f'))} და ${mText(v$(v, 'f'))}`,
    options: (v, right) => {
      const f = v$(v, 'f');
      const w = Math.floor(f.n / f.d);
      const rest = f.n % f.d;
      return [right, `${decOf(fr(f.n * 10, f.d))} და ${mText(f)}`, `${decOf(f)} და ${w + 1} ${rest}/${f.d}`, `${decOf(fr(rest, f.d))} და ${w} ${rest}/${f.d + 1}`, `${decOf(fr(f.n, f.d * 10))} და ${w} ${f.d}/${rest}`];
    },
    why: (v, a) => `${String(v.f)} = ${a}.`,
  }),

  // ═════════ U06.4 — რიცხვების დალაგება ═════════
  order('u06-04', true, [...properOf([4, 5, 10]), ...decs(2, 11, 59)]),
  order('u06-04', false, [...mixedOf([4, 10], 1), ...decs(2, 101, 139), '5/4', '6/5', '7/5', '3/2']),
  order('u06-04', true, [...QUARTERS.map((x) => `${MINUS}${x}`), ...decs(1, 1, 9).map((x) => `${MINUS}${x}`), '0', ...QUARTERS, ...decs(1, 1, 9)], 3),
  order('u06-04', false, [...properOf([3, 5, 10, 20]), ...decs(3, 101, 899)], 3),
  order('u06-04', true, [...mixedOf([2, 5, 10], 3), ...decs(2, 201, 399), '12/5', '13/5', '17/5', '9/4']),
  order('u06-04', false, [...decs(2, 101, 149).map((x) => `${MINUS}${x}`), ...properOf([4, 5, 10]).map((x) => `${MINUS}${x}`), ...[1, 2].flatMap((w) => properOf([4, 5, 10]).map((x) => `${MINUS}${w} ${x}`))], 3),

  // ═════════ U06.5 — მოქმედებები წილადებსა და ათწილადებზე ═════════
  calc('u06-05', 1, '{f} + {x}', { f: C(POS_FR), x: C(D2) }, (v) => fAdd(v$(v, 'f'), v$(v, 'x')), () => true,
    (v, a) => `${String(v.f)} = ${decOf(v$(v, 'f'))}; ${decOf(v$(v, 'f'))} + ${String(v.x)} = ${a}.`),
  calc('u06-05', 1, '{x} − {f}', { x: C(D1), f: C(POS_FR) }, (v) => fSub(v$(v, 'x'), v$(v, 'f')), () => true,
    (v, a) => `${String(v.f)} = ${decOf(v$(v, 'f'))}; ${String(v.x)} − ${decOf(v$(v, 'f'))} = ${a}.`),
  calc('u06-05', 1, '{f} × {x}', { f: C(POS_FR), x: C(decs(1, 2, 19)) }, (v) => fMul(v$(v, 'f'), v$(v, 'x')), () => true,
    (v, a) => `${String(v.f)} = ${decOf(v$(v, 'f'))}; ${decOf(v$(v, 'f'))} × ${String(v.x)} = ${a}.`),
  calc('u06-05', 2, '{x} ÷ {f}', { x: C(decs(1, 11, 49)), f: C(POS_FR) }, (v) => fDiv(v$(v, 'x'), v$(v, 'f')), () => true,
    (v, a) => `${String(v.x)} ÷ ${String(v.f)} = ${String(v.x)} × ${fText(fDiv(fr(1), v$(v, 'f')))} = ${a}.`,
    (v) => [fMul(v$(v, 'x'), v$(v, 'f'))]),
  calc('u06-05', 2, '{f} + {g} − {x}', { f: C(POS_FR3), g: C(POS_FR3), x: C(decs(1, 1, 9)) }, (v) => fSub(fAdd(v$(v, 'f'), v$(v, 'g')), v$(v, 'x')), () => true,
    (v, a) => `${String(v.f)} + ${String(v.g)} = ${mText(fAdd(v$(v, 'f'), v$(v, 'g')))}; ${mText(fAdd(v$(v, 'f'), v$(v, 'g')))} − ${fText(v$(v, 'x'))} = ${a}.`),
  calc('u06-05', 2, '{x} × {f} + {y}', { x: C(decs(1, 11, 29)), f: C(POS_FR3), y: C(decs(2, 11, 49)) }, (v) => fAdd(fMul(v$(v, 'x'), v$(v, 'f')), v$(v, 'y')), () => true,
    (v, a) => `${String(v.x)} × ${String(v.f)} = ${mText(fMul(v$(v, 'x'), v$(v, 'f')))}; ${mText(fMul(v$(v, 'x'), v$(v, 'f')))} + ${String(v.y)} = ${a}.`),

  // ═════════ U06.6 — მრავალსაფეხურიანი მაგალითები ═════════
  calc('u06-06', 1, '{x} + {f} × {k}', { x: C(D1), f: C(POS_FR), k: C(['2', '3', '4', '5']) }, (v) => fAdd(v$(v, 'x'), fMul(v$(v, 'f'), v$(v, 'k'))), () => true,
    (v, a) => `ჯერ გავამრავლოთ: ${String(v.f)} × ${String(v.k)} = ${vt(fMul(v$(v, 'f'), v$(v, 'k')))}; ${String(v.x)} + ${vt(fMul(v$(v, 'f'), v$(v, 'k')))} = ${a}.`,
    (v) => [fMul(fAdd(v$(v, 'x'), v$(v, 'f')), v$(v, 'k'))]),
  calc('u06-06', 2, '({x} − {f}) ÷ {y}', { x: C(decs(1, 11, 29)), f: C(POS_FR), y: C(['0,25', '0,5', '0,2', '0,1']) }, (v) => fDiv(fSub(v$(v, 'x'), v$(v, 'f')), v$(v, 'y')), (v) => fCmp(v$(v, 'x'), v$(v, 'f')) > 0,
    (v, a) => `ფრჩხილში: ${String(v.x)} − ${String(v.f)} = ${vt(fSub(v$(v, 'x'), v$(v, 'f')))}; ${vt(fSub(v$(v, 'x'), v$(v, 'f')))} ÷ ${String(v.y)} = ${a}.`,
    (v) => [fSub(v$(v, 'x'), fDiv(v$(v, 'f'), v$(v, 'y')))]),
  calc('u06-06', 2, '{f} + {x} × {g}', { f: C(POS_FR3), x: C(decs(1, 1, 9)), g: C(POS_FR) }, (v) => fAdd(v$(v, 'f'), fMul(v$(v, 'x'), v$(v, 'g'))), () => true,
    (v, a) => `ჯერ გავამრავლოთ: ${String(v.x)} × ${String(v.g)} = ${vt(fMul(v$(v, 'x'), v$(v, 'g')))}; ${String(v.f)} + ${vt(fMul(v$(v, 'x'), v$(v, 'g')))} = ${a}.`,
    (v) => [fMul(fAdd(v$(v, 'f'), v$(v, 'x')), v$(v, 'g'))]),
  calc('u06-06', 2, '({x} + {f}) ÷ {y}', { x: C(decs(1, 11, 39)), f: C(POS_FR), y: C(['0,5', '0,2', '0,25', '0,1', '0,6', '1,5']) }, (v) => fDiv(fAdd(v$(v, 'x'), v$(v, 'f')), v$(v, 'y')), () => true,
    (v, a) => `ფრჩხილში: ${String(v.x)} + ${String(v.f)} = ${vt(fAdd(v$(v, 'x'), v$(v, 'f')))}; ${vt(fAdd(v$(v, 'x'), v$(v, 'f')))} ÷ ${String(v.y)} = ${a}.`),
  calc('u06-06', 3, '{m} − {x} + {f}', { m: C(mixedOf([2, 4, 5], 3)), x: C(decs(2, 11, 99)), f: C(POS_FR3) }, (v) => fAdd(fSub(v$(v, 'm'), v$(v, 'x')), v$(v, 'f')), () => true,
    (v, a) => `${String(v.m)} − ${String(v.x)} = ${vt(fSub(v$(v, 'm'), v$(v, 'x')))}; ${vt(fSub(v$(v, 'm'), v$(v, 'x')))} + ${String(v.f)} = ${a}.`),
  calc('u06-06', 3, '({x} − {f}) × {g}', { x: C(decs(1, 11, 39)), f: C(POS_FR), g: C(POS_FR3) }, (v) => fMul(fSub(v$(v, 'x'), v$(v, 'f')), v$(v, 'g')), (v) => fCmp(v$(v, 'x'), v$(v, 'f')) > 0,
    (v, a) => `ფრჩხილში: ${String(v.x)} − ${String(v.f)} = ${vt(fSub(v$(v, 'x'), v$(v, 'f')))}; ${vt(fSub(v$(v, 'x'), v$(v, 'f')))} × ${String(v.g)} = ${a}.`),
];
