import type { CSSProperties } from 'react';
import type { Glyph } from '../types';
import { GLYPH_NAME, GlyphIcon } from './Objects';

/**
 * Objects that leave a group. Every object keeps its own place in the group; taking one away moves it
 * into the "taken away" tray (it glides there) and leaves a visible gap behind, so the objects can
 * never be lost or duplicated. `removed` lists the indices in the order they were taken.
 */

const COLS = 5;
const PITCH = 17;
const HEAD = 9;
const SIZE = 14;
const GAP = 3;

export interface TakeAwayGeometry {
  rows: number;
  panel: number;
  height: number;
}

export function takeAwayGeometry(total: number): TakeAwayGeometry {
  const rows = Math.max(1, Math.ceil(total / COLS));
  const panel = HEAD + rows * PITCH + 2;
  return { rows, panel, height: panel * 2 + GAP };
}

/** Centre of a slot, in width units from the board's top-left. `tray` slots sit in the lower panel. */
export function takeAwaySlot(geometry: TakeAwayGeometry, slot: number, tray: boolean): { x: number; y: number } {
  const col = slot % COLS;
  const row = Math.floor(slot / COLS);
  return { x: 50 + (col - (COLS - 1) / 2) * PITCH, y: (tray ? geometry.panel + GAP : 0) + HEAD + (row + 0.5) * PITCH };
}

interface Props {
  total: number;
  glyph: Glyph;
  removed: number[];
  onToggle?: (index: number) => void;
  /** Show how many are left in the group (off when that number is the answer). */
  showRemaining?: boolean;
  label: string;
}

export function TakeAwayBoard({ total, glyph, removed, onToggle, showRemaining = false, label }: Props) {
  const geometry = takeAwayGeometry(total);
  const pct = (units: number) => `${(units / geometry.height) * 100}%`;
  const out = new Map(removed.map((index, order) => [index, order]));
  const left = total - removed.length;
  return (
    <div className="tab-wrap">
      <div className="tab" style={{ aspectRatio: `100 / ${geometry.height}` }} role="group" aria-label={`${label}: ${total} ${GLYPH_NAME[glyph]}, გამოტანილია ${removed.length}`}>
        <div className="tab-panel is-group" style={{ top: 0, height: pct(geometry.panel) }}>
          <span className="tab-label">ჯგუფი</span>
          {showRemaining && <span className="tab-count">{left}</span>}
        </div>
        <div className="tab-panel is-tray" style={{ top: pct(geometry.panel + GAP), height: pct(geometry.panel) }}>
          <span className="tab-label">გამოტანილი</span>
          <span className="tab-count">{removed.length}</span>
        </div>
        {Array.from({ length: total }, (_, i) => {
          const order = out.get(i);
          const c = takeAwaySlot(geometry, order ?? i, order !== undefined);
          const style: CSSProperties = { left: `${c.x}%`, top: pct(c.y), width: `${SIZE}%` };
          const cls = `tab-obj ${order !== undefined ? 'is-out' : ''}`;
          const inner = <GlyphIcon glyph={glyph} />;
          return onToggle ? (
            <button key={i} type="button" className={cls} style={style} aria-pressed={order !== undefined} aria-label={`${GLYPH_NAME[glyph]} ${i + 1}: ${order !== undefined ? 'გამოტანილია. შეეხე, რომ დაბრუნდეს' : 'ჯგუფშია. შეეხე, რომ გამოიტანო'}`} onClick={() => onToggle(i)}>
              {inner}
            </button>
          ) : (
            <span key={i} className={cls} style={style} aria-hidden="true">
              {inner}
            </span>
          );
        })}
      </div>
      <output className="objs-count" aria-live="polite">
        გამოტანილია: <strong>{removed.length}</strong>
        {showRemaining && (
          <>
            {' '}· დარჩა: <strong>{left}</strong>
          </>
        )}
      </output>
    </div>
  );
}
