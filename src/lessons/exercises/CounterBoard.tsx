import { useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import type { CounterGlyph } from '../types';
import { GlyphIcon } from './Objects';

/**
 * Counters that move between three places: a top area (the whole, or the container the
 * counters start in) and two boxes (the parts).
 *
 * The data is just three numbers, `[top, a, b]`, and their sum never changes — a counter
 * is always in exactly one place, so none can be duplicated or lost. Every counter is
 * still a real element with its own identity, placed by percentage, so when the numbers
 * change it glides to its new spot instead of jumping.
 *
 * Move a counter by dragging it to another place, or by tapping it (it is picked up) and
 * then tapping the place it should go to. Everything works on a phone and with a keyboard.
 */

export type Counts = [number, number, number];
export type Zone = 0 | 1 | 2;

// ─────────────────────────── geometry (pure) ───────────────────────────

/** Sizes are in "width units": the board is 100 units wide. */
export interface ZoneRect {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface BoardGeometry {
  height: number;
  zones: [ZoneRect, ZoneRect, ZoneRect];
  /** Counter diameter. */
  size: number;
}

const HEADER = 9;
const BOX_COLS = 4;
const BOX_PITCH = 10.2;
const TOP_COLS = 10;
const TOP_PITCH = 9.2;
const FRAME_PITCH = 10.4;
const GAP = 3;

export function boardGeometry(total: number, hasTop = true, frame?: 5 | 10): BoardGeometry {
  const boxRows = Math.max(2, Math.ceil(total / BOX_COLS));
  const topRows = frame ? frame / 5 : Math.max(1, Math.ceil(total / TOP_COLS));
  const topH = HEADER + topRows * (frame ? FRAME_PITCH : TOP_PITCH) + 2;
  const boxH = HEADER + boxRows * BOX_PITCH + 2;
  const boxY = hasTop ? topH + GAP : 0;
  return {
    height: boxY + boxH,
    size: 8,
    zones: [
      { x: 0, y: 0, w: 100, h: hasTop ? topH : 0 },
      { x: 0, y: boxY, w: 49, h: boxH },
      { x: 51, y: boxY, w: 49, h: boxH },
    ],
  };
}

/** Centre of slot `slot` in a zone, in width units from the board's top-left. */
export function slotCenter(geometry: BoardGeometry, zone: Zone, slot: number, frame?: 5 | 10): { x: number; y: number } {
  const z = geometry.zones[zone];
  if (zone === 0) {
    if (frame) {
      const col = slot % 5;
      const row = Math.floor(slot / 5);
      return { x: 50 + (col - 2) * FRAME_PITCH, y: z.y + HEADER + (row + 0.5) * FRAME_PITCH };
    }
    const col = slot % TOP_COLS;
    const row = Math.floor(slot / TOP_COLS);
    return { x: 50 + (col - (TOP_COLS - 1) / 2) * TOP_PITCH, y: z.y + HEADER + (row + 0.5) * TOP_PITCH };
  }
  const col = slot % BOX_COLS;
  const row = Math.floor(slot / BOX_COLS);
  return { x: z.x + z.w / 2 + (col - (BOX_COLS - 1) / 2) * BOX_PITCH, y: z.y + HEADER + (row + 0.5) * BOX_PITCH };
}

// ─────────────────────────── identity (pure) ───────────────────────────

/** For each zone, the ids of the counters in it, in the order they arrived. */
export type Lists = number[][];

export function initialLists(counts: Counts): Lists {
  let id = 0;
  return counts.map((c) => Array.from({ length: c }, () => id++));
}

/**
 * Brings the per-zone lists in line with `counts` while keeping every counter's identity:
 * a counter that stays where it is keeps its slot; a counter that has to leave is the last
 * to have arrived (or `pending.id`, the one the student actually moved).
 */
export function reconcileLists(lists: Lists, counts: Counts, pending?: { id: number; to: number } | null): Lists {
  const next = lists.map((l) => [...l]);
  if (pending) {
    const from = next.findIndex((l) => l.includes(pending.id));
    if (from >= 0 && from !== pending.to && counts[from] === next[from].length - 1 && counts[pending.to] === next[pending.to].length + 1) {
      next[from] = next[from].filter((id) => id !== pending.id);
      next[pending.to].push(pending.id);
    }
  }
  const moving: number[] = [];
  for (let z = 0; z < 3; z += 1) while (next[z].length > counts[z]) moving.push(next[z].pop() as number);
  let fresh = Math.max(-1, ...next.flat(), ...moving) + 1;
  for (let z = 0; z < 3; z += 1) {
    while (next[z].length < counts[z]) next[z].push(moving.length > 0 ? (moving.shift() as number) : fresh++);
  }
  return next;
}

/** Moves one counter from `from` to `to`, keeping the total. Returns the same counts if the move is impossible. */
export function moveCounts(counts: Counts, from: Zone, to: Zone): Counts {
  if (from === to || counts[from] <= 0) return counts;
  const next: Counts = [...counts];
  next[from] -= 1;
  next[to] += 1;
  return next;
}

// ─────────────────────────── component ───────────────────────────

interface Props {
  counts: Counts;
  onChange: (counts: Counts) => void;
  disabled?: boolean;
  glyph?: CounterGlyph;
  palette?: 'plain' | 'redblue';
  /** Names of the three places. */
  labels?: [string, string, string];
  /** Places the student may move counters INTO. Default: all. */
  dropZones?: Zone[];
  /** Hide the top area (only the two boxes). */
  hideTop?: boolean;
  /** Draw the top area as a five- or ten-frame. */
  frame?: 5 | 10;
  /** A place whose counters pulse (to draw attention to them). */
  emphasis?: Zone | null;
  /** Show "total" under the board. */
  showTotal?: boolean;
  ariaLabel: string;
}

const DEFAULT_LABELS: [string, string, string] = ['ყველა კუბიკი', 'პირველი ყუთი', 'მეორე ყუთი'];

export function CounterBoard({ counts, onChange, disabled = false, glyph = 'counter', palette = 'plain', labels = DEFAULT_LABELS, dropZones, hideTop = false, frame, emphasis = null, showTotal = true, ariaLabel }: Props) {
  const total = counts[0] + counts[1] + counts[2];
  const geometry = boardGeometry(total, !hideTop, frame);
  const lists = useRef<Lists>(initialLists(counts));
  const pending = useRef<{ id: number; to: number } | null>(null);
  lists.current = reconcileLists(lists.current, counts, pending.current);
  pending.current = null;

  const zoneRefs = [useRef<HTMLButtonElement>(null), useRef<HTMLButtonElement>(null), useRef<HTMLButtonElement>(null)];
  const drag = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [lift, setLift] = useState<{ id: number; dx: number; dy: number } | null>(null);
  const [pickedId, setSelected] = useState<number | null>(null);
  const selected = pickedId !== null && lists.current.some((l) => l.includes(pickedId)) ? pickedId : null;

  const zoneOf = (id: number): Zone => lists.current.findIndex((l) => l.includes(id)) as Zone;
  const canDrop = (z: Zone) => !disabled && (dropZones ? dropZones.includes(z) : true) && !(hideTop && z === 0);

  const moveTo = (id: number, to: Zone): boolean => {
    const from = zoneOf(id);
    if (from < 0 || from === to || !canDrop(to) || counts[from] <= 0) return false;
    pending.current = { id, to };
    onChange(moveCounts(counts, from, to));
    return true;
  };

  const clickCounter = (id: number) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    if (disabled) return;
    if (selected === null) {
      setSelected(id);
      return;
    }
    if (selected === id) {
      setSelected(null);
      return;
    }
    const target = zoneOf(id);
    if (target === zoneOf(selected)) {
      setSelected(id); // another counter of the same place: pick that one instead
      return;
    }
    place(target);
  };

  const place = (to: Zone) => {
    if (selected === null) return;
    const from = zoneOf(selected);
    if (moveTo(selected, to)) {
      // keep going: pick up the next counter of the place we took it from
      const rest = lists.current[from].filter((id) => id !== selected);
      setSelected(rest.length > 0 ? rest[rest.length - 1] : null);
    }
  };

  const down = (e: PointerEvent<HTMLButtonElement>, id: number) => {
    if (disabled) return;
    drag.current = { id, x: e.clientX, y: e.clientY, moved: false };
    setLift({ id, dx: 0, dy: 0 });
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const dragMove = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 8) d.moved = true;
    setLift({ id: d.id, dx, dy });
  };
  const up = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    drag.current = null;
    setLift(null);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    if (!d || !d.moved) return; // a tap: the click handler picks the counter up
    suppressClick.current = true;
    const hit = zoneRefs.findIndex((ref) => {
      const r = ref.current?.getBoundingClientRect();
      return r !== undefined && r.width > 0 && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    });
    if (hit >= 0) {
      moveTo(d.id, hit as Zone);
      setSelected(null);
    }
  };

  const zones: Zone[] = hideTop ? [1, 2] : [0, 1, 2];
  const pct = (units: number) => `${(units / geometry.height) * 100}%`;
  const selectedZone = selected === null ? null : zoneOf(selected);

  return (
    <div className="cb-wrap">
      <div className={`cb ${palette === 'redblue' ? 'is-redblue' : ''} ${selected !== null ? 'has-selection' : ''}`} role="group" aria-label={ariaLabel} style={{ aspectRatio: `100 / ${geometry.height}` }}>
        {zones.map((z) => {
          const rect = geometry.zones[z];
          const targetable = selectedZone !== null && selectedZone !== z && canDrop(z);
          return (
            <button
              key={`zone-${z}`}
              ref={zoneRefs[z]}
              type="button"
              className={`cb-zone is-zone-${z} ${targetable ? 'is-target' : ''} ${emphasis === z ? 'is-emph' : ''}`}
              style={{ left: `${rect.x}%`, top: pct(rect.y), width: `${rect.w}%`, height: pct(rect.h) }}
              aria-label={`${labels[z]}: ${counts[z]}${targetable ? '. შეეხე, რომ არჩეული კუბიკი აქ გადმოვიდეს' : ''}`}
              disabled={disabled || !canDrop(z)}
              onClick={() => place(z)}
            >
              <span className="cb-zone-label" aria-hidden="true">
                {labels[z]}
              </span>
              <span className="cb-zone-count" aria-hidden="true">
                {counts[z]}
              </span>
            </button>
          );
        })}
        {!hideTop && frame &&
          Array.from({ length: frame }, (_, k) => {
            const c = slotCenter(geometry, 0, k, frame);
            return <span key={`cell-${k}`} className="cb-cell" aria-hidden="true" style={{ left: `${c.x}%`, top: pct(c.y), width: '9.8%' }} />;
          })}
        {zones.flatMap((z) =>
          lists.current[z].map((id, slot) => {
            const c = slotCenter(geometry, z, slot, z === 0 ? frame : undefined);
            const lifted = lift?.id === id && drag.current?.moved;
            const style: CSSProperties = {
              left: `${c.x}%`,
              top: pct(c.y),
              width: `${geometry.size}%`,
              transform: lifted ? `translate(calc(-50% + ${lift?.dx ?? 0}px), calc(-50% + ${lift?.dy ?? 0}px))` : undefined,
            };
            return (
              <button
                key={`c-${id}`}
                type="button"
                className={`cb-counter is-z${z} ${selected === id ? 'is-selected' : ''} ${lifted ? 'is-lifted' : ''} ${emphasis === z ? 'is-emph' : ''}`}
                style={style}
                data-zone={z}
                aria-pressed={selected === id}
                aria-label={`${glyph === 'counter' ? 'კუბიკი' : 'საგანი'}, ${labels[z]}${selected === id ? '. არჩეულია' : ''}`}
                disabled={disabled}
                onClick={() => clickCounter(id)}
                onPointerDown={(e) => down(e, id)}
                onPointerMove={dragMove}
                onPointerUp={up}
                onPointerCancel={up}
              >
                {glyph === 'counter' ? <span className="cb-disc" aria-hidden="true" /> : <GlyphIcon glyph={glyph} />}
                {selected === id && <span className="cb-up" aria-hidden="true">▲</span>}
              </button>
            );
          }),
        )}
      </div>
      {showTotal && (
        <output className="cb-total" aria-live="polite">
          სულ: {total}
        </output>
      )}
    </div>
  );
}
