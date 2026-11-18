import { useState } from 'react';
import {
  blankSentenceText,
  blankSideWord,
  differenceOf,
  heavierSide,
  isBalanced,
  leftTotal,
  panTotal,
  puzzleAnswer,
  rightTotal,
  sentenceText,
  tiltOf,
  type PuzzleSpec,
  type ScaleSpec,
  type SentenceSpec,
  type TermSpec,
} from './BalanceGeometry';

/**
 * Pictures for Unit 9. A scale's beam is drawn from the two totals (`BalanceGeometry`), so a level beam really does
 * mean the two pans are equal — the picture can never say "balanced" about numbers that are not.
 */

const TONE = {
  level: { beam: '#15803d', word: 'თანაბარია', icon: '=' },
  left: { beam: '#b45309', word: 'მარცხენა მხარე მძიმეა', icon: '◀' },
  right: { beam: '#b45309', word: 'მარჯვენა მხარე მძიმეა', icon: '▶' },
} as const;

/** The weight of one pan, said in words so the numbers are never only a picture. */
export const panText = (pan: { weights: number[] }, unit = ''): string =>
  pan.weights.length === 0 ? 'ცარიელი' : `${pan.weights.join(' + ')}${unit ? ` ${unit}` : ''} = ${panTotal(pan)}${unit ? ` ${unit}` : ''}`;

/**
 * A balance scale. `onLeft`/`onRight` let the board be driven from outside (the student's own weights); with no
 * handlers it is a static picture for a question.
 */
export function BalanceScale({
  scale,
  size = 260,
  label,
  showTotals = true,
}: {
  scale: ScaleSpec;
  size?: number;
  label: string;
  showTotals?: boolean;
}) {
  const tilt = tiltOf(scale);
  const tone = TONE[tilt];
  const lt = leftTotal(scale);
  const rt = rightTotal(scale);
  // the beam turns by at most 7°, so a small difference still reads as a tilt and a level beam reads as level
  const max = Math.max(lt, rt, 1);
  const angle = tilt === 'level' ? 0 : Math.round(((Math.abs(lt - rt) / max) * 7 + (tilt === 'left' ? 0 : 0)) * (tilt === 'left' ? -1 : 1) * 10) / 10;
  return (
    <figure className={`bal is-${tilt}`} style={{ width: `${size}px` }}>
      <svg className="bal-svg" viewBox="-150 -90 300 190" role="img" aria-label={`${label}: ${tone.word}. მარცხენა თარო ${lt}, მარჯვენა თარო ${rt}.`}>
        <g transform={`rotate(${angle})`}>
          <line className="bal-beam" x1={-120} y1={0} x2={120} y2={0} />
          <line className="bal-hang" x1={-120} y1={0} x2={-120} y2={40} />
          <line className="bal-hang" x1={120} y1={0} x2={120} y2={40} />
          <g className="bal-pan">
            <path d="M-160 40 H-80 L-92 62 H-148 Z" />
            <text className="bal-pan-num" x={-120} y={55} textAnchor="middle">
              {showTotals ? lt : ''}
            </text>
          </g>
          <g className="bal-pan">
            <path d="M80 40 H160 L148 62 H92 Z" />
            <text className="bal-pan-num" x={120} y={55} textAnchor="middle">
              {showTotals ? rt : ''}
            </text>
          </g>
        </g>
        <line className="bal-stand" x1={0} y1={0} x2={0} y2={80} />
        <path className="bal-base" d="M-44 80 H44 L52 88 H-52 Z" />
        <circle className="bal-pivot" cx={0} cy={0} r={5} />
      </svg>
      <figcaption className="bal-facts">
        <span className="bal-side">მარცხენა: {panText(scale.left, scale.unit)}</span>
        <span className="bal-side">მარჯვენა: {panText(scale.right, scale.unit)}</span>
        <span className="bal-word" data-tilt={tilt}>
          <span aria-hidden="true">{tone.icon}</span> {tone.word}
          {differenceOf(scale) > 0 ? ` (სხვაობა ${differenceOf(scale)})` : ''}
        </span>
      </figcaption>
    </figure>
  );
}

