import { useEffect, useLayoutEffect, useState, type ReactNode } from 'react';
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
import { Achievements } from './pages/Achievements';
import { Streaks } from './pages/Streaks';
import { StudentLayout } from './StudentLayout';
import { StudentSignIn } from './StudentSignIn';
import { StudentSessionProvider, useStudentSession } from './session';

const TITLES: Record<string, string> = {
  '': 'მოსწავლის დაფა',
  lessons: 'ჩემი გაკვეთილები',
  homework: 'საშინაო დავალება',
  practice: 'ვარჯიში',
  progress: 'ჩემი პროგრესი',
  achievements: 'მიღწევები',
  streaks: 'სწავლის სერია',
  profile: 'ჩემი პროფილი',
};

/** Public material has an isolated, non-persistent guest preview. */
export function RequireStudent({ children, publicPreview }: { children: ReactNode; publicPreview: boolean }) {
  const { student, mode, status, signedIn, practiceMemory, practiceRevision } = useStudentSession();
  const [learningGrade, setLearningGrade] = useState<{ owner: string; grade: GradeId } | null>(null);
  if (!student) {
    if (publicPreview && status === 'ready' && !signedIn && mode !== 'invalid') {
      return <PracticeProvider key="guest" studentId="" mode="guest" initialGrade={1}>{children}</PracticeProvider>;
    }
    return <StudentSignIn />;
  }
  const initialGrade = parseStudentGrade(student.grade) ?? (learningGrade?.owner === student.id ? learningGrade.grade : null);
  if (!initialGrade) return <section className="student-page"><h1>აირჩიე სასწავლო კლასი</h1><p>ეს არჩევანი მხოლოდ სასწავლო მასალის საწყის დონეს განსაზღვრავს; პროფილში კლასი არ ინახება.</p><div>{([1,2,3,4,5,6,7] as GradeId[]).map(grade => <button type="button" className="btn btn-ghost" key={grade} onClick={() => setLearningGrade({owner:student.id,grade})}>{grade} კლასი</button>)}</div><Link to="/">მთავარ გვერდზე დაბრუნება</Link></section>;
  return <PracticeProvider key={`${mode}:${student.id}`} studentId={student.id} practiceMemory={practiceMemory} practiceRevision={practiceRevision} mode={mode === 'connected' ? 'connected' : 'demo'} initialGrade={initialGrade}>{children}</PracticeProvider>;
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
  const { grade: currentGrade, setGrade, preview } = usePractice();
  useLayoutEffect(() => { setGrade(grade); }, [grade, setGrade]);
  if (currentGrade !== grade) return null;
  return preview ? <Practice /> : <Homework />;
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
    case 'achievements':
      page = <Achievements />;
      break;
    case 'streaks':
      page = <Streaks />;
      break;
    case 'profile':
      page = <Profile />;
      break;
    default:
      page = <NotFound />;
  }
  if (head !== 'lessons' && head !== 'homework' && rest) page = <NotFound />;

  return (
    <StudentLayout activeSection={head}>
      <RequireStudent publicPreview={head === 'practice' || head === 'lessons' || head === 'homework'}>{page}</RequireStudent>
    </StudentLayout>
  );
}

export function StudentApp({ previewOnly = false }: { previewOnly?: boolean }) {
  return (
    <StudentSessionProvider previewOnly={previewOnly}>
      <StudentRoutes />
    </StudentSessionProvider>
  );
}
