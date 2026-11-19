import { useId } from 'react';
import type { PuzzleSentence, PuzzleStep } from '../types';
import { sentenceText, solve, symbolsOf } from './PuzzleGeometry';
import { ChainBoard, SentenceBoard, SentenceTerm, SymbolLegend } from './PuzzleBoard';

/**
 * Answer controls for G2 U11.
 *
 * Every control only collects what the student typed; whether it is right is decided in `check.ts` by solving the same
 * sentence the control draws. The "check" line the student sees is the sentence with their own numbers in it, so the
 * verification step of the lesson is the control's own work rather than a message.
 */

/** One blank of a sentence: a number box, with the symbol it is filling named on it. */
export function SentenceFillAnswer({
  sentence,
  blanks,
  value,
  onChange,
  disabled,
  label,
}: {
  sentence: PuzzleSentence;
  blanks: Array<'a' | 'b' | 'c'>;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  label: string;
}) {
  const id = useId();
  const typed = value === '' ? [] : value.split(',');
  const put = (i: number, text: string) => {
    const next = [...typed];
    while (next.length < blanks.length) next.push('');
    next[i] = text.replace(/[^\d-]/g, '');
    onChange(next.join(','));
  };
  const show: Record<string, number> = {};
  blanks.forEach((place, i) => {
    const term = sentence[place];
    if (typeof term === 'number') return;
    const n = Number(typed[i]);
    if (typed[i] !== undefined && typed[i] !== '' && Number.isFinite(n)) show[term.sym] = n;
  });
  return (
    <div className="pzf" role="group" aria-label={label}>
      <div className="pz-line">
        <SentenceTerm term={sentence.a} />
        <span className="pz-op">{sentence.op}</span>
        <SentenceTerm term={sentence.b} />
        <span className="pz-eq">=</span>
        <SentenceTerm term={sentence.c} />
      </div>
      <div className="pzf-row">
        {blanks.map((place, i) => {
          const term = sentence[place];
          const sym = typeof term === 'number' ? String(term) : term.sym;
          return (
            <label className="pzf-slot" key={`${place}-${i}`} htmlFor={`${id}-${i}`}>
              <span className="pzf-sym">{sym}</span>
              <input
                id={`${id}-${i}`}
                inputMode="numeric"
                value={typed[i] ?? ''}
                disabled={disabled}
                onChange={(e) => put(i, e.target.value)}
                aria-label={`${label}: ${sym}`}
              />
            </label>
          );
        })}
      </div>
      <p className="pzf-note" aria-live="polite">
        {Object.keys(show).length === 0
          ? 'ჩაწერე უცნობი რიცხვი — შემდეგ წინადადება თავად შემოწმდება.'
          : Object.keys(show).length < blanks.length
            ? 'კიდევ ერთი უცნობი დარჩა.'
            : `შენი წინადადება: ${Object.entries(show).map(([s, n]) => `${s} = ${n}`).join(', ')} — შემოწმებისას გამოჩნდება, სრულდება თუ არა.`}
      </p>
    </div>
  );
}

/** A solved sentence shown with its check — what the student sees after answering. */
export function SentenceResult({ sentence, label }: { sentence: PuzzleSentence; label: string }) {
  return <SentenceBoard sentence={sentence} solved label={label} />;
}

/**
 * Choose the sentence that checks another. Each option is drawn as a whole sentence, so the student compares sentences
 * rather than reading labels.
 */
