import { shownKey } from './identity';
import type { SubtopicRef } from './types';
import { generateFromTemplate, TemplateError } from './templates/generate';
import type { GeneratedQuestion } from './templates/generate';
import { makeRng, nextSeed, type TemplateRegistry } from './templates/registry';
import { TEMPLATE_REGISTRY } from './templates/catalog';

/**
 * Bridge between the template system and the app.
 *
 * The practice engine never asks for "the question bank" — there isn't one any
 * more. It asks this module for a question, and a fresh variation is generated
 * on the spot from whichever template the subtopic owns.
 */

export type { GeneratedQuestion };

/** Number of options offered per question. */
export const OPTION_COUNT = 4;

/**
 * Templates at one difficulty level.
 *
 * A subtopic whose questions are all at one level is unaffected by asking for
 * a level; a subtopic that simply has none at the requested level falls back to
 * its whole set rather than emptying the session. The fallback is deliberate:
 * an empty batch is worse for a student than a question at the wrong level, and
 * the missing level is caught by the test-suite, not by a child.
 */
export function templatesAtLevel<T extends { difficulty?: 1 | 2 | 3 }>(
  templates: T[],
  level?: 1 | 2 | 3,
): T[] {
  if (!level) return templates;
  const matching = templates.filter((template) => (template.difficulty ?? 1) === level);
  return matching.length > 0 ? matching : templates;
}

/** True when a subtopic has at least one template and can be practised. */
export function hasTemplates(ref: SubtopicRef, registry: TemplateRegistry = TEMPLATE_REGISTRY) {
  return registry.hasTemplates(ref);
}

/** How many templates cover a subtopic (not how many variations — that is unlimited). */
export function templateCount(ref: SubtopicRef, registry: TemplateRegistry = TEMPLATE_REGISTRY) {
  return registry.forSubtopic(ref).length;
}

export interface GenerateOptions {
  registry?: TemplateRegistry;
  optionCount?: number;
  /** Explicit template (used by tests); otherwise one is chosen at random. */
  templateId?: string;
  /** Only generate from templates at this level (U01's three levels). */
  level?: 1 | 2 | 3;
}

/**
 * Generates one question for a subtopic.
 * Returns null when the subtopic has no template yet.
 */
export function generateQuestion(
  ref: SubtopicRef,
  seed: number,
  options: GenerateOptions = {},
): GeneratedQuestion | null {
  const registry = options.registry ?? TEMPLATE_REGISTRY;

  const templates = templatesAtLevel(registry.forSubtopic(ref), options.level);
  if (options.templateId) {
    const chosen = registry.byId(options.templateId);
    if (!chosen) return null;
    return generateFromTemplate(chosen, {
      seed,
      optionCount: options.optionCount ?? OPTION_COUNT,
    });
  }
  if (templates.length === 0) return null;

  // Choose a template with the same rng the seed drives, so a given id always
  // rebuilds the same question.
  const rng = makeRng(`${seed}-template`);
  const template = templates[Math.floor(rng() * templates.length)];

  return generateFromTemplate(template, {
    seed,
    optionCount: options.optionCount ?? OPTION_COUNT,
  });
}

/**
 * Generates a batch of distinct questions for one session.
 *
 * `avoid` holds signatures already used in this session, so the same numbers
 * and the same wording never come up twice in a row.
 */
