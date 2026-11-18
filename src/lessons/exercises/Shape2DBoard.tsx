import { useState } from 'react';
import {
  FLAT_NAME,
  type Flat,
  type FlatSpec,
  type Pt2,
  outlineOf,
  shapeGroup,
  sidesOf,
  sideLengths,
  verticesOf,
} from './Shape2DGeometry';

/**
 * Pictures for Unit 8. Every outline comes from `Shape2DGeometry`, and the sides and corners are counted from that
 * outline — a turned square is still drawn as a square with four sides, and a circle is drawn as a curve, not as a
 * many-sided polygon that would give it corners it does not have.
 */

const PAD = 10;

const FILL: Record<Flat, string> = {
  circle: '#cfe0ff',
  triangle: '#fde9a8',
  square: '#c9efd3',
  rectangle: '#fbd0c8',
};

const EDGE = '#1e3a8a';

const r1 = (n: number): string => String(Math.round(n * 100) / 100);

/** The drawing box a shape needs, from its outline. */
function box(spec: FlatSpec): { x: number; y: number; w: number; h: number } {
  const pts = outlineOf(spec);
  if (!pts) {
    const radius = spec.radius ?? (spec.size ?? 100) / 2;
    return { x: -radius, y: -radius, w: radius * 2, h: radius * 2 };
  }
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

/** A shape, drawn from its outline. `size` is the on-screen width of its picture. */
export function Shape2D({
  spec,
  label,
  size = 108,
  markSides = false,
  markCorners = false,
  litSides = [],
  litCorners = [],
  onSide,
  onCorner,
  muted = false,
}: {
  spec: FlatSpec;
  label?: string;
  size?: number;
  /** Draw a side number on each side, and the corners as dots. */
  markSides?: boolean;
  markCorners?: boolean;
  litSides?: number[];
  litCorners?: number[];
  onSide?: (n: number) => void;
  onCorner?: (n: number) => void;
  muted?: boolean;
}) {
  const b = box(spec);
  const pad = PAD;
  const width = b.w + pad * 2;
  const height = b.h + pad * 2;
  const pts = outlineOf(spec);
  const radius = spec.radius ?? (spec.size ?? 100) / 2;
  const name = FLAT_NAME[spec.kind];
  const sides = sidesOf(spec);
  const corners = verticesOf(spec);

  const mid = (a: Pt2, c: Pt2): Pt2 => ({ x: (a.x + c.x) / 2, y: (a.y + c.y) / 2 });

  return (
    <svg
      className={`f2 ${muted ? 'is-muted' : ''}`}
      style={{ width: `${size}px`, maxWidth: '100%' }}
      viewBox={`${r1(b.x - pad)} ${r1(b.y - pad)} ${r1(width)} ${r1(height)}`}
      role="img"
      aria-label={label ?? `${name}: ${sides} გვერდი, ${corners} კუთხე`}
    >
      {pts ? (
        <polygon className="f2-body" points={pts.map((p) => `${r1(p.x)},${r1(p.y)}`).join(' ')} style={{ fill: FILL[spec.kind], stroke: EDGE }} />
      ) : (
        <circle className="f2-body" cx={0} cy={0} r={radius} style={{ fill: FILL.circle, stroke: EDGE }} />
      )}
      {markSides &&
        pts &&
        pts.map((p, i) => {
          const q = pts[(i + 1) % pts.length];
          const m = mid(p, q);
          const lit = litSides.includes(i + 1);
          return (
            <g
              key={`s${i}`}
              className={`f2-side ${lit ? 'is-lit' : ''}`}
              role={onSide ? 'button' : undefined}
              tabIndex={onSide ? 0 : undefined}
              aria-label={`გვერდი ${i + 1}${lit ? ', დათვლილია' : ''}`}
              onClick={onSide ? () => onSide(i + 1) : undefined}
              onKeyDown={
                onSide
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSide(i + 1);
                      }
                    }
                  : undefined
              }
            >
              <line className="f2-side-hit" x1={p.x} y1={p.y} x2={q.x} y2={q.y} />
              <line className="f2-side-line" x1={p.x} y1={p.y} x2={q.x} y2={q.y} />
              <circle className="f2-side-dot" cx={m.x} cy={m.y} r={7.5} />
              <text className="f2-side-n" x={m.x} y={m.y} textAnchor="middle" dominantBaseline="central">
                {lit ? i + 1 : ''}
              </text>
            </g>
          );
        })}
      {markCorners &&
        pts &&
        pts.map((p, i) => {
          const lit = litCorners.includes(i + 1);
          return (
            <g
              key={`c${i}`}
              className={`f2-corner ${lit ? 'is-lit' : ''}`}
              role={onCorner ? 'button' : undefined}
              tabIndex={onCorner ? 0 : undefined}
              aria-label={`კუთხე ${i + 1}${lit ? ', დათვლილია' : ''}`}
              onClick={onCorner ? () => onCorner(i + 1) : undefined}
              onKeyDown={
                onCorner
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onCorner(i + 1);
                      }
                    }
                  : undefined
              }
            >
              <circle className="f2-corner-hit" cx={p.x} cy={p.y} r={12} />
              <circle className="f2-corner-dot" cx={p.x} cy={p.y} r={lit ? 6 : 4.6} />
              {lit && (
                <text className="f2-corner-n" x={p.x} y={p.y - 11} textAnchor="middle">
                  {i + 1}
                </text>
              )}
            </g>
          );
        })}
      {spec.kind === 'circle' && (markSides || markCorners) && (
        <text className="f2-none" x={0} y={b.y + b.h + pad - 2} textAnchor="middle">
          სწორი გვერდი და კუთხე არ აქვს
        </text>
      )}
    </svg>
  );
}

