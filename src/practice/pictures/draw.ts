/**
 * Builders for `diagram` pictures — the figures of Grades V–VII.
 *
 * Every builder takes the numbers a question is made of and returns the drawing,
 * so the picture can never disagree with the question or its key. Coordinates
 * given to the builders are *mathematical* (y up); the builders turn them into
 * the pixel space of the SVG.
 */
import type { DrawItem, Picture } from './types';

export type Pt = [number, number];

export const NAVY = '#33415c';
export const RED = '#e8473f';
export const BLUE = '#2f7de1';
export const GREEN = '#2e9d5b';
export const SKY = '#dbe9ff';
export const SUN = '#fff3c4';
export const MINT = '#d9f2e3';
export const ROSE = '#ffe0dd';
export const GRID = '#d5deef';
export const PALETTE = ['#2f7de1', '#e8473f', '#f2b705', '#2e9d5b', '#8e5bd6', '#ff8a3d'];

const r1 = (n: number): number => Math.round(n * 10) / 10;
const minus = (n: number | string): string => String(n).replace('-', '−');
const rad = (deg: number): number => (deg * Math.PI) / 180;

export const diagram = (width: number, height: number, alt: string, items: DrawItem[], label?: string): Picture => ({ kind: 'diagram', width, height, alt, items, label });

const text = (x: number, y: number, t: string, o: Partial<Extract<DrawItem, { t: 'text' }>> = {}): DrawItem => ({ t: 'text', at: [r1(x), r1(y)], text: t, ...o });
const line = (a: Pt, b: Pt, o: Partial<Extract<DrawItem, { t: 'line' }>> = {}): DrawItem => ({ t: 'line', from: [r1(a[0]), r1(a[1])], to: [r1(b[0]), r1(b[1])], ...o });

/** A point on a circle, in pixel space, at `deg` degrees (counter-clockwise from the right). */
const onCircle = (c: Pt, r: number, deg: number): Pt => [c[0] + r * Math.cos(rad(deg)), c[1] - r * Math.sin(rad(deg))];

/** An arc from `a0` to `a1` degrees (a1 > a0 turns counter-clockwise on screen, a1 < a0 clockwise). */
export const arcPath = (c: Pt, r: number, a0: number, a1: number): string => {
  const p0 = onCircle(c, r, a0);
  const p1 = onCircle(c, r, a1);
  return `M ${r1(p0[0])} ${r1(p0[1])} A ${r} ${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${a1 > a0 ? 0 : 1} ${r1(p1[0])} ${r1(p1[1])}`;
};
const sectorPath = (c: Pt, r: number, a0: number, a1: number): string => {
  const p0 = onCircle(c, r, a0);
  return `M ${c[0]} ${c[1]} L ${r1(p0[0])} ${r1(p0[1])} ${arcPath(c, r, a0, a1).replace(/^M [^A]*/, '')} Z`;
};

/* ---------------------------------------------------------------- *\
 * Coordinate plane
\* ---------------------------------------------------------------- */

export interface PlaneBox {
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
  cell: number;
}
export const PLANE_PAD = 26;
export const planeSize = (b: PlaneBox): { w: number; h: number } => ({ w: (b.xmax - b.xmin) * b.cell + PLANE_PAD * 2, h: (b.ymax - b.ymin) * b.cell + PLANE_PAD * 2 });
export const planeX = (b: PlaneBox, x: number): number => PLANE_PAD + (x - b.xmin) * b.cell;
export const planeY = (b: PlaneBox, y: number): number => PLANE_PAD + (b.ymax - y) * b.cell;

export interface PlanePoint {
  x: number;
  y: number;
  label?: string;
  color?: string;
}
export interface PlaneOptions extends PlaneBox {
  points?: PlanePoint[];
  /** Segments between pairs of points. */
  segments?: Array<[[number, number], [number, number]]>;
  /** A closed polygon through these points. */
  polygon?: Array<[number, number]>;
  /** Dashed mirror line, e.g. `{ axis: 'y' }` is the y-axis itself (drawn anyway). */
  dashed?: Array<[[number, number], [number, number]]>;
}

