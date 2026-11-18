import { useId, type KeyboardEvent } from 'react';
import { parseNumber } from '../algebra';
import { RichText } from '../RichText';
import { NumberLine } from './NumberLine';
import { ObjectField } from './Objects';
import { OrderBoard } from './OrderBoard';
import { SplitBoard } from './SplitBoard';
import { VisualBare } from './Visuals';
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
  /** How many hints the student has opened (some responses show extra help after a hint). */
  hintsShown?: number;
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
    <div className={`lp-choices ${options.some((o) => o.visual) ? 'has-pics' : ''}`} role="radiogroup" aria-label="პასუხის ვარიანტები">
      {options.map((option) => {
        const selected = value === option.id;
        const mark = selected && verdict === 'correct' ? 'correct' : selected && verdict === 'incorrect' ? 'wrong' : '';
        return (
          <label key={option.id} className={`lp-choice ${selected ? 'is-selected' : ''} ${mark ? `is-${mark}` : ''} ${disabled ? 'is-locked' : ''}`}>
            <input type="radio" name={group} value={option.id} checked={selected} disabled={disabled} onChange={() => onChange(option.id)} />
            <span className="lp-choice-dot" aria-hidden="true" />
            {option.visual && (
              <span className="lp-choice-pic">
                <VisualBare spec={option.visual} compact />
              </span>
            )}
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

export function ResponseInput({ response, value, onChange, onSubmit, disabled, verdict, label, hintsShown = 0 }: Props) {
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
    case 'line': {
      const picked = parseNumber(typeof value === 'string' ? value : '');
      const shown = picked ?? response.start ?? null;
      return (
        <div className="lp-line">
          <NumberLine
            min={response.min}
            max={response.max}
            value={shown}
            start={response.start ?? null}
            labelled={response.labelled}
            arrows={response.arrows !== false}
            showValue={response.showValue}
            disabled={disabled}
            onChange={(n) => onChange(String(n))}
            ariaLabel={`${label}. რიცხვითი ღერძი ${response.min}-დან ${response.max}-მდე`}
          />
        </div>
      );
    }
    case 'collect': {
      const picked = new Set(typeof value === 'string' && value ? value.split(',').filter(Boolean).map(Number) : []);
      const toggle = (i: number) => {
        const next = new Set(picked);
        if (next.has(i)) next.delete(i);
        else next.add(i);
        onChange([...next].sort((a, b) => a - b).join(','));
      };
      return (
        <div className="lp-collect">
          <ObjectField count={response.total} glyph={response.glyph} layout={response.layout} seed={response.seed} picked={picked} onTap={disabled ? undefined : toggle} label={label} />
          <output className="objs-count" aria-live="polite">
            არჩეულია: <strong>{picked.size}</strong>
          </output>
        </div>
      );
    }
    case 'order': {
      const parsed = typeof value === 'string' && value ? value.split(',').map(Number) : response.items;
      const order = parsed.length === response.items.length ? parsed : response.items;
      return (
        <OrderBoard
          base={response.items}
          order={order}
          onChange={(next) => onChange(next.join(','))}
          disabled={disabled}
          line={response.lineAfterHint && hintsShown > 0 ? { min: response.min ?? 0, max: response.max ?? 20 } : null}
          ariaLabel={label}
        />
      );
    }
    case 'split': {
      const left = typeof value === 'string' && value !== '' ? Number(value) : response.total;
      return <SplitBoard total={response.total} left={Number.isFinite(left) ? left : response.total} onChange={(n) => onChange(String(n))} disabled={disabled} frame={response.frame} ariaLabel={label} />;
    }
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