/** A row of shapes; `compact` keeps them small enough for a phone. */
export function Shape2DRow({ shapes, compact = false, showSides = false }: { shapes: FlatSpec[]; compact?: boolean; showSides?: boolean }) {
  return (
    <div className={`f2-row ${compact ? 'is-compact' : ''}`}>
      {shapes.map((spec, i) => (
        <Shape2D key={i} spec={spec} size={compact ? 74 : 96} markSides={showSides} />
      ))}
    </div>
  );
}

// ─────────────────────────── counting sides and corners ───────────────────────────

/**
 * Tap a side (or a corner) to count it. Tapping the same part twice un-counts it, so a mis-tap is always
 * recoverable; the board only reports the parts the student has counted, and the checker decides whether that is
 * every part exactly once.
 */
export function TapShapeBoard({
  spec,
  tap,
  counted,
  onChange,
  disabled = false,
  label,
}: {
  spec: FlatSpec;
  tap: 'sides' | 'corners';
  counted: number[];
  onChange: (counted: number[]) => void;
  disabled?: boolean;
  label: string;
}) {
  const total = tap === 'sides' ? sidesOf(spec) : verticesOf(spec);
  const toggle = (n: number) => {
    if (disabled) return;
    onChange(counted.includes(n) ? counted.filter((x) => x !== n) : [...counted, n].sort((a, b) => a - b));
  };
  return (
    <div className="tp">
      <Shape2D
        spec={spec}
        label={label}
        size={190}
        markSides={tap === 'sides'}
        markCorners={tap === 'corners'}
        litSides={tap === 'sides' ? counted : []}
        litCorners={tap === 'corners' ? counted : []}
        onSide={tap === 'sides' ? toggle : undefined}
        onCorner={tap === 'corners' ? toggle : undefined}
      />
      <div className="tp-row">
        <output className="tp-count" aria-live="polite">
          დათვლილია: <strong>{counted.length}</strong> {tap === 'sides' ? 'გვერდი' : 'კუთხე'}
        </output>
        <button type="button" className="btn btn-ghost btn-small" disabled={disabled || counted.length === 0} onClick={() => onChange([])}>
          ↻ გასუფთავება
        </button>
      </div>
      {total === 0 && (
        <p className="tp-note" role="status" aria-live="polite">
          წრეს სწორი გვერდი და კუთხე არ აქვს — დასათვლელი არაფერია. შეამოწმე ცარიელი დათვლით.
        </p>
      )}
    </div>
  );
}

// ─────────────────────────── sorting ───────────────────────────

export interface FlatGroup {
  id: string;
  label: string;
  icon: string;
}

/** The groups a sorting question uses, from the property it sorts by. */
export function groupsFor(groupBy: 'kind' | 'sides' | 'corners'): FlatGroup[] {
  if (groupBy === 'kind')
    return [
      { id: 'circle', label: 'წრე', icon: '○' },
      { id: 'triangle', label: 'სამკუთხედი', icon: '△' },
      { id: 'square', label: 'კვადრატი', icon: '□' },
      { id: 'rectangle', label: 'მართკუთხედი', icon: '▭' },
    ];
  if (groupBy === 'sides')
    return [
      { id: '0', label: 'სწორი გვერდი არ აქვს', icon: '0' },
      { id: '3', label: 'სამი გვერდი', icon: '3' },
      { id: '4', label: 'ოთხი გვერდი', icon: '4' },
    ];
  return [
    { id: '0', label: 'კუთხე არ აქვს', icon: '0' },
    { id: '3', label: 'სამი კუთხე', icon: '3' },
    { id: '4', label: 'ოთხი კუთხე', icon: '4' },
  ];
}

/** The group an outline belongs to, counted from the outline itself. */
export const groupIdOf = (spec: FlatSpec, groupBy: 'kind' | 'sides' | 'corners'): string =>
  groupBy === 'kind' ? shapeGroup(spec) : groupBy === 'sides' ? String(sidesOf(spec)) : String(verticesOf(spec));

