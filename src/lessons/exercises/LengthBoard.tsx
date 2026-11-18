import { useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import {
  DEFAULT_KIND,
  KINDS,
  RULER_PAD,
  SCALE,
  kindOf,
  lengthOf,
  px,
  type MeasureKind,
  type ObjSpec,
} from './MeasureGeometry';
import type { LengthItem, LengthObject } from '../types';

/**
 * Length pictures for Unit 6. Every picture is drawn from a real length in centimetres (`cm * SCALE` drawing
 * units), so a drawing can never disagree with the maths: nothing here counts pixels to decide how long something
 * is. Orientation is honoured (an object may stand up), but it never changes the length.
 */

const r1 = (n: number): string => String(Math.round(n * 100) / 100);

const OBJECT_FILL: Record<MeasureKind, { body: string; edge: string; dark: string }> = {
  pencil: { body: '#fcd34d', edge: '#92400e', dark: '#b45309' },
  crayon: { body: '#f9a8d4', edge: '#9d174d', dark: '#be185d' },
  ribbon: { body: '#93c5fd', edge: '#1e40af', dark: '#1d4ed8' },
  stick: { body: '#d6b98c', edge: '#6b4f22', dark: '#8a6a33' },
  book: { body: '#86efac', edge: '#166534', dark: '#15803d' },
  eraser: { body: '#fda4af', edge: '#9f1239', dark: '#be123c' },
  cube: { body: '#c7d2fe', edge: '#3730a3', dark: '#4338ca' },
  clip: { body: '#cbd5e1', edge: '#475569', dark: '#64748b' },
  ladder: { body: '#fdba74', edge: '#9a3412', dark: '#c2410c' },
  door: { body: '#d8b4fe', edge: '#6b21a8', dark: '#7e22ce' },
};

export const OBJECT_NAME = (spec: ObjSpec): string => KINDS[kindOf(spec)].name;

/** The object's own drawing, starting at x = 0 and centred on y = 0. */
function ObjectShape({ spec }: { spec: ObjSpec }) {
  const kind = kindOf(spec);
  const len = lengthOf(spec);
  const t = KINDS[kind].thickness;
  const c = OBJECT_FILL[kind];
  const half = t / 2;
  const common = { stroke: c.edge, strokeWidth: 1.6 };
  switch (kind) {
    case 'pencil':
      return (
        <g>
          <path d={`M0 ${-half} H${r1(len - 8)} L${r1(len)} 0 L${r1(len - 8)} ${r1(half)} H0 Z`} fill={c.body} {...common} />
          <path d={`M${r1(6)} ${-half} V${r1(half)} M${r1(10)} ${-half} V${r1(half)}`} stroke={c.dark} strokeWidth={1.2} />
        </g>
      );
    case 'crayon':
      return (
        <g>
          <rect x={0} y={-half} width={r1(len)} height={t} rx={2} fill={c.body} {...common} />
          <path d={`M0 ${-half} h6 v${t} h-6 z`} fill={c.dark} opacity={0.4} />
        </g>
      );
    case 'ribbon':
      return (
        <g>
          <path d={`M0 ${-half + 1} H${r1(len)} V${r1(half - 1)} H0 Z`} fill={c.body} {...common} />
          <path d={`M0 ${r1(-half + 3)} H${r1(len)}`} stroke="#fff" strokeWidth={1.4} opacity={0.8} />
        </g>
      );
    case 'stick':
      return (
        <path
          d={`M2 ${-half} H${r1(len - 4)} a${r1(half)} ${r1(half)} 0 0 1 0 ${t} H2 a${r1(half)} ${r1(half)} 0 0 1 0 ${-t} Z`}
          fill={c.body}
          {...common}
        />
      );
    case 'book':
      return (
        <g>
          <rect x={0} y={-half} width={r1(len)} height={t} rx={1.5} fill={c.body} {...common} />
          <path d={`M${r1(len - 4)} ${-half} V${r1(half)}`} stroke={c.dark} strokeWidth={1.6} />
        </g>
      );
    case 'eraser':
      return <rect x={0} y={-half} width={r1(len)} height={t} rx={2.5} fill={c.body} {...common} />;
    case 'cube':
      return (
        <g>
          <rect x={0} y={-half} width={r1(len)} height={t} rx={1} fill={c.body} {...common} />
          <path d={`M0 0 H${r1(len)}`} stroke={c.dark} strokeWidth={1} opacity={0.5} />
        </g>
      );
    case 'clip':
      return (
        <g>
          <rect x={0} y={-half} width={r1(len)} height={t} rx={r1(half)} fill="none" stroke={c.dark} strokeWidth={2.4} />
          <rect x={6} y={-half + 3} width={r1(len - 12)} height={t - 6} rx={r1((t - 6) / 2)} fill="none" stroke={c.dark} strokeWidth={1.6} />
        </g>
      );
    case 'ladder':
      return (
        <g>
          <rect x={0} y={-half} width={r1(len)} height={2} fill={c.dark} />
          <rect x={0} y={r1(half - 2)} width={r1(len)} height={2} fill={c.dark} />
          {Array.from({ length: Math.max(1, Math.round(len / 20)) }, (_, i) => (
            <rect key={i} x={r1(8 + i * 20)} y={-half} width={2.4} height={t} fill={c.body} stroke={c.edge} strokeWidth={0.8} />
          ))}
        </g>
      );
    default:
      return (
        <g>
          <rect x={0} y={-half} width={r1(len)} height={t} rx={2} fill={c.body} {...common} />
          <circle cx={r1(len - 6)} cy={0} r={1.6} fill={c.edge} />
        </g>
      );
  }
}

/**
 * A single object, drawn to scale. The label never states its length unless `showCm` is asked for.
 *
 * `maxCm` is the longest object the picture will sit beside: the viewBox is widened to it so that everything
 * drawn with the same `maxCm` shares one scale. Two pictures shown side by side must never be scaled differently,
 * or the student would be comparing the pictures instead of the lengths.
 */
export function LengthObjectView({ spec, label, maxCm, showCm = false }: { spec: ObjSpec; label?: string; maxCm?: number; showCm?: boolean }) {
  const len = lengthOf(spec);
  const t = KINDS[kindOf(spec)].thickness;
  const tall = spec.turn === 'up';
  const own = tall ? t : len;
  const height = tall ? len : t;
  const span = Math.max(own, px(maxCm ?? spec.cm));
  const name = OBJECT_NAME(spec);
  return (
    <svg
      className="ln-obj"
      viewBox={`${r1(-4)} ${r1(-height / 2 - 4)} ${r1(span + 8)} ${r1(height + 8)}`}
      role="img"
      aria-label={label ?? (showCm ? `${name}, ${spec.cm} სანტიმეტრი` : name)}
    >
      <g transform={tall ? `translate(${r1(own / 2)} 0) rotate(-90) translate(${r1(-own / 2)} 0)` : undefined}>
        <ObjectShape spec={spec} />
      </g>
    </svg>
  );
}

export const describeLength = (spec: ObjSpec): string => {
  const name = OBJECT_NAME(spec);
  return spec.turn === 'up' ? `${name} (ვერტიკალურად)` : name;
};

// ─────────────────────────── two objects on one starting line ───────────────────────────

export interface AlignBoardProps {
  a: LengthObject;
  b: LengthObject;
  /** Where each object starts, in cm from the line (0 = on the line). */
  starts: [number, number];
  onStarts: (starts: [number, number]) => void;
  disabled?: boolean;
  label: string;
}

/**
 * Two objects and a common starting line. Drag an object (or press it) to bring it to the line; only then can the
 * two be compared honestly. Both objects are drawn at exactly their own length.
 */
export function AlignBoard({ a, b, starts, onStarts, disabled = false, label }: AlignBoardProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const svg = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState<number | null>(null);
  const maxCm = Math.max(a.cm, b.cm, 1);
  const width = px(maxCm) + px(2);
  const rowH = 46;
  const height = rowH * 2 + 16;
  const items = [a, b];
  const atLine = (index: number) => Math.abs(starts[index]) < 1e-9;

  const move = (index: number, clientX: number) => {
    if (drag !== index || !svg.current) return;
    const rect = svg.current.getBoundingClientRect();
    const scale = rect.width / (width + 8);
    const x = (clientX - rect.left) / scale - 4;
    const next: [number, number] = [...starts] as [number, number];
    next[index] = Math.max(0, Math.round(x / SCALE));
    onStarts(next);
  };

  return (
    <div className="al">
      <svg
        ref={svg}
        className="ln-board al-board"
        viewBox={`${r1(-4)} 0 ${r1(width + 8)} ${r1(height)}`}
        role="group"
        aria-label={label}
        style={{ touchAction: 'none' }}
      >
        <defs>
          <pattern id={`${uid}line`} width={6} height={6} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width={6} height={6} fill="rgba(22,101,52,.06)" />
            <line x1={0} y1={0} x2={0} y2={6} stroke="#16a34a" strokeWidth={1.2} />
          </pattern>
        </defs>
        <rect x={0} y={0} width={4} height={height} fill={`url(#${uid}line)`} />
        <line x1={0} y1={0} x2={0} y2={height} stroke="#166534" strokeWidth={2.4} />
        <text className="al-line-text" x={5} y={height - 2}>
          დასაწყისი
        </text>
        {items.map((spec, index) => {
          const on = atLine(index);
          const top = 12 + index * rowH;
          return (
            <g
              key={index}
              className={`al-item ${on ? 'is-aligned' : ''} ${drag === index ? 'is-dragging' : ''}`}
              transform={`translate(${r1(px(starts[index]))} ${r1(top + rowH / 2 - 8)})`}
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-label={`${describeLength(spec)}${on ? ', დასაწყისშია' : ', ჯერ არ არის დასაწყისში'}`}
              aria-pressed={on}
              onPointerDown={(e: PointerEvent<SVGGElement>) => {
                // a press on the object alone never aligns it: dragging is how an object is moved
                if (disabled) return;
                setDrag(index);
                e.currentTarget.setPointerCapture?.(e.pointerId);
              }}
              onPointerMove={(e: PointerEvent<SVGGElement>) => move(index, e.clientX)}
              onPointerUp={(e: PointerEvent<SVGGElement>) => {
                setDrag(null);
                e.currentTarget.releasePointerCapture?.(e.pointerId);
              }}
              onKeyDown={(e: KeyboardEvent<SVGGElement>) => {
                if (disabled) return;
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  const next: [number, number] = [...starts] as [number, number];
                  next[index] = 0;
                  onStarts(next);
                }
                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                  e.preventDefault();
                  const next: [number, number] = [...starts] as [number, number];
                  next[index] = Math.max(0, next[index] + (e.key === 'ArrowRight' ? 1 : -1));
                  onStarts(next);
                }
              }}
            >
              <ObjectShape spec={spec} />
              {on && <circle className="al-tick" cx={0} cy={r1(KINDS[kindOf(spec)].thickness / 2 + 7)} r={4} />}
            </g>
          );
        })}
      </svg>
      <output className="al-count" aria-live="polite">
        {starts.filter((x) => Math.abs(x) < 1e-9).length} / 2 დასაწყისთან
      </output>
      <div className="al-controls">
        {items.map((spec, index) => (
          <button
            key={index}
            type="button"
            className={`btn btn-ghost btn-small ${atLine(index) ? 'is-on' : ''}`}
            disabled={disabled || atLine(index)}
            onClick={() => {
              const next: [number, number] = [...starts] as [number, number];
              next[index] = 0;
              onStarts(next);
            }}
          >
            <span aria-hidden="true">⇤</span> {describeLength(spec)} — დასაწყისთან
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────── units laid along an object ───────────────────────────

/**
 * An object with identical units laid along it. The student adds the next unit; the board places unit n at
 * `(n - 1) * unitCm` from the object's start, so units never overlap and never leave a gap, and the picture can
 * never drift from the count.
 */
export function UnitBoard({
  object,
  unitCm,
  unitName,
  placed,
  onChange,
  disabled,
  label,
  showCount = true,
}: {
  object: LengthObject;
  unitCm: number;
  unitName: string;
  placed: number;
  onChange: (placed: number) => void;
  disabled: boolean;
  label: string;
  showCount?: boolean;
}) {
  const maxUnits = Math.max(1, Math.floor(object.cm / unitCm) + 2);
  const width = lengthOf(object) + px(2);
  const unitPx = px(unitCm);
  const height = 92;
  const objectTop = 60;
  const complete = Math.abs(placed * unitCm - object.cm) < 1e-9;
  return (
    <div className="un">
      <svg className="ln-board un-board" viewBox={`${r1(-4)} 0 ${r1(width + 8)} ${r1(height)}`} role="group" aria-label={label}>
        {Array.from({ length: Math.min(placed, maxUnits) }, (_, i) => (
          <g key={i} className="un-unit">
            <rect x={r1(i * unitPx)} y={16} width={r1(unitPx)} height={22} rx={3} className="un-unit-box" />
            <text x={r1(i * unitPx + unitPx / 2)} y={30} textAnchor="middle" className="un-unit-n">
              {i + 1}
            </text>
          </g>
        ))}
        <g transform={`translate(0 ${objectTop})`}>
          <ObjectShape spec={object} />
        </g>
        <line className="un-base" x1={0} y1={objectTop + KINDS[kindOf(object)].thickness / 2 + 2} x2={r1(lengthOf(object))} y2={objectTop + KINDS[kindOf(object)].thickness / 2 + 2} />
        <line className="un-end" x1={r1(lengthOf(object))} y1={10} x2={r1(lengthOf(object))} y2={r1(objectTop + KINDS[kindOf(object)].thickness / 2)} />
      </svg>
      <div className="un-controls">
        <button type="button" className="btn btn-primary btn-small" disabled={disabled || placed >= maxUnits} onClick={() => onChange(placed + 1)}>
          <span aria-hidden="true">＋</span> დაუმატე {unitName}
        </button>
        <button type="button" className="btn btn-ghost btn-small" disabled={disabled || placed === 0} onClick={() => onChange(placed - 1)}>
          <span aria-hidden="true">↶</span> უკან
        </button>
        <button type="button" className="btn btn-ghost btn-small" disabled={disabled || placed === 0} onClick={() => onChange(0)}>
          <span aria-hidden="true">↻</span> თავიდან
        </button>
      </div>
      {showCount && (
        <output className="objs-count un-count" aria-live="polite">
          ერთეულები: <strong>{placed}</strong>
          {complete ? ' ✓' : ''}
        </output>
      )}
    </div>
  );
}

// ─────────────────────────── a ruler ───────────────────────────

/**
 * A centimetre ruler under an object. The student slides the ruler (drag it, or use the buttons) so that its zero
 * mark meets the object's start. The tick under the object's end is the reading; it equals the object's length
 * only when the zero is at the start, which is the whole point of the lesson.
 */
export function RulerBoard({
  object,
  zeroAt,
  onZero,
  disabled,
  label,
  readOnly = false,
}: {
  object: LengthObject;
  /** Where the ruler's zero mark is, in cm from the left edge of the board. */
  zeroAt: number;
  onZero?: (cm: number) => void;
  disabled?: boolean;
  label: string;
  readOnly?: boolean;
}) {
  const cmMax = Math.ceil(Math.max(object.cm, zeroAt + object.cm)) + 2;
  const width = px(cmMax) + RULER_PAD * 2;
  const height = 92;
  const objectTop = 32;
  const rulerTop = 62;
  const svg = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState(false);
  const toCm = (clientX: number): number => {
    if (!svg.current) return zeroAt;
    const rect = svg.current.getBoundingClientRect();
    const scale = rect.width / width;
    const x = (clientX - rect.left) / scale;
    return Math.max(0, Math.round(((x - RULER_PAD) / SCALE) * 2) / 2);
  };
  const end = px(object.cm);
  const zeroX = RULER_PAD + px(zeroAt);
  const reading = Math.round((end - px(zeroAt)) / SCALE * 2) / 2;
  const ticks = Array.from({ length: cmMax + 1 }, (_, i) => i);

  return (
    <div className="rl">
      <svg ref={svg} className="ln-board rl-board" viewBox={`0 0 ${r1(width)} ${height}`} role="group" aria-label={`${label}. სახაზავის ნული ${zeroAt === 0 ? 'დასაწყისთან' : `${zeroAt} სმ-ზე`}.`} style={{ touchAction: 'none' }}>
        <g transform={`translate(0 ${objectTop})`}>
          <ObjectShape spec={object} />
        </g>
        <line className="rl-start" x1={0} y1={objectTop - 12} x2={0} y2={rulerTop} />
        <line className="rl-end" x1={end} y1={objectTop - 12} x2={end} y2={rulerTop} />
        <g
          className={`rl-body ${drag ? 'is-dragging' : ''}`}
          transform={`translate(${r1(px(zeroAt))} 0)`}
          role={readOnly ? undefined : 'button'}
          tabIndex={readOnly || disabled ? undefined : 0}
          aria-label="სახაზავი"
          onPointerDown={(e: PointerEvent<SVGGElement>) => {
            if (readOnly || disabled) return;
            setDrag(true);
            e.currentTarget.setPointerCapture?.(e.pointerId);
          }}
          onPointerMove={(e: PointerEvent<SVGGElement>) => {
            if (!drag || readOnly || disabled) return;
            onZero?.(toCm(e.clientX));
          }}
          onPointerUp={(e: PointerEvent<SVGGElement>) => {
            setDrag(false);
            e.currentTarget.releasePointerCapture?.(e.pointerId);
          }}
          onKeyDown={(e: KeyboardEvent<SVGGElement>) => {
            if (readOnly || disabled) return;
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
              e.preventDefault();
              onZero?.(Math.max(0, zeroAt + (e.key === 'ArrowRight' ? 0.5 : -0.5)));
            }
          }}
        >
          <rect className="rl-rule" x={-RULER_PAD} y={rulerTop - 14} width={r1(px(cmMax) + RULER_PAD * 2)} height={26} rx={3} />
          {ticks.map((cm) => {
            const x = px(cm);
            const big = cm % 5 === 0;
            return (
              <g key={cm}>
                <line className={`rl-tick ${big ? 'is-big' : ''}`} x1={x} y1={rulerTop - 14} x2={x} y2={rulerTop - 14 + (big ? 12 : 7)} />
                {big && (
                  <text className="rl-num" x={x} y={rulerTop + 4} textAnchor="middle">
                    {cm}
                  </text>
                )}
              </g>
            );
          })}
          <text className="rl-zero" x={0} y={rulerTop + 16} textAnchor="middle">
            0
          </text>
        </g>
        <line className="rl-zero-mark" x1={zeroX} y1={rulerTop - 20} x2={zeroX} y2={rulerTop + 16} />
        <text className={`rl-reading ${Math.abs(reading - object.cm) < 1e-9 ? 'is-right' : ''}`} x={r1(width - 2)} y={12} textAnchor="end">
          {`კითხვა: ${reading} სმ`}
        </text>
      </svg>
      {!readOnly && (
        <div className="rl-controls">
          <button type="button" className="btn btn-ghost btn-small" disabled={disabled || zeroAt <= 0} onClick={() => onZero?.(Math.max(0, zeroAt - 1))}>
            ← სახაზავი
          </button>
          <button type="button" className="btn btn-ghost btn-small" disabled={disabled} onClick={() => onZero?.(0)}>
            ნული დასაწყისთან
          </button>
          <button type="button" className="btn btn-ghost btn-small" disabled={disabled} onClick={() => onZero?.(zeroAt + 1)}>
            სახაზავი →
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────── a metre ───────────────────────────

/** The metre idea: a strip of 100 one-centimetre ticks. The ticks are generated from the number 100. */
export function MetreStrip({ cm = 100, label }: { cm?: number; label?: string }) {
  const width = 320;
  const step = width / cm;
  return (
    <svg className="ms" viewBox={`0 -2 ${width + 4} 40`} role="img" aria-label={label ?? `მეტრი: ${cm} სანტიმეტრი`}>
      <rect x={0} y={6} width={width} height={14} rx={2} className="ms-body" />
      {Array.from({ length: cm + 1 }, (_, i) => (
        <line key={i} className={`ms-tick ${i % 10 === 0 ? 'is-ten' : ''}`} x1={r1(i * step)} y1={6} x2={r1(i * step)} y2={i % 10 === 0 ? 24 : 16} />
      ))}
      <text className="ms-text" x={0} y={36}>
        0
      </text>
      <text className="ms-text" x={width} y={36} textAnchor="end">
        {cm} სმ = 1 მ
      </text>
    </svg>
  );
}

// ─────────────────────────── choosing a unit ───────────────────────────

export function UnitPickBoard({
  items,
  picks,
  onChange,
  disabled,
  label,
}: {
  items: LengthItem[];
  picks: string[];
  onChange: (picks: string[]) => void;
  disabled: boolean;
  label: string;
}) {
  const set = (index: number, choice: 'cm' | 'm') => onChange(picks.map((p, i) => (i === index ? choice : p)));
  return (
    <div className="up" role="group" aria-label={label}>
      {items.map((item, index) => {
        const pick = picks[index] ?? '';
        return (
          <div key={item.label + index} className={`up-row ${pick ? 'is-chosen' : ''}`}>
            <span className="up-label">{item.label}</span>
            <div className="up-btns" role="radiogroup" aria-label={`${item.label}: რომელი ერთეული?`}>
              {(['cm', 'm'] as const).map((choice) => (
                <button
                  key={choice}
                  type="button"
                  role="radio"
                  aria-checked={pick === choice}
                  className={`up-btn ${pick === choice ? 'is-on' : ''}`}
                  disabled={disabled}
                  onClick={() => set(index, choice)}
                >
                  {pick === choice && <span aria-hidden="true">✓ </span>}
                  {choice === 'cm' ? 'სანტიმეტრი' : 'მეტრი'}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────── shared wordings ───────────────────────────

/** "8 სმ" — a measurement is never a bare number. */
export const cmText = (cm: number): string => `${cm} სმ`;

/** What a comparison shows, in words, so nothing rests on colour. */
export function compareLengthText(a: LengthObject, b: LengthObject, nameA = 'პირველი', nameB = 'მეორე'): string {
  if (a.cm > b.cm) return `${nameA} უფრო გრძელია: ${cmText(a.cm)} და ${cmText(b.cm)}.`;
  if (b.cm > a.cm) return `${nameB} უფრო გრძელია: ${cmText(a.cm)} და ${cmText(b.cm)}.`;
  return `ორივე იგივე სიგრძისაა: ${cmText(a.cm)}.`;
}

/** "2 სმ" — a unit length, for the unit-measuring tools. */
export const unitLabel = (cm: number): string => `${cm} სმ`;

/** A stable default for an object that forgot its kind. */
export const withKind = (spec: LengthObject): LengthObject => ({ ...spec, kind: spec.kind ?? DEFAULT_KIND });

/** Several objects stacked, each drawn at its own length. */
export function ObjectRow({ objects, align, showCm }: { objects: LengthObject[]; align?: boolean; showCm?: boolean }) {
  const maxCm = Math.max(1, ...objects.map((o) => o.cm));
  const width = px(maxCm) + px(2);
  const rowH = 30;
  const height = rowH * objects.length + 6;
  const rows = useMemo(() => objects.map((_, i) => i), [objects]);
  return (
    <svg className="ln-board ln-row" viewBox={`0 0 ${r1(width)} ${r1(height)}`} role="group" aria-label={objects.map((o) => OBJECT_NAME(o)).join(', ')}>
      {align && <line className="al-baseline" x1={0} y1={0} x2={0} y2={height} />}
      {rows.map((i) => {
        const spec = objects[i];
        const top = i * rowH + rowH / 2;
        return (
          <g key={i} transform={`translate(0 ${r1(top)})`}>
            <ObjectShape spec={spec} />
            {showCm && (
              <text className="ln-cm" x={r1(lengthOf(spec) + 6)} y={4}>
                {cmText(spec.cm)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
