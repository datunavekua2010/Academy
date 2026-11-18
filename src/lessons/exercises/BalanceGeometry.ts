/**
 * U09 equality and balance — pure and exact.
 *
 * The equals sign is not "put the answer here": it says the two sides have the same value. Every check in this unit
 * therefore compares *values*, never the look of the two pans and never the order of the numbers. A scale is
 * balanced exactly when its two totals are equal, and that is computed here rather than drawn once and trusted.
 */

/** One side of a scale: weights that add up to its total. */
export interface PanSpec {
  /** The numbers put on this pan; the pan's weight is their sum. */
  weights: number[];
}

/** A balance scale: two pans and what is on them. */
export interface ScaleSpec {
  left: PanSpec;
  right: PanSpec;
  /** Optional unit word shown after each number. */
  unit?: string;
}

export const panTotal = (pan: PanSpec): number => pan.weights.reduce((sum, w) => sum + w, 0);

export const leftTotal = (scale: ScaleSpec): number => panTotal(scale.left);
export const rightTotal = (scale: ScaleSpec): number => panTotal(scale.right);

/** Which way the beam tips. `level` is the only state in which the two sides are equal. */
export type Tilt = 'level' | 'left' | 'right';

export function tiltOf(scale: ScaleSpec): Tilt {
  const l = leftTotal(scale);
  const r = rightTotal(scale);
  return l === r ? 'level' : l > r ? 'left' : 'right';
}

export const isBalanced = (scale: ScaleSpec): boolean => leftTotal(scale) === rightTotal(scale);

/** The heavier side, in words, or `null` when they are equal. Used by feedback, never by the pictures alone. */
export function heavierSide(scale: ScaleSpec): 'left' | 'right' | null {
  const l = leftTotal(scale);
  const r = rightTotal(scale);
  return l === r ? null : l > r ? 'left' : 'right';
}

/** How many units the heavier pan is over: `0` when balanced. */
export const differenceOf = (scale: ScaleSpec): number => Math.abs(leftTotal(scale) - rightTotal(scale));

// ─────────────────────────── number sentences ───────────────────────────

export type Operator = '+' | '−';

/** One side of a number sentence: `a + b` or just a value. */
export interface TermSpec {
  a: number;
  op?: Operator;
  b?: number;
}

export const termValue = (term: TermSpec): number => (term.op === undefined || term.b === undefined ? term.a : term.op === '+' ? term.a + term.b : term.a - term.b);

/** The right-hand side of a sentence: readers assume it is the total, not another sum. */
const rightValue = (n: number): number => n;

/** A number sentence: `left = right`. */
export interface SentenceSpec {
  left: TermSpec;
  right: number;
}

export const sentenceLeft = (s: SentenceSpec): number => termValue(s.left);
export const sentenceRight = (s: SentenceSpec): number => rightValue(s.right);

/** Whether a sentence is true: the two sides have the same value. */
export const sentenceHolds = (s: SentenceSpec): boolean => sentenceLeft(s) === sentenceRight(s);

/** `3 + 2 = 5`, with a real minus sign for subtraction. */
export function sentenceText(s: SentenceSpec): string {
  const left = s.left.op === undefined || s.left.b === undefined ? `${s.left.a}` : `${s.left.a} ${s.left.op} ${s.left.b}`;
  return `${left} = ${s.right}`;
}

/**
 * The sum of a two-part term, used for the "same total written another way" questions: `3 + 2 = 4 + 1` because both
 * sides are 5. Equality never cares *how* the total was made.
 */
export function bothSidesValue(left: TermSpec, right: TermSpec): { left: number; right: number; equal: boolean } {
  const l = termValue(left);
  const r = termValue(right);
  return { left: l, right: r, equal: l === r };
}

// ─────────────────────────── missing numbers ───────────────────────────

/**
 * The numbers that make a sentence true when a blank replaces one value. For `3 + □ = 7` the answer is 4; for
 * `9 − □ = 5` it is also 4; for `□ + 4 = 9` it is 5. Returning *all* answers matters: some blanks have more than
 * one, and a question must say which one it wants.
 */
