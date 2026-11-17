import { useId, type KeyboardEvent } from 'react';
import { RichText } from '../RichText';
import type { AnswerInput, ChoiceOption, ResponseSpec, Verdict } from '../types';

/**
 * Renders the answer control for a response spec. Presentation only: it never
 * decides whether an answer is right (see `check.ts`).
 */

interface Props {
  response: ResponseSpec;
  value: AnswerInput;
  onChange: (value: AnswerInput) => void;
  onSubmit: () => void;
  /** Locks the control once the question is finished. */
  disabled: boolean;
  /** Verdict of the last submission, used to mark the chosen option. */
  verdict?: Verdict;
  /** Accessible label for text inputs. */
  label: string;
}

function CheckIcon() {
  return (
    <svg className="lp-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}
function CrossIcon() {
  return (
    <svg className="lp-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
    </svg>
  );
}

function Choices({ options, value, onChange, disabled, verdict }: { options: ChoiceOption[]; value: string; onChange: (v: string) => void; disabled: boolean; verdict?: Verdict }) {
  const group = useId();
  return (
    <div className="lp-choices" role="radiogroup" aria-label="პასუხის ვარიანტები">
      {options.map((option) => {
        const selected = value === option.id;
        const mark = selected && verdict === 'correct' ? 'correct' : selected && verdict === 'incorrect' ? 'wrong' : '';
        return (
          <label key={option.id} className={`lp-choice ${selected ? 'is-selected' : ''} ${mark ? `is-${mark}` : ''} ${disabled ? 'is-locked' : ''}`}>
            <input type="radio" name={group} value={option.id} checked={selected} disabled={disabled} onChange={() => onChange(option.id)} />
            <span className="lp-choice-dot" aria-hidden="true" />
            <RichText text={option.text} className="lp-choice-text" />
            {mark === 'correct' && (
              <span className="lp-choice-tag">
                <CheckIcon /> სწორია
              </span>
            )}
            {mark === 'wrong' && (
              <span className="lp-choice-tag">
                <CrossIcon /> არასწორია
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}

export function ResponseInput({ response, value, onChange, onSubmit, disabled, verdict, label }: Props) {
  const onEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };

  switch (response.type) {
    case 'choice':
      return <Choices options={response.options} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} verdict={verdict} />;
    case 'numeric':
    case 'expression':
      return (
        <div className="lp-field">
          <input
            className="lp-input"
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label={label}
            placeholder={response.type === 'expression' ? (response.placeholder ?? 'ჩაწერე პასუხი') : 'ჩაწერე რიცხვი'}
            value={typeof value === 'string' ? value : ''}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onEnter}
          />
          {response.type === 'numeric' && response.unit && <span className="lp-unit">{response.unit}</span>}
        </div>
      );
    case 'blanks': {
      const values = Array.isArray(value) ? value : [];
      return (
        <div className="lp-blanks" aria-label={label}>
          {response.template.split(/(\{\d+\})/).map((part, i) => {
            const m = /^\{(\d+)\}$/.exec(part);
            if (!m) return part ? <RichText key={i} text={part} /> : null;
            const index = Number(m[1]) - 1;
            return (
              <input
                key={i}
                className="lp-input lp-blank"
                type="text"
                inputMode="text"
                autoComplete="off"
                aria-label={`ცარიელი ადგილი ${index + 1}`}
                value={values[index] ?? ''}
                disabled={disabled}
                onChange={(e) => {
                  const next = [...values];
                  while (next.length < response.answers.length) next.push('');
                  next[index] = e.target.value;
                  onChange(next);
                }}
                onKeyDown={onEnter}
              />
            );
          })}
        </div>
      );
    }
  }
}
