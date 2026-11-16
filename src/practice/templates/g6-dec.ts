import { MINUS, dec, group } from './g6-helpers';

/**
 * Exact decimal vocabulary for the Grade VI decimal units. A decimal travels as
 * an integer `a` and a count of places `p` (value = a / 10^p), so sums,
 * products and roundings are done in integers and never drift.
 */

export const pow10 = (p: number): number => 10 ** p;

/** `a` with `p` places, trailing zeros kept: fx(1234, 3) = `1,234`, fx(12340, 3) = `12,34`. */
export const fx = (a: number, p: number): string => {
  const negative = a < 0;
  const abs = Math.abs(a);
  const whole = Math.floor(abs / pow10(p));
  const rest = String(abs % pow10(p)).padStart(p, '0');
  const body = p > 0 ? `${group(whole)},${rest}` : group(whole);
  return negative ? `${MINUS}${body}` : body;
};

/** The same number with trailing zeros trimmed (how a result is printed). */
export const dd = (a: number, p: number): string => dec(a / pow10(p), p);

/** Trimmed print of a plain number (up to eight places). */
export const ds = (x: number): string => dec(x, 8);

/** `a` re-expressed with `q` places (q >= p). */
export const sc = (a: number, p: number, q: number): number => a * pow10(q - p);

/** Round half up to `t` places: a/10^p → integer count of 10^-t. */
export const roundAt = (a: number, p: number, t: number): number => {
  if (t >= p) return a * pow10(t - p);
  const f = pow10(p - t);
  return Math.floor((a + f / 2) / f);
};

/** Truncate to `t` places. */
export const truncAt = (a: number, p: number, t: number): number => Math.floor(a / pow10(Math.max(p - t, 0)));

export const PLACE_GEN = ['ერთეულების', 'მეათედების', 'მეასედების', 'მეათასედების', 'ათიათასედების'];
export const PLACE_NOM = ['ერთეული', 'მეათედი', 'მეასედი', 'მეათასედი', 'ათიათასედი'];

/** A decimal's digits after the point. */
export const fracDigits = (a: number, p: number): number[] =>
  String(Math.abs(a) % pow10(p)).padStart(p, '0').split('').map(Number);

/** True when a fraction in lowest terms terminates as a decimal (only 2s and 5s in the denominator). */
export const terminates = (d: number): boolean => {
  let r = d;
  while (r % 2 === 0) r /= 2;
  while (r % 5 === 0) r /= 5;
  return r === 1;
};
