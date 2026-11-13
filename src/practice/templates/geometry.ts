/**
 * U12 — geometry as data.
 *
 * The whole unit rests on one decision: **a shape is data, not a word.**
 * `Shape` carries the side count and the corner count, every picture is rendered
 * from the shape object itself, and every answer is computed from those same two
 * numbers. A triangle can therefore never be drawn under a sentence whose answer
 * is „4“.
 *
 * The glyphs are the real Unicode geometric shapes (○ △ □ ▭ ⬠ ⬡) rather than
 * coloured squares, because they differ from each other in exactly the way the
 * questions differ: by the number of sides you can see.
 */

/** A flat shape: what it is called, and what is true of it. */
export interface Shape {
  /** Stable key, used as the identity in a drawing or an option. */
  key: string;
  /** Georgian name, as the student reads it. */
  name: string;
  sides: number;
  corners: number;
  /** The geometric glyph this shape is drawn with. */
  glyph: string;
  /** True for the circle: no sides and no corners at all. */
  round?: boolean;
  /** True only for the square among four-sided shapes. */
  equilateral?: boolean;
}

/**
 * The flat shapes grade 1 knows, in curriculum order.
 *
 * `equilateral` is what separates the square from the rectangle, and it is the
 * only property that can, because both have four sides and four corners.
 */
const flatShape = (
  key: string,
  name: string,
  sides: number,
  corners: number,
  glyph: string,
  extra: Pick<Shape, 'round' | 'equilateral'> = {},
): Shape => ({ key, name, sides, corners, glyph, ...extra });

export const SHAPES: Record<string, Shape> = {
  circle: flatShape('circle', 'წრე', 0, 0, '○', { round: true }),
  triangle: flatShape('triangle', 'სამკუთხედი', 3, 3, '△'),
  square: flatShape('square', 'კვადრატი', 4, 4, '□', { equilateral: true }),
  rectangle: flatShape('rectangle', 'მართკუთხედი', 4, 4, '▭'),
  pentagon: flatShape('pentagon', 'ხუთკუთხედი', 5, 5, '⬠'),
  hexagon: flatShape('hexagon', 'ექვსკუთხედი', 6, 6, '⬡'),
};

/** A flat shape by key, with a loud failure rather than `undefined`. */
export const flat = (key: string): Shape => {
  const found = SHAPES[key];
  if (!found) throw new Error(`no flat shape "${key}"`);
  return found;
};

/** Every flat shape, in curriculum order. */
export const FLAT: Shape[] = Object.values(SHAPES);

/** The flat shapes with sides to count (everything but the circle). */
export const POLYGONS: Shape[] = FLAT.filter((item) => !item.round);

/* ================================================================== *\
 * Solids
 * ================================================================== */

/** A solid shape: what it is called, and how its surface behaves. */
export interface Solid {
  key: string;
  name: string;
  /** An everyday object that is this shape. */
  object: string;
  /** It has a flat face, so it stands on its own. */
  stands: boolean;
  /** It has a curved surface, so it can roll. */
  rolls: boolean;
  /** The glyph it is drawn with. */
  glyph: string;
}

/**
 * The four solid shapes.
 *
 * `stands` and `rolls` are two independent facts, and that independence is the
 * whole point. The specification warns that „which shape rolls?“ has more than
 * one honest answer, and it is right: a cylinder and a cone both roll, and so
 * does a sphere. So no template here ever asks that. A rolling question asks for
 * the shape that **only** rolls — the sphere, the one solid with no flat face —
 * and the both-properties question is a set question over the two flags.
 *
 * The cube is the mirror case: it stands, and it does **not** roll, because every
 * face it has is flat. Getting that wrong would have made „stands and rolls“ a
 * three-item answer with a cube in it.
 */
const solidShape = (
  key: string,
  name: string,
  object: string,
  glyph: string,
  stands: boolean,
  rolls: boolean,
): Solid => ({ key, name, object, glyph, stands, rolls });

