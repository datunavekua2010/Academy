import type { Cell as GridCell, Item, Pattern } from './GridGeometry';
import { countsIn, itemAt, itemText, periodOf, SHAPE_GLYPH } from './GridGeometry';
type GridShape = string;

/**
 * Pictures for G2 U12.
 *
 * Every board is a rendering of the same pattern or grid object the checker uses, so a row the student sees is a row the
 * checker walks. The pattern is never re-derived here: `itemAt` decides what sits in a position.
 */

/** A shape drawn at a given size, so "growing" is visible rather than described. */
export function ShapeGlyph({ shape, size = 1, colour }: { shape: GridShape; size?: number; colour?: string }) {
  const px = Math.round(18 + 14 * size);
  const style = { width: px, height: px, color: colour };
  switch (shape) {
    case 'circle':
      return <span className="gp-glyph is-circle" style={style} aria-label="წრე" />;
    case 'square':
      return <span className="gp-glyph is-square" style={style} aria-label="კვადრატი" />;
    case 'triangle':
      return <span className="gp-glyph is-triangle" style={style} aria-label="სამკუთხედი" />;
    case 'diamond':
      return <span className="gp-glyph is-diamond" style={style} aria-label="რომბი" />;
    case 'star':
      return <span className="gp-glyph is-star" style={style} aria-label="ვარსკვლავი" />;
    default:
      return <span className="gp-glyph is-circle" style={style} aria-label="ფორმა" />;
  }
}

/** One item of a pattern: its shape, its colour, and — for growing patterns — its size. */
export function PatternItemView({ item, place }: { item: Item; place?: number }) {
  return (
    <span className="gp-item" data-place={place} style={{ color: item.colour }}>
      <span aria-label={itemText(item)}>{SHAPE_GLYPH[item.shape] ?? item.shape} <span>{itemText(item)}</span></span>
    </span>
  );
}

/**
 * A pattern laid out in one row, with optional gaps. A gap is drawn as an empty slot, never as a wrong shape — the student
 * has to supply it.
 */
export function PatternRow({
  pattern,
  length,
  holes,
  caption,
  highlight,
  label,
}: {
  pattern: Pattern;
  length: number;
  holes?: number[];
  /** Positions that are wrong on purpose, to be corrected. */
  highlight?: number[];
  caption?: string;
  label?: string;
}) {
  const items = Array.from({ length }, (_, i) => itemAt(pattern, i));
  return (
    <figure className="gp-rowfig" aria-label={label ?? `კანონზომიერება ${length} ელემენტით`}>
      <ol className="gp-row">
        {items.map((item, i) => {
          const pos = i + 1;
          const hole = holes?.includes(pos) ?? false;
          const bad = highlight?.includes(pos) ?? false;
          return (
            <li key={i} className={`gp-slot ${hole ? 'is-hole' : ''} ${bad ? 'is-bad' : ''}`}>
              <span className="gp-pos">{pos}</span>
              {hole ? <span className="gp-blank" aria-label={`გამოტოვებული ${pos}`}>?</span> : <PatternItemView item={item} place={pos} />}
            </li>
          );
        })}
      </ol>
      {caption && <figcaption className="gp-cap">{caption}</figcaption>}
    </figure>
  );
}

/** A pattern with a planted mistake, and the option to point at the mistake's position. */
export function MistakeRow({ pattern, length, items, caption }: { pattern: Pattern; length: number; items: Array<Item>; caption?: string }) {
  void pattern;
  return (
    <figure className="gp-rowfig" aria-label={`კანონზომიერება ${length} ელემენტით, ერთი შეცდომით`}>
      <ol className="gp-row">
        {items.map((item, i) => (
          <li key={i} className="gp-slot">
            <span className="gp-pos">{i + 1}</span>
            <PatternItemView item={item} place={i + 1} />
          </li>
        ))}
      </ol>
      {caption && <figcaption className="gp-cap">{caption}</figcaption>}
    </figure>
  );
}

/** The rule of a pattern, said in words. */
export function RuleTag({ pattern }: { pattern: Pattern }) {
  if (pattern.kind === 'repeat') {
    const span = periodOf(pattern);
    return (
      <p className="gp-rule">
        წესი: ყოველ {span} ელემენტში ერთი და იგივე მეორდება.
      </p>
    );
  }
  return <p className="gp-rule">წესი: ყოველი {pattern.every} ელემენტის შემდეგ იცვლება {pattern.change === 'shape' ? 'ფორმა' : 'ფერი'}.</p>;
}

