/**
 * Axiom Academy — template model for dynamically generated questions.
 *
 * A template is a *pattern*, not a question. It declares which numbers may
 * vary, what the answer is as a function of those numbers, and how the wrong
 * options look. The generator (generate.ts) turns one template into as many
 * different, mathematically valid questions as you like.
 *
 * Adding a template never requires touching the UI, the session engine or the
 * scoring engine — register it and it appears under its subtopic.
 */

import type { GradeId } from '../types';

/** Values drawn for one variation, keyed by variable name. */
export type VarValue = number | string | Array<number | string>;
export type Vars = Record<string, VarValue>;

export interface RangedVariable {
  kind: 'int';
  /**
   * Inclusive bounds. Functions receive the values drawn *so far*, so later
   * variables can depend on earlier ones (e.g. a divisor that must not exceed
   * the dividend, or an operand that must not make the result negative).
   */
  min: number | ((vars: Vars) => number);
  max: number | ((vars: Vars) => number);
  /** Values are drawn as min + k·step. Defaults to 1. */
  step?: number;
  /**
   * Draw from the top down (max, max−step, …).
   *
   * For a template whose answers are scattered — "which number comes before N"
   * has one answer per number — drawing downward makes the *first* variations
   * cover the hardest answers, so a session that has to end early still ends on
   * a representative set rather than a cluster at the bottom of the range.
   */
  reverse?: boolean;
  /** Skip zero — use this for divisors and multipliers that must not be 0. */
  nonZero?: boolean;
}

export interface ChoiceVariable {
  kind: 'choice';
  /**
   * The pool to draw from. A function receives the values drawn so far, which
   * lets one variable be *derived* from another instead of drawn independently.
   *
   * Independent draws plus a constraint that they agree is not equivalent: the
   * generator would reject almost every attempt (1/k of them match) and, for a
   * template with a small pool, spend its whole attempt budget failing. A
   * derived value is always consistent on the first draw.
   */
  values: Array<number | string> | ((vars: Vars) => Array<number | string>);
}

/**
 * A whole ordered sequence drawn at once, e.g. a row of objects to count.
 *
 * `pick` chooses the items; `length` decides how many, and may depend on
 * values drawn earlier. Distinctness is opt-in (`unique`) because some
 * sequences are meant to repeat, such as two groups of the same shape.
 */
export interface ListVariable {
  kind: 'list';
  pick: {
    values: Array<number | string>;
    /** How many items to draw. */
    length: number | { min: number; max: number };
    /** Draw without replacement, so no item appears twice. */
    unique?: boolean;
    /** Optional per-draw weighting/filter used before picking. */
    filter?: (item: number | string, vars: Vars) => boolean;
  };
}

export type VariableSpec = RangedVariable | ChoiceVariable | ListVariable;

/**
 * What rendering/answer code may depend on beyond the drawn values: the
 * option order. Only a shuffled template needs it — an ordering question's key
 * is a sequence through the items *as the student sees them*.
 */
export interface AnswerContext {
  /** Item order for a `shuffle` template. Undefined when not shuffled. */
  order?: string[];
}

/** A whole-set rule evaluated after every variable has been drawn. */
export interface TemplateConstraint {
  /** Return true when the drawn values are acceptable. */
  test: (vars: Vars) => boolean;
  /** Georgian note used in diagnostics; never shown to students. */
  note: string;
}

export type AnswerKind = 'integer' | 'decimal' | 'text';

export interface AnswerFormat {
  /**
   * integer  – answer must be a whole number (default)
   * decimal  – answer may have decimals; `decimals` sets the rounding
   * text     – answer is a string (fractions such as "3/4", units, …)
   */
  kind?: AnswerKind;
  /** Decimal places used when kind === 'decimal'. Defaults to 2. */
  decimals?: number;
  /** Reject answers below this value (e.g. 0 so answers stay friendly). */
  min?: number;
  /** Reject answers above this value. */
  max?: number;
  /**
   * Ask the student to type the answer instead of choosing from options.
   *
   * A typed answer is a single string, so the input is one field: a number for
   * an integer answer, `HH:MM` for a time (see `time`, below), a word for a
   * weekday. A typed Georgian noun would otherwise be a spelling test, so
   * `text` answers always supply their own `options` and are offered as a
   * choice — see the note on `time`.
   */
  entry?: boolean;
  /**
   * The answer is a clock time, written `HH:MM`, and the student types it.
   *
   * Set this instead of `entry` for a time. It does the same three things and
   * one more: the answer is normalised to `HH:MM` (`7:0`, `07:00`, `7.00` and
   * `7` all become `07:00`) and compared by *value*, not by spelling, so a
   * child who types `7:00` for `07:00` is not marked wrong for typing four
   * characters instead of five. `entry` alone cannot express that, because a
   * typed answer is compared as text — which is right for a number and wrong
   * for a time.
   */
  time?: boolean;
  /** Render the computed answer as the string students see. */
  format?: (answer: number | string) => string;
}

