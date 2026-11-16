import type { Vars } from './types';
import { C, N, fr, gcd, lcm, mText, fText } from './g6-helpers';
import type { Frac } from './g6-helpers';

/**
 * Fraction vocabulary shared by the Grade VI fraction units (U04, U06, U13…).
 * Fractions travel through template variables as printed strings — `3/4` or
 * `2 1/3` — so the prompt shows exactly what the formula reads.
 */

/** `n/d` strings in lowest terms, n < d. */
export const properPool = (minD: number, maxD: number, minN = 1): string[] => {
  const out: string[] = [];
  for (let d = minD; d <= maxD; d += 1) for (let n = minN; n < d; n += 1) if (gcd(n, d) === 1) out.push(`${n}/${d}`);
  return out;
};

/** `w n/d` strings with a lowest-terms proper part. */
export const mixedPool = (maxWhole: number, minD: number, maxD: number, minWhole = 1): string[] => {
  const out: string[] = [];
  for (let w = minWhole; w <= maxWhole; w += 1) for (const f of properPool(minD, maxD)) out.push(`${w} ${f}`);
  return out;
};

/** The Frac behind a printed `n/d`, `w n/d` or whole number. */
export const parseF = (text: string): Frac => {
  const mixed = /^(\d+) (\d+)\/(\d+)$/.exec(text);
  if (mixed) return fr(Number(mixed[1]) * Number(mixed[3]) + Number(mixed[2]), Number(mixed[3]));
  const plain = /^(\d+)\/(\d+)$/.exec(text);
  if (plain) return fr(Number(plain[1]), Number(plain[2]));
  return fr(Number(text));
};

/** The fraction held by variable `name`. */
export const fv = (v: Vars, name: string): Frac => parseF(String(v[name]));

/** `[numerator, denominator]` of a printed `n/d` (not reduced). */
export const nd = (v: Vars, name: string): [number, number] => {
  const m = /^(\d+)\/(\d+)$/.exec(String(v[name]));
  return m ? [Number(m[1]), Number(m[2])] : [N(v, name), 1];
};

/** `[whole, numerator, denominator]` of a printed `w n/d`. */
export const wnd = (v: Vars, name: string): [number, number, number] => {
  const m = /^(\d+) (\d+)\/(\d+)$/.exec(String(v[name]));
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : [0, 0, 1];
};

export const fpool = (pool: string[]) => C(pool);

/** Mixed-number text from parts (`3 2/5`), a plain fraction, or a whole number. */
export const mixedText = (whole: number, n: number, d: number): string =>
  n === 0 ? String(whole) : whole === 0 ? `${n}/${d}` : `${whole} ${n}/${d}`;

/** Slips around a fraction answer. `print` decides mixed or improper form. */
export const fracSlips = (answer: Frac, extra: Frac[] = [], print: (f: Frac) => string = mText): string[] => {
  const out: Frac[] = [...extra];
  out.push(fr(answer.n + 1, answer.d), fr(answer.n - 1, answer.d), fr(answer.n, answer.d + 1), fr(answer.n + answer.d, answer.d), fr(answer.n + 2, answer.d), fr(answer.n, answer.d + 2), fr(answer.n + 2 * answer.d, answer.d));
  if (answer.n > answer.d) out.push(fr(answer.n - answer.d, answer.d));
  if (answer.n !== 0) out.push(fr(answer.d, answer.n));
  return out.filter((f) => f.n > 0 && f.d > 0).map(print);
};

export { lcm, fText, mText };

/** Nearest whole number to a fraction (ties are avoided by callers). */
export const roundWhole = (f: Frac): number => Math.round(f.n / f.d);

/** True when the fraction sits exactly halfway between two whole numbers. */
export const isHalf = (f: Frac): boolean => f.d === 2;
