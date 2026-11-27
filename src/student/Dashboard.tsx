import { usePractice } from '../practice/PracticeProvider';
import { getSubtopic, getTopic } from '../practice/curriculum';
import { dueLabel, formatDateTime } from '../practice/format';
import { assignmentStatus, needsWork } from '../practice/store';
import { StreakCard } from '../streaks/StreakCard';
import { useStudentSession } from './session';
import { Link } from '../router';
import axiArt from '../assets/raccoon-mascot.png';

export function Dashboard() {
  const { student, mode } = useStudentSession();
  const { assignments, attempts, session, progressForAssignment, overall, grade } = usePractice();
  const nextUp = assignments
    .map((assignment) => ({ assignment, status: assignmentStatus(progressForAssignment(assignment)) }))
    .filter((item) => item.status !== 'completed')
    .sort((a, b) => new Date(a.assignment.dueAt).getTime() - new Date(b.assignment.dueAt).getTime())[0];
  const active = session && !session.completed && !session.exhausted ? session : null;
  const nextRef = active?.ref ?? nextUp?.assignment.ref;
  const nextTopic = nextRef ? getTopic(nextRef.grade, nextRef.topicId) : null;
  const nextSubtopic = nextRef ? getSubtopic(nextRef.grade, nextRef.topicId, nextRef.subtopicId) : null;
  const recent = [...attempts].reverse().slice(0, 3);
  const review = needsWork(attempts)[0];
  const reviewTitle = review ? getSubtopic(review.ref.grade, review.ref.topicId, review.ref.subtopicId)?.title : null;

  return (
    <div className="student-container student-dashboard">
      <header className="dash-welcome">
        <div><p className="dash-overline"><span /> შენი სასწავლო სივრცე</p><h1>გამარჯობა, {student?.firstName ?? 'მოსწავლე'}! <span aria-hidden="true">✦</span></h1><p>მოდი, დღესაც ერთად აღმოვაჩინოთ რაღაც ახალი.</p></div>
        <div className="dash-welcome-grade"><span>შენი კლასი</span><strong>{student?.grade || 'არ არის მითითებული'}</strong></div>
      </header>

      <div className="dash-columns">
        <div className="dash-main-column">
          <section className="dash-hero" aria-labelledby="dash-next-title">
            <div className="dash-hero-copy">
              <p className="dash-hero-kicker"><span aria-hidden="true">✦</span> შენი შემდეგი ნაბიჯი</p>
              <h2 id="dash-next-title">{active ? 'გააგრძელე ვარჯიში' : nextUp ? 'დავალება გელოდება' : 'მზად ხარ სწავლისთვის?'}</h2>
              <p>{nextSubtopic ? <><strong>{nextSubtopic.title}</strong>{nextTopic ? ` · ${nextTopic.title}` : ''}{!active && nextUp ? ` · ვადა: ${dueLabel(nextUp.assignment)}` : ''}</> : 'აირჩიე გაკვეთილი ან თემა და დაიწყე შენი სასწავლო თავგადასავალი.'}</p>
              <Link to={active ? '/student/practice' : nextUp ? `/student/homework/grade/${nextUp.assignment.ref.grade}` : '/student/lessons'} className="dash-primary-link">{active ? 'გაგრძელება' : nextUp ? 'დავალებაზე გადასვლა' : 'გაკვეთილების ნახვა'} <span aria-hidden="true">↗</span></Link>
            </div>
            <div className="dash-hero-art" aria-hidden="true"><span className="dash-art-star star-one">✦</span><span className="dash-art-star star-two">✳</span><img src={axiArt} alt="" /></div>
          </section>

          <div className="dash-section-head"><div><p className="dash-overline">ნაბიჯ-ნაბიჯ</p><h2>შენი სწავლის გზა</h2></div><Link to="/student/progress">ყველა შედეგი <span aria-hidden="true">→</span></Link></div>
          <div className="dash-learning-grid">
            <section className="dash-card dash-progress-card" aria-labelledby="dash-progress-title">
              <div className="dash-card-top"><span className="dash-card-icon green" aria-hidden="true">↗</span><span className="dash-card-label">პროგრესი</span></div>
              <h3 id="dash-progress-title">საშინაო დავალებები</h3>
              <p>სასწავლო კლასი: {grade}</p>
              {overall.assigned > 0 ? <><p>{overall.completed} / {overall.assigned} დასრულებული</p><div className="dash-progress-row"><span>შესრულებულია</span><strong>{overall.percent}%</strong></div><div className="dash-progress-track" role="progressbar" aria-label="დავალებების შესრულება" aria-valuemin={0} aria-valuemax={100} aria-valuenow={overall.percent}><span style={{ width: `${overall.percent}%` }} /></div></> : <p>მინიჭებული დავალებები ჯერ არ არის.</p>}
              <Link to="/student/homework" className="dash-card-link">დავალებების ნახვა <span aria-hidden="true">→</span></Link>
            </section>
            <section className="dash-card dash-review-card" aria-labelledby="dash-review-title">
              <div className="dash-card-top"><span className="dash-card-icon blue" aria-hidden="true">✎</span><span className="dash-card-label">ივარჯიშე</span></div>
              <h3 id="dash-review-title">{reviewTitle ?? 'შეარჩიე თემა'}</h3>
              <p>{review ? `ბოლო სესიების მიხედვით, შეგიძლია გაიმეორო ეს თემა (${review.ref.grade} კლასი).` : 'აირჩიე სასურველი თემა და ივარჯიშე შენი ტემპით.'}</p>
              <Link to="/student/practice" className="dash-card-link">სავარჯიშოებზე გადასვლა <span aria-hidden="true">→</span></Link>
            </section>
          </div>

          <section className="dash-card dash-activity" aria-labelledby="dash-activity-title">
            <div className="dash-card-header"><div><p className="dash-overline">შენი ნაბიჯები</p><h2 id="dash-activity-title">ბოლო აქტივობა</h2></div><Link to="/student/progress">ყველას ნახვა →</Link></div>
            {recent.length ? <ul className="dash-activity-list">{recent.map((attempt) => {
              const topic = getTopic(attempt.ref.grade, attempt.ref.topicId);
              const subtopic = getSubtopic(attempt.ref.grade, attempt.ref.topicId, attempt.ref.subtopicId);
              return <li key={attempt.id}><span className="dash-activity-icon" aria-hidden="true">✎</span><span className="dash-activity-info"><strong>{subtopic?.title ?? 'ვარჯიში'}</strong><small>{topic?.title ?? ''} · {formatDateTime(attempt.finishedAt)}</small></span><span className="dash-activity-score">{attempt.score}/100</span></li>;
            })}</ul> : <p className="dash-empty">შენი დასრულებული სესიები აქ გამოჩნდება.</p>}
          </section>
        </div>
        <aside className="dash-side-column" aria-label="სასწავლო მიმოხილვა">
          <section className="dash-card dash-profile-card"><p className="dash-overline">შენი პროფილი</p><div className="dash-profile-avatar" aria-hidden="true">{student?.initials || '✦'}</div><h2>{student?.name || 'მოსწავლე'}</h2><p>{student?.grade || 'კლასი არ არის მითითებული'}</p><Link to="/student/profile">პროფილის ნახვა →</Link></section>
          <section className="dash-card dash-milestone"><div className="dash-card-top"><span className="dash-card-icon yellow" aria-hidden="true">✧</span><span className="dash-card-label">შენი მიღწევები</span></div><h2>ყოველი ნაბიჯი მნიშვნელოვანია</h2><p>მიღწევების დადასტურება ჯერ მიუწვდომელია. დაათვალიერე სამახსოვრო ნიშნები.</p><Link to="/student/achievements" className="dash-card-link">მიღწევების ნახვა →</Link></section>
          <StreakCard />
        </aside>
      </div>
      <p className="demo-note dashboard-note">{mode === 'test' ? 'შედეგები ინახება მხოლოდ ამ მოწყობილობაზე.' : 'ვარჯიშის შედეგები ანგარიშთან სინქრონდება; გაკვეთილების პროგრესი ამ მოწყობილობაზე რჩება.'}</p>
    </div>
  );
}
