/**
 * U08 2D-shape geometry — pure and exact.
 *
 * A shape is described by its outline, and its sides and corners are *counted from the outline*, never stored by
 * hand. A square turned by 30° is still a square with four sides and four corners; a circle is a smooth curve with
 * no straight side and no corner. That is the whole point of the unit, so it is enforced here rather than trusted
 * to the pictures.
 */

export type Flat = 'circle' | 'triangle' | 'square' | 'rectangle';

export const FLAT_NAME: Record<Flat, string> = {
  circle: 'წრე',
  triangle: 'სამკუთხედი',
  square: 'კვადრატი',
  rectangle: 'მართკუთხედი',
};

/** A point on a shape's outline, in drawing units. */
export interface Pt2 {
  x: number;
  y: number;
}

/** How a shape is drawn: its kind, its size and how far it is turned. Turn and size never change its kind. */
export interface FlatSpec {
  kind: Flat;
  /** Width and height in drawing units. A square keeps equal sides whatever this says. */
  size?: number;
  /** Turned clockwise, in degrees. A turned square and rectangle stay themselves. */
  rotate?: number;
  /** A circle needs only a radius; it is drawn as a round curve, not a polygon with corners. */
  radius?: number;
}

export const DEFAULT_SIZE = 100;

/**
 * The outline of a shape, as a closed polygon. `null` for a circle: a circle has no straight sides, so giving it
 * corners would be a lie — every count below returns zero for it on purpose.
 */
export function outlineOf(spec: FlatSpec): Pt2[] | null {
  const size = spec.size ?? DEFAULT_SIZE;
  const turn = ((spec.rotate ?? 0) * Math.PI) / 180;
  const cos = Math.cos(turn);
  const sin = Math.sin(turn);
  const place = (x: number, y: number): Pt2 => ({ x: x * cos - y * sin, y: x * sin + y * cos });
  if (spec.kind === 'circle') return null;
  if (spec.kind === 'triangle') {
    // an equilateral triangle, centred on its middle, standing on a flat base
    const h = (Math.sqrt(3) / 2) * size;
    return [place(0, -h / 2), place(size / 2, h / 2), place(-size / 2, h / 2)];
  }
  if (spec.kind === 'square') {
    const half = size / 2;
    return [place(-half, -half), place(half, -half), place(half, half), place(-half, half)];
  }
  // a rectangle is visibly longer than it is tall, so it is never mistaken for a square
  const w = size * 1.5;
  const h = size;
  return [place(-w / 2, -h / 2), place(w / 2, -h / 2), place(w / 2, h / 2), place(-w / 2, h / 2)];
}

/** How many straight sides a shape has: counted from its outline, so a circle gets 0. */
export const sidesOf = (spec: FlatSpec): number => outlineOf(spec)?.length ?? 0;

/** How many corners (vertices) a shape has: one where each pair of sides meets. */
export const verticesOf = (spec: FlatSpec): number => sidesOf(spec);

/** The distances between neighbouring corners: a square's four sides are all equal, a rectangle's are not. */
export function sideLengths(spec: FlatSpec): number[] {
  const pts = outlineOf(spec);
  if (!pts) return [];
  return pts.map((p, i) => {
    const q = pts[(i + 1) % pts.length];
    return Math.hypot(q.x - p.x, q.y - p.y);
  });
}

const same = (xs: number[], tolerance = 0.5): boolean => xs.every((x) => Math.abs(x - xs[0]) <= tolerance);

/** Whether every side is the same length (true of a square and a triangle, false of a rectangle). */
export const hasEqualSides = (spec: FlatSpec): boolean => {
  const lengths = sideLengths(spec);
  return lengths.length > 0 && same(lengths);
};

/**
 * Whether two shapes are the same kind. A square turned by any angle is still a square, and a smaller square is
 * still a square: kind comes from the shape, not from its size or orientation.
 */
export const sameKind = (a: FlatSpec, b: FlatSpec): boolean => a.kind === b.kind;

/** Shapes that share a property: every shape with four sides, every shape with no corners. */
export const withSides = (specs: FlatSpec[], sides: number): FlatSpec[] => specs.filter((s) => sidesOf(s) === sides);

/** The four kinds, in the order the unit introduces them. */
export const FLAT_KINDS: Flat[] = ['circle', 'triangle', 'square', 'rectangle'];

/** A group for sorting: four sides that are equal → კვადრატი, four unequal → მართკუთხედი, three → სამკუთხედი. */
export function shapeGroup(spec: FlatSpec): Flat {
  if (spec.kind === 'circle') return 'circle';
  return sidesOf(spec) === 3 ? 'triangle' : hasEqualSides(spec) ? 'square' : 'rectangle';
}

/** The kinds that have `sides` sides, in words (for feedback that names the property, not the picture). */
export function sidesWord(sides: number): string {
  if (sides === 0) return 'სწორი გვერდი არ აქვს';
  if (sides === 3) return 'სამი გვერდი';
  if (sides === 4) return 'ოთხი გვერდი';
  return `${sides} გვერდი`;
}

export function verticesWord(vertices: number): string {
  if (vertices === 0) return 'კუთხე არ აქვს';
  if (vertices === 3) return 'სამი კუთხე';
  if (vertices === 4) return 'ოთხი კუთხე';
  return `${vertices} კუთხე`;
}

// ─────────────────────────── shapes in the world ───────────────────────────

/** An everyday object whose overall outline resembles a 2D shape. */
export interface EverydayItem {
  name: string;
  /** The shape it resembles, and the picture that draws it. */
  kind: Flat;
  spec?: FlatSpec;
}

/** Shapes found in a familiar room, used by the last lesson. */
export const EVERYDAY: EverydayItem[] = [
  { name: 'საათი', kind: 'circle', spec: { kind: 'circle', radius: 50 } },
  { name: 'წიგნი', kind: 'rectangle', spec: { kind: 'rectangle', size: 70 } },
  { name: 'ფანჯარა', kind: 'square', spec: { kind: 'square', size: 80 } },
  { name: 'საგზაო ნიშანი', kind: 'triangle', spec: { kind: 'triangle', size: 80 } },
  { name: 'მონეტა', kind: 'circle', spec: { kind: 'circle', radius: 40 } },
  { name: 'კარი', kind: 'rectangle', spec: { kind: 'rectangle', size: 90 } },
  { name: 'ფურცელი', kind: 'rectangle', spec: { kind: 'rectangle', size: 60 } },
  { name: 'სენდვიჩი', kind: 'triangle', spec: { kind: 'triangle', size: 70 } },
  { name: 'კვადრატული ფილა', kind: 'square', spec: { kind: 'square', size: 60 } },
  { name: 'საათის ციფერბლატი', kind: 'circle', spec: { kind: 'circle', radius: 45 } },
];

/** The everyday objects that resemble a given shape. */
export const everydayOf = (kind: Flat): EverydayItem[] => EVERYDAY.filter((item) => item.kind === kind);
