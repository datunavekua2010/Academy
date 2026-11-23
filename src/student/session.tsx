import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabaseConfiguration } from '../lib/supabase';
import { setLessonProgressOwner } from '../lessons/progress';
import { TEST_ACCOUNT_ID, TEST_ACCOUNT_MODE } from './accountMode';
import { ConnectedPracticeMemory } from '../practice/connectedMemory';

export interface Student {
  id: string;
  name: string;
  firstName: string;
  initials: string;
  grade: string;
  guardian: string;
  email: string;
}

type SessionStatus = 'loading' | 'ready' | 'error';
interface StudentSessionValue {
  student: Student | null;
  mode: 'test' | 'unconfigured' | 'connected' | 'invalid';
  status: SessionStatus;
  error: string | null;
  signedIn: boolean;
  practiceMemory: ConnectedPracticeMemory | null;
  practiceRevision: number;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const StudentSessionContext = createContext<StudentSessionValue | null>(null);

const TEST_STUDENT: Student = {
  id: TEST_ACCOUNT_ID, name: 'სატესტო მოსწავლე', firstName: 'მოსწავლე', initials: 'სმ',
  grade: 'V კლასი', guardian: '—', email: '—',
};

/** The current public experience is local-only and does not authenticate anyone. */
function TestStudentSessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    setLessonProgressOwner(TEST_ACCOUNT_ID);
    setReady(true);
  }, []);
  const value = useMemo<StudentSessionValue>(() => ({
    student: TEST_STUDENT, mode: 'test', status: 'ready', error: null, signedIn: false, practiceMemory: null, practiceRevision: 0,
    signInWithPassword: async () => {}, signOut: () => {},
  }), []);
  if (!ready) return null;
  return <StudentSessionContext.Provider value={value}>{children}</StudentSessionContext.Provider>;
}

/** Switch back to the academy provider once sign-in is ready for launch. */
export function StudentSessionProvider({ children }: { children: ReactNode }) {
  return TEST_ACCOUNT_MODE ? <TestStudentSessionProvider>{children}</TestStudentSessionProvider> : <AcademyStudentSessionProvider>{children}</AcademyStudentSessionProvider>;
}

/** Kept for the future sign-in step; never mounted in test-account mode. */
export function AcademyStudentSessionProvider({ children }: { children: ReactNode }) {
  const { mode, client } = supabaseConfiguration;
  const [student, setStudent] = useState<Student | null>(null);
  const [user, setUser] = useState<User | null>(null);
  // Survives same-user auth re-verification, but never crosses account changes.
  // Replacing the user or signing out discards it; it is not persistent storage.
  const [practiceMemory, setPracticeMemory] = useState<ConnectedPracticeMemory | null>(null);
  const [practiceRevision, setPracticeRevision] = useState(0);
  const memoryOwner = useRef<string | null>(null);
  const currentMemory = useRef<ConnectedPracticeMemory | null>(null);
  // Keep the unload warning during the brief re-verification interval, when
  // PracticeProvider itself is deliberately unmounted and cannot warn.
  useEffect(() => {
    if (!practiceMemory) return;
    const warn = (event: BeforeUnloadEvent) => {
      if (practiceMemory.size) { event.preventDefault(); event.returnValue = ''; }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [practiceMemory]);
  const authRevision = useRef(0);
  const [verification, setVerification] = useState(0);
  const [status, setStatus] = useState<SessionStatus>(mode === 'connected' ? 'loading' : mode === 'invalid' ? 'error' : 'ready');
  const [error, setError] = useState<string | null>(mode === 'invalid' || mode === 'unconfigured' ? 'ანგარიშით შესვლა ამჟამად მიუწვდომელია. დაუკავშირდი აკადემიას.' : null);

  useEffect(() => {
    if (!client) return;
    let active = true;
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      // Do not await Supabase calls inside the auth callback (the SDK holds a lock).
      const nextUser = session?.user ?? null;
      const nextOwner = nextUser?.id ?? null;
      // Process every auth transition, including sign-out and same-user sign-in
      // in one React batch; batched user state alone can hide that boundary.
      currentMemory.current?.pause();
      if (memoryOwner.current !== nextOwner) {
        memoryOwner.current = nextOwner;
        currentMemory.current = nextOwner ? new ConnectedPracticeMemory() : null;
        currentMemory.current?.pause();
        setPracticeMemory(currentMemory.current);
      }
      // Invalidate outstanding profile reads even for a token refresh of the same
      // user, so role revocation is noticed on the next auth event.
      authRevision.current++;
      setVerification(authRevision.current);
      setLessonProgressOwner(null);
      setStudent(null);
      setUser(nextUser);
      setStatus(session?.user ? 'loading' : 'ready');
      setError(null);
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [client]);

  useEffect(() => {
    if (!client || !user) return;
    let active = true;
    const revision = verification;
    async function loadStudent() {
      try {
        const [profile, role, grade] = await Promise.all([
          client!.from('profiles').select('display_name, first_name').eq('id', user!.id).maybeSingle(),
          client!.from('user_roles').select('role').eq('user_id', user!.id).eq('role', 'student').maybeSingle(),
          client!.from('student_grades').select('grade').eq('student_id', user!.id).maybeSingle(),
        ]);
        if (profile.error || role.error || grade.error || !profile.data || !role.data || typeof profile.data.display_name !== 'string' || typeof profile.data.first_name !== 'string') throw new Error('unavailable');
        if (!active || revision !== authRevision.current) return;
        currentMemory.current?.resume();
        setPracticeRevision(revision);
        setLessonProgressOwner(user!.id);
        const name = profile.data.display_name as string;
        const firstName = profile.data.first_name as string;
        const gradeNumber = grade.data?.grade;
        setStudent({ id: user!.id, name, firstName, initials: name.split(/\s+/).filter(Boolean).slice(0, 2).map((part: string) => part[0]).join(''),
          grade: Number.isInteger(gradeNumber) && gradeNumber >= 1 && gradeNumber <= 7 ? `${gradeNumber} კლასი` : '',
          guardian: '—', email: user!.email ?? '—' });
        setStatus('ready');
      } catch {
        if (!active || revision !== authRevision.current) return;
        setStudent(null);
        setStatus('error');
        setError('მოსწავლის პროფილი ვერ ჩაიტვირთა. დაუკავშირდი აკადემიას.');
      }
    }
    void loadStudent();
    return () => { active = false; };
  }, [client, user, verification]);

  const value = useMemo<StudentSessionValue>(() => ({
    student, mode, status, error, signedIn: Boolean(user), practiceMemory, practiceRevision,
    signInWithPassword: async (email, password) => {
      if (!client) return;
      setError(null);
      try {
        const { error: signInError } = await client.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      } catch { setError('შესვლა ვერ მოხერხდა. შეამოწმე მონაცემები ან დაუკავშირდი აკადემიას.'); }
    },
    signOut: () => {
      if (!client) return;
      void client.auth.signOut().then(({ error: signOutError }) => {
        if (signOutError) setError('გასვლა ვერ მოხერხდა. სცადე ხელახლა.');
      }).catch(() => setError('გასვლა ვერ მოხერხდა. სცადე ხელახლა.'));
    },
  }), [student, mode, status, error, user, client, practiceMemory, practiceRevision]);

  return <StudentSessionContext.Provider value={value}>{children}</StudentSessionContext.Provider>;
}

export function useStudentSession(): StudentSessionValue {
  const ctx = useContext(StudentSessionContext);
  if (!ctx) throw new Error('useStudentSession must be used inside StudentSessionProvider');
  return ctx;
}
