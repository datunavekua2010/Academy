import type { Question } from '../types';
import { makeRng, pick, randomInt, shuffleWith } from './rng';
import type { AnswerFormat, QuestionTemplate, Vars } from './types';
import { renderPrompt } from './types';

/**
 * The template → question generator.
 *
 * One template becomes unlimited variations:
 *   1. draw every variable inside its allowed range (later ranges may depend
 *      on earlier draws),
 *   2. retry until the template's constraints hold (e.g. no negative results,
 *      no division by zero, whole numbers only),
 *   3. recompute the answer from the drawn values — a constant answer is a bug,
 *   4. validate the answer against the declared format,
 *   5. build plausible distractors and shuffle them.
 *
 * Everything is driven by the seed, so a generated question is reproducible.
 */

/** Attempts before a template is considered too tightly constrained. */
const MAX_ATTEMPTS = 200;

export class TemplateError extends Error {}

export interface GeneratedQuestion extends Question {
  templateId: string;
  seed: number;
  /** Values drawn for this variation (kept for tests/diagnostics). */
  vars: Vars;
  /** Normalised answer before display formatting. */
  rawAnswer: number | string;
  /** Identifies "same numbers, same wording" — used to avoid repeats. */
  signature: string;
}

function resolveBound(bound: number | ((vars: Vars) => number), vars: Vars): number {
  return typeof bound === 'function' ? bound(vars) : bound;
}

/** Draws every variable once, in declaration order. */
function drawVars(template: QuestionTemplate, rng: () => number): Vars {
  const vars: Vars = {};

  for (const [name, spec] of Object.entries(template.variables)) {
    if (spec.kind === 'choice') {
      vars[name] = pick(rng, spec.values);
      continue;
    }

    const step = Math.max(1, spec.step ?? 1);
    const min = resolveBound(spec.min, vars);
    const max = resolveBound(spec.max, vars);
    const upper = Math.max(min, max);

    let value = min + randomInt(rng, 0, Math.floor((upper - min) / step)) * step;

    if (spec.nonZero && value === 0) {
      // Nudge off zero without leaving the range when possible.
      value = upper >= min + step ? min + step : min !== 0 ? min : 1;
    }

    vars[name] = value;
  }

  return vars;
}

