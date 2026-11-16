import type { QuestionTemplate } from './types';

/**
 * One template per curriculum subtopic that the showcase templates in
 * `samples.ts` do not cover.
 *
 * These are still *patterns*, not questions: each entry is a few lines of
 * arithmetic that the generator turns into an unlimited number of variations.
 * They exist so every grade → topic → subtopic in the curriculum is playable
 * today. When the academy supplies its own templates, delete this file and
 * swap it in `catalog.ts` — nothing else changes.
 */

export const COVERAGE_TEMPLATES: QuestionTemplate[] = [
  // ------------------------------------------------------------ grade IV
  // ------------------------------------------------------------ grade VI
];
