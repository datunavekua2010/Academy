import { Link } from '../../router';
import { LessonLibrary } from '../../lessons/LessonLibrary';
import { LessonScreen } from '../../lessons/LessonScreen';
import { parseLessonsRoute } from '../../lessons/routes';
import { UnitPage } from '../../lessons/UnitPage';
import { PageIntro } from './PageIntro';
import { useStudentSession } from '../session';

const LESSONS = [
  {
    title: 'წილადები და მათი შედარება',
    subject: 'მათემატიკა',
    teacher: 'ანა კვარაცხელია',
    when: 'დღეს, 16:00 – 17:00',
    status: 'დღევანდელი',
    tone: 'blue',
    progress: 65,
  },
  {
    title: 'ტექსტური ამოცანები',
    subject: 'მათემატიკა',
    teacher: 'ანა კვარაცხელია',
    when: '12 ნოემბერი, 16:00',
    status: 'მომავალი',
    tone: 'teal',
    progress: 0,
  },
  {
    title: 'ლოგიკური კანონზომიერებები',
    subject: 'ლოგიკა',
    teacher: 'გიორგი ს.',
    when: '5 ნოემბერი',
    status: 'დასრულებული',
    tone: 'yellow',
    progress: 100,
  },
  {
    title: 'გეომეტრიული ფორმები',
    subject: 'მათემატიკა',
    teacher: 'ანა კვარაცხელია',
    when: '3 ნოემბერი',
    status: 'დასრულებული',
    tone: 'pink',
    progress: 100,
  },
];

/**
 * "My lessons". The lesson library (Axiom Learn) comes first; the live-class
 * schedule below is the page's original demo content, unchanged.
 * Sub-routes: `#/student/lessons/<unit>` and `#/student/lessons/<lesson>`.
 */
export function Lessons({ sub = '' }: { sub?: string }) {
  const { student } = useStudentSession();
  const preview = !student;
  const route = parseLessonsRoute(sub);
  if (route.page === 'lesson') return <LessonScreen lessonId={route.lessonId} preview={preview} />;
  if (route.page === 'unit') return <UnitPage unitId={route.unitId} preview={preview} />;
  if (route.page === 'unknown') {
    return (
      <div className="student-page">
        <div className="notfound-card">
          <h1>ეს გვერდი არ არსებობს.</h1>
          <Link to="/student/lessons" className="btn btn-primary" style={{ marginTop: 14 }}>
            ჩემი გაკვეთილები
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="student-page">
      <PageIntro
        eyebrow="ჩემი გაკვეთილები"
        title="გაკვეთილები და თემები"
        description="აქ ნახავ ინტერაქტიულ გაკვეთილებს და შენს მიმდინარე გაკვეთილებს. თითოეული თემა ეყრდნობა წინა ცოდნას, ამიტომ თანმიმდევრობა მნიშვნელოვანია."
      />
      {preview && <p className="guest-preview-note">სტუმრის რეჟიმი: დაათვალიერე გაკვეთილები. პასუხებისთვის საჭიროა აკადემიის ანგარიში.</p>}
      <LessonLibrary />
      {!preview && <LessonSchedule />}
    </div>
  );
}

function LessonSchedule() {
  const next = LESSONS[0];

  return (
    <>
      <div className="section-label">
        <h2>განრიგი</h2>
        <span>ცოცხალი გაკვეთილები</span>
      </div>
      <div className={`student-card tone-${next.tone}`} style={{ marginBottom: 18 }}>
        <div className="student-card-head">
          <div>
            <span className="eyebrow" style={{ marginBottom: 10 }}>
              <span className="eyebrow-dot" /> შემდეგი გაკვეთილი
            </span>
            <h3 style={{ marginTop: 10 }}>{next.title}</h3>
            <p>
              {next.subject} • {next.teacher}
            </p>
          </div>
          <span className="student-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
              <circle cx="12" cy="12" r="8.5" />
              <path d="M12 7.5V12l3 2" />
            </svg>
          </span>
        </div>
        <div className="meta-row">
          <span className="meta-chip tone-blue">{next.when}</span>
          <span className="meta-chip">მასწავლებელი: {next.teacher}</span>
        </div>
      </div>

      <div className="section-label">
        <h2>ჩემი გაკვეთილები</h2>
        <span>{LESSONS.length} თემა</span>
      </div>

      <div className="student-grid cols-2">
        {LESSONS.map((lesson) => (
          <article className={`student-card tone-${lesson.tone}`} key={lesson.title}>
            <div className="student-card-head">
              <div>
                <h3>{lesson.title}</h3>
                <p>
                  {lesson.subject} • {lesson.teacher}
                </p>
              </div>
              <span className="student-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
                  <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" />
                </svg>
              </span>
            </div>
            <div className="meta-row">
              <span className={`meta-chip tone-${lesson.tone}`}>{lesson.status}</span>
              <span className="meta-chip">{lesson.when}</span>
            </div>
            <div className="progress-item" style={{ marginTop: 16 }}>
              <div className="progress-label">
                <span>თემის დაფარვა</span>
                <span>{lesson.progress}%</span>
              </div>
              <div className="student-progress-track">
                <div className="student-progress-fill" style={{ width: `${lesson.progress}%` }} />
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className="demo-note">
        დემო მონაცემები — გაკვეთილების რეალური განრიგი და მასწავლებლები საიტის
        გაშვებისას უნდა შეავსოს აკადემიის სისტემამ.
      </p>
    </>
  );
}
