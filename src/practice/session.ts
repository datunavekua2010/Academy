import { applyAnswer, MAX_SCORE, type AnswerResult } from './scoring';
import type { Question, SubtopicRef } from './types';

/**
 * The single practice engine.
 *
 * Homework and free practice both create a `SessionState` through
 * `startSession` and answer through `submitAnswer`. Nothing else in the app is
 * allowed to modify a score.
 *
 * Questions are *generated*, so the session carries the variations it has
 * already drawn (`questions`). A generated question id is `templateId~seed`
 * and the generator is deterministic, so a stored session can always be
 * rebuilt into exactly the same questions after a reload.
 *
 * A perfect run needs 35 answers, far more than a small template set can supply
 * without repeating, so the queue is topped up on demand — the caller passes
 * freshly generated questions to `advance`.
 */

export interface SessionAnswer {
  questionId: string;
  choice: string;
  correct: boolean;
  previousScore: number;
  scoreAfter: number;
  delta: number;
  at: string;
}

export interface SessionState {
  id: string;
  ref: SubtopicRef;
  /** Question ids still to be answered, current question first. */
  queue: string[];
  /** Every generated variation in this session, keyed by id. */
  questions: Record<string, Question>;
  score: number;
  correct: number;
  incorrect: number;
  startedAt: string;
  finishedAt: string | null;
  /** True after the score reaches 100. */
  completed: boolean;
  /** True when the last answer has been submitted but not advanced past. */
  awaitingNext: boolean;
  answers: SessionAnswer[];
}

export function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Adds questions to the session's own store without touching the queue. */
export function addQuestions(
  state: SessionState,
  questions: Question[],
): Record<string, Question> {
  if (questions.length === 0) return state.questions;
  const next = { ...state.questions };
  for (const question of questions) next[question.id] = question;
  return next;
}

export function startSession(
  ref: SubtopicRef,
  questions: Question[],
  now = new Date(),
): SessionState {
  if (questions.length === 0) {
    throw new Error('Cannot start a practice session without questions');
  }

  return {
    id: makeId('session'),
    ref,
    queue: shuffle(questions).map((question) => question.id),
    questions: Object.fromEntries(questions.map((question) => [question.id, question])),
    score: 0,
    correct: 0,
    incorrect: 0,
    startedAt: now.toISOString(),
    finishedAt: null,
    completed: false,
    awaitingNext: false,
    answers: [],
  };
}

export function currentQuestion(state: SessionState): Question | null {
  if (state.completed) return null;
  const id = state.queue[0];
  return id ? state.questions[id] ?? null : null;
}

/** Number of questions still queued *after* the current one. */
export function remainingInQueue(state: SessionState): number {
  return Math.max(0, state.queue.length - 1);
}

export interface Submission {
  state: SessionState;
  result: AnswerResult;
  question: Question;
}

/**
 * Applies one answer. The score band is determined by the score before the
 * answer (inside `applyAnswer`), the score is clamped to 0…100, and the session
 * finishes exactly at 100.
 *
 * `state.awaitingNext` guards against a second submission for the same
 * question, so a double tap or double click can never score twice.
 */
export function submitAnswer(
  state: SessionState,
  choice: string,
  now = new Date(),
): Submission | null {
  const question = currentQuestion(state);
  if (!question || state.awaitingNext) return null;

  const correct = choice === question.answer;
  const result = applyAnswer(state.score, correct);

  return {
    question,
    result,
    state: {
      ...state,
      score: result.score,
      correct: state.correct + (correct ? 1 : 0),
      incorrect: state.incorrect + (correct ? 0 : 1),
      completed: result.score >= MAX_SCORE,
      finishedAt: result.score >= MAX_SCORE ? now.toISOString() : state.finishedAt,
      awaitingNext: true,
      answers: [
        ...state.answers,
        {
          questionId: question.id,
          choice,
          correct,
          previousScore: result.previousScore,
          scoreAfter: result.score,
          delta: result.delta,
          at: now.toISOString(),
        },
      ],
    },
  };
}

/**
 * Moves to the next question.
 *
 * `refill` holds newly generated variations. They are added to the session when
 * the queue runs low, which keeps generation off the critical path: the student
 * always has a next question ready without waiting.
 */
export function advance(
  state: SessionState,
  refill: Question[] = [],
): SessionState {
  if (state.completed) return state;

  const [, ...rest] = state.queue;
  let queue = rest;
  let questions = state.questions;

  if (queue.length < 3 && refill.length > 0) {
    // Only append variations this session has not used yet.
    const unused = refill.filter((question) => !state.questions[question.id]);
    if (unused.length > 0) {
      questions = addQuestions(state, unused);
      const lastId = queue[queue.length - 1];
      queue = [...queue, ...shuffle(unused).map((q) => q.id).filter((id) => id !== lastId)];
    }
  }

  return { ...state, queue, questions, awaitingNext: false };
}

/** Ends a session before 100 points (the score is kept as the final result). */
export function endSession(state: SessionState, now = new Date()): SessionState {
  return {
    ...state,
    awaitingNext: false,
    finishedAt: state.finishedAt ?? now.toISOString(),
  };
}

export function isFinished(state: SessionState | null): boolean {
  return Boolean(state?.finishedAt) || Boolean(state?.completed);
}

/**
 * Rebuilds a stored draft, regenerating any question the stored state lost
 * (older drafts kept a `pool` instead of `questions`).
 */
export function hydrateDraft(
  draft: SessionState,
  resolve: (id: string) => Question | null,
): SessionState {
  const questions: Record<string, Question> = { ...(draft.questions ?? {}) };
  for (const id of draft.queue) {
    if (!questions[id]) {
      const question = resolve(id);
      if (question) questions[id] = question;
    }
  }
  return { ...draft, questions };
}
