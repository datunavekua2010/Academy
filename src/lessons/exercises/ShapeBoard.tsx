import { useEffect, useId, useMemo, useState, type KeyboardEvent, type ReactNode, type Ref, type SVGProps } from 'react';
import type { ShapeItem, ShapeKind, ShapeSpec, SkinId } from '../types';
import { SHAPE_NAME, SIZE, chordOf, comparePieces, divisionOf, pathOf, takenPieces, type Piece, type Poly, type Pt } from './ShapeGeometry';

/**
 * Pictures of shapes and objects, drawn from exact geometry (see ShapeGeometry). Pieces keep their true
 * outlines when they move apart, are highlighted, or are laid on one another. Colour is only decoration:
 * every state that matters is also shown by an outline, a tick, a number or text.
 */

export const PAD = 16;
const SPREAD = 13;

// ─────────────────────────── looks ───────────────────────────

const PALETTE = ['#cfe0ff', '#fde9a8', '#c9efd3', '#fbd0c8'];

export interface Skin {
  base: string;
  edge: string;
  decor?: (shape: ShapeKind) => ReactNode;
}

const dots = (points: Pt[], r: number, fill: string): ReactNode => points.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={r} fill={fill} />);

export const SKINS: Record<SkinId, Skin> = {
  plain: { base: PALETTE[0], edge: '#1e3a8a' },
  chocolate: {
    base: '#8b5a3c',
    edge: '#3f2514',
    decor: () => <rect x={10} y={10} width={130} height={80} rx={7} fill="none" stroke="rgba(255,255,255,.3)" strokeWidth={2.2} />,
  },
  cookie: {
    base: '#e8b86d',
    edge: '#8a5a1f',
    decor: () =>
      dots(
        [
          [35, 32],
          [63, 38],
          [48, 62],
          [72, 66],
          [28, 66],
          [58, 20],
          [80, 44],
        ],
        3.6,
        '#6b3f17',
      ),
  },
  paper: {
    base: '#ffffff',
    edge: '#475569',
    decor: () => (
      <g stroke="#cbd5e1" strokeWidth={1.2}>
        {[20, 35, 50, 65, 80].map((y) => (
          <line key={y} x1={12} x2={138} y1={y} y2={y} />
        ))}
      </g>
    ),
  },
  sandwich: {
    base: '#f3d9a8',
    edge: '#9a6a2a',
    decor: () => (
      <g>
        <rect x={9} y={9} width={82} height={82} rx={9} fill="none" stroke="#e4b66a" strokeWidth={2.4} />
        {dots(
          [
            [30, 30],
            [66, 36],
            [48, 54],
            [28, 72],
            [70, 70],
          ],
          1.8,
          '#b9822f',
        )}
      </g>
    ),
  },
  pizza: {
    base: '#fcd34d',
    edge: '#9a4a0a',
    decor: () => (
      <g>
        <circle cx={50} cy={50} r={44.5} fill="none" stroke="#e8a21a" strokeWidth={2.6} />
        {dots(
          [
            [38, 33],
            [64, 36],
            [50, 56],
            [30, 58],
            [70, 62],
            [50, 18],
            [50, 80],
          ],
          5.6,
          '#c2410c',
        )}
      </g>
    ),
  },
};

/** The drawing position of a pointer event, in a board's own units (the shape's top left corner is 0, 0). */
export function boardPoint(svg: SVGSVGElement, clientX: number, clientY: number): Pt {
  const rect = svg.getBoundingClientRect();
  const box = svg.getAttribute('viewBox')?.split(/\s+/).map(Number) ?? [0, 0, 1, 1];
  const scale = rect.width > 0 ? box[2] / rect.width : 1;
  return [box[0] + (clientX - rect.left) * scale, box[1] + (clientY - rect.top) * scale];
}

export const skinOf = (spec: ShapeSpec): SkinId => spec.skin ?? 'plain';

export function fillFor(spec: ShapeSpec, i: number, merged: boolean): string {
  const skin = skinOf(spec);
  if (skin !== 'plain') return SKINS[skin].base;
  if (merged || spec.tone === 'same') return PALETTE[0];
  if (spec.tone === 'alt') return PALETTE[i % 2];
  return PALETTE[i % 4];
}

// ─────────────────────────── the board ───────────────────────────

export type PieceMark = 'hi' | 'dim' | 'sel';

