/**
 * G2 U12 — visual patterns, grids, and logic.
 *
 * Three ideas, each with one source of truth:
 *
 *  1. **A pattern is a rule, not a list.** `Pattern` stores the rule (a repeating block, or a start and a step) and the
 *     items are computed from it. So "what comes next?" is *derived*, and a pattern can be checked at position 40 without
 *     anyone writing 40 items by hand.
 *  2. **A grid is addressed, not seen.** A cell is `{ row, col }` counted from 1, and a route is a list of moves. Where a
 *     walker ends up is computed, so a "follow the instructions" question can never disagree with the grid it draws.
 *  3. **Logic is elimination.** A clue describes conditions; the answer is the thing that satisfies all of them, and the
 *     decoys are the things that fail at least one. Nobody decides "which looks right".
 *
 * Colours are named as well as drawn (`red` is „წითელი“), so a pattern that uses colour is readable without seeing it.
 */

// ─────────────────────────── patterns ───────────────────────────

/** What a pattern shows in each place. `shape` and `colour` are independent: a pattern may change either or both. */
export interface Item {
  shape: string;
  colour?: string;
}

/** The shapes and colours the unit knows, with the names it uses for them. */
export const SHAPE_NAMES: Record<string, string> = {
  circle: 'წრე',
  square: 'კვადრატი',
  triangle: 'სამკუთხედი',
  star: 'ვარსკვლავი',
  heart: 'გული',
  diamond: 'რომბი',
};

export const COLOUR_NAMES: Record<string, string> = {
  red: 'წითელი',
  blue: 'ლურჯი',
  green: 'მწვანე',
  yellow: 'ყვითელი',
  purple: 'იისფერი',
  orange: 'ნარინჯისფერი',
};

/** The character a shape is drawn with — a pattern is never only a colour. */
export const SHAPE_GLYPH: Record<string, string> = {
  circle: '●',
  square: '■',
  triangle: '▲',
  star: '★',
  heart: '♥',
  diamond: '◆',
};

/** An item said in words: „წითელი წრე“. */
export const itemText = (item: Item): string => `${item.colour ? `${COLOUR_NAMES[item.colour] ?? item.colour} ` : ''}${SHAPE_NAMES[item.shape] ?? item.shape}`;

/** Two items are the same when both their shape and their colour are. */
export const sameItem = (a: Item, b: Item): boolean => a.shape === b.shape && (a.colour ?? '') === (b.colour ?? '');

/** A pattern rule: a repeating block, or a growing one where one attribute keeps changing. */
export type Pattern =
  /** The same `block` over and over. */
  | { kind: 'repeat'; block: Item[] }
  /** One attribute changes every step while the rest stay: shapes cycle, or a count grows by `every`. */
  | { kind: 'grow'; start: Item; every: number; change: 'shape' | 'colour' };

/** The number of different shapes a growing pattern cycles through, when it cycles shapes. */
const GROWING_SHAPES = ['circle', 'square', 'triangle', 'star', 'heart', 'diamond'];

/** How many positions a growing pattern needs before it returns to its first item. */
export function periodOf(pattern: Pattern): number {
  if (pattern.kind === 'repeat') return Math.max(1, pattern.block.length);
  return Math.max(1, pattern.every);
}

/** The value at position `index` (counted from 0). Every position is computed from the rule, never looked up. */
export function itemAt(pattern: Pattern, index: number): Item {
  if (index < 0) throw new RangeError('a pattern has no position before its first');
  if (pattern.kind === 'repeat') {
    if (pattern.block.length === 0) throw new RangeError('a repeating pattern needs a block');
    return pattern.block[index % pattern.block.length];
  }
  const stepIndex = Math.floor(index / pattern.every);
  if (pattern.change === 'shape') {
    const from = GROWING_SHAPES.indexOf(pattern.start.shape);
    const shapes = from >= 0 ? GROWING_SHAPES.length : 1;
    const shape = from >= 0 ? GROWING_SHAPES[(from + stepIndex) % shapes] : pattern.start.shape;
    return { ...pattern.start, shape };
  }
  // colour grows round the palette, so the same colour comes back at a known position
  const colours = Object.keys(COLOUR_NAMES);
  const from = pattern.start.colour ? colours.indexOf(pattern.start.colour) : 0;
  return { ...pattern.start, colour: colours[(from + stepIndex) % colours.length] };
}

/** The first `count` items of a pattern. */
export const itemsOf = (pattern: Pattern, count: number): Item[] => Array.from({ length: count }, (_, i) => itemAt(pattern, i));

/** What comes after `shown` items — the "what is next?" answer. */
export const nextItem = (pattern: Pattern, shown: number): Item => itemAt(pattern, shown);

