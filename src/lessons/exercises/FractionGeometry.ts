import { divisionOf } from './ShapeGeometry';
import type { Cut, ShapeKind, ShapeSpec } from '../types';

/**
 * G2 U07 fractions — pure and exact, built on the same cut geometry the shapes unit already uses.
 *
 * A fraction is a statement about equal parts: the denominator is how many equal pieces the whole was cut into (read
 * from the areas the cuts really make), and the numerator is how many of those pieces are taken. Nothing here trusts a
 * written fraction — every claim is checked against `divisionOf`, so a picture with three unequal pieces can never be
 * called "thirds".
 */

/** The fraction written as a numerator and a denominator. */
export interface Fraction {
  numerator: number;
  denominator: number;
}

/** `3/4` for reading, `3/4` for aria. */
export const fractionText = (f: Fraction): string => `${f.numerator}/${f.denominator}`;

/** The value, for comparing parts of a whole. */
export const fractionValue = (f: Fraction): number => (f.denominator === 0 ? 0 : f.numerator / f.denominator);

/** Whether a whole is cut into equal parts at all. */
export const hasEqualPieces = (spec: ShapeSpec): boolean => {
  const d = divisionOf(spec);
  if (d.pieces.length < 2) return false;
  const areas = d.pieces.map((p) => p.area);
  return Math.max(...areas) - Math.min(...areas) < 1e-6;
};

/** How many equal parts the whole was cut into — the denominator. `null` when the pieces are not equal. */
export const denominatorOf = (spec: ShapeSpec): number | null => (hasEqualPieces(spec) ? divisionOf(spec).pieces.length : null);

/** The fraction a picture shows when `take` of its pieces are picked. `null` when the parts are not equal. */
export function fractionOf(spec: ShapeSpec, take: number[]): Fraction | null {
  const den = denominatorOf(spec);
  if (den === null) return null;
  const picked = take.filter((n) => n >= 1 && n <= den).length;
  return { numerator: picked, denominator: den };
}

/** Whether a picture really shows `numerator/denominator`: equal parts, and that many taken. */
export const showsFraction = (spec: ShapeSpec, take: number[], f: Fraction): boolean => {
  const got = fractionOf(spec, take);
  return got !== null && got.numerator === f.numerator && got.denominator === f.denominator;
};

/** A unit fraction is one equal part: numerator 1. */
export const isUnitFraction = (f: Fraction): boolean => f.numerator === 1 && f.denominator > 1;

/** The name a student would use: ნახევარი, მესამედი, მეოთხედი. */
export function fractionName(f: Fraction): string {
  if (f.denominator === 2) return f.numerator === 1 ? 'ნახევარი' : `${f.numerator} ნახევარი`;
  if (f.denominator === 3) return f.numerator === 1 ? 'მესამედი' : `${f.numerator} მესამედი`;
  if (f.denominator === 4) return f.numerator === 1 ? 'მეოთხედი' : `${f.numerator} მეოთხედი`;
  return `${f.numerator}/${f.denominator}`;
}

/** How many pieces make the whole, said in words, so the denominator always explains itself. */
export const denominatorWords = (den: number): string => `მთელი დაყოფილია ${den} ტოლ ნაწილად.`;

/** How many pieces are taken, said in words. */
export const numeratorWords = (num: number): string => `აღებულია ${num} ნაწილი.`;

/** The fraction read aloud, connecting the picture to the notation. */
export const fractionSentence = (f: Fraction): string =>
  `${denominatorWords(f.denominator)} ${numeratorWords(f.numerator)} ეს არის ${fractionText(f)} — ${fractionName(f)}.`;

// ─────────────────────────── cuts that make equal parts ───────────────────────────

/** Halves: one line through the middle, whichever way it runs. */
export const HALF_CUTS: Record<ShapeKind, Cut[]> = {
  circle: [[0, 0.5, 1, 0.5]],
  square: [[0, 0.5, 1, 0.5]],
  rect: [[0, 0.5, 1, 0.5]],
};

/** Halves cut the other way — still two equal parts, just turned. */
export const HALF_CUTS_TURNED: Record<ShapeKind, Cut[]> = {
  circle: [[0.5, 0, 0.5, 1]],
  square: [[0.5, 0, 0.5, 1]],
  rect: [[0.5, 0, 0.5, 1]],
};

