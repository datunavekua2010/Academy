/**
 * Helpers shared by the Grade V and Grade VI interactive and pictured templates
 * (`ix-g5`, `px-g5`, `ix-g6`, `px-g6`).
 */
import type { Vars } from './types';
import { rotate } from './ix-kit34';

export const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
export const lcm = (a: number, b: number): number => (a / gcd(a, b)) * b;
export const frac = (n: number, d: number): string => `${n}/${d}`;
/** A fraction in lowest terms, as „n/d“. */
export const fracLow = (n: number, d: number): string => `${n / gcd(n, d)}/${d / gcd(n, d)}`;
/** Compares a/b with c/d: −1, 0 or 1. */
export const cmpFrac = (a: number, b: number, c: number, d: number): number => Math.sign(a * d - c * b);

/** A true minus sign for negatives (the way every picture and prompt writes them). */
export const neg = (n: number | string): string => String(n).replace('-', '−');

/** A decimal written with a comma and no trailing zeros: 1.50 → „1,5“. */
export const dec = (x: number, places = 4): string => String(Number(x.toFixed(places))).replace('.', ',');
/** The same number from integer hundredths / tenths / thousandths: `decOf(1235, 3)` → „1,235“. */
export const decOf = (k: number, places: number): string => dec(k / 10 ** places, places);

/** Roman numerals 1…399. */
export const romanFull = (n: number): string => {
  const table: Array<[number, string]> = [[100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  let left = n;
  let out = '';
  for (const [value, symbol] of table) {
    while (left >= value) {
      out += symbol;
      left -= value;
    }
  }
  return out;
};

export const divisorsOf = (n: number): number[] => Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);

/** Four distinct text options: the key and the wrong ones (the extras are only used when a wrong one repeats). */
export const opts4 = (key: string, wrongs: string[]): string[] => [...new Set([key, ...wrongs])].slice(0, 4);

/** `items` shuffled by a drawn rotation `r`; `at` is the 1-based position of `key`. */
export function shuffled<T>(items: T[], r: number, key: T): { items: T[]; at: number } {
  const out = rotate(items, r);
  return { items: out, at: out.indexOf(key) + 1 };
}

/** Points of a regular n-gon (mathematical coordinates, y up). */
export const regularMath = (n: number): Array<[number, number]> =>
  Array.from({ length: n }, (_, i) => [Math.cos(((90 + (360 / n) * i) * Math.PI) / 180), Math.sin(((90 + (360 / n) * i) * Math.PI) / 180)] as [number, number]);

/** Evaluates `a s1 b s2 c` with the usual precedence; null when any step is not a whole number. */
export function evalSigns(a: number, s1: string, b: number, s2: string, c: number): number | null {
  const apply = (x: number, s: string, y: number): number | null => {
    if (s === '+') return x + y;
    if (s === '−') return x - y;
    if (s === '×') return x * y;
    if (s === '÷') return y !== 0 && x % y === 0 ? x / y : null;
    return null;
  };
  const high = (s: string) => s === '×' || s === '÷';
  if (high(s2) && !high(s1)) {
    const right = apply(b, s2, c);
    return right === null ? null : apply(a, s1, right);
  }
  const left = apply(a, s1, b);
  return left === null ? null : apply(left, s2, c);
}

export const SIGN4 = ['+', '−', '×', '÷'];
export const numOf = (v: Vars, key: string): number => Number(v[key]);
