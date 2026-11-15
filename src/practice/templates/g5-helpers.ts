import { defineTemplate, type QuestionTemplate, type Vars, type VariableSpec } from './types';

/**
 * Shared helpers for the Grade V libraries.
 *
 * Every Grade V unit is a conversion of one academy question bank. The banks
 * share three things: Georgian number formatting (a space between thousands),
 * a typographic minus sign, and answers that are read aloud rather than
 * computed by the student. Putting those here keeps the per-unit files about
 * the *questions* instead of about formatting.
 */

/** Georgian thousands separator, matching the bank's `624 381`. */
export const group = (n: number): string => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

/** Numbers as a student reads them: a true minus sign for negatives. */
export const displayNumber = (value: number | string): string =>
  String(value).replace(/^-/, '\u2212');

/** Distractors as the student reads them. */
export const wrongNumbers = (values: number[]): string[] => values.map((v) => displayNumber(v));

/** Near misses around an answer, at the step size the subtopic works in. */
export const nearMisses = (answer: number, count = 3, step = 1, min = 0): number[] => {
  const out: number[] = [];
  const deltas = [step, -step, 2 * step, -2 * step, 3 * step, -3 * step, 10, -10, 100, 1000];
  for (const delta of deltas) {
    const value = answer + delta;
    if (value >= min && value !== answer && !out.includes(value)) out.push(value);
    if (out.length >= count) break;
  }
  let extra = 1;
  while (out.length < count) {
    const value = answer + extra * step;
    if (value >= min && value !== answer && !out.includes(value)) out.push(value);
    extra += 1;
  }
  return out.slice(0, count);
};

export const divisorsOf = (n: number): number[] => {
  const out: number[] = [];
  for (let d = 1; d <= n; d += 1) if (n % d === 0) out.push(d);
  return out;
};

export const isPrime = (n: number): boolean => {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d += 1) if (n % d === 0) return false;
  return true;
};

export const factorize = (n: number): number[] => {
  const out: number[] = [];
  let rest = n;
  for (let p = 2; p * p <= rest; p += 1) {
    while (rest % p === 0) {
      out.push(p);
      rest /= p;
    }
  }
  if (rest > 1) out.push(rest);
  return out;
};

export const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
export const lcm = (a: number, b: number): number => Math.abs(a * b) / gcd(a, b);

export const digitSum = (n: number): number =>
  String(n)
    .split('')
    .reduce((sum, d) => sum + Number(d), 0);

/** A `choice` variable that resolves to one field of the `spec` row. */
export const field = (index: number, separator = '|'): VariableSpec => ({
  kind: 'choice',
  values: (vars: Vars) => [String(vars.spec).split(separator)[index]],
});

/** A `choice` variable computed from the drawn values. */
export const derived = (compute: (vars: Vars) => number | string): VariableSpec => ({
  kind: 'choice',
  values: (vars: Vars) => [compute(vars)],
});

/** The `spec` variable itself: one row per variation the bank supplies. */
export const spec = (rows: string[]): VariableSpec => ({ kind: 'choice', values: rows });

/** A number read from `vars[name]`. */
export const num = (vars: Vars, name: string): number => Number(vars[name]);

/**
 * Builds a Grade V template from a bank row.
 *
 * The bank gives fixed questions; a template needs values that vary. So each
 * template holds a table of rows (the academy's own values plus extra drawn
 * neighbours) and every prompt placeholder, the answer and the explanation are
 * all computed from the *same* row — which is what keeps them from disagreeing.
 */
export const bank = (options: {
  id: string;
  subtopicId: string;
  difficulty: 1 | 2 | 3;
  grade?: 5;
  topicId: string;
  prompt: string;
  rows?: string[];
  variables?: Record<string, VariableSpec>;
  answer: (vars: Vars) => number | string;
  distractors?: (context: {
    answer: number | string;
    vars: Vars;
  }) => Array<number | string>;
  options?: (vars: Vars) => Array<number | string>;
  optionCount?: number;
  format?: QuestionTemplate['format'];
  explain: (context: { vars: Vars; answer: string }) => string;
  visual?: (vars: Vars) => string;
  hint?: string;
}): QuestionTemplate => {
  const variables: Record<string, VariableSpec> = { ...(options.variables ?? {}) };
  if (options.rows) variables.spec = spec(options.rows);

  return defineTemplate({
    id: options.id,
    grade: options.grade ?? 5,
    topicId: options.topicId,
    unitId: options.topicId,
    subtopicId: options.subtopicId,
    prompt: options.prompt,
    variables,
    answer: options.answer,
    ...(options.distractors ? { distractors: options.distractors } : {}),
    ...(options.options ? { options: options.options } : {}),
    ...(options.optionCount ? { optionCount: options.optionCount } : {}),
    ...(options.format ? { format: options.format } : {}),
    ...(options.visual ? { visual: options.visual } : {}),
    ...(options.hint ? { hint: options.hint } : {}),
    explanation: options.explain,
  });
};

/** A `choice` variable that renders a numeric variable the way the bank writes it. */
export const shownVar = (name: string): VariableSpec => ({
  kind: 'choice',
  values: (vars: Vars) => [group(num(vars, name))],
});

/** A `choice` variable that renders one field of the `spec` row, grouped. */
export const shownField = (index: number, separator = '|'): VariableSpec => ({
  kind: 'choice',
  values: (vars: Vars) =>
    [group(Number(String(vars.spec).split(separator)[index]!.replace(/[^\d-]/g, '')))],
});

/** A row's fields as numbers, tolerant of the bank's grouped spelling. */
export const rowNumbers = (row: unknown, separator = '|'): number[] =>
  String(row)
    .split(separator)
    .map((part) => Number(part.replace(/[\s\u00a0\u2009]/g, '')));

/**
 * A division with remainder, as the student writes it: `quotient` and `rest`.
 *
 * The bank asks „მიუთითე განაყოფი და ნაშთი" — two numbers, not one. A single
 * field would have to be read as `12 ნაშთი 3` and every spelling of that would
 * be a different answer, so the pair is joined with a comma and offered as a
 * choice, exactly the way the answer key writes it.
 */
export const divisionWithRemainder = (dividend: number, divisor: number): string => {
  const quotient = Math.floor(dividend / divisor);
  const rest = dividend % divisor;
  return `${quotient}, ნაშთი ${rest}`;
};
