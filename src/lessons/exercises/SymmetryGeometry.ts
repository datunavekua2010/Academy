/**
 * G2 U10 — symmetry, mirror lines, reflections and repeating patterns.
 *
 * A picture in this unit is a set of grid cells or a set of small squares, and symmetry is *measured*: a shape is
 * symmetric about a line when reflecting every cell across that line gives back exactly the same set of cells. That
 * means a picture can never be called symmetric simply because it looks tidy, and a line can never be called a line of
 * symmetry just because it divides the picture into two equal-looking halves.
 *
 * Reflection is exact for integer grids. With a vertical mirror between columns `k` and `k+1`, column `x` goes to
 * `2k + 1 − x`; with a horizontal mirror between rows `k` and `k+1`, row `y` goes to `2k + 1 − y`. Half-unit mirrors
 * (through the middle of a row or column) are written the same way by doubling coordinates, so nothing needs floating
 * point.
 */

// ─────────────────────────── cells and pictures ───────────────────────────

/** One cell of a grid: column and row, both counted from 0 at the top-left. */
export interface Cell {
  x: number;
  y: number;
}

/** A picture: cells that are filled, in a grid `width` × `height`. */
export interface GridPicture {
  width: number;
  height: number;
  cells: Cell[];
}

export const cellKey = (cell: Cell): string => `${cell.x},${cell.y}`;

/** Filled cells as a set of keys — how two pictures are compared without caring about order. */
export const keySet = (cells: readonly Cell[]): Set<string> => new Set(cells.map(cellKey));

/** The same cells with any duplicates removed and a stable order (top to bottom, left to right). */
export function tidy(cells: readonly Cell[]): Cell[] {
  const seen = keySet(cells);
  return [...seen]
    .map((k) => {
      const [x, y] = k.split(',').map(Number);
      return { x, y };
    })
    .sort((a, b) => a.y - b.y || a.x - b.x);
}

/** Whether two pictures fill exactly the same cells. Arrangement is the picture; nothing else is. */
export const sameCells = (a: readonly Cell[], b: readonly Cell[]): boolean => {
  const left = keySet(a);
  const right = keySet(b);
  if (left.size !== right.size) return false;
  for (const k of left) if (!right.has(k)) return false;
  return true;
};

/** How many cells a picture fills. */
export const cellCount = (cells: readonly Cell[]): number => keySet(cells).size;

/** The bounding box of a set of cells, or `null` for an empty picture. */
export function boundsOf(cells: readonly Cell[]): { minX: number; maxX: number; minY: number; maxY: number } | null {
  if (cells.length === 0) return null;
  const xs = cells.map((c) => c.x);
  const ys = cells.map((c) => c.y);
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
}

/** Whether a picture is exactly as wide as it is tall (true of a square grid picture). */
export function isSquarePicture(cells: readonly Cell[]): boolean {
  const b = boundsOf(cells);
  return b !== null && b.maxX - b.minX === b.maxY - b.minY;
}

// ─────────────────────────── mirror lines ───────────────────────────

export type MirrorAxis = 'vertical' | 'horizontal';

/**
 * A line to reflect across, written in half-units so it can run between two columns or through the middle of one.
 * `at` is doubled: `at = 1` is the line between column 0 and column 1, `at = 2` runs down the middle of column 1.
 */
export interface MirrorLine {
  axis: MirrorAxis;
  /** Position in half-cells: the line sits at `at / 2` on the x axis (vertical) or the y axis (horizontal). */
  at: number;
}

/** A mirror between columns `k` and `k+1`. */
export const betweenColumns = (k: number): MirrorLine => ({ axis: 'vertical', at: 2 * k + 1 });

/** A mirror between rows `k` and `k+1`. */
export const betweenRows = (k: number): MirrorLine => ({ axis: 'horizontal', at: 2 * k + 1 });

/** A mirror down the middle of column `x` — a single column is its own mirror image. */
export const throughColumn = (x: number): MirrorLine => ({ axis: 'vertical', at: 2 * x });

/** A mirror along the middle of row `y`. */
export const throughRow = (y: number): MirrorLine => ({ axis: 'horizontal', at: 2 * y });

