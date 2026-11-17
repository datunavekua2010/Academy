import { getTopic } from '../curriculum';
import { SAMPLE_TEMPLATES } from './samples';
import { GRADE1_PLACEHOLDERS } from './grade1-placeholders';
import { GRADE2_PLACEHOLDERS } from './grade2-placeholders';
import { GRADE3_PLACEHOLDERS } from './grade3-placeholders';
import {
  G5_CONVERTED_SUBTOPICS,
  GRADE5_PLACEHOLDERS,
} from './grade5-placeholders';
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
import { G1_INTERACTIVE_TEMPLATES } from './ix-g1';
import { G2_INTERACTIVE_TEMPLATES } from './ix-g2';
import { G3_INTERACTIVE_TEMPLATES } from './ix-g3';
import { G3_PICTURED_TEMPLATES } from './px-g3';
import { G2_PICTURED_TEMPLATES } from './px-g2';
import { G1_PICTURED_TEMPLATES } from './px-g1';
import { G2_U01_SUBTOPICS, G2_U01_TEMPLATES } from './g2-u01-numbers100';
import { G2_U02_SUBTOPICS, G2_U02_TEMPLATES } from './g2-u02-sequences';
import { G2_U03_SUBTOPICS, G2_U03_TEMPLATES } from './g2-u03-single-digit';
import { G2_U04_SUBTOPICS, G2_U04_TEMPLATES } from './g2-u04-two-digit-addition';
import { G2_U05_SUBTOPICS, G2_U05_TEMPLATES } from './g2-u05-two-digit-subtraction';
import { G2_U06_SUBTOPICS, G2_U06_TEMPLATES } from './g2-u06-comparison-ordering';
import { G2_U07_SUBTOPICS, G2_U07_TEMPLATES } from './g2-u07-quantity-models';
import { G2_U08_SUBTOPICS, G2_U08_TEMPLATES } from './g2-u08-multistep-problems';
import { G2_U09_SUBTOPICS, G2_U09_TEMPLATES } from './g2-u09-rounding';
import { G2_U10_SUBTOPICS, G2_U10_TEMPLATES } from './g2-u10-data-probability';
import { G2_U11_SUBTOPICS, G2_U11_TEMPLATES } from './g2-u11-measurement-geometry';
import { G2_U12_SUBTOPICS, G2_U12_TEMPLATES } from './g2-u12-money';
import { G2_U13_SUBTOPICS, G2_U13_TEMPLATES } from './g2-u13-time';
import { G2_U14_SUBTOPICS, G2_U14_TEMPLATES } from './g2-u14-patterns-logic';
import { G2_U15_SUBTOPICS, G2_U15_TEMPLATES } from './g2-u15-fractions';
import { G3_U01_SUBTOPICS, G3_U01_TEMPLATES } from './g3-u01-numbers100';
import { G3_U02_SUBTOPICS, G3_U02_TEMPLATES } from './g3-u02-sequences';
import { G3_U03_SUBTOPICS, G3_U03_TEMPLATES } from './g3-u03-single-digit';
import { G3_U04_SUBTOPICS, G3_U04_TEMPLATES } from './g3-u04-multiplication';
import { G3_U05_SUBTOPICS, G3_U05_TEMPLATES } from './g3-u05-division';
import { G3_U06_SUBTOPICS, G3_U06_TEMPLATES } from './g3-u06-quantity-comparisons';
import { G3_U07_SUBTOPICS, G3_U07_TEMPLATES } from './g3-u07-multi-operation';
import { G3_U08_SUBTOPICS, G3_U08_TEMPLATES } from './g3-u08-equations';
import { G3_U09_SUBTOPICS, G3_U09_TEMPLATES } from './g3-u09-rounding';
import { G3_U10_SUBTOPICS, G3_U10_TEMPLATES } from './g3-u10-measurement-geometry';
import { G3_U11_SUBTOPICS, G3_U11_TEMPLATES } from './g3-u11-money';
import { G3_U12_SUBTOPICS, G3_U12_TEMPLATES } from './g3-u12-data-probability';
import { G3_U13_SUBTOPICS, G3_U13_TEMPLATES } from './g3-u13-time-calendar';
import { G3_U14_SUBTOPICS, G3_U14_TEMPLATES } from './g3-u14-patterns-logic';
import { G3_U15_SUBTOPICS, G3_U15_TEMPLATES } from './g3-u15-fractions';
import { G5_U01_SUBTOPICS, G5_U01_TEMPLATES } from './g5-u01-number-system';
import { G5_U02_SUBTOPICS, G5_U02_TEMPLATES } from './g5-u02-divisibility';
import { G5_U03_SUBTOPICS, G5_U03_TEMPLATES } from './g5-u03-add-sub';
import { G5_U04_SUBTOPICS, G5_U04_TEMPLATES } from './g5-u04-multiplication';
import { G5_U05_SUBTOPICS, G5_U05_TEMPLATES } from './g5-u05-division';
import { G5_U06_SUBTOPICS, G5_U06_TEMPLATES } from './g5-u06-speed';
import { G5_U07_SUBTOPICS, G5_U07_TEMPLATES } from './g5-u07-fractions';
import { G5_U08_SUBTOPICS, G5_U08_TEMPLATES } from './g5-u08-fractions';
import { G5_U09_SUBTOPICS, G5_U09_TEMPLATES } from './g5-u09-multiply-fractions';
import { G5_U10_SUBTOPICS, G5_U10_TEMPLATES } from './g5-u10-divide-fractions';
import { G5_U11_SUBTOPICS, G5_U11_TEMPLATES } from './g5-u11-decimals';
import { G5_U12_SUBTOPICS, G5_U12_TEMPLATES } from './g5-u12-percents';
import { G5_U13_SUBTOPICS, G5_U13_TEMPLATES } from './g5-u13-measurement';
import { G5_U14_SUBTOPICS, G5_U14_TEMPLATES } from './g5-u14-coordinates';
import { G5_U15_SUBTOPICS, G5_U15_TEMPLATES } from './g5-u15-geometry';
import { G5_U16_SUBTOPICS, G5_U16_TEMPLATES } from './g5-u16-algebra';
import { G5_U17_SUBTOPICS, G5_U17_TEMPLATES } from './g5-u17-data';
import { G5_U18_SUBTOPICS, G5_U18_TEMPLATES } from './g5-u18-time-money';
import { G5_U19_SUBTOPICS, G5_U19_TEMPLATES } from './g5-u19-patterns';
import { G4_U01_SUBTOPICS, G4_U01_TEMPLATES } from './g4-u01-numbers';
import { G4_U02_SUBTOPICS, G4_U02_TEMPLATES } from './g4-u02-addition-subtraction';
import { G4_U03_SUBTOPICS, G4_U03_TEMPLATES } from './g4-u03-multiplication';
import { G4_U04_SUBTOPICS, G4_U04_TEMPLATES } from './g4-u04-division';
import { G4_U05_SUBTOPICS, G4_U05_TEMPLATES } from './g4-u05-algebra';
import { G4_U06_SUBTOPICS, G4_U06_TEMPLATES } from './g4-u06-comparative-word-problems';
import { G4_U07_SUBTOPICS, G4_U07_TEMPLATES } from './g4-u07-multi-step-problems';
import { G4_U08_SUBTOPICS, G4_U08_TEMPLATES } from './g4-u08-data-analysis';
import { G4_U09_SUBTOPICS, G4_U09_TEMPLATES } from './g4-u09-financial-literacy';
import { G4_U10_SUBTOPICS, G4_U10_TEMPLATES } from './g4-u10-measurement';
import { G4_U11_SUBTOPICS, G4_U11_TEMPLATES } from './g4-u11-geometry';
import { G4_U12_SUBTOPICS, G4_U12_TEMPLATES } from './g4-u12-time';
import { G4_U13_SUBTOPICS, G4_U13_TEMPLATES } from './g4-u13-speed-distance';
import { G4_U14_SUBTOPICS, G4_U14_TEMPLATES } from './g4-u14-probability';
import { G4_U15_SUBTOPICS, G4_U15_TEMPLATES } from './g4-u15-fractions';
import { G4_U16_SUBTOPICS, G4_U16_TEMPLATES } from './g4-u16-decimals';
import { G4_U17_SUBTOPICS, G4_U17_TEMPLATES } from './g4-u17-logic';
import { G4_U18_SUBTOPICS, G4_U18_TEMPLATES } from './g4-u18-patterns';
import { G6_U01_SUBTOPICS, G6_U01_TEMPLATES } from './g6-u01-numbers';
import { G6_U02_SUBTOPICS, G6_U02_TEMPLATES } from './g6-u02-whole-ops';
import { G6_U03_SUBTOPICS, G6_U03_TEMPLATES } from './g6-u03-negative-rational';
import { G6_U04_SUBTOPICS, G6_U04_TEMPLATES } from './g6-u04-fractions';
import { G6_U05_SUBTOPICS, G6_U05_TEMPLATES } from './g6-u05-decimals';
import { G6_U06_SUBTOPICS, G6_U06_TEMPLATES } from './g6-u06-mixed';
import { G6_U07_SUBTOPICS, G6_U07_TEMPLATES } from './g6-u07-percent';
import { G6_U08_SUBTOPICS, G6_U08_TEMPLATES } from './g6-u08-money';
import { G6_U09_SUBTOPICS, G6_U09_TEMPLATES } from './g6-u09-multistep';
import { G6_U10_SUBTOPICS, G6_U10_TEMPLATES } from './g6-u10-algebra';
import { G6_U11_SUBTOPICS, G6_U11_TEMPLATES } from './g6-u11-measure-time';
import { G6_U12_SUBTOPICS, G6_U12_TEMPLATES } from './g6-u12-coordinates';
import { G6_U13_SUBTOPICS, G6_U13_TEMPLATES } from './g6-u13-powers-roots';
import { G6_U14_SUBTOPICS, G6_U14_TEMPLATES } from './g6-u14-patterns-chance';
import { G6_U15_SUBTOPICS, G6_U15_TEMPLATES } from './g6-u15-statistics';
import { G6_U16_SUBTOPICS, G6_U16_TEMPLATES } from './g6-u16-angles-circles';
import { G6_U17_SUBTOPICS, G6_U17_TEMPLATES } from './g6-u17-triangles-quads';
import { G6_U18_SUBTOPICS, G6_U18_TEMPLATES } from './g6-u18-area-volume';
import { G7_U01_SUBTOPICS, G7_U01_TEMPLATES } from './g7-u01-numbers-ops';
import { G7_U02_SUBTOPICS, G7_U02_TEMPLATES } from './g7-u02-comparing';
import { G7_U03_SUBTOPICS, G7_U03_TEMPLATES } from './g7-u03-sets';
import { G7_U04_SUBTOPICS, G7_U04_TEMPLATES } from './g7-u04-sequences';
import { G7_U05_SUBTOPICS, G7_U05_TEMPLATES } from './g7-u05-powers-roots';
import { G7_U06_SUBTOPICS, G7_U06_TEMPLATES } from './g7-u06-expressions';
import { G7_U07_SUBTOPICS, G7_U07_TEMPLATES } from './g7-u07-equations';
import { G7_U08_SUBTOPICS, G7_U08_TEMPLATES } from './g7-u08-proportion-percent';
import { G7_U09_SUBTOPICS, G7_U09_TEMPLATES } from './g7-u09-multistep';
import { G7_U10_SUBTOPICS, G7_U10_TEMPLATES } from './g7-u10-number-line';
import { G7_U11_SUBTOPICS, G7_U11_TEMPLATES } from './g7-u11-data';
import { G7_U12_SUBTOPICS, G7_U12_TEMPLATES } from './g7-u12-probability';
import { G7_U13_SUBTOPICS, G7_U13_TEMPLATES } from './g7-u13-logic';
import { G7_U14_SUBTOPICS, G7_U14_TEMPLATES } from './g7-u14-lines-circles';
import { G7_U15_SUBTOPICS, G7_U15_TEMPLATES } from './g7-u15-triangles';
import { G7_U16_SUBTOPICS, G7_U16_TEMPLATES } from './g7-u16-quadrilaterals';
import { G7_U17_SUBTOPICS, G7_U17_TEMPLATES } from './g7-u17-area-volume';
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

