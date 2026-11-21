import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabaseConfiguration } from '../lib/supabase';
import { setLessonProgressOwner } from '../lessons/progress';

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
  mode: 'unconfigured' | 'connected' | 'invalid';
  status: SessionStatus;
  error: string | null;
  signedIn: boolean;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const StudentSessionContext = createContext<StudentSessionValue | null>(null);

export function StudentSessionProvider({ children }: { children: ReactNode }) {
  const { mode, client } = supabaseConfiguration;
  const [student, setStudent] = useState<Student | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const userId = useRef<string | null | undefined>(undefined);
  const [status, setStatus] = useState<SessionStatus>(mode === 'connected' ? 'loading' : mode === 'invalid' ? 'error' : 'ready');
  const [error, setError] = useState<string | null>(mode === 'invalid' || mode === 'unconfigured' ? 'ანგარიშით შესვლა ამჟამად მიუწვდომელია. დაუკავშირდი აკადემიას.' : null);

  useEffect(() => {
    if (!client) return;
    let active = true;
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      // Do not await Supabase calls inside the auth callback (the SDK holds a lock).
      const nextUser = session?.user ?? null;
      if (userId.current === nextUser?.id && nextUser) return;
      userId.current = nextUser?.id ?? null;
      setLessonProgressOwner(nextUser?.id ?? null);
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
    async function loadStudent() {
      try {
        const [profile, role, grade] = await Promise.all([
          client!.from('profiles').select('display_name, first_name').eq('id', user!.id).maybeSingle(),
          client!.from('user_roles').select('role').eq('user_id', user!.id).eq('role', 'student').maybeSingle(),
          client!.from('student_grades').select('grade').eq('student_id', user!.id).maybeSingle(),
        ]);
        if (profile.error || role.error || grade.error || !profile.data || !role.data) throw new Error('unavailable');
        if (!active) return;
        const name = profile.data.display_name as string;
        const firstName = profile.data.first_name as string;
        const gradeNumber = grade.data?.grade;
        setStudent({ id: user!.id, name, firstName, initials: name.split(/\s+/).filter(Boolean).slice(0, 2).map((part: string) => part[0]).join(''),
          grade: Number.isInteger(gradeNumber) && gradeNumber >= 1 && gradeNumber <= 7 ? `${gradeNumber} კლასი` : '',
          guardian: '—', email: user!.email ?? '—' });
        setStatus('ready');
      } catch {
        if (!active) return;
        setStudent(null);
        setStatus('error');
        setError('მოსწავლის პროფილი ვერ ჩაიტვირთა. დაუკავშირდი აკადემიას.');
      }
    }
    void loadStudent();
    return () => { active = false; };
  }, [client, user]);

  const value = useMemo<StudentSessionValue>(() => ({
    student, mode, status, error, signedIn: Boolean(user),
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
  }), [student, mode, status, error, user, client]);

  return <StudentSessionContext.Provider value={value}>{children}</StudentSessionContext.Provider>;
}

export function useStudentSession(): StudentSessionValue {
  const ctx = useContext(StudentSessionContext);
  if (!ctx) throw new Error('useStudentSession must be used inside StudentSessionProvider');
  return ctx;
}
