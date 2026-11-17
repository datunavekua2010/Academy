/**
 * Practice pictures — what a question shows, as data.
 *
 * Until now a question's picture was a string of emoji and box-drawing
 * characters. A string cannot be drawn well, cannot be tapped, and reads aloud
 * as noise. A `Picture` is the same information as structured data: the
 * renderer (`PictureView`) turns it into real artwork, and the parser
 * (`pictorialize`) turns the existing text pictures into it, so every template
 * that already draws a picture gets the new artwork without being rewritten.
 *
 * Nothing here is learner-facing text. Captions that come from a template
 * („პირველი ჯგუფი“) are carried through untouched.
 */

/** One drawn object in a row. */
export interface PicObject {
  /** Key into the icon library (`apple`, `star`, `dot-blue`, `shape-triangle`, …). */
  icon: string;
  /** `crossed` = taken away / struck out; `faded` = an empty slot. */
  state?: 'crossed' | 'faded';
}

/** A token on a picture line. */
export type PicToken =
  | { t: 'icon'; icon: string; state?: 'crossed' | 'faded' }
  | { t: 'rod'; color: string }
  | { t: 'unknown' }
  | { t: 'text'; text: string }
  | { t: 'sep'; style: 'bar' | 'gap' | 'arrow' }
  | { t: 'group'; tokens: PicToken[] }
  | { t: 'pointer' };

/** One row of a picture, with an optional caption in front of it. */
export interface PicRow {
  label?: string;
  tokens: PicToken[];
}

export interface NumberCell {
  text: string;
  /** The cell the question points at („ეს რიცხვი“). */
  mark?: boolean;
  /** The cell the student has to find. */
  unknown?: boolean;
  /** The pointer / arrow sat on this cell. */
  pointer?: boolean;
}

/** One drawn primitive of a `diagram` (coordinates are in the diagram's own pixel space). */
export type DrawItem =
  | { t: 'poly'; pts: Array<[number, number]>; fill?: string; stroke?: string; width?: number; dash?: boolean; open?: boolean }
  | { t: 'line'; from: [number, number]; to: [number, number]; stroke?: string; width?: number; dash?: boolean; arrow?: boolean }
  | { t: 'circle'; c: [number, number]; r: number; fill?: string; stroke?: string; width?: number; dash?: boolean }
  | { t: 'path'; d: string; fill?: string; stroke?: string; width?: number; dash?: boolean }
  | { t: 'text'; at: [number, number]; text: string; size?: number; anchor?: 'start' | 'middle' | 'end'; color?: string; bold?: boolean }
  | { t: 'dot'; at: [number, number]; r?: number; color?: string };

export type Picture =
  | { kind: 'rows'; rows: PicRow[] }
  | { kind: 'strip'; cells: NumberCell[] }
  | { kind: 'chart'; rows: NumberCell[][] }
  | { kind: 'clock'; minutes: number }
  | { kind: 'coins'; label?: string; coins: number[] }
  | { kind: 'tags'; items: Array<{ label?: string; amount: number }> }
  | { kind: 'bars'; items: Array<{ label?: string; size: number; caption?: string }> }
  | { kind: 'column'; heading?: string; top: string; sign: string; bottom: string; result?: string }
  | { kind: 'cells'; label?: string; rows: string[] }
  | { kind: 'balance'; left: PicToken[]; right: PicToken[]; tilt: 'left' | 'right' | 'level'; leftCaption?: string; rightCaption?: string }
  | { kind: 'chips'; items: Array<{ text: string; mark?: boolean }>; arrows?: boolean }
  | { kind: 'blocks'; tens: number; ones: number; label?: string }
  /** A bar model: a whole split into parts, one of them perhaps a „?“. */
  | { kind: 'model'; whole: string; parts: string[] }
  /** Tally marks, one row per label. */
  | { kind: 'tally'; rows: Array<{ label?: string; count: number }> }
  /** A rectangle (or square) with its side lengths written on it. */
  | { kind: 'rect'; width: string; height: string; wv: number; hv: number }
  /** A number line from `from` to `to`; `marks` are the values the question talks about. */
  | { kind: 'line'; from: number; to: number; step: number; marks: Array<{ value: number; label?: string }> }
  | { kind: 'parts'; bars: Array<Array<{ size: number; shaded: boolean }>>; divider?: boolean; label?: string }
  /**
   * A drawn figure: a coordinate plane, a triangle with its angles, a circle, a pie
   * chart, a cuboid … Built from data by the helpers in `draw.ts`, so the drawing is
   * always made from the same numbers as the question. `alt` is what a screen reader hears.
   */
  | { kind: 'diagram'; width: number; height: number; alt: string; items: DrawItem[]; label?: string };

/** What a picture tells a screen reader, in Georgian. */
export type Described = { picture: Picture; alt: string };

/** A block of the prompt: words, or a picture that sat between the words. */
export type Segment = { type: 'text'; text: string } | { type: 'picture'; picture: Picture };
