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

/**
 * Compares a student's answer with the answer key.
 *
 * Multiple-choice answers compare exactly. A typed number must compare by
 * VALUE, not by spelling: "07", " 7 " and "7" are the same answer, and a child
 * marked wrong for a leading space would be learning about keyboards rather
 * than about arithmetic. Georgian digits are not accepted — the pad and the
 * keyboard both produce Latin digits, and silently accepting invented ones
 * would make the key ambiguous.
 */
function answersMatch(question: Question, choice: string): boolean {
  // An ordering answer is a sequence of display positions. Compare the numbers
  // in it rather than the spelling, so "2,1,3" and "2, 1, 3" are the same
  // answer and a stray space cannot mark a correct arrangement wrong.
  if (question.answerMode === 'order') {
    const typed = choice
      .split(',')
      .map((part) => Number(part.trim()))
      .filter((value) => Number.isFinite(value));
    const expected = question.answer
      .split(',')
      .map((part) => Number(part.trim()))
      .filter((value) => Number.isFinite(value));
    return typed.length === expected.length && typed.every((value, i) => value === expected[i]);
  }

  if (question.answerMode !== 'number') return choice === question.answer;

  const typed = Number(choice.trim().replace(',', '.'));
  const expected = Number(question.answer);
  return Number.isFinite(typed) && Number.isFinite(expected) && typed === expected;
}

export interface SessionAnswer {
  questionId: string;
  /**
   * The prompt and picture as they were shown.
   *
   * Recorded because a question drops out of `questions` once the session has
   * moved past it, and a refill has to know what has already been asked to
   * avoid asking it again. An id alone cannot do that job: a regenerated
   * question carries a new id, so the old one matches nothing.
   */
  prompt?: string;
  visual?: string;
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
  /**
   * True when the subtopic's material has run out before 100.
   *
   * This is an ending, not an error: a subtopic with a finite set of questions
   * (nineteen numbers, four shapes) simply cannot supply a 35-question session.
   * The score reached is the result. Distinguishing this from a broken load is
   * what stops the student being told "სცადე თავიდან" after a perfect run.
   */
  exhausted?: boolean;
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
  // Never overwrite. An id is `templateId~seed`, so a draw that repeats a seed
  // produces the same id — writing it over an existing question silently
  // replaced something the student had not yet been asked, and the prompt it
  // carried could then appear twice in one session.
  for (const question of questions) {
    if (!next[question.id]) next[question.id] = question;
  }
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

  const correct = answersMatch(question, choice);
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
          prompt: question.prompt,
          visual: question.visual,
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
  if (state.completed || state.exhausted) return state;

  const [, ...rest] = state.queue;
  let queue = rest;
  let questions = state.questions;

  // An id encodes the drawn question, so answering it means it must never be
  // asked again. Remembering the ids we have stepped past lets the check below
  // catch a repeat whatever route it took into the queue.
  const answeredIds = new Set(state.answers.map((answer) => answer.questionId));
  const keyOf = (id: string): string => {
    const question = questions[id];
    return question ? `${question.prompt}|${question.visual ?? ''}` : id;
  };
  const keep = new Set<string>();
  queue = queue.filter((id) => {
    if (answeredIds.has(id)) return false;
    const key = keyOf(id);
    if (keep.has(key)) return false;
    keep.add(key);
    return true;
  });

  // Runs whenever the queue is short, not only when the refill is non-empty:
  // the de-duplication below also repairs a queue that already carries the same
  // question twice, and skipping it left the student on a question they had
  // just answered.
  if (queue.length < 3) {
    // Only append variations this session has not used yet. The prompt check is
    // the important one: a regenerated question gets a fresh id, so filtering by
    // id alone would let the same wording back into the queue.
    // Keyed on the prompt *and* the picture: a positional question shows a row
    // and asks one of several things about it, so the same sentence over a
    // different row is a different question, and the same row asked about a
    // different position is one too.
    //
    // Answered questions are included. `state.questions` only keeps what is
    // still ahead, so filtering on it alone let a question the student had
    // just finished be queued again.
    const shown = new Set(
      Object.values(state.questions).map(
        (question) => `${question.prompt}|${question.visual ?? ''}`,
      ),
    );
    for (const answer of state.answers) {
      if (answer.prompt) shown.add(`${answer.prompt}|${answer.visual ?? ''}`);
    }
    // A prompt already waiting in the queue counts as shown, even when it
    // arrived under a different id. `startSession` and a refill can both hand
    // over the same wording, and the queue would then ask it twice.
    for (const id of queue) {
      const waiting = state.questions[id];
      if (waiting) shown.add(`${waiting.prompt}|${waiting.visual ?? ''}`);
    }
    // `state.questions[id]` is checked even when that id has already been
    // answered: an id encodes the drawn question, so a refill offering the same
    // id is offering the same question again. `addQuestions` deliberately will
    // not overwrite it, so queueing it would point the student at nothing.
    const unused = refill.filter(
      (question) =>
        !state.questions[question.id] &&
        !answeredIds.has(question.id) &&
        !shown.has(`${question.prompt}|${question.visual ?? ''}`),
    );
    if (unused.length > 0) {
      questions = addQuestions(state, unused);
      const lastId = queue[queue.length - 1];
      // `addQuestions` may have declined an id collision, so only queue the
      // questions that are actually in the session now.
      queue = [
        ...queue,
        ...shuffle(unused)
          .filter((q) => questions[q.id] === q)
          .map((q) => q.id)
          .filter((id) => id !== lastId),
      ];
    }
  }

  // Nothing left to ask and the score is short of 100: the subtopic has run
  // out of material. Ending here is the honest outcome — the alternative is a
  // queue that empties under a student who was doing everything right.
  //
  // Recomputed, never inherited: an earlier refill can legitimately come back
  // empty when the queue is briefly too long, and carrying that flag forward
  // marked the session finished while questions were still waiting.
  const exhausted = !state.completed && queue.length === 0 && state.score < MAX_SCORE;

  return { ...state, queue, questions, awaitingNext: false, exhausted };
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
  return Boolean(state?.finishedAt) || Boolean(state?.completed) || Boolean(state?.exhausted);
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