/**
 * The mirror down the middle of a grid `width` wide. An even width puts it between the two middle columns (4 wide:
 * between columns 1 and 2, at 3), an odd width puts it through the middle column (3 wide: down column 1, at 2).
 */
export const middleVertical = (width: number): MirrorLine => ({ axis: 'vertical', at: width - 1 });

/** The mirror down the middle of a grid `height` tall. */
export const middleHorizontal = (height: number): MirrorLine => ({ axis: 'horizontal', at: height - 1 });

/** A line written the way the lesson says it: „ვერტიკალური სარკის ხაზი“. */
export const lineName = (line: MirrorLine): string => (line.axis === 'vertical' ? 'ვერტიკალური' : 'ჰორიზონტალური');

/** The reflected position of one cell. Reflecting twice gives the cell back. */
export function reflectCell(cell: Cell, line: MirrorLine): Cell {
  return line.axis === 'vertical' ? { x: line.at - cell.x, y: cell.y } : { x: cell.x, y: line.at - cell.y };
}

/** The reflection of a whole picture. */
export const reflectCells = (cells: readonly Cell[], line: MirrorLine): Cell[] => tidy(cells.map((c) => reflectCell(c, line)));

/** Whether reflecting the picture across the line leaves it exactly as it was. */
export const isSymmetricAbout = (cells: readonly Cell[], line: MirrorLine): boolean => sameCells(cells, reflectCells(cells, line));

/** Whether a cell sits on the line itself (a cell a line runs through cannot be moved by it). */
export const onLine = (cell: Cell, line: MirrorLine): boolean => (line.axis === 'vertical' ? 2 * cell.x === line.at : 2 * cell.y === line.at);

/**
 * The cells a picture still needs in order to be symmetric about a line: the reflections of the cells that are only
 * on one side. Empty when it is already symmetric, which is exactly the answer to "what is missing?".
 */
export function missingForSymmetry(cells: readonly Cell[], line: MirrorLine): Cell[] {
  const have = keySet(cells);
  return tidy(reflectCells(cells, line).filter((c) => !have.has(cellKey(c))));
}

/** The cells to add so the picture becomes symmetric, keeping the cells it already has. */
export const completePicture = (cells: readonly Cell[], line: MirrorLine): Cell[] => tidy([...cells, ...missingForSymmetry(cells, line)]);

/** The half of a picture on one side of the line — what is left to mirror. */
export function halfOf(cells: readonly Cell[], line: MirrorLine): Cell[] {
  return tidy(cells.filter((c) => (line.axis === 'vertical' ? c.x * 2 < line.at : c.y * 2 < line.at)));
}

// ─────────────────────────── lines of symmetry ───────────────────────────

/**
 * Every line of symmetry a picture has, among the lines that could run through its own bounding box: vertical lines
 * through each column and between them, horizontal lines through each row and between them. Two lines at most in each
 * direction are reported — a line outside the picture's own span is not a line of symmetry of the picture.
 */
export function linesOfSymmetry(cells: readonly Cell[]): MirrorLine[] {
  const b = boundsOf(cells);
  if (!b) return [];
  const found: MirrorLine[] = [];
  const seen = new Set<string>();
  const add = (line: MirrorLine) => {
    const key = `${line.axis}:${line.at}`;
    if (seen.has(key)) return;
    if (!isSymmetricAbout(cells, line)) return;
    seen.add(key);
    found.push(line);
  };
  for (let at = 2 * b.minX; at <= 2 * b.maxX + 1; at += 1) add({ axis: 'vertical', at });
  for (let at = 2 * b.minY; at <= 2 * b.maxY + 1; at += 1) add({ axis: 'horizontal', at });
  return found;
}

/** How many lines of symmetry a picture has. A square has four (vertical, horizontal, two diagonals) — but only the
 * straight ones through the grid are counted here, which is what a grid picture can honestly show. */
export const symmetryCount = (cells: readonly Cell[]): number => linesOfSymmetry(cells).length;

/** Whether a picture has at least one line of symmetry. */
export const isSymmetric = (cells: readonly Cell[]): boolean => linesOfSymmetry(cells).length > 0;

