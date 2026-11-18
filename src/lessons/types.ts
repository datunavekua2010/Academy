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
  | { type: 'story'; operation: 'add' | 'subtract'; answer: number };

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
  | { type: 'story'; glyph: Glyph; first: number; change: number; mode: 'join' | 'separate' };

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
  | { tool: 'story-workspace'; stories: Array<{ mode: 'join' | 'separate'; glyph: Glyph; text: string; first: number; change: number }> };

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
  | { type: 'story-demo'; mode: 'join' | 'separate'; glyph: Glyph; first: number; change: number; text: string; steps: string[]; caption?: string };

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