export function SentenceCheckAnswer({
  options,
  value,
  onChange,
  disabled,
  label,
}: {
  options: Array<{ id: string; sentence: PuzzleSentence }>;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <div className="pzc" role="group" aria-label={label}>
      <ul className="pzc-list">
        {options.map((option) => (
          <li key={option.id}>
            <button
              type="button"
              className={`pzc-opt ${value === option.id ? 'is-on' : ''}`}
              aria-pressed={value === option.id}
              disabled={disabled}
              onClick={() => onChange(option.id)}
              aria-label={sentenceText(option.sentence)}
            >
              <span className="pzc-tag">{option.id.toUpperCase()}</span>
              <span className="pzc-line">{sentenceText(option.sentence)}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="pzc-note">აირჩიე ის წინადადება, რომელიც ამას ამოწმებს.</p>
    </div>
  );
}

/**
 * A symbol puzzle: one symbol means one number in every sentence it appears in, and the student types it. The sentences
 * are drawn, and the legend shows which symbols are still unknown.
 */
export function SymbolSolveAnswer({
  sentences,
  symbol,
  value,
  onChange,
  disabled,
  label,
}: {
  sentences: PuzzleSentence[];
  symbol: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  label: string;
}) {
  const id = useId();
  const syms = sentences.flatMap((s) => symbolsOf(s)).filter((s, i, all) => all.indexOf(s) === i);
  return (
    <div className="pzs" role="group" aria-label={label}>
      <ul className="pzs-list">
        {sentences.map((sentence, i) => (
          <li key={i}>
            <SentenceBoard sentence={sentence} label={sentenceText(sentence)} />
          </li>
        ))}
      </ul>
      <SymbolLegend sentence={{ a: { sym: symbol }, op: '+', b: 0, c: 0 }} values={undefined} />
      <div className="pzs-row">
        <label className="pzs-slot" htmlFor={id}>
          <span className="pz-box">{symbol}</span>
          <span>=</span>
          <input
            id={id}
            inputMode="numeric"
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value.replace(/[^\d-]/g, ''))}
            aria-label={`${label}: ${symbol}`}
          />
        </label>
        <span className="pzs-hint">{`${syms.length} უცნობი`}</span>
      </div>
      <p className="pzs-note" aria-live="polite">
        ერთი სიმბოლო ყველგან ერთი და იმავე რიცხვია.
      </p>
    </div>
  );
}

/** A chain with a box under each asked step; the student types the values in order. */
export function ChainFillAnswer({
  start,
  steps,
  asks,
  value,
  onChange,
  disabled,
  label,
}: {
  start: number;
  steps: PuzzleStep[];
  asks: number[];
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  label: string;
}) {
  const id = useId();
  const typed = value === '' ? [] : value.split(',');
  const put = (i: number, text: string) => {
    const next = [...typed];
    while (next.length < asks.length) next.push('');
    next[i] = text.replace(/[^\d-]/g, '');
    onChange(next.join(','));
  };
  return (
    <div className="pzch" role="group" aria-label={label}>
      <ChainBoard start={start} steps={steps} hide={asks} />
      <div className="pzch-row">
        {asks.map((at, i) => (
          <label className="pzch-slot" key={at} htmlFor={`${id}-${i}`}>
            <span className="pzch-where">{at === 0 ? 'დასაწყისი' : `${at}-ე ნაბიჯის შემდეგ`}</span>
            <input
              id={`${id}-${i}`}
              inputMode="numeric"
              value={typed[i] ?? ''}
              disabled={disabled}
              onChange={(e) => put(i, e.target.value)}
              aria-label={`${label}: ${at === 0 ? 'დასაწყისი' : `${at}-ე ნაბიჯი`}`}
            />
          </label>
        ))}
      </div>
      <p className="pzch-note" aria-live="polite">
        {typed.filter((t) => t !== undefined && t !== '').length === 0
          ? 'ყოველი ნაბიჯი წინაზე აგებს — შეავსე ცარიელი უჯრები თანმიმდევრობით.'
          : 'შეამოწმე თითოეული ნაბიჯი და შემდეგ შეამოწმე პასუხი.'}
      </p>
    </div>
  );
}

/** A single number box, for the questions that ask for one value out of a puzzle. */
export function PuzzleNumberAnswer({
  value,
  onChange,
  disabled,
  label,
  unit,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  label: string;
  unit?: string;
}) {
  const id = useId();
  return (
    <div className="pzn">
      <label className="pzn-slot" htmlFor={id}>
        <input
          id={id}
          inputMode="numeric"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value.replace(/[^\d-]/g, ''))}
          aria-label={label}
        />
        {unit && <span className="pzn-unit">{unit}</span>}
      </label>
    </div>
  );
}

/** The values of a sentence, for a board that wants to show them beside the picture. */
export const valuesOf = (sentence: PuzzleSentence): Record<string, number> => solve(sentence).values;
