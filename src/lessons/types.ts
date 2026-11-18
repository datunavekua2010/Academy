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
  | { type: 'split'; total: number; answer: number; frame?: boolean };

export type Glyph = 'star' | 'apple' | 'fish' | 'ball';
export type ObjectLayout = 'rows' | 'scatter';

/** Something drawn next to a question. Purely visual: it is never the answer control. */
export type VisualSpec =
  /** `null` is the hidden number. `arrows` labels the step between neighbours, e.g. `+1`. */
  | { type: 'sequence'; items: Array<number | null>; arrows?: string }
  /** A number as groups of ten and single objects. */
  | { type: 'quantity'; tens: number; ones: number }
  | { type: 'line'; min: number; max: number; labelled?: number[]; marker?: number; hops?: number[] }
  /** A collection of drawn objects. `markable` lets the student tap objects to keep track while counting. */
  | { type: 'objects'; count: number; glyph: Glyph; layout: ObjectLayout; seed?: number; markable?: boolean }
  /** Counters on a ten-frame (two frames above ten). */
  | { type: 'ten-frame'; count: number }
  /**
   * Two quantities side by side (`a` is group ა, `b` is group ბ).
   * `objects`: pictures only. `numbers`: numerals only. `line`: both on a number line.
   * `pairs`: pictures matched one-to-one with the extras marked.
   */
  | { type: 'compare'; a: number; b: number; view: 'objects' | 'numbers' | 'line' | 'pairs'; glyph?: Glyph }
  /** A whole split into two parts; `part` is shown, the other part is hidden. `split` draws the whole as counters with the shown part marked; `plain` draws the whole only. */
  | { type: 'part-whole'; whole: number; part: number; counters?: 'split' | 'plain' };

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
  | { tool: 'split'; targets: number[]; frame?: boolean };

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
  | { type: 'compose'; whole: number; parts: [number, number]; caption?: string };

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
