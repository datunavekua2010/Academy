import type { MeasureKind } from './exercises/MeasureGeometry';
import type { ClockTime } from './exercises/ClockGeometry';
import type { Flat, FlatSpec } from './exercises/Shape2DGeometry';
import type { Place } from './exercises/PlaceValueGeometry';

/**
 * Lesson system model.
 *
 * Two separate things live here, on purpose:
 *
 *  1. The approved HIERARCHY (Grade → Topic → Unit → Lesson). It is title-only
 *     data in `catalogData.ts` and is never edited by content authors.
 *  2. Lesson CONTENT (`Lesson`), attached to a catalog lesson by id. Content is
 *     plain serialisable data — no functions, no JSX — so a lesson can later be
 *     supplied as JSON/TS without touching the player.
 *
 * Text fields are "rich text": plain Georgian text where `$…$` marks inline
 * mathematics, e.g. `"გაამარტივე $3x + 2x$"`. See `RichText.tsx`.
 */

export type GradeNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;

// ───────────────────────────── hierarchy ─────────────────────────────

export interface UnitData {
  number: number;
  title: string;
  /** Exactly five lesson titles, in order. */
  lessons: string[];
}
export interface TopicData {
  number: number;
  title: string;
  units: UnitData[];
}
export interface GradeCatalog {
  grade: GradeNumber;
  label: string;
  topics: TopicData[];
}

/** A catalog lesson with every address resolved. */
export interface LessonEntry {
  /** `g6-u10-l3` */
  id: string;
  grade: GradeNumber;
  topicNumber: number;
  topicTitle: string;
  unitId: string;
  /** `U10` */
  unitCode: string;
  unitTitle: string;
  /** 1–5 within the unit. */
  number: number;
  /** `U10.3` */
  code: string;
  title: string;
}
export interface UnitEntry {
  /** `g6-u10` */
  id: string;
  grade: GradeNumber;
  code: string;
  number: number;
  title: string;
  topicNumber: number;
  topicTitle: string;
  lessons: LessonEntry[];
}
export interface TopicEntry {
  id: string;
  grade: GradeNumber;
  number: number;
  title: string;
  units: UnitEntry[];
}

// ───────────────────────────── content ─────────────────────────────

/**
 * placeholder — demonstration content only; never an approved lesson.
 * draft       — real content supplied, not yet approved.
 * published   — approved, ready for students.
 */
export type ContentStatus = 'placeholder' | 'draft' | 'published';

export type Stage = 'challenge' | 'explore' | 'understand' | 'practice' | 'check';

export interface ChoiceOption {
  id: string;
  /** Always read by screen readers; shown beside the picture when there is one. */
  text: string;
  /** A picture instead of (or beside) the text, e.g. a quantity to match to a numeral. */
  visual?: VisualSpec;
}

// ───────────────────────────── length (Unit 6) ─────────────────────────────

/** A thing that can be measured. `cm` is its real length; the picture is drawn from that number. */
export interface LengthObject {
  kind?: MeasureKind;
  cm: number;
  /** Drawn standing up: the same length. Orientation never changes a measurement. */
  turn?: 'straight' | 'up';
}
/** A named length, for the unit-choice questions ("კარი", 200 cm → metres). */
export interface LengthItem {
  label: string;
  cm: number;
  kind?: MeasureKind;
}

// ───────────────────────────── time (Unit 7) ─────────────────────────────

/** A time on a clock face. Shared with `ClockGeometry`, where every hand position is computed from it. */
export type ClockTimeSpec = ClockTime;

/** A clock face used in a question, with the hands it shows. */
export interface ClockSpec {
  time: ClockTime;
  /** The number the student should drag a hand to, for the setting questions. */
  label?: string;
}

// ───────────────────────────── 2D shapes (Unit 8) ─────────────────────────────

/** One shape in a collection: its kind, and how it happens to be drawn (size and turn never change the kind). */
export type FlatSpec2D = FlatSpec;

/** A named shape for the sorting and everyday-object questions. */
export interface FlatItem {
  label?: string;
  spec: FlatSpec;
}

