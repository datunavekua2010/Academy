import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';

/**
 * The shared number line. One component for every lesson: configurable range,
 * tappable ticks, a draggable marker that snaps to whole numbers, optional
 * ◀ ▶ step buttons, a start flag, a destination flag, a highlighted interval
 * and hop arcs between visited numbers.
 *
 * Values are whole numbers only. Position is always computed from the value
 * (`pos`), so a tick, its label and the marker can never drift apart.
 */

export interface NumberLineProps {
  min: number;
  max: number;
  /** The marker. `null`/`undefined`: no marker yet. */
  value?: number | null;
  /** Makes the line interactive. Called with a whole number inside [min, max]. */
  onChange?: (value: number) => void;
  /** Ticks that always show their number. */
  labelled?: number[];
  /** Label every n-th tick. Default: only `labelled` when given, else every tick on short lines and every 5th on long ones. */
  labelEvery?: number;
  /** Where the marker began (shown as a flag). */
  start?: number | null;
  /** The target (shown as a flag). */
  destination?: number | null;
  /** A highlighted interval, both ends included. */
  highlight?: [number, number];
  /** Visited numbers, in order. Neighbours are joined with a hop arc. */
  hops?: number[];
  /** Named positions drawn as labelled flags (e.g. two numbers being compared). */
  pins?: Array<{ value: number; label: string }>;
  /** Show the ◀ ▶ one-step buttons. */
  arrows?: boolean;
  disabled?: boolean;
  /** Show the marker's number in words below the line. */
  showValue?: boolean;
  ariaLabel: string;
}

const PAD = 22;
const GAP = 30;

export const clampToLine = (n: number, min: number, max: number): number => Math.min(max, Math.max(min, Math.round(n)));

/** The number nearest to a horizontal position inside the strip. Pure, so it is testable without a layout engine. */
export function valueAtX(clientX: number, rect: { left: number; width: number }, min: number, max: number): number {
  const usable = Math.max(rect.width - PAD * 2, 1);
  const fraction = (clientX - rect.left - PAD) / usable;
  return clampToLine(min + fraction * (max - min), min, max);
}

