import type { Cut, DivisionRule, ShapeItem, ShapeKind, ShapeSpec } from '../types';

/**
 * Exact geometry for the equal-parts lessons. Pure functions only: no React, no DOM.
 *
 * Every shape is a convex polygon (a circle is a 96-sided polygon whose corners include every
 * dot used by the cutting activity). A dividing line splits each piece it crosses in two, so the
 * pieces and their areas are computed, never typed in by hand. "Equal" always means equal area.
 */

export type Pt = [number, number];
export type Poly = Pt[];

/** Width and height of each shape in drawing units. */
export const SIZE: Record<ShapeKind, [number, number]> = { circle: [100, 100], square: [100, 100], rect: [150, 100] };
export const SHAPE_NAME: Record<ShapeKind, string> = { circle: 'წრე', square: 'კვადრატი', rect: 'მართკუთხედი' };
const CIRCLE_SIDES = 96;
const EPS = 1e-9;

/** How close two areas must be (as a share of the larger) to count as equal. Real divisions are exact or far apart. */
export const EQUAL_TOLERANCE = 1e-4;

export function outlineOf(shape: ShapeKind): Poly {
  const [w, h] = SIZE[shape];
  if (shape === 'circle') {
    return Array.from({ length: CIRCLE_SIDES }, (_, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / CIRCLE_SIDES;
      return [50 + 50 * Math.cos(a), 50 + 50 * Math.sin(a)] as Pt;
    });
  }
  return [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ];
}

// ─────────────────────────── polygons ───────────────────────────

export function signedArea(p: Poly): number {
  let s = 0;
  for (let i = 0; i < p.length; i += 1) {
    const [x1, y1] = p[i];
    const [x2, y2] = p[(i + 1) % p.length];
    s += x1 * y2 - x2 * y1;
  }
  return s / 2;
}
export const areaOf = (p: Poly): number => Math.abs(signedArea(p));

export function centroidOf(p: Poly): Pt {
  const a = signedArea(p);
  if (Math.abs(a) < EPS) return p.length ? [p[0][0], p[0][1]] : [0, 0];
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < p.length; i += 1) {
    const [x1, y1] = p[i];
    const [x2, y2] = p[(i + 1) % p.length];
    const f = x1 * y2 - x2 * y1;
    cx += (x1 + x2) * f;
    cy += (y1 + y2) * f;
  }
  return [cx / (6 * a), cy / (6 * a)];
}

/** Corners in the orientation used everywhere below (positive signed area). */
const oriented = (p: Poly): Poly => (signedArea(p) < 0 ? [...p].reverse() : p);

const cross = (a: Pt, b: Pt, p: Pt): number => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);

/** The part of a convex polygon on one side of the line through a and b (sign +1 or −1). */
function clipHalf(poly: Poly, a: Pt, b: Pt, sign: 1 | -1): Poly {
  const out: Poly = [];
  const n = poly.length;
  for (let i = 0; i < n; i += 1) {
    const cur = poly[i];
    const prev = poly[(i + n - 1) % n];
    const fc = sign * cross(a, b, cur);
    const fp = sign * cross(a, b, prev);
    const inC = fc >= -EPS;
    const inP = fp >= -EPS;
    const meet = (): Pt => {
      const t = fp / (fp - fc);
      return [prev[0] + t * (cur[0] - prev[0]), prev[1] + t * (cur[1] - prev[1])];
    };
    if (inC) {
      if (!inP && Math.abs(fp - fc) > 1e-12) out.push(meet());
      out.push(cur);
    } else if (inP && Math.abs(fp - fc) > 1e-12) {
      out.push(meet());
    }
  }
  return out.filter((q, i) => {
    const r = out[(i + 1) % out.length];
    return Math.hypot(q[0] - r[0], q[1] - r[1]) > 1e-7;
  });
}

export interface Piece {
  poly: Poly;
  area: number;
  cx: number;
  cy: number;
}
const makePiece = (poly: Poly): Piece => {
  const [cx, cy] = centroidOf(poly);
  return { poly, area: areaOf(poly), cx, cy };
};

export interface Division {
  shape: ShapeKind;
  w: number;
  h: number;
  outline: Poly;
  /** Numbered from 1 in reading order (piece i is `pieces[i - 1]`). */
  pieces: Piece[];
  total: number;
}

const cache = new Map<string, Division>();