/** How a question is answered, and what the right answer is. */
export type ResponseSpec =
  | { type: 'choice'; options: ChoiceOption[]; answer: string }
  | { type: 'numeric'; answer: number; unit?: string }
  /** A typed algebraic expression, compared by algebra rather than spelling. */
  | { type: 'expression'; answer: string; placeholder?: string }
  /**
   * Missing numbers inside a sentence. `template` marks blanks as `{1}`, `{2}`…
   * (any other text, including `$…$` maths, is shown as written).
   */
  | { type: 'blanks'; template: string; answers: number[] }
  /**
   * The student places a marker on a number line (drag, tap a tick, or the
   * arrow buttons). `labelled` ticks always show their number; the rest are
   * unlabelled so the student has to count. The marker's own number is only
   * shown when `showValue` is set (it would give the answer away).
   */
  | { type: 'line'; min: number; max: number; answer: number; labelled?: number[]; start?: number; arrows?: boolean; showValue?: boolean }
  /**
   * The student taps objects to pick exactly `answer` of the `total` shown
   * (count out a number). Stored as the comma-separated indices tapped.
   */
  | { type: 'collect'; total: number; answer: number; glyph: Glyph; layout: ObjectLayout; seed?: number }
  /**
   * The student arranges number tiles by dragging, or by tap-to-select and
   * move. `items` is the starting (shuffled) order; the right order is derived
   * from `direction`. With `lineAfterHint` a number line appears once a hint
   * has been opened. Stored as the comma-separated current order.
   */
  | { type: 'order'; items: number[]; direction: 'asc' | 'desc'; lineAfterHint?: boolean; min?: number; max?: number }
  /**
   * Two boxes and `total` counters; every counter starts in the first box and
   * the student moves them. Correct when the first box holds `answer`.
   * Stored as the number of counters in the first box.
   */
  | { type: 'split'; total: number; answer: number; frame?: boolean }
  /**
   * `total` counters start in a container; the student moves them into two boxes
   * (tap, or drag). Every way of using all the counters is right; with
   * `allowEmpty: false` each box must hold at least one (two real parts).
   * Stored as `"a,b"`: the counters in box one and box two.
   */
  | { type: 'distribute'; total: number; glyph?: CounterGlyph; allowEmpty?: boolean; palette?: 'plain' | 'redblue' }
  /**
   * A five- or ten-frame with `given` counters already placed (the first part).
   * The student taps empty spaces to add counters of the second part. Correct
   * when the frame is exactly full. Stored as the number of counters added.
   */
  | { type: 'fill'; size: 5 | 10; given: number }
  /**
   * The student makes number-line jumps with a button: forward (adding) or back (subtracting).
   * Correct when the jumps start at `from` and there are exactly `count` of them. With `pickStart`
   * the student first taps the starting number on the line. With `swapOk` (forward only) starting
   * at the other number and making `from` jumps is also right; otherwise that gets its own
   * feedback (`swapped`). Stored as `"start,jumps"`.
   */
  | { type: 'jumps'; direction: 'forward' | 'back'; min: number; max: number; from: number; count: number; pickStart?: boolean; showLanding?: boolean; labelled?: number[]; swapOk?: boolean }
  /**
   * `total` objects in a group; the student takes `remove` of them out (tap an object to move it
   * to the "taken away" tray, tap again to put it back). Stored as the comma-separated indices taken.
   */
  | { type: 'takeaway'; total: number; remove: number; glyph: Glyph }
  /**
   * A ten-frame holding `a` counters and `b` more counters outside it (a + b > 10). The student moves
   * counters into the frame. Correct when the frame is exactly full. Stored as the counters in the frame.
   */
  | { type: 'make-ten'; a: number; b: number }
  /**
   * A story problem: the student picks addition or subtraction and types the answer.
   * Stored as `"+,9"` or `"-,5"`. A wrong operation is routed to the misconception
   * with the answer `"operation"`.
   */
  | { type: 'story'; operation: 'add' | 'subtract'; answer: number }
  /**
   * The student sorts pictures into groups. `rule` decides the right group of each picture from its
   * geometry: `equal` (equal / unequal parts), `halves`, `quarters` (yes / no), or `wholeparts`
   * (one whole / parts of one whole / pieces that do not belong together, from each picture's `view`).
   * Stored as the comma-separated group of each picture (empty: not sorted yet).
   */
  | { type: 'classify'; rule: DivisionRule | 'wholeparts'; items: ShapeItem[] }
  /**
   * One divided shape and a yes/no answer decided by its geometry (`equal`: equal parts? `halves`: two equal
   * parts? `quarters`: four equal parts?). With `compare` the student may lay two parts on top of each other.
   * Stored as the option id (`e`/`u` for equal, `y`/`n` otherwise).
   */
  | { type: 'judge'; rule: DivisionRule; shape: ShapeSpec; compare?: boolean }
  /**
   * The student taps `need` pieces of a divided shape. Only the pieces in `from` (all by default) are right.
   * Stored as the comma-separated piece numbers (from 1).
   */
  | { type: 'select-parts'; shape: ShapeSpec; need: number; from?: number[]; noun?: string }
  /**
   * The pieces of a shape wait in a tray; the student puts each into its place in the outline (tap a piece, then a
   * place, or drag). A piece goes only where it fits exactly. `decoys` are pieces of other shapes that fit nowhere.
   * Stored as the comma-separated place of each tray item (`-`: still in the tray).
   */
  | { type: 'reassemble'; shape: ShapeSpec; decoys?: Array<{ spec: ShapeSpec; piece: number }> }
  /**
   * The student divides a shape by tapping the dots on its edge: two dots make a dividing line (up to `maxCuts`).
   * Correct when the lines make exactly `parts` pieces of exactly equal area. Stored as `"i-j;k-l"` (dot numbers).
   * Misconception ids: `count` (wrong number of pieces), `unequal`. With `compare` the student can lay two pieces
   * on top of each other.
   */
  | { type: 'cut'; shape: ShapeKind; parts: 2 | 4; maxCuts: number; skin?: SkinId; compare?: boolean }
  /**
   * Two objects to compare. First the student drags both to the common starting line (a picture that is not
   * aligned cannot be compared by eye), then picks the one that is longer (or shorter, per `ask`).
   * Stored as `"<aligned>,<choice>"`, e.g. `"1,a"`; `same` is offered when the two lengths match.
   */
  | { type: 'align-compare'; a: LengthObject; b: LengthObject; ask?: 'longer' | 'shorter' }
  /**
   * Sort objects into three groups by comparing each with `reference`: longer (`l`), shorter (`s`), the same
   * length (`e`). Grouping comes from the lengths, never from how the pictures look.
   * Stored as the comma-separated group of each item.
   */
  | { type: 'length-sort'; reference: LengthObject; items: LengthObject[] }
  /**
   * Measure with identical units: the student lays `unitCm`-long units end to end along the object (no gaps, no
   * overlaps) and counts them. Stored as the number of units placed.
   */
  | { type: 'measure-units'; object: LengthObject; unitCm: number; unitName: string }
  /**
   * Read a ruler: slide it under the object so the zero mark meets the object's start, then choose the
   * measurement. Stored as `"<rulerZero>,<cm>"`; both parts must be right.
   */
  | { type: 'ruler-read'; object: LengthObject; rulerStart: number; options: number[]; answerCm: number }
  /**
   * Choose the unit that suits each object: centimetres for short things, metres for things at least a metre long.
   * Stored as the comma-separated choice of each item (`cm`/`m`).
   */
  | { type: 'unit-pick'; items: LengthItem[] }
  /**
   * Pick the two hands: the short one shows hours, the longer one minutes. Stored as the chosen kinds in order,
   * e.g. `"hour,minute"`.
   */
  | { type: 'hand-pick'; hourHand: 'short' | 'long'; minuteHand: 'short' | 'long' }
  /**
   * Set a clock: drag the hands until the face shows the asked time. Stored as `"<hour>,<minute>"`. Both hands
   * must be right, and the hour hand must sit where it really is at that minute (between the numbers at half past).
   */
  | { type: 'set-clock'; ask: ClockTime; step?: 1 | 5 | 30; toleranceMinutes?: number }
  /**
   * Read a clock: choose the time the face shows. Stored as the chosen `"<hour>,<minute>"`.
   * The right answer comes from the time the face is set to, never from a written label.
   */
  | { type: 'read-clock'; time: ClockTime; options: ClockTime[] }
  /**
   * Match analog faces to digital displays: one display per face, both showing the same time. Stored as the
   * comma-separated display index chosen for each face.
   */
  | { type: 'match-time'; faces: ClockTime[]; displays: string[] }
  /**
   * Sort shapes into groups: by kind (`k`), by number of sides (`s`), or by whether they have four corners (`c`).
   * Stored as the comma-separated group of each shape.
   */
  | { type: 'shape-sort'; groupBy: 'kind' | 'sides' | 'corners'; shapes: FlatSpec[] }
  /**
   * Tap the sides (or the corners) of a shape and count them. Stored as the tapped numbers. A side is only
   * right when every side is tapped exactly once; a circle has none, so its answer is empty.
   */
  | { type: 'tap-parts'; shape: FlatSpec; tap: 'sides' | 'corners' }
  /**
   * Choose every object in a picture that has the asked shape. Stored as the comma-separated ids chosen.
   * A picture item is only right when its outline really is that shape.
   */
  | { type: 'find-shapes'; kind: Flat; items: Array<{ id: string; label: string; spec: FlatSpec }> }
  /**
   * Weigh two pans until they balance. `left` and `right` are the starting weights; the student moves weights between
   * them. Correct only when the two totals are equal — the beam's look is computed from those totals, never the other
   * way round. Stored as `left:right` weight lists, e.g. `"3,2:4,1"`.
   */
  | { type: 'balance-pans'; weights: number[]; left: number[]; right: number[]; unit?: string }
  /**
   * Make two groups equal: `a` objects in the first group, `b` in the second. The student adds or removes objects.
   * Correct when the two counts match, whatever colour, shape or arrangement the pictures use. Stored as `"a,b"`.
   */
  | { type: 'equal-groups'; a: number; b: number; glyph?: Glyph; max?: number }
  /**
   * Complete a number sentence from number and sign cards. `template` has one `{}` per place, e.g. `"{1} {2} {3} = 5"`;
   * `answers` are the cards that belong in those places, in order. Stored as the comma-separated cards placed.
   */
  | { type: 'sentence-build'; template: string; answers: string[]; cards: number[]; signs: Array<'+' | '−'> }
  /**
   * Pick every sentence that is true. A sentence holds only when its two sides have the same value, computed from the
   * numbers. Stored as the comma-separated ids of the chosen sentences.
   */
  | { type: 'sentence-pick'; sentences: Array<{ id: string; left: TermSpec; right: number }> }
  /**
   * A balance puzzle: the clues are scales. The student types the value of one unknown weight. Stored as the value.
   */
  | { type: 'balance-puzzle'; unknown: string; clues: PuzzleClue[]; answer: number; unit?: string }
  /**
   * Sort objects into the groups of one attribute. Correct when each object sits in the group its own attribute value
   * names. Stored as the comma-separated group value of each object, in the objects' order.
   */
  | { type: 'sort-groups'; attr: SortAttr; objects: SortObjSpec[] }
  /**
   * A two-way grid: rows are one attribute, columns the other. Correct when each object is in the cell of its own pair
   * of attributes. Stored as the comma-separated `row|col` cell keys, in the objects' order.
   */
  | { type: 'sort-grid'; rowAttr: SortAttr; colAttr: SortAttr; rows: string[]; cols: string[]; objects: SortObjSpec[] }
  /**
   * Two overlapping circles. Correct when each object is in the region decided by its attributes (both, only the
   * first, only the second, neither). Stored as the comma-separated region of each object.
   */
  | { type: 'venn-sort'; leftAttr: SortAttr; leftValue: string; rightAttr: SortAttr; rightValue: string; objects: SortObjSpec[] }
  /**
   * Read a picture chart: choose the category the question asks about. The count for each row is the number of symbols
   * in it, so a chart can never claim a count its pictures do not show. Stored as the chosen label.
   */
  | { type: 'chart-read'; chart: ChartSpecData; ask: 'most' | 'least' | 'more' | 'fewer' | 'same'; compareWith?: string }
  /**
   * Build a picture chart: the student adds one symbol at a time until each row matches `target`. Stored as the
   * comma-separated counts of the rows.
   */
  | { type: 'chart-build'; glyph: ChartSpecData['glyph']; labels: string[]; target: number[] }
  /**
   * Pick every object that satisfies all the clues. Correct when the picked set is exactly the objects that do.
   * Stored as the comma-separated ids.
   */
  | { type: 'clue-pick'; clues: PuzzleClue2[]; objects: SortObjSpec[] }
  /**
   * Build a number from place-value blocks. Correct when the blocks are worth `target`; unless `allowRegroup` is set,
   * the blocks must also be in standard form (no place holding ten or more), which is what "build 245" means.
   * Stored as `"h,t,o"`, the number of blocks in each place.
   */
  | { type: 'place-build'; target: number; max?: number; allowRegroup?: boolean }
  /**
   * Split a number into its three place-value cards and put them in order, highest place first. Correct when each card
   * is exactly that place's value — 300, 40, 5 for 345 — including a zero card for an empty place.
   * Stored as the comma-separated card values in order.
   */
  | { type: 'expanded-build'; value: number; cards: number[] }
  /**
   * Tap the digit that sits in a named place. Correct when the tapped digit really is in that place, computed from the
   * number. Stored as the place of the tapped digit (`hundreds`/`tens`/`ones`).
   */
  | { type: 'digit-tap'; value: number; target: Place }
  /**
   * One place is hidden and the student types its value: `345` with the tens hidden is 40, not 4. Correct from the
   * number itself. Stored as the typed value.
   */
  | { type: 'place-missing'; value: number; missing: Place }
  /**
   * Skip-count on a number line: the character hops one landing at a time from `start`, `count` landings in all. Stored
   * as the number of hops taken (a wrong answer is a different count, not a different rule).
   */
  | { type: 'skip-line'; start: number; step: number; count: number; walker?: 'rabbit' | 'frog' | 'kangaroo' }
  /**
   * A sequence with blank positions. `start`/`step`/`count` define every number, so the answer is computed, never read
   * off a picture. Stored as the typed numbers of the blanks, in position order, comma-separated.
   */
  | { type: 'sequence-fill'; start: number; step: number; count: number; holes: number[]; arrows?: string }
  /** Which rule does this sequence follow? Options are candidate steps. Stored as the chosen step. */
  | { type: 'sequence-rule'; start: number; step: number; count: number; options: number[] }
  /**
   * Two two-digit numbers in columns; the student writes the result digit by digit. Stored as `"tens,ones"`, so a
   * transposed answer is a different answer. A carry / a broken ten is required exactly when the numbers need one.
   */
  | { type: 'column-sum'; a: number; b: number; op: 'add' | 'subtract' }
  /** The same sum, answered in the order it is taught: the ones first, then the tens (with any carried ten). Stored `"ones,tens"`. */
  | { type: 'sum-steps'; a: number; b: number }
  /** A subtraction with the ten broken open by hand before the answer can be typed. Stored as the answer number. */
  | { type: 'difference-steps'; a: number; b: number }
  /** A story problem: pick the operation and type the answer. Stored as `"add,42"` or `"subtract,17"`. */
  | { type: 'story-problem'; kind: 'join' | 'separate' | 'compare'; a: number; b: number; story: string; unit: string }
  /**
   * Make every group hold the same number of objects. `each` is the starting count of a real group (the rest may differ).
   * Stored as the counts of the groups, comma-separated — equality is decided by those numbers.
   */
  | { type: 'make-equal'; groups: number; each: number; start?: number[] }
  /** Read an array: its rows, what is in each row, and the total. Stored as `"rows,cols"` (the total is computed). */
  | { type: 'array-read'; rows: number; cols: number }
  /** Build any true array for a total. Stored as `"rows,cols"`; every factor pair is right. */
  | { type: 'array-build'; total: number }
  /** A groups story answered as `groups × each = total`. Stored as `"groups,each,total"`. */
  | { type: 'group-story'; groups: number; each: number; text: string; unit: string; what: string }
  /**
   * A times-table fact: the student writes the two factors and the product is computed from them, so a right
   * sentence is right however it is ordered (`3 × 4` and `4 × 3` both hold). Stored as `"table,factor"`.
   */
  | { type: 'times-fact'; table: number; factor: number; max?: number }
  /** A missing number in a multiplication sentence. Stored as the number written. */
  | { type: 'times-missing'; table: number; factor: number; missing: 'factor' | 'product'; max?: number }
  /**
   * The student fills a table row fact by fact, in order. Stored as the comma-separated products written so far
   * (starting from `1 × table`).
   */
  | { type: 'table-build'; table: number; upTo: number }
  /**
   * A grid of products: `tables` down the side, `factors` across. Either the student taps the cells that make
   * `target`, or reads the product at a named cell. Stored as cell keys (`"table,factor"`) or the product.
   */
  | { type: 'table-grid'; tables: number[]; factors: number[]; ask: 'find-target' | 'read-product'; target: number | { table: number; factor: number } }
  /**
   * Share `total` objects fairly among `people` characters: every one must hold the same number and nothing may be
   * left over, so the share is `total / people`. Stored as `"share,leftover"`.
   */
  | { type: 'share-fair'; total: number; people: number; glyph?: Glyph }
  /**
   * Put `total` objects into `groups` containers; right when every container holds the same number and nothing is
   * left. Stored as the counts of the containers (`"3,3,3"`), so fairness is decided by the numbers.
   */
  | { type: 'share-groups'; total: number; groups: number; glyph?: Glyph }
  /** Make as many complete groups of `size` as possible and count them. Stored as `"groups,leftover"`. */
  | { type: 'group-into'; total: number; size: number; glyph?: Glyph }
  /**
   * A division sentence `total ÷ by = share`: the student writes the dividend and the divisor, and the quotient is
   * computed from them. Stored as `"total,by"`.
   */
  | { type: 'division-sentence'; total: number; by: number; family?: 'share' | 'group' }
  /** One of the four facts of a family, `a × b = p` ⇄ `p ÷ a = b`. Stored as the missing number. */
  | { type: 'fact-family'; a: number; b: number; missing: 'a' | 'b' | 'product' }
  /** Equal or unequal parts, decided by the areas the cuts really make. Stored as `"1"` (equal) or `"0"`. */
  | { type: 'parts-judge'; shape: ShapeSpec }
  /** Pick `need` of the equal parts of a whole, so the fraction shown is `need / parts`. Stored as piece numbers. */
  | { type: 'fraction-pick'; shape: ShapeSpec; need: number; noun?: string }
  /** Read the denominator (equal parts) and the numerator (parts taken) off a divided shape. Stored as `"num,den"`. */
  | { type: 'fraction-name'; shape: ShapeSpec; take: number[] };

