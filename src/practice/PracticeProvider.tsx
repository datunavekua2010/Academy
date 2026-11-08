import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { CURRICULUM, getGrade, getSubtopic, getTopic } from './curriculum';
import { generateBatch, hasTemplates, regenerateFromId, templateCount } from './generator';
import { advance, endSession, hydrateDraft, startSession, submitAnswer } from './session';
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
import type { GradeId, SubtopicRef } from './types';
import { topicSubtopics } from './types';

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
  /** How many templates cover a subtopic (variations are unlimited). */
  templateCountFor: (ref: SubtopicRef) => number;
  /** True when a subtopic can be practised (it has at least one template). */
  isPlayable: (ref: SubtopicRef) => boolean;
}

const PracticeContext = createContext<PracticeContextValue | null>(null);

function demoAssignments(grade: GradeId): Assignment[] {
  const curriculum = getGrade(grade);
  const all = curriculum.topics.flatMap((topic) =>
    topicSubtopics(topic).map((subtopic) => ({
      topicId: topic.id,
      topicTitle: topic.title,
      subtopicId: subtopic.id,
    })),
  );

  // Assign only subtopics that actually have a template, otherwise the
  // homework list would offer work the student cannot start. When the academy
  // sends its templates, coverage grows and assignments follow automatically.
  const playable = all.filter(
    (item) =>
      hasTemplates({ grade, topicId: item.topicId, subtopicId: item.subtopicId }),
  );

  return buildDemoAssignments(grade, playable.length > 0 ? playable : all);
}

export function PracticeProvider({ children }: { children: ReactNode }) {
  const [attempts, setAttempts] = useState<Attempt[]>(() => loadAttempts());
  const [session, setSession] = useState<SessionState | null>(() => {
    const draft = loadDraft();
    if (!draft) return null;
    // A draft holds generated question ids ("templateId~seed"); the generator
    // reproduces each one exactly, so a reload never loses the session.
    return hydrateDraft(draft, (id) => regenerateFromId(id));
  });
  const [grade, setGrade] = useState<GradeId>(5);
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);

  const assignments = useMemo(() => demoAssignments(grade), [grade]);

  const templateCountFor = useCallback((ref: SubtopicRef) => templateCount(ref), []);
  const isPlayable = useCallback((ref: SubtopicRef) => hasTemplates(ref), []);

  const persistAttempt = useCallback((state: SessionState, startedAt: string) => {
    setAttempts((current) => {
      const updated = recordAttempt(current, newAttempt(state, startedAt));
      saveAttempts(updated);
      return updated;
    });
  }, []);

  const startPractice = useCallback((ref: SubtopicRef, assignment: Assignment | null = null) => {
    // 12 variations is enough to cover the early, high-value part of a session.
    // More are generated on demand as the queue drains.
    const questions = generateBatch(ref, 12);
    if (questions.length === 0) return;
    const nextSession = startSession(ref, questions);
    setSession(nextSession);
    setGrade(ref.grade);
    setActiveAssignmentId(assignment?.id ?? null);
    saveDraft(nextSession);
  }, []);

  const answer = useCallback(
    (choice: string): Submission | null => {
      if (!session) return null;
      const submission = submitAnswer(session, choice);
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
    // Generate only when the queue is running low, so generation never blocks
    // the answer the student just gave.
    const used = new Set(Object.keys(session.questions));
    const refill =
      session.queue.length <= 3
        ? generateBatch(session.ref, 6, { avoid: new Set(used) })
        : [];
    const updated = advance(session, refill);
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
      templateCountFor,
      isPlayable,
    };
  }, [attempts, assignments, grade, session, activeAssignmentId, startPractice, answer, next, stop, clearSession, templateCountFor, isPlayable]);

  return <PracticeContext.Provider value={value}>{children}</PracticeContext.Provider>;
}

export function usePractice(): PracticeContextValue {
  const ctx = useContext(PracticeContext);
  if (!ctx) throw new Error('usePractice must be used inside PracticeProvider');
  return ctx;
}

export { CURRICULUM, getGrade, getSubtopic, getTopic };