/** Whether a picture has a vertical line of symmetry and a horizontal one. */
export function hasBothLines(cells: readonly Cell[]): boolean {
  const lines = linesOfSymmetry(cells);
  return lines.some((l) => l.axis === 'vertical') && lines.some((l) => l.axis === 'horizontal');
}

/** Whether a given candidate line really is a line of symmetry — the answer to the drag-a-line question. */
export const isLineOfSymmetry = (cells: readonly Cell[], line: MirrorLine): boolean => isSymmetricAbout(cells, line);

/** Why a candidate line fails: the cells that have no partner across it. Empty when it succeeds. */
export const unmatchedAcross = (cells: readonly Cell[], line: MirrorLine): Cell[] => missingForSymmetry(cells, line);

// ─────────────────────────── flips ───────────────────────────

/**
 * A flip is a reflection of the whole picture, and a flip changes orientation: an L that faces one way faces the other
 * way afterwards. Turning the paper instead would not — that is the distinction the lesson makes.
 */
export const flipVertical = (cells: readonly Cell[], width: number): Cell[] => reflectCells(cells, middleVertical(width));

export const flipHorizontal = (cells: readonly Cell[], height: number): Cell[] => reflectCells(cells, middleHorizontal(height));

/** Whether two pictures are reflections of one another across the given line. */
export const isReflectionOf = (a: readonly Cell[], b: readonly Cell[], line: MirrorLine): boolean => sameCells(b, reflectCells(a, line));

/**
 * Whether one picture could be a *slide* of the other (same cells, just moved). A slide keeps orientation; a flip does
 * not. Used to tell "flipped" from "moved" in the puzzles.
 */
export function isSlideOf(a: readonly Cell[], b: readonly Cell[]): boolean {
  const ba = boundsOf(a);
  const bb = boundsOf(b);
  if (!ba || !bb) return false;
  const dx = bb.minX - ba.minX;
  const dy = bb.minY - ba.minY;
  return sameCells(a.map((c) => ({ x: c.x + dx, y: c.y + dy })), b);
}

/** Whether a picture reads the same after being flipped across the line — the same statement as symmetry, said the
 * way the flip lesson says it. */
export const flipLooksSame = (cells: readonly Cell[], line: MirrorLine): boolean => isSymmetricAbout(cells, line);

// ─────────────────────────── repeating patterns ───────────────────────────

/** A repeating unit of a row pattern, given as the repeating block of item names. */
export interface RowPattern {
  block: string[];
  length: number;
  /** The items already drawn, from position 0. */
  shown: string[];
}

/** The item at position `index` of a pattern that repeats `block`. */
export function itemAt(block: readonly string[], index: number): string {
  if (block.length === 0) throw new RangeError('a pattern needs at least one item');
  const i = ((Math.round(index) % block.length) + block.length) % block.length;
  return block[i];
}

/** A row of `length` items from a repeating block. */
export const rowOf = (block: readonly string[], length: number): string[] => Array.from({ length }, (_, i) => itemAt(block, i));

/** The next item after everything shown. */
export const nextItem = (block: readonly string[], shown: number): string => itemAt(block, shown);

/** Whether the shown items really follow the block, position by position. */
export const followsPattern = (block: readonly string[], shown: readonly string[]): boolean => shown.every((item, i) => itemAt(block, i) === item);

/** The positions among the first `length` where the block predicts a given item. */
export const positionsOf = (block: readonly string[], length: number, item: string): number[] =>
  Array.from({ length }, (_, i) => i).filter((i) => itemAt(block, i) === item);

/** The length of the repeating block read off the items shown, or `null` when no short block fits. */
export function blockLengthOf(shown: readonly string[]): number | null {
  // the shortest block that reproduces the whole row; the row itself always does, so this never runs past it
  for (let size = 1; size <= shown.length; size += 1) {
    if (shown.every((item, i) => item === shown[i % size])) return size;
  }
  return shown.length > 0 ? shown.length : null;
}

/** „მართკუთხედი, წრე, სამკუთხედი“ — a block written out. */
export const blockText = (block: readonly string[]): string => block.join(', ');

/** The position of an item in a row, counted from 1 — for "which square is the third?". */
export const positionWord = (index: number): string => `${index + 1}-ე ადგილი`;
