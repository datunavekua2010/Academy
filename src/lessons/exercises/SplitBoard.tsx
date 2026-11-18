import { useRef, useState, type PointerEvent } from 'react';
import { TenFrame } from './Objects';

/**
 * Two boxes and a fixed number of counters. Counters only ever move from one
 * box to the other, so `left + right === total` at every moment — there is no
 * state in which a counter is created, lost or "in the air".
 *
 * Move a counter by tapping it, by dragging it into the other box, or with the
 * ◀ ▶ buttons (one counter at a time).
 */

interface Props {
  total: number;
  /** Counters in the first box (the rest are in the second). */
  left: number;
  onChange: (left: number) => void;
  disabled?: boolean;
  /** Show a ten-frame picture of the two parts under the boxes. */
  frame?: boolean;
  ariaLabel: string;
}

export const clampLeft = (left: number, total: number): number => Math.max(0, Math.min(total, Math.round(left)));

export function SplitBoard({ total, left, onChange, disabled = false, frame = false, ariaLabel }: Props) {
  const right = total - left;
  const boxes = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const drag = useRef<{ from: 0 | 1; x: number; y: number; moved: boolean } | null>(null);
  const [offset, setOffset] = useState<{ box: 0 | 1; index: number; dx: number; dy: number } | null>(null);
  const suppressClick = useRef(false);

  const move = (from: 0 | 1) => {
    if (disabled) return;
    if (from === 0 && left > 0) onChange(clampLeft(left - 1, total));
    if (from === 1 && right > 0) onChange(clampLeft(left + 1, total));
  };

  const down = (e: PointerEvent<HTMLButtonElement>, box: 0 | 1, index: number) => {
    if (disabled) return;
    drag.current = { from: box, x: e.clientX, y: e.clientY, moved: false };
    setOffset({ box, index, dx: 0, dy: 0 });
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const dragMove = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 8) d.moved = true;
    setOffset((o) => (o ? { ...o, dx, dy } : o));
  };
  const up = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    drag.current = null;
    setOffset(null);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    if (!d || !d.moved) return; // a tap: the click handler moves the counter
    suppressClick.current = true;
    const target = boxes[d.from === 0 ? 1 : 0].current?.getBoundingClientRect();
    if (target && e.clientX >= target.left && e.clientX <= target.right && e.clientY >= target.top && e.clientY <= target.bottom) move(d.from);
  };
  const click = (from: 0 | 1) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    move(from);
  };

  const counters = (box: 0 | 1, n: number) =>
    Array.from({ length: n }, (_, i) => {
      const lifted = offset && offset.box === box && offset.index === i;
      return (
        <button
          key={i}
          type="button"
          className={`spl-counter ${lifted ? 'is-lifted' : ''}`}
          style={lifted ? { transform: `translate(${offset.dx}px, ${offset.dy}px)` } : undefined}
          disabled={disabled}
          aria-label={box === 0 ? 'კუბიკი პირველ ყუთში. შეეხე, რომ მეორეში გადავიდეს' : 'კუბიკი მეორე ყუთში. შეეხე, რომ პირველში გადავიდეს'}
          onClick={() => click(box)}
          onPointerDown={(e) => down(e, box, i)}
          onPointerMove={dragMove}
          onPointerUp={up}
          onPointerCancel={up}
        />
      );
    });

  return (
    <div className="spl" role="group" aria-label={ariaLabel}>
      <div className="spl-boxes">
        <div className="spl-box" ref={boxes[0]}>
          <span className="spl-label">პირველი ყუთი</span>
          <div className="spl-counters">{counters(0, left)}</div>
          <output className="spl-count" aria-label={`პირველ ყუთში: ${left}`}>{left}</output>
        </div>
        <div className="spl-box is-second" ref={boxes[1]}>
          <span className="spl-label">მეორე ყუთი</span>
          <div className="spl-counters">{counters(1, right)}</div>
          <output className="spl-count" aria-label={`მეორე ყუთში: ${right}`}>{right}</output>
        </div>
      </div>
      <div className="nl-controls">
        <button type="button" className="nl-step" onClick={() => move(0)} disabled={disabled || left === 0} aria-label="ერთი კუბიკი პირველიდან მეორე ყუთში">
          <span aria-hidden="true">▶</span>
        </button>
        <output className="spl-total" aria-live="polite">
          სულ: {left + right}
        </output>
        <button type="button" className="nl-step" onClick={() => move(1)} disabled={disabled || right === 0} aria-label="ერთი კუბიკი მეორედან პირველ ყუთში">
          <span aria-hidden="true">◀</span>
        </button>
      </div>
      {frame && <TenFrame count={left} second={right} label={`ათიანი ჩარჩო: ${left} და ${right}`} />}
    </div>
  );
}
