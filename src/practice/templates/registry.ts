import type { SubtopicRef } from '../types';
import { subtopicKey } from '../types';
import { makeRng, randomInt } from './rng';
import type { QuestionTemplate } from './types';

/**
 * The template registry.
 *
 * This is the ONLY place that knows which templates exist. To add templates,
 * import them and list them in `TEMPLATES` (or pass them to
 * `createTemplateRegistry`). Nothing else in the app needs to change:
 *   • the generator works on any template,
 *   • the session engine works on any generated question,
 *   • the UI renders whatever questions the registry produces.
 */

export interface TemplateRegistry {
  all: QuestionTemplate[];
  /** Templates for one exact grade/topic/subtopic. */
  forSubtopic: (ref: SubtopicRef) => QuestionTemplate[];
  byId: (id: string) => QuestionTemplate | undefined;
  /** True when the subtopic has at least one template (i.e. is playable). */
  hasTemplates: (ref: SubtopicRef) => boolean;
  /** Unique template ids — used to deduplicate and validate. */
  ids: string[];
}

export function createTemplateRegistry(templates: QuestionTemplate[]): TemplateRegistry {
  const bySubtopic = new Map<string, QuestionTemplate[]>();
  const byIdMap = new Map<string, QuestionTemplate>();

  for (const template of templates) {
    const key = subtopicKey({
      grade: template.grade,
      topicId: template.topicId,
      subtopicId: template.subtopicId,
    });

    const list = bySubtopic.get(key) ?? [];
    list.push(template);
    bySubtopic.set(key, list);

    if (byIdMap.has(template.id)) {
      throw new Error(`Duplicate template id: ${template.id}`);
    }
    byIdMap.set(template.id, template);
  }

  return {
    all: templates,
    forSubtopic: (ref) => bySubtopic.get(subtopicKey(ref)) ?? [],
    byId: (id) => byIdMap.get(id),
    hasTemplates: (ref) => (bySubtopic.get(subtopicKey(ref))?.length ?? 0) > 0,
    ids: [...byIdMap.keys()],
  };
}

/**
 * Picks a template for a subtopic. When a subtopic has several templates they
 * are chosen at random, which spreads question styles within one session.
 */
export function pickTemplate(
  registry: TemplateRegistry,
  ref: SubtopicRef,
  rng: () => number,
): QuestionTemplate | undefined {
  const templates = registry.forSubtopic(ref);
  if (templates.length === 0) return undefined;
  return templates[randomInt(rng, 0, templates.length - 1)];
}

/** Seeds for a session: spread out so successives draws differ. */
export function nextSeed(rng: () => number): number {
  return randomInt(rng, 0, 2 ** 31 - 1);
}

export { makeRng };