export interface ShapeBoardProps {
  spec: ShapeSpec;
  /** Looks like one unbroken whole (pieces have no visible edges between them). */
  merged?: boolean;
  /** 0 to 1: how far the pieces have moved apart, each along the line from the middle of the shape to its own middle. */
  spread?: number;
  /** Where pieces are, in drawing units, instead of `spread` (index = piece number − 1). */
  offsets?: Array<Pt | undefined>;
  /** Only these pieces are drawn (numbers from 1). */
  show?: number[];
  /** Pieces drawn as an empty dashed outline (numbers from 1). */
  ghost?: number[];
  marks?: Record<number, PieceMark>;
  /** Number each piece (from 1), or give each its own text. */
  badges?: boolean | string[];
  /** Draw the dividing lines on top (0 hidden, 1 drawn in). */
  lines?: 0 | 1;
  onPiece?: (piece: number) => void;
  /** Extra attributes for one piece, e.g. pointer handlers for dragging. */
  pieceProps?: (piece: number) => SVGProps<SVGGElement>;
  pressed?: number[];
  label: string;
  compact?: boolean;
  className?: string;
  svgRef?: Ref<SVGSVGElement>;
  children?: ReactNode;
}

const clean = (id: string) => id.replace(/[^a-zA-Z0-9]/g, '');

export function ShapeBoard({ spec, merged = false, spread = 0, offsets, show, ghost = [], marks = {}, badges = false, lines = 0, onPiece, pieceProps, pressed = [], label, compact = false, className = '', svgRef, children }: ShapeBoardProps) {
  const uid = clean(useId());
  const division = divisionOf(spec);
  const skin = SKINS[skinOf(spec)];
  const [w, h] = SIZE[spec.shape];
  const center: Pt = [w / 2, h / 2];
  const visible = show ?? division.pieces.map((_, i) => i + 1);
  const anyMark = Object.values(marks).includes('hi') || Object.values(marks).includes('sel');
  const chords = useMemo(() => spec.cuts.map((cut) => chordOf(division.outline, w, h, cut)).filter((c): c is [Pt, Pt] => c !== null), [spec, division, w, h]);

  return (
    <svg
      ref={svgRef}
      className={`sh ${compact ? 'is-compact' : ''} ${merged ? 'is-merged' : ''} ${className}`}
      viewBox={`${-PAD} ${-PAD} ${w + 2 * PAD} ${h + 2 * PAD}`}
      style={{ maxWidth: compact ? undefined : `${Math.round(((w + 2 * PAD) / 132) * 280)}px` }}
      role="group"
      aria-label={label}
    >
      {division.pieces.map((piece, index) => {
        const n = index + 1;
        const path = pathOf(piece.poly);
        if (ghost.includes(n)) return <path key={n} className="sh-ghost" d={path} />;
        if (!visible.includes(n)) return null;
        const mark = marks[n];
        const isPressed = pressed.includes(n);
        const dir: Pt = [piece.cx - center[0], piece.cy - center[1]];
        const len = Math.hypot(dir[0], dir[1]) || 1;
        const move: Pt = offsets?.[index] ?? [(dir[0] / len) * SPREAD * spread, (dir[1] / len) * SPREAD * spread];
        const interactive = Boolean(onPiece);
        const key = (e: KeyboardEvent<SVGGElement>) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onPiece?.(n);
          }
        };
        const badge = Array.isArray(badges) ? badges[index] : badges ? String(n) : '';
        const extra = pieceProps?.(n) ?? {};
        return (
          <g
            key={n}
            className={`sh-piece ${interactive ? 'is-tappable' : ''} ${mark ? `is-${mark}` : ''} ${isPressed ? 'is-pressed' : ''} ${anyMark && !mark ? 'is-quiet' : ''}`}
            style={{ transform: `translate(${r1(move[0])}px, ${r1(move[1])}px)` }}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={interactive ? `ნაწილი ${n}` : undefined}
            aria-pressed={interactive ? isPressed : undefined}
            onClick={interactive ? () => onPiece?.(n) : undefined}
            onKeyDown={interactive ? key : undefined}
            {...extra}
          >
            <clipPath id={`${uid}c${n}`}>
              <path d={path} />
            </clipPath>
            <path className="sh-poly" d={path} style={{ ['--fill' as string]: fillFor(spec, index, merged), ['--edge' as string]: merged ? fillFor(spec, index, merged) : skin.edge }} />
            {skin.decor && (
              <g clipPath={`url(#${uid}c${n})`} className="sh-decor" pointerEvents="none">
                {skin.decor(spec.shape)}
              </g>
            )}
            {(mark === 'hi' || mark === 'sel' || isPressed) && <path className="sh-ring" d={path} />}
            {(badge || mark === 'hi' || mark === 'sel' || isPressed) && (
              <g className="sh-badge" transform={`translate(${r1(piece.cx)} ${r1(piece.cy)})`} pointerEvents="none" aria-hidden="true">
                <circle r={7.6} />
                <text y={3.4} textAnchor="middle">
                  {mark === 'hi' || mark === 'sel' || isPressed ? '✓' : badge}
                </text>
              </g>
            )}
          </g>
        );
      })}
      {merged && <path className="sh-outline" d={pathOf(division.outline)} style={{ ['--edge' as string]: skin.edge }} />}
      {lines > 0 &&
        chords.map(([a, b], i) => {
          const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
          return <line key={i} className="sh-cutline" x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} style={{ ['--len' as string]: length }} />;
        })}
      {children}
    </svg>
  );
}

