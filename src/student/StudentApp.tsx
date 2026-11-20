import { useEffect, useLayoutEffect, type ReactNode } from 'react';
import { PracticeProvider, usePractice } from '../practice/PracticeProvider';
import type { GradeId } from '../practice/types';
import { Link, useHashRoute } from '../router';
import { Dashboard } from './Dashboard';
import { Homework } from './pages/Homework';
import { GradeSelection, parseStudentGrade } from './pages/GradeSelection';
import { Lessons } from './pages/Lessons';
import { Practice } from './pages/Practice';
import { Profile } from './pages/Profile';
import { Progress } from './pages/Progress';
import { StudentLayout } from './StudentLayout';
import { StudentSignIn } from './StudentSignIn';
import { StudentSessionProvider, useStudentSession } from './session';

const TITLES: Record<string, string> = {
  '': 'მოსწავლის დაფა',
  lessons: 'ჩემი გაკვეთილები',
  homework: 'საშინაო დავალება',
  practice: 'ვარჯიში',
  progress: 'ჩემი პროგრესი',
  profile: 'ჩემი პროფილი',
};

/** The student area is only rendered for an authenticated (demo) session. */
function RequireStudent({ children }: { children: ReactNode }) {
  const { student, mode } = useStudentSession();
  if (!student) return <StudentSignIn />;
  return <PracticeProvider key={`${mode}:${student.id}`} studentId={student.id} mode={mode === 'connected' ? 'connected' : 'demo'} initialGrade={parseStudentGrade(student.grade) ?? 5}>{children}</PracticeProvider>;
}

function NotFound() {
  return (
    <div className="student-page">
      <div className="notfound-card">
        <span className="eyebrow">
          <span className="eyebrow-dot" /> გვერდი ვერ მოიძებნა
        </span>
        <h1>უჰ, ეს გვერდი არ არსებობს.</h1>
        <p>დაბრუნდი დაფაზე და Axi-ს მეშვეობით აირჩიე სექცია.</p>
        <Link to="/student" className="btn btn-primary" style={{ marginTop: 14 }}>
          დაფაზე დაბრუნება
        </Link>
      </div>
    </div>
  );
}

/** The URL is the source of truth for a homework grade, including on reload/back. */
function GradeHomework({ grade }: { grade: GradeId }) {
  const { grade: currentGrade, setGrade } = usePractice();
  useLayoutEffect(() => { setGrade(grade); }, [grade, setGrade]);
  if (currentGrade !== grade) return null;
  return <Homework />;
}

function StudentRoutes() {
  const path = useHashRoute();
  const segment = path.replace(/^\/student\/?/, '').replace(/\/+$/, '');
  // Pages can own sub-routes (`lessons/<unit>`), so match on the first part.
  const [head, ...restParts] = segment.split('/');
  const rest = restParts.join('/');

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.title = `${(head === 'lessons' || head === 'homework' || !rest ? TITLES[head] : undefined) ?? 'გვერდი ვერ მოიძებნა'} — Axiom Academy`;
    // Move screen-reader / keyboard focus to the new page content.
    document.getElementById('student-main')?.focus({ preventScroll: true });
  }, [path, head, rest]);

  let page: ReactNode;
  switch (head) {
    case '':
      page = <Dashboard />;
      break;
    case 'lessons':
      page = <Lessons sub={rest} />;
      break;
    case 'homework': {
      const match = rest.match(/^grade\/([1-7])$/);
      page = !rest ? <GradeSelection /> : match ? <GradeHomework grade={Number(match[1]) as GradeId} /> : <NotFound />;
      break;
    }
    case 'practice':
      page = <Practice />;
      break;
    case 'progress':
      page = <Progress />;
      break;
    case 'profile':
      page = <Profile />;
      break;
    default:
      page = <NotFound />;
  }
  if (head !== 'lessons' && head !== 'homework' && rest) page = <NotFound />;

  return (
    <StudentLayout activeSection={head === 'homework' ? head : undefined}>
      <RequireStudent>{page}</RequireStudent>
    </StudentLayout>
  );
}

export function StudentApp() {
  return (
    <StudentSessionProvider>
      <StudentRoutes />
    </StudentSessionProvider>
  );
}
