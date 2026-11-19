import type { Verdict } from '../types';
import type { Cell, GridPicture, MirrorLine } from './SymmetryGeometry';
import { betweenColumns, betweenRows, cellKey, keySet, lineName, middleHorizontal, middleVertical, missingForSymmetry, reflectCells, tidy } from './SymmetryGeometry';

/**
 * Pictures and answer controls for G2 U10.
 *
 * A picture is a set of grid cells and a mirror line is a position in half-cells, so "is this symmetric?" is decided by
 * reflecting the cells and comparing sets — never by looking at the drawing. What is drawn and what is marked are the
 * same cells.
 */

/** One grid of cells, with a mirror line drawn through it and filled cells as solid squares. */
export function GridBoard({
  picture,
  line,
  ghost,
  marks,
  onCell,
  disabled,
  label,
  cellPx = 26,
}: {
  picture: GridPicture;
  line?: MirrorLine;
  /** Draw the reflection of the filled cells as an outline, to show where a mirror would put them. */
  ghost?: boolean;
  /** Cells to draw with a tick (already given). */
  marks?: Cell[];
  onCell?: (cell: Cell) => void;
  disabled?: boolean;
  label: string;
  cellPx?: number;
}) {
  const filled = keySet(picture.cells);
  const marked = keySet(marks ?? []);
  const ghosts = ghost && line ? keySet(reflectCells(picture.cells, line)) : new Set<string>();
  const cells: Cell[] = [];
  for (let y = 0; y < picture.height; y += 1) for (let x = 0; x < picture.width; x += 1) cells.push({ x, y });
  const vertical = line && line.axis === 'vertical' ? line.at / 2 : null;
  const horizontal = line && line.axis === 'horizontal' ? line.at / 2 : null;
  return (
    <div className="grd" role={onCell ? 'group' : 'img'} aria-label={label} style={{ ['--grd-cell' as string]: `${cellPx}px` }}>
      <div className="grd-grid" style={{ gridTemplateColumns: `repeat(${picture.width}, var(--grd-cell))`, gridTemplateRows: `repeat(${picture.height}, var(--grd-cell))` }}>
        {cells.map((cell) => {
          const key = cellKey(cell);
          const isFilled = filled.has(key);
          const isGhost = !isFilled && ghosts.has(key);
          const classes = ['grd-cell', isFilled ? 'is-filled' : '', isGhost ? 'is-ghost' : '', marked.has(key) ? 'is-marked' : ''].filter(Boolean).join(' ');
          if (!onCell) return <span key={key} className={classes} aria-hidden="true" />;
          return (
            <button
              key={key}
              type="button"
              className={classes}
              disabled={disabled}
              aria-pressed={isFilled}
              aria-label={`უჯრა ${cell.x + 1},${cell.y + 1}${isFilled ? ' — შევსებული' : ''}`}
              onClick={() => onCell(cell)}
            />
          );
        })}
        {vertical !== null && vertical !== undefined && (
          <span className="grd-line is-vertical" aria-hidden="true" style={{ left: `calc(${vertical} * var(--grd-cell))` }} />
        )}
        {horizontal !== null && horizontal !== undefined && (
          <span className="grd-line is-horizontal" aria-hidden="true" style={{ top: `calc(${horizontal} * var(--grd-cell))` }} />
        )}
      </div>
    </div>
  );
}

/** A picture with a mirror line, drawn from its own cells. */
export function PictureBoard({ picture, line, ghost, marks, caption }: { picture: GridPicture; line?: MirrorLine; ghost?: boolean; marks?: Cell[]; caption?: string }) {
  return (
    <figure className="grd-fig">
      <GridBoard picture={picture} line={line} ghost={ghost} marks={marks} label={caption ?? 'ფიგურა ბადეზე'} />
      {line && <figcaption className="grd-cap">{`${lineName(line)} სარკის ხაზი`}</figcaption>}
      {caption && <figcaption className="grd-cap">{caption}</figcaption>}
    </figure>
  );
}

/**
 * The student fills in the cells that make a picture symmetric. The cells already given are drawn solid and cannot be
 * removed: completing a picture means adding what is missing, not redesigning it.
 */
