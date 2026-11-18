import { RichText } from '../RichText';
import type { AttemptState } from '../attempt';
import { describeAnswer } from '../check';
import type { Question } from '../types';

/** Feedback beside the question: always an icon plus words, never colour alone. */

function Icon({ kind }: { kind: 'ok' | 'no' | 'info' }) {
  return (
    <svg className="lp-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {kind === 'ok' && <path d="M5 12.5l4.5 4.5L19 7.5" />}
      {kind === 'no' && <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />}
      {kind === 'info' && (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 11v5M12 8h.01" />
        </>
      )}
    </svg>
  );
}

export function Feedback({ question, state }: { question: Question; state: AttemptState }) {
  const { status, last } = state;
  let kind: 'ok' | 'no' | 'info' | null = null;
  let heading = '';
  let body: string | undefined;
  let revealed: string | undefined;

  if (status === 'correct') {
    kind = 'ok';
    heading = 'სწორია';
    body = question.explanation;
  } else if (status === 'exhausted') {
    kind = 'info';
    heading = 'ვნახოთ ერთად';
    body = question.explanation;
    if (question.revealOnExhaust !== false) {
      const raw = describeAnswer(question.response);
      revealed = ['numeric', 'expression', 'blanks', 'line'].includes(question.response.type) ? `$${raw}$` : raw;
    }
  } else if (last?.verdict === 'incorrect') {
    kind = 'no';
    heading = last.notSimplified ? 'თითქმის' : 'ჯერ არ არის სწორი';
    body = last.feedback;
  } else if (last?.verdict === 'incomplete') {
    kind = 'info';
    heading = 'შეავსე პასუხი';
    body = last.feedback;
  }

  return (
    <div className="lp-feedback-slot" role="status" aria-live="polite">
      {kind && (
        <div className={`lp-feedback is-${kind}`}>
          <div className="lp-feedback-head">
            <Icon kind={kind} /> {heading}
          </div>
          {body && <RichText text={body} className="lp-feedback-body" />}
          {revealed && (
            <p className="lp-feedback-answer">
              სწორი პასუხი: <strong><RichText text={revealed} /></strong>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