export function missingFor(sentence: SentenceSpec, blank: 'first' | 'second' | 'total'): number {
  const { left, right } = sentence;
  const a = left.a;
  const b = left.b ?? 0;
  const op = left.op ?? '+';
  if (blank === 'total') return termValue(left);
  // `a + □ = right` → right − a; `a − □ = right` → a − right
  if (blank === 'second') return op === '+' ? right - a : a - right;
  // `□ + b = right` → right − b; `□ − b = right` → right + b
  return op === '+' ? right - b : right + b;
}

/** `3 + □ = 7` — the blank written where it belongs, with the answer left for the student. */
export function blankSentenceText(similar: SentenceSpec, blank: 'first' | 'second' | 'total'): string {
  const { left, right } = similar;
  if (blank === 'first') return `□ ${left.op ?? '+'} ${left.b ?? 0} = ${right}`;
  if (blank === 'second') return `${left.a} ${left.op ?? '+'} □ = ${right}`;
  return `${left.a}${left.op === undefined || left.b === undefined ? '' : ` ${left.op} ${left.b}`} = □`;
}

/** A subtraction blank is a different question from an addition blank: say which one this is. */
export const blankSideWord = (blank: 'first' | 'second' | 'total'): string =>
  blank === 'first' ? 'პირველი რიცხვი' : blank === 'second' ? 'მეორე რიცხვი' : 'ჯამი';

// ─────────────────────────── equal groups ───────────────────────────

/**
 * Two groups are equal when they hold the same number of things. Colour, shape and arrangement are deliberately not
 * parameters: nothing about how a group *looks* can change its count.
 */
export const groupsEqual = (a: number, b: number): boolean => a === b;

/** The number of objects that must be moved from the bigger group to make the two equal, or `null` if it cannot
 *  be done in one go (an odd difference has no whole-number answer). */
export function moveToBalance(a: number, b: number): number | null {
  const diff = Math.abs(a - b);
  if (diff === 0) return 0;
  return diff % 2 === 0 ? diff / 2 : null;
}

/** One more object on the smaller side makes them equal? Then this is the side to add to. */
export const addToBalance = (a: number, b: number): 'a' | 'b' | null => (a === b ? null : a < b ? 'a' : 'b');
export const addHowMany = (a: number, b: number): number => Math.abs(a - b);

// ─────────────────────────── balance puzzles ───────────────────────────

/**
 * A puzzle: some weights are known, one kind of weight is unknown, and one or more scales are given as clues. The
 * answer is the value of the unknown weight, taken from the scale where it appears alone on its pan with a level
 * beam. `clues` are shown as pictures; only the one that isolates the unknown decides the answer.
 */
export interface PuzzleSpec {
  /** The unknown's name, e.g. `x` — shown as a labelled weight, never as a letter equation. */
  unknown: string;
  /** The value the student has to find. */
  answer: number;
  /** The scale that isolates the unknown: unknown weights on one pan, plain numbers on the other. */
  clues: Array<{ unknownCount: number; known: number; onLeft: boolean }>;
}

/** The value of one unknown weight, from the clue that puts only unknowns on one pan. */
export function puzzleAnswer(clue: { unknownCount: number; known: number }): number | null {
  if (!Number.isInteger(clue.unknownCount) || clue.unknownCount <= 0) return null;
  if (clue.known % clue.unknownCount !== 0) return null;
  return clue.known / clue.unknownCount;
}

/** A puzzle is well-formed when at least one clue divides exactly. */
export const puzzleSolvable = (p: PuzzleSpec): boolean => p.clues.some((c) => puzzleAnswer(c) === p.answer);

/** Weights that add to a total: `[[2,3],[4,1]]` for 5. Used by "the same total another way" questions. */
export function partitions(total: number, parts = 2, min = 1): number[][] {
  if (parts === 1) return total >= min ? [[total]] : [];
  const out: number[][] = [];
  for (let first = min; first <= total - min * (parts - 1); first += 1) {
    for (const rest of partitions(total - first, parts - 1, first)) out.push([first, ...rest]);
  }
  return out;
}
