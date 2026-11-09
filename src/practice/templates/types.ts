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
   * Only meaningful for numeric answers — a typed Georgian noun would be a
   * spelling test, which is not what these questions assess.
   */
  entry?: boolean;
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
  answer: (vars: Vars) => number | string;

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
