import { Link } from '../router';
import { getUnit } from './catalog';
import { LESSON_CONTENT, showDevLabels } from './content';
import { useLessonProgress } from './progress';
import { lessonHref, LESSONS_HOME, ROMAN } from './routes';

/** The five lessons of one unit. */
export function UnitPage({ unitId, preview = false }: { unitId: string; preview?: boolean }) {
  const unit = getUnit(unitId);
  const progress = useLessonProgress(preview);

  if (!unit) {
    return (
      <div className="student-page">
        <div className="notfound-card">
          <h1>ბლოკი ვერ მოიძებნა.</h1>
          <Link to={LESSONS_HOME} className="btn btn-primary" style={{ marginTop: 14 }}>
            გაკვეთილებზე დაბრუნება
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="student-page lib-unit-page">
      <div className="page-intro">
        <Link to={LESSONS_HOME} className="back-link">
          <span aria-hidden="true">←</span> ჩემი გაკვეთილები
        </Link>
        <span className="eyebrow">
          <span className="eyebrow-dot" /> {ROMAN[unit.grade]} კლასი · თემა {unit.topicNumber}
        </span>
        <h1>
          {unit.code}. {unit.title}
        </h1>
        <p className="lead">{unit.topicTitle}</p>
      </div>

      <ol className="unit-lessons">
        {unit.lessons.map((lesson) => {
          const content = LESSON_CONTENT[lesson.id];
          const status = progress[lesson.id]?.status;
          return (
            <li key={lesson.id} className={`unit-lesson ${content ? 'is-ready' : 'is-soon'}`}>
              <span className="unit-lesson-num" aria-hidden="true">{lesson.number}</span>
              <div className="unit-lesson-main">
                <span className="unit-lesson-code">{lesson.code}</span>
                <h2>{lesson.title}</h2>
                {content && showDevLabels() && content.status !== 'published' && (
                  <span className="lp-dev-chip" data-testid="dev-label">DEV · დროებითი შინაარსი</span>
                )}
              </div>
              {content ? (
                <Link to={lessonHref(lesson.id)} className="btn btn-primary btn-small">
                  {status === 'completed' ? 'გამეორება' : status === 'started' ? 'გაგრძელება' : 'დაწყება'}
                </Link>
              ) : (
                <span className="unit-lesson-soon">მალე</span>
              )}
              {status === 'completed' && <span className="unit-lesson-done">✓ დასრულებული</span>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