/** Just the weights on a pan, as tiles; kept separate so the drawing stays readable. */
export function WeightTiles({ pan, unit }: { pan: { weights: number[] }; unit?: string }) {
  return (
    <div className="wt">
      {pan.weights.map((w, i) => (
        <span key={i} className="wt-tile">
          {w}
          {unit ? <small>{unit}</small> : null}
        </span>
      ))}
    </div>
  );
}

// ─────────────────────────── two groups of objects ───────────────────────────

/**
 * Two groups side by side. The counts are the student's own (`a`, `b`); tapping a group adds one and a "take" button
 * removes one, so the answer is always a number of objects and never a guess about which looks bigger. Colour and
 * arrangement differ on purpose: neither changes the count.
 */
export function GroupsBoard({
  a,
  b,
  glyph = '●',
  label,
  onChange,
  disabled = false,
  max = 12,
}: {
  a: number;
  b: number;
  glyph?: string;
  label: string;
  onChange?: (a: number, b: number) => void;
  disabled?: boolean;
  max?: number;
}) {
  const tone = a === b ? 'level' : a > b ? 'left' : 'right';
  const word = a === b ? `ორივეში ${a} — თანაბარია.` : `ჯგუფ ა-ში ${a}, ჯგუფ ბ-ში ${b} — ${Math.abs(a - b)}-ით ${a > b ? 'მეტია ა-ში' : 'მეტია ბ-ში'}.`;
  const group = (which: 'a' | 'b', count: number) => (
    <div className={`grp is-${tone === 'level' ? 'even' : which}`}>
      <h4 className="grp-name">ჯგუფი {which === 'a' ? 'ა' : 'ბ'}</h4>
      <div className={`grp-items ${which === 'b' ? 'is-scatter' : ''}`} aria-label={`ჯგუფი ${which === 'a' ? 'ა' : 'ბ'}: ${count}`}>
        {Array.from({ length: count }, (_, i) => (
          <span key={i} className={`grp-dot ${which === 'b' ? 'is-blue' : 'is-red'}`} aria-hidden="true">
            {glyph}
          </span>
        ))}
      </div>
      <output className="grp-count">
        <strong>{count}</strong> საგანი
      </output>
      {onChange && (
        <div className="grp-btns">
          <button type="button" className="btn btn-ghost btn-small" disabled={disabled || count >= max} aria-label={`ჯგუფ ${which === 'a' ? 'ა' : 'ბ'}: დაამატე ერთი`} onClick={() => onChange(which === 'a' ? Math.min(max, a + 1) : a, which === 'b' ? Math.min(max, b + 1) : b)}>
            + 1
          </button>
          <button type="button" className="btn btn-ghost btn-small" disabled={disabled || count === 0} aria-label={`ჯგუფ ${which === 'a' ? 'ა' : 'ბ'}: წაიღე ერთი`} onClick={() => onChange(which === 'a' ? Math.max(0, a - 1) : a, which === 'b' ? Math.max(0, b - 1) : b)}>
            − 1
          </button>
        </div>
      )}
    </div>
  );
  return (
    <div className={`grps is-${tone}`} role="group" aria-label={label}>
      {group('a', a)}
      <div className="grps-sign" aria-hidden="true">
        {a === b ? '=' : a > b ? '>' : '<'}
      </div>
      {group('b', b)}
      <p className="grps-word" role="status" aria-live="polite">
        <span aria-hidden="true">{a === b ? '=' : '≠'}</span> {word}
      </p>
    </div>
  );
}

// ─────────────────────────── two-pan drag board ───────────────────────────

/**
 * Put weights on the two pans until the scale balances. Tapping a weight adds it to the chosen pan; tapping a pan's
 * tile takes it back off. A level beam is the goal, and it is computed from the weights — the board never decides by
 * how the beam looks.
 */
