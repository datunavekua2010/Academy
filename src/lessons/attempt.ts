import { evaluateAnswer } from './check';
import type { AnswerInput, Evaluation, Question, Stage } from './types';

/**
 * State machine for ONE question, independent of any UI.
 *
 *   answering ──correct──▶ correct
 *       │
 *       └─ wrong, attempts left ─▶ answering   (feedback shown, retry allowed)
 *       └─ wrong, attempts spent ─▶ exhausted  (explanation shown)
 *
 * Empty / unreadable input never costs an attempt.
 */

export interface AttemptState {
  status: 'answering' | 'correct' | 'exhausted';
  attempts: number;
  hintsShown: number;
  /** Correct on the very first submission, with no hint used. */
  firstTry: boolean;
  last?: Evaluation;
}

export const initialAttempt = (): AttemptState => ({ status: 'answering', attempts: 0, hintsShown: 0, firstTry: false });

export function maxAttemptsFor(question: Question, stage: Stage): number {
  if (question.maxAttempts) return question.maxAttempts;
  switch (stage) {
    case 'check':
      return 2;
    case 'challenge':
      return 3;
    default:
      return 3;
  }
}

export function submitAnswer(state: AttemptState, question: Question, stage: Stage, input: AnswerInput): AttemptState {
  if (state.status !== 'answering') return state;
  const last = evaluateAnswer(question, input);
  if (last.verdict === 'incomplete') return { ...state, last };
  const attempts = state.attempts + 1;
  if (last.verdict === 'correct') {
    return { ...state, status: 'correct', attempts, last, firstTry: attempts === 1 && state.hintsShown === 0 };
  }
  if (attempts >= maxAttemptsFor(question, stage)) return { ...state, status: 'exhausted', attempts, last };
  return { ...state, attempts, last };
}

export function showNextHint(state: AttemptState, question: Question): AttemptState {
  if (state.hintsShown >= question.hints.length) return state;
  return { ...state, hintsShown: state.hintsShown + 1 };
}

/** Clear the feedback so the student can try again (keeps attempts and hints). */
export function clearFeedback(state: AttemptState): AttemptState {
  return { ...state, last: undefined };
}

export const isFinished = (state: AttemptState): boolean => state.status !== 'answering';