export function NumberLine({ min, max, value = null, onChange, labelled = [], labelEvery, start = null, destination = null, highlight, hops = [], pins = [], arrows = false, disabled = false, showValue = false, ariaLabel }: NumberLineProps) {
  const span = max - min;
  const stripRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const interactive = Boolean(onChange) && !disabled;
  // With an explicit `labelled` list only those ticks are numbered, so the student has to count the rest.
  const every = labelEvery ?? (labelled.length > 0 ? Number.POSITIVE_INFINITY : span <= 14 ? 1 : 5);
  const ticks = Array.from({ length: span + 1 }, (_, i) => min + i);
  const visited = new Set(hops);
  const labelled_ = new Set(labelled);

  const pos = (v: number): string => `calc(${PAD}px + ${(v - min) / span} * (100% - ${PAD * 2}px))`;
  const widthOf = (a: number, b: number): string => `calc(${Math.abs(b - a) / span} * (100% - ${PAD * 2}px))`;

  const set = (n: number) => {
    if (!interactive) return;
    const next = clampToLine(n, min, max);
    if (next !== value) onChange?.(next);
  };
  const base = value ?? start ?? min;

  // keep the marker in view on long lines
  useEffect(() => {
    const box = scrollRef.current;
    const strip = stripRef.current;
    if (!box || !strip || value === null || typeof box.scrollTo !== 'function') return;
    const x = PAD + ((value - min) / span) * (strip.scrollWidth - PAD * 2);
    if (x < box.scrollLeft + 24 || x > box.scrollLeft + box.clientWidth - 24) box.scrollTo({ left: Math.max(0, x - box.clientWidth / 2), behavior: 'smooth' });
  }, [value, min, span]);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragging(true);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging || !stripRef.current) return;
    set(valueAtX(e.clientX, stripRef.current.getBoundingClientRect(), min, max));
  };
  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    setDragging(false);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number> = { ArrowLeft: base - 1, ArrowDown: base - 1, ArrowRight: base + 1, ArrowUp: base + 1, Home: min, End: max };
    if (e.key in moves) {
      e.preventDefault();
      set(moves[e.key]);
    }
  };

  const arcs = hops.slice(1).map((to, i) => [hops[i], to] as const);

  return (
    <div className={`nl ${interactive ? 'is-interactive' : ''} ${disabled ? 'is-disabled' : ''}`}>
      <div className="nl-scroll" ref={scrollRef}>
        <div className="nl-strip" ref={stripRef} style={{ minWidth: span * GAP + PAD * 2 }} role="group" aria-label={ariaLabel}>
          {highlight && <div className="nl-band" style={{ left: pos(Math.min(...highlight)), width: widthOf(highlight[0], highlight[1]) }} aria-hidden="true" />}
          <div className="nl-bar" aria-hidden="true" />
          {arcs.map(([a, b], i) => (
            <div key={`${a}-${b}-${i}`} className="nl-arc" style={{ left: pos(Math.min(a, b)), width: widthOf(a, b) }} aria-hidden="true" />
          ))}
          {ticks.map((v) => {
            const showLabel = labelled_.has(v) || visited.has(v) || (v - min) % every === 0 || v === max || v === start || v === destination || pins.some((p) => p.value === v);
            const inner = (
              <>
                <span className="nl-tick-mark" aria-hidden="true" />
                {showLabel && <span className="nl-tick-label">{v}</span>}
              </>
            );
            const cls = `nl-tick ${showLabel ? 'has-label' : ''} ${visited.has(v) ? 'is-visited' : ''}`;
            return interactive ? (
              <button key={v} type="button" className={cls} style={{ left: pos(v) }} aria-label={`რიცხვი ${v}`} aria-pressed={value === v} tabIndex={-1} onClick={() => set(v)}>
                {inner}
              </button>
            ) : (
              <span key={v} className={cls} style={{ left: pos(v) }}>
                {inner}
              </span>
            );
          })}
          {start !== null && (
            <div className="nl-flag is-start" style={{ left: pos(start) }}>
              <span>დასაწყისი</span>
            </div>
          )}
          {destination !== null && (
            <div className="nl-flag is-goal" style={{ left: pos(destination) }}>
              <span>მიზანი</span>
            </div>
          )}
          {pins.map((p, i) => (
            <div key={`${p.label}-${p.value}`} className={`nl-flag is-pin ${i % 2 ? 'is-low' : ''}`} style={{ left: pos(p.value) }}>
              <span>{p.label}</span>
            </div>
          ))}
          {value !== null && (
            <div
              className={`nl-marker ${dragging ? 'is-dragging' : ''}`}
              style={{ left: pos(value) }}
              role={interactive ? 'slider' : 'img'}
              tabIndex={interactive ? 0 : -1}
              aria-label={interactive ? 'მარკერი' : `მარკერი: რიცხვი ${value}`}
              {...(interactive ? { 'aria-orientation': 'horizontal' as const, 'aria-valuemin': min, 'aria-valuemax': max, 'aria-valuenow': value, 'aria-valuetext': `რიცხვი ${value}` } : {})}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onKeyDown={onKey}
            >
              <span className="nl-marker-pin" aria-hidden="true" />
            </div>
          )}
        </div>
      </div>

      {(arrows || showValue) && (
        <div className="nl-controls">
          {arrows && (
            <button type="button" className="nl-step" onClick={() => set(base - 1)} disabled={!interactive || base <= min} aria-label="ერთი ნაბიჯი მარცხნივ">
              <span aria-hidden="true">◀</span>
            </button>
          )}
          {showValue && (
            <output className="nl-readout" aria-live="polite">
              {value === null ? 'მარკერი ჯერ არ დადგმულა' : `მარკერზე: ${value}`}
            </output>
          )}
          {arrows && (
            <button type="button" className="nl-step" onClick={() => set(base + 1)} disabled={!interactive || base >= max} aria-label="ერთი ნაბიჯი მარჯვნივ">
              <span aria-hidden="true">▶</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
