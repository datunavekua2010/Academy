/**
 * G2 U02 number patterns — pure and exact.
 *
 * A skip-count is a start and a step: `start, start+step, start+2·step …`. Every number in this unit is computed from
 * that pair, so a sequence on screen can never disagree with the rule it claims to follow, and a missing number is
 * always the place it sits times the step plus the start — not a copy of its neighbour.
 *
 * Counting *back* is the same rule with a negative step, so nothing here needs a second code path.
 */

// ─────────────────────────── sequences ───────────────────────────

/** `count` numbers from `start`, each `step` more than the last. A negative step counts backwards. */
export function sequenceOf(start: number, step: number, count: number): number[] {
  if (!Number.isInteger(start) || !Number.isInteger(step) || step === 0) throw new RangeError(`sequenceOf needs a whole start and a non-zero step, got ${start} and ${step}`);
  if (!Number.isInteger(count) || count < 1) throw new RangeError(`sequenceOf needs a count of at least 1, got ${count}`);
  return Array.from({ length: count }, (_, i) => start + i * step);
}

/** The number at position `index` (from 0) of the skip-count from `start` by `step`. */
export const termAt = (start: number, step: number, index: number): number => start + index * step;

/** A sequence with the given positions blanked out — these are the numbers the student has to find. */
export function withHoles(numbers: number[], holes: number[]): Array<number | null> {
  return numbers.map((n, i) => (holes.includes(i) ? null : n));
}

/** The values of the blanked positions, in order. The answer to a fill-in sequence, computed from the same numbers. */
export const holeValues = (numbers: number[], holes: number[]): number[] => holes.map((i) => numbers[i]);

/**
 * The step a sequence is really following, read from its neighbouring numbers. `null` when the numbers do not move by
 * one constant amount (which is exactly when the sequence has no single rule).
 */
export function stepOf(numbers: Array<number | null>): number | null {
  // a blank is a position, not an absence: the step is measured over the positions that are shown, so a sequence with
  // holes is read as carefully as one without (and a hole is never paired with a number four places away by accident).
  const filled = numbers.map((n, i) => [n, i] as const).filter((pair): pair is readonly [number, number] => pair[0] !== null);
  if (filled.length < 2) return null;
  const [first, firstAt] = filled[0];
  const [second, secondAt] = filled[1];
  const step = (second - first) / (secondAt - firstAt);
  if (!Number.isInteger(step) || step === 0) return null;
  return filled.every(([value, at]) => value === first + (at - firstAt) * step) ? step : null;
}

/** Whether the numbers really do follow `step` — every neighbouring pair, not only the first. */
export const followsRule = (numbers: Array<number | null>, step: number): boolean => stepOf(numbers) === step;

/** Whether the numbers move by one constant step at all (a doubling pattern does not). */
export const hasOneRule = (numbers: Array<number | null>): boolean => stepOf(numbers) !== null;

/** The next number after the last one shown. */
export const nextTerm = (numbers: Array<number | null>, step: number): number | null => {
  const last = [...numbers].reverse().find((n): n is number => n !== null);
  return last === undefined ? null : last + step;
};

// ─────────────────────────── the rule in words ───────────────────────────

/** „+2“ / „−2“ — the step as it is written between two numbers. */
export const stepSign = (step: number): string => (step < 0 ? `−${Math.abs(step)}` : `+${step}`);

/** „ემატება 2“ / „აკლდება 2“. */
export const stepWords = (step: number): string => (step < 0 ? `აკლდება ${Math.abs(step)}` : `ემატება ${step}`);

/** A whole sentence naming the rule: „ყოველ ნაბიჯზე ემატება 5“. */
export const ruleText = (step: number): string => `ყოველ ნაბიჯზე ${stepWords(step)}`;

/** Whether counting by `step` goes forwards (up) or backwards (down). */
export const isForward = (step: number): boolean => step > 0;

// ─────────────────────────── what the digits do ───────────────────────────

/** The ones digit of each number — counting by 5s or 10s makes a visible pattern here. */
export const onesDigits = (numbers: number[]): number[] => numbers.map((n) => Math.abs(n) % 10);

/** The tens digit of each number (hundreds included, e.g. 120 → 12). */
export const tensDigits = (numbers: number[]): number[] => numbers.map((n) => Math.floor(Math.abs(n) / 10) % 10);

/** The hundreds digit of each number. */
export const hundredsDigits = (numbers: number[]): number[] => numbers.map((n) => Math.floor(Math.abs(n) / 100));

/**
 * What happens to a number's ones digit when `step` is added. Counting by 5 inside a ten leaves 0 or 5; by 10 it never
 * moves. Returned as words so the observation can be stated, not only seen.
 */
export function onesDigitStory(step: number): string {
  const s = Math.abs(step);
  if (step < 0) return `უკან თვლისას ისევ იგივე ციფრები მოდის, ოღონდ შებრუნებული რიგით.`;
  if (s === 10) return 'ათეულების ციფრი იცვლება, ერთეულებისა კი არასოდეს.';
  if (s === 100) return 'მხოლოდ ასეულების ციფრი იცვლება; ათეულები და ერთეულები იგივე რჩება.';
  if (s === 5) return 'ერთეულების ციფრი მონაცვლეობს: 0, 5, 0, 5 …';
  if (s === 2) return 'ერთეულების ციფრი ყოველ ნაბიჯზე 2-ით იზრდება (ან მცირდება).';
  return `ერთეულების ციფრი ყოველ ნაბიჯზე ${s}-ით იცვლება.`;
}

// ─────────────────────────── groups of a step ───────────────────────────

/** How many steps of `step` fit between `from` and `to` (both included). Used to size a number line. */
export const stepsBetween = (from: number, to: number, step: number): number => Math.round((to - from) / step);

/** The numbers a skip-count lands on, from `start` until it would pass `limit`. */
export function landings(start: number, step: number, limit: number): number[] {
  const out: number[] = [];
  const forward = step > 0;
  for (let n = start; forward ? n <= limit : n >= limit; n += step) {
    out.push(n);
    if (out.length > 500) break;
  }
  return out;
}

// ─────────────────────────── equal steps in a pattern ───────────────────────────

/**
 * The rule of a pattern that may also *repeat* a step (e.g. +2, +2, +5, +2, +2, +5). Returns the repeating block of
 * step sizes when the sequence is built from one, else `null`. A plain skip-count is the block `[step]`.
 */
export function repeatBlock(numbers: Array<number | null>): number[] | null {
  const seen = numbers.filter((n): n is number => n !== null);
  if (seen.length < 3) return null;
  const diffs = seen.slice(1).map((n, i) => n - seen[i]);
  for (let size = 1; size <= Math.floor(diffs.length / 2); size += 1) {
    if (diffs.every((d, i) => d === diffs[i % size])) return diffs.slice(0, size);
  }
  return null;
}

/** The repeating rule in words: „+2, +2, +5“. */
export const blockText = (block: number[]): string => block.map(stepSign).join(', ');