/** The grid, axes, numbers and anything drawn on the plane. */
export function planeItems(o: PlaneOptions): DrawItem[] {
  const { w, h } = planeSize(o);
  const items: DrawItem[] = [];
  for (let x = o.xmin; x <= o.xmax; x += 1) items.push(line([planeX(o, x), PLANE_PAD], [planeX(o, x), h - PLANE_PAD], { stroke: GRID, width: 1.2 }));
  for (let y = o.ymin; y <= o.ymax; y += 1) items.push(line([PLANE_PAD, planeY(o, y)], [w - PLANE_PAD, planeY(o, y)], { stroke: GRID, width: 1.2 }));
  const axisX = o.ymin <= 0 && o.ymax >= 0 ? planeY(o, 0) : h - PLANE_PAD;
  const axisY = o.xmin <= 0 && o.xmax >= 0 ? planeX(o, 0) : PLANE_PAD;
  items.push(line([PLANE_PAD - 8, axisX], [w - PLANE_PAD + 10, axisX], { width: 2.5, arrow: true }));
  items.push(line([axisY, h - PLANE_PAD + 8], [axisY, PLANE_PAD - 10], { width: 2.5, arrow: true }));
  items.push(text(w - PLANE_PAD + 14, axisX + 12, 'x', { size: 13, color: NAVY }));
  items.push(text(axisY + 12, PLANE_PAD - 14, 'y', { size: 13, color: NAVY }));
  const every = o.cell < 22 ? 2 : 1;
  for (let x = o.xmin; x <= o.xmax; x += 1) {
    if (x === 0 || (x - o.xmin) % every !== 0) continue;
    items.push(text(planeX(o, x), axisX + 12, minus(x), { size: 11, color: '#5b6b8c' }));
  }
  for (let y = o.ymin; y <= o.ymax; y += 1) {
    if (y === 0 || (y - o.ymin) % every !== 0) continue;
    items.push(text(axisY - 11, planeY(o, y), minus(y), { size: 11, color: '#5b6b8c', anchor: 'end' }));
  }
  if (o.xmin <= 0 && o.xmax >= 0 && o.ymin <= 0 && o.ymax >= 0) items.push(text(axisY - 9, axisX + 11, 'O', { size: 11, color: '#5b6b8c', anchor: 'end' }));
  const at = (p: [number, number]): Pt => [planeX(o, p[0]), planeY(o, p[1])];
  if (o.polygon) items.push({ t: 'poly', pts: o.polygon.map(at), fill: 'rgba(47,125,225,0.16)', stroke: BLUE, width: 2.5 });
  for (const [a, b] of o.segments ?? []) items.push(line(at(a), at(b), { stroke: BLUE, width: 2.5 }));
  for (const [a, b] of o.dashed ?? []) items.push(line(at(a), at(b), { stroke: RED, width: 2, dash: true }));
  for (const p of o.points ?? []) {
    items.push({ t: 'dot', at: at([p.x, p.y]), r: 5.5, color: p.color ?? RED });
    if (p.label) items.push(text(planeX(o, p.x) + 11, planeY(o, p.y) - 11, p.label, { size: 14, color: p.color ?? RED }));
  }
  return items;
}

/** A coordinate plane picture; `cell` is the pixel size of one unit. */
export function planePic(o: PlaneOptions, alt?: string): Picture {
  const { w, h } = planeSize(o);
  const named = (o.points ?? []).filter((p) => p.label).map((p) => `${p.label}(${p.x}; ${p.y})`);
  return diagram(w + 18, h + 6, alt ?? `საკოორდინატო სიბრტყე${named.length ? `: ${named.join(', ')}` : ''}`, planeItems(o));
}

/* ---------------------------------------------------------------- *\
 * Number line (negative numbers, fractions, decimals)
\* ---------------------------------------------------------------- */

export interface NumberLineMark {
  value: number;
  label?: string;
  color?: string;
}
export function numberLinePic(from: number, to: number, step: number, tickLabel: (v: number) => string, marks: NumberLineMark[] = [], labelEvery = 1): Picture {
  const W = 420;
  const x = (v: number) => 24 + ((v - from) / (to - from)) * (W - 48);
  const items: DrawItem[] = [line([12, 46], [W - 12, 46], { width: 3, arrow: true })];
  let i = 0;
  for (let v = from; v <= to + 1e-9; v += step, i += 1) {
    items.push(line([x(v), 38], [x(v), 54], { width: 2.2 }));
    if (i % labelEvery === 0) items.push(text(x(v), 68, tickLabel(v), { size: 13, color: NAVY }));
  }
  for (const m of marks) {
    items.push({ t: 'dot', at: [r1(x(m.value)), 46], r: 8, color: m.color ?? RED });
    if (m.label) items.push(text(x(m.value), 22, m.label, { size: 15, color: m.color ?? RED }));
  }
  return diagram(W, 84, `რიცხვითი ღერძი ${minus(tickLabel(from))}-დან ${minus(tickLabel(to))}-მდე${marks.length ? `; მონიშნულია ${marks.map((m) => minus(tickLabel(m.value))).join(', ')}` : ''}`, items);
}

/* ---------------------------------------------------------------- *\
 * Angles
\* ---------------------------------------------------------------- */

/** One angle of `deg` degrees (0 < deg < 180), with its size (or „?“) written inside the arc. */
export function anglePic(deg: number, label: string = `${deg}°`): Picture {
  const right = deg === 90;
  const vx = deg > 100 ? 118 : 30;
  const v: Pt = [vx, 122];
  const len = 120;
  const items: DrawItem[] = [line(v, [v[0] + len, v[1]], { width: 3.5 }), line(v, onCircle(v, len, deg), { width: 3.5, stroke: RED })];
  if (right) items.push({ t: 'poly', pts: [[v[0] + 16, v[1]], [v[0] + 16, v[1] - 16], [v[0], v[1] - 16]], open: true, width: 2, stroke: NAVY });
  else items.push({ t: 'path', d: arcPath(v, 32, 0, deg), stroke: RED, width: 2.5 });
  items.push({ t: 'dot', at: v, r: 4, color: NAVY });
  const lp = onCircle(v, right ? 36 : 54, Math.max(deg / 2, 14));
  items.push(text(lp[0], lp[1], label, { size: 15, color: RED }));
  return diagram(deg > 100 ? 250 : 170 + (deg < 60 ? 20 : 0), 140, `კუთხე: ${label}`, items);
}