// ───────────────────────────── equality & sorting (Units 9–10) ─────────────────────────────

/** One side of a number sentence: `a + b`, or a single value. */
export interface TermSpec {
  a: number;
  op?: '+' | '−';
  b?: number;
}

/** One clue in a balance puzzle: `unknownCount` unknowns on one pan, `known` on the other. */
export interface PuzzleClue {
  unknownCount: number;
  known: number;
  onLeft?: boolean;
}

/** A sortable object, by its attributes. The attributes decide every group it belongs to. */
export interface SortObjSpec {
  id: string;
  colour: 'red' | 'blue' | 'yellow';
  kind: 'circle' | 'triangle' | 'square' | 'rectangle';
  size: 'small' | 'large';
  label?: string;
}

/** The attributes a collection can be sorted by. */
export type SortAttr = 'colour' | 'kind' | 'size';

/** One clue in a classification puzzle: an attribute equals (or does not equal) a value. */
export interface PuzzleClue2 {
  attr: SortAttr;
  value: string;
  negate?: boolean;
}

/** A picture chart: one row per category, one symbol per thing counted. */
export interface ChartSpecData {
  glyph: 'star' | 'apple' | 'fish' | 'ball' | 'circle';
  rows: Array<{ label: string; count: number }>;
}

// ───────────────────────────── shapes (Unit 5) ─────────────────────────────

