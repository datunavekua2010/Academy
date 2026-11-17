import type { Lesson } from '../types';
import { g6u10l3 } from './g6-u10-l3';

/**
 * Lesson content registry: catalog lesson id → content.
 *
 * Catalog lessons without an entry here are listed as "coming soon". To add a
 * lesson, create its file next to `g6-u10-l3.ts` and register it below.
 */
export const LESSON_CONTENT: Record<string, Lesson> = {
  [g6u10l3.id]: g6u10l3,
};

export const getLessonContent = (lessonId: string): Lesson | undefined => LESSON_CONTENT[lessonId];

/**
 * Dev-only markers (the "placeholder content" badge, status chips) are shown
 * in development builds only, so students never see internal labels. The
 * lesson itself stays playable in every build so it can be reviewed.
 */
export const showDevLabels = (): boolean => import.meta.env.DEV;
