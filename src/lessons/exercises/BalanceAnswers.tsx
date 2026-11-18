import { useState } from 'react';
import type { ChartSpecData, PuzzleClue, PuzzleClue2, ResponseSpec, SortObjSpec } from '../types';
import { isBalanced, missingFor, panTotal, puzzleAnswer, sentenceHolds, type ScaleSpec, type SentenceSpec } from './BalanceGeometry';
import {
  BalanceScale,
  GroupsBoard,
  SentenceBoard,
  SentenceLine,
  PuzzleBoard,
  panText,
  WeightTiles,
} from './BalanceBoard';

import { SortIntoGroups, ClueBoard, valueLabel } from './SortBoard';
import { sortObjects } from './SortAnswers';

/**
 * Answer controls for Unit 9 (equality and balance). Presentation only — `check.ts` decides what is right, from the
 * totals, the counts and the sentences' values.
 */

type BalancePansResponse = Extract<ResponseSpec, { type: 'balance-pans' }>;
type EqualGroupsResponse = Extract<ResponseSpec, { type: 'equal-groups' }>;
type SentenceBuildResponse = Extract<ResponseSpec, { type: 'sentence-build' }>;
type SentencePickResponse = Extract<ResponseSpec, { type: 'sentence-pick' }>;
type BalancePuzzleResponse = Extract<ResponseSpec, { type: 'balance-puzzle' }>;
type CluePickResponse = Extract<ResponseSpec, { type: 'clue-pick' }>;

const splitNums = (value: string): number[] => (value ? value.split(',').filter((v) => v !== '').map(Number) : []);

/** `"3,2:4,1"` → the two pans. An empty pan is a real state, not an unfinished one. */
export function parsePans(value: string): { left: number[]; right: number[] } {
  const [l = '', r = ''] = value.split(':');
  return { left: splitNums(l), right: splitNums(r) };
}

export const pansValue = (left: number[], right: number[]): string => `${left.join(',')}:${right.join(',')}`;

/** Put weights on the pans until the beams level. */
export function BalancePansAnswer({ response, value, onChange, disabled, label }: { response: BalancePansResponse; value: string; onChange: (v: string) => void; disabled: boolean; label: string }) {
  const pans = parsePans(value);
  return (
    <div className="bp">
      <p className="bp-task">
        დააწყვე წონები ისე, რომ სასწორი თანაბარი იყოს
        {response.unit ? <> ({response.unit})</> : null}.
      </p>
      <TwoPanAnswer
        weights={response.weights}
        fixed={{ left: response.left ?? [], right: response.right ?? [] }}
        left={pans.left}
        right={pans.right}
        onChange={(l, r) => onChange(pansValue(l, r))}
        disabled={disabled}
        label={label}
      />
    </div>
  );
}