/** A grid of letters, one per cell, with holes drawn as boxes. */
export function GridBoard({
  rows,
  cols,
  cells,
  holes,
  mark,
  path,
  caption,
  label,
}: {
  rows: number;
  cols: number;
  cells: Array<{ row: number; col: number; text: string }>;
  holes?: Array<{ row: number; col: number }>;
  mark?: { row: number; col: number };
  path?: Array<{ row: number; col: number }>;
  caption?: string;
  label?: string;
}) {
  const lookup = new Map(cells.map((c) => [`${c.row},${c.col}`, c.text]));
  const holeSet = new Set((holes ?? []).map((h) => `${h.row},${h.col}`));
  const pathSet = new Set((path ?? []).map((p) => `${p.row},${p.col}`));
  return (
    <figure className="gp-gridfig" aria-label={label ?? `${rows} × ${cols} ბადე`}>
      <table className="gp-grid">
        <caption className="gp-gridcap">{label ?? `${rows} მწკრივი, ${cols} სვეტი`}</caption>
        <tbody>
          {Array.from({ length: rows }, (_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }, (_, c) => {
                const key = `${r + 1},${c + 1}`;
                const text = lookup.get(key);
                const isMark = mark?.row === r + 1 && mark?.col === c + 1;
                return (
                  <td
                    key={c}
                    className={`gp-cell ${holeSet.has(key) ? 'is-hole' : ''} ${isMark ? 'is-mark' : ''} ${pathSet.has(key) ? 'is-path' : ''}`}
                    aria-label={`მწკრივი ${r + 1}, სვეტი ${c + 1}${text ? `: ${text}` : ''}`}
                  >
                    <span className="gp-celltext">{holeSet.has(key) ? '·' : text ?? ''}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {caption && <figcaption className="gp-cap">{caption}</figcaption>}
    </figure>
  );
}

/** Row and column labels beside a grid, for the lesson on reading positions. */
export function GridAxes({ rows, cols }: { rows: number; cols: number }) {
  return (
    <p className="gp-axes">
      <span>მწკრივები: {rows}</span>
      <span>სვეტები: {cols}</span>
      <span>უჯრები: {rows * cols}</span>
    </p>
  );
}

/** A small character on the grid, named so instructions can say "move the rabbit". */
export function GridWalker({ at, rows, cols, name }: { at: { row: number; col: number }; rows: number; cols: number; name?: string }) {
  return (
    <p className="gp-walker" aria-label={`${name ?? 'მოთამაშე'} მწკრივ ${at.row}, სვეტ ${at.col} — ბადე ${rows} × ${cols}`}>
      <span className="gp-walker-face">▲</span>
      <span>{`${name ?? 'მოთამაშე'} → მწკრივი ${at.row}, სვეტი ${at.col}`}</span>
    </p>
  );
}

/** The list of clues in a logic puzzle, each numbered so the student can cite one. */
export function ClueList({ clues, chosen, onPick, disabled }: { clues: string[]; chosen?: number[]; onPick?: (i: number) => void; disabled?: boolean }) {
  return (
    <ul className="gp-clues" aria-label="მინიშნებები">
      {clues.map((clue, i) => {
        const on = chosen?.includes(i) ?? false;
        return (
          <li key={i}>
            {onPick ? (
              <button type="button" className={`gp-clue ${on ? 'is-on' : ''}`} aria-pressed={on} disabled={disabled} onClick={() => onPick(i)}>
                <span className="gp-clue-num">{i + 1}</span>
                <span className="gp-clue-text">{clue}</span>
              </button>
            ) : (
              <p className="gp-clue is-static">
                <span className="gp-clue-num">{i + 1}</span>
                <span className="gp-clue-text">{clue}</span>
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** How many of each shape a pattern contains — the counting strategy the lesson teaches. */
export function CountTag({ pattern, length }: { pattern: Pattern; length: number }) {
  const counts = countsIn(pattern, length);
  return (
    <p className="gp-counts">
      {counts.map(({ item, count }) => <span key={`${item.shape}-${item.colour}`}>{itemText(item)}: {count}</span>)}
    </p>
  );
}

/** The cells of a grid, for a board that wants them as a list without the table. */
export const cellList = (cells: GridCell[]): GridCell[] => [...cells];