/** Rays from one vertex (bottom-centre) at the given degrees (0…180); `arcs` label the angles between them. */
export function raysPic(rays: number[], arcs: Array<{ from: number; to: number; label: string; color?: string }>, rightAt?: number): Picture {
  const v: Pt = [130, 112];
  const items: DrawItem[] = [];
  for (const d of rays) items.push(line(v, onCircle(v, 104, d), { width: 3.2 }));
  items.push(line([v[0] - 110, v[1]], [v[0] + 110, v[1]], { width: 2, stroke: GRID }));
  arcs.forEach((a, i) => {
    const r = 26 + (i % 2) * 8;
    if (rightAt !== undefined && Math.abs(a.to - a.from) === 90 && a.from === rightAt) {
      const p0 = onCircle(v, 18, a.from);
      const p1 = onCircle(v, 18, a.to);
      const corner: Pt = [p0[0] + p1[0] - v[0], p0[1] + p1[1] - v[1]];
      items.push({ t: 'poly', pts: [p0, corner, p1], open: true, width: 2, stroke: a.color ?? RED });
    } else items.push({ t: 'path', d: arcPath(v, r, a.from, a.to), stroke: a.color ?? RED, width: 2.5 });
    const lp = onCircle(v, r + 26, (a.from + a.to) / 2);
    items.push(text(lp[0], lp[1], a.label, { size: 14, color: a.color ?? RED }));
  });
  items.push({ t: 'dot', at: v, r: 4, color: NAVY });
  return diagram(260, 126, `კუთხეები ერთი წვეროდან: ${arcs.map((a) => a.label).join(', ')}`, items);
}

/** Two crossing lines; the labels are the four angles: [right, top, left, bottom]. */
export function crossingPic(deg: number, labels: [string, string, string, string]): Picture {
  const c: Pt = [130, 80];
  const items: DrawItem[] = [line(onCircle(c, 112, 0), onCircle(c, 112, 180), { width: 3 }), line(onCircle(c, 74, deg), onCircle(c, 74, deg + 180), { width: 3 })];
  const sectors: Array<[number, number]> = [[0, deg], [deg, 180], [180, 180 + deg], [180 + deg, 360]];
  const order = [0, 1, 2, 3];
  order.forEach((i) => {
    const [a0, a1] = sectors[i]!;
    if (!labels[i]) return;
    items.push({ t: 'path', d: arcPath(c, 22, a0, a1), stroke: RED, width: 2 });
    const lp = onCircle(c, 44, (a0 + a1) / 2);
    items.push(text(lp[0], lp[1], labels[i === 0 ? 0 : i === 1 ? 1 : i === 2 ? 2 : 3], { size: 13, color: RED }));
  });
  return diagram(260, 160, `ორი გადამკვეთი წრფე: ${labels.join(', ')}`, items);
}

/** Two parallel lines cut by a transversal. `top` and `bottom` are the four angles at each crossing: [right-up, left-up, left-down, right-down]. */
export function transversalPic(deg: number, top: [string, string, string, string], bottom: [string, string, string, string]): Picture {
  const yT = 52;
  const yB = 112;
  const dx = (yB - yT) / Math.tan(rad(deg));
  const cxT = 150 + dx / 2;
  const cxB = 150 - dx / 2;
  const items: DrawItem[] = [
    line([20, yT], [280, yT], { width: 3 }),
    line([20, yB], [280, yB], { width: 3 }),
    line([cxT + (cxT - cxB) * 0.55, yT - (yB - yT) * 0.55], [cxB - (cxT - cxB) * 0.55, yB + (yB - yT) * 0.55], { width: 3, stroke: BLUE }),
    text(292, yT, 'a', { size: 13, color: NAVY, anchor: 'start' }),
    text(292, yB, 'b', { size: 13, color: NAVY, anchor: 'start' }),
  ];
  const draw = (cx: number, cy: number, labels: [string, string, string, string]) => {
    const c: Pt = [cx, cy];
    const sectors: Array<[number, number]> = [[0, deg], [deg, 180], [180, 180 + deg], [180 + deg, 360]];
    sectors.forEach(([a0, a1], i) => {
      if (!labels[i]) return;
      items.push({ t: 'path', d: arcPath(c, 15, a0, a1), stroke: RED, width: 2 });
      const lp = onCircle(c, 36, (a0 + a1) / 2);
      items.push(text(lp[0], lp[1], labels[i]!, { size: 13, color: RED }));
    });
  };
  draw(cxT, yT, top);
  draw(cxB, yB, bottom);
  return diagram(310, 170, 'ორი პარალელური წრფე და მკვეთი', items);
}

/* ---------------------------------------------------------------- *\
 * Polygons (triangles, quadrilaterals) with labels
\* ---------------------------------------------------------------- */

export interface PolyOptions {
  /** Vertex names, outside each corner. */
  names?: string[];
  /** Side labels: side i runs from vertex i to vertex i+1. */
  sides?: Array<string | undefined>;
  /** Angle labels, inside each corner. */
  angles?: Array<string | undefined>;
  /** Vertices drawn with a right-angle mark. */
  right?: number[];
  fill?: string;
  /** Extra items, given the final pixel vertices. */
  extra?: (pts: Pt[]) => DrawItem[];
  width?: number;
  height?: number;
  alt?: string;
}

