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
 * Is this picture a character-drawn clock face?
 *
 * The dial is drawn on a grid of spaces and `·`/`●`/`┼`, so it needs a
 * monospace font and its whitespace preserved — the general `.question-visual`
 * is proportional and `pre-line`, which is right for a row of objects and
 * destroys a dial. The centre mark is the tell: nothing else in the app draws
 * one.
 */
const isDial = (visual: string): boolean => visual.includes('┼');

/**
 * Is this picture a row of coins drawn as character tokens?
 *
 * Same reason as the dial, and the same failure if it is missed: a coin is a
 * rounded box containing its denomination, so it needs a fixed-width font and
 * its padding kept. The tell is the token corner, which nothing else draws.
 */
const isCoins = (visual: string): boolean => visual.includes('╭');

/**
 * The picture in words, for a student who cannot see it.
 *
 * The visual is `aria-hidden` because a clock dial or a purse of box-drawing
 * characters read aloud is noise — a screen reader announces „box drawing light
 * down and right, horizontal, …“ for every token. But hiding it also hides the
 * question: „რამდენი თეთრია ყულაბაში“ with no prompt figure is unanswerable.
 *
 * So the picture gets a sentence instead. Only the two drawn shapes need it —
 * a coin purse becomes „5, 5 და 10 თეთრი მონეტები“, an amount tag becomes its
 * amount — and a visual that is already words (a row of emoji does not occur in
 * U14) falls back to the text itself.
 */
function visualText(visual: string): string {
  if (!visual.includes('╭') && !visual.includes('◆')) return visual;
  // Every token's middle row, in the order they appear, labelled per purse.
  const lines = visual.split('\n');
  const parts: string[] = [];
  let current: number[] = [];
  let label: string | null = null;
  const flush = () => {
    if (current.length === 0) return;
    const coins = current.map((coin) => `${coin}`);
    parts.push(`${label ? `${label}: ` : ''}${coins.join(', ')} თეთრი მონეტა`);
    current = [];
    label = null;
  };
  for (const line of lines) {
    const tagged = line.match(/^◆\s*(\d+)\s*თეთრი/);
    if (tagged) {
      flush();
      parts.push(`${tagged[1]} თეთრი`);
      continue;
    }
    const labelled = line.match(/^(#?\d*)\s*$/);
    if (labelled && line.trim() !== '') {
      // A purse or an item label standing on its own line: „ანა“, „①“, „#2“.
      flush();
      label = line.trim();
      continue;
    }
    for (const match of line.matchAll(/│\s*(\d+)\s*│/g)) current.push(Number(match[1]));
  }
  flush();
  return parts.join('; ');
}

/** Every per-picture class a visual needs, so the stylesheet rule is one place. */
const visualClass = (visual: string): string => {
  const classes = ['question-visual'];
  if (isDial(visual)) classes.push('question-visual-dial');
  if (isCoins(visual)) classes.push('question-visual-coins');
  return classes.join(' ');
};

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
  const multiMode = question?.answerMode === 'multi';

  /**
   * Multi-select: the student toggles options, then checks the set.
   *
   * The marked set is not an answer on its own — a set of one is indistinguishable
   * from a single choice, and a question with two right answers would be marked
   * wrong the moment the first was tapped. So the taps accumulate and only the
   * button submits, in display order, which is the order `question.answer` is
   * written in.
   */
  const toggleMulti = (option: string) => {
    if (answered) return;
    setChoice((current) => {
      const marked = current === null ? [] : current.split('\n');
      return (marked.includes(option)
        ? marked.filter((entry) => entry !== option)
        : [...marked, option]
      ).join('\n');
    });
  };

  /** The marked set in the order the options are printed, joined as the key is. */
  const markedAnswer = (): string => {
    const marked = choice === null ? [] : choice.split('\n');
    return (question?.options ?? []).filter((option) => marked.includes(option)).join(', ');
  };

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
            /* Two kinds of picture share this slot: rows of objects, where the
               width of a character does not matter, and the U13 clock face,
               where it is the *whole* picture — the numerals are placed on a
               character grid and a proportional font would smear them off the
               radii, while `pre-line` collapses the runs of spaces they are
               drawn with. The dial gets a class that pins both. */
            <>
              <p className={visualClass(question.visual)} aria-hidden="true">
                {question.visual}
              </p>
              {/* The drawn picture is hidden from assistive technology because
                  box-drawing and emoji stacks read aloud as noise — but the
                  question lives in the picture, so its meaning is given as a
                  sentence instead. It is visually hidden, not `display: none`,
                  so screen readers still find it. */}
              <p className="visually-hidden">{visualText(question.visual)}</p>
            </>
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
          ) : multiMode ? (
          /**
           * „Mark every one that fits.“ Tapping toggles; nothing is marked until
           * the set is checked, because marking as you go would score a
           * half-built set as a wrong single answer.
           *
           * After checking, the *correct* options are highlighted and the marked
           * ones are badged, so a student who missed one can see which — the
           * whole point of the exercise is the set, not the tap.
           */
          <div className="answer-multi">
            <p className="answer-multi-hint">
              აირჩიე ყველა, რაც ერგება, და შემდეგ შეამოწმე.
            </p>
            <div className="answer-list" role="group" aria-label="პასუხის ვარიანტები">
              {question.options.map((option, index) => {
                const isCorrect = question.answer.split(',').map((part) => part.trim()).includes(option);
                const isMarked = choice !== null && choice.split('\n').includes(option);
                const state = !answered
                  ? isMarked
                    ? 'is-picked'
                    : ''
                  : isCorrect
                    ? 'is-correct'
                    : isMarked
                      ? 'is-wrong'
                      : 'is-dim';
                return (
                  <button
                    key={option}
                    type="button"
                    className={`answer-option ${state}`}
                    onClick={() => toggleMulti(option)}
                    disabled={answered}
                    aria-pressed={isMarked}
                  >
                    <span className="answer-letter answer-letter-check" aria-hidden="true">
                      {isMarked ? '✓' : LETTERS[index] ?? index + 1}
                    </span>
                    <span className="answer-text">{option}</span>
                    {answered && isCorrect && <span className="answer-badge">სწორი</span>}
                    {answered && isMarked && !isCorrect && (
                      <span className="answer-badge is-wrong">შენი პასუხი</span>
                    )}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              className="btn btn-primary"
              disabled={answered || markedAnswer() === ''}
              onClick={() => submit(markedAnswer())}
            >
              შემოწმება
            </button>
            {answered && (
              <p className={`answer-entry-result ${feedback?.result.correct ? 'is-correct' : 'is-wrong'}`}>
                სწორია: <strong>{question.answer}</strong>
              </p>
            )}
          </div>
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
