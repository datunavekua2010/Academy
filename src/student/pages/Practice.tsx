import { useMemo, useState } from 'react';
import { CURRICULUM, getGrade, usePractice } from '../../practice/PracticeProvider';
import { PracticeSession } from '../../practice/components/PracticeSession';
import { ScoringRules } from '../../practice/components/ScoringRules';
import { SubtopicRow } from '../../practice/components/SubtopicRow';
import { TopicSelect } from '../../practice/components/TopicSelect';
import { dueLabel, romanGrade } from '../../practice/format';
import { assignmentStatus } from '../../practice/store';
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
    bankFor,
    stats,
    overall,
    stop,
    clearSession,
  } = usePractice();

  // Topics drop-down: the selected topic's subtopics are the only ones shown.
  const [topicId, setTopicId] = useState<string | null>(null);

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
  const selectedTopic =
    curriculum.topics.find((topic) => topic.id === topicId) ?? curriculum.topics[0];
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
              const subtopic = topic?.subtopics.find((item) => item.id === assignment.ref.subtopicId);
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

        <TopicSelect
          topics={curriculum.topics}
          value={selectedTopic.id}
          onChange={setTopicId}
        />

        {selectedTopic && (
          <div className="topic-list" key={`${grade}-${selectedTopic.id}`}>
            <section className={`topic-block tone-${selectedTopic.tone}`}>
              <div className="topic-head">
                <span className="topic-emoji" aria-hidden="true">
                  {selectedTopic.emoji}
                </span>
                <div>
                  <h3>{selectedTopic.title}</h3>
                  <p>{selectedTopic.summary}</p>
                </div>
              </div>

              <div className="subtopic-list">
                {selectedTopic.subtopics.map((subtopic) => {
                  const ref = { grade, topicId: selectedTopic.id, subtopicId: subtopic.id };
                  const assignment = assignmentsForGrade.find(
                    (item) =>
                      item.ref.topicId === selectedTopic.id && item.ref.subtopicId === subtopic.id,
                  );
                  return (
                    <SubtopicRow
                      key={subtopic.id}
                      topic={selectedTopic}
                      subtopic={subtopic}
                      progress={progressFor(ref)}
                      assignment={assignment}
                      questionCount={bankFor(ref).length}
                      onStart={() => startPractice(ref, assignment ?? null)}
                    />
                  );
                })}
              </div>
            </section>
          </div>
        )}
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
