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
  text: string;
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
  | { type: 'blanks'; template: string; answers: number[] };

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

export type ExplainBlock =
  | { type: 'text'; text: string }
  | { type: 'equation'; lines: string[]; caption?: string }
  | { type: 'worked'; title: string; steps: Array<{ text: string; math?: string }> }
  | { type: 'callout'; tone: 'tip' | 'warning'; text: string };

export interface ExplainActivity extends ActivityBase {
  kind: 'explain';
  blocks: ExplainBlock[];
}

export type Activity = QuestionActivity | TilesActivity | ExplainActivity;

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