/** A whole shape: a circle or square (100 × 100) or a rectangle (150 × 100), in drawing units. */
export type ShapeKind = 'circle' | 'square' | 'rect';
/**
 * A straight dividing line through two points, written as fractions of the shape's width and
 * height: `[x1, y1, x2, y2]`. The line is infinite; where it crosses the shape is what divides it.
 */
export type Cut = [number, number, number, number];
/** How the whole looks: a plain shape or a familiar object. Looks never change the sizes of the pieces. */
export type SkinId = 'plain' | 'chocolate' | 'cookie' | 'paper' | 'sandwich' | 'pizza';
/** A shape and the lines that divide it. The pieces, and whether they are equal, are computed from this. */
export interface ShapeSpec {
  shape: ShapeKind;
  cuts: Cut[];
  skin?: SkinId;
  /** Colours of plain pieces: all different (default), all alike, or alternating. Colour never says what is equal. */
  tone?: 'varied' | 'same' | 'alt';
}
/** What a picture of a shape shows. `mixed`: pieces taken from two different shapes. */
export type ShapeView = 'whole' | 'cut' | 'apart' | 'mixed';
export interface ShapeItem extends ShapeSpec {
  view?: ShapeView;
  /** Show only these pieces (numbered from 1 in reading order: top to bottom, left to right). */
  take?: number[];
  /** Draw these pieces as empty dashed outlines (a gap to fill). */
  ghost?: number[];
  /** Highlight these pieces (with an outline and a tick, not only colour). */
  mark?: number[];
  numbers?: boolean;
  /** For `mixed`: the second shape and the pieces of it that are shown. */
  mix?: ShapeSpec & { take: number[] };
}
/** The question asked about a divided shape. */
export type DivisionRule = 'equal' | 'halves' | 'quarters';

export type Glyph = 'star' | 'apple' | 'fish' | 'ball';
/** Drawn objects, or plain counters (discs). */
export type CounterGlyph = Glyph | 'counter';
export type ObjectLayout = 'rows' | 'scatter';

/** Something drawn next to a question. Purely visual: it is never the answer control. */
export type VisualSpec =
  /** `null` is the hidden number. `arrows` labels the step between neighbours, e.g. `+1`. */
  | { type: 'sequence'; items: Array<number | null>; arrows?: string }
  /** A number as groups of ten and single objects. */
  | { type: 'quantity'; tens: number; ones: number }
  | { type: 'line'; min: number; max: number; labelled?: number[]; marker?: number; hops?: number[] }
  /** A collection of drawn objects. `markable` lets the student tap objects to keep track while counting. */
  | { type: 'objects'; count: number; glyph: Glyph; layout: ObjectLayout; seed?: number; markable?: boolean; known?: number }
  /** Counters on a ten-frame (two frames above ten); `size: 5` draws a five-frame. `second` adds ring counters (the other part). */
  | { type: 'ten-frame'; count: number; second?: number; size?: 5 | 10 }
  /**
   * Two quantities side by side (`a` is group ა, `b` is group ბ).
   * `objects`: pictures only. `numbers`: numerals only. `line`: both on a number line.
   * `pairs`: pictures matched one-to-one with the extras marked.
   */
  | { type: 'compare'; a: number; b: number; view: 'objects' | 'numbers' | 'line' | 'pairs'; glyph?: Glyph }
  /** A whole split into two parts; `part` is shown, the other part is hidden. `split` draws the whole as counters with the shown part marked; `plain` draws the whole only. */
  | { type: 'part-whole'; whole: number; part: number; counters?: 'split' | 'plain' }
  /**
   * A number-bond diagram: the whole on top, two parts underneath. `null` is a hidden
   * number (drawn as ?). `counters` adds a frame of counters: `split` marks the
   * first part with solid counters and the rest as rings, `plain` shows the whole only.
   */
  | { type: 'bond'; whole: number | null; a: number | null; b: number | null; counters?: 'split' | 'plain' }
  /** Two groups of counters or objects, each in its own box; the whole is not shown. */
  | { type: 'parts'; a: number; b: number; glyph?: CounterGlyph; palette?: 'plain' | 'redblue' }
  /**
   * A number line with the start flagged and `count` jumps drawn forward (adding) or back
   * (subtracting). `hideLanding` leaves the number where the jumps end blank (drawn as ?).
   */
  | { type: 'jump-line'; direction: 'forward' | 'back'; min: number; max: number; from: number; count: number; hideLanding?: boolean }
  /**
   * A story picture: `first` objects. `join`: `change` more objects arrive (dashed outline).
   * `separate`: `change` of the objects leave (dashed outline, struck through). The result is never shown.
   */
  | { type: 'story'; glyph: Glyph; first: number; change: number; mode: 'join' | 'separate' }
  /** A shape or object, whole, divided, or with its pieces apart. */
  | ({ type: 'shape' } & ShapeItem)
  /** One or more objects drawn to scale, one above the other; `align` marks a common starting line. */
  | { type: 'length'; objects: LengthObject[]; align?: boolean; showCm?: boolean }
  /** A clock face, with or without its hands, at a given time. */
  | { type: 'clock'; time: ClockTime; showHands?: boolean; labels?: number[] }
  /** One or more 2D shapes side by side, drawn from their outlines. */
  | { type: 'flat'; shapes: FlatSpec[]; showSides?: boolean }
  /** A balance scale with fixed weights on its pans. The beam is drawn from the two totals. */
  | { type: 'scale'; left: number[]; right: number[]; unit?: string }
  /** Two groups of objects side by side, each labelled with its count. */
  | { type: 'groups'; a: number; b: number; glyph?: Glyph }
  /** A number sentence shown with its sign, for "is this true?" questions. */
  | { type: 'sentence'; left: TermSpec; right: number }
  /** A picture chart, with one symbol per thing counted. */
  | { type: 'chart'; glyph: ChartSpecData['glyph']; rows: Array<{ label: string; count: number }> }
  /** Objects sorted into named groups, already arranged — for "what is the rule?" questions. */
  | { type: 'sorted-groups'; attr: SortAttr; groups: Array<{ value: string; objects: SortObjSpec[] }> }
  /** Two overlapping circles with objects already placed, for reading a diagram. */
  | { type: 'venn'; leftLabel: string; rightLabel: string; regions: Array<{ region: 'both' | 'left' | 'right' | 'none'; objects: SortObjSpec[] }> }
  /** Place-value blocks (hundreds flats, tens rods, ones cubes), drawn from what they are worth. */
  | { type: 'place-blocks'; hundreds: number; tens: number; ones: number }
  /** A three-digit number with one place covered by a card, so the student reads what is still shown. */
  | { type: 'place-cards'; value: number; hide?: Place }
  /** A number sentence in expanded form, e.g. `300 + 40 + 5 = 345`. */
  | { type: 'expanded'; value: number; hide?: Place }
  /** The landings of a skip-count on a number line, with the character's stops named. */
  | { type: 'skip-line'; start: number; step: number; count: number; hideLandings?: boolean; walker?: 'rabbit' | 'frog' | 'kangaroo' }
  /** The same skip-count counted in groups of objects, with the running total beside each group. */
  | { type: 'group-count'; size: number; groups: number; noun?: string }
  /** Two two-digit numbers written in columns, with the answer shown (and the carry / broken ten named). */
  | { type: 'columns'; a: number; b: number; op: 'add' | 'subtract' }
  /** A story problem's numbers drawn as tens rods and ones cubes. */
  | { type: 'story-model'; kind: 'join' | 'separate' | 'compare'; a: number; b: number; unit: string }
  /** Equal groups of counters, each labelled with its count. */
  | { type: 'groups-equal'; groups: number; each: number }
  /** Groups that are deliberately not equal, for "which are equal?" questions. */
  | { type: 'groups-uneven'; sizes: number[] }
  /** A rectangular array of counters. */
  | { type: 'array'; rows: number; cols: number }
  /** Repeated addition and the matching multiplication, written out. */
  | { type: 'repeated'; groups: number; each: number }
  /** A row of the times table filled up to `upTo` facts, with its skip-count underneath. */
  | { type: 'table-row'; table: number; upTo: number; filled?: number; caption?: string }
  /** A grid of products — the times-table square, or part of it — with some cells highlighted. */
  | { type: 'times-grid'; tables: number[]; factors: number[]; highlight?: Array<{ table: number; factor: number }>; caption?: string }
  /** A divided shape with some parts taken, for a fractions picture. */
  | { type: 'shape-parts'; shape: ShapeSpec; take?: number[]; caption?: string }
  /** A quantity shared among characters: what each receives, and what is left. */
  | { type: 'share'; total: number; people: number; glyph?: Glyph; caption?: string };