export const SOLIDS: Record<string, Solid> = {
  sphere: solidShape('sphere', 'სფერო', 'ბურთი', '⚽', false, true),
  cube: solidShape('cube', 'კუბი', 'კამათელი', '🎲', true, false),
  cylinder: solidShape('cylinder', 'ცილინდრი', 'ქილა', '🥫', true, true),
  cone: solidShape('cone', 'კონუსი', 'ნაყინის კონუსი', '🍦', true, true),
};

/** A solid shape by key. */
export const solid = (key: string): Solid => {
  const found = SOLIDS[key];
  if (!found) throw new Error(`no solid shape "${key}"`);
  return found;
};

/** Every solid shape, in curriculum order. */
export const SOLID: Solid[] = Object.values(SOLIDS);

/**
 * Everyday objects, each with the shape it resembles.
 *
 * A list of *object → shape* pairs rather than a list of objects, because the
 * answer has to come from the same table the picture does.
 */
export interface Stuff {
  key: string;
  name: string;
  glyph: string;
  /** The flat or solid shape it resembles. */
  like: string;
  /** One sentence about its shape, used in explanations. */
  note: string;
}

export const STUFF: Record<string, Stuff> = {
  ball: { key: 'ball', name: 'ბურთი', glyph: '⚽', like: 'sphere', note: 'მრგვალია, არც ერთი კუთხე არ აქვს' },
  dice: { key: 'dice', name: 'კამათელი', glyph: '🎲', like: 'cube', note: 'ექვსი კვადრატული გვერდი აქვს' },
  box: { key: 'box', name: 'კუბის ყუთი', glyph: '📦', like: 'cube', note: 'ექვსი კვადრატული გვერდი აქვს' },
  can: { key: 'can', name: 'ქილა', glyph: '🥫', like: 'cylinder', note: 'ორი ბრტყელი წრიული და მრუდე გვერდი აქვს' },
  cone: { key: 'cone', name: 'ნაყინის კონუსი', glyph: '🍦', like: 'cone', note: 'ბრტყელი წრიული ძირი და წვერო აქვს' },
  book: { key: 'book', name: 'წიგნი', glyph: '📕', like: 'rectangle', note: 'ოთხი გვერდი აქვს' },
  window: { key: 'window', name: 'ფანჯარა', glyph: '🪟', like: 'rectangle', note: 'ოთხი გვერდი აქვს' },
  napkin: { key: 'napkin', name: 'კვადრატული ხელსახოცი', glyph: '🧻', like: 'square', note: 'ოთხივე გვერდი ტოლია' },
  sign: { key: 'sign', name: 'სამკუთხა ნიშანი', glyph: '⚠️', like: 'triangle', note: 'სამი გვერდი აქვს' },
};

/** An everyday object by key. */
export const stuff = (key: string): Stuff => {
  const found = STUFF[key];
  if (!found) throw new Error(`no object "${key}"`);
  return found;
};

/** Every everyday object. */
export const STUFF_ALL: Stuff[] = Object.values(STUFF);

/* ================================================================== *\
 * Georgian grammar
 * ================================================================== */

/**
 * The dative form of a noun ending in `-ი` or `-ო`: „კვადრატი“ → „კვადრატს“,
 * „სფერო“ → „სფეროს“.
 *
 * Worth a function because the template wording is full of „… აქვს {shape}-ს“
 * and a hyphenated suffix reads as a typo to any Georgian speaker — the earlier
 * draft printed „მართკუთხედი-ს“, which is exactly the kind of thing a generated
 * question must never do.
 */
export const dative = (name: string): string => `${name.replace(/ი$/, '')}ს`;

/* ================================================================== *\
 * Drawing
 * ================================================================== */

/** A shape drawn once, with its name — for an option that asks *what* it is. */
export const label = (target: Shape): string => `${target.glyph} ${target.name}`;

