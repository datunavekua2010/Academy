import { useState } from 'react';
import { NumberLine } from './NumberLine';
import { SequenceRow } from './Visuals';
import type { Verdict } from '../types';
import { PLACE_NAME } from './PlaceValueGeometry';
import { blockText, followsRule, ruleText, sequenceOf, stepOf, stepSign, termAt, withHoles } from './PatternGeometry';

/**
 * Pictures for G2 U02 (skip-counting and number patterns).
 *
 * A landing on the line is always `start + index · step`, computed by `PatternGeometry`; a hole in a sequence is always
 * the number that belongs there. So the marker, the arcs, the numbers and the checker cannot drift apart, and the
 * picture never has to be read to know what is right.
 */

// ─────────────────────────── a skip-count on the line ───────────────────────────

export interface SkipLineSpec {
  start: number;
  step: number;
  /** How many landings to draw (the start counts as one). */
  count: number;
  /** Draw the landings but leave their numbers off, so the student counts the jumps. */
  hideLandings?: boolean;
  /** Character that rides the line. Purely a picture: it says nothing about the answer. */
  walker?: 'rabbit' | 'frog' | 'kangaroo' | null;
}

const WALKER_GLYPH = { rabbit: '🐇', frog: '🐸', kangaroo: '🦘' } as const;

/** The landings of a skip-count, highest place of the line worked out from the numbers themselves. */
export function skipLineSpec(start: number, step: number, count: number, extra: Partial<SkipLineSpec> = {}): SkipLineSpec {
  return { start, step, count, ...extra };
}

export function SkipLine({ spec, ariaLabel }: { spec: SkipLineSpec; ariaLabel?: string }) {
  const landings = sequenceOf(spec.start, spec.step, spec.count);
  const min = Math.min(...landings);
  const max = Math.max(...landings);
  const last = landings[landings.length - 1];
  const dirWord = spec.step > 0 ? 'წინ' : 'უკან';
  return (
    <div className="skl">
      <NumberLine
        min={min}
        max={max}
        start={spec.start}
        hops={landings}
        value={last}
        labelled={spec.hideLandings ? [] : landings}
        unlabelled={spec.hideLandings ? landings : []}
        ariaLabel={ariaLabel ?? `რიცხვითი ღერძი: ${spec.start}-დან ${dirWord} თვლა ${Math.abs(spec.step)}-ობით, ${spec.count} გაჩერება`}
      />
      {spec.walker && (
        <p className="skl-walker" aria-hidden="true">
          <span className="skl-walker-char">{WALKER_GLYPH[spec.walker]}</span>
          <span className="skl-walker-text">
            {landings.map((n, i) => (
              <span key={n} className={`skl-stop ${i === landings.length - 1 ? 'is-here' : ''}`}>
                {spec.hideLandings && i === landings.length - 1 ? '?' : n}
              </span>
            ))}
          </span>
        </p>
      )}
      <p className="skl-rule">
        {ruleText(spec.step)}: {landings.join(' → ')}
        {spec.hideLandings ? ' → ?' : ''}
      </p>
    </div>
  );
}

// ─────────────────────────── the answer board: hop the line ───────────────────────────

export interface PatternSequenceSpec {
  start: number;
  step: number;
  count: number;
}

interface BoardProps {
  /** The sequence, and how far the student may hop. */
  response: { start: number; step: number; count: number; walker?: 'rabbit' | 'frog' | 'kangaroo' | null };
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  verdict?: Verdict;
  label: string;
}

/**
 * The student taps one landing at a time; every hop must be exactly one step from the last, so the landing number is
 * always `start + hops · step` and the store is just the number of hops taken.
 */