/** Feedback aimed at one specific wrong answer. */
export interface Misconception {
  id: string;
  /**
   * Wrong answers this explanation is for. Choice: option ids. Numeric: the
   * number. Expression: any algebraically equivalent spelling. Blanks: the
   * values joined by commas, e.g. `"5,6"`.
   */
  answers: Array<string | number>;
  feedback: string;
}

export interface Question {
  response: ResponseSpec;
  /** Shown one at a time, from the gentlest to the most direct. */
  hints: string[];
  /** The key insight, shown after a correct answer or when the answer is revealed. */
  explanation: string;
  misconceptions?: Misconception[];
  /** Used when no misconception matches. */
  fallbackFeedback?: string;
  /** Shown instead of the generic message when the answer is not finished yet (e.g. counters still unplaced). */
  incompleteFeedback?: string;
  /** Attempts before the question is closed. Defaults by stage (see `attempt.ts`). */
  maxAttempts?: number;
  /**
   * When attempts run out: reveal the answer (default) or only show the
   * explanation. Challenge questions use `false` — the answer comes later.
   */
  revealOnExhaust?: boolean;
}

/** Short lines Axi can say. All optional — `dialogue.ts` supplies neutral defaults. */
export interface MascotLines {
  intro?: string;
  discovery?: string;
}

interface ActivityBase {
  id: string;
  stage: Stage;
  /** Optional small heading above the prompt. */
  title?: string;
  prompt: string;
  mascot?: MascotLines;
}

export interface QuestionActivity extends ActivityBase, Question {
  kind: 'question';
  visual?: VisualSpec;
}

export interface TileGroup {
  /** The tile's label, e.g. `x`. */
  label: string;
  count: number;
  tone: 'blue' | 'yellow';
}
/** Genuinely interactive: the student moves tiles into one group, then answers. */
export interface TilesActivity extends ActivityBase, Question {
  kind: 'tiles';
  tiles: TileGroup[];
  /** Asked once every tile is grouped. */
  askPrompt: string;
}

