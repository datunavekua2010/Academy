import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { CURRICULUM, getGrade, getSubtopic, getTopic } from './curriculum';
import { questionsForSubtopic } from './bank';
import { advance, endSession, startSession, submitAnswer } from './session';
import type { SessionState, Submission } from './session';
import {
  buildDemoAssignments,
  gradeStats,
  loadAttempts,
  loadDraft,
  newAttempt,
  overallStats,
  progressFor,
  recordAttempt,
  saveAttempts,
  saveDraft,
  subtopicKey,
} from './store';
import type { Assignment, Attempt, GradeStats, SubtopicProgress } from './store';
import type { GradeId, Question, SubtopicRef } from './types';

interface PracticeContextValue {
  attempts: Attempt[];
  assignments: Assignment[];
  session: SessionState | null;
  grade: GradeId;
  setGrade: (grade: GradeId) => void;
  activeAssignment: Assignment | null;
  startPractice: (ref: SubtopicRef, assignment?: Assignment | null) => void;
  answer: (choice: string) => Submission | null;
  next: () => void;
  /** Ends the current session early and records the score reached. */
  stop: () => void;
  /** Leaves the session screen (used after a completed session is closed). */
  clearSession: () => void;
  /** Home for the 100-point rules and the first screen after sign-in. */
  stats: GradeStats;
  overall: ReturnType<typeof overallStats>;
  progressFor: (ref: SubtopicRef) => SubtopicProgress;
  bankFor: (ref: SubtopicRef) => Question[];
}

const PracticeContext = createContext<PracticeContextValue | null>(null);

function demoAssignments(grade: GradeId): Assignment[] {
  const curriculum = getGrade(grade);
  const subtopics = curriculum.topics.flatMap((topic) =>
    topic.subtopics.map((subtopic) => ({
      topicId: topic.id,
      topicTitle: topic.title,
      subtopicId: subtopic.id,
    })),
  );
  return buildDemoAssignments(grade, subtopics);
}

export function PracticeProvider({ children }: { children: ReactNode }) {
  const [attempts, setAttempts] = useState<Attempt[]>(() => loadAttempts());
  const [session, setSession] = useState<SessionState | null>(() => loadDraft());
  const [grade, setGrade] = useState<GradeId>(5);
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);

  const assignments = useMemo(() => demoAssignments(grade), [grade]);

  const bankFor = useCallback((ref: SubtopicRef) => questionsForSubtopic(ref), []);

  const persistAttempt = useCallback((state: SessionState, startedAt: string) => {
    setAttempts((current) => {
      const updated = recordAttempt(current, newAttempt(state, startedAt));
      saveAttempts(updated);
      return updated;
    });
  }, []);

  const startPractice = useCallback((ref: SubtopicRef, assignment: Assignment | null = null) => {
    const pool = questionsForSubtopic(ref);
    if (pool.length === 0) return;
    const nextSession = startSession(ref, pool);
    setSession(nextSession);
    setGrade(ref.grade);
    setActiveAssignmentId(assignment?.id ?? null);
    saveDraft(nextSession);
  }, []);

  const answer = useCallback(
    (choice: string): Submission | null => {
      if (!session) return null;
      const submission = submitAnswer(session, questionsForSubtopic(session.ref), choice);
      if (!submission) return null;

      setSession(submission.state);
      saveDraft(submission.state);
      if (submission.state.completed) {
        persistAttempt(submission.state, session.startedAt);
      }
      return submission;
    },
    [session, persistAttempt],
  );

  const next = useCallback(() => {
    if (!session) return;
    const updated = advance(session, questionsForSubtopic(session.ref));
    setSession(updated);
    saveDraft(updated);
  }, [session]);

  const stop = useCallback(() => {
    if (!session) return;
    const ended = endSession(session);
    saveDraft(null);
    persistAttempt(ended, session.startedAt);
    setSession(null);
    setActiveAssignmentId(null);
  }, [session, persistAttempt]);

  const clearSession = useCallback(() => {
    saveDraft(null);
    setSession(null);
    setActiveAssignmentId(null);
  }, []);

  const value = useMemo<PracticeContextValue>(() => {
    const activeAssignment =
      assignments.find((assignment) => assignment.id === activeAssignmentId) ??
      (session
        ? assignments.find((assignment) => assignment.key === subtopicKey(session.ref)) ?? null
        : null);

    return {
      attempts,
      assignments,
      session,
      grade,
      setGrade,
      activeAssignment,
      startPractice,
      answer,
      next,
      stop,
      clearSession,
      stats: gradeStats(attempts, grade, assignments),
      overall: overallStats(attempts, assignments),
      progressFor: (ref: SubtopicRef) => progressFor(attempts, ref),
      bankFor,
    };
  }, [attempts, assignments, grade, session, activeAssignmentId, startPractice, answer, next, stop, clearSession, bankFor]);

  return <PracticeContext.Provider value={value}>{children}</PracticeContext.Provider>;
}

export function usePractice(): PracticeContextValue {
  const ctx = useContext(PracticeContext);
  if (!ctx) throw new Error('usePractice must be used inside PracticeProvider');
  return ctx;
}

export { CURRICULUM, getGrade, getSubtopic, getTopic };
