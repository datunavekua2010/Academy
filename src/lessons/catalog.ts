import { LESSON_CATALOG } from './catalogData';
import type { GradeNumber, LessonEntry, TopicEntry, UnitEntry } from './types';

const pad = (n: number): string => String(n).padStart(2, '0');

export const unitIdOf = (grade: number, unitNumber: number): string => `g${grade}-u${pad(unitNumber)}`;
export const lessonIdOf = (grade: number, unitNumber: number, lessonNumber: number): string => `${unitIdOf(grade, unitNumber)}-l${lessonNumber}`;

/** Grade → Topic → Unit → Lesson, with every id resolved. */
export const CATALOG_TOPICS: Record<GradeNumber, TopicEntry[]> = (() => {
  const out = {} as Record<GradeNumber, TopicEntry[]>;
  for (const g of LESSON_CATALOG) {
    out[g.grade] = g.topics.map((topic) => {
      const units: UnitEntry[] = topic.units.map((unit) => {
        const unitId = unitIdOf(g.grade, unit.number);
        const code = `U${pad(unit.number)}`;
        const lessons: LessonEntry[] = unit.lessons.map((title, index) => ({
          id: lessonIdOf(g.grade, unit.number, index + 1),
          grade: g.grade,
          topicNumber: topic.number,
          topicTitle: topic.title,
          unitId,
          unitCode: code,
          unitTitle: unit.title,
          number: index + 1,
          code: `${code}.${index + 1}`,
          title,
        }));
        return { id: unitId, grade: g.grade, code, number: unit.number, title: unit.title, topicNumber: topic.number, topicTitle: topic.title, lessons };
      });
      return { id: `g${g.grade}-t${pad(topic.number)}`, grade: g.grade, number: topic.number, title: topic.title, units };
    });
  }
  return out;
})();

export const GRADE_LABELS: Record<GradeNumber, string> = Object.fromEntries(LESSON_CATALOG.map((g) => [g.grade, g.label])) as Record<GradeNumber, string>;

const UNITS = new Map<string, UnitEntry>();
const LESSONS = new Map<string, LessonEntry>();
for (const topics of Object.values(CATALOG_TOPICS)) {
  for (const topic of topics) {
    for (const unit of topic.units) {
      UNITS.set(unit.id, unit);
      for (const lesson of unit.lessons) LESSONS.set(lesson.id, lesson);
    }
  }
}

export const getUnit = (unitId: string): UnitEntry | undefined => UNITS.get(unitId);
export const getLessonEntry = (lessonId: string): LessonEntry | undefined => LESSONS.get(lessonId);
export const allLessonEntries = (): LessonEntry[] => [...LESSONS.values()];
export const allUnits = (): UnitEntry[] => [...UNITS.values()];
export const topicsForGrade = (grade: GradeNumber): TopicEntry[] => CATALOG_TOPICS[grade] ?? [];

/** The lesson after this one in the same unit, if any. */
export function nextLessonInUnit(lessonId: string): LessonEntry | undefined {
  const entry = LESSONS.get(lessonId);
  if (!entry) return undefined;
  return UNITS.get(entry.unitId)?.lessons[entry.number];
}