/** Free exploration tools. Nothing here is graded. */
export type ExploreTool =
  /** A row of numbered tiles with a highlighted number and forward / backward arrows. */
  | { tool: 'tile-walk'; from: number; to: number; start: number }
  /** Numeral, number name and quantity shown side by side. */
  | { tool: 'representations'; numbers: number[] }
  /** Sequences the student extends one number at a time. */
  | { tool: 'sequence-extend'; sequences: Array<{ label: string; start: number; step: number; shown: number; total: number }> }
  /** A number line to tap, drag and step along. */
  | { tool: 'number-line'; min: number; max: number; start: number }
  /** A number line where each tap hops by the chosen step. */
  | { tool: 'skip-line'; min: number; max: number; steps: number[] }
  /** Tap objects to count them once each. `counts` are the collections to choose from; `layouts` the arrangements. */
  | { tool: 'count-objects'; glyph: Glyph; counts: number[]; layouts: Array<{ layout: ObjectLayout; seed?: number }> }
  /** Numeral, number name and groups, plus a tray to add and remove objects. `names[n]` is the name of n. */
  | { tool: 'number-builder'; max: number; start: number; names: Record<number, string>; glyph: Glyph }
  /** Two groups to adjust, pair up, or show on a number line. */
  | { tool: 'compare'; max: number; start: [number, number]; glyph: Glyph }
  /** Place number tiles on a number line and read them left to right. */
  | { tool: 'order-line'; min: number; max: number; tiles: number[] }
  /** Move counters between two boxes; the total never changes. `targets` are shown one after another. */
  | { tool: 'split'; targets: number[]; frame?: boolean }
  /**
   * A number bond over two boxes of counters. The student picks a whole in `wholes` (min, max),
   * moves counters between the parts, joins them into one group and resets.
   * `start` is the whole and the counters in part one shown first.
   */
  | { tool: 'bond-split'; wholes: [number, number]; start: { whole: number; a: number } }
  /**
   * A five- or ten-frame whose counters belong to one of two groups; tapping a counter moves it
   * to the other group. `start` counters are in the first group. `reveal` adds a control that
   * shows an untried pair (after the student has found `revealAfter`). `hideRest` lets the student
   * hide the second group, leaving empty spaces.
   */
  | { tool: 'frame-pairs'; size: 5 | 10; start: number; reveal?: boolean; revealAfter?: number; hideRest?: boolean; startHidden?: boolean }
  /** Find a hidden part by marking the known part and counting what is left. */
  | { tool: 'missing-part'; glyph: Glyph; examples: Array<{ whole: number; known: number; seed?: number }> }
  /**
   * Stories about two groups. `whole`: both groups are given, find the whole.
   * `part`: the whole and one group are given, find the other group. Objects are moved into two groups.
   */
  | { tool: 'story-bond'; glyph: Glyph; stories: Array<{ kind: 'whole' | 'part'; label: string; text: string; a: number; b: number }> }
  /**
   * A number line with objects. Forward: a + b, the student picks which number to start from and how
   * many jumps to make; the marker hops one step at a time. Back: a − b, start at a and hop back.
   */
  | { tool: 'jump-line'; direction: 'forward' | 'back'; min: number; max: number; glyph: Glyph; examples: Array<{ a: number; b: number }> }
  /** A ten-frame with the first group in it and the second group beside it; move counters in to make 10. */
  | { tool: 'make-ten'; examples: Array<{ a: number; b: number }> }
  /**
   * Two activities: `doubles` (match a second group to the first, then join them) and `near`
   * (two groups that differ by one: find the equal groups and the extra counter). `max` is the largest group.
   */
  | { tool: 'doubles-lab'; max: number; doubles: number[]; near: number[] }
  /** Story problems the student acts out (add or remove objects) and then writes as + or −. */
  | { tool: 'story-workspace'; stories: Array<{ mode: 'join' | 'separate'; glyph: Glyph; text: string; first: number; change: number }> }
  /** Wholes that fall apart into pieces and are put back together (tap or drag the pieces home). */
  | { tool: 'parts-lab'; examples: Array<{ label: string; spec: ShapeSpec }> }
  /** Divided shapes: tap two parts to lay one on the other, and sort divided shapes into equal and unequal. */
  | { tool: 'compare-lab'; examples: Array<{ label: string; spec: ShapeSpec }>; sort: ShapeItem[] }
  /** Divide a shape by tapping dots on its edge; see the parts and compare them. `shapes` are tried one at a time. */
  | { tool: 'cut-lab'; shapes: Array<{ label: string; shape: ShapeKind; skin?: SkinId }> }
  /**
   * Halves (`parts` 2) or quarters (`parts` 4): a whole is divided in front of the student, the parts are picked out one
   * by one and put back together; `unequal` pictures have the right number of pieces but not equal ones.
   */
  | { tool: 'fraction-lab'; parts: 2 | 4; examples: Array<{ label: string; spec: ShapeSpec }>; unequal: Array<{ label: string; spec: ShapeSpec }> }
  /** Two objects to slide to a common starting line, then compare. */
  | { tool: 'length-lab'; pairs: Array<{ label: string; a: LengthObject; b: LengthObject }> }
  /** Objects to sort into longer / shorter / the same length as the reference. */
  | { tool: 'length-sort-lab'; reference: LengthObject; items: LengthObject[] }
  /** Measure an object with different-sized units: the count changes, the object does not. */
  | { tool: 'units-lab'; objects: Array<{ label: string; object: LengthObject }>; units: Array<{ cm: number; name: string }> }
  /** Slide a ruler under objects, line up the zero, and see the reading change. */
  | { tool: 'ruler-lab'; objects: Array<{ label: string; object: LengthObject }> }
  /** A metre strip beside a centimetre scale, and objects to measure in centimetres or metres. */
  | { tool: 'metre-lab'; items: LengthItem[]; demoCm: number[] }
  /** Move the hands freely and watch the hour hand creep as the minutes pass. */
  | { tool: 'clock-lab'; start: ClockTime; times: ClockTime[] }
  /** Set clocks to asked times and read them back, at the unit's step. */
  | { tool: 'time-set-lab'; times: ClockTime[]; step: 1 | 5 | 30 }
  /** Match analog faces to digital displays. */
  | { tool: 'time-match-lab'; pairs: Array<{ time: ClockTime }> }
  /** Count round the face by fives and watch the minutes add up. */
  | { tool: 'five-minute-lab'; start: ClockTime }
  /** A collection of shapes to identify, count and sort; tap a side or a corner to count it. */
  | { tool: 'flat-lab'; shapes: FlatSpec[] }
  /** An illustrated room: tap the objects that have the asked shape. */
  | { tool: 'room-lab'; target: Flat; items: Array<{ id: string; label: string; spec: FlatSpec }> }
  /** Weights to put on two pans freely, with the totals and the difference always shown. */
  | { tool: 'balance-lab'; weights: number[]; start?: { left: number[]; right: number[] }; unit?: string }
  /** Two groups of objects to add to or take from, watching the comparison sign change. */
  | { tool: 'equal-groups-lab'; start: { a: number; b: number }; glyph?: Glyph; max?: number }
  /** Number cards and signs to build any sentence, and see whether it is true. */
  /** Cards and signs to build `a op b = result` and see whether the sentence holds. */
  | { tool: 'sentence-lab'; cards: number[]; signs: Array<'+' | '−'>; result: number }
  /** Balance puzzles to work through, one at a time. */
  | { tool: 'puzzle-lab'; puzzles: Array<{ unknown: string; clues: PuzzleClue[]; answer: number }> }
  /** A collection to sort by any of its attributes, one at a time. */
  | { tool: 'sort-lab'; objects: SortObjSpec[]; attrs: SortAttr[] }
  /** A two-way grid to fill in, with the attributes of each axis chosen by the student. */
  | { tool: 'grid-lab'; objects: SortObjSpec[]; rowAttr: SortAttr; colAttr: SortAttr; rows: string[]; cols: string[] }
  /** Two overlapping circles to sort into; the student can switch which pair of groups the circles mean. */
  | { tool: 'venn-lab'; objects: SortObjSpec[]; pairs: Array<{ leftAttr: SortAttr; leftValue: string; rightAttr: SortAttr; rightValue: string }> }
  /** Build a picture chart symbol by symbol and read the counts back. */
  | { tool: 'chart-lab'; glyph: ChartSpecData['glyph']; labels: string[]; target?: number[] }
  /** Put hundreds flats, tens rods and ones cubes on the mat and read the value back, with an exchange control. */
  | { tool: 'place-lab'; start?: { hundreds: number; tens: number; ones: number }; max?: number; allowRegroup?: boolean }
  /** Tap a digit of a three-digit number to light up its place and show what it is worth. */
  | { tool: 'digit-lab'; numbers: number[] }
  /** Split a number into its three place-value cards, or put the cards back together. */
  | { tool: 'expanded-lab'; numbers: number[] }
  /** Hide one place of a number, read the two that are shown, and work out the hidden value. */
  | { tool: 'missing-place-lab'; numbers: number[]; places: Place[] }
  /**
   * A character hops along a number line by the chosen step; each landing is highlighted and the running rule is shown.
   * `start` is where the character stands first, `steps` the steps to offer, `landings` how many hops to allow.
   */
  | { tool: 'skip-lab'; start: number; steps: number[]; landings: number; walker?: 'rabbit' | 'frog' | 'kangaroo' }
  /** Add or remove groups of ten and watch the number (and its tens/hundreds digits) change. */
  | { tool: 'ten-groups-lab'; start: number; groups: number; step: 10 }
  /** Put hundreds blocks down and jump along a line by one hundred at a time. */
  | { tool: 'hundred-lab'; start: number; groups: number }
  /** A sequence with blanks to fill; the rule can be asked for first, then used. */
  | { tool: 'pattern-lab'; patterns: Array<{ start: number; step: number; count: number; holes: number[] }> }
  /** Put both numbers on one mat and watch the sum, with the exchange offered exactly when ten ones appear. */
  | { tool: 'add-lab'; examples: Array<{ a: number; b: number }> }
  /** Take the second number off the mat; a ten has to be broken when the ones are too small. */
  | { tool: 'subtract-lab'; examples: Array<{ a: number; b: number }> }
  /** Build a two-digit sum or difference in columns and see when a carry or a broken ten is needed. */
  | { tool: 'columns-lab'; examples: Array<{ a: number; b: number; op: 'add' | 'subtract' }> }
  /** Read a story, act it out, choose the operation and check the answer. */
  | { tool: 'story-lab'; stories: Array<{ kind: 'join' | 'separate' | 'compare'; text: string; a: number; b: number; unit: string }> }
  /** Move counters between groups until they are all equal; `each` is the count a real group should hold. */
  | { tool: 'groups-equal-lab'; each: number; sizes?: number[] }
  /** Add one group at a time and watch the repeated addition grow. */
  | { tool: 'repeat-lab'; each: number; maxGroups: number }
  /** Change the groups and what is in each; picture, repeated addition and multiplication update together. */
  | { tool: 'multiply-lab'; start: { groups: number; each: number }; maxGroups: number; maxEach: number }
  /** Arrange counters into rows and columns, then turn the array. */
  | { tool: 'array-lab'; start: { rows: number; cols: number }; max: number }
  /** Illustrated group/array problems: choose a model and calculate the total. */
  | { tool: 'group-story-lab'; stories: Array<{ text: string; groups: number; each: number; unit: string }> }
  /** Build pairs of objects; the total and the skip-count grow with each pair. */
  | { tool: 'pairs-lab'; maxGroups: number }
  /** A times table built fact by fact, by adding groups or by jumping the skip-count. */
  | { tool: 'times-table-lab'; table: number; upTo: number }
  /** Double a group and double it again, so ×4 is two doublings. */
  | { tool: 'double-double-lab'; start: number; upTo: number }
  /** Arrange objects in groups of five and count on in fives. */
  | { tool: 'count-by-five-lab'; upTo: number }
  /** The times-table grid: highlight related facts and work through the challenges. */
  | { tool: 'times-grid-lab'; tables: number[]; factors: number[] }
  /** Give objects to characters one at a time and see when everyone has the same. */
  | { tool: 'share-lab'; total: number; people: number; glyph?: Glyph }
  /** Drop objects into containers and watch them become equal. */
  | { tool: 'share-groups-lab'; total: number; groups: number; glyph?: Glyph }
  /** Read a share as a division sentence, and watch the numbers fill it in. */
  | { tool: 'division-lab'; total: number; people: number; glyph?: Glyph }
  /** Fill containers of a fixed capacity and count the complete ones, with the leftovers. */
  | { tool: 'group-into-lab'; total: number; size: number; glyph?: Glyph }
  /** Build equal groups, then turn the same model round into a division fact. */
  | { tool: 'family-lab'; a: number; b: number }
  /** Divide a whole into equal parts and pick them out one by one. */
  | { tool: 'equal-parts-lab'; parts: number; shapes: ShapeKind[] }
  /** Split shapes into two equal parts, in more than one orientation. */
  | { tool: 'halves-lab'; shapes: ShapeKind[] }
  /** Divide a whole into four equal parts, in more than one way. */
  | { tool: 'quarters-lab'; shapes: ShapeKind[] }
  /** Divide a whole into three equal parts, and compare equal with unequal thirds. */
  | { tool: 'thirds-lab'; shapes: ShapeKind[] }
  /** Pick parts of a divided shape and watch the numerator and denominator change. */
  | { tool: 'fraction-lab2'; shapes: Array<{ shape: ShapeKind; parts: number }> };