/** Divide a shape along the given lines. Pieces are in reading order: top to bottom, then left to right. */
export function divide(shape: ShapeKind, cuts: Cut[]): Division {
  const key = `${shape}|${cuts.map((c) => c.join(',')).join(';')}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const [w, h] = SIZE[shape];
  const outline = outlineOf(shape);
  const total = areaOf(outline);
  let pieces: Poly[] = [outline];
  for (const [x1, y1, x2, y2] of cuts) {
    const a: Pt = [x1 * w, y1 * h];
    const b: Pt = [x2 * w, y2 * h];
    if (Math.hypot(a[0] - b[0], a[1] - b[1]) < EPS) continue;
    const next: Poly[] = [];
    for (const piece of pieces) {
      const left = clipHalf(piece, a, b, 1);
      const right = clipHalf(piece, a, b, -1);
      const keepL = left.length >= 3 && areaOf(left) > total * 1e-4;
      const keepR = right.length >= 3 && areaOf(right) > total * 1e-4;
      if (keepL && keepR) next.push(left, right);
      else next.push(piece);
    }
    pieces = next;
  }
  const made = pieces.map((p) => makePiece(oriented(p)));
  made.sort((p, q) => {
    const rp = Math.round(p.cy / (h * 0.2));
    const rq = Math.round(q.cy / (h * 0.2));
    return rp !== rq ? rp - rq : p.cx - q.cx;
  });
  const result: Division = { shape, w, h, outline: oriented(outline), pieces: made, total };
  cache.set(key, result);
  return result;
}

export const divisionOf = (spec: Pick<ShapeSpec, 'shape' | 'cuts'>): Division => divide(spec.shape, spec.cuts);

// ─────────────────────────── equal or not ───────────────────────────

/** The smallest piece as a share of the largest (1 when every piece has the same area). */
export function evenness(d: Division): number {
  const areas = d.pieces.map((p) => p.area);
  return Math.min(...areas) / Math.max(...areas);
}
export const hasEqualParts = (d: Division): boolean => d.pieces.length >= 2 && 1 - evenness(d) < EQUAL_TOLERANCE;

/** Whether a divided shape is the answer "yes" to a rule (`equal`: equal parts; `halves`: two equal parts; `quarters`: four). */
export function ruleHolds(rule: DivisionRule, d: Division): boolean {
  if (!hasEqualParts(d)) return false;
  if (rule === 'halves') return d.pieces.length === 2;
  if (rule === 'quarters') return d.pieces.length === 4;
  return true;
}

/** The right group of a picture: `e`/`u` (equal rule), `y`/`n`, or `w`/`p`/`x` (whole, parts, do not belong together). */
export function groupOf(rule: DivisionRule | 'wholeparts', item: ShapeItem): string {
  if (rule === 'wholeparts') return item.view === 'mixed' ? 'x' : item.view === 'whole' ? 'w' : 'p';
  const yes = ruleHolds(rule, divisionOf(item));
  return rule === 'equal' ? (yes ? 'e' : 'u') : yes ? 'y' : 'n';
}

// ─────────────────────────── where a line crosses a shape ───────────────────────────

/** The two points where a dividing line enters and leaves a convex shape, or null if it misses it. */
export function chordOf(outline: Poly, w: number, h: number, cut: Cut): [Pt, Pt] | null {
  const a: Pt = [cut[0] * w, cut[1] * h];
  const d: Pt = [cut[2] * w - a[0], cut[3] * h - a[1]];
  let lo = -1e6;
  let hi = 1e6;
  const o = oriented(outline);
  for (let i = 0; i < o.length; i += 1) {
    const q1 = o[i];
    const q2 = o[(i + 1) % o.length];
    const f0 = cross(q1, q2, a);
    const f1 = (q2[0] - q1[0]) * d[1] - (q2[1] - q1[1]) * d[0];
    if (Math.abs(f1) < 1e-12) {
      if (f0 < -EPS) return null;
    } else {
      const t = -f0 / f1;
      if (f1 > 0) lo = Math.max(lo, t);
      else hi = Math.min(hi, t);
    }
  }
  if (hi - lo < 1e-9) return null;
  return [
    [a[0] + lo * d[0], a[1] + lo * d[1]],
    [a[0] + hi * d[0], a[1] + hi * d[1]],
  ];
}

// ─────────────────────────── the dots on the edge ───────────────────────────

/** The dots a student may tap to draw a line: 12 round a circle (every 30°, from the top), 16 round a square or rectangle. */
export function snapPoints(shape: ShapeKind): Pt[] {
  const [w, h] = SIZE[shape];
  if (shape === 'circle') {
    return Array.from({ length: 12 }, (_, k) => {
      const a = (k * Math.PI) / 6;
      return [50 + 50 * Math.sin(a), 50 - 50 * Math.cos(a)] as Pt;
    });
  }
  const f = [0, 0.25, 0.5, 0.75];
  return [...f.map((t) => [t * w, 0]), ...f.map((t) => [w, t * h]), ...f.map((t) => [(1 - t) * w, h]), ...f.map((t) => [0, (1 - t) * h])] as Pt[];
}

export const cutBetween = (shape: ShapeKind, i: number, j: number): Cut => {
  const [w, h] = SIZE[shape];
  const pts = snapPoints(shape);
  return [pts[i][0] / w, pts[i][1] / h, pts[j][0] / w, pts[j][1] / h];
};

/** Lines are stored as `"i-j;k-l"`: the numbers of the two dots, counted from 0. */
export function parseLines(value: string): Array<[number, number]> {
  return value
    .split(';')
    .map((part) => part.split('-').map(Number))
    .filter((pair): pair is [number, number] => pair.length === 2 && pair.every((n) => Number.isInteger(n) && n >= 0))
    .map(([a, b]) => (a < b ? [a, b] : [b, a]) as [number, number]);
}
export const formatLines = (lines: Array<[number, number]>): string => lines.map(([a, b]) => `${a}-${b}`).join(';');

export function divisionFromLines(shape: ShapeKind, lines: Array<[number, number]>): Division {
  const count = snapPoints(shape).length;
  return divide(
    shape,
    lines.filter(([a, b]) => a !== b && a < count && b < count).map(([a, b]) => cutBetween(shape, a, b)),
  );
}

// ─────────────────────────── laying one piece on another ───────────────────────────

const rotate = (p: Pt, deg: number): Pt => {
  const r = (deg * Math.PI) / 180;
  return [p[0] * Math.cos(r) - p[1] * Math.sin(r), p[0] * Math.sin(r) + p[1] * Math.cos(r)];
};

/** A piece turned (and optionally flipped) about its centre of mass and moved so that its centre is at `to`. */
export function movedPoly(piece: Piece, deg: number, mirror: boolean, to: Pt): Poly {
  return oriented(
    piece.poly.map(([x, y]) => {
      const local: Pt = [(mirror ? -1 : 1) * (x - piece.cx), y - piece.cy];
      const r = rotate(local, deg);
      return [r[0] + to[0], r[1] + to[1]] as Pt;
    }),
  );
}

/** The area two convex polygons have in common. */
export function overlapArea(a: Poly, b: Poly): number {
  const bo = oriented(b);
  let clipped = oriented(a);
  for (let i = 0; i < bo.length && clipped.length >= 3; i += 1) clipped = clipHalf(clipped, bo[i], bo[(i + 1) % bo.length], 1);
  return clipped.length >= 3 ? areaOf(clipped) : 0;
}

export interface Alignment {
  /** Turn of the first piece, in degrees, that lays it best on the second. */
  rotation: number;
  mirror: boolean;
  /** Share of the two pieces' combined area that they share when laid like that (1: they match exactly). */
  match: number;
}

/** The turn (steps of 15°, flipped or not) that lays piece a most exactly on piece b, both centred on their centres of mass. */
export function bestAlignment(a: Piece, b: Piece): Alignment {
  let best: Alignment = { rotation: 0, mirror: false, match: -1 };
  const target: Pt = [b.cx, b.cy];
  for (const mirror of [false, true]) {
    for (let deg = 0; deg < 360; deg += 15) {
      const inter = overlapArea(movedPoly(a, deg, mirror, target), b.poly);
      const match = inter / (a.area + b.area - inter);
      if (match > best.match + 1e-9) best = { rotation: deg, mirror, match };
    }
  }
  return best;
}

export type Comparison = 'same' | 'first-bigger' | 'second-bigger' | 'shape';

/** What laying piece a on piece b shows. `same`: they match exactly. */
export function comparePieces(a: Piece, b: Piece): { result: Comparison; alignment: Alignment } {
  const alignment = bestAlignment(a, b);
  const gap = (a.area - b.area) / Math.max(a.area, b.area);
  if (Math.abs(gap) < EQUAL_TOLERANCE) return { result: alignment.match > 0.995 ? 'same' : 'shape', alignment };
  return { result: gap > 0 ? 'first-bigger' : 'second-bigger', alignment };
}

// ─────────────────────────── fitting pieces into places ───────────────────────────

/** Whether a point is inside a convex polygon. */
export function pointIn(p: Pt, poly: Poly): boolean {
  const o = oriented(poly);
  return o.every((q, i) => cross(q, o[(i + 1) % o.length], p) >= -1e-9);
}

/** Whether a piece, moved straight (no turning), covers a place exactly. */
export function fitsPlace(piece: Piece, place: Piece): boolean {
  if (Math.abs(piece.area - place.area) / Math.max(piece.area, place.area) > 1e-3) return false;
  const moved: Poly = piece.poly.map(([x, y]) => [x - piece.cx + place.cx, y - piece.cy + place.cy] as Pt);
  const inter = overlapArea(moved, place.poly);
  return inter / (piece.area + place.area - inter) > 0.998;
}

// ─────────────────────────── drawing ───────────────────────────

const r2 = (n: number): string => String(Math.round(n * 100) / 100);
export const pathOf = (poly: Poly): string => `M${poly.map(([x, y]) => `${r2(x)} ${r2(y)}`).join('L')}Z`;

/** Whether the pieces taken from a picture are the numbered pieces it asks for (1-based; all when `take` is missing). */
export const takenPieces = (count: number, take?: number[]): number[] => (take ? take.filter((n) => n >= 1 && n <= count) : Array.from({ length: count }, (_, i) => i + 1));
