import type { Lesson } from '../types';
import { g1u01l1 } from './g1-u01-l1';
import { g1u01l2 } from './g1-u01-l2';
import { g1u01l3 } from './g1-u01-l3';
import { g1u01l4 } from './g1-u01-l4';
import { g1u01l5 } from './g1-u01-l5';
import { g1u02l1 } from './g1-u02-l1';
import { g1u02l2 } from './g1-u02-l2';
import { g1u02l3 } from './g1-u02-l3';
import { g1u02l4 } from './g1-u02-l4';
import { g1u02l5 } from './g1-u02-l5';
import { g1u03l1 } from './g1-u03-l1';
import { g1u03l2 } from './g1-u03-l2';
import { g1u03l3 } from './g1-u03-l3';
import { g1u03l4 } from './g1-u03-l4';
import { g1u03l5 } from './g1-u03-l5';
import { g6u10l3 } from './g6-u10-l3';

/**
 * Lesson content registry: catalog lesson id → content.
 *
 * Catalog lessons without an entry here are listed as "coming soon". To add a
 * lesson, create its file next to `g6-u10-l3.ts` and register it below.
 */
export const LESSON_CONTENT: Record<string, Lesson> = {
  [g1u01l1.id]: g1u01l1,
  [g1u01l2.id]: g1u01l2,
  [g1u01l3.id]: g1u01l3,
  [g1u01l4.id]: g1u01l4,
  [g1u01l5.id]: g1u01l5,
  [g1u02l1.id]: g1u02l1,
  [g1u02l2.id]: g1u02l2,
  [g1u02l3.id]: g1u02l3,
  [g1u02l4.id]: g1u02l4,
  [g1u02l5.id]: g1u02l5,
  [g1u03l1.id]: g1u03l1,
  [g1u03l2.id]: g1u03l2,
  [g1u03l3.id]: g1u03l3,
  [g1u03l4.id]: g1u03l4,
  [g1u03l5.id]: g1u03l5,
  [g6u10l3.id]: g6u10l3,
};

export const getLessonContent = (lessonId: string): Lesson | undefined => LESSON_CONTENT[lessonId];

/**
 * Dev-only markers (the "placeholder content" badge, status chips) are shown
 * in development builds only, so students never see internal labels. The
 * lesson itself stays playable in every build so it can be reviewed.
 */
export const showDevLabels = (): boolean => import.meta.env.DEV;
