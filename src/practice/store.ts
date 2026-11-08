import type { SessionAnswer, SessionState } from './session';
import { subtopicKey as makeSubtopicKey } from './types';
import type { GradeId, SubtopicRef } from './types';

/**
 * Progress + assignment store.
 *
 * Attempts are the only durable record of work: homework completion, topic
 * mastery and "needs more practice" are all derived from them, so there is no
 * second source of truth to drift out of sync.
 *
 * Persistence is localStorage for the demo; a real deployment swaps the
 * read/write functions for the student's account API without touching the UI.
 */

export interface Attempt {
  id: string;
  ref: SubtopicRef;
  key: string;
  score: number;
  correct: number;
  incorrect: number;
  startedAt: string;
  finishedAt: string;
  seconds: number;
  completed: boolean;
  answers: SessionAnswer[];
}

export interface Assignment {
  id: string;
  key: string;
  ref: SubtopicRef;
  assignedAt: string;
  dueAt: string;
  assignedBy: string;
}

export interface SubtopicProgress {
  bestScore: number;
  lastScore: number | null;
  attempts: number;
  completed: boolean;
  correct: number;
  incorrect: number;
  lastAttemptAt: string | null;
}

export interface GradeStats {
  assigned: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  /** Average of best scores across all subtopics touched, 0–100. */
  mastery: number;
  correct: number;
  incorrect: number;
  attempts: number;
}

export type AssignmentStatus = 'not-started' | 'in-progress' | 'completed';

export const STORAGE_KEY = 'axiom-academy.practice.v1';
const DRAFT_KEY = 'axiom-academy.practice.draft.v1';
const MAX_ATTEMPTS = 400;

interface StoredData {
  version: 1;
  attempts: Attempt[];
}

export function subtopicKey(ref: SubtopicRef): string {
  return makeSubtopicKey(ref);
}

export function newAttempt(state: SessionState, startedAt: string): Attempt {
  const finishedAt = state.finishedAt ?? new Date().toISOString();
  const seconds = Math.max(
    1,
    Math.round((new Date(finishedAt).getTime() - new Date(startedAt).getTime()) / 1000),
  );
  return {
    id: state.id,
    ref: state.ref,
    key: subtopicKey(state.ref),
    score: state.score,
    correct: state.correct,
    incorrect: state.incorrect,
    startedAt,
    finishedAt,
    seconds,
    completed: state.score >= 100,
    answers: state.answers,
  };
}

/** Teacher-assigned work for the demo grades. Replaced by the real API. */
export function buildDemoAssignments(
  grade: GradeId,
  subtopics: Array<{ topicId: string; topicTitle: string; subtopicId: string }>,
  today = new Date(),
): Assignment[] {
  // Four assignments per grade: two from the first topic, one from the second
  // and one from the third — a plausible spread of "core" work.
  const picks: Array<{ index: number; dueInDays: number }> = [
    { index: 0, dueInDays: 1 },
    { index: 1, dueInDays: 3 },
    { index: 2, dueInDays: 5 },
    { index: 3, dueInDays: 8 },
  ];
  const assignedAt = new Date(today);
  assignedAt.setHours(9, 0, 0, 0);

  return picks
    .map(({ index, dueInDays }, order) => {
      const item = subtopics[index];
      if (!item) return null;
      const due = new Date(today);
      due.setDate(due.getDate() + dueInDays);
      due.setHours(18, 0, 0, 0);
      const ref: SubtopicRef = {
        grade,
        topicId: item.topicId,
        subtopicId: item.subtopicId,
      };
      return {
        id: `demo-${grade}-${order + 1}-${item.topicId}-${item.subtopicId}`,
        key: subtopicKey(ref),
        ref,
        assignedAt: assignedAt.toISOString(),
        dueAt: due.toISOString(),
        assignedBy: 'ანა კვარაცხელია',
      } satisfies Assignment;
    })
    .filter((item): item is Assignment => item !== null);
}

export function loadAttempts(storage: Storage | undefined = safeStorage()): Attempt[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredData;
    if (parsed?.version !== 1 || !Array.isArray(parsed.attempts)) return [];
    return parsed.attempts.filter(isAttempt);
  } catch {
    return [];
  }
}

export function saveAttempts(attempts: Attempt[], storage: Storage | undefined = safeStorage()): void {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, attempts } satisfies StoredData));
  } catch {
    // Storage can be unavailable (private mode, quota). Progress then lives for
    // the current tab only instead of breaking the session.
  }
}

export function loadDraft(storage: Storage | undefined = safeStorage()): SessionState | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionState;
    if (!parsed?.ref || !Array.isArray(parsed.queue) || typeof parsed.score !== 'number') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveDraft(state: SessionState | null, storage: Storage | undefined = safeStorage()): void {
  if (!storage) return;
  try {
    if (state) storage.setItem(DRAFT_KEY, JSON.stringify(state));
    else storage.removeItem(DRAFT_KEY);
  } catch {
    // ignored — see saveAttempts
  }
}