export interface ExploreActivity extends ActivityBase {
  kind: 'explore';
  tool: ExploreTool;
  /** Optional nudges Axi gives when asked, one at a time. */
  hints?: string[];
}

export type ExplainBlock =
  | { type: 'text'; text: string }
  | { type: 'equation'; lines: string[]; caption?: string }
  | { type: 'worked'; title: string; steps: Array<{ text: string; math?: string }> }
  | { type: 'callout'; tone: 'tip' | 'warning'; text: string }
  /** Numbers joined by equal steps; a highlight walks along them (with replay). `label` is the step, e.g. `+1`. */
  | { type: 'chain'; numbers: number[]; label: string; direction: 'forward' | 'backward' | 'steps'; caption?: string }
  /** A marker hops from `from` to `to` on a number line, one step at a time (with replay). */
  | { type: 'hops'; min: number; max: number; from: number; to: number; step?: number; caption?: string }
  /** Numerals shown as digits, a number name and groups of ten and ones. */
  | { type: 'quantities'; numbers: number[] }
  /** Objects highlighted one at a time while a counter grows; then the same amount arranged differently. */
  | { type: 'count-demo'; glyph: Glyph; count: number; caption?: string; second?: { layout: ObjectLayout; seed?: number } }
  /** Two numbers compared; `symbol` adds the sign (< > =) with its words. */
  | { type: 'compare'; a: number; b: number; view: 'objects' | 'numbers' | 'line' | 'pairs'; glyph?: Glyph; symbol?: boolean; caption?: string }
  /** A highlight walks along a number line, tile by tile, in the order given. */
  | { type: 'order-demo'; min: number; max: number; numbers: number[]; direction: 'asc' | 'desc'; caption?: string }
  /** A whole splits into two parts and the parts come back together. */
  | { type: 'compose'; whole: number; parts: [number, number]; caption?: string }
  /**
   * Counters shown as two parts that join into the whole (`join`), or a whole of which a known part is
   * set aside, leaving the missing part (`missing`; `parts[0]` is the known part). The number bond appears
   * on the last step. `frame` joins them inside a five- or ten-frame.
   */
  | { type: 'bond-demo'; mode: 'join' | 'missing'; whole: number; parts: [number, number]; frame?: 5 | 10; story?: string; palette?: 'plain' | 'redblue'; caption?: string }
  /**
   * Counting on (`on`, from + count) or counting back (`back`, from − count): the start is flagged, then the
   * marker hops one jump at a time while objects join (or leave). `steps` are the four numbered steps of the
   * strategy; the one that is happening is highlighted.
   */
  | { type: 'jump-demo'; mode: 'on' | 'back'; from: number; count: number; min: number; max: number; glyph: Glyph; steps: [string, string, string, string]; caption?: string }
  /**
   * Making ten: `a` counters in the frame, `b` waiting. Find how many more make 10, split `b`, move that many in,
   * join the ten with what is left. `steps` has four texts: need, split, join, total unchanged.
   */
  | { type: 'ten-demo'; a: number; b: number; steps: [string, string, string, string]; caption?: string }
  /**
   * Two groups paired one-to-one. Equal groups (a = b): pair them, then join. Groups that differ by one: pair them,
   * mark the extra counter, then join. `steps` has one text per frame (3 for doubles, 4 for near doubles).
   */
  | { type: 'doubles-demo'; a: number; b: number; steps: string[]; caption?: string }
  /** A story solved in seven steps, with the picture, the operation and the check appearing one by one. `steps` has seven texts. */
  | { type: 'story-demo'; mode: 'join' | 'separate'; glyph: Glyph; first: number; change: number; text: string; steps: string[]; caption?: string }
  /**
   * A shape story told one step at a time, with `steps` as the captions. `whole-parts` (4): whole, parts apart, parts back,
   * parts that are not equal. `compare` (5): the divided shape, one part, another part, one laid on the other, the same for
   * `contrast`. `cut` (5): whole, line, parts, parts compared, an unequal division. `half` (6) and `quarter` (6): whole, the equal
   * parts, one part, the next, all together, and the same number of parts that are not equal (`contrast`).
   */
  | { type: 'shape-demo'; mode: 'whole-parts' | 'compare' | 'cut' | 'half' | 'quarter'; shape: ShapeSpec; contrast: ShapeSpec; steps: string[]; caption?: string }
  /**
   * A length story told one step at a time (`steps` are the captions). `align` (4): two objects apart, moved to a
   * common start, compared, and the difference named. `units` (4): an object, units laid along it, the count, and
   * the same object measured with another unit. `ruler` (4): the object, the ruler, the zero lined up, the reading.
   * `metre` (4): a centimetre, a hundred of them, a pencil and a ladder, and which unit suits each.
   */
  | { type: 'measure-demo'; mode: 'align' | 'units' | 'ruler' | 'metre'; a: LengthObject; b: LengthObject; steps: string[]; unitCm?: number; caption?: string }
  /** Objects drawn at their real lengths, for a static comparison in an explanation. */
  | { type: 'length'; objects: LengthObject[]; align?: boolean; showCm?: boolean }
  /** A clock face shown in an explanation, at a fixed time. */
  | { type: 'clock'; time: ClockTime; showHands?: boolean }
  /** Shapes shown side by side in an explanation; `showSides` numbers their sides. */
  | { type: 'flat'; shapes: FlatSpec[]; showSides?: boolean }
  /**
   * A clock story told one step at a time (`steps` are the captions). `hands` (4): the face, the short hand, the
   * long hand, both together. `oclock` (4): the minute hand at 12, the hour hand on a number, the time read, two
   * o'clock times. `half` (4): half past, the minute hand at 6, the hour hand between two numbers, the time read.
   * `five` (5): a full turn is sixty minutes, the five-minute marks, counting round, and the time read.
   */
  | { type: 'clock-demo'; mode: 'hands' | 'oclock' | 'half' | 'five'; time: ClockTime; times?: ClockTime[]; steps: string[]; caption?: string }
  /** A shape story told one step at a time: the outline, the sides, the corners, or the same shape turned. */
  | { type: 'shape2d-demo'; mode: 'sides' | 'corners' | 'turn'; spec: FlatSpec; contrast?: FlatSpec; steps: string[]; caption?: string }
  /**
   * A balance story told one step at a time. `level` (4): two equal pans, the beam level, the equals sign between
   * them, and the same total written two ways. `tilt` (4): an unequal pair, which side is heavier, what to add, and
   * the moment it levels. `solve` (4): a blank in a sentence, the same sentence as a scale, the missing amount, and
   * the sentence completed.
   */
  | { type: 'balance-demo'; mode: 'level' | 'tilt' | 'solve'; left: number[]; right: number[]; add?: number; sentence?: { left: TermSpec; right: number; blank: 'first' | 'second' | 'total' }; steps: string[]; caption?: string }
  /**
   * A sorting story: `one` (4) sorts a collection by one attribute, `two` (4) builds a two-way grid, `venn` (4) moves
   * the same objects into two overlapping circles (both, only one, neither). `attr` and `second` say which attributes.
   */
  | { type: 'sort-demo'; mode: 'one' | 'two' | 'venn'; attr: SortAttr; second?: SortAttr; objects: SortObjSpec[]; leftValue?: string; rightValue?: string; steps: string[]; caption?: string }
  /** A picture chart shown as it grows: one symbol per step, then read back. */
  | { type: 'chart-demo'; glyph: ChartSpecData['glyph']; rows: Array<{ label: string; count: number }>; steps: string[]; caption?: string }
  /** Pictures that are also useful in an explanation: a scale, two groups, a sentence, a chart, sorted groups, a diagram. */
  | { type: 'scale'; left: number[]; right: number[]; unit?: string }
  | { type: 'groups'; a: number; b: number; glyph?: Glyph }
  | { type: 'sentence'; left: TermSpec; right: number }
  | { type: 'chart'; glyph: ChartSpecData['glyph']; rows: Array<{ label: string; count: number }> }
  | { type: 'sorted-groups'; attr: SortAttr; groups: Array<{ value: string; objects: SortObjSpec[] }> }
  | { type: 'venn'; leftLabel: string; rightLabel: string; regions: Array<{ region: 'both' | 'left' | 'right' | 'none'; objects: SortObjSpec[] }> }
  /** A static picture of blocks: a value shown as hundreds flats, tens rods and ones cubes. */
  | { type: 'place-blocks'; hundreds: number; tens: number; ones: number; caption?: string }
  /** A number's three place cells, with one place optionally covered. */
  | { type: 'place-cards'; value: number; hide?: Place; caption?: string }
  /** Just the expanded form of a number, e.g. `300 + 40 + 5 = 345`, with one place optionally hidden. */
  | { type: 'expanded'; value: number; hide?: Place; caption?: string }
  /**
   * A place-value story told one step at a time (`steps` are the captions). `regroup` (4): ten ones, the exchange, one
   * ten, the value unchanged. `expand` (4): the blocks, the digits, the expanded form, the standard number.
   * `digit` (4): the number, the digit tapped, its place, what that digit is worth. `build` (4): the target, the
   * hundreds, the tens and ones, the number made.
   */
  | { type: 'place-demo'; mode: 'regroup' | 'expand' | 'digit' | 'build'; value: number; place?: Place; steps: string[]; caption?: string }
  /** A sequence with blank places, for a static picture in an explanation. */
  | { type: 'sequence'; items: Array<number | null>; arrows?: string; caption?: string }
  /** The landings of a skip-count on a number line, for a static picture in an explanation. */
  | { type: 'skip-line'; start: number; step: number; count: number; hideLandings?: boolean; walker?: 'rabbit' | 'frog' | 'kangaroo'; caption?: string }
  /** Groups counted by a step, with the running total beside each group. */
  | { type: 'group-count'; size: number; groups: number; noun?: string; caption?: string }
  /**
   * A skip-count story told one step at a time (`steps` are the captions). `forward` (4): the start, the first hop, the
   * rule, the pattern. `backward` (4): the start, the first hop back, the rule, the same numbers in reverse.
   */
  | { type: 'skip-demo'; mode: 'forward' | 'backward'; start: number; step: number; count: number; walker?: 'rabbit' | 'frog' | 'kangaroo'; steps: string[]; caption?: string }
  /** Two two-digit numbers in columns, answered or not, with the carry or broken ten named. */
  | { type: 'columns'; a: number; b: number; op: 'add' | 'subtract'; showAnswer?: boolean; caption?: string }
  /** A story problem's numbers drawn as blocks, for a static picture. */
  | { type: 'story-model'; kind: 'join' | 'separate' | 'compare'; a: number; b: number; unit: string; caption?: string }
  /**
   * A two-digit sum told one step at a time. `carry` (4): the ones, ten or more, the carried ten, the sum. `plain` (4):
   * the ones, less than ten, the tens, the sum.
   */
  | { type: 'sum-demo'; mode: 'carry' | 'plain'; a: number; b: number; steps: string[]; caption?: string }
  /**
   * A two-digit difference told one step at a time. `borrow` (5): the ones that are too small, the ten broken, the ones
   * subtracted, the tens subtracted, the answer checked by adding. `plain` (4): the ones, the tens, the answer, the check.
   */
  | { type: 'difference-demo'; mode: 'borrow' | 'plain'; a: number; b: number; steps: string[]; caption?: string }
  /** A story problem acted out one frame at a time, ending on the number sentence. */
  | { type: 'story-demo2'; kind: 'join' | 'separate' | 'compare'; a: number; b: number; text: string; unit: string; steps: string[]; caption?: string }
  /** Groups appearing one at a time with the repeated addition growing beside them. */
  | { type: 'groups-demo'; groups: number; each: number; equal?: boolean; steps: string[]; caption?: string }
  /** An array read by rows, then by columns, then turned: the total never changes. */
  | { type: 'array-demo'; rows: number; cols: number; steps: string[]; caption?: string }
  /** The picture, the repeated addition, the multiplication and the total, one at a time. */
  | { type: 'four-ways'; groups: number; each: number; caption?: string }
  /** Equal groups as a static picture in an explanation. */
  | { type: 'groups-equal'; groups: number; each: number; caption?: string }
  /** Groups that are not all equal, for an explanation about what "equal" excludes. */
  | { type: 'groups-uneven'; sizes: number[]; caption?: string }
  /** A rectangular array as a static picture. */
  | { type: 'array'; rows: number; cols: number; caption?: string }
  /** Repeated addition and the matching multiplication, written out. */
  | { type: 'repeated'; groups: number; each: number; caption?: string }  
  /** The table walked one fact at a time, the products appearing as the skip-count advances. */
  | { type: 'table-demo'; table: number; upTo: number; steps: string[]; caption?: string }
  /** Doubling twice: a group, its double, and its double again — which is the four times table. */
  | { type: 'double-demo'; each: number; factor: number; steps: string[]; caption?: string }
  /** A skip-count by a table, one landing at a time, with the running rule. */
  | { type: 'count-by-demo'; table: number; count: number; steps: string[]; caption?: string }
  /** A fair share, or a grouping, walked one object at a time. */
  | { type: 'share-demo'; mode: 'share' | 'group'; total: number; people: number; steps: string[]; caption?: string }
  /** A whole cut into equal parts in front of the student, with the fraction written underneath. */
  | { type: 'fraction-demo'; shape: ShapeKind; parts: number; take: number; steps: string[]; caption?: string }
  /** A share written out as equal groups, for a static picture in an explanation. */
  | { type: 'share'; total: number; people: number; glyph?: Glyph; caption?: string }
  /** A row of the times table, for a static picture in an explanation. */
  | { type: 'table-row'; table: number; upTo: number; filled?: number; caption?: string }
  /** A grid of products with some cells highlighted, for a static picture in an explanation. */
  | { type: 'times-grid'; tables: number[]; factors: number[]; highlight?: Array<{ table: number; factor: number }>; caption?: string }
  /** A divided shape with some parts picked, for a static picture in an explanation. */
  | { type: 'shape-parts'; shape: ShapeSpec; take?: number[]; caption?: string };


