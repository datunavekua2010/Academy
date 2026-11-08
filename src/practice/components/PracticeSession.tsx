import { useEffect, useRef, useState } from 'react';
import { usePractice } from '../PracticeProvider';
import { getSubtopic, getTopic } from '../curriculum';
import { signed } from '../format';
import { MAX_SCORE } from '../scoring';
import type { Submission } from '../session';
import { ScoreMeter } from './ScoreMeter';

const LETTERS = ['ა', 'ბ', 'გ', 'დ', 'ე', 'ვ'];

/**
 * One question runner for every practice session. Assigned homework and free
 * practice both land here — there is no second activity component.
 */
export function PracticeSession({ onExit }: { onExit: () => void }) {
  const { session, answer, next, stop, activeAssignment } = usePractice();
  const [choice, setChoice] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Submission | null>(null);
  const [confirmStop, setConfirmStop] = useState(false);
  const feedbackRef = useRef<HTMLDivElement>(null);

  // Reset only when the question itself changes — NOT when it is answered,
  // otherwise the feedback card would disappear immediately.
  const currentId = session?.queue[0];
  useEffect(() => {
    setChoice(null);
    setFeedback(null);
    setConfirmStop(false);
  }, [session?.id, currentId]);

  if (!session) return null;

  // The session carries its own generated questions (id = templateId~seed),
  // so the screen never needs to reach back into a question bank.
  const question = currentId ? session.questions[currentId] : undefined;
  const topic = getTopic(session.ref.grade, session.ref.topicId);
  const subtopic = getSubtopic(session.ref.grade, session.ref.topicId, session.ref.subtopicId);

  if (!topic || !subtopic || !question) {
    return (
      <div className="practice-stage">
        <p className="demo-note">სესია ვერ ჩაიტვირთა. სცადე თავიდან.</p>
        <button type="button" className="btn btn-primary" onClick={onExit}>
          დაბრუნება
        </button>
      </div>
    );
  }

  // The engine owns the questions; the view only renders the current one.
  const answered = session.awaitingNext;
  const complete = session.completed || session.score >= MAX_SCORE;
  const attemptMode = activeAssignment ? 'საშინაო დავალება' : 'ვარჯიში';

  const choose = (option: string) => {
    if (answered) return;
    const submission = answer(option);
    if (!submission) return;
    setChoice(option);
    setFeedback(submission);
    window.requestAnimationFrame(() =>
      feedbackRef.current?.focus({ preventScroll: false }),
    );
  };

  return (
    <div className="practice-stage">
      <div className="session-top">
        <button type="button" className="back-link as-button" onClick={onExit}>
          <span aria-hidden="true">←</span> სესიიდან გასვლა
        </button>
        <span className={`session-mode ${activeAssignment ? 'is-homework' : ''}`}>
          {activeAssignment ? '📌 ' : '✦ '}
          {attemptMode}
        </span>
      </div>

      <div className="session-head">
        <div>
          <span className="session-path">
            {topic.emoji} {topic.title} <span aria-hidden="true">/</span> {subtopic.title}
          </span>
          <h1 className="session-title">
            {activeAssignment ? 'საშინაო დავალება' : subtopic.title}
          </h1>
          <p className="session-meta">
            {session.correct + session.incorrect}{' '}
            {session.correct + session.incorrect === 1 ? 'პასუხი' : 'პასუხი'} · სწორი{' '}
            <strong>{session.correct}</strong> · არასწორი <strong>{session.incorrect}</strong>
          </p>
        </div>
        <ScoreMeter score={session.score} label="სესიის ქულა" />
      </div>

      {complete ? (
        <div className="session-complete" role="status">
          <div className="complete-badge" aria-hidden="true">
            🎉
          </div>
          <h2>{MAX_SCORE} ქულა! სესია დასრულებულია.</h2>
          <p>
            {session.correct} სწორი და {session.incorrect} არასწორი პასუხი. შედეგი შენს
            პროგრესში შენახულია.
          </p>
          <div className="page-actions">
            <button type="button" className="btn btn-primary" onClick={onExit}>
              გაგრძელება
            </button>
          </div>
        </div>
      ) : (
        <div className="question-card">
          <div className="question-count">
            კითხვა #{session.correct + session.incorrect + 1}
            <span className="question-bank-hint">ავტომატურად გენერირებული</span>
          </div>
          <p className="question-prompt">{question.prompt}</p>

          <div className="answer-list" role="group" aria-label="პასუხის ვარიანტები">
            {question.options.map((option, index) => {
              const isCorrect = option === question.answer;
              const isChosen = option === choice;
              const state = !answered
                ? ''
                : isCorrect
                  ? 'is-correct'
                  : isChosen
                    ? 'is-wrong'
                    : 'is-dim';
              return (
                <button
                  key={option}
                  type="button"
                  className={`answer-option ${state}`}
                  onClick={() => choose(option)}
                  disabled={answered}
                  aria-pressed={isChosen}
                >
                  <span className="answer-letter" aria-hidden="true">
                    {LETTERS[index] ?? index + 1}
                  </span>
                  <span className="answer-text">{option}</span>
                  {answered && isCorrect && <span className="answer-badge">სწორი</span>}
                  {answered && isChosen && !isCorrect && (
                    <span className="answer-badge is-wrong">შენი პასუხი</span>
                  )}
                </button>
              );
            })}
          </div>

          <div aria-live="polite" ref={feedbackRef} tabIndex={-1} className="feedback-region">
            {answered && feedback && (
              <div className={`answer-feedback ${feedback.result.correct ? 'is-correct' : 'is-wrong'}`}>
                <div className="feedback-top">
                  <strong>
                    {feedback.result.correct ? 'სწორია!' : 'არასწორია.'}{' '}
                    <span className="delta">{signed(feedback.result.delta)} ქულა</span>
                  </strong>
                  <span className="feedback-score">
                    {feedback.result.previousScore} → {feedback.result.score}
                  </span>
                </div>
                <p>{question.explanation}</p>
              </div>
            )}
          </div>

          {answered && !complete && (
            <div className="session-actions">
              <button type="button" className="btn btn-primary" onClick={next}>
                შემდეგი კითხვა <span aria-hidden="true">→</span>
              </button>
            </div>
          )}

          <div className="session-footer-actions">
            {!answered && (
              <span className="score-hint">
                შესაძლო ქულა: <strong>{potential(session.score)}</strong>
              </span>
            )}
            {!confirmStop ? (
              <button type="button" className="text-button" onClick={() => setConfirmStop(true)}>
                სესიის დასრულება
              </button>
            ) : (
              <span className="stop-confirm">
                დარწმუნებული ხარ? ქულა {session.score} დარჩება.
                <button type="button" className="text-button is-danger" onClick={stop}>
                  კი, დასრულდეს
                </button>
                <button type="button" className="text-button" onClick={() => setConfirmStop(false)}>
                  გაუქმება
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/** How many correct answers remain until 100, using the current band. */
function potential(score: number): string {
  if (score >= 90) return `${MAX_SCORE - score} სწორი პასუხი`;
  if (score >= 80) return `${Math.ceil((MAX_SCORE - score) / 2)} სწორი პასუხი`;
  return `${Math.ceil((MAX_SCORE - score) / 4)} სწორი პასუხი`;
}
