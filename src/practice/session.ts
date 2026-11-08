import { applyAnswer, MAX_SCORE, type AnswerResult } from './scoring';
import type { Question, SubtopicRef } from './types';

/**
 * The single practice engine.
 *
 * Homework and free practice both create a `SessionState` through
 * `startSession` and answer through `submitAnswer`. Nothing else in the app is
 * allowed to modify a score.
 *
 * Questions are drawn from the (shuffled) question bank of one subtopic. A
 * perfect run needs more than six answers to reach 100, so when the shuffled
 * queue runs out it is reshuffled — with the most recent question pushed to the
 * back — instead of ending the session early.
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
  score: number;
  correct: number;
  incorrect: number;
  startedAt: string;
  finishedAt: string | null;
  /** True after the score reaches 100. */
  completed: boolean;
  /** True when the last answer has been submitted but not advanced past. */
  awaitingNext: boolean;
  /** True when an answer made the session reach 100 and the attempt was saved. */
  recorded: boolean;
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

export function startSession(ref: SubtopicRef, pool: Question[], now = new Date()): SessionState {
  if (pool.length === 0) throw new Error('Cannot start a practice session without questions');

  return {
    id: makeId('session'),
    ref,
    queue: shuffle(pool).map((question) => question.id),
    score: 0,
    correct: 0,
    incorrect: 0,
    startedAt: now.toISOString(),
    finishedAt: null,
    completed: false,
    awaitingNext: false,
    recorded: false,
    answers: [],
  };
}

export function currentQuestion(state: SessionState, pool: Question[]): Question | null {
  if (state.completed) return null;
  return pool.find((question) => question.id === state.queue[0]) ?? null;
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
 */
export function submitAnswer(
  state: SessionState,
  pool: Question[],
  choice: string,
  now = new Date(),
): Submission | null {
  const question = currentQuestion(state, pool);
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
 * Moves to the next question. Called after the student has read the feedback.
 * The queue is refilled (reshuffled, last question last) when it runs low.
 */
export function advance(state: SessionState, pool: Question[]): SessionState {
  if (state.completed) return state;

  const [, ...rest] = state.queue;
  let queue = rest;

  if (queue.length < 3) {
    const answered = new Set(state.answers.slice(-pool.length).map((answer) => answer.questionId));
    const fresh = shuffle(pool.filter((question) => !answered.has(question.id))).map((q) => q.id);
    const refill = fresh.length > 0 ? fresh : shuffle(pool).map((question) => question.id);
    queue = [...queue, ...refill.filter((id) => id !== queue[queue.length - 1])];
  }

  if (queue.length === 0) queue = shuffle(pool).map((question) => question.id);

  return { ...state, queue, awaitingNext: false };
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
