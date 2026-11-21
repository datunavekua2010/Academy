// Explicit in-memory student fixture for legacy UI/content tests. Production
// never imports this module and always starts without a fabricated student.
import { vi } from 'vitest';

vi.mock('../../src/student/session', async () => {
  const React = await import('react');
  const student = {
    id: 'demo-student', name: 'ნინო ბერიძე', firstName: 'ნინო', initials: 'ნბ',
    grade: 'V კლასი', guardian: 'მარიამ ბერიძე', email: 'nino.beridze@example.com',
  };
  const Context = React.createContext<any>(null);
  return {
    StudentSessionProvider: ({ children }: { children: React.ReactNode }) => {
      const [current, setCurrent] = React.useState<typeof student | null>(student);
      return <Context.Provider value={{ student: current, mode: 'demo', status: 'ready', error: null, signedIn: false, signInWithPassword: async () => {}, signOut: () => setCurrent(null) }}>{children}</Context.Provider>;
    },
    useStudentSession: () => React.useContext(Context),
  };
});
