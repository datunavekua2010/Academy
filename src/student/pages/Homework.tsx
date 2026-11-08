import { getGrade, usePractice } from '../../practice/PracticeProvider';
import type { GradeId } from '../../practice/types';
import { PracticeSession } from '../../practice/components/PracticeSession';
import { dueLabel } from '../../practice/format';
import { assignmentStatus } from '../../practice/store';
import { PageIntro } from './PageIntro';
import { Link } from '../../router';

/**
 * Homework is NOT a separate product.
 *
 * This page is a filtered view of the unified practice system: it shows only
 * the subtopics the academy assigned, and starting one opens the same
 * `PracticeSession` question runner, the same bank and the same scoring engine
 * as the practice page.
 */
export function Homework() {
  const { assignments, attempts, startPractice, progressFor, session, stop, clearSession } =
    usePractice();

  const byGrade = new Map<GradeId, typeof assignments>();
  for (const assignment of assignments) {
    const list = byGrade.get(assignment.ref.grade) ?? [];
    list.push(assignment);
    byGrade.set(assignment.ref.grade, list);
  }

  const groups = [...byGrade.entries()]
    .sort(([a], [b]) => a - b)
    .map(([grade, list]) => {
      const curriculum = getGrade(grade);
      const items = list
        .map((assignment) => {
          const topic = curriculum.topics.find((item) => item.id === assignment.ref.topicId);
          const subtopic = topic?.subtopics.find((item) => item.id === assignment.ref.subtopicId);
          const progress = progressFor(assignment.ref);
          return { assignment, topic, subtopic, progress, status: assignmentStatus(progress) };
        })
        .filter((item) => item.topic && item.subtopic)
        .sort((a, b) => new Date(a.assignment.dueAt).getTime() - new Date(b.assignment.dueAt).getTime());
      return { grade, curriculum, items };
    });

  const all = groups.flatMap((group) => group.items);
  const completed = all.filter((item) => item.status === 'completed').length;
  const openCount = all.length - completed;

  if (session) {
    return (
      <div className="student-page">
        <PracticeSession onExit={() => (session.completed ? clearSession() : stop())} />
      </div>
    );
  }

  return (
    <div className="student-page homework-page">
      <PageIntro
        eyebrow="საშინაო დავალება"
        title="მასწავლებლის მიერ მინიჭებული"
        description="ეს არის იგივე ვარჯიშის სისტემა — მხოლოდ იმ ქვეთემებით, რომლებიც აკადემიამ საშინაო დავალებად მოგანიჭა. იმუშავე პირდაპირ აქ, ფურცლების ატვირთვა არ სჭირდება."
      />

      <div className="task-summary" role="status">
        <strong>
          {completed}/{all.length}
        </strong>
        <span>
          {openCount === 0
            ? 'ყველა დავალება დასრულებულია — გილოცავ!'
            : `დარჩა ${openCount} დავალება. თითოეული სესია 100 ქულამდე მიდის.`}
        </span>
      </div>

      {groups.map(({ grade, curriculum, items }) => (
        <section className="homework-group" key={grade} aria-labelledby={`hw-grade-${grade}`}>
          <div className="section-label">
            <h2 id={`hw-grade-${grade}`}>{curriculum.label}</h2>
            <span>
              {items.filter((item) => item.status === 'completed').length}/{items.length} დასრულებული
            </span>
          </div>

          <ul className="homework-list">
            {items.map(({ assignment, topic, subtopic, progress, status }) => {
              if (!topic || !subtopic) return null;
              return (
                <li
                  className={`homework-item tone-${topic.tone} ${status === 'completed' ? 'is-done' : ''}`}
                  key={assignment.id}
                >
                  <div className="homework-main">
                    <span className="homework-path">
                      {topic.emoji} {topic.title} <span aria-hidden="true">/</span> {subtopic.title}
                    </span>
                    <div className="homework-meta">
                      <span className={`status-pill ${status}`}>
                        {status === 'completed'
                          ? '✓ დასრულებული'
                          : status === 'in-progress'
                            ? 'მიმდინარე'
                            : 'დასაწყები'}
                      </span>
                      <span className="meta-chip">
                        {status === 'completed' ? 'შესრულდა' : 'ვადა'}: {dueLabel(assignment)}
                      </span>
                      <span className="meta-chip">მასწავლებელი: {assignment.assignedBy}</span>
                      {progress.bestScore > 0 && (
                        <span className="meta-chip">საუკეთესო ქულა: {progress.bestScore}</span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`btn btn-small ${status === 'completed' ? 'btn-ghost' : 'btn-primary'}`}
                    onClick={() => startPractice(assignment.ref, assignment)}
                  >
                    {status === 'completed'
                      ? 'ხელახლა'
                      : status === 'in-progress'
                        ? 'გაგრძელება'
                        : 'დაწყება'}
                    <span aria-hidden="true">→</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <div className="homework-foot">
        <p>
          გჭირდება სხვა თემაზე ვარჯიში?{' '}
          <Link to="/student/practice">გახსენი სრული სავარჯიშო სისტემა</Link> — იგივე ბანკი,
          იგივე წესები.
        </p>
      </div>

      <p className="demo-note">
        {attempts.length > 0
          ? `შენახულია ${attempts.length} სესიის შედეგი ამ მოწყობილობაზე.`
          : 'ჯერ არც ერთი სესია არ დაგიწყია — აირჩიე დავალება და დაიწყე.'}
      </p>
    </div>
  );
}
