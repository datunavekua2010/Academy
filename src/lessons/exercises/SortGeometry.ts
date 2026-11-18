/**
 * U10 sorting, Venn diagrams and picture charts — pure and exact.
 *
 * Every group an object falls into is decided from its attributes here, never from where a picture happens to be
 * drawn. That matters most for the overlapping groups: an object that is both red and a triangle belongs in the
 * overlap, and the same object also belongs to "red" and to "triangle" on their own — which is the whole idea the
 * unit is teaching.
 */

// ─────────────────────────── attributes ───────────────────────────

export type Colour = 'red' | 'blue' | 'yellow';
export type FlatKind = 'circle' | 'triangle' | 'square' | 'rectangle';
export type Size = 'small' | 'large';

export const COLOUR_NAME: Record<Colour, string> = {
  red: 'წითელი',
  blue: 'ლურჯი',
  yellow: 'ყვითელი',
};

export const KIND_NAME: Record<FlatKind, string> = {
  circle: 'წრე',
  triangle: 'სამკუთხედი',
  square: 'კვადრატი',
  rectangle: 'მართკუთხედი',
};

export const SIZE_NAME: Record<Size, string> = {
  small: 'პატარა',
  large: 'დიდი',
};

/** One sortable object. `id` is what an answer stores; the attributes decide every group it belongs to. */
export interface SortObj {
  id: string;
  colour: Colour;
  kind: FlatKind;
  size: Size;
  /** Optional item name for prompts and feedback, e.g. "წითელი სამკუთხედი". */
  label?: string;
}

export type Attr = 'colour' | 'kind' | 'size';

export const ATTR_NAME: Record<Attr, string> = {
  colour: 'ფერი',
  kind: 'ფორმა',
  size: 'ზომა',
};

/** The same attribute in the instrumental ("by colour"), for saying which rule is in force. */
export const ATTR_BY: Record<Attr, string> = {
  colour: 'ფერით',
  kind: 'ფორმით',
  size: 'ზომით',
};

/** The value of one attribute, as a string the answer format can store. */
export const attrValue = (obj: SortObj, attr: Attr): string => obj[attr];

/** "წითელი სამკუთხედი" — how an object is named in words, from its attributes only. */
export const objectName = (obj: SortObj): string => obj.label ?? `${COLOUR_NAME[obj.colour]} ${KIND_NAME[obj.kind]}`;

// ─────────────────────────── one attribute ───────────────────────────

/**
 * The groups a collection sorts into by one attribute, in a fixed order, each with the objects that belong in it.
 * Objects are grouped by their real attribute value, so two red things always land together whatever else differs.
 */
export function groupsBy(objects: SortObj[], attr: Attr, order?: string[]): Array<{ value: string; objects: SortObj[] }> {
  const seen: string[] = [];
  for (const obj of objects) {
    const v = attrValue(obj, attr);
    if (!seen.includes(v)) seen.push(v);
  }
  const values = order ? [...order.filter((v) => seen.includes(v)), ...seen.filter((v) => !order.includes(v))] : seen;
  return values.map((value) => ({ value, objects: objects.filter((obj) => attrValue(obj, attr) === value) }));
}

/** The group value an object belongs to, for the answer format. */
export const groupValueOf = (obj: SortObj, attr: Attr): string => attrValue(obj, attr);

/**
 * The rule behind an already-sorted collection: the attribute whose values each group shares and no group mixes.
 * `null` when more than one attribute explains the grouping (the sort alone cannot say which).
 */
export function ruleOf(groups: SortObj[][]): Attr | null {
  const fits = (attr: Attr): boolean => {
    const seen = new Set<string>();
    for (const group of groups) {
      if (group.length === 0) continue;
      const values = new Set(group.map((obj) => attrValue(obj, attr)));
      if (values.size !== 1) return false;
      const v = [...values][0];
      if (seen.has(v)) return false;
      seen.add(v);
    }
    const all = groups.flat();
    return new Set(all.map((obj) => attrValue(obj, attr))).size === seen.size;
  };
  const candidates: Attr[] = ['colour', 'kind', 'size'].filter((a): a is Attr => fits(a as Attr));
  return candidates.length === 1 ? candidates[0] : null;
}

// ─────────────────────────── two attributes: the grid ───────────────────────────

/**
 * A two-way grid: the cell of an object is exactly its pair of attributes, so a red triangle is in (red, triangle)
 * and nowhere else. The same pair of attributes is used for reading a cell back into its condition.
 */
export const cellKey = (obj: SortObj, rowAttr: Attr, colAttr: Attr): string => `${attrValue(obj, rowAttr)}|${attrValue(obj, colAttr)}`;

/** Every cell of a grid, in reading order, whether or not anything is in it. */
export function gridCells(rowValues: string[], colValues: string[]): Array<{ key: string; row: string; col: string }> {
  const out: Array<{ key: string; row: string; col: string }> = [];
  for (const row of rowValues) for (const col of colValues) out.push({ key: `${row}|${col}`, row, col });
  return out;
}

/** The objects in one cell, counted from their attributes. */
export const cellObjects = (objects: SortObj[], rowAttr: Attr, colAttr: Attr, key: string): SortObj[] =>
  objects.filter((obj) => cellKey(obj, rowAttr, colAttr) === key);

