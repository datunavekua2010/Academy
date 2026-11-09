import type { GradeId, SubtopicRef, Topic } from '../types';
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
  /** Templates for a whole topic (all subtopics and units). */
  forTopic: (grade: GradeId, topicId: string) => QuestionTemplate[];
  byId: (id: string) => QuestionTemplate | undefined;
  /** True when the subtopic has at least one template (i.e. is playable). */
  hasTemplates: (ref: SubtopicRef) => boolean;
  /** Unique template ids — used to deduplicate and validate. */
  ids: string[];
}

/**
 * Looks a topic up in the curriculum. Passed in rather than imported so the
 * registry stays testable and has no dependency on curriculum contents.
 */
export type TopicResolver = (grade: GradeId, topicId: string) => Topic | undefined;

export interface RegistryOptions {
  /** Enables validation of grade/topic/unit/subtopic metadata. */
  resolveTopic?: TopicResolver;
}

/**
 * Structural checks that do not depend on the curriculum: ids, variables,
 * wording and the answer rule. A template that fails these would misbehave at
 * runtime, so it is rejected when the registry is built instead.
 */
function validateShape(template: QuestionTemplate): void {
  const where = `template "${template.id}"`;

  if (!template.id.trim()) throw new Error('A template needs a non-empty id');
  if (!template.prompt.trim()) throw new Error(`${where}: prompt is empty`);
  if (!template.prompt.includes('{') && !template.visual) {
    // Not fatal — a constant prompt is legal — but it means nothing varies in
    // the wording, which is almost always a mistake. A template that declares
    // `visual` is exempt: "how many objects are there?" is deliberately fixed
    // wording, and the variation is carried by the picture beneath it.
    console.warn(`${where}: prompt has no {placeholder}, so every variation reads the same`);
  }
  if (typeof template.answer !== 'function') {
    throw new Error(`${where}: answer must be a function computing the answer from the values`);
  }
  if (typeof template.explanation !== 'function') {
    throw new Error(`${where}: explanation must be a function`);
  }
  if (!template.variables || Object.keys(template.variables).length === 0) {
    throw new Error(`${where}: needs at least one variable to generate variations`);
  }

  for (const [name, spec] of Object.entries(template.variables)) {
    if (spec.kind === 'choice') {
      // A function pool is derived at draw time, so its size is not knowable
      // here — the generator checks it produced a value, and templates that
      // derive a *single* value depend on an earlier variable for correctness.
      if (typeof spec.values === 'function') continue;
      if (!Array.isArray(spec.values) || spec.values.length < 2) {
        throw new Error(`${where}: choice variable "${name}" needs at least two values`);
      }
      continue;
    }
    if (spec.kind === 'list') {
      if (!Array.isArray(spec.pick.values) || spec.pick.values.length < 1) {
        throw new Error(`${where}: list variable "${name}" needs at least one value to pick from`);
      }
      const length = spec.pick.length;
      if (typeof length === 'number' && length < 1) {
        throw new Error(`${where}: list variable "${name}" needs a positive length`);
      }
      if (typeof length !== 'number' && length.max < length.min) {
        throw new Error(`${where}: list variable "${name}" has max length below min`);
      }
      continue;
    }
    if (spec.kind !== 'int') {
      throw new Error(`${where}: variable "${name}" has unknown kind`);
    }
    if (typeof spec.min === 'number' && typeof spec.max === 'number' && spec.max < spec.min) {
      throw new Error(`${where}: variable "${name}" has max below min`);
    }
    if (spec.step !== undefined && spec.step <= 0) {
      throw new Error(`${where}: variable "${name}" needs a positive step`);
    }
  }

  // Placeholders in the prompt must exist as variables, otherwise the student
  // would see a literal "{x}".
  for (const match of template.prompt.matchAll(/\{(\w+)\}/g)) {
    if (!Object.prototype.hasOwnProperty.call(template.variables, match[1])) {
      throw new Error(`${where}: prompt uses {${match[1]}} but no such variable is declared`);
    }
  }
}

/**
 * Curriculum checks: the template must point at a subtopic that really exists,
 * and — when it declares a unit — that unit must be the one owning the
 * subtopic. This catches the common copy-paste error of moving a template to a
 * different subtopic and forgetting the metadata.
 */
function validatePlacement(
  template: QuestionTemplate,
  resolveTopic: TopicResolver,
): void {
  const where = `template "${template.id}"`;
  const topic = resolveTopic(template.grade, template.topicId);

  if (!topic) {
    throw new Error(
      `${where}: grade ${template.grade} has no topic "${template.topicId}" in the curriculum`,
    );
  }

  const unit = topic.units.find((item) =>
    item.subtopics.some((subtopic) => subtopic.id === template.subtopicId),
  );

  if (!unit) {
    throw new Error(
      `${where}: topic "${template.topicId}" has no subtopic "${template.subtopicId}" in the curriculum`,
    );
  }

  if (template.unitId && template.unitId !== unit.id) {
    throw new Error(
      `${where}: declares unit "${template.unitId}" but subtopic "${template.subtopicId}" belongs to unit "${unit.id}"`,
    );
  }
}

export function createTemplateRegistry(
  templates: QuestionTemplate[],
  options: RegistryOptions = {},
): TemplateRegistry {
  const bySubtopic = new Map<string, QuestionTemplate[]>();
  const byIdMap = new Map<string, QuestionTemplate>();

  for (const template of templates) {
    validateShape(template);
    if (options.resolveTopic) validatePlacement(template, options.resolveTopic);

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
    forTopic: (grade, topicId) =>
      templates.filter((template) => template.grade === grade && template.topicId === topicId),
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
