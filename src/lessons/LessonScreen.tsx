import { useEffect } from 'react';
import { Link } from '../router';
import { getLessonEntry } from './catalog';
import { getLessonContent } from './content';
import { LessonPlayer } from './LessonPlayer';
import { LESSONS_HOME, unitHref } from './routes';

/** Resolves a lesson id to catalog entry + content and renders the player. */
export function LessonScreen({ lessonId }: { lessonId: string }) {
  const entry = getLessonEntry(lessonId);
  const lesson = getLessonContent(lessonId);

  // The player is a full-screen focus view: stop the page behind from scrolling.
  useEffect(() => {
    if (!entry || !lesson) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [entry, lesson]);

  if (!entry) {
    return (
      <div className="student-page">
        <div className="notfound-card">
          <h1>გაკვეთილი ვერ მოიძებნა.</h1>
          <Link to={LESSONS_HOME} className="btn btn-primary" style={{ marginTop: 14 }}>
            გაკვეთილებზე დაბრუნება
          </Link>
        </div>
      </div>
    );
  }
  if (!lesson) {
    return (
      <div className="student-page">
        <div className="notfound-card">
          <span className="eyebrow">
            <span className="eyebrow-dot" /> {entry.code}
          </span>
          <h1>{entry.title}</h1>
          <p>ეს გაკვეთილი ჯერ მზად არ არის. მალე დაემატება.</p>
          <Link to={unitHref(entry.unitId)} className="btn btn-primary" style={{ marginTop: 14 }}>
            ბლოკის გაკვეთილებზე დაბრუნება
          </Link>
        </div>
      </div>
    );
  }
  return <LessonPlayer key={lesson.id} entry={entry} lesson={lesson} backTo={unitHref(entry.unitId)} />;
}