export function SymmetryFillAnswer({
  picture,
  line,
  value,
  onChange,
  disabled,
  verdict,
  label,
}: {
  picture: GridPicture;
  line: MirrorLine;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  verdict?: Verdict;
  label: string;
}) {
  const added: Cell[] = value === '' ? [] : value.split(';').filter(Boolean).map((chunk) => {
    const [x, y] = chunk.split(',').map(Number);
    return { x, y };
  });
  const given = keySet(picture.cells);
  const toggle = (cell: Cell) => {
    if (disabled) return;
    if (given.has(cellKey(cell))) return;
    const has = added.some((c) => c.x === cell.x && c.y === cell.y);
    const next = has ? added.filter((c) => !(c.x === cell.x && c.y === cell.y)) : [...added, cell];
    onChange(next.map(cellKey).join(';'));
  };
  const shown: GridPicture = { ...picture, cells: tidy([...picture.cells, ...added]) };
  const missing = missingForSymmetry(shown.cells, line).length;
  return (
    <div className={`symf ${verdict === 'correct' ? 'is-correct' : verdict === 'incorrect' ? 'is-wrong' : ''}`}>
      <GridBoard picture={shown} line={line} onCell={toggle} disabled={disabled} marks={picture.cells} label={label} />
      <p className="symf-note" aria-live="polite">
        {added.length === 0 ? 'შეავსე უჯრები ისე, რომ ფიგურა სარკის ხაზის ორივე მხარეს ერთნაირი იყოს.' : missing === 0 ? 'ფიგურა სარკულია!' : `ჯერ ${missing} უჯრას აკლია წყვილი.`}
      </p>
    </div>
  );
}

/**
 * Pick the mirror line(s) of a picture: a candidate line is shown over the picture and can be tried, and the answer is
 * the set of lines that really reflect the picture onto itself.
 */
export function SymmetryLineAnswer({
  picture,
  candidates,
  value,
  onChange,
  disabled,
  verdict,
  label,
}: {
  picture: GridPicture;
  candidates: MirrorLine[];
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  verdict?: Verdict;
  label: string;
}) {
  const chosen = value === '' ? [] : value.split(',');
  const key = (l: MirrorLine) => `${l.axis}:${l.at}`;
  const active = candidates.find((l) => chosen.includes(key(l)));
  const toggle = (l: MirrorLine) => {
    if (disabled) return;
    const k = key(l);
    onChange((chosen.includes(k) ? chosen.filter((c) => c !== k) : [...chosen, k]).join(','));
  };
  return (
    <div className={`syml ${verdict === 'correct' ? 'is-correct' : verdict === 'incorrect' ? 'is-wrong' : ''}`}>
      <GridBoard picture={picture} line={active} label={label} />
      <ul className="syml-list">
        {candidates.map((l) => (
          <li key={key(l)}>
            <button type="button" className={`btn ${chosen.includes(key(l)) ? 'btn-primary' : 'btn-ghost'}`} aria-pressed={chosen.includes(key(l))} disabled={disabled} onClick={() => toggle(l)}>
              {l.axis === 'vertical' ? 'ვერტიკალური' : 'ჰორიზონტალური'} · {l.at % 2 === 0 ? 'შუაზე' : 'ხაზებს შორის'}
            </button>
          </li>
        ))}
      </ul>
      <p className="syml-note" aria-live="polite">
        {chosen.length === 0 ? 'აირჩიე ხაზი და შეხედე, ფიგურა თავის თავზე დადის თუ არა.' : `არჩეულია ${chosen.length} ხაზი.`}
      </p>
    </div>
  );
}

/** The mirror lines a grid picture of this size could possibly have — the candidates the lesson offers. */
export function candidateLines(width: number, height: number): MirrorLine[] {
  const out: MirrorLine[] = [];
  const midV = middleVertical(width);
  const midH = middleHorizontal(height);
  out.push(midV, midH);
  if (width > 1) out.push(betweenColumns(Math.floor(width / 2) - 1), betweenColumns(Math.floor(width / 2)));
  if (height > 1) out.push(betweenRows(Math.floor(height / 2) - 1), betweenRows(Math.floor(height / 2)));
  const seen = new Set<string>();
  return out.filter((l) => {
    const k = `${l.axis}:${l.at}`;
    if (seen.has(k)) return false;
    // a line past the far edge of the grid is not a line through this picture
    if (l.at < 0 || l.at > (l.axis === 'vertical' ? width : height)) return false;
    seen.add(k);
    return true;
  });
}
