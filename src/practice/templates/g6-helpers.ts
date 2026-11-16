import {
  defineTemplate,
  type QuestionTemplate,
  type TemplateConstraint,
  type VariableSpec,
  type Vars,
} from './types';
import { group, gcd, lcm, isPrime, factorize, divisorsOf, superscript, powerText } from './g5-helpers';

/**
 * Shared helpers for the Grade VI libraries.
 *
 * Grade VI differs from Grade V in one way that shapes every helper here:
 * the numbers are **signed, fractional and decimal**, and the answer is read
 * off the screen as text. So a Grade VI template deals in *display strings*:
 * the key and every option are produced by the same formatter, which is what
 * keeps "−5" from being one thing in the key and "-5" in an option.
 *
 * Conventions (runbook Part E) that this file enforces for every template:
 *  - decimal comma, thin-space thousands, U+2212 minus, × and ÷;
 *  - no caret for a power — use `superscript` / `powerText`;
 *  - a prompt placeholder is always a declared variable;
 *  - options are built by hand for non-numeric answers; only a numeric
 *    answer is ever padded with near-misses.
 */

export { group, gcd, lcm, isPrime, factorize, divisorsOf, superscript, powerText };

export const MINUS = '\u2212';

// ───────────────────────────── number display ─────────────────────────────

/** A signed whole number as printed: `−1 234`. */
export const sg = (n: number): string => {
  const rounded = Math.round(n);
  return rounded < 0 ? `${MINUS}${group(-rounded)}` : group(rounded);
};

/** A negative operand inside an expression: `(−7)`, a positive one bare. */
export const par = (n: number): string => (n < 0 ? `(${sg(n)})` : sg(n));

/** `a + (−b)`-style signed term for the middle of an expression. */
export const term = (n: number): string => (n < 0 ? `${MINUS} ${group(-n)}` : `+ ${group(n)}`);

/** Decimal with a comma, trailing zeros trimmed, thousands grouped. */
export const dec = (value: number, places = 2): string => {
  const factor = 10 ** places;
  const rounded = Math.round(value * factor) / factor;
  if (rounded === 0) return '0';
  const negative = rounded < 0;
  const fixed = Math.abs(rounded).toFixed(places);
  const [whole, fraction = ''] = fixed.split('.');
  const trimmed = fraction.replace(/0+$/, '');
  const body = trimmed ? `${group(Number(whole))},${trimmed}` : group(Number(whole));
  return negative ? `${MINUS}${body}` : body;
};

/** Parses what `sg`/`dec` print back into a number. */
export const readNumber = (text: string): number =>
  Number(
    text
      .replace(new RegExp(MINUS, 'g'), '-')
      .replace(/[\s\u00a0\u2009]/g, '')
      .replace(',', '.'),
  );

/** How many decimals a printed number has. */
const decimalsOf = (text: string): number => {
  const comma = text.indexOf(',');
  return comma < 0 ? 0 : text.length - comma - 1;
};

const isNumberText = (text: string): boolean => /^[\u2212-]?[\d\s]+(,\d+)?$/.test(text);

/**
 * Four distinct options, the right one first.
 *
 * Wrong options are the mistakes a student makes. When there are not enough of
 * them and the answer is a number, the set is padded with its neighbours at the
 * precision the answer is printed in; any other answer must come with enough
 * options of its own, and a short set fails loudly instead of being invented.
 */
export const opts = (right: string, wrongs: Array<string | number>, count = 4): string[] => {
  const numeric = isNumberText(right);
  const places = numeric ? decimalsOf(right) : 0;
  const show = (item: string | number): string =>
    typeof item === 'number' ? (places > 0 ? dec(item, places) : sg(item)) : item;

  const out: string[] = [right];
  const rightValue = numeric ? readNumber(right) : 0;
  for (const item of wrongs) {
    if (typeof item === 'number') {
      if (!Number.isFinite(item)) continue;
      // A slip that leaves the answer's own kind (a fraction of a count, a negative size) is no slip.
      if (places === 0 && !Number.isInteger(item)) continue;
      if (numeric && rightValue > 0 && item <= 0) continue;
    }
    const text = show(item);
    if (!out.includes(text)) out.push(text);
    if (out.length === count) return out;
  }
  if (numeric) {
    const base = readNumber(right);
    const step = 1 / 10 ** places;
    for (const delta of [1, -1, 2, -2, 10, -10, 3, -3, 5, -5, 100, -100]) {
      const text = show(Math.round((base + delta * step) * 10 ** places) / 10 ** places);
      if (!out.includes(text)) out.push(text);
      if (out.length === count) return out;
    }
  }
  return out;
};

// ───────────────────────────── variable shortcuts ─────────────────────────────

/** An integer variable. */
export const I = (
  min: number | ((v: Vars) => number),
  max: number | ((v: Vars) => number),
  extra: { step?: number; nonZero?: boolean; reverse?: boolean } = {},
): VariableSpec => ({ kind: 'int', min, max, ...extra });