function isAttempt(value: unknown): value is Attempt {
  if (!value || typeof value !== 'object') return false;
  const attempt = value as Attempt;
  return (
    typeof attempt.id === 'string' &&
    typeof attempt.score === 'number' &&
    Boolean(attempt.ref) &&
    Array.isArray(attempt.answers)
  );
}

export function safeStorage(): Storage | undefined {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return undefined;
    return window.localStorage;
  } catch {
    return undefined;
  }
}

export function progressFor(attempts: Attempt[], ref: SubtopicRef): SubtopicProgress {
  const key = subtopicKey(ref);
  const mine = attempts.filter((attempt) => attempt.key === key);
  if (mine.length === 0) {
    return {
      bestScore: 0,
      lastScore: null,
      attempts: 0,
      completed: false,
      correct: 0,
      incorrect: 0,
      lastAttemptAt: null,
    };
  }

  const bestScore = Math.max(...mine.map((attempt) => attempt.score));
  const last = mine[mine.length - 1];
  return {
    bestScore,
    lastScore: last.score,
    attempts: mine.length,
    completed: bestScore >= 100,
    correct: mine.reduce((sum, attempt) => sum + attempt.correct, 0),
    incorrect: mine.reduce((sum, attempt) => sum + attempt.incorrect, 0),
    lastAttemptAt: last.finishedAt,
  };
}

export function assignmentStatus(progress: SubtopicProgress): AssignmentStatus {
  if (progress.completed) return 'completed';
  if (progress.attempts > 0) return 'in-progress';
  return 'not-started';
}

export function gradeStats(
  attempts: Attempt[],
  grade: GradeId,
  assignments: Assignment[],
): GradeStats {
  const gradeAssignments = assignments.filter((assignment) => assignment.ref.grade === grade);
  const statuses = gradeAssignments.map((assignment) =>
    assignmentStatus(progressFor(attempts, assignment.ref)),
  );
  const touched = attempts.filter((attempt) => attempt.ref.grade === grade);
  const bestByKey = new Map<string, number>();
  for (const attempt of touched) {
    bestByKey.set(attempt.key, Math.max(bestByKey.get(attempt.key) ?? 0, attempt.score));
  }
  const mastery =
    bestByKey.size === 0
      ? 0
      : Math.round([...bestByKey.values()].reduce((sum, value) => sum + value, 0) / bestByKey.size);

  return {
    assigned: gradeAssignments.length,
    completed: statuses.filter((status) => status === 'completed').length,
    inProgress: statuses.filter((status) => status === 'in-progress').length,
    notStarted: statuses.filter((status) => status === 'not-started').length,
    mastery,
    correct: touched.reduce((sum, attempt) => sum + attempt.correct, 0),
    incorrect: touched.reduce((sum, attempt) => sum + attempt.incorrect, 0),
    attempts: touched.length,
  };
}

export function overallStats(attempts: Attempt[], assignments: Assignment[]) {
  const statuses = assignments.map((assignment) =>
    assignmentStatus(progressFor(attempts, assignment.ref)),
  );
  const completed = statuses.filter((status) => status === 'completed').length;
  return {
    assigned: assignments.length,
    completed,
    inProgress: statuses.filter((status) => status === 'in-progress').length,
    percent: assignments.length === 0 ? 0 : Math.round((completed / assignments.length) * 100),
    correct: attempts.reduce((sum, attempt) => sum + attempt.correct, 0),
    incorrect: attempts.reduce((sum, attempt) => sum + attempt.incorrect, 0),
    attempts: attempts.length,
  };
}

/**
 * Subtopics that still need work: touched, but never completed at 100 points.
 * Returns the latest attempt for each such subtopic, weakest first.
 */
export function needsWork(attempts: Attempt[]): Attempt[] {
  const bestByKey = new Map<string, number>();
  const latestByKey = new Map<string, Attempt>();

  for (const attempt of attempts) {
    bestByKey.set(attempt.key, Math.max(bestByKey.get(attempt.key) ?? 0, attempt.score));
    latestByKey.set(attempt.key, attempt);
  }

  return [...latestByKey.entries()]
    .filter(([key]) => (bestByKey.get(key) ?? 0) < 100)
    .map(([, attempt]) => attempt)
    .sort((a, b) => a.score - b.score);
}

export function recordAttempt(attempts: Attempt[], attempt: Attempt): Attempt[] {
  if (attempts.some((item) => item.id === attempt.id)) return attempts;
  return [...attempts, attempt].slice(-MAX_ATTEMPTS);
}