export function SkipBoard({ response, value, onChange, disabled, verdict, label }: BoardProps) {
  const landings = sequenceOf(response.start, response.step, response.count);
  const min = Math.min(...landings);
  const max = Math.max(...landings);
  const taken = Math.max(0, Math.min(response.count - 1, Number(value || 0) || 0));
  const here = termAt(response.start, response.step, taken);
  const done = taken >= response.count - 1;
  const walker = response.walker ?? 'rabbit';
  const hop = (n: number) => {
    if (disabled) return;
    // only the next landing is a hop; a tap anywhere else re-stands the character there
    const index = landings.indexOf(n);
    if (index < 0) return;
    onChange(String(index));
  };
  return (
    <div className="skb">
      <NumberLine
        min={min}
        max={max}
        value={here}
        start={response.start}
        hops={landings.slice(0, taken + 1)}
        labelled={landings}
        onChange={hop}
        disabled={disabled}
        ariaLabel={`${label}. ${response.start}-დან თვლა ${Math.abs(response.step)}-ობით`}
      />
      <p className="skb-walk" aria-hidden="true">
        {landings.map((n, i) => (
          <span key={n} className={`skb-stop ${i < taken ? 'is-past' : ''} ${i === taken ? 'is-here' : ''}`}>
            {i === taken ? WALKER_GLYPH[walker] : '·'}
            <small>{n}</small>
          </span>
        ))}
      </p>
      <div className="skb-bar">
        <button type="button" className="btn btn-primary" disabled={disabled || done} onClick={() => onChange(String(taken + 1))}>
          {response.step > 0 ? `ნახტომი +${response.step} ▶` : `◀ ნახტომი −${Math.abs(response.step)}`}
        </button>
        <button type="button" className="btn btn-ghost" disabled={disabled || taken === 0} onClick={() => onChange(String(taken - 1))} aria-label="ბოლო ნახტომის გაუქმება">
          ↶ გაუქმება
        </button>
        <button type="button" className="btn btn-ghost" disabled={disabled || taken === 0} onClick={() => onChange('0')}>
          ↻ თავიდან
        </button>
      </div>
      <output className="objs-count" aria-live="polite">
        {taken === 0 ? `დასაწყისი: ${response.start} · ჯერ არ გიხტია` : `ნახტომები: ${taken} · ახლა: ${here}`}
        {verdict === 'correct' ? ' ✓' : ''}
      </output>
    </div>
  );
}

// ─────────────────────────── the answer board: fill the holes ───────────────────────────

interface FillProps {
  response: { start: number; step: number; count: number; holes: number[]; arrows?: string };
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  verdict?: Verdict;
  label: string;
}

/** The whole sequence with the given positions blank; the student types a number into each blank. */
export function SequenceFillBoard({ response, value, onChange, disabled, verdict, label }: FillProps) {
  const numbers = sequenceOf(response.start, response.step, response.count);
  const holes = [...response.holes].sort((a, b) => a - b);
  const typed = value ? value.split(',') : [];
  const read = (i: number) => typed[i] ?? '';
  const write = (i: number, text: string) => {
    const next = holes.map((_, k) => (k === i ? text.replace(/[^\d-]/g, '') : read(k)));
    onChange(next.join(','));
  };
  const rendered: Array<number | null> = withHoles(numbers, holes);
  const holeIndex = (pos: number) => holes.indexOf(pos);
  return (
    <div className={`sfb ${verdict === 'correct' ? 'is-correct' : ''}`}>
      <SequenceRow items={rendered} arrows={response.arrows ?? stepSign(response.step)} />
      <div className="sfb-inputs">
        {holes.map((pos, i) => (
          <label key={pos} className={`sfb-slot ${verdict === 'incorrect' ? 'is-wrong' : ''}`}>
            <span className="sfb-slot-name">{pos + 1}-ე ადგილი</span>
            <input
              type="text"
              inputMode="numeric"
              value={read(i)}
              disabled={disabled}
              onChange={(e) => write(i, e.target.value)}
              aria-label={`${pos + 1}-ე ადგილის რიცხვი`}
              placeholder="?"
            />
          </label>
        ))}
      </div>
      <p className="xt-note">
        {ruleText(response.step)}. {holeIndex(0) >= 0 ? `გამოტოვებული რიცხვები: ${holes.length}.` : ''}
      </p>
      <span className="sr-only">{label}</span>
    </div>
  );
}

// ─────────────────────────── the answer board: pick the rule ───────────────────────────

interface RuleProps {
  response: { start: number; step: number; count: number; options: number[] };
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  verdict?: Verdict;
  label: string;
}