export function TwoPanBoard({
  weights,
  left,
  right,
  onChange,
  disabled = false,
  label,
}: {
  weights: number[];
  left: number[];
  right: number[];
  onChange: (left: number[], right: number[]) => void;
  disabled?: boolean;
  label: string;
}) {
  const [side, setSide] = useState<'left' | 'right'>('left');
  const used = [...left, ...right];
  const free = weights.filter((w, i) => used.filter((u) => u === w).length < weights.filter((x) => x === w).length && !used.slice(0, i).includes(w));
  // weights as a multiset: a number can appear twice, so the tray keeps one entry per unused copy
  const remaining = (() => {
    const pool = [...weights];
    for (const w of used) {
      const at = pool.indexOf(w);
      if (at >= 0) pool.splice(at, 1);
    }
    return pool;
  })();
  void free;
  const scale: ScaleSpec = { left: { weights: left }, right: { weights: right } };
  const level = isBalanced(scale) && left.length > 0 && right.length > 0;
  const heavier = heavierSide(scale);
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
            <span className="twopan-pan-name">{s === 'left' ? 'მარცხენა' : 'მარჯვენა'}: {panTotal({ weights: s === 'left' ? left : right })}</span>
            <div className="twopan-tiles">
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
        {remaining.length === 0 ? <span className="twopan-empty">ყველა წონა დადებულია</span> : remaining.map((w, i) => (
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
        ))}
      </div>
      <button
        type="button"
        className="btn btn-ghost btn-small"
        disabled={disabled || (left.length === 0 && right.length === 0)}
        onClick={() => onChange([], [])}
      >
        ↻ გასუფთავება
      </button>
      <output className="twopan-status" role="status" aria-live="polite">
        {left.length + right.length === 0
          ? 'დააწყვე წონები ორ თაროზე.'
          : level
            ? `✓ თანაბარია: ${panTotal({ weights: left })} = ${panTotal({ weights: right })}.`
            : heavier
              ? `ჯერ არ არის: ${heavier === 'left' ? 'მარცხენა' : 'მარჯვენა'} მხარე ${differenceOf(scale)}-ით მძიმეა.`
              : 'ჯერ არ არის.'}
      </output>
    </div>
  );
}

// ─────────────────────────── number sentences ───────────────────────────

/** A number sentence drawn as an equation, with its two sides presented as two sides (not as a sum to finish). */
export function SentenceLine({ sentence, blank }: { sentence: SentenceSpec; blank?: 'first' | 'second' | 'total' }) {
  const text = blank ? blankSentenceText(sentence, blank) : sentenceText(sentence);
  return (
    <p className="sent" aria-label={text}>
      {text.split(' ').map((part, i) => (
        <span key={i} className={`sent-tok ${part === '=' ? 'is-eq' : part === '+' || part === '−' ? 'is-op' : /^\d+$/.test(part) ? 'is-num' : ''}`}>
          {part}{' '}
        </span>
      ))}
    </p>
  );
}

/**
 * Build a sentence from number cards and an operation sign. The student picks a card or a sign, then a place; every
 * place must be filled before it can be checked, so an unfinished sentence is never marked wrong.
 */
export function SentenceBoard({
  places,
  values,
  onChange,
  cards,
  signs,
  disabled = false,
  label,
}: {
  places: number;
  values: string[];
  onChange: (values: string[]) => void;
  cards: number[];
  signs: string[];
  disabled?: boolean;
  label: string;
}) {
  const [pick, setPick] = useState<string | null>(null);
  const slot = (i: number) => (
    <button
      key={i}
      type="button"
      className={`sb-slot ${values[i] ? 'is-filled' : ''}`}
      disabled={disabled}
      aria-label={`ადგილი ${i + 1}${values[i] ? `: ${values[i]}` : ': ცარიელი'}`}
      onClick={() => {
        if (disabled) return;
        if (pick === null) {
          if (values[i]) onChange(values.map((v, k) => (k === i ? '' : v)));
          return;
        }
        onChange(values.map((v, k) => (k === i ? pick : v)));
        setPick(null);
      }}
    >
      {values[i] || '□'}
    </button>
  );
  return (
    <div className="sboard" role="group" aria-label={label}>
      <div className="sboard-slots">{Array.from({ length: places }, (_, i) => slot(i))}</div>
      <div className="sboard-cards">
        {cards.map((n) => (
          <button key={`c${n}`} type="button" className={`wt-tile is-button ${pick === String(n) ? 'is-on' : ''}`} disabled={disabled} aria-label={`რიცხვი ${n}`} onClick={() => setPick(String(n))}>
            {n}
          </button>
        ))}
        {signs.map((s) => (
          <button key={s} type="button" className={`wt-tile is-button is-sign ${pick === s ? 'is-on' : ''}`} disabled={disabled} aria-label={`ნიშანი ${s}`} onClick={() => setPick(s)}>
            {s}
          </button>
        ))}
      </div>
      <p className="sboard-hint" role="status" aria-live="polite">
        {pick === null ? 'აირჩიე რიცხვი ან ნიშანი, მერე ადგილი.' : `არჩეულია «${pick}». შეეხე ადგილს.`}
      </p>
    </div>
  );
}