export interface ExplainActivity extends ActivityBase {
  kind: 'explain';
  blocks: ExplainBlock[];
}

export type Activity = QuestionActivity | TilesActivity | ExplainActivity | ExploreActivity;

export interface Lesson {
  /** Catalog lesson id, e.g. `g6-u10-l3`. The title comes from the catalog. */
  id: string;
  status: ContentStatus;
  /** One clear primary learning objective. */
  objective: string;
  /** Concepts the student should already know. */
  prerequisites: string[];
  /** Rough duration, for display only. */
  minutes?: number;
  /** Skills named on the completion screen. */
  concepts?: string[];
  activities: Activity[];
  completion: {
    /** Independent-check questions that must be answered correctly (within the allowed attempts). */
    minCheckCorrect: number;
  };
  mascot?: {
    complete?: string;
    retry?: string;
  };
}

// ───────────────────────────── answers ─────────────────────────────

/** choice → option id · numeric/expression → text · blanks → one string per blank */
export type AnswerInput = string | string[];

export type Verdict = 'incomplete' | 'correct' | 'incorrect';
export interface Evaluation {
  verdict: Verdict;
  feedback?: string;
  misconceptionId?: string;
  /** Equal in value to the answer, but not written in simplest form. */
  notSimplified?: boolean;
}
