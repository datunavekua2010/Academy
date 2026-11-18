/**
 * U06 length geometry — pure, exact, and testable without a layout engine.
 *
 * One drawing rule for the whole unit: **1 centimetre = 10 drawing units**. Objects are described by a real
 * length in centimetres, and every picture is drawn from that number, so what the student sees and what the
 * maths says can never drift apart. Nothing here guesses a length from a picture; lengths are numbers.
 */

/** Drawing units per centimetre. Objects are drawn `cm * SCALE` long, and a ruler's ticks are `SCALE` apart. */
export const SCALE = 10;

/** The things that can be measured. Sizes are fixed, so a picture always matches its description. */
export type MeasureKind = 'pencil' | 'crayon' | 'ribbon' | 'stick' | 'book' | 'eraser' | 'cube' | 'clip' | 'ladder' | 'door';

export interface KindInfo {
  /** Thickness in drawing units (how tall the object is drawn). */
  thickness: number;
  /** The object's name in Georgian, used in accessible labels and prompts. */
  name: string;
}

export const KINDS: Record<MeasureKind, KindInfo> = {
  pencil: { thickness: 6, name: 'ფანქარი' },
  crayon: { thickness: 7, name: 'ფერადი ფანქარი' },
  ribbon: { thickness: 8, name: 'ლენტი' },
  stick: { thickness: 5, name: 'ჩხირი' },
  book: { thickness: 9, name: 'წიგნი' },
  eraser: { thickness: 5, name: 'საშლელი' },
  cube: { thickness: 10, name: 'კუბიკი' },
  clip: { thickness: 10, name: 'სამაგრი' },
  ladder: { thickness: 12, name: 'კიბე' },
  door: { thickness: 12, name: 'კარი' },
};

export const DEFAULT_KIND: MeasureKind = 'pencil';

/** An object to draw: what it is, and how long it is. */
export interface ObjSpec {
  kind?: MeasureKind;
  /** Length in whole centimetres. */
  cm: number;
  /** Drawn standing up. Orientation never changes the length. */
  turn?: 'straight' | 'up';
}

export const kindOf = (spec: ObjSpec): MeasureKind => spec.kind ?? DEFAULT_KIND;
export const nameOf = (spec: ObjSpec): string => KINDS[kindOf(spec)].name;

/** Centimetres to drawing units. */
export const px = (cm: number): number => cm * SCALE;

/** Drawing units back to whole centimetres. */
export const cmOf = (units: number): number => Math.round(units / SCALE);

/** The drawn length of an object, in drawing units. */
export const lengthOf = (spec: ObjSpec): number => px(spec.cm);

/** The longest length in a list, in cm (never less than 1). */
export const maxCmOf = (specs: ObjSpec[]): number => Math.max(1, ...specs.map((s) => s.cm));

// ─────────────────────────── comparing lengths ───────────────────────────

export type LengthOrder = 'first-longer' | 'second-longer' | 'same';

/** Which of two lengths is longer. Decided by the numbers, never by how a picture was drawn. */
export function orderOf(a: number, b: number): LengthOrder {
  if (a > b) return 'first-longer';
  if (b > a) return 'second-longer';
  return 'same';
}

/**
 * Whether two objects line up at the same starting point. Objects that begin at different places cannot be
 * compared by looking, so every comparison in this unit starts both at the same place.
 * `starts` are x coordinates in drawing units.
 */
export function aligned(starts: number[], tolerance = 0.5): boolean {
  if (starts.length < 2) return true;
  const first = starts[0];
  return starts.every((x) => Math.abs(x - first) <= tolerance);
}

/**
 * The group an object belongs to when compared with a reference:
 * `l` longer, `s` shorter, `e` the same length.
 */
export function compareGroup(cm: number, referenceCm: number): 'l' | 's' | 'e' {
  const order = orderOf(cm, referenceCm);
  return order === 'first-longer' ? 'l' : order === 'second-longer' ? 's' : 'e';
}

// ─────────────────────────── non-standard units ───────────────────────────

/**
 * How many identical units of `unitCm` fit end to end along an object of `objectCm`, with no gaps and no
 * overlaps. The U06.3 examples are chosen so the answer is exact.
 */
