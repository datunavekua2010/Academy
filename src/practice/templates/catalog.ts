import { getTopic } from '../curriculum';
import { SAMPLE_TEMPLATES } from './samples';
import { GRADE1_PLACEHOLDERS } from './grade1-placeholders';
import { U01_SUBTOPICS, U01_TEMPLATES } from './u01-space';
import { COVERAGE_TEMPLATES } from './coverage';
import { createTemplateRegistry } from './registry';

/**
 * The app's template catalog.
 *
 * ⬇ Spread your own templates in here. Each array is just a list of
 * `defineTemplate({...})` objects; add as many files as you like:
 *
 *   import { GEOMETRY_TEMPLATES } from './geometry';
 *   import { FRACTION_TEMPLATES } from './fractions';
 *
 *   export const TEMPLATE_REGISTRY = createTemplateRegistry([
 *     ...SAMPLE_TEMPLATES,
 *     ...GEOMETRY_TEMPLATES,
 *     ...FRACTION_TEMPLATES,
 *   ], { resolveTopic: getTopic });
 *
 * No other file needs to change — the generator, the session engine and the
 * practice page all work from the registry.
 *
 * Validation runs once, at module load:
 *   • every template must have an id, a prompt, at least one variable and an
 *     answer rule;
 *   • every {placeholder} in the prompt must be a declared variable;
 *   • grade/topic/subtopic must exist in the curriculum;
 *   • if `unitId` is declared, it must be the unit that owns that subtopic.
 * A mistake throws immediately with the template id, instead of producing a
 * broken question for a student hours later.
 *
 * `SAMPLE_TEMPLATES`  – showcase patterns, one per generator capability.
 * `COVERAGE_TEMPLATES` – one compact pattern per remaining curriculum subtopic,
 *                        so every grade/topic/subtopic is playable today.
 * Both are examples of the format and can be deleted once the academy's own
 * templates are supplied; the engine does not change.
 */
/**
 * A placeholder is dropped as soon as a real template covers its subtopic, so
 * the academy's own content always wins and the two can never both answer the
 * same subtopic. This keeps `grade1-placeholders.ts` untouched as U02…U16 are
 * converted one at a time.
 */
const coveredByRealTemplates = new Set<string>(U01_SUBTOPICS);
const remainingPlaceholders = GRADE1_PLACEHOLDERS.filter(
  (template) => !coveredByRealTemplates.has(template.subtopicId),
);

export const TEMPLATE_REGISTRY = createTemplateRegistry(
  [...SAMPLE_TEMPLATES, ...COVERAGE_TEMPLATES, ...remainingPlaceholders, ...U01_TEMPLATES],
  { resolveTopic: getTopic },
);

export {
  SAMPLE_TEMPLATES,
  COVERAGE_TEMPLATES,
  GRADE1_PLACEHOLDERS,
  U01_TEMPLATES,
  U01_SUBTOPICS,
};
