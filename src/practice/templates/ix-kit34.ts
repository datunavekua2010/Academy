/**
 * Helpers shared by the Grade III and Grade IV interactive and pictured
 * templates (`ix-g3`, `px-g3`, `ix-g4`, `px-g4`).
 */
import type { Picture } from '../pictures/types';
import type { Vars } from './types';
import { icons, manyRows } from './ix-kit';

export const signOf = (a: number, b: number): string => (a < b ? '<' : a > b ? '>' : '=');
export const SIGNS = ['<', '>', '='];

export const modelPic = (whole: string | number, ...parts: Array<string | number>): Picture => ({ kind: 'model', whole: String(whole), parts: parts.map(String) });
export const barsPic = (items: Array<{ label?: string; size: number; caption?: string }>): Picture => ({ kind: 'bars', items });
export const linePic = (from: number, to: number, step: number, ...marks: Array<number | { value: number; label?: string }>): Picture => ({
  kind: 'line',
  from,
  to,
  step,
  marks: marks.map((m) => (typeof m === 'number' ? { value: m, label: String(m) } : m)),
});
export const partsPic = (n: number, shaded: number): Picture => ({
  kind: 'parts',
  bars: [Array.from({ length: n }, (_, i) => ({ size: 1, shaded: i < shaded }))],
});
export const rectPic = (w: number, h: number, unit = 'სმ'): Picture => ({ kind: 'rect', width: `${w} ${unit}`, height: `${h} ${unit}`, wv: w, hv: h });
export const clockPic = (hour: number, minute: number): Picture => ({ kind: 'clock', minutes: (hour % 12) * 60 + minute });

/** A grid of identical icons: `rows` rows of `cols`. */
export const arrayPic = (rows: number, cols: number, icon: string, label?: string): Picture => ({
  kind: 'rows',
  rows: Array.from({ length: rows }, (_, r) => ({ label: r === 0 ? label : undefined, tokens: icons(icon, cols) })),
});

/** Groups of icons joined by a sign: `3 + 4 + 2`. */
export const groupsPic = (icon: string, counts: number[], sign = '+'): Picture =>
  manyRows([
    {
      tokens: counts.flatMap((c, i) => [
        ...(i > 0 ? [{ t: 'text' as const, text: sign }] : []),
        { t: 'group' as const, tokens: icons(icon, c) },
      ]),
    },
  ]);

/** A list variable of numbers, read back as `number[]`. */
export const list = (v: Vars, key: string): number[] => (v[key] as Array<number | string>).map(Number);

export const sum = (xs: number[]): number => xs.reduce((a, b) => a + b, 0);
export const minCoins = (n: number): number => {
  let left = n;
  let count = 0;
  for (const coin of [50, 20, 10, 5, 2, 1]) {
    count += Math.floor(left / coin);
    left %= coin;
  }
  return count;
};

export const PATTERN_ICONS = ['dot-red', 'dot-blue', 'dot-green', 'dot-yellow', 'star', 'heart', 'apple', 'shape-triangle'];
/** The icons of a repeating pattern like `ABC`: what is shown, what comes next, and the palette. */
export const patternSeq = (unit: string, picks: number[], next = 3): { shown: string[]; next: string[]; palette: string[] } => {
  const map: Record<string, string> = {};
  'ABCD'.split('').forEach((letter, i) => (map[letter] = PATTERN_ICONS[picks[i] ?? i]!));
  const seq = (n: number) => Array.from({ length: n }, (_, i) => map[unit[i % unit.length]!]!);
  const shownLength = unit.length * 2 + 1;
  return { shown: seq(shownLength), next: seq(shownLength + next).slice(shownLength), palette: [...new Set(Object.values(map))] };
};

export const WEEKDAY_SHORT = ['ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ', 'კვი'];

/** A fraction option set: the key and the usual wrong ones. */
export const fractionChoices = (num: number, den: number) => (): string[] =>
  [...new Set([`${num}/${den}`, `${den - num}/${den}`, `${num}/${den + 1}`, `1/${den}`, `${num + 1}/${den}`, `${den}/${num}`])].slice(0, 4);

export const isPrime = (n: number): boolean => {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) if (n % d === 0) return false;
  return true;
};

export const roman = (n: number): string => {
  const table: Array<[number, string]> = [[50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
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

/** `n` formatted as a decimal with a comma: 13 tenths → „1,3“. */
export const tenths = (k: number): string => `${Math.floor(k / 10)},${k % 10}`;

/** `items` rotated left by `by` places (a deterministic „shuffle“ driven by a drawn variable). */
export const rotate = <T,>(items: T[], by: number): T[] => {
  const k = ((by % items.length) + items.length) % items.length;
  return [...items.slice(k), ...items.slice(0, k)];
};
