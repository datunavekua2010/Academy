import type { CSSProperties } from 'react';

/**
 * A five- or ten-frame (rows of five). Each space holds a counter of the first group (solid),
 * a counter of the second group (ring) or nothing. Solid versus ring — not colour alone — tells
 * the groups apart. With `onCell` the spaces are buttons.
 */

export type Cell = 'a' | 'b' | null;

interface Props {
  cells: Cell[];
  onCell?: (index: number) => void;
  disabled?: boolean;
  /** Draw second-group counters as empty spaces (the "remaining spaces"). */
  hideSecond?: boolean;
  label: string;
}

export const countCells = (cells: Cell[]): { a: number; b: number; empty: number } => ({
  a: cells.filter((c) => c === 'a').length,
  b: cells.filter((c) => c === 'b').length,
  empty: cells.filter((c) => c === null).length,
});

/** `a` first-group counters followed by `b` second-group counters in a frame of `size`. */
export function cellsFor(size: number, a: number, b: number): Cell[] {
  return Array.from({ length: size }, (_, i) => (i < a ? 'a' : i < a + b ? 'b' : null));
}

const cellName = (c: Cell, hidden: boolean): string => (c === 'a' ? 'პირველი ჯგუფის კუბიკი' : c === 'b' && !hidden ? 'მეორე ჯგუფის კუბიკი' : 'ცარიელი ადგილი');

export function FrameBoard({ cells, onCell, disabled = false, hideSecond = false, label }: Props) {
  const { a, b, empty } = countCells(cells);
  const spoken = hideSecond ? `${a} კუბიკი, ${b + empty} ცარიელი ადგილი` : `${a} და ${b}${empty ? `, ცარიელი: ${empty}` : ''}`;
  return (
    <div className="frameb" role="group" aria-label={`${label}: ${spoken}`}>
      <div className={`frameb-grid ${cells.length === 5 ? 'is-five' : ''}`}>
        {cells.map((cell, i) => {
          const shown: Cell = cell === 'b' && hideSecond ? null : cell;
          const cls = `frameb-cell ${shown ? `is-${shown}` : ''} ${cell === 'b' && hideSecond ? 'is-hidden-b' : ''}`;
          const style = { '--i': i } as CSSProperties;
          const content = shown ? <span className="frameb-dot" key={`${i}-${shown}`} aria-hidden="true" /> : null;
          return onCell ? (
            <button key={i} type="button" className={cls} style={style} disabled={disabled} aria-label={`${i + 1}. ${cellName(cell, hideSecond)}`} onClick={() => onCell(i)}>
              {content}
            </button>
          ) : (
            <span key={i} className={cls} style={style} aria-hidden="true">
              {content}
            </span>
          );
        })}
      </div>
    </div>
  );
}