/** Fits mathematical points (y up) into a `width × height` box. */
export function fitPts(pts: Pt[], width: number, height: number, pad = 34): Pt[] {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const s = Math.min((width - pad * 2) / Math.max(maxX - minX, 1e-6), (height - pad * 2) / Math.max(maxY - minY, 1e-6));
  const ox = (width - (maxX - minX) * s) / 2;
  const oy = (height - (maxY - minY) * s) / 2;
  return pts.map(([x, y]) => [r1(ox + (x - minX) * s), r1(height - oy - (y - minY) * s)] as Pt);
}

export function polyPic(math: Pt[], o: PolyOptions = {}): Picture {
  const W = o.width ?? 270;
  const H = o.height ?? 170;
  const pts = fitPts(math, W, H);
  const n = pts.length;
  const cx = pts.reduce((a, p) => a + p[0], 0) / n;
  const cy = pts.reduce((a, p) => a + p[1], 0) / n;
  const items: DrawItem[] = [{ t: 'poly', pts, fill: o.fill ?? SUN, stroke: NAVY, width: 3 }];
  const away = (p: Pt, d: number): Pt => {
    const dx = p[0] - cx;
    const dy = p[1] - cy;
    const len = Math.hypot(dx, dy) || 1;
    return [p[0] + (dx / len) * d, p[1] + (dy / len) * d];
  };
  (o.sides ?? []).forEach((label, i) => {
    if (!label) return;
    const a = pts[i]!;
    const b = pts[(i + 1) % n]!;
    const mid: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const q = away(mid, 15);
    items.push(text(q[0], q[1], label, { size: 14 }));
  });
  (o.names ?? []).forEach((name, i) => {
    const q = away(pts[i]!, 14);
    items.push(text(q[0], q[1], name, { size: 15, color: BLUE }));
  });
  (o.angles ?? []).forEach((label, i) => {
    if (!label) return;
    const p = pts[i]!;
    items.push(text(p[0] + (cx - p[0]) * 0.3, p[1] + (cy - p[1]) * 0.3, label, { size: 13, color: RED }));
  });
  for (const i of o.right ?? []) {
    const p = pts[i]!;
    const a = pts[(i + 1) % n]!;
    const b = pts[(i + n - 1) % n]!;
    const ua: Pt = [(a[0] - p[0]) / (Math.hypot(a[0] - p[0], a[1] - p[1]) || 1), (a[1] - p[1]) / (Math.hypot(a[0] - p[0], a[1] - p[1]) || 1)];
    const ub: Pt = [(b[0] - p[0]) / (Math.hypot(b[0] - p[0], b[1] - p[1]) || 1), (b[1] - p[1]) / (Math.hypot(b[0] - p[0], b[1] - p[1]) || 1)];
    const k = 13;
    items.push({ t: 'poly', open: true, width: 2, stroke: RED, pts: [[p[0] + ua[0] * k, p[1] + ua[1] * k], [p[0] + (ua[0] + ub[0]) * k, p[1] + (ua[1] + ub[1]) * k], [p[0] + ub[0] * k, p[1] + ub[1] * k]] });
  }
  if (o.extra) items.push(...o.extra(pts));
  return diagram(W, H, o.alt ?? `${n === 3 ? 'სამკუთხედი' : n === 4 ? 'ოთხკუთხედი' : `${n}-კუთხედი`}${(o.sides ?? []).filter(Boolean).length ? `; გვერდები: ${(o.sides ?? []).filter(Boolean).join(', ')}` : ''}${(o.angles ?? []).filter(Boolean).length ? `; კუთხეები: ${(o.angles ?? []).filter(Boolean).join(', ')}` : ''}`, items);
}

/** A triangle from its three sides (a opposite A …): returns math points A, B, C. */
export function triangleFromSides(a: number, b: number, c: number): Pt[] {
  const x = (b * b + c * c - a * a) / (2 * c);
  const y = Math.sqrt(Math.max(b * b - x * x, 0.01));
  return [[0, 0], [c, 0], [x, y]];
}
/** A triangle with a right angle at the first vertex: legs `a` (along x) and `b` (up). */
export const rightTriangleMath = (a: number, b: number): Pt[] => [[0, 0], [a, 0], [0, b]];
export const parallelogramMath = (base: number, side: number, skew: number): Pt[] => [[0, 0], [base, 0], [base + skew, side], [skew, side]];
export const trapezoidMath = (bottom: number, top: number, height: number): Pt[] => [[0, 0], [bottom, 0], [(bottom + top) / 2 + top / 2, height], [(bottom - top) / 2, height]];
export const rhombusMath = (d1: number, d2: number): Pt[] => [[0, d2 / 2], [d1 / 2, 0], [d1, d2 / 2], [d1 / 2, d2]];

/* ---------------------------------------------------------------- *\
 * Circles
\* ---------------------------------------------------------------- */