const r1 = (n: number) => Math.round(n * 10) / 10;

// ─────────────────────────── a picture from lesson data ───────────────────────────

export function describeShape(spec: ShapeSpec, take?: number[]): string {
  const d = divisionOf(spec);
  const name = SHAPE_NAME[spec.shape];
  const n = takenPieces(d.pieces.length, take).length;
  if (d.pieces.length === 1) return `${name}: ერთი მთელი`;
  return take ? `${name}, ${d.pieces.length} ნაწილიდან ნაჩვენებია ${n}` : `${name}, ${d.pieces.length} ნაწილი`;
}

function marksOf(list?: number[]): Record<number, PieceMark> | undefined {
  if (!list || list.length === 0) return undefined;
  return Object.fromEntries(list.map((n) => [n, 'hi' as const]));
}

export function ShapePicture({ item, compact = false }: { item: ShapeItem; compact?: boolean }) {
  const view = item.view ?? 'cut';
  if (view === 'mixed' && item.mix) {
    const { take: otherTake, ...otherSpec } = item.mix;
    return (
      <div className="sh-mix" role="group" aria-label="სხვადასხვა ფიგურის ნაწილები">
        <ShapeBoard spec={item} show={item.take} badges={item.numbers} label={describeShape(item, item.take)} compact={compact} />
        <ShapeBoard spec={otherSpec} show={otherTake} badges={item.numbers} label={describeShape(otherSpec, otherTake)} compact={compact} />
      </div>
    );
  }
  return (
    <ShapeBoard
      spec={item}
      merged={view === 'whole'}
      spread={view === 'apart' ? 1 : 0}
      show={item.take}
      ghost={item.ghost}
      marks={marksOf(item.mark)}
      badges={item.numbers}
      label={view === 'whole' ? `${SHAPE_NAME[item.shape]}: ერთი მთელი` : view === 'apart' ? `${describeShape(item, item.take)}, ერთმანეთისგან დაცილებული` : describeShape(item, item.take)}
      compact={compact}
    />
  );
}

// ─────────────────────────── laying one part on another ───────────────────────────

const HATCH = 'sh-hatch';

interface StageProps {
  a: Piece;
  b: Piece;
  /** The first piece has been laid on the second. */
  overlaid: boolean;
  nameA: string;
  nameB: string;
}

const local = (piece: Piece): Poly => piece.poly.map(([x, y]) => [x - piece.cx, y - piece.cy] as Pt);
const extent = (piece: Piece): number => {
  const xs = piece.poly.map((p) => p[0]);
  const ys = piece.poly.map((p) => p[1]);
  return Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
};

/** Two pieces at the same scale, side by side; the first one can slide (and turn) onto the second. */
export function CompareStage({ a, b, overlaid, nameA, nameB }: StageProps) {
  const uid = clean(useId());
  const alignment = useMemo(() => comparePieces(a, b).alignment, [a, b]);
  const size = Math.max(extent(a), extent(b)) * 1.18;
  const gap = 16;
  const width = 2 * size + gap + 2 * PAD;
  const height = size + 2 * PAD;
  const cy = PAD + size / 2;
  const ax = PAD + size / 2;
  const bx = PAD + size + gap + size / 2;
  const turn = overlaid ? alignment.rotation : 0;
  const flip = overlaid && alignment.mirror ? -1 : 1;
  const toX = overlaid ? bx : ax;
  return (
    <svg className="sh sh-stage" viewBox={`0 0 ${r1(width)} ${r1(height)}`} style={{ maxWidth: `${Math.round((width / 132) * 240)}px` }} role="img" aria-label={overlaid ? `${nameA} დადებულია ${nameB}-ზე` : `${nameA} და ${nameB} გვერდიგვერდ`}>
      <defs>
        <pattern id={`${uid}${HATCH}`} width={6} height={6} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width={6} height={6} fill="rgba(37,99,235,.14)" />
          <line x1={0} y1={0} x2={0} y2={6} stroke="#2563eb" strokeWidth={2.4} />
        </pattern>
      </defs>
      <g transform={`translate(${r1(bx)} ${r1(cy)})`}>
        <path className="sh-stage-b" d={pathOf(local(b))} />
        {!overlaid && (
          <text className="sh-stage-name" y={4} textAnchor="middle">
            {nameB}
          </text>
        )}
      </g>
      <g className="sh-stage-a-wrap" style={{ transform: `translate(${r1(toX)}px, ${r1(cy)}px) rotate(${turn}deg) scale(${flip}, 1)` }}>
        <path className="sh-stage-a" d={pathOf(local(a))} style={{ fill: `url(#${uid}${HATCH})` }} />
      </g>
      {!overlaid && (
        <text className="sh-stage-name" x={r1(ax)} y={r1(cy + 4)} textAnchor="middle">
          {nameA}
        </text>
      )}
    </svg>
  );
}

