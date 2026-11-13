import { getTopic } from '../curriculum';
import { SAMPLE_TEMPLATES } from './samples';
import { GRADE1_PLACEHOLDERS } from './grade1-placeholders';
import { GRADE2_PLACEHOLDERS } from './grade2-placeholders';
import { U01_SUBTOPICS, U01_TEMPLATES } from './u01-space';
import { U02_SUBTOPICS, U02_TEMPLATES } from './u02-numbers';
import { U03_SUBTOPICS, U03_TEMPLATES } from './u03-counting';
import { U04_SUBTOPICS, U04_TEMPLATES } from './u04-numbers100';
import { U05_SUBTOPICS, U05_TEMPLATES } from './u05-compare';
import { U06_SUBTOPICS, U06_TEMPLATES } from './u06-addition';
import { U07_SUBTOPICS, U07_TEMPLATES } from './u07-subtraction';
import { U08_SUBTOPICS, U08_TEMPLATES } from './u08-two-digit';
import { U09_SUBTOPICS, U09_TEMPLATES } from './u09-mixed';
import { U10_SUBTOPICS, U10_TEMPLATES } from './u10-models';
import { U11_SUBTOPICS, U11_TEMPLATES } from './u11-patterns';
import { U12_SUBTOPICS, U12_TEMPLATES } from './u12-geometry';
import { U13_SUBTOPICS, U13_TEMPLATES } from './u13-time';
import { U14_SUBTOPICS, U14_TEMPLATES } from './u14-money';
import { U15_SUBTOPICS, U15_TEMPLATES } from './u15-parts';
import { U16_SUBTOPICS, U16_TEMPLATES } from './u16-logic';
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
const coveredByRealTemplates = new Set<string>([
  ...U01_SUBTOPICS,
  ...U02_SUBTOPICS,
  ...U03_SUBTOPICS,
  ...U04_SUBTOPICS,
  ...U05_SUBTOPICS,
  ...U06_SUBTOPICS,
  ...U07_SUBTOPICS,
  ...U08_SUBTOPICS,
  ...U09_SUBTOPICS,
  ...U10_SUBTOPICS,
  ...U11_SUBTOPICS,
  ...U12_SUBTOPICS,
  ...U13_SUBTOPICS,
  ...U14_SUBTOPICS,
  ...U15_SUBTOPICS,
  ...U16_SUBTOPICS,
]);
const remainingPlaceholders = GRADE1_PLACEHOLDERS.filter(
  (template) => !coveredByRealTemplates.has(template.subtopicId),
);

export const TEMPLATE_REGISTRY = createTemplateRegistry(
  [
    ...SAMPLE_TEMPLATES,
    ...COVERAGE_TEMPLATES,
    ...remainingPlaceholders,
    ...GRADE2_PLACEHOLDERS,
    ...U01_TEMPLATES,
    ...U02_TEMPLATES,
    ...U03_TEMPLATES,
    ...U04_TEMPLATES,
    ...U05_TEMPLATES,
    ...U06_TEMPLATES,
    ...U07_TEMPLATES,
    ...U08_TEMPLATES,
    ...U09_TEMPLATES,
    ...U10_TEMPLATES,
    ...U11_TEMPLATES,
    ...U12_TEMPLATES,
    ...U13_TEMPLATES,
    ...U14_TEMPLATES,
    ...U15_TEMPLATES,
    ...U16_TEMPLATES,
  ],
  { resolveTopic: getTopic },
);

export {
  SAMPLE_TEMPLATES,
  COVERAGE_TEMPLATES,
  GRADE1_PLACEHOLDERS,
  GRADE2_PLACEHOLDERS,
  U01_TEMPLATES,
  U01_SUBTOPICS,
  U02_TEMPLATES,
  U02_SUBTOPICS,
  U03_TEMPLATES,
  U03_SUBTOPICS,
  U04_TEMPLATES,
  U04_SUBTOPICS,
  U05_TEMPLATES,
  U05_SUBTOPICS,
  U06_TEMPLATES,
  U06_SUBTOPICS,
  U07_TEMPLATES,
  U07_SUBTOPICS,
  U08_TEMPLATES,
  U08_SUBTOPICS,
  U09_TEMPLATES,
  U09_SUBTOPICS,
  U10_TEMPLATES,
  U10_SUBTOPICS,
  U11_TEMPLATES,
  U11_SUBTOPICS,
  U12_TEMPLATES,
  U12_SUBTOPICS,
  U13_TEMPLATES,
  U13_SUBTOPICS,
  U14_TEMPLATES,
  U14_SUBTOPICS,
  U15_TEMPLATES,
  U15_SUBTOPICS,
  U16_TEMPLATES,
  U16_SUBTOPICS,
};