function constraintsHold(template: QuestionTemplate, vars: Vars): boolean {
  return (template.constraints ?? []).every((constraint) => {
    try {
      return constraint.test(vars);
    } catch {
      return false;
    }
  });
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Applies the template's answer-format rules. Returns the normalised answer or
 * throws when the drawn values would produce an invalid question.
 */
function normaliseAnswer(
  template: QuestionTemplate,
  raw: number | string,
): { value: number | string; display: string } {
  const format: AnswerFormat = template.format ?? {};
  const kind = format.kind ?? (typeof raw === 'number' ? 'integer' : 'text');

  if (typeof raw === 'number') {
    if (!Number.isFinite(raw)) {
      throw new TemplateError(`${template.id}: answer is not a finite number`);
    }

    let value = raw;

    if (kind === 'integer') {
      // A fractional result means the template allowed an invalid draw.
      if (!Number.isInteger(raw)) {
        throw new TemplateError(
          `${template.id}: expected a whole-number answer but got ${raw} — tighten the constraints`,
        );
      }
    } else if (kind === 'decimal') {
      value = roundTo(raw, format.decimals ?? 2);
    }

    if (format.min !== undefined && value < format.min) {
      throw new TemplateError(`${template.id}: answer ${value} is below the allowed minimum`);
    }
    if (format.max !== undefined && value > format.max) {
      throw new TemplateError(`${template.id}: answer ${value} is above the allowed maximum`);
    }

    return { value, display: format.format ? format.format(value) : String(value) };
  }

  if (typeof raw !== 'string' || raw.trim() === '') {
    throw new TemplateError(`${template.id}: answer must be a non-empty string or number`);
  }

  return { value: raw, display: format.format ? format.format(raw) : raw };
}

/** Default wrong answers: near misses around a numeric answer. */
function defaultDistractors(answer: number, rng: () => number): number[] {
  const magnitude = Math.max(1, Math.abs(answer));
  const spread = Math.max(1, Math.round(magnitude * 0.25));

  // Small, plausible slip-ups: ±1, ±2, ±10 and a nearby random offset.
  const offsets = [1, -1, 2, -2, 10, -10, spread, -spread, randomInt(rng, -spread, spread)];

  const wrong: number[] = [];
  for (const offset of offsets) {
    if (wrong.length === 3) break;
    const candidate = answer + offset;
    if (!Number.isFinite(candidate)) continue;
    if (candidate === answer) continue;
    if (wrong.includes(candidate)) continue;
    if (Number.isInteger(answer) && !Number.isInteger(candidate)) continue;
    if (candidate < 0 && answer >= 0) continue; // don't offer negatives by default
    wrong.push(candidate);
  }

  // Guarantee three options even for tiny answers.
  let fallback = 1;
  while (wrong.length < 3 && fallback < 1000) {
    const candidate = answer >= 0 ? answer + fallback : answer - fallback;
    if (candidate !== answer && !wrong.includes(candidate) && candidate >= 0) wrong.push(candidate);
    fallback += 1;
  }

  return wrong;
}

function sameOption(a: number | string, b: number | string): boolean {
  return String(a) === String(b);
}

export interface GenerateOptions {
  seed: number;
  /** How many options the student sees (default 4). */
  optionCount?: number;
  difficulty?: 1 | 2 | 3;
}

/**
 * Generates one variation of a template. Throws TemplateError if the template
 * cannot produce a valid question (which is a template bug, not a runtime one).
 */
export function generateFromTemplate(
  template: QuestionTemplate,
  options: GenerateOptions,
): GeneratedQuestion {
  const seed = options.seed >>> 0;
  const rng = makeRng(seed);
  const optionCount = Math.max(2, options.optionCount ?? 4);

  let lastError: unknown = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const vars = drawVars(template, rng);

    if (!constraintsHold(template, vars)) continue;

    let raw: number | string;
    let normalised: { value: number | string; display: string };

    try {
      raw = template.answer(vars);
      normalised = normaliseAnswer(template, raw);
    } catch (error) {
      lastError = error;
      continue;
    }

    // Distractors come from the drawn values, so they always relate to *this*
    // variation. Anything equal to the answer (by display text) is dropped.
    const candidates = template.distractors
      ? template.distractors({ answer: normalised.value, vars, rng })
      : typeof normalised.value === 'number'
        ? defaultDistractors(normalised.value, rng)
        : [];

    const wrongDisplays: string[] = [];
    for (const candidate of candidates) {
      if (wrongDisplays.length >= optionCount - 1) break;
      if (sameOption(candidate, normalised.value)) continue;
      const display = String(candidate);
      if (display === normalised.display) continue;
      if (wrongDisplays.includes(display)) continue;
      wrongDisplays.push(display);
    }

    if (wrongDisplays.length < optionCount - 1) {
      lastError = new TemplateError(
        `${template.id}: not enough distinct wrong options for "${normalised.display}"`,
      );
      continue;
    }

    const optionsList = shuffleWith(rng, [normalised.display, ...wrongDisplays]);
    const prompt = renderPrompt(template.prompt, vars);

    // Same template + same rendered wording and numbers = the same question,
    // even if the option order differs. Option order is random per draw, so it
    // must not make a repeat look new.
    const signature = `${template.id}|${prompt}`;

    return {
      id: `${template.id}~${seed}`,
      templateId: template.id,
      seed,
      vars,
      rawAnswer: normalised.value,
      signature,
      grade: template.grade,
      topicId: template.topicId,
      subtopicId: template.subtopicId,
      prompt,
      hint: template.hint,
      options: optionsList,
      answer: normalised.display,
      explanation: template.explanation({ vars, answer: normalised.display }),
      difficulty: options.difficulty ?? template.difficulty ?? 1,
    };
  }

  const detail = lastError instanceof Error ? `: ${lastError.message}` : '';
  throw new TemplateError(
    `${template.id}: could not generate a valid question after ${MAX_ATTEMPTS} attempts${detail}`,
  );
}

/**
 * Generates `count` different variations of one template.
 * Guarantees no repeated signature inside the returned batch.
 */
export function generateVariations(
  template: QuestionTemplate,
  count: number,
  options: { seed?: number; optionCount?: number } = {},
): GeneratedQuestion[] {
  const base = options.seed ?? Math.floor(Math.random() * 2 ** 31);
  const seen = new Set<string>();
  const output: GeneratedQuestion[] = [];

  let attempt = 0;
  while (output.length < count) {
    const seed = (base + attempt * 7919) >>> 0; // spread seeds apart
    attempt += 1;

    if (attempt > MAX_ATTEMPTS * 4) {
      throw new TemplateError(
        `${template.id}: cannot produce ${count} distinct variations — its ranges are too narrow`,
      );
    }

    let question: GeneratedQuestion;
    try {
      question = generateFromTemplate(template, { ...options, seed });
    } catch {
      continue; // that seed drew unusable values; try the next
    }

    if (seen.has(question.signature)) continue;
    seen.add(question.signature);
    output.push(question);
  }

  return output;
}
