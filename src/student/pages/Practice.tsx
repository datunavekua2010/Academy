import { useMemo, useState } from 'react';
import { CURRICULUM, getGrade, usePractice } from '../../practice/PracticeProvider';
import { PracticeSession } from '../../practice/components/PracticeSession';
import { ScoringRules } from '../../practice/components/ScoringRules';
import { SubtopicRow } from '../../practice/components/SubtopicRow';
import { CurriculumAccordion } from '../../practice/components/CurriculumAccordion';
import { dueLabel, romanGrade } from '../../practice/format';
import { assignmentStatus } from '../../practice/store';
import { topicSubtopics } from '../../practice/types';
import { PageIntro } from './PageIntro';

/**
 * The unified practice system.
 *
 * This one page plays both roles the brief describes: it lists the work the
 * academy assigned (homework) and lets the student keep practising any
 * grade → topic → subtopic. Both entry points start the same engine from the
 * same question bank.
 */
export function Practice() {
  const {
    grade,
    setGrade,
    assignments,
    attempts,
    session,
    startPractice,
    progressFor,
    templateCountFor,
    isPlayable,
    stats,
    overall,
    stop,
    clearSession,
  } = usePractice();

  // Accordion: which primary topic is expanded (one at a time).
  const [openTopicId, setOpenTopicId] = useState<string | null>(null);

  // Derive everything from attempts so nothing can drift out of sync.
  const assignmentsForGrade = useMemo(
    () => assignments.filter((assignment) => assignment.ref.grade === grade),
    [assignments, grade],
  );

  const open = assignmentsForGrade
    .map((assignment) => ({ assignment, status: assignmentStatus(progressFor(assignment.ref)) }))
    .filter((item) => item.status !== 'completed')
    .sort((a, b) => new Date(a.assignment.dueAt).getTime() - new Date(b.assignment.dueAt).getTime());

  const curriculum = getGrade(grade);
  const gradeRows = CURRICULUM.map((item) => ({
    grade: item.grade,
    roman: item.roman,
    label: item.label,
  }));

  if (session) {
    return (
      <div className="student-page">
        <PracticeSession
          onExit={() => (session.completed ? clearSession() : stop())}
        />
      </div>
    );
  }

  return (
    <div className="student-page practice-page">
      <PageIntro
        eyebrow="ვარჯიში"
        title="ისწავლე და ივარჯიშე"
        description="ერთი სისტემა, ერთი ბანკი და ერთი შეფასება. აირჩიე კლასი, თემა და ქვეთემა — ან დაიწყე მასწავლებლის მიერ მინიჭებული საშინაო დავალებიდან."
      >
        <div className="practice-summary">
          <div className="summary-stat">
            <strong>{overall.completed}</strong>
            <span>დასრულებული დავალება</span>
          </div>
          <div className="summary-stat">
            <strong>{overall.percent}%</strong>
            <span>საშინაო პროგრესი</span>
          </div>
          <div className="summary-stat">
            <strong>{stats.correct}</strong>
            <span>სწორი პასუხი</span>
          </div>
          <div className="summary-stat">
            <strong>{stats.attempts}</strong>
            <span>სესია</span>
          </div>
        </div>
      </PageIntro>

      <section className="assignments-panel" aria-labelledby="assigned-heading">
        <div className="section-label" style={{ marginTop: 0 }}>
          <h2 id="assigned-heading">📌 მასწავლებლის მიერ მინიჭებული</h2>
          <span>{grade} კლასი · {open.length} აქტიური</span>
        </div>

        {open.length === 0 ? (
          <div className="empty-state">
            <span aria-hidden="true">✅</span>
            <p>ამ კლასის ყველა დავალება დასრულებულია. შეგიძლია თავისუფლად ივარჯიშო.</p>
          </div>
        ) : (
          <ul className="assignment-list">
            {open.map(({ assignment, status }) => {
              const topic = curriculum.topics.find((item) => item.id === assignment.ref.topicId);
              const subtopic = topic
                ? topicSubtopics(topic).find((item) => item.id === assignment.ref.subtopicId)
                : undefined;
              if (!topic || !subtopic) return null;
              const progress = progressFor(assignment.ref);
              return (
                <li key={assignment.id} className="assignment-item">
                  <div className="assignment-body">
                    <span className="assignment-topic">
                      {topic.emoji} {topic.title} <span aria-hidden="true">→</span> {subtopic.title}
                    </span>
                    <span className="assignment-due">
                      ვადა: {dueLabel(assignment)} ·{' '}
                      {status === 'in-progress' ? 'დაწყებულია' : 'ჯერ არ დაწყებულა'}
                      {progress.bestScore > 0 ? ` · საუკეთესო ${progress.bestScore}` : ''}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-small"
                    onClick={() => startPractice(assignment.ref, assignment)}
                  >
                    {status === 'in-progress' ? 'გაგრძელება' : 'დაწყება'} <span aria-hidden="true">→</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="grade-panel" aria-labelledby="curriculum-heading">
        <div className="section-label">
          <h2 id="curriculum-heading">კლასი, თემა, ქვეთემა</h2>
          <span>აირჩიე კლასი და თემა</span>
        </div>

        <div className="grade-tabs" role="tablist" aria-label="კლასების არჩევა">
          {gradeRows.map((item) => (
            <button
              key={item.grade}
              type="button"
              role="tab"
              aria-selected={grade === item.grade}
              className={`grade-tab ${grade === item.grade ? 'is-active' : ''}`}
              onClick={() => setGrade(item.grade)}
            >
              <span className="grade-tab-roman">{item.roman}</span>
              <span className="grade-tab-label">კლასი</span>
            </button>
          ))}
        </div>

        <CurriculumAccordion
          topics={curriculum.topics}
          openTopicId={openTopicId}
          onToggleTopic={(topicId) =>
            setOpenTopicId((current) => (current === topicId ? null : topicId))
          }
          renderSubtopic={({ topic, subtopicId, title, summary }) => {
            const ref = { grade, topicId: topic.id, subtopicId };
            const assignment = assignmentsForGrade.find(
              (item) =>
                item.ref.topicId === topic.id && item.ref.subtopicId === subtopicId,
            );
            return (
              <SubtopicRow
                topic={topic}
                subtopic={{ id: subtopicId, title, summary }}
                progress={progressFor(ref)}
                assignment={assignment}
                questionCount={templateCountFor(ref)}
                playable={isPlayable(ref)}
                onStart={() => startPractice(ref, assignment ?? null)}
              />
            );
          }}
        />
      </section>

      <ScoringRules />

      <p className="demo-note">
        დემო მონაცემები: კლასი {romanGrade(grade)} · {curriculum.topics.length} თემა ·{' '}
        {attempts.length} შენახული სესია. რეალური სასწავლო გეგმა ჩაანაცვლებს ამ თემებს — სისტემა
        იგივე დარჩება.
      </p>
    </div>
  );
}