/** A shape drawn once, without its name — for an option that asks *which* it is. */
export const bare = (target: Shape): string => target.glyph;

/** A row of shapes, one glyph each. */
export const row = (its: Shape[]): string => its.map(bare).join('   ');

/** A row of `count` copies of one shape. */
export const copies = (target: Shape, count: number): string => Array.from({ length: count }, () => bare(target)).join(' ');

/** A row of objects, one glyph each. */
export const objectRow = (its: Stuff[]): string => its.map((item) => item.glyph).join('   ');

/** A solid drawn without its name. */
export const solidBare = (target: Solid): string => target.glyph;

/** A solid drawn with its name. */
export const solidLabel = (target: Solid): string => `${target.glyph} ${target.name}`;

/** A row of solids without names. */
export const solidRow = (its: Solid[]): string => its.map(solidBare).join('   ');

/* ================================================================== *\
 * Open and closed lines
 * ================================================================== */

/**
 * One of the two kinds of line the unit draws.
 *
 * A closed line's ends meet, so it encloses something; an open line has two
 * loose ends. The glyph and the kind travel together, so a picture can never be
 * labelled the other way round.
 */
export interface Line {
  kind: 'open' | 'closed';
  glyph: string;
  name: string;
}

export const CLOSED_LINES: Line[] = [
  { kind: 'closed', glyph: '◯', name: 'დახურული წრე' },
  { kind: 'closed', glyph: '□', name: 'დახურული კვადრატი' },
  { kind: 'closed', glyph: '△', name: 'დახურული სამკუთხედი' },
  { kind: 'closed', glyph: '◇', name: 'დახურული რომბი' },
  { kind: 'closed', glyph: '⬡', name: 'დახურული ექვსკუთხედი' },
];

export const OPEN_LINES: Line[] = [
  { kind: 'open', glyph: '⌒', name: 'ღია რკალი' },
  { kind: 'open', glyph: '⊐', name: 'ღია კუთხე' },
  { kind: 'open', glyph: '∿', name: 'ღია ტალღა' },
  { kind: 'open', glyph: '⌐', name: 'ღია კუთხე' },
  { kind: 'open', glyph: 'ㄥ', name: 'ღია კუთხე' },
];

/** Every line the unit can draw. */
export const LINES: Line[] = [...CLOSED_LINES, ...OPEN_LINES];

/**
 * The line a glyph draws.
 *
 * Note that three open lines share the name „ღია კუთხე“ — they are the same
 * *kind* of picture drawn at different angles, and the questions are about the
 * kind. A template that offers two of them as options would therefore offer two
 * identical answers, so option lists are built from `distinctLines` below.
 */
export const lineAt = (glyph: string): Line => {
  const found = LINES.find((item) => item.glyph === glyph);
  if (!found) throw new Error(`no line "${glyph}"`);
  return found;
};

/**
 * Named lines with unique names.
 *
 * Used whenever option text is a line's name: three glyphs all called „ღია
 * კუთხე“ would otherwise produce three identical options.
 */
export const CLOSED_NAMED: Line[] = CLOSED_LINES;
export const OPEN_NAMED: Line[] = OPEN_LINES.filter(
  (line, index, all) => all.findIndex((other) => other.name === line.name) === index,
);

/** A line drawn with room around it. */
export const drawn = (target: Line): string => ` ${target.glyph} `;

/** A row of lines, one glyph each. */
export const lineRow = (its: Line[]): string => its.map((item) => item.glyph).join('   ');

/* ================================================================== *\
 * Grids, for symmetry
 * ================================================================== */

/** A figure on a grid: `"col,row"` names with a 0-based column and row. */
export type Cells = string[];

/** The cell name for a column and row. */
export const at = (col: number, row: number): string => `${col},${row}`;