/**
 * Builds wrong options. Receives the correct answer and the drawn values so
 * distractors can be *plausible mistakes* rather than random noise.
 * Returned values must be distinct from the answer; the generator filters and
 * pads as needed.
 */
export type DistractorBuilder = (context: {
  answer: number | string;
  vars: Vars;
  /**
   * The answer as the student reads it, units included (`"15 სმ"`).
   *
   * A comparison asks "20 სმ or 15 სმ?", and the options used to be built from
   * the bare number: the student saw 21, 20, 22, 19 — four near-misses of the
   * winning length and not one of the losing one, so the question could be
   * answered without comparing anything. A distractor has to be a wrong answer
   * *to this question*, which means it has to look like the printed values.
   */
  display: string;
  rng: () => number;
}) => Array<number | string>;

export interface QuestionTemplate {
  /** Stable, unique id — used in question ids and saved sessions. */
  id: string;
  /** Curriculum address of the template. */
  grade: GradeId;
  topicId: string;
  /** Optional: units are shown in the accordion, templates may ignore them. */
  unitId?: string;
  subtopicId: string;

  /** Georgian question wording with {placeholders}, e.g. "{a} + {b} = ?" */
  prompt: string;
  /**
   * Optional Georgian support line drawn above the prompt for this particular
   * variation — an object row to count, the groups being compared, a sequence
   * to order. Computed from the drawn values so it can never disagree with the
   * prompt or the answer.
   */
  visual?: (vars: Vars) => string;
  /** Optional Georgian instruction line above the prompt. */
  hint?: string;

  variables: Record<string, VariableSpec>;
  constraints?: TemplateConstraint[];

  /** Computes the correct answer from the drawn values. Never a constant. */
  answer: (vars: Vars, ctx: AnswerContext) => number | string;

  /**
   * Shows the drawn items to the student and asks them to put them in order.
   *
   * The items are `vars[shuffle.source]`, but they are displayed in a shuffled
   * order, because asking a child to arrange a list that is already sorted is
   * not a question. The correct answer is the sequence of *display* positions,
   * e.g. "2,1,3": the student taps the items into order and the runner records
   * which position they pressed first, second, third.
   *
   * `direction: 'asc'` means "smallest first".
   */
  shuffle?: {
    /** Which list variable holds the values to arrange. */
    source: string;
    /** 'asc' = smallest first, 'desc' = largest first. */
    direction: 'asc' | 'desc';
  };

  /**
   * Asks the student to mark **every** option that fits, not one of them.
   *
   * „Which of these can you buy with 30 თეთრი?“ has two right answers and three
   * wrong ones on the same screen; asked as a single choice it would have to be
   * reworded into something else, and reworded questions were the compromise
   * every earlier unit had to make. The runner marks a set, so the set is what
   * the template hands over:
   *
   *  - `options(vars)` returns every candidate, as for a „which is true“ set;
   *  - `answer(vars)` returns the correct ones joined by commas, **in the order
   *    they have to be displayed** — `options` must not shuffle, because the
   *    answer is a list of the same strings and the two have to agree;
   *  - every option must be one of the two labels the template uses for
   *    „fits“/„does not fit“ is *not* required: the set may be of any size, but
   *    it must be a proper subset (at least one right and one wrong), or the
   *    question is „mark them all“ with nothing to leave out.
   *
   * The generator checks all of that and refuses a draw that would be trivial,
   * so a template cannot ship a multi-select whose answer is all four options.
   */
  multi?: {
    /** Separator used in the answer string. Defaults to `', '`. */
    separator?: string;
  };

  /** Answer format / validation rules. */
  format?: AnswerFormat;

  /** Optional custom distractors; a sensible numeric default is used if omitted. */
  distractors?: DistractorBuilder;

  /** Georgian explanation shown after answering. */
  explanation: (context: { vars: Vars; answer: string }) => string;

  difficulty?: 1 | 2 | 3;

  /**
   * How many options this question shows (default 4). A true/false question
   * shows 2, a three-way categorisation shows 3. The generator never asks for
   * more options than the template can offer.
   */
  optionCount?: number;

  /**
   * The complete option set, correct answer included, when the question is not
   * „one of these four“ but „which of these statements is true“.
   *
   * A multi-select question („mark every shape with four sides“) cannot be
   * asked in a runner that marks one option. What survives is the *same*
   * knowledge as a single choice: one option names the whole correct set, and
   * the others are sets a child produces by missing one, adding one, or
   * exchanging one. Choosing between them is the question — so the template has
   * to hand over all the options instead of a list of distractors. The answer
   * must appear in the returned array exactly once.
   */
  options?: (vars: Vars) => Array<number | string>;
}

/** Authoring helper — gives full type checking and editor completion. */
export function defineTemplate(template: QuestionTemplate): QuestionTemplate {
  return template;
}

/** Renders "{a} + {b}" with the drawn values. */
export function renderPrompt(prompt: string, vars: Vars): string {
  return prompt.replace(/\{(\w+)\}/g, (whole, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : whole,
  );
}
