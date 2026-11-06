import { AxiNav } from './AxiNav';
import { useStudentSession } from './session';

export function Dashboard() {
  const { student } = useStudentSession();
  const firstName = student?.firstName ?? 'მოსწავლე';

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
          დღევანდელი გაკვეთილი: <strong>16:00</strong>
        </span>
        <span className="today-pill">
          <span className="today-dot" aria-hidden="true" style={{ background: 'var(--yellow)' }} />
          შემდეგი დავალება: <strong>2 დღე</strong>
        </span>
        <span className="today-pill">
          <span className="today-dot" aria-hidden="true" style={{ background: 'var(--pink)' }} />
          საერთო პროგრესი: <strong>72%</strong>
        </span>
      </div>

      <p className="demo-note dashboard-note">
        დემო მოსწავლის გარემო — მონაცემები ილუსტრაციულია.
      </p>
    </div>
  );
}
