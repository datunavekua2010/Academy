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
import { g1u04l1 } from './g1-u04-l1';
import { g1u04l2 } from './g1-u04-l2';
import { g1u04l3 } from './g1-u04-l3';
import { g1u04l4 } from './g1-u04-l4';
import { g1u04l5 } from './g1-u04-l5';
import { g1u05l1 } from './g1-u05-l1';
import { g1u05l2 } from './g1-u05-l2';
import { g1u05l3 } from './g1-u05-l3';
import { g1u05l4 } from './g1-u05-l4';
import { g1u05l5 } from './g1-u05-l5';
import { g1u06l1 } from './g1-u06-l1';
import { g1u06l2 } from './g1-u06-l2';
import { g1u06l3 } from './g1-u06-l3';
import { g1u06l4 } from './g1-u06-l4';
import { g1u06l5 } from './g1-u06-l5';
import { g1u07l1 } from './g1-u07-l1';
import { g1u07l2 } from './g1-u07-l2';
import { g1u07l3 } from './g1-u07-l3';
import { g1u07l4 } from './g1-u07-l4';
import { g1u07l5 } from './g1-u07-l5';
import { g1u08l1 } from './g1-u08-l1';
import { g1u08l2 } from './g1-u08-l2';
import { g1u08l3 } from './g1-u08-l3';
import { g1u08l4 } from './g1-u08-l4';
import { g1u08l5 } from './g1-u08-l5';
import { g1u09l1 } from './g1-u09-l1';
import { g1u09l2 } from './g1-u09-l2';
import { g1u09l3 } from './g1-u09-l3';
import { g1u09l4 } from './g1-u09-l4';
import { g1u09l5 } from './g1-u09-l5';
import { g1u10l1 } from './g1-u10-l1';
import { g1u10l2 } from './g1-u10-l2';
import { g1u10l3 } from './g1-u10-l3';
import { g1u10l4 } from './g1-u10-l4';
import { g1u10l5 } from './g1-u10-l5';
import { g6u10l3 } from './g6-u10-l3';
import { g2u01l1 } from './g2-u01-l1';
import { g2u01l2 } from './g2-u01-l2';
import { g2u01l3 } from './g2-u01-l3';
import { g2u01l4 } from './g2-u01-l4';
import { g2u01l5 } from './g2-u01-l5';

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
  [g1u04l1.id]: g1u04l1,
  [g1u04l2.id]: g1u04l2,
  [g1u04l3.id]: g1u04l3,
  [g1u04l4.id]: g1u04l4,
  [g1u04l5.id]: g1u04l5,
  [g1u05l1.id]: g1u05l1,
  [g1u05l2.id]: g1u05l2,
  [g1u05l3.id]: g1u05l3,
  [g1u05l4.id]: g1u05l4,
  [g1u05l5.id]: g1u05l5,
  [g1u06l1.id]: g1u06l1,
  [g1u06l2.id]: g1u06l2,
  [g1u06l3.id]: g1u06l3,
  [g1u06l4.id]: g1u06l4,
  [g1u06l5.id]: g1u06l5,
  [g1u07l1.id]: g1u07l1,
  [g1u07l2.id]: g1u07l2,
  [g1u07l3.id]: g1u07l3,
  [g1u07l4.id]: g1u07l4,
  [g1u07l5.id]: g1u07l5,
  [g1u08l1.id]: g1u08l1,
  [g1u08l2.id]: g1u08l2,
  [g1u08l3.id]: g1u08l3,
  [g1u08l4.id]: g1u08l4,
  [g1u08l5.id]: g1u08l5,
  [g1u09l1.id]: g1u09l1,
  [g1u09l2.id]: g1u09l2,
  [g1u09l3.id]: g1u09l3,
  [g1u09l4.id]: g1u09l4,
  [g1u09l5.id]: g1u09l5,
  [g1u10l1.id]: g1u10l1,
  [g1u10l2.id]: g1u10l2,
  [g1u10l3.id]: g1u10l3,
  [g1u10l4.id]: g1u10l4,
  [g1u10l5.id]: g1u10l5,
  [g6u10l3.id]: g6u10l3,
  [g2u01l1.id]: g2u01l1,
  [g2u01l2.id]: g2u01l2,
  [g2u01l3.id]: g2u01l3,
  [g2u01l4.id]: g2u01l4,
  [g2u01l5.id]: g2u01l5,
};

export const getLessonContent = (lessonId: string): Lesson | undefined => LESSON_CONTENT[lessonId];

/**
 * Dev-only markers (the "placeholder content" badge, status chips) are shown
 * in development builds only, so students never see internal labels. The
 * lesson itself stays playable in every build so it can be reviewed.
 */
export const showDevLabels = (): boolean => import.meta.env.DEV;
