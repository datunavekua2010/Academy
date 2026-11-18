import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { NumberLine } from './NumberLine';

/**
 * Number tiles in a row, reordered by dragging or by tap-to-select.
 *
 *  • Drag: press a tile and slide it along the row; the others make room.
 *  • Tap: tap a tile to pick it up (it is outlined and marked ▲), then tap the
 *    place it should go, or use the ◀ ▶ buttons to move it one place.
 *  • Keyboard: focus a tile, Space/Enter picks it up, ← → move it.
 *
 * Every slot has a fixed size, so the row never changes width or height while a
 * tile moves. The component only reorders; whether the order is right is decided
 * in `check.ts`.
 */

interface Props {
  /** The tiles in their starting order (keeps the DOM stable while tiles move). */
  base: number[];
  order: number[];
  onChange: (next: number[]) => void;
  disabled?: boolean;
  /** Number line drawn under the tiles (shown when the lesson allows help). */
  line?: { min: number; max: number } | null;
  ariaLabel: string;
}

export const moveItem = <T,>(list: readonly T[], from: number, to: number): T[] => {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(Math.max(0, Math.min(next.length, to)), 0, item);
  return next;
};

/** Slot under a horizontal pointer position, clamped to the row. Pure, so it is testable without layout. */
export function slotAtX(clientX: number, rect: { left: number; width: number }, slots: number): number {
  const fraction = (clientX - rect.left) / Math.max(rect.width, 1);
  return Math.max(0, Math.min(slots - 1, Math.floor(fraction * slots)));
}

export function OrderBoard({ base, order, onChange, disabled = false, line = null, ariaLabel }: Props) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [held, setHeld] = useState<number | null>(null); // tapped-to-select (value)
  const [dragging, setDragging] = useState<number | null>(null); // dragged tile (value)
  const [note, setNote] = useState('');

  const indexOf = (value: number) => order.indexOf(value);
  const put = (value: number, to: number) => {
    const from = indexOf(value);
    if (from === to || from < 0) return;
    onChange(moveItem(order, from, to));
  };

  const onTile = (value: number) => {
    if (disabled) return;
    if (held === null) {
      setHeld(value);
      setNote(`აიღე ${value}. შეეხე ადგილს, სადაც უნდა დადგეს, ან გამოიყენე ისრები.`);
    } else if (held === value) {
      setHeld(null);
      setNote('');
    } else {
      put(held, indexOf(value));
      setNote(`${held} გადავიდა ახალ ადგილას.`);
      setHeld(null);
    }
  };

  const step = (delta: -1 | 1) => {
    if (held === null) return;
    const to = indexOf(held) + delta;
    if (to < 0 || to >= order.length) return;
    put(held, to);
    setNote(`${held} გადავიდა ${delta < 0 ? 'მარცხნივ' : 'მარჯვნივ'}.`);
  };

  const onPointerDown = (e: PointerEvent<HTMLButtonElement>, value: number) => {
    if (disabled) return;
    setDragging(value);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLButtonElement>) => {
    if (dragging === null || !rowRef.current) return;
    const to = slotAtX(e.clientX, rowRef.current.getBoundingClientRect(), order.length);
    if (to !== indexOf(dragging)) put(dragging, to);
  };
  const endDrag = (e: PointerEvent<HTMLButtonElement>) => {
    if (dragging === null) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setDragging(null);
  };

  const onKey = (e: KeyboardEvent<HTMLButtonElement>, value: number) => {
    if (disabled || held !== value) return;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      step(e.key === 'ArrowLeft' ? -1 : 1);
    }
  };

  return (
    <div className="ord">
      <div className="ord-row" ref={rowRef} role="group" aria-label={ariaLabel} style={{ gridTemplateColumns: `repeat(${order.length}, minmax(0, 1fr))` }}>
        {order.map((_, i) => (
          <div key={`slot-${i}`} className="ord-slot" style={{ gridColumn: i + 1, gridRow: 1 }} aria-hidden="true" />
        ))}
        {/* The tiles never change place in the DOM (a captured pointer would be lost); only their grid column changes. */}
        {base.map((value) => {
          const i = indexOf(value);
          return (
            <button
              key={value}
              type="button"
              className={`ord-tile ${held === value ? 'is-held' : ''} ${dragging === value ? 'is-dragging' : ''}`}
              style={{ gridColumn: i + 1, gridRow: 1 }}
              aria-pressed={held === value}
              aria-label={`რიცხვი ${value}, ადგილი ${i + 1} ${order.length}-დან`}
              disabled={disabled}
              onClick={() => onTile(value)}
              onKeyDown={(e) => onKey(e, value)}
              onPointerDown={(e) => onPointerDown(e, value)}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              {value}
              {held === value && <span className="ord-mark" aria-hidden="true">▲</span>}
            </button>
          );
        })}
      </div>
      <div className="ord-controls">
        <button type="button" className="nl-step" onClick={() => step(-1)} disabled={disabled || held === null || indexOf(held) === 0} aria-label="არჩეული ფილა მარცხნივ">
          <span aria-hidden="true">◀</span>
        </button>
        <span className="ord-hint">{held === null ? 'შეეხე ფილას ან გადაათრიე' : `არჩეულია: ${held}`}</span>
        <button type="button" className="nl-step" onClick={() => step(1)} disabled={disabled || held === null || indexOf(held) === order.length - 1} aria-label="არჩეული ფილა მარჯვნივ">
          <span aria-hidden="true">▶</span>
        </button>
      </div>
      <p className="xt-note" role="status" aria-live="polite">
        {note || 'ფილები რიგში დააწყვე.'}
      </p>
      {line && <NumberLine min={line.min} max={line.max} value={null} labelled={order} ariaLabel="დამხმარე რიცხვითი ღერძი" />}
    </div>
  );
}
