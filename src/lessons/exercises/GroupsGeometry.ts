/**
 * G2 U04 equal groups, repeated addition and arrays — pure and exact.
 *
 * One fact runs through the whole unit: `groups × each` objects, and `groups × each = each × groups`. Equal groups,
 * repeated addition, a multiplication expression and an array are four ways of writing that one number, so every board
 * and every check is computed from the two counts and nothing else.
 *
 * An array's rows and columns are the same two numbers, only in a different order — which is why turning an array never
 * changes how many objects it holds.
 */

// ─────────────────────────── groups ───────────────────────────

/** How many objects are in `groups` groups of `each`. */
export const totalOf = (groups: number, each: number): number => groups * each;

/** The running totals as groups are added, one at a time: 3, 6, 9 … */
export const runningTotals = (groups: number, each: number): number[] => Array.from({ length: Math.max(0, groups) }, (_, i) => (i + 1) * each);

/** Whether every group really holds the same number. `sizes` are the counts actually in the groups. */
export function allEqual(sizes: number[]): boolean {
  if (sizes.length < 2) return sizes.length === 1;
  return sizes.every((n) => n === sizes[0]);
}

/** How many objects are in a list of groups, equal or not. */
export const sumOfGroupSizes = (sizes: number[]): number => sizes.reduce((n, s) => n + s, 0);

/** The groups that differ from the first, so a board can point at them instead of saying "wrong". */
export const unevenGroups = (sizes: number[]): number[] => {
  const first = sizes[0];
  return sizes.flatMap((n, i) => (n === first ? [] : [i]));
};

/** „3 ჯგუფი 4-4 საგნით“ — the same sentence a student would say. */
export const groupsText = (groups: number, each: number): string => `${groups} ჯგუფი, თითოეულში ${each} საგანი`;

/** The total written as a multiplication: `3 × 4 = 12`. */
export const multiplyText = (groups: number, each: number): string => `${groups} × ${each} = ${totalOf(groups, each)}`;

// ─────────────────────────── repeated addition ───────────────────────────

/** The terms of the repeated addition: one `each` per group. */
export const termsOf = (groups: number, each: number): number[] => Array.from({ length: Math.max(0, groups) }, () => each);

/** `4 + 4 + 4 = 12`. */
export const repeatedText = (groups: number, each: number): string => `${termsOf(groups, each).join(' + ')} = ${totalOf(groups, each)}`;

/** How many terms the repeated addition has — which is the number of groups. */
export const termCount = (total: number, each: number): number => (each === 0 ? 0 : Math.round(total / each));

/** Whether `total = each` repeated `groups` times, read from the numbers rather than from a written expression. */
export const repeatedHolds = (groups: number, each: number, total: number): boolean => totalOf(groups, each) === total;

// ─────────────────────────── arrays ───────────────────────────

/** An array: `rows` rows, `cols` in each row. The total is rows × cols, and it is the same either way round. */
export interface ArraySpec {
  rows: number;
  cols: number;
}

/** The number of objects in an array. */
export const arrayTotal = (a: ArraySpec): number => a.rows * a.cols;

/** The same array turned on its side: the rows become columns and the columns become rows. The total does not change. */
export const turnArray = (a: ArraySpec): ArraySpec => ({ rows: a.cols, cols: a.rows });

/** Turning an array never changes how many objects it holds — stated as a fact, and true by construction. */
export const turnKeepsTotal = (a: ArraySpec): boolean => arrayTotal(turnArray(a)) === arrayTotal(a);

/** The rows as lists of column numbers, so a board can draw each object from its position. */
export const rowCells = (a: ArraySpec): number[][] => Array.from({ length: a.rows }, (_, r) => Array.from({ length: a.cols }, (_, c) => r * a.cols + c));

/** The repeated addition an array suggests when it is read by rows. */
export const arrayByRows = (a: ArraySpec): string => repeatedText(a.rows, a.cols);

/** The repeated addition the same array suggests when it is read by columns. */
export const arrayByCols = (a: ArraySpec): string => repeatedText(a.cols, a.rows);

/** Which arrays make a given total. Used to show that a total can be arranged more than one way. */
export function arraysFor(total: number): ArraySpec[] {
  if (!Number.isInteger(total) || total < 1) return [];
  const out: ArraySpec[] = [];
  for (let rows = 1; rows <= total; rows += 1) if (total % rows === 0) out.push({ rows, cols: total / rows });
  return out;
}

// ─────────────────────────── the four ways of writing it ───────────────────────────

/** The four ways, all computed from the same two counts so they can never disagree. */
export function fourWays(groups: number, each: number): { picture: string; repeated: string; multiply: string; total: number } {
  return {
    picture: groupsText(groups, each),
    repeated: repeatedText(groups, each),
    multiply: multiplyText(groups, each),
    total: totalOf(groups, each),
  };
}

/** The multiplication an equal-groups picture states. */
export const productOf = (groups: number, each: number): number => totalOf(groups, each);

/** `groups × each` and `each × groups` are the same number — the fact the array section rests on. */
export const commutative: (groups: number, each: number) => boolean = (groups, each) => totalOf(groups, each) === totalOf(each, groups);

// ─────────────────────────── word problems ───────────────────────────

/** A story about groups: `groups` groups of `each`, and what the groups describe. */
export interface GroupStory {
  groups: number;
  each: number;
  unit: string;
  what: string;
}

/** The answer to a groups story, from its two counts. */
export const storyTotal = (s: GroupStory): number => s.groups * s.each;

/** The sentence that solves a groups story: `4 × 6 = 24`. */
export const storySentence = (s: GroupStory): string => `${s.groups} × ${s.each} = ${storyTotal(s)}`;

/** Whether an answer makes sense: a group total cannot be smaller than one group. */
export const storyMakesSense = (s: GroupStory, answer: number): boolean => answer >= s.each && answer === storyTotal(s);
