import { useEffect, useRef, useState } from 'react';
import { usePractice } from '../PracticeProvider';
import { getSubtopic, getTopic } from '../curriculum';
import { signed } from '../format';
import { MAX_SCORE } from '../scoring';
import type { Submission } from '../session';
import { bandForLevel, levelForScore, usesLevelBands } from '../levels';
import { ScoreMeter } from './ScoreMeter';

const LETTERS = ['ა', 'ბ', 'გ', 'დ', 'ე', 'ვ'];

/**
 * One question runner for every practice session. Assigned homework and free
 * practice both land here — there is no second activity component.
 */
export function PracticeSession({ onExit }: { onExit: () => void }) {
  const { session, answer, next, stop, activeAssignment } = usePractice();
  const [choice, setChoice] = useState<string | null>(null);
  const [typed, setTyped] = useState('');
  /** Positions (1-based) the student has tapped so far, in order. */
  const [sequence, setSequence] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<Submission | null>(null);
  const [confirmStop, setConfirmStop] = useState(false);
  const feedbackRef = useRef<HTMLDivElement>(null);

  // Reset only when the question itself changes — NOT when it is answered,
  // otherwise the feedback card would disappear immediately.
  const currentId = session?.queue[0];
  useEffect(() => {
    setChoice(null);
    setTyped('');
    setSequence([]);
    setFeedback(null);
    setConfirmStop(false);
  }, [session?.id, currentId]);

  if (!session) return null;

  // The session carries its own generated questions (id = templateId~seed),
  // so the screen never needs to reach back into a question bank.
  const question = currentId ? session.questions[currentId] : undefined;
  const topic = getTopic(session.ref.grade, session.ref.topicId);
  const subtopic = getSubtopic(session.ref.grade, session.ref.topicId, session.ref.subtopicId);

  // Decided before the guard, because an ended session legitimately has no
  // current question left to render.
  const finished = session.completed || session.score >= MAX_SCORE;
  // The material running out is an ending, not a failed load — the branch below
  // renders it. Only a genuinely missing topic/subtopic/question is an error.
  if (!topic || !subtopic || (!question && !finished && !session.exhausted)) {
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
  const complete = finished;
  // The subtopic ran out of questions before the score was complete.
  const exhausted = !complete && Boolean(session.exhausted);
  // The level the *current* score has earned. It moves down as well as up, so a
  // student who slips back gets the easier questions again rather than being
  // stuck with material they have just failed.
  const level = usesLevelBands(session.ref.grade) ? levelForScore(session.score) : 1;
  const attemptMode = activeAssignment ? 'საშინაო დავალება' : 'ვარჯიში';

  const submit = (value: string) => {
    if (answered || value.trim() === '') return;
    const submission = answer(value);
    if (!submission) return;
    setChoice(value);
    setFeedback(submission);
    window.requestAnimationFrame(() =>
      feedbackRef.current?.focus({ preventScroll: false }),
    );
  };

  const choose = (option: string) => submit(option);
  const entryMode = question?.answerMode === 'number';
  const timeMode = question?.answerMode === 'time';
  const orderMode = question?.answerMode === 'order';

  /** Tapping an item appends it to the sequence; tapping it again removes it. */
  const tapOrder = (position: number) => {
    if (answered) return;
    setSequence((current) =>
      current.includes(position)
        ? current.filter((entry) => entry !== position)
        : [...current, position],
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
            {usesLevelBands(session.ref.grade) && (
              <>
                {' '}
                · დონე <strong>{level}</strong> — {bandForLevel(level).label}
              </>
            )}
          </p>
        </div>
        <ScoreMeter score={session.score} label="სესიის ქულა" />
      </div>

      {exhausted ? (
        <div className="session-complete" role="status">
          <div className="complete-badge" aria-hidden="true">
            ✅
          </div>
          <h2>ამ თემის კითხვები ამოიწურა.</h2>
          <p>
            ქულა: <strong>{session.score}</strong> / {MAX_SCORE} · {session.correct} სწორი და{' '}
            {session.incorrect} არასწორი პასუხი. ეს თემა ჯერ ამ რაოდენობის კითხვას გვაძლევს,
            ამიტომ სესია აქ სრულდება — შედეგი პროგრესში შენახულია.
          </p>
          <div className="page-actions">
            <button type="button" className="btn btn-primary" onClick={onExit}>
              გაგრძელება
            </button>
          </div>
        </div>
      ) : complete ? (
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
      ) : question ? (
        <div className="question-card">
          <div className="question-count">
            კითხვა #{session.correct + session.incorrect + 1}
            <span className="question-bank-hint">ავტომატურად გენერირებული</span>
          </div>
          {question.visual && (
            <p className="question-visual" aria-hidden="true">
              {question.visual}
            </p>
          )}
          <p className="question-prompt">{question.prompt}</p>

          {orderMode ? (
            <div className="answer-order">
              <p className="answer-order-hint">
                შეეხე საგნებს იმ თანმიმდევრობით, როგორც უნდა იდგეს.
              </p>
              <ol className="answer-order-list" aria-label="არჩეული თანმიმდევრობა">
                {(question.orderItems ?? []).map((item, index) => {
                  const position = index + 1;
                  const place = sequence.indexOf(position);
                  return (
                    <li key={`${item}-${position}`}>
                      <button
                        type="button"
                        className={`answer-order-item ${place >= 0 ? 'is-picked' : ''}`}
                        onClick={() => tapOrder(position)}
                        disabled={answered}
                        aria-pressed={place >= 0}
                      >
                        <span className="answer-order-badge" aria-hidden="true">
                          {place >= 0 ? place + 1 : position}
                        </span>
                        <span className="answer-order-text">{item}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
              <button
                type="button"
                className="btn btn-primary"
                disabled={answered || sequence.length !== (question.orderItems ?? []).length}
                onClick={() => submit(sequence.join(','))}
              >
                შემოწმება
              </button>
              {answered && (
                <p className={`answer-entry-result ${feedback?.result.correct ? 'is-correct' : 'is-wrong'}`}>
                  სწორი თანმიმდევრობაა: <strong>{question.answer.split(',').join(' → ')}</strong>
                </p>
              )}
            </div>
          ) : entryMode || timeMode ? (
            <form
              className="answer-entry"
              onSubmit={(event) => {
                event.preventDefault();
                submit(typed);
              }}
            >
              <label className="answer-entry-label" htmlFor="answer-entry-input">
                {timeMode ? 'ჩაწერე დრო' : 'ჩაწერე პასუხი'}
              </label>
              <div className="answer-entry-row">
                <input
                  id="answer-entry-input"
                  className="answer-entry-input"
                  // inputMode brings up the number pad on a phone; `type=text`
                  // keeps it usable with a physical keyboard and screen reader.
                  //
                  // A clock time needs the colon, so the keypad would be a trap:
                  // `numeric` hides it on most phones and the child could not
                  // type the answer at all. Times get the full keyboard and a
                  // hint that says which shape to write.
                  inputMode={timeMode ? 'text' : 'numeric'}
                  pattern={timeMode ? '[0-9]{1,2}:[0-9]{2}' : '[0-9]*'}
                  placeholder={timeMode ? 'სთ:წთ' : undefined}
                  autoComplete="off"
                  value={typed}
                  onChange={(event) => setTyped(event.target.value)}
                  disabled={answered}
                  aria-describedby="answer-entry-hint"
                />
                <button type="submit" className="btn btn-primary" disabled={answered || typed.trim() === ''}>
                  შემოწმება
                </button>
              </div>
              <p id="answer-entry-hint" className="answer-entry-hint">
                {answered ? '' : timeMode ? 'ჩაწერე დრო ასე: 07:30.' : 'შეიყვანე რიცხვი კლავიატურით.'}
              </p>
              {answered && (
                <p className={`answer-entry-result ${feedback?.result.correct ? 'is-correct' : 'is-wrong'}`}>
                  სწორი პასუხია: <strong>{question.answer}</strong>
                </p>
              )}
            </form>
          ) : (
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
          )}

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
      ) : null}
    </div>
  );
}

/** How many correct answers remain until 100, using the current band. */
function potential(score: number): string {
  if (score >= 90) return `${MAX_SCORE - score} სწორი პასუხი`;
  if (score >= 80) return `${Math.ceil((MAX_SCORE - score) / 2)} სწორი პასუხი`;
  return `${Math.ceil((MAX_SCORE - score) / 4)} სწორი პასუხი`;
}