/** A cell name split back into its column and row. */
export const atCell = (name: string): { col: number; row: number } => {
  const [col, row] = name.split(',').map(Number);
  return { col: col!, row: row! };
};

/**
 * A figure's mirror image across a vertical middle line.
 *
 * `width` is the width of the whole grid — the mirror line runs down its centre,
 * so a cell at column `c` lands at `width − 1 − c`. Written this way rather than
 * as an axis coordinate because an off-by-one here silently produced cells
 * *outside* the grid: the mirror of column 0 on a four-wide grid came out as
 * column 4, which `grid` then simply never drew, and every symmetry question in
 * the first draft had an empty half.
 */
export const mirrorVertical = (cells: Cells, width: number): Cells =>
  cells.map((name) => {
    const { col, row } = atCell(name);
    return at(width - 1 - col, row);
  });

/** The same across a horizontal middle line. */
export const mirrorHorizontal = (cells: Cells, height: number): Cells =>
  cells.map((name) => {
    const { col, row } = atCell(name);
    return at(col, height - 1 - row);
  });

/** Filled and empty cell marks. Chosen so a grid line reads as a picture. */
const FILLED = '■';
const EMPTY = '·';

/** Draws a grid with the given cells filled, one row per line. */
export const grid = (cells: Cells, cols: number, rows: number): string => {
  const set = new Set(cells);
  const lines: string[] = [];
  for (let line = 0; line < rows; line += 1) {
    let text = '';
    for (let column = 0; column < cols; column += 1) text += set.has(at(column, line)) ? FILLED : EMPTY;
    lines.push(text);
  }
  return lines.join('\n');
};

/** The same picture on one line, for an answer option. */
export const gridInline = (cells: Cells, cols: number, rows: number): string => grid(cells, cols, rows).split('\n').join(' / ');

/** Reads a drawn grid back into the cells it fills — the picture as data. */
export const readGrid = (picture: string): Cells => {
  const out: Cells = [];
  picture.split('\n').forEach((line, lineIndex) => {
    [...line].forEach((mark, column) => {
      if (mark === FILLED) out.push(at(column, lineIndex));
    });
  });
  return out;
};

/** Is every filled cell mirrored across the vertical middle line? */
export const symmetricVertical = (cells: Cells, width: number): boolean => {
  const set = new Set(cells);
  return cells.every((name) => set.has(mirrorVertical([name], width)[0]!));
};

/** The same across a horizontal middle line. */
export const symmetricHorizontal = (cells: Cells, height: number): boolean => {
  const set = new Set(cells);
  return cells.every((name) => set.has(mirrorHorizontal([name], height)[0]!));
};

/** Moves every cell `dx` columns to the right (negative = left). */
export const shift = (cells: Cells, dx: number): Cells =>
  cells.map((name) => {
    const { col, row } = atCell(name);
    return at(col + dx, row);
  });

/**
 * A cell `cols` wide whose mirror partner is empty, if there is one.
 *
 * Used to break a symmetric picture without accidentally filling its twin: a
 * cell added where the mirror is already taken would leave the picture symmetric
 * and the „which one is not symmetric“ question answerless.
 */
export const freeCell = (cells: Cells, cols: number, rows: number): string | null => {
  const set = new Set(cells);
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (!set.has(at(col, row)) && !set.has(at(cols - 1 - col, row))) return at(col, row);
    }
  }
  return null;
};

/**
 * The same picture with one cell taken away — guaranteed asymmetric, because the
 * cell's mirror partner is still drawn and now has nothing opposite it.
 */
export const withOneCellRemoved = (cells: Cells, which: number): Cells => {
  const out = [...cells];
  out.splice(which % out.length, 1);
  return out;
};

/** The same picture with one cell added where the mirror is empty. */
export const withOneCellAdded = (cells: Cells, cols: number, rows: number): Cells => {
  const free = freeCell(cells, cols, rows);
  return free ? [...cells, free] : [...cells];
};