/** The length of the repeating block, read back from the items: the shortest block that reproduces them. */
export function blockLengthOf(items: readonly Item[]): number | null {
  if (items.length === 0) return null;
  for (let size = 1; size <= items.length; size += 1) {
    if (items.every((item, i) => sameItem(item, items[i % size]))) return size;
  }
  return items.length;
}

/** The repeating block of a row of items, or `null` when the row does not repeat as a whole block. */
export function blockOf(items: readonly Item[]): Item[] | null {
  const size = blockLengthOf(items);
  return size === null ? null : items.slice(0, size);
}

/** Whether the items follow the pattern exactly, position by position. */
export const follows = (pattern: Pattern, items: readonly Item[]): boolean => items.every((item, i) => sameItem(item, itemAt(pattern, i)));

/** The positions among the first `count` that hold the same item as position 0. */
export const repeatsAt = (pattern: Pattern, count: number): number[] =>
  Array.from({ length: count }, (_, i) => i).filter((i) => sameItem(itemAt(pattern, i), itemAt(pattern, 0)));

/** How many of each item appear in the first `count` places — for "how many triangles?" questions. */
export function countsIn(pattern: Pattern, count: number): Array<{ item: Item; count: number }> {
  const out: Array<{ item: Item; count: number }> = [];
  for (let i = 0; i < count; i += 1) {
    const item = itemAt(pattern, i);
    const found = out.find((o) => sameItem(o.item, item));
    if (found) found.count += 1;
    else out.push({ item, count: 1 });
  }
  return out;
}

/**
 * The first position where a row stops following its own rule — the "find the mistake" question. Returns `-1` when the
 * whole row is right.
 */
export function mistakeAt(pattern: Pattern, items: readonly Item[]): number {
  for (let i = 0; i < items.length; i += 1) if (!sameItem(items[i], itemAt(pattern, i))) return i;
  return -1;
}

/** The row with one position replaced — what a "find the mistake" picture is built from. */
export const withMistake = (pattern: Pattern, count: number, at: number, wrong: Item): Item[] =>
  itemsOf(pattern, count).map((item, i) => (i === at ? wrong : item));

// ─────────────────────────── grids ───────────────────────────

/** A cell of a grid, counted from 1: row 1 is the top row, column 1 the left column. */
export interface Cell {
  row: number;
  col: number;
}

export const cellKey = (cell: Cell): string => `${cell.row},${cell.col}`;

/** Whether a cell is inside a grid of this size. */
export const inside = (cell: Cell, rows: number, cols: number): boolean => cell.row >= 1 && cell.row <= rows && cell.col >= 1 && cell.col <= cols;

/** One instruction: move `n` squares in a direction. */
export interface Move {
  dir: 'up' | 'down' | 'left' | 'right';
  n?: number;
}

export const MOVE_NAMES: Record<Move['dir'], string> = { up: 'ზემოთ', down: 'ქვემოთ', left: 'მარცხნივ', right: 'მარჯვნივ' };

export const moveText = (move: Move): string => `${move.n && move.n > 1 ? `${move.n} ` : ''}${MOVE_NAMES[move.dir]}`;