export function compareText(result: ReturnType<typeof comparePieces>['result'], nameA: string, nameB: string): string {
  if (result === 'same') return `✓ ${nameA} და ${nameB} ზუსტად ემთხვევა: ისინი ტოლია.`;
  if (result === 'first-bigger') return `✗ ${nameA} უფრო დიდია, ვიდრე ${nameB}: ისინი ტოლი არ არის.`;
  if (result === 'second-bigger') return `✗ ${nameB} უფრო დიდია, ვიდრე ${nameA}: ისინი ტოლი არ არის.`;
  return `${nameA} და ${nameB} ერთი ზომისაა, მაგრამ სხვადასხვა ფორმისაა.`;
}

/**
 * A divided shape whose parts can be compared: tap two parts, then lay the first on the second.
 * `overlay` lets the caller draw extra things (such as dots) in the shape's own coordinates.
 */
export function ComparableBoard({
  spec,
  label,
  merged = false,
  spread = 0,
  compare = true,
  explain = true,
  overlay,
  lines = 0,
  badges = true,
  resetKey,
}: {
  spec: ShapeSpec;
  label: string;
  merged?: boolean;
  spread?: number;
  compare?: boolean;
  /** Say in words whether the two parts match (hide it where the student has to decide). */
  explain?: boolean;
  overlay?: ReactNode;
  lines?: 0 | 1;
  badges?: boolean;
  /** Changing this clears the picked parts. */
  resetKey?: string | number;
}) {
  const division = divisionOf(spec);
  const [picked, setPicked] = useState<number[]>([]);
  const [laid, setLaid] = useState(false);
  const specKey = `${spec.shape}|${JSON.stringify(spec.cuts)}`;
  useEffect(() => {
    setPicked([]);
    setLaid(false);
  }, [resetKey, specKey]);
  const tap = (n: number) => {
    setLaid(false);
    setPicked((now) => (now.includes(n) ? now.filter((x) => x !== n) : now.length >= 2 ? [now[1], n] : [...now, n]));
  };
  const pair = picked.length === 2 ? ([division.pieces[picked[0] - 1], division.pieces[picked[1] - 1]] as const) : null;
  const marks = Object.fromEntries(picked.map((n) => [n, 'sel' as const]));
  const result = pair ? comparePieces(pair[0], pair[1]).result : null;
  return (
    <div className="cb2">
      <ShapeBoard spec={spec} merged={merged} spread={spread} badges={badges && division.pieces.length > 1} lines={lines} marks={marks} pressed={picked} onPiece={compare && division.pieces.length > 1 ? tap : undefined} label={label}>
        {overlay}
      </ShapeBoard>
      {compare && division.pieces.length > 1 && (
        <div className="cb2-compare">
          {!pair ? (
            <p className="xt-note cb2-hint">შეეხე ორ ნაწილს, რომ შეადარო ისინი. ახლა არჩეულია: {picked.length}.</p>
          ) : (
            <>
              <CompareStage a={pair[0]} b={pair[1]} overlaid={laid} nameA={`ნაწილი ${picked[0]}`} nameB={`ნაწილი ${picked[1]}`} />
              <div className="xt-row">
                <button type="button" className="btn btn-primary btn-small" onClick={() => setLaid((v) => !v)} aria-pressed={laid}>
                  {laid ? '↩ გვერდიგვერდ' : `⇢ ნაწილი ${picked[0]} დავდოთ ნაწილ ${picked[1]}-ზე`}
                </button>
                <button type="button" className="btn btn-ghost btn-small" onClick={() => (setPicked([]), setLaid(false))}>
                  ↻ თავიდან
                </button>
              </div>
              <p className="xt-note" role="status" aria-live="polite">
                {laid ? (explain ? compareText(result as NonNullable<typeof result>, `ნაწილი ${picked[0]}`, `ნაწილი ${picked[1]}`) : 'ერთი ნაწილი მეორეზეა დადებული. შეხედე: თუ ისინი ზუსტად ემთხვევა, ისინი ტოლია.') : 'დააჭირე ღილაკს და ერთი ნაწილი მეორეზე გადავა.'}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