export function generateBatch(
  ref: SubtopicRef,
  count: number,
  options: GenerateOptions & { avoid?: Set<string>; seed?: number } = {},
): GeneratedQuestion[] {
  const registry = options.registry ?? TEMPLATE_REGISTRY;
  const avoid = options.avoid ?? new Set<string>();
  const rng = makeRng(options.seed ?? Math.floor(Math.random() * 2 ** 31));

  // Spread the batch across every template of the subtopic instead of always
  // drawing one at random — a narrow template would otherwise starve the set
  // while a wide sibling sits unused.
  const templates = options.templateId
    ? [registry.byId(options.templateId)].filter(Boolean)
    : templatesAtLevel(registry.forSubtopic(ref), options.level);
  if (templates.length === 0 && !options.templateId) {
    console.warn(
      `[practice] No template covers ${ref.grade}/${ref.topicId}/${ref.subtopicId}.`,
    );
    return [];
  }

  const output: GeneratedQuestion[] = [];
  const localSignatures = new Set<string>();
  // Recycled questions, used only when the subtopic genuinely runs out of new
  // wordings — see the comment after the loop.
  const recycled: GeneratedQuestion[] = [];
  let guard = 0;
  let cursor = Math.floor(rng() * templates.length);

  // Enough attempts for a narrow template: a 7-value choice needs ~7 draws per
  // new wording, so sample generously before concluding the space is exhausted.
  while (output.length < count && guard < count * 200 + 500) {
    guard += 1;
    const seed = nextSeed(rng);
    const template = templates[cursor % templates.length]!;
    cursor += 1;

    let question: GeneratedQuestion | null = null;
    try {
      question = generateFromTemplate(template, {
        seed,
        optionCount: options.optionCount ?? OPTION_COUNT,
      });
    } catch (error) {
      if (error instanceof TemplateError) continue; // bad draw; try another seed
      throw error;
    }

    // `avoid` accepts three shapes: a question id, the bare prompt, and the
    // shown key. The third exists because a positional question can show the
    // same sentence over a different row, and an ordering question shows the
    // same sentence over a different set of items, so the sentence alone does
    // not identify what the student saw; a caller that only passes bare prompts
    // still works.
    const key = shownKey(question);
    if (avoid.has(question.id) || avoid.has(key)) continue;

    if (
      avoid.has(question.signature) ||
      avoid.has(question.prompt) ||
      localSignatures.has(question.signature)
    ) {
      // Duplicate of something already in this batch — never recycle, it would
      // be a repeat straight away.
      if (localSignatures.has(question.signature)) continue;

      // Already shown earlier in the session: keep as a last resort, but only
      // if the caller's `avoid` set does not forbid it. A recycled question has
      // a new id, so an id-based filter downstream would not catch a repeat.
      const forbiddenByCaller =
        avoid.has(question.prompt) || avoid.has(question.signature) || avoid.has(key);
      if (!forbiddenByCaller && recycled.length < count) {
        recycled.push(question);
      }
      continue;
    }

    localSignatures.add(question.signature);
    output.push(question);
  }

  // Some subtopics are genuinely finite: a 6–9 times table has 16 entries and a
  // 35-answer perfect run needs 35 questions. Rather than repeat within a few
  // questions, reuse the oldest variations — that is honest behaviour for a
  // finite exercise, and it is the template author's cue to widen the ranges.
  if (output.length < count && recycled.length > 0) {
    for (const question of recycled) {
      if (output.length >= count) break;
      output.push(question);
    }
  }

  if (output.length === 0) {
    // Never fail silently: an empty batch means the session cannot start, so
    // say which subtopic (and why) in the console for template authors.
    console.warn(
      `[practice] No question could be generated for ${ref.grade}/${ref.topicId}/${ref.subtopicId}. ` +
        'Check that the templates exist and can produce enough distinct options.',
    );
  }

  return output;
}

/**
 * Regenerates a previously generated question from its stored id
 * (`templateId~seed`). Used to restore a draft session after a reload.
 */
export function regenerateFromId(
  id: string,
  options: GenerateOptions = {},
): GeneratedQuestion | null {
  const [templateId, seedText] = id.split('~');
  const seed = Number(seedText);
  if (!templateId || !Number.isFinite(seed)) return null;

  const registry = options.registry ?? TEMPLATE_REGISTRY;
  const template = registry.byId(templateId);
  if (!template) return null;

  return generateFromTemplate(template, { seed, optionCount: options.optionCount ?? OPTION_COUNT });
}

/**
 * How many distinct variations a subtopic's templates must be able to produce
 * between them. One template can be legitimately finite (a times table has 16
 * entries); the subtopic it belongs to still has to fill a session.
 */
export const MIN_SESSION_VARIATIONS = 12;

/** Generates every variation of a template — used by the test-suite and authoring. */
export function previewTemplate(
  templateId: string,
  count: number,
  options: GenerateOptions = {},
): GeneratedQuestion[] {
  const registry = options.registry ?? TEMPLATE_REGISTRY;
  const template = registry.byId(templateId);
  if (!template) return [];

  const output: GeneratedQuestion[] = [];
  const seen = new Set<string>();
  const rng = makeRng(`${templateId}-preview`);
  let guard = 0;

  while (output.length < count && guard < count * 40 + 200) {
    guard += 1;
    const seed = nextSeed(rng);

    let question: GeneratedQuestion;
    try {
      question = generateFromTemplate(template, {
        seed,
        optionCount: options.optionCount ?? OPTION_COUNT,
      });
    } catch (error) {
      if (error instanceof TemplateError) continue; // unusable draw; try another seed
      throw error;
    }

    if (seen.has(question.signature)) continue;
    seen.add(question.signature);
    output.push(question);
  }

  // A finite template (a times table, a list of shape names) is legitimate —
  // generateBatch spreads the load across its subtopic siblings. Only warn when
  // the template cannot even fill a session on its own.
  if (output.length < MIN_SESSION_VARIATIONS) {
    console.warn(
      `[practice] Template ${templateId} produced only ${output.length} variations — ` +
        'widen its ranges or add more distractors.',
    );
  }

  return output;
}
