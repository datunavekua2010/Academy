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
import { levelForScore, usesLevelBands } from './levels';
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
    // Avoid both the ids already used and the wording/numbers behind them, so a
    // refill can never re-add a question the student has already seen.
    // Everything this session has ever shown — answered as well as queued.
    // `session.questions` only holds what is still ahead, so an answered
    // question had already dropped out of it; avoiding only the current queue
    // let the generator hand back a question the student had just finished.
    //
    // Prompt *and* picture, as `advance` itself compares: a positional question
    // asks several things about one drawn row, so the same sentence over a
    // different row is a different question.
    const seen = session.answers.map((answer) => {
      // Older drafts stored no prompt with the answer; those fall back to the id.
      const question = session.questions[answer.questionId];
      const prompt = answer.prompt ?? question?.prompt ?? answer.questionId;
      const visual = answer.visual ?? question?.visual ?? '';
      return `${prompt}|${visual}`;
    });
    // Top up with questions at the level the *current* score has unlocked, so
    // the next question belongs to the band the student has just reached.
    const refill =
      session.queue.length <= 3
        ? generateBatch(session.ref, REFILL_BATCH, {
            avoid: new Set([...used, ...seen]),
            level: usesLevelBands(session.ref.grade)
              ? levelForScore(session.score)
              : undefined,
          })
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
