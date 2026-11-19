/**
 * G2 U03 two-digit addition and subtraction — pure and exact.
 *
 * Everything here is ordinary arithmetic written out in places, so the same numbers drive the picture, the algorithm and
 * the check:
 *
 *  - a sum is `a + b`; the ones column is `(a+b) % 10` and a ten is carried exactly when the ones add up to ten or more;
 *  - a difference is `a − b`; a ten has to be broken exactly when the ones digit of `b` is bigger than the ones of `a`;
 *  - a subtraction is checked by adding, because `b + difference = a` is the definition of the answer, not a separate
 *    trick.
 *
 * A regroup is therefore never a decoration on a picture: `needsCarry`, `needsBorrow` and the digits they produce are the
 * same digits the written sum has.
 */

// ─────────────────────────── columns ───────────────────────────

export type Col = 'tens' | 'ones';

export const COLS: Col[] = ['tens', 'ones'];

export const COL_NAME: Record<Col, string> = { tens: 'ათეულები', ones: 'ერთეულები' };

/** The tens digit (0–9) and the ones digit of a two-digit number. */
export interface TwoDigits {
  tens: number;
  ones: number;
}

const isTwoDigit = (n: number): boolean => Number.isInteger(n) && n >= 0 && n <= 99;

export function digits2(n: number): TwoDigits {
  if (!isTwoDigit(n)) throw new RangeError(`digits2 supports whole numbers 0–99, got ${n}`);
  return { tens: Math.floor(n / 10), ones: n % 10 };
}

/** The number the two digits make. */
export const fromDigits = (d: TwoDigits): number => d.tens * 10 + d.ones;

export const digitAt = (n: number, col: Col): number => digits2(n)[col];

/** The value of a digit in its column: the 4 of 45 is worth 40, not 4. */
export const colValue = (n: number, col: Col): number => digitAt(n, col) * (col === 'tens' ? 10 : 1);

// ─────────────────────────── addition ───────────────────────────

/** Whether the ones digits add up to ten or more — exactly when a ten must be carried. */
export const needsCarry = (a: number, b: number): boolean => digits2(a).ones + digits2(b).ones >= 10;

/** The number carried from the ones column into the tens: 0 or 1. */
export const carriedTen = (a: number, b: number): number => (needsCarry(a, b) ? 1 : 0);

/** The ones digit written in the answer. */
export const sumOnes = (a: number, b: number): number => (digits2(a).ones + digits2(b).ones) % 10;

/** The tens digit written in the answer, carried ten included. */
export const sumTens = (a: number, b: number): number => digits2(a).tens + digits2(b).tens + carriedTen(a, b);

/** The sum, worked out column by column — the answer the algorithm must produce. */
export function columnSum(a: number, b: number): number {
  digits2(a);
  digits2(b);
  return sumTens(a, b) * 10 + sumOnes(a, b);
}

/** The sum as it is written: `a + b = total`. Never trusted on its own — `columnSum` is what the check uses. */
export function sumParts(a: number, b: number): { onesAdd: number; tensAdd: number; carry: number; total: number } {
  const onesAdd = digits2(a).ones + digits2(b).ones;
  const tensAdd = digits2(a).tens + digits2(b).tens;
  return { onesAdd, tensAdd, carry: carriedTen(a, b), total: columnSum(a, b) };
}

// ─────────────────────────── subtraction ───────────────────────────

/** Whether a ten must be broken open: the ones of `b` are bigger than the ones of `a`. */
export const needsBorrow = (a: number, b: number): boolean => digits2(a).ones < digits2(b).ones;

/** The ones digit after regrouping (ten ones added to the ones of `a`) minus the ones of `b`. */
export const differenceOnes = (a: number, b: number): number => (needsBorrow(a, b) ? digits2(a).ones + 10 : digits2(a).ones) - digits2(b).ones;

/** The tens digit after one ten may have been broken open. */
export const differenceTens = (a: number, b: number): number => digits2(a).tens - (needsBorrow(a, b) ? 1 : 0) - digits2(b).tens;

/** The difference, worked out column by column. Throws when `b` is bigger: within this unit a difference is not negative. */
export function columnDifference(a: number, b: number): number {
  digits2(a);
  digits2(b);
  if (b > a) throw new RangeError(`columnDifference needs a ≥ b, got ${a} − ${b}`);
  return differenceTens(a, b) * 10 + differenceOnes(a, b);
}

/** What a subtraction is made of, so a board can draw each step from the numbers. */
export function differenceParts(a: number, b: number): { onesBefore: number; onesAfter: number; borrow: boolean; tensBefore: number; tensAfter: number; total: number } {
  if (b > a) throw new RangeError(`differenceParts needs a ≥ b, got ${a} − ${b}`);
  const borrow = needsBorrow(a, b);
  return {
    onesBefore: digits2(a).ones,
    // after the break the ones column holds ten more than it did, so the subtraction never goes negative
    onesAfter: (borrow ? digits2(a).ones + 10 : digits2(a).ones) - digits2(b).ones,
    borrow,
    tensBefore: digits2(a).tens,
    tensAfter: digits2(a).tens - digits2(b).tens,
    total: columnDifference(a, b),
  };
}

/** Checking a subtraction: the difference plus the number taken away must give the start. */
export const checkDifference = (a: number, b: number, answer: number): boolean => b + answer === a && answer >= 0;

// ─────────────────────────── the written algorithm ───────────────────────────

/**
 * The two-digit sum written in columns, with the carry shown above the tens exactly when there is one. Returned as text
 * so a screen reader and a sighted student are told the same thing.
 */
export function sumText(a: number, b: number): string {
  const carry = carriedTen(a, b);
  const base = `${a} + ${b} = ${columnSum(a, b)}`;
  return carry ? `${base} (ერთეულები: ${digits2(a).ones} + ${digits2(b).ones} = ${digits2(a).ones + digits2(b).ones}, 1 ათეული გადადის)` : base;
}

/** The two-digit difference written in columns, naming the regroup when there is one. */
export function differenceText(a: number, b: number): string {
  const base = `${a} − ${b} = ${columnDifference(a, b)}`;
  return needsBorrow(a, b)
    ? `${base} (ერთეულები: ${digits2(a).ones} < ${digits2(b).ones}, ამიტომ 1 ათეული იშლება 10 ერთეულად)`
    : base;
}

// ─────────────────────────── word problems ───────────────────────────

export type Operation = 'add' | 'subtract';

/**
 * Which operation a story needs. The story is stored with the numbers it uses and what happens to them — nothing here
 * reads the words, so a story can never be marked right because of how it is phrased.
 */
export const operationOf = (kind: 'join' | 'separate' | 'compare'): Operation => (kind === 'separate' ? 'subtract' : 'add');

/** The answer a story's numbers give, computed from its operation. */
export function storyAnswer(kind: 'join' | 'separate' | 'compare', a: number, b: number): number {
  if (kind === 'separate') {
    if (b > a) throw new RangeError(`a story cannot take ${b} away from ${a}`);
    return a - b;
  }
  return a + b;
}

/** Whether the answer makes sense in the story: a quantity cannot be negative, and a remainder cannot exceed the start. */
export const answerMakesSense = (kind: 'join' | 'separate' | 'compare', a: number, b: number, answer: number): boolean =>
  kind === 'separate' ? answer >= 0 && answer <= a : answer >= 0 && answer <= a + b;

/** `+` or `−` as it is written. */
export const opSign = (op: Operation): '+' | '−' => (op === 'add' ? '+' : '−');

export const opName = (op: Operation): string => (op === 'add' ? 'შეკრება' : 'გამოკლება');
