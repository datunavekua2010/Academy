import { getGrade, usePractice } from '../../practice/PracticeProvider';
import { ScoringRules } from '../../practice/components/ScoringRules';
import { formatDateTime, formatDuration } from '../../practice/format';
import { needsWork, overallStats, progressFor } from '../../practice/store';
import { PageIntro } from './PageIntro';
import { Link } from '../../router';

export function Progress() {
  const { attempts, assignments, grade } = usePractice();
  const curriculum = getGrade(grade);
  const overall = overallStats(attempts, assignments);
  const recent = [...attempts].reverse().slice(0, 6);
  const weak = needsWork(attempts).slice(0, 4);

  const topicRows = curriculum.topics.map((topic) => {
    const subtopics = topic.subtopics.map((subtopic) => {
      const progress = progressFor(attempts, {
        grade,
        topicId: topic.id,
        subtopicId: subtopic.id,
      });
      return { subtopic, progress };
    });
    const touched = subtopics.filter((item) => item.progress.attempts > 0);
    const average =
      touched.length === 0
        ? 0
        : Math.round(touched.reduce((sum, item) => sum + item.progress.bestScore, 0) / touched.length);
    return { topic, subtopics, average, touched: touched.length };
  });

  return (
    <div className="student-page progress-page">
      <PageIntro
        eyebrow="ჩემი პროგრესი"
        title="შედეგები და შემდეგი ნაბიჯი"
        description="ყველა ციფრი აქ წარმოიქმნება შენი რეალური სესიებიდან — იმავე 100-ქულიანი სისტემიდან, რომლითაც საშინაო დავალება და ვარჯიში მუშაობს."
      />

      <div className="practice-summary">
        <div className="summary-stat">
          <strong>{overall.percent}%</strong>
          <span>დავალებების შესრულება</span>
        </div>
        <div className="summary-stat">
          <strong>{overall.attempts}</strong>
          <span>სესია</span>
        </div>
        <div className="summary-stat">
          <strong>{overall.correct}</strong>
          <span>სწორი პასუხი</span>
        </div>
        <div className="summary-stat">
          <strong>{overall.incorrect}</strong>
          <span>არასწორი პასუხი</span>
        </div>
      </div>

      <div className="section-label">
        <h2>{curriculum.label} — თემების მიხედვით</h2>
        <span>საუკეთესო ქულების საშუალო</span>
      </div>

      <div className="student-grid cols-2">
        {topicRows.map(({ topic, subtopics, average, touched }) => (
          <section className={`student-card tone-${topic.tone}`} key={topic.id}>
            <div className="student-card-head">
              <div>
                <h3>
                  {topic.emoji} {topic.title}
                </h3>
                <p>
                  {touched}/{subtopics.length} ქვეთემა დაწყებული
                </p>
              </div>
              <span className="topic-average">{average}</span>
            </div>
            <div className="student-progress-track" style={{ marginTop: 14 }}>
              <div className="student-progress-fill" style={{ width: `${average}%` }} />
            </div>
            <ul className="topic-subtopic-list">
              {subtopics.map(({ subtopic, progress }) => (
                <li key={subtopic.id}>
                  <span>{subtopic.title}</span>
                  <span className={progress.completed ? 'is-complete' : ''}>
                    {progress.attempts === 0
                      ? '—'
                      : progress.completed
                        ? `100 ✓`
                        : `${progress.bestScore}/100`}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="section-label">
        <h2>სად გვჭირდება მეტი ვარჯიში</h2>
        <span>ბოლო მცდელობები 100-ზე ნაკლები</span>
      </div>

      {weak.length === 0 ? (
        <div className="empty-state">
          <span aria-hidden="true">🌟</span>
          <p>ჯერ არ გაქვს დაუსრულებელი ქვეთემა. აირჩიე რომელიმე და დაიწყე ვარჯიში.</p>
        </div>
      ) : (
        <ul className="recent-list">
          {weak.map((attempt) => {
            const topic = curriculum.topics.find((item) => item.id === attempt.ref.topicId);
            const subtopic = topic?.subtopics.find((item) => item.id === attempt.ref.subtopicId);
            return (
              <li className="recent-item" key={attempt.key}>
                <div className="recent-main">
                  <strong>{subtopic?.title ?? attempt.ref.subtopicId}</strong>
                  <span>{topic?.title}</span>
                </div>
                <div className="recent-side">
                  <span className="recent-score">{attempt.score}/100</span>
                  <Link to="/student/practice" className="text-link">
                    ივარჯიშე →
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="section-label">
        <h2>ბოლო სესიები</h2>
        <span>{attempts.length} სულ</span>
      </div>

      {recent.length === 0 ? (
        <div className="empty-state">
          <span aria-hidden="true">📘</span>
          <p>ჯერ არ გაქვს დასრულებული სესია. დაიწყე საშინაო დავალებიდან ან ვარჯიშიდან.</p>
        </div>
      ) : (
        <ul className="recent-list">
          {recent.map((attempt) => {
            const topic = getGrade(attempt.ref.grade).topics.find(
              (item) => item.id === attempt.ref.topicId,
            );
            const subtopic = topic?.subtopics.find((item) => item.id === attempt.ref.subtopicId);
            return (
              <li className={`recent-item ${attempt.completed ? 'is-complete' : ''}`} key={attempt.id}>
                <div className="recent-main">
                  <strong>{subtopic?.title ?? attempt.ref.subtopicId}</strong>
                  <span>
                    {getGrade(attempt.ref.grade).label} · {topic?.title} ·{' '}
                    {formatDateTime(attempt.finishedAt)}
                  </span>
                </div>
                <div className="recent-side">
                  <span className="recent-score">{attempt.score}/100</span>
                  <span className="recent-detail">
                    ✓ {attempt.correct} · ✕ {attempt.incorrect} · {formatDuration(attempt.seconds)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ScoringRules compact />

      <p className="demo-note">
        შედეგები ინახება ამ მოწყობილობის ბრაუზერში (localStorage). რეალურ სისტემაში ისინი
        მოსწავლის ანგარიშში შეინახება.
      </p>
    </div>
  );
}
