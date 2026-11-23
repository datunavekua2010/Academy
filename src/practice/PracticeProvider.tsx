import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { CURRICULUM, getGrade, getSubtopic, getTopic } from './curriculum';
import { generateBatch, hasTemplates, regenerateFromId, templateCount } from './generator';
import { refillAvoid } from './refill';
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
  progressForAssignment,
  recordAttempt,
  saveAttempts,
  saveDraft,
} from './store';
import type { Assignment, Attempt, GradeStats, SubtopicProgress } from './store';
import type { GradeId, SubtopicRef } from './types';
import { levelForScore, usesLevelBands } from './levels';
import { topicSubtopics } from './types';
import { supabaseConfiguration } from '../lib/supabase';
import { TEST_ACCOUNT_ID } from '../student/accountMode';
import { loadStudentPractice, saveStudentAttempt } from './supabaseStore';
import { ConnectedPracticeMemory } from './connectedMemory';
import { CONNECTED_HOMEWORK_REVIEW } from '../teacher/homework';
import { readTestAssignments, TEST_ASSIGNMENTS_KEY } from '../teacher/testAssignments';

interface PracticeContextValue {
  preview: boolean;
  attempts: Attempt[];
  assignments: Assignment[];
  session: SessionState | null;
  grade: GradeId;
  setGrade: (grade: GradeId) => void;
  activeAssignment: Assignment | null;
  refreshAssignments: (() => Promise<void>) | null;
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
  progressForAssignment: (assignment: Assignment) => SubtopicProgress;
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

/**
 * How many questions a session opens with.
 *
 * Small on purpose. The ladder (levels.ts) is re-read every time the queue is
 * refilled, so a short opening batch is what lets the difficulty actually move
 * with the score: at four points an answer, eight questions is exactly the
 * 0 → 30 stretch where the first band ends.
 */
const OPENING_BATCH = 8;

/**
 * How many questions a refill adds.
 *
 * Kept small for the same reason as `OPENING_BATCH`: every refill re-reads the
 * ladder, so the smaller the batch, the sooner the difficulty matches the score.
 * The queue is topped up when three questions are left, so a batch of four
 * means the new level takes effect within a question or two of being earned.
 */
const REFILL_BATCH = 4;

export function PracticeProvider({ children, studentId, mode, initialGrade, practiceMemory, practiceRevision }: { children: ReactNode; studentId: string; mode: 'demo' | 'connected' | 'guest'; initialGrade: GradeId; practiceMemory?: ConnectedPracticeMemory | null; practiceRevision?: number }) {
  const live = mode === 'connected';
  const preview = mode === 'guest';
  const testAccount = mode === 'demo' && studentId === TEST_ACCOUNT_ID;
  const attemptsKey = testAccount ? 'axiom-academy.test.practice.v1' : undefined;
  const draftKey = testAccount ? 'axiom-academy.test.practice.draft.v1' : undefined;
  const client = live ? supabaseConfiguration.client : null;
  const [attempts, setAttempts] = useState<Attempt[]>(() => live || preview ? [] : loadAttempts(undefined, attemptsKey));
  const [remoteAssignments, setRemoteAssignments] = useState<Assignment[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>(live ? 'loading' : 'ready');
  const [reload, setReload] = useState(0);
  const [syncError, setSyncError] = useState(false);
  const fallbackMemory = useRef(new ConnectedPracticeMemory());
  const memory = practiceMemory ?? fallbackMemory.current;
  const mounted = useRef(false);
  const [session, setSession] = useState<SessionState | null>(() => {
    const draft = live ? memory.draft : preview ? null : loadDraft(undefined, draftKey);
    if (!draft) return null;
    // A draft holds generated question ids ("templateId~seed"); the generator
    // reproduces each one exactly, so a reload never loses the session.
    return hydrateDraft(draft, (id) => regenerateFromId(id));
  });
  const [grade, setGrade] = useState<GradeId>(initialGrade);
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(() => session?.assignmentId ?? null);
  const [testAssignments, setTestAssignments] = useState<Assignment[]>([]);
  const [testAssignmentError, setTestAssignmentError] = useState(false);
  useEffect(() => {
    if (!testAccount) return;
    const refresh = () => { try { setTestAssignments(readTestAssignments().filter((a) => !a.cancelled)); setTestAssignmentError(false); } catch { setTestAssignmentError(true); } };
    refresh();
    const changed = (event: StorageEvent) => { if (event.key === TEST_ASSIGNMENTS_KEY || event.key === null) refresh(); };
    window.addEventListener('storage', changed);
    return () => window.removeEventListener('storage', changed);
  }, [testAccount]);

  const assignments = useMemo(() => preview ? [] : live ? remoteAssignments.filter((item) => item.ref.grade === grade) : [...demoAssignments(grade), ...(testAccount ? testAssignments.filter((item) => item.ref.grade === grade) : [])], [grade, live, preview, remoteAssignments, testAccount, testAssignments]);

  useEffect(() => {
    if (!live || !client) return;
    let active = true;
    setLoadState('loading');
    loadStudentPractice(client, studentId).then((data) => {
      if (!active) return;
      setAttempts(memory.mergeFetched(data.attempts));
      setRemoteAssignments(data.assignments);
      setLoadState('ready');
    }).catch(() => { if (active) setLoadState('error'); });
    return () => { active = false; };
  }, [client, live, studentId, reload, memory]);

  const refreshAssignments = useCallback(async () => {
    if (!live || !client || !CONNECTED_HOMEWORK_REVIEW) return;
    const data = await loadStudentPractice(client, studentId);
    setRemoteAssignments(data.assignments);
  }, [client, live, studentId]);

  const syncPending = useCallback(async () => {
    if (!client) return;
    const ok = await memory.drain((item) => saveStudentAttempt(client, studentId, item), () => mounted.current);
    if (mounted.current) setSyncError(!ok);
  }, [client, studentId, memory]);
  useEffect(() => {
    mounted.current = true;
    // A token refresh can unmount this provider while a request is uncertain.
    // The per-user memory remains above it and resumes only after re-verification.
    if (live && memory.size) void syncPending();
    return () => { mounted.current = false; };
  }, [live, memory, syncPending, practiceRevision]);
  useEffect(() => {
    if (!live) return;
    const warn = (event: BeforeUnloadEvent) => {
      if (memory.size) { event.preventDefault(); event.returnValue = ''; }
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [live, memory]);
  const persistDraft = useCallback((draft: SessionState | null) => {
    if (live) memory.draft = draft;
    else if (!preview) saveDraft(draft, undefined, draftKey);
  }, [live, preview, draftKey, memory]);

  const templateCountFor = useCallback((ref: SubtopicRef) => templateCount(ref), []);
  const isPlayable = useCallback((ref: SubtopicRef) => hasTemplates(ref), []);

  const persistAttempt = useCallback((state: SessionState, startedAt: string) => {
    if (preview) return;
    const attempt = { ...newAttempt(state, startedAt), assignmentId: activeAssignmentId };
    setAttempts((current) => {
      const updated = recordAttempt(current, attempt);
      if (!live) saveAttempts(updated, undefined, attemptsKey);
      return updated;
    });
    if (live) {
      memory.enqueue({ attempt, assignmentId: activeAssignmentId });
      void syncPending();
    }
  }, [live, preview, attemptsKey, activeAssignmentId, syncPending, memory]);

  const startPractice = useCallback((ref: SubtopicRef, assignment: Assignment | null = null) => {

    // A session starts on level 1 and follows the ladder as the score moves
    // (see levels.ts), so the first questions are the recognising ones.
    //
    // The batch is deliberately short: the first 30 points are worth 4 each, so
    // a student crosses the level-1/level-2 threshold after about eight answers.
    // A longer opening batch would leave them on level-1 questions long after
    // they had earned the harder ones.
    const questions = generateBatch(ref, OPENING_BATCH, {
      level: usesLevelBands(ref.grade) ? 1 : undefined,
    });
    if (questions.length === 0) return;
    const nextSession = { ...startSession(ref, questions), assignmentId: assignment?.id ?? null };
    setSession(nextSession);
    setGrade(ref.grade);
    setActiveAssignmentId(assignment?.id ?? null);
    persistDraft(nextSession);
  }, [persistDraft]);

  const answer = useCallback(
    (choice: string): Submission | null => {
      if (!session || preview) return null;
      const submission = submitAnswer(session, choice);
      if (!submission) return null;

      setSession(submission.state);
      persistDraft(submission.state);
      if (submission.state.completed) {
        persistAttempt(submission.state, session.startedAt);
      }
      return submission;
    },
    [session, preview, persistAttempt, persistDraft],
  );

  const next = useCallback(() => {
    if (!session) return;
    // Generate only when the queue is running low, so generation never blocks
    // the answer the student just gave.
    // Top up with questions at the level the *current* score has unlocked, so
    // the next question belongs to the band the student has just reached.
    const refill =
      session.queue.length <= 3
        ? generateBatch(session.ref, REFILL_BATCH, {
            avoid: refillAvoid(session),
            level: usesLevelBands(session.ref.grade)
              ? levelForScore(session.score)
              : undefined,
          })
        : [];
    const updated = advance(session, refill);
    setSession(updated);
    persistDraft(updated);
  }, [session, persistDraft]);

  const stop = useCallback(() => {
    if (!session) return;
    const ended = endSession(session);
    persistDraft(null);
    persistAttempt(ended, session.startedAt);
    setSession(null);
    setActiveAssignmentId(null);
  }, [session, persistAttempt, persistDraft]);

  const clearSession = useCallback(() => {
    persistDraft(null);
    setSession(null);
    setActiveAssignmentId(null);
  }, [persistDraft]);

  const value = useMemo<PracticeContextValue>(() => {
    // A free-practice session is not homework merely because its subtopic matches.
    const activeAssignment = assignments.find((assignment) => assignment.id === activeAssignmentId) ?? null;

    return {
      preview,
      attempts,
      assignments,
      session,
      grade,
      setGrade,
      activeAssignment,
      refreshAssignments: live && CONNECTED_HOMEWORK_REVIEW ? refreshAssignments : null,
      startPractice,
      answer,
      next,
      stop,
      clearSession,
      stats: gradeStats(attempts, grade, assignments),
      overall: overallStats(attempts, assignments),
      progressFor: (ref: SubtopicRef) => progressFor(attempts, ref),
      progressForAssignment: (assignment: Assignment) => progressForAssignment(attempts, assignment),
      templateCountFor,
      isPlayable,
    };
  }, [preview, attempts, assignments, grade, session, activeAssignmentId, live, refreshAssignments, startPractice, answer, next, stop, clearSession, templateCountFor, isPlayable]);

  if (loadState === 'loading') return <div className="student-container" role="status">მონაცემები იტვირთება…</div>;
  if (loadState === 'error') return <div className="student-container" role="alert"><p>მონაცემები ვერ ჩაიტვირთა. სცადე ხელახლა ან დაუკავშირდი აკადემიას.</p><button type="button" className="btn btn-primary" onClick={() => setReload((v) => v + 1)}>ხელახლა ცდა</button></div>;
  return <PracticeContext.Provider value={value}>
    {testAssignmentError && <div className="student-container" role="alert">დავალებები ვერ ჩაიტვირთა. შეამოწმე ბრაუზერის საცავი.</div>}
    {syncError && <div className="student-container" role="alert"><p>შედეგი ვერ შეინახა. არ დახურო გვერდი და სცადე ხელახლა.</p><button type="button" className="btn btn-primary" onClick={() => void syncPending()}>ხელახლა შენახვა</button></div>}
    {children}
  </PracticeContext.Provider>;
}

export function usePractice(): PracticeContextValue {
  const ctx = useContext(PracticeContext);
  if (!ctx) throw new Error('usePractice must be used inside PracticeProvider');
  return ctx;
}

export { CURRICULUM, getGrade, getSubtopic, getTopic };
