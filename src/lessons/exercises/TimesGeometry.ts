/**
 * G2 U05 times tables (2, 3, 4, 5, 10) — pure and exact.
 *
 * A times table is the skip-count of its own step: `table × factor` is the `factor`-th landing of counting on by
 * `table`. Every product, every missing number and every pattern in this unit is computed from those two integers, so
 * the picture, the repeated addition, the multiplication and the grid can never disagree.
 *
 * Two patterns are stated as facts, not as pictures: the multiples of five end in 5 or 0, and the multiples of ten end
 * in 0. The four times table is the two times table doubled twice — again a statement about numbers.
 */

// ─────────────────────────── one fact ───────────────────────────

/** How many objects `factor` groups of `table` hold. */
export const productOf = (table: number, factor: number): number => table * factor;

/** `4 × 3 = 12`. */
export const factText = (table: number, factor: number): string => `${factor} × ${table} = ${productOf(table, factor)}`;

/** The same sentence with the factors the other way round — the product does not move. */
export const commutedText = (table: number, factor: number): string => `${table} × ${factor} = ${productOf(table, factor)}`;

/** The repeated addition a fact stands for: `3 + 3 + 3 + 3 = 12`. */
export const repeatText = (table: number, factor: number): string =>
  `${Array.from({ length: Math.max(0, factor) }, () => table).join(' + ')} = ${productOf(table, factor)}`;

/** A fact is right when its product is — order never matters. */
export const factHolds = (table: number, factor: number, product: number): boolean => productOf(table, factor) === product;

// ─────────────────────────── a table ───────────────────────────

/** The first `upTo` facts of a table, as products: the skip-count. */
export const tableRow = (table: number, upTo: number): number[] =>
  Array.from({ length: Math.max(0, upTo) }, (_, i) => productOf(table, i + 1));

/** The skip-count sentence: `3, 6, 9, 12`. */
export const skipText = (table: number, upTo: number): string => tableRow(table, upTo).join(', ');

/** The factors of a table, from 1: `1, 2, 3, 4`. */
export const factorsOf = (upTo: number): number[] => Array.from({ length: Math.max(0, upTo) }, (_, i) => i + 1);

/** The whole table written out, one line per fact. */
export const tableLines = (table: number, upTo: number): string[] =>
  factorsOf(upTo).map((f) => `${f} × ${table} = ${productOf(table, f)}`);

/** The ones digit of a product. */
export const onesDigit = (n: number): number => Math.abs(n) % 10;

/** The ones digits of the first `upTo` multiples of a table — the pattern the student is asked to notice. */
export const onesPattern = (table: number, upTo: number): number[] => tableRow(table, upTo).map(onesDigit);

/**
 * What the ones digits do, said as a fact about this table. Twenty multiples is enough for the pattern to have come
 * round again, so the claim is checked rather than asserted.
 */
export function onesRule(table: number): string {
  if (table % 10 === 0) return 'ათეულის ჯერადები ბოლოვდება 0-ით.';
  if (table % 10 === 5) return 'ხუთის ჯერადები ბოლოვდება 5-ით ან 0-ით — მონაცვლეობით.';
  if (table % 2 === 0) return `${table}-ის ჯერადები ლუწია, ამიტომ ბოლო ციფრი ყოველთვის ლუწია.`;
  return `${table}-ის ჯერადების ბოლო ციფრები მეორდება ათ ნაბიჯში.`;
}

/** Whether the ones digits really alternate 5, 0, 5, 0 … (true for the five times table). */
export const fivesAlternate = (): boolean => tableRow(5, 20).every((n, i) => onesDigit(n) === (i % 2 === 0 ? 5 : 0));

/** Whether every multiple of ten ends in 0 (true by construction, checked for the record). */
export const tensEndInZero = (upTo = 20): boolean => tableRow(10, upTo).every((n) => onesDigit(n) === 0);

// ─────────────────────────── doubling ───────────────────────────

/** Doubling, which is the two times table. */
export const doubleOf = (n: number): number => n * 2;

/** Doubling twice is multiplying by four: the connection U05.3 rests on. */
export const doubleTwice = (n: number): number => doubleOf(doubleOf(n));

/** Whether doubling `each` twice really lands on `factor` groups of four — the ×4 fact the doubling claims. */
export const isDoubleTwice = (each: number, factor: number): boolean => doubleTwice(factor) === productOf(4, factor) && doubleTwice(each) === productOf(4, each);

/** The chain a doubling demo walks: the group, its double, its double again. */
export const doublingChain = (each: number): number[] => [each, doubleOf(each), doubleTwice(each)];

/** A number doubled twice, written out. */
export const doublingText = (each: number): string => `${each} → ${doubleOf(each)} → ${doubleTwice(each)}`;

// ─────────────────────────── missing numbers ───────────────────────────

/** The number that makes `table × ? = product`. `null` when no whole number does. */
export const missingFactor = (table: number, product: number): number | null =>
  table === 0 ? null : Number.isInteger(product / table) ? product / table : null;

/** The number that makes `? × factor = product`. */
export const missingTable = (factor: number, product: number): number | null =>
  factor === 0 ? null : Number.isInteger(product / factor) ? product / factor : null;

/** The factor that is missing, whichever side of the sentence it is on. */
export const missingIn = (table: number, factor: number, missing: 'factor' | 'product'): number =>
  missing === 'factor' ? factor : missing === 'product' ? productOf(table, factor) : factor;

// ─────────────────────────── the grid ───────────────────────────

/** The products at every crossing of `tables` and `factors`. */
export function gridProducts(tables: number[], factors: number[]): Array<{ table: number; factor: number; product: number }> {
  return tables.flatMap((table) => factors.map((factor) => ({ table, factor, product: productOf(table, factor) })));
}

/** The cell key used to store a tapped cell. */
export const cellKey = (table: number, factor: number): string => `${table},${factor}`;

/** Every cell of the grid whose product is `target`. */
export function cellsFor(target: number, tables: number[], factors: number[]): string[] {
  return gridProducts(tables, factors)
    .filter((c) => c.product === target)
    .map((c) => cellKey(c.table, c.factor));
}

/** The cells that share a product — the square property, read off the grid. */
export function relatedCells(table: number, factor: number, tables: number[], factors: number[]): string[] {
  const product = productOf(table, factor);
  return cellsFor(product, tables, factors).filter((k) => k !== cellKey(table, factor));
}

/** The largest product in the grid, for laying it out. */
export const maxProduct = (tables: number[], factors: number[]): number => Math.max(...gridProducts(tables, factors).map((c) => c.product));

// ─────────────────────────── connecting the tables ───────────────────────────

/** The facts a known fact gives you for free, because multiplication commutes. */
export function relatedFacts(table: number, factor: number): { fact: string; commuted: string; same: boolean } {
  return {
    fact: factText(table, factor),
    commuted: commutedText(table, factor),
    same: productOf(table, factor) === productOf(factor, table),
  };
}

/** Whether two facts share a product (a "square" pair such as 2 × 6 and 3 × 4). */
export const sharesProduct = (a: number, b: number, c: number, d: number): boolean => productOf(a, b) === productOf(c, d);

/** The tables this unit covers. */
export const CORE_TABLES = [2, 3, 4, 5, 10] as const;

/** Which of the core tables a product appears in (10 belongs to both the 2s and the 5s, for instance). */
export function tablesWithProduct(product: number, upTo = 10): number[] {
  return CORE_TABLES.filter((t) => product % t === 0 && product / t >= 1 && product / t <= upTo);
}
