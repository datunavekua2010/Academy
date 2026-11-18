import type { Glyph, ObjectLayout } from '../types';

/**
 * Drawn objects for the counting lessons: four distinct shapes (never colour
 * alone), a field that places them on a rows grid or an irregular scatter, and
 * a ten-frame. Positions are computed from `(count, layout, seed)` only, so the
 * same data always draws the same picture.
 */

export const GLYPH_NAME: Record<Glyph, string> = { star: 'ვარსკვლავი', apple: 'ვაშლი', fish: 'თევზი', ball: 'ბურთი' };

export function GlyphIcon({ glyph }: { glyph: Glyph }) {
  return (
    <svg className="obj-svg" viewBox="0 0 24 24" aria-hidden="true">
      {glyph === 'star' && <polygon points="12,2 14.9,8.6 22,9.3 16.6,14 18.2,21 12,17.3 5.8,21 7.4,14 2,9.3 9.1,8.6" fill="#fbbf24" stroke="#92400e" strokeWidth="1.6" strokeLinejoin="round" />}
      {glyph === 'apple' && (
        <>
          <circle cx="12" cy="14" r="8" fill="#f87171" stroke="#991b1b" strokeWidth="1.6" />
          <path d="M12 6c0-2 1-3 3-4" fill="none" stroke="#166534" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {glyph === 'fish' && (
        <>
          <ellipse cx="11" cy="12" rx="8" ry="5.5" fill="#7dd3fc" stroke="#075985" strokeWidth="1.6" />
          <polygon points="18,12 23.5,7 23.5,17" fill="#7dd3fc" stroke="#075985" strokeWidth="1.6" strokeLinejoin="round" />
          <circle cx="7.5" cy="10.5" r="1.2" fill="#075985" />
        </>
      )}
      {glyph === 'ball' && (
        <>
          <circle cx="12" cy="12" r="9" fill="#6ee7b7" stroke="#047857" strokeWidth="1.6" />
          <path d="M4 9c5 3 11 3 16 0M4 15c5-3 11-3 16 0" fill="none" stroke="#047857" strokeWidth="1.4" />
        </>
      )}
    </svg>
  );
}

// ─────────────────────────── layout ───────────────────────────

export interface Point {
  /** Centre, as a fraction of the field's width / height. */
  x: number;
  y: number;
}
export interface FieldLayout {
  cols: number;
  rows: number;
  points: Point[];
}

/** Small, fast, seedable generator (mulberry32). */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function fieldLayout(count: number, layout: ObjectLayout, seed = 1): FieldLayout {
  if (count <= 0) return { cols: 1, rows: 1, points: [] };
  if (layout === 'rows') {
    const cols = Math.min(count, 5);
    const rows = Math.ceil(count / cols);
    return { cols, rows, points: Array.from({ length: count }, (_, i) => ({ x: ((i % cols) + 0.5) / cols, y: (Math.floor(i / cols) + 0.5) / rows })) };
  }
  // scatter: a grid with spare cells; each object sits in its own cell, nudged by less than
  // the spare room, so objects never touch and the picture still looks irregular.
  const cells = Math.ceil(count * 1.4);
  const cols = Math.max(3, Math.ceil(Math.sqrt(cells * 1.5)));
  const rows = Math.ceil(cells / cols);
  const random = rng(seed * 9973 + count);
  const all = Array.from({ length: cols * rows }, (_, i) => i);
  for (let i = all.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  const chosen = all.slice(0, count).sort((a, b) => a - b);
  return {
    cols,
    rows,
    points: chosen.map((cell) => ({
      x: ((cell % cols) + 0.5 + (random() - 0.5) * 0.24) / cols,
      y: (Math.floor(cell / cols) + 0.5 + (random() - 0.5) * 0.24) / rows,
    })),
  };
}

// ─────────────────────────── field ───────────────────────────

interface FieldProps {
  count: number;
  glyph: Glyph;
  layout: ObjectLayout;
  seed?: number;
  /** Indices already counted, in the order they were tapped (shown as 1, 2, 3…). */
  counted?: number[];
  /** Indices picked as an answer (shown with a ✓). */
  picked?: Set<number>;
  /** Makes the objects tappable. */
  onTap?: (index: number) => void;
  /** Objects outlined as "extra" (unmatched). */
  extras?: Set<number>;
  label: string;
  /** Smaller objects, for pictures inside answer options. */
  compact?: boolean;
}

export function ObjectField({ count, glyph, layout, seed = 1, counted = [], picked, onTap, extras, label, compact = false }: FieldProps) {
  const { cols, rows, points } = fieldLayout(count, layout, seed);
  const order = new Map(counted.map((idx, n) => [idx, n + 1]));
  const cell = compact ? 34 : 56;
  return (
    <div
      className={`objf ${compact ? 'is-compact' : ''}`}
      style={{ aspectRatio: `${cols} / ${rows}`, maxWidth: cols * cell }}
      role={onTap ? 'group' : 'img'}
      aria-label={onTap ? label : `${label}: ${count} ${GLYPH_NAME[glyph]}`}
    >
      {points.map((p, i) => {
        const n = order.get(i);
        const isPicked = picked?.has(i) ?? false;
        const style = { left: `${p.x * 100}%`, top: `${p.y * 100}%`, width: `${100 / cols}%` };
        const cls = `obj ${n !== undefined ? 'is-counted' : ''} ${isPicked ? 'is-picked' : ''} ${extras?.has(i) ? 'is-extra' : ''}`;
        const inner = (
          <>
            <GlyphIcon glyph={glyph} />
            {n !== undefined && <span className="obj-badge">{n}</span>}
            {isPicked && <span className="obj-badge is-tick">✓</span>}
          </>
        );
        return onTap ? (
          <button key={i} type="button" className={cls} style={style} aria-pressed={n !== undefined || isPicked} aria-label={`${GLYPH_NAME[glyph]} ${i + 1}`} onClick={() => onTap(i)}>
            {inner}
          </button>
        ) : (
          <span key={i} className={cls} style={style} aria-hidden="true">
            {inner}
          </span>
        );
      })}
    </div>
  );
}

// ─────────────────────────── ten-frame ───────────────────────────

/**
 * Counters on a ten-frame. `count` solid counters first; with `second`, that many
 * ring counters follow (the other part). Solid versus ring, not colour, tells the
 * two parts apart.
 */
export function TenFrame({ count, second = 0, label, size = 10 }: { count: number; second?: number; label?: string; size?: 5 | 10 }) {
  const total = count + second;
  const frames = total > size ? Math.ceil(total / size) : 1;
  const cell = (i: number) => (i < count ? 'is-a' : i < total ? 'is-b' : '');
  return (
    <div className="tenf" role="img" aria-label={label ?? (second ? `${count} და ${second}` : `${count}`)}>
      {Array.from({ length: frames }, (_, f) => (
        <div key={f} className={`tenf-frame ${size === 5 ? 'is-five' : ''}`} aria-hidden="true">
          {Array.from({ length: size }, (_, k) => (
            <span key={k} className={`tenf-cell ${cell(f * size + k)}`} />
          ))}
        </div>
      ))}
    </div>
  );
}