/** Whether an object satisfies both conditions — the words version of a cell. */
export const matchesBoth = (obj: SortObj, rowAttr: Attr, rowValue: string, colAttr: Attr, colValue: string): boolean =>
  attrValue(obj, rowAttr) === rowValue && attrValue(obj, colAttr) === colValue;

// ─────────────────────────── Venn diagrams ───────────────────────────

/**
 * Where an object sits in a two-circle diagram: in both circles, in only the first, in only the second, or outside.
 * `none` is a real region (objects that are neither), not an absence of an answer.
 */
export type VennRegion = 'both' | 'left' | 'right' | 'none';

export function vennRegion(obj: SortObj, leftAttr: Attr, leftValue: string, rightAttr: Attr, rightValue: string): VennRegion {
  const inLeft = attrValue(obj, leftAttr) === leftValue;
  const inRight = attrValue(obj, rightAttr) === rightValue;
  if (inLeft && inRight) return 'both';
  if (inLeft) return 'left';
  if (inRight) return 'right';
  return 'none';
}

export const VENN_REGION_NAME: Record<VennRegion, string> = {
  both: 'ორივეში',
  left: 'მხოლოდ მარცხენაში',
  right: 'მხოლოდ მარჯვენაში',
  none: 'არც ერთში',
};

/** The region of each object, in the order they were given. */
export const vennRegions = (objects: SortObj[], leftAttr: Attr, leftValue: string, rightAttr: Attr, rightValue: string): VennRegion[] =>
  objects.map((obj) => vennRegion(obj, leftAttr, leftValue, rightAttr, rightValue));

export const objectsInRegion = (objects: SortObj[], region: VennRegion, leftAttr: Attr, leftValue: string, rightAttr: Attr, rightValue: string): SortObj[] =>
  objects.filter((obj) => vennRegion(obj, leftAttr, leftValue, rightAttr, rightValue) === region);

// ─────────────────────────── picture charts ───────────────────────────

/**
 * A picture chart: one row per category, one symbol per thing counted. The number for a category is the number of
 * symbols in its row — never stored separately, so a chart can never claim a count its pictures do not show.
 */
export interface ChartSpec {
  /** The symbol used for one thing. */
  glyph: 'star' | 'apple' | 'fish' | 'ball' | 'circle';
  rows: Array<{ label: string; count: number }>;
}

export const chartCount = (chart: ChartSpec, label: string): number => chart.rows.find((row) => row.label === label)?.count ?? 0;

export const chartTotal = (chart: ChartSpec): number => chart.rows.reduce((sum, row) => sum + row.count, 0);

/** The most / least counted categories; ties are returned together, because "more" is not decided by position. */
export function chartMost(chart: ChartSpec): string[] {
  const max = Math.max(...chart.rows.map((row) => row.count));
  return chart.rows.filter((row) => row.count === max).map((row) => row.label);
}

export function chartLeast(chart: ChartSpec): string[] {
  const min = Math.min(...chart.rows.map((row) => row.count));
  return chart.rows.filter((row) => row.count === min).map((row) => row.label);
}

/** How many more one category has than another; negative means the other is ahead. */
export const chartDifference = (chart: ChartSpec, a: string, b: string): number => chartCount(chart, a) - chartCount(chart, b);

/** Whether two categories tie. */
export const chartTie = (chart: ChartSpec, a: string, b: string): boolean => chartCount(chart, a) === chartCount(chart, b);

/** The whole comparison in words, for feedback. */
export function chartCompareText(chart: ChartSpec, a: string, b: string): string {
  const ca = chartCount(chart, a);
  const cb = chartCount(chart, b);
  if (ca === cb) return `${a} და ${b}: ორივეში ${ca} — თანაბარია.`;
  const [more, less, diff] = ca > cb ? [a, b, ca - cb] : [b, a, cb - ca];
  return `${more}: ${Math.max(ca, cb)}, ${less}: ${Math.min(ca, cb)} — ${more}-ში ${diff}-ით მეტია.`;
}

// ─────────────────────────── classification puzzles ───────────────────────────

/**
 * A clue that a collection has to satisfy: one attribute equals one value, or does not. Several clues combine, and
 * an object survives only if it satisfies every one — that is "multiple rules narrow down a group".
 */
export interface Clue {
  attr: Attr;
  value: string;
  negate?: boolean;
}

export const clueHolds = (obj: SortObj, clue: Clue): boolean => (attrValue(obj, clue.attr) === clue.value) !== Boolean(clue.negate);

export const allCluesHold = (obj: SortObj, clues: Clue[]): boolean => clues.every((clue) => clueHolds(obj, clue));

/** The objects that survive every clue, in their original order. */
export const survivors = (objects: SortObj[], clues: Clue[]): SortObj[] => objects.filter((obj) => allCluesHold(obj, clues));

/** A clue in words: "ფერი = წითელი" or "ფორმა ≠ წრე". */
export function clueText(clue: Clue): string {
  const name = clue.attr === 'colour' ? COLOUR_NAME[clue.value as Colour] : clue.attr === 'kind' ? KIND_NAME[clue.value as FlatKind] : SIZE_NAME[clue.value as Size];
  return `${ATTR_NAME[clue.attr]} ${clue.negate ? '≠' : '='} ${name}`;
}
