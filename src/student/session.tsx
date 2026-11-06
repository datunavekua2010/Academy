import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export interface Student {
  id: string;
  name: string;
  firstName: string;
  initials: string;
  grade: string;
  guardian: string;
  email: string;
}

/**
 * DEMO ONLY.
 *
 * The repository has no backend or auth provider yet. This provider keeps the
 * student area behind a session check so the navigation feature can never be
 * mistaken for authentication. Replace `DEMO_STUDENT` / `signIn` with the real
 * auth provider (and move the check to the server) before production.
 */
const DEMO_STUDENT: Student = {
  id: 'demo-student',
  name: 'ნინო ბერიძე',
  firstName: 'ნინო',
  initials: 'ნბ',
  grade: 'V კლასი',
  guardian: 'მარიამ ბერიძე',
  email: 'nino.beridze@example.com',
};

interface StudentSessionValue {
  student: Student | null;
  signIn: () => void;
  signOut: () => void;
}

const StudentSessionContext = createContext<StudentSessionValue | null>(null);

export function StudentSessionProvider({ children }: { children: ReactNode }) {
  // A demo student is signed in so the dashboard is immediately explorable.
  const [student, setStudent] = useState<Student | null>(DEMO_STUDENT);

  const value = useMemo<StudentSessionValue>(
    () => ({
      student,
      signIn: () => setStudent(DEMO_STUDENT),
      signOut: () => setStudent(null),
    }),
    [student],
  );

  return <StudentSessionContext.Provider value={value}>{children}</StudentSessionContext.Provider>;
}

export function useStudentSession(): StudentSessionValue {
  const ctx = useContext(StudentSessionContext);
  if (!ctx) throw new Error('useStudentSession must be used inside StudentSessionProvider');
  return ctx;
}