/** A sequence is shown; the student picks which rule it follows, then (optionally) fills the blanks. */
export function SequenceRuleBoard({ response, value, onChange, disabled, verdict, label }: RuleProps) {
  const numbers = sequenceOf(response.start, response.step, response.count);
  const chosen = value === '' ? null : Number(value);
  return (
    <div className="srb">
      <SequenceRow items={numbers} arrows="?" />
      <div className="lp-choices srb-choices" role="radiogroup" aria-label={label}>
        {response.options.map((step) => (
          <label key={step} className={`lp-choice ${chosen === step ? 'is-selected' : ''}`}>
            <input type="radio" name="srb-rule" value={step} checked={chosen === step} disabled={disabled} onChange={() => onChange(String(step))} />
            <span className="lp-choice-dot" aria-hidden="true" />
            <span className="lp-choice-text">{`${stepSign(step)} (${ruleText(step)})`}</span>
          </label>
        ))}
      </div>
      {verdict === 'incorrect' && <p className="srb-hint">ეს რიცხვები ასე არ იცვლება: შეადარე ორ მეზობელ რიცხვს.</p>}
    </div>
  );
}

// ─────────────────────────── pictures for the questions ───────────────────────────

/** A sequence with blank places, drawn small, for a question's picture (never the answer control). */
export function SequencePicture({
  start,
  step,
  count,
  holes,
  arrows,
  items,
  caption,
}: {
  start?: number;
  step?: number;
  count?: number;
  holes?: number[];
  arrows?: string;
  /** Literal items, when the picture is not a computed skip-count. */
  items?: Array<number | null>;
  caption?: string;
}) {
  const numbers = items ?? (start !== undefined && step !== undefined && count !== undefined ? withHoles(sequenceOf(start, step, count), holes ?? []) : []);
  return (
    <>
      <SequenceRow items={numbers} arrows={arrows ?? (step !== undefined ? stepSign(step) : undefined)} />
      {caption && <p className="seq-caption">{caption}</p>}
    </>
  );
}

/** Groups of objects counted by a step: `groups` groups of `size`, with the running total beside each. */
export function GroupCount({ size, groups, noun }: { size: number; groups: number; noun?: string }) {
  const totals = Array.from({ length: groups }, (_, i) => (i + 1) * size);
  return (
    <div className="gcnt" aria-label={noun ? `${groups} ჯგუფი, თითოეულში ${size} ${noun}` : `${groups} ჯგუფი, თითოეულში ${size}`}>
      {totals.map((total) => (
        <span key={total} className="gcnt-group">
          <span className="gcnt-dots" aria-hidden="true">
            {Array.from({ length: Math.min(size, 12) }, (_, i) => (
              <i key={i} />
            ))}
          </span>
          <b>{total}</b>
        </span>
      ))}
    </div>
  );
}

/** What a pattern's rule is worth saying out loud: „+2“ … and whether it is really followed. */
export function ruleNote(numbers: Array<number | null>): string {
  const step = stepOf(numbers);
  if (step === null) return 'ამ რიცხვებს ერთი და იგივე ნაბიჯი არ აქვთ.';
  const seen = numbers.filter((n): n is number => n !== null);
  return followsRule(seen, step) ? ruleText(step) : 'ნაბიჯები ერთი და იგივე არ არის.';
}

/** „+2, +3“ for a pattern built from a repeating block. */
export const blockNote = blockText;

/** The place name of a digit pattern, for the counting-by-tens questions. */
export const placeWord = PLACE_NAME;

/** A small readout for the explore labs: the numbers visited and the rule, always computed. */
export function PatternReadout({ numbers, step }: { numbers: number[]; step: number }) {
  const [peek, setPeek] = useState(false);
  return (
    <p className="lab-facts">
      <span>{ruleText(step)}</span>
      <span>{peek ? numbers.join(', ') : `${numbers.slice(0, 4).join(', ')} …`}</span>
      <button type="button" className="btn btn-ghost btn-small" onClick={() => setPeek((p) => !p)} aria-pressed={peek}>
        {peek ? 'დამალვა' : 'ყველას ნახვა'}
      </button>
    </p>
  );
}