/** Halves cut corner to corner: still two equal parts, and a third way to see them. */
export const HALF_CUTS_DIAGONAL: Record<ShapeKind, Cut[]> = {
  circle: [[0.5, 0, 0.5, 1]],
  square: [[0, 0, 1, 1]],
  rect: [[0, 0, 1, 1]],
};

/** Quarters: a cross through the middle makes four equal parts of every shape here. */
export const QUARTER_CUTS: Record<ShapeKind, Cut[]> = {
  circle: [
    [0, 0.5, 1, 0.5],
    [0.5, 0, 0.5, 1],
  ],
  square: [
    [0, 0.5, 1, 0.5],
    [0.5, 0, 0.5, 1],
  ],
  rect: [
    [0, 0.5, 1, 0.5],
    [0.5, 0, 0.5, 1],
  ],
};

/** Quarters written as four parallel strips: also four equal parts, and a different way to see them. */
export const QUARTER_CUTS_STRIPES: Record<ShapeKind, Cut[]> = {
  circle: [
    [0, 0.5, 1, 0.5],
    [0.5, 0, 0.5, 1],
  ],
  square: [
    [0.25, 0, 0.25, 1],
    [0.5, 0, 0.5, 1],
    [0.75, 0, 0.75, 1],
  ],
  rect: [
    [0.25, 0, 0.25, 1],
    [0.5, 0, 0.5, 1],
    [0.75, 0, 0.75, 1],
  ],
};

/**
 * Thirds of a square or a rectangle by three evenly spaced columns — exact, because the pieces are equal by
 * construction. A circle cannot be cut into thirds by straight lines, so it is not offered.
 */
export const THIRD_CUTS: Record<ShapeKind, Cut[]> = {
  circle: [
    [0.5, 0, 0.5, 1],
    [1 / 3, 0, 1 / 3, 1],
  ],
  square: [
    [1 / 3, 0, 1 / 3, 1],
    [2 / 3, 0, 2 / 3, 1],
  ],
  rect: [
    [1 / 3, 0, 1 / 3, 1],
    [2 / 3, 0, 2 / 3, 1],
  ],
};

/** Three pieces that are NOT equal — the picture that must never be called thirds. */
export const UNEQUAL_THIRDS: Record<ShapeKind, Cut[]> = {
  circle: [
    [0.5, 0, 0.5, 1],
    [0.2, 0, 0.2, 1],
  ],
  square: [
    [0.2, 0, 0.2, 1],
    [0.8, 0, 0.8, 1],
  ],
  rect: [
    [0.25, 0, 0.25, 1],
    [0.9, 0, 0.9, 1],
  ],
};

/** A shape with `parts` equal pieces, cut the safest way for that shape. */
export function equalPartsSpec(shape: ShapeKind, parts: number): ShapeSpec | null {
  // a circle has no straight-line thirds, so it is never offered as one
  if (parts === 3 && shape === 'circle') return null;
  const cuts =
    parts === 2 ? HALF_CUTS[shape] : parts === 3 ? THIRD_CUTS[shape] : parts === 4 ? QUARTER_CUTS[shape] : null;
  if (!cuts) return null;
  const spec: ShapeSpec = { shape, cuts };
  // the cuts are only offered when they really do make equal parts
  return hasEqualPieces(spec) ? spec : null;
}

/** Whether a shape is cut into `parts` equal pieces. */
export const isCutInto = (spec: ShapeSpec, parts: number): boolean => denominatorOf(spec) === parts;

/** The pieces of a shape, numbered from 1 in reading order, for `take`. */
export const piecesOf = (spec: ShapeSpec): number[] => Array.from({ length: divisionOf(spec).pieces.length }, (_, i) => i + 1);

/** Whether `take` really picks `need` of the `parts` pieces. */
export const picksExactly = (spec: ShapeSpec, take: number[], need: number): boolean => {
  const all = piecesOf(spec);
  return take.length === need && take.every((n) => all.includes(n));
};

/** Every way of taking `need` of `parts` pieces — used to accept more than one right answer. */
export function allPicks(parts: number, need: number): number[][] {
  const out: number[][] = [];
  const step = (start: number, picked: number[]) => {
    if (picked.length === need) {
      out.push([...picked]);
      return;
    }
    for (let n = start; n <= parts; n += 1) step(n + 1, [...picked, n]);
  };
  step(1, []);
  return out;
}

/** What the fraction looks like as a share of the whole: `1/4` is one of four equal parts. */
export const partWords = (f: Fraction): string => `${f.numerator} / ${f.denominator}`;