const coveredGrade2Subtopics = new Set<string>([
  ...G2_U01_SUBTOPICS,
  ...G2_U02_SUBTOPICS,
  ...G2_U03_SUBTOPICS,
  ...G2_U04_SUBTOPICS,
  ...G2_U05_SUBTOPICS,
  ...G2_U06_SUBTOPICS,
  ...G2_U07_SUBTOPICS,
  ...G2_U08_SUBTOPICS,
  ...G2_U09_SUBTOPICS,
  ...G2_U10_SUBTOPICS,
  ...G2_U11_SUBTOPICS,
  ...G2_U12_SUBTOPICS,
  ...G2_U13_SUBTOPICS,
  ...G2_U14_SUBTOPICS,
  ...G2_U15_SUBTOPICS,
]);
const remainingGrade2Placeholders = GRADE2_PLACEHOLDERS.filter(
  (template) => !coveredGrade2Subtopics.has(template.subtopicId),
);

const coveredGrade3Subtopics = new Set<string>([
  ...G3_U01_SUBTOPICS,
  ...G3_U02_SUBTOPICS,
  ...G3_U03_SUBTOPICS,
  ...G3_U04_SUBTOPICS,
  ...G3_U05_SUBTOPICS,
  ...G3_U06_SUBTOPICS,
  ...G3_U07_SUBTOPICS,
  ...G3_U08_SUBTOPICS,
  ...G3_U09_SUBTOPICS,
  ...G3_U10_SUBTOPICS,
  ...G3_U11_SUBTOPICS,
  ...G3_U12_SUBTOPICS,
  ...G3_U13_SUBTOPICS,
  ...G3_U14_SUBTOPICS,
  ...G3_U15_SUBTOPICS,
]);
const remainingGrade3Placeholders = GRADE3_PLACEHOLDERS.filter(
  (template) => !coveredGrade3Subtopics.has(template.subtopicId),
);

