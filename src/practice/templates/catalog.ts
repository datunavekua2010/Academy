import { SAMPLE_TEMPLATES } from './samples';
import { COVERAGE_TEMPLATES } from './coverage';
import { createTemplateRegistry } from './registry';

/**
 * `SAMPLE_TEMPLATES`  – showcase templates, one per generator capability.
 * `COVERAGE_TEMPLATES` – one compact pattern per remaining curriculum subtopic,
 *                        so every grade/topic/subtopic is playable today.
 *
 * Both are examples of the template format. Replace them with the academy's
 * templates when they arrive; the engine does not change.
 */

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
 *   ]);
 *
 * No other file needs to change — the generator, the session engine and the
 * practice page all work from the registry.
 *
 * Subtopic ids must match `src/practice/curriculum.ts`. A subtopic with no
 * template simply shows "not available yet" instead of breaking the page.
 */
export const TEMPLATE_REGISTRY = createTemplateRegistry([
  ...SAMPLE_TEMPLATES,
  ...COVERAGE_TEMPLATES,
]);

export { SAMPLE_TEMPLATES, COVERAGE_TEMPLATES };
