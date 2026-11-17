/** Routes for the lesson system. They all live under the student "lessons" page. */

export const LESSONS_HOME = '/student/lessons';
export const unitHref = (unitId: string): string => `${LESSONS_HOME}/${unitId}`;
export const lessonHref = (lessonId: string): string => `${LESSONS_HOME}/${lessonId}`;

export type LessonsRoute =
  | { page: 'library' }
  | { page: 'unit'; unitId: string }
  | { page: 'lesson'; lessonId: string }
  | { page: 'unknown' };

/** `rest` is everything after `lessons/` in the student path ('' for the library). */
export function parseLessonsRoute(rest: string): LessonsRoute {
  const clean = rest.replace(/^\/+|\/+$/g, '');
  if (!clean) return { page: 'library' };
  if (/^g[1-7]-u\d{2}$/.test(clean)) return { page: 'unit', unitId: clean };
  if (/^g[1-7]-u\d{2}-l[1-5]$/.test(clean)) return { page: 'lesson', lessonId: clean };
  return { page: 'unknown' };
}

export const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
/** "V კლასი" → 5 (falls back to 5). */
export function gradeFromLabel(label: string | undefined): number {
  const roman = (label ?? '').split(' ')[0];
  const n = ROMAN.indexOf(roman);
  return n > 0 ? n : 5;
}