const DELTA: Record<Move['dir'], Cell> = {
  up: { row: -1, col: 0 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
  right: { row: 0, col: 1 },
};

/** One square's worth of a move — what a step-by-step walk needs. */
export const step = (cell: Cell, dir: Move['dir']): Cell => ({ row: cell.row + DELTA[dir].row, col: cell.col + DELTA[dir].col });

/**
 * Walk the instructions from `start`, one square at a time, stopping if a move would leave the grid. Returns every cell
 * visited, starting with `start`, plus whether the walk stayed inside — an instruction that walks off the grid is a
 * content bug, and this reports it instead of quietly clipping.
 */
export function walk(start: Cell, moves: readonly Move[], rows: number, cols: number): { cells: Cell[]; ok: boolean } {
  const cells: Cell[] = [start];
  if (!inside(start, rows, cols)) return { cells: [], ok: false };
  let at = start;
  for (const move of moves) {
    const times = move.n ?? 1;
    for (let k = 0; k < times; k += 1) {
      at = step(at, move.dir);
      if (!inside(at, rows, cols)) return { cells, ok: false };
      cells.push(at);
    }
  }
  return { cells, ok: true };
}

/** Where a walk ends — `walk` without the trail. */
export function endOf(start: Cell, moves: readonly Move[], rows: number, cols: number): Cell {
  const { cells, ok } = walk(start, moves, rows, cols);
  if (!ok) throw new RangeError('the instructions walk off the grid');
  return cells[cells.length - 1];
}

/** Every cell of a grid, in reading order. */
export const allCells = (rows: number, cols: number): Cell[] =>
  Array.from({ length: rows * cols }, (_, i) => ({ row: Math.floor(i / cols) + 1, col: (i % cols) + 1 }));

/** A whole row, left to right. */
export const rowOf = (row: number, cols: number): Cell[] => Array.from({ length: cols }, (_, i) => ({ row, col: i + 1 }));

/** A whole column, top to bottom. */
export const columnOf = (col: number, rows: number): Cell[] => Array.from({ length: rows }, (_, i) => ({ row: i + 1, col }));

/**
 * The instructions that walk from one cell to another: across first, then down. A shortest route on a grid with no
 * obstacles, and never diagonal.
 */
export function routeBetween(from: Cell, to: Cell): Move[] {
  const out: Move[] = [];
  const across = to.col - from.col;
  const down = to.row - from.row;
  if (across !== 0) out.push({ dir: across > 0 ? 'right' : 'left', n: Math.abs(across) });
  if (down !== 0) out.push({ dir: down > 0 ? 'down' : 'up', n: Math.abs(down) });
  return out;
}

/** The same route written out for a reader: `მარჯვნივ 2, ქვემოთ 1`. */
export const routeText = (moves: readonly Move[]): string => (moves.length === 0 ? 'ადგილზე დგას' : moves.map(moveText).join(', '));

// ─────────────────────────── grids with contents ───────────────────────────

/** A grid with something written in some of its cells. Missing cells are empty. */
export interface Grid {
  rows: number;
  cols: number;
  /** One entry per filled cell; an empty cell simply has no entry. */
  filled: Array<{ cell: Cell; item: Item }>;
}

/** What stands in a cell, or `null` when it is empty. */
export const at = (grid: Grid, cell: Cell): Item | null => grid.filled.find((f) => f.cell.row === cell.row && f.cell.col === cell.col)?.item ?? null;

/** The cells of a grid that are still empty, in reading order. */
export const holes = (grid: Grid): Cell[] => allCells(grid.rows, grid.cols).filter((c) => at(grid, c) === null);

/** Whether every cell of a grid is filled. */
export const isFull = (grid: Grid): boolean => holes(grid).length === 0;

/** Put an item in a cell, replacing whatever was there. */
export function put(grid: Grid, cell: Cell, item: Item): Grid {
  if (!inside(cell, grid.rows, grid.cols)) throw new RangeError(`${cellKey(cell)} is outside a ${grid.rows}×${grid.cols} grid`);
  return { ...grid, filled: [...grid.filled.filter((f) => !(f.cell.row === cell.row && f.cell.col === cell.col)), { cell, item }] };
}

/** Take whatever is in a cell out, leaving it empty. */
export const clear = (grid: Grid, cell: Cell): Grid => ({ ...grid, filled: grid.filled.filter((f) => !(f.cell.row === cell.row && f.cell.col === cell.col)) });

/** Build a grid from rows of items given as a list of columns, `null` for an empty cell. */
export function gridFrom(rows: Array<Array<Item | null>>): Grid {
  const filled: Array<{ cell: Cell; item: Item }> = [];
  rows.forEach((row, r) => row.forEach((item, c) => { if (item) filled.push({ cell: { row: r + 1, col: c + 1 }, item }); }));
  return { rows: rows.length, cols: Math.max(0, ...rows.map((r) => r.length)), filled };
}

/** The grid written out as rows of item names — how a solved grid is read back. */
export const gridText = (grid: Grid): string[] =>
  Array.from({ length: grid.rows }, (_, r) =>
    rowOf(r + 1, grid.cols)
      .map((c) => {
        const item = at(grid, c);
        return item ? SHAPE_GLYPH[item.shape] ?? item.shape : '·';
      })
      .join(' '),
  );

/**
 * A Latin-square style rule: every row and every column must hold each of `items` exactly once. This is the rule behind
 * the number and shape grid puzzles, and it is the only thing a completed grid is judged by.
 */
export function latinHolds(grid: Grid, items: readonly Item[]): { ok: boolean; row: number | null; col: number | null } {
  if (!isFull(grid) || grid.rows !== items.length || grid.cols !== items.length || items.some((x, i) => items.findIndex((y) => sameItem(x, y)) !== i)) return { ok: false, row: null, col: null };
  const has = (cells: Item[]) => items.every((want) => cells.filter((got) => sameItem(got, want)).length === 1);
  for (let r = 1; r <= grid.rows; r += 1) {
    const cells = rowOf(r, grid.cols).map((c) => at(grid, c));
    if (cells.some((x) => x === null) || !has(cells as Item[])) return { ok: false, row: r, col: null };
  }
  for (let c = 1; c <= grid.cols; c += 1) {
    const cells = columnOf(c, grid.rows).map((x) => at(grid, x));
    if (cells.some((x) => x === null) || !has(cells as Item[])) return { ok: false, row: null, col: c };
  }
  return { ok: true, row: null, col: null };
}

/**
 * The first empty cell that has only one item that could possibly go in it — the cell a student can fill confidently.
 * Returns `null` when nothing is forced yet.
 */
export function forcedCell(grid: Grid, items: readonly Item[]): { cell: Cell; item: Item } | null {
  for (const cell of holes(grid)) {
    const inRow = rowOf(cell.row, grid.cols).map((c) => at(grid, c)).filter((x): x is Item => x !== null);
    const inCol = columnOf(cell.col, grid.rows).map((c) => at(grid, c)).filter((x): x is Item => x !== null);
    const options = items.filter((item) => !inRow.some((x) => sameItem(x, item)) && !inCol.some((x) => sameItem(x, item)));
    if (options.length === 1) return { cell, item: options[0] };
  }
  return null;
}

/** Every empty cell, with the items that could still go in it — what an elimination table shows. */
export function optionsFor(grid: Grid, items: readonly Item[]): Array<{ cell: Cell; options: Item[] }> {
  return holes(grid).map((cell) => {
    const inRow = rowOf(cell.row, grid.cols).map((c) => at(grid, c)).filter((x): x is Item => x !== null);
    const inCol = columnOf(cell.col, grid.rows).map((c) => at(grid, c)).filter((x): x is Item => x !== null);
    return { cell, options: items.filter((item) => !inRow.some((x) => sameItem(x, item)) && !inCol.some((x) => sameItem(x, item))) };
  });
}

// ─────────────────────────── logic clues ───────────────────────────

/** What a logic puzzle is about: a set of candidates and the attributes they might have. */
export interface Candidate {
  id: string;
  label: string;
  /** Attribute → value, e.g. `{ colour: 'red', shape: 'circle' }`. */
  traits: Record<string, string>;
  /** What the candidate is called in a clue, e.g. „წითელი წრე“. */
  says?: string;
}

/** One clue: `attr` is (or is not) `value`. Two clues of the same kind must hold together. */
export interface Clue {
  attr: string;
  value: string;
  negate?: boolean;
}

/** Whether one candidate satisfies every clue. A clue of `negate` means the attribute must *not* be the value. */
export const satisfies = (candidate: Candidate, clues: readonly Clue[]): boolean =>
  clues.every((clue) => (candidate.traits[clue.attr] === clue.value) !== Boolean(clue.negate));

/** The candidates that satisfy every clue — the answer set of a logic puzzle. */
export const survivors = (candidates: readonly Candidate[], clues: readonly Clue[]): Candidate[] => candidates.filter((c) => satisfies(c, clues));

/** The first clue a candidate fails, or `null` when it satisfies them all — the "why is this one out?" answer. */
export function firstFailed(candidate: Candidate, clues: readonly Clue[]): Clue | null {
  return clues.find((clue) => (candidate.traits[clue.attr] === clue.value) === Boolean(clue.negate)) ?? null;
}

/** A clue said in words: „ფერი წითელია“ / „ფერი წითელი არ არის“. */
export const clueText = (clue: Clue, attrName: string, valueName: string): string =>
  `${attrName} ${valueName}${clue.negate ? ' არ არის' : 'ა'}`;

/**
 * Whether the clues are enough: exactly one candidate satisfies them all. A puzzle with two survivors has no answer,
 * and a puzzle with none has a contradiction — both are content bugs, and this is how they are caught.
 */
export function uniqueAnswer(candidates: readonly Candidate[], clues: readonly Clue[]): Candidate | null {
  const left = survivors(candidates, clues);
  return left.length === 1 ? left[0] : null;
}

/** The smallest set of clues that still leaves exactly one candidate — what "which clue do you not need?" asks. */
export function neededClues(candidates: readonly Candidate[], clues: readonly Clue[]): Clue[] {
  let keep = [...clues];
  for (let i = clues.length - 1; i >= 0; i -= 1) {
    const without = keep.filter((_, k) => k !== i);
    if (uniqueAnswer(candidates, without)) keep = without;
  }
  return keep;
}

/** The candidates a clue rules out — the elimination a student should be able to name. */
export const eliminatedBy = (candidates: readonly Candidate[], clue: Clue): Candidate[] =>
  candidates.filter((c) => (c.traits[clue.attr] === clue.value) === Boolean(clue.negate));