// ─────────────────────────── puzzles ───────────────────────────

/** The unknown weight, drawn as a labelled tile: a picture, not an algebra letter. */
export const unknownTile = (name: string): string => `${name} = ?`;

/**
 * A balance puzzle: the clues are scales, and one of them leaves the unknown weights alone on their pan. The student
 * enters the value of one unknown; the board shows each clue as a real scale so the reasoning is visible.
 */
export function PuzzleBoard({
  puzzle,
  value,
  onChange,
  disabled = false,
  label,
}: {
  puzzle: PuzzleSpec;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <div className="puz" role="group" aria-label={label}>
      <p className="puz-task">
        ერთი <strong>{puzzle.unknown}</strong> წონა უცნობია. იპოვე მისი მნიშვნელობა თანაბარი სასწორებიდან.
      </p>
      <div className="puz-clues">
        {puzzle.clues.map((clue, i) => {
          const weights = Array.from({ length: clue.unknownCount }, () => 1);
          void weights;
          const scale: ScaleSpec = clue.onLeft
            ? { left: { weights: Array.from({ length: clue.unknownCount }, (_, k) => k + 1) }, right: { weights: [clue.known] } }
            : { left: { weights: [clue.known] }, right: { weights: Array.from({ length: clue.unknownCount }, (_, k) => k + 1) } };
          const answer = puzzleAnswer(clue);
          return (
            <div key={i} className="puz-clue">
              <p className="puz-clue-text">
                <span aria-hidden="true">⚖ </span>
                {clue.unknownCount} ცალი <strong>{puzzle.unknown}</strong> = {clue.known}
              </p>
              <div className="puz-pans">
                <span className="puz-pan">
                  {clue.onLeft ? `${clue.unknownCount} × ${puzzle.unknown}` : clue.known}
                </span>
                <span aria-hidden="true" className="puz-eq">=</span>
                <span className="puz-pan">{clue.onLeft ? clue.known : `${clue.unknownCount} × ${puzzle.unknown}`}</span>
              </div>
              <BalanceScale scale={scale} size={190} label={`მინიშნება ${i + 1}`} showTotals={false} />
              {answer !== null && <p className="puz-clue-note">ამ სასწორიდან: ერთი {puzzle.unknown} = {clue.known} ÷ {clue.unknownCount}.</p>}
            </div>
          );
        })}
      </div>
      <label className="puz-input">
        <span>{puzzle.unknown} =</span>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          className="lp-input"
          aria-label={`${puzzle.unknown}-ის მნიშვნელობა`}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    </div>
  );
}

// ─────────────────────────── words ───────────────────────────

/** "3 + 2 = 5" as a label, for a choice option. */
export const termText = (term: TermSpec): string => (term.op === undefined || term.b === undefined ? String(term.a) : `${term.a} ${term.op} ${term.b}`);

/** The blank's place, said in words. */
export const blankWord = blankSideWord;

/** "სხვაობა 2" / "თანაბარია" — for a tool's status line. */
export const scaleWord = (scale: ScaleSpec): string => (isBalanced(scale) ? 'თანაბარია' : `სხვაობა ${differenceOf(scale)}`);

/** A sentence's own words, true or false: "3 + 2 = 5 — მართალია". */
export const sentenceVerdict = (sentence: SentenceSpec): string => {
  const holds = leftTotal({ left: { weights: [sentenceLeftOf(sentence)] }, right: { weights: [0] } }) === 0;
  void holds;
  return sentenceText(sentence);
};

function sentenceLeftOf(s: SentenceSpec): number {
  return s.left.op === undefined || s.left.b === undefined ? s.left.a : s.left.op === '+' ? s.left.a + s.left.b : s.left.a - s.left.b;
}

/** The two sides of a sentence, for a tool that shows them as weights. */
export const sidesOf = (s: SentenceSpec): { left: number; right: number } => ({ left: s.left.op === undefined || s.left.b === undefined ? s.left.a : s.left.op === '+' ? s.left.a + s.left.b : s.left.a - s.left.b, right: s.right });

/** Re-exported so answer controls can build a scale without importing the geometry twice. */
export { leftTotal, rightTotal };
