import { usePractice } from '../practice/PracticeProvider';
import { dueLabel } from '../practice/format';
import { assignmentStatus } from '../practice/store';
import { AxiNav } from './AxiNav';
import { useStudentSession } from './session';
import { Link } from '../router';

export function Dashboard() {
  const { student } = useStudentSession();
  const { assignments, progressFor, overall, grade } = usePractice();
  const firstName = student?.firstName ?? 'მოსწავლე';

  const nextUp = assignments
    .map((assignment) => ({ assignment, status: assignmentStatus(progressFor(assignment.ref)) }))
    .filter((item) => item.status !== 'completed')
    .sort((a, b) => new Date(a.assignment.dueAt).getTime() - new Date(b.assignment.dueAt).getTime())[0];

  return (
    <div className="student-container student-dashboard">
      <div className="dashboard-welcome">
        <span className="eyebrow">
          <span className="eyebrow-dot" /> მოსწავლის დაფა
        </span>
        <h1>
          გამარჯობა, {firstName}! <span className="wave" aria-hidden="true">👋</span>
        </h1>
        <p>
          კეთილი იყოს შენი დაბრუნება. მე Axi ვარ — დააჭირე ჩემს ნავიგაციას და
          აირჩიე ის სექცია, სადაც გინდა გადახვიდე.
        </p>
      </div>

      <AxiNav />

      <div className="dashboard-today" aria-label="დღევანდელი მიმოხილვა">
        <span className="today-pill">
          <span className="today-dot" aria-hidden="true" />
          კლასი: <strong>{grade}</strong>
        </span>
        <span className="today-pill">
          <span className="today-dot" aria-hidden="true" style={{ background: 'var(--yellow)' }} />
          შემდეგი დავალება:{' '}
          <strong>{nextUp ? dueLabel(nextUp.assignment) : 'ყველა შესრულებულია'}</strong>
        </span>
        <span className="today-pill">
          <span className="today-dot" aria-hidden="true" style={{ background: 'var(--pink)' }} />
          საშინაო პროგრესი: <strong>{overall.percent}%</strong>
        </span>
      </div>

      {nextUp && (
        <div className="dashboard-next">
          <div>
            <span className="eyebrow">
              <span className="eyebrow-dot" /> შემდეგი ნაბიჯი
            </span>
            <p>
              {nextUp.status === 'in-progress' ? 'გააგრძელე' : 'დაიწყე'} მასწავლებლის მიერ
              მინიჭებული ვარჯიში — ვადა: <strong>{dueLabel(nextUp.assignment)}</strong>.
            </p>
          </div>
          <Link to="/student/homework" className="btn btn-primary btn-small">
            დავალებაზე გადასვლა <span aria-hidden="true">→</span>
          </Link>
        </div>
      )}

      <p className="demo-note dashboard-note">
        დემო მოსწავლის გარემო — შედეგები ინახება ამ მოწყობილობაზე.
      </p>
    </div>
  );
}
