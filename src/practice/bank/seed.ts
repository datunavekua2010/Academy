/** Compact authoring format for question-bank entries. */
export interface Seed {
  /** Prompt (Georgian). */
  p: string;
  /** Answer options. */
  o: string[];
  /** Index of the correct option. */
  a: number;
  /** Explanation shown after answering. */
  e: string;
  /** 1 = easy, 2 = medium, 3 = harder. */
  d?: 1 | 2 | 3;
}

/** Shorthand used by the grade files below. */
export const S = (p: string, o: string[], a: number, e: string, d: 1 | 2 | 3 = 1): Seed => ({
  p,
  o,
  a,
  e,
  d,
});