export const unitsIn = (objectCm: number, unitCm: number): number => Math.round(objectCm / unitCm);

/** Whether `unitCm` tiles an object exactly (no half unit left over). */
export const tilesExactly = (objectCm: number, unitCm: number): boolean => {
  const ratio = objectCm / unitCm;
  return Math.abs(ratio - Math.round(ratio)) < 1e-9;
};

/**
 * The same object measured with different units. The numbers differ, but the object does not:
 * a measurement is a count of units, not a property of the ruler.
 */
export const measuredWith = (objectCm: number, unitCms: number[]): Array<{ unitCm: number; count: number }> =>
  unitCms.map((unitCm) => ({ unitCm, count: unitCm === 0 ? 0 : objectCm / unitCm }));

/** "4 სამაგრი" — a measurement is a number and a unit together. */
export const measurementText = (count: number, unitName: string): string => `${count} ${unitName}`;

// ─────────────────────────── a ruler ───────────────────────────

/** Where a ruler's tick `cm` falls, in drawing units, when its zero mark is at `zeroAt`. */
export const tickAt = (cm: number, zeroAt: number): number => zeroAt + px(cm);

/**
 * The reading the object's far end gives on a ruler whose zero mark is at `zeroAt`: the distance from the zero,
 * in centimetres. Only the zero's position matters, which is exactly the point of the lesson.
 */
export const readingAt = (objectEnd: number, zeroAt: number): number => cmOf(objectEnd - zeroAt);

/** Whether the object's start sits on the ruler's zero mark (so the measurement will be right). */
export const zeroAligned = (objectStart: number, zeroAt: number, tolerance = 0.5): boolean => Math.abs(objectStart - zeroAt) <= tolerance;

/** The ruler position that puts the zero mark under the object's start. */
export const zeroForObject = (objectStart: number): number => objectStart;

/**
 * Ruler positions for a multi-part question: the right one plus deliberately off ones (drawing units), so a
 * student cannot score by leaving the ruler where it is.
 */
export function rulerOffsets(objectStart: number, offBy: number[] = [-20, 10, 25]): Array<{ at: number; right: boolean }> {
  return [{ at: zeroForObject(objectStart), right: true }, ...offBy.map((d) => ({ at: objectStart + d, right: false }))];
}

// ─────────────────────────── metres ───────────────────────────

/** 1 m = 100 cm. */
export const CM_PER_M = 100;

/** A length in centimetres, in metres. */
export const toMetres = (cm: number): number => cm / CM_PER_M;
/** A length in metres, in centimetres. */
export const toCentimetres = (m: number): number => m * CM_PER_M;

/**
 * Whether centimetres (`cm`) or metres (`m`) suit an object of `cm` length. The cut-off is one metre: anything at
 * least a metre long is measured in metres, anything shorter in centimetres.
 */
export type UnitChoice = 'cm' | 'm';
export const suitableUnit = (cm: number): UnitChoice => (cm >= CM_PER_M ? 'm' : 'cm');
export const unitName = (choice: UnitChoice): string => (choice === 'cm' ? 'სანტიმეტრი' : 'მეტრი');
export const unitSymbol = (choice: UnitChoice): string => (choice === 'cm' ? 'სმ' : 'მ');

/** "8 სმ" or "2 მ" — a measurement is never a bare number. */
export const withUnit = (value: number, choice: UnitChoice): string => `${value} ${unitSymbol(choice)}`;

// ─────────────────────────── drawing helpers ───────────────────────────

export interface Box {
  width: number;
  height: number;
}

/** The drawing area an object needs, in drawing units. */
export function boxOf(spec: ObjSpec, pad = 4): Box {
  const t = KINDS[kindOf(spec)].thickness;
  return { width: lengthOf(spec) + pad * 2, height: t + pad * 2 };
}

/** Padding at both ends of a ruler, so the zero and last ticks are not on the very edge. */
export const RULER_PAD = 8;

/** A neat label for a length that may be half a centimetre: `8`, `8.5`. */
export const cmLabel = (cm: number): string => (Number.isInteger(cm) ? String(cm) : cm.toFixed(1));