/** A pool variable. */
export const C = (values: Array<number | string> | ((v: Vars) => Array<number | string>)): VariableSpec => ({
  kind: 'choice',
  values,
});

/** A variable derived from the ones drawn before it. */
export const D = (compute: (v: Vars) => number | string): VariableSpec => ({
  kind: 'choice',
  values: (v: Vars) => [compute(v)],
});

/** The printed form of a numeric variable: signed, grouped. */
export const S = (name: string): VariableSpec => D((v) => sg(Number(v[name])));

export const N = (v: Vars, name: string): number => Number(v[name]);

/** One field of a pipe-separated `spec` row. */
export const F = (index: number): VariableSpec => D((v) => String(v.spec).split('|')[index] ?? '');

/** A pipe-separated `spec` row as numbers. */
export const rowN = (v: Vars): number[] => String(v.spec).split('|').map(readNumber);

export const SPEC = (rows: string[]): VariableSpec => ({ kind: 'choice', values: rows });

// ───────────────────────────── template factory ─────────────────────────────

export interface Q6Options {
  id: string;
  topic: string;
  /** The grade the template belongs to (6 unless a Grade VII unit says otherwise). */
  grade?: 6 | 7;
  sub: string;
  d?: 1 | 2 | 3;
  prompt: string;
  vars: Record<string, VariableSpec>;
  /** The key, as printed. */
  answer: (v: Vars) => string;
  /** Wrong options — numbers are printed like the key. */
  wrong?: (v: Vars, right: string) => Array<string | number>;
  /** Or the whole option set (answer included) when the options are not numbers. */
  options?: (v: Vars, right: string) => string[];
  /** Georgian explanation; must end in the answer. */
  why: (v: Vars, answer: string) => string;
  constraints?: TemplateConstraint[];
  optionCount?: number;
  hint?: string;
}

/** Builds one Grade VI (or, with `grade: 7`, Grade VII) template. */
export const q6 = (o: Q6Options): QuestionTemplate =>
  defineTemplate({
    id: o.id,
    grade: o.grade ?? 6,
    topicId: o.topic,
    unitId: o.topic,
    subtopicId: o.sub,
    prompt: o.prompt,
    variables: o.vars,
    answer: (v) => o.answer(v),
    options: (v) => {
      const right = o.answer(v);
      if (!o.options) return opts(right, o.wrong ? o.wrong(v, right) : [], o.optionCount ?? 4);
      // The right option leads; repeats are dropped and the set is trimmed, so a
      // template can offer one candidate too many and never ship a duplicate.
      const unique: string[] = [];
      for (const item of o.options(v, right)) if (!unique.includes(item)) unique.push(item);
      const count = o.optionCount ?? 4;
      // A short, numeric set is topped up with neighbours of the key, as `opts` does.
      if (unique.length < count && isNumberText(right)) return opts(right, unique.filter((x) => x !== right), count);
      return unique.slice(0, count);
    },
    ...(o.constraints ? { constraints: o.constraints } : {}),
    ...(o.optionCount ? { optionCount: o.optionCount } : {}),
    ...(o.hint ? { hint: o.hint } : {}),
    explanation: ({ vars, answer }) => o.why(vars, answer),
    difficulty: o.d ?? 1,
  });

// ───────────────────────────── exact rational arithmetic ─────────────────────────────

/** A fraction in lowest terms, denominator always positive. */
export interface Frac {
  n: number;
  d: number;
}

export const fr = (n: number, d = 1): Frac => {
  const g = gcd(n, d) || 1;
  const sign = d < 0 ? -1 : 1;
  return { n: (sign * n) / g, d: (sign * d) / g };
};
export const fAdd = (a: Frac, b: Frac): Frac => fr(a.n * b.d + b.n * a.d, a.d * b.d);
export const fSub = (a: Frac, b: Frac): Frac => fr(a.n * b.d - b.n * a.d, a.d * b.d);
export const fMul = (a: Frac, b: Frac): Frac => fr(a.n * b.n, a.d * b.d);
export const fDiv = (a: Frac, b: Frac): Frac => fr(a.n * b.d, a.d * b.n);
export const fCmp = (a: Frac, b: Frac): number => a.n * b.d - b.n * a.d;
export const fVal = (a: Frac): number => a.n / a.d;

/** `3/4`, `−2/3`, or a whole number when the denominator is 1. */
export const fText = (a: Frac): string => {
  const sign = a.n < 0 ? MINUS : '';
  const top = Math.abs(a.n);
  return a.d === 1 ? `${sign}${top}` : `${sign}${top}/${a.d}`;
};

/** The same fraction written without reducing: `6/8`. */
export const rawF = (n: number, d: number): string => `${n < 0 ? MINUS : ''}${Math.abs(n)}/${d}`;

/** A mixed number: `2 1/3`, `−1 1/2`, or a plain fraction / whole number. */
export const mText = (a: Frac): string => {
  const sign = a.n < 0 ? MINUS : '';
  const top = Math.abs(a.n);
  const whole = Math.floor(top / a.d);
  const rest = top % a.d;
  if (rest === 0) return `${sign}${whole}`;
  return whole === 0 ? `${sign}${rest}/${a.d}` : `${sign}${whole} ${rest}/${a.d}`;
};