export function ShapeSortBoard({
  shapes,
  groupBy,
  groups,
  onChange,
  disabled = false,
  label,
}: {
  shapes: FlatSpec[];
  groupBy: 'kind' | 'sides' | 'corners';
  groups: string[];
  onChange: (groups: string[]) => void;
  disabled?: boolean;
  label: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const options = groupsFor(groupBy);
  const open = shapes.map((_, i) => (groups[i] ? -1 : i)).filter((i) => i >= 0);
  const place = (id: string) => {
    if (disabled || selected === null) return;
    const next = shapes.map((_, i) => (i === selected ? id : (groups[i] ?? '')));
    onChange(next);
    const after = next.findIndex((g) => !g);
    setSelected(after >= 0 ? after : null);
  };
  const card = (i: number) => (
    <button
      key={i}
      type="button"
      className={`sort-card f2-card ${selected === i ? 'is-selected' : ''}`}
      aria-pressed={selected === i}
      aria-label={`ფიგურა ${i + 1}: ${FLAT_NAME[shapes[i].kind]}${selected === i ? ', არჩეულია' : ''}`}
      disabled={disabled}
      onClick={() => {
        if (!disabled) setSelected(selected === i ? null : i);
      }}
    >
      <span className="sort-no">{i + 1}</span>
      <Shape2D spec={shapes[i]} size={70} />
    </button>
  );
  return (
    <div className="sort f2-sort" role="group" aria-label={label}>
      <p className="sort-hint" role="status" aria-live="polite">
        {selected !== null ? `ფიგურა ${selected + 1} არჩეულია. შეეხე ჯგუფს.` : open.length > 0 ? 'შეეხე ფიგურას, მერე ჯგუფს.' : 'ყველა ფიგურა დალაგებულია.'}
      </p>
      {open.length > 0 && <div className="sort-tray">{open.map(card)}</div>}
      <div className={`sort-bins has-${options.length === 4 ? 4 : 3}`}>
        {options.map((g) => {
          const inside = groups.map((x, i) => (x === g.id ? i : -1)).filter((i) => i >= 0);
          return (
            <section key={g.id} className="sort-bin" aria-label={g.label}>
              <button type="button" className="sort-bin-btn" disabled={disabled || selected === null} onClick={() => place(g.id)}>
                <span aria-hidden="true">{g.icon}</span> {g.label}
              </button>
              <div className="sort-cards">{inside.length === 0 ? <span className="sort-empty">ცარიელია</span> : inside.map(card)}</div>
            </section>
          );
        })}
      </div>
      <div className="xt-row">
        <button type="button" className="btn btn-ghost btn-small" disabled={disabled || groups.every((g) => !g)} onClick={() => (onChange(shapes.map(() => '')), setSelected(0))}>
          ↻ თავიდან
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────── shapes in the room ───────────────────────────

/** A small illustrated room: a few objects the student can tap to keep. */
export function RoomBoard({
  target,
  items,
  picked,
  onChange,
  disabled = false,
  label,
}: {
  target: Flat;
  items: Array<{ id: string; label: string; spec: FlatSpec }>;
  picked: string[];
  onChange: (picked: string[]) => void;
  disabled?: boolean;
  label: string;
}) {
  const toggle = (id: string) => {
    if (disabled) return;
    onChange(picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id]);
  };
  return (
    <div className="room" role="group" aria-label={label}>
      <p className="room-task">
        იპოვე ოთახში ყველა საგანი, რომლის ფორმაც <strong>{FLAT_NAME[target]}</strong>-ია.
      </p>
      <div className="room-grid">
        {items.map((item) => {
          const on = picked.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              className={`room-item ${on ? 'is-picked' : ''}`}
              aria-pressed={on}
              aria-label={`${item.label}${on ? ', არჩეულია' : ''}`}
              disabled={disabled}
              onClick={() => toggle(item.id)}
            >
              <Shape2D spec={item.spec} size={72} />
              <span className="room-name">
                {on && <span aria-hidden="true">✓ </span>}
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      <output className="room-count" aria-live="polite">
        არჩეულია: <strong>{picked.length}</strong>
      </output>
    </div>
  );
}

// ─────────────────────────── words ───────────────────────────

/** "4 გვერდი, 4 კუთხე" — the property, said in words, for prompts and feedback. */
export const flatWords = (spec: FlatSpec): string => `${sidesOf(spec)} გვერდი, ${verticesOf(spec)} კუთხე`;

/** Whether all of a shape's sides are the same length, said in words. */
export const equalSidesWord = (spec: FlatSpec): string => {
  const lengths = sideLengths(spec);
  if (lengths.length === 0) return 'სწორი გვერდი არ აქვს';
  return Math.max(...lengths) - Math.min(...lengths) < 0.5 ? 'ყველა გვერდი ტოლია' : 'გვერდები სხვადასხვა სიგრძისაა';
};

/** "3 გვერდი, 3 კუთხე" — the count in words, for a tool's status line. */
export const tapWordsText = (spec: FlatSpec): string => `${sidesOf(spec)} გვერდი, ${verticesOf(spec)} კუთხე`;