export interface CircleOptions {
  radius?: string;
  diameter?: string;
  chord?: string;
  /** A sector from 0° to `deg`. */
  sector?: { deg: number; label?: string };
  /** A central angle AOB, with the arc between A and B. */
  central?: { from: number; to: number; label?: string };
  /** An inscribed angle at a point C on the opposite arc. */
  inscribed?: { label?: string };
  width?: number;
  alt?: string;
}
export function circlePic(o: CircleOptions = {}): Picture {
  const c: Pt = [110, 90];
  const R = 70;
  const items: DrawItem[] = [{ t: 'circle', c, r: R, fill: SKY, stroke: NAVY, width: 3 }];
  if (o.sector) {
    items.push({ t: 'path', d: sectorPath(c, R, 0, o.sector.deg), fill: 'rgba(232,71,63,0.30)', stroke: RED, width: 2.5 });
    if (o.sector.label) {
      const lp = onCircle(c, R * 0.55, o.sector.deg / 2);
      items.push(text(lp[0], lp[1], o.sector.label, { size: 15, color: RED }));
    }
  }
  if (o.diameter !== undefined) {
    items.push(line(onCircle(c, R, 180), onCircle(c, R, 0), { width: 3, stroke: BLUE }));
    items.push(text(c[0], c[1] + 14, o.diameter, { size: 14, color: BLUE }));
  }
  if (o.radius !== undefined) {
    const end = onCircle(c, R, o.diameter !== undefined ? 60 : 35);
    items.push(line(c, end, { width: 3, stroke: RED }));
    const mid: Pt = [(c[0] + end[0]) / 2, (c[1] + end[1]) / 2];
    items.push(text(mid[0] + 4, mid[1] - 13, o.radius, { size: 14, color: RED }));
  }
  if (o.chord !== undefined) {
    const a = onCircle(c, R, 215);
    const b = onCircle(c, R, 330);
    items.push(line(a, b, { width: 3, stroke: GREEN }));
    items.push(text((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 13, o.chord, { size: 14, color: GREEN }));
  }
  if (o.central) {
    const a = onCircle(c, R, o.central.from);
    const b = onCircle(c, R, o.central.to);
    items.push(line(c, a, { width: 3, stroke: RED }), line(c, b, { width: 3, stroke: RED }));
    items.push({ t: 'path', d: arcPath(c, 26, o.central.from, o.central.to), stroke: RED, width: 2.5 });
    if (o.central.label) {
      const lp = onCircle(c, 44, (o.central.from + o.central.to) / 2);
      items.push(text(lp[0], lp[1], o.central.label, { size: 14, color: RED }));
    }
    items.push({ t: 'path', d: arcPath(c, R, o.central.from, o.central.to), stroke: RED, width: 5 });
    items.push(text(a[0] + 12, a[1] - 4, 'A', { size: 14, color: BLUE }), text(b[0] - 12, b[1] - 4, 'B', { size: 14, color: BLUE }));
    if (o.inscribed) {
      const k = onCircle(c, R, (o.central.from + o.central.to) / 2 + 180);
      items.push(line(k, a, { width: 2.5, stroke: GREEN }), line(k, b, { width: 2.5, stroke: GREEN }));
      items.push({ t: 'dot', at: k, r: 4, color: GREEN });
      items.push(text(k[0], k[1] + 15, 'C', { size: 14, color: GREEN }));
      if (o.inscribed.label) items.push(text(k[0] - 20, k[1] - 6, o.inscribed.label, { size: 14, color: GREEN }));
    }
  }
  items.push({ t: 'dot', at: c, r: 4, color: NAVY });
  return diagram(o.width ?? 220, 180, o.alt ?? 'წრეწირი ცენტრით', items);
}

/** Two circles whose centres are `d` apart, drawn to scale. */
export function twoCirclesPic(r1v: number, r2v: number, d: number): Picture {
  const total = r1v + d + r2v;
  const s = Math.min(250 / total, 66 / Math.max(r1v, r2v));
  const cy = 80;
  const x1 = 20 + r1v * s;
  const x2 = x1 + d * s;
  const items: DrawItem[] = [
    { t: 'circle', c: [r1(x1), cy], r: r1(r1v * s), fill: 'rgba(47,125,225,0.14)', stroke: BLUE, width: 3 },
    { t: 'circle', c: [r1(x2), cy], r: r1(r2v * s), fill: 'rgba(232,71,63,0.14)', stroke: RED, width: 3 },
    line([x1, cy], [x2, cy], { dash: true, width: 2 }),
    { t: 'dot', at: [r1(x1), cy], r: 4, color: BLUE },
    { t: 'dot', at: [r1(x2), cy], r: 4, color: RED },
    text((x1 + x2) / 2, cy - 12, `${d}`, { size: 14 }),
    text(x1, cy + 18, `${r1v}`, { size: 13, color: BLUE }),
    text(x2, cy + 18, `${r2v}`, { size: 13, color: RED }),
  ];
  return diagram(290, 160, `ორი წრეწირი: რადიუსები ${r1v} და ${r2v}, ცენტრებს შორის მანძილი ${d}`, items);
}

/* ---------------------------------------------------------------- *\
 * Charts
\* ---------------------------------------------------------------- */

export interface ChartItem {
  label: string;
  value: number;
  color?: string;
}

/** A column chart with a labelled vertical axis. */
export function columnChartPic(items: ChartItem[], max: number, step: number, o: { unit?: string; values?: boolean; title?: string } = {}): Picture {
  const W = Math.max(280, 70 + items.length * 62);
  const H = 190;
  const top = 18;
  const bottom = H - 36;
  const left = 46;
  const y = (v: number) => bottom - (v / max) * (bottom - top);
  const out: DrawItem[] = [];
  for (let v = 0; v <= max + 1e-9; v += step) {
    out.push(line([left, y(v)], [W - 10, y(v)], { stroke: GRID, width: v === 0 ? 2.5 : 1.2 }));
    out.push(text(left - 8, y(v), String(v), { size: 11, color: '#5b6b8c', anchor: 'end' }));
  }
  out.push(line([left, top - 4], [left, bottom], { width: 2.5 }));
  const slot = (W - 10 - left) / items.length;
  items.forEach((it, i) => {
    const x0 = left + slot * i + slot * 0.2;
    const bw = slot * 0.6;
    out.push({ t: 'poly', pts: [[x0, bottom], [x0, y(it.value)], [x0 + bw, y(it.value)], [x0 + bw, bottom]], fill: it.color ?? PALETTE[i % PALETTE.length], stroke: NAVY, width: 1.5 });
    out.push(text(x0 + bw / 2, bottom + 14, it.label, { size: 12, color: NAVY }));
    if (o.values) out.push(text(x0 + bw / 2, y(it.value) - 9, String(it.value), { size: 12 }));
  });
  if (o.unit) out.push(text(left + 4, 6, o.unit, { size: 11, color: '#5b6b8c', anchor: 'start' }));
  return diagram(W, H, `სვეტოვანი დიაგრამა: ${items.map((it) => `${it.label} — ${it.value}`).join('; ')}`, out, o.title);
}

/** A line graph through the values, one point per label. */
export function lineGraphPic(items: ChartItem[], max: number, step: number, o: { values?: boolean; title?: string } = {}): Picture {
  const W = Math.max(280, 70 + items.length * 62);
  const H = 190;
  const top = 18;
  const bottom = H - 36;
  const left = 46;
  const y = (v: number) => bottom - (v / max) * (bottom - top);
  const slot = (W - 10 - left) / items.length;
  const px = (i: number) => left + slot * i + slot / 2;
  const out: DrawItem[] = [];
  for (let v = 0; v <= max + 1e-9; v += step) {
    out.push(line([left, y(v)], [W - 10, y(v)], { stroke: GRID, width: v === 0 ? 2.5 : 1.2 }));
    out.push(text(left - 8, y(v), String(v), { size: 11, color: '#5b6b8c', anchor: 'end' }));
  }
  out.push(line([left, top - 4], [left, bottom], { width: 2.5 }));
  out.push({ t: 'poly', open: true, pts: items.map((it, i) => [r1(px(i)), r1(y(it.value))] as Pt), stroke: BLUE, width: 3 });
  items.forEach((it, i) => {
    out.push({ t: 'dot', at: [r1(px(i)), r1(y(it.value))], r: 5, color: BLUE });
    out.push(text(px(i), bottom + 14, it.label, { size: 12, color: NAVY }));
    if (o.values) out.push(text(px(i), y(it.value) - 12, String(it.value), { size: 12 }));
  });
  return diagram(W, H, `ხაზოვანი გრაფიკი: ${items.map((it) => `${it.label} — ${it.value}`).join('; ')}`, out, o.title);
}

/** A pie chart; slices run clockwise from the top. The legend shows the label and (optionally) the value. */
export function piePic(slices: ChartItem[], o: { showValue?: boolean; suffix?: string } = {}): Picture {
  const total = slices.reduce((a, s) => a + s.value, 0);
  const c: Pt = [88, 88];
  const R = 74;
  const items: DrawItem[] = [];
  let a0 = 90;
  slices.forEach((s, i) => {
    const sweep = (s.value / total) * 360;
    const color = s.color ?? PALETTE[i % PALETTE.length]!;
    if (slices.length === 1) items.push({ t: 'circle', c, r: R, fill: color, stroke: '#fff', width: 2 });
    else items.push({ t: 'path', d: sectorPath(c, R, a0, a0 - sweep), fill: color, stroke: '#fff', width: 2 });
    a0 -= sweep;
  });
  slices.forEach((s, i) => {
    const color = s.color ?? PALETTE[i % PALETTE.length]!;
    const y = 36 + i * 28;
    items.push({ t: 'poly', pts: [[186, y - 8], [202, y - 8], [202, y + 8], [186, y + 8]], fill: color, stroke: color, width: 1 });
    items.push(text(210, y, `${s.label}${o.showValue ? ` — ${s.value}${o.suffix ?? ''}` : ''}`, { size: 14, anchor: 'start', color: NAVY }));
  });
  const W = 210 + Math.max(...slices.map((s) => (s.label.length + (o.showValue ? 6 : 0)) * 9.6)) + 20;
  return diagram(Math.max(W, 330), Math.max(176, 52 + slices.length * 28), `წრიული დიაგრამა: ${slices.map((s) => `${s.label}${o.showValue ? ` — ${s.value}${o.suffix ?? ''}` : ''}`).join('; ')}`, items);
}

/* ---------------------------------------------------------------- *\
 * Grids (percent, area model) and spinners
\* ---------------------------------------------------------------- */

/** `rows × cols` squares; `shaded(r, c)` colours them. */
export function gridPic(rows: number, cols: number, shaded: (r: number, c: number) => boolean, size = 20, alt?: string): Picture {
  const items: DrawItem[] = [];
  for (let r = 0; r < rows; r += 1)
    for (let c = 0; c < cols; c += 1) {
      const x = 8 + c * size;
      const y = 8 + r * size;
      items.push({ t: 'poly', pts: [[x, y], [x + size, y], [x + size, y + size], [x, y + size]], fill: shaded(r, c) ? '#6bb5f7' : '#fff', stroke: '#8a98b8', width: 1.2 });
    }
  return diagram(cols * size + 16, rows * size + 16, alt ?? `${rows} × ${cols} უჯრიანი ბადე`, items);
}
/** The first `n` squares of a 10 × 10 grid shaded, row by row. */
export const hundredPic = (n: number): Picture => gridPic(10, 10, (r, c) => r * 10 + c < n, 20, `ას უჯრიანი კვადრატი, შეღებილია ${n} უჯრა`);

/** The area model of a fraction × fraction: `den1` columns, `den2` rows; `num1` columns blue, `num2` rows yellow, the overlap green. */
export function areaModelPic(den1: number, num1: number, den2: number, num2: number): Picture {
  const size = Math.min(34, Math.floor(240 / Math.max(den1, den2)));
  const items: DrawItem[] = [];
  for (let r = 0; r < den2; r += 1)
    for (let c = 0; c < den1; c += 1) {
      const inC = c < num1;
      const inR = r < num2;
      const x = 10 + c * size;
      const y = 10 + r * size;
      items.push({ t: 'poly', pts: [[x, y], [x + size, y], [x + size, y + size], [x, y + size]], fill: inC && inR ? '#7fd6a2' : inC ? '#a9cdf7' : inR ? '#ffe08a' : '#fff', stroke: '#8a98b8', width: 1.2 });
    }
  return diagram(den1 * size + 20, den2 * size + 20, `ფართობის მოდელი: ${num1}/${den1} და ${num2}/${den2}`, items);
}

/** A spinner of equal sectors; `colors[i]` is the colour of sector i. */
export function spinnerPic(colors: string[]): Picture {
  const c: Pt = [90, 88];
  const R = 74;
  const n = colors.length;
  const items: DrawItem[] = [];
  colors.forEach((col, i) => items.push({ t: 'path', d: sectorPath(c, R, 90 - (360 / n) * i, 90 - (360 / n) * (i + 1)), fill: col, stroke: '#fff', width: 2.5 }));
  items.push({ t: 'poly', pts: [[c[0], c[1] - 4], [c[0] + 6, c[1] + 22], [c[0] - 6, c[1] + 22]], fill: NAVY, stroke: NAVY, width: 1 });
  items.push({ t: 'dot', at: c, r: 6, color: NAVY });
  return diagram(180, 176, `მბრუნავი ისარი ${n} ტოლ სექტორად`, items);
}

/* ---------------------------------------------------------------- *\
 * Solids
\* ---------------------------------------------------------------- */

/** A rectangular box (oblique view); `grid` draws unit squares on the visible faces. */
export function cuboidPic(l: number, w: number, h: number, o: { grid?: boolean; labels?: [string, string, string]; unit?: string } = {}): Picture {
  const s = Math.min(150 / Math.max(l, 1), 100 / Math.max(h, 1), 80 / Math.max(w, 1) / 0.6) * 1;
  const fw = l * s;
  const fh = h * s;
  const dx = w * s * 0.6;
  const dy = w * s * 0.42;
  const x0 = 58;
  const y0 = 30 + dy;
  const items: DrawItem[] = [];
  const A: Pt = [x0, y0 + fh];
  const B: Pt = [x0 + fw, y0 + fh];
  const C: Pt = [x0 + fw, y0];
  const D: Pt = [x0, y0];
  const E: Pt = [D[0] + dx, D[1] - dy];
  const F: Pt = [C[0] + dx, C[1] - dy];
  const G: Pt = [B[0] + dx, B[1] - dy];
  items.push({ t: 'poly', pts: [D, C, F, E], fill: '#e7f0ff', stroke: NAVY, width: 2.5 });
  items.push({ t: 'poly', pts: [C, B, G, F], fill: '#cfe0fa', stroke: NAVY, width: 2.5 });
  items.push({ t: 'poly', pts: [A, B, C, D], fill: '#f5f9ff', stroke: NAVY, width: 2.5 });
  if (o.grid) {
    for (let i = 1; i < l; i += 1) items.push(line([x0 + i * s, y0], [x0 + i * s, y0 + fh], { stroke: '#9fb4d9', width: 1 }));
    for (let j = 1; j < h; j += 1) items.push(line([x0, y0 + j * s], [x0 + fw, y0 + j * s], { stroke: '#9fb4d9', width: 1 }));
  }
  const lab = o.labels ?? [`${l}`, `${w}`, `${h}`];
  const u = o.unit ? ` ${o.unit}` : '';
  items.push(text(x0 + fw / 2, y0 + fh + 15, `${lab[0]}${u}`, { size: 14 }));
  items.push(text(x0 - 8, y0 + fh / 2, `${lab[2]}${u}`, { size: 14, anchor: 'end' }));
  items.push(text(F[0] + 8, (C[1] + F[1]) / 2, `${lab[1]}${u}`, { size: 14, anchor: 'start' }));
  return diagram(Math.ceil(x0 + fw + dx + 70), Math.ceil(y0 + fh + 34), `მართკუთხა პარალელეპიპედი: ${lab[0]}${u}, ${lab[1]}${u}, ${lab[2]}${u}`, items);
}

/** The outline of a regular n-gon in a flattened ellipse (for prisms and pyramids). */
const polyRing = (n: number, cx: number, cy: number, rx: number, ry: number, start = 90): Pt[] =>
  Array.from({ length: n }, (_, i) => [r1(cx + rx * Math.cos(rad(start + (360 / n) * i))), r1(cy - ry * Math.sin(rad(start + (360 / n) * i)))] as Pt);

/** An upright n-gonal prism: hidden edges dashed. */
export function prismPic(n: number): Picture {
  const cyb = 128;
  const bottom = polyRing(n, 90, cyb, 52, 20, 270 + 180 / n);
  const top = bottom.map(([x, y]) => [x, y - 84] as Pt);
  const back = bottom.map((p) => p[1] < cyb - 1);
  const items: DrawItem[] = [];
  bottom.forEach((p, i) => {
    const q = bottom[(i + 1) % n]!;
    items.push(line(p, q, { width: 2.5, dash: back[i] && back[(i + 1) % n] }));
  });
  bottom.forEach((p, i) => items.push(line(p, top[i]!, { width: 2.5, dash: back[i] })));
  items.push({ t: 'poly', pts: top, fill: '#e7f0ff', stroke: NAVY, width: 2.5 });
  return diagram(180, 180, `${n}-კუთხა პრიზმა`, items);
}

/** An n-gonal pyramid: hidden edges dashed. */
export function pyramidPic(n: number): Picture {
  const cyb = 132;
  const base = polyRing(n, 90, cyb, 54, 20, 270 + 180 / n);
  const apex: Pt = [90, 22];
  const back = base.map((p) => p[1] < cyb - 1);
  const items: DrawItem[] = [];
  base.forEach((p, i) => {
    const q = base[(i + 1) % n]!;
    items.push(line(p, q, { width: 2.5, dash: back[i] && back[(i + 1) % n] }));
  });
  base.forEach((p, i) => items.push(line(apex, p, { width: 2.5, dash: back[i] })));
  items.push({ t: 'dot', at: apex, r: 4, color: NAVY });
  return diagram(180, 165, `${n}-კუთხა პირამიდა`, items);
}

export function cylinderPic(): Picture {
  const items: DrawItem[] = [
    { t: 'path', d: 'M 40 40 L 40 120 A 50 16 0 0 0 140 120 L 140 40', fill: '#e7f0ff', stroke: NAVY, width: 2.5 },
    { t: 'path', d: 'M 40 120 A 50 16 0 0 1 140 120', stroke: NAVY, width: 2, dash: true },
    { t: 'path', d: 'M 40 40 A 50 16 0 1 0 140 40 A 50 16 0 1 0 40 40 Z', fill: '#cfe0fa', stroke: NAVY, width: 2.5 },
  ];
  return diagram(180, 160, 'ცილინდრი', items);
}
export function conePic(): Picture {
  const items: DrawItem[] = [
    { t: 'path', d: 'M 90 20 L 40 120 A 50 16 0 0 0 140 120 Z', fill: '#e7f0ff', stroke: NAVY, width: 2.5 },
    { t: 'path', d: 'M 40 120 A 50 16 0 0 1 140 120', stroke: NAVY, width: 2, dash: true },
  ];
  return diagram(180, 160, 'კონუსი', items);
}

/* ---------------------------------------------------------------- *\
 * Thermometer
\* ---------------------------------------------------------------- */

export function thermometerPic(value: number, min: number, max: number, step: number): Picture {
  const top = 14;
  const bottom = 150;
  const y = (v: number) => bottom - ((v - min) / (max - min)) * (bottom - top);
  const items: DrawItem[] = [
    { t: 'poly', pts: [[70, top - 6], [86, top - 6], [86, bottom + 6], [70, bottom + 6]], fill: '#fff', stroke: NAVY, width: 2.5 },
    { t: 'poly', pts: [[75, y(value)], [81, y(value)], [81, bottom + 6], [75, bottom + 6]], fill: RED, stroke: RED, width: 1 },
    { t: 'circle', c: [78, bottom + 14], r: 11, fill: RED, stroke: NAVY, width: 2.5 },
  ];
  for (let v = min; v <= max; v += step) {
    items.push(line([86, y(v)], [96, y(v)], { width: 2 }));
    items.push(text(104, y(v), minus(String(v)), { size: 12, color: NAVY, anchor: 'start' }));
  }
  return diagram(150, 190, `თერმომეტრი: ${minus(String(value))}°C`, items);
}
