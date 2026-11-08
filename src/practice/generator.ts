import type { SubtopicRef } from './types';
import { generateFromTemplate, TemplateError } from './templates/generate';
import type { GeneratedQuestion } from './templates/generate';
import { makeRng, nextSeed, pickTemplate, type TemplateRegistry } from './templates/registry';
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
  const rng = makeRng(seed);

  const template = options.templateId
    ? registry.byId(options.templateId)
    : pickTemplate(registry, ref, rng);

  if (!template) return null;

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

  const output: GeneratedQuestion[] = [];
  const localSignatures = new Set<string>();
  let guard = 0;

  while (output.length < count && guard < count * 40 + 200) {
    guard += 1;
    const seed = nextSeed(rng);

    let question: GeneratedQuestion | null = null;
    try {
      question = generateQuestion(ref, seed, { ...options, registry });
    } catch (error) {
      if (error instanceof TemplateError) continue; // bad draw; try another seed
      throw error;
    }

    if (!question) break; // no templates for this subtopic
    if (avoid.has(question.signature) || localSignatures.has(question.signature)) continue;

    localSignatures.add(question.signature);
    output.push(question);
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

  if (output.length < count) {
    console.warn(
      `[practice] Template ${templateId} produced only ${output.length}/${count} variations — ` +
        'widen its ranges or add more distractors.',
    );
  }

  return output;
}