/** The two-pan board, kept here so the answer control has one source of state (the value string). */
function TwoPanAnswer({
  weights,
  fixed,
  left,
  right,
  onChange,
  disabled,
  label,
}: {
  weights: number[];
  fixed: { left: number[]; right: number[] };
  left: number[];
  right: number[];
  onChange: (left: number[], right: number[]) => void;
  disabled: boolean;
  label: string;
}) {
  const [side, setSide] = useState<'left' | 'right'>('left');
  const pool = [...weights];
  for (const w of [...left, ...right]) {
    const at = pool.indexOf(w);
    if (at >= 0) pool.splice(at, 1);
  }
  // a weight the question already put on a pan stays there; it is shown but never removable
  const onLeft = [...fixed.left, ...left];
  const onRight = [...fixed.right, ...right];
  const scale: ScaleSpec = { left: { weights: onLeft }, right: { weights: onRight } };
  const level = isBalanced(scale);
  return (
    <div className="twopan" role="group" aria-label={label}>
      <div className="twopan-pick" role="radiogroup" aria-label="რომელ თაროზე დავდო">
        {(['left', 'right'] as const).map((s) => (
          <label key={s} className={`twopan-side ${side === s ? 'is-on' : ''}`}>
            <input type="radio" name={`${label}-side`} value={s} checked={side === s} disabled={disabled} onChange={() => setSide(s)} />
            {s === 'left' ? 'მარცხენა თაროზე' : 'მარჯვენა თაროზე'}
          </label>
        ))}
      </div>
      <BalanceScale scale={scale} label={label} size={280} />
      <div className="twopan-pans">
        {(['left', 'right'] as const).map((s) => (
          <div key={s} className="twopan-pan">
            <span className="twopan-pan-name">
              {s === 'left' ? 'მარცხენა' : 'მარჯვენა'}: {panTotal({ weights: s === 'left' ? onLeft : onRight })}
            </span>
            <div className="twopan-tiles">
              {(s === 'left' ? fixed.left : fixed.right).map((w, i) => (
                <span key={`fx-${w}-${i}`} className="wt-tile is-fixed" aria-label={`${w}: უკვე დევს ${s === 'left' ? 'მარცხენა' : 'მარჯვენა'} თაროზე`}>
                  {w}
                </span>
              ))}
              {(s === 'left' ? left : right).map((w, i) => (
                <button
                  key={`${w}-${i}`}
                  type="button"
                  className="wt-tile is-button"
                  disabled={disabled}
                  aria-label={`${s === 'left' ? 'მარცხენა' : 'მარჯვენა'} თაროზე ${w}: წაიღე`}
                  onClick={() => onChange(s === 'left' ? left.filter((_, k) => k !== i) : left, s === 'right' ? right.filter((_, k) => k !== i) : right)}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="twopan-tray" aria-label="თავისუფალი წონები">
        {pool.length === 0 ? (
          <span className="twopan-empty">ყველა წონა დადებულია</span>
        ) : (
          pool.map((w, i) => (
            <button
              key={`${w}-${i}`}
              type="button"
              className="wt-tile is-button"
              disabled={disabled}
              aria-label={`დადე ${w} ${side === 'left' ? 'მარცხენა' : 'მარჯვენა'} თაროზე`}
              onClick={() => onChange(side === 'left' ? [...left, w] : left, side === 'right' ? [...right, w] : right)}
            >
              {w}
            </button>
          ))
        )}
      </div>
      <button type="button" className="btn btn-ghost btn-small" disabled={disabled || (left.length === 0 && right.length === 0)} onClick={() => onChange([], [])}>
        ↻ გასუფთავება
      </button>
      <output className="twopan-status" role="status" aria-live="polite">
        {level
          ? `✓ თანაბარია: ${panTotal({ weights: onLeft })} = ${panTotal({ weights: onRight })}.`
          : `ჯერ არ არის: მარცხენა ${panTotal({ weights: onLeft })}, მარჯვენა ${panTotal({ weights: onRight })}.`}
      </output>
    </div>
  );
}

/** Add or take objects until the two groups hold the same number. */
export function EqualGroupsAnswer({ response, value, onChange, disabled, label }: { response: EqualGroupsResponse; value: string; onChange: (v: string) => void; disabled: boolean; label: string }) {
  const [a = '', b = ''] = (typeof value === 'string' ? value : '').split(',');
  const left = a === '' ? response.a : Number(a);
  const right = b === '' ? response.b : Number(b);
  return (
    <div className="eg">
      <p className="eg-task">გახადე ორი ჯგუფი თანაბარი: დაამატე ან წაიღე საგნები.</p>
      <GroupsBoard
        a={left}
        b={right}
        label={label}
        max={response.max ?? 12}
        onChange={(na, nb) => onChange(`${na},${nb}`)}
        disabled={disabled}
      />
    </div>
  );
}

/** Complete a sentence from number and sign cards. */
export function SentenceBuildAnswer({ response, value, onChange, disabled, label }: { response: SentenceBuildResponse; value: string; onChange: (v: string) => void; disabled: boolean; label: string }) {
  const places = response.template.split('{}').length - 1;
  const values = response.answers.map((_, i) => (value ? value.split(',')[i] ?? '' : ''));
  return (
    <div className="sba">
      <p className="sba-task">შეავსე რიცხვითი წინადადება ბარათებით.</p>
      <p className="sba-template" aria-label="შესავსები წინადადება">
        {response.template.split(/(\{\})/).map((part, i) => {
          if (part === '{}') {
            const index = response.template.slice(0, 0).length; // placeholder, replaced below
            void index;
            return null;
          }
          return part ? <span key={i}>{part} </span> : null;
        })}
      </p>
      <SentenceBoard
        places={places}
        values={values}
        onChange={(next) => onChange(next.join(','))}
        cards={response.cards}
        signs={response.signs}
        disabled={disabled}
        label={label}
      />
      <p className="sba-preview" role="status" aria-live="polite">
        {values.every((v) => v) ? `შენი წინადადება: ${values.join(' ')}` : 'ჯერ ყველა ადგილი ცარიელია.'}
      </p>
    </div>
  );
}

/** Choose every sentence that is true. */
export function SentencePickAnswer({ response, value, onChange, disabled, label }: { response: SentencePickResponse; value: string; onChange: (v: string) => void; disabled: boolean; label: string }) {
  const picked = typeof value === 'string' && value ? value.split(',').filter(Boolean) : [];
  const toggle = (id: string) => {
    if (disabled) return;
    onChange((picked.includes(id) ? picked.filter((p) => p !== id) : [...picked, id]).join(','));
  };
  return (
    <div className="sp" role="group" aria-label={label}>
      <p className="sp-task">აირჩიე ყველა წინადადება, რომელიც მართალია.</p>
      <div className="sp-list">
        {response.sentences.map((s) => {
          const on = picked.includes(s.id);
          return (
            <button
              key={s.id}
              type="button"
              className={`sp-item ${on ? 'is-picked' : ''}`}
              aria-pressed={on}
              disabled={disabled}
              aria-label={`${s.left.a}${s.left.op ? ` ${s.left.op} ${s.left.b}` : ''} = ${s.right}${on ? ', არჩეულია' : ''}`}
              onClick={() => toggle(s.id)}
            >
              {on && <span aria-hidden="true">✓ </span>}
              <SentenceLine sentence={{ left: s.left, right: s.right }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Type the value of the unknown weight in a balance puzzle. */
export function BalancePuzzleAnswer({ response, value, onChange, disabled, label }: { response: BalancePuzzleResponse; value: string; onChange: (v: string) => void; disabled: boolean; label: string }) {
  return (
    <PuzzleBoard
      puzzle={{ unknown: response.unknown, answer: response.answer, clues: response.clues.map((c) => ({ unknownCount: c.unknownCount, known: c.known, onLeft: c.onLeft !== false })) }}
      value={value}
      onChange={onChange}
      disabled={disabled}
      label={label}
    />
  );
}

/** Pick every object that satisfies all the clues. */
export function CluePickAnswer({ response, value, onChange, disabled, label }: { response: CluePickResponse; value: string; onChange: (v: string) => void; disabled: boolean; label: string }) {
  const picked = typeof value === 'string' && value ? value.split(',').filter(Boolean) : [];
  return <ClueBoard objects={sortObjects(response.objects)} clues={response.clues as PuzzleClue2[]} picked={picked} onChange={(next) => onChange(next.join(','))} disabled={disabled} label={label} />;
}

// ─────────────────────────── shared words ───────────────────────────

/** `3 + 2 = 5`, for a prompt or feedback. */
export const sentenceWords = (s: SentenceSpec): boolean => sentenceHolds(s);

/** The value of a pan, said in words. */
export const panWords = (weights: number[], unit?: string): string => panText({ weights }, unit);

/** A puzzle clue, said in words. */
export const clueWords = (clue: PuzzleClue, unknown: string): string =>
  `${clue.unknownCount} × ${unknown} = ${clue.known}`;

/** The value a clue gives for one unknown, or `null` if it does not divide. */
export const clueAnswer = (clue: PuzzleClue): number | null => puzzleAnswer(clue);

/** What a missing number would have to be, for feedback on a completed sentence. */
export const missingWord = (sentence: SentenceSpec, blank: 'first' | 'second' | 'total'): number =>
  missingFor(sentence, blank);

/** Re-exported so a lesson can show a blank sentence without importing the board twice. */
export { WeightTiles, valueLabel, SortIntoGroups, type ChartSpecData, type SortObjSpec };