/**
 * Grade V runs entirely on placeholders today, so there is no "real library"
 * set to filter against — only the list a converted unit appends itself to as
 * the academy's own templates land. Reading it from the file keeps the drop
 * rule in one place: a converted subtopic never keeps its placeholder.
 */
const remainingGrade5Placeholders = GRADE5_PLACEHOLDERS.filter(
  (template) => !G5_CONVERTED_SUBTOPICS.includes(template.subtopicId),
);

export const TEMPLATE_REGISTRY = createTemplateRegistry(
  [
    ...SAMPLE_TEMPLATES,
    ...G1_INTERACTIVE_TEMPLATES,
    ...G2_INTERACTIVE_TEMPLATES,
    ...G3_INTERACTIVE_TEMPLATES,
    ...G3_PICTURED_TEMPLATES,
    ...G2_PICTURED_TEMPLATES,
    ...G1_PICTURED_TEMPLATES,
    ...G5_U01_TEMPLATES,
    ...G5_U02_TEMPLATES,
    ...G5_U03_TEMPLATES,
    ...G5_U04_TEMPLATES,
    ...G5_U05_TEMPLATES,
    ...G5_U06_TEMPLATES,
    ...G5_U07_TEMPLATES,
    ...G5_U08_TEMPLATES,
    ...G5_U09_TEMPLATES,
    ...G5_U10_TEMPLATES,
    ...G5_U11_TEMPLATES,
    ...G5_U12_TEMPLATES,
    ...G5_U13_TEMPLATES,
    ...G5_U14_TEMPLATES,
    ...G5_U15_TEMPLATES,
    ...G5_U16_TEMPLATES,
    ...G5_U17_TEMPLATES,
    ...G5_U18_TEMPLATES,
    ...G5_U19_TEMPLATES,
    ...G6_U01_TEMPLATES,
    ...G6_U02_TEMPLATES,
    ...G6_U03_TEMPLATES,
    ...G6_U04_TEMPLATES,
    ...G6_U05_TEMPLATES,
    ...G6_U06_TEMPLATES,
    ...G6_U07_TEMPLATES,
    ...G6_U08_TEMPLATES,
    ...G6_U09_TEMPLATES,
    ...G6_U10_TEMPLATES,
    ...G6_U11_TEMPLATES,
    ...G6_U12_TEMPLATES,
    ...G6_U13_TEMPLATES,
    ...G6_U14_TEMPLATES,
    ...G6_U15_TEMPLATES,
    ...G6_U16_TEMPLATES,
    ...G6_U17_TEMPLATES,
    ...G6_U18_TEMPLATES,
    ...G7_U01_TEMPLATES,
    ...G7_U02_TEMPLATES,
    ...G7_U03_TEMPLATES,
    ...G7_U04_TEMPLATES,
    ...G7_U05_TEMPLATES,
    ...G7_U06_TEMPLATES,
    ...G7_U07_TEMPLATES,
    ...G7_U08_TEMPLATES,
    ...G7_U09_TEMPLATES,
    ...G7_U10_TEMPLATES,
    ...G7_U11_TEMPLATES,
    ...G7_U12_TEMPLATES,
    ...G7_U13_TEMPLATES,
    ...G7_U14_TEMPLATES,
    ...G7_U15_TEMPLATES,
    ...G7_U16_TEMPLATES,
    ...G7_U17_TEMPLATES,
    ...COVERAGE_TEMPLATES,
    ...remainingPlaceholders,
    ...remainingGrade2Placeholders,
    ...remainingGrade3Placeholders,
    ...remainingGrade5Placeholders,
    ...G4_U01_TEMPLATES,
    ...G4_U02_TEMPLATES,
    ...G4_U03_TEMPLATES,
    ...G4_U04_TEMPLATES,
    ...G4_U05_TEMPLATES,
    ...G4_U06_TEMPLATES,
    ...G4_U07_TEMPLATES,
    ...G4_U08_TEMPLATES,
    ...G4_U09_TEMPLATES,
    ...G4_U10_TEMPLATES,
    ...G4_U11_TEMPLATES,
    ...G4_U12_TEMPLATES,
    ...G4_U13_TEMPLATES,
    ...G4_U14_TEMPLATES,
    ...G4_U15_TEMPLATES,
    ...G4_U16_TEMPLATES,
    ...G4_U17_TEMPLATES,
    ...G4_U18_TEMPLATES,
    ...G3_U01_TEMPLATES,
    ...G3_U02_TEMPLATES,
    ...G3_U03_TEMPLATES,
    ...G3_U04_TEMPLATES,
    ...G3_U05_TEMPLATES,
    ...G3_U06_TEMPLATES,
    ...G3_U07_TEMPLATES,
    ...G3_U08_TEMPLATES,
    ...G3_U09_TEMPLATES,
    ...G3_U10_TEMPLATES,
    ...G3_U11_TEMPLATES,
    ...G3_U12_TEMPLATES,
    ...G3_U13_TEMPLATES,
    ...G3_U14_TEMPLATES,
    ...G3_U15_TEMPLATES,
    ...G2_U01_TEMPLATES,
    ...G2_U02_TEMPLATES,
    ...G2_U03_TEMPLATES,
    ...G2_U04_TEMPLATES,
    ...G2_U05_TEMPLATES,
    ...G2_U06_TEMPLATES,
    ...G2_U07_TEMPLATES,
    ...G2_U08_TEMPLATES,
    ...G2_U09_TEMPLATES,
    ...G2_U10_TEMPLATES,
    ...G2_U11_TEMPLATES,
    ...G2_U12_TEMPLATES,
    ...G2_U13_TEMPLATES,
    ...G2_U14_TEMPLATES,
    ...G2_U15_TEMPLATES,
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
  G5_U01_TEMPLATES,
  G5_U01_SUBTOPICS,
  G5_U02_TEMPLATES,
  G5_U02_SUBTOPICS,
  G5_U03_TEMPLATES,
  G5_U03_SUBTOPICS,
  G5_U04_TEMPLATES,
  G5_U04_SUBTOPICS,
  G5_U05_TEMPLATES,
  G5_U05_SUBTOPICS,
  G5_U06_TEMPLATES,
  G5_U06_SUBTOPICS,
  G5_U07_TEMPLATES,
  G5_U07_SUBTOPICS,
  G5_U08_TEMPLATES,
  G5_U08_SUBTOPICS,
  G5_U09_TEMPLATES,
  G5_U09_SUBTOPICS,
  G5_U10_TEMPLATES,
  G5_U10_SUBTOPICS,
  G5_U11_TEMPLATES,
  G5_U11_SUBTOPICS,
  G5_U12_TEMPLATES,
  G5_U12_SUBTOPICS,
  G5_U13_TEMPLATES,
  G5_U13_SUBTOPICS,
  G5_U14_TEMPLATES,
  G5_U14_SUBTOPICS,
  G5_U15_TEMPLATES,
  G5_U15_SUBTOPICS,
  G5_U16_TEMPLATES,
  G5_U16_SUBTOPICS,
  G5_U17_TEMPLATES,
  G5_U17_SUBTOPICS,
  G5_U18_TEMPLATES,
  G5_U18_SUBTOPICS,
  G5_U19_TEMPLATES,
  G5_U19_SUBTOPICS,
  G6_U01_TEMPLATES,
  G6_U01_SUBTOPICS,
  G6_U02_TEMPLATES,
  G6_U02_SUBTOPICS,
  G6_U03_TEMPLATES,
  G6_U03_SUBTOPICS,
  G6_U04_TEMPLATES,
  G6_U04_SUBTOPICS,
  G6_U05_TEMPLATES,
  G6_U05_SUBTOPICS,
  G6_U06_TEMPLATES,
  G6_U06_SUBTOPICS,
  G6_U07_TEMPLATES,
  G6_U07_SUBTOPICS,
  G6_U08_TEMPLATES,
  G6_U08_SUBTOPICS,
  G6_U09_TEMPLATES,
  G6_U09_SUBTOPICS,
  G6_U10_TEMPLATES,
  G6_U10_SUBTOPICS,
  G6_U11_TEMPLATES,
  G6_U11_SUBTOPICS,
  G6_U12_TEMPLATES,
  G6_U12_SUBTOPICS,
  G6_U13_TEMPLATES,
  G6_U13_SUBTOPICS,
  G6_U14_TEMPLATES,
  G6_U14_SUBTOPICS,
  G6_U15_TEMPLATES,
  G6_U15_SUBTOPICS,
  G6_U16_TEMPLATES,
  G6_U16_SUBTOPICS,
  G6_U17_TEMPLATES,
  G6_U17_SUBTOPICS,
  G6_U18_TEMPLATES,
  G6_U18_SUBTOPICS,
  G7_U01_TEMPLATES,
  G7_U01_SUBTOPICS,
  G7_U02_TEMPLATES,
  G7_U02_SUBTOPICS,
  G7_U03_TEMPLATES,
  G7_U03_SUBTOPICS,
  G7_U04_TEMPLATES,
  G7_U04_SUBTOPICS,
  G7_U05_TEMPLATES,
  G7_U05_SUBTOPICS,
  G7_U06_TEMPLATES,
  G7_U06_SUBTOPICS,
  G7_U07_TEMPLATES,
  G7_U07_SUBTOPICS,
  G7_U08_TEMPLATES,
  G7_U08_SUBTOPICS,
  G7_U09_TEMPLATES,
  G7_U09_SUBTOPICS,
  G7_U10_TEMPLATES,
  G7_U10_SUBTOPICS,
  G7_U11_TEMPLATES,
  G7_U11_SUBTOPICS,
  G7_U12_TEMPLATES,
  G7_U12_SUBTOPICS,
  G7_U13_TEMPLATES,
  G7_U13_SUBTOPICS,
  G7_U14_TEMPLATES,
  G7_U14_SUBTOPICS,
  G7_U15_TEMPLATES,
  G7_U15_SUBTOPICS,
  G7_U16_TEMPLATES,
  G7_U16_SUBTOPICS,
  G7_U17_TEMPLATES,
  G7_U17_SUBTOPICS,
  GRADE1_PLACEHOLDERS,
  GRADE2_PLACEHOLDERS,
  GRADE3_PLACEHOLDERS,
  GRADE5_PLACEHOLDERS,
  G5_CONVERTED_SUBTOPICS,
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
  G2_U01_TEMPLATES,
  G2_U01_SUBTOPICS,
  G2_U02_TEMPLATES,
  G2_U02_SUBTOPICS,
  G2_U03_TEMPLATES,
  G2_U03_SUBTOPICS,
  G2_U04_TEMPLATES,
  G2_U04_SUBTOPICS,
  G2_U05_TEMPLATES,
  G2_U05_SUBTOPICS,
  G2_U06_TEMPLATES,
  G2_U06_SUBTOPICS,
  G2_U07_TEMPLATES,
  G2_U07_SUBTOPICS,
  G2_U08_TEMPLATES,
  G2_U08_SUBTOPICS,
  G2_U09_TEMPLATES,
  G2_U09_SUBTOPICS,
  G2_U10_TEMPLATES,
  G2_U10_SUBTOPICS,
  G2_U11_TEMPLATES,
  G2_U11_SUBTOPICS,
  G2_U12_TEMPLATES,
  G2_U12_SUBTOPICS,
  G2_U13_TEMPLATES,
  G2_U13_SUBTOPICS,
  G2_U14_TEMPLATES,
  G2_U14_SUBTOPICS,
  G2_U15_TEMPLATES,
  G2_U15_SUBTOPICS,
  G3_U01_TEMPLATES,
  G3_U01_SUBTOPICS,
  G3_U02_TEMPLATES,
  G3_U02_SUBTOPICS,
  G3_U03_TEMPLATES,
  G3_U03_SUBTOPICS,
  G3_U04_TEMPLATES,
  G3_U04_SUBTOPICS,
  G3_U05_TEMPLATES,
  G3_U05_SUBTOPICS,
  G3_U06_TEMPLATES,
  G3_U06_SUBTOPICS,
  G3_U07_TEMPLATES,
  G3_U07_SUBTOPICS,
  G3_U08_TEMPLATES,
  G3_U08_SUBTOPICS,
  G3_U09_TEMPLATES,
  G3_U09_SUBTOPICS,
  G3_U10_TEMPLATES,
  G3_U10_SUBTOPICS,
  G3_U11_TEMPLATES,
  G3_U11_SUBTOPICS,
  G3_U12_TEMPLATES,
  G3_U12_SUBTOPICS,
  G3_U13_TEMPLATES,
  G3_U13_SUBTOPICS,
  G3_U14_TEMPLATES,
  G3_U14_SUBTOPICS,
  G3_U15_TEMPLATES,
  G3_U15_SUBTOPICS,
  G4_U01_TEMPLATES,
  G4_U01_SUBTOPICS,
  G4_U02_TEMPLATES,
  G4_U02_SUBTOPICS,
  G4_U03_TEMPLATES,
  G4_U03_SUBTOPICS,
  G4_U04_TEMPLATES,
  G4_U04_SUBTOPICS,
  G4_U05_TEMPLATES,
  G4_U05_SUBTOPICS,
  G4_U06_TEMPLATES,
  G4_U06_SUBTOPICS,
  G4_U07_TEMPLATES,
  G4_U07_SUBTOPICS,
  G4_U08_TEMPLATES,
  G4_U08_SUBTOPICS,
  G4_U09_TEMPLATES,
  G4_U09_SUBTOPICS,
  G4_U10_TEMPLATES,
  G4_U10_SUBTOPICS,
  G4_U11_TEMPLATES,
  G4_U11_SUBTOPICS,
  G4_U12_TEMPLATES,
  G4_U12_SUBTOPICS,
  G4_U13_TEMPLATES,
  G4_U13_SUBTOPICS,
  G4_U14_TEMPLATES,
  G4_U14_SUBTOPICS,
  G4_U15_TEMPLATES,
  G4_U15_SUBTOPICS,
  G4_U16_TEMPLATES,
  G4_U16_SUBTOPICS,
  G4_U17_TEMPLATES,
  G4_U17_SUBTOPICS,
  G4_U18_TEMPLATES,
  G4_U18_SUBTOPICS,
};
