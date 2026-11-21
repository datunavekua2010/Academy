import { useState } from 'react';
import { Link } from '../router';
import { useStudentSession } from '../student/session';
import { topicsForGrade, getUnit, getLessonEntry } from './catalog';
import { LESSON_CONTENT, showDevLabels } from './content';
import { useLessonProgress, type ProgressMap } from './progress';
import { gradeFromLabel, lessonHref, ROMAN, unitHref } from './routes';
import type { GradeNumber, UnitEntry } from './types';

const GRADES: GradeNumber[] = [1, 2, 3, 4, 5, 6, 7];

function unitCounts(unit: UnitEntry, progress: ProgressMap): { done: number; ready: number } {
  return {
    done: unit.lessons.filter((l) => progress[l.id]?.status === 'completed').length,
    ready: unit.lessons.filter((l) => LESSON_CONTENT[l.id]).length,
  };
}

/** Library: pick a grade, browse Topic → Unit; lessons open from the unit page. */
export function LessonLibrary() {
  const { student } = useStudentSession();
  const [grade, setGrade] = useState<GradeNumber>(() => gradeFromLabel(student?.grade) as GradeNumber);
  const progress = useLessonProgress(!student);
  const topics = topicsForGrade(grade);
  const ready = Object.keys(LESSON_CONTENT)
    .map((id) => ({ entry: getLessonEntry(id), lesson: LESSON_CONTENT[id] }))
    .filter((x): x is { entry: NonNullable<typeof x.entry>; lesson: typeof x.lesson } => Boolean(x.entry));

  return (
    <section className="lib" aria-labelledby="lib-title">
      <div className="section-label">
        <h2 id="lib-title">ინტერაქტიული გაკვეთილები</h2>
        <span>კლასი → თემა → ბლოკი → გაკვეთილი</span>
      </div>

      {ready.length > 0 && (
        <div className="lib-ready">
          <p className="lib-ready-title">გახსენი ახლავე</p>
          {ready.map(({ entry, lesson }) => {
            const done = progress[entry.id]?.status;
            return (
              <Link key={entry.id} to={lessonHref(entry.id)} className="lib-ready-link">
                <span className="lib-ready-main">
                  <strong>{entry.title}</strong>
                  <small>
                    {ROMAN[entry.grade]} კლასი · თემა {entry.topicNumber} · {entry.code}
                  </small>
                </span>
                {showDevLabels() && lesson.status !== 'published' && <span className="lp-dev-chip" data-testid="dev-label">DEV · დროებითი შინაარსი</span>}
                <span className="lib-ready-cta">{done === 'completed' ? 'გამეორება' : done === 'started' ? 'გაგრძელება' : 'დაწყება'} →</span>
              </Link>
            );
          })}
        </div>
      )}

      <div className="grade-tabs" role="group" aria-label="კლასის არჩევა">
        {GRADES.map((g) => (
          <button key={g} type="button" className={`grade-tab ${g === grade ? 'is-active' : ''}`} aria-pressed={g === grade} aria-label={`${ROMAN[g]} კლასი`} onClick={() => setGrade(g)}>
            <span className="grade-tab-roman">{ROMAN[g]}</span>
            <span className="grade-tab-label">კლასი</span>
          </button>
        ))}
      </div>

      <div className="lib-topics">
        {topics.map((topic) => {
          const readyInTopic = topic.units.reduce((n, u) => n + unitCounts(u, progress).ready, 0);
          return (
            <details className="lib-topic" key={topic.id} open={readyInTopic > 0}>
              <summary>
                <span className="lib-topic-num">თემა {topic.number}</span>
                <span className="lib-topic-title">{topic.title}</span>
                <span className="lib-topic-meta">{topic.units.length} ბლოკი</span>
              </summary>
              <ul className="lib-units">
                {topic.units.map((unit) => {
                  const { done, ready: r } = unitCounts(getUnit(unit.id) ?? unit, progress);
                  return (
                    <li key={unit.id}>
                      <Link to={unitHref(unit.id)} className="lib-unit">
                        <span className="lib-unit-code">{unit.code}</span>
                        <span className="lib-unit-title">{unit.title}</span>
                        <span className="lib-unit-meta">
                          {r > 0 ? `${done} / ${unit.lessons.length} დასრულებული` : `${unit.lessons.length} გაკვეთილი`}
                        </span>
                        <span className="lib-unit-go" aria-hidden="true">→</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </details>
          );
        })}
      </div>
    </section>
  );
}