/** A finite decimal as an exact fraction: 0,75 → 3/4. */
export const decToFrac = (value: number, places: number): Frac => fr(Math.round(value * 10 ** places), 10 ** places);

// ───────────────────────────── Georgian number words ─────────────────────────────

const ONES = ['', 'ერთი', 'ორი', 'სამი', 'ოთხი', 'ხუთი', 'ექვსი', 'შვიდი', 'რვა', 'ცხრა'];
const TEENS = [
  'ათი', 'თერთმეტი', 'თორმეტი', 'ცამეტი', 'თოთხმეტი', 'თხუთმეტი',
  'თექვსმეტი', 'ჩვიდმეტი', 'თვრამეტი', 'ცხრამეტი',
];
const TWENTIES = ['', 'ოც', 'ორმოც', 'სამოც', 'ოთხმოც'];
const HUNDREDS = ['', '', 'ორას', 'სამას', 'ოთხას', 'ხუთას', 'ექვსას', 'შვიდას', 'რვაას', 'ცხრაას'];

/** 1…99 as one word; `last` decides between `ოცი` and the joining form `ოც`. */
const below100 = (n: number): string => {
  if (n < 10) return ONES[n]!;
  if (n < 20) return TEENS[n - 10]!;
  const k = Math.floor(n / 20);
  const r = n % 20;
  if (r === 0) return `${TWENTIES[k]}ი`;
  return `${TWENTIES[k]}და${r < 10 ? ONES[r] : TEENS[r - 10]}`;
};

/** 1…999. A round hundred keeps its `ი`; a hundred followed by more drops it. */
const below1000 = (n: number): string => {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (h === 0) return below100(rest);
  const hundred = h === 1 ? 'ას' : HUNDREDS[h]!;
  if (rest === 0) return `${hundred}ი`;
  return `${hundred} ${below100(rest)}`;
};

/** The number in Georgian words, as the academy's bank writes it. */
export const georgianWords = (n: number): string => {
  if (n === 0) return 'ნული';
  const parts: string[] = [];
  const millions = Math.floor(n / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1000);
  const rest = n % 1000;
  if (millions > 0) {
    parts.push(`${below1000(millions)} ${rest === 0 && thousands === 0 ? 'მილიონი' : 'მილიონ'}`);
  }
  if (thousands > 0) {
    const tail = rest === 0 ? 'ათასი' : 'ათას';
    parts.push(thousands === 1 ? tail : `${below1000(thousands)} ${tail}`);
  }
  if (rest > 0) parts.push(below1000(rest));
  return parts.join(' ');
};

// ───────────────────────────── small helpers ─────────────────────────────

/** Roman numeral for 1…3999. */
export const roman = (n: number): string => {
  const table: Array<[number, string]> = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
    [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let rest = n;
  let out = '';
  for (const [value, text] of table) {
    while (rest >= value) {
      out += text;
      rest -= value;
    }
  }
  return out;
};

/** Digits of a number, most significant first. */
export const digitsOf = (n: number): number[] => String(Math.abs(n)).split('').map(Number);

/** `1 ➜ [..]` join for a list of numbers: `3; 5; 8`. */
export const listText = (values: number[], separator = '; '): string => values.map((x) => sg(x)).join(separator);

/** A number rounded to a place: `roundTo(1284, 10)` → 1280. */
export const roundToPlace = (n: number, place: number): number => Math.round(n / place) * place;

// ───────────────────────────── deterministic sampling ─────────────────────────────

/**
 * A small seeded generator. A template draws one integer `s` and derives every
 * "pick k of these" from it, so the prompt, the key and the options all read the
 * same pick and a restored session reproduces it exactly.
 */
export const lcg = (seed: number): (() => number) => {
  let state = (Math.imul(seed + 1, 2654435761) ^ 0x9e3779b9) >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

/** `k` distinct items of `pool`, chosen and ordered by `seed`. */
export const sampleBy = <T>(pool: readonly T[], seed: number, k: number): T[] => {
  const next = lcg(seed);
  const items = [...pool];
  const out: T[] = [];
  for (let i = 0; i < k && items.length > 0; i += 1) {
    const index = Math.floor(next() * items.length);
    out.push(items.splice(index, 1)[0]!);
  }
  return out;
};

/** `<`, `=` or `>` — the sign a student writes between two values. */
export const sign3 = (a: number, b: number): string => (a < b ? '<' : a > b ? '>' : '=');

export const SIGNS = ['<', '=', '>'];

/** The number with its first adjacent pair of different digits (after the first) swapped. */
export const swapAdjacent = (n: number): number => {
  const digits = String(n).split('');
  for (let i = 1; i < digits.length - 1; i += 1) {
    if (digits[i] !== digits[i + 1]) {
      [digits[i], digits[i + 1]] = [digits[i + 1]!, digits[i]!];
      return Number(digits.join(''));
    }
  }
  return n;
};
